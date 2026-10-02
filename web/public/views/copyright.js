// 版权声明与侵权投诉 /copyright
//
// 这一页的作用是**让权利人能找到你**。
//
// 「通知—删除」是平台免责的核心：接到有效通知后及时删除，就能停在
// 「不知道也不应当知道」的位置上。但如果权利人找不到通知入口，
// 他下一步就是直接发律师函 —— 那就被动了。
//
// 所以这一页要写清三件事：
//   1. 平台是什么性质（存储空间服务，不事先审查）
//   2. 投诉要提供什么（缺了没法核实）
//   3. 你多久处理（给一个明确承诺）

export default {
  name: 'Copyright',
  title: '版权声明与侵权投诉 · 像素小镇',

  css: `
    .page { padding: 20px 16px 40px; }
    .page h1 { font-size: 21px; font-weight: 900; margin: 0 0 6px; color: var(--text); }
    .page .lead { font-size: 13px; color: var(--text-faint); line-height: 1.7; margin-bottom: 20px; }

    .cp-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 16px; margin-bottom: 14px;
    }
    .cp-card h2 {
      font-size: 15px; font-weight: 800; margin: 0 0 10px; color: var(--text);
      display: flex; align-items: center; gap: 7px;
    }
    .cp-card p, .cp-card li {
      font-size: 13.5px; line-height: 1.85; color: var(--text-muted); margin: 0;
    }
    .cp-card p + p { margin-top: 9px; }
    .cp-card ul, .cp-card ol { margin: 8px 0 0; padding-left: 20px; }
    .cp-card li { margin-bottom: 6px; }
    .cp-card b { color: var(--text); font-weight: 700; }
    .cp-card .warn { color: #c0392b; font-weight: 700; }

    .cp-contact {
      background: var(--surface-2); border: 1px dashed var(--border-input);
      border-radius: 12px; padding: 14px; margin-top: 10px;
      font-size: 13.5px; line-height: 2; color: var(--text);
    }
    .cp-contact b { display: inline-block; min-width: 76px; color: var(--text-faint); font-weight: 400; }

    .cp-back {
      display: block; text-align: center; margin-top: 22px;
      font-size: 14px; color: var(--accent); text-decoration: none; font-weight: 700;
    }
  `,

  template: `
    <div class="page">
      <h1>版权声明与侵权投诉</h1>
      <div class="lead">最后更新：2026 年 · 如你是权利人，请先看第 3 节</div>

      <div class="cp-card">
        <h2>① 平台是什么</h2>
        <p>
          像素小镇是<b>信息存储空间服务</b>的提供者。我们只提供像素画创作、存储与展示的技术功能，
          <b>不预先审查</b>用户上传的内容，也<b>不对用户上传的内容主张任何著作权</b>。
        </p>
        <p>
          站内作品的著作权归<b>各自的上传者</b>所有。用户勾选发布即表示其承诺该内容为原创或已获授权。
        </p>
        <p>
          平台已部署<b>关键词过滤、人工审核、用户举报</b>三项机制，
          并在接到有效通知后及时处理。
        </p>
      </div>

      <div class="cp-card">
        <h2>② 用户不得上传的内容</h2>
        <ul>
          <li>他人享有著作权的图片、照片、画作、商标、角色形象（<b>转成像素画后上传同样侵权</b>）；</li>
          <li>临摹、描摹他人作品后作为自己的作品发布；</li>
          <li>含他人肖像、隐私信息的内容（未获同意）；</li>
          <li>色情、暴力、恐怖、赌博、涉政敏感、诈骗、违法交易与站外引流等内容。</li>
        </ul>
        <p class="warn" style="margin-top:10px">
          特别提示：使用「像素相机」把照片转成像素画，<b>不改变作品的著作权归属</b>。
          请只处理你拥有版权的照片。
        </p>
      </div>

      <div class="cp-card">
        <h2>③ 侵权投诉怎么提</h2>
        <p>请通过下方联系方式提交通知，并在通知中包含以下四项。材料不齐我们无法核实，可能会延误处理：</p>
        <ol>
          <li><b>你的身份</b>：姓名 / 名称、联系方式。若代理他人，请附授权证明。</li>
          <li><b>被投诉内容的位置</b>：具体作品名、作者名，或页面链接（越具体越好）。</li>
          <li><b>权属证明</b>：能证明你享有权利的材料（原始文件、发布时间、登记证书等）。</li>
          <li><b>你的诉求</b>：删除、断开链接，或其他具体要求。</li>
        </ol>
        <p style="margin-top:10px">
          另请声明：你<b>善意地</b>认为该使用未经授权，且通知内容真实。
          恶意投诉、虚假投诉需自行承担相应责任。
        </p>
        <div class="cp-contact">
          <div><b>邮箱</b>linsifan123233@petalmail.com</div>
          <div><b>微信</b>Tux123233</div>
          <div><b>处理时限</b>核实后 <b>48 小时内</b>删除或断开链接</div>
        </div>
      </div>

      <div class="cp-card">
        <h2>④ 我们收到通知后会做什么</h2>
        <ol>
          <li>核实你的材料和被投诉内容；</li>
          <li>确认侵权的，<b>立即删除</b>或断开链接，并<b>保留处理记录</b>；</li>
          <li>情节严重或反复侵权的上传者，<b>封禁账号</b>；</li>
          <li>如内容不构成侵权，会向你说明理由；如涉及双方争议，会同时通知上传者。</li>
        </ol>
        <p style="margin-top:10px">
          如果你是被投诉的上传者，可以提交<b>反通知</b>（说明你有合法授权或属于合理使用），
          我们会一并核实。
        </p>
      </div>

      <div class="cp-card">
        <h2>⑤ 关于自愿赠与</h2>
        <p>
          设置页的「请作者喝杯咖啡」是读者对作者<b>个人</b>的自愿赠与，
          仅用于贴补服务器与域名开销。
        </p>
        <p>
          <b>它与站内任何作品、任何功能都没有对价关系</b>，赠与者不会因此获得任何特权、授权或优先权；
          不赠与也完全不影响使用。
        </p>
      </div>

      <div class="cp-card">
        <h2>⑥ 免责说明</h2>
        <p>
          平台已采取合理措施管理站内内容。对用户自行上传的内容，
          平台不承担事先审查义务；在收到有效通知后及时处理的，依法不承担赔偿责任。
        </p>
        <p>
          因用户上传内容侵犯他人合法权益所产生的法律责任，由<b>上传者</b>承担。
        </p>
      </div>

      <router-link class="cp-back" to="/paint">← 返回画板</router-link>
    </div>
  `,

  mounted() {},
}
