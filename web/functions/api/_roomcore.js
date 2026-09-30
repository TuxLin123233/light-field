// 房间核心逻辑：完全不碰存储，输入 (state, body) 输出新的 state 与响应。
// 这样 Durable Object（强一致）与 KV（降级）两条路径共用同一份规则，行为完全一致。

export const ROOM_TTL = 1800
export const MAX_MEMBERS = 6
export const DRAW_GAP_MS = 250
export const ROUND_MS = 90000
// 超过这个时间没心跳的成员视为「鬼」（掉线但没发到离开请求），会被清掉
export const GHOST_MS = 25000
export const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export const GUESS_WORDS = [
  '大象', '长颈鹿', '企鹅', '熊猫', '螃蟹', '章鱼', '刺猬', '袋鼠', '鳄鱼', '孔雀',
  '汉堡', '披萨', '寿司', '冰淇淋', '火锅', '烤鸭', '爆米花', '棒棒糖', '三明治', '珍珠奶茶',
  '雨伞', '牙刷', '眼镜', '闹钟', '台灯', '钥匙', '背包', '水杯', '剪刀', '吹风机',
  '彩虹', '闪电', '龙卷风', '火山', '瀑布', '沙漠', '雪人', '流星', '海岛', '森林',
  '医生', '消防员', '宇航员', '厨师', '警察', '老师', '魔术师', '小丑', '海盗', '忍者',
  '热气球', '潜水艇', '消防车', '火箭', '帆船', '直升机', '独轮车', '缆车', '雪橇', '飞碟',
  '灯塔', '城堡', '帐篷', '风车', '摩天轮', '过山车', '游泳池', '加油站', '图书馆', '游乐园',
  '刷牙', '打喷嚏', '钓鱼', '跳绳', '拍照', '吹蜡烛', '放风筝', '堆雪人', '打篮球', '弹吉他',
  '美人鱼', '独角兽', '龙', '幽灵', '机器人', '外星人', '巫师', '雪怪', '木乃伊', '精灵',
  '圣诞树', '南瓜灯', '红包', '舞龙', '月饼', '粽子', '孙悟空', '超人', '蜘蛛侠', '皮卡丘',
]

export function newCode() {
  let s = ''
  for (let i = 0; i < 6; i++) {
    s += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)]
  }
  return s
}

export function blankPixels() {
  return Array.from({ length: 256 }, () => [255, 255, 255])
}

export function newRoom(code, mode) {
  return {
    code,
    created: Date.now(),
    version: 0,
    pixels: blankPixels(),
    members: [],
    title: '',
    updatedAt: Date.now(),
    mode: mode === 'game' ? 'game' : 'free',
    // 密码只存哈希，原文永不落库
    pw: null,
    game: null,
  }
}

/** 极简哈希：仅用于「是不是同一个密码」的判断，不承担安全性 */
export function pwHash(s) {
  let h = 2166136261
  const str = String(s || '')
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

export function normalizePixels(pixels) {
  if (!Array.isArray(pixels) || pixels.length !== 256) return null
  const out = new Array(256)
  for (let i = 0; i < 256; i++) {
    const p = pixels[i]
    if (!Array.isArray(p) || p.length < 3) return null
    out[i] = [
      Math.max(0, Math.min(255, Math.round(Number(p[0]) || 0))),
      Math.max(0, Math.min(255, Math.round(Number(p[1]) || 0))),
      Math.max(0, Math.min(255, Math.round(Number(p[2]) || 0))),
    ]
  }
  return out
}

export function stripId(room, viewerId) {
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
    hasPassword: !!room.pw,
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

function randomWord() {
  return GUESS_WORDS[Math.floor(Math.random() * GUESS_WORDS.length)]
}

export function normalizeGuess(s) {
  return String(s || '')
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .toLowerCase()
    .replace(/[\s，。,.!！?？、；;：:""''“”‘’()（）\-—_~@#￥%…·【】\[\]]/g, '')
}

/**
 * 清掉「鬼成员」：心跳超时的成员直接移除。
 * 没有心跳时间的旧房间，按房间最后更新时间兜底判断。
 * 返回 true 表示成员列表变了。
 */
export function pruneGhosts(room) {
  const now = Date.now()
  const fallback = room.updatedAt || 0
  const before = room.members.length
  room.members = room.members.filter((m) => {
    const seen = typeof m.seenAt === 'number' ? m.seenAt : fallback
    return now - seen <= GHOST_MS
  })
  if (room.members.length === before) return false
  // 分数表同步清理
  if (room.game) {
    for (const id of Object.keys(room.game.scores)) {
      if (!room.members.some((m) => m.id === id)) delete room.game.scores[id]
    }
  }
  room.updatedAt = now
  return true
}

/** 标记某个成员此刻在线 */
export function touchMember(room, id) {
  const m = room.members.find((x) => x.id === id)
  if (!m) return false
  m.seenAt = Date.now()
  return true
}

export function memberIndex(room, id) {
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

/** 推进回合状态；返回 true 表示状态发生了变化（需要落盘） */
export function maybeAdvance(room) {
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

/* ---------------------------------------------------------------------------
 * 纯状态迁移：apply(state, body) → { status, payload, changed, drop }
 *   state  为 null 表示房间不存在
 *   changed 表示内存里的 state 被改动，需要写回存储
 *   drop    表示房间已空，可以删除
 * ------------------------------------------------------------------------- */
export function apply(state, body) {
  const action = (body && body.action) || ''
  const id = (body && body.id) || ''
  if (action !== 'leave') touchMember(state, id)
  const code = ((body && body.code) || '').toString().toUpperCase().trim()

  if (!state) {
    // 房间不存在时，只有 join 之外的动作都没有意义
    return { status: 404, payload: { error: '房间不存在或已过期' } }
  }

  pruneGhosts(state)
  if (!state.members.length && action !== 'join') {
    return { status: 200, changed: true, drop: true, payload: { ok: true } }
  }

  switch (action) {
    case 'join': {
      const name = (body && typeof body.name === 'string' ? body.name : '').trim()
      const existing = state.members.find((m) => m.id === id)
      if (state.pw) {
        const given = (body && body.pw) || ''
        if (pwHash(given) !== state.pw) {
          return { status: 401, payload: { error: '房间密码不正确' } }
        }
      }
      if (existing) {
        if (name) existing.name = name
        state.updatedAt = Date.now()
        return {
          status: 200,
          changed: true,
          payload: { ok: true, id: existing.id, state: stripId(state, existing.id) },
        }
      }
      if (state.members.length >= MAX_MEMBERS) {
        return { status: 409, payload: { error: '房间已满（最多 ' + MAX_MEMBERS + ' 人）' } }
      }
      // 同一个人重新进来时（换了设备/清过缓存会生成新 id），
      // 若房间里已有同名成员，视为重连：删掉旧的沿用新 id，
      // 避免列表里出现好几个同名的人
      const sameName = state.members.filter(
        (m) => (m.name || '匿名') === (name || '匿名')
      )
      if (sameName.length && !existing) {
        sameName.forEach((m) => {
          if (state.game) delete state.game.scores[m.id]
        })
        state.members = state.members.filter((m) => sameName.indexOf(m) === -1)
      }
      const newId = body && body.newId ? String(body.newId) : crypto.randomUUID()
      state.members.push({ id: newId, name: name || '匿名', seenAt: Date.now() })
      state.updatedAt = Date.now()
      if (state.game) state.game.scores[newId] = 0
      return {
        status: 200,
        changed: true,
        payload: { ok: true, id: newId, state: stripId(state, newId) },
      }
    }

    case 'leave': {
      state.members = state.members.filter((m) => m.id !== id)
      state.updatedAt = Date.now()
      if (state.game) delete state.game.scores[id]
      if (!state.members.length) {
        return { status: 200, changed: true, drop: true, payload: { ok: true } }
      }
      return { status: 200, changed: true, payload: { ok: true } }
    }

    case 'draw': {
      const baseVersion = Number(body && body.version)
      const pixels = normalizePixels(body && body.pixels)
      if (!pixels) {
        return {
          status: 400,
          payload: { error: 'pixels 必须是 256×3 的二维数组（每个元素是 [r,g,b]）' },
        }
      }
      if (!state.members.some((m) => m.id === id)) {
        return { status: 403, payload: { error: '请先加入房间' } }
      }
      if (state.game && state.game.active) {
        if (state.game.painterId !== id) {
          return {
            status: 403,
            payload: {
              error: '当前不是你画画（轮到 ' + memberName(state, state.game.painterId) + ' 作画）',
              state: stripId(state, id),
            },
          }
        }
        if (maybeAdvance(state)) {
          if (state.game.phase !== 'drawing' || state.game.painterId !== id) {
            return {
              status: 409,
              changed: true,
              payload: { error: '本回合已结束，请等待下一回合', state: stripId(state, id) },
            }
          }
        }
      }
      const now = Date.now()
      if (Number.isFinite(baseVersion) && baseVersion !== state.version) {
        return {
          status: 409,
          payload: { error: '画布已更新，请重新同步', state: stripId(state, id) },
        }
      }
      // 只用「上一次落笔」做限流，避免刚加入房间或改个标题就被拦下
      if (now - (state.lastDrawAt || 0) < DRAW_GAP_MS) {
        return {
          status: 429,
          payload: { error: '操作太快，请稍候', state: stripId(state, id) },
        }
      }
      state.version += 1
      state.pixels = pixels
      state.updatedAt = now
      state.lastDrawAt = now
      return { status: 200, changed: true, payload: { ok: true, state: stripId(state, id) } }
    }

    case 'title': {
      const title = ((body && body.title) || '').toString().slice(0, 20)
      if (!state.members.some((m) => m.id === id)) {
        return { status: 403, payload: { error: '请先加入房间' } }
      }
      if (maybeAdvance(state) && state.game && state.game.active && state.game.painterId === id) {
        return { status: 403, changed: true, payload: { error: '游戏中由画师统一命名' } }
      }
      state.title = title
      state.updatedAt = Date.now()
      return { status: 200, changed: true, payload: { ok: true, state: stripId(state, id) } }
    }

    case 'gamestart': {
      if (!state.members.some((m) => m.id === id)) {
        return { status: 403, payload: { error: '请先加入房间' } }
      }
      if (state.members.length < 2) {
        return { status: 400, payload: { error: '至少需要 2 人才能开始' } }
      }
      if (state.mode !== 'game') {
        return { status: 403, payload: { error: '自由模式房间无法开始你画我猜' } }
      }
      if (state.game && state.game.active) {
        return { status: 409, payload: { error: '游戏已在进行中' } }
      }
      startGame(state)
      return { status: 200, changed: true, payload: { ok: true, state: stripId(state, id) } }
    }

    case 'guess': {
      const text = String((body && body.guess) || '').trim().slice(0, 30)
      if (!state.members.some((m) => m.id === id)) {
        return { status: 403, payload: { error: '请先加入房间' } }
      }
      const changed = maybeAdvance(state)
      const g = state.game
      if (!g || !g.active) {
        return { status: 400, changed, payload: { error: '游戏未开始', state: stripId(state, id) } }
      }
      if (memberIndex(state, id) === g.painterIdx) {
        return { status: 403, changed, payload: { error: '画师不能猜自己的题' } }
      }
      if (g.phase !== 'drawing') {
        return {
          status: 409,
          changed,
          payload: { error: '本回合已结束，等下一回合', state: stripId(state, id) },
        }
      }
      const guess = normalizeGuess(text)
      if (!guess) {
        return { status: 400, changed, payload: { error: '输入要猜的词' } }
      }
      if (guess === normalizeGuess(g.word)) {
        g.scores[id] = (g.scores[id] || 0) + 10
        g.scores[g.painterId] = (g.scores[g.painterId] || 0) + 5
        g.phase = 'over'
        g.lastCorrect = id
        g.lastWord = g.word
        state.updatedAt = Date.now()
        return { status: 200, changed: true, payload: { ok: true, correct: true, state: stripId(state, id) } }
      }
      state.updatedAt = Date.now()
      return { status: 200, changed: true, payload: { ok: true, correct: false } }
    }

    case 'skip': {
      if (!state.members.some((m) => m.id === id)) {
        return { status: 403, payload: { error: '请先加入房间' } }
      }
      const g = state.game
      if (!g || !g.active) {
        return { status: 400, payload: { error: '游戏未开始', state: stripId(state, id) } }
      }
      if (id !== g.painterId) {
        return { status: 403, payload: { error: '只有画师能跳过' } }
      }
      if (g.phase !== 'drawing') {
        return {
          status: 409,
          payload: { error: '本回合已结束，等下一回合', state: stripId(state, id) },
        }
      }
      g.phase = 'over'
      g.lastCorrect = null
      g.lastWord = g.word
      state.updatedAt = Date.now()
      return { status: 200, changed: true, payload: { ok: true, state: stripId(state, id) } }
    }

    case 'endgame': {
      if (!state.members.some((m) => m.id === id)) {
        return { status: 403, payload: { error: '请先加入房间' } }
      }
      state.game = null
      state.updatedAt = Date.now()
      return { status: 200, changed: true, payload: { ok: true } }
    }

    default:
      return { status: 400, payload: { error: '未知 action：' + action } }
  }
}

/** 房间列表用的摘要 */
export function roomSummary(room) {
  const g = room.game
  return {
    code: room.code,
    mode: room.mode === 'game' ? 'game' : 'free',
    members: room.members.length,
    live: room.members.filter(
      (m) => Date.now() - (typeof m.seenAt === 'number' ? m.seenAt : room.updatedAt || 0) <= GHOST_MS
    ).length,
    maxMembers: MAX_MEMBERS,
    hasPassword: !!room.pw,
    hasGame: !!(g && g.active),
    title: room.title || '',
    updatedAt: room.updatedAt || 0,
  }
}

/** GET：读房间状态，顺带推进回合 */
export function readState(state, viewerId) {
  if (!state) return { status: 404, payload: { error: '房间不存在或已过期' } }
  let changed = pruneGhosts(state)
  if (touchMember(state, viewerId)) changed = true
  if (!state.members.length) {
    return { status: 200, changed: true, drop: true, payload: { ok: true, empty: true } }
  }
  changed = maybeAdvance(state) || changed
  return { status: 200, changed, payload: { ok: true, state: stripId(state, viewerId) } }
}
