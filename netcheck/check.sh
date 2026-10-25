#!/usr/bin/env bash
# Garlic's network behaviour against a scripted site (server.py): cookies set
# on a redirect, the final address after redirects, a gzip page, a POST
# answered by 303, a sheet that carries the cookie and a Referer, and a
# redirect loop. Run from anywhere: netcheck/check.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
tmp=$(mktemp -d)
trap 'kill "$srv" 2>/dev/null || true; rm -rf "$tmp"' EXIT
python3 netcheck/server.py > "$tmp/port" &
srv=$!
while [ ! -s "$tmp/port" ]; do sleep 0.1; done
site="http://127.0.0.1:$(head -1 "$tmp/port")"
fail=0
expect() { # name needle output
  if [[ "$3" == *"$2"* ]]; then echo "ok $1"; else echo "FAIL $1: wanted $2 in: ${3:0:300}"; fail=1; fi
}
# GARLIC=path/to/native/garlic runs the checks against a native build.
garlic() { if [ -n "${GARLIC:-}" ]; then "$GARLIC" --json "$@" 2>&1; else ./ail run garlic.ail --json "$@" 2>&1; fi; }
plain() { if [ -n "${GARLIC:-}" ]; then "$GARLIC" "$@" 2>&1; else ./ail run garlic.ail "$@" 2>&1; fi; }
out=$(garlic "$site/login")
expect "a cookie set on a redirect is sent on the next hop" '"title":"home sid=abc"' "$out"
expect "the address is where redirects ended" "\"url\":\"$site/dir/home\"" "$out"
expect "a relative link resolves against the final address" "\"href\":\"$site/dir/next\"" "$out"
expect "a sheet carries the cookie and the referer" "sid=abc|$site/dir/home" "$(curl -s "$site/last")"
garlic "$site/dir/home" --do reload > /dev/null
expect "a reload asks again and a 304 renews the copy" "3 1" "$(curl -s "$site/counts")"
garlic "$site/dir/home" --do follow:1 > /dev/null
expect "a followed link sends the page as Referer" "$site/dir/home" "$(curl -s "$site/navlast")"
garlic "$site/dir/next" > /dev/null
expect "a typed address sends no Referer" "-" "$(curl -s "$site/navlast")"
before=$(curl -s "$site/conns")
garlic "$site/dir/home" > /dev/null
after=$(curl -s "$site/conns")
expect "a page and its sheet share one connection" "$((before + 2))" "$after"  # one for garlic, one for this curl
out=$(plain "$site/app")
expect "a page's scripts run once however many requests they make" "1" "$(curl -s "$site/hits")"
expect "fetch sends same-origin cookies" "fetch sid=xyz" "$out"
expect "XMLHttpRequest answers with a status" "xhr 200 sid=xyz" "$out"
expect "a cross-origin fetch needs CORS permission" "cross blocked" "$out"
expect "a cross-origin fetch the server allows" "cors open" "$out"
garlic "$site/cdoc" --do reload > /dev/null
garlic "$site/fresh" --do "open:$site/fresh" > /dev/null
expect "a reload asks about a kept page; a fresh page is not asked again" "2 1 1" "$(curl -s "$site/pagecounts")"
expect "a WebSocket opens, echoes and closes" "ws echo:hi closed 1000" "$(plain "$site/wsapp")"
expect "a 301 is followed" "\"url\":\"$site/dir/home\"" "$(garlic "$site/old")"
expect "a gzip page is read" '"title":"zipped"' "$(garlic "$site/zip")"
expect "a missing page shows its status" "HTTP status 404" "$(plain "$site/nothing")"
expect "a redirect loop stops" "redirects" "$(plain "$site/loop")"
[ $fail = 0 ] && echo "netcheck: all passed"
exit $fail
