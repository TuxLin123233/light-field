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

const HISTORY_MAX = 1000
const UPLOAD_WINDOW_MS = 5 * 60 * 1000

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
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

function entryPixels(e) {
  return Array.isArray(e) ? e : e && e.pixels
}

function samePixels(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!a[i] || !b[i] || a[i][0] !== b[i][0] || a[i][1] !== b[i][1] || a[i][2] !== b[i][2]) {
      return false
    }
  }
  return true
}

export async function onRequestPost(context) {
  const { request, env } = context

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const pixels = Array.isArray(body) ? body : body && body.pixels
  const isValid =
    Array.isArray(pixels) &&
    pixels.length === 256 &&
    pixels.every((p) => Array.isArray(p) && p.length === 3)
  if (!isValid) {
    return json({ error: 'pixels 必须是 256×3 的二维数组（每个元素是 [r,g,b]）' }, 400)
  }

  const bodyName = body && typeof body.name === 'string' ? body.name : ''
  const headerName = request.headers.get('X-Draw-Name')
  const queryName = new URL(request.url).searchParams.get('name')
  const legacyName = (bodyName || headerName || queryName || '').trim()

  const rawWorkName = body && typeof body.workName === 'string' ? body.workName : ''
  const rawAuthor = body && typeof body.author === 'string' ? body.author : ''

  const workName = rawWorkName.trim().slice(0, 20)
  const author = (rawAuthor || legacyName).trim().slice(0, 20) || '匿名'
  const name = workName || author

  if (!env.LIGHTFIELD_KV) {
    return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  }

  const ip = request.headers.get('cf-connecting-ip') || ''
  if (ip) {
    const rateKey = 'rl:' + ip
    const last = Number(await env.LIGHTFIELD_KV.get(rateKey))
    const nowRl = Date.now()
    if (Number.isFinite(last) && last > 0 && nowRl - last < UPLOAD_WINDOW_MS) {
      const waitMin = Math.ceil((UPLOAD_WINDOW_MS - (nowRl - last)) / 60000)
      return json({ error: '上传太频繁，请 ' + waitMin + ' 分钟后再试' }, 429)
    }
    await env.LIGHTFIELD_KV.put(rateKey, String(nowRl), { expirationTtl: Math.ceil(UPLOAD_WINDOW_MS / 1000) })
  }

  const history = await readHistory(env.LIGHTFIELD_KV)
  if (history.some((e) => samePixels(entryPixels(e), pixels))) {
    return json({ error: '内容重复，不能重复发布' }, 409)
  }

  const entry = { name, workName, author, pixels, time: Date.now(), likes: 0 }

  try {
    await env.LIGHTFIELD_KV.put('pixels', JSON.stringify(entry))

    history.push(entry)
    const nextHistory = history.slice(-HISTORY_MAX)
    await env.LIGHTFIELD_KV.put('history', JSON.stringify(nextHistory))
  } catch (err) {
    return json({ error: 'KV write failed: ' + err.message }, 500)
  }

  return json({ ok: true, count: pixels.length, name, workName, author, time: entry.time })
}