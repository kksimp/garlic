import { count, inc, reset } from "./mod/counter.mjs";
import * as ns from "./mod/counter.mjs";
import dflt, { value, setValue, alias } from "./mod/live-let.mjs";
console.log(count, ns.count);
inc();
inc();
console.log(count, ns.count);
try {
  count = 5;
} catch (e) {
  console.log(e.name + ": " + e.message);
}
reset();
console.log(count, Object.entries(ns).map(([k, v]) => k + ":" + typeof v).join(","));
console.log(value, alias, dflt);
setValue("second");
console.log(value, alias, dflt);
