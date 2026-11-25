import threading
from datetime import date, datetime, time
from zoneinfo import ZoneInfo

from sqlalchemy import inspect, text

from app import db
from app.models.event import Event, Request_buddy
from app.models.speakers import Speaker, SpeakerAvailabilityDate, SpeakerAvailabilityTime
from app.repositories.event import EventRepo
from app.repositories.user import user
from app.utils.custom_exception import ServiceError
from app.utils.notification_handler import async_push_notification_user


class OneToOneService:
    """Authorised, idempotent lifecycle for REFS one-to-one sessions."""

    PENDING = 0
    CONFIRMED = 1
    CANCELLED = 2
    APPROVED = 3
    DECLINED = 4
    RESCHEDULE_REQUESTED = 5
    COMPLETED = 6

    STATUS_LABELS = {
        PENDING: "PENDING",
        CONFIRMED: "CONFIRMED",
        CANCELLED: "CANCELLED",
        APPROVED: "APPROVED",
        DECLINED: "DECLINED",
        RESCHEDULE_REQUESTED: "RESCHEDULE_REQUESTED",
        COMPLETED: "COMPLETED",
    }
    ACTIVE_STATUSES = (PENDING, CONFIRMED, APPROVED, RESCHEDULE_REQUESTED)
    TERMINAL_STATUSES = (CANCELLED, DECLINED, COMPLETED)
    ACTION_STATUS = {
        "approve": APPROVED,
        "confirm": CONFIRMED,
        "decline": DECLINED,
        "cancel": CANCELLED,
        "request_reschedule": RESCHEDULE_REQUESTED,
        "complete": COMPLETED,
    }
    ACTOR_ACTIONS = {
        "customer": {"cancel", "request_reschedule"},
        "speaker": {"approve", "confirm", "decline", "cancel", "complete", "update_details"},
        "organiser": {"approve", "confirm", "decline", "cancel", "complete", "update_details"},
    }

    @staticmethod
    def ensure_storage():
        """Add lifecycle columns to an existing Railway database without data loss."""
        bind = db.session.get_bind()
        if bind is None:
            return

        Request_buddy.__table__.create(bind=bind, checkfirst=True)
        Speaker.__table__.create(bind=bind, checkfirst=True)
        tables = {
            "request_buddy": {
                "location_type": "INTEGER",
                "location": "TEXT",
                "duration_minutes": "INTEGER DEFAULT 60",
                "status_reason": "TEXT",
                "approved_on": "TIMESTAMP",
                "completed_on": "TIMESTAMP",
            },
            "speaker": {
                "one_to_one_enabled": "BOOLEAN NOT NULL DEFAULT TRUE",
                "one_to_one_location_type": "INTEGER DEFAULT 2",
                "one_to_one_duration_minutes": "INTEGER NOT NULL DEFAULT 60",
            },
        }
        schema = inspect(bind)
        with bind.begin() as connection:
            for table_name, required_columns in tables.items():
                existing = {column["name"] for column in schema.get_columns(table_name)}
                for column_name, column_type in required_columns.items():
                    if column_name not in existing:
                        connection.execute(text(
                            f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"
                        ))

    @classmethod
    def status_label(cls, value):
        try:
            return cls.STATUS_LABELS.get(int(value), "UNKNOWN")
        except (TypeError, ValueError):
            return "UNKNOWN"

    @staticmethod
    def _actor_id(value):
        try:
            return int(value)
        except (TypeError, ValueError):
            raise ServiceError("Unauthorised session actor")

    @staticmethod
    def _parse_date(value):
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        try:
            return datetime.strptime(str(value or ""), "%Y-%m-%d").date()
        except (TypeError, ValueError):
            raise ServiceError("A valid session date is required")

    @staticmethod
    def _parse_time(value):
        if isinstance(value, time):
            return value
        raw_value = str(value or "").strip()
        for time_format in ("%H:%M:%S", "%H:%M"):
            try:
                return datetime.strptime(raw_value, time_format).time()
            except ValueError:
                continue
        raise ServiceError("A valid session time is required")

    @classmethod
    def _authorised_session(cls, request_id, actor_id, actor_role):
        try:
            request_id = int(request_id)
        except (TypeError, ValueError):
            raise ServiceError("ID is required")
        actor_id = cls._actor_id(actor_id)

        session = Request_buddy.query.filter_by(id=request_id, type=2).first()
        if session is None:
            raise ServiceError("Session not found")

        if actor_role == "customer":
            authorised = session.user_id == actor_id
        elif actor_role == "speaker":
            authorised = session.speaker_id == actor_id
        elif actor_role == "organiser":
            authorised = Event.query.filter_by(
                id=session.event_id,
                user_id=actor_id,
            ).first() is not None
        else:
            authorised = False

        if not authorised:
            raise ServiceError("Session not found")
        return session

    @classmethod
    def _action(cls, payload, actor_role):
        action = str(payload.get("action") or "").strip().lower()
        if not action and "status" in payload:
            try:
                requested_status = int(payload.get("status"))
            except (TypeError, ValueError):
                raise ServiceError("Invalid session status")
            status_actions = {
                cls.CONFIRMED: "confirm",
                cls.CANCELLED: "cancel",
                cls.APPROVED: "approve",
                cls.DECLINED: "decline",
                cls.RESCHEDULE_REQUESTED: "request_reschedule",
                cls.COMPLETED: "complete",
            }
            action = status_actions.get(requested_status, "")
        if not action:
            action = "update_details"
        if action not in cls.ACTOR_ACTIONS.get(actor_role, set()):
            raise ServiceError("Action is not allowed for this account")
        return action

    @classmethod
    def _validate_transition(cls, current_status, action):
        if cls.ACTION_STATUS.get(action) == current_status:
            return
        if current_status in cls.TERMINAL_STATUSES:
            raise ServiceError("This session is already closed")
        allowed = {
            cls.PENDING: {"approve", "confirm", "decline", "cancel", "request_reschedule", "update_details"},
            cls.APPROVED: {"confirm", "cancel", "request_reschedule", "complete", "update_details"},
            cls.CONFIRMED: {"cancel", "request_reschedule", "complete", "update_details"},
            cls.RESCHEDULE_REQUESTED: {"approve", "confirm", "cancel", "decline", "update_details"},
        }
        if action not in allowed.get(current_status, set()):
            raise ServiceError("Invalid session state transition")

    @classmethod
    def _validate_free_slot(cls, session, session_date, session_time):
        speaker = Speaker.query.filter_by(user_id=session.speaker_id, status=1).first()
        if speaker is None or speaker.one_to_one_enabled is False:
            raise ServiceError("Speaker is not accepting one-to-one sessions")

        date_override = SpeakerAvailabilityDate.query.filter_by(
            user_id=session.speaker_id,
            date=session_date,
        ).first()
        if date_override is not None:
            if date_override.status != 1:
                raise ServiceError("No available slot for this date")
            availability = date_override
        else:
            availability = SpeakerAvailabilityDate.query.filter_by(
                user_id=session.speaker_id,
                weekday=session_date.weekday(),
                status=1,
            ).first()
        if availability is None:
            raise ServiceError("No available slot for this date")

        available_time = SpeakerAvailabilityTime.query.filter_by(
            availability_date_id=availability.id,
            start_time=session_time,
            status=1,
        ).first()
        if available_time is None:
            raise ServiceError("No available slot for this time")

        speaker_user = user.get_userby_id(session.speaker_id)
        timezone_name = getattr(speaker_user, "time_zone", None) or "UTC"
        try:
            speaker_timezone = ZoneInfo(timezone_name)
        except Exception:
            speaker_timezone = ZoneInfo("UTC")
            timezone_name = "UTC"
        if datetime.combine(session_date, session_time, tzinfo=speaker_timezone) <= datetime.now(speaker_timezone):
            raise ServiceError("This session slot is no longer available")

        EventRepo.lock_one_to_one_slot(session.speaker_id, session_date, session_time)
        occupied = EventRepo.get_active_one_to_one_for_slot(
            session.speaker_id,
            session_date,
            session_time,
        )
        if occupied is not None and occupied.id != session.id:
            raise ServiceError("Slot is no longer available")
        return timezone_name

    @staticmethod
    def _set_if_changed(session, field_name, value):
        if getattr(session, field_name) == value:
            return False
        setattr(session, field_name, value)
        return True

    @classmethod
    def _notification_copy(cls, action, session):
        label = cls.status_label(session.status).replace("_", " ").title()
        copies = {
            "approve": ("1-to-1 session approved", "Your one-to-one session request was approved."),
            "confirm": ("1-to-1 session confirmed", "Your one-to-one session details are confirmed."),
            "decline": ("1-to-1 session declined", "Your one-to-one session request was declined."),
            "cancel": ("1-to-1 session cancelled", "The one-to-one session was cancelled."),
            "request_reschedule": ("1-to-1 reschedule requested", "A new date or time was requested for the one-to-one session."),
            "complete": ("1-to-1 session completed", "The one-to-one session was marked completed."),
            "update_details": ("1-to-1 session updated", "The one-to-one session location or meeting details changed."),
        }
        return copies.get(action, ("1-to-1 session updated", f"The session is now {label}."))

    @classmethod
    def _notify(cls, session, actor_id, actor_role, action):
        title, message = cls._notification_copy(action, session)
        recipients = []
        if actor_role == "customer":
            recipients.append(session.speaker_id)
        elif actor_role == "speaker":
            recipients.append(session.user_id)
        else:
            recipients.extend([session.user_id, session.speaker_id])

        sent = 0
        for recipient_id in dict.fromkeys(recipient for recipient in recipients if recipient):
            if int(recipient_id) == int(actor_id):
                continue
            push_tokens = user.get_push_token(recipient_id, 4)
            if push_tokens:
                notification_data = {
                    "registration_token": push_tokens,
                    "title": title,
                    "body": message,
                    "odid": session.id,
                    "type": 4,
                }
                threading.Thread(
                    target=async_push_notification_user,
                    args=(notification_data,),
                ).start()
            user.create_notification_history(
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
            )
            sent += 1
        return sent

    @classmethod
    def update_session(cls, actor_id, actor_role, payload):
        payload = dict(payload or {})
        session = cls._authorised_session(payload.get("id"), actor_id, actor_role)
        action = cls._action(payload, actor_role)
        cls._validate_transition(session.status, action)

        changed = False
        date_changed = False
        time_changed = False
        proposed_date = session.date
        proposed_time = session.time

        if "date" in payload:
            proposed_date = cls._parse_date(payload.get("date"))
            date_changed = proposed_date != session.date
        if "time" in payload:
            proposed_time = cls._parse_time(payload.get("time"))
            time_changed = proposed_time != session.time
        if date_changed or time_changed:
            if proposed_date is None or proposed_time is None:
                raise ServiceError("Session date and time are required")
            session.time_zone = cls._validate_free_slot(session, proposed_date, proposed_time)
            changed |= cls._set_if_changed(session, "date", proposed_date)
            changed |= cls._set_if_changed(session, "time", proposed_time)
            session.meetlink_reminder_1d_sent = False
            session.meetlink_reminder_30m_sent = False

        if actor_role in ("organiser", "speaker"):
            if "meet_link" in payload:
                changed |= cls._set_if_changed(
                    session,
                    "meet_link",
                    str(payload.get("meet_link") or "").strip() or None,
                )
            if "location" in payload:
                changed |= cls._set_if_changed(
                    session,
                    "location",
                    str(payload.get("location") or "").strip() or None,
                )
            if "location_type" in payload:
                try:
                    location_type = int(payload.get("location_type"))
                except (TypeError, ValueError):
                    raise ServiceError("Invalid session location type")
                if location_type not in (0, 1, 2):
                    raise ServiceError("Invalid session location type")
                changed |= cls._set_if_changed(session, "location_type", location_type)

        if action == "request_reschedule" and actor_role == "customer":
            if not (date_changed or time_changed):
                raise ServiceError("A new session date or time is required")
            if "user_comment" in payload:
                changed |= cls._set_if_changed(
                    session,
                    "user_comment",
                    str(payload.get("user_comment") or "").strip(),
                )

        if "status_reason" in payload:
            changed |= cls._set_if_changed(
                session,
                "status_reason",
                str(payload.get("status_reason") or "").strip() or None,
            )

        requested_status = cls.ACTION_STATUS.get(action)
        if requested_status is not None:
            changed |= cls._set_if_changed(session, "status", requested_status)
        elif action == "update_details" and session.status == cls.APPROVED and (session.meet_link or session.location):
            action = "confirm"
            changed |= cls._set_if_changed(session, "status", cls.CONFIRMED)

        if action == "confirm":
            if session.location_type == 0 and not session.meet_link:
                db.session.rollback()
                raise ServiceError("Meeting link is required for an online session")
            if session.location_type == 1 and not session.location:
                db.session.rollback()
                raise ServiceError("Location is required for an in-person session")
            if session.location_type in (None, 2) and not (session.meet_link or session.location):
                db.session.rollback()
                raise ServiceError("Meeting link or location is required to confirm")
        if action == "approve" and session.approved_on is None:
            session.approved_on = datetime.utcnow()
            changed = True
        if action == "complete" and session.completed_on is None:
            session.completed_on = datetime.utcnow()
            changed = True

        if not changed:
            return {
                "message": "No changes",
                "updated": False,
                "notification_count": 0,
                "session": cls.serialize(session),
            }

        session.updated_on = datetime.utcnow()
        session.updated_by = cls._actor_id(actor_id)
        db.session.commit()
        notification_count = cls._notify(session, actor_id, actor_role, action)
        return {
            "message": "Updated successfully",
            "updated": True,
            "notification_count": notification_count,
            "session": cls.serialize(session),
        }

    @classmethod
    def serialize(cls, session):
        return {
            "id": session.id,
            "event_id": session.event_id,
            "user_id": session.user_id,
            "speaker_id": session.speaker_id,
            "type": session.type,
            "status": session.status,
            "status_label": cls.status_label(session.status),
            "date": session.date.strftime("%Y-%m-%d") if isinstance(session.date, date) else session.date,
            "time": session.time.strftime("%H:%M:%S") if isinstance(session.time, time) else session.time,
            "time_zone": session.time_zone,
            "meet_link": session.meet_link,
            "location_type": session.location_type,
            "location": session.location,
            "duration_minutes": session.duration_minutes or 60,
            "status_reason": session.status_reason,
            "user_comment": session.user_comment,
        }
