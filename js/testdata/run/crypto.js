// crypto: getRandomValues, randomUUID, subtle.digest (SHA-1, SHA-256).
console.log(typeof crypto, typeof crypto.subtle, typeof crypto.getRandomValues, Object.prototype.toString.call(crypto), crypto === globalThis.crypto);
const u = new Uint32Array(4); const r = crypto.getRandomValues(u);
console.log(r === u, u.length, Array.from(u).every(x => x >= 0 && x <= 4294967295));
const b = new Uint8Array(16); crypto.getRandomValues(b); console.log(b.length);
const id = crypto.randomUUID();
console.log(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id), id !== crypto.randomUUID());
try { crypto.getRandomValues(new Float32Array(2)); } catch (e) { console.log(e.name); }
try { crypto.getRandomValues(new Uint8Array(65537)); } catch (e) { console.log(e.name); }
const hex = buf => Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, "0")).join("");
const te = new TextEncoder();
(async () => {
  console.log("sha256", hex(await crypto.subtle.digest("SHA-256", te.encode("abc"))));
  console.log("sha1", hex(await crypto.subtle.digest({ name: "SHA-1" }, te.encode("abc"))));
  console.log("empty", hex(await crypto.subtle.digest("SHA-256", new Uint8Array(0))));
  console.log("long", hex(await crypto.subtle.digest("SHA-256", te.encode("a".repeat(1000)))));
  console.log("fox", hex(await crypto.subtle.digest("SHA-1", te.encode("The quick brown fox jumps over the lazy dog"))));
  const d = await crypto.subtle.digest("SHA-256", te.encode("abc"));
  console.log(d instanceof ArrayBuffer, d.byteLength);
  try { await crypto.subtle.digest("MD5", te.encode("x")); } catch (e) { console.log("md5", e.name); }
})();
