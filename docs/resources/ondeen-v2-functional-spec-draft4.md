# OnDeen V2 Functional Specification - Draft 4

> Source PDF: `/home/othmane/APP-DIVERS-PROJECTS/ondeen-fast-migration-site/OnDeen_V2_Functional_Spec_draft4.pdf`
> Extraction complete du texte PDF, generee pour servir de source lisible aux prompts de migration.
> Les sauts de page du PDF sont conserves avec des separateurs Markdown.

## Usage dans les prompts

Lire ce fichier Markdown comme source principale de la spec V2 avant de coder. Utiliser le PDF original seulement si une mise en page, un tableau ou une ambiguite doit etre verifiee.

---

                                             OnDeen V2 Functional Specification — Draft 4




                     OnDeen
         V2 Functional Specification
Draft 4 — new features, V1 enhancements, and technical integrations




                   Audience: development team
           Supersedes V1 Section 13 (Awards & Levels)
 Phased release: V2.0 (core) + V2.1 (follow-up) + V2.2+ (roadmap)


                            April 2026




                              Page 1


---

                                                              OnDeen V2 Functional Specification — Draft 4




How to read this document
This document specifies every change going into OnDeen V2. It is organised in three parts.

Part A — New feature specifications
Full functional specifications for new systems. Each feature follows the V1 format: Overview,
User Flow, Functional Requirements, UI/UX Considerations, Security Considerations,
Testing Requirements.

Part B — V1 feature enhancements
Changes to features that already exist in V1. Written as user stories with acceptance criteria.
Each story references the relevant V1 section.

Part C — Technical & cross-cutting concerns
Backend integrations. Stripe Connect, Google Pay, WhatsApp OTP, analytics pipeline.

Priority and release labels

   Label             Meaning                                    Applies to

                                        Core gamification mechanics, guest booking, Stripe
                Must ship — launch
     P0                                 Connect, Google Pay fix, feedback screen, online
                      blocker
                                        check-in

                                        Onboarding splash, layout fixes, profile stats, certificates,
                                        nickname, course pause, attendance %, event
     P1              Important          duplication, recurring events, materials upload, analytics,
                                        draft location, OnDeen Radar (V2.1), hadith notifications
                                        (V2.1)

                                        Temporary guest speaker, seasonal/rolling challenges,
     P2            Nice-to-have
                                        class leaderboard


Every item also carries a target release. V2.0 is the gamification core plus payments
unblocking. V2.1 is everything that ships in the first follow-up release, including OnDeen
Radar and the hadith notifications layer. V2.2+ is a roadmap (challenges, class leaderboard,
expanded tier system). V2.3+ is longer-term (OnDeen Wrapped year-in-review).
When budget or scope conversations happen with stakeholders, use the priority + release
labels as the cut line: anything marked P2 is safest to cut, anything P0 should not be cut
without rethinking the launch.




                                            Page 2


---

                                                            OnDeen V2 Functional Specification — Draft 4




Changes since draft 3
Key decisions made during product review that materially change the spec:
  •​ OnDeen Radar added as new A9 feature (P1, V2.1). Four-axis balance visualisation —
     Knowledge, Fitness, Ummah (renamed from Community/Volunteering/Charity),
     Tazkiyyah. Rolling 30-day window, 0–100 scores, three colour bands
     (grey/amber/green). Target hours scale with tier to reflect deepening practice over time.
  •​ Notifications system within OnDeen Radar uses a curated library of authentic hadith
     and Qurʾānic verses (English translation only for V2.1) tagged to axis state.
     Personal-voice, forward-looking tone. First name used in notifications. Library curation
     by scholar.
  •​ Notification settings: default on at onboarding, global opt-out in settings, 4-week
     re-prompt banner pattern if disabled, with 6-month (6-cycle) cap after which re-prompts
     stop entirely.
  •​ Nickname feature promoted to V2.0. Optional field — if blank, falls back to first name.
     Visibility indicator next to the field during profile setup.
  •​ Class leaderboard deferred from V2.1 to V2.2+.
  •​ Reviews feature to be deprecated — feedback screen (A2) replaces it.
  •​ Year-in-review ("OnDeen Wrapped") flagged as roadmap feature for V2.3+
     (December/January annual release).
  •​ Existing users at V2.0 upgrade see a one-time in-app message about the new
     nickname feature, prompting them to set one if they wish.
  •​ Source-verification policy for notifications: single policy page accessible from settings
     and notification detail. No per-notification source attribution cluttering the push.



V2.0 scope — the core release
  •​ Full gamification system (tiers, XP, attendance-based streak multiplier, post-session
     summary screen) — excluding OnDeen Radar and life-axis tracking
  •​ Session feedback screen (replaces V1 reviews)
  •​ Guest booking flow
  •​ Online session check-in codes (via in-app announcements)
  •​ Stripe Connect integration
  •​ Google Pay fix
  •​ WhatsApp OTP with SMS fallback
  •​ Notification inbox clickable link handling
  •​ Editable event titles from mobile app
  •​ Onboarding splash screens
  •​ Layout fixes (main event page event description section)


                                             Page 3


---

                                                            OnDeen V2 Functional Specification — Draft 4



  •​ Event materials upload
  •​ Recurring events
  •​ Event duplication
  •​ Attendance percentage view
  •​ Course pause + auto-extend
  •​ Save-as-draft UX location improvement
  •​ Profile stats section
  •​ Analytics instrumentation
  •​ Certificates
  •​ Nickname feature (new in draft 4 — promoted from V2.1)



V2.1 scope — follow-up release
  •​ OnDeen Radar (new in draft 4)
  •​ Hadith/Qurʾānic verse notifications layer (new in draft 4)
  •​ Temporary guest speaker for events



V2.2+ roadmap
  •​ Seasonal and rolling challenges
  •​ Class leaderboard (deferred from V2.1)
  •​ Additional tiers — Pioneer (levels 31–40) and fifth tier (41–50)
  •​ Tier-scaled Radar targets refined based on V2.1 usage data



V2.3+ roadmap
  •​ OnDeen Wrapped (year-in-review)




                                            Page 4


---

                         OnDeen V2 Functional Specification — Draft 4




PART A — NEW FEATURE SPECIFICATIONS




                Page 5


---

                                                           OnDeen V2 Functional Specification — Draft 4




A1. Gamification Module
 P0   Release: V2.0
This section specifies OnDeen's V2 gamification system. It supersedes V1 Section 13
(Awards and Levels) entirely — any tier, level, or badge logic defined in V1 should be
considered deprecated.
The gamification module is the primary engagement mechanic for V2. Its purpose is to turn
OnDeen from an events-and-classes booking app into a progression platform where every
session attended contributes to a long-term journey that users can see, measure, and share.

A1.1 Overview
The gamification system consists of three interconnected subsystems:
  •​ The tier system: 30 levels across 3 named tiers (Seeker → Voyager → Pathfinder),
     driven by total XP. This is the user's overall rank.
  •​ The XP engine: per-session XP scaled by session duration (50 XP per hour), course
     completion bonuses (150 XP per scheduled session, capped at 3,000), and first-time
     milestone rewards (250 XP). XP is further scaled by session difficulty (1.0×/1.3×/1.6×).
  •​ The streak multiplier: attendance-based, not calendar-based. Counts consecutive
     check-ins to a recurring course or event. 8 consecutive check-ins = full 2× flame.
     Multiplier scales all XP earned.


Life-axis radar (four-dimension growth visualisation) was considered for V2.0 but is deferred
to V2.2+. Rationale: requires mature content diversity across all four axes (Knowledge,
Fitness, Charity, Tazkiyyah) before it provides value to users; premature launch would show
skewed radars that reveal content gaps. Revisit post-V2.0 when analytics show balanced
event attendance.



A1.2 User Flow — earning XP
  1.​ User books an event or course through the existing booking flow (V1 Section 5). Event
      has a journey level (New Muslim / Beginner / Intermediate / Advanced / Suitable for all)
      set by the organiser at creation time.
  2.​ User attends the event. Check-in happens through one of three paths: in-person
      GPS-verified check-in on the booking page (V1 existing); in-person QR scan by the
      organiser (V1 existing); online session code entered by the user (new — see A4).
  3.​ Check-in event is recorded in the database with: timestamp, session ID, event ID,
      subcategory, session duration (hours), and difficulty level.
  4.​ XP engine calculates: base XP = 50 × session_hours, then applies difficulty multiplier
      (1.0×/1.3×/1.6×), then applies current streak multiplier. Final XP awarded.




                                            Page 6


---

                                                            OnDeen V2 Functional Specification — Draft 4



  5.​ Streak state machine updates: if this check-in is consecutive with the previous
      scheduled session, streak count increments; if the user missed a scheduled session,
      flame dims (see A1.5.2).
  6.​ Course completion is evaluated at course end. If user's attendance ≥ 80%, full
      completion bonus awarded. 60–79% awards 50% bonus. <60% awards no bonus.
      Completion bonus also scales by difficulty and streak multipliers.
  7.​ If the XP earned triggers a level-up or tier change, this is flagged for the next summary
      screen render.
  8.​ Next time user opens the app, summary screen plays (A1.6). User sees ring animation,
      streak flame state, and — if applicable — tier-change celebration.



A1.3 Functional Requirements — Tier System
A1.3.1 Tier structure

                                                                            Casual-user time to
 Lev
              Tier          Sub-levels          English meaning              reach (one 2-hour
 els
                                                                                class/week)

                                                                            Starts on first class;
 1–1
             Seeker            1–10         One who seeks knowledge         Seeker 10 at ~3
  0
                                                                            years

 11–2                                                                       ~7+ years for a purely
            Voyager            1–10             One on a journey
   0                                                                        casual user

 21–                                       One who has found the path       Lifetime-level
           Pathfinder          1–10
  30                                          and can guide others          commitment


Future tier expansion (V2.2+): Pioneer (levels 31–40) and an additional expanded tier
(41–50). Messaged to users as "new tiers unlocked" at roadmap stage, not mentioned in
V2.0 UI.



A1.3.2 Starting state
Users who have signed up but not yet attended any event show no tier on their profile. The
progression system engages meaningfully on the first class attended — at which point they
become Seeker 1 with a dedicated "Welcome to the journey" moment in the summary
screen.



A1.3.3 Level-up formula
XP required to advance from level N to N+1 is calculated as: 100 × N^1.5 (rounded to
nearest integer). Cumulative XP for each level is precomputed and stored in a lookup table
— see Appendix C for the full 30-level table. Dev team should not calculate on the fly at
request time.


                                            Page 7


---

                                                                    OnDeen V2 Functional Specification — Draft 4




A1.3.4 Tier name display
  •​ Tier name is displayed prominently on the user profile, in the app header where
     relevant, and on the summary screen.
  •​ Each tier name has a tappable ⓘ icon that opens a small modal showing: Arabic
     equivalent (Seeker = Ṭālib / ‫ ;طالب‬Voyager = Rāhil / ‫ ;راحل‬Pathfinder = Dalīl / ‫— دليل‬
     pending scholar review), transliteration, English meaning, a short note on Islamic
     significance. Copy for each tier is provided in Appendix A.
  •​ Sub-levels displayed as numbers (Seeker 1, Seeker 2, …). Not Roman numerals.



A1.4 Functional Requirements — XP Engine
A1.4.1 Base XP earning

                  Action                             Base XP                          Notes

                                                                       A 1-hour event = 50 XP; a 2-hour
   Attend one class or event (verified            50 × session
                                                                       class = 100 XP; a 3-hour
               check-in)                             hours
                                                                       intensive = 150 XP

                                                                       System-calculated based on
                                                 150 × sessions
 Complete a course — attendance 80%+                                   course length; organisers do not
                                                  (cap 3,000)
                                                                       configure

    Complete a course — attendance                 50% of full
                                                                       Partial reward for honest effort
                60–79%                               bonus

                                                                       No completion bonus;
 Complete a course — attendance <60%                      0
                                                                       per-session XP still earned

      First class attended (lifetime)                  250             One-time milestone

    First course completed (lifetime)                  250             One-time milestone

      First review written (lifetime)                  250             One-time milestone



A1.4.2 Difficulty multiplier
Every event/course has a journey level set by the organiser at creation time (V1 Section 2,
item 14). This level now also determines the difficulty XP multiplier applied to all XP earned
during that session:

         Journey level                  Multiplier                        Design rationale

                                                              Welcoming baseline for new Muslims —
         New Muslim                       1.0×
                                                              no special incentive needed to attract

           Beginner                       1.0×                Baseline for established beginner content

         Intermediate                     1.3×                30% bonus for more challenging material




                                                 Page 8


---

                                                               OnDeen V2 Functional Specification — Draft 4




         Journey level                Multiplier                     Design rationale

                                                         60% bonus — rewards genuine depth of
          Advanced                      1.6×
                                                         engagement

        Suitable for all                1.0×             Neutral default for mixed-level events



A1.4.3 Difficulty warnings (soft gating, V2.0)
Users can book events at any difficulty level regardless of their tier. To prevent mismatched
bookings, Intermediate and Advanced events show a warning on the booking page before
confirmation:
Warning copy (Intermediate): "This course is marked Intermediate. It assumes prior
knowledge of the topic's basics. Consider starting with a Beginner course if you're new to
[subcategory]."
Warning copy (Advanced): "This course is marked Advanced. It assumes strong prior
knowledge. Consider building up through Intermediate courses first if you're less familiar with
[subcategory]."
Two buttons: "Book anyway" (primary) and "See Beginner courses" (secondary, filters
Explore tab by that subcategory and Beginner level).
Future consideration (V2.1+): progression-linked gating, where users must reach certain
tiers before booking Intermediate or Advanced courses. Not in V2.0 scope — revisit with
analytics data post-launch.



A1.4.4 Course completion bonus logic
  •​ Course completion is evaluated at the course's designated end date.
  •​ Completion XP = 150 × number of scheduled sessions, capped at 3,000. Organisers
     do not set this value.
  •​ Attendance % = (sessions user checked in to) / (total scheduled sessions). Sessions
     cancelled by the organiser and replaced count toward the denominator only once.
  •​ Pause logic: if organiser pauses a course, pause period does not count against
     attendance. Course end date extends by pause duration; completion re-evaluated at
     new end date. See B2.2.


A1.4.5 Multiplier stacking order
When a user earns XP, the calculation order is strict:
 final_xp = base_xp × difficulty_multiplier × streak_multiplier
Worked example: dedicated student on full flame (2.0× streak) attends a 2-hour Advanced
tafsīr class (1.6× difficulty). Base XP = 50 × 2 = 100. Difficulty applied: 100 × 1.6 = 160.




                                               Page 9


---

                                                                       OnDeen V2 Functional Specification — Draft 4



Streak applied: 160 × 2.0 = 320 XP total for that session. Multipliers stack multiplicatively,
not additively.



A1.5 Functional Requirements — Streak Multiplier
A1.5.1 Streak thresholds

   Consecutive check-ins            Streak tier         Multiplier                What this feels like

     0 (no active streak)               —                   1.0×           Baseline

        1–2 check-ins                   —                   1.0×           Streak initiated, no multiplier yet

        3–4 check-ins                 Usbūʿ                 1.25×          First multiplier kicks in

        5–6 check-ins                 Shahr                 1.5×           Habit forming

         7 check-ins               Mudāwamah                1.75×          Committed

        8+ check-ins                   Ḥawl                 2.0×           Full flame



A1.5.2 Dimming flame mechanic

    Flame state                   Trigger                           Multiplier               Streak count

    Strong flame              Active; on track               Full tier multiplier          Counting up

                            Missed 1 scheduled
   Dimmed flame                                                      Halved                Preserved
                                 session

       Ember                Missed 2 consecutive             1.0× (no multiplier)          Preserved

    Extinguished            Missed 3 consecutive                      1.0×                 Resets to 0



A1.5.3 Streak scoping and implementation notes
  •​ Streaks are scoped per-course-or-recurring-event. A user attending two different
     weekly courses has two separate streaks. Profile and summary screen show the user's
     best active streak.
  •​ For one-off events (non-recurring), check-ins do not build a streak — they still earn
     per-session XP.
  •​ A "scheduled session" is a session the user was booked onto. Missing a Thursday
     session the user was booked onto dims the flame. Missing a session the user was
     never booked onto has no effect.
  •​ Check-in must occur within the session window (15 minutes before scheduled start to
     30 minutes after scheduled end) to count for streak purposes.
  •​ Check-in window is a system-level default. Organisers do not configure it.




                                                  Page 10


---

                                                            OnDeen V2 Functional Specification — Draft 4



A1.5.4 User-facing communication of check-in window
Because the check-in window is a new concept for users, it must be clearly communicated at
three moments:
  •​ At booking: small informational text below the confirm booking button: "Check-in opens
     15 minutes before the session and stays open until 30 minutes after. You can check in
     via the booking page."
  •​ Push notification 1 day before the event (V1 existing behaviour, extended): "Your
     session [event name] is tomorrow. Remember to check in within the check-in window
     to earn XP and keep your streak alive."
  •​ Push notification 30 minutes before event start (V1 existing behaviour, extended):
     "[event name] starts in 30 minutes. Open the app and swipe to check in — the window
     is now open."


A1.5.5 Organiser-side communication
Organisers enabling the existing "allow swipe-to-check-in" toggle on their event creation
form see a new ⓘ icon next to it. Tapping shows:
"When enabled, attendees can check in to this session through the app. Check-in earns
them XP and counts toward their engagement streak — a key driver of OnDeen user
retention. Attendees build streaks for recurring courses and unlock XP multipliers up to 2×
for consecutive attendance. Enabling this helps your course compete for consistent
attendance."



A1.6 Functional Requirements — Summary Screen (Post-Session)
After every session a user checks into, they are shown a summary screen on their next app
open. This is the moment that makes progression tangible. It is a two-part flow: Part 1 is the
XP/progression summary; Part 2 is the session feedback form (specified separately in A2).



A1.6.1 Triggering
  •​ Summary Part 1 is shown the next time the user opens the app following any check-in.
     If multiple check-ins have happened since last app open, summaries queue and play
     sequentially.
  •​ Part 1 cannot be dismissed without animations completing. Part 2 (feedback) has a
     visible Skip button.
  •​ If a user uninstalls and reinstalls, pending summaries are lost (not re-served).


A1.6.2 Part 1 contents — priority order
Four core elements, in display priority:



                                            Page 11


---

                                                              OnDeen V2 Functional Specification — Draft 4



  1.​ XP ring with real-time animated count-up. Ring animates from previous position toward
      new position, with audio tick and subtle haptic. If level-up occurs, ring fills, resets, and
      begins filling toward next level. If tier change (Seeker 10 → Voyager 1, or Voyager 10
      → Pathfinder 1), a full-screen tier-change overlay plays (new tier name + Arabic in the
      ⓘ, brief celebration animation, heavier haptic).
  2.​ "Classes until next level" counter. Prominent text below or adjacent to the ring (e.g. "3
      more classes to Seeker 6"). Accounts for current difficulty and streak multipliers —
      assumes current state holds.
  3.​ Streak flame visual. Current flame state rendered (strong / dimmed / ember). If user is
      at 7 check-ins (one away from full flame), flame pulses with subtle animation to signal
      proximity.
  4.​ Session XP breakdown. Small text showing the calculation: "Base 100 + Advanced
      bonus (+60) + Streak bonus (+160) = 320 XP earned." Transparency about the
      multipliers.


First-ever class experience: when a user earns their first XP (becoming Seeker 1), the
summary screen includes an additional welcome moment. Background gradient blooms, text
reads: "You're now a Seeker. The journey begins." One-time only.



A1.6.3 Level-up and tier-change animations
  •​ Level-up within the same tier: XP ring fill completion + reset, single haptic pulse, brief
     sound cue.
  •​ Tier change (Seeker 10 → Voyager 1, Voyager 10 → Pathfinder 1): full-screen overlay
     with new tier name, Arabic equivalent, English meaning on tap, stronger haptic, distinct
     sound cue. Must be dismissed by user tapping "Continue."
  •​ Max-level reached (Pathfinder 10): graceful-plateau celebration, no prestige reset.
     Users cap here. Total XP and axis hours continue to display and grow; profile shows
     "Pathfinder 10 (Max)" permanently.



A1.7 UI/UX Considerations
  •​ Tier names appear with Arabic equivalent available via ⓘ icon — see Appendix A for
     copy.
  •​ Streak flame must be recognisable at small sizes — appears in profile headers,
     summary screens, and the profile tab top area.
  •​ All XP animations must be skippable via tap-and-hold. Do not force users to sit through
     animations if they want to continue.
  •​ Profile screen communicates progression at a glance: tier name + sub-level, streak
     flame, XP bar to next level, lifetime hours, longest streak, earned certificates. This is
     the "achievement wall" users may screenshot and share.


                                             Page 12


---

                                                              OnDeen V2 Functional Specification — Draft 4




A1.8 Security Considerations
  •​ XP, streak state, and level are authoritative server-side. Client never calculates or
     mutates these — only displays what the server returns.
  •​ Check-in events must be validated server-side for time-window, session-window,
     difficulty, and (for online sessions) code correctness before awarding XP.
  •​ Multiplier stacking order is strict (difficulty before streak). Implementation must match
     the specified order to prevent edge-case inflation.
  •​ Retroactive XP corrections (e.g. for failed check-in or server error) must be logged in
     an admin audit log.



A1.9 Testing Requirements
Unit tests
  •​ XP formula correctness across the full 30-level range.
  •​ Difficulty multiplier applied correctly for each journey level.
  •​ Streak state machine: all transitions including mixed sessions across courses.
  •​ Course completion bonus tiering — exact boundary testing at 60% and 80%.
  •​ Multiplier stacking: verify order-of-operations produces expected final XP.

Integration tests
  •​ End-to-end flow: book → check-in → XP awarded (with correct multipliers) → streak
     updated → summary rendered.
  •​ First-ever class flow: sign-up → first check-in → Seeker 1 welcome state.
  •​ Tier transition flow: Seeker 10 → Voyager 1 animation plays exactly once.
  •​ Max-level behaviour: Pathfinder 10 user earning more XP does not trigger any level-up
     animation.

Load tests
  •​ Summary screen generation at scale: 1,000 concurrent check-ins all resolving
     summaries on next app open.




                                             Page 13


---

                                                             OnDeen V2 Functional Specification — Draft 4




A2. Session Feedback Screen
 P0   Release: V2.0

A2.1 Overview
Immediately after the gamification summary, users see a second screen requesting
feedback on the session attended. Modelled on Uber Eats-style post-completion feedback:
short, visually appealing, low-friction. Feedback is anonymised to the user but visible to the
event organiser (and, where registered, the speaker). Guest speakers (temporary, no
OnDeen account) do not see feedback — organisers export and share externally.



A2.2 User Flow
  1.​ User completes check-in to a session.
  2.​ Later, user opens the app. Summary Part 1 (XP/progression) plays to completion.
  3.​ Summary Part 2 (feedback) appears with a visible "Anonymous" banner at the top.
  4.​ User rates two questions on a 5-star scale: "The session was engaging?" and "The
      delivery of the topic was good?"
  5.​ Optional free-text field: "Any suggestions for improvement?" (max 500 characters).
  6.​ Two buttons: "Submit" (primary, visually emphasised) and "Skip" (secondary,
      de-emphasised).
  7.​ On submit: feedback recorded, linked to session ID but not to user ID in the
      organiser-visible view. User returns to app home.
  8.​ On skip: no feedback recorded. User returns to app home. System does not re-prompt
      for the same session.



A2.3 Functional Requirements
A2.3.1 User-facing
  •​ Shown exactly once per session. Skipping does not re-prompt.
  •​ Both ratings required. Free-text genuinely optional.
  •​ Submit button visually more prominent than Skip.
  •​ "Anonymous" banner clearly visible.


A2.3.2 Organiser-facing
  •​ New dashboard section shows aggregated feedback per session and per event.
  •​ Per-session: average rating for each question, response count, list of free-text
     suggestions (timestamp only, no user identifier).




                                            Page 14


---

                                                              OnDeen V2 Functional Specification — Draft 4



  •​ Per-event (aggregated across sessions): overall averages, trend over time if
     multi-session, all free-text suggestions.
  •​ CSV export: organisers can download feedback for sharing with guest speakers
     externally. All fields except user ID.


A2.3.3 Speaker-facing
  •​ Registered OnDeen speakers see feedback for sessions they led in their own
     dashboard. Same format as organiser view, same anonymisation.
  •​ Temporary guest speakers have no dashboard. Organisers pass feedback via CSV
     export if they choose to.



A2.4 UI/UX Considerations
  •​ Not a grey form — uses app accent colour for submit button, warm fill on selected
     stars.
  •​ Star interaction: taps fill stars from left; tapping same star again does not deselect.
  •​ Keyboard-aware scroll: field and submit button remain visible when keyboard appears.
  •​ Loading state on submit, retry on failure.



A2.5 Security Considerations
  •​ Rate limit: one feedback per user per session (server-enforced).
  •​ Free-text sanitised against script injection.
  •​ Data retention: indefinite by default; deletable via existing GDPR data-subject-request
     flow.



A2.6 Testing Requirements
  •​ Unit: rating validation, length limits, duplicate prevention.
  •​ Integration: feedback-to-dashboard roundtrip within 60 seconds; CSV export
     completeness.
  •​ UI: skip-no-reprompt; star interactions; anonymous banner visible at all sizes.




                                             Page 15


---

                                                             OnDeen V2 Functional Specification — Draft 4




A3. Guest Booking Flow
 P0   Release: V2.0

A3.1 Overview
Guest Booking allows someone to book a ticket for an OnDeen event without creating a full
account. Supports two scenarios: users arriving via shared event link who don't want sign-up
friction, and one-time attendees. Guest bookings produce the same ticket QR as full-account
bookings.
One-off events only. Not permitted for multi-session courses, which require a full account for
progression tracking.



A3.2 User Flow
  1.​ External party shares an event link.
  2.​ Deep link opens the OnDeen app if installed, otherwise redirects to a web-based event
      page.
  3.​ User taps "Book Ticket".
  4.​ If not logged in, offers: "Sign in / Sign up" OR "Continue as guest."
  5.​ Guest path: user enters name, email, mobile. No password.
  6.​ Email and mobile format validated. Guest record created.
  7.​ Paid event: Stripe/Google Pay flow. Free event: booking confirmed immediately.
  8.​ Ticket QR shown in-app and emailed.
  9.​ Future return: same link identifies by email + mobile, shows existing ticket.



A3.3 Functional Requirements
  •​ Guest records stored separately from authenticated users; no login credentials.
  •​ Guest records do not receive XP, streaks, tier progression, or any gamification state.
     Check-in events from guests are logged but do not advance any progression.
  •​ Guest records linked to bookings via email + mobile combination.
  •​ Migration flow: when a former guest later signs up with the same email, system
     prompts: "We found bookings under this email. Would you like to import them?" Opt-in.
     Import includes past bookings and attendance records. No retroactive XP.
  •​ Event-type eligibility: guest booking defaults ON for one-off events, OFF for courses.
     Organiser can override when creating the event.



A3.4 UI/UX Considerations



                                             Page 16


---

                                                             OnDeen V2 Functional Specification — Draft 4



  •​ Guest path must not feel like the cheap option.
  •​ Copy: "Book fast as a guest — no account needed. Note: you won't earn XP or track
     progress until you create an account."
  •​ Ticket delivery within 30 seconds; fallback state if delayed.
  •​ Lost-ticket recovery: re-accessing event link with same email triggers "ticket found"
     flow.



A3.5 Security Considerations
  •​ Rate limit: 5 guest bookings per IP per hour.
  •​ Email unverified at booking for speed; verified only if user migrates to full account.
  •​ Mobile format-validated only; no OTP at booking.
  •​ Guest records subject to standard GDPR/data-protection requirements.



A3.6 Testing Requirements
  •​ Unit: guest record creation, retrieval by email+mobile, migration logic.
  •​ Integration: full flow for free and paid events (Stripe + Google Pay); lost-ticket recovery;
     course booking blocked for guests.
  •​ UI: deep link on installed and non-installed devices; QR renders and scans.




                                            Page 17


---

                                                           OnDeen V2 Functional Specification — Draft 4




A4. Online Session Check-in Codes
 P0   Release: V2.0

A4.1 Overview
Online sessions need a check-in path that works without GPS. This feature adds per-session
6-digit numeric codes generated automatically on the organiser dashboard, distributed to
attendees via OnDeen's existing in-app announcement system (the same channel
organisers already use to send event updates to booked users). Users enter the code
through the same "swipe to check in" interaction as in-person events — the swipe opens a
code entry screen when the session is online.
Code distribution via announcements rather than out-of-band channels (WhatsApp, email)
keeps the check-in flow entirely in-app. It reuses an existing, tested communication channel
and avoids attendees needing to switch apps to find their code.



A4.2 User Flow — organiser
  1.​ Organiser creates or opens an online session in their dashboard.
  2.​ A new "Generate check-in code" button appears in the session's management view. An
      ⓘ icon next to it explains: "Generates a 6-digit code for attendees to check in.
      Automatically sent as an announcement to everyone booked on this session. Code is
      valid from 15 minutes before session start until 30 minutes after end."
  3.​ Organiser taps the button. System generates a unique 6-digit code for that session.
  4.​ System automatically composes and sends an in-app announcement to all booked
      attendees: "Check-in code for [session name]: [code]. Open your booking page and
      swipe to check in. Code valid from [start window] to [end window]."
  5.​ Organiser sees confirmation: "Code [nnn-nnn] generated and sent to [X] attendees."
      Code remains visible on the organiser's session view for reference.
  6.​ If the organiser generates a code before the announcement system is allowed to send
      (e.g. too far in advance), the code is saved but announcement delivery is queued for
      the appropriate window — organiser is told: "Announcement will send 15 minutes
      before session start."



A4.3 User Flow — attendee
  •​ Attendee receives the in-app announcement when the organiser generates and sends.
  •​ Attendee opens the OnDeen app and navigates to the booking for that session.
  •​ At the bottom of the booking page: "Swipe to check in" (V1 existing behaviour).
  •​ On swipe, the system detects session type. For online sessions, the code entry screen
     opens: a segmented 6-digit input field with the numeric keypad surfaced.



                                           Page 18


---

                                                            OnDeen V2 Functional Specification — Draft 4



  •​ User enters the code. System validates: correct code + within valid window (15 min
     before start to 30 min after end) + user booked on this session.
  •​ Success: tick animation, summary screen queued for next app open, XP awarded.
  •​ Incorrect code: inline error, user can retry. 3 failed attempts within 5 minutes → user
     locked out of check-in for that session for 15 minutes.
  •​ Correct code outside window: "Check-in window has closed/not yet open" with valid
     window displayed.



A4.4 Functional Requirements
A4.4.1 Code generation
  •​ Each online session has exactly one valid code at a time. Server-side generation via
     cryptographic RNG, 6 numeric digits.
  •​ Codes can be re-used across unrelated sessions (e.g. 482193 can be today's code for
     course A and tomorrow's for course B).
  •​ Codes are generated on organiser action, not automatically. Organisers can
     regenerate if the first code is compromised — regenerating invalidates the previous
     code and sends a fresh announcement.


A4.4.2 Validity window
  •​ Valid window: 15 minutes before scheduled session start, through 30 minutes after
     scheduled session end.
  •​ Outside window: code entry rejected with clear messaging.
  •​ If organiser extends the session, window does not automatically extend — organiser
     must explicitly extend the session end time, which recalculates the window.


A4.4.3 Announcement integration
  •​ This feature uses the existing V1 in-app announcement system — no new notification
     infrastructure.
  •​ Announcement fan-out is automatic on code generation (or queued if generated more
     than 15 minutes before session start).
  •​ Announcement message template is system-generated; organisers cannot edit it
     (prevents typos or omissions in the time-critical check-in info).
  •​ Users booked on the session receive both the in-app announcement and a push
     notification pointing to the announcement inbox.


A4.4.4 Abuse prevention




                                           Page 19


---

                                                           OnDeen V2 Functional Specification — Draft 4



  •​ Screenshot-and-share mitigation: codes only valid within their session window, so
     early-leaked codes don't provide unauthorised check-in until session start.
  •​ 3 wrong attempts in 5 minutes → lockout on that session for 15 minutes.
  •​ Booking-required check: a user with the code but not booked on the session cannot
     check in.
  •​ V2.1+ consideration: bind code to device + user after first successful entry to prevent
     sharing with someone else booked on the same course. Not in V2.0.



A4.5 UI/UX Considerations
  •​ Code entry uses segmented 6-box input (OTP-entry pattern).
  •​ Numeric keypad auto-surfaces.
  •​ Success animation (tick), then summary screen queues for next app open.
  •​ For recurring courses, check-in screen remembers session context — user does not
     re-confirm which session.
  •​ Organiser dashboard shows code prominently and persistently once generated — they
     may need to announce it verbally on the call in addition to the auto-announcement.



A4.6 Security Considerations
  •​ Codes generated server-side with cryptographic RNG, never client-side.
  •​ Failed-attempt logging for abuse monitoring.
  •​ No client-side caching of codes beyond the immediate entry session.



A4.7 Testing Requirements
Unit tests
  •​ Code generation: no collisions within same active session set; all digits numeric.
  •​ Window validation: exact boundary testing at open and close times.

Integration tests
  •​ End-to-end online check-in flow for booked user.
  •​ Blocked check-in for user not booked (even with valid code).
  •​ Announcement auto-send on generation; queued-send behaviour for early generation.
  •​ Three-strike lockout and unlock after 15 minutes.
  •​ Session extension correctly updates window.

UI tests
  •​ Segmented input across devices.
  •​ Error messages clear and localised where applicable.


                                           Page 20


---

          OnDeen V2 Functional Specification — Draft 4




Page 21


---

                                                              OnDeen V2 Functional Specification — Draft 4




A5. Notification Inbox — Clickable Link Handling
 P0   Release: V2.0

A5.1 Overview
The existing notification inbox displays notifications as plain text. URLs in the body are
currently un-tappable. This enhancement makes URLs automatically tappable and correctly
routed to external browsers or in-app deep links.



A5.2 User Flow
  1.​ User opens notification inbox (V1 existing).
  2.​ URLs in notification body rendered in accent colour + underline — visually tappable.
  3.​ Tap routes based on URL type: external URL → device default browser; OnDeen deep
      link → in-app screen; unknown → no action.
  4.​ Invalid deep link (e.g. deleted event) → friendly error: "This link is no longer valid."



A5.3 Functional Requirements
  •​ URL detection: regex-based detection for http/https and common patterns.
  •​ Rendering: tappable URLs in accent colour + underline. Non-URL text unchanged.
  •​ Deep-link router: central handler mapping OnDeen URLs to in-app screens. Minimum
     routes for V2.0: events, courses, user profiles, organiser profiles, speaker profiles.
  •​ External links: device default browser, respecting OS settings.
  •​ External link indicator (small arrow icon) on outbound links.



A5.4 UI/UX Considerations
  •​ Link colour passes WCAG AA contrast.
  •​ Tap target 44×44 minimum.
  •​ Long URLs wrap without breaking link integrity.
  •​ Multiple URLs in one notification each independently tappable.



A5.5 Security Considerations
  •​ URLs server-generated, not client-constructed. Prevents injection.
  •​ Deep links validated against whitelist of OnDeen domains before in-app routing.
  •​ External link indicator is not suppressible — phishing mitigation.




                                             Page 22


---

                                                              OnDeen V2 Functional Specification — Draft 4




A5.6 Testing Requirements
  •​ Unit: URL detection regex coverage; deep-link route resolution.
  •​ Integration: notification with deep link → tap → correct screen; external URL →
     browser; invalid link → fallback messaging.
  •​ UI: styling correct in light and dark mode; multiple links in one notification.




                                             Page 23


---

                                                               OnDeen V2 Functional Specification — Draft 4




A6. Editable Event Titles from Mobile App
 P0   Release: V2.0

A6.1 Overview
Currently organisers can only edit event titles via the web dashboard. This enhancement
enables title editing from within the mobile organiser app with notifications to affected users.



A6.2 User Flow
  1.​ Organiser navigates to an event (draft, published, ongoing, completed — all
      supported).
  2.​ Taps event title. Edit field opens with current title pre-populated.
  3.​ Changes save on blur or explicit save tap.
  4.​ Published + booked: notification to all booked users: "[old title] has been renamed to
      [new title]."
  5.​ New title propagates to all surfaces: booking page, calendar, notifications, ticket QR
      pages, shared links.
  6.​ Log entry: who, when, old → new.



A6.3 Functional Requirements
  •​ Available in all event states. Completed events editable but no notifications sent.
  •​ Validation: 3–100 characters, no leading/trailing whitespace.
  •​ Notification to booked users only for published events with active bookings.
  •​ Edit history: append-only log, indefinite retention.



A6.4 UI/UX Considerations
  •​ Discoverable affordance (subtle pencil icon).
  •​ Auto-surfaced keyboard.
  •​ Confirmation for events with >10 bookings: "This will notify X users. Proceed?"
  •​ 10-second undo window after save before notifications fire.



A6.5 Security Considerations
  •​ Only event owner or team members with edit permission can edit.
  •​ Title content XSS-sanitised before storage.
  •​ Rate limit: 5 title changes per event per 24 hours.



                                             Page 24


---

                                                              OnDeen V2 Functional Specification — Draft 4




A6.6 Testing Requirements
  •​ Unit: validation, permission checks.
  •​ Integration: end-to-end edit per state; notification fan-out; title propagation within 30
     seconds.
  •​ UI: edit affordance discoverable; keyboard behaviour.




                                            Page 25


---

                                                             OnDeen V2 Functional Specification — Draft 4




A7. Certificates — Shareable Completion & Tier
Milestones
 P1   Release: V2.0

A7.1 Overview
Certificates are shareable, visually polished credentials awarded for specific achievements.
They bridge in-app gamification (which lives only inside OnDeen) and real-world credibility
(which matters outside). A certificate is what a parent posts, what a student adds to their
LinkedIn, what signals that the learner's engagement with Islamic learning has been
meaningful and verified.
Certificates carry the weight of the scholar partnership behind OnDeen. They include
attribution to the speaker/scholar who taught the course, giving them real credentialing
power.



A7.2 Certificate Types
A7.2.1 Course Completion Certificate (organiser-issued)
  •​ Trigger: user completes a course with ≥ organiser-set attendance threshold (default
     80%, configurable 50–100%).
  •​ Only available for courses where the organiser has explicitly enabled certificates at
     creation time.
  •​ Contents: user name, course title, organiser name, speaker name(s), course duration,
     completion date, attendance %, total hours attended, OnDeen verification code,
     subcategory-specific graphic.


A7.2.2 Tier Milestone Certificate (automatic)
  •​ Trigger: user reaches a new tier (Seeker 10 → Voyager 1, Voyager 10 → Pathfinder 1).
     Not issued for sub-level changes within a tier.
  •​ Issued automatically by OnDeen, no organiser involvement.
  •​ Contents: user name, tier name (English + Arabic), date achieved, total hours in
     Islamic study at achievement, OnDeen verification code.
  •​ Visual: OnDeen-designed template with calligraphic tier name as central element.


A7.2.3 Axis Mastery Certificate (V2.2+)
  •​ Deferred. Requires life-axis radar system to be live first. Design in parallel but do not
     ship.




                                            Page 26


---

                                                             OnDeen V2 Functional Specification — Draft 4




A7.3 Organiser Flow — enabling certificates
The certificate toggle appears on the event creation form, positioned *after* the speaker
selection section.



A7.3.1 Speaker prerequisite
  •​ If no speaker is selected, toggle is disabled (greyed out). Tapping shows inline red text:
     "Select a speaker first — certificates require a named speaker for attribution."
  •​ If a temporary guest speaker is selected, toggle is disabled with inline text: "Certificates
     require an approved OnDeen speaker. Temporary guest speakers cannot issue
     certificates. Invite your speaker to create an OnDeen speaker account, or continue
     without certificates."
  •​ If a registered OnDeen speaker is selected, toggle becomes enabled.


A7.3.2 Enabling the toggle
When the organiser enables the toggle, additional fields expand in a UX-friendly layout
below it:
  •​ Minimum attendance slider. Default 80%. Slider range 50–100% in 5% increments.
     Label updates live: "Attendees who attend X% of sessions or more will earn a
     certificate."
  •​ Speaker consent checkbox. Two wordings based on who is creating the event. When
     the organiser creates: "I confirm I have the consent of [speaker name] for their name,
     credentials, and OnDeen profile to appear on certificates issued to attendees of this
     course." When the speaker creates (as event creator): "I authorise my name,
     credentials, and OnDeen profile to appear on certificates issued to attendees of this
     course."
  •​ Certificate preview. Organiser sees a sample of what the certificate will look like with
     their event's details filled in (placeholder name where the attendee's name will go).


A7.3.3 Speaker-led event creation
Speakers who create their own events via the speaker login (V1 Organiser App — Speaker
Features) see the same toggle with the self-authorisation wording. No third-party consent
needed because they are authorising themselves.



A7.4 User Flow — earning and viewing
Earning a course completion certificate:
  •​ User completes a course with attendance at or above the organiser-set threshold.
  •​ Certificate auto-generated server-side.


                                            Page 27


---

                                                              OnDeen V2 Functional Specification — Draft 4



  •​ Push notification: "Your certificate for [course name] is ready."


Earning a tier milestone certificate:
  •​ User reaches new tier (Seeker 10 → Voyager 1, or Voyager 10 → Pathfinder 1).
  •​ Certificate auto-generated immediately after the tier-change celebration in the
     summary screen.
  •​ Push notification: "You've earned a [tier name] tier certificate."


Viewing certificates — the Profile "My Certificates" section:
  •​ New section on user profile: "My Certificates."
  •​ Certificates shown as a grid of distinct graphical tiles, each with a subcategory-specific
     icon/graphic (e.g. all Quran certificates share one visual style; all Fiqh certificates share
     another; Hajj/Umrah another, etc.).
  •​ Tapping a certificate triggers a smooth zoom/pop-up animation that enlarges the
     certificate to full-screen, showing all details and a prominent Share button.
  •​ User can: view full-screen preview, download as PDF or high-resolution image, share
     via device share sheet.
  •​ Shared certificates include a verification URL.



A7.5 Functional Requirements
A7.5.1 Generation & storage
  •​ Server-side generation via templating. Data pulled from user profile, course records,
     speaker records, tier state at moment of issuance.
  •​ Each certificate has unique alphanumeric verification code (8 characters).
  •​ Stored as structured data, not pre-rendered PDFs — allows reprinting, updated visual
     templates without losing previously issued certs.
  •​ Name toggle: user can choose whether their nickname or full name appears on
     certificate. Default: full name (for credentialing value). Configurable per certificate.


A7.5.2 Subcategory-specific graphics
  •​ Each event subcategory maps to a specific certificate visual template. Templates
     designed centrally by OnDeen — organisers cannot upload or customise templates.
  •​ Minimum subcategories requiring templates for V2.0 launch: Tafsīr, Fiqh, Arabic, Sīrah,
     ʿAqīdah, Quran Memorisation, Hajj/Umrah, general-purpose. Commission as design
     work alongside dev build.
  •​ Tier milestone certificates have their own template design — distinct from course
     completion.


                                             Page 28


---

                                                            OnDeen V2 Functional Specification — Draft 4




A7.5.3 Download & share
  •​ PDF: A4, print-ready, high resolution.
  •​ Image: PNG at social-media-optimised dimensions (1200×630 for LinkedIn/Facebook
     preview, 1080×1080 for Instagram).
  •​ Share sheet: OS-native with pre-populated caption and verification URL.


A7.5.4 Verification
  •​ Public verification page at ondeen.com/verify/[code]. Shows: certificate type, user
     name, issue date, course/tier details, issuing organiser/speaker, visual preview.
  •​ No sign-in required. Privacy-preserving — only info already on certificate.
  •​ Revocable by OnDeen admin for abuse (e.g. fraudulent attendance). Revoked certs
     show as "Revoked" on verification page.


A7.5.5 Speaker/organiser attribution
  •​ Certificates include speaker name(s) for course completion. Registered OnDeen
     speakers with verified credentials show a "Verified" indicator.
  •​ Organiser name also included. Certificates backed by named scholar partnerships
     display that attribution.



A7.6 UI/UX Considerations
  •​ Certificate design is brand-critical — invest in design work. Visual quality determines
     whether certificates get shared.
  •​ "My Certificates" grid: scannable at a glance. Each tile shows the subcategory graphic
     and course/tier name. Count displayed at section header ("My Certificates (7)").
  •​ Sharing flow: 2 taps max from certificate view to share sheet.
  •​ Certificate-issued moment feels distinct from tier-change animation — it's a shareable
     milestone, not just an in-app one.



A7.7 Security Considerations
  •​ Verification codes cryptographic random, unique, unguessable.
  •​ Certificate data server-authoritative. Client-rendered previews for display only.
  •​ Revocation admin-only, logged.
  •​ Public verification page by design — no sensitive data on any certificate.




                                              Page 29


---

                                                          OnDeen V2 Functional Specification — Draft 4




A7.8 Testing Requirements
  •​ Unit: data pull correctness; verification code uniqueness; template rendering across
     types.
  •​ Integration: course completion → cert issued → notification → viewable; verification
     URL opens correct preview; revocation shows revoked state.
  •​ UI: PDF/image rendering; share sheet on iOS and Android; zoom/pop-up animation
     smooth.
  •​ UX: toggle gating (no speaker / temporary speaker / registered speaker) behaves
     correctly.




                                          Page 30


---

                                                             OnDeen V2 Functional Specification — Draft 4




A8. Seasonal & Rolling Challenges
 P2   Release: V2.2+

A8.1 Overview
Seasonal and rolling challenges are the mechanism by which engaged users can accelerate
tier progression through specific valued behaviours — particularly volunteering, community
service, and high-engagement periods tied to the Islamic calendar. Challenges are the
engagement layer that prevents plateau on the base tier curve: the core 30-level progression
stays challenging, but users who show up for challenges can legitimately push through faster
by doing exactly the behaviours OnDeen wants to encourage.
Challenges are NOT a shortcut. They reward the right behaviours — volunteering, consistent
attendance during Ramadan, brotherhood engagement — that are already aligned with
OnDeen's mission. A user who earns challenge XP is a user who is engaging deeply with
the platform.
Deferred to V2.2+ (after first 6 months of V2.0 operation) to focus the launch on core
mechanics. First challenges will align with Ramadan or Dhul Hijjah following the deferral
period.



A8.2 Challenge Structure
Every challenge has six components:
  •​ Name (e.g. "Month of Mercy", "Ten Blessed Days", "Hands That Give").
  •​ Theme — seasonal, community-focused, knowledge-focused, etc.
  •​ Time window — start and end dates. Seasonal challenges align with the Islamic
     calendar.
  •​ Qualifying activities — specific types of check-ins that count toward the challenge
     (e.g. "any volunteering event" or "any tafsīr class").
  •​ Target — what the user must do to complete (e.g. "complete 5 volunteering events",
     "attend at least one event per day for 10 consecutive days").
  •​ Reward — bonus XP + exclusive badge. Badges for seasonal challenges are unique
     to that specific year/season and cannot be earned again.



A8.3 Example Challenges

          Name                 Window                Qualifying action                Reward

                                                Complete 5 volunteering        2,000 XP +
                             Ramadan (30
      Month of Mercy                             events OR attend 10           "Ramadan [year]"
                                days)
                                                    tafsīr classes             badge




                                           Page 31


---

                                                                OnDeen V2 Functional Specification — Draft 4




        Name                  Window                    Qualifying action                Reward

                           First 10 days of        Attend at least 1 event        1,500 XP + "Ten
   Ten Blessed Days
                              Dhul Hijjah           per day for 10 days           Nights" badge

                            Rolling 30-day        Complete 3 volunteering         750 XP
   Hands That Give
                              windows                    events                   (repeatable)

                                                   Attend 5 events where          1,000 XP +
     Brotherhood              Quarterly           you invited a friend who        "Brother/Sister"
                                                       also attended              badge

   Winter Knowledge                              Complete 2 full courses at       2,500 XP + "Sprint"
                           12-week window
         Sprint                                     80%+ attendance               badge



A8.4 Functional Requirements
A8.4.1 Participation
  •​ Challenges are automatic for all users. No opt-in required. Ramadan happens for
     everyone.
  •​ Users see active challenges in a new "Challenges" section of the profile or on a
     dedicated challenges screen. Each challenge shows progress (e.g. "3 of 5 volunteering
     events completed") and time remaining.


A8.4.2 Challenge creation
  •​ Challenges are created and managed exclusively by OnDeen central — via the admin
     panel, not the organiser dashboard.
  •​ Organisers CANNOT create challenges. Prevents trivial/self-serving challenges that
     pump engagement on specific organiser events.
  •​ Organisers CAN see upcoming challenges in a read-only view, with guidance on how
     to create events that will qualify (e.g. "Volunteering events during Ramadan count
     toward Month of Mercy"). This helps organisers plan content aligned with seasonal
     engagement windows.


A8.4.3 XP reward scaling
  •​ Challenge XP rewards are fixed per challenge — 750 to 2,500 XP typical.
  •​ Challenge XP is a flat bonus, applied once on challenge completion. It does NOT stack
     with difficulty multiplier (the XP is already a challenge-level reward, not per-session).
  •​ Challenge XP DOES count toward the user's overall tier progression — same XP pool
     as base attendance XP.
  •​ Note on balance: Challenge XP is meaningful for early-to-mid-tier users (a 2,000 XP
     reward = roughly 1 level at Seeker 5). Proportionally less meaningful at higher tiers,




                                              Page 32


---

                                                             OnDeen V2 Functional Specification — Draft 4



    where each level requires far more XP. This is intentional — challenges help users
    accelerate through the engaging middle of the journey, not skip to the top.


A8.4.4 Badges
  •​ Each challenge awards an exclusive badge on completion. Seasonal badges include
     the year (e.g. "Ramadan 1448") and can never be re-earned.
  •​ Badges appear on the user's profile, are visible to other users in leaderboards and
     (with consent) attendee lists.
  •​ Badge design is a central OnDeen design responsibility — commission as part of
     broader certificate/badge asset work.



A8.5 UI/UX Considerations
  •​ Active challenges visible prominently on the profile home and the dedicated challenges
     screen.
  •​ Progress indicators: "3 of 5 volunteering events" with a visual progress bar.
  •​ Time-remaining countdown for seasonal challenges adds urgency without being
     manipulative.
  •​ Completion moment: similar weight to tier change — full-screen celebration, badge
     reveal, XP award ring animation, distinct sound/haptic.
  •​ Upcoming challenges teased 1–2 weeks before they begin: "Ramadan challenge starts
     in 10 days."



A8.6 Security & abuse considerations
  •​ All qualifying activities must be verified check-ins. Self-reporting not supported.
  •​ "Invited a friend" challenges require a tracked referral link — just knowing someone
     who happened to attend does not qualify.
  •​ Admin can revoke challenge completions if fraud detected (e.g. coordinated fake
     check-ins); logged in audit trail.



A8.7 Testing Requirements
  •​ Unit: challenge state machine (not started → in progress → completed → expired); XP
     reward calculation; badge issuance.
  •​ Integration: end-to-end for each challenge type; edge cases around challenge expiry
     mid-progress; concurrent challenges.
  •​ Admin: challenge creation flow, revocation.
  •​ UI: progress indicators, countdown, completion celebration.



                                            Page 33


---

          OnDeen V2 Functional Specification — Draft 4




Page 34


---

                                                                 OnDeen V2 Functional Specification — Draft 4




A9. OnDeen Radar — four-axis balance visualisation
 P1    Release: V2.1

A9.1 Overview
OnDeen Radar is a dynamic four-axis display on the user profile that shows where a user is
currently investing their time across four dimensions of Islamic life: Knowledge, Fitness,
Ummah, and Tazkiyyah. Unlike the XP and tier system (which is cumulative and permanent),
the Radar is a real-time measure of recent activity — it rises when the user engages and
eases back down when they stop. The ideal state is a balanced diamond in green territory
across all four axes, signalling a user who is maintaining consistent engagement across
multiple dimensions of their Islamic journey.
Internal name for this system: mīzān (balance). User-facing name: OnDeen Radar.
Purpose: where the tier/XP system tells the user "look how far you've come," the Radar tells
them "here's your current focus." Both are visible on the profile — together they give a
complete view of the user's journey. The Radar also provides the hook for gentle,
hadith-grounded notifications that nudge users toward axes they are neglecting.



A9.2 The four axes

        Axis           Arabic equivalent            Activities that count toward this axis

                                            Tafsīr, Fiqh, Arabic, Sīrah, ʿAqīdah, Islamic history,
      Knowledge             ʿIlm (‫)علم‬
                                            Tajwīd, Hadith sciences

                                            Organised fitness classes, bootcamps, martial arts,
       Fitness           ʿĀfiyah (‫)عافية‬
                                            sports days, health retreats

                                            Community events, volunteering, fundraisers,
       Ummah             Ummah (‫)أمة‬        brotherhood/sisterhood meetups, service projects, Rijal
                                            Club and similar community-building events

                                            Hajj/Umrah programmes, Ramadan programmes, dhikr
      Tazkiyyah         Tazkiyyah (‫)تزكية‬   circles, Quran memorisation/tadabbur,
                                            purification-of-the-heart study, worship retreats


Important note on Fitness: only organised, attended OnDeen events count. Self-reported
fitness activity (e.g. a user saying "I went to the gym") does not count. Keeps the system
verifiable and prevents self-reporting fraud.



A9.3 Scoring — the rolling 30-day window
Each axis displays a score from 0 to 100. The score is calculated based on hours spent in
that axis over a rolling 30-day window. The formula:
  Axis score = min(100, 100 × hours_in_last_30_days ÷ target_hours_for_tier)



                                              Page 35


---

                                                              OnDeen V2 Functional Specification — Draft 4




Target hours differ by axis (because different activities take different amounts of time to be
meaningful) and scale up as the user progresses through tiers (because a deeper journey
warrants deeper engagement):



        Tier             Knowledge         Fitness           Ummah                  Tazkiyyah

   Seeker (levels
                           8 hours         4 hours            4 hours         4 hours
      1–10)

  Voyager (levels
                          10 hours         4 hours            6 hours         6 hours
      11–20)

 Pathfinder (levels
                          12 hours         4 hours            8 hours         8 hours
      21–30)


Design rationale: targets are calibrated so that a working Muslim attending one meaningful
session per axis per week hits green territory on all four axes — a visible diamond in green,
the aspirational state. Fitness stays at 4 across all tiers because physical capacity does not
scale with spiritual progression. Knowledge, Ummah, and Tazkiyyah scale up to reflect
deepening practice. Scaling happens silently as users level up — not announced, not
explained in-app. Users who notice will feel a natural sense of maturation. Users who do not
notice will simply experience that their engagement remains in green when they continue
their rhythm.



A9.4 Colour bands

     Band             Score range                               Meaning

                                       Quiet. This area has seen little recent engagement. Neutral
     Grey                0–25
                                       framing — not a failure state.

    Amber               26–60          Building. Warming up, visible progress, room to grow.

                                       Strong. Consistent engagement showing through.
    Green               61–100
                                       Aspirational state.


  •​ Bars must never be rendered in red or any alarming colour. Even zero engagement
     shows as neutral grey.
  •​ Band transitions produce natural notification moments — a bar crossing from amber to
     green is cause for celebration; a bar dropping from green to amber is cause for a
     gentle nudge (see A9.6).
  •​ Colours are design-locked per axis for visual consistency. Recommended: each axis
     keeps the same hue across all states (e.g. Knowledge is always in the




                                             Page 36


---

                                                             OnDeen V2 Functional Specification — Draft 4



     Knowledge-coloured palette; only the saturation and bar height changes with the
     band).



A9.5 The Radar on the profile
  •​ The Radar occupies a prominent section on the user's profile, positioned alongside the
     existing tier/streak display (see B4.3 Profile Stats).
  •​ Visual: four horizontal bars (one per axis) with label, current score (0–100), current
     colour band, and small text showing the user's activity this month in that axis (e.g. "6
     hours this month").
  •​ Tappable: tapping the Radar opens a detail screen with expanded information for each
     axis — recent events that contributed, list of upcoming events across OnDeen that
     would count toward each axis, the target hours for the current tier, and how far to the
     next colour band.
  •​ Alternative visual (aspirational, optional for V2.1): a true radar chart (polygon)
     rendering the four scores as a shape. Users who balance across axes see a symmetric
     diamond; users who focus on one axis see a skewed polygon. Use whichever reads
     better in usability testing.



A9.6 Hadith-grounded notification system
Notifications are the primary mechanism by which the Radar influences user behaviour.
They fire in response to axis state changes (dropping into amber, staying in grey for a
period, crossing into green) and are crafted to feel like a personal reminder rather than a
system alert.



A9.6.1 Notification tone and structure
Template: personal voice addressed to the user by first name, grounded in an authentic
hadith or Qurʾānic verse (English translation only for V2.1), ending with a specific,
action-oriented call to action with an embedded deep link. Example:
 "Hey Muhammad, did you know the most beloved to Allah are those who serve others?
Step into something greater — join a community initiative today and become among those
beloved to Him."
Tapping the notification opens the in-app notification inbox where the full message is
preserved. From the inbox, a CTA button routes to the relevant action screen (e.g.
Community initiatives list for an Ummah-axis notification, Knowledge classes list for a
Knowledge notification).
  •​ First name is used in the notification, regardless of whether the user has set a
     nickname for public display. Notifications are private to the user, so first name is the
     more personal choice.



                                            Page 37


---

                                                               OnDeen V2 Functional Specification — Draft 4



  •​ Notifications are never framed as criticism or failure. They invite; they do not scold.
  •​ Specific escalation limit: if a user does not respond to notifications for the same axis
     across three consecutive sends, the system backs off that axis for 30 days before
     resuming.


A9.6.2 The hadith and Qurʾānic verse library
  •​ Library curated and approved by OnDeen's scholar-in-residence. Minimum viable
     launch set: approximately 30 entries across the four axes.
  •​ Each library entry contains: the English-translated text of the hadith or Qurʾānic verse,
     full source chain (e.g. "Ṣaḥīḥ al-Bukhārī, Book of Īmān"), axis tag, scenario tag (e.g.
     "dropped to amber", "consistent green", "new low"), and a short reflection that appears
     in the notification detail view.
  •​ English translation only for V2.1. No Arabic text in push notifications due to adab
     considerations around dismissing and caching Qurʾānic content.
  •​ Library stored server-side; can be updated without app releases.
  •​ System avoids repeating the same entry to the same user within a 30-day window.


A9.6.3 Example notifications per axis

      Axis               Hadith or verse                         Notification phrasing

                      "Whoever takes a path         "Hey [name], your Knowledge has gone quiet
                   seeking knowledge, Allah will    this week. Every path in search of knowledge
  Knowledge
                      ease for them a path to       is a step toward Jannah — want to take one
                    Paradise." — Ṣaḥīḥ Muslim       this weekend?"

                   "The strong believer is better
                    and more beloved to Allah       "Hey [name], caring for your body is part of
    Fitness       than the weak believer, though    shukr. A strong believer is beloved to Allah —
                     in both there is good." —      a bootcamp is running near you this week."
                           Ṣaḥīḥ Muslim

                  "The best of people are those     "Hey [name], the best of people are those
                  most beneficial to people." —     most beneficial to others. A community
    Ummah
                   Ṭabarānī (authenticated by       initiative is running this Saturday — want to
                           Al-Albānī)               join?"

                   "The most beloved deeds to       "Hey [name], your Tazkiyyah bar has eased
                      Allah are those done          back — small, consistent deeds are most
   Tazkiyyah
                  consistently, even if small." —   beloved to Allah. A dhikr circle is running this
                  Ṣaḥīḥ al-Bukhārī and Muslim       week."



A9.6.4 Source verification policy
Individual push notifications do not include the source chain (it would clutter the message
and push lengths are limited). Instead, every notification's detail view — visible when the




                                              Page 38


---

                                                             OnDeen V2 Functional Specification — Draft 4



user taps into the inbox — shows the full source. Additionally, a public-facing policy page
(accessible from settings and from the notification detail screen) states:
 "All hadith and Qurʾānic content in OnDeen notifications is curated and verified by our
scholar-in-residence. Sources are authenticated as sahih or hasan according to recognised
hadith classification. Full source chains are available on request for any notification you
receive."



A9.7 Notification settings and opt-out handling
  •​ Notifications default ON at onboarding (during the permission request splash screen,
     the ask is framed as "enable notifications so we can support your journey with timely
     reminders from the Qur'an and Sunnah").
  •​ Global notification opt-out available in the in-app Settings section. Per-axis granular
     opt-out is deferred to future versions.
  •​ When a user toggles notifications off: one soft confirmation at the moment of disable
     ("Before you turn these off — OnDeen notifications are your main connection to
     journey reminders. Continue?"). If they still disable, respect the choice.
  •​ After 4 weeks of continued disablement, an in-app banner appears on the home
     screen: "Turn on notifications to get the most out of OnDeen — gentle reminders from
     the Qur'an and Sunnah." Dismissible.
  •​ Banner repeats every 4 weeks — up to a maximum of 6 cycles (approximately 6
     months). After 6 re-prompts, the system stops showing the banner entirely. The user's
     disablement preference is respected permanently. The notifications toggle is always
     available in Settings.
  •​ If the user reinstalls the app or clears data, preference state is lost and defaults reapply
     (standard mobile app behaviour).



A9.8 The year-in-review — OnDeen Wrapped (V2.3+ roadmap)
Flagged here for roadmap context, not in V2.1 scope. Once the Radar has been live for
approximately a year, users will have accumulated enough data to power an annual
"OnDeen Wrapped" year-in-review summary — Spotify-Wrapped-style personalised
shareable content. Timed for December/January release.
Content: total hours per axis, tier progression, longest streak, certificates earned, badges
collected, most-attended subcategory, top event of the year, number of unique venues
attended. Shareable as image cards on social platforms. Users frame their year around
Islamic growth rather than vanity metrics — a legitimately powerful brand moment that will
not be delivered until V2.3+.
Not specced in detail here. Placeholder for future release planning.




                                            Page 39


---

                                                              OnDeen V2 Functional Specification — Draft 4




A9.9 UI/UX Considerations
  •​ Radar section on profile must feel alive — score changes animate when the user
     opens the profile after a new check-in.
  •​ Colour-band transitions trigger subtle celebratory moments in-app (bar filling up, gentle
     particle effect at band boundary). No alarming animations for drops.
  •​ Tooltip on each axis name explains what activities count (e.g. tapping the ⓘ next to
     "Tazkiyyah" shows the list from A9.2).
  •​ Notification inbox screen is the place where all hadith and Qurʾānic content lives
     long-term. Users may scroll their history to revisit a notification that resonated. This
     becomes a personal collection over time — worth flagging to design as the beginning
     of a "saved notifications" feature for a later version.



A9.10 Security Considerations
  •​ Axis hour totals are server-authoritative. Client displays what the server returns.
  •​ Hadith/Qurʾānic content library stored server-side with access controls — only
     scholar-approved entries can be added.
  •​ Notification delivery uses existing push infrastructure — no new security surface.
  •​ User opt-out state stored server-side (so preference survives device changes) in
     addition to the device-level OS notification permission.



A9.11 Testing Requirements
Unit tests
  •​ Axis score formula across edge cases (0 hours, target hours exact, >target hours,
     negative inputs rejected).
  •​ Tier-based target swapping: when a user crosses into a new tier, axis scores
     recalculate against the new targets.
  •​ 30-day rolling window: hours outside the window excluded from current score
     calculation.
  •​ Notification selection from library: correct axis tag, correct scenario tag, repetition
     avoidance within 30-day window.

Integration tests
  •​ End-to-end: attend event → axis hours increment → score recalculates → band
     transition triggers appropriate notification.
  •​ Tier-up: scores recalculate silently against new targets on next profile view.
  •​ Notification opt-out: push notifications stop immediately on disable; in-app banner
     appears after 4 weeks; banner stops after 6 cycles.

UI tests


                                             Page 40


---

                                                             OnDeen V2 Functional Specification — Draft 4



  •​ Radar display across device sizes; bar animations; tooltip accessibility.
  •​ Notification tap routes correctly to inbox, then to action screen.

Content tests
  •​ All library entries have valid source attribution. No weak or unverified hadith admitted.
  •​ Notification copy renders correctly with user first name substitution for edge cases
     (names with special characters, users with no first name set).




                                            Page 41


---

                                                                   OnDeen V2 Functional Specification — Draft 4




              PART B — V1 FEATURE ENHANCEMENTS
User stories with acceptance criteria for changes to features already documented in V1.
Each story references the relevant V1 section and describes only the delta.




B1. Event creation & management

  B1.1 · [P1] Release V2.0
  As an organiser, I want to save events as drafts in a clearly labelled "My Drafts"
  area within the organiser app, so that I can easily find and continue unfinished
  events without hunting through the app.
  Acceptance criteria:
     ✔​Drafts are accessible from the organiser dashboard home screen via a clearly labelled
        "Drafts" section or tab.
     ✔​Drafts show the event title (if entered), last-edited timestamp, and a visible draft indicator.
     ✔​Tapping a draft opens the event creation form with all previously entered data
        pre-populated.
     ✔​Drafts can be deleted individually with a confirmation prompt.
     ✔​Drafts sync across devices if the organiser logs in elsewhere.
     ✔​Existing drafts created in V1 migrate to the new location on first app open after V2
        upgrade.




  B1.2 · [P1] Release V2.0
  As an organiser, I want to duplicate a previously created event as the starting
  point for a new one, so that I don't have to re-enter every detail when running a
  recurring series or similar event.
  Acceptance criteria:
     ✔​On any published or past event, a "Duplicate" action is available.
     ✔​Duplicating opens the event creation form pre-filled with every field from the source event
        EXCEPT: start date, end date, check-in code (regenerated), and attendance records.
     ✔​The duplicated event is saved as a draft by default — organiser must review and publish.
     ✔​Images and uploaded materials are carried over by reference, not re-uploaded.
     ✔​A visible label indicates "Duplicated from [original event name]" for clarity.
     ✔​Certificate toggle state is carried over along with the speaker consent checkbox state —
        organiser re-confirms consent before publish.




  B1.3 · [P1] Release V2.0




                                                Page 42


---

                                                               OnDeen V2 Functional Specification — Draft 4




As an organiser, I want to make events recurring in the same way courses
currently are, so that I can set up weekly talks or monthly programmes without
creating each instance manually.
Acceptance criteria:
  ✔​Event creation form (V1 Section 2) surfaces a "Recurring" toggle for one-off event types.
  ✔​When enabled, recurrence options match the existing course recurrence model.
  ✔​Each occurrence is treated as its own session for check-in, XP, and feedback purposes.
  ✔​Users booking a recurring event book all occurrences; optional "book single session" if
     organiser enables.
  ✔​Organiser can cancel individual occurrences without affecting the series.
  ✔​Streaks (A1.5) apply to recurring events exactly as they do to courses.




B1.4 · [P0] Release V2.0
As an organiser, I want to edit the title of an event I have already created, from the
mobile app, so that I can fix typos or change branding without needing to log in to
the web dashboard.
Acceptance criteria:
  ✔​On any event in the organiser's event list (draft, published, ongoing), the title is tappable
     and opens an edit field.
  ✔​Edit is saved on field blur or explicit save action.
  ✔​Published events with bookings trigger a user notification: "[old title] has been renamed to
     [new title]."
  ✔​Edit history is logged (audit trail).




B1.5 · [P1] Release V2.0
As an organiser, I want to upload documents (PDFs or photos) to the materials
section of an event, so that attendees can access handouts, reading lists, or
supplementary material directly in the app.
Acceptance criteria:
  ✔​Event creation form (V1 Section 2, item 20 "Additional Content") extended to accept file
     uploads.
  ✔​Supported formats: PDF, JPG, PNG. Max 10MB per file.
  ✔​Up to 10 files per event.
  ✔​Files appear in the event details page under a "Materials" section for booked users.
  ✔​Users can download or open files in-app.
  ✔​Files can be removed or replaced by the organiser after publication.




                                             Page 43


---

                                                                OnDeen V2 Functional Specification — Draft 4




 B1.6 · [P2] Release V2.1
 As an organiser, I want to add a temporary guest speaker to an event without
 requiring them to create a full speaker account, so that I can feature external
 scholars for one-off talks without onboarding friction.
 Acceptance criteria:
   ✔​Event creation form surfaces an "Add temporary guest speaker" option alongside the
      existing speaker selection.
   ✔​Fields: name, qualification, description, photo (image upload).
   ✔​Temporary guest speaker data is stored with the event only — no speaker account
      created.
   ✔​Guest speaker displayed on event page with same visual treatment as registered
      speakers.
   ✔​Guest speakers do NOT see feedback directly (A2) — organisers export and share
      externally.
   ✔​Temporary guest speakers CANNOT trigger certificate issuance (certificate toggle is
      disabled when a temp speaker is selected — see A7.3.1).




B2. Course & class attendance

 B2.1 · [P1] Release V2.0
 As a user enrolled in a course, I want to see my attendance percentage for that
 course inside the app, so that I stay motivated to attend remaining sessions and
 know whether I'm on track for the completion bonus or certificate.
 Acceptance criteria:
   ✔​On the course's booking detail page, an attendance widget is displayed.
   ✔​Widget shows: sessions attended / total scheduled, percentage, and a visual bar.
   ✔​Widget indicates completion-bonus threshold (80%) with a marker on the bar.
   ✔​If the course has certificates enabled, widget also indicates the organiser-set certificate
      threshold with a second marker.
   ✔​If below 80% but still reachable: "X more sessions needed for full bonus."
   ✔​If irreversibly below 80%: widget shows partial-bonus (60%) threshold as achievable
      target.
   ✔​Widget updates after every check-in.




 B2.2 · [P1] Release V2.0




                                             Page 44


---

                                                             OnDeen V2 Functional Specification — Draft 4




 As an organiser, I want to pause a course and have the system automatically
 extend the course duration by the pause length, so that cancelled sessions don't
 punish attendees and the completion bonus remains achievable.
 Acceptance criteria:
   ✔​On any active course, a "Pause course" action is available in the organiser dashboard.
   ✔​Pausing requires a reason (free-text, displayed to booked users).
   ✔​Paused status communicated via push and email to all booked users.
   ✔​While paused: no sessions scheduled, no check-ins counted, no streak degradation from
      missed sessions.
   ✔​Organiser resumes from dashboard. Resume prompts for new end date (default: original
      end + pause duration) and new session schedule.
   ✔​Attendance percentages recalculate on completed sessions only — pause period does not
      count.
   ✔​Streak dimming does not occur for missed sessions during a pause.




B3. Notification & sharing

 B3.1 · [P0] Release V2.0
 As a user, I want links in my notification inbox to be tappable and open correctly,
 so that I can act on notifications that reference external websites, events, or app
 screens.
 Acceptance criteria:
   ✔​Any URL in notification body is automatically detected and rendered tappable.
   ✔​External URL → device default browser.
   ✔​OnDeen deep link → relevant in-app screen.
   ✔​Link detection handles http, https, and common URL shorteners.
   ✔​Non-URL text visually distinguishable from links.




 B3.2 · [P0] Release V2.0
 As a user, I want event sharing links to open the event directly in the app (or the
 web page with a booking CTA if the app isn't installed), so that sharing events
 with friends leads reliably to a bookable state.
 Acceptance criteria:
   ✔​Event share action (V1 Event Details Page, item 23) generates a deep-link URL.
   ✔​App installed: link opens event detail in-app.
   ✔​App not installed: link opens OnDeen web event page with "Open in app" and "Book as
      guest" (A3) buttons.




                                             Page 45


---

                                                                OnDeen V2 Functional Specification — Draft 4




   ✔​Guest booking possible without account creation from web page.
   ✔​Deep links tested across iOS and Android install states.




B4. UI polish

 B4.1 · [P1] Release V2.0
 As a user, I want consistent paragraph spacing and readable visual density on the
 main event details page (specifically the event description section), so that the
 most-read screen in the app doesn't feel sloppy.
 Acceptance criteria:
   ✔​Audit main event details page event description section for spacing inconsistencies.
   ✔​Paragraph spacing in event description follows a single typographic scale — no ad-hoc
      margins.
   ✔​Body text line-height consistent across the description block.
   ✔​Spacing between description heading and body text visually tighter than between separate
      description paragraphs.
   ✔​Fix applies to both iOS and Android builds.
   ✔​Companion task: spacing audit of other V1 screens by design team to identify V2.1
      targets. Not in V2.0 scope.




 B4.2 · [P1] Release V2.0
 As a user, I want visually polished onboarding splash screens for first-app-open,
 location permission, and notification permission, so that my first experience of
 OnDeen feels intentional and premium.
 Acceptance criteria:
   ✔​Three splash screens: feature walkthrough, location permission request, notification
      permission request.
   ✔​Copy is clear, warm, and explains why each permission matters for OnDeen's value.
   ✔​Visual design matches the existing app aesthetic (light lavender background, sunset
      gradient CTAs, deep purple secondary).
   ✔​User can skip permission requests without being nagged — app still functional (with
      degraded experience explained).




 B4.3 · [P1] Release V2.0




                                            Page 46


---

                                                                   OnDeen V2 Functional Specification — Draft 4




 As a user, I want a profile stats section on my profile showing my tier, streak
 flame, lifetime hours, longest streak, and earned certificates, so that I can see my
 progression at a glance and feel a sense of pride in my achievements.
 Acceptance criteria:
   ✔​New profile section surfaces the key gamification state at the top of the profile.
   ✔​Stats displayed: current tier + sub-level, current streak flame (visual), total classes
      attended, total lifetime hours learned, longest streak ever, count of earned certificates.
   ✔​Tier and streak visuals match the summary screen (same components).
   ✔​Tappable "My Certificates" entry surfaces the full certificate grid (see A7.4).
   ✔​Profile stats are visible to other users where profile is public (based on user privacy
      settings).




B5. User identity and privacy

 B5.1 · [P1] Release V2.0
 As a user (particularly sisters or users valuing privacy), I want an optional
 nickname that is shown to other users in public contexts instead of my real first
 and last name, so that I can participate in events and community features without
 having my full name visible to strangers.
 Acceptance criteria:
   ✔​New optional field "Nickname" is added to the profile setup flow and to profile settings.
   ✔​Field is clearly labelled with a visibility indicator next to it (e.g. an ⓘ icon and small text:
      "Visible to others instead of your real name").
   ✔​If nickname is set, it replaces the user's first+last name in all public-facing contexts:
      attendee lists on events and courses, certificates (default can be toggled per certificate),
      badge displays, and any future public social features.
   ✔​If nickname is blank, public contexts fall back to showing the user's first name (not
      first+last name).
   ✔​Real name (first and last) is preserved in the user's account and is used for: private
      notifications to the user (uses first name), payment/ticketing records, account recovery,
      admin-side records.
   ✔​The buddy system (V1 Organiser — Buddy Features) continues to use real name because
      it operates in trusted coordination contexts.
   ✔​Nickname uniqueness: nicknames do not need to be globally unique. Two users with the
      same nickname is acceptable.
   ✔​Character limits: 2–30 characters. No profanity filter in V2.0 — admin can intervene
      reactively.
   ✔​Existing V1 users at V2.0 upgrade: shown a one-time in-app message on first app open
      after the V2.0 update. Message explains the new feature and invites them to set a
      nickname if they wish. Non-blocking — they can dismiss and continue.




                                                Page 47


---

          OnDeen V2 Functional Specification — Draft 4




Page 48


---

                                                           OnDeen V2 Functional Specification — Draft 4




  PART C — TECHNICAL & CROSS-CUTTING CONCERNS

C1. Stripe Connect integration & wallet
P0   Release: V2.0

Overview
Replaces V1's manual wallet payout. Organisers connect Stripe accounts via Stripe
Connect; OnDeen becomes a platform on top. Paid event purchases split automatically:
OnDeen platform fee deducted, remainder transfers to organiser's connected Stripe account.
Removes manual payout work.



Scope
  •​ Onboarding: organiser connects Stripe from wallet section (OAuth redirect to Stripe
     Connect).
  •​ Fee configuration: OnDeen platform fee is configurable per event type or globally.
     Default percentage to be confirmed with finance — placeholder 10%.
  •​ Payment flow: user pays full ticket. Stripe handles split at payment time. Organiser
     sees net received; OnDeen sees fee in its Stripe account.
  •​ Fallback: organisers without Stripe connected cannot publish paid events — blocked
     with "Connect Stripe to accept payments."
  •​ Existing V1 wallet balances: one-off manual migration.



Out of scope for V2.0
  •​ Multi-currency beyond what Stripe handles natively.
  •​ Advanced organiser reporting dashboards (V2.1+ earliest).



Testing
  •​ Stripe test-mode: successful payment with split, failed payment, refund, partial refund,
     disputed charge.
  •​ Organiser disconnects mid-event: existing bookings honoured, future bookings
     blocked.




C2. Google Pay fix
P0   Release: V2.0




                                           Page 49


---

                                                              OnDeen V2 Functional Specification — Draft 4



Google Pay is currently non-functional. Bug-fix track. Scope: identify failure, fix, re-enable
end-to-end for all paid event flows (including guest booking — A3).
Test plan: full regression across iOS (Google Pay via web), Android (native), guest checkout.
Coordinate with Stripe Connect (C1) — Google Pay routes through Stripe.




C3. WhatsApp OTP with SMS fallback
 P1   Release: V2.0

Overview
V1 uses SMS OTP for sign-up and sign-in (V1 Section 1). Limits to regions with reliable SMS
(primarily UK). V2 adds WhatsApp OTP as the primary delivery channel with SMS fallback
— enables global sign-up.



Scope
  •​ Sign-up flow: user enters phone number → OTP delivered via WhatsApp → user
     enters code → account created. If WhatsApp delivery fails within 30 seconds,
     automatically fall back to SMS with user-facing status: "Sending via SMS instead."
  •​ Sign-in existing device: biometric (Face ID / Touch ID / fingerprint) OR app remembers
     user with refresh token (30 day validity). Phone number not required for routine sign-in.
  •​ Sign-in new device / 2FA: phone number + OTP (WhatsApp primary, SMS fallback).
  •​ Provider selection: devs to evaluate Twilio or MessageBird. Criteria: WhatsApp
     Business API reliability, SMS fallback quality, per-message cost, coverage in target
     countries (UK + key diaspora markets).



Functional requirements
  •​ OTP: 6 digits, valid for 5 minutes, single-use.
  •​ Rate limit: max 3 OTP sends per phone number per 15 minutes.
  •​ WhatsApp message template pre-approved through Business API (required by
     WhatsApp before sending).
  •​ SMS fallback engages automatically after 30-second WhatsApp delivery timeout or
     WhatsApp delivery failure.
  •​ User-facing status updates: "Sending code via WhatsApp…" → "Code sent" or
     "Sending via SMS instead."



Security considerations



                                             Page 50


---

                                                            OnDeen V2 Functional Specification — Draft 4



  •​ OTP generation server-side via cryptographic RNG.
  •​ Failed OTP attempts logged; 5 failures locks the phone number for 15 minutes.
  •​ Phone numbers stored encrypted at rest.



Testing
  •​ Unit: OTP generation, expiry, single-use.
  •​ Integration: WhatsApp delivery success; SMS fallback on WhatsApp failure; rate
     limiting; lockout.
  •​ UX: status copy clear during delivery switch.




C4. Analytics instrumentation
 P1   Release: V2.0

Overview
V2 must ship with analytics instrumentation. Without this the V2.0 → V2.1 iteration loop is
blind. Promoted from P2 to P1 given the 6-month PMF window.



Minimum event schema
  •​ user_opened_app, user_session_start, user_session_end
  •​ event_booked, event_checked_in, event_checked_out
  •​ xp_earned (with: amount, source, difficulty_multiplier_applied,
     streak_multiplier_applied)
  •​ level_up_occurred, tier_change_occurred
  •​ streak_started, streak_advanced, streak_dimmed, streak_reset
  •​ summary_screen_viewed, summary_screen_skipped, summary_screen_completed
  •​ feedback_submitted, feedback_skipped
  •​ guest_booking_started, guest_booking_completed, guest_migrated_to_account
  •​ certificate_issued, certificate_viewed, certificate_shared
  •​ challenge_started, challenge_progressed, challenge_completed (V2.2+)
  •​ online_checkin_attempted, online_checkin_succeeded, online_checkin_failed



Platform recommendation
  •​ Mixpanel or Amplitude — both support cohort analysis and funnel visualisation.
  •​ Event schema defined centrally before instrumentation to prevent inconsistent naming.


                                           Page 51


---

                                                            OnDeen V2 Functional Specification — Draft 4



  •​ PII (email, mobile, name) MUST NOT be in analytics event properties.



Key funnels to instrument for V2.0 launch
  •​ Book → attend → see summary → next app open → next book. Core engagement
     loop.
  •​ First session → second session → third session. Retention drop-off.
  •​ Streak build: session 1 through 8 (full flame). Where do users fall off?
  •​ Guest booking → account migration. Conversion rate.
  •​ Difficulty warning shown → book anyway vs see beginner courses. Soft-gating
     effectiveness.




                                           Page 52


---

                                                           OnDeen V2 Functional Specification — Draft 4




                                   APPENDICES

Appendix A — Tier information-icon copy
Copy displayed when user taps ⓘ next to tier name. Marked PENDING SCHOLAR REVIEW
— Arabic equivalents and framing subject to Ibrahim's rulings.



Seeker
  •​ Arabic: ‫( طالب‬Ṭālib)
  •​ Meaning: One who seeks knowledge.
  •​ Note: "Whoever takes a path in search of knowledge, Allah will ease for them a path to
     Paradise" (Ṣaḥīḥ Muslim). The humble self-description of every student of Islam.


Voyager
  •​ Arabic: ‫( راحل‬Rāhil) — pending scholar confirmation
  •​ Meaning: One on a journey.
  •​ Note: You have moved from first steps into a sustained journey. The learning is long;
     the consistency is the point.


Pathfinder
  •​ Arabic: ‫( دليل‬Dalīl) — pending scholar confirmation
  •​ Meaning: One who has found the path and can guide others.
  •​ Note: A pathfinder is someone who has walked far enough to know the way. This tier
     honours years of commitment and the capacity to help others begin.


Expansion tiers (V2.2+): Pioneer (levels 31–40) and a fifth tier at 41–50. Names and Arabic
equivalents to be finalised before that release.




                                           Page 53


---

                                                          OnDeen V2 Functional Specification — Draft 4




Appendix B — Subcategory map DRAFT (reference for
organiser form validation)
Subcategories currently supported by OnDeen. Each event/course has a subcategory set by
the organiser at creation. Certificate templates will be designed per subcategory (A7.5.2).



                                       Journey
           Subcategory                                                   Notes
                                        levels

               Tafsīr                     All        Academic study of Qurʾānic meaning

     Quran — Memorisation &
                                          All        Includes Tajwīd sub-branches
           Recitation

        Quran — Tadabbur                  All        Reflection and contemplation

           Fiqh (general)                 All        Jurisprudence

     Fiqh (specific madhab —
                                          All        Madhab-specific
         Hanafi/Shafi/etc)

          Arabic language                 All        Language acquisition

               Sīrah                      All        Prophetic biography

              ʿAqīdah                     All        Theology and creed

          Islamic history                 All        Historical study

          Hadith sciences            Intermediate+   Methodology

     Hajj / Umrah programme               All        Worship journey preparation

       Ramadan programme                  All        Worship season programme

        Dhikr / adhkār circle             All        Remembrance practice

      Purification of the heart           All        Tazkiyat al-nafs texts and courses

          Worship retreat                 All        Iʿtikāf, night-prayer programmes

        Cycling / sports day              All        Physical activity

            Martial arts                  All        Physical training

     Health & wellbeing retreat           All        Body as amānah

      Fundraiser / charity gala           All        Sadaqah / fundraising

         Volunteering day                 All        Community service

        Sadaqah campaign                  All        Charitable giving

    Community service project             All        Service




                                          Page 54


---

                                                           OnDeen V2 Functional Specification — Draft 4



The subcategory-to-life-axis mapping is deferred to V2.2+ when the life-axis radar ships. In
the meantime, subcategories are used only for: event categorisation in the explore tab,
certificate template selection (A7), challenge qualifying activities (A8).




                                           Page 55


---

                                                       OnDeen V2 Functional Specification — Draft 4




Appendix C — Full XP thresholds (levels 1–30)
Computed from: XP to advance from level N to N+1 = 100 × N^1.5 (rounded). Dev team
lookup table.



   Level     XP for this level       Cumulative XP                  Tier at this level

     1             100                    100               Seeker 1

     2             283                    383               Seeker 2

     3             520                    903               Seeker 3

     4             800                   1,703              Seeker 4

     5            1,118                  2,821              Seeker 5

     6            1,470                  4,291              Seeker 6

     7            1,852                  6,143              Seeker 7

     8            2,263                  8,406              Seeker 8

     9            2,700                  11,106             Seeker 9

    10            3,162                  14,268             Seeker 10

    11            3,648                  17,916             Voyager 1

    12            4,157                  22,073             Voyager 2

    13            4,687                  26,760             Voyager 3

    14            5,238                  31,998             Voyager 4

    15            5,809                  37,807             Voyager 5

    16            6,400                  44,207             Voyager 6

    17            7,009                  51,216             Voyager 7

    18            7,637                  58,853             Voyager 8

    19            8,282                  67,135             Voyager 9

    20            8,944                  76,079             Voyager 10

    21            9,623                  85,702             Pathfinder 1

    22            10,319                 96,021             Pathfinder 2

    23            11,030                107,051             Pathfinder 3

    24            11,758                118,809             Pathfinder 4

    25            12,500                131,309             Pathfinder 5




                                        Page 56


---

                                                           OnDeen V2 Functional Specification — Draft 4




   Level       XP for this level         Cumulative XP                  Tier at this level

     26             13,257                  144,566             Pathfinder 6

     27             14,030                  158,596             Pathfinder 7

     28             14,816                  173,412             Pathfinder 8

     29             15,617                  189,029             Pathfinder 9

     30             16,432                  205,461             Pathfinder 10


Timings summary for casual user (1 × 2-hour class per week, no streak, Beginner difficulty):
  •​ Seeker 5 reached at ~6 months (target set by product owner)
  •​ Seeker 10 reached at ~3 years
  •​ Voyager 10 reached at ~7+ years
  •​ Pathfinder 10 reached: lifetime-level commitment


Timings for committed user (2 classes/week + monthly course + full flame):
  •​ Seeker 10 reached at ~6 months
  •​ Voyager 10 reached at ~2 years
  •​ Pathfinder 10 reached at ~4–5 years


Timings for dedicated student (4 courses/month + full flame + frequent Advanced difficulty):
  •​ Seeker 10 reached at ~2 months
  •​ Voyager 10 reached at ~10 months
  •​ Pathfinder 10 reached at ~2 years




                                           Page 57


---

                                                            OnDeen V2 Functional Specification — Draft 4




Appendix D — V1 cross-reference index
Every V2 section and its corresponding V1 reference.



    V2 section            V1 section(s) referenced                      Relationship

  A1. Gamification                                         Fully supersedes — V1 gamification
                     V1 Section 13 (Awards and Levels)
      Module                                               deprecated

  A1. Gamification     V1 User Section 12 (User Profile    V2 adds tier, streak displays to
      Module                       Page)                   existing profile

  A1. Gamification    V1 Event Section 5 (Event Details    V2 check-in flow builds on existing
      Module                      Page)                    booking page

   A2. Session
                          New — no V1 precedent            —
 Feedback Screen

    A3. Guest                                              V2 adds third path: continue as
                     V1 User Section 1 (Sign-In/Sign-Up)
   Booking Flow                                            guest

    A3. Guest         V1 Event Section 5 (Event Details
                                                           V2 adds guest booking option
   Booking Flow                   Page)

    A4. Online         V1 Event Section 7 (Subscribed      V2 replaces GPS with code entry for
  Check-in Codes               Event Details)              online sessions

    A4. Online        V1 Organiser — Announcements         V2 uses existing announcements for
  Check-in Codes                  system                   code distribution

    A4. Online        V1 Organiser Section 5 (QR Code      V2 adds code display to organiser
  Check-in Codes                 Scanner)                  session management

  A5. Notification
                             V1 notification inbox         V2 enhances rendering
   Link Handling

    A6. Editable        V1 Organiser Section 3 (Event
                                                           V2 extends to mobile app
    Event Titles               Management)

  A7. Certificates   V1 Section 13 (Awards and Levels)     V2 adds certificate concept

                       V1 User Section 12 (User Profile
  A7. Certificates                                         V2 adds My Certificates section
                                   Page)

                       V1 Organiser Section 2 (Upload      V2 adds certificate toggle + consent
  A7. Certificates
                                  Event)                   UX

                        V1 Organiser App — Speaker         V2 speaker-led event certificate
  A7. Certificates
                            Features Section 2             authorisation

  A8. Seasonal &
      Rolling             New — no V1 precedent            V2.2+ feature
   Challenges

    A9. OnDeen         V1 User Section 12 (User Profile    V2 adds four-axis balance
      Radar                        Page)                   visualisation




                                            Page 58


---

                                                         OnDeen V2 Functional Specification — Draft 4




   V2 section         V1 section(s) referenced                       Relationship

  A9. OnDeen                                            V2 hadith notifications use existing
                         V1 notification inbox
    Radar                                               inbox for detail view

                    V1 Organiser Section 2 (Upload      Extends base upload with new
   B1.1–B1.6
                           Event Feature)               options

                    V1 Organiser Section 3 (Event       Adds pause/resume, attendance
   B2.1–B2.2
                           Management)                  view

      B3.1               V1 notification inbox          Clickable link handling

                   V1 Event Section 5 (Event Details
      B3.2                                              Deep-link-capable shares
                             Page) #23

                                                        Polish scoped to event description
      B4.1              V1 Event Details Page
                                                        section

      B4.2                V1 onboarding flow            Splash screen designs

                   V1 User Section 12 (User Profile
      B4.3                                              Profile stats section
                               Page)

                                                        Adds optional nickname for public
 B5.1 Nickname      V1 profile setup + attendee lists
                                                        display

   C1. Stripe       V1 Organiser Section 4 (Wallet
                                                        Replaces manual wallet
   Connect                 Management)

 C2. Google Pay            V1 payment flow              Bug fix

 C3. WhatsApp
                  V1 User Section 1 (Sign-In/Sign-Up)   Adds primary channel with fallback
      OTP

  C4. Analytics        New — no V1 precedent            —




Appendix E — Gamification Reference Image



                                         Page 59


---

          OnDeen V2 Functional Specification — Draft 4




Page 60


---

          OnDeen V2 Functional Specification — Draft 4




Page 61


---
