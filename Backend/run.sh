#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
exec ./ruh.sh "${1:-local}" "${@:2}"
