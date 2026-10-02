// 视觉打磨层
//
// 和 lw-anim.js 分工：那边管「动」，这边管「静」——
// 设计令牌、焦点态、滚动条、悬浮、装饰、无障碍细节。
//
// 一次覆盖全站，页面不用改代码。

;(function () {
  if (window.__lwPolish) return
  window.__lwPolish = true

  var STYLE_ID = 'lw-polish-style'

  var CSS = `
/* ============ 1. 设计令牌 ============
   原来阴影写死了 5 种不同数值，层级感是乱的。
   收成一套，以后改一处就全站生效。 */
:root {
  --lwp-sh-1: 0 1px 2px rgba(60, 48, 36, .06);
  --lwp-sh-2: 0 2px 8px rgba(60, 48, 36, .08);
  --lwp-sh-3: 0 4px 16px rgba(60, 48, 36, .10);
  --lwp-sh-4: 0 10px 32px rgba(60, 48, 36, .14);
  --lwp-sh-5: 0 18px 52px rgba(60, 48, 36, .20);
  --lwp-r-xs: 6px;
  --lwp-r-sm: 9px;
  --lwp-r: 13px;
  --lwp-r-lg: 17px;
  --lwp-r-xl: 22px;
  --lwp-dur-1: .12s;
  --lwp-dur-2: .2s;
  --lwp-dur-3: .32s;
  --lwp-ease: cubic-bezier(.2, .9, .3, 1);
  --lwp-ease-back: cubic-bezier(.2, 1.3, .4, 1);
}
html[data-theme='dark'] {
  --lwp-sh-1: 0 1px 2px rgba(0, 0, 0, .3);
  --lwp-sh-2: 0 2px 8px rgba(0, 0, 0, .34);
  --lwp-sh-3: 0 4px 16px rgba(0, 0, 0, .38);
  --lwp-sh-4: 0 10px 32px rgba(0, 0, 0, .44);
  --lwp-sh-5: 0 18px 52px rgba(0, 0, 0, .55);
}

/* ============ 2. 文字渲染 ============ */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
/* 数字等宽：倒计时、光尘、天数这类数字变化时不会左右抖 */
.num, .lwp-num, .in-num, .ml-num, .mc-dust, .dust-bal,
[data-lwa-count], .tk-num, .aw-num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
/* 标点不要在行首 */
body { line-break: strict; }
h1, h2, .card-title, .group-title, .ver-title {
  text-wrap: balance;   /* 标题不再出现孤字 */
}
p, .cp-card p, .lwd-msg, .entry-desc {
  text-wrap: pretty;
}

/* ============ 3. 选中文字的颜色 ============ */
::selection { background: rgba(91, 141, 239, .24); color: inherit; }
::-moz-selection { background: rgba(91, 141, 239, .24); color: inherit; }

/* ============ 4. 统一的焦点态（键盘导航要看得到） ============ */
/* 用 :focus-visible 而不是 :focus —— 鼠标点击不该出现焦点圈 */
a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
[tabindex]:focus-visible,
[role='button']:focus-visible {
  outline: 2px solid var(--accent, #5b8def);
  outline-offset: 2px;
  border-radius: var(--lwp-r-xs);
}
/* 鼠标点击时去掉那圈 */
:focus:not(:focus-visible) { outline: none; }

/* ============ 5. 全站自定义滚动条 ============ */
* { scrollbar-width: thin; scrollbar-color: rgba(140, 127, 107, .38) transparent; }
*::-webkit-scrollbar { width: 9px; height: 9px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb {
  background: rgba(140, 127, 107, .34);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
*::-webkit-scrollbar-thumb:hover { background: rgba(140, 127, 107, .55); background-clip: content-box; }
*::-webkit-scrollbar-corner { background: transparent; }
html[data-theme='dark'] *::-webkit-scrollbar-thumb { background: rgba(197, 186, 167, .3); background-clip: content-box; }

/* ============ 6. 卡片悬浮抬升 ============ */
/* 只对桌面加：触屏没有 hover，加了反而在点按时闪一下 */
@media (hover: hover) and (pointer: fine) {
  .card, .entry, .in-card, .tw-item, .li-tag, .mp-row, .mod-row {
    transition: transform var(--lwp-dur-2) var(--lwp-ease),
                box-shadow var(--lwp-dur-2) var(--lwp-ease),
                border-color var(--lwp-dur-2) var(--lwp-ease);
  }
  .card:hover, .entry:hover, .in-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--lwp-sh-3);
    border-color: var(--border-input);
  }
  .tw-item:hover, .mp-row:hover, .mod-row:hover {
    transform: translateX(2px);
    box-shadow: var(--lwp-sh-2);
  }
}

/* ============ 7. 圆角统一 ============ */
.card, .in-card, .entry, .mp-row, .mod-row { border-radius: var(--lwp-r); }
.mine-item, .tw-item, .gallery-item, .bg-item { border-radius: var(--lwp-r-sm); }
img, canvas { border-radius: inherit; }

/* ============ 8. 画布与缩略图的质感 ============ */
canvas { image-rendering: pixelated; image-rendering: crisp-edges; }
/* 像素画放大后边缘干净，加一层极淡的内描边让它和背景分得开 */
canvas[data-thumb], .mine-item canvas, .gallery-item canvas, .bg-item canvas, .mp-row canvas {
  box-shadow: inset 0 0 0 1px rgba(60, 48, 36, .07);
}

/* ============ 9. 渐变色标题 ============ */
.page > h1, .mp-head h1, .u-name, .fn-box h2 {
  background: linear-gradient(100deg,
    var(--text, #3b342c) 0%,
    var(--text, #3b342c) 42%,
    var(--accent, #5b8def) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--text);
}
/* 深色下换成更亮的渐变，不然尾部会糊 */
html[data-theme='dark'] .page > h1,
html[data-theme='dark'] .mp-head h1,
html[data-theme='dark'] .u-name,
html[data-theme='dark'] .fn-box h2 {
  background: linear-gradient(100deg, #f1ead9 0%, #f1ead9 40%, #96b9ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ============ 10. 像素风装饰 ============ */
/* 区块分隔用棋盘格，比一条灰线有味道 */
.lwp-dither {
  height: 4px;
  margin: 14px 0;
  background-image:
    linear-gradient(45deg, var(--border) 25%, transparent 25%, transparent 75%, var(--border) 75%),
    linear-gradient(45deg, var(--border) 25%, transparent 25%, transparent 75%, var(--border) 75%);
  background-size: 8px 8px;
  background-position: 0 0, 4px 4px;
  opacity: .7;
}
/* 卡片左上角两个像素小方块，呼应像素画主题 */
.lwp-corner { position: relative; }
.lwp-corner::before,
.lwp-corner::after {
  content: '';
  position: absolute;
  width: 4px; height: 4px;
  background: var(--accent, #5b8def);
  opacity: .5;
  border-radius: 1px;
}
.lwp-corner::before { left: 8px; top: 8px; }
.lwp-corner::after { left: 15px; top: 8px; opacity: .28; }

/* ============ 11. 玻璃拟态（浮层用） ============ */
.lwp-glass {
  background: color-mix(in srgb, var(--surface, #fff) 82%, transparent);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  backdrop-filter: blur(14px) saturate(150%);
}

/* ============ 12. 返回顶部 ============ */
#lwpTop {
  position: fixed;
  right: 16px;
  bottom: 92px;
  z-index: 110;
  width: 42px; height: 42px;
  border: 0;
  border-radius: 50%;
  background: var(--surface, #fff);
  color: var(--text-muted, #6b5f50);
  box-shadow: var(--lwp-sh-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  opacity: 0;
  transform: translateY(14px) scale(.9);
  pointer-events: none;
  transition: opacity var(--lwp-dur-2) var(--lwp-ease),
              transform var(--lwp-dur-3) var(--lwp-ease-back);
}
#lwpTop.on {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
#lwpTop:active { transform: scale(.92); }

/* ============ 13. 顶部滚动进度条 ============ */
#lwpProg {
  position: fixed;
  top: 0; left: 0;
  height: 2.5px;
  width: 0;
  z-index: 9999;
  background: linear-gradient(90deg, var(--accent, #5b8def), #96b9ff);
  border-radius: 0 2px 2px 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--lwp-dur-2);
}
#lwpProg.on { opacity: 1; }

/* ============ 14. 骨架屏（自动替换「加载中…」） ============ */
.lwp-skel-wrap { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; }
.lwp-skel-row {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg,
    rgba(60,48,36,.06) 25%, rgba(60,48,36,.12) 37%, rgba(60,48,36,.06) 63%);
  background-size: 340px 100%;
  animation: lwp-shimmer 1.3s linear infinite;
}
.lwp-skel-row.w40 { width: 40% }
.lwp-skel-row.w60 { width: 60% }
.lwp-skel-row.w80 { width: 80% }
.lwp-skel-card { height: 72px; border-radius: var(--lwp-r-sm) }
html[data-theme='dark'] .lwp-skel-row,
html[data-theme='dark'] .lwp-skel-card {
  background: linear-gradient(90deg,
    rgba(255,255,255,.07) 25%, rgba(255,255,255,.15) 37%, rgba(255,255,255,.07) 63%);
  background-size: 340px 100%;
}
@keyframes lwp-shimmer {
  0%   { background-position: -340px 0 }
  100% { background-position: 340px 0 }
}

/* ============ 14b. 加载时预留空间（防布局跳动） ============
   组件「先空后填」时页面会往下跳，读起来很难受。
   解决办法不是加动画，而是**按真实内容的高度把位置先占住** ——
   加载完成后内容填进同样大小的框里，位置一点不动。

   高度按各类内容的真实尺寸给的，不是瞎写的：
     作品卡  约 190px（图 1:1 + 标题 + 作者行）
     精选卡  约 96px
     数据格  约 74px
     评论条  约 58px
     邮件行  约 72px
     家具格  约 84px  */
.lwp-hold { min-height: 12px; }

/* 作品网格：占两行卡位。加载完填进去正好，不会把下面的内容顶走 */
#gallery.lwp-hold,
.mine-grid.lwp-hold,
.u-grid.lwp-hold,
.tw-grid.lwp-hold,
.bag-grid.lwp-hold { min-height: 400px; }
/* 精选那一排（横滑） */
#featuredRow.lwp-hold,
.featured-row.lwp-hold { min-height: 96px; }

/* 统计格：2×2 */
#statGrid.lwp-hold { min-height: 150px; }

/* 评论列表 */
#cmtList.lwp-hold, .cmt-list.lwp-hold { min-height: 180px; }

/* 聊天消息区（本身是 flex 撑满，不用管，但首屏那条占位要有高度） */
#chMsgs.lwp-hold { min-height: 200px; }

/* 邮件 / 通知列表：占三行 */
#mailList.lwp-hold, .adm-mail-list.lwp-hold, #banList.lwp-hold,
.mod-list.lwp-hold, .tk-list.lwp-hold, .u-ach-list.lwp-hold {
  min-height: 220px;
}

/* 小镇地图（已经有 max-height，这里给 min 免得加载时是 0 高） */
#twBody.lwp-hold { min-height: 340px; }

/* 成就 / 背包 / 图鉴这类格子墙 */
#achBody.lwp-hold, #bgBody.lwp-hold { min-height: 320px; }

/* ============ 14c. 按内容类型配骨架形状 ============
   骨架不该千篇一律都是三条灰杠 —— 形状和真实内容对不上，
   填进去的时候还是会觉得「跳了一下」。
   给几种预设，用 data-skel 指定。 */
.lwp-sk { display: flex; flex-direction: column; gap: 10px; }
.lwp-sk-row {
  height: 14px; border-radius: 7px;
  background: linear-gradient(90deg, rgba(60,48,36,.06) 25%, rgba(60,48,36,.12) 37%, rgba(60,48,36,.06) 63%);
  background-size: 340px 100%;
  animation: lwp-shimmer 1.3s linear infinite;
}
html[data-theme='dark'] .lwp-sk-row {
  background: linear-gradient(90deg, rgba(255,255,255,.07) 25%, rgba(255,255,255,.15) 37%, rgba(255,255,255,.07) 63%);
  background-size: 340px 100%;
}

/* 卡片网格：两列，每张卡都是「方形图 + 两行字」 */
.lwp-sk-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.lwp-sk-card { display: flex; flex-direction: column; gap: 7px; }
.lwp-sk-card .pic {
  aspect-ratio: 1;
  border-radius: var(--lwp-r-sm, 9px);
  background: linear-gradient(90deg, rgba(60,48,36,.06) 25%, rgba(60,48,36,.12) 37%, rgba(60,48,36,.06) 63%);
  background-size: 340px 100%;
  animation: lwp-shimmer 1.3s linear infinite;
}
html[data-theme='dark'] .lwp-sk-card .pic {
  background: linear-gradient(90deg, rgba(255,255,255,.07) 25%, rgba(255,255,255,.15) 37%, rgba(255,255,255,.07) 63%);
  background-size: 340px 100%;
}
.lwp-sk-card .t1 { height: 13px; width: 78%; border-radius: 6px }
.lwp-sk-card .t2 { height: 11px; width: 46%; border-radius: 6px }

/* 列表行：左边一个方块（头像/缩略图）+ 右边两行字 */
.lwp-sk-rows { display: flex; flex-direction: column; gap: 10px; }
.lwp-sk-rowitem { display: flex; align-items: center; gap: 10px; }
.lwp-sk-rowitem .av {
  width: 42px; height: 42px; flex: none;
  border-radius: var(--lwp-r-sm, 9px);
  background: linear-gradient(90deg, rgba(60,48,36,.06) 25%, rgba(60,48,36,.12) 37%, rgba(60,48,36,.06) 63%);
  background-size: 340px 100%;
  animation: lwp-shimmer 1.3s linear infinite;
}
html[data-theme='dark'] .lwp-sk-rowitem .av {
  background: linear-gradient(90deg, rgba(255,255,255,.07) 25%, rgba(255,255,255,.15) 37%, rgba(255,255,255,.07) 63%);
  background-size: 340px 100%;
}
.lwp-sk-rowitem .ln { flex: 1; display: flex; flex-direction: column; gap: 7px }
.lwp-sk-rowitem .ln i {
  display: block; height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, rgba(60,48,36,.06) 25%, rgba(60,48,36,.12) 37%, rgba(60,48,36,.06) 63%);
  background-size: 340px 100%;
  animation: lwp-shimmer 1.3s linear infinite;
}
html[data-theme='dark'] .lwp-sk-rowitem .ln i {
  background: linear-gradient(90deg, rgba(255,255,255,.07) 25%, rgba(255,255,255,.15) 37%, rgba(255,255,255,.07) 63%);
  background-size: 340px 100%;
}
.lwp-sk-rowitem .ln i:first-child { width: 62% }
.lwp-sk-rowitem .ln i:last-child { width: 38% }

/* 数据格 2×2 */
.lwp-sk-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.lwp-sk-stat {
  height: 74px; border-radius: var(--lwp-r, 13px);
  background: linear-gradient(90deg, rgba(60,48,36,.06) 25%, rgba(60,48,36,.12) 37%, rgba(60,48,36,.06) 63%);
  background-size: 340px 100%;
  animation: lwp-shimmer 1.3s linear infinite;
}
html[data-theme='dark'] .lwp-sk-stat {
  background: linear-gradient(90deg, rgba(255,255,255,.07) 25%, rgba(255,255,255,.15) 37%, rgba(255,255,255,.07) 63%);
  background-size: 340px 100%;
}

/* 精选横滑：五张窄卡 */
.lwp-sk-feat { display: flex; gap: 8px; overflow: hidden }
.lwp-sk-feat div {
  width: 72px; height: 88px; flex: none;
  border-radius: var(--lwp-r-sm, 9px);
  background: linear-gradient(90deg, rgba(60,48,36,.06) 25%, rgba(60,48,36,.12) 37%, rgba(60,48,36,.06) 63%);
  background-size: 340px 100%;
  animation: lwp-shimmer 1.3s linear infinite;
}
html[data-theme='dark'] .lwp-sk-feat div {
  background: linear-gradient(90deg, rgba(255,255,255,.07) 25%, rgba(255,255,255,.15) 37%, rgba(255,255,255,.07) 63%);
  background-size: 340px 100%;
}

@media (prefers-reduced-motion: reduce) {
  .lwp-sk-row, .lwp-sk-card .pic, .lwp-sk-rowitem .av,
  .lwp-sk-rowitem .ln i, .lwp-sk-stat, .lwp-sk-feat div { animation: none }
}

/* ============ 15. 像素风空状态 ============ */
.lwp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 34px 20px 30px;
  text-align: center;
}
.lwp-empty svg {
  width: 68px; height: 68px;
  opacity: .85;
  animation: lwp-bob 3s ease-in-out infinite;
}
@keyframes lwp-bob {
  0%, 100% { transform: translateY(0) }
  50%      { transform: translateY(-6px) }
}
.lwp-empty-t {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-muted, #6b5f50);
}
.lwp-empty-d {
  font-size: 12.5px;
  color: var(--text-faint, #b0a697);
  line-height: 1.7;
  max-width: 260px;
}
.lwp-empty a, .lwp-empty button {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent, #5b8def);
  background: none;
  border: 0;
  cursor: pointer;
  text-decoration: none;
}

/* ============ 16. 悬浮提示 ============ */
#lwpTip {
  position: fixed;
  z-index: 99997;
  max-width: 250px;
  padding: 7px 11px;
  border-radius: var(--lwp-r-sm);
  background: var(--toast-bg, #3b342c);
  color: #f5f0e6;
  font-size: 12px;
  line-height: 1.55;
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity var(--lwp-dur-1), transform var(--lwp-dur-1);
  box-shadow: var(--lwp-sh-3);
  text-align: center;
}
#lwpTip.on { opacity: 1; transform: none; }

/* ============ 17. 表单校验反馈 ============ */
input.lwp-bad, textarea.lwp-bad {
  border-color: #e5574b !important;
  background: rgba(229, 87, 75, .05);
  animation: lwp-nudge .42s cubic-bezier(.36,.07,.19,.97);
}
@keyframes lwp-nudge {
  0%, 100% { transform: translateX(0) }
  20% { transform: translateX(-6px) }
  40% { transform: translateX(5px) }
  60% { transform: translateX(-3px) }
  80% { transform: translateX(2px) }
}
input.lwp-good, textarea.lwp-good { border-color: #4caf7d !important; }

/* ============ 18. 密码强度条 ============ */
.lwp-pw {
  height: 3px;
  border-radius: 2px;
  margin-top: 6px;
  background: var(--border, #efe7da);
  overflow: hidden;
}
.lwp-pw i {
  display: block;
  height: 100%;
  width: 0;
  border-radius: 2px;
  transition: width var(--lwp-dur-3) var(--lwp-ease), background var(--lwp-dur-3);
}

/* ============ 19. 加载失败的重试 ============ */
.lwp-retry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 16px;
  border: 1px solid var(--border-input, #e0d8d0);
  border-radius: 999px;
  background: var(--surface, #fff);
  color: var(--text-muted, #6b5f50);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.lwp-retry:active { transform: scale(.96) }

/* ============ 20. 图片淡入 ============ */
img.lwp-fadein { opacity: 0; transition: opacity var(--lwp-dur-3) ease-out }
img.lwp-fadein.lwp-on { opacity: 1 }

/* ============ 21. 长按进度环 ============ */
.lwp-hold {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: conic-gradient(var(--accent, #5b8def) var(--p, 0turn), transparent 0);
  opacity: .28;
  transition: opacity var(--lwp-dur-1);
}

/* ============ 22. 页脚 ============ */
.copyright {
  margin-top: 26px !important;
  padding-top: 14px;
  border-top: 1px dashed var(--border, #efe7da);
  letter-spacing: .4px;
}
/* 支持一下 Safari 的旧写法 */
@supports not (background: color-mix(in srgb, red 50%, transparent)) {
  .lwp-glass { background: var(--surface, #fff) }
}

@media (prefers-reduced-motion: reduce) {
  .lwp-skel-row, .lwp-skel-card, .lwp-empty svg { animation: none !important }
  #lwpTop { transition: opacity .01s }
  * { scroll-behavior: auto !important }
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

  var reduce = false
  try {
    reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  } catch (e) {}

  /* ================= 像素风空状态图标 =================
     手写 SVG，每个 rect 就是「一个像素格」，和站点主题一致。
     不引图标库 —— 这点图形用不着。 */
  function px(rows, color) {
    var size = 4
    var w = rows[0].length
    var h = rows.length
    var out = '<svg viewBox="0 0 ' + w + ' ' + h + '" shape-rendering="crispEdges" aria-hidden="true">'
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var c = rows[y][x]
        if (c === '.') continue
        out += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + (color[c] || color.d) + '"/>'
      }
    }
    return out + '</svg>'
  }

  var ICONS = {
    // 空画框：一幅还没画完的画
    frame: px(
      ['................',
       '.##############.',
       '.#............#.',
       '.#..........#.#.',
       '.#........##..#.',
       '.#.......##...#.',
       '.#......###...#.',
       '.#.....###....#.',
       '.#....###.....#.',
       '.#...###......#.',
       '.#..###.......#.',
       '.#............#.',
       '.##############.',
       '................'],
      { d: '#c9bfae', '#': '#b0a697' }
    ),
    // 空信箱
    mail: px(
      ['................',
       '.##############.',
       '.#............#.',
       '.#.#........#.#.',
       '.#..#......#..#.',
       '.#...#....#...#.',
       '.#....#..#....#.',
       '.#.....##.....#.',
       '.#............#.',
       '.#............#.',
       '.##############.',
       '................'],
      { d: '#c9bfae', '#': '#b0a697' }
    ),
    // 空屋子
    house: px(
      ['................',
       '.......##.......',
       '......####......',
       '.....######.....',
       '....########....',
       '...##########...',
       '..############..',
       '.##############.',
       '.#....#..#....#.',
       '.#....#..#....#.',
       '.#....####....#.',
       '.#....#..#....#.',
       '.#....#..#....#.',
       '.##############.',
       '................'],
      { d: '#c9bfae', '#': '#b0a697' }
    ),
    // 空消息
    chat: px(
      ['................',
       '..############..',
       '..#..........#..',
       '..#.##.##.##.#..',
       '..#..........#..',
       '..#.##.##....#..',
       '..#..........#..',
       '..############..',
       '.......##.......',
       '......##........',
       '.....##.........',
       '................'],
      { d: '#c9bfae', '#': '#b0a697' }
    ),
    // 空列表 / 空数据
    list: px(
      ['................',
       '..####..........',
       '................',
       '..####.####.....',
       '................',
       '..####.####.....',
       '................',
       '..####.####.....',
       '................',
       '..####..........',
       '................'],
      { d: '#c9bfae', '#': '#b0a697' }
    ),
  }

  /* 找出「该用哪个图标」—— 按元素所在的上下文猜。
     猜不中就用默认的画框，不影响功能。 */
  function guessIcon(el) {
    var hay = ((el.className || '') + ' ' + (el.id || '') + ' ' + (el.parentNode ? el.parentNode.className || '' : '')).toLowerCase()
    if (/mail|msg-|letter|信/.test(hay)) return 'mail'
    if (/chat|ch-|msg|find/.test(hay)) return 'chat'
    if (/town|tw-|house|屋/.test(hay)) return 'house'
    if (/rank|list|ach|tk|task/.test(hay)) return 'list'
    return 'frame'
  }

  /* ================= 把「加载中…」换成骨架屏 ================= */
  var LOADING_RE = /^(加载中|读取中|载入中|请稍候)[.…·]*$/

  /* 骨架的形状要和真实内容对得上，不然填进去还是会觉得「跳了一下」。
     几种预设：
       cards  两列卡片墙（社区、我的作品、成就、图鉴）
       rows   带头像/缩略图的列表行（评论、邮件、通知、好友）
       stats  2×2 数据格
       feat   横滑的精选条
       text   兜底：三行字 */
  function skeletonHTML(kind) {
    var i
    if (kind === 'cards') {
      var cs = '<div class="lwp-sk lwp-sk-cards">'
      for (i = 0; i < 6; i++) {
        cs += '<div class="lwp-sk-card"><div class="pic"></div><div class="t1 lwp-sk-row"></div><div class="t2 lwp-sk-row"></div></div>'
      }
      return cs + '</div>'
    }
    if (kind === 'rows') {
      var rs = '<div class="lwp-sk lwp-sk-rows">'
      for (i = 0; i < 4; i++) {
        rs += '<div class="lwp-sk-rowitem"><div class="av"></div><div class="ln"><i></i><i></i></div></div>'
      }
      return rs + '</div>'
    }
    if (kind === 'stats') {
      var ss = '<div class="lwp-sk lwp-sk-stats">'
      for (i = 0; i < 4; i++) ss += '<div class="lwp-sk-stat"></div>'
      return ss + '</div>'
    }
    if (kind === 'feat') {
      var fs = '<div class="lwp-sk lwp-sk-feat">'
      for (i = 0; i < 5; i++) fs += '<div></div>'
      return fs + '</div>'
    }
    return (
      '<div class="lwp-sk">' +
      '<div class="lwp-sk-row" style="width:60%"></div>' +
      '<div class="lwp-sk-row" style="width:80%"></div>' +
      '<div class="lwp-sk-row" style="width:40%"></div>' +
      '</div>'
    )
  }

  /* 按容器 id / class 猜该用哪种骨架 */
  function kindFor(el) {
    var hay = ((el.id || '') + ' ' + (el.className || '') + ' ' +
      (el.parentNode ? (el.parentNode.id || '') + ' ' + (el.parentNode.className || '') : '')).toLowerCase()
    if (/gallery|mine-?grid|u-grid|bag|ach|bg-?body|tw-grid/.test(hay)) return 'cards'
    if (/stat/.test(hay)) return 'stats'
    if (/featured/.test(hay)) return 'feat'
    if (/cmt|mail|ban|mod-list|tk-list|chat|ch-|rank|list/.test(hay)) return 'rows'
    return 'text'
  }

  /* 给「先空后填」的容器预留高度。
     这一步不写内容，只是把位置占住 ——
     加载完成后内容填进同样大小的框里，页面不会往下跳。 */
  var HOLD_SEL = '#gallery, .mine-grid, .u-grid, .tw-grid, .bag-grid, #featuredRow, ' +
    '.featured-row, #statGrid, #cmtList, .cmt-list, #chMsgs, #mailList, .adm-mail-list, ' +
    '#banList, .mod-list, .tk-list, .u-ach-list, #twBody, #achBody, #bgBody'
  function reserveSpace() {
    var els = document.querySelectorAll(HOLD_SEL)
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      var hasSk = !!el.querySelector('.lwp-sk')
      var empty = !el.children.length
      /* ★ 只在「还没内容」或「只显示骨架」时占位。
         内容填进来就把占位撤掉 ——
         不然内容比预留高度矮的时候，页面会往回缩一下，
         那是另一种跳动，一样难受。 */
      if (hasSk || empty) {
        if (el.dataset.lwpHold !== '1') {
          el.dataset.lwpHold = '1'
          el.classList.add('lwp-hold')
        }
      } else if (el.dataset.lwpHold === '1') {
        el.dataset.lwpHold = ''
        el.classList.remove('lwp-hold')
      }
    }
  }

  function upgradeLoading() {
    var els = document.querySelectorAll('.status, .empty, .tw-empty, .u-empty, .bg-empty, .ch-empty')
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      var txt = (el.textContent || '').trim()
      if (!LOADING_RE.test(txt)) {
        if (el.dataset.lwpSkel === '1') {
          // 已经加载完了，把骨架摘掉、还原成正常内容
          el.dataset.lwpSkel = ''
          el.classList.remove('lwp-skel-host')
        }
        continue
      }
      if (el.dataset.lwpSkel === '1') continue
      el.dataset.lwpSkel = '1'
      el.innerHTML = skeletonHTML(kindFor(el))
    }
  }

  /* ================= 给干巴巴的空状态加像素插图 ================= */
  /* 只处理「内容很短、且看起来像空状态」的元素，不碰别的 */
  function upgradeEmpty() {
    var els = document.querySelectorAll('.empty, .tw-empty, .u-empty, .bg-empty, .ch-empty, .tk-empty')
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      if (el.dataset.lwpEmpty === '1') continue
      var txt = (el.textContent || '').trim()
      // 太长的不是空状态（可能是错误详情），跳过
      if (!txt || txt.length > 60) continue
      if (LOADING_RE.test(txt)) continue
      // 已经有插图了
      if (el.querySelector('svg')) continue
      el.dataset.lwpEmpty = '1'
      el.classList.add('lwp-empty')
      var icon = guessIcon(el)
      el.innerHTML =
        ICONS[icon] +
        '<div class="lwp-empty-t">' + escapeHTML(txt) + '</div>'
    }
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  /* ================= 返回顶部 + 滚动进度 ================= */
  var topBtn = null
  var progEl = null

  function ensureScrollUI() {
    // 页面太短就不需要这两个东西
    var need = document.documentElement.scrollHeight > window.innerHeight + 240
    if (!need) {
      if (topBtn) topBtn.classList.remove('on')
      if (progEl) progEl.classList.remove('on')
      return
    }
    if (!topBtn) {
      topBtn = document.createElement('button')
      topBtn.id = 'lwpTop'
      topBtn.type = 'button'
      topBtn.title = '回到顶部'
      topBtn.setAttribute('aria-label', '回到顶部')
      topBtn.textContent = '↑'
      topBtn.addEventListener('click', function () {
        try {
          window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
        } catch (e) {
          window.scrollTo(0, 0)
        }
      })
      document.body.appendChild(topBtn)
    }
    if (!progEl) {
      progEl = document.createElement('div')
      progEl.id = 'lwpProg'
      document.body.appendChild(progEl)
    }
  }

  function onScroll() {
    ensureScrollUI()
    var y = window.scrollY || document.documentElement.scrollTop || 0
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    var p = Math.min(1, y / max)
    if (topBtn) topBtn.classList.toggle('on', y > 420)
    if (progEl) {
      progEl.style.width = (p * 100).toFixed(2) + '%'
      progEl.classList.toggle('on', y > 24 && p < 1)
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })

  /* ================= 悬浮提示 ================= */
  var tipEl = null
  var tipTimer = 0

  function showTip(el) {
    var text = el.getAttribute('data-tip') || el.getAttribute('title')
    if (!text) return
    // title 会弹系统的，搬到 data-tip 上自己画
    if (el.getAttribute('title')) {
      el.setAttribute('data-tip', text)
      el.removeAttribute('title')
    }
    if (!tipEl) {
      tipEl = document.createElement('div')
      tipEl.id = 'lwpTip'
      document.body.appendChild(tipEl)
    }
    tipEl.textContent = text
    var r = el.getBoundingClientRect()
    tipEl.style.left = '0px'
    tipEl.style.top = '0px'
    tipEl.classList.add('on')
    var tw = tipEl.offsetWidth
    var th = tipEl.offsetHeight
    var left = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2))
    var top = r.top - th - 8
    if (top < 8) top = r.bottom + 8
    tipEl.style.left = left + 'px'
    tipEl.style.top = top + 'px'
  }

  function hideTip() {
    if (tipEl) tipEl.classList.remove('on')
  }

  document.addEventListener(
    'pointerenter',
    function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-tip], [title]') : null
      if (!el) return
      // 触屏不显示悬浮提示
      if (e.pointerType === 'touch') return
      clearTimeout(tipTimer)
      tipTimer = setTimeout(function () { showTip(el) }, 260)
    },
    true
  )
  document.addEventListener(
    'pointerleave',
    function () { clearTimeout(tipTimer); hideTip() },
    true
  )
  document.addEventListener('pointerdown', function () { clearTimeout(tipTimer); hideTip() }, true)

  /* ================= 触觉反馈 ================= */
  /* 手机上做「确认/删除」时轻轻震一下。没有 vibrate 的浏览器直接跳过。 */
  window.LWHaptic = {
    tap: function () { try { navigator.vibrate && navigator.vibrate(8) } catch (e) {} },
    ok: function () { try { navigator.vibrate && navigator.vibrate([10, 40, 18]) } catch (e) {} },
    bad: function () { try { navigator.vibrate && navigator.vibrate([26, 60, 26]) } catch (e) {} },
  }
  // 危险按钮点下去震一下 —— 用 data-danger 标记，不用每个页面改代码
  document.addEventListener(
    'click',
    function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-danger], .danger') : null
      if (el && window.LWHaptic) window.LWHaptic.tap()
    },
    true
  )

  /* ================= 表单校验反馈 ================= */
  window.LWForm = {
    /** 标红 + 抖一下 */
    bad: function (el, why) {
      if (!el) return
      el.classList.remove('lwp-bad')
      void el.offsetWidth
      el.classList.add('lwp-bad')
      if (window.LWAnim) window.LWAnim.shake(el)
      if (window.LWHaptic) window.LWHaptic.bad()
      if (why && window.lwAlert) window.lwAlert(why)
      setTimeout(function () { el.classList.remove('lwp-bad') }, 2400)
    },
    good: function (el) {
      if (!el) return
      el.classList.add('lwp-good')
      setTimeout(function () { el.classList.remove('lwp-good') }, 1600)
    },
    /** 给输入框挂密码强度条，返回一个更新函数 */
    strength: function (input) {
      if (!input) return null
      var bar = document.createElement('div')
      bar.className = 'lwp-pw'
      var fill = document.createElement('i')
      bar.appendChild(fill)
      input.parentNode.insertBefore(bar, input.nextSibling)
      return function (v) {
        var s = String(v == null ? input.value : v)
        var n = 0
        if (s.length >= 8) n++
        if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++
        if (/\\d/.test(s)) n++
        if (/[^A-Za-z0-9]/.test(s)) n++
        if (s.length >= 14) n++
        var pct = [0, 22, 45, 68, 86, 100][Math.min(5, n)]
        var col = n <= 1 ? '#e5574b' : n <= 2 ? '#e0973f' : n <= 3 ? '#d1b23f' : '#4caf7d'
        fill.style.width = pct + '%'
        fill.style.background = col
      }
    },
  }

  /* ================= 图片淡入 ================= */
  function fadeImages() {
    var imgs = document.querySelectorAll('img:not(.lwp-fadein)')
    for (var i = 0; i < imgs.length; i++) {
      var im = imgs[i]
      im.classList.add('lwp-fadein')
      if (im.complete) {
        im.classList.add('lwp-on')
      } else {
        im.addEventListener('load', function () { this.classList.add('lwp-on') })
        im.addEventListener('error', function () { this.classList.add('lwp-on') })
      }
    }
  }

  /* ================= 长按进度环 ================= */
  /* 给带 data-hold="800" 的元素加长按进度视觉 */
  function bindHold() {
    var els = document.querySelectorAll('[data-hold]:not([data-hold-bound])')
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      el.setAttribute('data-hold-bound', '1')
      if (reduce) continue
      el.style.position = el.style.position || 'relative'
      var ring = document.createElement('div')
      ring.className = 'lwp-hold'
      el.appendChild(ring)
      var raf = 0
      var t0 = 0
      function step(now) {
        var dur = Number(el.getAttribute('data-hold')) || 800
        var p = Math.min(1, (now - t0) / dur)
        ring.style.setProperty('--p', p + 'turn')
        if (p < 1) raf = requestAnimationFrame(step)
      }
      el.addEventListener('pointerdown', function () {
        t0 = performance.now()
        raf = requestAnimationFrame(step)
      })
      ;['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
        el.addEventListener(ev, function () {
          cancelAnimationFrame(raf)
          ring.style.setProperty('--p', '0turn')
        })
      })
    }
  }

  /* ================= 定时扫描 ================= */
  var timer = 0
  function scan() {
    try {
      reserveSpace()
      upgradeLoading()
      upgradeEmpty()
      fadeImages()
      bindHold()
      onScroll()
    } catch (e) {}
  }
  function start() {
    if (timer) return
    timer = setInterval(scan, 600)
    scan()
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }

  window.LWPolish = {
    scan: scan,
    icons: ICONS,
    skeleton: skeletonHTML,
    glass: function (el) { if (el) el.classList.add('lwp-glass') },
    dither: function (el) { if (el) el.classList.add('lwp-dither') },
    corner: function (el) { if (el) el.classList.add('lwp-corner') },
  }
})()
