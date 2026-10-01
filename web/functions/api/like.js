import { recentHistory, incrementLikes, decrementLikes} from './_history.js'

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

  const time = Number(body && body.time)
  if (!Number.isFinite(time)) {
    return json({ error: '缺少 time 字段' }, 400)
  }

  if (!env.LIGHTFIELD_KV) {
    return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  }

  // unlike=1 表示取消点赞
  const res = body.unlike
    ? await decrementLikes(env.LIGHTFIELD_KV, time)
    : await incrementLikes(env.LIGHTFIELD_KV, time)
  if (!res.found) {
    return json({ error: '作品不存在' }, 404)
  }

  return json({ ok: true, likes: res.likes })
}

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const topParam = Number(url.searchParams.get('top'))
  const top = Number.isFinite(topParam) && topParam > 0 ? Math.floor(topParam) : 10
  const range = url.searchParams.get('range') || 'all'
  const tz = Number(url.searchParams.get('tz'))
  const tzMin = Number.isFinite(tz) ? tz : 0

  let minTime = 0
  if (range === 'today' || range === 'week') {
    const now = Date.now()
    const dayStart = now - ((now + tzMin * 60000) % 86400000) - tzMin * 60000
    if (range === 'today') {
      minTime = dayStart
    } else {
      const dow = new Date(now + tzMin * 60000).getUTCDay()
      const sinceMonday = (dow + 6) % 7
      minTime = dayStart - sinceMonday * 86400000
    }
  }

  if (!env.LIGHTFIELD_KV) {
    return json({ works: [] })
  }

  const scanCap = range === 'all' ? 1200 : 800
  const { entries } = await recentHistory(env.LIGHTFIELD_KV, { limit: scanCap })
  const sorted = entries
    .filter((e) => Array.isArray(e.pixels) && (e.time || 0) >= minTime)
    // 佳作展示只推真正被喜欢过的作品，0 赞的不占位
    .filter((e) => (e.likes || 0) > 0)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, top)
    .map((e) => {
      const legacy = !(e.workName || e.author)
      const name = e.name || ''
      return {
        pixels: e.pixels,
        name,
        workName: legacy ? name : e.workName || '',
        author: legacy ? '匿名' : e.author || '',
        size: e.size === 32 || e.size === 64 ? e.size : 16,
        time: e.time || 0,
        likes: e.likes || 0,
        // 作者 uid：前端据此取头像；老作品/认领码时代没有则为空
        ownerUser: e.ownerUser || '',
        type: e.type,
        anim: e.anim ? { frames: e.anim.frames, delay: e.anim.delay || 10 } : undefined,
        contest: e.contest,
        contestVotes: e.contestVotes || 0,
      }
    })

  return json({ works: sorted, range })
}