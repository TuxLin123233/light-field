// 信箱接口（登录用户）
//
//   GET                    取信箱列表与可领附件统计
//   POST {action:'claim', id}  领取附件（光尘直接进账本）
import { readActiveUser, pickToken, BANNED_ERROR } from './_auth.js'
import { readBox, claim, clearBox, stats, ensureOffers, ensureAdminMails, ATTACH_DUST } from './_mail.js'
import { readBook, writeBook, publicView } from './_dust.js'

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

  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV
  // 打开信箱时先补投一次活动信件。
  // 之前只在注册/登录时投递，账号如果是那次上线之前建的，
  // 用户直接点信箱进来就一直是空的。claimId 保证不会重复收到。
  await ensureOffers(kv, who.uid).catch(() => {})
  // 后台发布的公告 / 奖励，也是打开信箱时补投（每人每封只投一次）
  await ensureAdminMails(kv, who.uid).catch(() => {})
  const box = await readBox(kv, who.uid)
  const st = await stats(kv, who.uid)
  return json({ ok: true, mails: box, ...st })
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

  const who = await readActiveUser(env, pickToken(request, body), request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const action = (body && body.action) || ''
  const kv = env.LIGHTFIELD_KV

  // 清空信箱：未领取的附件会被保留
  if (action === 'clear') {
    const r = await clearBox(kv, who.uid)
    return json({ ok: true, ...r })
  }

  if (action !== 'claim') return json({ error: '未知操作' }, 400)

  const r = await claim(kv, who.uid, body.id)
  if (!r.ok) {
    const msg =
      r.reason === 'already' ? '这个附件已经领过了' :
      r.reason === 'gone' ? '信件不存在或已被清理' :
      '这封信没有可领取的附件'
    return json({ error: msg, reason: r.reason }, 400)
  }

  // 附件是光尘：直接加进账本，两步都在服务端
  let book = await readBook(kv, who.uid)
  if (r.mail.attachType === ATTACH_DUST || r.dust > 0) {
    book.bal += r.dust
    book = await writeBook(kv, who.uid, book)
  }

  return json({ ok: true, dust: r.dust, title: r.mail.title, book: publicView(book) })
}
