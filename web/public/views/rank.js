// 排行榜（/rank）
//
// 三个页签：
//   每日榜 —— 今天谁收到的光尘最多
//   每周榜 —— 本周主题赛的票数榜
//   我的奖励 —— 我拿过几次、光尘共多少
//
// 榜单每行带头像：uid 交给 LWAvatar 去取，没设过头像的账号会拿到
// 客户端生成的默认头像，所以每行都有图，不会空着。
export default {
  name: 'rank',
  title: '排行榜',
  css: `
      [hidden] { display: none !important; }
      :root {
        --bg: #faf5ef;
        --surface: #ffffff;
        --surface-2: #efe9e0;
        --text: #3b342c;
        --text-muted: #6b5f50;
        --text-faint: #b0a697;
        --border: #efe7da;
        --border-strong: #e0d3c0;
        --accent: #5b8def;
        --gold: #e8a33d;
        --silver: #a8b0bb;
        --bronze: #c08457;
      }
      .rk-wrap {
        max-width: 460px;
        margin: 0 auto;
        padding: 14px 16px 96px;
      }
      .rk-back {
        display: inline-block;
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 6px 13px;
        font-size: 12px;
        font-weight: 700;
        text-decoration: none;
      }
      .rk-head { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
      .rk-title { font-size: 19px; font-weight: 800; color: var(--text); margin: 6px 0 2px; }
      .rk-sub { font-size: 12px; color: var(--text-faint); line-height: 1.7; }

      .rk-tabs { display: flex; gap: 7px; margin: 14px 0 4px; }
      .rk-tab {
        flex: 1;
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 11px;
        padding: 9px 4px;
        font-size: 13px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
      }
      .rk-tab.on { background: var(--accent); color: #fff; border-color: var(--accent); }

      .rk-rules {
        font-size: 11px;
        color: var(--text-faint);
        background: var(--surface-2);
        border-radius: 10px;
        padding: 8px 10px;
        margin: 10px 0 4px;
        line-height: 1.8;
      }
      .rk-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
      .rk-row {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 13px;
        padding: 9px 11px;
      }
      .rk-row.mine { border-color: var(--accent); background: #f2f6ff; }
      .rk-no {
        width: 26px; flex: 0 0 26px; text-align: center;
        font-size: 14px; font-weight: 800; color: var(--text-faint);
      }
      .rk-row:nth-child(1) .rk-no { color: var(--gold); }
      .rk-row:nth-child(2) .rk-no { color: var(--silver); }
      .rk-row:nth-child(3) .rk-no { color: var(--bronze); }
      .rk-av {
        width: 34px; height: 34px; flex: 0 0 34px; border-radius: 10px; overflow: hidden;
        background: var(--surface-2); border: 1px solid var(--border-strong);
      }
      .rk-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .rk-main { flex: 1; min-width: 0; }
      .rk-name {
        font-size: 14px; font-weight: 700; color: var(--text);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
      }
      .rk-work {
        font-size: 11px; color: var(--text-faint);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
      }
      .rk-val { flex: none; text-align: right; }
      .rk-score { font-size: 15px; font-weight: 800; color: var(--text); display: block; }
      .rk-award { font-size: 10px; color: var(--accent); display: block; }

      .rk-note { margin-top: 16px; font-size: 12px; color: var(--text-faint); line-height: 1.85; }
      .rk-msg {
        margin-top: 12px; font-size: 12px; border-radius: 10px; padding: 9px 11px;
        background: var(--surface-2); color: var(--text-muted);
      }
      .rk-msg.bad { background: #fdecea; color: #c0392b; }
  `,
  template: `
    <div class="rk-wrap">
      <div class="rk-head">
        <router-link class="rk-back" to="/mine">← 返回我的</router-link>
        <button class="lw-refresh" id="rkRefresh" type="button" data-label="刷新"></button>
      </div>
      <div class="rk-title">🏆 排行榜</div>
      <div class="rk-sub" id="rkSub">看看谁今天最受欢迎</div>
      <div class="rk-tabs">
        <button class="rk-tab" type="button" data-t="daily">每日榜</button>
        <button class="rk-tab" type="button" data-t="weekly">每周榜</button>
        <button class="rk-tab" type="button" data-t="my">我的奖励</button>
      </div>
      <div class="rk-rules" id="rkRules" hidden></div>
      <div class="rk-list" id="rkList"></div>
      <div class="rk-note" id="rkNote" hidden></div>
      <div class="rk-msg" id="rkMsg" hidden></div>
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
    let tab = 'daily'

    function showMsg(text, bad) {
      const el = $('rkMsg')
      el.textContent = text || ''
      el.hidden = !text
      el.classList.toggle('bad', !!bad)
    }

    /* rules 是数组 [{rank, dust, label}]，其中 rank:0 表示「其余上榜的人」。
       之前按「名次 → 光尘」的对象写的，取出来全是 undefined。 */
    function rulesText(rules) {
      if (!Array.isArray(rules) || !rules.length) return ''
      const named = rules
        .filter((r) => r && r.rank > 0)
        .sort((a, b) => a.rank - b.rank)
        .map((r) => '第 ' + r.rank + ' 名 ' + r.dust + ' 个')
      const rest = rules.find((r) => r && !r.rank)
      if (rest) named.push('其余上榜 ' + rest.dust + ' 个')
      return '奖励：' + named.join(' · ')
    }

    function awardOf(rules, rank) {
      if (!Array.isArray(rules)) return 0
      const exact = rules.find((r) => r && r.rank === rank)
      if (exact) return exact.dust || 0
      const rest = rules.find((r) => r && !r.rank)
      return rest ? rest.dust || 0 : 0
    }

    function drawBoard(d) {
      const list = $('rkList')
      list.innerHTML = ''
      const board = d.board || []
      const rules = d.rules
      const isDaily = d.type === 'daily'
      $('rkSub').textContent = isDaily
        ? '今天谁收到的光尘最多 · ' + (d.periodLabel || '')
        : '本周主题《' + (d.theme || '') + '》的票数榜 · ' + (d.periodLabel || '')

      const rt = $('rkRules')
      rt.hidden = false
      rt.textContent = rulesText(rules) + '（每期结算，发到信箱）'

      if (!board.length) {
        const e = document.createElement('div')
        e.className = 'rk-msg'
        e.textContent = isDaily ? '今天还没有人收到光尘，明天再来看看。' : '本周还没有人参赛。'
        list.appendChild(e)
      }

      board.forEach((r) => {
        const row = document.createElement('div')
        row.className = 'rk-row' + (r.mine ? ' mine' : '')
        row.setAttribute('data-uid', r.uid || '')
        const no = document.createElement('span')
        no.className = 'rk-no'
        no.textContent = r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : String(r.rank)
        const av = document.createElement('span')
        av.className = 'rk-av'
        if (window.LWAvatar) {
          const c = document.createElement('canvas')
          av.appendChild(c)
          // 每行都有头像：设过就显示设过的，没设过 LWAvatar 会给默认头像
          window.LWAvatar.draw(c, r.uid, 34)
        }
        const main = document.createElement('span')
        main.className = 'rk-main'
        const nm = document.createElement('span')
        nm.className = 'rk-name'
        nm.textContent = r.name || '这位画师'
        const wk = document.createElement('span')
        wk.className = 'rk-work'
        wk.textContent = r.workName ? '《' + r.workName + '》' : ''
        main.append(nm, wk)
        const val = document.createElement('span')
        val.className = 'rk-val'
        const sc = document.createElement('span')
        sc.className = 'rk-score'
        sc.textContent = isDaily ? r.score + ' 尘' : r.score + ' 票'
        val.appendChild(sc)
        const aw = awardOf(rules, r.rank)
        if (aw) {
          const a = document.createElement('span')
          a.className = 'rk-award'
          a.textContent = (isDaily ? '每日榜可得 ' : '周赛可得 ') + aw + ' 尘'
          val.appendChild(a)
        }
        row.append(no, av, main, val)
        list.appendChild(row)
      })

      /* 头像批量预取：draw() 此刻画的是默认头像，等真实头像到了再重绘一遍，
         免得 10 行头像一个个慢慢变。 */
      if (window.LWAvatar && board.length && window.LWAvatar.load) {
        const uids = board.map((r) => r.uid).filter(Boolean)
        if (uids.length) {
          window.LWAvatar
            .load(uids)
            .then(() => {
              list.querySelectorAll('.rk-row').forEach((row) => {
                const c = row.querySelector('.rk-av canvas')
                const uid = row.getAttribute('data-uid')
                if (c && uid) window.LWAvatar.draw(c, uid, 34)
              })
            })
            .catch(() => {})
        }
      }

      const note = $('rkNote')
      note.hidden = false
      note.innerHTML =
        '榜单每期结束后自动结算，光尘直接打进账本，同时寄一封信到信箱，<b>不用手动领取</b>。<br />' +
        '每日榜统计的是「作者收到多少光尘」，所以想让别人送你光尘也是上榜的办法。'
    }

    function drawMine(d) {
      const list = $('rkList')
      list.innerHTML = ''
      $('rkSub').textContent = '我拿到的排名奖励'
      $('rkRules').hidden = true
      const awards = d.awards || []
      if (!awards.length) {
        const e = document.createElement('div')
        e.className = 'rk-msg'
        e.textContent = '还没有拿到过排名奖励。上榜就会自动发，不用领。'
        list.appendChild(e)
      }
      awards.forEach((a) => {
        const row = document.createElement('div')
        row.className = 'rk-row'
        const no = document.createElement('span')
        no.className = 'rk-no'
        no.textContent = a.kind === 'daily' ? '日' : '周'
        const main = document.createElement('span')
        main.className = 'rk-main'
        const nm = document.createElement('span')
        nm.className = 'rk-name'
        nm.textContent = (a.kind === 'daily' ? '每日榜' : '每周主题赛') + ' ' + a.period
        main.appendChild(nm)
        const val = document.createElement('span')
        val.className = 'rk-val'
        const sc = document.createElement('span')
        sc.className = 'rk-score'
        sc.textContent = '+' + a.dust + ' 尘'
        val.appendChild(sc)
        row.append(no, main, val)
        list.appendChild(row)
      })
      const note = $('rkNote')
      note.hidden = false
      note.innerHTML = '当前余额 <b>' + ((d.book && d.book.bal) || 0) + '</b> 个光尘，累计收到 <b>' + ((d.book && d.book.got) || 0) + '</b> 个。'
    }

    async function load(force) {
      const C2 = window.LWCache || {}
      const ck2 = 'rank:' + tab
      if (force) C2.drop(ck2)
      const t = token()
      $('rkList').innerHTML = '<div class="rk-msg">加载中…</div>'
      showMsg('')
      try {
        const res = await fetch('/api/reward?type=' + tab, {
          headers: t ? { Authorization: 'Bearer ' + t } : {},
          cache: 'no-store',
        })
        if (tab === 'my' && res.status === 401) {
          $('rkList').innerHTML = ''
          showMsg('「我的奖励」需要登录后查看。', true)
          return
        }
        const d = await res.json().catch(() => ({}))
        if (!d || !d.ok) {
          $('rkList').innerHTML = ''
          showMsg('读取失败：' + esc((d && d.error) || res.status), true)
          return
        }
        if (tab === 'my') drawMine(d)
        else drawBoard(d)
        C2.put(ck2, d)
        return d
      } catch (e) {
        $('rkList').innerHTML = ''
        showMsg('读取失败：' + esc((e && e.message) || '网络错误'), true)
        return null
      }
    }

    $('rkList')
    document.querySelectorAll('.rk-tab').forEach((b) => {
      b.addEventListener('click', () => {
        if (tab === b.dataset.t) return
        tab = b.dataset.t
        document.querySelectorAll('.rk-tab').forEach((x) => x.classList.toggle('on', x.dataset.t === tab))
        if (window.sfx) window.sfx('tap')
        // 切页签优先用缓存，没有才请求
        const C2 = window.LWCache || {}
        const cd = C2.get('rank:' + tab)
        if (cd) {
          if (tab === 'my') drawMine(cd)
          else drawBoard(cd)
          return
        }
        load()
      })
    })
    document.querySelector('.rk-tab[data-t="daily"]').classList.add('on')
    /* 第一次进来才请求，之后切回来用缓存；想更新点刷新 */
    const C = window.LWCache || {}
    C.bindRefresh($('rkRefresh'), () => load(true), () => {}, true)
    if (!C.cached('rank:daily', () => { load().then((d) => { if (d) C.put('rank:daily', d) }) })) {
      const d = C.get('rank:daily')
      if (d) drawBoard(d)
    }
  },
}
