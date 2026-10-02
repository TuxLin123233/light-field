import { adminAuth } from '../_adminauth.js'
// 管理员接口：审核员管理 + 待处理下架 + 举报 + 真删
//
//   GET                                           名单 / 待处理 / 举报
//   POST {action:'add',    uid, name}             任命审核员
//   POST {action:'remove', uid}                   撤职
//   POST {action:'ban',    uid, reason}           暂停审核资格
//   POST {action:'unban',  uid}                   恢复审核资格
//   POST {action:'delete', time}                  **真删作品**（只有这里能做）
//   POST {action:'restore', time}                 恢复显示（撤销下架）
//   POST {action:'handle', id}                    标记举报已处理
//
// 这里是全站**唯一**能真正删除作品的地方。审核员接口（/api/mod）没有删除能力。
import { removeByTime, findByTime } from '../_history.js'
import {
  listMods, addMod, removeMod, setModBan,
  listHidden, unhideWork, readHiddenMap,
  listModReports, markModReport, MAX_MODS,
} from '../_mod.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
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
  const gate = await adminAuth(env, request)
  if (!gate.ok) return json(gate.body, gate.status)
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const kv = env.LIGHTFIELD_KV
  return json({
    ok: true,
    maxMods: MAX_MODS,
    mods: await listMods(kv),
    pending: await listHidden(kv),
    reports: await listModReports(kv),
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const gate = await adminAuth(env, request)
  if (!gate.ok) return json(gate.body, gate.status)
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const kv = env.LIGHTFIELD_KV

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const action = String(body.action || '')
  const uid = String(body.uid || '').trim()
  const time = Number(body.time)

  if (action === 'add') {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(uid)) return json({ error: '用户 ID 不合法' }, 400)
    const r = await addMod(kv, uid, body.name, 'admin')
    if (!r.ok) return json({ error: r.error }, 400)
    return json({ ok: true, mods: await listMods(kv) })
  }

  if (action === 'remove') {
    const r = await removeMod(kv, uid)
    if (!r.ok) return json({ error: r.error }, 400)
    return json({ ok: true, mods: await listMods(kv) })
  }

  if (action === 'ban') {
    const why = String(body.reason || '').trim().slice(0, 80)
    if (!why) return json({ error: '封禁要写一句原因' }, 400)
    await setModBan(kv, uid, true, why)
    return json({ ok: true, mods: await listMods(kv) })
  }

  if (action === 'unban') {
    await setModBan(kv, uid, false)
    return json({ ok: true, mods: await listMods(kv) })
  }

  if (action === 'restore') {
    const r = await unhideWork(kv, time)
    if (!r.ok) return json({ error: r.error }, 400)
    return json({ ok: true, pending: await listHidden(kv) })
  }

  if (action === 'delete') {
    // 真删：先确认作品还在，再删历史记录，最后把下架记录清掉
    const found = await findByTime(kv, time)
    if (!found) return json({ error: '找不到这件作品，可能已经被删了' }, 404)
    // removeByTime 返回的是 {found, last}，不是 {ok} —— 判错了会永远删不掉
    const r = await removeByTime(kv, time)
    if (!r || !r.found) return json({ error: '删除失败，条目可能已经不在' }, 400)
    await unhideWork(kv, time)
    return json({ ok: true, deleted: time, pending: await listHidden(kv) })
  }

  if (action === 'handle') {
    const r = await markModReport(kv, String(body.id || ''))
    if (!r.ok) return json({ error: r.error }, 400)
    return json({ ok: true, reports: await listModReports(kv) })
  }

  if (action === 'clear-hidden') {
    // 兜底：把所有下架记录清掉（比如误操作把一堆正常作品下架了）
    const map = await readHiddenMap(kv)
    for (const t of Object.keys(map)) await kv.delete('hide:' + t)
    await kv.put('hidden', '{}')
    return json({ ok: true, pending: [] })
  }

  return json({ error: '未知操作' }, 400)
}
