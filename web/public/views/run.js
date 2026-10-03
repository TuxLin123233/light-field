// 像素小镇 · 跑酷
//
// 无尽跑酷，地形**程序性生成** —— 没有关卡数据，全靠一个种子推出来。
//
// 生成方式：不是随机撒障碍，而是按「段」拼。
//   每一段（chunk）是一小截地形，有固定的几种形态：
//   平地、坑、台阶、双层台、断桥、管道……
//   难度越高，越容易抽到难段，段间空隙也越大。
//   这样出来的地形有节奏，不会出现「连续三个坑必死」这种无解组合。
//
// 操作：空格 / 点击 / 上滑 = 跳（可二段跳），按住 = 跳更高，下滑 = 滑铲

export default {
  name: 'town-run',
  title: '像素跑酷',
  css: `
    .rk-page { max-width: 560px; margin: 0 auto; padding: 0 0 calc(90px + env(safe-area-inset-bottom, 0px)); }
    .rk-head {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px;
      background: linear-gradient(180deg, #2b3f6b, #1e2d4d);
      border-bottom: 3px solid #141d33;
      box-shadow: 0 4px 14px rgba(15,25,50,.35), inset 0 1px 0 rgba(255,255,255,.12);
    }
    .rk-back {
      font-size: 13px; font-weight: 700; text-decoration: none;
      color: #cfe0ff; background: rgba(255,255,255,.12);
      border-radius: 999px; padding: 5px 11px;
    }
    .rk-back:active { transform: scale(.95) }
    .rk-title { font-size: 18px; font-weight: 800; color: #f2f6ff; flex: 1; text-shadow: 0 2px 0 rgba(10,18,35,.7) }

    /* 舞台：夜空 + 远山，和跑酷的横版视角一致 */
    .rk-stage {
      position: relative;
      margin: 12px 12px 0;
      border-radius: 16px;
      overflow: hidden;
      border: 3px solid #16223d;
      box-shadow: inset 0 0 40px rgba(0,0,0,.45), 0 6px 20px rgba(15,25,50,.28);
      background: #0d1428;
      touch-action: none;
      -webkit-user-select: none; user-select: none;
    }
    .rk-stage canvas { display: block; width: 100%; image-rendering: pixelated; }

    /* 顶部叠一层状态：分数 / 最远 / 光尘 */
    .rk-hud {
      position: absolute; inset: 6px 10px auto 10px;
      display: flex; align-items: flex-start; gap: 10px;
      pointer-events: none;
      font-variant-numeric: tabular-nums;
    }
    .rk-score {
      font-size: 22px; font-weight: 900; color: #fff;
      text-shadow: 0 2px 0 rgba(0,0,0,.55), 0 0 12px rgba(120,180,255,.5);
      line-height: 1.1;
    }
    .rk-score small { display: block; font-size: 10px; font-weight: 700; opacity: .7; letter-spacing: .5px }
    .rk-best { margin-left: auto; text-align: right; font-size: 11px; color: #b9cdf0; line-height: 1.6 }
    .rk-best b { display: block; font-size: 15px; color: #fff }

    /* 加成提示：吃到东西时从右侧飘一下 */
    .rk-pop {
      position: absolute; right: 12px; top: 46%;
      font-size: 13px; font-weight: 800; color: #ffe27a;
      text-shadow: 0 2px 0 rgba(0,0,0,.5);
      opacity: 0; pointer-events: none;
    }
    .rk-pop.show { animation: rkPop .7s ease-out }
    @keyframes rkPop {
      0% { opacity: 0; transform: translateY(6px) }
      25% { opacity: 1; transform: translateY(0) }
      100% { opacity: 0; transform: translateY(-22px) }
    }

    /* 覆盖层：开始 / 结束 */
    .rk-over {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 8px; padding: 20px; text-align: center;
      background: rgba(8,14,28,.72);
      backdrop-filter: blur(3px);
      color: #eaf1ff;
    }
    .rk-over[hidden] { display: none }
    .rk-over b { font-size: 19px; text-shadow: 0 2px 0 rgba(0,0,0,.5) }
    .rk-over p { margin: 0; font-size: 12.5px; line-height: 1.85; color: #b9cdf0; max-width: 300px }
    .rk-over .rk-keys { font-size: 11.5px; color: #8fa6cc; line-height: 2 }
    .rk-over kbd {
      display: inline-block; padding: 1px 6px; margin: 0 2px;
      border: 1px solid #3d5178; border-radius: 5px;
      background: #1b2740; color: #cfe0ff; font-family: inherit; font-size: 11px;
    }
    .rk-go {
      margin-top: 6px; padding: 12px 34px;
      border: 0; border-radius: 999px;
      background: linear-gradient(180deg, #5b8def, #3f6bd0);
      color: #fff; font-family: inherit; font-size: 15px; font-weight: 800;
      cursor: pointer; box-shadow: 0 3px 0 #2f52a8;
    }
    .rk-go:active { transform: translateY(2px); box-shadow: none }

    /* 底部：成绩 + 说明 */
    .rk-foot {
      margin: 12px 12px 0; padding: 12px 14px;
      background: linear-gradient(180deg, #fffaf1, #f6ecdb);
      border: 1px solid #e0d0b4; border-radius: 14px;
      color: #4a3a24; font-size: 12.5px; line-height: 1.9;
      box-shadow: 0 2px 0 #e6d8c0;
    }
    html[data-mood='dark'] .rk-foot {
      background: linear-gradient(180deg, #322c24, #2a251e);
      border-color: #463d31; color: #ecdfc8; box-shadow: none;
    }
    .rk-foot b { font-size: 13px }
    .rk-acts { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap }
    .rk-acts button {
      flex: 1; min-width: 120px;
      padding: 10px; border: 1px solid #d3bb93; border-radius: 10px;
      background: #fff6e4; color: #4a3a20;
      font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
      box-shadow: 0 2px 0 #d9c09a;
    }
    .rk-acts button:active { transform: translateY(1px); box-shadow: none }
    html[data-mood='dark'] .rk-acts button {
      background: #3a332a; border-color: #4f4536; color: #efe3cf; box-shadow: 0 2px 0 #241f18;
    }
  `,
  template: `
    <div class="rk-page">
      <div class="rk-head">
        <a class="rk-back" href="/town">← 小镇</a>
        <div class="rk-title">🏃 像素跑酷</div>
      </div>

      <div class="rk-stage" id="rkStage">
        <canvas id="rkCv"></canvas>
        <div class="rk-hud">
          <div class="rk-score" id="rkScore">0<small>米</small></div>
          <div class="rk-best" id="rkBest"></div>
        </div>
        <div class="rk-pop" id="rkPop"></div>
        <div class="rk-over" id="rkOver">
          <b>能跑多远？</b>
          <p>地形是程序生成的 —— 每次开跑都不一样，<br>难度会一路往上加。</p>
          <div class="rk-keys">
            <kbd>空格</kbd> 或 <kbd>点击</kbd> 跳 · 连按两次二段跳<br>
            按住跳更高 · <kbd>↓</kbd> 滑铲
          </div>
          <button class="rk-go" id="rkGo" type="button">开始跑</button>
        </div>
      </div>

      <div class="rk-foot">
        <b>🏁 玩法</b><br>
        跳过坑、踩准台阶、躲开锯片。一路上有<b>光尘</b>和<b>加速带</b>。
        每 300 米进一个难度档，地形会越来越刁。
        <div class="rk-acts">
          <button id="rkShop" type="button">🎽 永久加成</button>
          <button id="rkBoard" type="button">📊 我的成绩</button>
        </div>
      </div>
    </div>
  `,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const token = () => { try { return localStorage.getItem('lw-token') || '' } catch (e) { return '' } }
    const esc = (x) =>
      String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

    /* ================= 存档 ================= */
    const SAVE_KEY = 'lw-town-save'
    const run = { best: 0, runs: 0, coins: 0, up: {} } // up: 永久加成等级
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
      if (raw.run) {
        run.best = raw.run.best || 0
        run.runs = raw.run.runs || 0
        run.coins = raw.run.coins || 0
        run.up = raw.run.up || {}
      }
    } catch (e) {}

    function saveRun() {
      let combo = {}
      try { combo = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') } catch (e) {}
      combo.run = { best: run.best, runs: run.runs, coins: run.coins, up: run.up }
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(combo)) } catch (e) {}
      const t = token()
      if (t) {
        fetch('/api/towngame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'save', save: combo }),
        }).catch(() => {})
      }
    }

    /* 永久加成：用跑出来的光尘解锁，下一次起跑就生效 */
    const UPGRADES = [
      { k: 'jump', n: '弹跳鞋', d: '起跳高度 +8%', cost: 60, max: 4 },
      { k: 'air', n: '二段跳', d: '多一次空中起跳', cost: 120, max: 1 },
      { k: 'magnet', n: '磁铁', d: '光尘吸取范围变大', cost: 90, max: 3 },
      { k: 'shield', n: '护盾', d: '每局免死一次', cost: 200, max: 1 },
      { k: 'slide', n: '滑行靴', d: '滑铲更久、更快', cost: 80, max: 3 },
    ]
    const lv = (k) => Number(run.up[k] || 0)

    /* ================= 像素绘制 =================
       全部用 fillRect 画方块 —— 和站里别处的像素风格一致，
       也不用任何美术资源。 */
    /* 调色板。原来那套偏灰、几种褐色糊在一起，跑起来看不出层次。
       现在天空用蓝紫渐变、地面用「草皮 + 泥土 + 石粒」三层，
       亮部暗部拉开，同时保持和站里其它像素图一个味道。 */
    const PAL = {
      sky1: '#141b3a', sky2: '#2a3260', sky3: '#5a5f9e', sky4: '#a86f8a',
      mount: '#1d2450', mount2: '#2b3468', mount3: '#3d4780',
      grassTop: '#6ec25a', grass: '#4a9e42', grassDark: '#357a33',
      dirt: '#8a6440', dirt2: '#6f4e30', dirt3: '#573c24',
      stone: '#9aa0a8', stone2: '#7c828a', edge: '#b8a888',
      player: '#ffd97a', player2: '#f0a93c', playerD: '#2a2320',
      playerSkin: '#ffd0a8', playerHair: '#3a2a1e', playerShirt: '#e8564a',
      coin: '#ffe45c', coin2: '#f0a93c',
      saw: '#d8dce4', saw2: '#8f96a4', saw3: '#5a6070',
      boost: '#5ee0a0', boost2: '#2fc888',
      spike: '#d9503f', spike2: '#8f2f28',
    }

    /* ================= 地形生成 =================
       按「段」拼。每段是一个小地形模板，宽度固定 16 格。
       难度决定各模板的权重，以及段与段之间要不要留空隙。 */
    const TILE = 16 // 逻辑像素一格
    const SEG_W = 16 // 每段 16 格宽

    /** 一段地形的描述：kind + 参数。返回 { solids:[], hazards:[], coins:[], boost:[] } 之类 */
    const SEG_KINDS = [
      // 平地：偶尔放一两个光尘
      { k: 'flat', w: (d) => Math.max(4, 26 - d * 3) },
      // 坑：中间挖一段空
      { k: 'gap', w: (d) => 2 + d * 2.5 },
      // 台阶：往上或往下
      { k: 'step', w: (d) => 3 + d * 2 },
      // 双层台：上面一层，下面有路
      { k: 'double', w: (d) => 2 + d * 1.6 },
      // 断桥：几个浮空平台
      { k: 'bridge', w: (d) => 1.5 + d * 1.8 },
      // 管道：需要滑铲过去
      { k: 'pipe', w: (d) => 1 + d * 1.6 },
      // 锯片走廊
      { k: 'saw', w: (d) => 1 + d * 1.7 },
      // 尖刺坑：跳过去，掉下去扎
      { k: 'spike', w: (d) => 1 + d * 1.5 },
      // 加速带
      { k: 'boost', w: () => 1.2 },
    ]

    /** 用字符串写一小段地形更直观：'#'=砖 '.'=空 '^'=尖刺 'o'=光尘 'S'=锯 'B'=加速带 */
    const PATTERNS = {
      flat: [
        '................',
        '................',
        '................',
        '................',
        'oooo............',
        '################',
        '################',
      ],
      flatCoins: [
        '................',
        '................',
        '....oo..........',
        '...o..o.........',
        '..o....o........',
        '################',
        '################',
      ],
      gap: [
        '................',
        '................',
        '.......oo.......',
        '................',
        '................',
        '######....######',
        '######....######',
      ],
      gapWide: [
        '................',
        '................',
        '....o......o....',
        '................',
        '................',
        '#####.....#####',
        '#####.....#####',
      ],
      stepUp: [
        '................',
        '..........oooo..',
        '.......####.....',
        '...####.........',
        '####............',
        '################',
        '################',
      ],
      stepDown: [
        '................',
        '....oooo........',
        '.....####.......',
        '........####....',
        '............####',
        '################',
        '################',
      ],
      double: [
        '................',
        '.....oooooo.....',
        '...##########...',
        '................',
        '..oo............',
        '################',
        '################',
      ],
      bridge: [
        '................',
        '..........oo....',
        '....##..##......',
        '..##..##........',
        '.##..##.........',
        '................',
        '................',
      ],
      pipe: [
        '................',
        '................',
        '................',
        '####........####',
        '####........####',
        '####........####',
        '################',
      ],
      saw: [
        '................',
        '.......SS.......',
        '................',
        '....oo..........',
        '................',
        '################',
        '################',
      ],
      spike: [
        '................',
        '................',
        '......oooo......',
        '................',
        '....^^^^^^^^....',
        '################',
        '################',
      ],
      boost: [
        '................',
        '................',
        '......oo........',
        '................',
        '.....BBBB.......',
        '################',
        '################',
      ],
    }

    function buildSeg(kind, diff) {
      let name = kind
      if (kind === 'flat') name = Math.random() < 0.45 ? 'flatCoins' : 'flat'
      if (kind === 'gap') name = diff >= 4 ? 'gapWide' : 'gap'
      if (kind === 'step') name = Math.random() < 0.5 ? 'stepUp' : 'stepDown'
      if (kind === 'double') name = 'double'
      if (kind === 'bridge') name = 'bridge'
      if (kind === 'pipe') name = 'pipe'
      if (kind === 'saw') name = 'saw'
      if (kind === 'spike') name = 'spike'
      if (kind === 'boost') name = 'boost'
      const rows = PATTERNS[name] || PATTERNS.flat
      return { kind: name, rows: rows }
    }

    /** 按难度权重抽一个段类型 */
    function pickKind(diff) {
      const total = SEG_KINDS.reduce((s, x) => s + x.w(diff), 0)
      let r = Math.random() * total
      for (const x of SEG_KINDS) {
        r -= x.w(diff)
        if (r <= 0) return x.k
      }
      return 'flat'
    }

    /* ================= 小工具 =================
       地面纹理用：同一个坐标永远得到同一个值，这样纹理不会随帧闪。 */
    function hash2(x, y, seed) {
      let h = x * 374761393 + y * 668265263 + (seed || 0) * 2147483647
      h = (h ^ (h >> 13)) * 1274126177
      h = h ^ (h >> 16)
      return ((h >>> 0) % 100000) / 100000
    }

    /* ================= 粒子 =================
       跑动时的尘土、起跳/落地的火星、吃到光尘的金星。
       纯装饰，但有没有这个，观感差很多 —— 尤其跑起来的时候。 */
    let parts = []
    function spawnDust(x, y, n2) {
      for (let i = 0; i < (n2 || 3); i++) {
        parts.push({
          x: x + Math.random() * 0.8, y: y + Math.random() * 0.3,
          vx: -0.6 - Math.random() * 1.6, vy: -0.6 - Math.random() * 1.8,
          life: 0.34 + Math.random() * 0.3, t: 0, c: 'rgba(220,210,190,',
        })
      }
      if (parts.length > 160) parts = parts.slice(-160)
    }
    function spawnSpark(x, y, c, n2) {
      for (let i = 0; i < (n2 || 5); i++) {
        const a = Math.random() * 6.28
        const sp = 1 + Math.random() * 2.6
        parts.push({
          x: x + 0.5, y: y + 0.5,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.5,
          life: 0.4 + Math.random() * 0.35, t: 0, c: c,
        })
      }
    }
    function updateParts(dt) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p2 = parts[i]
        p2.t += dt
        if (p2.t >= p2.life) { parts.splice(i, 1); continue }
        p2.x += p2.vx * dt
        p2.y += p2.vy * dt
        p2.vy += 9 * dt
        p2.vx *= 0.94
      }
    }
    function drawParts() {
      parts.forEach((p2) => {
        const k = 1 - p2.t / p2.life
        const sx = Math.round(p2.x - camX)
        if (sx < -2 || sx > W + 2) return
        ctx.fillStyle = p2.c + (k * 0.9).toFixed(2) + ')'
        ctx.fillRect(sx, Math.round(p2.y), 1, 1)
      })
    }

    /* ================= 游戏状态 ================= */
    const cv = $('rkCv')
    const ctx = cv.getContext('2d')
    const stage = $('rkStage')
    let W = 0, H = 0      // 逻辑像素尺寸
    let scale = 1         // 实际像素 / 逻辑像素
    const ROWS = 13       // 画布高度 13 格（地形只占底下 7 格，上面是天空）

    let world = []        // 世界是一列一列的，index = 格号
    let genX = 0          // 已生成到第几列
    let diff = 1

    const player = {
      x: 0, y: 0, vy: 0,
      onGround: false, jumps: 0, sliding: 0,
      hit: false, shield: 0,
    }
    let speed = 2.4        // 格/秒…实际是像素/帧，见下
    let camX = 0
    let distance = 0
    let coins = 0
    let boostLeft = 0
    let playing = false
    let raf = 0
    let lastT = 0
    let holding = false

    function worldAt(x) { return world[x] || null }
    function solidAt(x, y) {
      const c = worldAt(x)
      if (!c) return false
      return c.solid[y] === 1
    }

    /** 生成一列 */
    function pushColumn(c) { world.push(c) }

    /** 生成一段 */
    function genSegment() {
      const kind = pickKind(diff)
      const seg = buildSeg(kind, diff)
      const h = seg.rows.length
      for (let i = 0; i < SEG_W; i++) {
        const col = { solid: new Array(ROWS).fill(0), hazard: [], coin: 0, boost: 0 }
        for (let r = 0; r < ROWS; r++) {
          const srcRow = h - ROWS + r // 底部对齐
          if (srcRow < 0 || srcRow >= h) continue
          const ch = seg.rows[srcRow].charAt(i)
          if (ch === '#') col.solid[r] = 1
          else if (ch === '^') col.hazard.push({ r: r, t: 'spike' })
          else if (ch === 'S') col.hazard.push({ r: r, t: 'saw', ph: Math.random() * 6.28 })
          else if (ch === 'o') col.coin = 1
          else if (ch === 'B') col.boost = 1
        }
        pushColumn(col)
        genX++
      }
    }

    function ensureWorld(untilX) {
      while (genX < untilX) genSegment()
    }

    /** 重置一局 */
    function reset() {
      world = []
      genX = 0
      diff = 1
      camX = 0
      distance = 0
      coins = 0
      boostLeft = 0
      speed = 6.4
      // 起步给一段平地，别一上来就是坑
      for (let i = 0; i < 3; i++) {
        const seg = buildSeg('flat', 1)
        for (let x = 0; x < SEG_W; x++) {
          const col = { solid: new Array(ROWS).fill(0), hazard: [], coin: 0, boost: 0 }
          for (let r = 0; r < ROWS; r++) {
            const srcRow = seg.rows.length - ROWS + r
            if (srcRow >= 0 && seg.rows[srcRow].charAt(x) === '#') col.solid[r] = 1
          }
          pushColumn(col)
          genX++
        }
      }
      player.x = 6
      player.y = groundY() - 1
      player.vy = 0
      player.onGround = true
      player.jumps = 0
      player.sliding = 0
      player.hit = false
      player.shield = lv('shield') > 0 ? 1 : 0
      ensureWorld(120)
    }

    /** 找某列的地面高度（从下往上的第一块砖的 r） */
    function groundY(x) {
      const c = worldAt(x)
      if (!c) return ROWS
      for (let r = 0; r < ROWS; r++) if (c.solid[r]) return r
      return ROWS
    }

    /* ================= 尺寸 ================= */
    function resize() {
      const w = stage.clientWidth || 430
      /* 每格占的屏幕像素从 1.6 个逻辑像素降到 1.45 —— 格子大了，画布也就高了。
         之前画布只有 175px 高，手机上看着像一条缝。 */
      const hCols = Math.round(w / (TILE * 1.45))
      W = Math.max(20, hCols)
      H = ROWS
      scale = Math.max(1, Math.floor(w / W))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = W * scale * dpr
      cv.height = H * scale * dpr
      cv.style.width = w + 'px'
      cv.style.height = H * scale + 'px'
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
      draw()
    }

    /* ================= 绘制 ================= */
    let bgStars = []
    for (let i = 0; i < 70; i++) bgStars.push({ x: Math.random() * 400, y: Math.random() * 3, s: Math.random() < 0.2 ? 2 : 1 })
    let hills = []
    for (let i = 0; i < 24; i++) hills.push({ x: i * 22, h: 10 + Math.random() * 14, w: 18 + Math.random() * 14 })

    function draw() {
      if (!W) return
      // 天空：上深下浅
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, PAL.sky1)
      g.addColorStop(0.42, PAL.sky2)
      g.addColorStop(0.74, PAL.sky3)
      g.addColorStop(1, PAL.sky4)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // 星星：随镜头缓慢移动
      ctx.fillStyle = 'rgba(220,235,255,.75)'
      bgStars.forEach((s) => {
        const x = (s.x - camX * 0.15) % (W + 400)
        const xx = x < 0 ? x + W + 400 : x
        if (xx < W) ctx.fillRect(Math.floor(xx), s.y, s.s, s.s)
      })

      /* 远景城市剪影：像素小镇的天际线，随镜头缓慢移动。
         比纯山好看，也更贴「像素小镇」这个主题。 */
      const skyOff = -camX * 0.12
      const skyH = 5
      for (let i = 0; i < 40; i++) {
        const bw = 3 + ((i * 7) % 5)
        const bh = skyH + ((i * 13) % 7)
        const bx = Math.round((i * 11 + skyOff) % (W + 120))
        const x2 = bx < -60 ? bx + W + 120 : bx
        if (x2 > W + 20) continue
        ctx.fillStyle = '#151d33'
        ctx.fillRect(x2, H - 2 - bh, bw, bh)
        // 窗户：几颗亮点
        ctx.fillStyle = 'rgba(255,220,150,.5)'
        for (let wy = 1; wy < bh - 1; wy += 2) {
          for (let wx = 0; wx < bw - 1; wx += 2) {
            if (((i * 31 + wy * 7 + wx * 13 + Math.floor(camX / 8)) % 5) < 2) {
              ctx.fillRect(x2 + wx, H - 2 - bh + wy, 1, 1)
            }
          }
        }
      }

      // 远山：三层视差
      for (let layer = 0; layer < 3; layer++) {
        ctx.fillStyle = layer === 0 ? PAL.mount : layer === 1 ? PAL.mount2 : PAL.mount3
        const par = layer === 0 ? 0.18 : layer === 1 ? 0.32 : 0.48
        const base = H - 2.4 - layer * 0.6
        hills.forEach((hh, i) => {
          const x = hh.x + i * 0 - camX * par
          const xx = ((x % (W + 500)) + W + 500) % (W + 500)
          if (xx > W + 40) return
          const h = hh.h * (layer === 0 ? 1.1 : layer === 1 ? 0.78 : 0.5)
          ctx.beginPath()
          ctx.moveTo(Math.floor(xx), Math.floor(base))
          ctx.lineTo(Math.floor(xx + hh.w / 2), Math.floor(base - h))
          ctx.lineTo(Math.floor(xx + hh.w), Math.floor(base))
          ctx.closePath()
          ctx.fill()
        })
      }

      // 地形
      const startCol = Math.max(0, Math.floor(camX) - 1)
      const endCol = Math.floor(camX) + W + 2
      for (let x = startCol; x < endCol; x++) {
        const c = worldAt(x)
        if (!c) continue
        const sx = Math.round(x - camX)
        if (sx < -1 || sx > W) continue
        for (let r = 0; r < ROWS; r++) {
          if (!c.solid[r]) continue
          const sy = r
          const top = r === 0 || !c.solid[r - 1]
          if (top) {
            /* 最上面一格是草皮：底色 + 顶上一道亮线 + 往下垂几根草 */
            ctx.fillStyle = PAL.grass
            ctx.fillRect(sx, sy, 1, 1)
            ctx.fillStyle = PAL.grassTop
            ctx.fillRect(sx, sy, 1, 0.26)
            ctx.fillStyle = PAL.grassDark
            ctx.fillRect(sx, sy + 0.62, 1, 0.38)
            // 草尖：按坐标决定垂几根，稳定不闪
            const g1 = hash2(x, 0, 77)
            if (g1 < 0.45) {
              ctx.fillStyle = PAL.grassTop
              ctx.fillRect(sx + Math.floor(g1 * 80) / 100, sy - 0.22, 0.14, 0.24)
            }
            if (g1 > 0.72) {
              ctx.fillStyle = PAL.grass
              ctx.fillRect(sx + 0.6, sy - 0.16, 0.12, 0.18)
            }
          } else {
            /* 下面是泥土：分两层色 + 石粒点缀 */
            const deep = r - (top ? 0 : 1)
            ctx.fillStyle = deep <= 1 ? PAL.dirt : deep <= 3 ? PAL.dirt2 : PAL.dirt3
            ctx.fillRect(sx, sy, 1, 1)
            const h2 = hash2(x, r, 991)
            if (h2 < 0.1) {
              ctx.fillStyle = PAL.stone
              ctx.fillRect(sx + 0.3, sy + 0.35, 0.4, 0.34)
            } else if (h2 < 0.2) {
              ctx.fillStyle = PAL.edge
              ctx.fillRect(sx + 0.55, sy + 0.2, 0.28, 0.24)
            } else if (h2 > 0.9) {
              ctx.fillStyle = PAL.dirt3
              ctx.fillRect(sx + 0.15, sy + 0.5, 0.5, 0.4)
            }
          }
        }
        // 光尘
        if (c.coin) {
          const bob = Math.sin((Date.now() / 260) + x) * 0.22
          ctx.fillStyle = PAL.coin2
          ctx.fillRect(sx, Math.round(2 + bob), 1, 1)
          ctx.fillStyle = PAL.coin
          ctx.fillRect(sx, Math.round(2 + bob), 1, 1)
        }
        // 加速带
        if (c.boost) {
          ctx.fillStyle = PAL.boost
          ctx.fillRect(sx, ROWS - 3, 1, 1)
        }
        // 危险物
        c.hazard.forEach((hz) => {
          if (hz.t === 'spike') {
            ctx.fillStyle = PAL.spike
            ctx.fillRect(sx, hz.r, 1, 1)
            ctx.fillStyle = '#8f2f28'
            ctx.fillRect(sx, hz.r + 1, 1, 1)
          } else if (hz.t === 'saw') {
            const cy = hz.r + Math.sin(Date.now() / 200 + hz.ph) * 0.6
            ctx.fillStyle = PAL.saw2
            ctx.fillRect(sx, Math.round(cy), 1, 1)
            ctx.fillStyle = PAL.saw
            ctx.fillRect(sx, Math.round(cy), 1, 1)
            ctx.fillStyle = '#5a6070'
            ctx.fillRect(sx + 0.34, Math.round(cy) + 0.34, 0.32, 0.32)
          }
        })
      }

      // 粒子（在地形之上、玩家之下）
      drawParts()

      // 加速特效：屏幕边缘泛绿 + 速度线
      if (boostLeft > 0) {
        ctx.fillStyle = 'rgba(94,224,160,.12)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = 'rgba(180,255,220,.5)'
        for (let i = 0; i < 7; i++) {
          const y = (i * 7 + Math.floor(Date.now() / 30) % 7) % H
          const x = (Date.now() / 2 + i * 40) % (W + 30) - 15
          ctx.fillRect(Math.floor(W - x), y, 9, 1)
        }
      }

      /* 玩家。原来就是一个黄方块加一个黑点，是画面里最显眼也最难看的地方。
         现在按「头 / 身体 / 两条腿 / 两条胳膊」分开画，
         腿和胳膊的摆动跟着跑步相位走，跑起来有跑的样子。
         滑铲时整体压扁、头往前伸。 */
      const px = player.x - camX
      const sliding = player.sliding > 0
      const py = player.y
      const hurt = player.hit
      // 跑步相位：跑得越快摆得越快
      const phase = Math.sin(distance * 3.2)
      const armSw = phase * 0.5

      const headY = sliding ? py + 0.42 : py + 0.02
      const bodyY = headY + 0.38
      const bodyH = sliding ? 0.22 : 0.34
      const legY = bodyY + bodyH

      // 影子
      ctx.fillStyle = 'rgba(0,0,0,.22)'
      ctx.fillRect(px + 0.14, py + 0.94, 0.72, 0.12)

      // 腿（两条，前后错开）
      if (!sliding) {
        ctx.fillStyle = PAL.playerD
        ctx.fillRect(px + 0.24 + armSw * 0.18, legY, 0.2, 0.28)
        ctx.fillRect(px + 0.56 - armSw * 0.18, legY, 0.2, 0.28)
      }
      // 身体（红上衣）
      ctx.fillStyle = hurt ? '#fff' : PAL.playerShirt
      ctx.fillRect(px + 0.2, bodyY, 0.6, bodyH)
      // 胳膊
      ctx.fillStyle = PAL.playerSkin
      if (!sliding) {
        ctx.fillRect(px + 0.06, bodyY + 0.04 + armSw * 0.12, 0.16, 0.22)
        ctx.fillRect(px + 0.78, bodyY + 0.04 - armSw * 0.12, 0.16, 0.22)
      } else {
        ctx.fillRect(px + 0.02, bodyY + 0.02, 0.2, 0.14)
      }
      // 头
      ctx.fillStyle = PAL.playerSkin
      ctx.fillRect(px + 0.26, headY, 0.48, 0.36)
      // 头发
      ctx.fillStyle = PAL.playerHair
      ctx.fillRect(px + 0.26, headY, 0.48, 0.12)
      ctx.fillRect(px + 0.2, headY + 0.02, 0.1, 0.2)
      // 眼睛
      ctx.fillStyle = PAL.playerD
      const eyeX = sliding ? 0.56 : 0.44
      ctx.fillRect(px + eyeX, headY + 0.16, 0.1, 0.1)
      ctx.fillRect(px + eyeX + 0.18, headY + 0.16, 0.1, 0.1)
      // 护盾光圈
      if (player.shield > 0) {
        ctx.strokeStyle = 'rgba(120,200,255,.85)'
        ctx.lineWidth = 0.1
        ctx.beginPath()
        ctx.arc(px + 0.5, py + 0.5, 0.78, 0, 6.284)
        ctx.stroke()
      }

      // 地面阴影线（让贴地感更强）
      ctx.fillStyle = 'rgba(0,0,0,.18)'
      const gy = groundY(Math.floor(player.x))
      if (gy < ROWS) ctx.fillRect(px, gy, 1, 0.14)
    }

    /* ================= 逻辑 ================= */
    /* ---------- 手感参数 ----------
       跑酷好不好玩基本就看这几个数。都调过：
         GRAV/JUMP_V   跳跃高度约 1.8 格、滞空约 0.66 秒 —— 够跨过两格坑
         COYOTE        离开地面后 0.12 秒内还能起跳（「土狼时间」）。
                       没有这个，差一帧没按到就直接摔死，非常劝退。
         BUFFER        落地前 0.14 秒按的跳，落地瞬间自动生效。
                       没有这个，连按也常常按不出来。 */
    /* ★ 这两个数是跑酷的核心，之前配错了：
         旧值 GRAV=30 / JUMP_V=10.6
         → 跳高 = V²/(2g) = 1.87 格，滞空 0.71 秒，水平只能跨 3.67 格
         可地形里的台阶有 3 格高、坑有 8~10 格宽 ——
         **怎么按都过不去**。用户说的「不能跳很高」就是这个：
         不是手感问题，是数值和地形根本对不上。
         新值跳高 4.5 格、滞空 1.06 秒、水平约 6.5 格，
         同时把坑修窄（见下面的地形图案），两边一起对上。 */
    const GRAV = 32
    const JUMP_V = 17
    const COYOTE = 0.12
    const BUFFER = 0.14

    let coyoteLeft = 0
    let bufferLeft = 0

    function jump() {
      if (!playing) return
      // 还没落地？先记下来，落地那一刻自动跳
      if (!player.onGround && coyoteLeft <= 0) {
        const maxJumps = 1 + (lv('air') > 0 ? 1 : 0)
        if (player.jumps < maxJumps) {
          // 二段跳：立刻生效
          doJump()
          return
        }
        bufferLeft = BUFFER
        return
      }
      const maxJumps = 1 + (lv('air') > 0 ? 1 : 0)
      if (player.jumps >= maxJumps) return
      doJump()
    }

    function doJump() {
      player.vy = -JUMP_V * (1 + lv('jump') * 0.08)
      player.jumps++
      player.onGround = false
      player.sliding = 0
      coyoteLeft = 0
      bufferLeft = 0
      spawnDust(player.x, player.y + 1, 6)
      try { window.sfx && window.sfx('tap') } catch (e) {}
    }

    function slide() {
      if (!playing) return
      // 空中也能滑（会变成快速下坠），不然「跳起来发现前面有管道」就没办法了
      if (!player.onGround) player.vy = Math.max(player.vy, 9)
      player.sliding = 0.5 + lv('slide') * 0.1
      try { window.sfx && window.sfx('swish') } catch (e) {}
    }

    function die() {
      if (player.shield > 0) {
        player.shield = 0
        player.hit = true
        player.vy = -6
        pop('护盾挡下了一次！')
        try { window.sfx && window.sfx('ok') } catch (e) {}
        return
      }
      playing = false
      cancelAnimationFrame(raf)
      run.runs++
      const dist = Math.floor(distance)
      const isBest = dist > run.best
      if (isBest) run.best = dist
      run.coins += coins
      saveRun()
      try { window.sfx && window.sfx('fail') } catch (e) {}
      $('rkOver').hidden = false
      $('rkOver').innerHTML =
        '<b>' + (isBest ? '新纪录！' : '摔了') + '</b>' +
        '<p>跑了 <b>' + dist + '</b> 米，捡了 <b>' + coins + '</b> 个光尘。<br>' +
        '最远纪录 ' + run.best + ' 米。<br>' +
        '<span style="color:#8fa6cc;font-size:11.5px">光尘可以用来买永久加成</span></p>' +
        '<button class="rk-go" id="rkGo2" type="button">再跑一次</button>'
      $('rkGo2').onclick = start
      refreshBest()
    }

    function pop(txt) {
      const p = $('rkPop')
      p.textContent = txt
      p.classList.remove('show')
      void p.offsetWidth
      p.classList.add('show')
    }

    function refreshBest() {
      $('rkBest').innerHTML = '最远<b>' + run.best + '</b>米 · 光尘 ' + run.coins
    }

    function step(dt) {
      // 速度：基础 + 距离加成 + 加速带
      const base = 6.4 + Math.min(5.5, distance / 460)
      const target = base + (boostLeft > 0 ? 4.2 : 0)
      speed += (target - speed) * Math.min(1, dt * 3)
      if (boostLeft > 0) boostLeft -= dt

      const vx = speed
      player.x += vx * dt
      distance += vx * dt
      diff = 1 + Math.floor(distance / 300)

      // 重力和落地
      player.vy += GRAV * dt
      player.y += player.vy * dt

      const col = Math.floor(player.x)
      const gy = groundY(col)
      const feet = player.y + 1
      if (feet >= gy) {
        // 落地
        const wasAir = !player.onGround
        player.y = gy - 1
        player.vy = 0
        player.onGround = true
        player.jumps = 0
        coyoteLeft = COYOTE
        if (wasAir) spawnDust(player.x, player.y + 1, 4)
        // 落地前按过的跳，这时候补上
        if (bufferLeft > 0) {
          bufferLeft = 0
          doJump()
        }
      } else {
        player.onGround = false
        if (coyoteLeft > 0) coyoteLeft -= dt
      }
      if (bufferLeft > 0) bufferLeft -= dt

      // 滑铲计时
      if (player.sliding > 0) player.sliding -= dt
      // 跑酷的碰撞盒：滑铲时矮一半，正好能钻过管道
      const boxTop = player.sliding > 0 ? player.y + 0.34 : player.y
      const boxBot = player.y + 1

      // 掉落出界
      if (player.y > ROWS + 2) return die()

      // 危险物碰撞
      const c = worldAt(col)
      if (c) {
        for (const hz of c.hazard) {
          const hy = hz.t === 'saw' ? hz.r + Math.sin(Date.now() / 200 + hz.ph) * 0.6 : hz.r
          if (boxBot > hy + 0.15 && boxTop < hy + 0.85) return die()
        }
        // 撞墙：前方有砖而自己在里面
        if (c.solid[Math.floor(boxTop)] && player.sliding <= 0) {
          // 允许站上去，但不允许穿过去
          const ahead = worldAt(Math.floor(player.x + 0.9))
          if (ahead && ahead.solid[Math.floor(boxTop)]) return die()
        }
        // 光尘：磁铁加大吸取范围
        const rng = 1 + lv('magnet')
        for (let dx = -rng; dx <= rng; dx++) {
          const cc = worldAt(col + dx)
          if (cc && cc.coin) {
            cc.coin = 0
            coins++
            spawnSpark(col + dx, 2, 'rgba(255,220,120,', 4)
            try { window.sfx && window.sfx('coin') } catch (e) {}
          }
        }
        if (c.boost) boostLeft = 1.6
      }

      // 镜头跟上（玩家固定在左侧 1/4 处）
      const wantCam = player.x - W * 0.26
      camX += (wantCam - camX) * Math.min(1, dt * 12)
      if (camX < 0) camX = 0

      ensureWorld(Math.floor(camX) + W + 60)
      $('rkScore').innerHTML = Math.floor(distance) + '<small>米</small>'
      player.hit = false
    }

    let acc = 0
    function loop(t) {
      if (!playing) return
      if (!lastT) lastT = t
      let dt = Math.min(0.05, (t - lastT) / 1000)
      lastT = t
      acc += dt
      // 固定步长，避免不同刷新率下手感不一致
      const FIXED = 1 / 120
      let guard = 0
      while (acc >= FIXED && guard++ < 20) {
        step(FIXED)
        acc -= FIXED
      }
      updateParts(dt)
      // 跑动时不停扬尘
      if (playing && player.onGround && Math.random() < dt * 22) {
        spawnDust(player.x, player.y + 1, 1)
      }
      draw()
      raf = requestAnimationFrame(loop)
    }

    function start() {
      reset()
      playing = true
      lastT = 0
      $('rkOver').hidden = true
      refreshBest()
      raf = requestAnimationFrame(loop)
      try { window.sfx && window.sfx('nav') } catch (e) {}
    }

    /* ================= 输入 ================= */
    // 键盘
    function onKey(e, down) {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault()
        if (!playing) { start(); return }
        if (down) {
          if (!holding) jump()
          else if (player.onGround) jump()
          holding = true
          // 按住跳更高：在空中持续给一点向上的力
          if (player.vy < 0) player.vy -= 2.4
        } else {
          holding = false
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault()
        if (down) slide()
      }
    }
    const kd = (e) => onKey(e, true)
    const ku = (e) => onKey(e, false)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)

    /* 触摸 / 鼠标。
       ★ 原来是把屏幕切成上下两块：上半屏跳、下半屏滑铲。
       这个分法很难用 —— 想跳的时候稍微点低了就变成滑铲，直接摔死。
       现在改成：**在哪儿点都是跳**，**往下滑才是滑铲**。
       跳是最常用的动作，不该有「点错位置」这回事。 */
    let downY = 0, downX = 0, downT = 0, slidThisTouch = false
    function pointerDown(e) {
      if (!playing) { start(); return }
      const p2 = e.touches ? e.touches[0] : e
      downY = p2.clientY
      downX = p2.clientX
      downT = Date.now()
      slidThisTouch = false
      jump()
    }
    function pointerMove(e) {
      if (!e.touches || !e.touches[0] || slidThisTouch) return
      const dy = e.touches[0].clientY - downY
      const dx = Math.abs(e.touches[0].clientX - downX)
      // 往下滑超过 18px、而且不是横着划 —— 判定为滑铲
      if (dy > 18 && dy > dx) { slide(); slidThisTouch = true }
    }
    const md = (e) => { if (!e.target.closest('button')) pointerDown(e) }
    stage.addEventListener('touchstart', md, { passive: true })
    stage.addEventListener('touchmove', pointerMove, { passive: true })
    stage.addEventListener('mousedown', md)

    /* 点击覆盖层上的「开始跑」也算 */
    $('rkGo').onclick = start

    /* 永久加成面板。
       ★ 原来这里是 lwAlert(...) —— 但 lwAlert 的正文是用 textContent 写的，
       塞 HTML 进去只会把源码原样显示出来，**按钮一个都不会渲染**。
       表现就是「点永久加成，弹出来一堆 <div style=...> 的字」。
       改用 lwPanel（正文走 innerHTML，专门给可信的 HTML 用）。 */
    $('rkShop').onclick = () => {
      function rowsHtml() {
        return UPGRADES.map((u) => {
          const l = lv(u.k)
          const maxed = l >= u.max
          const cost = u.cost * (l + 1)
          const afford = run.coins >= cost
          return (
            '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px dashed rgba(150,120,80,.35)">' +
            '<div style="flex:1;min-width:0">' +
              '<b style="font-size:14px">' + esc(u.n) + '</b> ' +
              '<span style="font-size:11px;opacity:.7">Lv.' + l + '/' + u.max + '</span>' +
              '<div style="font-size:11.5px;opacity:.75;line-height:1.6">' + esc(u.d) + '</div>' +
            '</div>' +
            '<button data-up="' + u.k + '"' + (maxed ? ' disabled' : '') +
            ' style="flex:none;padding:9px 14px;border:1px solid ' + (maxed ? '#c9c2b4' : afford ? '#c9a06a' : '#d8cfc0') +
            ';border-radius:10px;background:' + (maxed ? '#efe9dd' : afford ? 'linear-gradient(180deg,#fff2dc,#f2dcb8)' : '#f4efe6') +
            ';color:' + (maxed ? '#9a9082' : afford ? '#5a3a1a' : '#a89c8a') +
            ';font-family:inherit;font-size:12.5px;font-weight:800;cursor:' + (maxed ? 'default' : 'pointer') + '">' +
            (maxed ? '已满级' : cost + ' 光尘') + '</button></div>'
          )
        }).join('')
      }
      function head() {
        return '<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px">' +
          '<b style="font-size:15px">🎽 永久加成</b>' +
          '<span style="margin-left:auto;font-size:12.5px">持有 <b style="color:#c98a4f">' + run.coins + '</b> 光尘</span></div>' +
          '<div style="font-size:11.5px;opacity:.7;line-height:1.7;margin-bottom:6px">' +
          '跑出来的光尘在这里买加成，买了**下一局起跑就生效**，一直有效。</div>'
      }
      const closeBtn = '<button data-close style="width:100%;margin-top:12px;padding:11px;border:1px solid #d3bb93;' +
        'border-radius:12px;background:#fff6e4;color:#4a3a20;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer">关闭</button>'
      lwPanel(head() + '<div id="rkUpList">' + rowsHtml() + '</div>' + closeBtn).then(() => {})
      const mount = () => {
        const list = $('rkUpList')
        if (!list) return false
        list.querySelectorAll('[data-up]').forEach((b) => {
          b.onclick = () => {
            const u = UPGRADES.find((x) => x.k === b.getAttribute('data-up'))
            if (!u) return
            const l = lv(u.k)
            if (l >= u.max) return
            const cost = u.cost * (l + 1)
            if (run.coins < cost) { pop('光尘不够'); try { window.sfx && window.sfx('fail') } catch (e) {} return }
            run.coins -= cost
            run.up[u.k] = l + 1
            saveRun()
            refreshBest()
            try { window.sfx && window.sfx('buy') } catch (e) {}
            pop('买下了 ' + u.n + ' Lv.' + (l + 1))
            // 重画整块面板，价格和等级跟着更新
            const box = list.parentNode
            if (box) {
              box.innerHTML = head() + '<div id="rkUpList">' + rowsHtml() + '</div>' + closeBtn
              setTimeout(mount, 0)
            }
          }
        })
        return true
      }
      // 浮层是同步插进 DOM 的，这里直接挂；万一没插上就重试几次
      if (!mount()) {
        let tries = 0
        const t = setInterval(() => {
          if (mount() || ++tries > 20) clearInterval(t)
        }, 30)
      }
    }

    $('rkBoard').onclick = () => {
      // 同上：这里也塞了 HTML，lwAlert 显示不出来，改 lwPanel
      lwPanel(
        '<b style="font-size:15px">📊 我的成绩</b>' +
        '<div style="margin-top:10px;line-height:2.1;font-size:13.5px">' +
        '最远跑了 <b>' + run.best + '</b> 米<br>' +
        '一共跑过 <b>' + run.runs + '</b> 局<br>' +
        '手上还有 <b>' + run.coins + '</b> 光尘' +
        '</div>' +
        '<button data-close style="width:100%;margin-top:14px;padding:11px;border:1px solid #d3bb93;' +
        'border-radius:12px;background:#fff6e4;color:#4a3a20;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer">知道了</button>'
      ).then(() => {})
    }

    /* ================= 启动 ================= */
    resize()
    reset()
    refreshBest()
    window.addEventListener('resize', resize)

    /* 离开时停掉循环，别在别的页面里空转 */
    window.addEventListener('lw-leave', () => {
      playing = false
      cancelAnimationFrame(raf)
    })
    // withAutoCleanup 会接管 window 上的监听，这里再兜一层
    const stop = () => { playing = false; cancelAnimationFrame(raf) }
    window.addEventListener('pagehide', stop)
  },
}
