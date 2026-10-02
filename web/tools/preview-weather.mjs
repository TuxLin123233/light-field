#!/usr/bin/env node
/**
 * 把小镇墙上那扇小窗的天气渲染成 PNG，用眼睛检查。
 *
 * 为什么需要它：窗户只有几个像素大，「雨」和「雪」的差别全在形状上，
 * 光看代码根本判断不出来像不像。这个脚本把 town.js 里的 windowRect /
 * drawWindow **原样抽出来**（一个字符都不改，所以看到的就是真实效果），
 * 配一个假 canvas 记录 fillRect，再手写 PNG 输出。
 *
 *   node web/tools/preview-weather.mjs
 *
 * 产出 forecast.png：每行一种天气，每列一个动画瞬间。
 * 窗子尺寸会跟着 ROOM 走，改 ROOM 可以看大屋子下的表现。
 */
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { fileURLToPath } from 'url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..', 'public', 'views', 'town.js')
const OUT = process.argv[2] || path.join(process.cwd(), 'forecast.png')
const ROOM = Number(process.argv[3]) || 16

/* ---------- 1. 从 town.js 里原样抽出要用的代码 ---------- */
const src = fs.readFileSync(SRC, 'utf8')
function blockAt(i) {
  const b = src.indexOf('{', i)
  let d = 0
  for (let j = b; j < src.length; j++) {
    if (src[j] === '{') d++
    else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1) }
  }
  throw new Error('大括号配对失败')
}
const fn = (n) => blockAt(src.indexOf('function ' + n + '('))
const konst = (n) => blockAt(src.indexOf('const ' + n + ' = {'))
const code = [
  '// 自动抽取，请勿手改',
  fn('windowRect'), '', fn('drawWindow'), '', konst('SKY'), '',
  'const ROOM = ' + ROOM,
  'const FLOOR = Math.max(4, Math.round(ROOM / 2))',
  'let wxT = 0',
  'export { drawWindow, windowRect }',
  'export function setFrame(n) { wxT = n }',
].join('\n')
const tmp = path.join(HERE, '.preview-tmp.mjs')
fs.writeFileSync(tmp, code)

/* ---------- 2. 假 canvas：把 fillRect 记进像素表 ---------- */
function mock() {
  const px = new Map()
  let cur = [0, 0, 0]
  return {
    set fillStyle(v) {
      const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(v)
      cur = m ? [+m[1], +m[2], +m[3]] : [0, 0, 0]
    },
    fillRect(x, y, w, h) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px.set((y + j) + ',' + (x + i), cur)
    },
    _px: px,
  }
}

/* ---------- 3. 最小 PNG 编码（Node 自带 zlib，不装库） ---------- */
let TBL = null
function crc32(buf) {
  if (!TBL) {
    TBL = []
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TBL[n] = c >>> 0 }
  }
  let c = 0xffffffff
  for (const b of buf) c = TBL[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function png(w, h, get) {
  const raw = Buffer.alloc((w * 3 + 1) * h)
  let o = 0
  for (let y = 0; y < h; y++) {
    raw[o++] = 0
    for (let x = 0; x < w; x++) { const c = get(x, y); raw[o++] = c[0]; raw[o++] = c[1]; raw[o++] = c[2] }
  }
  const ch = (t, d) => {
    const l = Buffer.alloc(4); l.writeUInt32BE(d.length)
    const td = Buffer.concat([Buffer.from(t), d])
    const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td))
    return Buffer.concat([l, td, c])
  }
  const ih = Buffer.alloc(13)
  ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ch('IHDR', ih), ch('IDAT', zlib.deflateSync(raw)), ch('IEND', Buffer.alloc(0))])
}

/* ---------- 4. 渲染 ---------- */
const { drawWindow, windowRect, setFrame } = await import('file://' + tmp + '?v=' + Date.now())
const WX = ['sunny', 'cloudy', 'rain', 'snow', 'dawn', 'dusk', 'night']
const FRS = [0, 2, 4, 6]
const S = 22
const r = windowRect()
const CW = r.w * S, CH = r.h * S, G = 6
const W = FRS.length * CW + (FRS.length + 1) * G
const H = WX.length * CH + (WX.length + 1) * G
const buf = new Map()
const put = (x, y, c) => buf.set(y * W + x, c)

WX.forEach((w, row) => {
  FRS.forEach((f, col) => {
    setFrame(f)
    const c = mock()
    drawWindow(c, w)
    const ox = G + col * (CW + G), oy = G + row * (CH + G)
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) put(ox + x, oy + y, [236, 236, 240])
    for (const [k, col2] of c._px) {
      const [py, px2] = k.split(',').map(Number)
      const sx = (px2 - r.x) * S, sy = (py - r.y) * S
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(ox + sx + x, oy + sy + y, col2)
    }
  })
})

fs.writeFileSync(OUT, png(W, H, (x, y) => buf.get(y * W + x) || [255, 255, 255]))
fs.unlinkSync(tmp)
console.log('ROOM=' + ROOM + ' → 窗子 ' + r.w + '×' + r.h + ' 像素，放大 ' + S + ' 倍')
console.log('写出 ' + OUT + '  ' + W + '×' + H)
console.log('行（上到下）：' + WX.join(' / '))
console.log('列 = 动画瞬间 wxT = ' + FRS.join(', '))
