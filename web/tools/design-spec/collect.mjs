import fs from 'fs'
import path from 'path'
const V = '/home/tux/编程/光域/web/public/views'
const IDX = '/home/tux/编程/光域/web/public/index.html'

const html = fs.readFileSync(IDX, 'utf8')
// 1) index.html 里的全局 <style>
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1])
let all = styles.join('\n')

// 2) 每个 view 的 css: `...`
const files = fs.readdirSync(V).filter((f) => f.endsWith('.js'))
let got = 0
for (const f of files) {
  const src = fs.readFileSync(path.join(V, f), 'utf8')
  const i = src.indexOf('css: `')
  if (i < 0) continue
  const a = i + 6
  const b = src.indexOf('`,', a)
  if (b < 0) continue
  all += '\n/* ===== ' + f + ' ===== */\n' + src.slice(a, b)
  got++
}
fs.writeFileSync('.spec/all.css', all)
console.log('  ✓ 收集了 index.html 的 ' + styles.length + ' 个 style 块 + ' + got + ' 个视图的 css')
console.log('  合计 ' + (all.length / 1024).toFixed(1) + ' KB')
