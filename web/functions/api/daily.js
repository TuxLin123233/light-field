import { readAllHistory } from './_history.js'

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

const TZ = 8 * 60 * 60 * 1000
const DAY_MS = 86400000

function norm(e) {
  if (!e) return null
  const legacy = !(e.workName || e.author)
  const name = e.name || ''
  return {
    name,
    workName: legacy ? name : (e.workName || ''),
    author: legacy ? '匿名' : (e.author || ''),
    pixels: e.pixels,
    size: e.size === 32 || e.size === 64 ? e.size : 16,
    time: e.time || 0,
    likes: e.likes || 0,
    contestVotes: e.contestVotes || 0,
    type: e.type,
    anim: e.anim ? { frames: e.anim.frames, delay: e.anim.delay || 10 } : undefined,
  }
}

// 将作品按「东八区自然日」分桶，同一天按点赞数取前 N
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)

  if (!env.LIGHTFIELD_KV) {
    return json({ year: null, month: null, days: {} })
  }

  const year = Number(url.searchParams.get('year'))
  const month = Number(url.searchParams.get('month'))
  if (!Number.isInteger(year) || year < 1970 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    return json({ error: 'year/month 参数不合法' }, 400)
  }

  const topPerDay = Number(url.searchParams.get('top'))
  const top = Number.isFinite(topPerDay) && topPerDay > 0 ? Math.min(Math.floor(topPerDay), 5) : 3

  const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
  const byDay = new Map()
  for (const e of entries) {
    if (!Array.isArray(e.pixels) || !e.time) continue
    const t = new Date(e.time + TZ)
    if (t.getUTCFullYear() !== year || t.getUTCMonth() + 1 !== month) continue
    const key = year + '-' + String(month).padStart(2, '0') + '-' + String(t.getUTCDate()).padStart(2, '0')
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key).push(e)
  }

  const days = {}
  for (const [key, list] of byDay) {
    days[key] = list
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, top)
      .map(norm)
  }

  return json({ year, month, days })
}