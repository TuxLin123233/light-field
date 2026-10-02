// 登录 / 口令的防爆破
//
// 之前 /api/auth 的 login 和 /api/admin/verify 都是「来了就比对」，
// 想试多少次试多少次。PBKDF2 虽然慢，但没上限就等于没有防线。
//
// 两道闸：
//   1. 按 IP —— 拦住「换着用户名试」
//   2. 按 用户名 —— 拦住「换着 IP 打同一个号」
// 两个都要过。只按 IP 会被代理池绕过，只按用户名挡不住撞库。
//
// 计数存在 KV 里，窗口过期自动作废，不用清理任务。

const PREFIX = 'rl:'
export const WINDOW_MS = 15 * 60 * 1000 // 15 分钟
export const MAX_PER_IP = 20 // 同一 IP 15 分钟最多 20 次失败
export const MAX_PER_NAME = 8 // 同一个账号最多 8 次

/** 取客户端 IP。Cloudflare 会填 CF-Connecting-IP，取不到就退回一个固定串 */
export function clientIp(request) {
  const h = request.headers
  return (
    h.get('CF-Connecting-IP') ||
    (h.get('x-forwarded-for') || '').split(',')[0].trim() ||
    h.get('x-real-ip') ||
    'unknown'
  )
}

/** KV 键要干净：用户名可能带特殊字符，先转义再拼，免得造出奇怪的键 */
function safeKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 48)
}

async function readBucket(kv, key) {
  try {
    const raw = await kv.get(PREFIX + key)
    if (!raw) return { n: 0, at: 0 }
    const o = JSON.parse(raw)
    if (!o || Date.now() - (Number(o.at) || 0) > WINDOW_MS) return { n: 0, at: 0 }
    return { n: Number(o.n) || 0, at: Number(o.at) || 0 }
  } catch (e) {
    return { n: 0, at: 0 }
  }
}

/** 看一眼现在被限了没，不改计数。登录前置检查用 */
export async function checkLimit(kv, ip, name) {
  if (!kv) return { ok: true }
  const bIp = await readBucket(kv, 'ip:' + safeKey(ip))
  if (bIp.n >= MAX_PER_IP) {
    return { ok: false, retryAfter: Math.ceil((WINDOW_MS - (Date.now() - bIp.at)) / 1000) }
  }
  if (name) {
    const bName = await readBucket(kv, 'nm:' + safeKey(name))
    if (bName.n >= MAX_PER_NAME) {
      return { ok: false, retryAfter: Math.ceil((WINDOW_MS - (Date.now() - bName.at)) / 1000) }
    }
  }
  return { ok: true }
}

/** 记一次失败。到期时间取窗口内最早那次，滑动窗口 */
export async function bumpFail(kv, ip, name) {
  if (!kv) return
  const now = Date.now()
  const put = async (key) => {
    const b = await readBucket(kv, key)
    const at = b.n === 0 ? now : b.at
    await kv.put(PREFIX + key, JSON.stringify({ n: b.n + 1, at }), {
      expirationTtl: Math.ceil(WINDOW_MS / 1000) + 60,
    })
  }
  await put('ip:' + safeKey(ip))
  if (name) await put('nm:' + safeKey(name))
}

/** 登录成功就把这个账号的失败计数清掉，别让误输几次把人锁死 */
export async function clearFail(kv, name) {
  if (!kv || !name) return
  try {
    await kv.delete(PREFIX + 'nm:' + safeKey(name))
  } catch (e) {}
}

export function tooMany(retryAfter) {
  const mins = Math.max(1, Math.ceil((Number(retryAfter) || 60) / 60))
  return {
    error: '尝试次数太多，请等 ' + mins + ' 分钟后再试',
    code: 'ratelimited',
    retryAfter: Number(retryAfter) || 60,
  }
}
