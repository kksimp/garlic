[a, b] = [b, a];
({a, b: {c = 1}, ...d} = obj);
[a.b, c[0], ...d.e] = arr;
[, , x] = y;
for ([k, v] of entries) {}
for ({a} of objs) {}
for (x.y in o) {}
({a = 1}) => a;
([a, b] = [1, 2]) => a;
