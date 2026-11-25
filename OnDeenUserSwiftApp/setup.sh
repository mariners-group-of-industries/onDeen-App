#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="$ROOT_DIR/OnDeen.xcworkspace"
PODS_CONFIG="$ROOT_DIR/Pods/Target Support Files/Pods-OnDeen/Pods-OnDeen.debug.xcconfig"
XCODE_APP_PATH="${XCODE_APP_PATH:-/Applications/Xcode.app}"
SETUP_SIMULATOR_NAME="${SIMULATOR_NAME:-iPhone 17 Pro}"
BREW_BIN=""

on_error() {
  local exit_code=$?
  echo
  echo "Setup stopped because a command failed (exit code $exit_code)."
  echo "Read the message above, fix that issue, then run ./setup.sh again."
  exit "$exit_code"
}

trap on_error ERR

step() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

info() {
  echo "[setup] $1"
}

fail() {
  echo
  echo "[setup] ERROR: $1" >&2
  exit 1
}

if [[ "$(uname -s)" != "Darwin" ]]; then
  fail "This setup script is for macOS only."
fi

if [[ ! -d "$XCODE_APP_PATH" ]]; then
  for candidate in /Applications/Xcode*.app; do
    if [[ -d "$candidate" ]]; then
      XCODE_APP_PATH="$candidate"
      break
    fi
  done
fi

if [[ ! -d "$XCODE_APP_PATH/Contents/Developer" ]]; then
  echo
  echo "Xcode is not installed on this Mac."
  echo "Please install the full Xcode app from the Mac App Store, open it once,"
  echo "accept Apple's license, and let it finish installing its components."
  echo "Then come back to this folder and run ./setup.sh again."
  echo
  echo "The App Store can be opened here:"
  echo "https://apps.apple.com/app/xcode/id497799835"
  open "macappstore://itunes.apple.com/app/id497799835" >/dev/null 2>&1 || true
  exit 1
fi

if [[ ! -d "$WORKSPACE" ]]; then
  fail "The Xcode workspace was not found at $WORKSPACE."
fi

if [[ ! -t 0 || ! -t 1 ]]; then
  fail "Run ./setup.sh from an open Terminal window so macOS can ask for your password and show installation approvals."
fi

echo
echo "OnDeen User Swift App - first-time Mac setup"
echo
echo "Keep this Terminal window open until setup finishes."
echo "The Mac may ask for your password; that is normal when installing Apple tools."
echo "If macOS or Xcode shows an approval, install/allow it and let this script continue."
echo "This setup does not build or open the simulator. You will run ./run-ios.sh yourself when it finishes."

step "Checking Xcode and Apple developer tools"

CURRENT_DEVELOPER_DIR="$(xcode-select -p 2>/dev/null || true)"
EXPECTED_DEVELOPER_DIR="$XCODE_APP_PATH/Contents/Developer"
if [[ "$CURRENT_DEVELOPER_DIR" != "$EXPECTED_DEVELOPER_DIR" ]]; then
  info "Selecting full Xcode as the active developer directory."
  sudo -v
  sudo xcode-select --switch "$EXPECTED_DEVELOPER_DIR"
fi

export DEVELOPER_DIR="$EXPECTED_DEVELOPER_DIR"

if ! xcrun --find simctl >/dev/null 2>&1; then
  echo
  echo "Apple Command Line Tools are not ready yet."
  echo "A macOS installation dialog may appear; choose Install and wait for it."
  /usr/bin/xcode-select --install >/dev/null 2>&1 || true
  echo "After Command Line Tools finish installing, run ./setup.sh again."
  exit 1
fi

info "Using: $(xcodebuild -version | head -1)"

step "Installing Homebrew if it is missing"

load_brew() {
  if [[ -x /opt/homebrew/bin/brew ]]; then
    BREW_BIN="/opt/homebrew/bin/brew"
  elif [[ -x /usr/local/bin/brew ]]; then
    BREW_BIN="/usr/local/bin/brew"
  elif command -v brew >/dev/null 2>&1; then
    BREW_BIN="$(command -v brew)"
  else
    return 1
  fi

  eval "$("$BREW_BIN" shellenv)"
}

if ! load_brew; then
  if ! command -v curl >/dev/null 2>&1; then
    fail "curl is missing. macOS normally provides it; install Command Line Tools and run setup again."
  fi

  info "Homebrew is missing. The official Homebrew installer will run now."
  info "It may ask for the Mac login password; type it even though nothing appears while typing."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  load_brew || fail "Homebrew finished but its brew command could not be found. Open a new Terminal and run setup again."
else
  info "Homebrew is already installed: $("$BREW_BIN" --version | head -1)"
fi

# Make brew available in future Terminal windows as well as in this script.
BREW_PROFILE="$HOME/.zprofile"
if ! grep -Fq "$BREW_BIN shellenv" "$BREW_PROFILE" 2>/dev/null; then
  printf '\n# Homebrew path added by OnDeenUserSwiftApp/setup.sh\neval "$(%s shellenv)"\n' "$BREW_BIN" >> "$BREW_PROFILE"
  info "Added Homebrew to $BREW_PROFILE."
fi

step "Installing CocoaPods"

if command -v pod >/dev/null 2>&1; then
  info "CocoaPods is already installed: $(pod --version)"
else
  info "Installing CocoaPods with Homebrew."
  "$BREW_BIN" install cocoapods
fi

command -v pod >/dev/null 2>&1 || fail "CocoaPods could not be found after installation."

step "Preparing the iOS simulator"

SIMULATOR_RUNTIMES="$(xcrun simctl list runtimes available 2>/dev/null || true)"
if ! printf '%s\n' "$SIMULATOR_RUNTIMES" | grep -q -E '^[[:space:]]*iOS '; then
  info "No iOS simulator runtime is installed. Downloading one through Xcode."
  XCODE_HELP="$(xcodebuild -help 2>&1 || true)"
  if printf '%s\n' "$XCODE_HELP" | grep -q -- "-downloadPlatform"; then
    xcodebuild -downloadPlatform iOS
    SIMULATOR_RUNTIMES="$(xcrun simctl list runtimes available 2>/dev/null || true)"
  else
    fail "This Xcode cannot download simulator runtimes from the command line. Open Xcode > Settings > Platforms and install an iOS Simulator runtime, then run setup again."
  fi
fi

if ! printf '%s\n' "$SIMULATOR_RUNTIMES" | grep -q -E '^[[:space:]]*iOS '; then
  fail "No iOS Simulator runtime is available. Open Xcode > Settings > Platforms, install iOS, then run setup again."
fi

AVAILABLE_DEVICES="$(xcrun simctl list devices available 2>/dev/null || true)"
if printf '%s\n' "$AVAILABLE_DEVICES" | grep -q -E '^[[:space:]]+iPhone .*\([0-9A-Fa-f-]{36}\)'; then
  info "An iPhone simulator is already available."
else
  info "No iPhone simulator exists yet. Creating one automatically."
  RUNTIME_LINE="$(printf '%s\n' "$SIMULATOR_RUNTIMES" | grep -E '^[[:space:]]*iOS ' | tail -1 || true)"
  RUNTIME_ID="$(printf '%s\n' "$RUNTIME_LINE" | sed -E 's/.* - (com\.apple\.CoreSimulator\.SimRuntime\.iOS-[^[:space:]]+).*/\1/')"
  DEVICE_TYPE_LINE="$(xcrun simctl list devicetypes 2>/dev/null | grep -m1 '^iPhone 17 Pro ' || true)"
  if [[ -z "$DEVICE_TYPE_LINE" ]]; then
    DEVICE_TYPE_LINE="$(xcrun simctl list devicetypes 2>/dev/null | grep -m1 '^iPhone ' || true)"
  fi
  DEVICE_TYPE_ID="$(printf '%s\n' "$DEVICE_TYPE_LINE" | sed -E 's/.*\((com\.apple\.CoreSimulator\.SimDeviceType\.[^)]*)\).*/\1/')"

  if [[ -z "$RUNTIME_ID" || -z "$DEVICE_TYPE_ID" ]]; then
    fail "Xcode has an iOS runtime but setup could not find an iPhone simulator type. Open Xcode once, then run setup again."
  fi

  CREATED_UDID="$(xcrun simctl create "$SETUP_SIMULATOR_NAME" "$DEVICE_TYPE_ID" "$RUNTIME_ID")"
  info "Created simulator '$SETUP_SIMULATOR_NAME' ($CREATED_UDID)."
fi

step "Installing the project's Swift dependencies"

if [[ -f "$PODS_CONFIG" ]]; then
  info "CocoaPods are already installed for this project."
else
  info "Downloading and installing the locked CocoaPods dependencies."
  (cd "$ROOT_DIR" && pod install)
fi

[[ -f "$PODS_CONFIG" ]] || fail "pod install completed without creating the expected Pods configuration."

echo
echo "============================================================"
echo "Setup finished successfully"
echo "============================================================"
echo
echo "Everything needed is installed. No build was started and the Simulator was not opened."
echo "Run the app yourself with:"
echo "  cd \"$ROOT_DIR\""
echo "  ./run-ios.sh"
echo
echo "Running ./setup.sh again is safe; it will reuse everything already installed."
