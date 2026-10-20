// Number formatting and parsing, Math.
console.log((1234.5678).toFixed(2), (0.000001234).toFixed(8), (1.005).toFixed(2), (2.5).toFixed(0), (-1.5).toFixed(0), (1e21).toFixed(2));
console.log((123.456).toPrecision(4), (0.00001234).toPrecision(2), (123456).toPrecision(2), (1.5).toExponential(3), (12345).toExponential(), (0).toExponential(2));
console.log((255).toString(2), (255).toString(36), (-255).toString(16), (0.5).toString(2), (3.75).toString(8), (1e21).toString(), (1 / 3).toString(3));
console.log(parseInt("0x1A"), parseInt("101", 2), parseInt("  12abc"), parseInt(""), parseInt("z", 36), parseFloat("3.14xyz"), parseFloat(".5"), parseFloat("-.5e2"), parseInt("1e3"));
console.log(Number("12px"), Number(""), Number(" 0x10 "), Number(null), Number(undefined), Number([]), Number(["7"]), Number(true));
console.log(Number.isInteger(5.0), Number.isInteger(5.1), Number.isSafeInteger(2 ** 53), isNaN("abc"), Number.isNaN("abc"), isFinite("12"));
console.log(Math.round(2.5), Math.round(-2.5), Math.round(-0.4), Math.floor(-1.5), Math.ceil(1.2), Math.trunc(-4.7), Math.sign(-3), Math.abs(-7));
console.log(Math.sqrt(16), Math.cbrt(27), Math.pow(2, 8), Math.hypot(3, 4), Math.min(), Math.max(), Math.min(1, NaN), Math.clz32(1), Math.imul(3, 4));
console.log(Math.log10(1000), Math.log2(1024), Math.exp(0), Math.log(1), Math.PI, Math.E, Math.atan2(0, -1) === Math.PI);
console.log((1234567.891).toLocaleString(), (0.5).toLocaleString(), (-1000).toLocaleString());
const r = Math.random(); console.log(r >= 0 && r < 1);
console.log(0.1 * 3, 9007199254740993, 5e-324, 1.7976931348623157e308 * 10, 4.35, 0.000001, 1e-6 / 10);
