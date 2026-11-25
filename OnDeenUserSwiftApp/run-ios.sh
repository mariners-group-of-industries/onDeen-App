#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="${WORKSPACE:-$ROOT_DIR/OnDeen.xcworkspace}"
SCHEME="${SCHEME:-OnDeen}"
CONFIGURATION="${CONFIGURATION:-Debug}"
SIMULATOR_NAME="${SIMULATOR_NAME:-iPhone 17 Pro}"
BUNDLE_ID="${BUNDLE_ID:-com.ondeen.user}"
DERIVED_DATA_PATH="${DERIVED_DATA_PATH:-$ROOT_DIR/DerivedData}"
RUN_MODE="${RUN_MODE:-prompt}"
# RUN_MODE can be prompt, direct, or rebuild.
RUN_LOG_DIR="${RUN_LOG_DIR:-$ROOT_DIR/.ios-run}"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
BUILD_LOG="$RUN_LOG_DIR/build-$RUN_ID.log"
PODS_LOG="$RUN_LOG_DIR/pods-$RUN_ID.log"
PODS_CONFIG="$ROOT_DIR/Pods/Target Support Files/Pods-OnDeen/Pods-OnDeen.debug.xcconfig"
APP_PATH=""
APP_INSTALLED=false

mkdir -p "$RUN_LOG_DIR"

show_failure_details() {
  local log_file="$1"
  local important_lines

  important_lines="$(grep -E 'fatal error:|error:|BUILD FAILED|The following build commands failed' "$log_file" | tail -80 || true)"
  if [[ -n "$important_lines" ]]; then
    echo "$important_lines" >&2
  else
    echo "Last output:" >&2
    tail -40 "$log_file" >&2
  fi
  echo "Full log: $log_file" >&2
}

case "$RUN_MODE" in
  prompt|direct|rebuild)
    ;;
  *)
    echo "Invalid RUN_MODE: $RUN_MODE (expected prompt, direct, or rebuild)." >&2
    exit 1
    ;;
esac

if [[ ! -d "$WORKSPACE" ]]; then
  echo "Workspace not found: $WORKSPACE" >&2
  exit 1
fi

if ! command -v xcodebuild >/dev/null 2>&1 || ! command -v xcrun >/dev/null 2>&1; then
  echo "Xcode command-line tools are missing. Run ./setup.sh first." >&2
  exit 1
fi

if [[ ! -f "$PODS_CONFIG" ]]; then
  if ! command -v pod >/dev/null 2>&1; then
    echo "CocoaPods is not installed, but the project needs pod install before it can build." >&2
    exit 1
  fi

  echo "Pods are missing. Installing dependencies..."
  if ! (cd "$ROOT_DIR" && pod install) >"$PODS_LOG" 2>&1; then
    echo "CocoaPods installation failed." >&2
    show_failure_details "$PODS_LOG"
    exit 1
  fi
  echo "Pods installed."
fi

echo "Preparing simulator: $SIMULATOR_NAME"
DEVICE_LINE="$(xcrun simctl list devices available | grep -m1 -E "^[[:space:]]+${SIMULATOR_NAME} \\(" || true)"

if [[ -z "$DEVICE_LINE" ]]; then
  DEVICE_LINE="$(xcrun simctl list devices available | grep -m1 -E '^[[:space:]]+iPhone .*\([0-9A-Fa-f-]{36}\)' || true)"
  if [[ -z "$DEVICE_LINE" ]]; then
    echo "Could not find an available iPhone simulator." >&2
    echo "Run ./setup.sh, or install an iOS Simulator runtime in Xcode > Settings > Platforms." >&2
    exit 1
  fi

  SIMULATOR_NAME="$(printf '%s\n' "$DEVICE_LINE" | sed -E 's/^[[:space:]]*([^()]*)[[:space:]]+\([0-9A-Fa-f-]{36}\).*/\1/' | sed -E 's/[[:space:]]+$//')"
  echo "Using available simulator: $SIMULATOR_NAME"
fi

UDID="$(printf '%s\n' "$DEVICE_LINE" | sed -E 's/.*\(([0-9A-F-]{36})\).*/\1/')"

if ! xcrun simctl list devices | grep -q "$UDID (Booted)"; then
  echo "Starting simulator..."
  xcrun simctl boot "$UDID" >/dev/null 2>&1 || true
fi

if ! xcrun simctl bootstatus "$UDID" -b >/dev/null 2>&1; then
  echo "Could not start the simulator." >&2
  exit 1
fi
open -a Simulator >/dev/null 2>&1 || true

if xcrun simctl get_app_container "$UDID" "$BUNDLE_ID" app >/dev/null 2>&1; then
  APP_INSTALLED=true
fi

prompt_for_mode() {
  if [[ "$RUN_MODE" != "prompt" ]]; then
    return
  fi

  if [[ ! -t 0 ]]; then
    if [[ "$APP_INSTALLED" == true ]]; then
      RUN_MODE="direct"
      echo "No interactive input detected; launching the installed app directly."
    else
      RUN_MODE="rebuild"
      echo "No interactive input detected and the app is not installed; rebuilding."
    fi
    return
  fi

  printf 'Start OnDeen with:\n'
  printf '  [d] Run installed app directly\n'
  printf '  [r] Rebuild and reinstall app\n'
  printf 'Choose [d]: '
  if ! read -r choice; then
    choice=""
  fi

  case "$(printf '%s' "${choice:-d}" | tr '[:upper:]' '[:lower:]')" in
    d|direct)
      RUN_MODE="direct"
      ;;
    r|rebuild)
      RUN_MODE="rebuild"
      ;;
    q|quit|exit)
      exit 0
      ;;
    *)
      echo "Unknown choice: ${choice:-<empty>}" >&2
      exit 1
      ;;
  esac
}

build_app() {
  echo "Building $SCHEME..."
  echo "Build details are saved locally if they are needed."
  if ! xcodebuild \
      -quiet \
      -workspace "$WORKSPACE" \
      -scheme "$SCHEME" \
      -configuration "$CONFIGURATION" \
      -destination "platform=iOS Simulator,id=$UDID" \
      -derivedDataPath "$DERIVED_DATA_PATH" \
      CODE_SIGNING_ALLOWED=NO \
      CODE_SIGNING_REQUIRED=NO \
      build >"$BUILD_LOG" 2>&1; then
    echo "Build failed." >&2
    show_failure_details "$BUILD_LOG"
    exit 1
  fi
  echo "Build succeeded."

  local local_products_dir="$DERIVED_DATA_PATH/Build/Products/${CONFIGURATION}-iphonesimulator"
  APP_PATH="$local_products_dir/${SCHEME}.app"

  if [[ ! -d "$APP_PATH" ]]; then
    if [[ -d "$local_products_dir" ]]; then
      APP_PATH="$(find "$local_products_dir" -maxdepth 1 -name "${SCHEME}.app" -print -quit)"
    fi
  fi

  if [[ -z "${APP_PATH:-}" || ! -d "$APP_PATH" ]]; then
    echo "Built app not found under: $local_products_dir" >&2
    exit 1
  fi
}

prompt_for_mode

if [[ "$RUN_MODE" == "direct" && "$APP_INSTALLED" != true ]]; then
  if [[ -t 0 ]]; then
    printf 'The app is not installed on %s. Rebuild and reinstall now? [y/N]: ' "$SIMULATOR_NAME"
    if ! read -r rebuild_choice; then
      rebuild_choice=""
    fi
    case "$(printf '%s' "${rebuild_choice:-n}" | tr '[:upper:]' '[:lower:]')" in
      y|yes)
        RUN_MODE="rebuild"
        ;;
      *)
        echo "App is not installed, and rebuild was declined." >&2
        exit 1
        ;;
    esac
  else
    echo "App is not installed on $SIMULATOR_NAME. Re-run with RUN_MODE=rebuild to install it first." >&2
    exit 1
  fi
fi

if [[ "$RUN_MODE" == "rebuild" ]]; then
  build_app
  echo "Installing app: $APP_PATH"
  xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl uninstall "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
  if ! xcrun simctl install "$UDID" "$APP_PATH" >/dev/null 2>&1; then
    echo "Could not install the app on the simulator." >&2
    exit 1
  fi
  echo "App installed."
fi

echo "Launching $BUNDLE_ID on $SIMULATOR_NAME..."
if ! xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null 2>&1; then
  echo "Could not launch the app on the simulator." >&2
  exit 1
fi
echo "OnDeen is running."
