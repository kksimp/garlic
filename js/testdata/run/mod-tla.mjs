console.log("main: start");
const first = await Promise.resolve(1);
console.log("first", first);
const { default: len } = await import("./mod/tla-user.mjs");
console.log("len", len);
for await (const x of [Promise.resolve("a"), "b"]) console.log("for await", x);
const t = await new Promise((resolve) => setTimeout(() => resolve("timer"), 5));
console.log(t);
