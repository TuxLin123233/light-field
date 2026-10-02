// 合成台与背包
//
// 材料从「去镇上转转」来（有冷却，主动玩），拿材料在合成台换家具。
// 能合成的那批家具**商店里买不到** —— 两条路互不挤占：
// 光尘解决「想要什么买什么」，材料解决「一点点攒出来」的成就感。
//
// 键设计：
//   bag:<uid>   { mat: { wood: 3, ... }, last: 上次采集时间, day: '2026-10-5', dayN: 今天采了几次 }
import { CRAFT_ITEMS, furnitureById } from './_townitems.js'

export { CRAFT_ITEMS }

export const bagKey = (uid) => 'bag:' + uid

/** 六种材料。weight 越大越常见 —— 木料满地都是，晶石才稀罕 */
export const MATERIALS = [
  { id: 'wood', name: '木料', ico: '🪵', weight: 30 },
  { id: 'stone', name: '石料', ico: '🪨', weight: 26 },
  { id: 'cloth', name: '布料', ico: '🧵', weight: 20 },
  { id: 'gear', name: '零件', ico: '⚙️', weight: 14 },
  { id: 'paint', name: '颜料', ico: '🎨', weight: 12 },
  { id: 'crystal', name: '晶石', ico: '💎', weight: 6 },
]

export const MAT_IDS = MATERIALS.map((m) => m.id)
const TOTAL_W = MATERIALS.reduce((a, m) => a + m.weight, 0)

/** 采集冷却：20 分钟一次，别让人一直点 */
export const GATHER_CD = 20 * 60 * 1000
/** 一天最多采几次 */
export const GATHER_PER_DAY = 12
/** 每次采到几个 */
export const GATHER_MIN = 1
export const GATHER_MAX = 3

export function matById(id) {
  for (const m of MATERIALS) if (m.id === id) return m
  return null
}

/* ---------------- 配方 ----------------
   产出一律是「只能合成」的家具。材料需求按稀有度给：
   越难采的材料要得越少。 */
export const RECIPES = [
  { id: 'starlamp', need: { wood: 4, paint: 2 } },
  { id: 'rainbowrug', need: { cloth: 6, paint: 4 } },
  { id: 'starposter', need: { paint: 5, cloth: 2 } },
  { id: 'hourglass', need: { stone: 2, gear: 2, crystal: 1 } },
  { id: 'musicbox', need: { wood: 3, gear: 4, paint: 2 } },
  { id: 'warmfire', need: { stone: 6, wood: 3 } },
  { id: 'luckycat', need: { paint: 4, crystal: 2 } },
  { id: 'magicbooks', need: { wood: 6, paint: 3, crystal: 1 } },
  { id: 'gearclock', need: { stone: 3, gear: 5 } },
  { id: 'tinytree', need: { wood: 5, paint: 3, crystal: 2 } },
  { id: 'cloudbed', need: { cloth: 8, crystal: 1 } },
  { id: 'crystalchand', need: { stone: 4, gear: 3, crystal: 2 } },
].filter((r) => !!furnitureById(r.id)) // 配方指到不存在的家具就直接丢掉，不让它变成一个永远合不出的坑

export function recipeById(id) {
  for (const r of RECIPES) if (r.id === id) return r
  return null
}

/* ---------------- 背包读写 ---------------- */

const emptyBag = () => ({ mat: {}, last: 0, day: '', dayN: 0 })

export async function readBag(kv, uid) {
  if (!kv || !uid) return emptyBag()
  const raw = await kv.get(bagKey(uid))
  if (!raw) return emptyBag()
  try {
    const o = JSON.parse(raw) || {}
    const mat = {}
    for (const id of MAT_IDS) {
      const n = Math.floor(Number(o.mat && o.mat[id]))
      if (Number.isFinite(n) && n > 0) mat[id] = Math.min(99999, n)
    }
    return { mat, last: Number(o.last) || 0, day: String(o.day || ''), dayN: Math.max(0, Math.floor(Number(o.dayN) || 0)) }
  } catch (e) {
    return emptyBag()
  }
}

export async function writeBag(kv, uid, bag) {
  await kv.put(bagKey(uid), JSON.stringify(bag))
  return bag
}

/** 北京时间下的「今天」，用来算每日采集次数 */
export function dayKey(now) {
  const d = new Date((Number(now) || Date.now()) + 8 * 3600000)
  return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate()
}

/** 还能不能采；不能的话差在哪 */
export function gatherState(bag, now) {
  const t = Number(now) || Date.now()
  const left = Math.max(0, (Number(bag.last) || 0) + GATHER_CD - t)
  const sameDay = bag.day === dayKey(t)
  const used = sameDay ? Number(bag.dayN) || 0 : 0
  const dayLeft = Math.max(0, GATHER_PER_DAY - used)
  return {
    can: left <= 0 && dayLeft > 0,
    cdLeft: left,
    dayLeft,
    perDay: GATHER_PER_DAY,
    cd: GATHER_CD,
  }
}

/** 按权重抽一个材料。rand 可注入，方便测 */
export function rollOne(rand) {
  let r = (typeof rand === 'function' ? rand() : Math.random()) * TOTAL_W
  for (const m of MATERIALS) {
    r -= m.weight
    if (r < 0) return m.id
  }
  return MATERIALS[0].id
}

/** 抽 n 个材料，返回 { 材料id: 个数 } */
export function rollMats(n, rand) {
  const out = {}
  for (let i = 0; i < n; i++) {
    const id = rollOne(rand)
    out[id] = (out[id] || 0) + 1
  }
  return out
}

/** 把材料并进背包（不改 last / day，那是采集自己管的） */
export function mergeMats(bag, got) {
  const mat = { ...(bag.mat || {}) }
  for (const id of Object.keys(got || {})) {
    if (MAT_IDS.indexOf(id) < 0) continue
    const n = Math.floor(Number(got[id]))
    if (!Number.isFinite(n) || n <= 0) continue
    mat[id] = Math.min(99999, (mat[id] || 0) + n)
  }
  return { ...bag, mat }
}

/** 材料够不够做这一件 */
export function canCraft(bag, recipe) {
  if (!recipe) return false
  for (const id of Object.keys(recipe.need)) {
    if ((bag.mat[id] || 0) < recipe.need[id]) return false
  }
  return true
}

/** 还差什么，给前端显示用 */
export function lacking(bag, recipe) {
  const out = {}
  if (!recipe) return out
  for (const id of Object.keys(recipe.need)) {
    const have = bag.mat[id] || 0
    if (have < recipe.need[id]) out[id] = recipe.need[id] - have
  }
  return out
}

/** 扣掉配方要的材料 */
export function spend(bag, recipe) {
  const mat = { ...(bag.mat || {}) }
  for (const id of Object.keys(recipe.need)) {
    mat[id] = Math.max(0, (mat[id] || 0) - recipe.need[id])
    if (!mat[id]) delete mat[id]
  }
  return { ...bag, mat }
}

/* ---------------- 采集 ---------------- */

/**
 * 去镇上转转，捡点材料。
 * 返回 { ok:true, got, bag, state } 或 { ok:false, reason, state }。
 */
export async function gather(kv, uid, now, rand) {
  const t = Number(now) || Date.now()
  const bag = await readBag(kv, uid)
  const st = gatherState(bag, t)
  if (!st.can) {
    return { ok: false, reason: st.cdLeft > 0 ? 'cooldown' : 'daily', state: st }
  }
  const n = GATHER_MIN + Math.floor((typeof rand === 'function' ? rand() : Math.random()) * (GATHER_MAX - GATHER_MIN + 1))
  const got = rollMats(Math.max(GATHER_MIN, Math.min(GATHER_MAX, n)), rand)
  const dk = dayKey(t)
  const next = mergeMats(
    { ...bag, last: t, day: dk, dayN: (bag.day === dk ? Number(bag.dayN) || 0 : 0) + 1 },
    got
  )
  await writeBag(kv, uid, next)
  return { ok: true, got, bag: next, state: gatherState(next, t) }
}
