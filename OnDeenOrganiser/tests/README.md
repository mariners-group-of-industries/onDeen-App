# OnDeen Organizer API E2E Tests

These tests validate the organizer auth and registration flow through HTTP calls only. They do not install an APK, use `adb`, or tap through a phone UI.

The scripts are intentionally close to `/home/othmane/APP-STORE-PROJECTS/najm/tests`: shell wrappers, `curl`, small Node JSON helpers, and an optional `tests/e2e.env` file.

## Scripts

- `./tests/e2e-smoke.sh`: checks the local backend, registration reference APIs, OTP send, and OTP verify for a new organizer.
- `./tests/e2e-curl.sh`: runs the full API flow: reset local test user, seed reference data, OTP, register organizer, read profile, activate the local user, email/password login, read profile again, and logout.
- `./tests/run-all.sh`: runs smoke first, then the full curl flow.

## Setup

The default setup expects the backend repo here:

```bash
/home/othmane/APP-STORE-PROJECTS/ondeen
```

The backend must be configured as a local backend with `ONDEEN_LOCAL=1` in its `.env`. The test reset refuses to touch the database without that flag.

Optional overrides:

```bash
cp tests/e2e.env.example tests/e2e.env
```

Then edit `tests/e2e.env` if you need a different backend path, URL, phone, email, or password.

## Run

```bash
./tests/e2e-smoke.sh
./tests/e2e-curl.sh
./tests/run-all.sh
```

The scripts use `http://127.0.0.1:8088` by default. If the backend is not already responding, they start it with the backend virtualenv and write logs to `artifacts/e2e-api/backend.log`.

## Important Backend Behavior

The backend creates new organizer users with `status=0`. That means account creation and profile loading can work, but email/password login requires `status=1`. The full curl test includes a local-only DB activation step after registration to simulate admin approval before testing email/password login.

This is not a UI test. It proves the backend contract used by the app is working and repeatable. Manual phone testing can still be done separately after API E2E is green.
