# 宣传长图生成器

从**代码里的真实数据**渲染宣传长图，不依赖浏览器截图。
（家具、头像、墙纸地毯、天气窗、小屋 —— 全是 town.js / _avatar.js / _townitems.js 里的原始素材）

## 用法

```bash
cd web/tools/poster
node dump.mjs      # 导出头像 + 家具 → data.json
node surf.mjs      # 导出墙纸地毯图案 → surfaces.json
node room.mjs      # 渲染小屋 → room.png
node ../../tools/preview-weather.mjs weather.png 16   # 渲染天气窗
python3 compose.py # 拼成长图 → 宣传长图.png
```

字体用的是系统里的 **HarmonyOS Sans SC**（标题 Black / 正文 Regular）
和 **Noto Color Emoji**。

## 注意

emoji 字体是位图字体，**只能渲染 109px**，脚本里是画完再缩放的。
直接用小字号调 `ImageFont.truetype(NotoColorEmoji, 48)` 会报 `invalid pixel size`。
