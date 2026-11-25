"""Persisted organiser applications and their review state.

The application table is deliberately additive.  Existing seeded organisers
remain active and do not need a synthetic application row; only a new
organisation submission creates one.
"""

from datetime import datetime

from .. import db


class OrganizerApplication(db.Model):
    __tablename__ = "organizer_applications"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    user = db.relationship("Users", foreign_keys=[user_id], lazy=True)
    status = db.Column(db.String(32), nullable=False, default="UNDER_REVIEW")
    submitted_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    reviewed_on = db.Column(db.DateTime, nullable=True)
    reviewed_by = db.Column(db.Integer, nullable=True)
    review_note = db.Column(db.Text, nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
