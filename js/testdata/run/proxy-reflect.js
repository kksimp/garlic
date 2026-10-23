const log = [];
const target = { a: 1, b: 2 };
const p = new Proxy(target, {
  get(t, k, r) { log.push("get " + String(k)); return k in t ? Reflect.get(t, k, r) : "default"; },
  set(t, k, v, r) { log.push("set " + k + "=" + v); t[k] = v * 2; return true; },
  has(t, k) { log.push("has " + k); return k !== "hidden" && k in t; },
  deleteProperty(t, k) { log.push("delete " + k); delete t[k]; return true; },
});
console.log(p.a, p.zzz);
p.c = 5;
console.log(target.c, "a" in p, "hidden" in p, delete p.a, target.a);
console.log(log.join(","));
const plain = new Proxy({ x: 1 }, {});
plain.y = 2;
console.log(plain.x, plain.y, "y" in plain, Object.keys(plain).join(), JSON.stringify(plain));
const fn = new Proxy(function add(a, b) { return a + b; }, {
  apply(t, thisArg, args) { return t(...args) * 10; },
  construct(t, args) { return { made: args.length }; },
});
console.log(fn(1, 2), new fn(1, 2, 3).made, typeof fn, typeof p);
class K { constructor(v) { this.v = v; } }
const PK = new Proxy(K, {});
console.log(new PK(7).v, new PK(7) instanceof K);
console.log(Reflect.has({ q: 1 }, "q"), Reflect.ownKeys({ a: 1, [Symbol.iterator]: 2 }).length, Reflect.getPrototypeOf([]) === Array.prototype);
console.log(Reflect.apply(Math.max, null, [1, 3, 2]), Reflect.construct(K, [4]).v, Reflect.defineProperty({}, "z", { value: 1 }), Reflect.deleteProperty({ k: 1 }, "k"));
const frozen = Object.freeze({ f: 1 });
console.log(Reflect.set({}, "m", 1), Reflect.isExtensible(frozen), Reflect.getOwnPropertyDescriptor({ g: 1 }, "g").value);
try { new Proxy(1, {}); } catch (e) { console.log(e.name); }
try { Proxy({}, {}); } catch (e) { console.log(e.name); }
console.log(Object.prototype.toString.call(Reflect));
