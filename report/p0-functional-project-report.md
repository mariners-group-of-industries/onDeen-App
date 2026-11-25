# OnDeen V2 P0 Delivery Report

Date: 13 June 2026

This report summarizes the delivered OnDeen V2 non-payment P0 scope for owner review and testing.

Payment work is intentionally excluded from this report. Stripe Connect, wallet/payment split work, and Google Pay through Stripe should be reviewed separately under the payment scope.

## Delivered P0 Use Cases

1. Gamification module `[A1]`
2. Session feedback screen `[A2]`
3. Guest booking flow `[A3]`
4. Online session check-in codes `[A4]`
5. Notification inbox clickable links `[A5 / B3.1]`
6. Editable event titles from mobile app `[A6 / B1.4]`
7. Event share deep links `[B3.2]`

## User App Additions

- Gamification display: XP, tier, level, streak, Session Complete, level-up screen, progress card.
- Session feedback flow after completed attendance.
- Guest booking UI for eligible shared event flows.
- Online check-in code entry with 6-digit input and inline status messages.
- Notification inbox tappable links.
- Event deep-link handling from shared URLs.

## Organiser App Additions

- Online session code generation and regeneration.
- Mobile event title editing.
- Feedback dashboard and CSV export.
- Guest booking on/off setting for eligible events.

## Backend Additions

- XP/tier/streak engine.
- Course-completion XP bonus and first-course milestone.
- Feedback storage, aggregation, and CSV export.
- Guest booking records and migration foundation.
- Online check-in code generation, validation, attendee notification, and time-window enforcement.
- Notification/deep-link routing support.
- Event title edit API, audit log, and attendee notification fan-out.

## Additional Non-P0 Work Mention

- Profile screen rebuild from the Stitch design project.

This is not part of the numbered P0 scope, but it is worth mentioning separately as additional user-facing work completed alongside the P0 delivery.

## How to Test

Run the advanced seed data, then use the User and Organiser apps to capture the flows listed in `report/usecases.html`.

Each use case has replaceable phone-sized placeholder screenshots under `report/images/usecase-N/`.
