// Property reads, writes and `in` along prototype chains (object.ail
// get_from, put_obj, set_own, has_property).
var log = [];
var base = {
  get g() { log.push("get g on " + this.name); return this.name + "!"; },
  set s(v) { log.push("set s " + v); this._s = v; },
  ro: 1,
  plain: "base",
};
Object.defineProperty(base, "ro", { writable: false });
var child = Object.create(base);
child.name = "child";
console.log(child.g, child.plain, child.ro, "g" in child, "missing" in child, child.missing);
child.s = 5;
child.ro = 9;
child.plain = "own";
console.log(child._s, child.ro, child.plain, base.plain, Object.keys(child).join(","), log.join("; "));

class A { get v() { return "A.v:" + this.k; } m() { return "A.m"; } }
class B extends A { constructor() { super(); this.k = 1; } m() { return "B>" + super.m(); } }
var b = new B();
console.log(b.v, b.m(), "v" in b, b.hasOwnProperty("v"), b.constructor.name);

var arr = [1, 2, 3];
arr.extra = "e";
console.log(arr.length, arr.extra, "length" in arr, "push" in arr, 0 in arr, 5 in arr, arr["01"], typeof arr.push);
arr.length = 1;
console.log(arr.length, JSON.stringify(arr), arr.extra);
Array.prototype.custom = function () { return "custom" + this.length; };
console.log([1, 2].custom());
delete Array.prototype.custom;

var str = new String("hey");
console.log(str.length, str[0], "length" in str, str.toUpperCase(), str.foo);
str.foo = "bar";
console.log(str.foo, Object.keys(str).join(","));

var frozen = Object.freeze({ a: 1 });
frozen.a = 2; frozen.b = 3;
console.log(frozen.a, frozen.b);
var sealed = Object.preventExtensions({ a: 1 });
sealed.a = 5; sealed.z = 1;
console.log(sealed.a, sealed.z);

var p = new Proxy({ t: 1 }, { has: function (t, k) { return k === "magic"; }, get: function (t, k) { return k === "magic" ? "M" : t[k]; } });
console.log("magic" in p, "t" in p, p.magic, p.t);
var viaProxy = Object.create(p);
console.log(viaProxy.magic, viaProxy.t);

var ta = new Uint8Array([5, 6]);
console.log(ta.length, ta[1], "1" in ta, "2" in ta, ta.byteLength);

var counts = {};
var words = "a b a c b a".split(" ");
for (var i = 0; i < words.length; i++) counts[words[i]] = (counts[words[i]] || 0) + 1;
console.log(JSON.stringify(counts));
var obj = { x: 1 };
for (var n = 0; n < 100; n++) obj.x = obj.x + n;
console.log(obj.x, Object.getOwnPropertyDescriptor(obj, "x").writable);
var sym = Symbol("s");
obj[sym] = "sv";
console.log(obj[sym], sym in obj);
