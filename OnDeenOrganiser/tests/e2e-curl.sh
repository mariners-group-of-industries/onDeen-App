#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/e2e.sh"

BASE_URL="${BASE_URL:-http://127.0.0.1:8088}"
BACKEND_DIR="${BACKEND_DIR:-/home/othmane/APP-STORE-PROJECTS/ondeen}"
e2e_load_env

e2e_require BASE_URL
e2e_require BACKEND_DIR

phone="${E2E_ORG_PHONE:-7700000000}"
country_raw="${E2E_ORG_COUNTRY_CODE_RAW:-44}"
country_plus="${E2E_ORG_COUNTRY_CODE_PLUS:-+44}"
cca2="${E2E_ORG_CCA2:-GB}"
email="${E2E_ORG_EMAIL:-local7700000000@ondeen.com}"
password="${E2E_ORG_PASSWORD:-Password123}"
otp="${E2E_ORG_OTP:-123456}"

e2e_start_backend_if_needed
e2e_prepare_local_backend

AUTH_TOKEN="$(e2e_get_auth_token)"

e2e_log "Loading registration reference data"
category_response="$(e2e_get_json "${BASE_URL}/organizer_app/profile/category_list" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$category_response" | e2e_assert_success "category_list"
category_id="$(printf '%s' "$category_response" | e2e_json_get response.0.id)"
category_name="$(printf '%s' "$category_response" | e2e_json_get response.0.title)"

subcategory_response="$(e2e_post_json "${BASE_URL}/organizer_app/profile/sub_category_list" "{\"category_id\":${category_id}}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$subcategory_response" | e2e_assert_success "sub_category_list"
subcategory_id="$(printf '%s' "$subcategory_response" | e2e_json_get response.0.id)"
subcategory_name="$(printf '%s' "$subcategory_response" | e2e_json_get response.0.title)"

sect_response="$(e2e_get_json "${BASE_URL}/organizer_app/profile/sect_list" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$sect_response" | e2e_assert_success "sect_list"
sect_id="$(printf '%s' "$sect_response" | e2e_json_get response.0.id)"

school_response="$(e2e_get_json "${BASE_URL}/organizer_app/profile/school_type_list" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$school_response" | e2e_assert_success "school_type_list"
school_id="$(printf '%s' "$school_response" | e2e_json_get response.0.id)"

question_response="$(e2e_get_json "${BASE_URL}/organizer_app/profile/register_question" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$question_response" | e2e_assert_success "register_question"
question_id="$(printf '%s' "$question_response" | e2e_json_get response.0.id)"

e2e_log "Requesting and verifying staging OTP"
send_response="$(e2e_post_json "${BASE_URL}/organizer_app/login/send_otp" "{\"country_code\":\"${country_raw}\",\"mobile_number\":\"${phone}\"}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$send_response" | e2e_assert_success "send_otp"
printf '%s' "$send_response" | e2e_assert_response_flag "send_otp" response.is_register false

verify_response="$(e2e_post_json "${BASE_URL}/organizer_app/login/verify_otp" "{\"country_code\":\"${country_raw}\",\"mobile_number\":\"${phone}\",\"otp\":\"${otp}\"}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$verify_response" | e2e_assert_success "verify_otp"
printf '%s' "$verify_response" | e2e_assert_response_flag "verify_otp" response.is_register false

register_body="$(
  PHONE="$phone" \
  COUNTRY_PLUS="$country_plus" \
  CCA2="$cca2" \
  EMAIL="$email" \
  PASSWORD="$password" \
  ORG_NAME="${E2E_ORG_NAME:-OnDeen Local Test Org}" \
  MANAGER_NAME="${E2E_MANAGER_NAME:-Othmane Local Tester}" \
  POST_CODE="${E2E_POST_CODE:-75001}" \
  LOCATION="${E2E_LOCATION:-Local Test Address, Paris}" \
  LATITUDE="${E2E_LATITUDE:-48.8566}" \
  LONGITUDE="${E2E_LONGITUDE:-2.3522}" \
  CATEGORY_ID="$category_id" \
  CATEGORY_NAME="$category_name" \
  SUBCATEGORY_ID="$subcategory_id" \
  SUBCATEGORY_NAME="$subcategory_name" \
  SECT_ID="$sect_id" \
  SCHOOL_ID="$school_id" \
  QUESTION_ID="$question_id" \
  node <<'NODE'
const body = {
  profile_image: "https://ondeen.app/assets/images/logo.svg",
  organization_name: process.env.ORG_NAME,
  manager_name: process.env.MANAGER_NAME,
  cca2: process.env.CCA2,
  country_code: process.env.COUNTRY_PLUS,
  mobile_number: process.env.PHONE,
  email_id: process.env.EMAIL,
  password: process.env.PASSWORD,
  post_code: process.env.POST_CODE,
  location: process.env.LOCATION,
  latitude: Number(process.env.LATITUDE),
  longitude: Number(process.env.LONGITUDE),
  foundation_date: "2024-01-01",
  sect_rep: Number(process.env.SECT_ID),
  school_thought: Number(process.env.SCHOOL_ID),
  charity_registered: 0,
  charity_no: "",
  category_id: Number(process.env.CATEGORY_ID),
  sub_category_id: Number(process.env.SUBCATEGORY_ID),
  about_us: "Local API E2E organizer account.",
  organizer_categories: [
    {
      category_id: Number(process.env.CATEGORY_ID),
      category_name: process.env.CATEGORY_NAME,
      organizer_subcategories: [
        {
          subcategory_id: Number(process.env.SUBCATEGORY_ID),
          subcategory_name: process.env.SUBCATEGORY_NAME,
          value: Number(process.env.SUBCATEGORY_ID),
          label: process.env.SUBCATEGORY_NAME,
        },
      ],
    },
  ],
  additional_information: [
    {
      question_id: Number(process.env.QUESTION_ID),
      option_value: false,
      answer: "",
    },
  ],
};
process.stdout.write(JSON.stringify(body));
NODE
)"

e2e_log "Creating organizer account via API"
register_response="$(e2e_post_json "${BASE_URL}/organizer_app/login/register" "$register_body" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$register_response" | e2e_assert_success "register"
register_token="$(printf '%s' "$register_response" | e2e_json_get response.access_token)"

e2e_log "Reading profile with registration token"
profile_response="$(e2e_get_json "${BASE_URL}/organizer_app/profile/get_profile" -H "Auth-Token: ${AUTH_TOKEN}" -H "Authorization: Bearer ${register_token}")"
printf '%s' "$profile_response" | e2e_assert_success "get_profile after register"

e2e_log "Verifying database rows created by registration"
e2e_verify_local_user

# The backend creates organizers as status=0. Email/password login requires status=1,
# so this local-only step simulates admin approval before testing that login path.
e2e_activate_local_user

e2e_log "Logging in with email/password"
login_body="{\"email_id\":\"${email}\",\"password\":\"${password}\"}"
login_response="$(e2e_post_json "${BASE_URL}/organizer_app/login/login_password" "$login_body" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$login_response" | e2e_assert_success "login_password"
login_token="$(printf '%s' "$login_response" | e2e_json_get response.access_token)"

e2e_log "Reading profile with email/password token"
profile_after_login="$(e2e_get_json "${BASE_URL}/organizer_app/profile/get_profile" -H "Auth-Token: ${AUTH_TOKEN}" -H "Authorization: Bearer ${login_token}")"
printf '%s' "$profile_after_login" | e2e_assert_success "get_profile after email login"

e2e_log "Logging out"
logout_response="$(e2e_get_json "${BASE_URL}/organizer_app/login/logout" -H "Auth-Token: ${AUTH_TOKEN}" -H "Authorization: Bearer ${login_token}")"
printf '%s' "$logout_response" | e2e_assert_success "logout"

printf '\nOrganizer API E2E completed\n'
printf 'Email: %s\n' "$email"
printf 'Phone: %s %s\n' "$country_plus" "$phone"
