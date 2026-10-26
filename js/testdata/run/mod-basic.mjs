import greet, { name, Box, late } from "./mod/a.mjs";
import * as a from "./mod/a.mjs";
import { fromB } from "./mod/b.mjs";
import "./mod/counter.mjs";
console.log("main:", name, greet("main"), new Box(4).double, late, fromB);
console.log(typeof a.default, Object.keys(a).join());
console.log(this === undefined, typeof require, typeof module, typeof exports);
var topVar = 1;
console.log(globalThis.topVar, typeof topVar);
try {
  undeclaredVariable = 1;
} catch (e) {
  console.log(e.name + ": " + e.message);
}
