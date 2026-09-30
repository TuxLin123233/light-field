// 用认领码管理「我自己的作品」：列出 / 删除。
// 认领码是持有者凭证，KV 里只存哈希；owner 字段绝不对外暴露。
import { readAllHistory, removeByTime } from '../_history.js'
import { claimHash, bumpWorks } from './claim.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
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

  const hash = await claimHash(body && body.code)
  if (!hash) return json({ error: '认领码无效' }, 400)

  const action = (body && body.action) || 'list'

  if (action === 'list') {
    const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
    const mine = entries
      .filter((e) => e && e.owner === hash)
      .map((e) => ({
        time: e.time,
        workName: e.workName || '',
        author: e.author || '',
        size: e.size === 32 || e.size === 64 ? e.size : 16,
        type: e.type,
        likes: e.likes || 0,
      }))
      .sort((a, b) => b.time - a.time)
    return json({ ok: true, works: mine, total: mine.length })
  }

  if (action === 'delete') {
    const time = Number(body.time)
    if (!Number.isFinite(time) || time <= 0) return json({ error: '缺少作品时间戳' }, 400)

    const { entries } = await readAllHistory(env.LIGHTFIELD_KV)
    const target = entries.find((e) => e && e.time === time)
    if (!target) return json({ error: '作品不存在或已被删除' }, 404)
    if (target.owner !== hash) {
      return json({ error: '只能用认领码删除自己的作品' }, 403)
    }

    await removeByTime(env.LIGHTFIELD_KV, time)
    await bumpWorks(env.LIGHTFIELD_KV, hash, -1)
    return json({ ok: true, time })
  }

  return json({ error: '未知操作' }, 400)
}
