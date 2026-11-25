import hashlib
import json
import os
import secrets
import uuid
from calendar import monthcalendar
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from zoneinfo import ZoneInfo

import stripe
from sqlalchemy import and_, func, inspect, or_, text

from app import db
from app.models.event import Event, EventDate, EventDateTime, EventTicket, Participant
from app.models.guest_booking import GuestBooking
from app.models.payment import (
    FinancialLedgerEntry,
    PaymentOrder,
    PaymentOrderItem,
    PayoutRecord,
    RefundRequest,
    StripeConnectedAccount,
    StripeEventReceipt,
)
from app.models.users import Notification_History, Users
from app.utils.custom_exception import ServiceError


class PaymentService:
    CURRENCY = "gbp"
    MAX_PAYMENT_AMOUNT_PENCE = 99_999_999
    CLAIM_STALE_AFTER = timedelta(minutes=10)
    CONFIRMED_STATUSES = {"confirmed", "payout_pending", "payout_processing", "paid_out", "partially_refunded", "refunded"}
    ACTIVE_BOOKING_STATUSES = {"confirmed", "payout_pending", "payout_processing", "paid_out", "partially_refunded"}
    NO_REFRESH_STATUSES = {"refund_processing", "refunded"}
    REFUND_PROTECTED_STATUSES = {"refund_processing", "partially_refunded", "refunded"}
    ACTIVE_REFUND_STATUSES = {"requested", "approved_awaiting_ondeen", "processing"}
    MAX_AUTOMATIC_CANCELLATION_REFUND_ATTEMPTS = 3
    BANK_HOLIDAY_CALENDAR_RULESET = "gov.uk-england-and-wales-2026-09-05-v1"

    @staticmethod
    def ensure_storage():
        bind = db.session.get_bind()
        for model in (
            StripeConnectedAccount,
            PaymentOrder,
            PaymentOrderItem,
            FinancialLedgerEntry,
            StripeEventReceipt,
            RefundRequest,
            PayoutRecord,
        ):
            model.__table__.create(bind=bind, checkfirst=True)
        schema = inspect(bind)
        receipt_columns = {
            column["name"] for column in schema.get_columns(StripeEventReceipt.__tablename__)
        }
        statements = []
        timestamp_type = (
            "TIMESTAMP WITHOUT TIME ZONE"
            if bind.dialect.name == "postgresql"
            else "DATETIME"
        )
        if "attempt_count" not in receipt_columns:
            statements.append(
                "ALTER TABLE stripe_event_receipt ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 1"
            )
        if "last_attempt_on" not in receipt_columns:
            statements.append(
                f"ALTER TABLE stripe_event_receipt ADD COLUMN last_attempt_on {timestamp_type}"
            )
        receipt_storage_changed = bool(statements)
        payout_columns = {
            column["name"] for column in schema.get_columns(PayoutRecord.__tablename__)
        }
        if "eligibility_start_on" not in payout_columns:
            statements.append(
                f"ALTER TABLE payment_payout_record ADD COLUMN eligibility_start_on {timestamp_type}"
            )
        if "eligibility_time_zone" not in payout_columns:
            statements.append(
                "ALTER TABLE payment_payout_record ADD COLUMN eligibility_time_zone VARCHAR(64)"
            )
        if "bank_holiday_calendar_version" not in payout_columns:
            statements.append(
                "ALTER TABLE payment_payout_record ADD COLUMN bank_holiday_calendar_version VARCHAR(120)"
            )
        for statement in statements:
            db.session.execute(text(statement))
        if receipt_storage_changed:
            db.session.execute(text(
                "UPDATE stripe_event_receipt "
                "SET last_attempt_on = COALESCE(last_attempt_on, created_on)"
            ))
        if statements:
            db.session.commit()

    @staticmethod
    def _enabled():
        return os.getenv("PAYMENT_P0_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}

    @staticmethod
    def _stripe_key():
        key = (os.getenv("STRIPE_SECRET_KEY") or os.getenv("stripe_api_key") or "").strip()
        if not key.startswith(("rk_test_", "sk_test_")):
            raise ServiceError("Stripe Test is not configured")
        stripe.api_key = key
        return key

    @staticmethod
    def _require_enabled():
        if not PaymentService._enabled():
            raise ServiceError("Payments are temporarily unavailable")
        PaymentService._stripe_key()

    @staticmethod
    def _json(value):
        return json.dumps(value, separators=(",", ":"), sort_keys=True, default=str)

    @staticmethod
    def _safe_stripe_message(error, fallback="Stripe could not complete the request"):
        user_message = getattr(error, "user_message", None)
        return str(user_message or fallback)[:500]

    @staticmethod
    def _pence(value):
        try:
            decimal_value = Decimal(str(value or 0))
        except Exception:
            raise ServiceError("Invalid ticket price")
        return int((decimal_value * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))

    @staticmethod
    def _whole_number(value, error_message):
        if isinstance(value, bool) or isinstance(value, float):
            raise ServiceError(error_message)
        if isinstance(value, int):
            return value
        if isinstance(value, str):
            normalized = value.strip()
            digits = normalized[1:] if normalized.startswith("-") else normalized
            if digits.isdigit():
                return int(normalized)
        raise ServiceError(error_message)

    @staticmethod
    def fee_per_unit(unit_price_pence):
        raw = (Decimal(unit_price_pence) * Decimal("0.05")).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        return min(150, max(30, int(raw)))

    @staticmethod
    def _connected_record(organizer_id):
        PaymentService.ensure_storage()
        return StripeConnectedAccount.query.filter_by(organizer_id=organizer_id).first()

    @staticmethod
    def _sync_connected_record(record, account):
        requirements = getattr(account, "requirements", None) or {}
        if isinstance(requirements, dict):
            currently_due = list(requirements.get("currently_due", []) or [])
            disabled_reason = requirements.get("disabled_reason")
        else:
            currently_due = list(getattr(requirements, "currently_due", None) or [])
            disabled_reason = getattr(requirements, "disabled_reason", None)
        record.details_submitted = bool(getattr(account, "details_submitted", False))
        record.charges_enabled = bool(getattr(account, "charges_enabled", False))
        record.payouts_enabled = bool(getattr(account, "payouts_enabled", False))
        record.requirements_due = PaymentService._json(currently_due)
        record.disabled_reason = disabled_reason
        record.updated_on = datetime.utcnow()
        return record

    @staticmethod
    def connected_status(organizer_id, refresh=True):
        PaymentService.ensure_storage()
        record = PaymentService._connected_record(organizer_id)
        refresh_failed = False
        if record and refresh and PaymentService._enabled():
            try:
                PaymentService._stripe_key()
                account = stripe.Account.retrieve(record.stripe_account_id)
                PaymentService._sync_connected_record(record, account)
                db.session.commit()
            except Exception:
                db.session.rollback()
                record = PaymentService._connected_record(organizer_id)
                refresh_failed = True

        ready = bool(
            record
            and record.details_submitted
            and record.charges_enabled
            and record.payouts_enabled
            and not json.loads(record.requirements_due or "[]")
            and not record.disabled_reason
            and not refresh_failed
        )
        return {
            "connected": bool(record),
            "ready": ready,
            "details_submitted": bool(record and record.details_submitted),
            "charges_enabled": bool(record and record.charges_enabled),
            "payouts_enabled": bool(record and record.payouts_enabled),
            "requirements_due": json.loads(record.requirements_due or "[]") if record else [],
            "disabled_reason": record.disabled_reason if record else None,
            "temporarily_unavailable": refresh_failed,
        }

    @staticmethod
    def create_onboarding_link(organizer_id):
        PaymentService._require_enabled()
        user = db.session.get(Users, organizer_id)
        if not user or user.role_type != 3:
            raise ServiceError("Organiser account required")

        record = PaymentService._connected_record(organizer_id)
        try:
            if not record:
                account = stripe.Account.create(
                    type="express",
                    country="GB",
                    email=user.email_id or None,
                    capabilities={
                        "card_payments": {"requested": True},
                        "transfers": {"requested": True},
                    },
                    metadata={"ondeen_organizer_id": str(organizer_id)},
                    idempotency_key=f"ondeen-connect-organizer-{organizer_id}",
                )
                record = StripeConnectedAccount(
                    organizer_id=organizer_id,
                    stripe_account_id=account.id,
                )
                PaymentService._sync_connected_record(record, account)
                db.session.add(record)
                db.session.commit()

            refresh_url = os.getenv("STRIPE_CONNECT_REFRESH_URL", "ondeenorganiser://stripe-connect/refresh")
            return_url = os.getenv("STRIPE_CONNECT_RETURN_URL", "ondeenorganiser://stripe-connect/return")
            link = stripe.AccountLink.create(
                account=record.stripe_account_id,
                refresh_url=refresh_url,
                return_url=return_url,
                type="account_onboarding",
            )
            return {**PaymentService.connected_status(organizer_id, refresh=False), "url": link.url}
        except ServiceError:
            raise
        except Exception as error:
            db.session.rollback()
            raise ServiceError(PaymentService._safe_stripe_message(error, "Stripe onboarding is unavailable"))

    @staticmethod
    def require_paid_listing_ready(organizer_id):
        status = PaymentService.connected_status(organizer_id, refresh=True)
        if not status["ready"]:
            raise ServiceError("Connect Stripe and complete payments and payouts setup before publishing a paid listing")
        return status

    @staticmethod
    def _validate_items(event, buyer_user_id, request_data):
        raw_quantity = request_data.get("quantity")
        quantity = 0 if raw_quantity in (None, "") else PaymentService._whole_number(
            raw_quantity,
            "Ticket quantity must be a positive whole number",
        )

        requested_tickets = request_data.get("tickets") or []
        items = []
        total_quantity = 0
        seen_ticket_ids = set()
        if requested_tickets:
            if event.ticket_type != 1:
                raise ServiceError("Ticket types are not available for this listing")
            for requested in requested_tickets:
                if not isinstance(requested, dict):
                    raise ServiceError("Invalid ticket selection")
                ticket_id = PaymentService._whole_number(requested.get("id"), "Invalid ticket selection")
                item_quantity = PaymentService._whole_number(
                    requested.get("quantity"),
                    "Invalid ticket selection",
                )
                if ticket_id in seen_ticket_ids:
                    raise ServiceError("Duplicate ticket selection")
                seen_ticket_ids.add(ticket_id)
                ticket = EventTicket.query.filter_by(id=ticket_id, event_id=event.id, status=1).first()
                if not ticket or item_quantity < 1:
                    raise ServiceError("Invalid or inactive ticket")
                if int(ticket.available or 0) - int(ticket.booked or 0) < item_quantity:
                    raise ServiceError(f"Ticket {ticket.title} is not available for the selected quantity")
                already_booked = db.session.query(func.coalesce(func.sum(Participant.quantity), 0)).filter(
                    Participant.event_id == event.id,
                    Participant.user_id == buyer_user_id,
                    Participant.ticket_id == ticket.id,
                    Participant.status.in_((1, 3)),
                ).scalar() or 0
                if int(already_booked) + item_quantity > int(ticket.max_per_user or 1):
                    raise ServiceError("Maximum tickets allowed for this ticket type reached")
                unit_price = PaymentService._pence(ticket.price)
                if unit_price <= 0:
                    raise ServiceError("Paid tickets must have a positive price")
                items.append({
                    "ticket_id": ticket.id,
                    "title": ticket.title or event.title,
                    "quantity": item_quantity,
                    "unit_price_pence": unit_price,
                    "fee_per_unit_pence": PaymentService.fee_per_unit(unit_price),
                })
                total_quantity += item_quantity
        else:
            if event.ticket_type == 1:
                raise ServiceError("Ticket selection is required")
            if quantity < 1:
                raise ServiceError("At least one ticket is required")
            if int(event.available or 0) - int(event.booked or 0) < quantity:
                raise ServiceError("Not available for selected quantity")
            unit_price = PaymentService._pence(event.price)
            if unit_price <= 0:
                raise ServiceError("Paid tickets must have a positive price")
            items.append({
                "ticket_id": None,
                "title": event.title,
                "quantity": quantity,
                "unit_price_pence": unit_price,
                "fee_per_unit_pence": PaymentService.fee_per_unit(unit_price),
            })
            total_quantity = quantity

        already_total = db.session.query(func.coalesce(func.sum(Participant.quantity), 0)).filter(
            Participant.event_id == event.id,
            Participant.user_id == buyer_user_id,
            Participant.status.in_((1, 3)),
        ).scalar() or 0
        if int(already_total) + total_quantity > int(event.quantity_per_user or 1):
            raise ServiceError("Maximum tickets allowed per user reached")

        return items

    @staticmethod
    def _selection_signature(items):
        return sorted(
            (int(item.get("ticket_id") or 0), int(item.get("quantity") or 0))
            for item in items
        )

    @staticmethod
    def _existing_selection_signature(order):
        return sorted(
            (int(item.ticket_id or 0), int(item.quantity or 0))
            for item in order.items
        )

    @staticmethod
    def _create_payment_intent(order):
        return stripe.PaymentIntent.create(
            amount=order.gross_amount_pence,
            currency=order.currency,
            # Keep checkout card/wallet-first. Redirect methods require a
            # browser return URL that a native app cannot guarantee; native
            # PaymentSheet still supports cards and Apple/Google Pay.
            automatic_payment_methods={"enabled": True, "allow_redirects": "never"},
            metadata={
                "ondeen_order_key": order.order_key,
                "ondeen_event_id": str(order.event_id),
                "ondeen_organizer_id": str(order.organizer_id),
            },
            transfer_group=f"ondeen_order_{order.order_key}",
            idempotency_key=f"payment-intent-{order.order_key}",
        )

    @staticmethod
    def _store_guest_recovery_token(order, recovery_token):
        if not recovery_token:
            return
        payload = json.loads(order.booking_payload or "{}")
        payload["guest_recovery_token_hash"] = hashlib.sha256(recovery_token.encode()).hexdigest()
        order.booking_payload = PaymentService._json(payload)

    @staticmethod
    def create_order(buyer_user_id, request_data, guest=None):
        PaymentService._require_enabled()
        PaymentService.ensure_storage()
        request_data = dict(request_data or {})
        supplied_currency = str(request_data.get("currency") or "").strip().lower()
        if supplied_currency and supplied_currency != PaymentService.CURRENCY:
            raise ServiceError("Only GBP payments are supported")
        client_money_fields = {
            "amount", "amount_pence", "total", "total_pence", "fee", "fee_pence",
            "ondeen_fee", "ondeen_fee_pence", "organizer_net_pence",
        }
        if client_money_fields.intersection(request_data):
            raise ServiceError("Payment totals are calculated securely by OnDeen")
        event_id = request_data.get("event_id")
        event = Event.query.filter_by(id=event_id, status=1).with_for_update().first()
        if not event:
            raise ServiceError("Invalid or inactive event")
        if event.price_type != 1:
            raise ServiceError("This listing does not require payment")
        PaymentService.require_paid_listing_ready(event.user_id)

        items = PaymentService._validate_items(event, buyer_user_id, request_data)
        gross = sum(item["unit_price_pence"] * item["quantity"] for item in items)
        ondeen_fee = sum(item["fee_per_unit_pence"] * item["quantity"] for item in items)
        if gross <= ondeen_fee:
            raise ServiceError("Ticket price is too low for payment processing")
        if gross > PaymentService.MAX_PAYMENT_AMOUNT_PENCE:
            raise ServiceError("Payment amount exceeds the supported limit")

        supplied_key = str(request_data.get("idempotency_key") or "").strip()
        idempotency_key = supplied_key[:255] if supplied_key else f"booking-{uuid.uuid4()}"
        guest_data = dict(guest or {})
        recovery_token = secrets.token_urlsafe(32) if guest_data else None
        existing = PaymentOrder.query.filter_by(idempotency_key=idempotency_key).first()
        if existing:
            same_guest = (
                existing.guest_email == guest_data.get("email_id")
                and existing.guest_country_code == guest_data.get("country_code")
                and existing.guest_mobile_number == guest_data.get("mobile_number")
            ) if guest_data else not existing.guest_email
            if (
                existing.buyer_user_id != buyer_user_id
                or existing.event_id != event.id
                or not same_guest
                or PaymentService._existing_selection_signature(existing)
                != PaymentService._selection_signature(items)
            ):
                raise ServiceError("Idempotency key is already in use")
            PaymentService._store_guest_recovery_token(existing, recovery_token)
            client_secret = None
            if existing.stripe_payment_intent_id and existing.status not in PaymentService.CONFIRMED_STATUSES:
                try:
                    existing_intent = stripe.PaymentIntent.retrieve(existing.stripe_payment_intent_id)
                    client_secret = getattr(existing_intent, "client_secret", None)
                except Exception:
                    client_secret = None
            elif not existing.stripe_payment_intent_id and existing.status in {"creating_intent", "payment_failed"}:
                try:
                    existing_intent = PaymentService._create_payment_intent(existing)
                    existing.stripe_payment_intent_id = existing_intent.id
                    existing.status = "requires_payment"
                    existing.failure_message = None
                    client_secret = getattr(existing_intent, "client_secret", None)
                except Exception as error:
                    existing.status = "payment_failed"
                    existing.failure_message = PaymentService._safe_stripe_message(error)
                    db.session.commit()
                    raise ServiceError(existing.failure_message)
            db.session.commit()
            payload = PaymentService.order_payload(existing, include_secret=True, client_secret=client_secret)
            if recovery_token:
                payload["recovery_token"] = recovery_token
            return payload

        if recovery_token:
            request_data["guest_recovery_token_hash"] = hashlib.sha256(recovery_token.encode()).hexdigest()
        order = PaymentOrder(
            order_key=uuid.uuid4().hex,
            idempotency_key=idempotency_key,
            event_id=event.id,
            organizer_id=event.user_id,
            buyer_user_id=buyer_user_id,
            guest_email=guest_data.get("email_id"),
            guest_country_code=guest_data.get("country_code"),
            guest_mobile_number=guest_data.get("mobile_number"),
            guest_ip_address=guest_data.get("ip_address"),
            currency=PaymentService.CURRENCY,
            quantity=sum(item["quantity"] for item in items),
            gross_amount_pence=gross,
            ondeen_fee_pence=ondeen_fee,
            status="creating_intent",
            booking_payload=PaymentService._json(request_data),
        )
        db.session.add(order)
        db.session.flush()
        for item in items:
            db.session.add(PaymentOrderItem(
                order_id=order.id,
                ticket_id=item["ticket_id"],
                title=item["title"],
                quantity=item["quantity"],
                unit_price_pence=item["unit_price_pence"],
                ondeen_fee_per_unit_pence=item["fee_per_unit_pence"],
            ))
        db.session.commit()

        try:
            intent = PaymentService._create_payment_intent(order)
            order.stripe_payment_intent_id = intent.id
            order.status = "requires_payment"
            db.session.commit()
            payload = PaymentService.order_payload(order, include_secret=True, client_secret=intent.client_secret)
            if recovery_token:
                payload["recovery_token"] = recovery_token
            return payload
        except Exception as error:
            order.status = "payment_failed"
            order.failure_message = PaymentService._safe_stripe_message(error)
            db.session.commit()
            raise ServiceError(order.failure_message)

    @staticmethod
    def _metadata_value(obj, key):
        metadata = getattr(obj, "metadata", None) or {}
        return getattr(metadata, key, None) or metadata.get(key)

    @staticmethod
    def _intent_object_id(value):
        return value if isinstance(value, str) else getattr(value, "id", None)

    @staticmethod
    def _ledger(order, entry_type, amount_pence, suffix, stripe_object_id=None, detail=None):
        key = f"order:{order.order_key}:{suffix}"
        existing = FinancialLedgerEntry.query.filter_by(idempotency_key=key).first()
        if existing:
            return existing
        entry = FinancialLedgerEntry(
            order_id=order.id,
            organizer_id=order.organizer_id,
            event_id=order.event_id,
            entry_type=entry_type,
            amount_pence=int(amount_pence),
            currency=order.currency,
            stripe_object_id=stripe_object_id,
            idempotency_key=key,
            detail_json=PaymentService._json(detail or {}),
        )
        db.session.add(entry)
        return entry

    @staticmethod
    def _uk_easter(year):
        a = year % 19
        b, c = divmod(year, 100)
        d, e = divmod(b, 4)
        f = (b + 8) // 25
        g = (b - f + 1) // 3
        h = (19 * a + b - d - g + 15) % 30
        i, k = divmod(c, 4)
        l = (32 + 2 * e + 2 * i - h - k) % 7
        m = (a + 11 * h + 22 * l) // 451
        month = (h + l - 7 * m + 114) // 31
        day = ((h + l - 7 * m + 114) % 31) + 1
        return date(year, month, day)

    @staticmethod
    def _observed(day, occupied):
        while day.weekday() >= 5 or day in occupied:
            day += timedelta(days=1)
        return day

    @staticmethod
    def england_wales_bank_holidays(year):
        holidays = set()
        new_year = PaymentService._observed(date(year, 1, 1), holidays)
        holidays.add(new_year)
        easter = PaymentService._uk_easter(year)
        holidays.update({easter - timedelta(days=2), easter + timedelta(days=1)})
        may_weeks = monthcalendar(year, 5)
        holidays.add(next(date(year, 5, week[0]) for week in may_weeks if week[0]))
        holidays.add(date(year, 5, max(week[0] for week in may_weeks)))
        august_weeks = monthcalendar(year, 8)
        holidays.add(date(year, 8, max(week[0] for week in august_weeks)))
        christmas = PaymentService._observed(date(year, 12, 25), holidays)
        holidays.add(christmas)
        holidays.add(PaymentService._observed(date(year, 12, 26), holidays))
        return holidays

    @staticmethod
    def _bank_holiday_calendar_version(years):
        normalized_years = sorted(set(years))
        holiday_dates = sorted(
            holiday.isoformat()
            for year in normalized_years
            for holiday in PaymentService.england_wales_bank_holidays(year)
        )
        digest = hashlib.sha256("\n".join(holiday_dates).encode("utf-8")).hexdigest()[:16]
        year_range = f"{normalized_years[0]}-{normalized_years[-1]}"
        return f"{PaymentService.BANK_HOLIDAY_CALENDAR_RULESET}:{year_range}:{digest}"

    @staticmethod
    def _first_start(event):
        scheduled = (
            db.session.query(EventDate.date, EventDateTime.start_time)
            .join(EventDateTime, EventDateTime.event_date_id == EventDate.id)
            .filter(
                EventDate.event_id == event.id,
                EventDate.status == 1,
                EventDateTime.status == 1,
            )
            .order_by(EventDate.date.asc(), EventDateTime.start_time.asc())
            .first()
        )
        start_day = scheduled[0] if scheduled else event.start_date.date()
        start_time = scheduled[1] if scheduled else (event.start_time or time(0, 0))
        try:
            event_zone = ZoneInfo(event.time_zone or "Europe/London")
        except Exception:
            event_zone = ZoneInfo("Europe/London")
        return datetime.combine(start_day, start_time, tzinfo=event_zone)

    @staticmethod
    def eligibility_for_event(event):
        return PaymentService.eligibility_snapshot_for_event(event)["eligible_on"]

    @staticmethod
    def eligibility_snapshot_for_event(event):
        starts_at = PaymentService._first_start(event)
        current = starts_at.date()
        remaining = 3
        calendar_years = {current.year}
        while remaining:
            current += timedelta(days=1)
            calendar_years.add(current.year)
            holidays = PaymentService.england_wales_bank_holidays(current.year)
            if current.weekday() < 5 and current not in holidays:
                remaining -= 1
        eligible_local = datetime.combine(current, starts_at.timetz().replace(tzinfo=None), tzinfo=starts_at.tzinfo)
        return {
            "eligibility_start_on": starts_at.astimezone(timezone.utc).replace(tzinfo=None),
            "eligibility_time_zone": getattr(starts_at.tzinfo, "key", None) or event.time_zone or "Europe/London",
            "bank_holiday_calendar_version": PaymentService._bank_holiday_calendar_version(calendar_years),
            "eligible_on": eligible_local.astimezone(timezone.utc).replace(tzinfo=None),
        }

    @staticmethod
    def _booking_payload(order):
        payload = json.loads(order.booking_payload or "{}")
        payload.pop("guest_recovery_token_hash", None)
        payload["_stripe_payment_confirmed"] = True
        payload["_payment_finalize_order_id"] = order.id
        return payload

    @staticmethod
    def _ensure_guest_booking(order, booking_response):
        if not order.guest_email:
            return booking_response
        participant_id = booking_response.get("participant_id")
        participant = db.session.get(Participant, participant_id)
        if not participant:
            raise ServiceError("Confirmed participant is missing")
        existing = GuestBooking.query.filter_by(participant_id=participant.id).first()
        payload = json.loads(order.booking_payload or "{}")
        if not existing:
            existing = GuestBooking(
                event_id=order.event_id,
                participant_id=participant.id,
                shadow_user_id=order.buyer_user_id,
                first_name=payload.get("guest_first_name") or "Guest",
                last_name=payload.get("guest_last_name"),
                email_id=order.guest_email,
                country_code=order.guest_country_code or "+44",
                mobile_number=order.guest_mobile_number or "",
                ip_address=order.guest_ip_address,
                status=1,
            )
            db.session.add(existing)
            db.session.flush()
        from app.services.customer.event import EventService
        event = db.session.get(Event, order.event_id)
        response = EventService._guest_booking_response(existing, participant, event)
        response.update({
            "payment_order_id": order.id,
            "payment_order_key": order.order_key,
            "payment_intent_id": order.stripe_payment_intent_id,
            "payment_status": 1,
        })
        order.booking_response = PaymentService._json(response)
        db.session.commit()
        return response

    @staticmethod
    def _repair_financial_confirmation(order):
        event = db.session.get(Event, order.event_id)
        stripe_cost = int(order.stripe_cost_pence or 0)
        organizer_net = max(0, order.gross_amount_pence - order.ondeen_fee_pence - stripe_cost)
        order.organizer_net_pence = organizer_net
        PaymentService._ledger(order, "gross_sale", order.gross_amount_pence, "gross", order.stripe_charge_id)
        PaymentService._ledger(order, "ondeen_fee", -order.ondeen_fee_pence, "ondeen-fee", order.stripe_charge_id)
        PaymentService._ledger(order, "stripe_cost", -stripe_cost, "stripe-cost", order.stripe_charge_id)
        eligibility = PaymentService.eligibility_snapshot_for_event(event)
        payout = PayoutRecord.query.filter_by(order_id=order.id).first()
        if not payout:
            connected = PaymentService._connected_record(order.organizer_id)
            if not connected:
                raise ServiceError("Organiser Stripe account is missing")
            payout = PayoutRecord(
                order_id=order.id,
                organizer_id=order.organizer_id,
                connected_account_id=connected.id,
                amount_pence=organizer_net,
                currency=order.currency,
                eligibility_start_on=eligibility["eligibility_start_on"],
                eligibility_time_zone=eligibility["eligibility_time_zone"],
                bank_holiday_calendar_version=eligibility["bank_holiday_calendar_version"],
                eligible_on=eligibility["eligible_on"],
                status="pending",
            )
            db.session.add(payout)
        elif payout.status == "pending":
            payout.amount_pence = organizer_net
            payout.eligibility_start_on = eligibility["eligibility_start_on"]
            payout.eligibility_time_zone = eligibility["eligibility_time_zone"]
            payout.bank_holiday_calendar_version = eligibility["bank_holiday_calendar_version"]
            payout.eligible_on = eligibility["eligible_on"]
        order.status = "payout_pending"
        db.session.commit()
        return order

    @staticmethod
    def recalculate_event_eligibility(event_id):
        """Recalculate only payouts that have not yet become eligible or moved funds."""
        PaymentService.ensure_storage()
        event = db.session.get(Event, event_id)
        if not event:
            return 0
        eligibility = PaymentService.eligibility_snapshot_for_event(event)
        payouts = (
            PayoutRecord.query
            .join(PaymentOrder, PaymentOrder.id == PayoutRecord.order_id)
            .filter(
                PaymentOrder.event_id == event_id,
                PayoutRecord.status == "pending",
                PayoutRecord.stripe_transfer_id.is_(None),
            )
            .all()
        )
        for payout in payouts:
            payout.eligibility_start_on = eligibility["eligibility_start_on"]
            payout.eligibility_time_zone = eligibility["eligibility_time_zone"]
            payout.bank_holiday_calendar_version = eligibility["bank_holiday_calendar_version"]
            payout.eligible_on = eligibility["eligible_on"]
        if payouts:
            db.session.commit()
        return len(payouts)

    @staticmethod
    def confirm_order(order, intent=None):
        PaymentService._require_enabled()
        if order.status in PaymentService.CONFIRMED_STATUSES and order.booking_response:
            if order.status == "confirmed":
                PaymentService._repair_financial_confirmation(order)
            return PaymentService.order_payload(order)
        try:
            intent = intent or stripe.PaymentIntent.retrieve(
                order.stripe_payment_intent_id,
                expand=["latest_charge.balance_transaction"],
            )
        except Exception as error:
            raise ServiceError(PaymentService._safe_stripe_message(error, "Payment status is unavailable"))

        if bool(getattr(intent, "livemode", True)):
            raise ServiceError("Live Stripe objects are not allowed in this environment")
        if PaymentService._metadata_value(intent, "ondeen_order_key") != order.order_key:
            raise ServiceError("Payment verification failed")
        if int(getattr(intent, "amount", -1)) != order.gross_amount_pence or str(getattr(intent, "currency", "")).lower() != order.currency:
            raise ServiceError("Payment amount verification failed")

        intent_status = str(getattr(intent, "status", ""))
        if intent_status != "succeeded":
            if intent_status in {"canceled", "requires_payment_method"}:
                order.status = "payment_failed"
                order.failure_message = "Payment was not completed"
                db.session.commit()
            return PaymentService.order_payload(order)

        now = datetime.utcnow()
        stale_before = now - PaymentService.CLAIM_STALE_AFTER
        claimed = PaymentOrder.query.filter(
            PaymentOrder.id == order.id,
            or_(
                PaymentOrder.status.in_(("creating_intent", "requires_payment", "payment_failed")),
                and_(PaymentOrder.status == "confirming", PaymentOrder.updated_on <= stale_before),
            ),
        ).update(
            {PaymentOrder.status: "confirming", PaymentOrder.updated_on: now},
            synchronize_session=False,
        )
        db.session.commit()
        order = db.session.get(PaymentOrder, order.id)
        if claimed != 1:
            return PaymentService.order_payload(order)

        latest_charge = getattr(intent, "latest_charge", None)
        order.stripe_charge_id = PaymentService._intent_object_id(latest_charge)
        balance_transaction = getattr(latest_charge, "balance_transaction", None) if latest_charge else None
        if balance_transaction is None and order.stripe_charge_id:
            try:
                charge = stripe.Charge.retrieve(order.stripe_charge_id, expand=["balance_transaction"])
                balance_transaction = getattr(charge, "balance_transaction", None)
            except Exception:
                balance_transaction = None
        order.stripe_cost_pence = int(getattr(balance_transaction, "fee", 0) or 0)

        from app.services.customer.event import EventService
        try:
            booking_response = EventService.add_participant(order.buyer_user_id, PaymentService._booking_payload(order))
        except Exception as error:
            db.session.rollback()
            PaymentService._queue_fulfilment_refund(order, str(error))
            return PaymentService.order_payload(order)
        if isinstance(booking_response, tuple) or not isinstance(booking_response, dict) or not booking_response.get("participant_id"):
            db.session.rollback()
            PaymentService._queue_fulfilment_refund(order, "Booking finalisation failed")
            return PaymentService.order_payload(order)
        db.session.refresh(order)
        if order.guest_email:
            booking_response = PaymentService._ensure_guest_booking(order, booking_response)
        PaymentService._repair_financial_confirmation(order)
        return PaymentService.order_payload(order)

    @staticmethod
    def _recovery_allowed(order, recovery_token):
        if not order.guest_email:
            return False
        expected = json.loads(order.booking_payload or "{}").get("guest_recovery_token_hash")
        actual = hashlib.sha256(str(recovery_token or "").encode()).hexdigest()
        return bool(expected and secrets.compare_digest(expected, actual))

    @staticmethod
    def get_order(order_key, actor_user_id=None, recovery_token=None, refresh=True):
        PaymentService.ensure_storage()
        order = PaymentOrder.query.filter_by(order_key=order_key).first()
        if not order:
            raise ServiceError("Payment order not found")
        same_actor = actor_user_id is not None and str(actor_user_id) == str(order.buyer_user_id)
        if not same_actor and not PaymentService._recovery_allowed(order, recovery_token):
            raise ServiceError("Payment order is not accessible")
        if refresh and order.status not in PaymentService.CONFIRMED_STATUSES | PaymentService.NO_REFRESH_STATUSES and order.stripe_payment_intent_id:
            return PaymentService.confirm_order(order)
        return PaymentService.order_payload(order)

    @staticmethod
    def order_payload(order, include_secret=False, client_secret=None):
        booking = json.loads(order.booking_response) if order.booking_response else None
        payload = {
            "payment_order_id": order.id,
            "payment_order_key": order.order_key,
            "payment_intent_id": order.stripe_payment_intent_id,
            "payment_status": 1 if order.status in PaymentService.CONFIRMED_STATUSES else (2 if order.status == "payment_failed" else 0),
            "status": order.status,
            "currency": order.currency,
            "amount_pence": order.gross_amount_pence,
            "quantity": order.quantity,
            "confirmed": order.status in PaymentService.ACTIVE_BOOKING_STATUSES,
            "booking": booking,
        }
        if booking:
            payload.update(booking)
        if include_secret:
            payload["client_secret"] = client_secret
        return payload

    @staticmethod
    def _record_event(event, payload):
        if bool(getattr(event, "livemode", True)):
            raise ServiceError("Live Stripe webhooks are not allowed")
        payload_sha256 = hashlib.sha256(payload).hexdigest()
        existing = StripeEventReceipt.query.filter_by(stripe_event_id=event.id).first()
        if existing and existing.payload_sha256 != payload_sha256:
            raise ServiceError("Stripe webhook event payload mismatch")
        if existing and existing.status == "processed":
            existing.attempt_count = int(existing.attempt_count or 0) + 1
            existing.last_attempt_on = datetime.utcnow()
            return existing, True
        if existing:
            existing.status = "processing"
            existing.error_message = None
            existing.processed_on = None
            existing.attempt_count = int(existing.attempt_count or 0) + 1
            existing.last_attempt_on = datetime.utcnow()
        else:
            existing = StripeEventReceipt(
                stripe_event_id=event.id,
                event_type=event.type,
                livemode=False,
                payload_sha256=payload_sha256,
                status="processing",
                attempt_count=1,
                last_attempt_on=datetime.utcnow(),
            )
            db.session.add(existing)
            db.session.flush()
        return existing, False

    @staticmethod
    def handle_webhook(payload, signature):
        PaymentService._require_enabled()
        webhook_secrets = []
        for variable in ("STRIPE_WEBHOOK_SECRET", "STRIPE_CONNECT_WEBHOOK_SECRET"):
            value = (os.getenv(variable) or "").strip()
            if value.startswith("whsec_") and value not in webhook_secrets:
                webhook_secrets.append(value)
        if not webhook_secrets:
            raise ServiceError("Stripe webhook is not configured")
        event = None
        for secret in webhook_secrets:
            try:
                event = stripe.Webhook.construct_event(payload, signature, secret)
                break
            except Exception:
                continue
        if event is None:
            raise ServiceError("Invalid Stripe webhook signature")

        receipt, duplicate = PaymentService._record_event(event, payload)
        if duplicate:
            db.session.commit()
            return {"received": True, "duplicate": True}
        receipt_id = receipt.id
        # The event inbox must survive a process crash before any business
        # mutation. A retry reclaims a non-processed receipt safely.
        db.session.commit()
        try:
            receipt = db.session.get(StripeEventReceipt, receipt_id)
            obj = event.data.object
            if event.type in {"payment_intent.succeeded", "payment_intent.payment_failed", "payment_intent.canceled"}:
                order = PaymentOrder.query.filter_by(stripe_payment_intent_id=obj.id).first()
                if order:
                    if event.type == "payment_intent.succeeded":
                        PaymentService.confirm_order(order, intent=obj)
                    elif order.status not in PaymentService.CONFIRMED_STATUSES | PaymentService.NO_REFRESH_STATUSES:
                        order.status = "payment_failed"
                        order.failure_code = getattr(getattr(obj, "last_payment_error", None), "code", None)
                        order.failure_message = "Payment was not completed"
            elif event.type in {"refund.updated", "charge.refunded"}:
                stripe_refunds = [obj] if event.type == "refund.updated" else list(
                    getattr(getattr(obj, "refunds", None), "data", None) or []
                )
                for stripe_refund in stripe_refunds:
                    refund = RefundRequest.query.filter_by(stripe_refund_id=stripe_refund.id).first()
                    stripe_status = str(getattr(stripe_refund, "status", "succeeded"))
                    if refund and stripe_status == "succeeded":
                        PaymentService.finalize_refund(
                            refund,
                            int(getattr(stripe_refund, "amount", refund.approved_amount_pence or 0)),
                            stripe_refund=stripe_refund,
                        )
                    elif refund and stripe_status in {"failed", "canceled"}:
                        PaymentService._mark_refund_failed(refund, stripe_refund)
            elif event.type in {"payout.paid", "payout.failed"}:
                payout = PayoutRecord.query.filter_by(stripe_payout_id=obj.id).first()
                if payout and not (event.type == "payout.failed" and payout.status == "paid_out"):
                    payout.status = "paid_out" if event.type == "payout.paid" else "failed"
                    payout.failure_message = None if event.type == "payout.paid" else "Stripe payout failed"
                    payout.paid_on = datetime.utcnow() if event.type == "payout.paid" else None
                    if payout.order.status not in PaymentService.REFUND_PROTECTED_STATUSES:
                        payout.order.status = "paid_out" if event.type == "payout.paid" else "payout_pending"
                    PaymentService._ledger(
                        payout.order,
                        "payout_paid" if event.type == "payout.paid" else "payout_failed",
                        0,
                        f"payout:{obj.id}:{event.type}",
                        obj.id,
                    )
                    if event.type == "payout.failed":
                        # The failed Stripe payout is preserved by the ledger
                        # entry above. Clear only the current operational
                        # pointer so the restartable worker can create a new
                        # standard payout attempt with a new idempotency key.
                        payout.attempt_count = max(1, int(payout.attempt_count or 0)) + 1
                        payout.stripe_payout_id = None
            elif event.type in {"charge.dispute.created", "charge.dispute.closed"}:
                PaymentService._handle_dispute_event(event.type, obj)
            elif event.type == "account.updated":
                connected = StripeConnectedAccount.query.filter_by(stripe_account_id=obj.id).first()
                if connected:
                    PaymentService._sync_connected_record(connected, obj)
            receipt.status = "processed"
            receipt.processed_on = datetime.utcnow()
            db.session.commit()
            return {"received": True, "duplicate": False}
        except Exception as error:
            db.session.rollback()
            receipt = StripeEventReceipt.query.filter_by(stripe_event_id=event.id).first()
            if receipt:
                receipt.status = "failed"
                receipt.error_message = str(error)[:500]
                db.session.commit()
            raise

    @staticmethod
    def request_refund(order_key, requester_user_id, amount_pence=None, reason=None, idempotency_key=None):
        PaymentService.ensure_storage()
        order = PaymentOrder.query.filter_by(
            order_key=order_key,
            buyer_user_id=requester_user_id,
        ).with_for_update().first()
        if not order or order.status not in PaymentService.CONFIRMED_STATUSES:
            raise ServiceError("Confirmed paid order not found")
        active = RefundRequest.query.filter(
            RefundRequest.order_id == order.id,
            RefundRequest.status.in_(PaymentService.ACTIVE_REFUND_STATUSES),
        ).first()
        if active:
            return PaymentService.refund_payload(active)
        supplied_key = str(idempotency_key or "").strip()[:255]
        if supplied_key:
            existing = RefundRequest.query.filter_by(idempotency_key=supplied_key).first()
            if existing:
                if existing.order_id != order.id or existing.requester_user_id != requester_user_id:
                    raise ServiceError("Idempotency key is already in use")
                return PaymentService.refund_payload(existing)
        already_refunded = db.session.query(func.coalesce(func.sum(RefundRequest.refunded_amount_pence), 0)).filter(
            RefundRequest.order_id == order.id,
            RefundRequest.status.in_(("refunded", "partially_refunded")),
        ).scalar() or 0
        remaining = order.gross_amount_pence - int(already_refunded)
        requested = PaymentService._whole_number(
            remaining if amount_pence is None else amount_pence,
            "Refund amount must be a whole number of pence",
        )
        if requested < 1 or requested > remaining:
            raise ServiceError("Refund amount exceeds the remaining paid amount")
        refund = RefundRequest(
            order_id=order.id,
            requester_user_id=requester_user_id,
            organizer_id=order.organizer_id,
            idempotency_key=supplied_key or f"refund-request-{uuid.uuid4()}",
            requested_amount_pence=requested,
            reason=(reason or "")[:500],
            status="requested",
        )
        db.session.add(refund)
        db.session.commit()
        return PaymentService.refund_payload(refund)

    @staticmethod
    def request_refund_for_booking(requester_user_id, event_id=None, participant_id=None):
        if not PaymentService._enabled():
            return None
        query = PaymentOrder.query.filter(
            PaymentOrder.buyer_user_id == requester_user_id,
            PaymentOrder.status.in_(PaymentService.ACTIVE_BOOKING_STATUSES),
        )
        if event_id:
            query = query.filter(PaymentOrder.event_id == event_id)
        for order in query.order_by(PaymentOrder.created_on.desc()).all():
            if participant_id and int(participant_id) not in PaymentService._participant_id_values(order):
                continue
            return PaymentService.request_refund(
                order.order_key,
                requester_user_id,
                reason="User requested booking cancellation",
                idempotency_key=f"booking-cancellation-{order.order_key}",
            )
        return None

    @staticmethod
    def decide_refund(refund_id, organizer_id, approve, amount_pence=None, note=None):
        if not isinstance(approve, bool):
            raise ServiceError("Refund decision must be true or false")
        refund = RefundRequest.query.filter_by(
            id=refund_id,
            organizer_id=organizer_id,
        ).with_for_update().first()
        if not refund or refund.status != "requested":
            raise ServiceError("Pending refund request not found")
        approved = None
        if approve:
            approved = PaymentService._whole_number(
                refund.requested_amount_pence if amount_pence is None else amount_pence,
                "Approved amount must be a whole number of pence",
            )
            if approved < 1 or approved > refund.requested_amount_pence:
                raise ServiceError("Approved amount is invalid")
        refund.organizer_note = (note or "")[:500]
        refund.decided_on = datetime.utcnow()
        if not approve:
            refund.status = "declined"
        else:
            refund.approved_amount_pence = approved
            refund.status = "approved_awaiting_ondeen"
        PaymentService._notify_refund_status(refund)
        db.session.commit()
        return PaymentService.refund_payload(refund)

    @staticmethod
    def execute_refund(refund_id, admin_user_id=None, amount_pence=None, note=None, system=False):
        PaymentService._require_enabled()
        if not system:
            admin = db.session.get(Users, admin_user_id)
            if not admin or admin.role_type != 1:
                raise ServiceError("Admin account required")
        refund = RefundRequest.query.filter_by(
            id=refund_id,
            status="approved_awaiting_ondeen",
        ).with_for_update().first()
        if not refund:
            raise ServiceError("Approved refund request not found")
        amount = PaymentService._whole_number(
            refund.approved_amount_pence if amount_pence is None else amount_pence,
            "Refund amount must be a whole number of pence",
        )
        if amount < 1 or amount > int(refund.approved_amount_pence or 0):
            raise ServiceError("Refund amount is invalid")
        already_refunded = db.session.query(
            func.coalesce(func.sum(RefundRequest.refunded_amount_pence), 0)
        ).filter(
            RefundRequest.order_id == refund.order_id,
            RefundRequest.id != refund.id,
            RefundRequest.status.in_(("refunded", "partially_refunded")),
        ).scalar() or 0
        if amount > int(refund.order.gross_amount_pence) - int(already_refunded):
            raise ServiceError("Refund amount exceeds the remaining paid amount")
        refund.admin_note = (note or "")[:500]
        payout = PayoutRecord.query.filter_by(order_id=refund.order_id).first()
        if payout and payout.stripe_transfer_id:
            completed_refunded = db.session.query(
                func.coalesce(func.sum(RefundRequest.refunded_amount_pence), 0)
            ).filter(
                RefundRequest.order_id == refund.order_id,
                RefundRequest.id != refund.id,
                RefundRequest.status.in_(("refunded", "partially_refunded")),
            ).scalar() or 0
            completed_refunded = int(completed_refunded)
            cumulative = min(int(refund.order.gross_amount_pence), completed_refunded + amount)
            fee_reversal = max(
                0,
                PaymentService._proportional_ondeen_fee(refund.order, cumulative)
                - PaymentService._proportional_ondeen_fee(refund.order, completed_refunded),
            )
            organizer_liability = max(0, amount - fee_reversal)
            prior_refund_adjustments = db.session.query(
                func.coalesce(func.sum(FinancialLedgerEntry.amount_pence), 0)
            ).filter(
                FinancialLedgerEntry.order_id == refund.order_id,
                FinancialLedgerEntry.entry_type == "negative_adjustment",
                FinancialLedgerEntry.idempotency_key.like(
                    f"order:{refund.order.order_key}:refund:%:negative-adjustment"
                ),
            ).scalar() or 0
            completed_liability = max(
                0,
                completed_refunded
                - PaymentService._proportional_ondeen_fee(refund.order, completed_refunded),
            )
            recovered = int(payout.reversed_amount_pence or 0) + abs(int(prior_refund_adjustments))
            recovery_credit = max(0, recovered - completed_liability)
            outstanding_liability = max(0, organizer_liability - recovery_credit)
            remaining_transfer = max(0, payout.amount_pence - int(payout.reversed_amount_pence or 0))
            organizer_reversal = min(remaining_transfer, outstanding_liability)
            try:
                if organizer_reversal:
                    reversal = stripe.Transfer.create_reversal(
                        payout.stripe_transfer_id,
                        amount=organizer_reversal,
                        metadata={"ondeen_refund_request_id": str(refund.id)},
                        idempotency_key=f"transfer-reversal-refund-{refund.id}",
                    )
                    refund.stripe_transfer_reversal_id = reversal.id
                    payout.reversed_amount_pence = int(payout.reversed_amount_pence or 0) + organizer_reversal
                residual = outstanding_liability - organizer_reversal
                if residual:
                    PaymentService._ledger(
                        refund.order,
                        "negative_adjustment",
                        -residual,
                        f"refund:{refund.id}:negative-adjustment",
                        detail={"reason": "refund exceeds the remaining transferred organiser proceeds"},
                    )
            except Exception:
                PaymentService._ledger(
                    refund.order,
                    "negative_adjustment",
                    -outstanding_liability,
                    f"refund:{refund.id}:negative-adjustment",
                    detail={"reason": "post-transfer refund reversal pending"},
                )
        try:
            stripe_refund = stripe.Refund.create(
                payment_intent=refund.order.stripe_payment_intent_id,
                amount=amount,
                metadata={"ondeen_refund_request_id": str(refund.id)},
                idempotency_key=f"stripe-refund-{refund.id}-{amount}",
            )
            refund.stripe_refund_id = stripe_refund.id
            refund.status = "processing"
            refund.processed_on = datetime.utcnow()
            db.session.commit()
            if str(getattr(stripe_refund, "status", "")) == "succeeded":
                PaymentService.finalize_refund(refund, amount)
            elif str(getattr(stripe_refund, "status", "")) in {"failed", "canceled"}:
                PaymentService._mark_refund_failed(refund, stripe_refund)
            return PaymentService.refund_payload(refund)
        except Exception as error:
            db.session.rollback()
            raise ServiceError(PaymentService._safe_stripe_message(error, "Stripe refund failed"))

    @staticmethod
    def cancel_event_refunds(event_id):
        """Create and execute idempotent full refunds for a pre-start organiser cancellation."""
        if not PaymentService._enabled():
            return {"queued": 0, "processed": 0}
        event = db.session.get(Event, event_id)
        if not event or PaymentService._first_start(event) <= datetime.now(timezone.utc):
            return {"queued": 0, "processed": 0}
        orders = PaymentOrder.query.filter(
            PaymentOrder.event_id == event_id,
            PaymentOrder.status.in_(PaymentService.CONFIRMED_STATUSES),
        ).all()
        queued = 0
        processed = 0
        for order in orders:
            already_refunded = db.session.query(func.coalesce(func.sum(RefundRequest.refunded_amount_pence), 0)).filter(
                RefundRequest.order_id == order.id,
                RefundRequest.status.in_(("refunded", "partially_refunded")),
            ).scalar() or 0
            remaining = order.gross_amount_pence - int(already_refunded)
            if remaining <= 0:
                continue
            key = f"event-cancellation-{event_id}-order-{order.id}"
            refund = RefundRequest.query.filter_by(idempotency_key=key).first()
            if not refund:
                refund = RefundRequest(
                    order_id=order.id,
                    requester_user_id=None,
                    organizer_id=order.organizer_id,
                    idempotency_key=key,
                    requested_amount_pence=remaining,
                    approved_amount_pence=remaining,
                    reason="Organiser cancelled listing before start",
                    organizer_note="Automatic full refund required",
                    status="approved_awaiting_ondeen",
                    requested_on=datetime.utcnow(),
                    decided_on=datetime.utcnow(),
                )
                db.session.add(refund)
                db.session.commit()
                queued += 1
            if refund.status == "approved_awaiting_ondeen":
                try:
                    PaymentService.execute_refund(
                        refund.id,
                        amount_pence=remaining,
                        note="Automatic pre-start cancellation refund",
                        system=True,
                    )
                    processed += 1
                except ServiceError:
                    pass
        return {"queued": queued, "processed": processed}

    @staticmethod
    def retry_cancellation_refunds(limit=25):
        if not PaymentService._enabled():
            return {"claimed": 0, "processed": 0}
        refunds = RefundRequest.query.filter(
            RefundRequest.status.in_(("approved_awaiting_ondeen", "failed")),
            RefundRequest.reason == "Organiser cancelled listing before start",
        ).order_by(RefundRequest.id.desc()).limit(limit).all()
        claimed = 0
        processed = 0
        seen_order_ids = set()
        for refund in refunds:
            if refund.order_id in seen_order_ids:
                continue
            seen_order_ids.add(refund.order_id)
            if refund.status == "failed":
                attempt_count = RefundRequest.query.filter_by(
                    order_id=refund.order_id,
                    reason="Organiser cancelled listing before start",
                ).count()
                if attempt_count >= PaymentService.MAX_AUTOMATIC_CANCELLATION_REFUND_ATTEMPTS:
                    continue
                already_refunded = db.session.query(
                    func.coalesce(func.sum(RefundRequest.refunded_amount_pence), 0)
                ).filter(
                    RefundRequest.order_id == refund.order_id,
                    RefundRequest.status.in_(("refunded", "partially_refunded")),
                ).scalar() or 0
                remaining = int(refund.order.gross_amount_pence) - int(already_refunded)
                if remaining <= 0:
                    continue
                retry_key = (
                    f"event-cancellation-retry-{refund.order.event_id}"
                    f"-order-{refund.order_id}-after-{refund.id}"
                )
                retry = RefundRequest.query.filter_by(idempotency_key=retry_key).first()
                if not retry:
                    retry = RefundRequest(
                        order_id=refund.order_id,
                        requester_user_id=None,
                        organizer_id=refund.organizer_id,
                        idempotency_key=retry_key,
                        requested_amount_pence=remaining,
                        approved_amount_pence=remaining,
                        reason="Organiser cancelled listing before start",
                        organizer_note="Automatic full refund retry required",
                        status="approved_awaiting_ondeen",
                        requested_on=datetime.utcnow(),
                        decided_on=datetime.utcnow(),
                    )
                    db.session.add(retry)
                    db.session.commit()
                refund = retry
            if refund.status != "approved_awaiting_ondeen":
                continue
            claimed += 1
            try:
                result = PaymentService.execute_refund(
                    refund.id,
                    amount_pence=refund.approved_amount_pence,
                    note="Automatic pre-start cancellation refund retry",
                    system=True,
                )
                if result["status"] in {"processing", "partially_refunded", "refunded"}:
                    processed += 1
            except ServiceError:
                continue
        return {"claimed": claimed, "processed": processed}

    @staticmethod
    def finalize_refund(refund, amount, stripe_refund=None):
        order = refund.order
        previous = int(refund.refunded_amount_pence or 0)
        delta = max(0, int(amount) - previous)
        refund.refunded_amount_pence = int(amount)
        total_refunded = db.session.query(func.coalesce(func.sum(RefundRequest.refunded_amount_pence), 0)).filter(
            RefundRequest.order_id == order.id,
            RefundRequest.id != refund.id,
            RefundRequest.status.in_(("refunded", "partially_refunded")),
        ).scalar() or 0
        before_cumulative = int(total_refunded) + previous
        cumulative = int(total_refunded) + int(amount)
        refund.status = "refunded" if cumulative >= order.gross_amount_pence else "partially_refunded"
        order.status = refund.status
        fee_reversal = max(
            0,
            PaymentService._proportional_ondeen_fee(order, cumulative)
            - PaymentService._proportional_ondeen_fee(order, before_cumulative),
        )
        PaymentService._ledger(order, "refund", -delta, f"refund:{refund.id}:gross", refund.stripe_refund_id)
        PaymentService._ledger(order, "ondeen_fee_reversal", fee_reversal, f"refund:{refund.id}:fee", refund.stripe_refund_id)
        PaymentService._record_refund_stripe_treatment(refund, stripe_refund)
        payout = PayoutRecord.query.filter_by(order_id=order.id).first()
        if payout and not payout.stripe_transfer_id and payout.status in {"pending", "failed"}:
            remaining_gross = max(0, order.gross_amount_pence - cumulative)
            reversed_fee_total = PaymentService._proportional_ondeen_fee(order, cumulative)
            remaining_fee = max(0, order.ondeen_fee_pence - reversed_fee_total)
            payout.amount_pence = max(0, remaining_gross - remaining_fee - int(order.stripe_cost_pence or 0))
            payout.status = "cancelled" if payout.amount_pence == 0 else "pending"
        if cumulative >= order.gross_amount_pence:
            PaymentService._cancel_order_participants(order)
        if delta:
            PaymentService._notify_refund_status(refund)
        db.session.commit()
        return refund

    @staticmethod
    def _mark_refund_failed(refund, stripe_refund):
        if refund.status in {"refunded", "partially_refunded"}:
            return refund
        stripe_status = str(getattr(stripe_refund, "status", "failed") or "failed")
        failure_reason = str(
            getattr(stripe_refund, "failure_reason", None)
            or getattr(stripe_refund, "failure_balance_transaction", None)
            or "Stripe refund failed"
        )[:500]
        refund.status = "failed"
        refund.admin_note = failure_reason
        refund.processed_on = datetime.utcnow()
        PaymentService._ledger(
            refund.order,
            "refund_failed",
            0,
            f"refund:{refund.id}:failed:{stripe_refund.id}",
            stripe_refund.id,
            detail={"stripe_status": stripe_status, "reason": failure_reason},
        )
        PaymentService._notify_refund_status(refund)
        db.session.commit()
        return refund

    @staticmethod
    def _record_refund_stripe_treatment(refund, stripe_refund):
        if stripe_refund is None:
            return
        balance_transaction = getattr(stripe_refund, "balance_transaction", None)
        if isinstance(balance_transaction, str):
            try:
                balance_transaction = stripe.BalanceTransaction.retrieve(balance_transaction)
            except Exception:
                return
        if balance_transaction is None:
            return
        stripe_fee = int(getattr(balance_transaction, "fee", 0) or 0)
        PaymentService._ledger(
            refund.order,
            "stripe_refund_treatment",
            -stripe_fee,
            f"refund:{refund.id}:stripe-treatment",
            refund.stripe_refund_id,
            detail={
                "balance_transaction_id": PaymentService._intent_object_id(balance_transaction),
                "fee_pence": stripe_fee,
                "net_pence": int(getattr(balance_transaction, "net", 0) or 0),
            },
        )

    @staticmethod
    def _notify_refund_status(refund):
        if not refund.order.buyer_user_id:
            return
        status_copy = {
            "declined": ("Refund request declined", "The organiser declined your refund request."),
            "approved_awaiting_ondeen": ("Refund approved", "Your refund is approved and awaiting OnDeen processing."),
            "refunded": ("Refund completed", "Stripe confirmed your full refund."),
            "partially_refunded": ("Partial refund completed", "Stripe confirmed your partial refund."),
            "failed": ("Refund failed", "Stripe could not complete the refund. OnDeen can review and retry it."),
        }.get(refund.status)
        if not status_copy:
            return
        task_id = f"payment-refund-{refund.id}-{refund.status}"
        if Notification_History.query.filter_by(
            user_id=refund.order.buyer_user_id,
            task_id=task_id,
            status=1,
        ).first():
            return
        participant_ids = PaymentService._participant_id_values(refund.order)
        db.session.add(Notification_History(
            user_id=refund.order.buyer_user_id,
            participant_id=participant_ids[0] if participant_ids else 0,
            event_id=refund.order.event_id,
            push=False,
            sms=False,
            email=False,
            type=6,
            send_to=6,
            task_id=task_id,
            title=status_copy[0],
            message=status_copy[1],
            created_on=datetime.utcnow(),
        ))

    @staticmethod
    def _proportional_ondeen_fee(order, amount):
        if not order.gross_amount_pence:
            return 0
        return int((
            Decimal(order.ondeen_fee_pence)
            * Decimal(max(0, int(amount)))
            / Decimal(order.gross_amount_pence)
        ).quantize(Decimal("1"), rounding=ROUND_HALF_UP))

    @staticmethod
    def _participant_id_values(order):
        return [
            int(value)
            for value in str(order.participant_ids or "").split(",")
            if value.strip().isdigit()
        ]

    @staticmethod
    def _cancel_order_participants(order):
        event = db.session.get(Event, order.event_id)
        for participant_id in PaymentService._participant_id_values(order):
            participant = db.session.get(Participant, participant_id)
            if not participant or participant.status != 1:
                continue
            participant.status = 2
            participant.updated_on = datetime.utcnow()
            quantity = int(participant.quantity or 0)
            if event:
                event.booked = max(0, int(event.booked or 0) - quantity)
            if int(participant.date_time_id or 0) > 0:
                event_time = db.session.get(EventDateTime, participant.date_time_id)
                if event_time:
                    event_time.booked = max(0, int(event_time.booked or 0) - quantity)
            if int(participant.ticket_id or 0) > 0:
                ticket = db.session.get(EventTicket, participant.ticket_id)
                if ticket:
                    ticket.booked = max(0, int(ticket.booked or 0) - quantity)
            guest = GuestBooking.query.filter_by(participant_id=participant.id).first()
            if guest:
                guest.status = 2

    @staticmethod
    def _queue_fulfilment_refund(order, reason):
        refund = RefundRequest.query.filter_by(idempotency_key=f"fulfilment-failed-{order.order_key}").first()
        if not refund:
            refund = RefundRequest(
                order_id=order.id,
                requester_user_id=order.buyer_user_id,
                organizer_id=order.organizer_id,
                idempotency_key=f"fulfilment-failed-{order.order_key}",
                requested_amount_pence=order.gross_amount_pence,
                approved_amount_pence=order.gross_amount_pence,
                reason="Automatic refund because paid booking could not be fulfilled",
                organizer_note="Automatic safety refund",
                admin_note=(reason or "Booking finalisation failed")[:500],
                status="approved_awaiting_ondeen",
                requested_on=datetime.utcnow(),
                decided_on=datetime.utcnow(),
            )
            db.session.add(refund)
            db.session.commit()
        order.status = "refund_processing"
        order.failure_message = "Payment succeeded but the booking was unavailable; a full refund is being processed"
        db.session.commit()
        try:
            PaymentService.execute_refund(refund.id, amount_pence=order.gross_amount_pence, system=True)
        except ServiceError:
            pass
        db.session.refresh(order)

    @staticmethod
    def refund_payload(refund):
        buyer = refund.order.buyer
        return {
            "id": refund.id,
            "payment_order_key": refund.order.order_key,
            "status": refund.status,
            "requested_amount_pence": refund.requested_amount_pence,
            "approved_amount_pence": refund.approved_amount_pence,
            "refunded_amount_pence": refund.refunded_amount_pence,
            "reason": refund.reason,
            "organizer_note": refund.organizer_note,
            "event_title": refund.order.event.title if refund.order.event else None,
            "buyer_name": " ".join(filter(None, [buyer.first_name, buyer.last_name])) if buyer else None,
            "currency": refund.order.currency,
        }

    @staticmethod
    def run_payouts(now=None, limit=25):
        if os.getenv("PAYMENT_PAYOUT_WORKER_ENABLED", "false").strip().lower() not in {"1", "true", "yes", "on"}:
            return {"claimed": 0, "processed": 0, "waiting": 0, "failed": 0}
        PaymentService._require_enabled()
        PaymentService.ensure_storage()
        current = now or datetime.utcnow()
        stale_before = current - PaymentService.CLAIM_STALE_AFTER
        payout_ids = (
            PayoutRecord.query
            .filter(
                PayoutRecord.eligible_on <= current,
                or_(
                    PayoutRecord.status.in_(("pending", "failed")),
                    and_(PayoutRecord.status == "claiming", PayoutRecord.updated_on <= stale_before),
                ),
            )
            .order_by(PayoutRecord.eligible_on.asc(), PayoutRecord.id.asc())
            .limit(limit)
            .with_entities(PayoutRecord.id)
            .all()
        )
        result = {"claimed": 0, "processed": 0, "waiting": 0, "failed": 0}
        for (payout_id,) in payout_ids:
            transfer_attempt = None
            claimed = PayoutRecord.query.filter(
                PayoutRecord.id == payout_id,
                or_(
                    PayoutRecord.status.in_(("pending", "failed")),
                    and_(PayoutRecord.status == "claiming", PayoutRecord.updated_on <= stale_before),
                ),
            ).update(
                {PayoutRecord.status: "claiming", PayoutRecord.updated_on: current},
                synchronize_session=False,
            )
            db.session.commit()
            if claimed != 1:
                continue
            result["claimed"] += 1
            payout = db.session.get(PayoutRecord, payout_id)
            try:
                status = PaymentService.connected_status(payout.organizer_id, refresh=True)
                if not status["ready"]:
                    payout.status = "pending"
                    payout.failure_message = "Connected account is not ready for payout"
                    db.session.commit()
                    result["waiting"] += 1
                    continue
                if not payout.stripe_transfer_id:
                    transfer_attempt = max(1, int(payout.attempt_count or 0) + 1)
                    transfer = stripe.Transfer.create(
                        amount=payout.amount_pence,
                        currency=payout.currency,
                        destination=payout.connected_account.stripe_account_id,
                        transfer_group=f"ondeen_order_{payout.order.order_key}",
                        metadata={"ondeen_order_key": payout.order.order_key},
                        idempotency_key=(
                            f"payout-transfer-{payout.order.order_key}"
                            f"-attempt-{transfer_attempt}"
                        ),
                    )
                    payout.stripe_transfer_id = transfer.id
                    payout.attempt_count = transfer_attempt
                    PaymentService._ledger(payout.order, "transfer", 0, "transfer", transfer.id)
                    db.session.commit()
                if not payout.stripe_payout_id:
                    payout_attempt = max(1, int(payout.attempt_count or 0))
                    stripe_payout = stripe.Payout.create(
                        amount=payout.amount_pence,
                        currency=payout.currency,
                        method="standard",
                        metadata={"ondeen_order_key": payout.order.order_key},
                        stripe_account=payout.connected_account.stripe_account_id,
                        idempotency_key=(
                            f"connected-payout-{payout.order.order_key}"
                            f"-attempt-{payout_attempt}"
                        ),
                    )
                    payout.stripe_payout_id = stripe_payout.id
                    payout.attempt_count = payout_attempt
                payout.status = "processing"
                payout.order.status = "payout_processing"
                payout.failure_message = None
                PaymentService._ledger(
                    payout.order,
                    "payout_processing",
                    0,
                    f"payout-processing:{payout.stripe_payout_id}",
                    payout.stripe_payout_id,
                )
                db.session.commit()
                result["processed"] += 1
            except Exception as error:
                db.session.rollback()
                payout = db.session.get(PayoutRecord, payout_id)
                error_code = str(getattr(error, "code", "") or "")
                is_waiting = error_code in {"balance_insufficient", "insufficient_funds"}
                is_definitive_failure = isinstance(error, (stripe.InvalidRequestError, stripe.CardError))
                if is_waiting and transfer_attempt is not None and not payout.stripe_transfer_id:
                    payout.attempt_count = max(int(payout.attempt_count or 0), transfer_attempt)
                payout.status = "pending" if is_waiting else "failed"
                payout.failure_message = PaymentService._safe_stripe_message(error, "Payout is waiting for Stripe funds")
                if not is_waiting:
                    failed_attempt = max(1, int(payout.attempt_count or 0))
                    PaymentService._ledger(
                        payout.order,
                        "payout_failed",
                        0,
                        f"payout-failed:attempt-{failed_attempt}",
                        payout.stripe_payout_id,
                        detail={"reason": payout.failure_message},
                    )
                    if is_definitive_failure and not payout.stripe_payout_id:
                        payout.attempt_count = failed_attempt + 1
                db.session.commit()
                result["waiting" if is_waiting else "failed"] += 1
        return result

    @staticmethod
    def _adjust_untransferred_payout(order, amount_pence):
        payout = PayoutRecord.query.filter_by(order_id=order.id).first()
        if not payout or payout.stripe_transfer_id or payout.status not in {"pending", "failed", "cancelled"}:
            return
        payout.amount_pence = max(0, int(payout.amount_pence or 0) + int(amount_pence))
        payout.status = "cancelled" if payout.amount_pence == 0 else "pending"

    @staticmethod
    def add_admin_adjustment(order_key, admin_user_id, amount_pence, reason, idempotency_key=None):
        PaymentService._require_enabled()
        admin = db.session.get(Users, admin_user_id)
        if not admin or admin.role_type != 1:
            raise ServiceError("Admin account required")
        order = PaymentOrder.query.filter_by(order_key=order_key).first()
        if not order or order.status not in PaymentService.CONFIRMED_STATUSES:
            raise ServiceError("Confirmed paid order not found")
        amount = PaymentService._whole_number(
            0 if amount_pence is None else amount_pence,
            "Adjustment amount must be a whole number of pence",
        )
        if amount == 0 or not str(reason or "").strip():
            raise ServiceError("A non-zero amount and reason are required")
        key = str(idempotency_key or uuid.uuid4().hex)[:120]
        entry_type = "correction" if amount > 0 else "negative_adjustment"
        ledger_key = f"order:{order.order_key}:admin-adjustment:{key}"
        existing = FinancialLedgerEntry.query.filter_by(idempotency_key=ledger_key).first()
        if existing:
            return {
                "ledger_entry_id": existing.id,
                "payment_order_key": order.order_key,
                "type": existing.entry_type,
                "amount_pence": existing.amount_pence,
                "currency": existing.currency,
            }
        entry = PaymentService._ledger(
            order,
            entry_type,
            amount,
            f"admin-adjustment:{key}",
            detail={"admin_user_id": admin_user_id, "reason": str(reason)[:500]},
        )
        PaymentService._adjust_untransferred_payout(order, amount)
        db.session.commit()
        return {
            "ledger_entry_id": entry.id,
            "payment_order_key": order.order_key,
            "type": entry.entry_type,
            "amount_pence": entry.amount_pence,
            "currency": entry.currency,
        }

    @staticmethod
    def _handle_dispute_event(event_type, dispute):
        charge_id = PaymentService._intent_object_id(getattr(dispute, "charge", None))
        order = PaymentOrder.query.filter_by(stripe_charge_id=charge_id).first()
        if not order:
            return
        amount = int(getattr(dispute, "amount", 0) or 0)
        dispute_id = PaymentService._intent_object_id(dispute)
        if event_type == "charge.dispute.created":
            if FinancialLedgerEntry.query.filter_by(
                idempotency_key=f"order:{order.order_key}:dispute:{dispute_id}:opened"
            ).first():
                return
            PaymentService._ledger(
                order,
                "negative_adjustment",
                -amount,
                f"dispute:{dispute_id}:opened",
                dispute_id,
                {"status": str(getattr(dispute, "status", "needs_response"))},
            )
            PaymentService._adjust_untransferred_payout(order, -amount)
        elif event_type == "charge.dispute.closed" and str(getattr(dispute, "status", "")) == "won":
            if FinancialLedgerEntry.query.filter_by(
                idempotency_key=f"order:{order.order_key}:dispute:{dispute_id}:won"
            ).first():
                return
            PaymentService._ledger(
                order,
                "correction",
                amount,
                f"dispute:{dispute_id}:won",
                dispute_id,
                {"status": "won"},
            )
            PaymentService._adjust_untransferred_payout(order, amount)

    @staticmethod
    def wallet(organizer_id):
        PaymentService.ensure_storage()
        orders = PaymentOrder.query.filter_by(organizer_id=organizer_id).all()
        total_sales = sum(order.gross_amount_pence for order in orders if order.status in PaymentService.CONFIRMED_STATUSES)
        payouts = PayoutRecord.query.filter_by(organizer_id=organizer_id).all()
        pending = sum(p.amount_pence for p in payouts if p.status == "pending" and p.eligible_on > datetime.utcnow())
        available = sum(p.amount_pence for p in payouts if p.status in {"pending", "failed"} and p.eligible_on <= datetime.utcnow())
        processing = sum(p.amount_pence for p in payouts if p.status == "processing")
        paid_out = sum(p.amount_pence for p in payouts if p.status == "paid_out")
        adjustments = db.session.query(func.coalesce(func.sum(FinancialLedgerEntry.amount_pence), 0)).filter(
            FinancialLedgerEntry.organizer_id == organizer_id,
            FinancialLedgerEntry.entry_type.in_(("negative_adjustment", "correction")),
        ).scalar() or 0
        entries = FinancialLedgerEntry.query.filter_by(organizer_id=organizer_id).order_by(FinancialLedgerEntry.created_on.desc()).limit(200).all()
        refunds = RefundRequest.query.filter_by(organizer_id=organizer_id).order_by(RefundRequest.requested_on.desc()).all()
        return {
            "currency": PaymentService.CURRENCY,
            "balances_pence": {
                "total_sales": total_sales,
                "pending": pending,
                "available_for_payout": available,
                "payout_processing": processing,
                "paid_out": paid_out,
                "adjustment_negative": int(adjustments),
            },
            "total_revenue": f"{Decimal(total_sales) / 100:.2f}",
            "available_amount": f"{Decimal(available) / 100:.2f}",
            "pending_amount": f"{Decimal(pending) / 100:.2f}",
            "transaction_history": [
                {
                    "transaction_id": entry.id,
                    "date": entry.created_on.isoformat(),
                    "listing": entry.order.event.title if entry.order and entry.order.event else None,
                    "type": entry.entry_type,
                    "amount_pence": entry.amount_pence,
                    "amount": f"{Decimal(entry.amount_pence) / 100:.2f} GBP",
                    "customer_paid_pence": entry.order.gross_amount_pence if entry.order else None,
                    "ondeen_fee_pence": entry.order.ondeen_fee_pence if entry.order else None,
                    "stripe_cost_pence": entry.order.stripe_cost_pence if entry.order else None,
                    "organizer_net_pence": entry.order.organizer_net_pence if entry.order else None,
                    "status": (
                        "failed"
                        if entry.entry_type == "payout_failed"
                        else (entry.order.status if entry.order else "recorded")
                    ),
                }
                for entry in entries
            ],
            "refund_requests": [PaymentService.refund_payload(refund) for refund in refunds],
            "withdrawal_history": [],
        }
