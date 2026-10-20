function* g(a) { const x = yield a; yield* [x]; yield; return 3; }
async function f() { await g; return await f(); }
const h = async x => await x, k = async (a, {b} = {}, ...c) => a, m = async () => {};
const o = { *m() { yield 1; }, async n() { await 1; }, async *q() { yield await 2; }, async: 1 };
class C { async m() {} *g() { yield; } static async *s() {} }
(function* () { yield
1; yield yield 2; var v = yield* g(); })
var async = 5; async(1); var yield; var await;
