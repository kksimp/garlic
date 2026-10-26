import { greet, counter, bump } from "./mod-lib.js";
console.log("main module", greet("main"), import.meta.url);
console.log(counter);
bump();
console.log(counter);
