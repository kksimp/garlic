// String length, indexes and the indexing methods on ASCII and non-ASCII
// text (object.ail `get`, string.ail `ascii_string_method`, `split_string`).
var texts = ["hello, world", "", "a", "héllo wörld", "日本語テキスト", "tab\there\nnl"];
for (var t of texts) {
  var row = [t.length, t[0], t[1], t[t.length - 1], t[t.length], t[-1], t[1.5]];
  row.push(t.charAt(1), t.charAt(-1), t.charAt(99), t.charCodeAt(0), t.charCodeAt(2), t.charCodeAt(99));
  row.push(t.codePointAt(1), t.codePointAt(99), t.at(-1), t.at(-99), t.at(1));
  console.log(JSON.stringify(row));
  console.log(JSON.stringify([t.slice(1), t.slice(-3), t.slice(2, -2), t.slice(5, 2), t.substring(4, 1), t.substring(-2, 3), t.substr(-4, 2), t.substr(2)]));
  console.log(JSON.stringify([t.indexOf("l"), t.indexOf("l", 4), t.indexOf("", 3), t.indexOf("", 99), t.indexOf("ö"), t.indexOf("😀", 2), t.indexOf("zz")]));
  console.log(JSON.stringify([t.includes("o"), t.includes("o", 9), t.includes("é"), t.startsWith("he"), t.startsWith("l", 2), t.startsWith("é", 1), t.endsWith("d"), t.endsWith("l", 4), t.endsWith("😀", 3)]));
  console.log(JSON.stringify([t.split(""), t.split("l"), t.split("o", 1), t.split(" "), t.split("😀"), t.split(), t.split("", 2), t.split("l", 0)]));
}
var e = "a😀b😀c";
console.log(e.length, e[0], e.charAt(3), e.charCodeAt(0), e.charCodeAt(1), e.codePointAt(1), e.codePointAt(2), e.at(-1));
console.log(e.indexOf("😀"), e.indexOf("😀", 2), e.indexOf("b"), e.includes("😀b"), e.startsWith("😀", 1), e.endsWith("😀c"), e.slice(1, 3), e.slice(3), e.substring(4), e.substr(-3, 3));
console.log(JSON.stringify([e.split("😀"), e.split("b"), e.split("😀", 1)]));
var s = "x".repeat(1000);
var n = 0;
for (var i = 0; i < s.length; i++) if (s[i] === "x" && s.charCodeAt(i) === 120) n++;
console.log(n);
var w = new String("abc");
console.log(w.length, w[1], w[5], Object.keys(w).join(","), 1 in w, 3 in w);
var u = new String("ü😀");
console.log(u.length, u[0], JSON.stringify(Object.keys(u)));
console.log("a,b,,c".split(","), ",".split(","), "".split(","), "".split(""), "abc".split("abc"));
console.log(["b", "a", "C", "é", "e"].sort().join(""), ["10", "9", "1"].sort().join(","));
console.log("abc".indexOf({ toString: function () { return "c"; } }), "abc".slice({ valueOf: function () { return 1; } }));
try { "abc".includes(/a/); } catch (e) { console.log(e.constructor.name, e.message); }
try { "abc".startsWith(/a/); } catch (e) { console.log(e.constructor.name, e.message); }
