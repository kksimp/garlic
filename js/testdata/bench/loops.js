// Loops with let and const bindings, with and without closures.
var t = 0;
for (let i = 0; i < 100000; i++) { const sq = i % 100; t += sq; }
var fns = [];
for (let j = 0; j < 2000; j++) fns.push(() => j);
for (const f of fns) t += f();
var arr = [];
for (let k = 0; k < 20000; k++) arr.push(k);
for (const x of arr) { let y = x * 2; t += y % 5; }
for (const key in { a: 1, b: 2, c: 3 }) t += key.length;
var w = 0;
while (w < 50000) { w++; if (w % 2) continue; t++; }
console.log(t);
