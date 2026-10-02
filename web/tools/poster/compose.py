# -*- coding: utf-8 -*-
import json
from PIL import Image, ImageDraw, ImageFont

FH = '/home/tux/.local/share/fonts/HarmonyOS_Sans_SC_%s.ttf'
FE = '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'
def font(w, s): return ImageFont.truetype(FH % w, s)

BG, CARD, DARK = (253, 251, 246), (255, 255, 255), (42, 37, 31)
TEXT, MUTED, FAINT = (59, 52, 44), (107, 95, 80), (176, 166, 151)
ACCENT, LINE, SOFT = (91, 141, 239), (239, 231, 218), (247, 245, 241)

W, PAD = 1080, 64

# ---- emoji：只能渲染 109px，画完再缩 ----
_ec = {}
def emoji(ch, size):
    k = (ch, size)
    if k in _ec: return _ec[k]
    f = ImageFont.truetype(FE, 109)
    t = Image.new('RGBA', (170, 170), (0, 0, 0, 0))
    ImageDraw.Draw(t).text((10, 10), ch, font=f, embedded_color=True)
    bb = t.getbbox()
    if bb: t = t.crop(bb)
    h = max(1, int(t.height * size / t.width))
    t = t.resize((size, h), Image.LANCZOS)
    _ec[k] = t
    return t

data = json.load(open('.poster/data.json'))
surf = json.load(open('.poster/surfaces.json'))
weather = Image.open('.poster/weather.png').convert('RGB')
room = Image.open('.poster/room.png').convert('RGB')

# 先开一张足够高的画布，最后裁到实际内容
img = Image.new('RGB', (W, 5200), BG)
d = ImageDraw.Draw(img)

# ---- 页头 ----
HEAD_H = 372
d.rectangle([0, 0, W, HEAD_H], fill=DARK)
def center(y, s, f, fill):
    d.text((W / 2 - d.textlength(s, font=f) / 2, y), s, font=f, fill=fill)
center(78, '像素小镇', font('Black', 106), (255, 255, 255))
center(214, '一个在浏览器里画像素画的地方', font('Regular', 35), (197, 186, 167))
url = 'light-field.pages.dev'
tw = d.textlength(url, font=font('Medium', 31))
d.rounded_rectangle([W/2 - tw/2 - 32, 276, W/2 + tw/2 + 32, 338], radius=31, fill=(58, 51, 43), outline=ACCENT, width=2)
center(290, url, font('Medium', 31), (150, 185, 255))

y = HEAD_H + 52
f_h, f_s, f_cap = font('Bold', 49), font('Regular', 28), font('Medium', 26)

def section(ico, title):
    global y
    e = emoji(ico, 52)
    img.paste(e, (PAD, y + 4), e)
    d.text((PAD + 68, y), title, font=f_h, fill=TEXT)
    y += 74

def sub(s):
    global y
    d.text((PAD, y), s, font=f_s, fill=MUTED)
    y += 46

# ================= 1. 天气 =================
section('🌤️', '窗外天气，自己挑')
sub('8 种。雨是斜着往下赶的雨丝，雪是慢慢飘的白点')
wcols, wgap, wsize = 4, 20, (W - PAD * 2 - 20 * 3) // 4
cw, chh = weather.width / 4, weather.height / 7
side = wsize - 46          # 窗户图
cardh = 16 + side + 44     # 卡片 = 上边距 + 图 + 标签
order = [('sunny', '晴'), ('cloudy', '多云'), ('rain', '雨'), ('snow', '雪'),
         ('dawn', '清晨'), ('dusk', '黄昏'), ('night', '夜')]
for i, (key, label) in enumerate(order):
    col, row = i % wcols, i // wcols
    x0 = PAD + col * (wsize + wgap)
    y0 = y + row * (wsize + wgap)
    d.rounded_rectangle([x0, y0, x0 + wsize, y0 + cardh], radius=18, fill=CARD, outline=LINE, width=2)
    # 取第 3 帧（wxT=4）：第 1 帧雨雪刚起步，颗粒还没铺开，看着跟晴天差不多
    FRAME = 2
    src = weather.crop((int(cw * FRAME + 7), int(chh * i + 7),
                        int(cw * FRAME + cw - 7), int(chh * i + chh - 7)))
    src = src.resize((side, side), Image.NEAREST)
    img.paste(src, (x0 + (wsize - side) // 2, y0 + 16))
    d.text((x0 + wsize / 2 - d.textlength(label, font=f_cap) / 2, y0 + 16 + side + 8), label, font=f_cap, fill=MUTED)
y += 2 * cardh + wgap + 56

# ================= 2. 头像 =================
section('👾', '3888 种默认头像')
sub('按账号自动生成，每只都不一样，不用自己画')
acols, asize, agap = 12, 68, 8
for i, av in enumerate(data['avatars']):
    col, row = i % acols, i // acols
    x0, y0 = PAD + col * (asize + agap), y + row * (asize + agap)
    d.rounded_rectangle([x0, y0, x0 + asize, y0 + asize], radius=11, fill=(246, 244, 240))
    t = Image.new('RGB', (16, 16)); tp = t.load()
    for yy in range(16):
        for xx in range(16):
            q = av['px'][yy * 16 + xx]; tp[xx, yy] = (q[0], q[1], q[2])
    img.paste(t.resize((asize - 12, asize - 12), Image.NEAREST), (x0 + 6, y0 + 6))
arows = (len(data['avatars']) + acols - 1) // acols
y += arows * asize + (arows - 1) * agap + 56

# ================= 3. 家具 =================
section('🛋️', '654 件家具 · 50 种墙纸地毯')
sub('按住就能拖着摆，屋子从 16×16 扩到 32×32')
fcols, fcell, fgap = 16, 50, 8
for i, fu in enumerate(data['furniture']):
    col, row = i % fcols, i // fcols
    x0, y0 = PAD + col * (fcell + fgap), y + row * (fcell + fgap)
    d.rounded_rectangle([x0, y0, x0 + fcell, y0 + fcell], radius=9, fill=SOFT)
    art, pal = fu['art'], (fu['pal'] or data['pal'])
    aw, ah = max(len(r) for r in art), len(art)
    t = Image.new('RGB', (aw, ah), SOFT); tp = t.load()
    for yy in range(ah):
        for xx in range(len(art[yy])):
            c = art[yy][xx]
            if c == '.' or c not in pal: continue
            q = pal[c]; tp[xx, yy] = (q[0], q[1], q[2])
    sc = max(1, min((fcell - 14) // max(1, aw), (fcell - 14) // max(1, ah)))
    img.paste(t.resize((aw * sc, ah * sc), Image.NEAREST),
              (x0 + (fcell - aw * sc) // 2, y0 + (fcell - ah * sc) // 2))
frows = (len(data['furniture']) + fcols - 1) // fcols
y += frows * (fcell + fgap) + 34

d.text((PAD, y), '墙纸 / 地毯', font=font('Medium', 28), fill=MUTED)
y += 48
scols, ssize, sgap = 25, 34, 6
for i, s in enumerate(surf[:50]):
    col, row = i % scols, i // scols
    x0, y0 = PAD + col * (ssize + sgap), y + row * (ssize + sgap)
    t = Image.new('RGB', (16, 16), (255, 255, 255)); tp = t.load()
    for yy in range(16):
        for xx in range(16):
            c = data['pal'].get(s['tile'][yy][xx])
            if c: tp[xx, yy] = (c[0], c[1], c[2])
    img.paste(t.resize((ssize, ssize), Image.NEAREST), (x0, y0))
y += ((len(surf[:50]) + scols - 1) // scols) * (ssize + sgap) + 56

# ================= 4. 小屋 =================
section('🏠', '一间自己的小屋')
sub('摆家具、换墙纸、挑窗外的天气')
rside = 520
r2 = room.resize((rside, rside), Image.NEAREST)
rx = (W - rside) // 2
img.paste(r2, (rx, y))
d.rounded_rectangle([rx - 4, y - 4, rx + rside + 4, y + rside + 4], radius=8, outline=LINE, width=4)
y += rside + 76

# ================= 页脚 =================
FOOT_H = 236
d.rectangle([0, y, W, y + FOOT_H], fill=DARK)
center(y + 52, '完全免费 · 无广告 · 不要邮箱手机号', font('Bold', 43), (255, 255, 255))
center(y + 118, '浏览器打开就能画，手机也行', font('Regular', 31), (197, 186, 167))
center(y + 172, 'light-field.pages.dev', font('Medium', 35), (150, 185, 255))
y += FOOT_H

out = img.crop((0, 0, W, y))
out.save('宣传长图.png')
print('  ✓ 宣传长图.png  %d×%d  （%.1f MB）' % (out.width, out.height, len(open('宣传长图.png','rb').read())/1048576))
