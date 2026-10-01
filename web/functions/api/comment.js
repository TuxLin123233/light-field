// 评论
//
//   GET  ?work=<time>            某幅作品的评论
//   POST {action:'add', work, text}       发表评论
//   POST {action:'del', id}              删除自己的评论（作者或作品作者）
//   POST {action:'delwork', work}        作品没了时连带清评论（由 set.js 调用）
//
// 评论必须登录（和送光尘、发布一样：会消耗别人权益的互动都要有身份）。
// 文本走和发布作品同一套敏感词过滤，但只提示、不静默丢弃。
import { readActiveUser, readUser, BANNED_ERROR } from './_auth.js'
import { hitWords } from './_lexicon.js'
import { recentHistory, readAllHistory } from './_history.js'

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

const KEY = (work) => 'cmt:' + work
const MAX_LEN = 200
const MAX_PER_WORK = 200 // 超过就不再收，防止有人刷屏

/** 读某幅作品的评论，按时间正序（先评论的在上面） */
export async function readComments(kv, work) {
  const raw = await kv.get(KEY(work))
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

async function writeComments(kv, work, list) {
  await kv.put(KEY(work), JSON.stringify(list))
}

/* 补上用户名和头像 uid。
   owner（是不是作品作者本人）在这里按「当前这幅作品是谁的」实时算，
   不读评论里存的 owner 字段 —— 那个是发评论那一刻的快照，
   作品作者的身份变了以后就再也对不上了。 */
async function decorate(kv, list, workOwnerUid) {
  const out = []
  for (const c of list) {
    if (!c || typeof c.id !== 'string') continue
    let name = '已注销'
    const uid = c.uid || ''
    if (uid) {
      const u = await readUser(kv, uid)
      if (u) name = u.username
    }
    out.push({
      id: c.id,
      uid,
      name,
      text: String(c.text || '').slice(0, MAX_LEN),
      at: Number(c.at) || 0,
      owner: !!(workOwnerUid && uid && uid === workOwnerUid),
    })
  }
  return out
}

/** 作品作者，用于给作者评论打标 */
async function workOwner(kv, work) {
  const { entries } = await recentHistory(kv, { limit: 400 })
  const hit = entries.find((e) => e && Number(e.time) === Number(work))
  return hit && hit.ownerUser ? String(hit.ownerUser) : ''
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const url = new URL(request.url)
  const work = Number(url.searchParams.get('work'))
  if (!Number.isFinite(work) || work <= 0) return json({ error: '缺少 work' }, 400)

  const kv = env.LIGHTFIELD_KV
  // 顺便把「我的 uid」带回去：前端要靠它区分自己的评论（镜像到右边），
  // 为此单独再请求一次接口不值得。
  const myUid = await readActiveUser(env, '', request.headers.get('authorization'))
  const owner = await workOwner(kv, work)
  const list = await readComments(kv, work)
  return json({
    ok: true,
    work,
    total: list.length,
    items: await decorate(kv, list, owner),
    myUid: myUid ? myUid.uid : '',
    // 作品作者是谁，前端据此判断「我能不能删别人留的评论」
    workOwner: owner,
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
  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV

  /* 发表评论 */
  if (action === 'add') {
    const work = Number(body && body.work)
    if (!Number.isFinite(work) || work <= 0) return json({ error: '缺少 work' }, 400)
    const text = String((body && body.text) || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_LEN)
    if (!text) return json({ error: '说点什么再发吧' }, 400)

    // 作品必须还在
    const owner = await workOwner(kv, work)
    const { entries } = await readAllHistory(kv)
    const exists = entries.some((e) => e && Number(e.time) === work)
    if (!exists) return json({ error: '这幅作品已经不在了' }, 404)

    // 敏感词：命中就拒，并告诉你是哪个词
    const hit = hitWords(text, { minLen: 2 })
    if (hit && hit.length) {
      return json({ error: '不合适的内容：' + hit.join('、'), hit }, 400)
    }

    const list = await readComments(kv, work)
    if (list.length >= MAX_PER_WORK) {
      return json({ error: '这封评论已经太多啦，去别处也看看吧' }, 400)
    }
    // 同一个人 10 秒内不重复刷
    const last = list[list.length - 1]
    if (last && last.uid === who.uid && Date.now() - (Number(last.at) || 0) < 10000) {
      return json({ error: '说慢一点，别连着刷' }, 429)
    }

    const item = {
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      uid: who.uid,
      name: who.user.username,
      text,
      at: Date.now(),
      owner: !!owner && owner === who.uid,
    }
    list.push(item)
    await writeComments(kv, work, list)
    const [view] = await decorate(kv, [item], owner)
    return json({ ok: true, item: view, total: list.length })
  }

  /* 删评论：只有评论作者本人或作品作者能删 */
  if (action === 'del') {
    const id = String((body && body.id) || '')
    if (!id) return json({ error: '缺少 id' }, 400)
    const work = Number(body && body.work)
    if (!Number.isFinite(work)) return json({ error: '缺少 work' }, 400)

    const list = await readComments(kv, work)
    const idx = list.findIndex((c) => c && c.id === id)
    if (idx < 0) return json({ error: '评论不存在' }, 404)
    const target = list[idx]
    const owner = await workOwner(kv, work)
    const isWriter = target.uid === who.uid
    const isWorkOwner = owner && owner === who.uid
    if (!isWriter && !isWorkOwner) return json({ error: '只能删自己的评论' }, 403)

    list.splice(idx, 1)
    await writeComments(kv, work, list)
    return json({ ok: true, id, total: list.length })
  }

  return json({ error: '未知操作' }, 400)
}

/** 作品被删时清掉它的评论（由 set.js 调用） */
export async function dropWorkComments(kv, work) {
  const list = await readComments(kv, work)
  if (!list.length) return 0
  await kv.delete(KEY(work))
  return list.length
}
