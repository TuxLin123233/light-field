// 审核员面板 /mod
//
// 只给审核员看。列出「我下架过的」和「所有人下架过的」，
// 每一条都能直接恢复 —— 误下架不用找作者。
//
// 这里**没有删除按钮**，审核员删不了东西，真删只在 /admin 里。

export default {
  name: 'ModPanel',
  title: '审核记录 · 像素小镇',

  css: `
    .mp-head { padding: 14px 16px 6px; }
    .mp-head h1 { margin: 0; font-size: 21px; font-weight: 900; color: var(--text); }
    .mp-head .sub { font-size: 12.5px; color: var(--text-faint); margin-top: 5px; line-height: 1.6; }

    .mp-tabs { display: flex; gap: 8px; padding: 10px 16px 4px; }
    .mp-tab {
      border: 1px solid var(--border-input); background: var(--surface-2);
      color: var(--text-muted); border-radius: 999px; padding: 7px 15px;
      font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
    }
    .mp-tab.on { background: var(--accent); border-color: var(--accent); color: #fff; }

    .mp-list { padding: 8px 16px 30px; }
    .mp-row {
      display: flex; align-items: center; gap: 12px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 12px; margin-bottom: 10px;
    }
    .mp-row canvas {
      width: 52px; height: 52px; flex: none; border-radius: 9px;
      image-rendering: pixelated; background: var(--art-bg);
    }
    .mp-body { flex: 1; min-width: 0; }
    .mp-body b { display: block; font-size: 14px; color: var(--text); font-weight: 700; }
    .mp-body span { display: block; font-size: 11.5px; color: var(--text-faint); margin-top: 3px; line-height: 1.5; }
    .mp-body .why { color: var(--text-muted); }
    .mp-body .auto { color: #c0392b; font-weight: 700; }
    .mp-row button {
      flex: none; border: 1px solid #cbe6d4; background: #e8f5ec; color: #2f6b3f;
      border-radius: 999px; padding: 7px 13px;
      font-family: inherit; font-size: 12.5px; font-weight: 800; cursor: pointer;
    }
    .mp-empty { text-align: center; color: var(--text-faint); font-size: 13px; padding: 40px 20px; line-height: 1.8; }
    .mp-gate { text-align: center; padding: 60px 24px; }
    .mp-gate .ico { font-size: 40px; }
    .mp-gate h2 { margin: 14px 0 6px; font-size: 18px; color: var(--text); }
    .mp-gate p { margin: 0; font-size: 13px; color: var(--text-faint); line-height: 1.7; }
  `,

  template: `
    <div class="page">
      <div class="mp-head">
        <h1>🛡️ 审核记录</h1>
        <div class="sub" id="mpSub">加载中…</div>
      </div>
      <div class="mp-tabs" id="mpTabs" hidden>
        <button class="mp-tab on" data-tab="mine" type="button">我下架的</button>
        <button class="mp-tab" data-tab="all" type="button">全部</button>
      </div>
      <div class="mp-list" id="mpList"></div>
    </div>
  `,

  async mounted() {
    const $ = (id) => document.getElementById(id)
    const sub = $('mpSub')
    const tabs = $('mpTabs')
    const list = $('mpList')

    let mine = true
    let data = null

    function token() {
      return localStorage.getItem('lw-token') || ''
    }

    function fmt(t) {
      const d = new Date(Number(t) || 0)
      const p = (x) => String(x).padStart(2, '0')
      return d.getMonth() + 1 + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
    }

    function gate(icon, title, text) {
      tabs.hidden = true
      sub.textContent = ''
      list.innerHTML = ''
      const d = document.createElement('div')
      d.className = 'mp-gate'
      d.innerHTML =
        '<div class="ico">' + icon + '</div><h2>' + title + '</h2><p>' + text + '</p>'
      list.appendChild(d)
    }

    async function load() {
      try {
        const res = await fetch('/api/mod', {
          headers: token() ? { Authorization: 'Bearer ' + token() } : {},
          cache: 'no-store',
        })
        data = await res.json().catch(() => ({}))
      } catch (e) {
        data = {}
      }

      if (!data || !data.isMod) {
        if (data && data.modBanned) {
          gate('⏸️', '审核资格已暂停', (data.banReason || '未说明原因') + '<br>有疑问请联系作者。')
        } else {
          gate('🛡️', '这里只有审核员能看', '你目前不是审核员。<br>审核员由作者在后台任命。')
        }
        return
      }

      tabs.hidden = false
      sub.textContent = '共 ' + (data.list || []).length + ' 件被下架。点「恢复显示」可以让作品立刻回到社区。'
      render()
    }

    function render() {
      const all = data.list || []
      const rows = mine ? all.filter((h) => h && h.byUid === data.uid) : all
      list.innerHTML = ''
      if (!rows.length) {
        const d = document.createElement('div')
        d.className = 'mp-empty'
        d.textContent = mine ? '你还没有下架过作品。' : '目前没有作品被下架。'
        list.appendChild(d)
        return
      }
      rows.forEach((h) => {
        const row = document.createElement('div')
        row.className = 'mp-row'

        const cv = document.createElement('canvas')
        cv.width = 16
        cv.height = 16
        row.appendChild(cv)

        const body = document.createElement('div')
        body.className = 'mp-body'
        const b = document.createElement('b')
        b.textContent = '作品 ' + h.time
        body.appendChild(b)
        const s1 = document.createElement('span')
        s1.textContent = (h.byName || h.byUid || '?') + ' · ' + fmt(h.at)
        body.appendChild(s1)
        const s2 = document.createElement('span')
        s2.className = h.auto ? 'why auto' : 'why'
        s2.textContent = (h.auto ? '⚙️ 自动：' : '原因：') + (h.reason || '无')
        body.appendChild(s2)
        row.appendChild(body)

        const btn = document.createElement('button')
        btn.type = 'button'
        btn.textContent = '恢复显示'
        btn.addEventListener('click', async () => {
          btn.disabled = true
          btn.textContent = '…'
          try {
            const res = await fetch('/api/mod', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() },
              body: JSON.stringify({ action: 'unhide', time: h.time }),
            })
            const d = await res.json().catch(() => ({}))
            if (!d || !d.ok) {
              await lwAlert((d && d.error) || '恢复失败')
              btn.disabled = false
              btn.textContent = '恢复显示'
              return
            }
            data.list = d.list || []
            sub.textContent = '共 ' + data.list.length + ' 件被下架。点「恢复显示」可以让作品立刻回到社区。'
            render()
          } catch (e) {
            await lwAlert('网络错误')
            btn.disabled = false
            btn.textContent = '恢复显示'
          }
        })
        row.appendChild(btn)

        list.appendChild(row)

        // 拉作品像素画进缩略图。拉不到就留空，不影响操作
        fetch('/api/get?single=1&locate=' + encodeURIComponent(h.time))
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            const px = d && d.work && d.work.pixels
            if (!px || !window.LWThumb) return
            window.LWThumb.draw(cv, px, 16, {})
          })
          .catch(() => {})
      })
    }

    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]')
      if (!btn) return
      mine = btn.getAttribute('data-tab') === 'mine'
      tabs.querySelectorAll('.mp-tab').forEach((el) => el.classList.toggle('on', el === btn))
      render()
    })

    await load()
  },
}
