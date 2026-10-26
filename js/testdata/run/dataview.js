// DataView: every accessor, both byte orders, bounds.
const buf = new ArrayBuffer(16);
const dv = new DataView(buf);
dv.setInt8(0, -2); dv.setUint8(1, 255); dv.setInt16(2, -300); dv.setUint16(4, 65000, true);
dv.setInt32(6, -123456789, true); dv.setUint32(10, 4000000000);
console.log(dv.getInt8(0), dv.getUint8(0), dv.getUint8(1), dv.getInt16(2), dv.getInt16(2, true), dv.getUint16(4, true), dv.getUint16(4));
console.log(dv.getInt32(6, true), dv.getUint32(6, true), dv.getUint32(10), dv.getInt32(10), dv.getUint32(10, true));
console.log(Array.from(new Uint8Array(buf)).join());
const f = new DataView(new ArrayBuffer(12));
f.setFloat32(0, 3.14159); f.setFloat64(4, -0.1, true);
console.log(f.getFloat32(0), f.getFloat32(0, true), f.getFloat64(4, true), f.getFloat64(4));
f.setFloat64(4, Math.PI); console.log(f.getFloat64(4), Array.from(new Uint8Array(f.buffer, 4)).join());
f.setFloat32(0, NaN); console.log(f.getFloat32(0), f.getUint8(0));
const part = new DataView(buf, 4, 8);
console.log(part.byteOffset, part.byteLength, part.buffer === buf, part.getUint16(0, true));
console.log(Object.prototype.toString.call(dv), dv instanceof DataView, ArrayBuffer.isView(dv), typeof dv.getFloat64);
try { dv.getInt32(14); } catch (e) { console.log(e.name); }
try { dv.setInt8(-1, 0); } catch (e) { console.log(e.name); }
try { new DataView({}); } catch (e) { console.log(e.name); }
try { new DataView(buf, 20); } catch (e) { console.log(e.name); }
try { new DataView(buf, 4, 20); } catch (e) { console.log(e.name); }
