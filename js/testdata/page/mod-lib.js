console.log("lib evaluated");
export function greet(name) {
  return "hello " + name;
}
export const shout = (s) => s.toUpperCase() + "!";
export let counter = 0;
export function bump() {
  counter++;
}
