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

## Lane (b) notes: transforms and intra prediction (`av1itx.ail`, `av1pred.ail`, `av1plane.ail`)
- `Av1Plane` (with `Av1Frame`) lives in `av1frame.ail`, owned by lane (c). Buffers must be padded past the visible size; writes outside the buffer are dropped, reads of neighbours use the 4-aligned visible size like dav1d.
- `av1_itx_add`: `cf` is column-major with column height `min(h, 32)` (`cf[xx * sh + yy]`), so 64-point sides carry only 32 coefficients. `eob` is the last scan position (0 = DC only; any other value is exact, only slower). `ttype` 16 = lossless WHT (4x4 only). `cf` is not cleared.
- `av1_pred`: `PredCtx` (build with `av1_predctx(bd)`) has `angle` (delta -3..3), `have_left/top/topright/bottomleft`, `filt` (-1 or 0..4), `smooth_nb`, `edge_filter` (sequence header flag), `alpha` + `ac` for CFL, `bd`. For CFL call `av1_cfl_ac(luma, lx, ly, cw, ch, ssx, ssy, wpad, hpad)` first and pass its result as `ac`; `mode` 13 then predicts with the DC of the available edges.
- Both are translations of dav1d (BSD-2-Clause); the 1-D transform kernels were checked against float DCT/ADST in a Python model. Nothing has been compiled or run yet: first step is `ail fmt` and `ail check` on a Kaleb machine.
