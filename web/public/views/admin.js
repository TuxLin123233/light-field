// 由 admin.html 自动转换为 Vue 3 视图（无构建）
export default {
  name: 'admin',
  title: '管理后台',
  css: `      /* hidden 属性兜底：避免类选择器里的 display 覆盖 UA 的 [hidden]{display:none} */
      [hidden] { display: none !important; }

      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

      body {
        margin: 0;
        min-height: 100vh;
        background: var(--bg);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 16px 48px;
        color: var(--text);
      }

      /* 顶部标题区：做成和下面一致的卡片，不再是一段裸文字 */
      .page-head {
        width: 100%;
        max-width: 460px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 18px 20px;
        margin-bottom: 16px;
        box-shadow: 0 2px 10px var(--shadow2, rgba(0, 0, 0, 0.06));
      }

      .back {
        display: inline-block;
        text-decoration: none;
        color: var(--text-muted);
        font-size: 14px;
        margin-bottom: 12px;
      }

      h1 { font-size: 22px; font-weight: 800; margin: 4px 0 4px; letter-spacing: 1px; }

      .sub { font-size: 13px; color: var(--text-faint); margin-bottom: 20px; line-height: 1.6; }

      .card {
        width: 100%;
        max-width: 460px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 20px;
        margin-bottom: 16px;
      }

      .rp-count {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-faint);
        margin-left: 6px;
      }
      /* 封号 */
      .ban-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border);
        flex-wrap: wrap;
      }
      .ban-row:last-child { border-bottom: 0; }
      .ban-name {
        font-weight: 700;
        color: var(--text);
        font-size: 14px;
      }
      .ban-uid {
        font-size: 11px;
        color: var(--text-faint);
        font-family: ui-monospace, monospace;
      }
      .ban-when {
        font-size: 11px;
        color: var(--text-faint);
      }
      .ban-tag {
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        background: #d9534f;
        border-radius: 999px;
        padding: 2px 9px;
      }
      .ban-reason {
        font-size: 12px;
        color: var(--text-muted);
        flex-basis: 100%;
        line-height: 1.6;
      }
      .ban-btn {
        margin-left: auto;
        border: 1px solid var(--border);
        background: var(--surface-2);
        color: var(--text);
        border-radius: 999px;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        font-family: inherit;
      }
      .ban-btn.warn { background: #d9534f; color: #fff; border-color: #d9534f; }
      .ban-lookup {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      .ban-lookup input {
        flex: 1;
        border: 1px solid var(--border-input);
        background: var(--surface);
        color: var(--text);
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 14px;
        font-family: inherit;
      }
      .ban-lookup button {
        border: 0;
        border-radius: 10px;
        padding: 9px 16px;
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        background: var(--accent, #5b8def);
        cursor: pointer;
        font-family: inherit;
        flex: none;
      }
      .ban-hint {
        font-size: 12px;
        line-height: 1.7;
        color: var(--text-faint);
        margin: 10px 0 0;
      }
      .ban-target {
        margin-top: 10px;
        padding: 10px 12px;
        border: 1px dashed var(--border);
        border-radius: 10px;
        font-size: 13px;
        color: var(--text);
        line-height: 1.7;
      }
      .ban-reason-input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--border-input);
        background: var(--surface);
        color: var(--text);
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 13px;
        font-family: inherit;
        margin-top: 8px;
      }

      .rp-item {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 11px 12px;
        margin-bottom: 10px;
      }
      .rp-top {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 13px;
      }
      .rp-tag {
        padding: 2px 9px;
        border-radius: 999px;
        background: var(--surface-2);
        border: 1px solid var(--border-strong);
        font-size: 12px;
        color: var(--like);
      }
      .rp-title { color: var(--text); font-weight: 500; }
      .rp-meta { font-size: 12px; color: var(--text-muted2); margin-top: 5px; }
      .rp-note {
        margin-top: 7px;
        font-size: 12px;
        color: var(--text-muted);
        background: var(--surface-2);
        border-radius: 8px;
        padding: 7px 9px;
        word-break: break-all;
      }
      .rp-actions { display: flex; gap: 8px; margin-top: 10px; }
      .rp-btn {
        flex: 1;
        padding: 8px 10px;
        font-size: 13px;
        border-radius: 10px;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text);
        cursor: pointer;
      }
      .rp-btn.danger { border-color: var(--like); color: var(--like); background: var(--like-bg); }

      .card-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-muted);
        margin-bottom: 12px;
      }

      .card-text { font-size: 13px; color: var(--text-muted); line-height: 1.8; text-align: justify; }

      .card-text b { color: var(--text); }

      .roles { padding-left: 18px; margin: 0; }

      .roles li { font-size: 13px; color: var(--text-muted); line-height: 1.9; }

      .steps { list-style: none; padding: 0; margin: 0; counter-reset: step; }

      .steps li {
        counter-increment: step;
        position: relative;
        padding: 2px 0 2px 34px;
        font-size: 13px;
        color: var(--text-muted);
        line-height: 1.8;
        text-align: justify;
      }

      .steps li::before {
        content: counter(step);
        position: absolute;
        left: 0;
        top: 2px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--accent);
        color: var(--surface);
        font-size: 13px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mail-go {
        display: block;
        margin-top: 14px;
        text-align: center;
        padding: 12px;
        border-radius: 14px;
        background: var(--accent);
        color: var(--surface);
        text-decoration: none;
        font-size: 15px;
        font-weight: 600;
      }

      .contact { font-size: 12px; color: var(--text-faint); margin-top: 10px; text-align: center; }

      .login input {
        width: 100%;
        height: 48px;
        border-radius: 14px;
        border: 1px solid var(--border-strong);
        padding: 0 14px;
        font-size: 15px;
        background: var(--surface-2);
        outline: none;
        color: var(--text);
      }

      .login input:focus { border-color: var(--accent); }

      .login .enter {
        width: 100%;
        height: 48px;
        margin-top: 12px;
        border-radius: 14px;
        border: none;
        background: var(--accent);
        color: var(--surface);
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
      }

      .login .enter:disabled { opacity: 0.6; }

      .latest { display: flex; align-items: center; gap: 16px; }

      .latest canvas {
        width: 110px;
        height: 110px;
        image-rendering: pixelated;
        border-radius: 12px;
        border: 1px solid var(--border-strong);
        background: var(--surface);
      }

      .latest-info { flex: 1; min-width: 0; }

      .latest-info .author { font-size: 17px; font-weight: 700; color: var(--text); }

      .latest-info .time { font-size: 13px; color: var(--text-faint); margin-top: 4px; }

      .entry { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--surface-3); }

      .entry:last-child { border-bottom: none; }

      .entry canvas {
        width: 48px;
        height: 48px;
        flex: 0 0 48px;
        image-rendering: pixelated;
        border-radius: 8px;
        border: 1px solid var(--border-strong);
        background: var(--surface);
      }

      .entry .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }

      .entry .author {
        font-size: 14px;
        font-weight: 600;
        color: var(--text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .entry .time { font-size: 11px; color: var(--text-faint); }

      .del {
        border: none;
        border-radius: 999px;
        background: #fdeceb;
        color: #d34b3f;
        font-size: 13px;
        font-weight: 600;
        padding: 8px 16px;
        cursor: pointer;
      }

      .empty { font-size: 13px; color: var(--text-faint); padding: 6px 2px; }

      .clear {
        width: 100%;
        height: 50px;
        border-radius: 16px;
        border: none;
        background: #d34b3f;
        color: var(--surface);
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
      }

      .logout {
        margin-top: 12px;
        width: 100%;
        height: 44px;
        border-radius: 14px;
        border: none;
        background: var(--surface-2);
        color: var(--text-muted);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }

      .foot { font-size: 12px; color: var(--text-faint); text-align: center; margin-top: 6px; line-height: 1.7; }

      #toast {
        position: fixed;
        left: 50%;
        bottom: 96px;
        transform: translate(-50%, 16px);
        background: var(--text);
        color: var(--surface);
        padding: 12px 22px;
        border-radius: 999px;
        font-size: 15px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        max-width: 86vw;
        text-align: center;
        z-index: 120;
      }

      #toast.show { opacity: 1; transform: translate(-50%, 0); }

      button:active { transform: scale(0.97); }

      /* 深色模式补充：危险色在暗背景上需提亮，否则红底红字糊成一片 */
      [data-theme="dark"] .del { background: #3a1f1d; color: #ff8577; }
      [data-theme="dark"] .clear { background: #b03a2e; color: #fff; }
`,
  template: `<div class="page-head">
      <router-link class="back" to="/settings">← 返回设置</router-link>
      <h1>🛡️ 维护社区稳定</h1>
      <div class="sub">像素小镇是大家共同的家，社区的和谐需要每一位热心用户共同守护。</div>
    </div>

    <div class="card">
      <div class="card-title">为什么需要维护者</div>
      <div class="card-text">
        随着社区不断壮大，作品数量持续增长。为了让社区始终<b>清朗、安全、友善</b>，
        像素小镇面向全体用户招募维护者，与作者一起审核内容、清理违规、守护社区风气。
      </div>
    </div>

    <div class="card">
      <div class="card-title">维护者的职责</div>
      <ul class="roles">
        <li>审核社区作品，及时删除色情、暴力、涉政敏感、赌博、侵权等违规内容</li>
        <li>处理其他用户的举报，维护良好的创作与交流氛围</li>
        <li>定期向作者反馈社区情况，共同优化体验</li>
        <li>维护者须遵守法律法规与社区规范，滥用职权者将被立即撤销资格</li>
      </ul>
    </div>

    <div class="card">
      <div class="card-title">如何加入维护者计划</div>
      <ol class="steps">
        <li>写一封<b>正式申请书信</b>：须符合书信格式（称谓、正文、落款、日期齐全）。<b>格式不正式、内容敷衍的一律不通过</b>。</li>
        <li>信中必须写明两点：<b>① 你为什么要成为维护者</b>（加入的动机）；<b>② 成为维护者后你打算做什么</b>（具体的职责承诺）。</li>
        <li>将书信发送至作者邮箱：<b>linsifan123233@petalmail.com</b>（也可微信联系 Tux123233）。</li>
        <li>作者审核通过后，会回复<b>维护者口令</b>。凭口令即可进入下方的维护面板。</li>
      </ol>
      <a class="mail-go" id="mailBtn" href="mailto:linsifan123233@petalmail.com?subject=%E5%85%89%E5%9F%9F%E7%94%BB%E6%9D%BF%E7%BB%B4%E6%8A%A4%E8%80%85%E7%94%B3%E8%AF%B7%E4%B9%A6">✉️ 发送申请书信</a>
      <div class="contact">微信：Tux123233 · 邮箱：linsifan123233@petalmail.com</div>
    </div>

    <div class="card login" id="loginCard">
      <div class="card-title">维护者口令</div>
      <input id="passInput" type="password" placeholder="请输入维护者口令">
      <button class="enter" id="enterBtn" type="button">进入维护面板</button>
    </div>

    <div id="panel" hidden>
      <div class="card">
        <div class="card-title">最新社区作品</div>
        <div class="latest" id="latestWrap">
          <div class="empty">暂无数据</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">用户举报（待处理）<span class="rp-count" id="reportCount"></span></div>
        <div id="reportList"><div class="empty">暂无举报</div></div>
      </div>

      <div class="card">
        <div class="card-title">违规作品清理（最新 10 条）</div>
        <div id="entryList"></div>
      </div>

      <div class="card">
        <div class="card-title">账号封禁<span class="rp-count" id="banCount"></span></div>
        <div class="ban-lookup">
          <input id="banName" type="text" placeholder="输入用户名查 uid" autocomplete="off">
          <button id="banFindBtn" type="button">查找</button>
        </div>
        <div id="banTarget"></div>
        <div id="banList"><div class="empty">加载中…</div></div>
        <p class="ban-hint">封禁会立即生效：对方已登录的设备上，签到、送光尘、发布作品都会被拒绝，直到解封。登录凭证本身不销毁，所以解封后无需重新登录。</p>
      </div>

      <div class="card">
        <div class="card-title">赠送光尘</div>
        <div class="ban-lookup">
          <input id="grantName" type="text" placeholder="输入用户名" autocomplete="off">
          <input id="grantAmt" type="number" value="100" step="1" style="width:88px" aria-label="数量">
          <button id="grantBtn" type="button">赠送</button>
        </div>
        <div id="grantOut"></div>
        <p class="ban-hint">按用户名直接加减光尘，正数增加、负数扣减，单次上限 10 万。正数会同时计入对方「累计收到」。这里不会代替对方发信，需要通知的话在下面举报/信件里说明。</p>
      </div>

      <div class="card">
        <div class="card-title">紧急处置</div>
        <div class="card-text" style="margin-bottom:12px">若社区出现大面积违规内容，可一键清空全部作品。此操作不可恢复，请务必慎重。</div>
        <button class="clear" id="clearAllBtn" type="button">一键清空全部作品</button>
      </div>

      <button class="logout" id="logoutBtn" type="button">退出维护面板</button>
    </div>

    <div class="foot">维护者需为自己的操作负责 · 所有操作仅用于维护社区安全与稳定<br>© 2026 像素小镇 · 作者 Lin Sifan</div>`,
  mounted() {
      const passInput = document.getElementById('passInput')
      const enterBtn = document.getElementById('enterBtn')
      const loginCard = document.getElementById('loginCard')
      const panel = document.getElementById('panel')
      const latestWrap = document.getElementById('latestWrap')
      const entryList = document.getElementById('entryList')
      const reportList = document.getElementById('reportList')
      const reportCount = document.getElementById('reportCount')
      const clearAllBtn = document.getElementById('clearAllBtn')
      const logoutBtn = document.getElementById('logoutBtn')

      const KEY = 'adminKey'
      const dpr = window.devicePixelRatio || 1

      function getKey() {
        return sessionStorage.getItem(KEY) || ''
      }

      function setKey(k) {
        sessionStorage.setItem(KEY, k)
      }

      function clearKey() {
        sessionStorage.removeItem(KEY)
      }

      function formatTime(ts) {
        if (!ts) return ''
        const d = new Date(ts)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      }

      function drawThumb(canvas, pixels, s) {
        const n = s === 32 || s === 64 ? s : 16
        canvas.width = n * dpr
        canvas.height = n * dpr
        const c = canvas.getContext('2d')
        c.scale(dpr, dpr)
        c.clearRect(0, 0, n, n)
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const px = pixels && pixels[y * n + x]
            if (!px) continue
            c.fillStyle = `rgb(${px[0]}, ${px[1]}, ${px[2]})`
            c.fillRect(x, y, 1, 1)
          }
        }
      }

      async function verify(key) {
        const res = await fetch('/api/admin/verify', {
          headers: { 'x-admin-key': key },
        })
        return res.ok
      }

      async function login() {
        const key = passInput.value.trim()
        if (!key) {
          toast('请输入维护者口令')
          return
        }
        enterBtn.disabled = true
        try {
          if (await verify(key)) {
            setKey(key)
            loginCard.hidden = true
            panel.hidden = false
            passInput.value = ''
            toast('口令验证通过')
            refresh()
          } else {
            toast('口令错误')
          }
        } catch (err) {
          toast('网络错误')
        } finally {
          enterBtn.disabled = false
        }
      }

      enterBtn.addEventListener('click', login)
      passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') login()
      })

      logoutBtn.addEventListener('click', () => {
        clearKey()
        panel.hidden = true
        loginCard.hidden = false
      })

      async function refresh() {
        // 举报、封号与作品列表互不影响：任何一边失败另一边照样能看
        loadReports()
        loadBanned()
        try {
          const res = await fetch('/api/get?limit=30&t=' + Date.now(), { cache: 'no-store' })
          if (!res.ok) {
            toast('获取数据失败')
            return
          }
          const data = await res.json()
          renderLatest(data)
          renderList(data.history || [])
        } catch (err) {
          toast('网络错误')
        }
      }

      /* ---------- 举报 ---------- */
      function fmtTime(ts) {
        const d = new Date(ts)
        const p2 = (x) => String(x).padStart(2, '0')
        return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes())
      }

      /* 本机已处理的举报 id：即使服务端短暂返回旧数据，也不再显示 */
      const DONE_KEY = 'lw-admin-done-reports'
      function getDone() {
        try {
          const a = JSON.parse(localStorage.getItem(DONE_KEY) || '[]')
          return Array.isArray(a) ? a : []
        } catch (e) {
          return []
        }
      }
      function markDone(id) {
        const a = getDone()
        if (!a.includes(id)) a.push(id)
        try {
          localStorage.setItem(DONE_KEY, JSON.stringify(a.slice(-500)))
        } catch (e) {}
      }
      function pruneDone(list) {
        const alive = new Set(list.map((r) => r.id))
        const a = getDone().filter((id) => alive.has(id))
        try {
          localStorage.setItem(DONE_KEY, JSON.stringify(a))
        } catch (e) {}
      }

      function renderReports(rawList) {
        const done = new Set(getDone())
        const list = Array.isArray(rawList) ? rawList.filter((r) => !done.has(r.id)) : []
        pruneDone(rawList || [])
        reportList.innerHTML = ''
        updateReportCount(list.length)
        if (!list.length) {
          const empty = document.createElement('div')
          empty.className = 'empty'
          empty.textContent = '暂无举报'
          reportList.appendChild(empty)
          return
        }
        list
          .slice()
          .sort((a, b) => (b.at || 0) - (a.at || 0))
          .forEach((r) => {
            const item = document.createElement('div')
            item.className = 'rp-item'

            const top = document.createElement('div')
            top.className = 'rp-top'
            const tag = document.createElement('span')
            tag.className = 'rp-tag'
            tag.textContent = r.reason || '其他'
            const title = document.createElement('span')
            title.className = 'rp-title'
            // 举报用户和举报作品的标题含义不同，分开标出来免得看混
            if (r.target === 'user') {
              tag.textContent = '👤 ' + (r.reason || '其他')
              title.textContent = '用户 ' + (r.title || r.author || '未知')
            } else {
              title.textContent = r.title || '未命名作品'
            }
            top.append(tag, title)

            const meta = document.createElement('div')
            meta.className = 'rp-meta'
            meta.textContent =
              r.target === 'user'
                ? '被举报账号 ' + (r.title || '') + '（' + (r.targetUid || '?') + '） · 提交于 ' + fmtTime(r.at || 0)
                : '作者 ' + (r.author || '匿名') + ' · 提交于 ' + fmtTime(r.at || 0) + ' · 作品时间戳 ' + r.time

            item.append(top, meta)

            if (r.note) {
              const note = document.createElement('div')
              note.className = 'rp-note'
              note.textContent = '补充：' + r.note
              item.appendChild(note)
            }

            const actions = document.createElement('div')
            actions.className = 'rp-actions'
            const del = document.createElement('button')
            del.className = 'rp-btn danger'
            del.type = 'button'
            del.textContent = r.target === 'user' ? '违规，封禁该账号' : '违规，删除作品'
            const done = document.createElement('button')
            done.className = 'rp-btn'
            done.type = 'button'
            done.textContent = '已核实无误'
            actions.append(del, done)
            item.appendChild(actions)

            const isUser = r.target === 'user'
            const handle = async (action) => {
              const msg =
                action === 'remove'
                  ? isUser
                    ? '核实该账号违规？将立即封禁「' + (r.title || '') + '」并标记举报已处理。'
                    : '确定删除该作品并标记举报已处理吗？'
                  : '确定标记该举报为已处理吗？'
              if (!window.confirm(msg)) return
              const key = getKey()
              if (!key) {
                toast('请先登录')
                return
              }
              try {
                const res = await fetch('/api/report', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
                  body: JSON.stringify({ id: r.id, action }),
                })
                if (!res.ok) {
                  toast((await res.json().catch(() => ({}))).error || '操作失败')
                  return
                }
                markDone(r.id)
                // 立刻从列表里移除，不等网络回来，避免"处理完还在"的错觉
                const row = item.closest('.rp-item') || item
                if (row && row.parentNode) row.parentNode.removeChild(row)
                updateReportCount()
                toast(
                  action === 'remove' ? '已删除作品'
                    : action === 'banuser' ? '已封禁该账号'
                    : '已标记处理'
                )
                refresh()
                loadReports()
              } catch (err) {
                toast('网络错误')
              }
            }
            del.addEventListener('click', () => handle(isUser ? 'banuser' : 'remove'))
            done.addEventListener('click', () => handle('done'))

            reportList.appendChild(item)
          })
      }

      function updateReportCount(n) {
        if (!reportCount) return
        const left = typeof n === 'number' ? n : reportList.querySelectorAll('.rp-item').length
        reportCount.textContent = left ? '共 ' + left + ' 条' : ''
        if (!left) {
          reportList.innerHTML = ''
          const empty = document.createElement('div')
          empty.className = 'empty'
          empty.textContent = '暂无举报'
          reportList.appendChild(empty)
        }
      }

      async function loadReports() {
        const key = getKey()
        if (!key || !reportList) return
        try {
          const res = await fetch('/api/report?t=' + Date.now(), {
            headers: { 'x-admin-key': key, 'Cache-Control': 'no-cache' },
            cache: 'no-store',
          })
          if (!res.ok) return
          const data = await res.json().catch(() => ({}))
          renderReports(data.reports || [])
        } catch (err) {}
      }

      /* ---------- 封号 ---------- */
      const banList = document.getElementById('banList')
      const banCount = document.getElementById('banCount')
      const banTarget = document.getElementById('banTarget')
      // 查到的目标账号暂存这里，确认后才执行封禁
      let banCandidate = null

      function fmtDate(n) {
        const t = Number(n) || 0
        if (!t) return ''
        const d = new Date(t)
        const p = (x) => String(x).padStart(2, '0')
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
      }

      function renderBanned(list) {
        if (!banList) return
        const arr = Array.isArray(list) ? list : []
        if (banCount) banCount.textContent = arr.length ? '共 ' + arr.length + ' 人' : ''
        banList.innerHTML = ''
        if (!arr.length) {
          const empty = document.createElement('div')
          empty.className = 'empty'
          empty.textContent = '当前没有被封禁的账号'
          banList.appendChild(empty)
          return
        }
        arr.forEach((u) => {
          const row = document.createElement('div')
          row.className = 'ban-row'

          const name = document.createElement('span')
          name.className = 'ban-name'
          name.textContent = u.username

          const tag = document.createElement('span')
          tag.className = 'ban-tag'
          tag.textContent = '已封'

          const when = document.createElement('span')
          when.className = 'ban-when'
          when.textContent = u.bannedAt ? '封于 ' + fmtDate(u.bannedAt) : ''

          const btn = document.createElement('button')
          btn.className = 'ban-btn'
          btn.type = 'button'
          btn.textContent = '解封'
          btn.addEventListener('click', async () => {
            if (!confirm('确定解封「' + u.username + '」吗？')) return
            btn.disabled = true
            try {
              const res = await fetch('/api/ban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() },
                body: JSON.stringify({ action: 'unban', uid: u.uid }),
              })
              const d = await res.json().catch(() => ({}))
              if (d && d.ok) {
                toast('已解封 ' + u.username)
                loadBanned()
              } else {
                btn.disabled = false
                toast(d && d.error ? d.error : '解封失败')
              }
            } catch (e) {
              btn.disabled = false
              toast('网络错误')
            }
          })

          row.append(name, tag, when, btn)
          if (u.banReason) {
            const r = document.createElement('div')
            r.className = 'ban-reason'
            r.textContent = '原因：' + u.banReason
            row.appendChild(r)
          }
          banList.appendChild(row)
        })
      }

      async function loadBanned() {
        if (!banList) return
        try {
          const res = await fetch('/api/ban?t=' + Date.now(), {
            headers: { 'x-admin-key': getKey(), 'Cache-Control': 'no-cache' },
            cache: 'no-store',
          })
          if (!res.ok) return
          const d = await res.json().catch(() => ({}))
          if (d && d.ok) renderBanned(d.banned)
        } catch (e) {}
      }

      function renderBanCandidate(u) {
        if (!banTarget) return
        banCandidate = u
        banTarget.innerHTML = ''
        if (!u) return
        const box = document.createElement('div')
        box.className = 'ban-target'
        box.textContent = '找到：' + u.username + '（' + u.uid + '）' + (u.banned ? ' · 当前已封禁' : '')

        const input = document.createElement('input')
        input.className = 'ban-reason-input'
        input.type = 'text'
        input.placeholder = '封禁原因（会记入封号列表）'
        input.maxLength = 100

        const btn = document.createElement('button')
        btn.className = 'ban-btn warn'
        btn.type = 'button'
        btn.style.marginTop = '8px'
        btn.textContent = u.banned ? '解封该账号' : '封禁该账号'
        btn.addEventListener('click', async () => {
          const act = u.banned ? 'unban' : 'ban'
          if (act === 'ban' && !confirm('确定封禁「' + u.username + '」吗？\n\n对方将无法签到、送光尘和发布作品，直到解封。')) return
          btn.disabled = true
          try {
            const res = await fetch('/api/ban', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() },
              body: JSON.stringify({ action: act, uid: u.uid, reason: input.value || '' }),
            })
            const d = await res.json().catch(() => ({}))
            if (d && d.ok) {
              toast(act === 'ban' ? '已封禁 ' + u.username : '已解封 ' + u.username)
              banCandidate = null
              banTarget.innerHTML = ''
              loadBanned()
            } else {
              btn.disabled = false
              toast(d && d.error ? d.error : '操作失败')
            }
          } catch (e) {
            btn.disabled = false
            toast('网络错误')
          }
        })

        box.appendChild(btn)
        banTarget.append(box, input)
      }

      const banFindBtn = document.getElementById('banFindBtn')
      const banName = document.getElementById('banName')
      if (banFindBtn && banName) {
        const doFind = async () => {
          const name = banName.value.trim()
          if (!name) {
            toast('请输入用户名')
            return
          }
          banFindBtn.disabled = true
          try {
            const res = await fetch('/api/ban', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() },
              body: JSON.stringify({ action: 'lookup', name }),
            })
            const d = await res.json().catch(() => ({}))
            if (d && d.ok) renderBanCandidate(d.user)
            else {
              renderBanCandidate(null)
              toast(d && d.error ? d.error : '查找失败')
            }
          } catch (e) {
            toast('网络错误')
          } finally {
            banFindBtn.disabled = false
          }
        }
        banFindBtn.addEventListener('click', doFind)
        banName.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') doFind()
        })
      }

      function renderLatest(data) {
        latestWrap.innerHTML = ''
        if (!data.pixels) {
          const empty = document.createElement('div')
          empty.className = 'empty'
          empty.textContent = '暂无数据'
          latestWrap.appendChild(empty)
          return
        }
        const canvas = document.createElement('canvas')
        drawThumb(canvas, data.pixels, data.size)

        const info = document.createElement('div')
        info.className = 'latest-info'
        const author = document.createElement('div')
        author.className = 'author'
        author.textContent = data.name || '匿名'
        const time = document.createElement('div')
        time.className = 'time'
        time.textContent = formatTime(data.time)
        info.append(author, time)

        latestWrap.append(canvas, info)
      }

      function renderList(records) {
        entryList.innerHTML = ''
        if (!records.length) {
          const empty = document.createElement('div')
          empty.className = 'empty'
          empty.textContent = '暂无历史记录'
          entryList.appendChild(empty)
          return
        }
        records.forEach((rec) => {
          const row = document.createElement('div')
          row.className = 'entry'

          const canvas = document.createElement('canvas')
          drawThumb(canvas, rec.pixels, rec.size)

          const info = document.createElement('div')
          info.className = 'info'
          const author = document.createElement('span')
          author.className = 'author'
          author.textContent = rec.name || '匿名'
          const time = document.createElement('span')
          time.className = 'time'
          time.textContent = formatTime(rec.time)
          info.append(author, time)

          const del = document.createElement('button')
          del.type = 'button'
          del.className = 'del'
          del.textContent = '删除'
          del.addEventListener('click', () => removeEntry(rec))

          row.append(canvas, info, del)
          entryList.appendChild(row)
        })
      }

      async function removeEntry(rec) {
        const label = rec.name || '匿名'
        if (!window.confirm(`确定删除「${label}」的作品吗？`)) return

        const key = getKey()
        if (!key) {
          toast('请先登录')
          return
        }
        try {
          const res = await fetch('/api/admin/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
            body: JSON.stringify({ time: rec.time }),
          })
          if (!res.ok) {
            toast((await res.json().catch(() => ({}))).error || '删除失败')
            return
          }
          toast('已删除')
          refresh()
        } catch (err) {
          toast('网络错误')
        }
      }

      /* ---------- 赠送光尘 ---------- */
      const grantBtn = document.getElementById('grantBtn')
      const grantName = document.getElementById('grantName')
      const grantAmt = document.getElementById('grantAmt')
      const grantOut = document.getElementById('grantOut')
      if (grantBtn) {
        grantBtn.addEventListener('click', async () => {
          const key = getKey()
          if (!key) {
            toast('请先登录维护面板')
            return
          }
          const name = (grantName.value || '').trim()
          const amt = Math.trunc(Number(grantAmt.value))
          if (!name) {
            toast('请填写用户名')
            return
          }
          if (!Number.isFinite(amt) || amt === 0) {
            toast('数量要是非 0 的整数，正数增加、负数扣减')
            return
          }
          if (amt > 0 && !window.confirm('确定给「' + name + '」赠送 ' + amt + ' 个光尘吗？')) return
          if (amt < 0 && !window.confirm('确定从「' + name + '」扣掉 ' + (-amt) + ' 个光尘吗？')) return
          grantBtn.disabled = true
          const old = grantBtn.textContent
          grantBtn.textContent = '处理中'
          try {
            const res = await fetch('/api/ban', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
              body: JSON.stringify({ action: 'grant', name: name, amount: amt }),
            })
            const d = await res.json().catch(() => ({}))
            if (!res.ok || !d.ok) {
              toast((d && d.error) || '赠送失败')
              return
            }
            grantOut.textContent =
              '✅ ' + d.user.username + '（' + d.user.uid + '）现在有 ' + d.book.bal + ' 个光尘' +
              (amt > 0 ? '，累计收到 ' + d.book.got + ' 个。' : '。')
            grantOut.className = ''
            if (window.sfx) window.sfx('ding')
            toast(amt > 0 ? '已赠送 ' + amt + ' 个光尘' : '已扣减 ' + (-amt) + ' 个光尘')
          } catch (e) {
            toast('赠送失败：网络错误')
          } finally {
            grantBtn.disabled = false
            grantBtn.textContent = old
          }
        })
      }

      clearAllBtn.addEventListener('click', async () => {
        if (!window.confirm('确定清空全部数据吗？此操作不可恢复！')) return

        const key = getKey()
        if (!key) {
          toast('请先登录')
          return
        }
        try {
          const res = await fetch('/api/admin/clear', {
            method: 'POST',
            headers: { 'x-admin-key': key },
          })
          if (!res.ok) {
            toast((await res.json().catch(() => ({}))).error || '清空失败')
            return
          }
          toast('已清空全部')
          refresh()
        } catch (err) {
          toast('网络错误')
        }
      })

      let toastTimer
      function toast(msg) {
        const el = document.getElementById('toast')
        el.textContent = msg
        el.classList.add('show')
        clearTimeout(toastTimer)
        toastTimer = setTimeout(() => el.classList.remove('show'), 2200)
      }

      if (getKey()) {
        verify(getKey()).then((ok) => {
          if (ok) {
            loginCard.hidden = true
            panel.hidden = false
            refresh()
          } else {
            clearKey()
          }
        })
      }
  },
}
