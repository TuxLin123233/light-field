// 后台信箱发布：维护者可以发公告、发奖励
//
//   GET                          列出已发布的广播信
//   POST {action:'publish', icon, title, body, dust, to}
//        to 留空    → **广播**：存进 admail 列表，所有人（含之后注册的新号）
//                     下次打开信箱时自动收到，每人每封只投一次
//        to 填用户名 → **定向**：立即投进这个人的信箱，不进广播列表
//   POST {action:'revoke', id}   撤回一封广播信（已经收到的人不收回）
import { deliver, readAdminMails, writeAdminMails, MAX_ADMIN_MAILS } from '../_mail.js'
import { readUserByName } from '../_auth.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })

function authorized(request, env) {
  const key = (request.headers.get('x-admin-key') || '').trim()
  const adminKey = env.ADMIN_KEY || ''
  return !!(adminKey && key === adminKey)
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401)
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const mails = await readAdminMails(env.LIGHTFIELD_KV)
  return json({ ok: true, mails })
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401)
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const kv = env.LIGHTFIELD_KV
  const action = (body && body.action) || 'publish'

  /* 撤回：只是从广播列表里拿掉，之后打开信箱的人不再收到。
     已经收到的那封信留在对方信箱里，不追回（追回等于把发出去的奖励收回）。 */
  if (action === 'revoke') {
    const id = String(body.id || '')
    if (!id) return json({ error: '缺少 id' }, 400)
    const list = await readAdminMails(kv)
    const next = list.filter((m) => m && m.id !== id)
    await writeAdminMails(kv, next)
    return json({ ok: true, removed: list.length - next.length, mails: next })
  }

  if (action !== 'publish') return json({ error: '未知操作' }, 400)

  const title = String(body.title || '').trim().slice(0, 40)
  const text = String(body.body || '').trim().slice(0, 300)
  const icon = String(body.icon || '📢').trim().slice(0, 8) || '📢'
  const dust = Math.max(0, Math.floor(Number(body.dust) || 0))
  const to = String(body.to || '').trim()

  if (!title) return json({ error: '请填写信件标题' }, 400)

  const mail = {
    id: newId(),
    icon,
    title,
    body: text,
    dust,
    time: Date.now(),
  }

  // 定向：立刻投给一个人
  if (to) {
    const user = await readUserByName(kv, to)
    if (!user) return json({ error: '找不到用户「' + to + '」' }, 404)
    const n = await deliver(kv, user.uid, {
      ...mail,
      id: 'dm-' + mail.id,
      claimId: 'dm-' + mail.id,
      kind: dust > 0 ? 'attach' : 'text',
    })
    return json({ ok: true, targeted: true, to: user.username, delivered: n })
  }

  // 广播：进列表，等每个人下次打开信箱时投递
  const list = await readAdminMails(kv)
  list.unshift(mail)
  const next = await writeAdminMails(kv, list.slice(0, MAX_ADMIN_MAILS))
  return json({ ok: true, targeted: false, mail, mails: next })
}
