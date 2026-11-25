# Google, FCM, Maps, Stripe, and Release Handoff

This document lists what is needed to verify Google Sign-In, minimal FCM push notifications, Google Maps, Stripe payments, Google Pay, and production Android releases for the OnDeen app.

## Current Findings

- The user app already has Google Sign-In code.
- Google Sign-In uses a web client ID from `OnDeenUser/src/helpers/Constant.tsx`.
- Android FCM config is loaded from `OnDeenUser/android/app/google-services.json`.
- iOS FCM config is loaded from `OnDeenUser/ios/GoogleService-Info.plist`.
- Google Maps and Places use `GOOGLE_MAP_KEY` from `OnDeenUser/src/helpers/Constant.tsx`.
- Stripe card payment is mostly implemented.
- Google Pay logic exists in the payment screen, but the Google Pay payment option UI is currently commented out.
- Stripe Connect payouts to organizers are not implemented in the backend.

## Access Needed

Ask the owner to provide these securely or add developer/admin access:

- Google Cloud Console access for the app project.
- Google Workspace admin access if it owns the Google Cloud project.
- Google Play Console access for production `.aab` / APK release.
- Stripe dashboard access, at least test mode access.
- Stripe test account credentials or dashboard invite.

## Files and Keys Needed

### Google and FCM

- `google-services.json` for Android.
- `GoogleService-Info.plist` for iOS.
- Google OAuth Web Client ID for Google Sign-In.
- Google Maps / Places API key.
- FCM project ID and service account JSON for backend push sends.

### Stripe

- Stripe publishable key:
  - `pk_test_...` for test builds.
  - `pk_live_...` for production builds.
- Stripe secret key for backend:
  - `sk_test_...` for test backend.
  - `sk_live_...` for production backend.
- Stripe webhook signing secret:
  - `whsec_...`

## Backend Environment Variables Needed

The backend currently expects these Stripe-related environment variables:

```env
stripe_api_key=sk_test_or_live_key_here
webhook_secret=whsec_webhook_secret_here
create_payment_path=https://api.ondeen.app/create_payment
```

FCM push notifications also need:

```env
FCM_PROJECT_ID=google_cloud_project_id_here
FCM_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

## App Code Updates Needed

After receiving the correct credentials:

1. Replace `OnDeenUser/android/app/google-services.json`.
2. Replace `OnDeenUser/ios/GoogleService-Info.plist`.
3. Update `GOOGLESIGNINWEBCLIENTID` in `OnDeenUser/src/helpers/Constant.tsx`.
4. Update `GOOGLE_MAP_KEY` in `OnDeenUser/src/helpers/Constant.tsx`.
5. Update Stripe `PAYMENTKEY` in `OnDeenUser/src/helpers/Constant.tsx`.
6. Confirm Android package name is still `com.ondeen.user`.
7. Add the correct Android SHA-1 and SHA-256 fingerprints in Google Cloud.
8. Rebuild Android and iOS apps.

## Stripe Work Needed

### Small or Medium Work

If the app only needs normal card payments and Google Pay through Stripe:

1. Add Stripe keys to backend environment.
2. Add Stripe publishable key to the mobile app.
3. Add Stripe webhook endpoint in Stripe dashboard:

```text
https://api.ondeen.app/webhook
```

4. Enable card payments in Stripe.
5. Enable Google Pay in Stripe.
6. Re-enable the Google Pay payment option UI.
7. Test card payment with Stripe test cards.
8. Test Google Pay on a real Android device.

### Bigger Work

If the app needs Stripe Connect payouts to organizers:

- This is not currently implemented.
- Backend needs connected account creation.
- Backend needs onboarding links.
- Backend needs organizer Stripe account storage.
- PaymentIntents need destination charges or transfers.
- Admin/organizer wallet and withdrawal logic needs to connect to real Stripe payouts.

## Known Code Issues to Fix

- Stripe webhook currently does not verify the Stripe signature using `webhook_secret`.
- Google Pay UI is currently commented out in `PaymentMethodContainer.jsx`.
- The backend `.env.example` does not document Stripe variables.
- `create_payment_path` must point to the correct backend `/create_payment` endpoint.
- Production and test keys must not be mixed.

## Test Plan

### Google Sign-In

- Test Android debug build with correct SHA-1/SHA-256.
- Test Android release build with Play signing SHA-1/SHA-256.
- Test iOS build with correct bundle ID.
- Confirm backend receives Google `sub` and email correctly.
- Confirm existing Google users can still log in.

### Google Maps

- Test location autocomplete.
- Test place details.
- Test reverse geocoding.
- Confirm API key restrictions allow the app package/bundle.

### FCM Push

- Confirm app receives FCM token.
- Confirm backend can send push notification using the minimal FCM service account.
- Test notification in foreground, background, and killed app states.

### Stripe Card Payment

- Use Stripe test mode.
- Book a paid event.
- Confirm PaymentIntent is created.
- Confirm payment sheet opens.
- Confirm payment succeeds.
- Confirm backend marks `payment_transaction.status = 1`.

### Google Pay

- Test on a real Android device.
- Confirm Google Pay is supported.
- Confirm Google Pay option appears.
- Complete a test Google Pay payment.
- Confirm backend marks payment as paid.

### Production Release

- Build signed release `.aab`.
- Upload to Google Play internal testing.
- Test Google Sign-In using Play App Signing SHA fingerprints.
- Test Maps.
- Test push notifications.
- Test Stripe card payment.
- Test Google Pay.
