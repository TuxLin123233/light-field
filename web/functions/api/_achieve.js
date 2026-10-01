// 成就系统
//
// 定位：和「连续签到徽章」不同，签到徽章只看连续天数（会因断签归零），
// 成就看的是累计成果，断了也不清零，所以放在服务端按 uid 记账。
//
// 两类成就：
//   progress  进度型：累计作品数、累计绘制格数、累计收到赞、累计创作天数…
//             每达到一档就永久解锁一格
//   badge     里程碑型：首次发布、尺寸解锁（16/32/64）、首次被送光尘…
//
// 数据从作品历史实时统计，不额外维护计数，避免和实际作品数对不上。

/** 进度型成就：need 是门槛，reward 是解锁时发放的光尘（0 表示只记录） */
export const PROGRESS = [
  { id: 'works1', ico: '🎨', name: '第一笔', desc: '发布第 1 幅作品', need: 1, metric: 'works', reward: 5 },
  { id: 'works5', ico: '🖼️', name: '小有积累', desc: '累计发布 5 幅作品', need: 5, metric: 'works', reward: 10 },
  { id: 'works20', ico: '🏛️', name: '勤勉作者', desc: '累计发布 20 幅作品', need: 20, metric: 'works', reward: 25 },
  { id: 'works50', ico: '👑', name: '高产画家', desc: '累计发布 50 幅作品', need: 50, metric: 'works', reward: 50 },
  { id: 'cells1k', ico: '🔷', name: '千格之和', desc: '累计绘制 1000 格', need: 1000, metric: 'cells', reward: 10 },
  { id: 'cells10k', ico: '💠', name: '万格之境', desc: '累计绘制 10000 格', need: 10000, metric: 'cells', reward: 40 },
  { id: 'cells50k', ico: '🌌', name: '星河铺满', desc: '累计绘制 50000 格', need: 50000, metric: 'cells', reward: 100 },
  { id: 'likes10', ico: '💛', name: '小有认可', desc: '累计收到 10 个赞', need: 10, metric: 'likes', reward: 10 },
  { id: 'likes50', ico: '🔥', name: '颇受欢迎', desc: '累计收到 50 个赞', need: 50, metric: 'likes', reward: 30 },
  { id: 'likes200', ico: '⭐', name: '众矢之的', desc: '累计收到 200 个赞', need: 200, metric: 'likes', reward: 80 },
  { id: 'days7', ico: '📅', name: '一周坚持', desc: '累计创作 7 天', need: 7, metric: 'days', reward: 10 },
  { id: 'days30', ico: '🗓️', name: '月度勤勉', desc: '累计创作 30 天', need: 30, metric: 'days', reward: 40 },
  { id: 'sign30', ico: '🎫', name: '签到常客', desc: '累计签到 30 天', need: 30, metric: 'signTotal', reward: 30 },
  { id: 'sign100', ico: '🏅', name: '百日之约', desc: '累计签到 100 天', need: 100, metric: 'signTotal', reward: 100 },
]

/** 里程碑型成就：条件成立即解锁，不可逆 */
export const BADGES = [
  { id: 'anim', ico: '🎞️', name: '动起来的画', desc: '发布过动画作品' },
  { id: 'size32', ico: '🟦', name: '更大一点', desc: '发布过 32×32 作品' },
  { id: 'size64', ico: '🟪', name: '巨幅画布', desc: '发布过 64×64 作品' },
  { id: 'contest', ico: '🏆', name: '参加过比赛', desc: '报名过每周主题比赛' },
  { id: 'gifted', ico: '✨', name: '第一个光尘', desc: '送出过光尘' },
  { id: 'gifted50', ico: '🎁', name: '慷慨的人', desc: '送出 50 次光尘' },
  { id: 'night', ico: '🌙', name: '夜猫子', desc: '在深夜发布过作品' },
  { id: 'early', ico: '🐣', name: '元老成员', desc: '账号注册超过 30 天' },
]

export const ALL = [...PROGRESS, ...BADGES]

/** 进度型里程碑的奖励档位（连续签到之外，交给成就系统统一发） */
const SIGN_MILESTONES = [3, 7, 15, 30, 60, 100, 200, 365]

/**
 * 从作品历史算出各项指标。
 * entries：该用户的作品列表（已按归属过滤）
 */
export function computeMetrics(entries, book, user) {
  let works = 0
  let cells = 0
  let likes = 0
  let gifted = 0
  const days = new Set()
  const badges = {}
  const sizes = {}
  let anim = false
  let contest = false
  let night = false

  for (const e of entries) {
    if (!e) continue
    works += 1
    likes += Number(e.likes) || 0
    if (e.contest) contest = true
    if (e.anim) anim = true
    const s = e.size === 32 || e.size === 64 ? e.size : 16
    sizes[s] = (sizes[s] || 0) + 1

    const t = Number(e.time) || 0
    if (t) {
      const d = new Date(t)
      days.add(d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate())
      // 23:00~05:00 算夜里
      const hr = d.getHours()
      if (hr >= 23 || hr < 5) night = true
    }

    // 纯白视为画布底色，不计入绘制量
    const px = Array.isArray(e.pixels) ? e.pixels : []
    for (const p of px) {
      if (!Array.isArray(p) || p.length < 3) continue
      if (p[0] > 246 && p[1] > 246 && p[2] > 246) continue
      cells += 1
    }
  }

  if (sizes[32]) badges.size32 = true
  if (sizes[64]) badges.size64 = true
  if (anim) badges.anim = true
  if (contest) badges.contest = true
  if (night) badges.night = true

  if (book) {
    gifted = Array.isArray(book.gifted) ? book.gifted.length : 0
    if (gifted > 0) badges.gifted = true
    if (gifted >= 50) badges.gifted50 = true
  }
  if (user && user.createdAt && Date.now() - user.createdAt > 30 * 86400000) {
    badges.early = true
  }

  return {
    works,
    cells,
    likes,
    days: days.size,
    gifted,
    signTotal: book ? Number(book.total) || 0 : 0,
    signStreak: book ? Number(book.streak) || 0 : 0,
    badges,
  }
}

/**
 * 比对已解锁记录，返回本次新解锁的成就。
 * 只在「新解锁」时发奖，所以重复调用不会重复发放。
 */
export function diffUnlock(metrics, unlocked) {
  const got = unlocked && typeof unlocked === 'object' ? unlocked : {}
  const fresh = []

  for (const a of PROGRESS) {
    if (got[a.id]) continue
    if ((metrics[a.metric] || 0) >= a.need) {
      got[a.id] = Date.now()
      fresh.push({ ...a, kind: 'progress' })
    }
  }
  for (const b of BADGES) {
    if (got[b.id]) continue
    if (metrics.badges[b.id]) {
      got[b.id] = Date.now()
      fresh.push({ ...b, kind: 'badge', reward: 0 })
    }
  }

  return { unlocked: got, fresh }
}

/** 组装给前端的视图：进度型带完成度，里程碑型只有解锁与否 */
export function view(unlocked) {
  const got = unlocked && typeof unlocked === 'object' ? unlocked : {}
  const items = ALL.map((a) => {
    if (a.kind === 'badge' || BADGES.indexOf(a) >= 0) {
      return {
        id: a.id,
        ico: a.ico,
        name: a.name,
        desc: a.desc,
        type: 'badge',
        got: !!got[a.id],
        at: got[a.id] || 0,
      }
    }
    return {
      id: a.id,
      ico: a.ico,
      name: a.name,
      desc: a.desc,
      type: 'progress',
      need: a.need,
      reward: a.reward || 0,
      got: !!got[a.id],
      at: got[a.id] || 0,
    }
  })
  return {
    items,
    unlocked: items.filter((x) => x.got).length,
    total: items.length,
  }
}

export { SIGN_MILESTONES }
