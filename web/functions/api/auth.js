// 账号：注册 / 登录 / 改密码 / 查看当前账号
//
// 凭证是无状态签名令牌（见 _auth.js），不存 KV，所以：
//   - 登录后每次请求都不用查库
//   - 不会因为 KV 最终一致出现「刚登录就掉线」
//
// 需要在 Cloudflare 加一个环境变量 AUTH_SECRET（任意长随机串），
// 没有它这个接口会直接拒绝工作，避免用弱默认值签名。

import {
  issueToken,
  readToken,
  hashPassword,
  verifyPassword,
  validName,
  validPassword,
  passwordHint,
  normalizeName,
  newUid,
  readUser,
  readUserByName,
  writeUser,
  pickToken,
} from './_auth.js'

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

// 统一话术：分不清是「用户不存在」还是「密码错」，避免被枚举
const BAD_CREDENTIALS = { error: '用户名或密码不正确' }

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/** 用凭证换取账号信息；顺带当作「登录状态是否还有效」的检查 */
export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  if (!env.AUTH_SECRET) return json({ error: '服务端未配置 AUTH_SECRET' }, 500)

  const who = await readToken(env, '', request.headers.get('authorization') || '')
  if (!who) return json({ ok: true, loggedIn: false })
  const user = await readUser(env.LIGHTFIELD_KV, who.uid)
  if (!user) return json({ ok: true, loggedIn: false })
  return json({
    ok: true,
    loggedIn: true,
    username: user.username,
    createdAt: user.createdAt,
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  if (!env.AUTH_SECRET) {
    return json({ error: '服务端未配置 AUTH_SECRET，账号功能暂不可用' }, 500)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  const action = (body && body.action) || ''
  const kv = env.LIGHTFIELD_KV

  /* ---------------- 注册 ---------------- */
  if (action === 'register') {
    const username = normalizeName(body.username)
    const password = String(body.password || '')

    if (!validName(username)) {
      return json({ error: '用户名需为 2~16 位，可用中文、字母、数字、下划线或连字符' }, 400)
    }
    const hint = passwordHint(password)
    if (hint) return json({ error: hint }, 400)

    const existed = await readUserByName(kv, username)
    if (existed) return json({ error: '这个用户名已经被占用了' }, 409)

    const user = {
      uid: newUid(),
      username,
      pw: await hashPassword(password),
      createdAt: Date.now(),
    }
    await writeUser(kv, user)
    const token = await issueToken(env, user)
    return json({ ok: true, token, username: user.username })
  }

  /* ---------------- 登录 ---------------- */
  if (action === 'login') {
    const username = normalizeName(body.username)
    const password = String(body.password || '')
    if (!username || !password) return json(BAD_CREDENTIALS, 401)

    const user = await readUserByName(kv, username)
    // 即使用户不存在也走一次哈希校验，让耗时相近，避免用响应时间探测账号
    const ok = user
      ? await verifyPassword(password, user.pw)
      : await verifyPassword(password, 'pbkdf2$' + 10000 + '$' + '00'.repeat(16) + '$' + '00'.repeat(32))
    if (!user || !ok) return json(BAD_CREDENTIALS, 401)

    const token = await issueToken(env, user)
    return json({ ok: true, token, username: user.username })
  }

  /* ---------------- 改密码 ---------------- */
  if (action === 'changepw') {
    const who = await readToken(env, pickToken(request, body))
    if (!who) return json({ error: '请先登录' }, 401)
    const oldPw = String(body.oldPassword || '')
    const newPw = String(body.newPassword || '')
    const hint = passwordHint(newPw)
    if (hint) return json({ error: hint }, 400)

    const user = await readUser(kv, who.uid)
    if (!user) return json({ error: '账号不存在' }, 404)
    if (!(await verifyPassword(oldPw, user.pw))) {
      return json({ error: '原密码不正确' }, 401)
    }
    user.pw = await hashPassword(newPw)
    user.pwChangedAt = Date.now()
    await writeUser(kv, user)
    // 改完密码重新签发，延长有效期
    const token = await issueToken(env, user)
    return json({ ok: true, token })
  }

  /* ---------------- 注销 ---------------- */
  // 注销是纯客户端行为：删掉本地凭证即可，服务端无状态无需处理。
  // 保留这个分支是为了让客户端调用有统一出口。
  if (action === 'logout') return json({ ok: true })

  return json({ error: '未知操作：' + action }, 400)
}
