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

  const key = (request.headers.get('x-admin-key') || '').trim()
  const adminKey = env.ADMIN_KEY || ''
  if (!adminKey || key !== adminKey) {
    return json({ error: 'Unauthorized' }, 401)
  }

  if (!env.LIGHTFIELD_KV) {
    return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  }

  try {
    await env.LIGHTFIELD_KV.delete('pixels')
    await env.LIGHTFIELD_KV.delete('history')
  } catch (err) {
    return json({ error: 'KV clear failed: ' + err.message }, 500)
  }

  return json({ ok: true })
}