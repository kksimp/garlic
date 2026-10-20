if (a) b; else if (c) d; else { e; }
while (a) { break; }
do { continue; } while (a);
for (;;) break;
for (var i = 0, n = 10; i < n; i++) {}
for (let j in o) {}
for (const v of xs) {}
outer: for (;;) { inner: while (1) { continue outer; break inner; } }
switch (x) { case 1: a(); break; case 2: default: b(); }
try { throw new Error("e"); } catch (err) { a(err); } finally { b(); }
try {} catch { }
try {} finally {}
block: { break block; }
with (o) { p; }
debugger;
;
