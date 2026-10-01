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
      [data-theme="dark"] .bottom-nav {
        background: rgba(var(--nav-base, 42, 38, 33), var(--nav-op, 0.62)) !important;
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
        <router-link class="theme-btn" to="/settings" title="设置" aria-label="设置">⚙️</router-link>
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
