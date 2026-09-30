// 房间 Durable Object
//
// 为什么必须用 DO：房间状态需要「读-改-写」且要求读到的是最新值。
// Cloudflare KV 是最终一致的，两个客户端同时操作会各自读到旧快照，
// 再互相覆盖 —— 结果是有人凭空消失、落笔不同步。DO 单线程串行处理每个房间，
// 写入立即对所有读取可见，从根上避免这种覆盖。
import {
  apply,
  readState,
  newRoom,
  stripId,
  MAX_MEMBERS,
  ROOM_TTL,
} from '../api/_roomcore.js'

const KEY = 'room'

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      // 房间状态必须每次都拿最新的，绝不能被任何一层缓存
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  })
}

export class RoomServer {
  constructor(state) {
    this.state = state
    // 同一个房间的并发请求排队执行，杜绝读-改-写竞争
    this.state.blockConcurrencyWhile(async () => {
      const now = Date.now()
      this.room = await this.state.storage.get(KEY)
      if (this.room && this.room.updatedAt && now - this.room.updatedAt > ROOM_TTL * 1000) {
        this.room = null
        await this.state.storage.delete(KEY)
      }
    })
  }

  async save() {
    await this.state.storage.put(KEY, this.room)
    // 到期自动清理，避免空房间长期占用
    this.state.storage.setAlarm(Date.now() + ROOM_TTL * 1000)
  }

  async alarm() {
    const room = await this.state.storage.get(KEY)
    if (!room) return
    if (!room.updatedAt || Date.now() - room.updatedAt > ROOM_TTL * 1000) {
      await this.state.storage.delete(KEY)
    }
  }

  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: json({}, 204).headers })

    if (request.method === 'GET') {
      const url = new URL(request.url)
      const viewerId = url.searchParams.get('id') || ''
      const res = readState(this.room, viewerId)
      if (res.changed && this.room) await this.save()
      return json(res.payload, res.status)
    }

    if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const action = (body && body.action) || ''

    // 建房：DO 名字由调用方按新房间码生成，这里只需写入初始状态
    if (action === 'create') {
      const mode = body && body.mode === 'game' ? 'game' : 'free'
      const name = body && typeof body.name === 'string' ? body.name.trim() : ''
      // 房间码必须由调用方指定：DO 实例是按这个码命名的，
      // 若这里另生成一个，客户端后续就会请求到别的房间去。
      const code = String((body && body.code) || '').toUpperCase().trim()
      if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
      this.room = newRoom(code, mode)
      const id = body && body.id ? String(body.id) : crypto.randomUUID()
      this.room.members.push({ id, name: name || '匿名' })
      this.room.updatedAt = Date.now()
      await this.save()
      return json({ ok: true, id, state: stripId(this.room, id) })
    }

    const res = apply(this.room, body)
    if (res.drop) {
      this.room = null
      await this.state.storage.delete(KEY)
      return json(res.payload, res.status)
    }
    if (res.changed && this.room) await this.save()
    return json(res.payload, res.status)
  }
}

export { MAX_MEMBERS }
