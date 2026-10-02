import http from 'http'
import fs from 'fs'
import path from 'path'

const ROOT = '/home/tux/编程/光域/web/public'
const PORT = 8791

/* ---------- 造几幅示例作品（占位，真截图请用真实作品） ---------- */
const PAL = { r: [229, 87, 75], R: [180, 52, 44], g: [93, 176, 92], G: [58, 128, 60],
  y: [246, 205, 92], o: [224, 148, 60], b: [91, 141, 239], B: [54, 90, 170],
  w: [255, 255, 255], k: [59, 52, 44], p: [214, 140, 196], c: [126, 200, 220],
  n: [139, 108, 78], N: [96, 72, 50], s: [200, 200, 205], '.': null }

function art(rows, size) {
  const out = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sc = size / rows.length
      const ch = rows[Math.floor(y / sc)] ? rows[Math.floor(y / sc)][Math.floor(x / sc)] : '.'
      out.push(PAL[ch] || [255, 255, 255])
    }
  }
  return out
}
const SPRITES = {
  '爱心': ['..rr....rr..', '.rRRr..rRRr.', 'rRRRRrrRRRRr', 'rRRRRRRRRRRr', 'rRRRRRRRRRRr', '.rRRRRRRRRr.', '..rRRRRRRr..', '...rRRRRr...', '....rRRr....', '.....rr.....'],
  '小树': ['....gg....', '...gggg...', '..gggggg..', '.gggggggg.', 'gggggggggg', '..gggggg..', '....nn....', '....nn....', '...NnnN...', '..NNNNNN..'],
  '蘑菇': ['..rrrr..', '.rwwwwr.', 'rwwrrwwr', 'rrrrrrrr', '..wwww..', '..wwww..', '.wwwwww.', 'wwwwwwww'],
  '笑脸': ['.yyyyyy.', 'yyyyyyyy', 'ykyyyyky', 'ykyyyyky', 'yyyyyyyy', 'yyyyyyyy', 'yykkkkyy', '.yyyyyy.'],
  '星星': ['....yy....', '....yy....', '...yyyy...', 'yyyyyyyyyy', '.yyyyyyyy.', '..yyyyyy..', '..yyyyyy..', '.yyy..yyy.', 'yy......yy', 'y........y'],
  '小鱼': ['...cccc...', '..cccccc..', '.cckccccc.', 'cccccccccc', '.cckccccc.', '..cccccc..', '...cccc...', '..c....c..'],
}
const NAMES = Object.keys(SPRITES)
const SIZES = [16, 32, 16, 16, 32, 16]
const AUTHORS = ['小林同学', '墨白', '星野', '青禾', '拾光', '半夏']
const works = NAMES.map((n, i) => ({
  time: 1730000000000 - i * 86400000,
  workName: n,
  name: n,
  author: AUTHORS[i],
  ownerUser: 'u' + i,
  size: SIZES[i],
  likes: 12 + i * 7,
  pixels: art(SPRITES[n], SIZES[i]),
  type: 'pixel',
}))

/* ---------- 小屋 ---------- */
const { FURNITURE, SURFACES, PAL: TPAL, sanitizeItems } = await import('/home/tux/编程/光域/web/functions/api/_town.js')
const { FURNITURE_BASE, THEMES, CAT_NAMES } = await import('/home/tux/编程/光域/web/functions/api/_townitems.js')
const { emptyHouse, SIZES: RSIZES } = await import('/home/tux/编程/光域/web/functions/api/_town.js')
const LAYOUT = [
  { id: 'poster__gold', x: 1, y: 1 }, { id: 'clock__ink', x: 6, y: 1 }, { id: 'banner__sakura', x: 1, y: 5 },
  { id: 'bed2__sea', x: 1, y: 9 }, { id: 'nightstand__sea', x: 8, y: 9 }, { id: 'lamp__gold', x: 12, y: 9 },
  { id: 'table__gold', x: 1, y: 13 }, { id: 'chair__gold', x: 6, y: 13 },
  { id: 'plant__forest', x: 9, y: 12 }, { id: 'cushion__sakura', x: 13, y: 13 },
]
const house = {
  ...emptyHouse(), size: 16, weather: 'snow', wall: 'w_plain_warm', floor: 'f_wood_oak',
  items: sanitizeItems(LAYOUT, 16) || [],
  owned: [...new Set([...LAYOUT.map((l) => l.id.split('__')[0]), 'w_plain_warm', 'f_wood_oak', 'chair', 'table', 'bed', 'plant', 'candle', 'lamp', 'rug'])],
}
const CATALOG = {
  furniture: FURNITURE_BASE.filter((f) => !f.craftOnly).map((f) => ({ id: f.id, name: f.name, price: f.price, cat: f.cat, art: f.art, wallOk: !!f.wallOk })),
  themes: THEMES.map((t) => ({ key: t.key, name: t.name, mult: t.mult, pal: null })),
  surfaces: SURFACES.map((s) => ({ id: s.id, name: s.name, price: s.price, kind: s.kind, pat: s.pat, colors: s.colors })),
  cats: CAT_NAMES,
  sizes: RSIZES,
  weathers: [
    { key: '', name: '跟随现实', ico: '🕐' }, { key: 'sunny', name: '晴', ico: '☀️' },
    { key: 'cloudy', name: '多云', ico: '☁️' }, { key: 'rain', name: '雨', ico: '🌧️' },
    { key: 'snow', name: '雪', ico: '❄️' }, { key: 'dawn', name: '清晨', ico: '🌅' },
    { key: 'dusk', name: '黄昏', ico: '🌇' }, { key: 'night', name: '夜', ico: '🌙' },
  ],
}
const { defaultPixels } = await import('/home/tux/编程/光域/web/functions/api/_avatar.js')

/* ---------- 路由 ---------- */
function api(u) {
  const p = u.pathname
  if (p === '/api/get') {
    const limit = Number(u.searchParams.get('limit')) || 60
    return { ok: true, history: works.slice(0, limit), total: works.length, random: false,
      pixels: works[0].pixels, workName: works[0].workName, author: works[0].author, size: works[0].size,
      time: works[0].time, likes: works[0].likes, name: works[0].name }
  }
  if (p === '/api/town' && u.searchParams.get('list')) {
    // 小镇地图：列出所有屋子
    const houses = [
      { uid: 'u1', name: '小林同学', slot: 0, top: '', n: 10 },
      { uid: 'u2', name: '墨白', slot: 1, top: '', n: 8 },
      { uid: 'u3', name: '星野', slot: 2, top: '', n: 12 },
      { uid: 'u4', name: '青禾', slot: 5, top: '', n: 6 },
      { uid: 'u5', name: '拾光', slot: 7, top: '', n: 9 },
      { uid: 'u6', name: '半夏', slot: 11, top: '', n: 4 },
      { uid: 'u7', name: '木鱼', slot: 14, top: '', n: 7 },
    ]
    // 每间屋子的缩略图：给个 top 字符（前端会用调色板画）
    return { ok: true, room: 16, pal: TPAL, catalog: CATALOG, list: houses }
  }
  if (p === '/api/town') {
    return { ok: true, mine: true, uid: 'u1', name: '我', room: 16, floor: 8, pal: TPAL,
      catalog: CATALOG, house, msgs: [{ id: 'm1', uid: 'u2', name: '墨白', text: '你家窗外的雪真好看', at: 1730000000000 }],
      liked: false, homes: 3, peerLastAt: 0 }
  }
  if (p === '/api/avatar') return { ok: true, uid: 'u1', size: 16, cost: { pixel: 20, spray: 30 }, modes: ['pixel', 'spray'], has: true, hasDrawing: true, useDefault: false, currentMode: 'pixel', pixels: null, default: defaultPixels('u1'), book: { bal: 328 } }
  if (p === '/api/challenge' || p === '/api/contest') return { ok: true, items: [], top: [], total: 0 }
  if (p === '/api/mine') return { ok: true, works: works.slice(0, 4), stats: { works: 4, likes: 46, dust: 328 } }
  if (p === '/api/mail') return { ok: true, mails: [] }
  if (p === '/api/achieve') return { ok: true, unlocked: 42, total: 154, list: [] }
  if (p === '/api/profile') return { ok: true, uid: 'u1', username: '小林同学', bio: '喜欢画像素画', avatar: null,
    createdAt: 1726000000000, gender: '', birthday: '', todayBirthday: false, birthdayLockLeft: 0, received: 46,
    works: 6, followers: 3, following: 5 }
  if (p === '/api/follow') return { ok: true, followers: 3, following: 5, iFollow: false, friend: false }
  if (p === '/api/dailytask') return { ok: true, claimable: 2, tasks: [] }
  if (p === '/api/chat') return { ok: true, me: 'u1', list: [], items: [] }
  if (p === '/api/auth') return { ok: true, uid: 'u1', username: '我' }
  if (p === '/api/dust') return { ok: true, bal: 328, streak: 5, total: 328 }
  return { ok: true }
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x')
  // 登录态注入页：设好 localStorage 再跳到目标
  if (u.pathname === '/__boot') {
    const to = u.searchParams.get('to') || '/paint'
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`<!doctype html><meta charset="utf-8"><script>
localStorage.setItem('lw-token','mock-token-for-screenshot');
localStorage.setItem('lw-user','小林同学');   // 这个键存的就是用户名本身，不是 JSON
// 画板的首次访问提示存在 cookie 里，不设的话会挡住整个页面
document.cookie = 'paint_consent=1; path=/; max-age=86400';
location.replace(${JSON.stringify(to)});
</script>`)
    return
  }
  if (u.pathname.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    res.end(JSON.stringify(api(u)))
    return
  }
  let f = path.join(ROOT, decodeURIComponent(u.pathname))
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(ROOT, 'index.html')
  res.writeHead(200, { 'Content-Type': (MIME[path.extname(f)] || 'application/octet-stream') + '; charset=utf-8' })
  res.end(fs.readFileSync(f))
}).listen(PORT, '127.0.0.1', () => console.log('mock 服务器就绪 http://127.0.0.1:' + PORT))
