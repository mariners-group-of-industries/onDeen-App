#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="${ONDEEN_APK_DEST_DIR:-$HOME/Downloads/SHARED}"
LOCAL_BACKEND_PORT="${ONDEEN_LOCAL_BACKEND_PORT:-8088}"
MODE="${1:-realDebug}"

show_usage() {
  cat <<'EOF'
Usage:
  ./build.sh
  ./build.sh realDebug
  ./build.sh userRealDebug
  ./build.sh organiserRealDebug

Default mode is realDebug, which builds both APKs for the current laptop Wi-Fi IP.
Override the backend URL with ONDEEN_REAL_BACKEND_URL=http://YOUR_IP:8088.
EOF
}

detect_lan_ip() {
  local ip_address
  ip_address="$(
    ip -4 route get 1.1.1.1 2>/dev/null |
      sed -nE 's/.* src ([0-9.]+).*/\1/p' |
      head -n1
  )"

  if [[ -z "$ip_address" ]]; then
    ip_address="$(hostname -I 2>/dev/null | awk '{print $1}')"
  fi

  if [[ -z "$ip_address" && "$(uname -s)" == "Darwin" ]]; then
    ip_address="$(ipconfig getifaddr en0 2>/dev/null || true)"
  fi

  if [[ -z "$ip_address" && "$(uname -s)" == "Darwin" ]]; then
    ip_address="$(ipconfig getifaddr en1 2>/dev/null || true)"
  fi

  if [[ -z "$ip_address" && "$(uname -s)" == "Darwin" ]]; then
    ip_address="$(
      ifconfig 2>/dev/null |
        awk '/inet / && $2 !~ /^127\./ {print $2; exit}'
    )"
  fi

  if [[ -z "$ip_address" ]]; then
    echo "[error] Could not detect this laptop's LAN IP address." >&2
    exit 1
  fi

  printf '%s\n' "$ip_address"
}

resolve_backend_url() {
  if [[ -n "${ONDEEN_REAL_BACKEND_URL:-}" ]]; then
    printf '%s\n' "${ONDEEN_REAL_BACKEND_URL%/}"
    return 0
  fi

  printf 'http://%s:%s\n' "$(detect_lan_ip)" "$LOCAL_BACKEND_PORT"
}

build_user() {
  local backend_url="$1"
  (cd "$ROOT_DIR/OnDeenUser" && ONDEEN_REAL_BACKEND_URL="$backend_url" ./build.sh realDebug)
}

build_organiser() {
  local backend_url="$1"
  (cd "$ROOT_DIR/OnDeenOrganiser" && ONDEEN_REAL_BACKEND_URL="$backend_url" ./build.sh realDebug)
}

case "$MODE" in
  -h|--help)
    show_usage
    exit 0
    ;;
esac

backend_url="$(resolve_backend_url)"
echo "[config] Building APKs against backend: $backend_url"

case "$MODE" in
  realDebug|allRealDebug)
    build_user "$backend_url"
    build_organiser "$backend_url"
    ;;

  userRealDebug)
    build_user "$backend_url"
    ;;

  organiserRealDebug|organizerRealDebug)
    build_organiser "$backend_url"
    ;;

  *)
    show_usage
    exit 1
    ;;
esac

echo
echo "APK outputs:"
du -h "$DEST_DIR"/*real-debug.apk 2>/dev/null || true
echo
echo "Build manifests:"
ls -1 "$DEST_DIR"/*real-debug.txt 2>/dev/null || true
