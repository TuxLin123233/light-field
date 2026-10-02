// 全局动画层
//
// 一次覆盖全站，不用每个视图各写一遍。
// 加载后自动生效，页面不需要改代码。
//
// 包含：
//   1. 入场动画（弹入 / 淡入 / 交错列表）
//   2. 按钮按下反馈（缩放 + 涟漪）
//   3. 视图切换过渡
//   4. 数字滚动
//   5. 骨架屏微光
//   6. 角标脉冲
//   7. 成功/失败抖动
//   8. 一堆可直接用的工具类
//
// ★ 全部受 prefers-reduced-motion 控制：用户在系统里开了「减弱动态效果」，
//   一律不动。这不是可选项 —— 前庭功能障碍的人会因此头晕恶心。

;(function () {
  if (window.__lwAnim) return
  window.__lwAnim = true

  var STYLE_ID = 'lw-anim-style'
  var reduce = false
  try {
    reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    // 用户随时可能去系统里改，跟着变
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.addEventListener) mq.addEventListener('change', function (e) { reduce = e.matches })
  } catch (e) {}

  var CSS = `
/* ============ 关键帧 ============ */
@keyframes lwa-fade      { from { opacity: 0 } to { opacity: 1 } }
@keyframes lwa-up        { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@keyframes lwa-down      { from { opacity: 0; transform: translateY(-14px) } to { opacity: 1; transform: none } }
@keyframes lwa-left      { from { opacity: 0; transform: translateX(18px) } to { opacity: 1; transform: none } }
@keyframes lwa-right     { from { opacity: 0; transform: translateX(-18px) } to { opacity: 1; transform: none } }
@keyframes lwa-pop       { 0% { opacity: 0; transform: scale(.86) }
                           60% { opacity: 1; transform: scale(1.04) }
                           100% { opacity: 1; transform: none } }
@keyframes lwa-zoom      { from { opacity: 0; transform: scale(.94) } to { opacity: 1; transform: none } }
@keyframes lwa-flip      { from { opacity: 0; transform: perspective(600px) rotateX(-14deg) translateY(10px) }
                           to { opacity: 1; transform: none } }

/* 呼吸：光晕一圈圈散出去，给「有更新」之类的标记用 */
@keyframes lwa-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(91,141,239,.5) }
  70%  { box-shadow: 0 0 0 9px rgba(91,141,239,0) }
  100% { box-shadow: 0 0 0 0 rgba(91,141,239,0) }
}
/* 心跳：角标上的小红点 */
@keyframes lwa-beat {
  0%, 100% { transform: scale(1) }
  14%      { transform: scale(1.28) }
  28%      { transform: scale(1) }
  42%      { transform: scale(1.18) }
  56%      { transform: scale(1) }
}
/* 左右摇：密码错、操作失败 */
@keyframes lwa-shake {
  0%, 100% { transform: translateX(0) }
  15%      { transform: translateX(-7px) }
  30%      { transform: translateX(6px) }
  45%      { transform: translateX(-5px) }
  60%      { transform: translateX(4px) }
  80%      { transform: translateX(-2px) }
}
/* 上下弹：成功提示 */
@keyframes lwa-bounce {
  0%   { transform: translateY(0) }
  30%  { transform: translateY(-11px) }
  50%  { transform: translateY(0) }
  70%  { transform: translateY(-5px) }
  100% { transform: translateY(0) }
}
/* 骨架屏的微光扫过 */
@keyframes lwa-shimmer {
  0%   { background-position: -320px 0 }
  100% { background-position: 320px 0 }
}
/* 转圈 */
@keyframes lwa-spin { to { transform: rotate(360deg) } }
/* 涟漪 */
@keyframes lwa-ripple {
  from { opacity: .5; transform: scale(0) }
  to   { opacity: 0;  transform: scale(1) }
}
/* 颜色闪烁：高亮定位到某条内容时用 */
@keyframes lwa-flash {
  0%, 100% { background-color: transparent }
  25%      { background-color: rgba(91,141,239,.16) }
  60%      { background-color: rgba(91,141,239,.1) }
}
/* 轻微浮动：空状态图标 */
@keyframes lwa-float {
  0%, 100% { transform: translateY(0) }
  50%      { transform: translateY(-7px) }
}
/* 进度条流光 */
@keyframes lwa-stripe {
  from { background-position: 0 0 }
  to   { background-position: 40px 0 }
}

/* ============ 可直接用的工具类 ============ */
.lwa-fade  { animation: lwa-fade  .3s ease-out both }
.lwa-up    { animation: lwa-up    .34s cubic-bezier(.2,1.15,.4,1) both }
.lwa-down  { animation: lwa-down  .34s cubic-bezier(.2,1.15,.4,1) both }
.lwa-left  { animation: lwa-left  .34s cubic-bezier(.2,1.15,.4,1) both }
.lwa-right { animation: lwa-right .34s cubic-bezier(.2,1.15,.4,1) both }
.lwa-pop   { animation: lwa-pop   .4s  cubic-bezier(.2,1.3,.4,1) both }
.lwa-zoom  { animation: lwa-zoom  .28s ease-out both }
.lwa-flip  { animation: lwa-flip  .42s cubic-bezier(.2,1.1,.4,1) both }
.lwa-pulse { animation: lwa-pulse 1.8s ease-out infinite }
.lwa-beat  { animation: lwa-beat  1.6s ease-in-out infinite }
.lwa-shake { animation: lwa-shake .5s  ease-in-out }
.lwa-bounce{ animation: lwa-bounce .7s cubic-bezier(.3,1.2,.5,1) }
.lwa-float { animation: lwa-float 2.6s ease-in-out infinite }
.lwa-flash { animation: lwa-flash 1.1s ease-in-out 2 }

/* 交错入场：容器加 .lwa-stagger，子元素依次出现 */
.lwa-stagger > * { animation: lwa-up .36s cubic-bezier(.2,1.15,.4,1) both }
.lwa-stagger > *:nth-child(1)  { animation-delay: .00s }
.lwa-stagger > *:nth-child(2)  { animation-delay: .04s }
.lwa-stagger > *:nth-child(3)  { animation-delay: .08s }
.lwa-stagger > *:nth-child(4)  { animation-delay: .12s }
.lwa-stagger > *:nth-child(5)  { animation-delay: .16s }
.lwa-stagger > *:nth-child(6)  { animation-delay: .20s }
.lwa-stagger > *:nth-child(7)  { animation-delay: .24s }
.lwa-stagger > *:nth-child(8)  { animation-delay: .28s }
.lwa-stagger > *:nth-child(9)  { animation-delay: .32s }
.lwa-stagger > *:nth-child(10) { animation-delay: .36s }
.lwa-stagger > *:nth-child(n+11) { animation-delay: .4s }

/* 骨架屏 */
.lwa-skel {
  background: linear-gradient(90deg, rgba(0,0,0,.055) 25%, rgba(0,0,0,.11) 37%, rgba(0,0,0,.055) 63%);
  background-size: 320px 100%;
  animation: lwa-shimmer 1.25s linear infinite;
  border-radius: 8px;
  color: transparent !important;
}
html[data-theme='dark'] .lwa-skel {
  background: linear-gradient(90deg, rgba(255,255,255,.07) 25%, rgba(255,255,255,.14) 37%, rgba(255,255,255,.07) 63%);
  background-size: 320px 100%;
}

/* 转圈加载 */
.lwa-spin {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: lwa-spin .7s linear infinite;
  vertical-align: -2px;
}

/* ============ 按钮按下反馈 ============ */
/* 所有可点元素统一加一点按下缩放。用 :active 而不是 JS，
   这样连动态生成的按钮也自动有，不用重新绑定。 */
button:not(:disabled):active,
[role='button']:active,
.lwa-tap:active {
  transform: scale(.955);
}
button, [role='button'], .lwa-tap {
  transition: transform .12s ease-out, opacity .15s;
  /* 点的时候不要弹系统菜单，和全局禁选配套 */
  -webkit-tap-highlight-color: transparent;
}

/* 涟漪容器 */
.lwa-rip-host { position: relative; overflow: hidden }
.lwa-rip {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  pointer-events: none;
  animation: lwa-ripple .55s ease-out forwards;
}

/* ============ 视图切换 ============ */
/* 路由切换时给页面内容一个淡入上浮。@vue-router 换掉视图后
   根元素是新节点，所以这动画每次都会重放。 */
.page { animation: lwa-fade .22s ease-out both }
#app > * > .page { animation: lwa-up .28s cubic-bezier(.2,1.1,.4,1) both }

/* ============ 滚动进入视口才播 ============ */
.lwa-io { opacity: 0; transform: translateY(16px); transition: opacity .4s ease-out, transform .45s cubic-bezier(.2,1.1,.4,1) }
.lwa-io.lwa-in { opacity: 1; transform: none }

@media (prefers-reduced-motion: reduce) {
  .lwa-fade, .lwa-up, .lwa-down, .lwa-left, .lwa-right, .lwa-pop, .lwa-zoom, .lwa-flip,
  .lwa-pulse, .lwa-beat, .lwa-shake, .lwa-bounce, .lwa-float, .lwa-flash, .lwa-spin,
  .page, #app > * > .page, .lwa-stagger > * {
    animation: none !important;
  }
  .lwa-io { opacity: 1 !important; transform: none !important }
  button:active, [role='button']:active { transform: none !important }
  .lwa-skel { animation: none !important }
}
`

  function inject() {
    if (document.getElementById(STYLE_ID)) return
    var st = document.createElement('style')
    st.id = STYLE_ID
    st.textContent = CSS
    ;(document.head || document.documentElement).appendChild(st)
  }
  inject()

  /* ---------------- 涟漪 ---------------- */
  /* 只给背景简单的按钮加，不然涟漪会被子元素盖住看不出来。
     用事件委托，动态生成的按钮也自动有。 */
  document.addEventListener(
    'pointerdown',
    function (e) {
      if (reduce) return
      var el = e.target && e.target.closest
        ? e.target.closest('button, [role="button"], .lwa-tap')
        : null
      if (!el || el.disabled) return
      var cs = getComputedStyle(el)
      if (cs.position === 'static') el.style.position = 'relative'
      if (cs.overflow === 'visible') el.style.overflow = 'hidden'
      var r = el.getBoundingClientRect()
      var d = Math.max(r.width, r.height) * 1.6
      var rip = document.createElement('span')
      rip.className = 'lwa-rip'
      rip.style.width = rip.style.height = d + 'px'
      rip.style.left = e.clientX - r.left - d / 2 + 'px'
      rip.style.top = e.clientY - r.top - d / 2 + 'px'
      el.appendChild(rip)
      setTimeout(function () {
        if (rip.parentNode) rip.parentNode.removeChild(rip)
      }, 600)
    },
    { passive: true, capture: true }
  )

  /* ---------------- 滚动进入视口 ---------------- */
  var io = null
  function observeAll() {
    if (reduce || !window.IntersectionObserver) return
    if (!io) {
      io = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              entries[i].target.classList.add('lwa-in')
              io.unobserve(entries[i].target)
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
      )
    }
    var els = document.querySelectorAll('.lwa-io:not(.lwa-in)')
    for (var i = 0; i < els.length; i++) io.observe(els[i])
  }

  /* ---------------- 自动交错 ---------------- */
  /* 列表/网格容器里如果直接子元素超过 3 个，自动加交错入场。
     只做一次，避免每次重绘都重放动画。 */
  var AUTO_SEL = '.gallery-grid, .mine-grid, .tw-items, .u-grid, .tk-list, .u-ach-list, .tw-grid, .mail-row'
  function autoStagger() {
    if (reduce) return
    var hosts = document.querySelectorAll(AUTO_SEL)
    for (var i = 0; i < hosts.length; i++) {
      var h = hosts[i]
      if (h.dataset.lwaStagger === '1') continue
      if (h.children.length < 3) continue
      h.dataset.lwaStagger = '1'
      h.classList.add('lwa-stagger')
      // 动画播完就把类摘掉，免得后续增删元素又重放
      setTimeout(function (el) {
        return function () { el.classList.remove('lwa-stagger') }
      }(h), 1000)
    }
  }

  /* ---------------- 数字滚动 ---------------- */
  /* 给元素加 data-lwa-count="目标值"，数字会从当前值滚到目标值。
     用 requestAnimationFrame 手写，不引任何库。 */
  function rollNumber(el, to, dur) {
    var from = Number(el.dataset.lwaCur)
    if (!isFinite(from)) {
      var txt = (el.textContent || '').replace(/[^\d.-]/g, '')
      from = Number(txt)
      if (!isFinite(from)) from = 0
    }
    if (from === to) {
      el.dataset.lwaCur = String(to)
      return
    }
    el.dataset.lwaCur = String(to)
    var t0 = (window.performance && performance.now) ? performance.now() : Date.now()
    var d = dur || 520
    var finished = false
    function settle() {
      if (finished) return
      finished = true
      el.textContent = String(to)
    }
    function step(now) {
      if (finished) return
      var t = (typeof now === 'number' ? now : Date.now()) - t0
      var p = Math.min(1, t / d)
      // easeOutCubic
      var e = 1 - Math.pow(1 - p, 3)
      el.textContent = String(Math.round(from + (to - from) * e))
      if (p < 1) requestAnimationFrame(step)
      else settle()
    }
    /* ★ 看门狗：requestAnimationFrame 在某些 WebView 里根本不触发
       （无头浏览器、部分老安卓 WebView、页面被隐藏时也会暂停）。
       只靠 rAF 的话数字会永远停在起始值 —— 那还不如不做动画。
       所以到点强制落定成最终值，不管动画跑到哪一步。 */
    setTimeout(settle, d + 120)
    try {
      requestAnimationFrame(step)
    } catch (e) {
      settle()
    }
  }

  function autoCount() {
    if (reduce) return
    var els = document.querySelectorAll('[data-lwa-count]')
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      var to = Number(el.dataset.lwaCount)
      if (!isFinite(to)) continue
      if (el.dataset.lwaDone === String(to)) continue
      el.dataset.lwaDone = String(to)
      rollNumber(el, to)
    }
  }

  /* ---------------- 定时扫描 ---------------- */
  /* 视图是动态渲染的，MutationObserver 太吵，用低频轮询就够了。
     动画不需要毫秒级响应。 */
  var timer = 0
  function scan() {
    try {
      autoStagger()
      autoCount()
      observeAll()
    } catch (e) {}
  }
  function start() {
    if (timer) return
    timer = setInterval(scan, 500)
    scan()
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }

  /* ---------------- 对外接口 ---------------- */
  window.LWAnim = {
    /** 手动播一个动画，名字见 CSS 里的 .lwa-* */
    play: function (el, name, ms) {
      if (!el || reduce) return
      var cls = 'lwa-' + name
      el.classList.remove(cls)
      void el.offsetWidth // 强制回流，否则连续调用不重播
      el.classList.add(cls)
      if (ms !== 0) {
        setTimeout(function () { el.classList.remove(cls) }, ms || 800)
      }
    },
    /** 失败反馈：摇一摇 */
    shake: function (el) { this.play(el, 'shake', 550) },
    /** 成功反馈：弹一弹 */
    bounce: function (el) { this.play(el, 'bounce', 750) },
    /** 高亮定位：闪一下，用来指出「就是这条」 */
    flash: function (el) { this.play(el, 'flash', 2300) },
    /** 数字滚动 */
    count: function (el, to, dur) {
      if (!el) return
      if (reduce) { el.textContent = String(to); return }
      rollNumber(el, Number(to), dur)
    },
    /** 交错入场，可以手动指定容器 */
    stagger: function (el) {
      if (!el || reduce) return
      el.classList.add('lwa-stagger')
      setTimeout(function () { el.classList.remove('lwa-stagger') }, 1100)
    },
    /** 骨架屏：把一个容器变成占位骨架 */
    skeleton: function (el, on) {
      if (!el) return
      if (on) el.classList.add('lwa-skel')
      else el.classList.remove('lwa-skel')
    },
    /** 是否处于「减弱动态效果」 */
    reduced: function () { return reduce },
    /** 立刻扫一次（自己刚插了内容时调用） */
    scan: scan,
  }
})()
