// 个人简介
// 存在服务端，公开可读；每修改一次 10 个光尘（内容没变不扣）。
export default {
  name: 'intro',
  title: '个人简介',
  css: `
      .in-page {
        min-height: 100vh;
        padding: 14px 14px calc(30px + env(safe-area-inset-bottom, 0px));
        max-width: 520px;
        margin: 0 auto;
      }
      .in-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .in-back {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--text-muted2);
        text-decoration: none;
      }
      .in-title { font-size: 18px; font-weight: 800; color: var(--text); }

      .in-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px;
        margin-bottom: 12px;
        box-shadow: 0 2px 10px var(--shadow2, rgba(0, 0, 0, 0.05));
      }
      .in-me {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .in-me canvas {
        border-radius: 14px;
        border: 1px solid var(--border);
        image-rendering: pixelated;
        display: block;
        flex: none;
      }
      .in-me-n { min-width: 0; }
      .in-me-name {
        font-size: 16px;
        font-weight: 800;
        color: var(--text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .in-me-dust { font-size: 12px; color: var(--text-faint); margin-top: 2px; }

      .in-label {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 7px;
      }
      .in-count { font-size: 12px; color: var(--text-faint); }
      .in-count.over { color: #d9534f; font-weight: 700; }

      .in-ta {
        width: 100%;
        box-sizing: border-box;
        min-height: 96px;
        resize: vertical;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text);
        border-radius: 12px;
        padding: 11px 12px;
        font-size: 15px;
        line-height: 1.65;
        font-family: inherit;
      }
      .in-ta:focus {
        outline: none;
        border-color: var(--accent, #5b8def);
      }

      .in-cost {
        margin-top: 12px;
        font-size: 12px;
        line-height: 1.75;
        color: var(--text-faint);
      }
      .in-cost b { color: var(--text); }
      .in-cost.warn { color: #d9534f; font-weight: 700; }

      .in-preview {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px dashed var(--border);
      }
      .in-preview-t {
        font-size: 11px;
        color: var(--text-faint);
        margin-bottom: 6px;
      }
      .in-preview-b {
        font-size: 14px;
        line-height: 1.7;
        color: var(--text);
        word-break: break-word;
      }
      .in-preview-b.empty { color: var(--text-faint); }

      .in-act { margin-top: 14px; display: flex; gap: 9px; }
      .in-btn {
        flex: 1;
        border: 0;
        border-radius: 13px;
        padding: 13px;
        font-size: 15px;
        font-weight: 800;
        font-family: inherit;
        cursor: pointer;
        color: #fff;
        background: var(--accent, #5b8def);
      }
      .in-btn.ghost {
        background: var(--surface-2);
        color: var(--text);
        border: 1px solid var(--border);
        flex: 0 0 88px;
      }
      .in-btn[disabled] { opacity: 0.55; cursor: default; }

      .in-note {
        font-size: 12px;
        line-height: 1.75;
        color: var(--text-faint);
        margin: 12px 2px 0;
      }
    `,
  template: `
    <div class="in-page">
      <div class="in-head">
        <router-link class="in-back" to="/mine">← 我的</router-link>
        <div class="in-title">📝 个人简介</div>
      </div>
      <div id="inBody"><div class="in-card">正在读取…</div></div>
    </div>`,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const MAX = 60
    const COST = 10
    const A = window.LWAvatar

    let bio = ''
    let saved = ''
    let balance = 0
    let username = ''

    let toastTimer = null
    function toast(msg) {
      const el = $('toast')
      if (!el) return
      el.textContent = msg
      el.classList.add('show')
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => el.classList.remove('show'), 2200)
    }
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
    function token() {
      try {
        return localStorage.getItem('lw-token') || ''
      } catch (e) {
        return ''
      }
    }
    function clean(s) {
      return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX)
    }

    function render() {
      const dirty = clean(bio) !== saved
      const enough = balance >= COST
      $('inBody').innerHTML =
        '<div class="in-card">' +
        '<div class="in-me">' +
        '<canvas id="inAv"></canvas>' +
        '<div class="in-me-n">' +
        '<div class="in-me-name">' + esc(username || '未登录') + '</div>' +
        '<div class="in-me-dust">当前 ' + balance + ' 个光尘</div>' +
        '</div></div>' +
        '<div class="in-label"><span>简介内容</span>' +
        '<span class="in-count' + (clean(bio).length > MAX ? ' over' : '') + '" id="inCount">' +
        clean(bio).length + ' / ' + MAX + '</span></div>' +
        '<textarea class="in-ta" id="inTa" maxlength="200" placeholder="一句话介绍自己，比如「画像素的猫」「在像素小镇摸鱼三年」"></textarea>' +
        '<div class="in-cost' + (enough ? '' : ' warn') + '">' +
        (enough
          ? '保存一次花 <b>' + COST + '</b> 个光尘，之后每次修改都要再花。内容没变化不会扣。'
          : '保存需要 ' + COST + ' 个光尘，你只有 ' + balance + ' 个，还差 ' + (COST - balance) + ' 个。去「我的」签到攒一攒吧。') +
        '</div>' +
        '<div class="in-preview"><div class="in-preview-t">别人看到的效果</div>' +
        '<div class="in-preview-b' + (clean(bio) ? '' : ' empty') + '" id="inPv">' +
        (esc(clean(bio)) || '（还没写）') + '</div></div>' +
        '<div class="in-act">' +
        '<button class="in-btn ghost" type="button" id="inClear">清空</button>' +
        '<button class="in-btn" type="button" id="inSave"' + (dirty && enough ? '' : ' disabled') + '>' +
        (dirty ? '保存（' + COST + ' ✨）' : '已保存') + '</button>' +
        '</div></div>' +
        '<p class="in-note">简介会显示在「我的」页面和你的作品作者信息里。<br />请勿填联系方式或引流内容，管理员可能会清空。</p>'

      const ta = $('inTa')
      ta.value = bio
      if (A) {
        fetch('/api/avatar', { headers: { Authorization: 'Bearer ' + token() }, cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d && d.ok && A) A.draw($('inAv'), d.uid || 'anon', 44, d.pixels)
          })
          .catch(() => {})
      }

      ta.addEventListener('input', () => {
        bio = ta.value
        $('inCount').textContent = clean(bio).length + ' / ' + MAX
        $('inPv').textContent = clean(bio) || '（还没写）'
        $('inPv').classList.toggle('empty', !clean(bio))
        const d2 = clean(bio) !== saved
        const btn = $('inSave')
        btn.disabled = !d2 || balance < COST
        btn.textContent = d2 ? '保存（' + COST + ' ✨）' : '已保存'
      })
    }

    $('inBody').addEventListener('click', async (e) => {
      if (e.target.id === 'inClear') {
        bio = ''
        render()
        return
      }
      if (e.target.id !== 'inSave') return

      const btn = $('inSave')
      const t = token()
      if (!t) {
        toast('请先登录')
        return
      }
      btn.disabled = true
      btn.textContent = '保存中…'
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'bio', bio }),
        })
        const d = await res.json().catch(() => ({}))
        if (!res.ok || !d.ok) {
          if (d && d.book) balance = d.book.bal
          toast(d && d.error ? d.error : '保存失败')
          render()
          return
        }
        saved = clean(d.bio)
        bio = saved
        if (d.book) balance = d.book.bal
        if (window.sfx) window.sfx('ding')
        toast(d.cost ? '简介已保存，花了 ' + d.cost + ' 个光尘 ✨' : '内容没变化，没扣光尘')
        render()
        window.dispatchEvent(new CustomEvent('lw-bio-changed', { detail: { bio: saved } }))
      } catch (err) {
        toast('保存失败：网络错误')
        render()
      }
    })

    // 初始加载
    ;(async function init() {
      const t = token()
      if (!t) {
        $('inBody').innerHTML =
          '<div class="in-card"><div class="in-cost warn">写简介需要登录。</div></div>'
        return
      }
      try {
        const res = await fetch('/api/auth', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        if (res.status === 401) {
          $('inBody').innerHTML = '<div class="in-card"><div class="in-cost warn">登录状态已失效，请重新登录。</div></div>'
          return
        }
        const d = await res.json().catch(() => ({}))
        if (!d || !d.loggedIn) {
          $('inBody').innerHTML = '<div class="in-card"><div class="in-cost warn">登录状态已失效，请重新登录。</div></div>'
          return
        }
        username = d.username || ''
        saved = clean(d.bio || '')
        bio = saved
        // 余额从光尘账本拿
        const dr = await fetch('/api/dust', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        const dd = await dr.json().catch(() => ({}))
        balance = dd && dd.book ? Number(dd.book.bal) || 0 : 0
        render()
      } catch (e) {
        $('inBody').innerHTML = '<div class="in-card"><div class="in-cost warn">读取失败：网络错误</div></div>'
      }
    })()
  },
}
