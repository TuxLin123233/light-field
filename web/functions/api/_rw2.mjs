import { onRequestGet } from './reward.js'
import { writeUser, issueToken } from './_auth.js'
import { appendEntry } from './_history.js'
import { contestInfo, mondayStart, WEEK_MS } from './_contest.js'
import { dayStamp } from './_dust.js'
import { TZ } from './_contest.js'

const mk=()=>{const m=new Map();return{get:m.get.bind(m),put:(k,v)=>m.set(k,v),delete:m.delete.bind(m),list:()=>({keys:()=>[...m.keys()],list_complete:true})}}
const kv=mk(); const env={LIGHTFIELD_KV:kv, AUTH_SECRET:'s'}
const ck=(c,m)=>console.log((c?'   ✓ ':'   ✗ ')+m)
const GET=(q,t)=>onRequestGet({request:new Request('https://x/api/reward'+q,{headers:t?{Authorization:'Bearer '+t}:{}}),env}).then(async r=>({s:r.status,b:await r.json().catch(()=>({__t:'not json'}))}))
const px=()=>{const a=[];for(let i=0;i<256;i++)a.push([i%256,(i*3)%256,9]);return a}

const week=contestInfo().week
const now=Date.now()
const dayStart=(now + TZ) - ((now + TZ) % 86400000) - TZ
const monday=mondayStart()
// 6 个用户，各有作品
const uids=[]
for(let i=0;i<6;i++){
  const uid='u'+(i+1); uids.push(uid)
  await writeUser(kv,{uid,username:'画师'+(i+1),passwordHash:'x',salt:'s'})
}
// 今日作品（冲日榜）
for(let i=0;i<6;i++){
  await appendEntry(kv,{time:dayStart+3600_000+i*1000, pixels:px(), size:16, ownerUser:uids[i], ownerName:'画师'+(i+1), author:'画师'+(i+1), workName:'日'+i, likes:10-i})
}
// 本周参赛（冲周榜，按票数）
for(let i=0;i<6;i++){
  await appendEntry(kv,{time:monday+3600_000+i*1000, pixels:px(), size:16, ownerUser:uids[i], ownerName:'画师'+(i+1), author:'画师'+(i+1), workName:'周'+i, contest:week, contestVotes:20-i, likes:10-i})
}
const T=await issueToken(env,{uid:uids[0]})

console.log('① 每日榜')
let r=await GET('?type=daily')
ck(r.s===200,'200（之前能 500 吗?）')
ck(Array.isArray(r.b.board),'board 是数组')
ck(r.b.board.length===6,'6 人上榜（实际 '+r.b.board.length+'）')
console.log('   ', JSON.stringify(r.b.board[0]))
ck(r.b.board[0].name==='画师1','带上了用户名')
ck(r.b.board[0].uid===uids[0],'带上了 uid（前端要靠它取头像）')
ck(r.b.board[0].mine===true,'标出了「我」是谁')
ck(r.b.board[1].mine===false,'别人不是 mine')
ck(r.b.board[0].score>=r.b.board[1].score,'按分数降序')

console.log('\n② 每周榜（这条之前是 500）')
r=await GET('?type=weekly')
ck(r.s===200,'200 —— .week.week 的 bug 已修')
ck(Array.isArray(r.b.board),'board 是数组')
ck(r.b.board.length===6,'6 人上榜')
ck(r.b.board[0].name==='画师1','带上了用户名')
ck(!!r.b.prevPeriod,'prevPeriod 正常：'+r.b.prevPeriod)
ck(r.b.theme,'带上了本周主题：'+r.b.theme)

console.log('\n③ 不传 token 也能看榜（公开）')
r=await GET('?type=daily')
ck(r.s===200 && r.b.board.length===6,'免登录可看')
ck(r.b.board.every(x=>x.mine===false),'没有 mine 标记')

console.log('\n④ 我的奖励（要登录）')
ck((await GET('?type=my')).s===401,'未登录 401')
r=await GET('?type=my',T)
ck(r.s===200 && r.b.ok,'登录后可看')
ck(Array.isArray(r.b.awards),'awards 是数组')

console.log('\n⑤ 没配 KV')
const bad=await onRequestGet({request:new Request('https://x/api/reward'),env:{}})
ck(bad.status===500,'500')

console.log('\n⑥ 空榜不炸')
const kv2=mk()
const r2=await onRequestGet({request:new Request('https://x/api/reward?type=daily'),env:{LIGHTFIELD_KV:kv2,AUTH_SECRET:'s'}})
ck(r2.status===200 && (await r2.json()).board.length===0,'空榜 200 且为空')
