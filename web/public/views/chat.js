// 好友与聊天（/chat）
//
// 这里是「非实时」最直白的地方：没有任何轮询、没有推送、没有在线状态。
// 对方发的新消息，你要自己点右上角的「刷新」才拉得到。
// 页面底部会显示对方最后一条消息的时间，如果比自己这边的旧，就提示
// 「可能有新消息，点刷新看看」。
//
// 会话列表在 /chat?to=<uid> 指定聊天对象时隐藏「返回列表」以外的复杂度，
// 好友列表从 /api/chat?type=list 拿。
export default {
  name: 'chat',
  title: '好友',
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
      .ch-wrap { max-width: 460px; margin: 0 auto; padding: 14px 16px 96px; }
      /* ---------- 对话模式：整屏 flex，消息滚动、输入框钉在底部 ----------
         高度优先用 dvh（会随键盘收缩），JS 里再用 visualViewport 兜一层 ——
         有些老浏览器不认 dvh，键盘弹起来时输入框会被挡住。
         padding-bottom 补上安全区，iPhone 的横条不会盖住输入框。 */
      .ch-wrap.thread {
        padding: 0;
        height: 100vh;
        height: 100dvh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .ch-wrap.thread .ch-bar { padding: 14px 16px 0; flex: none; }
      .ch-wrap.thread .ch-note { margin: 8px 16px 0; flex: none; }
      .ch-wrap.thread #chBody {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 0 16px;
      }
      .ch-wrap.thread .ch-empty {
        flex: 1 1 auto;
        display: flex; flex-direction: column; justify-content: center;
      }
      .ch-wrap.thread .ch-msgs {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
      .ch-wrap.thread .ch-del { flex: none; }
      .ch-wrap.thread .ch-sendbar {
        flex: none;
        padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      }
      .ch-bar { display: flex; align-items: center; margin-bottom: 4px; }
      .ch-bar > * + * { margin-left: 10px; }
      .ch-back {
        display: inline-flex; align-items: center;
        border: 1px solid var(--border-strong); background: var(--surface-2);
        color: var(--text-muted); border-radius: 999px; padding: 6px 13px;
        font-size: 12px; font-weight: 700; text-decoration: none; flex: none;
      }
      .ch-bar-main { flex: 1; min-width: 0; }
      .ch-title { font-size: 17px; font-weight: 800; color: var(--text); }
      .ch-sub { font-size: 11px; color: var(--text-faint); }
      .ch-note {
        font-size: 11px; color: var(--text-faint); background: var(--surface-2);
        border-radius: 10px; padding: 7px 10px; margin: 10px 0 4px; line-height: 1.7;
      }
      .ch-note b { color: var(--text-muted); }

      .ch-list { display: flex; flex-direction: column; margin-top: 10px; }
      .ch-list > * + * { margin-top: 8px; }
      /* 不用 flex 的 gap：微信 X5 内核不支持，间距会整个塌成 0，
         所以头像和文字之间一律靠 margin 撑开。 */
      .ch-row {
        display: flex; align-items: center; text-decoration: none;
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 13px; padding: 10px 12px; color: inherit;
      }
      .ch-av {
        position: relative;
        width: 42px; height: 42px; flex: 0 0 42px; border-radius: 12px; overflow: hidden;
        background: var(--surface-2); border: 1px solid var(--border-strong);
        margin-right: 11px;   /* ← 头像和「名字 + 最新消息」之间的间距，之前漏了 */
      }
      .ch-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .ch-main { flex: 1; min-width: 0; }
      .ch-name {
        font-size: 14px; font-weight: 700; color: var(--text);
        display: block; line-height: 1.35;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-last {
        font-size: 12px; color: var(--text-faint); display: block;
        margin-top: 3px; line-height: 1.45;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-last.mine { color: var(--text-muted); }
      /* 右侧一列：时间在上，未读在下 */
      .ch-side {
        flex: none; margin-left: 9px; min-height: 42px;
        display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
      }
      .ch-time { font-size: 10px; color: var(--text-faint); white-space: nowrap; }
      /* 未读：红点 + 条数。1 条时是一个小圆点，多了才显示数字 */
      .ch-unread {
        margin-top: 5px;
        min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box;
        border-radius: 999px; background: #e5574b; color: #fff;
        font-size: 11px; font-weight: 800; line-height: 18px; text-align: center;
      }
      .ch-unread.dot { min-width: 10px; width: 10px; height: 10px; padding: 0; }

      /* ---------- 加好友 ---------- */
      .ch-find { margin-top: 10px; }
      .ch-find-btn {
        display: block; width: 100%;
        border: 1px dashed var(--border-strong); background: var(--surface);
        color: var(--accent); border-radius: 13px; padding: 11px;
        font-size: 13px; font-weight: 800; font-family: inherit; cursor: pointer;
      }
      .ch-find-btn.on {
        border-style: solid; background: var(--surface-2); color: var(--text-muted);
      }
      .ch-find-panel { margin-top: 8px; }
      .ch-panel {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 13px; padding: 12px;
      }
      .ch-panel h4 { margin: 0 0 6px; font-size: 13px; font-weight: 800; color: var(--text); }
      .ch-panel h4.ch-find-h2 { margin-top: 14px; }
      .ch-panel-n { color: var(--accent); }
      .ch-find-empty { font-size: 12px; color: var(--text-faint); padding: 8px 2px; line-height: 1.7; }
      .ch-friend-row { display: flex; align-items: center; padding: 8px 0; }
      .ch-friend-row + .ch-friend-row { border-top: 1px solid var(--border); }
      .ch-friend-row .ch-av { width: 36px; height: 36px; flex: 0 0 36px; margin-right: 9px; }
      .ch-friend-main { flex: 1; min-width: 0; }
      .ch-friend-name {
        font-size: 13px; font-weight: 700; color: var(--text); display: block;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-friend-bio {
        font-size: 11px; color: var(--text-faint); display: block; margin-top: 2px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-friend-act {
        flex: none; margin-left: 8px;
        border: 0; border-radius: 999px; padding: 7px 13px;
        background: var(--accent); color: #fff;
        font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
      }
      .ch-friend-act[disabled] { opacity: 0.6; cursor: default; }
      .ch-search { display: flex; margin-top: 2px; }
      .ch-search input {
        flex: 1; min-width: 0;
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text); border-radius: 10px; padding: 9px 11px;
        font-size: 13px; font-family: inherit;
      }
      .ch-search > * + * { margin-left: 7px; }
      .ch-search button {
        flex: none; border: 0; border-radius: 10px; padding: 0 14px;
        background: var(--accent); color: #fff;
        font-size: 13px; font-weight: 800; font-family: inherit; cursor: pointer;
      }


      /* 这里用子元素 margin 而不是 flex 的 gap。
         flex 的 gap 要 Chrome 84 才支持，个别手机上的浏览器（微信里的 X5 内核）
         不支持就会让间距整个塌成 0。margin 没有这个兼容问题，两边都稳妥。 */
      /* 对话气泡 */
      .ch-msgs {
        display: flex; flex-direction: column;
        margin: 12px 0; min-height: 90px;
        max-width: 100%; min-width: 0;
      }
      .ch-msgs > * + * { margin-top: 9px; }
      /* min-width: 0 不能省：flex 子项默认 min-width:auto，
         不许缩到比内容还窄，里面再窄的容器也拦不住。
         overflow-wrap:anywhere 比 word-break:break-word 兼容性好 ——
         后者在老 Safari / WebView 上不被支持，会退化成 normal，
         一条长网址就能把气泡顶出屏幕（用户反馈「消息框溢出到右边」）。 */
      .ch-msg {
        display: flex; align-items: flex-start; max-width: 88%; min-width: 0;
        animation: chIn 0.18s ease-out;
      }
      @keyframes chIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) { .ch-msg { animation: none; } }
      .ch-msg.mine { align-self: flex-end; flex-direction: row-reverse; }
      .ch-msg-av {
        width: 28px; height: 28px; flex: 0 0 28px; border-radius: 9px; overflow: hidden;
        background: var(--surface-2); border: 1px solid var(--border-strong);
        margin-right: 7px; margin-top: 2px;
      }
      .ch-msg-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .ch-bubble-col { min-width: 0; display: flex; flex-direction: column; }
      .ch-msg.mine .ch-bubble-col { align-items: flex-end; }
      .ch-bubble {
        padding: 9px 13px; border-radius: 16px; font-size: 13.5px; line-height: 1.65;
        max-width: 100%; min-width: 0;
        overflow-wrap: anywhere; word-break: break-word; white-space: pre-wrap;
        background: var(--surface); border: 1px solid var(--border); color: var(--text);
        box-shadow: 0 1px 2px rgba(80, 60, 40, 0.06);
      }
      .ch-msg.mine .ch-bubble {
        background: var(--accent); color: #fff; border-color: var(--accent);
        border-bottom-right-radius: 5px;
      }
      .ch-msg:not(.mine) .ch-bubble { border-bottom-left-radius: 5px; }
      .ch-mtime { font-size: 10px; color: var(--text-faint); margin-top: 4px; padding: 0 3px; }
      .ch-msg.mine .ch-mtime { text-align: right; }
      /* 跨天时插一条日期分隔 */
      .ch-day {
        align-self: center; font-size: 10.5px; color: var(--text-faint);
        background: var(--surface-2); border-radius: 999px; padding: 3px 11px;
        margin: 4px 0 2px;
      }
      .ch-new {
        align-self: center; font-size: 11px; color: var(--accent);
        background: color-mix(in srgb, var(--accent) 12%, var(--surface));
        border-radius: 999px; padding: 4px 11px; font-weight: 700;
      }
      .ch-sendbar { display: flex; margin-top: 10px; min-width: 0; position: relative; }
      .ch-in {
        /* min-width: 0 必须写：<input> 有 size 属性带来的固有宽度，
           作为 flex 子项默认 min-width:auto 缩不下去，窄屏会把「发送」挤出屏幕。 */
        flex: 1 1 auto; min-width: 0;
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text); border-radius: 12px; padding: 10px 12px;
        font-size: 13px; font-family: inherit; line-height: 1.5;
      }
      .ch-sendbar > * + * { margin-left: 8px; }
      .ch-in:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
      .ch-send {
        flex: 0 0 auto; border: 0; border-radius: 12px; padding: 0 17px;
        font-size: 13px; font-weight: 800; font-family: inherit;
        background: var(--accent); color: #fff; cursor: pointer;
      }
      .ch-send[disabled] { background: var(--surface-2); color: var(--text-faint); cursor: default; }
      .ch-empty { font-size: 13px; color: var(--text-faint); text-align: center; padding: 30px 10px; line-height: 1.9; }
      .ch-msg-box {
        margin-top: 12px; font-size: 12px; border-radius: 10px; padding: 9px 11px;
        background: var(--surface-2); color: var(--text-muted);
      }
      .ch-msg-box.bad { background: #fdecea; color: #c0392b; }
      .ch-del { margin-left: auto; font-size: 11px; }

      /* ---------- 表情面板 ---------- */
      .ch-emoji-btn {
        flex: 0 0 auto; width: 42px;
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text); border-radius: 12px; font-size: 18px; line-height: 1;
        cursor: pointer; font-family: inherit;
      }
      .ch-emoji-btn.on {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 14%, var(--surface));
      }
      .ch-emoji {
        position: absolute; left: 0; right: 0; bottom: calc(100% + 8px);
        background: var(--surface); border: 1px solid var(--border-strong);
        border-radius: 14px; box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
        padding: 8px; z-index: 30;
      }
      .ch-emoji[hidden] { display: none; }
      .ch-emoji-tabs { display: flex; margin-bottom: 6px; }
      .ch-emoji-tabs button {
        flex: 1; border: 0; background: transparent; color: var(--text-muted);
        font-size: 12px; font-weight: 700; font-family: inherit;
        padding: 5px 0; border-radius: 8px; cursor: pointer;
      }
      .ch-emoji-tabs button.on { background: var(--surface-2); color: var(--text); }
      .ch-emoji-grid {
        display: grid; grid-template-columns: repeat(8, 1fr);
        max-height: 170px; overflow-y: auto; -webkit-overflow-scrolling: touch;
      }
      .ch-emoji-grid button {
        border: 0; background: transparent; font-size: 20px; line-height: 1;
        padding: 6px 0; border-radius: 8px; cursor: pointer;
      }
      .ch-emoji-grid button:active { background: var(--surface-2); }
    `,
  template: `
    <div class="ch-wrap">
      <div class="ch-bar">
        <a class="ch-back" id="chBack" href="/mine">← 我的</a>
        <div class="ch-bar-main">
          <div class="ch-title" id="chTitle">💬 好友</div>
          <div class="ch-sub" id="chSub"></div>
        </div>
        <button class="lw-refresh" id="chRefresh" type="button" data-label="刷新"></button>
      </div>
      <div class="ch-note" id="chNote" hidden></div>
      <div id="chBody"><div class="ch-empty"><span class="lw-load"></span>正在读取…</div></div>
      <div class="ch-msg-box" id="chMsg" hidden></div>
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
    const C = window.LWCache || {}
    const q = new URLSearchParams(location.search)
    const wantUid = (q.get('to') || '').trim()
    /* 一进对话就先切成整屏布局，否则要等数据回来才「跳」一下。
       setThreadMode 是函数声明，会被提升，所以这里能提前调。 */
    if (wantUid) setThreadMode(true)

    // 记住自己这边最后一条的时间，用来判断「对方是不是有新消息」
    let myLastAt = 0
    let peerLastAt = 0
    let peerName = ''
    let hasNew = false

    const fmt = (t) => {
      const d = Date.now() - (Number(t) || 0)
      if (d < 60000) return '刚刚'
      if (d < 3600000) return Math.floor(d / 60000) + ' 分钟前'
      if (d < 86400000) return Math.floor(d / 3600000) + ' 小时前'
      if (d < 86400000 * 7) return Math.floor(d / 86400000) + ' 天前'
      return new Date(Number(t)).toLocaleDateString('zh-CN')
    }
    const clock = (t) => {
      const d = new Date(Number(t) || 0)
      const p = (n) => String(n).padStart(2, '0')
      return p(d.getHours()) + ':' + p(d.getMinutes())
    }
    const dayOf = (t) => {
      const d = new Date(Number(t) || 0)
      return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
    }
    const dayLabel = (t) => {
      const d = new Date(Number(t) || 0)
      const now = new Date()
      const same = (a, b) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
      if (same(d, now)) return '今天'
      if (same(d, new Date(now.getTime() - 86400000))) return '昨天'
      return d.getMonth() + 1 + ' 月 ' + d.getDate() + ' 日'
    }

    /* ---------- 表情 ----------
       按分组列出来，点一下插到输入框的光标处，可以连着点好几个。 */
    const EMOJI_GROUPS = [
      {
        name: '常用',
        list: ['😀','😄','😂','🤣','😊','🥰','😍','😘','😜','🤔','😅','😭','😡','🥺','😴','🤗','👍','👎','👏','🙏','💪','✌️','👌','🫶','❤️','💔','✨','🔥','🎉','🌟','✅','❌'],
      },
      {
        name: '表情',
        list: ['😃','😁','😆','🙂','🙃','😉','😇','😋','😛','🤪','😝','🤭','🤫','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','😢','😤','😠','🤯','😱','😨','😰','😥','😓','🤤','😪','🥱','😷','🥳','😎','🤓','🧐','😕','😟','😔','😞','😖','😫','😩'],
      },
      {
        name: '手势',
        list: ['👋','🤚','✋','🖐️','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','🙏','🤝','💪','🦾','✍️','💅','🫡'],
      },
      {
        name: '物品',
        list: ['🎨','🖌️','🖼️','📷','📸','🎮','🎵','🎧','🎤','🏆','🥇','🎁','🎈','🎂','🍰','🍕','🍔','🍎','🍺','☕','⚽','🏀','🚀','✈️','🚗','🏠','💡','🔔','📌','📢','🔍','🔑','💎','🪙','🎯'],
      },
      {
        name: '符号',
        list: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💖','💗','💓','💞','💕','💔','❣️','💯','✨','⭐','🌟','🔥','💫','⚡','🌈','☀️','🌙','⛅','🌧️','❄️','🍀','🌸','🌺','🌻','🌹','🌵','🌊','✅','❌','❓','❗','💤','💬','👀'],
      },
    ]

    function setupEmojiPanel(tabsEl, gridEl, onPick) {
      let cur = 0
      const drawTabs = () => {
        tabsEl.innerHTML = EMOJI_GROUPS.map(
          (g, i) =>
            '<button type="button" data-g="' + i + '"' + (i === cur ? ' class="on"' : '') + '>' +
            esc(g.name) + '</button>'
        ).join('')
      }
      const drawGrid = () => {
        gridEl.innerHTML = EMOJI_GROUPS[cur].list
          .map((e) => '<button type="button" data-e="' + esc(e) + '">' + esc(e) + '</button>')
          .join('')
      }
      tabsEl.addEventListener('click', (ev) => {
        const b = ev.target.closest ? ev.target.closest('button[data-g]') : null
        if (!b) return
        cur = Number(b.getAttribute('data-g')) || 0
        drawTabs()
        drawGrid()
        if (window.sfx) window.sfx('tick')
      })
      gridEl.addEventListener('click', (ev) => {
        const b = ev.target.closest ? ev.target.closest('button[data-e]') : null
        if (!b) return
        onPick(b.getAttribute('data-e'))
      })
      drawTabs()
      drawGrid()
    }

    /* 插到光标处（而不是无脑追加到末尾），在一句话中间补表情也顺手 */
    function insertAtCursor(input, text) {
      const v = input.value
      const start = input.selectionStart == null ? v.length : input.selectionStart
      const end = input.selectionEnd == null ? v.length : input.selectionEnd
      input.value = v.slice(0, start) + text + v.slice(end)
      const pos = start + text.length
      try {
        input.setSelectionRange(pos, pos)
      } catch (e) {}
      input.dispatchEvent(new Event('input'))
      input.focus()
    }

    function showMsg(text, bad) {
      const el = $('chMsg')
      el.textContent = text || ''
      el.hidden = !text
      el.classList.toggle('bad', !!bad)
    }

    /* ---------- 对话模式的整屏适配 ----------
       键盘弹起时 visualViewport.height 会缩小，把容器高度跟着调，
       输入框才会贴在键盘上方而不是被挡住（老浏览器不认 100dvh，得靠这层）。 */
    function fitThread() {
      const wrap = document.querySelector('.ch-wrap.thread')
      if (!wrap) return
      const vv = window.visualViewport
      const h = vv && vv.height ? vv.height : window.innerHeight
      wrap.style.height = Math.round(h) + 'px'
    }

    function setThreadMode(on) {
      const wrap = document.querySelector('.ch-wrap')
      if (wrap) wrap.classList.toggle('thread', !!on)
      if (on) fitThread()
    }

    /* 返回按钮：会话列表回「我的」，对话里回会话列表
       （对话中底部导航是隐藏的，所以必须有个回来的入口）。 */
    function setBack(to, label) {
      const el = $('chBack')
      if (!el) return
      el.textContent = label
      el.setAttribute('href', to)
      el.onclick = (e) => {
        e.preventDefault()
        if (window.__lwRouter) window.__lwRouter.push(to)
        else location.href = to
      }
    }

    /* ---------- 会话列表 ---------- */
    function drawList(d) {
      setThreadMode(false)
      setBack('/mine', '← 我的')
      $('chTitle').textContent = '💬 好友'
      $('chNote').hidden = false
      $('chNote').innerHTML =
        '这里是你的<b>好友</b>。两个人要<b>互相加好友</b>才能聊天；' +
        '聊天是<b>非实时</b>的：不轮询、不推送，对方发了新消息要自己点右上角的<b>刷新</b>。'
      const rows = d.list || []

      /* 「加好友」始终给入口：已经有好友了也可能想加新的 */
      const findBar =
        '<div class="ch-find">' +
        '<button class="ch-find-btn" id="chFindBtn" type="button">＋ 加好友</button>' +
        '<div class="ch-find-panel" id="chFindPanel" hidden></div>' +
        '</div>'

      const listHtml = rows.length
        ? '<div class="ch-list">' +
          rows
            .map((r) => {
              const last = r.last ? (r.lastMine ? '我：' + r.last : r.last) : '还没有消息'
              const n = Math.max(0, Number(r.unread) || 0)
              /* 未读提示：1 条就是一个小红点，多条才显示数字（超过 99 记 99+） */
              const badge = n
                ? '<span class="ch-unread' + (n === 1 ? ' dot' : '') + '">' +
                  (n === 1 ? '' : n > 99 ? '99+' : String(n)) +
                  '</span>'
                : ''
              return (
                '<a class="ch-row" data-to="' + esc(r.uid) + '">' +
                '<span class="ch-av" data-uid="' + esc(r.uid) + '"></span>' +
                '<span class="ch-main">' +
                '<span class="ch-name">' + esc(r.name) + '</span>' +
                '<span class="ch-last' + (r.lastMine ? ' mine' : '') + '">' + esc(last) + '</span>' +
                '</span>' +
                '<span class="ch-side">' +
                '<span class="ch-time">' + esc(r.lastAt ? fmt(r.lastAt) : '') + '</span>' +
                badge +
                '</span>' +
                '</a>'
              )
            })
            .join('') +
          '</div>'
        : '<div class="ch-empty">还没有好友。<br />点上面的「＋ 加好友」按用户名找找看，<br />' +
          '或者在社区里点作者名字，到他的主页点「＋ 加好友」。</div>'

      $('chBody').innerHTML = findBar + listHtml
      paintAvatars()
      bindFindPanel()
      $('chBody').querySelectorAll('.ch-row').forEach((a) => {
        a.addEventListener('click', () => {
          if (window.__lwRouter) window.__lwRouter.push('/chat?to=' + encodeURIComponent(a.getAttribute('data-to')))
        })
      })
    }

    /* ---------- 加好友 ----------
       规则：我关注你 = 发出好友申请；互相关注 = 成为好友。
       所以这里要做两件事：把「谁申请加你」列出来一键通过，以及按用户名主动找。 */
    let staleList = false

    function bindFindPanel() {
      const btn = $('chFindBtn')
      const panel = $('chFindPanel')
      if (!btn || !panel) return
      btn.addEventListener('click', () => {
        const willOpen = panel.hidden
        panel.hidden = !willOpen
        btn.classList.toggle('on', willOpen)
        btn.textContent = willOpen ? '收起' : '＋ 加好友'
        if (window.sfx) window.sfx(willOpen ? 'open' : 'close')
        if (willOpen) {
          if (!panel.dataset.ready) openFindPanel()
        } else if (staleList) {
          // 加过好友：收起面板时再刷新列表，这样能在面板里连着通过好几个
          staleList = false
          load(true)
        }
      })
    }

    async function openFindPanel() {
      const panel = $('chFindPanel')
      if (!panel) return
      panel.dataset.ready = '1'
      panel.innerHTML =
        '<div class="ch-panel"><div class="ch-find-empty"><span class="lw-load"></span>读取中…</div></div>'
      let pend = []
      try {
        const res = await fetch('/api/follow?type=pending', {
          headers: { Authorization: 'Bearer ' + token() },
          cache: 'no-store',
        })
        const d = await res.json().catch(() => ({}))
        pend = (d && d.list) || []
      } catch (e) {}
      renderFindPanel(pend)
    }

    function friendRow(u, label) {
      return (
        '<div class="ch-friend-row">' +
        '<span class="ch-av" data-uid="' + esc(u.uid) + '"></span>' +
        '<span class="ch-friend-main">' +
        '<span class="ch-friend-name">' + esc(u.username) + '</span>' +
        '<span class="ch-friend-bio">' + esc(u.bio || '这个人很低调，什么都没写') + '</span>' +
        '</span>' +
        '<button class="ch-friend-act" type="button" data-uid="' + esc(u.uid) + '">' +
        esc(label) +
        '</button>' +
        '</div>'
      )
    }

    function renderFindPanel(pend) {
      const panel = $('chFindPanel')
      if (!panel) return
      panel.innerHTML =
        '<div class="ch-panel">' +
        '<h4>想加你好友' + (pend.length ? ' <span class="ch-panel-n">' + pend.length + '</span>' : '') + '</h4>' +
        (pend.length
          ? pend.map((u) => friendRow(u, '通过')).join('')
          : '<div class="ch-find-empty">还没有人申请加你好友</div>') +
        '<h4 class="ch-find-h2">按用户名找好友</h4>' +
        '<div class="ch-search">' +
        '<input id="chFindName" type="text" maxlength="16" placeholder="对方的用户名" autocomplete="off">' +
        '<button id="chFindGo" type="button">查找</button>' +
        '</div>' +
        '<div id="chFindResult"></div>' +
        '</div>'
      paintAvatars()
      panel.querySelectorAll('.ch-friend-act').forEach((b) => {
        b.addEventListener('click', () => addFriend(b.getAttribute('data-uid'), b))
      })
      const go = $('chFindGo')
      const inp = $('chFindName')
      if (go && inp) {
        const run = () => findUser(inp.value.trim())
        go.addEventListener('click', run)
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            run()
          }
        })
      }
    }

    async function findUser(name) {
      const box = $('chFindResult')
      if (!box) return
      if (!name) {
        box.innerHTML = ''
        return
      }
      box.innerHTML = '<div class="ch-find-empty"><span class="lw-load"></span>查找中…</div>'
      try {
        const res = await fetch('/api/profile?name=' + encodeURIComponent(name), { cache: 'no-store' })
        const d = await res.json().catch(() => ({}))
        if (!res.ok || !d || !d.ok) {
          box.innerHTML = '<div class="ch-find-empty">没有找到「' + esc(name) + '」这个用户</div>'
          return
        }
        box.innerHTML = friendRow({ uid: d.uid, username: d.username, bio: d.bio }, '加好友')
        paintAvatars()
        const b = box.querySelector('.ch-friend-act')
        if (b) b.addEventListener('click', () => addFriend(d.uid, b))
      } catch (e) {
        box.innerHTML = '<div class="ch-find-empty">查找失败，稍后再试</div>'
      }
    }

    async function addFriend(uid, btn) {
      if (!uid || !btn || btn.disabled) return
      const t = token()
      if (!t) {
        showMsg('加好友需要先登录', true)
        return
      }
      btn.disabled = true
      const old = btn.textContent
      btn.textContent = '…'
      try {
        const res = await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'follow', uid }),
        })
        const d = await res.json().catch(() => ({}))
        if (!res.ok || !d || !d.ok) {
          btn.disabled = false
          btn.textContent = old
          showMsg((d && d.error) || '加好友失败', true)
          return
        }
        if (window.sfx) window.sfx(d.friend ? 'follow' : 'ok')
        /* 按钮就地变成结果，面板不关 —— 这样能连着通过好几个申请 */
        btn.textContent = d.friend ? '好友 ✓' : '已申请'
        staleList = true
        C.drop('chatlist')
        C.drop('chatBadge')
        try {
          window.dispatchEvent(new CustomEvent('lw-chat-changed'))
        } catch (e) {}
        showMsg(d.friend ? '你们已经是好友了 🤝 可以聊天了' : '已发出好友申请，等对方通过')
      } catch (e) {
        btn.disabled = false
        btn.textContent = old
        showMsg('加好友失败：网络错误', true)
      }
    }

    /* 会话列表头像是 42px，消息气泡旁的是 28px */
    const avSize = (el) => (el.classList.contains('ch-msg-av') ? 28 : 42)

    function paintAvatars() {
      const boxes = document.querySelectorAll('.ch-av[data-uid], .ch-msg-av[data-uid]')
      if (!window.LWAvatar) return
      const uids = []
      boxes.forEach((el) => {
        const uid = el.getAttribute('data-uid')
        if (!uid) return
        const c = document.createElement('canvas')
        el.appendChild(c)
        window.LWAvatar.draw(c, uid, avSize(el))
        uids.push(uid)
      })
      if (uids.length && window.LWAvatar.load) {
        window.LWAvatar
          .load(uids)
          .then(() => {
            boxes.forEach((el) => {
              const c = el.querySelector('canvas')
              if (c) window.LWAvatar.draw(c, el.getAttribute('data-uid'), avSize(el))
            })
          })
          .catch(() => {})
      }
    }

    /* ---------- 对话 ---------- */
    function drawThread(d) {
      setThreadMode(true)
      setBack('/chat', '← 消息')
      peerName = (d.with && d.with.name) || ''
      $('chTitle').textContent = '💬 ' + peerName
      $('chNote').hidden = false
      $('chNote').innerHTML =
        '和好友 <b>' + esc(peerName) + '</b> 聊天。' +
        '<b>非实时</b>：对方发了新消息要自己点<b>刷新</b>。'

      const items = d.items || []
      // 算「有没有我还没看到的新消息」：对方最后一条比我这边最后一条新
      const mine = items.filter((m) => m.mine)
      myLastAt = mine.length ? Number(mine[mine.length - 1].at) || 0 : 0
      peerLastAt = Number(d.peerLastAt) || 0
      hasNew = !!(peerLastAt > myLastAt)

      /* 输入栏元素：必须声明在函数开头。
         放在后面会撞上 TDZ —— 空对话那条分支先执行，
         赋值时 let 还没初始化，直接抛
         「Cannot access 'inp' before initialization」，
         结果输入框没渲染、消息也发不出去。
         同时 doSend() 也要用它们，不能是 bindSend 的局部变量。 */
      let inp = null
      let send = null
      /* 发送键的启用状态。doSend() 结束时也要调它把按钮恢复成禁用，
         所以必须在外层 —— 之前声明在 bindSend 内部，doSend 里调不到。 */
      const sync = () => {
        if (send) send.disabled = !inp.value.trim()
      }

      /* 输入框必须永远都在。
         以前它被写在「有消息才渲染」那段里，于是新会话（一条都还没发过）
         页面写着「说点什么打个招呼吧」，底下却连个输入框都没有，
         根本没法开口（用户反馈）。空对话只清空消息区，输入栏照常渲染。 */
      const sendbar =
        '<div class="ch-sendbar">' +
        '<button class="ch-emoji-btn" id="chEmojiBtn" type="button" aria-label="表情">😊</button>' +
        '<input class="ch-in" id="chIn" size="1" maxlength="300" placeholder="说点什么…">' +
        '<button class="ch-send" id="chSend" type="button" disabled>发送</button>' +
        '<div class="ch-emoji" id="chEmoji" hidden>' +
        '<div class="ch-emoji-tabs" id="chEmojiTabs"></div>' +
        '<div class="ch-emoji-grid" id="chEmojiGrid"></div>' +
        '</div>' +
        '</div>'
      if (!items.length) {
        $('chBody').innerHTML =
          '<div class="ch-empty">还没有聊过。<br />说点什么打个招呼吧</div>' + sendbar
        bindSend()
        return
      }
      // 第一条不是我发的、且我现在看到的最后一条不是我发的 → 中间可能有新的
      const showNew = hasNew
      let rows = ''
      let flagged = false
      let lastDay = ''
      items.forEach((m) => {
        // 跨天插一条日期分隔，长对话里更好认
        const dk = dayOf(m.at)
        if (dk !== lastDay) {
          rows += '<div class="ch-day">' + esc(dayLabel(m.at)) + '</div>'
          lastDay = dk
        }
        if (!flagged && showNew && m.at > myLastAt && !m.mine) {
          rows += '<div class="ch-new">以下是你刷新后看到的新消息</div>'
          flagged = true
        }
        rows +=
          '<div class="ch-msg' + (m.mine ? ' mine' : '') + '">' +
          (m.mine ? '' : '<span class="ch-msg-av" data-uid="' + esc(d.with.uid) + '"></span>') +
          '<div class="ch-bubble-col">' +
          '<div class="ch-bubble">' + esc(m.text) + '</div>' +
          '<div class="ch-mtime">' + esc(clock(m.at)) + '</div>' +
          '</div></div>'
      })
      $('chBody').innerHTML =
        '<div class="ch-msgs" id="chMsgs">' + rows + '</div>' +
        '<button class="ch-del" id="chDel" type="button">🗑️ 清空这段对话</button>' +
        sendbar
      $('chMsgs').scrollTop = $('chMsgs').scrollHeight
      paintAvatars()
      bindSend()

      // 看过就标已读
      if (hasNew) {
        const t = token()
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'read', with: d.with.uid }),
        }).catch(() => {})
        C.drop('chatlist')
      }

      /* 输入栏的交互。抽成函数是因为空对话和有消息两条路径都要用它 ——
         以前只有「有消息」那条绑过，所以新会话连输入框都没有。 */
      function bindSend() {
        inp = $('chIn')
        send = $('chSend')
        if (!inp || !send) return
        inp.addEventListener('input', sync)
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            doSend()
          }
        })
        send.addEventListener('click', doSend)
        /* 点输入框 → 键盘弹起来。等它稳定后再贴合一次视口并把消息滚到最新，
           否则刚聚焦时算出来的高度还是键盘弹出前的。 */
        inp.addEventListener('focus', () => {
          setTimeout(() => {
            fitThread()
            const box = $('chMsgs')
            if (box) box.scrollTop = box.scrollHeight
          }, 260)
        })

        // 表情面板。每轮渲染都是新节点，用 dataset 标记避免重复初始化
        const emojiBtn = $('chEmojiBtn')
        const emojiPanel = $('chEmoji')
        if (emojiBtn && emojiPanel && !emojiPanel.dataset.ready) {
          emojiPanel.dataset.ready = '1'
          setupEmojiPanel($('chEmojiTabs'), $('chEmojiGrid'), (e) => insertAtCursor(inp, e))
          emojiBtn.addEventListener('click', () => {
            const willOpen = emojiPanel.hidden
            emojiPanel.hidden = !willOpen
            emojiBtn.classList.toggle('on', willOpen)
            if (window.sfx) window.sfx(willOpen ? 'open' : 'close')
          })
        }
        sync()
      }

      $('chDel').addEventListener('click', async () => {
        if (!window.confirm('确定清空和 ' + peerName + ' 的这段对话吗？此操作不可恢复。')) return
        const t = token()
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
            body: JSON.stringify({ action: 'del', with: d.with.uid }),
          })
          const r2 = await res.json().catch(() => ({}))
          if (!res.ok || !r2 || !r2.ok) {
            showMsg((r2 && r2.error) || '清空失败', true)
            return
          }
          if (window.sfx) window.sfx('close')
          C.drop('chat:' + d.with.uid)
          C.drop('chatlist')
          C.drop('chatBadge')
          try {
            window.dispatchEvent(new CustomEvent('lw-chat-changed'))
          } catch (e) {}
          load(true)
        } catch (e) {
          showMsg('清空失败：' + ((e && e.message) || '网络错误'), true)
        }
      })

      async function doSend() {
        const t = token()
        if (!t) {
          showMsg('请先登录', true)
          return
        }
        const text = inp.value.trim()
        if (!text) return
        send.disabled = true
        send.textContent = '…'
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
            body: JSON.stringify({ action: 'send', to: d.with.uid, text }),
          })
          const r2 = await res.json().catch(() => ({}))
          if (!res.ok || !r2 || !r2.ok) {
            showMsg((r2 && r2.error) || '发送失败', true)
            return
          }
          if (window.sfx) window.sfx('send')
          C.drop('chat:' + d.with.uid)
          C.drop('chatlist')
          C.drop('chatBadge')
          try {
            window.dispatchEvent(new CustomEvent('lw-chat-changed'))
          } catch (e) {}
          load(true)
        } catch (e) {
          showMsg('发送失败：' + ((e && e.message) || '网络错误'), true)
        } finally {
          send.textContent = '发送'
          sync()
        }
      }
    }

    async function load(force) {
      if (!token()) {
        $('chBody').innerHTML =
          '<div class="ch-empty">好友功能需要登录。<br />' +
          '<a class="ch-back" href="/login" style="margin-top:10px">去登录 / 注册</a></div>'
        $('chNote').hidden = true
        return
      }
      const t = token()
      const head = { Authorization: 'Bearer ' + t }
      const url = wantUid ? '/api/chat?with=' + encodeURIComponent(wantUid) : '/api/chat?type=list'
      const key = wantUid ? 'chat:' + wantUid : 'chatlist'
      if (force) C.drop(key)
      showMsg('')
      $('chBody').innerHTML = '<div class="ch-empty"><span class="lw-load"></span>正在读取…</div>'
      try {
        const res = await fetch(url, { headers: head, cache: 'no-store' })
        const d = await res.json().catch(() => ({}))
        if (!d || !d.ok) {
          $('chBody').innerHTML = '<div class="ch-empty">' + esc((d && d.error) || '读取失败') + '</div>'
          $('chNote').hidden = !wantUid
          return
        }
        C.put(key, d)
        if (wantUid) drawThread(d)
        else drawList(d)
      } catch (e) {
        $('chBody').innerHTML = '<div class="ch-empty">读取失败：' + esc((e && e.message) || '网络错误') + '</div>'
      }
    }

    /* 点空白处收起表情面板。
       注册在 window 上而不是 document：app.js 的 withAutoCleanup 只接管
       window 上的监听，挂在 document 上的会在切页后残留。
       面板每轮渲染都会重建，所以这里每次现查元素，不闭包住旧节点。 */
    window.addEventListener('pointerdown', (ev) => {
      const panel = document.getElementById('chEmoji')
      const btn = document.getElementById('chEmojiBtn')
      if (!panel || panel.hidden) return
      if (panel.contains(ev.target) || (btn && btn.contains(ev.target))) return
      panel.hidden = true
      if (btn) btn.classList.remove('on')
    })

    /* 键盘弹出/收起、横竖屏切换时重新贴合视口，并把消息滚到最新一条。
       注册在 window 上，切页时由 app.js 的 withAutoCleanup 统一回收。 */
    window.addEventListener('resize', () => {
      fitThread()
      const box = document.getElementById('chMsgs')
      if (box) box.scrollTop = box.scrollHeight
    })

    /* 刷新按钮是这里的主要交互：非实时就靠它拉新消息 */
    C.bindRefresh($('chRefresh'), () => load(true), () => {}, true)

    // 第一次进来才请求；切回来用缓存
    if (!C.cached(wantUid ? 'chat:' + wantUid : 'chatlist', () => { load(false) })) {
      const d = C.get(wantUid ? 'chat:' + wantUid : 'chatlist')
      if (d) {
        if (wantUid) drawThread(d)
        else drawList(d)
      }
    }
  },
}
