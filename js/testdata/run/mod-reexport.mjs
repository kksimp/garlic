import * as r from "./mod/reexport.mjs";
import { c, aName } from "./mod/reexport.mjs";
import * as both from "./mod/star-both.mjs";
console.log(Object.keys(r).join());
console.log(r.aNs.name, r.aDefault("x"), r.name, c, aName);
console.log(Object.keys(both).join(), both.only1, both.only2, "dup" in both);
for (const spec of ["./mod/uses-dup.mjs", "./mod/missing-export.mjs"]) {
  try {
    await import(spec);
  } catch (e) {
    console.log(e.name + ": " + e.message);
  }
}
