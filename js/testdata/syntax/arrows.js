x => x;
() => {};
(a, b) => a + b;
(a = 1, {b}, [c], ...d) => ({a, b, c, d});
a => b => a + b;
(a) => { return a; };
f(x => x * 2, y => {});
