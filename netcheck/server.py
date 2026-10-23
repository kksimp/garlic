"""A scripted site for tools/garlic/netcheck/check.sh: redirects that set
cookies, gzip, a sheet that needs the cookie, and a POST answered by 303."""
import gzip, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


last = {}
counts = {"css": 0, "304": 0, "conns": 0, "hit": 0, "doc": 0, "doc304": 0, "fresh": 0}


class H(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def setup(self):  # one per connection
        counts["conns"] += 1
        super().setup()

    def log_message(self, *a):
        pass

    def send(self, code, body=b"", headers=(), ctype="text/html"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        for k, v in headers:
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        cookie = self.headers.get("Cookie", "")
        if self.path == "/login":
            self.send(302, headers=[("Set-Cookie", "sid=abc; Path=/"), ("Location", "/dir/home")])
        elif self.path == "/dir/home":
            body = f"<title>home {cookie}</title><link rel=stylesheet href=s.css><a href=next>n</a>"
            self.send(200, body.encode())
        elif self.path == "/dir/s.css":
            ok = "sid=abc" in cookie
            last["css"] = cookie + "|" + self.headers.get("Referer", "")
            counts["css"] += 1
            if self.headers.get("If-None-Match") == '"v1"':
                counts["304"] += 1
                self.send(304, headers=[("ETag", '"v1"')])
            else:
                self.send(200, b"p{color:red}" if ok else b"p{color:blue}", ctype="text/css", headers=[("ETag", '"v1"')])
        elif self.path == "/dir/next":
            last["nav"] = self.headers.get("Referer", "-")
            self.send(200, b"<title>next</title>")
        elif self.path == "/navlast":
            self.send(200, last.get("nav", "").encode(), ctype="text/plain")
        elif self.path == "/app":
            port = self.server.server_address[1]
            page = """<p id=a>-</p><p id=b>-</p><p id=c>-</p><p id=d>-</p><script>
fetch('/api/hit');
fetch('/api/who').then(function (r) { return r.json(); }).then(function (j) {
  document.getElementById('a').textContent = 'fetch ' + j.cookie;
});
var x = new XMLHttpRequest();
x.open('GET', '/api/who');
x.onload = function () { document.getElementById('b').textContent = 'xhr ' + x.status + ' ' + JSON.parse(x.responseText).cookie; };
x.send();
fetch('http://localhost:PORT/api/who').then(function () { document.getElementById('c').textContent = 'cross open'; },
  function () { document.getElementById('c').textContent = 'cross blocked'; });
fetch('http://localhost:PORT/api/cors').then(function (r) { return r.text(); }).then(function (t) {
  document.getElementById('d').textContent = 'cors ' + t;
});
</script>""".replace("PORT", str(port))
            self.send(200, page.encode(), headers=[("Set-Cookie", "sid=xyz; Path=/")])
        elif self.path == "/api/hit":
            counts["hit"] += 1
            self.send(200, b"hit", ctype="text/plain")
        elif self.path in ("/cdoc", "/fresh"):
            key = "doc" if self.path == "/cdoc" else "fresh"
            counts[key] += 1
            cc = [] if key == "doc" else [("Cache-Control", "max-age=60")]
            if self.headers.get("If-None-Match") == '"p1"':
                counts["doc304"] += 1
                self.send(304, headers=[("ETag", '"p1"')] + cc)
            else:
                self.send(200, b"<title>cached page</title>", headers=[("ETag", '"p1"')] + cc)
        elif self.path == "/pagecounts":
            self.send(200, f"{counts['doc']} {counts['doc304']} {counts['fresh']}".encode(), ctype="text/plain")
        elif self.path == "/hits":
            self.send(200, str(counts["hit"]).encode(), ctype="text/plain")
        elif self.path == "/api/who":
            self.send(200, ('{"cookie":"%s"}' % self.headers.get("Cookie", "")).encode(), ctype="application/json")
        elif self.path == "/api/cors":
            self.send(200, b"open", ctype="text/plain", headers=[("Access-Control-Allow-Origin", "*")])
        elif self.path == "/old":
            self.send(301, headers=[("Location", "/dir/home")])
        elif self.path == "/zip":
            self.send(200, gzip.compress(b"<title>zipped</title>"), headers=[("Content-Encoding", "gzip")])
        elif self.path == "/counts":
            self.send(200, f"{counts['css']} {counts['304']}".encode(), ctype="text/plain")
        elif self.path == "/conns":
            self.send(200, str(counts["conns"]).encode(), ctype="text/plain")
        elif self.path == "/last":
            self.send(200, last.get("css", "").encode(), ctype="text/plain")
        elif self.path == "/loop":
            self.send(302, headers=[("Location", "/loop")])
        else:
            self.send(404, b"<title>nope</title>")

    def do_POST(self):
        n = int(self.headers.get("Content-Length", "0"))
        got = self.rfile.read(n).decode()
        if self.path == "/post":
            self.send(303, headers=[("Location", "/posted?" + got)])
        else:
            self.send(404)


class Quiet(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        pass


s = Quiet(("127.0.0.1", 0), H)
print(s.server_address[1], flush=True)
s.serve_forever()
