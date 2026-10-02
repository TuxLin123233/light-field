import { checkOrigin } from './_origin.js'
import { appendEntry, recentHistory, HISTORY_MAX } from './_history.js'
import { contestInfo } from './_contest.js'
import { hitWords } from './_lexicon.js'
import { hitTrade, checkText } from './_illegal.js'
import { readActiveUser, pickToken, BANNED_ERROR } from './_auth.js'
import { creditDust, dayStamp } from './_dust.js'
import { inspectArtwork } from './_camera.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })

const UPLOAD_WINDOW_MS = 30 * 1000

function entryPixels(e) {
  return Array.isArray(e) ? e : e && e.pixels
}

function samePixels(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!a[i] || !b[i] || a[i][0] !== b[i][0] || a[i][1] !== b[i][1] || a[i][2] !== b[i][2]) {
      return false
    }
  }
  return true
}

function norm(val, max) {
  return Array.isArray(val) && val.length === 3 && [val[0], val[1], val[2]].every((v) => Number.isFinite(Number(v)))
    ? [0, 1, 2].map((i) => Math.max(0, Math.min(max || 255, Math.round(Number(val[i])))))
    : null
}

function normalizeFrames(frames) {
  if (!Array.isArray(frames) || frames.length < 2 || frames.length > 16) return null
  const out = []
  for (const f of frames) {
    if (!Array.isArray(f) || f.length !== 16) return null
    const row = []
    for (const r of f) {
      if (!Array.isArray(r) || r.length !== 16) return null
      const cells = []
      for (const px of r) {
        const c = norm(px)
        if (!c) return null
        cells.push(c)
      }
      row.push(cells)
    }
    out.push(row)
  }
  return out
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestPost(context) {
  const { request, env } = context
  // 改状态的请求必须来自本站，挡掉「拿别人浏览器当肉鸡」
  {
    const g = checkOrigin(request)
    if (!g.ok) return json(g.body, g.status)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const sizeParam = Number(body && body.size)
  const size = sizeParam === 32 || sizeParam === 64 ? sizeParam : 16
  const expected = size * size

  const rawAnim = body && body.anim
  let animObj = null
  let pixels = null
  if (rawAnim && typeof rawAnim === 'object') {
    const frames = normalizeFrames(rawAnim.frames)
    if (!frames) {
      return json({ error: 'anim.frames 必须是 2~16 帧的 16×16 数组（每像素 [r,g,b]）' }, 400)
    }
    const d = Number(rawAnim.delay)
    const delay = Number.isFinite(d) ? Math.max(1, Math.min(200, Math.round(d))) : 10
    pixels = frames[0].reduce((acc, r) => acc.concat(r), [])
    animObj = { frames, delay }
  } else {
    pixels = Array.isArray(body) ? body : body && body.pixels
    const isValid =
      Array.isArray(pixels) &&
      pixels.length === expected &&
      pixels.every((p) => Array.isArray(p) && p.length === 3)
    if (!isValid) {
      return json({ error: `pixels 必须是 ${expected}×3 的二维数组（每个元素是 [r,g,b]）` }, 400)
    }
  }

  const bodyName = body && typeof body.name === 'string' ? body.name : ''
  const headerName = request.headers.get('X-Draw-Name')
  const queryName = new URL(request.url).searchParams.get('name')
  const legacyName = (bodyName || headerName || queryName || '').trim()

  const rawWorkName = body && typeof body.workName === 'string' ? body.workName : ''
  const rawAuthor = body && typeof body.author === 'string' ? body.author : ''

  const workName = rawWorkName.trim().slice(0, 20)
  const author = (rawAuthor || legacyName).trim().slice(0, 20) || '匿名'
  const name = workName || author

  /* 客户端声明这幅画是哪个方向的画板产出的（目前只有重力）。
     作品里也留一份，以后做数据统计时能分清。
     注意：这个字段由客户端自称，所以它只用来「排除」，
     绝不用来给什么好处 —— 好处一律服务端自己判。 */
  const ink = body && body.ink === 'gravity' ? 'gravity' : ''

  /* 重力绘画不参加本周主题比赛。

     前端已经藏了入口、也不往 payload 里带 contest，但这里还要拦一道：
     客户端说什么都不算数，改个参数就能绕过 UI。
     直接拒收而不是静默忽略 —— 静默忽略的话，用户的作品会发出去却没进榜，
     他只会看到「明明勾了比赛却没进」，比报错更难查。 */
  const rawContest = body && typeof body.contest === 'string' ? body.contest.trim() : ''
  if (rawContest) {
    if (ink === 'gravity') {
      return json({ error: '像素重力的画不参加本周主题比赛，换个方向画就能报名了' }, 400)
    }
    const cinfo = contestInfo()
    if (cinfo.week !== rawContest) {
      return json({ error: 'contest 只能报名本周主题（当前为 ' + cinfo.week + '）' }, 400)
    }
  }

  if (!env.LIGHTFIELD_KV) {
    return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  }

  const ip = request.headers.get('cf-connecting-ip') || ''
  if (ip) {
    const rateKey = 'rl:' + ip
    const last = Number(await env.LIGHTFIELD_KV.get(rateKey))
    const nowRl = Date.now()
    if (Number.isFinite(last) && last > 0 && nowRl - last < UPLOAD_WINDOW_MS) {
      // 30 秒的窗口，按秒提示比按分钟清楚
      const waitSec = Math.ceil((UPLOAD_WINDOW_MS - (nowRl - last)) / 1000)
      return json({ error: '发布太频繁，请 ' + waitSec + ' 秒后再试', waitSec }, 429)
    }
    // Cloudflare KV 规定 expirationTtl 最小 60 秒，传更小会直接抛异常。
    // 限流窗口改成 30 秒后这里算出来就是 30，导致整个发布请求 500。
    // 记录本身多留一会儿没有副作用（下次比较时 now-last 会大于窗口，照样放行）。
    const rlTtl = Math.max(60, Math.ceil(UPLOAD_WINDOW_MS / 1000))
    try {
      await env.LIGHTFIELD_KV.put(rateKey, String(nowRl), { expirationTtl: rlTtl })
    } catch (e) {
      // 限流记录写不进去不该拦住发布，放行即可
    }
  }

  const { entries } = await recentHistory(env.LIGHTFIELD_KV, { limit: 300 })
  if (animObj) {
    if (entries.some((e) => e && e.anim && JSON.stringify(e.anim.frames) === JSON.stringify(animObj.frames))) {
      return json({ error: '内容重复，不能重复发布' }, 409)
    }
  } else if (entries.some((e) => samePixels(entryPixels(e), pixels))) {
    return json({ error: '内容重复，不能重复发布' }, 409)
  }

  const entry = { name, workName, author, size, pixels, time: Date.now(), likes: 0 }
  if (animObj) entry.type = 'anim'
  if (animObj) entry.anim = animObj
  if (rawContest) entry.contest = rawContest
  // 方向标记：统计时可分清是哪套画板产出的
  if (ink) entry.ink = ink
  if (body && body.room === true) entry.room = true

  /* 用哪种画布画的。社区要按这个分区，所以必须存下来 ——
     以前只存了 size，喷漆和逐格涂同样是 64×64 就分不开了。
     取值只允许这几样，前端传什么都不信：
       pixel   逐格上色（16/32/64）
       spray   喷漆（固定 64）
       gravity 重力撒沙（固定 64）
       anim    帧动画（多帧，type 字段也会标） */
  {
    const m = String((body && body.method) || '').trim()
    if (m === 'spray') entry.method = 'spray'
    else if (m === 'gravity') entry.method = 'gravity'
    else if (m !== 'anim') entry.method = 'pixel'
  }

  // 标签：最多 3 个，每个最多 6 字，只保留安全字符
  if (Array.isArray(body && body.tags)) {
    const clean = []
    for (const t of body.tags) {
      if (typeof t !== 'string') continue
      const v = t.trim().replace(/[\s#，,、]+/g, '').slice(0, 6)
      if (v && !clean.includes(v)) clean.push(v)
      if (clean.length >= 3) break
    }
    if (clean.length) entry.tags = clean
  }

  // 内容安全：作品名、作者名、标签任一命中敏感词就拒绝发布。
  // 词库只在服务端使用，不下发到浏览器，改前端也绕不过。
  // 分字段返回命中词：只说「不合规」用户根本不知道该改哪一项。
  const hitName = checkText(workName, { hitWords })
  const hitAuthor = checkText(author, { hitWords })
  const hitTags = []
  for (const t of entry.tags || []) hitTags.push(...checkText(t, { hitWords }))
  const risky = hitName.concat(hitAuthor).concat(hitTags)
  if (risky.length) {
    const where = []
    if (hitName.length) where.push('作品名')
    if (hitAuthor.length) where.push('作者名')
    if (hitTags.length) where.push('标签')
    return json(
      {
        error: where.join('、') + '含有不合适的内容，请修改后再发布',
        hit: [...new Set(risky)].slice(0, 3),
        hitName: hitName.slice(0, 3),
        hitAuthor: hitAuthor.slice(0, 3),
        hitTags: [...new Set(hitTags)].slice(0, 3),
      },
      400
    )
  }

  /* 归属：必须登录。

     以前这里是「优先用登录账号；没登录才回退到认领码（过渡期保留）」：
     token 为空或无效时 readActiveUser 返回 null，下面三个 if 全是
     `if (who && ...)`，于是整段校验被跳过、作品照收 —— 游客可以直接发布。

     前端那层 requireLogin() 只挡住了按钮，拦不住直接 POST /api/set，
     而限流只有「每 IP 30 秒一次」，换个 IP 就能接着灌。
     注释里提到的「认领码」过渡路径早就没有了，这里一并收紧。

     顺带把三行 `who &&` 拆开：现在 who 一定存在，
     少一层判断就不会再出现「忘了判空就放行」这种漏法。 */
  const who = await readActiveUser(env, pickToken(request, body), request.headers.get('authorization'))
  if (!who) return json({ error: '请先登录再发布', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)
  entry.ownerUser = who.uid
  entry.ownerName = who.username
  /* fromImage 以前完全由客户端声明（`if (body.fromImage === true)`），
     只要不发这个字段就能冒充原创：拿发布奖励、算绘制格数成就、
     收光尘收票全都通吃。改成服务端自己判断（_camera.js），
     客户端说的只当参考。判为相机作品就把标记锁死，改几个格子也去不掉。 */
  const art = inspectArtwork(pixels, size, body && body.fromImage)
  if (art.verdict === 'camera') {
    entry.fromImage = true
    entry.cameraReason = art.reason
  } else if (art.verdict === 'suspect') {
    entry.suspect = true
  }
  // 判定结果单独留一份，给管理后台核对（不写进作品数据）
  if (art.verdict !== 'normal') {
    try {
      await env.LIGHTFIELD_KV.put(
        'flag:' + entry.time,
        JSON.stringify({
          time: entry.time,
          uid: who ? who.uid : '',
          verdict: art.verdict,
          reason: art.reason,
          grad: Math.round(art.grad * 1000) / 1000,
          colors: art.colors,
          size: size,
        }),
        { expirationTtl: 60 * 60 * 24 * 30 }
      )
    } catch (e) {
      // 留痕失败不该拦住发布
    }
  }
  const entryJson = JSON.stringify(entry)
  if (entryJson.length > 90000) {
    return json({ error: '动画帧数据过大，请减少帧数或简化画面后再试' }, 413)
  }

  try {
    await env.LIGHTFIELD_KV.put('pixels', entryJson)

    const res = await appendEntry(env.LIGHTFIELD_KV, entry)
    if (res.status === 'full') {
      return json(
        { error: `社区作品已达上限（${HISTORY_MAX} 件），请等待维护者清理后再发布` },
        507
      )
    }
  } catch (err) {
    return json({ error: 'KV write failed: ' + err.message }, 500)
  }

  /* 发布奖励：每发一幅得 1 个光尘，每天最多靠发布拿 10 个。
     计数存在 pub:<uid>:<东八区天序号>，天然按天分开，过期自动清掉。
     上限 10 是防刷：一幅画 1 个，10 幅封顶，多发也不加。 */
  let dust = 0
  let dustCapped = false
  let dustTotal = 0
  // 像素相机转图的作品不给发布奖励：导入图片不算创作，
  // 每天白拿 10 个光尘不是我们想鼓励的行为
  if (who && entry.ownerUser && !entry.fromImage) {
    const kv = env.LIGHTFIELD_KV
    const period = 'D' + dayStamp()
    const key = 'pub:' + entry.ownerUser + ':' + period
    const used = Number(await kv.get(key)) || 0
    if (used < PUBLISH_DUST_DAILY_CAP) {
      dust = PUBLISH_DUST_PER_WORK
      // 先加额度再加钱：并发发布时最坏结果是这一笔多加 1 个，
      // 不会变成「记了额度但没发钱」或反之
      await kv.put(key, String(used + dust))
      await creditDust(kv, entry.ownerUser, dust)
      dustTotal = used + dust
    } else {
      dustCapped = true
      dustTotal = used
    }
  }

  return json({
    ok: true,
    count: pixels.length,
    name,
    workName,
    author,
    size,
    time: entry.time,
    dust,
    dustCapped,
    dustTotalToday: dustTotal,
    dustCapToday: PUBLISH_DUST_DAILY_CAP,
  })
}

/** 发布一幅作品给多少光尘 */
export const PUBLISH_DUST_PER_WORK = 1
/** 每天靠发布最多能拿多少光尘 */
export const PUBLISH_DUST_DAILY_CAP = 10