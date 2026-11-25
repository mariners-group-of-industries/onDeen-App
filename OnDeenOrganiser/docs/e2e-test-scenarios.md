# E2E Test Scenarios

The automated tests now use API calls only. They do not touch the Android device, do not install an APK, and do not depend on fragile screen coordinates.

Executable tests live in:

```bash
tests/
```

See [tests/README.md](../tests/README.md) for commands and environment overrides.

## Test Environment

- Frontend repo: `/home/othmane/APP-STORE-PROJECTS/OnDeenOrganiser`
- Backend repo: `/home/othmane/APP-STORE-PROJECTS/ondeen`
- Local backend: `http://127.0.0.1:8088`
- Backend safety flag: `ONDEEN_LOCAL=1`
- Local OTP: `123456` when backend `.env` uses `ENV=staging`
- Test account: `local7700000000@ondeen.com` / `Password123`

The scripts start the local backend if it is not already responding. They also reset only the local test organizer and seed the reference rows needed for registration.

## Scenario 1: API Smoke

Goal: prove the local backend is alive and the registration support APIs are usable.

Automated coverage:

```bash
./tests/e2e-smoke.sh
```

Checks:

- `GET /generate_token`
- `GET /organizer_app/profile/category_list`
- `POST /organizer_app/profile/sub_category_list`
- `GET /organizer_app/profile/sect_list`
- `GET /organizer_app/profile/school_type_list`
- `GET /organizer_app/profile/register_question`
- `POST /organizer_app/login/send_otp`
- `POST /organizer_app/login/verify_otp`

Expected result:

- All responses return `status: true`.
- OTP verification returns `is_register: false` before account creation.

## Scenario 2: Organizer Registration Contract

Goal: prove the backend contract used by the app can create a complete organizer account.

Automated coverage:

```bash
./tests/e2e-curl.sh
```

Checks:

- Reset the local test user.
- Seed sect, school of thought, category, subcategory, and registration question if missing.
- Send and verify OTP for `+44 7700000000`.
- Register the organizer with organization details, category/subcategory, and additional information.
- Read profile using the registration token.
- Verify the local DB has exactly one user, organization, category link, subcategory link, and additional-question row.

Expected result:

- Backend creates one organizer user for the test email/phone.
- Backend creates the linked organization and registration metadata.
- Profile can be read with the returned registration token.

## Scenario 3: Email Login And Logout Contract

Goal: prove an existing active organizer can log in with email/password, read profile, then log out.

Automated coverage:

```bash
./tests/e2e-curl.sh
```

Important backend behavior:

The backend creates organizers with `status=0`. Email/password login requires `status=1`, so the curl test performs a local-only DB activation step after registration to simulate admin approval.

Expected result:

- `POST /organizer_app/login/login_password` returns an access token.
- `GET /organizer_app/profile/get_profile` succeeds with the email-login token.
- `GET /organizer_app/login/logout` succeeds and removes that session.

## Run Everything

```bash
./tests/run-all.sh
```

## Manual Device Testing

Real-device testing is still useful after the API contract is green, but it should stay manual for now. The previous coordinate-based automation was unreliable because small UI timing/layout changes made it tap the wrong controls.

For manual Android checks, use `./build.sh installRealDebug`, keep the app installed in place, and point the frontend at the local backend when testing local flows.

## Next Scenarios To Add

- Create an event through API after the event payload is mapped.
- Upload or select event media after local file-upload behavior is deterministic.
- Edit organizer profile and verify persisted changes through API and app UI.
- Wallet/dashboard API smoke test with seeded local transactions.
- Negative login tests for wrong OTP, wrong password, duplicate email, and duplicate phone.
