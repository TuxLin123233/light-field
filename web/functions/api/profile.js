// 公开资料：给「别人看你」用
//
//   GET ?uid=xxx    按账号 uid 查
//   GET ?name=xxx   按用户名查（社区点作者名进来时用这个）
//
// 返回头像、简介、公开统计。只读，不需要登录 —— 作品卡片上的头像、
// 作者主页、以后的关注/评论/聊天都用它。
import { readUser, readUserByName, readActiveUser, isBanned, isBirthdayToday, birthdayLockLeft } from './_auth.js'
import { visiblePixels } from './_avatar.js'
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

  /* 不带 uid/name 就是「查我自己」—— 个人信息页要显示性别、生日、
     还有生日还能不能改，这些只对本人有意义，所以单独走这条。 */
  let user
  let isMe = false
  if (!uid && !name) {
    const who = await readActiveUser(env, '', request.headers.get('authorization'))
    if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
    if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)
    user = who.user
    isMe = true
  } else {
    user = uid ? await readUser(kv, uid) : await readUserByName(kv, name)
  }
  // 查无此人与被封禁一律返回「没有这个用户」，不泄露账号是否存在
  if (!user || isBanned(user)) return json({ error: '没有这个用户' }, 404)

  const av = await readAvatar(kv, user.uid)
  const book = await readBook(kv, user.uid)
  const { entries } = await recentHistory(kv, { limit: 400 })
  const stats = summarize(entries, user.uid)

  return json({
    ok: true,
    uid: user.uid,
    isMod: await (async () => { try { const { isMod } = await import('./_mod.js'); return await isMod(env.LIGHTFIELD_KV, user.uid) } catch (e) { return false } })(),
    // 这个人下架过多少件 —— 主页上给审核员一个「干了多少活」的交代
    modHides: await (async () => {
      try {
        const { listHidden, isMod } = await import('./_mod.js')
        if (!(await isMod(env.LIGHTFIELD_KV, user.uid))) return 0
        const all = await listHidden(env.LIGHTFIELD_KV)
        return all.filter((h) => h && h.byUid === user.uid).length
      } catch (e) { return 0 }
    })(),
    username: user.username,
    bio: user.bio || '',
    // 选了默认头像的人这里给 null，前端会画 uid 生成的默认头像
    avatar: visiblePixels(av),
    createdAt: user.createdAt || 0,
    /* 性别和生日都是「填了才公开」：不填就是空串，前端不显示。
       生日只存月-日、不含年份，所以露出去也不涉及年龄。 */
    gender: user.gender || '',
    birthday: user.birthday || '',
    todayBirthday: isBirthdayToday(user.birthday, Date.now()),
    isMe,
    // 生日还有多久能改：只告诉本人
    birthdayLockLeft: isMe ? birthdayLockLeft(user) : 0,
    stats,
    // 光尘余额与签到属于私密信息，不对外公开；只给「累计收到」这种汇总
    received: Number(book.got) || 0,
  })
}
