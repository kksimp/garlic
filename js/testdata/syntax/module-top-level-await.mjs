await 1;
const x = await foo();
for await (const y of z) {
  await y;
}
const f = async () => await 2;
function g() {
  var await_ = 1;
  return await_;
}
await (async () => {})();
