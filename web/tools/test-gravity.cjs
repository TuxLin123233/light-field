// lw-gravity.js 物理与交互验证（不依赖真实 canvas）
// 桩掉 DOM，但保留 addEventListener，这样能真的派发 pointer 事件，
// 走「点击 → 颗粒落下 → 落定停转」这条完整链路，而不只是调内部函数。
const fs = require('fs')

const STEP = 32

// ---- 最小 DOM 桩 ----
function makeCtxStub() {
  const noop = () => {}
  return {
    createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
    putImageData: noop, drawImage: noop, clearRect: noop,
    fillRect: noop, setTransform: noop, imageSmoothingEnabled: true,
  }
}
let rafQ = []
let rafId = 0
global.requestAnimationFrame = (fn) => { rafId++; rafQ.push({ id: rafId, fn }); return rafId }
global.cancelAnimationFrame = (id) => { const e = rafQ.find(r => r.id === id); if (e) e.fn = null }

// 推进时间轴：每帧 +STEP，把 rAF 队列跑干净
function tick(frames) {
  let t = rafQ._t || STEP
  for (let i = 0; i < frames; i++) {
    const q = rafQ
    rafQ = []
    rafQ._t = t
    for (const r of q) if (r.fn) r.fn(t)
    t += STEP
  }
  return t
}
function rafPending() { return rafQ.some(r => r.fn) }

global.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => makeCtxStub() }),
  getElementById: () => null,
}
global.window = { devicePixelRatio: 2 }
global.ResizeObserver = undefined

const src = fs.readFileSync(__dirname + '/../public/lw-gravity.js', 'utf8')
eval(src)
const G = global.window.LWGravity

function newBoard(size) {
  const handlers = {}
  const canvas = {
    getContext: () => makeCtxStub(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 512, height: 512 }),
    addEventListener: (t, fn) => { (handlers[t] = handlers[t] || []).push(fn) },
    removeEventListener: (t, fn) => {
      if (handlers[t]) handlers[t] = handlers[t].filter(f => f !== fn)
    },
  }
  const g = G.create(canvas, { size: size || 64, getColor: () => [229, 57, 53] })
  // 逻辑坐标 → 屏幕坐标（画布显示 512 宽）
  const dispatch = (type, gx, gy) => {
    const N = size || 64
    const ev = { clientX: (gx + 0.5) * 512 / N, clientY: (gy + 0.5) * 512 / N, preventDefault() {} }
    ;(handlers[type] || []).forEach(fn => fn(ev))
  }
  return { g, canvas, handlers, click: (x, y) => dispatch('pointerdown', x, y),
           drag: (x, y) => dispatch('pointermove', x, y), up: () => dispatch('pointerup', 0, 0) }
}

let pass = 0, fail = 0
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (extra !== undefined ? '  → ' + extra : '')) }
}
const N = 64

// ============ 1. 点击 → 颗粒出现并往下掉 ============
console.log('\n[1] 点击后像素点会掉落')
{
  const b = newBoard()
  b.g.setBrush(2)
  ok('初始为空', b.g.isEmpty())
  b.click(32, 2)            // 点在顶部
  ok('点击后有颗粒了', b.g.filled() > 0, 'filled=' + b.g.filled())
  ok('点击后开始运动', b.g.isMoving())

  const topAfterClick = b.g.getBuffer().slice(0, N * 2).some(Boolean)
  ok('颗粒此刻还在顶部附近', topAfterClick)

  // 每帧只落 1 格，从顶到底要 ~63 步，给足 120 帧
  tick(120)
  const buf = b.g.getBuffer()
  let topMost = -1, botMost = -1
  for (let y = 0; y < N; y++) if (buf.slice(y * N, y * N + N).some(Boolean)) { if (topMost < 0) topMost = y; botMost = y }
  ok('颗粒已落到底部（贴着底行）', botMost === N - 1, '最低行=' + botMost)
  ok('整堆都在底部几行内', topMost >= N - 4, '最高行=' + topMost)
  ok('数量守恒（掉落没吞掉颗粒）', b.g.filled() === 9, 'filled=' + b.g.filled())
}

// ============ 2. 落定后自动停转（省电） ============
console.log('\n[2] 落定后停转')
{
  const b = newBoard()
  b.click(32, 2)
  tick(200)                 // 给足沉降时间
  ok('落定后 isMoving 为 false', b.g.isMoving() === false)
  ok('rAF 队列已排空（不再空转）', rafPending() === false)
  const before = rafQ.length
  tick(100)
  ok('静置期间不再排新帧', rafQ.length === before)
}

// ============ 3. 堆积出斜坡 ============
console.log('\n[3] 沙堆有坡度')
{
  const b = newBoard()
  b.g.setBrush(4)           // 大把
  b.click(32, 30)
  tick(200)
  const heights = []
  for (let x = 0; x < N; x++) {
    let h = 0
    for (let y = 0; y < N; y++) if (b.g.getBuffer()[y * N + x]) h++
    heights.push(h)
  }
  const w = heights.filter(h => h > 0).length
  const maxH = Math.max(...heights)
  const centerH = heights[32]
  let leftH = 0, rightH = 0
  for (let i = 0; i < N; i++) { if (heights[i]) { leftH = heights[i]; break } }
  for (let i = N - 1; i >= 0; i--) { if (heights[i]) { rightH = heights[i]; break } }
  ok('铺开成一片而不是一根柱', w > 8, '宽度=' + w)
  ok('中间高、两侧低（有坡度）', centerH > Math.max(leftH, rightH),
     `center=${centerH} left=${leftH} right=${rightH}`)
  ok('没堆到顶', maxH < N, 'max=' + maxH)
  ok('没堆出底面（还能往下落）', maxH < 20, 'max=' + maxH)
}

// ============ 4. 拖动连续撒 ============
console.log('\n[4] 拖动')
{
  const b = newBoard()
  b.g.setBrush(3)
  b.click(5, 5)
  for (let x = 5; x <= 30; x++) b.drag(x, 5)
  b.up()
  tick(200)
  const n = b.g.filled()
  ok('拖出一条连续的带子', n > 40, 'filled=' + n)
  // 这条带子应该堆成一道横墙，宽 26 左右
  let cols = 0
  for (let x = 0; x < N; x++) { let h = 0; for (let y = 0; y < N; y++) if (b.g.getBuffer()[y * N + x]) h++; if (h) cols++ }
  ok('横向铺开 20 列以上', cols >= 20, 'cols=' + cols)
}

// ============ 5. 抖一抖 ============
console.log('\n[5] 抖一抖')
{
  const b = newBoard()
  b.g.setBrush(2)
  for (let i = 0; i < 12; i++) b.click(32, 20 + i)
  tick(300)
  const filled0 = b.g.filled()
  ok('堆完数量守恒', filled0 > 0 && filled0 <= 12 * 9, 'filled=' + filled0)

  /* 这条才是真正的回归点。
     之前的 shake 用的移动集合跟 settle() 一模一样（斜向滑动早就有了），
     只是把斜向乘了 0.55 —— 也就是「允许做的事比正常重力还少」。
     沙堆早就落定，四条邻边全被占死，于是 moved 恒为 false，
     3 帧后循环自己停了：按「抖一抖」看着就是没反应。
     所以要盯的是「已落定的沙堆被摇动了」——旧实现做不到这件事。 */
  const fp = () => b.g.getBuffer().map((p) => (p ? p[0] + ',' + p[1] + ',' + p[2] : '-')).join('|')
  const fp0 = fp()
  b.g.shake()
  tick(400)
  ok('已落定的沙堆被摇动了', fp() !== fp0)

  /* 摇完必须重新落定：任何一个颗粒下面不该是空的。
     settle() 永远先试正下方，所以「悬空」在纯重力下不可能残留 ——
     摇完也必须满足这一条，否则说明它停在了靠抖动才站得住的假平衡上。 */
  const buf = b.g.getBuffer()
  let floating = 0
  for (let y = 0; y < N - 1; y++) for (let x = 0; x < N; x++) if (buf[y * N + x] && !buf[(y + 1) * N + x]) floating++
  ok('摇完没有悬空颗粒（已重新落定）', floating === 0, 'floating=' + floating)
  ok('抖动不丢颗粒', b.g.filled() === filled0, 'filled=' + b.g.filled() + ' 原=' + filled0)

  // 再摇一次不能越摇越少（也不能靠丢颗粒伪造「塌了」）
  b.g.shake()
  tick(400)
  ok('反复摇颗粒数守恒', b.g.filled() === filled0, 'filled=' + b.g.filled())

  /* 「更紧实」到底该怎么测？
     一开始用重心高度，结果随机挂：先是因为允许上移，窄柱里的颗粒
     会一路爬到柱顶（62.05 → 62.19，越摇越高）；把上移排除掉之后
     仍有 +0.15 的漂移 —— 因为移动是「置换」，颗粒数守恒但占的格子
     会重排，重心本来就会小幅乱走。这个引擎给不了「一定更紧实」的
     保证，测试也不该去证明一个证明不了的事。

     换个能证明、也正是这个按钮要解决的问题：解死锁。
     纯重力下「正下方占着 + 两个斜下方也占着」就永远动不了，
     于是一座细烟囱能一直立着。抖一抖放开横向，它就该塌。
     这个是确定的：横向一放开，烟囱顶那颗旁边就是空的，必然挪开。 */
  const b2 = newBoard()
  const buf2 = b2.g.getBuffer()
  const P = (x, y) => { buf2[y * N + x] = [180, 120, 60] }
  // 底座
  for (let x = 6; x <= 18; x++) P(x, 63)
  // 立在底座上的一根细烟囱：x=12 那一列从 40 排到 62
  for (let y = 40; y <= 62; y++) P(12, y)
  const n2 = b2.g.filled()
  tick(200)
  ok('烟囱在纯重力下立得住（这是前提，塌了就没得测了）',
    b2.g.getBuffer()[40 * N + 12] != null && b2.g.filled() === n2,
    '顶=' + (b2.g.getBuffer()[40 * N + 12] ? '在' : '没了'))
  b2.g.shake()
  tick(400)
  ok('抖一抖把烟囱摇塌了', b2.g.getBuffer()[40 * N + 12] == null,
    '顶=' + (b2.g.getBuffer()[40 * N + 12] ? '还在' : '塌了'))
  ok('烟囱塌了但颗粒没丢', b2.g.filled() === n2, `filled=${b2.g.filled()} 原=${n2}`)

  const e = newBoard()
  e.g.shake()
  tick(60)
  ok('空板子抖了不报错', e.g.filled() === 0, 'filled=' + e.g.filled())
}

// ============ 6. 裁剪导出 ============
console.log('\n[6] 裁剪导出')
{
  const b = newBoard()
  const buf = b.g.getBuffer()
  for (let y = 50; y < 54; y++) for (let x = 40; x < 45; x++) buf[y * N + x] = [9, 9, 9]
  const out = b.g.exportData()
  ok('返回数据', !!out)
  ok('小内容 → 16 档', out.size === 16, 'size=' + out.size)
  ok('flat 长度 = size²', out.flat.length === out.size * out.size)
  const at = (x, y) => out.flat[y * 16 + x]
  ok('内容居中', at(5, 6)[0] === 9 && at(9, 9)[0] === 9, JSON.stringify([at(5, 6), at(9, 9)]))
  ok('空白为白底', at(0, 0)[0] === 255)
  ok('原缓冲没被改动（导出不是破坏性）', b.g.filled() === 20, 'filled=' + b.g.filled())
}
{ const b = newBoard(); ok('空画布导出 null', b.g.exportData() === null) }
{
  const b = newBoard(); const buf = b.g.getBuffer()
  for (let y = 5; y < 55; y++) for (let x = 5; x < 55; x++) buf[y * N + x] = [5, 5, 5]
  ok('大内容 → 64 档', b.g.exportData().size === 64)
}
{
  const b = newBoard(); const buf = b.g.getBuffer()
  for (let y = 30; y < 50; y++) for (let x = 20; x < 40; x++) buf[y * N + x] = [5, 5, 5]
  ok('中等内容 → 32 档', b.g.exportData().size === 32)
}

// ============ 7. 撤销 / 清空 ============
console.log('\n[7] 撤销与清空')
{
  const b = newBoard()
  b.g.setBrush(2)
  b.click(32, 5)              // snapshot #1（空）+ 落笔
  const n1 = b.g.filled()
  ok('有内容', n1 === 9, 'filled=' + n1)
  b.g.clear()                  // snapshot #2（有内容）+ 清空
  ok('清空后为空', b.g.isEmpty())
  ok('撤销回到清空前', b.g.undo() === true && b.g.filled() === n1, 'filled=' + b.g.filled())
  ok('再撤销回到落笔前（空）', b.g.undo() === true && b.g.isEmpty())
  ok('撤销栈耗尽返回 false', b.g.undo() === false)
}

// ============ 8. 边界与钳制 ============
console.log('\n[8] 边界')
{
  const b = newBoard()
  b.g.setBrush(99);  ok('笔刷钳到 4', b.g.getBrush() === 4, b.g.getBrush())
  b.g.setBrush(0);   ok('笔刷钳到 1', b.g.getBrush() === 1, b.g.getBrush())
  b.g.setBrush('x'); ok('非法值退回 1', b.g.getBrush() === 1, b.g.getBrush())
}
{
  const b = newBoard()
  // 点到边界外不应崩、不应越界写
  const canvasEv = b.canvas
  b.click(-5, -5); b.click(N + 50, N + 50); b.click(0, 0); b.click(N - 1, N - 1)
  ok('越界点击不崩、也没写越界', b.g.filled() > 0)
  let oob = false
  const buf = b.g.getBuffer()
  for (let i = 0; i < buf.length; i++) if (buf[i]) {}
  if (buf.length !== N * N) oob = true
  ok('缓冲长度正确', !oob)
}
{
  const b = newBoard()
  const buf = b.g.getBuffer()
  for (let i = 0; i < N * N; i++) buf[i] = [i % 255, 0, 0]   // 满盘
  const t = Date.now()
  b.g.settleNow()
  const dt = Date.now() - t
  ok('满盘沉降不死循环', dt < 3000, dt + 'ms')
  let holes = 0
  for (let i = 0; i < N * N; i++) if (!b.g.getBuffer()[i]) holes++
  ok('满盘无空洞', holes === 0, 'holes=' + holes)
}
{
  // 极端：全部塞满最上面一行，看会不会溢出
  const b = newBoard()
  const buf = b.g.getBuffer()
  for (let x = 0; x < N; x++) buf[x] = [1, 1, 1]
  const t = Date.now()
  b.g.settleNow()
  ok('单行满载不卡死', Date.now() - t < 3000)
  ok('单行满载颗粒数守恒', b.g.filled() === N, 'filled=' + b.g.filled())
}

console.log(`\n${fail === 0 ? '全部通过' : '有失败'}：${pass} 通过 / ${fail} 失败`)
process.exit(fail === 0 ? 0 : 1)
/* ================= 抖一抖 =================
   用户反馈「抖一抖还是失败」，这里专门盯它。
   之前的测试只验「shake 之后格子数守恒」——那样子一个完全不动的
   shake 也能通过（格子数当然不变）。要看的是「沙堆真的塌了」：
   堆完之后拿到底部支撑的「宽度」当指标，摇完应该变小。 */
