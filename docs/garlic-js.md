# Garlic's JavaScript engine

> **Non-normative.** Design notes for the JavaScript engine of Garlic, the
> web browser written in AIL. The code is `tools/garlic/js/`. It is a tool,
> not part of the AIL language, so its choices are recorded here, not in
> ADRs. Designer's decision (2026-10-20): write an in-house engine now,
> in parallel with the browser's text-mode milestone.

## Goal

Run the scripts of real pages inside Garlic, written entirely in AIL and from
the ECMAScript specification (ECMA-262), with every change a script makes to
the page visible in Garlic's page model, so that an agent can see what scripts
did.

## Slices

1. **Lexer and parser** (done): scripts to an ESTree-shaped tree.
2. **Interpreter** (done): values, objects with prototype chains, closures,
   `this`, `new`, classes, exceptions, destructuring, and the core built-ins
   (`Object`, `Function`, `Array`, `String`, `Number`, `Boolean`, `Math`,
   `JSON`, the `Error` types, `Map`, `Set`, `Date`, `RegExp`, `console`).
   It has a step limit like `ail run --max-steps`.
3. **DOM bindings** (done): a copy of Garlic's tree with the same node ids,
   nodes, elements, text, selectors, events (capture, bubble, `on...`
   handlers), timers on a virtual clock, forms, `location`, cookies,
   storage, `URL` and `URLSearchParams`. Every change a script makes is
   logged in order, and Garlic replays the log into its own tree
   (`tools/garlic/jsdom`).
4. **Generators, async functions and promises** (in progress): symbols,
   iterators, `Promise` with a microtask queue, generators (`yield`,
   `yield*`, `return`, `throw`), `async` functions and arrows, `await`,
   async generators, `for await`, and `for-of` that steps its iterator and
   closes it on `break`. Still to come: a bytecode compiler for speed.
5. **ES modules** (done): `import`/`export`, `import.meta`, `import()`,
   top-level `await`, JSON modules (`with {type: "json"}`), and
   `<script type="module">` with defer order, `nomodule`, and a module map
   keyed by URL.
6. **Later**: BigInt, import maps.

## Layout

```
tools/garlic/js/
  main.ail          command line: --tokens, --ast [--loc], --check, --run, --test, --test262, --test-run
  suite.ail         runs the packed test262 parser tests
  syntax/           module `syntax`: lexer, tree, parser, dumps
    lex.ail         ECMA-262 §12 (lexical grammar)
    unicode.ail     ID_Start and ID_Continue ranges (Unicode 16.0)
    ast.ail         the tree
    parse.ail       §13-§16 (expressions, statements, functions, classes, scripts)
    dump.ail        ESTree JSON
    module.ail      the specifiers a module imports (for prefetching)
    text.ail        Number::toString and JSON string quoting
  vm/               module `vm`: the interpreter
    value.ail       values, properties, scopes, conversions that need no calls
    object.ail      [[Get]], [[Set]], keys, arrays and strings as objects
    interp.ail      statements, expressions, functions, classes
    builtins.ail    the global object, Object, Function, Map, Set, Math, ...
    array.ail       Array.prototype
    string.ail      String.prototype and Number.prototype
    numfmt.ail      toFixed, toPrecision, toExponential, toString(radix)
    modules.ail     module records, linking, evaluation, namespaces, import()
    jsmath.ail      exp, log, sin, atan, pow, ... (AIL's float has none)
    json.ail        JSON.parse and JSON.stringify
    regexp.ail      RegExp on std.regex
    date.ail        Date, in UTC
    inspect.ail     console.log's layout, as Node's util.inspect
    dom.ail         the DOM: nodes, the change log, selectors, events, timers, forms, location
    markup.ail      innerHTML: an HTML fragment parser and serialiser
    url.ail         URL and URLSearchParams
  testdata/
    syntax/         NAME.js with NAME.ast (tree) or NAME.err (SyntaxError)
    tokens/         a lexer sample and its tokens
    test262-parser/ the tc39 parser tests, packed, with their licences
    run/            NAME.js with NAME.out, what Node printed
    page/           NAME.html with NAME.out, what Chromium printed
```

`tools/garlic/js` is the package `garlicjs` (`ail.pkg`): Garlic declares it as a
dependency and imports `garlicjs.vm` from `tools/garlic/jsdom`.

In Garlic (`tools/garlic/jsdom`, `load_doc` in `garlic.ail`), a page's
scripts run after it is parsed, with external scripts fetched first, a
budget of 1 s of virtual time and 5,000,000 steps, and the real time as the
clock. Their changes are replayed into Garlic's tree. A navigation a
script asks for, or else a `<meta http-equiv=refresh>` outside `<noscript>`,
is followed, up to 5 hops. `std.net.jar` (ADR 0638) is the cookie jar: cookies
from `Set-Cookie` and `document.cookie` are sent back by domain, path and
`Secure` (`SameSite` is in the jar; Garlic does not pass the initiating page
yet). `--no-js` skips scripts, and then a
refresh inside `<noscript>` is followed too.

```sh
./ail run tools/garlic/js --ast page.js          # ESTree JSON, one line
./ail run tools/garlic/js --ast --loc page.js    # with "loc":"LINE:COL" on each node
./ail run tools/garlic/js --check a.js b.js      # "ok" or the SyntaxError, per file
./ail run tools/garlic/js --tokens page.js       # LINE:COL KIND TEXT per token
./ail run tools/garlic/js --run [--max-steps N] page.js   # run it; console.log to stdout
./ail run tools/garlic/js --page page.html       # load a page: console, the body's HTML, navigations
```

## Design choices

**The parser drives the lexer.** Whether `/` starts a regular expression and
whether `}` resumes a template depend on the grammar (§12, goal symbols). The
parser pulls tokens one at a time, with one token of lookahead (rarely two),
and rescans a `/`, `/=` or `}` when it is at that point in the grammar. This is
exact, unlike tokenising first with the "previous token" heuristic. The
standalone `--tokens` dump still uses that heuristic, with a paren stack so
that `if (a) /re/` is read correctly. It is for inspection only.

**Covers become patterns.** `[a, b] = c`, `({a = 1} = o)` and `(a, {b}) => a`
are parsed as expressions and converted, following the spec's cover grammars
(§13.2.5, §13.15.1, §15.3). A shorthand `{a = 1}` is valid only once its object
becomes a pattern. Pending ones are kept on a list and reported as "Invalid
shorthand property initializer" if no conversion claims them.

**Parentheses are kept internally** as a `Paren` node, so `(a) = 1` (valid)
and `({a}) = 1` (invalid) can be told apart. The ESTree dump drops them.

**The first error stops the parse.** Every JavaScript engine reports one
`SyntaxError` per script (§16.1.6), and pages expect that. Messages follow
V8's wording, so agents and people see the text they already know.

**Early errors that need scopes are checked while parsing.** Each block,
function, `for` head, `switch` and `catch` gets a scope of `var`, lexical and
function names. A clash such as `let a; var a` is reported where it happens,
with the Annex B allowances: sloppy duplicate block functions,
`catch (e) { var e }`, and `for (var x = 1 in o)`.

**ESTree for the tree's JSON.** Most JavaScript tools share ESTree, so an
agent can read `--ast` output without learning a new schema. That is also what
let the parser be checked node for node against a reference parser.

**Source is Unicode scalars, not UTF-16.** AIL strings are UTF-8 and `char` is
a Unicode scalar value. A lone surrogate written as an escape (`"\uD800"`)
becomes U+FFFD, and a surrogate pair written as two escapes becomes one code
point. JavaScript's `length` and indexing count UTF-16 code units, so the
interpreter will need a string representation that can hold lone surrogates
and count in code units. That choice is open for slice 2. Pages almost never
contain lone surrogates.

**Identifiers use generated Unicode tables.** AIL's `is_alpha` doesn't cover
ID_Continue (combining marks, connector punctuation). `unicode.ail` holds the
ranges of ID_Start and ID_Continue above ASCII, generated from the Unicode
Character Database (Unicode licence, compatible with Apache 2.0), and looks
them up by binary search.

**Numbers print as JavaScript prints them.** `number_to_string` implements
Number::toString (§6.1.6.1.20) on top of AIL's shortest round-trip float
printing. The interpreter will use it too.

## The interpreter

**It walks the tree.** Slice 4 adds a bytecode compiler; walking the tree
first gave a correct reference to test that compiler against, the way the
Rust interpreter is AIL's oracle (ADR 0032).

**Objects are `ref` cells.** A `Value` is `Undef`, `Null`, `Bool`, `Num`
(a `float`), `Str` or `Obj(ref JsObject)`, so copies of a value share the
object and `==` on `Value` is JavaScript's `===`. An object keeps its named
properties in an insertion-ordered `Map` and an array's elements in a list.
Key order follows §10.1.11.1: indexes ascending, then strings in creation
order. Scopes are `ref Env` cells with a parent, so closures share them.

**Strings stay AIL strings.** `length`, indexes and `charCodeAt` count UTF-16
code units by converting on demand (`units`, `from_units`); a lone surrogate
becomes U+FFFD. Pages almost never rely on lone surrogates, and keeping
AIL's `str` keeps every string operation in AIL's own (fast) library. This
closes the question left open in slice 1.

**A throw is an AIL error.** Every evaluation function returns
`T ! Thrown`, so a JavaScript exception unwinds with `?`, and `try` is an
`if ... else err`. A run limit is a `Thrown` with `limit` set, which no
`catch` or `finally` stops.

**Runs repeat exactly.** `Math.random` is a seeded xorshift, `Date.now()`
reads a clock the host sets (fixed at 2026-01-01T00:00:00Z when run alone),
and the local time zone is UTC. An agent replaying a page gets the same page.

**Messages and output match V8 and Node.** Error messages use V8's wording
(`Cannot read properties of null (reading 'x')`), and `console.log` lays out
values as Node's `util.inspect` does, including its column grouping of long
arrays, so tests compare against Node byte for byte.

**Numbers print exactly.** `toFixed`, `toPrecision` and `toExponential`
work from the double's exact decimal value (a big integer in base 10^9), so
`(1.005).toFixed(2)` is `"1.00"`, as in V8. `toString(radix)` follows V8's
algorithm. `Math`'s functions are written in AIL by range reduction and
series; they are within an ulp or two of V8, not always the same last bit.

**RegExp uses std.regex.** Patterns are translated to RE2 syntax
(`(?<name>` to `(?P<name>`, `\uXXXX`, `[^]`) with the flags as inline
groups. Backreferences and lookaround are a SyntaxError until a JavaScript
regex engine is written.

## The DOM

- **One tree, two copies.** Garlic parses the page into `html.Doc`; the
  engine copies it into `Vm.dom` with the same ids. Scripts change the
  copy, and each change is appended to `Vm.mutations` as one of `create`,
  `create_text`, `create_comment`, `append`, `insert_before`, `detach`,
  `set_text`, `set_attr`, `remove_attr` and `set_value`. Garlic applies
  them in order with the matching `Doc` call, which gives new nodes the same
  ids, because both allocate at the end of the node list. Setting an
  element's `textContent` is logged as its parts (detaches, one new text
  node, an append), exactly as `Doc.set_text` does them. Rejected: sharing
  `html.Doc` itself, which would tie the engine to Garlic's parser module
  and make the engine's per-node script objects live in Garlic's types;
  and diffing the trees after scripts ran, which loses order and node
  identity.
- **Custom elements upgrade.** `customElements.define` upgrades the
  elements of that name already in the page; `createElement` and
  insertion upgrade new ones. An upgrade runs the class constructor with
  the element's own object as `this`: `HTMLElement`'s constructor, reached
  through `super()`, hands back the element being upgraded (or makes a new
  one for a plain `new`), and sets its prototype to the class's. Then
  `attributeChangedCallback` runs for each observed attribute present,
  `connectedCallback` when the element is in the document, and
  `disconnectedCallback` when it leaves (customelements.ail). Frameworks
  that hydrate through an island element (Astro) need this to start at all.
- **The browser decides.** Navigations (with method and body, so a script
  form submission can POST), external script fetches, `window.open`,
  cookies and dialogs are requests in `Vm.host_requests`; the engine does
  no I/O.
- **`fetch` and XMLHttpRequest** are JavaScript over one native hook
  (`vm/netapi.ail`). A request is a `fetch` host request with a number; the
  browser makes it (cookies for the page's own origin only, CORS by
  `Access-Control-Allow-Origin`, no preflight or custom headers) and hands
  the JSON reply to the live engine (`Session.reply`), which runs the
  page's callback. No script runs twice. Pages restored by Back have no
  engine, so they make no requests.
- **WebSocket** is a JavaScript class over `__hostWs` (open, send, close).
  The browser (`ws/ws.ail`, RFC 6455 over `net.connect`/`net.connect_tls`)
  makes the connection with the page's origin and cookies, and delivers
  `open`, `message`, `error` and `close` to the live engine as the sockets
  are read. Sockets are read after every action the page takes and every
  host event (`Browser.pump`); with no host timer event, a message that
  arrives while the person does nothing waits for the next event. Text
  messages only.
- **Virtual time.** Timers run on the fixed clock in order of due time,
  then of creation, until the page's time budget (a second by default) or
  a task cap; `performance.now()` counts from the page's start. A page with
  an endless interval can't hang the browser, and runs repeat exactly.
- **Wrappers.** Each node has one script object (class `Node`, the id in
  its primitive slot), made on first use. Properties such as `id`,
  `className`, `href` and `value` are accessors on the prototypes that read
  and write the copy. `href`, `src` and `action` resolve against the
  page's address. `on...` handlers listen from where they were first set,
  as in HTML.
- Form controls' current values (`value`, `checked`) are kept apart from
  their attributes, as in HTML, and logged as `set_value`; Garlic stores
  them as the `value` and `checked` attributes, as its own form input does.
- Layout isn't known to scripts: sizes and rectangles are 0, and
  `getComputedStyle` reads only the `style` attribute.
- **Chrome's surface** (`vm/browser.ail`). Pages check that built-ins are
  real by calling them on the wrong object, reading their source, or
  comparing a frame's built-ins with the page's. So the window, document,
  each element tag and the host objects have Chrome's interface objects and
  `Symbol.toStringTag` (`[object HTMLDivElement]`), `new Navigator()` fails
  as in Chrome, navigator's values are enumerable getters on its prototype
  that throw "Illegal invocation" for any other receiver, and
  `navigator.permissions`, `canPlayType` and `window.chrome` exist. An
  attached iframe's `contentWindow` has its own copies of the built-ins,
  running the same natives, so `frame.String !== String` as with a separate
  realm; the DOM is shared. Rejected: a full second realm (a second
  `Vm` setup per frame), which no page we test needs yet.
- `Function.prototype.toString` returns a function's source text
  (§20.2.3.5): the parser keeps each function's and class's text, so code
  that rebuilds functions from their source with `eval` works.
- Selectors (Selectors L4, `vm/selectors.ail`): structural pseudo-classes
  (`:nth-child` family, `:first/last/only-of-type`), `:not`, `:is`, `:where`,
  `:has`, form states (`:checked`, `:disabled`, `:required`, ...), `:root`,
  `:empty`, `:scope`, `:link`, `:focus`, `:lang`. The fragment parser closes
  `<p>`, `<li>`, `<dd>`, `<option>`, cells and rows implicitly and inserts
  `<tbody>`/`<tr>`.
- `MutationObserver` (DOM §4.3, `vm/mutation.ail`): every logged change is
  offered to the observers; records for `childList`, `attributes` (with
  `attributeFilter`) and `characterData`, with `subtree`, reach the callback
  through a marker microtask queued at the first record, so they run in
  queue order with promise jobs. `append(a, b)` makes one record. Not yet:
  `oldValue`, sibling links, `attributeOldValue`. `el.style.cssText`,
  `dataset` writes, `outerHTML=`, `replaceChildren`, `normalize`,
  `template.content` and `defaultValue` follow the DOM and HTML specs; the
  page tests `mutation` and `observer` match Chromium's output.
- `WeakMap`, `WeakSet`, `WeakRef` and `FinalizationRegistry` (`vm/weak.ail`)
  are a Map and Set that only take objects, a `deref` that always answers
  and a registry that never calls back: nothing is collected while scripts
  run. `IntersectionObserver` and `ResizeObserver` take a callback and never
  fire, since Garlic has no scrolling or resizing the page can see.
- `Proxy` and `Reflect` (`vm/proxy.ail`, ECMA-262 §10.5, §28.1): a proxy is
  an object of class `Proxy` holding its target and handler; `get`, `set`,
  `has` (the `in` operator), `deleteProperty`, `apply` and `construct`
  traps run, and each falls through to the target without its trap. Own
  keys, descriptors, the prototype and `Object.keys` read the target
  without calling `ownKeys`, `getOwnPropertyDescriptor` or `getPrototypeOf`
  traps. No `Proxy.revocable`, and no invariant checks on trap results.
- `AbortController` and `AbortSignal` (`vm/abort.ail`): `abort()` sets
  `aborted` and `reason` and runs the signal's `abort` listeners, then
  `onabort`. No `AbortSignal.abort()`/`timeout()`/`any()`, and nothing
  aborts a pending request yet (`fetch` belongs to lane 177).
- Focus and keys (`vm/focus.ail`): `el.focus()`/`blur()` and Tab in Garlic
  move `document.activeElement` and fire `focus`, `focusin`, `blur`,
  `focusout`. Typing into a field fires `keydown` (cancellable: that
  character is dropped), `input` and `keyup` per character, then `change`;
  Enter fires `keydown`/`keyup` first, and a cancelled `keydown` stops the
  form from submitting. A click in Garlic fires `mousedown`, focus on the
  control pressed, `mouseup` and `click` (a cancelled `mousedown` only keeps
  the focus). `KeyboardEvent` and `MouseEvent` start with empty
  `key`/`code` and zero coordinates, as in Chromium.
- Events (`vm/events.ail`): each interface (`KeyboardEvent`, `MouseEvent`,
  `PointerEvent`, `ErrorEvent`, `MessageEvent`, ... 22 of them) has its own
  prototype under its parent's and starts with its dictionary's defaults;
  `Event.NONE` and the phases exist; `new Event()` needs a type;
  `composedPath()` is the path while dispatching. An uncaught exception is
  reported to the window as a cancellable `ErrorEvent` first, and
  `window.onerror` gets `(message, source, line, column, error)` where
  `true` cancels; an unhandled rejection fires `unhandledrejection` the same
  way. `readystatechange` fires at `interactive` and `complete`. Handler
  properties (`onpointerdown`, ...) exist on elements and the window, but
  `ontouch...` ones don't, as on a desktop. Timers started by timers nest:
  from the 7th level a timer waits at least 4 ms (measured against
  Chromium; the HTML spec says after 5). `lineno`/`colno` of an
  `ErrorEvent` are 0.

## Generators and async functions

The tree-walker keeps its place on AIL's own stack, so it can't stop in the
middle of a function and go on later. A generator's or async function's
body is compiled instead (`vm/gen.ail`) to a list of instructions whose
place is kept in a `Frame`: a program counter, an operand stack, the
current scope and the scopes outside it, the `try` handlers, and the
completions of the `finally` blocks being run.

Only the parts that can stop are compiled. A statement or expression with
no `yield` or `await` in it (most of them) is one instruction that hands it
to the tree-walker; `break` and `continue` out of such a statement find
their target in a table made at compile time. A `try` pushes a handler
that records the scope and stack depth to unwind to, and `return`, `break`
and `continue` leave through the `finally` blocks in the way, as completion
records (§6.2.4). Each function object compiles once.

An async generator keeps a queue of `next`, `return` and `throw` requests,
each answered by a promise in order (§27.6.3); it runs while the front
request waits, and stops at each `yield` (after awaiting its value) or
`await`. `for await` over a sync iterable wraps it so each value is awaited
(§27.1.4).

A generator is an object of class `Generator` that holds its frame's id;
`next`, `return` and `throw` resume the frame. An async function returns a
promise at once and runs until its first `await`; each `await` resumes it
from a promise reaction, in the microtask queue. Frames that stop forever
stay in `Vm.frames`, as an unreachable generator would in an engine without
a collector of its own.

Rejected: a CPS rewrite of the tree (every expression would carry a
continuation, so the common code that never stops gets slower), and
running the whole interpreter on a compiled bytecode now (a larger change;
it comes later for speed, and these frames will move onto it).

## Not yet

- `yield*` in an async generator: a clear "not supported yet"
  SyntaxError. Leaving a `for-of` by `return` or a throw doesn't close
  its iterator yet (`break` does). Inside a generator or async function, `yield` and `await`
  can't yet appear in a destructuring target, a `class` body, a `with`
  statement, tagged templates, optional chains, `delete`, `++`/`--`
  operands, logical assignment, or a compound assignment to a computed
  member; each of these is a clear SyntaxError.
- Holes in arrays are `undefined`; property attributes on array elements
  only as a whole (`Object.freeze`).
- Recursion is limited to 350 JavaScript calls: each one takes about 25
  frames of the bootstrap interpreter, whose limit is 10,000. A bytecode
  compiler for the whole interpreter will remove this.
- Import maps and `<link rel=modulepreload>`; module workers.
- `Intl` knows one locale, en-US. Local time is the system zone in the
  app (`Vm.zone`, offsets from std.tz) and UTC in tests and `jsdom.run`.
  Zone names are IANA names: `Date.prototype.toString` ends in
  "(America/New_York)" and `timeZoneName: "short"` gives "GMT-5", where
  Chrome writes "Eastern Standard Time" and "EST".
- A canvas 2D context keeps its state and draws nothing (webapi.ail):
  `getImageData` is transparent black and `toDataURL` a blank PNG. WebGL
  and WebGPU contexts are null. Streams, `Worker`, `WebAssembly`,
  geolocation and service workers are missing: pages that feature-test
  them report them unsupported.
- Media (mediaapi.ail): `navigator.mediaDevices`, `MediaStream`,
  `RTCPeerConnection` (SDP offer/answer, signalling states, data channels,
  transceivers) and `AudioContext`/`OfflineAudioContext` with the common
  nodes exist, but no capture or network-media host is behind them. There
  are no devices, `getUserMedia` rejects with NotFoundError, peer
  connections gather no candidates and never connect, and audio renders
  silence. A host can supply `globalThis.__mediaHost`.
- Platform APIs (platform.ail): `navigator.clipboard.writeText` and
  `write` go to the system clipboard; `readText` and `read` are refused
  (NotAllowedError), as Chrome does without the permission.
  `navigator.share` rejects with AbortError, as when the user closes the
  share sheet. `navigator.wakeLock.request` gives a sentinel the page can
  release, but Garlic does not keep the screen awake. IndexedDB is
  complete enough for stores, indexes, key ranges and cursors, but lives
  in memory for the life of the page: nothing is written to disk yet.
- BigInt literals (`10n`).
- Regular expression pattern syntax (§22.2.1): the literal's body and flags
  are checked, and the pattern is checked when the regex engine compiles it.
- Private names are not checked against their class's declarations.
- Class `accessor` fields and decorators (not in ES2022).

## Testing

- `testdata/syntax`: 18 hand-written scripts, one per area (literals,
  templates, operators, ASI, declarations, functions, arrows, classes,
  objects, patterns, control flow, optional chaining, `new`, Annex B,
  Unicode identifiers, regex context, generators, `for await`), each with
  its ESTree tree, and 57
  invalid scripts with their exact SyntaxError.
- `testdata/test262-parser`: the tc39 [test262-parser-tests](https://github.com/tc39/test262-parser-tests)
  (commit `0e808c7`, 2021-05-27), scripts only, packed one test per line.
  Licences: Apache 2.0, MIT and BSD, listed per file in its `licenses.md`.
  Every `pass` script must parse to the tree whose fingerprint is in
  `trees.txt`, and to the same tree as its `pass-explicit` twin. Every
  `fail` and `early` script must be rejected. `known.txt` lists each
  exception and why: an unsupported feature, a twin that is not the same
  script, a test made stale by a later edition, or a gap. A listed test that
  starts to behave is reported, so the list only shrinks.
- `testdata/run`: 21 programs (operators, functions, classes, control flow,
  built-ins, numbers, JSON, collections, errors, strings, console layout,
  promises, symbols, generators, async functions, `await` positions,
  `eval`, `Date` setters, assignment order, async generators, direct
  `eval`, function source text),
  each with `NAME.out`, the output Node 22 gave (an uncaught error is the
  last line, as `Uncaught NAME: message`). `--test-run DIR` compares them.
- `testdata/page`: 9 pages (tree, events, timers, forms, URL, a
  script redirect, binary strings and beacons, Chrome's
  interface objects), each with `NAME.out`: the console, the
  body's `innerHTML` at the end, and the navigations asked for, as Chromium
  (Playwright's build 1194) gave them with the page at
  `https://example.test/dir/page.html`. `--test-page DIR` compares them.
- `vm/jsmath.ail` has `@test`s for the math functions.
- `77592931:bootstrap/tests/tools.rs` (`garlic_js_parses_and_runs_its_suites`) runs
  all of these in `./ail selftest`.

Real pages lean on indirect and direct `eval`, function source text,
`Date` setters, `Image`, `navigator.sendBeacon`, `btoa` on binary strings,
an assignment's target evaluated before its value, and Chrome's surface
above, so the engine has them. The engine follows general web standards
and is not tuned to any one site. The designer dropped Google search as a
target on 2026-10-21: its search page gates results behind bot detection.
`--page --url URL FILE` loads a page at `URL` and lists every request and
cookie, to compare with Chromium.

As a larger check, acorn 8.14 (6,300 lines of JavaScript) runs in the
interpreter, and its JSON tree with locations for a 240-character script
was byte-identical to Node's (2026-10-20, outside the repository).

Before `trees.txt` was written, every tree was compared node for node with
acorn 8.14 (ECMAScript 2022, script goal), outside the repository. Results on
2026-10-20:

| Corpus | Result |
|---|---|
| test262 `pass` (1,907 scripts) | 1,822 identical trees; 85 use generators or async (all 1,907 identical once the parser took them, 2026-10-20) |
| test262 `fail` (682) | 623 rejected; 54 use unsupported features; 4 regex patterns accepted; `new super()` rejected where acorn accepts and the suite agrees with us |
| test262 `early` (605) | 513 rejected; 88 unsupported; 1 regex pattern; 3 rejected where acorn accepts and the suite agrees with us |
| npm's own modules (1,210 files) | 935 identical trees; 255 use async; 19 rejected by acorn too. With async: 1,178 identical, 5 use dynamic `import()` |

## Speed

On the bootstrap interpreter (bytecode tier), Linux x86-64: acorn's own
238 KB `acorn.js` parses in 1.7 s, about 140 KB/s. Acorn on V8 takes 0.1 s.
The native backend will move this. The parser does no I/O and allocates
mostly in lists, so it should compile well.

The interpreter on the bootstrap's bytecode tier costs about 1 µs per AIL
call, and a JavaScript loop step takes about 30 of them: a
100,000-iteration `for` loop with `t += i % 7` runs in 2.8 s (Node: under
0.1 s), and loading acorn takes 6.6 s. Arithmetic on two numbers and blocks
without declarations have fast paths. Running pages at speed needs the
bytecode compiler (slice 4) and AIL's native backend.

A profile (2026-10-21, `--trace=calls` counts and `AIL_BYTECODE_STATS=2`)
shows no single hot spot. An expression statement such as `a;` makes six
`eval` calls, three `lookup` calls, two `exec`/`exec_in`/`tick` calls and
about ten others, and each costs about the same. Measured per loop step, a
local read adds 8 µs, a call 22 µs, a method call 32 µs, and `push` 28 µs.
The step counter is under 1 µs, so is the per-iteration scope copy, and
so are the walker hand-offs (`.get` on a field reached through a `ref`
hands off, at about 70 ns each). Two engine changes would cut the AIL calls
per operation:

- Resolve each name to a scope depth and slot at parse time, so that
  `lookup` doesn't search maps up the chain.
- Compile function bodies to a flat instruction list, so that `exec` and
  `eval` don't recurse for each node.

The larger step is native code. On 2026-10-21, `ail build tools/garlic/js`
reports 1,324 constructs outside the native subset: `?` 342, `==` on `str`
174, string interpolation 107, optionals as parameters and indexes, and
string methods. These are the same groups the native lanes are closing for
self-compilation.

## Notes on writing it in AIL

What a 12,700-line AIL program ran into, for the language's designers:

- A variant whose fields share a type can't be built by position
  (`Binary(op, l, r, p)`), so tree constructors are written with names.
- A `match` arm can't be empty, and a `|` pattern can't bind names. "Is this
  node an X?" is written as `expr_kind(e) == "Ident"`, from one exhaustive
  `match` per enum, to avoid `_` arms that the checker warns about.
- `use` is per file, and a local named like a standard module (`path`) hides
  it.
- `x := f() else err`, where `f` gives `T? ! E` and succeeds with `none`,
  panics in the bootstrap interpreter (issue #163). `json.ail` returns a
  sentinel string instead, and `gen.ail` a `Stop` whose kind is empty.
- `if a then b elif c then d else e` isn't an expression; nest it in
  parentheses or use `match`.
- A `match` arm can't do nothing (`{}` has no type), so "do nothing for these
  variants" is written with a helper that returns an optional.
- There are no tuples, so a list of pairs is a list of a small struct, and
  `for (k, v) in pairs` reads as the C-style `for` that AIL rejects.
- A program rooted at `tools/garlic` can't load `tools/garlic/js/vm`, whose
  files `use syntax` relative to their own root; `tools/garlic/js` is a
  package (`ail.pkg`) that Garlic declares as a dependency instead.
- The rest was direct: `T ! E` with `?` makes "first error stops the parse"
  a one-character cost per call.

## Modules

Design (ECMA-262 §16.2, HTML module scripts):

- `vm/modules.ail` desugars a module at load time: an import binds a name in
  the module's `Env` to an accessor on the exporting module's `Env.object`,
  so bindings are live and a read before evaluation hits the TDZ. Exports
  resolve through `ResolveExport`; `export *` conflicts become ambiguous
  and are skipped.
- The namespace object has class `Module`; `Vm.own` answers its keys, sorted,
  from the live bindings (null prototype, `@@toStringTag` "Module").
- Linking walks the graph depth first, so cycles link once and evaluate
  once in post-order. Top-level `await` reuses the async frame machinery:
  modules evaluate one at a time, in order, and a rejection fails every
  importer.
- `import()` queues its load and a `Module.kick` microtask, so a script
  does not see its own dynamic import resolve synchronously.
- Garlic fetches modules through the host: `prefetch_modules` walks static
  imports before running, and later `fetch-module` requests serve dynamic
  imports. http(s) module fetches are CORS requests; `data:` and files are
  served as-is.
- `.mjs` files run as modules from the CLI (`--run`, `--ast`, `--check`).
- Tests: `testdata/run/mod-*.mjs` (goldens from Node 22), `testdata/page/mod-*.html`
  (goldens from Chromium via Playwright), `testdata/syntax/module-*.mjs`,
  `err-module-*`. Regenerate; never hand-edit.
