# Android UI Parity Note For Commit `d17e345`

Date: 2026-07-10

This note documents the UI-only changes from commit `d17e345` (`Update UI screens`) and the Android-side checks to run later when validating that Android still looks the same.

## Why This Matters

The changes in this commit were made in shared React Native screen files, not in iOS-only code. That means Android can still be affected even if the original goal was to improve iOS layout.

The main Android risk is not build failure. The risk is visual drift:

- different top or bottom spacing
- headers sitting too close to the status bar
- content shifting under the notch or safe area
- scroll views starting higher or lower than before
- loader or empty-state alignment changing

## What Changed In This Commit

The commit touched many shared screens, including:

- `BottomHomePage`
- `Wishlist`
- `ProfileScreen`
- `OrganizerProfile`
- password and OTP flows
- search and results screens
- badges and QR-related screens

The most important pattern is that several screens changed their safe-area handling and container logic. Some old `Platform.OS` branches were removed or simplified, and some screens now rely more directly on `SafeAreaView`.

## Android Risk Areas

These are the spots most likely to shift Android layout:

- screens that changed from `View` plus platform padding to `SafeAreaView`
- screens that removed `useTopInset`
- screens that changed `paddingTop` or `paddingBottom`
- screens with custom headers, especially if they already had tight vertical spacing
- screens with `marginTop: -10`, absolute positioning, or status-bar adjustments

## Android Checks To Run Later

When you test on Android later, check these screens first:

1. `BottomHomePage`
   - Confirm the header, search bar, and location label still line up.
   - Check that the content does not start too low or too high.
   - Verify the top spacing is the same on small and large devices.

2. `Wishlist`
   - Confirm the header is not pushed down twice by safe area handling.
   - Check the loader, empty state, and list view all align the same way.
   - Verify the scroll content does not clip at the top or bottom.

3. `ProfileScreen`
   - Confirm the top app bar sits where it used to.
   - Check the scroll content bottom padding and any sticky header spacing.
   - Verify the cards do not overlap the top bar.

4. `OrganizerProfile`
   - Check the header and profile image spacing.
   - Confirm the scroll area starts cleanly below the header.
   - Verify the event list and reviews sections still look balanced.

5. Password and OTP flows
   - `ForgotPassword`
   - `CreatePasswordScreen`
   - `ChangePassword`
   - `VerifyEmailOTP`
   - `VerifyMobileOTP`
   - Check that the form body is not shifted under the header.
   - Confirm the skip/continue button and inputs still sit in the same place.

6. Search and list screens
   - `GlobalSearch`
   - `GlobalSearchResults`
   - `AllCalendar`
   - `AllParticipantLists`
   - `RequestSessions`
   - Confirm the list content still starts at the expected position.
   - Check for extra top gap or clipped first rows.

7. Profile/settings screens
   - `ProfileSetting`
   - `PrivacySetting`
   - `EditProfile`
   - `HelpSupportPage`
   - `ReportBug`
   - Confirm the app bar and section padding still match the previous Android look.

8. Other shared screens
   - `SpeakerProfile`
   - `PaymentConfirmation`
   - `AllQRCodeDownload`
   - `badgesScreen`
   - Check for any change in top spacing, bottom safe area, or content alignment.

## What To Compare Against

When reviewing Android later, compare the current UI with:

- the same screen before `d17e345`
- the current iOS screen only for design intent

The Android question is not "does it build". The question is "did the shared layout change the Android appearance".

## Quick Android Smoke Test

If you only have time for a fast pass, verify:

- home screen top spacing
- wishlist header and loader
- profile screen top bar
- one password screen
- one search/results screen
- one QR or badges screen

If those are stable, the risk of a broad Android layout regression is lower.

## Rule For Future UI Fixes

If a fix is meant only for iOS, keep the Android layout path explicit unless Android has been tested with the same change.

Do not remove Android-specific inset logic just to make the code look simpler.

