// 像素喷漆引擎（与像素画完全独立的一套）
//
// 像素画是「逐格上色」，喷漆是「按住拖着喷」——两套交互、两套代码，
// 互不影响。喷漆画布是 64×64，需要发布或存头像时再降采样。
//
// 供两处使用：
//   画板「像素喷漆」创作模式 → 直接用 64×64 发布
//   头像编辑器「喷漆」选项   → 降采样到 16×16
window.LWSpray = (function () {
  var UNDO_MAX = 24

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
    var mirror = false
    var bg = o.bg || null
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
      // 底
      if (bg) {
        c.fillStyle = bg
        c.fillRect(0, 0, N, N)
      } else {
        for (var y = 0; y < N; y++) {
          for (var x = 0; x < N; x++) {
            c.fillStyle = (x + y) % 2 ? '#f2efe9' : '#e7e3db'
            c.fillRect(x, y, 1.02, 1.02)
          }
        }
      }
      for (var i = 0; i < buf.length; i++) {
        var p = buf[i]
        if (!p) continue
        c.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')'
        c.fillRect(i % N, Math.floor(i / N), 1.02, 1.02)
      }
    }

    function put(x, y, col) {
      if (x < 0 || y < 0 || x >= N || y >= N) return
      buf[y * N + x] = [col[0], col[1], col[2]]
    }

    /** 圆头笔刷：半径 r 内填色；开镜像时左右同时落 */
    function dabFull(cx, cy, r, col) {
      var ri = Math.max(0, Math.round(r) - 1)
      for (var dy = -ri; dy <= ri; dy++) {
        for (var dx = -ri; dx <= ri; dx++) {
          var d = Math.hypot(dx, dy)
          if (d > r) continue
          if (d > r - 1 && d <= r && ((dx + dy) & 1)) continue
          put(cx + dx, cy + dy, col)
          if (mirror) put(N - 1 - (cx + dx), cy + dy, col)
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

    function onDown(ev) {
      ev.preventDefault()
      var p = at(ev)
      if (!p) return
      drawing = true
      snapshot()
      var col = o.getColor ? o.getColor() : [0, 0, 0]
      dabFull(p.x, p.y, brush, col)
      lastX = p.x
      lastY = p.y
      render()
      if (o.onChange) o.onChange()
    }
    function onMove(ev) {
      if (!drawing) return
      var p = at(ev)
      if (!p) return
      if (p.x === lastX && p.y === lastY) return
      var col = o.getColor ? o.getColor() : [0, 0, 0]
      line(lastX, lastY, p.x, p.y, brush, col)
      lastX = p.x
      lastY = p.y
      render()
      if (o.onChange) o.onChange()
    }
    function onUp() {
      drawing = false
      lastX = lastY = -1
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
      setMirror: function (v) { mirror = !!v },
      getMirror: function () { return mirror },
      setColor: function () { render() },
      clear: function () { snapshot(); buf = new Array(N * N).fill(null); render(); if (o.onChange) o.onChange() },
      undo: function () {
        var prev = undoStack.pop()
        if (!prev) return false
        buf = prev
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

  return { create: create }
})()
