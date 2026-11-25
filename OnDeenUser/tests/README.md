# OnDeen User API E2E Tests

These tests validate the customer auth and registration flow through HTTP calls only. They do not install an APK, use `adb`, or tap through a phone UI.

## Scripts

- `./tests/e2e-smoke.sh`: checks the local backend, stable customer reference APIs, OTP send, and OTP verify for a new customer.
- `./tests/e2e-curl.sh`: runs the full API flow: reset local test user, seed reference data, OTP, register customer, read profile, email/password login, read profile again, and logout.
- `./tests/run-all.sh`: runs smoke first, then the full curl flow.

## Setup

By default the scripts use the sibling backend repo:

```bash
/home/othmane/Projects/onDeenApp/ondeen
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

The default phone `555999120` is a backend fixed-OTP test number, so the OTP is always `123456`.

`/customer_app/home/home` is intentionally not part of the local SQLite e2e suite because the backend implementation uses MySQL-only date/time SQL functions.
