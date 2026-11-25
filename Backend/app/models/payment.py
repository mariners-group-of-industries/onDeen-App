from datetime import datetime

from sqlalchemy import Index, event as sqlalchemy_event, inspect as sqlalchemy_inspect

from .. import db


class StripeConnectedAccount(db.Model):
    __tablename__ = "stripe_connected_account"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True, index=True)
    stripe_account_id = db.Column(db.String(255), nullable=False, unique=True)
    details_submitted = db.Column(db.Boolean, nullable=False, default=False)
    charges_enabled = db.Column(db.Boolean, nullable=False, default=False)
    payouts_enabled = db.Column(db.Boolean, nullable=False, default=False)
    requirements_due = db.Column(db.Text, nullable=False, default="[]")
    disabled_reason = db.Column(db.String(255), nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    organizer = db.relationship("Users", lazy=True)


class PaymentOrder(db.Model):
    __tablename__ = "payment_order"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_key = db.Column(db.String(64), nullable=False, unique=True, index=True)
    idempotency_key = db.Column(db.String(255), nullable=False, unique=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False, index=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    buyer_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    guest_email = db.Column(db.String(200), nullable=True, index=True)
    guest_country_code = db.Column(db.String(20), nullable=True)
    guest_mobile_number = db.Column(db.String(100), nullable=True)
    guest_ip_address = db.Column(db.String(64), nullable=True)
    currency = db.Column(db.String(3), nullable=False, default="gbp")
    quantity = db.Column(db.Integer, nullable=False)
    gross_amount_pence = db.Column(db.Integer, nullable=False)
    ondeen_fee_pence = db.Column(db.Integer, nullable=False)
    stripe_cost_pence = db.Column(db.Integer, nullable=True)
    organizer_net_pence = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(40), nullable=False, default="requires_payment")
    booking_payload = db.Column(db.Text, nullable=False)
    booking_response = db.Column(db.Text, nullable=True)
    participant_ids = db.Column(db.Text, nullable=True)
    stripe_payment_intent_id = db.Column(db.String(255), nullable=True, unique=True, index=True)
    stripe_charge_id = db.Column(db.String(255), nullable=True, unique=True)
    failure_code = db.Column(db.String(100), nullable=True)
    failure_message = db.Column(db.String(500), nullable=True)
    confirmed_on = db.Column(db.DateTime, nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = db.relationship("Event", lazy=True)
    organizer = db.relationship("Users", foreign_keys=[organizer_id], lazy=True)
    buyer = db.relationship("Users", foreign_keys=[buyer_user_id], lazy=True)


class PaymentOrderItem(db.Model):
    __tablename__ = "payment_order_item"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey("payment_order.id"), nullable=False, index=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("event_tickets.id"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price_pence = db.Column(db.Integer, nullable=False)
    ondeen_fee_per_unit_pence = db.Column(db.Integer, nullable=False)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    order = db.relationship("PaymentOrder", backref="items", lazy=True)


class FinancialLedgerEntry(db.Model):
    __tablename__ = "financial_ledger_entry"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey("payment_order.id"), nullable=True, index=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=True, index=True)
    entry_type = db.Column(db.String(50), nullable=False, index=True)
    amount_pence = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="gbp")
    stripe_object_id = db.Column(db.String(255), nullable=True, index=True)
    idempotency_key = db.Column(db.String(255), nullable=False, unique=True)
    detail_json = db.Column(db.Text, nullable=False, default="{}")
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    order = db.relationship("PaymentOrder", lazy=True)

    __table_args__ = (
        Index("ix_financial_ledger_organizer_created", "organizer_id", "created_on"),
    )


class StripeEventReceipt(db.Model):
    __tablename__ = "stripe_event_receipt"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    stripe_event_id = db.Column(db.String(255), nullable=False, unique=True, index=True)
    event_type = db.Column(db.String(100), nullable=False)
    livemode = db.Column(db.Boolean, nullable=False, default=False)
    payload_sha256 = db.Column(db.String(64), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="processing")
    attempt_count = db.Column(db.Integer, nullable=False, default=1)
    error_message = db.Column(db.String(500), nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_attempt_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    processed_on = db.Column(db.DateTime, nullable=True)


class RefundRequest(db.Model):
    __tablename__ = "payment_refund_request"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey("payment_order.id"), nullable=False, index=True)
    requester_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    idempotency_key = db.Column(db.String(255), nullable=False, unique=True)
    requested_amount_pence = db.Column(db.Integer, nullable=False)
    approved_amount_pence = db.Column(db.Integer, nullable=True)
    refunded_amount_pence = db.Column(db.Integer, nullable=False, default=0)
    reason = db.Column(db.String(500), nullable=True)
    organizer_note = db.Column(db.String(500), nullable=True)
    admin_note = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(40), nullable=False, default="requested", index=True)
    stripe_refund_id = db.Column(db.String(255), nullable=True, unique=True)
    stripe_transfer_reversal_id = db.Column(db.String(255), nullable=True, unique=True)
    requested_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    decided_on = db.Column(db.DateTime, nullable=True)
    processed_on = db.Column(db.DateTime, nullable=True)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = db.relationship("PaymentOrder", lazy=True)

class PayoutRecord(db.Model):
    __tablename__ = "payment_payout_record"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey("payment_order.id"), nullable=False, unique=True, index=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    connected_account_id = db.Column(db.Integer, db.ForeignKey("stripe_connected_account.id"), nullable=False)
    amount_pence = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="gbp")
    eligibility_start_on = db.Column(db.DateTime, nullable=True)
    eligibility_time_zone = db.Column(db.String(64), nullable=True)
    bank_holiday_calendar_version = db.Column(db.String(120), nullable=True)
    eligible_on = db.Column(db.DateTime, nullable=False, index=True)
    status = db.Column(db.String(40), nullable=False, default="pending", index=True)
    stripe_transfer_id = db.Column(db.String(255), nullable=True, unique=True)
    stripe_payout_id = db.Column(db.String(255), nullable=True, unique=True)
    reversed_amount_pence = db.Column(db.Integer, nullable=False, default=0)
    attempt_count = db.Column(db.Integer, nullable=False, default=0)
    failure_message = db.Column(db.String(500), nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    paid_on = db.Column(db.DateTime, nullable=True)

    order = db.relationship("PaymentOrder", lazy=True)
    connected_account = db.relationship("StripeConnectedAccount", lazy=True)


_IMMUTABLE_PAYMENT_ORDER_FIELDS = (
    "order_key",
    "idempotency_key",
    "event_id",
    "organizer_id",
    "buyer_user_id",
    "guest_email",
    "guest_country_code",
    "guest_mobile_number",
    "guest_ip_address",
    "currency",
    "quantity",
    "gross_amount_pence",
    "ondeen_fee_pence",
    "created_on",
)

_IMMUTABLE_PAYMENT_ORDER_ITEM_FIELDS = (
    "order_id",
    "ticket_id",
    "title",
    "quantity",
    "unit_price_pence",
    "ondeen_fee_per_unit_pence",
    "created_on",
)


def _changed_fields(target, field_names):
    state = sqlalchemy_inspect(target)
    return [name for name in field_names if state.attrs[name].history.has_changes()]


@sqlalchemy_event.listens_for(PaymentOrder, "before_update")
def _prevent_payment_order_snapshot_mutation(_mapper, _connection, target):
    changed = _changed_fields(target, _IMMUTABLE_PAYMENT_ORDER_FIELDS)
    if changed:
        raise ValueError(f"Payment order snapshot is immutable: {', '.join(changed)}")


@sqlalchemy_event.listens_for(PaymentOrder, "before_delete")
def _prevent_payment_order_delete(_mapper, _connection, _target):
    raise ValueError("Payment order snapshots cannot be deleted")


@sqlalchemy_event.listens_for(PaymentOrderItem, "before_update")
def _prevent_payment_order_item_mutation(_mapper, _connection, target):
    changed = _changed_fields(target, _IMMUTABLE_PAYMENT_ORDER_ITEM_FIELDS)
    if changed:
        raise ValueError(f"Payment order item snapshot is immutable: {', '.join(changed)}")


@sqlalchemy_event.listens_for(PaymentOrderItem, "before_delete")
def _prevent_payment_order_item_delete(_mapper, _connection, _target):
    raise ValueError("Payment order item snapshots cannot be deleted")


@sqlalchemy_event.listens_for(FinancialLedgerEntry, "before_update")
@sqlalchemy_event.listens_for(FinancialLedgerEntry, "before_delete")
def _prevent_financial_ledger_mutation(_mapper, _connection, _target):
    raise ValueError("Financial ledger entries are append-only")
