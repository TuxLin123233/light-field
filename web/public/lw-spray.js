// 像素喷漆引擎（与像素画完全独立的一套）
//
// 像素画是「逐格上色」，喷漆是「按住拖着喷」——两套交互、两套代码，
// 互不影响。喷漆画布是 64×64，需要发布或存头像时再降采样。
//
// 工具：画笔 / 直线 / 矩形 / 圆 / 橡皮 / 吸管，外加四向对称。
// 直线、矩形、圆按下记一个起点、拖着预览、抬手才真正落笔 ——
// 形状类工具不预览的话根本没法用（不知道会画出多长一条线）。
//
// 供两处使用：
//   画板「像素喷漆」创作模式 → 直接用 64×64 发布
//   头像编辑器「喷漆」选项   → 降采样到 16×16
window.LWSpray = (function () {
  var UNDO_MAX = 24

  /* 可选工具。头像编辑器只用到「画笔」，所以默认值必须是 brush，
     老调用方（setTool 之前就存在的那些）不受影响。 */
  var TOOLS = ['brush', 'line', 'rect', 'circle', 'eraser', 'picker']
  var TOOL_LABEL = {
    brush: '画笔',
    line: '直线',
    rect: '矩形',
    circle: '圆',
    eraser: '橡皮',
    picker: '吸管',
  }

  /**
   * create(canvas, opts) -> controller
   * opts: { size, getColor, onChange, bg }
   *   size     画布分辨率（默认 64）
   *   getColor 取当前颜色 () => [r,g,b]
   *   onChange 每次落笔后回调（用于刷新预览/统计）
   *   bg       底色，默认棋盘灰
   */
  function create(canvas, opts) {
    var o = opts || {}
    var N = o.size || 64
    var dpr = 1
    var undoStack = []
    var drawing = false
    var lastX = -1
    var lastY = -1
    var brush = o.brush || 3
    var bg = o.bg || null
    var tool = 'brush'
    /* 对称：位掩码，1=左右、2=上下、3=四角。
       原先是个布尔量（只做左右），setMirror(true) 仍映射到左右。 */
    var sym = 0
    var anchor = null
    // 底层像素缓冲：只存已画的格子，null 表示空
    var buf = new Array(N * N).fill(null)

    function ctx() {
      return canvas.getContext('2d')
    }

    function snapshot() {
      undoStack.push(buf.map(function (p) { return p ? p.slice() : null }))
      if (undoStack.length > UNDO_MAX) undoStack.shift()
    }

    function ensureBuf() {
      if (buf.length !== N * N) buf = new Array(N * N).fill(null)
    }
    ensureBuf()

    /* 背板尺寸。
       之前固定成 64 × dpr，但画布的 CSS 宽度是 100%（最大 512px），
       512 / 64 恰好整除时看着还行，一旦容器宽度不是 64 的整数倍
       （分屏、字号变化、padding 改动都会导致），
       浏览器就得把位图拉伸到 CSS 尺寸，最后一行/一列只覆盖了部分像素，
       露出来的就是一条白线 —— 也就是之前在像素画板上修过的同一个毛病。
       这里改成：背板 = 实际显示宽度 × dpr，绘制时用 canvas.width / N 缩放，
       保证每个逻辑像素都落在整数个设备像素上。 */
    var lastBacking = 0
    var ro = null
    var resizeTimer = 0
    // 显示尺寸变了要重建背板并重画，否则窗口缩放 / 旋转屏幕后
    // 位图又被拉伸，白条纹会回来
    function watchSize() {
      if (typeof ResizeObserver === 'function') {
        ro = new ResizeObserver(function () {
          if (resizeTimer) clearTimeout(resizeTimer)
          resizeTimer = setTimeout(function () {
            resizeTimer = 0
            if (syncBacking()) render()
          }, 120)
        })
        ro.observe(canvas)
      }
    }
    function syncBacking() {
      var rect = canvas.getBoundingClientRect()
      var cssW = Math.round(rect.width) || N
      var want = Math.max(N, Math.round(cssW * dpr))
      // 只在真的变了才改：改 canvas.width 会清空画布，
      // 每次落笔都重设会把正在画的笔触擦掉
      if (want !== lastBacking || canvas.width !== want) {
        canvas.width = want
        canvas.height = want
        lastBacking = want
        return true
      }
      return false
    }

    /* 画棋盘底 + 已画内容 */
    function render() {
      var c = ctx()
      if (!c) return
      dpr = window.devicePixelRatio || 1
      syncBacking()
      c.imageSmoothingEnabled = false
      var s = canvas.width / N
      c.setTransform(s, 0, 0, s, 0, 0)
      /* 盖住缝隙：每个格子往右下多画半个「设备像素」。
         以前这里写死 1.02，是按 s≈37 估的；可 s = 背板 / N 会跟着屏幕宽度变，
         窄屏上 s 可能只有 20 出头，1.02 只多出 0.4 个设备像素，
         盖不住小数缩放产生的抗锯齿缝 —— 看上去就是一条条白线。
         改成按当前 s 反算，屏幕多宽都刚好盖住半个像素。 */
      var over = 0.5 / s
      var cell = 1 + over
      // 底
      if (bg) {
        c.fillStyle = bg
        c.fillRect(0, 0, N, N)
      } else {
        for (var y = 0; y < N; y++) {
          for (var x = 0; x < N; x++) {
            c.fillStyle = (x + y) % 2 ? '#f2efe9' : '#e7e3db'
            c.fillRect(x, y, cell, cell)
          }
        }
      }
      for (var i = 0; i < buf.length; i++) {
        var p = buf[i]
        if (!p) continue
        c.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')'
        c.fillRect(i % N, Math.floor(i / N), cell, cell)
      }
    }

    /* 写一格。col 为 null 表示擦掉（橡皮工具）。 */
    function put(x, y, col) {
      if (x < 0 || y < 0 || x >= N || y >= N) return
      var i = y * N + x
      if (col) buf[i] = [col[0], col[1], col[2]]
      else buf[i] = null
    }

    /* 按当前对称设置写一格。位掩码：1 左右镜像、2 上下镜像、3 四角。 */
    function putSym(x, y, col) {
      if (x < 0 || y < 0 || x >= N || y >= N) return
      put(x, y, col)
      if (sym === 3) {
        put(N - 1 - x, y, col)
        put(x, N - 1 - y, col)
        put(N - 1 - x, N - 1 - y, col)
        return
      }
      if (sym === 1) put(N - 1 - x, y, col)
      else if (sym === 2) put(x, N - 1 - y, col)
    }

    /** 圆头笔刷：半径 r 内填色；开对称时各镜像位置同时落 */
    function dabFull(cx, cy, r, col) {
      var ri = Math.max(0, Math.round(r) - 1)
      for (var dy = -ri; dy <= ri; dy++) {
        for (var dx = -ri; dx <= ri; dx++) {
          var d = Math.hypot(dx, dy)
          if (d > r) continue
          if (d > r - 1 && d <= r && ((dx + dy) & 1)) continue
          putSym(cx + dx, cy + dy, col)
        }
      }
    }

    /* ---- 形状：全部按 putSym 落笔，所以对称对形状一样生效 ---- */

    /** 两点之间用笔刷连成线（Bresenham）。画直线工具用。 */
    function stampLine(x0, y0, x1, y1, r, col) {
      var dx = Math.abs(x1 - x0)
      var dy = -Math.abs(y1 - y0)
      var sx = x0 < x1 ? 1 : -1
      var sy = y0 < y1 ? 1 : -1
      var err = dx + dy
      for (;;) {
        dabFull(x0, y0, r, col)
        if (x0 === x1 && y0 === y1) break
        var e2 = 2 * err
        if (e2 >= dy) { err += dy; x0 += sx }
        if (e2 <= dx) { err += dx; y0 += sy }
      }
    }

    /** 矩形边框。filled 为真时填满。 */
    function stampRect(x0, y0, x1, y1, r, col, filled) {
      var ax = Math.min(x0, x1), bx = Math.max(x0, x1)
      var ay = Math.min(y0, y1), by = Math.max(y0, y1)
      for (var y = ay; y <= by; y++) {
        for (var x = ax; x <= bx; x++) {
          var edge = x === ax || x === bx || y === ay || y === by
          if (edge || filled) dabFull(x, y, r, col)
        }
      }
    }

    /** 以 (x0,y0)-(x1,y1) 为外接框的椭圆。画「圆」时框是正方形，
        看起来就是正圆；拖成扁的也允许。

        逐行扫、每行算左右两个边界 x —— 不要改成「按角度均匀采样」：
        采样的步长在左右两极最大（那里 x 几乎不变、y 一跳两三格），
        圆环上就会缺两格。像素画宁可多画也不要断口。 */
    function stampEllipse(x0, y0, x1, y1, r, col, filled) {
      var ax = Math.min(x0, x1), bx = Math.max(x0, x1)
      var ay = Math.min(y0, y1), by = Math.max(y0, y1)
      var rx = (bx - ax) / 2
      var ry = (by - ay) / 2
      var cx = ax + rx
      var cy = ay + ry
      if (rx < 0.5 || ry < 0.5) {
        dabFull(Math.round(cx), Math.round(cy), r, col)
        return
      }
      var yA = Math.round(cy - ry)
      var yB = Math.round(cy + ry)
      for (var y = yA; y <= yB; y++) {
        var ny = (y - cy) / ry
        var s = 1 - ny * ny
        if (s < 0) continue
        var dx = rx * Math.sqrt(s)
        var xl = Math.round(cx - dx)
        var xr = Math.round(cx + dx)
        if (filled) {
          for (var x = xl; x <= xr; x++) dabFull(x, y, r, col)
        } else if (xr - xl <= 1) {
          // 最宽那一行左右两点挨在一起，直接连着画，
          // 否则正圆的正左正右各断一格
          for (var x2 = xl; x2 <= xr; x2++) dabFull(x2, y, r, col)
        } else {
          dabFull(xl, y, r, col)
          dabFull(xr, y, r, col)
        }
      }
    }

    function at(ev) {
      var r = canvas.getBoundingClientRect()
      if (r.width <= 0) return null
      var x = Math.floor(((ev.clientX - r.left) / r.width) * N)
      var y = Math.floor(((ev.clientY - r.top) / r.height) * N)
      if (x < 0 || y < 0 || x >= N || y >= N) return null
      return { x: x, y: y }
    }

    /* 两点之间补点，快速拖动不断线 */
    function line(x0, y0, x1, y1, r, col) {
      var dx = x1 - x0
      var dy = y1 - y0
      var steps = Math.max(Math.abs(dx), Math.abs(dy))
      if (steps === 0) {
        dabFull(x0, y0, r, col)
        return
      }
      for (var i = 0; i <= steps; i++) {
        dabFull(Math.round(x0 + (dx * i) / steps), Math.round(y0 + (dy * i) / steps), r, col)
      }
    }

    /* 形状类工具：返回 true 表示走的是「预览 → 抬手落笔」这条路 */
    function isShapeTool(t) {
      return t === 'line' || t === 'rect' || t === 'circle'
    }

    /* 形状工具拖动期间 buf 本身就是「预览缓冲」——每帧从起点快照 base
       重新复制一份再画形状，而不是在上一帧结果上继续叠加：
       叠加会让先前画过的那条线越拖越粗。抬手只清 base，不动 buf，
       因为 buf 里已经是最终结果了。 */
    var base = null

    function repaintShape(x1, y1, col) {
      if (!base || !anchor) return
      buf = base.map(function (q) { return q ? q.slice() : null })
      if (tool === 'line') stampLine(anchor.x, anchor.y, x1, y1, brush, col)
      else if (tool === 'rect') stampRect(anchor.x, anchor.y, x1, y1, brush, col, o && o.fillShape)
      else if (tool === 'circle') stampEllipse(anchor.x, anchor.y, x1, y1, brush, col, o && o.fillShape)
      render()
    }

    function onDown(ev) {
      var p = at(ev)
      if (!p) return
      if (tool === 'picker') {
        // 吸管：取那一格的颜色交给调用方，不动画面
        var c = buf[p.y * N + p.x]
        if (c && o.onPick) o.onPick([c[0], c[1], c[2]])
        if (window.sfx) { try { window.sfx('tick') } catch (e) {} }
        return
      }
      ev.preventDefault()
      drawing = true
      snapshot()
      var col = tool === 'eraser' ? null : (o.getColor ? o.getColor() : [0, 0, 0])
      lastX = p.x
      lastY = p.y
      if (isShapeTool(tool)) {
        anchor = { x: p.x, y: p.y }
        base = buf.map(function (q) { return q ? q.slice() : null })
        // 按下这一帧就画一次，拖不动也能看到一个点
        repaintShape(p.x, p.y, col)
      } else {
        dabFull(p.x, p.y, brush, col)
        render()
      }
      if (o.onChange) o.onChange()
    }

    function onMove(ev) {
      if (!drawing) return
      var p = at(ev)
      if (!p) return
      if (p.x === lastX && p.y === lastY) return
      lastX = p.x
      lastY = p.y
      var col = tool === 'eraser' ? null : (o.getColor ? o.getColor() : [0, 0, 0])
      if (isShapeTool(tool)) {
        repaintShape(p.x, p.y, col)
      } else {
        line(lastX, lastY, p.x, p.y, brush, col)
        render()
      }
      if (o.onChange) o.onChange()
    }

    function onUp() {
      if (!drawing) return
      drawing = false
      lastX = lastY = -1
      if (base) {
        // buf 里已经是最终结果，只要把起点快照丢掉就行
        base = null
        anchor = null
      }
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    canvas.addEventListener('pointerleave', onUp)

    // 挂上尺寸监听，再画第一帧（背板尺寸要按实测的 CSS 宽度算）
    watchSize()
    render()

    return {
      size: N,
      setBrush: function (v) { brush = Math.max(1, Math.min(8, Math.round(v) || 1)) },
      getBrush: function () { return brush },
      setMirror: function (v) { sym = v ? 1 : 0 },
      getMirror: function () { return sym === 1 },
      /* 对称档位：0 关 / 1 左右 / 2 上下 / 3 四角（位掩码） */
      setSym: function (v) { sym = Math.max(0, Math.min(3, Math.round(Number(v)) || 0)) },
      getSym: function () { return sym },
      /* 选工具。传不在名单里的值一律退回画笔，别把画板弄成不能画的状态 */
      setTool: function (t) { tool = TOOLS.indexOf(t) >= 0 ? t : 'brush' },
      getTool: function () { return tool },
      setColor: function () { render() },
      clear: function () { snapshot(); buf = new Array(N * N).fill(null); render(); if (o.onChange) o.onChange() },
      undo: function () {
        var prev = undoStack.pop()
        if (!prev) return false
        buf = prev
        base = null
        anchor = null
        render()
        if (o.onChange) o.onChange()
        return true
      },
      getBuffer: function () { return buf },
      /** 有内容的格子数 */
      filled: function () {
        var n = 0
        for (var i = 0; i < buf.length; i++) if (buf[i]) n++
        return n
      },
      isEmpty: function () {
        for (var i = 0; i < buf.length; i++) if (buf[i]) return false
        return true
      },
      /** 载入已有像素（编辑旧头像） */
      load: function (arr) {
        snapshot()
        buf = new Array(N * N).fill(null)
        base = null
        anchor = null
        if (Array.isArray(arr)) {
          for (var i = 0; i < Math.min(arr.length, buf.length); i++) {
            var p = arr[i]
            if (Array.isArray(p) && p.length >= 3) buf[i] = [p[0], p[1], p[2]]
          }
        }
        render()
        if (o.onChange) o.onChange()
      },
      /**
       * 降采样到 target×target（默认 16）。
       * 用「取最深的一格」而不是平均 —— 平均会把细线条冲淡，
       * 16×16 这种小图里宁可让颜色重一点，也要看得清。
       */
      downsample: function (target) {
        var T = target || 16
        var out = []
        var step = N / T
        for (var ty = 0; ty < T; ty++) {
          for (var tx = 0; tx < T; tx++) {
            var best = null
            var bestSum = -1
            for (var y = 0; y < step; y++) {
              for (var x = 0; x < step; x++) {
                var p = buf[Math.floor(ty * step + y) * N + Math.floor(tx * step + x)]
                if (!p) continue
                var sum = p[0] + p[1] + p[2]
                if (sum > bestSum) { bestSum = sum; best = p }
              }
            }
            out.push(best ? [best[0], best[1], best[2]] : [255, 255, 255])
          }
        }
        return out
      },
      /** 直接取 64×64，发布大图用 */
      full: function () {
        var out = []
        for (var i = 0; i < N * N; i++) {
          var p = buf[i]
          out.push(p ? [p[0], p[1], p[2]] : [255, 255, 255])
        }
        return out
      },
      render: render,
      destroy: function () {
        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerup', onUp)
        canvas.removeEventListener('pointercancel', onUp)
        canvas.removeEventListener('pointerleave', onUp)
        if (ro) {
          ro.disconnect()
          ro = null
        }
        if (resizeTimer) {
          clearTimeout(resizeTimer)
          resizeTimer = 0
        }
      },
    }
  }

  return {
    create: create,
    TOOLS: TOOLS,
    TOOL_LABEL: TOOL_LABEL,
  }
})()
