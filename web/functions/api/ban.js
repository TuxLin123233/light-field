import { adminAuth } from './_adminauth.js'
// 封号管理（仅管理员）
//
//   GET  ?action=list            被封账号列表
//   GET  ?action=lookup&name=xx  按用户名查 uid
//   POST {action:'ban',    uid, reason}  封禁
//   POST {action:'unban',  uid}          解封
//   POST {action:'lookup', name}         按用户名查 uid（封号前先确认目标）
//   POST {action:'grant',  uid|name, amount, note}  管理员赠送/扣减光尘
//
// 为什么封禁要落到 KV 而不是只毁令牌：
//   令牌是 HMAC 签名的无状态凭证，签发后 30 天内离线也能验过。
//   只在前端清 localStorage 没用，换台设备带上令牌照样能写。
//   所以用户记录里存 banned 字段，所有写接口每次都回 KV 查一次。
import { readUser, readUserByName, setBanned, isBanned, userKey, nameKey } from './_auth.js'
import { readBook, publicView, creditDust } from './_dust.js'

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
  const gate = await adminAuth(env, request)
  if (!gate.ok) return json(gate.body, gate.status)
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
  const gate = await adminAuth(env, request)
  if (!gate.ok) return json(gate.body, gate.status)
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

  /* 管理员赠送 / 扣减光尘。
     走 creditDust 而不是直接改账本，签到天数、累计收到这些派生字段才会同步。 */
  if (action === 'grant') {
    const amount = Math.trunc(Number(body && body.amount))
    if (!Number.isFinite(amount) || amount === 0) {
      return json({ error: 'amount 必须是正数（增加）或负数（扣减）' }, 400)
    }
    if (Math.abs(amount) > 100000) return json({ error: '单次最多 10 万' }, 400)
    // uid 和 name 给一个就行
    const target = uid
      ? await readUser(env.LIGHTFIELD_KV, uid)
      : await readUserByName(env.LIGHTFIELD_KV, (body && body.name) || '')
    if (!target) return json({ error: '没有这个用户' }, 404)

    const r = await creditDust(env.LIGHTFIELD_KV, target.uid, amount)
    if (!r) return json({ error: '光尘调整失败' }, 500)
    const book = await readBook(env.LIGHTFIELD_KV, target.uid)
    return json({
      ok: true,
      user: view(target),
      amount,
      book: publicView(book),
      note: String((body && body.note) || '').slice(0, 100),
    })
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
