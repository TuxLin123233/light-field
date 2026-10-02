// 好友与聊天（/chat）
//
// 这里是「非实时」最直白的地方：没有任何轮询、没有推送、没有在线状态。
// 对方发的新消息，你要自己点右上角的「刷新」才拉得到。
// 页面底部会显示对方最后一条消息的时间，如果比自己这边的旧，就提示
// 「可能有新消息，点刷新看看」。
//
// 会话列表在 /chat?to=<uid> 指定聊天对象时隐藏「返回列表」以外的复杂度，
// 好友列表从 /api/chat?type=list 拿。
export default {
  name: 'chat',
  title: '好友',
  css: `
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
        --accent: #5b8def;
        --ok: #4caf7d;
      }
      .ch-wrap { max-width: 460px; margin: 0 auto; padding: 14px 16px 96px; }
      /* ---------- 对话模式：整屏 flex，消息滚动、输入框钉在底部 ----------
         必须用 fixed 脱离文档流：body 上有 padding: 16px 16px 112px（给底部
         导航留位），普通流里的元素会从 y=16 开始、高度再取一整屏，底部就正好
         溢出 16px —— 表现是「输入框跑到屏幕外，只看到一半」，同时 body 总高
         超过视口，手指一滑滚动的是整页而不是消息区（「滑不动」）。
         fixed 之后相对视口定位，完全不受 body 内边距影响。
         高度优先用 dvh（会随键盘收缩），JS 里再用 visualViewport 兜一层。 */
      .ch-wrap.thread {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        height: 100vh;
        height: 100dvh;
        max-width: 460px;
        margin: 0 auto;
        padding: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      /* fixed 之后顶部会贴到视口最上沿，得让开刘海/状态栏 */
      .ch-wrap.thread .ch-bar {
        padding: calc(14px + env(safe-area-inset-top, 0px)) 16px 0;
        flex: none;
      }
      .ch-wrap.thread .ch-note { margin: 8px 16px 0; flex: none; }
      .ch-wrap.thread #chBody {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 0 16px;
      }
      .ch-wrap.thread .ch-empty {
        flex: 1 1 auto;
        display: flex; flex-direction: column; justify-content: center;
      }
      /* 消息区用负 margin 撑到整屏宽：手指落在最左/最右也能滑，
         不是只有中间那条能滑。内边距再补回来，视觉不变。 */
      .ch-wrap.thread .ch-msgs {
        flex: 1 1 auto;
        min-height: 0;
        margin-left: -16px;
        margin-right: -16px;
        padding-left: 16px;
        padding-right: 16px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
      .ch-wrap.thread .ch-del { flex: none; }
      .ch-wrap.thread .ch-sendbar {
        flex: none;
        padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      }
      .ch-bar { display: flex; align-items: center; margin-bottom: 4px; }
      .ch-bar > * + * { margin-left: 10px; }
      .ch-back {
        display: inline-flex; align-items: center;
        border: 1px solid var(--border-strong); background: var(--surface-2);
        color: var(--text-muted); border-radius: 999px; padding: 6px 13px;
        font-size: 12px; font-weight: 700; text-decoration: none; flex: none;
      }
      /* 顶栏的图标按钮（清空对话）。挪到顶栏是因为：原来它贴在发送框正上方，
         手指够发送键时很容易点到它，而它是个不可恢复的破坏性操作。 */
      .ch-icon-btn {
        flex: none;
        width: 34px; height: 30px;
        border: 1px solid var(--border-input);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 999px;
        font-size: 14px; line-height: 1;
        cursor: pointer; font-family: inherit;
      }
      .ch-icon-btn:active { background: var(--border); }
      .ch-icon-btn[hidden] { display: none; }
      .ch-bar-main { flex: 1; min-width: 0; }
      .ch-title { font-size: 17px; font-weight: 800; color: var(--text); }
      /* 对话里的名字可以点：去对方主页看资料（性别、生日、作品墙都那儿） */
      .ch-title.link { cursor: pointer; text-decoration: underline; text-decoration-style: dotted;
        text-underline-offset: 4px; text-decoration-thickness: 1px; }
      .ch-sub { font-size: 11px; color: var(--text-faint); }
      .ch-note {
        font-size: 11px; color: var(--text-faint); background: var(--surface-2);
        border-radius: 10px; padding: 7px 10px; margin: 10px 0 4px; line-height: 1.7;
      }
      .ch-note b { color: var(--text-muted); }

      .ch-list { display: flex; flex-direction: column; margin-top: 10px; }
      .ch-list > * + * { margin-top: 8px; }
      /* 不用 flex 的 gap：微信 X5 内核不支持，间距会整个塌成 0，
         所以头像和文字之间一律靠 margin 撑开。 */
      .ch-row {
        display: flex; align-items: center; text-decoration: none;
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 13px; padding: 10px 12px; color: inherit;
      }
      .ch-av {
        position: relative;
        width: 42px; height: 42px; flex: 0 0 42px; border-radius: 12px; overflow: hidden;
        background: var(--surface-2); border: 1px solid var(--border-strong);
        margin-right: 11px;   /* ← 头像和「名字 + 最新消息」之间的间距，之前漏了 */
      }
      .ch-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .ch-main { flex: 1; min-width: 0; }
      .ch-name {
        font-size: 14px; font-weight: 700; color: var(--text);
        display: block; line-height: 1.35;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-last {
        font-size: 12px; color: var(--text-faint); display: block;
        margin-top: 3px; line-height: 1.45;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-last.mine { color: var(--text-muted); }
      /* 右侧一列：时间在上，未读在下 */
      .ch-side {
        flex: none; margin-left: 9px; min-height: 42px;
        display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
      }
      .ch-time { font-size: 10px; color: var(--text-faint); white-space: nowrap; }
      /* 未读：红点 + 条数。1 条时是一个小圆点，多了才显示数字 */
      .ch-unread {
        margin-top: 5px;
        min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box;
        border-radius: 999px; background: #e5574b; color: #fff;
        font-size: 11px; font-weight: 800; line-height: 18px; text-align: center;
      }
      .ch-unread.dot { min-width: 10px; width: 10px; height: 10px; padding: 0; }

      /* ---------- 加好友 ---------- */
      .ch-find { margin-top: 10px; }
      .ch-find-btn {
        display: block; width: 100%;
        border: 1px dashed var(--border-strong); background: var(--surface);
        color: var(--accent); border-radius: 13px; padding: 11px;
        font-size: 13px; font-weight: 800; font-family: inherit; cursor: pointer;
      }
      .ch-find-btn.on {
        border-style: solid; background: var(--surface-2); color: var(--text-muted);
      }
      .ch-find-panel { margin-top: 8px; }
      .ch-panel {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 13px; padding: 12px;
      }
      .ch-panel h4 { margin: 0 0 6px; font-size: 13px; font-weight: 800; color: var(--text); }
      .ch-panel h4.ch-find-h2 { margin-top: 14px; }
      .ch-panel-n { color: var(--accent); }
      .ch-find-empty { font-size: 12px; color: var(--text-faint); padding: 8px 2px; line-height: 1.7; }
      .ch-friend-row { display: flex; align-items: center; padding: 8px 0; }
      .ch-friend-row + .ch-friend-row { border-top: 1px solid var(--border); }
      .ch-friend-row .ch-av { width: 36px; height: 36px; flex: 0 0 36px; margin-right: 9px; }
      .ch-friend-main { flex: 1; min-width: 0; }
      .ch-friend-name {
        font-size: 13px; font-weight: 700; color: var(--text); display: block;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-friend-bio {
        font-size: 11px; color: var(--text-faint); display: block; margin-top: 2px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-friend-act {
        flex: none; margin-left: 8px;
        border: 0; border-radius: 999px; padding: 7px 13px;
        background: var(--accent); color: #fff;
        font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
      }
      .ch-friend-act[disabled] { opacity: 0.6; cursor: default; }
      .ch-search { display: flex; margin-top: 2px; }
      .ch-search input {
        flex: 1; min-width: 0;
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text); border-radius: 10px; padding: 9px 11px;
        font-size: 13px; font-family: inherit;
      }
      .ch-search > * + * { margin-left: 7px; }
      .ch-search button {
        flex: none; border: 0; border-radius: 10px; padding: 0 14px;
        background: var(--accent); color: #fff;
        font-size: 13px; font-weight: 800; font-family: inherit; cursor: pointer;
      }


      /* 这里用子元素 margin 而不是 flex 的 gap。
         flex 的 gap 要 Chrome 84 才支持，个别手机上的浏览器（微信里的 X5 内核）
         不支持就会让间距整个塌成 0。margin 没有这个兼容问题，两边都稳妥。 */
      /* 对话气泡 */
      .ch-msgs {
        display: flex; flex-direction: column;
        margin: 12px 0; min-height: 90px;
        max-width: 100%; min-width: 0;
      }
      .ch-msgs > * + * { margin-top: 9px; }
      /* min-width: 0 不能省：flex 子项默认 min-width:auto，
         不许缩到比内容还窄，里面再窄的容器也拦不住。
         overflow-wrap:anywhere 比 word-break:break-word 兼容性好 ——
         后者在老 Safari / WebView 上不被支持，会退化成 normal，
         一条长网址就能把气泡顶出屏幕（用户反馈「消息框溢出到右边」）。 */
      /* 「对方正在输入」：跟在消息列表末尾，不占固定高度 */
      .ch-typing {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px 2px;
        animation: lwa-fade .22s ease-out both;
      }
      .ch-typing-t {
        font-size: 11.5px;
        color: var(--text-faint);
      }

      .ch-msg {
        display: flex; align-items: flex-start; max-width: 88%; min-width: 0;
        animation: chIn 0.18s ease-out;
      }
      @keyframes chIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) { .ch-msg { animation: none; } }
      .ch-msg.mine { align-self: flex-end; flex-direction: row-reverse; }
      .ch-msg-av {
        width: 28px; height: 28px; flex: 0 0 28px; border-radius: 9px; overflow: hidden;
        background: var(--surface-2); border: 1px solid var(--border-strong);
        margin-right: 7px; margin-top: 2px;
      }
      .ch-msg-av canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
      .ch-bubble-col { min-width: 0; display: flex; flex-direction: column; }
      .ch-msg.mine .ch-bubble-col { align-items: flex-end; }
      .ch-bubble {
        padding: 9px 13px; border-radius: 16px; font-size: 13.5px; line-height: 1.65;
        max-width: 100%; min-width: 0;
        overflow-wrap: anywhere; word-break: break-word; white-space: pre-wrap;
        background: var(--surface); border: 1px solid var(--border); color: var(--text);
        box-shadow: 0 1px 2px rgba(80, 60, 40, 0.06);
      }
      .ch-msg.mine .ch-bubble {
        background: var(--accent); color: #fff; border-color: var(--accent);
        border-bottom-right-radius: 5px;
      }
      .ch-msg:not(.mine) .ch-bubble { border-bottom-left-radius: 5px; }
      .ch-mtime { font-size: 10px; color: var(--text-faint); margin-top: 4px; padding: 0 3px; }
      .ch-msg.mine .ch-mtime { text-align: right; }
      /* 跨天时插一条日期分隔 */
      .ch-day {
        align-self: center; font-size: 10.5px; color: var(--text-faint);
        background: var(--surface-2); border-radius: 999px; padding: 3px 11px;
        margin: 4px 0 2px;
      }
      .ch-new {
        align-self: center; font-size: 11px; color: var(--accent);
        background: color-mix(in srgb, var(--accent) 12%, var(--surface));
        border-radius: 999px; padding: 4px 11px; font-weight: 700;
      }
      .ch-sendbar { display: flex; margin-top: 10px; min-width: 0; position: relative; }
      .ch-in {
        /* min-width: 0 必须写：<input> 有 size 属性带来的固有宽度，
           作为 flex 子项默认 min-width:auto 缩不下去，窄屏会把「发送」挤出屏幕。 */
        flex: 1 1 auto; min-width: 0;
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text); border-radius: 12px; padding: 10px 12px;
        font-size: 13px; font-family: inherit; line-height: 1.5;
      }
      .ch-sendbar > * + * { margin-left: 8px; }
      .ch-in:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
      .ch-send {
        flex: 0 0 auto; border: 0; border-radius: 12px; padding: 0 17px;
        font-size: 13px; font-weight: 800; font-family: inherit;
        background: var(--accent); color: #fff; cursor: pointer;
      }
      .ch-send[disabled] { background: var(--surface-2); color: var(--text-faint); cursor: default; }
      .ch-empty { font-size: 13px; color: var(--text-faint); text-align: center; padding: 30px 10px; line-height: 1.9; }
      .ch-msg-box {
        margin-top: 12px; font-size: 12px; border-radius: 10px; padding: 9px 11px;
        background: var(--surface-2); color: var(--text-muted);
      }
      .ch-msg-box.bad { background: #fdecea; color: #c0392b; }
      .ch-del { margin-left: auto; font-size: 11px; }

      /* ---------- 表情面板 ---------- */
      .ch-emoji-btn {
        flex: 0 0 auto; width: 42px;
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text); border-radius: 12px; font-size: 18px; line-height: 1;
        cursor: pointer; font-family: inherit;
      }
      .ch-emoji-btn.on {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 14%, var(--surface));
      }
      .ch-emoji {
        position: absolute; left: 0; right: 0; bottom: calc(100% + 8px);
        background: var(--surface); border: 1px solid var(--border-strong);
        border-radius: 14px; box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
        padding: 8px; z-index: 30;
      }
      .ch-emoji[hidden] { display: none; }
      .ch-emoji-tabs { display: flex; margin-bottom: 6px; }
      .ch-emoji-tabs button {
        flex: 1; border: 0; background: transparent; color: var(--text-muted);
        font-size: 12px; font-weight: 700; font-family: inherit;
        padding: 5px 0; border-radius: 8px; cursor: pointer;
      }
      .ch-emoji-tabs button.on { background: var(--surface-2); color: var(--text); }
      .ch-emoji-grid {
        display: grid; grid-template-columns: repeat(8, 1fr);
        max-height: 170px; overflow-y: auto; -webkit-overflow-scrolling: touch;
      }
      .ch-emoji-grid button {
        border: 0; background: transparent; font-size: 20px; line-height: 1;
        padding: 6px 0; border-radius: 8px; cursor: pointer;
      }
      .ch-emoji-grid button:active { background: var(--surface-2); }

      /* ---------- 更多功能 ---------- */
      .ch-plus-btn {
        flex: none; width: 36px; height: 36px; border-radius: 50%;
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text-muted); font-size: 19px; line-height: 1;
        font-family: inherit; cursor: pointer;
      }
      .ch-plus-btn.on { background: var(--accent); border-color: var(--accent); color: #fff; }
      .ch-plus {
        position: absolute; left: 0; right: 0; bottom: 46px;
        background: var(--surface); border: 1px solid var(--border-strong);
        border-radius: 14px; padding: 10px; z-index: 6;
        box-shadow: 0 8px 26px rgba(0,0,0,.16);
      }
      .ch-plus[hidden] { display: none; }
      .ch-plus-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .ch-plus-i {
        border: 1px solid var(--border-input); background: var(--surface-2);
        border-radius: 12px; padding: 9px 4px; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; font-family: inherit;
      }
      .ch-plus-i span:first-child { font-size: 20px; line-height: 1.3; }
      .ch-plus-i span:last-child { font-size: 10px; color: var(--text-muted); margin-top: 3px; }
      .ch-plus-i.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, var(--surface)); }
      .ch-pane { margin-top: 10px; }
      .ch-pane[hidden] { display: none; }
      .ch-pane-h { font-size: 12px; font-weight: 800; color: var(--text); margin-bottom: 7px; }
      .ch-chips { display: flex; flex-wrap: wrap; }
      .ch-chip {
        border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text-muted); border-radius: 999px; padding: 6px 13px;
        font-size: 12px; font-weight: 700; font-family: inherit;
        cursor: pointer; margin: 0 6px 6px 0;
      }
      .ch-chip.on { background: var(--accent); border-color: var(--accent); color: #fff; }
      .ch-pane-act { display: flex; margin-top: 8px; }
      .ch-pane-act > * + * { margin-left: 8px; }
      .ch-go {
        flex: 1; border: 0; border-radius: 10px; padding: 10px;
        background: var(--accent); color: #fff; font-size: 13px;
        font-weight: 800; font-family: inherit; cursor: pointer;
      }
      .ch-go[disabled] { opacity: .5; cursor: default; }
      .ch-go.ghost { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border-input); flex: none; padding: 10px 15px; }
      .ch-pane-tip { font-size: 11px; color: var(--text-faint); line-height: 1.7; margin-top: 6px; }
      /* 涂鸦板 */
      .ch-pad { display: flex; }
      .ch-pad canvas {
        width: 168px; height: 168px; flex: none; image-rendering: pixelated;
        border: 1px solid var(--border-strong); border-radius: 10px;
        background: #fff; touch-action: none; cursor: crosshair;
      }
      .ch-pad-colors { flex: 1; min-width: 0; margin-left: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; align-content: start; }
      .ch-pad-c { width: 100%; aspect-ratio: 1; border-radius: 7px; border: 1px solid var(--border-input); cursor: pointer; }
      .ch-pad-c.on { outline: 2px solid var(--accent); outline-offset: 1px; }
      /* 画作选择 */
      .ch-works { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; max-height: 190px; overflow-y: auto; }
      .ch-works button {
        border: 1px solid var(--border-input); background: var(--surface-2);
        border-radius: 9px; padding: 4px; cursor: pointer; font-family: inherit;
      }
      .ch-works button.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, var(--surface)); }
      .ch-works canvas { width: 100%; aspect-ratio: 1; image-rendering: pixelated; display: block; border-radius: 5px; background: var(--surface); }
      .ch-works span { display: block; font-size: 9px; color: var(--text-muted); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      /* ---------- 气泡里的各种消息 ---------- */
      .ch-gift {
        display: flex; align-items: center; padding: 4px 2px;
      }
      .ch-gift-ico { font-size: 26px; margin-right: 8px; }
      .ch-gift-amt { font-size: 17px; font-weight: 800; color: #b8860b; }
      .ch-gift-note { font-size: 12px; opacity: .82; margin-top: 5px; }
      .ch-doodle {
        width: 128px; height: 128px; image-rendering: pixelated;
        border-radius: 8px; display: block; background: #fff;
      }
      .ch-work {
        display: block; width: 128px; cursor: pointer;
        border-radius: 8px; overflow: hidden; background: var(--surface-2);
      }
      .ch-work canvas { width: 128px; height: 128px; image-rendering: pixelated; display: block; background: #fff; }
      .ch-work-n { font-size: 10px; padding: 4px 6px; color: var(--text-muted); background: var(--surface-2); }
      .ch-rps { font-size: 12px; line-height: 1.7; }
      .ch-rps-h { font-weight: 800; margin-bottom: 6px; }
      .ch-rps-btns { display: flex; }
      .ch-rps-b {
        flex: 1; border: 1px solid var(--border-input); background: var(--surface-2);
        color: var(--text); border-radius: 9px; padding: 8px 0; font-size: 17px;
        font-family: inherit; cursor: pointer;
      }
      .ch-rps-b + .ch-rps-b { margin-left: 6px; }
      .ch-rps-row { display: flex; align-items: center; font-size: 15px; }
      .ch-rps-row span { font-size: 17px; }
      .ch-rps-row b { font-size: 10px; color: var(--text-faint); margin: 0 8px; }
      .ch-rps-res { font-size: 12px; font-weight: 800; margin-top: 5px; }
      .ch-rps-res.win { color: #2e8b57; }
      .ch-rps-res.lose { color: #c0392b; }
      /* 引用 */
      .ch-quote {
        border-left: 3px solid var(--border-strong); padding: 3px 8px;
        margin-bottom: 6px; font-size: 11px; color: var(--text-faint);
        background: rgba(0,0,0,.03); border-radius: 0 6px 6px 0;
        max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      /* 表情回应 */
      .ch-reacts { display: flex; flex-wrap: wrap; margin-top: 4px; }
      .ch-react {
        border: 1px solid var(--border); background: var(--surface);
        border-radius: 999px; padding: 1px 7px; font-size: 12px;
        font-family: inherit; cursor: pointer; margin: 0 4px 3px 0; line-height: 1.7;
      }
      .ch-react.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 16%, var(--surface)); }
      /* 引用 / 回应 的操作条 */
      .ch-msgacts {
        display: flex; margin-top: 4px;
      }
      .ch-msgacts button {
        border: 1px solid var(--border-input); background: var(--surface);
        border-radius: 999px; padding: 2px 9px; font-size: 11px;
        color: var(--text-muted); font-family: inherit; cursor: pointer;
        margin-right: 5px;
      }
      .ch-msgacts button.on { border-color: var(--accent); color: var(--accent); }
      .ch-replybar {
        display: flex; align-items: center; margin-bottom: 6px;
        background: var(--surface-2); border-radius: 9px; padding: 6px 9px;
        font-size: 11px; color: var(--text-muted);
      }
      .ch-replybar b { color: var(--text); font-weight: 700; margin-right: 6px; }
      .ch-replybar span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ch-replybar button {
        flex: none; border: 0; background: transparent; color: var(--text-faint);
        font-size: 14px; cursor: pointer; padding: 0 0 0 8px; font-family: inherit;
      }
    `,
  template: `
    <div class="ch-wrap">
      <div class="ch-bar">
        <a class="ch-back" id="chBack" href="/mine">← 我的</a>
        <div class="ch-bar-main">
          <div class="ch-title" id="chTitle">💬 好友</div>
          <div class="ch-sub" id="chSub"></div>
        </div>
        <button class="ch-icon-btn" id="chDel" type="button" hidden
                aria-label="清空这段对话" title="清空这段对话">🗑️</button>
        <button class="lw-refresh" id="chRefresh" type="button" data-label="刷新"></button>
      </div>
      <div class="ch-note" id="chNote" hidden></div>
      <div id="chBody"><div class="ch-empty"><span class="lw-load"></span>正在读取…</div></div>
      <div class="ch-msg-box" id="chMsg" hidden></div>
    </div>
  `,
  mounted() {
    const $ = (id) => document.getElementById(id)
    const esc = (s) =>
      String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
    const token = () => {
      try {
        return localStorage.getItem('lw-token') || ''
      } catch (e) {
        return ''
      }
    }
    const C = window.LWCache || {}
    const q = new URLSearchParams(location.search)
    const wantUid = (q.get('to') || '').trim()
    /* 一进对话就先切成整屏布局，否则要等数据回来才「跳」一下。
       setThreadMode 是函数声明，会被提升，所以这里能提前调。 */
    if (wantUid) setThreadMode(true)

    // 记住自己这边最后一条的时间，用来判断「对方是不是有新消息」
    let myLastAt = 0
    let peerLastAt = 0
    let peerName = ''
    let peerUid = ''
    let hasNew = false

    const fmt = (t) => {
      const d = Date.now() - (Number(t) || 0)
      if (d < 60000) return '刚刚'
      if (d < 3600000) return Math.floor(d / 60000) + ' 分钟前'
      if (d < 86400000) return Math.floor(d / 3600000) + ' 小时前'
      if (d < 86400000 * 7) return Math.floor(d / 86400000) + ' 天前'
      return new Date(Number(t)).toLocaleDateString('zh-CN')
    }
    const clock = (t) => {
      const d = new Date(Number(t) || 0)
      const p = (n) => String(n).padStart(2, '0')
      return p(d.getHours()) + ':' + p(d.getMinutes())
    }
    const dayOf = (t) => {
      const d = new Date(Number(t) || 0)
      return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
    }
    const dayLabel = (t) => {
      const d = new Date(Number(t) || 0)
      const now = new Date()
      const same = (a, b) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
      if (same(d, now)) return '今天'
      if (same(d, new Date(now.getTime() - 86400000))) return '昨天'
      return d.getMonth() + 1 + ' 月 ' + d.getDate() + ' 日'
    }

    /* ---------- 表情 ----------
       按分组列出来，点一下插到输入框的光标处，可以连着点好几个。 */
    /* 涂鸦板的颜色。像素画用不到太多色，16 个够挑 */
    const PAD_COLORS = [
      [40, 40, 40], [255, 255, 255], [198, 74, 74], [226, 138, 74],
      [232, 186, 78], [86, 160, 74], [120, 200, 200], [122, 168, 214],
      [150, 120, 200], [232, 150, 190], [124, 82, 48], [170, 175, 180],
      [92, 102, 112], [62, 46, 36], [200, 230, 150], [236, 226, 208],
    ]

    const EMOJI_GROUPS = [
      {
        name: '常用',
        list: ['😀','😄','😂','🤣','😊','🥰','😍','😘','😜','🤔','😅','😭','😡','🥺','😴','🤗','👍','👎','👏','🙏','💪','✌️','👌','🫶','❤️','💔','✨','🔥','🎉','🌟','✅','❌'],
      },
      {
        name: '表情',
        list: ['😃','😁','😆','🙂','🙃','😉','😇','😋','😛','🤪','😝','🤭','🤫','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','😢','😤','😠','🤯','😱','😨','😰','😥','😓','🤤','😪','🥱','😷','🥳','😎','🤓','🧐','😕','😟','😔','😞','😖','😫','😩'],
      },
      {
        name: '手势',
        list: ['👋','🤚','✋','🖐️','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','🙏','🤝','💪','🦾','✍️','💅','🫡'],
      },
      {
        name: '物品',
        list: ['🎨','🖌️','🖼️','📷','📸','🎮','🎵','🎧','🎤','🏆','🥇','🎁','🎈','🎂','🍰','🍕','🍔','🍎','🍺','☕','⚽','🏀','🚀','✈️','🚗','🏠','💡','🔔','📌','📢','🔍','🔑','💎','🪙','🎯'],
      },
      {
        name: '符号',
        list: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💖','💗','💓','💞','💕','💔','❣️','💯','✨','⭐','🌟','🔥','💫','⚡','🌈','☀️','🌙','⛅','🌧️','❄️','🍀','🌸','🌺','🌻','🌹','🌵','🌊','✅','❌','❓','❗','💤','💬','👀'],
      },
    ]

    function setupEmojiPanel(tabsEl, gridEl, onPick) {
      let cur = 0
      const drawTabs = () => {
        tabsEl.innerHTML = EMOJI_GROUPS.map(
          (g, i) =>
            '<button type="button" data-g="' + i + '"' + (i === cur ? ' class="on"' : '') + '>' +
            esc(g.name) + '</button>'
        ).join('')
      }
      const drawGrid = () => {
        gridEl.innerHTML = EMOJI_GROUPS[cur].list
          .map((e) => '<button type="button" data-e="' + esc(e) + '">' + esc(e) + '</button>')
          .join('')
      }
      tabsEl.addEventListener('click', (ev) => {
        const b = ev.target.closest ? ev.target.closest('button[data-g]') : null
        if (!b) return
        cur = Number(b.getAttribute('data-g')) || 0
        drawTabs()
        drawGrid()
        if (window.sfx) window.sfx('tick')
      })
      gridEl.addEventListener('click', (ev) => {
        const b = ev.target.closest ? ev.target.closest('button[data-e]') : null
        if (!b) return
        onPick(b.getAttribute('data-e'))
      })
      drawTabs()
      drawGrid()
    }

    /* 插到光标处（而不是无脑追加到末尾），在一句话中间补表情也顺手 */
    function insertAtCursor(input, text) {
      const v = input.value
      const start = input.selectionStart == null ? v.length : input.selectionStart
      const end = input.selectionEnd == null ? v.length : input.selectionEnd
      input.value = v.slice(0, start) + text + v.slice(end)
      const pos = start + text.length
      try {
        input.setSelectionRange(pos, pos)
      } catch (e) {}
      input.dispatchEvent(new Event('input'))
      input.focus()
    }

    function showMsg(text, bad) {
      const el = $('chMsg')
      el.textContent = text || ''
      el.hidden = !text
      el.classList.toggle('bad', !!bad)
    }

    /* ---------- 对话模式的整屏适配 ----------
       键盘弹起时 visualViewport.height 会缩小，把容器高度跟着调，
       输入框才会贴在键盘上方而不是被挡住（老浏览器不认 100dvh，得靠这层）。 */
    function fitThread() {
      const wrap = document.querySelector('.ch-wrap.thread')
      if (!wrap) return
      const vv = window.visualViewport
      if (!vv || !vv.height) return // 拿不到就交给 CSS 里的 100dvh
      /* visualViewport 是「此刻真正看得见的那块区域」：键盘弹起时 height 变小、
         offsetTop 变大。容器是 fixed 定位，光改高度不够 —— 页面被顶上去多少，
         它就得跟着挪多少，否则输入框仍然留在键盘底下看不见。 */
      wrap.style.height = Math.round(vv.height) + 'px'
      wrap.style.transform = vv.offsetTop ? 'translateY(' + Math.round(vv.offsetTop) + 'px)' : ''
    }

    function setThreadMode(on) {
      const wrap = document.querySelector('.ch-wrap')
      if (!wrap) return
      wrap.classList.toggle('thread', !!on)
      /* 锁住页面本身的滚动：body 有 min-height:100vh 加下内边距，不锁的话
         手指一滑滚的是整页，消息区反而滑不动。
         app.js 的 withAutoCleanup 在离开本页时也会把 body 的 overflow 复位。 */
      document.body.style.overflow = on ? 'hidden' : ''
      if (on) {
        fitThread()
      } else {
        // 回到列表页时把内联样式清掉，否则会盖住普通流的布局
        wrap.style.height = ''
        wrap.style.transform = ''
      }
    }

    /* 返回按钮：会话列表回「我的」，对话里回会话列表
       （对话中底部导航是隐藏的，所以必须有个回来的入口）。 */
    function setBack(to, label) {
      const el = $('chBack')
      if (!el) return
      el.textContent = label
      el.setAttribute('href', to)
      el.onclick = (e) => {
        e.preventDefault()
        if (window.__lwRouter) window.__lwRouter.push(to)
        else location.href = to
      }
    }

    /* ---------- 会话列表 ---------- */
    function drawList(d) {
      setThreadMode(false)
      setBack('/mine', '← 我的')
      // 会话列表里没有「一段对话」可清，把按钮收起来
      const delBtn = $('chDel')
      if (delBtn) delBtn.hidden = true
      $('chTitle').textContent = '💬 好友'
      $('chTitle').classList.remove('link')
      $('chTitle').onclick = null
      $('chTitle').removeAttribute('title')
      $('chNote').hidden = false
      $('chNote').innerHTML =
        '这里是你的<b>好友</b>。两个人要<b>互相加好友</b>才能聊天；' +
        '聊天是<b>非实时</b>的：不轮询、不推送，对方发了新消息要自己点右上角的<b>刷新</b>。'
      const rows = d.list || []

      /* 「加好友」始终给入口：已经有好友了也可能想加新的 */
      const findBar =
        '<div class="ch-find">' +
        '<button class="ch-find-btn" id="chFindBtn" type="button">＋ 加好友</button>' +
        '<div class="ch-find-panel" id="chFindPanel" hidden></div>' +
        '</div>'

      const listHtml = rows.length
        ? '<div class="ch-list">' +
          rows
            .map((r) => {
              const last = r.last ? (r.lastMine ? '我：' + r.last : r.last) : '还没有消息'
              const n = Math.max(0, Number(r.unread) || 0)
              /* 未读提示：1 条就是一个小红点，多条才显示数字（超过 99 记 99+） */
              const badge = n
                ? '<span class="ch-unread' + (n === 1 ? ' dot' : '') + '">' +
                  (n === 1 ? '' : n > 99 ? '99+' : String(n)) +
                  '</span>'
                : ''
              return (
                '<a class="ch-row" data-to="' + esc(r.uid) + '">' +
                '<span class="ch-av" data-uid="' + esc(r.uid) + '"></span>' +
                '<span class="ch-main">' +
                '<span class="ch-name">' + esc(r.name) + '</span>' +
                '<span class="ch-last' + (r.lastMine ? ' mine' : '') + '">' + esc(last) + '</span>' +
                '</span>' +
                '<span class="ch-side">' +
                '<span class="ch-time">' + esc(r.lastAt ? fmt(r.lastAt) : '') + '</span>' +
                badge +
                '</span>' +
                '</a>'
              )
            })
            .join('') +
          '</div>'
        : '<div class="ch-empty">还没有好友。<br />点上面的「＋ 加好友」按用户名找找看，<br />' +
          '或者在社区里点作者名字，到他的主页点「＋ 加好友」。</div>'

      $('chBody').innerHTML = findBar + listHtml
      paintAvatars()
      bindFindPanel()
      $('chBody').querySelectorAll('.ch-row').forEach((a) => {
        a.addEventListener('click', () => {
          if (window.__lwRouter) window.__lwRouter.push('/chat?to=' + encodeURIComponent(a.getAttribute('data-to')))
        })
      })
    }

    /* ---------- 加好友 ----------
       规则：我关注你 = 发出好友申请；互相关注 = 成为好友。
       所以这里要做两件事：把「谁申请加你」列出来一键通过，以及按用户名主动找。 */
    let staleList = false

    function bindFindPanel() {
      const btn = $('chFindBtn')
      const panel = $('chFindPanel')
      if (!btn || !panel) return
      btn.addEventListener('click', () => {
        const willOpen = panel.hidden
        panel.hidden = !willOpen
        btn.classList.toggle('on', willOpen)
        btn.textContent = willOpen ? '收起' : '＋ 加好友'
        if (window.sfx) window.sfx(willOpen ? 'open' : 'close')
        if (willOpen) {
          if (!panel.dataset.ready) openFindPanel()
        } else if (staleList) {
          // 加过好友：收起面板时再刷新列表，这样能在面板里连着通过好几个
          staleList = false
          load(true)
        }
      })
    }

    async function openFindPanel() {
      const panel = $('chFindPanel')
      if (!panel) return
      panel.dataset.ready = '1'
      panel.innerHTML =
        '<div class="ch-panel"><div class="ch-find-empty"><span class="lw-load"></span>读取中…</div></div>'
      let pend = []
      try {
        const res = await fetch('/api/follow?type=pending', {
          headers: { Authorization: 'Bearer ' + token() },
          cache: 'no-store',
        })
        const d = await res.json().catch(() => ({}))
        pend = (d && d.list) || []
      } catch (e) {}
      renderFindPanel(pend)
    }

    function friendRow(u, label) {
      return (
        '<div class="ch-friend-row">' +
        '<span class="ch-av" data-uid="' + esc(u.uid) + '"></span>' +
        '<span class="ch-friend-main">' +
        '<span class="ch-friend-name">' + esc(u.username) + '</span>' +
        '<span class="ch-friend-bio">' + esc(u.bio || '这个人很低调，什么都没写') + '</span>' +
        '</span>' +
        '<button class="ch-friend-act" type="button" data-uid="' + esc(u.uid) + '">' +
        esc(label) +
        '</button>' +
        '</div>'
      )
    }

    function renderFindPanel(pend) {
      const panel = $('chFindPanel')
      if (!panel) return
      panel.innerHTML =
        '<div class="ch-panel">' +
        '<h4>想加你好友' + (pend.length ? ' <span class="ch-panel-n">' + pend.length + '</span>' : '') + '</h4>' +
        (pend.length
          ? pend.map((u) => friendRow(u, '通过')).join('')
          : '<div class="ch-find-empty">还没有人申请加你好友</div>') +
        '<h4 class="ch-find-h2">按用户名找好友</h4>' +
        '<div class="ch-search">' +
        '<input id="chFindName" type="text" maxlength="16" placeholder="对方的用户名" autocomplete="off">' +
        '<button id="chFindGo" type="button">查找</button>' +
        '</div>' +
        '<div id="chFindResult"></div>' +
        '</div>'
      paintAvatars()
      panel.querySelectorAll('.ch-friend-act').forEach((b) => {
        b.addEventListener('click', () => addFriend(b.getAttribute('data-uid'), b))
      })
      const go = $('chFindGo')
      const inp = $('chFindName')
      if (go && inp) {
        const run = () => findUser(inp.value.trim())
        go.addEventListener('click', run)
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            run()
          }
        })
      }
    }

    async function findUser(name) {
      const box = $('chFindResult')
      if (!box) return
      if (!name) {
        box.innerHTML = ''
        return
      }
      box.innerHTML = '<div class="ch-find-empty"><span class="lw-load"></span>查找中…</div>'
      try {
        const res = await fetch('/api/profile?name=' + encodeURIComponent(name), { cache: 'no-store' })
        const d = await res.json().catch(() => ({}))
        if (!res.ok || !d || !d.ok) {
          box.innerHTML = '<div class="ch-find-empty">没有找到「' + esc(name) + '」这个用户</div>'
          return
        }
        box.innerHTML = friendRow({ uid: d.uid, username: d.username, bio: d.bio }, '加好友')
        paintAvatars()
        const b = box.querySelector('.ch-friend-act')
        if (b) b.addEventListener('click', () => addFriend(d.uid, b))
      } catch (e) {
        box.innerHTML = '<div class="ch-find-empty">查找失败，稍后再试</div>'
      }
    }

    async function addFriend(uid, btn) {
      if (!uid || !btn || btn.disabled) return
      const t = token()
      if (!t) {
        showMsg('加好友需要先登录', true)
        return
      }
      btn.disabled = true
      const old = btn.textContent
      btn.textContent = '…'
      try {
        const res = await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'follow', uid }),
        })
        const d = await res.json().catch(() => ({}))
        if (!res.ok || !d || !d.ok) {
          btn.disabled = false
          btn.textContent = old
          showMsg((d && d.error) || '加好友失败', true)
          return
        }
        if (window.sfx) window.sfx(d.friend ? 'follow' : 'ok')
        /* 按钮就地变成结果，面板不关 —— 这样能连着通过好几个申请 */
        btn.textContent = d.friend ? '好友 ✓' : '已申请'
        staleList = true
        C.drop('chatlist')
        C.drop('chatBadge')
        try {
          window.dispatchEvent(new CustomEvent('lw-chat-changed'))
        } catch (e) {}
        showMsg(d.friend ? '你们已经是好友了 🤝 可以聊天了' : '已发出好友申请，等对方通过')
      } catch (e) {
        btn.disabled = false
        btn.textContent = old
        showMsg('加好友失败：网络错误', true)
      }
    }

    /* 会话列表头像是 42px，消息气泡旁的是 28px */
    const avSize = (el) => (el.classList.contains('ch-msg-av') ? 28 : 42)

    function paintAvatars() {
      const boxes = document.querySelectorAll('.ch-av[data-uid], .ch-msg-av[data-uid]')
      if (!window.LWAvatar) return
      const uids = []
      boxes.forEach((el) => {
        const uid = el.getAttribute('data-uid')
        if (!uid) return
        const c = document.createElement('canvas')
        el.appendChild(c)
        window.LWAvatar.draw(c, uid, avSize(el))
        uids.push(uid)
      })
      if (uids.length && window.LWAvatar.load) {
        window.LWAvatar
          .load(uids)
          .then(() => {
            boxes.forEach((el) => {
              const c = el.querySelector('canvas')
              if (c) window.LWAvatar.draw(c, el.getAttribute('data-uid'), avSize(el))
            })
          })
          .catch(() => {})
      }
    }

    /* ---------- 对话 ---------- */
    function drawThread(d) {
      setThreadMode(true)
      setBack('/chat', '← 消息')
      peerName = (d.with && d.with.name) || ''
      peerUid = (d.with && d.with.uid) || ''
      // 清空按钮只在对话里出现（它在顶栏，监听是一次性绑好的）
      const delBtn = $('chDel')
      if (delBtn) delBtn.hidden = false
      $('chTitle').textContent = '💬 ' + peerName
      /* 名字点一下去对方主页 —— 那里才有性别、生日、作品墙这些资料。
         以前只有「社区 → 某幅作品 → 点作者」这一条路能进主页。 */
      const titleEl = $('chTitle')
      titleEl.classList.add('link')
      titleEl.title = '看看 ' + peerName + ' 的主页'
      titleEl.onclick = () => {
        const to = '/u?uid=' + encodeURIComponent(d.with.uid)
        if (window.__lwRouter) window.__lwRouter.push(to)
        else location.href = to
      }
      $('chNote').hidden = false
      $('chNote').innerHTML =
        '和好友 <b>' + esc(peerName) + '</b> 聊天。点上面的名字可以看他的主页。' +
        '<b>非实时</b>：对方发了新消息要自己点<b>刷新</b>。'

      const items = d.items || []

      /* 重新拉一次这段对话并重画。
         送光尘、应战猜拳、贴表情之后都要用 —— 这些动作会改动消息本身
         （比如猜拳的结果是服务端算的），只改本地数组会跟服务端对不上。 */
      async function reloadThread() {
        try {
          const tk = localStorage.getItem('lw-token') || ''
          const res = await fetch('/api/chat?with=' + encodeURIComponent(d.with.uid), {
            headers: { Authorization: 'Bearer ' + tk },
            cache: 'no-store',
          })
          const jd = await res.json().catch(() => ({}))
          if (jd && jd.ok) drawThread(jd)
        } catch (e) {}
      }
      /* 「对方正在输入」：服务端给的是 6 秒内的活跃标记 */
      try { renderTyping(!!d.peerTyping) } catch (e) {}

      // 算「有没有我还没看到的新消息」：对方最后一条比我这边最后一条新
      const mine = items.filter((m) => m.mine)
      myLastAt = mine.length ? Number(mine[mine.length - 1].at) || 0 : 0
      peerLastAt = Number(d.peerLastAt) || 0
      hasNew = !!(peerLastAt > myLastAt)

      /* 输入栏元素：必须声明在函数开头。
         放在后面会撞上 TDZ —— 空对话那条分支先执行，
         赋值时 let 还没初始化，直接抛
         「Cannot access 'inp' before initialization」，
         结果输入框没渲染、消息也发不出去。
         同时 doSend() 也要用它们，不能是 bindSend 的局部变量。 */
      let inp = null
      let send = null
      /* 发送键的启用状态。doSend() 结束时也要调它把按钮恢复成禁用，
         所以必须在外层 —— 之前声明在 bindSend 内部，doSend 里调不到。 */
      const sync = () => {
        if (send) send.disabled = !inp.value.trim()
      }

      /* 输入框必须永远都在。
         以前它被写在「有消息才渲染」那段里，于是新会话（一条都还没发过）
         页面写着「说点什么打个招呼吧」，底下却连个输入框都没有，
         根本没法开口（用户反馈）。空对话只清空消息区，输入栏照常渲染。 */
      /* ---------- 更多功能：临时状态与渲染 ---------- */
      const RPS_TXT = { rock: '✊', scissors: '✌️', paper: '✋' }
      let giftAmt = 10
      let padArt = null // 16×16，懒初始化
      let padColor = [40, 40, 40]
      let workList = null
      let pickedWork = null
      let rpsPick = ''
      let rpsWager = 0
      let replyTo = null
      /* 这四个必须声明在**最上面**。
         bindSend() 会调到 setupPlusPanel()/hidePanes()，而 bindSend 是
         函数声明（会提升），在下面这些 fetch 之前就被调用了；
         如果把这些 let/const 留在文件后半段，调用时它们还在 TDZ 里，
         整页会直接抛 "Cannot access 'xxx' before initialization"。 */
      const PANES = ['gift', 'doodle', 'work', 'rps']
      const RPS_NAME = { rock: '石头', scissors: '剪刀', paper: '布' }
      const paneEl = (name) => $('chPane' + name.charAt(0).toUpperCase() + name.slice(1))
      let plusReady = false
      /* 一条消息在引用条 / 列表里显示成什么。放在这里而不是下面，
         理由同上面那四个：被提升的函数会用到它。 */
      const previewOf = (m) => {
        const k = m.kind || 'text'
        if (k === 'dust') return '🎁 ' + (m.dust || 0) + ' 个光尘'
        if (k === 'doodle') return '🎨 一张涂鸦'
        if (k === 'work') return '🖼️ ' + ((m.work && m.work.name) || '一幅作品')
        if (k === 'rps') return '🎲 猜拳'
        return m.text || ''
      }
      const myUid = () => d.me || ''

      function rpsHtml(m) {
        const r = m.rps || {}
        if (r.stage === 'done') {
          // a 是发起人的拳、b 是应战人的。按「我是哪一方」摆正，别显示反了
          const myPick = r.iAm === 'a' ? r.a : r.b
          const hisPick = r.iAm === 'a' ? r.b : r.a
          const draw = r.result === 'draw'
          const iWin = r.result === r.iAm
          return (
            '<div class="ch-rps">' +
            '<div class="ch-rps-row"><span>' + (RPS_TXT[myPick] || '?') + '</span><b>VS</b>' +
            '<span>' + (RPS_TXT[hisPick] || '?') + '</span></div>' +
            '<div class="ch-rps-res' + (draw ? '' : iWin ? ' win' : ' lose') + '">' +
            (draw ? '平局，谁也没掏钱' : iWin ? '你赢了 ' + r.moved + ' 光尘 🎉' : '你输了 ' + r.moved + ' 光尘') +
            '</div></div>'
          )
        }
        if (r.mine) return '<div class="ch-rps">你出了 ' + (RPS_TXT[r.mine] || '?') + '，等对方出拳…</div>'
        if (m.mine) {
          return '<div class="ch-rps">你发起了猜拳' + (r.wager ? '，押 ' + r.wager + ' 光尘' : '') + '<br />等对方应战…</div>'
        }
        return (
          '<div class="ch-rps">' +
          '<div class="ch-rps-h">🎲 对方发起猜拳' + (r.wager ? '（押 ' + r.wager + ' 光尘）' : '') + '</div>' +
          '<div class="ch-rps-btns">' +
          ['rock', 'scissors', 'paper']
            .map((k) => '<button class="ch-rps-b" type="button" data-rps="' + k +
              '" data-mid="' + esc(m.id) + '" title="出' + RPS_TXT[k] + '">' + RPS_TXT[k] + '</button>')
            .join('') +
          '</div></div>'
        )
      }

      /* 一条消息在气泡里长什么样。礼物、涂鸦、画作、猜拳都不是纯文字 */
      function bubbleHtml(m) {
        const k = m.kind || 'text'
        const quote = m.reply
          ? '<div class="ch-quote">' + esc(m.reply.name) + '：' + esc(m.reply.text) + '</div>'
          : ''
        if (k === 'dust') {
          return quote + '<div class="ch-gift"><span class="ch-gift-ico">🎁</span>' +
            '<span class="ch-gift-amt">' + (m.dust || 0) + ' 光尘</span></div>' +
            (m.text ? '<div class="ch-gift-note">' + esc(m.text) + '</div>' : '')
        }
        if (k === 'doodle') {
          return quote + '<canvas class="ch-doodle" data-doodle="' + esc(m.id) + '"></canvas>' +
            (m.text ? '<div class="ch-gift-note">' + esc(m.text) + '</div>' : '')
        }
        if (k === 'work' && m.work) {
          return quote + '<div class="ch-work" data-goto="' + m.work.t + '">' +
            '<canvas class="ch-work-cv" data-work="' + m.work.t + '" data-wsize="' + m.work.size + '"></canvas>' +
            '<div class="ch-work-n">🖼️ ' + esc(m.work.name) + '</div></div>' +
            (m.text ? '<div class="ch-gift-note">' + esc(m.text) + '</div>' : '')
        }
        if (k === 'rps') return quote + rpsHtml(m)
        return quote + esc(m.text)
      }

      function reactHtml(m) {
        const r = m.react || {}
        const me = myUid()
        const keys = Object.keys(r).filter((k) => Array.isArray(r[k]) && r[k].length)
        if (!keys.length) return ''
        return '<div class="ch-reacts">' + keys
          .map((k) => '<button class="ch-react' + (r[k].indexOf(me) >= 0 ? ' on' : '') +
            '" type="button" data-react="' + esc(k) + '" data-mid="' + esc(m.id) + '">' +
            esc(k) + ' ' + r[k].length + '</button>')
          .join('') + '</div>'
      }

      const sendbar =
        '<div class="ch-sendbar">' +
        '<button class="ch-plus-btn" id="chPlusBtn" type="button" aria-label="更多功能">＋</button>' +
        '<button class="ch-emoji-btn" id="chEmojiBtn" type="button" aria-label="表情">😊</button>' +
        '<input class="ch-in" id="chIn" size="1" maxlength="300" placeholder="说点什么…">' +
        '<button class="ch-send" id="chSend" type="button" disabled>发送</button>' +
        '<div class="ch-emoji" id="chEmoji" hidden>' +
        '<div class="ch-emoji-tabs" id="chEmojiTabs"></div>' +
        '<div class="ch-emoji-grid" id="chEmojiGrid"></div>' +
        '</div>' +
        '<div class="ch-plus" id="chPlus" hidden>' +
        '<div class="ch-plus-grid" id="chPlusGrid">' +
        '<button class="ch-plus-i" type="button" data-pane="gift"><span>🎁</span><span>送光尘</span></button>' +
        '<button class="ch-plus-i" type="button" data-pane="doodle"><span>🎨</span><span>涂鸦</span></button>' +
        '<button class="ch-plus-i" type="button" data-pane="work"><span>🖼️</span><span>画作</span></button>' +
        '<button class="ch-plus-i" type="button" data-pane="rps"><span>🎲</span><span>猜拳</span></button>' +
        '</div>' +
        // ---- 送光尘 ----
        '<div class="ch-pane" id="chPaneGift" hidden>' +
        '<div class="ch-pane-h">送多少光尘？</div>' +
        '<div class="ch-chips" id="chGiftChips"></div>' +
        '<div class="ch-pane-tip" id="chGiftTip"></div>' +
        '<div class="ch-pane-act">' +
        '<button class="ch-go ghost" type="button" data-go="gift-reset">自定义</button>' +
        '<button class="ch-go" type="button" data-go="gift">送出</button>' +
        '</div></div>' +
        // ---- 涂鸦 ----
        '<div class="ch-pane" id="chPaneDoodle" hidden>' +
        '<div class="ch-pane-h">随手画一张</div>' +
        '<div class="ch-pad"><canvas id="chPad" width="16" height="16"></canvas>' +
        '<div class="ch-pad-colors" id="chPadColors"></div></div>' +
        '<div class="ch-pane-act">' +
        '<button class="ch-go ghost" type="button" data-go="pad-clear">清空</button>' +
        '<button class="ch-go" type="button" data-go="doodle">发出去</button>' +
        '</div></div>' +
        // ---- 分享画作 ----
        '<div class="ch-pane" id="chPaneWork" hidden>' +
        '<div class="ch-pane-h">挑一幅发过去</div>' +
        '<div class="ch-works" id="chWorks"></div>' +
        '<div class="ch-pane-tip" id="chWorkTip">正在读取你的作品…</div>' +
        '<div class="ch-pane-act">' +
        '<button class="ch-go" type="button" data-go="work">分享这幅</button>' +
        '</div></div>' +
        // ---- 猜拳 ----
        '<div class="ch-pane" id="chPaneRps" hidden>' +
        '<div class="ch-pane-h">出什么？</div>' +
        '<div class="ch-chips" id="chRpsChips"></div>' +
        '<div class="ch-pane-h" style="margin-top:10px">押多少光尘（可选）</div>' +
        '<div class="ch-chips" id="chRpsWager"></div>' +
        '<div class="ch-pane-tip" id="chRpsTip"></div>' +
        '<div class="ch-pane-act">' +
        '<button class="ch-go" type="button" data-go="rps">发出去挑战</button>' +
        '</div></div>' +
        '</div>' +
        // 引用谁
        '<div class="ch-replybar" id="chReplyBar" hidden></div>' +
        '</div>'
      if (!items.length) {
        $('chBody').innerHTML =
          '<div class="ch-empty">还没有聊过。<br />说点什么打个招呼吧</div>' + sendbar
        bindSend()
        return
      }
      // 第一条不是我发的、且我现在看到的最后一条不是我发的 → 中间可能有新的
      const showNew = hasNew
      let rows = ''
      let flagged = false
      let lastDay = ''
      items.forEach((m) => {
        // 跨天插一条日期分隔，长对话里更好认
        const dk = dayOf(m.at)
        if (dk !== lastDay) {
          rows += '<div class="ch-day">' + esc(dayLabel(m.at)) + '</div>'
          lastDay = dk
        }
        if (!flagged && showNew && m.at > myLastAt && !m.mine) {
          rows += '<div class="ch-new">以下是你刷新后看到的新消息</div>'
          flagged = true
        }
        rows +=
          '<div class="ch-msg' + (m.mine ? ' mine' : '') + '" data-mid="' + esc(m.id) + '">' +
          (m.mine ? '' : '<span class="ch-msg-av" data-uid="' + esc(d.with.uid) + '"></span>') +
          '<div class="ch-bubble-col">' +
          '<div class="ch-bubble">' + bubbleHtml(m) + '</div>' +
          reactHtml(m) +
          '<div class="ch-msgacts">' +
          '<button type="button" data-quote="' + esc(m.id) + '">引用</button>' +
          '<button type="button" data-reacting="' + esc(m.id) + '">回应</button>' +
          '</div>' +
          '<div class="ch-mtime">' + esc(clock(m.at)) + '</div>' +
          '</div></div>'
      })
      $('chBody').innerHTML = '<div class="ch-msgs" id="chMsgs">' + rows + '</div>' + sendbar
      $('chMsgs').scrollTop = $('chMsgs').scrollHeight
      paintAvatars()
      bindSend()

      // 看过就标已读
      if (hasNew) {
        const t = token()
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
          body: JSON.stringify({ action: 'read', with: d.with.uid }),
        }).catch(() => {})
        C.drop('chatlist')
      }

      /* 输入栏的交互。抽成函数是因为空对话和有消息两条路径都要用它 ——
         以前只有「有消息」那条绑过，所以新会话连输入框都没有。 */
      /* ---------- 更多功能：面板与动作 ---------- */
      function hidePanes() {
        PANES.forEach((k) => {
          const el = paneEl(k)
          if (el) el.hidden = true
        })
        document.querySelectorAll('#chPlusGrid .ch-plus-i').forEach((b) => b.classList.remove('on'))
      }
      function openPane(name) {
        const el = paneEl(name)
        if (!el) return
        const willOpen = el.hidden
        hidePanes()
        el.hidden = !willOpen
        const btn = document.querySelector('#chPlusGrid [data-pane="' + name + '"]')
        if (btn) btn.classList.toggle('on', willOpen)
        if (!willOpen) return
        if (name === 'doodle') initPad()
        if (name === 'work') loadWorks()
        if (name === 'gift') {
          const tip = $('chGiftTip')
          if (tip) tip.textContent = '你现在有 ' + (Number(d.bal) || 0) + ' 个光尘。送出去就真的到对方账上了。'
        }
      }

      /* ---- 🎁 送光尘 ---- */
      function paintGiftChips() {
        const box = $('chGiftChips')
        if (!box) return
        const max = Number(d.maxGift) || 500
        box.innerHTML = [5, 10, 20, 50, 100]
          .filter((x) => x <= max)
          .map((x) => '<button class="ch-chip' + (giftAmt === x ? ' on' : '') +
            '" type="button" data-gift="' + x + '">' + x + '</button>')
          .join('')
      }
      async function doGift() {
        if (!(giftAmt > 0)) return
        if (!(await lwConfirm('送出 ' + giftAmt + ' 个光尘？送出就从你账上扣掉了。'))) return
        const r = await sendMsg({ kind: 'dust', dust: giftAmt, text: inp ? inp.value.trim() : '' })
        if (!r) return
        if (inp) inp.value = ''
        sync()
        hidePanes()
        if (window.sfx) window.sfx('coin')
        if (window.dust && window.dust.sync) window.dust.sync()
        reloadThread()
      }

      /* ---- 🎨 手绘涂鸦 ---- */
      function initPad() {
        if (!padArt) {
          padArt = []
          for (let i = 0; i < 256; i++) padArt.push([255, 255, 255])
        }
        const box = $('chPadColors')
        if (box && !box.dataset.ready) {
          box.dataset.ready = '1'
          box.innerHTML = PAD_COLORS.map((c, i) =>
            '<button class="ch-pad-c' + (i === 0 ? ' on' : '') + '" type="button" data-padc="' + i +
            '" style="background:rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')"></button>').join('')
          box.addEventListener('click', (e) => {
            const b = e.target.closest ? e.target.closest('[data-padc]') : null
            if (!b) return
            padColor = PAD_COLORS[Number(b.getAttribute('data-padc'))] || [0, 0, 0]
            box.querySelectorAll('.ch-pad-c').forEach((x) => x.classList.remove('on'))
            b.classList.add('on')
          })
        }
        const cv = $('chPad')
        if (cv && !cv.dataset.ready) {
          cv.dataset.ready = '1'
          let down = false
          const put = (ev) => {
            const r = cv.getBoundingClientRect()
            if (r.width <= 0) return
            const x = Math.floor(((ev.clientX - r.left) / r.width) * 16)
            const y = Math.floor(((ev.clientY - r.top) / r.height) * 16)
            if (x < 0 || y < 0 || x >= 16 || y >= 16) return
            padArt[y * 16 + x] = padColor.slice()
            paintPad()
          }
          cv.addEventListener('pointerdown', (e) => {
            down = true
            try { cv.setPointerCapture(e.pointerId) } catch (err) {}
            put(e)
          })
          cv.addEventListener('pointermove', (e) => {
            if (down) put(e)
          })
          const stop = () => { down = false }
          cv.addEventListener('pointerup', stop)
          cv.addEventListener('pointercancel', stop)
        }
        paintPad()
      }
      function paintPad() {
        const cv = $('chPad')
        if (!cv || !padArt) return
        const c = cv.getContext('2d')
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const q = padArt[y * 16 + x] || [255, 255, 255]
            c.fillStyle = 'rgb(' + q[0] + ',' + q[1] + ',' + q[2] + ')'
            c.fillRect(x, y, 1, 1)
          }
        }
      }
      async function doDoodle() {
        if (!padArt) return
        const blank = padArt.every((q) => q[0] > 250 && q[1] > 250 && q[2] > 250)
        if (blank) {
          await lwAlert('还什么都没画呢')
          return
        }
        const r = await sendMsg({ kind: 'doodle', art: padArt, text: inp ? inp.value.trim() : '' })
        if (!r) return
        if (inp) inp.value = ''
        sync()
        padArt = null // 擦干净，下一张不带上一张
        initPad()
        hidePanes()
        if (window.sfx) window.sfx('save')
        reloadThread()
      }

      /* ---- 🖼️ 分享画作 ---- */
      async function loadWorks() {
        const box = $('chWorks')
        const tip = $('chWorkTip')
        if (!box) return
        if (workList) {
          paintWorks()
          return
        }
        if (tip) tip.textContent = '正在读取你的作品…'
        try {
          const t = localStorage.getItem('lw-token') || ''
          /* 这个接口是 POST + {token, action:'list'}，返回 { works: [...] }。
             之前我写成了 GET、也没带 body，接口根本没返回作品，
             于是永远显示「还没发布过作品」—— 明明有画。 */
          const res = await fetch('/api/mine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
            body: JSON.stringify({ token: t, action: 'list' }),
          })
          const jd = await res.json().catch(() => ({}))
          workList = (jd && jd.works) || []
          if (!Array.isArray(workList)) workList = []
        } catch (e) {
          workList = []
        }
        if (!workList.length) {
          box.innerHTML = ''
          if (tip) tip.textContent = '还没发布过作品。先去画一幅吧。'
          return
        }
        paintWorks()
      }
      function paintWorks() {
        const box = $('chWorks')
        const tip = $('chWorkTip')
        if (!box || !workList) return
        box.innerHTML = workList
          .slice(0, 24)
          .map((w, i) =>
            '<button class="' + (pickedWork && pickedWork.time === w.time ? 'on' : '') +
            '" type="button" data-work-pick="' + i + '">' +
            '<canvas class="ch-wthumb" data-wthumb="' + i + '"></canvas>' +
            '<span>' + esc(w.workName || '未命名') + '</span></button>')
          .join('')
        // 接口连像素一起给了，就画真的缩略图，别拿个 🖼️ 占位糊弄
        box.querySelectorAll('canvas[data-wthumb]').forEach((cv) => {
          const w = workList[Number(cv.getAttribute('data-wthumb'))]
          if (!w || !Array.isArray(w.pixels) || !window.LWThumb) return
          try {
            window.LWThumb.draw(cv, w.pixels, w.size, { fill: true })
          } catch (e) {}
        })
        if (tip) tip.textContent = '挑一幅，对方会在对话里看到它'
      }
      async function doShareWork() {
        if (!pickedWork) {
          await lwAlert('先挑一幅作品')
          return
        }
        const r = await sendMsg({
          kind: 'work',
          wt: pickedWork.time,
          wname: pickedWork.workName || '未命名',
          wsize: pickedWork.size,
          text: inp ? inp.value.trim() : '',
        })
        if (!r) return
        if (inp) inp.value = ''
        sync()
        hidePanes()
        if (window.sfx) window.sfx('send')
        reloadThread()
      }

      /* ---- 🎲 猜拳 ---- */
      function paintRpsChips() {
        const box = $('chRpsChips')
        const wbox = $('chRpsWager')
        const tip = $('chRpsTip')
        if (box) {
          box.innerHTML = ['rock', 'scissors', 'paper']
            .map((k) => '<button class="ch-chip' + (rpsPick === k ? ' on' : '') +
              '" type="button" data-rpspick="' + k + '">' + RPS_TXT[k] + ' ' + RPS_NAME[k] + '</button>')
            .join('')
        }
        if (wbox) {
          const maxW = Number(d.maxWager) || 200
          wbox.innerHTML = [0, 10, 30, 50, 100]
            .filter((x) => x <= maxW)
            .map((x) => '<button class="ch-chip' + (rpsWager === x ? ' on' : '') +
              '" type="button" data-wager="' + x + '">' + (x ? x + ' ✨' : '不押') + '</button>')
            .join('')
        }
        if (tip) {
          tip.textContent = '你先出拳，发出去之后对方看不到你出的是什么。' +
            (rpsWager ? '赢了对方付你 ' + rpsWager + ' 个光尘，输了从你账上扣。' : '')
        }
      }
      async function doRps() {
        if (!rpsPick) {
          await lwAlert('先出拳')
          return
        }
        const r = await sendMsg({ kind: 'rps', pick: rpsPick, wager: rpsWager })
        if (!r) return
        hidePanes()
        if (window.sfx) window.sfx('send')
        reloadThread()
      }
      async function answerRps(mid, pick) {
        const jd = await chatPost({ action: 'rps', with: d.with.uid, id: mid, pick })
        if (!jd) return
        if (!jd.ok) {
          await lwAlert(jd.error || '出拳失败')
          return
        }
        if (window.sfx) window.sfx(jd.result === 'draw' ? 'tick' : 'coin')
        if (window.dust && window.dust.sync) window.dust.sync()
        reloadThread()
      }

      /* ---- 😀 表情回应 ---- */
      async function doReact(mid, emoji) {
        const jd = await chatPost({ action: 'react', with: d.with.uid, id: mid, emoji })
        if (!jd) return
        if (!jd.ok) {
          await lwAlert(jd.error || '回应失败')
          return
        }
        if (window.sfx) window.sfx('tick')
        reloadThread()
      }

      /* ---- ↩️ 引用回复 ---- */
      function setReply(m) {
        replyTo = m
        const bar = $('chReplyBar')
        if (!bar) return
        bar.hidden = false
        bar.innerHTML = '<b>回复 ' + esc(m.mine ? '自己' : d.with.name) + '</b><span>' +
          esc(previewOf(m)) + '</span><button type="button" id="chReplyX">✕</button>'
        const x = $('chReplyX')
        if (x) {
          x.addEventListener('click', () => {
            replyTo = null
            bar.hidden = true
          })
        }
        if (inp) inp.focus()
      }

      /* ---- 统一的发消息 / 调接口 ---- */
      async function chatPost(payload) {
        const t = localStorage.getItem('lw-token') || ''
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
            body: JSON.stringify(payload),
          })
          return await res.json().catch(() => ({}))
        } catch (e) {
          await lwAlert('网络错误')
          return null
        }
      }
      /* ---------- 正在输入上报 ----------
         节流到 3 秒一次。每敲一个字都发的话，KV 写入量会很难看，
         而且对方也看不出区别（提示本来就是「大概在打字」）。 */
      let lastTypingAt = 0
      let typingTimer = 0
      function reportTyping() {
        const now = Date.now()
        if (now - lastTypingAt < 3000) return
        const uid = peerUid || ''
        if (!uid) return
        lastTypingAt = now
        // 不 await、不弹错误 —— 这只是个提示，失败就算了
        fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + (localStorage.getItem('lw-token') || ''),
          },
          body: JSON.stringify({ action: 'typing', to: uid }),
        }).catch(() => {})
      }

      /* ---------- 「对方正在输入」提示条 ----------
         放在消息列表末尾。有就显示、没有就移除 —— 不占固定高度，
         免得把消息挤来挤去。 */
      function renderTyping(on) {
        const box = $('chMsgs')
        if (!box) return
        let el = box.querySelector('.ch-typing')
        if (!on) {
          if (el) el.remove()
          return
        }
        if (el) return // 已经有了就不重画，免得动画一直重放
        el = document.createElement('div')
        el.className = 'ch-typing'
        el.innerHTML =
          '<span class="lwdeco-typing"><i></i><i></i><i></i></span>' +
          '<span class="ch-typing-t">' + (peerName || '对方') + ' 正在输入…</span>'
        box.appendChild(el)
        box.scrollTop = box.scrollHeight
      }

      /* ---------- 轻量轮询 ----------
         只为了看到「对方正在输入」和「有新消息」。
         不重画整个对话 —— 那样会把用户正在打的字、滚动位置、
         展开的表情面板全部重置。4 秒一次，够用且省流量。 */
      let pollTimer = 0
      function startPoll() {
        stopPoll()
        pollTimer = setInterval(async () => {
          if (!peerUid) return
          // 页面切到后台就不轮了，省电
          if (document.hidden) return
          try {
            const tk = localStorage.getItem('lw-token') || ''
            const res = await fetch('/api/chat?with=' + encodeURIComponent(peerUid), {
              headers: { Authorization: 'Bearer ' + tk },
              cache: 'no-store',
            })
            const jd = await res.json().catch(() => ({}))
            if (!jd || !jd.ok) return
            renderTyping(!!jd.peerTyping)
            /* 对方发了新消息才整段重画 —— 那说明内容变了，
               不重画用户看不到。仅仅是在打字的话只动提示条。 */
            const lastAt = jd.items && jd.items.length ? Number(jd.items[jd.items.length - 1].at) || 0 : 0
            if (lastAt && lastAt !== peerLastAt) {
              peerLastAt = lastAt
              drawThread(jd)
            }
          } catch (e) {}
        }, 4000)
      }
      function stopPoll() {
        if (pollTimer) clearInterval(pollTimer)
        pollTimer = 0
      }
      /* 离开这一页时不用手动停 —— withAutoCleanup 会接管 window.setInterval，
         切换路由时自动清掉。页面切到后台由上面的 document.hidden 判断兜住。 */
      startPoll()

      async function sendMsg(payload) {
        if (replyTo) {
          payload.reply = {
            id: replyTo.id,
            name: replyTo.mine ? '我' : d.with.name,
            text: previewOf(replyTo).slice(0, 80),
          }
        }
        const jd = await chatPost({ action: 'send', to: d.with.uid, ...payload })
        if (!jd) return null
        if (!jd.ok) {
          await lwAlert(jd.error || '发送失败')
          return null
        }
        replyTo = null
        const bar = $('chReplyBar')
        if (bar) bar.hidden = true
        return jd
      }

      /* ---- 气泡上挂事件（每轮渲染都是新节点）---- */
      /* 分享过来的画作：缓存过的像素，key 是作品时间戳 */
      const workPxCache = new Map()

      /**
       * 把气泡里那个 canvas 画出来。
       *
       * 消息里**只带时间戳**，不带像素 —— 一幅 64×64 是 4096 个三元组，
       * 每条都塞进消息里能把整个对话撑爆。所以按需去 /api/get 单取一幅，
       * 取过的记在 workPxCache 里，翻来覆去不会重复请求。
       *
       * 以前这里**根本没人画**：气泡里那个 128×128 的框一直是纯白的，
       * 看着就像消息没发出去。
       */
      async function paintWorkCv(cv) {
        const t = Number(cv.getAttribute('data-work'))
        const want = Number(cv.getAttribute('data-wsize')) || 16
        /* 先把尺寸定下来铺一层浅灰。canvas 不设 width/height 时默认 300×150，
           取像素那几百毫秒里就是一个惨白的大方块，看着像消息是空的。 */
        const n0 = want === 32 || want === 64 ? want : 16
        cv.width = n0
        cv.height = n0
        const c0 = cv.getContext('2d')
        c0.fillStyle = '#eef0f3'
        c0.fillRect(0, 0, n0, n0)
        if (!Number.isFinite(t) || t <= 0) return
        let rec = workPxCache.get(t)
        if (rec === undefined) {
          rec = null
          try {
            const res = await fetch('/api/get?single=1&locate=' + encodeURIComponent(t), { cache: 'no-store' })
            const jd = await res.json().catch(() => ({}))
            if (jd && jd.found && jd.work && Array.isArray(jd.work.pixels)) {
              const sz = jd.work.size === 32 || jd.work.size === 64 ? jd.work.size : 16
              rec = { pixels: jd.work.pixels, size: sz }
            }
          } catch (e) {}
          workPxCache.set(t, rec)
        }
        if (!rec) {
          // 作者删了或者取不到。留个白框会让人以为消息丢了，直接藏掉，
          // 下面那行「🖼️ 作品名」还在，点一下能去社区里找。
          cv.hidden = true
          return
        }
        const n = rec.size
        cv.width = n
        cv.height = n
        const c = cv.getContext('2d')
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const q = rec.pixels[y * n + x] || [255, 255, 255]
            c.fillStyle = 'rgb(' + q[0] + ',' + q[1] + ',' + q[2] + ')'
            c.fillRect(x, y, 1, 1)
          }
        }
      }

      function bindBubbles() {
        const body = $('chBody')
        if (!body) return
        // 把涂鸦直接画出来
        body.querySelectorAll('canvas[data-doodle]').forEach((cv) => {
          const m = items.find((x) => x.id === cv.getAttribute('data-doodle'))
          if (!m || !Array.isArray(m.art)) return
          cv.width = 16
          cv.height = 16
          const c = cv.getContext('2d')
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const q = m.art[y * 16 + x] || [255, 255, 255]
              c.fillStyle = 'rgb(' + q[0] + ',' + q[1] + ',' + q[2] + ')'
              c.fillRect(x, y, 1, 1)
            }
          }
        })

        // 分享过来的画作：按需取像素再画（消息里只有时间戳）
        body.querySelectorAll('canvas[data-work]').forEach((cv) => paintWorkCv(cv))
        body.querySelectorAll('[data-react]').forEach((b) => {
          b.addEventListener('click', () => doReact(b.getAttribute('data-mid'), b.getAttribute('data-react')))
        })
        body.querySelectorAll('[data-rps]').forEach((b) => {
          b.addEventListener('click', () => answerRps(b.getAttribute('data-mid'), b.getAttribute('data-rps')))
        })
        body.querySelectorAll('[data-quote]').forEach((b) => {
          b.addEventListener('click', () => {
            const m = items.find((x) => x.id === b.getAttribute('data-quote'))
            if (m) setReply(m)
          })
        })
        // 分享的画作：点一下去社区里找到那一幅
        body.querySelectorAll('[data-goto]').forEach((el) => {
          el.addEventListener('click', () => {
            const t = el.getAttribute('data-goto')
            if (window.__lwRouter) window.__lwRouter.push('/gallery?t=' + encodeURIComponent(t))
            else location.href = '/gallery?t=' + encodeURIComponent(t)
          })
        })
        // 「回应」：就地展开一排表情
        body.querySelectorAll('[data-reacting]').forEach((b) => {
          b.addEventListener('click', () => {
            const mid = b.getAttribute('data-reacting')
            const host = b.parentElement
            if (!host) return
            const old = host.querySelector('.ch-react-pop')
            if (old) {
              old.remove()
              return
            }
            const pop = document.createElement('div')
            pop.className = 'ch-reacts ch-react-pop'
            pop.style.marginTop = '4px'
            pop.innerHTML = (d.reactEmoji || ['👍', '❤️', '😂', '😮', '😢', '🎉'])
              .map((e) => '<button class="ch-react" type="button" data-pop="' + e + '">' + e + '</button>')
              .join('')
            pop.querySelectorAll('[data-pop]').forEach((x) => {
              x.addEventListener('click', () => doReact(mid, x.getAttribute('data-pop')))
            })
            host.appendChild(pop)
            if (window.sfx) window.sfx('open')
          })
        })
      }

      /* ---- 面板总绑定：只做一次 ---- */
      function setupPlusPanel() {
        if (plusReady) return
        plusReady = true
        const on = (sel, ev, fn) => {
          const el = $(sel)
          if (el) el.addEventListener(ev, fn)
        }
        on('chPlusGrid', 'click', (e) => {
          const b = e.target.closest ? e.target.closest('[data-pane]') : null
          if (!b) return
          openPane(b.getAttribute('data-pane'))
          if (window.sfx) window.sfx('tick')
        })
        paintGiftChips()
        on('chGiftChips', 'click', (e) => {
          const b = e.target.closest ? e.target.closest('[data-gift]') : null
          if (!b) return
          giftAmt = Number(b.getAttribute('data-gift')) || 0
          paintGiftChips()
          if (window.sfx) window.sfx('tick')
        })
        paintRpsChips()
        on('chRpsChips', 'click', (e) => {
          const b = e.target.closest ? e.target.closest('[data-rpspick]') : null
          if (!b) return
          rpsPick = b.getAttribute('data-rpspick')
          paintRpsChips()
          if (window.sfx) window.sfx('tick')
        })
        on('chRpsWager', 'click', (e) => {
          const b = e.target.closest ? e.target.closest('[data-wager]') : null
          if (!b) return
          rpsWager = Number(b.getAttribute('data-wager')) || 0
          paintRpsChips()
          if (window.sfx) window.sfx('tick')
        })
        on('chWorks', 'click', (e) => {
          const b = e.target.closest ? e.target.closest('[data-work-pick]') : null
          if (!b || !workList) return
          pickedWork = workList[Number(b.getAttribute('data-work-pick'))] || null
          paintWorks()
          if (window.sfx) window.sfx('tick')
        })
        on('chPlus', 'click', async (e) => {
          const b = e.target.closest ? e.target.closest('[data-go]') : null
          if (!b) return
          const go = b.getAttribute('data-go')
          if (go === 'gift') doGift()
          else if (go === 'gift-reset') {
            const v = await lwPrompt('要送多少光尘？（最多 ' + (Number(d.maxGift) || 500) + '）', String(giftAmt))
            const num = Math.floor(Number(v))
            if (Number.isFinite(num) && num >= 1) {
              giftAmt = Math.min(Number(d.maxGift) || 500, num)
              paintGiftChips()
            }
          } else if (go === 'pad-clear') {
            padArt = null
            initPad()
            if (window.sfx) window.sfx('clear')
          } else if (go === 'doodle') doDoodle()
          else if (go === 'work') doShareWork()
          else if (go === 'rps') doRps()
        })
      }


      function bindSend() {
        inp = $('chIn')
        send = $('chSend')
        if (!inp || !send) return
        inp.addEventListener('input', () => {
          sync()
          // 顺手告诉对方「我在打字」。内部有 3 秒节流
          try { reportTyping() } catch (e) {}
        })
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            doSend()
          }
        })
        send.addEventListener('click', doSend)
        /* 点输入框 → 键盘弹起来。等它稳定后再贴合一次视口并把消息滚到最新，
           否则刚聚焦时算出来的高度还是键盘弹出前的。 */
        inp.addEventListener('focus', () => {
          setTimeout(() => {
            fitThread()
            const box = $('chMsgs')
            if (box) box.scrollTop = box.scrollHeight
          }, 260)
        })

        // 表情面板。每轮渲染都是新节点，用 dataset 标记避免重复初始化
        // 更多功能面板。setupPlusPanel 只做一次，面板节点每轮渲染都是新的
        const plusBtn = $('chPlusBtn')
        const plusBox = $('chPlus')
        if (plusBtn && plusBox) {
          setupPlusPanel()
          if (!plusBtn.dataset.ready) {
            plusBtn.dataset.ready = '1'
            plusBtn.addEventListener('click', () => {
              const willOpen = plusBox.hidden
              if (willOpen) {
                const ep = $('chEmoji')
                if (ep) ep.hidden = true
                const eb = $('chEmojiBtn')
                if (eb) eb.classList.remove('on')
              } else {
                hidePanes()
              }
              plusBox.hidden = !willOpen
              plusBtn.classList.toggle('on', willOpen)
              if (window.sfx) window.sfx(willOpen ? 'open' : 'close')
            })
          }
        }
        bindBubbles()

        const emojiBtn = $('chEmojiBtn')
        const emojiPanel = $('chEmoji')
        if (emojiBtn && emojiPanel && !emojiPanel.dataset.ready) {
          emojiPanel.dataset.ready = '1'
          setupEmojiPanel($('chEmojiTabs'), $('chEmojiGrid'), (e) => insertAtCursor(inp, e))
          emojiBtn.addEventListener('click', () => {
            const willOpen = emojiPanel.hidden
            emojiPanel.hidden = !willOpen
            emojiBtn.classList.toggle('on', willOpen)
            if (window.sfx) window.sfx(willOpen ? 'open' : 'close')
          })
        }
        sync()
      }

      /* 清空对话的按钮已经挪到顶栏，处理逻辑在 mounted 里统一绑一次
         （按钮现在是模板里的固定元素，在这里绑会随每次重绘重复叠加）。 */

      async function doSend() {
        const t = token()
        if (!t) {
          showMsg('请先登录', true)
          return
        }
        const text = inp.value.trim()
        if (!text) return
        send.disabled = true
        send.textContent = '…'
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
            body: JSON.stringify({ action: 'send', to: d.with.uid, text }),
          })
          const r2 = await res.json().catch(() => ({}))
          if (!res.ok || !r2 || !r2.ok) {
            showMsg((r2 && r2.error) || '发送失败', true)
            return
          }
          if (window.sfx) window.sfx('send')
          C.drop('chat:' + d.with.uid)
          C.drop('chatlist')
          C.drop('chatBadge')
          try {
            window.dispatchEvent(new CustomEvent('lw-chat-changed'))
          } catch (e) {}
          load(true)
        } catch (e) {
          showMsg('发送失败：' + ((e && e.message) || '网络错误'), true)
        } finally {
          send.textContent = '发送'
          sync()
        }
      }
    }

    async function load(force) {
      if (!token()) {
        $('chBody').innerHTML =
          '<div class="ch-empty">好友功能需要登录。<br />' +
          '<a class="ch-back" href="/login" style="margin-top:10px">去登录 / 注册</a></div>'
        $('chNote').hidden = true
        return
      }
      const t = token()
      const head = { Authorization: 'Bearer ' + t }
      const url = wantUid ? '/api/chat?with=' + encodeURIComponent(wantUid) : '/api/chat?type=list'
      const key = wantUid ? 'chat:' + wantUid : 'chatlist'
      if (force) C.drop(key)
      showMsg('')
      $('chBody').innerHTML = '<div class="ch-empty"><span class="lw-load"></span>正在读取…</div>'
      try {
        const res = await fetch(url, { headers: head, cache: 'no-store' })
        const d = await res.json().catch(() => ({}))
        if (!d || !d.ok) {
          $('chBody').innerHTML = '<div class="ch-empty">' + esc((d && d.error) || '读取失败') + '</div>'
          $('chNote').hidden = !wantUid
          return
        }
        C.put(key, d)
        if (wantUid) drawThread(d)
        else drawList(d)
      } catch (e) {
        $('chBody').innerHTML = '<div class="ch-empty">读取失败：' + esc((e && e.message) || '网络错误') + '</div>'
      }
    }

    /* 点空白处收起表情面板。
       注册在 window 上而不是 document：app.js 的 withAutoCleanup 只接管
       window 上的监听，挂在 document 上的会在切页后残留。
       面板每轮渲染都会重建，所以这里每次现查元素，不闭包住旧节点。 */
    window.addEventListener('pointerdown', (ev) => {
      const panel = document.getElementById('chEmoji')
      const btn = document.getElementById('chEmojiBtn')
      if (!panel || panel.hidden) return
      if (panel.contains(ev.target) || (btn && btn.contains(ev.target))) return
      panel.hidden = true
      if (btn) btn.classList.remove('on')
    })

    /* 键盘弹出/收起、横竖屏切换时重新贴合视口，并把消息滚到最新一条。
       注册在 window 上，切页时由 app.js 的 withAutoCleanup 统一回收。 */
    window.addEventListener('resize', () => {
      fitThread()
      const box = document.getElementById('chMsgs')
      if (box) box.scrollTop = box.scrollHeight
    })

    /* 清空这段对话。按钮挪到了顶栏、只绑这一次 —— 它以前贴在发送框正上方，
       手指够发送键时很容易误触，而这是不可恢复的操作，
       所以既挪远了一点，也把确认文案写清楚。 */
    const delBtnEl = $('chDel')
    if (delBtnEl) {
      delBtnEl.addEventListener('click', async () => {
        if (!peerUid) return
        if (!(await lwConfirm('确定清空和 ' + (peerName || '对方') + ' 的这段对话吗？\n清空之后无法恢复。'))) return
        const t = token()
        if (!t) {
          showMsg('清空需要先登录', true)
          return
        }
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
            body: JSON.stringify({ action: 'del', with: peerUid }),
          })
          const r2 = await res.json().catch(() => ({}))
          if (!res.ok || !r2 || !r2.ok) {
            showMsg((r2 && r2.error) || '清空失败', true)
            return
          }
          if (window.sfx) window.sfx('close')
          C.drop('chat:' + peerUid)
          C.drop('chatlist')
          C.drop('chatBadge')
          try {
            window.dispatchEvent(new CustomEvent('lw-chat-changed'))
          } catch (e) {}
          load(true)
        } catch (e) {
          showMsg('清空失败：' + ((e && e.message) || '网络错误'), true)
        }
      })
    }

    /* 刷新按钮是这里的主要交互：非实时就靠它拉新消息 */
    C.bindRefresh($('chRefresh'), () => load(true), () => {}, true)

    // 第一次进来才请求；切回来用缓存
    if (!C.cached(wantUid ? 'chat:' + wantUid : 'chatlist', () => { load(false) })) {
      const d = C.get(wantUid ? 'chat:' + wantUid : 'chatlist')
      if (d) {
        if (wantUid) drawThread(d)
        else drawList(d)
      }
    }
  },
}
