// console.log's layout of values (Node's util.inspect).
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]);
console.log(["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew"]);
console.log({ name: "Garlic", version: 1, tags: ["browser", "ail"], nested: { deeper: { deepest: { gone: 1 } } } });
console.log({ a: "a long string value that goes on", b: "another long string value here", c: "and a third one" });
console.log([[1, 2, [3, 4, [5, [6]]]], { x: [{}] }], [], {}, [undefined, null], { "key-with-dash": 1, valid_id: 2, 3: "num" });
class Point { constructor() { this.x = 1; this.y = 2; } } console.log(new Point(), [new Point()], Object.create(null));
console.log(function foo() {}, () => {}, class Bar {}, class extends Point {}, Math.max, [function () {}]);
console.log(new Number(5), new String("s"), new Boolean(false), /re/g, new Date(0), -0, [-0], 1e21, "str");
const circ = { name: "c" }; circ.self = circ; console.log(circ);
console.log({ get g() { return 1; }, set s(v) {}, get gs() { return 1; }, set gs(v) {} });
console.log(new Map([["a", { b: 1 }]]), new Set(["x"]), new Map(), new Set(), [new Map([[1, 2]])]);
console.log(Array(150).fill(7));
console.log("a\nb", ["a\nb", "it's", 'say "hi"'], { s: "x'y\"z" });
console.log(Array.from({ length: 30 }, (_, i) => "item" + i));
console.log({ arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28] });
