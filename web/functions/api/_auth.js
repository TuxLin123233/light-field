// 账号认证核心：密码哈希 + 令牌签发/校验
//
// 设计要点：
// 1. 密码用 PBKDF2-SHA256 加盐派生，绝不存明文，也绝不存可逆密文。
// 2. 登录凭证是「无状态签名令牌」，不存 KV —— 所以每次请求都不用查库，
//    也不会因为 KV 最终一致出现「刚登录就掉线」。
// 3. 校验失败时不区分「用户不存在」和「密码错误」，避免被人枚举账号。

/* Workers 免费版每次调用的 CPU 上限约 10ms，PBKDF2 是原生实现，
   1 万次约 5~8ms。再高会超限，所以这里保守取值。
   若升级到付费版（CPU 上限 30s），可以把 ITER 调到 10 万以上。 */
const ITER = 10000
const KEYLEN = 32
const SALT_BYTES = 16

export const TOKEN_TTL = 30 * 24 * 3600 * 1000 // 30 天

/* -------------------- base64url / 十六进制 -------------------- */

export function b64urlEncode(bytes) {
  let s = ''
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function b64urlDecode(str) {
  const s = String(str).replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : ''
  const bin = atob(s + pad)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function hex(buf) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

function randomHex(nBytes) {
  const a = new Uint8Array(nBytes)
  crypto.getRandomValues(a)
  return hex(a)
}

/* -------------------- 密码哈希 -------------------- */

async function pbkdf2(password, saltBytes, iterations) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    key,
    KEYLEN * 8
  )
  return new Uint8Array(bits)
}

/** 生成可存储的密码串：pbkdf2$迭代次数$盐$哈希 */
export async function hashPassword(password) {
  const salt = new Uint8Array(SALT_BYTES)
  crypto.getRandomValues(salt)
  const bits = await pbkdf2(password, salt, ITER)
  return 'pbkdf2$' + ITER + '$' + hex(salt) + '$' + hex(bits)
}

/** 恒定时间比较，避免按字符逐位试探 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function verifyPassword(password, stored) {
  try {
    const parts = String(stored || '').split('$')
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
    const iter = Number(parts[1])
    if (!Number.isFinite(iter) || iter < 1 || iter > 1000000) return false
    const salt = new Uint8Array(
      parts[2].match(/.{1,2}/g).map((h) => parseInt(h, 16))
    )
    const bits = await pbkdf2(password, salt, iter)
    return timingSafeEqual(hex(bits), parts[3])
  } catch (e) {
    return false
  }
}

/* -------------------- 令牌（无状态签名） -------------------- */

function secretKey(env) {
  const s = (env && env.AUTH_SECRET) || ''
  return s
}

async function hmac(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return new Uint8Array(sig)
}

/** 签发令牌：uid + 用户名 + 过期时间，用 AUTH_SECRET 做 HMAC 签名 */
export async function issueToken(env, user, ttl = TOKEN_TTL) {
  const secret = secretKey(env)
  if (!secret) return null
  const payload = {
    uid: user.uid,
    u: user.username,
    iat: Date.now(),
    exp: Date.now() + ttl,
  }
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = b64urlEncode(await hmac(body, secret))
  return body + '.' + sig
}

/**
 * 校验令牌。只需要 HMAC 校验，不查 KV，因此零延迟、零一致性风险。
 * 返回 { uid, username } 或 null。
 */
export async function readToken(env, token, headerToken) {
  const secret = secretKey(env)
  if (!secret) return null
  // 允许直接传令牌，也允许传 "Bearer xxx" 形式的 Authorization 头
  let t = String(token || headerToken || '').trim()
  if (/^Bearer\s+/i.test(t)) t = t.replace(/^Bearer\s+/i, '').trim()
  if (!t) return null
  const dot = t.lastIndexOf('.')
  if (dot <= 0) return null
  const body = t.slice(0, dot)
  const sig = t.slice(dot + 1)
  let expect
  try {
    expect = b64urlEncode(await hmac(body, secret))
  } catch (e) {
    return null
  }
  if (!timingSafeEqual(sig, expect)) return null
  let payload
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)))
  } catch (e) {
    return null
  }
  if (!payload || typeof payload.uid !== 'string') return null
  if (!Number.isFinite(payload.exp) || payload.exp < Date.now()) return null
  return { uid: payload.uid, username: String(payload.u || '') }
}

/* -------------------- 用户名校验 -------------------- */

// 允许中文、字母、数字、下划线、连字符；2~16 个字符
const NAME_RE = /^[\u4e00-\u9fa5A-Za-z0-9_-]{2,16}$/

export function normalizeName(name) {
  return String(name || '').trim()
}

export function validName(name) {
  return NAME_RE.test(normalizeName(name))
}

/**
 * 密码强度：至少 8 位，且同时包含字母与数字。
 * 不强制特殊符号 —— 移动端输入麻烦，收益有限。
 */
export function validPassword(pw) {
  const s = String(pw || '')
  if (s.length < 8 || s.length > 64) return false
  return /[A-Za-z]/.test(s) && /[0-9]/.test(s)
}

export function passwordHint(pw) {
  const s = String(pw || '')
  if (s.length < 8) return '密码至少 8 位'
  if (s.length > 64) return '密码太长了'
  if (!/[A-Za-z]/.test(s)) return '密码需要包含字母'
  if (!/[0-9]/.test(s)) return '密码需要包含数字'
  return ''
}

/* -------------------- 存储 -------------------- */

export const userKey = (uid) => 'acc:' + uid
export const nameKey = (lowerName) => 'accname:' + lowerName

export function newUid() {
  return 'u' + randomHex(8)
}

export async function readUser(kv, uid) {
  if (!uid) return null
  const raw = await kv.get(userKey(uid))
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

/* -------------------- 封禁 --------------------
   令牌是无状态签名，签发后 30 天内 HMAC 一直有效，
   所以「封禁」不能只改令牌 —— 必须每次写操作都回 KV 查一次用户状态。
   这里集中判断，避免每个接口各写一遍而漏掉。 */

/** 封禁响应：统一文案，不透露封禁原因细节以外的信息 */
export const BANNED_ERROR = { error: '账号已被封禁，无法执行此操作', code: 'banned' }

export function isBanned(user) {
  return !!(user && user.banned)
}

/**
 * 校验令牌并确认账号未被封禁。
 * 返回 { uid, username, user } ；被封禁时返回 { banned:true, uid }。
 */
export async function readActiveUser(env, token, headerToken) {
  const who = await readToken(env, token, headerToken)
  if (!who) return null
  const user = await readUser(env.LIGHTFIELD_KV, who.uid)
  if (!user) return { ...who, gone: true }
  if (isBanned(user)) return { ...who, user, banned: true }
  return { ...who, user }
}

/** 封禁 / 解封；返回落库后的用户 */
export async function setBanned(kv, uid, banned, reason) {
  const user = await readUser(kv, uid)
  if (!user) return null
  if (banned) {
    user.banned = true
    user.bannedAt = Date.now()
    user.banReason = String(reason || '').slice(0, 100)
  } else {
    delete user.banned
    delete user.bannedAt
    delete user.banReason
  }
  return writeUser(kv, user)
}

export async function readUserByName(kv, username) {
  const lower = normalizeName(username).toLowerCase()
  if (!lower) return null
  const uid = await kv.get(nameKey(lower))
  if (!uid) return null
  return readUser(kv, uid)
}

export async function writeUser(kv, user) {
  await kv.put(userKey(user.uid), JSON.stringify(user))
  await kv.put(nameKey(user.username.toLowerCase()), user.uid)
  return user
}

/** 从请求里取出登录凭证：优先 Authorization 头，其次 body 里的 token */
export function pickToken(request, body) {
  const h = request.headers.get('authorization') || ''
  if (/^Bearer\s+/i.test(h)) return h.replace(/^Bearer\s+/i, '').trim()
  if (body && typeof body.token === 'string' && body.token.trim()) return body.token.trim()
  return ''
}
