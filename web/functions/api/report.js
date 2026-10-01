// 举报：用户提交违规内容举报，管理员在后台查看与处理。
// 存储：KV key `reports`（待处理） / `reports:log`（已处理留档）
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
}

const PENDING_KEY = 'reports'
const LOG_KEY = 'reports:log'
const MAX_PENDING = 500
const MAX_LOG = 500
const RATE_PREFIX = 'reportrate:'
const RATE_WINDOW_MS = 10 * 60 * 1000 // 10 分钟内同一设备最多 5 条
const RATE_MAX = 5

// 举报列表必须每次都拿到最新：任何缓存都会导致后台看到过期的待处理列表
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

// 简单频率限制，避免被刷
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
  // KV 没有 TTL 保证，这里自行写入时间戳，读取时已经会过期丢弃
  await kv.put(key, JSON.stringify(times))
  return false
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

// 管理员读取待处理举报
export async function onRequestGet(context) {
  const { request, env } = context
  if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401)
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  try {
    const pending = await readList(env.LIGHTFIELD_KV, PENDING_KEY)
    return json({ ok: true, reports: pending })
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

  // 管理员处理动作：done（忽略/已处理）或 remove（同时删除作品）
  if (body && body.action) {
    if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401)
    const id = String(body.id || '')
    if (!id) return json({ error: '缺少 id' }, 400)
    const pending = await readList(env.LIGHTFIELD_KV, PENDING_KEY)
    const idx = pending.findIndex((r) => r.id === id)
    if (idx === -1) return json({ error: '举报不存在' }, 404)
    const [item] = pending.splice(idx, 1)
    await writeList(env.LIGHTFIELD_KV, PENDING_KEY, pending)

    const log = await readList(env.LIGHTFIELD_KV, LOG_KEY)
    log.push({ ...item, status: String(body.action), at: Date.now() })
    await writeList(env.LIGHTFIELD_KV, LOG_KEY, log)

    if (body.action === 'remove') {
      try {
        const { removeByTime } = await import('./_history.js')
        await removeByTime(env.LIGHTFIELD_KV, Number(item.time))
      } catch (e) {
        // 作品删除失败不影响举报本身已处理
      }
    }
    // 举报用户：顺带把对方封禁，省得再点一次
    if (body.action === 'banuser' && item.targetUid) {
      try {
        const { readUser, setBanned } = await import('./_auth.js')
        const u = await readUser(env.LIGHTFIELD_KV, item.targetUid)
        if (u) await setBanned(env.LIGHTFIELD_KV, item.targetUid, true, item.reason || '被举报核实')
      } catch (e) {
        // 封禁失败不影响举报本身已处理
      }
    }
    return json({ ok: true, action: body.action })
  }

  // 举报用户（而不是举报作品）：走 target:'user'
  if (body && body.target === 'user') {
    const targetUid = String((body && body.uid) || '').trim()
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(targetUid)) {
      return json({ error: '缺少或非法的 uid' }, 400)
    }
    const name = String((body && body.name) || '').trim().slice(0, 20)
    if (!name) return json({ error: '缺少用户名' }, 400)

    const id = clientId(request)
    try {
      if (await rateLimited(env.LIGHTFIELD_KV, id)) {
        return json({ error: '提交太频繁，请稍后再试' }, 429)
      }
    } catch {}

    const reason = String((body && body.reason) || '').trim().slice(0, 20) || '其他'
    const note = String((body && body.note) || '').trim().slice(0, 200)

    const pending = await readList(env.LIGHTFIELD_KV, PENDING_KEY)
    // 同一个人对同一个账号只留一条
    const dup = pending.find((r) => r.targetUid === targetUid && r.from === id)
    if (dup) return json({ ok: true, dup: true })

    pending.push({
      id: 'U' + targetUid + '-' + Date.now().toString(36),
      target: 'user',
      targetUid,
      title: name,
      author: name,
      time: 0, // 用户举报没有作品时间
      reason,
      note,
      from: id,
      at: Date.now(),
    })
    await writeList(env.LIGHTFIELD_KV, PENDING_KEY, pending)
    return json({ ok: true })
  }

  // 普通用户提交举报
  const time = Number(body && body.time)
  if (!Number.isFinite(time)) return json({ error: '缺少 time 字段' }, 400)

  const reason = String((body && body.reason) || '').trim().slice(0, 20) || '其他'
  const note = String((body && body.note) || '').trim().slice(0, 200)

  const id = clientId(request)
  try {
    if (await rateLimited(env.LIGHTFIELD_KV, id)) {
      return json({ error: '提交太频繁，请稍后再试' }, 429)
    }
  } catch {}

  const pending = await readList(env.LIGHTFIELD_KV, PENDING_KEY)
  // 同一个人对同一作品只留一条
  const dup = pending.find((r) => r.time === time && r.from === id)
  if (dup) return json({ ok: true, dup: true })

  pending.push({
    id: time + '-' + Date.now().toString(36),
    time,
    reason,
    note,
    from: id,
    title: String((body && body.title) || '').trim().slice(0, 40),
    author: String((body && body.author) || '').trim().slice(0, 20),
    at: Date.now(),
  })
  await writeList(env.LIGHTFIELD_KV, PENDING_KEY, pending)

  return json({ ok: true })
}
