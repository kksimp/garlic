// Async generators (§27.6) and for await (§14.7.5).
const sleep = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
async function* ticks(n) {
  for (let i = 0; i < n; i++) { await sleep(5); yield i; }
  return "done";
}
(async () => {
  for await (const t of ticks(3)) console.log("tick", t);
  const it = ticks(2);
  console.log(await it.next(), await it.next(), await it.next(), await it.next());
  for await (const v of [1, Promise.resolve(2), sleep(3, 3)]) console.log("sync source", v);
  const g = ticks(5);
  const all = await Promise.all([g.next(), g.next(), g.next()]);
  console.log("queued", all.map(r => r.value).join(","));
  console.log(await g.return("early"), await g.next());
  async function* guarded() { try { yield 1; yield 2; } finally { console.log("agen cleanup"); } }
  for await (const x of guarded()) { console.log("x", x); break; }
  async function* thrower() { yield 1; throw new Error("agen boom"); }
  try { for await (const x of thrower()) console.log("before", x); } catch (e) { console.log("caught", e.message); }
  const fresh = ticks(1);
  console.log(await fresh.throw(new Error("x")).catch(e => "rejected " + e.message), await fresh.next());
  const obj = { async *[Symbol.asyncIterator]() { yield "a"; yield await sleep(1, "b"); } };
  const got = [];
  for await (const s of obj) got.push(s);
  console.log(got.join(""), Object.prototype.toString.call(ticks(0)), typeof ticks(0)[Symbol.asyncIterator]);
  class Feed { async *items() { yield* []; } }
  console.log(typeof Feed.prototype.items);
  function* syncGen() { try { yield 1; yield 2; } finally { console.log("sync closed"); } }
  for (const y of syncGen()) { console.log("y", y); break; }
})();
