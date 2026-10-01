// 信箱：系统消息 + 可领取的光尘附件
// 与账号绑定，服务端保存；同一封活动信不会重复塞进箱子，附件也只会发一次。
export default {
  name: 'mail',
  title: '信箱',
  css: `
      .mail-page {
        min-height: 100vh;
        padding: 14px 14px calc(96px + env(safe-area-inset-bottom, 0px));
        max-width: 560px;
        margin: 0 auto;
      }
      .mail-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .mail-back {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--text-muted2);
        text-decoration: none;
      }
      .mail-title {
        font-size: 18px;
        font-weight: 800;
        color: var(--text);
      }
      .mail-sum {
        margin: 0 2px 12px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--text-muted2);
      }
      .mail-sum b {
        color: var(--text);
      }
      .mail-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .mail-item {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px 13px;
        box-shadow: 0 2px 10px var(--shadow2, rgba(0, 0, 0, 0.05));
      }
      .mail-item.claimable {
        border-color: var(--accent, #5b8def);
      }
      .mail-row {
        display: flex;
        align-items: flex-start;
        gap: 9px;
      }
      .mail-ico {
        font-size: 19px;
        line-height: 1.4;
        flex: none;
      }
      .mail-main {
        flex: 1;
        min-width: 0;
      }
      .mail-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
        line-height: 1.5;
      }
      .mail-time {
        font-size: 11px;
        color: var(--text-muted2);
        margin-top: 1px;
      }
      .mail-text {
        font-size: 13px;
        line-height: 1.65;
        color: var(--text-muted);
        margin-top: 6px;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .mail-act {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed var(--border);
      }
      .mail-attach {
        font-size: 13px;
        color: var(--text);
        font-weight: 600;
      }
      .mail-btn {
        margin-left: auto;
        border: 0;
        border-radius: 999px;
        padding: 7px 15px;
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        background: var(--accent, #5b8def);
        cursor: pointer;
      }
      .mail-btn:disabled {
        opacity: 0.55;
        cursor: default;
      }
      .mail-got {
        font-size: 12px;
        color: var(--text-muted2);
      }
      .mail-empty {
        text-align: center;
        padding: 44px 16px;
        color: var(--text-muted2);
        font-size: 14px;
        line-height: 1.8;
      }
      .mail-cta {
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
    `,
  template: `
    <div class="mail-page">
      <div class="mail-head">
        <router-link class="mail-back" to="/mine">← 我的</router-link>
        <div class="mail-title">✉️ 信箱</div>
      </div>
      <div class="mail-sum" id="mailSum">正在读取…</div>
      <div class="mail-list" id="mailList"></div>
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
      toastTimer = setTimeout(() => el.classList.remove('show'), 2200)
    }
    function fmtTime(t) {
      const n = Number(t) || 0
      if (!n) return ''
      const d = new Date(n)
      const p = (x) => String(x).padStart(2, '0')
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
    }
    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
    }

    function renderNoLogin() {
      $('mailSum').textContent = ''
      $('mailList').innerHTML =
        '<div class="mail-empty">信箱和账号绑定，登录后才能收到消息。<br />' +
        '<a class="mail-cta" href="/login">去登录 / 注册</a></div>'
    }

    let claimable = new Set()
    function render(d) {
      const mails = Array.isArray(d.mails) ? d.mails : []
      claimable = new Set()
      mails.forEach((m) => {
        if (m.kind === 'attach' && m.dust > 0) claimable.add(m.id)
      })

      if (!mails.length) {
        $('mailSum').textContent = ''
        $('mailList').innerHTML =
          '<div class="mail-empty">信箱空空的。<br />以后有活动消息和光尘附件都会送到这里</div>'
        return
      }

      $('mailSum').innerHTML = d.claimable
        ? '共 ' + d.total + ' 封信，<b>' + d.claimable + '</b> 个附件待领取，合计 <b>' + d.dust + '</b> 个光尘'
        : '共 ' + d.total + ' 封信，暂时没有待领取的附件'

      const list = $('mailList')
      list.innerHTML = mails
        .map((m) => {
          const can = claimable.has(m.id)
          return (
            '<div class="mail-item' + (can ? ' claimable' : '') + '" data-id="' + esc(m.id) + '">' +
            '<div class="mail-row">' +
            '<span class="mail-ico">' + esc(m.icon || '✉️') + '</span>' +
            '<div class="mail-main">' +
            '<div class="mail-name">' + esc(m.title) + '</div>' +
            '<div class="mail-time">' + esc(fmtTime(m.time)) + '</div>' +
            '</div></div>' +
            (m.body ? '<div class="mail-text">' + esc(m.body) + '</div>' : '') +
            (can
              ? '<div class="mail-act"><span class="mail-attach">✨ 附件 ' + m.dust + ' 个光尘</span>' +
                '<button class="mail-btn" type="button" data-claim="' + esc(m.id) + '">领取</button></div>'
              : '') +
            '</div>'
          )
        })
        .join('')
    }

    async function load() {
      const t = token()
      if (!t) {
        renderNoLogin()
        return
      }
      try {
        const res = await fetch('/api/mail', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        if (res.status === 401) {
          renderNoLogin()
          return
        }
        const d = await res.json().catch(() => ({}))
        if (d && d.ok) render(d)
        else $('mailSum').textContent = '读取失败：' + ((d && d.error) || res.status)
      } catch (e) {
        $('mailSum').textContent = '读取失败：网络错误'
      }
    }

    $('mailList').addEventListener('click', async (ev) => {
      const btn = ev.target.closest('[data-claim]')
      if (!btn) return
      const id = btn.getAttribute('data-claim')
      const t = token()
      if (!t) {
        toast('请先登录')
        return
      }
      btn.disabled = true
      btn.textContent = '领取中…'
      try {
        const res = await fetch('/api/mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'claim', id }),
        })
        const d = await res.json().catch(() => ({}))
        if (d && d.ok) {
          if (window.sfx) window.sfx('ding')
          toast('收到 ' + d.dust + ' 个光尘 ✨')
          // 账本变了，通知「我的」页刷新余额
          if (d.book && window.dust) {
            window.dispatchEvent(new CustomEvent('lw-mail-claimed', { detail: d }))
          }
          load()
        } else {
          btn.disabled = false
          btn.textContent = '领取'
          toast(d && d.error ? d.error : '领取失败')
        }
      } catch (e) {
        btn.disabled = false
        btn.textContent = '领取'
        toast('领取失败：网络错误')
      }
    })

    load()
  },
}
