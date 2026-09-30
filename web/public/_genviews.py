#!/usr/bin/env python3
# 把现有单文件 HTML 页面转成 Vue 3 视图模块（无构建，直接被 app.js import）
import re, io, sys, os

PAGES = ['paint', 'room', 'gallery', 'settings', 'changelog', 'admin', 'terms']


def esc(s):
    """放进 JS 模板字符串前的转义"""
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


def strip_nav_and_toast(body):
    body = re.sub(r'<nav class="bottom-nav">.*?</nav>\s*', '', body, flags=re.S)
    body = re.sub(r'<div id="toast"></div>\s*', '', body)
    return body


def convert(name):
    src = io.open(name + '.html', encoding='utf-8').read()

    m = re.search(r'<style>\n(.*?)\n    </style>', src, re.S)
    css = m.group(1) if m else ''

    body = src[src.index('<body>') + len('<body>'):]
    body = body[:body.rindex('</body>')]

    # 模板 = body 去掉所有 script，再去掉 nav / #toast
    tpl = re.sub(r'<script[^>]*>.*?</script>\s*', '', body, flags=re.S)
    tpl = strip_nav_and_toast(tpl).strip()

    # mounted 主体 = body 内所有内联 script 依次拼接
    blocks = re.findall(r'<script>\n(.*?)\n\s*</script>', body, re.S)
    code = '\n'.join(blocks)

    out = []
    out.append('// 由 %s.html 自动转换为 Vue 3 视图（无构建）' % name)
    out.append('export default {')
    out.append("  name: '%s'," % name)
    out.append('  css: `%s`,' % esc(css))
    out.append('  template: `%s`,' % esc(tpl))
    out.append('  mounted() {')
    out.append(code.rstrip())
    out.append('  },')
    out.append('}')
    txt = '\n'.join(out) + '\n'
    io.open(os.path.join('views', name + '.js'), 'w', encoding='utf-8').write(txt)
    return len(tpl.split('\n')), len(code.split('\n'))


if __name__ == '__main__':
    for p in PAGES:
        t, c = convert(p)
        print('%-10s 模板 %4d 行 · 逻辑 %4d 行' % (p, t, c))
