// 审核员（版主）系统的数据层
//
// 设计原则：**审核员永远不能真正删掉东西。**
//   审核员能做的只有「暂时下架」—— 另存一条 hide 记录，作品本体一个字节都不动。
//   恢复就是把 hide 记录删掉；真删是管理员后台才有的操作。
//
// 为什么另存记录、而不是往作品里写 hidden 字段：
//   作品存在分块（chunk）里，改一条要重写整块，两个审核员同时下架会互相覆盖。
//   独立一条键就没有这个问题，而且「恢复」天然无损。

const MODS_KEY = 'mods' // 全部审核员：一个数组，量小，直接整存

export const MODBAN_KEY = (uid) => 'modban:' + uid
export const HIDE_KEY = (time) => 'hide:' + time
export const MODREPORT_KEY = (id) => 'modreport:' + id

export const REASON_LEN = 80
export const MAX_MODS = 20

/* ---------------- 审核员名单 ---------------- */

export async function readMods(kv) {
  if (!kv) return []
  try {
    const arr = JSON.parse((await kv.get(MODS_KEY)) || '[]')
    return Array.isArray(arr) ? arr.filter((m) => m && m.uid) : []
  } catch (e) {
    return []
  }
}

async function writeMods(kv, list) {
  await kv.put(MODS_KEY, JSON.stringify(list.slice(0, MAX_MODS)))
  return list
}

/** 是不是审核员。被封的不算 —— 封了立刻失效，不用等它自己退 */
export async function isMod(kv, uid) {
  if (!kv || !uid) return false
  const list = await readMods(kv)
  if (!list.some((m) => m.uid === uid)) return false
  return !(await readModBan(kv, uid))
}

export async function addMod(kv, uid, name, by) {
  const list = await readMods(kv)
  if (list.some((m) => m.uid === uid)) return { ok: false, error: '这个人已经是审核员了' }
  if (list.length >= MAX_MODS) return { ok: false, error: '审核员最多 ' + MAX_MODS + ' 个' }
  list.push({ uid, name: String(name || '').slice(0, 20), by: String(by || ''), at: Date.now() })
  await writeMods(kv, list)
  return { ok: true, list }
}

export async function removeMod(kv, uid) {
  const list = await readMods(kv)
  const next = list.filter((m) => m.uid !== uid)
  if (next.length === list.length) return { ok: false, error: '名单里没有这个人' }
  await writeMods(kv, next)
  // 撤职顺手把封禁记录也清掉，免得以后重新任命时还带着旧账
  await kv.delete(MODBAN_KEY(uid))
  return { ok: true, list: next }
}

/* ---------------- 封禁审核员 ---------------- */
// 只有管理员能调用。被封之后 isMod 立刻返回 false，他的下架按钮会消失。

export async function readModBan(kv, uid) {
  if (!kv || !uid) return null
  try {
    const raw = await kv.get(MODBAN_KEY(uid))
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export async function setModBan(kv, uid, on, reason) {
  if (on) {
    const rec = { uid, at: Date.now(), reason: String(reason || '').slice(0, REASON_LEN) }
    await kv.put(MODBAN_KEY(uid), JSON.stringify(rec))
    return rec
  }
  await kv.delete(MODBAN_KEY(uid))
  return null
}

/** 带封禁状态的完整名单，给后台用 */
export async function listMods(kv) {
  const list = await readMods(kv)
  const out = []
  for (const m of list) {
    const ban = await readModBan(kv, m.uid)
    out.push({ ...m, banned: !!ban, banReason: ban ? ban.reason : '', bannedAt: ban ? ban.at : 0 })
  }
  return out
}

/* ---------------- 暂时下架 ---------------- */
// 全部下架记录存在**一个键**里（{ 时间戳: {谁, 何时, 为什么} }）。
// 一条一条存的话，社区列表每渲染 60 件就要读 60 次 KV，太亏。
// 下架数量天然很少（管理员会及时处理），一个键完全放得下。

const HIDDEN_KEY = 'hidden'
export const MAX_HIDDEN = 300

export async function readHiddenMap(kv) {
  if (!kv) return {}
  try {
    const o = JSON.parse((await kv.get(HIDDEN_KEY)) || '{}')
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {}
  } catch (e) {
    return {}
  }
}

async function writeHiddenMap(kv, map) {
  // 太老的先扔掉，别让这个键无限长
  const keys = Object.keys(map).map(Number).filter((n) => Number.isFinite(n))
  if (keys.length > MAX_HIDDEN) {
    keys.sort((x, y) => y - x)
    const keep = {}
    keys.slice(0, MAX_HIDDEN).forEach((t) => (keep[t] = map[t]))
    map = keep
  }
  await kv.put(HIDDEN_KEY, JSON.stringify(map))
  return map
}

export async function readHide(kv, time) {
  const map = await readHiddenMap(kv)
  return map[Number(time)] || null
}

export async function hideWork(kv, time, byUid, byName, reason) {
  const t = Number(time)
  if (!Number.isFinite(t) || t <= 0) return { ok: false, error: '缺少有效的作品时间' }
  const why = String(reason || '').trim().slice(0, REASON_LEN)
  // 原因必填 —— 管理员后台要照着它做决定，空着等于没给信息
  if (!why) return { ok: false, error: '请填一句下架原因，管理员要照着它判断' }
  const map = await readHiddenMap(kv)
  const rec = { time: t, byUid: String(byUid || ''), byName: String(byName || ''), at: Date.now(), reason: why }
  // 系统自动下架的标记出来，后台一眼能分清是机器触发还是人下的
  if (byUid === 'system') rec.auto = true
  map[t] = rec
  await writeHiddenMap(kv, map)
  return { ok: true, hide: rec }
}

export async function unhideWork(kv, time) {
  const t = Number(time)
  const map = await readHiddenMap(kv)
  if (!map[t]) return { ok: false, error: '这件作品没被下架' }
  delete map[t]
  await writeHiddenMap(kv, map)
  return { ok: true }
}

/** 所有被下架的作品，按作品时间倒序 */
export async function listHidden(kv) {
  const map = await readHiddenMap(kv)
  return Object.keys(map)
    .map((k) => map[k])
    .filter(Boolean)
    .sort((a, b) => b.time - a.time)
}

/** 这批作品里哪些被下架了 —— 列表接口用它过滤。一次读，不是 N 次 */
export async function hiddenTimes(kv, times) {
  const map = await readHiddenMap(kv)
  const set = new Set()
  if (!Array.isArray(times)) return set
  times.forEach((t) => {
    if (map[Number(t)]) set.add(Number(t))
  })
  return set
}

/* ---------------- 审核员之间互相举报 ---------------- */

export async function addModReport(kv, targetUid, targetName, byUid, byName, reason) {
  const why = String(reason || '').trim().slice(0, REASON_LEN * 2)
  if (!why) return { ok: false, error: '请写一句举报理由' }
  if (targetUid === byUid) return { ok: false, error: '不能举报自己' }
  const id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
  const rec = {
    id,
    targetUid: String(targetUid || ''),
    targetName: String(targetName || '').slice(0, 20),
    byUid: String(byUid || ''),
    byName: String(byName || '').slice(0, 20),
    reason: why,
    at: Date.now(),
    handled: false,
  }
  await kv.put(MODREPORT_KEY(id), JSON.stringify(rec))
  return { ok: true, report: rec }
}

export async function listModReports(kv) {
  if (!kv) return []
  const out = []
  let cursor
  for (let i = 0; i < 10; i++) {
    const res = await kv.list({ prefix: 'modreport:', cursor })
    for (const k of res.keys) {
      try {
        const raw = await kv.get(k.name)
        if (raw) out.push(JSON.parse(raw))
      } catch (e) {}
    }
    if (res.list_complete) break
    cursor = res.cursor
  }
  return out.sort((a, b) => b.at - a.at)
}

export async function markModReport(kv, id) {
  const raw = await kv.get(MODREPORT_KEY(id))
  if (!raw) return { ok: false, error: '找不到这条举报' }
  const rec = JSON.parse(raw)
  rec.handled = true
  await kv.put(MODREPORT_KEY(id), JSON.stringify(rec))
  return { ok: true }
}
