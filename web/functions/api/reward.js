// 排名奖励接口
//
//   GET  ?type=daily|weekly   查看某期的榜单与奖励规则（同时触发上一期结算）
//   GET  ?type=my             我拿过哪些奖励
//
// 结算说明见 _reward.js：惰性结算，靠 rwd:<kind>:<period>:<uid> 保证只发一次。
import { readActiveUser, BANNED_ERROR } from './_auth.js'
import { readAllHistory } from './_history.js'
import { readBook, publicView } from './_dust.js'
import {
  DAILY_REWARDS,
  WEEKLY_REWARDS,
  settleDaily,
  settleWeekly,
  rankEntries,
  alreadyPaid,
  dayRange,
  dayStamp,
  periodId,
} from './_reward.js'
import { contestInfo, mondayStart, weekIdOf, WEEK_MS } from './_contest.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const kv = env.LIGHTFIELD_KV
  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'weekly'

  const { entries } = await readAllHistory(kv)

  // 顺带结算上一期：只要有人看榜就会结算，不依赖定时任务
  const settled = {
    daily: await settleDaily(kv, entries),
    weekly: await settleWeekly(kv, entries),
  }

  const who = await readActiveUser(env, '', request.headers.get('authorization'))

  if (type === 'my') {
    if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
    const mine = []
    let cursor
    for (let i = 0; i < 10; i++) {
      const page = await kv.list({ prefix: 'rwd:', cursor })
      for (const k of page.keys || []) {
        if (!k.name.endsWith(':' + who.uid)) continue
        const parts = k.name.split(':')
        mine.push({ kind: parts[1], period: parts[2], dust: Number(await kv.get(k.name)) || 0 })
      }
      if (!page.list_complete && page.cursor) cursor = page.cursor
      else break
    }
    mine.sort((a, b) => (a.period < b.period ? 1 : -1))
    const book = await readBook(kv, who.uid)
    return json({ ok: true, awards: mine, book: publicView(book), ...settled })
  }

  if (type === 'daily') {
    const cur = dayStamp()
    const range = dayRange(cur)
    const today = periodId(cur)
    const ranked = rankEntries(entries, range.start, range.end, 'likes')
    const myPaid = who ? await alreadyPaid(kv, 'daily', periodId(cur - 1), who.uid) : 0
    return json({
      ok: true,
      type: 'daily',
      period: today,
      periodLabel: today,
      rules: DAILY_REWARDS,
      board: ranked.map((r, i) => ({
        rank: i + 1,
        uid: r.uid,
        score: r.score,
        workName: r.workName,
        // 只回 uid 用来对号入座，昵称由前端自己那份列表渲染
        mine: who ? r.uid === who.uid : false,
      })),
      top: 10,
      prevSettled: settled.daily.period,
      myPrevAward: myPaid,
    })
  }

  const info = contestInfo()
  const monday = mondayStart()
  const pool = entries.filter((e) => e && e.contest === info.week)
  const ranked = rankEntries(pool, monday, monday + WEEK_MS, 'contestVotes')
  const prevWeek = weekIdOf(monday - WEEK_MS).week.week
  const myPaid = who ? await alreadyPaid(kv, 'weekly', prevWeek, who.uid) : 0
  return json({
    ok: true,
    type: 'weekly',
    period: info.week,
    periodLabel: info.week,
    theme: info.theme,
    start: info.start,
    end: info.end,
    rules: WEEKLY_REWARDS,
    board: ranked.map((r, i) => ({
      rank: i + 1,
      uid: r.uid,
      score: r.score,
      workName: r.workName,
      mine: who ? r.uid === who.uid : false,
    })),
    top: 10,
    prevPeriod: prevWeek,
    prevSettled: settled.weekly.period,
    myPrevAward: myPaid,
  })
}
