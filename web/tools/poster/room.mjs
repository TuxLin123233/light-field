import fs from 'fs'
import zlib from 'zlib'
import { FURNITURE, SURFACES, PAL, sanitizeItems, emptyHouse } from '/home/tux/编程/光域/web/functions/api/_town.js'

const src = fs.readFileSync('/home/tux/编程/光域/web/public/views/town.js', 'utf8')
function blockAt(i) {
  const b = src.indexOf('{', i); let d = 0
  for (let j = b; j < src.length; j++) {
    if (src[j] === '{') d++
    else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1) }
  }
  throw new Error('配对失败')
}
const fn = (n) => blockAt(src.indexOf('function ' + n + '('))
const arrow = (n) => blockAt(src.indexOf('const ' + n + ' ='))
const konst = (n) => blockAt(src.indexOf('const ' + n + ' = {'))
const code = [
  fn('windowRect'), fn('drawWindow'), konst('SKY'), arrow('artSize'), arrow('findItem'),
  arrow('surfaceOf'), fn('surfaceTile'), fn('drawArt'), fn('drawRoom'),
  'let cat, house, PAL, ROOM, floorY, mine = false, picked = null, dragOn = false, wxT = 3, curWeather = () => "sunny"',
  'const CV = { cv: null }',
  'const $ = (id) => (id === "twRoom" ? CV.cv : null)',
  'export function setup(o) { ({ cat, house, PAL, ROOM, floorY } = o) }',
  'export function setCanvas(c) { CV.cv = c }',
  'export function setWeather(w) { curWeather = () => w }',
  'export { drawRoom }',
].join('\n')
fs.writeFileSync('.poster/_room.mjs', code)

const { setup, setCanvas, setWeather, drawRoom } = await import('./_room.mjs')

function mk(w, h) {
  const px = new Map(); let cur = [0, 0, 0]; let al = 1
  const put = (x, y, c) => {
    x = Math.round(x); y = Math.round(y)
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const i = y * w + x
    if (al >= 0.999) { px.set(i, c); return }
    const o = px.get(i) || [255, 255, 255]
    px.set(i, [Math.round(o[0] * (1 - al) + c[0] * al), Math.round(o[1] * (1 - al) + c[1] * al), Math.round(o[2] * (1 - al) + c[2] * al)])
  }
  const ctx = {
    set fillStyle(v) {
      let m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(v)
      if (m) { cur = [+m[1], +m[2], +m[3]]; al = 1; return }
      m = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(v)
      if (m) { cur = [+m[1], +m[2], +m[3]]; al = +m[4]; return }
      cur = [255, 0, 255]; al = 1
    },
    fillRect(x, y, ww, hh) {
      for (let j = 0; j < Math.max(1, Math.round(hh)); j++)
        for (let i = 0; i < Math.max(1, Math.round(ww)); i++) put(Math.round(x) + i, Math.round(y) + j, cur)
    },
  }
  return { width: w, height: h, classList: { contains: () => false }, getContext: () => ctx, _px: px }
}

const ROOM = 16, FLOOR = 8
const LAYOUT = [
  { id: 'poster__gold', x: 1, y: 1 }, { id: 'clock__ink', x: 6, y: 1 }, { id: 'banner__sakura', x: 1, y: 5 },
  { id: 'bed2__sea', x: 1, y: 9 }, { id: 'nightstand__sea', x: 8, y: 9 }, { id: 'lamp__gold', x: 12, y: 9 },
  { id: 'table__gold', x: 1, y: 13 }, { id: 'chair__gold', x: 6, y: 13 },
  { id: 'plant__forest', x: 9, y: 12 }, { id: 'cushion__sakura', x: 13, y: 13 },
]
const items = sanitizeItems(LAYOUT.map((i) => ({ id: i.id, x: i.x, y: i.y })), ROOM)
if (!items) { console.log('  ✗ 摆位不合法'); process.exit(1) }

const cv = mk(ROOM, ROOM)
setCanvas(cv)
setup({ cat: { furniture: FURNITURE, surfaces: SURFACES }, house: { ...emptyHouse(), size: ROOM, weather: 'snow', items }, PAL, ROOM, floorY: FLOOR })
setWeather('snow')
drawRoom()

let T = null
function crc32(b) { if (!T) { T = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0 } } let c = 0xffffffff; for (const x of b) c = T[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
function png(w, h, get) {
  const raw = Buffer.alloc((w * 3 + 1) * h); let o = 0
  for (let y = 0; y < h; y++) { raw[o++] = 0; for (let x = 0; x < w; x++) { const c = get(x, y); raw[o++] = c[0]; raw[o++] = c[1]; raw[o++] = c[2] } }
  const ch = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]) }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ch('IHDR', ih), ch('IDAT', zlib.deflateSync(raw)), ch('IEND', Buffer.alloc(0))])
}
const S = 40
fs.writeFileSync('.poster/room.png', png(ROOM * S, ROOM * S, (x, y) => cv._px.get(Math.floor(y / S) * ROOM + Math.floor(x / S)) || [255, 0, 255]))
fs.unlinkSync('.poster/_room.mjs')
console.log('  ✓ room.png  ' + ROOM * S + '×' + ROOM * S)
