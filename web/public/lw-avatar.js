// 头像：渲染、批量缓存、默认头像生成
// 放在全局是因为社区列表、我的页、信箱、成就页都要用，
// 每处各写一份会很快失控。
//
// 数据来源：/api/avatar?uids=a,b,c 一次拿完，避免 N 个请求。
// 没画过的返回 null，此时用 defaultPixels(uid) 在客户端现算 ——
// 这样默认头像不需要服务端参与，冷启动也快。
window.LWAvatar = (function () {
  var SIZE = 16
  var cache = Object.create(null) // uid -> pixels[] | null(无自定义)
  var pending = Object.create(null)

  function hash32(str) {
    var h = 2166136261
    var s = String(str || '')
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619) >>> 0
    }
    return h >>> 0
  }

  function hsl2rgb(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s
    var hp = (h % 360) / 60
    var x = c * (1 - Math.abs((hp % 2) - 1))
    var r = 0, g = 0, b = 0
    if (hp < 1) { r = c; g = x; b = 0 }
    else if (hp < 2) { r = x; g = c; b = 0 }
    else if (hp < 3) { r = 0; g = c; b = x }
    else if (hp < 4) { r = 0; g = x; b = c }
    else if (hp < 5) { r = x; g = 0; b = c }
    else { r = c; g = 0; b = x }
    var m = l - c / 2
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
  }

  /* 精选色相：橙黄那一段（40°~80°）在 16×16 的小方块里会发闷、像土色，
     所以不用整圈色轮，直接列一组好看的颜色。 */
  var HUES = [352, 358, 6, 13, 20, 30, 340, 350, 330, 300, 288, 276, 262, 248, 233, 218, 208, 198, 185, 172, 161, 150, 120, 96]
  var LIGHTS = [0.6, 0.66, 0.72]

  /** 默认头像：一只圆头小兽。
      长得像谁完全由 uid 决定 —— 色相 × 明度 × 耳型 × 眼型 × 嘴型 × 底纹
      一共 24×3×3×2×3×3 = 3888 种组合，同一个人每次都是同一只，
      不同人基本不会撞脸。改这里时必须同步改 functions/api/_avatar.js。 */
  function defaultPixels(seed) {
    var h = hash32(seed)
    /* 把哈希当 N 进制数拆开用，各维度互不相关。
       直接 h%k 再 Math.floor(h/k)%m 会让相邻的 uid 长得像。 */
    var hue = HUES[h % HUES.length]
    var lit = LIGHTS[Math.floor(h / 24) % 3]
    var earType = Math.floor(h / 72) % 3
    var eyeType = Math.floor(h / 216) % 2
    var mouthType = Math.floor(h / 432) % 3
    var bgPat = Math.floor(h / 1296) % 3

    var body = hsl2rgb(hue, 0.62, lit)
    var bodyDark = hsl2rgb(hue, 0.56, lit - 0.18)
    var bodyLight = hsl2rgb(hue, 0.58, Math.min(0.92, lit + 0.16))
    // 底色取同色系的浅色：比互补色干净，整张图不至于花
    var bg = hsl2rgb(hue, 0.34, 0.945)
    var bgDot = hsl2rgb(hue, 0.34, 0.885)
    var ink = [58, 44, 38]
    var white = [255, 253, 250]
    var blush = [246, 150, 150]

    var px = new Array(SIZE * SIZE)
    var CX = 7.5
    var CY = 8.3
    var R = 5.3
    for (var y = 0; y < SIZE; y++) {
      for (var x = 0; x < SIZE; x++) {
        var dx = x - CX
        var dy = y - CY
        var d = Math.sqrt(dx * dx + dy * dy)
        var c
        if (d > 7.2) {
          // 三种底纹：斜点 / 纯色 / 方格
          if (bgPat === 0) c = (x + y) % 4 === 0 ? bgDot : bg
          else if (bgPat === 1) c = bg
          else c = ((x >> 1) + (y >> 1)) % 2 === 0 ? bg : bgDot
        } else if (d > R) c = bg
        else if (d > R - 0.7) c = bodyDark
        else c = body
        px[y * SIZE + x] = c
      }
    }
    // 左上角一小片高光，看着才有体积，不然就是一坨平色
    var hl = [[4, 5], [5, 5], [4, 6], [5, 6], [6, 6]]
    for (var a = 0; a < hl.length; a++) px[hl[a][1] * SIZE + hl[a][0]] = bodyLight
    // 耳型一：两只圆耳朵；耳型二：两根触角；耳型三：光滑一团，不画
    if (earType === 0) {
      var ears = [[4, 3], [5, 3], [4, 4], [11, 3], [10, 3], [11, 4]]
      for (var b = 0; b < ears.length; b++) px[ears[b][1] * SIZE + ears[b][0]] = bodyDark
    } else if (earType === 1) {
      px[3 * SIZE + 5] = bodyDark
      px[2 * SIZE + 5] = ink
      px[3 * SIZE + 10] = bodyDark
      px[2 * SIZE + 10] = ink
    }
    // 眼型一：实心眼 + 一点白高光；眼型二：大白眼 + 黑瞳
    var E = [[5, 7], [6, 7], [5, 8], [6, 8], [9, 7], [10, 7], [9, 8], [10, 8]]
    var e
    if (eyeType === 0) {
      for (e = 0; e < E.length; e++) px[E[e][1] * SIZE + E[e][0]] = ink
      px[7 * SIZE + 5] = white
      px[7 * SIZE + 9] = white
    } else {
      for (e = 0; e < E.length; e++) px[E[e][1] * SIZE + E[e][0]] = white
      px[7 * SIZE + 6] = ink
      px[8 * SIZE + 6] = ink
      px[7 * SIZE + 9] = ink
      px[8 * SIZE + 9] = ink
    }
    // 腮红
    if (mouthType !== 2) {
      px[10 * SIZE + 4] = blush
      px[10 * SIZE + 11] = blush
    }
    // 嘴型：两点 / 带嘴角的笑 / 张开的小嘴
    px[11 * SIZE + 7] = ink
    px[11 * SIZE + 8] = ink
    if (mouthType === 1) {
      px[10 * SIZE + 6] = ink
      px[10 * SIZE + 9] = ink
    } else if (mouthType === 2) {
      px[12 * SIZE + 7] = ink
      px[12 * SIZE + 8] = ink
    }
    return px
  }

  function token() {
    try {
      return localStorage.getItem('lw-token') || ''
    } catch (e) {
      return ''
    }
  }

  /** 已有（含 null＝确认没自定义）直接返回，不再请求 */
  function cached(uid) {
    return Object.prototype.hasOwnProperty.call(cache, uid) ? cache[uid] : undefined
  }

  function absorb(avatars) {
    for (var uid in avatars) {
      if (Object.prototype.hasOwnProperty.call(avatars, uid)) cache[uid] = avatars[uid]
    }
  }

  /** 批量拉取。返回 Promise，always resolve */
  function load(uids) {
    var need = []
    for (var i = 0; i < uids.length; i++) {
      var u = uids[i]
      if (!u) continue
      if (cached(u) !== undefined) continue
      if (pending[u]) continue
      need.push(u)
    }
    if (!need.length) return Promise.resolve(cache)
    for (var j = 0; j < need.length; j++) pending[need[j]] = 1
    return fetch('/api/avatar?uids=' + encodeURIComponent(need.join(',')))
      .then(function (r) {
        return r.ok ? r.json() : null
      })
      .then(function (d) {
        if (d && d.ok && d.avatars) absorb(d.avatars)
      })
      .catch(function () {})
      .then(function () {
        for (var k = 0; k < need.length; k++) delete pending[need[k]]
        return cache
      })
  }

  /** 取一组 uid 的像素，未知的先算默认头像 */
  function pixelsOf(uid) {
    if (!uid) return defaultPixels('anon')
    var v = cached(uid)
    if (v === undefined) return defaultPixels(uid)
    if (v === null) return defaultPixels(uid)
    return v
  }

  /**
   * 把头像画到 canvas。
   * css 为显示尺寸（正方形），默认 32。
   */
  function draw(canvas, uid, css, pixels) {
    if (!canvas) return
    var box = Math.max(16, Math.round(css || 32))
    var dpr = window.devicePixelRatio || 1
    canvas.width = box * dpr
    canvas.height = box * dpr
    canvas.style.width = box + 'px'
    canvas.style.height = box + 'px'
    var ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var px = pixels || pixelsOf(uid)
    var s = box / SIZE
    for (var y = 0; y < SIZE; y++) {
      for (var x = 0; x < SIZE; x++) {
        var p = px[y * SIZE + x]
        ctx.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')'
        ctx.fillRect(x * s, y * s, s + 0.5, s + 0.5)
      }
    }
  }

  /**
   * 拿到一组作品里的作者 uid 并批量拉头像，然后回调。
   * works: [{ ownerUser }]
   */
  function loadForWorks(works, then) {
    var uids = []
    var seen = Object.create(null)
    for (var i = 0; i < (works || []).length; i++) {
      var u = works[i] && works[i].ownerUser
      if (u && !seen[u]) {
        seen[u] = 1
        uids.push(u)
      }
    }
    if (!uids.length) {
      if (then) then()
      return Promise.resolve()
    }
    return load(uids.slice(0, 60)).then(function () {
      if (then) then()
    })
  }

  function put(uid, pixels) {
    cache[uid] = pixels
  }

  function clear() {
    cache = Object.create(null)
  }

  return {
    SIZE: SIZE,
    defaultPixels: defaultPixels,
    load: load,
    loadForWorks: loadForWorks,
    pixelsOf: pixelsOf,
    draw: draw,
    put: put,
    clear: clear,
    token: token,
  }
})()
