// 像素小镇 · 地图与个人小屋
//
//   /town                小镇地图：一排排小屋，点谁进谁家
//   /town/home           回自己家（顺便在地图上登记一间屋）
//   /town/home?uid=xxx   去别人家串门（只能看，不能动人家东西）
//
// 地图不逐间读屋子：服务端把「门面」信息（最贵的那件家具、件数）
// 存在索引里，打开地图只读一个键。所以人多也不会变慢。
//
// 物品库（家具 / 墙纸 / 地板）由服务端下发，前端不自己维护一份。
// 墙纸和地板只给「图案名 + 配色」，房间里的花纹是现画的。
export default {
  name: 'town',
  title: '小镇',
  css: `
      [hidden] { display: none !important; }
      .tw-wrap { width: 100%; max-width: 460px; margin: 0 auto; padding: 0 0 20px; }
      .tw-bar { display: flex; align-items: center; margin-bottom: 10px; }
      .tw-bar > * + * { margin-left: 10px; }
      .tw-back {
        display: inline-flex; align-items: center; flex: none;
        border: 1px solid var(--border-strong); background: var(--surface-2);
        color: var(--text-muted); border-radius: 999px; padding: 6px 13px;
        font-size: 12px; font-weight: 700; text-decoration: none;
      }
      .tw-bar-main { flex: 1; min-width: 0; }
      .tw-title { font-size: 17px; font-weight: 800; color: var(--text); }
      .tw-sub { font-size: 11px; color: var(--text-faint); }

      /* ---------- 地图 ---------- */
      .tw-map {
        position: relative; border-radius: 16px; overflow: hidden;
        border: 1px solid #6f9e53;
        background-color: #8fc46b;
        /* 草地：斜纹打底，再压一层深浅相间的横向「田垄」 */
        background-image:
          repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 6px, transparent 6px 12px),
          repeating-linear-gradient(0deg, rgba(0,0,0,.05) 0 14px, transparent 14px 28px);
        padding: 10px 10px 6px;
        box-shadow: inset 0 0 34px rgba(40,80,20,.22);
      }
      /* 村口那条土路 */
      .tw-road {
        height: 12px; margin: 0 -10px 8px;
        background: repeating-linear-gradient(90deg, #c9a870 0 7px, #be9c64 7px 14px);
        border-top: 1px solid #a9884f; border-bottom: 1px solid #a9884f;
      }
      .tw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
      .tw-plot {
        border: 0; background: transparent; padding: 5px 2px 3px;
        display: flex; flex-direction: column; align-items: center;
        cursor: pointer; font-family: inherit; border-radius: 12px;
      }
      .tw-plot:active { background: rgba(255,255,255,.2); }
      .tw-plot canvas { display: block; width: 58px; height: 50px; image-rendering: pixelated; }
      .tw-plot-name {
        margin-top: 2px; max-width: 100%;
        font-size: 11px; font-weight: 800; color: #22401a;
        text-shadow: 0 1px 0 rgba(255,255,255,.55);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .tw-plot-top { font-size: 10px; color: #3a5a2a; }
      .tw-empty {
        font-size: 13px; line-height: 1.95; color: #2f4a22; text-align: center;
        padding: 30px 14px; font-weight: 600;
      }
      .tw-sign {
        margin-top: 8px; padding: 8px 10px;
        background: #7a5a34; border: 2px solid #5d431f; border-radius: 8px;
        color: #f6ecd8; font-size: 11px; line-height: 1.7; text-align: center;
      }

      /* ---------- 小屋 ---------- */
      .tw-room-wrap { position: relative; max-width: 340px; margin: 0 auto; }
      .tw-room {
        display: block; width: 100%; image-rendering: pixelated;
        border-radius: 14px; border: 1px solid var(--border-strong);
        background: var(--surface-2);
        touch-action: manipulation;
      }
      .tw-room.editing { cursor: crosshair; }
      .tw-acts { display: flex; justify-content: center; margin-top: 12px; }
      .tw-acts > * + * { margin-left: 8px; }
      .tw-btn {
        border: 0; border-radius: 999px; padding: 10px 18px;
        font-size: 13px; font-weight: 800; font-family: inherit;
        background: var(--accent); color: #fff; cursor: pointer;
      }
      .tw-btn.ghost {
        background: var(--surface-2); color: var(--text-muted);
        border: 1px solid var(--border-input);
      }
      .tw-btn[disabled] { opacity: .55; cursor: default; }
      .tw-note {
        margin: 12px 2px 0; font-size: 12px; line-height: 1.75; color: var(--text-faint);
      }

      /* ---------- 家具铺 ---------- */
      .tw-tray {
        margin-top: 14px; padding: 12px;
        background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
      }
      .tw-tray-h { font-size: 13px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
      .tw-tray-h span { font-weight: 600; color: var(--text-faint); font-size: 11px; }
      .tw-items { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .tw-item {
        border: 1px solid var(--border-input); background: var(--surface-2);
        border-radius: 10px; padding: 7px 2px; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; font-family: inherit;
      }
      .tw-item canvas { width: 34px; height: 34px; image-rendering: pixelated; display: block; }
      .tw-item span { font-size: 10px; color: var(--text-muted); margin-top: 4px; text-align: center; }
      .tw-item.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, var(--surface)); }
      .tw-item[disabled] { opacity: .45; cursor: default; }
      .tw-item-price { font-size: 10px; font-weight: 800; color: #b8860b; }
      .tw-tabs { display: flex; flex-wrap: wrap; margin: 0 0 9px; }
      .tw-tab {
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text-muted); border-radius: 999px; padding: 5px 11px;
        font-size: 11px; font-weight: 700; font-family: inherit;
        cursor: pointer; margin: 0 6px 6px 0;
      }
      .tw-tab.on { background: var(--accent); border-color: var(--accent); color: #fff; }
      .tw-hint { font-size: 12px; color: var(--text-faint); line-height: 1.8; padding: 2px 0; }

      /* ---------- 留言板 ---------- */
      .tw-gift { display: flex; align-items: center; margin-top: 12px; }
      .tw-gift .tw-btn { flex: 1; }
      .tw-gift .tw-btn.on { background: var(--surface-2); color: #2e7d32; border: 1px solid var(--border-input); }
      .tw-board {
        margin-top: 14px; padding: 12px;
        background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
      }
      .tw-board-h { font-size: 13px; font-weight: 800; color: var(--text); margin-bottom: 9px; }
      .tw-board-h span { font-weight: 600; color: var(--text-faint); font-size: 11px; }
      .tw-post { display: flex; margin-bottom: 10px; }
      .tw-post input {
        flex: 1; min-width: 0; border: 1px solid var(--border-input);
        background: var(--surface-2); color: var(--text);
        border-radius: 10px; padding: 9px 11px; font-size: 13px; font-family: inherit;
      }
      .tw-post button {
        flex: none; margin-left: 8px; border: 0; border-radius: 10px;
        padding: 9px 14px; background: var(--accent); color: #fff;
        font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
      }
      .tw-post button[disabled] { background: var(--surface-2); color: var(--text-faint); cursor: default; }
      .tw-msg {
        display: flex; align-items: flex-start; padding: 7px 0;
        border-top: 1px solid var(--border); font-size: 12px; line-height: 1.7;
      }
      .tw-msg:first-of-type { border-top: 0; }
      .tw-msg-n { flex: none; font-weight: 800; color: var(--text-muted); margin-right: 7px; }
      .tw-msg-t { flex: 1; min-width: 0; color: var(--text); word-break: break-word; }
      .tw-msg-x {
        flex: none; border: 0; background: transparent; color: var(--text-faint);
        font-size: 12px; cursor: pointer; font-family: inherit; padding: 0 0 0 8px;
      }
    `,
  template: `
    <div class="tw-wrap">
      <div class="tw-bar">
        <a class="tw-back" id="twBack" href="/mine">← 我的</a>
        <div class="tw-bar-main">
          <div class="tw-title" id="twTitle">🏘️ 像素小镇</div>
          <div class="tw-sub" id="twSub"></div>
        </div>
        <button class="lw-refresh" id="twRefresh" type="button" data-label="刷新"></button>
      </div>
      <div id="twBody"><div class="tw-empty">正在读取…</div></div>
      <div class="tw-note" id="twMsg" hidden></div>
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

    const q = new URLSearchParams(location.search)
    const wantUid = (q.get('to') || q.get('uid') || '').trim()
    const isHome = /\/town\/home\/?$/.test(location.pathname)
    let mine = !wantUid

    let ROOM = 16 // 房间边长，由服务端下发（可扩建）
    let floorY = 5 // 第几行往下算地板，同样由服务端给
    let PAL = {}
    /* 物品库分两半：furniture 能摆在屋里，surfaces 是墙纸地板（整片贴）。
       shopTab 是家具铺当前翻到哪一页。 */
    let cat = { furniture: [], surfaces: [], cats: {} }
    let house = { wall: '', floor: '', items: [], owned: [] }
    let shopTab = 'seat'
    let woodName = ''
    let picked = '' // 手上拿着哪件家具，'' 表示空手
    let dirty = false
    /* 留言板与「送光尘给屋主」。liked 是「我给这间屋子送过没有」 */
    let msgs = []
    let liked = false
    let giftCost = 1
    let msgLen = 60

    const findItem = (id) => cat.furniture.find((x) => x.id === id) || cat.surfaces.find((x) => x.id === id)
    /** 下一档房间尺寸；已经是最大的就返回 null */
    const nextSizeOf = () => {
      const arr = cat.sizes || []
      const i = arr.findIndex((x) => x.size === ROOM)
      return i >= 0 && i + 1 < arr.length ? arr[i + 1] : null
    }

    function msg(text, bad) {
      const el = $('twMsg')
      if (!el) return
      el.textContent = text || ''
      el.hidden = !text
      el.style.color = bad ? '#c0392b' : ''
    }

    /* ---------- 画像素 ---------- */
    /* 把字符画按调色板画进 ctx 的 (ox,oy)，每格 1 个逻辑像素 */
    function drawArt(ctx, art, pal, ox, oy) {
      for (let y = 0; y < art.length; y++) {
        for (let x = 0; x < art[y].length; x++) {
          const ch = art[y][x]
          if (ch === '.') continue
          const col = pal[ch]
          if (!col) continue
          ctx.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')'
          ctx.fillRect(ox + x, oy + y, 1, 1)
        }
      }
    }
    const artSize = (art) => {
      let w = 0
      for (const r of art) if (r.length > w) w = r.length
      return { w, h: art.length }
    }

    /* 贴面图案：不存 16×16 的数据，按「图案名 + 配色」现算。
       8 种墙纸 × 4 套配色就是 32 款，数据只占几行。
       y0 是纵向偏移 —— 地板要从地板那一行开始铺，花纹才对得上。 */
    function surfaceTile(s, n, y0) {
      const out = []
      const a = s ? s.colors[0] : '.'
      const b = s ? s.colors[1] : '.'
      const pat = s ? s.pat : 'plain'
      for (let y = 0; y < n; y++) {
        const row = []
        for (let x = 0; x < n; x++) {
          const gy = y + (y0 || 0)
          let ch = a
          switch (pat) {
            case 'dots': ch = x % 4 === 1 && gy % 4 === 1 ? b : a; break
            case 'stripe': ch = x % 4 === 0 ? b : a; break
            case 'grid': ch = x % 4 === 0 || gy % 4 === 0 ? b : a; break
            case 'brick': ch = gy % 4 === 3 || (x + (gy >> 2) * 2) % 4 === 0 ? b : a; break
            case 'star':
              ch = (x % 8 === 3 && gy % 8 >= 2 && gy % 8 <= 4) || (gy % 8 === 3 && x % 8 >= 2 && x % 8 <= 4) ? b : a
              break
            case 'wave': ch = (x + Math.round(Math.sin(gy / 2) * 1.5)) % 4 === 0 ? b : a; break
            case 'checker': ch = ((x >> 1) + (gy >> 1)) % 2 ? b : a; break
            case 'wood': ch = x % 6 === 0 || gy % 4 === 0 ? b : a; break
            case 'plank': ch = gy % 4 === 0 ? b : a; break
            case 'tile': ch = x % 4 === 3 || gy % 4 === 3 ? b : a; break
            case 'stone': ch = (x * 7 + gy * 13) % 11 < 2 ? b : a; break
            case 'carpet': ch = (x + gy) % 2 ? b : a; break
            case 'grass': ch = (x * 5 + gy * 3) % 7 < 2 ? b : a; break
            default: ch = a
          }
          row.push(ch)
        }
        out.push(row)
      }
      return out
    }
    const surfaceOf = (id) => cat.surfaces.find((x) => x.id === id) || null

    /* ---------- 小房子外观（地图上用） ----------
       尺寸 14×12，画布就是 14×12，靠 CSS 放大（pixelated，不会糊）。
       屋顶颜色由 uid 决定，所以每个人家门口都不一样。 */
    const ROOFS = [
      [198, 74, 74],
      [122, 168, 214],
      [226, 138, 74],
      [186, 124, 196],
      [86, 160, 74],
    ]
    function hashOf(s) {
      let h = 2166136261
      const t = String(s || '')
      for (let i = 0; i < t.length; i++) {
        h ^= t.charCodeAt(i)
        h = Math.imul(h, 16777619) >>> 0
      }
      return h
    }
    function drawHouse(cv, uid, hasStuff) {
      cv.width = 14
      cv.height = 12
      const c = cv.getContext('2d')
      const roof = ROOFS[hashOf(uid) % ROOFS.length]
      // 门口一小块草地，房子才不会像浮在半空
      c.fillStyle = 'rgba(120,180,90,.55)'
      c.fillRect(0, 10, 14, 2)
      c.fillStyle = 'rgb(' + roof[0] + ',' + roof[1] + ',' + roof[2] + ')'
      c.fillRect(1, 1, 12, 5) // 屋顶
      c.fillStyle = 'rgb(246,238,224)'
      c.fillRect(2, 6, 10, 5) // 墙
      c.fillStyle = 'rgb(124,82,48)'
      c.fillRect(6, 8, 2, 3) // 门
      c.fillStyle = 'rgb(122,168,214)'
      c.fillRect(3, 7, 2, 2) // 左窗
      c.fillRect(9, 7, 2, 2) // 右窗
      if (hasStuff) {
        // 屋里有东西：烟囱冒一缕烟
        c.fillStyle = 'rgba(255,255,255,.8)'
        c.fillRect(11, 0, 2, 2)
      }
    }

    /* ---------- 房间 ---------- */
    function drawRoom() {
      const cv = $('twRoom')
      if (!cv) return
      cv.width = ROOM
      cv.height = ROOM
      const c = cv.getContext('2d')
      const FLOOR = floorY // 地板线跟着房间尺寸走
      const wt = surfaceTile(surfaceOf(house.wall), ROOM, 0)
      const ft = surfaceTile(surfaceOf(house.floor), ROOM, FLOOR)
      for (let y = 0; y < ROOM; y++) {
        for (let x = 0; x < ROOM; x++) {
          const ch = y < FLOOR ? wt[y][x] : ft[y - FLOOR][x]
          const col = PAL[ch] || (y < FLOOR ? [232, 220, 204] : [198, 168, 128])
          c.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')'
          c.fillRect(x, y, 1, 1)
        }
      }
      // 墙脚线：一条深色横线，房间立刻有了纵深
      c.fillStyle = 'rgba(0,0,0,.20)'
      c.fillRect(0, FLOOR - 1, ROOM, 1)
      // 家具
      for (const it of house.items || []) {
        const f = findItem(it.id)
        if (!f || !f.art) continue
        drawArt(c, f.art, PAL, it.x, it.y)
      }
      // 布置模式：网格线，方便对齐
      if (mine && picked && cv.classList.contains('editing')) {
        c.fillStyle = 'rgba(0,0,0,.13)'
        for (let i = 1; i < ROOM; i++) {
          c.fillRect(i, 0, 0.05, ROOM)
          c.fillRect(0, i, ROOM, 0.05)
        }
      }
    }

    /* ---------- 地图 ---------- */
    function drawMap(data) {
      const list = data.list || []
      const grid = list
        .map((h) => {
          const top = findItem(h.top)
          return (
            '<button class="tw-plot" type="button" data-uid="' + esc(h.uid) + '">' +
            '<canvas data-house="' + esc(h.uid) + '" data-stuff="' + (h.n > 0 ? '1' : '') + '"></canvas>' +
            '<span class="tw-plot-name">' + esc(h.name) + '</span>' +
            '<span class="tw-plot-top">' + (top ? esc(top.name) + ' ×' + h.n : '空屋子') + '</span>' +
            '</button>'
          )
        })
        .join('')

      $('twTitle').textContent = '🏘️ 像素小镇'
      $('twSub').textContent = list.length ? list.length + ' 户人家' : '还没有人盖房子'
      $('twBody').innerHTML =
        '<div class="tw-map">' +
        '<div class="tw-road"></div>' +
        (list.length
          ? '<div class="tw-grid">' + grid + '</div>'
          : '<div class="tw-empty">镇上还空着。<br />回自己的小屋摆几件家具，<br />你就是这里的第一户人家。</div>') +
        '<div class="tw-sign">🏠 点谁家的房子，就去谁家串门<br />串门只能看，动不了人家的东西</div>' +
        '</div>' +
        '<div class="tw-acts">' +
        '<button class="tw-btn" type="button" id="twGoHome">🏠 回我的小屋</button>' +
        '<button class="tw-btn ghost" type="button" id="twGoBag">🎒 背包与合成台</button>' +
        '</div>'

      $('twBody').querySelectorAll('canvas[data-house]').forEach((cv) => {
        drawHouse(cv, cv.getAttribute('data-house'), cv.getAttribute('data-stuff') === '1')
      })
      $('twBody').querySelectorAll('.tw-plot').forEach((b) => {
        b.addEventListener('click', () => {
          if (window.sfx) window.sfx('open')
          const to = '/town/home?uid=' + encodeURIComponent(b.getAttribute('data-uid'))
          if (window.__lwRouter) window.__lwRouter.push(to)
          else location.href = to
        })
      })
      const gb = $('twGoBag')
      if (gb) {
        gb.addEventListener('click', () => {
          if (window.sfx) window.sfx('tick')
          const to = '/town/bag'
          if (window.__lwRouter) window.__lwRouter.push(to)
          else location.href = to
        })
      }
      const gh = $('twGoHome')
      if (gh) {
        gh.addEventListener('click', () => {
          if (window.sfx) window.sfx('tick')
          if (window.__lwRouter) window.__lwRouter.push('/town/home')
          else location.href = '/town/home'
        })
      }
    }

    /* ---------- 家具铺 ---------- */
    const itemBtn = (f, mode) =>
      '<button class="tw-item' + (mode === 'pick' && picked === f.id ? ' on' : '') +
      '" type="button" data-' + mode + '="' + esc(f.id) + '">' +
      '<canvas data-art="' + esc(f.id) + '"></canvas>' +
      '<span>' + esc(f.name) + '</span>' +
      (mode === 'buy' ? '<span class="tw-item-price">' + f.price + ' ✨</span>' : '') +
      '</button>'

    const surfBtn = (sf) => {
      const has = (house.owned || []).indexOf(sf.id) >= 0
      const on = sf.kind === 'wall' ? house.wall === sf.id : house.floor === sf.id
      return (
        '<button class="tw-item' + (on ? ' on' : '') + '" type="button" data-' +
        (has ? 'surface' : 'buy') + '="' + esc(sf.id) + '">' +
        '<canvas data-surface="' + esc(sf.id) + '"></canvas>' +
        '<span>' + esc(sf.name) + '</span>' +
        (on ? '<span class="tw-item-price">用着这个</span>'
            : has ? '' : '<span class="tw-item-price">' + sf.price + ' ✨</span>') +
        '</button>'
      )
    }

    function tabsHtml() {
      const cats = cat.cats || {}
      const all = Object.keys(cats).concat(['wall', 'floor'])
      const label = (k) => (k === 'wall' ? '🧱 墙纸' : k === 'floor' ? '🟫 地板' : cats[k])
      return all
        .map((k) => '<button class="tw-tab' + (shopTab === k ? ' on' : '') +
          '" type="button" data-tab="' + esc(k) + '">' + esc(label(k)) + '</button>')
        .join('')
    }

    function trayHtml() {
      const owned = house.owned || []
      const myItems = owned.map(findItem).filter((f) => f && !f.kind)
      const mineHtml = myItems.length
        ? '<div class="tw-items">' + myItems.map((f) => itemBtn(f, 'pick')).join('') + '</div>'
        : '<div class="tw-hint">还一件家具都没有，去下面的铺子挑一件吧。</div>'

      let shelf
      if (shopTab === 'wall' || shopTab === 'floor') {
        shelf = '<div class="tw-items">' +
          cat.surfaces.filter((sf) => sf.kind === shopTab).map(surfBtn).join('') + '</div>'
      } else {
        // 已经买下的不再重复摆在铺子里，省得翻半天
        const shop = cat.furniture.filter((f) => f.cat === shopTab && owned.indexOf(f.id) < 0)
        shelf = shop.length
          ? '<div class="tw-items">' + shop.map((f) => itemBtn(f, 'buy')).join('') + '</div>'
          : '<div class="tw-hint">这一类的家具你都买齐了 🎉</div>'
      }

      return (
        '<div class="tw-tray">' +
        '<div class="tw-tray-h">我的家具 <span>点一件拿在手上，再点房间放下</span></div>' +
        '<div class="tw-tabs"><button class="tw-tab" type="button" id="twToBag">🎒 去合成台做新家具</button></div>' +
        mineHtml +
        '<div class="tw-tray-h" style="margin-top:14px">家具铺 <span>买下就永久归你，想摆几件摆几件</span></div>' +
        '<div class="tw-tabs">' + tabsHtml() + '</div>' +
        shelf +
        '</div>'
      )
    }

    function bindTray() {
      const body = $('twBody')
      // 家具：字符画逐格画
      body.querySelectorAll('canvas[data-art]').forEach((cv) => {
        const f = findItem(cv.getAttribute('data-art'))
        if (!f || !f.art) return
        const sz = artSize(f.art)
        cv.width = sz.w
        cv.height = sz.h
        drawArt(cv.getContext('2d'), f.art, PAL, 0, 0)
      })
      // 贴面：画一小块样板，8×8 就够看出花纹了
      body.querySelectorAll('canvas[data-surface]').forEach((cv) => {
        const sf = findItem(cv.getAttribute('data-surface'))
        if (!sf || !sf.colors) return
        const N = 8
        cv.width = N
        cv.height = N
        const c = cv.getContext('2d')
        const tile = surfaceTile(sf, N, 0)
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const col = PAL[tile[y][x]] || [230, 230, 230]
            c.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')'
            c.fillRect(x, y, 1, 1)
          }
        }
      })
      const toBag = $('twToBag')
      if (toBag) {
        toBag.addEventListener('click', () => {
          if (window.sfx) window.sfx('tick')
          if (window.__lwRouter) window.__lwRouter.push('/town/bag')
          else location.href = '/town/bag'
        })
      }
      body.querySelectorAll('[data-tab]').forEach((b) => {
        b.addEventListener('click', () => {
          shopTab = b.getAttribute('data-tab')
          if (window.sfx) window.sfx('tick')
          renderHome()
        })
      })
      body.querySelectorAll('[data-pick]').forEach((b) => {
        b.addEventListener('click', () => {
          const id = b.getAttribute('data-pick')
          picked = picked === id ? '' : id
          if (window.sfx) window.sfx('tick')
          renderHome()
        })
      })
      body.querySelectorAll('[data-buy]').forEach((b) => {
        b.addEventListener('click', () => buy(b.getAttribute('data-buy'), b))
      })
      body.querySelectorAll('[data-surface]').forEach((b) => {
        b.addEventListener('click', () => applySurface(b.getAttribute('data-surface'), b))
      })
    }

    /* ---------- 留言板 ---------- */
    function boardHtml() {
      // 兜一道：msgs 正常都是数组（load 里写死 d.msgs || []），
      // 但这里是拼 HTML，真拿到脏数据也不能整页白掉
      const src = Array.isArray(msgs) ? msgs : []
      const rows = src
        .filter((m) => m && typeof m === 'object')
        .sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0))
      const list = rows
        .map((m) =>
          '<div class="tw-msg">' +
          '<span class="tw-msg-n">' + esc(m.name) + '</span>' +
          '<span class="tw-msg-t">' + esc(m.text) + '</span>' +
          // 只有屋主能删自己板子上的留言（接口那边也只删自己的）
          (mine ? '<button class="tw-msg-x" type="button" data-delmsg="' + esc(m.id) + '">删</button>' : '') +
          '</div>')
        .join('')
      return (
        '<div class="tw-board">' +
        '<div class="tw-board-h">💬 留言板 <span>' + rows.length + ' 条' +
        (mine ? ' · 来你家的人可以留一句' : ' · 给屋主留一句') + '</span></div>' +
        (mine
          ? ''
          : '<div class="tw-post">' +
            '<input id="twMsgIn" type="text" maxlength="' + msgLen + '" placeholder="说点什么…">' +
            '<button type="button" id="twMsgGo">留一句</button>' +
            '</div>') +
        (list || '<div class="tw-hint">还没有人留言。</div>') +
        '</div>'
      )
    }

    /* ---------- 小屋 ---------- */
    function renderHome() {
      $('twTitle').textContent = mine ? '🏠 我的小屋' : '🏠 ' + (woodName || '镇民') + '的家'
      const nx = nextSizeOf()
      $('twSub').textContent = mine
        ? ROOM + '×' + ROOM + ' · ' + (house.items || []).length + ' 件摆出来 · ' + (house.owned || []).length + ' 件收藏'
        : ROOM + '×' + ROOM + ' · 来串门看看'
      $('twBody').innerHTML =
        '<div class="tw-room-wrap">' +
        '<canvas class="tw-room' + (mine && picked ? ' editing' : '') + '" id="twRoom" width="' +
        ROOM + '" height="' + ROOM + '"></canvas>' +
        '</div>' +
        (mine
          ? '<div class="tw-acts">' +
            '<button class="tw-btn" type="button" id="twSave"' + (dirty ? '' : ' disabled') + '>' +
            (dirty ? '保存布置' : '已保存') + '</button>' +
            '<button class="tw-btn ghost" type="button" id="twClear">全部收起来</button>' +
            '</div>' +
            '<div class="tw-acts">' +
            (nx
              ? '<button class="tw-btn ghost" type="button" id="twUp">📐 扩建成' + esc(nx.name) +
                '（' + nx.size + '×' + nx.size + '，' + nx.price + ' ✨）</button>'
              : '<span class="tw-hint">🏆 这已经是你家最大的院子了</span>') +
            '</div>'
          : '') +
        '<div class="tw-note">' +
        (mine
          ? '拿在手上的家具，点房间就能放下；空手时点屋里的家具可以收起来。<br />墙纸和地板在铺子的「🧱 墙纸 / 🟫 地板」里换。'
          : '这是人家的屋子，只能看，动不了人家的东西。') +
        '</div>' +
        (mine
          ? ''
          : '<div class="tw-gift">' +
            '<button class="tw-btn' + (liked ? ' on' : '') + '" type="button" id="twGift"' +
            (liked ? ' disabled' : '') + '>' +
            (liked
              ? '✅ 已经给这间屋子送过光尘了'
              : '✨ 送 ' + giftCost + ' 个光尘给 ' + esc(woodName || '屋主')) +
            '</button></div>') +
        boardHtml() +
        (mine ? trayHtml() : '')
      drawRoom()
      if (mine) bindTray()

      const cv = $('twRoom')
      if (cv && mine) {
        cv.addEventListener('click', (ev) => {
          const r = cv.getBoundingClientRect()
          if (r.width <= 0) return
          /* 画布有一条 1px 边框，而 getBoundingClientRect() 的宽度是含边框的。
             不减掉的话点击位置会整体偏一点，格子越小越明显。 */
          const bx = cv.clientLeft || 0
          const by = cv.clientTop || 0
          const iw = cv.clientWidth || r.width
          const ih = cv.clientHeight || r.height
          const x = Math.floor(((ev.clientX - r.left - bx) / iw) * ROOM)
          const y = Math.floor(((ev.clientY - r.top - by) / ih) * ROOM)
          if (x < 0 || y < 0 || x >= ROOM || y >= ROOM) return

          if (picked) {
            // 放下手上这件
            const f = findItem(picked)
            if (!f || !f.art) return
            const s = artSize(f.art)
            if (x + s.w > ROOM || y + s.h > ROOM) {
              msg('这里放不下，往左边或上边挪一挪', true)
              return
            }
            // 床摆在墙上会像浮在半空。钟、画、窗这类挂墙的不在此限
            if (!f.wallOk && y + s.h - 1 < floorY) {
              msg('「' + f.name + '」得放在地上，往下挪一挪', true)
              return
            }
            // 和已有家具重叠就不给放（服务端也会拦，这里先拦一次少一次往返）
            for (const it of house.items) {
              const g = findItem(it.id)
              if (!g || !g.art) continue
              const gs = artSize(g.art)
              if (x < it.x + gs.w && x + s.w > it.x && y < it.y + gs.h && y + s.h > it.y) {
                msg('这里已经有东西了', true)
                return
              }
            }
            house.items.push({ id: picked, x, y })
            dirty = true
            msg('')
            if (window.sfx) window.sfx('pop')
            renderHome()
            return
          }
          // 空手：点房间里的家具 = 收起来
          for (let i = house.items.length - 1; i >= 0; i--) {
            const it = house.items[i]
            const f = findItem(it.id)
            if (!f || !f.art) continue
            const s = artSize(f.art)
            if (x >= it.x && x < it.x + s.w && y >= it.y && y < it.y + s.h) {
              house.items.splice(i, 1)
              dirty = true
              if (window.sfx) window.sfx('undo')
              renderHome()
              return
            }
          }
        })
      }

      const sv = $('twSave')
      if (sv) {
        sv.addEventListener('click', async () => {
          if (sv.disabled) return
          sv.disabled = true
          sv.textContent = '保存中…'
          const d = await post({ action: 'save', items: house.items })
          if (!d || !d.ok) {
            msg((d && d.error) || '保存失败', true)
            sv.disabled = false
            sv.textContent = '保存布置'
            return
          }
          dirty = false
          if (window.sfx) window.sfx('save')
          msg('布置好了，镇上的人都能来看 ✨')
          renderHome()
        })
      }
      const gift = $('twGift')
      if (gift) gift.addEventListener('click', doGiftHome)

      const go = $('twMsgGo')
      const inp2 = $('twMsgIn')
      if (go && inp2) {
        const submit = () => doPostMsg(inp2.value)
        go.addEventListener('click', submit)
        inp2.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        })
      }
      $('twBody').querySelectorAll('[data-delmsg]').forEach((b) => {
        b.addEventListener('click', () => doDelMsg(b.getAttribute('data-delmsg')))
      })

      const up = $('twUp')
      if (up) up.addEventListener('click', upgrade)

      const cl = $('twClear')
      if (cl) {
        cl.addEventListener('click', async () => {
          if (!house.items.length) return
          if (!(await lwConfirm('把屋里的家具全收起来？家具还是你的，随时能再摆。'))) return
          const d = await post({ action: 'clear' })
          if (!d || !d.ok) {
            msg((d && d.error) || '操作失败', true)
            return
          }
          house.items = []
          dirty = false
          if (window.sfx) window.sfx('clear')
          msg('都收起来了')
          renderHome()
        })
      }
    }

    /* ---------- 网络 ---------- */
    async function post(payload) {
      const t = token()
      if (!t) {
        msg('这个操作要登录', true)
        return null
      }
      try {
        const res = await fetch('/api/town', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify(payload),
        })
        return await res.json().catch(() => ({}))
      } catch (e) {
        return { error: '网络错误' }
      }
    }

    async function buy(id, btn) {
      const f = findItem(id)
      if (!f || btn.disabled) return
      if (!(await lwConfirm('花 ' + f.price + ' 个光尘买下「' + f.name + '」？买过就永久归你。'))) return
      btn.disabled = true
      const d = await post({ action: 'buy', id })
      btn.disabled = false
      if (!d || !d.ok) {
        msg((d && d.error) || '买不了', true)
        return
      }
      house.owned = d.owned || house.owned
      if (d.book && window.dust && window.dust.take) window.dust.take(d.book)
      if (window.sfx) window.sfx('coin')

      // 贴面买完直接换上 —— 它不用「摆」，买来就是为了贴
      if (f.kind) {
        const d2 = await post({ action: 'surface', id })
        if (d2 && d2.ok) {
          house.wall = d2.wall
          house.floor = d2.floor
        }
        msg('「' + f.name + '」买好了，已经给你换上 ✨')
        renderHome()
        return
      }
      msg('「' + f.name + '」买好了，点它拿在手上吧')
      picked = id
      renderHome()
    }

    /** 给这间屋子的主人送光尘。和「给作品送」是两套记录，各送各的 */
    async function doGiftHome() {
      if (liked || mine) return
      const who = woodName || '屋主'
      if (!window.confirm('送 ' + giftCost + ' 个光尘给 ' + who + '？送出就从你账上扣掉了。')) return
      const d = await post({ action: 'like', to: wantUid })
      if (!d || !d.ok) {
        msg((d && d.error) || '送不出去', true)
        return
      }
      liked = true
      if (d.book && window.dust && window.dust.take) window.dust.take(d.book)
      if (window.sfx) window.sfx('coin')
      msg('光尘送到了，' + who + ' 会看到的 ✨')
      renderHome()
    }

    /** 在留言板上留一句 */
    async function doPostMsg(text) {
      const t = String(text == null ? '' : text).trim()
      if (!t) {
        msg('说点什么再留吧', true)
        return
      }
      const d = await post({ action: 'msg', to: wantUid, text: t })
      if (!d || !d.ok) {
        msg((d && d.error) || '留不了', true)
        return
      }
      msgs = d.msgs || msgs
      if (window.sfx) window.sfx('ding')
      msg('留好了')
      renderHome()
    }

    /** 删自己家的一条留言 */
    async function doDelMsg(id) {
      if (!window.confirm('删掉这条留言？')) return
      const d = await post({ action: 'delmsg', id })
      if (!d || !d.ok) {
        msg((d && d.error) || '删不掉', true)
        return
      }
      msgs = d.msgs || []
      if (window.sfx) window.sfx('clear')
      renderHome()
    }

    /** 扩建屋子。只升不降 —— 降级要把放不下的家具挪走，那是给人找麻烦 */
    async function upgrade() {
      const nx = nextSizeOf()
      if (!nx) return
      if (!(await lwConfirm('花 ' + nx.price + ' 个光尘，把屋子扩成' + nx.name + '（' + nx.size + '×' + nx.size + '）？\n家具原地不动，不用重新摆。'))) return
      const d = await post({ action: 'upgrade' })
      if (!d || !d.ok) {
        msg((d && d.error) || '扩建失败', true)
        return
      }
      ROOM = d.room || ROOM
      floorY = d.floor || floorY
      if (d.book && window.dust && window.dust.take) window.dust.take(d.book)
      if (window.sfx) window.sfx('save')
      msg('扩建好了！现在有 ' + ROOM + '×' + ROOM + ' 大 🎉')
      renderHome()
    }

    /** 换上已经买过的墙纸 / 地板 */
    async function applySurface(id, btn) {
      const f = findItem(id)
      if (!f || btn.disabled) return
      btn.disabled = true
      const d = await post({ action: 'surface', id })
      btn.disabled = false
      if (!d || !d.ok) {
        msg((d && d.error) || '换不了', true)
        return
      }
      house.wall = d.wall
      house.floor = d.floor
      if (window.sfx) window.sfx('save')
      msg('换好了：' + f.name)
      renderHome()
    }

    async function load(force) {
      const C = window.LWCache || {}
      const key = isHome ? 'town:home:' + (wantUid || 'me') : 'town:map'
      if (force && C.drop) C.drop(key)
      $('twBody').innerHTML = '<div class="tw-empty">正在读取…</div>'
      try {
        const url = isHome
          ? '/api/town' + (wantUid ? '?uid=' + encodeURIComponent(wantUid) : '')
          : '/api/town?list=1'
        const res = await fetch(url, {
          headers: token() ? { Authorization: 'Bearer ' + token() } : {},
          cache: 'no-store',
        })
        const d = await res.json().catch(() => ({}))
        if (!res.ok || !d || !d.ok) {
          $('twBody').innerHTML = '<div class="tw-empty">' + esc((d && d.error) || '读取失败') + '</div>'
          return
        }
        ROOM = d.room || 16
        floorY = d.floor || Math.max(4, Math.round(ROOM / 3))
        PAL = d.pal || {}
        cat = d.catalog || { furniture: [], surfaces: [], cats: {} }
        if (isHome) {
          house = d.house || { wall: '', floor: '', items: [], owned: [] }
          mine = !!d.mine
          woodName = d.name || ''
          msgs = d.msgs || []
          liked = !!d.liked
          giftCost = Number(d.cost) || 1
          msgLen = Number(d.msgLen) || 60
          dirty = false
          picked = ''
          renderHome()
        } else {
          drawMap(d)
        }
      } catch (e) {
        $('twBody').innerHTML = '<div class="tw-empty">读取失败：' + esc((e && e.message) || '网络错误') + '</div>'
      }
    }

    // 返回按钮：小屋回地图，地图回「我的」
    const back = $('twBack')
    if (back) {
      back.textContent = isHome ? '← 小镇' : '← 我的'
      back.setAttribute('href', isHome ? '/town' : '/mine')
      back.addEventListener('click', (e) => {
        e.preventDefault()
        const to = isHome ? '/town' : '/mine'
        if (window.__lwRouter) window.__lwRouter.push(to)
        else location.href = to
      })
    }

    const C = window.LWCache || {}
    C.bindRefresh($('twRefresh'), () => load(true), () => {}, true)
    load(false)
  },
}
