// Name lookup and assignment through scopes (interp.ail lookup, assign_name).
var fs = [];
for (let i = 0; i < 3; i++) fs.push(function () { return i; });
for (var j = 0; j < 3; j++) fs.push(function () { return j; });
for (const k of ["a", "b"]) fs.push(() => k);
console.log(fs.map(function (f) { return f(); }).join(","));

let counter = 0;
function bump() { counter += 1; return counter; }
bump(); bump();
console.log(counter, typeof undeclared, typeof bump);

try { tdz; let tdz = 1; } catch (e) { console.log(e.constructor.name, e.message); }
try { const c = 1; c = 2; } catch (e) { console.log(e.constructor.name, e.message); }
try { nope = nope + 1; } catch (e) { console.log(e.constructor.name, e.message); }
(function () { "use strict"; try { undeclaredStrict = 1; } catch (e) { console.log(e.constructor.name, e.message); } })();

function outer() {
  var x = 1;
  function inner() { x = x * 10; return x; }
  inner();
  return [x, inner()];
}
console.log(outer().join(","));

function args(a, b) {
  var n = arguments.length;
  return [n, arguments[0], arguments[1], typeof arguments];
}
console.log(JSON.stringify(args("x", "y")), JSON.stringify(args(1)));

globalThis.gv = 5;
var gw = 6;
console.log(gv + gw, globalThis.gv);
Object.defineProperty(globalThis, "gacc", { get: function () { return "getter"; }, configurable: true });
console.log(gacc);
gv = 7;
console.log(globalThis.gv);

var shadow = "global";
function sh() { var shadow = "local"; { let shadow = "block"; return shadow; } }
console.log(sh(), shadow);

var o = { p: 1 };
with (o) { p = 2; var q = p + 1; }
console.log(o.p, q);

var total = 0;
for (var m = 0; m < 1000; m++) { let t = m % 3; total += t; }
console.log(total);
