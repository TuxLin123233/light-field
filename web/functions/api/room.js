// 房间接口入口
//
// 优先走 Durable Object（强一致，多人同时操作不会互相覆盖）。
// 若尚未配置 ROOM 绑定，则降级到旧的 KV 实现：KV 是最终一致的，
// 并发写会互相覆盖，可能出现「有人凭空消失 / 落笔不同步」，仅作为过渡兜底。
import {
  apply,
  readState,
  newRoom,
  newCode,
  roomSummary,
  pruneGhosts,
  pwHash,
  MAX_MEMBERS,
  ROOM_TTL,
  GHOST_MS,
} from './_roomcore.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

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

const roomKey = (code) => 'room:' + code

// 列表里的「在线」判定：超过这些时间没动过就不展示，避免堆满废弃房间
const IDLE_HIDE_MS = 3 * 60 * 1000 // 满 3 分钟没动静 → 隐藏
const SOLO_HIDE_MS = 60 * 1000 // 只有 1 人且 1 分钟没动 → 隐藏

/* ============================ Durable Object 路径 ============================ */

function doAvailable(env) {
  return !!(env.ROOM && typeof env.ROOM.idFromName === 'function')
}

async function viaDO(env, request, url) {
  if (request.method === 'GET') {
    const code = (url.searchParams.get('code') || '').toUpperCase().trim()
    if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
    const stub = env.ROOM.get(env.ROOM.idFromName(code))
    return stub.fetch('https://do/room?code=' + code + '&id=' + encodeURIComponent(url.searchParams.get('id') || ''))
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  const action = (body && body.action) || ''

  if (action === 'create') {
    // 建房要找一个没被占用的房间码：先在 KV 里快速查重，再落到对应 DO
    let code = ''
    for (let i = 0; i < 6; i++) {
      code = newCode()
      if (!(await env.LIGHTFIELD_KV.get(roomKey(code)))) break
    }
    const stub = env.ROOM.get(env.ROOM.idFromName(code))
    const res = await stub.fetch('https://do/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        code,
        mode: (body && body.mode) || 'free',
        name: (body && body.name) || '',
        pw: (body && body.pw) || '',
        id: crypto.randomUUID(),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return json(data, res.status)
    // 对外仍沿用旧协议：只回房间码，客户端自己再 join 一次拿 id
    return json({ ok: true, code, maxMembers: MAX_MEMBERS })
  }

  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const stub = env.ROOM.get(env.ROOM.idFromName(code))
  return stub.fetch('https://do/room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/* ============================== KV 降级路径 ============================== */

async function readRoomKV(kv, code) {
  const raw = await kv.get(roomKey(code))
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function viaKV(env, request, url) {
  const kv = env.LIGHTFIELD_KV

  if (request.method === 'GET') {
    const code = (url.searchParams.get('code') || '').toUpperCase().trim()
    if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
    const id = url.searchParams.get('id') || ''
    const room = await readRoomKV(kv, code)
    const res = readState(room, id)
    if (res.drop) {
      // 全是鬼成员，房间直接销毁
      await kv.delete(roomKey(code))
      return json({ ok: true, gone: true, state: null }, 200)
    }
    if (res.changed && room) await kv.put(roomKey(code), JSON.stringify(room), { expirationTtl: ROOM_TTL })
    return json(res.payload, res.status)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  const action = (body && body.action) || ''

  if (action === 'create') {
    const mode = body && body.mode === 'game' ? 'game' : 'free'
    const pw = String((body && body.pw) || '').trim().slice(0, 20)
    let code = ''
    for (let i = 0; i < 6; i++) {
      code = newCode()
      if (!(await kv.get(roomKey(code)))) break
    }
    const room = newRoom(code, mode)
    if (pw) room.pw = pwHash(pw)
    await kv.put(roomKey(code), JSON.stringify(room), { expirationTtl: ROOM_TTL })
    return json({ ok: true, code, maxMembers: MAX_MEMBERS, hasPassword: !!room.pw })
  }

  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)

  const room = await readRoomKV(kv, code)
  if (action === 'join' && !room) {
    // 房间刚建好时 KV 可能还没同步到，视为可加入并补建状态
    const created = newRoom(code, (body && body.mode) || 'free')
    const res = apply(created, body)
    await kv.put(roomKey(code), JSON.stringify(created), { expirationTtl: ROOM_TTL })
    return json(res.payload, res.status)
  }

  const res = apply(room, body)
  if (res.drop) {
    await kv.delete(roomKey(code))
  } else if (res.changed && room) {
    await kv.put(roomKey(code), JSON.stringify(room), { expirationTtl: ROOM_TTL })
  }
  return json(res.payload, res.status)
}

/* ============================== 在线房间列表 ============================== */

/**
 * 列出当前还活着的房间。
 * 直接扫 KV 的 room: 前缀，按人数/更新时间排序，只回摘要不含像素数据。
 */
async function listRooms(env) {
  const kv = env.LIGHTFIELD_KV
  const now = Date.now()
  const out = []
  let cursor = null
  // 房间最多 6 人、TTL 30 分钟，扫 200 条足够覆盖活跃房间
  for (let page = 0; page < 4; page++) {
    const res = await kv.list({ prefix: 'room:', cursor, limit: 200 })
    for (const key of res.keys) {
      const raw = await kv.get(key.name)
      if (!raw) continue
      let room
      try {
        room = JSON.parse(raw)
      } catch {
        continue
      }
      if (!room || !room.code) continue
      if (!room.members || !room.members.length) continue

      // 先把鬼成员清掉，只统计真正在线的人
      pruneGhosts(room)
      const summary = roomSummary(room)
      // 一个活人都没有 → 这是个鬼房间，不展示（下次有人访问时会被销毁）
      if (!summary.live) continue

      // 闲置房间不展示：房间里最后有人操作才算出「在线」
      const idleMs = now - (room.updatedAt || 0)
      if (idleMs > IDLE_HIDE_MS) continue
      // 只有一个人的房间多半是等人等了没来，等太久就不再占用列表
      if (summary.live < 2 && idleMs > SOLO_HIDE_MS) continue

      out.push(summary)
    }
    if (out.length >= 60 || res.list_complete) break
    cursor = res.cursor
  }
  // 有人多的优先，其次最近活跃的优先
  out.sort((a, b) => b.members - a.members || b.updatedAt - a.updatedAt)
  return { ok: true, rooms: out.slice(0, 40) }
}

/* ================================ 入口 ================================ */

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const url = new URL(request.url)
  if (url.searchParams.get('action') === 'list') return json(await listRooms(env))
  return doAvailable(env) ? viaDO(env, request, url) : viaKV(env, request, url)
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  return doAvailable(env) ? viaDO(env, request, new URL(request.url)) : viaKV(env, request, new URL(request.url))
}
