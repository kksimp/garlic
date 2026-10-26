export var v = 1, w = 2;
export let l = 3;
export const c = 4;
export function f() {}
export function* g() {}
export async function h() {}
export class K {}
const p = 1, q = 2;
export { p, q as r, p as "string name" };
export { x as y, default as z } from "m";
export * from "n";
export * as nsn from "o";
export { default as dflt } from "p" with { type: "json" };
export const { dx, dy: [dz] } = { dx: 1, dy: [2] };
export default class {}
