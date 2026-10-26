console.log(typeof import.meta.url, import.meta.url.startsWith("file:///"), import.meta.url.endsWith("/mod-meta.mjs"));
console.log(typeof import.meta.resolve, import.meta.resolve("./mod/a.mjs").endsWith("/mod/a.mjs"));
console.log(typeof import.meta.dirname, typeof import.meta.filename, import.meta === import.meta);
const m = await import("./mod/meta-other.mjs");
console.log(m.url.endsWith("/mod/meta-other.mjs"), m.meta !== import.meta);
