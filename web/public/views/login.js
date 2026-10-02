// 登录 / 注册页
// 设计：白底（跟随主题，深色时为深色以保证可读），正中只有一个框，登录与注册在同一张卡里切换。
// 凭证是无状态签名令牌（服务端用 AUTH_SECRET 签发），存在本机，换设备用同样账号密码登录即可。
const TOKEN_KEY = 'lw-token'
const USER_KEY = 'lw-user'

export default {
  title: '登录',
  css: `
      .auth-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px 18px calc(24px + env(safe-area-inset-bottom, 0px));
      }
      .auth-box {
        width: 100%;
        max-width: 360px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 24px 20px 20px;
        box-shadow: 0 8px 28px var(--shadow2, rgba(0, 0, 0, 0.07));
      }
      .auth-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .auth-logo .al-mark {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: block;
      }
      .auth-title {
        text-align: center;
        font-size: 19px;
        font-weight: 800;
        color: var(--text);
        margin: 10px 0 2px;
      }
      .auth-sub {
        text-align: center;
        font-size: 13px;
        color: var(--text-muted2);
        margin-bottom: 18px;
        line-height: 1.6;
      }
      .auth-tabs {
        display: flex;
        gap: 4px;
        padding: 4px;
        background: var(--surface-2);
        border-radius: 12px;
        margin-bottom: 18px;
      }
      .auth-tab {
        flex: 1;
        padding: 9px 0;
        border: none;
        border-radius: 9px;
        background: transparent;
        color: var(--text-muted);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s, color 0.15s;
      }
      .auth-tab.on {
        background: var(--surface);
        color: var(--accent);
        box-shadow: 0 1px 3px var(--shadow1, rgba(0, 0, 0, 0.08));
      }
      .auth-field { margin-bottom: 13px; }
      .auth-label {
        display: block;
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 5px;
      }
      .auth-input {
        width: 100%;
        height: 46px;
        padding: 0 13px;
        border-radius: 12px;
        border: 1px solid var(--border-input);
        background: var(--bg);
        color: var(--text);
        font-size: 15px;
        font-family: inherit;
        -webkit-appearance: none;
        appearance: none;
      }
      .auth-input:focus {
        outline: none;
        border-color: var(--accent);
      }
      .auth-btn {
        width: 100%;
        height: 46px;
        margin-top: 4px;
        border: none;
        border-radius: 12px;
        background: var(--accent);
        color: #fff;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        font-family: inherit;
        transition: transform 0.12s, opacity 0.15s;
      }
      .auth-btn:active { transform: scale(0.98); }
      .auth-btn:disabled { opacity: 0.6; cursor: default; }
      .auth-msg {
        margin-top: 12px;
        font-size: 13px;
        text-align: center;
        min-height: 18px;
        line-height: 1.5;
      }
      .auth-msg.err { color: var(--like, #e0576a); }
      .auth-msg.ok { color: var(--accent); }
      .auth-hint {
        margin-top: 16px;
        padding-top: 14px;
        border-top: 1px solid var(--border);
        font-size: 12px;
        color: var(--text-faint);
        line-height: 1.8;
      }
      .auth-foot {
        margin-top: 18px;
        text-align: center;
        font-size: 12px;
        color: var(--text-faint);
      }
      .auth-foot a { color: var(--accent); text-decoration: none; }

      /* 已登录态 */
      .auth-done { text-align: center; }
      .auth-done .ad-ico { font-size: 40px; }
      .auth-done .ad-name {
        font-size: 18px;
        font-weight: 800;
        color: var(--text);
        margin: 10px 0 4px;
      }
      .auth-done .ad-sub { font-size: 13px; color: var(--text-muted2); margin-bottom: 20px; }
      .auth-done .auth-btn + .auth-btn {
        margin-top: 10px;
        background: var(--surface-2);
        color: var(--text-muted);
      }
  `,
  template: `<div class="auth-page">
    <div class="auth-box">
      <div id="authForm">
        <div class="auth-logo">
          <img class="al-mark" src="/icons/icon-192.png" alt="像素小镇">
        </div>
        <div class="auth-title" id="authTitle">欢迎回到小镇</div>
        <div class="auth-sub" id="authSub">登录后，你的画、光尘和连续签到都跟着账号走，换台设备也在</div>

        <div class="auth-tabs">
          <button class="auth-tab on" id="tabLogin" type="button">登录</button>
          <button class="auth-tab" id="tabRegister" type="button">注册</button>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="authName">用户名</label>
          <input class="auth-input" id="authName" type="text" maxlength="16"
                 autocomplete="username" placeholder="2~16 位，可用中文">
        </div>
        <div class="auth-field">
          <label class="auth-label" for="authPw">密码</label>
          <input class="auth-input" id="authPw" type="password" maxlength="64"
                 autocomplete="current-password" placeholder="至少 8 位，含字母和数字">
        </div>
        <div class="auth-field" id="pw2Field" hidden>
          <label class="auth-label" for="authPw2">确认密码</label>
          <input class="auth-input" id="authPw2" type="password" maxlength="64"
                 autocomplete="new-password" placeholder="再输一次">
        </div>

        <button class="auth-btn" id="authGo" type="button">登录</button>
        <div class="auth-msg" id="authMsg"></div>

        <div class="auth-hint" id="authHint">
          为什么要账号？<br />
          以前每台设备只有一串记不住的乱码，换设备就再也管不了自己发过的作品。<br />
          换成账号后：作品归属跟着你走，签到和光尘跨设备同步。
        </div>
      </div>

      <div class="auth-done" id="authDone" hidden>
        <div class="ad-ico">👋</div>
        <div class="ad-name" id="adName"></div>
        <div class="ad-sub" id="adSub"></div>
        <button class="auth-btn" id="authMine" type="button">去「我的」</button>
        <button class="auth-btn" id="authOut" type="button">退出登录</button>
      </div>

      <div class="auth-foot">
        <router-link to="/">← 返回像素小镇</router-link>
      </div>
    </div>
  </div>`,
  mounted() {
    const $ = (id) => document.getElementById(id)
    let isRegister = false
    let busy = false

    function say(msg, kind) {
      const el = $('authMsg')
      el.textContent = msg || ''
      el.className = 'auth-msg' + (kind ? ' ' + kind : '')
    }

    function setMode(reg) {
      isRegister = reg
      $('tabLogin').classList.toggle('on', !reg)
      $('tabRegister').classList.toggle('on', reg)
      $('pw2Field').hidden = !reg
      $('authTitle').textContent = reg ? '创建账号' : '欢迎回到小镇'
      $('authSub').textContent = reg
        ? '一个用户名一个身份，之后作品与光尘都归它'
        : '登录后，你的画、光尘和连续签到都跟着账号走，换台设备也在'
      $('authGo').textContent = reg ? '注册并登录' : '登录'
      $('authPw').setAttribute('autocomplete', reg ? 'new-password' : 'current-password')
      say('')
    }

    function save(token, username) {
      try {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, username)
      } catch (e) {}
      // 登录后光尘账本从本地切到服务端
      if (window.dust) window.dust.refresh()
    }
    function clearSaved() {
      try {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      } catch (e) {}
      // 退出后光尘账本切回本地记录
      if (window.dust) window.dust.refresh()
    }
    function readUser() {
      try {
        return localStorage.getItem(USER_KEY) || ''
      } catch (e) {
        return ''
      }
    }

    async function post(body) {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok, status: res.status, data }
    }

    function showLoggedIn(username) {
      $('authForm').hidden = true
      $('authDone').hidden = false
      $('adName').textContent = username
      const d = new Date()
      $('adSub').textContent =
        '账号创建于 ' + d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0')
      // 通知「我的」页刷新成登录态
      window.dispatchEvent(new CustomEvent('lw-auth-changed', { detail: { username } }))
    }

    async function submit() {
      if (busy) return
      const username = $('authName').value.trim()
      const pw = $('authPw').value
      if (!username) return say('请填写用户名', 'err')
      if (!pw) return say('请填写密码', 'err')
      if (isRegister && pw !== $('authPw2').value) return say('两次输入的密码不一致', 'err')

      busy = true
      $('authGo').disabled = true
      $('authGo').textContent = isRegister ? '注册中…' : '登录中…'
      try {
        const r = await post(
          isRegister
            ? { action: 'register', username, password: pw }
            : { action: 'login', username, password: pw }
        )
        if (!r.ok) {
          const msg = r.data.error || '操作失败，请稍后再试'
          if (/AUTH_SECRET/.test(msg)) {
            say('服务器还没配置登录密钥，账号功能暂不可用', 'err')
          } else {
            say(msg, 'err')
          }
          return
        }
        save(r.data.token, r.data.username || username)
        if (window.sfx) window.sfx('ok')
        showLoggedIn(r.data.username || username)
      } catch (e) {
        say('网络异常，请检查连接', 'err')
      } finally {
        busy = false
        $('authGo').disabled = false
        $('authGo').textContent = isRegister ? '注册并登录' : '登录'
      }
    }

    $('tabLogin').addEventListener('click', () => setMode(false))
    $('tabRegister').addEventListener('click', () => setMode(true))
    $('authGo').addEventListener('click', submit)
    $('authPw').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit()
    })
    $('authPw2').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit()
    })
    $('authMine').addEventListener('click', () => {
      location.href = '/mine'
    })
    $('authOut').addEventListener('click', () => {
      clearSaved()
      if (window.sfx) window.sfx('close')
      window.dispatchEvent(new CustomEvent('lw-auth-changed', { detail: { username: '' } }))
      $('authDone').hidden = true
      $('authForm').hidden = false
      $('authName').value = ''
      $('authPw').value = ''
      $('authPw2').value = ''
      setMode(false)
      say('已退出登录', 'ok')
    })

    // 进来先看是不是已登录
    const saved = readUser()
    if (saved) {
      // 向服务端确认凭证还有效
      fetch('/api/auth', { headers: { Authorization: 'Bearer ' + (localStorage.getItem(TOKEN_KEY) || '') } })
        .then((r) => r.json())
        .then((d) => {
          if (d && d.loggedIn) showLoggedIn(d.username || saved)
        })
        .catch(() => {})
    }
    setMode(false)
  },
}
