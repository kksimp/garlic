// Function calls: plain, closures, arrows as callbacks, recursion, methods.
function add(a, b) { return a + b; }
function makeCounter() { var n = 0; return function () { n += 1; return n; }; }
function fib(n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }
var total = 0;
for (var i = 0; i < 100000; i++) total = add(total, i % 7);
var c = makeCounter();
for (var j = 0; j < 50000; j++) c();
var xs = [];
for (var k = 0; k < 2000; k++) xs.push(k);
var mapped = 0;
for (var r = 0; r < 20; r++) {
  mapped += xs.map((x) => x * 2).filter((x) => x % 3 === 0).reduce((s, x) => s + x, 0);
  xs.forEach(function (x) { total += x & 1; });
}
console.log(total, c(), fib(20), mapped);
