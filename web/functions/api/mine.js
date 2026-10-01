// 「我自己的作品」：列出 / 统计 / 删除。
// 归属只看登录账号（ownerUser）。认领码那套已整体移除，
// 账号系统之前发布的老作品没有 ownerUser，属于无人认领的历史数据。
// ownerUser 字段绝不对外暴露。
import { readAllHistory, removeByTime } from './_history.js'
import { readActiveUser, pickToken, BANNED_ERROR } from './_auth.js'
import { migrateClaimWorks } from './_claimmigrate.js'

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

  const who = await readActiveUser(env, pickToken(request, body), request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)
  const isMine = (e) => e && e.ownerUser === who.uid

  /* 一次性迁移：把认领码时代的老作品归到当前账号。
     浏览器里那把钥匙（localStorage.paintClaim）还在的话，
     交上来就能把哈希对上的老作品一次性收回来。 */
  if (action === 'migrate-claim') {
    const r = await migrateClaimWorks(env.LIGHTFIELD_KV, who.uid, body && body.code)
    if (!r.ok) return json({ error: r.error }, 400)
    return json({ ok: true, moved: r.moved, alreadyMine: r.alreadyMine })
  }

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

    /* 统计真正「画了东西」的格子：与画布默认白底不同的都算。
       cellsToday 只算「今天发布」的作品 —— 用户看到的是「我今天画了多少」，
       不是历史累计（累计值以前叫「绘制格数」，数字只涨不掉，没法当进度看）。 */
    let cells = 0
    let cellsToday = 0
    const todayKey = new Date().toDateString()
    let worksToday = 0
    const days = new Set()
    let likes = 0
    let best = null
    let first = 0
    let last = 0
    const sizeCount = { 16: 0, 32: 0, 64: 0 }

    for (const e of mine) {
      const t = Number(e.time) || 0
      let isToday = false
      if (t) {
        isToday = new Date(t).toDateString() === todayKey
        days.add(new Date(t).toDateString())
        if (!first || t < first) first = t
        if (t > last) last = t
      }
      if (isToday) worksToday += 1
      likes += Number(e.likes) || 0
      const s = e.size === 32 || e.size === 64 ? e.size : 16
      sizeCount[s] = (sizeCount[s] || 0) + 1
      const px = Array.isArray(e.pixels) ? e.pixels : []
      for (const p of px) {
        if (!Array.isArray(p) || p.length < 3) continue
        // 接近纯白视为底色，不计入
        if (p[0] > 246 && p[1] > 246 && p[2] > 246) continue
        cells += 1
        if (isToday) cellsToday += 1
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
        cellsToday,
        worksToday,
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
    return json({ ok: true, time })
  }

  return json({ error: '未知操作' }, 400)
}
