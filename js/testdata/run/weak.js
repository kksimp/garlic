const k = {}, k2 = {};
const wm = new WeakMap([[k, 1]]);
wm.set(k2, "b");
console.log(wm.get(k), wm.get(k2), wm.has(k), wm.has({}), wm.delete(k), wm.has(k), wm.set(k, 3) === wm);
try { wm.set(1, 2); } catch (e) { console.log(e.name); }
const ws = new WeakSet([k]);
console.log(ws.has(k), ws.add(k2) === ws, ws.has(k2), ws.delete(k), ws.has(k));
try { ws.add("s"); } catch (e) { console.log(e.name); }
const r = new WeakRef(k);
console.log(r.deref() === k);
const fr = new FinalizationRegistry(() => {});
console.log(fr.register(k, 1), fr.unregister(k));
try { WeakMap(); } catch (e) { console.log(e.name); }
console.log(typeof WeakMap, WeakMap.prototype.constructor === WeakMap, Object.prototype.toString.call(wm));
try { WeakMap.prototype.get.call(new Map(), k); } catch (e) { console.log(e.name); }
