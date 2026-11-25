#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
repo_dir="$(pwd)"
mode="${1:-local}"
shift || true

load_env_file() {
  local env_file="$repo_dir/.env"
  if [ -f "$env_file" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$env_file"
    set +a
  fi
}

detect_lan_ip() {
  local ip_address
  ip_address="$(
    ip -4 route get 1.1.1.1 2>/dev/null |
      sed -nE 's/.* src ([0-9.]+).*/\1/p' |
      head -n1
  )"

  if [ -z "$ip_address" ]; then
    ip_address="$(hostname -I 2>/dev/null | awk '{print $1}')"
  fi

  if [ -z "$ip_address" ] && [ "$(uname -s)" = "Darwin" ]; then
    ip_address="$(ipconfig getifaddr en0 2>/dev/null || true)"
  fi

  if [ -z "$ip_address" ] && [ "$(uname -s)" = "Darwin" ]; then
    ip_address="$(ipconfig getifaddr en1 2>/dev/null || true)"
  fi

  if [ -z "$ip_address" ] && [ "$(uname -s)" = "Darwin" ]; then
    ip_address="$(
      ifconfig 2>/dev/null |
        awk '/inet / && $2 !~ /^127\./ {print $2; exit}'
    )"
  fi

  printf '%s\n' "$ip_address"
}

is_loopback_url() {
  case "${1:-}" in
    *127.0.0.1*|*localhost*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

show_usage() {
  cat <<'EOF'
Usage:
  ./run.sh local [flask args...]
  ./run.sh railway [gunicorn args...]

Modes:
  local    Runs the backend for local development with SQLite, local uploads,
           in-memory rate limiting, and scheduler disabled by default.
  railway  Runs the backend with production-style settings. Railway injects
           DATABASE_URL, REDIS_URL, PORT, and other secrets at runtime.

Examples:
  ./run.sh
  ./run.sh local
  RUH_RESTART=1 ./run.sh local
  ./run.sh railway
EOF
}

case "$mode" in
  -h|--help)
    show_usage
    exit 0
    ;;
  local|railway)
    ;;
  production|prod)
    mode="railway"
    ;;
  *)
    show_usage >&2
    exit 1
    ;;
esac

if [ -d ".venv" ]; then
  # Local developers normally use .venv; Railway's build image installs packages globally.
  if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
  else
    # Windows (Git Bash) virtualenvs use Scripts/ instead of bin/.
    source .venv/Scripts/activate
  fi
elif [ "$mode" = "local" ]; then
  echo "Missing .venv. Create it and install dependencies first:" >&2
  echo "  python -m venv .venv" >&2
  echo "  source .venv/bin/activate && pip install -r requirements.txt" >&2
  exit 1
fi

if [ ! -f "requirements.txt" ]; then
  echo "Missing requirements.txt in $(pwd)" >&2
  exit 1
fi

if [ "$mode" = "local" ]; then
  load_env_file

  export ONDEEN_ENV="${ONDEEN_ENV:-local}"
  export ONDEEN_LOCAL="${ONDEEN_LOCAL:-1}"
  export ENV="${ENV:-local}"
  export FLASK_RUN_HOST="0.0.0.0"
  export FLASK_RUN_PORT="${FLASK_RUN_PORT:-8088}"
  export PORT="${PORT:-$FLASK_RUN_PORT}"
  export TZ="${TZ:-Africa/Casablanca}"
  export d_t_z="${d_t_z:-$TZ}"
  export DATABASE_URL="${DATABASE_URL:-sqlite:///ondeen-local.db}"
  export RATELIMIT_STORAGE_URI="${RATELIMIT_STORAGE_URI:-memory://}"
  export ENABLE_SCHEDULER="${ENABLE_SCHEDULER:-false}"
  export SMS_SEND_ENABLED="${SMS_SEND_ENABLED:-false}"

  lan_ip="$(detect_lan_ip)"
  if [ -n "$lan_ip" ]; then
    local_base_url="http://$lan_ip:$FLASK_RUN_PORT"
    if [ -z "${PUBLIC_BASE_URL:-}" ] || is_loopback_url "$PUBLIC_BASE_URL"; then
      export PUBLIC_BASE_URL="$local_base_url"
    fi
    if [ -z "${EVENT_WEB_URL:-}" ] || is_loopback_url "$EVENT_WEB_URL"; then
      export EVENT_WEB_URL="$local_base_url"
    fi
    if [ -z "${UPLOAD_PUBLIC_BASE_URL:-}" ] || is_loopback_url "$UPLOAD_PUBLIC_BASE_URL"; then
      export UPLOAD_PUBLIC_BASE_URL="$local_base_url"
    fi
  fi

  running_pids=()
  while IFS= read -r pid; do
    running_pids+=("$pid")
  done < <(pgrep -f "$repo_dir/.venv/bin/flask run" || true)

  if [ "${#running_pids[@]}" -gt 0 ]; then
    echo "Backend is already running for this project:"
    ps -o pid= -o etime= -o command= -p "$(IFS=,; echo "${running_pids[*]}")"

    if [ "${RUH_RESTART:-}" = "1" ]; then
      answer="y"
    elif [ -t 0 ]; then
      read -r -p "Stop it and start a new one? [y/N] " answer
    else
      echo "Not restarting because this shell is not interactive." >&2
      echo "Run again in a terminal, or use: RUH_RESTART=1 ./run.sh local" >&2
      exit 0
    fi

    case "${answer,,}" in
      y|yes)
        echo "Stopping existing backend..."
        kill "${running_pids[@]}"

        for _ in {1..20}; do
          still_running=()
          for pid in "${running_pids[@]}"; do
            if kill -0 "$pid" 2>/dev/null; then
              still_running+=("$pid")
            fi
          done

          if [ "${#still_running[@]}" -eq 0 ]; then
            break
          fi

          sleep 0.25
        done

        if [ "${#still_running[@]}" -gt 0 ]; then
          echo "Existing backend did not stop cleanly; forcing it to stop..."
          kill -9 "${still_running[@]}"
        fi
        ;;
      *)
        echo "Leaving existing backend running."
        exit 0
        ;;
    esac
  fi

  if [ "$FLASK_RUN_HOST" = "0.0.0.0" ]; then
    if [ -n "$lan_ip" ]; then
      echo "Backend will be reachable from this laptop at: http://$lan_ip:$FLASK_RUN_PORT"
      echo "Public/upload URLs for this run: $PUBLIC_BASE_URL"
    fi
  fi

  exec flask run "$@"
fi

export ONDEEN_ENV="${ONDEEN_ENV:-railway}"
export ONDEEN_LOCAL="${ONDEEN_LOCAL:-0}"
export ENV="${ENV:-production}"
export TZ="${TZ:-Africa/Casablanca}"
export d_t_z="${d_t_z:-$TZ}"
export PORT="${PORT:-8080}"
export ENABLE_SCHEDULER="${ENABLE_SCHEDULER:-true}"
export RATELIMIT_STORAGE_URI="${RATELIMIT_STORAGE_URI:-${REDIS_URL:-memory://}}"
export UPLOAD_ROOT="${UPLOAD_ROOT:-/data/uploads}"
export RUN_DB_BOOTSTRAP="${RUN_DB_BOOTSTRAP:-true}"
# Test OTP and debug attendance are OFF by default on Railway. A review/demo
# environment without an SMS provider must opt in explicitly by setting
# ONDEEN_TEST_OTP_ENABLED=true (and, if needed, ONDEEN_ENABLE_DEBUG_ATTENDANCE=true)
# in the Railway service variables. Never enable them on a public production API.
export ONDEEN_TEST_OTP_ENABLED="${ONDEEN_TEST_OTP_ENABLED:-false}"
export ONDEEN_TEST_OTP_CODE="${ONDEEN_TEST_OTP_CODE:-123456}"
export ONDEEN_ENABLE_DEBUG_ATTENDANCE="${ONDEEN_ENABLE_DEBUG_ATTENDANCE:-false}"
# New organisation submissions remain restricted until an Admin approves the
# persisted application.  The reference seed writes the approved demo account
# explicitly, so changing this default does not affect stable demo credentials.
export ORGANIZER_DEFAULT_STATUS="${ORGANIZER_DEFAULT_STATUS:-0}"

if [ "$RUN_DB_BOOTSTRAP" = "true" ] || [ "$RUN_DB_BOOTSTRAP" = "1" ] || [ "$RUN_DB_BOOTSTRAP" = "yes" ]; then
  python scripts/init_db.py
fi

exec gunicorn wsgi:app --bind "0.0.0.0:${PORT}" --workers "${WEB_CONCURRENCY:-2}" --threads "${WEB_THREADS:-4}" "$@"
