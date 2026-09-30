// 由 settings.html 自动转换为 Vue 3 视图（无构建）
export default {
  name: 'settings',
  title: '设置',
  css: `      /* hidden 属性兜底：避免类选择器里的 display 覆盖 UA 的 [hidden]{display:none} */
      [hidden] { display: none !important; }

      :root {
        --bg: #faf5ef;
        --surface: #ffffff;
        --surface-2: #efe9e0;
        --text: #3b342c;
        --text-muted: #6b5f50;
        --text-faint: #b0a697;
        --border: #efe7da;
        --border-strong: #e0d3c0;
        --shadow: rgba(80, 60, 40, 0.08);
        --shadow-hover: rgba(80, 60, 40, 0.14);
        --accent: #5b8def;
        --overlay: rgba(20, 15, 10, 0.8);
      }
      [data-theme="dark"] {
        --bg: #181512;
        --surface: #262220;
        --surface-2: #332e29;
        --text: #ece5da;
        --text-muted: #b8ac9b;
        --text-faint: #7d7266;
        --border: #3a342f;
        --border-strong: #4a433c;
        --shadow: rgba(0, 0, 0, 0.4);
        --shadow-hover: rgba(0, 0, 0, 0.55);
        --accent: #6f9fff;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
        background: var(--bg);
        color: var(--text);
        min-height: 100vh;
        padding: 24px 16px 116px;
        transition: background 0.25s ease, color 0.25s ease;
      }

      .container {
        width: 100%;
        max-width: 560px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      .header-text { flex: 1; min-width: 0; }

      .header-text h1 {
        font-size: 20px;
        font-weight: 800;
        color: var(--text);
      }

      .header-sub {
        font-size: 13px;
        color: var(--text-faint);
        margin-top: 4px;
      }

      .theme-btn {
        flex: 0 0 auto;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid var(--border);
        background: var(--surface);
        color: var(--text-muted);
        font-size: 18px;
        cursor: pointer;
        transition: border-color 0.2s, transform 0.12s;
        line-height: 1;
      }

      .theme-btn:active { transform: scale(0.9); }

      .group {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 4px 14px var(--shadow);
      }

      .group-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-faint);
        margin-bottom: 12px;
      }

      .fold { padding: 4px 14px; }

      .fold-head {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        border: none;
        background: transparent;
        padding: 12px 0;
        cursor: pointer;
        text-align: left;
      }

      .fold-title { flex: 1; font-size: 15px; font-weight: 800; color: var(--text); }
      .fold-count {
        flex: 0 0 auto;
        font-size: 12px;
        font-weight: 700;
        color: var(--text-faint);
        background: var(--surface-2);
        border-radius: 999px;
        padding: 3px 10px;
      }
      .fold-arrow { flex: 0 0 auto; font-size: 15px; color: var(--text-faint); transition: transform 0.2s; }
      .fold-head.open .fold-arrow { transform: rotate(180deg); }
      .fold-body { padding-bottom: 14px; }

      .lay-row, .lay-child-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 9px 0;
        cursor: pointer;
      }
      .lay-row {
        border-bottom: 1px dashed var(--border);
        padding-bottom: 12px;
        margin-bottom: 4px;
      }
      .lay-row input, .lay-child-row input {
        margin-top: 2px;
        width: 18px; height: 18px;
        accent-color: var(--accent);
        flex: 0 0 auto;
      }
      .lay-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .lay-body b { font-size: 14px; font-weight: 700; color: var(--text); }
      .lay-body i { font-style: normal; font-size: 11px; color: var(--text-faint); }
      .lay-child { display: flex; flex-direction: column; }

      .group-hint {
        font-size: 12px;
        color: var(--text-faint);
        line-height: 1.6;
        margin-bottom: 4px;
      }

      .feat-all { display: flex; gap: 10px; padding-top: 12px; }

      .feat-btn {
        flex: 1;
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 9px 0;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }

      /* ---------- 新手教程 ---------- */
      .guide {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        margin-bottom: 14px;
        overflow: hidden;
      }
      .guide summary {
        list-style: none;
        cursor: pointer;
        padding: 14px 15px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .guide summary::-webkit-details-marker { display: none; }
      .guide-hero { display: flex; flex-direction: column; gap: 3px; }
      .guide-hero b { font-size: 14px; color: var(--text); line-height: 1.5; }
      .guide-hero i { font-size: 12px; color: var(--text-muted2); font-style: normal; }
      .guide-arrow { margin-left: auto; color: var(--text-faint); transition: transform 0.2s; }
      .guide[open] .guide-arrow { transform: rotate(180deg); }
      .guide-body { padding: 0 15px 15px; }
      .guide-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
      }
      .g-item {
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 13px;
        padding: 11px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .g-ico { font-size: 19px; }
      .g-item b { font-size: 13px; color: var(--text); }
      .g-item i {
        font-size: 12px;
        font-style: normal;
        color: var(--text-muted);
        line-height: 1.7;
      }
      .guide-tips {
        margin-top: 12px;
        background: var(--surface-2);
        border-left: 3px solid var(--accent);
        border-radius: 0 12px 12px 0;
        padding: 11px 13px;
      }
      .guide-tips b { font-size: 13px; color: var(--text); }
      .guide-tips ul { margin: 7px 0 0; padding-left: 18px; }
      .guide-tips li { font-size: 12px; color: var(--text-muted); line-height: 1.9; }
      .guide-tips kbd {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 6px;
        border: 1px solid var(--border-strong);
        background: var(--surface);
        font-size: 11px;
        color: var(--text);
      }
      .an-p {
        margin: 0 0 11px;
        font-size: 13px;
        line-height: 1.9;
        color: var(--text-muted);
      }
      .an-p b { color: var(--text); }
      .an-quote {
        background: var(--surface-2);
        border-left: 3px solid var(--accent);
        border-radius: 0 12px 12px 0;
        padding: 11px 13px;
      }
      .an-last { margin-bottom: 0; }

      .guide-close {
        width: 100%;
        margin-top: 12px;
        padding: 11px;
        border-radius: 12px;
        border: none;
        background: var(--accent);
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }

      .row-col { flex-direction: column; align-items: stretch; gap: 10px; }

      /* ---------- 底部导航透明度 ---------- */
      .slider-head { display: flex; align-items: flex-start; gap: 10px; }
      .slider-val {
        margin-left: auto;
        font-size: 13px;
        font-weight: 700;
        color: var(--accent);
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 26px;
        background: transparent;
        cursor: pointer;
        margin: 0;
      }
      .slider::-webkit-slider-runnable-track {
        height: 8px;
        border-radius: 999px;
        background: var(--surface-3);
        border: 1px solid var(--border);
      }
      .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 22px;
        height: 22px;
        margin-top: -8px;
        border-radius: 50%;
        background: var(--accent);
        border: 2px solid var(--surface);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
      }
      .slider::-moz-range-track {
        height: 8px;
        border-radius: 999px;
        background: var(--surface-3);
        border: 1px solid var(--border);
      }
      .slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--accent);
        border: 2px solid var(--surface);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
      }
      .slider-presets { display: flex; flex-wrap: wrap; gap: 7px; }
      .slider-presets button {
        padding: 5px 11px;
        border-radius: 999px;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text-muted);
        font-size: 12px;
        cursor: pointer;
      }
      .slider-presets button.on {
        border-color: var(--accent);
        color: var(--accent);
      }
      .nav-preview {
        margin-top: 2px;
        padding: 14px 12px 10px;
        border-radius: 12px;
        background: var(--bg);
        border: 1px dashed var(--border-strong);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
        overflow: hidden;
      }
      .np-bar {
        display: flex;
        align-items: center;
        gap: 2px;
        width: min(240px, 100%);
        padding: 8px 12px;
        border-radius: 999px;
        /* 预览条复用真实导航的观感 */
        background: rgba(255, 253, 250, var(--nav-op, 0.66));
        border: 1px solid rgba(180, 168, 150, 0.3);
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16);
        -webkit-backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px));
        backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px));
      }
      [data-theme='dark'] .np-bar { background: rgba(42, 38, 33, var(--nav-op, 0.62)); }
      [data-theme='midnight'] .np-bar { background: rgba(33, 34, 58, var(--nav-op, 0.62)); }
      .np-dot { width: 22px; height: 22px; border-radius: 50%; background: var(--surface-3); }
      .np-dot:first-child { background: var(--accent); opacity: 0.85; }
      .np-note { font-size: 11px; color: var(--text-faint); }

      .theme-picks { display: flex; flex-wrap: wrap; gap: 8px; }

      .theme-pick {
        display: flex;
        border: 2px solid transparent;
        border-radius: 999px;
        overflow: hidden;
        padding: 2px;
        background: var(--surface-2);
        cursor: pointer;
      }
      .theme-pick.on { border-color: var(--accent); }

      .tp-dot { width: 16px; height: 16px; display: block; }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 0;
      }

      .row + .row { border-top: 1px solid var(--border); }

      .row-label { font-size: 14px; font-weight: 600; }

      .row-desc { font-size: 11px; color: var(--text-faint); margin-top: 2px; }

      .switch {
        flex: 0 0 auto;
        appearance: none;
        width: 52px;
        height: 30px;
        border-radius: 999px;
        background: var(--border-strong);
        position: relative;
        cursor: pointer;
        transition: background 0.2s;
        outline: none;
        border: none;
      }

      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #fff;
        transition: left 0.2s;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
      }

      .switch:checked {
        background: var(--accent);
      }

      .switch:checked::after { left: 25px; }

      .entry {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 0;
        text-decoration: none;
        color: var(--text);
        border-bottom: 1px solid var(--border);
      }

      .entry:last-child { border-bottom: none; }

      .entry-ico { font-size: 18px; }

      .entry-body { flex: 1; min-width: 0; }

      .entry-label { font-size: 14px; font-weight: 600; }

      .entry-desc { font-size: 11px; color: var(--text-faint); margin-top: 2px; }

      .entry-arrow { color: var(--text-faint); }

      .qr-row { display: flex; flex-direction: column; align-items: center; gap: 10px; }

      .qr-row img { width: 150px; height: 150px; border-radius: 12px; border: 2px solid var(--border); }

      .qr-note {
        font-size: 12px;
        color: var(--text-faint);
        text-align: center;
        line-height: 1.6;
      }

      .notice {
        font-size: 12px;
        color: var(--text-faint);
        line-height: 1.7;
        text-align: justify;
      }

      .copyright {
        margin-top: 18px;
        text-align: center;
        font-size: 12px;
        color: var(--text-faint);
      }

      /* ---------- 底部导航 ---------- */
      .bottom-nav {
        position: fixed;
        left: 50%;
        bottom: 16px;
        transform: translateX(-50%);
        z-index: 80;
        display: flex;
        align-items: center;
        gap: 2px;
        width: min(420px, calc(100% - 36px));
        padding: 8px 12px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 999px;
        box-shadow: 0 14px 40px var(--shadow-hover);
      }

      .bottom-nav a {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 7px 0 6px;
        border-radius: 14px;
        text-decoration: none;
        color: var(--text-faint);
        font-size: 10px;
        font-weight: 700;
        transition: color 0.2s, background 0.2s;
      }

      .bottom-nav a .nav-icon { font-size: 18px; line-height: 1; }

      .bottom-nav a.active {
        color: var(--accent);
        background: var(--surface-2);
      }
    
      /* ---------- 导航栏毛玻璃（苹果 Liquid Glass） ---------- */
      .bottom-nav {
        background: rgba(255, 253, 250, var(--nav-op, 0.66)) !important;
        -webkit-backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px)) saturate(180%);
        backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px)) saturate(180%);
        border-color: rgba(180, 168, 150, 0.30) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
      [data-theme="dark"] .bottom-nav {
        background: rgba(42, 38, 33, var(--nav-op, 0.62)) !important;
        border-color: rgba(255, 255, 255, 0.10) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
      html.glass-off .bottom-nav,
      html.glass-off [data-theme="dark"] .bottom-nav {
        background: var(--surface) !important;
        border-color: var(--border) !important;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      /* ---------- 毛玻璃切换动画（果冻惯性） ---------- */
      @keyframes glassJelly {
        0%   { transform: translateX(-50%) scale(1, 0.98) translateY(5px); }
        30%  { transform: translateX(-50%) scale(1.04, 0.99) translateY(-4px); }
        55%  { transform: translateX(-50%) scale(0.985, 1.012) translateY(3px); }
        78%  { transform: translateX(-50%) scale(1.01, 0.997) translateY(-1px); }
        100% { transform: translateX(-50%) scale(1, 1) translateY(0); }
      }
      .bottom-nav.jelly {
        animation: glassJelly 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes switchWobble {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.18) rotate(-5deg); }
        70%  { transform: scale(0.94) rotate(2deg); }
        100% { transform: scale(1) rotate(0); }
      }
      .switch.jelly { animation: switchWobble 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }

      .claim-box {
        font-family: ui-monospace, Menlo, Consolas, monospace;
        font-size: 12px;
        color: var(--text);
        background: var(--surface-2);
        border-radius: 8px;
        padding: 6px 10px;
        max-width: 190px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .claim-btn {
        flex: 0 0 auto;
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 7px 16px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }
      .claim-btn:disabled { opacity: 0.45; cursor: default; }
`,
  template: `<div class="container">
      <details class="guide" id="guideBox">
        <summary>
          <span class="guide-hero">
            <b>👋 第一次来？两分钟看完这个网站能做什么</b>
            <i>像素小镇 · 和朋友一起在线画像素画</i>
          </span>
          <span class="guide-arrow">⌄</span>
        </summary>
        <div class="guide-body">
          <div class="guide-grid">
            <div class="g-item">
              <span class="g-ico">🎨</span>
              <b>一个人画</b>
              <i>16 / 32 / 64 三种尺寸，32 色彩板，橡皮、颜料桶、取色器、镜像、草稿槽，随时导出 PNG。</i>
            </div>
            <div class="g-item">
              <span class="g-ico">👥</span>
              <b>多人一起画</b>
              <i>建房后把口令发给朋友，同一块画布上同时落笔，谁都能看到对方画到哪。</i>
            </div>
            <div class="g-item">
              <span class="g-ico">🖼️</span>
              <b>发到社区</b>
              <i>上传作品进社区广场，被人点赞、投票，还能生成朋友圈小卡片分享。</i>
            </div>
            <div class="g-item">
              <span class="g-ico">📷</span>
              <b>照片变像素</b>
              <i>用「像素相机」把照片一键转成像素画，再手动改几笔就是你的作品。</i>
            </div>
            <div class="g-item">
              <span class="g-ico">🏆</span>
              <b>每周主题比赛</b>
              <i>开启后按题目作画，参赛作品能参加投票，赢的是本周最受欢迎的一张。</i>
            </div>
            <div class="g-item">
              <span class="g-ico">✋</span>
              <b>手型平移</b>
              <i>选 ✋ 只拖动画布不落笔；任何工具下点 ✥ 都能切成拖动模式。</i>
            </div>
          </div>
          <div class="guide-tips">
            <b>💡 三个上手小提示</b>
            <ul>
              <li>画错了按 <kbd>↩️</kbd> 撤销；手机上也可以直接点工具栏的撤销。</li>
              <li>点底部「社区」看看别人画了什么，喜欢的可以点♥。</li>
              <li>不想被复杂界面打扰？到下面「画板布局」里把用不到的都关掉。</li>
            </ul>
          </div>
          <button class="guide-close" id="guideClose" type="button">我知道了，开始画画</button>
        </div>
      </details>

      <details class="guide" id="authorNote">
        <summary>
          <span class="guide-hero">
            <b>💌 作者的话</b>
            <i>这个网站是谁做的，以及为什么需要你的支持</i>
          </span>
          <span class="guide-arrow">⌄</span>
        </summary>
        <div class="guide-body">
          <p class="an-p">
            「像素小镇」里的每一行代码、每一处界面，都是我借助 AI 一个字一个字搭出来的。
            说实话，一个人做完整点的东西很难，这个网站能走到今天，很大程度上靠的是 AI 帮我扛下了大部分的活。
          </p>
          <p class="an-p">
            也正因为这样，它更新得很慢。AI 本身要花钱调用接口，而我没有太多经费去长期承担这笔开销；
            加上我还要同时维护灯板那一端，能挤出来做网站的时间就非常有限。
            所以它不是被弃置了，而是真的<b>有心无力</b>——我不想随便糊弄你们，更不想让 AI 写出自己都看不懂的代码。
          </p>
          <p class="an-p an-quote">
            做这个网站，其实是为了圆我自己一个很小的愿望：<b>拥有一个真正属于自己的、能和朋友实时互动的小网站。</b><br />
            不是玩完就走的应用，不是关掉就消失的网页，而是一个我说了算、你也随时能来的地方。
            现在的它已经做到了——你们能一起画同一块画布，能看到彼此的笔迹，这就是我当初想要的全部。
          </p>
          <p class="an-p">
            继续维护它需要服务器和接口的钱。如果它陪你画过几次画，你愿意给我一点支持，
            它就能安稳地多运行一段时间，我也更有底气慢慢把想做的都补上。
          </p>
          <p class="an-p an-last">
            当然，赞助完全出于自愿，不给也一点都不影响使用。谢谢每一个愿意留下来画画的人。
          </p>
        </div>
      </details>

      <div class="header">
        <div class="header-text">
          <h1>设置</h1>
          <div class="header-sub">调整外观、了解像素小镇</div>
        </div>
        <button class="theme-btn" id="themeBtn" type="button" title="切换主题">🌙</button>
      </div>

      <section class="group fold">
        <button class="fold-head" id="layFold" type="button" aria-expanded="false">
          <span class="fold-title">画板布局</span>
          <span class="fold-count" id="layCount"></span>
          <span class="fold-arrow">⌄</span>
        </button>
        <div class="fold-body" id="layFoldBody" hidden>
          <div class="group-hint">调整画板上显示哪些区域，让画布更大、界面更清爽。</div>
          <label class="lay-row">
            <input type="checkbox" id="layAllOn">
            <span class="lay-body"><b>全部显示</b><i>一键恢复默认</i></span>
          </label>
          <div class="lay-child" id="layBox"></div>
        </div>
      </section>

      <section class="group fold">
        <button class="fold-head" id="featFold" type="button" aria-expanded="false">
          <span class="fold-title">进阶功能</span>
          <span class="fold-count" id="featCount"></span>
          <span class="fold-arrow">⌄</span>
        </button>
        <div class="fold-body" id="featFoldBody" hidden>
          <div class="group-hint">这些功能默认都是关闭的，用不到就保持关闭，画板会更简单。只影响你这台设备。</div>
          <div id="featBox"></div>
          <div class="feat-all">
            <button class="feat-btn" id="featAllOff" type="button">全部关闭</button>
            <button class="feat-btn" id="featAllOn" type="button">全部开启</button>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="group-title">外观</div>
        <div class="row">
          <div>
            <div class="row-label">深色模式</div>
            <div class="row-desc">适合在夜里画画，保护眼睛</div>
          </div>
          <input class="switch" id="darkSwitch" type="checkbox" role="switch">
        </div>
        <div class="row row-col">
          <div class="slider-head">
            <div>
              <div class="row-label">底部导航透明度</div>
              <div class="row-desc">拖动即可实时预览，越低越通透</div>
            </div>
            <span class="slider-val" id="navOpVal">66%</span>
          </div>
          <input class="slider" id="navOpSlider" type="range" min="0" max="100" step="1" value="66"
                 aria-label="底部导航透明度">
          <div class="slider-presets" id="navOpPresets">
            <button type="button" data-v="0">全透明</button>
            <button type="button" data-v="35">很透</button>
            <button type="button" data-v="66">默认</button>
            <button type="button" data-v="88">偏实</button>
            <button type="button" data-v="100">完全不透明</button>
          </div>
          <div class="nav-preview" id="navPreview">
            <span class="np-bar">
              <i class="np-dot"></i><i class="np-dot"></i><i class="np-dot"></i><i class="np-dot"></i>
            </span>
            <span class="np-note">这就是底部导航的样子</span>
          </div>
        </div>
        <div class="row">
          <div>
            <div class="row-label">提示音效</div>
            <div class="row-desc">操作时的轻提示音，如保存成功的「叮」</div>
          </div>
          <input class="switch" id="sfxSwitch" type="checkbox" role="switch">
        </div>
        <div class="row row-col">
          <div>
            <div class="row-label">配色主题</div>
            <div class="row-desc">换一套画板的整体色调</div>
          </div>
          <div class="theme-picks" id="themePicks"></div>
        </div>
        <div class="row">
          <div>
            <div class="row-label">玻璃导航</div>
            <div class="row-desc">底部导航使用苹果风的毛玻璃质感</div>
          </div>
          <input class="switch" id="glassSwitch" type="checkbox" role="switch">
        </div>
      </section>

      <section class="group">
        <div class="group-title">启动</div>
        <div class="row">
          <div>
            <div class="row-label">启动直达社区</div>
            <div class="row-desc">每次进入先打开社区；若有未完成的绘画内容，则自动进入画板继续创作</div>
          </div>
          <input class="switch" id="entranceSwitch" type="checkbox" role="switch">
        </div>
      </section>

      <section class="group">
        <div class="group-title">认领码</div>
        <div class="row">
          <div>
            <div class="row-label">我的认领码</div>
            <div class="row-desc">用于删除自己上传的作品；只保存在这台设备，请自行备份</div>
          </div>
          <span class="claim-box" id="claimBox">未生成</span>
        </div>
        <div class="row">
          <div>
            <div class="row-label">复制认领码</div>
            <div class="row-desc">换设备或清缓存前务必保存，丢失后无法再删除旧作品</div>
          </div>
          <button class="claim-btn" id="claimCopyBtn" type="button">复制</button>
        </div>
      </section>

      <section class="group">
        <div class="group-title">我的数据</div>
        <div class="row">
          <div>
            <div class="row-label">历史记录</div>
            <div class="row-desc">画板页展示你的绘画历史，社区按时间排序可一直往回翻</div>
          </div>
          <router-link class="entry-arrow" to="/paint" style="text-decoration:none;color:var(--accent);font-weight:700">去画板 →</router-link>
        </div>
      </section>

      <section class="group">
        <div class="group-title">更多</div>
        <router-link class="entry" to="/terms">
          <span class="entry-ico">📄</span>
          <span class="entry-body">
            <span class="entry-label">使用条款</span>
            <div class="entry-desc">服务说明与规范</div>
          </span>
          <span class="entry-arrow">›</span>
        </router-link>
        <router-link class="entry" to="/changelog">
          <span class="entry-ico">📦</span>
          <span class="entry-body">
            <span class="entry-label">更新日志</span>
            <div class="entry-desc">看看像素小镇最近又更新了什么</div>
          </span>
          <span class="entry-arrow">›</span>
        </router-link>
        <router-link class="entry" to="/faq">
          <span class="entry-ico">❓</span>
          <span class="entry-body">
            <span class="entry-label">常见问题</span>
            <div class="entry-desc">为什么没有 128×128？以及其他说明</div>
          </div>
          <span class="entry-arrow">›</span>
        </router-link>
        <router-link class="entry" to="/admin">
          <span class="entry-ico">🛡️</span>
          <span class="entry-body">
            <span class="entry-label">维护社区稳定</span>
            <div class="entry-desc">维护者计划 · 发送正式申请书信后可加入</div>
          </span>
          <span class="entry-arrow">›</span>
        </router-link>
        <div class="row">
          <div>
            <div class="row-label">问题反馈</div>
            <div class="row-desc">微信 Tux123233 或邮箱 linsifan123233@petalmail.com</div>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="group-title">赞赏支持</div>
        <div class="qr-row">
          <img src="/images/赞赏码.jpg" alt="赞赏码">
          <div class="qr-note">喜欢像素小镇？长按识别二维码 → 扫码赞赏，感谢你的支持！<br>每一格光，都由大家点亮</div>
        </div>
      </section>

      <div class="notice">
        本画板仅用于个人学习与技术交流。请勿上传、绘制、发布任何违反中华人民共和国法律法规的内容。上传者须对自己发布的内容负全部法律责任。本平台有权在不事先通知的情况下删除违规内容，并保留追究法律责任的权利。
      </div>

      <div class="copyright">© 2026 像素小镇 · 版权所有 · 作者 Lin Sifan</div>
    </div>`,
  mounted() {
      const darkSwitch = document.getElementById('darkSwitch')
      const themeBtn = document.getElementById('themeBtn')
      const entranceSwitch = document.getElementById('entranceSwitch')

      try {
        entranceSwitch.checked = localStorage.getItem('lw-entrance') === 'community'
      } catch (e) {}

      entranceSwitch.addEventListener('change', () => {
        try {
          localStorage.setItem('lw-entrance', entranceSwitch.checked ? 'community' : '')
        } catch (e) {}
      })

      function syncThemeUI() {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark'
        darkSwitch.checked = dark
        themeBtn.textContent = dark ? '☀️' : '🌙'
      }

      const glassSwitch = document.getElementById('glassSwitch')
      glassSwitch.checked = localStorage.getItem('lw-glass') !== '0'
      function applyGlass() {
        document.documentElement.classList.toggle('glass-off', !glassSwitch.checked)
      }
      glassSwitch.addEventListener('change', () => {
        try {
          localStorage.setItem('lw-glass', glassSwitch.checked ? '1' : '0')
        } catch (e) {}
        applyGlass()
        document.querySelectorAll('.bottom-nav').forEach((nav) => {
          nav.classList.remove('jelly')
          void nav.offsetWidth
          nav.classList.add('jelly')
        })
        glassSwitch.classList.remove('jelly')
        void glassSwitch.offsetWidth
        glassSwitch.classList.add('jelly')
      })
      applyGlass()

      /* ---------- 折叠分组 ---------- */
      function setupFold(headId, bodyId, countId, items, isOn) {
        const head = document.getElementById(headId)
        const body = document.getElementById(bodyId)
        const cnt = document.getElementById(countId)
        if (!head || !body) return
        const paint = () => {
          const on = items.filter((k) => isOn(k)).length
          if (cnt) cnt.textContent = on + ' / ' + items.length
        }
        head.addEventListener('click', () => {
          const open = body.hidden
          body.hidden = !open
          head.setAttribute('aria-expanded', String(open))
          head.classList.toggle('open', open)
          paint()
        })
        paint()
        return paint
      }

      /* ---------- 画板布局（母/子） ---------- */
      const LAYOUTS = [
        { key: 'size', label: '画布尺寸栏', desc: '切换 16/32/64 的按钮' },
        { key: 'tools', label: '工具栏', desc: '画笔、橡皮、颜料桶等' },
        { key: 'history', label: '我的绘画历史', desc: '画板下方的历史作品区' },
        { key: 'join', label: '参赛卡片', desc: '每日挑战 / 本周主题的勾选卡' },
        { key: 'name', label: '作品名与作者名', desc: '上传前的两个输入框' },
        { key: 'actions', label: '操作按钮', desc: '撤销、清空、导出、上传' },
        { key: 'hint', label: '操作提示', desc: '画布下方那行说明文字' },
        { key: 'disclaimer', label: '使用须知与版权', desc: '底部说明与赞赏支持' },
      ]
      const layKey = (k) => 'lw-lay-' + k
      function isLayOn(k) {
        try {
          return localStorage.getItem(layKey(k)) !== '0'
        } catch (e) {
          return true
        }
      }
      function setLay(k, on) {
        try {
          localStorage.setItem(layKey(k), on ? '1' : '0')
        } catch (e) {}
      }
      function renderLayoutSwitches() {
        const box = document.getElementById('layBox')
        if (!box) return
        box.innerHTML = ''
        LAYOUTS.forEach((L) => {
          const row = document.createElement('label')
          row.className = 'lay-child-row'
          const cb = document.createElement('input')
          cb.type = 'checkbox'
          cb.checked = isLayOn(L.key)
          const body = document.createElement('span')
          body.className = 'lay-body'
          const b = document.createElement('b')
          b.textContent = L.label
          const i = document.createElement('i')
          i.textContent = L.desc
          body.append(b, i)
          cb.addEventListener('change', () => {
            setLay(L.key, cb.checked)
            toast((cb.checked ? '已显示「' : '已隐藏「') + L.label + '」')
          })
          row.append(cb, body)
          box.appendChild(row)
        })
        syncLayAll()
      }
      function syncLayAll() {
        const all = document.getElementById('layAllOn')
        if (!all) return
        all.checked = LAYOUTS.every((L) => isLayOn(L.key))
      }
      const layAllOn = document.getElementById('layAllOn')
      if (layAllOn) {
        layAllOn.addEventListener('change', () => {
          LAYOUTS.forEach((L) => setLay(L.key, layAllOn.checked))
          renderLayoutSwitches()
          toast(layAllOn.checked ? '已显示画板全部区域' : '已隐藏画板全部区域')
        })
      }
      renderLayoutSwitches()

      /* 画板布局折叠：LAYOUTS 已定义，可安全绑定 */
      setupFold(
        'layFold',
        'layFoldBody',
        'layCount',
        LAYOUTS.map((L) => L.key),
        isLayOn
      )

      /* ---------- 轻提示 ---------- */
      let featToastTimer = null
      function toast(msg) {
        const el = document.getElementById('toast')
        if (!el) return
        el.textContent = msg
        el.classList.add('show')
        clearTimeout(featToastTimer)
        featToastTimer = setTimeout(() => el.classList.remove('show'), 1600)
      }

      /* ---------- 进阶功能开关（默认全关） ---------- */
      const FEATURES = [
        { key: 'prompt', label: '题目模式', desc: '按主题出题创作，顶部有换题按钮' },
        { key: 'anim', label: '帧动画', desc: '逐帧作画并导出循环 GIF' },
        { key: 'daily', label: '每日挑战', desc: '每天一个题目，作品进当日榜' },
        { key: 'contest', label: '本周主题比赛', desc: '每周一个主题，社区投票选最佳' },
        { key: 'image', label: '📷 像素相机', desc: '把照片变成像素画再继续手改' },
        { key: 'mirror', label: '镜像绘制', desc: '落笔自动左右对称' },
        { key: 'drafts', label: '多草稿槽', desc: '同时保存 3 幅草稿，随时切换' },
        { key: 'tags', label: '作品标签', desc: '给作品加标签，方便别人搜到' },
      ]
      const featKey = (k) => 'lw-feat-' + k
      function isFeatOn(k) {
        try {
          return localStorage.getItem(featKey(k)) === '1'
        } catch (e) {
          return false
        }
      }
      function setFeat(k, on) {
        try {
          localStorage.setItem(featKey(k), on ? '1' : '0')
        } catch (e) {}
      }
      const featBox = document.getElementById('featBox')
      if (featBox) {
        FEATURES.forEach((f) => {
          const row = document.createElement('div')
          row.className = 'row'
          const left = document.createElement('div')
          const lb = document.createElement('div')
          lb.className = 'row-label'
          lb.textContent = f.label
          const ds = document.createElement('div')
          ds.className = 'row-desc'
          ds.textContent = f.desc
          left.append(lb, ds)
          const sw = document.createElement('input')
          sw.type = 'checkbox'
          sw.className = 'switch'
          sw.setAttribute('role', 'switch')
          sw.id = 'feat-' + f.key
          sw.checked = isFeatOn(f.key)
          sw.addEventListener('change', () => {
            setFeat(f.key, sw.checked)
            toast(sw.checked ? '已开启「' + f.label + '」' : '已关闭「' + f.label + '」')
          })
          row.append(left, sw)
          featBox.appendChild(row)
        })
      }
      /* 进阶功能折叠：必须等 FEATURES 定义与列表渲染完成后再绑定 */
      setupFold(
        'featFold',
        'featFoldBody',
        'featCount',
        FEATURES.map((F) => F.key),
        isFeatOn
      )

      document.getElementById('featAllOff').addEventListener('click', () => {
        FEATURES.forEach((f) => setFeat(f.key, false))
        syncFeatSwitches()
        toast('已关闭全部进阶功能')
      })
      document.getElementById('featAllOn').addEventListener('click', () => {
        FEATURES.forEach((f) => setFeat(f.key, true))
        syncFeatSwitches()
        toast('已开启全部进阶功能')
      })
      function syncFeatSwitches() {
        FEATURES.forEach((f) => {
          const el = document.getElementById('feat-' + f.key)
          if (el) el.checked = isFeatOn(f.key)
        })
      }

      /* ---------- 认领码 ---------- */
      const claimBox = document.getElementById('claimBox')
      const claimCopyBtn = document.getElementById('claimCopyBtn')
      const CLAIM_KEY = 'paintClaim'
      function readClaim() {
        try {
          return localStorage.getItem(CLAIM_KEY) || ''
        } catch (e) {
          return ''
        }
      }
      function paintClaimUI() {
        const c = readClaim()
        claimBox.textContent = c || '未生成'
        claimCopyBtn.disabled = !c
      }
      claimCopyBtn.addEventListener('click', async () => {
        const c = readClaim()
        if (!c) return
        try {
          await navigator.clipboard.writeText(c)
          claimCopyBtn.textContent = '已复制'
          setTimeout(() => {
            claimCopyBtn.textContent = '复制'
          }, 1500)
        } catch (e) {
          claimBox.textContent = c
        }
      })
      paintClaimUI()

      /* ---------- 配色主题 ---------- */
      const THEMES = [
        { id: 'light', name: '暖白', c1: '#fdf8f2', c2: '#f2ece2', c3: '#5b8def' },
        { id: 'dark', name: '夜间', c1: '#211c17', c2: '#18140f', c3: '#76a3ff' },
        { id: 'sakura', name: '樱粉', c1: '#fdf2f5', c2: '#f0b9c9', c3: '#e0698a' },
        { id: 'sea', name: '海盐', c1: '#f0f8fa', c2: '#a8d5e0', c3: '#2f93a8' },
        { id: 'mint', name: '薄荷', c1: '#f2f9f1', c2: '#a9d9b2', c3: '#3f9c5c' },
        { id: 'sunset', name: '暖阳', c1: '#fff6ec', c2: '#f6c896', c3: '#d9823e' },
        { id: 'midnight', name: '夜阑', c1: '#21223a', c2: '#4a4a80', c3: '#8b7cf0' },
      ]
      function applyTheme(id) {
        const t = THEMES.find((x) => x.id === id) ? id : 'light'
        document.documentElement.setAttribute('data-theme', t)
        try {
          localStorage.setItem('lw-theme', t)
        } catch (e) {}
        syncThemePicks()
        if (typeof syncThemeUI === 'function') syncThemeUI()
      }
      function syncThemePicks() {
        const cur = document.documentElement.getAttribute('data-theme') || 'light'
        document.querySelectorAll('.theme-pick').forEach((el) => {
          el.classList.toggle('on', el.dataset.theme === cur)
        })
      }
      const themePicks = document.getElementById('themePicks')
      if (themePicks) {
        THEMES.forEach((t) => {
          const b = document.createElement('button')
          b.type = 'button'
          b.className = 'theme-pick'
          b.dataset.theme = t.id
          b.title = t.name
          b.setAttribute('aria-label', t.name)
          b.innerHTML =
            '<span class="tp-dot" style="background:' + t.c1 + '"></span>' +
            '<span class="tp-dot" style="background:' + t.c2 + '"></span>' +
            '<span class="tp-dot" style="background:' + t.c3 + '"></span>'
          b.addEventListener('click', () => applyTheme(t.id))
          themePicks.appendChild(b)
        })
        syncThemePicks()
      }

      /* 教程：首次自动展开，看过之后记住选择 */
      const guideBox = document.getElementById('guideBox')
      const GUIDE_KEY = 'lw-guide-seen'
      if (guideBox) {
        let seen = false
        try {
          seen = localStorage.getItem(GUIDE_KEY) === '1'
        } catch (e) {}
        guideBox.open = !seen
        guideBox.addEventListener('toggle', () => {
          if (!guideBox.open) markSeen()
        })
      }
      function markSeen() {
        try {
          localStorage.setItem(GUIDE_KEY, '1')
        } catch (e) {}
      }
      const guideClose = document.getElementById('guideClose')
      if (guideClose)
        guideClose.addEventListener('click', () => {
          markSeen()
          if (guideBox) guideBox.open = false
          toast('祝你画得开心 🎨')
        })

      /* ---------- 底部导航透明度：实时预览 ---------- */
      const NAV_OP_KEY = 'lw-nav-op'
      const navOpSlider = document.getElementById('navOpSlider')
      const navOpVal = document.getElementById('navOpVal')
      const navOpPresets = document.getElementById('navOpPresets')

      function applyNavOp(v) {
        const n = Math.max(0, Math.min(100, Math.round(Number(v) || 0)))
        const ratio = (n / 100).toFixed(3)
        // 写到根元素，所有页面（含底部导航本体）立即生效
        document.documentElement.style.setProperty('--nav-op', ratio)
        if (navOpSlider) navOpSlider.value = String(n)
        if (navOpVal) navOpVal.textContent = n + '%'
        if (navOpPresets) {
          navOpPresets.querySelectorAll('button').forEach((b) => {
            b.classList.toggle('on', Number(b.dataset.v) === n)
          })
        }
        return n
      }

      // 全局函数：设置页之外（如管理页）也能调用
      window.setNavOpacity = function (v) {
        const n = applyNavOp(v)
        try {
          localStorage.setItem(NAV_OP_KEY, String(n))
        } catch (e) {}
        return n
      }

      if (navOpSlider) {
        let saved = 66
        try {
          const raw = localStorage.getItem(NAV_OP_KEY)
          if (raw !== null && raw !== '') saved = Number(raw)
        } catch (e) {}
        // 进入设置页先把已保存的值应用到真实导航
        applyNavOp(saved)
        // 拖动时只改内存，不落盘；松手才保存，避免频繁写 localStorage
        navOpSlider.addEventListener('input', () => {
          applyNavOp(navOpSlider.value)
        })
        const commit = () => {
          try {
            localStorage.setItem(NAV_OP_KEY, String(Number(navOpSlider.value)))
          } catch (e) {}
        }
        navOpSlider.addEventListener('change', commit)
        navOpSlider.addEventListener('pointerup', commit)
        navOpSlider.addEventListener('touchend', commit)
      }
      if (navOpPresets) {
        navOpPresets.addEventListener('click', (e) => {
          const b = e.target.closest('button[data-v]')
          if (!b) return
          window.setNavOpacity(b.dataset.v)
          if (window.sfx) window.sfx('tick')
        })
      }

      const sfxSwitch = document.getElementById('sfxSwitch')
      if (sfxSwitch) {
        sfxSwitch.checked = window.getSfx ? window.getSfx() : true
        sfxSwitch.addEventListener('change', () => {
          if (window.setSfx) window.setSfx(sfxSwitch.checked)
          toast(sfxSwitch.checked ? '音效已开启' : '音效已关闭')
        })
      }

      function setTheme(dark) {
        applyTheme(dark ? 'dark' : 'light')
        syncThemeUI()
      }

      darkSwitch.addEventListener('change', () => setTheme(darkSwitch.checked))
      themeBtn.addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') !== 'dark'))

      syncThemeUI()
  },
}
