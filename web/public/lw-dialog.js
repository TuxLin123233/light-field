// 站内对话框：确认 / 提示 / 输入
//
// 为什么不用 window.confirm / alert / prompt：
// 那是浏览器的原生弹窗，**按钮由浏览器说了算**。有些手机浏览器和 WebView
// 会自作主张多塞一个「关闭网页」按钮，用户想点确认却把页面关了。
// 这里自己画，按钮就只有「取消」和「确认」，一个不多、一个不少。
//
// 用法（全部返回 Promise，所以要 await）：
//   if (!(await lwConfirm('确定删掉吗？'))) return
//   await lwAlert('保存好了')
//   const v = await lwPrompt('起个名字', '未命名')
;(function () {
  var STYLE_ID = 'lwd-style'
  var layer = null
  var showing = false
  var queue = []

  var CSS =
    '.lwd-mask{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;' +
    'justify-content:center;padding:22px;background:rgba(20,14,8,.42);' +
    '-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);' +
    'animation:lwd-mask-in .18s ease-out;}' +
    '@keyframes lwd-mask-in{from{opacity:0}to{opacity:1}}' +
    '.lwd-mask.lwd-out{animation:lwd-mask-out .16s ease-in forwards;}' +
    '@keyframes lwd-mask-out{to{opacity:0}}' +
    '.lwd-box{width:100%;max-width:330px;background:var(--surface,#fff);' +
    'border:1px solid var(--border-strong,#d8cfc0);border-radius:16px;padding:18px 16px 14px;' +
    'box-shadow:0 16px 44px rgba(0,0,0,.28);' +
    /* 弹性曲线：稍微过冲一点再落回来，比 ease-out 有生气 */
    'animation:lwd-in .26s cubic-bezier(.2,1.3,.4,1);}' +
    '@keyframes lwd-in{from{opacity:0;transform:translateY(10px) scale(.97)}' +
    '60%{opacity:1;transform:translateY(-2px) scale(1.012)}' +
    'to{opacity:1;transform:none}}' +
    '.lwd-mask.lwd-out .lwd-box{animation:lwd-box-out .16s ease-in forwards;}' +
    '@keyframes lwd-box-out{to{opacity:0;transform:translateY(6px) scale(.97)}}' +
    '@media (prefers-reduced-motion:reduce){.lwd-mask,.lwd-mask.lwd-out,' +
    '.lwd-mask .lwd-box,.lwd-mask.lwd-out .lwd-box{animation:none!important}}' +
    '.lwd-ico{font-size:30px;text-align:center;line-height:1.1;margin-bottom:8px;}' +
    '.lwd-title{font-size:15px;font-weight:800;color:var(--text,#2b2b2b);' +
    'text-align:center;margin-bottom:8px;}' +
    '.lwd-msg{font-size:13px;line-height:1.85;color:var(--text-muted,#6b6b6b);' +
    'text-align:center;white-space:pre-wrap;word-break:break-word;}' +
    '.lwd-in{display:block;width:100%;box-sizing:border-box;margin-top:11px;' +
    'border:1px solid var(--border-input,#ccc);background:var(--surface-2,#f6f2ea);' +
    'color:var(--text,#2b2b2b);border-radius:10px;padding:10px 12px;' +
    'font-size:14px;font-family:inherit;}' +
    '.lwd-btns{display:flex;margin-top:16px;}' +
    '.lwd-btns button{flex:1;border:0;border-radius:11px;padding:11px 0;' +
    'font-size:14px;font-weight:800;font-family:inherit;cursor:pointer;}' +
    '.lwd-btns button + button{margin-left:9px;}' +
    '.lwd-cancel{background:var(--surface-2,#f0ece4);color:var(--text-muted,#6b6b6b);' +
    'border:1px solid var(--border-input,#ccc)!important;}' +
    '.lwd-ok{background:var(--accent,#5b8def);color:#fff;}' +
    '.lwd-ok.danger{background:#c0392b;}' +
    /* 飘字：上浮 + 淡出，末尾保持透明 */
    '@keyframes lwd-float{0%{opacity:0;transform:translate(-50%,6px) scale(.8)}' +
    '18%{opacity:1;transform:translate(-50%,-2px) scale(1.12)}' +
    '34%{transform:translate(-50%,-6px) scale(1)}' +
    '100%{opacity:0;transform:translate(-50%,-42px) scale(1)}}' +
    /* 弹一下 */
    /* 左右摇：出错/危险操作时强调 */
    '@keyframes lwd-shake{0%,100%{transform:translateX(0)}' +
    '15%{transform:translateX(-8px)}30%{transform:translateX(7px)}' +
    '45%{transform:translateX(-5px)}60%{transform:translateX(4px)}80%{transform:translateX(-2px)}}' +
    '@keyframes lwd-pop{0%{transform:scale(1)}35%{transform:scale(1.28)}' +
    '70%{transform:scale(.96)}100%{transform:scale(1)}}' +
    '@media (prefers-reduced-motion:reduce){' +
    '.lwd-float,.lwd-pop{animation:none!important}}'

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return
    var st = document.createElement('style')
    st.id = STYLE_ID
    st.textContent = CSS
    document.head.appendChild(st)
  }

  /* ---------- 通用小动画工具 ----------
     放在这里是因为 lw-dialog 每页都加载，不用再引一个新文件。 */

  /* 在某个元素上方飘一个「+12 ✨」然后淡出上移。
     用法：LWDialog.floatText(el, '+12 ✨', { color: '#5b8def' }) */
  function floatText(anchorEl, text, opts) {
    if (!anchorEl) return
    var o = opts || {}
    var reduced = false
    try {
      reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    } catch (e) {}
    var r = anchorEl.getBoundingClientRect()
    var tip = document.createElement('div')
    tip.textContent = String(text == null ? '' : text)
    tip.style.cssText =
      'position:fixed;left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 4) + 'px;' +
      'transform:translate(-50%,0);z-index:99998;pointer-events:none;' +
      'font-size:' + (o.size || 15) + 'px;font-weight:800;font-family:inherit;' +
      'color:' + (o.color || '#5b8def') + ';text-shadow:0 1px 3px rgba(0,0,0,.18);' +
      'white-space:nowrap;'
    if (reduced) {
      tip.style.transition = 'opacity .4s'
    } else {
      tip.style.animation = 'lwd-float ' + (o.duration || 1100) + 'ms cubic-bezier(.2,.9,.3,1) forwards'
    }
    document.body.appendChild(tip)
    setTimeout(function () {
      if (tip.parentNode) tip.parentNode.removeChild(tip)
    }, (o.duration || 1100) + 60)
  }

  /* 让元素弹一下，用来提示「这个数字变了」。
     用法：LWDialog.pop(el) */
  function pop(el) {
    if (!el) return
    var reduced = false
    try {
      reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    } catch (e) {}
    if (reduced) return
    el.style.animation = 'none'
    // 强制回流，否则连续调用时动画不会重播
    void el.offsetWidth
    el.style.animation = 'lwd-pop .42s cubic-bezier(.2,1.4,.4,1)'
    setTimeout(function () { el.style.animation = '' }, 460)
  }

  function reduceMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    } catch (e) {
      return false
    }
  }

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  /* opts: { title, icon, ok, cancel, danger, input: {value, placeholder} } */
  function open(opts) {
    return new Promise(function (resolve) {
      queue.push({ opts: opts, resolve: resolve })
      pump()
    })
  }

  function pump() {
    if (showing || !queue.length) return
    showing = true
    var job = queue.shift()
    var o = job.opts || {}
    var isAlert = o.cancel === false // 只有一个按钮
    injectStyle()

    layer = document.createElement('div')
    layer.className = 'lwd-mask'
    layer.innerHTML =
      '<div class="lwd-box" role="dialog" aria-modal="true">' +
      (o.icon ? '<div class="lwd-ico">' + esc(o.icon) + '</div>' : '') +
      (o.title ? '<div class="lwd-title">' + esc(o.title) + '</div>' : '') +
      '<div class="lwd-msg"></div>' +
      (o.input ? '<input class="lwd-in" type="text">' : '') +
      '<div class="lwd-btns">' +
      (isAlert ? '' : '<button class="lwd-cancel" type="button"></button>') +
      '<button class="lwd-ok' + (o.danger ? ' danger' : '') + '" type="button"></button>' +
      '</div></div>'

    // 正文用 textContent 写：里面的换行和特殊字符原样保留，也不怕被当成 HTML
    layer.querySelector('.lwd-msg').textContent = String(o.message == null ? '' : o.message)
    var cancelBtn = layer.querySelector('.lwd-cancel')
    var okBtn = layer.querySelector('.lwd-ok')
    if (cancelBtn) cancelBtn.textContent = o.cancelText || '取消'
    okBtn.textContent = o.okText || '确认'
    var input = layer.querySelector('.lwd-in')
    if (input && o.input) {
      input.value = o.input.value == null ? '' : String(o.input.value)
      if (o.input.placeholder) input.placeholder = o.input.placeholder
    }

    /* 出错/危险操作的对话框，入场后抖一下强调。
       只在 danger 或调用方显式传 shake 时才抖 —— 每个提示框都抖会让人晕。 */
    if ((o.danger || o.shake) && !reduceMotion()) {
      var shakeBox = layer.querySelector('.lwd-box')
      if (shakeBox) {
        setTimeout(function () {
          shakeBox.style.animation = 'lwd-shake .5s cubic-bezier(.36,.07,.19,.97)'
          setTimeout(function () { shakeBox.style.animation = '' }, 560)
        }, 90)
      }
    }

    var done = false
    function finish(val) {
      if (done) return
      done = true
      document.removeEventListener('keydown', onKey, true)
      var el = layer
      layer = null
      showing = false
      job.resolve(val)

      /* 出场动画：挂 .lwd-out 让它缩回去淡掉，动画结束再移除节点。
         直接 removeChild 是「啪」地一下消失，很生硬。
         计时用 setTimeout 而不是 animationend —— 系统开了「减弱动态效果」
         时动画不跑、animationend 永不触发，那样节点就留在页面上了。 */
      var reduced = false
      try {
        reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      } catch (e) {}
      var wait = reduced ? 0 : 170
      if (el && el.parentNode) {
        if (!reduced) el.classList.add('lwd-out')
        setTimeout(function () {
          if (el && el.parentNode) el.parentNode.removeChild(el)
        }, wait)
      }
      // 下一个稍等一下再弹，免得两次点击穿透到新对话框上
      setTimeout(pump, wait + 60)
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        finish(isAlert ? true : null)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        okBtn.click()
      }
    }

    okBtn.addEventListener('click', function () {
      finish(input ? input.value : true)
    })
    if (cancelBtn) cancelBtn.addEventListener('click', function () { finish(null) })
    // 点空白处：提示框当确认，确认框当取消
    layer.addEventListener('click', function (e) {
      if (e.target === layer) finish(isAlert ? true : null)
    })
    document.addEventListener('keydown', onKey, true)
    document.body.appendChild(layer)

    setTimeout(function () {
      if (input) {
        input.focus()
        try { input.select() } catch (err) {}
      } else {
        okBtn.focus()
      }
    }, 30)

    if (window.sfx) window.sfx(isAlert ? 'tick' : 'open')
  }

  function confirmBox(message, opts) {
    var o = {}
    for (var k in opts || {}) o[k] = opts[k]
    o.message = message
    if (!o.icon) o.icon = o.danger ? '⚠️' : '❓'
    return open(o).then(function (v) { return v !== null })
  }

  function alertBox(message, opts) {
    var o = {}
    for (var k in opts || {}) o[k] = opts[k]
    o.message = message
    o.cancel = false
    if (!o.icon) o.icon = '💬'
    return open(o).then(function () {})
  }

  function promptBox(message, value, opts) {
    var o = {}
    for (var k in opts || {}) o[k] = opts[k]
    o.message = message
    o.input = { value: value == null ? '' : value, placeholder: (opts && opts.placeholder) || '' }
    if (!o.icon) o.icon = '✏️'
    return open(o).then(function (v) { return v === null ? null : String(v) })
  }

  /* ================= 能吃 HTML 的浮层 =================
     lwAlert 的正文是用 textContent 写的（见上面 open() 里的注释），
     这样换行和特殊字符原样保留、也不怕被当成 HTML —— 对提示语是对的，
     但**不能往里塞 HTML**：塞了就会把源码原样显示出来。

     站里有三处就是这么用的（跑酷的永久加成面板、跑酷的成绩板、
     冒险世界的帮助），表现都是「弹出来一堆 <div style=...> 源码，
     而且里面的按钮根本没有」。

     所以补一个 lwPanel：专门用来放我们自己拼的、可信的 HTML。
     里面的按钮带 data-close 就能关掉浮层。
     用法：lwPanel('<b>标题</b><button data-close>好</button>')
     返回一个 Promise，关掉时 resolve。 */
  /* ================= 能吃 HTML 的浮层 =================
     lwAlert 的正文是用 textContent 写的（见 open() 里的注释），
     这样换行和特殊字符原样保留、也不怕被当成 HTML —— 对提示语是对的，
     但**不能往里塞 HTML**：塞了就会把源码原样显示出来。

     站里有三处就是这么用的（跑酷的永久加成面板、跑酷的成绩板、
     冒险世界的帮助），表现都是「弹出来一堆 <div style=...> 源码，
     而且里面的按钮根本没渲染出来」。

     所以补一个 lwPanel：专门放我们自己拼的、可信的 HTML。
     它复用现有的 .lwd-mask / .lwd-box 样式（那套 CSS 是动态注入的，
     这里不用重复写），只是正文改成 innerHTML。
     里面的按钮带 data-close 就能关掉浮层。
     用法：lwPanel('<b>标题</b><button data-close>好</button>')
     返回 Promise，关掉时 resolve。 */
  function panelBox(html, opts) {
    var o = opts || {}
    return new Promise(function (resolve) {
      var mask = document.createElement('div')
      mask.className = 'lwd-mask'
      var box = document.createElement('div')
      box.className = 'lwd-box'
      var ico = o.icon ? '<div class="lwd-ico">' + o.icon + '</div>' : ''
      var ttl = o.title ? '<div class="lwd-title">' + o.title + '</div>' : ''
      box.innerHTML = ico + ttl + '<div class="lwd-msg">' + html + '</div>'
      mask.appendChild(box)
      document.body.appendChild(mask)

      var done = false
      function close(v) {
        if (done) return
        done = true
        mask.classList.add('lwd-out')
        document.removeEventListener('keydown', onEsc)
        setTimeout(function () {
          if (mask.parentNode) mask.parentNode.removeChild(mask)
          resolve(v == null ? null : v)
        }, 170)
      }
      // 带 data-close 的按钮点了就关，值取 data-close 的内容
      box.addEventListener('click', function (e) {
        var t = e.target
        var btn = t && t.closest ? t.closest('[data-close]') : null
        if (btn) { e.preventDefault(); close(btn.getAttribute('data-close') || true) }
      })
      if (o.mask !== false) {
        mask.addEventListener('click', function (e) { if (e.target === mask) close(null) })
      }
      var onEsc = function (e) { if (e.key === 'Escape' || e.keyCode === 27) close(null) }
      document.addEventListener('keydown', onEsc)
    })
  }

  window.LWDialog = {
    floatText: floatText,
    pop: pop, confirm: confirmBox, alert: alertBox, prompt: promptBox, panel: panelBox, open: open }
  window.lwConfirm = confirmBox
  window.lwAlert = alertBox
  window.lwPrompt = promptBox
  window.lwPanel = panelBox
})()
