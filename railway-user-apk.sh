#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="${ONDEEN_APK_DEST_DIR:-$HOME/Downloads/SHARED}"
BACKEND_URL="${ONDEEN_RAILWAY_BACKEND_URL:-https://ondeen-app-production.up.railway.app}"
SERVER_PORT="${ONDEEN_DOWNLOAD_PORT:-8765}"
USER_APK="OnDeenUser-real-debug.apk"
USER_MANIFEST="OnDeenUser-real-debug.txt"
ORG_APK="OnDeenOrganiser-real-debug.apk"
ORG_MANIFEST="OnDeenOrganiser-real-debug.txt"

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

manifest_value() {
  local manifest="$1"
  local key="$2"
  sed -nE "s/^${key}:[[:space:]]*(.*)$/\\1/p" "$manifest" | head -n1
}

sha256_file() {
  local file="$1"
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file" | awk '{print $1}'
  else
    sha256sum "$file" | awk '{print $1}'
  fi
}

human_built_at() {
  local raw="$1"
  if [[ -z "$raw" ]]; then
    printf 'unknown\n'
    return 0
  fi

  if date -j -f "%Y-%m-%dT%H:%M:%S%z" "$raw" "+%d %b %Y, %H:%M %Z" >/dev/null 2>&1; then
    date -j -f "%Y-%m-%dT%H:%M:%S%z" "$raw" "+%d %b %Y, %H:%M %Z"
    return 0
  fi

  if date -d "$raw" "+%d %b %Y, %H:%M %Z" >/dev/null 2>&1; then
    date -d "$raw" "+%d %b %Y, %H:%M %Z"
    return 0
  fi

  printf '%s\n' "$raw"
}

write_download_page() {
  local user_manifest="$DEST_DIR/$USER_MANIFEST"
  local user_built_at_raw user_built_at user_size user_sha
  local org_block=""

  user_built_at_raw="$(manifest_value "$user_manifest" "Built at")"
  user_built_at="$(human_built_at "$user_built_at_raw")"
  user_size="$(manifest_value "$user_manifest" "Size")"
  user_sha="$(sha256_file "$DEST_DIR/$USER_APK")"

  if [[ -f "$DEST_DIR/$ORG_APK" && -f "$DEST_DIR/$ORG_MANIFEST" ]]; then
    local org_built_at_raw org_built_at org_size org_sha
    org_built_at_raw="$(manifest_value "$DEST_DIR/$ORG_MANIFEST" "Built at")"
    org_built_at="$(human_built_at "$org_built_at_raw")"
    org_size="$(manifest_value "$DEST_DIR/$ORG_MANIFEST" "Size")"
    org_sha="$(sha256_file "$DEST_DIR/$ORG_APK")"
    org_block="
    <a class=\"apk\" href=\"./$ORG_APK\">
      Download Organiser APK
      <small>Built ${org_built_at:-unknown} · ${org_size:-unknown} · arm64-v8a</small>
    </a>
    <code>sha256 $org_sha</code>"
  fi

  cat > "$DEST_DIR/index.html" <<EOF
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OnDeen Railway APKs</title>
  <style>
    :root {
      --ink: #18201d;
      --muted: #68736f;
      --bg: #f6f8f4;
      --card: #ffffff;
      --green: #116149;
      --line: #dfe5de;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      padding: 24px;
      display: grid;
      place-items: center;
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
    }
    main {
      width: min(520px, 100%);
      padding: 24px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--card);
      box-shadow: 0 18px 42px rgba(24, 32, 29, .08);
    }
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      line-height: 1.08;
      letter-spacing: 0;
    }
    p {
      margin: 0 0 18px;
      color: var(--muted);
      line-height: 1.45;
    }
    .backend {
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: #f9fbf7;
      color: var(--green);
      font-size: 13px;
      font-weight: 700;
      word-break: break-all;
    }
    .apk {
      display: block;
      margin-top: 16px;
      padding: 16px 18px;
      border-radius: 8px;
      text-decoration: none;
      color: #ffffff;
      font-weight: 800;
      background: var(--green);
      box-shadow: 0 10px 22px rgba(17, 97, 73, .18);
    }
    .apk:focus,
    .apk:hover {
      background: #0d4f3b;
    }
    small {
      display: block;
      margin-top: 5px;
      color: rgba(255,255,255,.86);
      font-weight: 650;
      line-height: 1.35;
    }
    code {
      display: block;
      margin-top: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: #fbfcfa;
      color: #44504b;
      font-size: 12px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <main>
    <h1>OnDeen Railway APKs</h1>
    <p>Real-debug Android builds bundled with the Railway backend.</p>
    <div class="backend">$BACKEND_URL</div>

    <a class="apk" href="./$USER_APK">
      Download User APK
      <small>Built ${user_built_at:-unknown} · ${user_size:-unknown} · arm64-v8a · Railway backend</small>
    </a>
    <code>sha256 $user_sha</code>
$org_block
  </main>
</body>
</html>
EOF
}

start_download_server() {
  local lan_ip="$1"
  local pids

  pids="$(lsof -tiTCP:"$SERVER_PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    kill $pids
    sleep 1
  fi

  (
    cd "$DEST_DIR"
    nohup python3 -m http.server "$SERVER_PORT" --bind 0.0.0.0 > "server-$SERVER_PORT.log" 2>&1 &
    echo $! > "server-$SERVER_PORT.pid"
  )

  sleep 1
  curl -fsS --head "http://$lan_ip:$SERVER_PORT/" >/dev/null
}

mkdir -p "$DEST_DIR"

echo "[config] Backend: $BACKEND_URL"
echo "[config] Destination: $DEST_DIR"

ONDEEN_REAL_BACKEND_URL="$BACKEND_URL" "$ROOT_DIR/build.sh" userRealDebug
write_download_page

lan_ip="$(detect_lan_ip)"
start_download_server "$lan_ip"

echo
echo "Ready:"
echo "  http://$lan_ip:$SERVER_PORT/"
echo "  http://$lan_ip:$SERVER_PORT/$USER_APK"
echo
echo "Manifest:"
cat "$DEST_DIR/$USER_MANIFEST"
