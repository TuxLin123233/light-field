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
        '<div class="ach-empty">成就与账号绑定，登录后才能记录。<br />' +
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
        const cur = num && m[a.id] != null ? m[a.id] : null
        // 进度条的当前值按指标名取
        const metricVal = {
          works1: m.works, works5: m.works, works20: m.works, works50: m.works,
          cells1k: m.cells, cells10k: m.cells, cells50k: m.cells,
          likes10: m.likes, likes50: m.likes, likes200: m.likes,
          days7: m.days, days30: m.days,
          sign30: m.signTotal, sign100: m.signTotal,
        }[a.id]
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

      $('achBody').innerHTML =
        '<div class="ach-sum">' +
        '<div class="ach-sum-top"><span>已解锁成就</span><span><b>' + d.unlocked + '</b> / ' + d.total + '</span></div>' +
        '<div class="ach-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="ach-sum-top"><span>完成度 ' + pct + '%</span><span>连续签到 ' + (m.signStreak || 0) + ' 天</span></div>' +
        '<div class="ach-stats">' +
        '<div class="ach-stat"><b>' + fmt(m.works) + '</b><span>作品</span></div>' +
        '<div class="ach-stat"><b>' + fmt(m.cells) + '</b><span>格数</span></div>' +
        '<div class="ach-stat"><b>' + fmt(m.likes) + '</b><span>收到赞</span></div>' +
        '<div class="ach-stat"><b>' + fmt(m.days) + '</b><span>创作天</span></div>' +
        '</div></div>' +
        '<div class="ach-sec">进度成就</div>' +
        '<div class="ach-list">' + progress.map(card).join('') + '</div>' +
        '<div class="ach-sec">里程碑</div>' +
        '<div class="ach-list">' + badges.map(card).join('') + '</div>'
    }

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
          render(d)
          // 新解锁的成就弹一次提示，并刷新光尘余额
          if (Array.isArray(d.fresh) && d.fresh.length) {
            if (window.sfx) window.sfx('ok')
            toast('新成就 ' + d.fresh.length + ' 个' + (d.reward ? '，获得 ' + d.reward + ' 个光尘 ✨' : '！'))
            if (d.book) window.dispatchEvent(new CustomEvent('lw-dust-changed', { detail: d.book }))
          }
        } else {
          $('achBody').innerHTML = '<div class="ach-empty">读取失败：' + esc((d && d.error) || res.status) + '</div>'
        }
      } catch (e) {
        $('achBody').innerHTML = '<div class="ach-empty">读取失败：网络错误</div>'
      }
    }

    sync()
  },
}
