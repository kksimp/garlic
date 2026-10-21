// for await (§14.7.5), in async functions and arrows.
async function f(xs) { for await (const x of xs) {} for await (y of xs); for await (let [a, b] of xs) break; }
async () => { for await (x.y of z) {} };
