import json
import os
import tempfile
import unittest
from datetime import date, datetime, time, timedelta
from types import SimpleNamespace
from unittest.mock import patch

import stripe
from sqlalchemy import inspect, text


os.environ["ONDEEN_LOCAL"] = "1"
os.environ["ENABLE_SCHEDULER"] = "false"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["RATELIMIT_STORAGE_URI"] = "memory://"
os.environ["PAYMENT_P0_ENABLED"] = "true"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_payment_unit_test_only"
os.environ.setdefault("SECRET_KEY", "local-payment-test-secret")
os.environ.setdefault("JWT_SECRET_KEY", "local-payment-test-jwt-secret")

from app import db, on_deen  # noqa: E402
from app.models.category import Category  # noqa: E402
from app.models.event import Event, EventDate, EventDateTime, EventTicket, Participant, PaymentTransaction  # noqa: E402
from app.models.guest_booking import GuestBooking  # noqa: E402
from app.models.payment import (  # noqa: E402
    FinancialLedgerEntry,
    PaymentOrder,
    PaymentOrderItem,
    PayoutRecord,
    RefundRequest,
    StripeConnectedAccount,
    StripeEventReceipt,
)
from app.models.users import Notification_History, Users  # noqa: E402
from app.repositories.user import user  # noqa: E402
from app.services.customer.event import EventService  # noqa: E402
from app.services.admin.organizer import OrganizerService as AdminOrganizerService  # noqa: E402
from app.services.payment import PaymentService  # noqa: E402
from app.utils.custom_exception import ServiceError  # noqa: E402


class PaymentP0Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.upload_root = tempfile.TemporaryDirectory()
        os.environ["UPLOAD_ROOT"] = cls.upload_root.name
        os.environ["UPLOAD_PUBLIC_BASE_URL"] = "http://payment.test"
        cls.app = on_deen()
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        cls.upload_root.cleanup()

    def setUp(self):
        os.environ["PAYMENT_P0_ENABLED"] = "true"
        os.environ["PAYMENT_PAYOUT_WORKER_ENABLED"] = "false"
        self.qr_upload_patcher = patch("app.repositories.event.upload_base64_file", return_value="http://payment.test/ticket-qr.png")
        self.ticket_file_patcher = patch("app.repositories.event.create_pdf_file", return_value="http://payment.test/ticket.pdf")
        self.qr_upload_patcher.start()
        self.ticket_file_patcher.start()
        self.account_retrieve_patcher = patch(
            "app.services.payment.stripe.Account.retrieve",
            return_value=SimpleNamespace(
                details_submitted=True,
                charges_enabled=True,
                payouts_enabled=True,
                requirements={"currently_due": [], "disabled_reason": None},
            ),
        )
        self.account_retrieve_patcher.start()
        self.addCleanup(self.qr_upload_patcher.stop)
        self.addCleanup(self.ticket_file_patcher.stop)
        self.addCleanup(self.account_retrieve_patcher.stop)
        self.organizer_id = 81001
        self.buyer_id = 81002
        self.event_id = 81001
        with self.app.app_context():
            db.drop_all()
            db.create_all()
            self.organizer = Users(
                id=self.organizer_id,
                role_type=3,
                first_name="Payment",
                last_name="Organiser",
                country_code="+44",
                mobile_number="770081001",
                email_id="payment-organiser@local.test",
                status=1,
            )
            self.buyer = Users(
                id=self.buyer_id,
                role_type=2,
                first_name="Payment",
                last_name="Buyer",
                country_code="+44",
                mobile_number="770081002",
                email_id="payment-buyer@local.test",
                status=1,
            )
            self.category = Category(id=81001, title="Payment category", home_view=True)
            self.event = Event(
                id=self.event_id,
                user_id=self.organizer.id,
                title="Payment reference listing",
                category_id=self.category.id,
                start_date=datetime(2026, 12, 24),
                end_date=datetime(2026, 12, 24),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=1,
                price=20,
                location_type=1,
                available=20,
                booked=0,
                quantity_per_user=5,
                ticket_type=0,
                qrcode_type=0,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
                created_by=self.organizer.id,
                updated_by=self.organizer.id,
            )
            self.connected = StripeConnectedAccount(
                organizer_id=self.organizer.id,
                stripe_account_id="acct_test_ondeen",
                details_submitted=True,
                charges_enabled=True,
                payouts_enabled=True,
                requirements_due="[]",
            )
            db.session.add_all([self.organizer, self.buyer, self.category, self.event, self.connected])
            db.session.commit()

    @staticmethod
    def _intent(order, status="succeeded", stripe_fee=70):
        return SimpleNamespace(
            id=order.stripe_payment_intent_id,
            livemode=False,
            metadata={"ondeen_order_key": order.order_key},
            amount=order.gross_amount_pence,
            currency="gbp",
            status=status,
            latest_charge=SimpleNamespace(
                id="ch_test_ondeen",
                balance_transaction=SimpleNamespace(fee=stripe_fee),
            ),
        )

    def _create_order(self, quantity=1, key="payment-test-order"):
        intent = SimpleNamespace(id="pi_test_ondeen", client_secret="pi_test_ondeen_secret")
        with patch("app.services.payment.stripe.PaymentIntent.create", return_value=intent):
            return PaymentService.create_order(
                self.buyer_id,
                {
                    "event_id": self.event_id,
                    "quantity": quantity,
                    "idempotency_key": key,
                },
            )

    def test_fee_is_five_percent_with_per_unit_floor_and_cap(self):
        self.assertEqual(PaymentService.fee_per_unit(599), 30)
        self.assertEqual(PaymentService.fee_per_unit(600), 30)
        self.assertEqual(PaymentService.fee_per_unit(610), 31)
        self.assertEqual(PaymentService.fee_per_unit(500), 30)
        self.assertEqual(PaymentService.fee_per_unit(2000), 100)
        self.assertEqual(PaymentService.fee_per_unit(2989), 149)
        self.assertEqual(PaymentService.fee_per_unit(2990), 150)
        self.assertEqual(PaymentService.fee_per_unit(3001), 150)
        self.assertEqual(PaymentService.fee_per_unit(10000), 150)
        self.assertEqual(PaymentService.fee_per_unit(501), 30)

    def test_order_owner_can_recover_when_authenticated_id_is_text(self):
        with self.app.app_context():
            created = self._create_order(key="text-owner-recovery")
            recovered = PaymentService.get_order(
                created["payment_order_key"],
                actor_user_id=str(self.buyer_id),
                refresh=False,
            )

        self.assertEqual(recovered["payment_order_key"], created["payment_order_key"])
        self.assertFalse(recovered["confirmed"])

    def test_client_money_tampering_currency_and_overflow_are_rejected(self):
        with self.app.app_context(), patch(
            "app.services.payment.stripe.PaymentIntent.create"
        ) as create:
            for unsafe_payload in (
                {"currency": "usd"},
                {"amount": 1},
                {"amount_pence": 1},
                {"ondeen_fee_pence": 0},
                {"quantity": 1.5},
                {"quantity": True},
                {"quantity": "1.5"},
                {"quantity": "--1"},
            ):
                with self.assertRaises(ServiceError):
                    PaymentService.create_order(
                        self.buyer_id,
                        {"event_id": self.event_id, "quantity": 1, **unsafe_payload},
                    )
            event = db.session.get(Event, self.event_id)
            event.price = 1_000_000
            db.session.commit()
            with self.assertRaises(ServiceError):
                PaymentService.create_order(
                    self.buyer_id,
                    {"event_id": self.event_id, "quantity": 1},
                )
            create.assert_not_called()
            self.assertEqual(PaymentOrder.query.count(), 0)

    def test_duplicate_ticket_lines_are_rejected_before_payment(self):
        with self.app.app_context(), patch(
            "app.services.payment.stripe.PaymentIntent.create"
        ) as create:
            event = db.session.get(Event, self.event_id)
            event.ticket_type = 1
            ticket = EventTicket(
                event_id=event.id,
                title="Standard",
                price=20,
                available=5,
                booked=0,
                max_per_user=5,
                status=1,
            )
            db.session.add(ticket)
            db.session.commit()

            with self.assertRaisesRegex(ServiceError, "Duplicate ticket selection"):
                PaymentService.create_order(
                    self.buyer_id,
                    {
                        "event_id": event.id,
                        "tickets": [
                            {"id": ticket.id, "quantity": 1},
                            {"id": ticket.id, "quantity": 1},
                        ],
                    },
                )
            create.assert_not_called()
            self.assertEqual(PaymentOrder.query.count(), 0)

    def test_order_uses_server_price_and_creates_no_booking_before_success(self):
        with self.app.app_context():
            payload = self._create_order(quantity=2)
            order = PaymentOrder.query.one()
            self.assertEqual(payload["amount_pence"], 4000)
            self.assertEqual(order.gross_amount_pence, 4000)
            self.assertEqual(order.ondeen_fee_pence, 200)
            self.assertEqual(order.currency, "gbp")
            self.assertEqual(Participant.query.count(), 0)
            self.assertEqual(PaymentTransaction.query.count(), 0)
            self.assertEqual(FinancialLedgerEntry.query.count(), 0)

    def test_order_and_ticket_snapshots_are_immutable_but_status_can_progress(self):
        with self.app.app_context():
            self._create_order(quantity=2)
            order = PaymentOrder.query.one()
            item = PaymentOrderItem.query.one()

            order.gross_amount_pence = 1
            with self.assertRaisesRegex(ValueError, "Payment order snapshot is immutable"):
                db.session.commit()
            db.session.rollback()

            item = PaymentOrderItem.query.one()
            item.unit_price_pence = 1
            with self.assertRaisesRegex(ValueError, "Payment order item snapshot is immutable"):
                db.session.commit()
            db.session.rollback()

            order = PaymentOrder.query.one()
            order.status = "payment_failed"
            db.session.commit()
            self.assertEqual(PaymentOrder.query.one().status, "payment_failed")

            item = PaymentOrderItem.query.one()
            db.session.delete(item)
            with self.assertRaisesRegex(ValueError, "Payment order item snapshots cannot be deleted"):
                db.session.commit()
            db.session.rollback()

            order = PaymentOrder.query.one()
            db.session.delete(order)
            with self.assertRaises(ValueError):
                db.session.commit()
            db.session.rollback()
            self.assertEqual(PaymentOrder.query.count(), 1)
            self.assertEqual(PaymentOrderItem.query.count(), 1)

    def test_same_idempotency_key_returns_one_order_and_intent(self):
        with self.app.app_context():
            with patch("app.services.payment.stripe.PaymentIntent.create", return_value=SimpleNamespace(id="pi_once", client_secret="secret_once")) as create:
                first = PaymentService.create_order(self.buyer_id, {"event_id": self.event_id, "quantity": 1, "idempotency_key": "same-key"})
                second = PaymentService.create_order(self.buyer_id, {"event_id": self.event_id, "quantity": 1, "idempotency_key": "same-key"})
            self.assertEqual(first["payment_order_key"], second["payment_order_key"])
            self.assertEqual(PaymentOrder.query.count(), 1)
            create.assert_called_once()

    def test_same_idempotency_key_rejects_a_different_ticket_selection(self):
        with self.app.app_context():
            self._create_order(quantity=1, key="selection-bound-key")
            with patch("app.services.payment.stripe.PaymentIntent.create") as create:
                with self.assertRaisesRegex(ServiceError, "Idempotency key is already in use"):
                    PaymentService.create_order(
                        self.buyer_id,
                        {
                            "event_id": self.event_id,
                            "quantity": 2,
                            "idempotency_key": "selection-bound-key",
                        },
                    )
            create.assert_not_called()
            self.assertEqual(PaymentOrder.query.count(), 1)
            self.assertEqual(PaymentOrder.query.one().quantity, 1)

    def test_ambiguous_payment_intent_create_reuses_the_same_stripe_key(self):
        with self.app.app_context(), patch(
            "app.services.payment.stripe.PaymentIntent.create",
            side_effect=[RuntimeError("response lost"), SimpleNamespace(id="pi_recovered", client_secret="secret_recovered")],
        ) as create:
            request_data = {
                "event_id": self.event_id,
                "quantity": 1,
                "idempotency_key": "ambiguous-payment-intent",
            }
            with self.assertRaises(ServiceError):
                PaymentService.create_order(self.buyer_id, request_data)
            order = PaymentOrder.query.one()
            self.assertEqual(order.status, "payment_failed")
            self.assertIsNone(order.stripe_payment_intent_id)

            recovered = PaymentService.create_order(self.buyer_id, request_data)

            self.assertEqual(create.call_count, 2)
            self.assertEqual(
                [call.kwargs["idempotency_key"] for call in create.call_args_list],
                [f"payment-intent-{order.order_key}", f"payment-intent-{order.order_key}"],
            )
            self.assertEqual(recovered["client_secret"], "secret_recovered")
            self.assertEqual(recovered["payment_order_key"], order.order_key)
            self.assertEqual(PaymentOrder.query.one().status, "requires_payment")
            self.assertEqual(Participant.query.count(), 0)

    def test_paid_guest_retry_reissues_recovery_token_after_ambiguous_intent_create(self):
        with self.app.app_context(), patch(
            "app.services.payment.stripe.PaymentIntent.create",
            side_effect=[RuntimeError("response lost"), SimpleNamespace(id="pi_guest_recovered", client_secret="guest_secret")],
        ):
            request_data = {
                "event_id": self.event_id,
                "quantity": 1,
                "idempotency_key": "ambiguous-guest-payment-intent",
            }
            guest = {
                "email_id": "ambiguous-paid-guest@local.test",
                "country_code": "+44",
                "mobile_number": "7700000999",
            }
            with self.assertRaises(ServiceError):
                PaymentService.create_order(self.buyer_id, request_data, guest=guest)

            recovered = PaymentService.create_order(self.buyer_id, request_data, guest=guest)
            order = PaymentOrder.query.one()

            self.assertTrue(recovered["recovery_token"])
            self.assertTrue(PaymentService._recovery_allowed(order, recovered["recovery_token"]))
            self.assertEqual(recovered["client_secret"], "guest_secret")
            self.assertEqual(PaymentOrder.query.count(), 1)
            self.assertEqual(Participant.query.count(), 0)

    def test_verified_success_confirms_exactly_once_and_builds_ledger_and_payout(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            intent = self._intent(order)
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=intent):
                first = PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
                second = PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            self.assertTrue(first["confirmed"])
            self.assertEqual(first["participant_id"], second["participant_id"])
            self.assertEqual(Participant.query.count(), 1)
            self.assertEqual(db.session.get(Event, self.event_id).booked, 1)
            self.assertEqual(FinancialLedgerEntry.query.count(), 3)
            self.assertEqual(PayoutRecord.query.count(), 1)
            self.assertEqual(PaymentTransaction.query.count(), 0)
            payout = PayoutRecord.query.one()
            self.assertEqual(payout.amount_pence, 1830)
            self.assertEqual(payout.eligibility_start_on, datetime(2026, 12, 24, 18, 0))
            self.assertEqual(payout.eligibility_time_zone, "Europe/London")
            self.assertTrue(
                payout.bank_holiday_calendar_version.startswith(
                    PaymentService.BANK_HOLIDAY_CALENDAR_RULESET
                )
            )

    def test_failed_payment_never_confirms_booking(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order, status="requires_payment_method")):
                result = PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            self.assertFalse(result["confirmed"])
            self.assertEqual(result["status"], "payment_failed")
            self.assertEqual(Participant.query.count(), 0)
            self.assertEqual(FinancialLedgerEntry.query.count(), 0)

    def test_forged_or_mismatched_success_never_confirms_booking(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            wrong_metadata = self._intent(order)
            wrong_metadata.metadata = {"ondeen_order_key": "another-order"}
            with self.assertRaises(ServiceError):
                PaymentService.confirm_order(order, wrong_metadata)
            wrong_amount = self._intent(order)
            wrong_amount.amount += 1
            with self.assertRaises(ServiceError):
                PaymentService.confirm_order(order, wrong_amount)
            self.assertEqual(Participant.query.count(), 0)
            self.assertEqual(FinancialLedgerEntry.query.count(), 0)

    def test_confirmation_claim_prevents_parallel_duplicate_booking_and_can_recover_when_stale(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            order.status = "confirming"
            order.updated_on = datetime.utcnow()
            db.session.commit()
            current = PaymentService.confirm_order(order, self._intent(order))
            self.assertFalse(current["confirmed"])
            self.assertEqual(Participant.query.count(), 0)

            order.updated_on = datetime.utcnow() - PaymentService.CLAIM_STALE_AFTER - timedelta(seconds=1)
            db.session.commit()
            recovered = PaymentService.confirm_order(order, self._intent(order))
            self.assertTrue(recovered["confirmed"])
            self.assertEqual(Participant.query.count(), 1)

    def test_free_booking_never_creates_financial_rows(self):
        with self.app.app_context():
            event = db.session.get(Event, self.event_id)
            event.price_type = 0
            event.price = 0
            db.session.commit()
            response = EventService.add_participant(self.buyer_id, {"event_id": self.event_id, "quantity": 1})
            self.assertIsInstance(response, dict)
            self.assertEqual(Participant.query.count(), 1)
            self.assertEqual(PaymentOrder.query.count(), 0)
            self.assertEqual(FinancialLedgerEntry.query.count(), 0)
            self.assertEqual(PayoutRecord.query.count(), 0)

    def test_paid_guest_course_is_rejected_before_creating_payment(self):
        with self.app.app_context(), patch(
            "app.services.payment.stripe.PaymentIntent.create"
        ) as create:
            event = db.session.get(Event, self.event_id)
            event.occusr_type = 2
            event.end_date = event.start_date + timedelta(days=14)
            db.session.commit()
            result = EventService.add_guest_participant({
                "event_id": self.event_id,
                "quantity": 1,
                "first_name": "Paid",
                "last_name": "Guest",
                "email_id": "paid-guest@local.test",
                "country_code": "+44",
                "mobile_number": "7700000000",
            })
            self.assertIsInstance(result, tuple)
            self.assertIn("one-off events only", result[0]["response"]["message"])
            create.assert_not_called()
            self.assertEqual(PaymentOrder.query.count(), 0)

    def test_paid_single_session_guest_confirms_once_with_recovery_token(self):
        with self.app.app_context(), patch(
            "app.services.payment.stripe.PaymentIntent.create",
            return_value=SimpleNamespace(id="pi_paid_guest", client_secret="pi_paid_guest_secret"),
        ):
            pending = EventService.add_guest_participant({
                "event_id": self.event_id,
                "quantity": 1,
                "first_name": "Paid",
                "last_name": "Guest",
                "email_id": "paid-single-guest@local.test",
                "country_code": "+44",
                "mobile_number": "7700000001",
                "idempotency_key": "paid-single-guest-order",
            })
            self.assertTrue(pending["guest_booking_pending"])
            self.assertTrue(pending["recovery_token"])
            self.assertEqual(Participant.query.count(), 0)
            self.assertEqual(GuestBooking.query.count(), 0)

            order = PaymentOrder.query.filter_by(order_key=pending["payment_order_key"]).one()
            self.assertNotEqual(order.buyer_user_id, self.buyer_id)
            with self.assertRaises(ServiceError):
                PaymentService.get_order(order.order_key, recovery_token="wrong-token", refresh=False)

            with patch(
                "app.services.payment.stripe.PaymentIntent.retrieve",
                return_value=self._intent(order),
            ):
                confirmed = PaymentService.get_order(
                    order.order_key,
                    recovery_token=pending["recovery_token"],
                )
                repeated = PaymentService.get_order(
                    order.order_key,
                    recovery_token=pending["recovery_token"],
                )
            self.assertTrue(confirmed["confirmed"])
            self.assertEqual(confirmed["guest_booking"]["email_id"], "paid-single-guest@local.test")
            self.assertEqual(confirmed["participant_id"], repeated["participant_id"])
            self.assertEqual(Participant.query.count(), 1)
            self.assertEqual(GuestBooking.query.count(), 1)
            self.assertEqual(FinancialLedgerEntry.query.count(), 3)

    def test_paid_single_session_guest_preserves_ticket_selection_through_confirmation(self):
        with self.app.app_context():
            event = db.session.get(Event, self.event_id)
            event.ticket_type = 1
            ticket = EventTicket(
                event_id=event.id,
                title="Guest Admission",
                price=12,
                available=5,
                booked=0,
                max_per_user=1,
                status=1,
            )
            db.session.add(ticket)
            db.session.commit()

            with patch("app.services.payment.stripe.PaymentIntent.create") as create_without_ticket:
                missing_ticket = EventService.add_guest_participant({
                    "event_id": event.id,
                    "quantity": 1,
                    "first_name": "Ticketless",
                    "last_name": "Guest",
                    "email_id": "ticketless-paid-guest@local.test",
                    "country_code": "+44",
                    "mobile_number": "7700000003",
                })
            self.assertIsInstance(missing_ticket, tuple)
            self.assertIn("Ticket selection is required", missing_ticket[0]["response"]["message"])
            create_without_ticket.assert_not_called()

            with patch(
                "app.services.payment.stripe.PaymentIntent.create",
                return_value=SimpleNamespace(id="pi_ticketed_guest", client_secret="pi_ticketed_guest_secret"),
            ):
                pending = EventService.add_guest_participant({
                    "event_id": event.id,
                    "quantity": 1,
                    "tickets": [{"id": ticket.id, "quantity": 1}],
                    "first_name": "Ticketed",
                    "last_name": "Guest",
                    "email_id": "ticketed-paid-guest@local.test",
                    "country_code": "+44",
                    "mobile_number": "7700000002",
                    "idempotency_key": "ticketed-paid-guest-order",
                })

            order = PaymentOrder.query.filter_by(order_key=pending["payment_order_key"]).one()
            self.assertEqual(order.items[0].ticket_id, ticket.id)
            self.assertEqual(json.loads(order.booking_payload)["tickets"], [{"id": ticket.id, "quantity": 1}])
            with patch(
                "app.services.payment.stripe.PaymentIntent.retrieve",
                return_value=self._intent(order),
            ):
                confirmed = PaymentService.get_order(
                    order.order_key,
                    recovery_token=pending["recovery_token"],
                )
            participant = db.session.get(Participant, confirmed["participant_id"])
            self.assertEqual(participant.ticket_id, ticket.id)
            self.assertEqual(participant.paid_amount, 12)
            self.assertEqual(GuestBooking.query.one().participant_id, participant.id)

    def test_paid_publish_requires_complete_connect_readiness(self):
        with self.app.app_context():
            incomplete_states = (
                {"connected": False, "ready": False},
                {"connected": True, "ready": False, "details_submitted": False},
                {"connected": True, "ready": False, "charges_enabled": False},
                {"connected": True, "ready": False, "payouts_enabled": False},
                {"connected": True, "ready": False, "temporarily_unavailable": True},
            )
            for state in incomplete_states:
                with self.subTest(state=state), patch.object(
                    PaymentService,
                    "connected_status",
                    return_value=state,
                ), self.assertRaises(ServiceError):
                    PaymentService.require_paid_listing_ready(self.organizer_id)
            ready = {"connected": True, "ready": True}
            with patch.object(PaymentService, "connected_status", return_value=ready):
                self.assertEqual(PaymentService.require_paid_listing_ready(self.organizer_id), ready)

    def test_eligibility_skips_weekends_and_england_wales_bank_holidays(self):
        with self.app.app_context():
            eligible = PaymentService.eligibility_for_event(db.session.get(Event, self.event_id))
            self.assertEqual(eligible.date(), date(2026, 12, 31))

    def test_bank_holiday_calendar_matches_the_versioned_govuk_snapshot(self):
        expected_2026 = {
            date(2026, 1, 1), date(2026, 4, 3), date(2026, 4, 6),
            date(2026, 5, 4), date(2026, 5, 25), date(2026, 8, 31),
            date(2026, 12, 25), date(2026, 12, 28),
        }
        self.assertEqual(PaymentService.england_wales_bank_holidays(2026), expected_2026)
        version = PaymentService._bank_holiday_calendar_version({2026})
        self.assertTrue(version.startswith(PaymentService.BANK_HOLIDAY_CALENDAR_RULESET))
        self.assertRegex(version, r":2026-2026:[0-9a-f]{16}$")

    def test_storage_upgrade_adds_payout_eligibility_snapshot_columns(self):
        with self.app.app_context():
            expected = {
                "eligibility_start_on",
                "eligibility_time_zone",
                "bank_holiday_calendar_version",
            }
            for column in expected:
                db.session.execute(text(
                    f"ALTER TABLE payment_payout_record DROP COLUMN {column}"
                ))
            db.session.commit()

            PaymentService.ensure_storage()

            columns = {
                column["name"]
                for column in inspect(db.engine).get_columns("payment_payout_record")
            }
            self.assertTrue(expected.issubset(columns))

    def test_course_uses_first_session_and_untransferred_eligibility_recalculates(self):
        with self.app.app_context():
            event_date = EventDate(event_id=self.event_id, date=date(2027, 1, 4), status=1)
            db.session.add(event_date)
            db.session.flush()
            db.session.add(EventDateTime(
                event_date_id=event_date.id,
                start_time=time(10, 30),
                end_time=time(11, 30),
                available=20,
                booked=0,
                status=1,
            ))
            db.session.commit()
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            payout = PayoutRecord.query.one()
            self.assertEqual(payout.eligible_on.date(), date(2027, 1, 7))
            self.assertEqual(payout.eligibility_start_on, datetime(2027, 1, 4, 10, 30))
            event_date.date = date(2027, 1, 11)
            db.session.commit()
            self.assertEqual(PaymentService.recalculate_event_eligibility(self.event_id), 1)
            self.assertEqual(PayoutRecord.query.one().eligible_on.date(), date(2027, 1, 14))
            self.assertEqual(PayoutRecord.query.one().eligibility_start_on, datetime(2027, 1, 11, 10, 30))

    def test_refund_requires_user_request_organizer_decision_and_admin_execution(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            request_payload = PaymentService.request_refund(order.order_key, self.buyer_id, amount_pence=1000, reason="Unable to attend")
            decision = PaymentService.decide_refund(request_payload["id"], self.organizer_id, True, amount_pence=1000)
            self.assertEqual(decision["status"], "approved_awaiting_ondeen")
            admin = Users(
                id=81003,
                role_type=1,
                first_name="Payment",
                last_name="Admin",
                country_code="+44",
                mobile_number="770081003",
                email_id="payment-admin@local.test",
                status=1,
            )
            db.session.add(admin)
            db.session.commit()
            stripe_refund = SimpleNamespace(id="re_test_ondeen", status="succeeded")
            with patch("app.services.payment.stripe.Refund.create", return_value=stripe_refund):
                result = PaymentService.execute_refund(request_payload["id"], admin.id)
            self.assertEqual(result["status"], "partially_refunded")
            self.assertEqual(RefundRequest.query.one().refunded_amount_pence, 1000)
            types = {entry.entry_type for entry in FinancialLedgerEntry.query.all()}
            self.assertIn("refund", types)
            self.assertIn("ondeen_fee_reversal", types)
            payout = PayoutRecord.query.one()
            self.assertEqual(payout.amount_pence, 880)
            self.assertEqual(payout.status, "pending")

    def test_refund_permissions_are_role_and_owner_scoped(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            outsider = Users(
                id=81005,
                role_type=2,
                first_name="Other",
                last_name="User",
                country_code="+44",
                mobile_number="770081005",
                email_id="payment-outsider@local.test",
                status=1,
            )
            db.session.add(outsider)
            db.session.commit()
            with self.assertRaises(ServiceError):
                PaymentService.request_refund(order.order_key, outsider.id)
            refund = PaymentService.request_refund(order.order_key, self.buyer_id)
            with self.assertRaises(ServiceError):
                PaymentService.decide_refund(refund["id"], outsider.id, True)
            PaymentService.decide_refund(refund["id"], self.organizer_id, True)
            with self.assertRaises(ServiceError):
                PaymentService.execute_refund(refund["id"], outsider.id)

    def test_refund_amounts_are_validated_and_stale_approval_cannot_over_refund(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            PaymentService.confirm_order(order, self._intent(order))

            for invalid_amount in ("not-pence", 0, 1.5, True, "1.5", "--1"):
                with self.assertRaises(ServiceError):
                    PaymentService.request_refund(
                        order.order_key,
                        self.buyer_id,
                        amount_pence=invalid_amount,
                    )

            requested = PaymentService.request_refund(order.order_key, self.buyer_id, amount_pence=1500)
            with self.assertRaisesRegex(ServiceError, "Refund decision must be true or false"):
                PaymentService.decide_refund(
                    requested["id"],
                    self.organizer_id,
                    "false",
                )
            for invalid_amount in ("not-pence", 0, 1.5, True, "1.5", "--1"):
                with self.assertRaises(ServiceError):
                    PaymentService.decide_refund(
                        requested["id"],
                        self.organizer_id,
                        True,
                        amount_pence=invalid_amount,
                    )
            refund = db.session.get(RefundRequest, requested["id"])
            self.assertEqual(refund.status, "requested")
            self.assertIsNone(refund.decided_on)

            PaymentService.decide_refund(requested["id"], self.organizer_id, True, amount_pence=1500)
            for invalid_amount in ("not-pence", 0, 1.5, True, "1.5", "--1"):
                with self.assertRaises(ServiceError):
                    PaymentService.execute_refund(
                        requested["id"],
                        amount_pence=invalid_amount,
                        system=True,
                    )

            completed = RefundRequest(
                order_id=order.id,
                requester_user_id=self.buyer_id,
                organizer_id=self.organizer_id,
                idempotency_key="already-completed-refund",
                requested_amount_pence=1000,
                approved_amount_pence=1000,
                refunded_amount_pence=1000,
                status="partially_refunded",
            )
            db.session.add(completed)
            db.session.commit()
            with patch("app.services.payment.stripe.Refund.create") as create_refund:
                with self.assertRaises(ServiceError):
                    PaymentService.execute_refund(requested["id"], system=True)
            create_refund.assert_not_called()
            self.assertEqual(refund.status, "approved_awaiting_ondeen")

    def test_multiple_partial_refunds_reverse_exact_total_fee_and_record_stripe_treatment(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            first = RefundRequest(
                order_id=order.id,
                organizer_id=self.organizer_id,
                idempotency_key="partial-one",
                requested_amount_pence=333,
                approved_amount_pence=333,
                status="processing",
            )
            db.session.add(first)
            db.session.commit()
            PaymentService.finalize_refund(
                first,
                333,
                SimpleNamespace(
                    id="re_partial_one",
                    balance_transaction=SimpleNamespace(id="txn_refund_one", fee=0, net=-333),
                ),
            )
            second = RefundRequest(
                order_id=order.id,
                organizer_id=self.organizer_id,
                idempotency_key="partial-two",
                requested_amount_pence=1667,
                approved_amount_pence=1667,
                status="processing",
            )
            db.session.add(second)
            db.session.commit()
            PaymentService.finalize_refund(
                second,
                1667,
                SimpleNamespace(
                    id="re_partial_two",
                    balance_transaction=SimpleNamespace(id="txn_refund_two", fee=0, net=-1667),
                ),
            )
            fee_reversals = FinancialLedgerEntry.query.filter_by(entry_type="ondeen_fee_reversal").all()
            self.assertEqual(sum(entry.amount_pence for entry in fee_reversals), order.ondeen_fee_pence)
            self.assertEqual(FinancialLedgerEntry.query.filter_by(entry_type="stripe_refund_treatment").count(), 2)

    def test_failed_refund_event_is_audited_without_downgrading_confirmed_money(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            PaymentService.confirm_order(order, self._intent(order))
            requested = PaymentService.request_refund(order.order_key, self.buyer_id, amount_pence=500)
            PaymentService.decide_refund(requested["id"], self.organizer_id, True, amount_pence=500)
            refund = db.session.get(RefundRequest, requested["id"])
            refund.status = "processing"
            refund.stripe_refund_id = "re_async_failed"
            db.session.commit()

            os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_payment_unit_test"
            failed_refund = SimpleNamespace(
                id="re_async_failed",
                status="failed",
                amount=500,
                failure_reason="declined",
            )
            failed_event = SimpleNamespace(
                id="evt_refund_async_failed",
                type="refund.updated",
                livemode=False,
                data=SimpleNamespace(object=failed_refund),
            )
            with patch("app.services.payment.stripe.Webhook.construct_event", return_value=failed_event):
                PaymentService.handle_webhook(b"refund-failed", "signature")

            refund = db.session.get(RefundRequest, requested["id"])
            self.assertEqual(refund.status, "failed")
            self.assertEqual(refund.refunded_amount_pence, 0)
            self.assertEqual(refund.admin_note, "declined")
            failed_ledger = FinancialLedgerEntry.query.filter_by(entry_type="refund_failed").one()
            self.assertEqual(failed_ledger.amount_pence, 0)
            self.assertEqual(failed_ledger.stripe_object_id, "re_async_failed")
            self.assertEqual(order.status, "payout_pending")

            repeated_event = SimpleNamespace(
                id="evt_refund_async_failed_redelivery",
                type="refund.updated",
                livemode=False,
                data=SimpleNamespace(object=failed_refund),
            )
            with patch("app.services.payment.stripe.Webhook.construct_event", return_value=repeated_event):
                PaymentService.handle_webhook(b"refund-failed-redelivery", "signature")
            self.assertEqual(FinancialLedgerEntry.query.filter_by(entry_type="refund_failed").count(), 1)
            self.assertEqual(
                Notification_History.query.filter_by(
                    task_id=f"payment-refund-{refund.id}-failed",
                    status=1,
                ).count(),
                1,
            )

            refund.status = "partially_refunded"
            refund.refunded_amount_pence = 500
            db.session.commit()
            stale_event = SimpleNamespace(
                id="evt_refund_stale_failed",
                type="refund.updated",
                livemode=False,
                data=SimpleNamespace(object=failed_refund),
            )
            with patch("app.services.payment.stripe.Webhook.construct_event", return_value=stale_event):
                PaymentService.handle_webhook(b"refund-stale-failed", "signature")
            self.assertEqual(db.session.get(RefundRequest, requested["id"]).status, "partially_refunded")

    def test_full_refund_before_transfer_cancels_booking_and_future_payout(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            participant_id = int(order.participant_ids)
            refund_payload = PaymentService.request_refund(order.order_key, self.buyer_id)
            PaymentService.decide_refund(refund_payload["id"], self.organizer_id, True)
            with patch("app.services.payment.stripe.Refund.create", return_value=SimpleNamespace(id="re_full", status="succeeded")):
                result = PaymentService.execute_refund(refund_payload["id"], admin_user_id=None, system=True)
            self.assertEqual(result["status"], "refunded")
            self.assertEqual(PayoutRecord.query.one().status, "cancelled")
            self.assertEqual(PayoutRecord.query.one().amount_pence, 0)
            self.assertEqual(db.session.get(Participant, participant_id).status, 2)
            self.assertEqual(db.session.get(Event, self.event_id).booked, 0)
            self.assertFalse(PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)["confirmed"])

    def test_failed_event_cancellation_refund_retries_once_without_duplicate_money(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            PaymentService.confirm_order(order, self._intent(order))
            participant_id = int(order.participant_ids)
            payout = PayoutRecord.query.filter_by(order_id=order.id).one()
            payout.stripe_transfer_id = "tr_cancel_already_paid"
            payout.stripe_payout_id = "po_cancel_already_paid"
            payout.status = "paid_out"
            order.status = "paid_out"
            db.session.commit()

            failed = SimpleNamespace(id="re_cancel_failed", status="failed", failure_reason="temporary_failure")
            succeeded = SimpleNamespace(id="re_cancel_retry", status="succeeded")
            with patch(
                "app.services.payment.stripe.Transfer.create_reversal",
                return_value=SimpleNamespace(id="trr_cancel_failed"),
            ) as create_reversal, patch(
                "app.services.payment.stripe.Refund.create", return_value=failed
            ) as create_refund:
                first = PaymentService.cancel_event_refunds(self.event_id)

            self.assertEqual(first, {"queued": 1, "processed": 1})
            self.assertEqual(RefundRequest.query.one().status, "failed")
            self.assertEqual(FinancialLedgerEntry.query.filter_by(entry_type="refund_failed").count(), 1)
            self.assertEqual(create_reversal.call_count, 1)
            first_adjustments = FinancialLedgerEntry.query.filter_by(entry_type="negative_adjustment").count()

            with patch("app.services.payment.stripe.Transfer.create_reversal") as duplicate_reversal, patch(
                "app.services.payment.stripe.Refund.create", return_value=succeeded
            ) as retry_refund:
                retry = PaymentService.retry_cancellation_refunds()
                replay = PaymentService.retry_cancellation_refunds()

            self.assertEqual(retry, {"claimed": 1, "processed": 1})
            self.assertEqual(replay, {"claimed": 0, "processed": 0})
            self.assertEqual(RefundRequest.query.count(), 2)
            self.assertEqual(
                sorted(row.status for row in RefundRequest.query.all()),
                ["failed", "refunded"],
            )
            self.assertEqual(FinancialLedgerEntry.query.filter_by(entry_type="refund").count(), 1)
            self.assertEqual(FinancialLedgerEntry.query.filter_by(entry_type="ondeen_fee_reversal").count(), 1)
            self.assertEqual(
                FinancialLedgerEntry.query.filter_by(entry_type="negative_adjustment").count(),
                first_adjustments,
            )
            duplicate_reversal.assert_not_called()
            payout = PayoutRecord.query.filter_by(order_id=order.id).one()
            self.assertEqual(payout.status, "paid_out")
            self.assertEqual(payout.reversed_amount_pence, payout.amount_pence)
            self.assertEqual(db.session.get(Participant, participant_id).status, 2)
            self.assertEqual(create_refund.call_args.kwargs["idempotency_key"], f"stripe-refund-1-{order.gross_amount_pence}")
            self.assertEqual(retry_refund.call_args.kwargs["idempotency_key"], f"stripe-refund-2-{order.gross_amount_pence}")

    def test_paid_booking_cancel_action_creates_refund_request_without_cancelling_early(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            participant_id = int(order.participant_ids)
            response = EventService.cancle_booking(self.buyer_id, {"event_id": self.event_id, "ticket_id": participant_id})
            self.assertIsInstance(response, dict)
            self.assertEqual(response["refund_request"]["status"], "requested")
            self.assertEqual(db.session.get(Participant, participant_id).status, 1)
            self.assertEqual(RefundRequest.query.count(), 1)

    def test_successful_payment_that_cannot_be_fulfilled_is_refunded(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            event = db.session.get(Event, self.event_id)
            event.available = 0
            db.session.commit()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)), patch(
                "app.services.payment.stripe.Refund.create", return_value=SimpleNamespace(id="re_fulfilment", status="succeeded")
            ):
                result = PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            self.assertFalse(result["confirmed"])
            self.assertEqual(result["status"], "refunded")
            self.assertEqual(Participant.query.count(), 0)
            self.assertEqual(RefundRequest.query.one().reason, "Automatic refund because paid booking could not be fulfilled")

    def test_payout_worker_is_gated_and_idempotent(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            payout = PayoutRecord.query.one()
            payout.eligible_on = datetime.utcnow() - timedelta(minutes=1)
            db.session.commit()
            self.assertEqual(PaymentService.run_payouts()["claimed"], 0)
            os.environ["PAYMENT_PAYOUT_WORKER_ENABLED"] = "true"
            with patch.object(PaymentService, "connected_status", return_value={"ready": True}), patch(
                "app.services.payment.stripe.Transfer.create", return_value=SimpleNamespace(id="tr_test_ondeen")
            ) as transfer, patch(
                "app.services.payment.stripe.Payout.create", return_value=SimpleNamespace(id="po_test_ondeen")
            ) as stripe_payout:
                result = PaymentService.run_payouts()
                retry = PaymentService.run_payouts()
            self.assertEqual(result["processed"], 1)
            self.assertEqual(retry["claimed"], 0)
            transfer.assert_called_once()
            stripe_payout.assert_called_once()
            self.assertEqual(PayoutRecord.query.one().status, "processing")

    def test_legacy_manual_withdrawal_is_authenticated_admin_only_and_retired(self):
        response = self.client.post(
            "/admin_app/organizer/wallet_tranfer",
            json={"transfer_type": 2, "user_id": self.organizer_id, "amount": 1},
        )
        self.assertEqual(response.status_code, 403)

        with self.app.app_context():
            with self.assertRaises(ServiceError):
                AdminOrganizerService.wallet_tranfer.__wrapped__(
                    {"transfer_type": 2, "user_id": self.organizer_id, "amount": 1},
                    self.organizer_id,
                )

            admin = Users(
                id=81006,
                role_type=1,
                first_name="Payment",
                last_name="Admin",
                country_code="+44",
                mobile_number="770081006",
                email_id="payment-withdrawal-admin@local.test",
                status=1,
            )
            db.session.add(admin)
            db.session.commit()
            with self.assertRaises(ServiceError) as error:
                AdminOrganizerService.wallet_tranfer.__wrapped__(
                    {"transfer_type": 2, "user_id": self.organizer_id, "amount": 1},
                    admin.id,
                )
            self.assertIn("retired", str(error.exception))

    def test_payout_waits_for_restricted_account_and_reclaims_only_stale_work(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            payout = PayoutRecord.query.one()
            payout.eligible_on = datetime.utcnow() - timedelta(minutes=1)
            db.session.commit()
            os.environ["PAYMENT_PAYOUT_WORKER_ENABLED"] = "true"
            with patch.object(PaymentService, "connected_status", return_value={"ready": False}):
                waiting = PaymentService.run_payouts()
            self.assertEqual(waiting["waiting"], 1)
            self.assertEqual(PayoutRecord.query.one().status, "pending")

            payout = PayoutRecord.query.one()
            payout.status = "claiming"
            payout.updated_on = datetime.utcnow()
            db.session.commit()
            self.assertEqual(PaymentService.run_payouts()["claimed"], 0)
            payout.updated_on = datetime.utcnow() - PaymentService.CLAIM_STALE_AFTER - timedelta(seconds=1)
            db.session.commit()
            with patch.object(PaymentService, "connected_status", return_value={"ready": True}), patch(
                "app.services.payment.stripe.Transfer.create", return_value=SimpleNamespace(id="tr_reclaimed")
            ), patch(
                "app.services.payment.stripe.Payout.create", return_value=SimpleNamespace(id="po_reclaimed")
            ):
                recovered = PaymentService.run_payouts()
            self.assertEqual(recovered["processed"], 1)
            self.assertEqual(PayoutRecord.query.one().status, "processing")

    def test_synchronous_payout_failure_is_auditable_and_retries_with_a_new_attempt(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            PaymentService.confirm_order(order, self._intent(order))
            payout = PayoutRecord.query.one()
            payout.eligible_on = datetime.utcnow() - timedelta(minutes=1)
            db.session.commit()
            os.environ["PAYMENT_PAYOUT_WORKER_ENABLED"] = "true"

            with patch.object(PaymentService, "connected_status", return_value={"ready": True}), patch(
                "app.services.payment.stripe.Transfer.create",
                return_value=SimpleNamespace(id="tr_sync_failure"),
            ), patch(
                "app.services.payment.stripe.Payout.create",
                side_effect=stripe.InvalidRequestError("Payout setup rejected", "destination"),
            ):
                failed = PaymentService.run_payouts()
                repeated = PaymentService.run_payouts()

            self.assertEqual(failed["failed"], 1)
            self.assertEqual(repeated["failed"], 1)
            payout = PayoutRecord.query.one()
            self.assertEqual(payout.status, "failed")
            self.assertEqual(payout.stripe_transfer_id, "tr_sync_failure")
            self.assertIsNone(payout.stripe_payout_id)
            self.assertEqual(payout.attempt_count, 3)
            payout_failures = FinancialLedgerEntry.query.filter_by(entry_type="payout_failed").all()
            self.assertEqual(len(payout_failures), 2)
            self.assertEqual(
                {entry.idempotency_key.rsplit("-", 1)[-1] for entry in payout_failures},
                {"1", "2"},
            )
            wallet_rows = [
                row
                for row in PaymentService.wallet(self.organizer_id)["transaction_history"]
                if row["type"] == "payout_failed"
            ]
            self.assertEqual(len(wallet_rows), 2)
            self.assertTrue(all(row["status"] == "failed" for row in wallet_rows))
            self.assertTrue(all(row["amount_pence"] == 0 for row in wallet_rows))

    def test_failed_payout_webhook_retries_with_a_new_stripe_attempt(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            PaymentService.confirm_order(order, self._intent(order))
            payout = PayoutRecord.query.one()
            payout.eligible_on = datetime.utcnow() - timedelta(minutes=1)
            db.session.commit()
            os.environ["PAYMENT_PAYOUT_WORKER_ENABLED"] = "true"

            with patch.object(PaymentService, "connected_status", return_value={"ready": True}), patch(
                "app.services.payment.stripe.Transfer.create",
                return_value=SimpleNamespace(id="tr_retryable_payout"),
            ), patch(
                "app.services.payment.stripe.Payout.create",
                return_value=SimpleNamespace(id="po_attempt_one"),
            ) as first_payout:
                first = PaymentService.run_payouts()
            self.assertEqual(first["processed"], 1)
            self.assertEqual(first_payout.call_args.kwargs["idempotency_key"], f"connected-payout-{order.order_key}-attempt-1")

            os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_payment_unit_test"
            failed_event = SimpleNamespace(
                id="evt_payout_attempt_one_failed",
                type="payout.failed",
                livemode=False,
                data=SimpleNamespace(object=SimpleNamespace(id="po_attempt_one")),
            )
            with patch("app.services.payment.stripe.Webhook.construct_event", return_value=failed_event):
                PaymentService.handle_webhook(b"payout-failed", "signature")

            payout = PayoutRecord.query.one()
            self.assertEqual(payout.status, "failed")
            self.assertIsNone(payout.stripe_payout_id)
            self.assertEqual(payout.attempt_count, 2)
            failed_ledger = FinancialLedgerEntry.query.filter_by(entry_type="payout_failed").one()
            self.assertEqual(failed_ledger.stripe_object_id, "po_attempt_one")

            with patch.object(PaymentService, "connected_status", return_value={"ready": True}), patch(
                "app.services.payment.stripe.Transfer.create",
            ) as duplicate_transfer, patch(
                "app.services.payment.stripe.Payout.create",
                return_value=SimpleNamespace(id="po_attempt_two"),
            ) as second_payout:
                retried = PaymentService.run_payouts()
            self.assertEqual(retried["processed"], 1)
            duplicate_transfer.assert_not_called()
            self.assertEqual(second_payout.call_args.kwargs["idempotency_key"], f"connected-payout-{order.order_key}-attempt-2")
            payout = PayoutRecord.query.one()
            self.assertEqual(payout.stripe_transfer_id, "tr_retryable_payout")
            self.assertEqual(payout.stripe_payout_id, "po_attempt_two")
            self.assertEqual(payout.status, "processing")
            processing_entries = FinancialLedgerEntry.query.filter_by(entry_type="payout_processing").all()
            self.assertEqual(
                {entry.stripe_object_id for entry in processing_entries},
                {"po_attempt_one", "po_attempt_two"},
            )

    def test_paid_payout_is_terminal_and_does_not_overwrite_refund_state(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            PaymentService.confirm_order(order, self._intent(order))
            payout = PayoutRecord.query.one()
            payout.status = "processing"
            payout.stripe_payout_id = "po_terminal_paid"
            order.status = "partially_refunded"
            db.session.commit()
            os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_payment_unit_test"

            paid_event = SimpleNamespace(
                id="evt_payout_terminal_paid",
                type="payout.paid",
                livemode=False,
                data=SimpleNamespace(object=SimpleNamespace(id="po_terminal_paid")),
            )
            with patch("app.services.payment.stripe.Webhook.construct_event", return_value=paid_event):
                PaymentService.handle_webhook(b"payout-paid", "signature")

            payout = PayoutRecord.query.one()
            self.assertEqual(payout.status, "paid_out")
            self.assertIsNotNone(payout.paid_on)
            self.assertEqual(order.status, "partially_refunded")
            self.assertEqual(FinancialLedgerEntry.query.filter_by(entry_type="payout_paid").count(), 1)

            stale_failed_event = SimpleNamespace(
                id="evt_payout_stale_failed",
                type="payout.failed",
                livemode=False,
                data=SimpleNamespace(object=SimpleNamespace(id="po_terminal_paid")),
            )
            with patch("app.services.payment.stripe.Webhook.construct_event", return_value=stale_failed_event):
                PaymentService.handle_webhook(b"payout-stale-failed", "signature")

            payout = PayoutRecord.query.one()
            self.assertEqual(payout.status, "paid_out")
            self.assertEqual(payout.stripe_payout_id, "po_terminal_paid")
            self.assertEqual(order.status, "partially_refunded")
            self.assertEqual(FinancialLedgerEntry.query.filter_by(entry_type="payout_failed").count(), 0)

    def test_ambiguous_payout_create_reuses_the_same_stripe_idempotency_key(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            PaymentService.confirm_order(order, self._intent(order))
            payout = PayoutRecord.query.one()
            payout.eligible_on = datetime.utcnow() - timedelta(minutes=1)
            db.session.commit()
            os.environ["PAYMENT_PAYOUT_WORKER_ENABLED"] = "true"

            with patch.object(PaymentService, "connected_status", return_value={"ready": True}), patch(
                "app.services.payment.stripe.Transfer.create",
                return_value=SimpleNamespace(id="tr_ambiguous_payout"),
            ) as transfer, patch(
                "app.services.payment.stripe.Payout.create",
                side_effect=[RuntimeError("response lost"), SimpleNamespace(id="po_ambiguous_recovered")],
            ) as stripe_payout:
                failed = PaymentService.run_payouts()
                recovered = PaymentService.run_payouts()

            self.assertEqual(failed["failed"], 1)
            self.assertEqual(recovered["processed"], 1)
            transfer.assert_called_once()
            self.assertEqual(stripe_payout.call_count, 2)
            payout_keys = [call.kwargs["idempotency_key"] for call in stripe_payout.call_args_list]
            self.assertEqual(
                payout_keys,
                [
                    f"connected-payout-{order.order_key}-attempt-1",
                    f"connected-payout-{order.order_key}-attempt-1",
                ],
            )
            payout = PayoutRecord.query.one()
            self.assertEqual(payout.attempt_count, 1)
            self.assertEqual(payout.stripe_transfer_id, "tr_ambiguous_payout")
            self.assertEqual(payout.stripe_payout_id, "po_ambiguous_recovered")
            self.assertEqual(payout.status, "processing")

    def test_admin_adjustment_is_append_only_and_idempotent(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            admin = Users(
                id=81004,
                role_type=1,
                first_name="Payment",
                last_name="Admin",
                country_code="+44",
                mobile_number="770081004",
                email_id="payment-admin-adjustment@local.test",
                status=1,
            )
            db.session.add(admin)
            db.session.commit()
            for invalid_amount in (0, 1.5, True, "1.5", "--1"):
                with self.assertRaises(ServiceError):
                    PaymentService.add_admin_adjustment(
                        order.order_key,
                        admin.id,
                        invalid_amount,
                        "Invalid correction",
                    )
            first = PaymentService.add_admin_adjustment(order.order_key, admin.id, -100, "Manual test correction", "same-adjustment")
            second = PaymentService.add_admin_adjustment(order.order_key, admin.id, -100, "Manual test correction", "same-adjustment")
            self.assertEqual(first["ledger_entry_id"], second["ledger_entry_id"])
            self.assertEqual(PayoutRecord.query.one().amount_pence, 1730)
            entry = db.session.get(FinancialLedgerEntry, first["ledger_entry_id"])
            entry.amount_pence = -1
            with self.assertRaises(ValueError):
                db.session.commit()
            db.session.rollback()
            entry = db.session.get(FinancialLedgerEntry, first["ledger_entry_id"])
            db.session.delete(entry)
            with self.assertRaises(ValueError):
                db.session.commit()
            db.session.rollback()

    def test_dispute_adjustment_is_idempotent_and_reconciles_when_won(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            dispute = SimpleNamespace(id="dp_test", charge=order.stripe_charge_id, amount=500, status="needs_response")
            PaymentService._handle_dispute_event("charge.dispute.created", dispute)
            PaymentService._handle_dispute_event("charge.dispute.created", dispute)
            db.session.commit()
            self.assertEqual(PayoutRecord.query.one().amount_pence, 1330)
            dispute.status = "won"
            PaymentService._handle_dispute_event("charge.dispute.closed", dispute)
            db.session.commit()
            self.assertEqual(PayoutRecord.query.one().amount_pence, 1830)
            entries = FinancialLedgerEntry.query.filter(
                FinancialLedgerEntry.entry_type.in_(("negative_adjustment", "correction"))
            ).all()
            self.assertEqual(sorted(entry.amount_pence for entry in entries), [-500, 500])

    def test_insufficient_stripe_balance_waits_without_false_failed_status(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            payout = PayoutRecord.query.one()
            payout.eligible_on = datetime.utcnow() - timedelta(minutes=1)
            db.session.commit()
            os.environ["PAYMENT_PAYOUT_WORKER_ENABLED"] = "true"
            insufficient = RuntimeError("Insufficient Stripe balance")
            insufficient.code = "balance_insufficient"
            with patch.object(PaymentService, "connected_status", return_value={"ready": True}), patch(
                "app.services.payment.stripe.Transfer.create",
                side_effect=[insufficient, SimpleNamespace(id="tr_after_balance_available")],
            ) as transfer, patch(
                "app.services.payment.stripe.Payout.create",
                return_value=SimpleNamespace(id="po_after_balance_available"),
            ):
                result = PaymentService.run_payouts()
                recovered = PaymentService.run_payouts()
            self.assertEqual(result["waiting"], 1)
            self.assertEqual(recovered["processed"], 1)
            self.assertEqual(
                [call.kwargs["idempotency_key"] for call in transfer.call_args_list],
                [
                    f"payout-transfer-{order.order_key}-attempt-1",
                    f"payout-transfer-{order.order_key}-attempt-2",
                ],
            )
            payout = PayoutRecord.query.one()
            self.assertEqual(payout.status, "processing")
            self.assertEqual(payout.stripe_transfer_id, "tr_after_balance_available")

    def test_connect_refresh_failure_is_fail_closed(self):
        with self.app.app_context(), patch(
            "app.services.payment.stripe.Account.retrieve",
            side_effect=RuntimeError("temporary Stripe outage"),
        ):
            status = PaymentService.connected_status(self.organizer_id, refresh=True)
            self.assertTrue(status["connected"])
            self.assertFalse(status["ready"])
            self.assertTrue(status["temporarily_unavailable"])
            with self.assertRaises(ServiceError):
                PaymentService.require_paid_listing_ready(self.organizer_id)

    def test_connect_refresh_accepts_typed_stripe_requirements(self):
        with self.app.app_context(), patch(
            "app.services.payment.stripe.Account.retrieve",
            return_value=SimpleNamespace(
                details_submitted=True,
                charges_enabled=True,
                payouts_enabled=True,
                requirements=SimpleNamespace(currently_due=[], disabled_reason=None),
            ),
        ):
            status = PaymentService.connected_status(self.organizer_id, refresh=True)
            self.assertTrue(status["ready"])
            self.assertFalse(status["temporarily_unavailable"])
            self.assertEqual(status["requirements_due"], [])

    def test_connect_status_post_avoids_stale_mobile_cache(self):
        with self.app.app_context():
            token = user.generate_token(Users.query.get(self.organizer_id), 3)
        response = self.client.post(
            "/payment/connect/status",
            json={},
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["response"]["ready"])

    def test_wallet_exposes_exactly_six_reconcilable_categories(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            with patch("app.services.payment.stripe.PaymentIntent.retrieve", return_value=self._intent(order)):
                PaymentService.get_order(order.order_key, actor_user_id=self.buyer_id)
            requested = PaymentService.request_refund(
                order.order_key,
                self.buyer_id,
                amount_pence=600,
                reason="Partial post-payout refund proof",
            )
            wallet = PaymentService.wallet(self.organizer_id)
            self.assertEqual(set(wallet["balances_pence"]), {
                "total_sales",
                "pending",
                "available_for_payout",
                "payout_processing",
                "paid_out",
                "adjustment_negative",
            })
            history = wallet["transaction_history"]
            self.assertTrue(history)
            self.assertTrue({
                "date", "listing", "type", "amount_pence", "customer_paid_pence",
                "ondeen_fee_pence", "stripe_cost_pence", "organizer_net_pence", "status",
            }.issubset(history[0]))
            self.assertEqual(wallet["refund_requests"][0]["id"], requested["id"])
            self.assertEqual(wallet["refund_requests"][0]["requested_amount_pence"], 600)
            self.assertEqual(wallet["refund_requests"][0]["status"], "requested")

    def test_webhook_receipt_is_durable_retryable_and_counts_duplicate_delivery(self):
        with self.app.app_context():
            os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_payment_unit_test"
            event = SimpleNamespace(
                id="evt_payment_retry",
                type="payment_intent.succeeded",
                livemode=False,
                data=SimpleNamespace(object=SimpleNamespace(id="pi_missing")),
            )
            with patch("app.services.payment.stripe.Webhook.construct_event", return_value=event), patch.object(
                PaymentService, "confirm_order", side_effect=RuntimeError("retry me")
            ):
                # No order means no business callback; create a minimal order link.
                payload = self._create_order(quantity=1)
                order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
                event.data.object.id = order.stripe_payment_intent_id
                with self.assertRaises(RuntimeError):
                    PaymentService.handle_webhook(b"signed-payload", "signature")
            receipt = StripeEventReceipt.query.one()
            self.assertEqual(receipt.status, "failed")
            self.assertEqual(receipt.attempt_count, 1)

            with patch("app.services.payment.stripe.Webhook.construct_event", return_value=event), patch.object(
                PaymentService, "confirm_order", return_value={"confirmed": True}
            ):
                retry = PaymentService.handle_webhook(b"signed-payload", "signature")
                duplicate = PaymentService.handle_webhook(b"signed-payload", "signature")
            self.assertFalse(retry["duplicate"])
            self.assertTrue(duplicate["duplicate"])
            receipt = StripeEventReceipt.query.one()
            self.assertEqual(receipt.status, "processed")
            self.assertEqual(receipt.attempt_count, 3)

    def test_out_of_order_failed_webhook_cannot_downgrade_confirmed_order(self):
        with self.app.app_context():
            payload = self._create_order(quantity=1)
            order = PaymentOrder.query.filter_by(order_key=payload["payment_order_key"]).one()
            PaymentService.confirm_order(order, self._intent(order))
            confirmed_status = db.session.get(PaymentOrder, order.id).status
            participant_id = db.session.get(PaymentOrder, order.id).participant_ids

            os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_payment_unit_test"
            stale_failure = SimpleNamespace(
                id="evt_stale_failure_after_success",
                type="payment_intent.payment_failed",
                livemode=False,
                data=SimpleNamespace(object=SimpleNamespace(
                    id=order.stripe_payment_intent_id,
                    last_payment_error=SimpleNamespace(code="card_declined"),
                )),
            )
            with patch(
                "app.services.payment.stripe.Webhook.construct_event",
                return_value=stale_failure,
            ):
                result = PaymentService.handle_webhook(b"stale-failure", "signature")

            current = db.session.get(PaymentOrder, order.id)
            self.assertFalse(result["duplicate"])
            self.assertEqual(current.status, confirmed_status)
            self.assertEqual(current.participant_ids, participant_id)
            self.assertEqual(Participant.query.count(), 1)
            self.assertEqual(FinancialLedgerEntry.query.count(), 3)

    def test_legacy_client_authoritative_endpoints_are_retired(self):
        self.assertEqual(self.client.post("/create_payment", json={"amount": 1, "currency": "usd"}).status_code, 410)
        self.assertEqual(self.client.post("/update_payment_status", json={"status": 1}).status_code, 410)


if __name__ == "__main__":
    unittest.main()
