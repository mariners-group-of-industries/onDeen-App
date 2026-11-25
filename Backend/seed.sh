#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
if [ "$#" -eq 0 ]; then
  exec ./seed_ondeen.sh local
fi
exec ./seed_ondeen.sh "$@"
