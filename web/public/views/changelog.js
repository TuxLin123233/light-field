// 由 changelog.html 自动转换为 Vue 3 视图（无构建）
export default {
  name: 'changelog',
  title: '更新日志',
  css: `      /* hidden 属性兜底：避免类选择器里的 display 覆盖 UA 的 [hidden]{display:none} */
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
      [data-theme="dark"] {
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
        color: var(--text-faint);
        font-size: 10px;
        font-weight: 700;
        transition: color 0.2s, background 0.2s;
      }

      .bottom-nav a .nav-icon { font-size: 18px; line-height: 1; }

      .bottom-nav a.active { color: var(--accent); background: var(--surface-2); }
    
      /* ---------- 导航栏毛玻璃（苹果 Liquid Glass） ---------- */
      .bottom-nav {
        background: rgba(255, 253, 250, 0.66) !important;
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        backdrop-filter: blur(24px) saturate(180%);
        border-color: rgba(180, 168, 150, 0.30) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
      [data-theme="dark"] .bottom-nav {
        background: rgba(42, 38, 33, 0.62) !important;
        border-color: rgba(255, 255, 255, 0.10) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
      html.glass-off .bottom-nav,
      html.glass-off [data-theme="dark"] .bottom-nav {
        background: var(--surface) !important;
        border-color: var(--border) !important;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }
`,
  template: `<div class="container">
      <div class="header">
        <div class="header-text">
          <h1>更新日志</h1>
          <div class="header-sub">像素小镇 · 每次更新都有迹可循</div>
        </div>
        <button class="theme-btn" id="themeBtn" type="button" title="切换主题">🌙</button>
      </div>

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
              <li><span class="li-tag tag-fix">修复</span><b>联机房间改用 Durable Object 存储</b>：原先房间状态存在单个 KV key 上，而 KV 是最终一致的，两个人同时操作会各自读到旧快照再互相覆盖，导致房主看不到别人加入、落笔完全不同步、明明两人在线却提示「至少需要 2 人才能开始」。现在同一房间的请求串行处理，写入立即可见</li>
              <li><span class="li-tag tag-fix">修复</span>落笔的 250ms 限流原本与「加入房间、改标题」共用时间戳，进房后马上画会被误判为「操作太快」，已改为只按上一次落笔计时</li>
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
  mounted() {
      const themeBtn = document.getElementById('themeBtn')

      function syncThemeUI() {
        themeBtn.textContent =
          document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'
      }

      themeBtn.addEventListener('click', () => {
        const cur =
          document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', cur)
        try {
          localStorage.setItem('lw-theme', cur)
        } catch (e) {}
        syncThemeUI()
      })

      syncThemeUI()
  },
}
