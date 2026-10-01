import { onRequestPost, onRequestGet } from './mail.js'
import { writeUser, issueToken } from './_auth.js'
import { readBox, deliver, clearBox } from './_mail.js'
import { readBook } from './_dust.js'

const mk=()=>{const m=new Map();return{get:m.get.bind(m),put:(k,v)=>m.set(k,v),delete:m.delete.bind(m),list:()=>({keys:()=>[],list_complete:true})}}
const kv=mk(); const env={LIGHTFIELD_KV:kv, AUTH_SECRET:'s'}
const ck=(c,m)=>console.log((c?'   ✓ ':'   ✗ ')+m)
const uid='u1'
await writeUser(kv,{uid,username:'测试',passwordHash:'x',salt:'s'})
const T=await issueToken(env,{uid})
const POST=(b)=>onRequestPost({request:new Request('https://x/api/mail',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+T},body:JSON.stringify(b)}),env}).then(async r=>({s:r.status,b:await r.json().catch(()=>({}))}))

console.log('① 准备 4 封信：2 封纯通知、1 封已领的附件、1 封未领的附件')
await deliver(kv,uid,{id:'m1',kind:'text',title:'国庆公告',body:'内容',icon:'📢'})
await deliver(kv,uid,{id:'m2',kind:'text',title:'新手指南',body:'内容',icon:'📖'})
await deliver(kv,uid,{id:'m3',claimId:'c:gift1',kind:'attach',title:'国庆礼包',body:'50 光尘',icon:'🎁',dust:50})
await deliver(kv,uid,{id:'m4',claimId:'c:gift2',kind:'attach',title:'未领取的奖励',body:'30 光尘',icon:'🎁',dust:30})
// 先把 m3 领掉
let r=await POST({action:'claim',id:'m3'})
ck(r.b.ok && r.b.dust===50,'先领掉 m3，拿到 50 光尘')
ck((await readBook(kv,uid)).bal===50,'账本 50')
ck((await readBox(kv,uid)).length===4,'领了之后信还在（4 封）')

console.log('\n② 清空')
r=await POST({action:'clear'})
ck(r.s===200 && r.b.ok,'清空请求成功')
ck(r.b.removed===3,'删掉 3 封（2 通知 + 1 已领附件），实际 '+r.b.removed)
ck(Array.isArray(r.b.kept) && r.b.kept.length===1,'保留 1 封')
ck(r.b.kept[0] && r.b.kept[0].id==='m4','保留的是未领取的那封：'+(r.b.kept[0]&&r.b.kept[0].title))
ck(r.b.kept[0] && r.b.kept[0].dust===30,'并告诉前端它值 30 光尘')

console.log('\n③ 清空后信箱状态')
const box=await readBox(kv,uid)
ck(box.length===1,'信箱只剩 1 封')
ck(box[0].id==='m4','就是那封未领取的')

console.log('\n④ 保留下来的福利仍然能领')
r=await POST({action:'claim',id:'m4'})
ck(r.b.ok && r.b.dust===30,'领到了 30 光尘（没被清掉就丢）')
ck((await readBook(kv,uid)).bal===80,'账本 50+30=80，实际 '+(await readBook(kv,uid)).bal)

console.log('\n⑤ 全领完后再清空，应该能清干净')
r=await POST({action:'clear'})
ck(r.b.removed===1,'删掉最后 1 封')
ck((await readBox(kv,uid)).length===0,'信箱空了')

console.log('\n⑥ 空信箱重复清空不报错')
r=await POST({action:'clear'})
ck(r.s===200 && r.b.ok===true,'200')
ck(r.b.removed===0,'removed=0')
ck(r.b.total===0,'total=0')

console.log('\n⑦ 未登录不能清')
const anon=await onRequestPost({request:new Request('https://x/api/mail',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'clear'})}),env})
ck(anon.status===401,'401')

console.log('\n⑧ 附件 dust 为 0 的信可以被清（本来就没东西可领）')
await deliver(kv,uid,{id:'m5',kind:'attach',title:'空附件',body:'x',icon:'📎',dust:0})
r=await POST({action:'clear'})
ck(r.b.removed===1 && r.b.kept.length===0,'dust=0 的附件被清掉了')
