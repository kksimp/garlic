"""Writes the extra AVIF fixtures for vendor/image/avif.ail: each NAME.avif has
NAME.rgba beside it (R, G, B, A bytes, row by row) from libavif through Pillow.
`avif_rgb` and `avif_rgba` come from make_webp_fixtures.py. Fixture generator
only; the tests are in color.ail.

    python3 vendor/image/testdata/make_avif_fixtures.py
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
    p = os.path.join(HERE, name + ".avif")
    im.save(p, "AVIF", **kw)
    open(os.path.join(HERE, name + ".rgba"), "wb").write(Image.open(p).convert("RGBA").tobytes())


W, H = 37, 29
rgb = Image.fromarray(picture(W, H), "RGB")
rgba = Image.fromarray(np.dstack([picture(W, H), alpha_of(W, H)]), "RGBA")
write("avif_444", rgb, quality=60, subsampling="4:4:4")
write("avif_422", rgb, quality=60, subsampling="4:2:2")
write("avif_limited", rgb, quality=60, range="limited")
write("avif_gray", rgb.convert("L"), quality=60)
write("avif_q20", rgb, quality=20)
write("avif_q95", rgb, quality=95)
write("avif_alpha_444", rgba, quality=70, subsampling="4:4:4")
write("avif_alpha_premul", rgba, quality=90, alpha_premultiplied=True)
write("avif_160x96", Image.fromarray(picture(160, 96, 5), "RGB"), quality=50)
write("avif_even_64x48", Image.fromarray(picture(64, 48, 7), "RGB"), quality=40)
