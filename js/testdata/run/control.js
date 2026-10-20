// Control flow: loops, labels, switch, try/finally, for-in order.
let out = [];
for (const k in { b: 1, a: 2, 10: 3, 2: 4 }) out.push(k);
console.log(out);
for (const [i, v] of ["x", "y"].entries()) console.log(i, v);
for (const ch of "héllo") out.push(ch); console.log(out.length);
function sw(v) {
  switch (v) {
    case 1: return "one";
    case "1": return "string one";
    case 2:
    case 3: { let r = "two or three"; return r; }
    default: return "other";
  }
}
console.log(sw(1), sw("1"), sw(3), sw(9));
function fin() { try { return "try"; } finally { console.log("finally runs"); } }
console.log(fin());
function finOverride() { try { throw 1; } catch (e) { return "catch"; } finally { return "finally"; } }
console.log(finOverride());
let n = 0; do { n++; } while (n < 5); console.log(n);
let w = 0; while (true) { if (++w > 3) break; } console.log(w);
outer: for (let i = 0; i < 3; i++) { inner: for (let j = 0; j < 3; j++) { if (j === 2) continue outer; if (i === 2) break outer; console.log(i, j); } }
try { try { throw new RangeError("inner"); } finally { console.log("cleanup"); } } catch (e) { console.log("caught", e.name); }
try { throw { code: 42 }; } catch ({ code }) { console.log(code); }
try { throw "plain"; } catch { console.log("no binding"); }
blk: { console.log("in block"); break blk; console.log("skipped"); }
const o = { a: 1 }; with (o) { console.log(a); }
console.log([..."ab", ...[1, 2]], Math.max(...[3, 8, 1]));
for (var vi = 0; vi < 2; vi++) {} console.log(vi);
