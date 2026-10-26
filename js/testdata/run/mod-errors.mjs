const results = [];
for (const spec of ["./mod/throws.mjs", "./mod/missing-export.mjs", "./mod/uses-dup.mjs"]) {
  await import(spec).catch((e) => results.push(e.name));
}
console.log(results.join());
try {
  await import("./mod/throws.mjs");
} catch (e) {
  console.log(e instanceof Error, e.message);
}
