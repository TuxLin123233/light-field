import { recentHistory, readAllHistory, findIndexByTime, historyCount } from './_history.js'

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
    return { name: '', workName: '', author: '', pixels: e, size: 16, time: 0, likes: 0 }
  }
  const legacy = !(e && (e.workName || e.author))
  const name = (e && e.name) || ''
  return {
    name,
    workName: legacy ? name : (e.workName || ''),
    author: legacy ? '匿名' : (e.author || ''),
    pixels: e && e.pixels,
    size: e && (e.size === 32 || e.size === 64) ? e.size : 16,
    time: (e && e.time) || 0,
    likes: (e && e.likes) || 0,
    type: e && e.type,
    anim: e && e.anim ? { frames: e.anim.frames, delay: e.anim.delay || 10 } : undefined,
    contest: e && e.contest,
    contestVotes: (e && e.contestVotes) || 0,
    room: e && e.room ? true : undefined,
    fromImage: e && e.fromImage ? true : undefined,
    tags: Array.isArray(e && e.tags) ? e.tags.slice(0, 6) : undefined,
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

  const mineParam = (url.searchParams.get('mine') || '').trim()
  const mineAuthor = mineParam ? mineParam : null
  const mineTimesParam = url.searchParams.get('minetimes') || ''
  let mineTimes = null
  if (mineTimesParam.trim()) {
    const set = new Set()
    for (const p of mineTimesParam.split(',')) {
      const t = Number(p)
      if (Number.isFinite(t) && t > 0) set.add(t)
    }
    if (set.size) mineTimes = set
  }

  // 社区搜索：关键词 / 标签 / 作者
  const qParam = (url.searchParams.get('q') || '').trim().toLowerCase().slice(0, 20)
  const tagParam = (url.searchParams.get('tag') || '').trim().slice(0, 6)
  const authorParam = (url.searchParams.get('author') || '').trim().slice(0, 20)
  const wantTags = url.searchParams.get('tagcloud') === '1'
  const filtering = !!(qParam || tagParam || authorParam)

  // 热门标签（按作品数排序）
  if (wantTags) {
    const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
    const counts = new Map()
    for (const e of entries) {
      if (!e || !Array.isArray(e.tags)) continue
      for (const t of e.tags) counts.set(t, (counts.get(t) || 0) + 1)
    }
    const tags = [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 24)
    return json({ ok: true, tags })
  }

  const single = url.searchParams.get('single') === '1'
  const locateParam = Number(url.searchParams.get('locate'))
  if (Number.isFinite(locateParam) && locateParam > 0) {
    const loc = await findIndexByTime(env.LIGHTFIELD_KV, locateParam)
    return json({ found: loc.index !== -1, index: loc.index, total: loc.total })
  }

  if (single) {
    const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
    const pool = (entries.length ? entries : latest ? [latest] : []).filter(
      (e) => (e.size || 16) === 16
    )
    const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
    return json(
      pick
        ? { pixels: pick.pixels, name: pick.name, workName: pick.workName, author: pick.author, size: pick.size || 16, time: pick.time, likes: pick.likes || 0, random: true }
        : { pixels: null, name: null, time: null, likes: 0, random: false }
    )
  }

  const limitParam = Number(url.searchParams.get('limit'))
  const DEFAULT_LIMIT = 30
  const MAX_LIMIT = 200
  const limitParam2 = Number.isFinite(limitParam) && limitParam > 0
    ? Math.min(Math.floor(limitParam), MAX_LIMIT)
    : DEFAULT_LIMIT
  const offsetParam = Number(url.searchParams.get('offset'))
  const offset =
    Number.isFinite(offsetParam) && offsetParam > 0 ? Math.floor(offsetParam) : 0

  let total = await historyCount(env.LIGHTFIELD_KV)
  let history
  if (mineAuthor || mineTimes) {
    const mineAll = await recentHistory(env.LIGHTFIELD_KV, { mineAuthor, mineTimes })
    total = mineAll.entries.length
    const sliced = limitParam2
      ? mineAll.entries.slice(offset, offset + limitParam2)
      : mineAll.entries.slice(offset)
    history = sliced.map(normalizeEntry).filter((e) => Array.isArray(e.pixels))
  } else if (filtering) {
    // 搜索要扫全量再过滤，所以 limit 在过滤之后才生效
    const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
    const matched = entries
      .map(normalizeEntry)
      .filter((e) => Array.isArray(e.pixels))
      .filter((e) => {
        if (authorParam && (e.author || '') !== authorParam) return false
        if (tagParam && !(Array.isArray(e.tags) && e.tags.includes(tagParam))) return false
        if (qParam) {
          const hay = ((e.workName || '') + ' ' + (e.author || '') + ' ' + (e.tags || []).join(' ')).toLowerCase()
          if (!hay.includes(qParam)) return false
        }
        return true
      })
    total = matched.length
    history = limitParam2 ? matched.slice(offset, offset + limitParam2) : matched.slice(offset)
  } else {
    const { entries } = await recentHistory(env.LIGHTFIELD_KV, { offset, limit: limitParam2 })
    history = entries.map(normalizeEntry).filter((e) => Array.isArray(e.pixels))
  }

  const noNew = after !== null && latest && latest.time === after

  if (noNew) {
    const { entries: all } = await readAllHistory(env.LIGHTFIELD_KV)
    const pool = all.filter((e) => e.time !== latest.time)
    const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : latest
    return json({ pixels: pick.pixels, name: pick.name, workName: pick.workName, author: pick.author, size: pick.size || 16, time: pick.time, likes: pick.likes || 0, history, total, random: true })
  }

  return json({
    pixels: latest ? latest.pixels : null,
    name: latest ? latest.name : null,
    workName: latest ? latest.workName : null,
    author: latest ? latest.author : null,
    size: latest ? latest.size || 16 : null,
    time: latest ? latest.time : null,
    likes: latest ? latest.likes || 0 : 0,
    history,
    total,
    random: false,
  })
}