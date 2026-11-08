# Garlic: a web browser written in AIL

License: AGPL-3.0 (see `LICENSE`). Moved from kksimp/ail (`tools/garlic`) with its history.

Needs the AIL toolchain: clone [kksimp/ail](https://github.com/kksimp/ail) next to this repo at the commit in `.ail-version`. Commands below use `../ail/ail`; `tools/check.sh` runs check, fmt and the tests against that pin. Builds and tests run on a dev machine, not in a container.

`garlic.ail` is a text-mode web browser written in AIL. The
design, scope and roadmap are in
[docs/design/garlic-browser.md](https://github.com/kksimp/ail/blob/main/docs/design/garlic-browser.md).

```sh
../ail/tools/app-host/macos/run.sh --native garlic.ail URL   # in a window, compiled
../ail/ail run garlic.ail --print URL|FILE         # the page as text
../ail/ail run garlic.ail --json URL|FILE          # the page model for agents
../ail/ail run garlic.ail --links URL|FILE         # the numbered links
../ail/ail run garlic.ail --follow 3 --print URL   # follow link 3 first (repeatable)
../ail/ail run garlic.ail --find TEXT --json URL   # scroll to TEXT first
../ail/ail run garlic.ail --do click:12 --json URL # an agent action first: follow:N, click:ID, type:ID=TEXT, submit:ID, check:ID, select:ID=OPT, open:URL, back, forward, find:TEXT, scroll:ROW, reload
../ail/ail run garlic.ail --session URL            # JSON actions on stdin, one page model per line out
../ail/ail run garlic.ail --viewport --json URL    # only the nodes in the viewport
../ail/ail run garlic.ail --budget 500 --json URL  # at most about 500 tokens: viewport, then headings, links and controls
../ail/ail run garlic.ail --diff --session URL     # after the first model, only what changed
../ail/ail run garlic.ail --keys                   # the keys
../ail/ail test garlic.ail                         # the headless tests
```

`--width N` and `--height N` set the size (100 by 32 by default).

Native macOS window (needs the SwiftUI host, ADR 0838): `../ail/tools/app-host/macos/run.sh --native garlic.ail URL` (or without `--native` to interpret); the pixel layout is the default, `--cells` selects the text grid.

| Module | Does |
|---|---|
| `html/` | WHATWG tokenizer and a simplified tree builder; `html.parse(src).dump()` prints the html5lib-tests tree format; mutation functions (`set_attr`, `append`, `insert_before`, `detach`, `set_text`, `create`) record what changed |
| `css/` | CSS parser, selector matching and cascade (the properties text cells use) |
| `page/` | text-cell layout, link numbering, boxes with roles, names and positions, the page model JSON, URL resolution (RFC 3986) |
| `draw/` | the display list and colors both windows share |
| `chrome/`, `favicon/` | the Chromium-style chrome (tab strip, toolbar, omnibox, menus) and the tabs' favicons (ICO decoder included) |
| `gfx/` | pixel layout: box model, proportional text, flex, grid, tables, images; `--app --pixels` |
| `--bench FILE [ROUNDS]` | page-load phases in milliseconds on a saved page: `ail build garlic.ail -o garlic && ./garlic --bench FILE [ROUNDS]` |
| `garlic.ail` | fetching, history, find, the `std.app` window and the command line |

## Pixel mode: forms, tabs, find

- Forms: click a field to type; Enter submits (GET/POST); clicking a select cycles its options.
- Tabs: Cmd-T new, Cmd-W close, Ctrl-Tab next, Cmd-Shift-T reopens; each tab keeps its own page. Right-click a tab for its menu.
- Omnibox: click or Cmd-L to edit, Enter opens a URL or a DuckDuckGo search (`b`, `y`, `g` prefixes pick Bing, Yahoo, Google), Escape restores the address.
- Look: Chromium-style, dark by default; `--light` for the light look (also in the toolbar menu). On macOS the tabs sit in the title bar beside the traffic lights (std.app.25); drag the empty strip to move the window, double-click it to zoom. Tabs show the site's favicon (`<link rel="icon">` or `/favicon.ico`; ICO, PNG, GIF, JPEG), fetched once per icon address.
- Find: Cmd-F (or the menu) opens Chromium's find bar at the top right; it searches as you type, shows `k/n`, Enter or Cmd-G steps to the next match (Shift for the previous), Escape closes. The match shown is orange, the others yellow. In the text layout `/` prompts instead and `n` finds the next.
- Omnibox dropdown: typing lists the text as a search or URL, then the pages from this session's history that match; Down and Up pick one, Enter opens it.
- Loading: the tab shows Chromium's spinner in place of the favicon while a page loads.
- Copy: Cmd-C copies the omnibox's text while you edit it, the find bar's text, or the link under the pointer (std.app.26). A right-click on the page opens Chromium's page menu: Open link in new tab, Copy link address, Copy text, Back, Forward, Reload.
- `garlic --pixels-dump URL` prints the canvas, ops and image decode status.

Network behaviour (cookies on redirects, the final address, gzip, sheets with cookie and Referer) is checked against a scripted site with `netcheck/check.sh` (`GARLIC=path` runs it against a native build).
## Agents: `garlic --serve`

An MCP server on stdio (JSON-RPC, one message per line). Tools: `open`, `observe`, `act`, `find`, `extract`, `screen` (what is drawn, as items an agent can ask about by point, region, role, colour or text, within a token budget; `std.screen`, ADR 0878), `screenshot` (the pixel layout as drawing operations). Same page model and actions as `--session`. `ail build garlic.ail` builds natively; the dumps match the interpreter's and run about 5x faster.

Trust rules in `--serve`: `--allow host,host` limits the sites an agent may open or use (default `*`); an `act` that sends data (`submit`) is held until repeated with `"confirm":true`; the `log` tool returns what the session did.

## Agents on the running window: `--attach`

`garlic --app --attach [--allow host,host]` starts the window with an MCP server on 127.0.0.1 (a free port, `POST /mcp`, JSON-RPC). The address and a bearer token go to `~/.garlic-attach.json` (mode 600); agents on this machine, including a Claude session on the same Mac, read it and send the same tools as `--serve`. The window shows an "Agent attached" line with the call count. An agent may use the sites the tabs show plus those from `--allow`; `submit` needs `"confirm":true`; the `log` tool lists what it did. It rides the `std.app` inbox (ADR 0861), so the window answers between user events. Without `--attach` nothing listens.

Watches and scheduled actions (attached sessions): `watch` (`url` or the live tab, `contains`, `every` seconds), `watches`, `unwatch`, `events` (changes seen since the last call); `schedule` (`tool`, `arguments`, `in` seconds), `schedules`, `unschedule`. A one-second timer posts to the window through the inbox; scheduled calls follow the same site and confirm rules as live ones, and their results appear in `events`.

In the window, an attached agent's request to use a site it may not, or to send data (`submit`), waits for the user: an "Allow / Deny" row appears and the agent's call stays open until one is pressed. Allow on a site adds it for the session; Allow on a send permits that one send.

## Quiet pages, extraction and forms for agents

- Cookie banners, ads and trackers are hidden by default (`hush`, lists in AIL); `--noisy` shows them.
- `--tables` (JSON), `--csv N` (table N as CSV), `--reader` (main content, title and token count) and `--extract "Price,Stock"` (values by label) read structure out of a page; the MCP tools are `tables`, `reader` and `fields`.
- `--forms` lists the forms as a schema; the action `fill:{"Label": value}` fills by label and submits.
- `--at X,Y` and `--where TEXT|ROLE` ground a point or a word in the page model.
