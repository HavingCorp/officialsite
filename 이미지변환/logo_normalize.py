#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HAVING 브랜드 이미지 일괄 규격화  (로고 / SKU 제품컷)
======================================================

[로고 모드]  기본
  캔버스   800 x 400 (2:1), 투명 PNG
  안전영역 720 x 320 (좌우 40 / 상하 40)
  배치     비율 유지 축소, 세로 가운데 / 가로 왼쪽
  출력     {브랜드id}-logo.png

[SKU 모드]  --sku
  캔버스   900 x 900 (1:1), 흰 배경 JPG
  안전영역 720 x 720 (사방 90)
  배치     비율 유지 축소, 가로세로 가운데
  출력     원본 파일명 그대로 (minoxell-01.jpg 등)

사용법
------
  로고:  원본을 raw/ 에 넣고 (파일명 = 브랜드 id)
           python3 logo_normalize.py raw out
         -> out/minoxell-logo.png

  SKU :  원본을 sku_raw/ 에 넣고 (파일명 = 최종 이름, 예: minoxell-01.jpg)
           python3 logo_normalize.py sku_raw sku_out --sku
         -> sku_out/minoxell-01.jpg

필요 패키지: pillow  (pip install pillow)
"""
import sys, os
from PIL import Image

# 로고 규격
CANVAS_W, CANVAS_H = 800, 400
PAD_X, PAD_Y = 40, 40
SAFE_W, SAFE_H = CANVAS_W - PAD_X * 2, CANVAS_H - PAD_Y * 2   # 720 x 320
ALIGN_X = "left"      # left | center

# SKU 제품컷 규격
SKU_CANVAS = 900
SKU_PAD = 90
SKU_SAFE = SKU_CANVAS - SKU_PAD * 2                            # 720 x 720

BG_TOLERANCE = 12     # 흰 배경 제거 허용 오차


def load_rgba(path):
    im = Image.open(path)
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    return im


def strip_white_bg(im, tol=BG_TOLERANCE):
    """흰 배경 JPG 등을 투명 처리 (이미 투명 PNG면 그대로)."""
    alpha = im.split()[-1]
    if alpha.getextrema()[0] < 255:
        return im  # 이미 투명 영역 있음
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= 255 - tol and g >= 255 - tol and b >= 255 - tol:
                px[x, y] = (r, g, b, 0)
    return im


def trim(im):
    """투명 여백 잘라내기."""
    bbox = im.split()[-1].getbbox()
    return im.crop(bbox) if bbox else im


def normalize(src, dst):
    im = load_rgba(src)
    im = strip_white_bg(im)
    im = trim(im)
    if im.width == 0 or im.height == 0:
        raise ValueError("빈 이미지")

    # 안전영역에 꽉 맞게 축소(비율 유지). 확대는 하되 원본의 2배까지만.
    scale = min(SAFE_W / im.width, SAFE_H / im.height)
    scale = min(scale, 2.0)
    nw, nh = max(1, int(round(im.width * scale))), max(1, int(round(im.height * scale)))
    im = im.resize((nw, nh), Image.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    x = PAD_X if ALIGN_X == "left" else (CANVAS_W - nw) // 2
    y = (CANVAS_H - nh) // 2
    canvas.paste(im, (x, y), im)
    canvas.save(dst, "PNG", optimize=True)
    return im.size, (nw, nh)


def normalize_sku(src, dst):
    """제품컷: 흰 배경 900x900 캔버스, 안전영역 720x720, 가운데 정렬."""
    im = load_rgba(src)
    im = strip_white_bg(im)
    im = trim(im)
    if im.width == 0 or im.height == 0:
        raise ValueError("빈 이미지")
    scale = min(SKU_SAFE / im.width, SKU_SAFE / im.height)
    scale = min(scale, 2.0)
    nw, nh = max(1, int(round(im.width * scale))), max(1, int(round(im.height * scale)))
    im = im.resize((nw, nh), Image.LANCZOS)

    canvas = Image.new("RGBA", (SKU_CANVAS, SKU_CANVAS), (255, 255, 255, 255))
    canvas.paste(im, ((SKU_CANVAS - nw) // 2, (SKU_CANVAS - nh) // 2), im)
    canvas.convert("RGB").save(dst, "JPEG", quality=88, optimize=True)
    return (nw, nh)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    sku_mode = "--sku" in sys.argv
    src_dir = args[0] if len(args) > 0 else ("sku_raw" if sku_mode else "raw")
    out_dir = args[1] if len(args) > 1 else ("sku_out" if sku_mode else "out")
    if not os.path.isdir(src_dir):
        print(f"원본 폴더가 없습니다: {src_dir}")
        return
    os.makedirs(out_dir, exist_ok=True)

    exts = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff")
    files = sorted(f for f in os.listdir(src_dir) if f.lower().endswith(exts))
    if not files:
        print(f"{src_dir}/ 에 이미지가 없습니다. (svg는 png로 먼저 내보내세요)")
        return

    if sku_mode:
        print(f"[SKU] 캔버스 {SKU_CANVAS}x{SKU_CANVAS} / 안전영역 {SKU_SAFE}x{SKU_SAFE} / 흰 배경")
    else:
        print(f"[로고] 캔버스 {CANVAS_W}x{CANVAS_H} / 안전영역 {SAFE_W}x{SAFE_H} / 정렬 {ALIGN_X}")
    print("-" * 62)
    ok = 0
    for f in files:
        base = os.path.splitext(f)[0].strip().lower().replace(" ", "-").replace("_", "-")
        try:
            if sku_mode:
                dst = os.path.join(out_dir, f"{base}.jpg")
                nw, nh = normalize_sku(os.path.join(src_dir, f), dst)
                print(f"  {f:28s} -> {base}.jpg   배치 {nw}x{nh}")
            else:
                dst = os.path.join(out_dir, f"{base}-logo.png")
                (tw, th), (nw, nh) = normalize(os.path.join(src_dir, f), dst)
                ratio = tw / th if th else 0
                print(f"  {f:28s} -> {base}-logo.png   원본비 {ratio:5.2f}:1  배치 {nw}x{nh}")
            ok += 1
        except Exception as e:
            print(f"  {f:28s} -> 실패: {e}")
    print("-" * 62)
    print(f"완료: {ok}/{len(files)}  ->  {out_dir}/")
    print("이 파일들을 assets/brands/ 에 업로드하세요.")


if __name__ == "__main__":
    main()
