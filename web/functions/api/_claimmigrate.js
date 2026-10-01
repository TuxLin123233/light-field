// 认领码时代的老作品迁移（一次性，只做一次）
//
// 背景：账号系统之前，作品是用「认领码」归属的 ——
// 客户端 localStorage 里存明文码（key: paintClaim），
// 作品记录上只存这串码的 SHA-256（字段 claimHash）。
// 认领码功能下线后，作品改由登录账号归属（ownerUser），
// 于是老作品变成了孤儿：既没有 ownerUser，也没人认得，
// 在「我的」页的作品数、绘制格数里全都不计入。
//
// 迁移思路：用户浏览器里那把钥匙（paintClaim）通常还在。
// 登录后由前端把这串码交上来，服务端按同样的规则算哈希，
// 把「哈希相同且还没有 ownerUser」的老作品一次性归到当前账号。
// 归完就抹掉 hash 字段（不再需要），并让前端删掉本地那串码。
//
// 安全性：
//   - 要有明文码才能对上哈希，KV 泄露也无法冒用（和当年设计一致）
//   - 只会认领「还没有归属」的作品，不会抢别人已认领的
//   - 已经迁移过的（ownerUser 已存在）不碰，重复调用不会重复计数
import { recentHistory, markByTime } from './_history.js'

/** 老作品上认领码哈希的字段名 */
const HASH_FIELD = 'claimHash'

/** 认领码格式，和当年保持一致（老数据就是按这个规则算的哈希） */
const CODE_RE = /^pf-[a-f0-9]{8}-[a-f0-9]{8}-[a-f0-9]{8}$/

/** 和当年一模一样的哈希算法，规则变了就对不上了 */
export async function claimHash(code) {
  const clean = String(code || '').trim()
  if (!CODE_RE.test(clean)) return null
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clean))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 把认领码时代的老作品归到 uid 名下。
 * 返回 { moved, alreadyMine }
 */
export async function migrateClaimWorks(kv, uid, code) {
  const hash = await claimHash(code)
  if (!hash) return { ok: false, error: '认领码格式不对' }

  const { entries } = await recentHistory(kv, { limit: 4000 })
  let moved = 0
  let alreadyMine = 0

  for (const e of entries) {
    if (!e || e[HASH_FIELD] !== hash) continue
    if (e.ownerUser === uid) {
      alreadyMine += 1
      // 已经是这个账号的了，顺手把哈希抹掉，之后不用再比对
      await markByTime(kv, Number(e.time), HASH_FIELD, null)
      continue
    }
    if (e.ownerUser) continue // 已经属于别的账号，不动
    // 先把归属写上，再抹哈希：万一第二步失败，下次还能靠哈希重试
    await markByTime(kv, Number(e.time), 'ownerUser', uid)
    await markByTime(kv, Number(e.time), 'ownerName', '')
    await markByTime(kv, Number(e.time), HASH_FIELD, null)
    moved += 1
  }

  return { ok: true, moved, alreadyMine }
}
