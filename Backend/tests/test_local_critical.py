import base64
import os
import tempfile
import unittest
from unittest.mock import patch
from datetime import date, datetime, time, timedelta
from io import BytesIO
from pathlib import Path
from types import SimpleNamespace
from zoneinfo import ZoneInfo

from PIL import Image


os.environ["ONDEEN_LOCAL"] = "1"
os.environ["ENABLE_SCHEDULER"] = "false"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["RATELIMIT_STORAGE_URI"] = "memory://"
os.environ["ONDEEN_TEST_OTP_ENABLED"] = "true"
os.environ["ONDEEN_TEST_OTP_CODE"] = "123456"
os.environ.setdefault("SECRET_KEY", "local-test-secret")
os.environ.setdefault("JWT_SECRET_KEY", "local-test-jwt-secret")

from app import on_deen  # noqa: E402
from app import db  # noqa: E402
from app.services.customer.event import EventService  # noqa: E402
from app.services.customer.customer import CustomerService  # noqa: E402
from app.utils.custom_exception import ServiceError  # noqa: E402
from app.utils.file_upload import (  # noqa: E402
    EVENT_MATERIAL_MAX_FILE_SIZE,
    store_file,
)
from app.models.online_checkin import OnlineCheckInAttempt  # noqa: E402
from app.models.category import Category, SubCategory  # noqa: E402
from app.models.event import (  # noqa: E402
    Event,
    EventCurriculum,
    EventDate,
    EventDateTime,
    EventDocuments,
    EventDocumentsFiles,
    EventImages,
    EventAnnouncements,
    EventGuestBookingSetting,
    EventReminderDelivery,
    EventTitleAuditLog,
    JourneyLevel,
    Language,
    Participant,
    ParticipantQrcode,
    PaymentTransaction,
    ParticipantsAttendance,
    Answer_and_question,
    EventSpeakers,
    EventTicket,
    Request_buddy,
)
from app.models.gamification import (  # noqa: E402
    GamificationStreak,
    GamificationStreakMiss,
    GamificationXpLog,
    UserGamification,
)
from app.models.guest_booking import GuestBooking  # noqa: E402
from app.models.users import Notification_History, NotificationPreference, User_session, Users  # noqa: E402
from app.models.organization import Organization  # noqa: E402
from app.models.organizer_application import OrganizerApplication  # noqa: E402
from app.models.speakers import (  # noqa: E402
    Expertise,
    Speaker,
    SpeakerAvailabilityDate,
    SpeakerAvailabilityTime,
    SpeakerExpertise,
)
from app.repositories.event import EventRepo  # noqa: E402
from app.repositories.user import user  # noqa: E402
from app.services.customer.gamification import GamificationService  # noqa: E402
from app.services.customer.gamification import CANONICAL_ACTIVITY_TOPICS  # noqa: E402
from app.services.online_checkin import OnlineCheckInService  # noqa: E402
from app.services.customer.organizer import OrganizerService  # noqa: E402
from app.services.customer.speaker import SpeakerService  # noqa: E402
from app.services.organizer.organizer import OrganizerService as OrganizerProfileService  # noqa: E402
from app.services.admin.organizer import OrganizerService as AdminOrganizerService  # noqa: E402
from app.services.speaker.speaker import SpeakerService as SpeakerManagementService  # noqa: E402
from app.services.organizer.event import EventService as OrganizerEventService  # noqa: E402
from app.services.organizer.speaker import SpeakerService as OrganizerSpeakerService  # noqa: E402
from app.services.speaker.event import EventService as SpeakerEventService  # noqa: E402
from app.services.buddy.event import EventService as BuddyEventService  # noqa: E402
from app.services.one_to_one import OneToOneService  # noqa: E402
from scripts.init_db import sync_reference_materials  # noqa: E402
from app.utils.scheduler import (  # noqa: E402
    send_notifications_event_daily,
    send_notifications_event_daily_30min,
    send_missing_meetlink_121_notifications_for_30min,
    send_missing_meetlink_121_notifications_for_day,
)


class LocalCriticalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.upload_root = tempfile.TemporaryDirectory()
        os.environ["UPLOAD_ROOT"] = cls.upload_root.name
        os.environ["UPLOAD_PUBLIC_BASE_URL"] = "http://local.test"
        cls.app = on_deen()
        cls.client = cls.app.test_client()
        with cls.app.app_context():
            db.create_all()

    @classmethod
    def tearDownClass(cls):
        cls.upload_root.cleanup()

    def test_generate_token_route_returns_access_token(self):
        response = self.client.get("/generate_token")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIn("access_token", payload)
        self.assertGreater(len(payload["access_token"]), 20)

    def test_organizer_notification_preferences_round_trip_filters_only_push(self):
        """Typed preferences persist and suppress push tokens without hiding inbox history."""
        organizer_id = 994501
        with self.app.app_context():
            organizer = Users(
                id=organizer_id,
                role_type=3,
                first_name="Preference",
                last_name="Organizer",
                country_code="+44",
                mobile_number="994501",
                email_id="preference-organizer@local.test",
                status=1,
            )
            session = User_session(
                user_id=organizer_id,
                type=2,
                token="preference-session",
                push_token="ExponentPushToken[preference]",
            )
            db.session.add_all([organizer, session])
            db.session.commit()

            initial = OrganizerProfileService.get_notification_preferences(organizer_id)
            self.assertTrue(all(item["push_enabled"] for item in initial["preferences"]))

            updated = OrganizerProfileService.update_notification_preferences(
                {"preferences": [{"notification_type": 5, "push_enabled": False}]},
                organizer_id,
            )
            values = {
                item["notification_type"]: item["push_enabled"]
                for item in updated["preferences"]
            }
            self.assertFalse(values[5])
            self.assertTrue(values[4])
            self.assertFalse(user.push_notifications_enabled(organizer_id, 5))
            self.assertIsNone(user.get_push_token(organizer_id, 5))
            self.assertEqual(user.get_push_token(organizer_id, 4), [session.push_token])

            # The preference is only a push gate; it does not delete inbox rows.
            history = Notification_History(
                user_id=organizer_id,
                event_id=994501,
                push=True,
                type=5,
                send_to=5,
                task_id="preference-history",
                title="Booking",
                message="A new booking was received.",
            )
            db.session.add(history)
            db.session.commit()
            self.assertIsNotNone(
                Notification_History.query.filter_by(
                    user_id=organizer_id,
                    task_id="preference-history",
                ).first()
            )

            db.session.delete(history)
            db.session.delete(NotificationPreference.query.filter_by(user_id=organizer_id).first())
            db.session.delete(session)
            db.session.delete(organizer)
            db.session.commit()

    def test_organiser_event_filters_separate_ongoing_and_completed_history(self):
        """Dashboard sections must preserve active and ended reference listings."""
        today = date.today()
        with self.app.app_context():
            organiser = Users(
                id=994111,
                role_type=3,
                first_name="Filter",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99411",
                email_id="filter-organiser@local.test",
            )
            category = Category(id=994111, title="Filter category", home_view=True)
            active = Event(
                id=994111,
                user_id=organiser.id,
                title="Active reference listing",
                category_id=category.id,
                start_date=datetime.combine(today - timedelta(days=1), time.min),
                end_date=datetime.combine(today + timedelta(days=1), time.min),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
            )
            ended = Event(
                id=994112,
                user_id=organiser.id,
                title="Completed reference listing",
                category_id=category.id,
                start_date=datetime.combine(today - timedelta(days=5), time.min),
                end_date=datetime.combine(today - timedelta(days=2), time.min),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
            )
            cancelled = Event(
                id=994113,
                user_id=organiser.id,
                title="Cancelled reference listing",
                category_id=category.id,
                start_date=datetime.combine(today - timedelta(days=2), time.min),
                end_date=datetime.combine(today - timedelta(days=2), time.min),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=4,
            )
            db.session.add_all([organiser, category, active, ended, cancelled])
            db.session.commit()

            with self.app.test_request_context(
                headers={"Timezone": "Europe/London"}
            ):
                ongoing = EventRepo._get_filtered_events_sqlite(
                    {"page": 1, "per_page": 20, "status": 1, "ongoing_days": 1},
                    organiser.id,
                )
                completed = EventRepo._get_filtered_events_sqlite(
                    {"page": 1, "per_page": 20, "completed_days": 1},
                    organiser.id,
                )

            self.assertEqual([row["title"] for row in ongoing["events"]], [active.title])
            self.assertEqual(
                {row["title"] for row in completed["events"]},
                {ended.title, cancelled.title},
            )

    def test_public_organiser_contact_does_not_replace_demo_login(self):
        organisation = SimpleNamespace(
            user_id=93010,
            user=SimpleNamespace(
                email_id="org@gmail.com",
                mobile_number="700000000",
                country_code="+44",
                profile_image="logo.png",
            ),
            public_email_id="therijalclub@gmail.com",
            public_mobile_number="7392007576",
            public_country_code="+44",
            organization_name="The Rijal Club",
            manager_name="The Rijal Club Organiser",
            location="565A High Rd, London N17 6SN, UK",
            about_us="Brotherhood · Knowledge · Rujulah",
            latitude=51.5882,
            longitude=-0.0730,
            foundation_date=date(2024, 1, 1),
        )
        with patch(
            "app.services.customer.organizer.OrganizerRepository.get_organization_by_id",
            return_value=organisation,
        ), patch(
            "app.services.customer.organizer.EventRepo.appEvent",
            return_value={"events": []},
        ), patch(
            "app.services.customer.organizer.user.get_rating_count",
            return_value=0,
        ), patch(
            "app.services.customer.organizer.user.get_avg_rating",
            return_value=0,
        ):
            public_profile = OrganizerService.organizer_id.__wrapped__(None, 1)

        self.assertEqual(public_profile["email_id"], "therijalclub@gmail.com")
        self.assertEqual(public_profile["mobile_number"], "7392007576")
        self.assertEqual(public_profile["country_code"], "+44")
        self.assertEqual(organisation.user.email_id, "org@gmail.com")

    def test_customer_speaker_profile_excludes_private_contact_and_approval_evidence(self):
        """Public User speaker payloads must never expose internal speaker data."""
        with self.app.app_context():
            speaker_user = Users(
                id=994121,
                role_type=4,
                first_name="Public",
                last_name="Speaker",
                country_code="+44",
                mobile_number="70000994121",
                email_id="private-speaker@local.test",
                profile_image="speaker.png",
                time_zone="Europe/London",
            )
            speaker = Speaker(
                user_id=speaker_user.id,
                formal_id_name="Internal identity document",
                formal_id_document="private-document.pdf",
                country_of_residence="United Kingdom",
                qualification="Internal qualification evidence",
                about_us="Public biography",
                status=1,
            )
            db.session.add_all([speaker_user, speaker])
            db.session.commit()

            with patch(
                "app.services.customer.speaker.SpeakerRepository.get_speaker_slot_count",
                return_value=0,
            ), patch(
                "app.services.customer.speaker.SpeakerRepository.get_next_available_date",
                return_value=None,
            ), patch(
                "app.services.customer.speaker.EventRepo.appEvent",
                return_value={"events": [], "total": 0},
            ):
                payload = SpeakerService.speaker_id.__wrapped__(None, speaker_user.id)

            self.assertEqual(payload["user_first_name"], "Public")
            self.assertEqual(payload["about_us"], "Public biography")
            for private_field in (
                "user_mobile_number",
                "user_email_id",
                "user_country_code",
                "formal_id_name",
                "formal_id_document",
                "qualification",
                "country_of_residence",
            ):
                self.assertNotIn(private_field, payload)

    def test_organizer_speaker_management_is_owned_and_status_is_persistent(self):
        """Speaker CRUD exposes only managed accounts and preserves history."""
        organizer_id = 994180
        other_organizer_id = 994181
        child_id = 994182
        foreign_id = 994183
        with self.app.app_context():
            organizer = Users(
                id=organizer_id,
                role_type=3,
                first_name="Managed",
                last_name="Organizer",
                country_code="+44",
                mobile_number="994180",
                email_id="managed-organizer@local.test",
                status=1,
            )
            other_organizer = Users(
                id=other_organizer_id,
                role_type=3,
                first_name="Other",
                last_name="Organizer",
                country_code="+44",
                mobile_number="994181",
                email_id="other-organizer@local.test",
                status=1,
            )
            foreign_speaker = Users(
                id=foreign_id,
                parent_id=other_organizer_id,
                role_type=4,
                first_name="Foreign",
                last_name="Speaker",
                country_code="+44",
                mobile_number="994183",
                email_id="foreign-speaker@local.test",
                status=1,
            )
            expertise = Expertise(
                id=994184,
                title="Managed expertise",
                ar_title="Managed expertise",
                status=1,
            )
            db.session.add_all([organizer, other_organizer, foreign_speaker, expertise])
            db.session.commit()
            db.session.add(Speaker(user_id=foreign_id, about_us="Foreign biography"))
            db.session.commit()

            created = OrganizerSpeakerService.register.__wrapped__({
                "first_name": "Child",
                "last_name": "Speaker",
                "email_id": "child-speaker@local.test",
                "mobile_number": "994182",
                "country_code": "+44",
                "password": "not-used-in-test",
                "about_us": "Public biography",
                "qualification": "Private qualification",
                "status": 1,
                "expertise": [expertise.id],
            }, organizer_id)
            self.assertIn("Created", created["message"])
            child = Users.query.filter_by(email_id="child-speaker@local.test").one()
            child_id = child.id
            child_speaker = Speaker.query.filter_by(user_id=child.id).one()
            self.assertEqual(child.parent_id, organizer_id)
            self.assertEqual(child.status, 1)
            self.assertEqual(child_speaker.qualification, "Private qualification")
            self.assertEqual(SpeakerExpertise.query.filter_by(user_id=child.id).count(), 1)

            managed = OrganizerSpeakerService.get_all_speakers.__wrapped__({
                "session_id": organizer_id,
            })
            self.assertEqual([item["id"] for item in managed], [child.id])
            self.assertEqual(managed[0]["status"], 1)

            detail = OrganizerSpeakerService.get_details_by_id.__wrapped__({"id": child.id}, organizer_id)
            self.assertEqual(detail["qualification"], "Private qualification")
            with self.assertRaisesRegex(ServiceError, "Not your Speaker"):
                OrganizerSpeakerService.get_details_by_id.__wrapped__({"id": child.id}, other_organizer_id)
            with self.assertRaisesRegex(ServiceError, "Not your Speaker"):
                OrganizerSpeakerService.deleteSpeaker.__wrapped__({"id": foreign_id}, organizer_id)

            OrganizerSpeakerService.register.__wrapped__({
                "id": child.id,
                "first_name": "Child",
                "last_name": "Speaker Updated",
                "email_id": "child-speaker@local.test",
                "mobile_number": "994182",
                "country_code": "+44",
                "status": 2,
                "about_us": "Updated biography",
                "qualification": "Updated private qualification",
                "expertise": [],
            }, organizer_id)
            self.assertEqual(Users.query.get(child.id).status, 2)
            self.assertEqual(Speaker.query.filter_by(user_id=child.id).one().about_us, "Updated biography")
            self.assertEqual(SpeakerExpertise.query.filter_by(user_id=child.id).count(), 0)
            managed_after_update = OrganizerSpeakerService.get_all_speakers.__wrapped__({
                "session_id": organizer_id,
            })
            self.assertEqual(managed_after_update[0]["status"], 2)

            # Deletion remains a soft status transition; the speaker row is
            # retained so historical EventSpeakers relations stay intact.
            OrganizerSpeakerService.deleteSpeaker.__wrapped__({"id": child.id}, organizer_id)
            self.assertEqual(Users.query.get(child.id).status, 3)
            self.assertIsNotNone(Speaker.query.filter_by(user_id=child.id).one())

            db.session.delete(Speaker.query.filter_by(user_id=foreign_id).one())
            db.session.delete(Speaker.query.filter_by(user_id=child_id).one())
            db.session.delete(expertise)
            db.session.delete(foreign_speaker)
            db.session.delete(child)
            db.session.delete(other_organizer)
            db.session.delete(organizer)
            db.session.commit()

    def test_reference_recurring_progress_tracks_elapsed_occurrences(self):
        start_day = date(2026, 1, 28)
        end_day = date(2026, 12, 31)

        reference_video_progress = EventService.count_occurrences(
            start_day,
            end_day,
            3,
            "2",
            current_date=datetime(2026, 7, 22, 20, 36, tzinfo=ZoneInfo("Europe/London")),
        )
        current_proof_progress = EventService.count_occurrences(
            start_day,
            end_day,
            3,
            "2",
            current_date=datetime(2026, 9, 2, 22, 40, tzinfo=ZoneInfo("Europe/London")),
        )

        self.assertEqual(reference_video_progress, (49, 26))
        self.assertEqual(current_proof_progress, (49, 32))

    def test_reference_material_sync_is_idempotent_and_exposes_file_metadata(self):
        with self.app.app_context():
            organiser = Users(
                id=99401,
                role_type=3,
                first_name="Material",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99401",
                email_id="material-organiser@local.test",
            )
            category = Category(id=99401, title="Material category", home_view=True)
            event = Event(
                id=1,
                user_id=organiser.id,
                title="The Knowledge Class",
                category_id=category.id,
                start_date=datetime(2028, 1, 1),
                end_date=datetime(2028, 1, 1),
                start_time=time(20, 30),
                end_time=time(21, 30),
                event_type=1,
                price_type=0,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            cover_url = "http://local.test/uploads/seed/refs/weekly-knowledge-class-reference-crop.png"
            db.session.add_all([
                organiser,
                category,
                event,
                EventImages(
                    event_id=event.id,
                    cropped_image=cover_url,
                    full_screen_image=cover_url,
                    status=1,
                    created_by=organiser.id,
                    updated_by=organiser.id,
                ),
            ])
            db.session.commit()

            backend_root = Path(__file__).resolve().parents[1]
            first = sync_reference_materials(backend_root)
            second = sync_reference_materials(backend_root)

            self.assertEqual(first, {"synced": True, "documents": 2, "files": 3})
            self.assertEqual(second, first)
            documents = EventDocuments.query.filter_by(event_id=event.id, status=1).all()
            self.assertEqual(len(documents), 2)
            self.assertEqual(
                EventDocumentsFiles.query.filter(
                    EventDocumentsFiles.event_document_id.in_([row.id for row in documents]),
                    EventDocumentsFiles.status == 1,
                ).count(),
                3,
            )

            info = next(row for row in documents if row.document_name == "Info")
            files = EventRepo.get_documents_file_by_id(info.id)
            self.assertEqual(
                {(row["file_name"], row["file_type"]) for row in files},
                {
                    ("knowledge-class-pre-read.pdf", "pdf"),
                    ("weekly-knowledge-class-reference-crop.png", "png"),
                },
            )
            copied_root = Path(self.upload_root.name) / "seed" / "refs"
            self.assertTrue((copied_root / "knowledge-class-pre-read.pdf").is_file())
            self.assertTrue((copied_root / "knowledge-class-audio-recap.mp3").is_file())

    def test_free_one_off_guest_booking_is_idempotent_and_creates_no_progression(self):
        with self.app.app_context():
            organiser = Users(
                id=99411,
                role_type=3,
                first_name="Guest",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99411",
                email_id="guest-organiser@local.test",
                status=1,
            )
            category = Category(id=99411, title="Guest event", home_view=True, status=1)
            event = Event(
                id=99411,
                user_id=organiser.id,
                title="Guest booking proof",
                category_id=category.id,
                start_date=datetime(2028, 5, 12),
                end_date=datetime(2028, 5, 12),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                price=0,
                location_type=1,
                location="Reference venue",
                duration=1,
                available=10,
                booked=0,
                quantity_per_user=1,
                qrcode_type=0,
                ticket_type=0,
                total_no_class=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
                created_by=organiser.id,
                updated_by=organiser.id,
            )
            db.session.add_all([
                organiser,
                category,
                event,
                EventGuestBookingSetting(
                    event_id=event.id,
                    enabled=True,
                    created_by=organiser.id,
                    updated_by=organiser.id,
                ),
            ])
            db.session.commit()

            request_data = {
                "event_id": event.id,
                "first_name": "Guest",
                "last_name": "Attendee",
                "email_id": "guest.attendee@local.test",
                "country_code": "+44",
                "mobile_number": "770099411",
                "quantity": 1,
            }
            with self.app.test_request_context(
                "/customer_app/event/guest_booking",
                method="POST",
                headers={"Timezone": "Europe/London"},
            ), patch(
                "app.repositories.event.upload_base64_file",
                return_value={"url": "http://local.test/uploads/guest-ticket.png"},
            ), patch(
                "app.repositories.event.create_pdf_file",
                return_value="http://local.test/uploads/guest-ticket.pdf",
            ):
                first = EventService.add_guest_participant.__wrapped__(request_data, "127.0.0.1")
                second = EventService.add_guest_participant.__wrapped__(request_data, "127.0.0.1")

            self.assertEqual(first["participant_id"], second["participant_id"])
            self.assertFalse(first["guest_booking"]["existing"])
            self.assertTrue(second["guest_booking"]["existing"])
            self.assertFalse(first["guest_booking"]["earns_xp"])
            self.assertEqual(first["event_price"], 0)
            self.assertTrue(first["qrcode"])
            self.assertEqual(first["qrcode_path"], "http://local.test/uploads/guest-ticket.png")
            self.assertEqual(first["ticket"], "http://local.test/uploads/guest-ticket.pdf")

            guest_booking = GuestBooking.query.filter_by(event_id=event.id).one()
            participant = db.session.get(Participant, guest_booking.participant_id)
            shadow_user = db.session.get(Users, guest_booking.shadow_user_id)
            self.assertEqual(GuestBooking.query.filter_by(event_id=event.id).count(), 1)
            self.assertEqual(Participant.query.filter_by(event_id=event.id).count(), 1)
            self.assertEqual(ParticipantsAttendance.query.filter_by(event_id=event.id).count(), 1)
            self.assertEqual(event.booked, 1)
            self.assertEqual(participant.status, 1)
            self.assertEqual(participant.paid_amount, 0)
            self.assertEqual(shadow_user.status, 0)
            self.assertIsNone(shadow_user.journey_level_id)
            self.assertEqual(PaymentTransaction.query.filter_by(event_id=event.id).count(), 0)
            self.assertEqual(ParticipantQrcode.query.filter_by(event_id=event.id).count(), 0)
            self.assertEqual(UserGamification.query.filter_by(user_id=shadow_user.id).count(), 0)
            self.assertEqual(GamificationXpLog.query.filter_by(user_id=shadow_user.id).count(), 0)

    def test_guest_booking_import_is_idempotent_without_historical_xp(self):
        with self.app.app_context():
            organiser = Users(
                id=199412,
                role_type=3,
                first_name="Import",
                last_name="Organiser",
                country_code="+44",
                mobile_number="199412",
                email_id="import-organiser@local.test",
                status=1,
            )
            category = Category(id=199412, title="Import event", home_view=True, status=1)
            event = Event(
                id=199412,
                user_id=organiser.id,
                title="Guest import proof",
                category_id=category.id,
                start_date=datetime(2028, 6, 12),
                end_date=datetime(2028, 6, 12),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                price=0,
                location_type=1,
                location="Reference venue",
                duration=1,
                available=10,
                booked=0,
                quantity_per_user=1,
                qrcode_type=0,
                ticket_type=0,
                total_no_class=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
                created_by=organiser.id,
                updated_by=organiser.id,
            )
            db.session.add_all([
                organiser,
                category,
                event,
                EventGuestBookingSetting(event_id=event.id, enabled=True, created_by=organiser.id, updated_by=organiser.id),
            ])
            db.session.commit()

            contact = {
                "event_id": event.id,
                "first_name": "Import",
                "last_name": "Attendee",
                "email_id": "import.attendee@local.test",
                "country_code": "+44",
                "mobile_number": "770099412",
                "quantity": 1,
            }
            with self.app.test_request_context(
                "/customer_app/event/guest_booking",
                method="POST",
                headers={"Timezone": "Europe/London"},
            ), patch(
                "app.repositories.event.upload_base64_file",
                return_value={"url": "http://local.test/uploads/import-ticket.png"},
            ), patch(
                "app.repositories.event.create_pdf_file",
                return_value="http://local.test/uploads/import-ticket.pdf",
            ):
                guest_response = EventService.add_guest_participant.__wrapped__(contact, "127.0.0.2")

            account = Users(
                id=299413,
                role_type=2,
                first_name="Import",
                last_name="Attendee",
                country_code=contact["country_code"],
                mobile_number=contact["mobile_number"],
                email_id=contact["email_id"],
                status=1,
            )
            db.session.add(account)
            db.session.commit()

            imported = EventService.migrate_guest_bookings.__wrapped__(account.id, contact)
            repeated = EventService.migrate_guest_bookings.__wrapped__(account.id, contact)
            guest_booking = GuestBooking.query.filter_by(event_id=event.id).one()
            participant = db.session.get(Participant, guest_response["participant_id"])

            self.assertEqual(imported["migrated_count"], 1)
            self.assertEqual(repeated["migrated_count"], 0)
            self.assertEqual(participant.user_id, account.id)
            self.assertEqual(guest_booking.migrated_user_id, account.id)
            self.assertEqual(UserGamification.query.filter_by(user_id=account.id).count(), 0)
            self.assertEqual(GamificationXpLog.query.filter_by(user_id=account.id).count(), 0)

    def test_customer_support_submission_routes_to_configured_admin_email(self):
        payload = {
            "type": 1,
            "fullname": "Reference User",
            "message": "The support flow should reach the configured admin mailbox.",
            "email": "user@gmail.com",
        }
        with patch("app.services.customer.customer.send_email") as send_email:
            result = CustomerService.send_email.__wrapped__(payload, 1)

        self.assertEqual(result["message"], "Support email sent successfully.")
        send_email.assert_called_once()
        sent = send_email.call_args.kwargs
        self.assertEqual(sent["email_to"], os.getenv("ADMIN_EMAIL"))
        self.assertIn("Reference User", sent["email_body"])
        self.assertIn("support flow", sent["email_body"])

    def test_organizer_application_review_blocks_then_unlocks_access(self):
        """A submitted organisation stays restricted until Admin approval."""
        payload = {
            "email_id": "pending-organizer@local.test",
            "mobile_number": "299531",
            "country_code": "+44",
            "password": "not-used-in-test",
            "profile_image": "https://ondeen.app/assets/images/logo.svg",
        }
        with self.app.app_context():
            previous_default_status = os.environ.get("ORGANIZER_DEFAULT_STATUS")
            os.environ["ORGANIZER_DEFAULT_STATUS"] = "0"
            try:
                created = OrganizerProfileService.register.__wrapped__(payload, None)
            finally:
                if previous_default_status is None:
                    os.environ.pop("ORGANIZER_DEFAULT_STATUS", None)
                else:
                    os.environ["ORGANIZER_DEFAULT_STATUS"] = previous_default_status
            applicant = Users.query.filter_by(email_id=payload["email_id"]).one()
            application = OrganizerApplication.query.filter_by(user_id=applicant.id).one()
            self.assertEqual(applicant.status, 0)
            self.assertIsNotNone(applicant.journey_level_id)
            self.assertEqual(application.status, "UNDER_REVIEW")
            self.assertEqual(created["application_status"], "UNDER_REVIEW")

            pending_login = OrganizerProfileService.login_password.__wrapped__(
                {
                    "email_id": payload["email_id"],
                    "password": payload["password"],
                }
            )
            self.assertEqual(pending_login["user_status"], 0)
            self.assertEqual(pending_login["application_status"], "UNDER_REVIEW")
            self.assertTrue(pending_login["access_token"])

            status_response = self.client.get(
                "/organizer_app/login/application_status",
                headers={"Authorization": f"Bearer {created['access_token']}"},
            )
            self.assertEqual(status_response.status_code, 200)
            self.assertEqual(
                status_response.get_json()["response"]["application_status"],
                "UNDER_REVIEW",
            )

            admin = Users(
                id=299532,
                role_type=1,
                country_code="+44",
                mobile_number="299532",
                email_id="application-admin@local.test",
                status=1,
            )
            db.session.add(admin)
            db.session.commit()

            with self.assertRaisesRegex(ServiceError, "Admin access is required"):
                AdminOrganizerService.review_application.__wrapped__(
                    {"application_id": application.id, "status": "APPROVED"},
                    applicant.id,
                )

            requested = AdminOrganizerService.review_application.__wrapped__(
                {
                    "application_id": application.id,
                    "status": "NEEDS_MORE_INFO",
                    "review_note": "Please clarify your organisation details.",
                },
                admin.id,
            )
            self.assertEqual(requested["application"]["status"], "NEEDS_MORE_INFO")
            self.assertEqual(Users.query.get(applicant.id).status, 0)

            approved = AdminOrganizerService.review_application.__wrapped__(
                {"application_id": application.id, "status": "APPROVED"},
                admin.id,
            )
            self.assertEqual(approved["application"]["status"], "APPROVED")
            self.assertEqual(approved["user_status"], 1)
            self.assertEqual(Users.query.get(applicant.id).status, 1)
            self.assertEqual(
                Notification_History.query.filter(
                    Notification_History.user_id == applicant.id,
                    Notification_History.task_id.like(f"organizer-application:{application.id}:%"),
                ).count(),
                2,
            )

            repeated = AdminOrganizerService.review_application.__wrapped__(
                {"application_id": application.id, "status": "APPROVED"},
                admin.id,
            )
            self.assertEqual(repeated["application"]["status"], "APPROVED")
            self.assertEqual(
                Notification_History.query.filter(
                    Notification_History.user_id == applicant.id,
                    Notification_History.task_id.like(f"organizer-application:{application.id}:%"),
                ).count(),
                2,
            )

            db.session.query(Notification_History).filter(
                Notification_History.user_id == applicant.id,
                Notification_History.task_id.like(f"organizer-application:{application.id}:%"),
            ).delete(synchronize_session=False)
            db.session.delete(application)
            db.session.query(User_session).filter(User_session.user_id == applicant.id).delete(
                synchronize_session=False,
            )
            # Bulk-delete the two synthetic users after their sessions are
            # removed; ORM relationship expiration can otherwise try to
            # update a session row that the guarded cleanup already deleted.
            db.session.query(Users).filter(Users.id.in_([applicant.id, admin.id])).delete(
                synchronize_session=False,
            )
            db.session.commit()

    def test_organizer_notifications_resolve_event_links_and_seen_state(self):
        with self.app.app_context():
            organiser = Users(
                id=299520,
                role_type=3,
                first_name="Notification",
                last_name="Organiser",
                country_code="+44",
                mobile_number="299520",
                email_id="notification-organiser@local.test",
                status=1,
            )
            notification = Notification_History(
                user_id=organiser.id,
                event_id=299521,
                type=7,
                title="Listing updated",
                message="The listing details changed.",
                send_to=3,
                task_id="local-organizer-notification",
                seen=0,
                status=1,
            )
            db.session.add_all([organiser, notification])
            db.session.commit()

            rows = OrganizerProfileService.get_notifications.__wrapped__(
                organiser.id,
                {"seen": None, "page": None},
            )
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["event_id"], 299521)
            self.assertIn("open?id=299521", rows[0]["link_url"])
            self.assertEqual(rows[0]["seen"], 0)

            OrganizerProfileService.seen_notification(
                {"id": notification.id},
                organiser.id,
            )
            self.assertEqual(
                db.session.get(Notification_History, notification.id).seen,
                1,
            )
            OrganizerProfileService.delete_nitification(
                {"id": notification.id},
                organiser.id,
            )
            self.assertEqual(
                db.session.get(Notification_History, notification.id).status,
                3,
            )

    def test_organizer_title_edit_persists_audit_and_notifies_distinct_booked_users(self):
        with self.app.app_context():
            organiser = Users(
                id=99101,
                role_type=3,
                first_name="Title",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99101",
                email_id="title-organiser@local.test",
                status=1,
            )
            attendee_one = Users(
                id=99102,
                role_type=2,
                first_name="First",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99102",
                email_id="title-first@local.test",
                status=1,
            )
            attendee_two = Users(
                id=99103,
                role_type=2,
                first_name="Second",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99103",
                email_id="title-second@local.test",
                status=1,
            )
            category = Category(id=99101, title="Title category", home_view=True, status=1)
            event = Event(
                id=99101,
                user_id=organiser.id,
                title="Original reference title",
                category_id=category.id,
                start_date=datetime(2028, 8, 1),
                end_date=datetime(2028, 8, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                location_type=1,
                location="Reference venue",
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
            )
            db.session.add_all([
                organiser,
                attendee_one,
                attendee_two,
                category,
                event,
                Participant(event_id=event.id, user_id=attendee_one.id, status=1),
                Participant(event_id=event.id, user_id=attendee_one.id, status=1),
                Participant(event_id=event.id, user_id=attendee_two.id, status=1),
                Participant(event_id=event.id, user_id=organiser.id, status=2),
            ])
            db.session.commit()

            with self.app.test_request_context(
                "/organizer_app/event/update_title",
                method="POST",
                headers={"Timezone": "Europe/London"},
            ):
                first = OrganizerEventService.update_title.__wrapped__(
                    {"event_id": event.id, "title": "Updated reference title"},
                    organiser.id,
                )
                unchanged = OrganizerEventService.update_title.__wrapped__(
                    {"event_id": event.id, "title": "Updated reference title"},
                    organiser.id,
                )

            self.assertEqual(first["title"], "Updated reference title")
            self.assertEqual(first["notification_count"], 2)
            self.assertEqual(unchanged["message"], "Event title unchanged")
            self.assertEqual(Event.query.get(event.id).title, "Updated reference title")
            self.assertEqual(EventTitleAuditLog.query.filter_by(event_id=event.id).count(), 1)
            notifications = Notification_History.query.filter_by(
                event_id=event.id,
                type=7,
                status=1,
            ).all()
            self.assertEqual(
                sorted(row.user_id for row in notifications),
                [attendee_one.id, attendee_two.id],
            )
            self.assertTrue(all("Updated reference title" in row.message for row in notifications))

    def test_organizer_cancel_event_sets_cancelled_state_and_notifies_active_bookings(self):
        with self.app.app_context():
            organiser = Users(
                id=99111,
                role_type=3,
                first_name="Cancel",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99111",
                email_id="cancel-organiser@local.test",
                status=1,
            )
            attendee_one = Users(
                id=99112,
                role_type=2,
                first_name="Cancel First",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99112",
                email_id="cancel-first@local.test",
                status=1,
            )
            attendee_two = Users(
                id=99113,
                role_type=2,
                first_name="Cancel Second",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99113",
                email_id="cancel-second@local.test",
                status=1,
            )
            category = Category(id=99111, title="Cancellation category", home_view=True, status=1)
            event = Event(
                id=99111,
                user_id=organiser.id,
                title="Cancellable reference event",
                category_id=category.id,
                start_date=datetime(2028, 9, 1),
                end_date=datetime(2028, 9, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                location_type=1,
                location="Reference venue",
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                booked=2,
                status=1,
            )
            participants = [
                Participant(
                    event_id=event.id,
                    user_id=attendee_one.id,
                    status=1,
                    quantity=1,
                    paid_amount=12,
                ),
                Participant(
                    event_id=event.id,
                    user_id=attendee_two.id,
                    status=1,
                    quantity=1,
                    paid_amount=12,
                ),
            ]
            db.session.add_all([organiser, attendee_one, attendee_two, category, event, *participants])
            db.session.flush()
            transaction = PaymentTransaction(
                participant_id=participants[0].id,
                event_id=event.id,
                user_id=attendee_one.id,
                amount=24,
                currency="GBP",
                payment_method="stripe",
                request_json="{}",
                response_json="{}",
                status=1,
                all_participant_id=f"{participants[0].id},{participants[1].id}",
            )
            db.session.add(transaction)
            db.session.commit()

            result = OrganizerEventService.cancle_event(event.id, organiser.id)

            self.assertIsNone(result)
            self.assertEqual(Event.query.get(event.id).status, 4)
            self.assertEqual(Event.query.get(event.id).booked, 0)
            self.assertEqual(
                Participant.query.filter_by(event_id=event.id).with_entities(Participant.status).all(),
                [(4,), (4,)],
            )
            self.assertEqual(db.session.get(PaymentTransaction, transaction.id).status, 3)
            notifications = Notification_History.query.filter_by(event_id=event.id, type=6).all()
            self.assertEqual(
                sorted(row.user_id for row in notifications),
                sorted([attendee_one.id, attendee_two.id, organiser.id]),
            )

    def test_event_update_notifies_every_active_booked_user_once(self):
        with self.app.app_context():
            organiser = Users(
                id=99011,
                role_type=3,
                first_name="Link",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99011",
                email_id="link-organiser@local.test",
            )
            with_push = Users(
                id=99012,
                role_type=2,
                first_name="Push",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99012",
                email_id="link-push@local.test",
            )
            inbox_only = Users(
                id=99013,
                role_type=2,
                first_name="Inbox",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99013",
                email_id="link-inbox@local.test",
            )
            cancelled = Users(
                id=99014,
                role_type=2,
                first_name="Cancelled",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99014",
                email_id="link-cancelled@local.test",
            )
            category = Category(id=99011, title="Later link category", home_view=True)
            event = Event(
                id=99011,
                user_id=organiser.id,
                title="Later link reference",
                category_id=category.id,
                start_date=datetime(2026, 10, 1),
                end_date=datetime(2026, 10, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                location_type=0,
                meet_link="https://meet.example/later-link",
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            db.session.add_all([organiser, with_push, inbox_only, cancelled, category, event])
            db.session.flush()
            db.session.add_all([
                Participant(event_id=event.id, user_id=with_push.id, status=1),
                Participant(event_id=event.id, user_id=with_push.id, status=1),
                Participant(event_id=event.id, user_id=inbox_only.id, status=1),
                Participant(event_id=event.id, user_id=cancelled.id, status=2),
                User_session(
                    id=99011,
                    user_id=with_push.id,
                    type=2,
                    token="session-one",
                    push_token="device-one",
                ),
                User_session(
                    id=99012,
                    user_id=with_push.id,
                    type=2,
                    token="session-two",
                    push_token="device-two",
                ),
                User_session(
                    id=99013,
                    user_id=cancelled.id,
                    type=2,
                    token="session-cancelled",
                    push_token="cancelled-device",
                ),
            ])
            db.session.commit()

            with patch("app.repositories.event.threading.Thread") as push_thread:
                EventRepo.send_push_notifications_for_event_update(event)
                db.session.flush()

            notifications = Notification_History.query.filter_by(
                event_id=event.id,
                type=7,
            ).order_by(Notification_History.user_id).all()
            self.assertEqual([row.user_id for row in notifications], [with_push.id, inbox_only.id])
            self.assertTrue(all(row.status == 1 for row in notifications))
            self.assertTrue(all(row.event_id == event.id for row in notifications))
            self.assertNotIn(0, [row.user_id for row in notifications])

            push_thread.assert_called_once()
            push_payload = push_thread.call_args.kwargs["args"][0]
            self.assertEqual(push_payload["registration_token"], ["device-two", "device-one"])
            self.assertEqual(push_payload["odid"], event.id)
            self.assertEqual(push_payload["type"], 7)
            push_thread.return_value.start.assert_called_once()

            update_notification_ids = {row.id for row in notifications}
            with patch("app.repositories.event.threading.Thread") as material_thread:
                material_count = EventRepo.send_push_notifications_for_material_upload(event)

            self.assertEqual(material_count, 2)
            material_notifications = Notification_History.query.filter(
                Notification_History.event_id == event.id,
                Notification_History.type == 7,
                Notification_History.id.notin_(update_notification_ids),
            ).order_by(Notification_History.user_id.asc()).all()
            self.assertEqual(
                [row.user_id for row in material_notifications],
                [with_push.id, inbox_only.id],
            )
            self.assertNotIn(0, [row.user_id for row in material_notifications])
            self.assertTrue(all(row.event_id == event.id for row in material_notifications))
            material_thread.assert_called_once()
            material_payload = material_thread.call_args.kwargs["args"][0]
            self.assertEqual(material_payload["registration_token"], ["device-two", "device-one"])
            self.assertEqual(material_payload["odid"], event.id)
            self.assertEqual(material_payload["type"], 7)
            self.assertNotIn("cancelled-device", material_payload["registration_token"])

    def test_booking_confirmation_and_announcement_link_to_correct_users_and_event(self):
        with self.app.app_context():
            organiser = Users(
                id=99021,
                role_type=3,
                first_name="Announcement",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99021",
                email_id="announcement-organiser@local.test",
            )
            other_organiser = Users(
                id=99022,
                role_type=3,
                first_name="Other",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99022",
                email_id="announcement-other@local.test",
            )
            with_push = Users(
                id=99023,
                role_type=2,
                first_name="Push",
                last_name="Booking",
                country_code="+44",
                mobile_number="99023",
                email_id="announcement-push@local.test",
            )
            inbox_only = Users(
                id=99024,
                role_type=2,
                first_name="Inbox",
                last_name="Booking",
                country_code="+44",
                mobile_number="99024",
                email_id="announcement-inbox@local.test",
            )
            cancelled = Users(
                id=99025,
                role_type=2,
                first_name="Cancelled",
                last_name="Booking",
                country_code="+44",
                mobile_number="99025",
                email_id="announcement-cancelled@local.test",
            )
            category = Category(id=99021, title="Announcement category", home_view=True)
            event = Event(
                id=99021,
                user_id=organiser.id,
                title="Announcement reference event",
                category_id=category.id,
                start_date=datetime(2026, 10, 2),
                end_date=datetime(2026, 10, 2),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            organisation = Organization(
                id=99021,
                user_id=organiser.id,
                organization_name="Announcement Organisation",
                sect_representation=1,
                school_thought=1,
            )
            db.session.add_all([
                organiser,
                other_organiser,
                with_push,
                inbox_only,
                cancelled,
                category,
                event,
                organisation,
            ])
            db.session.flush()
            booked_participant = Participant(
                event_id=event.id,
                user_id=with_push.id,
                status=1,
            )
            db.session.add_all([
                booked_participant,
                Participant(event_id=event.id, user_id=with_push.id, status=1),
                Participant(event_id=event.id, user_id=inbox_only.id, status=1),
                Participant(event_id=event.id, user_id=cancelled.id, status=2),
                User_session(user_id=with_push.id, type=2, token="announcement-a", push_token="announcement-device-a"),
                User_session(user_id=with_push.id, type=2, token="announcement-b", push_token="announcement-device-b"),
                User_session(user_id=cancelled.id, type=2, token="announcement-c", push_token="announcement-cancelled-device"),
            ])
            db.session.commit()

            with patch("app.repositories.event.threading.Thread") as booking_thread:
                first_confirmation = EventRepo.add_participant_notification(
                    booked_participant,
                    event,
                    with_push.id,
                )
                repeated_confirmation = EventRepo.add_participant_notification(
                    booked_participant,
                    event,
                    with_push.id,
                )

            self.assertEqual(first_confirmation.id, repeated_confirmation.id)
            confirmations = Notification_History.query.filter_by(
                event_id=event.id,
                participant_id=booked_participant.id,
                user_id=with_push.id,
                type=5,
            ).all()
            self.assertEqual(len(confirmations), 1)
            self.assertEqual(
                confirmations[0].task_id,
                f"booking-confirmation:event:{event.id}:participant:{booked_participant.id}:user:{with_push.id}",
            )
            booking_thread.assert_called_once()
            booking_payload = booking_thread.call_args.kwargs["args"][0]
            self.assertEqual(booking_payload["odid"], event.id)
            self.assertEqual(booking_payload["type"], 5)
            self.assertEqual(
                booking_payload["registration_token"],
                ["announcement-device-b", "announcement-device-a"],
            )

            with patch("app.repositories.event.threading.Thread") as announcement_thread:
                result = OrganizerEventService.add_announcement.__wrapped__(
                    organiser.id,
                    {
                        "event_id": event.id,
                        "title": "Important update",
                        "message": "Please use entrance B.",
                    },
                )

            self.assertEqual(result, {"message": "added successfully"})
            announcement = EventAnnouncements.query.filter_by(event_id=event.id).one()
            self.assertEqual(announcement.created_by, organiser.id)
            announcement_notifications = Notification_History.query.filter_by(
                event_id=event.id,
                type=7,
                title="Announcement Organisation",
            ).order_by(Notification_History.user_id.asc()).all()
            self.assertEqual(
                [row.user_id for row in announcement_notifications],
                [with_push.id, inbox_only.id],
            )
            self.assertTrue(all(row.event_id == event.id for row in announcement_notifications))
            self.assertTrue(all(str(announcement.id) in row.task_id for row in announcement_notifications))
            self.assertNotIn(0, [row.user_id for row in announcement_notifications])
            announcement_thread.assert_called_once()
            announcement_payload = announcement_thread.call_args.kwargs["args"][0]
            self.assertEqual(announcement_payload["odid"], event.id)
            self.assertEqual(announcement_payload["type"], 7)
            self.assertEqual(
                announcement_payload["registration_token"],
                ["announcement-device-b", "announcement-device-a"],
            )
            self.assertNotIn(
                "announcement-cancelled-device",
                announcement_payload["registration_token"],
            )

            with self.assertRaisesRegex(ServiceError, "Event not found"):
                OrganizerEventService.add_announcement.__wrapped__(
                    other_organiser.id,
                    {
                        "event_id": event.id,
                        "title": "Forbidden",
                        "message": "This must not be published.",
                    },
                )
            self.assertEqual(EventAnnouncements.query.filter_by(event_id=event.id).count(), 1)

    def test_reference_qa_anonymity_visibility_answers_and_ownership(self):
        with self.app.app_context():
            organiser = Users(
                id=99001,
                role_type=3,
                first_name="Reference",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99001",
                email_id="qa-organiser@local.test",
            )
            other_organiser = Users(
                id=99002,
                role_type=3,
                first_name="Other",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99002",
                email_id="qa-other-organiser@local.test",
            )
            attendee = Users(
                id=99003,
                role_type=2,
                first_name="Named",
                last_name="Attendee",
                profile_image="private-attendee.png",
                country_code="+44",
                mobile_number="99003",
                email_id="qa-attendee@local.test",
            )
            other_attendee = Users(
                id=99004,
                role_type=2,
                first_name="Second",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99004",
                email_id="qa-second-attendee@local.test",
            )
            speaker = Users(
                id=99005,
                role_type=4,
                first_name="Assigned",
                last_name="Speaker",
                country_code="+44",
                mobile_number="99005",
                email_id="qa-speaker@local.test",
            )
            category = Category(id=99001, title="Q&A reference listing", home_view=True)
            topic = SubCategory(
                id=99001,
                category_id=category.id,
                title="Q&A reference topic",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=99001, title="Q&A Beginner", status=1)
            event = Event(
                id=99001,
                user_id=organiser.id,
                title="Reference Q&A course",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 1),
                end_date=datetime(2026, 12, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=2,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=12,
                location_type=1,
                duration=1,
                occusr_type=3,
                time_zone="Europe/London",
            )
            db.session.add_all([
                organiser,
                other_organiser,
                attendee,
                other_attendee,
                speaker,
                category,
                topic,
                level,
                event,
            ])
            db.session.flush()
            db.session.add_all([
                Participant(event_id=event.id, user_id=attendee.id, status=1),
                Participant(event_id=event.id, user_id=other_attendee.id, status=1),
                EventSpeakers(
                    event_id=event.id,
                    user_id=speaker.id,
                    status=1,
                    created_by=organiser.id,
                    updated_by=organiser.id,
                ),
            ])
            db.session.commit()

            with patch(
                "app.repositories.event.user.get_push_token",
                return_value=None,
            ), patch(
                "app.repositories.event.user.create_notification_history",
            ) as create_notification:
                EventService.add_event_question.__wrapped__({
                    "event_id": event.id,
                    "question": "  Can I attend online?  ",
                    "is_anonymous": "true",
                }, attendee.id)

            anonymous_question = Answer_and_question.query.filter_by(
                event_id=event.id,
                user_id=attendee.id,
            ).one()
            self.assertTrue(anonymous_question.is_anonymous)
            self.assertEqual(anonymous_question.question, "Can I attend online?")
            organiser_notification = create_notification.call_args.kwargs
            self.assertIn("Anonymous attendee", organiser_notification["message"])
            self.assertNotIn("Named Attendee", organiser_notification["message"])

            named_question = Answer_and_question(
                status=1,
                user_id=other_attendee.id,
                organizer_id=organiser.id,
                event_id=event.id,
                question="Will materials remain available?",
                time_zone="Europe/London",
                is_anonymous=False,
                created_by=other_attendee.id,
            )
            db.session.add(named_question)
            db.session.commit()

            attendee_view = EventService.question_and_answers.__wrapped__(
                attendee.id,
                event.id,
            )
            self.assertEqual(len(attendee_view), 2)
            anonymous_payload = next(
                item for item in attendee_view if item["id"] == anonymous_question.id
            )
            named_payload = next(
                item for item in attendee_view if item["id"] == named_question.id
            )
            self.assertIsNone(anonymous_payload["user_id"])
            self.assertEqual(anonymous_payload["user_first_name"], "Anonymous")
            self.assertEqual(anonymous_payload["user_last_name"], "")
            self.assertIsNone(anonymous_payload["user_profile_image"])
            self.assertEqual(named_payload["user_id"], other_attendee.id)
            self.assertEqual(named_payload["user_first_name"], "Second")

            organiser_view = OrganizerEventService.question_and_answers.__wrapped__(
                organiser.id,
                event.id,
                "2",
            )
            speaker_view = SpeakerEventService.question_and_answers.__wrapped__(
                speaker.id,
                event.id,
                "2",
            )
            self.assertEqual(organiser_view, attendee_view)
            self.assertEqual(speaker_view, attendee_view)

            with self.assertRaisesRegex(ServiceError, "Event not found"):
                OrganizerEventService.question_and_answers.__wrapped__(
                    other_organiser.id,
                    event.id,
                    "2",
                )

            with patch(
                "app.repositories.event.user.get_push_token",
                return_value=None,
            ), patch(
                "app.repositories.event.user.create_notification_history",
            ):
                result = OrganizerEventService.update_event_answer.__wrapped__({
                    "id": anonymous_question.id,
                    "event_id": event.id,
                    "answer": "  Yes, use the online link.  ",
                }, str(organiser.id))
            self.assertEqual(result["message"], "Answer updated successfully")
            self.assertEqual(
                db.session.get(Answer_and_question, anonymous_question.id).answer,
                "Yes, use the online link.",
            )

            with self.assertRaisesRegex(ServiceError, "Event not found"):
                OrganizerEventService.update_event_answer.__wrapped__({
                    "id": named_question.id,
                    "event_id": event.id,
                    "answer": "Unauthorised answer",
                }, other_organiser.id)

            with patch(
                "app.repositories.event.user.get_push_token",
                return_value=None,
            ), patch(
                "app.repositories.event.user.create_notification_history",
            ):
                SpeakerEventService.update_event_answer.__wrapped__({
                    "id": named_question.id,
                    "event_id": event.id,
                    "answer": "The materials stay linked to this listing.",
                }, speaker.id)
            self.assertEqual(
                db.session.get(Answer_and_question, named_question.id).updated_by,
                speaker.id,
            )

    def test_reference_buddy_request_is_booked_idempotent_and_notifies_once(self):
        with self.app.app_context():
            organiser = Users(
                id=99201,
                role_type=3,
                first_name="Buddy",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99201",
                email_id="buddy-organiser@local.test",
            )
            attendee = Users(
                id=99202,
                role_type=2,
                first_name="Buddy",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99202",
                email_id="buddy-attendee@local.test",
            )
            unbooked = Users(
                id=99203,
                role_type=2,
                first_name="Unbooked",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99203",
                email_id="buddy-unbooked@local.test",
            )
            category = Category(id=99201, title="Buddy reference listing", home_view=True)
            topic = SubCategory(
                id=99201,
                category_id=category.id,
                title="Buddy reference topic",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=99201, title="Buddy Beginner", status=1)
            event = Event(
                id=99201,
                user_id=organiser.id,
                title="Reference buddy event",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 1),
                end_date=datetime(2026, 9, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            db.session.add_all([organiser, attendee, unbooked, category, topic, level, event])
            db.session.flush()
            db.session.add(Participant(event_id=event.id, user_id=attendee.id, status=1))
            db.session.commit()

            with patch.object(EventRepo, "send_buddyrequest_notifications") as notify:
                first = EventService.request_buddy.__wrapped__(
                    str(attendee.id),
                    {"event_id": event.id, "type": "1"},
                )
                duplicate = EventService.request_buddy.__wrapped__(
                    str(attendee.id),
                    {"event_id": event.id, "type": 1},
                )

            self.assertEqual(
                first["message"],
                "We have received your request and someone from out team will get in touch with you shortly.",
            )
            self.assertEqual(first["request_buddy"], 1)
            self.assertEqual(duplicate, {"message": "Already requested", "request_buddy": 1})
            self.assertEqual(
                Request_buddy.query.filter_by(
                    user_id=attendee.id,
                    event_id=event.id,
                    type=1,
                ).count(),
                1,
            )
            notify.assert_called_once()

            with self.assertRaisesRegex(ServiceError, "Not booked"):
                EventService.request_buddy.__wrapped__(
                    str(unbooked.id),
                    {"event_id": event.id, "type": 1},
                )

    def test_organizer_assigns_child_buddy_and_notifies_each_recipient_once(self):
        with self.app.app_context():
            organiser = Users(
                id=994601,
                role_type=3,
                first_name="Assignment",
                last_name="Organiser",
                country_code="+44",
                mobile_number="994601",
                email_id="assignment-organiser@local.test",
                status=1,
            )
            buddy = Users(
                id=994602,
                role_type=5,
                parent_id=organiser.id,
                first_name="Assigned",
                last_name="Buddy",
                country_code="+44",
                mobile_number="994602",
                email_id="assigned-buddy@local.test",
                status=1,
            )
            attendee = Users(
                id=994603,
                role_type=2,
                first_name="Requesting",
                last_name="Attendee",
                country_code="+44",
                mobile_number="994603",
                email_id="requesting-attendee@local.test",
                status=1,
            )
            foreign_buddy = Users(
                id=994604,
                role_type=5,
                parent_id=994605,
                first_name="Foreign",
                last_name="Buddy",
                country_code="+44",
                mobile_number="994604",
                email_id="foreign-buddy@local.test",
                status=1,
            )
            category = Category(id=994601, title="Assignment category", home_view=True, status=1)
            topic = SubCategory(
                id=994601,
                category_id=category.id,
                title="Assignment topic",
                created_by=organiser.id,
                status=1,
            )
            level = JourneyLevel(id=994601, title="Assignment level", status=1)
            event = Event(
                id=994601,
                user_id=organiser.id,
                title="Assignment reference event",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 1),
                end_date=datetime(2026, 9, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
            )
            request_buddy = Request_buddy(
                id=994601,
                event_id=event.id,
                user_id=attendee.id,
                status=1,
                type=1,
                buddy_id=0,
                created_by=attendee.id,
                updated_by=attendee.id,
            )
            db.session.add_all([
                organiser,
                buddy,
                attendee,
                foreign_buddy,
                category,
                topic,
                level,
                event,
                request_buddy,
            ])
            db.session.commit()

            first = OrganizerEventService.assign_buddy.__wrapped__(
                {"request_buddy_id": request_buddy.id, "buddy_id": buddy.id},
                organiser.id,
            )
            retry = OrganizerEventService.assign_buddy.__wrapped__(
                {"request_buddy_id": request_buddy.id, "buddy_id": buddy.id},
                organiser.id,
            )
            self.assertEqual(first["message"], "Buddy assigned successfully")
            self.assertEqual(retry["message"], "Already assigned")
            self.assertEqual(db.session.get(Request_buddy, request_buddy.id).buddy_id, buddy.id)
            buddy_rows = BuddyEventService.get_request_buddy.__wrapped__({"type": 2}, buddy.id)
            self.assertEqual(len(buddy_rows), 1)
            self.assertEqual(buddy_rows[0]["id"], request_buddy.id)
            self.assertEqual(buddy_rows[0]["whatsapp_url"], "https://wa.me/44994603")
            self.assertEqual(
                Notification_History.query.filter_by(
                    task_id=f"buddy-assignment:{request_buddy.id}:user:{attendee.id}",
                ).count(),
                1,
            )
            self.assertEqual(
                Notification_History.query.filter_by(
                    task_id=f"buddy-assignment:{request_buddy.id}:buddy:{buddy.id}",
                ).count(),
                1,
            )
            with self.assertRaisesRegex(ServiceError, "active Buddy"):
                OrganizerEventService.assign_buddy.__wrapped__(
                    {"request_buddy_id": request_buddy.id, "buddy_id": foreign_buddy.id},
                    organiser.id,
                )

            Notification_History.query.filter(
                Notification_History.user_id.in_([attendee.id, buddy.id]),
            ).delete(synchronize_session=False)
            db.session.delete(request_buddy)
            db.session.delete(event)
            db.session.delete(topic)
            db.session.delete(category)
            db.session.delete(level)
            db.session.delete(foreign_buddy)
            db.session.delete(buddy)
            db.session.delete(attendee)
            db.session.delete(organiser)
            db.session.commit()

    def test_event_material_upload_enforces_ten_mb_and_accepts_reference_formats(self):
        with self.app.app_context():
            png = base64.b64decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8"
                "/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
            )
            app_token = self.client.get("/generate_token").get_json()["access_token"]
            upload_headers = {"Auth-Token": app_token}
            response = self.client.post(
                "/upload_file",
                headers=upload_headers,
                json={
                    "module": "event_material",
                    "filename": "reference-material.png",
                    "content_type": "image/png",
                    "data": base64.b64encode(png).decode("ascii"),
                },
            )
            self.assertEqual(response.status_code, 200)
            payload = response.get_json()
            self.assertIn("file_url", payload)
            stored_path = Path(self.upload_root.name) / "event_material" / "reference-material.png"
            self.assertTrue(stored_path.exists())

            oversized = base64.b64encode(
                b"x" * (EVENT_MATERIAL_MAX_FILE_SIZE + 1)
            ).decode("ascii")
            rejected = self.client.post(
                "/upload_file",
                headers=upload_headers,
                json={
                    "module": "event_material",
                    "filename": "too-large.pdf",
                    "content_type": "application/pdf",
                    "data": oversized,
                },
            )
            self.assertEqual(rejected.status_code, 413)
            self.assertIn("10 MB", rejected.get_json()["error"])

    def test_organizer_cannot_reuse_material_from_another_event(self):
        with self.app.app_context():
            first_owner = Users(
                id=994701,
                role_type=3,
                first_name="First",
                last_name="Owner",
                country_code="+44",
                mobile_number="994701",
                email_id="first-owner@local.test",
                status=1,
            )
            second_owner = Users(
                id=994702,
                role_type=3,
                first_name="Second",
                last_name="Owner",
                country_code="+44",
                mobile_number="994702",
                email_id="second-owner@local.test",
                status=1,
            )
            category = Category(
                id=994703,
                title="Material ownership category",
                home_view=True,
                status=1,
            )
            first_event = Event(
                id=994701,
                user_id=first_owner.id,
                title="First material event",
                category_id=category.id,
                start_date=datetime(2026, 9, 1),
                end_date=datetime(2026, 9, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
            )
            second_event = Event(
                id=994702,
                user_id=second_owner.id,
                title="Second material event",
                category_id=category.id,
                start_date=datetime(2026, 9, 2),
                end_date=datetime(2026, 9, 2),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
            )
            foreign_document = EventDocuments(
                id=994701,
                event_id=second_event.id,
                document_name="Foreign document",
                file_path="http://local.test/uploads/event_material/foreign.pdf",
                created_by=second_owner.id,
                updated_by=second_owner.id,
            )
            db.session.add_all([
                first_owner,
                second_owner,
                category,
                first_event,
                second_event,
                foreign_document,
            ])
            db.session.commit()

            with self.assertRaisesRegex(ServiceError, "does not belong to this event"):
                OrganizerEventService.process_documents(
                    [{"id": foreign_document.id, "document_name": "Hijacked"}],
                    first_event.id,
                    first_owner.id,
                    {},
                )

            db.session.delete(foreign_document)
            db.session.delete(second_event)
            db.session.delete(first_event)
            db.session.delete(category)
            db.session.delete(second_owner)
            db.session.delete(first_owner)
            db.session.commit()

    def test_organizer_course_classes_are_normalized_owned_and_removable(self):
        with self.app.app_context():
            owner = Users(
                id=994711,
                role_type=3,
                first_name="Course",
                last_name="Owner",
                country_code="+44",
                mobile_number="994711",
                email_id="course-owner@local.test",
                status=1,
            )
            other_owner = Users(
                id=994712,
                role_type=3,
                first_name="Other",
                last_name="Owner",
                country_code="+44",
                mobile_number="994712",
                email_id="other-course-owner@local.test",
                status=1,
            )
            category = Category(id=994713, title="Course class category", home_view=True, status=1)
            event = Event(
                id=994711,
                user_id=owner.id,
                title="Course with classes",
                category_id=category.id,
                start_date=datetime(2026, 9, 10),
                end_date=datetime(2026, 9, 20),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=2,
                price_type=0,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
            )
            other_event = Event(
                id=994712,
                user_id=other_owner.id,
                title="Other course",
                category_id=category.id,
                start_date=datetime(2026, 9, 11),
                end_date=datetime(2026, 9, 11),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=2,
                price_type=0,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
                status=1,
            )
            foreign_class = EventCurriculum(
                id=994712,
                event_id=other_event.id,
                description="Foreign class",
                no_of_days=1,
                start_date=datetime(2026, 9, 11),
                end_date=datetime(2026, 9, 11),
                start_time=time(18, 0),
                end_time=time(19, 0),
                created_by=other_owner.id,
                updated_by=other_owner.id,
            )
            db.session.add_all([owner, other_owner, category, event, other_event, foreign_class])
            db.session.commit()

            OrganizerEventService.process_curriculum(
                [{
                    "description": "Class one",
                    "start_date": "10-09-2026",
                    "end_date": "12-09-2026",
                    "start_time": "18:00",
                    "end_time": "19:30",
                }],
                event.id,
                owner.id,
                {},
            )
            created = EventCurriculum.query.filter_by(event_id=event.id, status=1).one()
            self.assertEqual(created.description, "Class one")
            self.assertEqual(created.start_date, datetime(2026, 9, 10))
            self.assertEqual(created.end_date, datetime(2026, 9, 12))
            self.assertEqual(created.start_time, time(18, 0))
            self.assertEqual(created.end_time, time(19, 30))
            self.assertEqual(created.no_of_days, 3)

            OrganizerEventService.process_curriculum(
                [{
                    "id": created.id,
                    "description": "Class one updated",
                    "start_date": "10-09-2026",
                    "end_date": "12-09-2026",
                    "start_time": "18:00",
                    "end_time": "19:30",
                    "no_of_days": 3,
                }],
                event.id,
                owner.id,
                {},
            )
            self.assertEqual(EventCurriculum.query.get(created.id).description, "Class one updated")

            with self.assertRaisesRegex(ServiceError, "does not belong to this event"):
                OrganizerEventService.process_curriculum(
                    [{
                        "id": foreign_class.id,
                        "description": "Hijacked class",
                        "start_date": "11-09-2026",
                        "end_date": "11-09-2026",
                        "start_time": "18:00",
                        "end_time": "19:00",
                    }],
                    event.id,
                    owner.id,
                    {},
                )

            OrganizerEventService.process_curriculum([], event.id, owner.id, {})
            self.assertEqual(EventCurriculum.query.get(created.id).status, 0)

            db.session.delete(foreign_class)
            db.session.delete(other_event)
            db.session.delete(event)
            db.session.delete(category)
            db.session.delete(other_owner)
            db.session.delete(owner)
            db.session.commit()

    def test_one_to_one_only_accepts_a_real_free_slot_and_is_idempotent(self):
        with self.app.app_context():
            organiser = Users(
                id=99211,
                role_type=3,
                first_name="Session",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99211",
                email_id="session-organiser@local.test",
            )
            speaker_user = Users(
                id=99212,
                role_type=4,
                first_name="Session",
                last_name="Speaker",
                country_code="+44",
                mobile_number="99212",
                email_id="session-speaker@local.test",
                time_zone="Europe/London",
            )
            attendee = Users(
                id=99213,
                role_type=2,
                first_name="Session",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99213",
                email_id="session-attendee@local.test",
            )
            other_attendee = Users(
                id=99214,
                role_type=2,
                first_name="Other",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99214",
                email_id="session-other-attendee@local.test",
            )
            category = Category(id=99211, title="Session reference listing", home_view=True)
            topic = SubCategory(
                id=99211,
                category_id=category.id,
                title="Session reference topic",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=99211, title="Session Beginner", status=1)
            event = Event(
                id=99211,
                user_id=organiser.id,
                title="Reference one-to-one event",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 1),
                end_date=datetime(2026, 9, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            db.session.add_all([
                organiser,
                speaker_user,
                attendee,
                other_attendee,
                category,
                topic,
                level,
                event,
            ])
            db.session.flush()
            db.session.add_all([
                Speaker(
                    user_id=speaker_user.id,
                    status=1,
                    one_to_one_duration_minutes=45,
                    created_by=speaker_user.id,
                    updated_by=speaker_user.id,
                ),
                EventSpeakers(
                    event_id=event.id,
                    user_id=speaker_user.id,
                    status=1,
                    created_by=organiser.id,
                    updated_by=organiser.id,
                ),
            ])
            session_date = date.today() + timedelta(days=14)
            availability = SpeakerAvailabilityDate(
                user_id=speaker_user.id,
                date=session_date,
                status=1,
                created_by=speaker_user.id,
                updated_by=speaker_user.id,
            )
            db.session.add(availability)
            db.session.flush()
            db.session.add(SpeakerAvailabilityTime(
                availability_date_id=availability.id,
                start_time=time(17, 0),
                end_time=time(18, 0),
                status=1,
                created_by=speaker_user.id,
                updated_by=speaker_user.id,
            ))
            db.session.commit()

            available = SpeakerService.speaker_slot.__wrapped__(
                attendee.id,
                {"id": speaker_user.id, "date": session_date.isoformat()},
            )
            self.assertEqual(
                [slot["start_time"] for slot in available["times"]],
                ["17:00:00"],
            )

            with self.assertRaisesRegex(ServiceError, "No available slot for this time"):
                EventService.request_buddy.__wrapped__(attendee.id, {
                    "event_id": event.id,
                    "type": 2,
                    "speaker_id": speaker_user.id,
                    "date": session_date.isoformat(),
                    "time": "16:00:00",
                })

            request_payload = {
                "event_id": event.id,
                "type": 2,
                "speaker_id": speaker_user.id,
                "date": session_date.isoformat(),
                "time": "17:00:00",
                "user_comment": "Reference session request",
            }
            with patch.object(EventRepo, "send_buddyrequest_notifications") as notify:
                created = EventService.request_buddy.__wrapped__(attendee.id, request_payload)
                duplicate = EventService.request_buddy.__wrapped__(attendee.id, request_payload)

            self.assertEqual(created["message"], "Session request sent and pending approval.")
            self.assertEqual(created["session_status"], 0)
            self.assertEqual(duplicate["message"], "Already requested")
            self.assertEqual(
                Request_buddy.query.filter_by(
                    event_id=event.id,
                    user_id=attendee.id,
                    speaker_id=speaker_user.id,
                    type=2,
                ).count(),
                1,
            )
            notify.assert_called_once()

            no_longer_available = SpeakerService.speaker_slot.__wrapped__(
                other_attendee.id,
                {"id": speaker_user.id, "date": session_date.isoformat()},
            )
            self.assertEqual(no_longer_available["times"], [])

            with self.assertRaisesRegex(ServiceError, "Slot is no longer available"):
                EventService.request_buddy.__wrapped__(other_attendee.id, request_payload)

            cancelled = Request_buddy.query.filter_by(
                event_id=event.id,
                user_id=attendee.id,
                speaker_id=speaker_user.id,
                type=2,
            ).one()
            self.assertEqual(cancelled.duration_minutes, 45)
            cancelled.status = 2
            db.session.commit()

            with patch.object(EventRepo, "send_buddyrequest_notifications") as notify_again:
                requested_again = EventService.request_buddy.__wrapped__(
                    attendee.id,
                    request_payload,
                )

            self.assertEqual(
                requested_again["message"],
                "Session request sent and pending approval.",
            )
            self.assertEqual(
                Request_buddy.query.filter_by(
                    event_id=event.id,
                    user_id=attendee.id,
                    speaker_id=speaker_user.id,
                    type=2,
                ).count(),
                2,
            )
            self.assertEqual(
                Request_buddy.query.filter_by(
                    event_id=event.id,
                    user_id=attendee.id,
                    speaker_id=speaker_user.id,
                    type=2,
                    status=0,
                ).count(),
                1,
            )
            notify_again.assert_called_once()

            with self.assertRaisesRegex(ServiceError, "A valid session date is required"):
                SpeakerService.speaker_slot.__wrapped__(
                    attendee.id,
                    {"id": speaker_user.id, "date": "not-a-date"},
                )

    def test_one_to_one_lifecycle_is_owned_explicit_and_notification_idempotent(self):
        with self.app.app_context():
            organiser = Users(
                id=99311,
                role_type=3,
                first_name="Lifecycle",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99311",
                email_id="lifecycle-organiser@local.test",
            )
            other_organiser = Users(
                id=99312,
                role_type=3,
                first_name="Other",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99312",
                email_id="lifecycle-other-organiser@local.test",
            )
            speaker_user = Users(
                id=99313,
                role_type=4,
                first_name="Lifecycle",
                last_name="Speaker",
                country_code="+44",
                mobile_number="99313",
                email_id="lifecycle-speaker@local.test",
                time_zone="Europe/London",
            )
            other_speaker = Users(
                id=99314,
                role_type=4,
                first_name="Other",
                last_name="Speaker",
                country_code="+44",
                mobile_number="99314",
                email_id="lifecycle-other-speaker@local.test",
            )
            attendee = Users(
                id=99315,
                role_type=2,
                first_name="Lifecycle",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99315",
                email_id="lifecycle-attendee@local.test",
            )
            category = Category(id=99311, title="Lifecycle listing", home_view=True)
            topic = SubCategory(
                id=99311,
                category_id=category.id,
                title="Lifecycle topic",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=99311, title="Lifecycle Beginner", status=1)
            event = Event(
                id=99311,
                user_id=organiser.id,
                title="Lifecycle reference event",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 1),
                end_date=datetime(2026, 9, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            db.session.add_all([
                organiser,
                other_organiser,
                speaker_user,
                other_speaker,
                attendee,
                category,
                topic,
                level,
                event,
            ])
            db.session.flush()
            db.session.add(Speaker(
                user_id=speaker_user.id,
                status=1,
                one_to_one_enabled=True,
                one_to_one_location_type=2,
                one_to_one_duration_minutes=60,
                created_by=speaker_user.id,
                updated_by=speaker_user.id,
            ))
            first_date = date.today() + timedelta(days=21)
            second_date = first_date + timedelta(days=1)
            for available_date in (first_date, second_date):
                availability = SpeakerAvailabilityDate(
                    user_id=speaker_user.id,
                    date=available_date,
                    status=1,
                    created_by=speaker_user.id,
                    updated_by=speaker_user.id,
                )
                db.session.add(availability)
                db.session.flush()
                db.session.add(SpeakerAvailabilityTime(
                    availability_date_id=availability.id,
                    start_time=time(17, 0),
                    end_time=time(18, 0),
                    status=1,
                    created_by=speaker_user.id,
                    updated_by=speaker_user.id,
                ))
            session = Request_buddy(
                event_id=event.id,
                user_id=attendee.id,
                speaker_id=speaker_user.id,
                status=OneToOneService.PENDING,
                type=2,
                date=first_date,
                time=time(17, 0),
                time_zone="Europe/London",
                user_comment="Please help",
                created_by=attendee.id,
                updated_by=attendee.id,
            )
            db.session.add(session)
            db.session.commit()

            with self.assertRaisesRegex(ServiceError, "Session not found"):
                OneToOneService.update_session(
                    other_organiser.id,
                    "organiser",
                    {"id": session.id, "action": "approve"},
                )
            with self.assertRaisesRegex(ServiceError, "Session not found"):
                OneToOneService.update_session(
                    other_speaker.id,
                    "speaker",
                    {"id": session.id, "action": "approve"},
                )
            with self.assertRaisesRegex(ServiceError, "not allowed"):
                OneToOneService.update_session(
                    attendee.id,
                    "customer",
                    {"id": session.id, "action": "approve"},
                )

            with patch("app.services.one_to_one.user.get_push_token", return_value=None):
                approved = OneToOneService.update_session(
                    organiser.id,
                    "organiser",
                    {"id": session.id, "action": "approve"},
                )
                approved_retry = OneToOneService.update_session(
                    organiser.id,
                    "organiser",
                    {"id": session.id, "action": "approve"},
                )
                confirmed = OneToOneService.update_session(
                    organiser.id,
                    "organiser",
                    {
                        "id": session.id,
                        "action": "confirm",
                        "location_type": 0,
                        "meet_link": "https://meet.example/reference-session",
                    },
                )
                confirmed_retry = OneToOneService.update_session(
                    organiser.id,
                    "organiser",
                    {
                        "id": session.id,
                        "action": "confirm",
                        "location_type": 0,
                        "meet_link": "https://meet.example/reference-session",
                    },
                )
                reschedule = OneToOneService.update_session(
                    attendee.id,
                    "customer",
                    {
                        "id": session.id,
                        "action": "request_reschedule",
                        "date": second_date.isoformat(),
                        "time": "17:00:00",
                        "user_comment": "Please use the next day",
                    },
                )
                reconfirmed = OneToOneService.update_session(
                    speaker_user.id,
                    "speaker",
                    {
                        "id": session.id,
                        "action": "confirm",
                        "location_type": 0,
                        "meet_link": "https://meet.example/rescheduled-session",
                    },
                )
                cancelled = OneToOneService.update_session(
                    attendee.id,
                    "customer",
                    {"id": session.id, "action": "cancel"},
                )

            self.assertEqual(approved["session"]["status_label"], "APPROVED")
            self.assertEqual(approved["notification_count"], 2)
            self.assertFalse(approved_retry["updated"])
            self.assertEqual(approved_retry["notification_count"], 0)
            self.assertEqual(confirmed["session"]["status_label"], "CONFIRMED")
            self.assertEqual(confirmed["notification_count"], 2)
            self.assertFalse(confirmed_retry["updated"])
            self.assertEqual(reschedule["session"]["status_label"], "RESCHEDULE_REQUESTED")
            self.assertEqual(reschedule["notification_count"], 1)
            self.assertEqual(reconfirmed["session"]["status_label"], "CONFIRMED")
            self.assertEqual(reconfirmed["notification_count"], 1)
            self.assertEqual(cancelled["session"]["status_label"], "CANCELLED")
            self.assertEqual(cancelled["notification_count"], 1)

            db.session.refresh(session)
            self.assertEqual(session.status, OneToOneService.CANCELLED)
            self.assertEqual(session.date, second_date)
            self.assertEqual(session.time, time(17, 0))
            self.assertEqual(session.meet_link, "https://meet.example/rescheduled-session")
            self.assertEqual(
                Notification_History.query.filter_by(event_id=session.id, type=4).count(),
                7,
            )

            with self.assertRaisesRegex(ServiceError, "already closed"):
                OneToOneService.update_session(
                    organiser.id,
                    "organiser",
                    {"id": session.id, "action": "complete"},
                )

    def test_speaker_one_to_one_configuration_and_unavailable_date_override(self):
        with self.app.app_context():
            organiser = Users(
                id=99320,
                role_type=3,
                first_name="Availability",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99320",
                email_id="availability-organiser@local.test",
            )
            speaker_user = Users(
                id=99321,
                role_type=4,
                first_name="Availability",
                last_name="Speaker",
                country_code="+44",
                mobile_number="99321",
                email_id="availability-speaker@local.test",
                time_zone="Europe/London",
            )
            category = Category(id=99321, title="Availability listing", home_view=True)
            topic = SubCategory(
                id=99321,
                category_id=category.id,
                title="Availability topic",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=99321, title="Availability Beginner", status=1)
            event = Event(
                id=99321,
                user_id=organiser.id,
                title="Availability reference event",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 1),
                end_date=datetime(2026, 9, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=1,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            speaker = Speaker(
                user_id=speaker_user.id,
                status=1,
                created_by=speaker_user.id,
                updated_by=speaker_user.id,
            )
            db.session.add_all([organiser, speaker_user, category, topic, level, event, speaker])
            db.session.flush()
            db.session.add(EventSpeakers(
                event_id=event.id,
                user_id=speaker_user.id,
                status=1,
                created_by=organiser.id,
                updated_by=organiser.id,
            ))
            db.session.commit()

            first_date = date.today() + timedelta(days=28)
            following_week = first_date + timedelta(days=7)
            payload = {
                "time_zone": "Europe/London",
                "one_to_one_enabled": True,
                "location_type": 2,
                "duration_minutes": 45,
                "availability_days": [{
                    "weekday": first_date.weekday(),
                    "status": 1,
                    "times": [{
                        "start_time": "17:00:00",
                        "end_time": "17:45:00",
                        "status": 1,
                    }],
                }],
                "availability_dates": [{
                    "date": first_date.isoformat(),
                    "status": 2,
                }],
            }
            with self.app.test_request_context(headers={"Timezone": "Europe/London"}):
                configured = SpeakerManagementService.add_availability_days.__wrapped__(
                    payload,
                    speaker_user.id,
                )

            self.assertTrue(configured["one_to_one_enabled"])
            self.assertEqual(configured["location_type"], 2)
            self.assertEqual(configured["duration_minutes"], 45)

            settings = SpeakerManagementService.get_availability_days.__wrapped__(speaker_user.id)
            self.assertEqual(settings["duration_minutes"], 45)
            self.assertEqual(len(settings["availability_days"]), 1)
            self.assertEqual(len(settings["availability_dates"]), 1)
            self.assertEqual(settings["availability_dates"][0]["status"], 2)

            unavailable = SpeakerService.speaker_slot.__wrapped__(
                None,
                {"id": speaker_user.id, "date": first_date.isoformat()},
            )
            available = SpeakerService.speaker_slot.__wrapped__(
                None,
                {"id": speaker_user.id, "date": following_week.isoformat()},
            )
            self.assertEqual(unavailable["times"], [])
            self.assertEqual(unavailable["status"], 2)
            self.assertEqual(
                [slot["start_time"] for slot in available["times"]],
                ["17:00:00"],
            )
            self.assertEqual(available["duration_minutes"], 45)

            organiser_view = OrganizerSpeakerService.get_availability.__wrapped__(
                {"speaker_id": speaker_user.id},
                organiser.id,
            )
            self.assertEqual(organiser_view["duration_minutes"], 45)
            with self.assertRaisesRegex(ServiceError, "Not your Speaker"):
                OrganizerSpeakerService.get_availability.__wrapped__(
                    {"speaker_id": speaker_user.id},
                    999999,
                )

    def test_one_to_one_reminders_are_timezone_safe_persisted_and_once_only(self):
        with self.app.app_context():
            organiser = Users(
                id=99331,
                role_type=3,
                first_name="Reminder",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99331",
                email_id="reminder-organiser@local.test",
            )
            speaker = Users(
                id=99332,
                role_type=4,
                first_name="Reminder",
                last_name="Speaker",
                country_code="+44",
                mobile_number="99332",
                email_id="reminder-speaker@local.test",
                time_zone="Europe/London",
            )
            attendee = Users(
                id=99333,
                role_type=2,
                first_name="Reminder",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99333",
                email_id="reminder-attendee@local.test",
            )
            category = Category(id=99331, title="Reminder listing", home_view=True)
            topic = SubCategory(
                id=99331,
                category_id=category.id,
                title="Reminder topic",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=99331, title="Reminder Beginner", status=1)
            event = Event(
                id=99331,
                user_id=organiser.id,
                title="Reminder reference event",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 10),
                end_date=datetime(2026, 9, 10),
                start_time=time(17, 0),
                end_time=time(18, 0),
                event_type=1,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=0,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            db.session.add_all([organiser, speaker, attendee, category, topic, level, event])
            db.session.flush()
            session = Request_buddy(
                event_id=event.id,
                user_id=attendee.id,
                speaker_id=speaker.id,
                status=OneToOneService.CONFIRMED,
                type=2,
                date=date(2026, 9, 10),
                time=time(17, 0),
                time_zone="Europe/London",
                meet_link="https://meet.example/reminder",
                created_by=attendee.id,
                updated_by=organiser.id,
            )
            db.session.add(session)
            db.session.commit()

            with patch("app.repositories.user.user.get_push_token", return_value=None):
                day = send_missing_meetlink_121_notifications_for_day(
                    self.app,
                    now=datetime(2026, 9, 9, 16, 30, tzinfo=ZoneInfo("UTC")),
                )
                day_retry = send_missing_meetlink_121_notifications_for_day(
                    self.app,
                    now=datetime(2026, 9, 9, 16, 31, tzinfo=ZoneInfo("UTC")),
                )
                half_hour = send_missing_meetlink_121_notifications_for_30min(
                    self.app,
                    now=datetime(2026, 9, 10, 15, 30, tzinfo=ZoneInfo("UTC")),
                )
                half_hour_retry = send_missing_meetlink_121_notifications_for_30min(
                    self.app,
                    now=datetime(2026, 9, 10, 15, 31, tzinfo=ZoneInfo("UTC")),
                )

            self.assertEqual(day, {"sessions": 1, "notifications": 2})
            self.assertEqual(day_retry, {"sessions": 0, "notifications": 0})
            self.assertEqual(half_hour, {"sessions": 1, "notifications": 2})
            self.assertEqual(half_hour_retry, {"sessions": 0, "notifications": 0})
            db.session.refresh(session)
            self.assertTrue(session.meetlink_reminder_1d_sent)
            self.assertTrue(session.meetlink_reminder_30m_sent)
            reminder_rows = Notification_History.query.filter_by(
                event_id=session.id,
                type=4,
            ).order_by(Notification_History.id.asc()).all()
            self.assertEqual(len(reminder_rows), 4)
            self.assertEqual(
                {row.user_id for row in reminder_rows},
                {attendee.id, speaker.id},
            )
            self.assertEqual(
                [row.title for row in reminder_rows],
                [
                    "1-to-1 session in 24 hours",
                    "1-to-1 session in 24 hours",
                    "1-to-1 session in 30 minutes",
                    "1-to-1 session in 30 minutes",
                ],
            )

    def test_event_booking_reminders_are_timezone_safe_per_session_and_once_only(self):
        with self.app.app_context():
            organiser = Users(
                id=99341,
                role_type=3,
                first_name="Event",
                last_name="Organiser",
                country_code="+44",
                mobile_number="99341",
                email_id="event-reminder-organiser@local.test",
            )
            attendee_with_tokens = Users(
                id=99342,
                role_type=2,
                first_name="Push",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99342",
                email_id="event-reminder-push@local.test",
            )
            attendee_without_token = Users(
                id=99343,
                role_type=2,
                first_name="Inbox",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99343",
                email_id="event-reminder-inbox@local.test",
            )
            cancelled_attendee = Users(
                id=99344,
                role_type=2,
                first_name="Cancelled",
                last_name="Attendee",
                country_code="+44",
                mobile_number="99344",
                email_id="event-reminder-cancelled@local.test",
            )
            category = Category(id=99341, title="Event reminder listing", home_view=True)
            topic = SubCategory(
                id=99341,
                category_id=category.id,
                title="Event reminder topic",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=99341, title="Event reminder Beginner", status=1)
            event = Event(
                id=99341,
                user_id=organiser.id,
                title="Timezone-safe reference class",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 10),
                end_date=datetime(2026, 9, 10),
                start_time=time(17, 0),
                end_time=time(18, 0),
                event_type=1,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=0,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            db.session.add_all([
                organiser,
                attendee_with_tokens,
                attendee_without_token,
                cancelled_attendee,
                category,
                topic,
                level,
                event,
            ])
            db.session.flush()
            event_date = EventDate(
                id=99341,
                event_id=event.id,
                date=date(2026, 9, 10),
                status=1,
                created_by=organiser.id,
            )
            event_time = EventDateTime(
                id=99341,
                event_date_id=event_date.id,
                start_time=time(17, 0),
                end_time=time(18, 0),
                status=1,
                created_by=organiser.id,
            )
            db.session.add_all([event_date, event_time])
            db.session.flush()
            participants = [
                Participant(event_id=event.id, user_id=attendee_with_tokens.id, status=1, created_by=organiser.id),
                Participant(event_id=event.id, user_id=attendee_with_tokens.id, status=1, created_by=organiser.id),
                Participant(event_id=event.id, user_id=attendee_without_token.id, status=1, created_by=organiser.id),
                Participant(event_id=event.id, user_id=cancelled_attendee.id, status=2, created_by=organiser.id),
            ]
            db.session.add_all(participants)
            db.session.add_all([
                User_session(user_id=attendee_with_tokens.id, type=2, token="event-reminder-a", push_token="device-a"),
                User_session(user_id=attendee_with_tokens.id, type=2, token="event-reminder-b", push_token="device-b"),
                User_session(user_id=cancelled_attendee.id, type=2, token="event-reminder-c", push_token="cancelled-device"),
            ])
            db.session.commit()

            with patch("app.utils.scheduler.threading.Thread") as thread:
                day = send_notifications_event_daily(
                    self.app,
                    now=datetime(2026, 9, 9, 16, 0, tzinfo=ZoneInfo("UTC")),
                )
                day_retry = send_notifications_event_daily(
                    self.app,
                    now=datetime(2026, 9, 9, 16, 1, tzinfo=ZoneInfo("UTC")),
                )
                half_hour = send_notifications_event_daily_30min(
                    self.app,
                    now=datetime(2026, 9, 10, 15, 30, tzinfo=ZoneInfo("UTC")),
                )
                half_hour_retry = send_notifications_event_daily_30min(
                    self.app,
                    now=datetime(2026, 9, 10, 15, 30, 30, tzinfo=ZoneInfo("UTC")),
                )

            self.assertEqual(day, {"sessions": 1, "notifications": 2, "pushes": 1})
            self.assertEqual(day_retry, {"sessions": 0, "notifications": 0, "pushes": 0})
            self.assertEqual(half_hour, {"sessions": 1, "notifications": 2, "pushes": 1})
            self.assertEqual(half_hour_retry, {"sessions": 0, "notifications": 0, "pushes": 0})
            self.assertEqual(thread.call_count, 2)
            for call in thread.call_args_list:
                thread_args = call.kwargs["args"] if "args" in call.kwargs else call.args[1]
                payload = thread_args[0]
                self.assertEqual(payload["registration_token"], ["device-b", "device-a"])
                self.assertNotIn("cancelled-device", payload["registration_token"])

            reminder_rows = Notification_History.query.filter_by(
                event_id=event.id,
                type=2,
            ).order_by(Notification_History.id.asc()).all()
            self.assertEqual(len(reminder_rows), 4)
            self.assertEqual(
                [row.title for row in reminder_rows],
                [
                    "Event in 24 hours",
                    "Event in 24 hours",
                    "Event in 30 minutes",
                    "Event in 30 minutes",
                ],
            )
            self.assertEqual(
                {row.user_id for row in reminder_rows},
                {attendee_with_tokens.id, attendee_without_token.id},
            )
            self.assertEqual(len({row.task_id for row in reminder_rows}), 4)
            self.assertTrue(all(row.participant_id for row in reminder_rows))
            self.assertEqual(
                EventReminderDelivery.query.filter_by(event_id=event.id).count(),
                4,
            )

    def test_image_storage_optimizes_and_uses_local_filesystem(self):
        source = BytesIO()
        Image.new("RGB", (3000, 2200), color=(22, 134, 101)).save(source, format="JPEG", quality=95)

        upload = store_file(
            source.getvalue(),
            folder="test-images",
            filename="large-source.jpeg",
            content_type="image/jpeg",
        )

        self.assertEqual(upload["content_type"], "image/jpeg")
        self.assertTrue(upload["url"].startswith("http://local.test/uploads/test-images/"))
        self.assertTrue(os.path.exists(upload["path"]))

        with Image.open(upload["path"]) as image:
            self.assertLessEqual(max(image.size), 2048)
            self.assertEqual(image.format, "JPEG")

    def test_local_test_otp_123456_works_for_any_customer_phone(self):
        phone = "700000001"
        send_response = self.client.post(
            "/customer_app/users/send_otp",
            json={"country_code": "+44", "mobile_number": phone},
        )
        self.assertEqual(send_response.status_code, 200)
        self.assertTrue(send_response.get_json()["status"])

        verify_response = self.client.post(
            "/customer_app/users/verify_otp",
            json={"country_code": "+44", "mobile_number": phone, "otp": "123456"},
        )
        self.assertEqual(verify_response.status_code, 200)
        verify_payload = verify_response.get_json()
        self.assertTrue(verify_payload["status"])
        self.assertFalse(verify_payload["response"]["is_register"])

    def test_learning_preference_excludes_listing_only_suitable_for_all(self):
        with self.app.app_context():
            beginner = JourneyLevel(id=92601, title="Beginner", status=1)
            suitable_for_all = JourneyLevel(id=92602, title="Suitable for all", status=1)
            legacy_customer = Users(
                id=92601,
                role_type=2,
                country_code="+44",
                mobile_number="92601",
                email_id="legacy-suitable-customer@local.test",
                journey_level_id=suitable_for_all.id,
            )
            db.session.add_all([beginner, suitable_for_all, legacy_customer])
            db.session.commit()

            self.assertEqual(CustomerService.validate_learning_preference(beginner.id), beginner.id)
            with self.assertRaisesRegex(ServiceError, "Learning preference"):
                CustomerService.validate_learning_preference(suitable_for_all.id)

            preferences = EventService.journey_levels.__wrapped__(None)
            preference_titles = {item["title"] for item in preferences}
            self.assertIn("Beginner", preference_titles)
            self.assertNotIn("Suitable for all", preference_titles)
            self.assertTrue(all(item["purpose"] == "learning_preference" for item in preferences))

            organiser_levels = EventRepo.get_active_master_journey_levels()
            self.assertIn("Suitable for all", {item["title"] for item in organiser_levels})

            GamificationService._ensure_listing_reference_data()
            repaired_customer = db.session.get(Users, legacy_customer.id)
            self.assertEqual(repaired_customer.journey_level.title, "Beginner")

    def test_public_profile_redacts_fields_disabled_by_privacy_settings(self):
        public_profile = EventService._public_profile_payload({
            "first_name": "Uzair",
            "last_name": "k",
            "email_id": "uzair.reference@ondeen.test",
            "country_code": "+44",
            "mobile_number": "700001001",
            "gender": "male",
            "age": 30,
            "dob": "1996-01-01",
            "journey_level_id": 1,
            "journey_level_title": "Suitable for all",
            "membership_count": 1,
            "event_count": 5,
            "course_count": 8,
            "tour_count": 2,
            "rating_count": 4,
            "avg_rating": 4.5,
            "show_events": 0,
            "show_course": 0,
            "show_reviews": 0,
            "show_journeylevel": 0,
            "show_mobile_number": 0,
        })

        self.assertEqual(public_profile["first_name"], "Uzair")
        self.assertEqual(public_profile["attended_count"], 0)
        for private_field in (
            "email_id",
            "country_code",
            "mobile_number",
            "gender",
            "age",
            "dob",
            "journey_level_id",
            "journey_level_title",
            "membership_count",
            "event_count",
            "course_count",
            "tour_count",
            "rating_count",
            "avg_rating",
        ):
            self.assertNotIn(private_field, public_profile)

    def test_public_profile_keeps_only_explicitly_shared_activity_fields(self):
        public_profile = EventService._public_profile_payload({
            "first_name": "Muhammad",
            "event_count": 2,
            "course_count": 8,
            "tour_count": 1,
            "rating_count": 4,
            "avg_rating": 4.5,
            "journey_level_id": 2,
            "journey_level_title": "Intermediate",
            "show_events": 1,
            "show_course": 1,
            "show_reviews": 1,
            "show_journeylevel": 1,
            "show_mobile_number": 0,
        })

        self.assertEqual(public_profile["attended_count"], 11)
        self.assertEqual(public_profile["course_count"], 8)
        self.assertEqual(public_profile["journey_level_title"], "Intermediate")
        self.assertEqual(public_profile["avg_rating"], 4.5)
        self.assertNotIn("mobile_number", public_profile)

    def test_public_participant_payload_never_exposes_contact_or_attendance_data(self):
        public_participant = EventService._public_participant_payload({
            "participant_id": 2,
            "user_id": 5,
            "event_id": 1,
            "first_name": "Uzair",
            "last_name": "k",
            "profile_image": "https://example.test/uzair.png",
            "is_mine": 0,
            "request_buddy_id": None,
            "buddy_id": None,
            "email_id": "uzair.reference@ondeen.test",
            "country_code": "+44",
            "mobile_number": "700001001",
            "journey_level_title": "Suitable for all",
            "attendance_count": 0,
            "attendance_percentage": 0,
            "transaction_id": None,
        })

        self.assertEqual(public_participant["first_name"], "Uzair")
        self.assertEqual(public_participant["user_id"], 5)
        for private_field in (
            "email_id",
            "country_code",
            "mobile_number",
            "journey_level_title",
            "attendance_count",
            "attendance_percentage",
            "transaction_id",
        ):
            self.assertNotIn(private_field, public_participant)

    def test_privacy_payload_accepts_only_binary_supported_toggles(self):
        payload = CustomerService._validate_privacy_payload({
            "show_course": 1,
            "show_events": 0,
            "show_reviews": True,
            "show_journeylevel": False,
            "show_mobile_number": 1,
        })

        self.assertEqual(payload, {
            "show_course": 1,
            "show_events": 0,
            "show_reviews": 1,
            "show_journeylevel": 0,
            "show_mobile_number": 1,
        })

        with self.assertRaises(ServiceError):
            CustomerService._validate_privacy_payload({"show_course": 2})

        with self.assertRaises(ServiceError):
            CustomerService._validate_privacy_payload({})

    def test_online_check_in_window_is_timezone_safe_at_exact_boundaries(self):
        event = SimpleNamespace(
            time_zone="Europe/London",
            start_time=time(10, 0),
            end_time=time(11, 0),
            start_date=datetime(2026, 1, 15, 10, 0),
            end_date=datetime(2026, 1, 15, 11, 0),
            duration=1,
        )
        attendance = SimpleNamespace(attendance_date=date(2026, 1, 15))
        london = ZoneInfo("Europe/London")

        OnlineCheckInService._ensure_online_check_in_window(
            event,
            attendance,
            now=datetime(2026, 1, 15, 9, 45, tzinfo=london),
        )
        OnlineCheckInService._ensure_online_check_in_window(
            event,
            attendance,
            now=datetime(2026, 1, 15, 11, 30, tzinfo=london),
        )
        with self.assertRaises(ServiceError):
            OnlineCheckInService._ensure_online_check_in_window(
                event,
                attendance,
                now=datetime(2026, 1, 15, 9, 44, 59, tzinfo=london),
            )
        with self.assertRaises(ServiceError):
            OnlineCheckInService._ensure_online_check_in_window(
                event,
                attendance,
                now=datetime(2026, 1, 15, 11, 30, 1, tzinfo=london),
            )

    def test_disabled_course_checkin_is_rejected_without_attendance_or_xp(self):
        with self.app.app_context():
            organiser = Users(
                id=194501,
                role_type=3,
                first_name="Toggle",
                last_name="Organiser",
                country_code="+44",
                mobile_number="194501",
                email_id="toggle-organiser@local.test",
            )
            attendee = Users(
                id=194502,
                role_type=2,
                first_name="Toggle",
                last_name="Attendee",
                country_code="+44",
                mobile_number="194502",
                email_id="toggle-attendee@local.test",
            )
            category = Category(id=2, title="Courses", home_view=True)
            event = Event(
                id=194501,
                user_id=organiser.id,
                title="Disabled check-in course",
                category_id=category.id,
                start_date=datetime.combine(date.today(), time(10, 0)),
                end_date=datetime.combine(date.today(), time(11, 0)),
                start_time=time(10, 0),
                end_time=time(11, 0),
                event_type=1,
                price_type=0,
                location_type=1,
                latitude=48.8566,
                longitude=2.3522,
                duration=1,
                occusr_type=1,
                swipe_checkin=2,
                time_zone="Europe/Paris",
            )
            db.session.add_all([organiser, attendee, category, event])
            db.session.flush()
            participant = Participant(event_id=event.id, user_id=attendee.id, status=1)
            db.session.add(participant)
            db.session.flush()
            attendance = ParticipantsAttendance(
                participant_id=participant.id,
                event_id=event.id,
                attendance_date=date.today(),
                status=0,
            )
            db.session.add(attendance)
            db.session.commit()

            result = EventService.check_in(attendee.id, {
                "event_id": event.id,
                "ticket_id": participant.id,
                "latitude": event.latitude,
                "longitude": event.longitude,
            })

            self.assertFalse(result[0]["status"])
            self.assertEqual(
                result[0]["response"]["message"],
                "Check-in is disabled for this listing",
            )
            self.assertEqual(ParticipantsAttendance.query.get(attendance.id).status, 0)
            self.assertEqual(GamificationXpLog.query.filter_by(attendance_id=attendance.id).count(), 0)

    def test_organiser_manual_attendance_enforces_owner_toggle_and_awards_once(self):
        with self.app.app_context():
            organiser = Users(
                id=194511,
                role_type=3,
                country_code="+44",
                mobile_number="194511",
                email_id="manual-organiser@local.test",
            )
            other_organiser = Users(
                id=194512,
                role_type=3,
                country_code="+44",
                mobile_number="194512",
                email_id="other-manual-organiser@local.test",
            )
            attendee = Users(
                id=194513,
                role_type=2,
                country_code="+44",
                mobile_number="194513",
                email_id="manual-attendee@local.test",
            )
            disabled_attendee = Users(
                id=194514,
                role_type=2,
                country_code="+44",
                mobile_number="194514",
                email_id="disabled-manual-attendee@local.test",
            )
            category = db.session.get(Category, 2)
            if not category:
                category = Category(id=2, title="Courses", home_view=True)
                db.session.add(category)
            topic = SubCategory(
                id=194511,
                category_id=2,
                title="Tafsir",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=194511, title="Beginner", status=1)
            event = Event(
                id=194511,
                user_id=organiser.id,
                title="Manual attendance course",
                category_id=2,
                sub_category_id=topic.id,
                start_date=datetime.combine(date.today(), time(10, 0)),
                end_date=datetime.combine(date.today(), time(11, 0)),
                start_time=time(10, 0),
                end_time=time(11, 0),
                event_type=2,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=1,
                duration=1,
                occusr_type=1,
                swipe_checkin=1,
                time_zone="Europe/London",
                status=1,
            )
            db.session.add_all([
                organiser,
                other_organiser,
                attendee,
                disabled_attendee,
                topic,
                level,
                event,
            ])
            db.session.flush()
            participant = Participant(event_id=event.id, user_id=attendee.id, status=1)
            disabled_participant = Participant(event_id=event.id, user_id=disabled_attendee.id, status=1)
            db.session.add_all([participant, disabled_participant])
            db.session.flush()
            attendance = ParticipantsAttendance(
                participant_id=participant.id,
                event_id=event.id,
                attendance_date=date.today(),
                status=0,
            )
            disabled_attendance = ParticipantsAttendance(
                participant_id=disabled_participant.id,
                event_id=event.id,
                attendance_date=date.today(),
                status=0,
            )
            db.session.add_all([attendance, disabled_attendance])
            db.session.commit()

            payload = {"event_id": event.id, "participant_id": participant.id}
            with self.assertRaisesRegex(ServiceError, "Event not found"):
                OrganizerEventService.manual_attendance.__wrapped__(payload, other_organiser.id)

            result = OrganizerEventService.manual_attendance.__wrapped__(payload, organiser.id)
            self.assertEqual(result["attendance_id"], attendance.id)
            self.assertEqual(db.session.get(ParticipantsAttendance, attendance.id).status, 1)
            self.assertEqual(db.session.get(Participant, participant.id).status, 3)
            self.assertEqual(GamificationXpLog.query.filter_by(attendance_id=attendance.id).count(), 1)
            self.assertEqual(
                GamificationXpLog.query.filter_by(attendance_id=attendance.id).one().verification_source,
                "manual-organiser",
            )

            with self.assertRaisesRegex(ServiceError, "Participant not found"):
                OrganizerEventService.manual_attendance.__wrapped__(payload, organiser.id)
            self.assertEqual(GamificationXpLog.query.filter_by(attendance_id=attendance.id).count(), 1)

            event.swipe_checkin = 2
            db.session.commit()
            with self.assertRaisesRegex(ServiceError, "Check-in is disabled"):
                OrganizerEventService.manual_attendance.__wrapped__({
                    "event_id": event.id,
                    "participant_id": disabled_participant.id,
                }, organiser.id)
            self.assertEqual(db.session.get(ParticipantsAttendance, disabled_attendance.id).status, 0)
            self.assertEqual(
                GamificationXpLog.query.filter_by(attendance_id=disabled_attendance.id).count(),
                0,
            )

    def test_organiser_qr_attendance_scopes_selected_listing_and_maps_errors(self):
        with patch.object(
            EventRepo,
            "update_attendance",
            return_value={"error7": "is_error"},
        ) as update_attendance:
            with self.assertRaisesRegex(ServiceError, "QR code belongs to another listing"):
                OrganizerEventService.update_attendance.__wrapped__({
                    "qrcode": "ticket-qr",
                    "event_id": 92501,
                }, 92502)
            update_attendance.assert_called_once_with(
                "ticket-qr",
                92502,
                expected_event_id=92501,
            )

        with patch.object(
            EventRepo,
            "update_attendance",
            return_value=SimpleNamespace(scan_quantity=1),
        ) as update_attendance:
            result = OrganizerEventService.update_attendance.__wrapped__({
                "qrcode": "ticket-qr",
            }, 92502)
            self.assertEqual(result["message"], "Attendance updated successfully")
            self.assertEqual(result["scan_quantity"], 1)
            update_attendance.assert_called_once_with(
                "ticket-qr",
                92502,
                expected_event_id=None,
            )

    def test_attendance_percentage_uses_only_completed_sessions(self):
        with self.app.app_context():
            organiser = Users(
                id=92401,
                role_type=3,
                country_code="+44",
                mobile_number="92401",
                email_id="attendance-organiser@local.test",
            )
            attendee = Users(
                id=92402,
                role_type=2,
                country_code="+44",
                mobile_number="92402",
                email_id="attendance-user@local.test",
            )
            other_organiser = Users(
                id=92403,
                role_type=3,
                country_code="+44",
                mobile_number="92403",
                email_id="other-attendance-organiser@local.test",
            )
            category = Category(id=92401, title="Attendance test listing", home_view=True)
            topic = SubCategory(
                id=92401,
                category_id=category.id,
                title="Attendance test topic",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=92401, title="Beginner", status=1)
            event = Event(
                id=92401,
                user_id=organiser.id,
                title="Four-session attendance course",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 1),
                end_date=datetime(2026, 9, 22),
                start_time=time(10, 0),
                end_time=time(11, 0),
                event_type=2,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=4,
                location_type=1,
                duration=1,
                occusr_type=3,
                time_zone="Europe/London",
            )
            db.session.add_all([organiser, attendee, other_organiser, category, topic, level, event])
            db.session.flush()
            participant = Participant(event_id=event.id, user_id=attendee.id, status=1)
            db.session.add(participant)
            db.session.flush()
            for session_date, status in (
                (date(2026, 9, 1), 1),
                (date(2026, 9, 8), 1),
                (date(2026, 9, 15), 1),
                (date(2026, 9, 22), 0),
            ):
                db.session.add(ParticipantsAttendance(
                    participant_id=participant.id,
                    event_id=event.id,
                    attendance_date=session_date,
                    status=status,
                ))
            db.session.commit()

            before_fourth = EventRepo.participant_attendance_progress(
                participant.id,
                event.id,
                now=datetime(2026, 9, 20, 12, 0, tzinfo=ZoneInfo("Europe/London")),
            )
            self.assertEqual(before_fourth, {
                "completed_session_count": 3,
                "attended_session_count": 3,
                "attendance_percentage": 100,
            })

            after_fourth = EventRepo.participant_attendance_progress(
                participant.id,
                event.id,
                now=datetime(2026, 9, 22, 12, 0, tzinfo=ZoneInfo("Europe/London")),
            )
            self.assertEqual(after_fourth, {
                "completed_session_count": 4,
                "attended_session_count": 3,
                "attendance_percentage": 75,
            })
            with self.assertRaisesRegex(ServiceError, "Event not found"):
                OrganizerEventService.participant_list.__wrapped__(
                    {"event_id": event.id},
                    other_organiser.id,
                )

    def test_online_check_in_codes_are_always_six_digits(self):
        for _ in range(200):
            code = OnlineCheckInService._generate_code()
            self.assertEqual(len(code), 6)
            self.assertTrue(code.isdigit())

    def test_online_check_in_requires_booking_and_awards_once_for_hybrid(self):
        with self.app.app_context():
            organiser = Users(
                id=92501,
                role_type=3,
                country_code="+44",
                mobile_number="92501",
                email_id="online-organiser@local.test",
            )
            attendee = Users(
                id=92502,
                role_type=2,
                country_code="+44",
                mobile_number="92502",
                email_id="online-attendee@local.test",
            )
            non_booked = Users(
                id=92503,
                role_type=2,
                country_code="+44",
                mobile_number="92503",
                email_id="online-stranger@local.test",
            )
            category = Category(id=92501, title="Hybrid test listing", home_view=True)
            topic = SubCategory(
                id=92501,
                category_id=category.id,
                title="Hybrid test topic",
                created_by=organiser.id,
            )
            level = JourneyLevel(id=92501, title="Beginner", status=1)
            event = Event(
                id=92501,
                user_id=organiser.id,
                title="Booked hybrid session",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 10),
                end_date=datetime(2026, 9, 10),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=2,
                duration=1,
                occusr_type=1,
                time_zone="Europe/London",
            )
            db.session.add_all([organiser, attendee, non_booked, category, topic, level, event])
            db.session.flush()
            participant = Participant(event_id=event.id, user_id=attendee.id, status=1)
            db.session.add(participant)
            db.session.flush()
            attendance = ParticipantsAttendance(
                participant_id=participant.id,
                event_id=event.id,
                attendance_date=date(2026, 9, 10),
                status=0,
            )
            db.session.add(attendance)
            db.session.commit()

            self.assertTrue(OnlineCheckInService._is_online_event(event))
            generated = OnlineCheckInService.get_or_create_code(
                event,
                session_date=attendance.attendance_date,
                actor_id=organiser.id,
                fixed_code="654321",
            )
            self.assertEqual(generated["code"], "654321")

            with self.assertRaisesRegex(ServiceError, "Booked ticket not found"):
                OnlineCheckInService.validate_online_check_in(
                    non_booked.id,
                    {
                        "event_id": event.id,
                        "code": "654321",
                        "session_date": "2026-09-10",
                        "debug_allow_future": True,
                    },
                )

            result = OnlineCheckInService.validate_online_check_in(
                attendee.id,
                {
                    "participant_id": participant.id,
                    "event_id": event.id,
                    "code": "654321",
                    "session_date": "2026-09-10",
                    "debug_allow_future": True,
                },
            )
            self.assertEqual(result["attendance_id"], attendance.id)
            self.assertEqual(db.session.get(ParticipantsAttendance, attendance.id).status, 1)
            self.assertEqual(
                GamificationXpLog.query.filter_by(attendance_id=attendance.id).count(),
                1,
            )

            with self.assertRaisesRegex(ServiceError, "Booked ticket not found"):
                OnlineCheckInService.validate_online_check_in(
                    attendee.id,
                    {
                        "event_id": event.id,
                        "code": "654321",
                        "session_date": "2026-09-10",
                        "debug_allow_future": True,
                    },
                )
            self.assertEqual(
                GamificationXpLog.query.filter_by(attendance_id=attendance.id).count(),
                1,
            )

    def test_online_check_in_locks_third_wrong_code_for_fifteen_minutes(self):
        with self.app.app_context():
            OnlineCheckInService.ensure_storage()
            OnlineCheckInAttempt.query.filter_by(user_id=91001, event_id=92001).delete()
            db.session.commit()
            session_date = date(2026, 1, 15)
            started = datetime(2026, 1, 15, 10, 0)

            first = OnlineCheckInService._record_failed_attempt(91001, 92001, session_date, now=started)
            second = OnlineCheckInService._record_failed_attempt(
                91001,
                92001,
                session_date,
                now=started + timedelta(minutes=2),
            )
            self.assertEqual(first["attempts_remaining"], 2)
            self.assertEqual(second["attempts_remaining"], 1)

            with self.assertRaisesRegex(ServiceError, "Try again in 15 minutes"):
                OnlineCheckInService._record_failed_attempt(
                    91001,
                    92001,
                    session_date,
                    now=started + timedelta(minutes=4),
                )
            with self.assertRaisesRegex(ServiceError, "Too many wrong codes"):
                OnlineCheckInService._ensure_not_rate_limited(
                    91001,
                    92001,
                    session_date,
                    now=started + timedelta(minutes=18),
                )

            reset = OnlineCheckInService._record_failed_attempt(
                91001,
                92001,
                session_date,
                now=started + timedelta(minutes=20),
            )
            self.assertEqual(reset["failed_attempt_count"], 1)
            OnlineCheckInService._clear_failed_attempts(91001, 92001, session_date)
            self.assertIsNone(OnlineCheckInService._attempt_row(91001, 92001, session_date))

    def test_gamification_reference_formulas_and_activity_dimensions(self):
        self.assertEqual(GamificationService.difficulty_multiplier("New Muslim"), 1.0)
        self.assertEqual(GamificationService.difficulty_multiplier("Beginner"), 1.0)
        self.assertEqual(GamificationService.difficulty_multiplier("Intermediate"), 1.3)
        self.assertEqual(GamificationService.difficulty_multiplier("Advanced"), 1.6)
        self.assertEqual(GamificationService.difficulty_multiplier("Suitable for all"), 1.0)
        self.assertEqual(GamificationService.completion_bonus_for_attendance(10, 8), 1500)
        self.assertEqual(GamificationService.completion_bonus_for_attendance(10, 6), 750)
        self.assertEqual(GamificationService.completion_bonus_for_attendance(10, 5), 0)
        self.assertEqual(GamificationService.radar_score(4, 8), 50)
        self.assertEqual(GamificationService.radar_score(9, 8), 100)
        self.assertEqual(GamificationService.radar_state(25), "quiet")
        self.assertEqual(GamificationService.radar_state(26), "building")
        self.assertEqual(GamificationService.radar_state(61), "strong")

        event = SimpleNamespace(
            title="Weekly Tafsir",
            category=SimpleNamespace(title="Courses"),
            subcategory=SimpleNamespace(title="Tafsir"),
            journey_level=SimpleNamespace(title="Intermediate"),
            occusr_type=3,
            total_no_class=12,
        )
        dimensions = GamificationService.verified_activity_dimensions(event, "validated")
        self.assertEqual(dimensions["topic_id"], "TAFSIR")
        self.assertEqual(dimensions["radar_area"], "Knowledge")
        self.assertEqual(dimensions["suitability"], "Intermediate")
        self.assertTrue(dimensions["is_recurring"])
        self.assertEqual(dimensions["verification_source"], "validated")

    def test_activity_classification_matches_the_approved_one_axis_matrix(self):
        expected = {
            "Tafsir": ("TAFSIR", "Knowledge"),
            "Quran - Tajwid / technical recitation": ("QURAN_TAJWID", "Knowledge"),
            "Fiqh general": ("FIQH_GENERAL", "Knowledge"),
            "Fiqh madhhab": ("FIQH_MADHHAB", "Knowledge"),
            "Arabic": ("ARABIC", "Knowledge"),
            "Sirah": ("SIRAH", "Knowledge"),
            "Aqidah": ("AQIDAH", "Knowledge"),
            "Islamic history": ("ISLAMIC_HISTORY", "Knowledge"),
            "Hadith sciences": ("HADITH_SCIENCES", "Knowledge"),
            "Educational mosque tour": ("EDUCATIONAL_MOSQUE_TOUR", "Knowledge"),
            "Quran - memorisation and recitation": ("QURAN_MEMORISATION", "Tazkiyyah"),
            "Quran - tadabbur / reflection": ("QURAN_TADABBUR", "Tazkiyyah"),
            "Hajj programme": ("HAJJ_PROGRAMME", "Tazkiyyah"),
            "Umrah programme": ("UMRAH_PROGRAMME", "Tazkiyyah"),
            "Ramadan programme": ("RAMADAN_PROGRAMME", "Tazkiyyah"),
            "Dhikr / adhkar circle": ("DHIKR_CIRCLE", "Tazkiyyah"),
            "Purification of the heart": ("PURIFICATION_HEART", "Tazkiyyah"),
            "Worship retreat / itikaf": ("WORSHIP_RETREAT", "Tazkiyyah"),
            "Cycling / sports day": ("CYCLING_SPORTS_DAY", "Fitness"),
            "Martial arts": ("MARTIAL_ARTS", "Fitness"),
            "Bootcamp / organised exercise": ("BOOTCAMP", "Fitness"),
            "Health and physical-wellbeing retreat": ("HEALTH_RETREAT", "Fitness"),
            "Volunteering day": ("VOLUNTEER", "Community"),
            "Community service": ("COMMUNITY_SERVICE", "Community"),
            "Fundraiser / charity gala": ("FUNDRAISER", "Community"),
            "Brotherhood / sisterhood gathering": ("BROTHERHOOD_GATHERING", "Community"),
            "Community social / family event": ("COMMUNITY_SOCIAL", "Community"),
            "Youth club / ISOC": ("YOUTH_CLUB", "Community"),
            "Community iftar": ("COMMUNITY_IFTAR", "Community"),
            "Rijal Club-style community event": ("RIJAL_CLUB", "Community"),
        }

        for title, (topic_id, radar_area) in expected.items():
            with self.subTest(title=title):
                classification = GamificationService.classification_for_topic(title)
                self.assertEqual(classification["topic_id"], topic_id)
                self.assertEqual(classification["radar_area"], radar_area)

        tajwid = GamificationService.classification_for_topic("Quran - Tajwid / technical recitation")
        memorisation = GamificationService.classification_for_topic("Quran - memorisation and recitation")
        self.assertEqual(tajwid["radar_area"], "Knowledge")
        self.assertEqual(memorisation["radar_area"], "Tazkiyyah")

    def test_primary_topic_controls_radar_and_every_recurring_session_inherits_it(self):
        event = SimpleNamespace(
            title="Ramadan community fundraiser with cycling",
            category=SimpleNamespace(title="Courses"),
            subcategory=SimpleNamespace(
                title="Martial arts",
                topic_key="MARTIAL_ARTS",
                radar_area="Fitness",
            ),
            journey_level=SimpleNamespace(title="Advanced"),
            occusr_type=3,
            total_no_class=8,
        )

        first_session = GamificationService.verified_activity_dimensions(event, "validated")
        later_session = GamificationService.verified_activity_dimensions(event, "manual_organizer")
        self.assertEqual(first_session["topic_id"], "MARTIAL_ARTS")
        self.assertEqual(first_session["radar_area"], "Fitness")
        self.assertEqual(first_session["suitability"], "Advanced")
        self.assertTrue(first_session["is_recurring"])
        self.assertEqual(later_session["topic_id"], first_session["topic_id"])
        self.assertEqual(later_session["radar_area"], first_session["radar_area"])

    def test_organiser_cannot_submit_a_direct_radar_override(self):
        for forbidden_key in ("radar_area", "radarArea", "radar_percentage", "radar_split"):
            with self.subTest(forbidden_key=forbidden_key):
                with self.assertRaisesRegex(ServiceError, "derived automatically"):
                    OrganizerEventService.create_or_update_event.__wrapped__(
                        {forbidden_key: "Community"},
                        93000,
                    )

    def test_organiser_listing_dimensions_are_validated_and_persisted(self):
        with self.app.app_context():
            organizer = Users(
                id=92901,
                role_type=3,
                first_name="Listing",
                last_name="Organiser",
                country_code="+44",
                mobile_number="92901",
                email_id="listing-organizer@local.test",
            )
            category = Category(id=92901, title="Test listing type", home_view=True)
            other_category = Category(id=92902, title="Other listing type", home_view=True)
            topic = SubCategory(
                id=92901,
                category_id=category.id,
                title="Test topic",
                status=1,
                created_by=organizer.id,
            )
            language = Language(id=92901, title="Test language", status=1)
            level = JourneyLevel(id=92901, title="Test suitability", status=1)
            db.session.add_all([organizer, category, other_category, topic, language, level])
            db.session.commit()

            valid = {
                "category_id": category.id,
                "sub_category_id": topic.id,
                "language_id": language.id,
                "journey_level_id": level.id,
                "gender": 3,
                "location_type": 2,
                "location": "Reference venue",
                "meet_link": "https://example.test/session",
            }
            normalized = OrganizerEventService.validate_listing_dimensions(valid)
            self.assertEqual(normalized["language_id"], language.id)
            self.assertEqual(normalized["gender"], 3)
            self.assertEqual(normalized["location_type"], 2)

            with self.assertRaisesRegex(ServiceError, "does not belong"):
                OrganizerEventService.validate_listing_dimensions({
                    **valid,
                    "category_id": 92902,
                })
            with self.assertRaisesRegex(ServiceError, "Meeting link"):
                OrganizerEventService.validate_listing_dimensions({
                    **valid,
                    "meet_link": "",
                })
            with self.assertRaisesRegex(ServiceError, "Audience"):
                OrganizerEventService.validate_listing_dimensions({
                    **valid,
                    "gender": 0,
                })

            complete_payload = {
                **valid,
                "title": "Reference listing",
                "start_date": "2026-09-03",
                "end_date": "2026-09-03",
                "start_time": "10:00",
                "end_time": "11:00",
            }
            with self.app.test_request_context(headers={"Timezone": "Europe/London"}):
                event_data = OrganizerEventService.build_event_data(complete_payload, organizer.id)
            self.assertEqual(event_data["language_id"], language.id)
            self.assertEqual(event_data["gender"], 3)
            self.assertEqual(event_data["location_type"], 2)

    def test_free_ticket_types_persist_capacity_and_enforce_per_user_limit(self):
        """The organiser ticket editor and free User booking share one contract."""
        with self.app.app_context():
            organizer = Users(
                id=92801,
                role_type=3,
                first_name="Ticket",
                last_name="Organiser",
                country_code="+44",
                mobile_number="92801",
                email_id="ticket-organizer@local.test",
            )
            customer = Users(
                id=92802,
                role_type=2,
                first_name="Ticket",
                last_name="Customer",
                country_code="+44",
                mobile_number="92802",
                email_id="ticket-customer@local.test",
            )
            category = Category(id=92801, title="Ticket listing", home_view=True, status=1)
            topic = SubCategory(id=92801, category_id=category.id, title="Ticket topic", status=1)
            event = Event(
                id=92801,
                user_id=organizer.id,
                title="Free ticket reference listing",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2028, 9, 1),
                end_date=datetime(2028, 9, 1),
                start_time=time(18, 0),
                end_time=time(19, 0),
                event_type=1,
                price_type=0,
                price=0,
                location_type=1,
                location="Reference venue",
                available=10,
                booked=0,
                quantity_per_user=5,
                ticket_type=1,
                qrcode_type=0,
                occusr_type=1,
                status=1,
                created_by=organizer.id,
                updated_by=organizer.id,
            )
            db.session.add_all([organizer, customer, category, topic, event])
            db.session.commit()

            OrganizerEventService.process_tickets(
                [{"title": "General Admission", "price": 0, "available": 3, "max_per_user": 1}],
                event.id,
                organizer.id,
                {"quantity_per_user": 5},
            )
            ticket = EventTicket.query.filter_by(event_id=event.id).one()
            self.assertEqual(ticket.available, 3)
            self.assertEqual(ticket.max_per_user, 1)
            self.assertEqual(
                EventRepo.get_tickets_by_event_id(event.id)[0]["max_per_user"],
                1,
            )

            with patch(
                "app.repositories.event.upload_base64_file",
                return_value={"url": "http://local.test/uploads/ticket.png"},
            ), patch(
                "app.repositories.event.create_pdf_file",
                return_value="http://local.test/uploads/ticket.pdf",
            ), patch.object(EventRepo, "add_participant_notification"):
                EventService.add_participant.__wrapped__(
                    customer.id,
                    {"event_id": event.id, "tickets": [{"id": ticket.id, "quantity": 1}]},
                )
                with self.assertRaisesRegex(ServiceError, "for this ticket type"):
                    EventService.add_participant.__wrapped__(
                        customer.id,
                        {"event_id": event.id, "tickets": [{"id": ticket.id, "quantity": 1}]},
                    )

            self.assertEqual(Participant.query.filter_by(event_id=event.id).count(), 1)
            self.assertEqual(EventTicket.query.get(ticket.id).booked, 1)

    def test_organiser_recurrence_generates_only_real_sessions(self):
        weekly_dates = OrganizerEventService.occurrence_dates(
            "2026-09-01",
            "2026-09-30",
            3,
            "2,4",
        )
        self.assertEqual(
            weekly_dates,
            [
                date(2026, 9, 2),
                date(2026, 9, 4),
                date(2026, 9, 9),
                date(2026, 9, 11),
                date(2026, 9, 16),
                date(2026, 9, 18),
                date(2026, 9, 23),
                date(2026, 9, 25),
                date(2026, 9, 30),
            ],
        )
        self.assertEqual(
            OrganizerEventService.occurrence_dates("2026-09-01", "2026-09-03", 2),
            [date(2026, 9, 1), date(2026, 9, 2), date(2026, 9, 3)],
        )
        self.assertEqual(
            OrganizerEventService.occurrence_dates("2026-09-15", "2026-12-31", 4),
            [date(2026, 9, 15), date(2026, 10, 15), date(2026, 11, 15), date(2026, 12, 15)],
        )
        with self.assertRaisesRegex(ServiceError, "at least one day"):
            OrganizerEventService.occurrence_dates("2026-09-01", "2026-09-30", 3)
        with self.assertRaisesRegex(ServiceError, "same start and end"):
            OrganizerEventService.occurrence_dates("2026-09-01", "2026-09-02", 1)

        with self.app.app_context():
            organizer = Users(
                id=92701,
                role_type=3,
                country_code="+44",
                mobile_number="92701",
                email_id="schedule-organizer@local.test",
            )
            category = Category(id=92701, title="Schedule listing", home_view=True)
            topic = SubCategory(
                id=92701,
                category_id=category.id,
                title="Schedule topic",
                status=1,
                created_by=organizer.id,
            )
            level = JourneyLevel(id=92701, title="Schedule level", status=1)
            event = Event(
                id=92701,
                user_id=organizer.id,
                title="Wednesday and Friday course",
                category_id=category.id,
                sub_category_id=topic.id,
                start_date=datetime(2026, 9, 1),
                end_date=datetime(2026, 9, 30),
                start_time=time(19, 0),
                end_time=time(21, 0),
                event_type=2,
                price_type=0,
                journey_level_id=level.id,
                location_type=1,
                occusr_type=3,
                occusr_weekday="2,4",
            )
            db.session.add_all([organizer, category, topic, level, event])
            db.session.commit()

            OrganizerEventService.process_datetime(
                [{"start_time": "19:00", "end_time": "21:00", "status": 1}],
                event.id,
                organizer.id,
                {
                    "start_date": date(2026, 9, 1),
                    "end_date": date(2026, 9, 30),
                    "available": 100,
                    "time_zone": "Europe/London",
                    "occusr_type": 3,
                    "occusr_weekday": "2,4",
                    "occusr_month": 1,
                },
            )
            persisted_dates = EventDate.query.filter_by(event_id=event.id).order_by(EventDate.date).all()
            self.assertEqual([row.date for row in persisted_dates], weekly_dates)
            self.assertEqual(EventDateTime.query.filter(
                EventDateTime.event_date_id.in_([row.id for row in persisted_dates])
            ).count(), len(weekly_dates))

    def test_refs_taxonomy_sync_is_additive_and_complete(self):
        with self.app.app_context():
            creator = Users.query.order_by(Users.id.asc()).first()
            if creator is None:
                creator = Users(
                    id=92801,
                    role_type=3,
                    country_code="+44",
                    mobile_number="92801",
                    email_id="taxonomy-organizer@local.test",
                )
                db.session.add(creator)
            category_ids = {}
            for offset, title in enumerate(CANONICAL_ACTIVITY_TOPICS, start=92810):
                category = Category.query.filter_by(title=title, status=1).first()
                if category is None:
                    category = Category(id=offset, title=title, home_view=True, status=1)
                    db.session.add(category)
                category_ids[title] = category.id
            db.session.commit()

            GamificationService.ensure_storage()
            first_count = SubCategory.query.filter(
                SubCategory.category_id.in_(category_ids.values()),
                SubCategory.status == 1,
            ).count()
            GamificationService.ensure_storage()
            second_count = SubCategory.query.filter(
                SubCategory.category_id.in_(category_ids.values()),
                SubCategory.status == 1,
            ).count()
            self.assertEqual(first_count, second_count)

            for category_title, topic_titles in CANONICAL_ACTIVITY_TOPICS.items():
                existing = {
                    row.title
                    for row in SubCategory.query.filter_by(
                        category_id=category_ids[category_title],
                        status=1,
                    ).all()
                }
                self.assertTrue(set(topic_titles).issubset(existing))

            self.assertIsNotNone(Language.query.filter_by(title="English", status=1).first())
            self.assertIsNotNone(Language.query.filter_by(title="Arabic", status=1).first())

    def test_streak_miss_state_dims_then_embers_then_resets(self):
        self.assertEqual(GamificationService.streak_after_miss(6, 1), (6, "dimmed", 1.0))
        self.assertEqual(GamificationService.streak_after_miss(6, 2), (6, "ember", 1.0))
        self.assertEqual(GamificationService.streak_after_miss(6, 3), (0, "none", 1.0))

    def test_verified_activity_is_idempotent_and_drives_radar_from_immutable_snapshot(self):
        with self.app.app_context():
            organizer = Users(
                id=93001,
                role_type=3,
                first_name="Test",
                last_name="Organiser",
                country_code="+44",
                mobile_number="93001",
                email_id="gamification-organizer@local.test",
            )
            attendee = Users(
                id=93002,
                role_type=2,
                first_name="Test",
                last_name="Attendee",
                country_code="+44",
                mobile_number="93002",
                email_id="gamification-attendee@local.test",
            )
            category = Category(id=93001, title="Courses", home_view=True)
            subcategory = SubCategory(id=93001, category_id=93001, title="Tafsir", created_by=93001)
            level = JourneyLevel(id=93001, title="Intermediate")
            db.session.add_all([organizer, attendee, category, subcategory, level])
            db.session.flush()

            event = Event(
                id=93001,
                user_id=organizer.id,
                title="Immutable Tafsir Test",
                category_id=category.id,
                sub_category_id=subcategory.id,
                start_date=datetime(2026, 9, 2, 10, 0),
                end_date=datetime(2026, 9, 2, 12, 0),
                start_time=time(10, 0),
                end_time=time(12, 0),
                event_type=1,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=1,
                location_type=1,
                duration=2,
                occusr_type=1,
                time_zone="Europe/London",
            )
            db.session.add(event)
            db.session.flush()
            participant = Participant(event_id=event.id, user_id=attendee.id, status=1)
            db.session.add(participant)
            db.session.flush()
            attendance = ParticipantsAttendance(
                participant_id=participant.id,
                event_id=event.id,
                attendance_date=date.today(),
                status=1,
            )
            db.session.add(attendance)
            db.session.commit()

            first = GamificationService.award_check_in(attendee.id, attendance, source="validated")
            second = GamificationService.award_check_in(attendee.id, attendance, source="validated")
            self.assertEqual(first["id"], second["id"])
            self.assertEqual(
                GamificationXpLog.query.filter_by(attendance_id=attendance.id).count(),
                1,
            )

            log = GamificationXpLog.query.filter_by(attendance_id=attendance.id).one()
            self.assertEqual(log.verification_source, "validated")
            self.assertEqual(log.topic_id, "TAFSIR")
            self.assertEqual(log.topic_title, "Tafsir")
            self.assertEqual(log.radar_area, "Knowledge")
            self.assertEqual(log.suitability, "Intermediate")
            self.assertFalse(log.is_recurring)
            self.assertEqual(log.session_hours, 2)

            profile = UserGamification.query.filter_by(user_id=attendee.id).one()
            self.assertEqual(profile.total_sessions, 1)
            earned_xp = profile.total_xp
            radar = GamificationService.radar_payload(attendee.id)
            knowledge = next(axis for axis in radar if axis["label"] == "Knowledge")
            self.assertEqual(knowledge["hours"], 2)
            self.assertEqual(knowledge["score"], 25)
            self.assertEqual(subcategory.topic_key, "TAFSIR")
            self.assertEqual(subcategory.radar_area, "Knowledge")

            bonus_attendance = ParticipantsAttendance(
                participant_id=participant.id,
                event_id=event.id,
                attendance_date=date.today() + timedelta(days=1),
                status=1,
            )
            db.session.add(bonus_attendance)
            db.session.flush()
            db.session.add(GamificationXpLog(
                user_id=attendee.id,
                event_id=event.id,
                participant_id=participant.id,
                attendance_id=bonus_attendance.id,
                xp_type="future_challenge_bonus",
                event_title="Future bonus",
                session_hours=99,
                radar_area="Knowledge",
                total_xp=500,
                created_on=datetime.utcnow(),
            ))
            db.session.add(GamificationXpLog(
                user_id=attendee.id,
                event_id=None,
                participant_id=None,
                attendance_id=None,
                xp_type="donation",
                event_title="Donation without attendance",
                session_hours=99,
                radar_area="Community",
                total_xp=0,
                created_on=datetime.utcnow(),
            ))
            db.session.commit()

            radar_after_bonus = GamificationService.radar_payload(attendee.id)
            knowledge_after_bonus = next(axis for axis in radar_after_bonus if axis["label"] == "Knowledge")
            community_after_donation = next(axis for axis in radar_after_bonus if axis["label"] == "Community")
            self.assertEqual(knowledge_after_bonus["hours"], 2)
            self.assertEqual(knowledge_after_bonus["score"], 25)
            self.assertEqual(community_after_donation["hours"], 0)
            self.assertEqual(community_after_donation["score"], 0)
            self.assertEqual(UserGamification.query.filter_by(user_id=attendee.id).one().total_xp, earned_xp)

    def test_booked_recurring_misses_are_reconciled_once_per_session(self):
        with self.app.app_context():
            organizer = Users(
                id=93101,
                role_type=3,
                country_code="+44",
                mobile_number="93101",
                email_id="streak-organizer@local.test",
            )
            attendee = Users(
                id=93102,
                role_type=2,
                country_code="+44",
                mobile_number="93102",
                email_id="streak-attendee@local.test",
            )
            category = Category(id=93101, title="Courses", home_view=True)
            subcategory = SubCategory(id=93101, category_id=93101, title="Hadith", created_by=93101)
            level = JourneyLevel(id=93101, title="Suitable for all")
            db.session.add_all([organizer, attendee, category, subcategory, level])
            db.session.flush()
            event = Event(
                id=93101,
                user_id=organizer.id,
                title="Recurring Hadith Test",
                category_id=category.id,
                sub_category_id=subcategory.id,
                start_date=datetime(2026, 1, 1),
                end_date=datetime(2026, 1, 31),
                start_time=time(10, 0),
                end_time=time(11, 0),
                event_type=2,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=4,
                location_type=1,
                duration=1,
                occusr_type=3,
                time_zone="UTC",
            )
            db.session.add(event)
            db.session.flush()
            participant = Participant(event_id=event.id, user_id=attendee.id, status=1)
            db.session.add(participant)
            db.session.flush()
            db.session.add_all([
                ParticipantsAttendance(participant_id=participant.id, event_id=event.id, attendance_date=date(2026, 1, 1), status=1),
                ParticipantsAttendance(participant_id=participant.id, event_id=event.id, attendance_date=date(2026, 1, 8), status=0),
                ParticipantsAttendance(participant_id=participant.id, event_id=event.id, attendance_date=date(2026, 1, 15), status=0),
                ParticipantsAttendance(participant_id=participant.id, event_id=event.id, attendance_date=date(2026, 1, 22), status=0),
            ])
            db.session.add(UserGamification(user_id=attendee.id, current_streak=6, longest_streak=6))
            db.session.add(GamificationStreak(
                user_id=attendee.id,
                event_id=event.id,
                current_count=6,
                longest_count=6,
                state="strong",
                multiplier=1.5,
            ))
            db.session.commit()

            reconciled = GamificationService.reconcile_missed_sessions(
                attendee.id,
                as_of=datetime(2026, 1, 23, 12, 0, tzinfo=ZoneInfo("UTC")),
            )
            self.assertEqual(len(reconciled), 3)
            streak = GamificationStreak.query.filter_by(user_id=attendee.id, event_id=event.id).one()
            self.assertEqual((streak.current_count, streak.missed_count, streak.state), (0, 3, "none"))
            self.assertEqual(GamificationStreakMiss.query.filter_by(user_id=attendee.id).count(), 3)

            self.assertEqual(
                GamificationService.reconcile_missed_sessions(
                    attendee.id,
                    as_of=datetime(2026, 1, 23, 12, 0, tzinfo=ZoneInfo("UTC")),
                ),
                [],
            )
            self.assertEqual(GamificationStreakMiss.query.filter_by(user_id=attendee.id).count(), 3)

    def test_course_bonus_is_awarded_after_course_end_even_when_final_session_was_missed(self):
        with self.app.app_context():
            organizer = Users(
                id=93201,
                role_type=3,
                country_code="+44",
                mobile_number="93201",
                email_id="course-organizer@local.test",
            )
            attendee = Users(
                id=93202,
                role_type=2,
                country_code="+44",
                mobile_number="93202",
                email_id="course-attendee@local.test",
            )
            category = Category(id=93201, title="Courses", home_view=True)
            subcategory = SubCategory(id=93201, category_id=93201, title="Fiqh", created_by=93201)
            level = JourneyLevel(id=93201, title="Intermediate")
            db.session.add_all([organizer, attendee, category, subcategory, level])
            db.session.flush()
            event = Event(
                id=93201,
                user_id=organizer.id,
                title="Ten Session Fiqh Course",
                category_id=category.id,
                sub_category_id=subcategory.id,
                start_date=datetime(2026, 1, 1),
                end_date=datetime(2026, 1, 10),
                start_time=time(10, 0),
                end_time=time(11, 0),
                event_type=2,
                price_type=0,
                journey_level_id=level.id,
                total_no_class=10,
                location_type=1,
                duration=1,
                occusr_type=2,
                time_zone="UTC",
            )
            db.session.add(event)
            db.session.flush()
            participant = Participant(event_id=event.id, user_id=attendee.id, status=1)
            db.session.add(participant)
            db.session.flush()

            attendance_rows = []
            for offset in range(10):
                attendance_rows.append(ParticipantsAttendance(
                    participant_id=participant.id,
                    event_id=event.id,
                    attendance_date=date(2026, 1, 1) + timedelta(days=offset),
                    status=1 if offset < 8 else 0,
                ))
            db.session.add_all(attendance_rows)
            db.session.flush()
            db.session.add(UserGamification(
                user_id=attendee.id,
                total_xp=400,
                level=2,
                tier_key="seeker",
                tier_name="Seeker",
                tier_sublevel=2,
                total_sessions=8,
                lifetime_hours=8,
                first_class_awarded=True,
            ))
            db.session.add(GamificationXpLog(
                user_id=attendee.id,
                event_id=event.id,
                participant_id=participant.id,
                attendance_id=attendance_rows[7].id,
                xp_type="check_in",
                event_title=event.title,
                category_title="Course",
                session_date=attendance_rows[7].attendance_date,
                session_hours=1,
                journey_level="Intermediate",
                verification_source="validated",
                topic_id="FIQH",
                topic_title="Fiqh",
                radar_area="Knowledge",
                suitability="Intermediate",
                is_recurring=True,
                base_xp=50,
                total_xp=50,
                previous_total_xp=350,
                new_total_xp=400,
                previous_level=1,
                new_level=2,
            ))
            db.session.commit()

            awarded = GamificationService.award_due_course_completion_bonuses(
                attendee.id,
                as_of=datetime(2026, 1, 11, 12, 0, tzinfo=ZoneInfo("UTC")),
            )
            self.assertEqual(len(awarded), 1)
            bonus_log = GamificationXpLog.query.filter_by(
                user_id=attendee.id,
                participant_id=participant.id,
                xp_type="course_completion_bonus",
            ).one()
            self.assertEqual(bonus_log.milestone_xp, 1750)
            self.assertEqual(bonus_log.session_hours, 0)
            self.assertEqual(UserGamification.query.filter_by(user_id=attendee.id).one().total_xp, 2150)
            self.assertEqual(
                GamificationService.award_due_course_completion_bonuses(
                    attendee.id,
                    as_of=datetime(2026, 1, 11, 12, 0, tzinfo=ZoneInfo("UTC")),
                ),
                [],
            )
            self.assertEqual(GamificationXpLog.query.filter_by(user_id=attendee.id).count(), 2)


if __name__ == "__main__":
    unittest.main()
