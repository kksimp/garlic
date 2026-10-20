// Map, Set, Date and RegExp.
const m = new Map(); m.set("a", 1).set({ k: 1 }, 2).set(NaN, "nan");
console.log(m.size, m.get("a"), m.get(NaN), m.has("b"), m.delete("a"), m.size, [...m.keys()].length);
const s = new Set([3, 1, 3, 2]); s.add(1); s.add(4);
console.log(s.size, [...s], s.has(2), s.delete(3), [...s].sort());
const counts = new Map(); for (const w of "the cat the hat the end".split(" ")) counts.set(w, (counts.get(w) || 0) + 1);
console.log(counts, [...counts.entries()]);
m.forEach((v, k) => typeof k === "string" && console.log("entry", k, v));
const d = new Date(Date.UTC(2024, 1, 29, 12, 30, 15, 250));
console.log(d.toISOString(), d.getTime(), d.getUTCDay(), d.getUTCMonth(), JSON.stringify({ d }));
console.log(new Date("2020-01-02T03:04:05Z").getTime(), new Date("2020-01-02").toISOString(), Date.parse("garbage"), new Date(NaN).getTime());
console.log(new Date(0).toUTCString(), new Date(2000, 0, 31, 0, 0, 0).getUTCDate());
const re = /(\d+)-(\d+)/;
console.log(re.test("10-20"), re.exec("a 10-20 b").index, "10-20".match(re)[2], re.source, re.flags, String(/a\/b/gi));
console.log("a1b22c333".match(/\d+/g), "x-y_z".split(/[-_]/), "2024-01-05".replace(/(\d+)-(\d+)-(\d+)/, "$3/$2/$1"), "abc".search(/c/));
console.log("John Smith".replace(/(\w+)\s(\w+)/, (all, f, l) => `${l}, ${f}`), "aaa".replace(/a/g, "b"), /^hello$/i.test("HELLO"));
const g = /o/g; console.log(g.test("foo"), g.lastIndex, g.test("foo"), g.lastIndex, g.test("foo"), g.lastIndex);
const named = "2024-06".match(/(?<year>\d{4})-(?<month>\d{2})/); console.log(named.groups.year, named.groups.month);
console.log([..."a1b2".matchAll(/\d/g)].map(x => x[0] + "@" + x.index));
