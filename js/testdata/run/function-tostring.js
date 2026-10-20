function add(a, b) { return a + b }
const sq = x => x * x;
class P { constructor(x) { this.x = x } get y() { return 1 } }
const o = { m() { return 2 }, get g() { return 3 } };
console.log(add.toString());
console.log(sq.toString());
console.log(String(P));
console.log(o.m.toString());
console.log(Object.getOwnPropertyDescriptor(o, "g").get.toString());
console.log(Math.max.toString());
console.log(add.bind(null).toString());
console.log((function* gen() { yield 1 }).toString());
console.log((async () => 1).toString());
try { Function.prototype.toString.call({}) } catch (e) { console.log(e.message) }
console.log(eval("0," + add.toString())(2, 3));
