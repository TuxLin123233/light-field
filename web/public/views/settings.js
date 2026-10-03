// 由 settings.html 自动转换为 Vue 3 视图（无构建）
export default {
  name: 'settings',
  title: '设置',
  css: `
      /* 返回键：以前这三个页面既没有底部导航、也没有返回按钮，
         进去了只能按浏览器的后退。齿轮按钮删掉之后更是彻底出不去。 */
      .st-back {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 6px 13px;
        font-size: 12px;
        font-weight: 700;
        text-decoration: none;
        margin-bottom: 12px;
      }
      /* hidden 属性兜底：避免类选择器里的 display 覆盖 UA 的 [hidden]{display:none} */
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
      [data-mood="dark"] {
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

      /* ---------- 动画强度 ---------- */
      .anim-lv-tip {
        font-size: 11.5px;
        color: var(--text-faint);
        line-height: 1.7;
        margin-top: 8px;
      }
      .anim-lv-tip b { color: var(--text-muted); }

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


      /* ---------- 联系与社区：不透明的一张卡 ---------- */
      .contact-card {
        /* 用不透明的 surface，不跟导航栏那套透明度联动 */
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 4px 14px;
        box-shadow: 0 2px 10px var(--shadow2, rgba(0, 0, 0, 0.06));
        opacity: 1;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }
      .contact-card .entry {
        background: transparent;
        padding: 13px 0;
      }
      .contact-card .entry:hover { background: var(--surface-2); }
      .entry-sep {
        height: 1px;
        background: var(--border);
        margin: 0 -14px;
      }

      /* ---------- 可折叠分组（外观 / 启动与导航） ---------- */
      /* 用独立的 .foldx，不复用 .fold —— 否则会连原有的
         「画板布局」「进阶功能」左右内边距一起清掉 */
      .group.foldx { padding: 0; overflow: hidden; }
      .group-fold {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        border: 0;
        margin: 0;
        padding: 14px;
        font-family: inherit;
        font-size: inherit;
        color: inherit;
        cursor: pointer;
        text-align: left;
        -webkit-appearance: none;
        appearance: none;
      }
      .group-fold .group-title {
        flex: 1;
        min-width: 0;
        margin: 0;
        /* 原样式是分组小标题的浅色小字，折叠头上要更醒目 */
        font-size: 15px;
        font-weight: 800;
        color: var(--text);
      }
      .fold-caret {
        font-size: 12px;
        color: var(--text-faint);
        transition: transform 0.2s ease;
        flex: none;
        line-height: 1;
      }
      .group-fold[aria-expanded='false'] .fold-caret { transform: rotate(-90deg); }
      .group-fold:active { opacity: 0.7; }
      .group.foldx .fold-body { padding: 0 14px 4px; }
      .group-fold[aria-expanded='false'] + .fold-body { display: none; }

      /* ---------- 致谢：与联系卡同风格 ---------- */
      .credit-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 4px 14px;
        box-shadow: 0 2px 10px var(--shadow2, rgba(0, 0, 0, 0.06));
        opacity: 1;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }
      .credit-card .entry {
        background: transparent;
        padding: 13px 0;
      }
      .credit-card .entry:hover { background: var(--surface-2); }
      .credit-note {
        margin: 10px 4px 0;
        font-size: 12px;
        line-height: 1.6;
        color: var(--text-muted, #6b5f50);
      }

      /* ---------- 单选组（启动页 / 导航位置） ---------- */
      .radio-row { display: flex; flex-wrap: wrap; gap: 8px; }
      /* 「启动时打开」四个一排太窄(每格只剩 ~85px, 文字被挤),
         改两列，每格宽一倍 */
      #entranceRow {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      #entranceRow .radio-chip {
        flex-direction: column;
        gap: 2px;
        padding: 8px 2px;
        min-width: 0;
      }
      #entranceRow .radio-chip .rc-ico { font-size: 16px; }
      #entranceRow .radio-chip .rc-txt {
        font-size: 12px;
        white-space: nowrap;
      }
      .radio-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 9px 14px;
        border-radius: 999px;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text-muted);
        font-size: 13px;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .radio-chip.on {
        border-color: var(--accent);
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 12%, var(--surface));
        font-weight: 600;
      }
      .radio-chip .rc-ico { font-size: 15px; }

      /* ---------- 导航排序 ---------- */
      /* 6 款导航样式：三列每格太窄，预览条和标签都挤，改两列 */
      .nav-style-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .ns-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 9px 4px 7px;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: var(--surface-2);
        cursor: pointer;
        transition: border-color 0.15s, transform 0.12s;
      }
      .ns-item:active { transform: scale(0.94); }
      .ns-item.on { border-color: var(--accent); }
      .ns-bar {
        width: 100%;
        height: 16px;
        border-radius: 999px;
        border: 1px solid var(--border-strong);
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        overflow: hidden;
      }
      .ns-bar i { width: 4px; height: 4px; border-radius: 50%; background: var(--text-faint); }
      .ns-item.on .ns-bar i.on { background: var(--accent); width: 12px; border-radius: 999px; }
      .ns-name { font-size: 11px; color: var(--text-muted); }
      .ns-item.on .ns-name { color: var(--accent); font-weight: 600; }

      .order-list { display: flex; flex-direction: column; gap: 8px; }
      .order-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--surface-2);
        font-size: 14px;
        color: var(--text);
      }
      .order-item .oi-ico { font-size: 17px; }
      .order-item .oi-name { font-weight: 600; }
      .order-item .oi-pos { margin-left: auto; font-size: 11px; color: var(--text-faint); }
      .order-btns { display: flex; gap: 5px; margin-left: auto; }
      .order-btns button {
        width: 30px;
        height: 30px;
        border-radius: 9px;
        border: 1px solid var(--border-input);
        background: var(--surface);
        color: var(--text-muted);
        font-size: 13px;
        cursor: pointer;
      }
      .order-btns button:disabled { opacity: 0.35; cursor: default; }

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
      .np-dot {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--surface-3) calc(var(--nav-op, 0.66) * 100%), var(--surface-2));
        color: color-mix(in srgb, var(--text-faint) calc(var(--nav-op, 0.66) * 100%), var(--text));
        border: 1px solid color-mix(in srgb, var(--border) calc((1 - var(--nav-op, 0.66)) * 70%), transparent);
      }
      .np-dot:first-child { background: var(--accent); opacity: 0.85; }
      .np-note { font-size: 11px; color: var(--text-faint); }

      .theme-groups { display: flex; flex-direction: column; gap: 12px; }
      .theme-group-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted);
        margin-bottom: 7px;
      }
      .theme-group-label .tgl-ico { font-size: 13px; }
      .theme-picks { display: flex; flex-wrap: wrap; gap: 8px; }

      .theme-pick {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        border: 2px solid transparent;
        border-radius: 12px;
        padding: 4px 6px 5px;
        background: var(--surface-2);
        cursor: pointer;
        transition: border-color 0.15s, transform 0.12s;
      }
      .theme-pick:active { transform: scale(0.93); }
      .theme-pick.on { border-color: var(--accent); }
      .tp-bar { display: flex; border-radius: 999px; overflow: hidden; }
      .tp-dot { width: 15px; height: 15px; display: block; }
      .tp-name { font-size: 10px; color: var(--text-muted2); line-height: 1.3; white-space: nowrap; }
      .theme-pick.on .tp-name { color: var(--accent); font-weight: 600; }
      .theme-hint { font-size: 12px; color: var(--text-faint); text-align: center; padding-top: 2px; }
      .theme-hint b { color: var(--accent); }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 0;
      }

      /* 竖排分组。必须写在 .row 之后：两者优先级相同（同为单类选择器），
         后写的赢。之前这条写在 .row 前面，被 .row 的 align-items:center
         覆盖掉，父级就变成「按内容收缩」，
         里面的 grid 用 1fr 分宽度却分不到（容器缩成 68px、每格只剩 30px），
         表现就是「启动页四个按钮太窄」「导航样式六个按钮太窄」。 */
      .row-col {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
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
      /* ---------- 版本与更新 ---------- */
      .upd-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px;
      }
      .upd-top { display: flex; align-items: center; }
      .upd-top > .upd-main { flex: 1; min-width: 0; }
      .upd-label { font-size: 12px; color: var(--text-faint); }
      .upd-ver { font-size: 15px; font-weight: 800; color: var(--text); margin-top: 2px; }
      .upd-btn {
        flex: none;
        margin-left: 12px;
        border: 0;
        border-radius: 999px;
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 800;
        font-family: inherit;
        color: #fff;
        background: var(--accent);
        cursor: pointer;
      }
      .upd-btn[disabled] { opacity: 0.6; cursor: default; }
      .upd-note { margin-top: 10px; font-size: 12px; line-height: 1.7; color: var(--text-faint); }
      .upd-note.fresh { color: #b8860b; font-weight: 700; }

      /* 两张收款码并排。两边都用**宽度**自适应、高度 auto ——
         支付宝那张是 1080×1620 的竖版海报，写死成正方形会把它压扁。
         不用 flex 的 gap：微信 X5 内核不支持，间距会整个塌成 0。 */
      .qr-row { display: flex; align-items: flex-start; justify-content: center; }
      .qr-item { flex: 1; max-width: 47%; display: flex; flex-direction: column; align-items: center; }
      .qr-item + .qr-item { margin-left: 12px; }
      .qr-item img { width: 100%; height: auto; display: block; border-radius: 12px; border: 2px solid var(--border); }
      .qr-item b { margin-top: 6px; font-size: 12px; font-weight: 700; color: var(--text-muted); }

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
        /* 导航越透明，文字反而越清晰、每个图标越自带底衬，保证任何内容上都能看清 */
        color: color-mix(in srgb, var(--text-faint) calc(var(--nav-op, 0.66) * 100%), var(--text));
        background: transparent;
        text-shadow: 0 0 calc((1 - var(--nav-op, 0.66)) * 5px)
          rgba(var(--nav-halo, 255, 255, 255), calc((1 - var(--nav-op, 0.66)) * 0.95));
        font-size: 10px;
        font-weight: 700;
        transition: color 0.2s, background 0.2s;
      }

      .bottom-nav a .nav-icon { font-size: 18px; line-height: 1; }

      .bottom-nav a.active {
        color: var(--accent);
        background: color-mix(in srgb, rgb(var(--nav-base, 255, 253, 250)) 82%, var(--accent));
      }
    
      /* ---------- 导航栏毛玻璃（苹果 Liquid Glass） ---------- */
      .bottom-nav {
        background: rgba(var(--nav-base, 255, 253, 250), var(--nav-op, 0.66)) !important;
        -webkit-backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px)) saturate(180%);
        backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px)) saturate(180%);
        border-color: rgba(180, 168, 150, 0.30) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
      [data-mood="dark"] .bottom-nav {
        background: rgba(var(--nav-base, 42, 38, 33), var(--nav-op, 0.62)) !important;
        border-color: rgba(255, 255, 255, 0.10) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
      html.glass-off .bottom-nav,
      html.glass-off [data-mood="dark"] .bottom-nav {
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

                  `,
  template: `<div class="container">
        <router-link class="st-back" to="/mine">← 我的</router-link>
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
              <span class="g-ico">🖼️</span>
              <b>发到社区</b>
              <i>上传作品进社区广场，别人可以送你光尘、投你一票，还能生成朋友圈小卡片分享。</i>
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
              <li>点底部「社区」看看别人画了什么，喜欢的可以点♥；再点一次能取消。</li>
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

      <section class="group foldx">
        <button class="group-fold" id="foldLook" type="button" aria-expanded="true">
          <span class="group-title">🎨 外观</span>
          <span class="fold-caret">▾</span>
        </button>
        <div class="fold-body" id="foldLookBody">
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
              <div class="row-label">动画强度</div>
              <div class="row-desc">
                动效越多越费电、低端机上越容易掉帧。卡就往左调
              </div>
            </div>
            <span class="slider-val" id="animLvVal">标准</span>
          </div>
          <div class="radio-row" id="animLvRow">
            <button class="radio-chip" type="button" data-animlv="off">关闭</button>
            <button class="radio-chip" type="button" data-animlv="low">省电</button>
            <button class="radio-chip" type="button" data-animlv="std">标准</button>
            <button class="radio-chip" type="button" data-animlv="rich">丰富</button>
          </div>
          <div class="anim-lv-tip" id="animLvTip"></div>
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
            <div class="row-label">
              提示音效
              <!-- 开着的时候有个跳动的波形，一眼看出音效是开的 -->
              <span id="sfxWaveHost"></span>
            </div>
            <div class="row-desc">点按钮时的轻响，比如保存成功那声「叮」</div>
          </div>
          <input class="switch" id="sfxSwitch" type="checkbox" role="switch">
        </div>
        <div class="row row-col">
          <div class="slider-head">
            <div>
              <div class="row-label">音效音量</div>
              <div class="row-desc">松开手指试听一下，嫌吵就调小</div>
            </div>
            <span class="slider-val" id="sfxVolVal">80%</span>
          </div>
          <input class="slider" id="sfxVolSlider" type="range" min="0" max="100" step="5" value="80"
                 aria-label="音效音量">
          <div class="slider-presets" id="sfxVolPresets">
            <button type="button" data-v="0">静音</button>
            <button type="button" data-v="30">轻</button>
            <button type="button" data-v="60">适中</button>
            <button type="button" data-v="80">默认</button>
            <button type="button" data-v="100">最大</button>
          </div>
        </div>
        <div class="row row-col">
          <div>
            <div class="row-label">配色主题</div>
            <div class="row-desc">给小镇换一身衣裳</div>
          </div>
          <div class="theme-groups" id="themePicks"></div>
          <div class="theme-hint" id="themeNameHint">点一下即可切换</div>
        </div>
        <div class="row">
          <div>
            <div class="row-label">玻璃导航</div>
            <div class="row-desc">底部导航使用苹果风的毛玻璃质感</div>
          </div>
          <input class="switch" id="glassSwitch" type="checkbox" role="switch">
        </div>
        </div>
      </section>

      <section class="group foldx">
        <button class="group-fold" id="foldNav" type="button" aria-expanded="true">
          <span class="group-title">🚀 启动与导航</span>
          <span class="fold-caret">▾</span>
        </button>
        <div class="fold-body" id="foldNavBody">
        <div class="row row-col">
          <div>
            <div class="row-label">启动时打开</div>
            <div class="row-desc">每次打开小镇，先把你放到哪儿</div>
          </div>
          <div class="radio-row" id="entranceRow"></div>
        </div>
        <div class="row row-col">
          <div>
            <div class="row-label">导航栏位置</div>
            <div class="row-desc">摆在屏幕下边还是上边，切完立刻生效</div>
          </div>
          <div class="radio-row" id="navPosRow"></div>
        </div>
        <div class="row row-col">
          <div>
            <div class="row-label">导航栏样式</div>
            <div class="row-desc">除了毛玻璃还有 5 种样子，切完立刻生效</div>
          </div>
          <div class="nav-style-row" id="navStyleRow"></div>
        </div>
        <div class="row row-col">
          <div>
            <div class="row-label">导航栏顺序</div>
            <div class="row-desc">点一下换位置，怎么顺手怎么排</div>
          </div>
          <div class="order-list" id="navOrderList"></div>
        </div>
        </div>
      </section>

      <section class="group">
        <div class="group-title">版本与更新</div>
        <div class="upd-card">
          <div class="upd-top">
            <div class="upd-main">
              <div class="upd-label">当前版本</div>
              <div class="upd-ver" id="updVer">读取中…</div>
            </div>
            <button class="upd-btn" id="updBtn" type="button">刷新到最新版</button>
          </div>
          <div class="upd-note" id="updNote">界面还是老样子、新功能没出现？点右边重新拉取一次最新代码。草稿、登录和设置都不会丢。</div>
        </div>
      </section>

      <section class="group">
        <div class="group-title">更多</div>
        <router-link class="entry" to="/terms">
          <span class="entry-ico">📄</span>
          <span class="entry-body">
            <span class="entry-label">使用条款</span>
            <div class="entry-desc">服务性质、禁止事项与责任划分</div>
          </span>
          <span class="entry-arrow">›</span>
        </router-link>
        <router-link class="entry" to="/copyright">
          <span class="entry-ico">©️</span>
          <span class="entry-body">
            <span class="entry-label">版权声明与侵权投诉</span>
            <div class="entry-desc">权利人可以在这里提交通知 · 48 小时内处理</div>
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
          </span>
          <span class="entry-arrow">›</span>
        </router-link>
      </section>

      <section class="group">
        <div class="group-title">联系与社区</div>
        <div class="contact-card">
          <router-link class="entry" to="/mod">
            <span class="entry-ico">🛡️</span>
            <span class="entry-body">
              <span class="entry-label">审核记录</span>
              <div class="entry-desc">我下架过哪些作品 · 误下架可以一键恢复</div>
            </span>
            <span class="entry-arrow">›</span>
          </router-link>
          <div class="entry-sep"></div>
          <router-link class="entry" to="/faq">
            <span class="entry-ico">❓</span>
            <span class="entry-body">
              <span class="entry-label">问题反馈</span>
              <div class="entry-desc">常见问题解答 · 微信 Tux123233 · 邮箱 linsifan123233@petalmail.com</div>
            </span>
            <span class="entry-arrow">›</span>
          </router-link>
        </div>
      </section>

            <section class="group">
        <div class="group-title">请作者喝杯咖啡</div>
        <div class="qr-row">
          <div class="qr-item">
            <img src="/images/alipay-code.jpg" alt="支付宝收款码">
            <b>支付宝</b>
          </div>
          <div class="qr-item">
            <img src="/images/tip-code.jpg" alt="微信赞赏码">
            <b>微信</b>
          </div>
        </div>
        <!--
          措辞是刻意这么写的，别改回「赞赏作品」那类说法。

          这一段的定位是「读者自愿赠与作者个人」，用来贴补服务器和域名费用，
          跟站上的任何作品、任何功能都**没有对价关系**。
          写成「喜欢这幅画就赞赏」会被理解成「为内容付费」，
          那正好踩中避风港里「未从用户提供的内容直接获得经济利益」这一条 ——
          一旦被认定靠用户的侵权内容赚钱，前面所有免责条款全部失效。
        -->
        <div class="qr-note">
          这是给作者个人的自愿赠与，用来贴补服务器和域名开销。<br>
          <b>与站内任何作品、任何功能都没有关系</b>，也不会因此获得任何特权或授权。<br>
          不给也完全不影响使用 —— 像素小镇一直免费，以后也是。
        </div>
      </section>

      <section class="group">
        <div class="group-title">致谢</div>
        <div class="credit-card">
          <a class="entry" href="https://github.com/Konsheng/Sensitive-lexicon" target="_blank" rel="noopener noreferrer">
            <span class="entry-ico">🛡️</span>
            <span class="entry-body">
              <span class="entry-label">Sensitive-lexicon</span>
              <div class="entry-desc">内容安全词库 · MIT License · Copyright (c) 2024~2099 Konsheng</div>
            </span>
            <span class="entry-arrow">›</span>
          </a>
          <div class="entry-sep"></div>
          <a class="entry" href="https://opencode.ai" target="_blank" rel="noopener noreferrer">
            <span class="entry-ico">⌨️</span>
            <span class="entry-body">
              <span class="entry-label">OpenCode</span>
              <div class="entry-desc">本站代码编写工具</div>
            </span>
            <span class="entry-arrow">›</span>
          </a>
          <div class="entry-sep"></div>
          <a class="entry" href="https://github.com/deepseek-ai/deepseek-harness" target="_blank" rel="noopener noreferrer">
            <span class="entry-ico">🐋</span>
            <span class="entry-body">
              <span class="entry-label">DeepSeek Harness</span>
              <div class="entry-desc">本站的开发工具链 · 开源 · DeepSeek</div>
            </span>
            <span class="entry-arrow">›</span>
          </a>
          <div class="entry-sep"></div>
          <a class="entry" href="https://www.linux.org" target="_blank" rel="noopener noreferrer">
            <span class="entry-ico">🐧</span>
            <span class="entry-body">
              <span class="entry-label">Linux</span>
              <div class="entry-desc">本站的开发环境</div>
            </span>
            <span class="entry-arrow">›</span>
          </a>
        </div>
        <div class="credit-note">本项目源码与词库均遵循各自许可证要求，词库仅在服务端用于发布内容校验。</div>
      </section>

      <div class="notice">
        本画板仅用于个人学习与技术交流。请勿上传、绘制、发布任何违反中华人民共和国法律法规的内容。上传者须对自己发布的内容负全部法律责任。本平台有权在不事先通知的情况下删除违规内容，并保留追究法律责任的权利。
      </div>

      <div class="copyright">© 2026 像素小镇 · 版权所有 · 作者 Lin Sifan</div>
    </div>`,
  mounted() {
      const darkSwitch = document.getElementById('darkSwitch')
      /* ---------- 导航项定义（与 app.js 的导航保持一致） ---------- */
      const NAV_ITEMS = [
        { path: '/paint', ico: '🎨', name: '画板' },
        { path: '/gallery', ico: '🌆', name: '社区' },
        { path: '/mine', ico: '🌱', name: '我的' },
        { path: '/settings', ico: '⚙️', name: '设置' },
      ]

      function readLS(k, d) {
        try {
          const v = localStorage.getItem(k)
          return v === null || v === '' ? d : v
        } catch (e) {
          return d
        }
      }
      function writeLS(k, v) {
        try {
          localStorage.setItem(k, v)
        } catch (e) {}
      }

      /* ---------- 启动直达：单选，覆盖全部导航页 ---------- */
      const ENTRANCE_KEY = 'lw-entrance'
      const entranceRow = document.getElementById('entranceRow')
      if (entranceRow) {
        let cur = readLS(ENTRANCE_KEY, '/paint')
        if (!NAV_ITEMS.some((i) => i.path === cur)) cur = '/paint'
        const paint = () => {
          entranceRow.querySelectorAll('.radio-chip').forEach((c) => {
            c.classList.toggle('on', c.dataset.path === cur)
          })
        }
        NAV_ITEMS.forEach((it) => {
          const b = document.createElement('button')
          b.type = 'button'
          b.className = 'radio-chip'
          b.dataset.path = it.path
          b.innerHTML =
            '<span class="rc-ico">' + it.ico + '</span><span class="rc-txt">' + it.name + '</span>'
          b.addEventListener('click', () => {
            cur = it.path
            writeLS(ENTRANCE_KEY, cur)
            paint()
            if (window.sfx) window.sfx('tick')
            toast('下次打开将先进「' + it.name + '」')
          })
          entranceRow.appendChild(b)
        })
        paint()
      }

      /* ---------- 导航栏位置：底部 / 顶部 ---------- */
      const NAV_POS_KEY = 'lw-nav-pos'
      const navPosRow = document.getElementById('navPosRow')
      if (navPosRow) {
        const POS = [
          { v: 'bottom', ico: '⬇️', name: '底部' },
          { v: 'top', ico: '⬆️', name: '顶部' },
        ]
        let cur = readLS(NAV_POS_KEY, 'bottom')
        if (!POS.some((p) => p.v === cur)) cur = 'bottom'
        const paint = () => {
          navPosRow.querySelectorAll('.radio-chip').forEach((c) => {
            c.classList.toggle('on', c.dataset.v === cur)
          })
        }
        POS.forEach((p) => {
          const b = document.createElement('button')
          b.type = 'button'
          b.className = 'radio-chip'
          b.dataset.v = p.v
          b.innerHTML = '<span class="rc-ico">' + p.ico + '</span>' + p.name
          b.addEventListener('click', () => {
            cur = p.v
            writeLS(NAV_POS_KEY, cur)
            paint()
            if (window.setNavPosition) window.setNavPosition(cur)
            if (window.sfx) window.sfx('tick')
          })
          navPosRow.appendChild(b)
        })
        paint()
      }

      /* ---------- 导航栏样式：玻璃 + 另外 5 款 ---------- */
      const NAV_STYLES = [
        { v: 'glass', name: '玻璃' },
        { v: 'solid', name: '实心' },
        { v: 'outline', name: '描边' },
        { v: 'pill', name: '药丸' },
        { v: 'segmented', name: '分段' },
        { v: 'gradient', name: '渐变' },
      ]
      const navStyleRow = document.getElementById('navStyleRow')
      if (navStyleRow) {
        let curStyle = readLS('lw-nav-style', 'glass')
        if (!NAV_STYLES.some((x) => x.v === curStyle)) curStyle = 'glass'
        const paintStyles = () => {
          navStyleRow.querySelectorAll('.ns-item').forEach((el) => {
            el.classList.toggle('on', el.dataset.v === curStyle)
          })
        }
        NAV_STYLES.forEach((st) => {
          const b = document.createElement('button')
          b.type = 'button'
          b.className = 'ns-item'
          b.dataset.v = st.v
          b.innerHTML =
            '<span class="ns-bar">' + '<i></i>'.repeat(4) + '</span>' +
            '<span class="ns-name">' + st.name + '</span>'
          b.addEventListener('click', () => {
            curStyle = st.v
            writeLS('lw-nav-style', st.v)
            applyNavStyle(curStyle)
            paintStyles()
            if (window.sfx) window.sfx('tick')
            toast('导航栏样式：' + st.name)
          })
          navStyleRow.appendChild(b)
        })
        applyNavStyle(curStyle)
        paintStyles()
      }
      function applyNavStyle(v) {
        if (v === 'glass') document.documentElement.removeAttribute('data-nav-style')
        else document.documentElement.setAttribute('data-nav-style', v)
      }

      /* ---------- 导航栏顺序 ---------- */
      const NAV_ORDER_KEY = 'lw-nav-order'
      const orderList = document.getElementById('navOrderList')
      if (orderList) {
        let order = readLS(NAV_ORDER_KEY, '')
          .split(',')
          .filter((x) => NAV_ITEMS.some((i) => i.path === x))
        // 补齐缺失项（新增导航时不会丢）
        NAV_ITEMS.forEach((i) => {
          if (!order.includes(i.path)) order.push(i.path)
        })

        const render = () => {
          orderList.innerHTML = ''
          order.forEach((path, idx) => {
            const it = NAV_ITEMS.find((i) => i.path === path)
            if (!it) return
            const row = document.createElement('div')
            row.className = 'order-item'
            row.innerHTML =
              '<span class="oi-ico">' + it.ico + '</span><span class="oi-name">' + it.name + '</span>'
            const btns = document.createElement('div')
            btns.className = 'order-btns'
            const up = document.createElement('button')
            up.type = 'button'
            up.textContent = '↑'
            up.title = '上移'
            up.disabled = idx === 0
            up.addEventListener('click', () => {
              const t = order.slice()
              ;[t[idx - 1], t[idx]] = [t[idx], t[idx - 1]]
              order = t
              commit()
            })
            const down = document.createElement('button')
            down.type = 'button'
            down.textContent = '↓'
            down.title = '下移'
            down.disabled = idx === order.length - 1
            down.addEventListener('click', () => {
              const t = order.slice()
              ;[t[idx + 1], t[idx]] = [t[idx], t[idx + 1]]
              order = t
              commit()
            })
            btns.append(up, down)
            row.appendChild(btns)
            orderList.appendChild(row)
          })
        }
        const commit = () => {
          writeLS(NAV_ORDER_KEY, order.join(','))
          render()
          if (window.sfx) window.sfx('tick')
          if (window.setNavOrder) window.setNavOrder(order)
        }
        render()
      }

      function syncThemeUI() {
        darkSwitch.checked = document.documentElement.getAttribute('data-theme') === 'dark'
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
        { key: 'size', ico: '🔢', label: '画布尺寸栏', desc: '切换 16/32/64 的按钮' },
        { key: 'tools', ico: '🖌️', label: '工具栏', desc: '画笔、橡皮、颜料桶等' },
        { key: 'history', ico: '🗂️', label: '我的绘画历史', desc: '画板下方的历史作品区' },
        { key: 'join', ico: '🏆', label: '参赛卡片', desc: '每日挑战 / 本周主题的勾选卡' },
        { key: 'name', ico: '✏️', label: '作品名与作者名', desc: '上传前的两个输入框' },
        { key: 'actions', ico: '🎛️', label: '操作按钮', desc: '撤销、清空、导出、上传' },
        { key: 'hint', ico: '💡', label: '操作提示', desc: '画布下方那行说明文字' },
        { key: 'disclaimer', ico: '📜', label: '使用须知与版权', desc: '底部说明与赞赏支持' },
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
          b.className = 'lay-title'
          b.textContent = (L.ico || '') + ' ' + L.label
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
        { key: 'prompt', ico: '🎲', label: '题目模式', desc: '按主题出题创作，顶部有换题按钮' },
        { key: 'anim', ico: '🎞️', label: '帧动画', desc: '逐帧作画并导出循环 GIF' },
        { key: 'daily', ico: '📅', label: '每日挑战', desc: '每天一个题目，作品进当日榜' },
        { key: 'contest', ico: '🏆', label: '本周主题比赛', desc: '每周一个主题，社区投票选最佳' },
        { key: 'image', ico: '📷', label: '像素相机', desc: '把照片变成像素画再继续手改' },
        { key: 'mirror', ico: '🦋', label: '镜像绘制', desc: '落笔自动左右对称' },
        { key: 'drafts', ico: '📑', label: '多草稿槽', desc: '同时保存 3 幅草稿，随时切换' },
        { key: 'tags', ico: '🏷️', label: '作品标签', desc: '给作品加标签，方便别人搜到' },
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
          lb.textContent = (f.ico || '') + ' ' + f.label
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

      /* ---------- 可折叠分组的展开/收起 ---------- */
      const FOLD_KEY = 'lw-settings-fold'
      function applyFold(headId, bodyId, key) {
        const head = document.getElementById(headId)
        const body = document.getElementById(bodyId)
        if (!head || !body) return
        let open = true
        try {
          const saved = JSON.parse(localStorage.getItem(FOLD_KEY) || '{}')
          if (saved && typeof saved[key] === 'boolean') open = saved[key]
        } catch (e) {}
        const set = (v) => {
          head.setAttribute('aria-expanded', String(v))
          body.hidden = !v
          if (window.sfx) window.sfx('tap')
          try {
            const saved = JSON.parse(localStorage.getItem(FOLD_KEY) || '{}')
            saved[key] = v
            localStorage.setItem(FOLD_KEY, JSON.stringify(saved))
          } catch (e) {}
        }
        set(open)
        head.addEventListener('click', () => {
          set(head.getAttribute('aria-expanded') !== 'true')
        })
      }
      applyFold('foldLook', 'foldLookBody', 'look')
      applyFold('foldNav', 'foldNavBody', 'nav')

      /* ---------- 配色主题 ---------- */
      // 主题数据来自 /themes.js（唯一数据源，CSS 也由它生成）
      const THEMES = (window.LW_THEMES || []).map(function (t) {
        return { id: t.id, name: t.name, group: t.group, sw: t.sw || [] }
      })
      function applyTheme(id) {
        const hit = THEMES.find((x) => x.id === id)
        const t = hit ? id : 'light'
        document.documentElement.setAttribute('data-theme', t)
        // 视图里的暗色适配一律看 data-mood，理由见 index.html 里的注释
        document.documentElement.setAttribute('data-mood', (hit && hit.group === 'dark') ? 'dark' : 'light')
        try {
          localStorage.setItem('lw-theme', t)
        } catch (e) {}
        syncThemePicks()
        if (typeof syncThemeUI === 'function') syncThemeUI()
        return hit
      }
      function showThemeName(theme, quiet) {
        const hint = document.getElementById('themeNameHint')
        if (!hint || !theme) return
        hint.innerHTML =
          '当前：<b>' + theme.name + '</b> · ' + (theme.group === 'dark' ? '夜间系' : '浅色系')
        if (!quiet && window.sfx) window.sfx('swish')
      }
      function syncThemePicks() {
        const cur = document.documentElement.getAttribute('data-theme') || 'light'
        document.querySelectorAll('.theme-pick').forEach((el) => {
          el.classList.toggle('on', el.dataset.theme === cur)
        })
      }
      const themePicks = document.getElementById('themePicks')
      if (themePicks) {
        // 上：浅色系　下：夜间系
        const GROUPS = [
          { key: 'light', label: '浅色系', ico: '☀️' },
          { key: 'dark', label: '夜间系', ico: '🌙' },
        ]
        GROUPS.forEach((g) => {
          const list = THEMES.filter((t) => t.group === g.key)
          if (!list.length) return
          const wrap = document.createElement('div')
          const lab = document.createElement('div')
          lab.className = 'theme-group-label'
          lab.innerHTML = '<span class="tgl-ico">' + g.ico + '</span>' + g.label
          const row = document.createElement('div')
          row.className = 'theme-picks'
          list.forEach((t) => {
            const b = document.createElement('button')
            b.type = 'button'
            b.className = 'theme-pick'
            b.dataset.theme = t.id
            b.title = t.name
            b.setAttribute('aria-label', t.name)
            b.innerHTML =
              '<span class="tp-bar">' +
              (t.sw || []).slice(0, 3).map((c) => '<span class="tp-dot" style="background:' + c + '"></span>').join('') +
              '</span><span class="tp-name">' + t.name + '</span>'
            b.addEventListener('click', () => showThemeName(applyTheme(t.id)))
            row.appendChild(b)
          })
          wrap.append(lab, row)
          themePicks.appendChild(wrap)
        })
        syncThemePicks()
        const curId = document.documentElement.getAttribute('data-theme') || 'light'
        showThemeName(THEMES.find((t) => t.id === curId), true)
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

      /* ---------- 动画强度 ----------
         四个档位，写到 <html data-anim-level>，CSS 统一开关。
         「关闭」还会顺手停掉像素图标的定时器 —— 那些是 JS 循环，
         光靠 CSS 停不掉。 */
      ;(function () {
        const row = document.getElementById('animLvRow')
        const val = document.getElementById('animLvVal')
        const tip = document.getElementById('animLvTip')
        if (!row || !window.LWIcon) return
        const LABEL = { off: '关闭', low: '省电', std: '标准', rich: '丰富' }
        const TIP = {
          off: '所有动画和过渡都停掉。最省电，界面会显得比较硬。',
          low: '只停掉一直循环的装饰动效（脉冲、呼吸、闪光），入场动画保留。',
          std: '默认。该动的地方都会动。',
          rich: '效果更明显：循环动效更快，图标播得更勤。<b>老手机可能会卡</b>。',
        }
        function render() {
          const cur = window.LWIcon.getLevel()
          if (val) val.textContent = LABEL[cur] || cur
          if (tip) tip.innerHTML = TIP[cur] || ''
          row.querySelectorAll('[data-animlv]').forEach((b) => {
            b.classList.toggle('on', b.getAttribute('data-animlv') === cur)
          })
        }
        row.addEventListener('click', (e) => {
          const b = e.target.closest('[data-animlv]')
          if (!b) return
          window.LWIcon.setLevel(b.getAttribute('data-animlv'))
          if (window.sfx) window.sfx('tick')
          render()
        })
        render()
      })()


      const sfxSwitch = document.getElementById('sfxSwitch')
      if (sfxSwitch) {
        sfxSwitch.checked = window.getSfx ? window.getSfx() : true

        /* 开关旁边的跳动波形。开着才跳 —— 这样不用读文字也知道音效是开是关，
           而且真的发声时会跟着动一下（见下面的 tick）。 */
        let wave = null
        const waveHost = document.getElementById('sfxWaveHost')
        if (waveHost && window.LWDeco && window.LWDeco.wave) {
          wave = window.LWDeco.wave(sfxSwitch.checked)
          waveHost.appendChild(wave)
        }
        const syncWave = () => {
          if (wave && window.LWDeco) window.LWDeco.setWave(wave, sfxSwitch.checked)
        }
        syncWave()
        // 切换开关时整页重渲染会丢状态，所以这里也顺带同步一次
        window.addEventListener('lw-sfx-changed', syncWave)

        sfxSwitch.addEventListener('change', () => {
          if (window.setSfx) window.setSfx(sfxSwitch.checked)
          syncWave()
          toast(sfxSwitch.checked ? '音效已开启' : '音效已关闭')
        })
      }

      /* 音效音量。拖动时不发声（拖一路响一路太吵），
         松手（change）才放一记「叮」当作试听。 */
      const sfxVolSlider = document.getElementById('sfxVolSlider')
      const sfxVolVal = document.getElementById('sfxVolVal')
      if (sfxVolSlider) {
        const paintVol = (n) => {
          sfxVolSlider.value = String(n)
          if (sfxVolVal) sfxVolVal.textContent = n + '%'
        }
        const applyVol = (v, preview) => {
          const n = Math.max(0, Math.min(100, Math.round(Number(v) || 0)))
          paintVol(n)
          if (window.setSfxVolume) window.setSfxVolume(n / 100)
          if (preview && n > 0 && window.sfx) window.sfx('ding')
        }
        const startVol = Math.round((window.getSfxVolume ? window.getSfxVolume() : 0.8) * 100)
        paintVol(startVol)
        sfxVolSlider.addEventListener('input', () => applyVol(sfxVolSlider.value, false))
        sfxVolSlider.addEventListener('change', () => applyVol(sfxVolSlider.value, true))
        const volPresets = document.getElementById('sfxVolPresets')
        if (volPresets) {
          volPresets.addEventListener('click', (e) => {
            const b = e.target.closest ? e.target.closest('button[data-v]') : null
            if (!b) return
            applyVol(b.getAttribute('data-v'), true)
          })
        }
      }

      function setTheme(dark) {
        applyTheme(dark ? 'dark' : 'light')
        syncThemeUI()
      }

      darkSwitch.addEventListener('change', () => setTheme(darkSwitch.checked))

      /* ---------- 版本与更新 ----------
         这个站的资源是「网络优先 + Service Worker 兜底」，正常刷新本来就能拿到新版。
         但用户可能一直停在页面里（SPA 切页不会重新加载 index.html），
         也可能被 SW 的壳缓存兜住，于是一直看着旧界面、以为作者没更新。
         这里给一个「刷新到最新版」：清掉 SW 缓存 → 注销 Service Worker →
         重新加载，强制从网络拿最新代码。
         只动缓存，不碰 localStorage —— 草稿、登录、设置都留着。 */
      const updBtn = document.getElementById('updBtn')
      const updVer = document.getElementById('updVer')
      const updNote = document.getElementById('updNote')
      const runningVer = window.__LW_VER || '未知'

      const paintUpdNote = (text, fresh) => {
        if (!updNote) return
        updNote.textContent = text
        updNote.className = fresh ? 'upd-note fresh' : 'upd-note'
      }

      /* 绕开所有缓存，读服务器上 index.html 里的版本号 */
      async function fetchServerVer() {
        const res = await fetch('/index.html?t=' + Date.now(), { cache: 'no-store' })
        if (!res.ok) return ''
        const txt = await res.text()
        const m = txt.match(/__LW_VER\s*=\s*['"]([^'"]+)['"]/)
        return m ? m[1] : ''
      }

      async function checkUpdate(byUser) {
        if (updVer) updVer.textContent = 'v' + runningVer
        try {
          const srv = await fetchServerVer()
          if (srv && srv !== runningVer) {
            paintUpdNote('发现新版本 v' + srv + '，点右边「刷新到最新版」即可更新。', true)
            if (byUser && window.sfx) window.sfx('ding')
            return true
          }
          paintUpdNote('已经是最新版本 v' + runningVer + '。刷新不会丢草稿、登录和设置。', false)
          if (byUser && window.toast) window.toast('已经是最新版本 v' + runningVer)
          return false
        } catch (e) {
          paintUpdNote('暂时连不上服务器，等联网后再试。本来是最新版的话，不刷新也没关系。', false)
          if (byUser && window.toast) window.toast('检查更新失败：网络错误')
          return false
        }
      }

      if (updBtn) {
        updBtn.addEventListener('click', async () => {
          if (updBtn.disabled) return
          if (navigator.onLine === false) {
            toast('现在没有网络，联网后再试')
            return
          }
          updBtn.disabled = true
          const old = updBtn.textContent
          updBtn.textContent = '更新中…'
          try {
            // 1) 删掉 Service Worker 的壳缓存
            if (window.caches && caches.keys) {
              const keys = await caches.keys()
              await Promise.all(keys.map((k) => caches.delete(k)))
            }
            // 2) 注销 Service Worker：重新加载时直接走网络，顺便拿到最新 sw.js
            if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
              const regs = await navigator.serviceWorker.getRegistrations()
              await Promise.all(regs.map((r) => r.unregister()))
            }
            // 3) 清掉切页缓存（内存里的，重载本来也会没，这里图个干净）
            if (window.__lwCache) window.__lwCache = {}
            /* 4) 把入口脚本用「强制走网络」的方式重新拉一遍。
                  只清 Cache Storage 不够：app.js / views 的地址没变，
                  浏览器仍可能从 HTTP 缓存里拿旧的。cache:'reload' 会绕过
                  HTTP 缓存并把新内容写回去，紧接着的重载才能拿到新版。 */
            await Promise.all(
              ['/app.js', '/lw-cache.js', '/themes.js', '/lw-avatar.js', '/lw-spray.js', '/lw-thumb.js']
                .map((p) => fetch(p, { cache: 'reload' }).catch(() => {}))
            )
            /* 5) 带一个一次性参数跳转 —— 这是最关键的一步。
                  location.reload() 用的是同一个地址，浏览器（以及装到桌面的
                  PWA 容器）仍可能从缓存里把旧页面交回来，表现就是「点了刷新
                  反而回到旧版本」。带上参数后它是一个「新地址」，必须重新向
                  服务器要；参数落地后由 index.html 里的脚本抹掉，地址栏不留痕。 */
            const u = new URL(location.href)
            u.searchParams.set('_u', Date.now().toString(36))
            location.replace(u.toString())
          } catch (e) {
            updBtn.disabled = false
            updBtn.textContent = old
            toast('更新失败，请手动长按浏览器的刷新按钮')
          }
        })
      }

      // 进设置页时静默查一次，有新版本就直接写在下方的说明里
      if (updVer) checkUpdate(false)

      syncThemeUI()
  },
}
