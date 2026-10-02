// 由 changelog.html 自动转换为 Vue 3 视图（无构建）
export default {
  name: 'changelog',
  title: '更新日志',
  css: `
      /* 返回键：以前这三个页面既没有底部导航、也没有返回按钮，
         进去了只能按浏览器的后退。齿轮按钮删掉之后更是彻底出不去。 */
      .cl-back {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--border-strong);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        padding: 6px 13px;
        font-size: 12px;
        font-weight: 700;
        text-decoration: none;
        margin-bottom: 12px;
      }
      /* hidden 属性兜底：避免类选择器里的 display 覆盖 UA 的 [hidden]{display:none} */
      [hidden] { display: none !important; }

      :root {
        --bg: #faf5ef;
        --surface: #ffffff;
        --surface-2: #efe9e0;
        --text: #3b342c;
        --text-muted: #6b5f50;
        --text-faint: #b0a697;
        --border: #efe7da;
        --border-strong: #e0d3c0;
        --shadow: rgba(80, 60, 40, 0.08);
        --shadow-hover: rgba(80, 60, 40, 0.14);
        --accent: #5b8def;
        --overlay: rgba(20, 15, 10, 0.8);
      }
      [data-mood="dark"] {
        --bg: #181512;
        --surface: #262220;
        --surface-2: #332e29;
        --text: #ece5da;
        --text-muted: #b8ac9b;
        --text-faint: #7d7266;
        --border: #3a342f;
        --border-strong: #4a433c;
        --shadow: rgba(0, 0, 0, 0.4);
        --shadow-hover: rgba(0, 0, 0, 0.55);
        --accent: #6f9fff;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
        background: var(--bg);
        color: var(--text);
        min-height: 100vh;
        padding: 24px 16px 116px;
        transition: background 0.25s ease, color 0.25s ease;
      }

      .container { width: 100%; max-width: 560px; margin: 0 auto; }

      .header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }

      .header-text { flex: 1; min-width: 0; }

      .header-text h1 { font-size: 20px; font-weight: 800; }

      .header-sub { font-size: 13px; color: var(--text-faint); margin-top: 4px; }

      .theme-btn {
        flex: 0 0 auto;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid var(--border);
        background: var(--surface);
        color: var(--text-muted);
        font-size: 18px;
        cursor: pointer;
        transition: border-color 0.2s, transform 0.12s;
        line-height: 1;
      }

      .theme-btn:active { transform: scale(0.9); }

      .group {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 14px;
      }

      .ver {
        position: relative;
        padding-left: 18px;
      }

      .ver::before {
        content: '';
        position: absolute;
        left: 5px;
        top: 8px;
        bottom: -14px;
        width: 2px;
        background: var(--border-strong);
      }

      .ver:last-child::before { bottom: auto; height: 28px; }

      .ver::after {
        content: '';
        position: absolute;
        left: 1px;
        top: 6px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--ver-color, var(--accent));
        border: 2px solid var(--surface);
      }

      .ver.blue { --ver-color: #5b8def; }
      .ver.green { --ver-color: #5bb883; }
      .ver.red { --ver-color: #e5484d; }

      .ver-body { flex: 1; min-width: 0; }

      .ver-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .ver-tag {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-faint);
        font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
        border: 1px solid var(--border-strong);
        border-radius: 6px;
        padding: 1px 6px;
      }

      .ver-date { font-size: 11px; color: var(--text-faint); font-weight: 400; }

      .ver-list { margin-top: 8px; padding-left: 4px; }

      .ver-list li {
        font-size: 13px;
        line-height: 1.7;
        color: var(--text-muted);
        list-style: none;
        position: relative;
        padding-left: 10px;
      }

      .ver-list li + li { margin-top: 2px; }

      .ver-list li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 9px;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: var(--text-faint);
      }

      .li-tag {
        display: inline-block;
        font-size: 10px;
        font-weight: 700;
        border-radius: 999px;
        padding: 1px 8px;
        margin-right: 6px;
        vertical-align: 1px;
      }

      .tag-update { background: rgba(91, 141, 239, 0.15); color: #5b8def; }
      .tag-new { background: rgba(224, 105, 138, 0.15); color: #e0698a; }
      .tag-fix { background: rgba(91, 184, 131, 0.18); color: #5bb883; }
      .tag-announce { background: rgba(229, 72, 77, 0.15); color: #e5484d; }

      .ver + .ver {
        margin-top: 14px;
        padding-top: 0;
        border-top: none;
      }

      .copyright { margin-top: 18px; text-align: center; font-size: 12px; color: var(--text-faint); }

      .bottom-nav {
        position: fixed;
        left: 50%;
        bottom: 16px;
        transform: translateX(-50%);
        z-index: 80;
        display: flex;
        align-items: center;
        gap: 2px;
        width: min(420px, calc(100% - 36px));
        padding: 8px 12px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 999px;
        box-shadow: 0 14px 40px var(--shadow-hover);
      }

      .bottom-nav a {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 7px 0 6px;
        border-radius: 14px;
        text-decoration: none;
        /* 导航越透明，文字反而越清晰、每个图标越自带底衬，保证任何内容上都能看清 */
        color: color-mix(in srgb, var(--text-faint) calc(var(--nav-op, 0.66) * 100%), var(--text));
        background: transparent;
        text-shadow: 0 0 calc((1 - var(--nav-op, 0.66)) * 5px)
          rgba(var(--nav-halo, 255, 255, 255), calc((1 - var(--nav-op, 0.66)) * 0.95));
        font-size: 10px;
        font-weight: 700;
        transition: color 0.2s, background 0.2s;
      }

      .bottom-nav a .nav-icon { font-size: 18px; line-height: 1; }

      .bottom-nav a.active {
        color: var(--accent);
        background: color-mix(in srgb, rgb(var(--nav-base, 255, 253, 250)) 82%, var(--accent));
      }
    
      /* ---------- 导航栏毛玻璃（苹果 Liquid Glass） ---------- */
      .bottom-nav {
        background: rgba(var(--nav-base, 255, 253, 250), var(--nav-op, 0.66)) !important;
        -webkit-backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px)) saturate(180%);
        backdrop-filter: blur(calc(6px + var(--nav-op, 0.66) * 22px)) saturate(180%);
        border-color: rgba(180, 168, 150, 0.30) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
      [data-mood="dark"] .bottom-nav {
        background: rgba(var(--nav-base, 42, 38, 33), var(--nav-op, 0.62)) !important;
        border-color: rgba(255, 255, 255, 0.10) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
      html.glass-off .bottom-nav,
      html.glass-off [data-mood="dark"] .bottom-nav {
        background: var(--surface) !important;
        border-color: var(--border) !important;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }
`,
  template: `<div class="container">
      <router-link class="cl-back" to="/settings">← 设置</router-link>
      <div class="header">
        <div class="header-text">
          <h1>更新日志</h1>
          <div class="header-sub">像素小镇 · 每次更新都有迹可循</div>
        </div>
      </div>

      <section class="group">
        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.5.4</span> 在别人的主页上能看见性别和生日了 <span class="ver-date">2026-10</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-fix">修复</span><b>性别和生日填了没地方看</b>。上一版只把这两样显示在「个人信息」里，也就是<b>只有你自己看得见</b>；画师主页压根没渲染过它们，所以别人的性别在哪儿都找不到。现在画师主页的名字下面会多一行标签：<code>🙋‍♀️ 女生　🎂 3 月 15 日</code>，<b>没填就整行不显示</b>，不占地方</li>
              <li><span class="li-tag tag-new">新功能</span>生日那天，对方主页的名字旁边会挂一个 🎂，标签也会变成高亮的「🎂 今天生日！」</li>
              <li><span class="li-tag tag-ui">界面</span><b>和好友聊天时，点上面的名字就能进他的主页</b>。以前想看看跟你说话的人是谁，只有「社区 → 翻到他的作品 → 点作者」这一条路，绕得有点远</li>
              <li><span class="li-tag tag-fix">修复</span>顺手加固了一处：生日的格式只认服务端给的 <code>MM-DD</code>，格式不对就整条不显示，免得画出「NaN 月 undefined 日」这种东西</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.5.3</span> 补上「设置 / 更新日志 / 常见问题」的返回键 <span class="ver-date">2026-10</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-fix">修复</span><b>设置页进去就出不来</b>。这三个页面既不在底部导航里，自己又没有返回按钮 —— 进去之后只能按浏览器的后退键。上一版把「常见问题」和「更新日志」右上角的齿轮按钮删掉之后，这两个页面连那条退路也没了。现在都补上了：设置页左上角「← 我的」，更新日志和常见问题「← 设置」</li>
              <li><span class="li-tag tag-fix">修复</span>顺手把<b>全部 21 个页面</b>过了一遍，逐个确认「要么有底部导航，要么有返回键」。现在没有一处是死胡同了</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.5.2</span> 确认框改成小镇自己的（不再被浏览器插按钮） <span class="ver-date">2026-10</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-fix">修复</span><b>确认框里冒出「关闭网页」按钮</b>的问题。以前的确认框用的是浏览器自带的，<b>按钮由浏览器说了算</b> —— 有些手机浏览器和内置 WebView 会自作主张多塞一个按钮，想点确认却把页面关了。现在改成小镇自己画的对话框，按钮就只有「取消」和「确认」，一个不多、一个不少</li>
              <li><span class="li-tag tag-ui">界面</span>顺便把全站 <b>30 处</b>原生弹窗都换掉了：18 个确认框、9 个提示框、3 个输入框。删除作品、清空对话、买家具、扩建屋子、后台封禁……现在长得都一样，也是小镇的样子</li>
              <li><span class="li-tag tag-ui">界面</span>新对话框的几个细节：按 <b>Esc</b> 取消、按 <b>回车</b>确认；点旁边空白处，确认框算取消、提示框算知道了；删除、清空这类不可恢复的操作会<b>标红</b>；同时弹出多个会排队，不会叠在一起</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.5.1</span> 聊天送光尘 · 涂鸦 · 猜拳 · 家具 104 件 · 房间能扩建 <span class="ver-date">2026-10</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-new">新功能</span><b>聊天不再只有打字和表情了</b>。输入框左边多了一个「＋」，里面是四样东西：<b>🎁 送光尘 / 🎨 涂鸦 / 🖼️ 画作 / 🎲 猜拳</b></li>
              <li><span class="li-tag tag-new">新功能</span><b>🎁 送光尘</b>：选个金额（也能自己填），送出去就<b>真的进对方账本</b>，不是贴个图。气泡会显示成一张礼物卡，可以附一句话</li>
              <li><span class="li-tag tag-new">新功能</span><b>🎨 手绘涂鸦</b>：16×16 的小画板，16 种颜色，用手指随手画一张发过去。像素小镇里聊天当然要能画两笔</li>
              <li><span class="li-tag tag-new">新功能</span><b>🖼️ 分享画作</b>：从自己的作品里挑一幅发过去，对方点一下就能跳到社区里看那一幅</li>
              <li><span class="li-tag tag-new">新功能</span><b>🎲 猜拳</b>：石头剪刀布，<b>可以押光尘</b>（最多 200）。有个讲究：你先出拳，但<b>在对方出拳之前，他看不到你出的是什么</b> —— 服务端会把没出完的那一方的拳藏起来，所以后出的人占不到便宜。平局谁也不用掏钱</li>
              <li><span class="li-tag tag-new">新功能</span><b>↩️ 引用回复</b>和<b>😀 表情回应</b>：每条消息下面有「引用」和「回应」两个小按钮。回应支持 👍❤️😂😮😢🎉，再点一次就取消，不刷屏也能搭上话</li>
              <li><span class="li-tag tag-new">新功能</span>小屋的家具从 12 件扩到 <b>104 件</b>，分成 12 类（座椅 / 桌台 / 床铺 / 收纳 / 灯具 / 植物 / 装饰 / 电器 / 乐器 / 宠物 / 厨具 / 杂物），从 8 光尘的蜡烛到 200 光尘的王座。家具铺改成分类翻页，买过的自动从铺子里消失</li>
              <li><span class="li-tag tag-new">新功能</span><b>墙纸和地板</b>，一共 50 款。不是硬画 50 张图，而是 8 种墙纸花纹 × 4 套配色现算出来的。白送「白墙 + 橡木地板」，新屋子不会一进去就是毛坯。买完自动换上，不用手动摆</li>
              <li><span class="li-tag tag-new">新功能</span><b>屋子能扩建了</b>：16×16 → <b>24×24（300 光尘）</b> → <b>32×32（800 光尘）</b>。墙的高度按比例一起涨，房子才不会显得扁。扩建后<b>家具会自动往下挪</b>，跟着新地板线走，不用重新摆</li>
              <li><span class="li-tag tag-new">新功能</span><b>家具得站在地上</b>了。以前床能摆到墙上，看着像浮在半空。现在钟、画、窗、挂旗这类 11 件可以挂墙，其余的必须有一条腿落在地板上</li>
              <li><span class="li-tag tag-ui">界面</span>小镇地图不再是一块光秃秃的绿底：加了村口土路、草地纹理、房子门口的一小块草地，还有块木牌告示。屋里有东西的人家，烟囱会冒烟</li>
              <li><span class="li-tag tag-fix">修复</span><b>「成就数量有时候是 0」</b>。角标在页面里默认就写死成 0，接口一失败（掉线、登录过期）就永远停在那个 0 上 —— 不是变成 0，是从来没被覆盖过。信箱、每日任务、送过光尘三个角标有同样的毛病，一起改了：<b>没拿到数据就不显示数字，不谎报 0</b></li>
              <li><span class="li-tag tag-fix">修复</span><b>作品卡片大小不一致</b>。卡片里的画用整数倍放大不会出白边，但 16×16 最大能放到 80px、64×64 只能放到 64px，两种画摆在一排就一大一小。现在改成铺满格子，<b>不管原图多大都显示成一样大</b></li>
              <li><span class="li-tag tag-ui">界面</span>设置<b>只能在「我的」里打开了</b>。常见问题、更新日志、全部作品三个页面右上角那个齿轮按钮删掉了，后台的「返回设置」也改成了「返回我的」</li>
              <li><span class="li-tag tag-fix">修复</span>扩建后<b>家具被清空</b>的问题。房间一大，地板线就往下走，原来站在地上的床按新规则就「违规」了，被读存档的校验默默丢掉。现在「读存档」和「校验新摆放」是两套规则，扩建时家具还会跟着地板线一起下移</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.5.0</span> 像素小镇开镇 · 153 个成就 · 生日 · 一大轮修复 <span class="ver-date">2026-10</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-new">新功能</span><b>像素小镇开镇了</b>：底部导航多了一个「🏘️ 小镇」。镇上一排排小屋，每户一间，点谁进谁家串门。屋里可以摆家具 —— 家具铺里有 12 件（盆栽、落地灯、小床、一只猫、钢琴…），<b>买下就永久归你，想摆几件摆几件</b>。这是光尘的第一个正经去处</li>
              <li><span class="li-tag tag-fix">修复</span><b>光尘余额怎么都不刷新</b>（拖了很久的老问题）。根因是领信箱附件时发的是另一个事件名，而账本只认 <code>lw-dust-changed</code> —— 账本一直是旧值，而「我的」页为了省额度又故意不重新拉，于是切页也救不回来。顺手还揪出改头像、改简介两处同样的漏网，现在都补上了</li>
              <li><span class="li-tag tag-new">新功能</span>成就从 100 个扩到 <b>153 个</b>，并补上一条很长的尾巴：全年签到、全天候满勤、单幅三百赞、五百万格、两年老友、连续百日创作……奖励上限也从 30 提到 100 光尘。<b>入门那批没动</b>，新手照样能很快拿到第一枚</li>
              <li><span class="li-tag tag-new">新功能</span><b>生日与性别</b>：「个人信息」页（从「我的」进）可以填性别和生日。生日当天小镇会往你账本里放 <b>100 个光尘</b> + 一封贺信，一年一次。生日只存「月-日」不存年份，<b>一年只能改一次</b>，免得反复改生日反复领礼</li>
              <li><span class="li-tag tag-new">新功能</span><b>个人信息汇总</b>：一屏看完头像、性别、生日、入住天数，以及作品数、绘制格数、收到赞、收到光尘</li>
              <li><span class="li-tag tag-fix">修复</span><b>默认头像重做</b>。以前是一张写死米色的圆脸，所有人的脸一模一样，只有背景颜色不同。现在是一只圆头小兽，耳型、眼型、嘴型、底纹、配色全由账号决定，一共 <b>3888 种</b>，两万人里才会撞几次脸</li>
              <li><span class="li-tag tag-fix">修复</span><b>我的作品卡片被拉伸</b>：缩略图算尺寸时会向上取整算出比格子还大的数，被 max-width 一压，正方形就变成长方形了。现在超出可用宽度时自动退一档</li>
              <li><span class="li-tag tag-fix">修复</span><b>后台作品预览和像素喷漆的白条纹</b>：一个是因为缩略图背板尺寸和显示尺寸不是整数倍，另一个是「补缝」的重叠量写死成了 1.02（按大屏估的，窄屏上不够用）。两处都改成按实际尺寸算了</li>
              <li><span class="li-tag tag-ui">界面</span><b>底部导航只在四个一级页面出现</b>了（画板 / 社区 / 小镇 / 我的）。信箱、好友、排行、任务、成就、设置…… 这些二级页左上角本来就有返回键，再挂一条导航栏既占屏幕又容易点错。和好友聊天时导航也会收起来，键盘不再压着输入框</li>
              <li><span class="li-tag tag-ui">界面</span>聊天时可以整屏输入了：输入框钉在屏幕底部、自动避开 iPhone 的横条，键盘弹起会把它顶上来。<b>「清空这段对话」挪到了顶栏</b> —— 它以前贴在发送键正上方，够发送时很容易误触，而那是不可恢复的操作</li>
              <li><span class="li-tag tag-ui">界面</span>好友列表的头像和名字<b>不再挤在一起</b>了，未读消息加了红点（1 条是小红点，多了显示数字）；画师主页的作品墙<b>只铺最近 6 件</b>，其余收在「查看更多」后面，不再一下子拉出六十张图</li>
              <li><span class="li-tag tag-ui">界面</span>全站文案改了一轮口吻：签到叫「报到」，社区叫「小镇」，欢迎语是「欢迎回到小镇」。「我的」页新增「👤 个人信息」入口，设置也从导航栏挪到了这里</li>
              <li><span class="li-tag tag-new">新功能</span>致谢里补上了 <b>DeepSeek Harness</b> 与 <b>Linux</b></li>
            </ul>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.4.0</span> 音效大扩容 · 加好友 · 后台发信 · 聊天表情 · 一键更新 <span class="ver-date">2026-10</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-new">新功能</span>音效从 19 种扩到 <b>33 种</b>，并新增滑音、琶音、柔和噪声、颤音四种合成手法：点赞、评论发送、签到、成就解锁、获得光尘各有专属音色。同一个音效每次播放音高会轻微浮动（±3.5%），连点也不会觉得机械</li>
              <li><span class="li-tag tag-new">新功能</span><b>全站按钮都有音效了</b>：按钮按语义自动配音 —— 删除/清空是警示音、关闭/取消是下行音、标签页切换是轻响、保存发布是上行双音、灰色按钮点了会告诉你「不行」。以前有一大半按钮是哑的，包括没有语义标签的 div/span 按钮（画廊卡片、分页圆点等）</li>
              <li><span class="li-tag tag-new">新功能</span>设置页新增<b>音效音量滑块</b>：五档预设（静音 / 轻 / 适中 / 默认 / 最大），拖动时静音、松手试听一记，音量记在这台设备上</li>
              <li><span class="li-tag tag-new">新功能</span>设置页新增<b>「刷新到最新版」</b>：界面还是老样子、新功能没出现？点一下即可强制拉取最新代码。它会清掉离线缓存并重新注册，但<b>不碰草稿、登录和设置</b>。旁边还会显示当前版本号，发现新版时会直接提示</li>
              <li><span class="li-tag tag-new">新功能</span>维护面板新增<b>信箱发布</b>：可以发公告或带光尘的奖励。收件人留空就是<b>广播</b> —— 所有人下次打开信箱时收到，<b>之后注册的新号也会收到</b>；填用户名则只投给那一个人。已发布的广播信可以撤回（已经收到的不收回）</li>
              <li><span class="li-tag tag-new">新功能</span><b>私信支持表情了</b>：输入框左侧新增表情面板，5 组共 191 个表情，点一下插到光标位置，可以连着点好几个；点空白处自动收起</li>
              <li><span class="li-tag tag-new">新功能</span><b>「私信」改名为「好友」，并加了「加好友」</b>：原来要成为好友必须「互相关注」，但「关注」听起来是单向的，不好理解 —— 现在语义理顺了：<b>点「加好友」＝ 发出申请，对方通过（也点一下加好友）＝ 成为好友</b>，之后就能聊天。好友页顶部新增「＋ 加好友」：能看到<b>谁申请加了你</b>一键通过，也能<b>按用户名搜人</b>主动加。作者主页的按钮相应改成「＋ 加好友 / 已申请 / 🤝 好友」</li>
              <li><span class="li-tag tag-fix">修复</span>好友列表里<b>头像和名字挤在一起</b>：这个页面为了兼容微信内核一律用 margin 撑间距（不用 flex gap），但头像那一处漏写了右边距。顺带把头像放大到 42px，并给未读消息加了红点（1 条是小红点，多条显示数字，99 条以上记 99+）</li>
              <li><span class="li-tag tag-new">新功能</span>聊天时可以<b>整屏输入</b>了：消息区独立滚动、输入框钉在屏幕底部并自动避开 iPhone 安全区；点输入框时键盘弹起会自动把输入框顶上来，不再被挡住。另外<b>聊天时底部导航栏会自动隐藏</b>，把屏幕整个让给对话（返回按钮会变成「← 消息」）</li>
              <li><span class="li-tag tag-ui">界面</span>私信界面重做：对方的消息旁边显示<b>像素头像</b>，气泡加大圆角与投影并逐条淡入，时间戳移到气泡外侧，跨天时自动插入「今天 / 昨天 / X 月 X 日」分隔</li>
              <li><span class="li-tag tag-fix">修复</span>点画板的撤销按钮会响<b>两声</b>（撤销音和成功音叠在一起），现在只响一次</li>
              <li><span class="li-tag tag-fix">修复</span>「不能操作」的提示音以前是<b>静默</b>的：有三处调用了 no 音效，但它从来没有被定义过（相机作品不能收光尘、每日任务领取失败等），现在补上了</li>
              <li><span class="li-tag tag-fix">修复</span>设置页「常见问题」这一条的标签没闭合（用了 div 收尾），顺手改正</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.3.1</span> 举报审核 · 新手教程 · 5 套主题 · 音效 · 装到桌面 <span class="ver-date">2026-10</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-new">新功能</span>作品预览新增「🎨 用色」：下拉列出这幅画用到的全部颜色（按用量排序、自动略去白色底色），点任意色块即可复制它的色号；照片转像素画的作品颜色过多，不显示该入口</li>
              <li><span class="li-tag tag-new">新功能</span>内容安全：作品预览里可举报违规内容，需长按 1.5 秒才会弹出（避免误触），维护者后台可查看、核实或直接删除作品</li>
              <li><span class="li-tag tag-new">新功能</span>新手教程：设置页最顶部新增「第一次来？两分钟看完这个网站能做什么」，六张卡片讲清一个人画、多人画、社区、像素相机、主题比赛与平移，看过后自动收起</li>
              <li><span class="li-tag tag-new">新功能</span>PWA 离线使用：可把网站安装到手机/桌面，断网也能打开画板继续画，附安装提示条</li>
              <li><span class="li-tag tag-new">新功能</span>5 套特色主题：樱粉、海盐、薄荷、暖阳、夜阑，可在设置里一键切换，与深色模式并存</li>
              <li><span class="li-tag tag-new">新功能</span>18 种提示音效：保存、撤销、清空、投票、复制链接、开关、开局、载入、答题、加入/离开房间等各有不同音色，可在设置里一键开关（声音由 WebAudio 实时合成，不额外占用流量）</li>
              <li><span class="li-tag tag-new">新功能</span>设置页新增「💌 作者的话」：说明本站由 AI 协助编写、因接口经费有限更新较慢，以及这个小网站承载的个人心愿</li>
              <li><span class="li-tag tag-fix">修复</span>手型平移工具之前会误画出一个像素点，现在单击和拖动都只平移、绝不落笔</li>
              <li><span class="li-tag tag-fix">修复</span>有已保存的画稿时不再弹出开局菜单，直接回到画板继续画</li>
              <li><span class="li-tag tag-fix">修复</span>小地图不再遮挡画布右上角：默认收起，点 🗺 才显示，显示时也不会挡住落笔</li>
              <li><span class="li-tag tag-fix">修复</span>深色模式下画板顶部「像素小镇 · 画板」等标题是黑字黑底看不清：补上页面文字颜色，现在跟随主题</li>
              <li><span class="li-tag tag-fix">修复</span>设置页「画板布局」「进阶功能」点不开：分组绑定曾被写进其它回调里，且引用了还没初始化的数据</li>
              <li><span class="li-tag tag-fix">修复</span>维护者页面顶部标题区是一段裸文字，现在与下方卡片一样有底色、边框和阴影</li>
              <li><span class="li-tag tag-announce">移除</span><b>联机功能已下掉</b>：它的多人同步依赖强一致存储，而现有 KV 是最终一致的，两人同时落笔会互相覆盖（房主看不到别人加入、笔迹不同步、两人在线却提示不足 2 人）。修好需要换 Durable Object，但那会让整站自动部署失败、线上卡在旧版本，所以选择下掉而不是留一个时好时坏的功能。详见常见问题</li>
              <li><span class="li-tag tag-new">新功能</span>内容安全：发布作品时服务端校验作品名、作者名与标签，命中敏感词直接拒绝（约 5 万条词库，只在服务端使用，不下发到浏览器）</li>
              <li><span class="li-tag tag-new">新功能</span>光尘账本改为服务端存储：登录后签到与赠送由服务端裁决，换设备登录同一账号即可同步余额与连续签到天数，余额无法再靠改本机数据伪造；未登录仍按原来的方式存在本机</li>
              <li><span class="li-tag tag-new">新功能</span>设置页新增「致谢」分组，列出词库与代码工具的来源和许可</li>
              <li><span class="li-tag tag-new">新功能</span>导航栏新增 5 款样式（纯色 / 描边 / 药丸 / 分段 / 渐变），连原有玻璃共 6 款，在「启动与导航」里切换</li>
              <li><span class="li-tag tag-new">新功能</span>新增信箱 /mail：系统消息与光尘附件都存在服务端，附件只能领一次、领了直接进账本；入口在「我的」，有附件待领时显示角标</li>
              <li><span class="li-tag tag-new">新功能</span>维护面板新增「账号封禁」：按用户名查到 uid 后一键封禁，可填原因。封禁立即生效 —— 对方已登录的设备上签到、送光尘、发布作品都会被拒绝；解封后无需重新登录即可恢复</li>
              <li><span class="li-tag tag-fix">修复</span>词库误伤：源词库收录了「测试」「信息」「安全」「网络」这类日常词，直接匹配会把正常作品名判成违规。现在这些中性词走豁免名单，组合型敏感词仍会拦下（如「测试法轮」照样拒绝）</li>
              <li><span class="li-tag tag-ui">界面</span>画板的「像素相机」和「下载」按钮改为图标在上、小字在下，以前只有光秃秃一个 emoji 看不出功能；相机图标从 🖼️ 换成更贴切的 📷</li>
              <li><span class="li-tag tag-ui">界面</span>设置页「画板布局」和「进阶功能」各项都补上图标（🔢 画布尺寸栏、🖌️ 工具栏、🎲 题目模式、🎞️ 帧动画…），扫一眼就知道每项是什么</li>
              <li><span class="li-tag tag-fix">修复</span>信箱一直是空的：投递逻辑建好了却从没被调用过。现在注册即收到「国庆快乐，附赠 20 个光尘」和「新手指南：光尘怎么花」两封信，老账号下次登录或打开登录页时自动补投，同一个人不会重复收到</li>
              <li><span class="li-tag tag-new">新功能</span>成就墙扩到 100 个，分 10 类：创作数量、绘制规模、获得认可、连续创作、长期坚持、签到、光尘往来、画布运用、玩法探索、创作时刻。全部手写命名（处女作、百幅长卷、全勤满月、深夜画室、时光旅人…），没有「发布作品 5/6/7」那种凑数阶梯；每条配一句说人话的说明，页面按分类折叠</li>
              <li><span class="li-tag tag-ui">界面</span>「我的」页头部重做：头像从 46px 放大到 72px、圆角 20px 加了描边和投影，✏️ 角标不再压着边框；旁边显示账号名，整组水平居中。未登录时显示「未登录 · 登录后同步光尘与成就」</li>
              <li><span class="li-tag tag-new">新功能</span>发布作品不再填作者名：一律取登录账号的用户名，没登录就引导去登录。以前随便填别人名字也没人管得着，作品归属是假的；现在归属跟账号绑定，头像、成就、光尘才对得上</li>
              <li><span class="li-tag tag-new">新功能</span>朋友圈「保存图片」导出的卡片也带上作者头像了，位置在「画师 xxx」左侧；没有账号的老作品不放头像，保持原样</li>
              <li><span class="li-tag tag-new">新功能</span><b>作者主页有头像和简介了</b>：点社区里的作者名进去，头像、名字、简介、作品数、总赞数、累计绘制格数一屏看全。之前只有一个光秃秃的名字和作品列表</li>
              <li><span class="li-tag tag-new">新功能</span>新增公开资料接口 <code>/api/profile</code>，可按用户名或 uid 查。只给公开信息（头像、简介、作品数、赞、绘制格数、累计收到的光尘），<b>光尘余额和签到状态不外露</b>，查无此人和被封禁都统一回「没有这个用户」，不泄露账号是否存在。以后的关注、评论、聊天都复用它</li>
              <li><span class="li-tag tag-new">新功能</span><b>可以举报用户了</b>：在作品预览里，作者名字旁边多了头像和简介（点名字直接进他的主页），右边一个「🚩 举报该用户」。举报作品的长按入口照旧，两件事分开。维护面板里用户举报会单独标出来，处理时能一键封禁该账号并把举报理由记进封禁原因</li>
              <li><span class="li-tag tag-new">新功能</span>维护面板新增「赠送光尘」：按用户名直接加减，正数增加、负数扣减，单次上限 10 万，正数同时计入对方「累计收到」</li>
              <li><span class="li-tag tag-new">新功能</span><b>每日任务</b>：每天派 5 个任务，达成后手动领光尘（共 100 个，20 天走完一遍，每组 5 个的指标互不重复）。任务涵盖作品数、绘制格数、收到/送出的光尘、签到与连续天数、尺寸、动画、参赛、活跃时段、时段作息、画头像、写简介等，进度直接按你已有的创作数据算，达成后按钮才亮。<b>「我的」页入口上的角标显示今天还有几个能领</b></li>
              <li><span class="li-tag tag-new">新功能</span><b>私信</b>：只有<b>好友</b>（互相关注的人）之间能私信，陌生人发不出去。「我的」页有入口，未读数会显示在角标上。<b>这里是非实时的</b>：不轮询、不推送、没有在线状态，对方发的新消息要自己点右上角的<b>刷新</b>才看得到，页面会用一条分隔线标出「这是你刷新后看到的新消息」</li>
              <li><span class="li-tag tag-new">新功能</span><b>评论</b>：在作品预览底部可以留言。必须登录才能发（和送光尘、发布一个规矩），文本走和发布作品同一套敏感词过滤，命中会告诉你是哪个词。作品作者本人评论会打上「（作者）」标记，<b>评论作者本人和作品作者都能删</b>，别人删不了。同一幅画 10 秒内不重复刷，每幅最多 200 条；作品被删时评论一并清掉</li>
              <li><span class="li-tag tag-fix">修复</span><b>切页面还在偷偷发请求</b>，白烧 Cloudflare 的免费额度。
              之前只有信箱、每日任务、排行榜、画师主页做了「第一次进来请求一次、之后用内存缓存」，
              这次把剩下的补齐了：<b>「我的」页</b>（一次进页面要发 9 个请求：账本、信箱角标、成就角标、
              每日任务角标、私信未读、简介、头像、作品统计、作品列表）、
              <b>成就页</b>、<b>画头像页</b>，以及「我的」页里的信箱/成就/头像/简介这几个角标。
              每页都加了<b>刷新</b>按钮，想更新自己点。
              实测来回切 10 次页面：请求数从 20 降到 6，<b>第二次进同一个页面一个请求都不发</b>。
              余额也不会每次重新拉了（启动时已经拉过），但领附件、领任务、成就变化这些事件
              还是会真的作废缓存重算，角标不会该变不变</li>
              <li><span class="li-tag tag-new">新功能</span><b>评论区可以下拉了</b>：默认收成一行「展开评论 · N 条」，
              不占地方，评论再多也不会把作品弹窗撑到关不掉。展开以后<b>评论列表自己可以上下滑动</b>
              （高度最多占半屏，滑到头了不会带动弹窗），一次铺 20 条，底部有「下拉加载更多」，
              滑到底再点就再来 20 条。自己发完评论会自动展开并滚到那条，看得见自己发到哪了</li>
              <li><span class="li-tag tag-fix">修复</span><b>领了每日任务，光尘数字不变</b>；
              <b>送过光尘的也一直显示不出来</b>。根因是同一个：领任务、送光尘、领附件、领成就奖励
              都会派发一个 <code>lw-dust-changed</code> 事件，有的还把服务端返回的新账本一起带上，
              但账本模块<b>自己根本没监听这个事件</b>，一直拿着启动时那本旧账本。
              表现就是余额纹丝不动、<code>送过光尘的</code> 永远是空的。
              补上监听：带了新账本就直接用（不多发请求），没带就重新拉一次</li>
              <li><span class="li-tag tag-fix">修复</span><b>「送过光尘的」显示「可能已被作者删除」</b> ——
              那句提示是<b>假的，作品一直都还在</b>。原因是接口对不上：
              页面拿时间戳去问「这幅画在哪」，接口只回了「第几个 + 总共几件」，
              根本没把作品本身带回来，于是每一件都取不到，只能统一报「已被删除」。
              现在接口连作品一起返回，<b>登录系统之前发的匿名作品也能正常显示</b>。
              万一真有取不到的，提示也会说清是「对方可能已注销，或作品已被删除」，
              并告诉你缺了几件，不再让你以为自己的记录没了</li>
              <li><span class="li-tag tag-fix">修复</span><b>光尘在头像页和简介页也看不到变化</b>。
              这两页各自存了一份余额来判断「够不够花」，谁都不跟着账本更新 ——
              刚领到光尘再过去，还是拿旧数字说话，
              <b>会平白无故把人拦在门外</b>（头像页本来还有缓存，拦得更久）。
              给账本加了订阅接口，余额一变这两页立刻跟着变</li>
              <li><span class="li-tag tag-ui">界面</span><b>信箱每一项的间距</b>：
              样式表里多了一个右括号，<b>从那儿往后的 16 条规则全部失效</b>，
              信箱里两项是<b>紧贴在一起</b>的（gap 0）。另外正文和附件领取栏
              写在了标题那一列外面，<b>比标题往左突出来三十多像素</b>，看着是歪的。
              现在两项之间留 10px，正文、附件栏和标题左对齐，
              附件栏上下各留 12px 并保留虚线分隔</li>
              <li><span class="li-tag tag-ui">界面</span>「我的」页底部那张<b>「送过光尘的」卡片去掉了</b>，
              主页清爽一点。数据没动：「我的」里「✨ 送出的」入口还在（带着件数的角标），
              点进去或者直接访问 <code>/mine/gifted</code> 都能看到送过的作品</li>
              <li><span class="li-tag tag-new">新功能</span><b>可以删掉自己的作品了</b>。
              以前其实是<b>做不到的</b>：后端的删除接口早就写好了，画板里也有一份删除逻辑，
              但那个函数<b>从来没绑到任何按钮上</b>，所以入口根本不存在。
              现在「我的」页「我的作品」里<b>长按任意一幅 1.2 秒</b>就能删 ——
              单击还是去社区看那幅画，两个操作不打架；会先弹确认，删了不可恢复。
              删完顺手把本机那份发布记录、统计缓存一起清掉，件数立刻更新</li>
              <li><span class="li-tag tag-fix">修复</span><b>32×32、64×64 上没法拖动滑画</b>。
              代码里判断「这次拖动是平移还是落笔」时写了
              <code>activeTool === 'pan' || panLock || size &gt; 16</code> ——
              只要尺寸超过 16，<b>拖动一律当成移动画面</b>，一笔都画不出来，
              只能一格一格点。现在这个判断只看工具、不看尺寸：
              <b>画笔和橡皮在任何尺寸下都能拖着画</b>；
              要移动画面用 ✋ 手型、✥ 拖动锁、空格或中键。底部提示也一并改对</li>
              <li><span class="li-tag tag-fix">修复</span><b>长按删不掉自己的画</b>（手机上尤其明显）。
              手机按住画布超过半秒，浏览器会启动自己的长按行为（弹菜单 / 选中 / 拖放），
              随即发一个 <code>pointercancel</code>，而我原来在这个事件里清了计时器 ——
              长按于是永远刚开始就作废。改成：抓住指针、CSS 屏蔽系统长按菜单
              （<code>user-select</code> / <code>-webkit-touch-callout</code>）、
              <code>pointercancel</code> 不再清计时器只是停进度条，
              再加一条按住时可见的进度条（不然用户不知道有没有生效）</li>
              <li><span class="li-tag tag-fix">修复</span><b>私信没有输入框</b>（用户反馈）。
              输入框被写在「有消息才渲染」那段分支里，所以新会话（一条都还没发过）
              页面写着「说点什么打个招呼吧」，底下却连输入框都没有，根本没法开口。
              现在输入栏永远渲染，空对话也能直接发第一条</li>
              <li><span class="li-tag tag-fix">修复</span><b>私信消息框溢出到屏幕右边</b>（有用户反馈）。
              两个原因叠在一起：<code>word-break: break-word</code> 在
              <b>老 Safari / WebView 上不被支持</b>，会退化成 <code>normal</code>，
              一条长网址、一个长串没有空格的内容就能把气泡顶出屏幕；
              而且 <code>.ch-msg</code> 和气泡<b>都缺 <code>min-width: 0</code></b> ——
              flex 子项默认不许缩得比内容还窄，再窄的容器也拦不住。
              现在补上 <code>min-width: 0</code> 和兼容性更好的
              <code>overflow-wrap: anywhere</code>。
              320 / 360 / 390 / 414 / 768 五种屏宽都验过，
              模拟「换行属性失效」的老浏览器也不溢出</li>
              <li><span class="li-tag tag-new">新功能</span><b>别人的画师主页上能直接送光尘了</b>。
              以前 <code>/u</code> 主页的作品墙上只有一张张图，<b>点开大图才能送</b>，
              主页上根本没有送光尘的按钮（用户反馈「无法给其它用户点赞」）。
              现在每幅画左下角都有 <b>✨ 数量</b> 的按钮，点一下就送，
              送完点亮并显示这幅画累计收到多少；点图片本身仍然进大图</li>
              <li><span class="li-tag tag-fix">修复</span><b>送光尘的按钮是灰的、点了没反应</b>（用户反馈「有按钮，就是点不了」）。
              相机作品按规则不能收光尘，按钮会置灰（<code>opacity:.42</code> + <code>not-allowed</code>），
              但同时还加了 <code>disabled</code> ——<b>手机上点下去根本不触发任何事件</b>，
              而解释原因的 <code>title</code> 在手机上又不会显示，
              结果就只剩一个灰按钮，看着像坏了。
              现在<b>置灰但保持可点</b>，点了明确告诉他「相机转出来的照片不支持收光尘」，
              按钮文字里也加上 <code>🚫</code> 标识，不点也能看出来</li>
              <li><span class="li-tag tag-fix">修复</span><b>照片转像素画可以冒充原创</b>。
              根因比「改一两个格子」严重得多：<code>fromImage</code> 标记<b>完全由客户端自己传</b>，
              <b>只要请求里不发这个字段就当原创</b> —— 发布奖励、绘制格数成就、收光尘、收票全都通吃。
              现在改成<b>服务端自己判断</b>（新增 <code>_camera.js</code>），客户端说的只当参考：
              统计照片量化留下的两个痕迹 —— <b>渐变密度</b>（相邻格「接近但不相等」的比例，
              手绘是成片纯色块）和<b>调色板规模</b>。两个同时越线才判为相机作品，
              判定后<b>标记锁死</b>，改几个格子也去不掉；只越一条线的只做标记、不处罚。
              阈值很保守，纯手绘实测渐变 0.00 / 3 色正常放行，
              照片转图即使只改 5 格仍是 0.88~0.93 / 154~306 色，一律抓出。
              说实话：<b>像素级无法可靠区分「手绘」和「照片转图再改几格」</b>，
              这套堵的是明显那一类，真要较真还得靠举报</li>
              <li><span class="li-tag tag-fix">修复</span><b>「送过光尘的」列表全是别的作品</b>（用户反馈「对不上」）。
              根因是<b>数组方向搞反了</b>：<code>findIndexByTime</code> 返回的 <code>index</code> 是
              <b>从最新往回数</b>的（0 = 最新那一件），而 <code>readAllHistory</code> 返回的数组是
              <b>从最老往后数</b>的。代码里却拿这个 index 去反查，
              等于把整个序列镜像了一遍 —— 实测查第 0 件会返回第 699 件，<b>8 个样本全错</b>。
              现在让 <code>findIndexByTime</code> 直接把作品本身带回来，不再靠下标反查</li>
              <li><span class="li-tag tag-fix">修复</span><b>主题比赛面板里没有「投一票」按钮</b>（用户反馈）。
              参赛作品卡下面只有一行「🏆 N 票」的<b>纯文字</b>，点不了 ——
              <code>makeVoteButton</code> / <code>voteContest</code> 早就写好了
              （作品列表和预览弹窗都在用），唯独比赛面板这张卡没接上。
              现在把投票按钮挂上去；另外把按钮文案统一成
              <b>「🏆 投一票 · N」/「🏆 已投票 · N」</b>，
              以前只写「🏆 N」，光看一个数字不像能点，也不知道点完算不算投了。
              打开面板时也补上色相条重画</li>
              <li><span class="li-tag tag-fix">修复</span><b>聊天页面在部分手机上「比例不对」</b>
              （荣耀畅玩60 的用户反馈，该用户是在微信里打开的）。
              微信内置浏览器用的是 X5 内核，<b>老版本不支持 flex 布局的 <code>gap</code></b>
              （Chrome 84 才支持），一不支持所有间距就整个塌成 0 ——
              <b>输入框贴着发送键、消息挤成一团</b>。
              同一个微信在别的机型上正常，所以这更像是那台机器的浏览器内核较老。
              私信页的 5 处 flex gap 全部改成子元素 <code>margin</code>，两边都稳妥。
              顺便修了两处相关隐患：输入框缺 <code>min-width: 0</code>
              （窄屏下会被发送键挤扁），以及上一条里的色相条漏画。
              <b>注意：全站还有 200 多处 flex gap 没改</b>，
              那台机器上别的页面也可能出现间距塌陷，正在一并处理</li>
              <li><span class="li-tag tag-fix">修复</span><b>取色器吸完颜色，HSV 上没有指示圆点</b>（用户反馈）。
              <code>syncPickerFromRgb</code> 的重画条件写的是
              <code>pickOpen &amp;&amp; hsvOpen</code>（两个面板都开着才重画），
              可在画布上用取色器的时候这两个面板通常都是关着的 ——
              于是 S/V 变了、界面没跟着重画，圆点停在旧位置甚至看不见。
              改成<b>有一个开着就重画</b></li>
              <li><span class="li-tag tag-fix">修复</span><b>长按能弹删除别人的作品</b>（用户反馈「太危险了」）。
              「我的作品」和「送过光尘的」两个列表<b>共用同一个 <code>buildWorkItem</code></b>，
              于是后者的卡片也绑上了长按删除 —— 那里面全是**别人画的**。
              服务端的 <code>ownerUser</code> 校验会挡下来（403），不会真删掉，
              但让人以为能删别人的画本身就不对。现在按是否本人决定要不要绑删除：
              <b>只有自己的作品能长按删</b>。另外后端也加了一道 ——
              <code>uid</code> 为空时一律判为「不是自己的」，不给任何第二种可能</li>
              <li><span class="li-tag tag-new">新功能</span><b>别人主页上多了「💬 与他聊天」</b>：
              在画师主页点它，直接进到和这个人的私信会话，<b>不用先去「我的」页找私信入口</b>。
              只有<b>互相关注的好友</b>才显示（私信本来就只允许好友，
              不是好友给了也会被后端挡回来）。点之前会先把会话建好，
              过去就是现成的对话框</li>
              <li><span class="li-tag tag-fix">修复</span><b>简介卡在「读取中…」</b>。
              之前给简介加了缓存，但命中缓存时不会执行回调，
              而填字的那段代码写在回调里 —— 于是第二次进「我的」页就永远停在「读取中」。
              现在命中缓存会用缓存直接重画；请求失败会把占位清掉，下次还能重试</li>
              <li><span class="li-tag tag-fix">修复</span><b>光尘要重新进一次网站才更新</b>。
              账本是全局的，但只有「我的」页在挂载时读它，
              在别处领了任务再切回来，数字还是旧的。现在每次切页统一让各页重画一遍
              （纯内存，不发请求），「我的」、头像、简介三处数字都会跟上</li>
              <li><span class="li-tag tag-fix">修复</span>在「我的」页点开自己的画会<b>整页刷新</b>一下
              （把 Vue 和全部脚本重新拉一遍，等一两秒；没有 SPA 回退的部署环境还会直接 404）。
              改成走路由切换，跟站内其他跳转一致</li>
              <li><span class="li-tag tag-ui">界面</span><b>「绘制格数」改成「今日绘制格子数」</b>。
              以前那个是历史累计、只涨不掉，当不了进度看。现在只统计今天发布的作品画的格子数，
              今天还没发布就写「今日还没画」。画师主页上别人的那个改成「<b>累计</b>绘制格数」，
              免得和自己的今日数混在一起</li>
              <li><span class="li-tag tag-fix">修复</span><b>作品弹窗根本滑不动</b>：弹窗没限高、遮罩也不滚动，
              内容一超过屏幕，超出去的部分既滑不到也点不到 —— 47 条评论时连评论输入框都够不着。
              现在头部固定在弹窗顶端，下面内容自己滚，头部和「关闭」永远在</li>
              <li><span class="li-tag tag-fix">修复</span><b>「往下一拖关闭」其实一直没生效</b>：按住画布往下拖，
              浏览器把这张图片当成可拖动的图片启动了原生拖放，抢走指针并发了
              <code>pointercancel</code>，手势当场被掐掉；再加上拖动时弹窗跟着手指下移、
              指针会「离开」自己所在的元素，状态又被清空复位 —— 表现就是「怎么拖都关不掉、还会自己弹回去」。
              现在画布区禁掉原生拖放、抓住指针，并且不再用「指针离开」来结束拖动。
              在评论列表里往下滑仍然只是滑列表，不会误关弹窗</li>
              <li><span class="li-tag tag-fix">修复</span><b>评论一多就关不掉作品</b>：预览弹窗的头部不吸顶，评论多了以后头部跟着内容滚出屏幕，右上角的「关闭」就够不着了。头部改成吸顶，<b>再加一个往下一拖就关的手势</b>（顶部加了横条提示）。从输入框、色板或按钮上起手的拖动不触发，避免打字时误关；只轻轻拖 20px 也不关（有防误触阈值）</li>
              <li><span class="li-tag tag-fix">修复</span><b>自己的评论不靠右</b>，和别人的排在一起分不清哪条是自己说的。现在自己的评论整条镜像到右边：头像在右、文字右对齐，删除按钮也换到左边。服务端在读评论时顺便带回你的 uid，不额外发请求</li>
              <li><span class="li-tag tag-fix">修复</span><b>「我的」页作品图空白</b>：为了修居中，缩略图在量不到宽度时干脆不画了，结果 canvas 就是一块空板。现在先兜底画一帧保证不空白，下一帧自动重量重画拿到真实尺寸，最多重试 3 次以免白烧 CPU。7 种屏幕宽度下都验过：图有内容、左右留白一致、尺寸等于「可用宽向下取 16 的整数倍」</li>
              <li><span class="li-tag tag-fix">修复</span><b>删评论删不掉</b>：「作者」标记是发评论<b>那一刻</b>存下来的快照，身份变了以后就再也对不上 —— 结果是<b>作品作者删别人的评论点了没反应，删自己的又根本没按钮</b>。现在改成按当前身份算：服务端读评论时实时算谁是作品作者，前端拿它加上你自己的 uid 判断。万一没取到 uid，还有按登录用户名比的一层兜底</li>
              <li><span class="li-tag tag-new">新功能</span><b>每日/每周排行榜发光尘了</b>：每日榜取昨天收到光尘最多的前 10 名，前三名 10/6/3、其余 1 个参与奖；每周榜取上周主题赛的前 10 名，前三名 50/30/20、其余 5 个。每期结束自动结算，光尘直接打进账本并寄一封信到信箱，<b>不用手动领取</b>；结算幂等，重复触发不会翻倍。榜单在「我的 → 🏆 排行榜」看，公开免登录</li>
              <li><span class="li-tag tag-new">新功能</span><b>画师主页</b>：在社区点作者名就能进（以前只有一个简陋的作品列表）。现在能看到头像、简介、加入时间、关注/粉丝数、收到的光尘、作品数/绘制格数/创作天数/签到天数，下面是他的作品墙和<b>成就墙</b>（按分类筛选，只列解锁了的）。</li>
              <li><span class="li-tag tag-new">新功能</span><b>关注和好友</b>：主页上点「关注」，<b>互相都关注就是好友</b>，两边算出来必然一致，不另建一套好友关系。关注数、粉丝数、好友标记都是公开可见的</li>
              <li><span class="li-tag tag-update">更新</span><b>切页面不再自动请求了</b>：以前每切到一页就重新打一次接口，来回切几轮就把 Cloudflare 的免费请求额度烧光了。现在数据留在内存里、切回来直接显示不发请求，<b>旁边给一个「刷新」按钮</b>，想更新时自己点。信箱、每日任务、排行榜、画师主页都加了，「我的」页那个每日任务角标也改成只在这台设备第一次看时才请求（领了任务会自动重新算）</li>
              <li><span class="li-tag tag-fix">修复</span><b>以前发布的作品不算进创作数据</b>（绘制格数一直不涨就是这个原因）：账号系统之前作品是用「认领码」归属的——浏览器里存一串明文码，作品上只存它的哈希。认领码下线后作品改由登录账号归属，那些老作品就既没有账号、也没人认领，在「我的」页的作品数和绘制格数里全都不计。现在登录时会自动做一次迁移：把浏览器里还留着的那串认领码交给服务端做哈希匹配，对上的老作品一次性归到当前账号，收完就把本地那串码删掉（不会每次进页面都白跑一遍）。认领码在 KV 泄露的情况下依然无法冒用——必须持有那把明文钥匙；已经有归属的作品不会被抢走</li>
              <li><span class="li-tag tag-new">新功能</span><b>排行榜页面</b>（<code>/rank</code>，从「我的」页进）：<b>每日榜</b>看今天谁收到的光尘最多，<b>每周榜</b>是本周主题赛的票数榜，<b>我的奖励</b>列自己拿过几次、合计多少。前两名有奖牌 emoji，每行都带头像和自己的名次，榜上会标出「我」在哪一行，不用对 uid 猜是谁。每行还会写清楚这一名次能拿多少光尘（比如「第 4 名 · 每日榜可得 1 尘」），榜是公开的，不登录也能看</li>
              <li><span class="li-tag tag-update">更新</span>社区页顶部那块「国庆公告」已撤掉，公告以后只在信箱里看（那边本来就有信，还能随时回看，不用被一次性弹窗挡着视线）</li>
              <li><span class="li-tag tag-new">新功能</span><b>信箱可以清空了</b>，右上角一个「清空」按钮。<b>未领取的附件不会被清掉</b> —— 那些光尘是真实发出去的东西，没点「领取」就没了，所以清空时会把它们留着，并告诉你留了几封、值多少光尘。信箱空了按钮自动置灰</li>
              <li><span class="li-tag tag-fix">修复</span><b>设置页「启动时打开」和「导航栏样式」的按钮窄得没法看</b>：每格只剩 30px。根因不是列数，是样式表写错了顺序 —— <code>.row-col</code>（想设成 <code>align-items:stretch</code>）写在了 <code>.row</code>（<code>align-items:center</code>）前面，两者优先级相同、后写的赢，父级于是变成「按内容收缩」，里面的 grid 用 <code>1fr</code> 分宽度却分不到，容器缩到 68px。把 <code>.row-col</code> 移到 <code>.row</code> 之后即可，现在每格 160px</li>
              <li><span class="li-tag tag-fix">修复</span><b>暗色模式下每周主题比赛那块看不清</b>：比赛卡片的背景是写死的浅色渐变（米白→粉），而暗色适配只写了 <code>[data-theme="dark"]</code> —— 暗色主题一共 8 个，只有 id 叫 dark 的那个被命中，夜阑/深海/墨林/玫瑰夜/森语/夜航/炭这 7 个仍是浅底配浅色文字。现在 html 上额外打一个 <code>data-mood="dark|light"</code>，视图里凡是暗色适配一律用 <code>[data-mood="dark"]</code>（共 27 处），新增暗色主题自动生效。8 个暗色主题逐一量过对比度，正文 11~12、强调色 4.3~10、角标 14.5，全部达标</li>
              <li><span class="li-tag tag-fix">修复</span><b>头像页和画板的喷漆都有白色条纹</b>：喷漆画布的背板一直固定成 64×dpr，但画布实际显示宽度最大 512px，两边不是整数倍时浏览器就得拉伸位图，最后一行/一列只盖住部分像素，露出来的就是白线（和之前像素画板上是同一个毛病）。改成按实测显示宽度建背板，并加了 ResizeObserver，窗口缩放或转屏后会自动重建</li>
              <li><span class="li-tag tag-fix">修复</span><b>「我的」页快捷入口挤在一行溢出</b>：入口已经有 7 个，手机宽度下每个只剩 40px 出头、标签被压得换行。改成 4 列 × 2 行网格，正好两行，字号跟着收一档</li>
              <li><span class="li-tag tag-fix">修复</span>「我的」页作品卡片的标题左对齐，长短不一的标题排在一起参差不齐；已改成居中</li>
              <li><span class="li-tag tag-fix">修复</span>尺寸筛选片上的「16×16 1」里末尾那个件数紧跟在 16 后面，很容易看成尺寸的一部分。件数已拆成独立的小圆角徽标（带底色、比正文小一号），尺寸和数量一眼能分开</li>
              <li><span class="li-tag tag-update">更新</span>加载动画换成一个小方块在轨道里左右来回走，方块颜色取 <code>var(--accent)</code>，换主题自动跟着变；也尊重系统的「减少动态效果」设置</li>
              <li><span class="li-tag tag-fix">修复</span><b>能靠刷自己作品的白拿每日榜冠军奖</b>，这是个能无限套利的漏洞：<br />① 送自己作品时，接口每点一次就给计数 +1，既不扣光尘也没有次数上限；<b>而这个计数正是每日榜的排序依据</b>，等于可以对着自己的画狂点，把自己顶到榜首每天领 10 个光尘。现在送自己的画什么都不做——不扣、不转、计数也不加，并明确提示「不能自己送光尘给自己」<br />② <code>POST /api/like</code> 是个<b>没有鉴权、没有去重、没有限流</b>的接口，传个作品时间戳就能把任意作品的计数改成任意值。它原本只有一个调用方，而那个调用方（画板页的 <code>likeWork</code>）是死代码、从来没被调用过。已把 POST 整个删掉，只留 GET（佳作展示的 Top 榜），死代码一并清除</li>
              <li><span class="li-tag tag-new">新功能</span><b>发布作品也有光尘了</b>：每发一幅得 1 个光尘，<b>每天靠发布最多拿 10 个</b>（第 11 幅起照样能发，只是不再给光尘）。发布成功的提示里会写清「得到 1 个光尘（今天靠发布已得 3/10）」，拿满了也会说明。<b>像素相机转出来的作品不给这个奖励</b>——导入图片不算创作</li>
              <li><span class="li-tag tag-fix">修复</span><b>四个页面的报错都写死成「网络错误」</b>：画头像、简介、成就墙、信箱的 catch 无论抛什么都显示同一句话，把真实原因全吞了——头像页就因为这个，接口 200 正常却一直显示「读取失败：网络错误」，排查时完全看不出是代码里少了函数。现在都改成打印并显示真实的错误信息，以后这类问题一眼就能看到</li>
              <li><span class="li-tag tag-fix">修复</span>画头像的喷漆笔刷滑块拖不动：<code>&lt;input type=range&gt;</code> 拖动时只发 <code>input</code> 事件不发 <code>click</code>，而这段逻辑挂在 click 上，所以数值和笔刷粗细都不跟着变。已拆成独立的 input 监听</li>
              <li><span class="li-tag tag-fix">修复</span><b>像素喷漆没法选颜色</b>：调色板藏在「颜色」按钮后面，而喷漆模式下整排工具按钮被 <code>display:none</code> 藏掉了，那个按钮也跟着消失，结果喷漆全程只能用进模式前的那一个颜色。现在喷漆工具条自带一块 32 色紧凑色板，另加「🎨 更多颜色」直接展开完整调色板和 HSV 面板；在任何地方换了色（预设、色值、HSV、吸管）这块色板的高亮都会跟着走</li>
              <li><span class="li-tag tag-fix">修复</span>画头像时光尘不够，保存按钮还是可点的（<code>draw()</code> 和 <code>drawPreview()</code> 都无条件把 disabled 设回 false），点了才被服务端拒绝。现在余额不够时按钮置灰不可点，并提示还差多少。头像页工具栏也补了间距，不再和上面的色板挤在一起</li>
              <li><span class="li-tag tag-fix">修复</span>点「个人简介」会整页刷新一下才打开——那个入口用的是 <code>location.href</code>，把 Vue 和全部脚本重新拉一遍，所以明显卡顿。改成走路由切换，并给路由对象开了个全局引用给 JS 动态挂的入口用</li>
              <li><span class="li-tag tag-update">更新</span>不再说「点赞」，统一改成「送出的光尘」：作品上的数字是作者收到多少份光尘，「我的」里那块列表改叫「✨ 送过光尘的」，佳作展示的排序说明改成「按收到的光尘排名」。二维码打赏的「赞赏」是另一回事，保留不动</li>
              <li><span class="li-tag tag-fix">修复</span>取色器吸取颜色后 HSV 不同步：吸管只更新了色块和色值文本，而 SV 方块和色相条的圆点位置由 H/S/V 状态驱动，从没被反解回去，所以圆点一直停在旧位置。现在补了 RGB→HSV 换算，吸取后同步 H/S/V 并重绘两个面板（灰色系没有色相，会保留原色相以免色相条乱跳）</li>
              <li><span class="li-tag tag-fix">修复</span><b>内容安全太严格</b>：作者名「作者大大」里的「大大」被词库收录，导致<b>每一幅作品都发不出去</b>。根因是源词库为评论过滤设计，两字词条里混了大量政治/军事词碎片（人大、东北、夏天、新星、风水…）。改成结构性规则：<b>三字及以上才算命中</b>，两字词只认一份高危清单（傻逼、操你、SB、fuck、赌博、毒品、诈骗、枪支等）。2809 个常用双字词误伤数从 44 降到 0，同时习近平、法轮功、枪支弹药、恐怖袭击等仍正常拦截</li>
              <li><span class="li-tag tag-new">新功能</span>内容安全报错现在会指出是哪个字段、哪个词：「作品名「××」含有不合适的内容」，不用再猜该改哪里</li>
              <li><span class="li-tag tag-fix">修复</span>头像页「像素喷漆」没有颜色可选（之前把调色板整个换成了笔刷条）。现在两种画法共用一份 36 色，喷漆用紧凑九宫格色板；笔刷滑块也补上了事件</li>
              <li><span class="li-tag tag-fix">修复</span>设置页「画板布局」「进阶功能」两个折叠标题左边没空隙：上次加折叠样式时用了 <code>.group.fold</code>，命中了全部四个分组，把原有两组的内边距一起清掉了。现在新样式改用独立的 <code>.foldx</code> 作用域，互不影响</li>
              <li><span class="li-tag tag-fix">修复</span><b>发布作品报 500</b>：上次把发布限流从 5 分钟改成 30 秒后，限流记录的 <code>expirationTtl</code> 算出来是 30，而 <b>Cloudflare KV 规定 TTL 最小 60 秒</b>，传更小会直接抛异常 —— 那行又没有 try 包裹，于是整个发布请求 500，用户完全发不出作品。现在 TTL 取 <code>max(60, 窗口)</code> 并加了 try 兜底，限流记录写不进去也不再拦住发布</li>
              <li><span class="li-tag tag-ui">界面</span>设置页「启动时打开」4 个选项和「导航栏样式」6 个选项都改成两列，格子宽了一倍，之前每格只有 85px 文字被挤</li>
              <li><span class="li-tag tag-ui">界面</span>头像页顶部留白收紧（页面内边距 14→8、标题下间距 12→8），画布和工具往上提</li>
              <li><span class="li-tag tag-ui">界面</span>设置页「外观」「启动与导航」的折叠样式补上 —— 之前只有 HTML 和交互，样式没写进去，所以显示成原生按钮的样子</li>
              <li><span class="li-tag tag-fix">修复</span><b>头像计费把余额清零</b>：上次把价格改成「像素画 20 / 喷漆 30」时，服务端还在拿整个价格表对象做比较 —— <code>26 &lt; {…}</code> 恒为 false，余额检查形同虚设直接放行，扣费时 <code>26 - {…}</code> 算出 NaN 又被兜成 0。表现就是「26 个光尘也能改头像，改完余额变 0」。现在按当前画法取数字价格，每次保存都扣，扣完就是真扣</li>
              <li><span class="li-tag tag-new">新功能</span>头像支持两种画法：<b>🖌️ 像素画</b>（16×16 逐格涂，20 光尘）和 <b>💨 像素喷漆</b>（64×64 自由喷，保存时降采样到 16×16，30 光尘）。两套完全独立，切换时提醒会丢失当前内容；已有头像再改会先弹窗确认价格；余额不够会直接告诉你还差几个</li>
              <li><span class="li-tag tag-new">新功能</span>社区公告也发到信箱里了：打开信箱会收到「国庆更新说明」一封信，不用专门跑到社区看公告。一人一封，不会重复收到</li>
              <li><span class="li-tag tag-ui">界面</span>设置页「外观」和「启动与导航」两组改成可折叠的下拉，点标题收起来，点开恢复；展开状态会记住，下次进来还是你上次的样子。里面的功能一个没少（20 套主题、6 款导航样式、画板布局折叠都还在）</li>
              <li><span class="li-tag tag-ui">界面</span>画板「自定义颜色」按钮上方加了 14px 空隙，之前紧贴上方的当前色值行</li>
              <li><span class="li-tag tag-new">新功能</span>新增个人简介：在「我的」页头像下方点一下就能写，<b>每保存一次 10 个光尘</b>（内容没变化不扣钱）。限 60 字，自动折叠换行。简介会显示在「我的」页面，别人点进你的作品时也能看到作者简介</li>
              <li><span class="li-tag tag-ui">界面</span>画板按钮的图标和小字之间加了 4px 空隙，之前 gap 只有 1px，下载按钮的箭头几乎贴住「下载」两个字</li>
              <li><span class="li-tag tag-fix">修复</span><b>像素画 everywhere 的白色条纹</b>：根因是 canvas 背板尺寸和 CSS 显示尺寸不是整数倍关系，浏览器拉伸时最后一行/一列只覆盖了部分像素，露出的就是白边。头像编辑器背板只给到 32 像素却要拉到 256 显示，画板背板固定 512 而实际显示只有 334 —— 两处都在漏白边。现在背板一律等于「显示宽度 × dpr」，并在窗口尺寸变化时重新同步；社区和「我的」的缩略图也换成整数倍缩放的统一实现</li>
              <li><span class="li-tag tag-fix">修复</span>「我的作品」页显示「需要登录」：重做头部时漏改了 applyMode 里一处 title 引用，抛异常后整个页面逻辑停摆，连带顶部也显示成「未登录」</li>
              <li><span class="li-tag tag-ui">界面</span>社区右上角设置按钮的 ⚙️ 改为 flex 居中，之前靠 line-height 顶，emoji 看着偏下</li>
              <li><span class="li-tag tag-fix">修复</span>信箱一直收不到信：投递只挂在注册/登录那一刻，账号如果是那次上线之前建的，直接点信箱进来永远是空的。现在打开信箱就会补投（不会重复收到）</li>
              <li><span class="li-tag tag-remove">移除</span><b>认领码功能整体下线</b>：发布作品早已改为按登录账号归属，认领码每次发布都在白白申请却没派上用场。现在发布、删除作品、查看创作数据全部走账号；设置页的认领码分组和 FAQ 说明一并删除。账号系统之前发布的老作品没有账号关联，将无法在站内管理</li>
              <li><span class="li-tag tag-fix">修复</span>像素相机转出来的作品不再计入「绘制格数」类成就：一张 64×64 照片就是 4096 格，不排除的话传几十张就能刷满「十万格之境」。这类作品照算作品数，只是不算一笔一笔画的量</li>
              <li><span class="li-tag tag-ui">界面</span>发布间隔从 5 分钟改成 30 秒，被限流时按钮上直接显示倒计时（29s、28s…），不用猜要等多久</li>
              <li><span class="li-tag tag-new">新功能</span>「我的」页创作数据改用登录账号统计，不再依赖认领码（认领码那套已被账号取代，之前没作品的用户会一直看到「还没有认领码」）</li>
              <li><span class="li-tag tag-ui">界面</span>画板「镜像」按钮也补上小字了，现在像素相机 / 镜像 / 下载三个按钮都是图标在上小字在下</li>
              <li><span class="li-tag tag-new">新功能</span>新增头像系统：可以用 16×16 像素编辑器自己画头像，<b>首次保存花 30 个光尘</b>（之后随便改都不再收费），画好的头像会显示在社区里你每幅作品上；没画过的用默认头像（配色按账号生成，同一个人每次看到都一样，不同人颜色不同，方便区分）。入口在「我的」页右上角</li>
              <li><span class="li-tag tag-new">新功能</span>成就达成会有提示：发布作品、送光尘、签到之后自动检查并弹卡，不用再自己去成就页翻</li>
              <li><span class="li-tag tag-new">新功能</span>别人给你送光尘，你也会收到：赠送在服务端按作品归属把钱转给作者，「我的」页光尘栏右侧显示「累计收到 N」。给自己的画送光尘不会转移（否则可以自己刷出无限光尘），但赞照给</li>
              <li><span class="li-tag tag-new">新功能</span>签到和送光尘现在都需要登录：这两个都是互动行为，未登录点「签到」或「✨ 送光尘」会提示并跳转登录页。本机记账已整体移除，不再出现「换设备就清零、还能改出来」的情况</li>
              <li><span class="li-tag tag-new">新功能</span>新增成就墙 /achieve：22 个成就分「进度」与「里程碑」两类，涵盖作品数、绘制格数、收到赞、创作天数、累计签到，以及尺寸、动画、比赛、夜猫子等一次性成就。进度实时从作品历史统计，断签不清零；解锁时按档位发放光尘，重复进入不会重复发</li>
              <li><span class="li-tag tag-new">新功能</span>新增登录页 /login：白底居中单卡，登录与注册在同一张卡内切换；密码用 PBKDF2 加盐哈希存储，登录凭证由服务端密钥签名、客户端本地保存，换设备用同一账号密码登录即可同步</li>
              <li><span class="li-tag tag-new">新功能</span>「✨ 光尘」：每日签到得 5 个（连续里程碑额外奖励，数额等于里程碑天数，如连续 7 天再送 7 个）；给作品赠送光尘代替点赞，同一幅只能送一次，余额不足送不出；光尘可累积，攒着送给最喜欢的那幅</li>
              <li><span class="li-tag tag-new">新功能</span>「我的」新增两个过滤页：/mine/works 只显示自己发布的作品，/mine/gifted 只显示自己送过光尘的作品，不再跳进社区</li>
              <li><span class="li-tag tag-update">更新</span>配色主题选择器分为「浅色系 12 套」与「夜间系 8 套」两组，每格显示色条与名字，底部提示当前主题；主题数据与 CSS 统一由 themes.js 生成，避免多处手写冲突</li>
              <li><span class="li-tag tag-update">更新</span>导航切页新增音效，四个入口都响；社区/日志/常见问题右上角的月亮按钮改为设置入口</li>
              <li><span class="li-tag tag-fix">修复</span>导航图标在深色主题下浮出亮色方块：改用文字光晕而非背景色块，高亮项改用下划线指示</li>
              <li><span class="li-tag tag-fix">修复</span>创作数据的尺寸比例条不显示：span 默认 inline 导致宽高失效，补 display:block</li>
              <li><span class="li-tag tag-update">更新</span>移除设置页「历史记录」与画板页「我的绘画历史」，统一在「我的」查看</li>
              <li><span class="li-tag tag-announce">公告</span>国庆节快乐！本次更新汇总：20 套配色主题、18 种提示音效、我的（签到+创作数据）、社区发现、内容举报与审核、导航栏全面自定义、像素相机、新手教程、可装到桌面离线使用，以及联机同步、手型工具误画、小地图遮挡、深色模式对比度等一系列修复</li>
              <li><span class="li-tag tag-fix">修复</span>作品缩略图在像素数据缺失时会出现白色条纹：现在缺失的格子按白底填充，而不是留成透明</li>
              <li><span class="li-tag tag-update">更新</span>设置页底部把「维护社区稳定」与「问题反馈」合并为一张不透明的联系卡</li>
              <li><span class="li-tag tag-new">新功能</span>底部导航新增「🌱 我的」：每日签到（连续天数 + 里程碑徽章）、创作数据（作品数、获赞、绘制格数、创作天数、尺寸分布、最受欢迎作品）以及我的作品墙</li>
              <li><span class="li-tag tag-new">新功能</span>导航栏可自定义：启动时打开哪个页面改成单选（画板/社区/我的/设置），导航位置可选顶部或底部，四个入口的先后顺序也能调整</li>
              <li><span class="li-tag tag-new">新功能</span>社区新增「🔍 发现」：随机翻出一件旧作品，点赞多的更容易被翻出来，让被时间埋掉的好东西重见天日</li>
              <li><span class="li-tag tag-new">新功能</span>配色主题从 7 套扩到 20 套，新增 6 套夜间系（深海、墨林、玫瑰夜、森语、夜航、炭）与 7 套浅色系（奶茶、薰衣草、蜜桃、雾霭、抹茶、燕麦、复古）</li>
              <li><span class="li-tag tag-fix">修复</span>导航栏在深色主题下，当前页会浮出一个比导航条更亮的方块：改为同底色的淡强调色；图标底衬也统一用导航条本身的颜色</li>
              <li><span class="li-tag tag-fix">修复</span>「启动直达」此前完全没生效：根路径写的是静态 redirect，会在守卫之前就被解析掉，导致永远进画板。现改为函数式 redirect，四个页面都能选</li>
              <li><span class="li-tag tag-update">更新</span>新手教程移除「多人一起画」，社区点赞提示补充「再点一次可取消」</li>
              <li><span class="li-tag tag-new">新功能</span>鬼房间自动清理：成员心跳超过 25 秒视为掉线并移出房间，房间没人时直接销毁；在线列表只显示真有人在线的房间</li>
              <li><span class="li-tag tag-fix">修复</span>底部导航调到最透明时文字会看不见：现在越透明文字对比度越高，且每个图标会自动浮现浅色底衬，任何内容上都能看清</li>
              <li><span class="li-tag tag-fix">修复</span><b>联机房间改用 Durable Object 存储</b>：原先房间状态存在单个 KV key 上，而 KV 是最终一致的，两个人同时操作会各自读到旧快照再互相覆盖，导致房主看不到别人加入、落笔完全不同步、明明两人在线却提示「至少需要 2 人才能开始」。现在同一房间的请求串行处理，写入立即可见</li>
              <li><span class="li-tag tag-fix">修复</span>落笔的 250ms 限流原本与「加入房间、改标题」共用时间戳，进房后马上画会被误判为「操作太快」，已改为只按上一次落笔计时</li>
              <li><span class="li-tag tag-new">新功能</span>联机页新增「在线房间」列表：能看到当前所有还开着的房间（模式、人数、是否有密码、最后活跃时间），一键填码加入，每 5 秒自动刷新</li>
              <li><span class="li-tag tag-new">新功能</span>创建房间时可选择是否设置密码：密码以哈希形式存储，原文不落库；加入时若需要密码会自动展开输入框，自己建房的密码会记在本机下次自动填好</li>
              <li><span class="li-tag tag-new">新功能</span>设置页新增「底部导航透明度」滑块：0% 全透明到 100% 完全不透明，拖动时底部导航和预览条同步实时变化，附常用预设</li>
              <li><span class="li-tag tag-update">更新</span>点赞可以取消了：再点一次即可撤回，点赞数与「我赞过的」记录同步更新</li>
              <li><span class="li-tag tag-update">更新</span>佳作展示只收录真正被喜欢过的作品，0 赞的不再占用位置</li>
              <li><span class="li-tag tag-update">更新</span>朋友圈分享卡片底部留出空白，二维码不再紧贴图片下边缘</li>
              <li><span class="li-tag tag-fix">修复</span>维护后台的举报列表之前会被浏览器缓存，导致新提交的举报看不到、已处理的举报刷新后又冒出来；现已禁用缓存、加载互不依赖，并在本机记住已处理的条目</li>
              <li><span class="li-tag tag-fix">修复</span>取色器图标换成更贴切的 💉</li>
              <li><span class="li-tag tag-update">更新</span>任意工具都能拖动画布：工具栏新增 ✥ 拖动锁，开启后不管选哪个工具，拖动都只移动画布</li>
              <li><span class="li-tag tag-update">更新</span>「图片转像素画」更名为「📷 像素相机」</li>
              <li><span class="li-tag tag-update">更新</span>设置页的「画板布局」与「进阶功能」收进可折叠分组，并显示已开启数量，开关不再铺满整页</li>
              <li><span class="li-tag tag-update">更新</span>朋友圈分享卡片重做：作品模糊成背景氛围，元素按固定栅格排布不再重叠，超长标题会自动缩号</li>
              <li><span class="li-tag tag-update">更新</span>操作按钮行（撤销、清空、导出、上传）的描边、圆角与阴影改为与绘画工具栏一致</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.3.0</span> 开局菜单 · 手型平移 · 常见问题 <span class="ver-date">2026-10</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-update">更新</span>画板改为「开局菜单」：进入不再直接落笔，尺寸、模式、参加活动、图片工具一次选完再开始</li>
              <li><span class="li-tag tag-update">更新</span>新增手型平移工具（快捷键 H）：任何尺寸都能拖动画布，与画笔完全独立，不会误落笔</li>
              <li><span class="li-tag tag-update">更新</span>设置新增「画板布局」母/子分组：可分别隐藏尺寸栏、工具栏、历史、参赛卡、操作按钮、提示与版权</li>
              <li><span class="li-tag tag-update">更新</span>新增常见问题页：说明为什么不做 128×128（单件 203.5KB 超上限、存满需 994MB 撞存储上限）</li>
              <li><span class="li-tag tag-update">更新</span>色板由 9 色扩到 32 色，图片转像素画可选择只用这 32 色</li>
              <li><span class="li-tag tag-update">更新</span>进阶功能默认全部关闭：题目模式、帧动画、每日挑战、本周主题、图片转像素画等按需开启</li>
              <li><span class="li-tag tag-update">更新</span>认领码：可自行删除自己上传的作品，设置页可查看备份</li>
              <li><span class="li-tag tag-update">更新</span>图片一键像素化、作品标签、社区搜索、标签云、作者主页、每日挑战</li>
              <li><span class="li-tag tag-fix">修复</span>联机延迟：落笔同步由 1.5～3.2 秒降至十几毫秒</li>
              <li><span class="li-tag tag-fix">修复</span>联机人数长时间不同步、一方开始游戏另一方收不到</li>
              <li><span class="li-tag tag-fix">修复</span>删除作品后误报「网络错误」（实际已删除成功）</li>
              <li><span class="li-tag tag-fix">修复</span>手机端页面被放大、画板内容超出屏幕无法左右滑动</li>
              <li><span class="li-tag tag-fix">修复</span>底部导航切页时飞出屏幕（果冻动画覆盖了居中定位）</li>
            </ul>
          </div>
        </div>

        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.2.0</span> 单页应用 · 国庆 <span class="ver-date">2026-10-01</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-announce">公告</span>国庆快乐！祝大家假期愉快、笔下生花，画出满意的作品 🎨</li>
              <li><span class="li-tag tag-update">更新</span>前端升级 Vue 3 + Vue Router 单页应用：底部导航常驻，页面切换不再整页刷新，丝滑无加载感</li>
              <li><span class="li-tag tag-update">更新</span>维护社区稳定、使用条款两个页面现已支持深色模式，跟随全局主题切换</li>
              <li><span class="li-tag tag-update">更新</span>卡片按作品类型描边：主题比赛蓝、帧动画紫、多人联机青绿，并新增「多人」徽章</li>
              <li><span class="li-tag tag-fix">修复</span>切页时导航会飞出屏幕、果冻动画覆盖水平居中导致错位</li>
              <li><span class="li-tag tag-fix">修复</span>社区、更新日志、设置等页面宽度错乱（布局统一交给各页自身控制）</li>
              <li><span class="li-tag tag-fix">修复</span>画板与联机在手机上被整体放大，现已锁定缩放且不再左右滑动</li>
            </ul>
          </div>
        </div>

        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.1.0</span> 主题比赛 · 玻璃导航 <span class="ver-date">2026-09</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-announce">公告</span>“像素小镇”是一个 VibeCoding（氛围编程）项目：由对话与灵感驱动，在一次次碰撞与迭代中自然生长，每一行代码都记录着创造的过程</li>
              <li><span class="li-tag tag-update">更新</span>每周主题比赛：每周一个主题自动轮换，作品可报名参赛，社区投票选出本周最佳，排行榜实时更新</li>
              <li><span class="li-tag tag-update">更新</span>导航栏升级苹果风毛玻璃质感，可在设置中一键开关</li>
              <li><span class="li-tag tag-fix">修复</span>界面文案统一为「像素小镇」，修正历史残留命名</li>
            </ul>
          </div>
        </div>

        <div class="ver red">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v1.0.0</span> 更名像素小镇 · 动画进社区 <span class="ver-date">2026-09-26</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-announce">公告</span>项目更名「像素小镇」（原“光域”），与知名游戏名称保持区隔；英文项目名 light field 不变</li>
              <li><span class="li-tag tag-update">更新</span>画板升级创作模式：自由模式 / 题目模式 / 帧动画，进板先选模式</li>
              <li><span class="li-tag tag-update">更新</span>帧动画可发布到社区，社区可点击动画实时播放、可点赞</li>
              <li><span class="li-tag tag-update">更新</span>帧动画新增播放速度：快 ×2 / 标准 / 慢 / 更慢</li>
              <li><span class="li-tag tag-update">更新</span>有未完成画作时自动进入上次模式，不再反复要求选择</li>
              <li><span class="li-tag tag-update">更新</span>设置新增启动直达：进入社区，有画作时进入画板</li>
              <li><span class="li-tag tag-update">更新</span>赞赏码长按识别提示</li>
              <li><span class="li-tag tag-fix">修复</span>画板底部提示被导航栏遮挡看不见</li>
              <li><span class="li-tag tag-fix">修复</span>作品详情移除多余的复制文案入口</li>
              <li><span class="li-tag tag-fix">修复</span>手机端找不到帧动画入口</li>
            </ul>
          </div>
        </div>

        <div class="ver blue">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v0.9.0</span> 社区容量与维护者计划 <span class="ver-date">2026-09-26</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-update">更新</span>你画我猜：全新 100 个题库，进房前可选择游戏模式</li>
              <li><span class="li-tag tag-update">更新</span>画板：16×16 逐帧动画，可导出循环 GIF 分享</li>
              <li><span class="li-tag tag-update">更新</span>历史记录改为「我的绘画历史」，只看自己发布的作品</li>
              <li><span class="li-tag tag-update">更新</span>朋友圈小卡片重绘为像素画风，简约不花哨</li>
              <li><span class="li-tag tag-update">更新</span>社区作品容量提升至 5000 件，存储改为分块管理</li>
              <li><span class="li-tag tag-announce">公告</span>新增「维护社区稳定」维护者计划与更新日志页</li>
              <li><span class="li-tag tag-update">更新</span>画板移除联机快捷入口与黑夜模式按钮，界面更简洁（主题仍在设置页切换）</li>
            </ul>
          </div>
        </div>

        <div class="ver blue">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v0.8.0</span> 分享卡片与设置 <span class="ver-date">2026-09</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-update">更新</span>朋友圈小卡片：把作品生成卡片分享到朋友圈</li>
              <li><span class="li-tag tag-update">更新</span>新增设置页：深色模式开关、主题切换</li>
              <li><span class="li-tag tag-update">更新</span>底部导航栏，画板 / 联机 / 社区 / 设置一键直达</li>
            </ul>
          </div>
        </div>

        <div class="ver blue">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v0.7.0</span> 联机模式 <span class="ver-date">2026-09</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-update">更新</span>你画我猜：自由模式与积分模式，房间对战</li>
              <li><span class="li-tag tag-update">更新</span>实时同步画笔、橡皮、填充操作</li>
            </ul>
          </div>
        </div>

        <div class="ver blue">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v0.6.0</span> 社区与多尺寸画布 <span class="ver-date">2026-08</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-update">更新</span>上传作品到社区，互相点赞</li>
              <li><span class="li-tag tag-update">更新</span>画布支持 16×16 / 32×32 / 64×64</li>
              <li><span class="li-tag tag-update">更新</span>作品墙时间线展示，佳作榜展示高赞作品</li>
            </ul>
          </div>
        </div>

        <div class="ver blue">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v0.5.0</span> 命题与取色 <span class="ver-date">2026-08</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-update">更新</span>命题绘画：按主题出题，激发创作灵感</li>
              <li><span class="li-tag tag-update">更新</span>撤销与重绘、HSV 自由取色、#RRGGBB 输入</li>
            </ul>
          </div>
        </div>

        <div class="ver blue">
          <div class="ver-body">
            <div class="ver-title"><span class="ver-tag">v0.1.0</span> 像素小镇诞生 <span class="ver-date">2026-07</span></div>
            <ul class="ver-list">
              <li><span class="li-tag tag-update">更新</span>16×16 像素画创作，朴素又可爱</li>
              <li><span class="li-tag tag-update">更新</span>本地保存，随时继续画</li>
            </ul>
          </div>
        </div>
      </section>

      <div class="copyright">© 2026 像素小镇 · 版权所有 · 作者 Lin Sifan</div>
    </div>`,
  mounted() {  },
}
