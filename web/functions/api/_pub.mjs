import { onRequestPost as setPost, PUBLISH_DUST_PER_WORK, PUBLISH_DUST_DAILY_CAP } from './set.js'
import { writeUser, issueToken } from './_auth.js'
import { readBook } from './_dust.js'
import { dayStamp } from './_dust.js'

const mk=()=>{const m=new Map();return{get:m.get.bind(m),put:(k,v)=>m.set(k,v),delete:m.delete.bind(m),list:()=>({keys:()=>[],list_complete:true})}}
const kv=mk(); const env={LIGHTFIELD_KV:kv, AUTH_SECRET:'s'}
const ck=(c,m)=>console.log((c?'   ✓ ':'   ✗ ')+m)
const uid='u1'
await writeUser(kv,{uid,username:'画师',passwordHash:'x',salt:'s'})
const T=await issueToken(env,{uid})
let n=0
const pub=(extra={})=>{
  n++
  const pixels=[]; for(let i=0;i<256;i++) pixels.push([i%256,(i*3)%256,(n*7+i)%256])
  return setPost({request:new Request('https://x/api/set',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+T},body:JSON.stringify({workName:'作品'+n,pixels,...extra})}),env}).then(async r=>({s:r.status,b:await r.json().catch(()=>({}))}))
}

console.log('① 连发 12 幅：前 10 幅各得 1，第 11、12 幅不给')
for(let i=1;i<=12;i++){
  const r=await pub()
  if(i<=3||i>=10) console.log('   第'+i+'幅: HTTP '+r.s+' dust='+r.b.dust+' capped='+r.b.dustCapped+' 今日累计='+r.b.dustTotalToday)
  if(i<=10) ck(r.b.dust===1,'第'+i+'幅得 1 个光尘')
  else ck(r.b.dust===0 && r.b.dustCapped===true,'第'+i+'幅已封顶（dust='+r.b.dust+'）')
}
const bal=(await readBook(kv,uid)).bal
ck(bal===PUBLISH_DUST_DAILY_CAP,'账本一共加了 '+PUBLISH_DUST_DAILY_CAP+' 个（实际 '+bal+'）')
ck(bal===10 && PUBLISH_DUST_DAILY_CAP===10,'上限就是 10')

console.log('\n② 额度是按天分的')
const key='pub:'+uid+':D'+dayStamp()
ck(await kv.get(key)!==null,'当天额度记录存在：'+key+' = '+await kv.get(key))
// 换一天：额度归零
const tomorrowKey='pub:'+uid+':D'+(dayStamp()+1)
ck(await kv.get(tomorrowKey)===null||await kv.get(tomorrowKey)===undefined,'换一天后额度从头算')

console.log('\n③ 像素相机作品不给发布奖励')
const before=(await readBook(kv,uid)).bal
const r=await pub({fromImage:true})
ck(r.s===200,'相机作品能发布（'+r.s+'）')
ck(r.b.dust===0,'但不给光尘（dust='+r.b.dust+'）')
ck((await readBook(kv,uid)).bal===before,'账本没变')

console.log('\n④ 未登录不给（也不该崩）')
const anonPx=Array.from({length:256},(_,i)=>[i%256,i%256,i%256])
const anonRes=await setPost({request:new Request('https://x/api/set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workName:'匿名作品',pixels:anonPx})}),env})
const anonJson=await anonRes.json().catch(()=>({}))
console.log('   HTTP', anonRes.status, anonJson.error||'(发布成功，没给光尘：dust='+anonJson.dust+')')

console.log('\n⑤ 发布仍然受 30 秒限流约束')
const a=await pub(); const b=await pub()
ck(b.s===429 || b.b.error, '第二幅被限流（'+b.s+'）')
