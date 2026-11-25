#!/usr/bin/env bash
# Times the JavaScript engine on the small pure-JS benchmarks in this folder.
# Builds the engine (js/main.ail) once with the pinned AIL, then runs each
# NAME.js three times with --run, checks its output against NAME.out (what
# Node 22 printed) and prints the best wall time in milliseconds.
# Usage, from the garlic repository root: js/testdata/bench/run.sh [NAME.js...]
# Expects the ail repository at ../ail (or AIL_DIR), as tools/check.sh does.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../../.." && pwd)"
ail_dir="${AIL_DIR:-$root/../ail}"
out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT
cd "$root"
"$ail_dir/ail" build js -o "$out/garlicjs"
now_ms() { perl -MTime::HiRes=time -e 'printf "%d\n", time() * 1000'; }
if [ "$#" -gt 0 ]; then files=("$@"); else files=("$here"/*.js); fi
printf "%-14s %8s  %s\n" "bench" "best ms" "output"
for f in "${files[@]}"; do
    name="$(basename "$f" .js)"
    best=""
    for _ in 1 2 3; do
        start="$(now_ms)"
        "$out/garlicjs" --run "$f" > "$out/$name.txt" 2>&1 || true
        took=$(( $(now_ms) - start ))
        if [ -z "$best" ] || [ "$took" -lt "$best" ]; then best="$took"; fi
    done
    if diff -q "$out/$name.txt" "$here/$name.out" > /dev/null; then verdict="ok"; else verdict="DIFFERS: $(head -c 200 "$out/$name.txt")"; fi
    printf "%-14s %8s  %s\n" "$name" "$best" "$verdict"
done
