// Async functions (§27.7): await order, errors, try/finally, loops.
const log = [];
async function a() { log.push("a1"); await null; log.push("a2"); return "A"; }
async function b() { log.push("b1"); const v = await a(); log.push("b2 " + v); }
b().then(() => { log.push("b done"); console.log(log.join(", ")); });
log.push("sync");

async function fails() { await 1; throw new Error("bad"); }
fails().catch(e => console.log("caught", e.message));

async function guarded() {
  try { await Promise.reject(new TypeError("nope")); }
  catch (e) { console.log("inner catch", e.name); return "handled"; }
  finally { console.log("finally runs"); }
}
guarded().then(v => console.log("guarded ->", v));

const sleep = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
async function loop() {
  let total = 0;
  for (const ms of [30, 10, 20]) total += await sleep(ms, ms);
  for (let i = 0; i < 3; i++) { await null; total += i; }
  let n = 0;
  while (n < 3) n += await 1;
  return total + n;
}
loop().then(v => console.log("loop", v));

const arrow = async x => (await x) * 2;
arrow(sleep(5, 21)).then(v => console.log("arrow", v));
const obj = { async m() { return this.k + await 1; }, k: 41 };
obj.m().then(v => console.log("method", v));
class K { async go(v) { await sleep(1); return `K${v}`; } static async s() { return "static"; } }
new K().go(7).then(console.log);
K.s().then(console.log);

async function all() {
  const r = await Promise.all([sleep(15, "x"), sleep(5, "y"), 3]);
  console.log("all", r);
  const settled = await Promise.allSettled([Promise.reject(1), 2]);
  console.log("settled", JSON.stringify(settled));
}
all();

async function thenable() { return await { then(r) { r("thenable value"); } }; }
thenable().then(console.log);
console.log(Object.prototype.toString.call(a()), a() instanceof Promise);
async function early(x) { if (x) return "early"; await null; return "late"; }
early(true).then(console.log);
early(false).then(console.log);
async function params(x = await_free()) { return x; }
function await_free() { return "default"; }
params().then(console.log);
async function rethrow() { try { await sleep(40); throw "s"; } finally { console.log("fin before reject"); } }
rethrow().catch(v => console.log("rejected with", v));
(async () => {
  const order = [];
  const p1 = (async () => { order.push(1); await null; order.push(3); })();
  order.push(2);
  await p1;
  order.push(4);
  console.log("order", order.join(""));
})();
