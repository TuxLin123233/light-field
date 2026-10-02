// 像素小镇 · 地图与个人小屋
//
//   GET  ?list=1                      小镇地图（不用登录）
//   GET  ?uid=xxx / 不带参数=看自己     某间屋子
//   POST {action:'buy',  id}          买一件家具（花光尘，买过就不再收费）
//   POST {action:'save', items}       保存屋里的布置
import { readActiveUser, pickToken, BANNED_ERROR } from './_auth.js'
import { readBook, writeBook, giveHome, DUST_COST, publicView } from './_dust.js'
import {
  FURNITURE_BASE,
  THEMES,
  THEME_PAL,
  SURFACES,
  CAT_NAMES,
  SIZES,
  ROOM,
  floorLine,
  nextSize,
  PAL,
  itemById,
  surfaceById,
  furnitureById,
  readHouse,
  writeHouse,
  sanitizeItems,
  registerHouse,
  refreshEntry,
  readList,
  MAX_ITEMS,
  readMsgs,
  addMsg,
  delMsg,
  MAX_MSG,
  MSG_LEN,
} from './_town.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/* uid 的合法形状。留言和送光尘都要先过这一关，免得把乱七八糟的 key 拼进 KV */
const RE = /^[A-Za-z0-9_-]{1,40}$/

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/** 物品库：连像素画、分类和调色板一起发下去，前端不用自己维护一份。
    贴面（墙纸/地板）没有字符画，只有「图案 + 配色」，前端照着现画。 */
const catalog = () => ({
  /* 只发**基础家具**，配色变体（500 多件）由前端按下面的主题规则现算。
     全发的话光目录就 208KB —— 手机打开小镇要白等好几秒。
     规则简单且确定（基础 id + '__' + 主题 key），两边算出来必须一模一样。
     只能合成的那批不进商店，它们的定义在 _townitems.js，合成台自己下发。 */
  furniture: FURNITURE_BASE.filter((f) => !f.craftOnly).map((f) => ({
    id: f.id,
    name: f.name,
    price: f.price,
    cat: f.cat,
    art: f.art,
    wallOk: !!f.wallOk, // 能不能挂墙上；不行的必须站在地上
  })),
  themes: THEMES.map((t) => ({ key: t.key, name: t.name, mult: t.mult, pal: THEME_PAL[t.key] })),
  surfaces: SURFACES.map((s) => ({ id: s.id, name: s.name, price: s.price, kind: s.kind, pat: s.pat, colors: s.colors })),
  cats: CAT_NAMES,
  sizes: SIZES,
})

/** 房间尺寸和地板线一起下发：前端画房间、判「有没有站在地上」都要用 */
const roomInfo = (house) => ({ room: house.size, floor: floorLine(house.size) })

/** 留言板 + 「我给这间屋子送过光尘没有」。看自己家时 liked 恒为 false */
async function msgInfo(kv, houseUid, meUid) {
  const msgs = await readMsgs(kv, houseUid)
  let liked = false
  if (meUid && meUid !== houseUid) {
    const book = await readBook(kv, meUid)
    liked = (book.homes || []).indexOf(houseUid) >= 0
  }
  return { msgs, maxMsg: MAX_MSG, msgLen: MSG_LEN, liked, cost: DUST_COST }
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const kv = env.LIGHTFIELD_KV
  const url = new URL(request.url)

  // 地图：只回索引，一间屋一读都不做
  if (url.searchParams.get('list')) {
    const list = await readList(kv)
    return json({
      ok: true,
      room: ROOM,
      pal: PAL,
      catalog: catalog(),
      list: list
        .filter((h) => h && h.uid)
        .map((h) => ({ uid: h.uid, name: String(h.name || '镇民'), slot: Number(h.slot) || 0, top: h.top || '', n: Number(h.n) || 0 })),
    })
  }

  // 看屋子：不带 uid 就是看自己的（顺便登记到地图上）
  const wantUid = (url.searchParams.get('uid') || '').trim()
  const who = await readActiveUser(env, '', request.headers.get('authorization'))

  if (!wantUid) {
    if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
    if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)
    if (who.banned) return json(BANNED_ERROR, 403)
    const house = await readHouse(kv, who.uid)
    const entry = await registerHouse(kv, who.uid, who.username)
    if (!entry) return json({ error: '小镇住满了，暂时盖不下新屋子' }, 400)
    await refreshEntry(kv, who.uid, who.username, house)
    return json({
      ok: true, uid: who.uid, name: who.username, mine: true,
      ...roomInfo(house), pal: PAL, catalog: catalog(), house,
      ...(await msgInfo(kv, who.uid, who.uid)),
    })
  }

  const house = await readHouse(kv, wantUid)
  const list = await readList(kv)
  const entry = list.find((h) => h && h.uid === wantUid)
  if (!entry) return json({ error: '小镇上还没有这间屋子' }, 404)
  return json({
    ok: true, uid: wantUid, name: entry.name || '镇民', mine: !!(who && who.uid === wantUid),
    ...roomInfo(house), pal: PAL, catalog: catalog(), house,
    ...(await msgInfo(kv, wantUid, who ? who.uid : '')),
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const kv = env.LIGHTFIELD_KV

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const who = await readActiveUser(env, pickToken(request, body), request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)

  const house = await readHouse(kv, who.uid)
  const action = (body && body.action) || ''

  /* 买家具或贴面：买过就不再收费，想摆几件摆几件 */
  if (action === 'buy') {
    const f = itemById(body.id)
    if (!f) return json({ error: '没有这件东西' }, 400)
    // 合成限定的东西买不到，得去合成台做
    if (f.craftOnly) return json({ error: '「' + f.name + '」商店里不卖，去合成台做吧' }, 400)
    if (house.owned.indexOf(f.id) >= 0) {
      return json({ ok: true, already: true, owned: house.owned, book: null })
    }
    const book = await readBook(kv, who.uid)
    if ((Number(book.bal) || 0) < f.price) {
      return json({ error: '光尘不够，还差 ' + (f.price - (Number(book.bal) || 0)) + ' 个', need: f.price, book: null }, 400)
    }
    const next = await writeBook(kv, who.uid, { ...book, bal: (Number(book.bal) || 0) - f.price })
    house.owned.push(f.id)
    await writeHouse(kv, who.uid, house)
    return json({ ok: true, bought: f.id, owned: house.owned, book: { bal: next.bal, got: next.got } })
  }

  /* 保存布置：只让摆自己已经买下的家具 */
  if (action === 'save') {
    const items = sanitizeItems(body.items, house.size)
    if (!items) return json({ error: '布置数据不合法（越界、重叠或没买过这件家具）' }, 400)
    for (const it of items) {
      if (house.owned.indexOf(it.id) < 0) {
        return json({ error: '还没买下这件家具：' + it.id }, 400)
      }
    }
    if (items.length > MAX_ITEMS) return json({ error: '摆得太满了' }, 400)
    house.items = items
    house.updatedAt = Date.now()
    await writeHouse(kv, who.uid, house)
    await refreshEntry(kv, who.uid, who.username, house)
    return json({ ok: true, items: house.items, savedAt: house.updatedAt })
  }

  /* 给别人的小屋送光尘。和「给作品送」是两套记录，各送各的 */
  if (action === 'like') {
    const to = String((body && body.to) || '').trim()
    if (!RE.test(to)) return json({ error: '参数不对' }, 400)
    const r = await giveHome(kv, who.uid, to)
    if (!r.ok) {
      const m =
        r.reason === 'self' ? '给自己家送光尘就不必了' :
        r.reason === 'already' ? '你已经给这间屋子送过光尘了' :
        r.reason === 'poor' ? '光尘不够了，去「我的」签到领一些吧' :
        '送不出去'
      return json({ error: m, reason: r.reason, book: r.book ? publicView(r.book) : null }, 400)
    }
    return json({ ok: true, credited: r.credited, book: publicView(r.book) })
  }

  /* 在小屋留言板上留一句 */
  if (action === 'msg') {
    const to = String((body && body.to) || '').trim()
    if (!RE.test(to)) return json({ error: '参数不对' }, 400)
    const list = await addMsg(kv, to, who.uid, who.username, body && body.text)
    if (!list) return json({ error: '说点什么再留吧' }, 400)
    return json({ ok: true, msgs: list })
  }

  /* 删留言：只有屋主能删自己家的 */
  if (action === 'delmsg') {
    const id = String((body && body.id) || '').trim()
    if (!id) return json({ error: '参数不对' }, 400)
    const list = await delMsg(kv, who.uid, id)
    return json({ ok: true, msgs: list })
  }

  /* 扩建：屋子越住越大，家具原地不动。
     只升不降 —— 降级要把放不下的家具挪走，那是给用户找麻烦。 */
  if (action === 'upgrade') {
    const nx = nextSize(house.size)
    if (!nx) return json({ error: '这已经是你家最大的院子了' }, 400)
    const book = await readBook(kv, who.uid)
    const bal = Number(book.bal) || 0
    if (bal < nx.price) {
      return json({ error: '扩建要 ' + nx.price + ' 个光尘，还差 ' + (nx.price - bal) + ' 个', need: nx.price }, 400)
    }
    const after = await writeBook(kv, who.uid, { ...book, bal: bal - nx.price })
    const from = house.size
    /* 房间一大，地板线就往下走（16 是第 5 行，24 是第 8 行）。
       家具要跟着往下挪同样的距离，否则原来站在地上的现在会浮在墙上。 */
    const delta = floorLine(nx.size) - floorLine(house.size)
    if (delta) {
      house.items = (house.items || []).map((it) => ({ id: it.id, x: it.x, y: it.y + delta }))
    }
    house.size = nx.size
    house.updatedAt = Date.now()
    await writeHouse(kv, who.uid, house)
    return json({
      ok: true,
      from,
      size: house.size,
      name: nx.name,
      ...roomInfo(house),
      book: { bal: after.bal, got: after.got },
    })
  }

  /* 换墙纸 / 换地板：只认已经买下的 */
  if (action === 'surface') {
    const s = surfaceById(body.id)
    if (!s) return json({ error: '没有这款贴面' }, 400)
    if (house.owned.indexOf(s.id) < 0) return json({ error: '这款还没买下：' + s.id }, 400)
    if (s.kind === 'wall') house.wall = s.id
    else house.floor = s.id
    house.updatedAt = Date.now()
    await writeHouse(kv, who.uid, house)
    return json({ ok: true, wall: house.wall, floor: house.floor })
  }

  /* 一键收起来：只收家具，墙纸地板留着 —— 那不算「摆在屋里」的东西 */
  if (action === 'clear') {
    house.items = []
    house.updatedAt = Date.now()
    await writeHouse(kv, who.uid, house)
    await refreshEntry(kv, who.uid, who.username, house)
    return json({ ok: true, items: [] })
  }

  return json({ error: '未知操作' }, 400)
}
