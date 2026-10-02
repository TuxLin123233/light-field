import { adminAuth } from '../_adminauth.js'
import { removeByTime } from '../_history.js'

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

  const gate = await adminAuth(env, request)
  if (!gate.ok) return json(gate.body, gate.status)

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

  try {
    const res = await removeByTime(env.LIGHTFIELD_KV, time)
    if (!res.found) {
      return json({ error: '条目不存在' }, 404)
    }

    const rawLatest = await env.LIGHTFIELD_KV.get('pixels')
    if (rawLatest) {
      let latest = null
      try {
        latest = JSON.parse(rawLatest)
      } catch {
        latest = null
      }
      if (latest && (latest.time || 0) === time) {
        if (res.last) {
          await env.LIGHTFIELD_KV.put('pixels', JSON.stringify(res.last))
        } else {
          await env.LIGHTFIELD_KV.delete('pixels')
        }
      }
    }

    return json({ ok: true })
  } catch (err) {
    return json({ error: 'KV delete failed: ' + err.message }, 500)
  }
}