import { onRequestPost as dustPost } from './dust.js'
import { onRequestPost as contestPost, onRequestGet as contestGet } from './contest.js'
import { appendEntry } from './_history.js'
import { writeUser, issueToken } from './_auth.js'

const mk=()=>{const m=new Map();return{get:m.get.bind(m),put:(k,v)=>m.set(k,v),delete:m.delete.bind(m),list:()=>({keys:()=>[...m.keys()]})}}
const kv=mk()
const author='u_author', voter='u_voter'
await writeUser(kv,{uid:author,username:'作者',passwordHash:'x',salt:'s'})
await writeUser(kv,{uid:voter,username:'投票人',passwordHash:'x',salt:'s'})
// token 是 HMAC 签名的，测试里用同一个 secret 现场签一个
const env={LIGHTFIELD_KV:kv, AUTH_SECRET:'unit-test-secret'}
const T1=await issueToken(env,{uid:voter})

// 一张相机作品、一张手绘作品，都属于本周主题
const now=Date.now()
const camT=now-3600_000, handT=now-1800_000
const {contestInfo}=await import('./_contest.js')
const week=contestInfo().week
const px=()=>{const a=[];for(let i=0;i<256;i++)a.push([i%256,(i*2)%256,9]);return a}
await appendEntry(kv,{time:camT, pixels:px(), size:16, ownerUser:author, ownerName:'作者', author:'作者', workName:'相机图', fromImage:true, contest:week, contestVotes:0, likes:0})
await appendEntry(kv,{time:handT, pixels:px(), size:16, ownerUser:author, ownerName:'作者', author:'作者', workName:'手绘图', contest:week, contestVotes:0, likes:0})

const hdr=(t)=>({headers:{Authorization:'Bearer '+t},method:'POST'})
const ck=(c,m)=>console.log((c?'   ✓ ':'   ✗ ')+m)
const J=async(r)=>({status:r.status, body:await r.json().catch(()=>({}))})

console.log('① 相机作品不能送光尘:')
let r=await J(await dustPost({request:new Request('https://x/api/dust',{...hdr(T1),body:JSON.stringify({action:'give',time:camT})}),env}))
ck(r.status===400,'接口拒绝（'+r.status+'）')
ck(r.body.reason==='fromImage','原因标记 fromImage')
ck(/不支持送光尘/.test(r.body.error||''),'提示文案：'+r.body.error)

console.log('\n② 手绘作品可以送光尘:')
r=await J(await dustPost({request:new Request('https://x/api/dust',{...hdr(T1),body:JSON.stringify({action:'give',time:handT})}),env}))
ck(r.status===200 && r.body.ok===true,'放行（'+r.status+'）')
ck(r.body.credited===1,'光尘已转给作者（credited='+r.body.credited+'）')

console.log('\n③ 相机作品不能投票:')
r=await J(await contestPost({request:new Request('https://x/api/contest',{...hdr(T1),body:JSON.stringify({time:camT,vid:T1})}),env}))
ck(r.status===400,'接口拒绝（'+r.status+'）')
ck(/不参加主题赛/.test(r.body.error||''),'提示文案：'+r.body.error)

console.log('\n④ 手绘作品能投票:')
r=await J(await contestPost({request:new Request('https://x/api/contest',{...hdr(T1),body:JSON.stringify({time:handT,vid:T1})}),env}))
ck(r.status===200 && r.body.ok===true,'放行（'+r.status+'）')
ck(r.body.votes===1,'票数 +1（'+r.body.votes+'）')

console.log('\n⑤ 参赛列表带上 fromImage（前端要靠它置灰按钮）:')
const g=await contestGet({request:new Request('https://x/api/contest?week='+week),env})
const body=await g.json()
const camW=body.works.find(w=>w.time===camT)
ck(!!camW && camW.fromImage===true,'相机作品标了 fromImage')
const handW=body.works.find(w=>w.time===handT)
ck(!!handW && !handW.fromImage,'手绘作品没标（不会被误置灰）')
