# Changelog

All notable project changes should be recorded here when commits are made.

## 2026-06-05

### Stabilize Railway seed and API flows

- Added committed backend seed image assets so Railway serves real seeded event/profile images instead of 1x1 fallback PNGs.
- Fixed the seed for PostgreSQL by creating a valid `journey_level` row with id `0`, matching existing guest-user defaults.
- Made seeded profile image URLs use the correct local or Railway upload public path.
- Added `scripts/seed_railway.sh` to run the destructive Railway seed inside the API container, where Railway PostgreSQL and `/data/uploads` are available.
- Added `tests/railway_e2e.py` for a repeatable public Railway user, guest, and organiser API E2E pass.
- Fixed PostgreSQL-only query failures in customer event filters, event listing, organizer info, and booking list paths.

## 2026-05-22

### Simplify local seed and runner

- Added `seed.sh` and `run.sh` wrappers for simple `./seed.sh local` and `./run.sh local` commands.
- Made local seed image URLs use the laptop LAN IP instead of `127.0.0.1`, so Android devices can load seeded images.
- Reduced the standard seed to 5 events, 2 user bookings, and 1 guest booking on the first event.
- Updated local `.env` defaults to run Flask on `0.0.0.0:8088` and auto-detect public/upload URLs at runtime.

### Fix local organizer creation on SQLite

- Converted organizer `foundation_date` strings to Python `date` objects before inserting organization rows.
- Fixed the local SQLite create-account failure where SQLAlchemy rejected the `foundation_date` value submitted by the mobile app.
- Verified that the local organizer registration flow creates the user, organization, organizer category, organizer subcategory, and additional-question answer records.

### Make backend runnable for local debugging

- Fixed the Flask entrypoint by pointing `.flaskenv` at `wsgi:app`, because the previous `run.py` target does not exist in this repository.
- Loaded the repo `.env` before creating the Flask app so local database, JWT, rate-limit, scheduler, and SMS settings are available during configuration.
- Added `.env.example` with non-secret local defaults for running the API on `0.0.0.0:8088`.
- Added `.venv/` to `.gitignore` so local Python dependencies are not committed.
- Made Flask-Limiter storage configurable with `RATELIMIT_STORAGE_URI`, allowing local runs to use in-memory rate limiting instead of an external Redis instance.
- Made background scheduler startup configurable with `ENABLE_SCHEDULER`, so local API tests do not immediately run production-style scheduled jobs.
- Made push notification setup lazy and optional, so missing FCM credentials no longer prevents the app from importing locally.
- Normalized SMS country codes before sending so `+33` and `33` both produce a single `+336...` E.164 phone number.
- Added `SMS_SEND_ENABLED=false` support for local OTP testing without hitting the external SMS provider.
- Added a SQLite compiler fallback for MySQL `LONGTEXT` columns so `db.create_all()` can create a local development schema.
- Fixed organizer OTP validation so numeric strings from the mobile app are accepted and normalized before verification.
- Updated organizer OTP sending to return an error when the SMS provider call fails instead of always reporting success.
- Fixed the organizer email OTP limit check to use the generated OTP result instead of an undefined variable.
- Added the missing `stripe` Python dependency required by existing backend imports.
