// 每周主题比赛：主题池与周次计算（东八区）
export const WEEK_MS = 7 * 86400 * 1000
export const TZ = 8 * 60 * 60 * 1000

export const THEMES = [
  { zh: '夏日', prompt: '阳光、沙滩与冰镇汽水' },
  { zh: '星空', prompt: '银河、流星与守夜人' },
  { zh: '早餐', prompt: '热腾腾的早晨时光' },
  { zh: '雨天', prompt: '雨伞、水洼与屋檐' },
  { zh: '魔法', prompt: '咒语、法杖与奇妙生物' },
  { zh: '森林', prompt: '苔藓、鹿影与晨光' },
  { zh: '灯火', prompt: '夜市、灯笼与霓虹' },
  { zh: '海洋', prompt: '珊瑚、鲸歌与气泡' },
  { zh: '秋收', prompt: '麦浪、果实与暖阳' },
  { zh: '冰雪', prompt: '炉火、雪人与冰凌' },
  { zh: '节日', prompt: '彩带、礼盒与烟花' },
  { zh: '宠物', prompt: '毛绒绒的一天' },
]

// 本周（周一 00:00，东八区）起点时间戳
export function mondayStart(now = Date.now()) {
  const t = new Date(now + TZ)
  const dow = (t.getUTCDay() + 6) % 7
  return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()) - TZ - dow * 86400000
}

// 根据周一日期推 ISO 周号（周四所在年）
export function isoWeekOf(monday) {
  const t = new Date(monday + TZ + 3 * WEEK_MS / 7)
  const y = t.getUTCFullYear()
  const jan1 = new Date(Date.UTC(y, 0, 1))
  const jan1dow = (jan1.getUTCDay() + 6) % 7
  const days = Math.round((Date.UTC(y, t.getUTCMonth(), t.getUTCDate()) - Date.UTC(y, 0, 1)) / 86400000)
  return { year: y, week: Math.ceil((days + jan1dow + 1) / 7) }
}

export function weekIdOf(now = Date.now()) {
  const monday = mondayStart(now)
  const { year, week: weekNo } = isoWeekOf(monday)
  return { week: year + '-W' + String(weekNo).padStart(2, '0'), monday, year, weekNo }
}

// 由周号（如 2026-W39）推算周一
export function mondayOfWeekId(weekId) {
  const m = /^(\d{4})-W(\d{1,2})$/.exec(String(weekId || '').trim())
  if (!m) return null
  const y = Number(m[1])
  const w = Number(m[2])
  if (w < 1 || w > 53) return null
  const jan4 = new Date(Date.UTC(y, 0, 4))
  const jan4dow = (jan4.getUTCDay() + 6) % 7
  const jan4Monday = Date.UTC(y, 0, 4) - jan4dow * 86400000
  return jan4Monday + (w - 1) * WEEK_MS - TZ
}

function themeAt(monday) {
  const idx = ((Math.floor(monday / WEEK_MS) % THEMES.length) + THEMES.length) % THEMES.length
  const t = THEMES[idx]
  return { zh: t.zh, prompt: t.prompt }
}

// 当前周比赛信息
export function contestInfo(now = Date.now()) {
  const { week, monday } = weekIdOf(now)
  return {
    week,
    theme: themeAt(monday),
    start: monday,
    end: monday + WEEK_MS,
    open: now >= monday && now < monday + WEEK_MS,
  }
}

// 指定周次信息（用于查询历史比赛）
export function contestByWeek(weekId) {
  const monday = mondayOfWeekId(weekId)
  if (monday == null) return null
  const now = Date.now()
  return {
    week: String(weekId).trim(),
    theme: themeAt(monday),
    start: monday,
    end: monday + WEEK_MS,
    open: now >= monday && now < monday + WEEK_MS,
    past: monday + WEEK_MS <= now,
  }
}