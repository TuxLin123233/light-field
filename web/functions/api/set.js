import { appendEntry, recentHistory, HISTORY_MAX } from './_history.js'
import { contestInfo } from './_contest.js'

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

const UPLOAD_WINDOW_MS = 5 * 60 * 1000

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

function norm(val, max) {
  return Array.isArray(val) && val.length === 3 && [val[0], val[1], val[2]].every((v) => Number.isFinite(Number(v)))
    ? [0, 1, 2].map((i) => Math.max(0, Math.min(max || 255, Math.round(Number(val[i])))))
    : null
}

function normalizeFrames(frames) {
  if (!Array.isArray(frames) || frames.length < 2 || frames.length > 16) return null
  const out = []
  for (const f of frames) {
    if (!Array.isArray(f) || f.length !== 16) return null
    const row = []
    for (const r of f) {
      if (!Array.isArray(r) || r.length !== 16) return null
      const cells = []
      for (const px of r) {
        const c = norm(px)
        if (!c) return null
        cells.push(c)
      }
      row.push(cells)
    }
    out.push(row)
  }
  return out
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestPost(context) {
  const { request, env } = context

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const sizeParam = Number(body && body.size)
  const size = sizeParam === 32 || sizeParam === 64 ? sizeParam : 16
  const expected = size * size

  const rawAnim = body && body.anim
  let animObj = null
  let pixels = null
  if (rawAnim && typeof rawAnim === 'object') {
    const frames = normalizeFrames(rawAnim.frames)
    if (!frames) {
      return json({ error: 'anim.frames 必须是 2~16 帧的 16×16 数组（每像素 [r,g,b]）' }, 400)
    }
    const d = Number(rawAnim.delay)
    const delay = Number.isFinite(d) ? Math.max(1, Math.min(200, Math.round(d))) : 10
    pixels = frames[0].reduce((acc, r) => acc.concat(r), [])
    animObj = { frames, delay }
  } else {
    pixels = Array.isArray(body) ? body : body && body.pixels
    const isValid =
      Array.isArray(pixels) &&
      pixels.length === expected &&
      pixels.every((p) => Array.isArray(p) && p.length === 3)
    if (!isValid) {
      return json({ error: `pixels 必须是 ${expected}×3 的二维数组（每个元素是 [r,g,b]）` }, 400)
    }
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

  const rawContest = body && typeof body.contest === 'string' ? body.contest.trim() : ''
  if (rawContest) {
    const cinfo = contestInfo()
    if (cinfo.week !== rawContest) {
      return json({ error: 'contest 只能报名本周主题（当前为 ' + cinfo.week + '）' }, 400)
    }
  }

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

  const { entries } = await recentHistory(env.LIGHTFIELD_KV, { limit: 300 })
  if (animObj) {
    if (entries.some((e) => e && e.anim && JSON.stringify(e.anim.frames) === JSON.stringify(animObj.frames))) {
      return json({ error: '内容重复，不能重复发布' }, 409)
    }
  } else if (entries.some((e) => samePixels(entryPixels(e), pixels))) {
    return json({ error: '内容重复，不能重复发布' }, 409)
  }

  const entry = { name, workName, author, size, pixels, time: Date.now(), likes: 0 }
  if (animObj) entry.type = 'anim'
  if (animObj) entry.anim = animObj
  if (rawContest) entry.contest = rawContest
  const entryJson = JSON.stringify(entry)
  if (entryJson.length > 90000) {
    return json({ error: '动画帧数据过大，请减少帧数或简化画面后再试' }, 413)
  }

  try {
    await env.LIGHTFIELD_KV.put('pixels', entryJson)

    const res = await appendEntry(env.LIGHTFIELD_KV, entry)
    if (res.status === 'full') {
      return json(
        { error: `社区作品已达上限（${HISTORY_MAX} 件），请等待维护者清理后再发布` },
        507
      )
    }
  } catch (err) {
    return json({ error: 'KV write failed: ' + err.message }, 500)
  }

  return json({ ok: true, count: pixels.length, name, workName, author, size, time: entry.time })
}