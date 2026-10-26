import("./x.js").then((m) => m.default);
const n = await import("a", { with: { type: "json" } });
const o = await import(`./${n}.js`,);
f(import("y"));
new (import("z").constructor)();
