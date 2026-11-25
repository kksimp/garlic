// Property reads and writes, prototype methods and getters.
function Point(x, y) { this.x = x; this.y = y; }
Point.prototype.len2 = function () { return this.x * this.x + this.y * this.y; };
Object.defineProperty(Point.prototype, "sum", { get: function () { return this.x + this.y; } });
class Vec extends Point { scale(k) { this.x *= k; this.y *= k; return this; } }
var acc = 0;
var p = new Point(1, 2);
var v = new Vec(3, 4);
var cfg = { a: 1, b: 2, c: { d: 3, e: { f: 4 } } };
for (var i = 0; i < 100000; i++) {
  p.x = i % 10;
  acc += p.len2() + p.sum + cfg.c.e.f + cfg.a;
  if (i % 1000 === 0) v.scale(1);
  acc += v.x;
}
var o = {};
for (var j = 0; j < 20000; j++) o["k" + (j % 100)] = j;
console.log(acc, Object.keys(o).length, o.k99);
