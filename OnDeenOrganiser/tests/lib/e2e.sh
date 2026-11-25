#!/usr/bin/env bash

e2e_script_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd
}

e2e_repo_root() {
  cd "$(dirname "${BASH_SOURCE[0]}")/../.." >/dev/null 2>&1 && pwd
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
  e2e_log "Resetting local test organizer and seeding reference data"
  e2e_backend_python - <<'PY'
import os
from sqlalchemy import and_, or_
from wsgi import app
from app import db
from app.models.category import Category, SubCategory
from app.models.organization import (
    Organization,
    OrganizerAdditionalQuestion,
    OrganizerCategory,
    OrganizerSubCategory,
    RegistrationQuestion,
    SchoolOfThought,
    SectType,
)
from app.models.users import Users, Users_otp, User_session

if os.getenv("ONDEEN_LOCAL") != "1":
    raise SystemExit("Refusing to reset DB because ONDEEN_LOCAL is not 1")

phone = os.getenv("E2E_ORG_PHONE", "7700000000")
email = os.getenv("E2E_ORG_EMAIL", "local7700000000@ondeen.com")
country_raw = os.getenv("E2E_ORG_COUNTRY_CODE_RAW", "44")
country_plus = os.getenv("E2E_ORG_COUNTRY_CODE_PLUS", "+44")

with app.app_context():
    db.create_all()

    users = Users.query.filter(
        Users.role_type == 3,
        or_(
            Users.email_id == email,
            and_(Users.mobile_number == phone, Users.country_code.in_([country_raw, country_plus])),
        ),
    ).all()
    user_ids = [item.id for item in users]

    if user_ids:
        org_category_ids = [
            item.id for item in OrganizerCategory.query.filter(OrganizerCategory.user_id.in_(user_ids)).all()
        ]
        if org_category_ids:
            OrganizerSubCategory.query.filter(
                OrganizerSubCategory.organizer_category_id.in_(org_category_ids)
            ).delete(synchronize_session=False)
        OrganizerCategory.query.filter(OrganizerCategory.user_id.in_(user_ids)).delete(synchronize_session=False)
        OrganizerAdditionalQuestion.query.filter(
            OrganizerAdditionalQuestion.user_id.in_(user_ids)
        ).delete(synchronize_session=False)
        Organization.query.filter(Organization.user_id.in_(user_ids)).delete(synchronize_session=False)
        User_session.query.filter(User_session.user_id.in_(user_ids)).delete(synchronize_session=False)
        Users.query.filter(Users.id.in_(user_ids)).delete(synchronize_session=False)

    Users_otp.query.filter(
        Users_otp.role_type == 3,
        or_(Users_otp.mobile_number == phone, Users_otp.email_id == email),
    ).delete(synchronize_session=False)

    sect = SectType.query.filter_by(status=1).order_by(SectType.position.asc()).first()
    if not sect:
        sect = SectType(title="Sunni", ar_title="Sunni", position=1, status=1)
        db.session.add(sect)

    school = SchoolOfThought.query.filter_by(status=1).order_by(SchoolOfThought.position.asc()).first()
    if not school:
        school = SchoolOfThought(title="Hanafi", ar_title="Hanafi", position=1, status=1)
        db.session.add(school)

    category = Category.query.filter_by(status=1).order_by(Category.position.asc()).first()
    if not category:
        category = Category(
            title="Community Services",
            ar_title="Community Services",
            image="",
            position=1,
            status=1,
            home_view=True,
            created_by=0,
            updated_by=0,
        )
        db.session.add(category)
        db.session.flush()

    subcategory = SubCategory.query.filter_by(category_id=category.id, status=1).order_by(
        SubCategory.position.asc()
    ).first()
    if not subcategory:
        subcategory = SubCategory(
            category_id=category.id,
            title="General Support",
            ar_title="General Support",
            image="",
            position=1,
            status=1,
            created_by=0,
            updated_by=0,
        )
        db.session.add(subcategory)

    question = RegistrationQuestion.query.filter_by(question_for=1, status=1).order_by(
        RegistrationQuestion.position.asc()
    ).first()
    if not question:
        question = RegistrationQuestion(
            question_for=1,
            question_type=1,
            question="Local test registration question",
            position=1,
            status=1,
            created_by=0,
            updated_by=0,
        )
        db.session.add(question)

    db.session.commit()
    print("local backend prepared")
PY
}

e2e_activate_local_user() {
  e2e_log "Marking local organizer active for email/password login"
  e2e_backend_python - <<'PY'
import os
from wsgi import app
from app import db
from app.models.users import Users

if os.getenv("ONDEEN_LOCAL") != "1":
    raise SystemExit("Refusing to modify DB because ONDEEN_LOCAL is not 1")

email = os.getenv("E2E_ORG_EMAIL", "local7700000000@ondeen.com")

with app.app_context():
    user = Users.query.filter_by(role_type=3, email_id=email).order_by(Users.created_on.desc()).first()
    if not user:
        raise SystemExit(f"Cannot activate missing local organizer: {email}")
    user.status = 1
    db.session.commit()
    print(f"activated user_id={user.id}")
PY
}

e2e_verify_local_user() {
  e2e_backend_python - <<'PY'
import os
from wsgi import app
from app.models.organization import (
    Organization,
    OrganizerAdditionalQuestion,
    OrganizerCategory,
    OrganizerSubCategory,
)
from app.models.users import Users

email = os.getenv("E2E_ORG_EMAIL", "local7700000000@ondeen.com")

with app.app_context():
    users = Users.query.filter_by(role_type=3, email_id=email).all()
    if len(users) != 1:
        raise SystemExit(f"Expected exactly 1 organizer user for {email}, found {len(users)}")
    user = users[0]
    organization = Organization.query.filter_by(user_id=user.id).first()
    if not organization:
        raise SystemExit(f"Missing organization for user_id={user.id}")
    categories = OrganizerCategory.query.filter_by(user_id=user.id).all()
    category_ids = [item.id for item in categories]
    subcategory_count = 0
    if category_ids:
        subcategory_count = OrganizerSubCategory.query.filter(
            OrganizerSubCategory.organizer_category_id.in_(category_ids)
        ).count()
    additional_count = OrganizerAdditionalQuestion.query.filter_by(user_id=user.id).count()
    if not categories or subcategory_count < 1 or additional_count < 1:
        raise SystemExit(
            f"Incomplete registration metadata: categories={len(categories)} "
            f"subcategories={subcategory_count} additional={additional_count}"
        )
    print(
        f"user_id={user.id} status={user.status} organization_id={organization.id} "
        f"categories={len(categories)} subcategories={subcategory_count} additional={additional_count}"
    )
PY
}

e2e_get_auth_token() {
  e2e_get_json "${BASE_URL}/generate_token" | e2e_json_get access_token
}
