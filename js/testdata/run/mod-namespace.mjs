import * as ns from "./mod/a.mjs";
console.log(ns);
console.log(Object.prototype.toString.call(ns), Object.getPrototypeOf(ns), Object.isExtensible(ns));
console.log(JSON.stringify(Object.getOwnPropertyDescriptor(ns, "name")));
console.log("name" in ns, "nope" in ns, ns.nope, Symbol.toStringTag in ns);
console.log(Object.keys(ns).join(), Object.getOwnPropertyNames(ns).join());
for (const k in ns) console.log("key", k);
console.log({ ...ns }.name, JSON.stringify(ns));
