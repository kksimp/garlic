// Indirect eval, Date setters, and the order an assignment evaluates in.
globalThis.x = 5;
console.log((0, eval)("x * 2"), eval("var y = 3; y + x"), y, eval(7), eval("if (x) { 1 } ; 'last'"));
try { eval("var ="); } catch (e) { console.log(e.name); }

const d = new Date(Date.UTC(2020, 0, 31, 10, 0, 0));
d.setSeconds(d.getSeconds() + 300);
console.log(d.toISOString());
d.setMonth(1);
console.log(d.toISOString(), d.setUTCHours(25, 61), d.setFullYear(2021, 11, 31), new Date(NaN).setDate(1), d.setMilliseconds());
console.log(new Date(NaN).setFullYear(2000), new Date(0).setMinutes(90, 30, 5));

var W = {}, log = [];
(W.first = 5, W).second = W.first;
var o = {};
o[(log.push("key"), "a")] = (log.push("value"), 1);
(log.push("object"), o).b = (log.push("rhs"), 2);
console.log(W.second, log.join(" "), o.a, o.b);
