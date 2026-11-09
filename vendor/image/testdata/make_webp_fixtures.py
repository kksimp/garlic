"""Writes the WebP fixtures for vendor/image/webp.ail and vp8.ail: each
NAME.webp has NAME.rgba beside it (R, G, B, A bytes, row by row) from Pillow's
libwebp decoder, and animations have NAME_fN.rgba for frame N on the canvas.
Fixture generator only; the tests are in color.ail.

    python3 vendor/image/testdata/make_webp_fixtures.py
"""
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))


def picture(w, h, seed=0):
    y, x = np.mgrid[0:h, 0:w]
    rng = np.random.default_rng(seed)
    r = (x * 255 // max(w - 1, 1)).astype(np.uint8)
    g = (y * 255 // max(h - 1, 1)).astype(np.uint8)
    b = ((x * 7 + y * 13) % 256).astype(np.uint8)
    img = np.stack([r, g, b], axis=-1)
    img[h // 4 : h // 2 + 3, w // 4 : w // 2 + 8] = [250, 30, 30]
    img[h // 2 : h - 3, w // 2 : w - 4] = [30, 30, 250]
    noise = rng.integers(0, 24, size=img.shape, dtype=np.uint8)
    return np.clip(img.astype(int) + noise, 0, 255).astype(np.uint8)


def alpha_of(w, h):
    y, x = np.mgrid[0:h, 0:w]
    a = ((x * 255) // max(w - 1, 1)).astype(np.uint8)
    a[: h // 3, : w // 3] = 0
    a[h - 5 :, :] = 255
    return a


def write(name, im, **kw):
    path = os.path.join(HERE, name + ".webp")
    im.save(path, "WEBP", **kw)
    out = Image.open(path)
    if getattr(out, "n_frames", 1) > 1:
        for i in range(out.n_frames):
            out.seek(i)
            open(os.path.join(HERE, "%s_f%d.rgba" % (name, i)), "wb").write(out.convert("RGBA").tobytes())
        out.seek(0)
    open(os.path.join(HERE, name + ".rgba"), "wb").write(out.convert("RGBA").tobytes())


W, H = 37, 29
rgb = Image.fromarray(picture(W, H), "RGB")
rgba = Image.fromarray(np.dstack([picture(W, H), alpha_of(W, H)]), "RGBA")
write("webp_ll_rgb", rgb, lossless=True, method=0)
write("webp_ll_rgb_m6", rgb, lossless=True, method=6, quality=100)
write("webp_ll_rgba", rgba, lossless=True, exact=True)
pal = Image.fromarray(picture(W, H)[:, :, :].reshape(H, W, 3) // 64 * 64, "RGB")
write("webp_ll_few_colors", pal, lossless=True, method=6)
two = Image.fromarray((np.indices((W, H)).sum(axis=0).T % 2 * 255).astype(np.uint8), "L").convert("RGB")
write("webp_ll_two_colors", two, lossless=True)
write("webp_ll_1x1", Image.new("RGBA", (1, 1), (10, 200, 30, 128)), lossless=True, exact=True)
write("webp_lossy_q75", rgb, quality=75)
write("webp_lossy_q20", rgb, quality=20, method=6)
write("webp_lossy_q100", rgb, quality=100, method=6)
write("webp_lossy_sharp", rgb, quality=60, sharpness=7, filter_strength=80) if False else None
write("webp_lossy_alpha", rgba, quality=70, alpha_quality=100)
write("webp_lossy_alpha_filtered", rgba, quality=70, alpha_quality=60, method=6)
big = Image.fromarray(picture(150, 70, 3), "RGB")
write("webp_lossy_150x70", big, quality=80, method=6, segments=4)
write("webp_lossy_1x1", Image.new("RGB", (1, 1), (200, 10, 90)), quality=90)
frames = [Image.fromarray(np.dstack([picture(40, 30, s), alpha_of(40, 30) if s else np.full((30, 40), 255, np.uint8)]), "RGBA") for s in range(3)]
frames[0].save(os.path.join(HERE, "webp_anim_lossless.webp"), "WEBP", save_all=True, append_images=frames[1:], duration=[40, 80, 120], lossless=True, exact=True)
frames[0].save(os.path.join(HERE, "webp_anim_lossy.webp"), "WEBP", save_all=True, append_images=frames[1:], duration=[40, 80, 120], quality=70)
for n in ("webp_anim_lossless", "webp_anim_lossy"):
    out = Image.open(os.path.join(HERE, n + ".webp"))
    for i in range(out.n_frames):
        out.seek(i)
        open(os.path.join(HERE, "%s_f%d.rgba" % (n, i)), "wb").write(out.convert("RGBA").tobytes())
    out.seek(0)
    open(os.path.join(HERE, n + ".rgba"), "wb").write(out.convert("RGBA").tobytes())

# AVIF: container fixtures (the expected .rgba is libavif's decode through Pillow).
for name, im, kw in [
    ("avif_rgb", rgb, dict(quality=60)),
    ("avif_rgba", rgba, dict(quality=60)),
]:
    p = os.path.join(HERE, name + ".avif")
    im.save(p, "AVIF", **kw)
    open(os.path.join(HERE, name + ".rgba"), "wb").write(Image.open(p).convert("RGBA").tobytes())
