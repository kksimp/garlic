// TextEncoder and TextDecoder.
const enc = new TextEncoder();
console.log(enc.encoding, Object.prototype.toString.call(enc), enc.encode("") .length);
const bytes = enc.encode("héllo €😀");
console.log(bytes.constructor === Uint8Array, bytes.length, Array.from(bytes).join());
const dec = new TextDecoder();
console.log(dec.encoding, dec.fatal, dec.ignoreBOM, dec.decode(bytes), dec.decode(bytes.buffer), dec.decode(new DataView(bytes.buffer)), dec.decode());
console.log(dec.decode(new Uint8Array([0xEF, 0xBB, 0xBF, 0x41])), new TextDecoder("utf-8", { ignoreBOM: true }).decode(new Uint8Array([0xEF, 0xBB, 0xBF, 0x41])).length);
console.log(JSON.stringify(dec.decode(new Uint8Array([0x41, 0xFF, 0x42]))));
try { new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array([0xFF])); } catch (e) { console.log(e.name); }
console.log(new TextDecoder("UTF8").encoding, new TextDecoder("latin1").encoding, new TextDecoder("utf-16le").encoding);
console.log(new TextDecoder("utf-16le").decode(new Uint8Array([104, 0, 105, 0, 0x3D, 0xD8, 0x00, 0xDE])), new TextDecoder("latin1").decode(new Uint8Array([0x68, 0xE9])));
try { new TextDecoder("nope"); } catch (e) { console.log(e.name); }
const out = new Uint8Array(8);
console.log(JSON.stringify(enc.encodeInto("ab€cd", out)), Array.from(out).join(), JSON.stringify(enc.encodeInto("😀😀😀", new Uint8Array(6))));
const sub = new Uint8Array(bytes.buffer, 1, 2); console.log(dec.decode(sub).length);
try { TextEncoder(); } catch (e) { console.log(e.name); }
