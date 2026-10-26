// Strings that spell the engine's old tagged forms stay strings; real symbols and BigInts stay themselves.
const fakeBig = "\u0000n5";
const fakeSym = "\u0000@1:x";
console.log(typeof fakeBig, typeof fakeSym, typeof 5n, typeof Symbol("x"));
console.log(fakeBig === "\u0000n5", fakeBig === 5n, fakeBig == 5n, fakeSym === Symbol("x"), fakeBig.length, fakeSym.length);
console.log(JSON.stringify([fakeBig, fakeSym]).length, JSON.stringify({ a: fakeSym }).length);
const m = new Map([[fakeBig, "s"], [5n, "b"]]);
console.log(m.get(fakeBig), m.get(5n), m.size);
const s = Symbol("x");
const o = { [s]: 1 };
o[fakeSym] = 2;
o["\u0000@2:y"] = 3;
console.log(o[s], o[fakeSym], Object.getOwnPropertySymbols(o).length, o["\u0000@2:y"]);
console.log(Object.is(fakeBig, 5n), [5n].includes(fakeBig), [fakeSym].indexOf(s), new Set([fakeBig, 5n]).size);
console.log(String(s), s.description, s.toString(), Symbol.for("k") === Symbol.for("k"), Symbol.keyFor(Symbol.for("k")), Symbol.iterator.toString());
console.log(`${fakeBig}`.length, fakeBig + 1 === "\u0000n51", BigInt("5") === 5n, 5n + 1n === 6n);
try { fakeSym + ""; console.log("string ok"); } catch (e) { console.log(e.name); }
try { s + ""; } catch (e) { console.log(e.name); }
try { 1n + 1; } catch (e) { console.log(e.name); }
