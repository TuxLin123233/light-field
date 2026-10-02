// 个人简介
// 存在服务端，公开可读；每修改一次 10 个光尘（内容没变不扣）。
export default {
  name: 'intro',
  title: '个人信息',
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

      /* ---------- 个人信息汇总 + 性别/生日 ---------- */
      .in-tags { display: flex; flex-wrap: wrap; margin: 12px 0 0; }
      .in-tag {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted);
        background: var(--surface-2);
        border-radius: 999px;
        padding: 5px 11px;
        margin: 0 7px 7px 0;
      }
      .in-tag.today { background: #fff3d6; color: #b8860b; }
      .in-sum {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        margin-top: 10px;
        padding-top: 12px;
        border-top: 1px solid var(--border);
      }
      .in-sum-i { text-align: center; }
      .in-sum-i b { display: block; font-size: 16px; font-weight: 800; color: var(--text); }
      .in-sum-i span { font-size: 10px; color: var(--text-faint); }
      .in-gender { display: flex; margin-top: 8px; }
      .in-g {
        flex: 1;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 10px;
        padding: 10px 0;
        font-size: 13px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
      }
      .in-g + .in-g { margin-left: 8px; }
      .in-g.on {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 14%, var(--surface));
        color: var(--accent);
      }
      .in-g[disabled] { opacity: 0.6; cursor: default; }
      .in-bd { display: flex; margin-top: 8px; }
      .in-bd-in {
        flex: 1;
        min-width: 0;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text);
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        font-family: inherit;
      }
      .in-bd-in[disabled] { opacity: 0.6; }
      .in-bd > * + * { margin-left: 8px; }
    `,
  template: `
    <div class="in-page">
      <div class="in-head">
        <router-link class="in-back" to="/mine">← 我的</router-link>
        <div class="in-title">👤 个人信息</div>
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
    /* 余额会跟着签到、领任务、送光尘变。这里用它判断「够不够付保存简介的钱」，
       不跟上就会拿着旧数字挡住保存。 */
    if (window.dust && window.dust.onChange) {
      window.dust.onChange(function (b) {
        const nb = b ? Number(b.bal) || 0 : 0
        if (nb === balance) return
        balance = nb
        try {
          if (typeof render === 'function') render()
        } catch (e) {}
      })
    }
    let username = ''

    /* ---------- 个人信息（性别 / 生日 / 汇总） ----------
       生日是不是「今天」、还能不能改，都由服务端算好给过来，
       前端不重复实现一遍历法，免得两边对不上。 */
    const GIFT = 100 // 与服务端 _auth.js 里的 BIRTHDAY_GIFT 保持一致
    const GENDER_LABEL = { male: '🙋 男生', female: '🙋‍♀️ 女生', secret: '🕶️ 保密' }
    const GENDER_KEYS = ['male', 'female', 'secret']
    let gender = ''
    let birthday = ''
    let bdLock = 0 // 生日还要等多少毫秒才能改
    let todayBd = false
    let pstats = null // { works, likes, cells }
    let joinedAt = 0
    let received = 0

    const bdText = (b) => {
      if (!b) return ''
      const p = String(b).split('-')
      return Number(p[0]) + ' 月 ' + Number(p[1]) + ' 日'
    }
    const daysSince = (t) => (t ? Math.max(1, Math.floor((Date.now() - t) / 86400000)) : 0)

    /** 改性别 / 生日都走这个 */
    async function postAbout(payload) {
      const t = token()
      if (!t) {
        toast('请先登录')
        return null
      }
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'about', ...payload }),
        })
        return await res.json().catch(() => ({}))
      } catch (e) {
        return { error: '网络错误' }
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
        '<div class="in-tags">' +
        '<span class="in-tag">' + (gender ? GENDER_LABEL[gender] : '性别未填') + '</span>' +
        '<span class="in-tag' + (todayBd ? ' today' : '') + '">' +
        (birthday ? '🎂 ' + bdText(birthday) + (todayBd ? '　今天！' : '') : '生日未填') +
        '</span>' +
        (joinedAt ? '<span class="in-tag">🏠 入住 ' + daysSince(joinedAt) + ' 天</span>' : '') +
        '</div>' +
        (pstats
          ? '<div class="in-sum">' +
            '<div class="in-sum-i"><b>' + (pstats.works || 0) + '</b><span>作品</span></div>' +
            '<div class="in-sum-i"><b>' + (pstats.cells || 0) + '</b><span>绘制格数</span></div>' +
            '<div class="in-sum-i"><b>' + (pstats.likes || 0) + '</b><span>收到赞</span></div>' +
            '<div class="in-sum-i"><b>' + received + '</b><span>收到光尘</span></div>' +
            '</div>'
          : '') +
        '</div>' +

        /* 性别 / 生日。生日一年只能改一次，锁住时输入框和按钮都置灰 */
        '<div class="in-card">' +
        '<div class="in-label"><span>性别</span></div>' +
        '<div class="in-gender" id="inGender">' +
        GENDER_KEYS.map(
          (g) =>
            '<button class="in-g' + (gender === g ? ' on' : '') + '" type="button" data-g="' + g + '">' +
            GENDER_LABEL[g] +
            '</button>'
        ).join('') +
        '</div>' +
        '<div class="in-label" style="margin-top:16px"><span>生日</span>' +
        (bdLock > 0 ? '<span class="in-count">还要 ' + Math.ceil(bdLock / 86400000) + ' 天才能改</span>' : '') +
        '</div>' +
        '<div class="in-bd">' +
        '<input class="in-bd-in" id="inBd" type="text" inputmode="numeric" maxlength="5" ' +
        'placeholder="月-日，例如 03-15" value="' +
        esc(birthday) +
        '"' +
        (bdLock > 0 ? ' disabled' : '') +
        '>' +
        '<button class="in-btn" type="button" id="inBdSave"' +
        (bdLock > 0 ? ' disabled' : '') +
        '>保存</button>' +
        '</div>' +
        '<div class="in-cost">生日当天，小镇会往你账本里放 <b>' +
        GIFT +
        '</b> 个光尘。' +
        (bdLock > 0
          ? '生日一年只能改一次，所以这份礼物一年也只有一次。'
          : '填下之后一年只能改一次，想清楚再填～') +
        '</div>' +
        '</div>' +

        '<div class="in-card">' +
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
          if (d && d.book) {
            balance = d.book.bal
            if (window.dust && window.dust.take) window.dust.take(d.book)
          }
          toast(d && d.error ? d.error : '保存失败')
          render()
          return
        }
        saved = clean(d.bio)
        bio = saved
        if (d.book) {
          balance = d.book.bal
          /* 改简介要扣 10 光尘：喂回全局账本，
             否则切到别的页面看的还是旧的余额 */
          if (window.dust && window.dust.take) window.dust.take(d.book)
        }
        if (window.sfx) window.sfx('ding')
        toast(d.cost ? '简介已保存，花了 ' + d.cost + ' 个光尘 ✨' : '内容没变化，没扣光尘')
        render()
        window.dispatchEvent(new CustomEvent('lw-bio-changed', { detail: { bio: saved } }))
      } catch (err) {
        toast('保存失败：网络错误')
        render()
      }
    })

    /* 性别 / 生日。挂在 #inBody 的委托上，render() 重画之后不用重绑 */
    $('inBody').addEventListener('click', async (e) => {
      const gb = e.target.closest ? e.target.closest('[data-g]') : null
      if (gb) {
        const next = gb.getAttribute('data-g')
        if (next === gender || gb.disabled) return
        gb.disabled = true
        const d = await postAbout({ gender: next })
        gb.disabled = false
        if (!d || !d.ok) {
          toast((d && d.error) || '保存失败')
          return
        }
        gender = d.gender || ''
        if (window.sfx) window.sfx('tick')
        render()
        return
      }
      if (e.target.id !== 'inBdSave') return
      const inp = $('inBd')
      const btn = e.target
      if (!inp || btn.disabled) return
      btn.disabled = true
      const d = await postAbout({ birthday: (inp.value || '').trim() })
      btn.disabled = false
      if (!d || !d.ok) {
        // 一年只能改一次：服务端会把「还要等多少天」写在 error 里
        toast((d && d.error) || '保存失败')
        return
      }
      birthday = d.birthday || ''
      bdLock = Number(d.birthdayLockLeft) || 0
      if (window.sfx) window.sfx('ding')
      toast(birthday ? '生日记下了：' + bdText(birthday) + ' 🎂' : '生日已清空')
      render()
    })
    // 生日输入框里按回车等于点「保存」
    $('inBody').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target && e.target.id === 'inBd') {
        e.preventDefault()
        const btn = $('inBdSave')
        if (btn && !btn.disabled) btn.click()
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
        // 个人信息：不带参数就是查自己，性别/生日/汇总都在这一份里
        const pr = await fetch('/api/profile', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        if (pr.ok) {
          const pd = await pr.json().catch(() => ({}))
          if (pd && pd.ok) {
            gender = pd.gender || ''
            birthday = pd.birthday || ''
            bdLock = Number(pd.birthdayLockLeft) || 0
            todayBd = !!pd.todayBirthday
            pstats = pd.stats || null
            joinedAt = Number(pd.createdAt) || 0
            received = Number(pd.received) || 0
          }
        }
        render()
      } catch (e) {
        // 以前一律写「网络错误」，真实异常被吞掉了
        console.error('[intro] 读取失败', e)
        const why = (e && (e.message || e.name)) || '未知错误'
        $('inBody').innerHTML =
          '<div class="in-card"><div class="in-cost warn">读取失败：' + esc(why) + '</div></div>'
      }
    })()
  },
}
