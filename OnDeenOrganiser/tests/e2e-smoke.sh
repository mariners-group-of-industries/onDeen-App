#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/e2e.sh"

BASE_URL="${BASE_URL:-http://127.0.0.1:8088}"
BACKEND_DIR="${BACKEND_DIR:-/home/othmane/APP-STORE-PROJECTS/ondeen}"
e2e_load_env

e2e_require BASE_URL
e2e_require BACKEND_DIR

e2e_start_backend_if_needed
e2e_prepare_local_backend

AUTH_TOKEN="$(e2e_get_auth_token)"

e2e_log "Checking reference APIs"
category_response="$(e2e_get_json "${BASE_URL}/organizer_app/profile/category_list" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$category_response" | e2e_assert_success "category_list"
category_id="$(printf '%s' "$category_response" | e2e_json_get response.0.id)"

subcategory_response="$(e2e_post_json "${BASE_URL}/organizer_app/profile/sub_category_list" "{\"category_id\":${category_id}}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$subcategory_response" | e2e_assert_success "sub_category_list"

sect_response="$(e2e_get_json "${BASE_URL}/organizer_app/profile/sect_list" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$sect_response" | e2e_assert_success "sect_list"

school_response="$(e2e_get_json "${BASE_URL}/organizer_app/profile/school_type_list" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$school_response" | e2e_assert_success "school_type_list"

question_response="$(e2e_get_json "${BASE_URL}/organizer_app/profile/register_question" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$question_response" | e2e_assert_success "register_question"

e2e_log "Checking OTP request and verification for a new organizer"
phone="${E2E_ORG_PHONE:-7700000000}"
country_raw="${E2E_ORG_COUNTRY_CODE_RAW:-44}"
otp="${E2E_ORG_OTP:-123456}"

send_response="$(e2e_post_json "${BASE_URL}/organizer_app/login/send_otp" "{\"country_code\":\"${country_raw}\",\"mobile_number\":\"${phone}\"}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$send_response" | e2e_assert_success "send_otp"
printf '%s' "$send_response" | e2e_assert_response_flag "send_otp" response.is_register false

verify_response="$(e2e_post_json "${BASE_URL}/organizer_app/login/verify_otp" "{\"country_code\":\"${country_raw}\",\"mobile_number\":\"${phone}\",\"otp\":\"${otp}\"}" -H "Auth-Token: ${AUTH_TOKEN}")"
printf '%s' "$verify_response" | e2e_assert_success "verify_otp"
printf '%s' "$verify_response" | e2e_assert_response_flag "verify_otp" response.is_register false

printf 'Smoke API flow completed\n'
