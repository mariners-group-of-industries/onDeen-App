import os
import secrets
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from app import db
from app.models.event import Event, Participant, ParticipantsAttendance
from app.models.online_checkin import OnlineCheckInAttempt, OnlineSessionCheckInCode
from app.models.users import Notification_History
from app.services.customer.gamification import GamificationService
from app.utils.custom_exception import ServiceError


class OnlineCheckInService:
    @staticmethod
    def _log(message):
        print(f"[online-checkin] {message}", flush=True)

    @staticmethod
    def _debug_log(message):
        print(f"[debug-attendance] {message}", flush=True)

    @staticmethod
    def ensure_storage():
        for model in (OnlineSessionCheckInCode, OnlineCheckInAttempt):
            model.__table__.create(bind=db.engine, checkfirst=True)

    @staticmethod
    def _dev_debug_enabled():
        # Debug attendance (forced completion, future check-in, default "123456"
        # online code) bypasses real check-in and awards XP. It must be opted
        # into explicitly; it is no longer implied by the test-OTP flag.
        truthy = {"1", "true", "yes", "on"}
        return (
            os.getenv("ONDEEN_LOCAL", "").lower() in truthy
            or os.getenv("ONDEEN_ENABLE_DEBUG_ATTENDANCE", "").lower() in truthy
        )

    @staticmethod
    def _parse_date(value, field_name="session_date"):
        if not value:
            return None
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        value = str(value).strip()
        if value.endswith("Z"):
            value = value[:-1]
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f"):
            try:
                return datetime.strptime(value[:26], fmt).date()
            except ValueError:
                continue
        raise ServiceError(f"Invalid {field_name}")

    @staticmethod
    def _event_session_date(event, requested_date=None):
        session_date = OnlineCheckInService._parse_date(requested_date)
        if session_date:
            return session_date
        if isinstance(event.start_date, datetime):
            return event.start_date.date()
        return event.start_date

    @staticmethod
    def _event_first_session_date(event):
        if isinstance(event.start_date, datetime):
            return event.start_date.date()
        if isinstance(event.start_date, date):
            return event.start_date
        return OnlineCheckInService._parse_date(event.start_date)

    @staticmethod
    def _event_today(event):
        timezone_name = event.time_zone or os.getenv("d_t_z") or "Africa/Casablanca"
        return datetime.now(ZoneInfo(timezone_name)).date()

    @staticmethod
    def _ensure_online_check_in_window(event, attendance, now=None):
        session_date = attendance.attendance_date
        if not session_date:
            return

        start_time = event.start_time
        if not start_time and isinstance(event.start_date, datetime):
            start_time = event.start_date.time()
        if not start_time:
            return

        timezone_name = event.time_zone or os.getenv("d_t_z") or "Africa/Casablanca"
        timezone = ZoneInfo(timezone_name)
        session_start = datetime.combine(session_date, start_time).replace(tzinfo=timezone)

        end_time = event.end_time
        if not end_time and isinstance(event.end_date, datetime):
            end_time = event.end_date.time()

        if end_time:
            session_end = datetime.combine(session_date, end_time).replace(tzinfo=timezone)
            if session_end <= session_start:
                session_end += timedelta(days=1)
        else:
            try:
                duration_minutes = int(event.duration or 0)
            except (TypeError, ValueError):
                duration_minutes = 0
            session_end = session_start + timedelta(minutes=max(duration_minutes, 0))

        now = now or datetime.now(timezone)
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone)
        else:
            now = now.astimezone(timezone)
        opens_at = session_start - timedelta(minutes=15)
        if now < opens_at:
            total_minutes = max(1, int(((opens_at - now).total_seconds() + 59) // 60))
            if total_minutes >= 1440:
                days = total_minutes // 1440
                hours = (total_minutes % 1440) // 60
                remaining = f"{days} day{'s' if days != 1 else ''}"
                if hours:
                    remaining += f" {hours} hour{'s' if hours != 1 else ''}"
            elif total_minutes >= 60:
                hours = total_minutes // 60
                minutes = total_minutes % 60
                remaining = f"{hours} hour{'s' if hours != 1 else ''}"
                if minutes:
                    remaining += f" {minutes} minute{'s' if minutes != 1 else ''}"
            else:
                remaining = f"{total_minutes} minute{'s' if total_minutes != 1 else ''}"
            raise ServiceError(f"Not time yet. Check-in opens in {remaining}")
        if now > session_end + timedelta(minutes=30):
            raise ServiceError("Online check-in is closed for this session")

    @staticmethod
    def _generate_code():
        return f"{secrets.randbelow(900000) + 100000}"

    @staticmethod
    def _utc_now(now=None):
        current = now or datetime.utcnow()
        if current.tzinfo is not None:
            current = current.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
        return current

    @staticmethod
    def _attempt_row(user_id, event_id, session_date):
        return OnlineCheckInAttempt.query.filter_by(
            user_id=user_id,
            event_id=event_id,
            session_date=session_date,
        ).first()

    @staticmethod
    def _lock_message(locked_until, now):
        minutes = max(1, int(((locked_until - now).total_seconds() + 59) // 60))
        return f"Too many wrong codes. Try again in {minutes} minute{'s' if minutes != 1 else ''}"

    @staticmethod
    def _ensure_not_rate_limited(user_id, event_id, session_date, now=None):
        current = OnlineCheckInService._utc_now(now)
        attempt = OnlineCheckInService._attempt_row(user_id, event_id, session_date)
        if attempt and attempt.locked_until and attempt.locked_until > current:
            raise ServiceError(OnlineCheckInService._lock_message(attempt.locked_until, current))
        return attempt

    @staticmethod
    def _record_failed_attempt(user_id, event_id, session_date, now=None):
        current = OnlineCheckInService._utc_now(now)
        attempt = OnlineCheckInService._attempt_row(user_id, event_id, session_date)
        if not attempt:
            attempt = OnlineCheckInAttempt(
                user_id=user_id,
                event_id=event_id,
                session_date=session_date,
                failed_attempt_count=0,
                failure_window_started_at=current,
            )
            db.session.add(attempt)
        elif attempt.locked_until and attempt.locked_until > current:
            raise ServiceError(OnlineCheckInService._lock_message(attempt.locked_until, current))

        window_expired = (
            not attempt.failure_window_started_at
            or current - attempt.failure_window_started_at > timedelta(minutes=5)
        )
        if window_expired or (attempt.locked_until and attempt.locked_until <= current):
            attempt.failed_attempt_count = 0
            attempt.failure_window_started_at = current
            attempt.locked_until = None

        attempt.failed_attempt_count = (attempt.failed_attempt_count or 0) + 1
        attempt.updated_on = current
        if attempt.failed_attempt_count >= 3:
            attempt.locked_until = current + timedelta(minutes=15)
        db.session.commit()

        if attempt.locked_until and attempt.locked_until > current:
            raise ServiceError(OnlineCheckInService._lock_message(attempt.locked_until, current))
        return {
            "failed_attempt_count": attempt.failed_attempt_count,
            "attempts_remaining": max(0, 3 - attempt.failed_attempt_count),
        }

    @staticmethod
    def _clear_failed_attempts(user_id, event_id, session_date):
        attempt = OnlineCheckInService._attempt_row(user_id, event_id, session_date)
        if attempt:
            db.session.delete(attempt)
            db.session.commit()

    @staticmethod
    def _is_online_event(event):
        location_type = event.location_type if event.location_type is not None else 1
        return int(location_type) in (0, 2)

    @staticmethod
    def _serialize_code(code_row, event, regenerated=False):
        participant_count = Participant.query.filter_by(event_id=event.id, status=1).count()
        return {
            "event_id": event.id,
            "event_title": event.title,
            "session_date": code_row.session_date.isoformat(),
            "code": code_row.code,
            "regenerated": regenerated,
            "participant_count": participant_count,
            "message": "Online check-in code ready.",
        }

    @staticmethod
    def _notify_attendees_code_ready(event, code_row):
        participants = (
            Participant.query.filter(
                Participant.event_id == event.id,
                Participant.status == 1,
                Participant.user_id > 0,
            )
            .order_by(Participant.id.asc())
            .all()
        )
        seen_users = set()
        notification_count = 0
        session_label = code_row.session_date.strftime("%d %b %Y") if code_row.session_date else "today"
        message = (
            f"{event.title or 'Your online session'} check-in code is {code_row.code}. "
            f"Use it for the {session_label} session."
        )

        for participant in participants:
            if participant.user_id in seen_users:
                continue
            seen_users.add(participant.user_id)
            db.session.add(Notification_History(
                user_id=participant.user_id,
                participant_id=participant.id,
                event_id=event.id,
                push=True,
                sms=False,
                email=False,
                type=7,
                send_to=2,
                task_id=f"online-checkin-code-{event.id}-{code_row.session_date}",
                title="Online check-in code ready",
                message=message,
                seen=0,
                status=1,
                created_on=datetime.utcnow(),
            ))
            notification_count += 1

        return notification_count

    @staticmethod
    def get_or_create_code(event, session_date=None, actor_id=0, regenerate=False, fixed_code=None):
        OnlineCheckInService.ensure_storage()
        if not event:
            raise ServiceError("Event not found")
        if not OnlineCheckInService._is_online_event(event):
            raise ServiceError("Online check-in codes are only for online events")

        resolved_date = OnlineCheckInService._event_session_date(event, session_date)
        code_row = OnlineSessionCheckInCode.query.filter_by(
            event_id=event.id,
            session_date=resolved_date,
        ).first()

        regenerated = False
        if not code_row:
            code_row = OnlineSessionCheckInCode(
                event_id=event.id,
                session_date=resolved_date,
                code=fixed_code or OnlineCheckInService._generate_code(),
                created_by=actor_id or 0,
                updated_by=actor_id or 0,
            )
            db.session.add(code_row)
            regenerated = True
        elif regenerate:
            code_row.code = fixed_code or OnlineCheckInService._generate_code()
            code_row.updated_by = actor_id or 0
            code_row.updated_on = datetime.utcnow()
            regenerated = True

        notification_count = 0
        if regenerated:
            notification_count = OnlineCheckInService._notify_attendees_code_ready(event, code_row)

        db.session.commit()
        OnlineCheckInService._log(
            f"code event_id={event.id} session_date={resolved_date} regenerated={int(regenerated)} notifications={notification_count}"
        )
        response = OnlineCheckInService._serialize_code(code_row, event, regenerated=regenerated)
        response["notification_count"] = notification_count
        return response

    @staticmethod
    def get_code_for_event(event, session_date):
        OnlineCheckInService.ensure_storage()
        return OnlineSessionCheckInCode.query.filter_by(
            event_id=event.id,
            session_date=session_date,
            status=1,
        ).first()

    @staticmethod
    def owned_event(event_id, user_id):
        if not event_id:
            raise ServiceError("event_id is required")
        event = Event.query.filter_by(id=event_id, user_id=user_id).first()
        if not event:
            raise ServiceError("Event not found")
        return event

    @staticmethod
    def _participant_for_user(user_id, participant_id=None, event_id=None):
        query = Participant.query.filter(Participant.user_id == user_id, Participant.status == 1)
        if participant_id:
            query = query.filter(Participant.id == participant_id)
        if event_id:
            query = query.filter(Participant.event_id == event_id)
        participant = query.order_by(Participant.id.asc()).first()
        if not participant:
            raise ServiceError("Booked ticket not found")
        return participant

    @staticmethod
    def _pending_attendance(participant, allow_future=False, attendance_date=None):
        query = ParticipantsAttendance.query.filter_by(
            participant_id=participant.id,
            event_id=participant.event_id,
        )
        if attendance_date:
            query = query.filter(ParticipantsAttendance.attendance_date == attendance_date)
        elif allow_future:
            query = query.filter(ParticipantsAttendance.status != 1).order_by(ParticipantsAttendance.attendance_date.asc())
            return query.first()
        else:
            event = Event.query.get(participant.event_id)
            query = query.filter(ParticipantsAttendance.attendance_date == OnlineCheckInService._event_today(event))
        return query.first()

    @staticmethod
    def _pending_or_create_attendance(participant, allow_future=False, attendance_date=None):
        attendance = OnlineCheckInService._pending_attendance(
            participant,
            allow_future=allow_future,
            attendance_date=attendance_date,
        )
        if attendance:
            return attendance

        if not allow_future:
            return None

        event = Event.query.get(participant.event_id)
        if not event:
            raise ServiceError("Event not found")

        completed_attendance = (
            ParticipantsAttendance.query.filter_by(
                participant_id=participant.id,
                event_id=participant.event_id,
                status=1,
            )
            .order_by(ParticipantsAttendance.attendance_date.asc())
            .first()
        )
        if completed_attendance:
            raise ServiceError("This booked session is already complete")

        resolved_date = attendance_date or OnlineCheckInService._event_first_session_date(event)
        if not resolved_date:
            raise ServiceError("No check-in session is open for this booking")

        attendance = ParticipantsAttendance(
            participant_id=participant.id,
            event_id=participant.event_id,
            attendance_date=resolved_date,
            status=0,
            created_on=datetime.utcnow(),
            updated_on=datetime.utcnow(),
        )
        db.session.add(attendance)
        db.session.commit()
        OnlineCheckInService._debug_log(
            f"created-missing-attendance event_id={participant.event_id} participant_id={participant.id} attendance_date={resolved_date}"
        )
        return attendance

    @staticmethod
    def _first_pending_booked_attendance(user_id):
        row = (
            db.session.query(Participant, ParticipantsAttendance, Event)
            .join(Event, Event.id == Participant.event_id)
            .join(
                ParticipantsAttendance,
                ParticipantsAttendance.participant_id == Participant.id,
            )
            .filter(
                Participant.user_id == user_id,
                Participant.status == 1,
                Event.status == 1,
                ParticipantsAttendance.status != 1,
            )
            .order_by(ParticipantsAttendance.attendance_date.asc(), Participant.id.asc())
            .first()
        )
        if not row:
            fallback = (
                db.session.query(Participant, Event)
                .join(Event, Event.id == Participant.event_id)
                .filter(
                    Participant.user_id == user_id,
                    Participant.status == 1,
                    Event.status == 1,
                )
                .order_by(Event.start_date.asc(), Participant.id.asc())
                .first()
            )
            if not fallback:
                raise ServiceError("No pending booked sessions found")
            participant, event = fallback
            attendance = OnlineCheckInService._pending_or_create_attendance(participant, allow_future=True)
            return participant, attendance, event
        return row

    @staticmethod
    def _mark_attendance(user_id, participant, attendance, source):
        if not attendance:
            raise ServiceError("No attendance session found")
        if attendance.status == 1:
            raise ServiceError("This booked session is already complete")

        now = datetime.utcnow()
        attendance.status = 1
        attendance.updated_on = now
        db.session.flush()

        pending_count = ParticipantsAttendance.query.filter(
            ParticipantsAttendance.participant_id == participant.id,
            ParticipantsAttendance.event_id == participant.event_id,
            ParticipantsAttendance.status != 1,
        ).count()
        if pending_count == 0:
            participant.status = 3
            participant.updated_on = now

        db.session.commit()
        summary = GamificationService.award_check_in(user_id, attendance, source=source)
        OnlineCheckInService._log(
            f"{source} user_id={user_id} event_id={participant.event_id} participant_id={participant.id} attendance_id={attendance.id} participant_status={participant.status}"
        )
        return {
            "message": "Session marked complete.",
            "event_id": participant.event_id,
            "participant_id": participant.id,
            "attendance_id": attendance.id,
            "attendance_date": attendance.attendance_date.isoformat() if attendance.attendance_date else None,
            "gamification_summary": summary,
        }

    @staticmethod
    def validate_online_check_in(user_id, request_data):
        OnlineCheckInService.ensure_storage()
        participant_id = request_data.get("ticket_id") or request_data.get("participant_id")
        event_id = request_data.get("event_id")
        code = str(request_data.get("code") or "").strip().replace(" ", "")
        debug_allow_future = bool(request_data.get("debug_allow_future"))

        if not code:
            raise ServiceError("Check-in code is required")
        if debug_allow_future and not OnlineCheckInService._dev_debug_enabled():
            raise ServiceError("Future check-in is only available when test mode is enabled")

        participant = OnlineCheckInService._participant_for_user(user_id, participant_id, event_id)
        event = Event.query.get(participant.event_id)
        if not event:
            raise ServiceError("Event not found")
        if not OnlineCheckInService._is_online_event(event):
            raise ServiceError("This event does not use online check-in")

        requested_date = OnlineCheckInService._parse_date(request_data.get("session_date"))
        attendance = OnlineCheckInService._pending_or_create_attendance(
            participant,
            allow_future=debug_allow_future,
            attendance_date=requested_date,
        )
        if not attendance and not debug_allow_future:
            attendance = (
                ParticipantsAttendance.query.filter_by(
                    participant_id=participant.id,
                    event_id=participant.event_id,
                )
                .filter(
                    ParticipantsAttendance.status != 1,
                    ParticipantsAttendance.attendance_date >= OnlineCheckInService._event_today(event),
                )
                .order_by(ParticipantsAttendance.attendance_date.asc())
                .first()
            )
        if not attendance:
            raise ServiceError("No online check-in session is open for this booking")

        if not debug_allow_future:
            OnlineCheckInService._ensure_online_check_in_window(event, attendance)

        OnlineCheckInService._ensure_not_rate_limited(
            user_id,
            event.id,
            attendance.attendance_date,
        )

        code_row = OnlineCheckInService.get_code_for_event(event, attendance.attendance_date)
        if not code_row and OnlineCheckInService._dev_debug_enabled():
            OnlineCheckInService._debug_log(
                f"created-default-online-code event_id={event.id} attendance_date={attendance.attendance_date}"
            )
            OnlineCheckInService.get_or_create_code(
                event,
                session_date=attendance.attendance_date,
                actor_id=user_id,
                fixed_code="123456",
            )
            code_row = OnlineCheckInService.get_code_for_event(event, attendance.attendance_date)
        if not code_row:
            raise ServiceError("Online check-in code has not been generated yet")
        if len(code) != 6 or not code.isdigit() or code_row.code != code:
            OnlineCheckInService._record_failed_attempt(
                user_id,
                event.id,
                attendance.attendance_date,
            )
            raise ServiceError("Wrong code number. Check the 6-digit code and try again")

        OnlineCheckInService._clear_failed_attempts(user_id, event.id, attendance.attendance_date)

        return OnlineCheckInService._mark_attendance(user_id, participant, attendance, "validated")

    @staticmethod
    def debug_complete_booked_session(user_id, request_data):
        if not OnlineCheckInService._dev_debug_enabled():
            raise ServiceError("Debug completion is only available when test mode is enabled")

        participant_id = request_data.get("ticket_id") or request_data.get("participant_id")
        if participant_id or request_data.get("event_id"):
            participant = OnlineCheckInService._participant_for_user(user_id, participant_id, request_data.get("event_id"))
            attendance = OnlineCheckInService._pending_or_create_attendance(participant, allow_future=True)
        else:
            participant, attendance, _event = OnlineCheckInService._first_pending_booked_attendance(user_id)

        OnlineCheckInService._debug_log(
            f"complete-request user_id={user_id} event_id={participant.event_id} participant_id={participant.id}"
        )
        return OnlineCheckInService._mark_attendance(user_id, participant, attendance, "debug-complete")
