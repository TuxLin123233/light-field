// 冒险者工会
//
// 把「冒险世界里打了多少怪、收集了多少东西」变成能领的奖。
//
// 为什么判定放在服务端：进度来自冒险世界那份存档，
// 前端只是把它同步上去。领奖的时候服务端自己再算一遍，
// 免得有人改前端说「我打了 999 只」。见 functions/api/guild.js。

export default {
  name: 'town-guild',
  title: '冒险者工会',
  css: `
    .gd-page { max-width: 560px; margin: 0 auto; padding: 0 0 calc(88px + env(safe-area-inset-bottom, 0px)); }
    .gd-head {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px;
      background: linear-gradient(180deg, #7a2f2f, #5a1f1f);
      border-bottom: 3px solid #3d1414;
      box-shadow: 0 4px 14px rgba(60,15,15,.35), inset 0 1px 0 rgba(255,255,255,.12);
    }
    .gd-back {
      font-size: 13px; font-weight: 700; text-decoration: none;
      color: #ffe0d8; background: rgba(255,255,255,.14);
      border-radius: 999px; padding: 5px 11px;
    }
    .gd-back:active { transform: scale(.95) }
    .gd-title { font-size: 18px; font-weight: 800; color: #fff2ee; flex: 1; text-shadow: 0 2px 0 rgba(40,10,10,.6) }

    .gd-sum {
      margin: 12px 12px 0; padding: 12px 14px;
      background: linear-gradient(180deg, #fff8f2, #f6e8dd);
      border: 1px solid #e0c4b4; border-radius: 14px;
      color: #4a2f24; font-size: 12.5px; line-height: 1.9;
      box-shadow: 0 2px 0 #e2cebe;
    }
    html[data-mood='dark'] .gd-sum {
      background: linear-gradient(180deg, #33241f, #2b1f1a); border-color: #4a3730; color: #f0dfd4; box-shadow: none;
    }
    .gd-sum b { font-size: 15px }

    /* 进度条 */
    .gd-bar {
      height: 8px; border-radius: 999px; overflow: hidden;
      background: rgba(140,100,80,.2); margin-top: 5px;
    }
    .gd-bar i {
      display: block; height: 100%; border-radius: 999px;
      background: linear-gradient(90deg, #c97a4a, #e0a060);
      transition: width .3s;
    }
    .gd-bar.full i { background: linear-gradient(90deg, #4fa86a, #7fd08a) }

    /* 悬赏卡片 */
    .gd-list { margin: 10px 12px 0 }
    .gd-card {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 12px; margin-bottom: 8px;
      border-radius: 14px;
      background: linear-gradient(180deg, #fffaf3, #f7ecdf);
      border: 1px solid #e4cdb8;
      box-shadow: 0 2px 0 #e6d4c2;
    }
    html[data-mood='dark'] .gd-card {
      background: linear-gradient(180deg, #342a24, #2c231e); border-color: #4a3b31; box-shadow: none;
    }
    .gd-card.done { border-color: #6fbf85; box-shadow: 0 2px 0 #5aa872 }
    .gd-card.got { opacity: .55 }
    .gd-ico { flex: none; font-size: 24px; line-height: 1; width: 30px; text-align: center }
    .gd-body { flex: 1; min-width: 0 }
    .gd-name { font-size: 13.5px; font-weight: 800; color: #4a2f24 }
    html[data-mood='dark'] .gd-name { color: #f2e2d8 }
    .gd-desc { font-size: 11.5px; color: #8a6f5e; line-height: 1.7 }
    html[data-mood='dark'] .gd-desc { color: #bda898 }
    .gd-num { font-size: 11px; color: #8a6f5e; font-variant-numeric: tabular-nums; margin-top: 3px }
    html[data-mood='dark'] .gd-num { color: #bda898 }
    .gd-get {
      flex: none; padding: 8px 13px;
      border: 1px solid #c9a06a; border-radius: 10px;
      background: linear-gradient(180deg, #fff2dc, #f2dcb8);
      color: #5a3a1a; font-family: inherit; font-size: 12px; font-weight: 800;
      cursor: pointer; white-space: nowrap;
      box-shadow: 0 2px 0 #d0b280;
    }
    .gd-get:active { transform: translateY(1px); box-shadow: none }
    .gd-get:disabled { opacity: .45; cursor: default; box-shadow: none }
    html[data-mood='dark'] .gd-get { background: #3d3128; border-color: #55443a; color: #f0e2d2; box-shadow: 0 2px 0 #241c17 }

    /* 仓库 */
    .gd-vault {
      margin: 12px 12px 0; padding: 12px 14px;
      background: linear-gradient(180deg, #fffaf1, #f6ecdb);
      border: 1px solid #e0d0b4; border-radius: 14px;
      color: #4a3a24; font-size: 12.5px;
      box-shadow: 0 2px 0 #e6d8c0;
    }
    html[data-mood='dark'] .gd-vault {
      background: linear-gradient(180deg, #322c24, #2a251e); border-color: #463d31; color: #ecdfc8; box-shadow: none;
    }
    .gd-vgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(48px,1fr)); gap: 6px; margin-top: 8px }
    .gd-vcell {
      position: relative; aspect-ratio: 1;
      border: 1px solid #d8c4a2; border-radius: 9px;
      background: #fffdf8;
      display: flex; align-items: center; justify-content: center;
    }
    html[data-mood='dark'] .gd-vcell { background: #37312a; border-color: #4d4437 }
    .gd-vcell i { display: block; width: 68%; height: 68%; border-radius: 5px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.3) }
    .gd-vcell b { position: absolute; right: 3px; bottom: 1px; font-size: 10px; font-weight: 800 }

    .gd-tabs { display: flex; gap: 6px; margin: 12px 12px 0; flex-wrap: wrap }
    .gd-tabs button {
      padding: 6px 13px; border: 1px solid #d3bb93; border-radius: 999px;
      background: #fff6e4; color: #6a563c;
      font-family: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer;
    }
    .gd-tabs button.on { background: linear-gradient(180deg,#c98a4f,#a96f38); border-color:#8f5c2c; color:#fff }
    html[data-mood='dark'] .gd-tabs button { background:#3a332a; border-color:#4f4536; color:#e6d8c2 }
    html[data-mood='dark'] .gd-tabs button.on { background:linear-gradient(180deg,#8a6236,#6f4d2a); border-color:#5a3f22; color:#fff }

    .gd-toast {
      position: fixed; left: 50%; bottom: 110px; transform: translateX(-50%);
      padding: 9px 18px; border-radius: 999px;
      background: rgba(30,20,15,.9); color: #ffe8d8;
      font-size: 13px; font-weight: 800; white-space: nowrap;
      opacity: 0; pointer-events: none; z-index: 60;
    }
    .gd-toast.show { animation: gdToast 1.6s ease-out }
    @keyframes gdToast {
      0% { opacity: 0; transform: translate(-50%, 8px) }
      15%,70% { opacity: 1; transform: translate(-50%, 0) }
      100% { opacity: 0; transform: translate(-50%, -10px) }
    }
  `,
  template: `
    <div class="gd-page">
      <div class="gd-head">
        <a class="gd-back" href="/town">← 小镇</a>
        <div class="gd-title">⚔️ 冒险者工会</div>
      </div>
      <div class="gd-sum" id="gdSum">正在查你的冒险记录…</div>
      <div class="gd-tabs" id="gdTabs">
        <button data-g="mob" class="on" type="button">⚔️ 讨伐</button>
        <button data-g="dex" type="button">📖 图鉴</button>
        <button data-g="other" type="button">🧭 探索</button>
        <button data-g="all" type="button">全部</button>
      </div>
      <div class="gd-list" id="gdList"></div>
      <div class="gd-vault" id="gdVault"></div>
      <div class="gd-toast" id="gdToast"></div>
    </div>
  `,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const token = () => { try { return localStorage.getItem('lw-token') || '' } catch (e) { return '' } }
    const esc = (x) =>
      String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

    let data = null
    let group = 'mob'

    /* 讨伐类的 id 长得像 k_xxx，图鉴类是 d_mob_/d_block_，剩下是探索 */
    function groupOf(id) {
      if (id.charAt(0) === 'k') return 'mob'
      if (id.indexOf('d_mob') === 0 || id.indexOf('d_block') === 0) return 'dex'
      return 'other'
    }

    const ICON = {
      k_pig: '🐖', k_cow: '🐄', k_sheep: '🐑', k_chicken: '🐔', k_rabbit: '🐇', k_fox: '🦊',
      k_zombie: '🧟', k_skeleton: '💀', k_spider: '🕷️', k_slime: '🟢', k_creeper: '💥', k_bat: '🦇',
      d_mob: '🐾', d_block: '🧱', d_struct: '🗿', d_mine: '⛏️', d_deep: '🕳️',
    }
    function iconOf(id) {
      const key = id.replace(/_\d+$/, '').replace(/_[12]$/, '')
      return ICON[key] || ICON[id.replace(/_\d+$/, '')] || '📜'
    }

    function toast(t) {
      const el = $('gdToast')
      el.textContent = t
      el.classList.remove('show')
      void el.offsetWidth
      el.classList.add('show')
    }

    function render() {
      if (!data) return
      const list = data.list.filter((x) => group === 'all' || groupOf(x.id) === group)
      const done = data.list.filter((x) => x.done && !x.claimed).length
      $('gdSum').innerHTML =
        '<b>⚔️ 冒险者工会</b><br>' +
        (data.hasSave
          ? '已领 <b>' + data.claimedCount + '</b> / ' + data.total + ' 份悬赏' +
            (done ? ' · <span style="color:#4fa86a;font-weight:800">有 ' + done + ' 份可以领了</span>' : '')
          : '<span style="color:#c07a3a">还没进过冒险世界 —— 先去那儿挖点东西、打几只怪，<br>这里的悬赏才会有进度。</span>')

      if (!list.length) {
        $('gdList').innerHTML = '<div style="padding:14px;text-align:center;opacity:.7;font-size:12.5px">这一类暂时没有悬赏</div>'
        return
      }
      $('gdList').innerHTML = list.map((x) => {
        const pct = Math.round((x.have / x.need) * 100)
        return '<div class="gd-card' + (x.claimed ? ' got' : x.done ? ' done' : '') + '">' +
          '<div class="gd-ico">' + iconOf(x.id) + '</div>' +
          '<div class="gd-body">' +
            '<div class="gd-name">' + esc(x.name) + '</div>' +
            '<div class="gd-desc">' + esc(x.desc) + '</div>' +
            '<div class="gd-num">' + x.have + ' / ' + x.need + ' · 奖 ' + x.reward + ' 光尘</div>' +
            '<div class="gd-bar' + (x.done ? ' full' : '') + '"><i style="width:' + pct + '%"></i></div>' +
          '</div>' +
          '<button class="gd-get" data-claim="' + esc(x.id) + '"' + (x.done && !x.claimed ? '' : ' disabled') + '>' +
            (x.claimed ? '已领' : x.done ? '领取' : '未完成') +
          '</button>' +
        '</div>'
      }).join('')

      $('gdList').querySelectorAll('[data-claim]').forEach((b) => {
        b.onclick = () => claim(b.getAttribute('data-claim'))
      })
    }

    function renderVault() {
      const bag = (data && data.bag) || {}
      const keys = Object.keys(bag).filter((k) => bag[k] > 0)
      if (!keys.length) {
        $('gdVault').innerHTML =
          '<b>🎒 仓库</b><div style="opacity:.72;font-size:12px;margin-top:6px">' +
          '空着。冒险世界里挖到的东西会存到这里 —— 这里显示的是那份存档里的材料。' +
          '</div>'
        return
      }
      // 只有方块类的材料才画色块；工具之类用文字
      const sq = (k) => {
        const c = colorOf(k)
        return c ? '<i style="background:' + c + '"></i>' : '<i style="background:#8a8378"></i>'
      }
      $('gdVault').innerHTML =
        '<b>🎒 仓库（' + keys.length + ' 种）</b>' +
        '<div class="gd-vgrid">' + keys.slice(0, 60).map((k) =>
          '<div class="gd-vcell" title="' + esc(k) + '">' + sq(k) + '<b>' + bag[k] + '</b></div>'
        ).join('') + '</div>'
    }

    /* 材料色：从冒险世界那份方块表里取。取不到就给个中性色。 */
    const COLOR = {
      dirt: '#7a5c3e', grass: '#4f9455', stone: '#8a8f96', cobble: '#7b8087', sand: '#e0cf94',
      log_oak: '#8a6a42', planks: '#b08a58', stick: '#a8895c', coal: '#3a3a3a', iron_ingot: '#d8dce0',
      gold_ingot: '#f0c84a', copper_ingot: '#d08a52', diamond: '#6ff0e0', lapis: '#3f5fd0',
      redstone: '#e0403a', emerald: '#4fe08a', quartz: '#f4f0e6', salt: '#ffffff', sulfur: '#f0e050',
      apple: '#e5574b', berry: '#c8324a', bread: '#d8a860', meat_raw: '#e08a8a', meat_cooked: '#b06a3a',
      slimeball: '#6fd06f', snow: '#eef4fa', ice: '#a8d8f0', clay: '#a8a8b8', brick: '#b05a48',
      stone_brick: '#8f949b', glass: '#c8e8f4', torch_item: '#f0b04a', ladder_up_item: '#a8895c',
      craft_table: '#b08a58', chest: '#b08a4a', furnace: '#7a7a80', sandstone: '#d8c48a',
      terracotta: '#c08a62', mud: '#5f4a32', gravel: '#8a8478', basalt: '#4a4a52',
      deep_stone: '#4a4a56', cobble_stone: '#7b8087',
    }
    function colorOf(k) {
      if (COLOR[k]) return COLOR[k]
      // 矿石类给个偏色
      if (/_ore$/.test(k)) return '#9a8a76'
      if (/^log_/.test(k)) return '#7a5c3e'
      if (/^flower_/.test(k)) return '#e0553a'
      return null
    }

    async function load() {
      const t = token()
      if (!t) {
        $('gdSum').innerHTML = '<b>⚔️ 冒险者工会</b><br><span style="color:#c07a3a">要登录才能领悬赏。</span>'
        $('gdList').innerHTML = ''
        $('gdVault').innerHTML = ''
        return
      }
      try {
        const r = await fetch('/api/guild', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        const d = await r.json()
        if (!d || !d.ok) throw new Error((d && d.error) || '读取失败')
        data = d
        render()
        renderVault()
      } catch (e) {
        $('gdSum').innerHTML = '<b>⚔️ 冒险者工会</b><br>读取失败，刷新一下试试。'
      }
    }

    async function claim(id) {
      const t = token()
      if (!t) return toast('先登录')
      const item = data && data.list.find((x) => x.id === id)
      if (!item || !item.done || item.claimed) return
      try {
        const r = await fetch('/api/guild', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'claim', id: id }),
        })
        const d = await r.json()
        if (!d || !d.ok) return toast((d && d.error) || '领不了')
        item.claimed = true
        data.claimedCount++
        if (window.dust && window.dust.refresh) window.dust.refresh()
        try { window.sfx && window.sfx('achieve') } catch (e) {}
        toast('领到 ' + d.reward + ' 个光尘！')
        render()
      } catch (e) {
        toast('网络不太好')
      }
    }

    document.querySelectorAll('#gdTabs button').forEach((b) => {
      b.onclick = () => {
        group = b.getAttribute('data-g')
        document.querySelectorAll('#gdTabs button').forEach((x) => x.classList.toggle('on', x === b))
        render()
        try { window.sfx && window.sfx('tick') } catch (e) {}
      }
    })

    load()
  },
}
