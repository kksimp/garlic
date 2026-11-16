// String building and scanning.
var s = "";
for (var i = 0; i < 20000; i++) s += String.fromCharCode(97 + (i % 26));
var count = 0;
for (var j = 0; j < s.length; j++) if (s.charCodeAt(j) === 101 || s[j] === "z") count++;
var parts = [];
for (var k = 0; k < 20000; k++) parts.push("item" + k);
var joined = parts.join(",");
var back = joined.split(",");
var found = 0;
for (var m = 0; m < 2000; m++) if (joined.indexOf("item" + (m * 7)) >= 0) found++;
var t = "";
for (var n = 0; n < 5000; n++) t = `${t.length % 100}:${n};`.slice(0, 8) + t.slice(0, 50);
console.log(s.length, count, back.length, found, t.length, s.slice(100, 110).toUpperCase());
