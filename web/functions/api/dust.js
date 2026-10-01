// 光尘账本接口（登录用户）
//
//   GET  ?action=me     取账本
//   POST {action:'sign'}            每日签到
//   POST {action:'give', time:xxx}  送光尘给某幅作品（同时给它加赞）
//
// 未登录返回 401，前端继续使用本地账本。
import { readToken, pickToken } from './_auth.js'
import { readBook, signIn, giveDust, publicView, DUST_PER_SIGNIN, DUST_COST } from './_dust.js'
import { incrementLikes } from './_history.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  const who = await readToken(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)

  const book = await readBook(env.LIGHTFIELD_KV, who.uid)
  return json({ ok: true, uid: who.uid, username: who.username, book: publicView(book) })
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

  const who = await readToken(env, pickToken(request, body), request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)

  const action = (body && body.action) || ''

  if (action === 'sign') {
    const r = await signIn(env.LIGHTFIELD_KV, who.uid)
    return json({
      ok: true,
      already: r.already,
      bonus: r.bonus || 0,
      gain: r.gain || 0,
      streak: r.streak,
      book: publicView(r.book),
    })
  }

  if (action === 'give') {
    const r = await giveDust(env.LIGHTFIELD_KV, who.uid, body && body.time)
    if (!r.ok) {
      const msg =
        r.reason === 'already' ? '这幅作品已经送过光尘了' :
        r.reason === 'poor' ? '光尘不够啦，先去签到攒一点' :
        '作品不存在'
      const book = r.book ? publicView(r.book) : null
      return json({ error: msg, reason: r.reason, book }, 400)
    }
    // 扣分成功才加赞；作品若已不存在，账本已扣但不加分
    const liked = await incrementLikes(env.LIGHTFIELD_KV, body.time)
    return json({
      ok: true,
      found: liked.found,
      likes: liked.likes,
      book: publicView(r.book),
    })
  }

  return json({ error: '未知操作' }, 400)
}

export const DUST_RULES = { perSignin: DUST_PER_SIGNIN, cost: DUST_COST }
