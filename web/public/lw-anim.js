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

/* ============ 第二批关键帧（更丰富的入场与强调） ============ */
/* 入场变体 */
@keyframes lwa-blur-in   { from { opacity: 0; filter: blur(7px) } to { opacity: 1; filter: blur(0) } }
@keyframes lwa-scale-in  { from { opacity: 0; transform: scale(.8) } to { opacity: 1; transform: none } }
@keyframes lwa-rotate-in { from { opacity: 0; transform: rotate(-8deg) scale(.92) }
                           to { opacity: 1; transform: none } }
@keyframes lwa-skew-in   { from { opacity: 0; transform: skewY(4deg) translateY(16px) }
                           to { opacity: 1; transform: none } }
@keyframes lwa-flipY-in  { from { opacity: 0; transform: perspective(700px) rotateY(22deg) }
                           to { opacity: 1; transform: none } }
@keyframes lwa-drop-in   { 0% { opacity: 0; transform: translateY(-28px) scale(.9) }
                           55% { opacity: 1; transform: translateY(4px) scale(1.02) }
                           75% { transform: translateY(-2px) }
                           100% { opacity: 1; transform: none } }
@keyframes lwa-slide-blur { from { opacity: 0; transform: translateX(26px); filter: blur(4px) }
                            to { opacity: 1; transform: none; filter: blur(0) } }
@keyframes lwa-unfold     { from { opacity: 0; transform: scaleY(.4); transform-origin: top }
                            to { opacity: 1; transform: none } }
@keyframes lwa-expand     { from { opacity: 0; clip-path: inset(0 50% 0 50% round 12px) }
                            to { opacity: 1; clip-path: inset(0 0 0 0 round 12px) } }

/* 强调变体 */
@keyframes lwa-wobble {
  0%, 100% { transform: translateX(0) }
  15% { transform: translateX(-9px) rotate(-2deg) }
  30% { transform: translateX(7px) rotate(1.6deg) }
  45% { transform: translateX(-5px) rotate(-1deg) }
  60% { transform: translateX(3px) rotate(.6deg) }
  80% { transform: translateX(-1px) }
}
@keyframes lwa-jello {
  0%, 100% { transform: scale(1, 1) }
  22% { transform: scale(1.22, .8) }
  38% { transform: scale(.82, 1.2) }
  54% { transform: scale(1.1, .92) }
  70% { transform: scale(.95, 1.05) }
  85% { transform: scale(1.02, .98) }
}
@keyframes lwa-tada {
  0% { transform: scale(1) rotate(0) }
  10%, 20% { transform: scale(.92) rotate(-3deg) }
  30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg) }
  40%, 60%, 80% { transform: scale(1.1) rotate(-3deg) }
  100% { transform: scale(1) rotate(0) }
}
@keyframes lwa-rubber {
  0% { transform: scale(1, 1) }
  30% { transform: scale(1.26, .74) }
  40% { transform: scale(.74, 1.26) }
  50% { transform: scale(1.14, .86) }
  65% { transform: scale(.94, 1.06) }
  75% { transform: scale(1.04, .96) }
  100% { transform: scale(1, 1) }
}
@keyframes lwa-heartbeat {
  0%, 100% { transform: scale(1) }
  14% { transform: scale(1.2) }
  28% { transform: scale(1) }
  42% { transform: scale(1.14) }
  70% { transform: scale(1) }
}
@keyframes lwa-swing {
  20% { transform: rotate(14deg) }
  40% { transform: rotate(-10deg) }
  60% { transform: rotate(6deg) }
  80% { transform: rotate(-4deg) }
  100% { transform: rotate(0) }
}
@keyframes lwa-headshake {
  0% { transform: translateX(0) }
  6.5% { transform: translateX(-5px) rotateY(-9deg) }
  18.5% { transform: translateX(4px) rotateY(7deg) }
  31.5% { transform: translateX(-3px) rotateY(-5deg) }
  43.5% { transform: translateX(2px) rotateY(3deg) }
  50% { transform: translateX(0) }
}
@keyframes lwa-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(91,141,239,0) }
  50%      { box-shadow: 0 0 16px 3px rgba(91,141,239,.45) }
}
@keyframes lwa-shine {
  0%   { background-position: -220% 0 }
  100% { background-position: 320% 0 }
}
@keyframes lwa-breathe {
  0%, 100% { transform: scale(1); opacity: 1 }
  50%      { transform: scale(1.045); opacity: .88 }
}
@keyframes lwa-ring {
  0%   { transform: scale(.6); opacity: .7 }
  100% { transform: scale(1.9); opacity: 0 }
}
@keyframes lwa-typing-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: .45 }
  30%           { transform: translateY(-4px); opacity: 1 }
}

/* ============ 第二批工具类 ============ */
.lwa-blur-in   { animation: lwa-blur-in   .42s ease-out both }
.lwa-scale-in  { animation: lwa-scale-in  .3s  cubic-bezier(.2,1.2,.4,1) both }
.lwa-rotate-in { animation: lwa-rotate-in .38s cubic-bezier(.2,1.15,.4,1) both }
.lwa-skew-in   { animation: lwa-skew-in   .4s  cubic-bezier(.2,1.1,.4,1) both }
.lwa-flipY-in  { animation: lwa-flipY-in  .48s cubic-bezier(.2,1.1,.4,1) both }
.lwa-drop-in   { animation: lwa-drop-in   .52s cubic-bezier(.3,1.25,.4,1) both }
.lwa-slide-blur{ animation: lwa-slide-blur .42s ease-out both }
.lwa-unfold    { animation: lwa-unfold    .34s cubic-bezier(.2,1.15,.4,1) both }
.lwa-expand    { animation: lwa-expand    .4s  cubic-bezier(.2,1.1,.4,1) both }

.lwa-wobble    { animation: lwa-wobble    .72s ease-in-out }
.lwa-jello     { animation: lwa-jello     .72s ease-in-out }
.lwa-tada      { animation: lwa-tada      1s   ease-in-out }
.lwa-rubber    { animation: lwa-rubber    .8s  ease-out }
.lwa-heartbeat { animation: lwa-heartbeat 1.3s ease-in-out infinite }
.lwa-swing     { animation: lwa-swing     .72s ease-in-out; transform-origin: top center }
.lwa-headshake { animation: lwa-headshake .72s cubic-bezier(.36,.07,.19,.97) }
.lwa-glow      { animation: lwa-glow      2s   ease-in-out infinite }
.lwa-breathe   { animation: lwa-breathe   3s   ease-in-out infinite }

/* 掠光：给「新」标记、按钮加一道扫过的高光 */
.lwa-shine {
  position: relative;
  overflow: hidden;
}
.lwa-shine::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(100deg, transparent 35%, rgba(255,255,255,.55) 50%, transparent 65%);
  background-size: 220% 100%;
  background-repeat: no-repeat;
  animation: lwa-shine 1.8s ease-in-out infinite;
  pointer-events: none;
}
html[data-theme='dark'] .lwa-shine::after {
  background: linear-gradient(100deg, transparent 35%, rgba(255,255,255,.16) 50%, transparent 65%);
  background-size: 220% 100%;
}

/* 扩散圆环：点击、通知、聚焦 */
.lwa-ring { position: relative }
.lwa-ring::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  border: 2px solid var(--accent, #5b8def);
  animation: lwa-ring 1.4s ease-out infinite;
  pointer-events: none;
}

/* 打字点：聊天「正在输入」 */
.lwa-dots { display: inline-flex; gap: 3px; align-items: center }
.lwa-dots i {
  width: 5px; height: 5px; border-radius: 50%;
  background: currentColor;
  animation: lwa-typing-dot 1.15s ease-in-out infinite;
}
.lwa-dots i:nth-child(2) { animation-delay: .16s }
.lwa-dots i:nth-child(3) { animation-delay: .32s }

/* ============ 自动应用：更细的地方 ============ */
/* 区块标题左侧加一条会「长出来」的竖线 */
.card-title, .group-title, .mp-head h1 {
  position: relative;
}
/* 同上：卡片也只用 opacity。
   卡片里可能嵌着 fixed 的浮层（.card-overlay / .preview-overlay 都在
   .page 下、但二级页面里也有嵌在卡片里的），带 transform 会让它们
   在动画那 300ms 里跳到卡片坐标系里去。 */
.page > .card, .page > section {
  animation: lwa-fade .3s ease-out both;
}
/* 卡片依次错开，避免整页同时弹 */
.page > .card:nth-of-type(1), .page > section:nth-of-type(1) { animation-delay: .02s }
.page > .card:nth-of-type(2), .page > section:nth-of-type(2) { animation-delay: .06s }
.page > .card:nth-of-type(3), .page > section:nth-of-type(3) { animation-delay: .1s }
.page > .card:nth-of-type(4), .page > section:nth-of-type(4) { animation-delay: .14s }
.page > .card:nth-of-type(5), .page > section:nth-of-type(5) { animation-delay: .18s }
.page > .card:nth-of-type(n+6), .page > section:nth-of-type(n+6) { animation-delay: .2s }

/* 图标类元素轻微呼吸，让静态页面有生气（幅度很小，不抢注意力） */
.entry-ico, .ml-ico, .ach-ico, .tw-item canvas {
  transition: transform .22s cubic-bezier(.2,1.3,.4,1);
}
@media (hover: hover) {
  .entry:hover .entry-ico, .m-link:hover .ml-ico { transform: scale(1.14) rotate(-4deg) }
  .tw-plot:hover canvas { transform: translateY(-2px) }
}
/* 点按时的图标反馈 */
.entry:active .entry-ico, .m-link:active .ml-ico { transform: scale(.92) }

/* ============ 第三批：直接套在站内已有元素上 ============ */
/* 全部用「已有的类名」，不改视图就能生效 */

/* 作品卡片：进场时轻轻浮起 + 缩放入场。用 :nth-child 做前几个错开 */
@keyframes lwa-card-in {
  from { opacity: 0; transform: translateY(10px) scale(.97) }
  to   { opacity: 1; transform: none }
}
.card, .mine-item, .tw-item, .bg-item, .mp-row, .mod-row {
  animation: lwa-card-in .34s cubic-bezier(.2,1.12,.4,1) both;
}
/* 只给前 12 个错开，再多就一起出现，不然往下滚要等很久才看到内容 */
.card:nth-child(1), .mine-item:nth-child(1), .tw-item:nth-child(1) { animation-delay: .01s }
.card:nth-child(2), .mine-item:nth-child(2), .tw-item:nth-child(2) { animation-delay: .04s }
.card:nth-child(3), .mine-item:nth-child(3), .tw-item:nth-child(3) { animation-delay: .07s }
.card:nth-child(4), .mine-item:nth-child(4), .tw-item:nth-child(4) { animation-delay: .1s }
.card:nth-child(5), .mine-item:nth-child(5), .tw-item:nth-child(5) { animation-delay: .13s }
.card:nth-child(6), .mine-item:nth-child(6), .tw-item:nth-child(6) { animation-delay: .16s }
.card:nth-child(7), .mine-item:nth-child(7), .tw-item:nth-child(7) { animation-delay: .19s }
.card:nth-child(8), .mine-item:nth-child(8), .tw-item:nth-child(8) { animation-delay: .22s }
.card:nth-child(9), .mine-item:nth-child(9), .tw-item:nth-child(9) { animation-delay: .25s }
.card:nth-child(10), .mine-item:nth-child(10), .tw-item:nth-child(10) { animation-delay: .28s }
.card:nth-child(11), .mine-item:nth-child(11), .tw-item:nth-child(11) { animation-delay: .31s }
.card:nth-child(n+12), .mine-item:nth-child(n+12), .tw-item:nth-child(n+12) { animation-delay: .34s }

/* 评论：从左侧滑入，像「冒出来」 */
@keyframes lwa-cmt-in {
  from { opacity: 0; transform: translateX(-10px) }
  to   { opacity: 1; transform: none }
}
.cmt-item { animation: lwa-cmt-in .3s cubic-bezier(.2,1.1,.4,1) both; }

/* 聊天消息：自己的从右、对方的从左 */
@keyframes lwa-msg-right { from { opacity: 0; transform: translateX(14px) scale(.96) } to { opacity: 1; transform: none } }
@keyframes lwa-msg-left  { from { opacity: 0; transform: translateX(-14px) scale(.96) } to { opacity: 1; transform: none } }
.ch-msg.mine, .ch-bub.mine { animation: lwa-msg-right .26s cubic-bezier(.2,1.15,.4,1) both }
.ch-msg:not(.mine), .ch-bub:not(.mine) { animation: lwa-msg-left .26s cubic-bezier(.2,1.15,.4,1) both }

/* 成就条目：解锁的亮起来，未解锁的灰着（原来只是颜色差，加个动效） */
@keyframes lwa-ach-get {
  0%   { transform: scale(.94); box-shadow: 0 0 0 0 rgba(76,175,125,.5) }
  55%  { transform: scale(1.03); box-shadow: 0 0 0 6px rgba(76,175,125,0) }
  100% { transform: none; box-shadow: 0 0 0 0 rgba(76,175,125,0) }
}
.ach-item:not(.locked) { animation: lwa-ach-get .8s cubic-bezier(.2,1.2,.4,1) both }

/* 徽章 / 标签：脉冲一圈 */
.anim-badge, .room-badge, .img-badge, .card-tag {
  animation: lwa-pulse 2.6s ease-out infinite;
}
/* 但列表里一大堆一起脉冲会很吵，只让第一个动 */
.cmt-item ~ .cmt-item .card-tag,
li:nth-child(n+3) .card-tag { animation: none; }

/* 光尘数字：变大的一瞬间闪一下金色 */
@keyframes lwa-gold {
  0%   { color: inherit; text-shadow: none }
  40%  { color: #d1944d; text-shadow: 0 0 10px rgba(209,148,77,.55) }
  100% { color: inherit; text-shadow: none }
}
.dust-num, .ml-num, .in-num { transition: color .2s; }

/* 头像 / 缩略图：加载完从模糊到清晰（像冲洗照片） */
@keyframes lwa-develop {
  from { opacity: 0; filter: blur(6px) saturate(.6) }
  to   { opacity: 1; filter: none }
}
.card-av, .card-art, .card img, .mine-item canvas {
  animation: lwa-develop .42s ease-out both;
}

/* 按钮：悬停时轻微上浮 + 高光扫过（只在桌面） */
@media (hover: hover) and (pointer: fine) {
  .tw-btn, .auth-btn, .lw-refresh, .enter, .save {
    position: relative;
    overflow: hidden;
  }
  .tw-btn:hover, .auth-btn:hover, .lw-refresh:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }
}

/* 输入框聚焦：边框「亮起来」而不是硬切 */
input, textarea, select {
  transition: border-color .18s ease, box-shadow .18s ease, background-color .18s ease;
}
input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(91,141,239,.14);
}

/* 天气 / 尺寸切换：被选中的那个弹一下 */
.tw-tab.on, .ch-chip.on, .pal-chip.on, .mode-chip.on {
  animation: lwa-pop .3s cubic-bezier(.2,1.35,.4,1);
}

/* 加载失败：整个块轻微抖动（比只写一行红字更容易注意到） */
@keyframes lwa-err {
  0%, 100% { transform: translateX(0) }
  25% { transform: translateX(-5px) }
  75% { transform: translateX(5px) }
}
.status:not(:empty), .ach-empty, .bg-empty {
  animation: lwa-fade .3s ease-out both;
}
.err, .tw-err { animation: lwa-err .4s ease-in-out; }

/* 列表分隔线：进入时从中间往两边展开 */
@keyframes lwa-sep {
  from { transform: scaleX(0); opacity: 0 }
  to   { transform: none; opacity: 1 }
}
.entry-sep, .divider, hr {
  animation: lwa-sep .4s cubic-bezier(.2,1.1,.4,1) both;
  transform-origin: center;
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
/* ★★ 这里**绝对不能**用带 transform 的动画。
   只要 .page 上有 transform（动画进行中或 animation-fill-mode: both
   保留的最终值），它就成了后代的 containing block ——
   页面里所有 position: fixed 的元素（小地图、浮层、缩略图按钮…）
   会改为相对 .page 定位，全部错位、被拉伸。
   paint.js 里光 fixed 就有 10 个，一加就炸。
   所以页面级过渡只用 opacity。 */
.page { animation: lwa-fade .22s ease-out both }
#app > * > .page { animation: lwa-fade .26s ease-out both }

/* ============ 滚动进入视口才播 ============ */
.lwa-io { opacity: 0; transform: translateY(16px); transition: opacity .4s ease-out, transform .45s cubic-bezier(.2,1.1,.4,1) }
.lwa-io.lwa-in { opacity: 1; transform: none }

@media (prefers-reduced-motion: reduce) {
  /* ★ 用属性选择器通配，不要一个个列类名。
     列名字的话每加一个新动画都会漏一个 —— 我第二批加了 20 个，
     原来那份清单一个都没覆盖到，等于「减弱动效」形同虚设。
     [class*='lwa-'] 能命中所有工具类，加多少都自动跟上。 */
  [class*='lwa-'],
  .page,
  #app > * > .page,
  .lwa-stagger > *,
  .page > .card,
  .page > section {
    animation: none !important;
  }
  .lwa-io { opacity: 1 !important; transform: none !important }
  button:active, [role='button']:active { transform: none !important }
  [class*='lwa-']::before, [class*='lwa-']::after { animation: none !important }
  .entry-ico, .ml-ico, .ach-ico, .tw-item canvas { transition: none !important }
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
    /** 弹一下，提示「这个数字/元素变了」。
        和 bounce 的区别：pop 是纯缩放、幅度大、适合数字；
        bounce 带位移、更轻，适合图标和整块元素。 */
    pop: function (el) { this.play(el, 'pop', 480) },
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
