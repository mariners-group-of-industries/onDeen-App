#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"${SCRIPT_DIR}/e2e-smoke.sh"
"${SCRIPT_DIR}/e2e-curl.sh"

printf '\nAll API E2E tests completed\n'
