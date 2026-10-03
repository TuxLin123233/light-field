// 装饰与功能增强层（第四层）
//
// 前三层：lw-anim 管「动」、lw-polish 管「静」、lw-fx 管「手感」。
// 这一层补的是「具体场景的样子」——奖牌、网格、等级条、
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

/* ============ 6. 拖动吸附提示 ============ */
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

/* ============ 7. 音频可视化（音效开关旁的小波形） ============ */
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

/* ============ 8. 雨雪落地溅开 ============ */
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


  /* ================= 对外接口 ================= */
  window.LWDeco = {
    levelBar: levelBar,
    levelOf: function (stats) { return levelOf(expOf(stats)) },
    expOf: expOf,
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
