from datetime import datetime

from sqlalchemy import Index, UniqueConstraint

from .. import db


class GuestBooking(db.Model):
    __tablename__ = "guest_booking"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False, index=True)
    participant_id = db.Column(db.Integer, db.ForeignKey("participant.id"), nullable=False, unique=True, index=True)
    shadow_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    migrated_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    first_name = db.Column(db.String(150), nullable=False)
    last_name = db.Column(db.String(150), nullable=True)
    email_id = db.Column(db.String(200), nullable=False, index=True)
    country_code = db.Column(db.String(20), nullable=False)
    mobile_number = db.Column(db.String(100), nullable=False, index=True)
    ip_address = db.Column(db.String(64), nullable=True, index=True)
    status = db.Column(db.Integer, nullable=False, default=1)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    migrated_on = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "event_id",
            "email_id",
            "country_code",
            "mobile_number",
            name="uq_guest_booking_lookup",
        ),
        Index("ix_guest_booking_contact", "email_id", "country_code", "mobile_number"),
    )
