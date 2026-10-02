# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import os

FH = '/home/tux/.local/share/fonts/HarmonyOS_Sans_SC_%s.ttf'
FE = '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'
def font(w, s): return ImageFont.truetype(FH % w, s)

BG, CARD, DARK = (250, 248, 244), (255, 255, 255), (36, 31, 26)
TEXT, MUTED, LINE, ACCENT = (59, 52, 44), (107, 95, 80), (233, 225, 213), (91, 141, 239)
SHOT = '/home/tux/编程/光域/ui-shots'

_ec = {}
def emoji(ch, size):
    k = (ch, size)
    if k in _ec: return _ec[k]
    f = ImageFont.truetype(FE, 109)
    t = Image.new('RGBA', (170, 170), (0, 0, 0, 0))
    ImageDraw.Draw(t).text((10, 10), ch, font=f, embedded_color=True)
    bb = t.getbbox()
    if bb: t = t.crop(bb)
    t = t.resize((size, max(1, int(t.height * size / t.width))), Image.LANCZOS)
    _ec[k] = t
    return t

def rounded(im, r):
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.width - 1, im.height - 1], radius=r, fill=255)
    out = im.convert('RGBA')
    out.putalpha(m)
    return out

PAGES = [
    ('paint',   '画板',   '三种画法，16 / 32 / 64 三种尺寸'),
    ('gallery', '社区',   '看别人的作品，点赞、评论、翻老画'),
    ('town',    '小镇',   '每家一间屋，点谁家就去谁家串门'),
    ('home',    '我的小屋', '摆家具、换墙纸、挑窗外的天气'),
    ('avatar',  '画头像',  '自己画，或一键换成系统默认的'),
    ('mine',    '我的',   '签到、任务、成就、作品都在这里'),
    ('user',    '画师主页', '去别人主页看他画了什么'),
    ('changelog', '更新日志', '每次更新都有记录'),
]

# ============ 手机版长图 ============
def phone(scale_w=430):
    W, PAD = 1080, 64
    COLS, GAP = 2, 40
    cw = (W - PAD * 2 - GAP) // COLS
    f_h, f_s, f_cap = font('Bold', 46), font('Regular', 26), font('Bold', 30)
    f_ph = font('Medium', 30)

    imgs = []
    for key, name, desc in PAGES:
        im = Image.open(os.path.join(SHOT, f'{key}-手机.png')).convert('RGB')
        im = im.resize((cw, int(im.height * cw / im.width)), Image.LANCZOS)
        imgs.append((im, name, desc))

    HEADS = 372
    row_h = imgs[0][0].height + 62
    rows = (len(imgs) + COLS - 1) // COLS
    FOOT = 236
    H = HEADS + 40 + rows * (row_h + 34) + FOOT
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)

    d.rectangle([0, 0, W, HEADS], fill=DARK)
    def ctr(y, s, f, fill, x=W/2):
        d.text((x - d.textlength(s, font=f) / 2, y), s, font=f, fill=fill)
    ctr(78, '像素小镇', font('Black', 106), (255, 255, 255))
    ctr(214, '一个在浏览器里画像素画的地方', font('Regular', 35), (197, 186, 167))
    url = 'light-field.pages.dev'
    tw = d.textlength(url, font=font('Medium', 31))
    d.rounded_rectangle([W/2-tw/2-32, 276, W/2+tw/2+32, 338], radius=31, fill=(52, 45, 38), outline=ACCENT, width=2)
    ctr(290, url, font('Medium', 31), (150, 185, 255))
    ctr(HEADS - 0, '', f_s, MUTED)

    y = HEADS + 40
    for k, (im, name, desc) in enumerate(imgs):
        c, r = k % COLS, k // COLS
        x0 = PAD + c * (cw + GAP)
        y0 = y + r * (row_h + 34)
        # 手机边框
        d.rounded_rectangle([x0 - 8, y0 - 8, x0 + cw + 8, y0 + im.height + 8], radius=26, fill=(58, 51, 43))
        img.paste(rounded(im, 18), (x0, y0), rounded(im, 18))
        d.text((x0, y0 + im.height + 20), name, font=f_cap, fill=TEXT)
        d.text((x0 + d.textlength(name, font=f_cap) + 14, y0 + im.height + 26), desc, font=f_s, fill=MUTED)
    y += rows * (row_h + 34)

    d.rectangle([0, H - FOOT, W, H], fill=DARK)
    ctr(H - FOOT + 52, '完全免费 · 无广告 · 不要邮箱手机号', font('Bold', 43), (255, 255, 255))
    ctr(H - FOOT + 118, '手机、电脑都能用，浏览器打开就画', font('Regular', 31), (197, 186, 167))
    ctr(H - FOOT + 172, url, font('Medium', 35), (150, 185, 255))
    img.save('宣传长图-手机.png')
    print('  ✓ 宣传长图-手机.png  %d×%d' % img.size)

# ============ 电脑版长图 ============
# 应用本身的 max-width 是 460px，所以「桌面版」实际上就是手机界面居中显示。
# 与其堆成一万像素的长条，不如排成两栏，一屏能看全。
def desktop():
    W, PAD = 1920, 80
    COLS, GAP = 2, 36
    cw = (W - PAD * 2 - GAP) // COLS
    f_cap, f_s = font('Bold', 34), font('Regular', 26)

    rows = []
    for key, name, desc in PAGES:
        im = Image.open(os.path.join(SHOT, f'{key}-桌面.png')).convert('RGB')
        im = im.resize((cw, int(im.height * cw / im.width)), Image.LANCZOS)
        rows.append((im, name, desc))

    HEADS, FOOT = 430, 250
    rowh = rows[0][0].height + 62
    nrow = (len(rows) + COLS - 1) // COLS
    H = HEADS + 34 + nrow * (rowh + 26) + FOOT
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, HEADS], fill=DARK)
    def ctr(y, s, f, fill):
        d.text((W/2 - d.textlength(s, font=f) / 2, y), s, font=f, fill=fill)
    ctr(88, '像素小镇', font('Black', 124), (255, 255, 255))
    ctr(250, '一个在浏览器里画像素画的地方', font('Regular', 40), (197, 186, 167))
    url = 'light-field.pages.dev'
    tw = d.textlength(url, font=font('Medium', 36))
    d.rounded_rectangle([W/2-tw/2-38, 322, W/2+tw/2+38, 394], radius=36, fill=(52, 45, 38), outline=ACCENT, width=3)
    ctr(338, url, font('Medium', 36), (150, 185, 255))

    y = HEADS + 34
    for k, (im, name, desc) in enumerate(rows):
        c, r = k % COLS, k // COLS
        x0 = PAD + c * (cw + GAP)
        y0 = y + r * (rowh + 26)
        d.rounded_rectangle([x0 - 8, y0 - 8, x0 + cw + 8, y0 + im.height + 8], radius=18, fill=(58, 51, 43))
        img.paste(rounded(im, 11), (x0, y0), rounded(im, 11))
        d.text((x0 + 4, y0 + im.height + 20), name, font=f_cap, fill=TEXT)
        d.text((x0 + d.textlength(name, font=f_cap) + 16, y0 + im.height + 28), desc, font=f_s, fill=MUTED)

    d.rectangle([0, H - FOOT, W, H], fill=DARK)
    ctr(H - FOOT + 54, '完全免费 · 无广告 · 不要邮箱手机号', font('Bold', 46), (255, 255, 255))
    ctr(H - FOOT + 128, '手机优先设计，电脑上居中显示', font('Regular', 32), (197, 186, 167))
    ctr(H - FOOT + 184, url, font('Medium', 38), (150, 185, 255))
    img.save('宣传长图-电脑.png')
    print('  ✓ 宣传长图-电脑.png  %d×%d' % img.size)

phone()
desktop()
