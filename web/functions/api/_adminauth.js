// 后台鉴权的统一入口
//
// 之前每个 admin 接口各自写一遍 `key === env.ADMIN_KEY`，有两个问题：
//   1. 普通字符串比较**不是 timing-safe** —— 理论上能靠响应时间逐字节猜口令
//   2. **完全没有限速** —— 想试多少次试多少次
//   而且只在 verify.js 上限速没用：攻击者直接打 /api/admin/delete 就绕过去了，
//   所以限速必须做在每一个 admin 接口上，也就是这个函数里。
//
// 用法：
//   const gate = await adminAuth(env, request)
//   if (!gate.ok) return json(gate.body, gate.status)

import { clientIp, checkLimit, bumpFail, tooMany } from './_ratelimit.js'

/** 定长比较：先各自 HMAC 一遍再比，长度差和时间差都抹掉 */
async function timingSafeEqualStr(a, b) {
  const enc = new TextEncoder()
  const keyData = await crypto.subtle.importKey('raw', enc.encode('lf-admin-cmp'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const [x, y] = await Promise.all([crypto.subtle.sign('HMAC', keyData, enc.encode(String(a))), crypto.subtle.sign('HMAC', keyData, enc.encode(String(b)))])
  const ux = new Uint8Array(x)
  const uy = new Uint8Array(y)
  if (ux.length !== uy.length) return false
  let diff = 0
  for (let i = 0; i < ux.length; i++) diff |= ux[i] ^ uy[i]
  return diff === 0
}

/**
 * 校验后台口令。
 * @returns {{ok:true}} 或 {{ok:false, status:number, body:object}}
 */
export async function adminAuth(env, request) {
  const kv = env && env.LIGHTFIELD_KV
  const key = (request.headers.get('x-admin-key') || '').trim()
  const want = (env && env.ADMIN_KEY) || ''

  // 没配 ADMIN_KEY 就直接拒绝，绝不用空串当口令放行
  if (!want) return { ok: false, status: 500, body: { error: '后台未配置 ADMIN_KEY' } }

  const ip = clientIp(request)
  if (kv) {
    const lim = await checkLimit(kv, 'admin:' + ip, '')
    if (!lim.ok) return { ok: false, status: 429, body: tooMany(lim.retryAfter) }
  }

  const same = await timingSafeEqualStr(key, want)
  if (!same) {
    if (kv) await bumpFail(kv, 'admin:' + ip, '')
    return { ok: false, status: 401, body: { error: 'Unauthorized' } }
  }
  return { ok: true }
}
