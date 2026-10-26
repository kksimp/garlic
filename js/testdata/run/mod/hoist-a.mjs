import { make } from "./hoist-b.mjs";
export function hello() {
  return "hello from a";
}
console.log(make());
