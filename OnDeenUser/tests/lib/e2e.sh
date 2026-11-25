#!/usr/bin/env bash

e2e_script_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd
}

e2e_repo_root() {
  cd "$(dirname "${BASH_SOURCE[0]}")/../.." >/dev/null 2>&1 && pwd
}

e2e_default_backend_dir() {
  local workspace_dir
  workspace_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." >/dev/null 2>&1 && pwd)"
  printf '%s/ondeen\n' "$workspace_dir"
}

e2e_load_env() {
  local script_dir env_file
  script_dir="$(e2e_script_dir)"
  env_file="${E2E_ENV_FILE:-${script_dir}/e2e.env}"

  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

e2e_require() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "$value" ]]; then
    printf 'Missing required environment variable: %s\n' "$name" >&2
    exit 1
  fi
}

e2e_log() {
  printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*" >&2
}

e2e_curl_json() {
  curl -sS -m "${CURL_TIMEOUT:-20}" "$@"
}

e2e_get_json() {
  local url="$1"
  shift 1
  e2e_curl_json "$@" "$url"
}

e2e_post_json() {
  local url="$1"
  local body="$2"
  shift 2
  e2e_curl_json -X POST -H 'content-type: application/json' "$@" -d "$body" "$url"
}

e2e_json_get() {
  local path="$1"
  node -e '
const fs = require("fs");
const path = process.argv[1].split(".");
let value = JSON.parse(fs.readFileSync(0, "utf8"));
for (const key of path) {
  if (value == null) break;
  value = Array.isArray(value) && /^\d+$/.test(key) ? value[Number(key)] : value[key];
}
if (value === undefined || value === null) process.exit(1);
if (typeof value === "object") {
  process.stdout.write(JSON.stringify(value));
} else {
  process.stdout.write(String(value));
}
' "$path"
}

e2e_assert_success() {
  local label="$1"
  node -e '
const fs = require("fs");
const label = process.argv[1];
const body = fs.readFileSync(0, "utf8");
let data;
try {
  data = JSON.parse(body);
} catch (error) {
  console.error(`${label} did not return JSON`);
  console.error(body);
  process.exit(1);
}
if (data.status !== true) {
  console.error(`${label} failed`);
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}
' "$label"
}

e2e_assert_response_flag() {
  local label="$1"
  local path="$2"
  local expected="$3"
  node -e '
const fs = require("fs");
const label = process.argv[1];
const path = process.argv[2].split(".");
const expected = process.argv[3];
const data = JSON.parse(fs.readFileSync(0, "utf8"));
let value = data;
for (const key of path) {
  value = Array.isArray(value) && /^\d+$/.test(key) ? value[Number(key)] : value?.[key];
}
if (String(value) !== expected) {
  console.error(`${label} expected ${path.join(".")}=${expected}, got ${value}`);
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}
' "$label" "$path" "$expected"
}

e2e_backend_python() {
  local python_bin
  python_bin="${PYTHON_BIN:-.venv/bin/python}"

  (
    cd "$BACKEND_DIR"
    set -a
    if [[ -f .env ]]; then
      # shellcheck disable=SC1091
      source .env
    fi
    set +a
    "$python_bin" "$@"
  )
}

e2e_start_backend_if_needed() {
  if e2e_get_json "${BASE_URL}/generate_token" >/dev/null 2>&1; then
    e2e_log "Backend already responding at ${BASE_URL}"
    return 0
  fi

  e2e_log "Starting local backend at ${BASE_URL}"
  mkdir -p "$(e2e_repo_root)/artifacts/e2e-api"
  (
    cd "$BACKEND_DIR"
    set -a
    if [[ -f .env ]]; then
      # shellcheck disable=SC1091
      source .env
    fi
    set +a
    FLASK_RUN_HOST="${FLASK_RUN_HOST:-127.0.0.1}" \
      FLASK_RUN_PORT="${FLASK_RUN_PORT:-8088}" \
      nohup "${PYTHON_BIN:-.venv/bin/python}" -m flask --app wsgi:app run --host "${FLASK_RUN_HOST:-127.0.0.1}" --port "${FLASK_RUN_PORT:-8088}" --no-reload --no-debugger \
      >"$(e2e_repo_root)/artifacts/e2e-api/backend.log" 2>&1 &
  )

  local attempt
  for attempt in {1..30}; do
    if e2e_get_json "${BASE_URL}/generate_token" >/dev/null 2>&1; then
      e2e_log "Backend is ready"
      return 0
    fi
    sleep 1
  done

  printf 'Backend did not become ready at %s\n' "$BASE_URL" >&2
  exit 1
}

e2e_prepare_local_backend() {
  e2e_log "Resetting local test customer and seeding reference data"
  e2e_backend_python - <<'PY'
import os
from sqlalchemy import and_, or_
from wsgi import app
from app import db
from app.models.event import JourneyLevel
from app.models.users import Users, Users_otp, User_session, UserMembership

if os.getenv("ONDEEN_LOCAL") != "1":
    raise SystemExit("Refusing to reset DB because ONDEEN_LOCAL is not 1")

phone = os.getenv("E2E_USER_PHONE", "555999120")
email = os.getenv("E2E_USER_EMAIL", "localuser555999120@ondeen.com")
country_plus = os.getenv("E2E_USER_COUNTRY_CODE_PLUS", "+44")

with app.app_context():
    db.create_all()

    users = Users.query.filter(
        Users.role_type == 2,
        or_(
            Users.email_id == email,
            and_(Users.mobile_number == phone, Users.country_code == country_plus),
        ),
    ).all()
    user_ids = [item.id for item in users]

    if user_ids:
        UserMembership.query.filter(UserMembership.user_id.in_(user_ids)).delete(synchronize_session=False)
        User_session.query.filter(User_session.user_id.in_(user_ids)).delete(synchronize_session=False)
        Users.query.filter(Users.id.in_(user_ids)).delete(synchronize_session=False)

    Users_otp.query.filter(
        Users_otp.role_type == 2,
        or_(Users_otp.mobile_number == phone, Users_otp.email_id == email),
    ).delete(synchronize_session=False)

    journey_level = JourneyLevel.query.filter_by(status=1).order_by(JourneyLevel.id.asc()).first()
    if not journey_level:
        db.session.add(
            JourneyLevel(
                title="Beginner",
                ar_title="Beginner",
                sub_title="Local test journey level",
                ar_sub_title="Local test journey level",
                status=1,
                created_by=0,
                updated_by=0,
            )
        )

    db.session.commit()
    print("local customer backend prepared")
PY
}

e2e_verify_local_user() {
  e2e_backend_python - <<'PY'
import os
from wsgi import app
from app.models.users import Users

email = os.getenv("E2E_USER_EMAIL", "localuser555999120@ondeen.com")
phone = os.getenv("E2E_USER_PHONE", "555999120")
country_plus = os.getenv("E2E_USER_COUNTRY_CODE_PLUS", "+44")

with app.app_context():
    users = Users.query.filter_by(role_type=2, email_id=email).all()
    if len(users) != 1:
        raise SystemExit(f"Expected exactly 1 customer user for {email}, found {len(users)}")
    user = users[0]
    if user.mobile_number != phone or user.country_code != country_plus:
        raise SystemExit(
            f"Unexpected customer contact fields: {user.country_code} {user.mobile_number}"
        )
    if user.status != 1:
        raise SystemExit(f"Expected active customer status=1, got {user.status}")
    print(f"user_id={user.id} status={user.status} email={user.email_id}")
PY
}

e2e_get_auth_token() {
  e2e_get_json "${BASE_URL}/generate_token" | e2e_json_get access_token
}
