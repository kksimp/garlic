// Generators (§27.5): yield, yield*, return, throw, try/finally, loops.
function* count(n) { for (let i = 0; i < n; i++) yield i; }
console.log([...count(4)]);

function* echo() { let x = 0; while (true) { x = yield x * 10; if (x === undefined) return "end"; } }
const e = echo();
console.log(e.next(), e.next(1), e.next(2), e.next(), e.next());

function* inner() { const r = yield "a"; yield r; return "inner-done"; }
function* outer() { const v = yield* inner(); yield v; yield* [1, 2]; }
const o = outer();
console.log(o.next(), o.next("sent"), o.next(), o.next(), o.next(), o.next());

function* guarded() {
  try { yield 1; yield 2; } finally { console.log("cleanup"); }
}
const g1 = guarded();
console.log(g1.next());
console.log(g1.return(9));
console.log(g1.next());

function* catcher() {
  while (true) {
    try { yield "waiting"; } catch (err) { console.log("caught", err); yield "recovered"; }
  }
}
const c = catcher();
c.next();
console.log(c.throw("boom"));
console.log(c.next());

const fresh = count(3);
try { fresh.throw(new Error("early")); } catch (err) { console.log("early throw:", err.message); }
console.log(fresh.next());

for (const v of count(100)) { if (v === 2) break; console.log("v", v); }
function* naturals() { let i = 1; for (;;) yield i++; }
let sum = 0;
for (const n of naturals()) { if (n > 10) break; sum += n; }
console.log("sum", sum);

function* closing() { try { yield 1; yield 2; } finally { console.log("closed"); } }
for (const x of closing()) { console.log("x", x); break; }

const obj = { *items() { yield* Object.keys(this); }, a: 1, b: 2 };
console.log([...obj.items()]);
class Tree {
  constructor(v, kids) { this.v = v; this.kids = kids || []; }
  *[Symbol.iterator]() { yield this.v; for (const k of this.kids) yield* k; }
}
console.log([...new Tree(1, [new Tree(2, [new Tree(3)]), new Tree(4)])]);

function* labelled() {
  outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (j === 1) continue outer;
      if (i === 2) break outer;
      yield `${i}${j}`;
    }
  }
  switch (yield "sw") { case 1: yield "one"; break; default: yield "other"; }
}
const l = labelled();
console.log(l.next().value, l.next().value, l.next().value, l.next(1).value, l.next().done);

const closures = [];
function* lets() { for (let i = 0; i < 3; i++) { closures.push(() => i); yield i; } }
[...lets()];
console.log(closures.map(f => f()));

function* args() { yield arguments.length; yield arguments[1]; }
console.log([...args(5, 6, 7)]);
const it = count(2);
console.log(it[Symbol.iterator]() === it, Object.prototype.toString.call(it));
console.log(typeof count.prototype, Object.getPrototypeOf(it) === count.prototype);
function* selfish() { yield me.next(); }
const me = selfish();
try { me.next(); } catch (err) { console.log(err.name, err.message); }
const [p, q, ...rest] = count(5);
console.log(p, q, rest);
console.log(Array.from(count(3), x => x * 2));
function* objy() { const o = { a: yield 1, [yield 2]: yield 3 }; return o; }
const oy = objy();
oy.next(); oy.next("A"); oy.next("key");
console.log(oy.next("C"));
function* tpl() { return `x${yield 1}y${yield 2}z`; }
const t = tpl(); t.next(); t.next("1");
console.log(t.next("2"));
function* cond(f) { return f ? yield "yes" : yield "no"; }
console.log([...cond(true)], [...cond(false)]);
function* calls() { console.log("sum", Math.max(yield 1, yield 2)); }
const ca = calls(); ca.next(); ca.next(10); ca.next(20);
