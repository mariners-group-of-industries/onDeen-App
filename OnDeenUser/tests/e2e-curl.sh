#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/e2e.sh"

BASE_URL="${BASE_URL:-http://127.0.0.1:8088}"
BACKEND_DIR="${BACKEND_DIR:-$(e2e_default_backend_dir)}"
e2e_load_env

e2e_require BASE_URL
e2e_require BACKEND_DIR

phone="${E2E_USER_PHONE:-555999120}"
country_plus="${E2E_USER_COUNTRY_CODE_PLUS:-+44}"
cca2="${E2E_USER_CCA2:-GB}"
email="${E2E_USER_EMAIL:-localuser555999120@ondeen.com}"
password="${E2E_USER_PASSWORD:-Password123!}"
otp="${E2E_USER_OTP:-123456}"

e2e_start_backend_if_needed
e2e_prepare_local_backend

AUTH_TOKEN="$(e2e_get_auth_token)"
TIMEZONE="${E2E_TIMEZONE:-Europe/Paris}"

e2e_log "Loading customer registration reference data"
journey_response="$(e2e_get_json "${BASE_URL}/customer_app/event/journey_levels" -H "Auth-Token: ${AUTH_TOKEN}" -H "Timezone: ${TIMEZONE}")"
printf '%s' "$journey_response" | e2e_assert_success "journey_levels"
journey_level_id="$(printf '%s' "$journey_response" | e2e_json_get response.0.id)"

e2e_log "Requesting and verifying fixed test OTP"
send_response="$(e2e_post_json "${BASE_URL}/customer_app/users/send_otp" "{\"country_code\":\"${country_plus}\",\"mobile_number\":\"${phone}\"}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$send_response" | e2e_assert_success "send_otp"
printf '%s' "$send_response" | e2e_assert_response_flag "send_otp" response.is_register false

verify_response="$(e2e_post_json "${BASE_URL}/customer_app/users/verify_otp" "{\"country_code\":\"${country_plus}\",\"mobile_number\":\"${phone}\",\"otp\":\"${otp}\"}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$verify_response" | e2e_assert_success "verify_otp"
printf '%s' "$verify_response" | e2e_assert_response_flag "verify_otp" response.is_register false

register_body="$(
  PHONE="$phone" \
  COUNTRY_PLUS="$country_plus" \
  CCA2="$cca2" \
  EMAIL="$email" \
  PASSWORD="$password" \
  OTP="$otp" \
  JOURNEY_LEVEL_ID="$journey_level_id" \
  FIRST_NAME="${E2E_USER_FIRST_NAME:-OnDeen}" \
  LAST_NAME="${E2E_USER_LAST_NAME:-Customer}" \
  node <<'NODE'
const body = {
  country_code: process.env.COUNTRY_PLUS,
  mobile_number: process.env.PHONE,
  first_name: process.env.FIRST_NAME,
  last_name: process.env.LAST_NAME,
  email_id: process.env.EMAIL,
  password: process.env.PASSWORD,
  confirm_password: process.env.PASSWORD,
  gender: 1,
  profile_image: "",
  journey_level_id: Number(process.env.JOURNEY_LEVEL_ID || 0),
  cca2: process.env.CCA2,
  age: 30,
  otp: process.env.OTP,
};
process.stdout.write(JSON.stringify(body));
NODE
)"

e2e_log "Creating customer account via API"
register_response="$(e2e_post_json "${BASE_URL}/customer_app/users/register" "$register_body" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$register_response" | e2e_assert_success "register"
register_token="$(printf '%s' "$register_response" | e2e_json_get response.access_token)"

e2e_log "Reading profile with registration token"
profile_response="$(e2e_get_json "${BASE_URL}/customer_app/users/get_profile" -H "Auth-Token: ${AUTH_TOKEN}" -H "Authorization: Bearer ${register_token}")"
printf '%s' "$profile_response" | e2e_assert_success "get_profile after register"
printf '%s' "$profile_response" | e2e_assert_response_flag "get_profile after register" response.email_id "$email"

e2e_log "Verifying database row created by registration"
e2e_verify_local_user

e2e_log "Logging in with email/password"
login_body="{\"email_id\":\"${email}\",\"password\":\"${password}\"}"
login_response="$(e2e_post_json "${BASE_URL}/customer_app/users/login" "$login_body" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$login_response" | e2e_assert_success "login"
login_token="$(printf '%s' "$login_response" | e2e_json_get response.access_token)"

e2e_log "Reading profile with email/password token"
profile_after_login="$(e2e_get_json "${BASE_URL}/customer_app/users/get_profile" -H "Auth-Token: ${AUTH_TOKEN}" -H "Authorization: Bearer ${login_token}")"
printf '%s' "$profile_after_login" | e2e_assert_success "get_profile after login"
printf '%s' "$profile_after_login" | e2e_assert_response_flag "get_profile after login" response.email_id "$email"

e2e_log "Logging out"
logout_response="$(e2e_get_json "${BASE_URL}/customer_app/users/logout" -H "Auth-Token: ${AUTH_TOKEN}" -H "Authorization: Bearer ${login_token}")"
printf '%s' "$logout_response" | e2e_assert_success "logout"

printf '\nCustomer API E2E completed\n'
printf 'Email: %s\n' "$email"
printf 'Phone: %s %s\n' "$country_plus" "$phone"
