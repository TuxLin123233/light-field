// 私信（/chat）
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
  title: '私信',
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
      .ch-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
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

      .ch-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
      .ch-row {
        display: flex; align-items: center; gap: 10px; text-decoration: none;
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 13px; padding: 10px 12px; color: inherit;
      }
      .ch-av {
        width: 38px; height: 38px; flex: 0 0 38px; border-radius: 11px; overflow: hidden;
        background: var(--surface-2); border: 1px solid var(--border-strong);
      }
      .ch-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .ch-main { flex: 1; min-width: 0; }
      .ch-name { font-size: 14px; font-weight: 700; color: var(--text); display: block; }
      .ch-last {
        font-size: 12px; color: var(--text-faint); display: block;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-last.mine { color: var(--text-muted); }
      .ch-unread {
        flex: none; min-width: 20px; height: 20px; padding: 0 6px;
        border-radius: 999px; background: var(--accent); color: #fff;
        font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center;
      }
      .ch-time { flex: none; font-size: 10px; color: var(--text-faint); }

      /* 对话气泡 */
      .ch-msgs {
        display: flex; flex-direction: column; gap: 9px;
        margin: 12px 0; min-height: 90px;
        max-width: 100%; min-width: 0;
      }
      /* min-width: 0 不能省：flex 子项默认 min-width:auto，
         不许缩到比内容还窄，里面再窄的容器也拦不住。
         overflow-wrap:anywhere 比 word-break:break-word 兼容性好 ——
         后者在老 Safari / WebView 上不被支持，会退化成 normal，
         一条长网址就能把气泡顶出屏幕（用户反馈「消息框溢出到右边」）。 */
      .ch-msg { display: flex; max-width: 82%; min-width: 0; }
      .ch-msg.mine { align-self: flex-end; flex-direction: row-reverse; }
      .ch-bubble {
        padding: 9px 12px; border-radius: 14px; font-size: 13px; line-height: 1.6;
        max-width: 100%; min-width: 0;
        overflow-wrap: anywhere; word-break: break-word; white-space: pre-wrap;
        background: var(--surface); border: 1px solid var(--border); color: var(--text);
      }
      .ch-msg.mine .ch-bubble {
        background: var(--accent); color: #fff; border-color: var(--accent);
        border-bottom-right-radius: 4px;
      }
      .ch-msg:not(.mine) .ch-bubble { border-bottom-left-radius: 4px; }
      .ch-mtime { font-size: 10px; color: var(--text-faint); margin-top: 3px; }
      .ch-msg.mine .ch-mtime { text-align: right; }
      .ch-new {
        align-self: center; font-size: 11px; color: var(--accent);
        background: color-mix(in srgb, var(--accent) 12%, var(--surface));
        border-radius: 999px; padding: 4px 11px; font-weight: 700;
      }
      .ch-sendbar { display: flex; gap: 8px; margin-top: 10px; }
      .ch-in {
        flex: 1; border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text); border-radius: 12px; padding: 10px 12px;
        font-size: 13px; font-family: inherit; line-height: 1.5;
      }
      .ch-in:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
      .ch-send {
        flex: none; border: 0; border-radius: 12px; padding: 0 17px;
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
    `,
  template: `
    <div class="ch-wrap">
      <div class="ch-bar">
        <router-link class="ch-back" to="/mine">← 我的</router-link>
        <div class="ch-bar-main">
          <div class="ch-title" id="chTitle">💬 私信</div>
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

    function showMsg(text, bad) {
      const el = $('chMsg')
      el.textContent = text || ''
      el.hidden = !text
      el.classList.toggle('bad', !!bad)
    }

    /* ---------- 会话列表 ---------- */
    function drawList(d) {
      $('chTitle').textContent = '💬 私信'
      $('chNote').hidden = false
      $('chNote').innerHTML =
        '私信是<b>非实时</b>的：不轮询、不推送。对方发了新消息，' +
        '要自己点右上角的<b>刷新</b>才看得到。'
      const rows = d.list || []
      if (!rows.length) {
        $('chBody').innerHTML =
          '<div class="ch-empty">还没有可以聊天的人。<br />去画师主页点「关注」，' +
          '<b>对方也关注你</b>之后就成了好友，这里会出现对话。</div>'
        return
      }
      $('chBody').innerHTML =
        '<div class="ch-list">' +
        rows
          .map((r) => {
            const last = r.last ? (r.lastMine ? '我：' + r.last : r.last) : '还没有消息'
            return (
              '<a class="ch-row" data-to="' + esc(r.uid) + '">' +
              '<span class="ch-av" data-uid="' + esc(r.uid) + '"></span>' +
              '<span class="ch-main">' +
              '<span class="ch-name">' + esc(r.name) + '</span>' +
              '<span class="ch-last' + (r.lastMine ? ' mine' : '') + '">' + esc(last) + '</span>' +
              '</span>' +
              (r.unread ? '<span class="ch-unread">' + r.unread + '</span>' : '') +
              '<span class="ch-time">' + esc(r.lastAt ? fmt(r.lastAt) : '') + '</span>' +
              '</a>'
            )
          })
          .join('') +
        '</div>'
      paintAvatars()
      $('chBody').querySelectorAll('.ch-row').forEach((a) => {
        a.addEventListener('click', () => {
          if (window.__lwRouter) window.__lwRouter.push('/chat?to=' + encodeURIComponent(a.getAttribute('data-to')))
        })
      })
    }

    function paintAvatars() {
      const boxes = document.querySelectorAll('.ch-av[data-uid]')
      if (!window.LWAvatar) return
      const uids = []
      boxes.forEach((el) => {
        const uid = el.getAttribute('data-uid')
        if (!uid) return
        const c = document.createElement('canvas')
        el.appendChild(c)
        window.LWAvatar.draw(c, uid, 38)
        uids.push(uid)
      })
      if (uids.length && window.LWAvatar.load) {
        window.LWAvatar
          .load(uids)
          .then(() => {
            boxes.forEach((el) => {
              const c = el.querySelector('canvas')
              if (c) window.LWAvatar.draw(c, el.getAttribute('data-uid'), 38)
            })
          })
          .catch(() => {})
      }
    }

    /* ---------- 对话 ---------- */
    function drawThread(d) {
      peerName = (d.with && d.with.name) || ''
      $('chTitle').textContent = '💬 ' + peerName
      $('chNote').hidden = false
      $('chNote').innerHTML =
        '和 <b>' + esc(peerName) + '</b> 的私信。' +
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
        '<input class="ch-in" id="chIn" maxlength="300" placeholder="说点什么…">' +
        '<button class="ch-send" id="chSend" type="button" disabled>发送</button>' +
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
      items.forEach((m, i) => {
        if (!flagged && showNew && m.at > myLastAt && !m.mine) {
          rows += '<div class="ch-new">以下是你刷新后看到的新消息</div>'
          flagged = true
        }
        rows +=
          '<div class="ch-msg' + (m.mine ? ' mine' : '') + '">' +
          '<div class="ch-bubble">' + esc(m.text) +
          '<div class="ch-mtime">' + esc(clock(m.at)) + '</div>' +
          '</div></div>'
      })
      $('chBody').innerHTML =
        '<div class="ch-msgs" id="chMsgs">' + rows + '</div>' +
        '<button class="ch-del" id="chDel" type="button">🗑️ 清空这段对话</button>' +
        sendbar
      $('chMsgs').scrollTop = $('chMsgs').scrollHeight
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
          if (window.sfx) window.sfx('ding')
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
          '<div class="ch-empty">私信需要登录。<br />' +
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
