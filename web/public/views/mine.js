// 我的：签到 + 创作数据 + 我的作品
// 身份沿用现有的「认领码」：它就是本机的账号凭证，作品归属靠它。
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
      .size-bar .sb-track {
        flex: 1;
        height: 8px;
        border-radius: 999px;
        background: var(--surface-3);
        overflow: hidden;
      }
      .size-bar .sb-fill {
        height: 100%;
        border-radius: 999px;
        background: var(--accent);
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
      }

      .m-empty {
        text-align: center;
        font-size: 13px;
        color: var(--text-faint);
        padding: 20px 10px;
        line-height: 1.9;
      }
      .m-empty a { color: var(--accent); }

      .m-links { display: flex; gap: 9px; }
      .m-link {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 13px 8px;
        border-radius: 13px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        text-decoration: none;
        color: var(--text);
        font-size: 12px;
      }
      .m-link .ml-ico { font-size: 19px; }
      .m-link .ml-num { font-size: 15px; font-weight: 800; color: var(--accent); }
  `,
  template: `<div class="container mine-wrap">
    <div class="header">
      <div class="header-text">
        <h1>我的</h1>
        <div class="header-sub">签到 · 创作数据 · 我的作品</div>
      </div>
    </div>

    <!-- 签到 -->
    <div class="m-card">
      <div class="m-card-title">📅 每日签到<span class="m-tip" id="signTip">存在本机</span></div>
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
    <div class="m-card">
      <div class="m-card-title">📊 创作数据</div>
      <div class="stat-grid" id="statGrid">
        <div class="stat"><div class="stat-num">—</div><div class="stat-lab">加载中</div></div>
      </div>
      <div class="size-bars" id="sizeBars" hidden></div>
      <div class="best-work" id="bestWork" hidden></div>
    </div>

    <!-- 快捷入口 -->
    <div class="m-card">
      <div class="m-card-title">🔗 我的</div>
      <div class="m-links">
        <a class="m-link" href="/gallery?mine=1">
          <span class="ml-ico">🖼️</span>
          <span class="ml-num" id="lnkWorks">0</span>
          <span>我的作品</span>
        </a>
        <a class="m-link" href="/gallery?liked=1">
          <span class="ml-ico">♥</span>
          <span class="ml-num" id="lnkLiked">0</span>
          <span>赞过的</span>
        </a>
        <a class="m-link" href="/paint">
          <span class="ml-ico">🎨</span>
          <span>去画</span>
        </a>
      </div>
    </div>

    <!-- 我的作品 -->
    <div class="m-card">
      <div class="m-card-title">🎨 我的作品<span class="m-tip" id="mineTip"></span></div>
      <div class="mine-grid" id="mineGrid"></div>
      <div id="mineEmpty"></div>
    </div>
  </div>`,
  mounted() {
    const $ = (id) => document.getElementById(id)
    let toastTimer = null
    function toast(msg) {
      const el = $('toast')
      if (!el) return
      el.textContent = msg
      el.classList.add('show')
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => el.classList.remove('show'), 2200)
    }

    /* ---------- 签到（存在本机） ---------- */
    const SIGN_KEY = 'lw-sign'
    const MEDALS = [
      { need: 1, ico: '🌱', name: '启程' },
      { need: 3, ico: '🔥', name: '连续 3 天' },
      { need: 7, ico: '⭐', name: '连续 7 天' },
      { need: 30, ico: '💎', name: '连续 30 天' },
      { need: 100, ico: '👑', name: '连续 100 天' },
    ]
    const todayKey = () => {
      const d = new Date()
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    }
    function loadSign() {
      try {
        const o = JSON.parse(localStorage.getItem(SIGN_KEY) || '{}')
        return {
          days: Array.isArray(o.days) ? o.days : [],
          streak: Number(o.streak) || 0,
          best: Number(o.best) || 0,
        }
      } catch (e) {
        return { days: [], streak: 0, best: 0 }
      }
    }
    function saveSign(s) {
      try {
        // 只保留最近 400 天，避免无限增长
        localStorage.setItem(SIGN_KEY, JSON.stringify({ ...s, days: s.days.slice(-400) }))
      } catch (e) {}
    }

    function renderSign() {
      const s = loadSign()
      const today = todayKey()
      const signed = s.days.includes(today)
      $('signStreak').textContent = s.streak
      $('signTotal').textContent = s.days.length
      const btn = $('signBtn')
      btn.textContent = signed ? '今日已签' : '签到'
      btn.classList.toggle('done', signed)

      // 最近 7 天
      const week = $('signWeek')
      week.innerHTML = ''
      const names = ['日', '一', '二', '三', '四', '五', '六']
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key =
          d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
        const cell = document.createElement('div')
        cell.className = 'sign-day'
        const dot = document.createElement('div')
        dot.className = 'sign-dot' + (s.days.includes(key) ? ' on' : '') + (i === 0 ? ' today' : '')
        dot.textContent = s.days.includes(key) ? '✓' : ''
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
        const got = s.best >= m.need
        const el = document.createElement('span')
        el.className = 'medal' + (got ? ' got' : '')
        el.textContent = m.ico + ' ' + m.name
        box.appendChild(el)
      })
      $('signTip').textContent = s.best > s.streak ? '最长 ' + s.best + ' 天' : '存在本机'
    }

    $('signBtn').addEventListener('click', () => {
      const s = loadSign()
      const today = todayKey()
      if (s.days.includes(today)) {
        toast('今天已经签过啦')
        return
      }
      // 判断是否连续：昨天有没有签
      const y = new Date()
      y.setDate(y.getDate() - 1)
      const yKey =
        y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0')
      s.streak = s.days.includes(yKey) ? s.streak + 1 : 1
      s.best = Math.max(s.best || 0, s.streak)
      s.days.push(today)
      saveSign(s)
      if (window.sfx) window.sfx(s.streak > 1 ? 'ok' : 'ding')
      renderSign()
      const hit = MEDALS.find((m) => m.need === s.streak)
      toast(hit ? '获得徽章 ' + hit.ico + ' ' + hit.name + '！' : '签到成功，连续 ' + s.streak + ' 天')
    })

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
        { n: st.likes, lab: '收到的赞' },
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
          '👑 最受欢迎：<b>' + escapeHtml(st.best.workName) + '</b> · ' + (st.best.likes || 0) + ' 个赞'
      }
    }

    function renderStatError(msg) {
      $('statGrid').innerHTML =
        '<div class="m-empty">' + msg + '<br />在设置页查看你的认领码后即可看到数据</div>'
    }

    /* ---------- 我的作品 ---------- */
    function paintThumb(canvas, pixels, size) {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const n = size === 32 || size === 64 ? size : 16
      canvas.width = n * dpr
      canvas.height = n * dpr
      const c = canvas.getContext('2d')
      c.scale(dpr, dpr)
        // 先铺白底：缺失的格子若留成透明，会在容器背景上显示成白条纹
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

    async function loadMine() {
      let code = ''
      try {
        code = localStorage.getItem('paintClaim') || ''
      } catch (e) {}
      if (!code) {
        $('mineEmpty').innerHTML =
          '还没有认领码，所以看不到「我的作品」。<br /><a href="/settings">去设置页生成</a>，之后换设备也能用同一份数据。'
        $('mineTip').textContent = '需要认领码'
        renderStatError('还没有认领码')
        $('mineGrid').innerHTML = ''
        return
      }
      try {
        const res = await fetch('/api/mine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, action: 'stats' }),
        })
        const d1 = await res.json().catch(() => ({}))
        if (d1.stats) renderStats(d1.stats)

        const res2 = await fetch('/api/mine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, action: 'list' }),
        })
        const d2 = await res2.json().catch(() => ({}))
        const works = (d2 && d2.works) || []
        $('lnkWorks').textContent = works.length
        $('mineTip').textContent = works.length ? works.length + ' 件' : ''
        const grid = $('mineGrid')
        grid.innerHTML = ''
        if (!works.length) {
          $('mineEmpty').innerHTML = '还没有发布过作品，<a href="/paint">去画一幅</a>'
          return
        }
        works.slice(0, 24).forEach((w) => {
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
          grid.appendChild(item)
        })
        $('mineEmpty').innerHTML =
          works.length > 24 ? '<div class="m-empty">只显示最近 24 件，<a href="/gallery?mine=1">查看全部</a></div>' : ''
      } catch (e) {
        renderStatError('加载失败，请检查网络')
      }
    }

    /* ---------- 赞过的数量 ---------- */
    try {
      const liked = JSON.parse(localStorage.getItem('lw-liked') || '[]')
      $('lnkLiked').textContent = Array.isArray(liked) ? liked.length : 0
    } catch (e) {}

    renderSign()
    loadMine()
  },
}
