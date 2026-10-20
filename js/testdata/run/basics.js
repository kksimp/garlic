console.log("hello", 1 + 2, [1, 2, 3], {a: 1, b: "x"});
function fib(n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }
console.log(fib(15));
class A { constructor(x) { this.x = x; } get double() { return this.x * 2; } static make() { return new A(5); } }
class B extends A { constructor() { super(7); this.y = 1; } toString() { return `B(${this.x})`; } }
const b = new B();
console.log(b.double, String(b), A.make().x, b instanceof A);
let s = 0; for (let i = 0; i < 10; i++) { if (i % 2) continue; s += i; } console.log(s);
try { null.x } catch (e) { console.log(e.message, e instanceof TypeError) } finally { console.log("fin") }
const {p, q = 3, ...rest} = {p: 1, r: 2, t: 4}; console.log(p, q, rest);
console.log([3,1,2].sort(), [1,2,3].map(x => x * 2).filter(x => x > 2).reduce((a, b) => a + b));
console.log(JSON.stringify({a: [1, {b: 2}], c: "x\n"}), JSON.parse('{"k": [true, null, 1.5]}').k);
console.log((0.1 + 0.2).toFixed(2), (255).toString(16), Math.max(1, 5, 3), parseInt("42px"));
console.log(typeof undefinedVar, typeof fib, "abc".toUpperCase().split(""), "a-b-c".replace(/-/g, "+"));
const fns = []; for (let i = 0; i < 3; i++) fns.push(() => i); console.log(fns.map(f => f()));
label: for (var i = 0; i < 3; i++) { for (var j = 0; j < 3; j++) { if (j == 1) continue label; if (i == 2) break label; console.log(i, j); } }
console.log(new Map([[1, 'a']]), new Set([1, 2, 2]));
undefinedFunction();
