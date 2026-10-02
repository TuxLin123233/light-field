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
/* 水平和垂直都居中，否则内容会堆在左上角，右下留一大片空 */
.tile .body { flex: 1; margin-top: 12px; padding-bottom: 52px; display: flex; flex-wrap: wrap;
  align-content: center; justify-content: center; overflow: hidden; }
.tile .foot { position: absolute; left: 32px; right: 32px; bottom: 20px; font-size: 12.5px; color: #b0a697;
  display: flex; align-items: center; justify-content: space-between; }
.tile .foot b { color: #5b8def; font-weight: 700; }
.a { width: 47px; height: 47px; border-radius: 9px; background: #f4f1ec; display: flex; align-items: center;
  justify-content: center; margin: 0 5px 5px 0; }
.a canvas { width: 39px; height: 39px; image-rendering: pixelated; display: block; }
.f { width: 43px; height: 43px; border-radius: 8px; background: #f4f1ec; display: flex; align-items: center;
  justify-content: center; margin: 0 5px 5px 0; }
.f canvas { image-rendering: pixelated; display: block; }
.s { width: 38px; height: 38px; border-radius: 8px; overflow: hidden; margin: 0 5px 5px 0; }
.s canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
.w { border-radius: 10px; background: #fff; border: 1px solid #efe7da; padding: 6px; margin: 0 7px 7px 0; }
.w canvas { image-rendering: pixelated; display: block; }
.w span { display: block; font-size: 10px; color: #8c7f6b; text-align: center; margin-top: 3px; }
.pal { margin: 0 0 9px; }
.pal b { font-size: 13px; color: #3b342c; font-weight: 700; margin-right: 8px; }
.pal .sw { display: inline-block; width: 23px; height: 23px; border-radius: 5px; margin-right: 3px;
  vertical-align: middle; border: 1px solid rgba(0,0,0,.06); }
.badges { display: flex; flex-wrap: wrap; justify-content: center; padding: 14px 0 20px; }
/* 不要用 transform: scale —— 缩放不改变布局盒子，徽章会压住彼此的 margin，
   看着就是挤成一坨。老老实实用 margin 就行。 */
.badges > * { margin: 0 17px 12px 0; }
.badges > *:last-child { margin-right: 0; }
.roomwrap { margin-top: 2px; }
.roomwrap canvas { image-rendering: pixelated; display: block; border-radius: 10px; }
.close { background: #241f1a; color: #fff; align-items: center; justify-content: center; text-align: center; }
.close h3 { color: #fff; font-size: 40px; margin: 0; }
.close p { color: #c5baa7; font-size: 17px; margin: 12px 0 0; }
.close .u { display: inline-block; margin-top: 20px; color: #96b9ff; border: 2px solid #5b8def;
  border-radius: 999px; padding: 9px 24px; font-size: 17px; }
.close .by { margin-top: 28px; font-size: 15px; color: #8c7f6b; letter-spacing: 1.5px; }
</style></head>
<body><div class="grid">

<div class="tile"><div class="ico">👾</div><h3>3888 种头像</h3>
<p>不用自己画。注册完系统就给你一只，每人都不一样</p>
<div class="body" id="t1"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile alt"><div class="ico">🛋️</div><h3>654 件家具</h3>
<p>550 多件是配色变体，同一件换个主题就是另一件</p>
<div class="body" id="t2"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile"><div class="ico">🔘</div><h3>按钮与选择</h3>
<p>重要的实心，次要的描边；多选一都用圆角小按钮</p>
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

<div class="tile alt"><div class="ico">🎨</div><h3>所有绘画工具</h3>
<p>三种画法 · 八个工具 · 帧动画和照片转像素</p>
<div class="body" id="t6"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile"><div class="ico">🌈</div><h3>五套配色</h3>
<p>同一件家具，换个配色就是另一件</p>
<div class="body" id="t7"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile alt"><div class="ico">🃏</div><h3>卡片</h3>
<p>作品卡、数据卡、入口卡、状态徽章</p>
<div class="body" id="t8"></div>
<div class="foot"><span>像素小镇</span><b>light-field.pages.dev</b></div></div>

<div class="tile close"><div>
<h3>完全免费<br>没有广告</h3>
<p>不用邮箱，不用手机号<br>浏览器打开就能画</p>
<span class="u">light-field.pages.dev</span>
<div class="by">作者：Lin Sifan</div>
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
DATA.avatars.slice(0,48).forEach(px=>{const d=document.createElement('div');d.className='a';const c=cv(16,16);px16(c,px);d.appendChild(c);put('t1',d)});

/* 2 家具 + 墙纸：上半家具，下半墙纸地毯 */
(function(){const lab=document.createElement('div');
 lab.style.cssText='width:100%;text-align:center;font-size:12.5px;color:#8c7f6b;margin:2px 0 6px';
 lab.textContent='家具';put('t2',lab)})();
DATA.furn.slice(0,32).forEach(f=>{const d=document.createElement('div');d.className='f';
 const aw=Math.max(...f.art.map(r=>r.length)),ah=f.art.length;
 const c=cv(aw,ah),g=c.getContext('2d'),pal=f.pal||PAL;
 for(let y=0;y<ah;y++)for(let x=0;x<f.art[y].length;x++){const ch=f.art[y][x];if(ch==='.'||!pal[ch])continue;const q=pal[ch];g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';g.fillRect(x,y,1,1)}
 const sc=Math.max(1,Math.min(Math.floor(32/aw),Math.floor(32/ah)));
 c.style.width=(aw*sc)+'px';c.style.height=(ah*sc)+'px';d.appendChild(c);put('t2',d)});

/* 3 墙纸地毯 30 种 */
/* 2 下半：墙纸地毯（和第 3 格腾出来的位置换） */
(function(){const lab=document.createElement('div');
 lab.style.cssText='width:100%;text-align:center;font-size:12.5px;color:#8c7f6b;margin:8px 0 6px';
 lab.textContent='墙纸 / 地毯';put('t2',lab)})();
DATA.surfaces.slice(0,24).forEach(s=>{const d=document.createElement('div');d.className='s';
 const c=cv(16,16),g=c.getContext('2d');
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const q=PAL[s.tile[y][x]];if(!q)continue;g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';g.fillRect(x,y,1,1)}
 d.appendChild(c);put('t2',d)});

/* 3 按钮与选择 —— 分 5 组，每组一个小标题，摆满整格 */
(function(){
 const group=(title,list,cls)=>{
  const lab=document.createElement('div');
  lab.style.cssText='width:100%;text-align:center;font-size:12px;color:#8c7f6b;margin:0 0 6px';
  lab.textContent=title; put('t3',lab);
  const r=document.createElement('div');
  r.style.cssText='width:100%;display:flex;flex-wrap:wrap;justify-content:center;margin-bottom:13px';
  list.forEach(([t,c])=>{const el=document.createElement('button');el.type='button';el.className=c;el.textContent=t;
   el.style.margin='0 7px 7px 0';r.appendChild(el)});
  put('t3',r);
 };
 group('按钮', [['主要按钮','tw-btn'],['次要按钮','tw-btn ghost'],['保存布置','tw-btn']]);
 group('天气', [['🕐 跟随现实','tw-tab'],['🌧️ 雨','tw-tab on'],['☀️ 晴','tw-tab']]);
 group('画布尺寸', [['16×16','tw-tab on'],['32×32','tw-tab'],['64×64','tw-tab']]);
 // 图块按钮三个
 const lab2=document.createElement('div');
 lab2.style.cssText='width:100%;text-align:center;font-size:12px;color:#8c7f6b;margin:0 0 7px';
 lab2.textContent='家具'; put('t3',lab2);
 const row=document.createElement('div');row.style.cssText='width:100%;display:flex;justify-content:center';
 [['🪑','木凳'],['💡','台灯'],['🌿','盆栽']].forEach(([ico,nm])=>{
  const it=document.createElement('button');it.type='button';it.className='tw-item';
  it.style.margin='0 7px'; 
  const i=document.createElement('span');i.textContent=ico;i.style.cssText='font-size:24px;line-height:34px';
  it.appendChild(i);
  const t=document.createElement('span');t.textContent=nm;it.appendChild(t);
  row.appendChild(it)});
 put('t3',row);
})();

/* 4 小屋 */
(function(){const S=20;const tmp=cv(16,16);_roomCv=tmp;drawRoom();
 const big=cv(16*S,16*S),g=big.getContext('2d');g.imageSmoothingEnabled=false;
 g.drawImage(tmp,0,0,16,16,0,0,16*S,16*S);
 big.style.width=(16*S)+'px';big.style.height=(16*S)+'px';
 const w=document.createElement('div');w.className='roomwrap';w.appendChild(big);put('t4',w)})();

/* 5 天气 8 种 */
['sunny','cloudy','rain','snow','dawn','dusk','night'].forEach((k,i)=>{
 const N={sunny:'晴',cloudy:'多云',rain:'雨',snow:'雪',dawn:'清晨',dusk:'黄昏',night:'夜'};
 const d=document.createElement('div');d.className='w';const S=12;
 const tmp=cv(16,16),tg=tmp.getContext('2d');drawWindow(tg,k);
 const wr=windowRect();
 const c=cv(wr.w+2,wr.h+2),g=c.getContext('2d');
 g.imageSmoothingEnabled=false;
 g.drawImage(tmp,wr.x-1,wr.y-1,wr.w+2,wr.h+2,0,0,wr.w+2,wr.h+2);
 c.style.width=((wr.w+2)*S)+'px';c.style.height=((wr.h+2)*S)+'px';
 d.appendChild(c);const s=document.createElement('span');s.textContent=N[k];d.appendChild(s);put('t5',d)});

/* 6 所有绘画工具 —— 三种画法各配真实图案，再把八个工具和附加功能全列出来 */
(function(){
 const HEART=['..rr....rr..','.rRRr..rRRr.','rRRRRrrRRRRr','rRRRRRRRRRRr','rRRRRRRRRRRr',
              '.rRRRRRRRRr.','..rRRRRRRr..','...rRRRRr...','....rRRr....','.....rr.....'];
 const HP={r:[229,87,75],R:[170,44,38]};
 const modes=[
  ['🖌️','逐格涂','一格一格点',16,(g,n)=>{
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      // 爱心是 10 行 × 12 列，要缩放到整个 16×16，不然只画在左上角
      const hy=Math.floor(y*HEART.length/n), hx=Math.floor(x*HEART[0].length/n);
      const ch=HEART[hy]?HEART[hy][hx]:'.';
      const q=HP[ch]; if(!q)continue;
      g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')'; g.fillRect(x,y,1,1);
    }}],
  ['💨','按住喷','喷出渐变的雾',32,(g,n)=>{
    const c=n/2;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const d=Math.hypot(x-c,y-c); if(d>c)continue;
      const t=1-d/c, q=[Math.round(91+120*t),Math.round(141+80*t),Math.round(239-40*t)];
      g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';
      if((x*7+y*13)%5<1+t*4) g.fillRect(x,y,1,1);
    }}],
  ['⏳','撒一把','颗粒自己往下堆',32,(g,n)=>{
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const h=n-1-Math.floor((n-2)*(1-Math.abs(x-n/2)/(n/2)));
      if(y<h)continue;
      const t=(y-h)/Math.max(1,(n-h)), q=[Math.round(224-60*t),Math.round(180-50*t),Math.round(96-40*t)];
      g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';
      if((x*11+y*7)%7<5) g.fillRect(x,y,1,1);
    }}],
 ];
 const row1=document.createElement('div');
 row1.style.cssText='width:100%;display:flex;justify-content:center;align-items:flex-start;margin-bottom:12px';
 modes.forEach(([ico,name,desc,n,draw])=>{
  const col=document.createElement('div');col.style.cssText='width:132px;margin:0 4px;text-align:center';
  const box=document.createElement('div');
  box.style.cssText='width:102px;height:102px;margin:0 auto;border:1px solid #efe7da;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#fff';
  const c=cv(n,n),g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,n,n); draw(g,n);
  c.style.cssText='width:86px;height:86px;image-rendering:pixelated';
  box.appendChild(c); col.appendChild(box);
  const t1=document.createElement('div'); t1.style.cssText='font-size:16px;font-weight:700;color:#3b342c;margin-top:8px'; t1.textContent=ico+' '+name; col.appendChild(t1);
  const t2=document.createElement('div'); t2.style.cssText='font-size:11.5px;color:#8c7f6b;margin-top:3px'; t2.textContent=desc+' · '+n+'×'+n; col.appendChild(t2);
  row1.appendChild(col);
 });
 put('t6',row1);
 // 八个工具
 const lab=document.createElement('div');
 lab.style.cssText='width:100%;text-align:center;font-size:12px;color:#8c7f6b;margin:0 0 7px';
 lab.textContent='工具'; put('t6',lab);
 const row2=document.createElement('div');
 row2.style.cssText='width:100%;display:flex;flex-wrap:wrap;justify-content:center;margin-bottom:12px';
 [['✏️','画笔'],['╱','直线'],['▭','矩形'],['◯','圆'],['🧽','橡皮'],
  ['💧','填充'],['💉','吸管'],['✋','手型'],['🦋','镜像'],['↩️','撤销']].forEach(([i,t])=>{
  const d=document.createElement('div');
  d.style.cssText='width:58px;margin:0 4px 6px;padding:6px 2px;border:1px solid #efe7da;border-radius:10px;background:#fff;text-align:center';
  const a1=document.createElement('div'); a1.style.cssText='font-size:17px;line-height:1.1'; a1.textContent=i; d.appendChild(a1);
  const a2=document.createElement('div'); a2.style.cssText='font-size:10.5px;color:#6b5f50;margin-top:3px'; a2.textContent=t; d.appendChild(a2);
  row2.appendChild(d);
 });
 put('t6',row2);
 // 附加功能
 const row3=document.createElement('div');
 /* bottom 留 22px：不留的话会贴到页脚那行「像素小镇 / light-field.pages.dev」上 */
 row3.style.cssText='width:100%;display:flex;justify-content:center;padding-bottom:22px';
 [['🎞️','逐帧画导 GIF'],['📷','照片转像素'],['🎯','按题目出题']].forEach(([i,t])=>{
  const d=document.createElement('div');
  d.style.cssText='width:126px;margin:0 4px;padding:9px 6px;border:1px solid #efe7da;border-radius:11px;background:#fff;text-align:center';
  const a1=document.createElement('div'); a1.style.cssText='font-size:20px;line-height:1'; a1.textContent=i; d.appendChild(a1);
  const a2=document.createElement('div'); a2.style.cssText='font-size:11.5px;color:#6b5f50;margin-top:6px'; a2.textContent=t; d.appendChild(a2);
  row3.appendChild(d);
 });
 put('t6',row3);
})();

/* 7 五套配色 —— 每套 16 色，色块放大到 27px，一行放得下 */
(function(){
 const box=document.createElement('div');
 box.style.cssText='width:100%;display:flex;flex-direction:column;gap:11px';
 DATA.themes.forEach(t=>{
  const d=document.createElement('div');
  d.style.cssText='display:flex;align-items:center;justify-content:center';
  const b=document.createElement('b');
  b.style.cssText='font-size:15px;color:#3b342c;font-weight:700;width:46px;flex:none;text-align:right;padding-right:8px';
  b.textContent=t.name; d.appendChild(b);
  const sw=document.createElement('div');
  sw.style.cssText='display:flex;flex-wrap:nowrap';
  Object.keys(t.pal).forEach(k=>{const q=t.pal[k];const i=document.createElement('i');
   i.style.cssText='display:block;width:22px;height:22px;border-radius:6px;margin-right:2px;border:1px solid rgba(0,0,0,.06);background:rgb('+q[0]+','+q[1]+','+q[2]+')';
   sw.appendChild(i)});
  d.appendChild(sw); box.appendChild(d);
 });
 put('t7',box);
})();

/* 8 卡片 —— 3 张作品卡 + 4 张数据卡 + 徽章行 */
(function(){
 const row=document.createElement('div');
 row.style.cssText='width:100%;display:flex;justify-content:center;align-items:flex-start;margin-bottom:18px';
 [['爱心',16,11],['小树',16,20],['蘑菇',16,33]].forEach(([nm,sz,av])=>{
  const card=document.createElement('div');card.className='card';
  card.style.cssText='width:96px;margin:0 7px;flex:none';
  const c=cv(16,16);px16(c,DATA.avatars[av]);
  const im=document.createElement('img');im.className='art';im.src=c.toDataURL();im.alt=nm;card.appendChild(im);
  const meta=document.createElement('div');meta.className='card-meta';
  const a1=document.createElement('span');a1.className='card-name';a1.textContent=nm;meta.appendChild(a1);
  // 不挂尺寸角标：卡片窄，名字会被挤成「爱…」，名字优先
  card.appendChild(meta);
  const sub=document.createElement('div');sub.className='card-sub';
  const ac=cv(20,20);ac.className='card-av';px16(ac,DATA.avatars[av+3]);sub.appendChild(ac);
  const au=document.createElement('span');au.className='card-author';au.textContent='小林';sub.appendChild(au);
  card.appendChild(sub);
  row.appendChild(card);
 });
 put('t8',row);
 // 数据卡 4 张
 const row2=document.createElement('div');
 row2.style.cssText='width:100%;display:flex;justify-content:center;margin-bottom:20px';
 [['发布作品','4'],['收到的光尘','46'],['创作天数','7'],['成就','42']].forEach(([l,v])=>{
  const d=document.createElement('div');d.className='in-card';
  d.style.cssText='width:92px;margin:0 5px;padding:9px 8px;flex:none';
  const t=document.createElement('div');t.className='card-title';t.textContent=l;
  t.style.fontSize='12px';d.appendChild(t);
  const k=document.createElement('div');k.className='in-num';k.textContent=v;
  k.style.fontSize='23px';d.appendChild(k);
  row2.appendChild(d)});
 put('t8',row2);
})();

/* 8b 徽章 */
/* 10 个徽章一行塞不下，精简到 6 个 */
[['新功能','li-tag tag-new'],['修复','li-tag tag-fix'],['更新','li-tag tag-update']]
 .forEach(([t,c])=>{const s=document.createElement('span');s.className=c;s.textContent=t;put('t8',s)});
[['🎞️ 动画','anim-badge']]
 .forEach(([t,c])=>{const s=document.createElement('span');s.className=c;s.textContent=t;put('t8',s)});
(function(){const s=document.createElement('span');s.className='ver-tag';s.textContent='v1.7.6';put('t8',s);})();
</script></body></html>`
fs.writeFileSync('.tiles/tiles.html', html)
console.log('  ✓ tiles.html  ' + (html.length / 1024).toFixed(0) + ' KB')
