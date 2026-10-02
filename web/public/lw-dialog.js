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
    '-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);}' +
    '.lwd-box{width:100%;max-width:330px;background:var(--surface,#fff);' +
    'border:1px solid var(--border-strong,#d8cfc0);border-radius:16px;padding:18px 16px 14px;' +
    'box-shadow:0 16px 44px rgba(0,0,0,.28);animation:lwd-in .16s ease-out;}' +
    '@keyframes lwd-in{from{opacity:0;transform:translateY(10px) scale(.97)}' +
    'to{opacity:1;transform:none}}' +
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
    '.lwd-ok.danger{background:#c0392b;}'

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return
    var st = document.createElement('style')
    st.id = STYLE_ID
    st.textContent = CSS
    document.head.appendChild(st)
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

    var done = false
    function finish(val) {
      if (done) return
      done = true
      document.removeEventListener('keydown', onKey, true)
      if (layer && layer.parentNode) layer.parentNode.removeChild(layer)
      layer = null
      showing = false
      job.resolve(val)
      // 下一个稍等一下再弹，免得两次点击穿透到新对话框上
      setTimeout(pump, 60)
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

  window.LWDialog = { confirm: confirmBox, alert: alertBox, prompt: promptBox, open: open }
  window.lwConfirm = confirmBox
  window.lwAlert = alertBox
  window.lwPrompt = promptBox
})()
