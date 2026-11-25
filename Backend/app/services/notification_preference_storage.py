"""Idempotent bootstrap for organiser notification preferences."""

from app import db
from app.models.users import NotificationPreference


def ensure_notification_preference_storage():
    """Create the additive preference table on old and new databases."""
    bind = db.session.get_bind()
    if bind is None:
        return
    NotificationPreference.__table__.create(bind=bind, checkfirst=True)
