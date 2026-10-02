// 交互特效层
//
// 第三层：animation 管「动」、polish 管「静」，这一层管「手感」——
// 点击反馈、庆祝、快捷操作、氛围。
//
// 全部受 prefers-reduced-motion 控制。

;(function () {
  if (window.__lwFx) return
  window.__lwFx = true

  var reduce = false
  try {
    reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.addEventListener) mq.addEventListener('change', function (e) { reduce = e.matches })
  } catch (e) {}

  var CSS = `
/* ============ 点击处扩散的光晕 ============ */
#lwfxLayer { position: fixed; inset: 0; pointer-events: none; z-index: 99996; overflow: hidden }
.lwfx-halo {
  position: absolute;
  width: 12px; height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  border: 2px solid var(--accent, #5b8def);
  opacity: .55;
  animation: lwfx-halo .62s cubic-bezier(.2,.9,.3,1) forwards;
}
@keyframes lwfx-halo {
  0%   { transform: scale(.4); opacity: .6 }
  100% { transform: scale(5.2); opacity: 0 }
}

/* ============ 桌面上跟随鼠标的柔光 ============ */
#lwfxGlow {
  position: fixed;
  width: 340px; height: 340px;
  margin: -170px 0 0 -170px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  background: radial-gradient(circle, rgba(91,141,239,.13) 0%, rgba(91,141,239,.05) 42%, transparent 68%);
  transition: opacity .5s ease-out;
  will-change: transform;
}
#lwfxGlow.on { opacity: 1 }
@media (hover: none), (pointer: coarse) { #lwfxGlow { display: none } }

/* ============ 主题切换时的过渡 ============ */
html.lwfx-theming, html.lwfx-theming * {
  transition: background-color .34s ease, color .34s ease, border-color .34s ease,
              box-shadow .34s ease, fill .34s ease, stroke .34s ease !important;
}

/* ============ 彩带 ============ */
.lwfx-conf {
  position: fixed;
  width: 7px; height: 7px;
  z-index: 99998;
  pointer-events: none;
  border-radius: 1px;
  animation: lwfx-conf 1.5s cubic-bezier(.25,.6,.4,1) forwards;
}
@keyframes lwfx-conf {
  0%   { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1) }
  70%  { opacity: 1 }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(.5) }
}

/* ============ 打字机光标 ============ */
.lwfx-caret::after {
  content: '';
  display: inline-block;
  width: 2px; height: 1em;
  margin-left: 2px;
  vertical-align: -2px;
  background: currentColor;
  animation: lwfx-blink .78s steps(1) infinite;
}
@keyframes lwfx-blink { 0%, 50% { opacity: 1 } 51%, 100% { opacity: 0 } }

/* ============ 键盘快捷键面板 ============ */
#lwfxKeys {
  position: fixed; inset: 0; z-index: 99997;
  background: rgba(28,24,20,.55);
  display: flex; align-items: center; justify-content: center;
  padding: 22px;
  opacity: 0; pointer-events: none;
  transition: opacity .18s ease-out;
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
#lwfxKeys.on { opacity: 1; pointer-events: auto }
.lwfx-keys-box {
  width: 100%; max-width: 380px;
  max-height: 76vh; overflow-y: auto;
  background: var(--surface, #fff);
  border: 1px solid var(--border, #efe7da);
  border-radius: var(--lwp-r-lg, 18px);
  padding: 20px;
  box-shadow: var(--lwp-sh-5, 0 18px 52px rgba(0,0,0,.3));
  transform: translateY(14px) scale(.96);
  transition: transform .24s cubic-bezier(.2,1.2,.4,1);
}
#lwfxKeys.on .lwfx-keys-box { transform: none }
.lwfx-keys-box h3 {
  margin: 0 0 4px; font-size: 17px; font-weight: 900; color: var(--text);
}
.lwfx-keys-box .sub {
  font-size: 12px; color: var(--text-faint); margin-bottom: 14px;
}
.lwfx-keys-grid { display: flex; flex-direction: column; gap: 2px }
.lwfx-key-row {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 0; font-size: 13px; color: var(--text-muted);
  border-bottom: 1px solid var(--border, #efe7da);
}
.lwfx-key-row:last-child { border-bottom: 0 }
.lwfx-key-row span { flex: 1 }
kbd {
  display: inline-block; min-width: 20px;
  padding: 2px 6px; margin-left: 3px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 11px; font-weight: 700; text-align: center;
  color: var(--text);
  background: var(--surface-2, #f6f2ea);
  border: 1px solid var(--border-input, #e0d8d0);
  border-bottom-width: 2px;
  border-radius: 5px;
}

/* ============ 节日氛围（给 body 加 .lwfx-festival-xxx） ============ */
body.lwfx-fest-newyear .page > h1,
body.lwfx-fest-newyear .card-title { color: #d13b2e !important }
body.lwfx-fest-xmas .page > h1,
body.lwfx-fest-xmas .card-title { color: #2f7d54 !important }

/* ============ 未读的呼吸光晕 ============ */
.lwfx-unread {
  position: relative;
}
.lwfx-unread::after {
  content: '';
  position: absolute; inset: -3px;
  border-radius: inherit;
  border: 2px solid #e5574b;
  opacity: 0;
  animation: lwfx-breathe 2s ease-out infinite;
  pointer-events: none;
}
@keyframes lwfx-breathe {
  0%   { opacity: .6; transform: scale(.96) }
  70%  { opacity: 0; transform: scale(1.1) }
  100% { opacity: 0; transform: scale(1.1) }
}

@media (prefers-reduced-motion: reduce) {
  .lwfx-halo, .lwfx-conf, .lwfx-caret::after, .lwfx-unread::after { animation: none !important }
  #lwfxGlow { display: none }
  html.lwfx-theming, html.lwfx-theming * { transition: none !important }
}
`

  function inject() {
    if (document.getElementById('lwfx-style')) return
    var st = document.createElement('style')
    st.id = 'lwfx-style'
    st.textContent = CSS
    ;(document.head || document.documentElement).appendChild(st)
  }
  inject()

  function layer() {
    var el = document.getElementById('lwfxLayer')
    if (!el) {
      el = document.createElement('div')
      el.id = 'lwfxLayer'
      document.body.appendChild(el)
    }
    return el
  }

  /* ================= 点击光晕 ================= */
  document.addEventListener(
    'pointerdown',
    function (e) {
      if (reduce) return
      var el = document.createElement('div')
      el.className = 'lwfx-halo'
      el.style.left = e.clientX + 'px'
      el.style.top = e.clientY + 'px'
      layer().appendChild(el)
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el)
      }, 660)
    },
    { passive: true, capture: true }
  )

  /* ================= 桌面柔光跟随 ================= */
  var glow = null
  var gx = 0, gy = 0, cx = 0, cy = 0, glowOn = false
  function initGlow() {
    if (reduce) return
    try {
      if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return
    } catch (e) {}
    glow = document.createElement('div')
    glow.id = 'lwfxGlow'
    document.body.appendChild(glow)
    document.addEventListener('pointermove', function (e) {
      gx = e.clientX
      gy = e.clientY
      if (!glowOn) {
        glowOn = true
        glow.classList.add('on')
        cx = gx; cy = gy
        loop()
      }
    }, { passive: true })
    document.addEventListener('pointerleave', function () {
      glowOn = false
      if (glow) glow.classList.remove('on')
    })
  }
  function loop() {
    if (!glowOn || !glow) return
    // 缓动跟随，别跟得太死
    cx += (gx - cx) * 0.12
    cy += (gy - cy) * 0.12
    glow.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)'
    requestAnimationFrame(loop)
  }

  /* ================= 主题切换过渡 ================= */
  /* 给 html 加一个类，让所有颜色变化有过渡。
     过渡结束后要摘掉 —— 一直挂着会让后续所有颜色变化都变慢。 */
  function themeTransition(ms) {
    if (reduce) return
    var h = document.documentElement
    h.classList.add('lwfx-theming')
    setTimeout(function () { h.classList.remove('lwfx-theming') }, ms || 380)
  }
  // 监听 data-theme 变化自动触发
  try {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].attributeName === 'data-theme') { themeTransition(); break }
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  } catch (e) {}

  /* ================= 彩带 ================= */
  var CONF_COLORS = ['#5b8def', '#e5574b', '#d1944d', '#4caf7d', '#9b6dd6', '#e8b23f', '#42b3c9']
  function confetti(x, y, count) {
    if (reduce) return
    var n = count || 26
    for (var i = 0; i < n; i++) {
      var d = document.createElement('div')
      d.className = 'lwfx-conf'
      var ang = (-Math.PI / 2) + (Math.random() - 0.5) * 2.4
      var dist = 90 + Math.random() * 190
      d.style.left = x + 'px'
      d.style.top = y + 'px'
      d.style.background = CONF_COLORS[i % CONF_COLORS.length]
      d.style.setProperty('--dx', Math.cos(ang) * dist + 'px')
      d.style.setProperty('--dy', Math.sin(ang) * dist + 160 + 'px')
      d.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg')
      d.style.animationDelay = (Math.random() * 0.12) + 's'
      if (Math.random() > 0.6) d.style.borderRadius = '50%'
      document.body.appendChild(d)
      ;(function (el) {
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el) }, 1750)
      })(d)
    }
  }

  /* ================= 打字机 ================= */
  function typewriter(el, text, opts) {
    if (!el) return
    var o = opts || {}
    var s = String(text == null ? '' : text)
    if (reduce) { el.textContent = s; return }
    el.classList.add('lwfx-caret')
    var i = 0
    var speed = o.speed || 52
    el.textContent = ''
    function tick() {
      if (i >= s.length) {
        el.classList.remove('lwfx-caret')
        if (o.done) o.done()
        return
      }
      el.textContent += s.charAt(i++)
      setTimeout(tick, speed + (Math.random() * speed * 0.6))
    }
    tick()
  }

  /* ================= 键盘快捷键面板 ================= */
  var SHORTCUTS = [
    ['画笔', ['B']],
    ['橡皮', ['E']],
    ['填充', ['G']],
    ['吸管', ['I']],
    ['手型 / 平移', ['H', '空格']],
    ['撤销', ['Z', 'Ctrl+Z']],
    ['重做', ['Ctrl+Y']],
    ['清空', ['Delete']],
    ['镜像', ['M']],
    ['三种画法切换', ['1', '2', '3']],
    ['上一页 / 下一页', ['[', ']']],
    ['播放帧动画', ['P']],
    ['导出 PNG', ['Ctrl+S']],
    ['本面板', ['?']],
    ['关闭浮层', ['Esc']],
  ]

  function keysPanel() {
    var el = document.getElementById('lwfxKeys')
    if (el) return el
    el = document.createElement('div')
    el.id = 'lwfxKeys'
    var rows = ''
    for (var i = 0; i < SHORTCUTS.length; i++) {
      var name = SHORTCUTS[i][0]
      var keys = SHORTCUTS[i][1]
      var kb = ''
      for (var k = 0; k < keys.length; k++) {
        var parts = String(keys[k]).split('+')
        for (var p = 0; p < parts.length; p++) {
          if (p) kb += '+'
          kb += '<kbd>' + parts[p] + '</kbd>'
        }
        if (k < keys.length - 1) kb += ' '
      }
      rows += '<div class="lwfx-key-row"><span>' + name + '</span>' + kb + '</div>'
    }
    el.innerHTML =
      '<div class="lwfx-keys-box">' +
      '<h3>⌨️ 键盘快捷键</h3>' +
      '<div class="sub">手机上用不到，桌面端更快</div>' +
      '<div class="lwfx-keys-grid">' + rows + '</div>' +
      '</div>'
    el.addEventListener('click', function (e) {
      if (e.target === el) el.classList.remove('on')
    })
    document.body.appendChild(el)
    return el
  }

  function toggleKeys(on) {
    var el = keysPanel()
    var want = on == null ? !el.classList.contains('on') : !!on
    el.classList.toggle('on', want)
  }

  document.addEventListener('keydown', function (e) {
    // 在输入框里打字时不拦
    var t = e.target
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
    if (e.key === 'Escape') { toggleKeys(false); return }
    if (typing) return
    if (e.key === '?') { e.preventDefault(); toggleKeys() }
  })

  /* ================= 节日氛围 ================= */
  function festival() {
    var d = new Date()
    var m = d.getMonth() + 1
    var day = d.getDate()
    var cls = ''
    // 春节前后大致范围（农历每年不同，这里用公历近似）
    if ((m === 1 && day >= 20) || (m === 2 && day <= 20)) cls = 'lwfx-fest-newyear'
    else if (m === 12 && day >= 20) cls = 'lwfx-fest-xmas'
    if (cls) {
      document.body.classList.remove('lwfx-fest-newyear', 'lwfx-fest-xmas')
      document.body.classList.add(cls)
    }
  }

  /* ================= 启动 ================= */
  function start() {
    initGlow()
    festival()
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()

  /* ================= 对外接口 ================= */
  window.LWFx = {
    /** 在坐标处撒彩带。不传坐标就在屏幕中间 */
    confetti: function (x, y, n) {
      confetti(
        x == null ? window.innerWidth / 2 : x,
        y == null ? window.innerHeight / 3 : y,
        n
      )
    },
    /** 在一个元素上撒彩带（成就解锁用这个） */
    celebrate: function (el, n) {
      if (!el) return this.confetti(null, null, n)
      var r = el.getBoundingClientRect()
      confetti(r.left + r.width / 2, r.top + r.height / 2, n || 30)
    },
    typewriter: typewriter,
    keys: toggleKeys,
    themeTransition: themeTransition,
    /** 给元素加未读呼吸光晕 */
    unread: function (el, on) {
      if (!el) return
      el.classList.toggle('lwfx-unread', on !== false)
    },
    reduced: function () { return reduce },
  }
})()
