// 每日任务
//
//   GET  今天派了哪 5 个、每个的进度、哪些已领
//   POST {action:'claim', id}  领一个任务的光尘
//
// 领取记录按「期号 + 任务 id」存，所以同一天重复领同一个任务直接被拒，
// 换一天（换一组任务）就能再领。领完光尘直接进账本，同时寄一封信。
import { readActiveUser, BANNED_ERROR } from './_auth.js'
import { readBook, creditDust, publicView } from './_dust.js'
import { computeMetrics } from './_achieve.js'
import { recentHistory } from './_history.js'
import { readAvatar } from './_avatar.js'
import { deliver } from './_mail.js'
import { TASKS, PER_DAY, TOTAL, periodOf, todaysTasks, viewTasks } from './_dailytask.js'

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

const CLAIM_KEY = (uid, period) => 'dtask:' + uid + ':' + period

/** 读这个期号已领了哪些任务 */
async function readClaims(kv, uid, period) {
  const raw = await kv.get(CLAIM_KEY(uid, period))
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.map(String) : []
  } catch {
    return []
  }
}

/** 组出这个账号当前的指标，额外补两个任务专用字段 */
async function metricsFor(kv, uid, user) {
  const [book, av, { entries }] = await Promise.all([
    readBook(kv, uid),
    readAvatar(kv, uid),
    recentHistory(kv, { limit: 400 }),
  ])
  const m = computeMetrics(entries, book, user)
  // 这两个不在成就指标里，但任务要用
  m.hasAvatar = av ? 1 : 0
  m.hasBio = user && user.bio ? 1 : 0
  return { metrics: m, book }
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV
  const period = periodOf()
  const [{ metrics, book }, claimed] = await Promise.all([
    metricsFor(kv, who.uid, who.user),
    readClaims(kv, who.uid, period),
  ])
  const items = viewTasks(todaysTasks(), metrics, claimed)
  const claimable = items.filter((i) => i.done && !i.claimed).length

  return json({
    ok: true,
    period,
    perDay: PER_DAY,
    total: TOTAL,
    items,
    claimed: claimed.length,
    gotToday: items.filter((i) => i.claimed).reduce((a, i) => a + i.dust, 0),
    claimable,
    book: publicView(book),
  })
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
  const action = String((body && body.action) || '')
  if (action !== 'claim') return json({ error: '未知操作' }, 400)

  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const id = String((body && body.id) || '').trim()
  const kv = env.LIGHTFIELD_KV
  const period = periodOf()
  const todays = todaysTasks()
  const task = todays.find((t) => t.id === id)
  if (!task) return json({ error: '今天没有这个任务' }, 400)

  const claimed = await readClaims(kv, who.uid, period)
  if (claimed.includes(id)) return json({ error: '这个任务今天已经领过了', code: 'dup' }, 409)

  const { metrics, book } = await metricsFor(kv, who.uid, who.user)
  const cur = task.bool ? (metrics[task.metric] ? 1 : 0) : Number(metrics[task.metric]) || 0
  if (cur < task.target) {
    return json({
      error: '还没达成：' + task.text,
      code: 'unmet',
      progress: Math.min(cur, task.target),
      target: task.target,
    }, 400)
  }

  // 先记账再加领取记录：即使第二步失败，钱也到了，不会白做一次任务
  const after = await creditDust(kv, who.uid, task.dust)
  claimed.push(id)
  await kv.put(CLAIM_KEY(who.uid, period), JSON.stringify(claimed))

  try {
    await deliver(kv, who.uid, {
      id: 'dtask-' + period + '-' + id,
      claimId: 'dtask-' + period + '-' + id,
      kind: 'text', // 光尘已直接入账，这封信只是通知
      icon: '📋',
      title: '每日任务完成：' + task.text,
      body: '奖励 ' + task.dust + ' 个光尘已经放进你的账本。每天会派 5 个新任务，明天记得回来。',
      dust: 0,
    })
  } catch (e) {
    // 寄信失败不影响发奖
  }

  const items = viewTasks(todays, metrics, claimed)
  return json({
    ok: true,
    id,
    dust: task.dust,
    book: publicView(after || book),
    claimed: claimed.length,
    gotToday: items.filter((i) => i.claimed).reduce((a, i) => a + i.dust, 0),
    items,
  })
}
