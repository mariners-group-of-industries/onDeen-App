"""Compatibility storage for the non-payment ticket-capacity contract.

Railway databases are long-lived and ``db.create_all`` does not add columns to
existing tables.  Keep this additive and idempotent so old deployments can
accept the organiser ticket editor without recreating or rewriting data.
"""

from sqlalchemy import inspect, text

from app import db
from app.models.event import EventTicket


def ensure_event_ticket_storage():
    """Create the ticket table/column when the connected database needs it."""
    bind = db.session.get_bind()
    if bind is None:
        return

    inspector = inspect(bind)
    table_names = set(inspector.get_table_names())
    if "event_tickets" not in table_names and "event" not in table_names:
        return

    EventTicket.__table__.create(bind=bind, checkfirst=True)
    inspector = inspect(bind)

    columns = {column["name"] for column in inspector.get_columns("event_tickets")}
    if "max_per_user" in columns:
        return

    with bind.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE event_tickets "
                "ADD COLUMN max_per_user INTEGER NOT NULL DEFAULT 1"
            )
        )
