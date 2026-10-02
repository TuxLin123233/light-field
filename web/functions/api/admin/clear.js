import { checkOrigin } from '../_origin.js'
import { adminAuth } from '../_adminauth.js'
import { clearAllHistory } from '../_history.js'

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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestPost(context) {
  const { request, env } = context
  // 改状态的请求必须来自本站，挡掉「拿别人浏览器当肉鸡」
  {
    const g = checkOrigin(request)
    if (!g.ok) return json(g.body, g.status)
  }

  const key = (request.headers.get('x-admin-key') || '').trim()
  const adminKey = env.ADMIN_KEY || ''
  const gate = await adminAuth(env, request)
  if (!gate.ok) return json(gate.body, gate.status)

  if (!env.LIGHTFIELD_KV) {
    return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  }

  try {
    await env.LIGHTFIELD_KV.delete('pixels')
    await clearAllHistory(env.LIGHTFIELD_KV)
  } catch (err) {
    return json({ error: 'KV clear failed: ' + err.message }, 500)
  }

  return json({ ok: true })
}