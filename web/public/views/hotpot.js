// 像素小镇 · 大锅饭 —— 备料 + 火候 + 装盘，招待 5 位食客
export default {
  name: 'town-hotpot',
  title: '大锅饭',
  css: `
    .hp-page { max-width: 560px; margin: 0 auto; padding: 0 14px calc(96px + env(safe-area-inset-bottom, 0px)); }
    /* 顶部做成木质招牌，和小镇地图一套视觉 */
      .hp-head {
        display: flex; align-items: center; gap: 10px;
        margin: 0 -14px 12px;
        padding: 14px 16px;
        background: linear-gradient(180deg, #b5763f, #96602f);
        border-bottom: 3px solid #6d451f;
        box-shadow: 0 4px 14px rgba(80,50,20,.28), inset 0 1px 0 rgba(255,255,255,.22);
      }
    .hp-back {
        font-size: 13px; font-weight: 700; text-decoration: none;
        color: #ffe9cf; background: rgba(0,0,0,.18);
        border-radius: 999px; padding: 5px 11px;
      }
      .hp-back:active { transform: scale(.95) }
    .hp-title {
        font-size: 18px; font-weight: 800; color: #fff6e8; flex: 1;
        text-shadow: 0 2px 0 rgba(90,55,25,.55);
      }
    /* 战绩条：一块小木牌 */
      .hp-sum {
        background: linear-gradient(180deg, #fff8ec, #f6ecdb);
        border: 1px solid #e0c9a6; border-radius: 14px;
        padding: 12px 14px; margin-bottom: 12px;
        color: #4a3a24; font-size: 12.5px; line-height: 1.85;
        box-shadow: 0 2px 0 #e8d7bd, 0 4px 12px rgba(120,90,50,.10);
      }
      html[data-mood='dark'] .hp-sum {
        background: linear-gradient(180deg, #3a332a, #322c24);
        border-color: #4d453a; color: #efe3cf; box-shadow: none;
      }
    /* ---------- 舞台：灶台 ----------
         分层背景做出「瓷砖台面 + 从下往上的灶火光」，
         再配四角铆钉和内阴影，看起来像一口锅架在台面上。
         和小镇地图用的是同一套做法（多层渐变 + inset 阴影）。 */
      .hp-arena {
        position: relative;
        background:
          radial-gradient(120% 60% at 50% 118%, rgba(255,168,60,.34), transparent 68%),
          repeating-linear-gradient(90deg, rgba(0,0,0,.045) 0 1px, transparent 1px 26px),
          repeating-linear-gradient(0deg, rgba(0,0,0,.045) 0 1px, transparent 1px 26px),
          linear-gradient(180deg, #fdf6ea, #f2e5d1);
        border: 3px solid #c79a63;
        border-radius: 18px;
        padding: 18px 14px 16px;
        margin-bottom: 12px;
        text-align: center;
        box-shadow:
          inset 0 2px 0 rgba(255,255,255,.7),
          inset 0 0 34px rgba(150,100,50,.14),
          0 4px 0 #b9884f,
          0 8px 20px rgba(120,80,40,.16);
      }
      .hp-arena::before, .hp-arena::after {
        content: ''; position: absolute; width: 7px; height: 7px; border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #e8cba4, #a97b46);
        box-shadow: 0 1px 2px rgba(90,60,25,.4);
      }
      .hp-arena::before { left: 9px; top: 9px }
      .hp-arena::after { right: 9px; top: 9px }
      .hp-arena b { color: #4a3a24; font-size: 15px }
      html[data-mood='dark'] .hp-arena {
        border-color: #5a4a37;
        background:
          radial-gradient(120% 60% at 50% 118%, rgba(255,150,50,.22), transparent 68%),
          repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, transparent 1px 26px),
          repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 26px),
          linear-gradient(180deg, #332c24, #2b251e);
        box-shadow: inset 0 0 34px rgba(0,0,0,.35), 0 4px 0 #241f19;
      }
      html[data-mood='dark'] .hp-arena b { color: #f3e7d3 }
    /* 选料区。112 样食材平铺会有三十多行，所以做成
       「分类标签 + 限高的可滚动格子」。 */
    .hp-cats { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 10px 0 8px; }
    .hp-cats button {
      padding: 5px 12px; border: 1px solid #d9c0a0; border-radius: 999px;
      background: #fffaf1; color: #6a563c;
      font-family: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer;
    }
    .hp-cats button.on {
      background: linear-gradient(180deg, #c98a4f, #a96f38);
      border-color: #8f5c2c; color: #fff; box-shadow: 0 2px 0 #8f5c2c;
    }
    html[data-mood='dark'] .hp-cats button { background: #3a332a; border-color: #4d453a; color: #e6d8c2; }
    html[data-mood='dark'] .hp-cats button.on {
      background: linear-gradient(180deg, #8a6236, #6f4d2a); border-color: #5a3f22; color: #fff;
    }
    .hp-ing {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
      margin: 0 0 10px;
      max-height: 246px; overflow-y: auto; padding: 2px;
      -webkit-overflow-scrolling: touch;
    }
    .hp-ing button { border: 1px solid var(--border); border-radius: 12px; padding: 10px 4px; background: var(--surface-2); cursor: pointer; font-family: inherit; font-size: 12px; color: var(--text); }
    .hp-ing button.picked { outline: 3px solid var(--accent); }
    .hp-dot { width: 18px; height: 18px; border-radius: 6px; margin: 0 auto 4px; }
    .hp-fire { height: 22px; border-radius: 999px; background: linear-gradient(90deg,#2f5fb8,#f2d04b 45%,#e5574b 80%,#7a1f1a); position: relative; margin: 14px 0; }
    .hp-zone { position: absolute; top: 0; bottom: 0; width: 22%; left: 55%; background: rgba(255,255,255,.55); border-radius: 999px; }
    .hp-marker { position: absolute; top: -4px; bottom: -4px; width: 6px; background: #fff; border: 2px solid #3b342c; border-radius: 4px; }
    /* 四色拼盘：目标盘和当前盘必须一模一样大，否则看起来是错位的。
       ★ button 默认是 content-box：写了 width:52px 再加 2px 边框，
       实际占 56px，撑出 52px 的网格列，两个盘子就对不齐了。
       加 box-sizing 让边框算进 52px 里。
       目标盘那边是 div，没有边框，所以两边都是 52×52。 */
    .hp-plate {
      display: grid;
      grid-template-columns: repeat(2, 52px);
      grid-auto-rows: 52px;
      gap: 8px;
      justify-content: center;
      margin: 10px 0;
    }
    /* 目标盘和当前盘用同一套格子尺寸。
       box-sizing 是必须的：button 在 Chrome 里默认是 border-box，
       但显式写一遍更保险，换个浏览器也不会因为 2px 边框把格子撑成 56px
       而和目标盘错开。 */
    .hp-plate > * {
      box-sizing: border-box;
      width: 52px;
      height: 52px;
      padding: 0;
      border-radius: 12px;
      border: 2px solid transparent;
    }
    /* ★ 目标盘只是给人看的，绝不能吃点击。
       它和可点的当前盘上下紧挨着 —— 只要有任何一条全局样式让它多占一点
       高度、或者盖住下面的按钮，上面那两格就点不动了（用户反馈的
       「只能拼下面两个」就是这个现象）。这里直接把它的指针事件关掉，
       不管布局怎么变都抢不走点击。 */
    .hp-plate.target {
      pointer-events: none;
      user-select: none;
      opacity: .96;
    }
    .hp-plate.target > * { border-color: var(--border); }
    /* 当前盘：明确可点 */
    .hp-plate.cur > * {
      border-color: var(--border-strong);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .hp-plate.cur > *:active { transform: scale(.95); }
    .hp-plate.cur > .sel {
      outline: 3px solid var(--accent);
      outline-offset: 1px;
      border-color: var(--accent);
    }
    .hp-btn { border: 1px solid var(--border-strong); background: var(--surface-2); color: var(--text); border-radius: 999px; padding: 9px 20px; font-size: 13px; font-weight: 800; cursor: pointer; font-family: inherit; margin: 4px; }
    .hp-btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    .hp-log { font-size: 12px; color: var(--text-muted); margin-top: 8px; min-height: 18px; }
  `,
  template: `
    <div class="hp-page">
      <div class="hp-head"><a class="hp-back" href="/town">← 小镇</a><div class="hp-title">🍲 大锅饭</div></div>
      <div class="hp-sum" id="hpSum"></div>
      <div class="hp-arena" id="hpArena"></div>
      <div class="hp-log" id="hpLog"></div>
    </div>
  `,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const log = (m) => { $('hpLog').textContent = m }
    const token = () => { try { return localStorage.getItem('lw-token') || '' } catch (e) { return '' } }
    /* 镇民的名字是用户自己填的，直接拼进 innerHTML 会有注入风险 */
    const esc = (x) =>
      String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

    /* ================= 食材库 =================
       原来只有 6 样，两把就全见过了。
       现在按**六类**列，每类十几样，一共 100+ 样。
       分类不只是为了好看 —— 100 多样平铺成三列网格会有三十多行，
       翻都翻不完，所以选料区做成「分类标签 + 限高的可滚动格子」。
       颜色是按每样东西真实的颜色给的，不是随机分的。 */
    const ING_CATS = [
      ['蔬菜', [
        ['番茄', '#e5574b'], ['青菜', '#45b581'], ['菠菜', '#3f9e63'], ['生菜', '#7ec86a'],
        ['白菜', '#eaf3d6'], ['芹菜', '#8fc46b'], ['韭菜', '#3d8f4e'], ['黄瓜', '#5fbf6a'],
        ['冬瓜', '#d9e8cf'], ['南瓜', '#e08a33'], ['茄子', '#9b6dd6'], ['青椒', '#4caf50'],
        ['红椒', '#e5533d'], ['洋葱', '#c9a0d8'], ['胡萝卜', '#e8842c'], ['白萝卜', '#f2f0e6'],
        ['土豆', '#e8c07a'], ['红薯', '#c96a3a'], ['山药', '#e6dcc6'], ['莲藕', '#f0e6d2'],
        ['竹笋', '#e3d9a8'], ['香菇', '#8a6a4a'], ['金针菇', '#f0e8d0'], ['木耳', '#4a3a34'],
        ['豆芽', '#f2f0d8'], ['豌豆', '#5cb85c'],
      ]],
      ['肉蛋', [
        ['鸡蛋', '#f2d04b'], ['鸭蛋', '#dfe6c8'], ['鹌鹑蛋', '#efe4c0'], ['皮蛋', '#4a4a3a'],
        ['猪肉', '#e8a0a8'], ['五花肉', '#e88f96'], ['排骨', '#d98a80'], ['牛肉', '#a8453a'],
        ['牛腩', '#96443c'], ['羊肉', '#d98f8f'], ['鸡肉', '#e8c9a0'], ['鸡翅', '#d9a86a'],
        ['鸭肉', '#c98f6a'], ['培根', '#c9605a'], ['香肠', '#b8423a'], ['火腿', '#d97070'],
        ['腊肉', '#9c5a3c'], ['午餐肉', '#e89a9a'],
      ]],
      ['海鲜', [
        ['虾', '#ef8f6a'], ['龙虾', '#d9553d'], ['螃蟹', '#e0703a'], ['鱿鱼', '#e8d0d0'],
        ['章鱼', '#c96a6a'], ['蛤蜊', '#d9c9a8'], ['扇贝', '#e8d8b8'], ['生蚝', '#b8a890'],
        ['三文鱼', '#ef8a5a'], ['金枪鱼', '#a84a5a'], ['带鱼', '#c8d4dc'], ['鲈鱼', '#b8c8d0'],
        ['紫菜', '#3a3a4a'], ['海带', '#4a6a4a'], ['鱼丸', '#f0e8e0'], ['虾滑', '#f2c9b0'],
      ]],
      ['主食', [
        ['米饭', '#f7f4ea'], ['面条', '#f0e2b8'], ['米粉', '#f2ecd8'], ['馒头', '#f5f0e0'],
        ['包子', '#f7f2e4'], ['饺子', '#f5eeda'], ['馄饨', '#f2ecd8'], ['年糕', '#f0e8d8'],
        ['粉丝', '#e8e0c8'], ['玉米', '#f2d04b'], ['面包', '#d9a86a'], ['吐司', '#e0b478'],
        ['豆腐', '#fbf7ef'], ['豆皮', '#f0d9a8'], ['腐竹', '#e8c98a'], ['魔芋', '#c8c0b0'],
      ]],
      ['调料', [
        ['盐', '#f2f2f2'], ['糖', '#f7f2e8'], ['酱油', '#5a3a22'], ['醋', '#8a6a32'],
        ['辣椒', '#d93a2a'], ['花椒', '#8a4a3a'], ['八角', '#6a4a2a'], ['桂皮', '#8a5a2a'],
        ['姜', '#e8d08a'], ['蒜', '#f0eadc'], ['葱', '#5cb85c'], ['香菜', '#3f9e63'],
        ['孜然', '#b89a5a'], ['胡椒', '#4a4038'], ['料酒', '#e8dcc0'], ['蚝油', '#4a3a2a'],
        ['芝麻', '#3a342c'], ['香油', '#d9a83a'],
      ]],
      ['水果', [
        ['苹果', '#e5574b'], ['香蕉', '#f2d04b'], ['橘子', '#f08a2a'], ['柠檬', '#f5e04a'],
        ['葡萄', '#8a5ab8'], ['草莓', '#e84a6a'], ['蓝莓', '#5a6ab8'], ['西瓜', '#e5535a'],
        ['哈密瓜', '#c8e08a'], ['菠萝', '#e8c04a'], ['芒果', '#f0b03a'], ['桃子', '#f0a08a'],
        ['梨', '#d8e8a8'], ['樱桃', '#c92a3a'], ['猕猴桃', '#8ab85a'], ['椰枣', '#8a5a3a'],
        ['红枣', '#9c3a32'], ['枸杞', '#d94a2a'],
      ]],
    ]
    const ING = ING_CATS.reduce((acc, [, list]) => acc.concat(list.map(([n, c]) => ({ n, c }))), [])
    const COLORS4 = ['#e5574b', '#f2d04b', '#45b581', '#5b8def']
    const state = { best: 0, stars: 0, cooks: 0 }
    try {
      const raw = JSON.parse(localStorage.getItem('lw-town-save') || '{}')
      if (raw.hotpot) { state.best = raw.hotpot.best || 0; state.stars = raw.hotpot.stars || 0; state.cooks = raw.hotpot.cooks || 0 }
    } catch (e) {}

    let customer = 0, satisfied = 0, order = null, timer = null

    /* ---------- 客人是**真实的小镇住户** ----------
       原来是 5 个随机 NPC，做完就完了，谁也不知道。
       现在从 /api/town 拿真实名单，做完**真的把菜端过去** ——
       对方信箱里会多一封带光尘的信。 */
    let residents = [] // [{uid,name}]
    let customers = [] // 这一轮要招待的 5 位真实镇民
    let myUid = ''
    let servedToday = {} // { uid: {name,dish} }
    let pickName = ''

    function apiHeaders() {
      const t = token()
      return t
        ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }
        : { 'Content-Type': 'application/json' }
    }

    async function loadResidents() {
      try {
        const r = await fetch('/api/town?list=1', { cache: 'no-store' })
        const d = await r.json()
        const list = (d && d.list) || []
        residents = list.filter((h) => h && h.uid).map((h) => ({ uid: h.uid, name: String(h.name || '镇民') }))
      } catch (e) {
        residents = []
      }
      // 今天已经端过谁，避免重复端（服务端也会拦，这里先挑掉，少一次往返）
      try {
        const r = await fetch('/api/feast', { headers: apiHeaders(), cache: 'no-store' })
        const d = await r.json()
        if (d && d.ok) servedToday = d.served || {}
      } catch (e) {}

      // 还没端过的优先，不够再补已经端过的（当天不能再端，界面上会说明）
      const fresh = residents.filter((x) => !servedToday[x.uid])
      const used = residents.filter((x) => servedToday[x.uid])
      customers = shuffle(fresh.slice()).concat(shuffle(used.slice())).slice(0, 5)
    }

    /** 把「端菜」这件事真的发出去 */
    async function serveTo(target, dish, perfect) {
      if (!target || !target.uid) return null
      try {
        const r = await fetch('/api/feast', {
          method: 'POST',
          headers: apiHeaders(),
          body: JSON.stringify({ action: 'serve', to: target.uid, dish: dish, perfect: perfect }),
        })
        return await r.json()
      } catch (e) {
        return { ok: false, error: '网络不太好' }
      }
    }

    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t } return a }
    function saveAll() {
      let combo = {}
      try { combo = JSON.parse(localStorage.getItem('lw-town-save') || '{}') } catch (e) {}
      combo.hotpot = { best: state.best, stars: state.stars, cooks: state.cooks }
      try { localStorage.setItem('lw-town-save', JSON.stringify(combo)) } catch (e) {}
      const t = token()
      if (t) fetch('/api/towngame', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ action: 'save', save: combo }) }).catch(() => {})
    }
    function sumHtml() {
      return (
        '累计 ' + state.cooks + ' 轮 · 最满意客人数 ' + state.best + '/5<br>' +
        '<span style="font-size:11px;color:var(--text-muted)">' +
        (residents.length
          ? '镇上 ' + residents.length + ' 户人家 · 今天已端 ' + Object.keys(servedToday).length + ' 份'
          : '正在看镇上都有谁…') +
        '</span>'
      )
    }

    function nextCustomer() {
      customer++
      if (customer > 5) return finish()
      order = shuffle(ING.slice()).slice(0, 3)
      stepPrepare()
    }
    /* 五道餐品，和妖怪一样改成站内自绘的像素图标 */
    const FOOD_PX = ['food_mushroom', 'food_cake', 'food_ice', 'food_bun', 'food_bento']
    function stepPrepare() {
      const need = order.map((o) => o.n)
      const picked = []
      const who = customers[customer - 1]
      pickName = who ? who.name : '路过的镇民'
      $('hpArena').innerHTML =
        '<b style="color:var(--text)">' + esc(who ? who.name : '路过的镇民') + ' 点餐：</b>' +
        (who && servedToday[who.uid] ? '<div class="hp-log">今天已经给这位端过了，这次就当练手</div>' : '') +
        '<div style="margin:6px 0;font-size:14px;color:var(--text)">想点「' + need.join('、') + '」各一份 ' +
          '<i data-px="' + FOOD_PX[(customer-1) % FOOD_PX.length] + '" data-px-size="36" data-px-on="hover" style="vertical-align:middle"></i></div>' +
        '<div class="hp-cats" id="hpCats"></div>' +
        '<div class="hp-ing" id="hpIng"></div>' +
        '<button class="hp-btn primary" id="hpOk">凑齐了</button>'
      const g = $('hpIng')
      const catsBox = $('hpCats')
      /* 选了哪类就在哪类里翻。要的三样如果分散在不同类，
         标签后面点一个小圆点提示「这类里有你要的」——
         不然用户得六类挨着翻一遍。 */
      let cat = 0
      for (let ci = 0; ci < ING_CATS.length; ci++) {
        if (ING_CATS[ci][1].some(([nm]) => need.indexOf(nm) >= 0)) { cat = ci; break }
      }
      function paintCats() {
        catsBox.innerHTML = ''
        ING_CATS.forEach(([name, list], ci) => {
          const has = list.some(([nm]) => need.indexOf(nm) >= 0)
          const b = document.createElement('button')
          b.type = 'button'
          b.textContent = name + (has ? ' •' : '')
          if (ci === cat) b.classList.add('on')
          b.onclick = () => { cat = ci; paintCats(); paintIng() }
          catsBox.appendChild(b)
        })
      }
      function paintIng() {
        g.innerHTML = ''
        ING_CATS[cat][1].forEach(([nm, col]) => {
          const b = document.createElement('button')
          b.innerHTML = '<div class="hp-dot" style="background:' + col + '"></div>' + nm
          if (picked.some((x) => x.n === nm)) b.classList.add('picked')
          b.onclick = () => {
            const i = picked.findIndex((x) => x.n === nm)
            if (i >= 0) picked.splice(i, 1)
            else if (picked.length < 3) picked.push({ n: nm, c: col })
            paintIng()
          }
          g.appendChild(b)
        })
      }
      paintCats()
      paintIng()
      // 餐品图是自绘的像素图标，innerHTML 写完再画
      if (window.LWIcon) { try { window.LWIcon.apply($('hpArena')) } catch (e) {} }
      $('hpOk').onclick = () => {
        /* ★ 必须**按名字**比，不能比对象身份。
           分类渲染之后 picked 里放的是新建的 {n,c}，
           而 order 里是 ING 里的另一批对象 ——
           includes() 比的是引用，永远 false，备料永远判不过。
           原来两者都直接引用 ING 里的同一批对象，所以碰巧能用。 */
        const ok = picked.length === 3 && order.every((o) => picked.some((x) => x.n === o.n))
        log(ok ? '备料齐了！' : '食材不对，食客摇头…')
        stepFire(ok)
      }
    }
    function stepFire(preOk) {
      let pos = 0, dir = 1
      const zoneL = 50 + Math.random() * 20, zoneR = zoneL + 22
      $('hpArena').innerHTML =
        '<b style="color:var(--text)">掌勺火候！把指针停在白光带里：</b>' +
        '<div class="hp-fire"><div class="hp-zone" style="left:' + zoneL + '%;width:' + (zoneR - zoneL) + '%"></div><div class="hp-marker" id="hpMark" style="left:0%"></div></div>' +
        '<button class="hp-btn primary" id="hpStop">收火</button>'
      try { window.sfx && window.sfx('fire') } catch (e) {}
      timer = setInterval(() => {
        pos += dir * 1.6
        if (pos >= 98) { pos = 98; dir = -1 }
        if (pos <= 0) { pos = 0; dir = 1 }
        const m = $('hpMark'); if (m) m.style.left = pos + '%'
      }, 30)
      $('hpStop').onclick = () => {
        clearInterval(timer); timer = null
        const ok = pos >= zoneL && pos <= zoneR
        log(ok ? '火候正好！' : '火候没到家…')
        try { window.sfx && window.sfx(ok ? 'ding' : 'fail') } catch (e) {}
        stepPlate(preOk && ok)
      }
    }
    function stepPlate(preFireOk) {
      const target = COLORS4.slice()
      let cur = shuffle(COLORS4.slice())
      /* ★ 打乱的结果有 1/24 的概率正好和目标一致 ——
         那样开局就是完成态，点一下「装盘完成」就赢了。
         重打几次，保证至少要动一下。 */
      for (let guard = 0; guard < 12 && cur.every((c, i) => c === target[i]); guard++) {
        cur = shuffle(COLORS4.slice())
      }
      let sel = null
      const draw = () => {
        $('hpArena').innerHTML =
          '<b style="color:var(--text)">最后：把四色摆成和目标一样的花格！<br>点两个格子交换位置</b>' +
          '<div style="margin:8px 0;font-size:12px;color:var(--text-muted)">目标</div>' +
          '<div class="hp-plate target">' + target.map((c) => '<div style="background:' + c + '"></div>').join('') + '</div>' +
          '<div class="hp-plate cur" id="hpPlate"></div>' +
          '<button class="hp-btn primary" id="hpDone">装盘完成</button>'
        const g = $('hpPlate')
        /* 万一 hpPlate 没拿到（比如 id 被别的元素占了），
           至少让日志里能看出来，而不是「点了没反应」查半天。 */
        if (!g) { log('拼盘没渲染出来，刷新一下'); return }
        cur.forEach((c, i) => {
          const b = document.createElement('button')
          b.style.background = c
          if (sel === i) b.classList.add('sel')
          b.onclick = () => {
            if (sel === null) { sel = i; draw(); return }
            const t = cur[sel]; cur[sel] = cur[i]; cur[i] = t
            sel = null; draw()
          }
          g.appendChild(b)
        })
        $('hpDone').onclick = () => {
          const ok = cur.every((c, i) => c === target[i])
          const full = preFireOk && ok
          const dish = order.map((o) => o.n).join('')
          log(ok ? '装盘好看到流泪！' : '摆歪了…')
          if (full) satisfied++
          try { window.sfx && window.sfx(full ? 'win' : 'fail') } catch (e) {}
          /* 就算摆歪了也端过去（对方少拿一个光尘）——
             「做得好才送得出去」会让失败的这一轮完全白做，太打击人。 */
          const target2 = customers[customer - 1]
          if (!target2) return customerInfo(full, null)
          $('hpDone').disabled = true
          $('hpDone').textContent = '端过去…'
          serveTo(target2, dish, full).then((res) => customerInfo(full, res))
        }
      }
      draw()
    }
    function customerInfo(ok, res) {
      const who = pickName
      let line = ''
      if (!res) {
        line = '<div class="hp-log">镇上好像还没有别人盖房子 —— 先去小镇看看，或者等邻居搬来</div>'
      } else if (res.ok) {
        line =
          '<div class="hp-log">🍲 端到「' + esc(res.name) + '」门口了<br>' +
          '他收到 <b>' + res.got.toThem + '</b> 个光尘，你也拿到 <b>' + res.got.toMe + '</b> 个</div>'
      } else {
        line = '<div class="hp-log">这道没能端出去：' + esc(res.error || '再试试') + '</div>'
      }
      $('hpArena').innerHTML =
        '<b style="color:var(--text)">' + (ok ? '😋 ' + esc(who) + ' 很满意！' : '😅 ' + esc(who) + ' 说还行') + '</b>' +
        line +
        '<br><button class="hp-btn primary" id="hpNext" style="margin-top:8px">下一位</button>'
      $('hpNext').onclick = () => nextCustomer()
    }
    function finish() {
      state.best = Math.max(state.best, satisfied)
      state.stars += satisfied
      state.cooks++
      saveAll()
      const t = token()
      if (t) fetch('/api/towngame', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ action: 'claim', kind: 'hotpot', score: satisfied }) })
        .then((r) => r.json()).then((d) => { if (d && d.book && window.dust) window.dust.take(d.book) }).catch(() => {})
      $('hpSum').innerHTML = sumHtml()
      try { window.sfx && window.sfx('levelup') } catch (e) {}
      $('hpArena').innerHTML = '<b style="color:var(--text)">今日出餐结束！满意 ' + satisfied + '/5 位食客</b><br><button class="hp-btn primary" id="hpAgain" style="margin-top:8px">再开一轮</button>'
      $('hpAgain').onclick = () => { customer = 0; satisfied = 0; nextCustomer() }
    }

    $('hpSum').innerHTML = sumHtml()
    $('hpArena').innerHTML =
      '<b style="color:var(--text)">给镇上的邻居做饭</b><br>' +
      '<span style="font-size:12px;color:var(--text-muted)">一轮五位客人，都是<b>真住在小镇的人</b>。<br>' +
      '做好了菜会真的端到他门口，他的信箱里会多一封带光尘的信。</span><br>' +
      '<span style="font-size:11px;color:var(--text-faint)">餐品是站内自绘的像素图</span><br>' +
      '<button class="hp-btn primary" id="hpStart" style="margin-top:8px" disabled>正在看镇上都有谁…</button>'
    $('hpStart').onclick = () => { customer = 0; satisfied = 0; nextCustomer() }

    /* ★ 先把镇民名单拉回来，再让「开火！」可点。
       拉到之前就开局的话，第一位客人会变成「路过的镇民」，看着像没生效；
       所以按钮初始是 disabled，这里拉完再打开。

       ★ 这段原来被我插错了地方 ——
       锚点 `$('hpSum').innerHTML = sumHtml()` 在这个文件里出现两次
       （一次在 finish() 里、一次在这里），replace(…, 1) 命中了第一次，
       于是 loadResidents() 被塞进了 finish()，挂载时根本不执行，
       按钮永远是禁用的 —— 现象就是「卡在开始按钮」。
       教训：锚点在文件里不唯一时，必须先确认它的上下文，别直接 replace。 */
    loadResidents().then(() => {
      $('hpSum').innerHTML = sumHtml()
      const b = $('hpStart')
      if (b) {
        b.disabled = false
        b.textContent = residents.length ? '开火！给镇上 ' + residents.length + ' 户人家做饭' : '开火！'
      }
      if (!residents.length) {
        const t = $('hpLog')
        if (t) t.textContent = '镇上还没有别人盖房子 —— 先去小镇安家，或者等邻居搬来。'
      }
    })
  },
}
