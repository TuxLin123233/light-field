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
    return {
      px,
      at: Number(o.at) || 0,
      paid: o.paid !== false,
      mode: o.mode === 'spray' ? 'spray' : 'pixel',
      // 当前是不是在用「系统默认头像」。注意 px 一直留着 —— 切默认不会删掉自己画的
      useDefault: o.useDefault === true,
    }
  } catch (e) {
    return null
  }
}

export async function writeAvatar(kv, uid, px, paid, mode) {
  const clean = sanitizePixels(px)
  if (!clean) return null
  /* 存了新画的就是要用新画的，顺手把「用默认」关掉 ——
     否则用户画完保存、头像却还是默认的，看着像没保存上。 */
  const rec = {
    px: clean,
    at: Date.now(),
    paid: paid !== false,
    mode: mode === 'spray' ? 'spray' : 'pixel',
    useDefault: false,
  }
  await kv.put(KEY(uid), JSON.stringify(rec))
  return rec
}

/**
 * 对外**显示**用的头像像素。
 * 选了默认头像就返回 null —— 前端拿到 null 会去画「由 uid 生成的默认头像」。
 *
 * 读存档请用 readAvatar 而不是这个：那个不管选没选默认，
 * 自己画的那份都还在，切回来就能接着用。
 */
export function visiblePixels(av) {
  if (!av || !av.px || av.useDefault) return null
  return av.px
}

/**
 * 换成默认头像 / 换回自己画的。**免费**，而且只动 useDefault 这一个标记，
 * 绝不碰 px —— 自己画的东西不该因为点了一下开关就没了。
 */
export async function setUseDefault(kv, uid, on) {
  const av = await readAvatar(kv, uid)
  if (!av) return null
  const rec = { ...av, useDefault: !!on }
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

/* 精选色相：橙黄那一段（40°~80°）在 16×16 的小方块里会发闷、像土色，
   所以不用整圈色轮，直接列一组好看的颜色。 */
const HUES = [352, 358, 6, 13, 20, 30, 340, 350, 330, 300, 288, 276, 262, 248, 233, 218, 208, 198, 185, 172, 161, 150, 120, 96]
const LIGHTS = [0.6, 0.66, 0.72]

/**
 * 生成默认头像像素：一只圆头小兽。
 * 长相完全由 uid 决定 —— 色相 × 明度 × 耳型 × 眼型 × 嘴型 × 底纹
 * 一共 24×3×3×2×3×3 = 3888 种组合，同一个人每次都是同一只，不同人基本不会撞脸。
 * 改这里时必须同步改 public/lw-avatar.js 里的同名函数。
 */
export function defaultPixels(seed) {
  const h = hash32(seed)
  /* 把哈希当 N 进制数拆开用，各维度互不相关。
     直接 h%k 再 Math.floor(h/k)%m 会让相邻的 uid 长得像。 */
  const hue = HUES[h % HUES.length]
  const lit = LIGHTS[Math.floor(h / 24) % 3]
  const earType = Math.floor(h / 72) % 3
  const eyeType = Math.floor(h / 216) % 2
  const mouthType = Math.floor(h / 432) % 3
  const bgPat = Math.floor(h / 1296) % 3

  const body = hsl2rgb(hue, 0.62, lit)
  const bodyDark = hsl2rgb(hue, 0.56, lit - 0.18)
  const bodyLight = hsl2rgb(hue, 0.58, Math.min(0.92, lit + 0.16))
  // 底色取同色系的浅色：比互补色干净，整张图不至于花
  const bg = hsl2rgb(hue, 0.34, 0.945)
  const bgDot = hsl2rgb(hue, 0.34, 0.885)
  const ink = [58, 44, 38]
  const white = [255, 253, 250]
  const blush = [246, 150, 150]

  const px = new Array(CELLS)
  const CX = 7.5
  const CY = 8.3
  const R = 5.3
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CX
      const dy = y - CY
      const d = Math.sqrt(dx * dx + dy * dy)
      let c
      if (d > 7.2) {
        // 三种底纹：斜点 / 纯色 / 方格
        if (bgPat === 0) c = (x + y) % 4 === 0 ? bgDot : bg
        else if (bgPat === 1) c = bg
        else c = ((x >> 1) + (y >> 1)) % 2 === 0 ? bg : bgDot
      } else if (d > R) c = bg
      else if (d > R - 0.7) c = bodyDark
      else c = body
      px[y * SIZE + x] = c
    }
  }
  // 左上角一小片高光，看着才有体积，不然就是一坨平色
  for (const [x, y] of [[4, 5], [5, 5], [4, 6], [5, 6], [6, 6]]) px[y * SIZE + x] = bodyLight
  // 耳型一：两只圆耳朵；耳型二：两根触角；耳型三：光滑一团，不画
  if (earType === 0) {
    for (const [x, y] of [[4, 3], [5, 3], [4, 4], [11, 3], [10, 3], [11, 4]]) px[y * SIZE + x] = bodyDark
  } else if (earType === 1) {
    px[3 * SIZE + 5] = bodyDark
    px[2 * SIZE + 5] = ink
    px[3 * SIZE + 10] = bodyDark
    px[2 * SIZE + 10] = ink
  }
  // 眼型一：实心眼 + 一点白高光；眼型二：大白眼 + 黑瞳
  const E = [[5, 7], [6, 7], [5, 8], [6, 8], [9, 7], [10, 7], [9, 8], [10, 8]]
  if (eyeType === 0) {
    for (const [x, y] of E) px[y * SIZE + x] = ink
    px[7 * SIZE + 5] = white
    px[7 * SIZE + 9] = white
  } else {
    for (const [x, y] of E) px[y * SIZE + x] = white
    px[7 * SIZE + 6] = ink
    px[8 * SIZE + 6] = ink
    px[7 * SIZE + 9] = ink
    px[8 * SIZE + 9] = ink
  }
  // 腮红
  if (mouthType !== 2) {
    px[10 * SIZE + 4] = blush
    px[10 * SIZE + 11] = blush
  }
  // 嘴型：两点 / 带嘴角的笑 / 张开的小嘴
  px[11 * SIZE + 7] = ink
  px[11 * SIZE + 8] = ink
  if (mouthType === 1) {
    px[10 * SIZE + 6] = ink
    px[10 * SIZE + 9] = ink
  } else if (mouthType === 2) {
    px[12 * SIZE + 7] = ink
    px[12 * SIZE + 8] = ink
  }
  return px
}

export { SIZE, CELLS }

/** 喷漆模式的落笔分辨率，保存时降采样到 16×16 */
export const SPRAY_SIZE = 64
