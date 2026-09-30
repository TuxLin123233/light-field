// 每日挑战：每天一个题目，全站同题，按当日点赞排出当日榜。
// 与「每周主题比赛」并存：比赛按周轮换、投票排名；挑战按日轮换、看当日热度。

const TZ_OFFSET = 8 * 60 * 60 * 1000 // 东八区

// 题目池：短、好画、适合 16×16
export const DAILY_THEMES = [
  { zh: '一杯热饮', prompt: '冒着气的杯子' },
  { zh: '一株小草', prompt: '从土里钻出来' },
  { zh: '下雨天', prompt: '伞与水洼' },
  { zh: '小夜灯', prompt: '黑暗里的一点光' },
  { zh: '面包', prompt: '刚出炉' },
  { zh: '小火箭', prompt: '准备发射' },
  { zh: '猫', prompt: '坐着或蜷着' },
  { zh: '一艘船', prompt: '在水上' },
  { zh: '树', prompt: '四季里的任意一季' },
  { zh: '星星', prompt: '夜空里' },
  { zh: '苹果', prompt: '桌上或手里' },
  { zh: '小鱼', prompt: '水里游' },
  { zh: '房子', prompt: '有门窗' },
  { zh: '月亮', prompt: '圆或弯' },
  { zh: '一朵云', prompt: '天上飘' },
  { zh: '铅笔', prompt: '桌上的文具' },
  { zh: '气球', prompt: '飘在空中' },
  { zh: '西瓜', prompt: '切开或完整' },
  { zh: '书', prompt: '翻开的或合上的' },
  { zh: '椅子', prompt: '空椅子' },
  { zh: '信封', prompt: '写了字的' },
  { zh: '钥匙', prompt: '一把小钥匙' },
  { zh: '钟', prompt: '指针指向某处' },
  { zh: '蜗牛', prompt: '慢慢爬' },
  { zh: '路灯', prompt: '夜里亮着' },
  { zh: '贝壳', prompt: '海边的' },
  { zh: '烟花', prompt: '绽放的瞬间' },
  { zh: '仙人掌', prompt: '沙漠里' },
  { zh: '南瓜', prompt: '橙色的大果实' },
  { zh: '风车', prompt: '转起来' },
  { zh: '企鹅', prompt: '黑白分明' },
]

// 以东八区计算「今天」，再折算成 2026-01-01 起的天序号
export function dayIndex(date) {
  const shifted = new Date((date ? date.getTime() : Date.now()) + TZ_OFFSET)
  const y = shifted.getUTCFullYear()
  const m = shifted.getUTCMonth()
  const d = shifted.getUTCDate()
  const start = Date.UTC(y, 0, 1)
  const cur = Date.UTC(y, m, d)
  return Math.floor((cur - start) / 86400000)
}

export function todayId() {
  return 'D' + dayIndex()
}

export function themeOfDay(id) {
  const n = Number(String(id).replace(/^D/, '')) || 0
  return DAILY_THEMES[((n % DAILY_THEMES.length) + DAILY_THEMES.length) % DAILY_THEMES.length]
}

export function dailyInfo(date) {
  const id = todayId(date)
  const start = new Date(dayIndex(date) * 86400000 - TZ_OFFSET)
  const end = new Date(start.getTime() + 86400000)
  return {
    day: id,
    theme: themeOfDay(id),
    start: start.getTime(),
    end: end.getTime(),
    open: true,
  }
}
