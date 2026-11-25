from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime,timedelta,timezone
from flask import Flask
import atexit
import os
import threading
from sqlalchemy import or_
from zoneinfo import ZoneInfo

app = Flask(__name__)
scheduler = BackgroundScheduler(
    timezone=os.getenv('ONDEEN_SCHEDULER_TIMEZONE', os.getenv('TZ', 'Africa/Casablanca'))
)


def _combine_date_time(date_value, time_value):
    if not date_value or not time_value:
        return None
    if isinstance(date_value, datetime):
        date_value = date_value.date()
    return datetime.combine(date_value, time_value)


def _between(value, start, end):
    return value is not None and start < value < end




def _legacy_send_missing_meetlink_121_notifications_for_30min(app):
    """Notify organisers 30 min before event if meet link is missing."""
    try:
        with app.app_context():
            from app import db
            from app.models.event import Request_buddy
            from app.models.users import Users
            from app.utils.notification_handler import async_push_notification_user
            from app.utils.load_notification_template import load_push_notification_template
            from app.repositories.user import user
            
            now = datetime.now()
            lower_bound = now + timedelta(minutes=10)
            upper_bound = now + timedelta(minutes=30)
            events = (
                db.session.query(Request_buddy)
                .filter(
                    Request_buddy.type == 2,
                    Request_buddy.status == 1,
                    Request_buddy.meetlink_reminder_30m_sent.is_(False),
                    Request_buddy.date.isnot(None),
                    Request_buddy.time.isnot(None),
                )
                .all()
            )
            if events:
                    for event_obj in events:
                        if not _between(_combine_date_time(event_obj.date, event_obj.time), lower_bound, upper_bound):
                            continue

                        event_obj.meetlink_reminder_30m_sent = True
                        db.session.commit()

                        speaker_id = event_obj.speaker_id
                        push_tokens = user.get_push_token(speaker_id, 4)
                        if push_tokens:

                            title = "🔔 Reminder"
                            message = f"Session begins in 30 mins, Dont forget to attend"
                            if not event_obj.meet_link:
                                message = f"Session begins in 30 mins, Please update meeting link to ensure user can join on time."

                            data = {
                                "registration_token": push_tokens,
                                "title": title,
                                "body": message,
                                "odid": event_obj.id,
                                "type": 4
                            }
                            threading.Thread(target=async_push_notification_user, args=(data,)).start()
                            user.create_notification_history(
                                participant_id=speaker_id,
                                event_id=event_obj.id,
                                push=True, sms=False, email=False,
                                type=4, title=title, message=message,
                                send_to=4, task_id='', user_id=speaker_id
                            )
                        user_id = event_obj.user_id
                        push_tokens = user.get_push_token(user_id, 4)
                        if push_tokens:

                            title = "🔔 Reminder"
                            message = f"Speaker session begins in 30 mins, Dont forget to attend"

                            data = {
                                "registration_token": push_tokens,
                                "title": title,
                                "body": message,
                                "odid": event_obj.id,
                                "type": 4
                            }
                            threading.Thread(target=async_push_notification_user, args=(data,)).start()
                            user.create_notification_history(
                                participant_id=speaker_id,
                                event_id=event_obj.id,
                                push=True, sms=False, email=False,
                                type=4, title=title, message=message,
                                send_to=4, task_id='', user_id=user_id
                            )
                            

    except Exception as e:
        app.logger.error(f"Error in send_missing_meetlink_121_notifications_for_30min: {str(e)}")
 
def _legacy_send_missing_meetlink_121_notifications_for_day(app):
    """Notify organisers 1 day before event if meet link is missing."""
    try:
        with app.app_context():
            from app import db
            from app.models.event import Request_buddy
            from app.models.users import Users
            from app.utils.notification_handler import async_push_notification_user
            from app.utils.load_notification_template import load_push_notification_template
            from app.repositories.user import user
            
            now = datetime.now()
            lower_bound = now + timedelta(hours=1)
            upper_bound = now + timedelta(hours=24)
            events = (
                db.session.query(Request_buddy)
                .filter(
                    Request_buddy.type == 2,
                    Request_buddy.status == 1,
                    Request_buddy.meetlink_reminder_1d_sent.is_(False),
                    Request_buddy.date.isnot(None),
                    Request_buddy.time.isnot(None),
                )
                .all()
            )
            if events:
                    for event_obj in events:
                        if not _between(_combine_date_time(event_obj.date, event_obj.time), lower_bound, upper_bound):
                            continue

                        event_obj.meetlink_reminder_1d_sent = True
                        db.session.commit()

                        speaker_id = event_obj.speaker_id
                        push_tokens = user.get_push_token(speaker_id, 4)
                        if push_tokens:

                            title = "🔔 Reminder"
                            message = f"Don’t forget! You have a session scheduled for tomorrow"

                            data = {
                                "registration_token": push_tokens,
                                "title": title,
                                "body": message,
                                "odid": event_obj.id,
                                "type": 4
                            }
                            threading.Thread(target=async_push_notification_user, args=(data,)).start()
                            user.create_notification_history(
                                participant_id=speaker_id,
                                event_id=event_obj.id,
                                push=True, sms=False, email=False,
                                type=4, title=title, message=message,
                                send_to=4, task_id='', user_id=speaker_id
                            )
                        user_id = event_obj.user_id
                        push_tokens = user.get_push_token(user_id, 4)
                        if push_tokens:

                            title = "🔔 Reminder"
                            message = f"Don’t forget! You have a speaker session scheduled for tomorrow"

                            data = {
                                "registration_token": push_tokens,
                                "title": title,
                                "body": message,
                                "odid": event_obj.id,
                                "type": 4
                            }
                            threading.Thread(target=async_push_notification_user, args=(data,)).start()
                            user.create_notification_history(
                                participant_id=speaker_id,
                                event_id=event_obj.id,
                                push=True, sms=False, email=False,
                                type=4, title=title, message=message,
                                send_to=4, task_id='', user_id=user_id
                            )
                            


    except Exception as e:
        app.logger.error(f"Error in send_missing_meetlink_121_notifications_for_day: {str(e)}")


def _send_one_to_one_reminders(app, reminder_kind, now=None):
    """Persist and optionally push one timezone-safe reminder to both actors."""
    try:
        with app.app_context():
            from app import db
            from app.models.event import Request_buddy
            from app.models.users import Notification_History
            from app.repositories.user import user
            from app.utils.notification_handler import async_push_notification_user

            current_utc = now or datetime.now(timezone.utc)
            if current_utc.tzinfo is None:
                current_utc = current_utc.replace(tzinfo=timezone.utc)
            flag_field = (
                "meetlink_reminder_1d_sent"
                if reminder_kind == "1d"
                else "meetlink_reminder_30m_sent"
            )
            lower_seconds, upper_seconds = (
                (23 * 60 * 60, 24 * 60 * 60)
                if reminder_kind == "1d"
                else (29 * 60, 30 * 60)
            )
            sessions = (
                db.session.query(Request_buddy)
                .filter(
                    Request_buddy.type == 2,
                    Request_buddy.status.in_([1, 3]),
                    getattr(Request_buddy, flag_field).is_(False),
                    Request_buddy.date.isnot(None),
                    Request_buddy.time.isnot(None),
                )
                .all()
            )
            session_count = 0
            notification_count = 0
            push_payloads = []

            for session in sessions:
                try:
                    session_timezone = ZoneInfo(session.time_zone or "UTC")
                except Exception:
                    session_timezone = ZoneInfo("UTC")
                local_now = current_utc.astimezone(session_timezone)
                starts_at = datetime.combine(
                    session.date,
                    session.time,
                    tzinfo=session_timezone,
                )
                seconds_until = (starts_at - local_now).total_seconds()
                if not lower_seconds <= seconds_until <= upper_seconds:
                    continue

                customer = user.get_userby_id(session.user_id)
                speaker = user.get_userby_id(session.speaker_id)
                customer_name = " ".join(filter(None, [
                    getattr(customer, "first_name", ""),
                    getattr(customer, "last_name", ""),
                ])).strip() or "the User"
                speaker_name = " ".join(filter(None, [
                    getattr(speaker, "first_name", ""),
                    getattr(speaker, "last_name", ""),
                ])).strip() or "the Speaker"
                offset_label = "24 hours" if reminder_kind == "1d" else "30 minutes"
                title = f"1-to-1 session in {offset_label}"
                recipients = (
                    (session.user_id, f"Your one-to-one session with {speaker_name} starts in {offset_label}."),
                    (session.speaker_id, f"Your one-to-one session with {customer_name} starts in {offset_label}."),
                )
                for recipient_id, message in recipients:
                    db.session.add(Notification_History(
                        participant_id=0,
                        event_id=session.id,
                        push=True,
                        sms=False,
                        email=False,
                        type=4,
                        title=title,
                        message=message,
                        send_to=4,
                        task_id="",
                        user_id=recipient_id,
                    ))
                    push_tokens = user.get_push_token(recipient_id, 4)
                    if push_tokens:
                        push_payloads.append({
                            "registration_token": push_tokens,
                            "title": title,
                            "body": message,
                            "odid": session.id,
                            "type": 4,
                        })
                    notification_count += 1
                setattr(session, flag_field, True)
                session_count += 1

            db.session.commit()
            for payload in push_payloads:
                threading.Thread(
                    target=async_push_notification_user,
                    args=(payload,),
                ).start()
            return {
                "sessions": session_count,
                "notifications": notification_count,
            }
    except Exception as error:
        app.logger.error(f"Error in one-to-one {reminder_kind} reminders: {str(error)}")
        return {"sessions": 0, "notifications": 0, "error": str(error)}


def send_missing_meetlink_121_notifications_for_30min(app, now=None):
    return _send_one_to_one_reminders(app, "30m", now=now)


def send_missing_meetlink_121_notifications_for_day(app, now=None):
    return _send_one_to_one_reminders(app, "1d", now=now)


def send_missing_meetlink_notifications_for_day(app):
    """Notify organisers 1 day before event if meet link is missing."""
    try:
        with app.app_context():
            from app import db
            from app.models.event import Event
            from app.models.users import Users
            from app.utils.notification_handler import async_push_notification_user
            from app.utils.load_notification_template import load_push_notification_template
            from app.repositories.user import user
            
            now = datetime.now()
            lower_bound = now + timedelta(hours=1)
            upper_bound = now + timedelta(hours=24)
            events = (
                db.session.query(Event)
                .filter(
                    Event.location_type == 0,
                    Event.status == 1,
                    or_(Event.meet_link.is_(None), Event.meet_link == ''),
                    Event.meetlink_reminder_1d_sent.is_(False),
                    Event.start_date.isnot(None),
                    Event.start_time.isnot(None),
                )
                .all()
            )
            if events:
                    for event_obj in events:
                        if not _between(_combine_date_time(event_obj.start_date, event_obj.start_time), lower_bound, upper_bound):
                            continue

                        organiser_id = event_obj.user_id
                        push_tokens = user.get_push_token(organiser_id, 2)
                        if not push_tokens:
                            continue

                        title = "🔔 Reminder"
                        message = f"The online meeting link for {event_obj.title or ''} has not been added yet. Please upload it to ensure attendees can join on time."

                        data = {
                            "registration_token": push_tokens,
                            "title": title,
                            "body": message,
                            "odid": event_obj.id,
                            "type": 2
                        }

                        threading.Thread(target=async_push_notification_user, args=(data,)).start()

                        user.create_notification_history(
                            participant_id=organiser_id,
                            event_id=event_obj.id,
                            push=True, sms=False, email=False,
                            type=2, title=title, message=message,
                            send_to=3, task_id='', user_id=organiser_id
                        )
                        event_obj.meetlink_reminder_1d_sent = True
                        db.session.commit()


    except Exception as e:
        app.logger.error(f"Error in send_missing_meetlink_notifications_for_day: {str(e)}")
 

def send_missing_meetlink_notifications_for_30min(app):
    """Notify organisers 30 minutes before event if meet link is missing."""
    try:
        with app.app_context():
            from app import db
            from app.models.event import Event
            from app.models.users import Users
            from app.utils.notification_handler import async_push_notification_user
            from app.utils.load_notification_template import load_push_notification_template
            from app.repositories.user import user

            now = datetime.now()
            lower_bound = now + timedelta(minutes=10)
            upper_bound = now + timedelta(minutes=30)
            events = (
                db.session.query(Event)
                .filter(
                    Event.location_type == 0,
                    Event.status == 1,
                    or_(Event.meet_link.is_(None), Event.meet_link == ''),
                    Event.meetlink_reminder_30m_sent.is_(False),
                    Event.start_date.isnot(None),
                    Event.start_time.isnot(None),
                )
                .all()
            )
            
            if events:
                    for event_obj in events:
                        if not _between(_combine_date_time(event_obj.start_date, event_obj.start_time), lower_bound, upper_bound):
                            continue

                        organiser_id = event_obj.user_id
                        push_tokens = user.get_push_token(organiser_id, 2)
                        if not push_tokens:
                            continue

                        title = "🔔 Reminder"
                        message=f"The online meeting link for {event_obj.title or ''} has not been added yet. Please upload it to ensure attendees can join on time."

                        data = {
                            "registration_token": push_tokens,
                            "title": title,
                            "body": message,
                            "odid": event_obj.id,
                            "type": 2
                        }

                        threading.Thread(target=async_push_notification_user, args=(data,)).start()

                        user.create_notification_history(
                            participant_id=organiser_id,
                            event_id=event_obj.id,
                            push=True, sms=False, email=False,
                            type=2, title=title, message=message,
                            send_to=3, task_id='', user_id=organiser_id
                        )

                        event_obj.meetlink_reminder_30m_sent = True
                        db.session.commit()

    except Exception as e:
        app.logger.error(f"Error in send_missing_meetlink_notifications_for_30min: {str(e)}")


def _legacy_send_notifications_event_daily(app):
    """Notify participants if their event starts within the next 24 hours."""
    try:
        with app.app_context():
            from app import db
            from app.models.event import Event, Participant
            from app.utils.notification_handler import async_push_notification_user
            from app.repositories.user import user
            now = datetime.utcnow()
            #now = now + timedelta(minutes=60)
            now_p1 = now + timedelta(hours=1)
            next_24h = now + timedelta(hours=24)
            today = now.date() 
            tomorrow = (now + timedelta(days=1)).date()

            # Fetch all active events up to the next 24h (broad range)
            events = (
                db.session.query(Event).filter(Event.status == 1,Event.start_date <= tomorrow,Event.end_date >= today).all()
            )

            def is_event_within_24h(event, now, next_24h):
                """
                Check if the given event is occurring within the next 24 hours,
                considering recurrence (daily, weekly, monthly, etc.)
                """
                # Build actual event datetime
                if hasattr(event, "start_time") and event.start_time:
                    event_start = datetime.combine(event.start_date.date(), event.start_time)
                else:
                    event_start = event.start_date if isinstance(event.start_date, datetime) else datetime.combine(event.start_date.date(), datetime.min.time())

                if event.occusr_type == 2 and event.category_id == 2:
                    # Happens every day at same time
                    next_occurrence = datetime.combine(now.date(), event.start_time)
                    if next_occurrence < now:
                        next_occurrence += timedelta(days=1)
                    return now <= next_occurrence <= next_24h

                # Weekly recurring event
                elif event.occusr_type == 3 and event.category_id == 2:
                    if not event.occusr_weekday:
                        return False
                    weekdays = [int(d) for d in event.occusr_weekday.split(",")]
                    for i in range(7):
                        candidate_date = now.date() + timedelta(days=i)
                        if candidate_date.weekday() in weekdays:
                            candidate_datetime = datetime.combine(candidate_date, event.start_time)
                            if now <= candidate_datetime <= next_24h:
                                return True
                    return False

                # Monthly recurring event
                elif event.occusr_type == 4 and event.category_id == 2:
                    if event.occusr_month == 1:  # date-based monthly
                        candidate_date = event_start.replace(
                            year=now.year, month=now.month
                        )
                        if now <= candidate_date <= next_24h:
                            return True
                    elif event.occusr_month == 2:  # weekday-based monthly (e.g., 2nd Tuesday)
                        weekday_of_month = (event_start.day - 1) // 7 + 1
                        for i in range(1, 32):
                            candidate_date = datetime(now.year, now.month, i)
                            if (
                                candidate_date.weekday() == event_start.weekday()
                                and (candidate_date.day - 1) // 7 + 1 == weekday_of_month
                            ):
                                candidate_datetime = datetime.combine(
                                    candidate_date.date(), event.start_time
                                )
                                if now <= candidate_datetime <= next_24h:
                                    return True
                    return False
                else:
                    return now <= event_start <= next_24h

                return False

            # Process notifications
            for event in events:
                if event.participant_reminder_1d_sent_date and (
                    now.date() == event.participant_reminder_1d_sent_date
                ):
                    continue  # already sent today

                if not is_event_within_24h(event, now_p1, next_24h):
                    continue  # not within 24 hours window

                user_ids = (
                    db.session.query(Participant.user_id)
                    .filter(Participant.event_id == event.id, Participant.status == 1)
                    .distinct().all()
                )

                for (user_id,) in user_ids:
                    tokens = user.get_push_token(user_id, 2)
                    if not tokens:
                        continue

                    title = "Upcoming Event Reminder"
                    event_time_str = event.start_time.strftime("%I:%M %p") if event.start_time else "soon"
                    message = f"Don’t forget! Your event '{event.title}' starts at {event_time_str}."
                    message = f"Don’t forget! Your event {event.title} is scheduled for tomorrow."

                    data = {
                        "registration_token": tokens,
                        "title": title,
                        "body": message,
                        "odid": event.id,
                        "type": 2,
                    }

                    threading.Thread(target=async_push_notification_user, args=(data,)).start()

                    user.create_notification_history(
                        participant_id=user_id,
                        event_id=event.id,
                        push=True, sms=False, email=False,
                        type=2, title=title, message=message,
                        send_to=3, task_id="", user_id=user_id,
                    )

                # Mark reminder sent
                db.session.query(Event).filter_by(id=event.id).update(
                    {Event.participant_reminder_1d_sent_date: now.date()}
                )
                db.session.commit()

    except Exception as e:
        app.logger.error(f"Error in send_notifications_event_daily: {str(e)}")



def _legacy_send_notifications_event_daily_30min(app):
    """Notify participants if their event starts within the next 30 min."""
    try:
        with app.app_context():
            from app import db
            from app.models.event import Event, Participant
            from app.utils.notification_handler import async_push_notification_user
            from app.repositories.user import user
            now = datetime.utcnow()
            #now = now + timedelta(minutes=60)
            now_p1 = now + timedelta(minutes=10)
            next_30m = now + timedelta(minutes=30)
            today = now.date() 
            tomorrow = (now + timedelta(days=1)).date()

            # Fetch all active events up to the next 24h (broad range)
            events = (
                db.session.query(Event).filter(Event.status == 1,Event.start_date <= tomorrow,Event.end_date >= today).all()
            )

            def is_event_within_24h(event, now, next_30m):
                """
                Check if the given event is occurring within the next 30 imin,
                considering recurrence (daily, weekly, monthly, etc.)
                """
                # Build actual event datetime
                if hasattr(event, "start_time") and event.start_time:
                    event_start = datetime.combine(event.start_date.date(), event.start_time)
                else:
                    event_start = event.start_date if isinstance(event.start_date, datetime) else datetime.combine(event.start_date.date(), datetime.min.time())

                if event.occusr_type == 2 and event.category_id == 2:
                    # Happens every day at same time
                    next_occurrence = datetime.combine(now.date(), event.start_time)
                    if next_occurrence < now:
                        next_occurrence += timedelta(days=1)
                    return now <= next_occurrence <= next_30m

                # Weekly recurring event
                elif event.occusr_type == 3 and event.category_id == 2:
                    if not event.occusr_weekday:
                        return False
                    weekdays = [int(d) for d in event.occusr_weekday.split(",")]
                    for i in range(7):
                        candidate_date = now.date() + timedelta(days=i)
                        if candidate_date.weekday() in weekdays:
                            candidate_datetime = datetime.combine(candidate_date, event.start_time)
                            if now <= candidate_datetime <= next_30m:
                                return True
                    return False

                # Monthly recurring event
                elif event.occusr_type == 4 and event.category_id == 2:
                    if event.occusr_month == 1:  # date-based monthly
                        candidate_date = event_start.replace(
                            year=now.year, month=now.month
                        )
                        if now <= candidate_date <= next_30m:
                            return True
                    elif event.occusr_month == 2:  # weekday-based monthly (e.g., 2nd Tuesday)
                        weekday_of_month = (event_start.day - 1) // 7 + 1
                        for i in range(1, 32):
                            candidate_date = datetime(now.year, now.month, i)
                            if (
                                candidate_date.weekday() == event_start.weekday()
                                and (candidate_date.day - 1) // 7 + 1 == weekday_of_month
                            ):
                                candidate_datetime = datetime.combine(
                                    candidate_date.date(), event.start_time
                                )
                                if now <= candidate_datetime <= next_30m:
                                    return True
                    return False
                else:
                    return now <= event_start <= next_30m

                return False

            # Process notifications
            for event in events:
                if event.participant_reminder_30m_sent_date and (
                    now.date() == event.participant_reminder_30m_sent_date
                ):
                    continue  # already sent today

                if not is_event_within_24h(event, now_p1, next_30m):
                    continue  # not within 24 hours window
 
                user_ids = (
                    db.session.query(Participant.user_id)
                    .filter(Participant.event_id == event.id, Participant.status == 1)
                    .distinct().all()
                )

                for (user_id,) in user_ids:
                    tokens = user.get_push_token(user_id, 2)
                    if not tokens:
                        continue

                    title = "Upcoming Event Reminder"
                    event_time_str = event.start_time.strftime("%I:%M %p") if event.start_time else "soon"
                    message = f"Don’t forget! Your event '{event.title}' starts at {event_time_str}."
                    message = f"Just a reminder! Your event {event.title} is starting in 30 minutes. Get ready to join."
                    if event.location_type==1:
                        message = f"⏳ {event.title} begins in 30 mins. Dont forget to swipe to check in on arrival."

                    data = {
                        "registration_token": tokens,
                        "title": title,
                        "body": message,
                        "odid": event.id,
                        "type": 2,
                    }

                    threading.Thread(target=async_push_notification_user, args=(data,)).start()

                    user.create_notification_history(
                        participant_id=user_id,
                        event_id=event.id,
                        push=True, sms=False, email=False,
                        type=2, title=title, message=message,
                        send_to=3, task_id="", user_id=user_id,
                    )

                # Mark reminder sent
                db.session.query(Event).filter_by(id=event.id).update(
                    {Event.participant_reminder_30m_sent_date: now.date()}
                )
                db.session.commit()

    except Exception as e:
        app.logger.error(f"Error in send_notifications_event_daily_30min: {str(e)}")


def _send_event_booking_reminders(app, reminder_kind, now=None):
    """Persist and optionally push one reminder per active booking/session."""
    try:
        with app.app_context():
            from app import db
            from app.models.event import (
                Event,
                EventDate,
                EventDateTime,
                EventReminderDelivery,
                Participant,
            )
            from app.models.users import Notification_History, Users
            from app.repositories.user import user
            from app.utils.notification_handler import async_push_notification_user
            from sqlalchemy import func
            from sqlalchemy.exc import IntegrityError

            current_utc = now or datetime.now(timezone.utc)
            if current_utc.tzinfo is None:
                current_utc = current_utc.replace(tzinfo=timezone.utc)
            else:
                current_utc = current_utc.astimezone(timezone.utc)

            if reminder_kind == "1d":
                lower_seconds, upper_seconds = 23 * 60 * 60, 24 * 60 * 60
                offset_label = "24 hours"
            elif reminder_kind == "30m":
                lower_seconds, upper_seconds = 29 * 60, 30 * 60
                offset_label = "30 minutes"
            else:
                raise ValueError("Unsupported event reminder kind")

            schedule_rows = (
                db.session.query(Event, EventDate, EventDateTime)
                .join(EventDate, EventDate.event_id == Event.id)
                .join(EventDateTime, EventDateTime.event_date_id == EventDate.id)
                .filter(
                    Event.status == 1,
                    EventDate.status == 1,
                    EventDateTime.status == 1,
                    EventDate.date.isnot(None),
                    EventDateTime.start_time.isnot(None),
                )
                .all()
            )

            scheduled_event_ids = {event.id for event, _, _ in schedule_rows}
            candidates = [
                (event, event_date.date, event_time.start_time, event_time.id)
                for event, event_date, event_time in schedule_rows
            ]
            fallback_events = (
                db.session.query(Event)
                .filter(
                    Event.status == 1,
                    Event.start_date.isnot(None),
                    Event.start_time.isnot(None),
                )
                .all()
            )
            candidates.extend(
                (event, event.start_date.date(), event.start_time, 0)
                for event in fallback_events
                if event.id not in scheduled_event_ids
            )

            notification_count = 0
            session_count = 0
            push_payloads = []
            seen_sessions = set()

            for event, session_date, session_time, event_date_time_id in candidates:
                session_key = f"{session_date.isoformat()}T{session_time.isoformat()}"
                event_session_key = (event.id, session_key)
                if event_session_key in seen_sessions:
                    continue
                seen_sessions.add(event_session_key)

                try:
                    event_timezone = ZoneInfo(event.time_zone or "UTC")
                except Exception:
                    event_timezone = ZoneInfo("UTC")
                starts_at_local = datetime.combine(
                    session_date,
                    session_time,
                    tzinfo=event_timezone,
                )
                starts_at_utc = starts_at_local.astimezone(timezone.utc)
                seconds_until = (starts_at_utc - current_utc).total_seconds()
                if not lower_seconds <= seconds_until <= upper_seconds:
                    continue

                booked_users = (
                    db.session.query(Participant.user_id, func.min(Participant.id))
                    .join(Users, Users.id == Participant.user_id)
                    .filter(
                        Participant.event_id == event.id,
                        Participant.status == 1,
                        Users.status == 1,
                    )
                    .group_by(Participant.user_id)
                    .order_by(Participant.user_id.asc())
                    .all()
                )
                session_has_new_delivery = False
                for user_id, participant_id in booked_users:
                    task_id = (
                        f"event-reminder:{reminder_kind}:event:{event.id}:"
                        f"session:{session_key}:user:{user_id}"
                    )
                    if EventReminderDelivery.query.filter_by(
                        event_id=event.id,
                        session_key=session_key,
                        user_id=user_id,
                        reminder_kind=reminder_kind,
                    ).first():
                        continue

                    try:
                        with db.session.begin_nested():
                            delivery = EventReminderDelivery(
                                event_id=event.id,
                                event_date_time_id=event_date_time_id or 0,
                                participant_id=participant_id or 0,
                                user_id=user_id,
                                session_key=session_key,
                                reminder_kind=reminder_kind,
                                scheduled_for_utc=starts_at_utc.replace(tzinfo=None),
                            )
                            db.session.add(delivery)
                            db.session.flush()
                    except IntegrityError:
                        continue

                    local_time = starts_at_local.strftime("%I:%M %p").lstrip("0")
                    title = f"Event in {offset_label}"
                    message = f"{event.title} starts in {offset_label} at {local_time}."
                    notification = Notification_History(
                        participant_id=participant_id or 0,
                        event_id=event.id,
                        push=True,
                        sms=False,
                        email=False,
                        type=2,
                        title=title,
                        message=message,
                        send_to=3,
                        task_id=task_id,
                        user_id=user_id,
                    )
                    db.session.add(notification)
                    db.session.flush()
                    delivery.notification_id = notification.id

                    push_tokens = user.get_push_token(user_id, 2)
                    if push_tokens:
                        push_payloads.append({
                            "registration_token": push_tokens,
                            "title": title,
                            "body": message,
                            "odid": event.id,
                            "type": 2,
                        })
                    notification_count += 1
                    session_has_new_delivery = True

                if session_has_new_delivery:
                    session_count += 1

            db.session.commit()
            for payload in push_payloads:
                threading.Thread(
                    target=async_push_notification_user,
                    args=(payload,),
                ).start()
            return {
                "sessions": session_count,
                "notifications": notification_count,
                "pushes": len(push_payloads),
            }
    except Exception as error:
        app.logger.error(f"Error in event {reminder_kind} reminders: {str(error)}")
        return {"sessions": 0, "notifications": 0, "pushes": 0, "error": str(error)}


def send_notifications_event_daily(app, now=None):
    return _send_event_booking_reminders(app, "1d", now=now)


def send_notifications_event_daily_30min(app, now=None):
    return _send_event_booking_reminders(app, "30m", now=now)


def process_payment_payouts(app):
    """Run the idempotent Stripe payout eligibility worker when explicitly enabled."""
    try:
        with app.app_context():
            from app.services.payment import PaymentService
            return {
                "payouts": PaymentService.run_payouts(),
                "cancellation_refunds": PaymentService.retry_cancellation_refunds(),
            }
    except Exception as error:
        app.logger.error("Payment payout worker failed: %s", str(error))
        return {"claimed": 0, "processed": 0, "waiting": 0, "failed": 1}


def configure_scheduler(app):
    """Initialize all scheduled jobs with intervals."""
    # scheduler.add_job(
        # func=scheduled_task,
        # args=[app],
        # trigger=IntervalTrigger(minutes=500),
        # id='update_offers_job',
        # replace_existing=True
    # )

    scheduler.add_job(
        func=send_missing_meetlink_notifications_for_day,
        args=[app],
        trigger=IntervalTrigger(minutes=1),
        id='missing_meetlink_reminder_1d',
        replace_existing=True
    )

    scheduler.add_job(
        func=send_missing_meetlink_notifications_for_30min,
        args=[app],
        trigger=IntervalTrigger(minutes=1),
        id='missing_meetlink_reminder_30m',
        replace_existing=True
    )

    scheduler.add_job(
        func=send_notifications_event_daily,
        args=[app],
        trigger=IntervalTrigger(minutes=1),
        id='participant_reminder_1d',
        replace_existing=True 
    )

    scheduler.add_job(
        func=send_notifications_event_daily_30min,
        args=[app],
        trigger=IntervalTrigger(minutes=1),
        id='participant_reminder_30m',
        replace_existing=True 
    )

    scheduler.add_job(
        func=send_missing_meetlink_121_notifications_for_day,
        args=[app],
        trigger=IntervalTrigger(minutes=1),
        id='speaker_session_1d',
        replace_existing=True 
    )

    scheduler.add_job(
        func=send_missing_meetlink_121_notifications_for_30min,
        args=[app],
        trigger=IntervalTrigger(minutes=1),
        id='speaker_session_30m',
        replace_existing=True 
    )

    scheduler.add_job(
        func=process_payment_payouts,
        args=[app],
        trigger=IntervalTrigger(minutes=5),
        id='payment_payout_worker',
        replace_existing=True,
    )

    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())
