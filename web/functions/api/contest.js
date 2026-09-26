import { recentHistory, incrementContestVotes } from './_history.js'
import { contestInfo, contestByWeek } from './_contest.js'

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

const VOTE_TTL = 14 * 86400

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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)

  if (!env.LIGHTFIELD_KV) {
    return json({ week: null, works: [], voted: [] })
  }

  const weekParam = (url.searchParams.get('week') || '').trim()
  const vidParam = (url.searchParams.get('vid') || '').trim()
  const topParam = Number(url.searchParams.get('top'))
  const top = Number.isFinite(topParam) && topParam > 0 ? Math.min(Math.floor(topParam), 50) : 10

  const info = weekParam ? contestByWeek(weekParam) : contestInfo()
  if (!info) {
    return json({ error: '无效的周次' }, 400)
  }

  const { entries } = await recentHistory(env.LIGHTFIELD_KV, { limit: 500 })
  const pool = entries.filter(
    (e) => e && e.contest === info.week && Array.isArray(e.pixels)
  )
  const sorted = pool
    .sort((a, b) => (b.contestVotes || 0) - (a.contestVotes || 0))
    .slice(0, top)
    .map(norm)

  let voted = []
  if (vidParam) {
    const raw = await env.LIGHTFIELD_KV.get('cvl:' + info.week + ':' + vidParam)
    if (raw) {
      try {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) voted = arr.map(String)
      } catch {}
    }
  }

  return json({
    week: info.week,
    theme: info.theme,
    start: info.start,
    end: info.end,
    open: info.open,
    past: !!info.past,
    entries: pool.length,
    voted,
    works: sorted,
  })
}

export async function onRequestPost(context) {
  const { request, env } = context

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const time = Number(body && body.time)
  const vid = String((body && body.vid) || '').trim()

  if (!Number.isFinite(time)) {
    return json({ error: '缺少 time 字段' }, 400)
  }
  if (vid.length < 2 || vid.length > 64) {
    return json({ error: '缺少 vid 字段' }, 400)
  }
  if (!env.LIGHTFIELD_KV) {
    return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  }

  const info = contestInfo()
  if (!info.open) {
    return json({ error: '本期投票已结束，请等待下周主题' }, 400)
  }
  const week = info.week

  const { entries } = await recentHistory(env.LIGHTFIELD_KV, { limit: 200 })
  const hit = entries.find((e) => e && (e.time || 0) === time)
  if (!hit) {
    return json({ error: '作品不存在' }, 404)
  }
  if (hit.contest !== week) {
    return json({ error: '该作品不属于本周主题' }, 400)
  }

  const key = 'cvl:' + week + ':' + vid
  let voted = []
  const raw = await env.LIGHTFIELD_KV.get(key)
  if (raw) {
    try {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) voted = arr
    } catch {}
  }
  if (voted.some((t) => Number(t) === time)) {
    return json({ error: '你已为该作品投过票' }, 409)
  }

  const res = await incrementContestVotes(env.LIGHTFIELD_KV, time)
  if (!res.found) {
    return json({ error: '作品不存在' }, 404)
  }

  voted.push(time)
  await env.LIGHTFIELD_KV.put(key, JSON.stringify(voted), { expirationTtl: VOTE_TTL })

  return json({ ok: true, votes: res.votes })
}