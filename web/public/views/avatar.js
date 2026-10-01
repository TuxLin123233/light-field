// 画头像：16×16 像素编辑器
// 规则：首次保存扣 30 光尘（服务端裁决），之后随便改不再收费。
// 没画过的用户看到的是默认头像，也可以照样花 30 光尘换成自己的。
export default {
  name: 'avatar',
  title: '画头像',
  css: `
      .av-page {
        min-height: 100vh;
        padding: 14px 14px calc(30px + env(safe-area-inset-bottom, 0px));
        max-width: 520px;
        margin: 0 auto;
      }
      .av-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .av-back {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--text-muted2);
        text-decoration: none;
      }
      .av-title { font-size: 18px; font-weight: 800; color: var(--text); }

      .av-cost {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px 14px;
        margin-bottom: 12px;
        font-size: 13px;
        line-height: 1.7;
        color: var(--text-muted);
      }
      .av-cost b { color: var(--text); }
      .av-cost-warn {
        border-color: #d9534f;
        color: #d9534f;
        font-weight: 700;
      }
      .av-cost-ok { color: var(--text-faint); }

      .av-stage {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }
      .av-canvas {
        width: 256px;
        height: 256px;
        max-width: 78vw;
        max-height: 78vw;
        image-rendering: pixelated;
        touch-action: none;
        border-radius: 10px;
        border: 1px solid var(--border);
        cursor: crosshair;
        display: block;
      }
      .av-preview {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 12px;
        border-top: 1px dashed var(--border);
        width: 100%;
        justify-content: center;
      }
      .av-pv-label { font-size: 12px; color: var(--text-faint); }
      .av-pv {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .av-pv canvas {
        border-radius: 9px;
        border: 1px solid var(--border);
        image-rendering: pixelated;
        display: block;
      }

      .av-pal {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 7px;
        width: 100%;
      }
      .av-sw {
        aspect-ratio: 1;
        border-radius: 8px;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
      }
      .av-sw.on {
        border-color: var(--text);
        transform: scale(1.06);
      }
      .av-tools {
        display: flex;
        gap: 8px;
        width: 100%;
      }
      .av-tool {
        flex: 1;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text);
        border-radius: 11px;
        padding: 10px 6px;
        font-size: 13px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
      }
      .av-tool.on {
        background: var(--accent, #5b8def);
        color: #fff;
        border-color: var(--accent, #5b8def);
      }
      .av-tool[disabled] { opacity: 0.5; cursor: default; }

      .av-act {
        display: flex;
        gap: 9px;
        margin-top: 14px;
      }
      .av-btn {
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
      .av-btn.ghost {
        background: var(--surface-2);
        color: var(--text);
        border: 1px solid var(--border);
        flex: 0 0 96px;
      }
      .av-btn[disabled] { opacity: 0.55; cursor: default; }

      .av-note {
        font-size: 12px;
        line-height: 1.75;
        color: var(--text-faint);
        margin: 12px 2px 0;
      }
    `,
  template: `
    <div class="av-page">
      <div class="av-head">
        <router-link class="av-back" to="/mine">← 我的</router-link>
        <div class="av-title">🎨 画头像</div>
      </div>
      <div id="avBody">
        <div class="av-cost">正在读取…</div>
      </div>
    </div>`,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const SIZE = 16
    const CELLS = SIZE * SIZE
    const A = window.LWAvatar
    const WHITE = [255, 255, 255]

    // 画板用的 32 色调色板，和主画板一致
    const PALETTE = [
      [0, 0, 0], [60, 60, 60], [120, 120, 120], [200, 200, 200], [255, 255, 255], [240, 208, 160],
      [230, 170, 110], [190, 120, 70], [140, 80, 45], [90, 55, 30],
      [220, 90, 90], [200, 50, 60], [150, 30, 40], [255, 160, 170], [255, 210, 200],
      [240, 150, 60], [230, 110, 30], [180, 70, 20], [250, 220, 90], [215, 175, 40],
      [140, 190, 90], [70, 150, 60], [40, 110, 45], [190, 230, 130],
      [110, 190, 220], [50, 140, 190], [30, 90, 140], [160, 220, 235],
      [150, 110, 210], [100, 70, 170], [60, 40, 110], [200, 180, 235],
      [120, 90, 60], [200, 200, 205], [90, 130, 90], [170, 90, 140],
    ]

    let px = new Array(CELLS).fill(null).map(() => WHITE.slice())
    let color = PALETTE[0]
    let tool = 'pen' // pen | eraser | mirror
    let paid = false
    let cost = 30
    let balance = 0
    let dirty = false
    let drawing = false
    let lastCell = -1

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
    function blank() {
      return new Array(CELLS).fill(null).map(() => WHITE.slice())
    }
    function isEmpty() {
      for (const p of px) {
        if (!(p[0] > 246 && p[1] > 246 && p[2] > 246)) return false
      }
      return true
    }

    function paintCell(i) {
      if (i < 0 || i >= CELLS) return
      if (tool === 'eraser') {
        px[i] = WHITE.slice()
      } else {
        px[i] = color.slice()
        // 镜像：左半边落笔时右半边跟着一起
        if (tool === 'mirror') {
          const x = i % SIZE
          const y = Math.floor(i / SIZE)
          px[y * SIZE + (SIZE - 1 - x)] = color.slice()
        }
      }
      dirty = true
      draw()
    }

    function cellAt(ev) {
      const cv = $('avCanvas')
      if (!cv) return -1
      const r = cv.getBoundingClientRect()
      const cx = ev.clientX - r.left
      const cy = ev.clientY - r.top
      if (cx < 0 || cy < 0 || cx >= r.width || cy >= r.height) return -1
      const x = Math.min(SIZE - 1, Math.floor((cx / r.width) * SIZE))
      const y = Math.min(SIZE - 1, Math.floor((cy / r.height) * SIZE))
      return y * SIZE + x
    }

    let dpr = 1
    function draw() {
      const cv = $('avCanvas')
      if (!cv) return
      const box = Math.min(256, Math.floor(Math.min(window.innerWidth * 0.78, 360)))
      dpr = window.devicePixelRatio || 1
      cv.width = SIZE * dpr
      cv.height = SIZE * dpr
      cv.style.width = box + 'px'
      cv.style.height = box + 'px'
      const ctx = cv.getContext('2d')
      ctx.imageSmoothingEnabled = false
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // 棋盘底，方便看清白格
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          ctx.fillStyle = (x + y) % 2 ? '#f2efe9' : '#e8e4dc'
          ctx.fillRect(x, y, 1.02, 1.02)
        }
      }
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          const p = px[y * SIZE + x]
          if (p[0] > 246 && p[1] > 246 && p[2] > 246) continue
          ctx.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')'
          ctx.fillRect(x, y, 1.02, 1.02)
        }
      }
      // 预览：32px 和 16px 两个尺寸
      A.draw($('pv32'), null, 32, px)
      A.draw($('pv16'), null, 16, px)
      const b = $('avSave')
      if (b) b.disabled = false
    }

    function renderFrame() {
      const enough = balance >= (paid ? 0 : cost)
      const costHtml = paid
        ? '<span class="av-cost-ok">你已经解锁过头像，<b>以后随便改</b>都不再扣光尘。</span>'
        : enough
          ? '首次保存要花 <b>' + cost + ' 个光尘</b>，你现在有 <b>' + balance + '</b> 个，够用。解锁后再改就不扣了。'
          : '<span class="av-cost-warn">首次保存要 ' + cost + ' 个光尘，你只有 ' + balance + ' 个，还差 ' + (cost - balance) + ' 个。</span> 去「我的」签到攒一攒吧。'

      $('avBody').innerHTML =
        '<div class="av-cost">' + costHtml + '</div>' +
        '<div class="av-stage">' +
        '<canvas class="av-canvas" id="avCanvas"></canvas>' +
        '<div class="av-preview">' +
        '<span class="av-pv-label">效果</span>' +
        '<span class="av-pv"><canvas id="pv32"></canvas><canvas id="pv16"></canvas></span>' +
        '</div></div>' +
        '<div class="av-pal" id="avPal"></div>' +
        '<div class="av-tools">' +
        '<button class="av-tool' + (tool === 'pen' ? ' on' : '') + '" type="button" data-tool="pen">✏️ 画笔</button>' +
        '<button class="av-tool' + (tool === 'eraser' ? ' on' : '') + '" type="button" data-tool="eraser">🩹 橡皮</button>' +
        '<button class="av-tool' + (tool === 'mirror' ? ' on' : '') + '" type="button" data-tool="mirror">🦋 镜像</button>' +
        '</div>' +
        '<div class="av-act">' +
        '<button class="av-btn ghost" type="button" id="avClear">清空</button>' +
        '<button class="av-btn" type="button" id="avSave">保存头像</button>' +
        '</div>' +
        '<p class="av-note">用手指或鼠标在格子上涂。16×16 很小，画不出细节，建议只做几块色块。<br />头像会显示在社区里你发布的每幅作品上。</p>'

      const pal = $('avPal')
      PALETTE.forEach((c, i) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'av-sw' + (i === 0 ? ' on' : '')
        b.style.background = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'
        b.setAttribute('data-i', String(i))
        b.setAttribute('aria-label', '颜色 ' + (i + 1))
        pal.appendChild(b)
      })

      draw()
    }

    // 事件
    $('avBody').addEventListener('click', async (e) => {
      const sw = e.target.closest('.av-sw')
      if (sw) {
        color = PALETTE[Number(sw.getAttribute('data-i'))] || PALETTE[0]
        if (tool === 'eraser') tool = 'pen'
        $('avBody').querySelectorAll('.av-sw').forEach((x) => x.classList.remove('on'))
        sw.classList.add('on')
        $('avBody').querySelectorAll('.av-tool').forEach((x) => x.classList.toggle('on', x.getAttribute('data-tool') === tool))
        return
      }
      const tl = e.target.closest('.av-tool')
      if (tl) {
        tool = tl.getAttribute('data-tool')
        $('avBody').querySelectorAll('.av-tool').forEach((x) => x.classList.toggle('on', x.getAttribute('data-tool') === tool))
        return
      }
      if (e.target.id === 'avClear') {
        px = blank()
        dirty = true
        draw()
        return
      }
      if (e.target.id === 'avSave') await save()
    })

    // 画布是 init 异步返回后才插进来的，所以事件挂在一直存在的 avBody 上做委托，
    // 直接绑 canvas 会在首屏拿到 null。
    const host = $('avBody')
    host.addEventListener('pointerdown', (e) => {
      if (!e.target || e.target.id !== 'avCanvas') return
      e.preventDefault()
      drawing = true
      lastCell = -1
      paintCell(cellAt(e))
    })
    host.addEventListener('pointermove', (e) => {
      if (!drawing) return
      if (!e.target || e.target.id !== 'avCanvas') return
      const i = cellAt(e)
      if (i === lastCell) return
      lastCell = i
      paintCell(i)
    })
    const stop = () => {
      drawing = false
      lastCell = -1
    }
    host.addEventListener('pointerup', stop)
    host.addEventListener('pointercancel', stop)
    host.addEventListener('pointerleave', stop)

    async function save() {
      const t = token()
      if (!t) {
        toast('请先登录')
        return
      }
      if (isEmpty()) {
        toast('还没画呢，至少涂几格')
        return
      }
      const btn = $('avSave')
      btn.disabled = true
      btn.textContent = '保存中…'
      try {
        const res = await fetch('/api/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'save', pixels: px }),
        })
        const d = await res.json().catch(() => ({}))
        if (!res.ok || !d.ok) {
          if (d && d.book) balance = d.book.bal
          toast(d && d.error ? d.error : '保存失败')
          btn.disabled = false
          btn.textContent = '保存头像'
          renderFrame()
          return
        }
        paid = true
        cost = 30
        if (d.book) balance = d.book.bal
        dirty = false
        // 让别处立刻用上新头像
        if (A) A.put(d.uid || '', d.pixels)
        if (window.sfx) window.sfx('ding')
        toast(d.charged ? '头像画好啦，花了 ' + d.charged + ' 个光尘 ✨' : '头像已更新')
        renderFrame()
        window.dispatchEvent(new CustomEvent('lw-avatar-changed'))
      } catch (err) {
        toast('保存失败：网络错误')
        btn.disabled = false
        btn.textContent = '保存头像'
      }
    }

    // 初始加载
    ;(async function init() {
      const t = token()
      if (!t) {
        $('avBody').innerHTML =
          '<div class="av-cost"><span class="av-cost-warn">画头像需要登录。</span></div>'
        return
      }
      try {
        const res = await fetch('/api/avatar', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        if (res.status === 401) {
          $('avBody').innerHTML = '<div class="av-cost"><span class="av-cost-warn">登录状态已失效，请重新登录。</span></div>'
          return
        }
        const d = await res.json().catch(() => ({}))
        if (!d || !d.ok) {
          $('avBody').innerHTML = '<div class="av-cost">读取失败：' + esc((d && d.error) || res.status) + '</div>'
          return
        }
        paid = !!d.paid
        cost = Number(d.cost) || 30
        balance = d.book ? Number(d.book.bal) || 0 : 0
        px = Array.isArray(d.pixels) && d.pixels.length === CELLS ? d.pixels.map((p) => [p[0], p[1], p[2]]) : blank()
        // 载入后先画一帧，这样能拿到 canvas 引用
        renderFrame()
      } catch (e) {
        $('avBody').innerHTML = '<div class="av-cost">读取失败：网络错误</div>'
      }
    })()
  },
}
