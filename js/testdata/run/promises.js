const log = (...a) => console.log(...a);
log("start");
setTimeout(() => log("timeout 0"), 0);
Promise.resolve(1).then(v => { log("then", v); return v + 1; }).then(v => log("then2", v));
queueMicrotask(() => log("microtask"));
new Promise((res, rej) => { log("executor"); res("done"); res("ignored"); rej(new Error("ignored")); })
  .then(v => log("resolved", v));
Promise.reject(new Error("boom")).catch(e => log("caught", e.message)).finally(() => log("finally"));
const thenable = { then(ok) { log("thenable called"); ok(42); } };
Promise.resolve(thenable).then(v => log("thenable value", v));
Promise.all([1, Promise.resolve(2), new Promise(r => setTimeout(() => r(3), 10))]).then(vs => log("all", vs));
Promise.allSettled([Promise.reject(new Error("x")), 5]).then(rs => log("allSettled", JSON.stringify(rs.map(r => r.status))));
Promise.race([new Promise(r => setTimeout(() => r("slow"), 50)), new Promise(r => setTimeout(() => r("fast"), 5))]).then(v => log("race", v));
Promise.any([Promise.reject(1), Promise.resolve("any ok")]).then(v => log("any", v));
Promise.any([Promise.reject(1)]).catch(e => log("any failed", e.constructor.name, e.errors));
Promise.all([]).then(v => log("all empty", v));
const p = new Promise(r => r());
const chained = p.then(() => chained);
chained.catch(e => log(e.constructor.name, e.message));
Promise.resolve().then(() => { throw new TypeError("in then"); }).then(() => log("skipped"), e => log("rejected with", e.name));
Promise.resolve(7).finally(() => 99).then(v => log("finally keeps", v));
let n = 0;
const iv = setInterval(() => { n++; if (n === 3) { clearInterval(iv); log("interval x3"); } }, 20);
log("end", typeof Promise, Object.prototype.toString.call(p));
try { Promise(); } catch (e) { log(e.message); }
try { new Promise(5); } catch (e) { log(e.message); }
