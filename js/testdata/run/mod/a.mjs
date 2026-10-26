console.log("a: start");
export const name = "a";
export default function greet(who) {
  return "hello " + who;
}
export class Box {
  constructor(v) {
    this.v = v;
  }
  get double() {
    return this.v * 2;
  }
}
export var late = "var";
console.log("a: end");
