// 头像接口
//
//   GET  ?uids=a,b,c   批量取头像（画社区列表时一次拿完，避免 N 次请求）
//       不带 uids 时取自己的，并附上解锁状态
//   POST {action:'save',   pixels}  保存自绘头像（首次扣 30 光尘）
//   POST {action:'reset'}          恢复默认头像（不退光尘）
import { readActiveUser, BANNED_ERROR } from './_auth.js'
import { readBook, writeBook, publicView } from './_dust.js'
import {
  readAvatar,
  writeAvatar,
  sanitizePixels,
  isBlank,
  hasPaid,
  defaultPixels,
  AVATAR_COST,
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
  const paid = (await hasPaid(kv, who.uid)) || !!(av && av.paid)
  const book = await readBook(kv, who.uid)
  return json({
    ok: true,
    uid: who.uid,
    size: SIZE,
    cost: AVATAR_COST,
    paid,
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
    // 只清像素，保留 paid 标记 —— 否则恢复默认后重画会被再扣一次 30 光尘
    const paid = await hasPaid(kv, who.uid)
    await kv.put('av:' + who.uid, JSON.stringify({ px: null, at: Date.now(), paid }))
    return json({ ok: true, pixels: null, paid, default: defaultPixels(who.uid) })
  }

  if (action !== 'save') return json({ error: '未知操作' }, 400)

  const px = sanitizePixels(body && body.pixels)
  if (!px) {
    return json({ error: `头像必须是 ${SIZE}×${SIZE} 的像素数据（每个格子 [r,g,b]）` }, 400)
  }
  if (isBlank(px)) {
    return json({ error: '还没画呢，至少涂几格再保存' }, 400)
  }

  // 首次保存才扣费，之后随便改
  let book = await readBook(kv, who.uid)
  const already = await hasPaid(kv, who.uid)
  if (!already) {
    if (book.bal < AVATAR_COST) {
      return json(
        {
          error: `绘制头像需要 ${AVATAR_COST} 个光尘，你只有 ${book.bal} 个`,
          need: AVATAR_COST,
          book: publicView(book),
        },
        400
      )
    }
    book.bal -= AVATAR_COST
    book = await writeBook(kv, who.uid, book)
  }

  const rec = await writeAvatar(kv, who.uid, px, true)
  return json({
    ok: true,
    cost: already ? 0 : AVATAR_COST,
    charged: already ? 0 : AVATAR_COST,
    pixels: rec.px,
    book: publicView(book),
  })
}

export { AVATAR_COST }
