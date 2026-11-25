# Backend deploy checklist: OnDeen API on Railway

**Service:** `Backend/` (Flask, gunicorn, PostgreSQL) · **Target:** a new Railway project
**Date:** ________ · **Deployer:** ________ · **Commit:** ________

Situation as of 15 Nov 2026: the old Railway services (API, admin web, owner review) all return
*"Application not found"*, and `api.ondeen.app` (35.154.40.168) does not respond. This is a
**fresh deploy**, possibly without the old data. Work through the sections in order. Do not skip §0.

---

## 0. Before anything: find out what happened to the old environment

- [ ] Ask the previous developer or account owner whether the old Railway project was **deleted, suspended (billing) or moved** to another account.
- [ ] Find out whether a **PostgreSQL backup** exists. If the project was deleted, its database and `/data` volume may be gone.
- [ ] Find out whether the **uploaded files** (`/data/uploads`) were backed up. A database dump does not include them.
- [ ] Get access to the **old Stripe account**. It holds historical payments and refunds, and Connect accounts do not move to a new Stripe account.
- [ ] Decide which path you're on:
  - **A: Restore.** A backup exists: restore the data, do **not** seed.
  - **B: Fresh, demo/review.** No backup: seed reference data (`refs`) for demos.
  - **C: Fresh, real production.** No backup and real users: empty database plus one admin account (see §5C).

## 1. Code readiness (local)

- [ ] Commit the security fixes from this session (the project has a new git repo at `f:\onDeenApp\onDeenApp`, with no commits yet):
  - test OTP and debug attendance default **off** (`ruh.sh`, `config.py`, `user.py`, `online_checkin.py`)
  - password rules on sign-up and change (`validators.py`, `organizer_validators.py`)
  - `change_password` requires the current password or a fresh OTP (customer and organiser)
  - `auth_method` claim on login tokens
- [ ] Confirm `Backend/.env` is **not** committed: `git check-ignore Backend/.env` should print the path.
- [ ] Run the backend tests locally. Python 3.11 is installed but not on PATH:
  ```bash
  cd Backend
  /c/Users/Arif/AppData/Local/Programs/Python/Python311/python.exe -m venv .venv
  source .venv/Scripts/activate
  pip install -r requirements.txt
  python -m pytest tests/test_local_critical.py tests/test_payment_p0.py -q
  ```
  `libmagic` and `wkhtmltopdf` may be missing on Windows. Record any failures that come from them as environment issues, not code failures.
- [ ] Push to the GitHub repo Railway will deploy from, and write the commit SHA at the top of this sheet.

## 2. Create the Railway project

- [ ] New Railway project, owned by (or shared with) the product owner.
- [ ] Add a **PostgreSQL** service.
- [ ] Add an **API service** from the GitHub repo:
  - Root directory: **`Backend/`**
  - It builds from `Dockerfile`. `railway.toml` sets the start command `./ruh.sh railway` and the health check `/generate_token` (300 s timeout).
- [ ] Attach a **volume** mounted at **`/data`** (for uploads).
- [ ] Generate a public domain for the API. Write it here: `https://______________________`

## 3. Environment variables (API service)

Generate new secrets; never reuse old values from chat or docs. Store them in a password manager.

**Required**

| Variable | Value |
|---|---|
| `DATABASE_URL` | Reference the Railway Postgres variable (`${{Postgres.DATABASE_URL}}`) |
| `SECRET_KEY` | New random value (64+ chars) |
| `JWT_SECRET_KEY` | New random value (64+ chars), different from `SECRET_KEY` |
| `UPLOAD_ROOT` | `/data/uploads` |
| `PUBLIC_BASE_URL` | `https://<api-domain>` |
| `UPLOAD_PUBLIC_BASE_URL` | `https://<api-domain>` |
| `EVENT_WEB_URL` | `https://<api-domain>` (share and deep-link base) |
| `ONDEEN_PUBLIC_BASE_URL` | `https://<api-domain>` |

**First deploy: keep everything risky OFF**

| Variable | First deploy | Notes |
|---|---|---|
| `RUN_DB_BOOTSTRAP` | `true` for an empty DB (paths B and C); `false` while restoring (path A) | Runs `scripts/init_db.py`: `create_all`, additive column fixes, and a reference-material sync that only acts if event 1 is "The Knowledge Class". It does not drop data. |
| `ENABLE_SCHEDULER` | `false` | See §7: the scheduler runs once **per gunicorn worker**. |
| `PAYMENT_P0_ENABLED` | `false` | Turn on only after Stripe is set up (§6). |
| `PAYMENT_PAYOUT_WORKER_ENABLED` | `false` | Turn on last, after a successful test payout. |
| `ONDEEN_TEST_OTP_ENABLED` | `false` for real production; `true` **only** for a demo/review env with no SMS provider | When on, `123456` logs into **any** account. |
| `ONDEEN_ENABLE_DEBUG_ATTENDANCE` | `false` (set `true` only on a demo env if `tests/railway_e2e.py` must run) | When on, forced session completion is allowed. |
| `ONDEEN_FIXED_OTP_NUMBERS` | unset | Set only if an app-store reviewer needs a test number. |
| `ORGANIZER_DEFAULT_STATUS` | `0` | New organisers wait for admin approval. |
| `SMS_SEND_ENABLED` / `EMAIL_SEND_ENABLED` | `false` until providers are configured | |

**Optional / later**

- `REDIS_URL`, plus `RATELIMIT_STORAGE_URI=${REDIS_URL}`: add a Railway Redis so rate limits are shared across workers. Without it, limits are per worker, in memory.
- `GOOGLE_OAUTH_CLIENT_IDS`, `APPLE_CLIENT_ID`: social sign-in.
- `FCM_PROJECT_ID` + `FCM_SERVICE_ACCOUNT_JSON`: push notifications.
- `SMS_API_URL`, `SMS_AUTH_TOKEN`: SMS OTP delivery.
- `ADMIN_EMAIL`: where support emails go.
- `TZ` / `ONDEEN_SCHEDULER_TIMEZONE`: default `Africa/Casablanca`. Confirm this is intended for a UK/GBP product.
- `WEB_CONCURRENCY` (default 2), `WEB_THREADS` (default 4).

## 4. First deploy

- [ ] Deploy. Watch the build log for `pip install` finishing and the `wkhtmltopdf` / `libmagic1` apt step.
- [ ] Watch the deploy log for `Database schema bootstrap complete.` (when `RUN_DB_BOOTSTRAP=true`).
- [ ] Health check passes: `curl -i https://<api-domain>/generate_token` returns **200** with an `access_token`.
- [ ] No tracebacks in the first 5 minutes of logs.

## 5. Data

**A. Restore from backup**
- [ ] `RUN_DB_BOOTSTRAP=false` while restoring.
- [ ] Restore the dump into the new Postgres ([Railway guide](https://docs.railway.com/guides/postgres-backups-restores)).
- [ ] Copy the uploads into the volume at `/data/uploads`, keeping the folder structure.
- [ ] Stored image URLs point to the **old** domain. Check a few `event_images` / profile image rows. If they contain the old host, plan a URL rewrite before switching the apps over.
- [ ] Run one deploy with `RUN_DB_BOOTSTRAP=true` to apply the additive schema fixes, then set it back to `false`.
- [ ] **Never run `seed.sh` or `scripts/seed_railway.sh` on this database. They reset it.**

**B. Fresh demo/review**
- [ ] `scripts/seed_railway.sh refs` (it resets the DB and runs inside the container over Railway SSH).
- [ ] The seed creates demo accounts with **known passwords**. Never use this database for real users.

**C. Fresh real production**
- [ ] The backend has **no endpoint or script to create the first admin** (`/admin_app/admin` only has `login`). A one-off `scripts/create_admin.py` is needed and run once over Railway SSH. It doesn't exist yet.
- [ ] Add the categories and subcategories through the admin panel once an admin exists.

## 6. Stripe (Test mode only; the backend rejects live keys)

- [ ] In the business's Stripe account, in **Test mode**, get:
  - `sk_test_…` → `STRIPE_SECRET_KEY`
  - `pk_test_…` → User app `src/helpers/Constant.tsx` (`STRIPE_TEST_PUBLISHABLE_KEY`)
- [ ] Create **two** webhook endpoints, both to `https://<api-domain>/payment/webhook`:
  - Platform events → its secret goes in `STRIPE_WEBHOOK_SECRET`
  - Connected-account events → its secret goes in `STRIPE_CONNECT_WEBHOOK_SECRET`
  - Events handled: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.refunded`, `refund.updated`, `charge.dispute.created`, `charge.dispute.closed`, `account.updated`, `payout.paid`, `payout.failed`
- [ ] `STRIPE_CONNECT_RETURN_URL` = `https://<api-domain>/payment/connect/return`; `STRIPE_CONNECT_REFRESH_URL` = `https://<api-domain>/payment/connect/refresh`
- [ ] Set `PAYMENT_P0_ENABLED=true` and redeploy.
- [ ] In the Stripe dashboard, use **Send test webhook** for `payment_intent.succeeded` and check that the endpoint returns 2xx.
- [ ] Organisers must **reconnect** Stripe Connect in the new account.

## 7. Background jobs (scheduler)

`ENABLE_SCHEDULER=true` starts APScheduler **inside every gunicorn worker**, and there is no leader lock. With the default 2 workers, every job runs twice: event notifications every minute, the payout worker every 5 minutes. Pick one:

- [ ] **Simple:** set `WEB_CONCURRENCY=1` (and raise `WEB_THREADS` if needed) before enabling the scheduler, **or**
- [ ] **Better:** run a second Railway service from the same repo with `ENABLE_SCHEDULER=true` and `WEB_CONCURRENCY=1`, and set `ENABLE_SCHEDULER=false` on the web service.
- [ ] Enable the scheduler only after §8 passes.
- [ ] Enable `PAYMENT_PAYOUT_WORKER_ENABLED=true` last, after one manual test payout succeeds.

## 8. Smoke tests (with new test accounts)

Point the clients at the new API first:
- Android: `ONDEEN_REAL_BACKEND_URL=https://<api-domain> ./build.sh realDebug` (builds both apps)
- Admin panel: `REACT_APP_API_URL=https://<api-domain>` in `F:\ondeen admin src\.env`, then `npm start`

Checks:
- [ ] `GET /generate_token` → 200
- [ ] User app: register (password rules: 8+ characters, a letter and a number), log in, see events and images.
- [ ] Organiser app: register, then the account shows "under review". *(The admin panel can't approve applications yet. Approve through `POST /admin_app/organizer/applications/review` or add the screen.)*
- [ ] Organiser publishes a free event, the User books it → **one** ticket appears, and the booking shows in the Organiser participant list.
- [ ] Check-in updates attendance and the User's XP and Radar.
- [ ] Image upload works and the image URL loads from `https://<api-domain>/…` (this checks the volume and the public URL).
- [ ] Password change: Settings needs the current password; forgot-password with OTP works.
- [ ] Debug endpoint is closed: `POST /customer_app/event/debug_complete_booking` with a valid user token returns an error (when `ONDEEN_ENABLE_DEBUG_ATTENDANCE` is off).
- [ ] Test OTP is closed (production): OTP login with `123456` **fails**.
- [ ] Stripe (if enabled): card `4242 4242 4242 4242` → one booking, one ledger and wallet entry. Card `4000 0000 0000 0002` (declined) → **no** booking.
- [ ] Refund request → organiser decision → refund shows in Stripe and the wallet.
- [ ] Admin panel login works and lists users, organisers and events.

## 9. Known limitations to accept or fix before going live

- **Email is broken on Railway.** `app/utils/notification.py` reads the SMTP host from `HOSTNAME` and the port from `PORT`. Railway and Docker set both automatically (to the container name and the web port), so mail goes to the wrong server. This needs a small code fix (e.g. `SMTP_HOST` / `SMTP_PORT`) before support or OTP email can work.
- **No migrations.** Schema changes rely on `create_all` plus hand-written additive `ALTER`s. Take a database backup before every deploy that changes models.
- **Login tokens contain the password hash** (`generate_token`). Not a deploy blocker, but fix it before a public launch.
- **CORS is `*`** (`wsgi.py`). Restrict it to the admin panel's domain once that domain is known.
- **The admin panel calls about 24 routes the backend doesn't have** (facilities, languages, admin users, etc.). Those screens will error.

## 10. Rollback

Decide the triggers now, not during the incident:

- Health check fails, or the service crash-loops for over 5 minutes after deploy
- Login (password or OTP) fails for test accounts
- A test payment creates **zero or duplicate** bookings or ledger entries
- Error-level log entries keep repeating on every request

**How to roll back**
- [ ] Railway → API service → Deployments → **Redeploy** the last good deployment.
- [ ] If payments misbehave: set `PAYMENT_P0_ENABLED=false` and `PAYMENT_PAYOUT_WORKER_ENABLED=false` (this stops new payment work without a code rollback).
- [ ] If notifications spam: set `ENABLE_SCHEDULER=false`.
- [ ] If data is damaged: restore the backup taken just before the deploy (Railway Postgres backups or your own `pg_dump`).
- [ ] Take a `pg_dump` **before** every production deploy. Railway backups depend on your plan.

## 11. After deploy

- [ ] Record the API domain and commit SHA in `Passation.md` / the README (they still list the dead Railway URLs).
- [ ] Rebuild and distribute the User and Organiser apps pointing to the new API. Installed old APKs still point to the old, dead URL.
- [ ] Deploy the admin panel with `REACT_APP_API_URL` set.
- [ ] Turn on Railway usage alerts and billing notifications, so the project isn't lost again without warning.
- [ ] Tell the product owner the new URLs and which features are on or off (payments, SMS, email, push).
