// Await in many positions, and how promises and generators print.
const sleep = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
async function f() {
  const { a, b: [c] } = await { a: 1, b: [2] };
  console.log(a, c);
  for (const x of [sleep(5, "p"), "q"]) console.log(await x);
  for (const k in { m: 1, n: 2 }) { await null; console.log(k); }
  let s = "";
  s += await "z";
  const o = { s };
  o.s += await "!";
  console.log(o.s, typeof await f2(), await (async () => 3)());
  switch (await 2) { case 1: console.log("one"); break; case 2: console.log("two"); }
  const arr = [await 1, ...await [2, 3]];
  console.log(arr, `${await "t"}`);
  label: { if (await true) break label; console.log("skipped"); }
  do { console.log("do"); } while (await false);
  return new.target === undefined;
}
async function f2() {}
f().then(v => console.log("ret", v));
console.log(f2(), (function* () {})());
const rej = Promise.reject("r"); rej.catch(() => {});
console.log(Promise.resolve([1, 2]), new Promise(() => {}), rej, { p: Promise.resolve("s") });
