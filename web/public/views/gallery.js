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
      [data-mood="dark"] {
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
        /* 用 flex 居中而不是 line-height：emoji 字形基线偏低，
           line-height:1 会让它看起来偏下 */
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-decoration: none;
        padding: 0;
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
      .author-id { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
      .author-id-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .author-av {
        width: 40px; height: 40px; flex: 0 0 40px; border-radius: 10px; overflow: hidden;
        background: var(--art-bg); border: 1px solid var(--border-strong);
        display: flex; align-items: center; justify-content: center;
      }
      .author-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .author-av-ph { font-size: 15px; font-weight: 800; color: var(--text-faint); }
      .author-bio {
        font-size: 12px; color: var(--text-muted); line-height: 1.5;
        overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
        -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word;
      }
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

      [data-mood="dark"] .contest {
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
        /* 审核员的「下架」按钮是绝对定位的，卡片必须是定位上下文，
           否则按钮会跑到整个页面左上角去 */
        position: relative;
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
      [data-mood="dark"] .card.t-contest { border-color: rgba(118, 163, 255, 0.6); }
      [data-mood="dark"] .card.t-anim { border-color: rgba(166, 145, 255, 0.6); }
      [data-mood="dark"] .card.t-room { border-color: rgba(72, 214, 178, 0.6); }

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

      .card-av {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        image-rendering: pixelated;
        flex: none;
        border: 1px solid var(--border);
        background: var(--surface-2);
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

      /* 审核员勋章：挂在作者名旁边 */
      .mod-badge {
        font-size: 10px; font-weight: 700; color: #2f6b3f;
        background: #e8f5ec; border: 1px solid #cbe6d4;
        border-radius: 999px; padding: 1px 6px; margin-left: 4px;
        white-space: nowrap; flex: none;
      }
      /* 审核员的「暂时下架」按钮：卡片左上角，只有审核员看得见 */
      .mod-hide {
        position: absolute; left: 6px; top: 6px; z-index: 3;
        border: 0; border-radius: 999px; cursor: pointer;
        background: rgba(60, 48, 36, .82); color: #fff;
        font-family: inherit; font-size: 11px; font-weight: 700;
        padding: 4px 9px; backdrop-filter: blur(2px);
      }
      .mod-hide:active { transform: scale(.94); }

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
      /* 相机作品不能收光尘/投票：置灰但仍可读，不能完全藏起来让人以为没人送过 */
      .like-btn.no-dust, .like-btn.no-dust.liked,
      .vote-btn.no-vote, .vote-btn.no-vote.voted {
        opacity: 0.42; cursor: not-allowed; filter: grayscale(1);
      }
      .like-btn.no-dust:active, .vote-btn.no-vote:active { transform: none; }

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

      /* 弹窗整体不能超过屏幕：以前没限高，评论一多内容就撑到视口外面，
         而遮罩是 fixed + overflow:visible，超出去的部分既滑不到也点不到
         （实测 47 条评论时「下拉加载更多」按钮 top=857、视口只有 844，
         elementFromPoint 直接是 null）。
         改成：头部固定在弹窗顶端，下面 .preview-body 自己滚动。 */
      .preview-box {
        width: 100%;
        max-width: 380px;
        max-height: calc(100vh - 32px);
        max-height: calc(100dvh - 32px);
        display: flex;
        flex-direction: column;
        background: var(--surface);
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        text-align: center;
      }
      .preview-body {
        flex: 1 1 auto;
        min-height: 0; /* flex 子项默认 min-height:auto，不写这行就不会收缩、不会滚 */
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        scrollbar-width: thin;
      }
      .preview-body::-webkit-scrollbar { width: 4px; }
      .preview-body::-webkit-scrollbar-thumb {
        background: var(--border-strong); border-radius: 4px;
      }

      /* 头部吸顶：评论一多内容变长，头部跟着滚出去就够不着「关闭」了
         （反馈是「评论 3 个就关不掉作品」）。吸顶后按钮永远在。 */
      /* 头部在 .preview-body 外面，本身就永远可见，不需要 sticky 了 */
      .preview-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        flex: none;
        padding: 8px 0;
        margin-top: -8px;
      }
      /* 下滑关闭：按住预览往下一拖，松手就关。手指按住的地方会跟手。
         注意：JS 里是给 #previewBox 加 .swiping，类名必须对上 ——
         之前这两条写的是 .preview-card，markup 里根本没有这个元素，
         于是拖动时 transition 一直生效，手感是飘的而不是跟手的。 */
      #previewBox {
        transition: transform 0.18s ease-out;
      }
      #previewBox.swiping { transition: none; }
      .preview-art {
        touch-action: none; /* 这块由手势处理，别让浏览器拿去滚 */
        cursor: grab;
        /* 关掉系统自带的长按菜单（iOS Safari / 安卓 Chrome 都有）：
           它们是浏览器级弹层，出现时机不受我们控制，会盖在我们的
           作品菜单上面，点「转发给朋友」会点穿到它去。
           touch-action: none 挡不住它，只有 -webkit-touch-callout 能。 */
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      #previewBox.swiping .preview-art { cursor: grabbing; }
      .preview-grab {
        width: 38px; height: 4px; border-radius: 999px;
        background: var(--border-strong);
        margin: -2px auto 8px;
        flex: none;
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
      /* 作者行：头像 + 名字，点名字进作者主页 */
      .preview-who { display: flex; align-items: center; gap: 8px; }
      .preview-av {
        width: 30px; height: 30px; flex: 0 0 30px; border-radius: 9px; overflow: hidden;
        background: var(--art-bg); border: 1px solid var(--border-strong);
      }
      .preview-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .preview-author-btn {
        background: none; border: 0; padding: 0; cursor: pointer;
        font: inherit; color: inherit; text-align: left;
      }
      .preview-author-btn:hover { text-decoration: underline; }
      .preview-report {
        margin-left: auto; flex: none;
        border: 1px solid var(--border-strong); background: var(--surface-2);
        color: var(--text-muted); border-radius: 999px; padding: 4px 10px;
        font-size: 11px; font-weight: 700; font-family: inherit; cursor: pointer;
      }
      .preview-report:active { background: var(--border); }
      .preview-bio {
        font-size: 12px; font-weight: 500; color: var(--text-muted); line-height: 1.5;
        padding: 6px 10px; border-radius: 10px; background: var(--surface-2);
        white-space: pre-wrap; word-break: break-word;
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

      /* 用色占比条：按比例横向铺开，一眼看出主色调。
         比一串色块直观 —— 光看色块不知道哪个是主色。 */
      .pal-bar {
        display: flex;
        height: 12px;
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 10px;
        border: 1px solid var(--border);
      }
      .pal-bar i { display: block; min-width: 2px; }
      .pal-sum {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        font-size: 11.5px;
        color: var(--text-faint);
        margin-bottom: 10px;
      }
      .pal-sum b { color: var(--text); font-weight: 700; }
      .pal-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .pal-chip span em {
        font-style: normal;
        font-size: 9.5px;
        color: var(--text-faint);
        margin-left: 4px;
      }

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

      /* ---------- 评论 ---------- */
      .cmt-box {
        margin-top: 14px; padding-top: 12px;
        border-top: 1px solid var(--border);
      }
      .cmt-head {
        display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
      }
      .cmt-title { font-size: 13px; font-weight: 800; color: var(--text); flex: 1; }
      .cmt-in {
        width: 100%; border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text); border-radius: 11px; padding: 9px 11px;
        font-size: 13px; font-family: inherit; resize: none; min-height: 40px;
        line-height: 1.5;
      }
      .cmt-in:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
      .cmt-act { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
      .cmt-count { flex: 1; font-size: 11px; color: var(--text-faint); }
      .cmt-send {
        border: 0; border-radius: 10px; padding: 8px 15px;
        font-size: 12px; font-weight: 800; font-family: inherit;
        background: var(--accent); color: #fff; cursor: pointer;
      }
      .cmt-send[disabled] {
        background: var(--surface-2); color: var(--text-faint);
        cursor: default; box-shadow: none;
      }
      /* 展开后评论区自己可以滑动，不用拖动整个弹窗。
         高度卡住，评论再多也只占这么大一块。
         「下拉加载更多」放在这个滚动区里面，滑到底才碰得到。 */
      .cmt-scroll {
        margin-top: 10px;
        max-height: min(46vh, 320px);
        overflow-y: auto; overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain; /* 滑到头了不要把滚动传给弹窗 */
        scrollbar-width: thin;
      }
      .cmt-scroll[hidden] { display: none; }
      .cmt-scroll::-webkit-scrollbar { width: 4px; }
      .cmt-scroll::-webkit-scrollbar-thumb {
        background: var(--border-strong); border-radius: 4px;
      }
      .cmt-list { display: flex; flex-direction: column; gap: 8px; }
      /* 评论区下拉：默认收起成一行，评论再多也不会把作品弹窗撑到关不掉。
         展开后如果还没显示完，底部给一个「下拉加载更多」。 */
      .cmt-fold {
        display: flex; align-items: center; gap: 7px; width: 100%;
        margin-top: 10px; padding: 9px 11px;
        border: 1px solid var(--border); background: var(--surface-2);
        border-radius: 11px; cursor: pointer;
        font-family: inherit; font-size: 12px; font-weight: 700; color: var(--text-muted);
        text-align: left;
      }
      .cmt-fold:active { background: var(--surface); }
      .cmt-fold-ico {
        font-size: 9px; line-height: 1; color: var(--text-faint);
        transition: transform .18s ease;
      }
      .cmt-fold[aria-expanded='true'] .cmt-fold-ico { transform: rotate(180deg); }
      .cmt-fold-num { margin-left: auto; font-size: 11px; font-weight: 400; color: var(--text-faint); }
      .cmt-more {
        display: block; width: 100%; margin-top: 2px; padding: 9px;
        border: 1px dashed var(--border-strong); background: transparent;
        border-radius: 11px; color: var(--text-faint);
        font-family: inherit; font-size: 12px; cursor: pointer;
      }
      .cmt-more:active { background: var(--surface-2); }
      .cmt-item {
        display: flex; gap: 8px; background: var(--surface-2);
        border-radius: 11px; padding: 8px 10px;
      }
      /* 自己的评论整条镜像到右边：头像在右、文字右对齐。
         全都靠左排在一起，分不清哪条是自己的，看着很乱。 */
      .cmt-item.mine {
        flex-direction: row-reverse;
        background: color-mix(in srgb, var(--accent) 9%, var(--surface-2));
      }
      .cmt-item.mine .cmt-main { text-align: right; }
      .cmt-item.mine .cmt-row { flex-direction: row-reverse; }
      .cmt-item.owner { background: color-mix(in srgb, var(--accent) 10%, var(--surface-2)); }
      .cmt-av {
        width: 24px; height: 24px; flex: 0 0 24px; border-radius: 7px; overflow: hidden;
        background: var(--surface); border: 1px solid var(--border-strong);
      }
      .cmt-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .cmt-main { flex: 1; min-width: 0; }
      .cmt-row { display: flex; align-items: baseline; gap: 6px; }
      .cmt-name { font-size: 12px; font-weight: 800; color: var(--text); }
      .cmt-name .mod-badge { font-size: 9px; padding: 0 5px; vertical-align: 1px; }
      .cmt-item.owner .cmt-name { color: var(--accent); }
      .cmt-time { font-size: 10px; color: var(--text-faint); }
      .cmt-row { display: flex; align-items: baseline; gap: 6px; }
      .cmt-del {
        margin-left: auto; border: 0; background: none; padding: 0;
        font-size: 11px; font-family: inherit; color: var(--text-faint); cursor: pointer;
        flex: none;
      }
      .cmt-item.mine .cmt-del { margin-left: 0; margin-right: auto; }
      .cmt-text {
        font-size: 13px; color: var(--text); line-height: 1.6;
        margin-top: 2px; word-break: break-word; white-space: pre-wrap;
      }
      .cmt-tip { font-size: 12px; color: var(--text-faint); text-align: center; padding: 14px 0; }

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
`,
  template: `<div class="container">
      <div class="header">
        <router-link class="back" to="/paint">← 返回画板</router-link>
        <div class="header-text">
          <h1>全部作品</h1>
          <div id="count">加载中…</div>
        </div>
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
          <span class="daily-title">⚡ 今日一题</span>
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
          <div class="author-id">
            <div class="author-av" id="authorAv"><span class="author-av-ph">?</span></div>
            <div class="author-id-txt">
              <span class="author-name" id="authorName"></span>
              <span class="author-bio" id="authorBio" hidden></span>
              <span class="author-count" id="authorCount"></span>
            </div>
          </div>
        </div>
        <div class="author-works" id="authorWorks"></div>
      </section>

      <section class="contest" id="contestPanel" hidden>
        <div class="contest-head">
          <span class="contest-title">🏆 本周大赛</span>
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


      <section class="discover" id="discover">
        <div class="discover-head">
          <div class="discover-text">
            <b>🔍 发现</b>
            <i>随机翻出一件旧作品，给被时间埋掉的好东西一次机会</i>
          </div>
          <button class="discover-btn" id="discoverBtn" type="button">掷一个</button>
        </div>
        <div class="discover-body" id="discoverBody">
          <div class="discover-empty">手气不错的话，能翻出别人埋在底下的老画</div>
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
        <div class="featured-sub" id="featuredSub">按收到的光尘排名 Top 5</div>
        <div class="featured-row" id="featuredRow"></div>
      </section>

      <div id="gallery" class="gallery-grid"></div>
      <div id="sentinel" class="status">加载中…</div>
      <div id="status" class="status" hidden></div>

      <div class="disclaimer">
        以下作品均来自全网上传。全部作品仅支持预览，不可载入作画，请尊重原作者，切勿抄袭或直接提交他人作品。
        本画板仅用于个人学习与技术交流，上传者须对自己发布的内容负全部法律责任。
        <div class="disclaimer-report">发现违规内容？请联系微信 Tux123233 或邮箱 linsifan123233@petalmail.com 举报。</div>
      </div>
      <div class="copyright">© 2026 像素小镇 · 版权所有 · 作者 Lin Sifan</div>
    </div>

    <div class="preview-overlay" id="previewOverlay" hidden>
      <!-- preview-box 支持往下一拖关闭：评论多的时候不用去够右上角的按钮 -->
      <div class="preview-box" id="previewBox">
        <div class="preview-grab" aria-hidden="true"></div>
        <div class="preview-head">
          <span class="preview-title" id="previewTitle">作品预览</span>
          <button class="preview-close" id="previewClose" type="button">关闭</button>
        </div>
        <div class="preview-body" id="previewBody">
        <!-- 画布单独包一层：这块要归「往下一拖关闭」的手势管。
             touch-action:none 是必须的 —— 评论区展开后弹窗本身可滚，
             浏览器会把纵向拖动当成原生滚动，抢走指针并发 pointercancel，
             结果就是按下去立刻被取消、怎么拖都关不掉。 -->
        <div class="preview-art" id="previewArt">
        <canvas id="previewCanvas" width="16" height="16" hidden></canvas>
        <img id="previewImg" alt="作品预览" draggable="false">
        </div>
        <div class="preview-info">
          <div class="preview-who">
            <span class="preview-av" id="previewAv"></span>
            <button class="preview-author-btn" id="previewAuthor" type="button"></button>
            <button class="preview-report" id="previewReportUser" type="button" hidden>🚩 举报该用户</button>
          </div>
          <div class="preview-bio" id="previewBio" hidden></div>
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
        <div class="cmt-box" id="cmtBox">
          <div class="cmt-head">
            <span class="cmt-title">💬 评论</span>
            <button class="lw-refresh" id="cmtRefresh" type="button" data-label="刷新"></button>
          </div>
          <textarea class="cmt-in" id="cmtInput" maxlength="200" rows="2"
                    placeholder="说点什么…（登录后才能评论）"></textarea>
          <div class="cmt-act">
            <span class="cmt-count" id="cmtCount"></span>
            <button class="cmt-send" id="cmtSend" type="button" disabled>发表</button>
          </div>
          <button class="cmt-fold" id="cmtFold" type="button" aria-expanded="false">
            <span class="cmt-fold-ico">▼</span>
            <span id="cmtFoldTx">展开评论</span>
            <span class="cmt-fold-num" id="cmtFoldNum"></span>
          </button>
          <div class="cmt-scroll" id="cmtScroll" hidden>
            <div class="cmt-list" id="cmtList"></div>
            <button class="cmt-more" id="cmtMore" type="button" hidden></button>
          </div>
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
        <div class="preview-note">仅支持预览，不可载入作画。请勿抄袭或直接提交他人的作品。对着画右键（手机长按）可以转发或保存。</div>
        </div>
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
    /* 首次进这页自动弹一次引导（看过就不再弹）。
       内容在 lw-guides.js，这里只声明「这页有引导」。 */
    try {
      if (window.LWGuides) window.LWGuides.auto('gallery', 1400)
    } catch (e) {}

      function workSize(rec) {
        const s = (rec && rec.size) || 0
        return s === 32 || s === 64 ? s : 16
      }

      /* 我是不是审核员。是的话卡片上会多一个「下架」按钮。
         不是审核员的人，接口直接返回 isMod:false，按钮根本不会生成。 */
      let isMod = false

      async function loadModState() {
        try {
          const t = localStorage.getItem('lw-token') || ''
          const res = await fetch('/api/mod', {
            headers: t ? { Authorization: 'Bearer ' + t } : {},
            cache: 'no-store',
          })
          const d = await res.json().catch(() => ({}))
          isMod = !!(d && d.isMod)
        } catch (e) {
          isMod = false
        }
      }

      /** 暂时下架一件作品。原因必填 —— 作者后台要照着它判断是否真删。 */
      async function doHideWork(rec) {
        const name = rec.workName || rec.name || '未命名'
        const why = await lwPrompt('下架「' + name + '」\n\n写一句原因（作者会看到，用来决定是否删除）：', '')
        if (why === null) return
        const reason = String(why || '').trim()
        if (!reason) {
          await lwAlert('原因不能空着，作者需要知道为什么被下架。')
          return
        }
        try {
          const t = localStorage.getItem('lw-token') || ''
          const res = await fetch('/api/mod', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
            body: JSON.stringify({ action: 'hide', time: rec.time, reason }),
          })
          const d = await res.json().catch(() => ({}))
          if (!d || !d.ok) {
            await lwAlert((d && d.error) || '下架失败')
            return
          }
          if (window.sfx) window.sfx('tick')
          await lwAlert('已下架「' + name + '」。\n作品不会被删除，作者会在后台看到并决定。')
          location.reload()
        } catch (e) {
          await lwAlert('网络错误')
        }
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
        if (!contestCtx || !contestCtx.week || !contestCtx.open) return false
        if (rec.contest !== contestCtx.week) return false
        // 像素相机作品不参赛，接口也会拒，这里先不给入口
        if (rec.fromImage) return false
        return true
      }

      /* 投票按钮的文案统一走这里。
         以前写的是 '🏆 ' + 票数，光看一个数字不像能点，
         也不知道点完算不算投了（用户反馈「没有投一票按钮」）。 */
      function voteLabel(rec, voted) {
        return (voted ? '🏆 已投票 · ' : '🏆 投一票 · ') + (Number(rec.contestVotes) || 0)
      }
      function makeVoteButton(rec) {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'vote-btn'
        const span = document.createElement('span')
        span.textContent = voteLabel(rec, contestCtx.voted.map(String).includes(String(rec.time)))
        btn.appendChild(span)
        // 相机作品不参赛，投票按钮置灰
        if (rec.fromImage) {
          btn.disabled = true
          btn.classList.add('no-vote')
          btn.title = '像素相机转出来的作品不参加主题赛'
          return btn
        }
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
            span.textContent = voteLabel(rec, true)
            btn.classList.add('voted')
            const pvBtn = document.getElementById('previewVoteBtn')
            if (currentPreview && String(currentPreview.time) === key && pvBtn) {
              pvBtn.textContent = voteLabel(rec, true)
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

            /* 这里原来只有一行「🏆 N 票」的纯文字，根本没法投票 ——
               makeVoteButton / voteContest 早就写好了（作品卡片和预览弹窗都在用），
               唯独比赛面板这张卡没接上（用户反馈「没有投一票按钮」）。
               现在把按钮挂上，并把 __rec 记上，refreshVoteChips 才认得它。 */
            const votes = document.createElement('div')
            votes.className = 'ct-votes'
            const vb = makeVoteButton(w)
            vb.__rec = w
            vb.hidden = !isCurrentContestEntry(w)
            votes.appendChild(vb)

            card.append(rank, img, nm, votes)
            card.addEventListener('click', () => preview(w))
            contestTop.appendChild(card)
          })
        }
        contestPanel.hidden = false
      }

      function refreshVoteChips() {
        document.querySelectorAll('.vote-btn').forEach((b) => {
          const rec = b.__rec
          if (rec && isCurrentContestEntry(rec)) {
            b.hidden = false
            const voted = contestCtx.voted.map(String).includes(String(rec.time))
            b.classList.toggle('voted', voted)
            const sp = b.querySelector('span')
            if (sp) sp.textContent = voteLabel(rec, voted)
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

      function buildMomentsCard(pixels, n, title, author, likes, tags, ownerUid) {
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

        // 作者：头像 + 「画师 xxx」居中成一组
        const tAuthor = author && author.trim() ? author.trim() : '匿名'
        const AV = 44 // 头像边长
        const label = '画师 ' + tAuthor
        ctx.font = '400 25px ' + FONT
        const labelW = ctx.measureText(label).width
        const gapAv = 12
        // 有头像时整组宽度 = 头像 + 间距 + 文字
        const avPx = ownerUid && window.LWAvatar ? window.LWAvatar.pixelsOf(ownerUid) : null
        const groupW = avPx ? AV + gapAv + labelW : labelW
        let gx = (W - groupW) / 2
        if (avPx) {
          const av = document.createElement('canvas')
          av.width = AV
          av.height = AV
          const actx = av.getContext('2d')
          actx.imageSmoothingEnabled = false
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const q = avPx[y * 16 + x]
              actx.fillStyle = 'rgb(' + q[0] + ',' + q[1] + ',' + q[2] + ')'
              actx.fillRect((x * AV) / 16, (y * AV) / 16, AV / 16 + 0.6, AV / 16 + 0.6)
            }
          }
          const ay = META_Y - 30
          ctx.save()
          roundRect(ctx, gx, ay, AV, AV, 12)
          ctx.clip()
          ctx.drawImage(av, gx, ay, AV, AV)
          ctx.restore()
          ctx.strokeStyle = 'rgba(43,38,32,.14)'
          ctx.lineWidth = 2
          roundRect(ctx, gx, ay, AV, AV, 12)
          ctx.stroke()
          gx += AV + gapAv
        }
        ctx.textAlign = 'left'
        ctx.fillStyle = muted
        ctx.fillText(label, gx, META_Y)
        ctx.textAlign = 'center'

        // 右侧收到的光尘（有才画）
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

      function openCard(pixels, n, title, author, likes, tags, ownerUid) {
        const dataURL = buildMomentsCard(pixels, n, title, author, likes, tags, ownerUid).toDataURL('image/png')
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
        // 像素相机转图的作品不支持送光尘，按钮直接置灰并说明原因，
        // 免得点了才弹一句看不懂的拒绝
        if (rec.fromImage) {
          /* 置灰但**不要**加 disabled：
             disabled 的按钮在手机上点下去没有任何反应，
             看起来就像坏了（用户反馈「按钮是暗的、就是点不了」）。
             保留可点，点了明确告诉他为什么不行。
             title 在手机上不显示，所以还把标识写进按钮文字里。 */
          btn.classList.add('no-dust')
          btn.title = '像素相机转出来的作品不支持收光尘，请给手绘作品送光尘'
          const sp0 = btn.querySelector('span')
          if (sp0) sp0.textContent = '🚫 ' + (rec.likes || 0)
        }
        updateLikedState(btn, rec.time)
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          if (btn.classList.contains('no-dust')) {
            toast('这幅是用像素相机转出来的照片，不支持收光尘\n请给手绘作品送光尘 ✏️')
            if (window.sfx) window.sfx('no')
            return
          }
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

      /* 赠送光尘：同一作品只能送一次，且要有余额。
         登录用户走服务端：扣分与记账在同一次请求里完成，不会出现「扣了没记上」。 */
      /* 赠送光尘：互动行为，必须登录。
         扣分与记账在服务端同一次请求内完成，不会出现「扣了没记上」。 */
      async function like(rec, btn) {
        const key = String(rec.time)
        if (!window.dust) return

        // 未登录：先引导登录，不做任何本地记账
        if (!window.dust.logged()) {
          toast('登录后才能送光尘')
          if (window.sfx) window.sfx('no')
          setTimeout(() => {
            location.href = '/login'
          }, 800)
          return
        }

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
          const d = await window.dust.giveRemote(rec.time)
          if (!d) {
            toast('赠送失败：网络错误')
            return
          }
          if (d.needLogin || d.code === 'noauth') {
            toast('登录状态已失效，请重新登录')
            setTimeout(() => {
              location.href = '/login'
            }, 800)
            return
          }
          if (!d.ok) {
            toast(d.error || '赠送失败')
            return
          }
          likedMap.add(key)
          saveLiked()
          if (window.sfx) window.sfx('like')
          rec.likes = Math.max(0, Number(d.likes) || 0)
          const sp = btn.querySelector('span')
          if (sp) sp.textContent = rec.likes
          updateLikedState(btn, rec.time)
          const pv = document.getElementById('previewLikeCount')
          if (pv) pv.textContent = rec.likes
          if (d.self) {
            // 送自己的画：服务端不再加计数，用它回传的值覆盖本地显示，
            // 免得本地先 +1 显示上去了、回头刷新又掉回去
            syncLikeEverywhere(rec.time, rec.likes, false)
            toast(d.message || '这是你自己的画，不能自己送光尘给自己')
            return
          }
          syncLikeEverywhere(rec.time, rec.likes, true)
          window.dispatchEvent(new CustomEvent('lw-dust-changed'))
          if (d.credited) {
            toast('送出了 ' + window.dust.cost + ' 个光尘 ✨ 对方也收到了，余额 ' + window.dust.balance())
          } else {
            toast('送出了 ' + window.dust.cost + ' 个光尘 ✨ 余额 ' + window.dust.balance())
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
        if (window.LWThumb) {
          window.LWThumb.draw(cv, pixels, size, { css: 76 })
          return
        }
        const n = size === 32 || size === 64 ? size : 16
        const c = cv.getContext('2d')
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
            discoverBody.innerHTML = '<div class="discover-empty">广场上还空着 —— 第一幅画等你来挂</div>'
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
          discoverBody.innerHTML = '<div class="discover-empty">网线好像不太稳，待会儿再试</div>'
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
              ? '按今日收到的光尘排名 Top 5'
              : featuredRange === 'week'
                ? '按本周收到的光尘排名 Top 5'
                : '按总收到的光尘排名 Top 5'
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
        // 先把卡片画出来（此时头像用默认的），再批量拉真头像回来重绘，
        // 这样不用等接口就能出内容
        const authorAvatars = []
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
          // 作者头像：有 uid 才有头像，老作品走默认头像
          if (rec.ownerUser && window.LWAvatar) {
            const ac = document.createElement('canvas')
            ac.className = 'card-av'
            ac.title = '作者头像'
            sub.appendChild(ac)
            window.LWAvatar.draw(ac, rec.ownerUser, 20)
            authorAvatars.push({ el: ac, uid: rec.ownerUser })
          }
          const au = document.createElement('span')
          au.className = 'card-author'
          au.textContent = rec.author || (rec.workName ? '匿名' : rec.name || '匿名')
          if (rec.author) {
            au.style.cursor = 'pointer'
            au.title = '查看 ' + rec.author + ' 的主页'
            au.addEventListener('click', (e) => {
              e.stopPropagation()
              gotoAuthor(rec)
            })
          }
          // 审核员勋章：作者是审核员就挂一枚，别人一眼看得出谁在管社区
          if (rec.isMod) {
            const mb = document.createElement('span')
            mb.className = 'mod-badge'
            mb.textContent = '🛡️ 审核员'
            mb.title = '社区审核员'
            sub.appendChild(mb)
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

            /* 审核员的「暂时下架」按钮，直接长在卡片上 —— 用户要求就在列表里审，
               不用再进后台。不是审核员的人根本不会走到这里。 */
            if (isMod) {
              const hb = document.createElement('button')
              hb.className = 'mod-hide'
              hb.type = 'button'
              hb.textContent = '🛡️ 下架'
              hb.title = '暂时不显示这件作品，交给作者决定是否删除'
              hb.addEventListener('click', (e) => {
                e.stopPropagation()
                e.preventDefault()
                doHideWork(rec)
              })
              card.appendChild(hb)
            }
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

        // 批量取作者头像，回来后重绘（默认头像先顶着，所以这一步不阻塞内容）
        if (authorAvatars.length && window.LWAvatar) {
          window.LWAvatar.loadForWorks(records, function () {
            for (const it of authorAvatars) {
              window.LWAvatar.draw(it.el, it.uid, 20)
            }
          })
        }
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
      const authorAv = document.getElementById('authorAv')
      const authorBio = document.getElementById('authorBio')
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
        sentinel.innerHTML = '<span class="lw-load"></span>加载中…'
        /* 先查身份再拉列表：审核员的卡片要多长一个「下架」按钮。
         查不到就当普通用户，不影响正常浏览。 */
      loadModState().then(loadMore)
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
        resetGallery('<span class="lw-load"></span>加载中…')
      })

      // 打开某位作者的主页
      // 作者主页的头像和简介。走 /api/profile，不阻塞作品列表
      async function loadAuthorProfile(name) {
        try {
          const res = await fetch('/api/profile?name=' + encodeURIComponent(name))
          const d = await res.json()
          if (!d.ok) return
          if (Array.isArray(d.avatar) && d.avatar.length && window.LWAvatar) {
            // 塞进头像缓存再画，和社区卡片同一套逻辑
            window.LWAvatar.put(d.uid, d.avatar)
            const c = document.createElement('canvas')
            authorAv.innerHTML = ''
            authorAv.appendChild(c)
            window.LWAvatar.draw(c, d.uid, 40)
          } else if (d.uid && window.LWAvatar) {
            // 没设过头像也给默认头像，别留空白
            const c = document.createElement('canvas')
            authorAv.innerHTML = ''
            authorAv.appendChild(c)
            window.LWAvatar.draw(c, d.uid, 40)
          }
          if (d.bio) {
            authorBio.textContent = d.bio
            authorBio.hidden = false
          }
          const s = d.stats || {}
          const bits = []
          if (s.works) bits.push(s.works + ' 件作品')
          if (s.likes) bits.push(s.likes + ' 个光尘')
          if (s.cells) bits.push('绘制 ' + s.cells + ' 格')
          if (bits.length) authorCount.textContent = bits.join(' · ')
        } catch (e) { /* 资料拿不到就只显示名字，不报错 */ }
      }

      /* 去某个人的主页。
         有 ownerUser（账号时代发布的）→ /u，能看到头像、简介、成就、关注按钮；
         没有（认领码时代的老作品）→ 退回原来那个只看作品的作者页。 */
      function gotoAuthor(rec) {
        const name = rec && rec.author
        if (!name) return
        if (rec.ownerUser && window.__lwRouter) {
          window.__lwRouter.push('/u?uid=' + encodeURIComponent(rec.ownerUser))
          return
        }
        openAuthor(name)
      }

      async function openAuthor(name) {
        searchAuthor = name
        searchQ = ''
        searchTag = ''
        searchInput.value = ''
        searchClear.hidden = true
        renderChips()
        authorPage.hidden = false
        authorName.textContent = name
        authorCount.textContent = ''
        authorBio.hidden = true
        authorBio.textContent = ''
        // 先摆一个占位字母，别让头像位置空着跳
        authorAv.innerHTML = '<span class="author-av-ph">' + (Array.from(name)[0] || '?') + '</span>'
        authorWorks.innerHTML = '<div class="status"><span class="lw-load"></span>加载中…</div>'
        // 头像和简介单独拉，失败也不影响作品列表
        loadAuthorProfile(name)
        try {
          const res = await fetch('/api/get?limit=60&author=' + encodeURIComponent(name))
          const data = await res.json()
          const list = data.history || []
          // 资料接口会给更详细的统计（收到的光尘、绘制格数）；它先到就别被作品数盖掉
          if (!authorCount.textContent) authorCount.textContent = list.length + ' 件作品'
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
        resetGallery('<span class="lw-load"></span>加载中…')
      })

      async function loadMore() {
        if (loading || done) return
        loading = true
        sentinel.innerHTML = '<span class="lw-load"></span>加载中…'
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
          if (window.sfx) window.sfx('select')
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

        /* 用色占比条：按比例横向铺开，一眼看出主色调是什么。
           比一串色块直观得多 —— 光看色块不知道哪个是主色。 */
        const total = list.reduce((a, e) => a + e[1], 0) || 1
        const bar = document.createElement('div')
        bar.className = 'pal-bar'
        bar.title = '用色占比'
        list.slice(0, 24).forEach(([hex, c]) => {
          const seg = document.createElement('i')
          seg.style.background = hex
          seg.style.flex = c + ' 0 0'
          seg.title = hex + ' ' + ((c / total) * 100).toFixed(1) + '%'
          bar.appendChild(seg)
        })
        palGrid.appendChild(bar)

        // 三个小结语，比只有色块有用
        const sum = document.createElement('div')
        sum.className = 'pal-sum'
        const top3 = list.slice(0, 3)
        const top3pct = ((top3.reduce((a, e) => a + e[1], 0) / total) * 100).toFixed(0)
        const kind = list.length <= 4 ? '极少色' : list.length <= 10 ? '克制' : list.length <= 24 ? '丰富' : '很杂'
        sum.innerHTML =
          '<span>主色 <b>' + top3[0][0] + '</b></span>' +
          '<span>前 3 色占 <b>' + top3pct + '%</b></span>' +
          '<span>用色 <b>' + kind + '</b></span>'
        palGrid.appendChild(sum)

        // 角标上带占比，和上面的条对应起来
        const nf = document.createElement('div')
        nf.className = 'pal-chips'
        list.forEach(([hex, cnt]) => {
          const chip = document.createElement('button')
          chip.type = 'button'
          chip.className = 'pal-chip'
          const pct = ((cnt / total) * 100).toFixed(1)
          chip.title = hex + '（用了 ' + cnt + ' 格，占 ' + pct + '%）· 点击复制'
          chip.innerHTML =
            '<i style="background:' + hex + '"></i><span>' + hex.slice(1) +
            '<em>' + pct + '%</em></span>'
          chip.addEventListener('click', () => copyHex(hex))
          nf.appendChild(chip)
        })
        palGrid.appendChild(nf)

        /* 逐个淡入，色号多的时候像在「铺开」 */
        try {
          if (window.LWAnim) window.LWAnim.stagger(nf)
        } catch (e) {}
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
            if (window.sfx) window.sfx('select')
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
        const authorName = rec.author || (rec.workName ? '匿名' : rec.name || '匿名')
        const authorBtn = document.getElementById('previewAuthor')
        authorBtn.textContent = '画师 ' + authorName + ' · ' + rs + '×' + rs
        // 有 uid 才能取头像、进主页、举报用户；老作品没有就退回去
        const avBox = document.getElementById('previewAv')
        const bioBox = document.getElementById('previewBio')
        const rptBtn = document.getElementById('previewReportUser')
        avBox.innerHTML = '<span class="author-av-ph">' + (Array.from(authorName)[0] || '?') + '</span>'
        bioBox.hidden = true
        bioBox.textContent = ''
        rptBtn.hidden = !rec.ownerUser
        rptBtn.onclick = null
        authorBtn.onclick = rec.author
          ? () => {
              closePreview()
              gotoAuthor(rec)
            }
          : null
        if (rec.ownerUser && window.LWAvatar) {
          const ac = document.createElement('canvas')
          avBox.innerHTML = ''
          avBox.appendChild(ac)
          window.LWAvatar.draw(ac, rec.ownerUser, 30)
        }
        if (rec.ownerUser) loadAuthorMini(rec.ownerUser, authorName, bioBox)
        document.getElementById('previewTime').textContent = formatTime(rec.time)
        document.getElementById('previewLikeCount').textContent = rec.likes || 0
        const pvLike = document.getElementById('previewLike')
        // 相机作品不给送光尘，预览里也要置灰
        if (rec.fromImage === true) {
          pvLike.disabled = false // 保持可点，点了给解释（见上面列表里的说明）
          pvLike.classList.add('no-dust')
          pvLike.title = '像素相机转出来的作品不支持收光尘，请给手绘作品送光尘'
          const pvSp = pvLike.querySelector('span')
          if (pvSp) pvSp.textContent = '🚫 ' + (rec.likes || 0)
        } else {
          pvLike.disabled = false
          pvLike.classList.remove('no-dust')
          pvLike.title = '送光尘给这幅画'
        }
        updateLikedState(pvLike, rec.time)
        currentPreview = rec
        closePalette()
        /* 照片转来的作品颜色非常多，色板没意义，直接隐藏入口 */
        if (palBtn) {
          const hidePal = rec.fromImage === true
          palBtn.hidden = hidePal
          if (hidePal && palBox) palBox.hidden = true
        }
        syncPreviewVoteBtn()
        // 打开作品时顺带加载评论（同一幅画有缓存就不重复请求）
        cmtWorkOwner = (rec && rec.ownerUser) || ''
        if (rec && rec.time) loadComments(Number(rec.time), false)
        previewOverlay.hidden = false
        /* 放大过渡：浮层弹入。
           ★ 只做浮层，不做「缩略图飞出去」那一半 ——
           preview(rec) 里没有卡片元素，而作品列表的卡片也没挂
           data-time（只有 Top5 那块挂了 likeTime）。
           为了半个转场去改列表渲染不值得，浮层弹入已经够用了。 */
        try {
          if (window.LWDeco) {
            window.LWDeco.overlayIn(previewOverlay.querySelector('.preview-box') || previewOverlay)
          }
        } catch (e) {}
      }

      function syncPreviewVoteBtn() {
        const pv = document.getElementById('previewVoteBtn')
        const rec = currentPreview
        if (!pv || !rec) return
        if (isCurrentContestEntry(rec)) {
          const voted = contestCtx.voted.map(String).includes(String(rec.time))
          pv.hidden = false
          pv.textContent = voteLabel(rec, voted)
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

      /* 预览弹窗里顺手带一下作者简介。拿不到就算了，不能挡住看作品。 */
      function loadAuthorMini(uid, name, box) {
        fetch('/api/profile?uid=' + encodeURIComponent(uid), { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (!d || !d.ok || !d.bio) return
            // 弹窗可能已经关了，或者已经翻到别的作品了
            if (!currentPreview || currentPreview.ownerUser !== uid) return
            box.textContent = d.bio
            box.hidden = false
          })
          .catch(() => {})
      }

      /* ---------- 评论 ----------
         拉取和发表都走 /api/comment。和其他页一致：切作品时才加载一次，
         同一幅画再打开直接用内存缓存，刷新靠「刷新」按钮。 */
      /* 这个视图一直没有 esc（别的视图才有），评论要拼 HTML，先补一个。
         注意别再插到 css 字符串里去 —— 那里也有一段同名注释。 */
      const esc = (s) =>
        String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
      const cmtBox = document.getElementById('cmtBox')
      const cmtList = document.getElementById('cmtList')
      const cmtInput = document.getElementById('cmtInput')
      const cmtSend = document.getElementById('cmtSend')
      const cmtCount = document.getElementById('cmtCount')
      const C = window.LWCache || {}
      let cmtWork = 0
      let cmtMyUid = '' // 服务端在读评论时顺便带回我的 uid，用来把「我说的」镜像到右边
      let cmtWorkOwner = '' // 当前这幅作品的作品作者 uid
      let cmtIMayDelete = false // 我是不是这幅作品的作品作者
      const cmtFold = document.getElementById('cmtFold')
      const cmtFoldTx = document.getElementById('cmtFoldTx')
      const cmtFoldNum = document.getElementById('cmtFoldNum')
      const cmtMore = document.getElementById('cmtMore')
      const cmtScroll = document.getElementById('cmtScroll')
      let cmtAll = [] // 这幅作品的全部评论
      let cmtOpen = false // 评论区是否已展开
      let cmtShown = 20 // 展开后先显示多少条（往下拉还能加载更多）
      const CMT_PAGE = 20

      /* 这条评论是不是我发的。
         uid 对得上最准；但如果读评论时还没登录 / 拿到的缓存里没有 myUid，
         就退回按用户名比 —— localStorage 里有登录名，一样能认出来。 */
      function isMyComment(c) {
        if (!c) return false
        if (cmtMyUid && c.uid && c.uid === cmtMyUid) return true
        let name = ''
        try {
          name = localStorage.getItem('lw-user') || ''
        } catch (e) {}
        return !!(name && c.name === name)
      }

      function cmtToken() {
        try {
          return localStorage.getItem('lw-token') || ''
        } catch (e) {
          return ''
        }
      }
      const cmtFmt = (t) => {
        const d = Date.now() - (Number(t) || 0)
        if (d < 60000) return '刚刚'
        if (d < 3600000) return Math.floor(d / 60000) + ' 分钟前'
        if (d < 86400000) return Math.floor(d / 3600000) + ' 小时前'
        if (d < 86400000 * 30) return Math.floor(d / 86400000) + ' 天前'
        return new Date(Number(t)).toLocaleDateString('zh-CN')
      }

      function renderComments(d) {
        if (!d || !d.ok) {
          cmtList.innerHTML = '<div class="cmt-tip">评论读取失败</div>'
          return
        }
        if (d.myUid) cmtMyUid = d.myUid
        // 我是不是这幅作品的作品作者：是的话，别人留的评论我也能删
        const myName = (function () {
          try {
            return localStorage.getItem('lw-user') || ''
          } catch (e) {
            return ''
          }
        })()
        cmtIMayDelete = !!(cmtWorkOwner && myName && cmtWorkOwner === myName)
        const items = d.items || []
        cmtAll = items
        paintCmtList()
      }

      /* 画评论区。分两件事：
         · 下拉展开/收起：默认收起成一行，评论再多也不会把弹窗撑到关不掉
         · 展开后内部可以滑动，一次只铺 CMT_PAGE 条，底部还有「下拉加载更多」 */
      function paintCmtList() {
        const n = cmtAll.length
        cmtCount.textContent = n ? n + ' 条评论' : ''
        cmtFoldNum.textContent = n ? n + ' 条' : ''
        cmtFoldTx.textContent = cmtOpen ? '收起评论' : n ? '展开评论' : '还没有评论'
        cmtFold.setAttribute('aria-expanded', cmtOpen ? 'true' : 'false')
        cmtScroll.hidden = !cmtOpen
        if (!n) {
          cmtMore.hidden = true
          if (cmtOpen) cmtList.innerHTML = '<div class="cmt-tip">还没有人评论，来说第一句吧</div>'
          return
        }
        // 取最新的一段：评论按时间正序存的，新的在最后
        const from = Math.max(0, n - cmtShown)
        const page = cmtAll.slice(from)
        const left = from
        cmtMore.hidden = left <= 0
        cmtMore.textContent = '↓ 下拉加载更多（还有 ' + left + ' 条）'
        cmtMore.dataset.left = String(left)
        paintOne(page)
      }

      /* 把给定的一批评论画进列表（只管画，不发请求、不管分页）。 */
      function paintOne(list) {
        // 包一层 try：渲染评论用的是拼 HTML 的写法，一个字段对不上就会抛，
        // 而这里在 Promise 里，抛了也不会冒到页面上，只出现「评论区空白」
        try {
        cmtList.innerHTML = list
          .map((c) => {
            const isMine = isMyComment(c)
            /* 「（作者）」标签同样按事实算：这幅作品现在的作者是谁，
               而不是评论里那个可能过时的快照。 */
            const isAuthor = !!(cmtWorkOwner && c.uid && c.uid === cmtWorkOwner)
            /* 能不能删，按「现在的身份」算，不看评论上那个 owner 标记 ——
               那个标记是发评论那一刻的快照：作品作者后来才关注/回关的话，
               他在别人评论上也该有删除键；反过来我给别人当作者的旧评论
               也该能删。现在的问题是两边都算错：删别人的点了没反应，
               删自己的又根本没按钮。 */
            const canDel = isMine || cmtIMayDelete
            return (
              '<div class="cmt-item' + (isAuthor ? ' owner' : '') + (isMine ? ' mine' : '') + '">' +
              '<span class="cmt-av" data-uid="' + esc(c.uid) + '"></span>' +
              '<span class="cmt-main">' +
              '<span class="cmt-row">' +
              '<span class="cmt-name">' + esc(c.name) + (c.isMod ? ' <span class="mod-badge">🛡️ 审核员</span>' : '') + (isAuthor ? '（作者）' : '') + '</span>' +
              '<span class="cmt-time">' + esc(cmtFmt(c.at)) + '</span>' +
              (canDel ? '<button class="cmt-del" data-del="' + esc(c.id) + '" type="button">删除</button>' : '') +
              '</span>' +
              '<span class="cmt-text">' + esc(c.text) + '</span>' +
              '</span></div>'
            )
          })
          .join('')
        } catch (e) {
          console.error('[comment] 渲染失败', e)
          cmtList.innerHTML = '<div class="cmt-tip">评论显示不出来，请刷新试试</div>'
        }
        // 头像
        cmtList.querySelectorAll('.cmt-av[data-uid]').forEach((el) => {
          const uid = el.getAttribute('data-uid')
          if (!uid || !window.LWAvatar) return
          const c = document.createElement('canvas')
          el.appendChild(c)
          window.LWAvatar.draw(c, uid, 24)
        })
        // 预取所有评论者的头像，回来时重绘一次
        if (window.LWAvatar && window.LWAvatar.load) {
          const uids = [...new Set(list.map((c) => c.uid).filter(Boolean))]
          if (uids.length) {
            window.LWAvatar.load(uids).then(() => {
              cmtList.querySelectorAll('.cmt-av[data-uid]').forEach((el) => {
                const c = el.querySelector('canvas')
                if (c) window.LWAvatar.draw(c, el.getAttribute('data-uid'), 24)
              })
            }).catch(() => {})
          }
        }
        // 删除
        cmtList.querySelectorAll('[data-del]').forEach((b) => {
          b.addEventListener('click', async () => {
            const id = b.getAttribute('data-del')
            if (!(await lwConfirm('确定删掉这条评论吗？'))) return
            const t = cmtToken()
            if (!t) {
              toast('请先登录')
              return
            }
            b.disabled = true
            try {
              const res = await fetch('/api/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
                body: JSON.stringify({ action: 'del', id, work: cmtWork }),
              })
              const d2 = await res.json().catch(() => ({}))
              if (!res.ok || !d2 || !d2.ok) {
                toast((d2 && d2.error) || '删除失败')
                b.disabled = false
                return
              }
              if (window.sfx) window.sfx('close')
              C.drop('cmt:' + cmtWork)
              loadComments(cmtWork, true)
            } catch (e) {
              toast('删除失败：' + ((e && e.message) || '网络错误'))
              b.disabled = false
            }
          })
        })
      } // paintOne

      /* 下拉展开/收起 */
      if (cmtFold) {
        cmtFold.addEventListener('click', () => {
          cmtOpen = !cmtOpen
          if (cmtOpen && window.sfx) window.sfx('tap')
          paintCmtList()
          if (cmtOpen) {
            // 展开后把最新的评论露出来，别让人以为没加载
            cmtScroll.scrollTop = cmtScroll.scrollHeight
          }
        })
      }
      /* 下拉加载更多：一次再铺 CMT_PAGE 条 */
      if (cmtMore) {
        cmtMore.addEventListener('click', () => {
          cmtShown += CMT_PAGE
          paintCmtList()
          if (window.sfx) window.sfx('tap')
        })
      }

      async function loadComments(work, force) {
        cmtWork = work
        const key = 'cmt:' + work
        cmtMyUid = ''
        if (force) C.drop(key)
        const t = cmtToken()
        const head = t ? { Authorization: 'Bearer ' + t } : {}
        if (!force) {
          const hit = C.cached(key, () => {
            fetch('/api/comment?work=' + work, { headers: head, cache: 'no-store' })
              .then((r) => r.json())
              .then((d) => {
                C.put(key, d)
                if (cmtWork === work) renderComments(d)
              })
              .catch(() => {})
          })
          if (!hit) {
            const d = C.get(key)
            if (d) renderComments(d)
          }
        } else {
          try {
            const r = await fetch('/api/comment?work=' + work, { headers: head, cache: 'no-store' })
            const d = await r.json()
            C.put(key, d)
            if (cmtWork === work) renderComments(d)
          } catch (e) {
            cmtList.innerHTML = '<div class="cmt-tip">读取失败：' + esc((e && e.message) || '网络错误') + '</div>'
          }
        }
        // 输入框状态
        const has = !!t
        cmtInput.disabled = !has
        cmtInput.placeholder = has ? '说点什么…' : '说点什么…（登录后才能评论）'
        // 没登录、或者还没打字，发送按钮都该是灰的。
        // 之前只判了「有没有登录」，登录后空着框也能点，点了才被服务端拒。
        cmtSend.disabled = !has || !cmtInput.value.trim()
      }

      // 有字才能点
      if (cmtInput) {
        cmtInput.addEventListener('input', () => {
          cmtSend.disabled = !cmtInput.value.trim() || !cmtToken()
        })
        cmtInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendComment()
        })
      }
      async function sendComment() {
        const t = cmtToken()
        if (!t) {
          toast('登录后才能评论')
          return
        }
        const text = cmtInput.value.trim()
        if (!text) return
        cmtSend.disabled = true
        cmtSend.textContent = '发送中…'
        try {
          const res = await fetch('/api/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
            body: JSON.stringify({ action: 'add', work: cmtWork, text }),
          })
          const d = await res.json().catch(() => ({}))
          if (!res.ok || !d || !d.ok) {
            toast((d && d.error) || '发表失败')
            return
          }
          cmtInput.value = ''
          if (window.sfx) window.sfx('send')
          /* 自己刚发的那条一定要看得见：把评论区展开，
             并把显示条数拉到足够包含最新一条，否则新评论留在「还没加载」里。 */
          cmtOpen = true
          cmtShown = Math.max(cmtShown, cmtAll.length + 1)
          C.drop('cmt:' + cmtWork)
          await loadComments(cmtWork, true)
          /* 自己刚发的那条要真的看得见。
             光把评论列表滚到底不够 —— 评论区本身在弹窗里可能也在屏幕下面，
             内外两层都得滚，否则发完还是「不知道发出去了没有」。 */
          try {
            cmtScroll.scrollTop = cmtScroll.scrollHeight
            const body = document.getElementById('previewBody')
            if (body) body.scrollTop = body.scrollHeight
            const last = cmtList.lastElementChild
            if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest' })
          } catch (e) {}
        } catch (e) {
          toast('发表失败：' + ((e && e.message) || '网络错误'))
        } finally {
          cmtSend.textContent = '发表'
          cmtSend.disabled = !cmtInput.value.trim() || !t
        }
      }
      if (cmtSend) cmtSend.addEventListener('click', sendComment)
      if (cmtBox) {
        C.bindRefresh(
          document.getElementById('cmtRefresh'),
          () => loadComments(cmtWork, true),
          () => {},
          true
        )
      }

      function closePreview() {
        if (window.sfx) window.sfx('close')
        if (cmtInput) cmtInput.value = ''
        stopAnimPlay()
        previewOverlay.hidden = true
        currentPreview = null
        const box = document.getElementById('previewBox')
        if (box) {
          box.classList.remove('swiping')
          box.style.transform = ''
        }
      }

      /* 预览弹窗往下一拖就关。
         为什么要手势：评论一多，弹窗内容很长，「关闭」按钮会跟着滚出屏幕
         （反馈是「评论 3 个就关不掉作品」）。头部已改成吸顶，这里再加手势，
         两种方式都留着。 */
      ;(function bindSwipeDown() {
        const box = document.getElementById('previewBox')
        if (!box) return
        let startY = 0
        let startX = 0
        let dy = 0
        let tracking = false
        const reset = () => {
          tracking = false
          dy = 0
          box.classList.remove('swiping')
          box.style.transform = ''
        }
        box.addEventListener(
          'pointerdown',
          (e) => {
            // 只响应单指；多点触控是缩放，别抢
            if (e.isPrimary === false) return
            // 从输入框/按钮起手的交给它们自己处理
            const t = e.target
            /* 这几块上的按下要阻止默认行为：
               <img> 默认可以被按住拖动，浏览器会启动原生拖放，
               随即发 pointercancel 把我们的手势掐掉（表现为怎么拖都关不掉）。
               必须在非 passive 监听里 preventDefault 才有效。
               .preview-body 背景不能拦 —— 那里要留着正常滚动。 */
            if (t && t.closest && t.closest('#previewArt, .preview-grab, .preview-head')) {
              if (e.cancelable) e.preventDefault()
            }
            /* 从这些地方起手的拖动不算「下滑关闭」：
           输入框要能选字、评论和色板要能上下滑动。
           .cmt-scroll 是评论的滚动容器，必须一起排掉 ——
           少了它，在评论区里往下滑会直接把作品弹窗关掉。 */
        /* 注意别把 .preview-body 整个排掉：画布（.preview-card）在它里面，
           排掉以后从画布往下一拖就关不掉了。
           只排真正需要自己滑动的地方：评论区滚动区和色板。 */
        if (t && t.closest && t.closest('input, textarea, button, .cmt-list, .cmt-scroll, .pal-box')) return
            startY = e.clientY
            startX = e.clientX
            dy = 0
            tracking = true
            box.classList.add('swiping')
            /* 把指针抓在自己身上：不然浏览器一旦开始原生滚动就会发
               pointercancel，end() 立刻把状态清掉，拖动等于没发生。 */
            try {
              if (box.setPointerCapture && e.pointerId != null) box.setPointerCapture(e.pointerId)
            } catch (err) {}
          },
          { passive: false }
        )
        box.addEventListener(
          'pointermove',
          (e) => {
            if (!tracking) return
            const my = e.clientY - startY
            const mx = e.clientX - startX
            // 横向移动更多就当是划页，不做关闭手势
            if (Math.abs(mx) > Math.abs(my) && Math.abs(mx) > 12) {
              reset()
              return
            }
            if (my <= 0) return
            dy = my
            // 阻尼：拖得越远越沉，手感更像真的弹层
            box.style.transform = 'translateY(' + Math.round(dy * 0.85) + 'px)'
          },
          { passive: true }
        )
        const end = (e) => {
          if (!tracking) return
          try {
            if (e && e.pointerId != null && box.releasePointerCapture) box.releasePointerCapture(e.pointerId)
          } catch (err) {}
          const h = box.getBoundingClientRect().height || 1
          // 拖过 1/4 高度，或者速度够快（dy 已经很大）就关
          if (dy > h * 0.25 || dy > 160) {
            box.style.transform = 'translateY(' + h + 'px)'
            closePreview()
            if (window.sfx) window.sfx('close')
            // 等动画走完再复位，不然下次打开会带着位移
            setTimeout(reset, 200)
            return
          }
          reset()
        }
        box.addEventListener('pointerup', end)
        box.addEventListener('pointercancel', end)
        /* 故意不监听 pointerleave：
           拖动时弹窗跟着手指往下移，指针会立刻「离开」自己所在的元素，
           一旦在这里 end()，状态就被清掉、transform 复位，
           表现为「怎么拖都关不掉、还会自己弹回去」。
           有了 setPointerCapture，pointerup 一定会送到 box 上，够用了。 */
      })()

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
      let reportKind = 'work' // 'work' | 'user'
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
          if (window.sfx) window.sfx('open')
          if (reportNote) reportNote.value = ''
          reportReasons.querySelectorAll('.report-reason').forEach((b, i) =>
            b.classList.toggle('on', i === 0)
          )
          reportReason = '违法违规'
          reportKind = 'work'
          const tt = document.querySelector('#reportOverlay .card-title')
          if (tt) tt.textContent = '举报作品'
          reportOverlay.hidden = false
        }, HOLD_MS)
      }

      /* 举报用户：复用举报作品的弹窗，只是提交时 target 换成 user。
         长按举报是「举报这幅作品」，这里是「举报这个人」，两回事。 */
      const reportUserBtn = document.getElementById('previewReportUser')
      function openUserReport(rec) {
        if (!rec || !rec.ownerUser) {
          toast('这幅作品没有可举报的账号')
          return
        }
        reportKind = 'user'
        reportTarget = rec
        const t = document.querySelector('#reportOverlay .card-title')
        if (t) t.textContent = '举报用户'
        if (reportNote) reportNote.value = ''
        reportReasons.querySelectorAll('.report-reason').forEach((b, i) =>
          b.classList.toggle('on', i === 0)
        )
        reportReason = '违法违规'
        reportOverlay.hidden = false
      }
      if (reportUserBtn) {
        reportUserBtn.addEventListener('click', () => {
          if (window.sfx) window.sfx('tap')
          openUserReport(currentPreview)
        })
      }

      /* 举报作品：菜单里点「举报这幅画」直接开弹窗。
         原来只有长按 1.5 秒那一条路（防误触），但在菜单里点是有意为之的
         ——手指已经停了半秒、还专门选了这一项，再要求长按一遍纯属折磨。 */
      function openWorkReport(rec) {
        if (!rec) return
        reportKind = 'work'
        reportTarget = rec
        if (reportNote) reportNote.value = ''
        reportReasons.querySelectorAll('.report-reason').forEach((b, i) =>
          b.classList.toggle('on', i === 0)
        )
        reportReason = '违法违规'
        const tt = document.querySelector('#reportOverlay .card-title')
        if (tt) tt.textContent = '举报作品'
        reportOverlay.hidden = false
      }

      /* 作品菜单：对着画右键（桌面）或长按（手机）就弹出来，
         跟微信里长按图片弹「转发/收藏/保存」是同一套手势。 */
      if (window.LWWorkMenu) {
        const art = document.getElementById('previewArt')
        window.LWWorkMenu.bind(art, {
          selector: '#previewArt',
          getInfo() {
            const rec = currentPreview
            if (!rec) return null
            return {
              time: rec.time,
              title: rec.workName || rec.name || '未命名',
              author: rec.author || (rec.workName ? '匿名' : rec.name || '匿名'),
              work: rec,
              onCard() {
                openCard(
                  rec.pixels,
                  workSize(rec),
                  rec.workName || rec.name || '未命名',
                  rec.author || '匿名',
                  rec.likes || 0,
                  rec.tags,
                  rec.ownerUser || ''
                )
              },
              onReport: () => openWorkReport(rec),
            }
          },
        })
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
            body: JSON.stringify(
              reportKind === 'user'
                ? {
                    target: 'user',
                    uid: rec.ownerUser,
                    name: rec.author || '',
                    reason: reportReason,
                    note: reportNote ? reportNote.value : '',
                  }
                : {
                    time: rec.time,
                    reason: reportReason,
                    note: reportNote ? reportNote.value : '',
                    title: rec.workName || rec.name || '',
                    author: rec.author || '',
                  }
            ),
          })
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            reportOverlay.hidden = true
            toast(reportKind === 'user' ? '举报已提交，感谢你的反馈' : '举报已提交，感谢你的反馈')
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
        // 相机作品：按钮是灰的，但点了要说明原因，不能让人以为坏了
        if (btn.classList.contains('no-dust')) {
          toast('这幅是用像素相机转出来的照片，不支持收光尘\n请给手绘作品送光尘 ✏️')
          if (window.sfx) window.sfx('no')
          return
        }
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
          currentPreview.tags,
          currentPreview.ownerUser || ''
        )
      })

      document.getElementById('previewShare').addEventListener('click', () => {
        if (!currentPreview) return
        const url = location.origin + '/gallery?t=' + currentPreview.time
        const btn = document.getElementById('previewShare')
        const done = () => {
          if (window.sfx) window.sfx('select')
          btn.textContent = '✓ 已复制'
          btn.classList.add('copied')
          setTimeout(() => {
            btn.textContent = '🔗 复制链接'
            btn.classList.remove('copied')
          }, 1800)
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(() => {
            // 拿不到剪贴板权限：把链接摆出来让人手动复制。结果不参与后续逻辑，不用 await
            lwPrompt('复制链接', url)
            done()
          })
        } else {
          lwPrompt('复制链接', url)
          done()
        }
      })
  },
}
