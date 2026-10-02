// 跨站来源校验
//
// 之前 28 个接口都返回 Access-Control-Allow-Origin: *，等于告诉浏览器
// 「任何网站都能读我的响应」。就算令牌在 Authorization 头里、跨站拿不到，
// 攻击者仍能用**别人的浏览器**发请求 —— 打的是受害者的 IP，
// 撞的是你的登录限速额度，别人拿别人当肉鸡。
//
// 这里不靠 CORS 头（那是浏览器自愿遵守的），而是在**服务端**直接看来源：
// 改状态的请求必须来自本站，否则一律拒。
//
// 为什么只查有 Origin 的请求：服务端到服务端、或老浏览器可能不带 Origin，
// 这时不能一概拒掉（会把正常请求误杀）。真正的 CSRF 一定带 Origin。

/** 取出请求的来源（Origin 优先，退回 Referer） */
function originOf(request) {
  const o = request.headers.get('Origin')
  if (o && o !== 'null') return o
  const r = request.headers.get('Referer')
  if (!r) return ''
  try {
    const u = new URL(r)
    return u.origin
  } catch (e) {
    return ''
  }
}

/** 本站自己的来源。pages.dev 上可能有预览域名，所以按「主机相同」比，不写死 */
function selfHost(request) {
  try {
    return new URL(request.url).host
  } catch (e) {
    return ''
  }
}

/**
 * 改状态的请求是不是来自本站。
 * @returns {{ok:true}} 或 {{ok:false, status, body}}
 */
export function checkOrigin(request) {
  const method = request.method || 'GET'
  // GET 不改状态，放行（读取本来也不该被跨站读，靠不返回 CORS 头挡住）
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return { ok: true }

  const from = originOf(request)
  // 没带来源：可能是服务端调用或老客户端，不拦
  if (!from) return { ok: true }

  const self = selfHost(request)
  try {
    if (new URL(from).host === self) return { ok: true }
  } catch (e) {}

  return { ok: false, status: 403, body: { error: '请求来源不被允许', code: 'badorigin' } }
}
