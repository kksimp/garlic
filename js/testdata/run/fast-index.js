// Index reads and writes on arrays, `arguments` and array-likes, the paths
// the interpreter takes without making a key string (interp.ail
// assign_index, compound_index).
var log = [];
function note(x) { log.push(x); return x; }

var a = [1, 2, 3];
a[0] = 10;
a[2] += 5;
a[1] *= 3;
a[3] = 4;          // one past the end: grows
a[4] = 5;
a[5] = 6;
console.log(a.length, a[0], a[1], a[2], a[3], a[5], a[4] === undefined);
a[1.5] = "half";
a["2"] = 30;
a[-1] = "neg";
console.log(a[1.5], a[2], a[-1], a.length);
a[-0] = "zero";
console.log(a[0], a[NaN] === undefined, Object.keys(a).join(","));

// Evaluation order: object, key, value.
var b = [0, 0];
note("start");
(note(b))[note(1)] = note(7);
console.log(log.join(" ").replace(/0,7/, "b"), b[1]);

// A key that is an object.
var k = { toString: function () { return "1"; } };
b[k] = 9;
b[k] += 1;
console.log(b[1]);

// Logical assignment on elements.
var c = [0, 1, null];
c[0] ||= "a"; c[1] &&= "b"; c[2] ??= "c"; c[1] ||= "no";
console.log(c.join("|"));

// The array shrinks while the right side runs.
var d = [1, 2, 3];
d[2] += (d.length = 1, 5);
console.log(d.length, d[2], String(d));

// A frozen array keeps its elements.
var f = Object.freeze([1, 2]);
f[0] = 9; f[1] += 1;
console.log(f[0], f[1]);

// arguments
function args() { arguments[0] = "A"; arguments[1] += 1; return arguments[0] + arguments[1] + arguments.length; }
console.log(args("a", 1));

// Strings and plain objects with number keys.
var o = {};
o[1] = "one"; o[1] += "!"; o[2.5] = "x";
console.log(JSON.stringify(o), "abc"[1], "abc"[5] === undefined);
var s = "abc";
s[0] = "z";
console.log(s);

// Holes made by length, then filled.
var h = [];
h.length = 3;
h[1] = 1;
for (var i = 0; i < h.length; i++) h[i] = (h[i] || 0) + i;
console.log(h.join(","));

// Typed arrays take the generic path.
var t = new Uint8Array(2);
t[0] = 300; t[1] += 7; t[1] -= 1;
console.log(t[0], t[1]);
