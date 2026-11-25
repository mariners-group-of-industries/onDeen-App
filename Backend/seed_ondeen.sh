#!/usr/bin/env bash
set -euo pipefail

backend_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$backend_dir/.." && pwd)"
mode="${1:-local}"
seed_profile="${2:-${ONDEEN_SEED_PROFILE:-basic}}"

case "$seed_profile" in
  basic|complete|advanced|refs)
    ;;
  *)
    echo "Unknown seed profile: $seed_profile" >&2
    echo "Use: basic, complete, advanced, or refs." >&2
    exit 1
    ;;
esac

load_env_file() {
  local env_file="$backend_dir/.env"
  if [ -f "$env_file" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$env_file"
    set +a
  fi
}

detect_lan_ip() {
  local ip_address
  ip_address="$(
    ip -4 route get 1.1.1.1 2>/dev/null |
      sed -nE 's/.* src ([0-9.]+).*/\1/p' |
      head -n1
  )"

  if [ -z "$ip_address" ]; then
    ip_address="$(hostname -I 2>/dev/null | awk '{print $1}')"
  fi

  if [ -z "$ip_address" ] && [ "$(uname -s)" = "Darwin" ]; then
    ip_address="$(ipconfig getifaddr en0 2>/dev/null || true)"
  fi

  if [ -z "$ip_address" ] && [ "$(uname -s)" = "Darwin" ]; then
    ip_address="$(ipconfig getifaddr en1 2>/dev/null || true)"
  fi

  if [ -z "$ip_address" ] && [ "$(uname -s)" = "Darwin" ]; then
    ip_address="$(
      ifconfig 2>/dev/null |
        awk '/inet / && $2 !~ /^127\./ {print $2; exit}'
    )"
  fi

  printf '%s\n' "$ip_address"
}

case "$mode" in
  local|railway|prod|production)
    ;;
  -h|--help)
    cat <<'EOF'
Usage:
  ./seed.sh local [basic|complete|advanced|refs]
  ./scripts/seed_railway.sh [basic|complete|advanced|refs]

This script resets the target database and seeds the standard OnDeen test data.
Local mode is the default. Railway mode is destructive and must run inside the
Railway API container through ./scripts/seed_railway.sh.

Seed profiles:
  basic    Default. Seeds reference data, users, 5 events, 2 user bookings, and
           one guest booking. User gamification/profile XP remains 0.
  complete Seeds the basic data plus gamification XP, feedback, online check-in
           codes, and notification links.
  advanced Alias for complete; use it for fuller QA/demo data.
  refs     Product-owner reference dataset: visible names, speakers,
           participants, listings, schedules, notes and notifications. Paid
           records stay deferred. Reference image crops are seed-only assets.

The organizer seed events use ONDEEN_SEED_EVENT_BASE_DATE (default:
2026-06-20). Change that ISO date before reseeding if you want the seed events
to stay in a different future window across June 20, 21, and 22.
EOF
    exit 0
    ;;
  *)
    echo "Unknown seed mode: $mode" >&2
    exit 1
    ;;
esac

python_bin="python3"
if [ -x "$backend_dir/.venv/bin/python" ]; then
  python_bin="$backend_dir/.venv/bin/python"
elif [ -f "$backend_dir/.venv/Scripts/python.exe" ]; then
  # Windows (Git Bash) virtualenv layout.
  python_bin="$backend_dir/.venv/Scripts/python.exe"
elif [ "$mode" = "local" ]; then
  echo "Missing backend venv at $backend_dir/.venv" >&2
  exit 1
fi

cd "$backend_dir"

if [ "$mode" = "local" ]; then
  load_env_file
fi
export ONDEEN_SEED_PROFILE="$seed_profile"
lan_ip="$(detect_lan_ip)"

if [ "$mode" = "local" ]; then
  export ONDEEN_LOCAL="${ONDEEN_LOCAL:-1}"
  export ENV="${ENV:-local}"
  export DATABASE_URL="${DATABASE_URL:-sqlite:///ondeen-local.db}"
  export RATELIMIT_STORAGE_URI="${RATELIMIT_STORAGE_URI:-memory://}"
  export ENABLE_SCHEDULER="${ENABLE_SCHEDULER:-false}"
  export SMS_SEND_ENABLED="${SMS_SEND_ENABLED:-false}"
  export ONDEEN_TEST_OTP_ENABLED="${ONDEEN_TEST_OTP_ENABLED:-true}"
  export ONDEEN_TEST_OTP_CODE="${ONDEEN_TEST_OTP_CODE:-123456}"
  export ONDEEN_SEED_BASE_URL="${ONDEEN_SEED_BASE_URL:-http://${lan_ip:-127.0.0.1}:${FLASK_RUN_PORT:-8088}}"
else
  export ONDEEN_LOCAL="${ONDEEN_LOCAL:-0}"
  export ENV="${ENV:-production}"
  export ENABLE_SCHEDULER="${ENABLE_SCHEDULER:-false}"
  export RATELIMIT_STORAGE_URI="${RATELIMIT_STORAGE_URI:-${REDIS_URL:-memory://}}"
  export SMS_SEND_ENABLED="${SMS_SEND_ENABLED:-false}"
  export ONDEEN_TEST_OTP_ENABLED="${ONDEEN_TEST_OTP_ENABLED:-true}"
  export ONDEEN_TEST_OTP_CODE="${ONDEEN_TEST_OTP_CODE:-123456}"
  export UPLOAD_ROOT="${UPLOAD_ROOT:-/data/uploads}"
  export ONDEEN_SEED_BASE_URL="${ONDEEN_SEED_BASE_URL:-${PUBLIC_BASE_URL:-${RAILWAY_STATIC_URL:-}}}"

  if [ ! -d /data ] && [ "${ONDEEN_ALLOW_HOST_RAILWAY_SEED:-}" != "1" ]; then
    echo "Railway seed mode must run inside the Railway API container." >&2
    echo "From this laptop run: ./scripts/seed_railway.sh" >&2
    exit 1
  fi

  if [ "${ONDEEN_CONFIRM_RESET:-}" != "railway" ]; then
    if [ -t 0 ]; then
      echo "WARNING: this will reset the Railway/non-local database."
      read -r -p "Type railway to continue: " answer
      if [ "$answer" = "railway" ]; then
        export ONDEEN_CONFIRM_RESET=railway
      else
        echo "Seed cancelled."
        exit 0
      fi
    else
      echo "Refusing to reset a non-local database." >&2
      echo "From this laptop run: ./scripts/seed_railway.sh." >&2
      exit 1
    fi
  fi

  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is required for Railway seed mode." >&2
    exit 1
  fi

  if [ -z "${ONDEEN_SEED_BASE_URL:-}" ]; then
    echo "ONDEEN_SEED_BASE_URL or PUBLIC_BASE_URL is required for Railway seed mode." >&2
    exit 1
  fi
fi

"$python_bin" - <<'PY'
import base64
import os
import shutil
from datetime import date, datetime, time, timedelta
from pathlib import Path

from sqlalchemy import text
from werkzeug.security import generate_password_hash

from wsgi import app
from app import db

# Import all model modules so drop_all/create_all sees the complete metadata.
from app.models import admin, category, event, gamification, guest_booking, online_checkin, organization, speakers, users, wishlist  # noqa: F401
from app.models.category import Category, SubCategory
from app.models.event import (
    Event,
    EventDate,
    EventDateTime,
    EventFacilities,
    EventGuestBookingSetting,
    EventImages,
    EventTags,
    Facilities,
    JourneyLevel,
    Participant,
    ParticipantsAttendance,
    Tag,
)
from app.models.gamification import GamificationXpLog, SessionFeedback
from app.models.guest_booking import GuestBooking
from app.models.online_checkin import OnlineSessionCheckInCode
from app.models.organization import (
    Organization,
    OrganizationType,
    OrganizerCategory,
    OrganizerSubCategory,
    SchoolOfThought,
    SectType,
)
from app.models.users import Notification_History, Users
from app.services.customer.event import EventService
from app.services.customer.gamification import GamificationService

BASE_URL = os.environ["ONDEEN_SEED_BASE_URL"].strip().rstrip("/")
if BASE_URL and "://" not in BASE_URL:
    BASE_URL = f"https://{BASE_URL}"
SEED_PROFILE = os.getenv("ONDEEN_SEED_PROFILE", "basic").strip().lower()
ROOT = Path.cwd().parent
BACKEND_SEED_ASSETS = Path.cwd() / "seed_assets"
MOBILE_SEED_ASSETS = ROOT / "OnDeenUser" / "src" / "assets" / "images"
IS_LOCAL = os.getenv("ONDEEN_LOCAL", "1") == "1"
if IS_LOCAL:
    UPLOAD_DIR = Path.cwd() / "app" / "static" / "uploads" / "seed"
    UPLOAD_PUBLIC_PATH = "static/uploads/seed"
else:
    UPLOAD_DIR = Path(os.getenv("UPLOAD_ROOT", "/data/uploads")) / "seed"
    UPLOAD_PUBLIC_PATH = "uploads/seed"
IMAGE_SOURCES = [
    (BACKEND_SEED_ASSETS / "eventDetails.png", MOBILE_SEED_ASSETS / "eventDetails.png"),
    (BACKEND_SEED_ASSETS / "image37.png", MOBILE_SEED_ASSETS / "image37.png"),
    (BACKEND_SEED_ASSETS / "dummy1.png", MOBILE_SEED_ASSETS / "dummy1.png"),
    (BACKEND_SEED_ASSETS / "BG.png", MOBILE_SEED_ASSETS / "BG.png"),
]
TINY_PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000a49444154789c6360000002000154a24f5d00000000"
    "49454e44ae426082"
)


def add(obj):
    db.session.add(obj)
    db.session.flush()
    return obj


def reset_database():
    if not IS_LOCAL and os.getenv("ONDEEN_CONFIRM_RESET") != "railway":
        raise RuntimeError("Refusing to reset non-local database without ONDEEN_CONFIRM_RESET=railway")

    bind = db.session.get_bind()
    dialect = bind.dialect.name if bind else "unknown"
    if dialect == "mysql":
        db.session.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        db.drop_all()
        db.session.execute(text("SET FOREIGN_KEY_CHECKS=1"))
    else:
        db.drop_all()
    db.create_all()
    db.session.commit()
    return dialect


def ensure_image_files():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    urls = []
    for index, sources in enumerate(IMAGE_SOURCES, start=1):
        target = UPLOAD_DIR / f"ondeen-seed-event-{index}.png"
        source = next((candidate for candidate in sources if candidate.exists()), None)
        if source is not None:
            shutil.copyfile(source, target)
        else:
            target.write_bytes(TINY_PNG)
        urls.append(f"{BASE_URL}/{UPLOAD_PUBLIC_PATH}/{target.name}")
    return urls


def seed_reference_data(image_urls):
    sect = add(SectType(title="Sunni", ar_title="Sunni", position=1, status=1))
    school = add(SchoolOfThought(title="General", ar_title="General", position=1, status=1))
    add(OrganizationType(title="Community Organisation", ar_title="Community Organisation", position=1, status=1))

    levels = []
    for position, title in enumerate(["Suitable for all", "New Muslim", "Beginner", "Intermediate", "Advanced"]):
        kwargs = {"id": 0} if position == 0 else {}
        levels.append(add(JourneyLevel(
            **kwargs,
            title=title,
            ar_title=title,
            sub_title=f"{title} journey level",
            ar_sub_title=f"{title} journey level",
            status=1,
        )))

    tags = []
    for position, title in enumerate(["Free", "Beginner friendly", "Family", "Youth", "Sisters", "Brothers", "Weekend", "Online"], start=1):
        tags.append(add(Tag(title=title, ar_title=title, position=position, status=1)))

    facilities = []
    for position, title in enumerate(["Prayer Space", "Wheelchair Access", "Parking", "Refreshments", "Child Friendly"], start=1):
        facilities.append(add(Facilities(title=title, ar_title=title, position=position, status=1)))

    category_specs = [
        ("Community Services", ["General Support", "Charity & Volunteering", "Family Activities"]),
        ("Courses", ["Tafsir", "Quran Recitation", "Arabic Language", "Seerah", "Fiqh"]),
        ("Tours", ["Hajj / Umrah Programme", "Worship Retreat", "Islamic History Trip"]),
    ]
    categories = {}
    for position, (title, sub_titles) in enumerate(category_specs, start=1):
        cat = add(Category(
            title=title,
            ar_title=title,
            image=image_urls[(position - 1) % len(image_urls)],
            position=position,
            status=1,
            home_view=True,
            is_material=1,
            is_speaker=1,
            is_curriculum=1,
            is_itinerary=1,
            is_tourslot=1,
        ))
        categories[title] = cat

    return sect, school, levels, tags, facilities, categories, category_specs


def seed_subcategories(creator_id, categories, category_specs):
    subcategories = {}
    for _, (title, sub_titles) in enumerate(category_specs, start=1):
        cat = categories[title]
        for sub_position, sub_title in enumerate(sub_titles, start=1):
            sub = add(SubCategory(
                category_id=cat.id,
                title=sub_title,
                ar_title=sub_title,
                image=cat.image,
                position=sub_position,
                status=1,
                created_by=creator_id,
                updated_by=creator_id,
            ))
            subcategories[(title, sub_title)] = sub

    return subcategories


def seed_users(sect, school, levels):
    password_hash = generate_password_hash("123456", method="pbkdf2:sha256")
    profile_image = f"{BASE_URL}/{UPLOAD_PUBLIC_PATH}/ondeen-seed-event-1.png"

    organizer = add(Users(
        role_type=3,
        first_name="Organizer",
        last_name="",
        country_code="+44",
        mobile_number="612345678",
        email_id="org@gmail.com",
        password=password_hash,
        status=1,
        profile_image=profile_image,
        journey_level_id=levels[0].id if levels else None,
        time_zone=os.getenv("d_t_z", "Africa/Casablanca"),
    ))

    customer = add(Users(
        role_type=2,
        first_name="User",
        last_name="Profile",
        country_code="+44",
        mobile_number="633223322",
        email_id="user@gmail.com",
        password=password_hash,
        status=1,
        profile_image=profile_image,
        journey_level_id=levels[0].id if levels else None,
        time_zone=os.getenv("d_t_z", "Africa/Casablanca"),
    ))

    add(Organization(
        user_id=organizer.id,
        organization_name="Organizer",
        manager_name="Organizer",
        location="London, United Kingdom",
        latitude=51.5072,
        longitude=-0.1276,
        foundation_date=date(2024, 1, 1),
        post_code="SE1 1AA",
        sect_representation=sect.id,
        school_thought=school.id,
        charity_registered=False,
        charity_no="",
        status=1,
        verify_event=1,
        created_by=organizer.id,
        updated_by=organizer.id,
        about_us="Seed organiser profile for local testing.",
    ))

    return organizer, customer


def seed_organizer_categories(organizer, categories):
    for cat in categories.values():
        organizer_category = add(OrganizerCategory(
            user_id=organizer.id,
            category_id=cat.id,
            status=1,
            created_by=organizer.id,
            updated_by=organizer.id,
        ))
        for sub in SubCategory.query.filter_by(category_id=cat.id, status=1).all():
            add(OrganizerSubCategory(
                organizer_category_id=organizer_category.id,
                subcategory_id=sub.id,
                status=1,
                created_by=organizer.id,
                updated_by=organizer.id,
            ))


def seed_events(organizer, levels, tags, facilities, categories, subcategories, image_urls):
    event_specs = [
        ("Seed: Friday Community Iftar", "Community Services", "Family Activities", "London Islamic Centre", 1),
        ("Seed: Beginner Quran Circle", "Courses", "Quran Recitation", "Online Zoom", 0),
        ("Seed: Youth Volunteering Morning", "Community Services", "Charity & Volunteering", "Community Hall", 1),
        ("Seed: Tafsir Night", "Courses", "Tafsir", "East London Mosque", 1),
        ("Seed: Hajj Preparation Session", "Tours", "Hajj / Umrah Programme", "Travel Office", 1),
    ]
    seed_day_offsets = [0, 0, 1, 1, 2]
    base_date = resolve_seed_base_date()
    created_events = []

    for index, (title, category_title, sub_title, location, location_type) in enumerate(event_specs):
        cat = categories[category_title]
        sub = subcategories[(category_title, sub_title)]
        start_day = base_date + timedelta(days=seed_day_offsets[index])
        start_clock = time(18 + (index % 3), 0)
        end_clock = time(20 + (index % 3), 0)
        image_url = image_urls[index % len(image_urls)]
        event_type = 3 if cat.title == "Tours" else 2 if cat.title == "Courses" else 1

        event_obj = add(Event(
            user_id=organizer.id,
            title=title,
            ar_title=title,
            category_id=cat.id,
            sub_category_id=sub.id,
            description=f"{title.replace('Seed: ', '')} created by the local OnDeen seed script.",
            ar_description=f"{title.replace('Seed: ', '')} created by the local OnDeen seed script.",
            start_date=datetime.combine(start_day, time.min),
            end_date=datetime.combine(start_day, time.min),
            start_time=start_clock,
            end_time=end_clock,
            event_type=event_type,
            location=location,
            latitude=51.5072 if location_type == 1 else 0,
            longitude=-0.1276 if location_type == 1 else 0,
            location_type=location_type,
            meet_link="https://meet.google.com/ondeen-seed" if location_type == 0 else None,
            price_type=0,
            price=0,
            journey_level_id=levels[index % len(levels)].id if levels else None,
            gender=0,
            total_no_class=1,
            duration=2,
            available=80,
            booked=0,
            quantity_per_user=5,
            ticket_type=0,
            qrcode_type=0,
            occusr_type=1,
            rule="Please arrive on time and follow organiser guidance.",
            ar_rule="Please arrive on time and follow organiser guidance.",
            eligibility="Open to the community.",
            ar_eligibility="Open to the community.",
            cancellation_policy="Cancel from the app if you can no longer attend.",
            ar_cancellation_policy="Cancel from the app if you can no longer attend.",
            terms_condition="Respect the venue and other attendees.",
            ar_terms_condition="Respect the venue and other attendees.",
            status=1,
            created_by=organizer.id,
            updated_by=organizer.id,
            time_zone=os.getenv("d_t_z", "Africa/Casablanca"),
        ))
        event_obj.share_url = f"{BASE_URL}/open?id={event_obj.id}"
        add(EventGuestBookingSetting(event_id=event_obj.id, enabled=True, created_by=organizer.id, updated_by=organizer.id))
        add(EventImages(event_id=event_obj.id, full_screen_image=image_url, cropped_image=image_url, status=1, created_by=organizer.id, updated_by=organizer.id))
        for tag in (tags[index % len(tags)], tags[(index + 1) % len(tags)]):
            add(EventTags(event_id=event_obj.id, tag_id=tag.id, status=1, created_by=organizer.id, updated_by=organizer.id))
        for facility in facilities[:2]:
            add(EventFacilities(event_id=event_obj.id, facilities_id=facility.id, status=1, created_by=organizer.id, updated_by=organizer.id))

        event_date = add(EventDate(event_id=event_obj.id, date=start_day, status=1, created_by=organizer.id, updated_by=organizer.id))
        add(EventDateTime(
            event_date_id=event_date.id,
            start_time=start_clock,
            end_time=end_clock,
            available=80,
            booked=0,
            status=1,
            created_by=organizer.id,
            updated_by=organizer.id,
        ))
        created_events.append(event_obj)

    return created_events


def resolve_seed_base_date():
    raw = os.getenv("ONDEEN_SEED_EVENT_BASE_DATE", "2026-06-20").strip()
    try:
        base_date = date.fromisoformat(raw)
    except ValueError as exc:
        raise RuntimeError(
            "ONDEEN_SEED_EVENT_BASE_DATE must be an ISO date in YYYY-MM-DD format"
        ) from exc
    if base_date < date.today():
        raise RuntimeError(
            f"ONDEEN_SEED_EVENT_BASE_DATE={base_date.isoformat()} is in the past. "
            "Set it to a future ISO date before reseeding Railway."
        )
    return base_date


def seed_bookings(customer, events):
    booked = []
    for event_obj in events[:2]:
        payload = {"event_id": event_obj.id, "quantity": 1}
        if event_obj.category_id == 3:
            slot = (
                EventDateTime.query
                .join(EventDate, EventDate.id == EventDateTime.event_date_id)
                .filter(EventDate.event_id == event_obj.id, EventDateTime.status == 1)
                .first()
            )
            payload["date_time_id"] = slot.id

        with app.test_request_context(headers={"Timezone": os.getenv("d_t_z", "Africa/Casablanca")}):
            response = EventService.add_participant(customer.id, payload)
        if isinstance(response, tuple):
            body, status_code = response
            if status_code >= 400 or body.get("status") is False:
                raise RuntimeError(f"Booking seed failed for event {event_obj.id}: {body}")
            response = body
        if isinstance(response, dict) and response.get("status") is False:
            raise RuntimeError(f"Booking seed failed for event {event_obj.id}: {response}")
        booked.append(response["participant_id"] if isinstance(response, dict) else response)
    return booked


def seed_gamification(customer, booked_participant_ids):
    """Add a small visible XP/feedback state without creating a heavy seed."""
    if len(booked_participant_ids) < 1:
        return [], 0

    participant = db.session.get(Participant, booked_participant_ids[0])
    if not participant:
        return [], 0

    today = datetime.now().date()
    summaries = []
    for offset in range(2, 0, -1):
        attendance_date = today - timedelta(days=offset)
        attendance = (
            ParticipantsAttendance.query
            .filter_by(participant_id=participant.id, attendance_date=attendance_date)
            .first()
        )
        if not attendance:
            attendance = ParticipantsAttendance(
                participant_id=participant.id,
                event_id=participant.event_id,
                attendance_date=attendance_date,
                status=1,
                created_on=datetime.now(),
                updated_on=datetime.now(),
            )
            db.session.add(attendance)
            db.session.flush()
        else:
            attendance.status = 1
            attendance.updated_on = datetime.now()
            db.session.flush()

        summaries.append(GamificationService.award_check_in(customer.id, attendance))

    logs = (
        GamificationXpLog.query
        .filter_by(user_id=customer.id)
        .order_by(GamificationXpLog.created_on.asc(), GamificationXpLog.id.asc())
        .all()
    )
    for log in logs[:-1]:
        log.summary_seen = True
    feedback_count = 0
    feedback_notes = [
        "Warm atmosphere and clear reminders before the session.",
    ]
    for index, log in enumerate(logs[:-1]):
        db.session.add(SessionFeedback(
            user_id=customer.id,
            event_id=log.event_id,
            participant_id=log.participant_id,
            attendance_id=log.attendance_id,
            gamification_xp_log_id=log.id,
            session_date=log.session_date,
            event_title=log.event_title,
            engagement_rating=5 if index % 3 != 1 else 4,
            delivery_rating=5 if index % 4 != 2 else 4,
            suggestion=feedback_notes[index % len(feedback_notes)],
            skipped=False,
        ))
        feedback_count += 1
    db.session.commit()
    return summaries, feedback_count


def seed_guest_booking(events):
    guest_event = next((event_obj for event_obj in events if event_obj.category_id != 2 and event_obj.occusr_type == 1), None)
    if not guest_event:
        return None

    payload = {
        "event_id": guest_event.id,
        "first_name": "Guest",
        "last_name": "Tester",
        "email_id": "guest@gmail.com",
        "country_code": "+44",
        "mobile_number": "677889900",
        "quantity": 1,
    }
    with app.test_request_context(headers={"Timezone": os.getenv("d_t_z", "Africa/Casablanca")}):
        response = EventService.add_guest_participant(payload, "127.0.0.1")
    if isinstance(response, tuple):
        body, status_code = response
        if status_code >= 400 or body.get("status") is False:
            raise RuntimeError(f"Guest booking seed failed for event {guest_event.id}: {body}")
        response = body.get("response", body)
    return response


def seed_online_checkin_codes(events):
    online_events = [event_obj for event_obj in events if event_obj.location_type == 0]
    for event_obj in online_events:
        session_date = event_obj.start_date.date() if isinstance(event_obj.start_date, datetime) else event_obj.start_date
        db.session.add(OnlineSessionCheckInCode(
            event_id=event_obj.id,
            session_date=session_date,
            code="123456",
            status=1,
            created_by=event_obj.user_id,
            updated_by=event_obj.user_id,
        ))
    db.session.commit()
    return len(online_events)


def seed_notifications(customer, events):
    sample_notifications = [
        (
            events[0],
            7,
            "Iftar update",
            f"Friday Community Iftar has new details: {BASE_URL}/open?id={events[0].id}",
        ),
        (
            events[1],
            2,
            "Quran circle reminder",
            f"Open the course from your inbox: ondeen://course/{events[1].id}",
        ),
        (
            events[2],
            7,
            "External resource",
            "Preparation notes are available at https://en.wikipedia.org/wiki/Ramadan",
        ),
    ]
    for index, (event_obj, notification_type, title, message) in enumerate(sample_notifications, start=1):
        db.session.add(Notification_History(
            user_id=customer.id,
            participant_id=0,
            event_id=event_obj.id,
            push=True,
            sms=False,
            email=False,
            type=notification_type,
            send_to=2,
            task_id=f"seed-notification-{index}",
            title=title,
            message=message,
            seen=0 if index < 3 else 1,
            status=1,
            created_on=datetime.utcnow() - timedelta(minutes=index),
        ))
    db.session.commit()
    return len(sample_notifications)


with app.app_context():
    dialect = reset_database()
    if SEED_PROFILE == "refs":
        from scripts.seed_refs import run_refs_seed

        summary = run_refs_seed(BASE_URL, UPLOAD_DIR, UPLOAD_PUBLIC_PATH)
        print(f"Reset {dialect} database and seeded OnDeen REFS from scratch.")
        print("Seed profile: refs")
        print("Organizer login: org@gmail.com / 123456")
        print("User login: user@gmail.com / 123456")
        print(f"Created {summary['events']} reference listings, {summary['speakers']} speakers and {summary['users']} customer profiles.")
        print(f"The Knowledge Class event ID: {summary['knowledge_event_id']}")
        print(f"Sheikh Habib Hassan user ID: {summary['habib_user_id']}")
        print(f"Payment records created: {summary['payment_records']} (deferred by design)")
        print(f"REFS image URLs are under {BASE_URL}/{UPLOAD_PUBLIC_PATH}/refs/")
        raise SystemExit(0)

    image_urls = ensure_image_files()
    sect, school, levels, tags, facilities, categories, category_specs = seed_reference_data(image_urls)
    organizer, customer = seed_users(sect, school, levels)
    subcategories = seed_subcategories(organizer.id, categories, category_specs)
    seed_organizer_categories(organizer, categories)
    events = seed_events(organizer, levels, tags, facilities, categories, subcategories, image_urls)
    db.session.commit()
    booked_participant_ids = seed_bookings(customer, events)
    guest_booking_response = seed_guest_booking(events)
    online_code_count = 0
    gamification_summaries = []
    feedback_count = 0
    notification_count = 0
    if SEED_PROFILE in ("complete", "advanced"):
        online_code_count = seed_online_checkin_codes(events)
        gamification_summaries, feedback_count = seed_gamification(customer, booked_participant_ids)
        notification_count = seed_notifications(customer, events)
    db.session.commit()

    print(f"Reset {dialect} database and seeded OnDeen from scratch.")
    print(f"Seed profile: {SEED_PROFILE}")
    print("Organizer login: org@gmail.com / 123456")
    print("Organizer phone: +44 6 12 34 56 78")
    print("User login: user@gmail.com / 123456")
    print("User phone: +44 6 33 22 33 22")
    print(f"Created {len(events)} events and {len(booked_participant_ids)} user bookings.")
    if guest_booking_response:
        print("Seeded guest booking: guest@gmail.com / +44 677889900")
    if SEED_PROFILE in ("complete", "advanced"):
        print(f"Seeded A1 gamification with {len(gamification_summaries)} XP check-ins.")
        print(f"Seeded A2 feedback with {feedback_count} submitted responses and 1 pending prompt.")
        print(f"Seeded A4 online check-in code 123456 for {online_code_count} online events.")
        print(f"Seeded A5 notification links with {notification_count} inbox items.")
    print(f"Seed image URLs are under {BASE_URL}/{UPLOAD_PUBLIC_PATH}/")
PY
