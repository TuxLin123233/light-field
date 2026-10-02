/**
 * 朋友圈九宫格 —— 3×3 正方形图，每张 1080×1080。
 *
 * 和 design-spec 的区别：
 *  - **不出现任何专业术语**：没有类名、没有 hex 色值、没有「规范」字样
 *  - 每格一个卖点，标题是给人看的白话
 *  - 正方形，微信朋友圈九宫格直接用
 */
import fs from 'fs'
const SRCT = '/home/tux/编程/光域/web/public/views/town.js'
const CSS = fs.readFileSync('.tiles/all.css', 'utf8')
const { defaultPixels } = await import('/home/tux/编程/光域/web/functions/api/_avatar.js')
const { FURNITURE, SURFACES, PAL, THEMES, THEME_PAL, sanitizeItems, emptyHouse } =
  await import('/home/tux/编程/光域/web/functions/api/_town.js')

const NAMES = ('alice bob carol dave erin frank grace heidi ivan judy mallory niaj olivia peggy quinn rupert ' +
  'sybil trent uma victor wendy xavier yuki zara 阿光 小林 星野 墨白 青禾 长风 拾光 半夏 木鱼 山茶 ' +
  'nori pico bit pixel dot byte cube voxel sprite tile chip node mesh glitch retro arcade ' +
  'nova luna stella orion vega comet nebula cosmos').split(' ')
const avatars = NAMES.map((n) => defaultPixels(n))
const score = (f) => new Set(f.art.join('').split('')).size
const furn = [...FURNITURE].sort((a, b) => score(b) - score(a)).slice(0, 60).map((f) => ({ art: f.art, pal: f.pal || null }))
const src = fs.readFileSync(SRCT, 'utf8')
function blockAt(i) { const b = src.indexOf('{', i); let d = 0; for (let j = b; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1) } } }
fs.writeFileSync('web/tools/design-spec/_s.mjs', blockAt(src.indexOf('function surfaceTile')) + '\nexport { surfaceTile }')
const { surfaceTile } = await import('./_s.mjs'); fs.unlinkSync('web/tools/design-spec/_s.mjs')
const surfaces = SURFACES.map((s) => ({ tile: surfaceTile(s, 16, 0).map((r) => r.join('')) }))
const grab = (n) => blockAt(src.indexOf('function ' + n + '('))

const winCode = [grab('windowRect'), grab('drawWindow'), blockAt(src.indexOf('const SKY = {')), 'const ROOM = 16', 'let wxT = 4'].join('\n')
const roomCode = [blockAt(src.indexOf('const artSize =')), blockAt(src.indexOf('const findItem =')),
  blockAt(src.indexOf('const surfaceOf =')), grab('surfaceTile'), grab('drawArt'), grab('drawRoom')].join('\n')

const LAYOUT = [
  { id: 'poster__gold', x: 1, y: 1 }, { id: 'clock__ink', x: 6, y: 1 }, { id: 'banner__sakura', x: 1, y: 5 },
  { id: 'bed2__sea', x: 1, y: 9 }, { id: 'nightstand__sea', x: 8, y: 9 }, { id: 'lamp__gold', x: 12, y: 9 },
  { id: 'table__gold', x: 1, y: 13 }, { id: 'chair__gold', x: 6, y: 13 },
  { id: 'plant__forest', x: 9, y: 12 }, { id: 'cushion__sakura', x: 13, y: 13 },
]
const roomItems = sanitizeItems(LAYOUT, 16) || []
const roomFurn = FURNITURE.filter((f) => LAYOUT.some((l) => l.id === f.id))
const themes = THEMES.map((t) => ({ key: t.key, name: t.name, pal: THEME_PAL[t.key] || {} }))
const DATA = { avatars, furn, surfaces, pal: PAL, themes, roomFurn, roomItems }

const TILE = 540   // 逻辑尺寸，渲染 2x → 1080
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<style>${CSS}</style>
<style>
html, body { display: block !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important;
  background: #efece6 !important; overflow: visible !important; }
* { box-sizing: border-box; }
body { font-family: "HarmonyOS Sans SC", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; }
.grid { display: grid; grid-template-columns: repeat(3, ${TILE}px); grid-auto-rows: ${TILE}px; gap: 0; }
.tile { width: ${TILE}px; height: ${TILE}px; padding: 34px 32px 30px; position: relative; overflow: hidden;
  display: flex; flex-direction: column; background: #fdfbf6; }
.tile.alt { background: #fff; }
.tile .ico { font-size: 34px; line-height: 1; }
.tile h3 { margin: 8px 0 0; font-size: 30px; font-weight: 900; color: #3b342c; letter-spacing: .5px; }
.tile p { margin: 6px 0 0; font-size: 15px; color: #8c7f6b; line-height: 1.55; }
/* 底部留 56px 给页脚，不留的话内容会压到「像素小镇」那一行上 */
.tile .body { flex: 1; margin-top: 14px; padding-bottom: 56px; display: flex; flex-wrap: wrap; align-content: flex-start; overflow: hidden; }
.tile .foot { position: absolute; left: 32px; right: 32px; bottom: 20px; font-size: 12.5px; color: #b0a697;
  display: flex; align-items: center; justify-content: space-between; }
.tile .foot b { color: #5b8def; font-weight: 700; }
.a { width: 46px; height: 46px; border-radius: 9px; background: #f4f1ec; display: flex; align-items: center;
  justify-content: center; margin: 0 5px 5px 0; }
.a canvas { width: 38px; height: 38px; image-rendering: pixelated; display: block; }
.f { width: 40px; height: 40px; border-radius: 8px; background: #f4f1ec; display: flex; align-items: center;
  justify-content: center; margin: 0 5px 5px 0; }
.f canvas { image-rendering: pixelated; display: block; }
.s { width: 38px; height: 38px; border-radius: 8px; overflow: hidden; margin: 0 5px 5px 0; }
.s canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
.w { border-radius: 10px; background: #fff; border: 1px solid #efe7da; padding: 6px; margin: 0 7px 7px 0; }
.w canvas { image-rendering: pixelated; display: block; }
.w span { display: block; font-size: 10px; color: #8c7f6b; text-align: center; margin-top: 3px; }
.pal { margin: 0 0 9px; }
.pal b { font-size: 13px; color: #3b342c; font-weight: 700; margin-right: 8px; }
.pal .sw { display: inline-block; width: 19px; height: 19px; border-radius: 5px; margin-right: 3px;
  vertical-align: middle; border: 1px solid rgba(0,0,0,.06); }
.badges { display: flex; flex-wrap: wrap; }
.badges > * { margin: 0 8px 8px 0; }
.roomwrap { margin-top: 2px; }
.roomwrap canvas { image-rendering: pixelated; display: block; border-radius: 10px; }
.close { background: #241f1a; color: #fff; align-items: center; justify-content: center; text-align: center; }
.close h3 { color: #fff; font-size: 40px; margin: 0; }
.close p { color: #c5baa7; font-size: 17px; margin: 12px 0 0; }
.close .u { display: inline-block; margin-top: 20px; color: #96b9ff; border: 2px solid #5b8def;
  border-radius: 999px; padding: 9px 24px; font-size: 17px; }
</style></head>
<body><div class="grid">

<div class="tile"><div class="ico">👾</div><h3>3888 种头像</h3>
<p>不用自己画。注册完系统就给你一只，每人都不一样</p>
<div class="body" id="t1"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile alt"><div class="ico">🛋️</div><h3>654 件家具</h3>
<p>摆进自己的小屋，按住就能拖着挪</p>
<div class="body" id="t2"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile"><div class="ico">🧱</div><h3>50 种墙纸地毯</h3>
<p>贴墙上、铺地上，屋子立刻换个样子</p>
<div class="body" id="t3"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile alt"><div class="ico">🏠</div><h3>一间自己的小屋</h3>
<p>16×16 起步，住久了能扩到大院子</p>
<div class="body" id="t4"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile"><div class="ico">🌤️</div><h3>窗外的天气自己挑</h3>
<p>雨是斜着赶的雨丝，雪是慢慢飘的白点<br>不挑也行，会跟着现实时间自己变</p>
<div class="body" id="t5"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile alt"><div class="ico">🎨</div><h3>三种画法</h3>
<p>逐格涂、按住喷、撒一把让颗粒自己堆</p>
<div class="body" id="t6"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile"><div class="ico">🌈</div><h3>五套配色</h3>
<p>同一件家具，换个配色就是另一件</p>
<div class="body" id="t7"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile alt"><div class="ico">🏆</div><h3>154 个成就</h3>
<p>签到、画画、串门都能解锁，攒光尘换家具</p>
<div class="body" id="t8"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile close"><div>
<h3>完全免费<br>没有广告</h3>
<p>不用邮箱，不用手机号<br>浏览器打开就能画</p>
<span class="u">light-field.pages.dev</span>
</div></div>

</div>
<script>
const DATA = ${JSON.stringify(DATA)}, PAL = DATA.pal;
${winCode}
${roomCode}
const cat = { furniture: DATA.roomFurn, surfaces: [] };
const house = { size: 16, wall: 'w_plain_warm', floor: 'f_wood_oak', items: DATA.roomItems, weather: 'snow' };
const floorY = 8; let mine = false, picked = null, dragOn = false, _roomCv = null;
const curWeather = () => 'snow';
const $ = (id) => (id === 'twRoom' ? _roomCv : null);

function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function px16(c,px){const g=c.getContext('2d');for(let y=0;y<16;y++)for(let x=0;x<16;x++){const q=px[y*16+x]||[255,255,255];g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';g.fillRect(x,y,1,1)}}
const put=(id,n)=>document.getElementById(id).appendChild(n);

/* 1 头像 25 只 */
DATA.avatars.slice(0,25).forEach(px=>{const d=document.createElement('div');d.className='a';const c=cv(16,16);px16(c,px);d.appendChild(c);put('t1',d)});

/* 2 家具 36 件 */
DATA.furn.slice(0,36).forEach(f=>{const d=document.createElement('div');d.className='f';
 const aw=Math.max(...f.art.map(r=>r.length)),ah=f.art.length;
 const c=cv(aw,ah),g=c.getContext('2d'),pal=f.pal||PAL;
 for(let y=0;y<ah;y++)for(let x=0;x<f.art[y].length;x++){const ch=f.art[y][x];if(ch==='.'||!pal[ch])continue;const q=pal[ch];g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';g.fillRect(x,y,1,1)}
 const sc=Math.max(1,Math.min(Math.floor(32/aw),Math.floor(32/ah)));
 c.style.width=(aw*sc)+'px';c.style.height=(ah*sc)+'px';d.appendChild(c);put('t2',d)});

/* 3 墙纸地毯 30 种 */
DATA.surfaces.slice(0,24).forEach(s=>{const d=document.createElement('div');d.className='s';
 const c=cv(16,16),g=c.getContext('2d');
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const q=PAL[s.tile[y][x]];if(!q)continue;g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';g.fillRect(x,y,1,1)}
 d.appendChild(c);put('t3',d)});

/* 4 小屋 */
(function(){const S=11;const tmp=cv(16,16);_roomCv=tmp;drawRoom();
 const big=cv(16*S,16*S),g=big.getContext('2d');g.imageSmoothingEnabled=false;
 g.drawImage(tmp,0,0,16,16,0,0,16*S,16*S);
 big.style.width=(16*S)+'px';big.style.height=(16*S)+'px';
 const w=document.createElement('div');w.className='roomwrap';w.appendChild(big);put('t4',w)})();

/* 5 天气 8 种 */
['sunny','cloudy','rain','snow','dawn','dusk','night'].forEach((k,i)=>{
 const N={sunny:'晴',cloudy:'多云',rain:'雨',snow:'雪',dawn:'清晨',dusk:'黄昏',night:'夜'};
 const d=document.createElement('div');d.className='w';const S=9;
 const tmp=cv(16,16),tg=tmp.getContext('2d');drawWindow(tg,k);
 const wr=windowRect();
 const c=cv(wr.w+2,wr.h+2),g=c.getContext('2d');
 g.imageSmoothingEnabled=false;
 g.drawImage(tmp,wr.x-1,wr.y-1,wr.w+2,wr.h+2,0,0,wr.w+2,wr.h+2);
 c.style.width=((wr.w+2)*S)+'px';c.style.height=((wr.h+2)*S)+'px';
 d.appendChild(c);const s=document.createElement('span');s.textContent=N[k];d.appendChild(s);put('t5',d)});

/* 6 三种画法 */
(function(){const W=['🖌️ 逐格涂','💨 按住喷','⏳ 撒一把'];
 W.forEach((label,i)=>{
  const d=document.createElement('div');d.style.cssText='width:100%;display:flex;align-items:center;margin-bottom:10px';
  const n=[16,32,32][i],c=cv(n,n),g=c.getContext('2d');
  g.fillStyle='#fff';g.fillRect(0,0,n,n);
  g.fillStyle='#e3d9c8';
  const st=n<=16?4:n<=32?8:16;
  for(let k=0;k<n;k+=st){g.fillRect(k,0,1,n);g.fillRect(0,k,n,1)}
  const box=document.createElement('div');box.style.cssText='width:86px;height:86px;border:1px solid #efe7da;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#fff;flex:none';
  c.style.cssText='width:68px;height:68px;image-rendering:pixelated';
  box.appendChild(c);d.appendChild(box);
  const t=document.createElement('div');t.style.cssText='margin-left:18px;font-size:20px;font-weight:700;color:#3b342c';
  t.textContent=label;d.appendChild(t);
  const t2=document.createElement('div');t2.style.cssText='margin-left:auto;font-size:14px;color:#b0a697';
  t2.textContent=n+'×'+n;d.appendChild(t2);
  put('t6',d)})})();

/* 7 五套配色 */
DATA.themes.forEach(t=>{
 const d=document.createElement('div');d.className='pal';d.style.width='100%';
 const b=document.createElement('b');b.textContent=t.name;d.appendChild(b);
 Object.keys(t.pal).forEach(k=>{const q=t.pal[k];const s=document.createElement('i');s.className='sw';
  s.style.background='rgb('+q[0]+','+q[1]+','+q[2]+')';d.appendChild(s)});
 put('t7',d)});

/* 8 徽章 */
[['新功能','li-tag tag-new'],['修复','li-tag tag-fix'],['更新','li-tag tag-update'],['界面','li-tag tag-ui']]
 .forEach(([t,c])=>{const s=document.createElement('span');s.className=c;s.textContent=t;put('t8',s)});
[['🎞️ 动画','anim-badge'],['👥 多人','room-badge'],['🖼️ 来自图片','img-badge'],['像素','card-tag']]
 .forEach(([t,c])=>{const s=document.createElement('span');s.className=c;s.textContent=t;put('t8',s)});
(function(){const s=document.createElement('span');s.className='ver-tag';s.textContent='v1.7.6';put('t8',s);
 const n=document.createElement('span');n.className='ml-num';n.textContent='3';put('t8',n);
 const l=document.createElement('button');l.className='like-btn';l.type='button';l.textContent='❤️ 12';put('t8',l)})();
</script></body></html>`
fs.writeFileSync('.tiles/tiles.html', html)
console.log('  ✓ tiles.html  ' + (html.length / 1024).toFixed(0) + ' KB')
