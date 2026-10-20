// Arithmetic, comparison, equality and conversions (ECMA-262 §7.1, §13).
console.log(1 + "2", "3" * "4", 10 / 4, 7 % 3, -7 % 3, 2 ** 10, 2 ** -1, 5.5 % 2);
console.log(1 / 0, -1 / 0, 0 / 0, -0 === 0, Object.is(-0, 0), [-0]);
console.log(null == undefined, null === undefined, "1" == 1, 0 == "", "0" == false, NaN == NaN);
console.log([] + [], [] + {}, [1, 2] + "", ({}).toString(), String(null), String([1, [2, 3]]));
console.log(1 < 2, "10" < "9", 10 < 9, "a" < "b", null >= 0, undefined < 1, "abc" < "abd");
console.log(5 & 3, 5 | 3, 5 ^ 3, ~5, 1 << 31, -8 >> 1, -8 >>> 1, 2 ** 32 | 0, 1.9 | 0);
console.log(typeof null, typeof [], typeof "", typeof 1, typeof true, typeof undefined, typeof {}, typeof (() => 1));
console.log(!!"", !!"0", !![], !!0, !!NaN, !!{}, !!-1);
let a = null; console.log(a ?? "dflt", 0 ?? 1, a?.b, a?.b.c.d, (a || {}).x, 0 || "x", 1 && 2);
let o = { n: 1 }; o.n += 2; o.n **= 2; o.m ||= 5; o.m &&= 6; o.k ??= 7; console.log(o);
let i = 5; console.log(i++, i, ++i, i--, --i);
console.log(+"  42  ", +"0x1f", +"1e3", +"", +"abc", +[], +[5], +true, -"3", +"0b101", +"-0x10");
console.log("a" in { a: 1 }, 1 in [5, 6], "length" in [], delete o.n, o);
console.log(void 0, (1, 2, 3), typeof void 0);
console.log(0.1 + 0.2, 1e21, 1e-7, 123456789012345680000, 2 ** 53, -1e-7, 100 / 3);
console.log(Number.MAX_SAFE_INTEGER, Number.EPSILON > 0, Number.MIN_VALUE, Number.MAX_VALUE);
