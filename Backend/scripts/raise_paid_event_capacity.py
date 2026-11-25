#!/usr/bin/env python3
"""Raise live paid-listing capacity without changing prices or bookings."""

import argparse
import json

from app import db, on_deen
from app.models.event import Event, EventDate, EventDateTime, EventTicket


def _snapshot(event):
    tickets = EventTicket.query.filter_by(event_id=event.id, status=1).order_by(EventTicket.id).all()
    sessions = (
        EventDateTime.query.join(EventDate, EventDate.id == EventDateTime.event_date_id)
        .filter(EventDate.event_id == event.id, EventDateTime.status == 1)
        .order_by(EventDateTime.id)
        .all()
    )
    return {
        "id": event.id,
        "title": event.title,
        "available": int(event.available or 0),
        "booked": int(event.booked or 0),
        "quantity_per_user": int(event.quantity_per_user or 0),
        "tickets": [
            {
                "id": ticket.id,
                "available": int(ticket.available or 0),
                "booked": int(ticket.booked or 0),
                "max_per_user": int(ticket.max_per_user or 0),
            }
            for ticket in tickets
        ],
        "sessions": [
            {
                "id": session.id,
                "available": int(session.available or 0),
                "booked": int(session.booked or 0),
            }
            for session in sessions
        ],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--remaining", type=int, default=100)
    parser.add_argument("--per-user", type=int, default=100)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if args.remaining < 100 or args.per_user < 1:
        parser.error("remaining must be at least 100 and per-user must be positive")

    app = on_deen()
    with app.app_context():
        events = Event.query.filter(Event.price_type == 1, Event.status == 1).order_by(Event.id).all()
        before = [_snapshot(event) for event in events]

        if args.apply:
            for event in events:
                event.available = max(int(event.available or 0), int(event.booked or 0) + args.remaining)
                event.quantity_per_user = max(int(event.quantity_per_user or 0), args.per_user)

                for ticket in EventTicket.query.filter_by(event_id=event.id, status=1).all():
                    ticket.available = max(int(ticket.available or 0), int(ticket.booked or 0) + args.remaining)
                    ticket.max_per_user = max(int(ticket.max_per_user or 0), args.per_user)

                sessions = (
                    EventDateTime.query.join(EventDate, EventDate.id == EventDateTime.event_date_id)
                    .filter(EventDate.event_id == event.id, EventDateTime.status == 1)
                    .all()
                )
                for session in sessions:
                    session.available = max(int(session.available or 0), int(session.booked or 0) + args.remaining)

            db.session.commit()

        after = [_snapshot(event) for event in events]
        print(json.dumps({"applied": args.apply, "event_count": len(events), "before": before, "after": after}))


if __name__ == "__main__":
    main()
