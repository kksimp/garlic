// JSON.parse and JSON.stringify.
const v = { s: "q\"uote\n", n: 1.5, b: true, z: null, a: [1, "two", { three: 3 }], u: undefined, f() {}, d: new Date(0) };
console.log(JSON.stringify(v));
console.log(JSON.stringify(v, null, 2));
console.log(JSON.stringify([undefined, function () {}, NaN, Infinity]), JSON.stringify("x"), JSON.stringify(undefined), JSON.stringify(null));
console.log(JSON.stringify({ a: 1, b: 2, c: 3 }, ["a", "c"]), JSON.stringify({ a: 1, b: "x" }, (k, val) => typeof val === "number" ? val * 10 : val));
console.log(JSON.stringify({ toJSON() { return { replaced: true }; } }), JSON.stringify({ a: [] , b: {} }, null, "--"));
const parsed = JSON.parse('{"x": [1, 2, {"y": "\\u0041"}], "e": 1e2, "neg": -0.5, "t": true}');
console.log(parsed, parsed.x[2].y, JSON.parse("[]"), JSON.parse(' "s" '));
console.log(JSON.parse('{"a": 1, "b": [2, 3]}', (k, val) => Array.isArray(val) ? val.length : val));
try { JSON.parse("{bad}"); } catch (e) { console.log(e.name); }
try { JSON.parse(""); } catch (e) { console.log(e.name, e.message); }
const cyc = {}; cyc.self = cyc;
try { JSON.stringify(cyc); } catch (e) { console.log(e.name, e.message.startsWith("Converting circular structure to JSON")); }
