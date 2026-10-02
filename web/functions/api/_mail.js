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
 * 清空信箱，但**未领取的附件必须留着**。
 *
 * 为什么不能一股脑清掉：附件是发出去的真实光尘（国庆礼包、活动奖励），
 * 用户没来得及点「领取」就消失，等于白送的东西没了。所以这里只清
 * 「纯通知」和「已经领过的附件」，剩下的原样保留，并在返回值里
 * 告诉前端留了几封、为什么留。
 */
export async function clearBox(kv, uid) {
  const box = await readBox(kv, uid)
  if (!box.length) return { removed: 0, kept: [], total: 0 }
  const done = await readDone(kv, uid)
  const kept = []
  const dropped = []
  for (const m of box) {
    const claimed = m.claimId ? done.indexOf('c:' + m.id) >= 0 : false
    const hasReward = m.kind === 'attach' && m.dust > 0
    // 还没领的附件 → 留着
    if (hasReward && !claimed) kept.push(m)
    else dropped.push(m)
  }
  if (dropped.length) await writeBox(kv, uid, kept)
  return {
    removed: dropped.length,
    total: box.length,
    kept: kept.map((m) => ({ id: m.id, title: m.title, dust: m.dust })),
  }
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

/* -------------------- 活动信件 --------------------
   这里的每一项都是「一次性信件」：claimId 保证同一个人只会收到一次，
   所以这个函数可以放心地在每次登录时调用，重放也不会刷出第二封。
   往后要发活动，往这个数组里加一条即可，不用改别处。 */

export const OFFERS = [
  {
    id: 'national-day-2026',
    claimId: 'welcome-gift-2026',
    kind: 'attach',
    icon: '🎉',
    title: '国庆快乐，附赠 20 个光尘',
    body: '感谢你来到像素小镇。\n这份光尘是我们的一点心意，去社区看看，给喜欢的画送上一份认可吧。\n（换设备登录同一账号，光尘会跟着你走）',
    dust: 20,
  },
  {
    id: 'announce-2026',
    claimId: 'announce-2026',
    kind: 'text',
    icon: '📢',
    title: '国庆更新说明',
    body:
      '这次国庆攒了不少东西，一次性交代清楚：\n' +
      '· 20 套配色主题，新增 6 套夜间系和 7 套浅色系，底部导航透明度可自由调节\n' +
      '· 18 种提示音效，设置里一键开关\n' +
      '· 「我的」上线：每日签到攒连续天数和徽章，创作数据一目了然\n' +
      '· 「发现」随机翻出一件旧作品，让埋掉的好东西重见天日\n' +
      '· 内容安全机制：作品可举报，维护者后台可核实处理\n' +
      '· 导航栏全面自定义：启动页、位置、顺序、6 款样式\n' +
      '· 像素相机、新手教程、可装到桌面离线使用\n' +
      '另外还修了联机同步、手型工具误画、深色模式文字看不清等问题，细节见更新日志。',
    dust: 0,
  },
  {
    id: 'how-to-2026',
    claimId: 'guide-2026',
    kind: 'text',
    icon: '🧭',
    title: '新手指南：光尘怎么花',
    body: '· 每天登录后去「我的」签到，得 5 个光尘\n· 连续签到到 3/7/15/30… 天会额外奖励，数额等于天数\n· 在社区点「✨ 送光尘」给喜欢的作品，一幅只能送一次\n· 别人送你的光尘也会进你的账本，「我的」页能看到累计收到\n· 光尘和成就都存在服务器上，换设备登录同一账号即可同步',
    dust: 0,
  },
  {
    /* 这一封排在数组最后是有意的：deliver 用的是 unshift，
       最后投的那封会出现在信箱最上面。 */
    id: 'town-open-2026',
    claimId: 'town-open-gift-2026',
    kind: 'attach',
    icon: '🏘️',
    title: '小镇开张了，随信附上 100 个光尘',
    body:
      '这回攒的东西有点多，一次跟你说清楚：\n' +
      '· 🏘️ 底部多了「小镇」：镇上一排排小屋，点谁家的房子就去谁家串门\n' +
      '· 🪑 屋里的家具铺上了 104 件，从 8 个光尘的蜡烛到 200 个光尘的王座\n' +
      '· 🧱 墙纸和地板一共 50 款，买下自动换上，不用自己贴\n' +
      '· 📐 屋子住久了能扩建：16×16 → 24×24 → 32×32，家具会跟着地板线一起挪，不用重摆\n' +
      '· 💬 聊天不再只能打字：能送光尘、能画张涂鸦、能分享自己的画，还能猜拳押光尘\n' +
      '· 🏅 成就扩到 153 个，尾巴拉得很长，够追上一阵子\n' +
      '· 🎂 个人信息里可以填性别和生日，生日当天小镇另外再送你 100 个光尘\n' +
      '这 100 个，就当是小镇给你的乔迁礼。去挑件家具，把屋子收拾起来吧。',
    dust: 100,
  },
  {
    /* 这一封同样排在数组最后：deliver 用 unshift，会出现在信箱最上面。
       上一封（小镇开张）之后攒的东西一次说清楚。 */
    id: 'gravity-2026',
    claimId: 'gravity-2026',
    kind: 'text',
    icon: '⏳',
    title: '像素重力来了 · 附近期改动',
    body:
      '画板多了第三个方向，另外几件攒着的也说一声：\n' +
      '· ⏳ 像素重力：在画布上点一下撒一把，颗粒自己往下掉。落到下面有东西就斜着滑开，所以堆出来是有坡度的沙堆，不是一根直柱子。堆稳了可以「🫂 抖一抖」，沙坡会塌得更紧实\n' +
      '· 🎨 像素重力可以和另外两个方向来回切，颜色共用同一个 —— 在哪边换过色，切过去都认得\n' +
      '· 🪑 家具从 116 件扩到 636 件：墨玉 / 深海 / 樱花 / 鎏金 / 幽林 五套配色主题，「木凳 · 墨玉」和「木凳 · 鎏金」是真的两种颜色\n' +
      '· 🖐️ 家具能拖着挪位置了，落点不合适会告诉你为什么并弹回原位\n' +
      '· 🪟 墙上那扇小窗，窗外天气能自己挑：跟随现实 / 晴 / 多云 / 雨 / 雪 / 清晨 / 黄昏 / 夜\n' +
      '· 🐾 头像能一键换成系统默认的，换过去不要光尘，换回来也不要。默认头像按你的账号算，一共 3888 种\n' +
      '· 💴 赞赏页的收款码加上了支付宝\n' +
      '这次没附光尘，就是来通知一声 —— 好戏都在画板上。',
    dust: 0,
  },
]

/**
 * 把所有还没投过的活动信件投进信箱。
 * 幂等：已投过的 claimId 会被跳过，重复调用安全。
 * 返回本次新投递的件数。
 */
export async function ensureOffers(kv, uid) {
  if (!kv || !uid) return 0
  let n = 0
  for (const offer of OFFERS) {
    const got = await deliver(kv, uid, { ...offer, time: Date.now() })
    if (got > 0) n += got
  }
  return n
}

/* -------------------- 后台发布的信件（广播） --------------------
   维护者在后台写一封公告或奖励，存进 admail 这个列表。
   所有账号下次打开信箱时会自动收到 —— **包括这封信发布之后才注册的新号**，
   所以发布时不需要遍历全部用户（那样既慢，又会漏掉后来的人）。
   每封信的 claimId 就是它的 id，同一个人只会收到一次，重复调用安全。 */

export const ADMIN_MAIL_KEY = 'admail'
export const MAX_ADMIN_MAILS = 30

export async function readAdminMails(kv) {
  if (!kv) return []
  const raw = await kv.get(ADMIN_MAIL_KEY)
  try {
    const a = JSON.parse(raw || '[]')
    return Array.isArray(a) ? a : []
  } catch (e) {
    return []
  }
}

export async function writeAdminMails(kv, list) {
  const clean = (Array.isArray(list) ? list : []).slice(0, MAX_ADMIN_MAILS)
  await kv.put(ADMIN_MAIL_KEY, JSON.stringify(clean))
  return clean
}

/** 把这批广播信投进指定用户的信箱；已经收到过的会跳过 */
export async function ensureAdminMails(kv, uid) {
  if (!kv || !uid) return 0
  const list = await readAdminMails(kv)
  if (!list.length) return 0
  let n = 0
  for (const m of list) {
    if (!m || !m.id) continue
    const got = await deliver(kv, uid, {
      id: 'adm-' + m.id,
      claimId: 'adm-' + m.id,
      kind: Number(m.dust) > 0 ? 'attach' : 'text',
      icon: m.icon || '📢',
      title: m.title,
      body: m.body,
      dust: Number(m.dust) || 0,
      time: Number(m.time) || Date.now(),
    })
    if (got > 0) n += got
  }
  return n
}
