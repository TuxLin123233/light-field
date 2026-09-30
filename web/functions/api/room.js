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
const MAX_MEMBERS = 6
const DRAW_GAP_MS = 250
const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const ROUND_MS = 90000

const GUESS_WORDS = [
  // 动物 10
  '大象', '长颈鹿', '企鹅', '熊猫', '螃蟹', '章鱼', '刺猬', '袋鼠', '鳄鱼', '孔雀',
  // 食物 10
  '汉堡', '披萨', '寿司', '冰淇淋', '火锅', '烤鸭', '爆米花', '棒棒糖', '三明治', '珍珠奶茶',
  // 日常物品 10
  '雨伞', '牙刷', '眼镜', '闹钟', '台灯', '钥匙', '背包', '水杯', '剪刀', '吹风机',
  // 自然与天气 10
  '彩虹', '闪电', '龙卷风', '火山', '瀑布', '沙漠', '雪人', '流星', '海岛', '森林',
  // 职业与人物 10
  '医生', '消防员', '宇航员', '厨师', '警察', '老师', '魔术师', '小丑', '海盗', '忍者',
  // 交通工具 10
  '热气球', '潜水艇', '消防车', '火箭', '帆船', '直升机', '独轮车', '缆车', '雪橇', '飞碟',
  // 建筑与地点 10
  '灯塔', '城堡', '帐篷', '风车', '摩天轮', '过山车', '游泳池', '加油站', '图书馆', '游乐园',
  // 动作与事件 10
  '刷牙', '打喷嚏', '钓鱼', '跳绳', '拍照', '吹蜡烛', '放风筝', '堆雪人', '打篮球', '弹吉他',
  // 幻想与角色 10
  '美人鱼', '独角兽', '龙', '幽灵', '机器人', '外星人', '巫师', '雪怪', '木乃伊', '精灵',
  // 节日与文化 10
  '圣诞树', '南瓜灯', '红包', '舞龙', '月饼', '粽子', '孙悟空', '超人', '蜘蛛侠', '皮卡丘',
]

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

function stripId(room, viewerId) {
  const g = room.game
  return {
    code: room.code,
    created: room.created,
    version: room.version,
    pixels: room.pixels,
    members: room.members,
    title: room.title || '',
    updatedAt: room.updatedAt,
    maxMembers: MAX_MEMBERS,
    mode: room.mode === 'game' ? 'game' : 'free',
    game: g
      ? {
          active: g.active,
          round: g.round,
          painterId: g.painterId,
          phase: g.phase,
          scores: g.scores,
          lastCorrect: g.lastCorrect,
          lastWord: g.lastWord,
          endAt: g.endAt,
          myWord: viewerId && g.active && g.painterId === viewerId ? g.word : '',
        }
      : null,
  }
}

function blankPixels() {
  return Array.from({ length: 256 }, () => [255, 255, 255])
}

function randomWord() {
  return GUESS_WORDS[Math.floor(Math.random() * GUESS_WORDS.length)]
}

function normalizeGuess(s) {
  return String(s || '')
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .toLowerCase()
    .replace(/[\s，。,.!！?？、；;：:""''“”‘’()（）\-—_~@#￥%…·【】\[\]]/g, '')
}

function memberIndex(room, id) {
  return room.members.findIndex((m) => m.id === id)
}

function memberName(room, id) {
  const m = room.members.find((x) => x.id === id)
  return m ? m.name || '匿名' : '？'
}

function nextRound(room) {
  const g = room.game
  const members = room.members
  const last = g.painterIdx >= 0 ? g.painterIdx : members.length - 1
  g.painterIdx = (last + 1) % members.length
  g.round += 1
  g.painterId = members[g.painterIdx].id
  g.phase = 'drawing'
  g.word = randomWord()
  g.endAt = Date.now() + ROUND_MS
  g.lastCorrect = null
  g.lastWord = ''
  room.version += 1
  room.pixels = blankPixels()
  room.updatedAt = Date.now()
}

function startGame(room) {
  const scores = {}
  for (const m of room.members) scores[m.id] = 0
  room.game = {
    active: true,
    round: 0,
    painterIdx: -1,
    painterId: '',
    phase: 'drawing',
    word: '',
    scores,
    endAt: 0,
    lastCorrect: null,
    lastWord: '',
  }
  nextRound(room)
}

function maybeAdvance(room) {
  const g = room.game
  if (!g || !g.active) return false
  const now = Date.now()
  const members = room.members
  if (members.length < 2) {
    g.active = false
    return true
  }
  if (!members.some((m) => m.id === g.painterId)) {
    g.painterIdx = (g.painterIdx + 1) % members.length
    nextRound(room)
    return true
  }
  if (g.phase === 'drawing' && now >= g.endAt) {
    g.phase = 'over'
    g.lastCorrect = null
    g.lastWord = g.word
    room.updatedAt = now
    return true
  }
  if (g.phase === 'over') {
    nextRound(room)
    return true
  }
  return false
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

async function handleCreate(env, body) {
  const name = (body && typeof body.name === 'string' ? body.name : '').trim()
  const mode = body && body.mode === 'game' ? 'game' : 'free'
  let code = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    code = newCode()
    if (!(await env.LIGHTFIELD_KV.get('room:' + code))) break
  }
  const room = {
    code,
    created: Date.now(),
    version: 0,
    pixels: blankPixels(),
    members: [],
    title: '',
    updatedAt: Date.now(),
    mode,
    game: null,
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
    return json({ ok: true, id: existing.id, state: stripId(room, existingId) })
  }

  if (room.members.length >= MAX_MEMBERS) return json({ error: '房间已满（最多 ' + MAX_MEMBERS + ' 人）' }, 409)

  const id = crypto.randomUUID()
  room.members.push({ id, name: name || '匿名' })
  room.updatedAt = Date.now()
  if (room.game) room.game.scores[id] = 0
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, id, state: stripId(room, id) })
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

  if (room.game && room.game.active) {
    if (room.game.painterId !== id) {
      return json({ error: '当前不是你画画（轮到 ' + memberName(room, room.game.painterId) + ' 作画）', state: stripId(room, id) }, 403)
    }
    if (maybeAdvance(room)) await writeRoom(env.LIGHTFIELD_KV, room)
    if (room.game.phase !== 'drawing' || room.game.painterId !== id) {
      return json({ error: '本回合已结束，请等待下一回合', state: stripId(room, id) }, 409)
    }
  }

  const now = Date.now()
  if (Number.isFinite(baseVersion) && baseVersion !== room.version) {
    return json({ error: '画布已更新，请重新同步', state: stripId(room, id) }, 409)
  }
  if (now - room.updatedAt < DRAW_GAP_MS) {
    return json({ error: '操作太快，请稍候', state: stripId(room, id) }, 429)
  }

  room.version += 1
  room.pixels = pixels
  room.updatedAt = now
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, state: stripId(room, id) })
}

async function handleTitle(env, body) {
  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const id = (body && body.id) || ''
  const title = ((body && body.title) || '').toString().slice(0, 20)

  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)
  if (!room.members.some((m) => m.id === id)) return json({ error: '请先加入房间' }, 403)

  if (maybeAdvance(room)) await writeRoom(env.LIGHTFIELD_KV, room)
  if (room.game && room.game.active && room.game.painterId === id) {
    return json({ error: '游戏中由画师统一命名' }, 403)
  }

  room.title = title
  room.updatedAt = Date.now()
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, state: stripId(room, id) })
}

async function handleGameStart(env, body) {
  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const id = (body && body.id) || ''

  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)
  if (!room.members.some((m) => m.id === id)) return json({ error: '请先加入房间' }, 403)
  if (room.members.length < 2) return json({ error: '至少需要 2 人才能开始' }, 400)
  if (room.mode !== 'game') return json({ error: '自由模式房间无法开始你画我猜' }, 403)
  if (room.game && room.game.active) return json({ error: '游戏已在进行中' }, 409)

  startGame(room)
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, state: stripId(room, id) })
}

async function handleGuess(env, body) {
  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const id = (body && body.id) || ''
  const text = String((body && body.guess) || '').trim().slice(0, 30)

  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)
  if (!room.members.some((m) => m.id === id)) return json({ error: '请先加入房间' }, 403)
  if (maybeAdvance(room)) await writeRoom(env.LIGHTFIELD_KV, room)
  const g = room.game
  if (!g || !g.active) return json({ error: '游戏未开始', state: stripId(room, id) }, 400)
  if (memberIndex(room, id) === g.painterIdx) return json({ error: '画师不能猜自己的题' }, 403)
  if (g.phase !== 'drawing') return json({ error: '本回合已结束，等下一回合', state: stripId(room, id) }, 409)

  const guess = normalizeGuess(text)
  if (!guess) return json({ error: '输入要猜的词' }, 400)

  if (guess === normalizeGuess(g.word)) {
    const scores = g.scores
    scores[id] = (scores[id] || 0) + 10
    scores[g.painterId] = (scores[g.painterId] || 0) + 5
    g.phase = 'over'
    g.lastCorrect = id
    g.lastWord = g.word
    room.updatedAt = Date.now()
    await writeRoom(env.LIGHTFIELD_KV, room)
    return json({ ok: true, correct: true, state: stripId(room, id) })
  }

  room.updatedAt = Date.now()
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, correct: false })
}

async function handleSkip(env, body) {
  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const id = (body && body.id) || ''

  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)
  if (!room.members.some((m) => m.id === id)) return json({ error: '请先加入房间' }, 403)
  const g = room.game
  if (!g || !g.active) return json({ error: '游戏未开始', state: stripId(room, id) }, 400)
  if (id !== g.painterId) return json({ error: '只有画师能跳过' }, 403)
  if (g.phase !== 'drawing') return json({ error: '本回合已结束，等下一回合', state: stripId(room, id) }, 409)

  g.phase = 'over'
  g.lastCorrect = null
  g.lastWord = g.word
  room.updatedAt = Date.now()
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, state: stripId(room, id) })
}

async function handleGameEnd(env, body) {
  const code = ((body && body.code) || '').toString().toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const id = (body && body.id) || ''

  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)
  if (!room.members.some((m) => m.id === id)) return json({ error: '请先加入房间' }, 403)

  room.game = null
  room.updatedAt = Date.now()
  await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true })
}

async function handleGet(env, url) {
  const code = (url.searchParams.get('code') || '').toUpperCase().trim()
  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: '房间码格式不正确' }, 400)
  const id = (url.searchParams.get('id') || '')
  const room = await readRoom(env.LIGHTFIELD_KV, code)
  if (!room) return json({ error: '房间不存在或已过期' }, 404)
  if (maybeAdvance(room)) await writeRoom(env.LIGHTFIELD_KV, room)
  return json({ ok: true, state: stripId(room, id) })
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
  if (action === 'gamestart') return handleGameStart(env, body)
  if (action === 'guess') return handleGuess(env, body)
  if (action === 'skip') return handleSkip(env, body)
  if (action === 'endgame') return handleGameEnd(env, body)
  return json({ error: '缺少 action（create/join/leave/draw/title/gamestart/guess/skip/endgame）' }, 400)
}