// ArrayBuffer and typed arrays: element conversion, shared buffers, methods.
const b = new ArrayBuffer(8);
console.log(b.byteLength, ArrayBuffer.isView(b), b instanceof ArrayBuffer, Object.prototype.toString.call(b));
const u8 = new Uint8Array(b);
const u16 = new Uint16Array(b, 2, 2);
u8[0] = 257; u8[1] = -1; u8[2] = 1.9; u8[3] = "7"; u8[9] = 5;
console.log(u8[0], u8[1], u8[2], u8[3], u8[9], u8.length, u16.length, u16.byteOffset, u16.byteLength);
console.log(u16[0], u16[1], u16.buffer === b, u8.buffer === b);
const i8 = new Int8Array([127, 128, 255, -129, 300.7, NaN, Infinity]);
console.log(Array.from(i8).join());
const c8 = new Uint8ClampedArray([-5, 0.5, 1.5, 2.5, 254.5, 255.5, 300, NaN]);
console.log(Array.from(c8).join());
const i16 = new Int16Array([32768, 65535, -32769, 70000]);
console.log(Array.from(i16).join());
const u32 = new Uint32Array([4294967296, -1, 4294967295, 1.5]);
console.log(Array.from(u32).join());
const i32 = new Int32Array([2147483648, -2147483649, 4294967295]);
console.log(Array.from(i32).join());
const f32 = new Float32Array([0.1, 1 / 3, 16777217, 1e39, -1e-46, 3.4028234663852886e38, 1.401298464324817e-45, NaN, -0]);
console.log(Array.from(f32).join(), Object.is(f32[8], -0));
const f64 = new Float64Array([0.1, -1.5e300, 5e-324, 2.2250738585072014e-308, Infinity, -Infinity, NaN]);
console.log(Array.from(f64).join());
console.log(Uint8Array.BYTES_PER_ELEMENT, Float64Array.BYTES_PER_ELEMENT, Int16Array.prototype.BYTES_PER_ELEMENT, new Float32Array(3).byteLength);
console.log(Object.prototype.toString.call(u8), u8 instanceof Uint8Array, Array.isArray(u8), typeof u8, u8.constructor === Uint8Array);
const fb = new Float32Array(1); fb[0] = 1; console.log(new Uint8Array(fb.buffer).join());
const fd = new Float64Array(1); fd[0] = -2.5; console.log(new Uint8Array(fd.buffer).join());
const a = new Uint8Array([5, 1, 4, 2, 3]);
console.log(a.map(x => x * 100).join(), a.filter(x => x > 2).join(), a.slice(1, 3).join(), a.slice(-2).join());
console.log(a.indexOf(4), a.lastIndexOf(9), a.includes(2), a.find(x => x > 3), a.findIndex(x => x > 3), a.findLast(x => x < 3), a.at(-1), a.every(x => x > 0), a.some(x => x > 4));
console.log(a.reduce((s, x) => s + x), a.reduceRight((s, x) => s + "," + x), a.join("-"), String(a), a.toString());
const s = new Uint8Array([5, 1, 4, 2, 3]);
console.log(s.sort().join(), s.reverse().join(), new Float32Array([3, NaN, -1, 2]).sort().join(), new Int8Array([3, -1, 2]).sort((x, y) => y - x).join());
console.log(new Uint8Array(6).fill(7, 1, 4).join(), new Uint8Array([1, 2, 3, 4, 5]).copyWithin(0, 3).join());
const t = new Uint8Array(6); t.set([1, 2, 3], 2); t.set(new Uint8Array([9, 8]), 0);
console.log(t.join(), t.subarray(2, 4).join(), t.subarray(-2).length, t.subarray(1).byteOffset);
const sub = t.subarray(1, 3); sub[0] = 77; console.log(t[1], sub.length);
console.log([...a].join(), [...a.keys()].join(), [...a.entries()].map(e => e.join(":")).join(), Array.from(a.values()).join());
for (const v of new Uint16Array([1, 2])) console.log("of", v);
console.log(Object.keys(new Uint8Array(3)).join(), JSON.stringify(new Uint8Array([1, 2])), "1" in a, "7" in a, 2 in a);
console.log(Uint8Array.from([1, 2, 3], x => x * 2).join(), Uint8Array.of(7, 8).join(), Uint8Array.from("123").join(), Float32Array.from(new Uint8Array([1, 2])).join());
console.log(new Uint8Array(new Uint16Array([1, 258])).join(), new Uint8Array({ length: 2, 0: 4, 1: 5 }).join(), new Uint8Array().length, new Uint8Array(null).length);
console.log(a.toReversed().join(), a.toSorted().join(), a.with(0, 99).join(), a.join());
console.log(b.slice(2, 6).byteLength, new Uint8Array(b.slice(0, 2)).join());
try { new Uint8Array(-1); } catch (e) { console.log(e.name); }
try { new Uint16Array(new ArrayBuffer(3)); } catch (e) { console.log(e.name); }
try { new Uint16Array(new ArrayBuffer(4), 1); } catch (e) { console.log(e.name); }
try { Uint8Array(2); } catch (e) { console.log(e.name); }
try { new Uint8Array(2).set([1, 2, 3]); } catch (e) { console.log(e.name); }
console.log(new Uint8Array([1, 2, 3]), new Float32Array([0.5, 2]), new Int16Array(0), b);
