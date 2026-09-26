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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context

  if (!authorized(request, env)) {
    return json({ error: 'Unauthorized' }, 401)
  }

  return json({ ok: true })
}