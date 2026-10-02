// 审核员接口
//
//   GET                         我是不是审核员 + 当前被下架的作品列表
//   POST {action:'hide',   time, reason}   暂时下架（不能删）
//   POST {action:'unhide', time}           恢复显示
//   POST {action:'report', target, reason} 举报另一个审核员
//
// **审核员没有任何删除权限。** 下架只是让作品暂时不显示，作品本体一个字节都不动，
// 恢复就是把记录删掉。真删在 /api/admin/mod 里，只有管理员能做。
import { readActiveUser, BANNED_ERROR } from './_auth.js'
import { isMod, hideWork, unhideWork, listHidden, addModReport, readModBan, listMods, REASON_LEN } from './_mod.js'

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

async function needMod(env, body, request) {
  const who = await readActiveUser(env, body && body.token, request.headers.get('authorization'))
  if (!who) return { error: json({ error: '未登录', code: 'noauth' }, 401) }
  if (who.banned) return { error: json(BANNED_ERROR, 403) }
  if (who.gone) return { error: json({ error: '账号不存在', code: 'gone' }, 401) }
  if (!(await isMod(env.LIGHTFIELD_KV, who.uid))) {
    const ban = await readModBan(env.LIGHTFIELD_KV, who.uid)
    return {
      error: json(
        ban
          ? { error: '你的审核员权限已被暂停：' + (ban.reason || '未说明'), code: 'modbanned' }
          : { error: '不是审核员', code: 'nomod' },
        403
      ),
    }
  }
  return { who }
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const kv = env.LIGHTFIELD_KV

  const who = await readActiveUser(env, '', request.headers.get('authorization'))
  if (!who) return json({ ok: true, isMod: false, guest: true, list: [] })

  const mod = await isMod(kv, who.uid)
  const ban = await readModBan(kv, who.uid)
  // 只有审核员才看得到「谁把什么下架了」—— 他需要据此避免重复劳动、也能互相监督
  const list = mod ? await listHidden(kv) : []
  const mods = mod ? (await listMods(kv)).map((m) => ({ uid: m.uid, name: m.name, banned: m.banned })) : []
  return json({
    ok: true,
    isMod: mod,
    uid: who.uid,
    modBanned: !!ban,
    banReason: ban ? ban.reason : '',
    reasonLen: REASON_LEN,
    list,
    mods,
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const gate = await needMod(env, body, request)
  if (gate.error) return gate.error
  const { who } = gate
  const kv = env.LIGHTFIELD_KV
  const action = String(body.action || '')

  if (action === 'hide') {
    const r = await hideWork(kv, body.time, who.uid, who.username, body.reason)
    if (!r.ok) return json({ error: r.error }, 400)
    return json({ ok: true, hide: r.hide, list: await listHidden(kv) })
  }

  if (action === 'unhide') {
    const r = await unhideWork(kv, body.time)
    if (!r.ok) return json({ error: r.error }, 400)
    return json({ ok: true, list: await listHidden(kv) })
  }

  if (action === 'report') {
    const target = String(body.target || '').trim()
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(target)) return json({ error: '举报对象不对' }, 400)
    const mods = await listMods(kv)
    const t = mods.find((m) => m.uid === target)
    if (!t) return json({ error: '这个人不是审核员' }, 400)
    const r = await addModReport(kv, t.uid, t.name, who.uid, who.username, body.reason)
    if (!r.ok) return json({ error: r.error }, 400)
    // 举报内容只有管理员看得到，这里不回显
    return json({ ok: true, reported: t.name })
  }

  return json({ error: '未知操作' }, 400)
}
