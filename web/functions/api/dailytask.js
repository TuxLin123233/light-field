import { checkOrigin } from './_origin.js'
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
import { readHouse, readMsgs, surfaceById, furnitureById, DEFAULT_WALL, DEFAULT_FLOOR } from './_town.js'
import { readBag } from './_craft.js'
import { followStats } from './_follow.js'
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

/** 组出这个账号当前的指标，额外补一批「任务专用字段」。

    成就指标（computeMetrics）只认作品历史和光尘账本，
    而小镇、商店、好友这些数据各存在自己的 key 里、彼此不通 ——
    所以这里按「一个指标一次读」的原则补进去，读法与 town/craft/follow
    保持一致（宁可读各自的原始记录，也不给它们另建一份汇总，
    省一次写、也不会和真实数据对不上）。

    全部并发读，多加几个指标不会让接口变慢。 */
async function metricsFor(kv, uid, user) {
  const [book, av, { entries }, house, bag, follow, msgs] = await Promise.all([
    readBook(kv, uid),
    readAvatar(kv, uid),
    recentHistory(kv, { limit: 400 }),
    readHouse(kv, uid),
    readBag(kv, uid),
    followStats(kv, uid),
    readMsgs(kv, uid),
  ])
  const m = computeMetrics(entries, book, user)

  /* 这两个不在成就指标里，但任务要用 */
  m.hasAvatar = av ? 1 : 0
  m.hasBio = user && user.bio ? 1 : 0

  /* 小镇与商店。owned 里塞着白送的墙纸地板（readHouse 会补），
     所以比较时要用「同一种东西算一个」，别把白送的算进家具件数。 */
  const ownedFurn = (house.owned || []).filter((x) => x && !isSurfaceId(x)).length
  m.furnOwned = ownedFurn
  m.furnPlaced = (house.items || []).length
  // 房子多大看的是 size（格数），跟摆了几件家具没关系。
  // 之前这里复制粘贴成了 items.length，于是「把房子升级到 24 格」
  // 和「摆 24 件家具」永远同时完成，升级任务形同虚设。
  m.houseSize = house.size
  m.hasWallpaper = hasCustomSurface(house) ? 1 : 0

  /* 材料：累计捡到过多少。背包只存「当前持有」，
     用完了会归零，所以这里只能表达「手里攒过多少」，
     不是历史总量 —— 名字也就叫 matsHeld，别写成 matsTotal 骗人。 */
  let matsHeld = 0
  const bagMat = (bag && bag.mat) || {}
  for (const k in bagMat) {
    const n = Number(bagMat[k])
    if (Number.isFinite(n) && n > 0) matsHeld += n
  }
  m.matsHeld = matsHeld
  m.hasCrystal = bagMat.crystal ? 1 : 0

  /* 社交。follow-out/in 是两把独立的集合，串门数没法从上面推 ——
     「被串门」这件事只留在别人家的留言板上，我们自己这边查不到，
     所以不编一个假的「串门次数」指标出来。 */
  m.friendsOut = (follow && follow.following) || 0
  m.friendsIn = (follow && follow.followers) || 0
  m.msgGot = (msgs || []).length

  return { metrics: m, book }
}

/** owned 里混着家具 id 和贴面 id，家具件数要排除后者 */
function isSurfaceId(id) {
  return !!(surfaceById(id) && !furnitureById(id))
}

function hasCustomSurface(house) {
  const w = surfaceById(house.wall)
  const f = surfaceById(house.floor)
  // 默认那两套不算「换过」，非默认才算
  return !!(w && w.id !== DEFAULT_WALL) || !!(f && f.id !== DEFAULT_FLOOR)
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
  // 改状态的请求必须来自本站
  {
    const g = checkOrigin(request)
    if (!g.ok) return json(g.body, g.status)
  }
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
