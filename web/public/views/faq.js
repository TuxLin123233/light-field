// 常见问题 / 争议说明页：解释一些看起来"应该支持"但暂时没做的功能
export default {
  name: 'faq',
  title: '常见问题',
  css: `
      .faq-wrap { width: 100%; max-width: 560px; margin: 0 auto; }

      .faq-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
      .faq-head .header-text { flex: 1; min-width: 0; }
      .faq-head h1 { font-size: 20px; font-weight: 800; color: var(--text); }
      .faq-head .header-sub { font-size: 13px; color: var(--text-faint); margin-top: 4px; }

      .theme-btn {
        flex: 0 0 auto;
        width: 40px; height: 40px;
        border-radius: 50%;
        border: 2px solid var(--border);
        background: var(--surface);
        color: var(--text-muted);
        font-size: 18px; cursor: pointer; line-height: 1;
      }

      .q-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 12px;
      }

      .q-title {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 15px;
        font-weight: 800;
        color: var(--text);
        line-height: 1.5;
      }
      .q-title .q-ico { flex: 0 0 auto; }

      .q-body { margin-top: 10px; font-size: 13.5px; line-height: 1.85; color: var(--text-muted); }
      .q-body p { margin: 0 0 10px; }
      .q-body p:last-child { margin-bottom: 0; }
      .q-body b { color: var(--text); }

      .num-table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
        font-size: 13px;
      }
      .num-table th, .num-table td {
        padding: 8px 6px;
        text-align: left;
        border-bottom: 1px solid var(--border);
      }
      .num-table th { font-size: 12px; color: var(--text-faint); font-weight: 700; }
      .num-table td { color: var(--text-muted); }
      .num-table td:last-child, .num-table th:last-child { text-align: right; }
      .num-table .bad { color: #d94b3f; font-weight: 700; }
      .num-table .ok { color: #3f9c68; font-weight: 700; }

      .verdict {
        margin-top: 12px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--surface-2);
        border-left: 3px solid var(--accent);
        font-size: 13px;
        line-height: 1.8;
        color: var(--text-muted);
      }

      .faq-note { text-align: center; font-size: 12px; color: var(--text-faint); margin-top: 16px; }
  `,
  template: `
    <div class="faq-wrap">
      <div class="faq-head">
        <div class="header-text">
          <h1>常见问题</h1>
          <div class="header-sub">一些你可能想问、但我还没做的事</div>
        </div>
        <button class="theme-btn" id="themeBtn" type="button" title="切换主题">🌙</button>
      </div>

      <div class="q-card">
        <div class="q-title"><span class="q-ico">❓</span><span>联机画板去哪了？</span></div>
        <div class="q-body">
          <p>它曾经有，但已经被我下掉了，这里说明原因，免得有人找不到。</p>
          <p><b>技术上是做不到「真的同步」。</b>联机需要所有人看到同一张画布的同一瞬间，要求服务器读写强一致。Cloudflare 的 KV 是最终一致的——两个人同时落笔时，各自会读到旧快照再写回，互相覆盖。结果就是：房主看不到别人加入、笔迹不同步，明明两人在线却提示「至少需要 2 人才能开始」。这不是延迟，是会丢数据。</p>
          <p><b>要修好得换成 Durable Object。</b>那需要用命令行单独部署一次，而且我实测发现：一旦声明了这个绑定，<b>整个网站的自动部署就会失败</b>，线上会卡在旧版本。为了不让你每次更新都要冒这个风险，我选择下掉联机，而不是留一个时好时坏的功能。</p>
          <p>如果你确实需要多人一起画，用带涂鸦功能的视频会议共享屏幕会稳定得多。感谢理解。</p>
        </div>

        <div class="q-title"><span class="q-ico">❓</span><span>为什么不能做 128×128 画布？</span></div>
        <div class="q-body">
          <p>经常有人问这个，统一说明一下。技术上做得到，但代价很不划算，主要卡在两处：</p>
          <table class="num-table">
            <tr><th>尺寸</th><th>单件作品大小</th><th>结果</th></tr>
            <tr><td>16×16</td><td>3.3 KB</td><td class="ok">正常</td></tr>
            <tr><td>32×32</td><td>12.8 KB</td><td class="ok">正常</td></tr>
            <tr><td>64×64</td><td>51 KB</td><td class="ok">正常</td></tr>
            <tr><td>128×128</td><td>203.5 KB</td><td class="bad">超出上限</td></tr>
          </table>
          <p><b>第一，存不进去。</b>每件作品现在按「每格一个 [r,g,b] 数组」的格式存。128×128 是 16384 格，序列化后约 203.5 KB，而单件上限是 90 KB——上传会被直接拒绝。</p>
          <p><b>第二，存不下。</b>社区最多 5000 件。128×128 全部存满需要约 <b>994 MB</b>，正好撞上存储 1 GB 的上限。64×64 存满是 249 MB，16×16 只有 16 MB。</p>
          <p>要支持 128×128，得改成紧凑编码：调色板索引约 16.8 KB，RLE 游程编码（像素画大片同色，很吃这个优势）还能压到 2～3 KB。但即便如此，128×128 还是得单独设数量上限（比如只允许 300 件），而且手机上一次拉取这种大图会明显变慢。</p>
          <div class="verdict">
            结论：不是做不到，是<b>目前投入产出不划算</b>。像素画的主流尺寸就是 16×16 和 32×32，64×64 已经覆盖了「大幅」的需求。如果你确实需要 128×128，可以在设置里告诉我，我优先把紧凑编码做出来。
          </div>
        </div>
      </div>

      <div class="q-card">
        <div class="q-title"><span class="q-ico">❓</span><span>大画布怎么拖着看其它区域？</span></div>
        <div class="q-body">
          <p>画板工具栏里有一个 <b>✋ 手型</b>（快捷键 <b>H</b>），选中后按住拖动可以平移画布，<b>任何尺寸都能用，不会落笔</b>。它和画笔是分开的工具，互不干扰。</p>
          <p>另外 32×32 和 64×64 直接用画笔拖动也会自动变成平移（按错了不会画出奇怪的线），16×16 默认用不到平移，需要时切手型即可。</p>
        </div>
      </div>

      <div class="q-card">
        <div class="q-title"><span class="q-ico">❓</span><span>为什么设置里有一堆开关？</span></div>
        <div class="q-body">
          <p>为了让只画画的人面对一个干净的画板，题目模式、帧动画、每日挑战、本周主题、图片转像素画这些<b>默认全部关闭</b>。用不到就一直关着，需要哪个去设置里打开即可。</p>
          <p>开关只影响你这台设备，不会影响别人看到的作品。</p>
        </div>
      </div>

      <div class="q-card">
        <div class="q-title"><span class="q-ico">❓</span><span>怎么删掉自己上传错的图？</span></div>
        <div class="q-body">
          <p>每台设备有一个<b>认领码</b>，第一次上传作品时自动生成，存在你自己浏览器里。在画板的「我的绘画历史」里，属于你的作品会多出一个红色「删除」入口。</p>
          <p>认领码可以在设置页查看和复制。<b>换手机或清缓存前一定要保存</b>，丢失之后就无法再删除旧作品了。</p>
        </div>
      </div>

      <div class="faq-note">还有疑问可以微信找我：Tux123233</div>
    </div>
  `,
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
