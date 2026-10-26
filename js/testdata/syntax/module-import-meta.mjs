const u = import.meta.url;
import.meta.foo = import.meta;
function f() {
  return import.meta;
}
