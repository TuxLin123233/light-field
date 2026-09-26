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

function normalizeEntry(e) {
  if (Array.isArray(e)) {
    return { name: '', workName: '', author: '', pixels: e, time: 0, likes: 0 }
  }
  const legacy = !(e && (e.workName || e.author))
  const name = (e && e.name) || ''
  return {
    name,
    workName: legacy ? name : (e.workName || ''),
    author: legacy ? '匿名' : (e.author || ''),
    pixels: e && e.pixels,
    time: (e && e.time) || 0,
    likes: (e && e.likes) || 0,
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context

  const fallback = {
    pixels: null,
    name: null,
    time: null,
    history: [],
    random: false,
    message: 'LIGHTFIELD_KV is not configured',
  }

  if (!env.LIGHTFIELD_KV) {
    return json(fallback)
  }

  const url = new URL(request.url)
  const afterParam = Number(url.searchParams.get('after'))
  const after = Number.isFinite(afterParam) && afterParam > 0 ? afterParam : null

  const raw = await env.LIGHTFIELD_KV.get('pixels')
  let latest = null
  if (raw) {
    try {
      latest = JSON.parse(raw)
    } catch {
      latest = null
    }
  }
  latest = latest ? normalizeEntry(latest) : null

  const rawHistory = await env.LIGHTFIELD_KV.get('history')
  let history = []
  if (rawHistory) {
    try {
      history = JSON.parse(rawHistory)
    } catch {
      history = []
    }
  }
  if (!Array.isArray(history)) history = []
  history = history
    .map(normalizeEntry)
    .filter((e) => Array.isArray(e.pixels))
    .reverse()

  const single = url.searchParams.get('single') === '1'

  const locateParam = Number(url.searchParams.get('locate'))
  if (Number.isFinite(locateParam) && locateParam > 0) {
    const idx = history.findIndex((e) => e.time === locateParam)
    return json({ found: idx !== -1, index: idx, total: history.length })
  }

  const total = history.length
  const limitParam = Number(url.searchParams.get('limit'))
  const limit =
    Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : null
  const offsetParam = Number(url.searchParams.get('offset'))
  const offset =
    Number.isFinite(offsetParam) && offsetParam > 0 ? Math.floor(offsetParam) : 0
  const slicedHistory = limit ? history.slice(offset, offset + limit) : history

  if (single) {
    const pool = history.length ? history : latest ? [latest] : []
    const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
    return json(
      pick
        ? { pixels: pick.pixels, name: pick.name, workName: pick.workName, author: pick.author, time: pick.time, likes: pick.likes || 0, random: true }
        : { pixels: null, name: null, time: null, likes: 0, random: false }
    )
  }

  const noNew = after !== null && latest && latest.time === after

  if (noNew) {
    const pool = history.filter((e) => e.time !== latest.time)
    const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : latest
    return json({ pixels: pick.pixels, name: pick.name, workName: pick.workName, author: pick.author, time: pick.time, likes: pick.likes || 0, history: slicedHistory, total, random: true })
  }

  return json({
    pixels: latest ? latest.pixels : null,
    name: latest ? latest.name : null,
    workName: latest ? latest.workName : null,
    author: latest ? latest.author : null,
    time: latest ? latest.time : null,
    likes: latest ? latest.likes || 0 : 0,
    history: slicedHistory,
    total,
    random: false,
  })
}