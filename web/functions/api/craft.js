// 合成台与背包
//
//   GET                     背包 + 配方表（含每样还差多少）
//   POST {action:'gather'}  去镇上转转，捡点材料（有冷却）
//   POST {action:'craft', id}  按配方合成一件家具
//
// 合成出来的家具**商店买不到**，商店里也不列它们。
import { readActiveUser, BANNED_ERROR } from './_auth.js'
import { readHouse, writeHouse, PAL } from './_town.js'
import {
  MATERIALS,
  RECIPES,
  GATHER_CD,
  GATHER_PER_DAY,
  GATHER_MIN,
  GATHER_MAX,
  readBag,
  writeBag,
  gather,
  gatherState,
  canCraft,
  lacking,
  spend,
  matById,
} from './_craft.js'
import { furnitureById } from './_townitems.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

/** 配方连同「现在能不能做、还差什么」一起发下去，前端不用自己算 */
function recipeView(bag, house) {
  return RECIPES.map((r) => {
    const f = furnitureById(r.id)
    return {
      id: r.id,
      name: f ? f.name : r.id,
      cat: f ? f.cat : '',
      art: f ? f.art : [],
      wallOk: !!(f && f.wallOk),
      need: r.need,
      have: Object.fromEntries(Object.keys(r.need).map((k) => [k, bag.mat[k] || 0])),
      lack: lacking(bag, r),
      ok: canCraft(bag, r),
      owned: !!(house && (house.owned || []).indexOf(r.id) >= 0),
    }
  })
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV
  const bag = await readBag(kv, who.uid)
  const house = await readHouse(kv, who.uid)
  return json({
    ok: true,
    pal: PAL,
    materials: MATERIALS,
    bag: bag.mat,
    recipes: recipeView(bag, house),
    owned: house.owned || [],
    state: gatherState(bag, Date.now()),
    rules: { cd: GATHER_CD, perDay: GATHER_PER_DAY, min: GATHER_MIN, max: GATHER_MAX },
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV
  const action = String((body && body.action) || '')

  /* ---------------- 采集 ---------------- */
  if (action === 'gather') {
    const r = await gather(kv, who.uid, Date.now(), Math.random)
    if (!r.ok) {
      const mins = Math.ceil((r.state.cdLeft || 0) / 60000)
      const msg = r.reason === 'daily' ? '今天已经转够了，明天再来吧' : '歇一会儿，' + mins + ' 分钟后还能再转一趟'
      return json({ error: msg, reason: r.reason, state: r.state }, 429)
    }
    const house = await readHouse(kv, who.uid)
    const bag = await readBag(kv, who.uid)
    return json({
      ok: true,
      got: r.got,
      bag: bag.mat,
      state: r.state,
      recipes: recipeView(bag, house),
    })
  }

  /* ---------------- 合成 ---------------- */
  if (action === 'craft') {
    const id = String((body && body.id) || '')
    let rec = null
    for (const x of RECIPES) if (x.id === id) rec = x
    if (!rec) return json({ error: '没有这个配方' }, 400)

    const bag = await readBag(kv, who.uid)
    if (!canCraft(bag, rec)) {
      const lk = lacking(bag, rec)
      const txt = Object.keys(lk)
        .map((k) => {
          const m = matById(k)
          return (m ? m.name : k) + ' 还差 ' + lk[k]
        })
        .join('，')
      return json({ error: '材料不够：' + txt, lack: lk }, 400)
    }

    const house = await readHouse(kv, who.uid)
    if ((house.owned || []).indexOf(rec.id) >= 0) {
      return json({ error: '这件你已经有了，去屋里摆上就行' }, 400)
    }

    const nextBag = spend(bag, rec)
    await writeBag(kv, who.uid, nextBag)
    house.owned = (house.owned || []).concat([rec.id])
    await writeHouse(kv, who.uid, house)

    const f = furnitureById(rec.id)
    return json({
      ok: true,
      made: rec.id,
      name: f ? f.name : rec.id,
      bag: nextBag.mat,
      owned: house.owned,
      recipes: recipeView(nextBag, house),
    })
  }

  return json({ error: '未知操作' }, 400)
}
