// 由 settings.html 自动转换为 Vue 3 视图（无构建）
export default {
  name: 'settings',
  title: '设置',
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

      .container {
        width: 100%;
        max-width: 560px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      .header-text { flex: 1; min-width: 0; }

      .header-text h1 {
        font-size: 20px;
        font-weight: 800;
        color: var(--text);
      }

      .header-sub {
        font-size: 13px;
        color: var(--text-faint);
        margin-top: 4px;
      }

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
        margin-bottom: 16px;
        box-shadow: 0 4px 14px var(--shadow);
      }

      .group-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-faint);
        margin-bottom: 12px;
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 0;
      }

      .row + .row { border-top: 1px solid var(--border); }

      .row-label { font-size: 14px; font-weight: 600; }

      .row-desc { font-size: 11px; color: var(--text-faint); margin-top: 2px; }

      .switch {
        flex: 0 0 auto;
        appearance: none;
        width: 52px;
        height: 30px;
        border-radius: 999px;
        background: var(--border-strong);
        position: relative;
        cursor: pointer;
        transition: background 0.2s;
        outline: none;
        border: none;
      }

      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #fff;
        transition: left 0.2s;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
      }

      .switch:checked {
        background: var(--accent);
      }

      .switch:checked::after { left: 25px; }

      .entry {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 0;
        text-decoration: none;
        color: var(--text);
        border-bottom: 1px solid var(--border);
      }

      .entry:last-child { border-bottom: none; }

      .entry-ico { font-size: 18px; }

      .entry-body { flex: 1; min-width: 0; }

      .entry-label { font-size: 14px; font-weight: 600; }

      .entry-desc { font-size: 11px; color: var(--text-faint); margin-top: 2px; }

      .entry-arrow { color: var(--text-faint); }

      .qr-row { display: flex; flex-direction: column; align-items: center; gap: 10px; }

      .qr-row img { width: 150px; height: 150px; border-radius: 12px; border: 2px solid var(--border); }

      .qr-note {
        font-size: 12px;
        color: var(--text-faint);
        text-align: center;
        line-height: 1.6;
      }

      .notice {
        font-size: 12px;
        color: var(--text-faint);
        line-height: 1.7;
        text-align: justify;
      }

      .copyright {
        margin-top: 18px;
        text-align: center;
        font-size: 12px;
        color: var(--text-faint);
      }

      /* ---------- 底部导航 ---------- */
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

      .bottom-nav a.active {
        color: var(--accent);
        background: var(--surface-2);
      }
    
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

      /* ---------- 毛玻璃切换动画（果冻惯性） ---------- */
      @keyframes glassJelly {
        0%   { transform: scale(1, 0.98) translateY(5px); }
        30%  { transform: scale(1.04, 0.99) translateY(-4px); }
        55%  { transform: scale(0.985, 1.012) translateY(3px); }
        78%  { transform: scale(1.01, 0.997) translateY(-1px); }
        100% { transform: scale(1, 1) translateY(0); }
      }
      .bottom-nav.jelly {
        animation: glassJelly 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes switchWobble {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.18) rotate(-5deg); }
        70%  { transform: scale(0.94) rotate(2deg); }
        100% { transform: scale(1) rotate(0); }
      }
      .switch.jelly { animation: switchWobble 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
`,
  template: `<div class="container">
      <div class="header">
        <div class="header-text">
          <h1>设置</h1>
          <div class="header-sub">调整外观、了解像素小镇</div>
        </div>
        <button class="theme-btn" id="themeBtn" type="button" title="切换主题">🌙</button>
      </div>

      <section class="group">
        <div class="group-title">外观</div>
        <div class="row">
          <div>
            <div class="row-label">深色模式</div>
            <div class="row-desc">适合在夜里画画，保护眼睛</div>
          </div>
          <input class="switch" id="darkSwitch" type="checkbox" role="switch">
        </div>
        <div class="row">
          <div>
            <div class="row-label">玻璃导航</div>
            <div class="row-desc">底部导航使用苹果风的毛玻璃质感</div>
          </div>
          <input class="switch" id="glassSwitch" type="checkbox" role="switch">
        </div>
      </section>

      <section class="group">
        <div class="group-title">启动</div>
        <div class="row">
          <div>
            <div class="row-label">启动直达社区</div>
            <div class="row-desc">每次进入先打开社区；若有未完成的绘画内容，则自动进入画板继续创作</div>
          </div>
          <input class="switch" id="entranceSwitch" type="checkbox" role="switch">
        </div>
      </section>

      <section class="group">
        <div class="group-title">我的数据</div>
        <div class="row">
          <div>
            <div class="row-label">历史记录</div>
            <div class="row-desc">画板页展示你的绘画历史，社区按时间排序可一直往回翻</div>
          </div>
          <router-link class="entry-arrow" to="/paint" style="text-decoration:none;color:var(--accent);font-weight:700">去画板 →</router-link>
        </div>
      </section>

      <section class="group">
        <div class="group-title">更多</div>
        <router-link class="entry" to="/terms">
          <span class="entry-ico">📄</span>
          <span class="entry-body">
            <span class="entry-label">使用条款</span>
            <div class="entry-desc">服务说明与规范</div>
          </span>
          <span class="entry-arrow">›</span>
        </router-link>
        <router-link class="entry" to="/changelog">
          <span class="entry-ico">📦</span>
          <span class="entry-body">
            <span class="entry-label">更新日志</span>
            <div class="entry-desc">看看像素小镇最近又更新了什么</div>
          </span>
          <span class="entry-arrow">›</span>
        </router-link>
        <router-link class="entry" to="/admin">
          <span class="entry-ico">🛡️</span>
          <span class="entry-body">
            <span class="entry-label">维护社区稳定</span>
            <div class="entry-desc">维护者计划 · 发送正式申请书信后可加入</div>
          </span>
          <span class="entry-arrow">›</span>
        </router-link>
        <div class="row">
          <div>
            <div class="row-label">问题反馈</div>
            <div class="row-desc">微信 Tux123233 或邮箱 linsifan123233@petalmail.com</div>
          </div>
        </div>
      </section>

      <section class="group">
        <div class="group-title">赞赏支持</div>
        <div class="qr-row">
          <img src="/images/赞赏码.jpg" alt="赞赏码">
          <div class="qr-note">喜欢像素小镇？长按识别二维码 → 扫码赞赏，感谢你的支持！<br>每一格光，都由大家点亮</div>
        </div>
      </section>

      <div class="notice">
        本画板仅用于个人学习与技术交流。请勿上传、绘制、发布任何违反中华人民共和国法律法规的内容。上传者须对自己发布的内容负全部法律责任。本平台有权在不事先通知的情况下删除违规内容，并保留追究法律责任的权利。
      </div>

      <div class="copyright">© 2026 像素小镇 · 版权所有 · 作者 Lin Sifan</div>
    </div>`,
  mounted() {
      const darkSwitch = document.getElementById('darkSwitch')
      const themeBtn = document.getElementById('themeBtn')
      const entranceSwitch = document.getElementById('entranceSwitch')

      try {
        entranceSwitch.checked = localStorage.getItem('lw-entrance') === 'community'
      } catch (e) {}

      entranceSwitch.addEventListener('change', () => {
        try {
          localStorage.setItem('lw-entrance', entranceSwitch.checked ? 'community' : '')
        } catch (e) {}
      })

      function syncThemeUI() {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark'
        darkSwitch.checked = dark
        themeBtn.textContent = dark ? '☀️' : '🌙'
      }

      const glassSwitch = document.getElementById('glassSwitch')
      glassSwitch.checked = localStorage.getItem('lw-glass') !== '0'
      function applyGlass() {
        document.documentElement.classList.toggle('glass-off', !glassSwitch.checked)
      }
      glassSwitch.addEventListener('change', () => {
        try {
          localStorage.setItem('lw-glass', glassSwitch.checked ? '1' : '0')
        } catch (e) {}
        applyGlass()
        document.querySelectorAll('.bottom-nav').forEach((nav) => {
          nav.classList.remove('jelly')
          void nav.offsetWidth
          nav.classList.add('jelly')
        })
        glassSwitch.classList.remove('jelly')
        void glassSwitch.offsetWidth
        glassSwitch.classList.add('jelly')
      })
      applyGlass()

      function setTheme(dark) {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        try {
          localStorage.setItem('lw-theme', dark ? 'dark' : 'light')
        } catch (e) {}
        syncThemeUI()
      }

      darkSwitch.addEventListener('change', () => setTheme(darkSwitch.checked))
      themeBtn.addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') !== 'dark'))

      syncThemeUI()
  },
}
