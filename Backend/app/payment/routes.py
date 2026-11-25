from flask import Response, jsonify, request

from app.services.admin.payment import PaymentAdminService
from app.models.payment import RefundRequest
from app.services.payment import PaymentService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors, handle_service_success

from . import payment


def _connect_return_page(title, message):
    return Response(
        f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><style>body{{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#faf7fd;color:#191719;margin:0;padding:40px 24px}}main{{max-width:520px;margin:12vh auto;background:#fff;border:1px solid #e8dfef;border-radius:24px;padding:32px;box-shadow:0 18px 60px #35105d18}}h1{{color:#461477}}p{{font-size:18px;line-height:1.55}}</style></head>
<body><main><h1>{title}</h1><p>{message}</p><p>You can now return to the OnDeen Organiser app.</p></main></body></html>""",
        mimetype="text/html",
    )


@payment.route("/connect/return", methods=["GET"])
def connect_return():
    return _connect_return_page("Stripe setup received", "Refresh the Stripe status in OnDeen to continue publishing your paid listing.")


@payment.route("/connect/refresh", methods=["GET"])
def connect_refresh():
    return _connect_return_page("Stripe setup link expired", "Return to OnDeen and tap Connect Stripe again to create a fresh secure link.")


@payment.route("/connect/status", methods=["GET", "POST"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def connect_status(session_id):
    return PaymentService.connected_status(session_id, refresh=True)


@payment.route("/connect/onboarding", methods=["POST"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def connect_onboarding(session_id):
    return PaymentService.create_onboarding_link(session_id)


@payment.route("/orders/<order_key>", methods=["GET", "POST"])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def order_status(order_key, session_id=None):
    data = request.get_json(silent=True) or {}
    return PaymentService.get_order(
        order_key,
        actor_user_id=session_id,
        recovery_token=data.get("recovery_token") or request.headers.get("X-Guest-Recovery-Token"),
        refresh=True,
    )


@payment.route("/refunds", methods=["POST"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def request_refund(session_id):
    data = request.get_json(silent=True) or {}
    return PaymentService.request_refund(
        data.get("payment_order_key"),
        session_id,
        amount_pence=data.get("amount_pence"),
        reason=data.get("reason"),
        idempotency_key=data.get("idempotency_key") or request.headers.get("Idempotency-Key"),
    )


@payment.route("/refunds/<int:refund_id>/decision", methods=["POST"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def decide_refund(refund_id, session_id):
    data = request.get_json(silent=True) or {}
    return PaymentService.decide_refund(
        refund_id,
        session_id,
        approve=data.get("approve"),
        amount_pence=data.get("amount_pence"),
        note=data.get("note"),
    )


@payment.route("/refunds/<int:refund_id>/execute", methods=["POST"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def execute_refund(refund_id, session_id):
    data = request.get_json(silent=True) or {}
    return PaymentService.execute_refund(
        refund_id,
        session_id,
        amount_pence=data.get("amount_pence"),
        note=data.get("note"),
    )


@payment.route("/refunds/organizer", methods=["GET"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def organizer_refunds(session_id):
    rows = RefundRequest.query.filter_by(organizer_id=session_id).order_by(RefundRequest.requested_on.desc()).all()
    return {"refunds": [PaymentService.refund_payload(row) for row in rows]}


@payment.route("/payouts/run", methods=["POST"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def run_payouts(session_id):
    from app.models.users import Users

    actor = Users.query.get(session_id)
    if not actor or actor.role_type != 1:
        raise ServiceError("Admin account required")
    return PaymentService.run_payouts()


@payment.route("/admin/overview", methods=["GET"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def admin_overview(session_id):
    return PaymentAdminService.overview(session_id)


@payment.route("/admin/orders", methods=["GET"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def admin_orders(session_id):
    return PaymentAdminService.orders(
        session_id,
        status=request.args.get("status"),
        limit=request.args.get("limit", 100),
    )


@payment.route("/admin/refunds", methods=["GET"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def admin_refunds(session_id):
    return PaymentAdminService.refunds(
        session_id,
        status=request.args.get("status"),
        limit=request.args.get("limit", 100),
    )


@payment.route("/admin/payouts", methods=["GET"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def admin_payouts(session_id):
    return PaymentAdminService.payouts(session_id, limit=request.args.get("limit", 100))


@payment.route("/admin/adjustments", methods=["POST"])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def admin_adjustment(session_id):
    data = request.get_json(silent=True) or {}
    return PaymentService.add_admin_adjustment(
        data.get("payment_order_key"),
        session_id,
        data.get("amount_pence"),
        data.get("reason"),
        idempotency_key=data.get("idempotency_key") or request.headers.get("Idempotency-Key"),
    )


@payment.route("/webhook", methods=["POST"])
def stripe_webhook():
    try:
        result = PaymentService.handle_webhook(
            request.get_data(cache=False),
            request.headers.get("Stripe-Signature"),
        )
        return jsonify(result), 200
    except ServiceError as error:
        return jsonify({"error": error.message}), 400
    except Exception:
        return jsonify({"error": "Stripe webhook processing failed"}), 500
