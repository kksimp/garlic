class A {}
class B extends A {
    #secret = 1;
    static count = 0;
    field;
    constructor(x) { super(x); this.#secret = x; }
    get value() { return this.#secret; }
    set value(v) { this.#secret = v; }
    static create() { return new B(1); }
    ['computed' + 1]() {}
    has(o) { return #secret in o; }
    static { B.count = 1; }
    method() { return super.method(); }
}
var C = class Named extends (B) {};
var D = class {};
