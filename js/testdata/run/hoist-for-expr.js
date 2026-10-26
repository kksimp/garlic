// A `var` in the body of a `for` whose init is an expression is hoisted (§14.3.2).
function f() {
  var e;
  for (e = 0; e < 2; e++) {
    var g = e * 2;
  }
  return g;
}
console.log(f());
function h(a) {
  if (a) lbl: {
    for (var i = 0; i < 1; i++) { var k = 5; }
    return typeof k + typeof g2;
    var g2;
  }
}
console.log(h(true));
