"""Idempotent bootstrap for organiser approval applications."""

from app import db
from app.models.organizer_application import OrganizerApplication


def ensure_organizer_application_storage():
    """Create the additive application table on old and new databases."""
    bind = db.session.get_bind()
    if bind is None:
        return
    OrganizerApplication.__table__.create(bind=bind, checkfirst=True)

