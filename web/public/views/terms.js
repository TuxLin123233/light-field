// 由 terms.html 自动转换为 Vue 3 视图（无构建）
export default {
  name: 'terms',
  title: '用户协议',
  css: `      /* hidden 属性兜底：避免类选择器里的 display 覆盖 UA 的 [hidden]{display:none} */
      [hidden] { display: none !important; }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        background: linear-gradient(160deg, var(--bg));
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        display: flex;
        justify-content: center;
        padding: 32px 16px 48px;
        color: var(--text);
      }

      .page {
        width: 100%;
        max-width: 460px;
        background: var(--surface);
        border-radius: 20px;
        box-shadow: 0 8px 24px rgba(80, 60, 40, 0.12);
        padding: 24px 22px;
        align-self: flex-start;
      }

      h1 {
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 18px;
        letter-spacing: 1px;
        text-align: center;
      }

      ol {
        margin: 0;
        padding-left: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      li {
        font-size: 14px;
        line-height: 1.8;
      }

      .notice {
        margin-top: 20px;
        font-size: 13px;
        color: var(--text-muted);
        text-align: center;
        line-height: 1.7;
      }

      .back {
        display: block;
        margin: 22px auto 0;
        text-align: center;
        text-decoration: none;
        color: var(--surface);
        background: var(--accent);
        border-radius: 999px;
        padding: 12px 28px;
        font-size: 15px;
        font-weight: 600;
      }

      .copyright {
        margin-top: 18px;
        text-align: center;
        font-size: 12px;
        color: var(--text-faint);
      }`,
  template: `<div class="page">
      <h1>用户协议</h1>
      <ol>
        <li>本平台提供像素画创作与展示功能，用户须对自己上传的内容负责。平台在接到举报或发现违规内容后会<b>立即删除</b>，并保留向有关部门报告的权利。</li>
        <li>用户承诺不利用本平台制作、复制、发布、传播任何违反法律法规的信息。</li>
        <li>用户上传的内容由用户自行负责，因内容引发的法律纠纷由上传者承担全部责任。</li>
        <li>本平台在接到举报或发现违规内容后，有权立即删除，并保留向有关部门报告的权利。</li>
        <li>继续使用本平台，即视为您已阅读并同意本协议。</li>
      </ol>
      <div class="notice">
        发现违规内容？请联系微信 Tux123233 或邮箱 linsifan123233@petalmail.com 举报。<br>
        欢迎您使用像素小镇，使用前请阅读并同意以上协议。
      </div>
      <router-link class="back" to="/paint">返回画板</router-link>
      <div class="copyright">© 2026 像素小镇 · 版权所有 · 作者 Lin Sifan</div>
    </div>`,
  mounted() {

  },
}
