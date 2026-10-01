// 每日任务（/tasks）
//
// 每天派 5 个任务，达成后手动领光尘。
// 进度由服务端按累计指标算，这个视图只负责显示和点领取。
//
// 注意：这个项目里所有视图都是「template + mounted 里直接操作 DOM」，
// withAutoCleanup 不会透传 data/methods，所以这里不用 Vue 的响应式数据。
export default {
  name: 'tasks',
  title: '每日任务',
  css: `
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
        --accent: #5b8def;
        --ok: #4caf7d;
      }
      .tk-wrap {
        max-width: 460px;
        margin: 0 auto;
        padding: 14px 16px 96px;
      }
      .tk-back {
        display: inline-block;
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 6px 13px;
        font-size: 12px;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
      }
      .tk-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 12px 0 4px;
      }
      .tk-head2 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 2px;
      }
      .tk-title { font-size: 19px; font-weight: 800; color: var(--text); }
      .tk-sum { font-size: 12px; color: var(--text-faint); text-align: right; line-height: 1.6; }
      .tk-sum b { color: var(--text); font-size: 14px; }

      .tk-bar {
        height: 8px;
        border-radius: 999px;
        background: var(--surface-2);
        overflow: hidden;
        margin: 10px 0 14px;
      }
      .tk-bar-in {
        height: 100%;
        width: 0;
        background: var(--accent);
        border-radius: 999px;
        transition: width 0.25s;
      }
      .tk-bar-in.full { background: var(--ok); }

      .tk-list { display: flex; flex-direction: column; gap: 10px; }
      .tk-item {
        display: flex;
        align-items: center;
        gap: 11px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px 13px;
      }
      .tk-item.done { border-color: var(--ok); }
      .tk-item.claimed { opacity: 0.62; }
      .tk-ico {
        width: 34px; height: 34px; flex: 0 0 34px; border-radius: 11px;
        background: var(--surface-2);
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
      }
      .tk-item.done .tk-ico { background: #e6f6ed; }
      .tk-main { flex: 1; min-width: 0; }
      .tk-text { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.4; display: block; }
      .tk-item.claimed .tk-text { text-decoration: line-through; }
      .tk-prog { font-size: 11px; color: var(--text-faint); margin-top: 3px; display: block; }
      .tk-btn {
        flex: none;
        border: 0;
        border-radius: 11px;
        padding: 9px 13px;
        font-size: 12px;
        font-weight: 800;
        font-family: inherit;
        background: var(--surface-2);
        color: var(--text-faint);
        cursor: default;
      }
      .tk-btn.can { background: var(--accent); color: #fff; cursor: pointer; }
      .tk-btn.busy { opacity: 0.6; cursor: wait; }
      .tk-note {
        margin-top: 16px;
        font-size: 12px;
        color: var(--text-faint);
        line-height: 1.8;
      }
      .tk-msg {
        margin-top: 12px;
        font-size: 12px;
        border-radius: 10px;
        padding: 9px 11px;
        background: var(--surface-2);
        color: var(--text-muted);
      }
      .tk-msg.bad { background: #fdecea; color: #c0392b; }
  `,
  template: `
    <div class="tk-wrap">
      <div class="tk-head">
        <router-link class="tk-back" to="/mine">← 返回我的</router-link>
        <button class="lw-refresh" id="tkRefresh" type="button" data-label="刷新"></button>
      </div>
      <div class="tk-head2">
        <span class="tk-title">📋 每日任务</span>
        <span class="tk-sum" id="tkSum" hidden></span>
      </div>
      <div class="tk-bar" id="tkBar" hidden><div class="tk-bar-in" id="tkBarIn"></div></div>
      <div class="tk-list" id="tkList"></div>
      <div class="tk-note" id="tkNote" hidden></div>
      <div class="tk-msg" id="tkMsg" hidden></div>
    </div>
  `,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const esc = (s) =>
      String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
    const token = () => {
      try {
        return localStorage.getItem('lw-token') || ''
      } catch (e) {
        return ''
      }
    }
    // 最新的服务端数据，领取后直接用它重画，避免本地算错进度
    let state = null

    function showMsg(text, bad) {
      const el = $('tkMsg')
      if (!el) return
      el.textContent = text || ''
      el.hidden = !text
      el.classList.toggle('bad', !!bad)
    }

    function render(d) {
      state = d
      const items = d.items || []
      const list = $('tkList')
      list.innerHTML = ''

      const sum = $('tkSum')
      sum.hidden = false
      sum.innerHTML =
        '今天已领 <b>' + (d.claimed || 0) + '</b>/' + items.length +
        ' 个<br />共 <b>' + (d.gotToday || 0) + '</b> 个光尘'

      const bar = $('tkBar')
      const barIn = $('tkBarIn')
      bar.hidden = false
      const pct = items.length ? ((d.claimed || 0) / items.length) * 100 : 0
      barIn.style.width = pct + '%'
      barIn.classList.toggle('full', (d.claimed || 0) >= items.length && items.length > 0)

      items.forEach((it) => {
        const row = document.createElement('div')
        row.className = 'tk-item' + (it.done ? ' done' : '') + (it.claimed ? ' claimed' : '')
        const ico = document.createElement('span')
        ico.className = 'tk-ico'
        ico.textContent = it.claimed ? '✅' : it.done ? '🎁' : '📌'
        const main = document.createElement('span')
        main.className = 'tk-main'
        const txt = document.createElement('span')
        txt.className = 'tk-text'
        txt.textContent = it.text
        const prog = document.createElement('span')
        prog.className = 'tk-prog'
        prog.textContent = it.progress + ' / ' + it.target + ' · ' + it.label
        main.append(txt, prog)
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'tk-btn'
        btn.textContent = it.claimed ? '已领' : it.done ? '领 ' + it.dust : it.dust + ' 光尘'
        btn.disabled = !it.done || it.claimed
        if (it.done && !it.claimed) btn.classList.add('can')
        btn.addEventListener('click', () => claim(it, btn))
        row.append(ico, main, btn)
        list.appendChild(row)
      })

      const note = $('tkNote')
      note.hidden = false
      note.innerHTML =
        '每天换一批，一共 ' + esc(d.total || 100) + ' 个任务轮着来（20 天一轮，刚好走完一遍）。<br />' +
        '任务按你已有的创作数据判定，达成后手动来领；没达成时按钮是灰的。<br />' +
        '任务送的光尘可以用来改头像、写简介，也能送给别人喜欢的作品。'
    }

    async function load(force) {
      const C2 = window.LWCache || {}
      if (force) C2.drop('tasks')
      const t = token()
      if (!t) {
        showMsg('每日任务需要登录后查看。', true)
        return
      }
      try {
        const res = await fetch('/api/dailytask', {
          headers: { Authorization: 'Bearer ' + t },
          cache: 'no-store',
        })
        if (res.status === 401) {
          showMsg('登录状态已失效，请重新登录。', true)
          return
        }
        const d = await res.json().catch(() => ({}))
        if (!d || !d.ok) {
          showMsg('读取失败：' + esc((d && d.error) || res.status), true)
          return
        }
        showMsg('')
        render(d)
        return d
      } catch (e) {
        showMsg('读取失败：' + esc((e && e.message) || '网络错误'), true)
        return null
      }
    }

    async function claim(it, btn) {
      const t = token()
      if (!t) {
        showMsg('请先登录', true)
        return
      }
      btn.disabled = true
      btn.classList.add('busy')
      const old = btn.textContent
      btn.textContent = '领取中'
      showMsg('')
      try {
        const res = await fetch('/api/dailytask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'claim', id: it.id }),
        })
        const d = await res.json().catch(() => ({}))
        if (!d || !d.ok) {
          btn.disabled = false
          btn.classList.remove('busy')
          btn.textContent = old
          showMsg((d && d.error) || '领取失败：' + res.status, true)
          if (window.sfx) window.sfx('no')
          return
        }
        if (window.sfx) window.sfx('ding')
        // 通知「我的」页刷新光尘和角标
        try {
          window.dispatchEvent(new CustomEvent('lw-dust-changed', { detail: d.book || null }))
        } catch (e) {}
        // 服务端返回最新列表，直接重画
        render({
          period: d.period,
          items: d.items,
          claimed: d.claimed,
          gotToday: d.gotToday,
          total: state ? state.total : 100,
        })
        showMsg('✅ 领到了 ' + d.dust + ' 个光尘，已经进你的账本。')
      } catch (e) {
        btn.disabled = false
        btn.classList.remove('busy')
        btn.textContent = old
        showMsg('领取失败：' + esc((e && e.message) || '网络错误'), true)
      }
    }

    /* 第一次进来才请求，之后切回来用缓存；想更新点刷新 */
    const C = window.LWCache || {}
    C.bindRefresh($('tkRefresh'), () => load(true), () => {}, true)
    if (!C.cached('tasks', () => { load().then((d) => { if (d) C.put('tasks', d) }) })) {
      const d = C.get('tasks')
      if (d) render(d)
    }
  },
}
