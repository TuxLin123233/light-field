// 别人的主页（/u?name=xxx 或 /u?uid=xxx）
//
// 展示：头像、用户名、简介、注册时间、关注/粉丝数、关注按钮（互关=好友）、
//       创作数据、作品墙、成就墙。
//
// 数据全部来自三个只读接口：
//   /api/profile?uid=  头像、简介、公开统计
//   /api/achieve?uid=  成就墙（公开，不给光尘余额）
//   /api/follow?uid=   关注状态
//   /api/get?author=   他的作品
//
// 配合「切页面不自动刷新」：第一次进来才请求，之后切回来直接用内存缓存，
// 右上角有刷新按钮。
export default {
  name: 'user',
  title: '画师主页',
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
        --ok: #4caf7d;
      }
      .u-wrap { max-width: 460px; margin: 0 auto; padding: 14px 16px 96px; }
      .u-back {
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
      .u-bar { display: flex; align-items: center; gap: 10px; margin: 12px 0 4px; }
      .u-bar-main { flex: 1; min-width: 0; }
      .u-hint { font-size: 12px; color: var(--text-faint); }

      .u-hero {
        display: flex; align-items: center; gap: 13px;
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 16px; padding: 14px; margin-top: 10px;
      }
      .u-av {
        width: 62px; height: 62px; flex: 0 0 62px; border-radius: 16px; overflow: hidden;
        background: var(--surface-2); border: 1px solid var(--border-strong);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; font-weight: 800; color: var(--text-faint);
      }
      .u-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .u-id { flex: 1; min-width: 0; }
      .u-name { font-size: 17px; font-weight: 800; color: var(--text); }
      .u-joined { font-size: 11px; color: var(--text-faint); margin-top: 2px; }
      /* 性别 / 生日标签。填了才显示 —— 没填就不占地方 */
      .u-tags { display: flex; flex-wrap: wrap; margin-top: 6px; }
      .u-tag {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        background: var(--surface-2);
        border-radius: 999px;
        padding: 3px 9px;
        margin: 0 6px 5px 0;
      }
      .u-tag.today { background: #fff3d6; color: #b8860b; }
      .u-bio {
        font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-top: 6px;
        white-space: pre-wrap; word-break: break-word;
      }
      .u-work { position: relative; }
      .u-work img { display: block; width: 100%; height: auto; }
      .u-give {
        position: absolute; left: 4px; bottom: 4px;
        border: 0; border-radius: 999px; padding: 3px 8px;
        font-size: 11px; font-weight: 800; font-family: inherit;
        background: rgba(0, 0, 0, 0.55); color: #fff; cursor: pointer;
        backdrop-filter: blur(3px);
      }
      .u-give:active { transform: scale(0.94); }
      .u-give[disabled] { opacity: 0.6; cursor: default; }
      .u-give.on { background: var(--accent); }
      .u-give.no-dust { opacity: 0.5; filter: grayscale(1); }
      .u-follow {
        flex: none; border: 0; border-radius: 11px; padding: 8px 13px;
        font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
        background: var(--accent); color: #fff;
      }
      .u-follow.on { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border-strong); }
      .u-acts { display: flex; align-items: center; gap: 8px; flex: none; }
      .u-chat {
        border: 0; border-radius: 999px; padding: 7px 14px;
        font-size: 13px; font-weight: 700; font-family: inherit;
        background: var(--accent); color: #fff; cursor: pointer; white-space: nowrap;
      }
      .u-chat:active { opacity: 0.85; }
      .u-follow[disabled] { opacity: 0.55; cursor: default; }
      .u-friend-tip {
        font-size: 11px; color: var(--ok); font-weight: 700; margin-top: 6px;
      }

      .u-nums { display: flex; gap: 8px; margin-top: 10px; }
      .u-num {
        flex: 1; text-align: center; background: var(--surface);
        border: 1px solid var(--border); border-radius: 13px; padding: 9px 4px;
      }
      .u-num b { display: block; font-size: 16px; font-weight: 800; color: var(--text); }
      .u-num span { font-size: 11px; color: var(--text-faint); }

      .u-stats {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px;
      }
      .u-stat {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 13px; padding: 10px 4px; text-align: center;
      }
      .u-stat b { display: block; font-size: 15px; font-weight: 800; color: var(--text); }
      .u-stat span { font-size: 10px; color: var(--text-faint); }

      .u-sec {
        display: flex; align-items: center; gap: 8px;
        margin: 20px 0 9px; font-size: 14px; font-weight: 800; color: var(--text);
      }
      .u-sec span { font-size: 11px; font-weight: 600; color: var(--text-faint); }

      .u-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 9px; }
      /* 作品墙默认只铺最近几件，其余的收在「查看更多」后面。
         以前是一次性把 60 件全铺出来，画师主页被拉得特别长。 */
      .u-work.u-hidden { display: none; }
      .u-more {
        display: block;
        width: 100%;
        margin-top: 10px;
        border: 1px dashed var(--border-strong);
        background: var(--surface-2);
        color: var(--accent);
        border-radius: 12px;
        padding: 11px;
        font-size: 13px;
        font-weight: 800;
        font-family: inherit;
        cursor: pointer;
      }
      .u-more:active { background: var(--border); }
      .u-grid img {
        width: 100%; aspect-ratio: 1; image-rendering: pixelated;
        border-radius: 11px; background: var(--art-bg);
        border: 1px solid var(--border); display: block; cursor: pointer;
      }
      .u-empty {
        font-size: 13px; color: var(--text-faint); text-align: center;
        padding: 22px 0; line-height: 1.8;
      }

      .u-ach-bar { height: 7px; border-radius: 999px; background: var(--surface-2); overflow: hidden; margin-bottom: 10px; }
      .u-ach-bar i { display: block; height: 100%; background: var(--accent); border-radius: 999px; }
      .u-cats { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
      .u-cat {
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text-muted); border-radius: 999px; padding: 4px 10px;
        font-size: 11px; font-weight: 700; font-family: inherit; cursor: pointer;
      }
      .u-cat.on { background: var(--accent); color: #fff; border-color: var(--accent); }
      .u-ach-list { display: flex; flex-direction: column; gap: 7px; }
      .u-ach {
        display: flex; align-items: center; gap: 10px;
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 12px; padding: 8px 11px;
      }
      .u-ach.got { border-color: var(--ok); background: #f4fbf7; }
      .u-ach-ico { font-size: 18px; flex: none; width: 26px; text-align: center; }
      .u-ach-main { flex: 1; min-width: 0; }
      .u-ach-name { font-size: 13px; font-weight: 700; color: var(--text); }
      .u-ach-desc {
        font-size: 11px; color: var(--text-faint); line-height: 1.5;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .u-ach:not(.got) .u-ach-name { color: var(--text-faint); }
      .u-msg {
        margin-top: 12px; font-size: 12px; border-radius: 10px; padding: 9px 11px;
        background: var(--surface-2); color: var(--text-muted);
      }
      .u-msg.bad { background: #fdecea; color: #c0392b; }
  `,
  template: `
    <div class="u-wrap">
      <router-link class="u-back" to="/gallery">← 返回社区</router-link>
      <div class="u-bar">
        <div class="u-bar-main">
          <div class="u-hint" id="uHint">画师主页</div>
        </div>
        <button class="lw-refresh" id="uRefresh" type="button" data-label="刷新"></button>
      </div>
      <div id="uBody"><div class="u-empty"><span class="lw-load"></span>正在读取…</div></div>
      <div class="u-msg" id="uMsg" hidden></div>
    </div>
  `,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const esc = (s) =>
      String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
    const fmt = (n) => {
      const v = Number(n) || 0
      if (v >= 10000) return (v / 10000).toFixed(1) + '万'
      return String(v)
    }
    const token = () => {
      try {
        return localStorage.getItem('lw-token') || ''
      } catch (e) {
        return ''
      }
    }
    const C = window.LWCache || {}

    // 从地址里拿要看谁
    const q = new URLSearchParams(location.search)
    const wantName = (q.get('name') || '').trim()
    let wantUid = (q.get('uid') || '').trim()

    let achCat = 'all' // 成就分类筛选
    let works = []
    /* 作品墙首屏只铺这么多件，其余收在「查看更多」后面 */
    const WORKS_INIT = 6
    let profile = null
    let follow = null
    let ach = null

    function showMsg(text, bad) {
      const el = $('uMsg')
      el.textContent = text || ''
      el.hidden = !text
      el.classList.toggle('bad', !!bad)
    }

    /* 一次性把三个接口都拉了。任何一个失败都不影响其它部分显示 */
    async function load(force) {
      if (force) {
        if (wantUid) {
          C.drop('u:uid:' + wantUid)
          C.drop('u:ach:' + wantUid)
          C.drop('u:fu:' + wantUid)
        } else if (wantName) {
          C.drop('u:name:' + wantName)
        }
      }
      const head = {}
      const t = token()
      if (t) head.Authorization = 'Bearer ' + t
      const j = async (u) => {
        const r = await fetch(u, { headers: head, cache: 'no-store' })
        return r.json().catch(() => ({}))
      }

      if (!wantUid) {
        // 只给了用户名：先换成 uid，后面几个接口都要用
        const p = await j('/api/profile?name=' + encodeURIComponent(wantName))
        if (!p || !p.ok) {
          $('uBody').innerHTML = '<div class="u-empty">没有找到这位画师。</div>'
          return
        }
        wantUid = p.uid
        profile = p
      }
      const key = wantUid
      profile = profile || (await j('/api/profile?uid=' + encodeURIComponent(key)))
      if (!profile || !profile.ok) {
        $('uBody').innerHTML = '<div class="u-empty">没有找到这位画师。</div>'
        return
      }
      // 只显示解锁了的成就就够了，未解锁的当灰盒
      ach = ach || (await j('/api/achieve?uid=' + encodeURIComponent(key)))
      follow = follow || (await j('/api/follow?uid=' + encodeURIComponent(key)))
      works = works.length ? works : ((await j('/api/get?limit=60&author=' + encodeURIComponent(profile.username))).history || [])

      C.put('u:uid:' + key, { profile, ach, follow, works })
      render()
    }

    /* 成就墙。

         服务端 view() 返回的是**全部**成就（153 条）外加 got 标记，
         列表这里只渲染 got 为真的 —— 看别人的主页时，他没拿到的成就
         一条都不该露出来。

         但光过滤列表还不够，有两处会顺带把「还差多少」抖出来：
           · 页头的「12/153」—— 分母就是没拿到的数量
           · 全部分类页签—— 点进去是个空列表，等于在预告这里有什么
         所以看别人时这两处也一起收掉；看自己时照旧留着当待办清单。 */
    function achHtml(onlyGot) {
      if (!ach || !ach.ok || !Array.isArray(ach.items)) return ''
      const all = ach.items || []
      const got = all.filter((a) => a.got)
      // 看别人时，一个没解锁的分类页签就没必要出现
      const cats = [{ id: 'all', name: '全部' }].concat(ach.categories || [])
      const shown = onlyGot
        ? cats.filter((c) => c.id === 'all' || got.some((a) => a.cat === c.id))
        : cats
      // 选了分类、但那个分类里其实没东西（页签刚从别人页切过来时可能发生）
      if (onlyGot && achCat !== 'all' && !shown.some((c) => c.id === achCat)) achCat = 'all'
      const list = all.filter((a) => (achCat === 'all' ? a.got : (a.cat === achCat && a.got)))
      const pct = ach.total ? Math.round((got.length / ach.total) * 100) : 0
      const rows = list
        .map(
          (a) =>
            '<div class="u-ach got">' +
            '<span class="u-ach-ico">' + esc(a.ico) + '</span>' +
            '<span class="u-ach-main">' +
            '<span class="u-ach-name">' + esc(a.name) + '</span>' +
            '<span class="u-ach-desc">' + esc(a.desc) + '</span>' +
            '</span></div>'
        )
        .join('')
      return (
        '<div class="u-ach-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="u-cats">' +
        shown
          .map(
            (c) =>
              '<button class="u-cat' + (c.id === achCat ? ' on' : '') +
              '" type="button" data-cat="' + esc(c.id) + '">' + esc(c.name) + '</button>'
          )
          .join('') +
        '</div>' +
        '<div class="u-ach-list">' + (rows || '<div class="u-empty">这里还没有解锁的成就。</div>') + '</div>'
      )
    }

    function render() {
      if (!profile) return
      const s = profile.stats || {}
      const m = (ach && ach.metrics) || {}
      const f = follow || {}
      const isMe = !!f.isMe
      const t = token()

      $('uHint').textContent = isMe ? '这是你自己' : '画师主页'

      const avBox = profile.avatar && window.LWAvatar
        ? '<canvas id="uAvCanvas"></canvas>'
        : '<span>' + esc(Array.from(profile.username || '?')[0]) + '</span>'
      const joined = profile.createdAt
        ? '加入于 ' + new Date(profile.createdAt).toLocaleDateString('zh-CN')
        : ''

      /* 性别和生日都是「填了才公开」，没填就整行不显示。
         生日只存月-日、不含年份，所以露出来也不涉及年龄。 */
      const GENDER_LABEL = { male: '🙋 男生', female: '🙋‍♀️ 女生', secret: '🕶️ 保密' }
      const tags = []
      if (profile.gender && GENDER_LABEL[profile.gender]) tags.push(GENDER_LABEL[profile.gender])
      // 只认服务端给的 MM-DD。格式不对就整条不显示，别画出「NaN 月 undefined 日」
      const bd = String(profile.birthday || '')
      if (/^\d{2}-\d{2}$/.test(bd)) {
        tags.push(
          profile.todayBirthday
            ? '🎂 今天生日！'
            : '🎂 ' + Number(bd.slice(0, 2)) + ' 月 ' + Number(bd.slice(3, 5)) + ' 日'
        )
      }
      const tagHtml = tags.length
        ? '<div class="u-tags">' +
          tags.map((x) => '<span class="u-tag' + (x.indexOf('今天生日') >= 0 ? ' today' : '') + '">' + x + '</span>').join('') +
          '</div>'
        : ''

      $('uBody').innerHTML =
        '<div class="u-hero">' +
        '<div class="u-av" id="uAv">' + avBox + '</div>' +
        '<div class="u-id">' +
        '<div class="u-name">' + esc(profile.username) + (profile.todayBirthday ? ' 🎂' : '') + '</div>' +
        (joined ? '<div class="u-joined">' + esc(joined) + '</div>' : '') +
        tagHtml +
        (profile.bio ? '<div class="u-bio">' + esc(profile.bio) + '</div>' : '') +
        (f.friend ? '<div class="u-friend-tip">🤝 你们是好友</div>' : '') +
        '</div>' +
        (isMe || !t
          ? ''
          : '<div class="u-acts">' +
            /* 互相关注才能私信（后端只放好友过去），所以只在好友时给这个入口。
               不然点了也会被后端挡回来，不如不给。 */
            (f.friend
              ? '<button class="u-chat" id="uChatBtn" type="button">💬 与他聊天</button>'
              : '') +
            '<button class="u-follow' + (f.iFollow ? ' on' : '') + '" id="uFollowBtn" type="button">' +
            (f.friend ? '🤝 好友' : f.iFollow ? '已申请' : '＋ 加好友') + '</button>' +
            '</div>') +
        '</div>' +
        '<div class="u-nums">' +
        '<div class="u-num"><b>' + fmt(f.following) + '</b><span>关注</span></div>' +
        '<div class="u-num"><b>' + fmt(f.followers) + '</b><span>粉丝</span></div>' +
        '<div class="u-num"><b>' + fmt(s.likes) + '</b><span>收到光尘</span></div>' +
        '<div class="u-num"><b>' + fmt(m.got || 0) + '</b><span>累计收到</span></div>' +
        '</div>' +
        '<div class="u-stats">' +
        '<div class="u-stat"><b>' + fmt(s.works) + '</b><span>作品</span></div>' +
        /* 这里看的是别人的累计创作量，所以还是累计数；
           自己的「今日绘制格子数」在「我的」页。标签加「累计」区分开。 */
        '<div class="u-stat"><b>' + fmt(s.cells) + '</b><span>累计绘制格数</span></div>' +
        '<div class="u-stat"><b>' + fmt(m.days || 0) + '</b><span>创作天</span></div>' +
        '<div class="u-stat"><b>' + fmt(m.signTotal || 0) + '</b><span>签到</span></div>' +
        '</div>' +
        '<div class="u-sec">🖼️ 作品<span>' + works.length + ' 件</span></div>' +
        '<div class="u-grid" id="uWorks">' +
        (works.length
          ? works
              .map((w, wi) => {
                const t = w.time || 0
                /* 每幅作品上给一个送光尘的按钮。
                   以前这里只有一张图、点了开大图，主页上完全没法送光尘 ——
                   用户反馈「无法给其它用户点赞」。 */
                const gave = !!(window.dust && window.dust.gave(String(t)))
                /* 相机作品不能收光尘：置灰但保持可点，点了说明原因。
                   加 disabled 的话手机上点了没反应，看着就像坏了。 */
                const noDust = w.fromImage === true
                return (
                  '<div class="u-work' + (wi >= WORKS_INIT ? ' u-hidden' : '') + '" data-t="' + t + '">' +
                  '<img alt="' + esc(w.workName || '未命名') + '" data-t="' + t +
                  '" src="' + pixelsToURL(w.pixels, w.size === 32 || w.size === 64 ? w.size : 16) + '">' +
                  '<button class="u-give' + (gave ? ' on' : '') + (noDust ? ' no-dust' : '') +
                  '" type="button" data-give="' + t + '"' +
                  (noDust ? ' title="像素相机转出来的作品不支持收光尘"' : '') + '>' +
                  (noDust ? '🚫 ' : '✨ ') + (Number(w.likes) || 0) +
                  '</button>' +
                  '</div>'
                )
              })
              .join('')
          : '<div class="u-empty">这位画师还没往墙上挂画。</div>') +
        '</div>' +
        (works.length > WORKS_INIT
          ? '<button class="u-more" id="uMoreBtn" type="button">查看更多（还有 ' +
            (works.length - WORKS_INIT) +
            ' 件）</button>'
          : '') +
        '<div class="u-sec">🏅 成就<span>' +
        /* 看别人时只报拿到了几个：写成「12/153」等于把人家还差多少也说了。
           看自己才需要分母 —— 那是我该去追的清单。 */
        (ach && ach.ok
          ? (isMe ? (ach.unlocked || 0) + '/' + (ach.total || 0) : String(ach.unlocked || 0))
          : '—') +
        '</span></div>' +
        achHtml(!isMe)

      // 头像
      const cv = $('uAvCanvas')
      if (cv && window.LWAvatar) {
        if (profile.avatar) window.LWAvatar.put(profile.uid, profile.avatar)
        window.LWAvatar.draw(cv, profile.uid, 62)
      }
      // 作品点开：复用社区的预览
      /* 送光尘。和社区里用的是同一套接口与账本，行为一致：
         未登录引导登录、余额不足提示、送过的不给重复送。 */
      async function giveDust(t, btn) {
        if (!window.dust) return
        if (!window.dust.logged()) {
          showMsg('登录后才能送光尘', true)
          setTimeout(() => {
            location.href = '/login'
          }, 800)
          return
        }
        if (window.dust.gave(String(t))) {
          showMsg('你已经送过光尘给这幅画了', true)
          return
        }
        if (window.dust.balance() < window.dust.cost) {
          showMsg('光尘不够了，去「我的」签到领一些吧', true)
          return
        }
        const w0 = works.find((x) => (x.time || 0) === Number(t))
        if (w0 && w0.fromImage === true) {
          showMsg('这幅是用像素相机转出来的照片，不支持收光尘，请给手绘作品送光尘', true)
          return
        }
        btn.disabled = true
        btn.textContent = '…'
        let ok = false
        try {
          const d = await window.dust.giveRemote(t)
          if (!d) {
            showMsg('赠送失败：网络错误', true)
            return
          }
          if (d.needLogin || d.code === 'noauth') {
            showMsg('登录状态已失效，请重新登录', true)
            setTimeout(() => {
              location.href = '/login'
            }, 800)
            return
          }
          if (!d.ok) {
            showMsg(d.error || '赠送失败', true)
            return
          }
          if (window.sfx) window.sfx('coin')
          ok = true
          const w = works.find((x) => (x.time || 0) === Number(t))
          if (w) w.likes = (Number(w.likes) || 0) + (Number(d.charged) || 0)
          showMsg('送出了 ' + (d.charged || window.dust.cost) + ' 个光尘 ✨ 余额 ' + window.dust.balance())
        } catch (e) {
          showMsg('赠送失败：' + ((e && e.message) || '网络错误'), true)
        } finally {
          btn.disabled = false
          if (ok) {
            // 送过了：点亮按钮并显示这幅画累计收到多少
            btn.classList.add('on')
            const w = works.find((x) => (x.time || 0) === Number(t))
            btn.textContent = '✨ ' + (w ? Number(w.likes) || 0 : 0)
          } else {
            const w = works.find((x) => (x.time || 0) === Number(t))
            btn.textContent = '✨ ' + (w ? Number(w.likes) || 0 : 0)
          }
        }
      }
      $('uWorks') &&
        [...$('uWorks').querySelectorAll('img[data-t]')].forEach((im) => {
          im.addEventListener('click', () => {
            const w = works.find((x) => (x.time || 0) === Number(im.getAttribute('data-t')))
            if (w && window.LWOpenWork) window.LWOpenWork(w)
          })
        })

      /* 「查看更多」：把藏起来的作品放出来。
         这里只是去掉 class，不重新渲染 —— 重渲染就得把上面那些
         点击/送光尘的事件重绑一遍，容易漏。 */
      const moreBtn = $('uMoreBtn')
      if (moreBtn) {
        moreBtn.addEventListener('click', () => {
          const grid = $('uWorks')
          if (grid) {
            grid.querySelectorAll('.u-work.u-hidden').forEach((el) => el.classList.remove('u-hidden'))
          }
          moreBtn.remove()
          if (window.sfx) window.sfx('open')
        })
      }
      $('uWorks') &&
        [...$('uWorks').querySelectorAll('[data-give]')].forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation()
            const t = Number(btn.getAttribute('data-give'))
            giveDust(t, btn)
          })
        })
      // 成就分类
      ;[...document.querySelectorAll('.u-cat')].forEach((b) => {
        b.addEventListener('click', () => {
          achCat = b.getAttribute('data-cat')
          if (window.sfx) window.sfx('tick')
          render()
        })
      })
      /* 「与他聊天」：私信页要知道跟谁聊，所以把 uid 一起带过去。
         顺便先把会话建出来（后端 add 会拒绝非好友，这里已经是好友了），
         这样过去就是现成的对话，不用再发一次消息才建起来。 */
      const cb = $('uChatBtn')
      if (cb) {
        cb.addEventListener('click', async () => {
          if (window.sfx) window.sfx('tap')
          const tk = token()
          if (!tk) {
            showMsg('聊天需要先登录。', true)
            return
          }
          const uid = (profile && profile.uid) || wantUid || ''
          if (!uid) return
          cb.disabled = true
          const old = cb.textContent
          cb.textContent = '打开中…'
          try {
            await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tk },
              body: JSON.stringify({ action: 'add', uid, text: '' }),
            })
          } catch (e) {
            /* 建会话失败不拦着：私信页照样能打开，里面也能发 */
          }
          try {
            const C2 = window.LWCache || {}
            C2.drop('chatlist')
            C2.drop('chat:' + uid)
            C2.drop('chatBadge')
          } catch (e) {}
          if (window.__lwRouter) window.__lwRouter.push('/chat?to=' + encodeURIComponent(uid))
          else location.href = '/chat?to=' + encodeURIComponent(uid)
          cb.disabled = false
          cb.textContent = old
        })
      }

      // 关注按钮
      const fb = $('uFollowBtn')
      if (fb) {
        fb.addEventListener('click', async () => {
          const tk = token()
          if (!tk) {
            showMsg('加好友需要先登录。', true)
            return
          }
          const on = fb.classList.contains('on')
          fb.disabled = true
          const old = fb.textContent
          fb.textContent = on ? '处理中…' : '申请中…'
          try {
            const res = await fetch('/api/follow', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tk },
              body: JSON.stringify({ action: on ? 'unfollow' : 'follow', uid: profile.uid }),
            })
            const d = await res.json().catch(() => ({}))
            if (!res.ok || !d || !d.ok) {
              fb.textContent = old
              fb.disabled = false
              showMsg((d && d.error) || '操作失败', true)
              return
            }
            follow = { ...f, iFollow: d.iFollow, friend: d.friend, following: d.following, followers: d.followers }
            // 缓存里也要更新，不然切回来又变回旧状态
            C.put('u:uid:' + profile.uid, { profile, ach, follow, works })
            if (window.sfx) window.sfx(on ? 'close' : 'follow')
            render()
            showMsg(
              d.friend ? '你们已经是好友了 🤝 现在可以聊天了'
                : on ? '已解除好友'
                : '已发出好友申请，等对方通过'
            )
          } catch (e) {
            fb.textContent = old
            fb.disabled = false
            showMsg('操作失败：' + ((e && e.message) || '网络错误'), true)
          }
        })
      }
    }

    // 像素数组 → 图片地址。和社区用的是同一套缩放规则
    function pixelsToURL(px, size) {
      if (!Array.isArray(px) || !px.length) return ''
      const n = size === 32 || size === 64 ? size : 16
      const c = document.createElement('canvas')
      c.width = n
      c.height = n
      const x = c.getContext('2d')
      for (let i = 0; i < n * n; i++) {
        const p = px[i]
        if (!p) continue
        if (p[0] > 246 && p[1] > 246 && p[2] > 246) continue
        x.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')'
        x.fillRect(i % n, Math.floor(i / n), 1, 1)
      }
      return c.toDataURL()
    }

    C.bindRefresh(
      $('uRefresh'),
      () => load(true),
      () => {},
      true
    )

    // 第一次进来才请求；切回来直接用缓存（省 Cloudflare 请求）
    const key0 = wantUid || 'name:' + wantName
    const cachedData = C.get('u:uid:' + wantUid) || C.get('u:name:' + wantName)
    if (cachedData) {
      profile = cachedData.profile
      ach = cachedData.ach
      follow = cachedData.follow
      works = cachedData.works || []
      render()
    } else {
      load(false)
    }
  },
}
