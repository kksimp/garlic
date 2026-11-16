// Generators and async functions made many times from the same code share
// one compiled body (gen.ail code_for); each call has its own frame.
var gens = [];
for (var i = 0; i < 5; i++) {
  gens.push(function* (n) { var k = n; while (k < n + 3) { try { yield k * 10 + i; } finally { k++; } } return "done" + n; });
}
var out = [];
for (var g = 0; g < gens.length; g++) {
  var it = gens[g](g);
  out.push(Array.from({ length: 4 }, function () { var r = it.next(); return r.done ? r.value : r.value; }).join("/"));
}
console.log(out.join(" "));
function* same() { yield 1; yield 2; }
function* same2() { yield 1; yield 2; }
console.log([...same()].join(), [...same2()].join(), same === same2);
var results = [];
var tasks = [];
for (let j = 0; j < 6; j++) {
  const f = async (x) => { await null; if (x === 3) throw new Error("bad " + x); return x * x; };
  tasks.push(f(j).then(function (v) { results.push(v); }, function (e) { results.push(e.message); }));
}
async function* ag() { for (let k = 0; k < 3; k++) { await null; yield k; } }
Promise.all(tasks).then(function () { console.log(results.join(",")); return part2(); });
async function part2() {
  var acc = [];
  for (var r = 0; r < 2; r++) for await (var v of ag()) acc.push(v);
  console.log(acc.join(""));
  label: for (var q = 0; q < 3; q++) { for (var w = 0; w < 3; w++) { await null; if (w === 1) continue label; if (q === 2) break label; acc.push(q + ":" + w); } }
  console.log(acc.join(" "));
}
