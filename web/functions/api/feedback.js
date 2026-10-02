// 问题反馈：用户提意见，管理员在后台看与处理。
//
// 跟举报（report.js）是两回事，别合并：
//   举报 —— 举报违规内容，要处理的是「对方」，可能封号删作品。
//   反馈 —— 提使用问题或建议，要处理的是「这件事」，采纳之后
//           往往还要回一封信告诉提出的人「采纳了」。
// 混在一起的话，后台那个列表就会一半是「这个人的号有问题」、
// 一半是「这个按钮不好用」，管理员得点开才知道该干什么。
//
// 存储：KV key `feedback`（待处理） / `feedback:log`（已处理留档）
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
}

const PENDING_KEY = 'feedback'
const LOG_KEY = 'feedback:log'
const MAX_PENDING = 500
const MAX_LOG = 1000
const RATE_PREFIX = 'fbrate:'
const RATE_WINDOW_MS = 10 * 60 * 1000 // 10 分钟内同一设备最多 5 条
const RATE_MAX = 5
const NOTE_MAX = 1000

// 这些是「反馈」的分类，跟举报那套「违规类型」不是一回事
const KINDS = {
  bug: '功能不好用',
  idea: '想要的功能',
  look: '界面看着别扭',
  other: '其他',
}

/* 列表必须每次都拿最新的：任何缓存都会让后台看到过期的待处理列表，
   管理员点「采纳」时才发现早就被别人处理过了。 */
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  })

function authorized(request, env) {
  const key = (request.headers.get('x-admin-key') || '').trim()
  const adminKey = env.ADMIN_KEY || ''
  return !!(adminKey && key === adminKey)
}

async function readList(kv, key) {
  const raw = await kv.get(key)
  if (!raw) return []
  try {
    const a = JSON.parse(raw)
    return Array.isArray(a) ? a : []
  } catch {
    return []
  }
}

async function writeList(kv, key, list) {
  await kv.put(key, JSON.stringify(list.slice(-MAX_PENDING)))
}

function clientId(request) {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'anon'
  return String(ip).split(',')[0].trim().slice(0, 60) || 'anon'
}

// 同一设备 10 分钟最多 5 条，挡一下随手刷
async function rateLimited(kv, id) {
  const key = RATE_PREFIX + id
  const now = Date.now()
  const raw = await kv.get(key)
  let times = []
  try {
    const a = JSON.parse(raw || '[]')
    if (Array.isArray(a)) times = a.filter((t) => typeof t === 'number' && now - t < RATE_WINDOW_MS)
  } catch {}
  if (times.length >= RATE_MAX) return true
  times.push(now)
  // KV 的 TTL 不保证支持，读取时已经会把过期的丢掉
  await kv.put(key, JSON.stringify(times))
  return false
}

/* 从 Authorization 头里解出 { uid, username }。

   反馈不强制登录 —— 游客也能提（可能连注册都嫌麻烦），
   所以取不到不算错，返回 null 就行，后台会记成「游客」。
   要用的是 uid 而不是令牌本身：采纳之后要往这个人信箱里塞信，
   拿令牌去查是查不到的。 */
async function whoOf(request, env) {
  const auth = request.headers.get('Authorization') || ''
  if (!/^Bearer\s+/i.test(auth.trim())) return null
  try {
    const { readToken } = await import('./_auth.js')
    // await 不能少：readToken 是 async，少了的话 t 是个 Promise，
    // t.uid 恒为 undefined，于是所有登录用户的 uid 全丢 ——
    // 反馈全都记成游客，后台按 uid 找人时一条都对不上
    const t = await readToken(env, '', auth)
    if (!t || !t.uid) return null
    return { uid: t.uid, username: String(t.username || '') }
  } catch (e) {
    return null
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/* 管理员读取：?all=1 连已处理的留档一起给 */
export async function onRequestGet(context) {
  const { request, env } = context
  if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401)
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const url = new URL(request.url)
  try {
    const pending = await readList(env.LIGHTFIELD_KV, PENDING_KEY)
    const out = { ok: true, kinds: KINDS, feedbacks: pending }
    if (url.searchParams.get('all') === '1') {
      out.log = await readList(env.LIGHTFIELD_KV, LOG_KEY)
    }
    return json(out)
  } catch {
    return json({ error: '读取失败' }, 500)
  }
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

  /* ---------- 管理员处理 ----------
     action:
       adopt  采纳（进留档，并给提出的人回一封信）
       close  已处理但不采纳（比如「这个功能我们不打算做」）
       drop   垃圾/重复，直接丢掉、不留档
     */
  if (body && body.action) {
    if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401)
    const action = String(body.action)
    if (action !== 'adopt' && action !== 'close' && action !== 'drop') {
      return json({ error: 'action 只能是 adopt / close / drop' }, 400)
    }
    const id = String(body.id || '').trim()
    if (!id) return json({ error: '缺少 id' }, 400)

    const pending = await readList(env.LIGHTFIELD_KV, PENDING_KEY)
    const idx = pending.findIndex((r) => r.id === id)
    if (idx === -1) return json({ error: '反馈不存在（可能已被处理）' }, 404)
    const [item] = pending.splice(idx, 1)
    await writeList(env.LIGHTFIELD_KV, PENDING_KEY, pending)

    // drop 不留档：垃圾反馈留在留档里，久了后台就没法看了
    if (action !== 'drop') {
      const note = String((body && body.note) || '').trim().slice(0, 300)
      const log = await readList(env.LIGHTFIELD_KV, LOG_KEY)
      log.push({ ...item, status: action, reply: note, at: Date.now() })
      await writeList(env.LIGHTFIELD_KV, LOG_KEY, log)
    }

    /* 采纳 / 已处理：给提出的人回信。
       uidOf() 给的是签名令牌，不是 uid —— 令牌里取不出 uid 就回不了信，
       所以这里必须用提交时存下来的 uid，而不是从令牌反查。 */
    let mailed = 0
    if ((action === 'adopt' || action === 'close') && item.uid) {
      try {
        const { deliver } = await import('./_mail.js')
        const adopted = action === 'adopt'
        mailed = await deliver(env.LIGHTFIELD_KV, item.uid, {
          id: 'fb-' + item.id,
          title: adopted ? '你的反馈被采纳了' : '关于你的反馈',
          body:
            (adopted ? '谢谢你提的建议，我们决定做：' : '谢谢你提的问题，我们看过了：') +
            item.note +
            (String(body && body.note) ? '\n\n管理员回复：' + String(body.note).trim().slice(0, 300) : ''),
          from: '光域',
        })
      } catch (e) {
        // 回信失败不影响反馈本身已处理
      }
    }
    return json({ ok: true, action, mailed })
  }

  /* ---------- 用户提交 ---------- */
  const kind = String((body && body.kind) || '').trim()
  if (!KINDS[kind]) return json({ error: '请选一个分类' }, 400)

  const note = String((body && body.note) || '').trim().slice(0, NOTE_MAX)
  if (note.length < 4) return json({ error: '多写几个字吧，至少 4 个' }, 400)

  const id = clientId(request)
  try {
    if (await rateLimited(env.LIGHTFIELD_KV, id)) {
      return json({ error: '提交太频繁，请稍后再试' }, 429)
    }
  } catch {}

  const who = await whoOf(request, env)
  /* 名字的取值顺序：登录了就用自己的，不吃前端传的。
     原来是 body.name 排前面，那样任何登录用户改一下请求体就能把
     name 写成「管理员本人」—— 后台看反馈列表时显示的就是这个名字，
     等于随便就能冒充。uid 本来就不受影响（只从令牌取），但显示层
     被伪造就足以骗到人工判断。 */
  const uname =
    (who && who.username) || String((body && body.name) || '').trim().slice(0, 20) || ''

  const pending = await readList(env.LIGHTFIELD_KV, PENDING_KEY)
  // 同一个人连着提一样的，别刷出一堆重复条目
  const dup = pending.find((r) => r.from === id && r.kind === kind && r.note === note)
  if (dup) return json({ ok: true, dup: true })

  pending.push({
    id: 'F' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
    kind,
    note,
    // 登录用户才有 uid，采纳之后才回得了信
    uid: (who && who.uid) || '',
    name: uname || '游客',
    page: String((body && body.page) || '').trim().slice(0, 60),
    from: id,
    at: Date.now(),
  })
  await writeList(env.LIGHTFIELD_KV, PENDING_KEY, pending)
  return json({ ok: true })
}
