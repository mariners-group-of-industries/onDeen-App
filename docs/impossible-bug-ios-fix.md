# The Impossible Bug: iOS Event Loading and Location Fix

Date: 2026-06-26

This document explains the iOS bug that made OnDeen look broken even though the Android app and backend were mostly correct. The final fix was a small set of frontend changes, plus one iOS simulator build configuration fix.

## Symptoms

- Home sometimes showed "No events found" on iOS.
- Guest users could not reliably see public events.
- Logged-in users could hit "Fetch failed" in notifications.
- Event details opened, but lower backend fields were missing:
  - Overview
  - Important Information
  - Facilities
  - Meet link
  - Full location/map info
- Tapping Select Location on iOS simulator crashed with:
  - `-[RCTView setOnLongPress:]: unrecognized selector`
- Earlier simulator runs also exposed iOS native prop mismatch crashes such as:
  - `-[RCTView setSheetLargestUndimmedDetent:]: unrecognized selector`

Android worked better because its location, map, and network paths did not hit the same iOS-specific native bridge behavior.

## Root Causes

### 1. Event list was location-filtered too aggressively

When the user was far from seeded events, the backend list endpoint could return no local events. This made Android and iOS look broken even though events existed in the database.

The backend was adjusted separately so the event feed can show events even when the user is not nearby.

### 2. iOS guest/public loading needed frontend-safe API paths

Some screens assumed authenticated APIs were always available. Guest iOS sessions needed public endpoints for home/category/event detail data.

The frontend now uses public endpoints where guest/public data is valid, while keeping authenticated calls for user-specific data.

### 3. Event detail screen trusted shallow list records too much

The home event list returns a shallow event record. It includes enough data for cards, but not enough for the full event detail screen.

The detail screen was sometimes using that shallow route item as if it were the complete backend detail. That is why the top card appeared, but Overview, Important Information, Facilities, and other lower sections were missing.

The fix makes the detail screen always fetch the real detail record from:

```text
/customer_app/event/event_id?id=<eventId>
```

It then merges data in this order:

1. Route/list event as fallback only.
2. Public full backend detail.
3. Authenticated detail for user-specific fields when logged in.

For array fields such as `images`, `facilities`, `curriculum`, and `itineraries`, the merge now prefers non-empty arrays instead of accidentally replacing good backend data with an empty shallow array.

### 4. `react-native-maps` was unsafe on this iOS old-architecture build

The iOS Podfile disables the React Native new architecture:

```ruby
ENV['RCT_NEW_ARCH_ENABLED'] = '0'
```

But the installed `react-native-maps` JavaScript path can still send Fabric-style native props. On iOS simulator, those props sometimes landed on a plain `RCTView`, causing native selector crashes like `setOnLongPress`.

Android did not hit the same native bridge mismatch.

The fix keeps Android on the native map, but avoids the broken iOS native map path:

- Event detail maps on iOS render a static Google Maps image.
- Tapping that image still opens Google Maps/Maps with the correct coordinates.
- Android still uses the existing native `MapView`.

### 5. iOS simulator location needed special handling

Real iPhone should use real GPS, but the simulator is not reliable for this app's location picker flow.

The fix detects simulator with `react-native-device-info`:

- iOS simulator defaults to London.
- iOS simulator shows a clear notice instead of mounting the crashing picker map.
- Real iPhone still uses the normal location/GPS path.
- Android behavior is unchanged.

### 6. iOS Safe Area was inconsistent

Some iOS screens used raw `View` where they needed `SafeAreaView`. This caused content to sit under the notch/status area.

`UpdateLocation.jsx` now uses `SafeAreaView`, and the search input has a stable iOS height.

## Main Files Changed

- `OnDeenUser/src/screens/BottomHomePage/BottomHomePage.jsx`
  - Adds iOS simulator London default.
  - Keeps real iPhone GPS behavior.
  - Improves public event/category loading.

- `OnDeenUser/src/screens/BottomHomePage/UpdateLocation.jsx`
  - Detects iOS simulator.
  - Shows a simulator-only London notice.
  - Uses `SafeAreaView`.
  - Removes the unsafe wrapper that contributed to iOS native prop crashes.

- `OnDeenUser/src/screens/FirstEventDetailsPage/FirstEventDetailsPage.jsx`
  - Always fetches full backend event detail.
  - Adds a direct public backend detail fetch fallback.
  - Merges shallow and full detail records safely.

- `OnDeenUser/src/components/CommonMapMarker.tsx`
  - Keeps Android native map behavior.
  - Uses static Google map images on iOS to avoid the native bridge crash.

- `OnDeenUser/src/screens/Notification/Notification.jsx`
  - Improves logged-in/guest notification behavior and safe-area layout.

- `OnDeenUser/src/redux/callapis/CommonService.js`
  - Adds public API helpers for public home/category/detail flows.

- `OnDeenUser/ios/Podfile`
- `OnDeenUser/ios/OnDeen.xcodeproj/project.pbxproj`
  - Allows arm64 simulator builds on Apple Silicon by excluding only `i386` for simulator.

- `run-ios.sh`
  - Ensures the simulator bundle uses the Railway backend URL.

## Verification

The fix was verified on:

```text
iPhone 17 Pro Max simulator
Bundle id: com.ondeen.user
Backend: https://api-production-517c1.up.railway.app
```

Verified behavior:

- Home loads real Railway events.
- Simulator location defaults to London.
- Select Location no longer crashes on simulator.
- Event details render full backend detail sections:
  - Overview
  - Online Meet Link
  - Important Information
  - Facilities
- Fresh simulator capture logs showed no current `setOnLongPress` native crash.

Key screenshot artifact from the successful run:

```text
OnDeenUser/artifacts/ios-ui-tests/20260626-214951/ios-step-04-safearea-detail-fetch.png
```

## Why This Was Hard

The app had several overlapping symptoms:

- A real backend distance/filter issue.
- Guest vs authenticated frontend API differences.
- Shallow list records being reused as full detail records.
- iOS-only native map bridge crashes.
- Simulator-specific location behavior.
- Safe-area differences between Android and iOS.

Any one of those could make the app look broken. The final fix came from separating the symptoms and proving each layer independently:

1. Confirm events existed in Railway.
2. Confirm the public detail endpoint returned the missing fields.
3. Confirm Android was not proof that iOS native modules were safe.
4. Identify `react-native-maps` as the source of the iOS selector crash.
5. Avoid the broken iOS native map path without changing Android.
6. Force the detail screen to render the full backend record, not the shallow home card record.

## Rule For Future Changes

Do not replace these fixes with fake seed fallbacks. The correct behavior is real backend data.

For future work:

- Keep Android native map behavior unless Android breaks.
- Treat iOS simulator location separately from real iPhone location.
- Keep event detail screens fetching `/customer_app/event/event_id`.
- Do not trust home list event objects as complete detail objects.
- If `react-native-maps` is upgraded or the app moves fully to the new architecture, retest native iOS maps before removing the static map workaround.
