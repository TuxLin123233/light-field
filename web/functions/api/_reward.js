// 排名奖励：每日挑战榜 + 每周主题赛，发的是光尘
//
// 为什么用「惰性结算」而不是定时任务：
//   Cloudflare Pages Functions 没有 cron，而等到新一期开始时再结算上一期，
//   效果和定时任务一样（只要有人来看榜就会结算），但不依赖外部调度。
//   即使当天没人访问，奖励也只是延后发放，不会丢。
//
// 为什么必须幂等：
//   结算可能被触发很多次（每次刷榜都会检查）。用
//   rwd:<kind>:<period>:<uid> 标记「这个用户在这一期领过」，
//   保证光尘只发一次。已发的记录同时留档，便于对账。
//
// 只发给有账号的作品（ownerUser）：认领码时代的老作品没有账号可入账，
// 不能凭空建账本发币，那等于无中生有。

import { creditDust } from './_dust.js'
import { deliver } from './_mail.js'
import { dayIndex } from './_daily.js'
import { mondayStart, WEEK_MS, TZ, weekIdOf } from './_contest.js'

/* 每日挑战榜奖励 */
export const DAILY_REWARDS = [
  { rank: 1, dust: 10, label: '每日冠军' },
  { rank: 2, dust: 6, label: '每日亚军' },
  { rank: 3, dust: 3, label: '每日季军' },
  { rank: 0, dust: 1, label: '每日榜前 10' },
]

/* 每周主题赛奖励 */
export const WEEKLY_REWARDS = [
  { rank: 1, dust: 50, label: '本周冠军' },
  { rank: 2, dust: 30, label: '本周亚军' },
  { rank: 3, dust: 20, label: '本周季军' },
  { rank: 0, dust: 5, label: '本周榜前 10' },
]

const DAILY_TOP = 10
const WEEKLY_TOP = 10
const KIND = { daily: 'd', weekly: 'w' }

const payKey = (kind, period, uid) => 'rwd:' + kind + ':' + period + ':' + uid

/** 东八区某一天 [start, end) 的时间范围 */
export function dayRange(dayId) {
  const n = Number(String(dayId).replace(/^D/, ''))
  if (!Number.isFinite(n)) return null
  const start = n * 86400000 - TZ
  return { start, end: start + 86400000 }
}

export function todayId() {
  return 'D' + dayIndex()
}

/** 按名次查奖励；rank=0 表示「进榜但没进前三」 */
function rewardFor(table, rank) {
  for (const r of table) {
    if (r.rank === rank) return r
  }
  const tail = table.find((r) => r.rank === 0)
  return rank <= 10 ? tail : null
}

/**
 * 结算一期榜单。
 * entries 需按 rank 顺序给出 [{ uid, time, workName }]
 * 返回 { paid: [{uid, dust, rank, label}], skipped }
 */
export async function settle(kv, kind, period, table, ranked) {
  const paid = []
  let skipped = 0
  const k = KIND[kind] || kind

  for (let i = 0; i < ranked.length; i++) {
    const item = ranked[i]
    const uid = String((item && item.uid) || '')
    if (!uid) {
      skipped++
      continue
    }
    const rank = i + 1
    const r = rewardFor(table, rank)
    if (!r) continue

    // 已经发过这一期就不再发
    const done = await kv.get(payKey(k, period, uid))
    if (done) {
      skipped++
      continue
    }

    await creditDust(kv, uid, r.dust)
    await kv.put(payKey(k, period, uid), String(r.dust))

    // 同时发一封信，进信箱后在站内也能看到
    await deliver(kv, uid, {
      id: 'reward-' + k + '-' + period + '-' + uid,
      claimId: 'reward-' + k + '-' + period,
      kind: 'attach',
      icon: kind === 'daily' ? '🏅' : '🏆',
      title: r.label + '！奖励 ' + r.dust + ' 个光尘',
      body:
        (kind === 'daily' ? '每日挑战榜' : '每周主题赛') +
        '（' + period + '）第 ' + rank + ' 名，' +
        r.dust + ' 个光尘已经放进你的账本。',
      dust: 0, // 已直接入账，信件不再重复发附件
    })

    paid.push({ uid, dust: r.dust, rank, label: r.label, workName: item.workName || '' })
  }

  return { paid, skipped, period }
}

/** 从作品列表里取出带账号的作品并按分数排序 */
export function rankEntries(entries, periodStart, periodEnd, scoreKey) {
  const out = []
  for (const e of entries) {
    if (!e || !Array.isArray(e.pixels)) continue
    const t = Number(e.time) || 0
    if (!t || t < periodStart || t >= periodEnd) continue
    if (!e.ownerUser) continue
    const score = Number(e[scoreKey]) || 0
    out.push({ uid: String(e.ownerUser), score, time: t, workName: e.workName || e.author || '' })
  }
  // 分数高的在前；同分时早发布的排前面（先到先得，不靠运气）
  out.sort((a, b) => (b.score - a.score) || (a.time - b.time))
  return out.slice(0, 10)
}

/** 结算上一期每日榜 */
export async function settleDaily(kv, entries, now = Date.now()) {
  const prev = 'D' + (dayIndex(new Date(now)) - 1)
  const range = dayRange(prev)
  if (!range) return { paid: [], skipped: 0, period: prev }
  const ranked = rankEntries(entries, range.start, range.end, 'likes')
  if (!ranked.length) return { paid: [], skipped: 0, period: prev }
  return settle(kv, 'daily', prev, DAILY_REWARDS, ranked)
}

/** 结算上一期周赛 */
export async function settleWeekly(kv, entries, now = Date.now()) {
  const prevMonday = mondayStart(now) - WEEK_MS
  const period = weekIdOf(prevMonday)
  const pool = entries.filter((e) => e && e.contest === period)
  if (!pool.length) return { paid: [], skipped: 0, period }
  const ranked = rankEntries(pool, prevMonday, prevMonday + WEEK_MS, 'contestVotes')
  if (!ranked.length) return { paid: [], skipped: 0, period }
  return settle(kv, 'weekly', period, WEEKLY_REWARDS, ranked)
}

/** 某人某期是否已发过 */
export async function alreadyPaid(kv, kind, period, uid) {
  const v = await kv.get(payKey(KIND[kind] || kind, period, String(uid || '')))
  return v ? Number(v) || 0 : 0
}
