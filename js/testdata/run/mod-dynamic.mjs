console.log("main: start");
const p = import("./mod/a.mjs");
console.log(p instanceof Promise);
const a = await p;
console.log(a.name, (await import("./mod/a.mjs")) === a);
const json = await import("./mod/data.json", { with: { type: "json" } });
console.log(json.default.items.length, json.default.title);
function later() {
  return import("./mod/counter.mjs").then((m) => m.count);
}
console.log(await later());
try {
  await import("./mod/throws.mjs");
} catch (e) {
  console.log("caught", e.message);
}
const e1 = await import("./mod/throws.mjs").catch((e) => e);
const e2 = await import("./mod/throws.mjs").catch((e) => e);
console.log(e1 === e2, e1.message);
const name = "./mod/" + "b.mjs";
console.log(Object.keys(await import(name)).join());
