# 设计规范图生成器

把站点的**全部 UI 单元**（按钮 / 芯片 / 标签 / 卡片 / 输入 …）
和**全部像素素材**（头像 / 家具 / 墙纸 / 天气 / 小屋）渲染成一张设计规范长图。

关键在于：**组件用的是站点真实 CSS 类名**，不是照着抄的。
`collect.mjs` 把 `index.html` 的 `<style>` 和每个视图的 `css:` 字段抽出来，
拼成一个 256 KB 的样式表，规范页直接加载它 —— 所以渲染出来的就是线上真实的样子。

## 尺寸

**手机宽 750**（渲染时 `--force-device-scale-factor=3` → 输出 2250 宽）。

一开始做成 1400 宽的桌面版，但发论坛主要用手机看，宽图在手机上会糊成一团，
所以整套改成了手机尺寸、竖向长图。

## 按段落切分

不要按 1/3 硬切 —— 会切穿段落。用「测量」拿到每段真实位置再切：

```bash
# 在 spec.html 里注入测量脚本（把每段 offsetTop/offsetHeight 写进 document.title）
chromium --headless --dump-dom --window-size=750,9000 file://.../probe.html \
  | grep -oE "PROBE:[^<]*"
```

输出形如 `默认头像 · 3888 种|227|479`，然后按这些边界裁。
裁完**给每张都接上页脚**（从最后一张裁出来复用），否则第 1、2 张结尾是断的。

## 用法

```bash
node web/tools/design-spec/collect.mjs   # → .spec/all.css
node web/tools/design-spec/build.mjs     # → .spec/spec.html
chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --user-data-dir=/tmp/prof --virtual-time-budget=12000 \
  --force-device-scale-factor=2 --window-size=1400,9000 \
  --screenshot=spec.png file://$PWD/.spec/spec.html
```

## 踩过的坑（都写进代码注释了）

1. **站点的 `body` 是 `display:flex` 居中**（为了把 460px 的应用放屏幕中间）。
   直接拿来渲染，内容会被推到 9000px 视口正中，顶部空一大片。
   → 规范页开头必须硬覆盖 `html, body { display:block !important; ... }`

2. **布局类名要加前缀**。站点里也有 `.page`、`.row`，撞上就乱。
   → 规范页自己的类全用 `sp-` 前缀。

3. **抽 `drawWindow` 时必须补 `const ROOM = 16` 和 `let wxT = 4`**。
   漏了会 `ReferenceError`，而且是在循环里抛 —— 天气和像素单元两段直接全空白，
   前面几段却正常，很容易误判成「这两段没写」。

4. **同一段代码不要抽两遍**。`windowRect` / `drawWindow` / `SKY` 在 `winCode` 里已经有了，
   `roomCode` 再放一遍会 `already been declared`，整个脚本不执行。

5. **画网格别用 `stroke()`**。1px 线在 16×16 的小画布上会被抗锯齿抹掉。
   改成 `fillRect` 逐像素填，而且要按尺寸取间隔 —— 16×16 上每像素都画线会糊成一块纯色。

6. **`NotoColorEmoji` 是位图字体，只能渲染 109px**，直接用小字号会报
   `invalid pixel size`，得画完再缩。

## 看生成结果时

用 `--window-size` 的高度要够，但**别用「最后一行非背景」判断内容底部** ——
页面底部的空白会骗过它，裁出一大段空的。找**页脚的深色横条**更准。
