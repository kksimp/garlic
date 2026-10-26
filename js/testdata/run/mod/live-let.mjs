export let value = "first";
export function setValue(v) {
  value = v;
}
export { value as alias };
export default value;
