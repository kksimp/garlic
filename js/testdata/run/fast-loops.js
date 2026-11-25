// Per-turn scopes of `for (let ...)`, `for-in` and `for-of` when only some
// turns make closures (interp.ail for_loop, for_in, for_of_lazy).
var fs = [];
for (let i = 0; i < 6; i++) { if (i % 2) fs.push(function () { return i; }); }
for (let i = 0, f = () => i; i < 2; i++) fs.push(f);
for (let i = 0; i < 3; fs.push(() => i), i++) {}
for (let i = 0; (i < 2) && (fs.push(() => "t" + i), true); i++) {}
console.log(fs.map(function (f) { return f(); }).join(","));

var gs = [];
for (const x of [1, 2, 3, 4]) { if (x > 2) gs.push(() => x); }
for (let k in { a: 1, b: 2, c: 3 }) { if (k !== "b") gs.push(() => k); }
for (const [a, b] of [[1, 2], [3, 4]]) gs.push(() => a + b);
for (const { v = 9 } of [{ v: 1 }, {}]) gs.push(() => v);
function* nums() { yield 10; yield 20; yield 30; }
for (const n of nums()) { if (n !== 20) gs.push(() => n); }
for (let c of "xyz") { if (c === "y") gs.push(() => c); }
console.log(gs.map(function (g) { return g(); }).join(","));

var hs = [];
for (const y of [1, 2, 3]) { class K { get v() { return y; } } if (y === 2) hs.push(new K()); }
for (const y of [4, 5]) { var o = { get v() { return y; } }; hs.push(o); }
for (const y of [6, 7]) { hs.push(eval("({ v: y })")); }
console.log(hs.map(function (h) { return h.v; }).join(","));

var sum = 0;
for (let i = 0; i < 100; i++) { let sq = i * i; sum += sq; }
for (const z of [1, 2, 3]) sum += z;
for (var w of [4, 5]) sum += w;
for (let q in [7, 8]) sum += Number(q);
console.log(sum, typeof w, w);
var last;
outer: for (let i = 0; i < 3; i++) { for (const j of [0, 1, 2]) { if (j === 1) continue outer; last = () => i + ":" + j; } }
console.log(last());
var pending = [];
for (let i = 0; i < 3; i++) setTimeout(function () { pending.push(i); }, 0);
setTimeout(function () { console.log(pending.join("")); }, 1);
