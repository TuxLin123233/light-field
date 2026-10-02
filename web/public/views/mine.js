// 我的：签到 + 创作数据 + 我的作品
// 身份就是登录账号（令牌），作品归属靠账号 uid。
export default {
  title: '我的',
  css: `
      .mine-wrap { width: 100%; max-width: 460px; }

      .m-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 14px;
      }
      .m-card-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 12px;
      }
      .m-card-title .m-tip {
        margin-left: auto;
        font-size: 11px;
        font-weight: 500;
        color: var(--text-faint);
      }

      /* ---------- 签到 ---------- */
      .dust-got {
        margin-left: auto;
        font-size: 11px;
        color: var(--text-faint);
        flex: none;
      }
      .dust-bar {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 13px;
        padding: 10px 13px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--accent) 10%, var(--surface-2));
        border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
      }
      .dust-ico { font-size: 15px; }
      .dust-label { font-size: 13px; color: var(--text-muted); }
      .dust-num {
        margin-left: auto;
        font-size: 20px;
        font-weight: 800;
        color: var(--accent);
        font-variant-numeric: tabular-nums;
      }
      .dust-num small { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-left: 3px; }

      .sign-top {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .sign-streak { display: flex; flex-direction: column; gap: 2px; }
      .sign-num {
        font-size: 30px;
        font-weight: 800;
        line-height: 1.1;
        color: var(--text);
        font-variant-numeric: tabular-nums;
      }
      .sign-num small { font-size: 13px; font-weight: 600; color: var(--text-muted); }
      .sign-sub { font-size: 11px; color: var(--text-faint); }
      .sign-btn {
        margin-left: auto;
        flex-shrink: 0;
        padding: 11px 20px;
        border-radius: 999px;
        border: none;
        background: var(--accent);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.12s ease;
      }
      .sign-btn:active { transform: scale(0.94); }
      .sign-btn.done {
        background: var(--surface-2);
        color: var(--text-faint);
        cursor: default;
      }

      .sign-week {
        display: flex;
        justify-content: space-between;
        gap: 4px;
        margin-top: 14px;
      }
      .sign-day {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .sign-dot {
        width: 100%;
        aspect-ratio: 1;
        max-width: 34px;
        border-radius: 10px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: var(--text-faint);
      }
      .sign-dot.on {
        background: color-mix(in srgb, var(--accent) 22%, var(--surface));
        border-color: var(--accent);
        color: var(--accent);
      }
      .sign-dot.today { box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent); }
      .sign-lab { font-size: 10px; color: var(--text-faint); }

      .medals {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 13px;
        padding-top: 13px;
        border-top: 1px solid var(--border);
      }
      .medal {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 999px;
        font-size: 12px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        color: var(--text-faint);
      }
      .medal.got {
        background: color-mix(in srgb, var(--accent) 16%, var(--surface));
        border-color: var(--accent);
        color: var(--accent);
        font-weight: 600;
      }

      /* ---------- 创作数据 ---------- */
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
        gap: 9px;
      }
      .stat {
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 13px;
        padding: 12px 10px;
        text-align: center;
      }
      .stat-num {
        font-size: 20px;
        font-weight: 800;
        color: var(--text);
        line-height: 1.2;
        font-variant-numeric: tabular-nums;
      }
      .stat-num small { font-size: 11px; font-weight: 600; color: var(--text-muted); }
      .stat-lab { font-size: 11px; color: var(--text-muted); margin-top: 3px; }

      .size-bars { margin-top: 13px; }
      .size-bar {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 7px;
        font-size: 12px;
        color: var(--text-muted);
      }
      .size-bar .sb-lab { width: 46px; flex-shrink: 0; }
      /* span 默认是 inline，不加 display:block 的话高度/宽度都不生效，进度条会看不见 */
      .size-bar .sb-track {
        display: block;
        flex: 1;
        height: 8px;
        border-radius: 999px;
        background: var(--surface-3);
        overflow: hidden;
      }
      .size-bar .sb-fill {
        display: block;
        height: 100%;
        min-width: 0;
        border-radius: 999px;
        background: var(--accent);
        transition: width 0.3s ease;
      }
      .size-bar .sb-num { width: 26px; text-align: right; flex-shrink: 0; color: var(--text-faint); }

      .best-work {
        margin-top: 13px;
        padding-top: 13px;
        border-top: 1px solid var(--border);
        font-size: 12px;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .best-work b { color: var(--text); }

      /* ---------- 我的作品 ---------- */
      .mine-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
        gap: 10px;
      }
      /* 「⋯」按钮（绝对定位，贴卡片右上角）。
       原来这里是靠长按弹菜单，滑动时手指一停就误触，所以改成显式按钮。
       定位上下文用 .mine-item 自带的 position: relative，不用重复声明。 */
    .mine-more {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 26px;
      height: 26px;
      border: 0;
      border-radius: 50%;
      background: rgba(60, 48, 36, .55);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0 6px;
      z-index: 2;
      -webkit-tap-highlight-color: transparent;
    }
    .mine-more:active { background: rgba(60, 48, 36, .8); }

    .mine-item {
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        position: relative; /* 「⋯」按钮要贴着卡片右上角 */
      }
      /* 缩略图。LWThumb 会按整数倍缩放并水平居中，
         这里不写死 width:100% —— 那样会把整数倍缩放的好处（不切出白条纹）毁掉，
         宽高由 LWThumb 写内联，margin:auto 保证居中。 */
      .mine-item canvas {
        display: block;
        margin: 0 auto;
        image-rendering: pixelated;
        background: var(--art-bg);
        max-width: 100%;
      }
      /* 作品卡片标题。
         之前是 white-space:nowrap + overflow:hidden：文字比卡片宽时
         text-align:center 会从两边同时裁掉，看上去就是「贴着左边」，
         其实并没居中。改成最多两行 + 省略号，长短都能真正居中。 */
      /* 作品卡片标题：竖排两段 —— 标题最多两行，光尘徽标单独一行。
         之前徽标跟在标题后面，长标题被两行截断时正好把徽标切一半。 */
      .mine-cap {
        padding: 6px 7px;
        font-size: 11px;
        line-height: 1.45;
        color: var(--text-muted);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        min-height: 34px;
      }
      .mc-title {
        max-width: 100%;
        overflow: hidden;
        word-break: break-word;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      /* 收到的光尘单独一个徽标，粘在标题后面会让整行的重心看着偏 */
      .mc-dust {
        flex: none;
        padding: 0 6px;
        border-radius: 999px;
        background: var(--surface);
        border: 1px solid var(--border-input);
        color: var(--text-faint);
        font-size: 10px;
        font-weight: 700;
        line-height: 16px;
        white-space: nowrap;
      }

      .m-empty {
        text-align: center;
        font-size: 13px;
        color: var(--text-faint);
        padding: 20px 10px;
        line-height: 1.9;
      }
      .m-empty a { color: var(--accent); }

      .back-bar {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        margin-bottom: 12px;
        padding: 8px 15px;
        border-radius: 999px;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text-muted);
        font-size: 13px;
        text-decoration: none;
      }
      /* 入口从 7 个挤成一行会溢出（作品/送出/信箱/排行榜/每日任务/成就），
         手机宽度下每个只剩 40px 出头，文字被压得换行。
         改成 4 列 × 2 行的网格，格子宽度固定，正好两行，不再溢出。 */
      .m-links {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      button.m-link { font-family: inherit; cursor: pointer; }

      /* 屏蔽手机上的长按菜单/选中/拖放：
         不加这些，按住画布超过半秒浏览器会启动自己的长按行为，
         我们的作品菜单就抢不到了（它的系统菜单是浏览器级弹层，
         弹出来会盖在我们的菜单上面）。 */
      .mine-item {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .mine-item canvas, .mine-item .mine-cap { -webkit-touch-callout: none; user-select: none; }
      .mine-del-tip {
        font-size: 11px; color: var(--text-faint);
        margin: -2px 0 8px;
      }
      .mine-filter {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .mf-label { font-size: 12px; color: var(--text-faint); flex-shrink: 0; }
      .mf-chips { display: flex; flex-wrap: wrap; gap: 7px; }
      .mf-chip {
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text-muted);
        font-size: 12px;
        cursor: pointer;
      }
      .mf-chip.on {
        border-color: var(--accent);
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 12%, var(--surface));
        font-weight: 600;
      }
      /* 件数徽标：跟尺寸文字用不同字重和底色，避免和「16」混在一起看 */
      .mf-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: inherit;
      }
      .mf-lab { font-weight: 600; }
      .mf-n {
        min-width: 20px;
        padding: 1px 6px;
        border-radius: 999px;
        background: var(--surface);
        border: 1px solid var(--border-input);
        color: var(--text-faint);
        font-size: 11px;
        font-weight: 700;
        line-height: 1.5;
        text-align: center;
      }
      .mf-chip.on .mf-n {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }
      .mine-load {
        width: 100%;
        margin-top: 12px;
        padding: 11px;
        border-radius: 12px;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .m-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 13px 6px;
        min-width: 0;
        border-radius: 13px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        text-decoration: none;
        color: var(--text);
        font-size: 12px;
      }
      .m-link .ml-ico { font-size: 18px; }
      .m-link .ml-num { font-size: 14px; font-weight: 800; color: var(--accent); line-height: 1.3; }
      /* 4 列时格子更窄，字号跟着收一档，避免「每日任务」这类四字标签换行 */
      .m-link span:not(.ml-ico):not(.ml-num) { font-size: 11px; white-space: nowrap; }

      /* 头部：头像 + 用户名，整体水平居中 */
      .me-hero {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        padding: 6px 0 16px;
      }
      .me-av {
        position: relative;
        flex: none;
        display: block;
        width: 72px;
        height: 72px;
        text-decoration: none;
      }
      .me-av canvas {
        display: block;
        width: 72px;
        height: 72px;
        border-radius: 20px;
        border: 2px solid var(--border);
        image-rendering: pixelated;
        background: var(--surface-2);
        box-shadow: 0 3px 12px var(--shadow2, rgba(0, 0, 0, 0.08));
      }
      .me-av-edit {
        position: absolute;
        right: -5px;
        bottom: -5px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--accent, #5b8def);
        font-size: 12px;
        line-height: 24px;
        text-align: center;
        border: 2.5px solid var(--surface);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
      }
      .me-hero-txt {
        min-width: 0;
        text-align: left;
      }
      .me-hero-name {
        font-size: 20px;
        font-weight: 800;
        color: var(--text);
        line-height: 1.3;
        margin: 0;
        max-width: 46vw;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .me-hero-name.guest { color: var(--text-muted2); font-weight: 700; }
      .me-hero-sub {
        font-size: 12px;
        color: var(--text-faint);
        line-height: 1.5;
        margin-top: 3px;
      }
      .me-hero-bio {
        font-size: 12.5px;
        color: var(--text-muted);
        line-height: 1.55;
        margin-top: 4px;
        max-width: 46vw;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-decoration: underline dotted;
        text-underline-offset: 3px;
      }
      .me-hero-bio.empty { color: var(--text-faint); }
  `,
  template: `<div class="container mine-wrap">
    <div class="me-hero">
      <router-link class="me-av" to="/avatar" id="meAv" title="画头像">
        <canvas id="meAvCanvas"></canvas>
        <span class="me-av-edit">✏️</span>
      </router-link>
      <div class="me-hero-txt">
        <h1 class="me-hero-name" id="meName">未登录</h1>
        <div class="me-hero-bio" id="meBio">点此写简介</div>
        <div class="me-hero-sub" id="meHeroSub">登录后同步光尘与成就</div>
      </div>
    </div>

    <router-link class="back-bar" id="mineBack" to="/mine" hidden>← 返回我的</router-link>

    <!-- 签到 -->
    <div class="m-card" id="signCard">
      <div class="m-card-title">📅 今日报到<span class="m-tip" id="signTip">存在本机 · 登录可同步</span></div>
      <div class="dust-bar" id="dustBar">
        <span class="dust-ico">✨</span>
        <span class="dust-label">我的光尘</span>
        <span class="dust-num" id="dustNum">0</span>
        <span class="dust-got" id="dustGot" hidden></span>
      </div>
      <!-- 小镇等级条。数据来自 renderStats 拿到的统计，纯前端算，不改后端 -->
      <div id="lvBarHost" style="margin-top:12px"></div>

      <div class="sign-top">
        <div class="sign-streak">
          <div class="sign-num"><span id="signStreak">0</span> <small>天连续</small></div>
          <div class="sign-sub">累计报到 <span id="signTotal">0</span> 天</div>
        </div>
        <button class="sign-btn" id="signBtn" type="button">报到</button>
      </div>
      <div class="sign-week" id="signWeek"></div>
      <div class="medals" id="medals"></div>
    </div>

    <!-- 创作数据 -->
    <div class="m-card" id="statCard">
      <div class="m-card-title">📊 创作账本</div>
      <div class="stat-grid" id="statGrid">
        <div class="stat"><div class="stat-num">—</div><div class="stat-lab">加载中</div></div>
      </div>
      <div class="size-bars" id="sizeBars" hidden></div>
      <div class="best-work" id="bestWork" hidden></div>
    </div>

    <!-- 快捷入口 -->
    <div class="m-card" id="linkCard">
      <div class="m-card-title">🔗 常去的地方</div>
      <div class="m-links">
        <router-link class="m-link" to="/mine/works">
          <span class="ml-ico">🖼️</span>
          <span class="ml-num" id="lnkWorks">0</span>
          <span>我的作品</span>
        </router-link>
        <router-link class="m-link" to="/mine/gifted">
          <span class="ml-ico">✨</span>
          <span class="ml-num" id="lnkLiked"></span>
          <span>送出的</span>
        </router-link>
        <router-link class="m-link" to="/mail">
          <span class="ml-ico">✉️</span>
          <span class="ml-num" id="lnkMail"></span>
          <span>信箱</span>
        </router-link>
        <router-link class="m-link" to="/chat">
          <span class="ml-ico">💬</span>
          <span class="ml-num" id="lnkChat"></span>
          <span>好友</span>
        </router-link>
        <router-link class="m-link" to="/rank">
          <span class="ml-ico">🏆</span>
          <span class="ml-num" id="lnkRank"></span>
          <span>排行榜</span>
        </router-link>
        <router-link class="m-link" to="/tasks">
          <span class="ml-ico">📋</span>
          <span class="ml-num" id="lnkTask"></span>
          <span>每日任务</span>
        </router-link>
        <router-link class="m-link" to="/achieve">
          <span class="ml-ico">🏅</span>
          <span class="ml-num" id="lnkAch"></span>
          <span>成就</span>
        </router-link>
        <router-link class="m-link" to="/intro">
          <span class="ml-ico">👤</span>
          <span>个人信息</span>
        </router-link>
        <router-link class="m-link" to="/settings">
          <span class="ml-ico">⚙️</span>
          <span>设置</span>
        </router-link>
        <a class="m-link" href="/paint">
          <span class="ml-ico">🎨</span>
          <span>去画</span>
        </a>
      </div>
    </div>

    <!-- 我的作品：页内完整列表，只显示自己的 -->
    <div class="m-card" id="mineCard">
      <div class="m-card-title">🎨 我的画<span class="m-tip" id="mineTip"></span><button class="lw-refresh" id="mineRefresh" type="button" data-label="刷新"></button></div>
      <div class="mine-del-tip">右键（手机长按）任意一幅可以转发、保存或删掉它（删了找不回来）</div>
      <div class="mine-filter" id="mineFilter" hidden>
        <span class="mf-label">筛选</span>
        <div class="mf-chips" id="mineChips"></div>
      </div>
      <div class="mine-grid" id="mineGrid"></div>
      <div id="mineEmpty"></div>
    </div>

    <!-- 「送过光尘的」不再在主页底部占一块了（用户要求删掉）。
         要看的话走「我的」里「送出的」那个入口，或者直接开 /mine/gifted，
         那条路由还在，loadLiked 也没动。 -->
    <div id="likedSlot"></div>
  </div>`,
  mounted() {
    const $ = (id) => document.getElementById(id)

    /* 账本来自服务端。启动时 dust 模块已经静默拉过一次了，
       这里只在「那次没拿到」时才补拉一次 —— 以前是无条件拉，
       于是每切一次「我的」页就多一个 /api/dust 请求。 */
    if (window.dust && window.dust.refresh) {
      if (window.dust.isServer && window.dust.isServer()) {
        /* 必须延到下一帧：renderSign 会读 MEDALS，那是 mounted 后面
           才声明的 const，同步调用会撞上 TDZ
           （Cannot access 'MEDALS' before initialization）。 */
        setTimeout(function () {
          renderDustBalance()
          renderSign()
        }, 0)
      } else {
        window.dust.refresh().then(function () {
          renderDustBalance()
          renderSign()
        })
      }
    }
    // 社区赠送光尘后回到本页时，余额要跟着变
    const onDust = function () {
      renderDustBalance()
      renderSign()
    }
    window.addEventListener('lw-mail-claimed', function () {
      // 附件被领走了，待领数变了，角标要真的重算
      try {
        const store = window.__lwCache
        if (store) delete store.mailBadge
      } catch (e) {}
      onDust()
    })
    window.addEventListener('lw-achieve-changed', function () {
      // 成就真的变了，这里要重新算，不能用缓存
      try {
        const store = window.__lwCache
        if (store) delete store.achBadge
      } catch (e) {}
      loadAchBadge()
    })
    // 领完每日任务，光尘变了，角标要重新算（强制绕过缓存）
    window.addEventListener('lw-dust-changed', function () {
      loadTaskBadge(true)
    })
    // 收发私信后未读数会变
    window.addEventListener('lw-chat-changed', function () {
      loadChatBadge(true)
    })
    window.addEventListener('lw-dust-changed', onDust)
    window.addEventListener('lw-auth-changed', onDust)

    /* 余额会变：签到、领任务、送光尘、领附件、领成就奖励都会改。
       订阅账本，变了就重画 —— 以前只有「我的」页在 mounted 里读一次，
       在别处领了光尘再切回来，数字还是老的，非得整页刷新。 */
    if (window.dust && window.dust.onChange) {
      window.dust.onChange(function () {
        renderDustBalance()
        renderSign()
      })
    }

    /* ---------- 过滤页模式 ----------
       /mine          完整面板（签到 + 数据 + 快捷入口 + 作品预览）
       /mine/works    只显示「我的作品」的过滤页
       /mine/gifted   只显示「我送出的光尘」的过滤页 */
    const path = location.pathname.replace(/\/+$/, '')
    const MODE = path.endsWith('/works')
      ? 'works'
      : path.endsWith('/gifted')
        ? 'gifted'
        : 'home'
    const CARDS = ['signCard', 'statCard', 'linkCard', 'mineCard', 'likedCard']
    function applyMode() {
      const back = $('mineBack')
      if (MODE === 'home') {
        if (back) back.hidden = true
        CARDS.forEach((id) => {
          const el = $(id)
          if (el) el.hidden = false
        })
        return
      }
      // 过滤页：只留对应的一块，并显示返回入口
      if (back) back.hidden = false
      CARDS.forEach((id) => {
        const el = $(id)
        if (!el) return
        el.hidden = id !== (MODE === 'works' ? 'mineCard' : 'likedCard')
      })
      // 过滤页需要这一块，主页不需要
      if (MODE === 'gifted' && !document.getElementById('likedCard')) {
        const slot = $('likedSlot')
        if (slot) {
          slot.innerHTML =
            '<div class="m-card" id="likedCard">\n' +
            '      <div class="m-card-title">✨ 送过光尘的画<span class="m-tip" id="likedTip"></span></div>\n' +
            '      <div class="mine-grid" id="likedGrid"></div>\n' +
            '      <div id="likedEmpty"></div>\n' +
            '    </div>'
        }
      }
      // 过滤页的标题挂在各自卡片上（头部已改为头像+账号名，不再有页面级标题）
      const cardTitle = MODE === 'works' ? '我的作品' : '送出的光尘'
      const cardSub =
        MODE === 'works' ? '这里只显示你自己发布的作品' : '你送过光尘的作品都在这里'
      const tip = $(MODE === 'works' ? 'mineTip' : 'likedTip')
      if (tip) tip.textContent = cardSub
      const name = $(MODE === 'works' ? 'mineTitle2' : 'likedTitle')
      if (name) name.textContent = cardTitle
    }
    let toastTimer = null
    function toast(msg) {
      const el = $('toast')
      if (!el) return
      el.textContent = msg
      el.classList.add('show')
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => el.classList.remove('show'), 2200)
    }

    /* ---------- 头部：头像 + 用户名 ---------- */
    function renderHeroName() {
      const el = $('meName')
      const sub = $('meHeroSub')
      if (!el) return
      let name = ''
      try {
        name = localStorage.getItem('lw-user') || ''
      } catch (e) {}
      el.textContent = name || '未登录'
      el.classList.toggle('guest', !name)
      if (sub) {
        sub.textContent = name ? '点击头像可以重新画' : '登录后同步光尘与成就'
      }
    }
    window.addEventListener('lw-auth-changed', renderHeroName)

    /* ---------- 简介 ---------- */
    function renderBio() {
      const el = $('meBio')
      if (!el) return
      let t = ''
      try {
        t = localStorage.getItem('lw-token') || ''
      } catch (e) {}
      if (!t) {
        el.textContent = '登录后可写简介'
        el.classList.add('empty')
        return
      }
      el.textContent = '读取中…'
      el.classList.remove('empty')
      /* 简介只跟登录状态有关，不会因为切了页面就变，读一次就够。
         改了简介会派发 lw-bio-changed，那时再作废缓存。
         注意 cached() 命中缓存时不会执行回调，所以必须自己判断：
         只在回调里写文字的话，第二次进这一页就永远停在「读取中…」。 */
      const BC = window.LWCache || {}
      const paintBio = (d) => {
        if (!d || !d.loggedIn) {
          el.textContent = '登录后可写简介'
          el.classList.add('empty')
          return
        }
        const bb = (d.bio || '').trim()
        el.textContent = bb || '点此写简介'
        el.classList.toggle('empty', !bb)
      }
      const fetching = BC.cached('bio', () => {
        fetch('/api/auth', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (!d) {
              // 失败就把占位清掉，下次进来还能重试（不然缓存里永远是个 null）
              BC.drop('bio')
              el.textContent = '点此写简介'
              el.classList.add('empty')
              return
            }
            BC.put('bio', d)
            paintBio(d)
          })
          .catch(() => {
            BC.drop('bio')
            el.textContent = '点此写简介'
            el.classList.add('empty')
          })
      })
      // 命中缓存：直接用缓存里的重画，别让「读取中…」挂在那儿
      if (!fetching) {
        const box = BC.get('bio')
        if (box) paintBio(box)
        else {
          // 缓存是个空占位（上次请求还没回来或失败了）：主动再取一次
          BC.drop('bio')
          renderBio()
        }
      }
    }
    window.addEventListener('lw-bio-changed', () => {
      try {
        const store = window.__lwCache
        if (store) delete store.bio
      } catch (e) {}
      renderBio()
    })
    const bioEl = $('meBio')
    if (bioEl) {
      bioEl.addEventListener('click', () => {
        if (window.sfx) window.sfx('tap')
        /* 用路由跳转，不要 location.href。
           整页刷新会把 Vue、全部视图脚本和 Service Worker 重新拉一遍，
           点一下简介要等一两秒才出来；走 router 就是切个视图。 */
        if (window.__lwRouter) {
          window.__lwRouter.push('/intro')
        } else {
          location.href = '/intro'
        }
      })
    }

    /* ---------- 头像渲染 ----------
       头像按 uid 索引，而本机只存了用户名（令牌是签名串，解不出 uid），
       所以直接问服务端要「我的 uid + 我的像素」，顺带把 uid 记进缓存，
       之后社区列表里看到自己的作品也能对上号。 */
    function renderMyAvatar() {
      const cv = $('meAvCanvas')
      const A = window.LWAvatar
      if (!cv || !A) return
      let t = ''
      try {
        t = localStorage.getItem('lw-token') || ''
      } catch (e) {}
      if (!t) {
        A.draw(cv, 'anon', 72)
        return
      }
      A.draw(cv, 'anon', 72)
      /* 自己的 uid 和头像不怎么会变，进这一页读一次就够。
         画完把 uid 记住，下次先用它画，再决定要不要更新。 */
      const MC = window.LWCache || {}
      const known = MC.get('meUid') || (localStorage.getItem('lw-uid') || '')
      if (known) A.draw(cv, known, 72)
      if (MC.cached('meAvatar', () => {
        fetch('/api/avatar', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (!d || !d.ok) return
            MC.put('meAvatar', d)
            if (d.uid) {
              MC.put('meUid', d.uid)
              try {
                localStorage.setItem('lw-uid', d.uid)
              } catch (e) {}
            }
            if (d.uid) A.put(d.uid, d.pixels || null)
            A.draw(cv, d.uid || 'anon', 72)
          })
          .catch(() => {})
      })) {
        /* 第一次，正在读 */
      } else {
        const box = MC.get('meAvatar')
        if (box && box.uid) A.draw(cv, box.uid, 72)
      }
    }
    window.addEventListener('lw-avatar-changed', renderMyAvatar)

    /* ---------- 签到（只走服务端，必须登录） ---------- */
    // 达成里程碑时额外奖励「等于里程碑天数」的光尘
    const MEDALS = [
      { need: 1, ico: '🌱', name: '启程' },
      { need: 3, ico: '🔥', name: '连续 3 天' },
      { need: 7, ico: '⭐', name: '连续 7 天' },
      { need: 30, ico: '💎', name: '连续 30 天' },
      { need: 100, ico: '👑', name: '连续 100 天' },
    ]
    /* 光尘余额：签到、送出后都要刷新 */
    function renderDustBalance() {
      const el = $('dustNum')
      if (!el || !window.dust) return
      el.innerHTML = window.dust.balance() + '<small>个</small>'
      const sent = $('lnkLiked')
      if (sent) sent.textContent = window.dust.giftedCount()
      // 别人送光尘到自己的画上会进账，这里显示累计收到多少
      const gotEl = $('dustGot')
      if (gotEl) {
        const got = window.dust.received ? window.dust.received() : 0
        gotEl.hidden = !got
        gotEl.textContent = got ? '累计收到 ' + got : ''
      }
    }

    /* 登录用户的签到状态来自服务端账本 */
    function serverSign() {
      return window.dust ? window.dust.signState() : null
    }

    function renderSign() {
      const sv = serverSign()
      if (!sv) {
        // 未登录：签到入口直接引导登录
        $('signStreak').textContent = '—'
        $('signTotal').textContent = '—'
        const b0 = $('signBtn')
        b0.textContent = '登录后就能报到'
        b0.classList.remove('done')
        $('signWeek').innerHTML = ''
        $('medals').innerHTML = ''
        $('signTip').textContent = '需要登录'
        return
      }
      const signed = sv.signed
      const streak = sv.streak
      const totalDays = sv.total
      $('signStreak').textContent = streak
      $('signTotal').textContent = totalDays
      const btn = $('signBtn')
      btn.textContent = signed ? '今日已签' : '签到'
      btn.classList.toggle('done', signed)

      // 最近 7 天：服务端账本只存累计天数与连续天数，不存逐日明细，
      // 所以这里用连续天数画一条进度带，不伪造逐日打点。
      const week = $('signWeek')
      week.innerHTML = ''
      const names = ['日', '一', '二', '三', '四', '五', '六']
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const cell = document.createElement('div')
        cell.className = 'sign-day'
        const dot = document.createElement('div')
        // 今天已签、或处于当前连续区间内的日子才算亮
        const inStreak = i < streak
        dot.className = 'sign-dot' + (inStreak ? ' on' : '') + (i === 0 ? ' today' : '')
        dot.textContent = inStreak ? '✓' : ''
        const lab = document.createElement('div')
        lab.className = 'sign-lab'
        lab.textContent = i === 0 ? '今天' : names[d.getDay()]
        cell.append(dot, lab)
        week.appendChild(cell)
      }

      // 徽章
      const box = $('medals')
      box.innerHTML = ''
      MEDALS.forEach((m) => {
        const got = streak >= m.need
        const el = document.createElement('span')
        el.className = 'medal' + (got ? ' got' : '')
        el.textContent = m.ico + ' ' + m.name
        box.appendChild(el)
      })
      $('signTip').textContent = '已同步到账号'
      renderDustBalance()
    }

    $('signBtn').addEventListener('click', () => {
      // 签到是互动行为，必须登录；未登录直接跳登录页
      if (!window.dust || !window.dust.logged()) {
        toast('报到得先登录')
        if (window.sfx) window.sfx('no')
        setTimeout(() => {
          location.href = '/login'
        }, 700)
        return
      }

      window.dust.sign().then((d) => {
        if (!d) {
          toast('没签上，待会儿再试')
          return
        }
        if (d.needLogin) {
          toast('登录状态已失效，请重新登录')
          setTimeout(() => {
            location.href = '/login'
          }, 700)
          return
        }
        if (d.already) {
          toast('今天已经签过啦')
          return
        }
        renderDustBalance()
        renderSign()
        // 签到也会解锁「签到常客」这类成就
        if (window.achSync) window.achSync()
        if (window.sfx) window.sfx(d.streak > 1 ? 'streak' : 'coin')
        if (d.bonus) {
          toast('达成连续 ' + d.streak + ' 天！额外获得 ' + d.bonus + ' 个光尘 ✨')
          return
        }
        const hit = MEDALS.find((m) => m.need === d.streak)
        toast(hit ? '获得徽章 ' + hit.ico + ' ' + hit.name + '！' : '报到成功，连着第 ' + d.streak + ' 天')
      })
    })

    /* 私信未读数角标：只有真正的好友会话才计。同样只在这台设备第一次看时请求。 */
    function loadChatBadge(force) {
      const el = $('lnkChat')
      if (!el) return
      let t = ''
      try {
        t = localStorage.getItem('lw-token') || ''
      } catch (e) {}
      if (!t) {
        el.textContent = ''
        return
      }
      const C = window.LWCache || {}
      const apply = (d) => {
        if (!d || !d.ok) return
        const n = (d.list || []).reduce((a, r) => a + (Number(r.unread) || 0), 0)
        el.textContent = n > 0 ? (n > 99 ? '99+' : String(n)) : ''
        C.put('chatBadge', d)
      }
      const go = () => {
        fetch('/api/chat?type=list', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
          .then((r) => (r.status === 401 ? null : r.json()))
          .then(apply)
          .catch(() => {})
      }
      if (force) {
        C.drop('chatBadge')
        go()
        return
      }
      if (!C.cached('chatBadge', go)) {
        const d = C.get('chatBadge')
        if (d) apply(d)
      }
    }

    /* 每日任务角标：显示「还有几个能领」。
       角标以前每次进「我的」都请求一次，切几轮页面就多打几次接口。
       现在只在这台设备第一次看时请求，之后用缓存；领了任务
       （lw-dust-changed）会主动作废缓存重新拉。 */
    function loadTaskBadge(force) {
      const el = $('lnkTask')
      if (!el) return
      let t = ''
      try {
        t = localStorage.getItem('lw-token') || ''
      } catch (e) {}
      if (!t) {
        el.textContent = ''
        return
      }
      const C = window.LWCache || {}
      const apply = (d) => {
        if (!d || !d.ok) return
        el.textContent = d.claimable > 0 ? String(d.claimable) : ''
        C.put('taskBadge', d)
      }
      if (!force) {
        const hit = C.cached('taskBadge', () => {
          fetch('/api/dailytask', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
            .then((r) => (r.status === 401 ? null : r.json()))
            .then(apply)
            .catch(() => {})
        })
        if (!hit) {
          const d = C.get('taskBadge')
          if (d) apply(d)
        }
        return
      }
      C.drop('taskBadge')
      fetch('/api/dailytask', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        .then((r) => (r.status === 401 ? null : r.json()))
        .then(apply)
        .catch(() => {})
    }

    /* 成就解锁数：只对登录用户请求 */
    function loadAchBadge() {
      const el = $('lnkAch')
      if (!el) return
      let t = ''
      try {
        t = localStorage.getItem('lw-token') || ''
      } catch (e) {}
      if (!t) {
        el.textContent = ''
        return
      }
      // 静默同步：只更新角标，不在这里弹提示
      const show = (d) => {
        if (!d || !d.ok) return
        el.textContent = d.total ? d.unlocked + '/' + d.total : ''
      }
      const AC2 = window.LWCache || {}
      if (AC2.cached('achBadge', () => {
        if (window.achSync) window.achSync({ silent: true, then: show })
        else
          fetch('/api/achieve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
            body: JSON.stringify({ action: 'sync' }),
            cache: 'no-store',
          })
            .then((r) => (r.status === 401 ? null : r.json()))
            .then((d) => {
              AC2.put('achBadge', d)
              show(d)
            })
            .catch(() => {})
      })) {
        /* 第一次，正在同步 */
      } else {
        const box = AC2.get('achBadge')
        if (box) show(box)
      }
    }

    /* 信箱待领附件数：只对登录用户请求 */
    function loadMailBadge() {
      const el = $('lnkMail')
      if (!el) return
      let t = ''
      try {
        t = localStorage.getItem('lw-token') || ''
      } catch (e) {}
      if (!t) {
        el.textContent = ''
        return
      }
      const MLC = window.LWCache || {}
      const paintBadge = (d) => {
        if (!d || !d.ok) return
        el.textContent = d.claimable ? String(d.claimable) : ''
        /* 有未领的信时给整个入口一圈呼吸光晕，比单纯一个数字角标更容易注意到 */
        try {
          if (window.LWFx) {
            const link = el.closest ? el.closest('.m-link') : null
            if (link) window.LWFx.unread(link, !!d.claimable)
          }
        } catch (e) {}
      }
      if (MLC.cached('mailBadge', () => {
        fetch('/api/mail', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
          .then((r) => (r.status === 401 ? null : r.json()))
          .then((d) => {
            MLC.put('mailBadge', d)
            paintBadge(d)
          })
          .catch(() => {})
      })) {
        /* 第一次，正在读 */
      } else {
        paintBadge(MLC.get('mailBadge'))
      }
    }

    /* ---------- 创作数据 ---------- */
    function fmt(n) {
      n = Number(n) || 0
      if (n >= 10000) return (n / 10000).toFixed(1) + '万'
      return String(n)
    }
    function renderStats(st) {
      const grid = $('statGrid')
      grid.innerHTML = ''
      const items = [
        { n: st.works, lab: '发布作品' },
        { n: st.likes, lab: '收到的光尘' },
        /* 原来是「绘制格数」＝历史累计，只涨不掉，当不了进度看。
           改成今日绘制格子数；顺带把今天发了几幅也带出来（0 幅就写「今天还没画」）。 */
        {
          n: st.cellsToday != null ? st.cellsToday : st.cells,
          lab: st.worksToday ? '今日绘制格子数' : '今日还没画',
        },
        { n: st.days, lab: '创作天数' },
      ]
      items.forEach((it) => {
        const d = document.createElement('div')
        d.className = 'stat'
        d.innerHTML = '<div class="stat-num">' + fmt(it.n) + '</div><div class="stat-lab">' + it.lab + '</div>'
        grid.appendChild(d)
      })

      /* 等级条：用已有统计现算一个「小镇等级」，不改后端也不影响别的逻辑。
         成就数这里拿不到（要另开接口），所以只用前三项，权重见 lw-deco.js。 */
      try {
        const host = $('lvBarHost')
        if (host && window.LWDeco && window.LWDeco.levelBar) {
          host.innerHTML = ''
          host.appendChild(
            window.LWDeco.levelBar({
              works: Number(st.works) || 0,
              days: Number(st.days) || 0,
              dust: Number(st.likes) || 0,
              ach: 0,
            })
          )
        }
      } catch (e) {}

      // 尺寸分布
      const sc = st.sizeCount || {}
      const total = (sc['16'] || 0) + (sc['32'] || 0) + (sc['64'] || 0)
      const bars = $('sizeBars')
      if (total > 0) {
        bars.hidden = false
        bars.innerHTML = ''
        ;[
          [16, '16×16'],
          [32, '32×32'],
          [64, '64×64'],
        ].forEach(([k, label]) => {
          const v = sc[k] || 0
          const row = document.createElement('div')
          row.className = 'size-bar'
          row.innerHTML =
            '<span class="sb-lab">' + label + '</span>' +
            '<span class="sb-track"><span class="sb-fill" style="width:' + (total ? (v / total) * 100 : 0) + '%"></span></span>' +
            '<span class="sb-num">' + v + '</span>'
          bars.appendChild(row)
        })
      }

      // 最受欢迎的作品
      const best = $('bestWork')
      if (st.best && st.best.workName) {
        best.hidden = false
        best.innerHTML =
          '👑 收到的光尘最多：<b>' + escapeHtml(st.best.workName) + '</b> · ' + (st.best.likes || 0) + ' 份光尘'
      }
    }

    function renderStatError(msg) {
      $('statGrid').innerHTML =
        '<div class="m-empty">' + msg + '</div>'
    }

    /* ---------- 我的作品 ---------- */
    function paintThumb(canvas, pixels, size) {
      /* 统一走 LWThumb。这里用 fill 模式：让画布铺满格子宽度。
         整数倍缩放虽然不会切出白条纹，但 16×16 最大能到 80px、
         64×64 只能到 64px，两种画摆在一排就一大一小。 */
      if (window.LWThumb) {
        window.LWThumb.draw(canvas, pixels, size, { fill: true })
        return
      }
      /* 兜底路径（LWThumb 没加载时）：背板用 1:1，靠 CSS 的 pixelated 放大。
         原来写成 n*dpr，但这里没有配套设置 CSS 尺寸，
         背板与显示宽度不是整数倍关系，会切出白条纹。 */
      const n = size === 32 || size === 64 ? size : 16
      canvas.width = n
      canvas.height = n
      const c = canvas.getContext('2d')
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
    function escapeHtml(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, (m) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
      )
    }

    /* 一次性迁移：认领码时代的老作品。
       当年认领码的明文存在 localStorage.paintClaim，作品上只存它的哈希。
       认领码功能下线后老作品成了孤儿，作品数和绘制格数都不计入。
       这里把浏览器里还留着的那串码交给服务端做一次哈希匹配，
       对上的老作品就归到当前账号；服务端确认收完就把本地这串码删掉。 */
    const CLAIM_KEY = 'paintClaim'
    async function tryClaimMigrate(token) {
      let code = ''
      try {
        code = localStorage.getItem(CLAIM_KEY) || ''
      } catch (e) {}
      if (!code) return 0
      try {
        const res = await fetch('/api/mine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ action: 'migrate-claim', code }),
        })
        const d = await res.json().catch(() => ({}))
        if (!d || !d.ok) return 0
        // 不管有没有收到作品，都把这串码删掉：迁移是一次性的，
        // 留着只会让每次进页面都白跑一遍哈希
        try {
          localStorage.removeItem(CLAIM_KEY)
        } catch (e) {}
        if (d.moved > 0) {
          if (window.sfx) window.sfx('coin')
          if (window.toast) window.toast('找回了 ' + d.moved + ' 幅以前发布的作品，已计入创作数据')
          else console.log('[claim] 找回 ' + d.moved + ' 幅老作品')
        }
        return d.moved || 0
      } catch (e) {
        return 0
      }
    }

    async function loadMine() {
      let token = ''
      try {
        token = localStorage.getItem('lw-token') || ''
      } catch (e) {}
      if (!token) {
        $('mineEmpty').innerHTML =
          '登录后就能看到你发布的作品。<br /><a href="/login">去登录 / 注册</a>'
        $('mineTip').textContent = '需要登录'
        renderStatError('需要登录')
        $('mineGrid').innerHTML = ''
        return
      }
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = 'Bearer ' + token
      // 先迁移再统计，否则这一次的数字还是不含老作品
      await tryClaimMigrate(token)
      try {
        const res = await fetch('/api/mine', {
          method: 'POST',
          headers,
          body: JSON.stringify({ token, action: 'stats' }),
        })
        const d1 = await res.json().catch(() => ({}))
        const res2 = await fetch('/api/mine', {
          method: 'POST',
          headers,
          body: JSON.stringify({ token, action: 'list' }),
        })
        const d2 = await res2.json().catch(() => ({}))
        const box = { stats: d1.stats || null, works: (d2 && d2.works) || [] }
        C.put('mine', box)
        paintMine(box)
      } catch (e) {
        renderStatError('加载失败，请检查网络')
      }
    }

    /* 只负责把数据画出来，不发请求 —— 切页面回来时用缓存走这一段。 */
    function paintMine(box) {
      if (!box) return
      if (box.stats) renderStats(box.stats)
      else renderStatError('加载失败，请检查网络')
      allWorks = box.works || []
      $('lnkWorks').textContent = allWorks.length
      $('mineTip').textContent = allWorks.length ? allWorks.length + ' 件' : ''
      renderMineFilter()
      renderMineWorks(true)
    }

    /* ---------- 我的作品：完整列表 + 尺寸筛选 + 分页 ---------- */
    let allWorks = []
    let mineSizeFilter = 'all'
    const PAGE = 24
    let shownCount = PAGE

    function renderMineFilter() {
      const box = $('mineFilter')
      const chips = $('mineChips')
      if (!box || !chips) return
      if (!allWorks.length) {
        box.hidden = true
        return
      }
      box.hidden = false
      const counts = { all: allWorks.length, 16: 0, 32: 0, 64: 0 }
      allWorks.forEach((w) => {
        const s = w.size === 32 || w.size === 64 ? w.size : 16
        counts[s] = (counts[s] || 0) + 1
      })
      chips.innerHTML = ''
      const opts = [
        ['all', '全部'],
        ['16', '16×16'],
        ['32', '32×32'],
        ['64', '64×64'],
      ]
      opts.forEach(([v, label]) => {
        if (v !== 'all' && !counts[v]) return
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'mf-chip' + (mineSizeFilter === v ? ' on' : '')
        /* 「16×16 1」里末尾那个 1 是件数，紧跟在 16 后面很容易看成尺寸的一部分。
           改成带底色的小圆角徽标，一眼能分出「尺寸」和「多少件」。 */
        const lab = document.createElement('span')
        lab.className = 'mf-lab'
        lab.textContent = label
        const num = document.createElement('span')
        num.className = 'mf-n'
        num.textContent = String(counts[v])
        b.append(lab, num)
        b.addEventListener('click', () => {
          mineSizeFilter = v
          shownCount = PAGE
          renderMineFilter()
          renderMineWorks(true)
          if (window.sfx) window.sfx('tick')
        })
        chips.appendChild(b)
      })
    }

    function filteredWorks() {
      if (mineSizeFilter === 'all') return allWorks
      return allWorks.filter((w) => String(w.size) === mineSizeFilter)
    }

    function renderMineWorks(reset) {
      const grid = $('mineGrid')
      if (!grid) return
      const list = filteredWorks()
      if (!list.length) {
        grid.innerHTML = ''
        $('mineEmpty').innerHTML = '还没有发布过作品，<a href="/paint">去画一幅</a>'
        return
      }
      if (reset) {
        grid.innerHTML = ''
        shownCount = PAGE
      }
      const slice = list.slice(0, shownCount)
      // 重建（筛选或分页变化时保证顺序正确）
      grid.innerHTML = ''
      slice.forEach((w) => grid.appendChild(buildWorkItem(w, true)))
      const more = list.length - slice.length
      $('mineEmpty').innerHTML =
        more > 0
          ? '<button class="mine-load" id="mineMore" type="button">还有 ' + more + ' 件，点此加载更多</button>'
          : ''
      const btn = $('mineMore')
      if (btn) {
        btn.addEventListener('click', () => {
          shownCount += PAGE
          renderMineWorks(false)
          if (window.sfx) window.sfx('tick')
        })
      }
    }

    /* 删除自己的一幅画。
       以前这段逻辑只写在 views/paint.js 里，而且从来没有被任何按钮调用过 ——
       后端 /api/mine 的 delete 早就实现了，前端却没有入口，
       所以「删掉自己不想再挂着的画」这件事实际上做不到。
       这里把它接到「我的作品」上：长按 1.2 秒 → 二次确认 → 删。 */
    async function deleteOwnWork(w, item) {
      let t = ''
      try {
        t = localStorage.getItem('lw-token') || ''
      } catch (e) {}
      if (!t) {
        toast('删除作品需要先登录')
        setTimeout(() => {
          location.href = '/login'
        }, 800)
        return
      }
      const name = w.workName || '未命名'
      if (!(await lwConfirm('确定删除「' + name + '」吗？删除后无法恢复。', { danger: true }))) return
      item.dataset.deleting = '1'
      try {
        const res = await fetch('/api/mine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'delete', token: t, time: w.time }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data || !data.ok) {
          toast('删除失败：' + ((data && data.error) || res.status))
          delete item.dataset.deleting
          return
        }
        if (window.sfx) window.sfx('close')
        toast('已删除「' + name + '」')
        // 本地那份「我发布过哪些作品」的记录也要同步去掉
        try {
          const ids = JSON.parse(localStorage.getItem('paintMyTimes') || '[]')
          localStorage.setItem(
            'paintMyTimes',
            JSON.stringify(ids.filter((x) => String(x) !== String(w.time)))
          )
        } catch (e) {}
        // 统计、作品列表、聊天角标里的数字都可能变了，一起作废重画
        const C2 = window.LWCache || {}
        C2.drop('mine')
        C2.drop('chatBadge')
        await loadMine()
      } catch (e) {
        delete item.dataset.deleting
        toast('删除失败：' + ((e && e.message) || '网络错误'))
      }
    }

    /* 这里**故意不挂长按菜单**。
       用户反馈：手机上滑动列表时手指稍微停一下就弹菜单，很烦、还容易误触。
       长按在「列表页」本来就是个坏交互 —— 列表的第一用途是滚动。
       改成卡片右上角一个「⋯」按钮，点了才弹。 */

    /* own：这张画是不是我自己发布的。
       「送过光尘的」列表里是**别人的作品**，绝不能给删除入口 ——
       之前两个列表共用 buildWorkItem，长按会弹出删除确认框
       （用户反馈「长按可以删除别人的作品」）。后端会 403 挡下来，
       但让人以为能删别人的画本身就不对。 */
    function buildWorkItem(w, own) {
      const item = document.createElement('div')
      item.className = 'mine-item' + (own ? ' own' : '')
      const cv = document.createElement('canvas')
      paintThumb(cv, w.pixels, w.size)
      const cap = document.createElement('div')
      cap.className = 'mine-cap'
      const t = document.createElement('span')
      t.className = 'mc-title'
      t.textContent = w.workName || '未命名'
      cap.appendChild(t)
      if (w.likes) {
        const n = document.createElement('span')
        n.className = 'mc-dust'
        n.textContent = '光尘 ' + w.likes
        n.title = '这幅作品收到了 ' + w.likes + ' 份光尘'
        cap.appendChild(n)
      }
      item.append(cv, cap)

      /* 右上角的「⋯」：只有自己的画才给（别人的画没有可操作项）。
         挂 mousedown/touchstart 的 stopPropagation 不够 —— 直接用 click
         并阻止冒泡，避免点菜单按钮时把卡片本身的「跳到社区」也触发了。 */
      if (own && window.LWWorkMenu) {
        const more = document.createElement('button')
        more.type = 'button'
        more.className = 'mine-more'
        more.textContent = '⋯'
        more.title = '更多操作'
        more.setAttribute('aria-label', '更多操作')
        more.addEventListener('click', (e) => {
          e.stopPropagation()
          e.preventDefault()
          const info = item.__lwwmInfo ? item.__lwwmInfo() : null
          if (info) window.LWWorkMenu.open(info)
        })
        item.appendChild(more)
      }

      item.dataset.time = String(w.time)
      item.addEventListener('click', () => {
        // 长按删除刚触发完，别顺手又跳到社区去
        if (item.dataset.deleting === '1') {
          delete item.dataset.deleting
          return
        }
        /* 用 router 跳转，不要 location.href。
           整页刷新会把 Vue、全部视图脚本和 Service Worker 重新拉一遍，
           点一下自己的画要等一两秒；而且没有 SPA 回退的部署环境会直接 404。 */
        const target = '/gallery?t=' + w.time
        if (window.__lwRouter) window.__lwRouter.push(target)
        else location.href = target
      })
      /* 右键（桌面）/ 长按（手机）→ 作品菜单，跟微信长按图片一个路数。
         原来这里是「长按 1.2 秒直接弹删除确认」，现在删画挪进菜单里了。

         为什么非得挪：两个长按计时器会同时跑。原逻辑 1.2 秒弹删除确认，
         菜单 0.5 秒就弹出来了 —— 于是用户长按想删画，先被弹出来的菜单
         糊一脸，1.2 秒到了菜单上面又盖一个删除确认框。两个弹层叠着，
         底下那个还能点穿。合并成一处才不会这样。

         这里只挂信息，事件交给下面的 bindWorkMenu 统一委托 ——
         作品列表是重建的，逐个卡片绑事件的话每次刷新都得重绑一遍，
         漏一个就有一个点不开。 */
      item.dataset.workTime = String(w.time)
      item.dataset.workTitle = w.workName || '未命名'
      item.__lwwmInfo = () => ({
        time: w.time,
        title: w.workName || '未命名',
        author: w.author || (w.workName ? '匿名' : w.name || '匿名'),
        work: w,
        // 只有自己的画才给删除入口。别人的画长按只能看不能删
        onDelete: own ? () => deleteOwnWork(w, item) : null,
      })
      item.addEventListener('dragstart', (e) => e.preventDefault())
      return item
    }

    /* ---------- 送过光尘的：页内列表 ---------- */
    async function loadLiked() {
      const card = $('likedCard')
      const grid = $('likedGrid')
      if (!card || !grid) return // 主页已经没有这张卡片了
      card.hidden = false
      // 数据源是服务端账本里「已赠送」的作品，未登录没有记录
      const times =
        window.dust && window.dust.logged()
          ? window.dust.giftedList().map(Number).filter((t) => Number.isFinite(t))
          : []
      $('likedTip').textContent = window.dust && window.dust.logged() && times.length ? times.length + ' 件' : ''
      grid.innerHTML = ''
      if (!window.dust || !window.dust.logged()) {
        $('likedEmpty').innerHTML = '送光尘需要登录。<br /><a href="/login">去登录 / 注册</a>'
        return
      }
      if (!times.length) {
        $('likedEmpty').innerHTML =
          '还没给别人的画送过光尘。<br />去社区看看，<b>✨ 送光尘</b>给喜欢的作品'
        return
      }
      // 逐个取作品；失败的不影响其余
      const got = []
      for (const t of times) {
        try {
          const r = await fetch('/api/get?single=1&locate=' + t, { cache: 'no-store' })
          if (!r.ok) continue
          const d = await r.json()
          const w = d.work || d.entry || (Array.isArray(d.history) ? d.history[0] : null)
          if (w && w.pixels) got.push(w)
        } catch (e) {}
      }
      got.forEach((w) => grid.appendChild(buildWorkItem(w, false)))
      /* 原来这里一律写「可能已被作者删除」，但取不到作品的原因多了去了
         （接口没返回、没网络、对方注销），直接这么说会让人以为自己的记录没了。
         说清楚实际情况。 */
      const miss = times.length - got.length
      $('likedEmpty').innerHTML = got.length
        ? miss
          ? '<div class="me-empty">有 ' + miss + ' 件没能取到（对方可能已注销，或作品已被删除）</div>'
          : ''
        : times.length
          ? '<div class="me-empty">送过光尘的 ' + times.length + ' 件作品这会儿都取不到<br />（对方可能已注销，或作品已被删除）</div>'
          : '<div class="me-empty">还没给别人的画送过光尘</div>'
    }

    $('lnkWorksBtn') &&
      $('lnkWorksBtn').addEventListener('click', () => {
        $('mineCard').scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (window.sfx) window.sfx('tap')
      })
    /* 底部那张「送过光尘的」卡片已经删了，所以这个入口改成直接跳到
       /mine/gifted 过滤页 —— 以前是「加载完再滚到卡片」，卡片没了会直接报错。 */
    $('lnkLikedBtn') &&
      $('lnkLikedBtn').addEventListener('click', () => {
        if (window.sfx) window.sfx('tap')
        if (window.__lwRouter) window.__lwRouter.push('/mine/gifted')
        else location.hash = '#/mine/gifted'
      })

    /* ---------- 送出的光尘数量 ---------- */
    $('lnkLiked').textContent = window.dust ? window.dust.giftedCount() : 0
    loadMailBadge()
    loadAchBadge()
    loadTaskBadge()
    loadChatBadge()

    applyMode()
    renderHeroName()
    renderBio()
    renderMyAvatar()
    renderSign()
    /* 切页面不自动刷新：第一次进来请求一次（stats+list 两次 POST），
       之后切回来直接拿内存缓存重画，不发请求。想更新点「我的作品」右边的刷新。 */
    const C = window.LWCache || {}
    C.bindRefresh($('mineRefresh'), () => {
      C.drop('mine')
      return loadMine()
    }, () => {}, true)
    if (C.cached('mine', () => { loadMine() })) {
      /* 第一次，正在请求 */
    } else {
      const box = C.get('mine')
      if (box) setTimeout(() => paintMine(box), 0)
    }
    // 直接进 /mine/gifted 时也要加载列表，不依赖点入口
    if (MODE === 'gifted') loadLiked()
  },
}
