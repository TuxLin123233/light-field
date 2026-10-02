// 私信（非实时）
//
//   GET  ?with=<uid>            我和某个人的对话
//   GET  ?type=list              我的会话列表（最近一条 + 未读数）
//   POST {action:'send',  to, kind, ...}   发一条
//   POST {action:'react', with, id, emoji} 给某条消息贴表情 / 取消
//   POST {action:'rps',   with, id, pick}  应战猜拳
//   POST {action:'read',  with}            标记已读
//   POST {action:'del',   with}            清掉我和某人的对话
//
// 只有好友之间能聊天（互相关注 = 互加好友），陌生人发不出去。
// 「非实时」的含义：不轮询、不推送、没有在线状态。
// 对方发的新消息要自己点「刷新」才拉得到 —— 这一点在前端也写明了。
//
// 消息有 5 种：
//   text    纯文字
//   dust    送光尘（真的转账，不是贴图）
//   doodle  16×16 手绘涂鸦
//   work    分享一幅自己的作品（只存引用，不复制像素）
//   rps     猜拳，可以押光尘
import { readActiveUser, readUser, isBanned, BANNED_ERROR } from './_auth.js'
import { readBook, writeBook } from './_dust.js'

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
const KINDS = ['text', 'dust', 'doodle', 'work', 'rps']

const OUT_KEY = (uid) => 'follow-out:' + uid
const BOX_KEY = (a, b) => 'chat:' + [a, b].sort().join('|')
/* 已读位置必须按「谁看的」区分。
   之前写成了排序后的对称 key，结果 A 已读和 B 已读用的是同一条记录 ——
   B 明明一条没看过，只要 A 标记过，B 的未读就变成 0。 */
const READ_KEY = (viewer, other) => 'chatread:' + viewer + ':' + other

/* ---------- 送光尘 ---------- */
const MAX_GIFT = 500

/* ---------- 猜拳 ---------- */
const RPS = ['rock', 'scissors', 'paper']
const RPS_BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' }
const RPS_LABEL = { rock: '✊ 石头', scissors: '✌️ 剪刀', paper: '✋ 布' }
const MAX_WAGER = 200

/* ---------- 表情回应 ---------- */
const REACT_EMOJI = ['👍', '❤️', '😂', '😮', '😢', '🎉']

const clampInt = (v, lo, hi, dflt) => {
  const n = Math.floor(Number(v))
  if (!Number.isFinite(n)) return dflt
  return Math.max(lo, Math.min(hi, n))
}
const newId = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

/** 我和对方是不是好友（互相关注） */
async function isFriend(kv, a, b) {
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

/** 每种消息在会话列表里显示成什么。不能直接读 text —— 礼物和涂鸦没有文字 */
function preview(m) {
  const k = KINDS.indexOf(m.kind) >= 0 ? m.kind : 'text'
  if (k === 'dust') return '🎁 送了你 ' + (Number(m.dust) || 0) + ' 个光尘'
  if (k === 'doodle') return '🎨 画了一张涂鸦'
  if (k === 'work') return '🖼️ 分享了一幅作品：' + String((m.work && m.work.name) || '未命名')
  if (k === 'rps') {
    const w = Number(m.rps && m.rps.wager) || 0
    return '🎲 猜拳' + (w > 0 ? '（押 ' + w + ' 个光尘）' : '')
  }
  return String(m.text || '')
}

/** 补上用户名，并把「不该给对方看的字段」摘掉 */
async function decorate(kv, list, meUid) {
  const out = []
  const names = new Map()
  for (const m of list) {
    if (!m || !m.id) continue
    const uid = m.from || ''
    if (uid && !names.has(uid)) {
      const u = await readUser(kv, uid)
      names.set(uid, u ? u.username : '已注销')
    }
    const d = {
      id: m.id,
      uid,
      name: names.get(uid) || '已注销',
      at: Number(m.at) || 0,
      mine: m.from === meUid,
      kind: KINDS.indexOf(m.kind) >= 0 ? m.kind : 'text',
      text: String(m.text || '').slice(0, MAX_LEN),
      react: m.react && typeof m.react === 'object' ? m.react : {},
    }
    if (d.kind === 'dust') d.dust = Math.max(0, Math.floor(Number(m.dust) || 0))
    if (d.kind === 'doodle') d.art = Array.isArray(m.art) ? m.art : []
    if (d.kind === 'work' && m.work) {
      d.work = {
        t: Number(m.work.t) || 0,
        name: String(m.work.name || '未命名').slice(0, 40),
        size: Number(m.work.size) === 32 || Number(m.work.size) === 64 ? Number(m.work.size) : 16,
      }
    }
    if (m.reply && m.reply.id) {
      d.reply = {
        id: String(m.reply.id),
        name: String(m.reply.name || '').slice(0, 24),
        text: String(m.reply.text || '').slice(0, 80),
      }
    }
    if (d.kind === 'rps') {
      const r = m.rps && typeof m.rps === 'object' ? m.rps : {}
      const picks = r.picks && typeof r.picks === 'object' ? r.picks : {}
      /* 谁是发起人、谁是应战人，要按消息本身算，不能靠「发送者是不是我」推 ——
         发起人自己看这条时发送者就是他自己，推出来两边会是同一个人。 */
      const challenger = m.from
      const responder = m.to || (meUid === challenger ? '' : meUid)
      const peer = meUid === challenger ? responder : challenger
      const minePick = picks[meUid] || ''
      const peerPick = picks[peer] || ''
      const done = !!(minePick && peerPick)
      d.rps = {
        wager: Math.max(0, Math.floor(Number(r.wager) || 0)),
        stage: done ? 'done' : 'open',
        mine: minePick,
        peerPicked: !!peerPick,
        // 我是发起人还是应战人：前端据此把「你赢了/你输了」说对
        iAm: meUid === challenger ? 'a' : 'b',
        /* 双方都出完之前，任何一方的拳都不许露出去 ——
           否则后出的人能看到对方出的是什么，这局就没得玩了。 */
        a: done ? picks[challenger] || '' : '',
        b: done ? picks[responder] || '' : '',
        result: done ? String(r.result || '') : '',
        moved: done ? Math.max(0, Math.floor(Number(r.moved) || 0)) : 0,
      }
    }
    out.push(d)
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
        last: last ? preview(last).slice(0, 60) : '',
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
    return json({ error: '你们还不是好友，先加个好友才能聊天', code: 'nofriend' }, 403)
  }

  const list = await readBox(kv, who.uid, withUid)
  const myBook = await readBook(kv, who.uid)
  return json({
    ok: true,
    with: { uid: other.uid, name: other.username },
    // 告诉前端「我是谁」：表情回应要判断哪些是我点的
    me: who.uid,
    items: await decorate(kv, list, who.uid),
    total: list.length,
    // 前端要按余额拦「送光尘 / 押注」，先给它，省得白跑一趟
    bal: Number(myBook.bal) || 0,
    maxGift: MAX_GIFT,
    maxWager: MAX_WAGER,
    reactEmoji: REACT_EMOJI,
    rpsLabel: RPS_LABEL,
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

  /* ---------------- 发消息 ---------------- */
  if (action === 'send') {
    const to = String((body && body.to) || '').trim()
    if (!RE.test(to)) return json({ error: '缺少或非法的 to' }, 400)
    if (to === who.uid) return json({ error: '不能和自己聊' }, 400)
    const other = await readUser(kv, to)
    if (!other || isBanned(other)) return json({ error: '没有这个用户' }, 404)
    if (!(await isFriend(kv, who.uid, to))) {
      return json({ error: '你们还不是好友，先加个好友才能聊天', code: 'nofriend' }, 403)
    }

    const kind = KINDS.indexOf(body && body.kind) >= 0 ? body.kind : 'text'
    const item = { id: newId(), from: who.uid, to, at: Date.now(), kind, text: '' }

    // 引用回复：只存一小段快照，原消息删了也不影响显示
    if (body && body.reply && body.reply.id) {
      item.reply = {
        id: String(body.reply.id).slice(0, 40),
        name: String(body.reply.name || '').slice(0, 24),
        text: String(body.reply.text || '').slice(0, 80),
      }
    }

    if (kind === 'text') {
      const text = String((body && body.text) || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_LEN)
      if (!text) return json({ error: '说点什么再发吧' }, 400)
      item.text = text
    } else if (kind === 'dust') {
      const amt = clampInt(body && body.dust, 1, MAX_GIFT, 0)
      if (!amt) return json({ error: '要送多少光尘？' }, 400)
      const myBook = await readBook(kv, who.uid)
      const bal = Number(myBook.bal) || 0
      if (bal < amt) {
        return json({ error: '光尘不够，你只有 ' + bal + ' 个', bal }, 400)
      }
      /* 先扣后加。万一加的那步失败，也只是这次没送成，
         绝不会出现「对方没收到、自己也没扣」之外的情况 —— 不会凭空造币。 */
      await writeBook(kv, who.uid, { ...myBook, bal: bal - amt })
      const hisBook = await readBook(kv, to)
      await writeBook(kv, to, {
        ...hisBook,
        bal: (Number(hisBook.bal) || 0) + amt,
        got: (Number(hisBook.got) || 0) + amt,
      })
      item.dust = amt
      item.text = String((body && body.text) || '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN)
    } else if (kind === 'doodle') {
      const art = Array.isArray(body && body.art) ? body.art : []
      if (art.length !== 256) return json({ error: '涂鸦数据不对' }, 400)
      const clean = art.map((p) =>
        Array.isArray(p) && p.length >= 3
          ? [clampInt(p[0], 0, 255, 0), clampInt(p[1], 0, 255, 0), clampInt(p[2], 0, 255, 0)]
          : [255, 255, 255]
      )
      item.art = clean
      item.text = String((body && body.text) || '').replace(/\s+/g, ' ').trim().slice(0, 80)
    } else if (kind === 'work') {
      const t = Math.floor(Number(body && body.wt))
      if (!Number.isFinite(t) || t <= 0) return json({ error: '要分享哪一幅？' }, 400)
      item.work = {
        t,
        name: String((body && body.wname) || '未命名').slice(0, 40),
        size: Number(body && body.wsize) === 32 || Number(body && body.wsize) === 64 ? Number(body.wsize) : 16,
      }
      item.text = String((body && body.text) || '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN)
    } else if (kind === 'rps') {
      const pick = String((body && body.pick) || '')
      if (RPS.indexOf(pick) < 0) return json({ error: '先出拳再发出去' }, 400)
      const wager = clampInt(body && body.wager, 0, MAX_WAGER, 0)
      if (wager > 0) {
        const b = await readBook(kv, who.uid)
        if ((Number(b.bal) || 0) < wager) {
          return json({ error: '押注要 ' + wager + ' 个光尘，你只有 ' + (Number(b.bal) || 0) + ' 个' }, 400)
        }
      }
      /* 我出的拳存在这条消息里，但 decorate 在双方都出完之前不会把它发出去，
         所以对方看不到我出的什么。赌注到「分胜负」那一刻才真的转账。 */
      item.rps = { wager, picks: { [who.uid]: pick } }
    }

    const list = await readBox(kv, who.uid, to)
    list.push(item)
    await writeBox(kv, who.uid, to, list)
    // 自己这边立刻标成已读，省得下次进来显示一堆自己的未读
    await kv.put(READ_KEY(who.uid, to), String(list.length))

    const shown = (await decorate(kv, [item], who.uid))[0]
    return json({ ok: true, item: shown, total: list.length })
  }

  /* ---------------- 表情回应 ---------------- */
  if (action === 'react') {
    const withUid = String((body && body.with) || '').trim()
    const mid = String((body && body.id) || '').trim()
    const emo = String((body && body.emoji) || '').trim()
    if (!RE.test(withUid) || !mid) return json({ error: '参数不对' }, 400)
    if (REACT_EMOJI.indexOf(emo) < 0) return json({ error: '不支持这个表情' }, 400)
    const box = await readBox(kv, who.uid, withUid)
    const m = box.find((x) => x && x.id === mid)
    if (!m) return json({ error: '这条消息不在了' }, 404)
    m.react = m.react && typeof m.react === 'object' ? m.react : {}
    const arr = Array.isArray(m.react[emo]) ? m.react[emo] : []
    const i = arr.indexOf(who.uid)
    if (i >= 0) arr.splice(i, 1) // 再点一次就是取消
    else arr.push(who.uid)
    if (arr.length) m.react[emo] = arr
    else delete m.react[emo]
    await writeBox(kv, who.uid, withUid, box)
    return json({ ok: true, id: mid, react: m.react })
  }

  /* ---------------- 猜拳应战 ---------------- */
  if (action === 'rps') {
    const withUid = String((body && body.with) || '').trim()
    const mid = String((body && body.id) || '').trim()
    const pick = String((body && body.pick) || '')
    if (!RE.test(withUid) || !mid) return json({ error: '参数不对' }, 400)
    if (RPS.indexOf(pick) < 0) return json({ error: '先出拳' }, 400)

    const box = await readBox(kv, who.uid, withUid)
    const m = box.find((x) => x && x.id === mid)
    if (!m || m.kind !== 'rps') return json({ error: '这一局不在了' }, 404)
    const r = m.rps && typeof m.rps === 'object' ? m.rps : (m.rps = { wager: 0, picks: {} })
    const picks = r.picks && typeof r.picks === 'object' ? r.picks : (r.picks = {})
    if (picks[who.uid]) return json({ error: '这一局你已经出过拳了' }, 400)
    if (!picks[m.from]) return json({ error: '这一局还没开始' }, 400)

    picks[who.uid] = pick
    const hisPick = picks[m.from]
    let result = 'draw'
    if (RPS_BEATS[pick] === hisPick) result = 'b' // 应战的赢
    else if (RPS_BEATS[hisPick] === pick) result = 'a' // 发起的赢
    r.result = result

    // 平局不结算，谁也不用掏钱
    let moved = 0
    const wager = Math.max(0, Math.floor(Number(r.wager) || 0))
    if (wager > 0 && result !== 'draw') {
      const winner = result === 'a' ? m.from : who.uid
      const loser = result === 'a' ? who.uid : m.from
      const wb = await readBook(kv, winner)
      const lb = await readBook(kv, loser)
      // 输的人有多少付多少，不让他欠账（余额可能在这期间花掉了）
      moved = Math.min(wager, Number(lb.bal) || 0)
      if (moved > 0) {
        await writeBook(kv, loser, { ...lb, bal: (Number(lb.bal) || 0) - moved })
        await writeBook(kv, winner, {
          ...wb,
          bal: (Number(wb.bal) || 0) + moved,
          got: (Number(wb.got) || 0) + moved,
        })
      }
    }
    r.moved = moved
    await writeBox(kv, who.uid, withUid, box)

    const shown = (await decorate(kv, [m], who.uid))[0]
    return json({ ok: true, item: shown, result, moved })
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
