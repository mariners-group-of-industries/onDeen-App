#!/usr/bin/env bash
set -euo pipefail

backend_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
service="${RAILWAY_SERVICE:-api}"
environment="${RAILWAY_ENVIRONMENT:-production}"
identity_file="${RAILWAY_SSH_IDENTITY_FILE:-}"
seed_profile="${1:-${ONDEEN_SEED_PROFILE:-basic}}"
seed_base_date="${ONDEEN_SEED_EVENT_BASE_DATE:-}"

case "$seed_profile" in
  basic|complete|advanced|refs)
    ;;
  *)
    echo "Unknown seed profile: $seed_profile" >&2
    echo "Use: basic, complete, advanced, or refs." >&2
    exit 1
    ;;
esac

if [ -n "$seed_base_date" ] && ! [[ "$seed_base_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "ONDEEN_SEED_EVENT_BASE_DATE must be YYYY-MM-DD when provided." >&2
  exit 1
fi

cat <<EOF
NOTICE: this resets and reseeds the Railway database for service '${service}' in '${environment}'.
Seed profile: ${seed_profile}
Seed event base date: ${seed_base_date:-remote default}
It runs inside the Railway API container so Railway PostgreSQL and /data/uploads are available.
EOF

args=(ssh --service "$service" --environment "$environment")
if [ -n "$identity_file" ] && [ -f "$identity_file" ]; then
  args+=(--identity-file "$identity_file")
fi

cd "$backend_dir"
remote_command="cd /app && ONDEEN_CONFIRM_RESET=railway"
if [ -n "$seed_base_date" ]; then
  remote_command="$remote_command ONDEEN_SEED_EVENT_BASE_DATE=$seed_base_date"
fi
remote_command="$remote_command ./seed.sh railway '$seed_profile'"

railway "${args[@]}" "$remote_command"
