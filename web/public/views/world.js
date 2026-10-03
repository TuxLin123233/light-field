// 像素小镇 · 冒险世界
//
// 上帝视角的方块世界。一格一格走，挖方块、放方块、合成、打怪。
//
// 设计上的三个决定：
//
// 1. **一格一格走**，不是自由移动。
//    按一下方向键走一格（走的过程有平滑插值，但逻辑上是离散的）。
//    这样碰撞判定就是「目标格是不是实心的」，不会出现卡在缝里、
//    穿墙、斜着挤过去这些自由移动常见的问题。
//
// 2. **分块生成**，块是 16×16。
//    世界无限大，但只生成玩家周围看得见的那些块，离远了就丢掉。
//    每块用自己的坐标当种子，所以同一个地方每次生成出来都一样 ——
//    不需要把整个世界存下来，只要存「玩家改过哪些格」。
//
// 3. **地形用两层噪声**：高度 + 湿度。
//    高度决定海/滩/陆/山，湿度决定草原/森林/沙漠/雪原。
//    洞穴是第三层噪声在深层挖出来的空腔。
//    这样生物群系是「连成片」的，不会一个草原格挨着一个沙漠格。

export default {
  name: 'town-world',
  title: '冒险世界',
  css: `
    .wd-page { max-width: 720px; margin: 0 auto; padding: 0 0 calc(88px + env(safe-area-inset-bottom, 0px)); }
    .wd-head {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 14px;
      background: linear-gradient(180deg, #2f5b45, #1f3f30);
      border-bottom: 3px solid #142a20;
      box-shadow: 0 4px 14px rgba(15,40,28,.35), inset 0 1px 0 rgba(255,255,255,.12);
    }
    .wd-back {
      font-size: 13px; font-weight: 700; text-decoration: none;
      color: #d8f0e2; background: rgba(255,255,255,.14);
      border-radius: 999px; padding: 5px 11px;
    }
    .wd-back:active { transform: scale(.95) }
    .wd-title { font-size: 17px; font-weight: 800; color: #f0fff6; flex: 1; text-shadow: 0 2px 0 rgba(10,30,20,.6) }
    .wd-btn {
      padding: 6px 12px; border: 1px solid rgba(255,255,255,.28);
      border-radius: 999px; background: rgba(255,255,255,.12);
      color: #eafff3; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer;
    }
    .wd-btn:active { transform: scale(.95) }

    /* 舞台 */
    .wd-stage {
      position: relative; margin: 0;
      background: #0b1524;
      border-bottom: 2px solid #142a20;
      touch-action: none;
      -webkit-user-select: none; user-select: none;
      overflow: hidden;
    }
    .wd-stage canvas { display: block; width: 100%; image-rendering: pixelated }

    /* HUD */
    .wd-hud {
      position: absolute; left: 8px; top: 8px; right: 8px;
      display: flex; gap: 8px; align-items: flex-start; pointer-events: none;
      font-size: 11px; color: #e9fff5;
      text-shadow: 0 1px 2px rgba(0,0,0,.7);
      font-variant-numeric: tabular-nums;
    }
    .wd-hud .wd-chip {
      background: rgba(8,20,16,.55); border: 1px solid rgba(255,255,255,.14);
      border-radius: 8px; padding: 4px 8px; line-height: 1.5;
    }
    .wd-hud .wd-chip b { color: #fff }
    .wd-hud .wd-spacer { flex: 1 }

    /* 小地图 */
    .wd-mini {
      position: absolute; right: 8px; top: 44px;
      width: 92px; height: 92px;
      border: 2px solid rgba(255,255,255,.35);
      border-radius: 8px; overflow: hidden;
      background: rgba(8,20,16,.6);
      pointer-events: none;
    }
    .wd-mini canvas { display: block; width: 100%; height: 100%; image-rendering: pixelated }

    /* 热键栏 */
    /* 热键栏。原来 40px 一格，手机上手指点不准 —— 放大到 54。
       9 格总共 526px，窄屏放不下，所以让它能横向滑。 */
    .wd-bar {
      position: absolute; left: 0; right: 0; bottom: 8px;
      display: flex; gap: 5px; justify-content: center; padding: 0 8px;
      overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
    }
    .wd-bar::-webkit-scrollbar { display: none }
    .wd-slot {
      position: relative; width: 54px; height: 54px; flex: none;
      border: 2px solid rgba(255,255,255,.32);
      border-radius: 12px;
      background: rgba(8,20,16,.72);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,.35);
    }
    .wd-slot.on {
      border-color: #ffd36e;
      box-shadow: 0 0 0 3px rgba(255,211,110,.45), 0 2px 8px rgba(0,0,0,.4);
      transform: translateY(-3px);
    }
    .wd-slot .wd-sq { width: 32px; height: 32px; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.35) }
    .wd-slot .wd-n {
      position: absolute; right: 4px; bottom: 2px;
      font-size: 12px; font-weight: 900; color: #fff;
      text-shadow: 0 1px 3px #000, 0 0 6px #000;
    }
    .wd-slot .wd-k {
      position: absolute; left: 4px; top: 1px;
      font-size: 10px; font-weight: 800; color: rgba(255,255,255,.55);
    }

    /* 底部面板（背包 / 合成 / 图鉴） */
    .wd-panel {
      margin: 10px 12px 0; padding: 12px;
      background: linear-gradient(180deg, #fffaf1, #f6ecdb);
      border: 1px solid #e0d0b4; border-radius: 14px;
      color: #4a3a24; font-size: 12.5px;
      box-shadow: 0 2px 0 #e6d8c0;
      max-height: 42vh; overflow-y: auto;
    }
    html[data-mood='dark'] .wd-panel {
      background: linear-gradient(180deg, #322c24, #2a251e);
      border-color: #463d31; color: #ecdfc8; box-shadow: none;
    }
    .wd-panel h4 { margin: 0 0 8px; font-size: 13px }
    .wd-tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap }
    .wd-tabs button {
      padding: 5px 12px; border: 1px solid #d3bb93; border-radius: 999px;
      background: #fff6e4; color: #6a563c; font-family: inherit; font-size: 12px;
      font-weight: 700; cursor: pointer;
    }
    .wd-tabs button.on { background: linear-gradient(180deg,#c98a4f,#a96f38); border-color:#8f5c2c; color:#fff }
    html[data-mood='dark'] .wd-tabs button { background:#3a332a; border-color:#4f4536; color:#e6d8c2 }
    html[data-mood='dark'] .wd-tabs button.on { background:linear-gradient(180deg,#8a6236,#6f4d2a); border-color:#5a3f22; color:#fff }

    .wd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(46px,1fr)); gap: 6px }
    .wd-cell {
      position: relative; aspect-ratio: 1;
      border: 1px solid #d8c4a2; border-radius: 8px;
      background: #fffdf8;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    }
    html[data-mood='dark'] .wd-cell { background:#37312a; border-color:#4d4437 }
    .wd-cell .wd-sq { width: 70%; height: 70%; border-radius: 5px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.3) }
    .wd-cell .wd-n { position: absolute; right: 3px; bottom: 1px; font-size: 10px; font-weight: 800; color: #4a3a24 }
    html[data-mood='dark'] .wd-cell .wd-n { color: #f0e6d2 }
    .wd-cell.locked { opacity: .35 }

    .wd-recipe {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 0; border-bottom: 1px dashed rgba(150,120,80,.32);
    }
    .wd-recipe .wd-out { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0 }
    .wd-recipe .wd-sq { width: 22px; height: 22px; border-radius: 4px; flex: none; box-shadow: inset 0 0 0 1px rgba(0,0,0,.3) }
    .wd-recipe .wd-cost { font-size: 11px; opacity: .78; line-height: 1.6 }
    .wd-recipe button {
      flex: none; padding: 6px 12px; border: 1px solid #d3bb93; border-radius: 8px;
      background: #fff6e4; color: #4a3a20; font-family: inherit; font-size: 12px;
      font-weight: 700; cursor: pointer;
    }
    .wd-recipe button:disabled { opacity: .45; cursor: default }
    html[data-mood='dark'] .wd-recipe button { background:#3a332a; border-color:#4f4536; color:#efe3cf }

    /* 提示条 */
    .wd-toast {
      position: absolute; left: 50%; bottom: 56px; transform: translateX(-50%);
      padding: 6px 14px; border-radius: 999px;
      background: rgba(8,20,16,.8); color: #eafff3;
      font-size: 12px; font-weight: 700; white-space: nowrap;
      opacity: 0; pointer-events: none;
    }
    .wd-toast.show { animation: wdToast 1.4s ease-out }
    @keyframes wdToast {
      0% { opacity: 0; transform: translate(-50%, 6px) }
      15%,70% { opacity: 1; transform: translate(-50%, 0) }
      100% { opacity: 0; transform: translate(-50%, -8px) }
    }

    /* 下沉 / 上来 */
    .wd-layerbtns {
      position: absolute; right: 10px; bottom: 74px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .wd-layerbtns button {
      padding: 11px 16px; border: 2px solid rgba(255,255,255,.34);
      border-radius: 12px; background: rgba(8,20,16,.68);
      color: #eafff3; font-family: inherit; font-size: 14px; font-weight: 800;
      cursor: pointer; white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,.35);
      -webkit-tap-highlight-color: transparent;
    }
    .wd-layerbtns button:active { background: rgba(255,255,255,.3); transform: scale(.96) }
    .wd-layerbtns button:disabled { opacity: .35; cursor: default }

    /* 触屏方向键 */
    /* 方向键。原来 34px，拇指按不准 —— 放大到 52。
       正中间那格放「挖/打」，那是最常用的动作。 */
    .wd-dpad {
      position: absolute; left: 10px; bottom: 74px;
      display: grid; grid-template-columns: repeat(3, 52px); grid-template-rows: repeat(3, 52px);
      gap: 5px;
    }
    .wd-dpad button {
      border: 2px solid rgba(255,255,255,.34); border-radius: 12px;
      background: rgba(8,20,16,.68); color: #eafff3;
      font-size: 20px; font-family: inherit; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,.35);
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .wd-dpad button:active { background: rgba(255,255,255,.3); transform: scale(.94) }
    .wd-dpad button[data-dir='act'] { background: rgba(200,140,60,.78); border-color: rgba(255,210,140,.7) }
    .wd-dpad .sp { visibility: hidden }
    @media (min-width: 760px) { .wd-dpad { display: none } }
  `,
  template: `
    <div class="wd-page">
      <div class="wd-head">
        <a class="wd-back" href="/town">← 小镇</a>
        <div class="wd-title">🧭 冒险世界</div>
        <button class="wd-btn" id="wdSave" type="button">存档</button>
        <button class="wd-btn" id="wdHelp" type="button">帮助</button>
      </div>

      <div class="wd-stage" id="wdStage">
        <canvas id="wdCv"></canvas>
        <div class="wd-hud">
          <div class="wd-chip" id="wdWhere">—</div>
          <div class="wd-spacer"></div>
          <div class="wd-chip" id="wdClock">☀️ 白天</div>
          <div class="wd-chip" id="wdLayerChip">🟩 地表</div>
        </div>
        <div class="wd-mini"><canvas id="wdMini"></canvas></div>
        <div class="wd-toast" id="wdToast"></div>
        <div class="wd-dpad">
          <button class="sp"></button><button data-dir="up">▲</button><button class="sp"></button>
          <button data-dir="left">◀</button><button data-dir="act">⛏</button><button data-dir="right">▶</button>
          <button class="sp"></button><button data-dir="down">▼</button><button class="sp"></button>
        </div>
        <div class="wd-bar" id="wdBar"></div>
        <!-- 下沉 / 上来 -->
        <div class="wd-layerbtns">
          <button id="wdPlace" type="button">🧱 放一个</button>
          <button id="wdDown" type="button">⬇ 下去</button>
          <button id="wdUp" type="button">⬆ 上来</button>
        </div>
      </div>

      <div class="wd-panel">
        <div class="wd-tabs" id="wdTabs">
          <button data-tab="bag" class="on" type="button">🎒 背包</button>
          <button data-tab="craft" type="button">🔨 合成</button>
          <button data-tab="dex" type="button">📖 图鉴</button>
          <button data-tab="stat" type="button">📊 统计</button>
        </div>
        <div id="wdPane"></div>
      </div>
    </div>
  `,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const esc = (x) =>
      String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    const token = () => { try { return localStorage.getItem('lw-token') || '' } catch (e) { return '' } }

    /* ===================== 方块表 =====================
       60+ 种。字段：
         k  内部键   n  中文名
         c  主色     c2 暗色（做纹理点，避免大片纯色）
         hard 挖掘耗时（秒，空手）  tool 提速的工具类别
         drop 挖掉后掉什么（默认自己）
         solid 能不能站上去 / 挡路
         light 自发光（夜里也亮） */
    const T = (k, n, c, c2, o) => Object.assign(
      { k, n, c, c2, hard: 0.4, tool: '', drop: k, solid: true, light: 0 }, o || {}
    )

    const TILES = [
      // --- 基础地形 ---
      T('air', '空气', '#0b1524', '#0b1524', { solid: false, hard: 0 }),
      T('grass', '草地', '#4f9455', '#3f7a45'),
      T('grass_dry', '枯草', '#9aa646', '#7d8838'),
      T('dirt', '泥土', '#7a5c3e', '#63492f'),
      T('mud', '泥浆', '#5f4a32', '#48371f', { hard: 0.5 }),
      T('sand', '沙子', '#e0cf94', '#c8b578', { hard: 0.35 }),
      T('sand_red', '红沙', '#c98a5a', '#a86f42'),
      T('gravel', '砂砾', '#8a8478', '#6e6860'),
      T('snow', '雪', '#eef4fa', '#d4dee8', { hard: 0.3 }),
      T('ice', '冰', '#a8d8f0', '#82bcda', { hard: 0.6, light: 0 }),
      T('water', '水', '#3a76c8', '#2c5da3', { solid: false, hard: 0 }),
      T('deep_water', '深水', '#24518f', '#1a3b6b', { solid: false, hard: 0 }),
      T('lava', '岩浆', '#e8632a', '#c0451a', { solid: false, hard: 0, light: 1 }),
      // --- 石头与矿 ---
      T('stone', '石头', '#8a8f96', '#6f747b', { hard: 1.1, tool: 'pick' }),
      T('cobble', '圆石', '#7b8087', '#63686f', { hard: 1.0, tool: 'pick' }),
      T('granite', '花岗岩', '#9a7f78', '#7d635d', { hard: 1.3, tool: 'pick' }),
      T('diorite', '闪长岩', '#c0c4c8', '#a2a6aa', { hard: 1.3, tool: 'pick' }),
      T('basalt', '玄武岩', '#4a4a52', '#35353c', { hard: 1.4, tool: 'pick' }),
      T('limestone', '石灰岩', '#d6d2c4', '#b8b4a6', { hard: 1.2, tool: 'pick' }),
      T('coal_ore', '煤矿', '#6b6b6b', '#3a3a3a', { hard: 1.6, tool: 'pick', light: 0.1 }),
      T('iron_ore', '铁矿', '#9a8a76', '#c8a888', { hard: 2.2, tool: 'pick', drop: 'iron_ore' }),
      T('gold_ore', '金矿', '#a89464', '#f0d05a', { hard: 2.6, tool: 'pick', light: 0.1 }),
      T('copper_ore', '铜矿', '#9a7a62', '#d08a52', { hard: 2.0, tool: 'pick' }),
      T('diamond_ore', '钻石矿', '#7fa8b8', '#6ff0e0', { hard: 3.6, tool: 'pick', light: 0.15 }),
      T('lapis_ore', '青金石矿', '#7a86a8', '#3f5fd0', { hard: 2.4, tool: 'pick' }),
      T('redstone_ore', '红石矿', '#8a7a7a', '#e0403a', { hard: 2.4, tool: 'pick', light: 0.1 }),
      T('emerald_ore', '绿宝石矿', '#7aa88a', '#4fe08a', { hard: 4.0, tool: 'pick', light: 0.15 }),
      T('quartz_ore', '石英矿', '#c8c0b0', '#f4f0e6', { hard: 1.8, tool: 'pick' }),
      T('salt_ore', '盐矿', '#c8c4bc', '#ffffff', { hard: 1.2, tool: 'pick' }),
      T('sulfur_ore', '硫磺矿', '#b8a860', '#f0e050', { hard: 1.6, tool: 'pick' }),
      // --- 木头 ---
      T('log_oak', '橡木', '#8a6a42', '#6b4f2e', { hard: 1.0, tool: 'axe' }),
      T('log_pine', '松木', '#7a5a3a', '#5c4226', { hard: 1.0, tool: 'axe' }),
      T('log_birch', '白桦', '#d8d0bc', '#b8b0a0', { hard: 1.0, tool: 'axe' }),
      T('log_jungle', '丛林木', '#6a7a3a', '#4f5c26', { hard: 1.1, tool: 'axe' }),
      T('log_acro', '金合欢木', '#a8703a', '#84521f', { hard: 1.0, tool: 'axe' }),
      T('leaves', '树叶', '#3f8a45', '#2f6b35', { hard: 0.3, solid: false }),
      T('leaves_pine', '松针', '#2f6b45', '#22523a', { hard: 0.3, solid: false }),
      T('leaves_dry', '枯叶', '#a8a04a', '#847c2f', { hard: 0.3, solid: false }),
      T('planks', '木板', '#b08a58', '#8f6d42', { hard: 0.8, tool: 'axe' }),
      // --- 植物 ---
      T('flower_red', '红花', '#e0553a', '#3f8a45', { hard: 0.15, solid: false }),
      T('flower_blue', '蓝花', '#5b7fe0', '#3f8a45', { hard: 0.15, solid: false }),
      T('flower_yellow', '黄花', '#f0c84a', '#3f8a45', { hard: 0.15, solid: false }),
      T('flower_white', '白花', '#f4f2e8', '#3f8a45', { hard: 0.15, solid: false }),
      T('flower_pink', '粉花', '#e08ac0', '#3f8a45', { hard: 0.15, solid: false }),
      T('mushroom_red', '红菇', '#c8402f', '#f0e8d0', { hard: 0.15, solid: false }),
      T('mushroom_brown', '棕菇', '#8a6a4a', '#e0d8c0', { hard: 0.15, solid: false }),
      T('tallgrass', '高草', '#4f9a55', '#3f7a45', { hard: 0.12, solid: false }),
      T('fern', '蕨', '#3f8a5a', '#2f6b45', { hard: 0.12, solid: false }),
      T('cactus', '仙人掌', '#3f8a4a', '#2f6b35', { hard: 0.5, tool: 'axe' }),
      T('reed', '芦苇', '#8aa85a', '#6b8a3f', { hard: 0.15, solid: false }),
      T('crop', '作物', '#d8c84a', '#a89a2f', { hard: 0.2, solid: false }),
      T('pumpkin', '南瓜', '#e08a2a', '#c86a1a', { hard: 0.6 }),
      T('melon', '西瓜', '#4f9a45', '#e0555a', { hard: 0.6 }),
      T('berry_bush', '浆果丛', '#3f7a45', '#c8324a', { hard: 0.35, solid: false }),
      // --- 沙与特殊 ---
      T('sandstone', '砂岩', '#d8c48a', '#b8a46a', { hard: 1.1, tool: 'pick' }),
      T('terracotta', '陶土', '#c08a62', '#9c6a46', { hard: 1.2, tool: 'pick' }),
      T('clay', '黏土', '#a8a8b8', '#8a8a9a', { hard: 0.7, tool: 'shovel' }),
      T('brick', '砖块', '#b05a48', '#8f4436', { hard: 1.4, tool: 'pick' }),
      T('stone_brick', '石砖', '#8f949b', '#74797f', { hard: 1.4, tool: 'pick' }),
      T('glass', '玻璃', '#c8e8f4', '#a0d0e4', { hard: 0.4, light: 0 }),
      // --- 功能块 ---
      T('torch', '火把', '#f0b04a', '#8a6a42', { hard: 0.1, solid: false, light: 1 }),
      T('lantern', '灯笼', '#f0d06a', '#a88a4a', { hard: 0.3, light: 1 }),
      T('furnace', '熔炉', '#7a7a80', '#f0a04a', { hard: 1.6, tool: 'pick', light: 0.2 }),
      T('chest', '箱子', '#b08a4a', '#8a6a32', { hard: 0.9, tool: 'axe' }),
      T('craft_table', '工作台', '#b08a58', '#8f6d42', { hard: 0.9, tool: 'axe' }),
      T('ladder', '梯子', '#a8895c', '#8a6c42', { hard: 0.3, solid: false }),
      T('snow_block', '雪块', '#f4f8fc', '#dbe4ee', { hard: 0.4 }),
      T('packed_ice', '浮冰', '#b8e0f4', '#94c4e0', { hard: 0.8, tool: 'pick' }),
      T('obsidian', '黑曜石', '#2a2438', '#3f3660', { hard: 6.0, tool: 'pick' }),
      T('bedrock', '基岩', '#2a2a30', '#1a1a1f', { hard: 999 }),
      T('ancient_brick', '远古砖', '#6a7a6a', '#4a5a4a', { hard: 3.0, tool: 'pick' }),
      T('rune_block', '符文石', '#5a5a8a', '#8a8af0', { hard: 3.2, tool: 'pick', light: 0.5 }),
      T('gold_block', '金块', '#f0c84a', '#c8a02a', { hard: 2.4, tool: 'pick' }),
      T('iron_block', '铁块', '#d8dce0', '#a8adb4', { hard: 2.6, tool: 'pick' }),
      T('diamond_block', '钻石块', '#6ff0e0', '#3fc8b8', { hard: 3.8, tool: 'pick', light: 0.2 }),
      T('mossy_stone', '苔石', '#7a8a70', '#5c6b52', { hard: 1.3, tool: 'pick' }),
      T('cracked_brick', '裂砖', '#9a8a78', '#7a6a58', { hard: 1.4, tool: 'pick' }),
    // --- 洞穴与层间 ---
    T('cave_entrance', '洞穴口', '#3a3440', '#191722', { hard: 0.8, solid: false, light: 0.3 }),
    T('ladder_up', '向上梯子', '#a8895c', '#ffd36e', { hard: 0.3, solid: false, light: 0.3 }),
    T('glow_moss', '荧光苔', '#5ac8a0', '#8affd0', { hard: 0.2, solid: false, light: 0.8 }),
    T('crystal', '水晶簇', '#7fd8f0', '#ffffff', { hard: 1.6, tool: 'pick', light: 0.9 }),
    T('stalagmite', '石笋', '#a8a49a', '#7d7a72', { hard: 1.0, tool: 'pick' }),
    T('deep_stone', '深岩', '#4a4a56', '#35353f', { hard: 2.2, tool: 'pick' }),
    T('gem_ore', '宝石矿', '#5a5a7a', '#c86af0', { hard: 4.2, tool: 'pick', light: 0.4 }),
    T('mithril_ore', '秘银矿', '#6a7a8a', '#b8e8ff', { hard: 5.0, tool: 'pick', light: 0.5 }),
    T('cave_mushroom', '洞穴菇', '#8a6ac8', '#e0d0ff', { hard: 0.15, solid: false, light: 0.3 }),
    // --- 结构用 ---
    T('ruin_brick', '遗迹砖', '#8a8272', '#6b6353', { hard: 2.0, tool: 'pick' }),
    T('ruin_pillar', '遗迹柱', '#9a9282', '#7a7262', { hard: 2.2, tool: 'pick' }),
    T('mossy_ruin', '苔藓遗迹砖', '#7a8a6a', '#5c6b4a', { hard: 2.0, tool: 'pick' }),
    T('dungeon_brick', '地牢砖', '#4a3f3a', '#332b28', { hard: 3.0, tool: 'pick' }),
    T('dungeon_floor', '地牢地砖', '#5a4f48', '#413834', { hard: 2.8, tool: 'pick' }),
    T('bars', '铁栏', '#8a8f96', '#5c6168', { hard: 2.4, tool: 'pick', solid: true }),
    T('spawner', '刷怪笼', '#3a3a42', '#8a5ad0', { hard: 3.6, tool: 'pick', light: 0.4 }),
    T('book_shelf', '书架', '#a8895c', '#c85a5a', { hard: 0.9, tool: 'axe' }),
    T('banner', '旗帜', '#c84a5a', '#f0d06a', { hard: 0.5, solid: false }),
    T('path', '石板路', '#a8a294', '#8a8478', { hard: 1.0, tool: 'pick' }),
    T('farmland', '农田', '#6b4f2f', '#8fc46b', { hard: 0.4, tool: 'shovel' }),
    T('hay', '干草块', '#d8c04a', '#b8a038', { hard: 0.4 }),
    T('well', '水井', '#8a8f96', '#3a76c8', { hard: 2.0, tool: 'pick' }),
    T('altar', '祭坛', '#5a5a8a', '#c86af0', { hard: 2.6, tool: 'pick', light: 0.6 }),
    T('nether_portal', '传送门', '#3a2a5a', '#a06af0', { hard: 8.0, tool: 'pick', light: 0.8 }),
    T('rune_stone', '符文碑', '#6a6a8a', '#8a8af0', { hard: 2.8, tool: 'pick', light: 0.35 }),
    ]

    const TILE = {}
    TILES.forEach((t, i) => { t.id = i; TILE[t.k] = t })

    /* ===================== 能不能走过去 =====================
       ★ 这里是最关键的一处修正。

       原来我只给方块打了 `solid`（能不能站上去），俯视视角下直接拿它
       当「挡不挡路」用 —— 结果**草地、沙地、石头这些地面全部被判成墙**，
       整个地表是一堵实心墙，玩家一格都迈不出去。
       用户反馈的「冒险世界怎么不能自由走动」，根因就在这。

       俯视视角里这两件事必须分开：
         · 地面（草/沙/石/雪/木板…）—— 能站在上面，也能走过去
         · 障碍（树干/仙人掌/箱子/工作台/遗迹砖墙…）—— 挡路
       所以下面单独列一张「真的挡路」的表，移动判定只看它。
       水不算障碍（能趟过去，只是慢）。 */
    const BLOCK_LIST = [
      // 树干与植物
      'log_oak', 'log_pine', 'log_birch', 'log_jungle', 'log_acro', 'cactus',
      // 家具与功能块
      'craft_table', 'chest', 'furnace', 'bars', 'spawner', 'book_shelf',
      'well', 'altar', 'nether_portal', 'rune_stone',
      // 结构用的砖墙
      'ruin_brick', 'ruin_pillar', 'dungeon_brick', 'stone_brick', 'deep_brick',
      'brick', 'cracked_brick', 'ancient_brick', 'rune_block', 'packed_ice',
      // 挖不动的
      'bedrock', 'obsidian',
    ]
    const BLOCKS = {}
    BLOCK_LIST.forEach((k) => { BLOCKS[k] = 1 })
    /** 这个方块挡不挡路 */
    function blocks(t) { return !!BLOCKS[t.k] }

    /* ===================== 生物群系 ===================== */
    const BIOMES = [
      { k: 'ocean', n: '海洋', top: 'water', sub: 'sand' },
      { k: 'beach', n: '沙滩', top: 'sand', sub: 'sand' },
      { k: 'plains', n: '草原', top: 'grass', sub: 'dirt', flora: ['flower_red', 'flower_blue', 'flower_yellow', 'tallgrass', 'tallgrass'] },
      { k: 'forest', n: '森林', top: 'grass', sub: 'dirt', tree: 'log_oak', leaf: 'leaves', treeRate: 0.13, flora: ['mushroom_brown', 'fern', 'tallgrass'] },
      { k: 'birch', n: '白桦林', top: 'grass', sub: 'dirt', tree: 'log_birch', leaf: 'leaves', treeRate: 0.11, flora: ['flower_white', 'fern'] },
      { k: 'pine', n: '松林', top: 'grass_dry', sub: 'dirt', tree: 'log_pine', leaf: 'leaves_pine', treeRate: 0.12, flora: ['fern', 'mushroom_brown'] },
      { k: 'jungle', n: '丛林', top: 'grass', sub: 'dirt', tree: 'log_jungle', leaf: 'leaves', treeRate: 0.2, flora: ['fern', 'berry_bush', 'mushroom_red'] },
      { k: 'savanna', n: '稀树草原', top: 'grass_dry', sub: 'dirt', tree: 'log_acro', leaf: 'leaves_dry', treeRate: 0.05, flora: ['tallgrass', 'tallgrass'] },
      { k: 'desert', n: '沙漠', top: 'sand', sub: 'sandstone', flora: ['cactus', 'cactus', 'mushroom_brown'] },
      { k: 'mesa', n: '红土台地', top: 'sand_red', sub: 'terracotta' },
      { k: 'snow', n: '雪原', top: 'snow', sub: 'dirt', tree: 'log_pine', leaf: 'leaves_pine', treeRate: 0.06, flora: [] },
      { k: 'tundra', n: '冻原', top: 'snow', sub: 'gravel', flora: [] },
      { k: 'swamp', n: '沼泽', top: 'mud', sub: 'clay', tree: 'log_oak', leaf: 'leaves', treeRate: 0.07, flora: ['reed', 'reed', 'mushroom_brown'] },
      { k: 'rocky', n: '岩滩', top: 'stone', sub: 'stone', flora: [] },
      { k: 'highland', n: '高地', top: 'stone', sub: 'granite', flora: [] },
      { k: 'lava_field', n: '熔岩原', top: 'basalt', sub: 'basalt', flora: [] },
    ]
    const BIOME = {}
    const LAYER_NAME = ['地表', '洞穴', '深层']
    BIOMES.forEach((b) => { BIOME[b.k] = b })

    /* ===================== 噪声 =====================
       自己写一个值噪声：整数格取伪随机值，中间用平滑插值。
       同一个种子 + 同一个坐标永远得到同一个值。 */
    function hash2(x, y, seed) {
      let h = x * 374761393 + y * 668265263 + seed * 2147483647
      h = (h ^ (h >> 13)) * 1274126177
      h = h ^ (h >> 16)
      return ((h >>> 0) % 100000) / 100000
    }
    function smooth(t) { return t * t * (3 - 2 * t) }
    function noise2(x, y, seed) {
      const xi = Math.floor(x), yi = Math.floor(y)
      const xf = x - xi, yf = y - yi
      const a = hash2(xi, yi, seed)
      const b = hash2(xi + 1, yi, seed)
      const c = hash2(xi, yi + 1, seed)
      const d = hash2(xi + 1, yi + 1, seed)
      const u = smooth(xf), v = smooth(yf)
      return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
    }
    /** 分形噪声：叠几层，得到更自然的地形 */
    function fbm(x, y, seed, oct) {
      let s = 0, amp = 1, f = 1, norm = 0
      const n = oct || 3
      for (let i = 0; i < n; i++) {
        s += noise2(x * f, y * f, seed + i * 97) * amp
        norm += amp
        amp *= 0.5
        f *= 2
      }
      return s / norm
    }

    /* ===================== 世界 ===================== */
    const CS = 16 // 块边长
    const world = new Map()   // 'cx,cy' -> Uint16Array(CS*CS)
    const edited = new Map()  // 'x,y' -> tileKey（玩家改过的格，存档用）
    const WORLD_SEED = 20240601

    const ck = (cx, cy, L) => cx + ',' + cy + ',' + (L || 0)

    /** 某个格「原始」是什么（没被玩家改过的话） */
    /* 矿脉：不是「按格子独立随机」撒矿点，而是**一小片一小片**地长。
       把世界切成 3×3 的小片，用哈希决定这片有没有矿、是哪种矿，
       然后再决定片里哪几格长。出来就是一簇一簇的，像矿脉。
       按深度换矿种：浅层煤铜铁，中层铁金红石青金石，深层钻石绿宝石秘银。 */
    const ORE_LADDER = [
      [['coal_ore', 0.55], ['copper_ore', 0.3], ['iron_ore', 0.4]],
      [['iron_ore', 0.45], ['gold_ore', 0.28], ['redstone_ore', 0.3], ['lapis_ore', 0.22]],
      [['diamond_ore', 0.2], ['emerald_ore', 0.14], ['quartz_ore', 0.3], ['sulfur_ore', 0.25], ['gem_ore', 0.1], ['mithril_ore', 0.06]],
    ]
    function veinAt(x, y, layer) {
      const vx = Math.floor(x / 3), vy = Math.floor(y / 3)
      if (hash2(vx, vy, WORLD_SEED + 900 + layer * 7) > 0.34) return null
      const table = ORE_LADDER[Math.min(layer, ORE_LADDER.length - 1)]
      const which = hash2(vx, vy, WORLD_SEED + 901 + layer * 7)
      let pick = null, acc = 0
      for (const pair of table) {
        acc += pair[1]
        if (which * 1.6 < acc) { pick = pair[0]; break }
      }
      if (!pick) pick = table[0][0]
      if (hash2(x, y, WORLD_SEED + 902 + layer * 7) > 0.62) return null
      return pick
    }

    /* 洞穴：用两层噪声相减，得到蜿蜒的通道，而不是一堆圆洞。
       两条噪声值接近的地方就是通道 —— 这样洞是连着的、能走通的。 */
    function caveOpen(x, y, layer) {
      const n1 = fbm(x / 34, y / 34, WORLD_SEED + 311 + layer * 13, 3)
      const n2 = fbm(x / 34 + 500, y / 34 + 500, WORLD_SEED + 411 + layer * 13, 3)
      const d = Math.abs(n1 - n2)
      return d < (layer === 1 ? 0.055 : 0.075)
    }
    function isHoleSpot(x, y) {
      return fbm(x / 90, y / 90, WORLD_SEED, 4) > 0.42 && hash2(x, y, WORLD_SEED + 661) < 0.004
    }

    /* ===================== 结构 =====================
       在「粗网格」上决定结构的位置：把世界切成 48×48 的大格，
       每个大格用哈希决定这里放不放结构、放哪种。
       这样结构是稀疏但确定的 —— 同一个位置永远能找到同一座遗迹，
       不会因为「这次没生成」而白跑一趟。

       结构用字符画写，'#'=主体 '.'=空 'o'=箱子 'L'=灯 'W'=水
       'P'=柱子 'F'=农田 'B'=书架 'S'=刷怪笼 */
    const STRUCT_GRID = 48

    const STRUCTS = {
      ruins: {
        n: '远古遗迹', layer: 0,
        rows: [
          'P....P....P....P',
          '................',
          '..##..####..##..',
          '..##..####..##..',
          '..#o..#LL#..o#..',
          '..####....####..',
          '.....#....#.....',
          '..####....####..',
          '..#o..#LL#..o#..',
          '..##..####..##..',
          '..##..####..##..',
          '................',
          'P....P....P....P',
        ],
        legend: { '#': 'ruin_brick', 'P': 'ruin_pillar', 'o': 'chest', 'L': 'lantern', '.': null },
      },
      dungeon: {
        n: '地牢', layer: 1,
        rows: [
          '################',
          '#..............#',
          '#.####.#####.#.#',
          '#.#o.#.....#.#.#',
          '#.#..#.###.#.#.#',
          '#....#.#S#.#...#',
          '#.####.#.#.####',
          '#......#.#.....#',
          '#.####.#####.#.#',
          '#.#o.#.....#.#.#',
          '#.#..#.###.#.#.#',
          '#....#...#.#...#',
          '#.####.#.#.#####',
          '#..............#',
          '################',
        ],
        legend: { '#': 'dungeon_brick', '.': 'dungeon_floor', 'o': 'chest', 'S': 'spawner' },
      },
      village: {
        n: '小村庄', layer: 0,
        rows: [
          'FFFFFFFFFFFFFF',
          'F############F',
          'F#..o#..L..#.F',
          'F#....#....#.F',
          'F####.####.#.F',
          'F...P......#.F',
          'F...#..####..F',
          'F...#..#o.#..F',
          'F###.#.#..#..F',
          'F..#.#.####..F',
          'F..#.P.......F',
          'F..#####..J..F',
          'F.....WW.....F',
          'FFFFFFFFFFFFFF',
        ],
        legend: { 'F': 'farmland', '#': 'planks', 'o': 'chest', 'L': 'lantern', 'P': 'path', 'W': 'well', 'J': 'hay', '.': null },
      },
      tower: {
        n: '法师塔', layer: 0,
        rows: [
          '..####..',
          '.#LLLL#.',
          '#.#..#.#',
          '#.#..#.#',
          '#.#..#.#',
          '#.#..#.#',
          '#.#..#.#',
          '#.#oo#.#',
          '#.####.#',
          '#......#',
          '#..##..#',
          '#..#A#.#',
          '####A###',
        ],
        legend: { '#': 'stone_brick', 'L': 'lantern', 'o': 'chest', 'A': 'altar', '.': null },
      },
      mineshaft: {
        n: '废弃矿洞', layer: 1,
        rows: [
          '................',
          '.#....#....#...',
          '.#....#....#...',
          '.#o...#..o.#...',
          '.#....#....#...',
          '.#....#....#...',
          '......#........',
          '.#....#....#...',
          '.#o...#....#...',
          '.#....#..o.#...',
          '.#....#....#...',
          '.#....#....#...',
        ],
        legend: { '#': 'log_oak', 'o': 'chest', '.': null },
      },
      rune_circle: {
        n: '符文阵', layer: 0,
        rows: [
          '....MMM.....',
          '..MM...MM...',
          '.M..RRR..M..',
          '.M.R.R.R.M..',
          'M..R...R..M.',
          'M.R..A..R.M.',
          'M..R...R..M.',
          '.M.R.R.R.M..',
          '.M..RRR..M..',
          '..MM...MM...',
          '....MMM.....',
        ],
        legend: { 'M': 'mossy_ruin', 'R': 'rune_stone', 'A': 'altar', '.': null },
      },
    }

    /** 这一大格里有没有结构、是哪种 */
    function structAt(gx, gy, layer) {
      const h = hash2(gx, gy, WORLD_SEED + 1301 + layer * 17)
      if (h > 0.42) return null // 一半以上的大格是空的
      const keys = Object.keys(STRUCTS).filter((k) => STRUCTS[k].layer === layer)
      if (!keys.length) return null
      const w = hash2(gx, gy, WORLD_SEED + 1302 + layer * 17)
      const k = keys[Math.floor(w * keys.length) % keys.length]
      // 结构在大格里的位置（留边，别压到格子边界上）
      const ox = Math.floor(hash2(gx, gy, WORLD_SEED + 1303) * (STRUCT_GRID - 20)) + 2
      const oy = Math.floor(hash2(gx, gy, WORLD_SEED + 1304) * (STRUCT_GRID - 20)) + 2
      return { key: k, x: gx * STRUCT_GRID + ox, y: gy * STRUCT_GRID + oy }
    }

    /** 某个格是不是落在某个结构里；是的话返回该放的方块（null = 不动） */
    function structTile(x, y, layer) {
      const gx = Math.floor(x / STRUCT_GRID), gy = Math.floor(y / STRUCT_GRID)
      // 结构可能跨到隔壁大格，所以周围 3×3 的都要查
      for (let j = gy - 1; j <= gy + 1; j++) {
        for (let i = gx - 1; i <= gx + 1; i++) {
          const st = structAt(i, j, layer)
          if (!st) continue
          const def = STRUCTS[st.key]
          const lx = x - st.x, ly = y - st.y
          if (ly < 0 || ly >= def.rows.length) continue
          const row = def.rows[ly]
          if (lx < 0 || lx >= row.length) continue
          const ch = row.charAt(lx)
          const k = def.legend[ch === undefined ? '.' : ch]
          if (k !== undefined) return { k: k, name: def.n }
        }
      }
      return null
    }

    const FOUND = {} // 发现过的结构（存档会存）

    function genTile(x, y, layer) {
      layer = layer || 0

      /* ---------- 洞穴口要**优先于结构** ----------
         结构（地牢、遗迹、塔…）会按自己的字符画覆盖地形，
         如果先放结构，正好压在洞穴口上的那几个就会被盖掉 ——
         地表没有入口、或者洞穴层没有回程梯子，
         玩家下去了就回不来。实测有 15/1006 个口被盖掉。
         所以洞口（和它对应的梯子）放在结构前面判定，
         结构让位 —— 顶多在墙上多一个小洞，不影响结构本身。 */
      if (layer === 0 && isHoleSpot(x, y)) return 'cave_entrance'
      if (layer === 1 && isHoleSpot(x, y)) return 'ladder_up'

      /* ---------- 结构 ---------- */
      const st = structTile(x, y, layer)
      if (st && st.k) return st.k

      /* ---------- 洞穴层 / 深层 ---------- */
      if (layer > 0) {
        if (isHoleSpot(x, y) && layer === 1) return 'ladder_up'
        if (caveOpen(x, y, layer)) {
          const w = hash2(x, y, WORLD_SEED + 555 + layer * 3)
          if (layer >= 2 && w < 0.05) return 'lava'
          if (layer === 1 && w < 0.06) return 'water'
          const deco = hash2(x, y, WORLD_SEED + 556 + layer * 3)
          if (deco < 0.02) return 'crystal'
          if (deco < 0.05) return 'glow_moss'
          if (deco < 0.07) return 'cave_mushroom'
          if (deco < 0.10) return 'stalagmite'
          return 'air'
        }
        const ore = veinAt(x, y, layer)
        if (ore) return ore
        return layer >= 2 ? 'deep_stone' : 'stone'
      }

      /* ---------- 地表 ---------- */
      // 高度：大陆
      const e = fbm(x / 90, y / 90, WORLD_SEED, 4)
      const m = fbm(x / 60 + 1000, y / 60 + 1000, WORLD_SEED + 31, 3) // 湿度
      const t = fbm(x / 130 - 500, y / 130 - 500, WORLD_SEED + 71, 2) // 温度
      const c = fbm(x / 26, y / 26, WORLD_SEED + 211, 3) // 洞穴/细节

      if (e < 0.30) return 'deep_water'
      if (e < 0.36) return 'water'
      if (e < 0.395) return 'sand'

      // 选群系
      let b
      if (t < 0.34) b = m > 0.55 ? 'snow' : 'tundra'
      else if (t > 0.66 && m < 0.4) b = m < 0.24 ? 'mesa' : 'desert'
      else if (m > 0.62) b = t > 0.55 ? 'jungle' : 'swamp'
      else if (m > 0.46) b = t < 0.45 ? 'pine' : 'forest'
      else if (m > 0.34) b = t < 0.42 ? 'birch' : 'plains'
      else b = t > 0.6 ? 'savanna' : 'plains'

      const B = BIOME[b]
      // 高处变石头
      if (e > 0.72) return c > 0.5 ? 'stone' : 'granite'
      if (e > 0.66 && b !== 'desert') return c > 0.5 ? 'stone' : B.top

      // 树：用另一层噪声决定「这一片有没有树」，避免每格独立随机变成撒芝麻
      if (B.tree && B.treeRate) {
        const tr = noise2(x / 7, y / 7, WORLD_SEED + 501)
        if (tr > 1 - B.treeRate) return B.tree
      }
      // 花草：更细的一层
      if (B.flora && B.flora.length) {
        const fr = hash2(x, y, WORLD_SEED + 777)
        if (fr < 0.16) return B.flora[Math.floor(hash2(x, y, WORLD_SEED + 778) * B.flora.length)]
      }
      return B.top
    }

    /** 生成一个块（只在没有的时候生成） */
    function genChunk(cx, cy, layer) {
      layer = layer || 0
      const key = ck(cx, cy, layer)
      let ch = world.get(key)
      if (ch) return ch
      ch = new Uint16Array(CS * CS)
      for (let j = 0; j < CS; j++) {
        for (let i = 0; i < CS; i++) {
          const x = cx * CS + i, y = cy * CS + j
          const ek = x + ',' + y + ',' + layer
          const key2 = edited.has(ek) ? edited.get(ek) : genTile(x, y, layer)
          ch[j * CS + i] = TILE[key2] ? TILE[key2].id : 0
        }
      }
      world.set(key, ch)
      return ch
    }

    function getTile(x, y, layer) {
      const L = layer == null ? P.layer : layer
      const cx = Math.floor(x / CS), cy = Math.floor(y / CS)
      const ch = genChunk(cx, cy, L)
      const i = x - cx * CS, j = y - cy * CS
      return TILES[ch[j * CS + i]] || TILE.air
    }

    function setTile(x, y, k, layer) {
      const L = layer == null ? P.layer : layer
      const cx = Math.floor(x / CS), cy = Math.floor(y / CS)
      const ch = genChunk(cx, cy, L)
      const i = x - cx * CS, j = y - cy * CS
      ch[j * CS + i] = TILE[k] ? TILE[k].id : 0
      edited.set(x + ',' + y + ',' + L, k)
    }

    /** 玩家周围的块都生成好 */
    function ensureAround(px, py, r, layer) {
      const L = layer == null ? P.layer : layer
      const cx = Math.floor(px / CS), cy = Math.floor(py / CS)
      for (let j = cy - r; j <= cy + r; j++) {
        for (let i = cx - r; i <= cx + r; i++) genChunk(i, j, L)
      }
    }

    /** 换算：这个格属于哪个群系（给 HUD 和生物生成用） */
    function biomeAt(x, y) {
      const e = fbm(x / 90, y / 90, WORLD_SEED, 4)
      const m = fbm(x / 60 + 1000, y / 60 + 1000, WORLD_SEED + 31, 3)
      const t = fbm(x / 130 - 500, y / 130 - 500, WORLD_SEED + 71, 2)
      if (e < 0.36) return BIOME.ocean
      if (e < 0.395) return BIOME.beach
      if (t < 0.34) return m > 0.55 ? BIOME.snow : BIOME.tundra
      if (t > 0.66 && m < 0.4) return m < 0.24 ? BIOME.mesa : BIOME.desert
      if (m > 0.62) return t > 0.55 ? BIOME.jungle : BIOME.swamp
      if (m > 0.46) return t < 0.45 ? BIOME.pine : BIOME.forest
      if (m > 0.34) return t < 0.42 ? BIOME.birch : BIOME.plains
      return t > 0.6 ? BIOME.savanna : BIOME.plains
    }

    /* ===================== 物品与合成 ===================== */
    const ITEMS = {}
    function item(k, n, o) {
      ITEMS[k] = Object.assign({ k, n, c: (TILE[k] && TILE[k].c) || '#999', c2: (TILE[k] && TILE[k].c2) || '#777' }, o || {})
      return ITEMS[k]
    }
    // 方块类物品
    TILES.forEach((t) => { if (t.k !== 'air') item(t.k, t.n) })
    // 工具与材料
    item('stick', '木棍', { c: '#a8895c', c2: '#8a6c42' })
    item('coal', '煤炭', { c: '#3a3a3a', c2: '#222' })
    item('iron_ingot', '铁锭', { c: '#d8dce0', c2: '#a8adb4' })
    item('gold_ingot', '金锭', { c: '#f0c84a', c2: '#c8a02a' })
    item('copper_ingot', '铜锭', { c: '#d08a52', c2: '#a86a38' })
    item('diamond', '钻石', { c: '#6ff0e0', c2: '#3fc8b8' })
    item('lapis', '青金石', { c: '#3f5fd0', c2: '#2a42a0' })
    item('redstone', '红石', { c: '#e0403a', c2: '#a82a26' })
    item('emerald', '绿宝石', { c: '#4fe08a', c2: '#2fa862' })
    item('quartz', '石英', { c: '#f4f0e6', c2: '#d0c8b8' })
    item('salt', '盐', { c: '#ffffff', c2: '#ddd' })
    item('sulfur', '硫磺', { c: '#f0e050', c2: '#c8b830' })
    item('apple', '苹果', { c: '#e5574b', c2: '#3f8a45', food: 4 })
    item('berry', '浆果', { c: '#c8324a', c2: '#3f7a45', food: 2 })
    item('bread', '面包', { c: '#d8a860', c2: '#b8863c', food: 6 })
    item('meat_raw', '生肉', { c: '#e08a8a', c2: '#b06060', food: 3 })
    item('meat_cooked', '熟肉', { c: '#b06a3a', c2: '#8a4a20', food: 8 })
    item('wood_pick', '木镐', { c: '#b08a58', c2: '#8f6d42', tool: 'pick', power: 2 })
    item('stone_pick', '石镐', { c: '#8f949b', c2: '#74797f', tool: 'pick', power: 3 })
    item('iron_pick', '铁镐', { c: '#d8dce0', c2: '#a8adb4', tool: 'pick', power: 5 })
    item('diamond_pick', '钻石镐', { c: '#6ff0e0', c2: '#3fc8b8', tool: 'pick', power: 8 })
    item('wood_axe', '木斧', { c: '#b08a58', c2: '#8f6d42', tool: 'axe', power: 2 })
    item('stone_axe', '石斧', { c: '#8f949b', c2: '#74797f', tool: 'axe', power: 3 })
    item('iron_axe', '铁斧', { c: '#d8dce0', c2: '#a8adb4', tool: 'axe', power: 5 })
    item('wood_shovel', '木铲', { c: '#b08a58', c2: '#8f6d42', tool: 'shovel', power: 2 })
    item('stone_shovel', '石铲', { c: '#8f949b', c2: '#74797f', tool: 'shovel', power: 3 })
    item('iron_shovel', '铁铲', { c: '#d8dce0', c2: '#a8adb4', tool: 'shovel', power: 5 })
    item('wood_sword', '木剑', { c: '#b08a58', c2: '#8f6d42', weapon: 3 })
    item('stone_sword', '石剑', { c: '#8f949b', c2: '#74797f', weapon: 5 })
    item('iron_sword', '铁剑', { c: '#d8dce0', c2: '#a8adb4', weapon: 8 })
    item('diamond_sword', '钻石剑', { c: '#6ff0e0', c2: '#3fc8b8', weapon: 13 })
    item('torch_item', '火把', { c: '#f0b04a', c2: '#8a6a42', place: 'torch' })
    item('ladder_up_item', '向上梯子', { c: '#a8895c', c2: '#ffd36e', place: 'ladder_up' })

    const RECIPES = [
      { out: 'planks', n: 4, need: { log_oak: 1 } },
      { out: 'planks', n: 4, need: { log_pine: 1 } },
      { out: 'planks', n: 4, need: { log_birch: 1 } },
      { out: 'planks', n: 4, need: { log_jungle: 1 } },
      { out: 'planks', n: 4, need: { log_acro: 1 } },
      { out: 'stick', n: 4, need: { planks: 2 } },
      { out: 'craft_table', n: 1, need: { planks: 4 } },
      { out: 'chest', n: 1, need: { planks: 8 } },
      { out: 'furnace', n: 1, need: { cobble: 8 } },
      { out: 'torch_item', n: 4, need: { stick: 1, coal: 1 } },
      { out: 'wood_pick', n: 1, need: { planks: 3, stick: 2 } },
      { out: 'stone_pick', n: 1, need: { cobble: 3, stick: 2 } },
      { out: 'iron_pick', n: 1, need: { iron_ingot: 3, stick: 2 } },
      { out: 'diamond_pick', n: 1, need: { diamond: 3, stick: 2 } },
      { out: 'wood_axe', n: 1, need: { planks: 3, stick: 2 } },
      { out: 'stone_axe', n: 1, need: { cobble: 3, stick: 2 } },
      { out: 'iron_axe', n: 1, need: { iron_ingot: 3, stick: 2 } },
      { out: 'wood_shovel', n: 1, need: { planks: 1, stick: 2 } },
      { out: 'stone_shovel', n: 1, need: { cobble: 1, stick: 2 } },
      { out: 'iron_shovel', n: 1, need: { iron_ingot: 1, stick: 2 } },
      { out: 'wood_sword', n: 1, need: { planks: 2, stick: 1 } },
      { out: 'stone_sword', n: 1, need: { cobble: 2, stick: 1 } },
      { out: 'iron_sword', n: 1, need: { iron_ingot: 2, stick: 1 } },
      { out: 'diamond_sword', n: 1, need: { diamond: 2, stick: 1 } },
      { out: 'stone_brick', n: 4, need: { stone: 4 } },
      { out: 'brick', n: 4, need: { clay: 4, coal: 1 } },
      { out: 'glass', n: 1, need: { sand: 1, coal: 1 } },
      { out: 'iron_block', n: 1, need: { iron_ingot: 9 } },
      { out: 'gold_block', n: 1, need: { gold_ingot: 9 } },
      { out: 'diamond_block', n: 1, need: { diamond: 9 } },
      { out: 'bread', n: 1, need: { crop: 3 } },
      { out: 'meat_cooked', n: 1, need: { meat_raw: 1, coal: 1 } },
      { out: 'sandstone', n: 1, need: { sand: 4 } },
      { out: 'lantern', n: 1, need: { iron_ingot: 1, torch_item: 1 } },
      { out: 'ladder', n: 3, need: { stick: 7 } },
      { out: 'ladder_up_item', n: 2, need: { stick: 7 } },
      { out: 'snow_block', n: 1, need: { snow: 4 } },
      { out: 'packed_ice', n: 1, need: { ice: 4 } },
    ]

    /* ===================== 生物 ===================== */
    const MOBS = [
      { k: 'pig', n: '猪', c: '#eda6c0', c2: '#c87f9a', hp: 10, dmg: 0, hostile: false, speed: 0.9, drop: 'meat_raw' },
      { k: 'cow', n: '牛', c: '#5c452d', c2: '#3f2f1f', hp: 12, dmg: 0, hostile: false, speed: 0.8, drop: 'meat_raw' },
      { k: 'sheep', n: '羊', c: '#f4f2e8', c2: '#d4d0c4', hp: 8, dmg: 0, hostile: false, speed: 0.7, drop: 'meat_raw' },
      { k: 'chicken', n: '鸡', c: '#f4f2e8', c2: '#e0553a', hp: 6, dmg: 0, hostile: false, speed: 1.0, drop: 'meat_raw' },
      { k: 'rabbit', n: '兔', c: '#c8b8a8', c2: '#a89888', hp: 5, dmg: 0, hostile: false, speed: 1.3, drop: 'meat_raw' },
      { k: 'fox', n: '狐狸', c: '#d08a4a', c2: '#f4f2e8', hp: 10, dmg: 0, hostile: false, speed: 1.4, drop: 'meat_raw' },
      { k: 'zombie', n: '褪色客', c: '#4a7a52', c2: '#2f5238', hp: 18, dmg: 3, hostile: true, speed: 0.7, drop: 'meat_raw', night: true },
      { k: 'skeleton', n: '线稿骸', c: '#e0e0d8', c2: '#b8b8b0', hp: 16, dmg: 4, hostile: true, speed: 0.8, range: 5, night: true },
      { k: 'spider', n: '蛛网怪', c: '#3a2f2a', c2: '#8a2a2a', hp: 14, dmg: 3, hostile: true, speed: 1.2, night: true },
      { k: 'slime', n: '糊图层', c: '#6fd06f', c2: '#3f9a3f', hp: 12, dmg: 2, hostile: true, speed: 0.6, drop: 'slimeball' },
      { k: 'creeper', n: '鼓包墨怪', c: '#5fae5f', c2: '#2f6b2f', hp: 16, dmg: 8, hostile: true, speed: 0.85, night: true },
      { k: 'bat', n: '橡皮屑', c: '#4a3a3a', c2: '#2a1f1f', hp: 5, dmg: 1, hostile: true, speed: 1.6 },
    ]
    item('slimeball', '黏液球', { c: '#6fd06f', c2: '#3f9a3f' })

    /* ===================== 游戏状态 ===================== */
    const P = {
      x: 0, y: 0,          // 格坐标
      rx: 0, ry: 0,        // 渲染插值位置
      hp: 20, maxHp: 20,
      food: 20,
      dir: 'down',
      layer: 0,            // 0 地表 / 1 洞穴 / 2 深层
      anim: 0,
      moving: null,        // 正在走的那一步
    }
    let bag = {}           // { itemKey: count }
    let hotbar = ['torch_item', 'dirt', 'planks', 'stone', 'craft_table', null, null, null, null]
    let sel = 0
    let mobs = []
    let time = 0.28        // 0~1，一天
    let dayLen = 240       // 一天多少秒
    let tick = 0
    let tab = 'bag'
    let deathCount = 0
    let minedCount = 0
    let placedCount = 0
    const dexSeen = {}
    const dexMob = {}     // 见过哪些生物（图鉴用）
    const kills = {}      // 每种生物打死了多少（冒险者工会的悬赏要用）

    /* ===================== 存档 ===================== */
    const SAVE_KEY = 'lw-town-save'
    function saveAll() {
      // 只存玩家改过的格 + 状态。原始地形靠种子重算，不用存。
      const ed = []
      edited.forEach((v, k2) => ed.push(k2 + '=' + v))
      const data = {
        x: P.x, y: P.y, layer: P.layer, hp: P.hp, food: P.food, time: time,
        bag: bag, hotbar: hotbar, sel: sel,
        ed: ed.slice(-4000), // 最多存 4000 格改动
        found: FOUND,
        dex: dexSeen, dmob: dexMob,
          kills: kills,
        mined: minedCount, placed: placedCount, deaths: deathCount,
      }
      let combo = {}
      try { combo = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') } catch (e) {}
      combo.world = data
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(combo)) } catch (e) {}
      const t = token()
      if (t) {
        fetch('/api/towngame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'save', save: combo }),
        }).catch(() => {})
      }
    }
    function loadAll() {
      try {
        const combo = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
        const d = combo.world
        if (!d) return false
        P.x = Number(d.x) || 0
        P.y = Number(d.y) || 0
        P.layer = Math.max(0, Math.min(2, Number(d.layer) || 0))
        P.hp = Number(d.hp) || 20
        P.food = Number(d.food) || 20
        time = typeof d.time === 'number' ? d.time : 0.28
        bag = d.bag || {}
        if (Array.isArray(d.hotbar) && d.hotbar.length === 9) hotbar = d.hotbar
        sel = Number(d.sel) || 0
        ;(d.ed || []).forEach((s) => {
          const i = String(s).indexOf('=')
          if (i > 0) edited.set(s.slice(0, i), s.slice(i + 1))
        })
        Object.assign(dexSeen, d.dex || {})
        Object.assign(dexMob, d.dmob || {})
        Object.assign(kills, d.kills || {})
        if (d.found) Object.assign(FOUND, d.found)
        minedCount = Number(d.mined) || 0
        placedCount = Number(d.placed) || 0
        deathCount = Number(d.deaths) || 0
        return true
      } catch (e) { return false }
    }

    /* ===================== 背包操作 ===================== */
    function give(k, n) {
      if (!ITEMS[k]) return
      bag[k] = (bag[k] || 0) + (n || 1)
      dexSeen[k] = 1
    }
    function take(k, n) {
      if ((bag[k] || 0) < n) return false
      bag[k] -= n
      if (bag[k] <= 0) delete bag[k]
      return true
    }
    function count(k) { return bag[k] || 0 }
    function canCraft(r) {
      for (const k in r.need) if (count(k) < r.need[k]) return false
      return true
    }

    /* ===================== 画布 ===================== */
    const cv = $('wdCv')
    const ctx = cv.getContext('2d')
    const stage = $('wdStage')
    const miniCv = $('wdMini')
    const mctx = miniCv.getContext('2d')
    let VIEW_W = 21, VIEW_H = 15 // 视野格数
    let cell = 20                 // 每格像素（CSS）
    let dpr = 1

    function resize() {
      const w = stage.clientWidth || 430
      // 视口高度按屏幕比例定，手机上别太扁
      /* 视野放大：原来高度只取屏幕的 52%，画布很扁，看得见的地方太少。
         现在取 68%（上限接近屏幕宽），格子也从 21px 提到 24px 上下。 */
      const h = Math.max(240, Math.min(Math.round(w * 0.95), Math.round(window.innerHeight * 0.68)))
      cell = Math.max(16, Math.floor(w / 19))
      VIEW_W = Math.max(17, Math.floor(w / cell))
      VIEW_H = Math.max(11, Math.floor(h / cell))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = VIEW_W * cell * dpr
      cv.height = VIEW_H * cell * dpr
      cv.style.width = w + 'px'
      cv.style.height = VIEW_H * cell + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
    }

    /* ===================== 画方块 =====================
       每个方块就是「底色 + 几个暗色点」，用坐标做稳定的伪随机，
       所以同一格每次画出来都一样，不会闪。 */
    function paintTile(x, y, px, py, t) {
      const c = cell
      ctx.fillStyle = t.c
      ctx.fillRect(px, py, c, c)
      // 纹理点
      const h = hash2(x, y, 4242)
      const n = 4
      ctx.fillStyle = t.c2
      for (let i = 0; i < n; i++) {
        const rx = hash2(x * 7 + i, y * 13 + i, 991)
        const ry = hash2(x * 11 + i, y * 17 + i, 992)
        const s = Math.max(1, Math.round(c * 0.16))
        ctx.fillRect(px + Math.floor(rx * (c - s)), py + Math.floor(ry * (c - s)), s, s)
      }
      // 一些方块额外画一笔，好认
      if (t.k === 'water' || t.k === 'deep_water') {
        ctx.fillStyle = 'rgba(255,255,255,.18)'
        ctx.fillRect(px + Math.floor(c * 0.2), py + Math.floor(c * 0.3), Math.floor(c * 0.4), Math.max(1, Math.round(c * 0.08)))
      } else if (/_ore$/.test(t.k)) {
        ctx.fillStyle = t.c2
        const s2 = Math.max(2, Math.round(c * 0.3))
        ctx.fillRect(px + Math.floor(c * 0.34), py + Math.floor(c * 0.34), s2, s2)
      } else if (t.k === 'torch' || t.k === 'lantern') {
        ctx.fillStyle = '#fff2c0'
        ctx.fillRect(px + Math.floor(c * 0.42), py + Math.floor(c * 0.3), Math.max(2, Math.round(c * 0.16)), Math.max(2, Math.round(c * 0.16)))
      } else if (/^log_/.test(t.k)) {
        ctx.fillStyle = t.c2
        ctx.fillRect(px + Math.floor(c * 0.42), py, Math.max(2, Math.round(c * 0.16)), c)
      } else if (t.k === 'cactus') {
        ctx.fillStyle = t.c2
        ctx.fillRect(px + Math.floor(c * 0.44), py, Math.max(2, Math.round(c * 0.12)), c)
      } else if (/_flower$/.test(t.k) || t.k === 'mushroom_red' || t.k === 'mushroom_brown') {
        const s3 = Math.max(2, Math.round(c * 0.34))
        ctx.fillRect(px + Math.floor((c - s3) / 2), py + Math.floor((c - s3) / 2), s3, s3)
      } else if (t.k === 'craft_table') {
        ctx.fillStyle = t.c2
        ctx.fillRect(px, py + Math.floor(c * 0.5), c, Math.max(1, Math.round(c * 0.08)))
        ctx.fillRect(px + Math.floor(c * 0.5), py, Math.max(1, Math.round(c * 0.08)), c)
      }
    }

    /** 夜色遮罩 */
    function nightAlpha() {
      // time: 0=清晨 0.25=正午 0.5=黄昏 0.75=午夜
      const a = Math.cos(time * Math.PI * 2) // 1=正午 -1=午夜
      const sky = Math.min(0.68, Math.max(0, (0.35 - a) * 0.52))
      // 洞里和深层本来就黑，跟昼夜无关
      if (P.layer === 1) return Math.max(sky, 0.62)
      if (P.layer === 2) return Math.max(sky, 0.86)
      return sky
    }
    function isNight() { return nightAlpha() > 0.28 }

    /* ===================== 渲染 ===================== */
    let hover = null

    function render() {
      const c = cell
      ctx.clearRect(0, 0, VIEW_W * c, VIEW_H * c)
      const halfW = Math.floor(VIEW_W / 2), halfH = Math.floor(VIEW_H / 2)
      const ox = P.rx, oy = P.ry
      const x0 = Math.round(ox) - halfW, y0 = Math.round(oy) - halfH

      // 地形
      for (let j = 0; j < VIEW_H; j++) {
        for (let i = 0; i < VIEW_W; i++) {
          const gx = x0 + i, gy = y0 + j
          const t = getTile(gx, gy, P.layer)
          paintTile(gx, gy, i * c, j * c, t)
        }
      }

      // 生物
      mobs.forEach((m) => {
        const sx = (m.x - x0) * c, sy = (m.y - y0) * c
        if (sx < -c || sy < -c || sx > VIEW_W * c || sy > VIEW_H * c) return
        const M = m.def
        const bob = Math.sin(m.t * 6) * c * 0.06
        ctx.fillStyle = M.c
        ctx.fillRect(sx + c * 0.16, sy + c * 0.2 + bob, c * 0.68, c * 0.6)
        ctx.fillStyle = M.c2
        ctx.fillRect(sx + c * 0.3, sy + c * 0.34 + bob, c * 0.14, c * 0.14)
        ctx.fillRect(sx + c * 0.56, sy + c * 0.34 + bob, c * 0.14, c * 0.14)
        // 血条
        if (m.hp < M.hp) {
          ctx.fillStyle = 'rgba(0,0,0,.5)'
          ctx.fillRect(sx + c * 0.1, sy + c * 0.04, c * 0.8, c * 0.08)
          ctx.fillStyle = '#e0554a'
          ctx.fillRect(sx + c * 0.1, sy + c * 0.04, c * 0.8 * (m.hp / M.hp), c * 0.08)
        }
      })

      // 玩家
      const px = (P.x - x0) * c, py = (P.y - y0) * c
      ctx.fillStyle = 'rgba(0,0,0,.28)'
      ctx.fillRect(px + c * 0.2, py + c * 0.74, c * 0.6, c * 0.16)
      ctx.fillStyle = '#ffd36e'
      ctx.fillRect(px + c * 0.2, py + c * 0.2, c * 0.6, c * 0.58)
      ctx.fillStyle = '#2f2a22'
      const ex = P.dir === 'left' ? 0.24 : P.dir === 'right' ? 0.56 : 0.3
      ctx.fillRect(px + c * ex, py + c * 0.36, c * 0.12, c * 0.12)
      ctx.fillRect(px + c * (ex + 0.16), py + c * 0.36, c * 0.12, c * 0.12)
      // 朝向的小标记
      ctx.fillStyle = 'rgba(255,255,255,.5)'
      const dx = P.dir === 'left' ? -1 : P.dir === 'right' ? 1 : 0
      const dy = P.dir === 'up' ? -1 : P.dir === 'down' ? 1 : 0
      ctx.fillRect(px + c * 0.45 + dx * c * 0.5, py + c * 0.45 + dy * c * 0.5, c * 0.1, c * 0.1)

      // 准星（玩家面朝的那一格）
      const fx = P.x + dx, fy = P.y + dy
      const hx = (fx - x0) * c, hy = (fy - y0) * c
      ctx.strokeStyle = 'rgba(255,255,255,.75)'
      ctx.lineWidth = 2
      ctx.strokeRect(hx + 1, hy + 1, c - 2, c - 2)
      hover = { x: fx, y: fy }

      /* 挖掘进度。
         ★ 原来挖一个方块要连点好几次（比如箱子 8 下），但画面上
         **一点反馈都没有**，玩家根本不知道自己有没有在挖、还差多少 ——
         玩起来就像「点不动」。现在在目标格上画一圈进度环。 */
      if (P.mining && P.mining.x === fx && P.mining.y === fy) {
        const t = getTile(fx, fy)
        const tool = ITEMS[heldItem()]
        let speed = 1
        if (tool && tool.tool && tool.tool === t.tool) speed = tool.power
        const dur = Math.max(0.05, t.hard / speed)
        const k = Math.min(1, P.mining.t / dur)
        // 底圈
        ctx.strokeStyle = 'rgba(0,0,0,.35)'
        ctx.lineWidth = Math.max(2, c * 0.14)
        ctx.beginPath()
        ctx.arc(hx + c / 2, hy + c / 2, c * 0.42, 0, 6.284)
        ctx.stroke()
        // 进度弧
        ctx.strokeStyle = k > 0.75 ? 'rgba(140,240,160,.95)' : 'rgba(255,225,140,.95)'
        ctx.beginPath()
        ctx.arc(hx + c / 2, hy + c / 2, c * 0.42, -1.5708, -1.5708 + 6.284 * k)
        ctx.stroke()
        // 四角敲击痕
        ctx.fillStyle = 'rgba(255,255,255,' + (0.2 + k * 0.5) + ')'
        const d2 = Math.max(1, c * 0.1)
        ctx.fillRect(hx + 2, hy + 2, d2, d2)
        ctx.fillRect(hx + c - 2 - d2, hy + c - 2 - d2, d2, d2)
      }

      // 夜色
      const na = nightAlpha()
      if (na > 0.01) {
        ctx.fillStyle = 'rgba(10,16,40,' + na + ')'
        ctx.fillRect(0, 0, VIEW_W * c, VIEW_H * c)
        // 火把/岩浆周围挖个亮圈
        for (let j = 0; j < VIEW_H; j++) {
          for (let i = 0; i < VIEW_W; i++) {
            const t = getTile(x0 + i, y0 + j, P.layer)
            if (t.light > 0) {
              const g = ctx.createRadialGradient(
                (i + 0.5) * c, (j + 0.5) * c, 0,
                (i + 0.5) * c, (j + 0.5) * c, c * 3.2
              )
              g.addColorStop(0, 'rgba(255,220,150,' + (na * 0.9) + ')')
              g.addColorStop(1, 'rgba(255,220,150,0)')
              ctx.globalCompositeOperation = 'lighter'
              ctx.fillStyle = g
              ctx.fillRect((i - 3) * c, (j - 3) * c, c * 7, c * 7)
              ctx.globalCompositeOperation = 'source-over'
            }
          }
        }
      }
      renderMini(x0, y0)
    }

    function renderMini(x0, y0) {
      const N = 32
      const w = miniCv.clientWidth || 92
      miniCv.width = N
      miniCv.height = N
      mctx.clearRect(0, 0, N, N)
      const cx = Math.round(P.rx) - Math.floor(N / 2)
      const cy = Math.round(P.ry) - Math.floor(N / 2)
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const t = getTile(cx + i, cy + j, P.layer)
          mctx.fillStyle = t.c
          mctx.fillRect(i, j, 1, 1)
        }
      }
      // 玩家
      mctx.fillStyle = '#fff'
      mctx.fillRect(Math.floor(N / 2) - 1, Math.floor(N / 2) - 1, 2, 2)
      // 生物
      mctx.fillStyle = '#ff5a4a'
      mobs.forEach((m) => {
        const mx = Math.round(m.x) - cx, my = Math.round(m.y) - cy
        if (mx >= 0 && my >= 0 && mx < N && my < N) mctx.fillRect(mx, my, 1, 1)
      })
    }

    /* ===================== 移动（一格一格） ===================== */
    function walkable(x, y) {
      const t = getTile(x, y)
      if (t.solid) return false
      return true
    }

    function tryMove(dir) {
      if (P.moving) return
      const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir]
      if (!d) return
      P.dir = dir
      const nx = P.x + d[0], ny = P.y + d[1]
      const t = getTile(nx, ny)
      if (blocks(t)) {
        // 撞墙就不动，但朝向要变
        render()
        return
      }
      P.moving = { fx: P.x, fy: P.y, tx: nx, ty: ny, t: 0, dur: 0.14 }
      try { window.sfx && window.sfx('tick') } catch (e) {}
      // 踩到水里/岩浆
      if (t.k === 'lava') { hurt(4, '岩浆烫到了') }
      else if (t.k === 'water' || t.k === 'deep_water') { /* 只减速 */ }
    }

    function updateMove(dt) {
      if (!P.moving) { P.rx = P.x; P.ry = P.y; return }
      const m = P.moving
      m.t += dt
      const k = Math.min(1, m.t / m.dur)
      P.rx = m.fx + (m.tx - m.fx) * k
      P.ry = m.fy + (m.ty - m.fy) * k
      if (k >= 1) {
        P.x = m.tx; P.y = m.ty
        P.rx = P.x; P.ry = P.y
        P.moving = null
        onEnterTile()
      }
    }

    /* 走到结构附近就记一笔「发现」。结构可能很大，
       所以按大格记录，不是按格子。 */
    function checkDiscover() {
      const gx = Math.floor(P.x / STRUCT_GRID), gy = Math.floor(P.y / STRUCT_GRID)
      for (let j = gy - 1; j <= gy + 1; j++) {
        for (let i = gx - 1; i <= gx + 1; i++) {
          const st = structAt(i, j, P.layer)
          if (!st) continue
          const d = Math.max(Math.abs(st.x - P.x), Math.abs(st.y - P.y))
          if (d > 14) continue
          const id = st.key + '@' + i + ',' + j
          if (FOUND[id]) continue
          FOUND[id] = { key: st.key, name: STRUCTS[st.key].n, at: Date.now(), layer: P.layer, x: st.x, y: st.y }
          toast('发现了 ' + STRUCTS[st.key].n + '！')
          try { window.sfx && window.sfx('achieve') } catch (e) {}
          refreshPane()
        }
      }
    }

    /* ★ 找一个**能站、而且走得动**的格子。
       这里踩过两次坑，都记下来：

       第一版出生点如果正好是实心块，代码是「往上顶直到不实心」——
       结果可能被顶到结构内部，四面都是墙，一步也走不了。

       第二版改成「自己不是实心、下面有支撑」就收工，
       结果找出来的可能是个**一格大的封闭小坑**：站得住，
       但四个方向全是实心 —— 表现就是「按住方向键只挪一格就卡死」。
       这是跑测试量出来的（按住右 1.5 秒只走了 1 格）。

       所以现在要求：自己 + 头顶都不是实心（人要能站直），
       而且四个方向里至少三个是通的（不能是个洞窟缝）。
       按这个条件从目标点一圈圈往外找，优先近的。 */
    function findStand(fromX, fromY, layer) {
      const L = layer == null ? P.layer : layer
      const pass = (x, y) => {
        const t = getTile(x, y, L)
        if (blocks(t)) return false
        if (t.k === 'lava' || t.k === 'deep_water') return false
        return true
      }
      const openAt = (x, y) => {
        if (!pass(x, y)) return false
        if (!pass(x, y - 1)) return false // 头顶要有空间，不然是条缝
        const below = getTile(x, y + 1, L)
        const footOk = below.solid || below.k === 'water' || below.k === 'deep_water'
        if (!footOk && !/water|deep_water/.test(getTile(x, y, L).k)) return false
        let n = 0
        if (pass(x + 1, y)) n++
        if (pass(x - 1, y)) n++
        if (pass(x, y + 1) || getTile(x, y + 1, L).solid) n++
        if (pass(x, y - 1)) n++
        return n >= 3
      }
      if (openAt(fromX, fromY)) return { x: fromX, y: fromY }
      // 先小范围搜（正常情况就在附近）
      for (let r = 1; r <= 100; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue
            if (openAt(fromX + dx, fromY + dy)) return { x: fromX + dx, y: fromY + dy }
          }
        }
      }
      // 实在找不到开阔地，退一步只要求「站得住」
      for (let r = 1; r <= 100; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue
            if (pass(fromX + dx, fromY + dy)) return { x: fromX + dx, y: fromY + dy }
          }
        }
      }
      return { x: fromX, y: fromY }
    }

    function onEnterTile() {
      checkDiscover()
      const t = getTile(P.x, P.y)
      if (t.k === 'berry_bush') {
        if (Math.random() < 0.5) { give('berry', 1); toast('摘到浆果') }
      }
      ensureAround(P.x, P.y, 2)
      // 生物生成：每走一步都有机会
      if (mobs.length < 26 && Math.random() < 0.12) spawnMob()
    }

    /* ===================== 挖掘 / 放置 ===================== */
    function frontTile() {
      const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[P.dir]
      return { x: P.x + d[0], y: P.y + d[1] }
    }

    function heldItem() {
      return hotbar[sel] || null
    }

    function mine() {
      const f = frontTile()
      const t = getTile(f.x, f.y)
      if (t.k === 'air' || t.k === 'bedrock') return toast(t.k === 'bedrock' ? '挖不动' : '这里没东西')
      if (t.k === 'water' || t.k === 'deep_water' || t.k === 'lava') return toast('这个挖不了')
      const tool = ITEMS[heldItem()]
      let speed = 1
      if (tool && tool.tool && tool.tool === t.tool) speed = tool.power
      const dur = Math.max(0.05, t.hard / speed)
      /* 挖掘是「连敲几下才掉」的：每敲一下进度加一点，
         敲够 dur 秒（按方块硬度和手上工具算）才真的挖掉。
         画面上那圈进度环就是读这里的数据画的，所以看得见还差多少。 */
      if (P.mining && P.mining.x === f.x && P.mining.y === f.y) {
        P.mining.t += 0.14
        render()
        if (P.mining.t < dur) {
          try { window.sfx && window.sfx('tick') } catch (e) {}
          return
        }
      } else {
        P.mining = { x: f.x, y: f.y, t: 0.14 }
        render()
        try { window.sfx && window.sfx('tick') } catch (e) {}
        return
      }
      // 挖掉
      P.mining = null
      setTile(f.x, f.y, 'air')
      minedCount++
      if (t.drop) give(t.drop, 1)
      try { window.sfx && window.sfx(t.tool === 'pick' ? 'hit' : 'tap') } catch (e) {}
      // 岩浆/水流下来不管（简化）
      // 树叶掉了可能掉树苗（这里掉苹果）
      if (t.k === 'leaves' && Math.random() < 0.06) give('apple', 1)
      render()
      refreshBar()
      refreshPane()
    }

    function place() {
      const k = heldItem()
      if (!k) return toast('手上没东西')
      const it = ITEMS[k]
      if (!it) return
      const placeAs = it.place || k
      if (!TILE[placeAs]) return toast('这个放不了')
      if (count(k) <= 0) return toast('没有了')
      const f = frontTile()
      const cur = getTile(f.x, f.y)
      /* ★ 这里原来是「目标必须是 air 才能放」—— 但这是俯视视角，
         地表每一格都是草地/沙地/石头，**根本没有 air**，
         所以放东西必然提示「那儿有东西」，一个都放不下去。
         用户反馈的「无法放置物品」就是这个。

         俯视视角下「放置」的正确含义是**替换地面**：
         草地、沙地、水面这些都能被盖掉，只有真正挡路的
         （树干、箱子、砖墙…）才不让盖，得先挖掉。

         另外原来还有一句「下面没支撑」——那是横版视角的规则，
         俯视视角没有重力，每格都在同一层，这句纯属从别处抄来的，
         一并去掉。 */
      if (blocks(cur)) return toast('那儿有东西挡着，先挖掉')
      setTile(f.x, f.y, placeAs)
      take(k, 1)
      placedCount++
      try { window.sfx && window.sfx('pop') } catch (e) {}
      render()
      refreshBar()
      refreshPane()
    }

    /* ---------- 层间移动 ----------
       下潜：地表要在「洞穴口」上；洞穴层只要下面那格是空的就能钻下去。
       上来：必须站在「向上梯子」上 —— 梯子可以用 7 根木棍合成，
             所以不会出现「下去了上不来」的死局。
       底下那层的对应位置也生成时留了梯子（见 isHoleSpot），
       但玩家如果自己挖了个新洞下去，就得自己带梯子。 */
    function canDescend() {
      const here = getTile(P.x, P.y)
      if (P.layer === 0) return here.k === 'cave_entrance'
      if (P.layer === 1) {
        const below = getTile(P.x, P.y, 2)
        return !TILE[below.k].solid || below.k === 'air'
      }
      return false
    }
    function canAscend() {
      if (P.layer === 0) return false
      return getTile(P.x, P.y).k === 'ladder_up'
    }

    function changeLayer(delta) {
      const to = P.layer + delta
      if (to < 0 || to > 2) return toast('到头了')
      if (delta > 0) {
        if (!canDescend()) {
          return toast(P.layer === 0 ? '要站在洞穴口上才能下去' : '脚下不是空的，挖开再说')
        }
      } else {
        if (!canAscend()) return toast('要站在向上梯子上才能上去（梯子用 7 根木棍合成）')
      }
      P.layer = to
      P.moving = null
      ensureAround(P.x, P.y, 2, P.layer)
      // 落地：换层之后也要找地方站稳
      {
        const sp = findStand(P.x, P.y, P.layer)
        P.x = sp.x; P.y = sp.y
      }
      P.rx = P.x; P.ry = P.y
      mobs = []
      for (let i = 0; i < (P.layer === 0 ? 4 : 6); i++) spawnMob()
      toast('来到' + LAYER_NAME[P.layer])
      try { window.sfx && window.sfx('nav') } catch (e) {}
      refreshClock(); refreshPane(); render()
    }

    /* ⛏ 键：只管挖。
       原来这里还想「手上有方块就顺手放下去」，但俯视视角下
       面前几乎总是有地面，结果就是「想挖却放不了、想放也放不了」，
       两边都别扭。现在分工明确：
         ⛏ 中间键 = 挖（也能打怪）
         🧱 右边按钮 / Shift+点 = 放
       手机上原来只能靠 Shift，等于放不了东西，所以右边专门加了个按钮。 */
    function use() {
      mine()
    }

    /* ===================== 生物 ===================== */
    function spawnMob() {
      // 在玩家周围 6~12 格找个能站的空位
      for (let tries = 0; tries < 30; tries++) {
        const a = Math.random() * 6.28
        const r = 6 + Math.random() * 6
        const x = Math.round(P.x + Math.cos(a) * r)
        const y = Math.round(P.y + Math.sin(a) * r)
        const t = getTile(x, y)
        if (blocks(t) || t.k === 'water' || t.k === 'deep_water') continue
        const under = getTile(x, y + 1)
        if (blocks(under)) continue // 不能站在障碍里
        // 选生物：敌对只在夜里/洞穴
        const night = isNight()
        const pool = MOBS.filter((m) => (m.hostile ? night : !night || !m.night))
        const def = pool[Math.floor(Math.random() * pool.length)]
        mobs.push({ def: def, x: x, y: y, hp: def.hp, t: Math.random() * 6, cd: 0 })
        dexMob[def.k] = 1
        return
      }
    }

    function updateMobs(dt) {
      const night = isNight()
      for (let i = mobs.length - 1; i >= 0; i--) {
        const m = mobs[i]
        m.t += dt
        const dist = Math.abs(m.x - P.x) + Math.abs(m.y - P.y)
        // 太远就回收
        if (dist > 26) { mobs.splice(i, 1); continue }
        // 白天把夜行怪晒掉
        if (m.def.night && !night && Math.random() < dt * 0.06) {
          m.hp -= 20
          if (m.hp <= 0) { mobs.splice(i, 1); continue }
        }
        m.cd -= dt
        if (m.cd > 0) continue
        m.cd = 0.5
        if (m.def.hostile && dist < 9 && dist > 0) {
          // 追玩家：朝玩家走一格
          const dx = Math.sign(P.x - m.x), dy = Math.sign(P.y - m.y)
          const opts = Math.abs(P.x - m.x) > Math.abs(P.y - m.y)
            ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]]
          for (const [ox, oy] of opts) {
            if (!ox && !oy) continue
            const nx = m.x + ox, ny = m.y + oy
            const nt = getTile(nx, ny)
            if (!blocks(nt) && nt.k !== 'water' && nt.k !== 'lava') {
              m.x = nx; m.y = ny
              break
            }
          }
          // 贴脸就打
          if (dist <= 1) hurt(m.def.dmg, m.def.n + ' 打了你一下')
        } else if (!m.def.hostile) {
          // 温顺的随机游荡
          if (Math.random() < 0.5) {
            const d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)]
            const nx = m.x + d[0], ny = m.y + d[1]
            const nt = getTile(nx, ny)
            if (!blocks(nt) && nt.k !== 'water' && nt.k !== 'lava') { m.x = nx; m.y = ny }
          }
        }
      }
    }

    /** 打面朝那一格上的生物 */
    function attack() {
      const f = frontTile()
      const idx = mobs.findIndex((m) => m.x === f.x && m.y === f.y)
      if (idx < 0) return false
      const m = mobs[idx]
      const it = ITEMS[heldItem()]
      const dmg = (it && it.weapon) || 1
      m.hp -= dmg
      try { window.sfx && window.sfx('hit') } catch (e) {}
      toast('打中 ' + m.def.n + ' −' + dmg)
      if (m.hp <= 0) {
        if (m.def.drop) give(m.def.drop, 1)
        kills[m.def.k] = (kills[m.def.k] || 0) + 1
        toast(m.def.n + ' 倒下了（已讨伐 ' + kills[m.def.k] + ' 只）')
        mobs.splice(idx, 1)
      }
      return true
    }

    function hurt(n, why) {
      if (P.hp <= 0) return
      P.hp = Math.max(0, P.hp - n)
      toast(why + ' −' + n)
      refreshClock()
      if (P.hp <= 0) {
        deathCount++
        // 回出生点，掉一半东西
        P.hp = P.maxHp
        P.food = Math.max(6, P.food - 4)
        Object.keys(bag).forEach((k) => { bag[k] = Math.max(0, Math.floor(bag[k] / 2)) })
        P.x = 0; P.y = 0; P.moving = null
        ensureAround(0, 0, 2)
        toast('你倒下了，回到出生点（掉了一半东西）')
        try { window.sfx && window.sfx('fail') } catch (e) {}
        saveAll()
      }
    }

    function eat() {
      // 吃背包里最合适的食物
      const order = ['meat_cooked', 'bread', 'apple', 'meat_raw', 'berry']
      for (const k of order) {
        if (count(k) > 0) {
          take(k, 1)
          P.food = Math.min(20, P.food + (ITEMS[k].food || 2))
          P.hp = Math.min(P.maxHp, P.hp + 2)
          toast('吃了 ' + ITEMS[k].n)
          try { window.sfx && window.sfx('eat') } catch (e) {}
          refreshClock(); refreshBar(); refreshPane()
          return
        }
      }
      toast('背包里没吃的')
    }

    /* ===================== UI ===================== */
    function toast(t) {
      const el = $('wdToast')
      el.textContent = t
      el.classList.remove('show')
      void el.offsetWidth
      el.classList.add('show')
    }

    function refreshBar() {
      const bar = $('wdBar')
      bar.innerHTML = ''
      hotbar.forEach((k, i) => {
        const b = document.createElement('div')
        b.className = 'wd-slot' + (i === sel ? ' on' : '')
        const it = ITEMS[k]
        if (it) {
          b.innerHTML = '<div class="wd-sq" style="background:' + it.c + '"></div>' +
            (count(k) > 0 ? '<span class="wd-n">' + count(k) + '</span>' : '')
          b.title = it.n
        }
        b.addEventListener('click', () => { sel = i; refreshBar(); render() })
        bar.appendChild(b)
      })
    }

    function refreshClock() {
      const na = nightAlpha()
      const icon = na < 0.1 ? '☀️' : na < 0.3 ? '🌤' : na < 0.5 ? '🌆' : '🌙'
      const hh = Math.floor(((time * 24) + 6) % 24)
      $('wdClock').innerHTML = icon + ' ' + String(hh).padStart(2, '0') + ':00'
      const b = P.layer > 0 ? { n: LAYER_NAME[P.layer] } : biomeAt(P.x, P.y)
      // 带上坐标：走路时能看见自己在动，也方便和工会的悬赏对上
      $('wdWhere').innerHTML =
        '<b>' + esc(b.n) + '</b> · ❤️' + P.hp + ' · 🍗' + P.food +
        '<br><span class="wd-pos" data-pos="' + P.x + ',' + P.y + '" style="opacity:.7;font-size:10.5px">' + P.x + ', ' + P.y + '</span>'
      const lc = $('wdLayerChip')
      if (lc) {
        lc.textContent = ['🟩 地表', '🕳️ 洞穴', '🌑 深层'][P.layer]
        lc.style.color = P.layer === 0 ? '#b6f0c8' : P.layer === 1 ? '#d8c8a0' : '#b8a0d8'
      }
      const dn = $('wdDown'), up = $('wdUp')
      if (dn) dn.disabled = !canDescend()
      if (up) up.disabled = !canAscend()
    }

    function itemSq(it, size) {
      return '<div class="wd-sq" style="background:' + it.c + (size ? ';width:' + size + 'px;height:' + size + 'px' : '') + '"></div>'
    }

    function refreshPane() {
      const pane = $('wdPane')
      if (tab === 'bag') {
        const keys = Object.keys(bag).filter((k) => bag[k] > 0)
        if (!keys.length) { pane.innerHTML = '<h4>🎒 背包</h4><div style="opacity:.7">空的。去挖点东西吧 —— 对着方块按 ⛏ 键。</div>'; return }
        keys.sort((a, b) => (ITEMS[b] ? ITEMS[b].n : '').localeCompare(ITEMS[a] ? ITEMS[a].n : ''))
        pane.innerHTML = '<h4>🎒 背包（' + keys.length + ' 种）</h4><div class="wd-grid">' +
          keys.map((k) => {
            const it = ITEMS[k] || { n: k, c: '#999' }
            return '<div class="wd-cell" data-item="' + esc(k) + '" title="' + esc(it.n) + '">' +
              itemSq(it) + '<span class="wd-n">' + bag[k] + '</span></div>'
          }).join('') + '</div>' +
          '<div style="margin-top:10px;font-size:11.5px;opacity:.75">点背包里的方块 → 放进手上的槽位（替换当前选中的那格）</div>'
        pane.querySelectorAll('[data-item]').forEach((el) => {
          el.onclick = () => {
            const k = el.getAttribute('data-item')
            hotbar[sel] = k
            refreshBar()
            toast('手上换成 ' + (ITEMS[k] ? ITEMS[k].n : k))
            try { window.sfx && window.sfx('select') } catch (e) {}
          }
        })
      } else if (tab === 'craft') {
        const rows = RECIPES.map((r, i) => {
          const out = ITEMS[r.out] || { n: r.out, c: '#999' }
          const cost = Object.keys(r.need).map((k) => {
            const have = count(k), need = r.need[k]
            const nm = ITEMS[k] ? ITEMS[k].n : k
            return '<span style="color:' + (have >= need ? 'inherit' : '#c0453b') + '">' + nm + ' ' + have + '/' + need + '</span>'
          }).join(' + ')
          const ok = canCraft(r)
          return '<div class="wd-recipe">' +
            '<div class="wd-out">' + itemSq(out) +
            '<div><b>' + esc(out.n) + '</b> × ' + r.n +
            '<div class="wd-cost">' + cost + '</div></div></div>' +
            '<button data-craft="' + i + '" ' + (ok ? '' : 'disabled') + '>合成</button></div>'
        }).join('')
        pane.innerHTML = '<h4>🔨 合成（' + RECIPES.length + ' 种配方）</h4>' + rows
        pane.querySelectorAll('[data-craft]').forEach((b) => {
          b.onclick = () => {
            const r = RECIPES[Number(b.getAttribute('data-craft'))]
            if (!r || !canCraft(r)) return
            for (const k in r.need) take(k, r.need[k])
            give(r.out, r.n)
            try { window.sfx && window.sfx('save') } catch (e) {}
            toast('做出了 ' + (ITEMS[r.out] ? ITEMS[r.out].n : r.out) + ' × ' + r.n)
            refreshBar(); refreshPane()
          }
        })
      } else if (tab === 'dex') {
        const found = TILES.filter((t) => t.k !== 'air' && dexSeen[t.k]).length
        const total = TILES.filter((t) => t.k !== 'air').length
        const mobFound = MOBS.filter((m) => dexMob[m.k]).length
        pane.innerHTML =
          '<h4>📖 图鉴</h4>' +
          '<div style="margin-bottom:8px">方块 <b>' + found + '</b> / ' + total +
          ' · 生物 <b>' + mobFound + '</b> / ' + MOBS.length + '</div>' +
          '<div class="wd-grid">' + TILES.filter((t) => t.k !== 'air').map((t) => {
            const got = dexSeen[t.k]
            return '<div class="wd-cell' + (got ? '' : ' locked') + '" title="' + esc(t.n) + '">' +
              '<div class="wd-sq" style="background:' + (got ? t.c : '#888') + '"></div></div>'
          }).join('') + '</div>' +
          '<h4 style="margin-top:14px">🏛️ 发现的结构（' + Object.keys(FOUND).length + '）</h4>' +
          (Object.keys(FOUND).length
            ? '<div style="line-height:2;font-size:12px">' +
              Object.keys(FOUND).map((id) => {
                const f = FOUND[id]
                return '· ' + esc(f.name) + ' <span style="opacity:.6">' + LAYER_NAME[f.layer] + ' ' + f.x + ',' + f.y + '</span>'
              }).join('<br>') + '</div>'
            : '<div style="opacity:.7;font-size:12px">还没发现什么。地表上的遗迹、村庄、塔，洞穴里的地牢和矿洞，都是随机散布的 —— 出去走走吧。</div>') +
          '<h4 style="margin-top:14px">🐾 生物</h4>' +
          '<div class="wd-grid">' + MOBS.map((m) => {
            const got = dexMob[m.k]
            return '<div class="wd-cell' + (got ? '' : ' locked') + '" title="' + esc(got ? m.n : '？？？') + '">' +
              '<div class="wd-sq" style="background:' + (got ? m.c : '#888') + '"></div></div>'
          }).join('') + '</div>'
      } else {
        pane.innerHTML =
          '<h4>📊 统计</h4>' +
          '<div style="line-height:2">' +
          '坐标 <b>' + P.x + ', ' + P.y + '</b><br>' +
          '所在层 <b>' + LAYER_NAME[P.layer] + '</b>' +
          (P.layer === 0 ? '（' + esc(biomeAt(P.x, P.y).n) + '）' : '') + '<br>' +
          '挖掉方块 <b>' + minedCount + '</b> 个<br>' +
          '放置方块 <b>' + placedCount + '</b> 个<br>' +
          '倒下 <b>' + deathCount + '</b> 次<br>' +
          '背包物品种类 <b>' + Object.keys(bag).filter((k) => bag[k] > 0).length + '</b><br>' +
          '发现的结构 <b>' + Object.keys(FOUND).length + '</b> 处<br>' +
          '附近生物 <b>' + mobs.length + '</b> 只' +
          '</div>' +
          '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">' +
          '<button id="wdEat" style="padding:8px 16px;border:1px solid #d3bb93;border-radius:8px;background:#fff6e4;font-family:inherit;font-size:13px;cursor:pointer">🍗 吃东西</button>' +
          '<button id="wdSpawn" style="padding:8px 16px;border:1px solid #d3bb93;border-radius:8px;background:#fff6e4;font-family:inherit;font-size:13px;cursor:pointer">🐾 引一只生物过来</button>' +
          '<button id="wdFind" style="padding:8px 16px;border:1px solid #d3bb93;border-radius:8px;background:#fff6e4;font-family:inherit;font-size:13px;cursor:pointer">🧭 找最近的结构</button>' +
          '</div>'
        const e1 = $('wdEat')
        if (e1) e1.onclick = eat
        const e2 = $('wdSpawn')
        if (e2) e2.onclick = () => { spawnMob(); toast('附近出现了一只生物'); refreshPane() }
        const e3 = $('wdFind')
        if (e3) e3.onclick = () => {
          // 在周围 6 个大格里找最近的一个结构，给方向和距离
          const gx = Math.floor(P.x / STRUCT_GRID), gy = Math.floor(P.y / STRUCT_GRID)
          let bestN = null
          for (let r = 1; r <= 6 && !bestN; r++) {
            for (let j = gy - r; j <= gy + r; j++) {
              for (let i = gx - r; i <= gx + r; i++) {
                const st = structAt(i, j, P.layer)
                if (!st) continue
                const d = Math.hypot(st.x - P.x, st.y - P.y)
                if (!bestN || d < bestN.d) bestN = { st: st, d: d }
              }
            }
          }
          if (!bestN) { toast('这一带没什么结构，走远点看看'); return }
          const dx = bestN.st.x - P.x, dy = bestN.st.y - P.y
          const dir = Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? '东' : '西') : (dy > 0 ? '南' : '北')
          toast(STRUCTS[bestN.st.key].n + ' 在' + dir + '边约 ' + Math.round(bestN.d) + ' 格')
        }
      }
    }

    function switchTab(t) {
      tab = t
      document.querySelectorAll('#wdTabs button').forEach((b) => {
        b.classList.toggle('on', b.getAttribute('data-tab') === t)
      })
      refreshPane()
    }

    /* ===================== 输入 ===================== */
    /* ★ 这里原来有个坑：为了不让「系统自动重复」触发多次，
       按下时加了 `if (keysDown[k]) return`，
       结果**按住方向键只走一格**，松开再按才走第二格 ——
       玩起来就是「不能自由走动」。用户反馈的正是这个。
       改法：按键只负责记录「现在按着哪些键」，
       真正的移动放到主循环里 —— 一直按着就一直走。 */
    const keysDown = {}
    const held = {}
    const DIR_KEYS = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' }

    function onKey(e, down) {
      const k = e.code
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(k)) e.preventDefault()
      if (DIR_KEYS[k]) {
        held[DIR_KEYS[k]] = down
        if (down && !P.moving) tryMove(DIR_KEYS[k])
        return
      }
      if (!down) { keysDown[k] = false; return }
      if (keysDown[k]) return
      keysDown[k] = true
      if (k === 'ArrowUp' || k === 'KeyW') tryMove('up')
      else if (k === 'ArrowDown' || k === 'KeyS') tryMove('down')
      else if (k === 'ArrowLeft' || k === 'KeyA') tryMove('left')
      else if (k === 'ArrowRight' || k === 'KeyD') tryMove('right')
      else if (k === 'Space') { if (!attack()) use() }
      else if (k === 'KeyE') eat()
      else if (k === 'KeyF') place()
      else if (k === 'KeyR') changeLayer(1)
      else if (k === 'KeyT') changeLayer(-1)
      else if (k === 'KeyQ') { attack(); }
      else if (k >= 'Digit1' && k <= 'Digit9') { sel = Number(k.slice(5)) - 1; refreshBar(); render() }
      else if (k === 'Tab') { e.preventDefault(); switchTab(tab === 'bag' ? 'craft' : tab === 'craft' ? 'dex' : 'bag') }
    }
    const kd = (e) => onKey(e, true)
    const ku = (e) => onKey(e, false)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)

    // 点击画布：挖/放
    function canvasClick(e) {
      const r = cv.getBoundingClientRect()
      const x = Math.floor((e.clientX - r.left) / cell) - Math.floor(VIEW_W / 2) + Math.round(P.rx)
      const y = Math.floor((e.clientY - r.top) / cell) - Math.floor(VIEW_H / 2) + Math.round(P.ry)
      // 转向指向点的那一格（只取四方向里最接近的）
      const dx = x - P.x, dy = y - P.y
      if (Math.abs(dx) > Math.abs(dy)) P.dir = dx > 0 ? 'right' : 'left'
      else if (dy !== 0) P.dir = dy > 0 ? 'down' : 'up'
      if (e.shiftKey) place()
      else if (attack()) { /* 打到生物了 */ }
      else use()
      render()
    }
    cv.addEventListener('click', canvasClick)

    // 方向键
    document.querySelectorAll('.wd-dpad button[data-dir]').forEach((b) => {
      b.addEventListener('click', () => {
        const d = b.getAttribute('data-dir')
        if (d === 'act') { if (!attack()) use() }
        else tryMove(d)
      })
    })

    $('wdPlace').onclick = () => place()
    $('wdDown').onclick = () => changeLayer(1)
    $('wdUp').onclick = () => changeLayer(-1)
    $('wdSave').onclick = () => { saveAll(); toast('存好了'); try { window.sfx && window.sfx('save') } catch (e) {} }
    /* 帮助。这里原来用 lwAlert 塞了 HTML —— 显示出来是一堆源码。
       改用 lwPanel（正文走 innerHTML）。 */
    $('wdHelp').onclick = () => {
      lwPanel(
        '<b style="font-size:15px">🧭 怎么玩</b>' +
        '<div style="text-align:left;font-size:13px;line-height:2;margin-top:8px">' +
        '<b>走路</b><br>' +
        '· 方向键 / WASD，**按住就会一直走**（手机上按住左下角方向键）<br>' +
        '· 走不了的地方是墙：树干、仙人掌、箱子、遗迹砖墙这些<br>' +
        '<b>动手</b><br>' +
        '· 空格 / 点画布 / 中间的 ⛏：挖面前的方块、或打面前的生物<br>' +
        '· 右边「🧱 放一个」（或 Shift + 点）：把手上的方块盖到面前<br>' +
        '· 1~9 换手上的槽位　E 吃东西<br>' +
        '<b>上下层</b><br>' +
        '· 站在<b>洞穴口</b>上点「⬇ 下去」进洞穴层<br>' +
        '· 站在<b>向上梯子</b>上点「⬆ 上来」回地表<br>' +
        '· 梯子用 7 根木棍合成，自己挖的新洞要自己带梯子<br>' +
        '<b>小心</b><br>' +
        '· 天黑会刷怪，火把能照亮　岩浆会烫伤<br>' +
        '· 血没了回出生点，掉一半东西' +
        '</div>' +
        '<button data-close style="width:100%;margin-top:14px;padding:11px;border:1px solid #d3bb93;' +
        'border-radius:12px;background:#fff6e4;color:#4a3a20;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer">知道了</button>'
      ).then(() => {})
    }

    document.querySelectorAll('#wdTabs button').forEach((b) => {
      b.addEventListener('click', () => switchTab(b.getAttribute('data-tab')))
    })

    /* ===================== 主循环 ===================== */
    let raf = 0, last = 0, fpsAcc = 0, fpsN = 0

    function tickWorld(dt) {
      time = (time + dt / dayLen) % 1
      tick++
      updateMove(dt)
      /* 一直按着方向键就一直走。放在主循环里而不是按键回调里，
         因为按键回调只在按下的瞬间触发一次。 */
      if (!P.moving) {
        if (held.up) tryMove('up')
        else if (held.down) tryMove('down')
        else if (held.left) tryMove('left')
        else if (held.right) tryMove('right')
      }
      updateMobs(dt)
      // 饥饿：每 20 秒掉一点
      if (tick % 1200 === 0 && P.food > 0) { P.food--; refreshClock() }
      if (P.food <= 0 && tick % 600 === 0) hurt(1, '饿着肚子')
      // 自动回血
      if (P.food > 12 && tick % 1800 === 0 && P.hp < P.maxHp) { P.hp++; refreshClock() }
    }

    function loop(t) {
      if (!last) last = t
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      tickWorld(dt)
      render()
      refreshClock()
      raf = requestAnimationFrame(loop)
    }

    /* ===================== 启动 ===================== */
    if (!loadAll()) {
      // 新玩家：给一点起步物资
      give('torch_item', 8)
      give('planks', 16)
      give('craft_table', 1)
      give('bread', 3)
      give('wood_pick', 1)
      give('wood_sword', 1)
      give('ladder_up_item', 3)
      hotbar = ['torch_item', 'planks', 'craft_table', 'wood_pick', 'wood_sword', 'bread', 'dirt', 'stone', null]
    }
    ensureAround(P.x, P.y, 3)
    // 落地：从出生点向外找一个真的能站的地方
    {
      const sp = findStand(P.x, P.y, P.layer)
      P.x = sp.x; P.y = sp.y
    }
    P.rx = P.x; P.ry = P.y
    // 开局给几只温顺的
    for (let i = 0; i < 4; i++) spawnMob()

    resize()
    refreshBar()
    refreshClock()
    refreshPane()
    render()
    raf = requestAnimationFrame(loop)
    window.addEventListener('resize', resize)

    // 离开时停掉，并自动存一次
    const stop = () => {
      cancelAnimationFrame(raf)
      saveAll()
    }
    window.addEventListener('lw-leave', stop)
    window.addEventListener('pagehide', stop)
    // 定时自动存
    const autosave = setInterval(saveAll, 30000)

    // 给外部（成就/统计）用
    window.__lwWorld = {
      /* 测试钩子：手动推若干帧。
         无头浏览器在 --virtual-time-budget 下 requestAnimationFrame
         根本不触发，主循环不跑，所以没法用它验证「走得动走不动」。
         这里把主循环那一步暴露出来，测试里直接调。 */
      step: (n, dt) => {
        for (let i = 0; i < (n || 1); i++) tickWorld(dt || 0.05)
        render(); refreshClock()
      },
      move: (dir) => tryMove(dir),
      hold: (dir, on) => { held[dir] = !!on },
      at: () => ({ x: P.x, y: P.y, layer: P.layer, moving: !!P.moving }),
      place: () => place(),
      give: (k, nn) => give(k, nn || 1),
      hold: (k) => { hotbar[sel] = k; refreshBar() },
      count: (k) => count(k),
      mine: () => mine(),
      front: () => frontTile(),
      tile: (x, y, l) => { const t = getTile(x, y, l == null ? P.layer : l); return t.k + (blocks(t) ? '(挡路)' : '(能走)') },
      grid: (x0, y0, w, h) => {
        const rows = []
        for (let j = 0; j < h; j++) {
          let r = ''
          for (let i = 0; i < w; i++) {
            const t = getTile(x0 + i, y0 + j)
            r += blocks(t) ? '#' : '.'
          }
          rows.push(r)
        }
        return rows
      },
      stats: () => ({ mined: minedCount, placed: placedCount, deaths: deathCount, mobs: Object.keys(dexMob).length, blocks: Object.keys(dexSeen).length,
        kills: kills, structs: Object.keys(FOUND).length, layer: P.layer, }),
    }
  },
}
