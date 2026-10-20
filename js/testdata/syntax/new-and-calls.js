new A;
new A(1, ...rest);
new A.B.C();
new new A()();
new (f())();
f(...a, b, ...c,);
a.b.c(d)[e](f);
function g() { return new.target; }
