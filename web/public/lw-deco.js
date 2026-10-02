// 装饰与功能增强层（第四层）
//
// 前三层：lw-anim 管「动」、lw-polish 管「静」、lw-fx 管「手感」。
// 这一层补的是「具体场景的样子」——奖牌、网格、等级条、下拉刷新、
// 引导光圈、作品放大过渡这些，全局 CSS 覆盖不到、但又不想每个视图各写一遍的。

;(function () {
  if (window.__lwDeco) return
  window.__lwDeco = true

  var reduce = false
  try {
    reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.addEventListener) mq.addEventListener('change', function (e) { reduce = e.matches })
  } catch (e) {}

  var CSS = `
/* ============ 1. 排行榜奖牌 ============ */
/* 前三名给金银铜。用 ::before 画名次角标，不占布局。 */
.rank-item, .rank-row, .lb-item { position: relative }
.rank-item:nth-child(1)::before,
.rank-item:nth-child(2)::before,
.rank-item:nth-child(3)::before {
  content: '';
  position: absolute;
  left: 0; top: 8px;
  width: 3px; height: calc(100% - 16px);
  border-radius: 0 3px 3px 0;
}
.rank-item:nth-child(1)::before { background: linear-gradient(180deg, #f5c542, #d99a1f) }
.rank-item:nth-child(2)::before { background: linear-gradient(180deg, #cfd4d8, #9aa2a8) }
.rank-item:nth-child(3)::before { background: linear-gradient(180deg, #e0a878, #b87b48) }
/* 前三名的名次数字也上色 */
.rank-item:nth-child(1) .rank-no,
.rank-item:nth-child(1) .lb-no { color: #d99a1f !important; font-weight: 900 }
.rank-item:nth-child(2) .rank-no,
.rank-item:nth-child(2) .lb-no { color: #8b949c !important; font-weight: 900 }
.rank-item:nth-child(3) .rank-no,
.rank-item:nth-child(3) .lb-no { color: #b87b48 !important; font-weight: 900 }
@keyframes lwd-medal {
  0%   { transform: rotate(0) scale(1) }
  35%  { transform: rotate(-12deg) scale(1.18) }
  70%  { transform: rotate(8deg) scale(1.08) }
  100% { transform: rotate(0) scale(1) }
}
.rank-item:nth-child(1) .rank-no { animation: lwd-medal 1.1s cubic-bezier(.3,1.3,.4,1) .3s both }

/* ============ 2. 画板网格背景 ============ */
/* 原来是一条条灰线，看着像表格。改成「棋盘格 + 主次线」，
   更像像素画的辅助网格。 */
.lwdeco-grid canvas,
.paint-canvas, #board, #canvasWrap canvas {
  /* 不改画布本身，只给外层容器加背景 */
}
.lwdeco-grid {
  background-image:
    /* 每 8 格一条较深的主线 */
    linear-gradient(to right, rgba(60,48,36,.11) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(60,48,36,.11) 1px, transparent 1px),
    /* 每格一条浅线 */
    linear-gradient(to right, rgba(60,48,36,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(60,48,36,.05) 1px, transparent 1px);
  background-size: var(--g8x) var(--g8y), var(--g8x) var(--g8y), var(--gx) var(--gy), var(--gx) var(--gy);
}
html[data-theme='dark'] .lwdeco-grid {
  background-image:
    linear-gradient(to right, rgba(255,255,255,.13) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.13) 1px, transparent 1px),
    linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px);
}

/* ============ 3. 等级 / 经验条 ============ */
.lwdeco-lv {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--lwp-r);
  box-shadow: var(--lwp-sh-2);
}
.lwdeco-lv-badge {
  flex: none;
  width: 38px; height: 38px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 900; color: #fff;
  background: linear-gradient(140deg, var(--accent, #5b8def), #7fa5ff);
  box-shadow: 0 3px 10px rgba(91,141,239,.32);
  font-variant-numeric: tabular-nums;
}
.lwdeco-lv-body { flex: 1; min-width: 0 }
.lwdeco-lv-top {
  display: flex; align-items: baseline; gap: 6px;
  font-size: 13px; color: var(--text);
}
.lwdeco-lv-top b { font-weight: 800 }
.lwdeco-lv-top i {
  font-style: normal; font-size: 11.5px; color: var(--text-faint);
  margin-left: auto; font-variant-numeric: tabular-nums;
}
.lwdeco-lv-bar {
  height: 6px; margin-top: 7px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}
.lwdeco-lv-bar i {
  display: block; height: 100%; width: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent, #5b8def), #96b9ff);
  transition: width .7s cubic-bezier(.2,.9,.3,1);
  position: relative;
}
/* 流光：让进度条看着是「活的」 */
.lwdeco-lv-bar i::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.42) 50%, transparent 80%);
  background-size: 40px 100%;
  animation: lwd-stripe 1.5s linear infinite;
}
@keyframes lwd-stripe {
  from { background-position: -40px 0 }
  to   { background-position: 120px 0 }
}

/* ============ 4. 聊天「正在输入」 ============ */
.lwdeco-typing {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 7px 11px;
  border-radius: 14px 14px 14px 4px;
  background: var(--surface-2);
}
.lwdeco-typing i {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--text-faint);
  animation: lwd-dot 1.15s ease-in-out infinite;
}
.lwdeco-typing i:nth-child(2) { animation-delay: .16s }
.lwdeco-typing i:nth-child(3) { animation-delay: .32s }
@keyframes lwd-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: .5 }
  30%           { transform: translateY(-4px); opacity: 1 }
}

/* ============ 5. 作品放大过渡 ============ */
/* 点缩略图时给它一个「飞出去」的观感。用 view-transition 不行（兼容差），
   所以用手写：给元素加类，它自己放大淡出，同时浮层淡入。 */
.lwdeco-zoom-out {
  animation: lwd-zoom-out .26s cubic-bezier(.3,.9,.4,1) forwards;
  z-index: 9999;
  position: relative;
}
@keyframes lwd-zoom-out {
  to { opacity: 0; transform: scale(1.18) }
}
.lwdeco-overlay-in {
  animation: lwd-overlay-in .3s cubic-bezier(.2,1.1,.4,1) both;
}
@keyframes lwd-overlay-in {
  from { opacity: 0; transform: scale(.9) }
  60%  { opacity: 1; transform: scale(1.012) }
  to   { opacity: 1; transform: none }
}

/* ============ 6. 下拉刷新 ============ */
#lwdecoPtr {
  position: fixed;
  top: 0; left: 50%;
  z-index: 120;
  width: 34px; height: 34px;
  margin-left: -17px;
  border-radius: 50%;
  background: var(--surface, #fff);
  box-shadow: var(--lwp-sh-3);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-faint);
  font-size: 15px;
  opacity: 0;
  transform: translateY(-46px);
  pointer-events: none;
  transition: opacity .18s, transform .22s cubic-bezier(.2,1.2,.4,1);
}
#lwdecoPtr.on { opacity: 1; transform: translateY(12px) }
#lwdecoPtr.ready { color: var(--accent, #5b8def) }
#lwdecoPtr.spin { animation: lwd-spin .7s linear infinite }
@keyframes lwd-spin { to { transform: rotate(360deg) } }
/* 转起来的时候不要再被 translate 覆盖 */
#lwdecoPtr.spin { transform: translateY(12px) }

/* ============ 7. 新手引导光圈 ============ */
#lwdecoGuide {
  position: fixed;
  inset: 0;
  z-index: 99995;
  pointer-events: none;
  opacity: 0;
  transition: opacity .22s;
}
#lwdecoGuide.on { opacity: 1 }
#lwdecoGuide .hole {
  position: absolute;
  border-radius: 14px;
  box-shadow: 0 0 0 9999px rgba(24,18,12,.62), 0 0 0 2px var(--accent, #5b8def) inset;
  transition: all .3s cubic-bezier(.2,.9,.3,1);
}
#lwdecoGuide .bubble {
  position: absolute;
  max-width: 250px;
  padding: 11px 14px;
  border-radius: var(--lwp-r-sm);
  background: var(--surface, #fff);
  color: var(--text);
  font-size: 13px;
  line-height: 1.65;
  box-shadow: var(--lwp-sh-4);
  transition: all .3s cubic-bezier(.2,.9,.3,1);
}
#lwdecoGuide .b-head {
  display: flex; align-items: baseline; gap: 8px;
  margin-bottom: 5px;
}
#lwdecoGuide .b-head b { font-weight: 800; font-size: 13.5px; }
#lwdecoGuide .b-step {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}
#lwdecoGuide .b-text {
  color: var(--text-muted);
  line-height: 1.7;
  font-size: 12.5px;
}
#lwdecoGuide .b-acts {
  display: flex;
  gap: 8px;
  margin-top: 11px;
}
#lwdecoGuide .b-acts button {
  flex: 1;
  padding: 8px 0;
  border: 0; border-radius: 999px;
  font-family: inherit; font-size: 12.5px; font-weight: 800;
  cursor: pointer; pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
}
#lwdecoGuide .b-acts .go {
  background: var(--accent, #5b8def); color: #fff;
}
#lwdecoGuide .b-acts .go:active { transform: scale(.96); }
#lwdecoGuide .b-acts .skip {
  flex: 0 0 auto;
  padding-left: 14px; padding-right: 14px;
  background: var(--surface-2, #f6f2ea);
  color: var(--text-faint);
  border: 1px solid var(--border, #efe7da);
}
/* 气泡宽一点，否则「1 / 8」和按钮会挤 */
#lwdecoGuide .bubble { max-width: 270px; }

/* ---------- 沉浸模式 ----------
   给「全站逛一遍」用的：遮罩更暗、气泡更大、有进度条和进度点、
   还能上一步。普通引导不受影响。 */
#lwdecoGuide.immersive .hole {
  box-shadow: 0 0 0 9999px rgba(16,11,6,.82), 0 0 0 2px var(--accent, #5b8def) inset,
              0 0 22px 4px rgba(91,141,239,.35);
}
#lwdecoGuide.immersive .bubble {
  max-width: 320px;
  padding: 16px 16px 14px;
  border-radius: 16px;
  box-shadow: 0 18px 50px rgba(0,0,0,.42);
  animation: lwdeco-tour-in .32s cubic-bezier(.2,1.25,.4,1) both;
}
@keyframes lwdeco-tour-in {
  from { opacity: 0; transform: translateY(14px) scale(.96) }
  to   { opacity: 1; transform: none }
}
#lwdecoGuide.immersive .b-head b { font-size: 15.5px }
#lwdecoGuide.immersive .b-text { font-size: 13.5px; line-height: 1.85 }
/* 顶部进度条 */
#lwdecoGuide .b-prog {
  height: 3px;
  margin: -4px -4px 11px;
  border-radius: 999px;
  background: var(--border, #efe7da);
  overflow: hidden;
}
#lwdecoGuide .b-prog i {
  display: block;
  height: 100%;
  width: 0;
  border-radius: 999px;
  background: var(--accent, #5b8def);
  transition: width .3s cubic-bezier(.2,.9,.3,1);
}
/* 进度点 */
#lwdecoGuide .b-dots {
  display: flex;
  gap: 5px;
  margin-top: 11px;
  justify-content: center;
}
#lwdecoGuide .b-dots i {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--border-strong, #ded4c6);
}
#lwdecoGuide .b-dots i.on { background: var(--accent, #5b8def); transform: scale(1.35) }
#lwdecoGuide .b-dots i.done { background: var(--accent, #5b8def); opacity: .45 }
/* 上一步 */
#lwdecoGuide .b-acts .prev {
  flex: 0 0 auto;
  padding-left: 14px; padding-right: 14px;
  background: none;
  border: 1px solid var(--border, #efe7da);
  color: var(--text-muted);
}

/* ============ 8. 拖动吸附提示 ============ */
.lwdeco-snap {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  border-radius: 3px;
  background: rgba(91,141,239,.85);
  animation: lwd-snap .45s ease-out forwards;
}
@keyframes lwd-snap {
  0%   { opacity: 1; transform: scaleX(1) }
  100% { opacity: 0; transform: scaleX(1.5) }
}

/* ============ 9. 音频可视化（音效开关旁的小波形） ============ */
.lwdeco-wave { display: inline-flex; align-items: flex-end; gap: 2px; height: 14px }
.lwdeco-wave i {
  width: 2.5px;
  background: var(--accent, #5b8def);
  border-radius: 2px;
  animation: lwd-wave .9s ease-in-out infinite;
}
.lwdeco-wave i:nth-child(1) { height: 5px;  animation-delay: 0s }
.lwdeco-wave i:nth-child(2) { height: 11px; animation-delay: .15s }
.lwdeco-wave i:nth-child(3) { height: 7px;  animation-delay: .3s }
.lwdeco-wave i:nth-child(4) { height: 13px; animation-delay: .45s }
@keyframes lwd-wave {
  0%, 100% { transform: scaleY(.42) }
  50%      { transform: scaleY(1) }
}
.lwdeco-wave.off i { animation: none; height: 3px; opacity: .35 }

/* ============ 10. 雨雪落地溅开 ============ */
/* 给小镇页的天气加一层溅落效果。天气画布是 JS 画的，
   这里只提供类名和关键帧，具体由 town.js 决定要不要用。 */
.lwdeco-splash {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  border: 1px solid rgba(200,225,255,.7);
  animation: lwd-splash .4s ease-out forwards;
  pointer-events: none;
}
@keyframes lwd-splash {
  from { opacity: .8; transform: scale(.4) }
  to   { opacity: 0;  transform: scale(2.6) }
}

@media (prefers-reduced-motion: reduce) {
  .lwdeco-lv-bar i::after,
  .rank-item:nth-child(1) .rank-no,
  .lwdeco-typing i,
  .lwdeco-wave i,
  #lwdecoPtr.spin { animation: none !important }
}
`

  function inject() {
    if (document.getElementById('lwdeco-style')) return
    var st = document.createElement('style')
    st.id = 'lwdeco-style'
    st.textContent = CSS
    ;(document.head || document.documentElement).appendChild(st)
  }
  inject()

  function el(tag, cls, html) {
    var d = document.createElement(tag)
    if (cls) d.className = cls
    if (html != null) d.innerHTML = html
    return d
  }

  /* ================= 等级 / 经验 =================
     站里没有等级系统，所以用已有的数据算一个「小镇等级」：
     发布作品数、创作天数、收到的光尘、成就数各有权重。
     纯前端展示，不改后端，也不影响任何已有逻辑。 */
  var LEVELS = [
    { n: 1, t: '路人', need: 0 },
    { n: 2, t: '常客', need: 30 },
    { n: 3, t: '住户', need: 90 },
    { n: 4, t: '装潢师', need: 200 },
    { n: 5, t: '画师', need: 380 },
    { n: 6, t: '名画师', need: 650 },
    { n: 7, t: '镇长', need: 1000 },
    { n: 8, t: '传说', need: 1500 },
  ]

  function expOf(s) {
    s = s || {}
    return (
      (Number(s.works) || 0) * 8 +
      (Number(s.days) || 0) * 3 +
      Math.round((Number(s.dust) || 0) * 0.35) +
      (Number(s.ach) || 0) * 2
    )
  }

  function levelOf(exp) {
    var cur = LEVELS[0]
    for (var i = 0; i < LEVELS.length; i++) {
      if (exp >= LEVELS[i].need) cur = LEVELS[i]
    }
    var next = null
    for (var j = 0; j < LEVELS.length; j++) {
      if (LEVELS[j].need > cur.need) { next = LEVELS[j]; break }
    }
    return { cur: cur, next: next }
  }

  /**
   * 渲染一个等级条。
   * @param {object} stats { works, days, dust, ach }
   * @returns {HTMLElement}
   */
  function levelBar(stats) {
    var exp = expOf(stats)
    var L = levelOf(exp)
    var box = el('div', 'lwdeco-lv')
    var from = L.cur.need
    var to = L.next ? L.next.need : L.cur.need
    var pct = L.next ? Math.max(0, Math.min(100, ((exp - from) / (to - from)) * 100)) : 100
    box.innerHTML =
      '<div class="lwdeco-lv-badge">' + L.cur.n + '</div>' +
      '<div class="lwdeco-lv-body">' +
      '<div class="lwdeco-lv-top">' +
      '<b>' + L.cur.t + '</b>' +
      '<i>' + (L.next ? exp + ' / ' + to + ' 经验' : '已满级 · ' + exp + ' 经验') + '</i>' +
      '</div>' +
      '<div class="lwdeco-lv-bar"><i></i></div>' +
      '</div>'
    // 下一帧再设宽度，让过渡动画跑起来
    requestAnimationFrame(function () {
      var bar = box.querySelector('.lwdeco-lv-bar i')
      if (bar) bar.style.width = pct.toFixed(1) + '%'
    })
    return box
  }

  /* ================= 下拉刷新 ================= */
  function initPullRefresh() {
    if (reduce) return
    try {
      if (!window.matchMedia('(pointer: coarse)').matches) return
    } catch (e) { return }

    var ind = null
    var startY = 0
    var pulling = false
    var dist = 0
    var THRESHOLD = 68

    function indicator() {
      if (!ind) {
        ind = el('div', '', '↓')
        ind.id = 'lwdecoPtr'
        document.body.appendChild(ind)
      }
      return ind
    }

    document.addEventListener(
      'touchstart',
      function (e) {
        // 只有已经滚到顶部才触发
        var y = window.scrollY || document.documentElement.scrollTop || 0
        if (y > 2 || e.touches.length !== 1) return
        // 输入框上不要触发（会跟选择文字打架）
        var t = e.target
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
        startY = e.touches[0].clientY
        pulling = true
        dist = 0
      },
      { passive: true }
    )

    document.addEventListener(
      'touchmove',
      function (e) {
        if (!pulling) return
        var y = window.scrollY || document.documentElement.scrollTop || 0
        if (y > 2) { pulling = false; hide(); return }
        dist = e.touches[0].clientY - startY
        if (dist <= 0) { hide(); return }
        var i = indicator()
        i.classList.add('on')
        i.classList.toggle('ready', dist > THRESHOLD)
        i.textContent = dist > THRESHOLD ? '↻' : '↓'
        i.style.transform = 'translateY(' + Math.min(12 + dist / 3.2, 74) + 'px) rotate(' + dist * 1.6 + 'deg)'
      },
      { passive: true }
    )

    function hide() {
      if (!ind) return
      ind.classList.remove('on', 'ready', 'spin')
      ind.style.transform = ''
    }

    document.addEventListener(
      'touchend',
      function () {
        if (!pulling) return
        pulling = false
        if (dist > THRESHOLD) {
          var i = indicator()
          i.classList.add('spin')
          i.textContent = '↻'
          // 站内没有「重新拉数据」的统一入口，所以直接整页刷新。
          // SPA 里整页刷新会重拉脚本，慢一点，但行为最可预期。
          setTimeout(function () { location.reload() }, 260)
        } else {
          hide()
        }
        dist = 0
      },
      { passive: true }
    )
  }

  /* ================= 新手引导光圈 ================= */
  var guideEl = null

  /* 引导浮层。
     ★ 每次调用都**重建** DOM，不在同一个元素上反复 addEventListener ——
       之前是复用 guideEl，结果每弹一次引导就在它身上多叠一个 click 监听，
       点一下会触发好几次，看似「点了没反应」。
     ★ 按钮的监听**立即绑定**，不等布局完成。
       之前按钮是放在 setTimeout(340ms) 里创建并绑定的，
       那 340 毫秒内点它完全无效 —— 用户点了没反应就再点，
       于是要「点很多次」才跳过。
     ★ 带「跳过」和步骤计数。8 步的引导要按 8 次「下一步」才出得去，
       没有一键跳过太折磨人。 */
  function guide(steps, opts) {
    if (!steps || !steps.length) return
    var o = opts || {}

    // 上一次没关干净就先收掉，避免两层浮层叠着
    var old = document.getElementById('lwdecoGuide')
    if (old && old.parentNode) old.parentNode.removeChild(old)

    var idx = 0
    var closed = false
    var pendingTimer = 0

    var wrap = document.createElement('div')
    wrap.id = 'lwdecoGuide'
    wrap.innerHTML =
      '<div class="hole"></div>' +
      '<div class="bubble">' +
      '<div class="b-prog"><i></i></div>' +
      '<div class="b-head"><b class="b-title"></b><span class="b-step"></span></div>' +
      '<div class="b-text"></div>' +
      '<div class="b-dots"></div>' +
      '<div class="b-acts">' +
      '<button class="prev" type="button" hidden>上一步</button>' +
      '<button class="skip" type="button">跳过</button>' +
      '<button class="go" type="button">下一步</button>' +
      '</div>' +
      '</div>'
    document.body.appendChild(wrap)
    if (o.immersive) wrap.classList.add('immersive')

    var hole = wrap.querySelector('.hole')
    var bubble = wrap.querySelector('.bubble')
    var bTitle = wrap.querySelector('.b-title')
    var bStep = wrap.querySelector('.b-step')
    var bText = wrap.querySelector('.b-text')
    var btnGo = wrap.querySelector('.go')
    var btnSkip = wrap.querySelector('.skip')
    var btnPrev = wrap.querySelector('.prev')
    var progBar = wrap.querySelector('.b-prog')
    var progFill = wrap.querySelector('.b-prog i')
    var dotsBox = wrap.querySelector('.b-dots')

    function clearHL() {
      var prev = document.querySelector('.lwdeco-hl')
      if (prev) prev.classList.remove('lwdeco-hl')
    }

    function onDocClick(e) {
      if (closed) return
      if (bubble.contains(e.target)) return
      close()
    }

    function close() {
      if (closed) return
      closed = true
      if (pendingTimer) clearTimeout(pendingTimer)
      document.removeEventListener('click', onDocClick, true)
      clearHL()
      wrap.classList.remove('on')
      setTimeout(function () {
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap)
      }, 220)
      if (o.onDone) o.onDone()
    }

    function next() {
      if (closed) return
      idx++
      if (idx >= steps.length) return close()
      show()
    }

    /* 先按当前这一步把内容写进去，再等下一帧量位置。
       内容和按钮在「写进去」时就生效，不等布局 ——
       用户手指快的话，第一帧点下去也一定有效。 */
    function show() {
      if (closed) return
      var st = steps[idx]
      if (!st) return close()

      var target = typeof st.el === 'string' ? document.querySelector(st.el) : st.el
      if (!target) {
        // 这一步的目标不在这个页面上（跨页引导常见），直接跳到下一步
        // 用 setTimeout 而不是同步递归，避免一长串都不存在时爆栈
        return setTimeout(next, 0)
      }

      clearHL()
      target.classList.add('lwdeco-hl')
      try {
        target.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
      } catch (e) {}

      bTitle.textContent = st.title || ''
      bText.textContent = st.text || ''
      /* 进度可以外部指定 —— 跨页总引导每一步是单独一次 guide() 调用，
         它自己只知道「1 / 1」，得让调用方告诉它整趟走到哪了。 */
      var pi = o.progress ? o.progress.i : idx
      var pn = o.progress ? o.progress.n : steps.length
      bStep.textContent = (pi + 1) + ' / ' + pn
      if (progFill) progFill.style.width = Math.round(((pi + 1) / pn) * 100) + '%'
      if (progBar) progBar.hidden = pn <= 1
      if (dotsBox) {
        dotsBox.hidden = pn <= 1 || !o.immersive
        if (!dotsBox.hidden) {
          dotsBox.innerHTML = ''
          for (var d = 0; d < pn; d++) {
            var dot = document.createElement('i')
            if (d < pi) dot.className = 'done'
            else if (d === pi) dot.className = 'on'
            dotsBox.appendChild(dot)
          }
        }
      }
      btnGo.textContent = pi === pn - 1 ? o.doneText || '知道了' : (o.nextText || '下一步')
      btnSkip.hidden = false
      btnSkip.textContent = o.immersive ? '退出' : '跳过'
      if (btnPrev) {
        /* 只在沉浸模式下给上一步 —— 普通引导就一两步，加了反而碍事 */
        btnPrev.hidden = !o.immersive || pi === 0 || !o.onPrev
      }
      wrap.classList.add('on')
      // 先把气泡放到一个可见的兜底位置，量完再摆正 —— 避免第一帧闪在左上角
      bubble.style.cssText = 'left:12px;top:12px;visibility:hidden'

      if (pendingTimer) clearTimeout(pendingTimer)
      pendingTimer = setTimeout(function () {
        if (closed) return
        var r = target.getBoundingClientRect()
        var pad = st.pad == null ? 6 : st.pad
        hole.style.cssText =
          'left:' + (r.left - pad) + 'px;top:' + (r.top - pad) + 'px;' +
          'width:' + (r.width + pad * 2) + 'px;height:' + (r.height + pad * 2) + 'px;'
        var bh = bubble.offsetHeight || 140
        var below = r.bottom + 12
        var top = below + bh < window.innerHeight ? below : Math.max(12, r.top - bh - 12)
        var left = Math.max(12, Math.min(window.innerWidth - (bubble.offsetWidth || 250) - 12, r.left))
        bubble.style.cssText = 'left:' + left + 'px;top:' + top + 'px;'
      }, reduce ? 0 : 60)
    }

    btnGo.addEventListener('click', function (e) {
      e.stopPropagation()
      e.preventDefault()
      next()
    })
    if (btnPrev) {
      btnPrev.addEventListener('click', function (e) {
        e.stopPropagation()
        e.preventDefault()
        if (o.onPrev) o.onPrev()
      })
    }
    btnSkip.addEventListener('click', function (e) {
      e.stopPropagation()
      e.preventDefault()
      close()
    })
    /* 点气泡以外的地方也跳过。
       浮层本身不能吃 pointer-events（否则挡住画布），所以不挂在浮层上，
       改挂 document 并用 capture —— 这样盖在下面的按钮不会被误触。 */
    document.addEventListener('click', onDocClick, true)

    show()
  }

  /* ================= 吸附提示 ================= */
  /** 在容器里画一条吸附线，400ms 后自己消失 */
  function snapLine(container, x, y, vertical) {
    if (!container || reduce) return
    var l = el('div', 'lwdeco-snap')
    if (vertical) {
      l.style.cssText = 'left:' + x + 'px;top:' + (y - 22) + 'px;width:2px;height:44px'
    } else {
      l.style.cssText = 'left:' + (x - 22) + 'px;top:' + y + 'px;width:44px;height:2px'
    }
    container.appendChild(l)
    setTimeout(function () { if (l.parentNode) l.parentNode.removeChild(l) }, 460)
  }

  /* ================= 音频可视化 ================= */
  function waveEl(on) {
    var w = el('span', 'lwdeco-wave' + (on === false ? ' off' : ''), '<i></i><i></i><i></i><i></i>')
    return w
  }
  function setWave(w, on) {
    if (!w) return
    w.classList.toggle('off', !on)
  }

  /* ================= 正在输入 ================= */
  function typingEl() {
    return el('div', 'lwdeco-typing', '<i></i><i></i><i></i>')
  }

  /* ================= 启动 ================= */
  function start() {
    initPullRefresh()
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()

  /* ================= 对外接口 ================= */
  window.LWDeco = {
    levelBar: levelBar,
    levelOf: function (stats) { return levelOf(expOf(stats)) },
    expOf: expOf,
    guide: guide,
    snapLine: snapLine,
    wave: waveEl,
    setWave: setWave,
    typing: typingEl,
    /** 把画布容器变成带主次线的网格背景。cell 是一格的像素尺寸 */
    gridBg: function (container, cell, count) {
      if (!container || !cell) return
      var c = Number(count) || 16
      container.classList.add('lwdeco-grid')
      container.style.setProperty('--gx', cell + 'px')
      container.style.setProperty('--gy', cell + 'px')
      container.style.setProperty('--g8x', cell * 8 + 'px')
      container.style.setProperty('--g8y', cell * 8 + 'px')
    },
    /** 作品放大过渡：给缩略图加类，浮层加另一个类 */
    zoomOut: function (el) {
      if (!el || reduce) return
      el.classList.add('lwdeco-zoom-out')
      setTimeout(function () { el.classList.remove('lwdeco-zoom-out') }, 300)
    },
    overlayIn: function (el) {
      if (!el || reduce) return
      el.classList.add('lwdeco-overlay-in')
    },
    reduced: function () { return reduce },
  }
})()
