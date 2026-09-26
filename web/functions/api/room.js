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

const ROOM_TTL = 1800
const MAX_MEMBERS = 3
const DRAW_GAP_MS = 1500
const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function newCode() {
  let s = ''
  for (let i = 0; i < 6; i++) {
    s += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)]
  }
  return s
}

async function readRoom(kv, code) {
  const raw = await kv.get('room:' + code)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function writeRoom(kv, room) {
  await kv.put('room:' + room.code, JSON.stringify(room), { expirationTtl: ROOM_TTL })
}

function normalizePixels(pixels) {
  if (!Array.isArray(pixels) || pixels.length !== 256) return null
  const out = new Array(256)
  for (let i = 0; i < 256; i++) {
    const p = pixels[i]
    if (!Array.isArray(p) || p.length !== 3) return null
    out[i] = [
      Math.max(0, Math.min(255, Math.round(Number(p[0]) || 0))),
      Math.max(0, Math.min(255, Math.round(Number(p[1]) || 0))),
      Math.max(0, Math.min(255, Math.round(Number(p[2]) || 0))),
    ]
  }
  return out
}

function stripId(room) {
  return {
    code: room.code,
    created: room.created,
    version: room.version,
    pixels: room.pixels,
    members: room.members,
    title: room.title || '',
    updatedAt: room.updatedAt,
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

async function handleCreate(env, body) {
  const name = (body && typeof body.name === 'string' ? body.name : '').trim()
  let code = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    code = newCode()
    if (!(await env.LIGHTFIELD_KV.get('room:' + code))) break
  }
  const room = {
    code,
    created: Date.now(),
    version: 0,
    pixels: Array.from({ length: 256 }, () => [255, 255, 255]),
    members: [],
    title: '',
    updatedAt: Date.now(),
  }
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, code, maxMembers: MAX_MEMBERS })
}

async function handleJoin(env, body) {
  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const name = (body && typeof body.name === 'string' ? body.name : '').trim()

  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)

  const existingId = (body && body.id) || ''
  const existing = room.members.find((m) => m.id === existingId)
  if (existing) {
    if (name) existing.name = name
    room.updatedAt = Date.now()
    await writeRoom(env.LIGHTFIELD_KV, room)
    return json({ ok: true, id: existing.id, state: stripId(room) })
  }

  if (room.members.length >= MAX_MEMBERS) return json({ error: '房间已满（最多 3 人）' }, 409)

  const id = crypto.randomUUID()
  room.members.push({ id, name: name || '匿名' })
  room.updatedAt = Date.now()
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, id, state: stripId(room) })
}

async function handleLeave(env, body) {
  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  const id = (body && body.id) || ''
  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ ok: true })
  room.members = room.members.filter((m) => m.id !== id)
  room.updatedAt = Date.now()
  if (!room.members.length) {
    await env.LIGHTFIELD_KV.delete('room:' + code)
  } else {
    await writeRoom(env.LIGHTFIELD_KV, room)
  }
  return json({ ok: true })
}

async function handleDraw(env, body) {
  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const id = (body && body.id) || ''
  const baseVersion = Number(body && body.version)
  const pixels = normalizePixels(body && body.pixels)
  if (!pixels) return json({ error: 'pixels 必须是 256×3 的二维数组（每个元素是 [r,g,b]）' }, 400)

  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)
  if (!room.members.some((m) => m.id === id)) return json({ error: '请先加入房间' }, 403)

  const now = Date.now()
  if (Number.isFinite(baseVersion) && baseVersion !== room.version) {
    return json({ error: '画布已更新，请重新同步', state: stripId(room) }, 409)
  }
  if (now - room.updatedAt < DRAW_GAP_MS) {
    return json({ error: '操作太快，请稍候', state: stripId(room) }, 429)
  }

  room.version += 1
  room.pixels = pixels
  room.updatedAt = now
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, state: stripId(room) })
}

async function handleTitle(env, body) {
  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const id = (body && body.id) || ''
  const title = ((body && body.title) || '').toString().slice(0, 20)

  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)
  if (!room.members.some((m) => m.id === id)) return json({ error: '请先加入房间' }, 403)

  room.title = title
  room.updatedAt = Date.now()
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, state: stripId(room) })
}

async function handleGet(env, url) {
  const code = (url.searchParams.get('code') || '').toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)
  return json({ ok: true, state: stripId(room) })
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  return handleGet(env, new URL(request.url))
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

  const action = (body && body.action) || ''
  if (action === 'create') return handleCreate(env, body)
  if (action === 'join') return handleJoin(env, body)
  if (action === 'leave') return handleLeave(env, body)
  if (action === 'draw') return handleDraw(env, body)
  if (action === 'title') return handleTitle(env, body)
  return json({ error: '缺少 action（create/join/leave/draw/title）' }, 400)
}