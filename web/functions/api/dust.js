import { checkOrigin } from './_origin.js'
// 光尘账本接口（登录用户）
//
//   GET  ?action=me     取账本
//   POST {action:'sign'}            每日签到
//   POST {action:'give', time:xxx}  送光尘给某幅作品（同时给它加赞）
//
// 未登录返回 401，前端继续使用本地账本。
import { readActiveUser, pickToken, BANNED_ERROR } from './_auth.js'
import { maybeBirthdayGift } from './_birthday.js'
import { readBook, signIn, giveDust, publicView, DUST_PER_SIGNIN, DUST_COST } from './_dust.js'
import { incrementLikes, readAllHistory } from './_history.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })

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

  /* 顺手看一眼今天是不是他的生日：是就把礼发了（一年只发一次）。
     挂在这里是因为客户端每次打开网站都会拉一次账本，
     省得为这件事单独加定时任务。送礼失败不能连累账本本身。 */
  let book = await readBook(env.LIGHTFIELD_KV, who.uid)
  try {
    if (await maybeBirthdayGift(env.LIGHTFIELD_KV, who.user, Date.now())) {
      book = await readBook(env.LIGHTFIELD_KV, who.uid)
    }
  } catch (e) {}

  return json({ ok: true, uid: who.uid, username: who.username, book: publicView(book) })
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

  const who = await readActiveUser(env, pickToken(request, body), request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const action = (body && body.action) || ''

  if (action === 'sign') {
    const r = await signIn(env.LIGHTFIELD_KV, who.uid)
    return json({
      ok: true,
      already: r.already,
      bonus: r.bonus || 0,
      gain: r.gain || 0,
      streak: r.streak,
      book: publicView(r.book),
    })
  }

  if (action === 'give') {
    // 查出作品作者，好把这份光尘转给他
    const time = Number(body && body.time)
    let recipient = ''
    if (Number.isFinite(time) && time > 0) {
      const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
      const target = entries.find((e) => e && e.time === time)
      if (target) {
        // 像素相机转图的作品不参与光尘赠送。
        // 相机作品是「导入」不是「一笔一笔画」，让它参与赠送等于开了一条
        // 刷光尘的路：传张图 posted 出来，靠别人送就能稳定拿光尘。
        // 想要光尘请手绘，手绘作品才是社区要鼓励的东西。
        if (target.fromImage) {
          return json({
            error: '像素相机转出来的作品不支持送光尘，请给手绘作品点赞',
            reason: 'fromImage',
          }, 400)
        }
        if (target.ownerUser) recipient = String(target.ownerUser)
      }
    }

    /* 自己的作品：什么都不做，光尘不扣也不转，计数也不加。
       之前这里是「赞照给」—— 每点一次就 incrementLikes 一次，
       没有去重、没有上限。而 likes 正是每日榜的排序依据，
       于是可以对着自己的画狂点把自己顶到榜首，每天白拿冠军奖。
       作品上的数字现在表示「收到的光尘」，自己没送就不该计。 */
    if (recipient && recipient === who.uid) {
      const book = await readBook(env.LIGHTFIELD_KV, who.uid)
      const mine = (await readAllHistory(env.LIGHTFIELD_KV)).entries.find((e) => e && e.time === time)
      return json({
        ok: true,
        self: true,
        found: true,
        likes: mine ? Number(mine.likes) || 0 : 0,
        credited: 0,
        message: '这是你自己的画，不能自己送光尘给自己',
        book: publicView(book),
      })
    }

    const r = await giveDust(env.LIGHTFIELD_KV, who.uid, body && body.time, recipient)
    if (!r.ok) {
      const msg =
        r.reason === 'already' ? '这幅作品已经送过光尘了' :
        r.reason === 'poor' ? '光尘不够啦，先去签到攒一点' :
        '作品不存在'
      const book = r.book ? publicView(r.book) : null
      return json({ error: msg, reason: r.reason, book }, 400)
    }
    // 扣分成功才加赞；作品若已不存在，账本已扣但不加分
    const liked = await incrementLikes(env.LIGHTFIELD_KV, body.time)
    return json({
      ok: true,
      found: liked.found,
      likes: liked.likes,
      // credited 为 1 表示这份光尘已转到作品作者账上
      credited: r.credited || 0,
      book: publicView(r.book),
    })
  }

  return json({ error: '未知操作' }, 400)
}

export const DUST_RULES = { perSignin: DUST_PER_SIGNIN, cost: DUST_COST }
