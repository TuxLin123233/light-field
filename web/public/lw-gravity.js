// 像素重力引擎（落沙）
//
// 和「像素画」「像素喷漆」并列的第三套独立交互：
//   像素画是逐格上色，喷漆是按住拖着喷，重力是「撒一把，看它自己堆」。
// 撒下去的每一粒都会往下掉，落到下面有东西就斜着滑开，
// 所以堆出来的是有坡度的沙堆，而不是齐刷刷一堵墙。
//
// 画布是 64×64（和喷漆一致，发布时能直接用），但交互与像素画完全独立，
// 两者互不影响、随时来回切。
window.LWGravity = (function () {
  var UNDO_MAX = 24
  // 颗粒尺寸的可选档位（半宽）。1≈单粒，4≈一把
  var BRUSH_MIN = 1
  var BRUSH_MAX = 4

  /**
   * create(canvas, opts) -> controller
   * opts: { size, getColor, onChange, bg }
   *   size     画布分辨率（默认 64）
   *   getColor 取当前颜色 () => [r,g,b]
   *   onChange 状态变化后回调（落笔、沉降、撤销、清空……）
   *   bg       空格子底色，默认棋盘灰
   */
  function create(canvas, opts) {
    var o = opts || {}
    var N = o.size || 64
    var undoStack = []
    var drawing = false
    var lastX = -1
    var lastY = -1
    var brush = 2
    var bg = o.bg || null
    /* 物理步长 ≈ 31 格/秒。快了看不清颗粒是怎么一颗颗落下来的，
       慢了一堆沙半天落不完 —— 这个值和显示刷新率无关，
       所以 60Hz 屏和 120Hz 屏上落沙速度一样。 */
    var STEP_MS = 32
    var running = false
    // 底层像素缓冲：只存有颗粒的格子，null 表示空
    var buf = new Array(N * N).fill(null)

    /* 渲染用的离屏画布与 ImageData。
       喷漆是「有多少格就 fillRect 多少次」，只在落笔时重画，所以扛得住；
       重力是每一帧都要重画，64×64 就是每帧 4096 次 fillRect，
       在手机上会直接掉帧。这里改成：把像素写进 N×N 的 ImageData，
       再一次性 drawImage 放大到显示尺寸 —— 每帧只多一次 drawImage，
       而且是位图放大，边缘天然干净，
       不用像喷漆那样再拿「多画半个像素」去盖抗锯齿缝。 */
    var off = document.createElement('canvas')
    off.width = N
    off.height = N
    var offCtx = off.getContext('2d')
    var img = null
    try {
      img = offCtx.createImageData(N, N)
    } catch (e) {
      img = null
    }

    // 空格子棋盘底的两个颜色（和喷漆保持一致）
    var BG1 = [242, 239, 233]
    var BG2 = [231, 227, 219]
    var bgL1 = null
    var bgL2 = null

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

    /* ---------- 背板尺寸 ----------
       和像素画、喷漆同一个毛病：背板不能写死 64×dpr，
       因为画布 CSS 宽度是流式的（最大 512px），容器宽度不是 64 的整数倍时
       位图会被拉伸，最后一行/列只覆盖部分像素，露出来就是一条白线。
       这里按实际显示宽度同步背板，显示尺寸变了重建并重画。 */
    var lastBacking = 0
    var ro = null
    var resizeTimer = 0
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
      var want = Math.max(N, Math.round(cssW * (window.devicePixelRatio || 1)))
      // 只在真的变了才改：改 canvas.width 会清空画布
      if (want !== lastBacking || canvas.width !== want) {
        canvas.width = want
        canvas.height = want
        lastBacking = want
        return true
      }
      return false
    }

    /* ---------- 渲染 ---------- */
    function render() {
      var c = ctx()
      if (!c) return
      syncBacking()
      c.imageSmoothingEnabled = false
      c.clearRect(0, 0, canvas.width, canvas.height)

      var W = canvas.width
      if (img) {
        var d = img.data
        for (var y = 0; y < N; y++) {
          for (var x = 0; x < N; x++) {
            var p = buf[y * N + x]
            var col = p || bgColorAt(x, y)
            var o4 = (y * N + x) * 4
            d[o4] = col[0]
            d[o4 + 1] = col[1]
            d[o4 + 2] = col[2]
            d[o4 + 3] = 255
          }
        }
        offCtx.putImageData(img, 0, 0)
        // 整数倍放大：格线对齐设备像素，不会出现半格
        c.drawImage(off, 0, 0, N, N, 0, 0, W, W)
      } else {
        // 极老浏览器没有 createImageData，退回逐格画
        var s = W / N
        c.setTransform(s, 0, 0, s, 0, 0)
        for (var yy = 0; yy < N; yy++) {
          for (var xx = 0; xx < N; xx++) {
            var q = buf[yy * N + xx] || bgColorAt(xx, yy)
            c.fillStyle = 'rgb(' + q[0] + ',' + q[1] + ',' + q[2] + ')'
            c.fillRect(xx, yy, 1, 1)
          }
        }
        c.setTransform(1, 0, 0, 1, 0, 0)
      }
    }

    function bgColorAt(x, y) {
      if (bg) {
        if (!bgL1) bgL1 = hexToRgb(bg[0])
        if (!bgL2) bgL2 = hexToRgb(bg[1])
        return (x + y) % 2 ? bgL1 : bgL2
      }
      return (x + y) % 2 ? BG1 : BG2
    }

    function hexToRgb(h) {
      if (Array.isArray(h) && h.length >= 3) return h
      var s = String(h || '').replace('#', '')
      if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2]
      var n = parseInt(s, 16)
      if (!isFinite(n)) return [240, 240, 240]
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }

    /* ---------- 物理：一步沉降 ---------- */
    /* 从下往上扫，每一帧只往下走一格 —— 这样能看着它一颗一颗落下来，
       而不是「点一下瞬间全到位」。
       斜滑是堆积能出坡度的关键：正下方被挡住时，随机往左下或右下蹭一格。
       只往下不斜滑的话，沙堆会堆成一根笔直的柱子，斜滑才有沙子的样子。 */
    function settle() {
      var moved = false
      for (var y = N - 2; y >= 0; y--) {
        for (var x = 0; x < N; x++) {
          var i = y * N + x
          var p = buf[i]
          if (!p) continue
          var below = i + N
          if (!buf[below]) {
            buf[below] = p
            buf[i] = null
            moved = true
            continue
          }
          var dl = Math.random() < 0.5 ? -1 : 1
          var dr = -dl
          var xl = x + dl
          var xr = x + dr
          var okL = xl >= 0 && xl < N && !buf[below + dl]
          var okR = xr >= 0 && xr < N && !buf[below + dr]
          var d = 0
          if (okL && okR) d = Math.random() < 0.5 ? dl : dr
          else if (okL) d = dl
          else if (okR) d = dr
          if (d) {
            buf[below + d] = p
            buf[i] = null
            moved = true
          }
        }
      }
      return moved
    }

    /* 「抖一抖」：临时允许斜向蹭，把卡在斜坡上的颗粒摇下来。
       纯重力下有些颗粒会停在两粒之间的缝里，看着像浮在半空；
       抖一下它们就顺着坡滑到底，沙堆会塌一圈 —— 落沙该有的手感。 */
    var shakeLeft = 0
    function jiggle() {
      shakeLeft = Math.max(shakeLeft, 14)
      wake()
    }
    function settleShake() {
      var moved = false
      for (var y = N - 2; y >= 0; y--) {
        for (var x = 0; x < N; x++) {
          var i = y * N + x
          var p = buf[i]
          if (!p) continue
          var below = i + N
          if (!buf[below]) {
            buf[below] = p
            buf[i] = null
            moved = true
            continue
          }
          if (shakeLeft > 0 && Math.random() < 0.35) {
            var d = Math.random() < 0.5 ? -1 : 1
            var nx = x + d
            if (nx >= 0 && nx < N && !buf[below + d]) {
              buf[below + d] = p
              buf[i] = null
              moved = true
            }
          }
        }
      }
      if (shakeLeft > 0) shakeLeft--
      return moved
    }

    /* ---------- 落笔 ---------- */
    function put(x, y, col) {
      if (x < 0 || y < 0 || x >= N || y >= N) return
      var i = y * N + x
      // 只填空格子：不覆盖已经堆好的那一层
      if (!buf[i]) buf[i] = [col[0], col[1], col[2]]
    }

    /** 撒一把：以 (cx,cy) 为心的圆 */
    function sprinkle(cx, cy, r, col) {
      var ri = Math.max(0, Math.round(r) - 1)
      for (var dy = -ri; dy <= ri; dy++) {
        for (var dx = -ri; dx <= ri; dx++) {
          if (dx * dx + dy * dy > r * r) continue
          put(cx + dx, cy + dy, col)
        }
      }
    }

    /** 两点之间撒，避免快速拖动时断断续续 */
    function stream(x0, y0, x1, y1, r, col) {
      var dx = x1 - x0
      var dy = y1 - y0
      var steps = Math.max(Math.abs(dx), Math.abs(dy))
      if (steps === 0) {
        sprinkle(x0, y0, r, col)
        return
      }
      for (var i = 0; i <= steps; i++) {
        sprinkle(Math.round(x0 + (dx * i) / steps), Math.round(y0 + (dy * i) / steps), r, col)
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

    function onDown(ev) {
      ev.preventDefault()
      var p = at(ev)
      if (!p) return
      drawing = true
      snapshot()
      var col = o.getColor ? o.getColor() : [0, 0, 0]
      sprinkle(p.x, p.y, brush, col)
      lastX = p.x
      lastY = p.y
      wake()
      render()
      if (o.onChange) o.onChange()
    }
    function onMove(ev) {
      if (!drawing) return
      var p = at(ev)
      if (!p) return
      if (p.x === lastX && p.y === lastY) return
      var col = o.getColor ? o.getColor() : [0, 0, 0]
      stream(lastX, lastY, p.x, p.y, brush, col)
      lastX = p.x
      lastY = p.y
      wake()
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

    /* ---------- 主循环 ----------
       颗粒全部落定之后就没有必要继续跑了：
       requestAnimationFrame 一直挂着，手机上就是白烧电、后台还压性能。
       所以连续几帧都没动过就自己停，下次落笔再唤醒。 */
    var raf = 0
    var still = 0
    var lastAdvance = 0
    function loop(ts) {
      raf = 0
      if (!running) return
      // 限速：物理按固定步长走，补步而不是跟着刷新率跑
      if (!lastAdvance) lastAdvance = ts
      var stepped = false
      // 一帧最多补 3 步，切回标签页时别一口气补几百步卡住
      var budget = 3
      while (ts - lastAdvance >= STEP_MS && budget-- > 0) {
        lastAdvance += STEP_MS
        stepped = true
      }
      if (ts - lastAdvance > STEP_MS * 6) lastAdvance = ts

      var moved = false
      if (stepped) {
        moved = shakeLeft > 0 ? settleShake() : settle()
      }
      if (moved) {
        still = 0
        render()
        if (o.onChange) o.onChange()
      } else if (stepped) {
        // 连续几帧没动 = 落定了
        if (++still >= 3) {
          running = false
          return
        }
      }
      raf = requestAnimationFrame(loop)
    }

    function wake() {
      if (running && raf) return
      running = true
      still = 0
      lastAdvance = 0
      if (!raf && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(loop)
    }

    // 挂上尺寸监听，再画第一帧（背板尺寸要按实测的 CSS 宽度算）
    watchSize()
    render()

    /* ---------- 有内容的包围盒 ----------
       颗粒只会往下掉，所以发布出去的话整张图上半截是空的。
       直接把 64×64 传上去，作品列表里就是一张「下面一坨、上面一大片白」。
       裁到内容再按最小合适尺寸（16/32/64）居中放进去，
       社区里看到的就是这幅画本身。 */
    function bbox() {
      var minX = N
      var minY = N
      var maxX = -1
      var maxY = -1
      for (var y = 0; y < N; y++) {
        for (var x = 0; x < N; x++) {
          if (!buf[y * N + x]) continue
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
      if (maxX < 0) return null
      return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
    }

    return {
      size: N,
      setBrush: function (v) { brush = Math.max(BRUSH_MIN, Math.min(BRUSH_MAX, Math.round(v) || 1)) },
      getBrush: function () { return brush },
      setColor: function () { render() },
      /** 抖一抖 */
      shake: jiggle,
      /** 全部落定 */
      settleNow: function () {
        for (var i = 0; i < 4000 && settle(); i++) {}
        render()
      },
      clear: function () {
        snapshot()
        buf = new Array(N * N).fill(null)
        running = false
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        render()
        if (o.onChange) o.onChange()
      },
      undo: function () {
        var prev = undoStack.pop()
        if (!prev) return false
        buf = prev
        wake()
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
      /** 颗粒还在动吗（工具条上「暂停」按钮用） */
      isMoving: function () { return running },
      /**
       * 裁剪后的发布数据 -> { flat, size }
       * size 取能装下内容的最小档（16/32/64），和接口只认这三档对齐。
       */
      exportData: function () {
        var b = bbox()
        if (!b) return null
        var size = b.w <= 16 && b.h <= 16 ? 16 : (b.w <= 32 && b.h <= 32 ? 32 : 64)
        var flat = []
        for (var i = 0; i < size * size; i++) flat.push([255, 255, 255])
        // 水平居中；垂直也居中，免得小图贴着上边、下面一大片空
        var ox = Math.floor((size - b.w) / 2)
        var oy = Math.floor((size - b.h) / 2)
        for (var y = 0; y < b.h; y++) {
          for (var x = 0; x < b.w; x++) {
            var p = buf[(b.y + y) * N + (b.x + x)]
            if (!p) continue
            flat[(oy + y) * size + (ox + x)] = [p[0], p[1], p[2]]
          }
        }
        return { flat: flat, size: size }
      },
      /** 原始 64×64（导出 PNG 用，保留整块画布的样子） */
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
        running = false
        if (raf) cancelAnimationFrame(raf)
        raf = 0
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