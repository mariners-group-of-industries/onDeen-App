#!/usr/bin/env bash
set -euo pipefail

show_usage() {
  cat <<'EOF'
Usage:
  ./build.sh
  ./build.sh install
  ./build.sh debug
  ./build.sh installDebug
  ./build.sh realDebug
  ./build.sh installRealDebug
  ./build.sh test

Examples:
  ./build.sh
  ./build.sh install
  ./build.sh debug
  ./build.sh installDebug
  ./build.sh realDebug
  ./build.sh installRealDebug
  ./build.sh test
  ONDEEN_REAL_BACKEND_URL=http://192.168.1.23:8088 ./build.sh realDebug

When run with no arguments, the script prompts you to choose the build mode.
Debug APKs are copied to ~/Downloads/SHARED by default.
installDebug builds the debug APK, installs it on a connected Android device, and launches it.
realDebug builds a debug-signed APK with --dev false, so local debug bypasses are disabled.
realDebug bundles the laptop LAN backend URL by default; override it with ONDEEN_REAL_BACKEND_URL.
installRealDebug builds realDebug, updates the connected Android device, and launches it.
Release is intentionally not automated here yet.
EOF
}

bootstrap_macos_android_env() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    return 0
  fi

  if [[ -z "${JAVA_HOME:-}" && -d "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" ]]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
  fi

  if [[ -d "/opt/homebrew/opt/openjdk@21/bin" ]]; then
    export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
  fi

  if [[ -z "${ANDROID_HOME:-}" && -d "/opt/homebrew/share/android-commandlinetools" ]]; then
    export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
  fi

  if [[ -z "${ANDROID_SDK_ROOT:-}" && -n "${ANDROID_HOME:-}" ]]; then
    export ANDROID_SDK_ROOT="$ANDROID_HOME"
  fi

  if [[ -d "/opt/homebrew/bin" ]]; then
    export PATH="/opt/homebrew/bin:$PATH"
  fi
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  show_usage
  exit 0
fi

bootstrap_macos_android_env

MODE="${1:-}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$REPO_ROOT/android"
MODULE_DIR="$PROJECT_DIR/app"
BUILD_GRADLE="$MODULE_DIR/build.gradle"
DEST_DIR="${ONDEEN_APK_DEST_DIR:-$HOME/Downloads/SHARED}"
APP_SLUG="$(basename "$REPO_ROOT")"
MODULE_NAME="app"
DEBUG_APK="$MODULE_DIR/build/outputs/apk/debug/${MODULE_NAME}-debug.apk"
DEBUG_BUNDLE_DIR="$MODULE_DIR/build/generated/assets/react/debug"
DEBUG_RES_DIR="$MODULE_DIR/build/generated/res/react/debug"
DEBUG_BUNDLE="$DEBUG_BUNDLE_DIR/index.android.bundle"
LOCAL_BACKEND_PORT="${ONDEEN_LOCAL_BACKEND_PORT:-8088}"
ADB_TARGET=()
GRADLE_ARGS=()
ACTIVE_ARCHITECTURES=""
APPLICATION_ID="$(
  sed -nE 's/^[[:space:]]*applicationId[[:space:]]+"([^"]+)".*/\1/p' "$BUILD_GRADLE" 2>/dev/null | head -n1
)"

mkdir -p "$DEST_DIR"

# Release note:
# This app appears to be in production, but this repo does not include the real
# production/upload JKS or keystore.properties. Keep release builds out of this
# helper until the previous developer or CI signing setup is confirmed.
#
# debug/installDebug bundles are built with --dev true so __DEV__-guarded
# helpers, such as the local 0000 OTP bypass, are active for local testing.
# realDebug/installRealDebug still use the debug Android variant/signature, but
# bundle JS with --dev false so the app talks to the real backend without local
# debug-token/profile/dashboard fallbacks.

prompt_choice() {
  local prompt="$1"
  local max="$2"
  local choice

  while true; do
    read -r -p "$prompt" choice
    if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= max )); then
      printf '%s\n' "$choice"
      return 0
    fi
    echo "Please enter a number between 1 and $max."
  done
}

select_mode_interactively() {
  echo "Build modes:"
  echo "  1) install"
  echo "  2) debug"
  echo "  3) installDebug"
  echo "  4) realDebug"
  echo "  5) installRealDebug"
  echo "  6) test"

  local selection
  selection="$(prompt_choice "Choose a mode number: " 6)"

  case "$selection" in
    1) MODE="install" ;;
    2) MODE="debug" ;;
    3) MODE="installDebug" ;;
    4) MODE="realDebug" ;;
    5) MODE="installRealDebug" ;;
    6) MODE="test" ;;
  esac
}

if [[ -z "$MODE" ]]; then
  select_mode_interactively
fi

require_android_project() {
  if [[ ! -x "$PROJECT_DIR/gradlew" ]]; then
    echo "[error] No executable Gradle wrapper found at: $PROJECT_DIR/gradlew"
    exit 1
  fi

  if [[ ! -d "$MODULE_DIR" ]]; then
    echo "[error] Android module not found at: $MODULE_DIR"
    exit 1
  fi

  if [[ ! -f "$BUILD_GRADLE" ]]; then
    echo "[error] Android app Gradle file not found at: $BUILD_GRADLE"
    exit 1
  fi
}

run_step() {
  local label="$1"
  shift
  local tmp
  tmp="$(mktemp)"
  echo "$label"
  if ! "$@" >"$tmp" 2>&1; then
    echo "[error] $label failed"
    cat "$tmp"
    rm -f "$tmp"
    exit 1
  fi
  rm -f "$tmp"
}

gradle_step() {
  (cd "$PROJECT_DIR" && ./gradlew "${GRADLE_ARGS[@]}" "$@")
}

npx_step() {
  (cd "$REPO_ROOT" && npx "$@")
}

clear_metro_cache() {
  rm -rf /tmp/metro-* /tmp/haste-map-* 2>/dev/null || true
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
    echo "[error] Set it manually, for example:" >&2
    echo "        ONDEEN_REAL_BACKEND_URL=http://192.168.1.23:${LOCAL_BACKEND_PORT} ./build.sh realDebug" >&2
    exit 1
  fi

  printf '%s\n' "$ip_address"
}

resolve_real_backend_url() {
  if [[ -n "${ONDEEN_REAL_BACKEND_URL:-}" ]]; then
    printf '%s\n' "$ONDEEN_REAL_BACKEND_URL"
    return 0
  fi

  printf 'http://%s:%s\n' "$(detect_lan_ip)" "$LOCAL_BACKEND_PORT"
}

normalize_backend_url() {
  local backend_url="${1:-}"
  backend_url="${backend_url%/}"

  if [[ -z "$backend_url" ]]; then
    echo "[error] Backend URL is empty." >&2
    exit 1
  fi

  printf '%s\n' "$backend_url"
}

validate_real_backend_url() {
  local backend_url="$1"

  if [[ "$backend_url" == *"127.0.0.1"* || "$backend_url" == *"localhost"* ]]; then
    echo "[warn] realDebug is using $backend_url." >&2
    echo "[warn] A standalone phone APK usually needs this laptop's Wi-Fi IP, not localhost." >&2
  fi

  if ! command -v curl >/dev/null 2>&1; then
    echo "[warn] curl was not found; skipping backend reachability check." >&2
    return 0
  fi

  if curl -fsS --max-time 5 "$backend_url/generate_token" >/dev/null; then
    echo "[config] Backend reachable: $backend_url"
    return 0
  fi

  echo "[error] Backend is not reachable at: $backend_url" >&2
  echo "[error] Start it with: cd \"$REPO_ROOT/../ondeen\" && ./ruh.sh" >&2
  echo "[error] Or override it with: ONDEEN_REAL_BACKEND_URL=http://YOUR_IP:${LOCAL_BACKEND_PORT} ./build.sh realDebug" >&2
  exit 1
}

set_gradle_architectures() {
  local architectures="$1"

  ACTIVE_ARCHITECTURES="$architectures"
  GRADLE_ARGS=("-PondeenDebugArchitectures=$architectures")
  echo "[config] Native architectures: $architectures"
}

resolve_debug_architectures() {
  if [[ -n "${ONDEEN_DEBUG_ARCHITECTURES:-}" ]]; then
    printf '%s\n' "$ONDEEN_DEBUG_ARCHITECTURES"
    return 0
  fi

  if (( ${#ADB_TARGET[@]} > 0 )); then
    local device_abi
    device_abi="$(adb "${ADB_TARGET[@]}" shell getprop ro.product.cpu.abi 2>/dev/null | tr -d '\r' | head -n1)"
    if [[ -n "$device_abi" ]]; then
      printf '%s\n' "$device_abi"
      return 0
    fi
  fi

  printf '%s\n' "arm64-v8a"
}

resolve_real_debug_architectures() {
  if [[ -n "${ONDEEN_REAL_DEBUG_ARCHITECTURES:-}" ]]; then
    printf '%s\n' "$ONDEEN_REAL_DEBUG_ARCHITECTURES"
    return 0
  fi

  if (( ${#ADB_TARGET[@]} > 0 )); then
    local device_abi
    device_abi="$(adb "${ADB_TARGET[@]}" shell getprop ro.product.cpu.abi 2>/dev/null | tr -d '\r' | head -n1)"
    if [[ -n "$device_abi" ]]; then
      printf '%s\n' "$device_abi"
      return 0
    fi
  fi

  printf '%s\n' "arm64-v8a"
}

# Prepend the backend URL to the built JS bundle as a global read by
# src/helpers/Constant.tsx (BASE_URL / BASE_URL_FOR_FILE). Same mechanism as
# OnDeenUser/build.sh and run-ios.sh; source files are never modified.
inject_backend_url_into_bundle() {
  local backend_url="$1"
  local encoded_url
  local tmp_bundle

  if [[ ! -f "$DEBUG_BUNDLE" ]]; then
    echo "[error] JS bundle not found for backend URL injection: $DEBUG_BUNDLE" >&2
    exit 1
  fi

  encoded_url="$(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$backend_url")"
  tmp_bundle="$(mktemp)"

  {
    printf 'globalThis.__ONDEEN_BASE_URL__ = %s;\n' "$encoded_url"
    cat "$DEBUG_BUNDLE"
  } > "$tmp_bundle"

  mv "$tmp_bundle" "$DEBUG_BUNDLE"

  echo "[config] Bundling backend URL: $backend_url"
}

setup_adb_reverse_for_local_backend() {
  local port="$LOCAL_BACKEND_PORT"

  if adb "${ADB_TARGET[@]}" reverse "tcp:$port" "tcp:$port" >/dev/null 2>&1; then
    echo "[adb] Forwarded device 127.0.0.1:$port -> laptop 127.0.0.1:$port"
  else
    echo "[warn] Could not set adb reverse for 127.0.0.1:$port." >&2
    echo "[warn] If the APK uses http://127.0.0.1:$port, the phone will not reach the laptop backend." >&2
  fi
}

ensure_node_modules() {
  if [[ -d "$REPO_ROOT/node_modules" ]]; then
    return 0
  fi

  if [[ ! -f "$REPO_ROOT/package.json" ]]; then
    echo "[error] package.json not found at: $REPO_ROOT/package.json"
    exit 1
  fi

  run_step "[deps] Installing npm dependencies" npm install
}

copy_artifact() {
  local source="$1"
  local destination="$2"

  if [[ ! -f "$source" ]]; then
    echo "[error] Build artifact not found: $source"
    exit 1
  fi

  cp -f "$source" "$destination"
}

write_build_manifest() {
  local destination_name="$1"
  local dev_flag="$2"
  local backend_url="${3:-}"
  local apk_path="$DEST_DIR/$destination_name"
  local manifest_path="$DEST_DIR/${destination_name%.apk}.txt"
  local apk_size="unknown"

  if [[ -f "$apk_path" ]]; then
    apk_size="$(du -h "$apk_path" | awk '{print $1}')"
  fi

  {
    echo "APK: $destination_name"
    echo "Built at: $(date '+%Y-%m-%dT%H:%M:%S%z')"
    echo "Backend URL: ${backend_url:-not bundled}"
    echo "JS dev mode: $dev_flag"
    echo "Native architectures: ${ACTIVE_ARCHITECTURES:-default Gradle set}"
    echo "Size: $apk_size"
  } > "$manifest_path"

  echo "[copy] Build manifest: $manifest_path"
}

bundle_debug_js() {
  local dev_flag="$1"
  local label="$2"
  local backend_url="${3:-}"

  rm -rf "$DEBUG_BUNDLE_DIR" "$DEBUG_RES_DIR"
  mkdir -p "$DEBUG_BUNDLE_DIR" "$DEBUG_RES_DIR"
  clear_metro_cache

  run_step "$label" npx_step react-native bundle \
    --platform android \
    --dev "$dev_flag" \
    --entry-file index.js \
    --bundle-output "$DEBUG_BUNDLE" \
    --assets-dest "$DEBUG_RES_DIR"

  if [[ -n "$backend_url" ]]; then
    inject_backend_url_into_bundle "$backend_url"
  fi
}

select_adb_device() {
  if (( ${#ADB_TARGET[@]} > 0 )); then
    return 0
  fi

  if ! command -v adb >/dev/null 2>&1; then
    echo "[error] adb was not found in PATH"
    exit 1
  fi

  ADB_DEVICES=()
  while IFS= read -r device_id; do
    ADB_DEVICES+=("$device_id")
  done < <(adb devices | awk 'NR > 1 && $2 == "device" {print $1}')

  if (( ${#ADB_DEVICES[@]} == 0 )); then
    echo "[error] No connected Android device found. Connect a device or start an emulator first."
    exit 1
  fi

  if (( ${#ADB_DEVICES[@]} == 1 )); then
    ADB_TARGET=(-s "${ADB_DEVICES[0]}")
    return 0
  fi

  echo "Connected devices:"
  local i
  for i in "${!ADB_DEVICES[@]}"; do
    echo "  $((i + 1))) ${ADB_DEVICES[$i]}"
  done

  local selection
  selection="$(prompt_choice "Choose a device number: " "${#ADB_DEVICES[@]}")"
  ADB_TARGET=(-s "${ADB_DEVICES[$((selection - 1))]}")
}

build_debug_apk() {
  local dev_flag="${1:-true}"
  local destination_name="${2:-${APP_SLUG}-debug.apk}"
  local bundle_label="${3:-[bundle] Bundling JS for standalone debug APK}"
  local ready_label="${4:-Debug APK ready}"
  local backend_url="${5:-}"

  bundle_debug_js "$dev_flag" "$bundle_label" "$backend_url"
  run_step "[build] Building debug APK" gradle_step assembleDebug
  run_step "[copy] Copying debug APK" copy_artifact \
    "$DEBUG_APK" \
    "$DEST_DIR/$destination_name"
  write_build_manifest "$destination_name" "$dev_flag" "$backend_url"
  echo "$ready_label: $DEST_DIR/$destination_name"
}

install_debug_apk() {
  local dev_flag="${1:-true}"
  local destination_name="${2:-${APP_SLUG}-debug.apk}"
  local bundle_label="${3:-[bundle] Bundling JS for standalone debug APK}"
  local ready_label="${4:-Debug APK ready}"
  local install_label="${5:-[adb] Installing debug APK}"
  local backend_url="${6:-}"

  build_debug_apk "$dev_flag" "$destination_name" "$bundle_label" "$ready_label" "$backend_url"
  select_adb_device
  run_step "$install_label" adb "${ADB_TARGET[@]}" install -r -t "$DEBUG_APK"

  if [[ -z "$backend_url" ]]; then
    setup_adb_reverse_for_local_backend
  fi

  if [[ -n "$APPLICATION_ID" ]]; then
    run_step "[adb] Launching $APPLICATION_ID" adb "${ADB_TARGET[@]}" shell monkey \
      -p "$APPLICATION_ID" \
      -c android.intent.category.LAUNCHER \
      1
  else
    echo "[warn] Could not detect applicationId; skipping launch"
  fi
}

case "$MODE" in
  install)
    run_step "[deps] Installing npm dependencies" npm install
    ;;

  debug)
    require_android_project
    ensure_node_modules
    set_gradle_architectures "$(resolve_debug_architectures)"
    build_debug_apk
    ;;

  installDebug)
    require_android_project
    ensure_node_modules
    select_adb_device
    set_gradle_architectures "$(resolve_debug_architectures)"
    install_debug_apk
    ;;

  realDebug)
    require_android_project
    ensure_node_modules
    real_backend_url="$(normalize_backend_url "$(resolve_real_backend_url)")"
    validate_real_backend_url "$real_backend_url"
    set_gradle_architectures "$(resolve_real_debug_architectures)"
    build_debug_apk \
      false \
      "${APP_SLUG}-real-debug.apk" \
      "[bundle] Bundling real-backend debug JS (--dev false)" \
      "Real-backend debug APK ready" \
      "$real_backend_url"
    ;;

  installRealDebug)
    require_android_project
    ensure_node_modules
    select_adb_device
    real_backend_url="$(normalize_backend_url "$(resolve_real_backend_url)")"
    validate_real_backend_url "$real_backend_url"
    set_gradle_architectures "$(resolve_real_debug_architectures)"
    install_debug_apk \
      false \
      "${APP_SLUG}-real-debug.apk" \
      "[bundle] Bundling real-backend debug JS (--dev false)" \
      "Real-backend debug APK ready" \
      "[adb] Installing real-backend debug APK" \
      "$real_backend_url"
    ;;

  test)
    ensure_node_modules
    run_step "[test] Running Jest tests" npm test -- --runInBand
    ;;

  *)
    show_usage
    exit 1
    ;;
esac
