// 成就墙
// 和「连续签到徽章」不同：签到徽章断了会归零，成就看的是累计成果，永不清零。
// 进度和奖励都在服务端算，页面只负责显示。
export default {
  name: 'achieve',
  title: '成就',
  css: `
      .ach-page {
        min-height: 100vh;
        padding: 14px 14px calc(96px + env(safe-area-inset-bottom, 0px));
        max-width: 560px;
        margin: 0 auto;
      }
      .ach-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .ach-back {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--text-muted2);
        text-decoration: none;
      }
      .ach-title {
        font-size: 18px;
        font-weight: 800;
        color: var(--text);
      }
      .ach-sum {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px;
        margin-bottom: 12px;
        box-shadow: 0 2px 10px var(--shadow2, rgba(0, 0, 0, 0.05));
      }
      .ach-bar {
        height: 9px;
        border-radius: 999px;
        background: var(--surface-2);
        overflow: hidden;
        margin: 9px 0 7px;
      }
      .ach-bar i {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: var(--accent, #5b8def);
        transition: width 0.35s ease;
      }
      .ach-sum-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        font-size: 13px;
        color: var(--text-muted2);
      }
      .ach-sum-top b {
        font-size: 20px;
        font-weight: 800;
        color: var(--text);
      }
      .ach-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-top: 12px;
      }
      .ach-stat {
        text-align: center;
        padding: 8px 4px;
        background: var(--surface-2);
        border-radius: 10px;
      }
      .ach-stat b {
        display: block;
        font-size: 15px;
        font-weight: 800;
        color: var(--text);
      }
      .ach-stat span {
        font-size: 11px;
        color: var(--text-faint);
      }
      .ach-wide {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        padding: 9px 12px;
        background: var(--surface-2);
        border-radius: 10px;
        font-size: 12px;
        color: var(--text-muted);
      }
      .ach-wide b {
        font-size: 15px;
        font-weight: 800;
        color: var(--text);
      }
      .ach-grp {
        margin-bottom: 10px;
      }
      .ach-grp-h {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 11px 13px;
        font-family: inherit;
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
        cursor: pointer;
        margin-bottom: 8px;
      }
      .ach-grp-n { flex: 1; text-align: left; }
      .ach-grp-c {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-faint);
      }
      .ach-grp-h.open .ach-grp-c { color: var(--accent, #5b8def); }
      .ach-grp-a { color: var(--text-faint); font-size: 12px; }
      .ach-grp-b {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-left: 2px;
      }
      .ach-sec {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-muted);
        margin: 16px 2px 8px;
      }
      .ach-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ach-item {
        display: flex;
        align-items: center;
        gap: 11px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 13px;
        padding: 11px 13px;
        opacity: 0.62;
      }
      .ach-item.got {
        opacity: 1;
        border-color: var(--accent, #5b8def);
        background: color-mix(in srgb, var(--accent, #5b8def) 7%, var(--surface));
      }
      .ach-ico {
        font-size: 22px;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: var(--surface-2);
        display: flex;
        align-items: center;
        justify-content: center;
        flex: none;
      }
      .ach-item.got .ach-ico { filter: none; }
      .ach-body {
        flex: 1;
        min-width: 0;
      }
      .ach-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
        line-height: 1.45;
      }
      .ach-desc {
        font-size: 12px;
        color: var(--text-muted2);
        line-height: 1.55;
      }
      .ach-prog {
        height: 5px;
        border-radius: 999px;
        background: var(--surface-2);
        overflow: hidden;
        margin-top: 6px;
      }
      .ach-prog i {
        display: block;
        height: 100%;
        background: var(--accent, #5b8def);
        border-radius: 999px;
      }
      .ach-num {
        font-size: 11px;
        color: var(--text-faint);
        flex: none;
        text-align: right;
        min-width: 62px;
      }
      .ach-reward {
        font-size: 11px;
        font-weight: 700;
        color: #b8860b;
        flex: none;
      }
      .ach-item.got .ach-num { color: var(--accent, #5b8def); font-weight: 700; }
      .ach-empty {
        text-align: center;
        padding: 40px 16px;
        color: var(--text-muted2);
        font-size: 14px;
        line-height: 1.8;
      }
      .ach-cta {
        display: inline-block;
        margin-top: 12px;
        padding: 9px 20px;
        border-radius: 999px;
        background: var(--accent, #5b8def);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        text-decoration: none;
      }
      .ach-new {
        position: fixed;
        left: 50%;
        bottom: calc(84px + env(safe-area-inset-bottom, 0px));
        transform: translateX(-50%);
        background: var(--surface);
        border: 1px solid var(--accent, #5b8def);
        border-radius: 14px;
        padding: 11px 15px;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.16);
        z-index: 60;
        max-width: 88vw;
      }
      .ach-new-t {
        font-size: 13px;
        font-weight: 800;
        color: var(--accent, #5b8def);
        margin-bottom: 5px;
      }
      .ach-new-l {
        font-size: 12px;
        color: var(--text);
        line-height: 1.7;
      }
      .ach-new-x {
        position: absolute;
        top: 6px;
        right: 9px;
        border: 0;
        background: transparent;
        color: var(--text-faint);
        font-size: 16px;
        cursor: pointer;
        line-height: 1;
        padding: 2px 4px;
      }
    `,
  template: `
    <div class="ach-page">
      <div class="ach-head">
        <router-link class="ach-back" to="/mine">← 我的</router-link>
        <div class="ach-title">🏅 成就</div>
        <button class="lw-refresh" id="achRefresh" type="button" data-label="刷新"></button>
      </div>
      <div id="achBody"><div class="ach-empty">正在读取…</div></div>
    </div>`,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const token = () => {
      try {
        return localStorage.getItem('lw-token') || ''
      } catch (e) {
        return ''
      }
    }
    let toastTimer = null
    function toast(msg) {
      const el = $('toast')
      if (!el) return
      el.textContent = msg
      el.classList.add('show')
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => el.classList.remove('show'), 2400)
    }
    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
    }
    function fmt(n) {
      n = Number(n) || 0
      return n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n)
    }

    function noLogin() {
      $('achBody').innerHTML =
        '<div class="ach-empty">成就跟着账号走。登录之后，你攒下的每一笔都记在这里。<br />' +
        '<a class="ach-cta" href="/login">去登录 / 注册</a></div>'
    }

    function render(d) {
      const items = Array.isArray(d.items) ? d.items : []
      const m = d.metrics || {}
      const pct = d.total ? Math.round((d.unlocked / d.total) * 100) : 0
      const progress = items.filter((x) => x.type === 'progress')
      const badges = items.filter((x) => x.type === 'badge')

      const card = (a) => {
        const num = a.need || 0
        // 当前值直接按指标名取，新增成就不用再改前端
        const metricVal = a.metric ? Number(m[a.metric]) || 0 : 0
        const w = a.type === 'progress' ? Math.min(100, Math.round(((Number(metricVal) || 0) / num) * 100)) : a.got ? 100 : 0
        return (
          '<div class="ach-item' + (a.got ? ' got' : '') + '">' +
          '<div class="ach-ico">' + esc(a.ico) + '</div>' +
          '<div class="ach-body">' +
          '<div class="ach-name">' + esc(a.name) + '</div>' +
          '<div class="ach-desc">' + esc(a.desc) + '</div>' +
          (a.type === 'progress' && !a.got
            ? '<div class="ach-prog"><i style="width:' + w + '%"></i></div>'
            : '') +
          '</div>' +
          (a.type === 'progress' && !a.got
            ? '<div class="ach-num">' + fmt(metricVal) + ' / ' + fmt(num) + '</div>'
            : '') +
          (a.reward && !a.got ? '<div class="ach-reward">+' + a.reward + '✨</div>' : '') +
          (a.got ? '<div class="ach-num">已达成</div>' : '') +
          '</div>'
        )
      }

      // 成就有一百多个，拉成一条太长，按分类折叠
      const cats = Array.isArray(d.categories) && d.categories.length
        ? d.categories
        : [{ key: '', name: '全部' }]
      const byCat = {}
      for (const a of items) {
        const k = a.cat || ''
        if (!byCat[k]) byCat[k] = []
        byCat[k].push(a)
      }

      const groupHtml = (c) => {
        const list = byCat[c.key] || []
        const gotN = list.filter((x) => x.got).length
        const open = c.key === cats[0].key
        return (
          '<div class="ach-grp">' +
          '<button class="ach-grp-h' + (open ? ' open' : '') + '" type="button" data-cat="' + esc(c.key) + '">' +
          '<span class="ach-grp-n">' + esc(c.name) + '</span>' +
          '<span class="ach-grp-c">' + gotN + ' / ' + list.length + '</span>' +
          '<span class="ach-grp-a">' + (open ? '▾' : '▸') + '</span>' +
          '</button>' +
          '<div class="ach-grp-b" data-body="' + esc(c.key) + '"' + (open ? '' : ' hidden') + '>' +
          list.map(card).join('') +
          '</div></div>'
        )
      }

      $('achBody').innerHTML =
        '<div class="ach-sum">' +
        '<div class="ach-sum-top"><span>已解锁成就</span><span><b>' + d.unlocked + '</b> / ' + d.total + '</span></div>' +
        '<div class="ach-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="ach-sum-top"><span>完成度 ' + pct + '%</span><span>连续签到 ' + (m.signStreak || 0) + ' 天</span></div>' +
        '<div class="ach-stats">' +
        '<div class="ach-stat"><b>' + fmt(m.works) + '</b><span>作品</span></div>' +
        '<div class="ach-stat"><b>' + fmt(m.cells) + '</b><span>格数</span></div>' +
        '<div class="ach-stat"><b>' + fmt(m.likes) + '</b><span>收到光尘</span></div>' +
        '<div class="ach-stat"><b>' + fmt(m.days) + '</b><span>创作天</span></div>' +
        '</div>' +
        '</div>' +
        '<div class="ach-wide">' +
        '<span>💝 累计收到光尘</span><b>' + fmt(m.got) + '</b>' +
        '</div>' +
        cats.map(groupHtml).join('')
    }

    $('achBody').addEventListener('click', (e) => {
      const h = e.target.closest('.ach-grp-h')
      if (!h) return
      const key = h.getAttribute('data-cat')
      const body = $('achBody').querySelector('[data-body="' + key + '"]')
      if (!body) return
      const open = body.hidden
      body.hidden = !open
      h.classList.toggle('open', open)
      h.querySelector('.ach-grp-a').textContent = open ? '▾' : '▸'
    })

    async function sync() {
      const t = token()
      if (!t) {
        noLogin()
        return
      }
      try {
        const res = await fetch('/api/achieve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'sync' }),
          cache: 'no-store',
        })
        if (res.status === 401) {
          noLogin()
          return
        }
        const d = await res.json().catch(() => ({}))
        if (d && d.ok) {
          AC.put('achieve', d)
          render(d)
          // 新解锁的成就弹一次提示，并刷新光尘余额
          if (Array.isArray(d.fresh) && d.fresh.length) {
            if (window.sfx) window.sfx('achieve')
            toast('新成就 ' + d.fresh.length + ' 个' + (d.reward ? '，获得 ' + d.reward + ' 个光尘 ✨' : '！'))
            /* 撒彩带庆祝。从屏幕中上方撒，撒完顺手把刚解锁那两个条目闪一下，
               让用户知道「是这几个亮了」。 */
            try {
              if (window.LWFx) window.LWFx.confetti(window.innerWidth / 2, window.innerHeight * 0.28, 34)
              if (window.LWHaptic) window.LWHaptic.ok()
              if (window.LWAnim) {
                const items = document.querySelectorAll('.ach-item:not(.locked), .ach-item.on')
                const n = Math.min(items.length, d.fresh.length || 1)
                for (let i = 0; i < n; i++) window.LWAnim.bounce(items[i])
              }
            } catch (e) {}
            if (d.book) window.dispatchEvent(new CustomEvent('lw-dust-changed', { detail: d.book }))
          }
        } else {
          AC.drop('achieve')
          $('achBody').innerHTML = '<div class="ach-empty">读取失败：' + esc((d && d.error) || res.status) + '</div>'
        }
      } catch (e) {
        // 这里以前只写「网络错误」，真实异常被吞掉了
        console.error('[achieve] 读取失败', e)
        AC.drop('achieve')
        const why = (e && (e.message || e.name)) || '未知错误'
        $('achBody').innerHTML = '<div class="ach-empty">读取失败：' + esc(why) + '</div>'
      }
    }

    /* 切页面不自动刷新：第一次进来同步一次（这个 sync 是 POST，
       每次进来都发会白白烧额度），之后切回来用内存缓存重画。 */
    const AC = window.LWCache || {}
    AC.bindRefresh($('achRefresh'), () => {
      AC.drop('achieve')
      return sync()
    }, () => {}, true)
    if (AC.cached('achieve', () => { sync() })) {
      /* 第一次，正在同步 */
    } else {
      const box = AC.get('achieve')
      if (box) setTimeout(() => render(box), 0)
    }
  },
}
