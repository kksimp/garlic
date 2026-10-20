// Functions, closures, this, arguments, hoisting and the dead zone.
console.log(hoisted(), typeof later);
function hoisted() { return "hoisted"; }
var later = 1;
function counter() { let n = 0; return { inc: () => ++n, get: () => n }; }
const c = counter(); c.inc(); c.inc(); console.log(c.get());
function args() { return arguments.length + ":" + Array.prototype.slice.call(arguments).join("|"); }
console.log(args(1, 2, 3), args());
function defaults(a, b = a * 2, ...rest) { return [a, b, rest]; }
console.log(defaults(1), defaults(1, 5, 6, 7), defaults.length);
const obj = { name: "o", regular() { return this.name; }, arrow: () => typeof this, nested() { return [1].map(() => this.name); } };
console.log(obj.regular(), obj.arrow(), obj.nested());
const unbound = obj.regular; console.log(unbound === obj.regular);
function Point(x, y) { this.x = x; this.y = y; }
Point.prototype.sum = function () { return this.x + this.y; };
const p = new Point(2, 3); console.log(p.sum(), p instanceof Point, p.constructor === Point, Object.keys(p));
const bound = function (z) { return this.x + z; }.bind({ x: 10 }, 5);
console.log(bound(), bound.name, function named() {}.name, (() => {}).name);
const f = function () {}; const g = () => {}; console.log(f.name, g.name);
console.log((function () { return typeof this; })(), (function () { "use strict"; return typeof this; })());
console.log(Math.max.apply(null, [1, 9, 3]), Array.prototype.concat.call([1], [2], 3));
try { tdz; let tdz = 1; } catch (e) { console.log(e.name, e.message); }
try { const k = 1; k = 2; } catch (e) { console.log(e.name, e.message); }
function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); } console.log(fact(20), fact(25));
const compose = (...fs) => x => fs.reduceRight((v, f) => f(v), x);
console.log(compose(x => x + 1, x => x * 2)(5));
(function iife() { console.log("iife", typeof iife); })();
var x = "global"; function shadow() { var x = "local"; { let x = "block"; } return x; } console.log(shadow(), x);
console.log(new Function("a", "b", "return a * b")(6, 7));
function deep(n) { return n === 0 ? 0 : 1 + deep(n - 1); } console.log(deep(200));
