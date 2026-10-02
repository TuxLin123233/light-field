// 像素小镇 · 地图与个人小屋
//
// 键设计：
//   town:list    小屋索引（谁在小镇上有间屋、叫什么），地图只读这一个键
//   house:<uid>  屋里的布置 + 已买下的东西
//
// 地图为什么不遍历全部账号：账号可能上千个，逐个读又慢又费额度。
// 谁进过自己的小屋，谁才被登记到 town:list 上 —— 没进过的本来也没屋可看。
//
// 物品（墙纸 / 地板 / 家具）的定义都在 _townitems.js，这里只管逻辑。
import { PAL, FURNITURE, FURNITURE_BASE, THEMES, THEME_PAL, SURFACES, CAT_NAMES, furnitureById, surfaceById, itemById } from './_townitems.js'

export { PAL, FURNITURE, FURNITURE_BASE, THEMES, THEME_PAL, SURFACES, CAT_NAMES, furnitureById, surfaceById, itemById }

export const ROOM = 16 // 默认房间尺寸（老代码的兼容引用）
export const MAX_HOUSES = 200
export const MAX_ITEMS = 60

/* 房间尺寸档位。屋子是越住越大的：家具买多了 16×16 很快就摆不下。
   只在「东西摆不下」的时候才升级，不逼着人一上来就花钱。 */
export const SIZES = [
  { size: 16, name: '小屋', price: 0 },
  { size: 24, name: '大屋', price: 300 },
  { size: 32, name: '大院', price: 800 },
]
export const DEFAULT_SIZE = 16

export function sizeInfo(n) {
  for (const s of SIZES) if (s.size === n) return s
  return SIZES[0]
}

/** 下一档尺寸；已经是最大的就返回 null */
export function nextSize(n) {
  const i = SIZES.findIndex((s) => s.size === Number(n))
  return i >= 0 && i + 1 < SIZES.length ? SIZES[i + 1] : null
}

/**
 * 房间第几行往下算地板。
 * 定成**正好一半**：上半是墙、下半是地面 —— 家具只能放在下半部分。
 * 这条线前端也会画出来，摆的时候一眼看得到哪里能放。
 */
export function floorLine(room) {
  return Math.max(4, Math.round((Number(room) || DEFAULT_SIZE) / 2))
}

export const LIST_KEY = 'town:list'
export const houseKey = (uid) => 'house:' + uid

/** 白送的贴面：新屋子一进去不能是毛坯 */
export const DEFAULT_WALL = 'w_plain_warm'
export const DEFAULT_FLOOR = 'f_wood_oak'

/** 家具占几格。取所有行里最宽的那行 —— 万一哪件字符画写得不是矩形，
    也不会把尺寸算小导致后面的越界校验放它过关 */
export function sizeOf(f) {
  let w = 0
  for (const row of f.art) if (row.length > w) w = row.length
  return { w, h: f.art.length }
}

/* 窗外天气。
   空串 = **跟随现实**（按北京时间的小时 + 当天日期算，同一天全镇一样）；
   其余是屋主自己挑的，别人来串门看到的也是这个 —— 屋子是你的，天气也归你。 */
export const WEATHERS = [
  { key: '', name: '跟随现实', ico: '🕐' },
  { key: 'sunny', name: '晴', ico: '☀️' },
  { key: 'cloudy', name: '多云', ico: '☁️' },
  { key: 'rain', name: '雨', ico: '🌧️' },
  { key: 'snow', name: '雪', ico: '❄️' },
  { key: 'dawn', name: '清晨', ico: '🌅' },
  { key: 'dusk', name: '黄昏', ico: '🌇' },
  { key: 'night', name: '夜', ico: '🌙' },
]

export function weatherInfo(k) {
  const key = String(k || '')
  for (const w of WEATHERS) if (w.key === key) return w
  return WEATHERS[0]
}

export function emptyHouse() {
  return {
    size: DEFAULT_SIZE,
    wall: DEFAULT_WALL,
    floor: DEFAULT_FLOOR,
    weather: '',
    items: [],
    owned: [DEFAULT_WALL, DEFAULT_FLOOR],
    updatedAt: 0,
  }
}

export async function readList(kv) {
  if (!kv) return []
  const raw = await kv.get(LIST_KEY)
  try {
    const a = JSON.parse(raw || '[]')
    return Array.isArray(a) ? a : []
  } catch (e) {
    return []
  }
}

export async function writeList(kv, list) {
  const clean = (Array.isArray(list) ? list : []).slice(0, MAX_HOUSES)
  await kv.put(LIST_KEY, JSON.stringify(clean))
  return clean
}

export async function readHouse(kv, uid) {
  if (!kv || !uid) return emptyHouse()
  const raw = await kv.get(houseKey(uid))
  if (!raw) return emptyHouse()
  try {
    const o = JSON.parse(raw) || {}
    const owned = Array.isArray(o.owned)
      ? o.owned.filter((x) => itemById(x)).slice(0, FURNITURE.length + SURFACES.length)
      : []
    // 白送的贴面始终算拥有，老数据里没记也补上
    if (owned.indexOf(DEFAULT_WALL) < 0) owned.push(DEFAULT_WALL)
    if (owned.indexOf(DEFAULT_FLOOR) < 0) owned.push(DEFAULT_FLOOR)
    const wall = surfaceById(o.wall) && surfaceById(o.wall).kind === 'wall' ? o.wall : DEFAULT_WALL
    const floor = surfaceById(o.floor) && surfaceById(o.floor).kind === 'floor' ? o.floor : DEFAULT_FLOOR
    const size = sizeInfo(o.size).size
    return {
      size,
      wall,
      floor,
      // 认不出来的天气一律当「跟随现实」，不让脏数据把窗子搞黑
      weather: weatherInfo(o.weather).key,
      items: loadItems(o.items, size),
      owned,
      updatedAt: Number(o.updatedAt) || 0,
    }
  } catch (e) {
    return emptyHouse()
  }
}

export async function writeHouse(kv, uid, house) {
  await kv.put(houseKey(uid), JSON.stringify(house))
  return house
}

/**
 * 校验摆放数据。不合法就返回 null（调用方据此报 400）。
 * 规则：
 *   1. 家具必须存在（贴面不能摆，只能整片换）
 *   2. 必须在房间里放得下
 *   3. 除挂墙物品外，必须「站在地上」—— 最下面一行要落在地板区
 *   4. 同一格不能被两件家具占
 */
export function sanitizeItems(items, room) {
  if (!Array.isArray(items)) return null
  if (items.length > MAX_ITEMS) return null
  const R = sizeInfo(room).size
  const FL = floorLine(R)
  const used = new Set()
  const seenIds = new Set()
  const out = []
  for (const it of items) {
    if (!it || typeof it !== 'object') return null
    const f = furnitureById(it.id)
    if (!f) return null
    /* 同一件家具只能摆一个：商店里每件只卖一份（owned 是个集合），
       所以摆两个以上就是凭空复制。前端也会拦，但这里才是说了算的地方。 */
    if (seenIds.has(f.id)) return null
    seenIds.add(f.id)
    const x = Math.floor(Number(it.x))
    const y = Math.floor(Number(it.y))
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null
    const { w, h } = sizeOf(f)
    if (x < 0 || y < 0 || x + w > R || y + h > R) return null
    // 床摆在墙上会像浮在半空。挂墙的东西（钟、画、窗）不在此限
    if (!f.wallOk && y + h - 1 < FL) return null
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (!f.art[dy] || f.art[dy][dx] === undefined || f.art[dy][dx] === '.') continue
        const k = (y + dy) * R + (x + dx)
        if (used.has(k)) return null // 叠在一起了
        used.add(k)
      }
    }
    out.push({ id: f.id, x, y })
  }
  return out
}

/**
 * 读存档时用的宽松校验：只丢掉真正坏掉的（东西没了 / 摆在房间外 / 互相重叠），
 * 不套「必须站在地上」那条 —— 那条是给「新摆放」把关的。
 *
 * 为什么必须分开：房间一扩建，地板线就往下走（16 的房间是第 5 行，
 * 24 的是第 8 行），原本站在地上的家具按新规则就「违规」了。
 * 要是读存档也走严格校验，扩建一次家具就被默默清空一次。
 */
export function loadItems(items, room) {
  if (!Array.isArray(items)) return []
  const R = sizeInfo(room).size
  const used = new Set()
  const seenIds = new Set()
  const out = []
  /* 一件家具占住哪些格。返回是否和已占的格子撞车 */
  const claim = (f, x, y) => {
    const { w, h } = sizeOf(f)
    const cells = []
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const ch = f.art[dy] ? f.art[dy][dx] : undefined
        if (ch === undefined || ch === '.') continue
        const k = (y + dy) * R + (x + dx)
        if (used.has(k)) return false
        cells.push(k)
      }
    }
    for (const k of cells) used.add(k)
    return true
  }
  for (const it of items) {
    if (!it || typeof it !== 'object') continue
    const f = furnitureById(it.id)
    /* 同一件只留第一个。
       在「不能重复放置」这个规则之前摆下的重复件，这里悄悄丢掉 ——
       不这么做的话，老屋子一打开就带着重复，而用户一按保存就会被
       严格校验整份拒掉，等于屋子锁死了。 */
    if (seenIds.has(f.id)) continue
    seenIds.add(f.id)
    if (!f) continue
    const x = Math.floor(Number(it.x))
    const y = Math.floor(Number(it.y))
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    const { w, h } = sizeOf(f)
    if (x < 0 || y < 0 || x + w > R || y + h > R) continue
    if (!claim(f, x, y)) continue
    out.push({ id: f.id, x, y })
  }
  return out.slice(0, MAX_ITEMS)
}

/* -------------------- 小屋留言板 --------------------
   存在单独的键上，**不塞进 house 里** —— house 会被「保存布置」
   整个覆盖写掉，留言跟着一起没了就糟了。 */
export const MSG_KEY = (uid) => 'housemsg:' + uid
export const MAX_MSG = 30
export const MSG_LEN = 60

export async function readMsgs(kv, uid) {
  if (!kv || !uid) return []
  const raw = await kv.get(MSG_KEY(uid))
  try {
    const a = JSON.parse(raw || '[]')
    return Array.isArray(a) ? a : []
  } catch (e) {
    return []
  }
}

export async function writeMsgs(kv, uid, list) {
  const clean = (Array.isArray(list) ? list : []).slice(-MAX_MSG)
  await kv.put(MSG_KEY(uid), JSON.stringify(clean))
  return clean
}

/** 留一句。同一个人只保留最新一条，免得一个人把留言板刷满 */
export async function addMsg(kv, uid, from, name, text) {
  const t = String(text == null ? '' : text)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MSG_LEN)
  if (!t) return null
  const list = (await readMsgs(kv, uid)).filter((m) => m && m.from !== from)
  list.push({
    id: 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    from: String(from || ''),
    name: String(name || '镇民').slice(0, 24),
    text: t,
    at: Date.now(),
  })
  await writeMsgs(kv, uid, list)
  return list
}

/** 删一条留言。只有屋主本人能删（在接口那边判断） */
export async function delMsg(kv, uid, id) {
  const list = (await readMsgs(kv, uid)).filter((m) => !m || m.id !== id)
  await writeMsgs(kv, uid, list)
  return list
}

/**
 * 屋里的布置变了，把索引里的「门面」信息同步一下。
 * 地图只读 town:list 这一个键，靠的就是这里把结果存进索引 ——
 * 否则每次打开地图都得把每间屋子读一遍。
 */
export async function refreshEntry(kv, uid, name, house) {
  const list = await readList(kv)
  const i = list.findIndex((h) => h && h.uid === uid)
  if (i < 0) return null
  let top = ''
  let topPrice = -1
  for (const it of house.items || []) {
    const f = furnitureById(it.id)
    if (f && f.price > topPrice) {
      topPrice = f.price
      top = f.id
    }
  }
  list[i].name = name
  list[i].top = top
  list[i].n = (house.items || []).length
  await writeList(kv, list)
  return list[i]
}

/** 登记小屋。已经登记过就只更新名字，不改变它在镇上的位置 */
export async function registerHouse(kv, uid, name) {
  const list = await readList(kv)
  const i = list.findIndex((h) => h && h.uid === uid)
  if (i >= 0) {
    if (list[i].name !== name) {
      list[i].name = name
      await writeList(kv, list)
    }
    return list[i]
  }
  if (list.length >= MAX_HOUSES) return null
  // 位置按下标排：镇上先来后到，一排排盖过去
  const row = { uid, name, slot: list.length, top: '', n: 0 }
  list.push(row)
  await writeList(kv, list)
  return row
}
