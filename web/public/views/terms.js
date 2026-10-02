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

      .page ol ul {
        margin: 8px 0 0;
        padding-left: 20px;
        list-style: disc;
      }
      .page ol ul li {
        margin-bottom: 6px;
        font-size: 13px;
      }
      .page ol > li { margin-bottom: 14px; }

      .copyright {
        margin-top: 18px;
        text-align: center;
        font-size: 12px;
        color: var(--text-faint);
      }`,
  template: `<div class="page">
      <h1>用户协议</h1>
      <ol>
        <li>
          <b>服务性质。</b>本平台是<b>信息存储空间服务</b>的提供者，仅为用户提供像素画的创作、存储与展示的技术功能。
          平台<b>不预先审查</b>用户上传的内容，也<b>不因用户上传而主张任何权利</b>；相关内容由上传者自行提供并负责。
        </li>
        <li>
          <b>禁止上传他人作品。</b>用户承诺只上传<b>自己原创</b>或<b>已获得合法授权</b>的内容。
          以下行为明确禁止：
          <ul>
            <li>把他人享有著作权的图片、照片、画作、商标、角色形象转成像素画后上传（包括使用「像素相机」处理他人照片）；</li>
            <li>临摹、描摹他人作品并作为自己的作品发布；</li>
            <li>上传含有他人肖像、隐私信息的内容而未获同意；</li>
            <li>未经授权使用他人作品用于商业用途。</li>
          </ul>
          因上传内容侵犯他人合法权益的，<b>由上传者承担全部责任</b>；平台因此遭受损失的，有权向上传者追偿。
        </li>
        <li>
          <b>违法信息。</b>用户承诺不利用本平台制作、复制、发布、传播任何违反法律法规的信息，
          包括但不限于色情、暴力、恐怖、赌博、涉政敏感、诈骗、违法交易与站外引流等内容。
          平台已部署关键词过滤、人工审核与用户举报机制。
        </li>
        <li>
          <b>通知与删除。</b>权利人认为站内内容侵犯其合法权益的，可通过下方联系方式提交通知（附权属证明与具体链接）。
          平台在核实后会<b>及时删除或断开链接</b>，并保留操作记录。
          平台在接到举报或发现违规内容后，亦有权立即删除，并保留向有关部门报告的权利。
        </li>
        <li>
          <b>责任承担。</b>用户上传的内容由用户自行负责，因内容引发的法律纠纷由上传者承担全部责任。
          平台已依法采取合理措施，对用户自行上传的内容不承担事先审查义务。
        </li>
        <li>
          <b>自愿赠与。</b>站内的「请作者喝杯咖啡」是读者对作者个人的<b>自愿赠与</b>，
          仅用于贴补服务器与域名开销，<b>与站内任何作品、任何功能均无对价关系</b>，
          赠与者不会因此获得任何特权、授权或优先权。不赠与不影响任何功能的正常使用。
        </li>
        <li>继续使用本平台，即视为您已阅读并同意本协议。</li>
      </ol>
      <div class="notice">
        <b>侵权投诉 / 违规举报</b><br>
        邮箱：linsifan123233@petalmail.com　微信：Tux123233<br>
        请在来信中写明：① 权利人或举报人身份；② 涉及的具体作品链接或作者名；
        ③ 权属证明（投诉侵权时）；④ 你的诉求。<br>
        平台会在核实后及时处理，通常不超过 48 小时。
      </div>
      <div class="notice">
        更完整的版权说明与投诉流程，见
        <router-link to="/copyright">版权声明与侵权投诉</router-link>。
      </div>
      <router-link class="back" to="/paint">返回画板</router-link>
      <div class="copyright">© 2026 像素小镇 · 版权所有 · 作者 Lin Sifan</div>
    </div>`,
  mounted() {

  },
}
