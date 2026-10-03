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
    .hp-plate { display: grid; grid-template-columns: repeat(2,52px); gap: 8px; justify-content: center; margin: 10px 0; }
    .hp-plate button { width: 52px; height: 52px; border-radius: 12px; border: 2px solid var(--border-strong); cursor: pointer; }
    .hp-plate button.sel { outline: 3px solid var(--accent); }
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

    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t } return a }
    function saveAll() {
      let combo = {}
      try { combo = JSON.parse(localStorage.getItem('lw-town-save') || '{}') } catch (e) {}
      combo.hotpot = { best: state.best, stars: state.stars, cooks: state.cooks }
      try { localStorage.setItem('lw-town-save', JSON.stringify(combo)) } catch (e) {}
      const t = token()
      if (t) fetch('/api/towngame', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ action: 'save', save: combo }) }).catch(() => {})
    }
    function sumHtml() { return '累计 ' + state.cooks + ' 轮 · 最满意客人数 ' + state.best + '/5 · 每满意 1 人结 1 个光尘 · 音效：gamersounds.com' }

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
      $('hpArena').innerHTML =
        '<b style="color:var(--text)">第 ' + customer + ' 位食客点餐：</b>' +
        '<div style="margin:6px 0;font-size:14px;color:var(--text)">想点「' + need.join('、') + '」各一份 <img src="' + FOOD_IMG[customer-1] + '" style="width:36px;height:36px;vertical-align:middle;image-rendering:pixelated"></div>' +
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
        try { window.sfx && window.sfx(ok ? 'success' : 'fail') } catch (e) {}
        stepPlate(preOk && ok)
      }
    }
    function stepPlate(preFireOk) {
      const target = COLORS4.slice()
      let cur = shuffle(COLORS4.slice())
      let sel = null
      const draw = () => {
        $('hpArena').innerHTML =
          '<b style="color:var(--text)">最后：把四色摆成和目标一样的花格！<br>点两个格子交换位置</b>' +
          '<div style="margin:8px 0;font-size:12px;color:var(--text-muted)">目标</div>' +
          '<div class="hp-plate">' + target.map((c) => '<div style="width:52px;height:52px;border-radius:12px;background:' + c + '"></div>').join('') + '</div>' +
          '<div class="hp-plate" id="hpPlate"></div>' +
          '<button class="hp-btn primary" id="hpDone">装盘完成</button>'
        const g = $('hpPlate')
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
          log(ok ? '装盘好看到流泪！' : '摆歪了…')
          const full = preFireOk && ok
          if (full) satisfied++
          try { window.sfx && window.sfx(full ? 'eat' : 'fail') } catch (e) {}
          customerInfo(full)
        }
      }
      draw()
    }
    function customerInfo(ok) {
      $('hpArena').innerHTML = '<b style="color:var(--text)">' + (ok ? '😋 食客满意！+1 颗星' : '😅 这顿将就了' : '') + '</b><br><button class="hp-btn primary" id="hpNext" style="margin-top:8px">下一位</button>'
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
    $('hpArena').innerHTML = '<b style="color:var(--text)">五位食客，备料要齐、火候要准、装盘要对</b><br><span style="font-size:11px;color:var(--text-faint)">餐品素材：DOTOWN ドット絵ダウンロードサイト（无料素材）</span><br><button class="hp-btn primary" id="hpStart" style="margin-top:8px">开火！</button>'
    $('hpStart').onclick = () => { customer = 0; satisfied = 0; nextCustomer() }
  },
}
