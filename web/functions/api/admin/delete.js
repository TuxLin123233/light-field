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

async function readHistory(kv) {
  const raw = await kv.get('history')
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestPost(context) {
  const { request, env } = context

  if (!authorized(request, env)) {
    return json({ error: 'Unauthorized' }, 401)
  }

  if (!env.LIGHTFIELD_KV) {
    return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const time = Number(body && body.time)
  if (!Number.isFinite(time)) {
    return json({ error: '缺少 time 字段' }, 400)
  }

  const history = await readHistory(env.LIGHTFIELD_KV)
  const remain = history.filter((e) => !e || (e.time || 0) !== time)
  if (remain.length === history.length) {
    return json({ error: '条目不存在' }, 404)
  }

  try {
    const rawLatest = await env.LIGHTFIELD_KV.get('pixels')
    if (rawLatest) {
      let latest = null
      try {
        latest = JSON.parse(rawLatest)
      } catch {
        latest = null
      }
      if (latest && (latest.time || 0) === time) {
        const next = remain[remain.length - 1]
        if (next) {
          await env.LIGHTFIELD_KV.put('pixels', JSON.stringify(next))
        } else {
          await env.LIGHTFIELD_KV.delete('pixels')
        }
      }
    }

    await env.LIGHTFIELD_KV.put('history', JSON.stringify(remain))
  } catch (err) {
    return json({ error: 'KV delete failed: ' + err.message }, 500)
  }

  return json({ ok: true, count: remain.length })
}