# Changelog

All notable project changes should be recorded here when commits are made.

## 2026-05-22

### Add curl-based local API E2E tests

- Replaced the fragile real-device coordinate automation with API-only E2E scripts under `tests/`.
- Added shared curl/JSON/backend helpers, smoke coverage, a full organizer registration/login/logout flow, and a `run-all` wrapper.
- Added local backend safety checks so DB reset/seed operations refuse to run unless the backend environment has `ONDEEN_LOCAL=1`.
- Documented why the backend-created organizer is `status=0` and why the test performs a local-only activation before email/password login.
- Updated the E2E scenarios doc to point to the executable API tests and keep real-device checks manual for now.

### Document local real-device E2E scenarios

- Added `docs/e2e-test-scenarios.md` with the first local backend E2E runbook for organizer account creation, logout, email/password login, and backend connectivity checks.
- Documented the real-device prerequisites: local Flask backend on `127.0.0.1:8088`, `adb reverse`, `installRealDebug`, staging OTP `123456`, and seeded backend reference data.
- Recorded the expected evidence to capture for each scenario, including screenshots, logcat checks, and backend DB verification.
- Kept the frontend pointed at the local backend for this testing phase and added comments showing the production-like VPS URL to restore later.

### Add local backend create-account test defaults

- Added frontend defaults that only activate when `BASE_URL` points to `127.0.0.1` or `localhost`, allowing the organizer create-account flow to be completed against the local backend without manual image upload or map selection.
- Pre-filled local-only organizer test values for profile image, organization details, email, password, location, foundation date, sect, school of thought, charity state, and category/subcategory selection.
- Preserved normal production behavior by leaving these defaults disabled for non-local backend URLs.
- Kept additional-question validation usable in local backend tests by defaulting test answers to `No` and falling back to account location/coordinates when route params are absent.
- Verified the real-device local backend flow through OTP verification, basic details, about/bio, additional info, and account creation.

### Document debug APK auth troubleshooting

- Added `docs/debug-apk-auth-troubleshooting.md` to explain why the debug APK showed multiple red errors and warnings.
- Documented the difference between a backend outage and expected `403 Unauthorized access` responses caused by the local `debug-token`.
- Recorded the current debug testing flow with `./build.sh installDebug`, phone login, and OTP `0000`.
- Added backend-code findings from `/home/othmane/APP-STORE-PROJECTS/ondeen`, including OTP generation, token validation, SMS-provider risk, and the suspected double-plus phone-number formatting issue.
- Normalized OTP API country codes on the frontend so `send_otp` and `verify_otp` send `44` instead of `+44`, matching the backend's SMS formatter.
- Added `realDebug` and `installRealDebug` build modes for a debug-signed APK with `--dev false`, disabling OTP `0000` and local debug API fallbacks while avoiding release signing.
- Documented the current release-signing uncertainty so release automation is not added before the production JKS/CI setup is confirmed.

### Stabilize standalone debug login and device testing

- Kept the installed Android app in place and updated it with `adb install -r -t` during testing.
- Made the standalone debug phone flow skip the real send-OTP endpoint and navigate directly to the OTP screen.
- Kept the debug OTP as `0000`, then verified the flow on a real Mi 9 Lite device through the home dashboard.
- Added debug-only API fallback responses for profile, dashboard, event listing, and wallet endpoints when the app is using the `debug-token`.
- Normalized API failures into response objects so debug builds do not open red error overlays for expected backend failures.
- Replaced a null profile image source on the dashboard with the bundled profile placeholder.
- Suppressed known debug-only warnings from redux-persist/action metadata and third-party `defaultProps` usage.
- Gated Reactotron so it only starts when the app is running from a Metro URL, avoiding standalone debug bundle warnings.
- Ignored local real-device test captures under `/artifacts/`.

### Add debug OTP bypass and auth button handling (`571b845`)

- Added the debug OTP shortcut so debug APKs can accept `0000` without a backend SMS verification round trip.
- Changed standalone debug bundling so `__DEV__` stays enabled in the packaged debug APK, allowing the debug OTP path to run.
- Wired the email social-login button to the email login screen.
- Registered the email login screen in the auth navigator.
- Added a clear toast for Google login because the repository does not yet include a real Google sign-in flow.

### Add standalone debug APK build script (`4404d43`)

- Added `build.sh` to build and copy a standalone debug APK into `/home/othmane/Downloads/SHARED`.
- Bundled the React Native JavaScript into the Android assets before assembling the debug APK, so the APK can run without Metro.
- Added a test mode to the build script for running Jest from the same workflow.
- Added release/fastRelease placeholders with comments, while keeping release signing disabled until keystore details are confirmed.
- Added Jest setup and mocks so the project test command can run in this environment.
- Adjusted Android debug packaging so duplicate native libraries do not break the build.
