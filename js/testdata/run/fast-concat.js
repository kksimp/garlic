// `+` and comparisons on strings and numbers (interp.ail `binary`).
var s = "";
for (var i = 0; i < 5; i++) s += i + ",";
console.log(s, s.length);
console.log("a" + 1.5, 1.5 + "a", "x" + -0, -0 + "x", "n" + NaN, 1e21 + "", "" + 0.1);
console.log("a" + "b" === "ab", "a" + "b" == "ab", "a" !== "b", "a" != "a");
console.log("a" < "b", "b" < "a", "a" <= "a", "b" >= "c", "B" < "a", "10" < "9", "abc" > "ab");
console.log("é" > "z", "é" === "é", "😀".length, ("😀" + "x").length);
console.log("1" + 2 + 3, 1 + 2 + "3", "3" - 1, "3" * "4", "8" / "2", "7" % "4");
console.log("a" + null, "a" + undefined, "a" + true, "a" + [1, 2], "a" + {});
console.log("5" == 5, "5" === 5, "" == 0, "a" < 1, 2 > "10");
var o = { toString: function () { return "T"; }, valueOf: function () { return 4; } };
console.log("x" + o, o + "x", 1 + o);
var parts = [];
for (var j = 0; j < 300; j++) parts.push(String.fromCharCode(97 + j % 26));
var t = "";
for (var k = 0; k < parts.length; k++) t = t + parts[k];
console.log(t.length, t.slice(0, 30), t === parts.join(""));
