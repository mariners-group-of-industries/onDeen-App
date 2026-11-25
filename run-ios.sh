#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$REPO_ROOT/.ios-run"
CONFIGURATION="${ONDEEN_IOS_CONFIGURATION:-Debug}"
USER_SIMULATOR_NAME="${ONDEEN_USER_IOS_SIMULATOR:-iPhone 15 Pro}"
ORGANISER_SIMULATOR_NAME="${ONDEEN_ORGANISER_IOS_SIMULATOR:-iPhone 17 Pro}"
LAUNCH_WAIT_SECONDS="${ONDEEN_IOS_LAUNCH_WAIT_SECONDS:-6}"
RESET_APP_DATA="${ONDEEN_IOS_RESET_APP_DATA:-1}"
USE_BUNDLED_JS="${ONDEEN_IOS_USE_BUNDLED_JS:-1}"
RAILWAY_BACKEND_URL="${ONDEEN_IOS_BACKEND_URL:-${ONDEEN_REAL_BACKEND_URL:-https://api-production-517c1.up.railway.app}}"
export RCT_NEW_ARCH_ENABLED=0

show_usage() {
  cat <<'EOF'
Usage:
  ./run-ios.sh
  ./run-ios.sh both
  ./run-ios.sh user
  ./run-ios.sh organiser
  ./run-ios.sh organizer
  ./run-ios.sh doctor

With no argument, the script asks which app to run.

Default simulator targets:
  - user:      iPhone 15 Pro
  - organiser: iPhone 17 Pro

Default simulator builds install clean app data and use bundled JS with --dev
false, like the Android real-debug APK. They do not use Metro.

Metro simulator builds start separate Metro servers when explicitly requested:
  - user:      http://127.0.0.1:8081
  - organiser: http://127.0.0.1:8082

Bundled simulator builds use Railway by default:
  https://api-production-517c1.up.railway.app

Use the same backend URL as Android real-debug builds with:
  ONDEEN_REAL_BACKEND_URL=http://YOUR_IP:8088 ./run-ios.sh user

Override build configuration with:
  ONDEEN_IOS_CONFIGURATION=Release ./run-ios.sh both

Use Metro instead of bundled JS with:
  ONDEEN_IOS_USE_BUNDLED_JS=0 ./run-ios.sh user

Override simulator names with:
  ONDEEN_USER_IOS_SIMULATOR="iPhone 15 Pro" ./run-ios.sh user
  ONDEEN_ORGANISER_IOS_SIMULATOR="iPhone 17 Pro" ./run-ios.sh organiser

Override launch wait with:
  ONDEEN_IOS_LAUNCH_WAIT_SECONDS=8 ./run-ios.sh user

Keep simulator app data before installing with:
  ONDEEN_IOS_RESET_APP_DATA=0 ./run-ios.sh user
EOF
}

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "[error] Missing required command: $command_name" >&2
    exit 1
  fi
}

run_logged() {
  local label="$1"
  shift
  local safe_label log_file
  mkdir -p "$RUN_DIR"
  safe_label="$(printf "%s" "$label" | tr -cs '[:alnum:]' '-' | sed -E 's/^-+//; s/-+$//')"
  log_file="$RUN_DIR/${APP_KEY}-${safe_label}.log"

  echo "$label"
  if ! "$@" >"$log_file" 2>&1; then
    echo "[error] $label failed" >&2
    echo "[error] Full log: $log_file" >&2
    if command -v rg >/dev/null 2>&1; then
      rg -n "fatal error:|:[0-9]+:[0-9]+: error:|BUILD FAILED|The following build commands failed" -C 4 "$log_file" | tail -160 >&2 || true
    fi
    echo "[error] Last 80 log lines:" >&2
    tail -80 "$log_file" >&2
    return 1
  fi
}

prompt_choice() {
  local prompt="$1"
  local max="$2"
  local choice

  while true; do
    printf "%s" "$prompt" >&2
    if ! IFS= read -r choice; then
      printf "\n" >&2
      exit 1
    fi

    if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= max )); then
      printf "%s\n" "$choice"
      return 0
    fi

    echo "Please enter a number between 1 and $max." >&2
  done
}

select_mode_interactively() {
  echo "Run iOS app:" >&2
  echo "  1) User on $USER_SIMULATOR_NAME" >&2
  echo "  2) Organiser on $ORGANISER_SIMULATOR_NAME" >&2
  echo "  3) Both" >&2

  local selected
  selected="$(prompt_choice "Choose a mode number: " 3)"
  case "$selected" in
    1) printf '%s\n' "user" ;;
    2) printf '%s\n' "organiser" ;;
    3) printf '%s\n' "both" ;;
  esac
}

set_app_config() {
  case "$1" in
    user)
      APP_KEY="user"
      APP_LABEL="OnDeen User"
      APP_DIR="$REPO_ROOT/OnDeenUser"
      WORKSPACE="$APP_DIR/ios/OnDeen.xcworkspace"
      SCHEME="OnDeen"
      PODS_SCHEME="Pods-OnDeen"
      BUNDLE_ID="com.ondeen.user"
      DERIVED_DATA_DIR="$APP_DIR/ios/.derivedData"
      METRO_PORT="${ONDEEN_USER_METRO_PORT:-8081}"
      APP_BACKEND_URL="$RAILWAY_BACKEND_URL"
      ;;
    organiser|organizer)
      APP_KEY="organiser"
      APP_LABEL="OnDeen Organiser"
      APP_DIR="$REPO_ROOT/OnDeenOrganiser"
      WORKSPACE="$APP_DIR/ios/OnDeenOrganiser.xcworkspace"
      SCHEME="OnDeenOrganiser"
      PODS_SCHEME="Pods-OnDeenOrganiser"
      BUNDLE_ID="com.app.ondeenorganizer"
      DERIVED_DATA_DIR="$APP_DIR/ios/.derivedData"
      METRO_PORT="${ONDEEN_ORGANISER_METRO_PORT:-8082}"
      APP_BACKEND_URL="${ONDEEN_ORGANISER_IOS_BACKEND_URL:-$RAILWAY_BACKEND_URL}"
      ;;
    *)
      echo "[error] Unknown app: $1" >&2
      exit 1
      ;;
  esac
}

add_target() {
  TARGET_TYPES+=("$1")
  TARGET_NAMES+=("$2")
  TARGET_IDS+=("$3")
  TARGET_DETAILS+=("$4")
}

load_real_devices() {
  local in_devices=0
  local line name version identifier

  while IFS= read -r line; do
    case "$line" in
      "== Devices =="*)
        in_devices=1
        continue
        ;;
      "== Simulators =="*)
        in_devices=0
        continue
        ;;
    esac

    [[ "$in_devices" -eq 1 ]] || continue
    [[ "$line" == *"("*")"* ]] || continue
    [[ "$line" == *"iPhone"* || "$line" == *"iPad"* ]] || continue

    identifier="$(printf "%s\n" "$line" | sed -E 's/.*\(([^()]*)\)[[:space:]]*$/\1/')"
    name="$(printf "%s\n" "$line" | sed -E 's/^[[:space:]]*//; s/[[:space:]]*\([^()]*\)[[:space:]]*\([^()]*\)[[:space:]]*$//')"
    version="$(printf "%s\n" "$line" | sed -E 's/.*\(([^()]*)\)[[:space:]]*\([^()]*\)[[:space:]]*$/\1/')"

    [[ -n "$identifier" && "$identifier" != "$line" ]] || continue
    add_target "device" "$name" "$identifier" "real device, iOS $version"
  done < <(xcrun xctrace list devices 2>/dev/null || true)
}

load_simulators() {
  local runtime=""
  local line name identifier state

  while IFS= read -r line; do
    if [[ "$line" =~ ^--[[:space:]](.+)[[:space:]]--$ ]]; then
      runtime="${BASH_REMATCH[1]}"
      continue
    fi

    [[ "$line" == *"iPhone"* ]] || continue
    [[ "$line" =~ ^[[:space:]]+(.+)[[:space:]]\(([0-9A-Fa-f-]{36})\)[[:space:]]\(([^()]*)\) ]] || continue

    name="${BASH_REMATCH[1]}"
    identifier="${BASH_REMATCH[2]}"
    state="${BASH_REMATCH[3]}"
    add_target "simulator" "$name" "$identifier" "simulator, $runtime, $state"
  done < <(xcrun simctl list devices available)
}

select_single_target() {
  if (( ${#TARGET_IDS[@]} == 0 )); then
    echo "[error] No connected iOS device or available iPhone simulator found." >&2
    exit 1
  fi

  echo "Available iOS targets:"
  local index
  for index in "${!TARGET_IDS[@]}"; do
    printf "  %d) %s [%s]\n" "$((index + 1))" "${TARGET_NAMES[$index]}" "${TARGET_DETAILS[$index]}"
  done

  local selected
  selected="$(prompt_choice "Choose a target number: " "${#TARGET_IDS[@]}")"
  SELECTED_INDEX=$((selected - 1))
}

select_two_simulators() {
  local selected=()
  local index

  for index in "${!TARGET_IDS[@]}"; do
    [[ "${TARGET_TYPES[$index]}" == "simulator" ]] || continue
    [[ "${TARGET_DETAILS[$index]}" == *"Booted"* ]] || continue
    selected+=("$index")
  done

  for index in "${!TARGET_IDS[@]}"; do
    [[ "${TARGET_TYPES[$index]}" == "simulator" ]] || continue
    [[ " ${selected[*]} " == *" $index "* ]] && continue
    selected+=("$index")
    (( ${#selected[@]} >= 2 )) && break
  done

  if (( ${#selected[@]} < 2 )); then
    echo "[error] Need at least two available iPhone simulators for ./run-ios.sh both." >&2
    exit 1
  fi

  USER_SIM_INDEX="${selected[0]}"
  ORGANISER_SIM_INDEX="${selected[1]}"
}

latest_available_runtime_id() {
  xcrun simctl list runtimes available |
    sed -nE 's/.* - (com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]+)$/\1/p' |
    tail -n1
}

device_type_id_for_name() {
  local simulator_name="$1"
  xcrun simctl list devicetypes |
    sed -nE "s/^${simulator_name}[[:space:]]+\\(([^()]*)\\)$/\\1/p" |
    head -n1
}

find_simulator_id_by_name() {
  local simulator_name="$1"
  xcrun simctl list devices available |
    sed -nE "s/^[[:space:]]*${simulator_name}[[:space:]]+\\(([0-9A-Fa-f-]{36})\\).*/\\1/p" |
    head -n1
}

find_or_create_simulator() {
  local simulator_name="$1"
  local simulator_id device_type_id runtime_id

  simulator_id="$(find_simulator_id_by_name "$simulator_name")"
  if [[ -n "$simulator_id" ]]; then
    printf '%s\n' "$simulator_id"
    return 0
  fi

  device_type_id="$(device_type_id_for_name "$simulator_name")"
  runtime_id="$(latest_available_runtime_id)"

  if [[ -z "$device_type_id" ]]; then
    echo "[error] Simulator device type not installed: $simulator_name" >&2
    echo "[error] Open Xcode > Settings > Components and install a runtime that includes this device." >&2
    exit 1
  fi

  if [[ -z "$runtime_id" ]]; then
    echo "[error] No available iOS Simulator runtime found." >&2
    exit 1
  fi

  echo "[simulator] Creating $simulator_name for $runtime_id" >&2
  xcrun simctl create "$simulator_name" "$device_type_id" "$runtime_id"
}

ensure_workspace() {
  if [[ ! -d "$WORKSPACE" ]]; then
    echo "[error] Missing Xcode workspace: $WORKSPACE" >&2
    exit 1
  fi
}

ensure_pods() {
  local ios_dir="$APP_DIR/ios"
  if [[ \
    -d "$ios_dir/Pods" && \
    -f "$ios_dir/Podfile.lock" && \
    -f "$ios_dir/Pods/Manifest.lock" && \
    ! "$ios_dir/Podfile" -nt "$ios_dir/Pods/Manifest.lock" && \
    "$(shasum "$ios_dir/Podfile.lock" | awk '{print $1}')" == "$(shasum "$ios_dir/Pods/Manifest.lock" | awk '{print $1}')" \
  ]]; then
    return 0
  fi

  echo "[pods] Installing CocoaPods for $APP_LABEL"
  local attempt install_log update_log suggested_update
  for attempt in 1 2 3 4 5 6; do
    install_log="$(mktemp)"
    if (cd "$ios_dir" && pod install) >"$install_log" 2>&1; then
      rm -f "$install_log"
      return 0
    fi

    suggested_update="$(
      sed -nE 's/.*pod update ([^`]+) --no-repo-update.*/\1/p' "$install_log" |
        tail -n1 |
        sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//'
    )"

    if [[ -z "$suggested_update" ]]; then
      echo "[error] pod install failed for $APP_LABEL" >&2
      cat "$install_log" >&2
      rm -f "$install_log"
      return 1
    fi

    echo "[pods] Refreshing local podspec for $APP_LABEL: $suggested_update"
    update_log="$(mktemp)"
    if ! (cd "$ios_dir" && pod update "$suggested_update" --no-repo-update) >"$update_log" 2>&1; then
      echo "[pods] Targeted pod update also hit stale podspecs; refreshing all local pods for $APP_LABEL"
      if ! (cd "$ios_dir" && pod update --no-repo-update) >"$update_log" 2>&1; then
        echo "[error] pod update failed for $APP_LABEL" >&2
        cat "$install_log" >&2
        cat "$update_log" >&2
        rm -f "$install_log" "$update_log"
        return 1
      fi
    fi
    rm -f "$install_log" "$update_log"
  done

  echo "[error] pod install kept asking for local podspec updates for $APP_LABEL" >&2
  return 1
}

validate_app_target() {
  local destination_id="$1"
  local wrapper

  wrapper="$(
    xcodebuild \
      -workspace "$WORKSPACE" \
      -scheme "$SCHEME" \
      -configuration "$CONFIGURATION" \
      -destination "id=$destination_id" \
      -showBuildSettings 2>/dev/null |
      sed -nE 's/^[[:space:]]*WRAPPER_NAME = (.*)$/\1/p' |
      head -n1
  )"

  if [[ "$wrapper" != *.app ]]; then
    echo "[error] $SCHEME does not resolve to a runnable app target. WRAPPER_NAME=$wrapper" >&2
    exit 1
  fi
}

wait_for_port() {
  local port="$1"
  local attempts=120
  local n

  for ((n = 1; n <= attempts; n++)); do
    if nc -z 127.0.0.1 "$port" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done

  echo "[error] Metro did not start on port $port. Check $RUN_DIR/$APP_KEY-metro.log" >&2
  exit 1
}

start_metro_if_needed() {
  [[ "$CONFIGURATION" == *Debug* ]] || return 0
  [[ "$USE_BUNDLED_JS" == "1" && "$TARGET_TYPE" == "simulator" ]] && return 0

  mkdir -p "$RUN_DIR"
  if lsof -nP -iTCP:"$METRO_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "[metro] Port $METRO_PORT is already listening for $APP_LABEL"
    return 0
  fi

  local log_file="$RUN_DIR/$APP_KEY-metro.log"
  local pid_file="$RUN_DIR/$APP_KEY-metro.pid"

  echo "[metro] Starting $APP_LABEL Metro on port $METRO_PORT"
  if [[ "$(uname -s)" == "Darwin" ]] && command -v launchctl >/dev/null 2>&1; then
    local launch_label launch_command
    launch_label="com.ondeen.$APP_KEY.metro"
    printf -v launch_command 'cd %q && exec npx react-native start --port %q >%q 2>&1' "$APP_DIR" "$METRO_PORT" "$log_file"
    launchctl remove "$launch_label" >/dev/null 2>&1 || true
    launchctl submit -l "$launch_label" -- /bin/bash -lc "$launch_command"
    echo "$launch_label" >"$pid_file"
  else
    (
      cd "$APP_DIR"
      nohup bash -c 'exec npx react-native start --port "$1"' _ "$METRO_PORT" </dev/null >"$log_file" 2>&1 &
      echo "$!" >"$pid_file"
    )
  fi

  wait_for_port "$METRO_PORT"
}

build_app() {
  local target_type="$1"
  local destination_id="$2"
  local platform_label="$3"

  validate_app_target "$destination_id"

  run_logged "[build] Building $APP_LABEL for $platform_label" xcodebuild \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -destination "id=$destination_id" \
    -derivedDataPath "$DERIVED_DATA_DIR" \
    RCT_METRO_PORT="$METRO_PORT" \
    build
}

bundle_js_for_simulator_if_needed() {
  local app_path="$1"
  local bundle_file="$app_path/main.jsbundle"
  local bundle_command
  local encoded_backend_url
  local tmp_bundle

  [[ "$USE_BUNDLED_JS" == "1" ]] || return 0

  printf -v bundle_command \
    'cd %q && exec npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output %q --assets-dest %q --reset-cache' \
    "$APP_DIR" "$bundle_file" "$app_path"

  run_logged "[bundle] Bundling $APP_LABEL JS for simulator with --dev false" \
    bash -lc "$bundle_command"

  if [[ ! -f "$bundle_file" ]]; then
    echo "[error] Bundled JS was not created at: $bundle_file" >&2
    exit 1
  fi

  encoded_backend_url="$(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$APP_BACKEND_URL")"
  tmp_bundle="$(mktemp)"
  {
    printf 'globalThis.__ONDEEN_BASE_URL__ = %s;\n' "$encoded_backend_url"
    cat "$bundle_file"
  } > "$tmp_bundle"
  mv "$tmp_bundle" "$bundle_file"

  echo "[config] Bundling backend URL: $APP_BACKEND_URL"
}

boot_simulator() {
  local device_id="$1"
  local device_name="$2"

  echo "[simulator] Booting $device_name"
  xcrun simctl boot "$device_id" >/dev/null 2>&1 || true
  xcrun simctl bootstatus "$device_id" -b
  open -a Simulator
}

grant_simulator_permissions() {
  local device_id="$1"

  # Avoid the first-run location sheet blocking the visible app when the
  # runtime honors simctl privacy grants. Some iOS runtimes still show an
  # in-flight sheet; launch verification below catches that state.
  xcrun simctl privacy "$device_id" grant location "$BUNDLE_ID" >/dev/null 2>&1 || true
}

capture_launch_screenshot() {
  local device_id="$1"
  local screenshot_path="$RUN_DIR/$APP_KEY-launch.png"

  mkdir -p "$RUN_DIR"
  xcrun simctl io "$device_id" screenshot "$screenshot_path" >/dev/null 2>&1 || true
  if [[ -f "$screenshot_path" ]]; then
    echo "[verify] Launch screenshot: $screenshot_path"
  fi
}

wait_after_launch() {
  local device_id="$1"

  echo "[verify] Waiting ${LAUNCH_WAIT_SECONDS}s for $APP_LABEL to render"
  sleep "$LAUNCH_WAIT_SECONDS"
  capture_launch_screenshot "$device_id"
}

launch_on_simulator() {
  local device_id="$1"
  local device_name="$2"
  local app_path="$DERIVED_DATA_DIR/Build/Products/${CONFIGURATION}-iphonesimulator/${SCHEME}.app"

  if [[ ! -d "$app_path" ]]; then
    echo "[error] Built app was not found at: $app_path" >&2
    exit 1
  fi
  bundle_js_for_simulator_if_needed "$app_path"

  boot_simulator "$device_id" "$device_name"

  echo "[install] Installing $APP_LABEL on $device_name"
  if [[ "$RESET_APP_DATA" == "1" ]]; then
    xcrun simctl terminate "$device_id" "$BUNDLE_ID" >/dev/null 2>&1 || true
    xcrun simctl uninstall "$device_id" "$BUNDLE_ID" >/dev/null 2>&1 || true
  fi
  xcrun simctl install "$device_id" "$app_path"
  grant_simulator_permissions "$device_id"

  echo "[launch] Launching $BUNDLE_ID"
  xcrun simctl terminate "$device_id" "$BUNDLE_ID" >/dev/null 2>&1 || true
  if [[ "$CONFIGURATION" == *Debug* && "$USE_BUNDLED_JS" != "1" ]]; then
    SIMCTL_CHILD_RCT_METRO_HOST=localhost \
      SIMCTL_CHILD_RCT_METRO_PORT="$METRO_PORT" \
      xcrun simctl launch --terminate-running-process "$device_id" "$BUNDLE_ID"
  else
    SIMCTL_CHILD_ONDEEN_IOS_USE_BUNDLED_JS="$USE_BUNDLED_JS" \
      xcrun simctl launch --terminate-running-process "$device_id" "$BUNDLE_ID"
  fi
  open -a Simulator
  wait_after_launch "$device_id"
}

launch_on_real_device() {
  local device_id="$1"
  local device_name="$2"
  local app_path="$DERIVED_DATA_DIR/Build/Products/${CONFIGURATION}-iphoneos/${SCHEME}.app"

  if [[ ! -d "$app_path" ]]; then
    echo "[error] Built app was not found at: $app_path" >&2
    exit 1
  fi

  echo "[install] Installing $APP_LABEL on $device_name"
  xcrun devicectl device install app --device "$device_id" "$app_path"

  echo "[launch] Launching $BUNDLE_ID"
  xcrun devicectl device process launch --device "$device_id" --terminate-existing "$BUNDLE_ID"
}

run_app_on_target() {
  local app="$1"
  local target_type="$2"
  local target_name="$3"
  local target_id="$4"
  local target_details="$5"

  TARGET_TYPE="$target_type"
  set_app_config "$app"
  ensure_workspace
  ensure_pods
  start_metro_if_needed

  echo
  echo "Selected for $APP_LABEL: $target_name [$target_details]"
  echo "[config] Real-debug backend: $APP_BACKEND_URL"

  if [[ "$target_type" == "device" ]]; then
    if ! build_app "$target_type" "$target_id" "real device"; then
      cat <<'EOF'

[hint] Real-device builds need valid iOS signing.
Open the app workspace in Xcode once, select the app target, choose your Team
under Signing & Capabilities, then rerun this script.
EOF
      exit 1
    fi
    launch_on_real_device "$target_id" "$target_name"
  else
    build_app "$target_type" "$target_id" "simulator"
    launch_on_simulator "$target_id" "$target_name"
  fi
}

run_app_on_named_simulator() {
  local app="$1"
  local simulator_name="$2"
  local simulator_id

  simulator_id="$(find_or_create_simulator "$simulator_name")"
  run_app_on_target \
    "$app" \
    "simulator" \
    "$simulator_name" \
    "$simulator_id" \
    "simulator, fixed target"
}

doctor_app() {
  local app="$1"
  set_app_config "$app"
  ensure_workspace
  echo
  echo "[$APP_LABEL]"
  echo "Workspace: $WORKSPACE"
  echo "Scheme: $SCHEME"
  echo "Bundle ID: $BUNDLE_ID"
  xcodebuild -list -workspace "$WORKSPACE"
}

mode="${1:-}"
case "$mode" in
  -h|--help)
    show_usage
    exit 0
    ;;
esac

if [[ -z "$mode" ]]; then
  mode="$(select_mode_interactively)"
fi

require_command xcodebuild
require_command xcrun
require_command pod
require_command npx
require_command nc

TARGET_TYPES=()
TARGET_NAMES=()
TARGET_IDS=()
TARGET_DETAILS=()
SELECTED_INDEX=0
USER_SIM_INDEX=0
ORGANISER_SIM_INDEX=0

case "$mode" in
  both)
    run_app_on_named_simulator user "$USER_SIMULATOR_NAME"
    run_app_on_named_simulator organiser "$ORGANISER_SIMULATOR_NAME"
    ;;
  user)
    run_app_on_named_simulator user "$USER_SIMULATOR_NAME"
    ;;
  organiser|organizer)
    run_app_on_named_simulator organiser "$ORGANISER_SIMULATOR_NAME"
    ;;
  doctor)
    doctor_app user
    doctor_app organiser
    ;;
  *)
    show_usage
    exit 1
    ;;
esac

echo
echo "Done."
if [[ "$CONFIGURATION" == *Debug* ]]; then
  echo "Metro logs are in: $RUN_DIR"
fi
