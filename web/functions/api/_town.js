// 像素小镇 · 地图与个人小屋
//
// 键设计：
//   town:list    小屋索引（谁在小镇上有间屋、叫什么），地图只读这一个键
//   house:<uid>  屋里的布置 + 已买下的家具
//
// 地图为什么不遍历全部账号：账号可能上千个，逐个读又慢又费额度。
// 谁进过自己的小屋，谁才被登记到 town:list 上 —— 没进过的本来也没屋可看。

export const ROOM = 16 // 房间 16×16，和站里画布一个尺度
export const MAX_HOUSES = 200
export const MAX_ITEMS = 40

export const LIST_KEY = 'town:list'
export const houseKey = (uid) => 'house:' + uid

/* 家具。art 是字符画，'.' 表示空；
   字母对应的颜色见 PAL。宽高直接由 art 的行列数决定，不用另写。 */
export const PAL = {
  G: [86, 160, 74],
  B: [124, 82, 48],
  R: [198, 74, 74],
  Y: [232, 186, 78],
  W: [246, 242, 232],
  K: [72, 58, 48],
  A: [122, 168, 214],
  O: [226, 138, 74],
}

export const FURNITURE = [
  { id: 'rug', name: '小地毯', price: 20, art: ['RRR', 'RRR'] },
  { id: 'plant', name: '盆栽', price: 15, art: ['.G.', 'GGG', '.B.'] },
  { id: 'lamp', name: '落地灯', price: 18, art: ['Y', 'K', 'K'] },
  { id: 'chair', name: '木凳', price: 12, art: ['BB', 'BB'] },
  { id: 'table', name: '木桌', price: 25, art: ['BBBB', 'B..B', 'B..B'] },
  { id: 'clock', name: '挂钟', price: 28, art: ['KKK', 'KWK', 'KKK'] },
  { id: 'books', name: '书架', price: 30, art: ['BBB', 'BWB', 'BBB'] },
  { id: 'window', name: '窗户', price: 35, art: ['AAAA', 'AWWW', 'AAAA'] },
  { id: 'bed', name: '小床', price: 45, art: ['WWWW', 'WWWW', 'BBBB'] },
  { id: 'cat', name: '一只猫', price: 50, art: ['O.O', 'OOO', '.O.'] },
  { id: 'fire', name: '壁炉', price: 60, art: ['KKK', 'KOK', 'KYK'] },
  { id: 'piano', name: '钢琴', price: 80, art: ['KKKK', 'KWKW', 'KKKK'] },
]

export function furnitureById(id) {
  for (const f of FURNITURE) if (f.id === id) return f
  return null
}

/** 家具占几格 */
export function sizeOf(f) {
  const rows = f.art.length
  const cols = f.art[0].length
  return { w: cols, h: rows }
}

export function emptyHouse() {
  return { items: [], owned: [], updatedAt: 0 }
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
    const o = JSON.parse(raw)
    return {
      items: sanitizeItems(o && o.items) || [],
      owned: Array.isArray(o && o.owned) ? o.owned.filter((x) => furnitureById(x)).slice(0, FURNITURE.length) : [],
      updatedAt: Number(o && o.updatedAt) || 0,
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
 * 规则：家具必须存在、必须在房间里放得下、同一格不能被两件家具占。
 */
export function sanitizeItems(items) {
  if (!Array.isArray(items)) return null
  if (items.length > MAX_ITEMS) return null
  const used = new Set()
  const out = []
  for (const it of items) {
    if (!it || typeof it !== 'object') return null
    const f = furnitureById(it.id)
    if (!f) return null
    const x = Math.floor(Number(it.x))
    const y = Math.floor(Number(it.y))
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null
    const { w, h } = sizeOf(f)
    if (x < 0 || y < 0 || x + w > ROOM || y + h > ROOM) return null
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (f.art[dy][dx] === '.') continue
        const k = (y + dy) * ROOM + (x + dx)
        if (used.has(k)) return null // 叠在一起了
        used.add(k)
      }
    }
    out.push({ id: f.id, x, y })
  }
  return out
}

/** 小屋的大门外观：由屋主 uid 定色，再按屋里最贵的一件家具挑个装饰图标 */
export function facade(uid, house, hash32) {
  const h = hash32(uid)
  const roof = h % 4
  let top = null
  let topPrice = -1
  for (const it of house.items || []) {
    const f = furnitureById(it.id)
    if (f && f.price > topPrice) {
      topPrice = f.price
      top = f.id
    }
  }
  return { roof, top }
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
  const slot = list.length
  const row = { uid, name, slot }
  list.push(row)
  await writeList(kv, list)
  return row
}
