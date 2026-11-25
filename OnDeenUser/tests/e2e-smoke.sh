#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/e2e.sh"

BASE_URL="${BASE_URL:-http://127.0.0.1:8088}"
BACKEND_DIR="${BACKEND_DIR:-$(e2e_default_backend_dir)}"
e2e_load_env

e2e_require BASE_URL
e2e_require BACKEND_DIR

e2e_start_backend_if_needed
e2e_prepare_local_backend

AUTH_TOKEN="$(e2e_get_auth_token)"
TIMEZONE="${E2E_TIMEZONE:-Europe/Paris}"

e2e_log "Checking customer reference APIs"
category_response="$(e2e_get_json "${BASE_URL}/customer_app/home/get_category" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$category_response" | e2e_assert_success "get_category"

journey_response="$(e2e_get_json "${BASE_URL}/customer_app/event/journey_levels" -H "Auth-Token: ${AUTH_TOKEN}" -H "Timezone: ${TIMEZONE}")"
printf '%s' "$journey_response" | e2e_assert_success "journey_levels"

e2e_log "Checking OTP request and verification for a new customer"
phone="${E2E_USER_PHONE:-555999120}"
country_plus="${E2E_USER_COUNTRY_CODE_PLUS:-+44}"
otp="${E2E_USER_OTP:-123456}"

send_response="$(e2e_post_json "${BASE_URL}/customer_app/users/send_otp" "{\"country_code\":\"${country_plus}\",\"mobile_number\":\"${phone}\"}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$send_response" | e2e_assert_success "send_otp"
printf '%s' "$send_response" | e2e_assert_response_flag "send_otp" response.is_register false

verify_response="$(e2e_post_json "${BASE_URL}/customer_app/users/verify_otp" "{\"country_code\":\"${country_plus}\",\"mobile_number\":\"${phone}\",\"otp\":\"${otp}\"}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$verify_response" | e2e_assert_success "verify_otp"
printf '%s' "$verify_response" | e2e_assert_response_flag "verify_otp" response.is_register false

printf 'Customer smoke API flow completed\n'
