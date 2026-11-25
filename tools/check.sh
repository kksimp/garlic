#!/usr/bin/env bash
# Checks this app against the pinned AIL, the v0.2.0 release (see .ail-version). Run on a dev machine, never in a container.
# Expects the ail repository at ../ail (or AIL_DIR) checked out at v0.2.0, the pinned commit.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ail_dir="${AIL_DIR:-$here/../ail}"
want="$(head -n 1 "$here/.ail-version")"
have="$(git -C "$ail_dir" rev-parse HEAD)"
[ "$have" = "$want" ] || { echo "check: $ail_dir is at $have, pinned $want" >&2; exit 2; }
cd "$here"
"$ail_dir/ail" check .
"$ail_dir/ail" fmt --check .
"$ail_dir/ail" test garlic.ail
