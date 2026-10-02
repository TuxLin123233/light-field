import { checkOrigin } from './_origin.js'
// 头像接口
//
//   GET  ?uids=a,b,c   批量取头像（画社区列表时一次拿完，避免 N 次请求）
//       不带 uids 时取自己的，并附上当前头像与两种画法的价格
//   POST {action:'save', pixels, mode}  保存自绘头像（每次都扣费：像素画 20 / 喷漆 30）
//   POST {action:'reset'}               恢复默认头像（不退还已花的光尘）
import { readActiveUser, BANNED_ERROR } from './_auth.js'
import { readBook, writeBook, publicView } from './_dust.js'
import {
  readAvatar,
  writeAvatar,
  sanitizePixels,
  isBlank,
  defaultPixels,
  visiblePixels,
  setUseDefault,
  costOf,
  COST_PIXEL,
  COST_SPRAY,
  MODES,
  SIZE,
} from './_avatar.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const url = new URL(request.url)
  const kv = env.LIGHTFIELD_KV

  const uids = (url.searchParams.get('uids') || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[A-Za-z0-9_-]{1,40}$/.test(s))
    .slice(0, 60)

  // 批量：给没画过的返回 null，前端会渲染客户端生成的默认头像
  if (uids.length) {
    const out = {}
    for (const uid of uids) {
        const av = await readAvatar(kv, uid)
        // 选了默认头像的人这里给 null —— 前端会去画 uid 生成的默认头像
        out[uid] = visiblePixels(av)
    }
    return json({ ok: true, size: SIZE, avatars: out })
  }

  // 自己：带解锁状态，编辑器要用
  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const av = await readAvatar(kv, who.uid)
  const book = await readBook(kv, who.uid)
  return json({
    ok: true,
    uid: who.uid,
    size: SIZE,
    // 两种画法各自的价格，前端按 mode 取
    cost: { pixel: COST_PIXEL, spray: COST_SPRAY },
    modes: MODES,
      has: !!av,
      // 自己画的那份还在不在（切了默认之后依然是 true）
      hasDrawing: !!(av && av.px),
      useDefault: !!(av && av.useDefault),
      currentMode: av ? av.mode : '',
      pixels: visiblePixels(av),
      default: defaultPixels(who.uid),
    book: publicView(book),
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  // 改状态的请求必须来自本站
  {
    const g = checkOrigin(request)
    if (!g.ok) return json(g.body, g.status)
  }
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const who = await readActiveUser(env, body && body.token, request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (who.banned) return json(BANNED_ERROR, 403)
  if (who.gone) return json({ error: '账号不存在', code: 'gone' }, 401)

  const kv = env.LIGHTFIELD_KV
  const action = (body && body.action) || ''

    /* 换成默认头像 / 换回自己画的。两个都**免费**，而且都只动「当前用哪个」
       这一个标记 —— 自己画的那份一直留着，随时能切回来。
       老版本的 reset 是直接把 px 抹掉，画过的东西就没了，这里改掉了。 */
    if (action === 'default' || action === 'custom' || action === 'reset') {
      const av = await readAvatar(kv, who.uid)
      if (!av || !av.px) {
        return json({ error: '你还没画过自己的头像。先画一张，之后就能在两种之间随便切了' }, 400)
      }
      const wantDefault = action !== 'custom'
      const rec = await setUseDefault(kv, who.uid, wantDefault)
      return json({
        ok: true,
        useDefault: !!(rec && rec.useDefault),
        pixels: visiblePixels(rec),
        default: defaultPixels(who.uid),
        cost: 0,
      })
    }

  if (action !== 'save') return json({ error: '未知操作' }, 400)

  const px = sanitizePixels(body && body.pixels)
  if (!px) {
    return json({ error: `头像必须是 ${SIZE}×${SIZE} 的像素数据（每个格子 [r,g,b]）` }, 400)
  }
  if (isBlank(px)) {
    return json({ error: '还没画呢，至少涂几格再保存' }, 400)
  }

  // 每次保存都扣费，价格按画法区分。
  // costOf 返回的一定是数字；之前这里拿整个价格表对象去比较，
  // 26 < {…} 恒为 false 直接放行，扣费又算出 NaN 被兜成 0 ——
  // 表现就是「余额不够也能存，存完余额变 0」。
  const mode = MODES.indexOf(body.mode) >= 0 ? body.mode : 'pixel'
  const cost = costOf(mode)

  const book = await readBook(kv, who.uid)
  if (book.bal < cost) {
    return json(
      {
        error: `${mode === 'spray' ? '像素喷漆' : '像素画'}需要 ${cost} 个光尘，你只有 ${book.bal} 个`,
        need: cost,
        short: cost - book.bal,
        book: publicView(book),
      },
      400
    )
  }
  const charged = await writeBook(kv, who.uid, { ...book, bal: book.bal - cost })

  const rec = await writeAvatar(kv, who.uid, px, true, mode)
  return json({
    ok: true,
    mode,
    cost,
    charged: cost,
    pixels: rec.px,
    book: publicView(charged),
  })
}

export { COST_PIXEL, COST_SPRAY }
