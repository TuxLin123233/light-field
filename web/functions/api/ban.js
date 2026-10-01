// 封号管理（仅管理员）
//
//   GET  ?action=list            被封账号列表
//   POST {action:'ban',   uid, reason}   封禁
//   POST {action:'unban', uid}           解封
//   POST {action:'lookup', name}         按用户名查 uid（封号前先确认目标）
//
// 为什么封禁要落到 KV 而不是只毁令牌：
//   令牌是 HMAC 签名的无状态凭证，签发后 30 天内离线也能验过。
//   只在前端清 localStorage 没用，换台设备带上令牌照样能写。
//   所以用户记录里存 banned 字段，所有写接口每次都回 KV 查一次。
import { readUser, readUserByName, setBanned, isBanned, userKey } from './_auth.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
}

// 封号列表必须实时，任何缓存都会让后台看到过期状态
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  })

function authorized(request, env) {
  const key = (request.headers.get('x-admin-key') || '').trim()
  const adminKey = env.ADMIN_KEY || ''
  return !!(adminKey && key === adminKey)
}

function view(u) {
  return {
    uid: u.uid,
    username: u.username,
    createdAt: u.createdAt || 0,
    banned: isBanned(u),
    bannedAt: u.bannedAt || 0,
    banReason: u.banReason || '',
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!authorized(request, env)) return json({ error: '需要管理员密钥' }, 401)
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  const url = new URL(request.url)
  if (url.searchParams.get('action') === 'lookup') {
    const name = url.searchParams.get('name') || ''
    const u = await readUserByName(env.LIGHTFIELD_KV, name)
    if (!u) return json({ error: '没有这个用户名' }, 404)
    return json({ ok: true, user: view(u) })
  }

  // 列出所有被封的账号
  const out = []
  let cursor
  for (let i = 0; i < 20; i++) {
    const page = await env.LIGHTFIELD_KV.list({ prefix: 'acc:', cursor })
    for (const k of page.keys || []) {
      const raw = await env.LIGHTFIELD_KV.get(k.name)
      if (!raw) continue
      let u
      try {
        u = JSON.parse(raw)
      } catch (e) {
        continue
      }
      if (u && isBanned(u)) out.push(view(u))
    }
    if (!page.list_complete) {
      cursor = page.cursor
      if (!cursor) break
    } else {
      break
    }
  }

  out.sort((a, b) => (b.bannedAt || 0) - (a.bannedAt || 0))
  return json({ ok: true, total: out.length, banned: out })
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!authorized(request, env)) return json({ error: '需要管理员密钥' }, 401)
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const action = (body && body.action) || ''
  const uid = String((body && body.uid) || '').trim()

  if (action === 'lookup') {
    const u = await readUserByName(env.LIGHTFIELD_KV, (body && body.name) || '')
    if (!u) return json({ error: '没有这个用户名' }, 404)
    return json({ ok: true, user: view(u) })
  }

  if (action !== 'ban' && action !== 'unban') return json({ error: '未知操作' }, 400)
  if (!uid) return json({ error: '缺少 uid' }, 400)

  const user = await readUser(env.LIGHTFIELD_KV, uid)
  if (!user) return json({ error: '账号不存在' }, 404)

  if (action === 'ban') {
    if (isBanned(user)) return json({ ok: true, user: view(user), already: true })
    const reason = String((body && body.reason) || '').slice(0, 100)
    const saved = await setBanned(env.LIGHTFIELD_KV, uid, true, reason)
    return json({ ok: true, user: view(saved) })
  }

  if (!isBanned(user)) return json({ ok: true, user: view(user), already: true })
  const saved = await setBanned(env.LIGHTFIELD_KV, uid, false)
  return json({ ok: true, user: view(saved) })
}

export { userKey }
