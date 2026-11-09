# AVIF in Garlic: state and plan

Goal: `<img>`, CSS backgrounds and `new Image()` probes show AVIF like Chrome.

## Done
- `vendor/image/heif.ail`: HEIF/ISOBMFF parse (primary item, `ispe`, `av1C`, `colr`, `irot`/`imir`, alpha `auxl`, `grid` tiles). `avif_dims` gives the size, so size-based probes (Garlic's `img_settle`) report AVIF as loadable.
- `vendor/image/av1hdr.ail`: OBU framing, sequence header, key-frame header (tiles, quant, segmentation, delta q/lf, loop filter, CDEF, restoration params), tile-group split. Never compiled yet.
- `vendor/image/av1tab.ail`, `av1cdf.ail`: constant tables and default CDFs extracted from dav1d (BSD-2-Clause) by script; numbering is dav1d's (BlockSize 0 = 128x128 ... 21 = 4x4; TxfmSize 0..4 square then 5..18 rectangular; TxfmType 0..15 + WHT; IntraPredMode DC=0 ... PAETH=12, CFL=13).

## To do (each piece is independent given the contracts below)
1. **Entropy + tile decode** (`av1tile.ail`): symbol decoder (spec 8.2, CDFs stored inverted like dav1d: n values then a counter), partition tree, intra block mode info with above/left contexts, tx size, coefficient reading (dav1d `decode_coefs`, scans in `AV1_SCAN`), per-tile CDF init by `base_q_idx` context. Output per block: modes, tx sizes, tx types and dequantised coefficients, handed to 2 and 3.
2. **Inverse transforms** (`av1itx.ail`): DCT 4..64, ADST 4/8/16, flip, identity, WHT; row/column stages with intermediate clamping and rounding per spec 7.13. Input: coefficient block (dav1d column-major `cf[x * h + y]`), tx size, tx type, bit depth. Output: residual added into a plane.
3. **Intra prediction** (`av1pred.ail`): DC, V, H, directional (edge filter and upsampling), smooth, paeth, CFL, filter-intra; edge availability. Palette and intrabc: report `Unsupported` for now.
4. **Post filters** (`av1post.ail`): deblocking, CDEF, loop restoration (Wiener, self-guided), superres (optional). Operate on whole planes after decode.
5. **Assembly** (`avif.ail`): YUV to RGBA (matrix from `colr`/sequence header, range), 8/10/12 bit to 8 bit, alpha plane from the auxiliary item, grid stitching, `irot`/`imir`; `color.ail` already dispatches to `avif`.
Tests: `vendor/image/testdata/avif_*.avif` with expected `.rgba` from libavif through Pillow (`make_webp_fixtures.py`); add `@test`s in `color.ail`.

Licence: dav1d is BSD-2-Clause; keep its copyright in the table files' headers and NOTICE.

## Pinned interfaces (shared by the three lanes; change only by agreement)
Planes are `List[int]` per plane (`Av1Plane` = `w`, `h`, `stride`, `pix List[int]`), values at the sequence bit depth. A frame is `Av1Frame`: `planes List[Av1Plane]` (1 or 3), `bd int`, `sub_x`, `sub_y`, `mono bool`.
- `av1itx.ail`: `pub fn av1_itx_add(mut p Av1Plane, x int, y int, cf List[int], tx int, ttype int, eob int, bd int)`. `tx` is TxfmSize 0..18, `ttype` is the AV1 tx type 0..15 (DCT_DCT=0, ADST_DCT=1, DCT_ADST=2, ADST_ADST=3, ... IDTX=9, V_DCT=10 ... as in dav1d), `cf` is dequantised column-major `cf[x*h+y]`; the residual is added into `p` at (x, y) and clamped to the bit depth.
- `av1pred.ail`: `pub fn av1_pred(mut p Av1Plane, x int, y int, w int, h int, mode int, ctx PredCtx)`; `PredCtx` holds angle delta, availability flags (have_left/top/topright/bottomleft), filter-intra mode, CFL alphas and the luma source, smooth-edge filter flag, `bd`. Modes: dav1d IntraPredMode 0..13.
- `av1post.ail`: `pub fn av1_post(mut f Av1Frame, hdr Av1Hdr, info BlockInfo)`; `BlockInfo` is the per-4x4 grid the tile decoder fills: `bsize`, `tx` (luma and chroma), `skip`, `mode`, `qidx`, `lf_level` per 4x4, plus CDEF idx and restoration units from the tile data.
- `avif.ail`: `pub fn avif(d) Rgba ! ImageError` calls `av1_decode(obus List[int]) Av1Frame ! ImageError` (mine, `av1tile.ail`) per item.

## Lane (c): post filters and assembly (written, not yet compiled)
- `av1frame.ail` defines `Av1Plane`, `Av1Frame`, `Av1Lr` and `BlockInfo` (the pinned shapes; `BlockInfo` fields are documented there). The tile decoder fills `BlockInfo` and calls `av1_post(mut f, hdr, info)?` at the end of `av1_decode`, so `av1_decode` returns the finished frame. `av1_post` returns `! ImageError` (super-resolution is `Unsupported`).
- Buffers: each `Av1Plane.pix` covers the whole 4x4 grid (`mi_cols * 4 >> sub_x` wide), not only the visible size, because deblocking and CDEF read to the grid edge.
- `BlockInfo.tx_y`/`tx_c` are the TxfmSize (dav1d numbering) of the transform block covering each 4x4 (chroma on the chroma 4x4 grid). Intra only, so `skip`, `seg`, `dlf`, `cdef_idx` and `lr` are all the post filters need; block sizes and modes are not.
- `av1post.ail`: deblocking (7.14, dav1d's arithmetic), CDEF (7.15), loop restoration with stripes (7.17, Wiener and self-guided). Loop-restoration unit kinds: 0 none, 1 Wiener, 2 self-guided; coefficients as in `Av1Lr`.
- `avif.ail`: `av1_decode` per item or grid tile, chroma upsampling and YUV to RGB exactly as libavif does for 8-bit (libyuv fixed point; checked bit-exact in a Python model against Pillow's libavif output for 4:2:0, 4:2:2, 4:4:4, grey, limited range, odd and even sizes), alpha item, `prem`, `irot`/`imir`. Deeper than 8 bits is reduced to 8 first. Not done: alpha that is itself a grid, `clap`, film grain, super-resolution, `imir` axis meaning unverified against a file.
- Fixtures: `make_avif_fixtures.py` writes `avif_444`, `avif_422`, `avif_limited`, `avif_gray`, `avif_q20`, `avif_q95`, `avif_alpha_444`, `avif_alpha_premul`, `avif_160x96`, `avif_even_64x48` with libavif's decode as `.rgba`; tests are in `color.ail`.

