// 作品菜单：右键或长按一幅画，弹出跟微信图片长按那一套一样的菜单
//
// 为什么自己画而不用浏览器的：浏览器给的是「在新标签页打开图片 /
// 复制图片地址 / 搜索图片上的文字」这一套，指向的是 img 的 URL，
// 对我们没用 —— 画是 canvas 画的，根本没有 img 地址；而且它没有
// 「转发给朋友」「存到手机」这两件用户真正要的事。
//
// 交互上照搬微信：右键（桌面）和长按（手机）都唤起同一个菜单。
// 只做右键等于手机上没有入口；只做长按，桌面用户又不知道有这回事。
//
// 用法：
//   LWWorkMenu.bind(el, {
//     time, title, author, work,     // work 用来画缩略图/导出图
//     onReport(), onDelete(),
//   })
// 绑一次就行，之后所有匹配 selector 的卡片自动带上这个菜单。
window.LWWorkMenu = (function () {
  var STYLE_ID = 'lwwm-style'
  var mask = null
  var box = null
  var current = null

  var CSS = [
    '.lwwm-mask{position:fixed;inset:0;z-index:100000;background:rgba(20,14,8,.32);',
    '-webkit-backdrop-filter:blur(1px);backdrop-filter:blur(1px);',
    'display:flex;align-items:center;justify-content:center;padding:24px;}',
    /* 必须显式写这一条。hidden 属性靠的是 UA 样式表里的 [hidden]{display:none}，
       而作者样式表里的 display:flex 优先级更高 —— 少了这行，遮罩第一次创建后
       就永远铺在页面上，把后面所有点击都吃掉（表现是菜单关不掉、页面点不动）。 */
    '.lwwm-mask[hidden]{display:none}',
    '.lwwm-box{width:100%;max-width:280px;background:#f7f7f7;border-radius:14px;overflow:hidden;',
    'box-shadow:0 18px 50px rgba(0,0,0,.32);animation:lwwm-in .15s ease-out;}',
    '@keyframes lwwm-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}',
    /* 深色模式下别变成一块白板 */
    '@media (prefers-color-scheme:dark){.lwwm-box{background:#2c2a28}}',
    'html[data-theme="dark"] .lwwm-box{background:#2c2a28}',
    '.lwwm-head{padding:14px 16px 10px;text-align:center;background:#fff;',
    'border-bottom:1px solid rgba(0,0,0,.06);}',
    'html[data-theme="dark"] .lwwm-head{background:#242220;border-bottom-color:rgba(255,255,255,.07)}',
    '.lwwm-title{font-size:14px;font-weight:700;color:#1c1c1e;word-break:break-all;',
    'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.lwwm-sub{font-size:11px;color:#8a8a8e;margin-top:3px;}',
    'html[data-theme="dark"] .lwwm-title{color:#f2f2f7}',
    '.lwwm-list{background:#fff;padding:4px 0;}',
    'html[data-theme="dark"] .lwwm-list{background:#2c2a28}',
    '.lwwm-item{display:flex;align-items:center;width:100%;border:0;background:transparent;',
    'padding:13px 18px;font:inherit;font-size:15px;font-weight:600;color:#1c1c1e;',
    'cursor:pointer;text-align:left;gap:12px;}',
    '.lwwm-item:active{background:rgba(0,0,0,.05)}',
    'html[data-theme="dark"] .lwwm-item{color:#f2f2f7}',
    'html[data-theme="dark"] .lwwm-item:active{background:rgba(255,255,255,.08)}',
    '.lwwm-item-ico{font-size:19px;line-height:1;flex:none;width:24px;text-align:center}',
    '.lwwm-item.danger{color:#d0342c}',
    '.lwwm-sep{height:1px;background:rgba(0,0,0,.07);margin:4px 12px;}',
    'html[data-theme="dark"] .lwwm-sep{background:rgba(255,255,255,.09)}',
    '.lwwm-cancel{width:100%;border:0;background:#fff;padding:14px;font:inherit;',
    'font-size:15px;font-weight:700;color:#1c1c1e;cursor:pointer;border-top:1px solid rgba(0,0,0,.06);}',
    'html[data-theme="dark"] .lwwm-cancel{background:#242220;color:#f2f2f7;border-top-color:rgba(255,255,255,.07)}',
    '.lwwm-tip{padding:9px 16px 11px;font-size:11px;line-height:1.7;color:#8a8a8e;',
    'background:#fff;text-align:center;}',
    'html[data-theme="dark"] .lwwm-tip{background:#242220}',
  ].join('')

  function ensure() {
    if (box) return
    if (!document.getElementById(STYLE_ID)) {
      var st = document.createElement('style')
      st.id = STYLE_ID
      st.textContent = CSS
      document.head.appendChild(st)
    }
    mask = document.createElement('div')
    mask.className = 'lwwm-mask'
    mask.hidden = true
    // 点外面 = 取消。放在 mask 上而不是 box 上，这样不用逐个条目判断
    mask.addEventListener('pointerdown', function (e) {
      if (!box.contains(e.target)) close()
    })
    var b = document.createElement('div')
    b.className = 'lwwm-box'
    b.setAttribute('role', 'menu')
    mask.appendChild(b)
    box = b
    document.body.appendChild(mask)
    // Esc 也关。手机上没有 Esc，但桌面上这是基本礼貌
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close()
    })
  }

  function close() {
    if (mask) mask.hidden = true
    current = null
  }

  /* ---------- 把一幅画导出成 PNG ----------
     跟 town.js 那套是同一个道理：不导出屏幕上的画布（它只有 16~64 的
     逻辑像素，存出来就是一张小图），而是另画一张放大版。 */
  function toPng(work, scale) {
    var s = scale || 8
    if (!work || !Array.isArray(work.pixels)) return null
    var n = work.size === 32 || work.size === 64 ? work.size : 16
    var cv = document.createElement('canvas')
    cv.width = n * s
    cv.height = n * s
    var c = cv.getContext('2d')
    c.imageSmoothingEnabled = false
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        var p = work.pixels[y * n + x]
        if (!p) continue
        // 透明格留白，跟作品在站里显示的样子一致
        c.fillStyle = 'rgb(' + (p[0] | 0) + ',' + (p[1] | 0) + ',' + (p[2] | 0) + ')'
        c.fillRect(x * s, y * s, s, s)
      }
    }
    return cv
  }

  function linkOf(time) {
    // 参数名必须是 t：gallery 只认 /gallery?t=时间戳（分享定位就在那读它）。
    // 写成 work 的话链接能打开页面，但落不到那幅画上
    return location.origin + '/gallery?t=' + encodeURIComponent(String(time))
  }

  function item(ico, label, fn, danger) {
    var b = document.createElement('button')
    b.type = 'button'
    b.className = 'lwwm-item' + (danger ? ' danger' : '')
    b.setAttribute('role', 'menuitem')
    b.innerHTML = '<span class="lwwm-item-ico">' + ico + '</span><span>' + label + '</span>'
    b.addEventListener('click', function () {
      close()
      try { fn() } catch (e) {}
    })
    return b
  }

  function sep() {
    var d = document.createElement('div')
    d.className = 'lwwm-sep'
    return d
  }

  /* 转发：优先走系统分享面板（手机上能直接发给微信好友），
     没有就退回复制链接。navigator.share 必须在用户手势里调，
     所以只能在点菜单项的那一刻调，不能提前准备好。 */
  function share(time, title) {
    var url = linkOf(time)
    var text = title ? title + '（像素小镇）' : '我在像素小镇画了这个'
    if (navigator.share) {
      navigator.share({ title: text, text: text, url: url }).catch(function () {})
      return
    }
    copyText(url, '链接已复制，粘给朋友就行')
  }

  function copyText(s, okMsg) {
    function done() {
      if (window.sfx) window.sfx('tick')
      if (window.lwAlert) window.lwAlert(okMsg)
      else alert(okMsg)
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(s).then(done, function () { fallback() })
    } else {
      fallback()
    }
    function fallback() {
      // 老浏览器没有 clipboard API，只能用 textarea + execCommand
      var ta = document.createElement('textarea')
      ta.value = s
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;left:-9999px;top:0'
      document.body.appendChild(ta)
      ta.select()
      ta.setSelectionRange(0, s.length)
      var ok = false
      try { ok = document.execCommand('copy') } catch (e) {}
      ta.remove()
      if (ok) done()
      else if (window.lwAlert) window.lwAlert('复制不了，长按选中地址栏手动复制吧')
    }
  }

  function save(time, work, title) {
    var cv = toPng(work)
    if (!cv) {
      if (window.lwAlert) window.lwAlert('这幅画存不下来')
      return
    }
    var name = (title ? title.replace(/[\\/:*?"<>|]/g, '') : '像素画') + '.png'
    if (cv.toBlob) {
      cv.toBlob(function (blob) {
        if (!blob) {
          if (window.lwAlert) window.lwAlert('导出失败，换个浏览器试试')
          return
        }
        var url = URL.createObjectURL(blob)
        triggerDownload(url, name)
      }, 'image/png')
    } else {
      triggerDownload(cv.toDataURL('image/png'), name)
    }
  }

  function triggerDownload(url, name) {
    var a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    // 立刻 revoke 有些浏览器（Safari）会拿不到数据，挪到下一个事件循环
    setTimeout(function () { URL.revokeObjectURL(url) }, 10000)
  }

  function open(info) {
    ensure()
    current = info
    box.innerHTML = ''

    var head = document.createElement('div')
    head.className = 'lwwm-head'
    var t = document.createElement('div')
    t.className = 'lwwm-title'
    t.textContent = info.title || '未命名'
    head.appendChild(t)
    if (info.author) {
      var s = document.createElement('div')
      s.className = 'lwwm-sub'
      s.textContent = info.author
      head.appendChild(s)
    }
    box.appendChild(head)

    var list = document.createElement('div')
    list.className = 'lwwm-list'
    list.appendChild(item('💬', '转发给朋友', function () { share(info.time, info.title) }))
    list.appendChild(item('⬇️', '保存到手机', function () { save(info.time, info.work, info.title) }))
    list.appendChild(item('🔗', '复制链接', function () { copyText(linkOf(info.time), '链接已复制') }))
    if (info.onCard) {
      list.appendChild(sep())
      list.appendChild(item('🃏', '生成朋友圈卡片', function () { info.onCard() }))
    }
    if (info.onReport) {
      list.appendChild(sep())
      list.appendChild(item('🚩', '举报这幅画', function () { info.onReport() }, true))
    }
    if (info.onDelete) {
      list.appendChild(sep())
      list.appendChild(item('🗑️', '删掉这幅画', function () { info.onDelete() }, true))
    }
    box.appendChild(list)

    var tip = document.createElement('div')
    tip.className = 'lwwm-tip'
    tip.textContent = '画是别人上传的，仅供预览'
    box.appendChild(tip)

    var cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.className = 'lwwm-cancel'
    cancel.textContent = '取消'
    cancel.addEventListener('click', close)
    box.appendChild(cancel)

    mask.hidden = false
  }

  /* ---------- 绑定 ----------
     在容器上绑一次（事件冒泡），之后动态加进来的卡片自动生效 ——
     作品列表是异步渲染的，逐个卡片绑定的话每次刷新都得重绑一遍，
     漏一个就有一个点不开。 */
  function bind(container, opts) {
    if (!container) return
    var o = opts || {}
    var sel = o.selector || '[data-work-time]'
    if (container.__lwwm) return
    container.__lwwm = true

    // 每个条目从 DOM 上读自己的信息，这样一份 opts 能服务所有卡片
    function infoOf(el) {
      var g = o.getInfo ? o.getInfo(el) : null
      if (g) return g
      var time = Number(el.getAttribute('data-work-time'))
      return {
        time: time,
        title: el.getAttribute('data-work-title') || '',
        author: el.getAttribute('data-work-author') || '',
        work: o.workOf ? o.workOf(time) : null,
      }
    }

    container.addEventListener('contextmenu', function (e) {
      var el = e.target.closest ? e.target.closest(sel) : null
      if (!el || !container.contains(el)) return
      // 必须 preventDefault：不拦的话浏览器自己的菜单会先弹出来，
      // 两个菜单叠在一起（手机上更糟，系统菜单会直接吃掉这次点击）
      e.preventDefault()
      open(infoOf(el))
    })

    /* 长按。手机上没有右键，用户唯一能发现这个菜单的入口就是长按 ——
       这跟微信里长按图片弹出「转发/收藏/保存」是一样的手势。 */
    var timer = 0
    var startX = 0
    var startY = 0
    container.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return // 鼠标用右键，别跟拖拽打架
      var el = e.target.closest ? e.target.closest(sel) : null
      if (!el || !container.contains(el)) return
      startX = e.clientX
      startY = e.clientY
      clearTimeout(timer)
      timer = setTimeout(function () {
        timer = 0
        // 手上已经挪开了就别弹了
        open(infoOf(el))
        if (navigator.vibrate) { try { navigator.vibrate(12) } catch (e) {} }
      }, 500)
    })
    var cancelHold = function () { clearTimeout(timer); timer = 0 }
    container.addEventListener('pointermove', function (e) {
      if (!timer) return
      // 手指移动超过一点就算滚动/拖拽，不该弹菜单。
      // 这才是判断「用户其实想滚动」的正确依据
      if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) cancelHold()
    })
    container.addEventListener('pointerup', cancelHold)
    container.addEventListener('scroll', cancelHold, true)
    /* pointerleave 也不清计时器。
       触屏按住时浏览器会补发一串 mouse 事件（轨迹实测：
       pointerdown:touch → pointerleave:mouse → pointerup:touch），
       一旦某个浏览器在这个顺序里发了真的 pointerleave，清掉计时器就等于
       长按永远不生效。「手指已经挪走」这件事上面那个 10px 位移判断
       比任何事件类型都可靠，用它就够了。 */
  }

  return { bind: bind, open: open, close: close, toPng: toPng, linkOf: linkOf }
})()
