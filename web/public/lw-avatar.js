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

  /** 默认头像：一只圆头像素人，配色由 uid 决定。与服务端 _avatar.js 保持一致 */
  function defaultPixels(seed) {
    var h = hash32(seed)
    var hue = h % 360
    var bg = hsl2rgb(hue, 0.42, 0.88)
    var bg2 = hsl2rgb(hue, 0.4, 0.78)
    var skin = [244, 214, 176]
    var line = [58, 42, 34]
    var hair = hsl2rgb((hue + 24) % 360, 0.5, 0.42)
    var px = new Array(SIZE * SIZE)
    for (var y = 0; y < SIZE; y++) {
      for (var x = 0; x < SIZE; x++) {
        var d = Math.hypot(x - 7.5, y - 7.2)
        var c
        if (d > 7.4) c = (x + y) % 4 === 0 ? bg2 : bg
        else if (d > 6.4) c = line
        else if (d > 5.2) c = y < 5 ? hair : skin
        else c = skin
        if (y === 8 && (x === 5 || x === 10)) c = line
        if (y === 11 && (x === 7 || x === 8)) c = line
        px[y * SIZE + x] = c
      }
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
