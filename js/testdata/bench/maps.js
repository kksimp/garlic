// Map and Set filled and read; an object as a dictionary.
var m = new Map();
for (var i = 0; i < 20000; i++) m.set("k" + i, i);
var hit = 0;
for (var j = 0; j < 40000; j++) if (m.has("k" + j)) hit += m.get("k" + j) & 1;
var s = new Set();
for (var k = 0; k < 30000; k++) s.add(k % 5000);
var objs = [];
var om = new Map();
for (var n = 0; n < 5000; n++) { var o = { n: n }; objs.push(o); om.set(o, n); }
var osum = 0;
for (var q = 0; q < objs.length; q++) osum += om.get(objs[q]);
for (var del = 0; del < 1000; del++) m.delete("k" + del);
var dict = {};
for (var w = 0; w < 30000; w++) { var key = "w" + (w % 3000); dict[key] = (dict[key] || 0) + 1; }
console.log(m.size, hit, s.size, osum, Object.keys(dict).length, dict.w7);
