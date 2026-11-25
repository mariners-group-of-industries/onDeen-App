#!/usr/bin/env python3
"""Prepare, inspect, or remove the disposable REFS manual-attendance proof."""

import argparse
import json
from datetime import date, datetime, time, timedelta

from wsgi import app
from app import db
from app.models.category import Category, SubCategory
from app.models.event import (
    Event,
    EventDate,
    EventDateTime,
    EventCurriculum,
    EventTicket,
    EventImages,
    EventTitleAuditLog,
    Drafts,
    JourneyLevel,
    Participant,
    ParticipantsAttendance,
    PaymentTransaction,
)
from app.models.gamification import (
    GamificationStreak,
    GamificationStreakMiss,
    GamificationXpLog,
    SessionFeedback,
    UserGamification,
)
from app.models.users import Notification_History, User_session, Users


TITLE = "REFS Proof - Manual Attendance"
EMAIL = "refs.manual.attendance.proof@ondeen.test"
MOBILE = "700009904"


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def fixture_rows():
    return (
        Event.query.filter_by(title=TITLE).all(),
        Users.query.filter_by(email_id=EMAIL, role_type=2).all(),
    )


def describe():
    events, users = fixture_rows()
    require(len(users) <= 1, "Disposable fixture user is not unique")
    event = events[0] if events else None
    user = users[0] if users else None
    participant = Participant.query.filter_by(event_id=event.id, user_id=user.id).first() if event and user else None
    attendance = ParticipantsAttendance.query.filter_by(participant_id=participant.id).first() if participant else None
    log = GamificationXpLog.query.filter_by(attendance_id=attendance.id).first() if attendance else None
    profile = UserGamification.query.filter_by(user_id=user.id).first() if user else None
    return {
        "exists": bool(event and user and participant and attendance),
        "event_count": len(events),
        "event_id": event.id if event else None,
        "participant_id": participant.id if participant else None,
        "attendance_id": attendance.id if attendance else None,
        "attendance_status": attendance.status if attendance else None,
        "swipe_checkin": event.swipe_checkin if event else None,
        "participant_status": participant.status if participant else None,
        "xp_log_count": GamificationXpLog.query.filter_by(user_id=user.id).count() if user else 0,
        "verification_source": log.verification_source if log else None,
        "total_xp": profile.total_xp if profile else 0,
        "total_sessions": profile.total_sessions if profile else 0,
        "payment_count": PaymentTransaction.query.count(),
    }


def prepare(check_in_enabled=True):
    events, users = fixture_rows()
    require(not events and not users, "Disposable fixture already exists; inspect or clean it first")
    require(PaymentTransaction.query.count() == 0, "Payment invariant is no longer zero")

    organiser = Users.query.filter_by(email_id="org@gmail.com", role_type=3).one()
    demo_user = Users.query.filter_by(email_id="user@gmail.com", role_type=2).one()
    category = Category.query.filter_by(id=2, title="Courses").one()
    topic = SubCategory.query.filter_by(category_id=category.id, title="Tafsir").one()
    level = JourneyLevel.query.filter_by(title="Suitable for all", status=1).one()
    reference_event = Event.query.filter_by(title="The Knowledge Class").one()
    reference_image = EventImages.query.filter_by(event_id=reference_event.id, status=1).first()

    user = Users(
        role_type=2,
        first_name="Manual",
        last_name="Attendance Proof",
        country_code="+44",
        mobile_number=MOBILE,
        email_id=EMAIL,
        password=demo_user.password,
        profile_image=demo_user.profile_image,
        status=1,
        journey_level_id=level.id,
        time_zone="Europe/London",
        created_by=organiser.id,
        updated_by=organiser.id,
    )
    db.session.add(user)
    db.session.flush()

    today = date.today()
    event = Event(
        user_id=organiser.id,
        title=TITLE,
        ar_title=TITLE,
        category_id=category.id,
        sub_category_id=topic.id,
        description="Disposable proof for the Organiser check-in path.",
        ar_description="Disposable proof for the Organiser check-in path.",
        start_date=datetime.combine(today, time.min),
        end_date=datetime.combine(today + timedelta(days=1), time.max),
        start_time=time(10, 0),
        end_time=time(11, 0),
        event_type=2,
        location="565A High Rd, London N17 6SN, UK",
        latitude=51.5882,
        longitude=-0.0730,
        price_type=0,
        price=0,
        journey_level_id=level.id,
        gender=3,
        total_no_class=2,
        call_per_week=1,
        location_type=1,
        duration=1,
        available=1,
        booked=1,
        quantity_per_user=1,
        qrcode_type=0,
        ticket_type=0,
        course_breakdown=1,
        swipe_checkin=1 if check_in_enabled else 2,
        occusr_type=3,
        occusr_weekday=f"{today.weekday()},{(today + timedelta(days=1)).weekday()}",
        status=1,
        created_by=organiser.id,
        updated_by=organiser.id,
        time_zone="Europe/London",
    )
    db.session.add(event)
    db.session.flush()
    if reference_image:
        db.session.add(EventImages(
            event_id=event.id,
            cropped_image=reference_image.cropped_image,
            full_screen_image=reference_image.full_screen_image,
            status=1,
            created_by=organiser.id,
            updated_by=organiser.id,
        ))

    # Keep the disposable proof listing aligned with the real free-ticket
    # path.  The Organiser UI can therefore read, edit and republish the
    # persisted ticket instead of falling back to listing-level capacity.
    db.session.add(EventTicket(
        event_id=event.id,
        title="General Admission",
        price=0,
        available=1,
        booked=0,
        max_per_user=1,
        status=1,
        created_by=organiser.id,
        updated_by=organiser.id,
    ))

    db.session.add_all([
        EventCurriculum(
            event_id=event.id,
            description="Foundations of Tafsir",
            ar_description="Foundations of Tafsir",
            no_of_days=1,
            start_date=datetime.combine(today, time.min),
            end_date=datetime.combine(today, time.max),
            start_time=time(10, 0),
            end_time=time(11, 0),
            status=1,
            created_by=organiser.id,
            updated_by=organiser.id,
        ),
        EventCurriculum(
            event_id=event.id,
            description="Applied Reflection",
            ar_description="Applied Reflection",
            no_of_days=1,
            start_date=datetime.combine(today + timedelta(days=1), time.min),
            end_date=datetime.combine(today + timedelta(days=1), time.max),
            start_time=time(10, 0),
            end_time=time(11, 0),
            status=1,
            created_by=organiser.id,
            updated_by=organiser.id,
        ),
    ])

    participant = Participant(
        event_id=event.id,
        user_id=user.id,
        paid_amount=0,
        created_by=user.id,
        qrcode=f"ondeen://ticket/{event.id}/{user.id}",
        ticket=f"{TITLE} - General Admission",
        date=today,
        start_time=event.start_time,
        end_time=event.end_time,
        quantity=1,
        status=1,
    )
    db.session.add(participant)
    db.session.flush()
    db.session.add(ParticipantsAttendance(
        participant_id=participant.id,
        event_id=event.id,
        attendance_date=today,
        status=0,
    ))
    db.session.commit()
    result = describe()
    require(
        result["exists"]
        and result["attendance_status"] == 0
        and result["swipe_checkin"] == (1 if check_in_enabled else 2),
        "Fixture preparation failed",
    )
    return result


def cleanup():
    events, users = fixture_rows()
    require(len(events) <= 4 and len(users) <= 1, "Refusing ambiguous fixture cleanup")
    event = events[0] if events else None
    user = users[0] if users else None
    if not event and not user:
        return {"removed": False, "payment_count": PaymentTransaction.query.count()}

    event_ids = [row.id for row in events]
    event_id = event.id if event else None
    user_id = user.id if user else None
    participant_ids = [
        row.id for row in Participant.query.filter(
            Participant.event_id.in_(event_ids or [-1]), Participant.user_id == user_id
        ).all()
    ]
    attendance_ids = [row.id for row in ParticipantsAttendance.query.filter(ParticipantsAttendance.participant_id.in_(participant_ids)).all()] if participant_ids else []
    require(
        PaymentTransaction.query.filter(
            (PaymentTransaction.event_id.in_(event_ids or [-1]))
            | (PaymentTransaction.user_id == user_id)
            | (PaymentTransaction.participant_id.in_(participant_ids or [-1]))
        ).count() == 0,
        "Refusing to remove a fixture with payment data",
    )

    if attendance_ids:
        SessionFeedback.query.filter(SessionFeedback.attendance_id.in_(attendance_ids)).delete(synchronize_session=False)
        GamificationStreakMiss.query.filter(GamificationStreakMiss.attendance_id.in_(attendance_ids)).delete(synchronize_session=False)
    GamificationXpLog.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    GamificationStreak.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    UserGamification.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    Notification_History.query.filter(
        (Notification_History.user_id == user_id)
        | Notification_History.event_id.in_(event_ids or [-1])
    ).delete(synchronize_session=False)
    User_session.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    # EventTitleAuditLog has a non-null event_id and is not configured with a
    # delete cascade. Remove only audit rows for this exact disposable event
    # before deleting the event; otherwise SQLAlchemy attempts to null the FK.
    if event_ids:
        EventTicket.query.filter(EventTicket.event_id.in_(event_ids)).delete(synchronize_session=False)
        EventCurriculum.query.filter(EventCurriculum.event_id.in_(event_ids)).delete(synchronize_session=False)
        EventTitleAuditLog.query.filter(EventTitleAuditLog.event_id.in_(event_ids)).delete(synchronize_session=False)
        event_date_ids = [
            row.id for row in EventDate.query.filter(EventDate.event_id.in_(event_ids)).all()
        ]
        if event_date_ids:
            EventDateTime.query.filter(EventDateTime.event_date_id.in_(event_date_ids)).delete(
                synchronize_session=False
            )
            EventDate.query.filter(EventDate.id.in_(event_date_ids)).delete(
                synchronize_session=False
            )
    for event in events:
        db.session.delete(event)
    db.session.flush()

    # A UI publish from a resumed draft creates a second disposable event. Remove
    # only drafts whose serialized title is this exact fixture title; unrelated
    # organiser drafts remain untouched.
    organiser = Users.query.filter_by(email_id="org@gmail.com", role_type=3).one_or_none()
    if organiser:
        for draft in Drafts.query.filter_by(user_id=organiser.id).all():
            try:
                payload = json.loads(draft.json_data or "{}")
            except (TypeError, ValueError):
                payload = {}
            if payload.get("title") == TITLE:
                db.session.delete(draft)
    if user:
        db.session.delete(user)
    db.session.commit()

    result = describe()
    require(not result["exists"], "Fixture cleanup did not remove all root rows")
    require(result["payment_count"] == 0, "Payment invariant changed during fixture cleanup")
    result["removed"] = True
    return result


parser = argparse.ArgumentParser()
parser.add_argument("action", choices=("prepare", "status", "cleanup"))
parser.add_argument("--check-in", choices=("enabled", "disabled"), default="enabled")
args = parser.parse_args()

with app.app_context():
    output = prepare(args.check_in == "enabled") if args.action == "prepare" else cleanup() if args.action == "cleanup" else describe()
    print(json.dumps(output, sort_keys=True))
