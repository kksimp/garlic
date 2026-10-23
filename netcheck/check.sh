#!/usr/bin/env bash
# Garlic's network behaviour against a scripted site (server.py): cookies set
# on a redirect, the final address after redirects, a gzip page, a POST
# answered by 303, a sheet that carries the cookie and a Referer, and a
# redirect loop. Run from anywhere: tools/garlic/netcheck/check.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
tmp=$(mktemp -d)
trap 'kill "$srv" 2>/dev/null || true; rm -rf "$tmp"' EXIT
python3 tools/garlic/netcheck/server.py > "$tmp/port" &
srv=$!
while [ ! -s "$tmp/port" ]; do sleep 0.1; done
site="http://127.0.0.1:$(head -1 "$tmp/port")"
fail=0
expect() { # name needle output
  if [[ "$3" == *"$2"* ]]; then echo "ok $1"; else echo "FAIL $1: wanted $2 in: ${3:0:300}"; fail=1; fi
}
garlic() { ./ail run tools/garlic/garlic.ail --json "$@" 2>&1; }
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
expect "a 301 is followed" "\"url\":\"$site/dir/home\"" "$(garlic "$site/old")"
expect "a gzip page is read" '"title":"zipped"' "$(garlic "$site/zip")"
expect "a missing page shows its status" "HTTP status 404" "$(./ail run tools/garlic/garlic.ail "$site/nothing" 2>&1)"
expect "a redirect loop stops" "redirects" "$(./ail run tools/garlic/garlic.ail "$site/loop" 2>&1)"
[ $fail = 0 ] && echo "netcheck: all passed"
exit $fail
