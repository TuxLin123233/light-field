import fs from 'fs'
import { defaultPixels } from '/home/tux/编程/光域/web/functions/api/_avatar.js'
import { FURNITURE, PAL, SURFACES } from '/home/tux/编程/光域/web/functions/api/_town.js'

// 头像：挑 60 个名字
const NAMES = ('alice bob carol dave erin frank grace heidi ivan judy mallory niaj olivia peggy quinn rupert ' +
  'sybil trent uma victor wendy xavier yuki zara 阿光 小林 星野 墨白 青禾 长风 拾光 半夏 木鱼 山茶 ' +
  'nori pico bit pixel dot byte cube voxel sprite tile chip node mesh glitch retro arcade ' +
  'nova luna stella orion vega comet nebula cosmos echo drift').split(' ')

// 家具：挑色数最多的 96 件（最能看出差别）
const score = (f) => new Set(f.art.join('').split('')).size
const FURN = [...FURNITURE].sort((a, b) => score(b) - score(a)).slice(0, 96)

const out = {
  avatars: NAMES.map((n) => ({ name: n, px: defaultPixels(n) })),
  furniture: FURN.map((f) => ({ id: f.id, name: f.name, art: f.art, pal: f.pal || null })),
  pal: PAL,
  surfaces: SURFACES.map((s) => ({ id: s.id, name: s.name, kind: s.kind })),
}
fs.writeFileSync('.poster/data.json', JSON.stringify(out))
console.log('  ✓ data.json：' + out.avatars.length + ' 个头像，' + out.furniture.length + ' 件家具')
