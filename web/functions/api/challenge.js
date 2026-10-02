// 每日挑战 API：GET 看今日题目与当日榜；POST 报名（写入 daily 字段）
import { readAllHistory, markByTime, findByTime } from './_history.js'
import { dailyInfo, todayId } from './_daily.js'

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

function norm(e) {
  return {
    workName: e.workName || '',
    author: e.author || '',
    pixels: e.pixels,
    size: e.size === 32 || e.size === 64 ? e.size : 16,
    time: e.time,
    likes: e.likes || 0,
    type: e.type,
    fromImage: e.fromImage ? true : undefined,
    tags: Array.isArray(e.tags) ? e.tags.slice(0, 6) : undefined,
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { env, request } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  const info = dailyInfo()
  const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
  const todays = entries
    .filter((e) => e && e.daily === info.day && Array.isArray(e.pixels))
    .map(norm)
    .sort((a, b) => b.likes - a.likes || b.time - a.time)

  const url = new URL(request.url)
  const top = Math.min(Number(url.searchParams.get('top')) || 12, 30)

  return json({
    ok: true,
    day: info.day,
    theme: info.theme,
    start: info.start,
    end: info.end,
    total: todays.length,
    works: todays.slice(0, top),
  })
}

/* 重力绘画不参加任何比赛，每日挑战也一样（与 set.js 里拦 contest 同理：
   颗粒往下堆，裁剪后构图随机，跟每日题目对不上）。
   前端本来就不发这个请求，这里再挡一道 —— 改个请求就绕过去了。 */
const INK_BLOCKED = new Set(['gravity'])

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const time = Number(body && body.time)
  if (!Number.isFinite(time) || time <= 0) return json({ error: '缺少作品时间戳' }, 400)

  const day = todayId()

  /* 先查这幅画是什么方向画的，确认能报名了再写 daily 标记。

     不能反过来：markByTime 是直接写入的，跑完再判断就撤不回来了
     （要撤还得再写一次，等于给 KV 加一次无谓的写）。
     所以这里先用 findByTime 只读地看一眼。 */
  const peek = await findByTime(env.LIGHTFIELD_KV, time)
  if (!peek.found) return json({ error: '作品不存在' }, 404)
  const ink = peek.last && peek.last.ink
  if (ink && INK_BLOCKED.has(ink)) {
    return json({ error: '像素重力的画不参加每日挑战，换个方向画就能报名了' }, 400)
  }
  if (peek.last && peek.last.daily) return json({ error: '这件作品已经参加过挑战了' }, 409)

  const res = await markByTime(env.LIGHTFIELD_KV, time, 'daily', day)
  if (!res.found) return json({ error: '作品不存在' }, 404)

  return json({ ok: true, day })
}
