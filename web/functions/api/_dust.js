// 服务端光尘账本（登录用户）
//
// 为什么放服务端：
//   本地记账换个设备就清零，而且改 localStorage 就能凭空造出一亿光尘。
//   送光尘会真实消耗余额，必须由服务端裁决。
//
// 键设计：
//   dust:<uid>      账本本体：余额、签到连续/累计、最后签到日、送出记录
//   幂等靠「最后签到日」判断，同一天重复提交不会重复发放。
//
// 未登录用户仍走前端本地账本（见 public/index.html 的 window.dust），
// 两套并存：登录后以服务端为准，本地数据不再使用。

const KEY = (uid) => 'dust:' + uid
const MAX_GIFTED = 500

// 每日签到 5 个；连续里程碑额外奖励，数额等于里程碑天数
export const DUST_PER_SIGNIN = 5
export const DUST_COST = 1
const MILESTONES = [3, 7, 15, 30, 60, 100, 200, 365]

/** 以 UTC+8 划定「今天」，与前端展示口径一致 */
export function dayStamp(ms = Date.now()) {
  return Math.floor((ms + 8 * 3600 * 1000) / 86400000)
}

function emptyBook() {
  return { bal: 0, streak: 0, total: 0, last: 0, gifted: [], got: 0 }
}

function sanitize(raw) {
  const b = emptyBook()
  if (!raw) return b
  try {
    const o = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!o || typeof o !== 'object') return b
    b.bal = Math.max(0, Math.floor(Number(o.bal) || 0))
    b.streak = Math.max(0, Math.floor(Number(o.streak) || 0))
    b.total = Math.max(0, Math.floor(Number(o.total) || 0))
    b.last = Math.max(0, Math.floor(Number(o.last) || 0))
    b.got = Math.max(0, Math.floor(Number(o.got) || 0))
    b.gifted = Array.isArray(o.gifted) ? o.gifted.map(String).slice(-MAX_GIFTED) : []
    return b
  } catch (e) {
    return b
  }
}

export async function readBook(kv, uid) {
  if (!kv || !uid) return emptyBook()
  return sanitize(await kv.get(KEY(uid)))
}

export async function writeBook(kv, uid, book) {
  const b = sanitize(book)
  b.gifted = b.gifted.slice(-MAX_GIFTED)
  await kv.put(KEY(uid), JSON.stringify(b))
  return b
}

/**
 * 签到。同一天重复调用只返回 already，不会二次发放；
 * 断签后连续天数归 1。
 */
export async function signIn(kv, uid) {
  const book = await readBook(kv, uid)
  const today = dayStamp()
  const gap = today - book.last

  if (book.last === today) {
    return { ok: true, already: true, book, bonus: 0, streak: book.streak }
  }

  const streak = gap === 1 ? book.streak + 1 : 1
  let gain = DUST_PER_SIGNIN
  let bonus = 0
  if (MILESTONES.indexOf(streak) >= 0) {
    bonus = streak
    gain += bonus
  }

  book.bal += gain
  book.streak = streak
  book.total += 1
  book.last = today
  const saved = await writeBook(kv, uid, book)
  return { ok: true, already: false, book: saved, bonus, gain, streak }
}

/**
 * 给某个账号加光尘（别人送光尘到他的作品、信箱附件发放都走这里）。
 * amount 为负数表示扣除，但不会让余额变负。
 */
export async function creditDust(kv, uid, amount) {
  const n = Math.floor(Number(amount) || 0)
  if (!uid || n === 0) return null
  const book = await readBook(kv, uid)
  if (n > 0) {
    book.bal += n
    book.got += n
  } else {
    book.bal = Math.max(0, book.bal + n)
  }
  return writeBook(kv, uid, book)
}

/**
 * 送光尘。余额不足、同一作品重复送都返回 false，不扣分。
 * recipientUid 是作品作者的账号；给了就把这份光尘转给他。
 * 调用方负责随后给作品加赞。
 */
export async function giveDust(kv, uid, time, recipientUid) {
  const key = String(time || '')
  if (!/^\d+$/.test(key) || key === '0') return { ok: false, reason: 'bad_time' }

  const book = await readBook(kv, uid)
  if (book.gifted.indexOf(key) >= 0) return { ok: false, reason: 'already', book }
  if (book.bal < DUST_COST) return { ok: false, reason: 'poor', book }

  book.bal -= DUST_COST
  book.gifted.push(key)
  const saved = await writeBook(kv, uid, book)

  // 转给作品作者。自己给自己的作品送不算，否则可以凭空刷光尘。
  let credited = 0
  const to = String(recipientUid || '')
  if (to && to !== uid) {
    const got = await creditDust(kv, to, DUST_COST)
    if (got) credited = DUST_COST
  }

  return { ok: true, book: saved, credited }
}

export function publicView(book) {
  return {
    bal: book.bal,
    streak: book.streak,
    total: book.total,
    got: book.got || 0,
    signedToday: book.last === dayStamp(),
    gifted: book.gifted,
    giftedCount: book.gifted.length,
  }
}
