// 像素小镇 · Service Worker
// 目标：装到桌面后，没网也能打开画板继续画。
// 策略：
//   - 应用外壳（HTML/JS/CSS/图标）安装时预缓存，之后走「缓存优先 + 后台更新」
//   - /api/ 一律走网络，绝不缓存（作品、房间、投票这类数据必须实时）
//   - 其它图片等静态资源走缓存优先

const VERSION = 'lw-v1.3.1'
const SHELL_CACHE = 'lw-shell-' + VERSION

const SHELL = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.webmanifest',
  '/vue.global.prod.js',
  '/vue-router.global.prod.js',
  '/omggif.js',
  '/qrcode.js',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/views/paint.js',
  '/views/room.js',
  '/views/gallery.js',
  '/views/settings.js',
  '/views/changelog.js',
  '/views/admin.js',
  '/views/terms.js',
  '/views/faq.js',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        // 逐个添加：任何一个 404 都不应该让整个安装失败
        Promise.all(
          SHELL.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
          )
        )
      )
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // 接口永远走网络，不缓存
  if (url.pathname.startsWith('/api/')) return

  // 导航请求：网络优先，断网时回退到缓存的外壳
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL_CACHE).then((c) => c.put('/index.html', copy))
          return res
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    )
    return
  }

  // 静态资源：缓存优先，同时后台悄悄更新
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(SHELL_CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
