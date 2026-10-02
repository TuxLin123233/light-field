// 关注关系的存取
//
// 单独拆出来是因为两个地方都要用：follow.js 是接口本身，
// dailytask.js 要把「我关注了几个人 / 有多少人关注我」算成每日任务指标。
// 以前这套只有 follow.js 里有，于是要么路由文件互相 import（这套代码里
// 没有先例），要么在 dailytask.js 里把 'follow-out:' + uid 又抄一遍 ——
// 抄的那份迟早和真的那份对不上。键名只在这里定义一次。

export const FOLLOW_OUT_KEY = (uid) => 'follow-out:' + uid
export const FOLLOW_IN_KEY = (uid) => 'follow-in:' + uid

/** 读一把关注集合。存的不是数组或坏掉时一律当成空。 */
export async function readFollowSet(kv, key) {
  if (!kv || !key) return []
  const raw = await kv.get(key)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

/**
 * 关注是有向的：A 关注 B 要同时写两条 ——
 *   A 的「我关注的人」加 B
 *   B 的「关注我的人」加 A
 * 只写一条的话，「我关注的人」和「关注我的人」会对不上。
 */
export async function addFollow(kv, a, b) {
  const out = await readFollowSet(kv, FOLLOW_OUT_KEY(a))
  if (out.indexOf(b) < 0) {
    out.push(b)
    await kv.put(FOLLOW_OUT_KEY(a), JSON.stringify(out.slice(-500)))
  }
  const inn = await readFollowSet(kv, FOLLOW_IN_KEY(b))
  if (inn.indexOf(a) < 0) {
    inn.push(a)
    await kv.put(FOLLOW_IN_KEY(b), JSON.stringify(inn.slice(-500)))
  }
}

export async function removeFollow(kv, a, b) {
  const out = (await readFollowSet(kv, FOLLOW_OUT_KEY(a))).filter((x) => x !== b)
  await kv.put(FOLLOW_OUT_KEY(a), JSON.stringify(out))
  const inn = (await readFollowSet(kv, FOLLOW_IN_KEY(b))).filter((x) => x !== a)
  await kv.put(FOLLOW_IN_KEY(b), JSON.stringify(inn))
}

/** 统计某人关注了谁 / 被谁关注 */
export async function followStats(kv, uid) {
  const [out, inn] = await Promise.all([
    readFollowSet(kv, FOLLOW_OUT_KEY(uid)),
    readFollowSet(kv, FOLLOW_IN_KEY(uid)),
  ])
  return { following: out.length, followers: inn.length }
}