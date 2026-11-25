from decimal import Decimal

from app import db
from app.models.event import Event
from app.models.organization import Organization
from app.models.payment import PaymentOrder, PayoutRecord, RefundRequest
from app.models.users import Users
from app.services.payment import PaymentService
from app.utils.custom_exception import ServiceError


class PaymentAdminService:
    """Small, read-focused finance view for the Admin console.

    Payment snapshots remain immutable. This service deliberately serializes
    only operational fields (never booking payloads, recovery tokens or IPs).
    """

    @staticmethod
    def require_admin(admin_id):
        admin = db.session.get(Users, admin_id)
        if not admin or admin.role_type != 1 or admin.status != 1:
            raise ServiceError("Admin account required")
        return admin

    @staticmethod
    def _money(amount_pence, currency="gbp"):
        return {
            "amount_pence": int(amount_pence or 0),
            "amount": f"{Decimal(int(amount_pence or 0)) / Decimal(100):.2f}",
            "currency": str(currency or "gbp").upper(),
        }

    @staticmethod
    def _order_payload(order):
        buyer = order.buyer
        organizer = order.organizer
        organisation = Organization.query.filter_by(user_id=order.organizer_id).first()
        buyer_name = " ".join(filter(None, [buyer.first_name, buyer.last_name])) if buyer else None
        organiser_name = (
            organisation.organization_name
            if organisation
            else " ".join(filter(None, [organizer.first_name, organizer.last_name])) if organizer else None
        )
        return {
            "id": order.id,
            "order_key": order.order_key,
            "event_id": order.event_id,
            "event_title": order.event.title if order.event else None,
            "organizer_id": order.organizer_id,
            "organizer_name": organiser_name,
            "buyer_user_id": order.buyer_user_id,
            "buyer_name": buyer_name,
            "buyer_email": buyer.email_id if buyer else order.guest_email,
            "quantity": order.quantity,
            "status": order.status,
            "stripe_payment_intent_id": order.stripe_payment_intent_id,
            "stripe_charge_id": order.stripe_charge_id,
            "gross": PaymentAdminService._money(order.gross_amount_pence, order.currency),
            "ondeen_fee": PaymentAdminService._money(order.ondeen_fee_pence, order.currency),
            "organizer_net": PaymentAdminService._money(order.organizer_net_pence, order.currency),
            "created_on": order.created_on.isoformat() if order.created_on else None,
            "confirmed_on": order.confirmed_on.isoformat() if order.confirmed_on else None,
        }

    @staticmethod
    def overview(admin_id):
        PaymentAdminService.require_admin(admin_id)
        PaymentService.ensure_storage()
        orders = PaymentOrder.query.all()
        confirmed = [order for order in orders if order.status in PaymentService.CONFIRMED_STATUSES]
        refunds = RefundRequest.query.all()
        payouts = PayoutRecord.query.all()
        gross = sum(int(order.gross_amount_pence or 0) for order in confirmed)
        refunded = sum(
            int(refund.refunded_amount_pence or 0)
            for refund in refunds
            if refund.status in {"refunded", "partially_refunded"}
        )
        return {
            "currency": PaymentService.CURRENCY.upper(),
            "order_count": len(orders),
            "paid_order_count": len(confirmed),
            "pending_order_count": sum(order.status in {"requires_payment", "confirming", "creating_intent"} for order in orders),
            "refund_count": len(refunds),
            "refund_pending_count": sum(refund.status in {"requested", "approved_awaiting_ondeen", "processing"} for refund in refunds),
            "payout_pending_count": sum(payout.status in {"pending", "processing", "claiming"} for payout in payouts),
            "gross": PaymentAdminService._money(gross),
            "refunded": PaymentAdminService._money(refunded),
            "recent_orders": [PaymentAdminService._order_payload(order) for order in sorted(orders, key=lambda item: item.created_on or 0, reverse=True)[:8]],
        }

    @staticmethod
    def orders(admin_id, status=None, limit=100):
        PaymentAdminService.require_admin(admin_id)
        PaymentService.ensure_storage()
        try:
            limit = max(1, min(int(limit or 100), 250))
        except (TypeError, ValueError):
            limit = 100
        query = PaymentOrder.query.order_by(PaymentOrder.created_on.desc())
        if status:
            query = query.filter(PaymentOrder.status == str(status).strip())
        return {"orders": [PaymentAdminService._order_payload(order) for order in query.limit(limit).all()]}

    @staticmethod
    def refunds(admin_id, status=None, limit=100):
        PaymentAdminService.require_admin(admin_id)
        PaymentService.ensure_storage()
        try:
            limit = max(1, min(int(limit or 100), 250))
        except (TypeError, ValueError):
            limit = 100
        query = RefundRequest.query.order_by(RefundRequest.requested_on.desc())
        if status:
            query = query.filter(RefundRequest.status == str(status).strip())
        return {"refunds": [PaymentService.refund_payload(refund) for refund in query.limit(limit).all()]}

    @staticmethod
    def payouts(admin_id, limit=100):
        PaymentAdminService.require_admin(admin_id)
        PaymentService.ensure_storage()
        try:
            limit = max(1, min(int(limit or 100), 250))
        except (TypeError, ValueError):
            limit = 100
        rows = PayoutRecord.query.order_by(PayoutRecord.created_on.desc()).limit(limit).all()
        return {
            "payouts": [
                {
                    "id": payout.id,
                    "order_key": payout.order.order_key if payout.order else None,
                    "event_title": payout.order.event.title if payout.order and payout.order.event else None,
                    "organizer_id": payout.organizer_id,
                    "status": payout.status,
                    "amount": PaymentAdminService._money(payout.amount_pence, payout.currency),
                    "eligible_on": payout.eligible_on.isoformat() if payout.eligible_on else None,
                    "paid_on": payout.paid_on.isoformat() if payout.paid_on else None,
                    "failure_message": payout.failure_message,
                }
                for payout in rows
            ]
        }
