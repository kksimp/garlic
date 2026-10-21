function outer() { var local = 7; const T = (x) => x * 2; return [eval("T(local)"), (0, eval)("typeof local"), eval("var added = 1; added + local"), added]; }
console.log(outer());
function strict() { "use strict"; eval("var inner = 3"); return typeof inner; }
console.log(strict(), typeof added);
