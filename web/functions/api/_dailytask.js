// 每日任务：100 个任务，每天派 5 个，做完给光尘
//
// 设计取舍：
//   任务进度直接读已有的累计指标（和成就墙同一套 computeMetrics），
//   不额外维护一套计数器。好处是永远不会出现「计数器忘了加」导致
//   任务永远做不完的坏状态；代价是任务更像「达成某个状态」而不是
//   「今天做了某件事」，所以文案都写成状态而不是动作。
//   每个任务每天只能领一次，光尘直接进账本，同时寄一封信。
//
// 派发规则：按东八区的天序号做确定性轮转，同一天所有人看到的
// 5 个任务完全一样，第二天自动换一批。100 个任务 ÷ 每天 5 个
// 正好 20 天一轮，之后重复。
import { dayStamp } from './_dust.js'

/** 每天派几个 */
export const PER_DAY = 5

/** 奖励区间（光尘） */
const DUST_MIN = 3
const DUST_MAX = 8

/* 指标 key → 说明。任务只允许用这里列出的指标。 */
const M = {
  works: '作品',
  cells: '绘制格数',
  likes: '收到光尘',
  days: '创作天数',
  gifted: '送出光尘',
  got: '累计收到光尘',
  signTotal: '累计签到',
  signStreak: '连续签到',
  bestLikes: '单幅最多光尘',
  maxColorsOne: '单幅最多颜色',
  colors: '用过的颜色',
  biggestSize: '最大画布',
  size16: '16×16 作品',
  size32: '32×32 作品',
  size64: '64×64 作品',
  animCount: '动画作品',
  maxFrames: '最长帧数',
  contestCount: '参赛作品',
  spanDays: '创作跨度',
  maxPerDay: '单日最多作品',
  dayRun: '最长连续创作',
  hourCount: '活跃时段数',
  badges: '签到徽章',
  hasAvatar: '画过头像',
  hasBio: '写过简介',
  g_night: '夜里画过',
  g_dawn: '清晨画过',
  g_morning: '上午画过',
  g_noon: '中午画过',
  g_afternoon: '下午画过',
  g_evening: '傍晚画过',
  g_early: '注册满 30 天',
  g_senior: '注册满 180 天',
  g_veteran: '创作满 100 天',
  g_twice: '一天画两幅',
  g_mixsize: '用过多种尺寸',
  g_only16: '只画 16×16',

  /* ---- 小镇 / 商店 / 社交 ----
     这一批指标不在 computeMetrics 里（那里只认作品历史和光尘账本），
     由 dailytask.js 的 metricsFor 单独读小屋、背包、关注、留言补上。
     加它们的理由：任务池原先 100 条全是画画行为，
     小镇、背包合成、串门留言、加好友这些功能一个指标都没有 ——
     玩家把这些玩熟了，任务进度一点不动。 */
  furnOwned: '收藏家具',
  furnPlaced: '摆出家具',
  houseSize: '小屋有多大',
  hasWallpaper: '换过墙纸',
  matsHeld: '攒到的材料',
  hasCrystal: '捡到晶石',
  friendsOut: '关注了谁',
  friendsIn: '有多少人关注',
  msgGot: '收到留言',
}

/**
 * 100 个任务。
 * metric 必须在 M 里有；target 是阈值；text 里的 {n} 会替换成 target。
 * dust 为空时按档位自动给（越难给越多）。
 */
const POOL = [
  { metric: 'works', target: 1, text: '发表 {n} 幅作品', dust: 3 },
  { metric: 'works', target: 2, text: '发表 {n} 幅作品', dust: 4 },
  { metric: 'works', target: 3, text: '一天发表 {n} 幅作品', dust: 5 },
  { metric: 'works', target: 5, text: '发表 {n} 幅作品', dust: 6 },
  { metric: 'works', target: 10, text: '发表 {n} 幅作品', dust: 8 },
  { metric: 'cells', target: 20, text: '累计画满 {n} 格', dust: 3 },
  { metric: 'cells', target: 60, text: '累计画满 {n} 格', dust: 3 },
  { metric: 'cells', target: 150, text: '累计画满 {n} 格', dust: 4 },
  { metric: 'cells', target: 400, text: '累计画满 {n} 格', dust: 5 },
  { metric: 'cells', target: 800, text: '累计画满 {n} 格', dust: 6 },
  { metric: 'cells', target: 1600, text: '累计画满 {n} 格', dust: 7 },
  { metric: 'cells', target: 3000, text: '累计画满 {n} 格', dust: 8 },
  { metric: 'likes', target: 1, text: '收到 {n} 份光尘', dust: 3 },
  { metric: 'likes', target: 3, text: '收到 {n} 份光尘', dust: 3 },
  { metric: 'likes', target: 8, text: '收到 {n} 份光尘', dust: 4 },
  { metric: 'likes', target: 20, text: '收到 {n} 份光尘', dust: 5 },
  { metric: 'likes', target: 50, text: '收到 {n} 份光尘', dust: 6 },
  { metric: 'likes', target: 120, text: '收到 {n} 份光尘', dust: 7 },
  { metric: 'likes', target: 300, text: '收到 {n} 份光尘', dust: 8 },
  { metric: 'gifted', target: 1, text: '送出 {n} 份光尘', dust: 3 },
  { metric: 'gifted', target: 3, text: '送出 {n} 份光尘', dust: 4 },
  { metric: 'gifted', target: 10, text: '送出 {n} 份光尘', dust: 5 },
  { metric: 'gifted', target: 30, text: '送出 {n} 份光尘', dust: 6 },
  { metric: 'gifted', target: 80, text: '送出 {n} 份光尘', dust: 7 },
  { metric: 'got', target: 20, text: '累计收到 {n} 个光尘', dust: 3 },
  { metric: 'got', target: 60, text: '累计收到 {n} 个光尘', dust: 4 },
  { metric: 'got', target: 150, text: '累计收到 {n} 个光尘', dust: 5 },
  { metric: 'got', target: 400, text: '累计收到 {n} 个光尘', dust: 6 },
  { metric: 'got', target: 900, text: '累计收到 {n} 个光尘', dust: 7 },
  { metric: 'signTotal', target: 1, text: '签到 {n} 天', dust: 3 },
  { metric: 'signTotal', target: 3, text: '累计签到 {n} 天', dust: 3 },
  { metric: 'signTotal', target: 7, text: '累计签到 {n} 天', dust: 4 },
  { metric: 'signTotal', target: 15, text: '累计签到 {n} 天', dust: 5 },
  { metric: 'signTotal', target: 30, text: '累计签到 {n} 天', dust: 6 },
  { metric: 'signTotal', target: 60, text: '累计签到 {n} 天', dust: 7 },
  { metric: 'signTotal', target: 100, text: '累计签到 {n} 天', dust: 8 },
  { metric: 'signStreak', target: 2, text: '连续签到 {n} 天', dust: 3 },
  { metric: 'signStreak', target: 3, text: '连续签到 {n} 天', dust: 4 },
  { metric: 'signStreak', target: 5, text: '连续签到 {n} 天', dust: 5 },
  { metric: 'signStreak', target: 7, text: '连续签到 {n} 天', dust: 5 },
  { metric: 'signStreak', target: 14, text: '连续签到 {n} 天', dust: 6 },
  { metric: 'signStreak', target: 30, text: '连续签到 {n} 天', dust: 7 },
  { metric: 'signStreak', target: 60, text: '连续签到 {n} 天', dust: 8 },
  { metric: 'badges', target: 1, text: '拿到 {n} 枚签到徽章', dust: 3 },
  { metric: 'badges', target: 3, text: '拿到 {n} 枚签到徽章', dust: 4 },
  { metric: 'badges', target: 5, text: '拿到 {n} 枚签到徽章', dust: 5 },
  { metric: 'badges', target: 7, text: '拿到 {n} 枚签到徽章', dust: 6 },
  { metric: 'days', target: 2, text: '在 {n} 天里画过画', dust: 3 },
  { metric: 'days', target: 4, text: '在 {n} 天里画过画', dust: 4 },
  { metric: 'days', target: 7, text: '在 {n} 天里画过画', dust: 4 },
  { metric: 'days', target: 15, text: '在 {n} 天里画过画', dust: 5 },
  { metric: 'days', target: 30, text: '在 {n} 天里画过画', dust: 6 },
  { metric: 'days', target: 60, text: '在 {n} 天里画过画', dust: 7 },
  { metric: 'days', target: 100, text: '在 {n} 天里画过画', dust: 8 },
  { metric: 'dayRun', target: 2, text: '连续 {n} 天来画画', dust: 3 },
  { metric: 'dayRun', target: 3, text: '连续 {n} 天来画画', dust: 4 },
  { metric: 'dayRun', target: 5, text: '连续 {n} 天来画画', dust: 5 },
  { metric: 'dayRun', target: 7, text: '连续 {n} 天来画画', dust: 5 },
  { metric: 'dayRun', target: 14, text: '连续 {n} 天来画画', dust: 6 },
  { metric: 'dayRun', target: 30, text: '连续 {n} 天来画画', dust: 7 },
  { metric: 'maxPerDay', target: 2, text: '一天画 {n} 幅', dust: 4 },
  { metric: 'maxPerDay', target: 3, text: '一天画 {n} 幅', dust: 5 },
  { metric: 'maxPerDay', target: 5, text: '一天画 {n} 幅', dust: 6 },
  { metric: 'maxPerDay', target: 8, text: '一天画 {n} 幅', dust: 7 },
  { metric: 'maxPerDay', target: 10, text: '一天画 {n} 幅', dust: 8 },
  { metric: 'size32', target: 1, text: '画过 {n} 幅 32×32', dust: 4 },
  { metric: 'size32', target: 3, text: '画过 {n} 幅 32×32', dust: 5 },
  { metric: 'size32', target: 8, text: '画过 {n} 幅 32×32', dust: 6 },
  { metric: 'size32', target: 20, text: '画过 {n} 幅 32×32', dust: 7 },
  { metric: 'size32', target: 50, text: '画过 {n} 幅 32×32', dust: 8 },
  { metric: 'size64', target: 1, text: '画过 {n} 幅 64×64', dust: 5 },
  { metric: 'size64', target: 3, text: '画过 {n} 幅 64×64', dust: 6 },
  { metric: 'size64', target: 8, text: '画过 {n} 幅 64×64', dust: 7 },
  { metric: 'size64', target: 20, text: '画过 {n} 幅 64×64', dust: 8 },
  { metric: 'size16', target: 1, text: '画过 {n} 幅 16×16', dust: 3 },
  { metric: 'size16', target: 5, text: '画过 {n} 幅 16×16', dust: 3 },
  { metric: 'size16', target: 20, text: '画过 {n} 幅 16×16', dust: 4 },
  { metric: 'size16', target: 60, text: '画过 {n} 幅 16×16', dust: 5 },
  { metric: 'size16', target: 150, text: '画过 {n} 幅 16×16', dust: 6 },
  { metric: 'size16', target: 300, text: '画过 {n} 幅 16×16', dust: 7 },
  { metric: 'biggestSize', target: 32, text: '用一次 {n}×{n} 以上的大画布', dust: 5 },
  { metric: 'biggestSize', target: 64, text: '用一次 {n}×{n} 的大画布', dust: 7 },
  { metric: 'animCount', target: 1, text: '发表 {n} 幅动画', dust: 5 },
  { metric: 'animCount', target: 3, text: '发表 {n} 幅动画', dust: 6 },
  { metric: 'animCount', target: 8, text: '发表 {n} 幅动画', dust: 7 },
  { metric: 'animCount', target: 15, text: '发表 {n} 幅动画', dust: 8 },
  { metric: 'maxFrames', target: 4, text: '做过 {n} 帧以上的动画', dust: 5 },
  { metric: 'maxFrames', target: 8, text: '做过 {n} 帧以上的动画', dust: 6 },
  { metric: 'maxFrames', target: 16, text: '做过 {n} 帧以上的动画', dust: 7 },
  { metric: 'maxFrames', target: 24, text: '做过 {n} 帧以上的动画', dust: 8 },
  { metric: 'contestCount', target: 1, text: '参加 {n} 次主题赛', dust: 4 },
  { metric: 'contestCount', target: 3, text: '参加 {n} 次主题赛', dust: 5 },
  { metric: 'contestCount', target: 6, text: '参加 {n} 次主题赛', dust: 6 },
  { metric: 'contestCount', target: 12, text: '参加 {n} 次主题赛', dust: 7 },
  { metric: 'contestCount', target: 20, text: '参加 {n} 次主题赛', dust: 8 },
  { metric: 'bestLikes', target: 1, text: '有 {n} 幅作品收到过光尘', dust: 3 },
  { metric: 'bestLikes', target: 3, text: '有 {n} 幅作品各收到过光尘', dust: 4 },
  { metric: 'bestLikes', target: 8, text: '有 {n} 幅作品各收到过光尘', dust: 5 },
  { metric: 'bestLikes', target: 20, text: '有 {n} 幅作品各收到过光尘', dust: 6 },
  { metric: 'bestLikes', target: 50, text: '有 {n} 幅作品各收到过光尘', dust: 7 },
  { metric: 'colors', target: 8, text: '用过 {n} 种以上颜色', dust: 3 },
  { metric: 'colors', target: 20, text: '用过 {n} 种以上颜色', dust: 4 },
  { metric: 'colors', target: 50, text: '用过 {n} 种以上颜色', dust: 5 },
  { metric: 'colors', target: 120, text: '用过 {n} 种以上颜色', dust: 6 },
  { metric: 'maxColorsOne', target: 8, text: '单幅用 {n} 种以上颜色', dust: 4 },
  { metric: 'maxColorsOne', target: 20, text: '单幅用 {n} 种以上颜色', dust: 5 },
  { metric: 'maxColorsOne', target: 40, text: '单幅用 {n} 种以上颜色', dust: 7 },
  { metric: 'hourCount', target: 4, text: '在 {n} 个时段画过画', dust: 3 },
  { metric: 'hourCount', target: 8, text: '在 {n} 个时段画过画', dust: 4 },
  { metric: 'hourCount', target: 12, text: '在 {n} 个时段画过画', dust: 5 },
  { metric: 'spanDays', target: 3, text: '坚持画了 {n} 天以上', dust: 3 },
  { metric: 'spanDays', target: 7, text: '坚持画了 {n} 天以上', dust: 4 },
  { metric: 'spanDays', target: 30, text: '坚持画了 {n} 天以上', dust: 6 },
  { metric: 'spanDays', target: 100, text: '坚持画了 {n} 天以上', dust: 8 },
  { metric: 'hasAvatar', target: 1, text: '给自己画一个头像', dust: 4 },
  { metric: 'hasBio', target: 1, text: '写一句个人简介', dust: 3 },
  { metric: 'g_night', target: 1, text: '在深夜画过一幅', dust: 3 },
  { metric: 'g_dawn', target: 1, text: '在清晨画过一幅', dust: 3 },
  { metric: 'g_morning', target: 1, text: '在上午画过一幅', dust: 3 },
  { metric: 'g_noon', target: 1, text: '在中午画过一幅', dust: 3 },
  { metric: 'g_afternoon', target: 1, text: '在下午画过一幅', dust: 3 },
  { metric: 'g_evening', target: 1, text: '在傍晚画过一幅', dust: 3 },
  { metric: 'g_twice', target: 1, text: '同一天画过两幅', dust: 4 },
  { metric: 'g_mixsize', target: 1, text: '混用过不同尺寸的画布', dust: 5 },
  { metric: 'g_only16', target: 1, text: '只画 16×16 小图', dust: 3 },
  { metric: 'g_early', target: 1, text: '在社区满 30 天了', dust: 6 },
  { metric: 'g_senior', target: 1, text: '在社区满 180 天了', dust: 7 },
  { metric: 'g_veteran', target: 1, text: '坚持创作满 100 天', dust: 8 },

  /* ---- 小镇 / 商店 / 社交 ----
     每类都从易到难给几档，和上面一样。dust 比同类画画任务略高一点：
     家具、合成、串门这些是有成本的（要花光尘、要跑几趟采集），
     给太薄没人愿意做。 */
  { metric: 'furnOwned', target: 1, text: '收藏 {n} 件家具', dust: 3 },
  { metric: 'furnOwned', target: 5, text: '收藏 {n} 件家具', dust: 5 },
  { metric: 'furnOwned', target: 15, text: '收藏 {n} 件家具', dust: 8 },
  { metric: 'furnOwned', target: 40, text: '收藏 {n} 件家具', dust: 12 },
  { metric: 'furnPlaced', target: 1, text: '往屋里摆 {n} 件家具', dust: 3 },
  { metric: 'furnPlaced', target: 4, text: '往屋里摆 {n} 件家具', dust: 5 },
  { metric: 'furnPlaced', target: 10, text: '往屋里摆 {n} 件家具', dust: 8 },
  { metric: 'furnPlaced', target: 20, text: '往屋里摆 {n} 件家具', dust: 11 },
  { metric: 'houseSize', target: 24, text: '把小屋扩到 {n}×{n}', dust: 10 },
  { metric: 'houseSize', target: 32, text: '把小屋扩到 {n}×{n}', dust: 18 },
  { metric: 'hasWallpaper', target: 1, text: '给小屋换一套墙纸或地板', dust: 4 },
  { metric: 'matsHeld', target: 5, text: '手里攒到 {n} 份材料', dust: 3 },
  { metric: 'matsHeld', target: 15, text: '手里攒到 {n} 份材料', dust: 5 },
  { metric: 'matsHeld', target: 30, text: '手里攒到 {n} 份材料', dust: 7 },
  { metric: 'hasCrystal', target: 1, text: '捡到一块晶石', dust: 6 },
  { metric: 'friendsOut', target: 1, text: '关注 {n} 个人', dust: 3 },
  { metric: 'friendsOut', target: 3, text: '关注 {n} 个人', dust: 4 },
  { metric: 'friendsOut', target: 10, text: '关注 {n} 个人', dust: 6 },
  { metric: 'friendsIn', target: 1, text: '有 {n} 个人关注你', dust: 4 },
  { metric: 'friendsIn', target: 3, text: '有 {n} 个人关注你', dust: 5 },
  { metric: 'friendsIn', target: 10, text: '有 {n} 个人关注你', dust: 8 },
  { metric: 'msgGot', target: 1, text: '收到 {n} 条留言', dust: 4 },
  { metric: 'msgGot', target: 3, text: '收到 {n} 条留言', dust: 6 },
  { metric: 'msgGot', target: 8, text: '收到 {n} 条留言', dust: 9 },
]

/** 布尔型指标，达标就是 true */
const BOOL_METRICS = new Set([
  'hasAvatar', 'hasBio',
  'g_night', 'g_dawn', 'g_morning', 'g_noon', 'g_afternoon', 'g_evening',
  'g_twice', 'g_mixsize', 'g_only16', 'g_early', 'g_senior', 'g_veteran',
  'hasWallpaper', 'hasCrystal',
])

/** 任务总数上限。池子里的条目多于它，按指标轮转取前 TOTAL 个，
 *  这样每个指标都有份，不会变成「清一色画动画」。 */
export const TOTAL = 100

/** 把池子整理成恰好 TOTAL 条：按指标分组后轮流取，指标之间公平竞争。 */
function buildTasks() {
  const byMetric = new Map()
  POOL.forEach((t) => {
    if (!M[t.metric]) return // 指标写错的直接丢掉，别让坏数据上线
    if (!byMetric.has(t.metric)) byMetric.set(t.metric, [])
    byMetric.get(t.metric).push(t)
  })
  const groups = [...byMetric.values()]
  // 阈值小的先出，同一指标内由易到难
  groups.forEach((g) => g.sort((a, b) => a.target - b.target))

  const out = []
  for (let round = 0; out.length < TOTAL; round++) {
    let added = 0
    for (const g of groups) {
      if (out.length >= TOTAL) break
      if (round < g.length) {
        out.push(g[round])
        added++
      }
    }
    if (!added) break // 所有指标都取完了
  }
  // 稳定 id：按最终顺序编号。以后增删任务会让后面的 id 变，
  // 所以领取记录用「期号+id」，同一天内 id 不会动。
  return out.map((t, i) => ({
    id: 'T' + String(i + 1).padStart(3, '0'),
    metric: t.metric,
    label: M[t.metric] || t.metric,
    target: t.target,
    text: String(t.text).replace(/\{n\}/g, String(t.target)),
    dust: Math.max(DUST_MIN, Math.min(DUST_MAX, t.dust || DUST_MIN)),
    bool: BOOL_METRICS.has(t.metric),
  }))
}

/** 全量任务表 */
export const TASKS = buildTasks()

/** 今天的期号，东八区 */
export function periodOf(now = Date.now()) {
  return 'DT' + dayStamp(now)
}

/**
 * 预先把 100 个任务编成 20 组，每组 5 个、组内指标互不相同。
 * 20 组 × 5 = 100，正好把每个任务都用一遍，不重不漏。
 *
 * 为什么不按天现算：现算的话「20 天不重不漏」和「组内指标不重复」
 * 这两个条件会互相打架——用双射轮转能保证不重不漏，但实测 20 天里有
 * 16 天撞了同一个指标（一天 5 个任务全是动画之类）。
 * 所以改成启动时一次性编好，之后每天只是取第 d % 20 组。
 */
function buildDailySets() {
  const byMetric = new Map()
  for (const t of TASKS) {
    if (!byMetric.has(t.metric)) byMetric.set(t.metric, [])
    byMetric.get(t.metric).push(t)
  }
  const metrics = [...byMetric.keys()].sort()
  const sets = Array.from({ length: Math.ceil(TASKS.length / PER_DAY) }, () => [])
  const accept = (s, t) => s.length < PER_DAY && !s.some((x) => x.metric === t.metric)

  // 轮转各指标取一个，往第一个还放得下的组里塞；
  // 同指标内按 target 由小到大，简单的任务先编进去
  let turn = 0
  const guard = TASKS.length * metrics.length + 500
  while (sets.some((s) => s.length < PER_DAY) && turn < guard) {
    const m = metrics[turn % metrics.length]
    turn++
    const bucket = byMetric.get(m)
    if (!bucket || !bucket.length) continue
    const t = bucket.shift()
    const target = sets.find((s) => accept(s, t))
    if (target) target.push(t)
  }
  // 编不满就把剩下的按顺序补进去（只会在指标种类不足时发生）
  const left = TASKS.filter((t) => !sets.some((s) => s.includes(t)))
  let i = 0
  for (const t of left) {
    const s = sets.find((x) => x.length < PER_DAY)
    if (s) s.push(t)
    i++
  }
  return sets
}

/** 20 组每日清单 */
export const DAILY_SETS = buildDailySets()

/** 今天派哪 5 个 */
export function todaysTasks(now = Date.now()) {
  const d = dayStamp(now)
  return DAILY_SETS[((d % DAILY_SETS.length) + DAILY_SETS.length) % DAILY_SETS.length]
}

/** 把任务算成给前端的样子：进度、是否达标、是否已领 */
export function viewTasks(tasks, metrics, claimedIds) {
  const got = new Set((claimedIds || []).map(String))
  return tasks.map((t) => {
    const raw = metrics ? metrics[t.metric] : 0
    const cur = t.bool ? (raw ? 1 : 0) : Number(raw) || 0
    const done = t.bool ? cur >= 1 : cur >= t.target
    return {
      id: t.id,
      text: t.text,
      dust: t.dust,
      label: t.label,
      target: t.target,
      progress: Math.min(cur, t.target),
      done,
      claimed: got.has(t.id),
    }
  })
}
