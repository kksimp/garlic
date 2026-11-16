# Garlic: a web browser written in AIL

> **Non-normative design note**, 2026-10-20. The designer asked for a browser
> written entirely in AIL, named Garlic, that the browser itself or an AI agent
> driving it is "hyper-aware of what's on screen". This note covers the
> architecture, the first scope, the agent-facing page model and the
> dependencies. Code lives in [`tools/garlic/`](../../tools/garlic/).

## Name

A preliminary search (2026-10-20, web search only: the USPTO, WIPO, EUIPO
registers and domain checks were unreachable from the build container) found
no web browser named Garlic and no software trademark for the word. Other
software uses it: GarlicOS (a retro-handheld OS), an AI advertising platform,
restaurant-stock and recipe apps, and a molecular viewer packaged in Debian.
"Garlic routing" is I2P's anonymity technique. This is **not legal
clearance**. The designer chose (2026-10-20) to keep the name with no
further check; it stays an internal tool until they decide otherwise.

## Goals

1. **Written in AIL**, on the standard library, no third-party engine
   (ADR 0009, ADR 0010). Ported algorithms and test data must be
   Apache-2.0-compatible (ADR 0510); the HTML and CSS algorithms are written
   from the WHATWG and W3C specifications.
2. **Agent-first.** Every frame the browser draws is also a structured page
   model an agent can read and act on, with no screenshots and no OCR: the
   browser knows what it drew and where, because it drew it.
3. **Useful early.** Each milestone is a browser someone would use for
   something.

## Architecture

The pipeline is the classic one, with one addition: the layout output is kept
as data and exposed, not only painted.

```
url ─► fetch (std.net) ─► bytes ─► decode ─► HTML tokenizer ─► tree builder ─► DOM
                                                                      │
                     CSS (UA sheet, <style>, style=) ─► cascade ──────┤
                                                                      ▼
                                   layout (boxes, lines, positions) ─► paint ─► std.ui window
                                                  │
                                                  └─► page model (roles, names, rects,
                                                      actions) ─► agent: --json, panel
```

| Stage | Module | First milestone | Later |
|---|---|---|---|
| Fetch | `std.net` | `net.request_bytes` over in-house TLS 1.3 (ADR 0360), which follows redirects; `Accept-Encoding: gzip, deflate` | cookies (with the JS engine's jar), HTTP/2 |
| Decode | `str` | gzip and deflate undone; charset from `Content-Type`, then a `<meta charset>` in the first 1024 bytes, then UTF-8 when valid and windows-1252 when not; UTF-8 and windows-1252 (with its aliases `iso-8859-1`, `us-ascii`) decoded | other legacy charsets |
| Tokenize | `html` | WHATWG tokenizer: data, tags, attributes (quoted, unquoted, bare), comments, doctype, raw text (`script`, `style`), escapable raw text (`title`, `textarea`), character references (numeric and a named subset) | the full named-reference table, every parse-error state |
| Tree | `html` | simplified tree construction: implied `html`/`head`/`body`, void elements, implied end tags (`p`, `li`, `dt`, `dd`, `option`, `tr`, `td`, `th`), end tags close up to the matching open element | adoption agency, foster parenting, templates, foreign content (SVG, MathML) |
| Style | `css` | a fixed user-agent model (block vs inline elements, headings, `pre`, hidden elements) plus author CSS from `<style>`, linked sheets and their leading `@import` rules (64 sheets at most, each address fetched once, `disabled` and `alternate` links and print-only sheets skipped, imports 4 deep with their media queries; a link after a `<style>` element overrides it, one between two `<style>` elements still loses to the later) and `style=`; `@media` and `media=` by the window's width at 8 CSS pixels per cell (`min-width`, `max-width`, ranges, `px`/`em`/`rem`; a dark screen without hover): type, `#id`, `.class` (with `\` escapes such as `.md\:flex`), `[attr]` and `[attr=~|^$*v]`, `:not()`, `:first-child`, `:last-child`, `:only-child`, `:nth-child()` and the `-last-` and `-of-type` forms, `:empty`, `:checked`, `:disabled`, `:enabled`, `:link`, the descendant, `>`, `+` and `~` combinators, specificity, order, `!important`; `display` (`none`, block or inline), `visibility: hidden`, `font-weight`, `font-style`, `text-transform: uppercase`, `white-space: pre` | dynamic pseudo-classes (`:hover`, `:focus`; a static page never matches them, so the rule is dropped), `:is`, `:where`, `:has`, pseudo-elements, `@supports`, colors and margins on cells, then the box model in pixels |
| Layout | `page` | text cells: block flow, inline runs, whitespace collapsing, word wrap to the window's width, lists, block quotes, `pre`; data tables (one line of text and links per cell, no `colspan`, fits the width) as aligned columns, others as cells joined by ` | ` | CSS box model on the cell grid, then pixels (needs a pixel layer) |
| Paint | `std.ui` | the text-cell window (`put_styled`), colors per run, link highlighting | pixels, images, fonts (see Dependencies) |
| Script | none | no JavaScript (decision pending with the designer) | see below |

### Why text cells first

`std.ui` is a text-cell window today (ADR 0177) and no lane covers pixels,
images or font rendering. Text-mode browsers (Lynx, w3m) show that a
cell-grid browser is genuinely useful for documentation, Wikipedia, news,
search results and forms. Rendering into cells also keeps layout exact and
testable: a page renders to a list of text rows that a test compares, the
way the editor's screen does (ADR 0181).

## First milestone (built with this note)

`./ail run tools/garlic URL|FILE`:

- **Fetch and follow**: `http`, `https` and local files (redirects followed
  by `std.net`); relative links resolved against the page URL (RFC 3986).
- **Read**: headings, paragraphs, lists, block quotes, `pre`, horizontal
  rules, simple tables and inline emphasis, wrapped to the window width.
  Links are numbered `[3]`, and the title is in the window title.
- **Navigate**: Tab and Shift-Tab move between links, Enter or a click
  follows, Backspace goes back and Alt-Right forward (the last 16 pages left are kept, tree and scroll place, so neither fetches), Up/Down/PageUp/PageDown/Home/End and the
  wheel scroll, `g` opens a URL, `/` finds text (`n` again), `r` reloads,
  `q` quits.
- **Headless**: `--print` writes the rendered page as text; `--json` writes
  the page model (below); `--links` lists the links; `--follow N` and
  `--find TEXT` act first; `--width N` and `--height N` set the size. Tests
  run headless.
- **Error pages**: a 4xx or 5xx response is shown as the server sent it
  (bot checks and error pages have their own content); the status goes to
  the status line (`HTTP status 403`), and only an empty body gets Garlic's
  own page.
- **Timings**: `--timings` (or `GARLIC_TIMINGS=1`) prints where the last
  load's time went to standard error, one `timings: NAME VALUE` line each:
  `nav.total` (from the start of the load to the pixel layout after its
  last step in the window, or to the end of the headless run), then the
  phases that ran, in milliseconds, in load order (`fetch.document`,
  `html.parse`, `paint.first` (the first frame's sheets and layout, window
  only), `fetch.scripts`, `fetch.modules`, `script.run`, `fetch.replies`,
  `fetch.sheets`, `css.parse` of linked sheets, `layout.cells`,
  `fetch.images` with their decoding, `layout.pixels` with the display list,
  `fetch.favicon`), then counters: `first.frame.ms` (from the start of the
  load to the first frame, window only), `requests`, `bytes` (as received,
  before decompression), `requests.failed`, `fetch.batches` (side-by-side
  batches), `cache.fresh`, `cache.revalidated`, `sheets`, `scripts`,
  `scripts.inserted`, `modules`, `replies`, `dom.nodes.parsed`,
  `dom.mutations`, `js.steps`, `js.stopped` (the step limit ended the page's
  scripts), `relayouts`, `relayouts.skipped`, `layouts.pixels`, `images`
  (pictures taken by the window's steps). Image and favicon requests are
  timed but not counted (they go through `images` and `favicon`). Clocks are
  `time.now_ms`, so phases under a millisecond show as 0.
- **Loading in steps** (the window): a load is a few steps, and the window
  sends a frame after each, handling the clicks, scrolls and keys that came
  meanwhile before the next: (1) the document is fetched and parsed, its
  style sheets fetched, and it is laid out with `<noscript>` hidden: this
  frame is the first paint; (2) its scripts and modules are fetched and run
  and what they asked for answered; a refresh or a script navigation is
  another (1) and (2); (3) the page as the scripts left it is laid out with
  its sheets (the ones (1) fetched are not fetched again); then the favicon,
  and the pictures, six per step, each step laying the page out again.
  Until a picture arrives its `<img>` keeps the room its `width` and
  `height` (or CSS) give, drawn as a light placeholder, and one with neither
  has no room. `Browser.step` runs a step; `Garlic.continue_load` asks a
  small task (`step_poster`) to post the next `load-step` event, because
  `update` itself must never post to the inbox it alone empties (a full
  inbox would wait for ever). An agent's call and a scheduled job finish
  the load first; headless runs and tests load in one call, as before, and
  get the same page. Still one step each: a page's script run (up to its
  5,000,000-statement cap) and the `fetch`/XMLHttpRequest replies it waits
  for. Rejected: running the load in a task that hands frames to the
  window, since the script engine holds `ref` cells a task can't share, so
  scripts must run on the window's thread anyway.
- **Side-by-side fetches**: a page's linked sheets (a level of `@import`s at
  a time), its `<script src>`, its module graph (a level at a time, with its
  `<link rel=modulepreload>` addresses in the first) and its pictures go out
  six at a time from short tasks (lanes) the caller waits for, and are used
  in document order, so the page is the one a serial load gives. Lanes get
  plain values (addresses, headers, a copy of the jar); the cookies they
  bring are stored in the jar afterwards, in order, and the cache is
  consulted before and updated after on the window's thread. Pictures are
  decoded in the lanes too. std.net's keep-alive pool is one table shared by
  every thread with no lock (`pool_take`/`pool_put` in ail's
  `compiler/rt/native/net_http.ail`), so a lane never uses it: it asks with
  `Connection: close` through `net.open` (never offered HTTP/2, whose
  connections the pool also keeps) on a connection of its own, with a 3 s
  connect and 10 s read limit (`images.fetch_alone`). That costs a TCP and
  TLS handshake per lane request; a lone request still goes through the
  pool. Module imports are found by a scan of the source
  (`jsdom.import_specifiers`) instead of a parse, so each module is parsed
  once, when it runs; an import the scan misses is still asked for by the
  engine.
- **Speed**: the Go specification (290 KB of HTML) parses, cascades and
  lays out in 1.5 s on the bytecode tier (Linux x86-64; 1.1 s before CSS).

Tested live on 2026-10-20 (macOS ARM64): google.com loads in about
0.6 s (redirect, TLS 1.3 with Google's ECDSA certificates, the search form
and every link). A search submits correctly, but Google answers any client
without JavaScript with its "enable JavaScript" page, so results wait for
the JS engine (the designer's choice, 2026-10-20; no user-agent spoofing).
Google sends that page with HTTP 200 and a `<meta http-equiv=refresh
content="0;url=/httpservice/retry/enablejs?...">` inside `<noscript>`, so
Garlic follows a meta refresh at once when its delay is at most 5 s (up to
5 hops; longer delays stay, as the page asks to be read). Once scripts run,
`<noscript>` content must be skipped (HTML parses it as raw text when
scripting is on), or this refresh would fire on every search. Captures of
Google's pages, taken with Garlic's headers, are in the project files for
the JS engine.

Known limits: `std.net` follows redirects itself but doesn't report the
final URL, so relative links on a redirected page resolve against the URL
asked for; only UTF-8 and windows-1252 bodies decode; `std.ui` draws Latin-1, so other
characters show as `?` in the window (not in `--print` or `--json`).

## The page model for agents

An agent driving Garlic gets what the browser knows, not pixels. The model is
the DOM reduced to what a user perceives, like an accessibility tree, plus
where each thing was drawn:

```json
{"api":1,"url":"https://example.com/","title":"Example Domain","width":80,"height":23,"scroll":0,"rows":7,
 "nodes":[
  {"id":6,"role":"heading","name":"Example Domain","level":1,"row":0,"col":2,"end_row":1,"end_col":16,"visible":true},
  {"id":11,"role":"link","name":"More information...","href":"https://www.iana.org/domains/example","row":4,"col":0,"end_row":5,"end_col":22,"visible":true,"link":1,"actions":["follow"]}
 ]}
```

| Key | Meaning |
|---|---|
| `id` | the DOM node's index; stable for one load of a page |
| `role` | `heading`, `paragraph`, `link`, `list`, `listitem`, `blockquote`, `code`, `table`, `row`, `cell`, `image`, `button`, `textbox`, `combobox`, `navigation`, `separator` (ARIA role names; an explicit `role=` attribute wins) |
| `name` | the accessible name: `aria-label`, `alt`, else the text content (cut to 40 characters for paragraphs, items and cells, whose text is on the page anyway; none for lists, tables and rows); `title`, `placeholder` or `value` when there is no text |
| `row`, `col`, `end_row`, `end_col` | the cells it was drawn in, 0-based, ends exclusive as in `ail api` spans; `end_col` is the end on the last row |
| `visible` | whether any of it is in the viewport (`height` rows from `scroll`) |
| `href`, `level`, `link` | links' resolved targets and numbers (the `[n]` drawn after them); headings' levels |
| `actions` | what an agent can do: `follow` (links), later `type`, `press`, `select` |

The same model drives the window (Tab goes to the next `link` node), so what
an agent sees is exactly what a person sees. The design follows `ail api`
(versioned `"api":1`, byte-stable, one schema) and the editor's agent panel
(ADR 0312): the program reports its own state instead of the agent scraping it.

### Agent actions

An agent drives Garlic headless, with no window:

- `--do ACTION:ARG` (repeatable, in order) before `--json` or `--print`:
  `follow:3` (link number), `click:12` (node id, as Enter: follows a link,
  presses a button, toggles a box), `type:12=TEXT`, `submit:12` (the form
  of node 12), `check:12`, `select:12=OPTION`, `open:URL`, `back`, `forward`,
  `find:TEXT`, `scroll:ROW`, `reload`.
  On a page with scripts the engine stays alive after load: `click`, `type`
  and `submit` first dispatch `click`, `input`/`change` and `submit` through
  the page's listeners (a cancelled event stops the default), replay what
  they changed into the tree, and run due timers. Pages restored by Back
  have no live engine.
- `--session` keeps one browser open: one JSON action per line on stdin
  (`{"do":"follow","link":3}`, `{"do":"type","id":12,"text":"garlic"}`; the
  argument is `link`, `id` or `row`, or `url` or `text`), answered with the
  page model on one line. A failed action adds `"message"` to the model.
- Form controls are targets like links: `textbox`, `checkbox`, `radio`,
  `combobox` and `button` nodes carry `value` or `checked` and their
  `actions`; names come from `aria-label`, `<label>`, `placeholder` or
  `name`. Submitting follows HTML's form submission (simplified): GET puts
  the URL-encoded fields in the query, POST sends them as the body.
- `"changed"` lists the node ids changed since the page loaded (typing,
  checking, and later scripts through the `html.Doc` mutation functions),
  so an agent sees what its action or a script did.
- `--viewport` lists only the nodes in the viewport. On the Go specification
  at 80 by 24 the model drops from 316 KB to 1.4 KB, which an agent can read
  page by page with `scroll`.

- `--diff` (with `--session`): after the first model on a page, each answer
  lists only the nodes that are new or changed (moved, edited, scrolled in
  or out of view) and the ids `removed`, with `"diff":true`.
- `--budget N` keeps the model within about N tokens (4 characters each):
  the viewport's nodes first, then headings, links and form controls, then
  the rest, in document order, with `"omitted"` counting what was left out.
  On the Go specification `--budget 500` gives 2.0 KB instead of 316 KB.

Next for the agent angle:

1. **Provenance**: each node keeps its source position in the HTML, so an
   agent can tell markup from rendering problems.

The same idea gives the designer's PDF viewer its "search without OCR": a
PDF's text operators already carry the text and its position, so a viewer
that keeps them as data (like this page model) can search and point at
text directly. Scanned image-only PDFs still need OCR; that limit is in the
file, not the viewer.

## Native window

Kaleb asked (2026-10-21) for Garlic in a native macOS window as the fast
route to a real site (`projects.voltare.us`). The window is the SwiftUI
thread's `std.app`: an AIL program holds state, `update(event)` and
`view()`, and a generic host draws the node tree and sends events back over
a pipe. Garlic keeps its fetch, parse, style and layout, and hands the host
a display list.

- **Nodes**: a column of two canvases: the chrome (`chrome` module) and the
  page, which fills the window. The chrome is drawn Chromium-style (Kaleb,
  2026-11-07: a familiar look for adoption; speed and agent features
  differentiate): a tab strip whose shown tab flares into the toolbar,
  back, forward, reload, a pill omnibox edited in AIL (caret, select-all,
  host bright and path dimmed at rest), an Agent chip when `--attach` is on,
  a kebab menu, an infobar for an agent's Allow / Deny, and the status as a
  bubble over the page's bottom-left corner (the link under the pointer,
  prompts, messages). Dark by default, `--light` for Chromium's light look.
  No native field: three hosts would give three looks, and the omnibox needs
  its own drawing for the dimmed path and, later, a suggestion dropdown.
  Rejected: copying Chrome's assets (Google branding); the icons are stroked.
- **First cut**: the page model's rows draw in a monospace font. The host
  reports its cell size in points, so `cols = width / cell_w` and a click
  at (x, y) is cell (x / cell_w, y / cell_h). Layout stays exactly the one
  the `std.ui` window and `--json` show, and the page needs no pixel layout.
- **Display list** (`draw` module): `Rect(x, y, w, h, color)` for the page
  background and the focused link, and `Text(x, y, text, fg, bold, italic,
  underline)` for each run, in points. `draw.display_list` builds it from
  `pg.rows[scroll..]`; the `std.ui` window shares its colors.
- **Events**: click, scroll (points, accumulated into lines), keys with the
  `std.ui` names, field edit and submit, and resize with the cell size.
- **Entry**: `--app` starts it (cell mode, verified on macOS 2026-10-21:
  address bar, links, back, reload, wheel and key scrolling). `--app`
  uses the pixel layout below (default since 2026-10-22); `--cells` keeps the grid. The `std.ui` window stays the
  default.

### Pixel layout (`gfx`, the `--app` default)

Kaleb chose a full pixel layout with sans fonts (2026-10-21). The `gfx`
module lays the document out in CSS pixels, with no cells:

- **Box model**: margins (adjoining ones collapse), borders, padding,
  `width`, `max-width` with `auto` margins, backgrounds, canvas color from
  `body`/`html`.
- **Text**: proportional, sized by `font-size`, `line-height`, `text-align`,
  weight, style, color, underline; every word is drawn at its own x from a
  Helvetica advance-width table, because the host cannot measure text yet
  (so drift between fonts never accumulates).
- **Blocks**: lists with markers, tables (column widths from content),
  flexbox rows (`gap`, `flex-grow`, `justify-content`, `flex-wrap`), grid
  tracks (`repeat`, `fr`, `minmax`), images with `width`/`height` attributes (an unsized one takes the size its
  header gives: `images.prefetch` fetches them side by side, see
  "Side-by-side fetches", and `image.dims` reads PNG, JPEG or GIF headers; `image.decode` returns RGBA pixels
  for a host that can take a bitmap, and the current host still draws `Pic` from the URL),
  buttons and fields drawn as boxes (not yet interactive).
- **Output**: `draw.Op.Str`/`Pic`/`Rect` in page pixels plus a rectangle for
  each link (`Scene.link_at`); the window scrolls by points.
- **Not yet**: floats, positioning, web fonts,
  interactive form controls in pixel mode, page-model boxes with pixel
  rectangles, a host text-measuring call. Unverified on a real window.

The contract with the host is in the SwiftUI thread's spec (`std.app`).

## JavaScript

JavaScript is a separate, large decision (the engine is bigger than the
rest of the browser). The designer chose option 2 on 2026-10-20: **start an
in-house engine in AIL now**, as a parallel lane under `tools/garlic/js/`
(brief: lane 160). The options were:

1. **No JS now; an in-house engine in AIL later** (recommended): text and
   reader mode work on server-rendered pages; a JS lane (lexer, parser,
   bytecode interpreter, then the DOM bindings) starts once DOM and layout
   are solid.
2. **Start an engine now**, in parallel.
3. **QuickJS through FFI** as a stopgap (MIT, so licence-compatible), once
   lane 126 lands; costs ADR 0009's custom-by-default rule and a C dependency.
4. **Never run page JavaScript**: a no-script browser by design.

Until the engine lands, Garlic doesn't run scripts and renders `<noscript>`
content. The engine's DOM bindings work on `html.Doc`, and script changes to
the page show up in the page model so an agent can see what a script did.

## Dependencies

| Need | Where it stands | Blocks |
|---|---|---|
| HTTP GET over TLS 1.3 | done (`std.net`, ADR 0360) | nothing |
| Request headers and methods | done (`net.request`, lane 124): Garlic sends its own `User-Agent` and `Accept`, and POSTs forms | nothing |
| Cookies | `Response.all_headers` done (lane 124); the jar arrives with the JS engine's Garlic glue (lane 160) | logins |
| `fetch`, XMLHttpRequest | done (lane 177) | page scripts; see [garlic-js.md](garlic-js.md) |
| HTTP cache | done (lane 177) | pages, sheets and scripts (64 entries): `max-age` freshness, `ETag`/`Last-Modified` revalidation (304 renews), Reload always asks, `no-store` not kept, Back/Forward keep the last 16 pages without a request; Garlic follows redirects itself so each hop sends and stores cookies |
| Binary bodies | done (`net.request_bytes`, lane 123) | images and fonts still need decoders |
| gzip/deflate | done (`std.compress` on bytes, lane 128); Garlic sends `Accept-Encoding: gzip, deflate` | nothing |
| Regex | lane 127 | nothing essential (CSS and HTML are hand-written state machines) |
| Pixel drawing, images, fonts | **no lane** | graphical rendering. Needs a `std.ui` pixel surface (blit an RGBA buffer), PNG/JPEG decoders (PNG needs deflate), and text shaping and rasterization (a bitmap font first, then TrueType outlines) |
| JS engine | parallel lane (lane 160) | dynamic sites |
| Native backend (lane 120) | in progress | speed: today Garlic runs on the bytecode tier |

## Milestones

1. **Text mode** (this note): fetch, parse, wrap, links, history, page model.
2. **Forms and agent actions** (done): inputs, buttons, check boxes,
   selects, GET and POST forms; `--do` and the session mode. Cookies next.
3. **CSS on cells** (started): parser, selectors, cascade, `display`,
   visibility, bold, italic, uppercase, `white-space`, `@media` by window
   width, aligned data tables. Next: colors with a contrast floor,
   margins, and tables with `colspan` and multi-line cells.
4. **Pixels** (started): the `std.app` window draws a box-model layout in
   pixels (`gfx`, `--pixels`); next: verify on macOS, images without sizes,
   interactive controls, pixel rectangles in the page model.
5. **Scripts**: the JS engine's DOM bindings and event loop.

## Rejected alternatives

- **Embedding an existing engine** (WebKit, Servo, Ladybird's LibWeb): C++ or
  Rust, contradicts ADR 0009 and the goal, and hides the page from the agent
  behind a foreign API.
- **Screenshot plus OCR for agent awareness**: lossy and slow; the browser
  already has the exact text and positions.
- **A WebView in the native window** (WKWebView): shows every site at once,
  but it is Apple's engine, so the page and its layout are hidden from the
  agent and from AIL, against the goal (ADR 0009).
- **Pixels first**: blocked on a pixel layer, images and fonts that no lane
  covers; text mode delivers a usable browser now and its layout and page
  model carry over.
- **Exposing the raw DOM to agents**: far more tokens than the perceivable
  page (scripts, styles, wrappers), and no positions.
- **A fixed desktop width for `@media`** (always match as 1280 px): a
  narrow window would then get a desktop layout squeezed into too few
  cells. At 8 px per cell, small windows get sites' small-screen layouts,
  which are simpler to read.
- **Measuring table cells by laying them out twice**: exact, but it doubles
  the cost of every table. The estimate (text plus 4 cells per link)
  is right for text cells, and a wrong guess only shifts one row.
