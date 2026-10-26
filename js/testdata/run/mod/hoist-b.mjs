import { hello } from "./hoist-a.mjs";
export function make() {
  return hello() + " via b";
}
