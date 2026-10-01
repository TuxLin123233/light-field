// 「我自己的作品」：列出 / 统计 / 删除。
// 归属有两种（过渡期并存）：
//   1. 登录账号 —— 优先。作品发布时按账号记 ownerUser
//   2. 认领码   —— 老作品没有账号时的兜底，KV 里只存哈希
// owner / ownerUser 字段都绝不对外暴露。
import { readAllHistory, removeByTime } from './_history.js'
import { claimHash, bumpWorks } from './claim.js'
import { readActiveUser, pickToken, BANNED_ERROR } from './_auth.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const action = (body && body.action) || 'list'

  // 登录用户按账号取；没登录才回退认领码
  const who = await readActiveUser(env, pickToken(request, body), request.headers.get('authorization'))
  if (who && who.banned) return json(BANNED_ERROR, 403)
  let hash = ''
  if (!who) {
    hash = await claimHash(body && body.code)
    if (!hash) return json({ error: '认领码无效', code: 'nocred' }, 401)
  }
  const isMine = (e) => (who ? e && e.ownerUser === who.uid : e && e.owner === hash)

  if (action === 'list') {
    const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
    const mine = entries
      .filter(isMine)
      .map((e) => ({
        time: e.time,
        workName: e.workName || '',
        author: e.author || '',
        size: e.size === 32 || e.size === 64 ? e.size : 16,
        type: e.type,
        likes: e.likes || 0,
        // 缩略图需要像素数据；只给自己人看，不对外暴露
        pixels: e.pixels,
      }))
      .sort((a, b) => b.time - a.time)
    return json({ ok: true, works: mine, total: mine.length })
  }

  if (action === 'stats') {
    const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
    const mine = entries.filter(isMine)

    // 统计真正「画了东西」的格子：与画布默认白底不同的都算
    let cells = 0
    const days = new Set()
    let likes = 0
    let best = null
    let first = 0
    let last = 0
    const sizeCount = { 16: 0, 32: 0, 64: 0 }

    for (const e of mine) {
      const t = Number(e.time) || 0
      if (t) {
        days.add(new Date(t).toDateString())
        if (!first || t < first) first = t
        if (t > last) last = t
      }
      likes += Number(e.likes) || 0
      const s = e.size === 32 || e.size === 64 ? e.size : 16
      sizeCount[s] = (sizeCount[s] || 0) + 1
      const px = Array.isArray(e.pixels) ? e.pixels : []
      for (const p of px) {
        if (!Array.isArray(p) || p.length < 3) continue
        // 接近纯白视为底色，不计入
        if (p[0] > 246 && p[1] > 246 && p[2] > 246) continue
        cells += 1
      }
      if (!best || (Number(e.likes) || 0) > (Number(best.likes) || 0)) {
        best = { time: t, workName: e.workName || '', likes: Number(e.likes) || 0, size: s }
      }
    }

    return json({
      ok: true,
      stats: {
        works: mine.length,
        likes,
        cells,
        days: days.size,
        sizeCount,
        best,
        first,
        last,
        // 精确到「天」的连续创作天数
        spanDays: first && last
          ? Math.max(1, Math.round((new Date(last).setHours(0, 0, 0, 0) - new Date(first).setHours(0, 0, 0, 0)) / 86400000) + 1)
          : 0,
      },
    })
  }

  if (action === 'delete') {
    const time = Number(body.time)
    if (!Number.isFinite(time) || time <= 0) return json({ error: '缺少作品时间戳' }, 400)

    const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
    const target = entries.find((e) => e && e.time === time)
    if (!target) return json({ error: '作品不存在或已被删除' }, 404)
    if (!isMine(target)) {
      return json({ error: '只能删除自己的作品' }, 403)
    }

    await removeByTime(env.LIGHTFIELD_KV, time)
    // 认领码时代有计数要一起减；账号作品没有这个计数
    if (!who && hash) await bumpWorks(env.LIGHTFIELD_KV, hash, -1)
    return json({ ok: true, time })
  }

  return json({ error: '未知操作' }, 400)
}
