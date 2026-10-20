// Classes: fields, statics, accessors, private names, inheritance, super.
class Animal {
  static count = 0;
  #secret = "hidden";
  name;
  constructor(name) { this.name = name; Animal.count++; }
  speak() { return `${this.name} makes a sound`; }
  get secret() { return this.#secret; }
  set secret(v) { this.#secret = v.toUpperCase(); }
  static create(n) { return new this(n); }
  static { this.ready = true; }
}
class Dog extends Animal {
  tricks = [];
  speak() { return super.speak() + " (woof)"; }
  learn(t) { this.tricks.push(t); return this; }
}
const d = Dog.create("Rex").learn("sit").learn("roll");
console.log(d.speak(), d.tricks, Animal.count, Dog.count, Animal.ready);
d.secret = "bone"; console.log(d.secret, d instanceof Dog, d instanceof Animal, Object.getPrototypeOf(d) === Dog.prototype);
console.log(typeof Animal, Dog.name, Object.getOwnPropertyNames(Dog.prototype), Object.keys(d));
try { Animal("x"); } catch (e) { console.log(e.message); }
class Shape { area() { return 0; } toString() { return `${this.constructor.name}(${this.area()})`; } }
class Square extends Shape { constructor(s) { super(); this.s = s; } area() { return this.s ** 2; } }
console.log(String(new Square(3)), `${new Shape()}`);
class E extends Error { constructor(m) { super(m); this.name = "E"; } }
try { throw new E("custom"); } catch (e) { console.log(e.name, e.message, e instanceof E, e instanceof Error, String(e)); }
const Anon = class {}; console.log(Anon.name);
class Base { constructor() { this.kind = new.target.name; } } class Derived extends Base {} console.log(new Derived().kind);
class NoSuper extends Base { constructor() { } }
try { new NoSuper(); } catch (e) { console.log(e.name); }
const objWithSuper = { __proto__: { hi() { return "proto hi"; } }, hi() { return "own " + super.hi(); } };
console.log(objWithSuper.hi());
