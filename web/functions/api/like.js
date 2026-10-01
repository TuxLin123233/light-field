/* 这里只保留 GET（佳作展示的 Top 榜）。
   原来的 POST 是条谁都能刷的路：没有鉴权、没有去重、没有限流，
   传个 time 就能把任意作品的 likes 改成任意值，而 likes 正是
   每日榜的排序依据 —— 等于可以自己把自己顶到榜首、白拿每日冠军奖。
   送光尘请走 /api/dust（那边有登录校验、同一作品只能送一次、
   自己不能送、相机作品不给）。 */
import { recentHistory } from './_history.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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