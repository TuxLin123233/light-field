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
        box-shadow: inset 0 0 34px rgba(40,80,20,.22);
        /* ★ 地图不能无限往下长。
           原来 3 列住户网格，30 户就是 10 行 ≈ 900px，
           一进小镇页要滑好几屏才看到底下的按钮。
           现在整个地图限高，住户区在内部自己滚，
           村口土路和底下的提示牌固定不动 —— 这才像个「地图」而不是「长列表」。 */
        display: flex; flex-direction: column;
        max-height: 340px;
        padding: 0;
      }
      /* 住户区：唯一的滚动容器 */
      .tw-map-scroll {
        flex: 1; min-height: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 8px 10px 4px;
      }
      /* 村口那条土路：贴在地图顶部，不随住户区滚动 */
      .tw-road {
        flex: none; height: 12px;
        background: repeating-linear-gradient(90deg, #c9a870 0 7px, #be9c64 7px 14px);
        border-top: 1px solid #a9884f; border-bottom: 1px solid #a9884f;
      }
            /* 4 列而不是 3 列：同样的户数少三分之一的行数。
         窄屏下用容器查询不行（兼容性），所以给个下限保护。 */
      .tw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
      @media (max-width: 340px) {
        .tw-grid { grid-template-columns: repeat(3, 1fr); }
      }
      /* 收起 / 展开住户区。默认只显示前 8 户 ——
         镇上人多了以后，一屏全是房子，往下滑半天看不到「回我的小屋」。 */
      .tw-fold {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        width: 100%; margin-top: 8px; padding: 9px;
        border: 1px dashed rgba(255,255,255,.45);
        border-radius: 10px;
        background: rgba(255,255,255,.16);
        color: #2f4a20; font-family: inherit; font-size: 12.5px; font-weight: 700;
        cursor: pointer;
      }
      .tw-fold:active { transform: scale(.98); }
      .tw-fold .tw-fold-caret { transition: transform .2s }
      .tw-fold.open .tw-fold-caret { transform: rotate(180deg) }
      .tw-plot.hidden-by-fold { display: none }

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
        flex: none;
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
      /* 自己家的屋子要能拖着挪家具，必须给 touch-action: none。

         manipulation 只是禁掉双击缩放、**仍然允许平移**：手指在画布上一划，
         浏览器会判成「滚动页面」，手势一旦被它接管就不会再发 pointermove，
         改发 pointercancel —— 于是 endDrag(true) 把刚拖起来的家具原样弹回去，
         手感就是「按下去家具跟着动，一划就弹回来，等于拖不动」。
         鼠标没这个毛病（鼠标没有平移手势），所以是「电脑上能拖、手机上拖不动」。

         touch-action 必须在手势**开始前**声明，中途改是来不及的，
         这也是 pointerdown 里 preventDefault 救不了的原因，只能提前声明 none。
         代价是在这块画布上没法用手指滑页面；不过屋子下面还有家具栏和商店，
         页面照样滚得动。来串门（不是自己的屋子）保持 manipulation，不受影响。 */
      .tw-room.mine { touch-action: none; }
      .tw-room.editing { cursor: crosshair; }
      .tw-room.dragging { cursor: grabbing; }
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
      /* 「窗外的天气」那一栏 */
      .tw-weather { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }
      .tw-weather-h { font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 7px; }

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
    // 服务端对「还没盖房子的人」会返回空屋 + hasHouse:false，
    // 这时要说清楚是「他家还是空的」，不能让人以为加载失败了
    let hasHouse = true

    let ROOM = 16 // 房间边长，由服务端下发（可扩建）
    let floorY = 8 // 第几行往下算地板：上半墙、下半地面（正好一半）
    let PAL = {}
    /* 物品库分两半：furniture 能摆在屋里，surfaces 是墙纸地板（整片贴）。
       shopTab 是家具铺当前翻到哪一页。 */
    let cat = { furniture: [], surfaces: [], cats: {} }
    let house = { wall: '', floor: '', items: [], owned: [] }
    let shopTab = 'seat'
    let woodName = ''
    let picked = '' // 手上拿着哪件家具，'' 表示空手
    let dragOn = null // 正在拖的那件：{ i, dx, dy, ox, oy, moved }
    let wxTimer = null // 天气动画
    let dirty = false
    /* 留言板与「送光尘给屋主」。liked 是「我给这间屋子送过没有」 */
    let msgs = []
    let liked = false
    let giftCost = 1
    let msgLen = 60

    /**
     * 把「基础家具 + 主题」拼成完整目录。
     * 服务端只发 104 件基础家具和 5 套主题（16KB），500 多件配色变体在这里现算 ——
     * 全发的话光目录就 208KB，手机打开小镇要白等好几秒。
     * 这条规则必须和服务端 _townitems.js 里的 makeVariants 一模一样。
     */
    function buildCatalog(list, themes) {
      const out = []
      for (const f of list) out.push({ ...f, theme: '', pal: null, base: f.id })
      for (const t of themes || []) {
        for (const f of list) {
          out.push({
            id: f.id + '__' + t.key,
            name: f.name + ' · ' + t.name,
            price: Math.max(6, Math.round(f.price * t.mult)),
            cat: f.cat,
            art: f.art,
            wallOk: f.wallOk,
            theme: t.key,
            pal: t.pal || null,
            base: f.id,
          })
        }
      }
      return out
    }

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

    /**
     * 这件东西放在当前位置行不行。
     * 行就返回 true；不行返回一句能直接给人看的原因。
     * 拖拽落点和「拿在手上放下」都走这一套判定，规则只有一份。
     */
    function placeWhy(it, exceptIdx) {
      const f = findItem(it.id)
      if (!f || !f.art) return '这件东西不认识了'
      /* 每件家具商店里只卖一份，摆两个以上就是凭空复制。
         拖着自己那件挪位置时 exceptIdx 指向它本身，不会被这里误判。 */
      for (let i = 0; i < house.items.length; i++) {
        if (i === exceptIdx) continue
        if (house.items[i].id === it.id) return '「' + f.name + '」你已经摆了一个了'
      }
      const sz = artSize(f.art)
      if (it.x < 0 || it.y < 0 || it.x + sz.w > ROOM || it.y + sz.h > ROOM) return '这里放不下，往里边挪一挪'
      if (!f.wallOk && it.y + sz.h - 1 < floorY) return '「' + f.name + '」得放在地上，往下挪一挪'
      for (let i = 0; i < house.items.length; i++) {
        if (i === exceptIdx) continue
        const o = house.items[i]
        const g = findItem(o.id)
        if (!g || !g.art) continue
        const gs = artSize(g.art)
        if (it.x < o.x + gs.w && it.x + sz.w > o.x && it.y < o.y + gs.h && it.y + sz.h > o.y) {
          return '这里已经有东西了'
        }
      }
      return true
    }

    /* 天气动画：4 帧/秒就够了，像素雨雪不需要更顺 */
    function startWeather() {
      stopWeather()
      wxTimer = setInterval(() => {
        wxT++
        drawRoom()
      }, 260)
    }
    function stopWeather() {
      if (wxTimer) {
        clearInterval(wxTimer)
        wxTimer = null
      }
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

    /* ---------- 小窗与天气 ----------
       房间墙上那扇小窗会显示当前天气。天气按「北京时间的小时 + 当天日期」
       算出来，所以同一天里大家看到的是同一种，过一天会换。 */
    const WEATHER_NAME = { sunny: '晴', cloudy: '多云', rain: '雨', snow: '雪', dawn: '清晨', dusk: '黄昏', night: '夜' }

    /* 屋主自己挑的窗外天气。空串 = 跟随现实（按时间算）。
       别人来串门看到的也是屋主挑的那个。 */
    let myWeather = ''
    let WEATHER_LIST = []

    /** 现在该给窗子画哪种天气：屋主挑过就听屋主的，没挑过按现实时间算 */
    function curWeather() {
      return myWeather || weatherNow(Date.now())
    }

    /** 换窗外天气。免费，而且只改自己屋子那一个字段 */
    async function setWeather(key) {
      if (!mine || key === myWeather) return
      const before = myWeather
      myWeather = String(key || '')
      renderHome() // 先变给人看，不用等网络
      try {
        const t = token()
        const res = await fetch('/api/town', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ token: t, action: 'weather', weather: myWeather }),
        })
        const d = await res.json().catch(() => ({}))
        if (!d || !d.ok) throw new Error((d && d.error) || '换不了')
        myWeather = d.weather || ''
        house.weather = myWeather
        const C = window.LWCache || {}
        if (C.drop) C.drop('town')
        if (window.sfx) window.sfx('tick')
      } catch (e) {
        // 失败就退回原来那个，别让人以为换上了
        myWeather = before
        msg((e && e.message) || '网络错误', true)
      }

      renderHome()
    }

    function hashStr(str) {
      let h = 2166136261
      const t = String(str)
      for (let i = 0; i < t.length; i++) {
        h ^= t.charCodeAt(i)
        h = Math.imul(h, 16777619) >>> 0
      }
      return h
    }

    function weatherNow(now) {
      const d = new Date((Number(now) || Date.now()) + 8 * 3600000)
      const h = d.getUTCHours()
      const month = d.getUTCMonth() + 1
      const day = d.getUTCFullYear() * 10000 + month * 100 + d.getUTCDate()
      if (h < 5 || h >= 20) return 'night'
      if (h < 7) return 'dawn'
      if (h >= 18) return 'dusk'
      const pool = ['sunny', 'sunny', 'sunny', 'cloudy', 'cloudy', 'rain']
      if (month >= 11 || month <= 2) pool.push('snow', 'snow') // 冬天才会下雪
      return pool[hashStr(day) % pool.length]
    }

    /** 小窗贴在墙上偏右，随房间大小缩放 */
    function windowRect() {
      /* 别小于 5×5：中间的十字窗棂会把窗子切成四块，
         4×4 的时候每块只剩 1 像素，雨和雪都只能画成一个个小点，
         根本分不出来谁是谁。 */
      const w = Math.max(5, Math.round(ROOM * 0.34))
      const h = Math.max(5, Math.round(ROOM * 0.30))
      return { x: Math.round(ROOM * 0.62), y: Math.round(ROOM * 0.12), w, h }
    }

    const SKY = {
      sunny: [126, 186, 232], cloudy: [150, 164, 178], rain: [86, 104, 126],
      snow: [206, 222, 236], dawn: [232, 168, 140], dusk: [198, 124, 132], night: [38, 44, 76],
    }

    let wxT = 0 // 天气动画的帧计数

    function drawWindow(c, weather) {
      const r = windowRect()
      const sky = SKY[weather] || SKY.sunny
      c.fillStyle = 'rgb(' + sky[0] + ',' + sky[1] + ',' + sky[2] + ')'
      c.fillRect(r.x, r.y, r.w, r.h)

      const put = (px, py, col) => {
        if (px < r.x || py < r.y || px >= r.x + r.w || py >= r.y + r.h) return
        c.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')'
        c.fillRect(px, py, 1, 1)
      }

      // 太阳 / 月亮
      if (weather === 'sunny' || weather === 'dawn' || weather === 'dusk') {
        const sc = weather === 'sunny' ? [255, 228, 126] : [255, 178, 96]
        for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) put(r.x + r.w - 3 + i, r.y + 1 + j, sc)
      } else if (weather === 'night') {
        put(r.x + r.w - 3, r.y + 1, [246, 242, 210])
        put(r.x + r.w - 2, r.y + 1, [246, 242, 210])
        put(r.x + r.w - 3, r.y + 2, [246, 242, 210])
        put(r.x + r.w - 2, r.y + 2, [206, 202, 176])
        for (let i = 0; i < 4; i++) put(r.x + 1 + ((i * 3) % Math.max(1, r.w - 2)), r.y + 1 + ((i * 2) % Math.max(1, r.h - 2)), [222, 228, 250])
      }

      // 云
      if (weather === 'cloudy' || weather === 'rain' || weather === 'snow') {
        const cc = weather === 'cloudy' ? [234, 238, 242] : [178, 190, 204]
        put(r.x + 1, r.y + 1, cc); put(r.x + 2, r.y + 1, cc); put(r.x + 3, r.y + 1, cc)
        put(r.x + 1, r.y + 2, cc); put(r.x + 2, r.y + 2, cc)
      }

      // 雨 / 雪：粒子随时间下落（用帧计数驱动，看着是动的）
      if (weather === 'rain') {
        /* 雨丝要画成**一小段斜线**（滴 + 后面拖的尾巴），不能只点一个像素 ——
           窗子只有几个像素大，形状是唯一能跟雪区分开的线索。
           尾巴甩向左上，看上去就是往右下斜着落。 */
        /* 密度：窗子只有几像素，粒子多了会连成一片蓝。
           按面积算但压得很低，再加个上限。 */
        const n = Math.min(6, Math.max(3, Math.round((r.w * r.h) / 12)))
        for (let i = 0; i < n; i++) {
          const x = r.x + ((i * 5 + 1) % r.w)
          const y = r.y + ((i * 3 + Math.floor(wxT / 2)) % r.h)
          /* ★ 颜色要够深。原来用 [206,224,246] 挂在浅蓝天空上基本看不见 ——
             窗子才几个像素，反差不够等于没画。 */
          put(x, y, [150, 186, 224])
          put(x > r.x ? x - 1 : x + 1, y > r.y ? y - 1 : y + 1, [104, 146, 198])
        }
        /* 窗台溅开的水花：雨丝落到下沿时扩散一小圈。
           只在下沿那一行画，而且只在「刚落地」的那几帧出现 ——
           窗子小，画多了就成了糊在下边的一片白。 */
        const bottom = r.y + r.h - 1
        for (let i = 0; i < 2; i++) {
          const phase = (wxT + i * 4) % 12
          if (phase > 3) continue // 只在周期的前 1/4 显示
          const x = r.x + ((i * 6 + 2) % r.w)
          put(x, bottom, [128, 168, 212])
          if (phase <= 1) {
            if (x > r.x) put(x - 1, bottom, [96, 138, 190])
            if (x < r.x + r.w - 1) put(x + 1, bottom, [96, 138, 190])
          }
        }
      } else if (weather === 'snow') {
        /* 雪比雨慢得多，而且是一片一片往下**飘**（左右还会晃），
           不像雨那样一条线地赶。 */
        const n = Math.min(6, Math.max(3, Math.round((r.w * r.h) / 16)))
        for (let i = 0; i < n; i++) {
          const sway = Math.floor(Math.sin((wxT + i * 9) / 7) * 1.6)
          const x = r.x + ((((i * 5 + sway) % r.w) + r.w) % r.w)
          const y = r.y + ((i * 3 + Math.floor(wxT / 5)) % r.h)
          /* 雪是白的，但纯白挂在浅色天空上会糊掉。
             先点一颗淡蓝的「影」再压白点，边缘就出来了。 */
          put(x, y, [206, 220, 240])
          put(x, y, [252, 252, 255])
        }
        /* 雪落到窗台会积一点：下沿铺一条不规则的白色，慢慢变厚再清掉。
           跟雨的水花不同 —— 雪是「留下」，不是「溅开」。 */
        const bank = 1 + (Math.floor(wxT / 40) % 2) // 1~2 像素厚
        for (let i = 0; i < r.w; i++) {
          if ((i * 7 + Math.floor(wxT / 12)) % 5 === 0) continue // 缺口，不然太齐
          put(r.x + i, r.y + r.h - 1, [226, 234, 248])
          if (bank > 1 && (i * 3) % 4 !== 0) put(r.x + i, r.y + r.h - 2, [244, 247, 253])
        }
      }

      // 窗框 + 十字窗棂
      c.fillStyle = 'rgb(120,88,58)'
      c.fillRect(r.x - 1, r.y - 1, r.w + 2, 1)
      c.fillRect(r.x - 1, r.y + r.h, r.w + 2, 1)
      c.fillRect(r.x - 1, r.y, 1, r.h)
      c.fillRect(r.x + r.w, r.y, 1, r.h)
      c.fillStyle = 'rgb(142,106,70)'
      c.fillRect(r.x + Math.floor(r.w / 2), r.y, 1, r.h)
      c.fillRect(r.x, r.y + Math.floor(r.h / 2), r.w, 1)
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
      // 小窗（画在家具之前，挂墙的家具可以盖在上面）
      drawWindow(c, curWeather())

      // 墙脚线：一条深色横线，房间立刻有了纵深
      c.fillStyle = 'rgba(0,0,0,.20)'
      c.fillRect(0, FLOOR - 1, ROOM, 1)

      // 编辑时把「不能放东西的墙」压暗：一眼看出家具只能摆在下半部分
      if (mine && (picked || dragOn)) {
        c.fillStyle = 'rgba(30,24,18,.26)'
        c.fillRect(0, 0, ROOM, FLOOR)
      }

      // 家具。每件可以自带调色板（配色变体就是这么来的），没有才用全局 PAL
      for (const it of house.items || []) {
        const f = findItem(it.id)
        if (!f || !f.art) continue
        drawArt(c, f.art, f.pal || PAL, it.x, it.y)
      }
      // 布置模式：网格线，方便对齐
      if (mine && picked && cv.classList.contains('editing')) {
        c.fillStyle = 'rgba(0,0,0,.13)'
        for (let i = 1; i < ROOM; i++) {
          c.fillRect(i, 0, 0.05, ROOM)
          c.fillRect(0, i, ROOM, 0.05)
        }
      }

      /* 拖动时的对齐提示线。
         拖到跟别件家具的左边 / 上边齐了，就在那一条上闪一条线 ——
         像素级的手工对齐靠眼睛很难做准，有个线做参照省事很多。
         线画在最上层，1 物理像素宽（用 fillRect 而不是 stroke，
         stroke 的 1px 会被抗锯齿抹淡，在 canvas 上几乎看不见）。 */
      const g = dragOn && dragOn.guides
      if (g) {
        if (g.v != null) {
          c.fillStyle = 'rgba(91,141,239,.9)'
          c.fillRect(g.v, 0, Math.max(1 / ROOM, 0.06), ROOM)
        }
        if (g.h != null) {
          c.fillStyle = 'rgba(91,141,239,.9)'
          c.fillRect(0, g.h, ROOM, Math.max(1 / ROOM, 0.06))
        }
      }
    }

    /* ---------- 导出成图片 ----------
       把屋子画到一张离屏大画布上，导出 PNG。

       为什么不直接拿屏幕上的 twRoom 去导出：
         · 屏幕画布是 ROOM×ROOM 的逻辑像素（16/24/32），直接存出来
           就是一张 16px 的小图，放大全是锯齿。
         · 屏幕上那层「编辑态压暗」「网格线」「拖动残影」都不该出现在图里。
       所以另画一张干净的：同样的墙纸地板和家具，按 SCALE 倍放大，
       再加一圈边框和一行署名。

       放大倍数跟着房间尺寸走 —— 16 格和 32 格都用同一倍数的话，
       32 格那间导出后会小一圈，看起来像「远景」。 */
    const EXPORT_SCALE = 12
    function exportImage() {
      const SCALE = EXPORT_SCALE
      // 四周各留一条边：上面写「谁的屋」，下面写尺寸和件数
      const PAD = Math.round(SCALE * 1.6)
      // 宽高都要算上左右/上下留白。只给 W=ROOM*SCALE 的话，
      // 房间从 PAD 开始画，右边会超出画布被裁掉一条 ——
      // 而且看不出来，导出照常成功，只是图缺了一截。
      const W = ROOM * SCALE + PAD * 2
      const H = W
      const cv = document.createElement('canvas')
      cv.width = W
      cv.height = H
      const c = cv.getContext('2d')

      // 底：外面一圈木色，当画框
      c.fillStyle = '#3a2b1f'
      c.fillRect(0, 0, W, H)
      // 墙纸 + 地板，跟屏幕上画的是同一套 pattern
      const wt = surfaceTile(surfaceOf(house.wall), ROOM, 0)
      const ft = surfaceTile(surfaceOf(house.floor), ROOM, floorY)
      for (let y = 0; y < ROOM; y++) {
        for (let x = 0; x < ROOM; x++) {
          const ch = y < floorY ? wt[y][x] : ft[y - floorY][x]
          const col = PAL[ch] || (y < floorY ? [232, 220, 204] : [198, 168, 128])
          c.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')'
          // PAD 这个偏移不能忘：忘了房间就从 (0,0) 起画，
          // 画框被顶掉、标题文字直接压在地板上
          c.fillRect(PAD + x * SCALE, PAD + y * SCALE, SCALE, SCALE)
        }
      }
      // 墙上的小窗
      c.save()
      c.translate(PAD, PAD)
      c.scale(SCALE, SCALE)
      drawWindow(c, curWeather())
      c.restore()
      // 家具
      for (const it of house.items || []) {
        const f = findItem(it.id)
        if (!f || !f.art) continue
        c.save()
        c.translate(PAD + it.x * SCALE, PAD + it.y * SCALE)
        c.scale(SCALE, SCALE)
        drawArt(c, f.art, f.pal || PAL, 0, 0)
        c.restore()
      }

      // 署名。像素风的中文用系统字体就行，不必也不该去找像素中文字体 ——
      // 那类字体文件动辄好几 MB，为了几个字不值得。
      const who = mine ? '我的小屋' : (woodName || '镇民') + '的家'
      c.fillStyle = '#f3e7d0'
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.font = '700 ' + Math.round(SCALE * 0.95) + 'px system-ui, sans-serif'
      c.fillText(who, W / 2, PAD / 2)
      c.fillStyle = '#b9a48a'
      c.font = '600 ' + Math.round(SCALE * 0.6) + 'px system-ui, sans-serif'
      c.fillText(ROOM + '×' + ROOM + ' · ' + (house.items || []).length + ' 件家具', W / 2, H - PAD / 2)

      const name = (mine ? '我的小屋' : (woodName || '小屋') + '的小屋') + '.png'
      // toBlob 比 toDataURL 省内存：64×32 的图放大 12 倍后有好几 MB，
      // dataURL 会在内存里留一份 base64 字符串，手机上容易卡一下
      cv.toBlob((blob) => {
        if (!blob) {
          msg('导出失败，换个浏览器再试试', true)
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = name
        document.body.appendChild(a)
        a.click()
        a.remove()
        // 立刻 revoke 会让部分浏览器（Safari）拿不到数据，
        // 挪到下一个事件循环再释放
        setTimeout(() => URL.revokeObjectURL(url), 10000)
      }, 'image/png')
    }

    /* ---------- 地图 ---------- */
    /* 住户区默认只显示这么多，多的收起来 */
    const FOLD_LIMIT = 8
    let townFoldOpen = false
    try { townFoldOpen = localStorage.getItem('lw-town-fold') === '1' } catch (e) {}

    function drawMap(data) {
      const list = data.list || []
      const grid = list
        .map((h, i) => {
          const top = findItem(h.top)
          return (
            /* ★ 只有「当前是收起状态」才加 hidden-by-fold。
               一开始我写的是无条件 `i >= FOLD_LIMIT` 就加 ——
               那样用户展开过、状态也存进 localStorage 了，
               下次进来重新渲染又会被收起来，展开状态等于没记住。 */
            '<button class="tw-plot' + (i >= FOLD_LIMIT && !townFoldOpen ? ' hidden-by-fold' : '') + '" type="button" data-uid="' + esc(h.uid) + '">' +
            '<canvas data-house="' + esc(h.uid) + '" data-stuff="' + (h.n > 0 ? '1' : '') + '"></canvas>' +
            '<span class="tw-plot-name">' + esc(h.name) + '</span>' +
            '<span class="tw-plot-top">' + (top ? esc(top.name) + ' ×' + h.n : '空屋子') + '</span>' +
            '</button>'
          )
        })
        .join('')

      /* 折叠按钮只在住户超过限额时出现 */
      const folded = list.length > FOLD_LIMIT && !townFoldOpen
      const more = list.length - FOLD_LIMIT
      const foldHtml = list.length > FOLD_LIMIT
        ? '<button class="tw-fold' + (townFoldOpen ? ' open' : '') + '" type="button" id="twFold">' +
          '<span>' + (townFoldOpen ? '收起，只看最近 ' + FOLD_LIMIT + ' 户' : '展开另外 ' + more + ' 户') + '</span>' +
          '<span class="tw-fold-caret">▾</span>' +
          '</button>'
        : ''

      $('twTitle').textContent = '🏘️ 像素小镇'
      $('twSub').textContent = list.length
        ? list.length + ' 户人家' + (folded ? ' · 已收起 ' + more + ' 户' : '')
        : '还没有人盖房子'
      $('twBody').innerHTML =
        '<div class="tw-map">' +
        '<div class="tw-road"></div>' +
        '<div class="tw-map-scroll">' +
        (list.length
          ? '<div class="tw-grid">' + grid + '</div>' + foldHtml
          : '<div class="tw-empty">镇上还空着。<br />回自己的小屋摆几件家具，<br />你就是这里的第一户人家。</div>') +
        '</div>' +
        '<div class="tw-sign">🏠 点谁家的房子，就去谁家串门<br />串门只能看，动不了人家的东西</div>' +
        '</div>' +
        '<div class="tw-acts">' +
        '<button class="tw-btn" type="button" id="twGoHome">🏠 回我的小屋</button>' +
        '<button class="tw-btn ghost" type="button" id="twGoBag">🏠 家具商店</button>' +
'<button class="tw-btn" type="button" id="twGoCard">🃏 卡牌屋</button>' +
'<button class="tw-btn" type="button" id="twGoHotpot">🍲 大锅饭</button>' +
        '</div>'

      /* 收起 / 展开。只切 class，不重画整张地图 —— 重画会把已经画好的
       房子 canvas 全部丢掉重来，点了会闪一下。 */
    const foldBtn = $('twFold')
    if (foldBtn) {
      foldBtn.addEventListener('click', () => {
        townFoldOpen = !townFoldOpen
        try { localStorage.setItem('lw-town-fold', townFoldOpen ? '1' : '0') } catch (e) {}
        const plots = $('twBody').querySelectorAll('.tw-plot')
        plots.forEach((el, i) => el.classList.toggle('hidden-by-fold', !townFoldOpen && i >= FOLD_LIMIT))
        foldBtn.classList.toggle('open', townFoldOpen)
        foldBtn.querySelector('span').textContent = townFoldOpen
          ? '收起，只看最近 ' + FOLD_LIMIT + ' 户'
          : '展开另外 ' + (plots.length - FOLD_LIMIT) + ' 户'
        $('twSub').textContent = plots.length + ' 户人家' + (townFoldOpen ? '' : ' · 已收起 ' + (plots.length - FOLD_LIMIT) + ' 户')
        if (window.sfx) window.sfx('tap')
      })
    }

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
      const cardBtn = $('twGoCard')
      if (cardBtn) cardBtn.addEventListener('click', () => { if (window.sfx) window.sfx('tick'); const to = '/town/card'; if (window.__lwRouter) window.__lwRouter.push(to); else location.href = to })
      const hotpotBtn = $('twGoHotpot')
      if (hotpotBtn) hotpotBtn.addEventListener('click', () => { if (window.sfx) window.sfx('tick'); const to = '/town/hotpot'; if (window.__lwRouter) window.__lwRouter.push(to); else location.href = to })
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
    const itemBtn = (f, mode) => {
      /* 已经摆出去的那件在托盘里置灰：每件只有一份，摆过就不能再摆第二个，
         免得点半天点不动还不知道为什么。 */
      const placed = mode === 'pick' && (house.items || []).some((it) => it.id === f.id)
      return (
        '<button class="tw-item' + (mode === 'pick' && picked === f.id ? ' on' : '') +
        '" type="button"' + (placed ? ' disabled' : '') + ' data-' + mode + '="' + esc(f.id) + '">' +
        '<canvas data-art="' + esc(f.id) + '"></canvas>' +
        '<span>' + esc(f.name) + (placed ? ' 已摆出' : '') + '</span>' +
        (mode === 'buy' ? '<span class="tw-item-price">' + f.price + ' ✨</span>' : '') +
        '</button>'
      )
    }

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

    /* 一次最多画这么多件。加了 500 多件配色变体之后，
       一个分类能有一百多件 —— 全渲染出来会卡，而且翻半天也找不到。
       超出的部分提示用分类翻页找。 */
    const TRAY_MAX = 40

    function trayHtml() {
      const owned = house.owned || []
      const myItems = owned.map(findItem).filter((f) => f && !f.kind)
      const myShow = myItems.slice(0, TRAY_MAX)
      const mineHtml = myItems.length
        ? '<div class="tw-items">' + myShow.map((f) => itemBtn(f, 'pick')).join('') + '</div>' +
          (myItems.length > TRAY_MAX
            ? '<div class="tw-hint">还有 ' + (myItems.length - TRAY_MAX) + ' 件没显示（收藏太多了，先显示前 ' + TRAY_MAX + ' 件）</div>'
            : '')
        : '<div class="tw-hint">还一件家具都没有，去下面的铺子挑一件吧。</div>'

      let shelf
      if (shopTab === 'wall' || shopTab === 'floor') {
        shelf = '<div class="tw-items">' +
          cat.surfaces.filter((sf) => sf.kind === shopTab).map(surfBtn).join('') + '</div>'
      } else {
        // 已经买下的不再重复摆在铺子里，省得翻半天
        const shop = cat.furniture.filter((f) => f.cat === shopTab && owned.indexOf(f.id) < 0)
        const show = shop.slice(0, TRAY_MAX)
        shelf = shop.length
          ? '<div class="tw-items">' + show.map((f) => itemBtn(f, 'buy')).join('') + '</div>' +
            (shop.length > TRAY_MAX
              ? '<div class="tw-hint">这一类还有 ' + (shop.length - TRAY_MAX) + ' 件，买下前面这些会继续露出来</div>'
              : '')
          : '<div class="tw-hint">这一类的家具你都买齐了 🎉</div>'
      }

      return (
        '<div class="tw-tray">' +
        '<div class="tw-tray-h">我的家具 <span>点一件拿在手上，再点房间放下</span></div>' +
        '<div class="tw-tabs"><button class="tw-tab" type="button" id="twToBag">🏠 去家具商店</button></div>' +
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
        drawArt(cv.getContext('2d'), f.art, f.pal || PAL, 0, 0)
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
      const wname = WEATHER_NAME[curWeather()] || (myWeather ? '自定义' : '')
      $('twSub').textContent = mine
        ? ROOM + '×' + ROOM + ' · ' + (house.items || []).length + ' 件摆出来 · ' + (house.owned || []).length + ' 件收藏 · ' + wname
        : (hasHouse ? ROOM + '×' + ROOM + ' · 来串门看看' : '他家还没盖房子呢') + ' · ' + wname
      $('twBody').innerHTML =
        '<div class="tw-room-wrap">' +
        '<canvas class="tw-room' + (mine ? ' mine' : '') + (mine && picked ? ' editing' : '') + '" id="twRoom" width="' +
        ROOM + '" height="' + ROOM + '"></canvas>' +
        '</div>' +
        (mine
          ? '<div class="tw-acts">' +
            '<button class="tw-btn" type="button" id="twSave"' + (dirty ? '' : ' disabled') + '>' +
            (dirty ? '保存布置' : '已保存') + '</button>' +
            '<button class="tw-btn ghost" type="button" id="twClear">全部收起来</button>' +
            '</div>' +
            '<div class="tw-acts">' +
            '<button class="tw-btn ghost" type="button" id="twShot">🖼️ 存成图片</button>' +
            '</div>' +
            '<div class="tw-acts">' +
            (nx
              ? '<button class="tw-btn ghost" type="button" id="twUp">📐 扩建成' + esc(nx.name) +
                '（' + nx.size + '×' + nx.size + '，' + nx.price + ' ✨）</button>'
              : '<span class="tw-hint">🏆 这已经是你家最大的院子了</span>') +
            '</div>' +
        '<div class="tw-weather">' +
        '<div class="tw-weather-h">🌤️ 窗外的天气</div>' +
        '<div class="tw-tabs">' +
        WEATHER_LIST.map((w) =>
          '<button class="tw-tab' + (myWeather === w.key ? ' on' : '') + '" type="button" data-weather="' +
          esc(w.key) + '">' + esc(w.ico) + ' ' + esc(w.name) + '</button>').join('') +
        '</div>' +
        '<div class="tw-hint">挑一个，窗外立刻变。你自己看到的和别人来串门看到的都是这个 —— 屋子是你的，天气也归你。</div>' +
        '</div>'
          : '') +
        '<div class="tw-note">' +
        (mine
          ? '家具<b>按住就能拖</b>，想摆哪儿拖到哪儿；轻点一下是收起来。<br />' +
            '家具只能放在<b>下半部分</b>（墙压暗的那块），墙上的钟和画除外。'
          : hasHouse
            ? '这是人家的屋子，只能看，动不了人家的东西。'
            : '他还没来小镇盖房子。等他盖好了，你再来串门。') +
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
      startWeather()
      if (mine) bindTray()

      const cv = $('twRoom')
      if (cv && mine) {
        /* 指针 -> 格子。画布有一条 1px 边框，而 getBoundingClientRect() 的宽度
           是含边框的，不减掉的话点哪儿都偏一点，格子越小越明显。 */
        const cellAt = (ev) => {
          const r = cv.getBoundingClientRect()
          if (r.width <= 0) return null
          const bx = cv.clientLeft || 0
          const by = cv.clientTop || 0
          const iw = cv.clientWidth || r.width
          const ih = cv.clientHeight || r.height
          return {
            x: Math.floor(((ev.clientX - r.left - bx) / iw) * ROOM),
            y: Math.floor(((ev.clientY - r.top - by) / ih) * ROOM),
          }
        }
        /** 这个格子上是哪件家具（从后往前找，压在上面的先命中） */
        const hitAt = (x, y) => {
          for (let i = house.items.length - 1; i >= 0; i--) {
            const it = house.items[i]
            const f = findItem(it.id)
            if (!f || !f.art) continue
            const sz = artSize(f.art)
            if (x >= it.x && x < it.x + sz.w && y >= it.y && y < it.y + sz.h) return i
          }
          return -1
        }

        /* ---- 拖动：按住屋里的家具直接拖到别处。
           以前只能「收起来再重新放」，想挪一格都得重来一遍，
           家具一多根本摆不整齐。 ---- */
        cv.addEventListener('pointerdown', (ev) => {
          if (picked) return // 手上有东西时，按下就是「放下」，交给 click
          const p = cellAt(ev)
          if (!p) return
          const i = hitAt(p.x, p.y)
          if (i < 0) return
          const it = house.items[i]
          dragOn = { i, dx: p.x - it.x, dy: p.y - it.y, ox: it.x, oy: it.y, moved: false }
          try {
            cv.setPointerCapture(ev.pointerId)
          } catch (e) {}
        })

        cv.addEventListener('pointermove', (ev) => {
          if (!dragOn) return
          const p = cellAt(ev)
          if (!p) return
          const it = house.items[dragOn.i]
          if (!it) return
          const nx = p.x - dragOn.dx
          const ny = p.y - dragOn.dy
          if (nx === it.x && ny === it.y) return
          if (!dragOn.moved) {
            dragOn.moved = true
            cv.classList.add('dragging')
            if (window.sfx) window.sfx('tick')
          }
          it.x = nx
          it.y = ny
          /* 跟其它家具比，左边或上边齐了就给一条提示线。
             阈值取 0——像素画里差一格就是没对齐，不该有容差。 */
          let gv = null
          let gh = null
          for (let k = 0; k < (house.items || []).length; k++) {
            if (k === dragOn.i) continue
            const o = house.items[k]
            if (o.x === it.x) gv = it.x
            if (o.y === it.y) gh = it.y
          }
          dragOn.guides = gv != null || gh != null ? { v: gv, h: gh } : null
          drawRoom()
        })

        const endDrag = (cancel) => {
          if (!dragOn) return
          const d = dragOn
          dragOn = null
          cv.classList.remove('dragging')
          // guides 跟着 dragOn 一起没了，重画一次把线擦掉
          drawRoom()
          const it = house.items[d.i]
          if (!it) {
            drawRoom()
            return
          }
          if (cancel) {
            it.x = d.ox
            it.y = d.oy
            drawRoom()
            return
          }
          if (!d.moved) {
            // 按下去没动 = 轻点 → 收起来（保持原来的手感）
            house.items.splice(d.i, 1)
            dirty = true
            if (window.sfx) window.sfx('undo')
            msg('')
            renderHome()
            return
          }
          // 真的拖了：看看落点能不能放
          const why = placeWhy(it, d.i)
          if (why !== true) {
            it.x = d.ox
            it.y = d.oy
            msg(why, true)
            if (window.sfx) window.sfx('close')
            drawRoom()
            return
          }
          dirty = true
          if (window.sfx) window.sfx('pop')
          msg('挪好了，记得点「保存布置」')
          renderHome()
        }
        cv.addEventListener('pointerup', () => endDrag(false))
        cv.addEventListener('pointercancel', () => endDrag(true))

        /* ---- 点击：手上拿着东西时，点房间就是放下 ---- */
        cv.addEventListener('click', (ev) => {
          if (!picked) return
          const p = cellAt(ev)
          if (!p) return
          const { x, y } = p
          if (x < 0 || y < 0 || x >= ROOM || y >= ROOM) return
          const f = findItem(picked)
          if (!f || !f.art) return
          const why = placeWhy({ id: picked, x, y }, -1)
          if (why !== true) {
            msg(why, true)
            return
          }
          house.items.push({ id: picked, x, y })
          dirty = true
          msg('')
          if (window.sfx) window.sfx('pop')
          renderHome()
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

      /* 天气按钮：renderHome 每次重画都是新节点，直接绑就行。
         注意别挂到 document 上 —— app.js 的 withAutoCleanup 只接管
         window.addEventListener，挂 document 的话每进一次小镇就漏一个。 */
      $('twBody').querySelectorAll('[data-weather]').forEach((el) => {
        el.addEventListener('click', () => setWeather(el.getAttribute('data-weather')))
      })

      const up = $('twUp')
      if (up) up.addEventListener('click', upgrade)

      const shot = $('twShot')
      if (shot) shot.addEventListener('click', exportImage)

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
      if (!(await lwConfirm('送 ' + giftCost + ' 个光尘给 ' + who + '？送出就从你账上扣掉了。'))) return
      const d = await post({ action: 'like', to: wantUid })
      if (!d || !d.ok) {
        msg((d && d.error) || '送不出去', true)
        return
      }
      liked = true
      if (d.book && window.dust && window.dust.take) window.dust.take(d.book)
      if (window.sfx) window.sfx('coin')
      /* 送出后从「送光尘」按钮上飘一个 -N，给一个明确的「扣掉了」的反馈。
         光尘账本那个数字本身也会跳一下（在 dust 组件里）。 */
      if (window.LWDialog && window.LWDialog.floatText) {
        const btn = document.querySelector('[data-gifthome]') || document.querySelector('.tw-gift')
        window.LWDialog.floatText(btn || document.body, '-' + giftCost + ' ✨', { color: '#c0392b' })
      }
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
      if (!(await lwConfirm('删掉这条留言？'))) return
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
        floorY = d.floor || Math.max(4, Math.round(ROOM / 2))
        PAL = d.pal || {}
        const c = d.catalog || {}
        cat = {
          furniture: buildCatalog(c.furniture || [], c.themes || []),
          surfaces: c.surfaces || [],
          cats: c.cats || {},
          sizes: c.sizes || [],
          weathers: c.weathers || [],
        }
        if (isHome) {
          house = d.house || { wall: '', floor: '', items: [], owned: [] }
          // 屋主挑的天气；空串 = 跟随现实
          myWeather = house.weather || ''
          WEATHER_LIST = isHome ? (cat.weathers || []) : WEATHER_LIST
          mine = !!d.mine
          hasHouse = d.hasHouse !== false
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
