// 由 paint.html 自动转换为 Vue 3 视图（无构建）
export default {
  name: 'paint',
  title: '画板',
  noZoom: true,
  css: `      /* hidden 属性兜底：避免类选择器里的 display 覆盖 UA 的 [hidden]{display:none} */
      [hidden] { display: none !important; }

      :root {
        --bg: linear-gradient(160deg, #fdf8f2 0%, #f2ece2 100%);
        --surface: #fff;
        --surface-2: #efe9e0;
        --surface-3: #f0ece4;
        --art-bg: #fff;
        --text: #3b342c;
        --text-muted: #6b5f50;
        --text-muted2: #9a8c7a;
        --text-faint: #b0a697;
        --text-report: #8c7f6b;
        --border: #efe7da;
        --border-strong: #e0d3c0;
        --border-input: #e0d8d0;
        --ring: #fff;
        --shadow1: rgba(80, 60, 40, 0.15);
        --shadow2: rgba(80, 60, 40, 0.10);
        --shadow3: rgba(80, 60, 40, 0.06);
        --accent: #5b8def;
        --toast-bg: #3b342c;
        --tip-text: #d1944d;
        --tip-btn-border: #f0e2cf;
        --blacktip-bg: #fff8ef;
        --blacktip-border: #f0e2cf;
        --blacktip-text: #b97f3a;
        --like: #e5574b;
        --like-bg: #fff1ee;
        --like-border: #eec9c2;
      }
      [data-theme="dark"] {
        --bg: linear-gradient(160deg, #211c17 0%, #18140f 100%);
        --surface: #2a251f;
        --surface-2: #38312a;
        --surface-3: #322c25;
        --art-bg: #f6f2ea;
        --text: #f1ead9;
        --text-muted: #c5baa7;
        --text-muted2: #a39582;
        --text-faint: #857b68;
        --text-report: #97896d;
        --border: #4a4238;
        --border-strong: #5e5448;
        --border-input: #554b3e;
        --ring: #2a251f;
        --shadow1: rgba(0, 0, 0, 0.30);
        --shadow2: rgba(0, 0, 0, 0.22);
        --shadow3: rgba(0, 0, 0, 0.16);
        --accent: #76a3ff;
        --toast-bg: #3e372e;
        --tip-text: #e8b970;
        --tip-btn-border: #4e3a20;
        --blacktip-bg: #2b2316;
        --blacktip-border: #4e3a20;
        --blacktip-text: #eec27d;
        --like: #ff8577;
        --like-bg: #3d231f;
        --like-border: #5e352c;
      }

      [data-theme="dark"] .board-wrap,
      [data-theme="dark"] .prompt-card,
      [data-theme="dark"] .pick-wrap {
        border: 1px solid rgba(255, 255, 255, 0.07);
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.30);
      }

      [data-theme="dark"] .mini-wrap {
        border: 1px solid rgba(255, 255, 255, 0.07);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.30);
      }

      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

      body {
        margin: 0;
        min-height: 100vh;
        background: var(--bg);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 16px 112px;
      }

      h1 {
        font-size: 22px;
        font-weight: 700;
        color: var(--text);
        margin: 8px 0 16px;
        letter-spacing: 1px;
      }

      .page-head {
        width: 100%;
        max-width: 460px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .head-right {
        display: flex;
        align-items: center;
        gap: 8px;
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
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .theme-btn.pill {
        width: auto;
        padding: 0 18px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .theme-btn:active { transform: scale(0.9); }

      .board-wrap {
        width: 100%;
        max-width: 460px;
        background: var(--surface);
        border-radius: 20px;
        box-shadow: 0 10px 30px var(--shadow1);
        padding: 12px;
      }

      #board {
        display: block;
        width: 100%;
        aspect-ratio: 1;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        cursor: crosshair;
        background: var(--art-bg);
      }

      .size-row {
        width: 100%;
        max-width: 460px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
      }

      .size-label {
        font-size: 13px;
        color: var(--text-muted2);
        font-weight: 600;
        white-space: nowrap;
      }

      .size-btn {
        flex: 1;
        height: 38px;
        border-radius: 999px;
        background: var(--surface);
        border: 2px solid var(--border);
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
        line-height: 1;
      }

      .size-btn.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }

      .zoom-row {
        width: 100%;
        max-width: 460px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
      }

      .zoom-btn {
        flex: 0 0 auto;
        width: 44px;
        height: 38px;
        border-radius: 999px;
        background: var(--surface);
        border: 2px solid var(--border);
        color: var(--text-muted);
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s ease, transform 0.12s ease;
        line-height: 1;
      }

      .zoom-btn:active { transform: scale(0.92); }

      .zoom-level {
        flex: 1;
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted2);
        font-variant-numeric: tabular-nums;
      }

      .zoom-tip {
        font-size: 12px;
        color: var(--text-faint);
      }

      .prompt-card {
        width: 100%;
        max-width: 460px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        margin: 12px 0 16px;
        background: var(--surface);
        border: 2px solid var(--border);
        border-radius: 14px;
      }

      .prompt-card[hidden] { display: none; }

      .prompt-roll {
        flex: 0 0 auto;
        width: 42px;
        height: 42px;
        border-radius: 999px;
        background: var(--accent);
        border: none;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        transition: transform 0.15s ease;
        line-height: 1;
      }

      .prompt-roll:active { transform: rotate(120deg) scale(0.94); }

      .prompt-body {
        flex: 1;
        min-width: 0;
      }

      .prompt-text {
        font-size: 15px;
        font-weight: 600;
        color: var(--text);
        line-height: 1.4;
        word-break: break-all;
      }

      .prompt-meta {
        font-size: 12px;
        color: var(--text-faint);
        margin-top: 2px;
      }

      .prompt-cat {
        flex: 0 0 auto;
        max-width: 120px;
        height: 38px;
        border-radius: 10px;
        background: var(--surface);
        border: 2px solid var(--border);
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 600;
        padding: 0 6px;
        cursor: pointer;
      }

      .mini-wrap {
        position: fixed;
        top: 74px;
        right: 12px;
        z-index: 40;
        background: var(--surface);
        border: 2px solid var(--border);
        border-radius: 12px;
        padding: 4px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
      }

      #miniCanvas {
        display: block;
        border-radius: 8px;
        touch-action: none;
      }

      .tools {
        width: 100%;
        max-width: 460px;
        display: flex;
        gap: 8px;
        margin-top: 18px;
      }

      .tool {
        flex: 1;
        height: 46px;
        border-radius: 999px;
        border: none;
        background: var(--surface-2);
        color: var(--text-muted);
        font-size: 22px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease, color 0.15s ease, transform 0.12s ease;
      }

      .tool:hover { background: var(--surface); }

      .tool.active {
        background: var(--accent);
        color: #fff;
        box-shadow: 0 4px 14px rgba(91, 141, 239, 0.35);
      }

      .pick-wrap {
        width: 100%;
        max-width: 460px;
        margin-top: 14px;
        background: var(--surface);
        border-radius: 20px;
        border: 1px solid var(--border);
        padding: 16px;
      }

      .pick-wrap[hidden] { display: none; }

      .preset-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin-bottom: 16px;
      }

      .custom-toggle {
        display: flex;
        justify-content: center;
        margin-bottom: 12px;
      }

      #customBtn {
        height: 40px;
        padding: 0 26px;
        border-radius: 999px;
        background: var(--surface-3);
        color: var(--text-muted);
        font-size: 14px;
        font-weight: 600;
        transition: background 0.15s ease, color 0.15s ease, transform 0.12s ease;
      }

      #customBtn.active {
        background: var(--accent);
        color: #fff;
      }

      .swatch {
        flex: 0 0 auto;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 2px solid rgba(0, 0, 0, 0.08);
        cursor: pointer;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
        padding: 0;
      }

      .swatch:active { transform: scale(0.9); }

      .swatch.selected {
        box-shadow: 0 0 0 3px var(--ring), 0 0 0 6px var(--accent);
        transform: scale(1.08);
      }

      .pick-main {
        display: grid;
        grid-template-columns: 1fr 28px;
        gap: 12px;
        align-items: stretch;
      }

      .sv-box {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        touch-action: none;
      }

      .hue-box {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        touch-action: none;
        cursor: pointer;
      }

      #svCanvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; cursor: crosshair; }
      #svMarker { position: absolute; inset: 0; width: 100%; height: 100%; display: block; pointer-events: none; }
      #hueCanvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
      #hueMarker { position: absolute; inset: 0; width: 100%; height: 100%; display: block; pointer-events: none; }

      .cur {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 12px;
        font-size: 15px;
        color: var(--text);
        font-weight: 600;
      }

      .cur-label { font-size: 13px; color: var(--text-muted); font-weight: 500; white-space: nowrap; }

      .cur-swatch {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid rgba(0, 0, 0, 0.1);
        background: #e53935;
      }

      .hex-input {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.5px;
        height: 32px;
        width: 92px;
        border-radius: 8px;
        border: 2px solid var(--border-input);
        background: var(--surface);
        outline: none;
        color: var(--text);
        padding: 0 8px;
        text-transform: uppercase;
      }

      .hex-input:focus { border-color: var(--accent); }

      #curHex { letter-spacing: 0.5px; }

      .records {
        width: 100%;
        max-width: 460px;
        margin-top: 14px;
        background: var(--surface);
        border-radius: 20px;
        border: 1px solid var(--border);
        padding: 16px;
      }

      .records-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-muted2);
        margin-bottom: 10px;
      }

      .record-list {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding-bottom: 4px;
        scrollbar-width: none;
      }

      .record-list::-webkit-scrollbar { display: none; }

      .tile {
        flex: 0 0 auto;
        width: 64px;
        padding: 0;
        background: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .thumb {
        width: 56px;
        height: 56px;
        image-rendering: pixelated;
        border-radius: 8px;
        border: 1px solid var(--border-strong);
        background: var(--art-bg);
      }

      .tile-meta {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 12px;
        color: var(--text-muted);
        line-height: 1.3;
        max-width: 64px;
        word-break: break-all;
        text-align: center;
      }

      .tile-meta-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        flex-wrap: wrap;
        max-width: 100%;
      }

      .tile-time {
        font-size: 10px;
        color: var(--text-faint);
      }

      .tile-like {
        font-size: 10px;
        color: var(--like);
        background: var(--like-bg);
        border: 1px solid var(--like-border);
        border-radius: 999px;
        padding: 1px 8px;
        margin-top: 4px;
        line-height: 1.5;
        cursor: pointer;
        user-select: none;
      }

      .tile-like.liked {
        background: var(--like);
        color: #fff;
        border-color: var(--like);
      }

      .tile-load {
        font-size: 10px;
        color: var(--accent);
        background: var(--surface-2);
        border: 1px solid var(--border-strong);
        border-radius: 999px;
        padding: 1px 8px;
        margin-top: 4px;
        line-height: 1.5;
        cursor: pointer;
        user-select: none;
      }

      .tile-load:hover {
        background: var(--accent);
        color: #fff;
      }

      .record-empty {
        font-size: 13px;
        color: var(--text-faint);
        padding: 8px 2px;
      }

      .more-btn {
        display: block;
        width: 100%;
        max-width: 460px;
        margin-top: 12px;
        padding: 12px;
        border-radius: 14px;
        background: var(--surface);
        border: 1px solid var(--border-strong);
        color: var(--text-muted);
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        text-decoration: none;
      }

      .more-btn:hover { border-color: var(--border-strong); }
      .more-btn[hidden] { display: none; }

      .name-row {
        width: 100%;
        max-width: 460px;
        margin-top: 14px;
        display: flex;
        gap: 8px;
      }

      .name-row input {
        flex: 1;
        min-width: 0;
        height: 46px;
        border-radius: 14px;
        border: 2px solid var(--border-input);
        padding: 0 14px;
        font-size: 15px;
        background: var(--surface);
        outline: none;
        color: var(--text);
      }

      .name-row input:focus { border-color: var(--accent); }

      .name-row input:disabled {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 10%, var(--surface));
        opacity: 1;
        cursor: default;
      }

      .actions {
        width: 100%;
        max-width: 460px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
      }

      .actions button {
        flex: 1;
        min-width: 0;
        height: 52px;
        border-radius: 16px;
        font-size: 17px;
        font-weight: 600;
        transition: transform 0.12s ease, opacity 0.15s ease;
      }

      #undoBtn, #clearBtn {
        flex: 0 0 52px;
        background: var(--surface-2);
        color: var(--text-muted);
      }

      #uploadBtn {
        flex: 1.2;
        background: var(--accent);
        color: #fff;
      }

      #toast {
        position: fixed;
        left: 50%;
        bottom: 96px;
        transform: translate(-50%, 16px);
        background: var(--toast-bg);
        color: #fff;
        padding: 12px 22px;
        border-radius: 999px;
        font-size: 15px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        max-width: 86vw;
        text-align: center;
        z-index: 120;
      }

      #toast.show { opacity: 1; transform: translate(-50%, 0); }

      .hint {
        margin-top: 12px;
        font-size: 13px;
        color: var(--text-muted2);
        text-align: center;
        min-height: 18px;
      }

      .disclaimer {
        width: 100%;
        max-width: 460px;
        margin-top: 20px;
        padding: 14px 16px;
        background: var(--surface);
        border-radius: 14px;
        box-shadow: 0 4px 14px var(--shadow2);
        font-size: 12px;
        line-height: 1.7;
        color: var(--text-faint);
        text-align: justify;
      }

      .disclaimer-report {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--border);
        color: var(--text-report);
      }

      .copyright {
        width: 100%;
        max-width: 460px;
        margin-top: 12px;
        text-align: center;
        font-size: 12px;
        color: var(--text-faint);
      }

      .tip-btn {
        width: 100%;
        max-width: 460px;
        margin-top: 10px;
        height: 42px;
        border-radius: 999px;
        background: var(--surface);
        color: var(--tip-text);
        font-size: 14px;
        font-weight: 600;
        border: 2px solid var(--tip-btn-border);
      }

      .tip-overlay {
        position: fixed;
        inset: 0;
        z-index: 90;
        background: rgba(20, 15, 10, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .tip-overlay[hidden] { display: none; }

      .tip-box {
        width: 100%;
        max-width: 330px;
        background: var(--surface);
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        text-align: center;
      }

      .tip-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }

      .tip-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text);
      }

      .tip-close {
        border: none;
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .tip-qr {
        width: 210px;
        height: 210px;
        object-fit: cover;
        border-radius: 12px;
        border: 2px solid rgba(0, 0, 0, 0.08);
        background: var(--art-bg);
      }

      .tip-note {
        margin-top: 12px;
        font-size: 13px;
        color: var(--text-muted2);
        line-height: 1.6;
      }

      .consent-overlay {
        position: fixed;
        inset: 0;
        z-index: 100;
        background: rgba(20, 15, 10, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .consent-overlay[hidden] { display: none; }

      .consent-box {
        width: 100%;
        max-width: 420px;
        max-height: 86vh;
        overflow-y: auto;
        background: var(--surface);
        border-radius: 18px;
        padding: 24px 22px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      }

      .consent-box h2 {
        margin: 0 0 14px;
        font-size: 19px;
        font-weight: 800;
        text-align: center;
        color: #b33a2e;
        letter-spacing: 1px;
      }

      .consent-box .text {
        font-size: 14px;
        line-height: 1.9;
        color: var(--text);
        text-align: justify;
      }

      .consent-box .text a {
        color: var(--accent);
      }

      .consent-actions {
        display: flex;
        gap: 12px;
        margin-top: 22px;
      }

      .consent-actions button {
        flex: 1;
        height: 48px;
        border-radius: 14px;
        border: none;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
      }

      #consentYes {
        background: var(--accent);
        color: #fff;
      }

      #consentNo {
        background: var(--surface-2);
        color: var(--text-muted);
      }

      /* ---------- 创作模式选择 ---------- */
      .mode-overlay {
        position: fixed;
        inset: 0;
        z-index: 110;
        background: rgba(20, 15, 10, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .mode-overlay[hidden] { display: none; }

      .mode-box {
        width: 100%;
        max-width: 380px;
        max-height: 86vh;
        overflow-y: auto;
        background: var(--surface);
        border-radius: 20px;
        padding: 22px 18px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      }

      .mode-box h2 {
        margin: 0 0 6px;
        font-size: 21px;
        font-weight: 800;
        text-align: center;
      }

      .mode-sub {
        font-size: 13px;
        color: var(--text-faint);
        text-align: center;
        margin-bottom: 16px;
      }

      .mode-opt {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        text-align: left;
        border: 1px solid var(--border-strong);
        border-radius: 16px;
        background: var(--surface);
        padding: 14px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: border-color 0.15s, transform 0.12s;
      }

      .mode-opt:active { transform: scale(0.98); }

      .mode-opt.anim { border-color: var(--accent); }

      .mode-ico { flex: 0 0 auto; font-size: 26px; }

      .mode-name {
        flex: 0 0 auto;
        font-size: 16px;
        font-weight: 800;
        color: var(--text);
        min-width: 84px;
      }

      .mode-desc { flex: 1; font-size: 12px; color: var(--text-faint); line-height: 1.5; }

      .mode-bar {
        width: 100%;
        max-width: 460px;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .mode-bar[hidden] { display: none; }

      .mode-chip {
        flex: 1;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-muted);
        background: var(--surface-2);
        border: 1px solid var(--border-strong);
        border-radius: 999px;
        padding: 8px 14px;
        text-align: center;
      }

      #switchModeBtn {
        flex: 0 0 auto;
        border: 1px solid var(--border-strong);
        background: var(--surface);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .preview-overlay {
        position: fixed;
        inset: 0;
        z-index: 90;
        background: rgba(20, 15, 10, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .preview-overlay[hidden] { display: none; }

      .preview-box {
        width: 100%;
        max-width: 380px;
        background: var(--surface);
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        text-align: center;
      }

      .preview-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }

      .preview-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text);
      }

      .preview-close {
        border: none;
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      #previewCanvas {
        width: 220px;
        height: 220px;
        image-rendering: pixelated;
        border-radius: 12px;
        border: 2px solid rgba(0, 0, 0, 0.08);
        background: var(--art-bg);
      }

      .preview-info {
        margin-top: 12px;
        font-size: 14px;
        color: var(--text);
        font-weight: 600;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .preview-time {
        font-size: 12px;
        color: var(--text-faint);
        font-weight: 400;
      }

      .preview-note {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border);
        font-size: 12px;
        color: var(--text-faint);
        line-height: 1.6;
      }

      button:active { transform: scale(0.96); }
      button:disabled { opacity: 0.55; cursor: not-allowed; }

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
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22);
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
.contest-row {
        width: 100%;
        max-width: 460px;
        margin: 16px 0 0;
      }

      .contest-check {
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #fff7e0, #ffeded);
        border: 1px solid var(--border-strong);
        border-radius: 14px;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 700;
        color: var(--text);
        cursor: pointer;
      }

      [data-theme="dark"] .contest-check {
        background: linear-gradient(135deg, #2b2620, #34261f);
      }

      .contest-check input {
        width: 16px;
        height: 16px;
        accent-color: var(--accent);
      }

      /* ---------- 帧动画 ---------- */

      .anim-editor {
        width: 100%;
        max-width: 460px;
        margin-top: 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 16px;
        box-shadow: var(--shadow3);
      }

      .anim-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }

      .anim-title { font-size: 15px; font-weight: 800; }

      .anim-count-group {
        display: flex;
        background: var(--surface-2);
        border-radius: 999px;
        padding: 3px;
        gap: 2px;
      }

      .anim-count-btn {
        border: none;
        background: transparent;
        color: var(--text-muted);
        border-radius: 999px;
        padding: 6px 14px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }

      .anim-count-btn.active {
        background: var(--accent);
        color: #fff;
      }

      .anim-speed-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 10px 0 0;
        flex-wrap: wrap;
      }

      .anim-speed-label {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-muted);
        margin-right: 2px;
      }

      .anim-speed-btn {
        border: 1px solid var(--border-strong);
        background: var(--surface);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 5px 12px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }

      .anim-speed-btn.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }

      .anim-close {
        border: none;
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 6px 14px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }

      .anim-frames {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding-bottom: 6px;
      }

      .anim-frame {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        border: 2px solid var(--border-strong);
        background: var(--surface-2);
        border-radius: 12px;
        padding: 6px;
        cursor: pointer;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 700;
      }

      .anim-frame.active {
        border-color: var(--accent);
        background: var(--surface);
        color: var(--accent);
      }

      .anim-frame canvas {
        width: 48px;
        height: 48px;
        border-radius: 6px;
        display: block;
      }

      .anim-actions {
        display: flex;
        gap: 10px;
        margin-top: 12px;
      }

      .anim-actions button {
        flex: 1;
        height: 44px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid var(--border-strong);
        background: var(--surface-3);
        color: var(--text);
      }

      #animExport {
        background: linear-gradient(135deg, #7ce0c0, #5b8def);
        color: #fff;
        border: none;
      }

      .anim-note { margin-top: 10px; font-size: 12px; color: var(--text-faint); }

      #animImg {
        width: 100%;
        height: auto;
        border-radius: 14px;
        display: block;
      }

      /* ---------- 朋友圈卡片弹层 ---------- */
      .card-overlay {
        position: fixed;
        inset: 0;
        z-index: 95;
        background: rgba(20, 15, 10, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        color: var(--text);
      }

      .card-overlay[hidden] { display: none; }

      .card-box {
        width: 100%;
        max-width: 440px;
        max-height: 92vh;
        overflow-y: auto;
        background: var(--surface);
        border-radius: 20px;
        padding: 18px;
        box-shadow: 0 16px 50px rgba(0, 0, 0, 0.45);
        text-align: center;
      }

      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }

      .card-title { font-size: 16px; font-weight: 800; }

      .card-close {
        border: none;
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .card-actions { margin-top: 14px; display: flex; justify-content: center; gap: 10px; }

      .card-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--accent);
        color: #fff;
        border: none;
        border-radius: 999px;
        padding: 10px 24px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
      }

      .card-note { margin-top: 12px; font-size: 12px; color: var(--text-faint); }
    
      /* ---------- 导航栏毛玻璃（苹果 Liquid Glass） ---------- */
      .bottom-nav {
        background: rgba(255, 253, 250, 0.66) !important;
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        backdrop-filter: blur(24px) saturate(180%);
        border-color: rgba(180, 168, 150, 0.30) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
      [data-theme="dark"] .bottom-nav {
        background: rgba(42, 38, 33, 0.62) !important;
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
`,
  template: `<div class="consent-overlay" id="consentOverlay" hidden>
      <div class="consent-box" id="consentBox">
        <h2>重要提示</h2>
        <div class="text">
          本画板仅用于个人学习与技术交流。<b>严禁上传、绘制、发布任何违反中华人民共和国法律法规的内容</b>，包括但不限于<b>色情、暴力、恐怖、赌博、涉政敏感、侵犯他人隐私或知识产权</b>等内容。<br><br>
          上传者须对自己发布的内容负全部法律责任。本平台有权在不事先通知的情况下删除违规内容，并保留追究法律责任的权利。<br><br>
          <router-link to="/terms">查看完整用户协议</router-link>
        </div>
        <div class="consent-actions">
          <button id="consentNo" type="button">不同意</button>
          <button id="consentYes" type="button">同意并进入</button>
        </div>
      </div>
    </div>
    <div class="mode-overlay" id="modeOverlay" hidden>
      <div class="mode-box">
        <h2>🎨 开始创作</h2>
        <div class="mode-sub">先选择一种创作方式，再开始绘画</div>
        <button class="mode-opt" data-mode="free" type="button">
          <span class="mode-ico">🖌️</span>
          <span class="mode-name">自由模式</span>
          <span class="mode-desc">不受题目限制，想画什么就画什么</span>
        </button>
        <button class="mode-opt prompt" data-mode="prompt" type="button">
          <span class="mode-ico">📝</span>
          <span class="mode-name">题目模式</span>
          <span class="mode-desc">按系统命题创作，可换题与分类，还会计入每日题数</span>
        </button>
        <button class="mode-opt anim" data-mode="anim" type="button">
          <span class="mode-ico">🎞️</span>
          <span class="mode-name">帧动画</span>
          <span class="mode-desc">16×16 逐帧作画，导出循环 GIF</span>
        </button>
      </div>
    </div>

    <div class="mode-bar" id="modeBar" hidden>
      <span class="mode-chip" id="modeChip"></span>
      <button id="switchModeBtn" type="button">切换模式</button>
    </div>

    <div class="prompt-card" id="promptCard" hidden>
      <button class="prompt-roll" id="promptRoll" type="button" title="换一题">🎲</button>
      <div class="prompt-body">
        <div class="prompt-text" id="promptText">正在出题…</div>
        <div class="prompt-meta" id="promptMeta"></div>
      </div>
      <select class="prompt-cat" id="promptCat" title="命题分类" aria-label="命题分类">
        <option value="all">全部</option>
        <option value="0">日常与当下</option>
        <option value="1">心情与感受</option>
        <option value="2">喜好与厌恶</option>
        <option value="3">回忆与童年</option>
        <option value="4">梦想与未来</option>
        <option value="5">想象与创造</option>
        <option value="6">身体与变形</option>
        <option value="7">感官与抽象</option>
        <option value="8">日常物品与场景</option>
        <option value="9">情感与总结</option>
      </select>
    </div>

    <div class="board-wrap">
      <canvas id="board" width="512" height="512"></canvas>
    </div>

    <div class="size-row">
      <span class="size-label">画布</span>
      <button data-size="16" class="size-btn active" type="button">16×16</button>
      <button data-size="32" class="size-btn" type="button">32×32</button>
      <button data-size="64" class="size-btn" type="button">64×64</button>
    </div>

    <div class="zoom-row" id="zoomRow" hidden>
      <span class="size-label">视图</span>
      <button id="zoomOut" class="zoom-btn" type="button" title="缩小">－</button>
      <span class="zoom-level" id="zoomLevel">100%</span>
      <button id="zoomIn" class="zoom-btn" type="button" title="放大">＋</button>
      <span class="zoom-tip">拖动平移 · 点击涂色</span>
    </div>

    <div class="mini-wrap" id="miniWrap" hidden>
      <canvas id="miniCanvas" title="小地图：点击跳转"></canvas>
    </div>

    <div class="tools">
      <button id="toolBrush" class="tool active" type="button" data-tool="brush" title="画笔（B）">✏️</button>
      <button id="toolEraser" class="tool" type="button" data-tool="eraser" title="橡皮擦（E）">🧽</button>
      <button id="toolFill" class="tool" type="button" data-tool="fill" title="颜料桶（F）">🪣</button>
      <button id="toolColor" class="tool" type="button" title="颜色（C）">🎨</button>
    </div>

    <div class="pick-wrap" id="pickWrap" hidden>
      <div class="preset-row" id="presetRow"></div>
      <div class="cur">
        <span class="cur-swatch" id="curSwatch"></span>
        <span class="cur-label">当前色值</span>
        <input id="curHex" class="hex-input" value="#e53935" maxlength="7" autocomplete="off"
          aria-label="输入颜色代码" title="输入 #RRGGBB 使用自定义颜色">
      </div>
      <div class="custom-toggle">
        <button id="customBtn" type="button">自定义</button>
      </div>
      <div id="hsvBody" hidden>
        <div class="pick-main">
          <div class="sv-box" id="svBox">
            <canvas id="svCanvas"></canvas>
            <canvas id="svMarker"></canvas>
          </div>
          <div class="hue-box" id="hueBox">
            <canvas id="hueCanvas"></canvas>
            <canvas id="hueMarker"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="records">
      <div class="records-title">我的绘画历史（最新 10 条）</div>
      <div id="recordList" class="record-list"></div>
    </div>

    <router-link id="moreBtn" class="more-btn" to="/gallery" hidden>去社区看更多作品 →</router-link>

    <div class="contest-row" id="contestRow" hidden>
      <label class="contest-check" for="contestCheck">
        <input type="checkbox" id="contestCheck">
        <span id="contestLabel"></span>
      </label>
    </div>

    <div class="name-row">
      <input id="titleInput" type="text" placeholder="作品名" maxlength="20">
      <input id="nameInput" type="text" placeholder="作者名" maxlength="20">
    </div>

    <div class="actions">
      <button id="undoBtn" type="button" title="撤销（Z）" disabled>↩️</button>
      <button id="clearBtn" type="button" title="清空">🗑️</button>
      <button id="uploadBtn" type="button">上传</button>
    </div>

    <div class="anim-editor" id="animEditor" hidden>
      <div class="anim-head">
        <span class="anim-title">🎞️ 帧动画</span>
        <div class="anim-count-group" id="animCountGroup">
          <button class="anim-count-btn active" data-count="4" type="button">4 帧</button>
          <button class="anim-count-btn" data-count="8" type="button">8 帧</button>
        </div>
        <button class="anim-close" id="animClose" type="button">完成</button>
      </div>
      <div class="anim-speed-row">
        <span class="anim-speed-label">速度</span>
        <button class="anim-speed-btn" data-delay="5" type="button">快 ×2</button>
        <button class="anim-speed-btn active" data-delay="10" type="button">标准</button>
        <button class="anim-speed-btn" data-delay="15" type="button">慢</button>
        <button class="anim-speed-btn" data-delay="20" type="button">更慢</button>
      </div>
      <div class="anim-frames" id="animFrameStrip"></div>
      <div class="anim-actions">
        <button id="animCopy" type="button">复制上一帧</button>
        <button id="animClear" type="button">清空本帧</button>
        <button id="animExport" type="button">导出 GIF</button>
        <button id="animPublish" class="primary" type="button">发布到社区</button>
      </div>
      <div class="anim-note">点选下面的帧号切换画布逐帧作画；可调整播放速度，导出为 512×512 循环 GIF。</div>
    </div>

    <div class="hint" id="hint">画笔：点按或滑动作画 · 画布 16/32/64× · B 画笔 / E 橡皮 / F 填充 / C 颜色 / Z 撤销 · 输入 #RRGGBB 自定义颜色</div>

    <div class="disclaimer">
      本画板仅用于个人学习与技术交流。请勿上传、绘制、发布任何违反中华人民共和国法律法规的内容，包括但不限于色情、暴力、恐怖、赌博、涉政敏感、侵犯他人隐私或知识产权的内容。上传者须对自己发布的内容负全部法律责任。本平台有权在不事先通知的情况下删除违规内容，并保留追究法律责任的权利。
    </div>

    <div class="copyright">© 2026 像素小镇 · 版权所有 · 作者 Lin Sifan</div>

    <button id="tipBtn" class="tip-btn" type="button">赞赏支持</button>

    <div class="card-overlay" id="animOverlay" hidden>
      <div class="card-box">
        <div class="card-head">
          <span class="card-title">帧动画 GIF</span>
          <button class="card-close" id="animOverlayClose" type="button">关闭</button>
        </div>
        <img id="animImg" alt="帧动画 GIF">
        <div class="card-actions">
          <a id="animDownload" class="card-btn" href="#" download="guangyu-anim.gif">⬇️ 保存 GIF</a>
        </div>
        <div class="card-note">长按图片也能保存到相册；GIF 会自动循环播放。</div>
      </div>
    </div>

    <div class="tip-overlay" id="tipOverlay" hidden>
      <div class="tip-box">
        <div class="tip-head">
          <span class="tip-title">赞赏支持</span>
          <button class="tip-close" id="tipClose" type="button">关闭</button>
        </div>
        <img class="tip-qr" src="/images/赞赏码.jpg" alt="赞赏码">
        <div class="tip-note">喜欢像素小镇？长按识别二维码 → 扫码赞赏，感谢你的支持！</div>
      </div>
    </div>

    <div class="preview-overlay" id="previewOverlay" hidden>
      <div class="preview-box">
        <div class="preview-head">
          <span class="preview-title" id="previewTitle">作品预览</span>
          <button class="preview-close" id="previewClose" type="button">关闭</button>
        </div>
        <canvas id="previewCanvas"></canvas>
        <div class="preview-info">
          <span id="previewAuthor"></span>
          <span id="previewTime" class="preview-time"></span>
        </div>
        <div class="preview-note">仅支持预览，不可载入作画。请勿抄袭或直接提交他人的作品。</div>
      </div>
    </div>`,
  mounted() {
      ;(function () {
        try {
          var has =
            document.cookie.indexOf('paint_consent=') !== -1 ||
            document.cookie.split(';').some(function (c) {
              return c.trim().indexOf('paint_consent=') === 0
            })
          if (!has) document.getElementById('consentOverlay').removeAttribute('hidden')
        } catch (e) {}
      })()
      let size = 16
      const PRESET_COLORS = [
        ['#e53935', '红'],
        ['#fb8c00', '橙'],
        ['#fdd835', '黄'],
        ['#43a047', '绿'],
        ['#00acc1', '青'],
        ['#1e88e5', '蓝'],
        ['#8e24aa', '紫'],
        ['#ffffff', '白'],
        ['#212121', '黑'],
      ]
      const TOOL_HINTS = {
        brush: '画笔：点按或滑动作画 · 快捷键 B',
        eraser: '橡皮擦：点按或滑动擦除为白色 · 快捷键 E',
        fill: '颜料桶：点一下区域即可填充当前颜色 · 快捷键 F',
      }

      /* ---------- 命题 ---------- */
      const PROMPT_CATEGORIES = [
        '日常与当下', '心情与感受', '喜好与厌恶', '回忆与童年', '梦想与未来',
        '想象与创造', '身体与变形', '感官与抽象', '日常物品与场景', '情感与总结',
      ]
      const PIXEL_PROMPTS = [
        '画一个你最喜欢的东西',
        '画一个你今天见过的东西',
        '画一个你今天吃的第一个东西',
        '画一个你现在身边的东西',
        '画一个你此刻最想做的事',
        '画一个你今天听到的声音',
        '画一个你今天闻到的味道',
        '画一个你今天摸到的东西',
        '画一个你今天遇到的人',
        '画一个你今天看到的最有趣的东西',
        '画一个让你开心的东西',
        '画一个让你感到难过的画面',
        '画一个让你害怕的东西',
        '画一个让你放松的地方',
        '画一个你此刻的心情',
        '画一个你生气时的样子',
        '画一个你开心时的样子',
        '画一个你困倦时的样子',
        '画一个你最近一次大笑的原因',
        '画一个你最近一次发呆时想的画面',
        '画一个你最喜欢的动物',
        '画一个你最讨厌的食物',
        '画一个你最喜欢的季节',
        '画一个你讨厌的天气',
        '画一个你喜欢的天气',
        '画一个你最喜欢的颜色',
        '画一个你讨厌的颜色',
        '画一个你最喜欢的数字',
        '画一个你最喜欢的形状',
        '画一个你最常用的表情',
        '画一个你童年最爱的玩具',
        '画一个你小时候的照片',
        '画一个你住过的老房子',
        '画一个你最好的朋友',
        '画一个你最难忘的旅行',
        '画一个你最想保存的瞬间',
        '画一个你最想重复的一天',
        '画一个你最想跳过的一天',
        '画一个你最近学会的东西',
        '画一个你一直学不会的东西',
        '画一个你想去的地方',
        '画一个你想拥有的超能力',
        '画一个你未来的家',
        '画一个你理想的工作台',
        '画一个你心中的英雄',
        '画一个你最想收到的礼物',
        '画一个你最想送出的礼物',
        '画一个你明天想做的事',
        '画一个你希望别人看到的东西',
        '画一个你愿意永远记住的东西',
        '画一个你想象的外星宠物',
        '画一个你设计的新物种',
        '画一个你发明的机器',
        '画一个你创造的游戏角色',
        '画一个你心中的秘密基地',
        '画一个你最想去的星球',
        '画一个你心中的宇宙',
        '画一个你漂浮在空中的样子',
        '画一个你缩小后的世界',
        '画一个你放大后的世界',
        '画一个你变老后的样子',
        '画一个你变成动物的样子',
        '画一个你变成植物的样子',
        '画一个你变成机器人的样子',
        '画一个你倒立看到的世界',
        '画一个你闭上眼睛看到的东西',
        '画一个你捂住耳朵听到的画面',
        '画一个你吃饭时的样子',
        '画一个你今天的穿搭',
        '画一个你心中的安静角落',
        '画一个你闻起来像雨的东西',
        '画一个你尝起来像星星的东西',
        '画一个你摸起来像云的东西',
        '画一个你听起来像风的东西',
        '画一个你心中最温暖的颜色',
        '画一个你心中最冷的角落',
        '画一个你最近梦到的东西',
        '画一个你经常做的梦',
        '画一个你害怕的怪物',
        '画一个你不敢说出口的话',
        '画一个你房间里最乱的地方',
        '画一个你手机里最常见的图标',
        '画一个你每天都会路过的店',
        '画一个你今天看到的云',
        '画一个你理想的早餐',
        '画一个你今晚想吃的晚餐',
        '画一个你喝过最好喝的饮料',
        '画一个你最近循环听的歌',
        '画一个你最喜欢的电影场景',
        '画一个你最喜欢的游戏道具',
        '画一个你想对某人说的事',
        '画一个你最近一次感到骄傲的事',
        '画一个你最近一次感到尴尬的事',
        '画一个你最近一次哭的原因',
        '画一个你心中的完美像素画',
        '画一个你最喜欢的表情包',
        '画一个你今天犯的错',
        '画一个你今天的小幸运',
        '画一个你昨天忘记的事',
        '画一个你最喜欢的书封面',
      ]
      const PROMPT_KEY = 'paintPrompt'
      const promptCard = document.getElementById('promptCard')
      const promptRoll = document.getElementById('promptRoll')
      const promptText = document.getElementById('promptText')
      const promptMeta = document.getElementById('promptMeta')
      const promptCat = document.getElementById('promptCat')
      let promptIdx = -1

      function promptCand() {
        if (promptCat.value === 'all') return PIXEL_PROMPTS.map((_, i) => i)
        const g = Number(promptCat.value)
        return Array.from({ length: 10 }, (_, i) => g * 10 + i)
      }

      function applyPrompt(idx, syncCat) {
        promptIdx = idx
        promptText.textContent = PIXEL_PROMPTS[idx]
        promptMeta.textContent = PROMPT_CATEGORIES[Math.floor(idx / 10)] + ' · 第 ' + (idx + 1) + ' / ' + PIXEL_PROMPTS.length + ' 题'
        if (syncCat) promptCat.value = String(Math.floor(idx / 10))
      }

      function rollPrompt() {
        const pool = promptCand().filter((i) => i !== promptIdx)
        const cand = pool.length ? pool : promptCand()
        applyPrompt(cand[Math.floor(Math.random() * cand.length)], false)
        localStorage.setItem(PROMPT_KEY, String(promptIdx))
      }

      promptRoll.addEventListener('click', () => {
        rollPrompt()
        toast('给你出了一道新题')
      })
      promptCat.addEventListener('change', rollPrompt)

      function initPrompt() {
        const saved = parseInt(localStorage.getItem(PROMPT_KEY), 10)
        let idx = dailyPromptIdx()
        if (!isNaN(saved) && saved >= 0 && saved < PIXEL_PROMPTS.length) idx = saved
        applyPrompt(idx, true)
        localStorage.setItem(PROMPT_KEY, String(idx))
      }

      function dailyPromptIdx() {
        const d = new Date()
        const key = '' + d.getFullYear() + d.getMonth() + d.getDate()
        let h = 0
        for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
        return h % PIXEL_PROMPTS.length
      }

      /* ---------- 创作模式选择 ---------- */
      let createMode = null
      const modeOverlay = document.getElementById('modeOverlay')
      const modeBar = document.getElementById('modeBar')
      const modeChip = document.getElementById('modeChip')
      const switchModeBtn = document.getElementById('switchModeBtn')
      const MODE_LABEL = { free: '自由模式', prompt: '题目模式', anim: '帧动画' }

      function enterMode(mode) {
        const isPrompt = mode === 'prompt'
        const firstTime = createMode !== mode
        createMode = mode
        modeOverlay.hidden = true
        modeBar.hidden = false
        modeChip.textContent = '当前：' + MODE_LABEL[mode]
        promptCard.hidden = !isPrompt
        if (mode === 'anim') {
          if (!animOpen) {
            if (size !== 16) switchSize(16)
            animOpenEditor()
          }
        } else {
          if (animOpen) animCloseEditor()
          if (isPrompt && firstTime) initPrompt()
        }
        try { localStorage.setItem('lw-mode', mode) } catch (e) {}
      }

      document.querySelectorAll('.mode-opt').forEach((b) => {
        b.addEventListener('click', () => enterMode(b.dataset.mode))
      })
      switchModeBtn.addEventListener('click', () => {
        modeOverlay.hidden = false
      })
      modeOverlay.addEventListener('click', (e) => {
        if (e.target === modeOverlay && createMode) modeOverlay.hidden = true
      })

      const canvas = document.getElementById('board')
      const ctx = canvas.getContext('2d')

      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.height = 512 * dpr
      ctx.scale(dpr, dpr)
      let CELL = 512 / size

      let zoom = 1
      let panX = 0
      let panY = 0
      const MAX_ZOOM = 8

      let pixels = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => [255, 255, 255])
      )
      let currentColor = [229, 57, 53]
      let activeTool = 'brush'

      const hint = document.getElementById('hint')
      const curSwatch = document.getElementById('curSwatch')
      const curHex = document.getElementById('curHex')
      const undoBtn = document.getElementById('undoBtn')
      const zoomRow = document.getElementById('zoomRow')
      const zoomIn = document.getElementById('zoomIn')
      const zoomOut = document.getElementById('zoomOut')
      const zoomLevel = document.getElementById('zoomLevel')
      const miniWrap = document.getElementById('miniWrap')
      const miniCanvas = document.getElementById('miniCanvas')
      const MINI = 120
      miniCanvas.width = miniCanvas.height = MINI * dpr
      miniCanvas.style.width = MINI + 'px'
      miniCanvas.style.height = MINI + 'px'
      const miniCtx = miniCanvas.getContext('2d')
      const fullCanvas = document.createElement('canvas')
      fullCanvas.width = fullCanvas.height = 512 * dpr
      const fullCtx = fullCanvas.getContext('2d')
      let fullDirty = true

      /* ---------- 撤销 ---------- */
      const undoStack = []
      const MAX_UNDO = 30

      const snapshot = () => pixels.map((r) => r.map((px) => [px[0], px[1], px[2]]))
      const updateUndoBtn = () => (undoBtn.disabled = undoStack.length === 0)

      function pushUndo() {
        undoStack.push(snapshot())
        if (undoStack.length > MAX_UNDO) undoStack.shift()
        updateUndoBtn()
      }

      function undo() {
        if (!undoStack.length) return
        pixels = undoStack.pop()
        fullDirty = true
        redraw()
        updateUndoBtn()
        toast('已撤销')
      }

      undoBtn.addEventListener('click', () => {
        undo()
        scheduleSave()
      })

      /* ---------- 颜色 ---------- */
      const pickWrap = document.getElementById('pickWrap')
      const toolColorBtn = document.getElementById('toolColor')
      const hsvBody = document.getElementById('hsvBody')
      const customBtn = document.getElementById('customBtn')
      const presetRow = document.getElementById('presetRow')
      const svBox = document.getElementById('svBox')
      const svCanvas = document.getElementById('svCanvas')
      const svMarker = document.getElementById('svMarker')
      const hueBox = document.getElementById('hueBox')
      const hueCanvas = document.getElementById('hueCanvas')
      const hueMarker = document.getElementById('hueMarker')
      const ctxSv = svCanvas.getContext('2d')
      const ctxSvM = svMarker.getContext('2d')
      const ctxHue = hueCanvas.getContext('2d')
      const ctxHueM = hueMarker.getContext('2d')

      let H = 0, S = 0.77, V = 0.9
      let SW = 0, SH = 0, HW = 0, HH = 0
      let pickOpen = false
      let hsvOpen = false

      toolColorBtn.addEventListener('click', () => {
        pickOpen = !pickOpen
        pickWrap.hidden = !pickOpen
        toolColorBtn.classList.toggle('active', pickOpen)
        if (pickOpen && hsvOpen) resizePicker()
      })

      customBtn.addEventListener('click', () => {
        hsvOpen = !hsvOpen
        hsvBody.hidden = !hsvOpen
        customBtn.classList.toggle('active', hsvOpen)
        if (hsvOpen) resizePicker()
      })

      function hexToRgb(hex) {
        const h = hex.replace('#', '')
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
      }

      function parseHex(v) {
        const m = String(v).trim().replace(/^#/, '')
        if (!/^[0-9a-fA-F]{6}$/.test(m)) return null
        return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)]
      }

      function rgbToHsv([r, g, b]) {
        r /= 255; g /= 255; b /= 255
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const d = max - min
        let h = 0
        if (d !== 0) {
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) % 6
          else if (max === g) h = (b - r) / d + 2
          else h = (r - g) / d + 4
          h /= 6
        }
        const s = max === 0 ? 0 : d / max
        return [h, s, max]
      }

      function hsvToRgb(h, s, v) {
        const i = Math.floor(h * 6)
        const f = h * 6 - i
        const p = v * (1 - s)
        const q = v * (1 - f * s)
        const t = v * (1 - (1 - f) * s)
        const rr = Math.round([v, q, p, p, t, v][i % 6] * 255)
        const gg = Math.round([t, v, v, q, p, p][i % 6] * 255)
        const bb = Math.round([p, p, t, v, v, q][i % 6] * 255)
        return [rr, gg, bb]
      }

      function sameRgb(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
      }

      const presets = PRESET_COLORS.map(([hex]) => hexToRgb(hex))
      const swatches = PRESET_COLORS.map(([hex], i) => {
        const sw = document.createElement('button')
        sw.type = 'button'
        sw.className = 'swatch'
        sw.style.background = hex
        sw.title = PRESET_COLORS[i][1]
        sw.addEventListener('click', () => setFromPreset(i))
        presetRow.appendChild(sw)
        return sw
      })

      function setFromPreset(i) {
        setFromRgb(presets[i])
      }

      function setFromRgb(rgb) {
        currentColor = rgb.slice()
        const [h, s, v] = rgbToHsv(rgb)
        H = h
        S = s
        V = v
        if (pickOpen && hsvOpen) {
          renderSV()
          drawSVMarker()
          drawHueMarker()
        }
        updateDisplay(currentColor)
      }

      curHex.addEventListener('input', () => {
        const rgb = parseHex(curHex.value)
        if (rgb) setFromRgb(rgb)
      })

      curHex.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const rgb = parseHex(curHex.value)
          if (rgb) setFromRgb(rgb)
        }
      })

      function updateDisplay(rgb) {
        curSwatch.style.background = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
        curHex.value = '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('')
        swatches.forEach((sw, i) => sw.classList.toggle('selected', sameRgb(rgb, presets[i])))
      }

      function applyColor() {
        currentColor = hsvToRgb(H, S, V)
        updateDisplay(currentColor)
      }

      function resizePicker() {
        if (!pickOpen || !hsvOpen) return
        const sRect = svBox.getBoundingClientRect()
        SW = Math.max(20, Math.round(sRect.width * dpr))
        SH = SW
        svCanvas.width = svCanvas.height = SW
        svMarker.width = svMarker.height = SW

        const hRect = hueBox.getBoundingClientRect()
        HW = Math.max(10, Math.round(hRect.width * dpr))
        HH = Math.max(20, Math.round(hRect.height * dpr))
        hueCanvas.width = HW
        hueCanvas.height = HH
        hueMarker.width = HW
        hueMarker.height = HH

        renderSV()
        renderHue()
        drawSVMarker()
        drawHueMarker()
      }

      function renderSV() {
        if (!SW) return
        const img = ctxSv.createImageData(SW, SH)
        const d = img.data
        for (let y = 0; y < SH; y++) {
          const v = 1 - y / (SH - 1)
          for (let x = 0; x < SW; x++) {
            const s = x / (SW - 1)
            const [r, g, b] = hsvToRgb(H, s, v)
            const i = (y * SW + x) * 4
            d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255
          }
        }
        ctxSv.putImageData(img, 0, 0)
      }

      function renderHue() {
        if (!HW) return
        for (let y = 0; y < HH; y++) {
          const hue = y / (HH - 1)
          const [r, g, b] = hsvToRgb(hue, 1, 1)
          ctxHue.fillStyle = `rgb(${r}, ${g}, ${b})`
          ctxHue.fillRect(0, y, HW, 1)
        }
      }

      function drawSVMarker() {
        if (!SW) return
        ctxSvM.clearRect(0, 0, SW, SH)
        const x = S * SW
        const y = (1 - V) * SH
        ctxSvM.beginPath()
        ctxSvM.arc(x, y, 8 * dpr, 0, 2 * Math.PI)
        ctxSvM.fillStyle = '#fff'
        ctxSvM.fill()
        ctxSvM.lineWidth = 2 * dpr
        ctxSvM.strokeStyle = 'rgba(0, 0, 0, 0.7)'
        ctxSvM.stroke()
      }

      function drawHueMarker() {
        if (!HW) return
        ctxHueM.clearRect(0, 0, HW, HH)
        const y = H * HH
        ctxHueM.fillStyle = '#fff'
        ctxHueM.fillRect(0, y - 3 * dpr, HW, 6 * dpr)
        ctxHueM.strokeStyle = 'rgba(0, 0, 0, 0.7)'
        ctxHueM.lineWidth = 1.5 * dpr
        ctxHueM.beginPath()
        ctxHueM.moveTo(0, y)
        ctxHueM.lineTo(HW, y)
        ctxHueM.stroke()
      }

      let svDrag = false
      let hueDrag = false

      function setSV(e) {
        const rect = svCanvas.getBoundingClientRect()
        S = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        V = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
        drawSVMarker()
        applyColor()
      }

      svCanvas.addEventListener('pointerdown', (e) => {
        e.preventDefault()
        svDrag = true
        svCanvas.setPointerCapture(e.pointerId)
        setSV(e)
      })
      svCanvas.addEventListener('pointermove', (e) => {
        if (svDrag) setSV(e)
      })
      svCanvas.addEventListener('pointerup', () => (svDrag = false))
      svCanvas.addEventListener('pointercancel', () => (svDrag = false))

      function setHue(e) {
        const rect = hueCanvas.getBoundingClientRect()
        H = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
        renderSV()
        drawHueMarker()
        applyColor()
      }

      hueCanvas.addEventListener('pointerdown', (e) => {
        e.preventDefault()
        hueDrag = true
        hueCanvas.setPointerCapture(e.pointerId)
        setHue(e)
      })
      hueCanvas.addEventListener('pointermove', (e) => {
        if (hueDrag) setHue(e)
      })
      hueCanvas.addEventListener('pointerup', () => (hueDrag = false))
      hueCanvas.addEventListener('pointercancel', () => (hueDrag = false))

      window.addEventListener('resize', resizePicker)

      /* ---------- 画板 ---------- */
      document.querySelectorAll('.tool[data-tool]').forEach((btn) => {
        btn.addEventListener('click', () => setTool(btn.dataset.tool))
      })

      function setTool(tool) {
        activeTool = tool
        document.querySelectorAll('.tool[data-tool]').forEach((b) =>
          b.classList.toggle('active', b.dataset.tool === tool)
        )
        refreshHint()
      }

      function refreshHint() {
        const base = TOOL_HINTS[activeTool] || TOOL_HINTS.brush
        hint.textContent = size > 16 ? base + ' · 拖动画布移动，点一下格子涂色，＋/－ 缩放' : base + ' · 拖动涂色'
      }

      function resetCamera() {
        zoom = Math.max(1, size / 32)
        panX = 0
        panY = 0
        clampPan()
        zoomRow.hidden = size === 16
        updateMiniVis()
        updateZoomUI()
      }

      function setCam(nz, c) {
        nz = Math.max(1, Math.min(MAX_ZOOM, nz))
        if (c) {
          panX = c.x - 256 / nz
          panY = c.y - 256 / nz
        }
        zoom = nz
        clampPan()
        updateMiniVis()
        redraw()
        updateZoomUI()
      }

      function clampPan() {
        const maxPan = 512 - 512 / zoom
        panX = Math.max(0, Math.min(maxPan, panX))
        panY = Math.max(0, Math.min(maxPan, panY))
      }

      function updateMiniVis() {
        miniWrap.hidden = size === 16 || zoom <= 1
      }

      function updateZoomUI() {
        zoomLevel.textContent = Math.round(zoom * 100) + '%'
      }

      function switchSize(n) {
        if (n === size) return
        if (animOpen && n !== 16) {
          animFrames = null
          animCloseEditor()
        }
        size = n
        CELL = 512 / size
        pixels = Array.from({ length: size }, () =>
          Array.from({ length: size }, () => [255, 255, 255])
        )
        fullDirty = true
        undoStack.length = 0
        updateUndoBtn()
        document.querySelectorAll('.size-btn').forEach((b) =>
          b.classList.toggle('active', Number(b.dataset.size) === size)
        )
        resetCamera()
        refreshHint()
        redraw()
      }

      document.querySelectorAll('.size-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const n = Number(btn.dataset.size)
          if (n === size) return
          switchSize(n)
          scheduleSave()
          toast('画布已切换为 ' + n + '×' + n)
        })
      })

      zoomIn.addEventListener('click', () => {
        const c = { x: 256 / zoom + panX, y: 256 / zoom + panY }
        setCam(zoom * 1.5, c)
      })
      zoomOut.addEventListener('click', () => {
        const c = { x: 256 / zoom + panX, y: 256 / zoom + panY }
        setCam(zoom / 1.5, c)
      })

      function drawGrid() {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.10)'
        ctx.lineWidth = 1 / zoom
        for (let i = 1; i < size; i++) {
          const p = i * CELL + 0.5
          ctx.beginPath()
          ctx.moveTo(p, 0)
          ctx.lineTo(p, 512)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, p)
          ctx.lineTo(512, p)
          ctx.stroke()
        }
      }

      function redraw() {
        ensureFull()
        ctx.imageSmoothingEnabled = false
        ctx.setTransform(zoom * dpr, 0, 0, zoom * dpr, -panX * zoom * dpr, -panY * zoom * dpr)
        ctx.clearRect(0, 0, 512, 512)
        ctx.drawImage(fullCanvas, 0, 0, 512, 512)
        drawGrid()
        renderMini()
      }

      function ensureFull() {
        if (!fullDirty) return
        renderFull()
        fullDirty = false
      }

      function renderFull() {
        fullCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
        fullCtx.clearRect(0, 0, 512, 512)
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const [r, g, b] = pixels[y][x]
            fullCtx.fillStyle = `rgb(${r}, ${g}, ${b})`
            fullCtx.fillRect(x * CELL, y * CELL, CELL, CELL)
          }
        }
      }

      function renderMini() {
        const k = miniCanvas.width / 512
        miniCtx.setTransform(1, 0, 0, 1, 0, 0)
        miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height)
        miniCtx.imageSmoothingEnabled = false
        miniCtx.setTransform(k, 0, 0, k, 0, 0)
        miniCtx.drawImage(fullCanvas, 0, 0, 512, 512)
        if (size <= 16) return
        miniCtx.setTransform(1, 0, 0, 1, 0, 0)
        miniCtx.strokeStyle = 'rgba(255, 82, 82, 0.95)'
        miniCtx.lineWidth = 2
        miniCtx.strokeRect(panX * k, panY * k, (512 / zoom) * k, (512 / zoom) * k)
      }

      miniCanvas.addEventListener('pointerdown', (e) => {
        if (size <= 16) return
        const rect = miniCanvas.getBoundingClientRect()
        const bx = ((e.clientX - rect.left) / rect.width) * 512
        const by = ((e.clientY - rect.top) / rect.height) * 512
        panX = bx - 256 / zoom
        panY = by - 256 / zoom
        clampPan()
        redraw()
      })

      function cellFromEvent(e) {
        const rect = canvas.getBoundingClientRect()
        const boardX = ((e.clientX - rect.left) * (512 / rect.width)) / zoom + panX
        const boardY = ((e.clientY - rect.top) * (512 / rect.height)) / zoom + panY
        const col = Math.floor(boardX / CELL)
        const row = Math.floor(boardY / CELL)
        return { row: Math.max(0, Math.min(size - 1, row)), col: Math.max(0, Math.min(size - 1, col)) }
      }

      function sameColor(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
      }

      function floodFill(row, col) {
        const target = pixels[row][col]
        if (sameColor(target, currentColor)) return
        const stack = [[row, col]]
        while (stack.length) {
          const [r, c] = stack.pop()
          if (r < 0 || r >= size || c < 0 || c >= size) continue
          const px = pixels[r][c]
          if (!sameColor(px, target)) continue
          pixels[r][c] = currentColor.slice()
          stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1])
        }
      }

      function paintCell(row, col) {
        fullDirty = true
        if (activeTool === 'fill') {
          floodFill(row, col)
          return
        }
        const color = activeTool === 'eraser' ? [255, 255, 255] : currentColor
        pixels[row][col] = color.slice()
      }

      function paint(e) {
        const { row, col } = cellFromEvent(e)
        paintCell(row, col)
      }

      let painting = false
      let panning = false
      let startX = 0
      let startY = 0
      let startPanX = 0
      let startPanY = 0
      let downCell = null
      const PAN_DIST = 12

      canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault()
        canvas.setPointerCapture(e.pointerId)
        if (size > 16) {
          painting = true
          panning = false
          downCell = cellFromEvent(e)
          startX = e.clientX
          startY = e.clientY
          startPanX = panX
          startPanY = panY
        } else {
          painting = true
          panning = false
          pushUndo()
          paint(e)
          redraw()
        }
      })

      canvas.addEventListener('pointermove', (e) => {
        if (!painting) return
        if (size > 16) {
          const dx = e.clientX - startX
          const dy = e.clientY - startY
          if (!panning && Math.hypot(dx, dy) >= PAN_DIST) {
            panning = true
          }
          if (panning) {
            const rect = canvas.getBoundingClientRect()
            const s = 512 / rect.width
            panX = startPanX - dx * s / zoom
            panY = startPanY - dy * s / zoom
            clampPan()
            redraw()
          }
        } else if (activeTool !== 'fill') {
          paint(e)
          redraw()
        }
      })

      function finishTap() {
        if (downCell) {
          pushUndo()
          paintCell(downCell.row, downCell.col)
          downCell = null
          redraw()
          scheduleSave()
        }
      }

      canvas.addEventListener('pointerup', () => {
        if (painting && size > 16 && !panning) {
          finishTap()
        } else if (painting && size <= 16) {
          scheduleSave()
        }
        painting = false
        panning = false
        downCell = null
      })

      canvas.addEventListener('pointercancel', () => {
        if (painting && size > 16 && !panning) {
          finishTap()
        }
        painting = false
        panning = false
        downCell = null
      })

      document.getElementById('clearBtn').addEventListener('click', () => {
        pushUndo()
        pixels = Array.from({ length: size }, () =>
          Array.from({ length: size }, () => [255, 255, 255])
        )
        fullDirty = true
        redraw()
        scheduleSave()
        toast('已清空')
      })

      /* ---------- 中途保存（localStorage） ---------- */
      const DRAFT_KEY = 'paintDraft'
      const DRAFT_VERSION = 3
      let saveTimer

      function saveDraft() {
        try {
          const flat = []
          for (const row of pixels) {
            for (const px of row) {
              flat.push([px[0], px[1], px[2]])
            }
          }
          localStorage.setItem(DRAFT_KEY, JSON.stringify({
            v: DRAFT_VERSION,
            size,
            pixels: flat,
            time: Date.now()
          }))
        } catch (err) {
          /* 存储失败可忽略 */
        }
      }

      function normalizePixel(px) {
        if (!Array.isArray(px) || px.length < 3) return [255, 255, 255]
        const r = Number(px[0])
        const g = Number(px[1])
        const b = Number(px[2])
        if (![r, g, b].every(Number.isFinite)) return [255, 255, 255]
        return [
          Math.max(0, Math.min(255, Math.round(r))),
          Math.max(0, Math.min(255, Math.round(g))),
          Math.max(0, Math.min(255, Math.round(b))),
        ]
      }

      function scheduleSave() {
        clearTimeout(saveTimer)
        saveTimer = setTimeout(saveDraft, 400)
      }

      function loadDraft() {
        try {
          const raw = localStorage.getItem(DRAFT_KEY)
          if (!raw) return false
          const data = JSON.parse(raw)
          if (!data || !Array.isArray(data.pixels)) return false

          const ds = data.size === 32 || data.size === 64 ? data.size : 16
          if (ds !== size) {
            size = ds
            CELL = 512 / size
            undoStack.length = 0
            updateUndoBtn()
            document.querySelectorAll('.size-btn').forEach((b) =>
              b.classList.toggle('active', Number(b.dataset.size) === size)
            )
            resetCamera()
            refreshHint()
          }

          const src = data.pixels
          const out = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => [255, 255, 255])
          )

          const isNested = Array.isArray(src[0]) && Array.isArray(src[0][0])
          const isFlat = Array.isArray(src[0]) && typeof src[0][0] === 'number'

          if (isNested) {
            for (let y = 0; y < size; y++) {
              for (let x = 0; x < size; x++) {
                out[y][x] = normalizePixel(src[y] && src[y][x])
              }
            }
          } else if (isFlat) {
            for (let y = 0; y < size; y++) {
              for (let x = 0; x < size; x++) {
                out[y][x] = normalizePixel(src[y * size + x])
              }
            }
          } else {
            return false
          }

          pixels = out
          fullDirty = true
          redraw()
          return true
        } catch (err) {
          return false
        }
      }

      window.addEventListener('beforeunload', saveDraft)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) saveDraft()
      })

      /* ---------- 作品名与作者名 ---------- */
      const titleInput = document.getElementById('titleInput')
      const nameInput = document.getElementById('nameInput')

      /* ---------- 每周主题比赛 ---------- */
      const contestRow = document.getElementById('contestRow')
      const contestCheck = document.getElementById('contestCheck')
      const contestLabel = document.getElementById('contestLabel')
      let contestWeek = ''
      let contestTheme = ''

      function syncContestFields() {
        const on = contestCheck.checked
        if (on) {
          if (!titleInput.disabled) titleInput.dataset.keep = titleInput.value
          titleInput.disabled = true
          if (contestTheme) titleInput.value = '《' + contestTheme + '》'
        } else {
          titleInput.disabled = false
          titleInput.value = titleInput.dataset.keep || ''
        }
      }

      ;(async () => {
        try {
          const res = await fetch('/api/contest')
          if (!res.ok) return
          const c = await res.json()
          if (c && c.open) {
            contestWeek = c.week
            contestTheme = c.theme ? c.theme.zh : ''
            contestLabel.textContent =
              '🏆 参与本周主题《' + contestTheme + '》' + ((c.theme && c.theme.prompt) ? ' · ' + c.theme.prompt : '')
            contestRow.hidden = false
            if (new URLSearchParams(location.search).get('contest') === '1') contestCheck.checked = true
            syncContestFields()
          }
        } catch (e) {}
      })()

      contestCheck.addEventListener('change', syncContestFields)

      function readCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'))
        return match ? decodeURIComponent(match[1]) : ''
      }

      function initName() {
        const saved = localStorage.getItem('paintName')
        const cookieUser = readCookie('username')
        nameInput.value = saved || cookieUser || ''
        nameInput.addEventListener('input', () => {
          localStorage.setItem('paintName', nameInput.value.trim())
        })
        nameInput.addEventListener('change', () => {
          if (typeof fetchRecords === 'function') fetchRecords()
        })
      }

      function resolveAuthor() {
        let name = nameInput.value.trim()
        if (!name) {
          const typed = window.prompt('未填写作者名：输入你的名字后确定；直接确定或取消将匿名上传。')
          if (typed !== null) {
            name = typed.trim()
            if (name) {
              nameInput.value = name
              localStorage.setItem('paintName', name)
            }
          }
        }
        return name
      }

      function formatTime(ts) {
        if (!ts) return ''
        const d = new Date(ts)
        return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      }

      const recordList = document.getElementById('recordList')
      const moreBtn = document.getElementById('moreBtn')

      const mineSet = loadMine()

      function loadMine() {
        try {
          return new Set(JSON.parse(localStorage.getItem('lw-mine') || '[]'))
        } catch (e) {
          return new Set()
        }
      }

      function addMine(time) {
        const arr = [...mineSet]
        if (arr.includes(String(time))) return
        arr.push(String(time))
        if (arr.length > 200) arr.splice(0, arr.length - 200)
        mineSet.clear()
        arr.forEach((t) => mineSet.add(t))
        try {
          localStorage.setItem('lw-mine', JSON.stringify(arr))
        } catch (e) {}
      }

      function loadOwn(rec) {
        const rs = rec.size === 32 || rec.size === 64 ? rec.size : 16
        if (rs !== size) {
          size = rs
          CELL = 512 / size
          document.querySelectorAll('.size-btn').forEach((b) =>
            b.classList.toggle('active', Number(b.dataset.size) === size)
          )
          resetCamera()
          refreshHint()
        }
        pixels = []
        for (let i = 0; i < rs * rs; i += rs) {
          const row = []
          for (let j = 0; j < rs; j++) {
            const p = rec.pixels[i + j] || [255, 255, 255]
            row.push([p[0], p[1], p[2]])
          }
          pixels.push(row)
        }
        fullDirty = true
        undoStack.length = 0
        updateUndoBtn()
        redraw()
        scheduleSave()
        toast('已载入你的作品，可继续编辑后重新上传')
      }

      async function fetchRecords() {
        const myName = nameInput ? nameInput.value.trim() : ''
        if (myName) {
          try {
            const res = await fetch('/api/get?limit=10&mine=' + encodeURIComponent(myName))
            if (!res.ok) return
            const data = await res.json()
            renderRecords(data.history || [], data.total || 0)
          } catch (err) {
            /* 忽略加载失败 */
          }
          return
        }
        const ids = [...mineSet]
        if (!ids.length) {
          renderRecords([], 0)
          return
        }
        try {
          const res = await fetch('/api/get?limit=200&minetimes=' + ids.join(','))
          if (!res.ok) return
          const data = await res.json()
          renderRecords(data.history || [], data.total || 0)
        } catch (err) {
          /* 忽略加载失败 */
        }
      }

      function renderRecords(records, total) {
        recordList.innerHTML = ''
        moreBtn.hidden = !(total > records.length)
        if (!records.length) {
          const empty = document.createElement('div')
          empty.className = 'record-empty'
          empty.textContent =
            total > 0
              ? '还没有找到你的作品：填好作者名后就会显示在这里'
              : '还没有你的作品：快去画一幅并上传吧，也可以去社区看看大家的作品'
          recordList.appendChild(empty)
          return
        }
        records.forEach((rec) => {
          const tile = document.createElement('button')
          tile.type = 'button'
          tile.className = 'tile'
          tile.title = '点击预览'

          const rs = rec.size === 32 || rec.size === 64 ? rec.size : 16

          const c = document.createElement('img')
          c.className = 'thumb'
          c.alt = rec.workName || rec.name || '未命名'
          c.src = pixelsToURL(rec.pixels, rs)

          const meta = document.createElement('div')
          meta.className = 'tile-meta'
          const nm = document.createElement('span')
          nm.textContent = rec.workName || rec.name || '未命名'
          const metaRow = document.createElement('span')
          metaRow.className = 'tile-meta-row'
          const au = document.createElement('span')
          au.textContent = rec.author || rec.name || '匿名'
          const tm = document.createElement('span')
          tm.className = 'tile-time'
          tm.textContent = formatTime(rec.time)

          const likeBadge = document.createElement('span')
          likeBadge.className = 'tile-like' + (likedSet.has(String(rec.time)) ? ' liked' : '')
          likeBadge.textContent = '♥ ' + (rec.likes || 0)
          likeBadge.addEventListener('click', (e) => {
            e.stopPropagation()
            likeWork(rec, likeBadge)
          })

          metaRow.append(au, tm, likeBadge)
          meta.append(nm, metaRow)

          if (mineSet.has(String(rec.time))) {
            const loadBtn = document.createElement('span')
            loadBtn.className = 'tile-load'
            loadBtn.textContent = '载入编辑'
            loadBtn.addEventListener('click', (e) => {
              e.stopPropagation()
              loadOwn(rec)
            })
            meta.appendChild(loadBtn)
          }

          tile.append(c, meta)
          tile.addEventListener('click', () => previewRecord(rec))
          recordList.appendChild(tile)
        })
      }

      function previewRecord(rec) {
        const rs = rec.size === 32 || rec.size === 64 ? rec.size : 16
        const c = document.getElementById('previewCanvas')
        c.width = rs
        c.height = rs
        const tc = c.getContext('2d')
        tc.clearRect(0, 0, rs, rs)
        for (let y = 0; y < rs; y++) {
          for (let x = 0; x < rs; x++) {
            const px = rec.pixels[y * rs + x]
            if (!px) continue
            tc.fillStyle = `rgb(${px[0]}, ${px[1]}, ${px[2]})`
            tc.fillRect(x, y, 1, 1)
          }
        }
        document.getElementById('previewTitle').textContent = rec.workName || rec.name || '未命名'
        document.getElementById('previewAuthor').textContent = '作者：' + (rec.author || rec.name || '匿名') + ' · ' + rs + '×' + rs
        document.getElementById('previewTime').textContent = formatTime(rec.time)
        previewOverlay.hidden = false
      }

      const previewOverlay = document.getElementById('previewOverlay')
      const previewClose = document.getElementById('previewClose')

      function closePreview() {
        previewOverlay.hidden = true
      }

      previewClose.addEventListener('click', closePreview)
      previewOverlay.addEventListener('click', (e) => {
        if (e.target === previewOverlay) closePreview()
      })
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePreview()
      })

      function pixelsToURL(px, n) {
        const cv = document.createElement('canvas')
        cv.width = n
        cv.height = n
        const tc = cv.getContext('2d')
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const p = px[y * n + x]
            if (!p) continue
            tc.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`
            tc.fillRect(x, y, 1, 1)
          }
        }
        return cv.toDataURL('image/png')
      }

      /* ---------- 帧动画 ---------- */
      const animEditor = document.getElementById('animEditor')
      const animFrameStrip = document.getElementById('animFrameStrip')
      const animCountBtns = document.querySelectorAll('.anim-count-btn')
      const animSpeedBtns = document.querySelectorAll('.anim-speed-btn')
      const animOverlay = document.getElementById('animOverlay')
      let animOpen = false
      let animActive = 0
      let animCount = 4
      let animDelay = 10
      let animLastActive = 0
      let animFrames = null

      function animInitFrames() {
        animFrames = []
        for (let i = 0; i < animCount; i++) animFrames.push(snapshot())
      }

      function animFlush() {
        if (!animFrames) return
        animFrames[animActive] = snapshot()
      }

      function animRenderStrip() {
        animFrameStrip.textContent = ''
        const cur = Math.min(animActive, animFrames.length - 1)
        for (let i = 0; i < animFrames.length; i++) {
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'anim-frame' + (i === cur ? ' active' : '')
          const cv = document.createElement('canvas')
          cv.width = cv.height = 48
          const cx = cv.getContext('2d')
          const m = animFrames[i]
          cx.imageSmoothingEnabled = false
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const px = m[y][x]
              cx.fillStyle = 'rgb(' + px[0] + ',' + px[1] + ',' + px[2] + ')'
              cx.fillRect(x * 3, y * 3, 3, 3)
            }
          }
          btn.appendChild(cv)
          const tag = document.createElement('span')
          tag.textContent = '第 ' + (i + 1) + ' 帧'
          btn.appendChild(tag)
          btn.addEventListener('click', () => {
            if (i === animActive) return
            animFlush()
            animActive = i
            animLoad()
          })
          animFrameStrip.appendChild(btn)
        }
      }

      function animLoad() {
        const m = animFrames[animActive]
        pixels = m.map((r) => r.map((px) => [px[0], px[1], px[2]]))
        fullDirty = true
        undoStack.length = 0
        updateUndoBtn()
        redraw()
        scheduleSave()
        animLastActive = animActive
        animRenderStrip()
      }

      function animOpenEditor() {
        animEditor.hidden = false
        animOpen = true
        if (!animFrames) {
          animInitFrames()
          animActive = 0
          animLastActive = 0
        } else {
          animActive = animLastActive
        }
        animRenderStrip()
        toast('开始编辑帧动画 · 当前第 ' + (animActive + 1) + ' 帧')
      }

      function animCloseEditor() {
        animFlush()
        animEditor.hidden = true
        animOpen = false
      }

      document.getElementById('animClose').addEventListener('click', () => {
        if (animOpen) animCloseEditor()
      })

      animCountBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const n = Number(btn.dataset.count)
          if (n === animCount || !animOpen) return
          animFlush()
          animCount = n
          if (animFrames.length > n) {
            animFrames = animFrames.slice(0, n)
          } else {
            while (animFrames.length < n) {
              const last = animFrames[animFrames.length - 1]
              animFrames.push(last.map((r) => r.map((px) => [px[0], px[1], px[2]])))
            }
          }
          if (animActive >= animFrames.length) {
            animActive = animFrames.length - 1
            animLoad()
          } else {
            animRenderStrip()
          }
          animCountBtns.forEach((b) => b.classList.toggle('active', Number(b.dataset.count) === animCount))
          toast('帧数已切换为 ' + n + ' 帧')
        })
      })

      animSpeedBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          animDelay = Number(btn.dataset.delay)
          animSpeedBtns.forEach((b) => b.classList.toggle('active', b === btn))
          toast('播放速度已调整')
        })
      })

      document.getElementById('animCopy').addEventListener('click', () => {
        if (!animOpen || !animFrames) return
        animFlush()
        if (animActive === 0) {
          toast('已经是第一帧，无法复制上一帧')
          return
        }
        const src = animFrames[animActive - 1]
        animFrames[animActive] = src.map((r) => r.map((px) => [px[0], px[1], px[2]]))
        animLoad()
        toast('已把上一帧复制到第 ' + (animActive + 1) + ' 帧')
      })

      document.getElementById('animClear').addEventListener('click', () => {
        if (!animOpen || !animFrames) return
        animFrames[animActive] = Array.from({ length: 16 }, () =>
          Array.from({ length: 16 }, () => [255, 255, 255])
        )
        animLoad()
        toast('已清空第 ' + (animActive + 1) + ' 帧')
      })

      document.getElementById('animExport').addEventListener('click', () => {
        if (!animOpen || !animFrames) return
        animFlush()
        try {
          const dataURL = buildAnimGif(animFrames)
          document.getElementById('animImg').src = dataURL
          const dl = document.getElementById('animDownload')
          dl.href = dataURL
          animOverlay.hidden = false
        } catch (err) {
          toast('导出失败：' + err.message)
        }
      })

      document.getElementById('animOverlayClose').addEventListener('click', () => {
        animOverlay.hidden = true
      })
      animOverlay.addEventListener('click', (e) => {
        if (e.target === animOverlay) animOverlay.hidden = true
      })

      function buildAnimGif(frames) {
        const Q = (v) => Math.min(255, Math.round(v / 24) * 24)
        const keyOf = (px, q) => {
          const r = q ? Q(px[0]) : px[0]
          const g = q ? Q(px[1]) : px[1]
          const b = q ? Q(px[2]) : px[2]
          return (r << 16) | (g << 8) | b
        }
        let map = new Map()
        let ints = []
        const collect = (quant) => {
          map = new Map()
          ints = []
          for (const m of frames) for (const r of m) for (const px of r) {
            const key = keyOf(px, quant)
            if (map.has(key) || ints.length >= 256) continue
            map.set(key, ints.length)
            ints.push(key)
          }
        }
        collect(false)
        let q = false
        outer: for (const m of frames) {
          for (const r of m) {
            for (const px of r) {
              if (!map.has(keyOf(px, false))) { q = true; break outer }
            }
          }
        }
        if (q) collect(true)
        const nearestIdx = (key) => {
          const tr = (key >> 16) & 255, tg = (key >> 8) & 255, tb = key & 255
          let best = 0, bd = Infinity
          for (let i = 0; i < ints.length; i++) {
            const cr = (ints[i] >> 16) & 255, cg = (ints[i] >> 8) & 255, cb = ints[i] & 255
            const d = (tr - cr) * (tr - cr) + (tg - cg) * (tg - cg) + (tb - cb) * (tb - cb)
            if (d < bd) { bd = d; best = i }
          }
          return best
        }
        const idxOf = (px) => {
          const key = keyOf(px, q)
          return map.has(key) ? map.get(key) : nearestIdx(key)
        }
        const mats = frames.map((m) => m.map((r) => r.map(idxOf)))
        let p = 1
        while ((1 << p) < ints.length) p++
        const pad = new Uint32Array(1 << p)
        for (let i = 0; i < ints.length; i++) pad[i] = ints[i]
        const buf = new Uint8Array(1 << 21)
        const writer = new GifWriter(buf, 512, 512, { palette: pad, loop: 0 })
        for (const m of mats) {
          const up = new Uint8Array(262144)
          for (let y = 0; y < 16; y++) {
            const rowBase = y * 32 * 512
            for (let x = 0; x < 16; x++) {
              const v = m[y][x]
              const colBase = rowBase + x * 32
              for (let dy = 0; dy < 32; dy++) up.fill(v, colBase + dy * 512, colBase + dy * 512 + 32)
            }
          }
          writer.addFrame(0, 0, 512, 512, up, { delay: animDelay })
        }
        const end = writer.end()
        const bytes = buf.subarray(0, end)
        let s = ''
        const CHUNK = 0x8000
        for (let i = 0; i < bytes.length; i += CHUNK) {
          s += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CHUNK, bytes.length)))
        }
        return 'data:image/gif;base64,' + btoa(s)
      }

      /* ---------- 赞赏 ---------- */
      const tipOverlay = document.getElementById('tipOverlay')

      document.getElementById('tipBtn').addEventListener('click', () => {
        tipOverlay.hidden = false
      })
      document.getElementById('tipClose').addEventListener('click', () => {
        tipOverlay.hidden = true
      })
      tipOverlay.addEventListener('click', (e) => {
        if (e.target === tipOverlay) tipOverlay.hidden = true
      })

      const uploadBtn = document.getElementById('uploadBtn')

      async function doPublish(payload, btn) {
        btn.disabled = true
        try {
          const res = await fetch('/api/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            if (data.time) addMine(data.time)
            toast('发布「' + (data.workName || '未命名') + '」成功')
            fetchRecords()
            return true
          }
          toast('上传失败：' + (data.error || res.status))
        } catch (err) {
          toast('上传失败：网络错误')
        } finally {
          btn.disabled = false
        }
        return false
      }

      uploadBtn.addEventListener('click', async () => {
        const author = resolveAuthor()

        const flat = []
        for (const row of pixels) for (const px of row) flat.push(normalizePixel(px))
        const payload = { pixels: flat, size }
        if (author) payload.author = author
        const workName = (contestCheck.checked && contestTheme) ? '《' + contestTheme + '》' : titleInput.value.trim()
        if (workName) payload.workName = workName
        if (contestCheck.checked && contestWeek) payload.contest = contestWeek

        await doPublish(payload, uploadBtn)
      })

      const animPublishBtn = document.getElementById('animPublish')
      animPublishBtn.addEventListener('click', async () => {
        if (!animOpen || !animFrames) return
        animFlush()
        const frames = animFrames.map((f) =>
          f.map((r) => r.map((px) => [px[0], px[1], px[2]]))
        )
        const payload = {
          size: 16,
          anim: { frames, delay: animDelay },
        }
        const author = resolveAuthor()
        if (author) payload.author = author
        const workName = (contestCheck.checked && contestTheme) ? '《' + contestTheme + '》' : titleInput.value.trim()
        if (workName) payload.workName = workName
        if (contestCheck.checked && contestWeek) payload.contest = contestWeek
        await doPublish(payload, animPublishBtn)
      })

      let toastTimer
      function toast(msg) {
        const el = document.getElementById('toast')
        el.textContent = msg
        el.classList.add('show')
        clearTimeout(toastTimer)
        toastTimer = setTimeout(() => el.classList.remove('show'), 2200)
      }

      redraw()
      applyColor()
      initName()
      refreshHint()
      fetchRecords()

      /* ---------- 点赞 ---------- */
      const likedSet = loadLikedSet()

      function loadLikedSet() {
        try {
          const arr = JSON.parse(localStorage.getItem('lw-liked') || '[]')
          return new Set(Array.isArray(arr) ? arr : [])
        } catch (e) {
          return new Set()
        }
      }

      function saveLikedSet() {
        try {
          localStorage.setItem('lw-liked', JSON.stringify([...likedSet]))
        } catch (e) {}
      }

      async function likeWork(rec, badge) {
        const key = String(rec.time)
        if (likedSet.has(key)) {
          toast('你已经赞过这幅作品啦')
          return
        }
        if (badge) badge.style.pointerEvents = 'none'
        try {
          const res = await fetch('/api/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ time: rec.time }),
          })
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            likedSet.add(key)
            saveLikedSet()
            rec.likes = data.likes
            if (badge) {
              badge.textContent = '♥ ' + rec.likes
              badge.classList.add('liked')
            }
            toast('点赞成功 ♥')
          } else {
            toast('点赞失败：' + (data.error || res.status))
          }
        } catch (err) {
          toast('点赞失败：网络错误')
        } finally {
          if (badge) badge.style.pointerEvents = ''
        }
      }

      /* ---------- 键盘快捷键 ---------- */
      document.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return
        const tag = (e.target && e.target.tagName) || ''
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        if (!consentOverlay.hidden || !previewOverlay.hidden || !tipOverlay.hidden) return
        const k = e.key.toLowerCase()
        if (k === 'b') setTool('brush')
        else if (k === 'e') setTool('eraser')
        else if (k === 'f') setTool('fill')
        else if (k === 'c') {
          e.preventDefault()
          toolColorBtn.click()
        } else if (k === 'z') {
          e.preventDefault()
          undoBtn.click()
        }
      })

      /* ---------- 合规同意弹窗 ---------- */
      const consentOverlay = document.getElementById('consentOverlay')
      const consentYes = document.getElementById('consentYes')
      const consentNo = document.getElementById('consentNo')

      function hasConsent() {
        return document.cookie
          .split(';')
          .some((c) => c.trim().startsWith('paint_consent='))
      }

      function grantConsent() {
        document.cookie = 'paint_consent=1; max-age=' + 60 * 60 * 24 * 30 + '; path=/'
      }

      if (!hasConsent()) {
        document.body.style.overflow = 'hidden'
      } else {
        consentOverlay.hidden = true
        startCreation()
      }

      consentYes.addEventListener('click', () => {
        grantConsent()
        consentOverlay.hidden = true
        document.body.style.overflow = ''
        startCreation()
      })

      consentNo.addEventListener('click', () => {
        consentBox.innerHTML = `
          <h2>无法进入</h2>
          <div class="text">你已拒绝同意用户协议，根据规定无法使用本画板。若改变主意，可刷新页面重新选择。</div>`
      })

      function startCreation() {
        const savedMode = localStorage.getItem('lw-mode')
        if (loadDraft()) {
          toast('欢迎回来！你的数据已保存')
          enterMode(savedMode === 'anim' || savedMode === 'prompt' ? savedMode : 'free')
          return
        }
        modeOverlay.hidden = false
      }
  },
}
