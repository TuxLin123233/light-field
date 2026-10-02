// 小镇的物品库：贴面（墙纸 / 地板）+ 可摆放的家具
//
// 家具用字符画写，'.' 是空，字母对应 PAL 里的颜色。
// 宽高直接由字符画的行列数决定，不用另写一遍。
//
// 贴面（墙纸、地板）不这么写：它们要铺满整个房间，手写 16×16 太啰嗦。
// 改成「图案名 × 配色」在渲染时现算 —— 8 种墙纸图案 × 4 套配色就是 32 款，
// 数据只占几行。

export const PAL = {
  G: [86, 160, 74], // 绿
  B: [124, 82, 48], // 棕
  R: [198, 74, 74], // 红
  Y: [232, 186, 78], // 黄
  W: [246, 242, 232], // 白
  K: [72, 58, 48], // 深
  A: [122, 168, 214], // 蓝
  O: [226, 138, 74], // 橙
  P: [232, 150, 190], // 粉
  C: [120, 200, 200], // 青
  M: [150, 120, 200], // 紫
  S: [170, 175, 180], // 银
  N: [92, 102, 112], // 铁灰
  E: [236, 226, 208], // 米
  D: [62, 46, 36], // 深棕
  L: [200, 230, 150], // 浅绿
}

/* ---------- 贴面：墙纸 ---------- */
export const WALL_PATTERNS = ['plain', 'dots', 'stripe', 'grid', 'brick', 'star', 'wave', 'checker']
/* 每套配色：[底色, 花纹色]。用 PAL 的字母 */
export const SURFACE_COLORS = [
  { key: 'warm', name: '暖', c: ['E', 'Y'] },
  { key: 'mint', name: '薄荷', c: ['L', 'G'] },
  { key: 'sky', name: '天蓝', c: ['C', 'A'] },
  { key: 'rose', name: '玫瑰', c: ['P', 'R'] },
]
const WALL_NAMES = { plain: '素色', dots: '圆点', stripe: '条纹', grid: '格纹', brick: '砖纹', star: '星点', wave: '波浪', checker: '方格' }

/* ---------- 贴面：地板 ---------- */
export const FLOOR_PATTERNS = ['wood', 'tile', 'carpet', 'stone', 'plank', 'checker']
const FLOOR_NAMES = { wood: '木地板', tile: '瓷砖', carpet: '地毯', stone: '石板', plank: '长条木', checker: '棋盘' }
export const FLOOR_COLORS = [
  { key: 'oak', name: '橡木', c: ['B', 'D'] },
  { key: 'ash', name: '灰白', c: ['E', 'S'] },
  { key: 'moss', name: '苔绿', c: ['G', 'L'] },
  { key: 'brick', name: '砖红', c: ['R', 'O'] },
]

function wallSurface(pat, col) {
  return { id: 'w_' + pat + '_' + col.key, name: col.name + WALL_NAMES[pat] + '墙纸', kind: 'wall', pat, colors: col.c, price: 30 }
}
function floorSurface(pat, col) {
  return { id: 'f_' + pat + '_' + col.key, name: col.name + FLOOR_NAMES[pat], kind: 'floor', pat, colors: col.c, price: 40 }
}

export const SURFACES = [
  // 素墙和原木地板是白送的，不然新屋子一进去是毛坯
  { id: 'w_plain_warm', name: '白墙', kind: 'wall', pat: 'plain', colors: ['E', 'E'], price: 0 },
  { id: 'f_wood_oak', name: '橡木地板', kind: 'floor', pat: 'wood', colors: ['B', 'D'], price: 0 },
  ...WALL_PATTERNS.filter((p) => p !== 'plain').flatMap((p) => SURFACE_COLORS.map((c) => wallSurface(p, c))),
  ...FLOOR_PATTERNS.filter((p) => p !== 'wood').flatMap((p) => FLOOR_COLORS.map((c) => floorSurface(p, c))),
]

/* ---------- 家具：按用途分组，方便前端分类展示 ---------- */
const RAW = [
  // 座椅
  ['chair', '木凳', 12, 'seat', ['BB', 'BB']],
  ['stool', '高脚凳', 14, 'seat', ['BBB', '.B.', '.B.']],
  ['cushion', '坐垫', 10, 'seat', ['RR', 'RR']],
  ['bench', '长凳', 30, 'seat', ['BBBBBB', 'BBBBBB']],
  ['rocking', '摇椅', 45, 'seat', ['B.B', 'BBB', 'B.B']],
  ['sofa', '小沙发', 55, 'seat', ['RRRR', 'RRRR', 'KKKK']],
  ['sofa2', '双人沙发', 85, 'seat', ['AAAAAA', 'AAAAAA', 'KKKKKK']],
  ['throne', '王座', 200, 'seat', ['Y.Y', 'YYY', 'YYY', 'KKK']],
  // 桌台
  ['coffee', '茶几', 28, 'table', ['EEEE', 'E..E']],
  ['table', '木桌', 25, 'table', ['BBBB', 'B..B', 'B..B']],
  ['round', '圆桌', 35, 'table', ['.BB.', 'BBBB', '.BB.']],
  ['nightstand', '床头柜', 22, 'table', ['BBB', 'BKB', 'BBB']],
  ['desk', '书桌', 40, 'table', ['BBBBBB', 'B....B', 'B....B']],
  ['dresser', '梳妆台', 65, 'table', ['MMMM', 'M..M', 'MMMM']],
  ['counter', '吧台', 70, 'table', ['WWWWWW', 'BBBBBB', 'B....B']],
  ['workbench', '工作台', 90, 'table', ['SSSSSS', 'S....S', 'SSSSSS']],
  // 床铺
  ['bed', '小床', 45, 'bed', ['WWWW', 'WWWW', 'BBBB']],
  ['futon', '榻榻米', 50, 'bed', ['LLLL', 'LLLL']],
  ['crib', '婴儿床', 55, 'bed', ['W.W.', 'WWWW', 'B..B']],
  ['hammock', '吊床', 60, 'bed', ['A.A.A', 'AAAAA', 'A...A']],
  ['bed2', '大床', 90, 'bed', ['WWWWWW', 'WWWWWW', 'BBBBBB']],
  ['bunk', '上下铺', 130, 'bed', ['WWWW', 'BBBB', 'WWWW', 'BBBB']],
  // 收纳
  ['box', '纸箱', 10, 'store', ['EEE', 'EEE']],
  ['crate', '板条箱', 15, 'store', ['BBBB', 'B..B', 'BBBB']],
  ['chest', '木箱', 20, 'store', ['BBBB', 'BBBB']],
  ['books', '书架', 30, 'store', ['BBB', 'BWB', 'BBB']],
  ['cabinet', '储物柜', 45, 'store', ['SSSS', 'S..S', 'SSSS']],
  ['shelf', '高书架', 50, 'store', ['BBBB', 'BWWB', 'BWWB', 'BBBB']],
  ['wardrobe', '衣柜', 75, 'store', ['DDDD', 'D..D', 'D..D', 'DDDD']],
  ['display', '展示柜', 110, 'store', ['AAAA', 'A..A', 'AAAA', 'SSSS']],
  ['safe', '保险柜', 120, 'store', ['NNNN', 'NKKN', 'NNNN']],
  // 灯具
  ['candle', '蜡烛', 8, 'lamp', ['Y', 'K']],
  ['torch', '火把', 22, 'lamp', ['O', 'B']],
  ['lamp', '落地灯', 18, 'lamp', ['Y', 'K', 'K']],
  ['desklamp', '台灯', 25, 'lamp', ['YY', 'KK', 'BB']],
  ['lantern', '提灯', 30, 'lamp', ['Y.Y', 'YYY', '.K.']],
  ['chandelier', '吊灯', 95, 'lamp', ['YYYY', '.YY.', '.K..', '.K..']],
  ['neon', '霓虹灯', 140, 'lamp', ['PPPPP', 'P...P', 'PPPPP']],
  ['disco', '迪斯科球', 160, 'lamp', ['.SS.', 'SSSS', '.SS.']],
  // 植物
  ['mushroom', '蘑菇', 12, 'plant', ['.R.', 'RRR', '.W.']],
  ['plant', '盆栽', 15, 'plant', ['.G.', 'GGG', '.B.']],
  ['flower', '花盆', 18, 'plant', ['.P.', '.G.', '.B.']],
  ['cactus', '仙人掌', 20, 'plant', ['.G.', 'GGG', '.G.', '.B.']],
  ['fern', '蕨类', 25, 'plant', ['GG.GG', 'GGGGG', '.GGG.', '..B..']],
  ['vine', '藤蔓', 35, 'plant', ['G.G', 'GGG', 'G.G', '.G.']],
  ['bamboo', '竹子', 40, 'plant', ['G.G', 'G.G', 'GGG']],
  ['bonsai', '盆景', 55, 'plant', ['.GG.', 'GGGG', '.BB.']],
  ['tree', '小树', 60, 'plant', ['..G..', '.GGG.', 'GGGGG', '..B..', '..B..']],
  ['garden', '花圃', 80, 'plant', ['PRYPR', 'GGGGG', 'GGGGG']],
  // 装饰
  ['window', '窗户', 42, 'deco', ['AAAA', 'AWWW', 'AAAA']],
  ['flag', '小旗', 14, 'deco', ['RY', 'KK']],
  ['balloon', '气球', 16, 'deco', ['.R.', '.K.']],
  ['kite', '风筝', 20, 'deco', ['.P.', 'PPP', '.K.']],
  ['candle2', '烛台', 26, 'deco', ['Y.Y', '.B.']],
  ['clock', '挂钟', 28, 'deco', ['KKK', 'KWK', 'KKK']],
  ['frame', '相框', 30, 'deco', ['YYYY', 'Y..Y', 'YYYY']],
  ['windchime', '风铃', 32, 'deco', ['.S.', 'S.S']],
  ['poster', '海报', 35, 'deco', ['AAAA', 'AAAA', 'AAAA']],
  ['map', '地图', 38, 'deco', ['EEEE', 'E..E', 'EEEE']],
  ['banner', '挂旗', 40, 'deco', ['RYA', 'RYA']],
  ['mirror', '镜子', 50, 'deco', ['SSSS', 'S..S', 'SSSS']],
  ['snowglobe', '水晶球', 90, 'deco', ['AAAA', 'A..A', 'SSSS']],
  ['trophy', '奖杯', 100, 'deco', ['Y.Y', 'YYY', '.B.']],
  ['statue', '雕像', 150, 'deco', ['SSS', 'SSS', 'SSS', 'BBB']],
  ['fountain', '喷泉', 180, 'deco', ['AAA', 'SAS', 'SSS']],
  // 电器
  ['fan', '电风扇', 38, 'tech', ['AAA', '.K.', '.K.']],
  ['radio', '收音机', 45, 'tech', ['BBBB', 'B..B', 'BBBB']],
  ['heater', '取暖器', 55, 'tech', ['OOO', 'OKO', 'OOO']],
  ['speaker', '音箱', 70, 'tech', ['KKK', 'K.K', 'KKK']],
  ['tv', '电视', 85, 'tech', ['.B..', 'KKKK', 'KAAK', 'KKKK']],
  ['fridge', '冰箱', 95, 'tech', ['WWWW', 'W..W', 'W..W']],
  ['washer', '洗衣机', 105, 'tech', ['WWWW', 'WAAW', 'WWWW']],
  ['computer', '电脑', 120, 'tech', ['SSSS', 'S..S', 'SSSS', 'BBB.']],
  // 乐器
  ['drum', '小鼓', 50, 'music', ['RRR', 'RRR', '.B.']],
  ['xylophone', '木琴', 58, 'music', ['RYGB', 'YYYY']],
  ['guitar', '吉他', 65, 'music', ['.B.', 'BBB', '.B.', '.B.']],
  ['violin', '小提琴', 75, 'music', ['.B.', 'BBB', 'B.B']],
  ['piano', '钢琴', 80, 'music', ['KKKK', 'KWKW', 'KKKK']],
  ['harp', '竖琴', 110, 'music', ['Y.Y.Y', 'YYYYY', '.Y.Y.']],
  // 宠物
  ['bird', '小鸟', 35, 'pet', ['.A.', 'AAA', '.Y.']],
  ['rabbit', '兔子', 45, 'pet', ['W.W', 'WWW', '.W.']],
  ['hamster', '仓鼠', 48, 'pet', ['O.O', 'OOO', '.B.']],
  ['cat', '一只猫', 50, 'pet', ['O.O', 'OOO', '.O.']],
  ['dog', '一只狗', 55, 'pet', ['B.B', 'BBB', '.B.']],
  ['turtle', '乌龟', 60, 'pet', ['.G.', 'GGG', 'GGG']],
  ['fish', '鱼缸', 70, 'pet', ['AAAA', 'AOOA', 'AAAA']],
  ['parrot', '鹦鹉', 85, 'pet', ['R.R', 'RRR', 'YYY']],
  // 厨具
  ['spice', '调料架', 24, 'kitchen', ['RRR', 'YYY']],
  ['plates', '盘子架', 28, 'kitchen', ['WWW', 'WWW']],
  ['teapot', '茶壶', 30, 'kitchen', ['.S.', 'SSS', '.S.']],
  ['kettle', '水壶', 35, 'kitchen', ['.S.', 'SSS', 'SSS']],
  ['pot', '汤锅', 40, 'kitchen', ['SSS', 'S.S', 'SSS']],
  ['sink', '水槽', 60, 'kitchen', ['SSSS', 'S..S', 'SSSS']],
  ['cupboard', '碗柜', 70, 'kitchen', ['BBBB', 'B..B', 'BBBB']],
  ['oven', '烤箱', 90, 'kitchen', ['SSSS', 'S..S', 'SSSS']],
  // 杂物
  ['ball', '皮球', 12, 'misc', ['RWR', 'WRW']],
  ['wheel', '轮子', 16, 'misc', ['KK', 'KK']],
  ['key', '钥匙', 18, 'misc', ['.Y.', 'YY.']],
  ['umbrella', '雨伞', 26, 'misc', ['.A.', 'AAA', '.K.']],
  ['ladder', '梯子', 34, 'misc', ['B.B', 'BBB', 'B.B']],
  ['teddy', '玩偶熊', 42, 'misc', ['B.B', 'BBB', '.B.']],
  ['anchor', '船锚', 45, 'misc', ['.S.', 'SSS', '.S.']],
  ['compass', '罗盘', 52, 'misc', ['.S.', 'SKS', '.S.']],
  ['gem', '宝石', 130, 'misc', ['.A.', 'AAA', '.A.']],

  /* ---------- 合成限定：商店里买不到，只能拿材料在合成台换 ----------
     这样两条路互不挤占：光尘解决「想要什么买什么」，
     材料解决「一点点攒出来」的成就感。
     价格写 0（不卖），第 6 个字段 true 表示只能合成。 */
  ['starlamp', '星空灯', 0, 'lamp', ['.Y.', 'YAY', '.K.', '.K.'], true],
  ['crystalchand', '水晶吊灯', 0, 'lamp', ['.C.', 'CAC', 'CAC', '.K.'], true],
  ['warmfire', '暖暖壁炉', 0, 'deco', ['KKK', 'KOK', 'KYK', 'KKK'], true],
  ['gearclock', '机械钟', 0, 'deco', ['SSS', 'SKS', 'SSS', 'SSS'], true],
  ['hourglass', '时光沙漏', 0, 'deco', ['.S.', 'SYS', '.S.', 'SSS'], true],
  ['rainbowrug', '彩虹地毯', 0, 'deco', ['ROY', 'YGB', 'BAM'], true],
  ['starposter', '星辰挂画', 0, 'deco', ['KAK', 'AWA', 'KAK'], true],
  ['cloudbed', '云朵床', 0, 'bed', ['WWWW', 'WWWW', 'CWWC'], true],
  ['magicbooks', '魔法书架', 0, 'store', ['MMM', 'MWM', 'MAM'], true],
  ['musicbox', '八音盒', 0, 'music', ['PPP', 'PYP', 'PPP'], true],
  ['luckycat', '招财猫', 0, 'pet', ['W.W', 'RWR', '.Y.'], true],
  ['tinytree', '会发光的树', 0, 'plant', ['..Y..', '.YGY.', 'YGGGY', '..B..', '..B..'], true],
]

export const CAT_NAMES = {
  seat: '座椅',
  table: '桌台',
  bed: '床铺',
  store: '收纳',
  lamp: '灯具',
  plant: '植物',
  deco: '装饰',
  tech: '电器',
  music: '乐器',
  pet: '宠物',
  kitchen: '厨具',
  misc: '杂物',
}

/* 能挂在墙上的东西。
   其余的家具必须「站在地上」—— 最下面一行要落在地板区里，
   否则把床摆到墙上会像浮在半空（服务端和前端都按这条拦）。 */
export const WALL_OK = [
  'flag',
  'windchime',
  'clock',
  'frame',
  'poster',
  'map',
  'banner',
  'mirror',
  'window',
  'neon',
  'chandelier',
]

export const FURNITURE = RAW.map(([id, name, price, cat, art, craftOnly]) => ({
  id,
  name,
  price,
  cat,
  art,
  wallOk: WALL_OK.indexOf(id) >= 0,
  craftOnly: !!craftOnly, // 只能合成，商店不卖
}))

/** 商店里能买到的（排除合成限定） */
export const SHOP_ITEMS = FURNITURE.filter((f) => !f.craftOnly)
/** 只能合成的 */
export const CRAFT_ITEMS = FURNITURE.filter((f) => f.craftOnly)

export function furnitureById(id) {
  for (const f of FURNITURE) if (f.id === id) return f
  return null
}
export function surfaceById(id) {
  for (const s of SURFACES) if (s.id === id) return s
  return null
}
export function itemById(id) {
  return furnitureById(id) || surfaceById(id)
}
