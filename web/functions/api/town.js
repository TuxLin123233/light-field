// 像素小镇 · 地图与个人小屋
//
//   GET  ?list=1                      小镇地图（不用登录）
//   GET  ?uid=xxx / 不带参数=看自己     某间屋子
//   POST {action:'buy',  id}          买一件家具（花光尘，买过就不再收费）
//   POST {action:'save', items}       保存屋里的布置
import { readActiveUser, pickToken, BANNED_ERROR } from './_auth.js'
import { readBook, writeBook } from './_dust.js'
import {
  FURNITURE,
  ROOM,
  PAL,
  furnitureById,
  readHouse,
  writeHouse,
  sanitizeItems,
  registerHouse,
  refreshEntry,
  readList,
  MAX_ITEMS,
} from './_town.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/** 家具库：连像素画和调色板一起发下去，前端不用自己维护一份 */
const catalog = () => FURNITURE.map((f) => ({ id: f.id, name: f.name, price: f.price, art: f.art }))

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
      room: ROOM, pal: PAL, catalog: catalog(), house,
    })
  }

  const house = await readHouse(kv, wantUid)
  const list = await readList(kv)
  const entry = list.find((h) => h && h.uid === wantUid)
  if (!entry) return json({ error: '小镇上还没有这间屋子' }, 404)
  return json({
    ok: true, uid: wantUid, name: entry.name || '镇民', mine: !!(who && who.uid === wantUid),
    room: ROOM, pal: PAL, catalog: catalog(), house,
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

  /* 买家具：买过就不再收费，想摆几件摆几件 */
  if (action === 'buy') {
    const f = furnitureById(body.id)
    if (!f) return json({ error: '没有这件家具' }, 400)
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
    const items = sanitizeItems(body.items)
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

  /* 一键收起来 */
  if (action === 'clear') {
    house.items = []
    house.updatedAt = Date.now()
    await writeHouse(kv, who.uid, house)
    await refreshEntry(kv, who.uid, who.username, house)
    return json({ ok: true, items: [] })
  }

  return json({ error: '未知操作' }, 400)
}
