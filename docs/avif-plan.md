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
