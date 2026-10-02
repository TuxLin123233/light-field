import fs from 'fs'
const SRCT = '/home/tux/编程/光域/web/public/views/town.js'
const CSS = fs.readFileSync('.spec/all.css', 'utf8')
const { defaultPixels } = await import('/home/tux/编程/光域/web/functions/api/_avatar.js')
const { FURNITURE, SURFACES, PAL, THEMES, THEME_PAL } = await import('/home/tux/编程/光域/web/functions/api/_town.js')

const NAMES = ('alice bob carol dave erin frank grace heidi ivan judy mallory niaj olivia peggy quinn rupert ' +
  'sybil trent uma victor wendy xavier yuki zara 阿光 小林 星野 墨白 青禾 长风 拾光 半夏 木鱼 山茶 ' +
  'nori pico bit pixel dot byte cube voxel sprite tile chip node mesh glitch retro arcade ' +
  'nova luna stella orion vega comet nebula cosmos echo drift').split(' ')
const avatars = NAMES.map((n) => defaultPixels(n))
const score = (f) => new Set(f.art.join('').split('')).size
const furn = [...FURNITURE].sort((a, b) => score(b) - score(a)).slice(0, 120).map((f) => ({ art: f.art, pal: f.pal || null }))
const src = fs.readFileSync(SRCT, 'utf8')
function blockAt(i) { const b = src.indexOf('{', i); let d = 0; for (let j = b; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1) } } }
fs.writeFileSync('web/tools/design-spec/_s.mjs', blockAt(src.indexOf('function surfaceTile')) + '\nexport { surfaceTile }')
const { surfaceTile } = await import('./_s.mjs'); fs.unlinkSync('web/tools/design-spec/_s.mjs')
const surfaces = SURFACES.map((s) => ({ tile: surfaceTile(s, 16, 0).map((r) => r.join('')) }))
const grab = (n) => blockAt(src.indexOf('function ' + n + '('))
// wxT 是天气动画的帧计数。不补这一行，drawWindow 会 ReferenceError，
// 后面所有段（天气、像素单元）都不会执行 —— 之前就栽在这。
const winCode = [grab('windowRect'), grab('drawWindow'), blockAt(src.indexOf('const SKY = {')), 'const ROOM = 16', 'let wxT = 4'].join('\n')

const themes = THEMES.map((t) => ({ key: t.key, name: t.name, mult: t.mult, pal: THEME_PAL[t.key] || {} }))
// 小屋渲染要的：绘图 + 家具尺寸/查找 + 贴面
// 注意：windowRect / drawWindow / SKY 已经在 winCode 里了，
// 这里再放一遍会 "already been declared"，整个脚本直接不执行。
const roomCode = [blockAt(src.indexOf('const artSize =')), blockAt(src.indexOf('const findItem =')),
  blockAt(src.indexOf('const surfaceOf =')), grab('surfaceTile'), grab('drawArt'), grab('drawRoom')].join('\n')

// 小屋的摆位：用服务端校验过，保证不越界不重叠
const { sanitizeItems, emptyHouse } = await import('/home/tux/编程/光域/web/functions/api/_town.js')
const LAYOUT = [
  { id: 'poster__gold', x: 1, y: 1 }, { id: 'clock__ink', x: 6, y: 1 }, { id: 'banner__sakura', x: 1, y: 5 },
  { id: 'bed2__sea', x: 1, y: 9 }, { id: 'nightstand__sea', x: 8, y: 9 }, { id: 'lamp__gold', x: 12, y: 9 },
  { id: 'table__gold', x: 1, y: 13 }, { id: 'chair__gold', x: 6, y: 13 },
  { id: 'plant__forest', x: 9, y: 12 }, { id: 'cushion__sakura', x: 13, y: 13 },
]
const roomItems = sanitizeItems(LAYOUT, 16) || []
const roomFurn = FURNITURE.filter((f) => LAYOUT.some((l) => l.id === f.id))
const DATA = { avatars, furn, surfaces, pal: PAL, themes, roomFurn, roomItems }
fs.writeFileSync('.spec/data.json', JSON.stringify(DATA))

const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<style>${CSS}</style>
<style>
/* ===== 先硬覆盖站点的 body/html 规则 =====
   站点把 body 设成 flex 居中（为了把 460px 的应用放屏幕中间），
   直接拿来渲染会被整体推到视口正中，顶部空出一大片。 */
html, body {
  display: block !important;
  min-height: 0 !important;
  height: auto !important;
  max-height: none !important;
  padding: 0 !important;
  margin: 0 !important;
  background: #f2efe9 !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  overflow: visible !important;
}
/* ===== 规范页自己的排版：全部 sp- 前缀，避免和站点类名撞 ===== */
.sp-page, .sp-page * { box-sizing: border-box; }
body { margin: 0; background: #f2efe9; font-family: "HarmonyOS Sans SC", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; }
/* 手机尺寸：发论坛主要用手机看，1400 宽在手机上会糊成一团 */
.sp-page { width: 750px; margin: 0 auto; background: #faf8f4; }
.sp-hero { background: #241f1a; color: #fff; padding: 44px 30px 40px; }
.sp-hero h1 { margin: 0; font-size: 44px; font-weight: 900; letter-spacing: 1px; color: #fff !important; }
.sp-hero p { margin: 12px 0 0; font-size: 17px; color: #c5baa7 !important; }
.sp-hero .sp-u { display: inline-block; margin-top: 18px; font-size: 16px; color: #96b9ff; border: 2px solid #5b8def; border-radius: 999px; padding: 9px 26px; }
.sp-sec { padding: 34px 30px 6px; }
.sp-sec > h2 { font-size: 25px; font-weight: 800; color: #3b342c; margin: 0 0 4px; }
.sp-sec > .sp-d { font-size: 13.5px; color: #8c7f6b; margin: 0 0 18px; line-height: 1.65; }
.sp-row { display: flex; flex-wrap: wrap; align-items: flex-start; }
.sp-cell { margin: 0 18px 22px 0; }
.sp-cell .sp-cap { font-size: 12px; color: #8c7f6b; margin-top: 11px; }
.sp-cell .sp-cap b { color: #3b342c; font-weight: 700; display: block; }
.sp-cell code { font-size: 11px; color: #b0a697; font-family: ui-monospace, Menlo, monospace; }
.sp-sw { width: 96px; margin: 0 12px 18px 0; }
.sp-sw i { display: block; height: 54px; border-radius: 12px; border: 1px solid rgba(0,0,0,.07); }
.sp-sw b { display: block; font-size: 12px; color: #3b342c; margin-top: 7px; font-weight: 700; }
.sp-sw code { font-size: 11px; color: #b0a697; font-family: ui-monospace, Menlo, monospace; }
.sp-tp { margin: 0 0 24px; }
.sp-tp .t { color: #3b342c; }
.sp-tp .n { font-size: 12px; color: #b0a697; font-family: ui-monospace, Menlo, monospace; margin-top: 3px; }
.sp-pad { background: #fff; border: 1px solid #efe7da; border-radius: 14px; padding: 20px; }
.sp-av { width: 56px; height: 56px; margin: 0 5px 5px 0; border-radius: 11px; background: #f6f4f0; display: flex; align-items: center; justify-content: center; }
.sp-av canvas { width: 46px; height: 46px; image-rendering: pixelated; display: block; }
.sp-f { width: 48px; height: 48px; margin: 0 5px 5px 0; border-radius: 10px; background: #f7f5f1; display: flex; align-items: center; justify-content: center; }
.sp-f canvas { image-rendering: pixelated; display: block; }
.sp-s { width: 34px; height: 34px; margin: 0 5px 5px 0; border-radius: 8px; overflow: hidden; }
.sp-s canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
.sp-w { border-radius: 12px; background: #fff; border: 1px solid #efe7da; padding: 10px 10px 6px; margin: 0 10px 10px 0; text-align: center; }
.sp-w canvas { image-rendering: pixelated; display: block; margin: 0 auto; }
.sp-w span { display: block; font-size: 11.5px; color: #6b5f50; margin-top: 7px; }
.sp-dark { background: #241f1a; padding: 30px 30px 36px; color: #fff; margin-top: 18px; }
.sp-dark h2 { font-size: 21px; font-weight: 800; margin: 0 0 14px; }
.sp-dark p { color: #c5baa7; font-size: 14px; margin: 0; }
.sp-w1 { width: 100%; } .sp-w2 { width: 100%; } .sp-w3 { width: 100%; }
</style></head>
<body><div class="sp-page">
<div class="sp-hero"><h1>像素小镇 · 设计规范</h1>
<p>按钮 / 标签 / 卡片 / 输入 / 像素单元 —— 全部取自站点真实样式</p>
<span class="sp-u">light-field.pages.dev</span></div>

<section class="sp-sec"><h2>默认头像 · 3888 种</h2><p class="sp-d">24 色相 × 3 明度 × 3 耳型 × 2 眼型 × 3 嘴型 × 3 底纹，按账号名自动生成</p><div class="sp-row" id="avatars"></div></section>
<section class="sp-sec"><h2>家具 · 654 件</h2><p class="sp-d">5 套配色主题 × 基础家具，同一件换个主题就是另一件</p><div class="sp-row" id="furn"></div></section>
<section class="sp-sec"><h2>墙纸与地毯 · 50 种</h2><p class="sp-d">图案 × 配色，贴墙上或铺地上</p><div class="sp-row" id="surf"></div></section>
<section class="sp-sec"><h2>一间自己的小屋</h2><p class="sp-d">16×16 起步，能扩到 24×24 / 32×32。家具按住就能拖着摆，只能放在下半部分（墙上那扇窗除外）</p><div class="sp-row" id="room"></div></section>
<section class="sp-sec"><h2>窗外天气 · 8 种</h2><p class="sp-d">雨是斜着往下赶的雨丝，雪是慢慢飘的白点 —— 形状不同，不只是换颜色</p><div class="sp-row" id="weather"></div></section>
<section class="sp-sec"><h2>像素单元</h2><p class="sp-d">画布 16 / 32 / 64，小屋 16 / 24 / 32，一格 = 一个逻辑像素</p><div class="sp-row" id="units"></div></section>
<section class="sp-sec"><h2>配色主题</h2><p class="sp-d">界面一套变量走明暗两种主题；家具另有 5 套调色板</p><div class="sp-row" id="themes"></div></section>
<section class="sp-sec"><h2>配色</h2><p class="sp-d">站点 CSS 变量</p><div class="sp-row" id="swatches"></div></section>
<section class="sp-sec"><h2>字体</h2><p class="sp-d">HarmonyOS Sans SC · 标题 Black/Bold，正文 Regular</p><div id="typo"></div></section>
<section class="sp-sec"><h2>按钮</h2><p class="sp-d">主要动作实心、次要幽灵、切换用胶囊，圆角 999px 与 10px 两档</p><div class="sp-row" id="buttons"></div></section>
<section class="sp-sec"><h2>芯片与切换</h2><p class="sp-d">尺寸、天气、金额这种「多选一」全用胶囊芯片</p><div class="sp-row" id="chips"></div></section>
<section class="sp-sec"><h2>标签与徽章</h2><p class="sp-d">更新日志分类、版本号、数字角标、作品状态徽章</p><div class="sp-row" id="tags"></div></section>
<section class="sp-sec"><h2>作品卡片</h2><p class="sp-d">社区里最小的一块：画 + 名字 + 作者头像 + 收到的光尘</p><div class="sp-row" id="works"></div></section>
<section class="sp-sec"><h2>数据卡片</h2><p class="sp-d">数字大、标题小，一眼看清累积了多少</p><div class="sp-row" id="stats"></div></section>
<section class="sp-sec"><h2>入口卡片与列表行</h2><p class="sp-d">带图标的一行，右侧箭头；设置项用两行文字</p><div class="sp-row" id="entries"></div></section>
<section class="sp-sec"><h2>成就条目</h2><p class="sp-d">图标 + 名字 + 奖励光尘，未解锁的压暗</p><div class="sp-row" id="ach"></div></section>
<section class="sp-sec"><h2>输入</h2><p class="sp-d">圆角 10px，聚焦时描边换成主色</p><div class="sp-row" id="inputs"></div></section>
<section class="sp-sec"><h2>对话框与提示</h2><p class="sp-d">确认框、Toast 提示</p><div class="sp-row" id="dialogs"></div></section>

<div class="sp-dark"><h2>完全免费 · 无广告 · 不要邮箱手机号</h2>
<p>浏览器打开就能画，手机和电脑都行 → light-field.pages.dev</p></div>
</div>
<script>
const DATA = ${JSON.stringify(DATA)}, PAL = DATA.pal;
${winCode}
${roomCode}
/* drawRoom 的宿主变量：它读 cat / house / floorY / PAL 和 $('twRoom') */
const cat = { furniture: DATA.roomFurn, surfaces: [] };
const house = { size: 16, wall: 'w_plain_warm', floor: 'f_wood_oak', items: DATA.roomItems, weather: 'snow' };
const floorY = 8;
let mine = false, picked = null, dragOn = false, _roomCv = null;
const curWeather = () => 'snow';
const $ = (id) => (id === 'twRoom' ? _roomCv : null);
const WX = ['sunny','cloudy','rain','snow','dawn','dusk','night'];
const WXN = {sunny:'晴',cloudy:'多云',rain:'雨',snow:'雪',dawn:'清晨',dusk:'黄昏',night:'夜'};
const WXI = {sunny:'☀️',cloudy:'☁️',rain:'🌧️',snow:'❄️',dawn:'🌅',dusk:'🌇',night:'🌙'};
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function px16(c,px){const g=c.getContext('2d');for(let y=0;y<16;y++)for(let x=0;x<16;x++){const q=px[y*16+x]||[255,255,255];g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';g.fillRect(x,y,1,1)}}
function E(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function cell(n,t,code){const d=E('div','sp-cell');d.appendChild(n);d.appendChild(E('div','sp-cap','<b>'+t+'</b>'+(code?'<code>'+code+'</code>':'')));return d}
const put=(id,n)=>document.getElementById(id).appendChild(n);
function btn(cls,label,code){const b=E('button',cls,label);b.type='button';return cell(b,label,code||cls)}

/* 配色 */
[['--bg','#faf5ef'],['--surface','#fff'],['--surface-2','#f6f2ea'],['--text','#3b342c'],['--text-muted','#6b5f50'],
 ['--text-faint','#b0a697'],['--border','#efe7da'],['--border-input','#e0d8d0'],['--accent','#5b8def'],
 ['--tip-text','#d1944d'],['--like','#e5574b'],['--toast-bg','#3b342c']].forEach(([n,c])=>{
  const d=E('div','sp-sw');d.appendChild(E('i')).style.background=c;
  d.appendChild(E('b','',n));d.appendChild(E('code','',c));put('swatches',d)});

/* 配色主题 */
[['亮色（默认）','',[['--bg','#faf5ef'],['--surface','#fff'],['--text','#3b342c'],['--accent','#5b8def'],['--tip-text','#d1944d'],['--border','#efe7da']]],
 ['暗色','',[['--surface','#2a251f'],['--art-bg','#f6f2ea'],['--text','#f1ead9'],['--text-muted','#c5baa7']]]
].forEach(([label, _, vars]) => {
  const d = E('div','sp-pad'); d.style.width='380px';
  d.appendChild(E('div','card-title',label));
  const row = E('div'); row.style.cssText='display:flex;flex-wrap:wrap;margin-top:10px';
  vars.forEach(([n,c])=>{ const w=E('div','sp-sw'); w.style.cssText='width:78px;margin:0 10px 12px 0';
    w.appendChild(E('i')).style.cssText='height:44px;background:'+c;
    w.appendChild(E('b','',n)); w.appendChild(E('code','',c)); row.appendChild(w); });
  d.appendChild(row);
  put('themes', cell(d, label, 'CSS 变量'));
});
DATA.themes.forEach((t) => {
  const d = E('div','sp-pad'); d.style.width='100%';
  const keys = Object.keys(t.pal);
  d.appendChild(E('div','card-title', t.name + '　<span style="font-weight:400;color:#8c7f6b">' + t.key + ' · 倍率 ×' + t.mult + ' · ' + keys.length + ' 色</span>'));
  const row = E('div'); row.style.cssText='display:flex;flex-wrap:wrap;margin-top:12px';
  keys.forEach((k) => { const q = t.pal[k];
    const sw = E('div'); sw.style.cssText='width:46px;margin:0 8px 10px 0;text-align:center';
    const i = E('i'); i.style.cssText='display:block;height:46px;border-radius:9px;border:1px solid rgba(0,0,0,.07);background:rgb('+q[0]+','+q[1]+','+q[2]+')';
    sw.appendChild(i);
    const b = E('b','',k); b.style.cssText='display:block;font-size:12px;color:#3b342c;margin-top:5px';
    sw.appendChild(b); row.appendChild(sw); });
  d.appendChild(row);
  put('themes', cell(d, '家具主题 · ' + t.name, 'THEME_PAL.' + t.key));
});

/* 字体 */
[['Black',60,900,'标题'],['Bold',34,700,'小标题'],['Medium',24,600,'按钮'],['Regular',21,400,'正文'],['Regular',15,400,'说明']]
.forEach(([w,s,fw,l])=>{const d=E('div','sp-tp');const t=E('div','t','像素小镇 PIXEL TOWN 0123');
 t.style.cssText='font-size:'+s+'px;font-weight:'+fw;d.appendChild(t);
 d.appendChild(E('div','n',l+' · '+s+'px · '+w));put('typo',d)});

/* 按钮 */
put('buttons',btn('tw-btn','主要按钮'));
put('buttons',btn('tw-btn ghost','次要按钮'));
put('buttons',btn('tw-btn','保存布置'));
put('buttons',btn('gtool','撤销'));
put('buttons',btn('av-switch','换成默认头像'));
put('buttons',btn('auth-btn','登录'));
const rf=E('button','lw-refresh');rf.type='button';rf.setAttribute('data-label','刷新');
put('buttons',cell(rf,'刷新（图标按钮）','.lw-refresh'));
const dis=E('button','tw-btn','已保存');dis.type='button';dis.disabled=true;
put('buttons',cell(dis,'禁用态','[disabled]'));

/* 芯片 */
function chip(cls,label){const b=E('button',cls,label);b.type='button';return cell(b,label,'.'+cls.split(' ').join('.'))}
put('chips',chip('tw-tab','🕐 跟随现实'));
put('chips',chip('tw-tab on','🌧️ 雨'));
put('chips',chip('ch-chip','10 ✨'));
put('chips',chip('ch-chip on','50 ✨'));
const pc=E('button','pal-chip');pc.type='button';pc.style.background='#e5574b';
put('chips',cell(pc,'取色芯片','.pal-chip'));
put('chips',chip('mode-chip','像素画'));
put('chips',chip('radio-chip','全部作品'));
const tb=E('button','tw-item');tb.type='button';
const tc=cv(34,34);tb.appendChild(tc);tb.appendChild(E('span','','木凳'));
put('chips',cell(tb,'图块按钮','.tw-item'));

/* 标签徽章 */
[['新功能','li-tag tag-new'],['修复','li-tag tag-fix'],['更新','li-tag tag-update'],['界面','li-tag tag-ui']]
.forEach(([t,c])=>put('tags',cell(E('span',c,t),t,'.'+c.split(' ').join('.'))));
put('tags',cell(E('span','ver-tag','v1.7.6'),'版本号','.ver-tag'));
put('tags',cell(E('span','ml-num','3'),'数字角标','.ml-num'));
put('tags',cell(E('span','ver-date','2026-10'),'日期','.ver-date'));
put('tags',cell(E('span','anim-badge','🎞️ 动画'),'动画徽章','.anim-badge'));
put('tags',cell(E('span','room-badge','👥 多人'),'多人徽章','.room-badge'));
put('tags',cell(E('span','img-badge','🖼️ 来自图片'),'来源徽章','.img-badge'));
put('tags',cell(E('span','card-tag','像素'),'卡片标签','.card-tag'));
const lb=E('button','like-btn','❤️ 12');lb.type='button';
put('tags',cell(lb,'点赞按钮','.like-btn'));

/* 作品卡片 */
function workCard(name, likes, px, size) {
  const c = E('div','card'); c.style.width = '168px';
  const img = cv(size, size); px16(img, px); img.className = 'art';
  const g = img.getContext('2d');
  img.style.imageRendering = 'pixelated';
  const url = img.toDataURL();
  const im = E('img','art'); im.src = url; im.alt = name;
  c.appendChild(im);
  const meta = E('div','card-meta'); meta.appendChild(E('span','card-name',name));
  meta.appendChild(E('span','card-size',size+'×'+size));
  c.appendChild(meta);
  const sub = E('div','card-sub');
  const ac = cv(20,20); ac.className='card-av'; px16(ac, DATA.avatars[likes % DATA.avatars.length]);
  sub.appendChild(ac); sub.appendChild(E('span','card-author','小林同学'));
  sub.appendChild(E('span','card-time','10-27'));
  c.appendChild(sub);
  return c;
}
put('works', cell(workCard('爱心', 0, DATA.avatars[0], 16), '作品卡片', '.card'));
put('works', cell(workCard('小树', 5, DATA.avatars[5], 32), '作品卡片（32×32）', '.card'));

/* 数据卡片 */
[['发布作品','4'],['收到的光尘','46'],['创作天数','7']].forEach(([l,n])=>{
  const d=E('div','in-card','<div class="card-title">'+l+'</div><div class="in-num">'+n+'</div>');
  d.style.width='150px'; put('stats',cell(d,l,'.in-card'));
});

/* 入口卡与行 */
const entry=E('div','entry');entry.style.width='360px';
entry.innerHTML='<span class="entry-ico">🎨</span><span class="entry-body"><span class="entry-label">画头像</span><span class="entry-desc">自己画，或换成系统默认的</span></span><span class="entry-arrow">›</span>';
put('entries',cell(entry,'入口卡','.entry'));
const row=E('div','row-col');row.style.width='360px';
row.innerHTML='<span class="row-label">开发者模式</span><span class="row-desc">关着的时候不显示进阶工具</span>';
put('entries',cell(row,'设置行','.row-col'));
const ml=E('div','m-link');ml.style.width='360px';
ml.innerHTML='<span class="ml-ico">📬</span><span class="entry-label">信箱</span><span class="ml-num">2</span>';
put('entries',cell(ml,'列表项带角标','.m-link'));
const gt=E('div','group-title','赞赏支持');
put('entries',cell(gt,'分组标题','.group-title'));

/* 成就 */
[['🏆','初次落笔','+10',true],['🎨','画满十幅','+20',false]].forEach(([i,n,d,on])=>{
  const a=E('div','ach-item'+(on?'':' locked'));
  a.innerHTML='<span class="ach-ico">'+i+'</span><span class="entry-label">'+n+'</span><span class="ach-num">'+d+'</span>';
  a.style.width='320px'; put('ach',cell(a,n+(on?'（已解锁）':'（未解锁）'),'.ach-item'));
});

/* 输入 */
const i1=E('input');i1.placeholder='作品名';i1.style.width='250px';
put('inputs',cell(i1,'输入框','input'));
const ta=E('textarea');ta.placeholder='说点什么…';ta.rows=2;ta.style.width='250px';
put('inputs',cell(ta,'多行输入','textarea'));
const rg=E('input');rg.type='range';rg.min=1;rg.max=8;rg.value=4;rg.style.width='190px';
put('inputs',cell(rg,'滑杆','input[type=range]'));
const sel=E('select','','<option>参加活动（只能选一个）</option>');
sel.style.width='250px'; put('inputs',cell(sel,'下拉','select'));

/* 对话框与 Toast */
const box=E('div','card-box');box.style.width='300px';
box.innerHTML='<div class="card-head"><span class="card-title">要删掉这条留言吗？</span></div><div class="card-actions"><button class="card-btn" type="button">取消</button><button class="card-btn" type="button">删除</button></div>';
put('dialogs',cell(box,'对话框','.card-box / .card-btn'));
const ti=E('span','ml-ico','🔔');
put('dialogs',cell(ti,'图标','.ml-ico'));
const dot=E('span','dot');
put('dialogs',cell(dot,'红点','.dot'));

/* 小屋 */
(function renderRoom(){
  const S = 30;
  // drawRoom 要一个「$('twRoom') 返回的画布」，这里给它一个离屏的
  const tmp = cv(16, 16);
  _roomCv = tmp;
  drawRoom();   // 它自己会从 $('twRoom') 取画布并设尺寸
  const R = 16;
  const big = cv(R * S, R * S);
  const bg2 = big.getContext('2d');
  bg2.imageSmoothingEnabled = false;
  bg2.drawImage(tmp, 0, 0, R, R, 0, 0, R * S, R * S);
  big.style.cssText = 'width:' + (R*S) + 'px;height:' + (R*S) + 'px;image-rendering:pixelated;display:block;border-radius:12px';
  const d = E('div','sp-pad'); d.style.padding = '0'; d.style.overflow = 'hidden'; d.style.borderRadius = '14px';
  d.appendChild(big);
  put('room', cell(d, '小屋 16×16（雪天）', 'drawRoom()'));
})();

/* 头像 */
DATA.avatars.forEach(px=>{const d=E('div','sp-av');const c=cv(16,16);px16(c,px);d.appendChild(c);put('avatars',d)});

/* 家具 */
DATA.furn.forEach(f=>{const d=E('div','sp-f');
 const aw=Math.max(...f.art.map(r=>r.length)),ah=f.art.length;
 const c=cv(aw,ah),g=c.getContext('2d'),pal=f.pal||PAL;
 for(let y=0;y<ah;y++)for(let x=0;x<f.art[y].length;x++){const ch=f.art[y][x];if(ch==='.'||!pal[ch])continue;const q=pal[ch];g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';g.fillRect(x,y,1,1)}
 const sc=Math.max(1,Math.min(Math.floor(42/aw),Math.floor(42/ah)));
 c.style.width=(aw*sc)+'px';c.style.height=(ah*sc)+'px';d.appendChild(c);put('furn',d)});

/* 墙纸地毯 */
DATA.surfaces.forEach(s=>{const d=E('div','sp-s'),c=cv(16,16),g=c.getContext('2d');
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const q=PAL[s.tile[y][x]];if(!q)continue;g.fillStyle='rgb('+q[0]+','+q[1]+','+q[2]+')';g.fillRect(x,y,1,1)}
 d.appendChild(c);put('surf',d)});

/* 天气 */
WX.forEach(w=>{const d=E('div','sp-w');const S=32;
 const tmp=cv(16,16),tg=tmp.getContext('2d');
 window.__wxT=4;
 drawWindow(tg,w);
 const wr=windowRect();
 const c=cv(wr.w+2,wr.h+2),g=c.getContext('2d');
 g.drawImage(tmp,wr.x-1,wr.y-1,wr.w+2,wr.h+2,0,0,wr.w+2,wr.h+2);
 c.style.width=(wr.w+2)*S+'px';c.style.height=(wr.h+2)*S+'px';
 d.appendChild(c);d.appendChild(E('span','',WXI[w]+' '+WXN[w]));put('weather',d)});

/* 像素单元 */
/* 像素单元：一格一格**填**出来，不用 stroke —— stroke 出的 1px 线
   在 16×16 这种小画布上会被抗锯齿抹掉，看着就是一块空白。 */
[[16,'画布 16×16'],[32,'画布 32×32'],[64,'画布 64×64']].forEach(([n,l])=>{
 const d=E('div'),c=cv(n,n),g=c.getContext('2d');
 g.fillStyle='#ffffff';g.fillRect(0,0,n,n);
 /* 网格线按尺寸取间隔：16×16 上每像素都画线会糊成一块纯色 */
 const step = n <= 16 ? 4 : n <= 32 ? 8 : 16;
 g.fillStyle='#e3d9c8';
 for(let i=0;i<n;i+=step){ g.fillRect(i,0,1,n); g.fillRect(0,i,n,1); }
 const px=130;
 c.style.cssText='width:'+px+'px;height:'+px+'px;image-rendering:pixelated;border:1px solid #efe7da;border-radius:10px;display:block;background:#fff;';
 d.appendChild(c);put('units',cell(d,l,n+' × '+n+' 格'))});
</script></body></html>`
fs.writeFileSync('.spec/spec.html', html)
console.log('  ✓ spec.html  ' + (html.length / 1024).toFixed(0) + ' KB')
