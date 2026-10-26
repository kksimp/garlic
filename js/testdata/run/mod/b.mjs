import greet, { name } from "./a.mjs";
console.log("b: sees", name, greet("b"));
export const fromB = name + "!";
