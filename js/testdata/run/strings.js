// Templates, escapes, UTF-16 and URI coding.
const name = "AIL", n = 3;
console.log(`Hello ${name}! ${n * 2} ${[1, 2]} ${{}} ${null} ${undefined}`);
function tag(strings, ...values) { return strings.raw.join("|") + " / " + values.join(","); }
console.log(tag`a${1}b${2}c\n`);
console.log("tab\there", "nl\\n", 'q\'s', "\x41B\u{43}", "multi\
line");
console.log(encodeURIComponent("a b&c=d/é?"), encodeURI("http://x.y/a b?q=1&r=é#h"), decodeURIComponent("%E2%9C%93%20ok"), decodeURI("%3Fa%20b"));
const s = "a😀b";
console.log(s.length, s.charCodeAt(1), s.charCodeAt(2), s.slice(1, 3) === "😀", s.indexOf("b"), s.split("").length);
console.log("ABC".toLowerCase(), "straße".toUpperCase(), "İ".length, " \t\n x  ".trim().length);
console.log(["b", "a", "c"].sort().join(""), "abc" > "abd", "a".codePointAt(0), "abc"[1], "abc"["length"]);
console.log(String(Symbolless = 1), `${[1, [2, [3]]]}`);
