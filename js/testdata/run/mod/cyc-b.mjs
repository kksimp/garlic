import { a, fa } from "./cyc-a.mjs";
export const b = "B";
export function getA() {
  return a;
}
console.log("cyc-b: fa() =", fa());
try {
  console.log(a);
} catch (e) {
  console.log("cyc-b:", e.name + ": " + e.message);
}
