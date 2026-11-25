#!/usr/bin/env python3
import json
import os
import urllib.error
import urllib.request


BASE_URL = os.getenv("ONDEEN_E2E_BASE_URL", "https://ondeen-app-production.up.railway.app").rstrip("/")
TIMEZONE = os.getenv("ONDEEN_E2E_TIMEZONE", "Europe/Paris")
EXPECTED_IMAGE_HOST = os.getenv("ONDEEN_E2E_IMAGE_HOST", "ondeen-app-production.up.railway.app")
ANDROID_VERSION = os.getenv("ONDEEN_E2E_ANDROID_VERSION", "1.7")


def request_json(method, path, data=None, auth_token=None, bearer_token=None, label=None):
    body = None
    headers = {"Timezone": TIMEZONE}
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if auth_token:
        headers["auth-token"] = auth_token
    if bearer_token:
        headers["Authorization"] = f"Bearer {bearer_token}"

    request = urllib.request.Request(BASE_URL + path, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read().decode("utf-8")
            status_code = response.status
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        print(f"FAIL {label or path}: HTTP {error.code}")
        print(raw[:3000])
        raise

    payload = json.loads(raw)
    print(f"{label or path}: HTTP {status_code}")
    return payload


def assert_success(payload, label):
    if payload.get("status") is not True:
        raise AssertionError(f"{label} status not true: {json.dumps(payload)[:1800]}")


def walk_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from walk_strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk_strings(item)


def assert_no_local_urls(payload, label):
    bad = [item for item in walk_strings(payload) if "127.0.0.1" in item or "localhost" in item]
    if bad:
        raise AssertionError(f"{label} returned local URLs: {bad[:5]}")


def assert_has_seed_image(payload, label):
    expected = f"{EXPECTED_IMAGE_HOST}/uploads/seed/"
    urls = [item for item in walk_strings(payload) if expected in item]
    if not urls:
        raise AssertionError(f"{label} did not include Railway seed image URL")
    return urls[0]


def extract_events(payload):
    response = payload.get("response")
    if isinstance(response, list):
        return response
    if isinstance(response, dict):
        for key in ("events", "data", "list", "event_list"):
            value = response.get(key)
            if isinstance(value, list):
                return value
    return []


def assert_mobile_renderable_events(events, label):
    if not events:
        raise AssertionError(f"{label} missing events")

    for index, event in enumerate(events[:5], start=1):
        for field in ("id", "title", "category_title", "start_date", "primary_image", "category_image"):
            if event.get(field) in (None, ""):
                raise AssertionError(f"{label} event {index} missing {field}: {event}")

        for field in ("primary_image", "category_image"):
            value = event.get(field)
            if not isinstance(value, str) or not value.startswith(("http://", "https://")):
                raise AssertionError(f"{label} event {index} has non-renderable {field}: {value!r}")


def main():
    auth = request_json("GET", "/generate_token", label="generate_token")
    auth_token = auth.get("access_token")
    if not auth_token:
        raise AssertionError(f"generate_token missing access_token: {auth}")
    print("auth_token ok")

    categories = request_json("GET", "/customer_app/home/get_category", auth_token=auth_token, label="user categories")
    assert_success(categories, "user categories")
    assert_no_local_urls(categories, "user categories")

    version = request_json(
        "POST",
        "/customer_app/users/check_version",
        {"android_version": ANDROID_VERSION},
        auth_token=auth_token,
        label="user check_version",
    )
    assert_success(version, "user check_version")
    if version.get("response", {}).get("force_android_update") == "1":
        raise AssertionError(f"user check_version forces Android update for {ANDROID_VERSION}: {version}")

    home = request_json("GET", "/customer_app/home/home", auth_token=auth_token, label="user home")
    assert_success(home, "user home")
    assert_no_local_urls(home, "user home")
    home_response = home.get("response", {})
    home_events = home_response.get("banner", {}).get("events", [])
    assert_mobile_renderable_events(home_events, "user home banner")

    filters = request_json("POST", "/customer_app/event/filter", {"type": ""}, auth_token=auth_token, label="user event filter")
    assert_success(filters, "user event filter")

    event_filter = {
        "category_id": [],
        "start_date": "",
        "end_date": "",
        "address": "",
        "journey_level_id": [],
        "organizer_id": [],
        "price_type": [],
        "sort_Filter": [1],
        "speaker_id": [],
        "gender_id": [],
        "location": [],
        "latitude": "",
        "longitude": "",
        "keyword": "",
        "location_type": "",
        "date_type": "",
        "status": 1,
    }
    events_payload = request_json("POST", "/customer_app/event/event", event_filter, auth_token=auth_token, label="user event list")
    assert_success(events_payload, "user event list")
    assert_no_local_urls(events_payload, "user event list")
    first_image = assert_has_seed_image(events_payload, "user event list")
    events = extract_events(events_payload)
    if len(events) < 5:
        raise AssertionError(f"user event list expected at least 5 events, got {len(events)}")
    assert_mobile_renderable_events(events, "user event list")
    print("user event list count", len(events), "image", first_image)

    public_detail = request_json("GET", "/customer_app/event/event_id?id=1", auth_token=auth_token, label="user public event detail")
    assert_success(public_detail, "user public event detail")
    assert_no_local_urls(public_detail, "user public event detail")
    assert_has_seed_image(public_detail, "user public event detail")

    user_login = request_json(
        "POST",
        "/customer_app/users/login",
        {"email_id": "user@gmail.com", "password": "123456"},
        auth_token=auth_token,
        label="user login",
    )
    assert_success(user_login, "user login")
    user_bearer = user_login.get("response", {}).get("access_token")
    if not user_bearer:
        raise AssertionError(f"user login missing access_token: {user_login}")

    profile = request_json("GET", "/customer_app/users/get_profile", auth_token=auth_token, bearer_token=user_bearer, label="user profile")
    assert_success(profile, "user profile")
    assert_no_local_urls(profile, "user profile")
    assert_has_seed_image(profile, "user profile")

    booking_list = request_json(
        "POST",
        "/customer_app/event/booking_list",
        {"start_date": "2026-06-05", "end_date": "2027-06-05", "status": 1},
        auth_token=auth_token,
        bearer_token=user_bearer,
        label="user booking list",
    )
    assert_success(booking_list, "user booking list")
    assert_no_local_urls(booking_list, "user booking list")
    if isinstance(booking_list.get("response"), list):
        assert_mobile_renderable_events(booking_list["response"], "user booking list")
    if not any("Seed:" in item for item in walk_strings(booking_list)):
        raise AssertionError("user booking list missing seeded event titles")

    notes = request_json(
        "POST",
        "/customer_app/event/get_all_event_note",
        {"event_id": 1},
        auth_token=auth_token,
        bearer_token=user_bearer,
        label="user event notes",
    )
    assert_success(notes, "user event notes")

    qa = request_json(
        "GET",
        "/customer_app/event/question_and_answers/1",
        auth_token=auth_token,
        bearer_token=user_bearer,
        label="user Q&A",
    )
    assert_success(qa, "user Q&A")

    complete = request_json(
        "POST",
        "/customer_app/event/debug_complete_booking",
        {},
        auth_token=auth_token,
        bearer_token=user_bearer,
        label="user mark complete",
    )
    assert_success(complete, "user mark complete")
    summary = complete.get("response", {}).get("gamification_summary")
    if not isinstance(summary, dict) or not summary.get("id"):
        raise AssertionError(f"user mark complete missing gamification summary: {complete}")

    feedback = request_json(
        "POST",
        "/customer_app/users/session_feedback",
        {
            "summary_id": summary["id"],
            "engagement_rating": 5,
            "delivery_rating": 5,
            "suggestion": "Railway E2E feedback",
        },
        auth_token=auth_token,
        bearer_token=user_bearer,
        label="user session feedback",
    )
    assert_success(feedback, "user session feedback")

    guest = request_json(
        "POST",
        "/customer_app/event/guest_booking",
        {
            "event_id": 1,
            "first_name": "Guest",
            "last_name": "Tester",
            "email_id": "guest@gmail.com",
            "country_code": "+44",
            "mobile_number": "677889900",
            "quantity": 1,
        },
        auth_token=auth_token,
        label="guest booking existing",
    )
    assert_success(guest, "guest booking existing")
    if guest.get("response", {}).get("guest_booking", {}).get("email_id") != "guest@gmail.com":
        raise AssertionError(f"guest booking response unexpected: {guest}")

    org_email_send = request_json(
        "POST",
        "/organizer_app/login/email_send_otp",
        {"email_id": "org@gmail.com"},
        auth_token=auth_token,
        label="organizer email send OTP",
    )
    assert_success(org_email_send, "organizer email send OTP")
    if org_email_send.get("response", {}).get("is_register") is not True:
        raise AssertionError(f"organizer email send OTP should find seeded org: {org_email_send}")

    org_email_verify = request_json(
        "POST",
        "/organizer_app/login/email_verify_otp",
        {"email_id": "org@gmail.com", "otp": "123456"},
        auth_token=auth_token,
        label="organizer email verify OTP",
    )
    assert_success(org_email_verify, "organizer email verify OTP")
    if not org_email_verify.get("response", {}).get("access_token"):
        raise AssertionError(f"organizer email verify OTP missing access_token: {org_email_verify}")

    org_google = request_json(
        "POST",
        "/organizer_app/login/register_social",
        {
            "provider": "google2",
            "sub": "railway-e2e-organizer-google",
            "email": "org@gmail.com",
            "name": "Railway Organizer",
            "profile_image": "https://ondeen-app-production.up.railway.app/uploads/seed/org-profile.jpg",
        },
        auth_token=auth_token,
        label="organizer Google existing",
    )
    assert_success(org_google, "organizer Google existing")
    if not org_google.get("response", {}).get("access_token"):
        raise AssertionError(f"organizer Google existing missing access_token: {org_google}")

    org_google_new = request_json(
        "POST",
        "/organizer_app/login/register_social",
        {
            "provider": "google2",
            "sub": "railway-e2e-new-organizer-google",
            "email": "new-google-organizer@example.com",
            "name": "New Google Organizer",
            "profile_image": "https://example.com/google-organizer.png",
        },
        auth_token=auth_token,
        label="organizer Google new",
    )
    assert_success(org_google_new, "organizer Google new")
    if org_google_new.get("response", {}).get("is_register") is not False:
        raise AssertionError(f"organizer Google new should require registration: {org_google_new}")

    org_login = request_json(
        "POST",
        "/organizer_app/login/login_password",
        {"email_id": "org@gmail.com", "password": "123456"},
        auth_token=auth_token,
        label="organizer login",
    )
    assert_success(org_login, "organizer login")
    org_bearer = org_login.get("response", {}).get("access_token")
    if not org_bearer:
        raise AssertionError(f"organizer login missing access_token: {org_login}")

    org_profile = request_json(
        "GET",
        "/organizer_app/profile/get_profile",
        auth_token=auth_token,
        bearer_token=org_bearer,
        label="organizer profile",
    )
    assert_success(org_profile, "organizer profile")
    assert_no_local_urls(org_profile, "organizer profile")
    assert_has_seed_image(org_profile, "organizer profile")

    org_dashboard = request_json(
        "GET",
        "/organizer_app/profile/dashboard",
        auth_token=auth_token,
        bearer_token=org_bearer,
        label="organizer dashboard",
    )
    assert_success(org_dashboard, "organizer dashboard")

    org_events = request_json(
        "POST",
        "/organizer_app/event/get_all_event",
        {"status": 1, "page": 1, "per_page": 10, "recently_added_days": 1},
        auth_token=auth_token,
        bearer_token=org_bearer,
        label="organizer event list",
    )
    assert_success(org_events, "organizer event list")
    assert_no_local_urls(org_events, "organizer event list")
    assert_has_seed_image(org_events, "organizer event list")

    org_detail = request_json(
        "POST",
        "/organizer_app/event/get_by_id",
        {"id": 1},
        auth_token=auth_token,
        bearer_token=org_bearer,
        label="organizer event detail",
    )
    assert_success(org_detail, "organizer event detail")
    assert_no_local_urls(org_detail, "organizer event detail")
    assert_has_seed_image(org_detail, "organizer event detail")

    wallet = request_json(
        "POST",
        "/organizer_app/profile/wallet_transactions",
        {"search": ""},
        auth_token=auth_token,
        bearer_token=org_bearer,
        label="organizer wallet",
    )
    assert_success(wallet, "organizer wallet")

    print("\nRAILWAY_E2E_OK user+organizer+guest flows passed")


if __name__ == "__main__":
    main()
