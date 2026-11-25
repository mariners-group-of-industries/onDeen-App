# OnDeen V2 P0 Scope

Source: `ondeen-v2-functional-spec-draft4.md`

This file lists only the items explicitly marked `P0` in the V2 functional spec. Some items appear twice in the spec, once as a full feature section and once as a user story. Those duplicates are merged here.

## Exact P0 Items

1. Gamification module `[A1]`
2. Session feedback screen `[A2]`
3. Guest booking flow `[A3]`
4. Online session check-in codes `[A4]`
5. Profile screen rebuild from Stitch design project `[Profile]`
6. Notification inbox clickable links `[A5 / B3.1]`
7. Editable event titles from mobile app `[A6 / B1.4]`
8. Event share deep links `[B3.2]`
9. Stripe Connect integration and wallet `[C1]`
10. Google Pay fix `[C2]`

Profile details: the User Profile screen was rebuilt as a progress hub with current rank, level/progress display, OnDeen Radar, certificates/profile sections, and explanatory info modals.

## User App Frontend

Add only:

- [x] Profile screen rebuild from Stitch design project:
  - [x] current rank card
  - [x] level/progress display
  - [x] OnDeen Radar
  - [x] certificates/profile sections
  - [x] rank and radar info modals
- [x] Gamification display:
  - [x] XP
  - [x] tier
  - [x] level
  - [x] streak
  - [x] post-check-in summary
- [x] Feedback screen after session.
- [x] Guest booking UI.
- [x] Online check-in code entry.
- [x] Tappable links in notification inbox.
- [x] Event deep-link handling.
- [ ] Google Pay working in checkout.

## Organiser App Frontend

Add only:

- [x] Generate/check online session code.
- [x] Editable event title from mobile app.
- [x] Feedback dashboard.
- [x] CSV export for feedback.
- [x] Guest booking on/off setting for events.
- [ ] Stripe Connect wallet onboarding/status.
- [ ] Block paid event publish UI if Stripe is not connected.

## Backend

Add only:

- [x] XP/tier/streak engine.
- [x] Feedback storage, aggregation, and CSV export.
- [x] Guest booking records and migration.
- [x] Online check-in code generation and validation.
- [x] Notification/deep-link routing support.
- [x] Event title edit API.
- [x] Event title audit log.
- [x] Event title notification fan-out.
- [ ] Stripe Connect onboarding.
- [ ] Stripe Connect payment split.
- [ ] Existing wallet balance migration.
- [ ] Google Pay payment fix through Stripe.

## Not P0

These are in the V2.0 release scope, but they are not marked `P0` in the spec:

- Onboarding splash.
- Layout fixes.
- Event materials upload.
- Recurring events.
- Event duplication.
- Attendance percentage view.
- Course pause and auto-extend.
- Analytics instrumentation.
- Certificates.
- Nickname.
- WhatsApp OTP with SMS fallback.

## TODO

- [x] Restore stricter password validation. Sign-up, admin create and change-password now require 8-128 characters with at least one letter and one number (`Backend/app/utils/validators.py`, `password_strength_errors`). Login is unchanged so existing accounts keep working.
- [x] Gate the debug-only session completion shortcut. It now requires `ONDEEN_LOCAL=1` or an explicit `ONDEEN_ENABLE_DEBUG_ATTENDANCE=true` (no longer implied by test OTP), Railway defaults it off, and the User app only shows "Mark as Completed" in `__DEV__` builds.
