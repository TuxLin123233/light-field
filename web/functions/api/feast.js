// 大锅饭 · 端菜给镇民
//
//   GET    今天招待过谁（给「今日菜单」面板用）
//   POST { action:'serve', to, dish, perfect }
//          给某位镇民端一道菜
//
// 规则（服务端说了算，前端的判定只当参考）：
//   · 只能端给**真的在小镇地图上有房子的人** —— 名单以服务端为准，
//     不信前端传什么就是什么
//   · 同一个人**一天只能招待一次** —— 不然刷起来没完，收信的人也会烦
//   · 端过去是真的送：对方信箱里会多一封带光尘的信，他去领就有
//   · 做得好（perfect）对方多得一点，做得一般也给，只是少一些
//
// 为什么不做成「自己拿分」：那和原来的随机 NPC 没区别，还是自说自话。
// 端出去、对方收得到，这件事才有意义。

import { readActiveUser, isBanned } from './_auth.js'
import { checkOrigin } from './_origin.js'
import { checkLimit, tooMany, clientIp } from './_ratelimit.js'
import { checkText } from './_illegal.js'
import { readList } from './_town.js'
import { deliver } from './_mail.js'
import { creditDust, dayStamp } from './_dust.js'

const MAX_DISH_LEN = 12
const BONUS_PERFECT = 2 // 做得漂亮的，对方多拿 1 个
const BONUS_OK = 1
const COOK_REWARD = 1 // 端出去的人自己也拿 1 个
const MAX_PER_DAY = 40 // 一天最多端 40 次，防刷

const KEY_TODAY = (uid, day) => 'feast:' + uid + ':' + day

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...CORS,
    },
  })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS })
}

function readToday(raw) {
  try {
    const o = JSON.parse(raw || '{}')
    return o && typeof o === 'object' ? o : {}
  } catch (e) {
    return {}
  }
}

export async function onRequestGet(context) {
  const { request, env } = context
  const kv = env.LIGHTFIELD_KV
  if (!kv) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  const me = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!me || !me.uid) return json({ ok: false, error: '先登录', code: 'noauth' }, 401)

  const day = dayStamp()
  const today = readToday(await kv.get(KEY_TODAY(me.uid, day)))

  return json({
    ok: true,
    day,
    served: today, // { [对方uid]: { name, dish, perfect, at } }
    count: Object.keys(today).length,
    max: MAX_PER_DAY,
    reward: { perfect: BONUS_PERFECT, ok: BONUS_OK, cook: COOK_REWARD },
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const kv = env.LIGHTFIELD_KV
  if (!kv) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  const me = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!me || !me.uid) return json({ ok: false, error: '先登录', code: 'noauth' }, 401)
  if (isBanned(me.user)) return json({ ok: false, error: '账号已被封禁' }, 403)

  if (!checkOrigin(request)) return json({ error: '来源不合法' }, 403)

  let body = {}
  try {
    body = await request.json()
  } catch (e) {
    return json({ ok: false, error: '请求格式不对' }, 400)
  }
  if (!body || body.action !== 'serve') return json({ ok: false, error: '不认识这个动作' }, 400)

  const to = String(body.to || '').trim()
  if (!/^[A-Za-z0-9_-]{4,40}$/.test(to)) return json({ ok: false, error: '这个人不存在' }, 400)
  if (to === me.uid) return json({ ok: false, error: '不用给自己做，随时都能吃' }, 400)

  // 频率限制：和别处共用同一套（15 分钟窗口）
  const rl = await checkLimit(kv, clientIp(request), String(me.username || ''))
  if (!rl.ok) return json(tooMany(rl.retryAfter), 429)

  /* ★ 名单以**服务端的小镇地图**为准。
     前端传个 uid 过来不代表这个人真的有房子 ——
     随便编一个 uid 就能给人塞信的话，这套就没意义了。 */
  const list = await readList(kv)
  const target = (list || []).find((h) => h && h.uid === to)
  if (!target) return json({ ok: false, error: '镇上没有这户人家' }, 404)

  // 菜名：只做长度和内容安全，不做白名单 —— 以后加菜不用改服务端
  let dish = String(body.dish || '').trim().slice(0, MAX_DISH_LEN)
  if (!dish) dish = '一道家常菜'
  const hit = checkText(dish, { hitWords: true })
  if (hit && hit.length) return json({ ok: false, error: '这道菜的名字不太合适' }, 400)

  const day = dayStamp()
  const key = KEY_TODAY(me.uid, day)
  const today = readToday(await kv.get(key))

  if (today[to]) {
    return json(
      { ok: false, error: '今天已经给 ' + (today[to].name || '这位') + ' 端过了，明天再来' },
      429
    )
  }
  if (Object.keys(today).length >= MAX_PER_DAY) {
    return json({ ok: false, error: '今天端了 ' + MAX_PER_DAY + ' 份，灶该歇歇了' }, 429)
  }

  const perfect = body.perfect === true
  const bonus = perfect ? BONUS_PERFECT : BONUS_OK
  const name = String(target.name || '镇民').slice(0, 16)
  const now = Date.now()

  /* 真的送过去：对方信箱里多一封带光尘的信。
     claimId 用「谁+哪天+给谁」拼，天然幂等 ——
     同一个请求重放不会塞两封。 */
  let delivered = 0
  try {
    delivered = await deliver(kv, to, {
      /* ★ id 是**必填**的 —— _mail.js 的 sanitizeMail 没有 id 就直接
         返回 null，信会被静默丢掉（deliver 返回 0，不报错）。
         正文的字段名是 body，不是 text，写错了也会变成空信。 */
      id: 'feast:' + me.uid + ':' + day + ':' + to,
      claimId: 'feast:' + me.uid + ':' + day + ':' + to,
      kind: 'attach',
      dust: bonus,
      icon: '🍲',
      title: String(me.username || '有人').slice(0, 12) + ' 给你做了道菜',
      body: '「' + dish + '」' + (perfect ? '，火候正好，装盘也漂亮。' : '，趁热吃。'),
      time: now,
    })
  } catch (e) {
    return json({ ok: false, error: '端过去的时候洒了，再试一次' }, 500)
  }

  // 自己也拿一点
  try {
    await creditDust(kv, me.uid, COOK_REWARD)
  } catch (e) {}

  today[to] = { name, dish, perfect, at: now, dust: bonus }
  try {
    await kv.put(key, JSON.stringify(today), { expirationTtl: 3 * 86400 })
  } catch (e) {}

  return json({
    ok: true,
    to,
    name,
    dish,
    perfect,
    got: { toThem: bonus, toMe: COOK_REWARD, delivered: delivered > 0 },
    todayCount: Object.keys(today).length,
    max: MAX_PER_DAY,
  })
}
