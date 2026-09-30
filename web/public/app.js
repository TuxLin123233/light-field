// 像素小镇 · Vue 3 + Vue Router 单页应用（无构建，push 即部署）
// 视图放在 /views/*.js，由 _genviews.py 从原单文件页面生成
import paint from './views/paint.js'
import room from './views/room.js'
import gallery from './views/gallery.js'
import settings from './views/settings.js'
import changelog from './views/changelog.js'
import admin from './views/admin.js'
import terms from './views/terms.js'

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

const routes = [
  { path: '/', redirect: '/paint' },
  { path: '/paint', component: withAutoCleanup(paint) },
  { path: '/room', component: withAutoCleanup(room) },
  { path: '/gallery', component: withAutoCleanup(gallery) },
  { path: '/settings', component: withAutoCleanup(settings) },
  { path: '/changelog', component: withAutoCleanup(changelog) },
  { path: '/admin', component: withAutoCleanup(admin) },
  { path: '/terms', component: withAutoCleanup(terms) },
  { path: '/:pathMatch(.*)*', redirect: '/paint' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
})

// 首页入口：有草稿进画板，否则按设置直达社区
router.beforeEach((to) => {
  if (to.path !== '/') return true
  let target = '/paint'
  try {
    const raw = localStorage.getItem('paintDraft')
    let hasDraft = false
    if (raw) {
      const d = JSON.parse(raw)
      if (d && Array.isArray(d.pixels)) hasDraft = true
    }
    if (localStorage.getItem('lw-entrance') === 'community' && !hasDraft) target = '/gallery'
  } catch (e) {}
  return target
})

// 切页：换样式、换标题、导航果冻弹一下
router.afterEach((to) => {
  const comp = (to.matched[0] && to.matched[0].components.default) || null
  const vs = document.getElementById('view-style')
  if (vs) vs.textContent = (comp && comp.css) || ''
  document.title = (comp && comp.title ? comp.title + ' · ' : '') + '像素小镇'
  const nav = document.getElementById('appNav')
  if (nav) {
    nav.classList.remove('jelly')
    void nav.offsetWidth
    nav.classList.add('jelly')
  }
  window.scrollTo(0, 0)
})

const App = {
  template: `
    <main id="siteRoot">
      <router-view :key="$route.fullPath" />
    </main>
    <nav class="bottom-nav" id="appNav">
      <router-link to="/paint"><span class="nav-icon">🎨</span>画板</router-link>
      <router-link to="/room"><span class="nav-icon">👥</span>联机</router-link>
      <router-link to="/gallery"><span class="nav-icon">🌆</span>社区</router-link>
      <router-link to="/settings"><span class="nav-icon">⚙️</span>设置</router-link>
    </nav>
  `,
}

createApp(App).use(router).mount('#app')
