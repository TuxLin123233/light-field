// 认领码：无需注册账号的身份凭证。
// 客户端持有一串明文码，KV 里只存它的 SHA-256 哈希，泄露 KV 也无法冒用。
// 码本身是 192 位随机，等同于一把只有你知道的钥匙。

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })

const PREFIX = 'u:'
const CODE_RE = /^pf-[a-f0-9]{8}-[a-f0-9]{8}-[a-f0-9]{8}$/

function randomHex(n) {
  const bytes = new Uint8Array(n)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function newClaimCode() {
  return 'pf-' + randomHex(4) + '-' + randomHex(4) + '-' + randomHex(4)
}

export async function claimHash(code) {
  const clean = String(code || '').trim()
  if (!CODE_RE.test(clean)) return null
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clean))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function userKey(hash) {
  return PREFIX + hash
}

// 认领码是否合法（不合法直接当没传，不拦上传）
export async function resolveClaim(kv, code) {
  const hash = await claimHash(code)
  if (!hash) return null
  const raw = await kv.get(userKey(hash))
  let rec = null
  if (raw) {
    try {
      rec = JSON.parse(raw)
    } catch {
      rec = null
    }
  }
  if (!rec) {
    // 记录丢失（例如 KV 被清）时补建一份，保证用户不会因此无法上传
    rec = { name: '', createdAt: Date.now(), works: 0 }
    await kv.put(userKey(hash), JSON.stringify(rec))
  }
  return { hash, rec }
}

export async function touchUser(kv, hash, name) {
  if (!hash) return
  const key = userKey(hash)
  const raw = await kv.get(key)
  let rec = { name: '', createdAt: Date.now(), works: 0 }
  if (raw) {
    try {
      rec = JSON.parse(raw)
    } catch {
      /* 用默认值 */
    }
  }
  if (name) rec.name = String(name).slice(0, 20)
  await kv.put(key, JSON.stringify(rec))
}

export async function bumpWorks(kv, hash, delta) {
  if (!hash) return
  const key = userKey(hash)
  const raw = await kv.get(key)
  let rec = { name: '', createdAt: Date.now(), works: 0 }
  if (raw) {
    try {
      rec = JSON.parse(raw)
    } catch {
      /* 用默认值 */
    }
  }
  rec.works = Math.max(0, (Number(rec.works) || 0) + delta)
  await kv.put(key, JSON.stringify(rec))
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
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

  const action = (body && body.action) || ''

  if (action === 'issue') {
    const code = newClaimCode()
    const hash = await claimHash(code)
    await touchUser(env.LIGHTFIELD_KV, hash, body.name || '')
    return json({ ok: true, code })
  }

  if (action === 'info') {
    const found = await resolveClaim(env.LIGHTFIELD_KV, body.code)
    if (!found) return json({ ok: false, error: '认领码格式不对' }, 400)
    return json({ ok: true, name: found.rec.name || '', works: found.rec.works || 0 })
  }

  return json({ error: '未知操作' }, 400)
}
