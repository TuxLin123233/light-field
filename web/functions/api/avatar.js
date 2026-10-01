// 头像接口
//
//   GET  ?uids=a,b,c   批量取头像（画社区列表时一次拿完，避免 N 次请求）
//       不带 uids 时取自己的，并附上当前头像与两种画法的价格
//   POST {action:'save', pixels, mode}  保存自绘头像（每次都扣费：像素画 20 / 喷漆 30）
//   POST {action:'reset'}               恢复默认头像（不退还已花的光尘）
import { readActiveUser, BANNED_ERROR } from './_auth.js'
import { readBook, writeBook, publicView } from './_dust.js'
import {
  readAvatar,
  writeAvatar,
  sanitizePixels,
  isBlank,
  defaultPixels,
  costOf,
  COST_PIXEL,
  COST_SPRAY,
  MODES,
  SIZE,
} from './_avatar.js'

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

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const url = new URL(request.url)
  const kv = env.LIGHTFIELD_KV

  const uids = (url.searchParams.get('uids') || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[A-Za-z0-9_-]{1,40}$/.test(s))
    .slice(0, 60)

  // 批量：给没画过的返回 null，前端会渲染客户端生成的默认头像
  if (uids.length) {
    const out = {}
    for (const uid of uids) {
      const av = await readAvatar(kv, uid)
      out[uid] = av ? av.px : null
    }
    return json({ ok: true, size: SIZE, avatars: out })
  }

  // 自己：带解锁状态，编辑器要用
  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const av = await readAvatar(kv, who.uid)
  const book = await readBook(kv, who.uid)
  return json({
    ok: true,
    uid: who.uid,
    size: SIZE,
    // 两种画法各自的价格，前端按 mode 取
    cost: { pixel: COST_PIXEL, spray: COST_SPRAY },
    modes: MODES,
    has: !!av,
    currentMode: av ? av.mode : '',
    pixels: av ? av.px : null,
    default: defaultPixels(who.uid),
    book: publicView(book),
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

  const who = await readActiveUser(env, body && body.token, request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV
  const action = (body && body.action) || ''

  if (action === 'reset') {
    // 恢复默认头像。光尘不退还 —— 已经画过一次了，返还等于变相白拿一次创作。
    await kv.put('av:' + who.uid, JSON.stringify({ px: null, at: Date.now(), mode: '' }))
    return json({ ok: true, pixels: null, default: defaultPixels(who.uid) })
  }

  if (action !== 'save') return json({ error: '未知操作' }, 400)

  const px = sanitizePixels(body && body.pixels)
  if (!px) {
    return json({ error: `头像必须是 ${SIZE}×${SIZE} 的像素数据（每个格子 [r,g,b]）` }, 400)
  }
  if (isBlank(px)) {
    return json({ error: '还没画呢，至少涂几格再保存' }, 400)
  }

  // 每次保存都扣费，价格按画法区分。
  // costOf 返回的一定是数字；之前这里拿整个价格表对象去比较，
  // 26 < {…} 恒为 false 直接放行，扣费又算出 NaN 被兜成 0 ——
  // 表现就是「余额不够也能存，存完余额变 0」。
  const mode = MODES.indexOf(body.mode) >= 0 ? body.mode : 'pixel'
  const cost = costOf(mode)

  const book = await readBook(kv, who.uid)
  if (book.bal < cost) {
    return json(
      {
        error: `${mode === 'spray' ? '像素喷漆' : '像素画'}需要 ${cost} 个光尘，你只有 ${book.bal} 个`,
        need: cost,
        short: cost - book.bal,
        book: publicView(book),
      },
      400
    )
  }
  const charged = await writeBook(kv, who.uid, { ...book, bal: book.bal - cost })

  const rec = await writeAvatar(kv, who.uid, px, true, mode)
  return json({
    ok: true,
    mode,
    cost,
    charged: cost,
    pixels: rec.px,
    book: publicView(charged),
  })
}

export { COST_PIXEL, COST_SPRAY }
