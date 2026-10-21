const s = Symbol("tag"), t = Symbol();
console.log(typeof s, s.toString(), String(t), s.description, t.description, s === s, s === Symbol("tag"));
const o = { [s]: 1, plain: 2 };
console.log(Object.keys(o), o[s], Object.getOwnPropertySymbols(o).length, JSON.stringify(o), s in o);
console.log(Symbol.for("app") === Symbol.for("app"), Symbol.keyFor(Symbol.for("app")), Symbol.keyFor(s));
console.log(typeof Symbol.iterator, Symbol.iterator.toString());
try { s + ""; } catch (e) { console.log(e.message); }
try { +s; } catch (e) { console.log(e.message); }
try { new Symbol(); } catch (e) { console.log(e.message); }
class Range {
  constructor(n) { this.n = n; }
  [Symbol.iterator]() { let i = 0; const n = this.n; return { next: () => i < n ? { value: i++, done: false } : { value: undefined, done: true } }; }
}
console.log([...new Range(4)], Array.from(new Range(3)));
for (const x of new Range(2)) console.log("of", x);
const [a, b] = new Range(5);
console.log(a, b, Math.max(...new Range(6)));
const it = [10, 20][Symbol.iterator]();
console.log(it.next(), it.next(), it.next());
const m = new Map([["k", 1], ["j", 2]]);
console.log([...m.keys()], [...m.values()], [...m], [..."héllo"].length);
const si = new Set([1, 2]).values();
si.next();
console.log([...si]);
console.log(new Map(new Map([[1, "one"]])).get(1), new Set(new Range(3)).size);
