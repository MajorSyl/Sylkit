"""Gallery cover: a real desktop screenshot in a laptop and a phone screenshot in a phone, on Sylkit's
dark backdrop (same look as /public/shots/covers). Usage:
    python3 scripts/make_cover.py desktop.jpg mobile.jpg out.webp [accent_hex]
desktop: 1280x800 screenshot; mobile: 390x844 at 2x (780x1688).
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

W, H = 1280, 1000


def rounded(im, r):
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), r, fill=255)
    out = im.convert('RGBA')
    out.putalpha(m)
    return out


def shadow(canvas, box, r, blur, alpha):
    s = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(s).rounded_rectangle(box, r, fill=(0, 0, 0, alpha))
    canvas.alpha_composite(s.filter(ImageFilter.GaussianBlur(blur)))


def make(desk, mob, out, accent=(37, 88, 232)):
    bg = Image.new('RGBA', (W, H))
    d = ImageDraw.Draw(bg)
    for y in range(H):  # navy vertical gradient
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(20 + 10 * t), int(30 + 14 * t), int(52 + 18 * t), 255))
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((380, 120, 1180, 820), fill=accent + (70,))
    bg.alpha_composite(glow.filter(ImageFilter.GaussianBlur(160)))

    # Laptop
    sx, sy, sw, sh = 90, 170, 900, 563  # screen area
    shadow(bg, (sx - 40, sy - 10, sx + sw + 40, sy + sh + 70), 30, 30, 120)
    lid = Image.new('RGBA', (sw + 28, sh + 40), (14, 16, 22, 255))
    lid = rounded(lid, 22)
    bg.alpha_composite(lid, (sx - 14, sy - 22))
    ImageDraw.Draw(bg).ellipse((sx + sw // 2 - 3, sy - 14, sx + sw // 2 + 3, sy - 8), fill=(60, 64, 72, 255))
    scr = Image.open(desk).convert('RGB').resize((sw, sh), Image.LANCZOS)
    bg.alpha_composite(rounded(scr, 6), (sx, sy))
    base = Image.new('RGBA', (sw + 140, 26), (0, 0, 0, 0))
    bd = ImageDraw.Draw(base)
    bd.rounded_rectangle((0, 0, sw + 139, 25), 12, fill=(196, 200, 208, 255))
    bd.rectangle((0, 0, sw + 139, 6), fill=(226, 229, 234, 255))
    bd.rounded_rectangle(((sw + 140) // 2 - 80, 0, (sw + 140) // 2 + 80, 9), 6, fill=(170, 174, 182, 255))
    bg.alpha_composite(base, (sx - 70, sy + sh + 18))

    # Phone
    pw, ph = 300, 630
    px, py = W - pw - 70, H - ph - 70
    shadow(bg, (px - 6, py + 10, px + pw + 6, py + ph + 30), 52, 28, 150)
    body = rounded(Image.new('RGBA', (pw, ph), (12, 13, 17, 255)), 50)
    edge = ImageDraw.Draw(body)
    edge.rounded_rectangle((0, 0, pw - 1, ph - 1), 50, outline=(92, 96, 106, 255), width=3)
    bg.alpha_composite(body, (px, py))
    inset = 12
    m = Image.open(mob).convert('RGB')
    m = m.resize((pw - 2 * inset, int((pw - 2 * inset) * m.size[1] / m.size[0])), Image.LANCZOS)
    m = m.crop((0, 0, pw - 2 * inset, ph - 2 * inset))
    bg.alpha_composite(rounded(m, 40), (px + inset, py + inset))
    ImageDraw.Draw(bg).rounded_rectangle((px + pw // 2 - 46, py + 22, px + pw // 2 + 46, py + 48), 14, fill=(8, 8, 10, 255))

    bg.convert('RGB').save(out, 'WEBP', quality=82, method=6)


if __name__ == '__main__':
    acc = tuple(int(sys.argv[4][i:i + 2], 16) for i in (0, 2, 4)) if len(sys.argv) > 4 else (37, 88, 232)
    make(sys.argv[1], sys.argv[2], sys.argv[3], acc)
