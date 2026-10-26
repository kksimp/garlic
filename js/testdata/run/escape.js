// escape and unescape (Annex B.2.1).
console.log(escape("abc ABC 123 @*_+-./"));
console.log(escape("a bé€!"));
console.log(unescape("%41%u20AC%E9%u00e9"));
console.log(unescape("100%, %zz, %u12, %4"));
console.log(unescape(escape("héllo wörld 世界")));
console.log(decodeURIComponent(escape("Ã©")));
