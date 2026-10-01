// 成就接口（登录用户）
//
//   GET   取成就列表与进度
//   POST  {action:'sync'}  重新统计并解锁新达成的成就
//
// 指标全部从作品历史实时算，不单独维护计数，所以不会出现
// 「成就说 20 幅、作品列表只有 18 幅」这种对不上的情况。
import { readActiveUser, BANNED_ERROR } from './_auth.js'
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

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV
  const unlocked = await readUnlocked(kv, who.uid)
  const book = await readBook(kv, who.uid)
  const { entries } = await readAllHistory(kv)
  const mine = entries.filter((e) => e && e.ownerUser === who.uid)
  const metrics = computeMetrics(mine, book, who.user)

  return json({ ok: true, ...view(unlocked), metrics, book: publicView(book) })
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
    const metrics = computeMetrics(mine, book, who.user)
    const { fresh } = diffUnlock(metrics, { ...unlocked })
    return json({ ok: true, ...view({ ...unlocked }), fresh, metrics })
  }

  if (action !== 'sync') return json({ error: '未知操作' }, 400)

  const before = await readUnlocked(kv, who.uid)
  const book0 = await readBook(kv, who.uid)
  const { entries } = await readAllHistory(kv)
  const mine = entries.filter((e) => e && e.ownerUser === who.uid)
  const metrics = computeMetrics(mine, book0, who.user)

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
