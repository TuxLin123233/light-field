// 像素小镇 · 大锅饭 —— 备料 + 火候 + 装盘，招待 5 位食客
export default {
  name: 'town-hotpot',
  title: '大锅饭',
  css: `
    .hp-page { max-width: 560px; margin: 0 auto; padding: 14px 14px calc(96px + env(safe-area-inset-bottom, 0px)); }
    .hp-head { display: flex; align-items: center; margin-bottom: 10px; }
    .hp-back { font-size: 14px; color: var(--text-muted2); text-decoration: none; }
    .hp-title { font-size: 18px; font-weight: 800; color: var(--text); margin-left: 10px; flex: 1; }
    .hp-sum { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; margin-bottom: 12px; color: var(--text); }
    .hp-arena { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 14px; margin-bottom: 12px; text-align: center; }
    .hp-ing { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin: 10px 0; }
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

    const ING = [
      { n: '番茄', c: '#e5574b' }, { n: '鸡蛋', c: '#f2d04b' }, { n: '豆腐', c: '#fbf7ef' },
      { n: '青菜', c: '#45b581' }, { n: '茄子', c: '#9b6dd6' }, { n: '土豆', c: '#e8c07a' },
    ]
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
    const FOOD_IMG=['/images/dotown/food_mushroom_05.png','/images/dotown/food_weddingcake_01.png','/images/dotown/food_shaved_ice_02.png','/images/dotown/food_butaman_01.png','/images/dotown/food_hinomarubento_01.png']
    function stepPrepare() {
      const need = order.map((o) => o.n)
      const picked = []
      const who = customers[customer - 1]
      pickName = who ? who.name : '路过的镇民'
      $('hpArena').innerHTML =
        '<b style="color:var(--text)">' + esc(who ? who.name : '路过的镇民') + ' 点餐：</b>' +
        (who && servedToday[who.uid] ? '<div class="hp-log">今天已经给这位端过了，这次就当练手</div>' : '') +
        '<div style="margin:6px 0;font-size:14px;color:var(--text)">想点「' + need.join('、') + '」各一份 <img src="' + FOOD_IMG[(customer-1) % FOOD_IMG.length] + '" style="width:36px;height:36px;vertical-align:middle;image-rendering:pixelated"></div>' +
        '<div class="hp-ing" id="hpIng"></div>' +
        '<button class="hp-btn primary" id="hpOk">凑齐了</button>'
      const g = $('hpIng')
      ING.forEach((ing) => {
        const b = document.createElement('button')
        b.innerHTML = '<div class="hp-dot" style="background:' + ing.c + '"></div>' + ing.n
        b.onclick = () => {
          const i = picked.indexOf(ing)
          if (i >= 0) { picked.splice(i, 1); b.classList.remove('picked') }
          else if (picked.length < 3) { picked.push(ing); b.classList.add('picked') }
        }
        g.appendChild(b)
      })
      $('hpOk').onclick = () => {
        const ok = picked.length === 3 && order.every((o) => picked.includes(o))
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
    /* 先把镇民名单拉回来，再让「开火！」可用 ——
       拉到之前就开局的话，第一位客人会变成「路过的镇民」，看起来像没生效。
       这里只拉数据、不自动开局，开始界面还是要用户自己点。 */
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
      try { window.sfx && window.sfx('levelup') } catch (e) {}
      $('hpArena').innerHTML = '<b style="color:var(--text)">今日出餐结束！满意 ' + satisfied + '/5 位食客</b><br><button class="hp-btn primary" id="hpAgain" style="margin-top:8px">再开一轮</button>'
      $('hpAgain').onclick = () => { customer = 0; satisfied = 0; nextCustomer() }
    }

    $('hpSum').innerHTML = sumHtml()
    $('hpArena').innerHTML =
      '<b style="color:var(--text)">给镇上的邻居做饭</b><br>' +
      '<span style="font-size:12px;color:var(--text-muted)">一轮五位客人，都是<b>真住在小镇的人</b>。<br>' +
      '做好了菜会真的端到他门口，他的信箱里会多一封带光尘的信。</span><br>' +
      '<span style="font-size:11px;color:var(--text-faint)">餐品素材：DOTOWN ドット絵ダウンロードサイト（无料素材）</span><br>' +
      '<button class="hp-btn primary" id="hpStart" style="margin-top:8px" disabled>正在看镇上都有谁…</button>'
    $('hpStart').onclick = () => { customer = 0; satisfied = 0; nextCustomer() }
  },
}
