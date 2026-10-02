// 背包与合成台
//
//   /town/bag
//
// 上半是背包（六种材料 + 去镇上转转），下半是合成台（配方表）。
// 合出来的是「商店买不到」的那批家具，所以材料这条线和光尘那条线不打架：
// 光尘想买什么买什么，材料是一点点攒出来的。
export default {
  name: 'bag',
  title: '背包',
  css: `
      [hidden] { display: none !important; }
      .bg-wrap { width: 100%; max-width: 460px; margin: 0 auto; padding: 0 0 20px; }
      .bg-bar { display: flex; align-items: center; margin-bottom: 10px; }
      .bg-bar > * + * { margin-left: 10px; }
      .bg-back {
        display: inline-flex; align-items: center; flex: none;
        border: 1px solid var(--border-strong); background: var(--surface-2);
        color: var(--text-muted); border-radius: 999px; padding: 6px 13px;
        font-size: 12px; font-weight: 700; text-decoration: none;
      }
      .bg-bar-main { flex: 1; min-width: 0; }
      .bg-title { font-size: 17px; font-weight: 800; color: var(--text); }
      .bg-sub { font-size: 11px; color: var(--text-faint); }

      .bg-card {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 16px; padding: 13px; margin-bottom: 12px;
      }
      .bg-h { font-size: 13px; font-weight: 800; color: var(--text); margin-bottom: 10px; }
      .bg-h span { font-weight: 600; color: var(--text-faint); font-size: 11px; }

      /* ---------- 背包 ---------- */
      .bg-mats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 7px; }
      .bg-mat {
        display: flex; flex-direction: column; align-items: center;
        background: var(--surface-2); border-radius: 11px; padding: 8px 2px 6px;
      }
      .bg-mat-ico { font-size: 20px; line-height: 1.2; }
      .bg-mat-n { font-size: 13px; font-weight: 800; color: var(--text); margin-top: 1px; }
      .bg-mat-n.zero { color: var(--text-faint); font-weight: 600; }
      .bg-mat-name { font-size: 9px; color: var(--text-faint); margin-top: 1px; }

      .bg-gather { display: flex; align-items: center; margin-top: 12px; }
      .bg-go {
        flex: 1; border: 0; border-radius: 11px; padding: 11px;
        background: var(--accent); color: #fff;
        font-size: 13px; font-weight: 800; font-family: inherit; cursor: pointer;
      }
      .bg-go[disabled] { background: var(--surface-2); color: var(--text-faint); cursor: default; }
      .bg-cd { font-size: 11px; color: var(--text-faint); margin-left: 10px; flex: none; }

      /* ---------- 合成台 ---------- */
      .bg-list { display: flex; flex-direction: column; }
      .bg-rec {
        display: flex; align-items: center; padding: 9px 0;
        border-top: 1px solid var(--border);
      }
      .bg-rec:first-child { border-top: 0; }
      .bg-rec-cv {
        width: 42px; height: 42px; flex: none; image-rendering: pixelated;
        background: var(--surface-2); border-radius: 9px; display: block;
      }
      .bg-rec-mid { flex: 1; min-width: 0; margin: 0 10px; }
      .bg-rec-n { font-size: 13px; font-weight: 800; color: var(--text); }
      .bg-rec-need { display: flex; flex-wrap: wrap; margin-top: 4px; }
      .bg-need {
        font-size: 10px; font-weight: 700; border-radius: 999px;
        padding: 2px 7px; margin: 0 5px 4px 0;
        background: var(--surface-2); color: var(--text-muted);
      }
      .bg-need.short { background: #fdecea; color: #c0392b; }
      .bg-need.enough { background: #e8f5e9; color: #2e7d32; }
      .bg-make {
        flex: none; border: 0; border-radius: 9px; padding: 8px 13px;
        background: var(--accent); color: #fff;
        font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
      }
      .bg-make[disabled] { background: var(--surface-2); color: var(--text-faint); cursor: default; }
      .bg-make.done { background: var(--surface-2); color: #2e7d32; }
      .bg-msg {
        margin: 0 2px 10px; font-size: 12px; line-height: 1.75;
        color: var(--text-muted); background: var(--surface-2);
        border-radius: 10px; padding: 8px 11px;
      }
      .bg-msg[hidden] { display: none; }
      .bg-msg.bad { background: #fdecea; color: #c0392b; }
      .bg-note { font-size: 12px; line-height: 1.8; color: var(--text-faint); margin: 0 2px; }
      .bg-empty { font-size: 13px; color: var(--text-faint); text-align: center; padding: 24px 10px; }
    `,
  template: `
    <div class="bg-wrap">
      <div class="bg-bar">
        <a class="bg-back" id="bgBack" href="/town">← 小镇</a>
        <div class="bg-bar-main">
          <div class="bg-title" id="bgTitle">🎒 背包与合成台</div>
          <div class="bg-sub" id="bgSub"></div>
        </div>
        <button class="lw-refresh" id="bgRefresh" type="button" data-label="刷新"></button>
      </div>
      <div id="bgMsg" class="bg-msg" hidden></div>
      <div id="bgBody"><div class="bg-empty">正在读取…</div></div>
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

    let PAL = {}
    let mats = []
    let bag = {}
    let recipes = []
    let owned = []
    let state = { can: false, cdLeft: 0, dayLeft: 0, perDay: 12 }
    let rules = { cd: 1200000, perDay: 12, min: 1, max: 3 }
    let busy = false
    let tick = null

    function msg(text, bad) {
      const el = $('bgMsg')
      if (!el) return
      el.textContent = text || ''
      el.hidden = !text
      el.classList.toggle('bad', !!bad)
    }

    /* ---------- 画家具 ---------- */
    function drawArt(ctx, art, pal, ox, oy) {
      for (let y = 0; y < art.length; y++) {
        for (let x = 0; x < art[y].length; x++) {
          const ch = art[y][x]
          if (ch === '.') continue
          const c = pal[ch]
          if (!c) continue
          ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'
          ctx.fillRect(ox + x, oy + y, 1, 1)
        }
      }
    }
    /* 配方缩略图：画在 9×9 里居中，边框自动留白 */
    function paintRecipeThumbs() {
      document.querySelectorAll('canvas[data-rec]').forEach((cv) => {
        const r = recipes.find((x) => x.id === cv.getAttribute('data-rec'))
        if (!r || !r.art || !r.art.length) return
        const N = 9
        cv.width = N
        cv.height = N
        const c = cv.getContext('2d')
        c.fillStyle = 'rgba(0,0,0,0)'
        c.clearRect(0, 0, N, N)
        let w = 0
        for (const row of r.art) if (row.length > w) w = row.length
        const ox = Math.max(0, Math.floor((N - w) / 2))
        const oy = Math.max(0, Math.floor((N - r.art.length) / 2))
        drawArt(c, r.art, PAL, ox, oy)
      })
    }

    const matOf = (id) => mats.find((m) => m.id === id) || { id, name: id, ico: '❔' }

    /* ---------- 渲染 ---------- */
    function render() {
      $('bgTitle').textContent = '🎒 背包与合成台'
      const total = Object.values(bag).reduce((a, b) => a + (Number(b) || 0), 0)
      const madeN = recipes.filter((r) => r.owned).length
      $('bgSub').textContent = total + ' 个材料 · 已合成 ' + madeN + '/' + recipes.length

      const matHtml = mats
        .map((m) => {
          const n = Number(bag[m.id]) || 0
          return (
            '<div class="bg-mat" title="' + esc(m.name) + '">' +
            '<span class="bg-mat-ico">' + m.ico + '</span>' +
            '<span class="bg-mat-n' + (n ? '' : ' zero') + '">' + n + '</span>' +
            '<span class="bg-mat-name">' + esc(m.name) + '</span></div>'
          )
        })
        .join('')

      const cd = state.cdLeft || 0
      const canGo = !!state.can && !busy
      let cdText = ''
      if (!state.can) {
        cdText = cd > 0 ? fmtLeft(cd) : '今天转够了'
      } else {
        cdText = '今天还能转 ' + state.dayLeft + ' 趟'
      }

      const recHtml = recipes
        .map((r) => {
          const need = Object.keys(r.need)
            .map((k) => {
              const m = matOf(k)
              const short = (r.lack[k] || 0) > 0
              return '<span class="bg-need ' + (short ? 'short' : 'enough') + '">' +
                m.ico + ' ' + esc(m.name) + ' ' + (r.have[k] || 0) + '/' + r.need[k] + '</span>'
            })
            .join('')
          const btn = r.owned
            ? '<button class="bg-make done" type="button" disabled>已有</button>'
            : '<button class="bg-make" type="button" data-make="' + esc(r.id) + '"' + (r.ok ? '' : ' disabled') + '>' +
              (r.ok ? '合成' : '材料不够') + '</button>'
          return (
            '<div class="bg-rec">' +
            '<canvas class="bg-rec-cv" data-rec="' + esc(r.id) + '"></canvas>' +
            '<div class="bg-rec-mid">' +
            '<div class="bg-rec-n">' + esc(r.name) + (r.owned ? ' ✓' : '') + '</div>' +
            '<div class="bg-rec-need">' + need + '</div>' +
            '</div>' + btn + '</div>'
          )
        })
        .join('')

      $('bgBody').innerHTML =
        '<div class="bg-card">' +
        '<div class="bg-h">材料 <span>去镇上转转就能捡到，20 分钟一趟</span></div>' +
        (mats.length ? '<div class="bg-mats">' + matHtml + '</div>' : '<div class="bg-empty">读取中…</div>') +
        '<div class="bg-gather">' +
        '<button class="bg-go" id="bgGo" type="button"' + (canGo ? '' : ' disabled') + '>' +
        (canGo ? '🚶 去镇上转转' : '歇一会儿') + '</button>' +
        '<span class="bg-cd">' + esc(cdText) + '</span>' +
        '</div></div>' +

        '<div class="bg-card">' +
        '<div class="bg-h">合成台 <span>做出来的家具商店里买不到</span></div>' +
        (recipes.length ? '<div class="bg-list">' + recHtml + '</div>' : '<div class="bg-empty">读取中…</div>') +
        '</div>' +

        '<div class="bg-note">合成出来的家具会直接进你的收藏，回小屋在「我的家具」里就能摆。<br />' +
        '材料只能靠转悠攒，光尘买不到 —— 两边各管各的，谁也替不了谁。</div>'

      paintRecipeThumbs()
      const go = $('bgGo')
      if (go) go.addEventListener('click', doGather)
      $('bgBody').querySelectorAll('[data-make]').forEach((b) => {
        b.addEventListener('click', () => doCraft(b.getAttribute('data-make'), b))
      })
    }

    function fmtLeft(ms) {
      const s = Math.max(0, Math.ceil(ms / 1000))
      const m = Math.floor(s / 60)
      const r = s % 60
      return m > 0 ? m + ' 分 ' + r + ' 秒后还能转' : r + ' 秒后还能转'
    }

    /* 冷却倒计时：只改文字，不整页重画，免得按钮被点飞 */
    function startTick() {
      if (tick) clearInterval(tick)
      tick = setInterval(() => {
        if (!state.cdLeft) return
        state.cdLeft = Math.max(0, state.cdLeft - 1000)
        if (state.cdLeft === 0) {
          state.can = (state.dayLeft || 0) > 0
          render()
          return
        }
        const el = document.querySelector('.bg-cd')
        const btn = $('bgGo')
        if (el) el.textContent = fmtLeft(state.cdLeft)
        if (btn && !state.cdLeft) btn.disabled = false
      }, 1000)
    }

    /* ---------- 网络 ---------- */
    async function api(payload) {
      const t = token()
      if (!t) {
        msg('背包和账号绑定，登录之后才能捡东西', true)
        return null
      }
      try {
        const res = await fetch('/api/craft', {
          method: payload ? 'POST' : 'GET',
          headers: payload
            ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }
            : { Authorization: 'Bearer ' + t },
          body: payload ? JSON.stringify(payload) : undefined,
          cache: 'no-store',
        })
        const j = await res.json().catch(() => ({}))
        return { status: res.status, body: j }
      } catch (e) {
        msg('网络错误', true)
        return null
      }
    }

    async function doGather() {
      if (busy) return
      busy = true
      const btn = $('bgGo')
      if (btn) btn.disabled = true
      const r = await api({ action: 'gather' })
      busy = false
      if (!r) return
      if (!r.body.ok) {
        msg(r.body.error || '捡不到东西', true)
        if (r.body.state) {
          state = r.body.state
          render()
        }
        return
      }
      bag = r.body.bag || bag
      state = r.body.state || state
      recipes = r.body.recipes || recipes
      const gotTxt = Object.keys(r.body.got || {})
        .map((k) => matOf(k).ico + ' ' + matOf(k).name + ' ×' + r.body.got[k])
        .join('　')
      if (window.sfx) window.sfx('coin')
      msg('捡到了：' + gotTxt)
      render()
    }

    async function doCraft(id, btn) {
      if (busy) return
      const r0 = recipes.find((x) => x.id === id)
      if (!r0 || r0.owned || !r0.ok) return
      busy = true
      if (btn) btn.disabled = true
      const r = await api({ action: 'craft', id })
      busy = false
      if (!r) return
      if (!r.body.ok) {
        msg(r.body.error || '合成失败', true)
        if (btn) btn.disabled = false
        return
      }
      bag = r.body.bag || bag
      owned = r.body.owned || owned
      recipes = r.body.recipes || recipes
      if (window.sfx) window.sfx('save')
      msg('「' + (r.body.name || id) + '」做好了，回小屋就能摆出来 ✨')
      render()
    }

    async function load(force) {
      const r = await api(null)
      if (!r) return
      if (!r.body.ok) {
        $('bgBody').innerHTML = '<div class="bg-empty">' + esc(r.body.error || '读取失败') + '</div>'
        return
      }
      PAL = r.body.pal || {}
      mats = r.body.materials || []
      bag = r.body.bag || {}
      recipes = r.body.recipes || []
      owned = r.body.owned || []
      state = r.body.state || state
      rules = r.body.rules || rules
      msg('')
      render()
      startTick()
      void force
    }

    const back = $('bgBack')
    if (back) {
      back.addEventListener('click', (e) => {
        e.preventDefault()
        if (window.__lwRouter) window.__lwRouter.push('/town')
        else location.href = '/town'
      })
    }

    const C = window.LWCache || {}
    C.bindRefresh($('bgRefresh'), () => load(true), () => {}, true)
    load(false)
  },
}
