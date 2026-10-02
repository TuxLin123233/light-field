import fs from 'fs'
const src = fs.readFileSync('/home/tux/编程/光域/web/public/views/town.js', 'utf8')
function blockAt(i) { const b = src.indexOf('{', i); let d = 0; for (let j = b; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1) } } }
const fn = (n) => blockAt(src.indexOf('function ' + n + '('))
fs.writeFileSync('.poster/_surf.mjs', fn('surfaceTile') + '\nexport { surfaceTile }\n')
const { surfaceTile } = await import('./_surf.mjs')
const { SURFACES } = await import('/home/tux/编程/光域/web/functions/api/_town.js')
const out = SURFACES.map((s) => ({ id: s.id, name: s.name, kind: s.kind, tile: surfaceTile(s, 16, 0).map((r) => r.join('')) }))
fs.writeFileSync('.poster/surfaces.json', JSON.stringify(out))
fs.unlinkSync('.poster/_surf.mjs')
const K = { wall: 0, floor: 0 }
for (const s of out) K[s.kind]++
console.log('  ✓ surfaces.json：' + out.length + ' 种（墙纸 ' + K.wall + ' / 地毯 ' + K.floor + '）')
