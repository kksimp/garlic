import("./a.js").then(function (m) {
  return m;
});
var p = import("b", { assert: {} });
