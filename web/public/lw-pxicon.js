// 自绘像素图标
//
// 为什么不用 emoji：emoji 是各平台自己渲染的，同一个表情在
// 苹果 / 安卓 / Windows 上长得完全不一样，大小、留白、颜色都不可控，
// 而且**动不了**。这个站本来就是像素画站，图标用像素画最合身。
//
// 每个图标就是一个字符网格 + 一张调色板，和站内家具、头像同一套写法。
// 动起来靠「多帧循环」—— 和帧动画一个路子，不做 CSS 变换，
// 这样在任何地方（canvas / 按钮 / 列表）表现都一致。
//
// 用法：
//   LWIcon.make('brush', 20)            画一张静态的
//   LWIcon.make('brush', 20, {animate:true})   自动播放
//   LWIcon.apply(root)                  把 <i data-px="brush"></i> 全部替换成图标
//   LWIcon.setLevel('off'|'low'|'std'|'rich')

;(function () {
  if (window.LWIcon) return

  var LEVEL_KEY = 'lw-anim-level'
  var LEVELS = ['off', 'low', 'std', 'rich']

  function readLevel() {
    try {
      var v = localStorage.getItem(LEVEL_KEY)
      return LEVELS.indexOf(v) >= 0 ? v : 'std'
    } catch (e) {
      return 'std'
    }
  }
  var level = readLevel()

  /* 把档位写到 <html data-anim-level="..."> 上。
     这样 CSS 也能跟着它开关动画，不用每一层各写一遍 JS 判断。
     off  = 全关（含过渡）
     low  = 只关「无限循环」和装饰性动画，保留必要的入场
     std  = 默认
     rich = 默认 + 图标加快、循环动画多跑一点 */
  function applyLevelAttr(lv) {
    try {
      document.documentElement.setAttribute('data-anim-level', lv)
    } catch (e) {}
  }
  applyLevelAttr(level)

  /* 动画档位决定图标动不动、动多快 */
  function iconAnimates() {
    if (level === 'off' || level === 'low') return false
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    } catch (e) {}
    return true
  }
  function speed() {
    return level === 'rich' ? 0.75 : 1
  }

  /* ================= 调色板 =================
     一份通用色板，所有图标共用。字符 → 颜色。 */
  var C = {
    k: '#3b342c', // 描边深色
    d: '#6b5f50', // 次深
    g: '#8c7f6b', // 灰
    l: '#b0a697', // 浅灰
    w: '#ffffff',
    W: '#f6f2ea', // 米白
    r: '#e5574b', // 红
    R: '#b7413a', // 深红
    o: '#f0a04b', // 橙
    y: '#f2d04b', // 黄
    Y: '#d1944d', // 金
    G: '#f7e9a0', // 淡金
    e: '#4caf7d', // 绿
    E: '#2f7d54', // 深绿
    c: '#7fd6a8', // 浅绿
    b: '#5b8def', // 蓝
    B: '#2f5fb8', // 深蓝
    s: '#96b9ff', // 浅蓝
    p: '#9b6dd6', // 紫
    P: '#6f45a8', // 深紫
    n: '#e8a0d0', // 粉
    t: '#8d6e4f', // 木色
    T: '#5d4630', // 深木
  }

  /* ================= 图标定义 =================
     每项是「一帧或多帧」，帧是字符数组。
     字符含义见上面的 C。'.' 是透明。 */

  var ICONS = {
    /* 画笔：笔尖上下点动 */
    brush: {
      base: [
        '..........kk',
        '.........kok',
        '........koyk',
        '.......koyk.',
        '......koyk..',
        '.....koyk...',
        '....kokk....',
        '...kdk......',
        '..kdk.......',
        '.kdk........',
        'kdk.........',
        'kk..........',
      ],
      frames: [
        // 第 1 帧比 base 高 1 像素
        [
          '..........kk',
          '.........kok',
          '........koyk',
          '.......koyk.',
          '......koyk..',
          '.....koyk...',
          '....kokk....',
          '...kdk......',
          '..kdk.......',
          '.kdk........',
          'kdk.........',
          'kk..........',
        ],
        [
          '..........kk',
          '.........kok',
          '........koyk',
          '.......koyk.',
          '......koyk..',
          '.....koyk...',
          '....kokk....',
          '...kdk......',
          '..kdk.......',
          '.kdk........',
          'kdk.........',
          '............',
        ],
      ],
    },

    /* 光尘：一颗星，会呼吸（大小交替） */
    dust: {
      frames: [
        [
          '.....y......',
          '....yYy.....',
          '...yYGYy....',
          '..yYGGGYy...',
          'yYGGWGGGYy..',
          '..yYGGGYy...',
          '...yYGYy....',
          '....yYy.....',
          '.....y......',
          '............',
        ],
        [
          '............',
          '.....y......',
          '....yYy.....',
          '...yYGYy....',
          '..yYGGGYy...',
          '...yYGYy....',
          '....yYy.....',
          '.....y......',
          '............',
          '............',
        ],
      ],
    },

    /* 小屋：烟囱冒烟 */
    house: {
      frames: [
        [
          '.......gg...',
          '......g.g...',
          '.....rrrr...',
          '....rrrrrr..',
          '...rrrrrrrr.',
          '..rrrrrrrrrr',
          '.ttttttttttt',
          '.tt.kkkkk.tt',
          '.tt.kWWWk.tt',
          '.tt.kWkWk.tt',
          '.tt.kWWWk.tt',
          '.tttkkkkkttt',
          '.ttttttttttt',
        ],
        [
          '.....gg.....',
          '......g.....',
          '.....rrrr...',
          '....rrrrrr..',
          '...rrrrrrrr.',
          '..rrrrrrrrrr',
          '.ttttttttttt',
          '.tt.kkkkk.tt',
          '.tt.kWWWk.tt',
          '.tt.kWkWk.tt',
          '.tt.kWWWk.tt',
          '.tttkkkkkttt',
          '.ttttttttttt',
        ],
      ],
    },

    /* 画板/调色盘：颜料滴落 */
    palette: {
      frames: [
        [
          '...kkkkkk...',
          '..kWWWWWWk..',
          '.kWWrWWWWWk.',
          '.kWWWWWbWWk.',
          '.kWWWWWWWWk.',
          '.kWWyWWWWWk.',
          '..kWWWWWek..',
          '...kkkkkk...',
          '............',
          '............',
        ],
        [
          '...kkkkkk...',
          '..kWWWWWWk..',
          '.kWWrWWWWWk.',
          '.kWWWWWbWWk.',
          '.kWWWWWWWWk.',
          '.kWWyWWWWWk.',
          '..kWWWWWek..',
          '...kkkkkk...',
          '.....r......',
          '............',
        ],
        [
          '...kkkkkk...',
          '..kWWWWWWk..',
          '.kWWrWWWWWk.',
          '.kWWWWWbWWk.',
          '.kWWWWWWWWk.',
          '.kWWyWWWWWk.',
          '..kWWWWWek..',
          '...kkkkkk...',
          '............',
          '.....r......',
        ],
      ],
    },

    /* 信箱：未读时小红点闪 */
    mail: {
      frames: [
        [
          '............',
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWkkWWWWkkWk',
          'kWWkkWWkkWWk',
          'kWWWkkkkWWWk',
          'kWWWWkkWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '............',
          '............',
        ],
        [
          '.........rr.',
          'kkkkkkkkkrrk',
          'kWWWWWWWWrrk',
          'kWkkWWWWkkWk',
          'kWWkkWWkkWWk',
          'kWWWkkkkWWWk',
          'kWWWWkkWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '............',
          '............',
        ],
      ],
    },

    /* 成就奖杯：光晕一圈圈 */
    trophy: {
      frames: [
        [
          '..YYYYYYYY..',
          '..YGGGGGGY..',
          '..YGGGGGGY..',
          '..YGGGGGGY..',
          '...YGGGGY...',
          '....YGGY....',
          '.....YY.....',
          '.....YY.....',
          '....YYYY....',
          '..YYYYYYYY..',
          '............',
        ],
        [
          '.yYYYYYYYYy.',
          '.yYGGGGGGYy.',
          '.yYGGGGGGYy.',
          '..YGGGGGGY..',
          '...YGGGGY...',
          '....YGGY....',
          '.....YY.....',
          '.....YY.....',
          '....YYYY....',
          '..YYYYYYYY..',
          '............',
        ],
      ],
    },

    /* 聊天：三条杠依次点亮 */
    chat: {
      frames: [
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWbbWWWWWWk',
          'kWbbbbWWWWWk',
          'kWWbbWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '.....kk.....',
          '....kk......',
        ],
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWbbWWWWWWk',
          'kWbbbbWWWWWk',
          'kWWbbWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '.....kk.....',
          '....kk......',
        ],
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWbbWWWWWWk',
          'kWbbbbWWWWWk',
          'kWWbbWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '.....kk.....',
          '....kk......',
        ],
      ],
    },

    /* 齿轮：转动（用三个相位近似） */
    gear: {
      frames: [
        [
          '....k..k....',
          '...kgkkgk...',
          '..kgggggggk.',
          '.kgggkkkggk.',
          'kgggkWWWkggk',
          'kggkkWWWkkk.',
          'kggkkWWWkkk.',
          'kgggkWWWkggk',
          '.kgggkkkggk.',
          '..kgggggggk.',
          '...kgkkgk...',
          '....k..k....',
        ],
        [
          '.....kk.....',
          '..k..ggk..k.',
          '.kgkggggkgk.',
          '.kggkkkkggk.',
          'kggkWWWkgggk',
          'kggkWWWkgggk',
          'kggkWWWkgggk',
          'kggkWWWkgggk',
          '.kggkkkkggk.',
          '.kgkggggkgk.',
          '..k..ggk..k.',
          '.....kk.....',
        ],
      ],
    },

    /* 天气晴：太阳光线伸缩 */
    sun: {
      frames: [
        [
          '.....y......',
          '............',
          '...y...y....',
          '....ooo.....',
          '...ooooo....',
          '..ooyoooo...',
          '...ooooo....',
          '....ooo.....',
          '...y...y....',
          '............',
          '.....y......',
        ],
        [
          '............',
          '.....y......',
          '...y.o.y....',
          '....ooo.....',
          '..yooooo y..',
          '..ooyo oo...',
          '..yooooo y..',
          '....ooo.....',
          '...y.o.y....',
          '.....y......',
          '............',
        ],
      ],
    },

    /* 小镇地图：图钉落下 */
    map: {
      frames: [
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWcWcWWWWWk',
          'kWcWcWcWWWWk',
          'kWWcWcWWWWWk',
          'kWWWWWWWcWWk',
          'kWWWWWWcWcWk',
          'kWWWWWWWcWWk',
          'kWWWWWWWWWWk',
          'kWWWrWWWWWWk',
          'kkkkkkkkkkkk',
        ],
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWcWcWWWWWk',
          'kWcWcWcWWWWk',
          'kWWcWcWWWWWk',
          'kWWWWWWWcWWk',
          'kWWWWWWcWcWk',
          'kWWWWWWWcWWk',
          'kWWWrWWWWWWk',
          'kWWrWrWWWWWk',
          'kkk.rrr.kkkk',
        ],
      ],
    },

    /* 小锁：锁扣开合 */
    lock: {
      frames: [
        [
          '....gggg....',
          '...g....g...',
          '...g....g...',
          '...g....g...',
          '..YYYYYYYY..',
          '..YYYYYYYY..',
          '..YYYkkYYY..',
          '..YYYYYYYY..',
          '..YYYYYYYY..',
          '..YYYYYYYY..',
        ],
        [
          '....gggg....',
          '...g....g...',
          '...g....g...',
          '...g....g...',
          '..YYYYYYYY..',
          '..YYYYYYYY..',
          '..YYYkkYYY..',
          '..YYYYYYYY..',
          '..YYYYYYYY..',
          '..YYYYYYYY..',
        ],
      ],
    },

    /* 心：跳动 */
    heart: {
      frames: [
        [
          '..rr....rr..',
          '.rRRr..rRRr.',
          'rRRRRrrRRRRr',
          'rRRRRRRRRRRr',
          'rRRRRRRRRRRr',
          '.rRRRRRRRRr.',
          '..rRRRRRRr..',
          '...rRRRRr...',
          '....rRRr....',
          '.....rr.....',
        ],
        [
          '............',
          '..rr....rr..',
          '.rRRr..rRRr.',
          'rRRRRrrRRRRr',
          'rRRRRRRRRRRr',
          'rRRRRRRRRRRr',
          '.rRRRRRRRRr.',
          '..rRRRRRRr..',
          '...rRRRRr...',
          '....rr......',
        ],
      ],
    },

    /* 画框：画作挂在墙上，光从左扫过 */
    frame: {
      frames: [
        [
          'kkkkkkkkkkkk',
          'ktttttttttk.',
          'ktWWWWWWWtk.',
          'ktWbbbWWWtk.',
          'ktWbbbbWWtk.',
          'ktWWbbbWWtk.',
          'ktWWWWWWWtk.',
          'ktWWWWggWtk.',
          'ktttttttttk.',
          'kkkkkkkkkkkk',
        ],
        [
          'kkkkkkkkkkkk',
          'ktttttttttk.',
          'ktWWWWWWWtk.',
          'ktWWWbbbWtk.',
          'ktWWWbbbbtk.',
          'ktWWWbbbWtk.',
          'ktWWWWWWWtk.',
          'ktWWWWggWtk.',
          'ktttttttttk.',
          'kkkkkkkkkkkk',
        ],
      ],
    },

    /* 人：头像轻轻上下浮 */
    user: {
      frames: [
        [
          '...kkkkkk...',
          '..knnnnnnk..',
          '..knkkkknk..',
          '..knkWWknk..',
          '..knkkkknk..',
          '..knnkknnk..',
          '...kkkkkk...',
          '..kkkkkkkk..',
          '.kbbbbbbbbk.',
          'kbbbbbbbbbbk',
          'kbbbbbbbbbbk',
          'kkkkkkkkkkkk',
        ],
        [
          '............',
          '...kkkkkk...',
          '..knnnnnnk..',
          '..knkkkknk..',
          '..knkWWknk..',
          '..knkkkknk..',
          '..knnkknnk..',
          '...kkkkkk...',
          '..kkkkkkkk..',
          '.kbbbbbbbbk.',
          'kbbbbbbbbbbk',
          'kkkkkkkkkkkk',
        ],
      ],
    },

    /* 火：火焰晃 */
    fire: {
      frames: [
        [
          '.....o......',
          '....oyo.....',
          '...oyyRo....',
          '..oyyRRo....',
          '..oyRRRo....',
          '.oyRRRRRo...',
          '.oyRRRRRo...',
          '.oRRRRRRo...',
          '..oRRRRo....',
          '...oooo.....',
        ],
        [
          '....o.......',
          '...oyo......',
          '...oyyo.....',
          '..oyyRoo....',
          '..oyRRRo....',
          '.oyRRRRRo...',
          '.oyRRRRRo...',
          '.oRRRRRRo...',
          '..oRRRRo....',
          '...oooo.....',
        ],
      ],
    },
  }

  /* ================= 绘制 ================= */

  function drawFrame(ctx, frame, s, ox, oy) {
    for (var y = 0; y < frame.length; y++) {
      var row = frame[y]
      for (var x = 0; x < row.length; x++) {
        var ch = row.charAt(x)
        if (ch === '.' || ch === ' ') continue
        var col = C[ch]
        if (!col) continue
        ctx.fillStyle = col
        ctx.fillRect(ox + x * s, oy + y * s, s, s)
      }
    }
  }

  /* 每个 canvas 一个独立定时器，存起来好统一停掉 */
  var live = []

  function stopAll() {
    for (var i = 0; i < live.length; i++) {
      if (live[i].timer) clearInterval(live[i].timer)
      live[i].timer = 0
    }
    live.length = 0
  }

  /**
   * 生成一个像素图标。
   * @param {string} name  图标名
   * @param {number} size  显示边长（CSS 像素）
   * @param {object} opts  { animate: 是否播放, fps: 帧率 }
   * @returns {HTMLCanvasElement|null}
   */
  function make(name, size, opts) {
    var def = ICONS[name]
    if (!def) return null
    var o = opts || {}
    var frames = def.frames && def.frames.length ? def.frames : def.base ? [def.base] : null
    if (!frames || !frames.length) return null

    var grid = frames[0]
    var gw = 0
    for (var i = 0; i < grid.length; i++) gw = Math.max(gw, grid[i].length)
    var gh = grid.length

    /* ★ 尺寸分两层处理，别混在一起：
          · **背板**用整数倍放大（k 取整），保证每个像素格子均匀、不糊
          · **CSS 尺寸**用请求的真实值，保证排到界面里大小如约
       一开始两者都用整数倍，结果 12 格宽的图标请求 18px 会吸附到 24px
       （round(18/12)=2），偏大三分之一；请求 22px 也还是 24px。
       像素画里背板必须整数倍，但显示尺寸可以交给浏览器
       用 image-rendering: pixelated 做最近邻缩放 —— 这正是像素画的常规做法。 */
    var k = Math.max(2, Math.round((size || 20) / Math.max(gw, gh)))
    var bw = gw * k
    var bh = gh * k
    var dpr = Math.min(window.devicePixelRatio || 1, 3)

    /* 显示尺寸：宽度用请求值，高度按网格比例 ——
       12×9 这种非正方形图标直接给正方形尺寸会被拉变形。 */
    var want = Math.max(8, Math.round(size || 20))
    var ratio = gh / gw
    var cssW = want
    var cssH = Math.max(6, Math.round(want * ratio))

    var cv = document.createElement('canvas')
    cv.width = Math.round(bw * dpr)
    cv.height = Math.round(bh * dpr)
    cv.style.width = cssW + 'px'
    cv.style.height = cssH + 'px'
    cv.className = 'lwicon'
    cv.setAttribute('data-icon', name)
    var ctx = cv.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false

    var idx = 0
    function paint() {
      ctx.clearRect(0, 0, bw, bh)
      drawFrame(ctx, frames[idx % frames.length], k, 0, 0)
    }
    paint()

    if (o.animate !== false && frames.length > 1 && iconAnimates()) {
      var fps = (o.fps || 3) * speed()
      var rec = { timer: 0 }
      rec.timer = setInterval(function () {
        // 页面在后台就别画了，省电
        if (document.hidden) return
        // 元素被移出文档就自己停掉，不然会一直空转
        if (!cv.isConnected) {
          clearInterval(rec.timer)
          rec.timer = 0
          return
        }
        idx++
        paint()
      }, Math.round(1000 / fps))
      live.push(rec)
    }
    return cv
  }

  /* ================= 自动替换 =================
     页面上写 <i class="px-ico" data-px="dust"></i> 就会被换成图标。
     size 从 data-px-size 取，默认 20。 */
  function apply(root, opts) {
    var scope = root || document
    var nodes = scope.querySelectorAll('[data-px]:not([data-px-done])')
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i]
      var name = el.getAttribute('data-px')
      var size = Number(el.getAttribute('data-px-size')) || 20
      var cv = make(name, size, opts)
      if (!cv) continue
      el.setAttribute('data-px-done', '1')
      el.classList.add('px-ico-host')
      el.textContent = ''
      el.appendChild(cv)
    }
  }

  /* ================= 对外接口 ================= */
  window.LWIcon = {
    make: make,
    apply: apply,
    names: function () {
      var out = []
      for (var k in ICONS) if (Object.prototype.hasOwnProperty.call(ICONS, k)) out.push(k)
      return out
    },
    /** 换档位。off/low 停掉所有图标动画，rich 加快 */
    setLevel: function (lv) {
      if (LEVELS.indexOf(lv) < 0) return
      level = lv
      try {
        localStorage.setItem(LEVEL_KEY, lv)
      } catch (e) {}
      applyLevelAttr(lv)
      stopAll()
      // 通知 anim/fx 那几层也换档
      try {
        window.dispatchEvent(new CustomEvent('lw-anim-level', { detail: lv }))
      } catch (e) {}
      apply(document)
    },
    getLevel: function () { return level },
    levels: function () { return LEVELS.slice() },
    stopAll: stopAll,
    animates: iconAnimates,
  }
})()
