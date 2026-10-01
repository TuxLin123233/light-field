// 公开资料：给「别人看你」用
//
//   GET ?uid=xxx    按账号 uid 查
//   GET ?name=xxx   按用户名查（社区点作者名进来时用这个）
//
// 返回头像、简介、公开统计。只读，不需要登录 —— 作品卡片上的头像、
// 作者主页、以后的关注/评论/聊天都用它。
import { readUser, readUserByName, isBanned } from './_auth.js'
import { readAvatar } from './_avatar.js'
import { readBook } from './_dust.js'
import { recentHistory } from './_history.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

/** 汇总一个账号的公开数据：作品数、总赞、绘制格数 */
function summarize(entries, uid) {
  const mine = entries.filter((e) => e && e.ownerUser === uid)
  let likes = 0
  let cells = 0
  for (const e of mine) {
    likes += Number(e.likes) || 0
    // 像素相机转出来的作品不算一笔一笔画的量，与成就口径保持一致
    if (e.fromImage) continue
    const px = Array.isArray(e.pixels) ? e.pixels : []
    for (const p of px) {
      if (!Array.isArray(p) || p.length < 3) continue
      if (p[0] > 246 && p[1] > 246 && p[2] > 246) continue
      cells += 1
    }
  }
  return { works: mine.length, likes, cells }
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const url = new URL(request.url)
  const kv = env.LIGHTFIELD_KV

  const uid = (url.searchParams.get('uid') || '').trim()
  const name = (url.searchParams.get('name') || '').trim()
  if (!uid && !name) return json({ error: '缺少 uid 或 name' }, 400)

  const user = uid ? await readUser(kv, uid) : await readUserByName(kv, name)
  // 查无此人与被封禁一律返回「没有这个用户」，不泄露账号是否存在
  if (!user || isBanned(user)) return json({ error: '没有这个用户' }, 404)

  const av = await readAvatar(kv, user.uid)
  const book = await readBook(kv, user.uid)
  const { entries } = await recentHistory(kv, { limit: 400 })
  const stats = summarize(entries, user.uid)

  return json({
    ok: true,
    uid: user.uid,
    username: user.username,
    bio: user.bio || '',
    avatar: av ? av.px : null,
    createdAt: user.createdAt || 0,
    stats,
    // 光尘余额与签到属于私密信息，不对外公开；只给「累计收到」这种汇总
    received: Number(book.got) || 0,
  })
}
