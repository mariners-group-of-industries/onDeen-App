from datetime import datetime

from sqlalchemy import Index, UniqueConstraint

from .. import db


class OnlineSessionCheckInCode(db.Model):
    __tablename__ = "online_session_checkin_code"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False, index=True)
    session_date = db.Column(db.Date, nullable=False, index=True)
    code = db.Column(db.String(12), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("event_id", "session_date", name="uq_online_checkin_event_session"),
        Index("ix_online_checkin_event_status", "event_id", "status"),
    )


class OnlineCheckInAttempt(db.Model):
    __tablename__ = "online_checkin_attempt"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False, index=True)
    session_date = db.Column(db.Date, nullable=False, index=True)
    failed_attempt_count = db.Column(db.Integer, nullable=False, default=0)
    failure_window_started_at = db.Column(db.DateTime, nullable=True)
    locked_until = db.Column(db.DateTime, nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "event_id",
            "session_date",
            name="uq_online_checkin_attempt_user_session",
        ),
        Index("ix_online_checkin_attempt_lock", "user_id", "event_id", "locked_until"),
    )
