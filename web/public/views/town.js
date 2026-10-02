// 像素小镇 · 地图与个人小屋
//
//   /town                小镇地图：一排排小屋，点谁进谁家
//   /town/home           回自己家（顺便在地图上登记一间屋）
//   /town/home?uid=xxx   去别人家串门（只能看，不能动人家东西）
//
// 地图不逐间读屋子：服务端把「门面」信息（最贵的那件家具、件数）
// 存在索引里，打开地图只读一个键。所以人多也不会变慢。
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
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--border-strong);
        /* 草地：两种绿交替的斜纹，再叠一层横向的「小路」 */
        background-color: #8fc46b;
        background-image:
          repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 8px, transparent 8px 16px),
          repeating-linear-gradient(0deg, rgba(0,0,0,.05) 0 8px, transparent 8px 16px);
        padding: 10px;
      }
      .tw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .tw-plot {
        border: 0; background: transparent; padding: 6px 2px 4px;
        display: flex; flex-direction: column; align-items: center;
        cursor: pointer; font-family: inherit; border-radius: 12px;
      }
      .tw-plot:active { background: rgba(255,255,255,.18); }
      .tw-plot canvas { display: block; width: 56px; height: 48px; image-rendering: pixelated; }
      .tw-plot-name {
        margin-top: 3px; max-width: 100%;
        font-size: 11px; font-weight: 700; color: #23401a;
        text-shadow: 0 1px 0 rgba(255,255,255,.5);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .tw-plot-top { font-size: 10px; color: #3c5c2c; }
      .tw-empty {
        font-size: 13px; line-height: 1.9; color: #2f4a22; text-align: center;
        padding: 26px 14px; font-weight: 600;
      }

      /* ---------- 小屋 ---------- */
      .tw-room {
        display: block; width: 100%; max-width: 340px;
        margin: 0 auto; image-rendering: pixelated;
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

      /* ---------- 布置：家具托盘 ---------- */
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
      .tw-item span { font-size: 10px; color: var(--text-muted); margin-top: 4px; }
      .tw-item.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, var(--surface)); }
      .tw-item[disabled] { opacity: .45; cursor: default; }
      .tw-item-price { font-size: 10px; font-weight: 800; color: #b8860b; }
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
    // 是不是在看自己家：不带 uid 就是自己
    let mine = !wantUid

    let ROOM = 16
    let PAL = {}
    let catalog = []
    let house = { items: [], owned: [] }
    let woodName = ''
    // 布置模式：选中的家具 id（'' 表示没选，此时点房间是「拿起/放下」）
    let picked = ''
    let dirty = false

    function msg(text, bad) {
      const el = $('twMsg')
      if (!el) return
      el.textContent = text || ''
      el.hidden = !text
      el.style.color = bad ? '#c0392b' : ''
    }

    /* ---------- 画像素画 ---------- */
    /* 把字符画按调色板画进 ctx 的 (ox,oy)，每格 1 个逻辑像素 */
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
    const artSize = (art) => ({ w: art[0].length, h: art.length })

    /* 小房子外观：屋顶颜色按 uid 定，门和窗固定。
       尺寸 14×12，画布就是 14×12，靠 CSS 放大（pixelated，不会糊）。 */
    const ROOFS = [
      [198, 74, 74],
      [122, 168, 214],
      [226, 138, 74],
      [186, 124, 196],
      [86, 160, 74],
    ]
    function drawHouse(cv, uid, hasStuff) {
      const W = 14
      const H = 12
      cv.width = W
      cv.height = H
      const c = cv.getContext('2d')
      let h = 2166136261
      const s = String(uid || '')
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 16777619) >>> 0
      }
      const roof = ROOFS[h % ROOFS.length]
      const wall = [246, 238, 224]
      const door = [124, 82, 48]
      const win = [122, 168, 214]
      c.fillStyle = 'rgb(' + roof[0] + ',' + roof[1] + ',' + roof[2] + ')'
      c.fillRect(1, 1, 12, 5) // 屋顶
      c.fillStyle = 'rgb(' + wall[0] + ',' + wall[1] + ',' + wall[2] + ')'
      c.fillRect(2, 6, 10, 5) // 墙
      c.fillStyle = 'rgb(' + door[0] + ',' + door[1] + ',' + door[2] + ')'
      c.fillRect(6, 8, 2, 3) // 门
      c.fillStyle = 'rgb(' + win[0] + ',' + win[1] + ',' + win[2] + ')'
      c.fillRect(3, 7, 2, 2) // 左窗
      c.fillRect(9, 7, 2, 2) // 右窗
      if (hasStuff) {
        // 屋里有东西：烟囱冒一缕烟
        c.fillStyle = 'rgba(255,255,255,.75)'
        c.fillRect(11, 0, 2, 2)
      }
    }

    /* 房间：上半墙、下半地板，再把家具按坐标画上去 */
    function drawRoom() {
      const cv = $('twRoom')
      if (!cv) return
      cv.width = ROOM
      cv.height = ROOM
      const c = cv.getContext('2d')
      const FLOOR = 5 // 第 5 行往下是地板
      for (let y = 0; y < ROOM; y++) {
        for (let x = 0; x < ROOM; x++) {
          if (y < FLOOR) {
            // 墙：砖缝
            const brick = (x % 4 === 0 || y % 2 === 0) ? [222, 208, 190] : [232, 220, 204]
            c.fillStyle = 'rgb(' + brick[0] + ',' + brick[1] + ',' + brick[2] + ')'
          } else {
            // 地板：木纹
            const wood = (x + y) % 2 ? [206, 176, 136] : [198, 168, 128]
            c.fillStyle = 'rgb(' + wood[0] + ',' + wood[1] + ',' + wood[2] + ')'
          }
          c.fillRect(x, y, 1, 1)
        }
      }
      // 家具
      for (const it of house.items || []) {
        const f = catalog.find((x) => x.id === it.id)
        if (!f) continue
        drawArt(c, f.art, PAL, it.x, it.y)
      }
      // 布置模式：网格线，方便对齐
      if (picked !== null && cv.classList.contains('editing')) {
        c.fillStyle = 'rgba(0,0,0,.12)'
        for (let i = 0; i <= ROOM; i++) {
          c.fillRect(i, 0, 0.06, ROOM)
          c.fillRect(0, i, ROOM, 0.06)
        }
      }
    }

    /* ---------- 地图 ---------- */
    function drawMap(data) {
      const list = data.list || []
      const grid = list
        .map((h, i) => {
          const top = catalog.find((f) => f.id === h.top)
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
        (list.length
          ? '<div class="tw-grid">' + grid + '</div>'
          : '<div class="tw-empty">镇上还空着。<br />回自己的小屋摆几件家具，<br />你就会是这里的第一户人家。</div>') +
        '</div>' +
        '<div class="tw-acts">' +
        '<button class="tw-btn" type="button" id="twGoHome">🏠 回我的小屋</button>' +
        '</div>' +
        '<div class="tw-note">每间屋子里都住着一位镇民。点房子可以去串门，只能看，不能动人家的东西。</div>'

      // 房子外观：canvas 尺寸小，靠 CSS 放大
      $('twBody').querySelectorAll('canvas[data-house]').forEach((cv) => {
        drawHouse(cv, cv.getAttribute('data-house'), cv.getAttribute('data-stuff') === '1')
      })
      $('twBody').querySelectorAll('.tw-plot').forEach((b) => {
        b.addEventListener('click', () => {
          if (window.sfx) window.sfx('open')
          const uid = b.getAttribute('data-uid')
          if (window.__lwRouter) window.__lwRouter.push('/town/home?uid=' + encodeURIComponent(uid))
          else location.href = '/town/home?uid=' + encodeURIComponent(uid)
        })
      })
      const gh = $('twGoHome')
      if (gh) {
        gh.addEventListener('click', () => {
          if (window.sfx) window.sfx('tick')
          if (window.__lwRouter) window.__lwRouter.push('/town/home')
          else location.href = '/town/home'
        })
      }
    }

    /* ---------- 家具托盘 ---------- */
    function trayHtml() {
      // 布置模式：先给「已买下的」，再给「能买的」
      const owned = house.owned || []
      const ownedHtml = owned.length
        ? owned
            .map((id) => {
              const f = catalog.find((x) => x.id === id)
              if (!f) return ''
              return (
                '<button class="tw-item' + (picked === id ? ' on' : '') + '" type="button" data-pick="' + esc(id) + '">' +
                '<canvas data-art="' + esc(id) + '"></canvas><span>' + esc(f.name) + '</span></button>'
              )
            })
            .join('')
        : '<div class="tw-note" style="grid-column:1/-1;margin:0">还一件家具都没有，先在下面买一件吧。</div>'

      const shop = catalog
        .filter((f) => owned.indexOf(f.id) < 0)
        .map(
          (f) =>
            '<button class="tw-item" type="button" data-buy="' + esc(f.id) + '">' +
            '<canvas data-art="' + esc(f.id) + '"></canvas>' +
            '<span>' + esc(f.name) + '</span>' +
            '<span class="tw-item-price">' + f.price + ' ✨</span></button>'
        )
        .join('')

      return (
        '<div class="tw-tray">' +
        '<div class="tw-tray-h">我的家具 <span>点一件拿在手上，再点房间放下</span></div>' +
        '<div class="tw-items">' + ownedHtml + '</div>' +
        '<div class="tw-tray-h" style="margin-top:14px">家具铺 <span>买下就永久归你，想摆几件摆几件</span></div>' +
        '<div class="tw-items">' + shop + '</div>' +
        '</div>'
      )
    }

    function bindTray() {
      const body = $('twBody')
      body.querySelectorAll('canvas[data-art]').forEach((cv) => {
        const f = catalog.find((x) => x.id === cv.getAttribute('data-art'))
        if (!f) return
        const s = artSize(f.art)
        cv.width = s.w
        cv.height = s.h
        drawArt(cv.getContext('2d'), f.art, PAL, 0, 0)
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
    }

    /* ---------- 小屋 ---------- */
    function renderHome() {
      $('twTitle').textContent = mine ? '🏠 我的小屋' : '🏠 ' + (woodName || '镇民') + '的家'
      $('twSub').textContent = mine ? '点家具拿在手上，再点房间放下' : '来串门看看'
      $('twBody').innerHTML =
        '<canvas class="tw-room' + (mine && picked !== '' ? ' editing' : '') + '" id="twRoom" width="' + ROOM + '" height="' + ROOM + '"></canvas>' +
        (mine
          ? '<div class="tw-acts">' +
            '<button class="tw-btn" type="button" id="twSave"' + (dirty ? '' : ' disabled') + '>' +
            (dirty ? '保存布置' : '已保存') +
            '</button>' +
            '<button class="tw-btn ghost" type="button" id="twClear">全部收起来</button>' +
            '</div>'
          : '') +
        '<div class="tw-note">' +
        (mine
          ? '拿在手上的家具，点房间就能放下；再点同一件家具可以取消。<br />摆好记得点「保存布置」。'
          : '这是人家的屋子，只能看看。回自己的小屋去布置吧。') +
        '</div>' +
        (mine ? trayHtml() : '')
      drawRoom()
      if (mine) bindTray()

      const cv = $('twRoom')
      if (cv && mine) {
        cv.addEventListener('click', (ev) => {
          const r = cv.getBoundingClientRect()
          if (r.width <= 0) return
          const x = Math.floor(((ev.clientX - r.left) / r.width) * ROOM)
          const y = Math.floor(((ev.clientY - r.top) / r.height) * ROOM)
          if (x < 0 || y < 0 || x >= ROOM || y >= ROOM) return

          if (picked) {
            // 放下手上这件
            const f = catalog.find((o) => o.id === picked)
            if (!f) return
            const s = artSize(f.art)
            if (x + s.w > ROOM || y + s.h > ROOM) {
              msg('这里放不下，往左边或上边挪一挪', true)
              return
            }
            // 和已有家具重叠就不给放（服务端也会拦，这里先拦一次少一次往返）
            for (const it of house.items) {
              const g = catalog.find((o) => o.id === it.id)
              if (!g) continue
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
          // 没拿东西：点房间里的家具 = 收起来
          for (let i = house.items.length - 1; i >= 0; i--) {
            const it = house.items[i]
            const f = catalog.find((o) => o.id === it.id)
            if (!f) continue
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
      const cl = $('twClear')
      if (cl) {
        cl.addEventListener('click', async () => {
          if (!house.items.length) return
          if (!window.confirm('把屋里的东西全收起来？家具还是你的，随时能再摆。')) return
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
      const f = catalog.find((x) => x.id === id)
      if (!f || btn.disabled) return
      if (!window.confirm('花 ' + f.price + ' 个光尘买下「' + f.name + '」？买过就永久归你。')) return
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
      msg('「' + f.name + '」买好了，点它拿在手上吧')
      picked = id
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
        PAL = d.pal || {}
        catalog = d.catalog || []
        if (isHome) {
          house = d.house || { items: [], owned: [] }
          mine = !!d.mine
          woodName = d.name || ''
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
