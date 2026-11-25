# OnDeen: simple developer handover

This is the order to follow when taking over OnDeen. For everyday setup and commands, use the [README](README.md). To see the finished product, open the [review site](https://ondeen-owner-review-production.up.railway.app/).

**The product has two React Native apps:** `OnDeenUser/` and `OnDeenOrganiser/`. Both use the Flask API in `Backend/`. The web admin is in `ondeen_admin_web_interface/`. `OnDeenUserSwiftApp/` is a separate iOS reference.

## 1. Create your accounts and get access

1. Create a [Railway account](https://railway.com/) and a new Railway project. Give the product owner access to it.
2. Get access to this GitHub repository and confirm which commit you will deploy.
3. Create a [Stripe account](https://stripe.com/) for the business. Invite the product owner and use **Test mode** first.
4. Ask the outgoing developer for a copy of the existing PostgreSQL database, uploaded files, current service settings and access to the old Stripe account. Also obtain the Android/iOS publishing and signing access if you will release app updates.

Keep the old services running while you set up and test your own. Transfer passwords and keys through a secure password manager, never through Git or this document.

## 2. Move the backend to your Railway project

In your new Railway project:

1. Add a PostgreSQL database.
2. Create an API service from this repository. Set its root directory to **`Backend/`**. It uses `Dockerfile`, `railway.toml` and the `./ruh.sh railway` start command.
3. Attach a persistent volume at `/data` for uploaded images and files. Set `UPLOAD_ROOT=/data/uploads`.
4. Set `DATABASE_URL` to the new PostgreSQL service. Add new `SECRET_KEY` and `JWT_SECRET_KEY` values and set the public URL variables (`PUBLIC_BASE_URL`, `UPLOAD_PUBLIC_BASE_URL`, `EVENT_WEB_URL`) to your new API domain.
5. Test OTP (`123456` for any account) and debug attendance are **off by default** on Railway. Only on a review/demo service without an SMS provider, opt in with `ONDEEN_TEST_OTP_ENABLED=true` (and `ONDEEN_ENABLE_DEBUG_ATTENDANCE=true` if the demos need forced completion; `Backend/tests/railway_e2e.py` uses it). Never enable them on a public production API.
6. For the first deployment, set `RUN_DB_BOOTSTRAP=false`, `ENABLE_SCHEDULER=false`, `PAYMENT_P0_ENABLED=false` and `PAYMENT_PAYOUT_WORKER_ENABLED=false`. These keep background and payment work off while you restore and check the data.
7. Restore the database backup into the new PostgreSQL database. Copy the uploaded files into `/data/uploads`. Check that users, events, bookings and their images appear correctly.
8. Deploy the API and check `https://YOUR-NEW-API-DOMAIN/generate_token` and its logs.

**Do not run `Backend/seed.sh` on the restored database. It resets data.** A database backup does not include uploaded files, so you need both copies. Railway has [PostgreSQL restore guidance](https://docs.railway.com/guides/postgres-backups-restores) if you need the exact export/import procedure.

## 3. Connect your Stripe account

In the **same Stripe Test account**, get:

- A `pk_test_…` **publishable key** for the User app (`OnDeenUser/src/helpers/Constant.tsx`).
- An `sk_test_…` **secret key** for the Railway API variable `STRIPE_SECRET_KEY`.
- Webhook signing secrets (`whsec_…`) for `STRIPE_WEBHOOK_SECRET` and `STRIPE_CONNECT_WEBHOOK_SECRET`.

Create platform and connected-account webhook destinations pointing to `https://YOUR-NEW-API-DOMAIN/payment/webhook`. The event types are handled in `Backend/app/services/payment.py`. Set `PAYMENT_P0_ENABLED=true` only after the keys and webhooks are ready. Test a card payment, booking, wallet entry and refund before enabling any payout worker. Stripe explains [keys](https://docs.stripe.com/keys) and [Connect webhooks](https://docs.stripe.com/connect/webhooks).

**Old Stripe payments do not move to the new Stripe account when you copy the database.** Keep access to the old account for historical refunds and reconciliation. Create new Test orders and reconnect organisers in your new account. The current backend accepts **Test keys only**; real payments need additional code and release work. Apple Pay and Google Pay need their own account and device setup.

## 4. Point everything to your new API

- Update the API URL in `OnDeenUser/src/helpers/Constant.tsx` and `OnDeenOrganiser/src/helpers/Constant.tsx`. Update the User app's Stripe publishable Test key too.
- Create a Railway admin service from `ondeen_admin_web_interface/`. Set `ONDEEN_API_URL` to your new API URL and start it with `npm start`.
- If you need to host the review site yourself, create a service from `report/`. Move its videos, PDFs and both APKs; update links that point to the old services.
- Rebuild and install **both** React Native apps. For Android review APKs, run `ONDEEN_REAL_BACKEND_URL=https://YOUR-NEW-API-DOMAIN ./build.sh realDebug` from the repository root. The files go to `~/Downloads/SHARED/` by default.

Installed old APKs still point to the old API until they are replaced. For iOS, check both apps' API settings and `run-ios.sh` before rebuilding.

## 5. Set up the other services you need

Get the owner-controlled accounts and settings for Google/Firebase (sign-in, maps and push notifications), SMS (login codes), e-mail (support), app-store signing and any custom domains. Test each service before enabling it. The current e-mail code also needs its SMTP settings reviewed because it uses `PORT`, which Railway uses for the web server.

## 6. Test, then switch over

Before anyone uses the new environment, check these journeys with new test accounts:

- User and Organiser can sign in and see the same events and uploaded images.
- A free booking creates one ticket and appears in the Organiser app.
- Check-in updates attendance and User progress.
- A **Stripe Test** payment creates one booking and matching wallet entry; a failed payment creates none.
- The admin displays real API data. The review videos and APK links work if you rehosted them.

Then agree on a switch-over time with the owner. Take a final database and file backup, stop writes to the old service, restore the final changes and point the apps/domains to the new API. Keep the old environment available until the new one has been checked and the owner accepts the handover.

For future development, follow the [README](README.md): make changes across the affected app and backend, run the relevant tests, test the installed app and verify each Railway deployment before sharing a new build.
