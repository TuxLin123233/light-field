// 小镇「卡牌屋 + 大锅饭」的存档与奖励
// GET  -> 读当前存档（未登录返回空档，不报错）
// POST action=save  -> 写存档（登录后）
// POST action=claim -> 结算一次对局/做菜，按规则发光尘（防刷：上限与次数间隔）
import { readActiveUser, isBanned } from './_auth.js'
import { readBook, writeBook, publicView, creditDust } from './_dust.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })
const KEY = (uid) => 'townsave:' + uid
const MAX_SIZE = 16000
// claim 防刷：同一用户 60 秒内最多结算 3 次；每次最多发 5 光尘
const CLAIM_MAX = 5
const CLAIM_WINDOW = 60000
const CLAIM_PER_WINDOW = 3

export async function onRequestOptions() { return new Response(null, { status: 204, headers: CORS }) }

const blank = () => ({ card: { best: 0, plays: 0 }, hotpot: { stars: 0, best: 0, cooks: 0 } })

export async function onRequestGet(context) {
  const env = context.env
  if (!env.LIGHTFIELD_KV) return json({ ok: true, save: blank(), logged: false })
  const who = await readActiveUser(env, '', context.request.headers.get('authorization'))
  if (!who) return json({ ok: true, save: blank(), logged: false })
  const raw = await env.LIGHTFIELD_KV.get(KEY(who.uid))
  let save = blank()
  try { if (raw) save = { ...blank(), ...JSON.parse(raw) } } catch (e) {}
  return json({ ok: true, save, logged: true })
}

export async function onRequestPost(context) {
  const env = context.env
  if (!env.LIGHTFIELD_KV) return json({ error: 'LIGHTFIELD_KV is not configured' }, 500)
  const who = await readActiveUser(env, '', context.request.headers.get('authorization'))
  if (!who) return json({ error: '未登录', code: 'noauth' }, 401)
  if (isBanned(who.user)) return json({ error: '账号已被封禁' }, 403)
  let body
  try { body = await context.request.json() } catch (e) { return json({ error: 'Invalid JSON body' }, 400) }
  const action = String(body.action || '')

  if (action === 'save') {
    const save = body.save || {}
    let clean = blank()
    if (save.card && typeof save.card === 'object') clean.card = { best: Math.max(0, Number(save.card.best) || 0) | 0, plays: Math.max(0, Number(save.card.plays) || 0) | 0 }
    if (save.hotpot && typeof save.hotpot === 'object') clean.hotpot = { stars: Math.max(0, Number(save.hotpot.stars) || 0) | 0, best: Math.max(0, Number(save.hotpot.best) || 0) | 0, cooks: Math.max(0, Number(save.hotpot.cooks) || 0) | 0 }
    const s = JSON.stringify(clean)
    if (s.length > MAX_SIZE) return json({ error: '存档太大了' }, 400)
    await env.LIGHTFIELD_KV.put(KEY(who.uid), s)
    return json({ ok: true, save: clean })
  }

  if (action === 'claim') {
    // kind: 'card' | 'hotpot'；score：卡牌到的层数 / 大锅的星星数
    const kind = body.kind === 'hotpot' ? 'hotpot' : 'card'
    const score = Math.max(0, Number(body.score) || 0)
    // 防刷闸：每用户每窗口次数
    const rlKey = 'townclaim:' + who.uid
    const now = Date.now()
    let rec = { t: [] }
    try { rec = JSON.parse((await env.LIGHTFIELD_KV.get(rlKey)) || '{"t":[]}') } catch (e) {}
    rec.t = (Array.isArray(rec.t) ? rec.t : []).filter((x) => now - x < CLAIM_WINDOW)
    if (rec.t.length >= CLAIM_PER_WINDOW) return json({ error: '结算太频繁了，歇会儿', wait: true }, 429)
    rec.t.push(now)
    await env.LIGHTFIELD_KV.put(rlKey, JSON.stringify(rec), { expirationTtl: 120 })
    // 奖励曲线：卡牌每通关一层 1 光尘，最多 5；大锅每道 1 颗星，最多 5
    const amount = Math.min(CLAIM_MAX, kind === 'card' ? Math.floor(score / 2) : score)
    let book = await readBook(env.LIGHTFIELD_KV, who.uid)
    if (amount > 0) book = await creditDust(env.LIGHTFIELD_KV, who.uid, amount)
    return json({ ok: true, earned: amount, book: publicView(book) })
  }

  return json({ error: 'unknown action' }, 400)
}
