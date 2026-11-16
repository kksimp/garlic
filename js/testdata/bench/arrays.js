// Array push, index reads and writes, iteration, sort.
var a = [];
for (var i = 0; i < 100000; i++) a.push(i * 3 % 1000);
var sum = 0;
for (var j = 0; j < a.length; j++) sum += a[j];
for (var k = 0; k < a.length; k++) a[k] = a[k] + 1;
for (var k2 = 1; k2 < a.length; k2++) a[k2] += a[k2 - 1] % 3;
var ofSum = 0;
for (const x of a) ofSum += x;
var grid = [];
for (var r = 0; r < 100; r++) { var row = []; for (var c = 0; c < 100; c++) row.push(r * c); grid.push(row); }
var diag = 0;
for (var d = 0; d < 100; d++) diag += grid[d][d] + grid[99 - d][d];
var b = a.slice(0, 5000).sort(function (x, y) { return x - y; });
console.log(sum, ofSum, a[99999], diag, b[0], b[4999]);
