const re = /^https:\/\/([A-Za-z0-9-]{1,63}\.)*(crowdsource|datacompute)\.google\.com|^https:\/\/x\.example(\/(?!url\b)|$)/;
console.log(re.test("https://a.crowdsource.google.com"), re.test("https://x.example/url"), re.test("https://x.example/ur"), re.test("https://x.example"));
console.log("foo.bar".replace(/(?<=\.)bar/, "BAZ"), "price: $5 $10".match(/(?<!\$)\b\d+/g));
console.log(/(a)\1/.test("aa"), /(a)\1/.test("ab"), "abab".match(/(?<x>ab)\k<x>/)[0]);
console.log("a1b2c3".replace(/[a-z](?=\d)/g, m => m.toUpperCase()), /(?!a)\w/.exec("ab")[0]);
console.log("The Cat".match(/(?<=The )cat/i)[0], /\bfoo(?=bar|baz)/.test("foobaz"), /^(?:(?!ab).)*$/.test("xxabxx"));
