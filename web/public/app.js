// 像素小镇 · Vue 3 + Vue Router 单页应用（无构建，push 即部署）
// 视图放在 /views/*.js，由 _genviews.py 从原单文件页面生成
import paint from './views/paint.js'
import gallery from './views/gallery.js'
import settings from './views/settings.js'
import changelog from './views/changelog.js'
import admin from './views/admin.js'
import modPanel from './views/mod.js'
import terms from './views/terms.js'
import copyright from './views/copyright.js'
import faq from './views/faq.js'
import mine from './views/mine.js'
import login from './views/login.js'
import mail from './views/mail.js'
import achieve from './views/achieve.js'
import avatar from './views/avatar.js'
import intro from './views/intro.js'
import tasks from './views/tasks.js'
import rank from './views/rank.js'
import user from './views/user.js'
import chat from './views/chat.js'
import town from './views/town.js'
import bag from './views/bag.js'

const { createApp } = window.Vue
const { createRouter, createWebHistory } = window.VueRouter

// 视图卸载时自动清理它创建的定时器 / 全局监听 / body 滚动锁
// （原多文件页面里有些 setInterval 没有存变量，切页后无法回收）
const restores = new WeakMap()

function withAutoCleanup(comp) {
  return {
    name: comp.name,
    css: comp.css,
    title: comp.title,
    noZoom: comp.noZoom,
    template: comp.template,
    mounted(...args) {
      const rawSetTimeout = window.setTimeout
      const rawSetInterval = window.setInterval
      const rawAdd = window.addEventListener.bind(window)
      const rawRemove = window.removeEventListener.bind(window)
      const timers = new Set()
      const handlers = []

      window.setTimeout = function (fn, ms) {
        const id = rawSetTimeout(fn, ms)
        timers.add(id)
        return id
      }
      window.setInterval = function (fn, ms) {
        const id = rawSetInterval(fn, ms)
        timers.add(id)
        return id
      }
      window.addEventListener = function (type, fn, opts) {
        handlers.push([type, fn, opts])
        return rawAdd(type, fn, opts)
      }

      restores.set(this, () => {
        window.setTimeout = rawSetTimeout
        window.setInterval = rawSetInterval
        window.addEventListener = rawAdd
        window.removeEventListener = rawRemove
        timers.forEach((id) => {
          clearTimeout(id)
          clearInterval(id)
        })
        handlers.forEach(([type, fn, opts]) => rawRemove(type, fn, opts))
        document.body.style.overflow = ''
        const el = document.getElementById('toast')
        if (el) el.classList.remove('show')
      })

      if (comp.mounted) comp.mounted.apply(this, args)
    },
    beforeUnmount() {
      const restore = restores.get(this)
      if (restore) {
        restore()
        restores.delete(this)
      }
      if (comp.beforeUnmount) comp.beforeUnmount.call(this)
    },
  }
}

/* 首页入口：
   有未完成的草稿 → 直接回画板接着画；
   否则按设置里选的启动页（画板/社区/我的/设置）。
   必须用函数式 redirect：写成静态 redirect 的话会在守卫之前就被解析掉。 */
const ENTRANCE_PATHS = ['/paint', '/gallery', '/mine', '/settings']
function resolveEntrance() {
  let target = '/paint'
  try {
    const raw = localStorage.getItem('paintDraft')
    if (raw) {
      const d = JSON.parse(raw)
      if (d && Array.isArray(d.pixels) && d.pixels.length) {
        return '/paint'
      }
    }
    const want = localStorage.getItem('lw-entrance') || ''
    if (ENTRANCE_PATHS.indexOf(want) >= 0) target = want
  } catch (e) {}
  return target
}

const routes = [
  { path: '/', redirect: resolveEntrance },
  { path: '/paint', component: withAutoCleanup(paint) },
  { path: '/gallery', component: withAutoCleanup(gallery) },
  { path: '/mine', component: withAutoCleanup(mine) },
  // 「我的」的两个过滤页：只显示自己的东西，不混进社区
  { path: '/mine/works', component: withAutoCleanup(mine) },
  { path: '/mine/gifted', component: withAutoCleanup(mine) },
  // 登录 / 注册（独立页面，不占底部导航位）
  { path: '/login', component: withAutoCleanup(login) },
  { path: '/mail', component: withAutoCleanup(mail) },
  { path: '/achieve', component: withAutoCleanup(achieve) },
  { path: '/tasks', component: withAutoCleanup(tasks) },
  { path: '/rank', component: withAutoCleanup(rank) },
  { path: '/u', component: withAutoCleanup(user) },
  { path: '/chat', component: withAutoCleanup(chat) },
  // 小镇地图 / 个人小屋（小屋是二级页，导航会自动收起来）
  { path: '/town', component: withAutoCleanup(town) },
  { path: '/town/home', component: withAutoCleanup(town) },
  // 家具商店：二级页，导航会自动收起来
  { path: '/town/bag', component: withAutoCleanup(bag) },
  { path: '/avatar', component: withAutoCleanup(avatar) },
  { path: '/intro', component: withAutoCleanup(intro) },
  { path: '/settings', component: withAutoCleanup(settings) },
  { path: '/changelog', component: withAutoCleanup(changelog) },
  { path: '/admin', component: withAutoCleanup(admin) },
  { path: '/mod', component: withAutoCleanup(modPanel) },
  { path: '/terms', component: withAutoCleanup(terms) },
  { path: '/copyright', component: withAutoCleanup(copyright) },
  { path: '/faq', component: withAutoCleanup(faq) },
  { path: '/:pathMatch(.*)*', redirect: resolveEntrance },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
})

// 切页：换样式、换标题、导航果冻弹一下
router.afterEach((to) => {
  /* 账本是全局的，但各页只在自己挂载时读它。
     切页时统一喊一嗓子：「余额可能变了，重画一下」——
     纯内存操作，不发请求，但这样任何页面切进来数字都是对的，
     不用整页刷新才能看到。 */
  if (window.dust && window.dust.repaint) {
    try {
      window.dust.repaint()
    } catch (e) {}
  }
  const comp = (to.matched[0] && to.matched[0].components.default) || null
  const vs = document.getElementById('view-style')
  if (vs) vs.textContent = (comp && comp.css) || ''
  document.title = (comp && comp.title ? comp.title + ' · ' : '') + '像素小镇'
  /* 缩放策略不再按页切换：全站统一锁死，直接写在 index.html 的 meta 里。
     以前只有画板（noZoom）锁着、其余页面可捏合放大，荣耀畅玩60 这类安卓机上
     手指一捏就把整页放大偏出屏幕；而 html/body 都有 overflow-x:clip，
     放大后边缘内容被裁掉又滚不回去，看起来像「页面溢出」。
     放在 index.html 而不是这里还有个好处：首屏就是锁定状态，
     不会出现「先按可缩放渲染、路由切完再锁」的闪一下。
     （iOS Safari 10 起会忽略 user-scalable，这条只对安卓浏览器生效。） */
  const nav = document.getElementById('appNav')
  if (nav) {
    nav.classList.remove('jelly')
    void nav.offsetWidth
    nav.classList.add('jelly')
  }
  window.scrollTo(0, 0)
})

/* ---------- 导航项：顺序与位置可由设置页调整 ---------- */
/* 尾部导航只放「一级页面」。
   设置不再占导航位了 —— 它是配置项，不是常去的地方，
   入口挪进「我的」页，把第四个位置让给更值得点开的板块。 */
/* 底部导航。ico 里写 emoji 是给「像素图标没加载出来」时的兜底，
   px 是自绘像素图标的名字 —— 站本身就是像素画站，导航用像素图标更合身，
   而且 emoji 在各平台长得不一样、还动不了。 */
const NAV_ITEMS = [
  { path: '/paint', ico: '🎨', px: 'palette', name: '画板' },
  { path: '/gallery', ico: '🌆', px: 'frame', name: '社区' },
  { path: '/town', ico: '🏘️', px: 'house', name: '小镇' },
  { path: '/mine', ico: '🌱', px: 'user', name: '我的' },
]
function readLS(k, d) {
  try {
    const v = localStorage.getItem(k)
    return v === null || v === '' ? d : v
  } catch (e) {
    return d
  }
}
/** 按本机保存的顺序返回导航项；缺失的自动补到末尾 */
function navOrder() {
  let order = readLS('lw-nav-order', '')
    .split(',')
    .filter((x) => NAV_ITEMS.some((i) => i.path === x))
  NAV_ITEMS.forEach((i) => {
    if (!order.includes(i.path)) order.push(i.path)
  })
  return order.map((p) => NAV_ITEMS.find((i) => i.path === p)).filter(Boolean)
}
function applyNavPosition() {
  const pos = readLS('lw-nav-pos', 'bottom') === 'top' ? 'top' : 'bottom'
  document.documentElement.setAttribute('data-nav-pos', pos)
}

/* 底部导航只在下面这几个「一级页面」出现。
   其余都是二级页 —— 信箱、好友、排行、日任务、成就、用户主页、头像、
   简介、更新日志、条款、常见问题…… 它们左上角本来就有返回按钮，
   再挂一条导航栏既占屏幕又容易点错。
   和好友聊天时（/chat?to=xxx）也在这个名单之外，所以一并隐掉了 ——
   不然键盘弹起来时导航栏会压在输入框上。 */
const NAV_PAGES = ['/paint', '/gallery', '/town', '/mine']

function hideNav(route) {
  if (!route) return false
  return NAV_PAGES.indexOf(route.path) < 0
}

const App = {
  data() {
    return {
      navItems: navOrder(),
      showNav: !hideNav(this.$route),
      // 导航图标尺寸。小屏用小一号，免得挤掉文字
      pxIconSize: (typeof window !== 'undefined' && window.innerWidth < 360) ? 20 : 22,
    }
  },
  watch: {
    $route(to) {
      this.showNav = !hideNav(to)
    },
  },
  mounted() {
    applyNavPosition()
    // 设置页改完顺序/位置后调用即可立刻生效
    window.setNavOrder = () => {
      this.navItems = navOrder()
    }
    window.setNavPosition = applyNavPosition
    // 导航栏样式：设置页切换时直接改根元素属性即可
    window.setNavStyle = (v) => {
      if (v === 'glass' || !v) document.documentElement.removeAttribute('data-nav-style')
      else document.documentElement.setAttribute('data-nav-style', v)
    }
  },
  template: `
    <div id="siteRoot">
      <router-view :key="$route.fullPath" />
    </div>
    <nav class="bottom-nav" id="appNav" v-show="showNav">
      <router-link v-for="it in navItems" :key="it.path" :to="it.path">
        <span class="nav-icon" v-if="!it.px">{{ it.ico }}</span>
        <i class="nav-icon nav-px" v-else :data-px="it.px" :data-px-size="pxIconSize" aria-hidden="true"></i>
        {{ it.name }}
      </router-link>
    </nav>
  `,
}

/* 底部导航切页音效：点哪个页面都响，不限画板。
   绑在容器上用事件委托，导航项是 v-for 渲染的，不需要逐个绑定。 */
document.addEventListener('pointerdown', (e) => {
  const link = e.target && e.target.closest ? e.target.closest('#appNav a') : null
  if (!link) return
  // 点当前页不响，避免原地点击也出声
  const cur = document.querySelector('#appNav a.router-link-active')
  if (cur && cur === link) return
  if (window.sfx) window.sfx('nav')
}, true)

// 暴露给视图用：视图里有些入口是 JS 动态挂的，没法直接写 <router-link>，
// 让它们能走 SPA 路由跳转，而不是 location.href 整页刷新
window.__lwRouter = router

createApp(App).use(router).mount('#app')

/* ---------- 自绘像素图标 ----------
   Vue 是运行时编译的，v-for 渲染出来的 <i data-px> 要等 DOM 出来才有。
   与其在每个组件的 updated 钩子里调一次，不如在这里统一：
   路由一变、DOM 一变就扫一遍，没画过的补上（LWIcon 自己用
   data-px-done 记着，重复扫不会重画）。 */
function paintIcons() {
  if (!window.LWIcon) return
  // 先把文本里的 emoji 换成像素图标的占位元素，再把占位元素画成 canvas
  try { window.LWIcon.swapEmoji(document.body) } catch (e) {}
  window.LWIcon.apply(document)
}
paintIcons()
router.afterEach(function () {
  // 换页后 DOM 才建好，等一帧再扫
  requestAnimationFrame(paintIcons)
  setTimeout(paintIcons, 120)
})
// 视图内部动态插内容（列表、弹层）时也能补上
try {
  new MutationObserver(function () {
    if (paintIcons._t) return
    paintIcons._t = setTimeout(function () {
      paintIcons._t = 0
      paintIcons()
    }, 80)
  }).observe(document.body, { childList: true, subtree: true })
} catch (e) {}

window.lwPaintIcons = paintIcons
