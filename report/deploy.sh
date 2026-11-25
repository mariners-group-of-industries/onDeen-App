#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAILWAY_SKILL_DIR="${RAILWAY_SKILL_DIR:-$HOME/.codex/skills/railway-deploy}"
SERVICE="${RAILWAY_SERVICE:-ondeen-owner-review}"
ENVIRONMENT="${RAILWAY_ENVIRONMENT:-production}"
APK_VOLUME="${RAILWAY_APK_VOLUME:-ondeen-owner-review-volume}"

if [[ ! -x "$RAILWAY_SKILL_DIR/scripts/railway-secure" ]]; then
  echo "Missing railway-secure wrapper at $RAILWAY_SKILL_DIR/scripts/railway-secure" >&2
  exit 1
fi

echo "Validating local review packet..."
node --check "$BASE_DIR/server.js"
test -f "$BASE_DIR/index.html"
test -f "$BASE_DIR/site.css"
test -f "$BASE_DIR/assets/videos/user-app-demo.mp4"
test -f "$BASE_DIR/assets/refs/user-app-ref.pdf"
test -s "$BASE_DIR/downloads/OnDeenUser-real-debug.apk"
test -s "$BASE_DIR/downloads/OnDeenOrganiser-real-debug.apk"

echo "Deploying $SERVICE to Railway ($ENVIRONMENT)..."
"$RAILWAY_SKILL_DIR/scripts/railway-secure" session-cli up \
  --service "$SERVICE" \
  --environment "$ENVIRONMENT" \
  --path-as-root \
  --message "Publish OnDeen review packet with Android APKs" \
  "$BASE_DIR"

if [[ "${RAILWAY_UPLOAD_APKS:-0}" == "1" ]]; then
  echo "Uploading Android APKs to the persistent Railway volume..."
  "$RAILWAY_SKILL_DIR/scripts/railway-secure" session-cli volume \
    files --volume "$APK_VOLUME" upload \
    "$BASE_DIR/downloads/OnDeenUser-real-debug.apk" "/OnDeenUser-real-debug.apk" \
    --overwrite --json >/dev/null
  "$RAILWAY_SKILL_DIR/scripts/railway-secure" session-cli volume \
    files --volume "$APK_VOLUME" upload \
    "$BASE_DIR/downloads/OnDeenOrganiser-real-debug.apk" "/OnDeenOrganiser-real-debug.apk" \
    --overwrite --json >/dev/null
else
  echo "Preserving existing Railway APKs (set RAILWAY_UPLOAD_APKS=1 only for new builds)."
fi

echo "Deployment command completed. Verify the generated Railway URL and deployment in the dashboard."
