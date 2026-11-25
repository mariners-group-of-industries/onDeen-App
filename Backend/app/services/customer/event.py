from app.repositories.event import EventRepo
from app.repositories.wishlist import WishlistRepository
from app.repositories.organizer import OrganizerRepository
from app.repositories.speakers import SpeakerRepository
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from datetime import datetime,date,time,timedelta
from math import radians, sin, cos, sqrt, atan2
from app.repositories.category import CategoryRepository
from app.repositories.subcategory import SubCategoryRepository
from app.utils.load_notification_template import load_push_notification_template
from app.repositories.user import user
from app.services.customer.gamification import GamificationService
from app.services.online_checkin import OnlineCheckInService
from app.utils.public_links import public_open_path_url, public_open_url
from app import db
from app.models.event import EventGuestBookingSetting, Participant, ParticipantQrcode, PaymentTransaction
from app.services.event_ticket_storage import ensure_event_ticket_storage
from app.models.guest_booking import GuestBooking
from app.models.users import Users
from app.services.one_to_one import OneToOneService
import base64
from flask import request
from zoneinfo import ZoneInfo
from werkzeug.security import generate_password_hash
from sqlalchemy import func as sa_func, null as sa_null
import os
import calendar
import hashlib
import re
import secrets


def haversine(lat1, lng1, lat2, lng2):
        # Radius of the Earth in meters
        R = 6371000  

        # Convert latitude and longitude from degrees to radians
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])

        # Differences in coordinates
        dlat = lat2 - lat1
        dlng = lng2 - lng1

        # Haversine formula
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlng / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        # Distance in meters
        distance = R * c
        return distance


class EventService:
    PUBLIC_PARTICIPANT_FIELDS = (
        "participant_id",
        "user_id",
        "event_id",
        "first_name",
        "last_name",
        "profile_image",
        "is_mine",
        "request_buddy_id",
        "buddy_id",
        "buddy_first_name",
        "buddy_last_name",
    )

    @staticmethod
    def _public_profile_payload(user_obj):
        """Return only profile fields the target user elected to share."""
        profile = dict(user_obj or {})

        # These fields are never part of another attendee's public profile.
        for field in ("email_id", "gender", "age", "dob", "membership_count", "status"):
            profile.pop(field, None)

        if not profile.get("show_mobile_number"):
            profile.pop("country_code", None)
            profile.pop("mobile_number", None)

        if not profile.get("show_journeylevel"):
            profile.pop("journey_level_id", None)
            profile.pop("journey_level_title", None)

        if not profile.get("show_events"):
            profile.pop("event_count", None)
            profile.pop("tour_count", None)

        if not profile.get("show_course"):
            profile.pop("course_count", None)

        if not profile.get("show_reviews"):
            profile.pop("rating_count", None)
            profile.pop("avg_rating", None)

        visible_event_count = profile.get("event_count", 0) or 0
        visible_course_count = profile.get("course_count", 0) or 0
        visible_tour_count = profile.get("tour_count", 0) or 0
        profile["attended_count"] = visible_event_count + visible_course_count + visible_tour_count
        return profile

    @staticmethod
    def _public_participant_payload(participant_obj):
        """Limit a customer-facing participant row to list and buddy UI fields."""
        participant = dict(participant_obj or {})
        return {
            field: participant.get(field)
            for field in EventService.PUBLIC_PARTICIPANT_FIELDS
            if field in participant
        }

    @staticmethod
    def _has_booking(user_id, event_id):
        if not user_id or not event_id:
            return False
        return Participant.query.filter(
            Participant.user_id == user_id,
            Participant.event_id == event_id,
            Participant.status > 0,
        ).first() is not None

    @staticmethod
    def _require_booking(user_id, event_id):
        if not EventService._has_booking(user_id, event_id):
            raise ServiceError('Not booked')

    @staticmethod
    def _guest_log(message):
        print(f"[guest-booking] {message}", flush=True)

    @staticmethod
    def _ensure_guest_booking_table():
        bind = db.session.get_bind()
        if bind is not None:
            GuestBooking.__table__.create(bind=bind, checkfirst=True)
            EventGuestBookingSetting.__table__.create(bind=bind, checkfirst=True)

    @staticmethod
    def _guest_booking_enabled(event_id):
        setting = EventGuestBookingSetting.query.filter_by(event_id=event_id).first()
        return True if setting is None else bool(setting.enabled)

    @staticmethod
    def _normalize_guest_email(value):
        return (value or "").strip().lower()

    @staticmethod
    def _normalize_guest_mobile(value):
        return re.sub(r"\s+", "", str(value or "").strip())

    @staticmethod
    def _normalize_guest_country_code(value):
        value = str(value or "+44").strip()
        return value if value.startswith("+") else f"+{value}"

    @staticmethod
    def _guest_lookup(event_id, email_id, country_code, mobile_number):
        return GuestBooking.query.filter_by(
            event_id=event_id,
            email_id=email_id,
            country_code=country_code,
            mobile_number=mobile_number,
            status=1,
        ).first()

    @staticmethod
    def _validate_guest_request(request_data):
        event_id = request_data.get("event_id")
        first_name = str(request_data.get("first_name") or request_data.get("name") or "").strip()
        last_name = str(request_data.get("last_name") or "").strip()
        email_id = EventService._normalize_guest_email(request_data.get("email_id") or request_data.get("email"))
        country_code = EventService._normalize_guest_country_code(request_data.get("country_code"))
        mobile_number = EventService._normalize_guest_mobile(request_data.get("mobile_number") or request_data.get("phone"))

        if not event_id:
            raise ServiceError("Event ID is required")
        if not first_name:
            raise ServiceError("Guest name is required")
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email_id):
            raise ServiceError("Valid guest email is required")
        if not re.match(r"^\+?[0-9]{6,15}$", mobile_number):
            raise ServiceError("Valid guest mobile number is required")

        return int(event_id), first_name, last_name, email_id, country_code, mobile_number

    @staticmethod
    def _is_guest_booking_course(event):
        return (
            int(event.category_id or 0) == 2
            or int(event.event_type or 0) == 2
            or int(event.total_no_class or 0) > 1
            or int(event.occusr_type or 0) != 1
        )

    @staticmethod
    def _get_or_create_guest_shadow_user(first_name, last_name, email_id, country_code, mobile_number):
        key = hashlib.sha256(f"{email_id}|{country_code}|{mobile_number}".encode("utf-8")).hexdigest()[:20]
        shadow_email = f"guest-{key}@ondeen.local"
        shadow_mobile = f"guest-{key}"

        shadow_user = Users.query.filter_by(role_type=2, email_id=shadow_email).first()
        if shadow_user:
            shadow_user.first_name = first_name
            shadow_user.last_name = last_name
            shadow_user.updated_on = datetime.utcnow()
            db.session.flush()
            return shadow_user

        shadow_user = Users(
            role_type=2,
            first_name=first_name,
            last_name=last_name,
            country_code=country_code,
            mobile_number=shadow_mobile,
            email_id=shadow_email,
            password=generate_password_hash(secrets.token_urlsafe(24), method="pbkdf2:sha256"),
            status=0,
            # Users.journey_level_id has a legacy default of 0, but Railway's
            # journey_level table has no sentinel row. Guest shadow accounts
            # must remain progression-neutral and therefore carry NULL here.
            # SQLAlchemy applies the column's legacy Python default even when
            # ``None`` is supplied, so use an explicit SQL NULL expression to
            # bypass that sentinel while preserving the nullable FK.
            journey_level_id=sa_null(),
            created_by=0,
            updated_by=0,
        )
        db.session.add(shadow_user)
        db.session.flush()
        return shadow_user

    @staticmethod
    def _guest_booking_response(guest_booking, participant, event, existing=False, migrated=False):
        data = {
            "ticket_no": f"{participant.id}0",
            "participant_id": participant.id,
            "ticket_date": participant.date,
            "ticket_start_time": participant.start_time.strftime("%H:%M:%S") if participant.start_time else None,
            "ticket_end_time": participant.end_time.strftime("%H:%M:%S") if participant.end_time else None,
            "event_id": participant.event_id,
            "user_id": participant.user_id,
            "qrcode": participant.qrcode,
            "qrcode_path": participant.qrcode_path,
            "ticket": participant.ticket,
            "category_id": event.category_id,
            "event_title": event.title,
            "time_zone": event.time_zone,
            "meet_link": event.meet_link,
            "location_type": event.location_type,
            "event_price": float(participant.paid_amount or 0),
            "event_start_date": event.start_date,
            "event_end_date": event.end_date,
            "event_start_time": event.start_time.strftime("%H:%M:%S") if event.start_time else None,
            "event_end_time": event.end_time.strftime("%H:%M:%S") if event.end_time else None,
            "occusr_type": event.occusr_type,
            "occusr_month": event.occusr_month,
            "occusr_weekday": event.occusr_weekday,
            "event_address": event.location,
            "guest_booking": {
                "id": guest_booking.id,
                "first_name": guest_booking.first_name,
                "last_name": guest_booking.last_name,
                "email_id": guest_booking.email_id,
                "country_code": guest_booking.country_code,
                "mobile_number": guest_booking.mobile_number,
                "existing": existing,
                "migrated": migrated,
                "earns_xp": False,
            },
        }
        data["participants"] = EventRepo.get_participant_data_all_byid(participant.id, participant.user_id)
        return data

    @staticmethod
    @handle_service_errors
    def add_guest_participant(request_data, ip_address=None):
        EventService._ensure_guest_booking_table()
        ensure_event_ticket_storage()
        request_data = request_data or {}
        event_id, first_name, last_name, email_id, country_code, mobile_number = EventService._validate_guest_request(request_data)
        EventService._guest_log(f"request event_id={event_id} email={email_id} mobile={country_code}{mobile_number} ip={ip_address or '-'}")

        # Lock the event for the complete validation + participant write. This
        # serializes competing capacity checks on PostgreSQL/MySQL while
        # preserving the existing SQLite test behavior.
        event = EventRepo.get_event_for_booking(event_id)
        if not event or event.status != 1:
            EventService._guest_log(f"rejected event_id={event_id} reason=invalid_or_inactive")
            raise ServiceError("Invalid or inactive event")
        if not EventService._guest_booking_enabled(event_id):
            EventService._guest_log(f"rejected event_id={event_id} reason=disabled_by_organizer")
            raise ServiceError("Guest booking is disabled for this event.")
        if EventService._is_guest_booking_course(event):
            EventService._guest_log(f"rejected event_id={event_id} reason=course_or_recurring")
            raise ServiceError("Guest booking is available for one-off events only. Please sign in for courses.")

        existing_booking = EventService._guest_lookup(event_id, email_id, country_code, mobile_number)
        if existing_booking:
            participant = db.session.get(Participant, existing_booking.participant_id)
            if participant and participant.status > 0:
                EventService._guest_log(f"existing event_id={event_id} guest_booking_id={existing_booking.id} participant_id={participant.id}")
                return EventService._guest_booking_response(existing_booking, participant, event, existing=True)

        if ip_address:
            window_start = datetime.utcnow() - timedelta(hours=1)
            booking_count = GuestBooking.query.filter(
                GuestBooking.ip_address == ip_address,
                GuestBooking.created_on >= window_start,
            ).count()
            if booking_count >= 5:
                EventService._guest_log(f"rejected event_id={event_id} reason=rate_limit ip={ip_address}")
                raise ServiceError("Too many guest bookings. Please try again later.")

        shadow_user = EventService._get_or_create_guest_shadow_user(
            first_name,
            last_name,
            email_id,
            country_code,
            mobile_number,
        )

        booking_payload = {
            "event_id": event_id,
            "quantity": int(request_data.get("quantity") or 1),
            "payment_method": request_data.get("payment_method", "guest"),
        }
        if request_data.get("tickets"):
            booking_payload["tickets"] = request_data.get("tickets")
        if request_data.get("date_time_id"):
            booking_payload["date_time_id"] = request_data.get("date_time_id")

        if event.price_type == 1:
            from app.services.payment import PaymentService
            booking_payload.update({
                "idempotency_key": request_data.get("idempotency_key"),
                "guest_first_name": first_name,
                "guest_last_name": last_name,
            })
            result = PaymentService.create_order(
                shadow_user.id,
                booking_payload,
                guest={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email_id": email_id,
                    "country_code": country_code,
                    "mobile_number": mobile_number,
                    "ip_address": ip_address,
                },
            )
            result["event_id"] = event.id
            result["event_title"] = event.title
            result["guest_booking_pending"] = True
            return result

        participant_response = EventService.add_participant(shadow_user.id, booking_payload)
        if isinstance(participant_response, tuple):
            body = participant_response[0] if participant_response else {}
            message = body.get("response", {}).get("message") if isinstance(body.get("response"), dict) else None
            EventService._guest_log(f"failed event_id={event_id} reason={message or 'booking_failed'}")
            raise ServiceError(message or "Guest booking failed")

        participant = db.session.get(Participant, participant_response["participant_id"])
        guest_booking = GuestBooking(
            event_id=event_id,
            participant_id=participant.id,
            shadow_user_id=shadow_user.id,
            first_name=first_name,
            last_name=last_name,
            email_id=email_id,
            country_code=country_code,
            mobile_number=mobile_number,
            ip_address=ip_address,
            status=1,
        )
        db.session.add(guest_booking)
        db.session.commit()

        EventService._guest_log(f"created event_id={event_id} guest_booking_id={guest_booking.id} participant_id={participant.id}")
        response = EventService._guest_booking_response(guest_booking, participant, event)
        for key in ("payment_transaction_id", "payment_status", "client_secret", "payment_intent_id"):
            if key in participant_response:
                response[key] = participant_response[key]
        return response

    @staticmethod
    @handle_service_errors
    def migrate_guest_bookings(session_id, request_data):
        EventService._ensure_guest_booking_table()
        request_data = request_data or {}
        email_id = EventService._normalize_guest_email(request_data.get("email_id") or request_data.get("email"))
        country_code = EventService._normalize_guest_country_code(request_data.get("country_code"))
        mobile_number = EventService._normalize_guest_mobile(request_data.get("mobile_number") or request_data.get("phone"))

        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email_id):
            raise ServiceError("Valid guest email is required")
        if not re.match(r"^\+?[0-9]{6,15}$", mobile_number):
            raise ServiceError("Valid guest mobile number is required")

        bookings = GuestBooking.query.filter_by(
            email_id=email_id,
            country_code=country_code,
            mobile_number=mobile_number,
            migrated_user_id=None,
            status=1,
        ).all()

        migrated_participant_ids = []
        for guest_booking in bookings:
            participant = db.session.get(Participant, guest_booking.participant_id)
            if not participant:
                continue

            participant.user_id = session_id
            participant.updated_on = datetime.utcnow()
            ParticipantQrcode.query.filter_by(participant_id=participant.id).update({"user_id": session_id})
            PaymentTransaction.query.filter_by(participant_id=participant.id).update({"user_id": session_id})
            guest_booking.migrated_user_id = session_id
            guest_booking.migrated_on = datetime.utcnow()
            guest_booking.updated_on = datetime.utcnow()
            migrated_participant_ids.append(participant.id)

        db.session.commit()
        EventService._guest_log(f"migrated user_id={session_id} count={len(migrated_participant_ids)} email={email_id}")
        return {
            "migrated_count": len(migrated_participant_ids),
            "participant_ids": migrated_participant_ids,
            "message": "Guest bookings imported. Past attendance will not grant retroactive XP.",
        }
    
    
    @staticmethod
    @handle_service_errors
    def question_and_answers(session,event_id):
        EventService._require_booking(session, event_id)
        data= EventRepo.question_and_answers(session,event_id,2,2)
        return data
    
    
    @staticmethod
    @handle_service_errors
    def journey_levels(session):
        data= EventRepo.journey_levels(session,2)
        return [
            {**level, "purpose": "learning_preference"}
            for level in data
            if str(level.get("title") or "").strip().lower() != "suitable for all"
        ]
    
    
    
    @staticmethod
    @handle_service_errors
    def add_event_question(request_data,session_id):    
        request_data = dict(request_data or {})
        event_id = request_data.get('event_id')
        question = (request_data.get('question') or '').strip()
        if not question:
            raise ServiceError("Question is required")
        EventService._require_booking(session_id, event_id)
        request_data['question'] = question
        anonymous_value = request_data.get('is_anonymous', False)
        request_data['is_anonymous'] = anonymous_value is True or str(anonymous_value).strip().lower() in (
            '1', 'true', 'yes', 'on'
        )
        obj = EventRepo.add_event_question(request_data,session_id)
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError("Unable to added Question")

        return {"message": "Your question has been added successfully! Thank you for your submission. We will review it and get back to you."}
        #return {"message": "Question added successfully"}
    
    

    #  //////////////////////////// event note ////////////////////////

    @staticmethod
    @handle_service_errors
    def event_note_add(request_data,session_id):
        # Extract event_id and note from request_data
        event_id = request_data.get('event_id')
        note = request_data.get('note')
        title = request_data.get('title')
        id = request_data.get('id')
        
        if not event_id:
            raise ServiceError("Event ID is required")
        
        if not title:
            raise ServiceError("Title is required")
        
        if not note:
            raise ServiceError("Note is required")

        EventService._require_booking(session_id, event_id)

        # Retrieve event to ensure it exists and is active.
        event = EventRepo.get_event_by_id(event_id)
        if not event or event.status != 1:
            raise ServiceError("Invalid or inactive event")
        

        # Prepare event note data
        event_note_data = {
            'event_id': event_id,
            'user_id': session_id,
            'notes': note,
            'title': title,
            'created_by': session_id,
            'status': 1
        }


        if id:
            owned_note = EventRepo.get_event_note_byid({'id': id}, session_id)
            if not owned_note or owned_note.event_id != event_id:
                raise ServiceError("Note not found")
            event_note = EventRepo.update_event_note(id, event_note_data)
        else:
            event_note = EventRepo.add_event_note(event_note_data)
        

        return {"message": "Updated Successfully" if id else "Created Successfully"}
    



    @staticmethod
    @handle_service_errors
    def get_all_event_note(request_data,session_id):
        EventService._require_booking(session_id, request_data.get('event_id'))
        customers = EventRepo.get_all_event_notes(request_data,session_id)
        return customers
    
    
    
     
    @staticmethod
    @handle_service_errors
    def get_event_note_byid(request_data,session_id):
        data = EventRepo.get_event_note_byid(request_data,session_id)

        from datetime import datetime

        if not data:
            raise ValueError("data not found")

        # Build customer details response
        data_details = {
            "id": data.id,
            "event_id": data.event_id,
            "notes": data.notes,
            "title": data.title,
            "created_on": data.created_on,
        }

        return data_details
    




    @staticmethod
    @handle_service_errors
    def event_note_delete(request_data, session_id):
         
        id = request_data.get('id')

        if not id: 
            raise ValueError("Valid 'id'  soft deleting a data.")

        # Fetch the customer by ID
        customer_obj = EventRepo.get_event_note_byid(request_data,session_id)
        if not customer_obj:
            raise ValueError("data not found.")

        # Update customer status to 3 (soft deleted)
        request_data = {'status': 3, 'updated_by': session_id}
        EventRepo.update_event_note(id, request_data)

        return {"message": f" Deleted successfully."}
        #return {"message": f" ID {id} soft deleted successfully."}
    
    
    
    

    
    

     

    @staticmethod
    @handle_service_errors
    def search_trending(request_data):
        
        obj= EventRepo.search_trending(request_data)
        return obj
     

    @staticmethod
    @handle_service_errors
    def search_history(request_data):
        
        obj= EventRepo.search_history(request_data)
        return obj
    
    @staticmethod
    @handle_service_errors
    def event(request_data):
        
        obj= EventRepo.appEvent(request_data)
        nnc=user.get_new_notification_count(request_data['session_id'])
        obj["new_notification_count"]= nnc
        return obj
    
    @staticmethod
    @handle_service_errors
    def event_id(session_id,event_id,participant_id=None,search=None):
        ensure_event_ticket_storage()
        GamificationService.ensure_storage()

        event_obj = EventRepo.get_event_by_id(event_id)
        if not event_obj:
            raise ServiceError("Event not found")
        
        if search and session_id:
            EventRepo.add_event_search_history(event_id,session_id)
            
            
        count = EventRepo.request_buddy_count(session_id, event_id,1)
        request_session = EventRepo.request_buddy_count(session_id, event_id,2)
        
        event_note_count = EventRepo.event_note_count(event_id,session_id)
        
        

       
        start_time_str = event_obj.start_time.strftime('%H:%M:%S') if event_obj.start_time else None
        end_time_str = event_obj.end_time.strftime('%H:%M:%S') if event_obj.end_time else None
            
        if not event_obj.time_zone:
            event_obj.time_zone=os.getenv('d_t_z')
        user_Timezone = request.headers.get('Timezone',os.getenv('d_t_z'))
        event_Timezone = event_obj.time_zone
        current_date = datetime.now(ZoneInfo(event_Timezone))
        current_date_user = datetime.now(ZoneInfo(user_Timezone))
        
        
        # Ensure start_date and end_date are timezone-aware
        event_start_date = event_obj.start_date
        event_end_date = event_obj.end_date

        if event_start_date and event_start_date.tzinfo is None:
            event_start_date = event_start_date.replace(tzinfo=ZoneInfo(event_Timezone))
        if event_end_date and event_end_date.tzinfo is None:
            event_end_date = event_end_date.replace(tzinfo=ZoneInfo(event_Timezone))

        
        # if event_start_date and event_end_date and event_start_date < event_end_date:
        #     if current_date < event_start_date:
        #         percentage_completion = 0
        #     elif current_date > event_end_date:
        #         percentage_completion = 100
        #     else:
        #         total_duration = (event_end_date - event_start_date).total_seconds()
        #         elapsed_duration = (current_date - event_start_date).total_seconds()
        #         percentage_completion = int((elapsed_duration / total_duration) * 100)
        # else:
        #     percentage_completion = None

        # if event_start_date and event_end_date and event_start_date < event_end_date:
        #     total_days = (event_end_date - event_start_date).days + 1  # include last day
        #     if current_date.date() < event_start_date.date():
        #         percentage_completion = f"0/{total_days}"
        #     elif current_date.date() > event_end_date.date():
        #         percentage_completion = f"{total_days}/{total_days}"
        #     else:
        #         elapsed_days = (current_date.date() - event_start_date.date()).days + 1
        #         percentage_completion = f"{elapsed_days}/{total_days}"
        # else:
        #     percentage_completion = None

        if event_start_date and event_end_date and event_start_date < event_end_date:
            total, elapsed = EventService.count_occurrences(
                event_start_date.date(),
                event_end_date.date(),
                event_obj.occusr_type,
                event_obj.occusr_weekday,
                event_obj.occusr_month,
                current_date
            )
            percentage_completion = f"{elapsed}/{total}" if total else None
        else:
            percentage_completion = None
            
            
            
        # if event_obj.start_date and event_obj.end_date and event_obj.start_date < event_obj.end_date:
            # # Check if the event is in progress, completed, or not started
            # if current_date < event_obj.start_date:
                # percentage_completion = 0  # Event has not started
            # elif current_date > event_obj.end_date:
                # percentage_completion = 100  # Event has completed
            # else:
                # # Calculate percentage completion
                # total_duration = (event_obj.end_date - event_obj.start_date).total_seconds()
                # elapsed_duration = (current_date - event_obj.start_date).total_seconds()
                # percentage_completion = int((elapsed_duration / total_duration) * 100)
        # else:
            # percentage_completion = None  # Invalid dates
        
        # Build event details response
        
        event_details = {
            "id": event_obj.id,
            "share_url": event_obj.share_url,
            "request_buddy": count,
            "request_session": request_session,
            "time_zone": event_obj.time_zone,
            "user_id": event_obj.user_id,
            "title": event_obj.title,
            "ar_title": event_obj.ar_title,
            "category_id": event_obj.category_id,
            "category_title": event_obj.category.title.rstrip('s') if event_obj.category.title.endswith('s') else event_obj.category.title,
            "category_image":event_obj.category.image,
            "sub_category_id": event_obj.sub_category_id,
            "description": event_obj.description,
            "ar_description": event_obj.ar_description,
            "start_date": event_obj.start_date,
            "percentage_completion": percentage_completion,
            "end_date": event_obj.end_date,
            "start_time": start_time_str,  # Convert time to string
            "end_time": end_time_str,      # Convert time to string
            "event_type": event_obj.event_type,
            "location_type": event_obj.location_type,
            "meet_link": event_obj.meet_link,
            "location": event_obj.location,
            "latitude": event_obj.latitude,
            "longitude": event_obj.longitude,
            "to_location": event_obj.to_location,
            "to_latitude": event_obj.to_latitude,
            "to_longitude": event_obj.to_longitude,
            "price_type": event_obj.price_type,
            "city": event_obj.city,
            "duration": event_obj.duration,
            "area": event_obj.area,
            "price": event_obj.price,
            "journey_level_id": event_obj.journey_level_id,
            "total_no_class": event_obj.total_no_class,
            "call_per_week": event_obj.call_per_week,
            "rule": event_obj.rule,
            "ar_rule": event_obj.ar_rule,
            "eligibility": event_obj.eligibility,
            "ar_eligibility": event_obj.ar_eligibility,
            "cancellation_policy": event_obj.cancellation_policy,
            "ar_cancellation_policy": event_obj.ar_cancellation_policy,
            "terms_condition": event_obj.terms_condition,
            "ar_terms_condition": event_obj.ar_terms_condition,
            "status": None,
            "gender": event_obj.gender,
            "quantity_per_user": event_obj.quantity_per_user,
            "course_breakdown": event_obj.course_breakdown,
            "itinerary_breakdown": event_obj.itinerary_breakdown,
            "swipe_checkin": event_obj.swipe_checkin,
            #"checkin_range": event_obj.checkin_range,
            "checkin_range": 200,
            "occusr_type": event_obj.occusr_type,
            "occusr_month": event_obj.occusr_month,
            "occusr_weekday": event_obj.occusr_weekday,
            "booked": event_obj.booked,
            "available": event_obj.available,
            "ticket_type": event_obj.ticket_type,
            "event_note_count": event_note_count,
            "swipe_text_info": "- You can check in 15 minutes before the start time.\n\n\
- Check-in will be disabled 30 minutes after the start time.\n\n\
- Make sure to check in within this time window to be marked present.\n\n\
- Make sure you're within 200 meters of the location to check in."            
        }
        classification = GamificationService.verified_activity_dimensions(event_obj)
        event_details.update({
            "topic_id": classification["topic_id"],
            "topic_title": classification["topic_title"],
            "radar_area": classification["radar_area"],
            "radar_description": getattr(event_obj.subcategory, "classification_description", None),
        })

        if event_obj.category_id==2:
            weekday_mapping = {
                "0": "Monday", "1": "Tuesday", "2": "Wednesday", "3": "Thursday",
                "4": "Friday", "5": "Saturday", "6": "Sunday"
            }
            
            if event_obj.occusr_type == 1:
                event_details["occusr_text"] = ""
                event_details["occusr_text_pop"] = ""
            elif event_obj.occusr_type == 3:
                weekdays=""
                if event_obj.occusr_weekday:
                    weekdays = ", ".join([weekday_mapping[day] for day in event_obj.occusr_weekday.split(",")])
                weekdayscnt=len(event_obj.occusr_weekday.split(","))
                event_details["occusr_text"] = f"Every ({weekdays})"
                event_details["occusr_text_pop"] = f"This course is scheduled to take place weekly on ({weekdays})"
            elif event_obj.occusr_type == 4:
                event_details["occusr_text"] = "Happening every month"
                event_details["occusr_text_pop"] = "This course is scheduled to take place monthly"

                if event_obj.occusr_month == 1:
                    day_of_month = event_obj.start_date.day or 0
                    event_details["occusr_text"] = f"Happening every month on {day_of_month}th"
                    event_details["occusr_text_pop"] = f"This course is scheduled to take place monthly on {day_of_month}th"
                elif event_obj.occusr_month == 2:
                    day_of_month = event_obj.start_date.day
                    weekday = event_obj.start_date.weekday()
                    weekday_name = weekday_mapping[str(weekday)] or ""
                    week_position = (day_of_month - 1) // 7 + 1
                    ordinal_map = {1: "1st", 2: "2nd", 3: "3rd"}
                    ordinal = ordinal_map.get(week_position, f"{week_position}th") or 0
                    event_details["occusr_text"] = f"Happening every month on {ordinal} {weekday_name}"
                    event_details["occusr_text_pop"] = f"This course is scheduled to take place monthly on {ordinal} {weekday_name}"
            #elif event_obj.occusr_type == 2:
            else:
                event_details["occusr_text"] = "Happening Every Day"
                event_details["occusr_text_pop"] = "This course is scheduled everyday at the same time"

            #event_details["occusr_text"] = "1 class per week"
            #event_details["occusr_text_pop"] = "1 class per week"

        # Fetch related entities and include in the response
        event_details["images"] = EventRepo.get_images_by_event_id(event_id)
        event_details["tickets"] = EventRepo.get_tickets_by_event_id(event_id)
        event_details["dates"] = EventRepo.get_dates_by_event_id_user(event_id)
        event_details["tags"] = EventRepo.get_tags_by_event_id(event_id)
        event_details["curriculum"] = EventRepo.get_curriculum_by_event_id(event_id)
        event_details["facilities"] = EventRepo.get_facilities_by_event_id(event_id)
        event_details["speakers"] = EventRepo.get_speakers_by_event_id(event_id)
        event_details["documents"] = (
            EventRepo.get_documents_by_event_id(event_id)
            if EventService._has_booking(session_id, event_id)
            else []
        )
        event_details["itineraries"] = EventRepo.get_itinerary_by_event_id(event_id)
        event_details["participant_images"] = EventRepo.get_participant_images(event_id)
        event_details["total_participants_count"] = EventRepo.get_participant_count_all(event_id)

        # Convert all time objects in the response to strings
        
        # fetching relation entities
        
        #organizer_info = OrganizerRepository.get_organizer_info(event_obj.user_id,event_obj.category_id)
        event_details["organizer"] = OrganizerRepository.get_organizer_info(event_obj.user_id)
        
        if event_obj.journey_level_id or event_obj.journey_level_id==0:
            event_details["journey_level_sub_name"] = EventRepo.get_journey_level_sub_name(event_obj.journey_level_id)
            event_details["journey_level_name"] = EventRepo.get_journey_level_name(event_obj.journey_level_id)
            
        
        # qrcode = EventRepo.get_participant_qrcode(event_id, session_id)
        # event_details["qrcode"] = qrcode
        # qrcode_path = EventRepo.get_participant_qrcode_path(event_id, session_id)
        # event_details["qrcode_path"] = qrcode_path
        
        
        if participant_id:
            participant = EventRepo.get_participant_data_byid(participant_id, session_id)
            event_details["participants"] = EventRepo.get_participant_data_all_byid(participant_id, session_id)
        else:
            participant = EventRepo.get_participant_data(event_id, session_id)
            event_details["participants"] = EventRepo.get_participant_data_all(event_id, session_id)
        if participant :
            event_details["status"] = participant.status
            event_details["qrcode_path"] = participant.qrcode_path
            event_details["qrcode"] = participant.qrcode
            event_details["ticket"] = participant.ticket
            event_details["participant_id"] = participant.id
            event_details["ticket_no"] = str(participant.id)+"0"
            event_details["quantity"] = participant.quantity
            event_details["ticket_date"] = participant.date
            event_details["ticket_start_time"] = participant.start_time.strftime("%H:%M:%S") if participant.start_time else None
            event_details["ticket_end_time"] = participant.end_time.strftime("%H:%M:%S") if participant.end_time else None
            
            # attendance_today = EventRepo.get_participant_attendance_day(participant.id, current_date)
            # attendance_next = EventRepo.get_participant_next_attendance_day(participant.id, current_date)
            attendance_today = EventRepo.get_participant_attendance_day(participant.id, current_date)
            attendance_next = EventRepo.get_participant_next_attendance_day(participant.id, current_date)
            
            event_details["attendance_today"] = attendance_today
            if event_obj.category_id==3:
                event_details["start_date"] = event_details["ticket_date"]
                event_details["end_date"] = event_details["ticket_date"]
                event_details["start_time"] = event_details["ticket_start_time"]
                event_details["end_time"] = event_details["ticket_end_time"]
                
                
            
            swipe_flag = 0
            swipe_timer = None
            swipe_text = None

            start_date = event_details["start_date"]
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date, "%Y-%m-%d")

            end_date = event_details["end_date"]
            if isinstance(end_date, str):
                end_date = datetime.strptime(end_date, "%Y-%m-%d")

            start_time = event_details["start_time"]
            if isinstance(start_time, str):
                start_time = datetime.strptime(start_time, "%H:%M:%S").time()

            end_time = event_details["end_time"]
            if isinstance(end_time, str):
                end_time = datetime.strptime(end_time, "%H:%M:%S").time()

            if attendance_today == None:
                event_date = attendance_next.attendance_date if attendance_next else current_date.date()
            else :
                event_date = current_date.date() 
                
                
            










            # source_tz = pytz.timezone(event_Timezone)
            # target_tz = pytz.timezone(user_Timezone)
            # localized_dt = source_tz.localize(event_start)
            # event_start = localized_dt.astimezone(target_tz)







            
                
                
            # Combine date and time for full datetime comparisons
            # event_start = datetime.combine(event_date, start_time)
            # event_end = datetime.combine(event_date, end_time)
            # time_until_end = (event_end - current_date).total_seconds()
            
            
            event_start = datetime.combine(event_date, start_time).replace(tzinfo=ZoneInfo(event_Timezone))
            event_end = datetime.combine(event_date, end_time).replace(tzinfo=ZoneInfo(event_Timezone))
            time_until_end = (event_end - current_date).total_seconds()


            # Helper: show next class info
            def next_class_text():
                if attendance_next:
                    return f"Next class on {attendance_next.attendance_date.strftime('%d %b %Y')}"
                return None

            # def next_class_timer():
                # if attendance_next:
                    # next_event_start = datetime.combine(attendance_next.attendance_date, start_time)
                    # swipe_open_time = next_event_start - timedelta(minutes=15)
                    # if 0 <= (swipe_open_time - current_date).total_seconds() <= 86400:
                        # return int((swipe_open_time - current_date).total_seconds())
                # return None
            def next_class_timer():
                if attendance_next:
                    next_event_start = datetime.combine(
                        attendance_next.attendance_date, start_time
                    ).replace(tzinfo=ZoneInfo(event_Timezone))  # Make it timezone-aware

                    swipe_open_time = next_event_start - timedelta(minutes=15)

                    if 0 <= (swipe_open_time - current_date).total_seconds() <= 86400:
                        return int((swipe_open_time - current_date).total_seconds())
                return None

            if attendance_today is None:
                swipe_flag = 0
                swipe_text = next_class_text()
                if time_until_end<0:
                    swipe_timer = next_class_timer()

            elif attendance_today == 1:
                swipe_flag = 0
                swipe_text = "Already attended"
                if time_until_end<0:
                    swipe_timer = next_class_timer()

            elif attendance_today == 0:
                time_until_start = (event_start - current_date).total_seconds()
                time_since_start = (current_date - event_start).total_seconds()
                

                if -86400 <= time_until_start <= 86400:
                    if time_until_start > 15 * 60:
                        swipe_flag = 0
                        swipe_timer = int((event_start - timedelta(minutes=15) - current_date).total_seconds())
                    elif -15 * 60 <= time_since_start <= 30 * 60:
                        swipe_flag = 1
                    elif 30 * 60 < time_since_start <= (event_end - event_start).total_seconds():
                        swipe_flag = 0
                        swipe_text = "Class closed"
                    else:
                        swipe_flag = 0
                        swipe_text = next_class_text()
                        swipe_timer = next_class_timer()
                else:
                    swipe_flag = 0
                    swipe_text = next_class_text()
                    swipe_timer = next_class_timer()
            
            event_details["swipe_flag"]=swipe_flag
            event_details["swipe_timer"]=swipe_timer
            event_details["swipe_text"]=swipe_text
            event_details["swipe_event_start"]=event_start
            event_details["swipe_event_end"]=event_end
           
            
    
    
    
        event_details["share_url"] = public_open_url(event_obj.id)
        event_details["share_urle"] = public_open_path_url(str((base64.b64encode((str(event_details["id"])).encode('utf-8'))).decode('utf-8')))
    
        if not event_details["share_url"]:
            event_details["share_url"] = EventRepo.share(event_obj.id,event_obj.title)
        
        #share_url=str((base64.b64encode((str(event_details["id"])).encode('utf-8'))).decode('utf-8'))
        #event_details["share_url"] = "https://ondeen.page.link/"+share_url
        
        data = {'event_id':event_details['id']}
        existing_wishlist_item = WishlistRepository.find_wishlist_item(data,session_id)
        if existing_wishlist_item:
                    event_details['is_wishlisted'] = 1
        else:
                    event_details['is_wishlisted'] = 0
        
        
        return event_details
    



    def count_occurrences(start_date, end_date, occusr_type, occusr_weekday=None, occusr_month=None, current_date=None):
        """Count total and elapsed occurrences based on recurrence type."""
        total = elapsed = 0
        today = current_date.date()

        # Daily events
        if occusr_type == 2:
            total = (end_date - start_date).days + 1
            if today < start_date:
                elapsed = 0
            elif today > end_date:
                elapsed = total
            else:
                elapsed = (today - start_date).days + 1

        # Weekly events (occurs on selected weekdays)
        elif occusr_type == 3 and occusr_weekday:
            weekdays = [int(day) for day in occusr_weekday.split(",")]  # e.g., "3" = Thursday
            current = start_date
            while current <= end_date:
                if current.weekday() in weekdays:
                    total += 1
                    if current <= today:
                        elapsed += 1
                current += timedelta(days=1)

        # Monthly events
        elif occusr_type == 4:
            current = start_date
            while current <= end_date:
                if occusr_month == 1:  # Fixed day of month (e.g., 11th every month)
                    day = start_date.day
                    last_day = calendar.monthrange(current.year, current.month)[1]
                    if day <= last_day:
                        event_date = current.replace(day=day)
                        if start_date <= event_date <= end_date:
                            total += 1
                            if event_date <= today:
                                elapsed += 1

                elif occusr_month == 2:  # Weekday-based (e.g., 2nd Thursday of every month)
                    weekday = start_date.weekday()  # base weekday from start_date
                    day = start_date.day
                    week_position = (day - 1) // 7 + 1
                    c = calendar.Calendar()
                    month_days = [d for d in c.itermonthdates(current.year, current.month)
                                if d.month == current.month and d.weekday() == weekday]
                    if len(month_days) >= week_position:
                        event_date = month_days[week_position - 1]
                        if start_date <= event_date <= end_date:
                            total += 1
                            if event_date <= today:
                                elapsed += 1

                # move to next month safely
                if current.month == 12:
                    current = current.replace(year=current.year + 1, month=1, day=1)
                else:
                    current = current.replace(month=current.month + 1, day=1)

        return total, elapsed
        
        
        
    #booking module 
       
    @staticmethod
    @handle_service_errors
    def participant_list(session_id,request_data):
        event_id = request_data.get('event_id')
        if not event_id:
            raise ServiceError('Event required')

        EventService._require_booking(session_id, event_id)

        request_data['role_type']=2
        request_data['user_id2']=session_id
        obj = EventRepo.get_event_participants(request_data)
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError('Unable to get participants')

        return [EventService._public_participant_payload(item) for item in obj]
    
     
    @staticmethod
    @handle_service_errors
    def get_user_profile(business_id):
        user_obj = user.customer_profile(business_id)

        if isinstance(user_obj, dict) and 'error' in user_obj:
            raise ServiceError('Business not found')

        public_profile = EventService._public_profile_payload(user_obj)
        if user_obj.get('show_awards'):
            public_profile['award_level'] = user.get_award_level(public_profile['attended_count'])
        if user_obj.get('show_journeylevel'):
            public_profile['gamification'] = GamificationService.profile_payload(business_id)

        return public_profile
    
        
    @staticmethod
    @handle_service_errors
    def add_participant(session_id, request_data):
        payment_confirmed = bool(request_data.get('_stripe_payment_confirmed'))
        # Extract event_id from request_data
        tickets = request_data.get('tickets',[])
        event_id = request_data.get('event_id')
        date_time_id = request_data.get('date_time_id',0)
        quantity = request_data.get('quantity',0)
        extra_tickets=[]
        if not event_id:
            raise ServiceError("Event ID is required")
        
        
         
        # Retrieve and lock the event for the complete validation + participant
        # write so competing capacity checks serialize on PostgreSQL/MySQL.
        event = EventRepo.get_event_for_booking(event_id)
        if not event or event.status != 1:
            raise ServiceError("Invalid or inactive event")
        if event.price_type == 1 and not payment_confirmed:
            from app.services.payment import PaymentService
            return PaymentService.create_order(session_id, request_data)
        event_price=event.price
        
        #get_participant_count = EventRepo.get_participant_count(event_id,session_id)  
        #if get_participant_count > 0 and event.category_id==2:
        #    raise ServiceError("Allready booked")
                      
        get_ticket_count = EventRepo.get_ticket_count(event_id,session_id) 
           
        if event.category_id==3:
            date_time = EventRepo.get_event_datetime_by_id(date_time_id)
            if not date_time or date_time.status != 1:
                raise ServiceError("Invalid or inactive slot")
            event_date = EventRepo.get_event_date_by_id(date_time.event_date_id)
            if not event_date or event_date.status != 1:
                raise ServiceError("Invalid or inactive slot")
            if date_time.available-date_time.booked < quantity or not quantity>0:
                raise ServiceError("Not available for selected quantity") 
            if get_ticket_count+quantity > event.quantity_per_user:
                raise ServiceError("Maximum tickets allowed per user reached")

            # Prepare participant data
            participant_data = {
                'quantity': quantity,
                'category_id': event.category_id,
                'qrcode_type': event.qrcode_type,
                'event_id': event_id,
                'ticket_id': None,
                'date_time_id': date_time_id,
                'date': event_date.date,
                'start_time': date_time.start_time,
                'end_time': date_time.end_time,
                'user_id': session_id,
                'paid_amount': (event.price*quantity) if event.price_type == 1 else 0.0,
                'created_by': session_id,
            }
            event_price=event.price*quantity

        elif tickets and event.ticket_type == 1:
            #if not tickets:
            #    raise ServiceError("Ticket required")
            total_quantity = sum(ticket["quantity"] for ticket in tickets)
            if get_ticket_count+total_quantity > event.quantity_per_user:
                raise ServiceError("Maximum tickets allowed per user reached")
                
            for index, ticket in enumerate(tickets):
                eticket = EventRepo.get_event_ticket_by_id(ticket.get("id",0))
                if not eticket or eticket.status != 1:
                    raise ServiceError("Invalid or inactive Ticket")
                if eticket.available-eticket.booked < ticket.get("quantity",0) or not ticket.get("quantity",0)>0:
                    raise ServiceError("Ticket "+eticket.title+" not available for selected quantity")
                existing_ticket_quantity = db.session.query(
                    sa_func.coalesce(sa_func.sum(Participant.quantity), 0)
                ).filter(
                    Participant.event_id == event_id,
                    Participant.user_id == session_id,
                    Participant.ticket_id == eticket.id,
                    Participant.status == 1,
                ).scalar() or 0
                if existing_ticket_quantity + ticket.get("quantity", 0) > (eticket.max_per_user or 1):
                    raise ServiceError("Maximum tickets allowed for this ticket type reached")
 
                if index==0:
                    # Prepare participant data
                    participant_data = {
                        'quantity': ticket.get("quantity",0),
                        'category_id': event.category_id,
                        'qrcode_type': event.qrcode_type,
                        'event_id': event_id,
                        'ticket_id': ticket.get("id",0),
                        'date_time_id': None,
                        'date': None,
                        'start_time': None,
                        'end_time': None,
                        'user_id': session_id,
                        'paid_amount': (eticket.price or 0)*ticket.get("quantity",0) ,
                        'created_by': session_id,
                    }
                    event_price=(eticket.price or 0)*ticket.get("quantity",0)
                else:
                    event_price=event_price+(eticket.price or 0)*ticket.get("quantity",0)
                    extra_tickets.append({
                        'quantity': ticket.get("quantity",0),
                        'category_id': event.category_id,
                        'qrcode_type': event.qrcode_type,
                        'event_id': event_id,
                        'ticket_id': ticket.get("id",0),
                        'date_time_id': None,
                        'date': None,
                        'start_time': None,
                        'end_time': None,
                        'user_id': session_id,
                        'paid_amount': (eticket.price or 0)*ticket.get("quantity",0) ,
                        'created_by': session_id,
                    })
        elif event.ticket_type != 1 :
            # Prepare participant data            
            if event.available-event.booked < quantity or not quantity>0:
                raise ServiceError("Not available for selected quantity")            
            if get_ticket_count+quantity > event.quantity_per_user:
                raise ServiceError("Maximum tickets allowed per user reached")
            participant_data = {
                'quantity': quantity,
                'category_id': event.category_id,
                'qrcode_type': event.qrcode_type,
                'event_id': event_id,
                'ticket_id': None,
                'date_time_id': None,
                'date': None,
                'start_time': None,
                'end_time': None,
                'user_id': session_id,
                'paid_amount': (event.price or 0)*quantity if event.price_type == 1 else 0.0,
                'created_by': session_id,
            }
            event_price=(event.price or 0)*quantity
        else :            
            raise ServiceError("Ticket required")

        # Prepare payment data if the event is paid
        payment_data = None
        if event.price_type == 1 and not payment_confirmed:  # Legacy paid path is not client-confirmable.
            payment_data = {
                'amount': event_price,
                'currency': "gbp",  # Adjust currency as needed
                'payment_method': request_data.get('payment_method', 'online'),
                'request_json': '{}',  # Placeholder for actual payment request data
                # 'status': 1  # Assuming 1 represents 'paid' status
                'status': 0,  # Assuming 0 represents 'pending' status
            }
            
        status=1
        if event.price_type == 1 and not payment_confirmed and payment_data["amount"]>0:
            status=0
        participant_data['status']=status
        
        # Add participant and payment transaction
        participant = EventRepo.add_participantr(participant_data,0,commit=False)

        if event.price_type == 1 and not payment_confirmed:  # Paid event
            payment_data["all_participant_id"]=str(participant.id)

        if extra_tickets:

            for index, extra_ticket in enumerate(extra_tickets):
                extra_ticket['status']=status
                participant2 = EventRepo.add_participantr(extra_ticket,participant.id,commit=False)
                if event.price_type == 1 and not payment_confirmed:  # Paid event
                    payment_data["all_participant_id"]=payment_data["all_participant_id"]+","+str(participant2.id)



        response_data = {
            'ticket_no': str(participant.id)+"0", 
            'participant_id': participant.id, 
            'ticket_date': participant.date, 
            'ticket_start_time': participant.start_time.strftime("%H:%M:%S") if participant.start_time else None,
            'ticket_end_time': participant.end_time.strftime("%H:%M:%S") if participant.end_time else None, 
            'event_id': participant.event_id,
            'user_id': participant.user_id,
            'qrcode': participant.qrcode,
            'qrcode_path': participant.qrcode_path,
            'ticket': participant.ticket,
            'category_id':event.category_id,
            'event_title':event.title,
            'time_zone':event.time_zone,
            'meet_link':event.meet_link,
            'location_type':event.location_type,
            'event_price':event_price,
            #'extra_tickets':extra_tickets or None,
            'event_start_date': event.start_date,
            'event_end_date': event.end_date,
            'event_start_time': event.start_time.strftime('%H:%M:%S'),
            'event_end_time': event.end_time.strftime('%H:%M:%S'),
            #'event_start_date': event.start_date.strftime('%Y-%m-%d'),
            "occusr_type": event.occusr_type,
            "occusr_month": event.occusr_month,
            "occusr_weekday": event.occusr_weekday,
            'event_address':event.location, 
        }
        response_data["participants"] = EventRepo.get_participant_data_all_byid(participant.id, session_id)

        if event.price_type == 1 and not payment_confirmed and payment_data["amount"]>0:
            payment_transaction = EventRepo.add_payment(participant, payment_data)            
            if payment_transaction:
                response_data['payment_transaction_id'] = payment_transaction.id
                response_data['payment_status'] = payment_transaction.status
                response_data['client_secret'] = payment_transaction.client_secret
                response_data['payment_intent_id'] = payment_transaction.payment_intent_id

        
        else :
            # Free bookings (and zero-value paid bookings) have no payment
            # repository call to commit the transaction, so commit the locked
            # event/participant changes before creating notifications.
            if payment_confirmed:
                from app.models.payment import PaymentOrder
                from app.services.payment import PaymentService
                order = PaymentOrder.query.filter_by(
                    id=request_data.get('_payment_finalize_order_id'),
                    event_id=event.id,
                    buyer_user_id=session_id,
                ).first()
                if not order:
                    raise ServiceError("Payment order not found during booking finalisation")
                participant_ids = [participant.id]
                if extra_tickets:
                    participant_ids.extend(
                        row.id for row in Participant.query.filter_by(parent_id=participant.id).all()
                    )
                response_data.update({
                    'payment_order_id': order.id,
                    'payment_order_key': order.order_key,
                    'payment_intent_id': order.stripe_payment_intent_id,
                    'payment_status': 1,
                })
                order.participant_ids = ','.join(str(value) for value in participant_ids)
                order.booking_response = PaymentService._json(response_data)
                order.status = 'confirmed'
                order.confirmed_on = datetime.utcnow()
            db.session.commit()
            EventRepo.add_participant_notification(participant, event,session_id)





        return response_data

   
   
    @staticmethod
    @handle_service_errors
    def booking_list(session_id, request_data):
        # Extract and validate the filter type in the service layer
        

        # Pass session_id and request_data directly to the repository method
        events = EventRepo.booking_list(session_id, request_data)
        return events
        
    
    
    
   
    @staticmethod
    @handle_service_errors
    def ticket_qrcodes(session_id, request_data):
        # Extract and validate the filter type in the service layer
        

        # Pass session_id and request_data directly to the repository method
        events = EventRepo.ticket_qrcodes(session_id, request_data)
        return events
    
    
    
    
    @staticmethod
    @handle_service_errors
    def event_search(session_id, request_data):
      
        events = EventRepo.event_search(session_id, request_data)
        return events
    
    
    
    
    # @staticmethod
    # @handle_service_errors
    # def request_buddy(request_data,session_id):    
    #     obj = EventRepo.request_buddy(request_data,session_id)
    #     if isinstance(obj, dict) and 'error' in obj:
    #         raise ServiceError("Unable to add")

    #     return {"message": "added successfully"}
    
    
    
    
    @staticmethod
    @handle_service_errors
    def request_buddy(session_id, request_data):
        request_data = dict(request_data or {})
        event_id = request_data.get('event_id')
        if not event_id:
            raise ServiceError("Event ID is required")

        event = EventRepo.get_event_by_id(event_id)
        if not event:
            raise ServiceError("Event not found")

        try:
            request_type = int(request_data.get('type') or 1)
        except (TypeError, ValueError):
            raise ServiceError("Invalid request type")
        if request_type not in (1, 2):
            raise ServiceError("Invalid request type")
        if request_type == 1:
            EventService._require_booking(session_id, event_id)

        session_date = None
        session_time = None
        speaker_id = request_data.get('speaker_id')
        speaker = None
        if request_type == 2:
            if not speaker_id:
                raise ServiceError("Speaker ID is required")
            try:
                speaker_id = int(speaker_id)
            except (TypeError, ValueError):
                raise ServiceError("Invalid speaker")

            assignment = EventRepo.get_speaker_by_event_id_and_user_id(event_id, speaker_id)
            if not assignment or assignment.status != 1:
                raise ServiceError("Speaker is not assigned to this event")

            speaker = SpeakerRepository.get_speaker_by_id(speaker_id)
            if not speaker or not speaker.user or speaker.status != 1:
                raise ServiceError("Speaker not found")

            try:
                session_date = datetime.strptime(str(request_data.get('date') or ''), "%Y-%m-%d").date()
            except ValueError:
                raise ServiceError("A valid session date is required")

            raw_time = str(request_data.get('time') or '').strip()
            session_time = None
            for time_format in ("%H:%M:%S", "%H:%M"):
                try:
                    session_time = datetime.strptime(raw_time, time_format).time()
                    break
                except ValueError:
                    continue
            if session_time is None:
                raise ServiceError("A valid session time is required")

            availability = SpeakerRepository.get_avaialability_by_user_id_and_date(
                speaker_id,
                session_date,
            )
            if availability is None:
                availability = SpeakerRepository.get_avaialability_by_user_id_and_weekday(
                    speaker_id,
                    session_date,
                )
            if not availability or availability.status != 1:
                raise ServiceError("No available slot for this date")

            available_time = next((
                item
                for item in SpeakerRepository.get_speaker_availability_time(availability.id)
                if item.status == 1 and item.start_time == session_time
            ), None)
            if available_time is None:
                raise ServiceError("No available slot for this time")

            timezone_name = speaker.user.time_zone or os.getenv('d_t_z') or 'UTC'
            try:
                speaker_timezone = ZoneInfo(timezone_name)
            except Exception:
                speaker_timezone = ZoneInfo('UTC')
                timezone_name = 'UTC'
            requested_at = datetime.combine(session_date, session_time, tzinfo=speaker_timezone)
            if requested_at <= datetime.now(speaker_timezone):
                raise ServiceError("This session slot is no longer available")

            EventRepo.lock_one_to_one_slot(speaker_id, session_date, session_time)
            existing_request = EventRepo.get_active_one_to_one_for_user(
                session_id,
                event_id,
                speaker_id,
            )
            if existing_request:
                if existing_request.date == session_date and existing_request.time == session_time:
                    return {
                        "message": "Already requested",
                        "request_session": 1,
                        "session_id": existing_request.id,
                        "session_status": existing_request.status,
                    }
                raise ServiceError("You already have an active session request with this speaker")

            occupied_request = EventRepo.get_active_one_to_one_for_slot(
                speaker_id,
                session_date,
                session_time,
            )
            if occupied_request:
                raise ServiceError("Slot is no longer available")

        organizer_id = event.user_id
        event_title = event.title

        # Prepare buddy_request data
        buddy_request_data = {
            'event_id': event_id,
            'user_id': session_id,
            'speaker_id': speaker_id or 0,
            'status': 0,
            'user_comment': request_data.get('user_comment', ''),
            'type': request_type,
            'created_by': session_id,
            'updated_by': session_id,
            'date': session_date or request_data.get('date'),
            'time': session_time or request_data.get('time'),
            'meet_link':request_data.get('meet_link'),
            'duration_minutes': (
                speaker.one_to_one_duration_minutes
                if request_type == 2 and speaker
                else None
            ),
        }
        if speaker_id:
            get_user = user.get_userby_id(speaker_id)
            buddy_request_data["created_on"]=datetime.now(ZoneInfo(get_user.time_zone or os.getenv('d_t_z')))
            buddy_request_data["time_zone"]=get_user.time_zone or os.getenv('d_t_z')
        elif request_data.get('event_id'):
            buddy_request_data["created_on"]=datetime.now(ZoneInfo(event.time_zone or os.getenv('d_t_z')))
            buddy_request_data["time_zone"]=event.time_zone or os.getenv('d_t_z')
            
        
        # you have a new session request for this event
        # you have new buddy request for the event
        
        # type 1 - event user id
        # type 2 - Session speker id
        
        count = (
            0
            if request_type == 2
            else EventRepo.request_buddy_count(session_id, event_id, request_type)
        )
        
        
        
        if count == 0:
        # Insert buddy_request using repository method
            event_information = EventRepo.request_buddy(buddy_request_data)
            
             
            if event_information is not None:
                if request_type == 1:
                    EventRepo.send_buddyrequest_notifications(session_id, organizer_id,event_title,request_type,event_id,event_information)
                else:
                    EventRepo.send_buddyrequest_notifications(session_id, speaker_id,event_title,request_type,event_id,event_information)
                    
            
            
            
            if request_type == 2:
                return {
                    "message": "Session request sent and pending approval.",
                    "request_session": 1,
                    "session_id": event_information,
                    "session_status": 0,
                }
            return {
                "message": "We have received your request and someone from out team will get in touch with you shortly.",
                "request_buddy": 1,
            }
        else:
            if request_type == 2:
                return {"message": "Already requested", "request_session": 1}
            return {"message": "Already requested", "request_buddy": 1}
        


    @staticmethod
    @handle_service_errors
    def get_request_buddy_list(session_id, request_data):
        # Extract and validate the filter type in the service layer
        

        # Pass session_id and request_data directly to the repository method
        request_data['session'] = session_id

        # Pass the modified request_data to the repository method
        events = EventRepo.get_request_buddy_list(request_data)
        return events
            
        
    

    @staticmethod
    @handle_service_errors
    def update_status_request_buddy(session_id, request_data):

        if not request_data.get('id'):
            raise ServiceError("ID is required")
        return OneToOneService.update_session(session_id, "customer", request_data)
            
        
    
    
    
    
    
    
    
    @staticmethod
    @handle_service_errors
    def cancle_booking(session_id, request_data):      
        
        #print(request_data)
        participant_id = request_data.get('ticket_id')
        event_id = request_data.get('event_id')
        from app.services.payment import PaymentService
        refund = PaymentService.request_refund_for_booking(
            session_id,
            event_id=event_id,
            participant_id=participant_id,
        )
        if refund:
            return {
                "message": "Refund request sent to the organiser. Your booking remains active until Stripe confirms the refund.",
                "refund_request": refund,
            }
        if not participant_id:
            if not event_id:
                raise ServiceError("Event ID is required")
                
            attendance_response = EventRepo.cancle_event_booking(request_data,session_id)
            if isinstance(attendance_response, dict) and 'error2' in attendance_response:
                    raise ServiceError("No Active Booking found")
            if isinstance(attendance_response, dict) and 'error3' in attendance_response:
                    return {"status":True,"confirm":1,"message":"This event has already begun. Refunds are not available. Please confirm if you wish to cancel."}
                    #raise ServiceError(f"This event has already begun. Refunds are not available. Please confirm if you wish to cancel.")
        
        else:
            attendance_response = EventRepo.cancle_booking(request_data,session_id)
            if isinstance(attendance_response, dict) and 'error2' in attendance_response:
                    raise ServiceError("Ticket not found")
            if isinstance(attendance_response, dict) and 'error3' in attendance_response:
                    return {"status":True,"confirm":1,"message":"This event has already begun. Refunds are not available. Please confirm if you wish to cancel."}
                    #raise ServiceError(f"This event has already begun. Refunds are not available. Please confirm if you wish to cancel.")
            if isinstance(attendance_response, dict) and 'error4' in attendance_response:
                    raise ServiceError(f"Event already cancelled")

        

        return {"message": "You have successfully cancelled booking!"}
        
        
        
    
    
    
    
    @staticmethod
    @handle_service_errors
    def check_in(session_id, request_data):      
        
        #print(request_data)
        participant_id = request_data.get('ticket_id')
        event_id = request_data.get('event_id')
        if not event_id:
            raise ServiceError("Event ID is required")
        if not participant_id:
            raise ServiceError("Ticket ID is required")
        if (request_data.get('latitude',0))==0 and (request_data.get('longitude',0))==0:
            raise ServiceError("Please check your location permission")
        
         
        event = EventRepo.get_event_by_id(event_id)  
        # Keep the server as the source of truth: a hidden client button must
        # not still award attendance, XP, streaks or Radar credit.
        if int(event.category_id or 0) == 2 and int(event.swipe_checkin or 0) != 1:
            raise ServiceError("Check-in is disabled for this listing")
        category=event.category.title.rstrip('s') if event.category.title.endswith('s') else event.category.title
        request_data['category']=category
        distance = haversine(event.latitude, event.longitude, request_data.get('latitude',0), request_data.get('longitude',0))
        # distance is in meters
        
        #if (event.checkin_range>0 and distance < event.checkin_range) or (event.checkin_range<=0 and distance < 200):                        
        if distance < 300: #if distance < 200:                        
            attendance_response = EventRepo.update_attendance_user(request_data,session_id)
            if isinstance(attendance_response, dict) and 'error' in attendance_response:
                raise ServiceError("You have already checked in for today's event!")
                #return {"message": "You have successfully checked in for today's event!"}
            if isinstance(attendance_response, dict) and 'error3' in attendance_response:
                raise ServiceError("Event not found for today")
            if isinstance(attendance_response, dict) and 'error2' in attendance_response:
                raise ServiceError("Ticket not found")
            if isinstance(attendance_response, dict) and 'error5' in attendance_response:
                raise ServiceError("Event Not Found")
            if isinstance(attendance_response, dict) and 'error6' in attendance_response:
                raise ServiceError("Cancelled Booking")

        else:
            raise ServiceError(f"You need to be at the location to check in.(You are {round(distance)}m away)")
            #raise ServiceError("You need to be at the location to check in.")
            #raise ServiceError(f"You need to be at the location to check in.(Within 200m range, but you are {round(distance)}m away)")
        

        summary = GamificationService.award_check_in(session_id, attendance_response)
        return {"message": "You have successfully checked in for today's event!", "gamification_summary": summary}

    @staticmethod
    @handle_service_errors
    def online_check_in(session_id, request_data):
        return OnlineCheckInService.validate_online_check_in(session_id, request_data or {})

    @staticmethod
    @handle_service_errors
    def manual_attendance(request_data, session_id):
        """Mark the next booked session through the shared idempotent path."""
        event_id = request_data.get("event_id")
        participant_id = request_data.get("participant_id")
        if not event_id or not participant_id:
            raise ServiceError("Event and participant are required")

        event = EventService._owned_event(event_id, session_id)
        if int(event.category_id or 0) == 2 and int(event.swipe_checkin or 0) != 1:
            raise ServiceError("Check-in is disabled for this listing")

        participant = Participant.query.filter_by(
            id=participant_id,
            event_id=event.id,
            status=1,
        ).first()
        if not participant:
            raise ServiceError("Participant not found")

        attendance = OnlineCheckInService._pending_or_create_attendance(
            participant,
            allow_future=True,
        )
        if not attendance:
            raise ServiceError("No pending session found for this participant")

        return OnlineCheckInService._mark_attendance(
            participant.user_id,
            participant,
            attendance,
            "manual-organiser",
        )

    @staticmethod
    @handle_service_errors
    def debug_complete_booking(session_id, request_data):
        return OnlineCheckInService.debug_complete_booked_session(session_id, request_data or {})
        
        
        

    
    
    # @staticmethod
    # @handle_service_errors
    # def check_in(session_id, request_data):      
        
        
        # # Extract required fields from request_data
        # participant_id = request_data.get('ticket_id')
        # event_id = request_data.get('event_id')
        # attendance_date = request_data.get('attendance_date', datetime.utcnow().date().strftime('%Y-%m-%d'))
        # event = EventRepo.get_event_by_id(event_id)
        
        
        # if not participant_id:
            # raise ServiceError("Participant ID is required")
        # if not event_id:
            # raise ServiceError("Event ID is required")
        
        
        
        # get_participant_attendence_count = EventRepo.get_participant_attendance_count(event_id,participant_id)
        
       
        # if get_participant_attendence_count > 0:
            # raise ServiceError("You are already checked in for today")
        
        
        
        
        
        # distance = haversine(event.latitude, event.longitude, request_data.get('latitude'), request_data.get('longitude'))
        
        # # distance is in meters
        # if distance < 200:
            
            # attendance_data = {
            # 'participant_id': participant_id,
            # 'event_id': event_id,
            # 'attendance_date': datetime.strptime(attendance_date, '%Y-%m-%d').date(),
            # 'status': request_data.get('status', 1),  # Default status is 1 (e.g., Present)
            # 'latitude': request_data.get('latitude'),
            # 'longitude': request_data.get('longitude'),
            # 'created_on': datetime.utcnow(),
            # 'updated_on': datetime.utcnow(),
            # }

            # # Insert attendance using repository method
            # attendance_record = EventRepo.add_participant_attendance(attendance_data)
        # else:
            # raise ServiceError("The points are farther than 200 meters.")
    
        
       

        # return {"message": "added successfully"}
    
    
    
    
    
    
    
    
    
    
    
    
    
    @staticmethod
    @handle_service_errors
    def add_rating(session_id, request_data):
    
        event_id = request_data.get('event_id')
        title = request_data.get('title')
        rating_value = request_data.get('rating_value')
        review = request_data.get('review')
        
        if not event_id:
            raise ServiceError("Event ID is required")
        event = EventRepo.get_event_by_id(event_id)
        if not event:
            raise ServiceError("Event not found")

        rating_request_data = {
            'to_user_id': event.user_id,
            'event_id': event_id,
            'user_id': session_id,
            'title': title,
            'rating_value': rating_value,
            'review': review,
            'status': request_data.get('status', 1),
            'created_by': session_id,
            'updated_by': session_id,
        }
        
        event_information = EventRepo.add_rating(rating_request_data)
        return {"message": "added successfully"}
    
    
    
    
    @staticmethod
    @handle_service_errors
    def get_rating(session_id, request_data):
 
        if request_data.get('event_id'):
            event = EventRepo.get_event_by_id(request_data.get('event_id'))
            request_data['user_id']=event.user_id
        elif request_data.get('user_id'):    
            #raise ServiceError("Event ID is required")
            request_data['user_id']=request_data.get('user_id')
        else:    
            request_data['user_id']=session_id
        
        data = EventRepo.get_rating(request_data)
        return data
    
    
    
    
    @staticmethod
    @handle_service_errors
    def booking_list(session_id, request_data):
        # Extract and validate the filter type in the service layer
        

        # Pass session_id and request_data directly to the repository method
        events = EventRepo.booking_list(session_id, request_data)
        return events
    
    
    
    @staticmethod
    @handle_service_errors
    def filter(session_id, request_data):
        
        type = request_data.get('type')
        request_data["status"]=1
        active_speakers = EventRepo.get_speakers_by_event(type) if type else EventRepo.get_speakers_by_event()
        active_organizer = EventRepo.get_organizer_by_event(type) if type else EventRepo.get_organizer_by_event()
        category=CategoryRepository.get_all_categories(request_data,1000)
        nnc=user.get_new_notification_count(session_id)

        active_journey_levels = []
        sub_category = []
        
        gender = []
        data={"id":1,"title":"Male"}
        gender.append(data)
        data={"id":2,"title":"Female"}
        gender.append(data)
        data={"id":3,"title":"Both"}
        gender.append(data)

        #if type ==2:
        active_journey_levels = EventRepo.get_active_master_journey_levels()
        if type ==2:
            request_data["category_id"]=2
            sub_category = SubCategoryRepository.getall_SubCategory(request_data,1000)

        return {
                "new_notification_count": nnc,
                "speakers": active_speakers,
                "organizers": active_organizer,
                "category":category,
                "gender":gender,
                "sub_category":sub_category,
                "journey_level":active_journey_levels
            } 
        
    
            
    
    
