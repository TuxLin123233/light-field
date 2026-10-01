// 头像：自己画的 16×16 像素画，没画就给默认
//
// 设计要点：
// 1. 只能自己画 —— 头像存在服务端、绑定 uid，别人改不了你的。
// 2. 首次解锁要 30 光尘。解锁后随便改，不再收费；
//    否则改一次扣一次，没人愿意反复调整。
// 3. 没解锁或没画过就走「默认头像」：由 uid 哈希生成的一张小图，
//    同一用户每次看到的是同一张，不同用户颜色不同，方便区分。
//
// 存储：av:<uid> = { px, at, paid }，px 是 16×16 的 [r,g,b] 数组

const SIZE = 16
const CELLS = SIZE * SIZE
const KEY = (uid) => 'av:' + uid

/* 两种画法，价格不同。
   注意：不再是「首次解锁只收一次」，而是每保存一次收一次 ——
   改头像是要花光尘的，这样余额才有意义。 */
export const MODES = ['pixel', 'spray']
/** 像素画：16×16 格子逐格涂 */
export const COST_PIXEL = 20
/** 像素喷漆：在 64×64 上自由涂，保存时降采样到 16×16 */
export const COST_SPRAY = 30
export const AVATAR_COST = { pixel: COST_PIXEL, spray: COST_SPRAY }

export function costOf(mode) {
  return mode === 'spray' ? COST_SPRAY : COST_PIXEL
}

/** 校验像素数据；合法返回规整后的数组，不合法返回 null */
export function sanitizePixels(px) {
  if (!Array.isArray(px) || px.length !== CELLS) return null
  const out = new Array(CELLS)
  for (let i = 0; i < CELLS; i++) {
    const p = px[i]
    if (!Array.isArray(p) || p.length < 3) return null
    const r = Math.max(0, Math.min(255, Math.round(Number(p[0]) || 0)))
    const g = Math.max(0, Math.min(255, Math.round(Number(p[1]) || 0)))
    const b = Math.max(0, Math.min(255, Math.round(Number(p[2]) || 0)))
    out[i] = [r, g, b]
  }
  return out
}

/** 是否整幅空白 —— 每一格都接近白色才算没画 */
export function isBlank(px) {
  for (const p of px) {
    if (p[0] > 246 && p[1] > 246 && p[2] > 246) continue
    return false // 有一格上了色，就说明画了东西
  }
  return true
}

export async function readAvatar(kv, uid) {
  if (!kv || !uid) return null
  const raw = await kv.get(KEY(uid))
  if (!raw) return null
  try {
    const o = JSON.parse(raw)
    const px = sanitizePixels(o && o.px)
    if (!px || isBlank(px)) return null
    return { px, at: Number(o.at) || 0, paid: o.paid !== false, mode: o.mode === 'spray' ? 'spray' : 'pixel' }
  } catch (e) {
    return null
  }
}

export async function writeAvatar(kv, uid, px, paid, mode) {
  const clean = sanitizePixels(px)
  if (!clean) return null
  const rec = { px: clean, at: Date.now(), paid: paid !== false, mode: mode === 'spray' ? 'spray' : 'pixel' }
  await kv.put(KEY(uid), JSON.stringify(rec))
  return rec
}

/* 早期版本是「首次解锁收一次费」，这个标记只用于兼容老数据，
   现在计价改成每次保存都收，这里不再参与价格判断。 */
export async function hasPaid(kv, uid) {
  if (!kv || !uid) return false
  const raw = await kv.get(KEY(uid))
  if (!raw) return false
  try {
    const o = JSON.parse(raw)
    return !!(o && o.paid)
  } catch (e) {
    return false
  }
}

/* -------------------- 默认头像 --------------------
   没画过的人用这个。纯前端生成，不需要存 KV，
   同一 uid 每次算出来都一样。 */

function hash32(str) {
  let h = 2166136261
  const s = String(str || '')
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

function hsl2rgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = (h % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hp < 1) [r, g, b] = [c, x, 0]
  else if (hp < 2) [r, g, b] = [x, c, 0]
  else if (hp < 3) [r, g, b] = [0, c, x]
  else if (hp < 4) [r, g, b] = [0, x, c]
  else if (hp < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const m = l - c / 2
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

/**
 * 生成默认头像像素。
 * 画面是一只圆头小像素人：底色按 uid 取色，肤色固定，避开头部做描边。
 */
export function defaultPixels(seed) {
  const h = hash32(seed)
  const hue = h % 360
  const bg = hsl2rgb(hue, 0.42, 0.88)
  const bg2 = hsl2rgb(hue, 0.4, 0.78)
  const skin = [244, 214, 176]
  const line = [58, 42, 34]
  const hair = hsl2rgb((hue + 24) % 360, 0.5, 0.42)
  const eye = line

  const px = new Array(CELLS)
  const cx = 7.5
  const cy = 7.2
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = y * SIZE + x
      const d = Math.hypot(x - cx, y - cy)
      let c
      if (d > 7.4) {
        // 背景：斜向条纹，避免看起来是纯色块
        c = (x + y) % 4 === 0 ? bg2 : bg
      } else if (d > 6.4) {
        c = line
      } else if (d > 5.2) {
        // 头顶头发
        c = y < 5 ? hair : skin
      } else {
        c = skin
      }
      // 眼睛：第 6、9 列
      if (y === 8 && (x === 5 || x === 10)) c = eye
      // 嘴：第 11 行中间两点
      if (y === 11 && (x === 7 || x === 8)) c = line
      px[i] = c
    }
  }
  return px
}

export { SIZE, CELLS }

/** 喷漆模式的落笔分辨率，保存时降采样到 16×16 */
export const SPRAY_SIZE = 64
