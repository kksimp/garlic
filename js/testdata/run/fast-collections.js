// Map and Set keys by SameValueZero, small and large (builtins.ail
// coll_find: a scan below 16 entries, a hash index above).
function keysOf(c) { var out = []; c.forEach(function (v, k) { out.push(typeof k === "object" ? "obj" : String(k)); }); return out.join(","); }
for (var size of [3, 40]) {
  var m = new Map();
  var o1 = {}, o2 = {};
  var sym = Symbol("s");
  for (var i = 0; i < size; i++) m.set("k" + i, i);
  m.set(NaN, "nan").set(0, "zero").set(-0, "minus zero").set("0", "string zero");
  m.set(o1, "o1").set(o2, "o2").set(sym, "sym").set(true, "t").set("true", "st");
  m.set(null, "null").set(undefined, "undef").set(1.5, "x").set(1e21, "big").set(Infinity, "inf");
  m.set(10n, "bigint");
  console.log(size, m.size, m.get(NaN), m.get(0), m.get(-0), m.get("0"), m.get(o1), m.get(o2), m.get({}), m.get(sym));
  console.log(m.get(true), m.get("true"), m.get(null), m.get(undefined), m.get(1.5), m.get(1e21), m.get(Infinity), m.get(-Infinity), m.get(10n), m.get(1));
  console.log(m.has("k0"), m.has("k" + (size - 1)), m.has("k" + size), m.has(0 / 0), Object.is(Array.from(m.keys())[size + 1], 0));
  console.log(m.delete("k1"), m.delete("k1"), m.has("k1"), m.get("k2"), m.get("k" + (size - 1)), m.size);
  m.set("k1", "again");
  var ks = Array.from(m.keys());
  console.log(ks[ks.length - 1], ks[0], ks[1], m.get("k1"));
  for (var j = 0; j < size; j += 2) m.delete("k" + j);
  var found = 0;
  for (var j2 = 0; j2 < size; j2++) if (m.has("k" + j2)) found++;
  console.log(m.size, found, m.get("k3"), m.get(o2), m.get(NaN));
  m.clear();
  console.log(m.size, m.get(o1), m.has(NaN));
  m.set(o1, 1);
  console.log(m.size, m.get(o1));

  var s = new Set();
  for (var i2 = 0; i2 < size; i2++) s.add(i2 % 2 ? i2 : "v" + i2);
  s.add(NaN).add(NaN).add(0).add(-0).add(o1).add(o1).add("o1");
  console.log(s.size, s.has(NaN), s.has(-0), s.has(0), s.has(o1), s.has(o2), s.has(1), s.has("1"), s.has("v0"));
  console.log(s.delete(1), s.delete(1), s.has(1), s.delete(NaN), s.has(NaN), s.size);
  s.add(1);
  var vs = Array.from(s);
  console.log(vs[vs.length - 1], Object.is(vs[0], "v0") ? "v0" : vs[0]);
  for (var j3 = 0; j3 < size; j3++) s.delete(j3);
  console.log(s.size, s.has(3), s.has("v2"), s.has(o1));
  s.clear();
  console.log(s.size, s.has("v0"));
}
var big = new Map();
for (var n = 0; n < 2000; n++) big.set(n, n * 2);
var sum = 0;
for (var n2 = 0; n2 < 2000; n2++) sum += big.get(n2);
console.log(big.size, sum, big.get(1999), big.get(2000), big.get("5"));
var seen = new Set();
var dupes = 0;
for (var n3 = 0; n3 < 3000; n3++) { var k3 = (n3 * 7) % 1000; if (seen.has(k3)) dupes++; else seen.add(k3); }
console.log(seen.size, dupes);
var lru = new Map();
for (var n4 = 0; n4 < 500; n4++) {
  var key = "k" + (n4 % 50);
  if (lru.has(key)) { var v = lru.get(key); lru.delete(key); lru.set(key, v + 1); } else lru.set(key, 1);
  if (lru.size > 30) lru.delete(lru.keys().next().value);
}
console.log(lru.size, Array.from(lru.entries()).slice(0, 3).join(";"));
var wm = new WeakMap();
var objs = [];
for (var n5 = 0; n5 < 40; n5++) { objs.push({ i: n5 }); wm.set(objs[n5], n5); }
wm.delete(objs[3]);
console.log(wm.get(objs[39]), wm.get(objs[3]), wm.has(objs[4]), wm.get({}));
console.log(new Map([[1, "a"], [1, "b"], [2, "c"]]).size, new Set("hello").size, keysOf(new Map([["x", 1], [NaN, 2]])));
