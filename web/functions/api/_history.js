// 分块历史存储：把社区作品按块存进 KV，避免单 key 超过 25MB 上限，
// 同时让读取/写入量维持在块级别（每块 ~300 条 ≈ 1~2MB）。
//
// key 命名：hmeta（元数据）、h:c0 / h:c1 / ...（作品块，最旧→最新的顺序）。
// 旧单 key `history` 会在第一次访问时懒迁移成分块。

export const HISTORY_MAX = 5000
export const CHUNK_SIZE = 300

const PREFIX = 'h:'
const META_KEY = 'hmeta'
const LEGACY_KEY = 'history'

async function readMeta(kv) {
  const raw = await kv.get(META_KEY)
  if (raw) {
    try {
      const m = JSON.parse(raw)
      if (m && Array.isArray(m.chunks)) return { chunks: m.chunks, count: Number(m.count) || 0 }
    } catch {}
  }
  return { chunks: [], count: 0 }
}

async function writeMeta(kv, meta) {
  await kv.put(
    META_KEY,
    JSON.stringify({ chunks: meta.chunks, count: meta.count })
  )
}

export async function readChunk(kv, name) {
  const raw = await kv.get(PREFIX + name)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

// 确保旧单 key 已迁移成分块，返回元数据
export async function ensureIndexed(kv) {
  const meta = await readMeta(kv)
  if (meta.chunks.length || meta.count) return meta

  const raw = await kv.get(LEGACY_KEY)
  if (raw) {
    let arr = []
    try {
      const a = JSON.parse(raw)
      if (Array.isArray(a)) arr = a
    } catch {}
    arr = arr.slice(-HISTORY_MAX)
    for (let i = 0; i < arr.length; i += CHUNK_SIZE) {
      const name = 'c' + (i / CHUNK_SIZE)
      await kv.put(PREFIX + name, JSON.stringify(arr.slice(i, i + CHUNK_SIZE)))
      meta.chunks.push(name)
    }
    meta.count = arr.length
    await writeMeta(kv, meta)
    if (arr.length) await kv.delete(LEGACY_KEY)
  }
  return meta
}

// 只读元数据统计，不扫描作品数据
export async function historyCount(kv) {
  const meta = await ensureIndexed(kv)
  return meta.count
}

// 读取全部作品（旧的→新的），用于去重/数量统计/管理端操作
export async function readAllHistory(kv) {
  const meta = await ensureIndexed(kv)
  const entries = []
  for (const name of meta.chunks) {
    const arr = await readChunk(kv, name)
    for (const e of arr) {
      if (e && Array.isArray(e.pixels)) entries.push(e)
    }
  }
  return { entries, count: meta.count }
}

// 读取最新 N 条（新→旧），支持分页与按作者/时间过滤
export async function recentHistory(
  kv,
  { offset = 0, limit = null, mineAuthor = null, mineTimes = null } = {}
) {
  const meta = await ensureIndexed(kv)
  const out = []
  const target = limit ? offset + limit : Infinity
  for (let i = meta.chunks.length - 1; i >= 0; i--) {
    const arr = await readChunk(kv, meta.chunks[i])
    for (let j = arr.length - 1; j >= 0; j--) {
      const e = arr[j]
      if (!e || !Array.isArray(e.pixels)) continue
      if (mineAuthor && String(e.author || '').toLowerCase() !== mineAuthor.toLowerCase()) continue
      if (mineTimes && !mineTimes.has(e.time || 0)) continue
      out.push(e)
      if (out.length >= target) break
    }
    if (out.length >= target) break
  }
  const entries = out.slice(offset, limit ? offset + limit : undefined)
  return { entries, total: meta.count }
}

// 在最新→最旧序列中定位某条作品的下标
export async function findIndexByTime(kv, time) {
  const meta = await ensureIndexed(kv)
  let idx = 0
  for (let i = meta.chunks.length - 1; i >= 0; i--) {
    const arr = await readChunk(kv, meta.chunks[i])
    for (let j = arr.length - 1; j >= 0; j--) {
      if (arr[j] && (arr[j].time || 0) === time) return { index: idx, total: meta.count }
      idx++
    }
  }
  return { index: -1, total: meta.count }
}

async function lastEntry(kv, meta) {
  for (let i = meta.chunks.length - 1; i >= 0; i--) {
    const arr = await readChunk(kv, meta.chunks[i])
    if (arr.length) return arr[arr.length - 1]
  }
  return null
}

// 在块内找到并更新某条作品；fn 返回新值（返回 null 表示删除）
async function findAndUpdate(kv, time, fn) {
  const meta = await ensureIndexed(kv)
  for (let i = meta.chunks.length - 1; i >= 0; i--) {
    const name = meta.chunks[i]
    const arr = await readChunk(kv, name)
    const j = arr.findIndex((e) => e && (e.time || 0) === time)
    if (j !== -1) {
      const prev = arr[j]
      const next = fn ? fn(prev) : null
      const removed = !next
      if (!removed) {
        arr[j] = next
        await kv.put(PREFIX + name, JSON.stringify(arr))
        return { found: true, removed: false, entry: next, last: prev }
      }
      arr.splice(j, 1)
      await kv.put(PREFIX + name, JSON.stringify(arr))
      meta.count = Math.max(0, meta.count - 1)
      if (arr.length === 0) {
        await kv.delete(PREFIX + name)
        meta.chunks.splice(i, 1)
      }
      await writeMeta(kv, meta)
      return { found: true, removed: true, entry: null, last: await lastEntry(kv, meta) }
    }
  }
  return { found: false, removed: false, entry: null, last: null }
}

// 追加一条新作品；满 5000 时返回 status: 'full'
export async function appendEntry(kv, entry) {
  const meta = await ensureIndexed(kv)
  if (meta.count >= HISTORY_MAX) {
    return { status: 'full', count: meta.count }
  }

  const lastIdx = meta.chunks.length - 1
  if (lastIdx < 0) {
    const name = 'c0'
    await kv.put(PREFIX + name, JSON.stringify([entry]))
    meta.chunks.push(name)
    meta.count = 1
    await writeMeta(kv, meta)
    return { status: 'ok', count: meta.count }
  }

  const name = meta.chunks[lastIdx]
  const arr = await readChunk(kv, name)
  if (arr.length >= CHUNK_SIZE) {
    const next = 'c' + (lastIdx + 1)
    await kv.put(PREFIX + next, JSON.stringify([entry]))
    meta.chunks.push(next)
  } else {
    arr.push(entry)
    await kv.put(PREFIX + name, JSON.stringify(arr))
  }
  meta.count += 1
  await writeMeta(kv, meta)
  return { status: 'ok', count: meta.count }
}

// 点赞 +1
export async function incrementLikes(kv, time) {
  const res = await findAndUpdate(kv, time, (e) => ({ ...e, likes: (e.likes || 0) + 1 }))
  return { found: res.found, likes: res.entry ? res.entry.likes : 0 }
}

// 取消点赞：减 1，最低为 0
export async function decrementLikes(kv, time) {
  const res = await findAndUpdate(kv, time, (e) => ({
    ...e,
    likes: Math.max(0, (e.likes || 0) - 1),
  }))
  return { found: res.found, likes: res.entry ? res.entry.likes || 0 : 0 }
}

// 主题比赛投票 +1
export async function incrementContestVotes(kv, time) {
  const res = await findAndUpdate(kv, time, (e) => ({ ...e, contestVotes: (e.contestVotes || 0) + 1 }))
  return { found: res.found, votes: res.entry ? res.entry.contestVotes : 0 }
}

// 删除某条作品；返回删除后的最新一条（用于修正 pixels）
// 给单条记录打/撤一个字段（用于每日挑战报名等）
export async function markByTime(kv, time, key, value) {
  const res = await findAndUpdate(kv, time, (prev) => {
    const next = { ...prev }
    if (value === null) delete next[key]
    else next[key] = value
    return next
  })
  return res
}

export async function removeByTime(kv, time) {
  const res = await findAndUpdate(kv, time, null)
  return { found: res.found, last: res.last }
}

// 清空全部
export async function clearAllHistory(kv) {
  const meta = await readMeta(kv)
  for (const name of meta.chunks) {
    await kv.delete(PREFIX + name)
  }
  await kv.delete(META_KEY)
  await kv.delete(LEGACY_KEY)
}