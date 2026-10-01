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
      .mine-item {
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
      }
      .mine-item canvas {
        display: block;
        width: 100%;
        aspect-ratio: 1;
        image-rendering: pixelated;
        background: var(--art-bg);
      }
      .mine-cap {
        padding: 6px 8px;
        font-size: 11px;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /* 标题左对齐的话，长短不同的作品排在一起会参差不齐，很乱 */
        text-align: center;
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
      <div class="m-card-title">📅 每日签到<span class="m-tip" id="signTip">存在本机 · 登录可同步</span></div>
      <div class="dust-bar" id="dustBar">
        <span class="dust-ico">✨</span>
        <span class="dust-label">我的光尘</span>
        <span class="dust-num" id="dustNum">0</span>
        <span class="dust-got" id="dustGot" hidden></span>
      </div>
      <div class="sign-top">
        <div class="sign-streak">
          <div class="sign-num"><span id="signStreak">0</span> <small>天连续</small></div>
          <div class="sign-sub">累计签到 <span id="signTotal">0</span> 天</div>
        </div>
        <button class="sign-btn" id="signBtn" type="button">签到</button>
      </div>
      <div class="sign-week" id="signWeek"></div>
      <div class="medals" id="medals"></div>
    </div>

    <!-- 创作数据 -->
    <div class="m-card" id="statCard">
      <div class="m-card-title">📊 创作数据</div>
      <div class="stat-grid" id="statGrid">
        <div class="stat"><div class="stat-num">—</div><div class="stat-lab">加载中</div></div>
      </div>
      <div class="size-bars" id="sizeBars" hidden></div>
      <div class="best-work" id="bestWork" hidden></div>
    </div>

    <!-- 快捷入口 -->
    <div class="m-card" id="linkCard">
      <div class="m-card-title">🔗 我的</div>
      <div class="m-links">
        <router-link class="m-link" to="/mine/works">
          <span class="ml-ico">🖼️</span>
          <span class="ml-num" id="lnkWorks">0</span>
          <span>我的作品</span>
        </router-link>
        <router-link class="m-link" to="/mine/gifted">
          <span class="ml-ico">✨</span>
          <span class="ml-num" id="lnkLiked">0</span>
          <span>送出的</span>
        </router-link>
        <router-link class="m-link" to="/mail">
          <span class="ml-ico">✉️</span>
          <span class="ml-num" id="lnkMail">0</span>
          <span>信箱</span>
        </router-link>
        <router-link class="m-link" to="/rank">
          <span class="ml-ico">🏆</span>
          <span class="ml-num" id="lnkRank"></span>
          <span>排行榜</span>
        </router-link>
        <router-link class="m-link" to="/tasks">
          <span class="ml-ico">📋</span>
          <span class="ml-num" id="lnkTask">0</span>
          <span>每日任务</span>
        </router-link>
        <router-link class="m-link" to="/achieve">
          <span class="ml-ico">🏅</span>
          <span class="ml-num" id="lnkAch">0</span>
          <span>成就</span>
        </router-link>
        <a class="m-link" href="/paint">
          <span class="ml-ico">🎨</span>
          <span>去画</span>
        </a>
      </div>
    </div>

    <!-- 我的作品：页内完整列表，只显示自己的 -->
    <div class="m-card" id="mineCard">
      <div class="m-card-title">🎨 我的作品<span class="m-tip" id="mineTip"></span></div>
      <div class="mine-filter" id="mineFilter" hidden>
        <span class="mf-label">筛选</span>
        <div class="mf-chips" id="mineChips"></div>
      </div>
      <div class="mine-grid" id="mineGrid"></div>
      <div id="mineEmpty"></div>
    </div>

    <!-- 送过光尘的：页内列表 -->
    <div class="m-card" id="likedCard" hidden>
      <div class="m-card-title">✨ 送过光尘的<span class="m-tip" id="likedTip"></span></div>
      <div class="mine-grid" id="likedGrid"></div>
      <div id="likedEmpty"></div>
    </div>
  </div>`,
  mounted() {
    const $ = (id) => document.getElementById(id)

    // 登录用户的账本来自服务端，进入页面先拉一次
    if (window.dust && window.dust.refresh) {
      window.dust.refresh().then(function () {
        renderDustBalance()
        renderSign()
      })
    }
    // 社区赠送光尘后回到本页时，余额要跟着变
    const onDust = function () {
      renderDustBalance()
      renderSign()
    }
    window.addEventListener('lw-mail-claimed', onDust)
    window.addEventListener('lw-achieve-changed', function () {
      loadAchBadge()
    })
    // 领完每日任务，光尘变了，角标也跟着清
    window.addEventListener('lw-dust-changed', function () {
      loadTaskBadge()
    })
    window.addEventListener('lw-dust-changed', onDust)
    window.addEventListener('lw-auth-changed', onDust)

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
      fetch('/api/auth', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d || !d.loggedIn) {
            el.textContent = '登录后可写简介'
            el.classList.add('empty')
            return
          }
          const b = (d.bio || '').trim()
          el.textContent = b || '点此写简介'
          el.classList.toggle('empty', !b)
        })
        .catch(() => {
          el.textContent = '点此写简介'
          el.classList.add('empty')
        })
    }
    window.addEventListener('lw-bio-changed', renderBio)
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
      fetch('/api/avatar', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d || !d.ok) return
          if (d.uid) A.put(d.uid, d.pixels || null)
          A.draw(cv, d.uid || 'anon', 72)
        })
        .catch(() => {})
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
        b0.textContent = '登录后签到'
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
        toast('签到需要先登录')
        if (window.sfx) window.sfx('close')
        setTimeout(() => {
          location.href = '/login'
        }, 700)
        return
      }

      window.dust.sign().then((d) => {
        if (!d) {
          toast('签到失败，请稍后再试')
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
        if (window.sfx) window.sfx(d.streak > 1 ? 'ok' : 'ding')
        if (d.bonus) {
          toast('达成连续 ' + d.streak + ' 天！额外获得 ' + d.bonus + ' 个光尘 ✨')
          return
        }
        const hit = MEDALS.find((m) => m.need === d.streak)
        toast(hit ? '获得徽章 ' + hit.ico + ' ' + hit.name + '！' : '签到成功，连续 ' + d.streak + ' 天')
      })
    })

    /* 每日任务角标：显示「还有几个能领」。静默同步，不弹提示。 */
    function loadTaskBadge() {
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
      fetch('/api/dailytask', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        .then((r) => (r.status === 401 ? null : r.json()))
        .then((d) => {
          if (!d || !d.ok) return
          el.textContent = d.claimable > 0 ? String(d.claimable) : ''
        })
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
      if (window.achSync) window.achSync({ silent: true, then: show })
      else
        fetch('/api/achieve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'sync' }),
          cache: 'no-store',
        })
          .then((r) => (r.status === 401 ? null : r.json()))
          .then(show)
          .catch(() => {})
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
      fetch('/api/mail', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        .then((r) => (r.status === 401 ? null : r.json()))
        .then((d) => {
          if (!d || !d.ok) return
          el.textContent = d.claimable ? String(d.claimable) : ''
        })
        .catch(() => {})
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
        { n: st.cells, lab: '绘制格数' },
        { n: st.days, lab: '创作天数' },
      ]
      items.forEach((it) => {
        const d = document.createElement('div')
        d.className = 'stat'
        d.innerHTML = '<div class="stat-num">' + fmt(it.n) + '</div><div class="stat-lab">' + it.lab + '</div>'
        grid.appendChild(d)
      })

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
      // 统一走 LWThumb：整数倍缩放，不会切出白条纹
      if (window.LWThumb) {
        window.LWThumb.draw(canvas, pixels, size)
        return
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const n = size === 32 || size === 64 ? size : 16
      canvas.width = n * dpr
      canvas.height = n * dpr
      const c = canvas.getContext('2d')
      c.scale(dpr, dpr)
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
          if (window.sfx) window.sfx('ding')
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
        if (d1.stats) renderStats(d1.stats)

        const res2 = await fetch('/api/mine', {
          method: 'POST',
          headers,
          body: JSON.stringify({ token, action: 'list' }),
        })
        const d2 = await res2.json().catch(() => ({}))
        allWorks = (d2 && d2.works) || []
        $('lnkWorks').textContent = allWorks.length
        $('mineTip').textContent = allWorks.length ? allWorks.length + ' 件' : ''
        renderMineFilter()
        renderMineWorks(true)
      } catch (e) {
        renderStatError('加载失败，请检查网络')
      }
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
      slice.forEach((w) => grid.appendChild(buildWorkItem(w)))
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

    function buildWorkItem(w) {
      const item = document.createElement('div')
      item.className = 'mine-item'
      const cv = document.createElement('canvas')
      paintThumb(cv, w.pixels, w.size)
      const cap = document.createElement('div')
      cap.className = 'mine-cap'
      cap.textContent = (w.workName || '未命名') + (w.likes ? ' ♥' + w.likes : '')
      item.append(cv, cap)
      item.addEventListener('click', () => {
        location.href = '/gallery?t=' + w.time
      })
      return item
    }

    /* ---------- 送过光尘的：页内列表 ---------- */
    async function loadLiked() {
      const card = $('likedCard')
      const grid = $('likedGrid')
      if (!card || !grid) return
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
          '还没有送出过光尘。<br />去社区看看，<b>✨ 送光尘</b>给喜欢的作品'
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
      got.forEach((w) => grid.appendChild(buildWorkItem(w)))
      $('likedEmpty').innerHTML = got.length
        ? ''
        : '送过光尘的作品可能已被作者删除'
    }

    $('lnkWorksBtn') &&
      $('lnkWorksBtn').addEventListener('click', () => {
        $('mineCard').scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (window.sfx) window.sfx('tick')
      })
    $('lnkLikedBtn') &&
      $('lnkLikedBtn').addEventListener('click', async () => {
        if (window.sfx) window.sfx('tick')
        await loadLiked()
        $('likedCard').scrollIntoView({ behavior: 'smooth', block: 'start' })
      })

    /* ---------- 送出的光尘数量 ---------- */
    $('lnkLiked').textContent = window.dust ? window.dust.giftedCount() : 0
    loadMailBadge()
    loadAchBadge()
    loadTaskBadge()

    applyMode()
    renderHeroName()
    renderBio()
    renderMyAvatar()
    renderSign()
    loadMine()
    // 直接进 /mine/gifted 时也要加载列表，不依赖点入口
    if (MODE === 'gifted') loadLiked()
  },
}
