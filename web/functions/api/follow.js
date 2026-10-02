// 关注与好友
//
//   GET  ?uid=xxx            某个人的关注状态（关注数/粉丝数/是否已关注/是否好友）
//   GET  ?type=following     我关注的人
//   GET  ?type=followers     关注我的人
//   POST {action:'follow',   uid}  关注
//   POST {action:'unfollow', uid}  取关
//
// 好友 = 互相关注。不用另建一套好友关系：
// 「我关注了他」且「他关注了我」就是好友，两边算出来的结果必然一致。
import { readActiveUser, readUser, readUserByName, BANNED_ERROR } from './_auth.js'
import { isBanned } from './_auth.js'

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

/** 关注的存储键。用 uid 排序拼接，保证 A→B 和 B→A 是两条独立记录 */
const F_KEY = (a, b) => 'follow:' + [a, b].sort().join('|')
const RE = /^[A-Za-z0-9_-]{1,40}$/

/** 读某人的关注集合（他关注了谁 / 谁关注了他） */
async function readSet(kv, key) {
  const raw = await kv.get(key)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

const OUT_KEY = (uid) => 'follow-out:' + uid
const IN_KEY = (uid) => 'follow-in:' + uid

/**
 * 关注是有向的：A 关注 B 要同时写两条 ——
 *   A 的「我关注的人」加 B
 *   B 的「关注我的人」加 A
 * 只写一条的话，「我关注的人」和「关注我的人」会对不上。
 */
async function addFollow(kv, a, b) {
  const out = await readSet(kv, OUT_KEY(a))
  if (out.indexOf(b) < 0) {
    out.push(b)
    await kv.put(OUT_KEY(a), JSON.stringify(out.slice(-500)))
  }
  const inn = await readSet(kv, IN_KEY(b))
  if (inn.indexOf(a) < 0) {
    inn.push(a)
    await kv.put(IN_KEY(b), JSON.stringify(inn.slice(-500)))
  }
}

async function removeFollow(kv, a, b) {
  const out = (await readSet(kv, OUT_KEY(a))).filter((x) => x !== b)
  await kv.put(OUT_KEY(a), JSON.stringify(out))
  const inn = (await readSet(kv, IN_KEY(b))).filter((x) => x !== a)
  await kv.put(IN_KEY(b), JSON.stringify(inn))
}

/** 把 uid 列表补上用户名/头像/简介，顺带算出其中有几个是好友 */
async function decorate(kv, uids, meUid) {
  const out = []
  const myOut = meUid ? await readSet(kv, OUT_KEY(meUid)) : []
  for (const uid of uids.slice(0, 100)) {
    const u = await readUser(kv, uid)
    if (!u) continue
    // 被封禁 / 注销的账号不往外露
    if (isBanned(u)) continue
    out.push({
      uid: u.uid,
      username: u.username,
      bio: u.bio || '',
      createdAt: u.createdAt || 0,
      following: myOut.indexOf(uid) >= 0,
    })
  }
  return out
}

/** 统计某人被关注 / 关注了多少 */
export async function followStats(kv, uid) {
  const [out, inn] = await Promise.all([readSet(kv, OUT_KEY(uid)), readSet(kv, IN_KEY(uid))])
  return { following: out.length, followers: inn.length }
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const kv = env.LIGHTFIELD_KV
  const url = new URL(request.url)
  const who = await readActiveUser(env, '', request.headers.get('authorization'))

  const type = url.searchParams.get('type')
  // 我的关注 / 粉丝：必须登录
  if (type === 'following' || type === 'followers') {
    if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
    if (who.banned) return json(BANNED_ERROR, 403)
    const uids = await readSet(kv, type === 'following' ? OUT_KEY(who.uid) : IN_KEY(who.uid))
    return json({ ok: true, type, total: uids.length, list: await decorate(kv, uids, who.uid) })
  }

  /* 待通过的好友申请：关注了我、但我还没回关的人。
     语义上「我关注你」= 发出好友申请，「我们互相关注」= 成为好友，
     所以这里就是「谁想加你」。对方主页点一下「加好友」即可通过。 */
  if (type === 'pending') {
    if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
    if (who.banned) return json(BANNED_ERROR, 403)
    const followers = await readSet(kv, IN_KEY(who.uid))
    const mine = await readSet(kv, OUT_KEY(who.uid))
    const pend = followers.filter((u) => mine.indexOf(u) < 0)
    return json({ ok: true, type: 'pending', total: pend.length, list: await decorate(kv, pend, who.uid) })
  }

  // 查某个人的公开关注数（不登录也能看）
  const uid = (url.searchParams.get('uid') || '').trim()
  const name = (url.searchParams.get('name') || '').trim()
  if (!uid && !name) return json({ error: '缺少 uid 或 name' }, 400)
  const target = uid ? await readUser(kv, uid) : await readUserByName(kv, name)
  if (!target || isBanned(target)) return json({ error: '没有这个用户' }, 404)

  const stats = await followStats(kv, target.uid)
  let following = false
  let friend = false
  if (who && who.uid !== target.uid) {
    const myOut = await readSet(kv, OUT_KEY(who.uid))
    following = myOut.indexOf(target.uid) >= 0
    const hisOut = await readSet(kv, OUT_KEY(target.uid))
    // 互相都关注 = 好友
    friend = following && hisOut.indexOf(who.uid) >= 0
  }

  return json({
    ok: true,
    uid: target.uid,
    username: target.username,
    following: stats.following,
    followers: stats.followers,
    iFollow: following,
    friend,
    isMe: who ? who.uid === target.uid : false,
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

  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const action = String((body && body.action) || '')
  if (action !== 'follow' && action !== 'unfollow') return json({ error: '未知操作' }, 400)

  const uid = String((body && body.uid) || '').trim()
  if (!RE.test(uid)) return json({ error: '缺少或非法的 uid' }, 400)
  if (uid === who.uid) return json({ error: '不能关注自己' }, 400)

  const target = await readUser(env.LIGHTFIELD_KV, uid)
  if (!target || isBanned(target)) return json({ error: '没有这个用户' }, 404)


  if (action === 'follow') await addFollow(env.LIGHTFIELD_KV, who.uid, uid)
  else await removeFollow(env.LIGHTFIELD_KV, who.uid, uid)

  const myOut = await readSet(env.LIGHTFIELD_KV, OUT_KEY(who.uid))
  const hisOut = await readSet(env.LIGHTFIELD_KV, OUT_KEY(uid))
  const friend = myOut.indexOf(uid) >= 0 && hisOut.indexOf(who.uid) >= 0

  return json({
    ok: true,
    action,
    uid,
    iFollow: myOut.indexOf(uid) >= 0,
    friend,
    following: myOut.length,
    followers: hisOut.length,
  })
}
