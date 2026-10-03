import { checkOrigin } from './_origin.js'
// 成就接口（登录用户）
//
//   GET   取成就列表与进度
//   POST  {action:'sync'}  重新统计并解锁新达成的成就
//
// 指标全部从作品历史实时算，不单独维护计数，所以不会出现
// 「成就说 20 幅、作品列表只有 18 幅」这种对不上的情况。
import { readActiveUser, readUser, isBanned, BANNED_ERROR } from './_auth.js'
import { readAllHistory } from './_history.js'
import { readBook, writeBook, publicView } from './_dust.js'
import { computeMetrics, diffUnlock, view, SIGN_MILESTONES } from './_achieve.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const ACH_KEY = (uid) => 'ach:' + uid

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

async function readUnlocked(kv, uid) {
  const raw = await kv.get(ACH_KEY(uid))
  try {
    const o = JSON.parse(raw || '{}')
    return o && typeof o === 'object' ? o : {}
  } catch (e) {
    return {}
  }
}

async function writeUnlocked(kv, uid, obj) {
  await kv.put(ACH_KEY(uid), JSON.stringify(obj))
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/* 读冒险世界那份存档（/api/towngame 写进去的 lw-town-save）。
   成就里的「冒险世界」那一组指标就靠它。
   读不到就当没有，不影响别的成就。 */
async function readTown(kv, uid) {
  if (!kv || !uid) return null
  try {
    const raw = await kv.get('townsave:' + uid)
    if (!raw) return null
    const o = JSON.parse(raw)
    // 存档可能被包了一层（towngame 那边存的是 { world: ... } 或者直接是存档体）
    if (o && o.world) return o
    if (o && o.run) return { world: o }
    return o || null
  } catch (e) {
    return null
  }
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  const kv = env.LIGHTFIELD_KV
  const url = new URL(request.url)
  const who = await readActiveUser(env, '', request.headers.get('authorization'))

  /* 看别人的成就墙：只读的公开信息，不给光尘余额和签到状态。
     别人的解锁记录和创作数据都是公开的（作品本身就在社区里），
     但不发奖、不给任何写操作。 */
  const wantUid = (url.searchParams.get('uid') || '').trim()
  if (wantUid) {
    // 看自己时 who.user 里就有记录，省一次读；看别人必须查
    const u = who && who.uid === wantUid ? who.user : await readUser(kv, wantUid)
    if (!u || isBanned(u)) return json({ error: '没有这个用户' }, 404)
    const unlocked = await readUnlocked(kv, wantUid)
    const book = await readBook(kv, wantUid)
    const { entries } = await readAllHistory(kv)
    const theirs = entries.filter((e) => e && e.ownerUser === wantUid)
    const metrics = computeMetrics(theirs, book, u, await readTown(kv, wantUid))
    // 只给展示用的字段：不给 book（余额/签到是私事），也不触发发奖
    const v = view(unlocked)
    return json({
      ok: true,
      uid: wantUid,
      username: u.username,
      total: v.total,
      unlocked: v.unlocked,
      categories: v.categories,
      items: v.items,
      metrics,
    })
  }

  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const unlocked = await readUnlocked(kv, who.uid)
  const book = await readBook(kv, who.uid)
  const { entries } = await readAllHistory(kv)
  const mine = entries.filter((e) => e && e.ownerUser === who.uid)
  const metrics = computeMetrics(mine, book, who.user, await readTown(kv, who.uid))

  return json({ ok: true, ...view(unlocked), metrics, book: publicView(book) })
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

  const who = await readActiveUser(env, body && body.token, request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV
  const action = (body && body.action) || ''

  // 传 seed 用于未登录时预览（只读，不写任何数据）
  if (action === 'preview') {
    const unlocked = (body && body.unlocked) || {}
    const { entries } = await readAllHistory(kv)
    const mine = entries.filter((e) => e && e.ownerUser === who.uid)
    const book = await readBook(kv, who.uid)
    const metrics = computeMetrics(mine, book, who.user, await readTown(kv, who.uid))
    const { fresh } = diffUnlock(metrics, { ...unlocked })
    return json({ ok: true, ...view({ ...unlocked }), fresh, metrics })
  }

  if (action !== 'sync') return json({ error: '未知操作' }, 400)

  const before = await readUnlocked(kv, who.uid)
  const book0 = await readBook(kv, who.uid)
  const { entries } = await readAllHistory(kv)
  const mine = entries.filter((e) => e && e.ownerUser === who.uid)
  const metrics = computeMetrics(mine, book0, who.user, await readTown(kv, who.uid))

  const { unlocked, fresh } = diffUnlock(metrics, before)
  await writeUnlocked(kv, who.uid, unlocked)

  // 新解锁的成就在这里发奖；同一成就只发一次（diffUnlock 已保证）
  let book = book0
  let reward = 0
  if (fresh.length) {
    book = { ...book0, bal: book0.bal }
    for (const a of fresh) reward += Number(a.reward) || 0
    if (reward > 0) {
      book.bal = book0.bal + reward
      book = await writeBook(kv, who.uid, book)
    }
  }

  return json({
    ok: true,
    ...view(unlocked),
    fresh,
    reward,
    metrics,
    book: publicView(book),
  })
}

export { SIGN_MILESTONES }
