# Garlic: a web browser written in AIL

`tools/garlic/garlic.ail` is a text-mode web browser written in AIL. The
design, scope and roadmap are in
[docs/design/garlic-browser.md](../../docs/design/garlic-browser.md).

```sh
tools/app-host/macos/run.sh --native tools/garlic/garlic.ail URL   # in a window, compiled
./ail run tools/garlic/garlic.ail --print URL|FILE         # the page as text
./ail run tools/garlic/garlic.ail --json URL|FILE          # the page model for agents
./ail run tools/garlic/garlic.ail --links URL|FILE         # the numbered links
./ail run tools/garlic/garlic.ail --follow 3 --print URL   # follow link 3 first (repeatable)
./ail run tools/garlic/garlic.ail --find TEXT --json URL   # scroll to TEXT first
./ail run tools/garlic/garlic.ail --do click:12 --json URL # an agent action first: follow:N, click:ID, type:ID=TEXT, submit:ID, check:ID, select:ID=OPT, open:URL, back, forward, find:TEXT, scroll:ROW, reload
./ail run tools/garlic/garlic.ail --session URL            # JSON actions on stdin, one page model per line out
./ail run tools/garlic/garlic.ail --viewport --json URL    # only the nodes in the viewport
./ail run tools/garlic/garlic.ail --budget 500 --json URL  # at most about 500 tokens: viewport, then headings, links and controls
./ail run tools/garlic/garlic.ail --diff --session URL     # after the first model, only what changed
./ail run tools/garlic/garlic.ail --keys                   # the keys
./ail test tools/garlic/garlic.ail                         # the headless tests
```

`--width N` and `--height N` set the size (100 by 32 by default).

Native macOS window (needs the SwiftUI host, ADR 0838): `tools/app-host/macos/run.sh --native tools/garlic/garlic.ail URL` (or without `--native` to interpret); the pixel layout is the default, `--cells` selects the text grid.

| Module | Does |
|---|---|
| `html/` | WHATWG tokenizer and a simplified tree builder; `html.parse(src).dump()` prints the html5lib-tests tree format; mutation functions (`set_attr`, `append`, `insert_before`, `detach`, `set_text`, `create`) record what changed |
| `css/` | CSS parser, selector matching and cascade (the properties text cells use) |
| `page/` | text-cell layout, link numbering, boxes with roles, names and positions, the page model JSON, URL resolution (RFC 3986) |
| `draw/` | the display list and colors both windows share |
| `gfx/` | pixel layout: box model, proportional text, flex, grid, tables, images; `--app --pixels` |
| `--bench FILE [ROUNDS]` | page-load phases in milliseconds on a saved page: `ail build tools/garlic/garlic.ail -o garlic && ./garlic --bench FILE [ROUNDS]` |
| `garlic.ail` | fetching, history, find, the `std.app` window and the command line |

## Pixel mode: forms, tabs, find

- Forms: click a field to type; Enter submits (GET/POST); clicking a select cycles its options.
- Tabs: Cmd-T new, Cmd-W close, Ctrl-Tab next; each tab keeps its own page.
- Find: Cmd-F or `/`, type, Enter scrolls to the match and highlights it; `n` finds the next.
- `garlic --pixels-dump URL` prints the canvas, ops and image decode status.

Network behaviour (cookies on redirects, the final address, gzip, sheets with cookie and Referer) is checked against a scripted site with `tools/garlic/netcheck/check.sh` (`GARLIC=path` runs it against a native build).
## Agents: `garlic --serve`

An MCP server on stdio (JSON-RPC, one message per line). Tools: `open`, `observe`, `act`, `find`, `extract`, `screenshot` (the pixel layout as drawing operations). Same page model and actions as `--session`. `ail build tools/garlic/garlic.ail` builds natively; the dumps match the interpreter's and run about 5x faster.
