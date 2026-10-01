// 游戏内信箱：系统消息 + 可领取的附件（光尘）
//
// 为什么要有信箱：奖励不能只靠前端弹一次。附件存在服务端，
// 用户什么时候打开都能领，重复领取会被服务端挡掉。
//
// 键设计：
//   mbox:<uid>     收件箱，按时间倒序存信件
//   mboxdone:<uid> 已领取过的附件 id 列表，防止重复领
//
// 未登录用户没有信箱 —— 信箱与账号绑定，不发到本机。

const BOX_KEY = (uid) => 'mbox:' + uid
const DONE_KEY = (uid) => 'mboxdone:' + uid
const MAX_MAIL = 50
const MAX_DONE = 200

/** 附件类型：目前只有光尘，将来可以扩展 */
export const ATTACH_DUST = 'dust'

function sanitizeMail(m) {
  if (!m || typeof m !== 'object') return null
  const id = String(m.id || '')
  if (!id) return null
  return {
    id,
    kind: m.kind === 'attach' ? 'attach' : 'text',
    title: String(m.title || '').slice(0, 40),
    body: String(m.body || '').slice(0, 300),
    icon: String(m.icon || '✉️').slice(0, 8),
    time: Number(m.time) || 0,
    // 只有带附件的信件才需要 claimId
    claimId: m.claimId ? String(m.claimId) : '',
    dust: Math.max(0, Math.floor(Number(m.dust) || 0)),
  }
}

export async function readBox(kv, uid) {
  if (!kv || !uid) return []
  const raw = await kv.get(BOX_KEY(uid))
  if (!raw) return []
  try {
    const a = JSON.parse(raw)
    if (!Array.isArray(a)) return []
    return a.map(sanitizeMail).filter(Boolean).slice(0, MAX_MAIL)
  } catch (e) {
    return []
  }
}

export async function writeBox(kv, uid, list) {
  const clean = (Array.isArray(list) ? list : []).map(sanitizeMail).filter(Boolean).slice(0, MAX_MAIL)
  await kv.put(BOX_KEY(uid), JSON.stringify(clean))
  return clean
}

async function readDone(kv, uid) {
  const raw = await kv.get(DONE_KEY(uid))
  try {
    const a = JSON.parse(raw || '[]')
    return Array.isArray(a) ? a.map(String) : []
  } catch (e) {
    return []
  }
}

/**
 * 投递信件。同一 claimId 只会成功一次（幂等），
 * 所以重放同一个活动也不会重复塞满信箱。
 * 返回实际写入的信件数：0 表示这封信之前已投递过。
 */
export async function deliver(kv, uid, mail) {
  const m = sanitizeMail({ ...mail, time: mail.time || Date.now() })
  if (!m) return 0

  if (m.claimId) {
    const done = await readDone(kv, uid)
    if (done.indexOf(m.claimId) >= 0) return 0
    done.push(m.claimId)
    await kv.put(DONE_KEY(uid), JSON.stringify(done.slice(-MAX_DONE)))
  }

  const box = await readBox(kv, uid)
  // 同一封活动信不重复入箱
  if (m.claimId && box.some((x) => x.claimId === m.claimId)) return 0

  box.unshift(m)
  await writeBox(kv, uid, box.slice(0, MAX_MAIL))
  return 1
}

/** 取出可领取的附件信件；已领过的过滤掉 */
export async function pending(kv, uid) {
  const box = await readBox(kv, uid)
  const done = await readDone(kv, uid)
  return box.filter((m) => m.kind === 'attach' && m.dust > 0 && done.indexOf('c:' + m.id) < 0)
}

/**
 * 领取附件。返回 { ok, dust } 或 { ok:false, reason }。
 * 领取记录与发奖由调用方在同一流程里完成。
 */
export async function claim(kv, uid, mailId) {
  const id = String(mailId || '')
  if (!id) return { ok: false, reason: 'bad_id' }

  const box = await readBox(kv, uid)
  const mail = box.find((m) => m.id === id)
  if (!mail) return { ok: false, reason: 'gone' }

  // 先看领取记录：领过的信会被降级成普通信，
  // 若先判「有没有附件」就会把「已经领过」误报成「没有附件」。
  const done = await readDone(kv, uid)
  const key = 'c:' + id
  if (done.indexOf(key) >= 0) return { ok: false, reason: 'already' }
  if (mail.kind !== 'attach' || mail.dust <= 0) return { ok: false, reason: 'no_attach' }

  done.push(key)
  await kv.put(DONE_KEY(uid), JSON.stringify(done.slice(-MAX_DONE)))

  // 已领取的信件降级为普通信件，附件清空，箱子里不再显示可领标记
  const next = box.map((m) =>
    m.id === id ? { ...m, kind: 'text', dust: 0, claimId: '' } : m
  )
  await writeBox(kv, uid, next)

  return { ok: true, dust: mail.dust, mail }
}

/** 未读数：有可领附件的信算需要关注 */
export async function stats(kv, uid) {
  const box = await readBox(kv, uid)
  const p = await pending(kv, uid)
  return { total: box.length, claimable: p.length, dust: p.reduce((s, m) => s + m.dust, 0) }
}
