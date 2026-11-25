# OnDeen P0 Testing Guide

This guide covers the P0 flows already implemented, except payment items.

## Before Testing

1. If backend code changed, restart the backend:

```bash
cd /home/othmane/Projects/onDeenApp/ondeen
./ruh.sh
```

2. If you want a clean seeded database, run:

```bash
cd /home/othmane/Projects/onDeenApp
./seed_ondeen.sh
```

Then restart the backend.

3. If organiser frontend changed, rebuild only organiser:

```bash
cd /home/othmane/Projects/onDeenApp
./build.sh organiserRealDebug
```

4. If user frontend changed, rebuild only user:

```bash
cd /home/othmane/Projects/onDeenApp
./build.sh userRealDebug
```

5. Seeded accounts:

```text
Organiser: org@gmail.com / 123456
User: user@gmail.com / 123456
Guest seed identity: guest@gmail.com / +44 677889900
Default online check-in code: 123456
```

Phone and laptop must be on the same Wi-Fi network.

## Test 1: Mark Booked Session Complete

Goal: verify a booked user can complete a session and see the post-session screens.

1. Login to the user app with `user@gmail.com / 123456`.
2. Open `Booking`.
3. Open an upcoming booked event.
4. Tap `Mark as completed`.
5. Expected:
   - The booking moves to completed bookings.
   - Session complete screen appears.
   - Feedback prompt appears after the completion screen.
   - Backend logs should include check-in or completion messages.

Temporary test rule: future events can be marked complete. Later this should be restricted to past or attended sessions only.

## Test 2: Online Check-In Code From User App

Goal: verify the user can enter an online session code from the user app test/debug entry point.

1. Login to the user app.
2. Open `Profile`.
3. Open `Profile settings`.
4. Open `Debug stuff`.
5. Tap the online check-in/session code test screen.
6. Enter `123456`.
7. Tap `Check in`.
8. Expected:
   - The app accepts the code for the next booked online event.
   - Session completion screen appears.
   - Feedback screen appears.

If organiser regenerated the code, use the new code shown in organiser app instead of `123456`.

## Test 3: Online Code From Real Booking Detail

Goal: verify the check-in code flow from an actual booked online event.

1. Login to the user app.
2. Open `Booking`.
3. Open a booked online event.
4. Tap the check-in/code action.
5. Enter the current organiser code.
6. Expected:
   - Wrong code is rejected.
   - Correct code completes the booked session.
   - Completion and feedback screens appear.

## Test 4: Organiser Code Screen

Goal: verify organiser can view and regenerate an online session code.

1. Login to organiser app with `org@gmail.com / 123456`.
2. Open an online event, for example `Seed: Beginner Quran Circle`.
3. Open event details.
4. Find `ONLINE SESSION CODE`.
5. Expected:
   - Existing code shows, seeded as `123456`.
6. Tap `Regenerate`.
7. Expected:
   - A new code appears.
   - User app must now use the new code.
   - Old code should fail for check-in.

## Test 5: Notification Inbox Clickable Links `[A5 / B3.1]`

Goal: verify notification links are tappable and route correctly.

1. Login to user app.
2. Open the notification inbox from the bell icon.
3. Tap seeded notification links.
4. Expected:
   - OnDeen event links open the related event detail.
   - External links open outside the app.
   - Invalid or missing links do not crash the app.

Seed creates sample inbox items with OnDeen and external links.

## Test 6: Editable Event Titles From Mobile `[A6 / B1.4]`

Goal: verify organiser can edit an event title from mobile and attendees are notified.

1. Login to organiser app.
2. Open any event detail.
3. In `EVENT TITLE`, tap `Edit`.
4. Change the title.
5. Tap `Save`.
6. Expected in organiser app:
   - New title appears immediately.
   - Pull-to-refresh keeps the new title.
7. Expected in backend logs:

```text
[event-title-edit] event_id=... organizer_id=... notifications=...
```

8. Login to user app as a user who booked that event.
9. Open notification inbox.
10. Expected:
    - A notification titled `Event title updated` appears.
    - Tapping it opens the event.

Backend also writes an audit row to `event_title_audit_log`.

## Test 7: Event Share Deep Links `[B3.2]`

Goal: verify shared event links can open the app or fallback page.

1. Login to user app.
2. Open any event detail.
3. Tap share.
4. Expected:
   - Shared message contains an event link.
   - In local testing the useful link should use the backend LAN URL, for example:

```text
http://192.168.x.x:8088/open?id=1
```

5. Open the link in Chrome.
6. Expected:
   - Fallback page opens.
   - `Open in app` opens the user app event detail.
7. Optional direct deep link test:

```text
ondeen://open?id=1
```

Production `https://ondeen.app/open?id=1` only works once the production domain is configured to point to the backend/app links.

## Test 8: Feedback Dashboard

Goal: verify organiser sees attendee feedback for an event.

1. Login to user app.
2. Mark a booked event complete.
3. Submit feedback.
4. Login to organiser app.
5. Open the same event detail.
6. Expected:
   - `SESSION FEEDBACK` card shows response count.
   - Average engagement and delivery ratings update.
   - Latest written comments appear.

If the organiser screen is already open, pull-to-refresh.

## Test 9: CSV Export For Feedback

Goal: verify organiser can export feedback from mobile.

1. Login to organiser app.
2. Open an event with feedback.
3. In `SESSION FEEDBACK`, tap `Export CSV`.
4. Expected:
   - Native Android share sheet opens.
   - Shared content contains CSV columns:

```text
session_date,event_title,engagement_rating,delivery_rating,suggestion,skipped
```

Backend endpoint used:

```text
POST /organizer_app/event/feedback_csv
```

## Test 10: Guest Booking On/Off Setting

Goal: verify organiser can disable or enable guest booking per event.

1. Login to organiser app.
2. Open a one-off event, for example `Seed: Friday Community Iftar`.
3. In event details, toggle `Guest booking` off.
4. Expected backend log:

```text
[guest-booking-setting] event_id=... organizer_id=... enabled=False
```

5. Logout from user app.
6. Open the event share link or guest booking page.
7. Try to book as guest.
8. Expected:
   - Guest booking is rejected with `Guest booking is disabled for this event.`
   - Backend log includes:

```text
[guest-booking] rejected event_id=... reason=disabled_by_organizer
```

9. Go back to organiser app and toggle `Guest booking` on.
10. Try guest booking again.
11. Expected:
    - Guest booking succeeds.
    - Backend log includes:

```text
[guest-booking] created event_id=... guest_booking_id=... participant_id=...
```

Guest booking is still only for one-off events. Courses and recurring events should continue to reject guest booking.

## Test 11: Title Audit And Notification Fan-Out

Goal: verify backend stores title history and creates notifications for booked users.

1. Use Test 6 to edit an event title.
2. Optional backend verification from the Flask environment:

```bash
cd /home/othmane/Projects/onDeenApp/ondeen
source .venv/bin/activate
python - <<'PY'
from wsgi import app
from app.models.event import EventTitleAuditLog
from app.models.users import Notification_History

with app.app_context():
    audit = EventTitleAuditLog.query.order_by(EventTitleAuditLog.id.desc()).first()
    notification = Notification_History.query.filter_by(type=7).order_by(Notification_History.id.desc()).first()
    print("audit:", audit.event_id if audit else None, audit.old_title if audit else None, "=>", audit.new_title if audit else None)
    print("notification:", notification.event_id if notification else None, notification.title if notification else None)
PY
```

Expected:

```text
audit: <event_id> <old title> => <new title>
notification: <event_id> Event title updated
```
