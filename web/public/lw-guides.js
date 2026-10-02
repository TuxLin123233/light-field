// 引导中心
//
// 每个主要页面一条引导，另有一条「全站总引导」从设置页启动。
//
// 为什么集中放这里而不是各视图各写一份：
//   引导内容改文案的频率比功能高得多，散在 7 个视图里改一次要翻 7 个文件。
//   而且选择器写错了在视图里是静默失效，集中一处好核对。
//
// 用法：
//   LWGuides.run('paint')    运行画板引导
//   LWGuides.run('tour')     运行全站总引导
//   LWGuides.list()          列出所有引导（设置页拿它渲染入口）
//   LWGuides.seen('paint')   这条引导看过没
//   LWGuides.reset()         清掉全部「已看过」，方便重看

;(function () {
  if (window.LWGuides) return

  var SEEN_PREFIX = 'lw-guide-'

  function seen(key) {
    try {
      return localStorage.getItem(SEEN_PREFIX + key) === '1'
    } catch (e) {
      return false
    }
  }
  function markSeen(key) {
    try {
      localStorage.setItem(SEEN_PREFIX + key, '1')
    } catch (e) {}
  }

  /* ================= 引导内容 =================
     el 支持选择器字符串，也可以是一个函数（返回元素），
     找不到目标时这一步自动跳过 —— 比整个引导卡住好。 */

  var GUIDES = {
    /* ---------- 全站总引导 ---------- */
    tour: {
      name: '逛一遍像素小镇',
      desc: '七个地方，一分钟看完',
      icon: '🧭',
      steps: [
        {
          el: '#appNav',
          pad: 8,
          title: '四个地方，就在底下',
          text: '画板画画、社区看别人的、小镇盖房串门、我的看光尘和成就。点哪去哪。',
        },
        {
          el: '#board',
          pad: 8,
          title: '① 画板',
          text: '一格一格点着上色。右边能选 16/32/64 三种画布，还能喷漆、撒沙、做逐帧动画。',
        },
        {
          el: '#gallery',
          pad: 8,
          title: '② 社区',
          text: '大家的作品都在这儿。点开能看大图、看用色、送光尘，长按能复制链接或举报。',
        },
        {
          el: '#twBody',
          pad: 8,
          title: '③ 小镇',
          text: '点别人家的房子就能去串门。回自己家可以摆家具、贴墙纸、挑窗外天气。',
        },
        {
          el: '#dustNum',
          pad: 8,
          title: '④ 我的',
          text: '光尘、签到、等级、成就都在这。光尘能换家具，也能送给喜欢的作品。',
        },
        {
          el: () => document.querySelector('a[href="/settings"]'),
          pad: 6,
          title: '⑤ 设置',
          text: '主题、音效、导航位置，还有这份引导。以后想重看随时来这儿。',
        },
        {
          el: () => document.querySelector('a[href="/mail"]'),
          pad: 6,
          title: '⑥ 信箱',
          text: '签到奖励、活动信件都发到这里。有小礼包记得领，过期就没了。',
        },
        {
          el: '#appNav',
          pad: 8,
          title: '就这些，去玩吧',
          text: '不用邮箱也不用手机号。画点什么挂上去吧 🎨',
        },
      ],
    },

    /* ---------- 画板 ---------- */
    paint: {
      name: '怎么画画',
      desc: '画布、尺寸、工具、发布',
      icon: '🎨',
      steps: [
        { el: '#board', pad: 8, title: '这是画布', text: '点一下上一格色，按住拖动可以连续涂。' },
        {
          el: () => document.querySelector('.sizes, .size-row, [data-size]'),
          pad: 6,
          title: '选画布尺寸',
          text: '16×16 最快出图，32×32 够用，64×64 最细但费时间。',
        },
        {
          el: () => document.querySelector('.tools, .tool-row, [data-tool]'),
          pad: 6,
          title: '一排工具',
          text: '画笔、直线、矩形、圆、橡皮、填充、吸管、手型。快捷键见键盘按 ? 的面板。',
        },
        {
          el: () => document.querySelector('.palette, .colors, .swatches'),
          pad: 6,
          title: '取色',
          text: '下面这排是站内 32 色。也能用吸管从画布上吸，或者自己调。',
        },
        {
          el: () => document.querySelector('#uploadBtn, .upload, .submit-row'),
          pad: 8,
          title: '画完点这里',
          text: '起个名字发布到社区，别人就能看到、给你送光尘。',
        },
      ],
    },

    /* ---------- 社区 ---------- */
    gallery: {
      name: '社区怎么看',
      desc: '排行、作品卡、长按菜单',
      icon: '🌆',
      steps: [
        {
          el: () => document.querySelector('.featured-row, #featuredRow'),
          pad: 8,
          title: '本周最亮的几幅',
          text: '按收到的光尘排的 Top 5。想上去就画点好东西。',
        },
        { el: '#gallery', pad: 8, title: '大家的作品', text: '点任意一张看大图。' },
        {
          el: () => document.querySelector('.card'),
          pad: 8,
          title: '卡片上有这些',
          text: '作品名、尺寸、作者和发布时间。右下角的数字是收到的光尘。',
        },
        {
          el: () => document.querySelector('#gallery'),
          pad: 8,
          title: '长按试试',
          text: '长按作品能复制链接、生成朋友圈卡片、举报。手机上别滑太快，会误触。',
        },
      ],
    },

    /* ---------- 小镇 ---------- */
    town: {
      name: '小镇怎么玩',
      desc: '串门、家具、天气',
      icon: '🏘️',
      steps: [
        {
          el: '.tw-map',
          pad: 8,
          title: '这就是小镇',
          text: '每间屋子住一个人，下面写着他家最贵的一件家具。人多时地图可以上下滑。',
        },
        {
          el: () => document.querySelector('.tw-plot'),
          pad: 6,
          title: '点一间进一家',
          text: '串门只能看，动不了人家的东西。',
        },
        {
          el: () => document.querySelector('#twGoHome, .tw-acts'),
          pad: 8,
          title: '回自己的小屋',
          text: '第一次进去只有四面墙，摆几件家具就有样子了。',
        },
        {
          el: () => document.querySelector('#twGoBag, [href="/town/bag"]'),
          pad: 6,
          title: '家具商店',
          text: '600 多件，五套配色。同一件家具换个主题就是另一件。',
        },
        {
          el: () => document.querySelector('.tw-weather, [data-weather]'),
          pad: 6,
          title: '窗外天气',
          text: '晴、多云、雨、雪、清晨、黄昏、夜，八种随便挑。不挑就跟着现实时间变。',
        },
      ],
    },

    /* ---------- 我的 ---------- */
    mine: {
      name: '我的这页',
      desc: '光尘、签到、等级、成就',
      icon: '🌱',
      steps: [
        {
          el: '#dustNum',
          pad: 8,
          title: '这是光尘',
          text: '每天签到给 5 个。能买家具、送给喜欢的作品。',
        },
        {
          el: () => document.querySelector('#signBtn, .sign-top'),
          pad: 8,
          title: '每天来报到',
          text: '连续签到有额外奖励。下面那条带子会一天天亮起来。',
        },
        {
          el: '#lvBarHost',
          pad: 8,
          title: '小镇等级',
          text: '按作品数、创作天数、收到光尘算出来的。Lv.8 叫「传说」。',
        },
        {
          el: () => document.querySelector('a[href="/achieve"]'),
          pad: 6,
          title: '成就',
          text: '154 个，解锁了给光尘。第一次下笔、画满十幅这些都算。',
        },
        {
          el: () => document.querySelector('a[href="/mail"]'),
          pad: 6,
          title: '信箱',
          text: '奖励和公告都在这儿。有未领的信时这个入口会呼吸发光。',
        },
      ],
    },

    /* ---------- 聊天 ---------- */
    chat: {
      name: '怎么找人聊天',
      desc: '好友、送光尘、发作品',
      icon: '💬',
      steps: [
        { el: () => document.querySelector('.ch-body, #chBody'), pad: 8, title: '这里是聊天', text: '消息会存着，下次进来还在。' },
        {
          el: () => document.querySelector('.ch-sendbar, .ch-send'),
          pad: 8,
          title: '发消息',
          text: '打字、发涂鸦、送光尘都在这儿。光尘送出去就从你账上扣。',
        },
      ],
    },
  }

  /* ================= 运行 ================= */

  var running = null

  /* ================= 跨页预约 =================
     ★ 为什么需要这个：
     想「跳到某一页再跑那一页的引导」时，最自然的写法是
       router.push(home); setTimeout(() => run(key), 700)
     但这行代码是在**当前视图**里注册的 setTimeout，
     而 app.js 的 withAutoCleanup 会在路由切换时把旧视图注册的
     定时器全部清掉 —— 于是那个 setTimeout 根本不会触发，
     表现就是「页面跳过去了，引导没出来」。

     正解不是绕开清理，而是**换个地方记**：
     把要跑的引导先记下来，等路由切换完成之后由 app.js 触发。
     这样既不受清理影响，时机也更准（是「新页面渲染完」而不是「猜 700ms」）。 */
  var pendingKey = null

  function request(key) {
    if (!GUIDES[key]) return false
    pendingKey = key
    return true
  }

  /** app.js 在每次路由切换后调用；有预约就把它跑掉 */
  function flushPending() {
    if (!pendingKey) return false
    var k = pendingKey
    pendingKey = null
    // 目标页面这时还没渲染完（afterEach 早于 DOM 更新），让一帧
    setTimeout(function () { run(k) }, 60)
    return true
  }

  function run(key, opts) {
    var g = GUIDES[key]
    if (!g) return
    if (!window.LWDeco || !window.LWDeco.guide) return
    var o = opts || {}
    running = key
    // 过滤掉当前页面上不存在的步骤 —— 跨页引导时这一步很重要
    var steps = g.steps.filter(function (st) {
      var el = typeof st.el === 'function' ? st.el() : document.querySelector(st.el)
      return !!el
    })
    if (!steps.length) {
      /* ★ 以前这里是静默 return ——
         用户点了引导、页面也没跳错，就是「什么都没发生」，
         完全不知道是为什么。现在给一句话。
         最常见的原因是：引导里的元素在这台设备上不存在
         （比如某个模块没加载、或页面结构变了）。 */
      try {
        /* floatText 的第一个参数是**锚点元素**，不是文案 ——
           传字符串进去它会去读 .getBoundingClientRect 然后抛错。 */
        if (window.LWDialog && window.LWDialog.floatText) {
          window.LWDialog.floatText(document.body, '这一步在本页没有对应内容')
        } else if (window.toast) {
          window.toast('这一步在本页没有对应内容')
        }
      } catch (e) {}
      running = null
      return
    }
    window.LWDeco.guide(steps, {
      doneText: o.doneText || '知道了',
      onDone: function () {
        running = null
        markSeen(key)
        if (o.onDone) o.onDone()
      },
    })
  }

  /** 列出所有引导（设置页用它渲染入口） */
  function list() {
    var out = []
    for (var k in GUIDES) {
      if (!Object.prototype.hasOwnProperty.call(GUIDES, k)) continue
      out.push({
        key: k,
        name: GUIDES[k].name,
        desc: GUIDES[k].desc,
        icon: GUIDES[k].icon,
        steps: GUIDES[k].steps.length,
        seen: seen(k),
      })
    }
    return out
  }

  /** 清掉全部「已看过」，让引导可以重来 */
  function reset() {
    try {
      var keys = []
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i)
        if (k && k.indexOf(SEEN_PREFIX) === 0) keys.push(k)
      }
      keys.forEach(function (k) { localStorage.removeItem(k) })
      return keys.length
    } catch (e) {
      return 0
    }
  }

  /** 第一次进某个页面时自动跑一次（除非看过） */
  function auto(key, delay) {
    if (seen(key)) return
    setTimeout(function () {
      run(key)
    }, delay == null ? 1100 : delay)
  }

  window.LWGuides = {
    run: run,
    request: request,
    flushPending: flushPending,
    list: list,
    seen: seen,
    markSeen: markSeen,
    reset: reset,
    auto: auto,
    has: function (k) { return !!GUIDES[k] },
    running: function () { return running },
    /* 引导内容也暴露出去，方便以后从后台配置 */
    defs: GUIDES,
  }
})()
