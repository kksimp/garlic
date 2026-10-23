"""A scripted site for tools/garlic/netcheck/check.sh: redirects that set
cookies, gzip, a sheet that needs the cookie, and a POST answered by 303."""
import gzip, sys
from http.server import BaseHTTPRequestHandler, HTTPServer


last = {}
counts = {"css": 0, "304": 0}


class H(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

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
        elif self.path == "/old":
            self.send(301, headers=[("Location", "/dir/home")])
        elif self.path == "/zip":
            self.send(200, gzip.compress(b"<title>zipped</title>"), headers=[("Content-Encoding", "gzip")])
        elif self.path == "/counts":
            self.send(200, f"{counts['css']} {counts['304']}".encode(), ctype="text/plain")
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


s = HTTPServer(("127.0.0.1", 0), H)
print(s.server_address[1], flush=True)
s.serve_forever()
