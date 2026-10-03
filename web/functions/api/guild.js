// 冒险者工会
//
//   GET                悬赏清单 + 进度 + 已领
//   POST { action:'claim', id }
//                      领一份悬赏的奖
//
// 悬赏的进度来自冒险世界那份存档（lw-town-save 的 world 段）：
// 打了多少只怪、图鉴收了多少种。**判定在服务端做** ——
// 前端只是把存档同步上来，领奖的时候服务端自己再算一遍，
// 免得有人改前端说「我打了 999 只」。
//
// 每份悬赏只能领一次（记在 guild:<uid> 里），领了直接进光尘账本。

import { readActiveUser, isBanned } from './_auth.js'
import { checkOrigin } from './_origin.js'
import { checkLimit, tooMany, clientIp } from './_ratelimit.js'
import { creditDust } from './_dust.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}
function json(o, s = 200) {
  return new Response(JSON.stringify(o), {
    status: s,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS },
  })
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS })
}

/* 悬赏清单。
   kind=mob 的看 kills[目标]；kind=dex 的看图鉴收集数量。
   奖励随着难度走，重复打同一种也有后续档位，所以不会打完一次就没得打。 */
const BOUNTIES = [
  // 讨伐：每种怪三档
  { id: 'k_pig_1', kind: 'mob', target: 'pig', need: 3, reward: 6, name: '赶一波猪', desc: '讨伐 3 只猪' },
  { id: 'k_pig_2', kind: 'mob', target: 'pig', need: 15, reward: 14, name: '猪圈清场', desc: '讨伐 15 只猪' },
  { id: 'k_cow_1', kind: 'mob', target: 'cow', need: 3, reward: 6, name: '牧场巡逻', desc: '讨伐 3 头牛' },
  { id: 'k_cow_2', kind: 'mob', target: 'cow', need: 15, reward: 14, name: '牛群驱散', desc: '讨伐 15 头牛' },
  { id: 'k_sheep_1', kind: 'mob', target: 'sheep', need: 5, reward: 7, name: '数羊', desc: '讨伐 5 只羊' },
  { id: 'k_chicken_1', kind: 'mob', target: 'chicken', need: 5, reward: 6, name: '鸡舍巡视', desc: '讨伐 5 只鸡' },
  { id: 'k_rabbit_1', kind: 'mob', target: 'rabbit', need: 5, reward: 6, name: '抓兔子', desc: '讨伐 5 只兔' },
  { id: 'k_fox_1', kind: 'mob', target: 'fox', need: 3, reward: 9, name: '狐狸尾巴', desc: '讨伐 3 只狐狸' },
  { id: 'k_zombie_1', kind: 'mob', target: 'zombie', need: 3, reward: 12, name: '夜巡', desc: '讨伐 3 只僵尸' },
  { id: 'k_zombie_2', kind: 'mob', target: 'zombie', need: 20, reward: 30, name: '镇外清剿', desc: '讨伐 20 只僵尸' },
  { id: 'k_skeleton_1', kind: 'mob', target: 'skeleton', need: 3, reward: 13, name: '碎骨', desc: '讨伐 3 只骷髅' },
  { id: 'k_skeleton_2', kind: 'mob', target: 'skeleton', need: 20, reward: 32, name: '白骨终结', desc: '讨伐 20 只骷髅' },
  { id: 'k_spider_1', kind: 'mob', target: 'spider', need: 5, reward: 12, name: '拂网', desc: '讨伐 5 只蜘蛛' },
  { id: 'k_slime_1', kind: 'mob', target: 'slime', need: 5, reward: 11, name: '别踩到', desc: '讨伐 5 只史莱姆' },
  { id: 'k_creeper_1', kind: 'mob', target: 'creeper', need: 3, reward: 18, name: '拆弹专家', desc: '讨伐 3 只苦力怕' },
  { id: 'k_creeper_2', kind: 'mob', target: 'creeper', need: 15, reward: 42, name: '远离爆炸', desc: '讨伐 15 只苦力怕' },
  { id: 'k_bat_1', kind: 'mob', target: 'bat', need: 5, reward: 8, name: '赶蝙蝠', desc: '讨伐 5 只蝙蝠' },

  // 图鉴：按收集数量
  { id: 'd_mob_3', kind: 'dexmob', need: 3, reward: 8, name: '初见生灵', desc: '图鉴里收录 3 种生物' },
  { id: 'd_mob_8', kind: 'dexmob', need: 8, reward: 24, name: '野外手册', desc: '图鉴里收录 8 种生物' },
  { id: 'd_mob_12', kind: 'dexmob', need: 12, reward: 45, name: '博物志', desc: '图鉴里收录全部 12 种生物' },
  { id: 'd_block_20', kind: 'dexblock', need: 20, reward: 10, name: '认得石头', desc: '图鉴里收录 20 种方块' },
  { id: 'd_block_50', kind: 'dexblock', need: 50, reward: 26, name: '地质学家', desc: '图鉴里收录 50 种方块' },
  { id: 'd_block_80', kind: 'dexblock', need: 80, reward: 48, name: '万物图录', desc: '图鉴里收录 80 种方块' },
  { id: 'd_struct_3', kind: 'structs', need: 3, reward: 20, name: '踏勘员', desc: '发现 3 处结构' },
  { id: 'd_struct_8', kind: 'structs', need: 8, reward: 40, name: '测绘师', desc: '发现 8 处结构' },
  { id: 'd_mine_500', kind: 'mined', need: 500, reward: 22, name: '五百镐', desc: '累计挖掉 500 个方块' },
  { id: 'd_mine_3000', kind: 'mined', need: 3000, reward: 55, name: '三千镐', desc: '累计挖掉 3000 个方块' },
  { id: 'd_deep', kind: 'layer', need: 2, reward: 30, name: '地心来客', desc: '下到最深的深层' },
]

const KEY = (uid) => 'guild:' + uid

/* 读冒险世界的存档。
   ★ 一定要**拆掉外层包装**再返回 —— 存进去的是 { world: {...} }，
   而下面 progressOf 要的是里面那个 world 对象本身。
   我第一版就是忘了拆，结果所有悬赏进度都读成 0，
   表现出来是「打了 5 只猪但显示 0/3、领不了奖」。 */
async function readTown(kv, uid) {
  try {
    const raw = await kv.get('townsave:' + uid)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (!o) return null
    return o.world || null
  } catch (e) {
    return null
  }
}

async function readClaimed(kv, uid) {
  try {
    const a = JSON.parse((await kv.get(KEY(uid))) || '[]')
    return Array.isArray(a) ? a.map(String) : []
  } catch (e) {
    return []
  }
}

/** 某份悬赏现在的进度 */
function progressOf(b, WD) {
  if (!WD) return 0
  if (b.kind === 'mob') return Number((WD.kills || {})[b.target]) || 0
  if (b.kind === 'dexmob') return Object.keys(WD.dmob || {}).length
  if (b.kind === 'dexblock') return Object.keys(WD.dex || {}).length
  if (b.kind === 'structs') return Object.keys(WD.found || {}).length
  if (b.kind === 'mined') return Number(WD.mined) || 0
  if (b.kind === 'layer') return Number(WD.layer) || 0
  return 0
}

export async function onRequestGet(context) {
  const { request, env } = context
  const kv = env.LIGHTFIELD_KV
  if (!kv) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const me = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!me || !me.uid) return json({ ok: false, error: '先登录', code: 'noauth' }, 401)

  const WD = (await readTown(kv, me.uid)) || null
  const claimed = await readClaimed(kv, me.uid)

  const list = BOUNTIES.map((b) => {
    const have = progressOf(b, WD)
    return {
      id: b.id, name: b.name, desc: b.desc, reward: b.reward,
      have: Math.min(have, b.need), need: b.need,
      done: have >= b.need,
      claimed: claimed.indexOf(b.id) >= 0,
    }
  })
  return json({
    ok: true,
    list: list,
    claimedCount: claimed.length,
    total: BOUNTIES.length,
    // 前端还拿它显示「仓库」——材料就是冒险世界背包里那些
    bag: (WD && WD.bag) || {},
    hasSave: !!WD,
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const kv = env.LIGHTFIELD_KV
  if (!kv) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const me = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!me || !me.uid) return json({ ok: false, error: '先登录', code: 'noauth' }, 401)
  if (isBanned(me.user)) return json({ ok: false, error: '账号已被封禁' }, 403)
  if (!checkOrigin(request)) return json({ error: '来源不合法' }, 403)

  const rl = await checkLimit(kv, clientIp(request), String(me.username || ''))
  if (!rl.ok) return json(tooMany(rl.retryAfter), 429)

  let body = {}
  try { body = await request.json() } catch (e) { return json({ ok: false, error: '请求格式不对' }, 400) }
  if (!body || body.action !== 'claim') return json({ ok: false, error: '不认识这个动作' }, 400)

  const b = BOUNTIES.find((x) => x.id === String(body.id || ''))
  if (!b) return json({ ok: false, error: '没有这份悬赏' }, 404)

  const claimed = await readClaimed(kv, me.uid)
  if (claimed.indexOf(b.id) >= 0) return json({ ok: false, error: '这份已经领过了' }, 409)

  // ★ 进度以服务端的存档为准重新算一遍
  const WD = await readTown(kv, me.uid)
  const have = progressOf(b, WD)
  if (have < b.need) {
    return json({ ok: false, error: '还没做到（' + have + '/' + b.need + '）' }, 400)
  }

  try { await creditDust(kv, me.uid, b.reward) } catch (e) {
    return json({ ok: false, error: '发奖的时候出错了' }, 500)
  }
  claimed.push(b.id)
  try { await kv.put(KEY(me.uid), JSON.stringify(claimed.slice(-400))) } catch (e) {}

  return json({ ok: true, id: b.id, name: b.name, reward: b.reward, claimedCount: claimed.length })
}
