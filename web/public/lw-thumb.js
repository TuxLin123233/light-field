// 像素缩略图绘制
//
// 白条纹的根因：以前 canvas 背板固定设成 n*dpr（n=16/32/64，dpr=1~2），
// 而 CSS 显示宽度是 76px 之类，两边不是整数倍关系。
// 浏览器缩放时最后一行/一列只覆盖了部分像素，剩下的透出白色底 —— 就是那些条纹。
//
// 这里改成：先按目标显示宽度算出「每个源像素占多少个 CSS 像素」的整数倍 k，
// 再把 CSS 尺寸和背板都设成 n*k 的整数倍，缩放比正好是 dpr，永远不会切边。
// 另外相邻色块多画 0.6px 盖住缝隙，否则小数缩放时块与块之间也会漏白线。
window.LWThumb = (function () {
  function draw(canvas, pixels, size, opts) {
    if (!canvas) return
    const o = opts || {}
    const n = size === 32 || size === 64 ? size : 16

    /* 目标 CSS 宽度：优先取传入值，否则量当前元素。
       量不到（元素还没进布局，宽度 0）时：
         不能直接 return —— 那 canvas 就一直是空的，什么都不显示；
         也不能随便定一个值写死 —— 之前回退成 76，被 floor(76/16)=4
         算成 64px 钉在内联样式上，卡片后来变宽了图也不变。
       所以：先用一个兜底值把这一帧画出来（保证不空白），
       再在下一帧自动重量一次，那时就能拿到真实宽度了。 */
    let css = Number(o.css) || 0
    let guessed = false
    if (!css) {
      const r = canvas.getBoundingClientRect()
      css = Math.round(r.width) || 0
      if (!css) {
        css = 96 // 兜底，仅用于这一帧
        guessed = true
      }
    }
    if (guessed) {
      /* 下一帧元素通常已经布局好，那时画出来的才是真尺寸。
         限次重试：这个元素要是一直没宽度（比如所在页面被隐藏），
         不加限制就会每帧重画一次，白烧 CPU。 */
      const tries = (o.__retry = (o.__retry || 0) + 1)
      if (tries <= 3 && typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          try {
            draw(canvas, pixels, size, o)
          } catch (e) {}
        })
      }
    } else {
      o.__retry = 0
    }

    if (css < n) css = n

    // 每个源像素占 k 个 CSS 像素，取整数倍。
    // 用 round 而不是 floor：floor 总是往小取，64×64 的图在 101px 的格子里
    // 只能取到 96，白白浪费 5px；round 能取到更贴合的整数倍。
    const k = Math.max(1, Math.round(css / n))
    const side = n * k
    const dpr = Math.min(3, window.devicePixelRatio || 1)

    // 缩完通常比格子窄一点（101 → 96），水平居中，两边留一样宽的边
    canvas.style.width = side + 'px'
    canvas.style.height = side + 'px'
    canvas.style.display = 'block'
    canvas.style.marginLeft = 'auto'
    canvas.style.marginRight = 'auto'
    canvas.width = Math.round(side * dpr)
    canvas.height = Math.round(side * dpr)

    const c = canvas.getContext('2d')
    if (!c) return
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.imageSmoothingEnabled = false

    // 先铺白底：缺失的格子留成透明会显出条纹
    c.fillStyle = o.bg || '#ffffff'
    c.fillRect(0, 0, side, side)

    const s = side / n
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const p = pixels && pixels[y * n + x]
        if (!Array.isArray(p) || p.length < 3) continue
        c.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')'
        // 多画 0.6px 盖住块与块之间的缝隙
        c.fillRect(x * s, y * s, s + 0.6, s + 0.6)
      }
    }
  }

  return { draw: draw }
})()
