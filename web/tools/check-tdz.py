#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TDZ 检查器：找出「被提升的函数用到了还没初始化的 let/const」。

背景：function 声明会提升，能在它的定义之前被调用；
但 let/const 不提升，初始化那一行执行前访问会抛
    Cannot access 'xxx' before initialization
整个页面直接白掉。

这个坑在 chat.js 上真的发生过（plusReady / PANES / paneEl / RPS_NAME）——
当时所有测试都是「把单个函数抠出来跑」，没人把整页跑一遍，所以全漏了。

做法：把文件解析成**作用域树**（每个 function 是一个作用域），
在**同一个作用域内**判断：
  1. 这个作用域直接声明了哪些 function 和 let/const
  2. 每个函数（含嵌套调用）用到哪些变量 —— 做传递闭包
  3. 这个作用域「顶层」的调用语句（不在任何嵌套函数体里）
  4. 顶层调用早于变量声明，而它调的函数间接用到该变量 → 报警
"""
import re
import sys
import glob

ARROWS = []
# 前面可能有 ( —— IIFE 就是 (async function init() { ... })()
FN = re.compile(r'^(\s*)\(?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(')
# 对象方法简写：mounted() { ... } / async load() { ... }
# 视图最外层就是这种写法，不认它就漏掉整页（真踩过）
METHOD = re.compile(r'^(\s*)(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*$')
KEYWORDS = {'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'else', 'do', 'try'}
ARROW = re.compile(r'^(\s*)(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>')
VAR = re.compile(r'^(\s*)(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=')


def _blank(m):
    """把注释换成等量空白，**但要保留换行** ——
       否则多行注释会被压成一行，后面所有行号全部错位，
       比较出来的结果全是错的。"""
    return ''.join('\n' if c == '\n' else ' ' for c in m.group(0))


def strip_templates(src):
    """把 `...` 模板字符串的内容挖空（保留换行与长度）。

    这一步是必须的：视图里的 css / template 就是模板字符串，
    往里面误插一段 JS 的话，正则会把那段当成"真代码"，
    于是「函数明明声明了」——但它在字符串里，运行时根本不存在。
    town.js 的 startWeather 就是这么丢的。"""
    out = []
    i = 0
    while i < len(src):
        c = src[i]
        if c == '`':
            j = i + 1
            while j < len(src):
                if src[j] == '\\':
                    j += 2
                    continue
                if src[j] == '`':
                    break
                j += 1
            seg = src[i:j + 1]
            out.append('`' + ''.join('\n' if ch == '\n' else ' ' for ch in seg[1:-1]) + '`')
            i = j + 1
        elif c in '\'"':
            q = c
            j = i + 1
            while j < len(src) and src[j] != q:
                if src[j] == '\\':
                    j += 1
                j += 1
            seg = src[i:j + 1]
            # 内容也挖空：'rgb(' 这种写在字符串里的括号不算函数调用
            out.append(q + ''.join('\n' if ch == '\n' else ' ' for ch in seg[1:-1]) + q)
            i = j + 1
        else:
            out.append(c)
            i += 1
    return ''.join(out)


def strip_comments(src):
    src = re.sub(r'/\*.*?\*/', _blank, src, flags=re.S)
    out = []
    for ln in src.split('\n'):
        i = ln.find('//')
        if i >= 0 and ln[:i].count("'") % 2 == 0 and ln[:i].count('"') % 2 == 0:
            ln = ln[:i]
        out.append(ln)
    return out


def brace_end(lines, start):
    j = start
    while j < len(lines) and '{' not in lines[j]:
        j += 1
        if j >= len(lines):
            return len(lines) - 1
    depth = 0
    for k in range(j, len(lines)):
        depth += lines[k].count('{') - lines[k].count('}')
        if depth <= 0 and k >= j:
            return k
    return len(lines) - 1


def collect_scopes(lines):
    """所有函数作用域：[(indent, name, start, end)]"""
    out = []
    for i, ln in enumerate(lines):
        m = FN.match(ln)
        if m:
            out.append((len(m.group(1)), m.group(2), i, brace_end(lines, i)))
            continue
        m = METHOD.match(ln)
        if m and m.group(2) not in KEYWORDS:
            out.append((len(m.group(1)), m.group(2), i, brace_end(lines, i)))
    return out


def arrow_ranges(lines):
    """「延迟执行」的函数体行范围：箭头函数 + **匿名 function 回调**。

    这些东西要等事件/回调触发才跑，里面的调用不算这个函数「立刻调用」了谁。
    不排除的话，`addEventListener('click', () => { const on = ... })`
    里的 on 会被当成顶层变量，`.then(function () { renderSign() })`
    里的 renderSign 会被当成立刻调用 —— 满屏误报。"""
    out = []
    for i, ln in enumerate(lines):
        heads = list(re.finditer(r'=>\s*\{', ln))
        # 匿名 function：`function (` 或 `function() {`（具名的会被 collect_scopes 当作用域）
        heads += list(re.finditer(r'(?<![\w$])function\s*\(', ln))
        for m in heads:
            depth = 0
            br = ln.find('{', m.end() - 1)
            if br < 0:
                continue
            for k in range(i, len(lines)):
                seg = lines[k] if k > i else lines[k][br:]
                depth += seg.count('{') - seg.count('}')
                if depth <= 0:
                    out.append((i, k))
                    break
    return out


def words(t):
    return set(re.findall(r'[A-Za-z_$][\w$]*', t))


def strip_deferred(text):
    """把箭头函数 / 嵌套函数的**函数体挖空**（保留大括号）。

    那些是「等会儿才跑」的 —— 里面的调用不算这个函数「立刻调用」了谁。
    不挖的话会把 addEventListener('click', () => { setReply(m) })
    这种也算成 bindBubbles 立刻调用了 setReply，满屏误报。"""
    out = text
    for _ in range(200):
        m = re.search(r'=\s*>\s*\{', out)
        if not m:
            break
        i = out.index('{', m.start())
        depth = 0
        done = False
        for k in range(i, len(out)):
            if out[k] == '{':
                depth += 1
            elif out[k] == '}':
                depth -= 1
                if depth == 0:
                    out = out[:i + 1] + ' ' * (k - i - 1) + out[k:]
                    done = True
                    break
        if not done:
            break
    return out


def direct_calls(text, names):
    """这个函数体里**立刻**调用了哪些同作用域函数（挖掉延迟执行的回调）"""
    t = strip_deferred(text)
    return {n for n in names if re.search(r'(?<![\w$.])' + re.escape(n) + r'\s*\(', t)}


def analyze(path):
    lines = strip_comments(strip_templates(open(path, encoding='utf-8').read()))
    global ARROWS
    ARROWS = arrow_ranges(lines)
    scopes = collect_scopes(lines)
    problems = []

    for (ind, name, a, b) in scopes:
        # 这个作用域里嵌套的其它函数（用来排除「非顶层」的行）
        inner = [(x, y) for (i2, n2, x, y) in scopes if x > a and y <= b]
        arrows = [(x, y) for (x, y) in ARROWS if x > a and y <= b]
        def is_direct(i):
            if any(x < i < y for (x, y) in inner):
                return False
            # 箭头体内部：第一行是它自己，不算「在里面」
            return all(not (x < i <= y) for (x, y) in arrows)

        # 只认正好在函数体这一层的声明（缩进 = 函数缩进 + 2）。
        # 不按缩进过滤的话，if / for 块里的块级 const 会被当成作用域顶层，
        # 于是「块里声明的 t」和「顶层的调用」被拿来比较，全是误报。
        body_indent = ind + 2
        funcs, vars_ = {}, {}
        for i in range(a + 1, b):
            if not is_direct(i):
                continue
            ln = lines[i]
            cur = len(ln) - len(ln.lstrip())
            m = FN.match(ln) or (METHOD.match(ln) if METHOD.match(ln) and METHOD.match(ln).group(2) not in KEYWORDS else None)
            if m and i != a:
                if cur == body_indent:
                    funcs[m.group(2)] = (i, brace_end(lines, i))
                continue
            m = ARROW.match(ln) or VAR.match(ln)
            if m and cur == body_indent:
                vars_[m.group(2)] = i
        if not funcs or not vars_:
            continue

        body = {f: '\n'.join(lines[x:y + 1]) for f, (x, y) in funcs.items()}

        def shadows(f, v):
            """这个函数自己声明了同名变量（含形参）吗 ——
               声明了就说明它用的是自己的那一份，跟外层的没关系。
               不判遮蔽的话，`const C = window.LWCache` 这种局部变量
               会被当成用了外层同名的 C，误报。"""
            sig = lines[funcs[f][0]]
            if re.search(r'[(,]\s*' + re.escape(v) + r'\s*[,)]', sig):
                return True
            return bool(re.search(r'(?<![\w$.])(?:const|let|var)\s+' + re.escape(v) + r'\b', body[f]))

        # 直接引用 + 立刻调用到的函数（回调里的不算；自己被遮蔽的不算）
        direct = {
            f: {v for v in vars_ if v in words(strip_deferred(body[f])) and not shadows(f, v)}
            for f in funcs
        }
        callsOf = {f: direct_calls(body[f], list(funcs)) for f in funcs}
        changed = True
        while changed:
            changed = False
            for f in funcs:
                for g in callsOf[f]:
                    if g != f and not direct[g] <= direct[f]:
                        direct[f] |= direct[g]
                        changed = True

        # 作用域顶层的调用语句：直接子行、不是声明
        calls = []
        for i in range(a + 1, b):
            if not is_direct(i):
                continue
            ln = lines[i]
            if FN.match(ln) or VAR.match(ln) or ARROW.match(ln) or METHOD.match(ln):
                continue
            for f in funcs:
                if re.search(r'(?<![\w$.])' + re.escape(f) + r'\s*\(', ln):
                    calls.append((i, f))

        for v, vline in vars_.items():
            for cline, f in calls:
                if cline < vline and v in direct[f]:
                    problems.append((name, v, vline + 1, f, cline + 1))
                    break
    return problems


# 说明：还试过两个更宽的检查，都撤掉了 ——
#   1)「调用了但整个文件里找不到声明」：误报几十处（get anim() 这种特性开关、
#      字符串里的 rgb(、第三方库的全局），要做准得写真正的词法分析器。
#   2)「函数声明落在模板字符串里」：靠正则数反引号来判断模板边界，同样不准。
# 与其留一个天天误报的工具让人不再信它，不如只留这一条验证过的。


total = 0
for path in sorted(glob.glob('public/views/*.js')) + ['public/app.js']:
    try:
        probs = analyze(path)
    except Exception as e:
        print('  !! %s 分析失败：%s' % (path, e))
        continue
    if probs:
        print('\n%s' % path)
        for scope, v, vline, fn, callline in probs:
            print('  ⚠ [%s] %s 第 %d 行才声明，但第 %d 行顶层就调了 %s()（它会用到）'
                  % (scope, v, vline, callline, fn))
        total += len(probs)

print()
if total:
    print('发现 %d 处 TDZ 风险（会抛 Cannot access ... before initialization）' % total)
    sys.exit(1)
print('✓ 没有 TDZ 风险')
