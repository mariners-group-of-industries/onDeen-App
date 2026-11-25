from app.repositories.dashboard import DashboardRepo
from app.repositories.event import EventRepo
from app.repositories.organizer import OrganizerRepository
from app.repositories.buddy import BuddyRepository
from app import db
from app.models.category import Category, SubCategory
from app.models.event import Event, EventCurriculum, EventGuestBookingSetting, EventTitleAuditLog, EventTicket, JourneyLevel, Language, Participant, Request_buddy
from app.services.event_ticket_storage import ensure_event_ticket_storage
from app.models.users import Notification_History
from app.services.customer.gamification import GamificationService
from app.services.online_checkin import OnlineCheckInService
from app.services.one_to_one import OneToOneService
from app.repositories.user import user
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from sqlalchemy import func
from datetime import datetime, timedelta,date,time
from flask import request
import os

class EventService:

    @staticmethod
    def normalize_date_value(value, field_name="date"):
        if not value:
            raise ServiceError(f"{field_name} is required")
        if isinstance(value, (datetime, date)):
            return value
        value = str(value).strip()
        if value.endswith("Z"):
            value = value[:-1]
        try:
            return datetime.fromisoformat(value).replace(tzinfo=None)
        except ValueError:
            pass
        for fmt in (
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%m/%d/%Y",
        ):
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue
        raise ServiceError(f"Invalid {field_name}")

    @staticmethod
    def normalize_time_value(value, field_name="time"):
        if not value:
            raise ServiceError(f"{field_name} is required")
        if isinstance(value, time):
            return value
        value = str(value).strip()
        for fmt in ("%H:%M:%S", "%H:%M", "%I:%M %p", "%I:%M:%S %p"):
            try:
                return datetime.strptime(value, fmt).time()
            except ValueError:
                continue
        raise ServiceError(f"Invalid {field_name}")


    @staticmethod
    @handle_service_errors
    def question_and_answers(session,event_id,type):
        EventService._owned_event(event_id, session)
        data= EventRepo.question_and_answers(session,event_id,3,type)
        return data

    @staticmethod
    def _owned_event(event_id, session_id):
        if not event_id:
            raise ServiceError("event_id is required")
        event = Event.query.filter_by(id=event_id, user_id=session_id).first()
        if not event:
            raise ServiceError("Event not found")
        return event

    @staticmethod
    def _ensure_p0_tables():
        bind = db.session.get_bind()
        if bind is not None:
            EventGuestBookingSetting.__table__.create(bind=bind, checkfirst=True)
            EventTitleAuditLog.__table__.create(bind=bind, checkfirst=True)
            ensure_event_ticket_storage()

    @staticmethod
    def _guest_booking_enabled(event_id):
        EventService._ensure_p0_tables()
        setting = EventGuestBookingSetting.query.filter_by(event_id=event_id).first()
        return True if setting is None else bool(setting.enabled)

    @staticmethod
    def _parse_bool(value, default=True):
        if value is None:
            return default
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value != 0
        return str(value).strip().lower() not in ("0", "false", "off", "no", "disabled")

    @staticmethod
    def _listing_value(request_data, field_name, existing_event=None):
        if field_name in request_data:
            return request_data.get(field_name)
        return getattr(existing_event, field_name, None) if existing_event is not None else None

    @staticmethod
    def _listing_int(value, field_name):
        try:
            return int(value)
        except (TypeError, ValueError):
            raise ServiceError(f"{field_name} is required")

    @staticmethod
    def validate_listing_dimensions(request_data, existing_event=None):
        """Validate the organiser-owned listing fields required by REFS."""
        category_id = EventService._listing_int(
            EventService._listing_value(request_data, "category_id", existing_event),
            "Listing type",
        )
        subcategory_id = EventService._listing_int(
            EventService._listing_value(request_data, "sub_category_id", existing_event),
            "Topic or activity",
        )
        category = Category.query.filter_by(id=category_id, status=1).first()
        if category is None:
            raise ServiceError("Listing type is invalid or inactive")
        subcategory = SubCategory.query.filter_by(
            id=subcategory_id,
            category_id=category_id,
            status=1,
        ).first()
        if subcategory is None:
            raise ServiceError("Topic or activity does not belong to the selected listing type")

        language_id = EventService._listing_int(
            EventService._listing_value(request_data, "language_id", existing_event),
            "Language",
        )
        if Language.query.filter_by(id=language_id, status=1).first() is None:
            raise ServiceError("Language is invalid or inactive")

        journey_level_id = EventService._listing_int(
            EventService._listing_value(request_data, "journey_level_id", existing_event),
            "Suitable for",
        )
        if JourneyLevel.query.filter_by(id=journey_level_id, status=1).first() is None:
            raise ServiceError("Suitable for level is invalid or inactive")

        audience = EventService._listing_int(
            EventService._listing_value(request_data, "gender", existing_event),
            "Audience",
        )
        if audience not in (1, 2, 3):
            raise ServiceError("Audience must be Brothers, Sisters, or All")

        delivery = EventService._listing_int(
            EventService._listing_value(request_data, "location_type", existing_event),
            "Delivery",
        )
        if delivery not in (0, 1, 2):
            raise ServiceError("Delivery must be Online, In person, or Hybrid")

        location = str(EventService._listing_value(request_data, "location", existing_event) or "").strip()
        meet_link = str(EventService._listing_value(request_data, "meet_link", existing_event) or "").strip()
        if delivery in (1, 2) and not location:
            raise ServiceError("Location is required for in-person and hybrid listings")
        if delivery in (0, 2) and not meet_link:
            raise ServiceError("Meeting link is required for online and hybrid listings")

        return {
            "category_id": category_id,
            "sub_category_id": subcategory_id,
            "language_id": language_id,
            "journey_level_id": journey_level_id,
            "gender": audience,
            "location_type": delivery,
            "location": location or None,
            "meet_link": meet_link or None,
        }

    @staticmethod
    def _date_only(value, field_name):
        normalized = EventService.normalize_date_value(value, field_name)
        return normalized.date() if isinstance(normalized, datetime) else normalized

    @staticmethod
    def _weekday_values(value):
        if isinstance(value, (list, tuple, set)):
            raw_values = value
        else:
            raw_values = str(value or "").split(",")
        weekdays = []
        for raw_value in raw_values:
            if str(raw_value).strip() == "":
                continue
            try:
                weekday = int(raw_value)
            except (TypeError, ValueError):
                raise ServiceError("Weekly days must use Monday through Sunday")
            if weekday not in range(7):
                raise ServiceError("Weekly days must use Monday through Sunday")
            if weekday not in weekdays:
                weekdays.append(weekday)
        return sorted(weekdays)

    @staticmethod
    def occurrence_dates(start_date, end_date, occurrence_type, occurrence_weekdays="", occurrence_month=1):
        start_day = EventService._date_only(start_date, "start date")
        end_day = EventService._date_only(end_date, "end date")
        if end_day < start_day:
            raise ServiceError("End date must be greater than or equal to start date")

        occurrence_type = EventService._listing_int(occurrence_type, "Recurrence")
        if occurrence_type not in (1, 2, 3, 4):
            raise ServiceError("Recurrence must be One-off, Daily, Weekly, or Monthly")
        if occurrence_type == 1:
            if end_day != start_day:
                raise ServiceError("A one-off listing must use the same start and end date")
            return [start_day]

        weekdays = EventService._weekday_values(occurrence_weekdays)
        if occurrence_type == 3 and not weekdays:
            raise ServiceError("Select at least one day for a weekly listing")

        monthly_mode = int(occurrence_month or 1)
        start_week_ordinal = ((start_day.day - 1) // 7) + 1
        result = []
        current_day = start_day
        while current_day <= end_day:
            include = occurrence_type == 2
            if occurrence_type == 3:
                include = current_day.weekday() in weekdays
            elif occurrence_type == 4:
                if monthly_mode == 2:
                    include = (
                        current_day.weekday() == start_day.weekday()
                        and ((current_day.day - 1) // 7) + 1 == start_week_ordinal
                    )
                else:
                    include = current_day.day == start_day.day
            if include:
                result.append(current_day)
            current_day += timedelta(days=1)

        if not result:
            raise ServiceError("The recurrence does not produce any session in the selected date range")
        return result

    @staticmethod
    def validate_schedule_dimensions(request_data, existing_event=None):
        start_date = EventService._listing_value(request_data, "start_date", existing_event)
        end_date = EventService._listing_value(request_data, "end_date", existing_event) or start_date
        start_time = EventService._listing_value(request_data, "start_time", existing_event)
        end_time = EventService._listing_value(request_data, "end_time", existing_event)
        occurrence_type = EventService._listing_value(request_data, "occusr_type", existing_event) or 1
        occurrence_weekdays = EventService._listing_value(request_data, "occusr_weekday", existing_event) or ""
        occurrence_month = EventService._listing_value(request_data, "occusr_month", existing_event) or 1

        EventService.normalize_time_value(start_time, "start time")
        EventService.normalize_time_value(end_time, "end time")
        EventService.occurrence_dates(
            start_date,
            end_date,
            occurrence_type,
            occurrence_weekdays,
            occurrence_month,
        )
        weekdays = EventService._weekday_values(occurrence_weekdays) if int(occurrence_type) == 3 else []
        return {
            "occusr_type": int(occurrence_type),
            "occusr_weekday": ",".join(str(value) for value in weekdays),
            "occusr_month": int(occurrence_month),
        }

    @staticmethod
    def schedule_changed(request_data, existing_event):
        requested = {
            "start_date": EventService._date_only(request_data.get("start_date"), "start date"),
            "end_date": EventService._date_only(request_data.get("end_date"), "end date"),
            "start_time": EventService.normalize_time_value(request_data.get("start_time"), "start time"),
            "end_time": EventService.normalize_time_value(request_data.get("end_time"), "end time"),
            "occusr_type": int(request_data.get("occusr_type") or 1),
            "occusr_weekday": request_data.get("occusr_weekday") or "",
            "occusr_month": int(request_data.get("occusr_month") or 1),
        }
        existing = {
            "start_date": EventService._date_only(existing_event.start_date, "start date"),
            "end_date": EventService._date_only(existing_event.end_date, "end date"),
            "start_time": existing_event.start_time,
            "end_time": existing_event.end_time,
            "occusr_type": int(existing_event.occusr_type or 1),
            "occusr_weekday": ",".join(
                str(value) for value in EventService._weekday_values(existing_event.occusr_weekday)
            ) if int(existing_event.occusr_type or 1) == 3 else "",
            "occusr_month": int(existing_event.occusr_month or 1),
        }
        return requested != existing

    @staticmethod
    def _fan_out_title_update(event, old_title, new_title):
        participant_rows = (
            db.session.query(Participant.user_id, func.min(Participant.id))
            .filter(Participant.event_id == event.id, Participant.status.in_((1, 3)), Participant.user_id > 0)
            .group_by(Participant.user_id)
            .all()
        )

        notification_count = 0
        link_url = user.notification_link_url(7, event.id)
        message = f"{old_title or 'This event'} is now {new_title}."
        if link_url:
            message = f"{message} {link_url}"

        for user_id, participant_id in participant_rows:
            db.session.add(Notification_History(
                user_id=user_id,
                participant_id=participant_id,
                event_id=event.id,
                push=True,
                sms=False,
                email=False,
                type=7,
                send_to=2,
                task_id=f"event-title-update-{event.id}",
                title="Event title updated",
                message=message,
                seen=0,
                status=1,
                created_on=datetime.utcnow(),
            ))
            notification_count += 1

        return notification_count

    @staticmethod
    @handle_service_errors
    def update_title(request_data, session_id):
        EventService._ensure_p0_tables()
        event = EventService._owned_event(request_data.get("event_id"), session_id)
        title = str(request_data.get("title") or "").strip()
        if len(title) < 3:
            raise ServiceError("Event title must be at least 3 characters")
        if len(title) > 100:
            raise ServiceError("Event title must be 100 characters or less")

        old_title = event.title
        if old_title == title:
            return {
                "message": "Event title unchanged",
                "title": event.title,
                "notification_count": 0,
            }

        event.title = title
        event.updated_by = session_id
        event.updated_on = datetime.utcnow()
        notification_count = EventService._fan_out_title_update(event, old_title, title)
        db.session.add(EventTitleAuditLog(
            event_id=event.id,
            organizer_id=session_id,
            old_title=old_title,
            new_title=title,
            notification_count=notification_count,
            created_on=datetime.utcnow(),
        ))
        db.session.commit()
        print(
            f"[event-title-edit] event_id={event.id} organizer_id={session_id} "
            f"notifications={notification_count}",
            flush=True,
        )
        return {
            "message": "Event title updated",
            "title": title,
            "old_title": old_title,
            "notification_count": notification_count,
        }

    @staticmethod
    @handle_service_errors
    def guest_booking_setting(request_data, session_id):
        EventService._ensure_p0_tables()
        event = EventService._owned_event(request_data.get("event_id"), session_id)
        enabled = EventService._parse_bool(
            request_data.get("enabled", request_data.get("guest_booking_enabled")),
            default=True,
        )
        setting = EventGuestBookingSetting.query.filter_by(event_id=event.id).first()
        if setting is None:
            setting = EventGuestBookingSetting(
                event_id=event.id,
                enabled=enabled,
                created_by=session_id,
                updated_by=session_id,
            )
            db.session.add(setting)
        else:
            setting.enabled = enabled
            setting.updated_by = session_id
            setting.updated_on = datetime.utcnow()
        db.session.commit()
        print(
            f"[guest-booking-setting] event_id={event.id} organizer_id={session_id} enabled={enabled}",
            flush=True,
        )
        return {
            "message": "Guest booking setting updated",
            "guest_booking_enabled": enabled,
        }

    @staticmethod
    @handle_service_errors
    def feedback_aggregate(request_data, session_id):
        event = EventService._owned_event(request_data.get("event_id"), session_id)
        return GamificationService.feedback_aggregate(event.id)

    @staticmethod
    @handle_service_errors
    def feedback_csv(request_data, session_id):
        event = EventService._owned_event(request_data.get("event_id"), session_id)
        return GamificationService.feedback_csv(event.id), event

    @staticmethod
    @handle_service_errors
    def online_checkin_code(request_data, session_id):
        event = OnlineCheckInService.owned_event(request_data.get("event_id"), session_id)
        return OnlineCheckInService.get_or_create_code(
            event,
            session_date=request_data.get("session_date"),
            actor_id=session_id,
            regenerate=bool(request_data.get("regenerate")),
        )


    @staticmethod
    @handle_service_errors
    def create_or_update_event(request_data, session_id):
        if any(key in request_data for key in ("radar_area", "radarArea", "radar_percentage", "radar_split")):
            raise ServiceError("Radar area is derived automatically from the selected topic")

        # Check if the event already exists
        event_id = request_data.get('id')
        existing_event = None
        if event_id:
            existing_event = EventRepo.get_event_by_id_and_user_id(event_id, session_id)
            if not existing_event:
                raise ServiceError("Event not found")

        from app.services.payment import PaymentService
        resulting_price_type = request_data.get(
            'price_type',
            existing_event.price_type if existing_event is not None else 0,
        )
        if int(resulting_price_type or 0) == 1:
            if not PaymentService._enabled():
                raise ServiceError("Paid listing publishing is temporarily unavailable")
            PaymentService.require_paid_listing_ready(session_id)

        listing_dimensions = EventService.validate_listing_dimensions(request_data, existing_event)
        request_data = {**request_data, **listing_dimensions}
        
        # if request_data.get('date_time_check'):
            # date_time=EventRepo.convert_dates_to_gmt(request_data.get('dates'),request_data.get('time_zone'))
            # return {"message": date_time}
        
        #request_data["date_time"]=EventRepo.convert_dates_to_gmt(request_data.get('date_time'),request_data.get('time_zone'))
            
        if not request_data.get('end_date'):
            request_data['end_date']=request_data.get('start_date')

        schedule_dimensions = EventService.validate_schedule_dimensions(request_data, existing_event)
        request_data = {**request_data, **schedule_dimensions}
        has_schedule_change = bool(existing_event and EventService.schedule_changed(request_data, existing_event))
    
        event_data = EventService.build_event_data(request_data, session_id)

        # Attempt to add or update the event
        if event_id:            
            event_obj = existing_event
            #if event_obj.status==0:
            #    event_data['status']=0
            pcount=EventRepo.total_participants_count(event_id)
            if pcount and pcount > 0 and has_schedule_change:
                raise ServiceError("Event has been booked by someone, can not update the schedule now")
            event_obj = EventRepo.update_event(event_id, event_data)
            if has_schedule_change:
                EventRepo.delete_event_schedule(event_id)
        else:
            event_obj = EventRepo.add_event(event_data)

        # Check if the event object was successfully created or updated
        if not event_obj:
            raise ServiceError("Event creation or update failed")

        # Process related entities (images, tags, curriculum, facilities, speakers, documents)
        EventService.process_related_entities(request_data, event_obj.id, session_id)
        if has_schedule_change:
            PaymentService.recalculate_event_eligibility(event_obj.id)
        
        if event_id:
            message = "Event Updated Successfully"
            EventRepo.send_push_notifications_for_event_update(event_obj)
        else:
            EventRepo.send_push_notifications_for_event(event_obj)
            message = "Event Created Successfully"

        if request_data.get("material_notification") == 1:
            EventRepo.send_push_notifications_for_material_upload(event_obj)
        share_event = EventRepo.share(event_obj.id,event_obj.title)
        return {"message": message,"id":event_obj.id}

    @staticmethod
    def build_event_data(request_data, session_id):
        """Builds event data dictionary from request data."""
        return {
            'user_id': session_id,
            'title': request_data.get('title'),
            'ar_title': request_data.get('ar_title'),
            'category_id': request_data.get('category_id',0),
            'sub_category_id': request_data.get('sub_category_id',0),
            'description': request_data.get('description'),
            'ar_description': request_data.get('ar_description'),
            'time_zone': request_data.get('time_zone') or request.headers.get('Timezone') or os.getenv('d_t_z'),
            'start_date': EventService.normalize_date_value(request_data.get('start_date'), "start date"),
            'end_date': EventService.normalize_date_value(request_data.get('end_date'), "end date"),
            'start_time': EventService.normalize_time_value(request_data.get('start_time'), "start time"),
            'end_time': EventService.normalize_time_value(request_data.get('end_time'), "end time"),
            'event_type': request_data.get('event_type',0),
            'location_type': request_data.get('location_type',0),
            'meet_link': request_data.get('meet_link'),
            'location': request_data.get('location'),
            'latitude': request_data.get('latitude',0),
            'longitude': request_data.get('longitude',0),
            'to_location': request_data.get('to_location'),
            'to_latitude': request_data.get('to_latitude',0),
            'to_longitude': request_data.get('to_longitude',0),
            'price_type': request_data.get('price_type',0),
            'city': request_data.get('city'),
            'area': request_data.get('area'),
            'price': request_data.get('price',0),
            'journey_level_id': request_data.get('journey_level_id',0),
            'language_id': request_data.get('language_id'),
            'total_no_class': request_data.get('total_no_class',0),
            'call_per_week': request_data.get('call_per_week',0),
            'rule': request_data.get('rule'),
            'ar_rule': request_data.get('ar_rule'),
            'eligibility': request_data.get('eligibility'),
            'ar_eligibility': request_data.get('ar_eligibility'),
            'cancellation_policy': request_data.get('cancellation_policy'),
            'ar_cancellation_policy': request_data.get('ar_cancellation_policy'),
            'terms_condition': request_data.get('terms_condition'),
            'ar_terms_condition': request_data.get('ar_terms_condition'),
            'status': request_data.get('status', 1),
            'gender': request_data.get('gender', 0),
            'duration': request_data.get('duration', 0),
            'available': request_data.get('available', 0),
            'qrcode_type': request_data.get('qrcode_type', 0),
            'ticket_type': request_data.get('ticket_type', 0),
            'quantity_per_user': max(1, int(request_data.get('quantity_per_user', 1))),
            'swipe_checkin': request_data.get('swipe_checkin', 0),
            'occusr_type': request_data.get('occusr_type', 0),
            'occusr_weekday': request_data.get('occusr_weekday', ''),
            'occusr_month': request_data.get('occusr_month', 0),
            'course_breakdown': request_data.get('course_breakdown', 0),
            'itinerary_breakdown': request_data.get('itinerary_breakdown', 0),
            'checkin_range': request_data.get('checkin_range', 0),
            'day_off': request_data.get('day_off', ''),
            'created_by': session_id,
            'updated_by': session_id
        }

    @staticmethod
    def process_related_entities(request_data, event_id, session_id):
        """Processes related entities like images, tags, curriculum, facilities, speakers, and documents."""
        related_entities = [
            ('dates', EventService.process_dates),
            ('date_time', EventService.process_datetime),
            ('tickets', EventService.process_tickets),
            ('images', EventService.process_images),
            ('tags', EventService.process_tags),
            ('curriculum', EventService.process_curriculum),
            ('facilities', EventService.process_facilities),
            ('speakers', EventService.process_speakers),
            ('documents', EventService.process_documents),  # Added documents handler
            ('itinerary', EventService.process_itinerary)  # Added itinerary handler
        ]
        other_data = {
                "day_off": request_data.get("day_off",""),
                "available": request_data.get("available",0),
                "quantity_per_user": request_data.get("quantity_per_user", 1),
                "duration": request_data.get("duration",0),
                "time_zone": request_data.get("time_zone",""),
                "occusr_type": request_data.get("occusr_type", 1),
                "occusr_weekday": request_data.get("occusr_weekday", ""),
                "occusr_month": request_data.get("occusr_month", 1),
        } 
        start_date = EventService.normalize_date_value(request_data.get("start_date"), "start date")
        end_date = EventService.normalize_date_value(request_data.get("end_date"), "end date")
        other_data['start_date'] = start_date.date() if isinstance(start_date, datetime) else start_date
        other_data['end_date'] = end_date.date() if isinstance(end_date, datetime) else end_date

        for key, handler in related_entities:
            if key in request_data:
                handler(request_data[key], event_id, session_id,other_data)

        if not request_data.get('date_time') and not request_data.get('dates') and not EventRepo.get_dates_by_event_id(event_id):
            EventService.process_datetime(
                [{
                    "start_time": request_data.get("start_time"),
                    "end_time": request_data.get("end_time"),
                    "status": 1,
                }],
                event_id,
                session_id,
                other_data,
            )
   
    @staticmethod
    def process_dates(dates, event_id, session_id,other_data):
        """Adds or updates event images."""
        if dates:
            for date in dates:
                if date.get("id"):        
                    image_data_to_add = {
                        "status": date.get('status'),  
                        "updated_by": session_id,
                        "updated_on": datetime.utcnow()
                    }

                    EventService.update_or_create(date, image_data_to_add, EventRepo.update_date, None)
                    if date.get("times"):      
                        for time in date.get("times"):
                            if time.get("id"):    
                                image_data_to_add = {
                                    "available": time.get('available'),
                                    "status": time.get('status'),
                                    "updated_by": session_id,
                                    "updated_on": datetime.utcnow()
                                }
                                    
                                EventService.update_or_create(time, image_data_to_add, EventRepo.update_date_time, None)
                    
                    


    @staticmethod
    def process_datetime(date_times, event_id, session_id,other_data):
        """Create exactly the active sessions produced by the listing recurrence."""
        if date_times:
            occurrence_dates = EventService.occurrence_dates(
                other_data.get("start_date"),
                other_data.get("end_date"),
                other_data.get("occusr_type", 1),
                other_data.get("occusr_weekday", ""),
                other_data.get("occusr_month", 1),
            )
            for current_date in occurrence_dates:
                image_data_to_add = {
                    "event_id": event_id,
                    "date": current_date,
                    "status": 1,
                    "created_by": session_id,
                    "created_on": datetime.utcnow()
                } 
  
                new_date=EventService.update_or_create(None, image_data_to_add, None, EventRepo.add_date)
                
                for date_time in date_times:
                    image_data_to_add = {
                        "event_date_id": new_date.id,
                        "start_time": EventService.normalize_time_value(date_time.get('start_time')),
                        "end_time": EventService.normalize_time_value(date_time.get('end_time')),
                        "available": other_data["available"],
                        "status": date_time.get('status', 1),
                        "created_by": session_id,
                        "created_on": datetime.utcnow()
                    }
                    EventService.update_or_create(None, image_data_to_add, None, EventRepo.add_date_time)


    @staticmethod
    def process_images(images, event_id, session_id,other_data):
        """Adds or updates event images."""
        for image_data in images:
            if images:
                image_data_to_add = {
                    "event_id": event_id,
                    "cropped_image": image_data.get('cropped_image'),
                    "full_screen_image": image_data.get('full_screen_image'),
                    "created_by": session_id,
                    "updated_by": session_id
                }

                # Check for existing image by ID if provided
                image_id = image_data.get('id')
                if image_id:
                    existing_image = EventRepo.get_image_by_id(image_id)
                    if not existing_image:
                        raise ValueError(f"No image found with id: {image_id}")
                else:
                    # If no ID is provided, treat it as a new record
                    existing_image = None

                # Update or create the image
                EventService.update_or_create(
                    existing_image, image_data_to_add, EventRepo.update_image, EventRepo.add_image
                )


    @staticmethod
    def process_tickets(tickets, event_id, session_id,other_data):
        """Adds or updates event tickets."""
        if tickets is not None:
            active_ticket_ids = {
                int(ticket_data.get('id'))
                for ticket_data in tickets
                if ticket_data.get('id')
            }
            existing_tickets = EventTicket.query.filter_by(event_id=event_id, status=1).all()
            for existing in existing_tickets:
                if existing.id not in active_ticket_ids:
                    if existing.booked:
                        raise ServiceError("Cannot remove a ticket type with active bookings")
                    existing.status = 0
                    existing.updated_by = session_id

            for ticket_data in tickets:
                try:
                    max_per_user = max(1, int(ticket_data.get('max_per_user', other_data.get('quantity_per_user', 1))))
                except (TypeError, ValueError):
                    raise ServiceError("Maximum per User must be a positive whole number")

                # Check for existing image by ID if provided
                ticket_id = ticket_data.get('id')
                if ticket_id:
                    existing_ticket = EventRepo.get_ticket_by_id(ticket_id)
                    if not existing_ticket:
                        raise ValueError(f"No Ticket found with id: {ticket_id}")
                    ticket_data_to_add = {
                        "event_id": event_id,
                        "title": ticket_data.get('title'),
                        "price": ticket_data.get('price',0),
                        "available": ticket_data.get('available',0),
                        "max_per_user": max_per_user,
                        "status": ticket_data.get('status',1),
                        "created_by": session_id,
                        "updated_by": session_id
                    }
                else:
                    # If no ID is provided, treat it as a new record
                    existing_ticket = None
                    ticket_data_to_add = {
                        "event_id": event_id,
                        "title": ticket_data.get('title'),
                        "price": ticket_data.get('price',0),
                        "available": ticket_data.get('available',0),
                        "max_per_user": max_per_user,
                        "booked": 0,
                        "status": ticket_data.get('status',1),
                        "created_by": session_id,
                        "updated_by": session_id
                    }

                # Update or create the image
                EventService.update_or_create(
                    existing_ticket, ticket_data_to_add, EventRepo.update_ticket, EventRepo.add_ticket
                )

            db.session.commit()


    @staticmethod
    def process_tags(tags, event_id, session_id,other_data):
        """Adds or updates event tags, ensuring no duplicate tags for the same EventRepo."""
        if tags:
            for tag_data in tags:
                if 'tag_id' in tag_data:  # Existing tag by tag_id
                    tag_id = tag_data.get('tag_id')

                    # Check if the tag is already associated with this event
                    existing_event_tag = EventRepo.get_tag_by_event_id_and_tag_id(event_id, tag_id)
                    if existing_event_tag:
                        continue  # Skip adding if the tag is already associated with this event

                    tag_data_to_add = {
                        "event_id": event_id,
                        "tag_id": tag_id,
                        "created_by": session_id,
                        "updated_by": session_id
                    }
                    EventRepo.add_tag(tag_data_to_add)

                elif 'tag_name' in tag_data:  # New or existing tag by tag_name
                    tag_name = tag_data.get('tag_name')

                    # Check if the tag already exists in the Tags table
                    existing_tag = EventRepo.get_tag_by_name(tag_name)

                    if existing_tag:  # If tag exists, use the existing tag id
                        tag_id = existing_tag.id
                    else:  # Otherwise, add a new tag to the Tags table
                        new_tag_data = {
                            'title': tag_name,
                            'ar_title': tag_data.get('ar_tag_name', ""),  # Assuming Arabic tag name is optional
                            'created_by': session_id,
                            'updated_by': session_id
                        }
                        new_tag = EventRepo.add_new_tag(new_tag_data)
                        tag_id = new_tag.id  # The ID of the newly created tag

                    # Check if the tag is already associated with this event
                    existing_event_tag = EventRepo.get_tag_by_event_id_and_tag_id(event_id, tag_id)
                    if existing_event_tag:
                        continue  # Skip adding if the tag is already associated with this event

                    # Now associate the tag (whether new or existing) with the event
                    tag_data_to_add = {
                        "event_id": event_id,
                        "tag_id": tag_id,
                        "created_by": session_id,
                        "updated_by": session_id
                    }
                    EventRepo.add_tag(tag_data_to_add)





    @staticmethod
    def process_curriculum(curriculums, event_id, session_id,other_data):
        """Adds or updates event curriculum."""
        if curriculums is None:
            return

        active_curriculum_ids = {
            int(curriculum_data.get('id'))
            for curriculum_data in curriculums
            if curriculum_data.get('id')
        }
        existing_curriculums = EventCurriculum.query.filter_by(
            event_id=event_id,
            status=1,
        ).all()
        for existing in existing_curriculums:
            if existing.id not in active_curriculum_ids:
                existing.status = 0
                existing.updated_by = session_id

        for curriculum_data in curriculums:
            description = str(curriculum_data.get('description') or '').strip()
            if not description:
                raise ServiceError("Class description is required")
            start_date = EventService.normalize_date_value(
                curriculum_data.get('start_date'),
                "class start date",
            )
            end_date = EventService.normalize_date_value(
                curriculum_data.get('end_date'),
                "class end date",
            )
            start_time = EventService.normalize_time_value(
                curriculum_data.get('start_time'),
                "class start time",
            )
            end_time = EventService.normalize_time_value(
                curriculum_data.get('end_time'),
                "class end time",
            )
            if end_date.date() < start_date.date() or (
                end_date.date() == start_date.date() and end_time < start_time
            ):
                raise ServiceError("Class end must be after its start")
            try:
                no_of_days = int(curriculum_data.get('no_of_days'))
            except (TypeError, ValueError):
                no_of_days = (end_date.date() - start_date.date()).days + 1
            if no_of_days < 1:
                raise ServiceError("Number of class days must be positive")

            curriculum_data_to_add = {
                "event_id": event_id,
                "description": description,
                "ar_description": curriculum_data.get('ar_description'),
                "no_of_days": no_of_days,
                "start_date": start_date,
                "end_date": end_date,
                "start_time": start_time,
                "end_time": end_time,
                "created_by": session_id,
                "updated_by": session_id,
                "status": curriculum_data.get('status', 1),
            }

            curriculum_id = curriculum_data.get('id')
            if curriculum_id:
                existing_curriculum = EventRepo.get_curriculum_by_id(curriculum_id)
                if not existing_curriculum:
                    raise ValueError(f"No curriculum found with id: {curriculum_id}")
                if existing_curriculum.event_id != event_id:
                    raise ServiceError("Curriculum does not belong to this event")
            else:
                existing_curriculum = None

            EventService.update_or_create(
                existing_curriculum,
                curriculum_data_to_add,
                EventRepo.update_curriculum,
                EventRepo.add_curriculum,
            )
        EventRepo.updateNumberofclass(event_id)

    @staticmethod
    def process_facilities(facilities, event_id, session_id,other_data):
        """Adds or updates event facilities, ensuring no duplicate facilities for the same EventRepo."""
        if facilities:
            for facility_data in facilities:
                facilities_id = facility_data.get('facilities_id')

                # Check if the facility is already associated with this event
                existing_facility = EventRepo.get_facility_by_event_id_and_facilities_id(event_id, facilities_id)
                if existing_facility:
                    continue  # Skip adding if the facility is already associated with this event

                # Add new facility to the EventFacilities table
                facility_data_to_add = {
                    "event_id": event_id,
                    "facilities_id": facilities_id,
                    "created_by": session_id,
                    "updated_by": session_id
                }
                EventRepo.add_facility(facility_data_to_add)

                    
    @staticmethod
    def process_speakers(speakers, event_id, session_id,other_data):
        """Adds or updates event speakers, ensuring no duplicate speakers for the same EventRepo."""
        if speakers:
            for speaker_data in speakers:
                if 'user_id' in speaker_data:  # Existing speaker linked via user_id
                    user_id = speaker_data.get('user_id')

                    # Check if the speaker is already associated with this event by user_id
                    existing_speaker = EventRepo.get_speaker_by_event_id_and_user_id(event_id, user_id)
                    if existing_speaker:
                        continue  # Skip adding if the speaker is already associated with this event

                    speaker_data_to_add = {
                        "event_id": event_id,
                        "user_id": user_id,
                        "created_by": session_id,
                        "updated_by": session_id
                    }
                    EventRepo.add_speaker(speaker_data_to_add)

                else:  # New speaker (no user_id, so using first_name, last_name, image)
                    first_name = speaker_data.get('first_name')
                    last_name = speaker_data.get('last_name')
                    image = speaker_data.get('image')

                    # Check if the speaker is already associated with this event by name
                    existing_speaker = EventRepo.get_speaker_by_event_id_and_name(event_id, first_name, last_name)
                    if existing_speaker:
                        continue  # Skip adding if the speaker is already associated with this event

                    # Add new speaker to the EventSpeakers table
                    speaker_data_to_add = {
                        "event_id": event_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "image": image,
                        "created_by": session_id,
                        "updated_by": session_id
                    }
                    EventRepo.add_speaker(speaker_data_to_add)



    @staticmethod
    def process_documents(documents, event_id, session_id,other_data):
        """Adds or updates event documents."""
        if documents:
            for document_data in documents:
                #if document_data.get('file_path'):
                    document_data_to_add = {
                        "event_id": event_id,
                        "document_name": document_data.get('document_name'),
                        "ar_document_name": document_data.get('ar_document_name'),
                        "file_path": document_data.get('file_path'),
                        "created_by": session_id,
                        "updated_by": session_id
                    }

                    # Check for existing document by ID if provided
                    document_id = document_data.get('id')
                    if document_id:
                        existing_document = EventRepo.get_document_by_id(document_id)
                        if not existing_document:
                            raise ValueError(f"No document found with id: {document_id}")
                        if existing_document.event_id != event_id:
                            raise ServiceError("Document does not belong to this event")
                    else:
                        # If no ID is provided, treat it as a new record
                        existing_document = None

                    # Update or create the document
                    new_document=EventService.update_or_create(existing_document, document_data_to_add, EventRepo.update_document, EventRepo.add_document)

                    if document_data.get('files'):
                        for file in document_data.get('files'):
                                document_file_to_add = {
                                    "event_document_id": new_document.id,
                                    "file_path": file.get('file_path'),
                                    "created_by": session_id,
                                    "updated_by": session_id
                                }

                                # Check for existing document by ID if provided
                                file_id = file.get('id')
                                if file_id:
                                    existing_file = EventRepo.get_document_file_by_id(file_id)
                                    if not existing_file:
                                        raise ValueError(f"No document file found with id: {file_id}")
                                    if existing_file.event_document_id != new_document.id:
                                        raise ServiceError("Document file does not belong to this event")
                                else:
                                    # If no ID is provided, treat it as a new record
                                    existing_file = None

                                # Update or create the document
                                EventService.update_or_create(existing_file, document_file_to_add, EventRepo.update_document_file, EventRepo.add_document_file)

                
    @staticmethod
    def process_itinerary(itinerary, event_id, session_id,other_data):
        """Adds or updates event itineraries."""
        if itinerary:
            for itinerary_data in itinerary:
                # itinerary_data['start_date'],itinerary_data['start_time']=EventRepo.convert_to_gmt_separate(itinerary_data.get('start_date'),itinerary_data.get('start_time'),other_data.get('time_zone'))
                # itinerary_data['end_date'],itinerary_data['end_time']=EventRepo.convert_to_gmt_separate(itinerary_data.get('end_date'),itinerary_data.get('end_time'),other_data.get('time_zone'))
                itinerary_data_to_add = {
                    "event_id": event_id,
                    "day": itinerary_data.get('day'),
                    "title": itinerary_data.get('title'),
                    "ar_title": itinerary_data.get('ar_title'),
                    "start_time": itinerary_data.get('start_time'),
                    "end_time": itinerary_data.get('end_time'),
                    "start_date": itinerary_data.get('start_date'),
                    "end_date": itinerary_data.get('end_date'),
                    "created_by": session_id,
                    "updated_by": session_id
                }
                
                # Check if an existing itinerary entry matches this event, day, and title
                existing_itinerary = EventRepo.get_itinerary_by_event_id_day_and_title(
                    event_id,itinerary_data.get('id')
                )
                
                EventService.update_or_create(
                    existing_itinerary, itinerary_data_to_add, EventRepo.update_itinerary, EventRepo.add_itinerary
                )


    @staticmethod
    def update_or_create(existing_entity, data, update_func, create_func):
        """Updates existing entity or creates a new one."""
        if existing_entity:
            if isinstance(existing_entity, dict):
                if "id" in existing_entity:
                    return update_func(existing_entity.get("id"), data)
            elif hasattr(existing_entity, "id"):
                return update_func(existing_entity.id, data)
        # if existing_entity:
            # if existing_entity.id:
                # return update_func(existing_entity.id, data)
            # if existing_entity.get("id"):
                # return update_func(existing_entity.get("id"), data)
        else:
            return create_func(data)




#######################################    end of creaate and event ###########################################

######################################   delete event #########################################################


  
    @staticmethod
    @handle_service_errors
    def soft_delete(request_data, session_id):
        """Soft deletes entities based on the type parameter."""
        
        entity_id = request_data.get('id')
        entity_type = request_data.get('type')
        event_id = request_data.get('event_id')

        if not entity_id or not entity_type:
            raise ServiceError("Both 'id' and 'type' are required")

        if entity_type in [2, 3, 4, 5, 6, 7, 8, 9, 10] and not event_id:
            raise ServiceError("Both 'id' and 'event_id' are required for type 2 to 10")

        # Map entity type to corresponding soft delete function
        delete_function_map = {
            1: EventService.soft_delete_event,   # type = 1 for events only
            2: EventRepo.soft_delete_image_by_id,    # type = 2 for event images by primary key
            3: EventRepo.soft_delete_tag_by_id,      # type = 3 for event tags by primary key
            4: EventRepo.soft_delete_curriculum_by_id,  # type = 4 for event curriculum by primary key
            5: EventRepo.soft_delete_facility_by_id,    # type = 5 for event facilities by primary key
            6: EventRepo.soft_delete_speaker_by_id,     # type = 6 for event speakers by primary key
            7: EventRepo.soft_delete_document_by_id,     # type = 7 for event documents by primary key
            8: EventRepo.soft_delete_document_file_by_id,     # type = 8 for event documents file by primary key
            9: EventRepo.soft_delete_ticket_by_id,     # type = 9 for event ticket by primary key
            10: EventRepo.soft_delete_itinerary_by_id,     # type = 10 for event itinerary by primary key
            11: EventService.cancle_event     # type = 11 for event cancle
        }

        # Get the appropriate delete function based on the type
        delete_function = delete_function_map.get(entity_type)

        if not delete_function:
            raise ServiceError(f"Unsupported entity type: {entity_type}")

        # Call the delete function with the entity ID and session ID
        if entity_type == 1 or entity_type == 11:
            delete_function(entity_id, session_id)
        else:
            delete_function(entity_id, event_id, session_id)
        
        if entity_type == 1:
            return {"message": f"Event deleted successfully"}
        elif entity_type == 11:
            return {"message": f"Event cancelled successfully"}
        else:
            return {"message": f"Entity type {entity_type} with ID {entity_id} deleted successfully"}
        

    @staticmethod
    def soft_delete_event(event_id, session_id):
        """Soft deletes an event only without affecting related entities."""
        event_obj = EventRepo.get_event_by_id(event_id)
        if not event_obj:
            raise ServiceError("Event not found")
            
        event_count=EventRepo.total_participants_count(event_id)
        if event_count>0:
            raise ServiceError("Event already booked by customer, please cancle event before deleting")            
            
        # Change event status to 3 (soft deleted)
        event_data = {'status': 3, 'updated_by': session_id}
        EventRepo.update_event(event_id, event_data)

        
    @staticmethod
    def cancle_event(event_id, session_id):
        """Soft deletes an event only without affecting related entities."""
        event_obj = EventRepo.get_event_by_id_and_user_id(event_id, session_id)
        if not event_obj:
            raise ServiceError("Event not found")
            
        EventRepo.cancle_event_all_booking(event_id,session_id)
        
        # Change event status to 4 ( cancle)
        event_data = {'status': 4, 'updated_by': session_id}
        EventRepo.update_event(event_id, event_data)
        from app.services.payment import PaymentService
        PaymentService.cancel_event_refunds(event_id)

        
        
        
#######################################   end of delete event  ###########################################


    @staticmethod
    @handle_service_errors
    def get_event_details(request_data,session_id):
        """Fetches all details of an event by its ID."""

        EventService._ensure_p0_tables()
        GamificationService.ensure_storage()
        event_id = request_data.get('id')
        # Fetch the event by ID
        event_obj = EventRepo.get_event_by_id_and_user_id(event_id,session_id)
        if not event_obj:
            raise ServiceError("Event not found")

       
        start_date_str = event_obj.start_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event_obj.start_date, datetime) else event_obj.start_date
        end_date_str = event_obj.end_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event_obj.end_date, datetime) else event_obj.end_date
        start_time_str = event_obj.start_time.strftime('%H:%M:%S') if isinstance(event_obj.start_time, time) else event_obj.start_time 
        end_time_str = event_obj.end_time.strftime('%H:%M:%S') if isinstance(event_obj.end_time, time) else event_obj.end_time
        
        # start_time_str = event_obj.start_time.strftime('%H:%M:%S') if event_obj.start_time else None
        # end_time_str = event_obj.end_time.strftime('%H:%M:%S') if event_obj.end_time else None


        get_participant_count_by_event_and_date = EventRepo.get_participant_count_by_event_and_date(event_id,session_id)


        total_participants_count = EventRepo.total_participants_count_user(event_id) or 0
        total_revenue = EventRepo.total_revenue(event_id) or 0
        feedback_aggregate = GamificationService.feedback_aggregate(event_id)
        
        participant_images = EventRepo.participant_images_user(event_id)

   
        
        

        # Build event details response
        language = db.session.get(Language, event_obj.language_id) if event_obj.language_id else None
        event_details = {
            "id": event_obj.id,
            "time_zone": event_obj.time_zone,
            "user_id": event_obj.user_id,
            "title": event_obj.title,
            "ar_title": event_obj.ar_title,
            "category_id": event_obj.category_id,
            "sub_category_id": event_obj.sub_category_id,
            "description": event_obj.description,
            "ar_description": event_obj.ar_description,
            "start_date": start_date_str,
            "end_date": end_date_str,
            "start_time": start_time_str,  # Convert time to string
            "end_time": end_time_str,      # Convert time to string
            "event_type": event_obj.event_type,
            "location_type": event_obj.location_type,
            "location": event_obj.location,
            "latitude": event_obj.latitude,
            "longitude": event_obj.longitude,
            "to_location": event_obj.to_location,
            "to_latitude": event_obj.to_latitude,
            "to_longitude": event_obj.to_longitude,
            "price_type": event_obj.price_type,
            "meet_link": event_obj.meet_link,
            "city": event_obj.city,
            "area": event_obj.area,
            "price": event_obj.price,
            "journey_level_id": event_obj.journey_level_id,
            "language_id": event_obj.language_id,
            "language_title": language.title if language else None,
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
            "status": event_obj.status,
            "gender": event_obj.gender,
            "duration": event_obj.duration,
            "day_off": event_obj.day_off,
            "qrcode_type": event_obj.qrcode_type,
            "ticket_type": event_obj.ticket_type,
            "quantity_per_user": event_obj.quantity_per_user,
            "course_breakdown": event_obj.course_breakdown,
            "itinerary_breakdown": event_obj.itinerary_breakdown,
            "checkin_range": event_obj.checkin_range,
            "swipe_checkin": event_obj.swipe_checkin,
            "occusr_type": event_obj.occusr_type,
            "occusr_month": event_obj.occusr_month,
            "occusr_weekday": event_obj.occusr_weekday,
            "available": event_obj.available,
            "get_participant_count_by_event_and_date": get_participant_count_by_event_and_date,
            "total_participants_count": total_participants_count,
            "total_revenue": total_revenue,
            "feedback_aggregate": feedback_aggregate,
            "guest_booking_enabled": EventService._guest_booking_enabled(event_id),
            "participant_images": participant_images
             
        }
        classification = GamificationService.verified_activity_dimensions(event_obj)
        event_details.update({
            "topic_id": classification["topic_id"],
            "topic_title": classification["topic_title"],
            "radar_area": classification["radar_area"],
            "radar_description": getattr(event_obj.subcategory, "classification_description", None),
        })

        # event_details['actual_start_date']=event_details.get('start_date')
        # event_details['actual_end_date']=event_details.get('end_date')
        
        # start_date_time=EventRepo.convert_from_gmt_separate(event_details.get('start_date'),event_details.get('start_time'),event_details.get('time_zone'))
        # if start_date_time:
            # event_details['start_date']=start_date_time.get('date')
            # event_details['start_time']=start_date_time.get('time')
        # end_date_time=EventRepo.convert_from_gmt_separate(event_details.get('end_date'),event_details.get('end_time'),event_details.get('time_zone'))
        # if end_date_time:
            # event_details['end_date']=end_date_time.get('date')
            # event_details['end_time']=end_date_time.get('time')
        
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

        if event_obj.journey_level_id:
            event_details["journey_level_title"] = EventRepo.get_journey_level_name(event_obj.journey_level_id)

        # Fetch related entities and include in the response
        event_details["dates"] = EventRepo.get_dates_by_event_id(event_id)
        # if event_details["dates"]:
            # event_details["dates"]=EventRepo.convert_dates_from_gmt(event_details.get('dates'),event_details.get('time_zone'))
        event_details["images"] = EventRepo.get_images_by_event_id(event_id)
        event_details["tickets"] = EventRepo.get_tickets_by_event_id(event_id)
        event_details["tags"] = EventRepo.get_tags_by_event_id(event_id)
        event_details["curriculum"] = EventRepo.get_curriculum_by_event_id(event_id)
        event_details["facilities"] = EventRepo.get_facilities_by_event_id(event_id)
        event_details["speakers"] = EventRepo.get_speakers_by_event_id(event_id)
        event_details["documents"] = EventRepo.get_documents_by_event_id(event_id)
        event_details["itineraries"] = EventRepo.get_itinerary_by_event_id(event_id)

        if event_obj.journey_level_id or event_obj.journey_level_id==0:
            event_details["journey_level_sub_name"] = EventRepo.get_journey_level_sub_name(event_obj.journey_level_id)
            event_details["journey_level_name"] = EventRepo.get_journey_level_name(event_obj.journey_level_id)

        return event_details
        
         
        
#########      end of event get by  id ########################



    @staticmethod
    @handle_service_errors
    def get_master_data():
        """Fetches active facilities, tags, categories with subcategories, and speakers."""

        GamificationService.ensure_storage()

        # Get all active facilities
        active_facilities = EventRepo.get_active_master_facilities()

        # Get all active tags
        active_tags = EventRepo.get_active_master_tags()

        # Get all active categories with subcategories
        active_categories_with_subcategories = EventRepo.get_active_categories_with_subcategories()
        
        # Get all active speakers
        active_speakers = EventRepo.get_active_speakers()
        
        active_journey_levels = EventRepo.get_active_master_journey_levels()
        active_languages = EventRepo.get_active_master_languages()
        
        return {
            "facilities": active_facilities,
            "tags": active_tags,
            "categories": active_categories_with_subcategories,
            "speakers": active_speakers,
            "journey_level":active_journey_levels,
            "languages": active_languages,
        }
        
        
        
#######################  list of event ##########################


    @staticmethod
    @handle_service_errors
    def get_all_events_by_user_id(request_data,session_id):
        """Fetches active facilities, tags, categories with subcategories, and speakers."""

        # Get all active facilities
        events= EventRepo.get_filtered_events(request_data,session_id)
        nnc=user.get_new_notification_count(session_id) 
        events["new_notification_count"]= nnc
        return events


   

    @staticmethod
    @handle_service_errors
    def get_participant_attendance_list(request_data):
        participant_id=request_data.get('participant_id')
        events= EventRepo.get_participant_attendance_list(participant_id)
        return events
        
        
    @staticmethod
    @handle_service_errors
    def dashboard(session_id):
        obj = DashboardRepo.organizer_dashboard(session_id)
        nnc=user.get_new_notification_count(session_id) 
        obj["new_notification_count"]= nnc
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError('Unable to get setting')

        return obj
    


    @staticmethod
    @handle_service_errors
    def participant_list(request_data, session_id):
        safe_request = dict(request_data or {})
        EventService._owned_event(safe_request.get('event_id'), session_id)
        safe_request['role_type'] = 3
        safe_request['organiser_id'] = session_id
        obj = EventRepo.get_event_participants(safe_request)
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError('Unable to get participants')

        return obj
    
    

    @staticmethod
    @handle_service_errors
    def participant_attendance(request_data):
        obj = EventRepo.participant_attendance(request_data)
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError('Unable to get participants')

        return obj

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
    def update_attendance(request_data,session_id):
        request_data = request_data or {}
        qrcode = request_data.get('qrcode')
        if not qrcode:
            raise ServiceError("QR code is required")
        
        attendance_response = EventRepo.update_attendance(
            qrcode,
            session_id,
            expected_event_id=request_data.get('event_id'),
        )
        if isinstance(attendance_response, dict) and 'error3' in attendance_response:
            raise ServiceError("Participant not found for today")
        if isinstance(attendance_response, dict) and 'error' in attendance_response:
            raise ServiceError("Participant has already been marked as present for today")
        if isinstance(attendance_response, dict) and 'error2' in attendance_response:
            raise ServiceError("Participant not found")
        if isinstance(attendance_response, dict) and 'error4' in attendance_response:
            raise ServiceError("Not Your Event ")
        if isinstance(attendance_response, dict) and 'error5' in attendance_response:
            raise ServiceError("Event Not Found")
        if isinstance(attendance_response, dict) and 'error6' in attendance_response:
            raise ServiceError("User Cancelled Booking")
        if isinstance(attendance_response, dict) and 'error7' in attendance_response:
            raise ServiceError("QR code belongs to another listing")

        return {"message": "Attendance updated successfully","scan_quantity":attendance_response.scan_quantity}
    
    
    
    @staticmethod
    @handle_service_errors
    def update_event_answer(request_data, session_id):
        request_data = dict(request_data or {})
        answer = (request_data.get('answer') or '').strip()
        if not answer:
            raise ServiceError("Answer is required")
        EventService._owned_event(request_data.get('event_id'), session_id)
        request_data['answer'] = answer
        obj = EventRepo.update_event_answer(request_data, session_id)
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError(obj.get('error') or "Unable to update answer")

        return {"message": "Answer updated successfully"}
    
    
    
    
    @staticmethod
    @handle_service_errors
    def get_request_buddy(request_data,session):
        
        
        request_data['session'] = session
        events= EventRepo.get_request_buddy(request_data)
        
        
        results = []
        for data in events:
            # Assuming `data` is an object and has attributes like `id`, `event_id`, etc.
            if not data.time_zone:
                data_time_zone=os.getenv('d_t_z')
            else:
                data_time_zone=data.time_zone
            data_return = {
                "id": data.id,
                "event_id": data.event_id,
                "event_title": data.event_title,
                "time_zone": data_time_zone,
                "buddy_id": data.buddy_id,
                "user_id": data.user_id,
                "user_first_name": data.user_first_name,
                "user_last_name": data.user_last_name,
                "buddy_first_name": data.buddy_first_name,
                "buddy_last_name": data.buddy_last_name,
                "user_profile_image": data.user_profile_image,
                "user_mobile": data.user_mobile_number,
                "country_code": data.user_country_code,
                "requested_date": data.created_on,
                "date": data.date.strftime("%Y-%m-%d") if isinstance(data.date, date) else data.date,
                "time": data.time.strftime("%H:%M:%S") if isinstance(data.time, time) else data.time,
                "meet_link": data.meet_link,
                "location_type": data.location_type,
                "location": data.location,
                "duration_minutes": data.duration_minutes or 60,
                "status_reason": data.status_reason,
                "speaker_id": data.speaker_id,
                "user_comment": data.user_comment,
                "status": data.status,
                "status_label": OneToOneService.status_label(data.status),
                "type": data.type
            }
            results.append(data_return)
        
        return results


    @staticmethod
    @handle_service_errors
    def assign_buddy(request_data, session):
        """Assign one active child Buddy to an organiser-owned request once."""
        payload = dict(request_data or {})
        try:
            request_id = int(payload.get("request_buddy_id", payload.get("id")))
            buddy_id = int(payload.get("buddy_id"))
        except (TypeError, ValueError):
            raise ServiceError("Request and Buddy are required")
        if request_id <= 0 or buddy_id <= 0:
            raise ServiceError("Request and Buddy are required")

        request_buddy = Request_buddy.query.filter_by(
            id=request_id,
            type=1,
        ).first()
        if request_buddy is None:
            raise ServiceError("Buddy request not found")
        event = Event.query.filter_by(
            id=request_buddy.event_id,
            user_id=session,
        ).first()
        if event is None:
            raise ServiceError("Buddy request not found")

        buddy = BuddyRepository.get_user_by_id(buddy_id)
        if buddy is None or buddy.status != 1 or buddy.parent_id != int(session):
            raise ServiceError("Select an active Buddy from your organisation")
        if request_buddy.buddy_id not in (None, 0, buddy_id):
            raise ServiceError("This request is already assigned to another Buddy")

        already_assigned = request_buddy.buddy_id == buddy_id
        if not already_assigned:
            request_buddy.buddy_id = buddy_id
            request_buddy.status = 1
            request_buddy.updated_by = session
            request_buddy.updated_on = datetime.utcnow()
            db.session.commit()
            # The repository method uses a request-scoped idempotency key for
            # each recipient, so retries cannot duplicate either notification.
            EventRepo.send_buddy_notifications(
                request_buddy.user_id,
                buddy_id,
                request_buddy.event_id,
                request_buddy.id,
            )

        return {
            "message": "Buddy assigned successfully" if not already_assigned else "Already assigned",
            "request_buddy_id": request_buddy.id,
            "event_id": request_buddy.event_id,
            "buddy_id": buddy.id,
            "buddy_name": " ".join(filter(None, [buddy.first_name, buddy.last_name])),
            "idempotent": already_assigned,
        }


    @staticmethod
    @handle_service_errors
    def get_notificaions(request_data,session):
        
        request_data['session'] = session
        events= EventRepo.get_notificaions(request_data)
        
        
        results = []
        for data in events:
            # Assuming `data` is an object and has attributes like `id`, `event_id`, etc.
            data_return = {
                "id": data.id,
                "event_id": data.event_id,
                "event_title": data.event_title,
                "question": data.question,
                "user_id": data.user_id,
                "user_first_name": data.user_first_name,
                "user_last_name": data.user_last_name,
                "user_profile_image": data.user_profile_image,
                "user_mobile": data.user_mobile_number,
                "requested_date": data.created_on,
                "status": data.status,
                "type": data.type
            }
            results.append(data_return)
        
        return results
    
    
    
    @staticmethod
    @handle_service_errors
    def get_notificaion_count(request_data,session):

        
        request_data['session'] = session
        events= EventRepo.get_notificaion_count(request_data)
        
        
        return events
    
    
    
    @staticmethod
    @handle_service_errors
    def get_request_buddy_count(type,session):
    
        events= EventRepo.get_request_buddy_count(type,session)
        return {'count':events}
    
    
    
    @staticmethod
    @handle_service_errors
    def update_status_request_buddy(request_data,session):    
        return OneToOneService.update_session(session, "organiser", request_data)
    
    
    
    
    @staticmethod
    @handle_service_errors
    def add_rating(session_id, request_data):
    
        event_id = request_data.get('event_id')
        user_id = request_data.get('user_id')
        title = request_data.get('title')
        rating_value = request_data.get('rating_value')
        review = request_data.get('review')
        
        if not user_id:
            raise ServiceError("User ID is required")
        if not event_id:
            raise ServiceError("Event ID is required")
        event = EventRepo.get_event_by_id(event_id)
        if not event:
            raise ServiceError("Event not found")

        rating_request_data = {
            'to_user_id': user_id,
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
        if not request_data.get('user_id'):    
            request_data['user_id']=session_id
        data = EventRepo.get_rating(request_data)
        return data
    
    
    
    @staticmethod
    @handle_service_errors
    def get_announcement(session_id, request_data):
        request_data["user_id"]=session_id
        data = EventRepo.get_announcement(session_id,request_data)
        return data
    
    
    
    @staticmethod
    @handle_service_errors
    def get_user_profile(business_id):
        user_obj = user.customer_profile(business_id)
        
        user_obj['attended_count']=user_obj.get('event_count',0)+user_obj.get('course_count',0)        
        user_obj['award_level'] = user.get_award_level(user_obj['attended_count'])
        
        if isinstance(user_obj, dict) and 'error' in user_obj:
            raise ServiceError('Business not found')
    
        return user_obj
    
    @staticmethod
    @handle_service_errors
    def add_announcement(session_id, request_data):
        event_id = request_data.get('event_id')
        title = request_data.get('title')
        message = str(request_data.get('message') or '').strip()
        if not message:
            raise ServiceError("message is required")

        event = EventService._owned_event(event_id, session_id)
        if not title:
            title=event.title

        get_organizer = OrganizerRepository.get_organization_by_user_id(event.user_id)

        combined_message = f"{title} {message}" if title else message

        rating_request_data = {
            'event_id': event_id,
            'title': get_organizer.organization_name,
            'message': combined_message,
            'created_by': session_id
        }
        
        event_information = EventRepo.add_announcement(rating_request_data)
        rating_request_data['announcement_id'] = event_information.id
        EventRepo.send_push_notifications_for_event_announcement(rating_request_data)
        return {"message": "added successfully"}
