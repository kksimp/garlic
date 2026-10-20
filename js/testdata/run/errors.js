// Errors and their messages, as V8 words them.
const tries = [
  () => undefined.foo,
  () => null.foo = 1,
  () => ({}).method(),
  () => notDeclared,
  () => new (() => {})(),
  () => [].reduce((a, b) => a),
  () => new Array(-1),
  () => (1).toFixed(101),
  () => "x".repeat(-1),
  () => { "use strict"; undeclaredStrict = 1; },
  () => Symbolish.iterator,
  () => JSON.parse(""),
  () => decodeURIComponent("%"),
  () => { throw new Error("plain", { cause: "why" }); },
  () => 1 instanceof 2,
  () => "a" in "abc",
  () => { class A { constructor() { this.x; } } class B extends A { constructor() { this.y = 1; super(); } } new B(); },
];
for (const t of tries) {
  try { t(); console.log("no error"); } catch (e) { console.log(`${e.name}: ${e.message}`); }
}
const err = new TypeError("boom");
console.log(err instanceof TypeError, err instanceof Error, Object.prototype.toString.call(err), err.toString(), err.stack.split("\n")[0]);
console.log(new Error("x", { cause: 1 }).cause, new RangeError().message === "", Error("no new").message);
throw new SyntaxError("thrown at top level");
