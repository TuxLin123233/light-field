// 像素小镇 · 卡牌屋 —— 10 层肉鸽牌局
export default {
  name: 'town-card',
  title: '卡牌屋',
  css: `
    .cr-page { max-width: 560px; margin: 0 auto; padding: 0 14px calc(96px + env(safe-area-inset-bottom, 0px)); }
    /* 顶部：深夜牌铺的招牌 */
      .cr-head {
        display: flex; align-items: center; gap: 10px;
        margin: 0 -14px 12px;
        padding: 14px 16px;
        background: linear-gradient(180deg, #3d2b52, #2c1e3d);
        border-bottom: 3px solid #1d1429;
        box-shadow: 0 4px 14px rgba(30,15,50,.35), inset 0 1px 0 rgba(255,255,255,.12);
      }
    .cr-back {
        font-size: 13px; font-weight: 700; text-decoration: none;
        color: #e6d8ff; background: rgba(255,255,255,.12);
        border-radius: 999px; padding: 5px 11px;
      }
      .cr-back:active { transform: scale(.95) }
    .cr-title {
        font-size: 18px; font-weight: 800; color: #fff2d8; flex: 1;
        text-shadow: 0 2px 0 rgba(20,10,35,.7);
      }
    .cr-sum {
        background: linear-gradient(180deg, #fffaf2, #f7f0e4);
        border: 1px solid #e4d6c0; border-radius: 14px;
        padding: 12px 14px; margin-bottom: 12px;
        color: #3f3324; font-size: 12.5px; line-height: 1.85;
        box-shadow: 0 2px 0 #ece0cb, 0 4px 12px rgba(120,100,60,.10);
      }
      html[data-mood='dark'] .cr-sum {
        background: linear-gradient(180deg, #322b3d, #2a2434);
        border-color: #453c55; color: #ece2f5; box-shadow: none;
      }
    /* ---------- 牌桌 ----------
         深绿绒面 + 斜向织纹 + 中央的灯光，边缘一圈木框。
         和小镇地图同一套做法：多层渐变 + inset 阴影。 */
      .cr-arena {
        position: relative;
        background:
          radial-gradient(90% 70% at 50% 40%, rgba(255,240,200,.14), transparent 70%),
          repeating-linear-gradient(45deg, rgba(255,255,255,.035) 0 3px, transparent 3px 7px),
          linear-gradient(180deg, #2f5b45, #234536);
        border: 5px solid #6b4a2a;
        border-radius: 16px;
        padding: 16px 14px;
        margin-bottom: 12px;
        text-align: center;
        color: #eef6ef;
        box-shadow:
          inset 0 0 40px rgba(0,0,0,.42),
          inset 0 2px 0 rgba(255,255,255,.10),
          0 4px 0 #4e3620,
          0 10px 22px rgba(40,30,15,.28);
      }
      /* 木框上的高光，让边框有点厚度 */
      .cr-arena::after {
        content: ''; position: absolute; inset: 3px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,.10);
        pointer-events: none;
      }
      .cr-arena .cr-enemy { color: #fff6e2; text-shadow: 0 2px 0 rgba(0,0,0,.5) }
      .cr-arena .cr-log, .cr-arena .cr-hpbar + div { color: #cfe3d5 }
    .cr-enemy { font-size: 15.5px; font-weight: 800; color: inherit; }
    .cr-enemy .emoji { font-size: 40px; display: block; margin: 6px 0; }
    .cr-hpbar { height: 10px; background: var(--surface-2); border-radius: 999px; overflow: hidden; margin: 8px 0; }
    .cr-hpbar > i { display: block; height: 100%; background: #e5574b; transition: width .2s; }
    .cr-pbar > i { background: #45b581; }
    .cr-hand { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 10px 0; }
    /* 手牌：给一点厚度和悬停抬起，像真的一叠牌 */
      .cr-card {
        width: 106px;
        border: 1px solid #d9c8ab;
        background: linear-gradient(180deg, #fffdf8, #f7efe1);
        border-radius: 12px; padding: 9px;
        cursor: pointer; font-family: inherit; text-align: left;
        color: #3f3324;
        box-shadow: 0 2px 0 #e2d3ba, 0 4px 10px rgba(110,80,40,.13);
        transition: transform .12s, box-shadow .12s;
      }
      html[data-mood='dark'] .cr-card {
        background: linear-gradient(180deg, #3b3444, #322b3b);
        border-color: #4c4359; color: #efe6f7; box-shadow: 0 2px 0 #241f2e;
      }
      .cr-card:hover { transform: translateY(-2px); box-shadow: 0 4px 0 #e2d3ba, 0 8px 16px rgba(110,80,40,.18) }
      .cr-card:active { transform: translateY(0) scale(.97) }
    
    .cr-card b { font-size: 13px; display: block; }
    .cr-card i { font-size: 11px; color: var(--text-muted); display: block; margin-top: 3px; font-style: normal; }
    .cr-card em { font-size: 10px; color: var(--accent); display: block; margin-top: 4px; font-style: normal; font-weight: 700; }
    /* 按钮：做成小铜牌 */
      .cr-btn {
        border: 1px solid #c9a86f;
        background: linear-gradient(180deg, #fff6e4, #f3e3c6);
        color: #4a3a20;
        border-radius: 999px; padding: 9px 20px;
        font-size: 13px; font-weight: 800; cursor: pointer; font-family: inherit;
        margin: 4px;
        box-shadow: 0 2px 0 #d3b785;
      }
      .cr-btn:active { transform: translateY(1px); box-shadow: none }
      html[data-mood='dark'] .cr-btn {
        background: linear-gradient(180deg, #3c3646, #322c3b); border-color: #554a68; color: #efe6f7;
        box-shadow: 0 2px 0 #241f2e;
      }
    .cr-btn.primary {
        background: linear-gradient(180deg, #8b6ad4, #6f4fb8);
        border-color: #5b3fa0; color: #fff;
        box-shadow: 0 2px 0 #4a3384;
      }
      .cr-btn[disabled] { opacity: .6; cursor: default }
    /* 日志：牌桌下面的一条「记录纸」 */
      .cr-log {
        font-size: 12px; line-height: 1.75;
        color: #5c4a33; background: #fdf8ef;
        border: 1px dashed #dcc9a8; border-radius: 10px;
        padding: 9px 12px; margin-top: 10px; min-height: 20px;
      }
      html[data-mood='dark'] .cr-log {
        background: #2f2a24; border-color: #4a4136; color: #e2d6c2;
      }
    .cr-row { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  `,
  template: `
    <div class="cr-page">
      <div class="cr-head"><a class="cr-back" href="/town">← 小镇</a><div class="cr-title">🃏 卡牌屋</div></div>
      <div class="cr-sum" id="crSum"></div>
      <div class="cr-arena" id="crArena"></div>
      <div class="cr-log" id="crLog"></div>
    </div>
  `,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const log = (m) => { $('crLog').textContent = m }
    const token = () => { try { return localStorage.getItem('lw-token') || '' } catch (e) { return '' } }
    let state = null

    const CARD_POOL = [
      { k: 'pixel', n: '逐格像素画', i: '🖌️', d: '造成 6 点伤害', cost: 1, dmg: 6 },
      { k: 'spray', n: '像素喷漆', i: '💨', d: '造成 4 点伤害，抽 1 张', cost: 1, dmg: 4, draw: 1 },
      { k: 'gravity', n: '像素重力', i: '⏳', d: '造成 3~9 随机伤害', cost: 1, rand: [3, 9] },
      { k: 'like', n: '佳作点赞', i: '❤️', d: '回复 5 点生命', cost: 1, heal: 5 },
      { k: 'dust', n: '光尘补给', i: '✨', d: '本回合 +1 能量', cost: 0, energy: 1 },
      { k: 'guard', n: '防抄袭护盾', i: '🛡️', d: '获得 6 点护甲', cost: 1, block: 6 },
      { k: 'coop', n: '联机协作', i: '🤝', d: '本回合伤害牌 +2', cost: 1, buff: 2 },
      { k: 'champ', n: '比赛冠军', i: '🏆', d: '造成 12 点伤害', cost: 2, dmg: 12 },
      { k: 'theme', n: '秋收主题', i: '🌾', d: '造成 4 点伤害，回复 3', cost: 1, dmg: 4, heal: 3 },
      { k: 'town', n: '小镇巡逻', i: '🏘️', d: '获得 4 护甲，抽 1 张', cost: 1, block: 4, draw: 1 },
    ]
    const STARTERS = ['pixel', 'pixel', 'spray', 'like', 'guard', 'dust', 'gravity', 'pixel', 'coop', 'theme']
    const FOES = [
      { n: '鸽子小妖', img: '/images/dotown/thing_pigeon_01.png', hp: 10, atk: 3 },
      { n: '阿布怪', img: '/images/dotown/thing_abu.png', hp: 14, atk: 4 },
      { n: '小猎犬幽灵', img: '/images/dotown/thing_dachshund_01.png', hp: 18, atk: 5 },
      { n: '猫魂', img: '/images/dotown/thing_cats_13.png', hp: 24, atk: 6 },
      { n: '猴子巡逻兵', img: '/images/dotown/thing_monkey_01.png', hp: 30, atk: 7 },
      { n: '猴王', img: '/images/dotown/thing_monkey_02.png', hp: 36, atk: 8 },
      { n: '疯猴', img: '/images/dotown/thing_monkey_03.png', hp: 46, atk: 9 },
      { n: '旧图廊鸽王', img: '/images/dotown/thing_pigeon_04.png', hp: 60, atk: 11 },
      { n: '旧图廊守卫', img: '/images/dotown/thing_cats_13.png', hp: 80, atk: 13 },
      { n: '像素末日', img: '/images/dotown/thing_monkey_03.png', hp: 110, atk: 15 },
    ]

    const byK = (k) => CARD_POOL.find((c) => c.k === k)

    function saveBest() {
      const data = { card: { best: state.best, plays: state.plays } }
      try { localStorage.setItem('lw-town-save', JSON.stringify(data)) } catch (e) {}
      const t = token()
      if (t) fetch('/api/towngame', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ action: 'save', save: data }) }).catch(() => {})
    }

    function startRun() {
      state.run = { floor: 1, hp: 30, maxHp: 30 }
      state.deck = STARTERS.map(byK)
      newFloor()
    }
    function foeFor(f) { return FOES[Math.min(f - 1, FOES.length - 1)] }
    function newFloor() {
      const f = foeFor(state.run.floor)
      state.enemy = { ...f, maxHp: f.hp }
      state.turn = { block: 0, energy: 3, buff: 0 }
      state.hand = []
      state.discard = []
      state.deckNow = shuffle(state.deck.slice())
      drawCards(4)
      render()
    }
    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; ; const t = a[i]; a[i] = a[j]; a[j] = t } return a }
    function drawCards(n) {
      for (let i = 0; i < n; i++) {
        if (!state.deckNow.length) { state.deckNow = shuffle(state.discard); state.discard = [] }
        if (state.deckNow.length && state.hand.length < 7) state.hand.push(state.deckNow.pop())
      }
    }
    function play(idx) {
      const c = state.hand[idx]
      if (!c || state.turn.energy < c.cost) { log('能量不够'); return }
      state.turn.energy -= c.cost
      apply(c)
      if (c.dmg || c.rand) { try { window.sfx && window.sfx('hit') } catch (e) {} }
      state.hand.splice(idx, 1); state.discard.push(c)
      if (state.enemy.hp <= 0) return winFloor()
      render()
    }
    function apply(c) {
      const t = state.turn
      let bonus = 0
      if ((c.dmg || c.rand) && t.buff) { bonus = t.buff; t.buff = 0 }
      if (c.dmg) hurtEnemy(c.dmg + bonus)
      if (c.rand) hurtEnemy(c.rand[0] + ((Math.random() * (c.rand[1] - c.rand[0] + 1)) | 0) + bonus)
      if (c.heal) state.run.hp = Math.min(state.run.maxHp, state.run.hp + c.heal)
      if (c.block) t.block += c.block
      if (c.buff) t.buff += c.buff
      if (c.energy) t.energy += c.energy
      if (c.draw) drawCards(c.draw)
    }
    function hurtEnemy(n) { state.enemy.hp -= n }
    function hurtPlayer(n) {
      const real = Math.max(0, n - state.turn.block)
      state.turn.block = Math.max(0, state.turn.block - n)
      state.run.hp -= real
    }
    function endTurn() {
      hurtPlayer(state.enemy.atk)
      if (state.run.hp <= 0) return loseRun()
      state.discard.push(...state.hand); state.hand = []
      state.turn = { block: 0, energy: 3, buff: 0 }
      drawCards(4)
      render()
    }
    function winFloor() {
      log('打败了「' + state.enemy.n + '」！')
      try { window.sfx && window.sfx('achieve') } catch (e) {}
      state.run.floor++
      if (state.run.floor > 10) return winRun()
      const opts = shuffle(CARD_POOL.slice()).slice(0, 3)
      const arena = $('crArena')
      arena.innerHTML = '<b style="color:var(--text)">🎉 胜利！选一张加入牌组：</b><div class="cr-hand" id="crPick"></div>'
      const pick = $('crPick')
      opts.forEach((c) => {
        const b = document.createElement('button'); b.className = 'cr-card'
        b.innerHTML = '<b>' + c.i + ' ' + c.n + '</b><i>' + c.d + '</i><em>费 ' + c.cost + '</em>'
        b.onclick = () => { state.deck.push(c); state.run.hp = Math.min(state.run.maxHp, state.run.hp + 6); newFloor() }
        pick.appendChild(b)
      })
    }
    function loseRun() { try { window.sfx && window.sfx('fail') } catch (e) {} finish(state.run.floor - 1, false) }
    function winRun() { try { window.sfx && window.sfx('levelup') } catch (e) {} finish(10, true) }
    function finish(floors, won) {
      state.best = Math.max(state.best, floors)
      state.plays++
      saveBest()
      const t = token()
      if (t) fetch('/api/towngame', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ action: 'claim', kind: 'card', score: floors }) })
        .then((r) => r.json()).then((d) => { if (d && d.book && window.dust) window.dust.take(d.book) }).catch(() => {})
      $('crArena').innerHTML = '<b style="color:var(--text)">' + (won ? '🏆 通关旧图廊！你是镇上的画师王！' : '💀 倒在第 ' + state.run.floor + ' 层') + '</b><div class="cr-row" style="margin-top:10px"><button class="cr-btn primary" id="crAgain">再来一局</button></div>'
      $('crAgain').onclick = () => startRun()
      $('crSum').innerHTML = sumHtml()
    }
    function sumHtml() { return '最佳：' + state.best + ' 层 · 共玩 ' + state.plays + ' 局 · 每 2 层结 1 个光尘 · 音效：gamersounds.com' }
    function render() {
      const e = state.enemy, p = state.run, t = state.turn
      $('crArena').innerHTML =
        '<div class="cr-enemy">第 ' + state.run.floor + ' 层 · ' + e.n + ' <img src="' + e.img + '" alt="" style="width:48px;height:48px;display:block;margin:6px auto;image-rendering:pixelated"></div>' +
        '<div class="cr-hpbar"><i style="width:' + Math.max(0, e.hp / e.maxHp * 100) + '%"></i></div>' +
        '<div style="font-size:12px;color:var(--text-muted)">敌人 ' + Math.max(0, e.hp) + '/' + e.maxHp + ' · 每回合造成 ' + e.atk + '</div>' +
        '<hr style="border:0;border-top:1px dashed var(--border);margin:10px 0">' +
        '<div style="font-size:13px;color:var(--text)">你 ' + Math.max(0, p.hp) + '/' + p.maxHp + ' · 护甲 ' + t.block + ' · 能量 ' + t.energy + '</div>' +
        '<div class="cr-hpbar cr-pbar"><i style="width:' + Math.max(0, p.hp / p.maxHp * 100) + '%"></i></div>' +
        '<div class="cr-hand" id="crHand"></div>' +
        '<button class="cr-btn" id="crEnd">结束回合</button>'
      const hand = $('crHand')
      state.hand.forEach((c, i) => {
        const b = document.createElement('button'); b.className = 'cr-card'
        b.innerHTML = '<b>' + c.i + ' ' + c.n + '</b><i>' + c.d + '</i><em>费 ' + c.cost + '</em>'
        b.onclick = () => play(i)
        hand.appendChild(b)
      })
      $('crEnd').onclick = endTurn
    }

    let best = 0, plays = 0
    try {
      const raw = JSON.parse(localStorage.getItem('lw-town-save') || '{}')
      if (raw.card) { best = raw.card.best || 0; plays = raw.card.plays || 0 }
    } catch (e) {}
    state = { best, plays, run: null, enemy: null, hand: [], discard: [], deck: null, deckNow: [], turn: null }
    $('crSum').innerHTML = sumHtml()
    $('crArena').innerHTML = '<div class="cr-enemy">10 层小塔，每层一只小妖<br>牌组可三选一扩牌，倒下也有光尘</div><div style="font-size:11px;color:var(--text-faint);margin-top:8px">怪兽素材：DOTOWN ドット絵ダウンロードサイト（无料素材）</div><div class="cr-row" style="margin-top:8px"><button class="cr-btn primary" id="crStart">开始一局</button></div>'
    $('crStart').onclick = () => startRun()
    const t = token()
    if (t) fetch('/api/towngame', { headers: { Authorization: 'Bearer ' + t } })
      .then((r) => r.json()).then((d) => {
        if (d && d.save && d.save.card) {
          state.best = Math.max(state.best, d.save.card.best || 0)
          state.plays = Math.max(state.plays, d.save.card.plays || 0)
          $('crSum').innerHTML = sumHtml()
        }
      }).catch(() => {})
  },
}
