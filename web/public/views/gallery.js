// 由 gallery.html 自动转换为 Vue 3 视图（无构建）
export default {
  name: 'gallery',
  title: '社区',
  css: `      /* hidden 属性兜底：避免类选择器里的 display 覆盖 UA 的 [hidden]{display:none} */
      [hidden] { display: none !important; }

      :root {
        --bg: #faf5ef;
        --surface: #ffffff;
        --surface-2: #efe9e0;
        --text: #3b342c;
        --text-muted: #6b5f50;
        --text-faint: #b0a697;
        --text-report: #8c7f6b;
        --border: #efe7da;
        --border-strong: #e0d3c0;
        --ring: #ffffff;
        --shadow: rgba(80, 60, 40, 0.08);
        --shadow-hover: rgba(80, 60, 40, 0.14);
        --accent: #5b8def;
        --like: #e5574b;
        --like-bg: #fff1ee;
        --like-border: #eec9c2;
        --art-bg: #ffffff;
        --overlay: rgba(20, 15, 10, 0.8);
      }
      [data-theme="dark"] {
        --bg: #181512;
        --surface: #262220;
        --surface-2: #332e29;
        --text: #ece5da;
        --text-muted: #b8ac9b;
        --text-faint: #7d7266;
        --text-report: #968a78;
        --border: #3a342f;
        --border-strong: #4a433c;
        --ring: #262220;
        --shadow: rgba(0, 0, 0, 0.4);
        --shadow-hover: rgba(0, 0, 0, 0.55);
        --accent: #6f9fff;
        --like: #ff7a6d;
        --like-bg: #3a221f;
        --like-border: #5a332c;
        --art-bg: #ffffff;
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
        max-width: 760px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      .back {
        flex: 0 0 auto;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-muted);
        text-decoration: none;
        background: var(--surface);
        border: 2px solid var(--border);
        border-radius: 999px;
        padding: 8px 16px;
        transition: border-color 0.2s;
      }

      .back:hover { border-color: var(--border-strong); }

      .header-text { flex: 1; min-width: 0; }

      .header-text h1 {
        font-size: 20px;
        font-weight: 800;
        color: var(--text);
      }

      #count {
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

      .featured {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 16px;
        margin-bottom: 22px;
        box-shadow: 0 4px 14px var(--shadow);
      }

      .featured[hidden] { display: none; }

      .finder {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 14px;
        margin-bottom: 16px;
      }

      .search-row { position: relative; display: flex; align-items: center; }

      .search-input {
        flex: 1;
        min-width: 0;
        height: 40px;
        border-radius: 999px;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        padding: 0 38px 0 16px;
        font-size: 14px;
        color: var(--text);
        outline: none;
      }
      .search-input:focus { border-color: var(--accent); }

      .search-clear {
        position: absolute;
        right: 6px;
        width: 28px; height: 28px;
        border: none; border-radius: 50%;
        background: var(--surface-3);
        color: var(--text-muted);
        font-size: 13px; cursor: pointer;
      }

      .chip-row, .tag-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }

      .chip {
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 5px 12px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .chip.active { background: var(--accent); border-color: var(--accent); color: #fff; }

      .daily {
        background: var(--surface);
        border: 1px solid rgba(219, 138, 74, 0.45);
        border-radius: 18px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .daily-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
      .daily-title { font-size: 15px; font-weight: 800; color: var(--text); }
      .daily-day { font-size: 11px; color: var(--text-faint); font-family: ui-monospace, Menlo, monospace; }
      .daily-theme { font-size: 14px; font-weight: 700; color: var(--text); }
      .daily-theme b { color: #d9823e; }
      .daily-prompt { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
      .daily-cta-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
      .daily-cta {
        display: inline-flex; align-items: center;
        background: #d9823e; color: #fff;
        border-radius: 999px; padding: 7px 16px;
        font-size: 13px; font-weight: 700; text-decoration: none;
      }
      .daily-cta:active { transform: scale(0.95); }
      .daily-tip { font-size: 12px; color: var(--text-faint); }
      .daily-top { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 8px; margin-top: 12px; }
      .daily-top img { width: 100%; aspect-ratio: 1; image-rendering: pixelated; border-radius: 10px; background: var(--art-bg); border: 1px solid var(--border); display: block; }

      .author-page {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 14px;
        margin-bottom: 16px;
      }
      .author-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
      .author-back {
        border: 1px solid var(--border-strong); background: var(--surface-2);
        color: var(--text-muted); border-radius: 999px; padding: 5px 12px;
        font-size: 12px; font-weight: 700; cursor: pointer;
      }
      .author-name { font-size: 16px; font-weight: 800; color: var(--text); }
      .author-count { font-size: 12px; color: var(--text-faint); }
      .author-works { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; }
      .author-works img { width: 100%; aspect-ratio: 1; image-rendering: pixelated; border-radius: 10px; background: var(--art-bg); border: 1px solid var(--border); display: block; }

      /* 卡片上的标签与来源标记 */
      .card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
      .card-tag {
        font-size: 10px; font-weight: 700; color: var(--text-muted);
        background: var(--surface-2); border: 1px solid var(--border);
        border-radius: 999px; padding: 1px 7px; cursor: pointer;
      }
      .img-badge {
        flex: 0 0 auto; font-size: 10px; font-weight: 800; color: #fff;
        background: linear-gradient(135deg, #8aa4c8, #5b6b8c);
        border-radius: 999px; padding: 2px 8px; white-space: nowrap;
      }

      .contest {
        background: linear-gradient(135deg, #fff7e0, #ffeded);
        border: 1px solid var(--border-strong);
        border-radius: 18px;
        padding: 16px;
        margin-bottom: 18px;
      }

      [data-theme="dark"] .contest {
        background: linear-gradient(135deg, #2b2620, #34261f);
      }

      .contest-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 15px;
        font-weight: 800;
        color: var(--text);
      }

      .contest-badge {
        background: #e5484d;
        color: #fff;
        border-radius: 999px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 700;
      }

      .contest-theme {
        margin-top: 10px;
        font-size: 20px;
        font-weight: 900;
      }

      .contest-theme b { color: var(--accent); }

      .contest-prompt {
        margin-top: 4px;
        font-size: 13px;
        color: var(--text-muted);
      }

      .contest-meta {
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-faint);
      }

      .contest-cta-row {
        margin-top: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .contest-cta {
        background: var(--accent);
        color: #fff;
        border-radius: 999px;
        padding: 9px 18px;
        font-size: 14px;
        font-weight: 800;
        text-decoration: none;
        transition: transform 0.12s;
      }

      .contest-cta:active { transform: scale(0.95); }

      .contest-tip { font-size: 12px; color: var(--text-muted); }

      .contest-top {
        margin-top: 14px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
      }

      .ct-card {
        position: relative;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 10px;
        cursor: pointer;
        transition: transform 0.12s, box-shadow 0.15s;
      }

      .ct-card:active { transform: scale(0.96); }

      .ct-rank {
        position: absolute;
        top: 6px;
        left: 6px;
        z-index: 1;
        width: 22px;
        height: 22px;
        border-radius: 7px;
        background: #8a7f6f;
        color: #fff;
        font-size: 12px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ct-rank.r1 { background: #f6c343; }
      .ct-rank.r2 { background: #aeb6c2; }
      .ct-rank.r3 { background: #d18b5f; }

      .ct-art {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 8px;
        object-fit: cover;
        image-rendering: pixelated;
        background: #fff;
        display: block;
      }

      .ct-name {
        margin-top: 6px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ct-votes {
        margin-top: 2px;
        font-size: 11px;
        font-weight: 700;
        color: var(--accent);
      }

      .contest-empty {
        font-size: 13px;
        color: var(--text-muted);
        padding: 4px 0;
      }

      .vote-btn {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: 1px solid var(--accent);
        background: rgba(91, 141, 239, 0.12);
        color: var(--accent);
        border-radius: 999px;
        padding: 3px 10px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.12s;
        line-height: 1.3;
      }

      .vote-btn:active { transform: scale(0.92); }

      .vote-btn.voted {
        border-color: #5bb883;
        background: rgba(91, 184, 131, 0.16);
        color: #3f9c68;
      }

      .featured-head {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 800;
        color: var(--text);
        margin-bottom: 12px;
      }

      .featured-sub {
        font-size: 11px;
        font-weight: 500;
        color: var(--text-faint);
        margin-bottom: 12px;
      }

      .range-tabs {
        display: flex;
        gap: 4px;
        background: var(--surface-2);
        border-radius: 999px;
        padding: 3px;
      }

      .range-tabs button {
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 700;
        border-radius: 999px;
        padding: 4px 12px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }

      .range-tabs button.active {
        background: var(--surface);
        color: var(--text);
      }

      .featured-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding-bottom: 6px;
        scrollbar-width: none;
      }

      .featured-row::-webkit-scrollbar { display: none; }

      .f-card {
        flex: 0 0 96px;
        text-align: center;
        cursor: pointer;
        position: relative;
      }

      .f-rank {
        position: absolute;
        top: -6px;
        left: -6px;
        z-index: 2;
        min-width: 22px;
        height: 22px;
        border-radius: 50%;
        font-size: 12px;
        font-weight: 800;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
      }

      .f-rank.r1 { background: #f6c343; }
      .f-rank.r2 { background: #aeb6c2; }
      .f-rank.r3 { background: #d18b5f; }
      .f-rank.rn { background: #8a7f6f; }

      .f-art {
        width: 96px;
        height: 96px;
        image-rendering: pixelated;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: var(--art-bg);
        display: block;
        box-shadow: 0 3px 10px var(--shadow);
        transition: transform 0.12s ease;
      }

      .f-card:active .f-art { transform: scale(0.94); }

      .f-name {
        margin-top: 6px;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 96px;
      }

      .f-meta {
        margin-top: 2px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .f-author {
        font-size: 10px;
        color: var(--text-faint);
      }

      .f-like {
        font-size: 10px;
        color: var(--like);
      }

      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 14px;
      }

      .card {
        background: var(--surface);
        border: 1px solid transparent;
        border-radius: 16px;
        padding: 10px;
        box-shadow: 0 4px 14px var(--shadow);
        cursor: pointer;
        text-align: left;
        transition: transform 0.1s ease, box-shadow 0.2s ease;
        color: inherit;
        font: inherit;
      }

      .card:hover { box-shadow: 0 8px 22px var(--shadow-hover); }
      .card:active { transform: scale(0.97); }

      /* 不同作品类型用不同描边颜色区分：参赛=蓝 · 动画=紫 · 多人=青 */
      .card.t-contest { border-color: rgba(91, 141, 239, 0.55); }
      .card.t-anim { border-color: rgba(146, 122, 255, 0.55); }
      .card.t-room { border-color: rgba(56, 196, 160, 0.55); }
      [data-theme="dark"] .card.t-contest { border-color: rgba(118, 163, 255, 0.6); }
      [data-theme="dark"] .card.t-anim { border-color: rgba(166, 145, 255, 0.6); }
      [data-theme="dark"] .card.t-room { border-color: rgba(72, 214, 178, 0.6); }

      .card.hl {
        box-shadow: 0 0 0 3px var(--accent), 0 8px 22px var(--shadow-hover);
        animation: hlPulse 1.6s ease 2;
      }

      @keyframes hlPulse {
        0%, 100% { box-shadow: 0 0 0 3px var(--accent), 0 8px 22px var(--shadow-hover); }
        50% { box-shadow: 0 0 0 7px rgba(91, 141, 239, 0.45), 0 8px 22px var(--shadow-hover); }
      }

      .anim-badge {
        flex: 0 0 auto;
        font-size: 10px;
        font-weight: 800;
        color: #fff;
        background: linear-gradient(135deg, #7ce0c0, #5b8def);
        border-radius: 999px;
        padding: 2px 8px;
        white-space: nowrap;
      }

      .room-badge {
        flex: 0 0 auto;
        font-size: 10px;
        font-weight: 800;
        color: #fff;
        background: linear-gradient(135deg, #7ce0c0, #2fae8c);
        border-radius: 999px;
        padding: 2px 8px;
        white-space: nowrap;
      }

      .art {
        width: 100%;
        aspect-ratio: 1;
        image-rendering: pixelated;
        border-radius: 10px;
        border: 2px solid var(--border);
        background: var(--art-bg);
        display: block;
      }

      .card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-muted);
      }

      .card-name {
        font-weight: 600;
        word-break: break-all;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .card-sub {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 2px;
        font-size: 11px;
        color: var(--text-faint);
      }

      .card-author {
        font-size: 11px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .card-size {
        flex: 0 0 auto;
        margin-left: auto;
        font-size: 10px;
        color: var(--text-faint);
        border: 1px solid var(--border-strong);
        border-radius: 999px;
        padding: 1px 7px;
      }

      .f-size {
        font-size: 10px;
        color: var(--text-faint);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 1px 6px;
      }

      .like-btn {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: 1px solid var(--like-border);
        background: var(--like-bg);
        color: var(--like);
        border-radius: 999px;
        padding: 3px 10px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.12s, background 0.15s;
        line-height: 1.3;
      }

      .like-btn:active { transform: scale(0.9); }
      .like-btn.liked { background: var(--like); color: #fff; border-color: var(--like); }

      .card-time {
        margin-top: 4px;
        font-size: 10px;
        color: var(--text-faint);
      }

      .status {
        text-align: center;
        color: var(--text-faint);
        font-size: 14px;
        padding: 40px 0;
      }

      #sentinel { cursor: pointer; }

      .retry {
        margin-top: 12px;
        padding: 8px 20px;
        border: 2px solid var(--border);
        background: var(--surface);
        color: var(--text-muted);
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .join-card {
        margin-top: 16px;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
      }

      .join-ico { font-size: 26px; line-height: 1; flex: 0 0 auto; }

      .join-body { flex: 1; min-width: 0; }

      .join-title { font-size: 14px; font-weight: 700; color: var(--text); }

      .join-desc {
        font-size: 11px;
        color: var(--text-faint);
        margin-top: 3px;
        line-height: 1.5;
      }

      .join-btn {
        flex: 0 0 auto;
        text-decoration: none;
        border: none;
        border-radius: 999px;
        background: var(--accent);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        padding: 9px 14px;
        cursor: pointer;
      }

      .disclaimer {
        margin-top: 28px;
        padding: 14px 16px;
        background: var(--surface);
        border-radius: 14px;
        box-shadow: 0 4px 14px var(--shadow);
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
        margin-top: 16px;
        text-align: center;
        font-size: 12px;
        color: var(--text-faint);
      }

      .preview-overlay {
        position: fixed;
        inset: 0;
        z-index: 90;
        background: var(--overlay);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        color: var(--text);
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
        width: 240px;
        height: 240px;
        image-rendering: pixelated;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: var(--art-bg);
        margin: 0 auto;
        display: block;
      }

      #previewCanvas[hidden],
      #previewImg[hidden] { display: none; }

      #previewImg {
        width: 240px;
        height: 240px;
        image-rendering: pixelated;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: var(--art-bg);
        margin: 0 auto;
        display: block;
        object-fit: cover;
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

      /* 举报入口刻意做小做灰，避免误触：需长按 1.5 秒才会真正提交 */
      .report-hold {
        position: relative;
        padding: 6px 10px;
        font-size: 12px;
        color: var(--text-faint);
        background: transparent;
        border: 1px dashed var(--border-strong);
        border-radius: 999px;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        touch-action: manipulation;
      }
      .report-hold:active { background: var(--surface-2); }
      .report-progress {
        height: 3px;
        border-radius: 999px;
        background: var(--surface-3);
        overflow: hidden;
        margin-top: 8px;
      }
      .report-progress i {
        display: block;
        height: 100%;
        width: 0;
        background: var(--like);
        border-radius: 999px;
      }

      /* ---------- 用色色板 ---------- */
      .share-btn.on {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--surface-2);
      }

      .pal-box {
        margin-top: 10px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 11px 12px 9px;
        text-align: left;
      }
      .pal-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 9px;
      }
      .pal-title { font-size: 13px; font-weight: 600; color: var(--text); }
      .pal-count { font-size: 12px; color: var(--text-faint); margin-left: auto; }
      .pal-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        max-height: 190px;
        overflow-y: auto;
      }
      .pal-grid::-webkit-scrollbar { display: none; }
      /* ---------- 公告 ---------- */
      .announce {
        position: relative;
        width: 100%;
        background: var(--surface);
        border: 1px solid var(--border-strong);
        border-radius: 16px;
        padding: 16px 15px 14px;
        margin-bottom: 16px;
        overflow: hidden;
      }
      .announce::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, #e5484d 0%, #f0a13a 55%, #5b8def 100%);
      }
      .announce-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: var(--surface-2);
        color: var(--text-muted);
        font-size: 17px;
        line-height: 1;
        cursor: pointer;
      }
      .announce-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 7px;
        padding-right: 32px;
      }
      .announce-head b { font-size: 17px; color: var(--text); }
      .announce-badge {
        padding: 2px 9px;
        border-radius: 999px;
        background: color-mix(in srgb, #e5484d 16%, var(--surface));
        border: 1px solid color-mix(in srgb, #e5484d 45%, transparent);
        color: #e5484d;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .announce-sub { margin: 0 0 9px; font-size: 13px; color: var(--text-muted); }
      .announce-list { margin: 0; padding-left: 0; list-style: none; }
      .announce-list li {
        position: relative;
        padding-left: 15px;
        margin-bottom: 7px;
        font-size: 13px;
        line-height: 1.75;
        color: var(--text-muted);
      }
      .announce-list li::before {
        content: '';
        position: absolute;
        left: 2px;
        top: 9px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--accent);
      }
      .announce-list b { color: var(--text); }
      .announce-foot {
        margin: 11px 0 0;
        padding-top: 10px;
        border-top: 1px solid var(--border);
        font-size: 12px;
        color: var(--text-faint);
        line-height: 1.7;
      }

      /* ---------- 发现 ---------- */
      .discover {
        width: 100%;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 14px;
        margin-bottom: 16px;
      }
      .discover-head {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .discover-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
      .discover-text b { font-size: 14px; color: var(--text); }
      .discover-text i {
        font-size: 12px;
        font-style: normal;
        color: var(--text-faint);
        line-height: 1.5;
      }
      .discover-btn {
        margin-left: auto;
        flex-shrink: 0;
        padding: 9px 16px;
        border-radius: 999px;
        border: none;
        background: var(--accent);
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.12s ease;
      }
      .discover-btn:active { transform: scale(0.94); }
      .discover-btn:disabled { opacity: 0.55; }
      .discover-empty {
        font-size: 13px;
        color: var(--text-faint);
        text-align: center;
        padding: 18px 8px 6px;
      }
      .discover-card {
        margin-top: 12px;
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 11px;
        border-radius: 13px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        cursor: pointer;
      }
      .discover-card canvas {
        width: 76px;
        height: 76px;
        flex-shrink: 0;
        border-radius: 10px;
        image-rendering: pixelated;
        background: var(--art-bg);
        border: 1px solid var(--border);
      }
      .discover-info { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
      .discover-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .discover-meta { font-size: 12px; color: var(--text-muted); }
      .discover-ago { font-size: 11px; color: var(--text-faint); }

      .pal-chip {
        width: 46px;
        border-radius: 9px;
        overflow: hidden;
        border: 1px solid var(--border-strong);
        background: var(--surface);
        padding: 0;
        cursor: pointer;
        transition: transform 0.12s ease;
      }
      .pal-chip:active { transform: scale(0.9); }
      .pal-chip i {
        display: block;
        height: 26px;
        width: 100%;
      }
      .pal-chip span {
        display: block;
        font-size: 9px;
        line-height: 1.5;
        color: var(--text-muted);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        text-align: center;
        padding-bottom: 1px;
      }
      .pal-tip {
        margin-top: 8px;
        font-size: 11px;
        color: var(--text-faint);
        text-align: center;
      }

      .report-box { max-width: 340px; }
      .report-reasons { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
      .report-reason {
        padding: 7px 12px;
        border-radius: 999px;
        border: 1px solid var(--border-input);
        background: var(--surface);
        color: var(--text-muted);
        font-size: 13px;
        cursor: pointer;
      }
      .report-reason.on {
        border-color: var(--like);
        color: var(--like);
        background: var(--like-bg);
      }
      .report-note {
        width: 100%;
        min-height: 64px;
        padding: 9px 11px;
        border-radius: 10px;
        border: 1px solid var(--border-input);
        background: var(--bg);
        color: var(--text);
        font-size: 13px;
        font-family: inherit;
        resize: vertical;
      }

      .preview-like {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 16px;
        padding-top: 14px;
        border-top: 1px solid var(--border);
      }

      /* 详情页底部操作条：细身胶囊 · 透明底 · 1px 描边 */
      .preview-like .like-btn,
      .preview-like .vote-btn,
      .preview-like .share-btn {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 24px;
        padding: 0 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        line-height: 1;
        background: transparent;
        cursor: pointer;
        transition: transform 0.12s, background 0.15s, border-color 0.15s, color 0.15s;
      }

      .preview-like .like-btn { border: 1px solid var(--like-border); color: var(--like); }
      .preview-like .like-btn:hover { background: var(--like-bg); }
      .preview-like .like-btn:active { transform: scale(0.94); }
      .preview-like .like-btn.liked { background: var(--like); border-color: var(--like); color: #fff; }

      .preview-like .vote-btn { border: 1px solid rgba(91, 141, 239, 0.45); color: var(--accent); }
      .preview-like .vote-btn:hover { background: rgba(91, 141, 239, 0.1); }
      .preview-like .vote-btn:active { transform: scale(0.94); }
      .preview-like .vote-btn.voted {
        border-color: rgba(91, 184, 131, 0.55);
        color: #3f9c68;
        background: rgba(91, 184, 131, 0.12);
      }

      .preview-like .share-btn { border: 1px solid transparent; color: var(--text-faint); }
      .preview-like .share-btn:hover { background: var(--surface-2); color: var(--text-muted); }
      .preview-like .share-btn:active { transform: scale(0.94); }

      .share-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 3px 14px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.12s;
        line-height: 1.5;
      }

      .share-btn:active { transform: scale(0.93); }
      .share-btn.copied { background: var(--ok-bg, #e8f5e9); color: var(--ok, #43a047); border-color: var(--ok, #43a047); }

      .preview-note {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border);
        font-size: 12px;
        color: var(--text-faint);
        line-height: 1.6;
      }

      #previewCanvas {
        width: 240px;
        height: 240px;
        image-rendering: pixelated;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: var(--art-bg);
        margin: 0 auto;
        display: block;
      }

      #previewCanvas[hidden],
      #previewImg[hidden] { display: none; }

      #previewImg {
        width: 240px;
        height: 240px;
        image-rendering: pixelated;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: var(--art-bg);
        margin: 0 auto;
        display: block;
        object-fit: cover;
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
        background: rgba(var(--nav-base, 255, 253, 250), calc((1 - var(--nav-op, 0.66)) * 0.72));
        font-size: 10px;
        font-weight: 700;
        transition: color 0.2s, background 0.2s;
      }

      .bottom-nav a .nav-icon { font-size: 18px; line-height: 1; }

      .bottom-nav a.active {
        color: var(--accent);
        background: color-mix(in srgb, rgb(var(--nav-base, 255, 253, 250)) 82%, var(--accent));
      }

      /* ---------- 朋友圈卡片弹层 ---------- */
      .card-overlay {
        position: fixed;
        inset: 0;
        z-index: 95;
        background: var(--overlay);
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

      #cardImg {
        width: 100%;
        height: auto;
        border-radius: 14px;
        display: block;
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
        background: rgba(var(--nav-base, 255, 253, 250), var(--nav-op, 0.66)) !important;
        -webkit-backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px)) saturate(180%);
        backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px)) saturate(180%);
        border-color: rgba(180, 168, 150, 0.30) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
      [data-theme="dark"] .bottom-nav {
        background: rgba(var(--nav-base, 42, 38, 33), var(--nav-op, 0.62)) !important;
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
  template: `<div class="container">
      <div class="header">
        <router-link class="back" to="/paint">← 返回画板</router-link>
        <div class="header-text">
          <h1>全部作品</h1>
          <div id="count">加载中…</div>
        </div>
        <router-link class="theme-btn" to="/settings" title="设置" aria-label="设置">⚙️</router-link>
      </div>

      <section class="finder" id="finder">
        <div class="search-row">
          <input class="search-input" id="searchInput" type="search" placeholder="搜作品名、作者或标签…" autocomplete="off">
          <button class="search-clear" id="searchClear" type="button" hidden>✕</button>
        </div>
        <div class="chip-row" id="chipRow" hidden></div>
        <div class="tag-cloud" id="tagCloud" hidden></div>
      </section>

      <section class="daily" id="dailyPanel" hidden>
        <div class="daily-head">
          <span class="daily-title">⚡ 每日挑战</span>
          <span class="daily-day" id="dailyDay"></span>
        </div>
        <div class="daily-theme">今日题目《<b id="dailyTheme"></b>》</div>
        <div class="daily-prompt" id="dailyPrompt"></div>
        <div class="daily-cta-row">
          <a class="daily-cta" id="dailyCta" href="/paint">🎨 去创作</a>
          <span class="daily-tip" id="dailyTip"></span>
        </div>
        <div class="daily-top" id="dailyTop"></div>
      </section>

      <section class="author-page" id="authorPage" hidden>
        <div class="author-head">
          <button class="author-back" id="authorBack" type="button">← 返回全部</button>
          <span class="author-name" id="authorName"></span>
          <span class="author-count" id="authorCount"></span>
        </div>
        <div class="author-works" id="authorWorks"></div>
      </section>

      <section class="contest" id="contestPanel" hidden>
        <div class="contest-head">
          <span class="contest-title">🏆 每周主题比赛</span>
          <span class="contest-badge" id="contestBadge">进行中</span>
        </div>
        <div class="contest-theme">本周主题《<b id="contestTheme"></b>》</div>
        <div class="contest-prompt" id="contestPrompt"></div>
        <div class="contest-meta" id="contestMeta"></div>
        <div class="contest-cta-row">
          <router-link class="contest-cta" to="/paint?contest=1">🎨 去创作参赛</router-link>
          <span class="contest-tip" id="contestTip"></span>
        </div>
        <div class="contest-top" id="contestTop"></div>
      </section>

      <section class="announce" id="announce" hidden>
        <button class="announce-close" id="announceClose" type="button" aria-label="关闭公告">×</button>
        <div class="announce-head">
          <span class="announce-badge">公告</span>
          <b>国庆节快乐！</b>
        </div>
        <p class="announce-sub">这次国庆攒了不少东西，一次性交代清楚：</p>
        <ul class="announce-list">
          <li><b>20 套配色主题</b>：新增 6 套夜间系（深海、墨林、玫瑰夜、森语、夜航、炭）和 7 套浅色系（奶茶、薰衣草、蜜桃、雾霭、抹茶、燕麦、复古），外加底部导航透明度可自由调节</li>
          <li><b>18 种提示音效</b>：保存、撤销、清空、投票、复制链接、开局、载入、答题……都能在设置里一键开关</li>
          <li><b>「🌱 我的」上线</b>：每日签到攒连续天数和徽章，创作数据看得清清楚楚（作品数、获赞、绘制格数、创作天数）</li>
          <li><b>「🔍 发现」</b>：随机翻出一件旧作品，点赞多的更容易被翻出来，让埋掉的好东西重见天日</li>
          <li><b>内容安全机制</b>：作品可举报，维护者后台能核实处理，审核全程有据可查</li>
          <li><b>导航栏全面自定义</b>：启动先打开哪一页、导航放顶部还是底部、四个入口的顺序，都能按你的习惯来</li>
          <li><b>像素相机</b>：照片一键转像素画；<b>新手教程</b>：设置页顶部两分钟看完所有功能</li>
          <li><b>可装到桌面</b>：加为应用后断网也能打开画板继续画</li>
        </ul>
        <p class="announce-foot">另外还修了不少问题：联机同步的坑、手型工具误画、小地图挡住画布、深色模式文字看不清等等。细节都写在更新日志里了。</p>
      </section>

      <section class="discover" id="discover">
        <div class="discover-head">
          <div class="discover-text">
            <b>🔍 发现</b>
            <i>随机翻出一件旧作品，给被时间埋掉的好东西一次机会</i>
          </div>
          <button class="discover-btn" id="discoverBtn" type="button">掷一个</button>
        </div>
        <div class="discover-body" id="discoverBody">
          <div class="discover-empty">点「掷一个」随机看看别人以前画了什么</div>
        </div>
      </section>

      <section class="featured" id="featured" hidden>
        <div class="featured-head">
          <span>🏆 佳作展示</span>
          <div class="range-tabs" id="rangeTabs">
            <button type="button" data-range="all" class="active">总榜</button>
            <button type="button" data-range="today">今日</button>
            <button type="button" data-range="week">本周</button>
          </div>
        </div>
        <div class="featured-sub" id="featuredSub">按赞数排名 Top 5</div>
        <div class="featured-row" id="featuredRow"></div>
      </section>

      <div id="gallery" class="gallery-grid"></div>
      <div id="sentinel" class="status">加载中…</div>
      <div id="status" class="status" hidden></div>

      <div class="join-card">
        <div class="join-ico">🛡️</div>
        <div class="join-body">
          <div class="join-title">加入我们，维护社区稳定</div>
          <div class="join-desc">像素小镇社区持续壮大，欢迎成为维护者：审核内容、清理违规、共建良好氛围。加入需发送正式申请书信，经作者审核通过后方可参与。</div>
        </div>
        <router-link class="join-btn" to="/admin">查看详情 →</router-link>
      </div>

      <div class="disclaimer">
        以下作品均来自全网上传。全部作品仅支持预览，不可载入作画，请尊重原作者，切勿抄袭或直接提交他人作品。
        本画板仅用于个人学习与技术交流，上传者须对自己发布的内容负全部法律责任。
        <div class="disclaimer-report">发现违规内容？请联系微信 Tux123233 或邮箱 linsifan123233@petalmail.com 举报。</div>
      </div>
      <div class="copyright">© 2026 像素小镇 · 版权所有 · 作者 Lin Sifan</div>
    </div>

    <div class="preview-overlay" id="previewOverlay" hidden>
      <div class="preview-box">
        <div class="preview-head">
          <span class="preview-title" id="previewTitle">作品预览</span>
          <button class="preview-close" id="previewClose" type="button">关闭</button>
        </div>
        <canvas id="previewCanvas" width="16" height="16" hidden></canvas>
        <img id="previewImg" alt="作品预览">
        <div class="preview-info">
          <span id="previewAuthor"></span>
          <span id="previewTime" class="preview-time"></span>
        </div>
        <div class="preview-like">
          <button class="like-btn" id="previewLike" type="button" title="送光尘给这幅画">✨ <span id="previewLikeCount">0</span></button>
          <button class="vote-btn" id="previewVoteBtn" type="button" hidden>🏆 投一票</button>
          <button class="share-btn" id="previewShare" type="button">🔗 复制链接</button>
          <button class="share-btn" id="previewCard" type="button">🃏 生成朋友圈卡片</button>
          <button class="share-btn" id="previewPaletteBtn" type="button" aria-expanded="false">🎨 用色</button>
          <button class="report-hold" id="previewReport" type="button">🚩 长按举报</button>
        </div>
        <div class="report-progress" id="reportProgress" hidden><i></i></div>
        <div class="pal-box" id="previewPalette" hidden>
          <div class="pal-head">
            <span class="pal-title">这幅画用到的颜色</span>
            <span class="pal-count" id="palCount"></span>
          </div>
          <div class="pal-grid" id="palGrid"></div>
          <div class="pal-tip">点任意色块即可复制它的色号</div>
        </div>
        <div class="preview-note">仅支持预览，不可载入作画。请勿抄袭或直接提交他人的作品。长按图片可保存到相册。</div>
      </div>
    </div>

    <div class="card-overlay" id="reportOverlay" hidden>
      <div class="card-box report-box">
        <div class="card-head">
          <span class="card-title">举报作品</span>
          <button class="card-close" id="reportClose" type="button">取消</button>
        </div>
        <div class="report-reasons" id="reportReasons">
          <button class="report-reason" type="button" data-r="违法违规">违法违规</button>
          <button class="report-reason" type="button" data-r="色情低俗">色情低俗</button>
          <button class="report-reason" type="button" data-r="辱骂攻击">辱骂攻击</button>
          <button class="report-reason" type="button" data-r="抄袭他人">抄袭他人</button>
          <button class="report-reason" type="button" data-r="广告诈骗">广告诈骗</button>
          <button class="report-reason" type="button" data-r="其他">其他</button>
        </div>
        <textarea class="report-note" id="reportNote" maxlength="200" placeholder="补充说明（选填）"></textarea>
        <div class="card-actions">
          <button class="card-btn" id="reportSubmit" type="button">提交举报</button>
        </div>
      </div>
    </div>

    <div class="card-overlay" id="cardOverlay" hidden>
      <div class="card-box">
        <div class="card-head">
          <span class="card-title">朋友圈小卡片</span>
          <button class="card-close" id="cardClose" type="button">关闭</button>
        </div>
        <img id="cardImg" alt="分享卡片">
        <div class="card-actions">
          <a id="cardDownload" class="card-btn" href="#" download="guangyu-card.png">⬇️ 保存图片</a>
        </div>
        <div class="card-note">长按图片也能保存到相册，发到朋友圈秀一秀吧～</div>
      </div>
    </div>`,
  mounted() {
      function workSize(rec) {
        const s = (rec && rec.size) || 0
        return s === 32 || s === 64 ? s : 16
      }

      const gallery = document.getElementById('gallery')
      const statusEl = document.getElementById('status')
      const countEl = document.getElementById('count')
      const likedMap = loadLiked()

      function loadLiked() {
        try {
          const arr = JSON.parse(localStorage.getItem('lw-liked') || '[]')
          return new Set(Array.isArray(arr) ? arr : [])
        } catch (e) {
          return new Set()
        }
      }

      function saveLiked() {
        try {
          localStorage.setItem('lw-liked', JSON.stringify([...likedMap]))
        } catch (e) {}
      }

      /* ---------- 每周主题比赛 ---------- */
      const contestPanel = document.getElementById('contestPanel')
      const contestTop = document.getElementById('contestTop')
      let contestCtx = { week: '', open: false, voted: [] }

      function getVoterId() {
        try {
          let v = localStorage.getItem('lw-vid')
          if (!v) {
            v = crypto.randomUUID ? crypto.randomUUID() : 'v' + Date.now() + Math.random().toString(36).slice(2)
            localStorage.setItem('lw-vid', v)
          }
          return v
        } catch (e) {
          return 'anon'
        }
      }

      const vid = getVoterId()

      function isCurrentContestEntry(rec) {
        return !!contestCtx && contestCtx.week && contestCtx.open && rec.contest === contestCtx.week
      }

      function makeVoteButton(rec) {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'vote-btn'
        const span = document.createElement('span')
        span.textContent = '🏆 ' + (rec.contestVotes || 0)
        btn.appendChild(span)
        if (contestCtx.voted.map(String).includes(String(rec.time))) btn.classList.add('voted')
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          voteContest(rec, btn)
        })
        return btn
      }

      async function voteContest(rec, btn) {
        const key = String(rec.time)
        if (contestCtx.voted.map(String).includes(key)) {
          toast('本周你已为该作品投过票')
          return
        }
        btn.disabled = true
        try {
          const res = await fetch('/api/contest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ time: rec.time, vid }),
          })
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            if (window.sfx) window.sfx('pop')
            rec.contestVotes = data.votes
            contestCtx.voted.push(key)
            const span = btn.querySelector('span') || btn
            span.textContent = '🏆 ' + (rec.contestVotes || 0)
            btn.classList.add('voted')
            const pvBtn = document.getElementById('previewVoteBtn')
            if (currentPreview && String(currentPreview.time) === key && pvBtn) {
              pvBtn.textContent = '🏆 已投票 · ' + (rec.contestVotes || 0)
              pvBtn.classList.add('voted')
            }
            loadContest(true)
            toast('投票成功，感谢支持 🏆')
          } else {
            toast('投票失败：' + (data.error || res.status))
          }
        } catch (err) {
          toast('投票失败：网络错误')
        } finally {
          btn.disabled = false
        }
      }

      async function loadContest(silent) {
        try {
          const res = await fetch('/api/contest?top=12&vid=' + encodeURIComponent(vid))
          if (!res.ok) {
            contestPanel.hidden = true
            return
          }
          const c = await res.json()
          contestCtx = { week: c.week, open: !!c.open, voted: (c.voted || []).map(String) }
          renderContestPanel(c)
          refreshVoteChips()
          const pvBtn = document.getElementById('previewVoteBtn')
          if (currentPreview && pvBtn) syncPreviewVoteBtn()
        } catch (e) {
          contestPanel.hidden = true
        }
      }

      function renderContestPanel(c) {
        document.getElementById('contestTheme').textContent = c.theme.zh
        document.getElementById('contestPrompt').textContent = c.theme.prompt || ''
        const d1 = new Date(c.start)
        const d2 = new Date(c.end)
        const fmt = (d) => `${d.getMonth() + 1}月${d.getDate()}日`
        document.getElementById('contestMeta').textContent =
          '本期：' + fmt(d1) + ' - ' + fmt(d2) + ' · ' + c.entries + ' 幅参赛'
        const badge = document.getElementById('contestBadge')
        badge.textContent = c.open ? '🚀 投票进行中' : '已结束'
        badge.style.background = c.open ? '#e5484d' : '#8a7f6f'
        document.getElementById('contestTip').textContent =
          '每人每周对每个作品可投一票，助它登上本周排行榜'
        contestTop.innerHTML = ''
        if (!c.works.length) {
          const empty = document.createElement('div')
          empty.className = 'contest-empty'
          empty.textContent = '还没有人投稿，快去创作第一幅本周主题作品吧！'
          contestTop.appendChild(empty)
        } else {
          c.works.forEach((w, i) => {
            const card = document.createElement('div')
            card.className = 'ct-card'
            const rank = document.createElement('div')
            rank.className = 'ct-rank ' + (i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '')
            rank.textContent = i + 1

            const img = document.createElement('img')
            img.className = 'ct-art'
            img.alt = w.workName || w.name || '未命名'
            img.loading = 'lazy'
            img.decoding = 'async'
            img.src = pixelsToURL(w.pixels, workSize(w))

            const nm = document.createElement('div')
            nm.className = 'ct-name'
            nm.textContent = (w.type === 'anim' ? '🎞️ ' : '') + (w.workName || w.name || '未命名')

            const votes = document.createElement('div')
            votes.className = 'ct-votes'
            votes.textContent = '🏆 ' + (w.contestVotes || 0) + ' 票' + (w.anim ? '' : '')

            card.append(rank, img, nm, votes)
            card.addEventListener('click', () => preview(w))
            contestTop.appendChild(card)
          })
        }
        contestPanel.hidden = false
      }

      function refreshVoteChips() {
        document.querySelectorAll('.card .vote-btn').forEach((b) => {
          const rec = b.__rec
          if (rec && isCurrentContestEntry(rec)) {
            b.hidden = false
            b.classList.toggle('voted', contestCtx.voted.map(String).includes(String(rec.time)))
          }
        })
      }

      function formatTime(ts) {
        if (!ts) return ''
        const d = new Date(ts)
        return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      }

      function showStatus(text, withRetry) {
        statusEl.hidden = false
        statusEl.textContent = text
        if (withRetry) {
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'retry'
          btn.textContent = '重试'
          btn.addEventListener('click', loadMore)
          statusEl.append(document.createElement('br'), btn)
        }
      }

      function drawPixels(canvas, pixels, n) {
        n = n || 16
        const c = canvas.getContext('2d')
        // 先铺一层白底：缺失的格子留成透明的话，在带背景的容器里会显示成白条纹
        c.fillStyle = '#ffffff'
        c.fillRect(0, 0, n, n)
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const px = pixels[y * n + x]
            if (!Array.isArray(px) || px.length < 3) continue
            c.fillStyle = `rgb(${px[0]}, ${px[1]}, ${px[2]})`
            c.fillRect(x, y, 1, 1)
          }
        }
      }

      function pixelsToURL(pixels, n) {
        const c = document.createElement('canvas')
        c.width = n
        c.height = n
        drawPixels(c, pixels, n)
        return c.toDataURL('image/png')
      }

      /* ---------- 朋友圈分享卡片 ---------- */
      const cardOverlay = document.getElementById('cardOverlay')
      const cardImg = document.getElementById('cardImg')

      function pixelBar(ctx, x0, y0, w, h, seg, colors, zig) {
        const sw = w / seg
        for (let i = 0; i < seg; i++) {
          const off = zig && i % 3 === 1 ? Math.round(h * 0.35) : 0
          ctx.fillStyle = colors[i % colors.length]
          ctx.fillRect(x0 + i * sw, y0 + off, sw + 0.5, h - off + 0.5)
        }
      }

      const PX_HEART = [
        '..XX..XX..',
        '.XXXXXXXX.',
        'XXXXXXXXXX',
        'XXXXXXXXXX',
        'XXXXXXXXXX',
        '.XXXXXXXX.',
        '..XXXXXX..',
        '...XXXX...',
      ]

      const PX_STAR = [
        '....X....',
        '...XXX...',
        '..XXXXX..',
        'XXXXXXXXX',
        '.XX.XXX.X',
        '..XXXXX..',
        '...X.X...',
        '...X.X...',
        '..X...X..',
      ]

      function pixelIcon(ctx, cx, cy, s, color, grid) {
        const cols = grid[0].length
        const cell = s / cols
        ctx.fillStyle = color
        for (let y = 0; y < grid.length; y++) {
          for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 'X') {
              ctx.fillRect(cx + x * cell, cy + y * cell, Math.ceil(cell), Math.ceil(cell))
            }
          }
        }
      }

      function fitText(ctx, text, maxW, base) {
        let size = base
        ctx.font = `900 ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`
        while (ctx.measureText(text).width > maxW && size > 24) {
          size -= 2
          ctx.font = `900 ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`
        }
        return size
      }

      // 取作品里出现最多的几个颜色（相互拉开距离），用于卡片点缀
      function dominantColors(pixels, n, count) {
        const buckets = new Map()
        for (let i = 0; i < n * n; i++) {
          const p = pixels[i]
          if (!p) continue
          const key = (p[0] >> 4) + ',' + (p[1] >> 4) + ',' + (p[2] >> 4)
          const cur = buckets.get(key)
          if (cur) cur.n++
          else buckets.set(key, { c: [p[0], p[1], p[2]], n: 1 })
        }
        const sorted = [...buckets.values()].sort((a, b) => b.n - a.n)
        const picked = []
        for (const item of sorted) {
          if (picked.length >= count) break
          const far = picked.every(
            (q) => Math.abs(q[0] - item.c[0]) + Math.abs(q[1] - item.c[1]) + Math.abs(q[2] - item.c[2]) > 90
          )
          if (far) picked.push(item.c)
        }
        while (picked.length < count) picked.push([91, 141, 239])
        return picked.map((c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')')
      }

      function roundRect(ctx, x, y, w, h, r) {
        if (ctx.roundRect) {
          ctx.beginPath()
          ctx.roundRect(x, y, w, h, r)
          return
        }
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.arcTo(x + w, y, x + w, y + h, r)
        ctx.arcTo(x + w, y + h, x, y + h, r)
        ctx.arcTo(x, y + h, x, y, r)
        ctx.arcTo(x, y, x + w, y, r)
        ctx.closePath()
      }

      // 取作品里出现最多的几个颜色（相互拉开距离），用于卡片点缀
      function dominantColors(pixels, n, count) {
        const buckets = new Map()
        for (let i = 0; i < n * n; i++) {
          const p = pixels[i]
          if (!p) continue
          const key = (p[0] >> 4) + ',' + (p[1] >> 4) + ',' + (p[2] >> 4)
          const cur = buckets.get(key)
          if (cur) cur.n++
          else buckets.set(key, { c: [p[0], p[1], p[2]], n: 1 })
        }
        const sorted = [...buckets.values()].sort((a, b) => b.n - a.n)
        const picked = []
        for (const item of sorted) {
          if (picked.length >= count) break
          const far = picked.every(
            (q) => Math.abs(q[0] - item.c[0]) + Math.abs(q[1] - item.c[1]) + Math.abs(q[2] - item.c[2]) > 90
          )
          if (far) picked.push(item.c)
        }
        while (picked.length < count) picked.push([91, 141, 239])
        return picked
      }

      function roundRect(ctx, x, y, w, h, r) {
        if (ctx.roundRect) {
          ctx.beginPath()
          ctx.roundRect(x, y, w, h, r)
          return
        }
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.arcTo(x + w, y, x + w, y + h, r)
        ctx.arcTo(x + w, y + h, x, y + h, r)
        ctx.arcTo(x, y + h, x, y, r)
        ctx.arcTo(x, y, x + w, y, r)
        ctx.closePath()
      }

      function buildMomentsCard(pixels, n, title, author, likes, tags) {
        const W = 1080
        const H = 1520
        const PAD = 72
        const FONT = '"PingFang SC", "Microsoft YaHei", sans-serif'
        const cv = document.createElement('canvas')
        cv.width = W
        cv.height = H
        const ctx = cv.getContext('2d')
        const rgb = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'
        const accent = dominantColors(pixels, n, 3)
        const ink = '#2b2620'
        const muted = '#7a6d5c'

        // 作品离屏图
        const src = document.createElement('canvas')
        src.width = n
        src.height = n
        const sctx = src.getContext('2d')
        const id = sctx.createImageData(n, n)
        for (let i = 0; i < n * n; i++) {
          const p = pixels[i]
          if (!p) continue
          id.data[i * 4] = p[0]
          id.data[i * 4 + 1] = p[1]
          id.data[i * 4 + 2] = p[2]
          id.data[i * 4 + 3] = 255
        }
        sctx.putImageData(id, 0, 0)

        // 背景：作品模糊铺满 + 米白蒙版（不支持 filter 时退回主色渐变）
        if ('filter' in ctx) {
          ctx.save()
          ctx.filter = 'blur(80px) saturate(160%)'
          const sc = 1.7
          ctx.drawImage(src, (W - W * sc) / 2, (H - H * sc) / 2, W * sc, H * sc)
          ctx.restore()
          ctx.fillStyle = 'rgba(253,249,241,.84)'
          ctx.fillRect(0, 0, W, H)
        } else {
          ctx.fillStyle = '#fbf6ec'
          ctx.fillRect(0, 0, W, H)
          const g = ctx.createLinearGradient(0, 0, W, H)
          g.addColorStop(0, 'rgba(' + accent[0].join(',') + ',.22)')
          g.addColorStop(1, 'rgba(' + accent[2].join(',') + ',.16)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, W, H)
        }

        /* ===== 固定纵向栅格，任何标题长度都不会挤压下方 ===== */
        const HEAD_Y = 78
        const ART_Y = 196
        const ART_S = 936
        const TITLE_Y = 1232
        const META_Y = 1284
        const TAG_Y = 1330
        const FOOT_Y = 1350

        // 顶部品牌
        const cell = 15
        const markSize = cell * 4
        roundRect(ctx, PAD, HEAD_Y, markSize, markSize, 12)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.save()
        roundRect(ctx, PAD, HEAD_Y, markSize, markSize, 12)
        ctx.clip()
        ctx.imageSmoothingEnabled = false
        for (let i = 0; i < 16; i++) {
          const px = pixels[Math.floor(i / 4) * n + (i % 4)]
          ctx.fillStyle = px ? rgb(px) : rgb(accent[0])
          ctx.fillRect(PAD + (i % 4) * cell, HEAD_Y + Math.floor(i / 4) * cell, cell, cell)
        }
        ctx.restore()
        roundRect(ctx, PAD, HEAD_Y, markSize, markSize, 12)
        ctx.strokeStyle = 'rgba(43,38,32,.12)'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.textAlign = 'left'
        ctx.fillStyle = ink
        ctx.font = '800 42px ' + FONT
        ctx.fillText('像素小镇', PAD + markSize + 22, HEAD_Y + 32)
        ctx.font = '400 20px ' + FONT
        ctx.fillStyle = muted
        ctx.fillText('每一格光，点亮一个梦', PAD + markSize + 22, HEAD_Y + 60)

        ctx.textAlign = 'right'
        ctx.fillStyle = muted
        ctx.font = '500 22px ' + FONT
        ctx.fillText(n + ' × ' + n, W - PAD, HEAD_Y + 44)

        // 作品
        const artX = (W - ART_S) / 2
        ctx.save()
        ctx.shadowColor = 'rgba(70,55,35,.20)'
        ctx.shadowBlur = 36
        ctx.shadowOffsetY = 14
        roundRect(ctx, artX, ART_Y, ART_S, ART_S, 20)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.restore()
        ctx.save()
        roundRect(ctx, artX, ART_Y, ART_S, ART_S, 20)
        ctx.clip()
        ctx.imageSmoothingEnabled = false
        const cs = ART_S / n
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const p = pixels[y * n + x]
            if (!p) continue
            ctx.fillStyle = rgb(p)
            ctx.fillRect(artX + x * cs, ART_Y + y * cs, cs + 0.7, cs + 0.7)
          }
        }
        ctx.restore()

        // 标题（超长自动缩号，不会换行）
        const tTitle = title && title.trim() ? title.trim() : '未命名'
        fitText(ctx, tTitle, W - PAD * 2 - 20, 58)
        ctx.textAlign = 'center'
        ctx.fillStyle = ink
        ctx.fillText(tTitle, W / 2, TITLE_Y)

        // 作者
        const tAuthor = author && author.trim() ? author.trim() : '匿名'
        ctx.font = '400 25px ' + FONT
        ctx.fillStyle = muted
        ctx.fillText('画师 ' + tAuthor, W / 2, META_Y)

        // 右侧点赞（有才画）
        if (likes) {
          ctx.font = '700 22px ' + FONT
          const txt = '♥ ' + likes
          const tw = ctx.measureText(txt).width + 30
          const tx = W - PAD - tw
          roundRect(ctx, tx, META_Y - 28, tw, 36, 18)
          ctx.fillStyle = 'rgba(229,72,77,.12)'
          ctx.fill()
          ctx.fillStyle = '#d4453f'
          ctx.textAlign = 'center'
          ctx.fillText(txt, tx + tw / 2, META_Y - 3)
        }

        // 标签（一行，最多 3 个）
        const tagList = Array.isArray(tags) ? tags.filter(Boolean).slice(0, 3) : []
        if (tagList.length) {
          ctx.font = '600 20px ' + FONT
          const gap = 10
          const widths = tagList.map((t) => ctx.measureText('#' + t).width + 26)
          const tw = widths.reduce((a, b) => a + b, 0) + gap * (tagList.length - 1)
          let tx = (W - tw) / 2
          tagList.forEach((t, i) => {
            const w = widths[i]
            roundRect(ctx, tx, TAG_Y, w, 34, 17)
            ctx.fillStyle = 'rgba(43,38,32,.06)'
            ctx.fill()
            ctx.fillStyle = muted
            ctx.textAlign = 'center'
            ctx.fillText('#' + t, tx + w / 2, TAG_Y + 23)
            tx += w + gap
          })
        }

        // 底部：二维码 + 引导
        ctx.strokeStyle = 'rgba(43,38,32,.12)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(PAD, FOOT_Y - 22)
        ctx.lineTo(W - PAD, FOOT_Y - 22)
        ctx.stroke()

        if (window.qrcode) {
          const SITE = 'https://light-field.pages.dev'
          const qr = qrcode(0, 'L')
          qr.addData(SITE)
          qr.make()
          const qS = qr.getModuleCount()
          const qs = Math.max(2, Math.floor(72 / qS))
          const qpad = 9
          const qSide = qS * qs + qpad * 2
          roundRect(ctx, PAD, FOOT_Y + 4, qSide, qSide, 9)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.fillStyle = ink
          for (let yq = 0; yq < qS; yq++) {
            for (let xq = 0; xq < qS; xq++) {
              if (qr.isDark(yq, xq)) {
                ctx.fillRect(PAD + qpad + xq * qs, FOOT_Y + 4 + qpad + yq * qs, qs, qs)
              }
            }
          }
          ctx.textAlign = 'left'
          ctx.fillStyle = ink
          ctx.font = '700 24px ' + FONT
          ctx.fillText('扫码来画一笔', PAD + qSide + 18, FOOT_Y + 36)
          ctx.fillStyle = muted
          ctx.font = '400 19px ' + FONT
          ctx.fillText('light-field.pages.dev', PAD + qSide + 18, FOOT_Y + 62)
        }

        // 右下角落款
        const d = new Date()
        const ds = d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0')
        ctx.textAlign = 'right'
        ctx.fillStyle = muted
        ctx.font = '500 20px ' + FONT
        ctx.fillText(ds, W - PAD, FOOT_Y + 34)
        ctx.font = '400 18px ' + FONT
        ctx.fillText('像素小镇 · 像素作品', W - PAD, FOOT_Y + 58)

        return cv
      }

      function openCard(pixels, n, title, author, likes, tags) {
        const dataURL = buildMomentsCard(pixels, n, title, author, likes, tags).toDataURL('image/png')
        cardImg.src = dataURL
        const dl = document.getElementById('cardDownload')
        dl.href = dataURL
        cardOverlay.hidden = false
      }

      document.getElementById('cardClose').addEventListener('click', () => {
        cardOverlay.hidden = true
      })
      cardOverlay.addEventListener('click', (e) => {
        if (e.target === cardOverlay) cardOverlay.hidden = true
      })

      function makeLikeButton(rec, opts) {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'like-btn'
        if (opts && opts.large) btn.style.cssText = 'font-size:14px;padding:6px 16px;'
        btn.innerHTML = ''
        btn.appendChild(document.createTextNode('♥ '))
        const count = document.createElement('span')
        count.textContent = rec.likes || 0
        btn.appendChild(count)
        updateLikedState(btn, rec.time)
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          like(rec, btn)
        })
        return btn
      }

      /* 同一作品可能同时出现在佳作区、列表和预览里，一起更新 */
      function syncLikeEverywhere(time, likes, liked) {
        const t = String(time)
        document.querySelectorAll('[data-like-time="' + t + '"]').forEach((el) => {
          const n = el.querySelector('.f-like')
          if (n) n.textContent = '♥ ' + likes
        })
        if (liked) likedMap.add(t)
        else likedMap.delete(t)
        saveLiked()
        const pv = document.getElementById('previewLikeCount')
        if (pv && currentPreview && String(currentPreview.time) === t) pv.textContent = likes
      }

      function updateLikedState(btn, time) {
        const gave = window.dust ? window.dust.gave(time) : likedMap.has(String(time))
        btn.classList.toggle('liked', gave)
        // 已赠送就把前缀换成「已送」，计数保持不变
        const countEl = btn.querySelector('span')
        if (!countEl) return
        if (gave) {
          btn.dataset.count = countEl.textContent
          countEl.textContent = '已送 ' + countEl.textContent
        } else if (btn.dataset.count) {
          countEl.textContent = btn.dataset.count
        }
      }

      /* 赠送光尘：同一作品只能送一次，且要有余额 */
      async function like(rec, btn) {
        const key = String(rec.time)
        if (!window.dust) return
        if (window.dust.gave(key)) {
          toast('你已经送过光尘给这幅画了')
          return
        }
        if (window.dust.balance() < window.dust.cost) {
          toast('光尘不够了，去「我的」签到领一些吧')
          return
        }
        btn.disabled = true
        try {
          const res = await fetch('/api/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ time: rec.time }),
          })
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            // 服务端计数成功后才真正扣光尘，避免白扣
            if (!window.dust.give(key)) {
              toast('光尘不足，赠送未完成')
              return
            }
            likedMap.add(key)
            saveLiked()
            if (window.sfx) window.sfx('pop')
            rec.likes = Math.max(0, Number(data.likes) || 0)
            const span = btn.querySelector('span')
            if (span) span.textContent = rec.likes
            updateLikedState(btn, rec.time)
            const pv = document.getElementById('previewLikeCount')
            if (pv) pv.textContent = rec.likes
            syncLikeEverywhere(rec.time, rec.likes, true)
            toast('送出了 ' + window.dust.cost + ' 个光尘 ✨ 余额 ' + window.dust.balance())
          } else {
            toast('赠送失败：' + (data.error || res.status))
          }
        } catch (err) {
          toast('赠送失败：网络错误')
        } finally {
          btn.disabled = false
        }
      }

      let toastTimer
      function toast(msg) {
        let el = document.getElementById('toast')
        if (!el) {
          el = document.createElement('div')
          el.id = 'toast'
          el.style.cssText =
            'position:fixed;left:50%;bottom:96px;transform:translate(-50%,16px);background:rgba(30,26,22,0.92);color:#fff;padding:12px 22px;border-radius:999px;font-size:15px;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;z-index:120;max-width:86vw;text-align:center;'
          document.body.appendChild(el)
        }
        el.textContent = msg
        requestAnimationFrame(() => {
          el.style.opacity = '1'
          el.style.transform = 'translate(-50%,0)'
        })
        clearTimeout(toastTimer)
        toastTimer = setTimeout(() => {
          el.style.opacity = '0'
          el.style.transform = 'translate(-50%,16px)'
        }, 2000)
      }

      /* ---------- 佳作展示 ---------- */
      const featured = document.getElementById('featured')
      const featuredRow = document.getElementById('featuredRow')
      /* ---------- 公告 ---------- */
      const ANNOUNCE_ID = '2026-national-day'
      const ANNOUNCE_KEY = 'lw-announce-' + ANNOUNCE_ID
      const announce = document.getElementById('announce')
      const announceClose = document.getElementById('announceClose')
      if (announce) {
        let seen = false
        try {
          seen = localStorage.getItem(ANNOUNCE_KEY) === '1'
        } catch (e) {}
        if (!seen) announce.hidden = false
        if (announceClose) {
          announceClose.addEventListener('click', () => {
            announce.hidden = true
            try {
              localStorage.setItem(ANNOUNCE_KEY, '1')
            } catch (e) {}
            if (window.sfx) window.sfx('tick')
          })
        }
      }

      /* ---------- 发现：随机翻出旧作品 ---------- */
      const discoverBtn = document.getElementById('discoverBtn')
      const discoverBody = document.getElementById('discoverBody')
      let discovering = false

      function agoTextOf(ts) {
        const d = Math.max(0, Date.now() - (Number(ts) || 0))
        const mins = Math.round(d / 60000)
        if (mins < 60) return mins + ' 分钟前发布'
        const hrs = Math.round(mins / 60)
        if (hrs < 24) return hrs + ' 小时前发布'
        const days = Math.round(hrs / 24)
        if (days < 30) return days + ' 天前发布'
        if (days < 365) return Math.round(days / 30) + ' 个月前发布'
        return Math.round(days / 365) + ' 年前发布'
      }

      function drawDiscoverThumb(cv, pixels, size) {
        const n = size === 32 || size === 64 ? size : 16
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        cv.width = n * dpr
        cv.height = n * dpr
        const c = cv.getContext('2d')
        c.scale(dpr, dpr)
        // 同样先铺白底，避免缺失格透出容器背景形成白条纹
        c.fillStyle = '#ffffff'
        c.fillRect(0, 0, n, n)
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const p = pixels && pixels[y * n + x]
            if (!Array.isArray(p) || p.length < 3) continue
            c.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')'
            c.fillRect(x, y, 1, 1)
          }
        }
      }

      async function rollDiscover() {
        if (discovering || !discoverBody) return
        discovering = true
        discoverBtn.disabled = true
        discoverBtn.textContent = '翻找中…'
        try {
          const res = await fetch('/api/get?discover=1&t=' + Date.now(), { cache: 'no-store' })
          const data = await res.json().catch(() => ({}))
          const w = data && data.work
          if (!w) {
            discoverBody.innerHTML = '<div class="discover-empty">社区还没有作品，先去画一幅吧</div>'
            return
          }
          discoverBody.innerHTML = ''
          const card = document.createElement('div')
          card.className = 'discover-card'
          const cv = document.createElement('canvas')
          drawDiscoverThumb(cv, w.pixels, w.size)
          const info = document.createElement('div')
          info.className = 'discover-info'
          const nm = document.createElement('div')
          nm.className = 'discover-name'
          nm.textContent = w.workName || '未命名'
          const meta = document.createElement('div')
          meta.className = 'discover-meta'
          meta.textContent =
            (w.author || '匿名') + ' · ' + w.size + '×' + w.size + (w.likes ? ' · ♥ ' + w.likes : '')
          const ago = document.createElement('div')
          ago.className = 'discover-ago'
          ago.textContent = agoTextOf(w.time)
          info.append(nm, meta, ago)
          card.append(cv, info)
          card.addEventListener('click', () => {
            // 复用现成的预览逻辑
            if (typeof preview === 'function') preview(w)
            else location.href = '/gallery?t=' + w.time
          })
          discoverBody.appendChild(card)
          if (window.sfx) window.sfx('pop')
        } catch (e) {
          discoverBody.innerHTML = '<div class="discover-empty">网络不太好，稍后再试</div>'
        } finally {
          discovering = false
          discoverBtn.disabled = false
          discoverBtn.textContent = '掷一个'
        }
      }
      if (discoverBtn) discoverBtn.addEventListener('click', rollDiscover)

      const featuredSub = document.getElementById('featuredSub')
      const rangeTabs = document.getElementById('rangeTabs')
      let featuredRange = 'all'

      rangeTabs.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          rangeTabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn))
          featuredRange = btn.dataset.range
          loadFeatured()
        })
      })

      loadDaily()
      loadTagCloud()
      loadFeatured()
      loadContest()


      async function loadFeatured() {
        try {
          const tz = -(new Date().getTimezoneOffset())
          const res = await fetch(`/api/like?top=5&range=${featuredRange}&tz=${tz}`)
          if (!res.ok) return
          const data = await res.json()
          const works = data.works || []
          featuredSub.textContent =
            featuredRange === 'today'
              ? '按今日点赞数排名 Top 5'
              : featuredRange === 'week'
                ? '按本周点赞数排名 Top 5'
                : '按总点赞数排名 Top 5'
          if (!works.length) {
            featured.hidden = true
            featuredRow.innerHTML = ''
            return
          }
          featured.hidden = false
          featuredRow.innerHTML = ''
          works.forEach((w, i) => {
            const card = document.createElement('div')
            card.className = 'f-card'

            const rank = document.createElement('div')
            rank.className = 'f-rank ' + (i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : 'rn')
            rank.textContent = i + 1

            const cnv = document.createElement('img')
            const fs = workSize(w)
            cnv.className = 'f-art'
            cnv.alt = w.workName || w.name || '未命名'
            cnv.loading = 'lazy'
            cnv.decoding = 'async'
            cnv.src = pixelsToURL(w.pixels, fs)

            const nm = document.createElement('div')
            nm.className = 'f-name'
            nm.textContent = (w.type === 'anim' ? '🎞️ ' : '') + (w.workName || w.name || '未命名')

            const metaRow = document.createElement('div')
            metaRow.className = 'f-meta'
            const au = document.createElement('span')
            au.className = 'f-author'
            au.textContent = w.author || '匿名'

            const fz = document.createElement('span')
            fz.className = 'f-size'
            fz.textContent = fs + '×' + fs

            card.dataset.likeTime = String(w.time)
            const lk = document.createElement('span')
            lk.className = 'f-like'
            lk.textContent = '♥ ' + (w.likes || 0)

            metaRow.append(au, fz, lk)
            card.append(rank, cnv, nm, metaRow)
            card.addEventListener('click', () => preview(w))
            featuredRow.appendChild(card)
          })
        } catch (e) {}
      }

      loadFeatured()

      /* ---------- 列表 ---------- */
      const sentinel = document.getElementById('sentinel')
      const PAGE = 24
      const cardsByTime = new Map()
      let offset = 0
      let done = false
      let loading = false

      /* 作品类型：多人 > 参赛 > 动画 > 普通 */
      function workTypeOf(rec) {
        if (rec.room === true || (rec.author && rec.author.indexOf('、') >= 0)) return 'room'
        if (rec.contest) return 'contest'
        if (rec.type === 'anim') return 'anim'
        return ''
      }

      function appendCards(records) {
        records.forEach((rec) => {
          const card = document.createElement('div')
          card.className = 'card'
          const wt = workTypeOf(rec)
          if (wt) card.classList.add('t-' + wt)
          card.setAttribute('role', 'button')
          card.tabIndex = 0
          card.title = '点击预览'

          const c = document.createElement('img')
          const rs = workSize(rec)
          c.className = 'art'
          c.alt = rec.workName || rec.name || '未命名'
          c.loading = 'lazy'
          c.decoding = 'async'
          c.src = pixelsToURL(rec.pixels, rs)

          const meta = document.createElement('div')
          meta.className = 'card-meta'
          const nm = document.createElement('span')
          nm.className = 'card-name'
          nm.textContent = rec.workName || rec.name || '未命名'
          meta.append(nm)
          if (wt === 'anim') {
            const b = document.createElement('span')
            b.className = 'anim-badge'
            b.textContent = '🎞️ 动画'
            meta.append(b)
          } else if (wt === 'room') {
            const b = document.createElement('span')
            b.className = 'room-badge'
            b.textContent = '👥 多人'
            meta.append(b)
          }
          if (rec.fromImage) {
            const b = document.createElement('span')
            b.className = 'img-badge'
            b.textContent = '🖼️ 来自图片'
            b.title = '由照片转换生成'
            meta.append(b)
          }
          meta.append(makeLikeButton(rec))
          if (rec.contest) {
            const vb = makeVoteButton(rec)
            vb.__rec = rec
            vb.hidden = true
            meta.append(vb)
          }

          const sub = document.createElement('div')
          sub.className = 'card-sub'
          const au = document.createElement('span')
          au.className = 'card-author'
          au.textContent = rec.author || (rec.workName ? '匿名' : rec.name || '匿名')
          if (rec.author) {
            au.style.cursor = 'pointer'
            au.title = '查看 ' + rec.author + ' 的主页'
            au.addEventListener('click', (e) => {
              e.stopPropagation()
              openAuthor(rec.author)
            })
          }
          const sizeBadge = document.createElement('span')
          sizeBadge.className = 'card-size'
          sizeBadge.textContent = rs + '×' + rs
          const tm = document.createElement('span')
          tm.className = 'card-time'
          tm.textContent = formatTime(rec.time)

          sub.append(au, sizeBadge, tm)
          card.append(c, meta, sub)
          if (Array.isArray(rec.tags) && rec.tags.length) {
            const tw = document.createElement('div')
            tw.className = 'card-tags'
            rec.tags.forEach((t) => {
              const tg = document.createElement('span')
              tg.className = 'card-tag'
              tg.textContent = '#' + t
              tg.addEventListener('click', (e) => {
                e.stopPropagation()
                searchTag = t
                renderChips()
                loadTagCloud()
                resetGallery('搜索中…')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              })
              tw.appendChild(tg)
            })
            card.appendChild(tw)
          }
          card.addEventListener('click', () => preview(rec))
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              preview(rec)
            }
          })
          cardsByTime.set(String(rec.time), card)
          gallery.appendChild(card)
        })
      }

      /* ---------- 每日挑战 ---------- */
      const dailyPanel = document.getElementById('dailyPanel')
      const dailyDay = document.getElementById('dailyDay')
      const dailyTheme = document.getElementById('dailyTheme')
      const dailyPrompt = document.getElementById('dailyPrompt')
      const dailyTip = document.getElementById('dailyTip')
      const dailyTop = document.getElementById('dailyTop')
      const dailyCta = document.getElementById('dailyCta')

      async function loadDaily() {
        try {
          const res = await fetch('/api/challenge?top=12')
          if (!res.ok) return
          const d = await res.json()
          dailyTheme.textContent = (d.theme && d.theme.zh) || ''
          dailyPrompt.textContent = (d.theme && d.theme.prompt) || ''
          dailyDay.textContent = d.day || ''
          dailyTip.textContent = d.total ? '已有 ' + d.total + ' 件作品参加了今天' : '今天还没有人参加，来当第一个'
          dailyCta.setAttribute('href', '/paint?daily=1')
          dailyTop.innerHTML = ''
          ;(d.works || []).forEach((w) => {
            const box = document.createElement('div')
            box.style.position = 'relative'
            const img = document.createElement('img')
            img.src = pixelsToURL(w.pixels, workSize(w))
            img.alt = w.workName || '未命名'
            img.loading = 'lazy'
            img.addEventListener('click', () => preview(w))
            const lk = document.createElement('span')
            lk.className = 'card-like'
            lk.textContent = '♥ ' + (w.likes || 0)
            lk.addEventListener('click', (e) => {
              e.stopPropagation()
              like(w, lk)
            })
            box.append(img, lk)
            dailyTop.appendChild(box)
          })
          dailyPanel.hidden = false
        } catch (e) {}
      }

      /* ---------- 搜索 / 标签 / 作者 ---------- */
      const searchInput = document.getElementById('searchInput')
      const searchClear = document.getElementById('searchClear')
      const chipRow = document.getElementById('chipRow')
      const tagCloud = document.getElementById('tagCloud')
      const authorPage = document.getElementById('authorPage')
      const authorName = document.getElementById('authorName')
      const authorCount = document.getElementById('authorCount')
      const authorWorks = document.getElementById('authorWorks')
      const authorBack = document.getElementById('authorBack')
      let searchQ = ''
      let searchTag = ''
      let searchAuthor = ''

      function searchQuery() {
        const p = new URLSearchParams()
        p.set('limit', String(PAGE))
        p.set('offset', String(offset))
        if (searchQ) p.set('q', searchQ)
        if (searchTag) p.set('tag', searchTag)
        if (searchAuthor) p.set('author', searchAuthor)
        return p.toString()
      }

      function resetGallery(msg) {
        offset = 0
        done = false
        loading = false
        gallery.innerHTML = ''
        countEl.textContent = msg
        sentinel.hidden = false
        sentinel.textContent = '加载中…'
        loadMore()
      }

      function renderChips() {
        const items = []
        if (searchQ) items.push(['关键词：' + searchQ, 'q'])
        if (searchTag) items.push(['#' + searchTag, 'tag'])
        if (searchAuthor) items.push(['作者：' + searchAuthor, 'author'])
        chipRow.innerHTML = ''
        chipRow.hidden = items.length === 0
        items.forEach(([label, kind]) => {
          const c = document.createElement('button')
          c.type = 'button'
          c.className = 'chip active'
          c.textContent = label + ' ✕'
          c.addEventListener('click', () => {
            if (kind === 'q') {
              searchQ = ''
              searchInput.value = ''
              searchClear.hidden = true
            } else if (kind === 'tag') searchTag = ''
            else searchAuthor = ''
            renderChips()
            resetGallery('搜索中…')
          })
          chipRow.appendChild(c)
        })
      }

      async function loadTagCloud() {
        try {
          const res = await fetch('/api/get?tagcloud=1')
          if (!res.ok) return
          const data = await res.json()
          const tags = data.tags || []
          tagCloud.innerHTML = ''
          tagCloud.hidden = tags.length === 0
          tags.forEach((t) => {
            const c = document.createElement('button')
            c.type = 'button'
            c.className = 'chip' + (searchTag === t.name ? ' active' : '')
            c.textContent = '#' + t.name + ' ' + t.count
            c.addEventListener('click', () => {
              searchTag = searchTag === t.name ? '' : t.name
              renderChips()
              loadTagCloud()
              resetGallery('搜索中…')
            })
            tagCloud.appendChild(c)
          })
        } catch (e) {}
      }

      let searchTimer = null
      searchInput.addEventListener('input', () => {
        searchClear.hidden = !searchInput.value
        clearTimeout(searchTimer)
        searchTimer = setTimeout(() => {
          searchQ = searchInput.value.trim()
          renderChips()
          resetGallery('搜索中…')
        }, 320)
      })
      searchClear.addEventListener('click', () => {
        searchInput.value = ''
        searchClear.hidden = true
        searchQ = ''
        renderChips()
        resetGallery('加载中…')
      })

      // 打开某位作者的主页
      async function openAuthor(name) {
        searchAuthor = name
        searchQ = ''
        searchTag = ''
        searchInput.value = ''
        searchClear.hidden = true
        renderChips()
        authorPage.hidden = false
        authorName.textContent = name
        authorWorks.innerHTML = '<div class="status">加载中…</div>'
        try {
          const res = await fetch('/api/get?limit=60&author=' + encodeURIComponent(name))
          const data = await res.json()
          const list = data.history || []
          authorCount.textContent = list.length + ' 件作品'
          authorWorks.innerHTML = ''
          if (!list.length) {
            authorWorks.innerHTML = '<div class="status">这位作者还没有公开作品</div>'
            return
          }
          list.forEach((w) => {
            const img = document.createElement('img')
            img.src = pixelsToURL(w.pixels, workSize(w))
            img.alt = w.workName || w.name || '未命名'
            img.loading = 'lazy'
            img.addEventListener('click', () => preview(w))
            authorWorks.appendChild(img)
          })
        } catch (e) {
          authorWorks.innerHTML = '<div class="status">加载失败</div>'
        }
        authorPage.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      authorBack.addEventListener('click', () => {
        searchAuthor = ''
        authorPage.hidden = true
        renderChips()
        resetGallery('加载中…')
      })

      async function loadMore() {
        if (loading || done) return
        loading = true
        sentinel.textContent = '加载中…'
        try {
          const res = await fetch('/api/get?' + searchQuery())
          if (!res.ok) throw new Error('HTTP ' + res.status)
          const data = await res.json()
          const list = data.history || []

          if (offset === 0 && !list.length) {
            countEl.textContent = '共 0 件作品'
            sentinel.hidden = true
            showStatus('还没有作品，快去画板上传第一幅吧')
            return
          }

          appendCards(list)
          offset += list.length
          countEl.textContent = `共 ${data.total != null ? data.total : offset} 件作品`

          if (!list.length || (data.total != null && offset >= data.total)) {
            done = true
            sentinel.textContent = '已经到底啦'
          } else {
            sentinel.textContent = ''
          }
        } catch (err) {
          sentinel.textContent = '加载失败，点此重试'
        } finally {
          loading = false
        }
      }

      sentinel.addEventListener('click', () => {
        if (sentinel.textContent.startsWith('加载失败')) loadMore()
      })

      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadMore()
        },
        { rootMargin: '150px' }
      )
      io.observe(sentinel)

      loadMore()

      /* ---------- 分享定位（/gallery?t=时间戳） ---------- */
      const qs0 = new URLSearchParams(location.search)
      if (qs0.get('author')) openAuthor(qs0.get('author'))
      const shareTarget = qs0.get('t')

      async function ensureLoadedTo(upTo) {
        let guard = 0
        while (!done && offset <= upTo && guard++ < 300) {
          if (loading) {
            await new Promise((r) => setTimeout(r, 120))
          } else {
            await loadMore()
          }
        }
      }

      if (shareTarget) {
        ;(async () => {
          try {
            const res = await fetch('/api/get?locate=' + encodeURIComponent(shareTarget))
            const data = await res.json()
            if (data.found && data.index != null) {
              await ensureLoadedTo(data.index)
              const card = cardsByTime.get(String(shareTarget))
              if (card) {
                card.classList.add('hl')
                card.scrollIntoView({ behavior: 'smooth', block: 'center' })
                setTimeout(() => card.classList.remove('hl'), 4200)
                countEl.textContent = '定位到第 ' + (data.index + 1) + ' 件作品'
              }
            } else {
              toast('未找到该作品或已被删除')
            }
          } catch (e) {}
        })()
      }

      /* ---------- 预览弹窗 ---------- */
      const previewOverlay = document.getElementById('previewOverlay')
      let currentPreview = null
      let animTimer = null
      let animIdx = 0

      function drawAnimFrame(cv, frame) {
        const tc = cv.getContext('2d')
        tc.clearRect(0, 0, 16, 16)
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const p = frame && frame[y] && frame[y][x]
            if (!p) continue
            tc.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`
            tc.fillRect(x, y, 1, 1)
          }
        }
      }

      function stopAnimPlay() {
        if (animTimer) {
          clearInterval(animTimer)
          animTimer = null
        }
      }

      /* ---------- 用色色板：列出作品用到的全部颜色，点一下复制色号 ---------- */
      const palBtn = document.getElementById('previewPaletteBtn')
      const palBox = document.getElementById('previewPalette')
      const palGrid = document.getElementById('palGrid')
      const palCount = document.getElementById('palCount')

      function hexOf(px) {
        return (
          '#' +
          px
            .slice(0, 3)
            .map((v) => Number(v).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()
        )
      }

      /* 收集作品（动画则取第一帧）里所有不重复的颜色，按用得多少排序 */
      function colorsOf(rec) {
        const rs = workSize(rec)
        let arr = rec.pixels
        if (rec.type === 'anim' && rec.anim && Array.isArray(rec.anim.frames) && rec.anim.frames[0]) {
          arr = rec.anim.frames[0]
        }
        if (!Array.isArray(arr) || !arr.length) return []
        const map = new Map()
        for (const px of arr) {
          if (!Array.isArray(px) || px.length < 3) continue
          const hex = hexOf(px)
          map.set(hex, (map.get(hex) || 0) + 1)
        }
        // 纯白通常是画布底色，排在最后且不展示
        const list = Array.from(map.entries())
          .filter((e) => e[0] !== '#FFFFFF')
          .sort((a, b) => b[1] - a[1])
        return list
      }

      async function copyHex(hex) {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(hex)
          } else {
            const ta = document.createElement('textarea')
            ta.value = hex
            ta.style.position = 'fixed'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            ta.remove()
          }
          if (window.sfx) window.sfx('tick')
          toast('已复制色号 ' + hex)
        } catch (e) {
          toast('复制失败，请长按色块手动复制')
        }
      }

      function renderPalette(rec) {
        if (!palGrid) return
        palGrid.innerHTML = ''
        const list = colorsOf(rec)
        if (palCount) palCount.textContent = list.length ? list.length + ' 种颜色' : '没有可用颜色'
        if (!list.length) {
          const tip = document.createElement('div')
          tip.className = 'pal-tip'
          tip.textContent = '这幅画还没有可提取的颜色'
          palGrid.appendChild(tip)
          return
        }
        list.forEach(([hex, n]) => {
          const chip = document.createElement('button')
          chip.type = 'button'
          chip.className = 'pal-chip'
          chip.title = hex + '（用了 ' + n + ' 格）· 点击复制'
          chip.innerHTML = '<i style="background:' + hex + '"></i><span>' + hex.slice(1) + '</span>'
          chip.addEventListener('click', () => copyHex(hex))
          palGrid.appendChild(chip)
        })
      }

      function closePalette() {
        if (palBox) palBox.hidden = true
        if (palBtn) {
          palBtn.setAttribute('aria-expanded', 'false')
          palBtn.classList.remove('on')
        }
      }

      if (palBtn) {
        palBtn.addEventListener('click', () => {
          const willOpen = palBox.hidden
          if (willOpen) {
            if (!currentPreview) return
            if (currentPreview.fromImage === true) return
            renderPalette(currentPreview)
            palBox.hidden = false
            palBtn.setAttribute('aria-expanded', 'true')
            palBtn.classList.add('on')
            if (window.sfx) window.sfx('tick')
          } else {
            closePalette()
          }
        })
      }

      function preview(rec) {
        stopAnimPlay()
        const img = document.getElementById('previewImg')
        const cv = document.getElementById('previewCanvas')
        const rs = workSize(rec)
        const frames = rec.type === 'anim' && rec.anim && Array.isArray(rec.anim.frames) ? rec.anim.frames : null

        if (frames && frames.length >= 2) {
          img.hidden = true
          cv.hidden = false
          animIdx = 0
          drawAnimFrame(cv, frames[0])
          const delay = Math.max(1, Math.min(200, rec.anim.delay || 10))
          animTimer = setInterval(() => {
            animIdx = (animIdx + 1) % frames.length
            drawAnimFrame(cv, frames[animIdx])
          }, delay * 10)
          document.getElementById('previewTitle').textContent =
            '🎞️ 动画 · ' + (rec.workName || rec.name || '未命名')
        } else {
          cv.hidden = true
          img.hidden = false
          img.src = pixelsToURL(rec.pixels, rs)
          document.getElementById('previewTitle').textContent = rec.workName || rec.name || '未命名'
        }
        document.getElementById('previewAuthor').textContent = '作者：' + (rec.author || (rec.workName ? '匿名' : rec.name || '匿名')) + ' · ' + rs + '×' + rs
        document.getElementById('previewTime').textContent = formatTime(rec.time)
        document.getElementById('previewLikeCount').textContent = rec.likes || 0
        updateLikedState(document.getElementById('previewLike'), rec.time)
        currentPreview = rec
        closePalette()
        /* 照片转来的作品颜色非常多，色板没意义，直接隐藏入口 */
        if (palBtn) {
          const hidePal = rec.fromImage === true
          palBtn.hidden = hidePal
          if (hidePal && palBox) palBox.hidden = true
        }
        syncPreviewVoteBtn()
        previewOverlay.hidden = false
      }

      function syncPreviewVoteBtn() {
        const pv = document.getElementById('previewVoteBtn')
        const rec = currentPreview
        if (!pv || !rec) return
        if (isCurrentContestEntry(rec)) {
          const voted = contestCtx.voted.map(String).includes(String(rec.time))
          pv.hidden = false
          pv.textContent = voted
            ? '🏆 已投票 · ' + (rec.contestVotes || 0)
            : '🏆 投一票 · ' + (rec.contestVotes || 0)
          pv.classList.toggle('voted', voted)
          pv.disabled = false
          pv.onclick = (e) => {
            e.stopPropagation()
            voteContest(rec, pv)
          }
        } else {
          pv.hidden = true
          pv.onclick = null
        }
      }

      function closePreview() {
        if (window.sfx) window.sfx('close')
        stopAnimPlay()
        previewOverlay.hidden = true
        currentPreview = null
      }

      document.getElementById('previewClose').addEventListener('click', closePreview)
      /* ---------- 举报（长按 1.5 秒触发，避免误触） ---------- */
      const reportOverlay = document.getElementById('reportOverlay')
      const reportProgress = document.getElementById('reportProgress')
      const reportBar = reportProgress.querySelector('i')
      const reportReasons = document.getElementById('reportReasons')
      const reportNote = document.getElementById('reportNote')
      const reportSubmit = document.getElementById('reportSubmit')
      let reportHoldTimer = null
      let reportHoldRaf = 0
      let reportTarget = null
      let reportReason = '违法违规'

      const HOLD_MS = 1500
      function stopHold() {
        clearTimeout(reportHoldTimer)
        cancelAnimationFrame(reportHoldRaf)
        reportHoldTimer = null
        if (reportProgress) reportProgress.hidden = true
        reportBar.style.width = '0'
      }
      function startHold(rec) {
        stopHold()
        reportTarget = rec
        if (reportProgress) reportProgress.hidden = false
        const t0 = performance.now()
        const tick = () => {
          const k = Math.min(1, (performance.now() - t0) / HOLD_MS)
          reportBar.style.width = (k * 100).toFixed(1) + '%'
          if (k < 1) reportHoldRaf = requestAnimationFrame(tick)
        }
        reportHoldRaf = requestAnimationFrame(tick)
        reportHoldTimer = setTimeout(() => {
          stopHold()
          if (window.sfx) window.sfx('ding')
          if (reportNote) reportNote.value = ''
          reportReasons.querySelectorAll('.report-reason').forEach((b, i) =>
            b.classList.toggle('on', i === 0)
          )
          reportReason = '违法违规'
          reportOverlay.hidden = false
        }, HOLD_MS)
      }

      const reportBtn = document.getElementById('previewReport')
      if (reportBtn) {
        reportBtn.addEventListener('pointerdown', () => {
          if (window.sfx) window.sfx('tap')
          startHold(currentPreview)
        })
        reportBtn.addEventListener('pointerup', stopHold)
        reportBtn.addEventListener('pointerleave', stopHold)
        reportBtn.addEventListener('pointercancel', stopHold)
        reportBtn.addEventListener('contextmenu', (e) => e.preventDefault())
      }
      document.getElementById('reportClose').addEventListener('click', () => {
        stopHold()
        reportOverlay.hidden = true
      })
      reportOverlay.addEventListener('click', (e) => {
        if (e.target === reportOverlay) reportOverlay.hidden = true
      })
      reportReasons.addEventListener('click', (e) => {
        const b = e.target.closest('.report-reason')
        if (!b) return
        reportReasons.querySelectorAll('.report-reason').forEach((x) => x.classList.remove('on'))
        b.classList.add('on')
        reportReason = b.dataset.r
      })
      reportSubmit.addEventListener('click', async () => {
        const rec = reportTarget
        if (!rec) return
        reportSubmit.disabled = true
        try {
          const res = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              time: rec.time,
              reason: reportReason,
              note: reportNote ? reportNote.value : '',
              title: rec.workName || rec.name || '',
              author: rec.author || '',
            }),
          })
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            reportOverlay.hidden = true
            toast('举报已提交 thanks'.replace(' thanks', '，感谢你的反馈'))
            if (window.sfx) window.sfx('save')
          } else {
            toast(data.error || '提交失败，请稍后再试')
          }
        } catch (e) {
          toast('网络异常，举报未提交')
        } finally {
          reportSubmit.disabled = false
        }
      })

      previewOverlay.addEventListener('click', (e) => {
        if (e.target === previewOverlay) closePreview()
      })
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePreview()
      })

      document.getElementById('previewLike').addEventListener('click', () => {
        if (!currentPreview) return
        const btn = document.getElementById('previewLike')
        like(currentPreview, btn)
      })

      document.getElementById('previewCard').addEventListener('click', () => {
        if (!currentPreview) return
        openCard(
          currentPreview.pixels,
          workSize(currentPreview),
          currentPreview.workName || currentPreview.name || '未命名',
          currentPreview.author || '匿名',
          currentPreview.likes || 0,
          currentPreview.tags
        )
      })

      document.getElementById('previewShare').addEventListener('click', () => {
        if (!currentPreview) return
        const url = location.origin + '/gallery?t=' + currentPreview.time
        const btn = document.getElementById('previewShare')
        const done = () => {
          if (window.sfx) window.sfx('ding')
          btn.textContent = '✓ 已复制'
          btn.classList.add('copied')
          setTimeout(() => {
            btn.textContent = '🔗 复制链接'
            btn.classList.remove('copied')
          }, 1800)
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(() => {
            prompt('复制链接', url)
            done()
          })
        } else {
          prompt('复制链接', url)
          done()
        }
      })
  },
}
