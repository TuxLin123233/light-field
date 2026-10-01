// 私信（非实时）
//
//   GET  ?with=<uid>            我和某个人的对话
//   GET  ?type=list              我的会话列表（最近一条 + 未读数）
//   POST {action:'send', to, text}   发一条
//   POST {action:'read', with}        标记已读
//   POST {action:'del', with}         清掉我和某人的对话
//
// 只有好友之间能私信（互相关注），陌生人发不出去。
// 「非实时」的含义：不轮询、不推送、没有在线状态。
// 对方发的新消息要自己点「刷新」才拉得到 —— 这一点在前端也写明了。
import { readActiveUser, readUser, isBanned, BANNED_ERROR } from './_auth.js'

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

const RE = /^[A-Za-z0-9_-]{1,40}$/
const MAX_LEN = 300
const MAX_KEEP = 200 // 每个会话保留多少条
const OUT_KEY = (uid) => 'follow-out:' + uid
const BOX_KEY = (a, b) => 'chat:' + [a, b].sort().join('|')
/* 已读位置必须按「谁看的」区分。
   之前写成了排序后的对称 key，结果 A 已读和 B 已读用的是同一条记录 ——
   B 明明一条没看过，只要 A 标记过，B 的未读就变成 0。 */
const READ_KEY = (viewer, other) => 'chatread:' + viewer + ':' + other

/** 我和对方是不是好友（互相关注） */
async function isFriend(kv, a, b) {
  // 直接 await kv.get()：Cloudflare 的 KV 返回 Promise，本地测试的同步实现也能用
  const [oa, ob] = await Promise.all([kv.get(OUT_KEY(a)), kv.get(OUT_KEY(b))])
  const list = (raw) => {
    try {
      const arr = JSON.parse(raw || '[]')
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }
  return list(oa).indexOf(b) >= 0 && list(ob).indexOf(a) >= 0
}

async function readBox(kv, a, b) {
  const raw = await kv.get(BOX_KEY(a, b))
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

async function writeBox(kv, a, b, list) {
  // 只留最近 MAX_KEEP 条，别无限长
  const trimmed = list.slice(-MAX_KEEP)
  await kv.put(BOX_KEY(a, b), JSON.stringify(trimmed))
  return trimmed
}

/** 我在 b 的会话里读到第几条（用来算未读） */
async function readUpTo(kv, a, b) {
  const raw = await kv.get(READ_KEY(a, b))
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** 补上用户名/头像 uid */
async function decorate(kv, list, meUid) {
  const out = []
  for (const m of list) {
    if (!m || typeof m.text !== 'string') continue
    let name = '已注销'
    const uid = m.from || ''
    if (uid) {
      const u = await readUser(kv, uid)
      if (u) name = u.username
    }
    out.push({
      id: m.id,
      uid,
      name,
      text: m.text.slice(0, MAX_LEN),
      at: Number(m.at) || 0,
      mine: m.from === meUid,
    })
  }
  return out
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV
  const url = new URL(request.url)
  const type = url.searchParams.get('type')

  /* 会话列表：只列互相关注（好友）的人 */
  if (type === 'list') {
    const raw = await kv.get(OUT_KEY(who.uid))
    let out = []
    try {
      out = JSON.parse(raw || '[]')
      if (!Array.isArray(out)) out = []
    } catch {
      out = []
    }
    const rows = []
    for (const uid of out) {
      const u = await readUser(kv, uid)
      if (!u || isBanned(u)) continue
      // 双向都在才算好友，单向关注的先不列
      const hisOut = await kv.get(OUT_KEY(uid))
      let mutual = false
      try {
        const arr = JSON.parse(hisOut || '[]')
        mutual = Array.isArray(arr) && arr.indexOf(who.uid) >= 0
      } catch {}
      if (!mutual) continue
      const list = await readBox(kv, who.uid, uid)
      const upTo = await readUpTo(kv, who.uid, uid)
      const last = list[list.length - 1]
      rows.push({
        uid: u.uid,
        name: u.username,
        last: last ? String(last.text || '').slice(0, 60) : '',
        lastAt: last ? Number(last.at) || 0 : 0,
        lastMine: last ? last.from === who.uid : false,
        unread: Math.max(0, list.length - upTo),
        total: list.length,
      })
    }
    rows.sort((a, b) => b.lastAt - a.lastAt)
    return json({ ok: true, list: rows, total: rows.length })
  }

  /* 看和某个人的对话 */
  const withUid = (url.searchParams.get('with') || '').trim()
  if (!RE.test(withUid)) return json({ error: '缺少或非法的 with' }, 400)
  if (withUid === who.uid) return json({ error: '不能和自己聊' }, 400)
  const other = await readUser(kv, withUid)
  if (!other || isBanned(other)) return json({ error: '没有这个用户' }, 404)

  const friend = await isFriend(kv, who.uid, withUid)
  if (!friend) {
    return json({ error: '你们还不是好友，先互相关注才能私信', code: 'nofriend' }, 403)
  }

  const list = await readBox(kv, who.uid, withUid)
  return json({
    ok: true,
    with: { uid: other.uid, name: other.username },
    items: await decorate(kv, list, who.uid),
    total: list.length,
    // 对方最后一条的时间，前端可以据此提示「你有新消息，刷新看看」
    peerLastAt: list.length ? Number(list[list.length - 1].at) || 0 : 0,
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

  const kv = env.LIGHTFIELD_KV
  const action = String((body && body.action) || '')

  if (action === 'send') {
    const to = String((body && body.to) || '').trim()
    if (!RE.test(to)) return json({ error: '缺少或非法的 to' }, 400)
    if (to === who.uid) return json({ error: '不能和自己聊' }, 400)
    const other = await readUser(kv, to)
    if (!other || isBanned(other)) return json({ error: '没有这个用户' }, 404)
    if (!(await isFriend(kv, who.uid, to))) {
      return json({ error: '你们还不是好友，先互相关注才能私信', code: 'nofriend' }, 403)
    }

    const text = String((body && body.text) || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_LEN)
    if (!text) return json({ error: '说点什么再发吧' }, 400)

    const item = {
      id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      from: who.uid,
      text,
      at: Date.now(),
    }
    const list = await readBox(kv, who.uid, to)
    list.push(item)
    await writeBox(kv, who.uid, to, list)
    // 自己这边立刻标成已读，省得下次进来显示一堆自己的未读
    await kv.put(READ_KEY(who.uid, to), String(list.length))

    return json({ ok: true, item: { ...item, name: who.user.username, mine: true }, total: list.length })
  }

  if (action === 'read') {
    const withUid = String((body && body.with) || '').trim()
    if (!RE.test(withUid)) return json({ error: '缺少或非法的 with' }, 400)
    const list = await readBox(kv, who.uid, withUid)
    await kv.put(READ_KEY(who.uid, withUid), String(list.length))
    return json({ ok: true, upTo: list.length })
  }

  if (action === 'del') {
    const withUid = String((body && body.with) || '').trim()
    if (!RE.test(withUid)) return json({ error: '缺少或非法的 with' }, 400)
    await kv.delete(BOX_KEY(who.uid, withUid))
    await kv.delete(READ_KEY(who.uid, withUid))
    return json({ ok: true })
  }

  return json({ error: '未知操作' }, 400)
}
