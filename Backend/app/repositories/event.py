from app.models.event import Event,EventImages,EventTicket,EventDate,EventDateTime,EventCurriculum,EventTags,EventFacilities,EventSpeakers,EventDocuments,EventDocumentsFiles,Tag,Facilities,EventItinerary,Participant,ParticipantQrcode,SearchHistory,PaymentTransaction,JourneyLevel,Language,ParticipantsAttendance,ParticipantsQrcodeAttendance,Answer_and_question,Event_note,Request_buddy,Rating,EventAnnouncements
from app.models.users import Notification_History, Users
from app.models.wishlist import Wishlist
from app.utils.file_upload import upload_base64_file,create_pdf_file

 
from app.repositories.wishlist import WishlistRepository
from app.repositories.user import user
from app.repositories.organizer import OrganizerRepository
from flask import request, has_request_context
import traceback
from zoneinfo import ZoneInfo
from app.models.category import Category 
from app.models.organization import Organization
from app import db 
from app.utils.response_decorators import handle_repository_errors
from app.utils.public_links import public_open_path_url
from sqlalchemy import func,asc,desc,or_,and_,case,distinct,select,literal,literal_column, cast, Date, inspect
from sqlalchemy.sql import union_all,literal,text,over
from sqlalchemy.orm import aliased
from datetime import datetime, timedelta,time,date

import pytz
from collections import defaultdict
import qrcode 
from io import BytesIO
import base64
from flask import Flask
import re
from app.utils.load_notification_template import load_push_notification_template
from celery_ondeen import push_notification_user
from celery_ondeen import push_notification_org
import threading
from app.utils.notification_handler import async_push_notification_user,async_push_notification_org 
from flask import jsonify
from urllib.parse import unquote, urlparse
import stripe
import requests

import os
import math
import hashlib
create_payment_path = os.getenv('create_payment_path')

app = Flask(__name__)



class EventRepo:

    @staticmethod
    def _using_sqlite():
        bind = db.session.get_bind()
        return bool(bind and bind.dialect.name == "sqlite")

    @staticmethod
    def _using_mysql():
        bind = db.session.get_bind()
        return bool(bind and bind.dialect.name in ("mysql", "mariadb"))

    @staticmethod
    def _payment_transactions_for_participant(participant_id):
        """Find legacy transactions without relying on MySQL-only FIND_IN_SET."""
        participant_token = str(participant_id)
        return db.session.query(PaymentTransaction).filter(or_(
            PaymentTransaction.participant_id == participant_id,
            PaymentTransaction.all_participant_id == participant_token,
            PaymentTransaction.all_participant_id.like(f"{participant_token},%"),
            PaymentTransaction.all_participant_id.like(f"%,{participant_token}"),
            PaymentTransaction.all_participant_id.like(f"%,{participant_token},%"),
        )).all()

    @staticmethod
    def ensure_question_schema():
        """Add the reference Q&A anonymity field without replacing live data."""
        bind = db.session.get_bind()
        if bind is None:
            return
        Answer_and_question.__table__.create(bind=bind, checkfirst=True)
        inspector = inspect(bind)
        existing_columns = {
            column["name"] for column in inspector.get_columns("answer_and_question")
        }
        if "is_anonymous" not in existing_columns:
            with bind.begin() as connection:
                connection.execute(text(
                    "ALTER TABLE answer_and_question "
                    "ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT FALSE"
                ))

    @staticmethod
    def _as_list(value):
        if value is None or value == "":
            return []
        if isinstance(value, (list, tuple, set)):
            return [item for item in value if item is not None and item != ""]
        return [value]

    @staticmethod
    def _parse_filter_date(value):
        if not value:
            return None
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        value = str(value)
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%d-%m-%Y"):
            try:
                return datetime.strptime(value[:19], fmt).date()
            except ValueError:
                continue
        return None

    @staticmethod
    def _event_distance_miles(event, latitude, longitude):
        if latitude is None or longitude is None or event.latitude is None or event.longitude is None:
            return 0
        try:
            lat1 = math.radians(float(latitude))
            lon1 = math.radians(float(longitude))
            lat2 = math.radians(float(event.latitude))
            lon2 = math.radians(float(event.longitude))
        except (TypeError, ValueError):
            return 0

        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return 3958.8 * c

    @staticmethod
    def _app_event_sqlite(request_data):
        Timezone = request.headers.get('Timezone') or os.getenv('d_t_z') or 'Africa/Casablanca'
        now = datetime.now(ZoneInfo(Timezone))
        today = now.date()

        user_ids = EventRepo._as_list(request_data.get('organizer_id') or request_data.get('organizers'))
        category_ids = EventRepo._as_list(request_data.get('category_id') or request_data.get('categories'))
        sub_category_ids = EventRepo._as_list(request_data.get('sub_category_id'))
        location_value = request_data.get('location_type')
        if location_value in (None, ""):
            location_value = request_data.get('location')
        if isinstance(location_value, str) and not location_value.isdigit():
            location_value = None
        location_types = EventRepo._as_list(location_value)
        price_types = EventRepo._as_list(request_data.get('price_type') or request_data.get('priceTypes'))
        speaker_ids = EventRepo._as_list(request_data.get('speaker_id') or request_data.get('speakers'))
        journey_level_ids = EventRepo._as_list(request_data.get('journey_level_id') or request_data.get('journey_level'))

        start_date = EventRepo._parse_filter_date(request_data.get('start_date') or request_data.get('startDate'))
        end_date = EventRepo._parse_filter_date(request_data.get('end_date') or request_data.get('endDate'))
        keyword = request_data.get('keyword')
        status = request_data.get('status')
        gender = request_data.get('gender')
        if gender in (None, ""):
            gender = request_data.get('gender_id')
        if isinstance(gender, list):
            gender = gender[0] if gender else None
        if gender not in (None, ""):
            try:
                gender = int(gender)
            except (TypeError, ValueError):
                gender = None
        min_price = request_data.get('min_price')
        max_price = request_data.get('max_price')
        event_type = request_data.get('event_type')
        latitude = request_data.get('latitude')
        longitude = request_data.get('longitude')
        radius = request_data.get('radius')
        page = int(request_data.get('page', 1) or 1)
        per_page = int(request_data.get('per_page', 1000) or 1000)
        per_page = min(per_page, 1000)
        sort_options = request_data.get('sort')
        sort_options_filter = request_data.get('sort_Filter')
        recently_added_days = request_data.get('recently_added_days')
        upcoming_days = request_data.get('upcoming_days')
        ongoing_days = request_data.get('ongoing_days')

        if sort_options == 1:
            recently_added_days = recently_added_days or 7
        elif recently_added_days is not None:
            sort_options = 1
        if sort_options == 2:
            location_types = location_types or [1]
        if sort_options == 4:
            upcoming_days = upcoming_days or 1
        if isinstance(sort_options_filter, list):
            sort_options_filter = sort_options_filter[0] if sort_options_filter else None
        if sort_options_filter == 2:
            ongoing_days = ongoing_days or 1
        if sort_options_filter == 3:
            upcoming_days = upcoming_days or 1

        speaker_alias = aliased(Users)
        query = (
            Event.query
            .outerjoin(Category, Event.category_id == Category.id)
            .outerjoin(Organization, Event.user_id == Organization.user_id)
            .outerjoin(EventSpeakers, EventSpeakers.event_id == Event.id)
            .outerjoin(speaker_alias, EventSpeakers.user_id == speaker_alias.id)
            # Temporary product choice: keep the home/list feed populated for
            # remote users and demo data. Revisit before enforcing upcoming-only
            # visibility or distance-gated discovery again.
            .filter(Event.status == 1)
        )

        if user_ids:
            query = query.filter(Event.user_id.in_(user_ids))
        if category_ids:
            query = query.filter(Event.category_id.in_(category_ids))
        if sub_category_ids:
            query = query.filter(Event.sub_category_id.in_(sub_category_ids))
        if location_types:
            query = query.filter(Event.location_type.in_(location_types))
        if price_types:
            query = query.filter(Event.price_type.in_(price_types))
        if speaker_ids:
            query = query.filter(EventSpeakers.user_id.in_(speaker_ids))
        if journey_level_ids:
            query = query.filter(or_(Event.journey_level_id.in_(journey_level_ids), Event.journey_level_id == 0))
        if start_date and end_date:
            query = query.filter(or_(
                and_(func.date(Event.start_date) >= start_date, func.date(Event.start_date) <= end_date),
                and_(func.date(Event.end_date) >= start_date, func.date(Event.end_date) <= end_date),
                and_(start_date >= func.date(Event.start_date), start_date <= func.date(Event.end_date)),
                and_(end_date >= func.date(Event.start_date), end_date <= func.date(Event.end_date)),
            ))
        elif start_date:
            query = query.filter(func.date(Event.start_date) >= start_date)
        elif end_date:
            query = query.filter(func.date(Event.end_date) <= end_date)
        if keyword:
            keyword_like = f"%{keyword}%"
            query = query.filter(or_(
                Category.title.ilike(keyword_like),
                Event.title.ilike(keyword_like),
                Event.description.ilike(keyword_like),
                Organization.organization_name.ilike(keyword_like),
                speaker_alias.first_name.ilike(keyword_like),
                speaker_alias.last_name.ilike(keyword_like),
            ))
        if status not in (None, ""):
            query = query.filter(Event.status == status)
        if gender == 1:
            query = query.filter(Event.gender.in_([0, 1, 3]))
        elif gender == 2:
            query = query.filter(Event.gender.in_([0, 2, 3]))
        elif gender == 3:
            query = query.filter(Event.gender.in_([0, 3]))
        if min_price is not None:
            query = query.filter(Event.price >= min_price)
        if max_price is not None:
            query = query.filter(Event.price <= max_price)
        if event_type is not None:
            query = query.filter(Event.event_type == event_type)
        if recently_added_days is not None:
            query = query.filter(Event.created_on >= now - timedelta(days=int(recently_added_days)))
        if ongoing_days is not None:
            query = query.filter(func.date(Event.start_date) <= today, func.date(Event.end_date) >= today)
        if upcoming_days:
            query = query.filter(func.date(Event.start_date) > today)

        events = query.group_by(Event.id).all()

        # Do not hide events by radius for now. We still compute/sort distance,
        # but remote users should be able to discover every active event.

        if sort_options == 1:
            events.sort(key=lambda event: event.created_on or datetime.min, reverse=True)
        elif sort_options == 2:
            events.sort(key=lambda event: EventRepo._event_distance_miles(event, latitude, longitude))
        elif sort_options == 4 or sort_options_filter in (2, 3):
            events.sort(key=lambda event: (event.start_date or datetime.max, event.start_time or time.max))
        else:
            sort_by = request_data.get('sort_by', 'start_date')
            reverse = str(request_data.get('sort_order', 'asc')).lower() == 'desc'
            events.sort(key=lambda event: getattr(event, sort_by, None) or datetime.max, reverse=reverse)

        total = len(events)
        pages = math.ceil(total / per_page) if per_page else 0
        start = (page - 1) * per_page
        page_events = events[start:start + per_page]

        appserialize_event = []
        for index, event in enumerate(page_events, start=start + 1):
            event_dict = EventRepo.appserialize_event(event, request_data.get('session_id'))
            ticket = EventRepo.get_min_ticket_price(event.id)
            distance = EventRepo._event_distance_miles(event, latitude, longitude)
            organizer_info = OrganizerRepository.get_organizer_info(event.user_id)

            event_dict.update({
                "distance": round(distance, 2) if distance else 0,
                "ticket_price": float(ticket.price) if event.ticket_type == 1 and ticket and ticket.price is not None else None,
                "sort_price": float(ticket.price) if ticket and ticket.price is not None else float(event.price or 0),
                "organization_name": organizer_info.get("name") if organizer_info else None,
                "lrn": index,
                "start_date_t": event_dict.get("start_date"),
                "start_time_t": event_dict.get("start_time"),
                "end_date_t": event_dict.get("end_date"),
                "end_time_t": event_dict.get("end_time"),
                "is_wishlisted": 1 if WishlistRepository.find_wishlist_item({'event_id': event.id}, request_data.get('session_id')) else 0,
                "participant_images": [
                    {"profile_image": img.profile_image}
                    for img in db.session.query(Users.profile_image)
                    .join(Participant, Participant.user_id == Users.id)
                    .filter(Participant.event_id == event.id)
                    .limit(5)
                    .all()
                ],
                "total_participants_count": db.session.query(func.count(Participant.id)).filter(Participant.event_id == event.id).scalar() or 0,
            })
            appserialize_event.append(event_dict)

        return {
            "events": appserialize_event,
            "total": total,
            "pages": pages,
            "current_page": page,
            "per_page": per_page,
        }

    @staticmethod
    def _event_local_datetime(event, start=True):
        raw_date = event.start_date if start else event.end_date
        raw_time = event.start_time if start else event.end_time
        if isinstance(raw_date, datetime):
            raw_day = raw_date.date()
        else:
            raw_day = raw_date
        if not raw_day:
            return None
        return datetime.combine(raw_day, raw_time or (time.min if start else time.max))

    @staticmethod
    def _booking_list_sqlite(user_id, request_data):
        timezone_name = (
            request.headers.get('Timezone', os.getenv('d_t_z'))
            if has_request_context()
            else os.getenv('d_t_z')
        ) or 'Africa/Casablanca'
        now = datetime.now(ZoneInfo(timezone_name))
        today = now.date()

        def to_int(value):
            if value in (None, ""):
                return None
            try:
                return int(value)
            except (TypeError, ValueError):
                return None

        def row_day(row, attr):
            value = getattr(row, attr)
            if isinstance(value, datetime):
                return value.date()
            return value

        def row_time(row, attr):
            return getattr(row, attr) or time.min

        def ticket_sort_key(row):
            start_day = row.ticket_date if row.category_id == 3 and row.ticket_date else row_day(row, 'start_date')
            start_clock = row.ticket_start_time if row.category_id == 3 and row.ticket_start_time else row_time(row, 'start_time')
            return (start_day or date.max, start_clock or time.max, row.participant_id)

        filter_type = to_int(request_data.get('type'))
        status = request_data.get('status')
        from_date = EventRepo._parse_filter_date(request_data.get('from_date'))
        to_date = EventRepo._parse_filter_date(request_data.get('to_date'))

        query = db.session.query(
            Participant.id.label('participant_id'),
            Participant.ticket.label('ticket'),
            Participant.status.label('status'),
            Participant.date.label('ticket_date'),
            Participant.start_time.label('ticket_start_time'),
            Participant.end_time.label('ticket_end_time'),
            Category.title.label('category_title'),
            Category.image.label('category_image'),
            literal(0.0).label('distance'),
            Event.ar_title,
            Event.category_id,
            Event.area,
            Event.city,
            Event.end_date,
            Event.id,
            Event.location,
            Event.location_type,
            Event.occusr_type,
            Event.occusr_weekday,
            Event.occusr_month,
            Event.price,
            Event.time_zone,
            Event.price_type,
            Event.start_date,
            Event.start_time,
            Event.end_time,
            Event.title,
        ).join(Event, Event.id == Participant.event_id).join(Category, Category.id == Event.category_id)\
         .filter(Event.status != 3, Participant.user_id == user_id, Participant.parent_id == 0, Participant.status > 0)\

        rows = query.all()

        if status:
            rows = [row for row in rows if row.status == 1]

        if filter_type == 1:
            rows = [row for row in rows if (row_day(row, 'start_date') or date.min) > today and row.status == 1]
        elif filter_type == 2:
            rows = [
                row for row in rows
                if (row_day(row, 'start_date') or date.max) <= today
                and (row_day(row, 'end_date') or date.min) >= today
                and row.status == 1
            ]
        elif filter_type == 3:
            rows = [row for row in rows if (row_day(row, 'end_date') or date.max) < today or row.status != 1]
        elif from_date and to_date:
            rows = [
                row for row in rows
                if (
                    from_date <= (row_day(row, 'start_date') or date.max) <= to_date
                    or from_date <= (row_day(row, 'end_date') or date.max) <= to_date
                    or (row_day(row, 'start_date') or date.max) <= from_date <= (row_day(row, 'end_date') or date.min)
                    or (row_day(row, 'start_date') or date.max) <= to_date <= (row_day(row, 'end_date') or date.min)
                )
            ]
        elif from_date:
            rows = [row for row in rows if (row_day(row, 'start_date') or date.min) >= from_date]
        elif to_date:
            rows = [row for row in rows if (row_day(row, 'end_date') or date.max) <= to_date]

        if filter_type == 3:
            rows.sort(key=ticket_sort_key, reverse=True)
        elif filter_type in (1, 2):
            rows.sort(key=ticket_sort_key)
        else:
            rows.sort(key=lambda row: row.participant_id, reverse=True)

        return [EventRepo.appserialize_event_booking(row) for row in rows]

    @staticmethod
    def _serialize_organizer_event(event):
        event_data = EventRepo.serialize_event(event)
        participant_images = [
            {"profile_image": img.profile_image}
            for img in db.session.query(Users.profile_image)
            .join(Participant, Participant.user_id == Users.id)
            .filter(Participant.event_id == event.id)
            .group_by(Users.id)
            .limit(5)
            .all()
        ]
        total_participants = (
            db.session.query(func.count(distinct(Participant.user_id)))
            .filter(Participant.event_id == event.id)
            .scalar()
            or 0
        )
        event_data.update({
            "participant_images": participant_images,
            "total_participants_count": total_participants,
        })
        return event_data

    @staticmethod
    def _get_filtered_events_sqlite(request_data, session_id):
        Timezone = request.headers.get('Timezone') or os.getenv('d_t_z') or 'Africa/Casablanca'
        now = datetime.now(ZoneInfo(Timezone)).replace(tzinfo=None)
        today = now.date()

        category_id = EventRepo._as_list(request_data.get('category_id'))
        sub_category_id = EventRepo._as_list(request_data.get('sub_category_id'))
        price_type = EventRepo._as_list(request_data.get('price_type'))
        location_type = EventRepo._as_list(request_data.get('location_type'))
        speaker_id = EventRepo._as_list(request_data.get('speaker_id'))
        status = request_data.get('status')
        search = request_data.get('search') or request_data.get('keyword')
        journey_level_id = request_data.get('journey_level_id')
        start_date = EventRepo._parse_filter_date(request_data.get('start_date'))
        end_date = EventRepo._parse_filter_date(request_data.get('end_date'))
        min_price = request_data.get('min_price')
        max_price = request_data.get('max_price')
        min_classes = request_data.get('min_classes')
        max_classes = request_data.get('max_classes')
        event_type = request_data.get('event_type')
        sort_by = request_data.get('sort_by', 'start_date')
        sort_order = request_data.get('sort_order', 'asc')
        recently_added_days = request_data.get('recently_added_days')
        ongoing_days = request_data.get('ongoing_days')
        upcoming_days = request_data.get('upcoming_days')
        completed_days = request_data.get('completed_days')
        page = int(request_data.get('page', 1) or 1)
        per_page = int(request_data.get('per_page', 10) or 10)

        query = Event.query.filter(Event.user_id == session_id, Event.status != 3)
        if search:
            query = query.filter(or_(Event.title.ilike(f"%{search}%"), Event.description.ilike(f"%{search}%")))
        if category_id:
            query = query.filter(Event.category_id.in_(category_id))
        if sub_category_id:
            query = query.filter(Event.sub_category_id.in_(sub_category_id))
        if price_type:
            query = query.filter(Event.price_type.in_(price_type))
        if location_type:
            query = query.filter(Event.location_type.in_(location_type))
        if status not in (None, ""):
            query = query.filter(Event.status == status)
        if journey_level_id not in (None, ""):
            query = query.filter(Event.journey_level_id == journey_level_id)
        if min_price is not None and max_price is not None:
            query = query.filter(Event.price >= min_price, Event.price <= max_price)
        if min_classes is not None and max_classes is not None:
            query = query.filter(Event.total_no_class >= min_classes, Event.total_no_class <= max_classes)
        if event_type not in (None, ""):
            query = query.filter(Event.event_type == event_type)
        if speaker_id:
            query = query.join(EventSpeakers).filter(EventSpeakers.user_id.in_(speaker_id))

        events = query.all()

        if start_date and end_date:
            events = [
                event for event in events
                if (EventRepo._event_local_datetime(event, True) and EventRepo._event_local_datetime(event, False))
                and (
                    start_date <= EventRepo._event_local_datetime(event, True).date() <= end_date
                    or start_date <= EventRepo._event_local_datetime(event, False).date() <= end_date
                    or EventRepo._event_local_datetime(event, True).date() <= start_date <= EventRepo._event_local_datetime(event, False).date()
                    or EventRepo._event_local_datetime(event, True).date() <= end_date <= EventRepo._event_local_datetime(event, False).date()
                )
            ]

        if upcoming_days is not None:
            events = [
                event for event in events
                if (EventRepo._event_local_datetime(event, True) or datetime.max) > now and event.status != 4
            ]
        if ongoing_days is not None:
            events = [
                event for event in events
                if (EventRepo._event_local_datetime(event, True) or datetime.max) <= now
                and (EventRepo._event_local_datetime(event, False) or datetime.min) >= now
                and event.status != 4
            ]
        if completed_days is not None:
            events = [
                event for event in events
                if (EventRepo._event_local_datetime(event, False) or datetime.max) < now or event.status == 4
            ]

        if recently_added_days is not None:
            events.sort(key=lambda event: event.created_on or datetime.min, reverse=True)
        else:
            reverse = str(sort_order).lower() == 'desc'
            if sort_by in {"start_date", "end_date"}:
                events.sort(key=lambda event: EventRepo._event_local_datetime(event, sort_by == "start_date") or datetime.max, reverse=reverse)
            else:
                events.sort(key=lambda event: getattr(event, sort_by, None) or datetime.max, reverse=reverse)

        total = len(events)
        pages = math.ceil(total / per_page) if per_page else 0
        start = (page - 1) * per_page
        page_events = events[start:start + per_page]
        return {
            "events": [EventRepo._serialize_organizer_event(event) for event in page_events],
            "total": total,
            "pages": pages,
            "current_page": page,
            "per_page": per_page,
        }




    def convert_dates_from_gmt(dates, output_timezone):
        try:
            input_timezone = "UTC"

            if not output_timezone:
                output_timezone = os.getenv('d_t_z')
                
            local_tz = pytz.timezone(input_timezone)
            gmt_tz = pytz.timezone(output_timezone)

            grouped_by_date = defaultdict(lambda: {"status": "1", "times": []})  # default status

            for date_entry in dates:
                original_status = date_entry.get("status", "1")
                original_date = date_entry.get("date")
                original_id = date_entry.get("id")

                for time_entry in date_entry.get("times", []):
                    full_start_str = f"{original_date} {time_entry['start_time']}"
                    full_end_str = f"{original_date} {time_entry['end_time']}"

                    # Local to GMT
                    local_start = local_tz.localize(datetime.strptime(full_start_str, "%Y-%m-%d %H:%M:%S"))
                    local_end = local_tz.localize(datetime.strptime(full_end_str, "%Y-%m-%d %H:%M:%S"))

                    gmt_start = local_start.astimezone(gmt_tz)
                    gmt_end = local_end.astimezone(gmt_tz)
                    gmt_date_str = gmt_start.strftime("%Y-%m-%d")

                    grouped_by_date[gmt_date_str]["status"] = original_status  
                    grouped_by_date[gmt_date_str]["id"] = original_id  
                    grouped_by_date[gmt_date_str]["date"] = gmt_date_str
                    grouped_by_date[gmt_date_str]["times"].append({
                        "status": time_entry.get("status"),
                        "booked": time_entry.get("booked"),
                        "id": time_entry.get("id"),
                        "available": time_entry.get("available"),
                        "start_time": gmt_start.strftime("%H:%M:%S"),
                        "end_time": gmt_end.strftime("%H:%M:%S")
                    })

            # Return sorted by date
            return [grouped_by_date[date] for date in sorted(grouped_by_date)]
        
        except Exception as e:
            app.logger.error({
                "Error encountered": str(e),
                "Exception Type": type(e).__name__,
                "Trace": traceback.format_exc()
            })
            return []
    
    def convert_dates_to_gmt(dates, input_timezone):
        try:
            if not input_timezone:
                input_timezone = os.getenv('d_t_z')

            output_timezone = "UTC"
                
            local_tz = pytz.timezone(input_timezone)
            gmt_tz = pytz.timezone(output_timezone)

            grouped_by_date = defaultdict(lambda: {"status": "1", "times": []})  # default status

            for date_entry in dates:
                original_status = date_entry.get("status", "1")
                original_date = date_entry.get("date")
                original_id = date_entry.get("id")

                for time_entry in date_entry.get("times", []):
                    full_start_str = f"{original_date} {time_entry['start_time']}"
                    full_end_str = f"{original_date} {time_entry['end_time']}"

                    # Local to GMT
                    local_start = local_tz.localize(datetime.strptime(full_start_str, "%Y-%m-%d %H:%M:%S"))
                    local_end = local_tz.localize(datetime.strptime(full_end_str, "%Y-%m-%d %H:%M:%S"))

                    gmt_start = local_start.astimezone(gmt_tz)
                    gmt_end = local_end.astimezone(gmt_tz)
                    gmt_date_str = gmt_start.strftime("%Y-%m-%d")

                    grouped_by_date[gmt_date_str]["status"] = original_status  
                    grouped_by_date[gmt_date_str]["id"] = original_id  
                    grouped_by_date[gmt_date_str]["date"] = gmt_date_str
                    grouped_by_date[gmt_date_str]["times"].append({
                        "status": time_entry.get("status"),
                        "booked": time_entry.get("booked"),
                        "id": time_entry.get("id"),
                        "available": time_entry.get("available"),
                        "start_time": gmt_start.strftime("%H:%M:%S"),
                        "end_time": gmt_end.strftime("%H:%M:%S")
                    })

            # Return sorted by date
            return [grouped_by_date[date] for date in sorted(grouped_by_date)]
        
        except Exception as e:
            app.logger.error({
                "Error encountered": str(e),
                "Exception Type": type(e).__name__,
                "Trace": traceback.format_exc()
            })
            return []
    
    def convert_to_gmt_separate(date_str=None, time_str=None, time_zone=None):    
        try:
            if not time_zone or not isinstance(time_zone, str) or time_zone.strip() == "":
                time_zone = os.getenv('d_t_z')  #  — your desired default

            local_tz = pytz.timezone(time_zone)
            if not date_str:
                now_in_local = datetime.now(local_tz)
                date_str = now_in_local.strftime('%Y-%m-%d')
            elif isinstance(date_str, (datetime, date)):
                date_str = date_str.strftime('%Y-%m-%d')
            else:
                date_str = str(date_str) 
                
            if not time_str or not isinstance(time_str, str) or time_str.strip() == "":
                app.logger.error({'convert_to_gmt_separate error': "Invalid or empty time_str"})
                return {"error":"Invalid or empty time_str","date":date_str, "time":time_str}
                
            combined_str = f"{date_str} {time_str.strip()}"
            # Determine format
                
            if "AM" in time_str or "PM" in time_str:
                if time_str.count(':') == 2:
                    fmt = '%Y-%m-%d %I:%M:%S %p'  # e.g. 04:30:00 AM
                else:
                    fmt = '%Y-%m-%d %I:%M %p'     # e.g. 04:30 AM
            else:
                if time_str.count(':') == 2:
                    fmt = '%Y-%m-%d %H:%M:%S'     # e.g. 14:30:00
                else:
                    fmt = '%Y-%m-%d %H:%M'        # e.g. 14:30

            naive_dt = datetime.strptime(combined_str, fmt)
            if naive_dt.tzinfo is None:
                local_dt = local_tz.localize(naive_dt)
            else:
                local_dt = naive_dt.astimezone(local_tz)
            gmt_dt = local_dt.astimezone(pytz.utc)

            gmt_date = gmt_dt.strftime('%Y-%m-%d')
            gmt_time = gmt_dt.strftime('%H:%M:%S')
            return {"date":gmt_date, "time":gmt_time}
        except Exception as e:
            app.logger.error({
                'convert_to_gmt_separate error': str(e),
                'exception_type': type(e).__name__,
                'trace': traceback.format_exc()
            })
            return {"error":str(e),"date":date_str, "time":time_str}
         
    def convert_from_gmt_separate(date_str=None, time_str=None, time_zone=None):    
        try:
            if not time_zone or not isinstance(time_zone, str) or time_zone.strip() == "":
                time_zone = os.getenv('d_t_z')  # or 'Asia/Kolkata' — your desired default

            local_tz = pytz.timezone(time_zone)
            gmt_tz = pytz.utc
            if not date_str:
                now_in_utc = datetime.now(gmt_tz)
                date_str = now_in_utc.strftime('%Y-%m-%d')
            elif isinstance(date_str, (datetime, date)):
                date_str = date_str.strftime('%Y-%m-%d')
            else:
                date_str = str(date_str) 
                
            if not time_str or not isinstance(time_str, str) or time_str.strip() == "":
                app.logger.error({'convert_to_gmt_separate error': "Invalid or empty time_str"})
                return {"error":"Invalid or empty time_str","date":date_str, "time":time_str}
                
            combined_str = f"{date_str} {time_str.strip()}"
            # Determine format
                
            if "AM" in time_str or "PM" in time_str:
                if time_str.count(':') == 2:
                    fmt = '%Y-%m-%d %I:%M:%S %p'  # e.g. 04:30:00 AM
                else:
                    fmt = '%Y-%m-%d %I:%M %p'     # e.g. 04:30 AM
            else:
                if time_str.count(':') == 2:
                    fmt = '%Y-%m-%d %H:%M:%S'     # e.g. 14:30:00
                else:
                    fmt = '%Y-%m-%d %H:%M'        # e.g. 14:30

            naive_dt = datetime.strptime(combined_str, fmt)
            gmt_dt = gmt_tz.localize(naive_dt)

            # Convert to local timezone
            local_dt = gmt_dt.astimezone(local_tz)

            local_date = local_dt.strftime('%Y-%m-%d')
            local_time = local_dt.strftime('%H:%M:%S')

            return {"date": local_date, "time": local_time}
            
            
        except Exception as e:
            app.logger.error({
                'convert_to_gmt_separate error': str(e),
                'exception_type': type(e).__name__,
                'trace': traceback.format_exc()
            })
            return {"error":str(e),"date":date_str, "time":time_str}
            

    
    
    def clean_location(location):
        if location:
            parts = [part.strip() for part in location.split(',')]
            cleaned_parts = []
            for part in parts:
                if re.search(r'\d{6,}', part):
                    break  # Stop when we find the pincode part
                cleaned_parts.append(part)
            last_two_parts = cleaned_parts[-2:]
            return ', '.join(last_two_parts)
        return location
    
    @staticmethod
    @handle_repository_errors
    def get_rating(request_data):
        try:
 
            #query = Rating.query.outerjoin(Organization, Organization.user_id == Rating.user_id)
            query = (
                db.session.query(
                    Rating,
                    Organization.organization_name
                )
                .outerjoin(Organization, Organization.user_id == Rating.user_id)
            )
            if request_data.get('event_id'):
                query = query.filter(Rating.event_id==request_data.get('event_id'))
            if request_data.get('user_id'):
                query = query.filter(Rating.to_user_id==request_data.get('user_id'))
            query = query.order_by(Rating.created_on.desc()).all()
            
            return [
            {
                "id": data.id,
                "event_id": data.event_id,
                'event_title': data.event.title,
                "user_id": data.user_id,
                'user_first_name': organization_name if data.user.role_type==3 else data.user.first_name,
                'user_last_name': None if data.user.role_type==3 else data.user.last_name,
                "title": data.title,
                "rating_value": data.rating_value,
                "review": data.review,
                "created_on": data.created_on
                
            }
            for data,organization_name in query
        ]
      
            return query
        except Exception as e:
            raise e
    
    
    @staticmethod
    @handle_repository_errors
    def get_announcement(session_id,request_data):
        try:
 

            query = (
                db.session.query(
                    EventAnnouncements,
                    Event.title,
                    Organization.organization_name,
                    Users.role_type,
                    Users.first_name,
                    Users.last_name
                )
                .outerjoin(Event, Event.id == EventAnnouncements.event_id)
                .outerjoin(Users, Users.id == EventAnnouncements.created_by)
                .outerjoin(Organization, Organization.user_id == EventAnnouncements.created_by)
            )
            if request_data.get('event_id'):
                query = query.filter(EventAnnouncements.event_id==request_data.get('event_id'))
            if request_data.get('event_id')==0:
                query = query.filter(EventAnnouncements.event_id==0)
            else:
                query = query.filter(EventAnnouncements.event_id>0)
            if request_data.get('user_id'):
                query = query.filter(EventAnnouncements.created_by==request_data.get('user_id'))
            query = query.order_by(EventAnnouncements.created_on.desc()).all()
            
            return [
            {
                "id": data.id,
                "event_id": data.event_id,
                'event_title': title,
                "title": data.title,
                "message": data.message,
                "created_by_id": data.created_by,
                'created_by': organization_name if role_type==3 else first_name+" "+last_name,
                "created_on": data.created_on
                
            }
            for data,title,organization_name,role_type,first_name,last_name in query
        ]
      
            return query
        except Exception as e:
            raise e
    
    
    @staticmethod
    @handle_repository_errors
    def add_announcement(data):
        try:

            annn = EventAnnouncements(**data)
            db.session.add(annn)
            db.session.commit()
            return annn
        except Exception as e:
            db.session.rollback()
            raise e
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def add_rating(data):
        try:

            rating = Rating(**data)
            db.session.add(rating)
            db.session.commit()
            return 1
        except Exception as e:
            db.session.rollback()
            raise e
    
    
    
    @staticmethod
    @handle_repository_errors
    def request_buddy(event_note_data):
        try:

            new_event_note = Request_buddy(**event_note_data)  # Assuming EventNote is the model for the event note
            db.session.add(new_event_note)
            db.session.commit()
            return new_event_note.id
        except Exception as e:
            db.session.rollback()
            raise e
        
        
    
    @staticmethod
    @handle_repository_errors
    def request_buddy_count(user_id, event_id,type):    
        
    
        
        count = Request_buddy.query.filter(Request_buddy.user_id == user_id,
            Request_buddy.event_id == event_id,Request_buddy.type == type).count()
        
        return count   

    @staticmethod
    @handle_repository_errors
    def get_active_one_to_one_for_user(user_id, event_id, speaker_id):
        return Request_buddy.query.filter(
            Request_buddy.user_id == user_id,
            Request_buddy.event_id == event_id,
            Request_buddy.speaker_id == speaker_id,
            Request_buddy.type == 2,
            Request_buddy.status.in_([0, 1, 3, 5]),
        ).order_by(Request_buddy.id.asc()).first()

    @staticmethod
    @handle_repository_errors
    def get_active_one_to_one_for_slot(speaker_id, session_date, session_time):
        return Request_buddy.query.filter(
            Request_buddy.speaker_id == speaker_id,
            Request_buddy.date == session_date,
            Request_buddy.time == session_time,
            Request_buddy.type == 2,
            Request_buddy.status.in_([0, 1, 3, 5]),
        ).order_by(Request_buddy.id.asc()).first()

    @staticmethod
    def lock_one_to_one_slot(speaker_id, session_date, session_time):
        """Serialize competing slot requests across Railway workers."""
        bind = db.session.get_bind()
        if not bind or bind.dialect.name != "postgresql":
            return

        slot_key = f"one-to-one:{speaker_id}:{session_date.isoformat()}:{session_time.isoformat()}"
        digest = hashlib.sha256(slot_key.encode("utf-8")).digest()
        lock_key = int.from_bytes(digest[:8], byteorder="big", signed=True)
        db.session.execute(
            text("SELECT pg_advisory_xact_lock(:lock_key)"),
            {"lock_key": lock_key},
        )
        
    
    
    
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_request_buddy(data):
        try:
            
            

            user_alias = aliased(Users)
            buddy_alias = aliased(Users)
        
            session = data.get('session')
            organiser_id = data.get('organiser_id')
            speaker_id = data.get('speaker_id')
            not_assigned = data.get('not_assigned')
            buddy_id = data.get('buddy_id')
            event_id = data.get('event_id')
            if not isinstance(event_id, (list, tuple)) and event_id is not None and event_id != "" and event_id !=0:
                event_id=[event_id]

            type = data.get('type')
            search_key = data.get('search_key')

            # Base query
            query = db.session.query(
                Request_buddy.id,
                Request_buddy.event_id,
                Request_buddy.buddy_id,
                Request_buddy.time_zone,
                Request_buddy.user_id,
                Request_buddy.status,
                Request_buddy.created_on,
                Request_buddy.date,
                Request_buddy.time,
                Request_buddy.meet_link,
                Request_buddy.location_type,
                Request_buddy.location,
                Request_buddy.duration_minutes,
                Request_buddy.status_reason,
                Request_buddy.speaker_id,
                Request_buddy.user_comment,
                Request_buddy.type,
                Event.title.label('event_title'),
                user_alias.first_name.label('user_first_name'),
                user_alias.last_name.label('user_last_name'),
                user_alias.mobile_number.label('user_mobile_number'),
                user_alias.country_code.label('user_country_code'),
                user_alias.email_id.label('user_email_id'),
                user_alias.profile_image.label('user_profile_image'),
                Organization.organization_name.label('organization_name'),                
                JourneyLevel.title.label('journey_level_title'),
                buddy_alias.first_name.label('buddy_first_name'),
                buddy_alias.last_name.label('buddy_last_name')
            ).join(Event, Request_buddy.event_id == Event.id)  \
            .outerjoin(user_alias, Request_buddy.user_id == user_alias.id)  \
            .outerjoin(Organization, Organization.user_id == Event.user_id)  \
            .outerjoin(buddy_alias, Request_buddy.buddy_id == buddy_alias.id)  \
            .outerjoin(JourneyLevel, user_alias.journey_level_id == JourneyLevel.id) \
            .filter(Request_buddy.type == type)  # Filter by type
            
            

            if not_assigned:
                query = query.filter(Request_buddy.buddy_id == 0)           
            if organiser_id:
                query = query.filter(Event.user_id == organiser_id)        
            if speaker_id:
                query = query.filter(Request_buddy.speaker_id == speaker_id)
            if session:
                query = query.filter(Event.user_id == session)
            if event_id:
                query = query.filter(Request_buddy.event_id.in_(event_id))
            if buddy_id:
                query = query.filter(Request_buddy.buddy_id ==buddy_id)
            # Add search_key filters
            if search_key:
                filters = (
                    user_alias.first_name.ilike(f"%{search_key}%") |
                    user_alias.last_name.ilike(f"%{search_key}%") |
                    Event.title.ilike(f"%{search_key}%")
                )
                query = query.filter(filters)

            # Add ordering and execute the query
            query = query.order_by(Request_buddy.id.desc()).all()

            return query

        except Exception as e:
            raise e
        


    @staticmethod
    @handle_repository_errors
    def get_request_buddy_list(data):
        try:
            
            
            

            user_alias = aliased(Users)
            buddy_alias = aliased(Users)
            speaker_alias = aliased(Users)
            #app.logger.error({'message':data.get('session')})
            session = data.get('session')
            organiser_id = data.get('organiser_id')
            not_assigned = data.get('not_assigned')
            type = data.get('type')
            buddy_id = data.get('buddy_id')
            event_id = data.get('event_id')
            if not isinstance(event_id, (list, tuple)) and event_id is not None and event_id != "":
                event_id=[event_id]

            search_key = data.get('search_key')

            # Base query
            query = db.session.query(
                Request_buddy.id,
                Request_buddy.event_id,
                Request_buddy.buddy_id,
                Request_buddy.time_zone,
                Request_buddy.user_id,
                Request_buddy.status,
                Request_buddy.created_on,
                Request_buddy.type,
                Request_buddy.date,
                Request_buddy.time,
                Request_buddy.meet_link,
                Request_buddy.location_type,
                Request_buddy.location,
                Request_buddy.duration_minutes,
                Request_buddy.status_reason,
                Request_buddy.speaker_id,
                Request_buddy.user_comment, 
                Event.title.label('event_title'),
                Organization.organization_name.label('organization_name'),
                buddy_alias.first_name.label('buddy_first_name'),
                buddy_alias.last_name.label('buddy_last_name'),
                buddy_alias.profile_image.label('user_profile_image'),
                speaker_alias.first_name.label('speaker_first_name'),
                speaker_alias.last_name.label('speaker_last_name'),
                speaker_alias.profile_image.label('speaker_image'),
                speaker_alias.time_zone.label('speaker_time_zone'),
            ).join(Event, Request_buddy.event_id == Event.id)  \
            .join(user_alias, Request_buddy.user_id == user_alias.id)  \
            .outerjoin(Organization, Organization.user_id == Event.user_id)  \
            .outerjoin(buddy_alias, Request_buddy.buddy_id == buddy_alias.id)  \
            .outerjoin(speaker_alias, Request_buddy.speaker_id == speaker_alias.id)


            if type:
                query = query.filter(Request_buddy.type == type)
            if session:
                query = query.filter(Request_buddy.user_id == session)
            if event_id:
                query = query.filter(Request_buddy.event_id.in_(event_id))
            if buddy_id:
                query = query.filter(Request_buddy.buddy_id ==buddy_id)

                
            # Add search_key filters
            if search_key and search_key.strip():
                filters = (
                    buddy_alias.first_name.ilike(f"%{search_key}%") |
                    buddy_alias.last_name.ilike(f"%{search_key}%") |
                    Event.title.ilike(f"%{search_key}%")
                )
                query = query.filter(filters)

            # Add ordering and execute the query
            results = query.order_by(Request_buddy.id.desc()).all()
            
            response = []
            # Convert results to a list of dictionaries
            for row in results:
                row_dict = dict(row._asdict())

                # Convert date & time to string format
                if isinstance(row_dict.get("date"), date):
                    row_dict["date"] = row_dict["date"].strftime("%Y-%m-%d")  # Format as 'YYYY-MM-DD'

                if isinstance(row_dict.get("time"), time):
                    row_dict["time"] = row_dict["time"].strftime("%H:%M:%S")  # Format as 'HH:MM:SS'

                row_dict["status_label"] = {
                    0: "PENDING",
                    1: "CONFIRMED",
                    2: "CANCELLED",
                    3: "APPROVED",
                    4: "DECLINED",
                    5: "RESCHEDULE_REQUESTED",
                    6: "COMPLETED",
                }.get(row_dict.get("status"), "UNKNOWN")

                response.append(row_dict)

            return response

        except Exception as e:
            raise e
        
    
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_notificaions(data):
        try:
            
            
            session = data.get('session')

            # Aliases for Users table
            user_alias_1 = aliased(Users)
            buddy_alias = aliased(Users)
            user_alias_2 = aliased(Users)

            # Base query 1: Request_buddy and Event
            query_1 = db.session.query(
                Request_buddy.id.label('id'),
                Request_buddy.event_id.label('event_id'),
                Request_buddy.user_id.label('user_id'),
                Request_buddy.status.label('status'),
                Request_buddy.created_on.label('created_on'),
                literal("request_buddy").label('type'),
                Event.title.label('event_title'),
                user_alias_1.first_name.label('user_first_name'),
                user_alias_1.last_name.label('user_last_name'),
                user_alias_1.mobile_number.label('user_mobile_number'),
                user_alias_1.profile_image.label('user_profile_image'),
                db.null().label('question'),  # Placeholder for Answer_and_question columns
            ).join(Event, Request_buddy.event_id == Event.id) \
             .join(user_alias_1, Request_buddy.user_id == user_alias_1.id) \
             .outerjoin(buddy_alias, Request_buddy.buddy_id == buddy_alias.id) \
             .filter(Request_buddy.type == 1)

            query_1 = query_1.filter(Request_buddy.buddy_id == 0)
            query_1 = query_1.filter(Event.user_id == session)

            # Base query 2: Answer_and_question and Event
            query_2 = db.session.query(
                Answer_and_question.id.label('id'),
                Answer_and_question.event_id.label('event_id'),
                Answer_and_question.user_id.label('user_id'),
                Answer_and_question.status.label('status'),
                Answer_and_question.created_on.label('created_on'),
                literal("q_and_a").label('type'),
                Event.title.label('event_title'),
                user_alias_2.first_name.label('user_first_name'),
                user_alias_2.last_name.label('user_last_name'),
                user_alias_2.mobile_number.label('user_mobile_number'),
                user_alias_2.profile_image.label('user_profile_image'),
                Answer_and_question.question.label('question'),
            ).join(user_alias_2, Answer_and_question.user_id == user_alias_2.id) \
             .join(Event, Event.id == Answer_and_question.event_id)

            query_2 = query_2.filter(Answer_and_question.organizer_id == session)
            query_2 = query_2.filter(Answer_and_question.answer.is_(None))

            # Combine both queries using union_all
            combined_query = union_all(query_1, query_2)

            # Execute the combined query
            result = db.session.execute(combined_query.order_by(text("created_on DESC"))).fetchall()

            return result
    




        except Exception as e:
            raise e
        
    
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_reqstbuddy_data(reqstbuddy_id,session_id):
        try:
            user_alias_1 = aliased(Users)

            # Base query 1: Request_buddy and Event
            query_1 = db.session.query(
                Request_buddy.user_id.label('user_id'),
                Request_buddy.id.label('id'),
                Event.id.label('event_id'),
                Event.title.label('event_title'),
                user_alias_1.first_name.label('user_first_name'),
                user_alias_1.last_name.label('user_last_name'),
                user_alias_1.country_code.label('user_country_code'),
                user_alias_1.mobile_number.label('user_mobile_number'),
                user_alias_1.profile_image.label('user_profile_image')
            ).join(Event, Request_buddy.event_id == Event.id) \
             .join(user_alias_1, Request_buddy.user_id == user_alias_1.id) \
             .filter(Request_buddy.type == 1)

            query_1 = query_1.filter(Request_buddy.id == reqstbuddy_id)
            query_1 = query_1.filter(Event.user_id == session_id)


            # Execute the combined query
            result = query_1.first()

            return result
    




        except Exception as e:
            raise e
        
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_notificaion_count(data):
        try:
            
            
            session = data.get('session')

            # Aliases for Users table
            user_alias_1 = aliased(Users)
            buddy_alias = aliased(Users)
            user_alias_2 = aliased(Users)

            # Base query 1: Request_buddy and Event
            query_1 = db.session.query(
                Request_buddy.id.label('id'),
                Request_buddy.event_id.label('event_id'),
                Request_buddy.user_id.label('user_id'),
                Request_buddy.status.label('status'),
                Request_buddy.created_on.label('created_on'),
                literal("request_buddy").label('type'),
                Event.title.label('event_title'),
                user_alias_1.first_name.label('user_first_name'),
                user_alias_1.last_name.label('user_last_name'),
                user_alias_1.mobile_number.label('user_mobile_number'),
                user_alias_1.profile_image.label('user_profile_image'),
                db.null().label('question'),  # Placeholder for Answer_and_question columns
            ).join(Event, Request_buddy.event_id == Event.id) \
             .join(user_alias_1, Request_buddy.user_id == user_alias_1.id) \
             .outerjoin(buddy_alias, Request_buddy.buddy_id == buddy_alias.id) \
             .filter(Request_buddy.type == 1)

            query_1 = query_1.filter(Request_buddy.buddy_id == 0)
            query_1 = query_1.filter(Event.user_id == session)

            # Base query 2: Answer_and_question and Event
            query_2 = db.session.query(
                Answer_and_question.id.label('id'),
                Answer_and_question.event_id.label('event_id'),
                Answer_and_question.user_id.label('user_id'),
                Answer_and_question.status.label('status'),
                Answer_and_question.created_on.label('created_on'),
                literal("q_and_a").label('type'),
                Event.title.label('event_title'),
                user_alias_2.first_name.label('user_first_name'),
                user_alias_2.last_name.label('user_last_name'),
                user_alias_2.mobile_number.label('user_mobile_number'),
                user_alias_2.profile_image.label('user_profile_image'),
                Answer_and_question.question.label('question'),
            ).join(user_alias_2, Answer_and_question.user_id == user_alias_2.id) \
             .join(Event, Event.id == Answer_and_question.event_id)

            query_2 = query_2.filter(Answer_and_question.organizer_id == session)
            query_2 = query_2.filter(Answer_and_question.answer.is_(None))

            # Combine both queries using union_all
            combined_query = union_all(query_1, query_2)

            # Wrapping the combined query to count the rows
            count_query = db.session.query(func.count().label('notification_count')).select_from(combined_query)

            # Execute the count query
            result = count_query.scalar()

            return {
                "count": result
           
            }
            
            
            
            
            
            
            

            
    




        except Exception as e:
            raise e
        
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_request_buddy_count(type,session=None,event=None):    
        
        
        if event is not None:
            
            count = Request_buddy.query.filter(Request_buddy.event_id == event,Request_buddy.type == type).count()
            
        elif session is not None:
            
            count = (
                db.session.query(func.count(Request_buddy.id))
                .join(Event, Request_buddy.event_id == Event.id)
                .filter(
                    Request_buddy.type == type,
                    Request_buddy.status == 0,
                    Event.user_id == session
                )
                .scalar()
            )
               
        else:
            
            count = (
                db.session.query(func.count(Request_buddy.id))
                .filter(
                    Request_buddy.type == type,
                    Request_buddy.status == 0
                )
                .scalar()
            )
            
            
        return count   
    
    


  
    @staticmethod
    @handle_repository_errors
    def get_wishlist_by_user(request_data, user_id, per_page):
        """Fetch events based on filter type and date range for a specific user (session user as Wishlist)."""
        if request_data.get('category_id') :
            query = Event.query.join(Wishlist).filter(Wishlist.created_by == user_id, Event.status == 1, Event.category_id == request_data.get('category_id'))
        else : 
            query = Event.query.join(Wishlist).filter(Wishlist.created_by == user_id, Event.status == 1)
            
        events = query.all()
        eventDas= [EventRepo.appserialize_event(event,user_id) for event in events]
        
        for eventDa in eventDas:
                eventDa['is_wishlisted'] = 1
                
        return eventDas
        

    @staticmethod
    @handle_repository_errors
    def add_event_note(event_note_data):
        """Adds a new event note to the database."""
        try:


            new_event_note = Event_note(**event_note_data)  # Assuming EventNote is the model for the event note
            db.session.add(new_event_note)
            db.session.commit()
            return 1
        except Exception as e:
            db.session.rollback()
            raise e
    

    @staticmethod
    @handle_repository_errors
    def update_event_note(id, event_data):
        """Updates an existing event in the database."""
        try:
            event = Event_note.query.get(id)
            if event:
                for key, value in event_data.items():
                    setattr(event, key, value)
                db.session.commit()
            return event
        except Exception as e:
            db.session.rollback()
            raise e
        
        
        
        
    @staticmethod
    @handle_repository_errors
    def event_note_count(event_id,session_id):
        count = Event_note.query.filter(Event_note.event_id == event_id,Event_note.user_id == session_id,Event_note.status != 3).count() 
        return count 







    @staticmethod
    @handle_repository_errors
    def get_all_event_note(request_data):
        try:
 
            query = Event_note.query
            query = query.order_by(Event_note.id.desc()).all()
      
            return {
                "customers": query
           
            }
        except Exception as e:
            raise e



    @staticmethod
    @handle_repository_errors
    def get_all_event_notes(request_data,session):
        """Fetches all event notes based on optional filters provided in the request data."""
        try:
            # Extract filters from request data
            event_id = request_data.get('event_id')
            status = request_data.get('status')  # Can be used to filter by status (active or inactive)
    

            query = Event_note.query  # Assuming EventNote is the model for event notes

            # Apply filters
            if event_id is not None:
                query = query.filter(Event_note.event_id == event_id)
            if status is not None:
                query = query.filter(Event_note.status == status)


          


            query = query.filter(Event_note.status == 1,Event_note.event_id == event_id,Event_note.user_id == session).order_by(Event_note.created_on.desc()).all()  # Order by creation date

        

            # Serialize event notes
            serialized_event_notes = [
                EventRepo.serialize_event_note(event_note) for event_note in query
            ]

            return serialized_event_notes
            
        except Exception as e:
            raise e

    @staticmethod
    def serialize_event_note(event_note):
        """Serializes an event note object for response."""
        return {
            "id": event_note.id,
            "event_id": event_note.event_id,
            "notes": event_note.notes,
            "title": event_note.title,
            "created_on": event_note.created_on.strftime('%Y-%m-%dT%H:%M:%S')
            
       
          
        }
    



    @staticmethod
    @handle_repository_errors
    def get_event_note_byid(request_data, session_id):
        return Event_note.query.filter_by(
            id=request_data.get('id'),
            user_id=session_id,
            status=1,
        ).first()

    
   
    
    @staticmethod
    @handle_repository_errors
    def question_and_answers(session, event_id, role_type, type,organizer_id=None):
        EventRepo.ensure_question_schema()
        

        user_alias = aliased(Users)
        organizer_alias = aliased(Users)
        
        query = db.session.query(
            Answer_and_question,
            user_alias.first_name.label('user_first_name'),
            user_alias.last_name.label('user_last_name'),
            user_alias.profile_image.label('user_profile_image'),
            organizer_alias.first_name.label('organizer_first_name'),
            organizer_alias.last_name.label('organizer_last_name'),
            organizer_alias.profile_image.label('organizer_profile_image'),
            Event.title.label('event_name'),
            Organization.organization_name.label('organization_name')
        ).join(user_alias, Answer_and_question.user_id == user_alias.id) \
        .join(organizer_alias, Answer_and_question.organizer_id == organizer_alias.id) \
        .outerjoin(Organization, organizer_alias.id == Organization.user_id) \
        .join(Event, Event.id == Answer_and_question.event_id) \
    
      
        if event_id != "0":           
            query = query.filter(Answer_and_question.event_id == event_id)
            
        if organizer_id != "0" and organizer_id is not None:           
            query = query.filter(Answer_and_question.organizer_id == organizer_id)

        # Add the conditional filter based on role_type
        if role_type == 3:
            query = query.filter(Answer_and_question.organizer_id == session)

        query = query.filter(Answer_and_question.status == 1)
       
            
            
        if type == '1':
            query = query.filter(Answer_and_question.answer.is_(None))
        
        
        # Execute the query
        data = query.order_by(Answer_and_question.id.desc()).all()

        # Helper function to format dates
        def format_date(date_value):
            if isinstance(date_value, str):
                try:
                    date_value = datetime.strptime(date_value, '%Y-%m-%d %H:%M:%S')  # Adjust format if needed
                except ValueError:
                    return date_value  # Return the string if parsing fails
            return date_value.strftime('%Y-%m-%d %H:%M:%S')

        # Unpack the data tuple and return the formatted result
        response = []
        for da in data:
            question = da[0]
            is_anonymous = bool(question.is_anonymous)
            response.append({
                "id": question.id,
                "event_id": question.event_id,
                "user_id": None if is_anonymous else question.user_id,
                "organizer_id": question.organizer_id,
                "answer": question.answer,
                "time_zone": question.time_zone,
                "question": question.question,
                "is_anonymous": is_anonymous,
                "created_on": format_date(question.created_on),
                "updated_on": format_date(question.updated_on),
                "user_first_name": "Anonymous" if is_anonymous else da[1],
                "user_last_name": "" if is_anonymous else da[2],
                "user_profile_image": None if is_anonymous else da[3],
                "organizer_first_name": da[8],
                "organizer_last_name": '',
                "organizer_profile_image": da[6],
                "event_name": da[7],
                "organization_name": da[8]
            })
        return response
    
    

    
   
    
    @staticmethod
    @handle_repository_errors
    def journey_levels(session,role_type):

        query = db.session.query(
            JourneyLevel.id,
            JourneyLevel.title,
            JourneyLevel.sub_title
        ).filter(JourneyLevel.status == 1) \
         
 
        # Execute the query
        datas = query.all()

        if datas:
            all_data = []
        for data in datas:
                all_data.append({
                    'id': data.id,
                    'sub_title': data.sub_title,
                    'title': data.title
                })
        
        return all_data
    
    

    @staticmethod
    @handle_repository_errors
    def add_event(event_data):
        """Adds a new event to the database."""
        try:
            new_event = Event(**event_data)
            db.session.add(new_event)
            db.session.commit()
            return new_event
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def update_event(event_id, event_data):
        """Updates an existing event in the database."""
        try:
            event = Event.query.get(event_id)
            if event:
                for key, value in event_data.items():
                    setattr(event, key, value)
                db.session.commit()
            return event
        except Exception as e:
            db.session.rollback()
            raise e
            

    @staticmethod
    @handle_repository_errors
    def get_image_by_id(image_id):
        """Gets an event image by its primary key (id)."""
        return EventImages.query.filter_by(id=image_id).first()

    @staticmethod
    @handle_repository_errors
    def get_ticket_by_id(ticket_id):
        """Gets an event image by its primary key (id)."""
        return EventTicket.query.filter_by(id=ticket_id).first()

    @staticmethod
    @handle_repository_errors
    def get_tag_by_event_id_and_tag_id(event_id, tag_id):
        """Gets an event tag by event ID and tag ID."""
        return EventTags.query.filter_by(event_id=event_id, tag_id=tag_id).first()


    @staticmethod
    @handle_repository_errors
    def get_curriculum_by_id(curriculum_id):
        """Gets event curriculum by its primary key (id)."""
        return EventCurriculum.query.filter_by(id=curriculum_id).first()

    @staticmethod
    @handle_repository_errors
    def updateNumberofclass(event_id):
        if event_id:
            event = db.session.query(Event).filter_by(id=event_id).first()      
            if event:
                    #event.total_no_class = EventCurriculum.query.filter_by(event_id=event_id,status=1).count() 
                   
                    current_date = event.start_date.date()
                    end_date = event.end_date.date()
                    total_no_classes = 0
                    occusr_weekday_list = []

                    if event.occusr_weekday:
                        occusr_weekday_list = list(map(int, event.occusr_weekday.split(",")))

                    if event.occusr_type == 1:
                        # Once on start date
                        total_no_classes = 1

                    elif event.occusr_type == 3:
                        # Weekly on specific weekdays
                        while current_date <= end_date:
                            if current_date.weekday() in occusr_weekday_list:
                                total_no_classes += 1
                            current_date += timedelta(days=1)

                    elif event.occusr_type == 4:
                        if event.occusr_month == 1:
                            # Every month on the same date
                            while current_date <= end_date:
                                total_no_classes += 1
                                month = current_date.month + 1 if current_date.month < 12 else 1
                                year = current_date.year + 1 if month == 1 else current_date.year
                                try:
                                    current_date = current_date.replace(month=month, year=year)
                                except ValueError:
                                    current_date = current_date.replace(day=28, month=month, year=year)

                        elif event.occusr_month == 2:
                            # Every nth weekday of the month
                            start_weekday = event.start_date.date().weekday()
                            start_day = event.start_date.day
                            first_day = event.start_date.replace(day=1)
                            weekday_count = 0
                            nth_occurrence = 0

                            for day in range(1, start_day + 1):  
                                if first_day.replace(day=day).weekday() == start_weekday:
                                    weekday_count += 1
                                    if day == start_day:
                                        nth_occurrence = weekday_count
                                        break  

                            while current_date <= end_date:
                                first_day = current_date.replace(day=1)
                                weekday_count = 0  
                                nth_weekday_date = None

                                for day in range(1, 32):  
                                    try:
                                        temp_date = first_day.replace(day=day)
                                        if temp_date.weekday() == start_weekday:
                                            weekday_count += 1
                                            if weekday_count == nth_occurrence:
                                                nth_weekday_date = temp_date
                                                break  
                                    except ValueError:
                                        continue  

                                if nth_weekday_date and nth_weekday_date <= end_date:
                                    total_no_classes += 1

                                month = current_date.month + 1 if current_date.month < 12 else 1
                                year = current_date.year + 1 if month == 1 else current_date.year
                                current_date = current_date.replace(day=1, month=month, year=year)

                    else:
                        # Daily from start_date to end_date
                        total_no_classes = (end_date - current_date).days + 1

                    # Store or return the total count
                    event.total_no_class = total_no_classes


                    
                    db.session.commit()

    @staticmethod
    @handle_repository_errors
    def get_facility_by_event_id_and_facilities_id(event_id, facilities_id):
        """Gets event facility by event ID and facilities ID."""
        return EventFacilities.query.filter_by(event_id=event_id, facilities_id=facilities_id).first()

    @staticmethod
    @handle_repository_errors
    def get_speaker_by_event_id_and_user_id(event_id, user_id):
        """Gets event speaker by event ID and user ID."""
        return EventSpeakers.query.filter_by(event_id=event_id, user_id=user_id).first()

    @staticmethod
    @handle_repository_errors
    def organiser_manages_speaker(organiser_id, speaker_id):
        """Return an active assignment proving this organiser manages the speaker."""
        return (
            db.session.query(EventSpeakers.id)
            .join(Event, Event.id == EventSpeakers.event_id)
            .filter(
                Event.user_id == organiser_id,
                EventSpeakers.user_id == speaker_id,
                EventSpeakers.status == 1,
            )
            .first()
        )


    @staticmethod
    @handle_repository_errors
    def get_document_by_id(document_id):
        """Gets an event document by its primary key (id)."""
        return EventDocuments.query.filter_by(id=document_id).first()
    
    
    @staticmethod
    @handle_repository_errors
    def get_document_file_by_id(document_file_id):
        """Gets an event document by its primary key (id)."""
        return EventDocumentsFiles.query.filter_by(id=document_file_id).first()
    
    
    @staticmethod
    @handle_repository_errors
    def check_add_date(image_data):
        """Adds a new event image to the database."""
        try:
            ddate=EventDate.query.filter(EventDate.event_id==image_data.get("event_id")).filter(EventDate.date==image_data.get("date")).first()
            if ddate :
                return ddate
                
            new_date = EventDate(**image_data)
            db.session.add(new_date)
            db.session.commit()
            return new_date
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def add_date(image_data):
        """Adds a new event image to the database."""
        try:
            new_date = EventDate(**image_data)
            db.session.add(new_date)
            db.session.commit()
            return new_date
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def add_date_time(image_data):
        """Adds a new event image to the database."""
        try:
            new_date_time = EventDateTime(**image_data)
            db.session.add(new_date_time)
            db.session.commit()
            return new_date_time
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def add_image(image_data):
        """Adds a new event image to the database."""
        try:
            new_image = EventImages(**image_data)
            db.session.add(new_image)
            db.session.commit()
            return new_image
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def add_ticket(ticket_data):
        """Adds a new event image to the database."""
        try:
            new_image = EventTicket(**ticket_data)
            db.session.add(new_image)
            db.session.commit()
            return new_image
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def update_image(image_id, image_data):
        """Updates an existing event image in the database."""
        try:
            image = EventImages.query.get(image_id)
            if image:
                for key, value in image_data.items():
                    setattr(image, key, value)
                db.session.commit()
            return image
        except Exception as e:
            db.session.rollback()
            raise e
            
 
    @staticmethod
    @handle_repository_errors
    def update_ticket(ticket_id, ticket_data):
        """Updates an existing event image in the database."""
        try:
            image = EventTicket.query.get(ticket_id)
            if image:
                for key, value in ticket_data.items():
                    setattr(image, key, value)
                db.session.commit()
            return image
        except Exception as e:
            db.session.rollback()
            raise e
            
 
    @staticmethod
    @handle_repository_errors
    def update_date(image_id, image_data):
        """Updates an existing event image in the database."""
        try:
            image = EventDate.query.get(image_id)
            if image:
                for key, value in image_data.items():
                    setattr(image, key, value)
                db.session.commit()
            return image
        except Exception as e:
            db.session.rollback()
            raise e
            
 
    @staticmethod
    @handle_repository_errors
    def update_date_time(image_id, image_data):
        """Updates an existing event image in the database."""
        try:
            image = EventDateTime.query.get(image_id)
            if image:
                for key, value in image_data.items():
                    setattr(image, key, value)
                db.session.commit()
            return image
        except Exception as e:
            db.session.rollback()
            raise e
            
 


    @staticmethod
    @handle_repository_errors
    def add_tag(tag_data):
        """Adds a new event tag to the database."""
        try:
            new_tag = EventTags(**tag_data)
            db.session.add(new_tag)
            db.session.commit()
            return new_tag
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def update_tag(tag_id, tag_data):
        """Updates an existing event tag in the database."""
        try:
            tag = EventTags.query.get(tag_id)
            if tag:
                for key, value in tag_data.items():
                    setattr(tag, key, value)
                db.session.commit()
            return tag
        except Exception as e:
            db.session.rollback()
            raise e

    
    @staticmethod
    @handle_repository_errors
    def get_tag_by_name(tag_name):
        """Gets a tag by its name (title)."""
        return Tag.query.filter_by(title=tag_name).first()
        
    
    @staticmethod
    @handle_repository_errors
    def get_tag_by_event_id_and_tag_id(event_id, tag_id):
        """Checks if the event is already associated with the given tag ID."""
        return EventTags.query.filter_by(event_id=event_id, tag_id=tag_id).first()

    
    @staticmethod
    @handle_repository_errors
    def add_new_tag(tag_data):
        """Adds a new tag to the Tags table."""
        try:
            new_tag = Tag(**tag_data)
            db.session.add(new_tag)
            db.session.commit()
            return new_tag
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def add_curriculum(curriculum_data):
        """Adds a new event curriculum to the database."""
        try:
            new_curriculum = EventCurriculum(**curriculum_data)
            db.session.add(new_curriculum)
            db.session.commit()
            return new_curriculum
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def update_curriculum(curriculum_id, curriculum_data):
        """Updates an existing event curriculum in the database."""
        try:
            curriculum = EventCurriculum.query.get(curriculum_id)
            if curriculum:
                for key, value in curriculum_data.items():
                    setattr(curriculum, key, value)
                db.session.commit()
            return curriculum
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def get_facility_by_event_id_and_facilities_id(event_id, facilities_id):
        """Checks if the event is already associated with the given facility."""
        return EventFacilities.query.filter_by(event_id=event_id, facilities_id=facilities_id).first()


    @staticmethod
    @handle_repository_errors
    def add_facility(facility_data):
        """Adds a new event facility to the database."""
        try:
            new_facility = EventFacilities(**facility_data)
            db.session.add(new_facility)
            db.session.commit()
            return new_facility
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def update_facility(facility_id, facility_data):
        """Updates an existing event facility in the database."""
        try:
            facility = EventFacilities.query.get(facility_id)
            if facility:
                for key, value in facility_data.items():
                    setattr(facility, key, value)
                db.session.commit()
            return facility
        except Exception as e:
            db.session.rollback()
            raise e
            
    @staticmethod
    @handle_repository_errors
    def get_speaker_by_event_id_and_user_id(event_id, user_id):
        """Checks if the event is already associated with the given speaker by user_id."""
        return EventSpeakers.query.filter_by(event_id=event_id, user_id=user_id).first()

   
    @staticmethod
    @handle_repository_errors
    def get_speaker_by_event_id_and_name(event_id, first_name, last_name):
        """Checks if the event is already associated with the given speaker by name."""
        return EventSpeakers.query.filter_by(event_id=event_id, first_name=first_name, last_name=last_name).first()
            
    @staticmethod
    @handle_repository_errors
    def add_speaker(speaker_data):
        """Adds a new event speaker to the database."""
        try:
            new_speaker = EventSpeakers(**speaker_data)
            db.session.add(new_speaker)
            db.session.commit()
            return new_speaker
        except Exception as e:
            db.session.rollback()
            raise e

        

    @staticmethod
    @handle_repository_errors
    def update_speaker(speaker_id, speaker_data):
        """Updates an existing event speaker in the database."""
        try:
            speaker = EventSpeakers.query.get(speaker_id)
            if speaker:
                for key, value in speaker_data.items():
                    setattr(speaker, key, value)
                db.session.commit()
            return speaker
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def add_document_file(document_data):
        """Adds a new event document to the database."""
        try:
            new_document = EventDocumentsFiles(**document_data)
            db.session.add(new_document)
            db.session.commit()
            return new_document
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def add_document(document_data):
        """Adds a new event document to the database."""
        try:
            new_document = EventDocuments(**document_data)
            db.session.add(new_document)
            db.session.commit()
            return new_document
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def update_document_file(document_id, document_data):
        """Updates an existing event document in the database."""
        try:
            document = EventDocumentsFiles.query.get(document_id)
            if document:
                for key, value in document_data.items():
                    setattr(document, key, value)
                db.session.commit()
            return document
        except Exception as e:
            db.session.rollback()
            raise e
            
    
    @staticmethod
    @handle_repository_errors
    def update_document(document_id, document_data):
        """Updates an existing event document in the database."""
        try:
            document = EventDocuments.query.get(document_id)
            if document:
                for key, value in document_data.items():
                    setattr(document, key, value)
                db.session.commit()
            return document
        except Exception as e:
            db.session.rollback()
            raise e
            
    
    @staticmethod
    @handle_repository_errors
    def get_itinerary_by_event_id_day_and_title(event_id,id):
        """Retrieve itinerary by event ID, day, and title."""
        try:
            return EventItinerary.query.filter_by(event_id=event_id,id=id).first()
        except Exception as e:
            raise e


    @staticmethod
    @handle_repository_errors
    def add_itinerary(itinerary_data):
        """Adds a new event itinerary to the database."""
        try:
            new_itinerary = EventItinerary(**itinerary_data)
            db.session.add(new_itinerary)
            db.session.commit()
            return new_itinerary
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def update_itinerary(itinerary_id, itinerary_data):
        """Updates an existing event itinerary in the database."""
        try:
            itinerary = EventItinerary.query.get(itinerary_id)
            if itinerary:
                for key, value in itinerary_data.items():
                    setattr(itinerary, key, value)
                db.session.commit()
            return itinerary
        except Exception as e:
            db.session.rollback()
            raise e



#######################################    end of creaate and event ###########################################

######################################   delete event #########################################################


    @staticmethod
    @handle_repository_errors
    def get_event_by_id(event_id):
        """Gets an event by ID."""
        return Event.query.get(event_id)


    @staticmethod
    @handle_repository_errors
    def get_event_for_booking(event_id):
        """Load an event while serializing competing booking capacity checks."""
        query = Event.query.filter(Event.id == event_id)
        if not EventRepo._using_sqlite():
            query = query.with_for_update()
        return query.first()
        
       
    @staticmethod
    @handle_repository_errors
    def get_event_datetime_by_id(date_time_id):
        """Gets an event by ID."""
        return EventDateTime.query.get(date_time_id)
        
       
    @staticmethod
    @handle_repository_errors
    def get_event_ticket_by_id(ticket_id):
        """Gets an event by ID."""
        return EventTicket.query.get(ticket_id)
        
          
    @staticmethod
    @handle_repository_errors
    def get_event_date_by_id(event_date_id):
        """Gets an event by ID."""
        return EventDate.query.get(event_date_id)
        
        

    @staticmethod
    @handle_repository_errors
    def update_event(event_id, event_data):
        """Updates an existing event in the database."""
        event = Event.query.get(event_id)
        if event:
            for key, value in event_data.items():
                setattr(event, key, value)
            db.session.commit()
        return event

 
 
    @staticmethod
    @handle_repository_errors
    def soft_delete_image_by_id(id, event_id, session_id):
        """Deletes an image by its primary key and event ID."""
        image = EventImages.query.filter_by(id=id, event_id=event_id).first()
        if image:
            db.session.delete(image)
            db.session.commit()

    @staticmethod
    @handle_repository_errors
    def soft_delete_tag_by_id(id, event_id, session_id):
        """Deletes a tag by its primary key and event ID."""
        tag = EventTags.query.filter_by(id=id, event_id=event_id).first()
        if tag:
            db.session.delete(tag)
            db.session.commit()

    @staticmethod
    @handle_repository_errors
    def soft_delete_curriculum_by_id(id, event_id, session_id):
        """Deletes a curriculum by its primary key and event ID."""
        curriculum = EventCurriculum.query.filter_by(id=id, event_id=event_id).first()
        if curriculum:
            db.session.delete(curriculum)
            db.session.commit()

    @staticmethod
    @handle_repository_errors
    def soft_delete_facility_by_id(id, event_id,session_id):
        """Deletes a facility by its primary key and event ID."""
        facility = EventFacilities.query.filter_by(id=id, event_id=event_id).first()
        if facility:
            db.session.delete(facility)
            db.session.commit()

    @staticmethod
    @handle_repository_errors
    def soft_delete_speaker_by_id(id, event_id, session_id):
        """Deletes a speaker by its primary key and event ID."""
        speaker = EventSpeakers.query.filter_by(user_id=id, event_id=event_id).first()
        if speaker:
            db.session.delete(speaker)
            db.session.commit()

    @staticmethod
    @handle_repository_errors
    def soft_delete_document_file_by_id(id, event_id, session_id):
        """Deletes a document by its primary key and event ID."""
        document = EventDocumentsFiles.query.filter_by(id=id).first()
        if document:
            db.session.delete(document)
            db.session.commit()

    @staticmethod
    @handle_repository_errors
    def soft_delete_document_by_id(id, event_id, session_id):
        """Deletes a document by its primary key and event ID."""
        document = EventDocuments.query.filter_by(id=id, event_id=event_id).first()
        if document:
            db.session.delete(document)
            db.session.commit()

    @staticmethod
    @handle_repository_errors
    def soft_delete_ticket_by_id(id, event_id, session_id):
        """Deletes a document by its primary key and event ID."""
        document = EventTicket.query.filter_by(id=id, event_id=event_id).first()
        if document:
            db.session.delete(document)
            db.session.commit()

    @staticmethod
    @handle_repository_errors
    def soft_delete_itinerary_by_id(id, event_id, session_id):
        """Deletes an itinerary by its primary key and event ID."""
        itinerary = EventItinerary.query.filter_by(id=id, event_id=event_id).first()
        if itinerary:
            db.session.delete(itinerary)
            db.session.commit()


            
            
#####################################################  end of delete #######################################





    @staticmethod
    @handle_repository_errors
    def participant_images(event_id):

        participants=db.session.query(Users.profile_image).join(Participant, Participant.user_id == Users.id).filter(Participant.event_id == event_id,Participant.status == 1).group_by(Participant.user_id).limit(5).all()
        
        participant_images = [
            {"profile_image": participant.profile_image} 
            for participant in participants
        ]
        return participant_images
        
        # event = Event.query.filter_by(id=event_id).first()

        # participant_images = [
            # {"profile_image": participant.user.profile_image} 
            # for participant in event.participants[:5]  # Limiting to 5 participants
        # ]

        # return participant_images

   


    @staticmethod
    @handle_repository_errors
    def participant_images_user(event_id):
            
        participant_images = [
                    {"profile_image": img.profile_image}
                    for img in db.session.query(Users.profile_image)
                        .join(Participant, Participant.user_id == Users.id)
                        .filter(Participant.event_id == event_id)
                        .group_by(Users.id)
                        .limit(5)
                        .all()
        ]
        
        
        # participants=db.session.query(Users.profile_image).join(Participant, Participant.user_id == Users.id).filter(Participant.event_id == event_id,Participant.status == 1).group_by(Participant.user_id).limit(5).all()
        
        # participant_images = [
            # {"profile_image": participant.profile_image} 
            # for participant in participants
        # ]
        return participant_images

   
    
    @staticmethod
    @handle_repository_errors
    def total_participants_count(event_id):

        total_participants = db.session.query(func.count(Participant.id)).filter(Participant.event_id == event_id,Participant.status == 1).scalar()
        
        return total_participants
    
    
    
    @staticmethod
    @handle_repository_errors
    def total_participants_count_user(event_id):

        total_participants = db.session.query(func.count(func.distinct(Participant.user_id))).filter(Participant.event_id == event_id,Participant.status == 1).scalar()        
        return total_participants
    
    
    @staticmethod
    @handle_repository_errors
    def total_revenue(event_id):

        total_participants = db.session.query(func.sum(Participant.paid_amount)).filter(
                    Participant.event_id == event_id,Participant.status == 1
                ).scalar()
        
        return total_participants

    

    @staticmethod
    @handle_repository_errors
    def get_participant_count_by_event_and_date(event_id, session_id):
        """
        Gets the daily participant count for the past two weeks for a specific event.
        Includes days with zero participants.
        """
        try:
            # Define the time range (past two weeks)
            today = datetime.utcnow().date()
            start_date = today - timedelta(days=8)

            # Generate a list of all dates within the past two weeks
            date_range = [
                (start_date + timedelta(days=i)) for i in range(9)
            ]

            # Query for participant counts, including dates with no participants
            results = (
                db.session.query(
                    func.date(Participant.created_on).label("date"),
                    func.count(Participant.id).label("participant_count")
                )
                .join(Event, Participant.event_id == Event.id)
                .filter(
                    Event.id == event_id,
                    Event.user_id == session_id,
                    func.date(Participant.created_on) >= start_date,
                    func.date(Participant.created_on) <= today
                )
                .group_by(func.date(Participant.created_on))
                .order_by(func.date(Participant.created_on))
                .all()
            )

            # Convert query results into a dictionary for easy lookup
            result_dict = {result.date: result.participant_count for result in results}

            # Prepare the final result, ensuring all dates from the past two weeks are included
         

            # Assuming date_range is a list of datetime objects
            participant_counts = [
                {"date": date.strftime("%Y-%m-%d"), "participant_count": result_dict.get(date, 0)}
                for date in date_range
            ]

            return participant_counts
        except Exception as e:
            raise e


    @staticmethod
    @handle_repository_errors
    def get_event_by_id_and_user_id(event_id, session_id):
        """Gets an event by ID and user ID."""
        try:
            result = (
                db.session.query(Event)
                .outerjoin(EventSpeakers, Event.id == EventSpeakers.event_id)
                .filter(
                    Event.status != 3,
                    Event.id == event_id,
                    or_(
                        Event.user_id == session_id,
                        EventSpeakers.user_id == session_id
                    )
                )
                .first()
            )
           
            
            #result = Event.query.outerjoin(EventSpeakers, Event.id == EventSpeakers.event_id).filter(Event.status != 3,Event.id==event_id,or_(Event.user_id == session_id,EventSpeakers.user_id == session_id)).first()
            
            return result
        except Exception as e:
            raise e
 

    @staticmethod
    @handle_repository_errors
    def get_dates_by_event_id(event_id):
        """Gets all dates related to an event by event ID."""
        dates = EventDate.query.filter_by(event_id=event_id).all()
        return [
            {
                "id": image.id,
                "date": image.date,
                "times": EventRepo.get_times_by_event_date(image.id),
                "status": image.status
            }
            for image in dates
        ]

    @staticmethod
    @handle_repository_errors
    def delete_event_schedule(event_id):
        """Remove generated dates only when the service has proved no bookings exist."""
        date_ids = [row.id for row in EventDate.query.filter_by(event_id=event_id).all()]
        if date_ids:
            EventDateTime.query.filter(EventDateTime.event_date_id.in_(date_ids)).delete(
                synchronize_session=False,
            )
            EventDate.query.filter(EventDate.id.in_(date_ids)).delete(synchronize_session=False)
            db.session.commit()
        
    @staticmethod
    @handle_repository_errors
    def get_times_by_event_date(date_id):
        """Gets all images related to an event by event ID."""
        images = EventDateTime.query.filter_by(event_date_id=date_id).all()
        return [
            {
                "id": image.id,
                "start_time": image.start_time.isoformat(),
                "end_time": image.end_time.isoformat(),
                "available": image.available,
                "booked": image.booked,
                "status": image.status
            }
            for image in images
        ]

    @staticmethod
    @handle_repository_errors
    def get_dates_by_event_id_user(event_id):
        """Gets all dates related to an event by event ID."""
        cdate = datetime.utcnow().date()
        dates = EventDate.query.filter_by(event_id=event_id).all()
        return [
            {
                "id": date.id,
                "date": date.date,
                "times": EventRepo.get_times_by_event_date_user(date.id,date.date),
                "status": 2 if date.date<cdate else date.status
            }
            for date in dates 
        ]

    @staticmethod
    @handle_repository_errors
    def get_times_by_event_date_user(date_id,date):
        """Gets all images related to an event by event ID."""
        cdatetime = datetime.utcnow()
        images = EventDateTime.query.filter_by(event_date_id=date_id).all()
        return [
            {
                "id": image.id,
                "start_time": image.start_time.isoformat(),
                "end_time": image.end_time.isoformat(),
                "available": image.available,
                "booked": image.booked,
                "status": 2 if datetime.combine(date, image.start_time) < cdatetime else image.status
            }
            for image in images
        ]

    @staticmethod
    @handle_repository_errors
    def get_images_by_event_id(event_id):
        """Gets all images related to an event by event ID."""
        images = EventImages.query.filter_by(event_id=event_id,status=1).all()
        return [
            {
                "id": image.id,
                "cropped_image": image.cropped_image,
                "full_screen_image": image.full_screen_image,
                "status": image.status
            }
            for image in images
        ]

    @staticmethod
    @handle_repository_errors
    def get_min_ticket_price(event_id):
        """Gets all images related to an event by event ID."""
        ticket = EventTicket.query.filter_by(event_id=event_id,status=1).order_by(EventTicket.price).first()
        return ticket
        
    @staticmethod
    @handle_repository_errors
    def get_tickets_by_event_id(event_id):
        """Gets all images related to an event by event ID."""
        images = EventTicket.query.filter_by(event_id=event_id,status=1).all()
        return [
            {
                "id": image.id,
                "title": image.title,
                "price": image.price,
                "available": image.available,
                "booked": image.booked,
                "max_per_user": image.max_per_user,
                "status": image.status
            }
            for image in images
        ]

    @staticmethod
    @handle_repository_errors
    def get_tags_by_event_id(event_id):
        """Gets all tags related to an event by event ID."""
        tags = EventTags.query.filter_by(event_id=event_id,status=1).all()
        return [
            {
                "id": tag.id,
                "tag_id": tag.tag_id,
                "status": tag.status,
                "title": tag.tag.title
            }
            for tag in tags
        ]

    @staticmethod
    @handle_repository_errors
    def get_curriculum_by_event_id(event_id):
        """Gets all curriculum related to an event by event ID."""
        current_datetime = datetime.now().date()  
        current_time = datetime.now().time() 
        curriculums = EventCurriculum.query.filter_by(event_id=event_id,status=1).all()
        return [
            {
                "id": curriculum.id,
                "description": curriculum.description,
                "ar_description": curriculum.ar_description,
                "no_of_days": curriculum.no_of_days,
                "start_date": curriculum.start_date.strftime("%Y-%m-%d") if isinstance(curriculum.start_date, datetime) else curriculum.start_date,
                "end_date": curriculum.end_date.strftime("%Y-%m-%d") if isinstance(curriculum.end_date, datetime) else curriculum.end_date,
                "start_time": curriculum.start_time.strftime("%H:%M:%S") if isinstance(curriculum.start_time, time) else curriculum.start_time,
                "end_time": curriculum.end_time.strftime("%H:%M:%S") if isinstance(curriculum.end_time, time) else curriculum.end_time,
                "status": curriculum.status,
                "active_now": (
                    1 if (
                        isinstance(curriculum.start_date, (datetime, date)) and 
                        isinstance(curriculum.end_date, (datetime, date)) and 
                        isinstance(curriculum.start_time, time) and 
                        isinstance(curriculum.end_time, time) and 
                        datetime.combine(curriculum.start_date, datetime.min.time()) <= datetime.now() <= datetime.combine(curriculum.end_date, datetime.max.time()) and
                        curriculum.start_time <= datetime.now().time() <= curriculum.end_time
                    ) else 0
                )
            }
            for curriculum in curriculums
        ]

    @staticmethod
    @handle_repository_errors
    def get_facilities_by_event_id(event_id):
        """Gets all facilities related to an event by event ID."""
        facilities = EventFacilities.query.filter_by(event_id=event_id,status=1).all()
        return [
            {
                "id": facility.id,
                "facilities_id": facility.facilities_id,
                "facilities_title": facility.facility.title,
                "status": facility.status
            }
            for facility in facilities
        ]

    @staticmethod
    @handle_repository_errors
    def get_speakers_by_event_id(event_id):
        """Gets all speakers related to an event by event ID."""
        speakers = EventSpeakers.query.filter_by(event_id=event_id,status=1).all()
        return [
            {
                "id": speaker.user_id,
                "user_id": speaker.user_id,
                "first_name": speaker.user.first_name if speaker.user else speaker.first_name,
                "last_name": speaker.user.last_name if speaker.user else speaker.last_name,
                "profile_image": speaker.user.profile_image if speaker.user else speaker.image,
                "status": speaker.status 
            }
            for speaker in speakers
        ]

    @staticmethod
    @handle_repository_errors
    def get_documents_file_by_id(event_document_id):
        """Gets all documents related to an event by event ID."""
        documents = EventDocumentsFiles.query.filter_by(event_document_id=event_document_id,status=1).all()
        response = []
        for document in documents:
            parsed_path = unquote(urlparse(document.file_path or "").path)
            file_name = os.path.basename(parsed_path) or f"material-{document.id}"
            extension = os.path.splitext(file_name)[1].lower().lstrip(".") or "file"
            response.append({
                "id": document.id,
                "file_path": document.file_path,
                "file_name": file_name,
                "file_type": extension,
                "status": document.status
            })
        return response
        
        
    @staticmethod
    @handle_repository_errors
    def get_documents_by_event_id(event_id):
        """Gets all documents related to an event by event ID."""
        documents = EventDocuments.query.filter_by(event_id=event_id,status=1).all()
        return [
            {
                "id": document.id,
                "document_name": document.document_name,
                "ar_document_name": document.ar_document_name,
                "file_path": document.file_path,
                "files": EventRepo.get_documents_file_by_id(document.id),
                "status": document.status
            }
            for document in documents
        ]
        
        
    
    @staticmethod
    @handle_repository_errors
    def get_itinerary_by_event_id(event_id):
        """Gets all itineraries related to an event by event ID."""
        itineraries = EventItinerary.query.filter_by(event_id=event_id,status=1).all()
        return [
            {
                "id": itinerary.id,
                "day": itinerary.day,
                "title": itinerary.title,
                "ar_title": itinerary.ar_title,
                "start_time": itinerary.start_time.strftime('%H:%M:%S') if itinerary.start_time else None,
                "end_time": itinerary.end_time.strftime('%H:%M:%S') if itinerary.end_time else None,
                "start_date": itinerary.start_date.strftime("%Y-%m-%d") if itinerary.start_date else None,
                "end_date": itinerary.end_date.strftime("%Y-%m-%d") if itinerary.end_date else None,
                "status": itinerary.status
            }
            for itinerary in itineraries
        ]


        
    @staticmethod
    def get_participant_qrcode(event_id, user_id):
        """Fetch QR code for a participant if they are registered for an event."""
        participant = Participant.query.filter_by(event_id=event_id, user_id=user_id).first()
        return participant.qrcode if participant else None
        
        
        
    @staticmethod
    def get_participant_data(event_id, user_id):
        """Fetch QR code for a participant if they are registered for an event."""
        participant = Participant.query.filter(Participant.event_id==event_id, Participant.user_id==user_id,Participant.status>0).first()
        return participant
        
        
    @staticmethod
    def get_participant_data_byid(participant_id, user_id):
        """Fetch QR code for a participant if they are registered for an event."""
        participant = Participant.query.filter(Participant.id==participant_id, Participant.user_id==user_id,Participant.status>0).first()
        return participant
        
     
    @staticmethod
    @handle_repository_errors
    def get_participant_data_all(event_id,user_id): 
        participants = db.session.query(Participant,EventTicket.title,func.count(ParticipantQrcode.id).label("qrcode_count")).outerjoin(EventTicket, EventTicket.id == Participant.ticket_id).outerjoin(ParticipantQrcode, ParticipantQrcode.participant_id == Participant.id).filter(Participant.event_id==event_id, Participant.user_id==user_id, Participant.status>0).group_by(Participant.id, EventTicket.title).all()
        return [
            {
                "qrcode_path": participant.qrcode_path,
                "qrcode": participant.qrcode,
                "ticket_no": str(participant.id)+"0",
                "ticket_title": ticket_title, 
                "qrcode_count": qrcode_count+1, 
                "ticket_id": participant.ticket_id,
                "paid_amount": participant.paid_amount,
                "quantity": participant.quantity,
                "participant_id": participant.id,
                "date": participant.date,
                "start_time": participant.start_time.strftime("%H:%M:%S") if participant.start_time else None,
                "end_time": participant.end_time.strftime("%H:%M:%S") if participant.end_time else None,
                "ticket": participant.ticket 
            }
            for participant,ticket_title,qrcode_count in participants
            if participant is not None
        ]

    
    @staticmethod
    @handle_repository_errors
    def get_participant_data_all_byid(participant_id,user_id): 
        participants = db.session.query(Participant,EventTicket.title,func.count(ParticipantQrcode.id).label("qrcode_count")).outerjoin(EventTicket, EventTicket.id == Participant.ticket_id).outerjoin(ParticipantQrcode, ParticipantQrcode.participant_id == Participant.id).filter(or_(Participant.id==participant_id,Participant.parent_id==participant_id), Participant.user_id==user_id, Participant.status>0).group_by(Participant.id, EventTicket.title).all()
        return [
            {
                "qrcode_path": participant.qrcode_path,
                "qrcode": participant.qrcode,
                "participant_id": participant.id,
                "ticket_no": str(participant.id)+"0",
                "ticket_title": ticket_title, 
                "qrcode_count": qrcode_count+1, 
                "ticket_id": participant.ticket_id,
                "paid_amount": participant.paid_amount,
                "quantity": participant.quantity,
                "date": participant.date,
                "start_time": participant.start_time.strftime("%H:%M:%S") if participant.start_time else None,
                "end_time": participant.end_time.strftime("%H:%M:%S") if participant.end_time else None,
                "ticket": participant.ticket 
            }
            for participant,ticket_title,qrcode_count in participants
        ]

    
    @staticmethod
    def get_participant_next_attendance_day(participant_id, attendance_date):
        """Fetch QR code for a participant if they are registered for an event."""
        participant = ParticipantsAttendance.query.filter(
            ParticipantsAttendance.participant_id == participant_id,
            ParticipantsAttendance.attendance_date > date.today()
        ).order_by(asc(ParticipantsAttendance.attendance_date)).first()
        return participant
        
    @staticmethod
    def get_participant_attendance_day(participant_id, attendance_date):
        """Fetch QR code for a participant if they are registered for an event."""
        participant = ParticipantsAttendance.query.filter_by(participant_id=participant_id, attendance_date=func.date(attendance_date)).first()
        if participant:
            return participant.status
        return None
        
        
        
    @staticmethod
    def get_journey_level_name(journey_level_id):
        """Fetch the name of the journey level based on journey_level_id."""
        journey_level = JourneyLevel.query.get(journey_level_id)
        return journey_level.title if journey_level else None


    @staticmethod
    def get_journey_level_sub_name(journey_level_id):
        """Fetch the name of the journey level based on journey_level_id."""
        journey_level = JourneyLevel.query.get(journey_level_id)
        return journey_level.sub_title if journey_level else None


        
        
        
########################################  end of get by id ##############################




    @staticmethod
    @handle_repository_errors
    def get_active_master_facilities():
        """Fetches all active facilities from the master Facilities table."""
        facilities = Facilities.query.filter_by(status=1).all()  # Assuming status=1 means active
        return [
            {
                "id": facility.id,
                "title": facility.title,
                "ar_title": facility.ar_title
              
            }
            for facility in facilities
        ]
        
    @staticmethod
    @handle_repository_errors
    def get_active_master_journey_levels():
        """Fetches all active journey levels from the JourneyLevel table."""
        journey_levels = JourneyLevel.query.filter_by(status=1).all()  # Assuming status=1 means active
        return [
            {
                "id": journey_level.id,
                "title": journey_level.title,
                "sub_title": journey_level.sub_title,
                "ar_title": journey_level.ar_title
            }
            for journey_level in journey_levels
        ]

    @staticmethod
    @handle_repository_errors
    def get_active_master_languages():
        """Fetch centrally managed languages offered during listing creation."""
        languages = Language.query.filter_by(status=1).order_by(Language.id.asc()).all()
        return [
            {
                "id": language.id,
                "title": language.title,
                "ar_title": language.ar_title,
            }
            for language in languages
        ]

    @staticmethod
    @handle_repository_errors
    def get_active_master_tags():
        """Fetches all active tags from the master Tags table."""
        tags = Tag.query.filter_by(status=1).all()  # Assuming status=1 means active
        return [
            {
                "id": tag.id,
                "title": tag.title,
                "ar_title": tag.ar_title
               
            }
            for tag in tags
        ]
        
        
    @staticmethod
    @handle_repository_errors
    def get_active_categories_with_subcategories():
        """Fetches all active categories with their related active subcategories."""
        
        categories = Category.query.filter_by(status=1).all()  # Fetch only active categories (status=1)

        result = []
        for category in categories:
            # Fetch active subcategories for each active category
            active_subcategories = [
                {
                    "id": subcategory.id,
                    "title": subcategory.title,
                    "ar_title": subcategory.ar_title,
                    "image": subcategory.image,
                    "topic_id": subcategory.topic_key,
                    "radar_area": subcategory.radar_area,
                    "radar_description": subcategory.classification_description,
                   
                }
                for subcategory in category.subcategories if subcategory.status == 1
            ]
            
            result.append({
                "id": category.id,
                "title": category.title,
                "ar_title": category.ar_title,              
                'is_tourslot': category.is_tourslot,               
                'is_itinerary': category.is_itinerary,               
                'is_curriculum': category.is_curriculum,               
                'is_speaker': category.is_speaker,               
                'is_material': category.is_material,         
                "subcategories": active_subcategories
            })
        
        return result


    @staticmethod
    @handle_repository_errors
    def get_active_speakers():
        """Fetches all active users with role_type = 4 (speakers)."""
        
        speakers = Users.query.filter_by(role_type=4, status=1).all()  # Assuming status=1 means active

        return [
            {
                "id": speaker.id,
                "first_name": speaker.first_name,
                "last_name": speaker.last_name,
                "profile_image": speaker.profile_image
            }
            for speaker in speakers
        ]



    @staticmethod
    @handle_repository_errors
    def get_admin_filtered_events(request_data):
        """Fetches events based on multiple optional filters provided in the request data."""
        try: 
        
            Timezone = request.headers.get('Timezone',os.getenv('d_t_z'))
            start_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )

            end_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )
            start_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )

            end_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )
            now = datetime.now(ZoneInfo(Timezone))
            
            # Extract parameters from request data with default values
            user_id = request_data.get('organiser_id')
            category_id = request_data.get('category_id')
            start_date = request_data.get('start_date')
            end_date = request_data.get('end_date')
            keyword = request_data.get('keyword')
            price_type = request_data.get('price_type')
            area = request_data.get('area')
            city = request_data.get('city')
            speaker_id = request_data.get('speaker_id')
            page = request_data.get('page', 1)
            per_page = request_data.get('per_page',100)
            status = request_data.get('status')
            journey_level_id = request_data.get('journey_level_id')
            min_price = request_data.get('min_price')
            max_price = request_data.get('max_price')
            min_classes = request_data.get('min_classes')
            max_classes = request_data.get('max_classes')
            event_type = request_data.get('event_type')
            latitude = request_data.get('latitude')
            longitude = request_data.get('longitude')
            radius = request_data.get('radius')  # Radius in kilometers
            sort_by = request_data.get('sort_by', 'start_date')
            sort_order = request_data.get('sort_order', 'desc')
            
            # Additional filters for recently added and upcoming events
            recently_added_days = request_data.get('recently_added_days', None)
            upcoming_days = request_data.get('upcoming_days', None)  # Default is None to apply filter only if provided

        

            query = Event.query.outerjoin(Organization, Organization.user_id == Event.user_id) .outerjoin(Users, Users.id == Event.user_id) 


            
            # Apply optional filters
            
            query = query.filter(Event.status != 3)
      
            if user_id:
                query = query.filter(Event.user_id == user_id)
            if category_id:
                query = query.filter(Event.category_id == category_id)
                
                
                
            if start_date and end_date:
                query = query.filter(or_(
                    and_(start_dt_converted >= func.date(start_date), start_dt_converted <= func.date(end_date)),
                    and_(end_dt_converted >= func.date(start_date), end_dt_converted <= func.date(end_date)),
                    and_(func.date(start_date) >= start_dt_converted, func.date(start_date) <= end_dt_converted),
                    and_(func.date(end_date) >= start_dt_converted, func.date(end_date) <= end_dt_converted)
                ))
            else:
                if start_date:
                    query = query.filter(start_dt_converted >= func.date(start_date))
                if end_date:
                    query = query.filter(end_dt_converted <= func.date(end_date))
                    
                    
                  
                    
                    
            if keyword:
                keyword = f"%{keyword}%"
                query = query.filter(Event.title.ilike(keyword) | Organization.organization_name.ilike(keyword) | Users.first_name.ilike(keyword) | Users.last_name.ilike(keyword))
            if price_type is not None:
                query = query.filter(Event.price_type == price_type)
            if area is not None:
                query = query.filter(Event.area == area)
            if city is not None:
                query = query.filter(Event.city == city)
            if status is not None:
                query = query.filter(Event.status == status)
            if journey_level_id is not None:
                query = query.filter(Event.journey_level_id == journey_level_id)
            if min_price is not None and max_price is not None:
                query = query.filter(Event.price >= min_price, Event.price <= max_price)
            if min_classes is not None and max_classes is not None:
                query = query.filter(Event.total_no_class >= min_classes, Event.total_no_class <= max_classes)
            if event_type is not None:
                query = query.filter(Event.event_type == event_type)
            if speaker_id:
                query = query.join(EventSpeakers).filter(EventSpeakers.user_id == speaker_id)

            # Apply recently added filter if provided
            if recently_added_days is not None:
                recent_threshold_date = now - timedelta(days=recently_added_days)
                query = query.filter(Event.created_on >= recent_threshold_date)

            # Apply upcoming events filter if provided
            if upcoming_days is not None:
                
                upcoming_threshold_date = now + timedelta(days=upcoming_days)
                query = query.filter(start_dt_converted >= now, start_dt_converted <= upcoming_threshold_date)
                

            
            # Apply location-based filtering if latitude, longitude, and radius are provided
            if latitude is not None and longitude is not None and radius is not None:
                query = query.filter(
                    func.acos(
                        func.sin(func.radians(Event.latitude)) * func.sin(func.radians(latitude)) +
                        func.cos(func.radians(Event.latitude)) * func.cos(func.radians(latitude)) *
                        func.cos(func.radians(Event.longitude) - func.radians(longitude))
                    ) * 3958.8 <= radius  # Radius in kilometers (Earth's radius = 6371 km= 3958.8 miles)
                )

            # Apply sorting
            if sort_by and sort_order:
                sort_column = getattr(Event, sort_by, None)
                if sort_column:
                    if sort_order.lower() == 'desc':
                        query = query.order_by(sort_column.desc())
                    else:
                        query = query.order_by(sort_column.desc())
            

            if request_data.get('page'):
                paginated_query = query.paginate(page=page, per_page=per_page, error_out=False)
                serialized_events = [EventRepo.admin_serialize_event(event) for event in paginated_query.items]
         
                pagination_meta = {
                    "total": paginated_query.total,
                    "pages": paginated_query.pages,
                    "current_page": paginated_query.page,
                    "per_page": paginated_query.per_page
                }
            else:
                all_events=query.all()
                serialized_events = [EventRepo.admin_serialize_event(event) for event in all_events]
                pagination_meta={}

            

         
            return {"events": serialized_events, "pagination": pagination_meta}
        except Exception as e:
            raise e






    @staticmethod
    def admin_serialize_event(event):
        """Converts an Event object into a dictionary."""
        
        # Get the organizer's organization name
        user = Users.query.filter_by(id=event.user_id).first()
        organizer = Organization.query.filter_by(user_id=event.user_id).first()
        if user.role_type==3:
            organization_name = organizer.organization_name if organizer else None
        else:
            organization_name = user.first_name+" "+user.last_name if user else None

        # Comma-separated speaker names
        speaker_names = ", ".join(
            f"{speaker.user.first_name} {speaker.user.last_name}" 
            for speaker in event.speakers if speaker.user
        )
        
        

        return {
            "id": event.id,
            "title": event.title,
            "organiser": organization_name,  # Include the organization name
            "start_date": event.start_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event.start_date, datetime) else event.start_date,
            "end_date": event.end_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event.end_date, datetime) else event.end_date,
            "price_type": event.price_type,
            "area": event.area,
            "price": event.price,
            "city": event.city,
            "status": event.status,
            "participant_count": EventRepo.get_participant_count_all(event.id),
            "category_title": event.category.title if event.category else None,
            "speakers": speaker_names,
        }



    @staticmethod
    @handle_repository_errors
    def event_search(session_id,data):
        
        
        try:
            
            
            keyword = data.get('search', "")  # Default to an empty string if 'title' is not present
            now = datetime.utcnow()
    

            # Query with filters
            events = (
                Event.query
                .join(Category, Event.category_id == Category.id, isouter=True)  
                .filter(Event.status == 1) 
                #.filter(cast(Event.end_date, Date) >= cast(func.timezone(Event.time_zone, func.now()), Date)) 
                .filter(func.date(Event.end_date) >= now.date()) 
                .filter(Category.title.ilike(f"%{keyword}%") | Event.title.ilike(f"%{keyword}%"))
                .order_by(Event.title.ilike(f"%{keyword}%").desc())
                .order_by(Category.title.ilike(f"%{keyword}%").desc())
                .limit(10)
                .all()
            )

            
            # Convert the query results into a list of dictionaries for better readability
            result= [
                {
                    "id": event.id,
                    "title": event.title,
                    "category_image":event.category.image
                }
                for event in events
            ]
            
            
            
            
            for eventDa in result:
                data = {'event_id':eventDa['id']}
                existing_wishlist_item = WishlistRepository.find_wishlist_item(data, session_id)
                if existing_wishlist_item:
                    eventDa['is_wishlisted'] = 1
                else:
                    eventDa['is_wishlisted'] = 0
                    
            return result
            
        except Exception as e:
            raise e














############################  get event list  organiser app ###########################



    @staticmethod
    @handle_repository_errors
    def get_all_events_by_user_id(session_id):
        """Gets all events by user ID, including basic event info and related category and subcategory titles."""
        try:
            events = Event.query.filter(Event.user_id == session_id, Event.status != 3).all()

            
            # Convert the query results into a list of dictionaries for better readability
            return [
                {
                    "id": event.id,
                    "title": event.title,
                    "ar_title": event.ar_title,
                    "description": event.description,
                    "ar_description": event.ar_description,
                    "start_date": event.start_date.strftime('%Y-%m-%dT%H:%M:%S') if event.start_date else None,
                    "end_date": event.end_date.strftime('%Y-%m-%dT%H:%M:%S') if event.end_date else None,
                    "start_time": event.start_time.strftime('%H:%M:%S') if event.start_time else None,
                    "end_time": event.end_time.strftime('%H:%M:%S') if event.end_time else None,
                    "event_type": event.event_type,
                    "location_type": event.location_type,
                    "meet_link": event.meet_link,
                    "location": event.location,
                    "price_type": event.price_type,
                    "area": event.area,
                    "city": event.city,
                    "price": str(event.price) if event.price else None,
                    "status": event.status,
                    "category_title": event.category.title if event.category else None,
                    "ar_category_title": event.category.ar_title if event.category else None,
                    "sub_category_title": event.subcategory.title if event.subcategory else None,
                    "ar_sub_category_title": event.subcategory.ar_title if event.subcategory else None
                }
                for event in events
            ]
        except Exception as e:
            raise e
        
            



    @staticmethod
    @handle_repository_errors
    def get_filtered_events(request_data, session_id):
        """Fetches events based on multiple optional filters provided in the request data."""
        try:
            if not EventRepo._using_mysql():
                return EventRepo._get_filtered_events_sqlite(request_data, session_id)

        
            Timezone = request.headers.get('Timezone',os.getenv('d_t_z'))
            start_dttm_converted = func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
            )

            end_dttm_converted = func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
            )
            start_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )

            end_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )
            start_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )

            end_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )
            now = datetime.now(ZoneInfo(Timezone))
            
            # Extract parameters from request data with default values
            user_id = session_id 
            start_date = request_data.get('start_date') or None
            end_date = request_data.get('end_date') or None
            keyword = request_data.get('keyword') or None
            
            price_type = request_data.get('price_type',None)     
            if not isinstance(price_type, (list, tuple)) and price_type is not None and price_type != "":
                price_type=[price_type]
                
            category_id = request_data.get('category_id',None)     
            if not isinstance(category_id, (list, tuple)) and category_id is not None and category_id != "":
                category_id=[category_id]
            
            location_type = request_data.get('location_type',None)     
            if not isinstance(location_type, (list, tuple)) and location_type is not None and location_type != "":
                location_type=[location_type]
                
            area = request_data.get('area') or None
            city = request_data.get('city') or None      
            
            sub_category_id = request_data.get('sub_category_id')
            if not isinstance(sub_category_id, (list, tuple)) and sub_category_id is not None and sub_category_id != "":
                sub_category_id=[sub_category_id] 
                            
            speaker_id = request_data.get('speaker_id')
            if not isinstance(speaker_id, (list, tuple)) and speaker_id is not None and speaker_id != "":
                speaker_id=[speaker_id] 
                
            page = request_data.get('page', 1)
            per_page = request_data.get('per_page', 10)
            status = request_data.get('status') or None
            journey_level_id = request_data.get('journey_level_id') or None
            min_price = request_data.get('min_price') or None
            max_price = request_data.get('max_price') or None
            min_classes = request_data.get('min_classes') or None
            max_classes = request_data.get('max_classes') or None
            event_type = request_data.get('event_type') or None
            latitude = request_data.get('latitude') or None
            longitude = request_data.get('longitude') or None
            radius = request_data.get('radius') or None  # Radius in kilometers
            sort_by = request_data.get('sort_by', 'start_date')
            sort_order = request_data.get('sort_order', 'asc')
            
            recently_added_days = request_data.get('recently_added_days', None)
            ongoing_days = request_data.get('ongoing_days', None)        
            upcoming_days = request_data.get('upcoming_days', None)
            completed_days = request_data.get('completed_days', None)

            search = request_data.get('search',None)
         

            # Ensure user_id is provided
            if not user_id:
                raise ValueError("User ID is required.")

            query = Event.query.filter(
                Event.user_id == user_id,
                Event.status != 3  # Assuming '3' indicates a deleted  status
            )

            # Apply optional filters
            if search:
                query = query.filter(Event.title.ilike(f"%{search}%"))
            if category_id:
                query = query.filter(Event.category_id.in_(category_id))
            if start_date and end_date:
                query = query.filter(or_(
                    and_(start_dt_converted >= func.date(start_date), start_dt_converted <= func.date(end_date)),
                    and_(end_dt_converted >= func.date(start_date), end_dt_converted <= func.date(end_date)),
                    and_(func.date(start_date) >= start_dt_converted, func.date(start_date) <= end_dt_converted),
                    and_(func.date(end_date) >= start_dt_converted, func.date(end_date) <= end_dt_converted)
                ))
                # query = query.filter(or_(
                    # and_(func.date(Event.start_date) >= start_date, func.date(Event.start_date) <= end_date),
                    # and_(func.date(Event.end_date) >= start_date, func.date(Event.end_date) <= end_date),
                    # and_(start_date >= func.date(Event.start_date), start_date <= func.date(Event.end_date)),
                    # and_(end_date >= func.date(Event.start_date), end_date <= func.date(Event.end_date))
                # ))
            if keyword:
                query = query.filter(Event.title.ilike(f"%{keyword}%") | Event.description.ilike(f"%{keyword}%"))
            if price_type:
                query = query.filter(Event.price_type.in_(price_type))
            if area is not None:
                query = query.filter(Event.area == area)
            if city is not None:
                query = query.filter(Event.city == city)
            if status:
                query = query.filter(Event.status == status)
            if journey_level_id is not None:
                query = query.filter(Event.journey_level_id == journey_level_id)
            if min_price is not None and max_price is not None:
                query = query.filter(Event.price >= min_price, Event.price <= max_price)
            if min_classes is not None and max_classes is not None:
                query = query.filter(Event.total_no_class >= min_classes, Event.total_no_class <= max_classes)
            if event_type is not None:
                query = query.filter(Event.event_type == event_type)
            if location_type:
                query = query.filter(Event.location_type.in_(location_type))
            if speaker_id:
                query = query.join(EventSpeakers).filter(EventSpeakers.user_id.in_(speaker_id))
            if sub_category_id:
                query = query.filter(Event.sub_category_id.in_(sub_category_id))

            # if recently_added_days is not None:

                # recently_added_days = 15
                # recent_threshold_date = now - timedelta(days=recently_added_days)
                # query = query.filter(Event.created_on >= recent_threshold_date)
 
            # if upcoming_days is not None:
                # upcoming_days = 15
                # upcoming_threshold_date = now + timedelta(days=upcoming_days)
                # query = query.filter(Event.start_date >= now, Event.start_date <= upcoming_threshold_date)

            if upcoming_days is not None:
                upcoming_days = 15
                #upcoming_threshold_date = (now + timedelta(days=upcoming_days)).replace(hour=23, minute=59, second=59, microsecond=999999)
                upcoming_threshold_date = (now + timedelta(days=upcoming_days)).date()

                query = query.filter(start_dttm_converted > now,Event.status != 4)
                # query = query.filter(Event.start_date >= now.date(), Event.start_date <= upcoming_threshold_date)
                
            if ongoing_days is not None:

                query = query.filter(start_dttm_converted <= now, end_dttm_converted >= now,Event.status != 4)
                
            if completed_days is not None:
                 query = query.filter(
                    or_(
                        end_dttm_converted < now,   # ✅ Completed naturally
                        Event.status == 4           # ✅ Also include cancelled
                    )
                )
                
            if latitude is not None and longitude is not None and radius is not None:
                query = query.filter(
                    func.acos(
                        func.sin(func.radians(Event.latitude)) * func.sin(func.radians(latitude)) +
                        func.cos(func.radians(Event.latitude)) * func.cos(func.radians(latitude)) *
                        func.cos(func.radians(Event.longitude) - func.radians(longitude))
                    ) * 3958.8 <= radius
                )
            if recently_added_days is not None:
                query = query.order_by(Event.created_on.desc())
            elif sort_by and sort_order:
                sort_column = getattr(Event, sort_by, None)
                if sort_column:
                    if sort_order.lower() == 'desc':
                        query = query.order_by(sort_column.desc())
                    else:
                        query = query.order_by(sort_column.asc())




            if request_data.get('page'):
                paginated_query = query.paginate(page=page, per_page=per_page, error_out=False)
                all_events=paginated_query.items
            else:
                all_events=query.all()

                
                
            serialized_events = []
            for event in all_events:
                # Fetch top 5 participants' images
                # participant_images = [
                    # {"profile_image": img[0]} for img in db.session.query(distinct(Users.profile_image))
                    # .join(Participant, Participant.user_id == Users.id)
                    # .filter(Participant.event_id == event.id)
                    # .limit(5)
                    # .all()
                # ]
                participant_images = [
                    {"profile_image": img.profile_image}
                    for img in db.session.query(Users.profile_image)
                        .join(Participant, Participant.user_id == Users.id)
                        .filter(Participant.event_id == event.id)
                        .group_by(Users.id)
                        .limit(5)
                        .all()
                ]




                # Count total participants
                total_participants = db.session.query(func.count(distinct(Participant.user_id))).filter(
                    Participant.event_id == event.id
                ).scalar() or 0

                # Serialize the event with participants info
                event_data = EventRepo.serialize_event(event)
                event_data.update({
                    "participant_images": participant_images,
                    "total_participants_count": total_participants
                })
                serialized_events.append(event_data)

            if request_data.get('page'):
                return {
                    "events": serialized_events,
                    "total": paginated_query.total,
                    "pages": paginated_query.pages,
                    "current_page": paginated_query.page,
                    "per_page": paginated_query.per_page
                }
            else:
                return {
                    "events": serialized_events
                }
        except Exception as e:
            raise e




    @staticmethod
    @handle_repository_errors
    def get_filtered_events_speaker(request_data, session_id):
        """Fetches events based on multiple optional filters provided in the request_data."""
        try:
        
            Timezone = request.headers.get('Timezone',os.getenv('d_t_z'))
            start_dttm_converted = func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
            )
            end_dttm_converted = func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
            )
            
            start_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )

            end_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )
            start_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )

            end_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )
            now = datetime.now(ZoneInfo(Timezone))
            
            # Extract parameters from request data with default values
            user_id = session_id 
            start_date = request_data.get('start_date') or None
            end_date = request_data.get('end_date') or None
            keyword = request_data.get('keyword') or None
            
            price_type = request_data.get('price_type',None)     
            if not isinstance(price_type, (list, tuple)) and price_type is not None and price_type != "":
                price_type=[price_type]
                
            category_id = request_data.get('category_id',None)     
            if not isinstance(category_id, (list, tuple)) and category_id is not None and category_id != "":
                category_id=[category_id]
            
            location_type = request_data.get('location_type',None)     
            if not isinstance(location_type, (list, tuple)) and location_type is not None and location_type != "":
                location_type=[location_type]
                
            area = request_data.get('area') or None
            city = request_data.get('city') or None      
            
            sub_category_id = request_data.get('sub_category_id')
            if not isinstance(sub_category_id, (list, tuple)) and sub_category_id is not None and sub_category_id != "":
                sub_category_id=[sub_category_id] 
                            
            speaker_id = request_data.get('speaker_id')
            if not isinstance(speaker_id, (list, tuple)) and speaker_id is not None and speaker_id != "":
                speaker_id=[speaker_id] 
                
            page = request_data.get('page', 1)
            per_page = request_data.get('per_page', 10)
            status = request_data.get('status') or None
            journey_level_id = request_data.get('journey_level_id') or None
            min_price = request_data.get('min_price') or None
            max_price = request_data.get('max_price') or None
            min_classes = request_data.get('min_classes') or None
            max_classes = request_data.get('max_classes') or None
            event_type = request_data.get('event_type') or None
            latitude = request_data.get('latitude') or None
            longitude = request_data.get('longitude') or None
            radius = request_data.get('radius') or None  # Radius in kilometers
            sort_by = request_data.get('sort_by', 'start_date')
            sort_order = request_data.get('sort_order', 'asc')
            
            recently_added_days = request_data.get('recently_added_days', None)
            ongoing_days = request_data.get('ongoing_days', None)        
            upcoming_days = request_data.get('upcoming_days', None)
            completed_days = request_data.get('completed_days', None)

            search = request_data.get('search',None)
         

            # Ensure user_id is provided
            if not user_id:
                raise ValueError("User ID is required.")
            
            event_speakers_alias = aliased(EventSpeakers)
            query = Event.query.filter(Event.status != 3)
            query = query.outerjoin(event_speakers_alias, Event.id == event_speakers_alias.event_id)
            query = query.filter(
                or_(
                    Event.user_id == user_id, 
                    event_speakers_alias.user_id == user_id
                )
            )
            
          
          
            # Apply optional filters
            if search:
                query = query.filter(Event.title.ilike(f"%{search}%"))
            if category_id:
                query = query.filter(Event.category_id.in_(category_id))
            if start_date and end_date:
                query = query.filter(or_(
                    and_(start_dt_converted >= func.date(start_date), start_dt_converted <= func.date(end_date)),
                    and_(end_dt_converted >= func.date(start_date), end_dt_converted <= func.date(end_date)),
                    and_(func.date(start_date) >= start_dt_converted, func.date(start_date) <= end_dt_converted),
                    and_(func.date(end_date) >= start_dt_converted, func.date(end_date) <= end_dt_converted)
                ))
               
            if keyword:
                query = query.filter(Event.title.ilike(f"%{keyword}%") | Event.description.ilike(f"%{keyword}%"))
            if price_type:
                query = query.filter(Event.price_type.in_(price_type))
            if area is not None:
                query = query.filter(Event.area == area)
            if city is not None:
                query = query.filter(Event.city == city)
            if status:
                query = query.filter(Event.status == status)
            if journey_level_id is not None:
                query = query.filter(Event.journey_level_id == journey_level_id)
            if min_price is not None and max_price is not None:
                query = query.filter(Event.price >= min_price, Event.price <= max_price)
            if min_classes is not None and max_classes is not None:
                query = query.filter(Event.total_no_class >= min_classes, Event.total_no_class <= max_classes)
            if event_type is not None:
                query = query.filter(Event.event_type == event_type)
            if location_type:
                query = query.filter(Event.location_type.in_(location_type))
            if speaker_id:
                query = query.filter(event_speakers_alias.user_id.in_(speaker_id))
            if sub_category_id:
                query = query.filter(Event.sub_category_id.in_(sub_category_id))



            if upcoming_days is not None:
                upcoming_days = 15
                #upcoming_threshold_date = (now + timedelta(days=upcoming_days)).replace(hour=23, minute=59, second=59, microsecond=999999)
                upcoming_threshold_date = (now + timedelta(days=upcoming_days)).date()

                query = query.filter(start_dttm_converted > now.date())
                # query = query.filter(Event.start_date >= now.date(), Event.start_date <= upcoming_threshold_date)
                
            if ongoing_days is not None:

                query = query.filter(start_dttm_converted <= now.date(), end_dttm_converted >= now.date())
                
            if completed_days is not None:

                query = query.filter(end_dttm_converted < now.date())
                
            if latitude is not None and longitude is not None and radius is not None:
                query = query.filter(
                    func.acos(
                        func.sin(func.radians(Event.latitude)) * func.sin(func.radians(latitude)) +
                        func.cos(func.radians(Event.latitude)) * func.cos(func.radians(latitude)) *
                        func.cos(func.radians(Event.longitude) - func.radians(longitude))
                    ) * 3958.8 <= radius
                )
            if recently_added_days is not None:
                query = query.order_by(Event.created_on.desc())
            elif sort_by and sort_order:
                sort_column = getattr(Event, sort_by, None)
                if sort_column:
                    if sort_order.lower() == 'desc':
                        query = query.order_by(sort_column.desc())
                    else:
                        query = query.order_by(sort_column.asc())


            if request_data.get('page'):
                paginated_query = query.paginate(page=page, per_page=per_page, error_out=False)
                all_events=paginated_query.items
            else:
                all_events=query.all()

                

            serialized_events = []
            for event in all_events:
                # Fetch top 5 participants' images
                # participant_images = [
                    # {"profile_image": img.profile_image} for img in db.session.query(Users.profile_image)
                    # .join(Participant, Participant.user_id == Users.id)
                    # .filter(Participant.event_id == event.id)
                    # .limit(5)
                    # .all()
                # ]
                participant_images = [
                    {"profile_image": img.profile_image}
                    for img in db.session.query(Users.profile_image)
                        .join(Participant, Participant.user_id == Users.id)
                        .filter(Participant.event_id == event.id)
                        .group_by(Users.id)
                        .limit(5)
                        .all()
                ]




                # Count total participants
                total_participants = db.session.query(func.count(Participant.id)).filter(
                    Participant.event_id == event.id
                ).scalar()

                # Serialize the event with participants info
                event_data = EventRepo.serialize_event(event)
                event_data.update({
                    "participant_images": participant_images,
                    "total_participants_count": total_participants
                })
                serialized_events.append(event_data)
            if request_data.get('page'):
                return {
                    "events": serialized_events,
                    "total": paginated_query.total,
                    "pages": paginated_query.pages,
                    "current_page": paginated_query.page,
                    "per_page": paginated_query.per_page
                }
            else:
                return {
                    "events": serialized_events
                }
        except Exception as e:
            raise e




    @staticmethod
    def serialize_event(event):
        """Converts an Event object into a dictionary."""
        return {
            "id": event.id,
            "title": event.title,
            "ar_title": event.ar_title,
            "description": event.description,
            "ar_description": event.ar_description,
            "start_date": event.start_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event.start_date, datetime) else event.start_date,
            "end_date": event.end_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event.end_date, datetime) else event.end_date,
            "start_time": event.start_time.strftime('%H:%M:%S') if isinstance(event.start_time, time) else event.start_time,
            "end_time": event.end_time.strftime('%H:%M:%S') if isinstance(event.end_time, time) else event.end_time,
            "price_type": event.price_type,
            "area": event.area,
            "city": event.city,
            "price": float(event.price) if event.price is not None else None,
            "location_type": event.location_type,
            "meet_link": event.meet_link,
            "location": event.location,
            "occusr_month": event.occusr_month,
            "occusr_type": event.occusr_type,
            "occusr_weekday": event.occusr_weekday,
            "status": event.status,
            "category_title": event.category.title if event.category else None,
            "ar_category_title": event.category.ar_title if event.category else None,
            "sub_category_title": event.subcategory.title if event.subcategory else None,
            "ar_sub_category_title": event.subcategory.ar_title if event.subcategory else None,
            "created_on": event.created_on.strftime('%Y-%m-%dT%H:%M:%S'),
            "updated_on": event.updated_on.strftime('%Y-%m-%dT%H:%M:%S'),

        }









        
    @staticmethod
    @handle_repository_errors
    def search_trending(request_data):
        try:
            
            now = datetime.utcnow()

            query = Event.query.join(SearchHistory, SearchHistory.event_id == Event.id)

            query = query.filter(Event.status == 1)
            query = query.filter(func.date(Event.end_date) >= now.date())            
            resultt = query.group_by(Event.id).order_by(func.count(SearchHistory.id).desc()).limit(8).all()              
           
           
            # Serialize the events
            appserialize_event = [EventRepo.appserialize_event(event,request_data.get('session_id')) for event in resultt]
            
            
            
            for eventDa in appserialize_event:
                data = {'event_id':eventDa['id']}
                existing_wishlist_item = WishlistRepository.find_wishlist_item(data, request_data.get('session_id'))
                if existing_wishlist_item:
                    eventDa['is_wishlisted'] = 1
                else:
                    eventDa['is_wishlisted'] = 0
            

            return appserialize_event
            
        except Exception as e:
            raise e


        
    @staticmethod
    @handle_repository_errors
    def search_history(request_data):
        try:
            
            now = datetime.utcnow()

            query = Event.query.join(SearchHistory, SearchHistory.event_id == Event.id)

            query = query.filter(Event.status == 1)
            query = query.filter(func.date(Event.end_date) >= now.date())            
            query = query.filter(SearchHistory.user_id == request_data.get('session_id'))
            resultt = query.group_by(Event.id).order_by(SearchHistory.created_on.desc()).limit(8).all()              
           
           
            # Serialize the events
            appserialize_event = [EventRepo.appserialize_event(event,request_data.get('session_id')) for event in resultt]
            
            
            for eventDa in appserialize_event:
                data = {'event_id':eventDa['id']}
                existing_wishlist_item = WishlistRepository.find_wishlist_item(data, request_data.get('session_id'))
                if existing_wishlist_item:
                    eventDa['is_wishlisted'] = 1
                else:
                    eventDa['is_wishlisted'] = 0
            
            

            return appserialize_event
            
        except Exception as e:
            raise e








#################################  app event ##############################################

        
    @staticmethod
    @handle_repository_errors
    def appEvent(request_data):
        """Fetches events based on multiple optional filters provided in the request data."""
        try:
            if not EventRepo._using_mysql():
                return EventRepo._app_event_sqlite(request_data)

            Timezone = request.headers.get('Timezone',os.getenv('d_t_z'))
            start_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )

            end_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )
            start_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )

            end_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
            )
            now = datetime.now(ZoneInfo(Timezone))
        
            # Extract parameters from request data with default values
            user_id = request_data.get('organizer_id') 
            #if user_id is None or user_id == "" or user_id:
            #    user_id = request_data.get('organizers')
            if not isinstance(user_id, list):
                user_id = [user_id] if user_id else []
                

                
            category_id = request_data.get('category_id')
            #if category_id is None or category_id == "" or category_id:
            #    category_id = request_data.get('categories')
            if not isinstance(category_id, list):
                category_id = [category_id] if category_id else []
                
            sub_category_id = request_data.get('sub_category_id')
            if not isinstance(sub_category_id, list):
                sub_category_id = [sub_category_id] if sub_category_id else []
            
            location = request_data.get('location')   
            if isinstance(location, str):
                location = None
            #if location is None or location == "" or location:
            #    location = request_data.get('location') 
            # if isinstance(location, str):
                # try:
                    # location = int(location)  # Convert to integer
                # except ValueError:
                    # location = None  
            if not isinstance(location, list):
                location = [location] if (location or location==0) else []        
             
            start_date = request_data.get('start_date')
            if start_date is None or start_date == "":
                start_date = request_data.get('startDate')
                
            end_date = request_data.get('end_date')
            if end_date is None or end_date == "":
                end_date = request_data.get('endDate')
                
            keyword = request_data.get('keyword')
            
            price_type = request_data.get('price_type')
            #if price_type is None or price_type == "" or price_type:
            #    price_type = request_data.get('priceTypes',None) 
            # if isinstance(price_type, str):
                # try:
                    # price_type = int(price_type)  # Convert to integer
                # except ValueError:
                    # price_type = None      
            if not isinstance(price_type, list):
                price_type = [price_type] if price_type else []                    
            
                
            area = request_data.get('area')
            city = request_data.get('city')
            
            speaker_id = request_data.get('speaker_id')
            if speaker_id is None or speaker_id == "" or not speaker_id:
                speaker_id = request_data.get('speakers') 
            if not isinstance(speaker_id, list):
                speaker_id = [speaker_id] if speaker_id else [] 
                
            page = request_data.get('page', 1)
            per_page = request_data.get('per_page', 1000)
            per_page = 1000
            status = request_data.get('status')
            gender = request_data.get('gender') 
            
            journey_level_id = request_data.get('journey_level_id')
            #if journey_level_id is None or journey_level_id == "" or journey_level_id:
            #    journey_level_id = request_data.get('journey_level')
            if not isinstance(journey_level_id, list):
                journey_level_id = [journey_level_id] if journey_level_id else [] 
                
            min_price = request_data.get('min_price')
            max_price = request_data.get('max_price')
            min_classes = request_data.get('min_classes')
            max_classes = request_data.get('max_classes')
            event_type = request_data.get('event_type')
            latitude = request_data.get('latitude')
            longitude = request_data.get('longitude')
            radius = request_data.get('radius')  # Radius in kilometers
            
            sort_by = request_data.get('sort_by', 'start_date')
            sort_order = request_data.get('sort_order', 'asc')
            sort_options = request_data.get('sort')
            sort_options_filter = request_data.get('sort_Filter')
            #if sort_options_filter is None or sort_options_filter == "" or sort_options_filter:
            #    sort_options_filter = request_data.get('sortTypes') 
            if isinstance(sort_options_filter, list):
                sort_options_filter = sort_options_filter[0] if sort_options_filter else None 


            recently_added_days = request_data.get('recently_added_days', None)
            upcoming_days = request_data.get('upcoming_days', None)
            ongoing_days = request_data.get('ongoing_days', None)

            if sort_options == 1: 
                recently_added_days = 7
            elif recently_added_days is not None:
                sort_options = 1

            if sort_options == 2: 
                location = [1]

            if sort_options == 4: 
                upcoming_days = 1
            elif upcoming_days:
                sort_options = 4


            if sort_options_filter == 2: 
                ongoing_days = 1
            if sort_options_filter == 3: 
                upcoming_days = 1


            distancee = func.acos(
                func.sin(func.radians(Event.latitude)) * func.sin(func.radians(latitude)) +
                func.cos(func.radians(Event.latitude)) * func.cos(func.radians(latitude)) *
                func.cos(func.radians(Event.longitude) - func.radians(longitude))
            ) * 3958.8
            ticket_price = func.coalesce(func.min(EventTicket.price), 0).label("ticket_price")
            sort_price = func.coalesce(func.min(EventTicket.price), Event.price).label("sort_price")

            speaker_alias = aliased(Users)
            organizer_alias = aliased(Users)
            query = (
                Event.query
                .join(Category, Event.category_id == Category.id, isouter=True)  
                .join(Organization, Event.user_id == Organization.user_id, isouter=True)  
                .join(organizer_alias, Event.user_id == organizer_alias.id, isouter=True)  
                .join(EventTicket, EventTicket.event_id == Event.id, isouter=True)  
                .join(EventSpeakers, EventSpeakers.event_id == Event.id, isouter=True)  
                .join(speaker_alias, EventSpeakers.user_id == speaker_alias.id, isouter=True)  
                # Temporary product choice: keep the home/list feed populated for
                # remote users and demo data. Revisit before enforcing upcoming-only
                # visibility or distance-gated discovery again.
                .filter(Event.status == 1)  
                .with_entities(
                    Event,  # Select all columns from Event
                    distancee.label("distance"), 
                    ticket_price,
                    sort_price,
                    Organization.organization_name,
                    organizer_alias.first_name,
                    organizer_alias.last_name,
                    func.DATE_FORMAT(start_dt_converted,'%Y-%m-%dT%H:%i:%s').label("rn1"),
                    func.DATE_FORMAT(start_tm_converted,'%H:%i:%s').label("rn2"),
                    func.DATE_FORMAT(end_dt_converted,'%Y-%m-%dT%H:%i:%s').label("rn3"),
                    func.DATE_FORMAT(end_tm_converted,'%H:%i:%s').label("rn4"),
                    func.row_number().over(
                        partition_by=Event.location_type,
                        order_by=(
                            case((Event.location_type == 1, distancee), else_=None),
                            case((Event.location_type == 1, Event.start_date), else_=None),
                            case((Event.location_type == 1, Event.start_time), else_=None),
                            case((Event.location_type != 1, Event.start_date), else_=None),
                            case((Event.location_type != 1, Event.start_time), else_=None),
                        )
                    ).label("rn")
                ) 
            )
            
            
            # query = (
            #     db.session.query(
            #         Event, 
            #         wishlist_count  # Count of wishlisted events
            #     )
            #     .outerjoin(Wishlist, Wishlist.event_id == Event.id)  # Join with Wishlist table
            #     .filter(Event.status == 1)
            #     .group_by(Event.id)  # Group by Event to apply aggregation
            # )






            # Apply optional filters
            if user_id:
                query = query.filter(Event.user_id.in_(user_id))
            if category_id:
                query = query.filter(Event.category_id.in_(category_id))
            if sub_category_id:
                query = query.filter(Event.sub_category_id.in_(sub_category_id))
                
            if start_date and end_date:
                start_date_expr = func.DATE(start_date)
                end_date_expr = func.DATE(end_date)

                # query = query.filter(or_(
                    # and_(start_dt_converted >= start_date_expr, start_dt_converted <= end_date_expr),
                    # and_(end_dt_converted >= start_date_expr, end_dt_converted <= end_date_expr),
                    # and_(start_date_expr >= start_dt_converted, start_date_expr <= end_dt_converted),
                    # and_(end_date_expr >= start_dt_converted, end_date_expr <= end_dt_converted)
                # ))
                
                
                
                
                
                
                
                date_overlap = or_(
                    and_(start_dt_converted >= start_date_expr, start_dt_converted <= end_date_expr),
                    and_(end_dt_converted >= start_date_expr, end_dt_converted <= end_date_expr),
                    and_(start_date_expr >= start_dt_converted, start_date_expr <= end_dt_converted),
                    and_(end_date_expr >= start_dt_converted, end_date_expr <= end_dt_converted)
                )

                # Occurrence logic
                once_condition = Event.occusr_type == 1
                daily_condition = Event.occusr_type == 2
                weekly_condition = and_(
                    Event.occusr_type == 3,
                    func.FIND_IN_SET(func.DAYOFWEEK(start_date_expr) - 1, Event.occusr_weekday) > 0
                )
                monthly_condition = and_(
                    Event.occusr_type == 4,
                    or_(
                        and_(
                            Event.occusr_month == 1,  # Same date of month
                            func.DAY(start_date_expr) == func.DAY(start_dt_converted)
                        ),
                        and_(
                            Event.occusr_month == 2,  # Same weekday of month
                            func.WEEKDAY(start_date_expr) == func.WEEKDAY(start_dt_converted)
                        )
                    )
                )

                query = query.filter(and_(date_overlap,or_(once_condition,daily_condition,weekly_condition,monthly_condition)))
    
    
            else:
                if start_date:
                    query = query.filter(start_dt_converted >= func.date(start_date))
                if end_date:
                    query = query.filter(end_dt_converted <= func.date(end_date))

        
        
            if keyword:
                query = query.filter(Category.title.ilike(f"%{keyword}%") | Event.title.ilike(f"%{keyword}%") | Event.description.ilike(f"%{keyword}%") | Organization.organization_name.ilike(f"%{keyword}%") | speaker_alias.first_name.ilike(f"%{keyword}%") | speaker_alias.last_name.ilike(f"%{keyword}%"))
            if price_type:
                query = query.filter(Event.price_type.in_(price_type))
            if area is not None:
                query = query.filter(Event.area == area)    
            if city is not None:
                query = query.filter(Event.city == city)
                    
            if location or location==[0]:
                query = query.filter(Event.location_type.in_(location))
            if status is not None:
                query = query.filter(Event.status == status)
            if gender==1:
                query = query.filter(Event.gender.in_([0,1,3]))
            if gender==2:
                query = query.filter(Event.gender.in_([0,2,3]))
            if gender==3:
                query = query.filter(Event.gender.in_([0,3]))
            if journey_level_id:
                query = query.filter((Event.journey_level_id.in_(journey_level_id)) | (Event.journey_level_id == 0))
            if min_price is not None :
                query = query.filter(Event.price >= min_price)
            if max_price is not None:
                query = query.filter(Event.price <= max_price)
            if min_classes is not None and max_classes is not None:
                query = query.filter(Event.total_no_class >= min_classes, Event.total_no_class <= max_classes)
            if event_type is not None:
                query = query.filter(Event.event_type == event_type)
            if speaker_id:
                query = query.filter(EventSpeakers.user_id.in_(speaker_id))
                
                
            
            
            
            if recently_added_days is not None:
                
                recent_threshold_date = now - timedelta(days=recently_added_days)
                query = query.filter(Event.created_on >= recent_threshold_date)
               
            if ongoing_days is not None:

                query = query.filter(start_dt_converted <= now.date(), func.date(Event.end_date) >= now.date())
                
            if upcoming_days:
                #upcoming_threshold_date = (now + timedelta(days=upcoming_days)).replace(hour=23, minute=59, second=59, microsecond=999999)
                upcoming_threshold_date = (now + timedelta(days=upcoming_days)).date()
                sort_options = 4
                #query = query.filter(Event.start_date > now.date(), Event.start_date <= upcoming_threshold_date)
                query = query.filter(start_dt_converted > now.date())

            # Do not hide events by radius for now. We still compute/sort distance,
            # but remote users should be able to discover every active event.

            # Apply sorting
            
            
            if keyword:
                query = query.order_by(Event.title.ilike(f"%{keyword}%").desc())
                query = query.order_by(Category.title.ilike(f"%{keyword}%").desc())
            
            
            if sort_options == 1:  # Recently/Latest added
                query = query.group_by(Event.id) 
                query = query.order_by(Event.created_on.desc())  # Sort by the most recently added events                
            elif sort_options == 2: #nearby
                query = query.group_by(Event.id) 
                query = query.order_by(func.acos(
                        func.sin(func.radians(Event.latitude)) * func.sin(func.radians(latitude)) +
                        func.cos(func.radians(Event.latitude)) * func.cos(func.radians(latitude)) *
                        func.cos(func.radians(Event.longitude) - func.radians(longitude))
                    ).asc()) 
                #query = query.order_by(Event.start_date.asc())                
            elif sort_options == 3:  # Most booked
                query = query.filter(func.date(Event.end_date) <= now.date())
                query = query.join(Participant, Participant.event_id == Event.id, isouter=True) \
                             .group_by(Event.id) \
                             .having(func.count(Participant.id) > 0)  # Exclude events with zero bookings
                query = query.order_by(func.count(Participant.id).desc())  # Sort by most booked
            elif sort_options == 4:  # upcoming events
                query = query.group_by(Event.id) 
                query = query.order_by(start_dt_converted.asc())  # Sort by upcoming events
                #query = query.order_by(Event.created_on.desc())  # Sort by latest events - old
            elif sort_options == 5:  #  explore
                query = query.group_by(Event.id) 
                query = query.order_by(Event.created_on.desc())  # Sort by latest
            # elif sort_options == 5:  #  events
                # query = query.order_by(Event.price.desc())  # Sort by high to low
            # elif sort_options == 6:  #  events
                # query = query.order_by(Event.price.asc())  # Sort by low to high
                
                
                
                
            elif sort_options_filter == 1:  # near
                query = query.group_by(Event.id) 
                # query = query.order_by(
                    # (case(
                        # (Event.location_type == 1, func.acos(
                            # func.sin(func.radians(Event.latitude)) * func.sin(func.radians(latitude)) +
                            # func.cos(func.radians(Event.latitude)) * func.cos(func.radians(latitude)) *
                            # func.cos(func.radians(Event.longitude) - func.radians(longitude))
                        # )),  # Real distance for physical events
                        # else_=func.datediff(Event.start_date, func.curdate())  # Days from today for online
                    # )).asc()
                # )
                query = query.order_by(literal_column("rn"), Event.location_type.desc(),distancee)
                # query = query.order_by(
                    # case((Event.location_type != 1, 1), else_=0).asc(),
                    # func.acos(
                        # func.sin(func.radians(Event.latitude)) * func.sin(func.radians(latitude)) +
                        # func.cos(func.radians(Event.latitude)) * func.cos(func.radians(latitude)) *
                        # func.cos(func.radians(Event.longitude) - func.radians(longitude))
                    # ).asc()
                # )                  
            elif sort_options_filter == 2:
                query = query.group_by(Event.id) 
                query = query.order_by(start_dt_converted.asc(),start_tm_converted.asc())   
            elif sort_options_filter == 3:  
                query = query.group_by(Event.id) 
                query = query.order_by(start_dt_converted.asc(),start_tm_converted.asc())  
            elif sort_options_filter == 4:  #  events
                query = query.group_by(Event.id) 
                #query = query.order_by(Event.price.desc())  # Sort by high to low
                query = query.order_by(desc(sort_price),start_dt_converted.asc(),start_tm_converted.asc()) 
            elif sort_options_filter == 5:  #  events
                query = query.group_by(Event.id) 
                #query = query.order_by(Event.price.asc())  # Sort by low to high
                query = query.order_by(sort_price,start_dt_converted.asc(),start_tm_converted.asc())  
                
                
            elif sort_by and sort_order:
                query = query.group_by(Event.id) 
                sort_column = getattr(Event, sort_by, None)
                if sort_column:
                    if sort_order.lower() == 'desc':
                        query = query.order_by(sort_column.desc())
                    else:
                        query = query.order_by(sort_column.asc())
            else:
                query = query.group_by(Event.id) 

                
            # Apply pagination
            paginated_query = query.paginate(page=page, per_page=per_page, error_out=False)

            # Serialize the events
            appserialize_event = []
            for event, distance, ticket_price,sort_price,organization_name,first_name,last_name,rn1,rn2,rn3,rn4,rn in paginated_query.items:
                event_dict = EventRepo.appserialize_event(event,request_data.get('session_id'))
                event_dict["distance"] = round(distance, 2) if distance is not None else 0
                event_dict["ticket_price"] = float(ticket_price) if event.ticket_type == 1 and ticket_price else None
                event_dict["sort_price"] = float(sort_price) if sort_price else None
                event_dict["organization_name"] = organization_name if organization_name else f"{first_name} {last_name}"
                event_dict["lrn"] = rn
                event_dict["start_date_t"] = rn1
                event_dict["start_time_t"] = rn2
                event_dict["end_date_t"] = rn3
                event_dict["end_time_t"] = rn4
                #event_dict["first_name"] = first_name
                #event_dict["last_name"] = last_name
                #event_dict["speakers"] = speakers
                
                date_obj = datetime.strptime(event_dict["start_date"], "%Y-%m-%dT%H:%M:%S").date()
                time_obj = datetime.strptime(event_dict["start_time"], "%H:%M:%S").time()
                event_datetime = datetime.combine(date_obj, time_obj,tzinfo=ZoneInfo(event_dict["time_zone"]))
                if now > event_datetime:
                    #event_dict["start_date"]=event_dict["start_date"]
                    event_dict["start_date"]=EventRepo.getNextEventDateTimeApplicable(event,now) or event_dict["start_date"]
                
                appserialize_event.append(event_dict)
    
    
            
            
            
            for eventDa in appserialize_event:
                data = {'event_id':eventDa['id']}
                existing_wishlist_item = WishlistRepository.find_wishlist_item(data, request_data.get('session_id'))
                if existing_wishlist_item:
                    eventDa['is_wishlisted'] = 1
                else:
                    eventDa['is_wishlisted'] = 0
                                         
                eventDa['participant_images'] = [
                    {"profile_image": img.profile_image} for img in db.session.query(Users.profile_image)
                    .join(Participant, Participant.user_id == Users.id)
                    .filter(Participant.event_id == eventDa['id'])
                    .limit(5)
                    .all()
                ]
                eventDa['total_participants_count'] = db.session.query(func.count(Participant.id)).filter(Participant.event_id == eventDa['id']).scalar()
                     



            

            return {
                "events": appserialize_event,
                "total": paginated_query.total,
                "pages": paginated_query.pages,
                "current_page": paginated_query.page,
                "per_page": paginated_query.per_page
            }
        except Exception as e:
            raise e



    def getNextEventDateTimeApplicable(event, now=None):
        def _to_date(x):
            if x is None:
                return None
            if isinstance(x, date) and not isinstance(x, datetime):
                return x
            if isinstance(x, datetime):
                return x.date()
            if isinstance(x, str):
                return datetime.strptime(x[:10], "%Y-%m-%d").date()
            raise TypeError(f"Unsupported date value: {x!r}")

        def _next_month_same_day(d, target_day):
            month = d.month + 1 if d.month < 12 else 1
            year = d.year + 1 if month == 1 else d.year
            try:
                return d.replace(year=year, month=month, day=target_day)
            except ValueError:
                return d.replace(year=year, month=month, day=28)

        def _nth_weekday_of_month(year, month, weekday, n):
            first = date(year, month, 1)
            count = 0
            day = 1
            while True:
                try:
                    d = date(year, month, day)
                except ValueError:
                    return None
                if d.weekday() == weekday:
                    count += 1
                    if count == n:
                        return d
                day += 1

        if now is None:
            now = datetime.now()
        today = now.date()
        start_d = _to_date(event.start_date)
        end_d = _to_date(event.end_date)
        if start_d is None or end_d is None:
            return None
        if getattr(event, "category_id", None) == 3:
            return today.strftime("%Y-%m-%dT00:00:00") if today <= end_d else None
        current = start_d if start_d >= today else today
        if current > end_d:
            return None
        occusr_type = getattr(event, "occusr_type", None)
        result = None
        if occusr_type == 1:
            result = start_d if start_d >= today and start_d <= end_d else None
        elif occusr_type == 2:
            result = current if current <= end_d else None
        elif occusr_type == 3:
            raw = getattr(event, "occusr_weekday", "") or ""
            try:
                weekdays = [int(x) for x in raw.split(",") if x.strip() != ""]
            except ValueError:
                weekdays = []
            if weekdays:
                probe = current
                while probe <= end_d:
                    if probe.weekday() in weekdays:
                        result = probe
                        break
                    probe += timedelta(days=1)
        elif occusr_type == 4:
            occusr_month = getattr(event, "occusr_month", None)
            if occusr_month == 1:
                target_day = start_d.day
                candidate = start_d
                while candidate < today:
                    candidate = _next_month_same_day(candidate, target_day)
                if candidate <= end_d:
                    result = candidate
            elif occusr_month == 2:
                start_weekday = start_d.weekday()
                first_of_start = start_d.replace(day=1)
                count = 0
                for day_num in range(1, start_d.day + 1):
                    if first_of_start.replace(day=day_num).weekday() == start_weekday:
                        count += 1
                n = count if count >= 1 else 1
                y, m = (current.year, current.month)
                while True:
                    if (y > end_d.year) or (y == end_d.year and m > end_d.month):
                        break
                    nth_d = _nth_weekday_of_month(y, m, start_weekday, n)
                    if nth_d is not None and nth_d >= today and start_d <= nth_d <= end_d:
                        result = nth_d
                        break
                    if m == 12:
                        y, m = y + 1, 1
                    else:
                        m += 1
        else:
            result = current if current <= end_d else None

        return result.strftime("%Y-%m-%dT00:00:00") if result else None




    @staticmethod
    def appserialize_event_booking(event):
        
        """Converts an Event object into a dictionary."""
        # primary_image = event.images[0].full_screen_image if event.images else None
         
         
        participant_images = [
                    {"profile_image": img[0]} for img in db.session.query(distinct(Users.profile_image))
                    .join(Participant, Participant.user_id == Users.id)
                    .filter(Participant.event_id == event.id)
                    .filter(Participant.status==1)
                    .limit(5)
                    .all()
        ]
        total_participants_count = db.session.query(func.count(distinct(Participant.user_id))).filter(Participant.event_id == event.id).filter(Participant.status==1).scalar() or 0
                
    
    
        images = EventImages.query.filter_by(event_id=event.id,status=1).all()
        tags = EventTags.query.filter_by(event_id=event.id,status=1).all()
        
        primary_image = (
            next((image.full_screen_image for image in images if image.status == 1), None)
            if images
            else None
        )

        # Format tags as a comma-separated string
        tags = ", ".join(tag.tag.title for tag in tags if tag.tag and tag.tag.title)


        if not event.time_zone:
            event_time_zone=os.getenv('d_t_z')
        else:
            event_time_zone=event.time_zone
        return {
            "participant_id": event.participant_id,
            "ticket": event.ticket,
            "id": event.id,
            "status": event.status,
            "title": event.title,
            "ar_title": event.ar_title,
            "time_zone": event_time_zone,
            "category_id":event.category_id,
            "category_id":event.category_id,
            "category_title":event.category_title,
            "category_image":event.category_image,
            "start_time": (event.ticket_start_time.strftime("%H:%M:%S") if event.ticket_start_time else None) if event.category_id==3 else (event.start_time.strftime('%H:%M:%S') if event.start_time else None),
            "end_time": (event.ticket_end_time.strftime("%H:%M:%S") if event.ticket_end_time else None) if event.category_id==3 else (event.end_time.strftime('%H:%M:%S') if event.end_time else None),
            "start_date": event.ticket_date if event.category_id==3 else (event.start_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event.start_date, datetime) else event.start_date),
            "end_date": event.ticket_date if event.category_id==3 else (event.end_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event.end_date, datetime) else event.end_date),
            "price_type": event.price_type,
            "occusr_type": event.occusr_type,
            "occusr_weekday": event.occusr_weekday,
            "occusr_month": event.occusr_month,
            "area": event.area,
            "city": event.city,
            "location_type": event.location_type,
            "location": event.location,
            "price": float(event.price) if event.price is not None else None,
           
            "total_participants_count": total_participants_count,
            "participant_images": participant_images,
            "primary_image": primary_image,
            "tags": tags
        }





    @staticmethod
    def appserialize_event(event,user_id=0):
        
        """Converts an Event object into a dictionary."""
        # primary_image = event.images[0].full_screen_image if event.images else None
        
        booked_count = db.session.query(func.count(Participant.id)).filter(Participant.user_id == user_id,Participant.event_id == event.id,Participant.status == 1).scalar()
                
        primary_image = (
            next((image.full_screen_image for image in event.images if image.status == 1), None)
            if event.images
            else None
        )

        # Format tags as a comma-separated string
        tags = ", ".join(tag.tag.title for tag in event.tags if tag.tag and tag.tag.title)
        
        #ticket=EventRepo.get_min_ticket_price(event.id)
        
        if not event.time_zone:
            event_time_zone=os.getenv('d_t_z')
        else:
            event_time_zone=event.time_zone
        return {
            "id": event.id,
            "title": event.title,
            "time_zone": event_time_zone,
            "ar_title": event.ar_title,
            "category_id":event.category_id,
            "category_title":event.category.title.rstrip('s') if event.category.title.endswith('s') else event.category.title,
            "category_image":event.category.image,
            "start_time": event.start_time.strftime('%H:%M:%S') if event.start_time else None,
            "end_time": event.end_time.strftime('%H:%M:%S') if event.end_time else None,
            "start_date": event.start_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event.start_date, datetime) else event.start_date,
            "end_date": event.end_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event.end_date, datetime) else event.end_date,
            "price_type": event.price_type,
            "area": event.area,
            "booked_count": booked_count,
            "city": event.city,
            "location_type": event.location_type,
            "location": EventRepo.clean_location(event.location),
            "to_location": EventRepo.clean_location(event.to_location),
            #"ticket_price": float(ticket.price) if ticket and ticket.price is not None else None,
            "price": float(event.price) if event.price is not None else None,
           
            "primary_image": primary_image,
            "tags": tags
        }




    @staticmethod
    @handle_repository_errors
    def get_top_organizers():
        """
        Fetch the top 8 organizers based on the number of events.
        """
        now = datetime.utcnow()
        results = db.session.query(
            Organization.organization_name,
            Organization.user_id,
            func.count(Event.id).label('event_count')
        ).join(Event, Event.user_id == Organization.user_id).join(Users, Organization.user_id == Users.id)\
         .filter(Event.status==1,Users.status==1).filter(func.date(Event.end_date) >= now.date())\
         .group_by(Organization.id).order_by(desc('event_count')).limit(8).all()
        
            
            
        return [
            {
                "title": result.organization_name,
                "id": result.user_id,
                "event_count": result.event_count
            }
            for result in results
        ]

#############  booking ############################

    



    @staticmethod
    @handle_repository_errors
    def add_event_search_history(event_id,session_id):
            new_participant = SearchHistory(
                event_id=event_id,
                user_id=session_id,
                created_on=datetime.utcnow()
            )
            db.session.add(new_participant)
            db.session.commit()


    @staticmethod
    @handle_repository_errors
    def add_participant_and_payment(participant_data, payment_data=None):
        """Adds a new participant, a payment transaction, and pre-enters attendance records."""
        try:
            
           
            
            # Step 1: Insert the participant without QR code initially
            new_participant = Participant(
                event_id=participant_data['event_id'],
                date=participant_data['date'],
                start_time=participant_data['start_time'],
                end_time=participant_data['end_time'],
                ticket_id=participant_data['ticket_id'] or 0,
                date_time_id=participant_data['date_time_id'] or 0,
                quantity=participant_data['quantity'],
                user_id=participant_data['user_id'],
                paid_amount=participant_data.get('paid_amount', 0.0),
                created_by=participant_data.get('created_by', 0)
            )
            db.session.add(new_participant)
            db.session.flush()  # Flush to get the participant_id without committing

            # Step 2: Generate the QR code now that we have participant_id
            
            event = Event.query.get(new_participant.event_id)
            
            if participant_data['date_time_id']:
                event_date_time = EventDateTime.query.get(participant_data['date_time_id'])
                if event_date_time:
                    event_date_time.booked = (event_date_time.booked or 0) + participant_data['quantity']
                    
            if participant_data['ticket_id']:
                event_ticket = EventTicket.query.get(participant_data['ticket_id'])
                if event_ticket:
                    event_ticket.booked = (event_ticket.booked or 0) + participant_data['quantity']
                
               
            qr_data = f"participant_id:{new_participant.id};event_id:{new_participant.event_id};user_id:{new_participant.user_id}"
            qr_data_encoded = base64.b64encode(qr_data.encode('utf-8')).decode('utf-8')
            
            qrcode_data = EventRepo.generate_participant_qrcode(
                qr_data_encoded,
                new_participant.id,
                new_participant.event_id,
                new_participant.user_id,
                0
            )
            
            
            new_participant.qrcode = qr_data_encoded  # Assign generated QR code
        
            qrcode_path =upload_base64_file(qrcode_data,'participant')  # Assign generated QR code
            new_participant.qrcode_path =qrcode_path['url']  # Assign generated QR code
            new_participant.ticket =create_pdf_file(new_participant.id,event,new_participant)  
            
            #print(11)
            #print(new_participant.ticket)
            #print(22)
            
            

            # Step 3: Insert payment transaction if payment_data is provided
            payment_transaction = None
            if payment_data:
                payment_transaction = PaymentTransaction(
                    participant_id=new_participant.id,
                    event_id=new_participant.event_id,
                    user_id=new_participant.user_id,
                    amount=payment_data['amount'],
                    currency=payment_data.get('currency', 'USD'),
                    payment_method=payment_data['payment_method'],
                    request_json=payment_data.get('request_json', '{}'),
                    status=payment_data.get('status', 0),
                    created_on=datetime.utcnow()
                )
                db.session.add(payment_transaction)
                
            event_information = db.session.query(Event).filter(Event.id==participant_data['event_id']).first()
                
                    
            

            # Step 4: Retrieve the event details
            event = Event.query.get(new_participant.event_id)
            if not event:
                raise ValueError("Event not found for the given event_id")

            if event.category_id==3:
                attendance_record = ParticipantsAttendance(
                        participant_id=new_participant.id,
                        event_id=new_participant.event_id,
                        attendance_date=participant_data['date'],
                        status=0  # Default status as not attended
                )
                db.session.add(attendance_record)
            else :
                # Step 5: Pre-enter attendance records based on event dates
                current_date = event.start_date.date()
                end_date = event.end_date.date()
                attendance_records = []

                while current_date <= end_date:
                    attendance_record = ParticipantsAttendance(
                        participant_id=new_participant.id,
                        event_id=new_participant.event_id,
                        attendance_date=current_date,
                        status=0  # Default status as not attended
                    )
                    attendance_records.append(attendance_record)
                    current_date += timedelta(days=1)

                # Add all attendance records to the session
                db.session.bulk_save_objects(attendance_records)

            # Commit all changes to the database, including QR code update and attendance records
            db.session.commit()

            return new_participant, payment_transaction,event_information

        except Exception as e:
            db.session.rollback()
            raise e
          


    # @staticmethod
    # @handle_repository_errors
    # def add_payment(new_participant, payment_data=None):
    #     """Adds a new participant, a payment transaction, and pre-enters attendance records."""
    #     try:
    #         client_secret = None

    #         if payment_data:
    #             # safely convert only if payment_data is present
    #             payload = {
    #                 "amount": float(payment_data.get("amount", 0)),
    #                 "currency": payment_data.get("currency", "usd")
    #             }
    #             response = requests.post(
    #                 create_payment_path,
    #                 json=payload
    #             )
    #             response.raise_for_status()
    #             payment_result = response.json()
    #             client_secret = payment_result["client_secret"]
            

    #         # Step 3: Insert payment transaction if payment_data is provided
    #         if payment_data:
    #             payment_transaction = PaymentTransaction(
    #                 participant_id=new_participant.id,
    #                 event_id=new_participant.event_id,
    #                 user_id=new_participant.user_id,
    #                 all_participant_id=payment_data['all_participant_id'],
    #                 amount=payment_data['amount'],
    #                 currency=payment_data.get('currency', 'USD'),
    #                 payment_method=payment_data['payment_method'],
    #                 request_json=payment_data.get('request_json', '{}'),
    #                 status=payment_data.get('status', 0),
    #                 client_secret=client_secret,
    #                 created_on=datetime.utcnow()
    #             )
    #             db.session.add(payment_transaction)
            

    #             # Commit all changes to the database, including QR code update and attendance records
    #             db.session.commit()

    #             return payment_transaction

    #     except Exception as e:
    #         db.session.rollback()
    #         raise e


    @staticmethod
    @handle_repository_errors
    def add_payment(new_participant, payment_data=None):
        try:
            if payment_data:
                # Safely extract values from payment_data if it exists
                amount = float(payment_data.get("amount"))
                currency = payment_data.get("currency", "gbp")
                
                # Send payment data to the external payment API
                payload = {
                    "amount": amount,
                    "currency": currency
                }
                response = requests.post(
                    create_payment_path,
                    json=payload
                )
                response.raise_for_status()

                # Handle payment result
                payment_result = response.json()
                client_secret = payment_result.get("client_secret")
                payment_intent_id = payment_result.get('payment_intent_id')

                payment_transaction = PaymentTransaction(
                    participant_id=new_participant.id,
                    event_id=new_participant.event_id,
                    user_id=new_participant.user_id,
                    all_participant_id=payment_data.get('all_participant_id'),
                    amount=payment_data.get('amount'),
                    currency=payment_data.get('currency', 'gbp'),
                    payment_method=payment_data.get('payment_method'),
                    request_json=payment_data.get('request_json', '{}'),
                    status=payment_data.get('status', 0),
                    client_secret=client_secret,
                    payment_intent_id=payment_intent_id,
                    payment_data=str(payment_data),
                    response=str(payment_result),
                    created_on=datetime.utcnow()
                )
                db.session.add(payment_transaction)
                db.session.commit()
                return payment_transaction

        except Exception:
            db.session.rollback()
            raise
          

    @staticmethod
    @handle_repository_errors
    def add_participantr(participant_data,parent_id,commit=True):
        """Adds a new participant, a payment transaction, and pre-enters attendance records."""
        try:
           
            
            # Step 1: Insert the participant without QR code initially
            new_participant = Participant(
                parent_id=parent_id,
                event_id=participant_data['event_id'],
                date=participant_data['date'],
                start_time=participant_data['start_time'],
                end_time=participant_data['end_time'],
                ticket_id=participant_data['ticket_id'] or 0,
                date_time_id=participant_data['date_time_id'] or 0,
                quantity=participant_data['quantity'],
                scan_quantity=participant_data['quantity'],
                user_id=participant_data['user_id'],
                paid_amount=participant_data.get('paid_amount', 0.0),
                created_by=participant_data.get('created_by', 0),
                status=participant_data.get('status', 0)
            )
            db.session.add(new_participant)
            db.session.flush()  # Flush to get the participant_id without committing

            # Step 2: Generate the QR code now that we have participant_id
            
            event = Event.query.get(new_participant.event_id)
            event.booked = (event.booked or 0) + participant_data['quantity']
            
            if participant_data['date_time_id']:
                event_date_time = EventDateTime.query.get(participant_data['date_time_id'])
                if event_date_time:
                    event_date_time.booked = (event_date_time.booked or 0) + participant_data['quantity']
                    
            if participant_data['ticket_id']:
                event_ticket = EventTicket.query.get(participant_data['ticket_id'])
                if event_ticket:
                    event_ticket.booked = (event_ticket.booked or 0) + participant_data['quantity']
                
            qr_data = f"participant_id:{new_participant.id};event_id:{new_participant.event_id};user_id:{new_participant.user_id}"
            qr_data_encoded = base64.b64encode(qr_data.encode('utf-8')).decode('utf-8')
            
            qrcode_data = EventRepo.generate_participant_qrcode(
                qr_data_encoded,
                new_participant.id,
                new_participant.event_id,
                new_participant.user_id,
                0
            )
            
            new_participant.qrcode = qr_data_encoded  # Assign generated QR code
        
            qrcode_path =upload_base64_file(qrcode_data,'participant')  # Assign generated QR code
            if isinstance(qrcode_path, dict) and 'url' in qrcode_path:
                new_participant.qrcode_path = qrcode_path['url']  # Assign generated QR code
            else:
                new_participant.qrcode_path =qrcode_path  # Assign generated QR code
            new_participant.ticket =create_pdf_file(new_participant.id,event,new_participant)  
            
            #print(11)
            #print(new_participant.ticket)
            #print(22)
            
            
            if participant_data['category_id']!=3 and participant_data['qrcode_type']:
                new_participant.scan_quantity =1 
                quantity=participant_data['quantity']-1
                if quantity>0 :
                    while quantity > 0:
                    
                        new_participant_qrcode = ParticipantQrcode(
                            participant_id=new_participant.id,
                            event_id=participant_data['event_id'],
                            user_id=participant_data['user_id'],
                            scan_quantity=1,
                            created_by=participant_data.get('created_by', 0)
                        )
                        db.session.add(new_participant_qrcode)
                        db.session.flush()  # Flush to get the participant_id without committing

                        qr_data = f"participant_qrcode_id:{new_participant_qrcode.id};participant_id:{new_participant.id};event_id:{new_participant.event_id};user_id:{new_participant.user_id}"
                        qr_data_encoded = base64.b64encode(qr_data.encode('utf-8')).decode('utf-8')
                        
                        qrcode_data = EventRepo.generate_participant_qrcode(
                            qr_data_encoded,
                            new_participant.id,
                            new_participant.event_id,
                            new_participant.user_id,
                            new_participant_qrcode.id
                        )                
                        
                        new_participant_qrcode.qrcode = qr_data_encoded  # Assign generated QR code            
                        qrcode_path =upload_base64_file(qrcode_data,'participant')  # Assign generated QR code
                        if isinstance(qrcode_path, dict) and 'url' in qrcode_path:
                            new_participant_qrcode.qrcode_path = qrcode_path['url']  # Assign generated QR code
                        else:
                            new_participant_qrcode.qrcode_path =qrcode_path  # Assign generated QR code
                        quantity -= 1
           

                
                
                    
            


            if event.category_id==3:
                attendance_record = ParticipantsAttendance(
                        participant_id=new_participant.id,
                        event_id=new_participant.event_id,
                        attendance_date=participant_data['date'],
                        status=0  # Default status as not attended
                )
                db.session.add(attendance_record)
            else :
                # Step 5: Pre-enter attendance records based on event dates
                current_date = event.start_date.date()
                end_date = event.end_date.date()
                attendance_records = []
                occusr_weekday_list = []
                if event.occusr_weekday:
                    occusr_weekday_list = list(map(int, event.occusr_weekday.split(","))) 
                if event.occusr_type == 1:
                    # Once on start date
                    attendance_records.append(ParticipantsAttendance(
                        participant_id=new_participant.id,
                        event_id=new_participant.event_id,
                        attendance_date=current_date,
                        status=0
                    ))

                elif event.occusr_type == 3:
                    # Weekly on specific weekdays
                    while current_date <= end_date:
                        if current_date.weekday() in occusr_weekday_list:
                            attendance_records.append(ParticipantsAttendance(
                                participant_id=new_participant.id,
                                event_id=new_participant.event_id,
                                attendance_date=current_date,
                                status=0
                            ))
                        current_date += timedelta(days=1)

                elif event.occusr_type == 4:
                    if event.occusr_month == 1:
                        # Every month on the same date
                        while current_date <= end_date:
                            attendance_records.append(ParticipantsAttendance(
                                participant_id=new_participant.id,
                                event_id=new_participant.event_id,
                                attendance_date=current_date,
                                status=0
                            ))
                            # Move to the same date in the next month
                            month = current_date.month + 1 if current_date.month < 12 else 1
                            year = current_date.year + 1 if month == 1 else current_date.year
                            try:
                                current_date = current_date.replace(month=month, year=year)
                            except ValueError:
                                # Handle February 29th issue in leap years
                                current_date = current_date.replace(day=28, month=month, year=year)

                    elif event.occusr_month == 2:
                        # Every nth weekday of the month
                        start_weekday = event.start_date.date().weekday()
                        start_day = event.start_date.day
                        first_day = event.start_date.replace(day=1)
                        weekday_count = 0
                        nth_occurrence = 0
                        
                        for day in range(1, start_day + 1):  # Count occurrences up to start date
                            if first_day.replace(day=day).weekday() == start_weekday:
                                weekday_count += 1
                                if day == start_day:
                                    nth_occurrence = weekday_count
                                    break  # Stop after finding the nth occurrence
            
                        while current_date <= end_date:
                            first_day = current_date.replace(day=1)
                            weekday_count = 0  # Reset counter for the month
                            nth_weekday_date = None

                            for day in range(1, 32):  # Loop through all possible days in the month
                                try:
                                    temp_date = first_day.replace(day=day)
                                    if temp_date.weekday() == start_weekday:
                                        weekday_count += 1
                                        if weekday_count == nth_occurrence:  # Match nth occurrence
                                            nth_weekday_date = temp_date
                                            break  # Exit the inner loop only
                                except ValueError:
                                    continue  # Skip invalid dates (e.g., Feb 30)

                            if nth_weekday_date and nth_weekday_date <= end_date:
                                attendance_records.append(ParticipantsAttendance(
                                    participant_id=new_participant.id,
                                    event_id=new_participant.event_id,
                                    attendance_date=nth_weekday_date,
                                    status=0
                                ))

                            # Move to the next month
                            month = current_date.month + 1 if current_date.month < 12 else 1
                            year = current_date.year + 1 if month == 1 else current_date.year
                            current_date = current_date.replace(day=1, month=month, year=year)

                #elif event.occusr_type == 2:
                else:
                    # Daily from start_date to end_date
                    while current_date <= end_date:
                        attendance_records.append(ParticipantsAttendance(
                            participant_id=new_participant.id,
                            event_id=new_participant.event_id,
                            attendance_date=current_date,
                            status=0
                        ))
                        current_date += timedelta(days=1)


                # Add all attendance records to the session
                db.session.bulk_save_objects(attendance_records)

            # Commit all changes to the database, including QR code update and
            # attendance records. Booking orchestration can defer this commit
            # so one locked event row covers every ticket in a request.
            if commit:
                db.session.commit()

            return new_participant

        except Exception as e:
            db.session.rollback()
            raise e
            
    @staticmethod    
    @handle_repository_errors
    def add_participant_notification(participant, event,user_id):
        """Persist one booking confirmation for both actors and optionally push it."""
        organizer_id = event.user_id
        user_push_tokens = user.get_push_token(user_id, 5)
        booked_user = user.get_userby_id(user_id)
        customer_name = " ".join(filter(None, [
            getattr(booked_user, "first_name", ""),
            getattr(booked_user, "last_name", ""),
        ])).strip() or "User"
        customer_title, customer_message = load_push_notification_template(
            "customer_booking_placed",
            CUSTOMER_NAME=customer_name,
        )
        customer_task_id = (
            f"booking-confirmation:event:{event.id}:"
            f"participant:{participant.id}:user:{user_id}"
        )
        customer_notification = Notification_History.query.filter_by(
            task_id=customer_task_id,
        ).first()
        if not customer_notification:
            customer_notification = Notification_History(
                participant_id=participant.id,
                event_id=event.id,
                push=True,
                sms=False,
                email=False,
                type=5,
                title=customer_title,
                message=customer_message,
                send_to=5,
                task_id=customer_task_id,
                user_id=user_id,
            )
            db.session.add(customer_notification)
            db.session.commit()
            if user_push_tokens:
                threading.Thread(
                    target=async_push_notification_user,
                    args=({
                        "registration_token": user_push_tokens,
                        "title": customer_title,
                        "body": customer_message,
                        "odid": event.id,
                        "type": 5,
                    },),
                ).start()

        organizer_push_tokens = user.get_push_token(organizer_id, 5)
        organizer_title, organizer_message = load_push_notification_template(
            "organizer_new_order_received",
            CUSTOMER_NAME=customer_name,
        )
        organizer_task_id = (
            f"booking-received:event:{event.id}:"
            f"participant:{participant.id}:user:{organizer_id}"
        )
        organizer_notification = Notification_History.query.filter_by(
            task_id=organizer_task_id,
        ).first()
        if not organizer_notification:
            db.session.add(Notification_History(
                participant_id=participant.id,
                event_id=event.id,
                push=True,
                sms=False,
                email=False,
                type=5,
                title=organizer_title,
                message=organizer_message,
                send_to=5,
                task_id=organizer_task_id,
                user_id=organizer_id,
            ))
            db.session.commit()
            if organizer_push_tokens:
                threading.Thread(
                    target=async_push_notification_org,
                    args=({
                        "registration_token": organizer_push_tokens,
                        "title": organizer_title,
                        "body": organizer_message,
                        "odid": event.id,
                        "type": 5,
                    },),
                ).start()

        return customer_notification
        
            
    @staticmethod    
    def generate_participant_qrcode(qr_data_encoded,participant_id, event_id, user_id,participant_qrcode_id):
        #qr_data = f"participant_id:{participant_id};event_id:{event_id};user_id:{user_id}"
        #qr_data_encoded = base64.b64encode(qr_data.encode('utf-8')).decode('utf-8')
        qr_img = qrcode.make(qr_data_encoded)

        # Convert the QR image to base64 string
        buffered = BytesIO()
        qr_img.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode()

        return qr_base64
        
        
    @staticmethod
    def booking_list(user_id, request_data):
        """Fetch events based on filter type and date range for a specific user (session user as participant)."""
        if not EventRepo._using_mysql():
            return EventRepo._booking_list_sqlite(user_id, request_data)

       
        # Extract filter_type and optional date range from request_data
        filter_type = request_data.get('type')
        status = request_data.get('status')
        from_date = request_data.get('from_date')
        to_date = request_data.get('to_date')

        
        Timezone = request.headers.get('Timezone',os.getenv('d_t_z'))
        now = datetime.now(ZoneInfo(Timezone))
        start_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
        )

        end_dt_converted = func.DATE(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
        )

        start_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.start_date, Event.start_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
        )

        end_tm_converted = func.TIME(
                    func.CONVERT_TZ(
                        func.TIMESTAMP(Event.end_date, Event.end_time),
                        case(((Event.time_zone == None) | (Event.time_zone == ''), literal(os.getenv('d_t_z'))),else_=Event.time_zone),
                        Timezone
                    )
        )


        query = db.session.query(
            Participant.id.label('participant_id'),
            Participant.ticket.label('ticket'),
            Participant.status.label('status'),
            Participant.date.label('ticket_date'),
            Participant.start_time.label('ticket_start_time'),
            Participant.end_time.label('ticket_end_time'),
            Category.title.label('category_title'),
            Category.image.label('category_image'),
            literal(0.0).label('distance'),
            Event.ar_title,
            Event.category_id,
            Event.area,
            Event.city,
            Event.end_date,
            Event.id,
            Event.location, 
            Event.location_type,
            Event.occusr_type,
            Event.occusr_weekday,
            Event.occusr_month,
            Event.price,
            Event.time_zone,
            Event.price_type,
            Event.start_date,
            Event.start_time,
            Event.end_time,
            #Event.images,
            #Event.tags,            
            Event.title
        ).join(Event, Event.id == Participant.event_id).join(Category, Category.id == Event.category_id)\
         .filter(Event.status != 3,Participant.user_id==user_id,Participant.parent_id==0,Participant.status>0)
         
        # Apply filter type conditions
        if status:
            query = query.filter(Participant.status == 1)
            
        if filter_type == 1:
            # Upcoming events in the next week
            next_week = now + timedelta(days=7)
            query = query.filter(func.date(Event.start_date) > now.date(),Participant.status == 1)

        elif filter_type == 2:
            # All active orders sorted from today’s date to older dates
            query = query.filter(end_dt_converted >= now.date(),start_dt_converted <= now.date(),Participant.status == 1)

        elif filter_type == 3:
            # Completed events where the date has passed
            query = query.filter(or_(end_dt_converted < now.date(),Participant.status != 1))

        # Apply date range filters if provided and filter_type is empty
        elif from_date and to_date:
            from_date_obj = datetime.strptime(from_date, '%Y-%m-%d')
            to_date_obj = datetime.strptime(to_date, '%Y-%m-%d')
            query = query.filter(or_(
                    and_(func.date(Event.start_date) >= from_date_obj, func.date(Event.start_date) <= to_date_obj),
                    and_(func.date(Event.end_date) >= from_date_obj, func.date(Event.end_date) <= to_date_obj),
                    and_(from_date_obj >= func.date(Event.start_date), from_date_obj <= func.date(Event.end_date)),
                    and_(to_date_obj >= func.date(Event.start_date), to_date_obj <= func.date(Event.end_date))
            ))
            
        elif from_date:
            from_date_obj = datetime.strptime(from_date, '%Y-%m-%d')
            query = query.filter(Event.start_date >= from_date_obj)

        elif to_date:
            to_date_obj = datetime.strptime(to_date, '%Y-%m-%d')
            query = query.filter(Event.end_date <= to_date_obj)

        query=query.group_by(Participant.id)
        if filter_type == 1:
            query=query.order_by(start_dt_converted.asc(),start_tm_converted.asc())
        elif filter_type == 2:
            query=query.order_by(start_dt_converted.asc(),start_tm_converted.asc())
        elif filter_type == 3:
            query=query.order_by(start_dt_converted.desc(),start_tm_converted.desc())
        else:
            query=query.order_by(desc('participant_id'))
        events=query.all()
        return [EventRepo.appserialize_event_booking(event) for event in events]
         
         
         

        # # Base query filtered by participant user_id to get events where the user is a participant
        # query = Event.query.join(Participant).filter(Participant.user_id == user_id, Event.status == 1)

        # # Apply filter type conditions
        # if filter_type == 1:
            # # Upcoming events in the next week
            # next_week = now + timedelta(days=7)
            # query = query.filter(func.date(Event.start_date) > now.date())

        # elif filter_type == 2:
            # # All active orders sorted from today’s date to older dates
            # query = query.filter(func.date(Event.end_date) >= now.date(),func.date(Event.start_date) <= now.date()).order_by(Event.start_date.asc())

        # elif filter_type == 3:
            # # Completed events where the date has passed
            # query = query.filter(func.date(Event.end_date) < now.date())

        # # Apply date range filters if provided and filter_type is empty
        # elif from_date and to_date:
            # from_date_obj = datetime.strptime(from_date, '%Y-%m-%d')
            # to_date_obj = datetime.strptime(to_date, '%Y-%m-%d')
            # query = query.filter(and_(Event.start_date <= to_date_obj,Event.end_date >= from_date_obj))
            
        # elif from_date:
            # from_date_obj = datetime.strptime(from_date, '%Y-%m-%d')
            # query = query.filter(Event.start_date >= from_date_obj)

        # elif to_date:
            # to_date_obj = datetime.strptime(to_date, '%Y-%m-%d')
            # query = query.filter(Event.end_date <= to_date_obj)

        # # Execute query and return results as a list of dictionaries
        # events = query.all()
        #return [EventRepo.appserialize_event(event) for event in events]

 
        
    @staticmethod
    def ticket_qrcodes(session_id, request_data):
        """Fetch events based on filter type and date range for a specific user (session user as participant)."""
      
        participant_id = request_data.get('participant_id')
        
        query = db.session.query(
            ParticipantQrcode.id.label('participant_code_id'),
            ParticipantQrcode.qrcode,
            ParticipantQrcode.qrcode_path,
            ParticipantQrcode.participant_id,
            Participant.paid_amount
        ).join(Participant, Participant.id == ParticipantQrcode.participant_id)\
         .filter(ParticipantQrcode.participant_id==participant_id,Participant.user_id==session_id)
         
        query=query.group_by(ParticipantQrcode.id)
        query=query.order_by(desc('participant_code_id'))
        participants=query.all()
        ps = [
            { 
                "participant_id": participant.participant_id,
                "participant_code_id": participant.participant_code_id,
                "ticket_no": str(participant.participant_id)+""+str(participant.participant_code_id),
                "qrcode": participant.qrcode,
                "qrcode_path": participant.qrcode_path,
                "paid_amount": participant.paid_amount
            }
            for participant in participants
        ]
        
        participant = EventRepo.get_participant_data_byid(participant_id, session_id)
        participantt={
                "participant_id": participant.id,
                "participant_code_id": 0,
                "ticket_no": str(participant.id)+"0",
                "qrcode": participant.qrcode,
                "qrcode_path": participant.qrcode_path,
                "paid_amount": participant.paid_amount
        }
        ps.append(participantt)
        return ps
         
         

################  get event list #######################

    @staticmethod
    def completed_session_dates(event_id, now=None):
        """Return only scheduled attendance dates whose session has ended."""
        event = db.session.get(Event, event_id)
        if event is None:
            return []

        timezone_name = event.time_zone or os.getenv('d_t_z') or 'Europe/London'
        timezone = ZoneInfo(timezone_name)
        current = now or datetime.now(timezone)
        if current.tzinfo is None:
            current = current.replace(tzinfo=timezone)
        else:
            current = current.astimezone(timezone)

        scheduled_dates = [
            row[0]
            for row in db.session.query(ParticipantsAttendance.attendance_date)
            .filter(
                ParticipantsAttendance.event_id == event_id,
                ParticipantsAttendance.attendance_date.isnot(None),
            )
            .distinct()
            .order_by(ParticipantsAttendance.attendance_date.asc())
            .all()
        ]

        start_time = event.start_time
        if not start_time and isinstance(event.start_date, datetime):
            start_time = event.start_date.time()
        end_time = event.end_time
        if not end_time and isinstance(event.end_date, datetime):
            end_time = event.end_date.time()

        completed = []
        for session_date in scheduled_dates:
            if end_time:
                session_end = datetime.combine(session_date, end_time).replace(tzinfo=timezone)
                if start_time and end_time <= start_time:
                    session_end += timedelta(days=1)
            elif start_time:
                session_start = datetime.combine(session_date, start_time).replace(tzinfo=timezone)
                try:
                    duration_hours = max(0.0, float(event.duration or 0))
                except (TypeError, ValueError):
                    duration_hours = 0.0
                session_end = session_start + timedelta(hours=duration_hours)
            else:
                session_end = datetime.combine(session_date + timedelta(days=1), time.min).replace(tzinfo=timezone)
            if session_end <= current:
                completed.append(session_date)
        return completed

    @staticmethod
    def participant_attendance_progress(participant_id, event_id, now=None):
        completed_dates = EventRepo.completed_session_dates(event_id, now=now)
        if not completed_dates:
            return {
                'completed_session_count': 0,
                'attended_session_count': 0,
                'attendance_percentage': 0,
            }

        attended_days = db.session.query(
            func.count(ParticipantsAttendance.attendance_date.distinct())
        ).filter(
            ParticipantsAttendance.participant_id == participant_id,
            ParticipantsAttendance.event_id == event_id,
            ParticipantsAttendance.attendance_date.in_(completed_dates),
            ParticipantsAttendance.status == 1,
        ).scalar() or 0
        completed_count = len(completed_dates)
        return {
            'completed_session_count': completed_count,
            'attended_session_count': attended_days,
            'attendance_percentage': (attended_days * 100) // completed_count,
        }



    @staticmethod
    @handle_repository_errors
    def get_event_participants(request_data=None):


        """
        Fetches participants with optional filters for event ID and date range.

        Args:
            request_data (dict): Dictionary containing optional filters:
                event_id (int): ID of the event to filter participants.
                start_date (str): Start date (YYYY-MM-DD) for filtering participants.
                end_date (str): End date (YYYY-MM-DD) for filtering participants.

        Returns:
            list: List of dictionaries containing participant details.
        """
        event_id = request_data.get('event_id')
        start_date = request_data.get('start_date')
        end_date = request_data.get('end_date')
        user_id = request_data.get('user_id')
        user_id2 = request_data.get('user_id2')
        organiser_id = request_data.get('organiser_id')
        buddy_alias = aliased(Users)
        
        EventAlias = aliased(Event)
        ParticipantAlias = aliased(Participant)
        
        # Base query with joins
        query = db.session.query(
            Participant.id.label('participant_id'),
            Participant.user_id.label('user_id'),
            Participant.status.label('status'),
            Participant.event_id.label('event_id'),
            Event.title.label('event_name'),
            Event.time_zone.label('time_zone'),
            Organization.organization_name.label('organizer_name'),
            Users.first_name.label('first_name'),
            Users.last_name.label('last_name'),
            Users.email_id.label('email_id'),
            Users.country_code.label('country_code'),
            Users.mobile_number.label('mobile_number'),
            Users.profile_image.label('profile_image'),
            db.session.query(func.count(ParticipantAlias.id)).join(EventAlias, ParticipantAlias.event_id == EventAlias.id)
            .filter(
                ParticipantAlias.user_id == Participant.user_id,
                ParticipantAlias.status > 0,
                EventAlias.user_id == Event.user_id,
            )
            .correlate(Participant, Event).scalar_subquery().label('user_org_booking_count'),
            case((Participant.user_id == user_id2, 1),else_=0).label('is_mine'),
            Participant.created_on.label('created_on'),
            JourneyLevel.title.label('journey_level_title'),
            Request_buddy.id.label('request_buddy_id'),
            Request_buddy.buddy_id.label('buddy_id'),
            PaymentTransaction.id.label('transaction_id'),
            buddy_alias.first_name.label('buddy_first_name'),
            buddy_alias.last_name.label('buddy_last_name')
        ).join(Event, Participant.event_id == Event.id) \
         .join(Organization, Event.user_id == Organization.user_id, isouter=True) \
         .join(Users, Participant.user_id == Users.id) \
         .join(JourneyLevel, Users.journey_level_id == JourneyLevel.id) \
         .outerjoin(PaymentTransaction, PaymentTransaction.participant_id == Participant.id) \
         .outerjoin(Request_buddy, and_(Request_buddy.user_id == Participant.user_id,Request_buddy.event_id == Participant.event_id,Request_buddy.type == 1))\
         .outerjoin(buddy_alias, Request_buddy.buddy_id == buddy_alias.id)
        query = query.filter(Participant.status>0)
        # Apply filters 
        
        search_key = request_data.get('search_key')
        # Adding additional filters based on the 'data' dictionary
        if search_key:
            search_key = f"%{request_data['search_key']}%"
            query = query.filter(
                or_(
                    Event.title.ilike(search_key),
                    Organization.organization_name.ilike(search_key),
                    Users.first_name.ilike(search_key),
                    Users.last_name.ilike(search_key),
                    func.concat(Users.first_name, ' ', Users.last_name).ilike(search_key)
                )
            )
        if event_id:
            query = query.filter(Participant.event_id == event_id)
        if user_id:
            query = query.filter(Participant.user_id == user_id)
        if organiser_id:
            query = query.filter(Event.user_id == organiser_id)
        if start_date and end_date:
            query = query.filter(
                Participant.created_on.between(start_date, end_date)
            )
        role_type = request_data.get('role_type')
        dialect = db.session.get_bind().dialect.name
        if role_type in (2, 3, 4, 5):
            if dialect == 'postgresql':
                query = query.distinct(Participant.user_id, Participant.status)
                query = query.order_by(Participant.user_id, Participant.status)
            else:
                query = query.group_by(Participant.user_id,Participant.status)
        else:
            if dialect == 'postgresql':
                query = query.distinct(Participant.id)
                query = query.order_by(Participant.id)
            else:
                query = query.group_by(Participant.id)
        # Add ordering by created_on in descending order
        query = query.order_by(desc(Participant.created_on))

        # Execute query and format the results
        participants = query.all()
        

        # Format the response
        result = []

        for participant in participants:
            attendance_progress = EventRepo.participant_attendance_progress(
                participant.participant_id,
                participant.event_id,
            )
            no_of_days = attendance_progress['completed_session_count']
            attended_days = attendance_progress['attended_session_count']
            attendance_percentage = attendance_progress['attendance_percentage']

            if not participant.time_zone:
                data_time_zone=os.getenv('d_t_z')
            else:
                data_time_zone=participant.time_zone
            result.append({
                "participant_id": participant.participant_id,
                "event_name": participant.event_name,
                "time_zone": data_time_zone,
                "organizer_name": participant.organizer_name,
                "first_name": participant.first_name,
                "last_name": participant.last_name,
                "user_id": participant.user_id,
                "is_mine": participant.is_mine,
                "status": participant.status,
                "event_id": participant.event_id,
                "email_id": participant.email_id,
                "country_code": participant.country_code,
                "mobile_number": participant.mobile_number,
                "profile_image": participant.profile_image,
                "user_org_booking_count": participant.user_org_booking_count,
                "new_user": 1 if participant.user_org_booking_count<2 else 0,
                "request_buddy_id": participant.request_buddy_id,
                "buddy_id": participant.buddy_id,
                "buddy_last_name": participant.buddy_last_name,
                "buddy_first_name": participant.buddy_first_name,
                "journey_level_title": participant.journey_level_title,
                "transaction_id": participant.transaction_id,
                "created_on": participant.created_on.strftime("%Y-%m-%d %H:%M:%S") if participant.created_on else None,
                "no_of_days_count": no_of_days,
                "attendance_count": attended_days,
                "attendance_percentage": attendance_percentage
            })

        return result


    
    
    
    

    @staticmethod
    @handle_repository_errors
    def participant_attendance(request_data=None):
        event_id = request_data.get('event_id', None)
        start_date = request_data.get('start_date', None)
        end_date = request_data.get('end_date', None)

        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

        attendance_filter = []
        if start_date and end_date:
            attendance_filter.append(ParticipantsAttendance.attendance_date.between(start_date, end_date))
        elif start_date:
            attendance_filter.append(ParticipantsAttendance.attendance_date >= start_date)
        elif end_date:
            attendance_filter.append(ParticipantsAttendance.attendance_date <= end_date)

        # Aggregate participant and attendance counts including status = 0 participants
        #func.sum(case((ParticipantsAttendance.status == 1, 1), else_=0)).label('attendance_count')
        count_result = (
            db.session.query(
                func.count(distinct(Participant.user_id)).label('participant_count'), 
                func.count(ParticipantsAttendance.id).label('attendance_count')
            )
            .join(ParticipantsAttendance, and_(
                Participant.id == ParticipantsAttendance.participant_id,
                *attendance_filter  # Use attendance filters here
            ), isouter=False)  # Use OUTER join to include all participants, even without attendance
            .filter(Participant.event_id == event_id)
            .filter(ParticipantsAttendance.status == 1)
            .first()
        )

        # Fetch participant list with attendance details, including status = 0
        participant_list_result = (
            db.session.query(
                ParticipantsAttendance.updated_on,
                ParticipantsAttendance.attendance_date,
                ParticipantsAttendance.status,
                Participant.id,
                Participant.created_on,
                Users.first_name,
                Users.last_name,
                Users.email_id,
                Users.country_code,
                Users.mobile_number,
                Users.profile_image
            )
            .join(Users, Users.id == Participant.user_id)
            .join(ParticipantsAttendance, and_(
                Participant.id == ParticipantsAttendance.participant_id,
                *attendance_filter
            ), isouter=False)  # Use OUTER join to include all participants
            .filter(Participant.event_id == event_id)
            .filter(ParticipantsAttendance.status == 1)
            .order_by(ParticipantsAttendance.attendance_date, Participant.created_on)
            .all()
        )

        # Group participants by attendance date
        grouped_participants = {}
        for row in participant_list_result:
            attendance_date = row.attendance_date.strftime('%Y-%m-%d') if row.attendance_date else None
            participant_data = {
                "id": row.id,
                "status": row.status,
                "first_name": row.first_name,
                "last_name": row.last_name,
                "email_id": row.email_id,
                "country_code": row.country_code,
                "mobile_number": row.mobile_number,
                "created_on": row.created_on.strftime('%a, %d %b %Y %H:%M:%S GMT'),
                "attendance_date": row.updated_on,
                "profile_image": row.profile_image
            }
            if attendance_date not in grouped_participants:
                grouped_participants[attendance_date] = []
            grouped_participants[attendance_date].append(participant_data)

        grouped_participant_list = [
            {
                "date": attendance_date,
                "data": participants
            }
            for attendance_date, participants in grouped_participants.items()
        ]

        # Prepare final result
        result = {
            "event_id": event_id,
            "participant_count": count_result.participant_count if count_result else 0,
            "attendance_count": count_result.attendance_count if count_result else 0,
            "participant_list": grouped_participant_list
        }

        return result

     


     
 
    @staticmethod
    @handle_repository_errors
    def get_participant_attendance_list(participant_id):
        """
        Fetches attendance records for a given participant_id.
        """
        attendance_records = ParticipantsAttendance.query.filter_by(participant_id=participant_id).all()
        cdate=datetime.utcnow().date()
        result=[]
        
        for record in attendance_records:
            if not record.status:
                if record.attendance_date<cdate:
                    record.status=2
            resultt={
                    "id": record.id,
                    "participant_id": record.participant_id,
                    "event_id": record.event_id,
                    "attendance_date": (record.updated_on.strftime("%Y-%m-%d %H:%M:%S") if isinstance(record.updated_on, (datetime,date)) else record.updated_on) if record.status==1 else (record.attendance_date.strftime("%Y-%m-%d %H:%M:%S") if isinstance(record.attendance_date, (datetime,date)) else record.attendance_date),
                 
                    "status":record.status,
                    "created_on": record.created_on.strftime("%Y-%m-%d %H:%M:%S") if isinstance(record.created_on, datetime) else record.created_on,
                    "updated_on": record.updated_on.strftime("%Y-%m-%d %H:%M:%S") if isinstance(record.updated_on, datetime) else record.updated_on,
            }
            result.append(resultt)
            
        
        return result
        
        
        
        
    @staticmethod
    @handle_repository_errors
    def update_attendance(qrcode, session_id, expected_event_id=None):
        participant = db.session.query(Participant).filter_by(qrcode=qrcode).first()
        participant_qrcode = db.session.query(ParticipantQrcode).filter_by(qrcode=qrcode).first()
        if not participant and not participant_qrcode:
            return {"error2": "is_error"}
            
           
        #now = datetime.utcnow()
        
            
        if participant:
            #print(555222)
            #print(participant)
            user_id = participant.user_id 
            event_id = participant.event_id
            participant_id = participant.id
            event = db.session.query(Event).filter_by(id=participant.event_id).first()
            if not event:
                return {"error5": "is_error"}

            if expected_event_id is not None and str(event.id) != str(expected_event_id):
                return {"error7": "is_error"}

            now = datetime.now(ZoneInfo(event.time_zone or os.getenv('d_t_z')))
            eventspkr = db.session.query(EventSpeakers).filter(EventSpeakers.event_id == participant.event_id).filter(EventSpeakers.user_id == session_id).first()
            eventbddy = db.session.query(Request_buddy).filter(Request_buddy.event_id == participant.event_id).filter(Request_buddy.buddy_id == session_id).first()
                
            if str(event.user_id) != str(session_id) and not eventspkr and not eventbddy:
                return {"error4": "is_error"}
                       
            if participant.status in (2, 3, 4):
                return {"error6": "is_error"}    
                   
            attendance = db.session.query(ParticipantsAttendance).filter_by(
                participant_id=participant_id,
                attendance_date=now.date(),
                event_id=event_id
            ).first()

            #app.logger.error({'status':attendance.status})

            if not attendance:
                return {"error3": "is_error"}
            if attendance and attendance.status == 1:
                return {"error": "is_error"}
            
            elif attendance:
                attendance.status = 1  # Mark as present
                attendance.updated_on = now
                db.session.commit()
                  
                
                # Fetch push tokens for  customer 
                user_push_tokens = user.get_push_token(user_id, 7)
                get_user = user.get_userby_id(user_id)
                if get_user:
                            customer_name = f"{get_user.first_name} {get_user.last_name}"
                else:
                            customer_name=""

                customer_template = "attendance_booking_to_customer"
                customer_title, customer_message = load_push_notification_template(
                            customer_template, CUSTOMER_NAME=customer_name,EVENT_NAME=event.title
                )
                task_id=0
                        
                if user_push_tokens is not None:

                        customer_notification_data = {
                            "registration_token": user_push_tokens,
                            "title": customer_title,
                            "body": customer_message,
                            "odid": event_id,
                            "type": 7
                        }
                        threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
                        #task = push_notification_user.delay(customer_notification_data)
                        #task_id = task.id
                        task_id = ''

                user.create_notification_history(
                            participant_id=0,
                            event_id=event_id,
                            push=True,
                            sms=False,
                            email=False,
                            type=7,
                            title=customer_title,
                            message=customer_message,
                            send_to=7,
                            task_id=task_id,
                            user_id=user_id

                )

            return participant

        elif participant_qrcode:
            #print(555222)
            #print(participant_qrcode)
            participants_qrcode_id = participant_qrcode.id
            participant_id = participant_qrcode.participant_id
            event_id = participant_qrcode.event_id
            user_id = participant_qrcode.user_id
            participant = db.session.query(Participant).filter_by(id=participant_id, event_id=event_id).first()
            event = db.session.query(Event).filter_by(id=participant_qrcode.event_id).first()
            if not event:
                return {"error5": "is_error"}

            if expected_event_id is not None and str(event.id) != str(expected_event_id):
                return {"error7": "is_error"}

            now = datetime.now(ZoneInfo(event.time_zone or os.getenv('d_t_z')))
            eventspkr = db.session.query(EventSpeakers).filter(EventSpeakers.event_id == event_id).filter(EventSpeakers.user_id == session_id).first()
            eventbddy = db.session.query(Request_buddy).filter(Request_buddy.event_id == event_id).filter(Request_buddy.buddy_id == session_id).first()
            if str(event.user_id) != str(session_id) and not eventspkr and not eventbddy:
                return {"error4": "is_error"}
            if not participant:
                return {"error2": "is_error"}
            if participant.status in (2, 3, 4):
                return {"error6": "is_error"}
            
        
        
            attendance = db.session.query(ParticipantsAttendance).filter_by(
                participant_id=participant_id,
                attendance_date=now.date(),
                event_id=event_id
            ).first()
            attendance_qrcode = db.session.query(ParticipantsQrcodeAttendance).filter_by(
                participants_qrcode_id=participants_qrcode_id,
                attendance_date=now.date(),
                participant_id=participant_id
            ).first()


            if not attendance:
                return {"error3": "is_error"}
            if attendance and attendance_qrcode:
                return {"error": "is_error"}
            
            elif attendance:
                
                attendance_qrcode_data = ParticipantsQrcodeAttendance(                    
                    participants_qrcode_id=participants_qrcode_id,
                    participant_id=participant_id,
                    attendance_date=now.date(),
                    status=1,
                    created_on = now,
                    updated_on = now
                )            
                db.session.add(attendance_qrcode_data)               
            
                db.session.commit()
                
                
                # Fetch push tokens for  customer 
                user_push_tokens = user.get_push_token(user_id, 7)
                get_user = user.get_userby_id(user_id)
                if get_user:
                            customer_name = f"{get_user.first_name} {get_user.last_name}"
                else:
                            customer_name=""

                customer_template = "attendance_booking_to_customer"
                customer_title, customer_message = load_push_notification_template(
                            customer_template, CUSTOMER_NAME=customer_name,EVENT_NAME=event.title
                )
                task_id=0
                        
                if user_push_tokens is not None:

                        customer_notification_data = {
                            "registration_token": user_push_tokens,
                            "title": customer_title,
                            "body": customer_message,
                            "odid": event_id,
                            "type": 7
                        }
                        threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
                        #task = push_notification_user.delay(customer_notification_data)
                        #task_id = task.id
                        task_id = ''

                user.create_notification_history(
                            participant_id=0,
                            event_id=event_id,
                            push=True,
                            sms=False,
                            email=False,
                            type=7,
                            title=customer_title,
                            message=customer_message,
                            send_to=7,
                            task_id=task_id,
                            user_id=user_id

                )

            return participant_qrcode
    
      
        
        
    @staticmethod
    @handle_repository_errors
    def cancle_booking(request_data,session_id): 
        participant_id = request_data.get('ticket_id')
        participant = db.session.query(Participant).filter_by(id=participant_id).filter_by(user_id=session_id).first()
        if not participant:
            return {"error2": "is_error"}
        if participant.status==2:
            return {"error4": "is_error"}
        event_id = participant.event_id
        user_id = participant.user_id
        event = db.session.query(Event).filter_by(id=event_id).first()
        error3=0
        participant_id = participant.id
        #now = datetime.utcnow()
        now = datetime.now(ZoneInfo(event.time_zone or os.getenv('d_t_z')))
        
        if participant.date:
            if now.date()>participant.date or (now.date()==participant.date and now.time()>participant.start_time):
                        if not request_data.get('confirm'):
                            return {"error3": "is_error"}
                        else:
                            error3=1
        elif event.start_date:
            if now.date()>event.start_date.date() or (now.date()==event.start_date.date() and now.time()>event.start_time):
                        if not request_data.get('confirm'):
                            return {"error3": "is_error"}
                        else:
                            error3=1
        
            
        participant.status = 2  # cancle status
        participant.updated_on = now
        
            
        event.booked = (event.booked or 0) - participant.quantity
            
        if participant.date_time_id>0:
                event_date_time = EventDateTime.query.get(participant.date_time_id)
                if event_date_time:
                    event_date_time.booked = (event_date_time.booked or 0) - participant.quantity
                    
        if participant.ticket_id>0:
                event_ticket = EventTicket.query.get(participant.ticket_id)
                if event_ticket:
                    event_ticket.booked = (event_ticket.booked or 0) - participant.quantity
        
        if participant.paid_amount>0 and error3==1:
            pt = EventRepo._payment_transactions_for_participant(participant.id)
            if pt:
                for txn in pt:
                    txn.status = 3

        db.session.commit()
        
        
        # Fetch push tokens for  customer 
        user_push_tokens = user.get_push_token(user_id, 6)

         
        get_user = user.get_userby_id(user_id)
        if get_user:
                    customer_name = f"{get_user.first_name} {get_user.last_name}"
        else:
                    customer_name=""

        customer_template = "cancle_booking_to_customer"
        customer_title, customer_message = load_push_notification_template(
                    customer_template, CUSTOMER_NAME=customer_name
        )
        task_id=0
                
        if user_push_tokens is not None:

                customer_notification_data = {
                    "registration_token": user_push_tokens,
                    "title": customer_title,
                    "body": customer_message,
                    "odid": event_id,
                    "type": 6
                }
                threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
                #task = push_notification_user.delay(customer_notification_data)
                #task_id = task.id
                task_id = ''

        user.create_notification_history(
                    participant_id=participant_id,
                    event_id=event_id,
                    push=True,
                    sms=False,
                    email=False,
                    type=6,
                    title=customer_title,
                    message=customer_message,
                    send_to=6,
                    task_id=task_id,
                    user_id=user_id

        )


        return participant
    
    
    
      
        
        
    @staticmethod
    @handle_repository_errors
    def cancle_event_booking(request_data,session_id): 
        event_id = request_data.get('event_id')
        user_id=session_id
        event = db.session.query(Event).filter_by(id=event_id).first()
        buddy_id=event.user_id
        participants = db.session.query(Participant).filter_by(event_id=event_id).filter_by(user_id=session_id).filter_by(status=1).all()
        if participants:
            for participant in participants:
                error3=0
                if not participant:
                    return {"error2": "is_error"}
               
                participant_id = participant.id
                
                #now = datetime.utcnow()
                now = datetime.now(ZoneInfo(event.time_zone or os.getenv('d_t_z')))
                
                if participant.date:
                    if now.date()>participant.date or (now.date()==participant.date and now.time()>participant.start_time):
                        if not request_data.get('confirm'):
                            return {"error3": "is_error"}
                        else:
                            error3=1
                elif event.start_date:
                    if now.date()>event.start_date.date() or (now.date()==event.start_date.date() and now.time()>event.start_time):
                        if not request_data.get('confirm'):
                            return {"error3": "is_error"}
                        else:
                            error3=1
                
                    
                participant.status = 2  # cancle status
                participant.updated_on = now
                
                    
                event.booked = (event.booked or 0) - participant.quantity
                    
                if participant.date_time_id>0:
                        event_date_time = EventDateTime.query.get(participant.date_time_id)
                        if event_date_time:
                            event_date_time.booked = (event_date_time.booked or 0) - participant.quantity
                            
                if participant.ticket_id>0:
                        event_ticket = EventTicket.query.get(participant.ticket_id)
                        if event_ticket:
                            event_ticket.booked = (event_ticket.booked or 0) - participant.quantity
                
                if participant.paid_amount>0 and error3==1:
                    pt = EventRepo._payment_transactions_for_participant(participant.id)
                    if pt:
                        for txn in pt:
                            txn.status = 3
                

                db.session.commit()
        else:
            return {"error2": "is_error"}
        
        
        user_push_tokens = user.get_push_token(user_id, 6)
        buddy_push_tokens = user.get_push_token(buddy_id, 6)
         
        get_user = user.get_userby_id(user_id)
        get_buddy = user.get_userby_id(buddy_id)
        if get_user:
                customer_name = f"{get_user.first_name} {get_user.last_name}"
        else:
                customer_name=""
        if get_buddy:
                buddy_name = f"{get_buddy.first_name} {get_buddy.last_name}"
        else:
                buddy_name=""

        customer_template = "cancle_booking_to_customer"
        customer_title, customer_message = load_push_notification_template(
                customer_template, CUSTOMER_NAME=customer_name, BUDDY_NAME=buddy_name
        )
        task_id=0
        if user_push_tokens is not None:

            customer_notification_data = {
                "registration_token": user_push_tokens,
                "title": customer_title,
                "body": customer_message,
                "odid": event_id,
                "type": 6
            }
            threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
            #task = push_notification_user.delay(customer_notification_data)
            #task_id = task.id
            task_id = ''

        user.create_notification_history(
                participant_id=None,
                event_id=event_id,
                push=True,
                sms=False,
                email=False,
                type=6,
                title=customer_title,
                message=customer_message,
                send_to=6,
                task_id=task_id,
                user_id=user_id

        )

        buddy_template = "cancle_booking_to_organizer"
        buddy_title, buddy_message = load_push_notification_template(
                buddy_template, CUSTOMER_NAME=customer_name, BUDDY_NAME=buddy_name
        )
        task_id=0
        if buddy_push_tokens is not None:

            
            buddy_notification_data = {
                "registration_token": buddy_push_tokens,
                "title": buddy_title,  # Title for Buddy Notification
                "body": buddy_message,
                "odid": event_id,
                "type": 6
            }
            threading.Thread(target=async_push_notification_user, args=(buddy_notification_data,)).start()
            #task = push_notification_user.delay(buddy_notification_data)
            #task_id = task.id
            task_id = ''


        user.create_notification_history(
                participant_id=None,
                event_id=event_id,
                push=True,
                sms=False,
                email=False,
                type=6,
                title=buddy_title,
                message=buddy_message,
                send_to=6,
                task_id=task_id,
                user_id=buddy_id
        )
        
        
        
        


        return 1
    
    
    
        
        
    @staticmethod
    @handle_repository_errors
    def cancle_event_all_booking(event_id,session_id): 
        
        event = db.session.query(Event).filter_by(id=event_id).first()
        
        buddy_id=event.user_id
        buddy_push_tokens = user.get_push_token(buddy_id, 6)
        get_buddy = OrganizerRepository.get_organization_by_user_id(buddy_id)
        if get_buddy:
            buddy_name = f"{get_buddy.organization_name}"
        else:
            get_buddy = user.get_userby_id(buddy_id)   
            if get_buddy: 
                    buddy_name = f"{get_buddy.first_name} {get_buddy.last_name}"
            else:
                    buddy_name=""
                
        participants = db.session.query(Participant).filter_by(event_id=event_id).filter_by(status=1).all()
        if participants:
            for participant in participants:
                if not participant:
                    return 1
               
                participant_id = participant.id
                user_id=participant.user_id
                #now = datetime.utcnow()
                now = datetime.now(ZoneInfo(event.time_zone or os.getenv('d_t_z')))
                
                
                    
                participant.status = 4  # cancle status
                participant.updated_on = now
                
                    
                event.booked = (event.booked or 0) - participant.quantity
                    
                if participant.date_time_id>0:
                        event_date_time = EventDateTime.query.get(participant.date_time_id)
                        if event_date_time:
                            event_date_time.booked = (event_date_time.booked or 0) - participant.quantity
                            
                if participant.ticket_id>0:
                        event_ticket = EventTicket.query.get(participant.ticket_id)
                        if event_ticket:
                            event_ticket.booked = (event_ticket.booked or 0) - participant.quantity
                
                if participant.paid_amount>0:
                    pt = EventRepo._payment_transactions_for_participant(participant.id)
                    if pt:
                        for txn in pt:
                            txn.status = 3
                

                db.session.commit()
                
                user_push_tokens = user.get_push_token(user_id, 6)
                 
                get_user = user.get_userby_id(user_id)
                if get_user:
                        customer_name = f"{get_user.first_name} {get_user.last_name}"
                else:
                        customer_name=""

                customer_template = "cancle_booking_byorg_to_customer"
                customer_title, customer_message = load_push_notification_template(
                        customer_template, CUSTOMER_NAME=customer_name, BUDDY_NAME=buddy_name,EVENT_NAME=event.title
                )
                task_id=0
                if user_push_tokens is not None:

                    customer_notification_data = {
                        "registration_token": user_push_tokens,
                        "title": customer_title,
                        "body": customer_message,
                        "odid": event_id,
                        "type": 6
                    }
                    threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
                    #task = push_notification_user.delay(customer_notification_data)
                    #task_id = task.id
                    task_id = ''

                user.create_notification_history(
                        participant_id=None,
                        event_id=event_id,
                        push=True,
                        sms=False,
                        email=False,
                        type=6,
                        title=customer_title,
                        message=customer_message,
                        send_to=6,
                        task_id=task_id,
                        user_id=user_id

                )
        else:
            return 1
        
        

        buddy_template = "cancle_booking_byorg_to_organizer"
        buddy_title, buddy_message = load_push_notification_template(
                buddy_template, CUSTOMER_NAME=customer_name, BUDDY_NAME=buddy_name
        )
        task_id=0
        if buddy_push_tokens is not None:

            
            buddy_notification_data = {
                "registration_token": buddy_push_tokens,
                "title": buddy_title,  # Title for Buddy Notification
                "body": buddy_message,
                "odid": event_id,
                "type": 6
            }
            threading.Thread(target=async_push_notification_user, args=(buddy_notification_data,)).start()
            #task = push_notification_user.delay(buddy_notification_data)
            #task_id = task.id
            task_id = ''


        user.create_notification_history(
                participant_id=None,
                event_id=event_id,
                push=True,
                sms=False,
                email=False,
                type=6,
                title=buddy_title,
                message=buddy_message,
                send_to=6,
                task_id=task_id,
                user_id=buddy_id
        )
        
        
        
        


        return 1
    
    
    
      
        
        
    @staticmethod
    @handle_repository_errors
    def update_attendance_user(request_data,session_id):
        participant_id = request_data.get('ticket_id')
        category = request_data.get('category')
        participant = db.session.query(Participant).filter_by(id=participant_id).first()
        event = db.session.query(Event).filter_by(id=participant.event_id).first()
        if not participant:
            return {"error2": "is_error"}

        if not event:
            return {"error5": "is_error"}
                       
        if participant.status==2:
            return {"error6": "is_error"}    
                
        event_id = participant.event_id
        participant_id = participant.id
        #now = datetime.utcnow()
        now = datetime.now(ZoneInfo(event.time_zone or os.getenv('d_t_z')))
        
        attendance = db.session.query(ParticipantsAttendance).filter_by(
            participant_id=participant_id,
            attendance_date=now.date(),
            event_id=event_id
        ).first()


        if not attendance:
            return {"error3": "is_error"}
        if attendance and attendance.status == 1:
            return {"error": "is_error"}
        
        elif attendance:
            attendance.status = 1  # Mark as present
            attendance.updated_on = now
            db.session.commit()
                
                
            # Fetch push tokens for  customer 
            user_push_tokens = user.get_push_token(session_id, 7)
            get_user = user.get_userby_id(session_id)
            if get_user:
                        customer_name = f"{get_user.first_name} {get_user.last_name}"
            else:
                        customer_name=""

            customer_template = "attendance_booking_to_customer"
            category=category or event.title
            customer_title, customer_message = load_push_notification_template(
                        customer_template, CUSTOMER_NAME=customer_name,EVENT_NAME=category
            )
            task_id=0
                    
            if user_push_tokens is not None:

                    customer_notification_data = {
                        "registration_token": user_push_tokens,
                        "title": customer_title,
                        "body": customer_message,
                        "odid": event_id,
                        "type": 7
                    }
                    threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
                    #task = push_notification_user.delay(customer_notification_data)
                    #task_id = task.id
                    task_id = ''

            user.create_notification_history(
                        participant_id=0,
                        event_id=event_id,
                        push=True,
                        sms=False,
                        email=False,
                        type=7,
                        title=customer_title,
                        message=customer_message,
                        send_to=7,
                        task_id=task_id,
                        user_id=session_id

            )

        return attendance
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def update_event_answer(request_data, session_id):
        EventRepo.ensure_question_schema()
        answer = db.session.query(Answer_and_question).filter_by(id=request_data.get('id')).first()
        if not answer:
            return {"error": "Answer not found"}

        event = EventRepo.get_event_by_id(answer.event_id)
        speaker_assignment = EventSpeakers.query.filter_by(
            event_id=answer.event_id,
            user_id=session_id,
            status=1,
        ).first()
        is_owner = bool(event and str(event.user_id) == str(session_id))
        if not event or (not is_owner and not speaker_assignment):
            return {"error": "Question is not available to this responder"}
        if request_data.get('event_id') and int(request_data.get('event_id')) != answer.event_id:
            return {"error": "Question does not belong to this event"}

        answer.answer = request_data.get('answer')
        answer.updated_by = session_id
        answer.updated_on = datetime.now(ZoneInfo(event.time_zone or os.getenv('d_t_z')))
        db.session.commit()
        
        
        user_push_tokens = user.get_push_token(answer.user_id, 9)
        get_user = user.get_userby_id(answer.user_id)
        get_buddy = user.get_userby_id(session_id)
        if get_user:
                customer_name = f"{get_user.first_name} {get_user.last_name}"
        else:
                customer_name=""
        if get_buddy:
                buddy_name = f"{get_buddy.first_name} {get_buddy.last_name}"
        else:
                buddy_name=""

        customer_template = "question_answered_to_customer"
        customer_title, customer_message = load_push_notification_template(
                customer_template, CUSTOMER_NAME=customer_name, SPEAKER_NAME=buddy_name
        )
        task_id=0
        if user_push_tokens is not None:

            customer_notification_data = {
                "registration_token": user_push_tokens,
                "title": customer_title,
                "body": customer_message,
                "odid": answer.event_id,
                "type": 9
            }
            threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
            #task = push_notification_user.delay(customer_notification_data)
            #task_id = task.id
            task_id = ''

        user.create_notification_history(
                participant_id=None,
                event_id=answer.event_id,
                push=True,
                sms=False,
                email=False,
                type=9,
                title=customer_title,
                message=customer_message,
                send_to=9,
                task_id=task_id,
                user_id=answer.user_id

        )

        return {"message": "Answer updated successfully"}
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def add_event_question(request_data,session_id):
        EventRepo.ensure_question_schema()
        event = EventRepo.get_event_by_id(request_data.get('event_id')) 
        if not event:
            return {"error": "Event not found"}
        user_id = event.user_id
        
        
        question = Answer_and_question(
            
            question=request_data.get('question'),
            status=1,
            event_id=request_data.get('event_id'),
            time_zone=event.time_zone or os.getenv('d_t_z'),
            created_on=datetime.now(ZoneInfo(event.time_zone or os.getenv('d_t_z'))),
            organizer_id = user_id,
            user_id = session_id,
            created_by= session_id,
            is_anonymous=bool(request_data.get('is_anonymous')),
        )
        
        db.session.add(question)
        db.session.commit()
        
        if not question.id:
            return {"error": "is_error"}
        
        buddy_push_tokens = user.get_push_token(user_id, 9)
         
         
         
        get_user = user.get_userby_id(session_id)
        
        if question.is_anonymous:
                customer_name = "Anonymous attendee"
        elif get_user:
                customer_name = f"{get_user.first_name} {get_user.last_name}"
        else:
                customer_name=""
             
             
        get_buddy = OrganizerRepository.get_organization_by_user_id(user_id)
        if not get_buddy:
            get_buddy = user.get_userby_id(user_id) 
            buddy_name = f"{get_buddy.first_name} {get_buddy.last_name}"
        else:
            buddy_name = get_buddy.organization_name
        

        
        buddy_template = "customer_quitined"
        buddy_title, buddy_message = load_push_notification_template(
                buddy_template, CUSTOMER_NAME=customer_name, EVENT_TITLE=event.title
        )
        task_id=0
        if buddy_push_tokens is not None:

            
            buddy_notification_data = {
                "registration_token": buddy_push_tokens,
                "title": buddy_title,  # Title for Buddy Notification
                "body": buddy_message,
                "odid": request_data.get('event_id'),
                "type": 9
            }
            threading.Thread(target=async_push_notification_user, args=(buddy_notification_data,)).start()
            #task = push_notification_user.delay(buddy_notification_data)
            #task_id = task.id
            task_id = ''


        user.create_notification_history(
                participant_id=None,
                event_id=request_data.get('event_id'),
                push=True,
                sms=False,
                email=False,
                type=9,
                title=buddy_title,
                message=buddy_message,
                send_to=9,
                task_id=task_id,
                user_id=user_id
        )

        
        return question.id
        
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_participant_count(event_id,session):

        return db.session.query(
            func.count(Participant.id)
        ).filter(Participant.event_id == event_id,Participant.user_id == session,Participant.status == 1).scalar() or 0
    
    
    @staticmethod
    @handle_repository_errors
    def get_participant_images(event_id):

        participant_images = [
                    {"profile_image": img[0]} for img in db.session.query(distinct(Users.profile_image))
                    .join(Participant, Participant.user_id == Users.id)
                    .filter(Participant.event_id == event_id)
                    .filter(Participant.status>0)
                    .limit(5)
                    .all()
        ]
        return participant_images
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_participant_count_all(event_id):

        return db.session.query(
            func.count(distinct(Participant.user_id))
        ).filter(Participant.event_id == event_id).filter(Participant.status>0).scalar() or 0
    
    
    @staticmethod
    @handle_repository_errors
    def get_ticket_count(event_id,session):
        return (
            db.session.query(func.coalesce(func.sum(Participant.quantity), 0))
            .filter(Participant.status == 1,Participant.event_id == event_id, Participant.user_id == session)
            .scalar()
        )
    
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def add_participant_attendance(attendance_data):
        # Create a new ParticipantsAttendance instance
        attendance_record = ParticipantsAttendance(**attendance_data)

        # Add the record to the session and commit
        db.session.add(attendance_record)
        db.session.commit()

        return attendance_record
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_participant_attendance_count(event_id,participant_id):
        
        
        today_date = date.today().strftime('%Y-%m-%d')

        return db.session.query(
            func.count(ParticipantsAttendance.id)
        ).filter(ParticipantsAttendance.event_id == event_id,ParticipantsAttendance.participant_id == participant_id,ParticipantsAttendance.status == 1,ParticipantsAttendance.attendance_date == today_date).scalar() or 0
        
        
    

        
        
        id, event_id, user_id, status, created_by, created_on, updated_on, updated_by, first_name, last_name, image
    
    @staticmethod
    @handle_repository_errors
    def get_speakers_by_event(type=None):
        speaker_ids = (
            db.session.query(EventSpeakers.user_id)
            .join(Event, Event.id == EventSpeakers.event_id)
            .filter(
                EventSpeakers.status == 1
            )
        )

        if type is not None:  # Apply category filter only if type is provided
            speaker_ids = speaker_ids.filter(Event.category_id == type)

        speaker_ids = speaker_ids.distinct().subquery()
        speakers = (
            Users.query
            .join(speaker_ids, speaker_ids.c.user_id == Users.id)
            .filter(
                Users.role_type == 4,
                Users.status == 1,
            )
            .order_by(Users.first_name.asc(), Users.last_name.asc(), Users.id.asc())
            .all()
        )

        return [
            {
                "id": speaker.id,
                "first_name": speaker.first_name,
                "last_name": speaker.last_name,
                "profile_image": speaker.profile_image
            }
            for speaker in speakers
        ]





    @staticmethod
    @handle_repository_errors
    def get_organizer_by_event(type=None):
        query = (
            db.session.query(
                Users.id.label('id'),
                Organization.organization_name.label('organization_name'),
                Users.profile_image.label('profile_image')
            )
            .join(Event, Event.user_id == Organization.user_id)  # Join Organization with Event
            .join(Users, Users.id == Organization.user_id)       # Join Organization with Users
            .filter(
                Organization.status == 1,  # Active organizations
                Event.status == 1,         # Active events
                Users.status == 1          # Active users
            )
        )

        if type is not None:  # Apply category filter only if type is provided
            query = query.filter(Event.category_id == type)

        data = (
            query
            .group_by(Users.id, Organization.id, Organization.organization_name, Users.profile_image)
            .order_by(Organization.organization_name.asc(), Users.id.asc())
            .all()
        )

        return [
            {
                "id": datas.id,
                "organization_name": datas.organization_name,
                "profile_image": datas.profile_image
            }
            for datas in data
        ]

             
        
    
    
    @staticmethod
    @handle_repository_errors
    def update_status_request_buddy(request_data,session):
        
        if request_data.get('id') is not None :
            data = db.session.query(Request_buddy).filter_by(id=request_data.get('id')).first()            
            if request_data.get('buddy_id') or request_data.get('buddy_id')==0:
                data.buddy_id = request_data.get('buddy_id')
            if request_data.get('date'):
                data.date =  request_data.get('date')
            if request_data.get('time'):
                data.time = request_data.get('time')
            if request_data.get('meet_link'):
                data.meet_link = request_data.get('meet_link') 
            if request_data.get('user_comment'):
                data.user_comment = request_data.get('user_comment')   
            if request_data.get('status') or request_data.get('status')==0:
                data.status = request_data.get('status')
                if request_data.get('status')==2:
                    data.meet_link = ''
            data.updated_on = datetime.utcnow()
            data.updated_by = session 
            db.session.commit()
            
            if data is not None:
                if data.type==1:
                    EventRepo.send_buddy_notifications(data.user_id, data.buddy_id,data.event_id,data.id)
                else:
                    EventRepo.send_session_notifications(data.user_id, data.speaker_id,data.event_id,data.id)
            
        elif request_data.get('user_id') is not None and request_data.get('event_id') is not None :
            
            data = db.session.query(Request_buddy).filter_by(user_id=request_data.get('user_id'),event_id=request_data.get('event_id')).first() 
            if data :      
                if request_data.get('status'):
                    data.status = request_data.get('status')
                if request_data.get('buddy_id'):
                    data.buddy_id = request_data.get('buddy_id')
                if request_data.get('date'):
                    data.date =  request_data.get('date')
                if request_data.get('time'):
                    data.time = request_data.get('time')
                if request_data.get('meet_link'):
                    data.meet_link = request_data.get('meet_link')   
                if request_data.get('user_comment'):
                    data.user_comment = request_data.get('user_comment')    
                data.updated_on = datetime.utcnow()
                data.updated_by = session 
                db.session.commit()
            else :
                requestbuddy = Request_buddy(                    
                    user_id=request_data.get('user_id'),
                    status=request_data.get('status',0),
                    event_id=request_data.get('event_id'),
                    buddy_id=request_data.get('buddy_id',0),
                    date=request_data.get('date'),
                    time=request_data.get('time'),
                    meet_link=request_data.get('meet_link'),
                    user_comment=request_data.get('user_comment'),
                    created_on = datetime.utcnow(),
                    created_by= session
                )            
                db.session.add(requestbuddy)                
                db.session.commit()

                 
        
    @staticmethod
    def send_buddy_notifications(user_id, buddy_id,event_id=0,idd=0):
        # Assignment retries use stable request-scoped history keys, so each
        # recipient is notified once even when the organizer taps twice.
        event = EventRepo.get_event_by_id(event_id)
        if event is None:
            return 0
        event_title = event.title

         
        get_user = user.get_userby_id(user_id)
        get_buddy = user.get_userby_id(buddy_id)
        if get_user:
                customer_name = f"{get_user.first_name} {get_user.last_name}"
        else:
                customer_name=""
        if get_buddy:
                buddy_name = f"{get_buddy.first_name} {get_buddy.last_name}"
        else:
                buddy_name=""

        customer_template = "assingned_buddy_to_customer"
        customer_title, customer_message = load_push_notification_template(
                customer_template, CUSTOMER_NAME=customer_name, BUDDY_NAME=buddy_name,EVENT_NAME=event_title
        )
        customer_task_id = f"buddy-assignment:{idd}:user:{user_id}"
        if not Notification_History.query.filter_by(
            user_id=user_id,
            task_id=customer_task_id,
        ).first():
            user_push_tokens = user.get_push_token(user_id, 3)
            if user_push_tokens is not None:
                customer_notification_data = {
                    "registration_token": user_push_tokens,
                    "title": customer_title,
                    "body": customer_message,
                    "odid": event_id,
                    "type": 3
                }
                threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
            user.create_notification_history(
                    participant_id=None,
                    event_id=event_id,
                    push=True,
                    sms=False,
                    email=False,
                    type=3,
                    title=customer_title,
                    message=customer_message,
                    send_to=3,
                    task_id=customer_task_id,
                    user_id=user_id
            )

        buddy_template = "assingned_buddy_to_newassignment"
        buddy_title, buddy_message = load_push_notification_template(
                buddy_template, CUSTOMER_NAME=customer_name, BUDDY_NAME=buddy_name,EVENT_NAME=event_title
        )
        buddy_task_id = f"buddy-assignment:{idd}:buddy:{buddy_id}"
        if not Notification_History.query.filter_by(
            user_id=buddy_id,
            task_id=buddy_task_id,
        ).first():
            buddy_push_tokens = user.get_push_token(buddy_id, 3)
            if buddy_push_tokens is not None:
                buddy_notification_data = {
                    "registration_token": buddy_push_tokens,
                    "title": buddy_title,  # Title for Buddy Notification
                    "body": buddy_message,
                    "odid": idd,
                    "type": 3
                }
                threading.Thread(target=async_push_notification_user, args=(buddy_notification_data,)).start()
            user.create_notification_history(
                    participant_id=None,
                    event_id=idd,
                    push=True,
                    sms=False,
                    email=False,
                    type=3,
                    title=buddy_title,
                    message=buddy_message,
                    send_to=3,
                    task_id=buddy_task_id,
                    user_id=buddy_id
            )
        return 2

      
        
    @staticmethod
    def send_session_notifications(user_id, speaker_id,event_id=0,idd=0):
        # Fetch push tokens for both customer and buddy
        user_push_tokens = user.get_push_token(user_id, 4)
        speaker_push_tokens = user.get_push_token(speaker_id, 4)

         
        get_user = user.get_userby_id(user_id)
        get_speaker = user.get_userby_id(speaker_id)
        if get_user:
                customer_name = f"{get_user.first_name} {get_user.last_name}"
        else:
                customer_name=""
        if get_speaker:
                speaker_name = f"{get_speaker.first_name} {get_speaker.last_name}"
        else:
                speaker_name=""

        customer_template = "request_session_to_customer"
        customer_title, customer_message = load_push_notification_template(
                customer_template, CUSTOMER_NAME=customer_name, SPEAKER_NAME=speaker_name
        )
        task_id=0
        if user_push_tokens is not None:

            customer_notification_data = {
                "registration_token": user_push_tokens,
                "title": customer_title,
                "body": customer_message,
                "odid": idd,
                "type": 4
            }
            threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
            #task = push_notification_user.delay(customer_notification_data)
            #task_id = task.id
            task_id = ''

        user.create_notification_history(
                participant_id=None,
                event_id=idd,
                push=True,
                sms=False,
                email=False,
                type=4,
                title=customer_title,
                message=customer_message,
                send_to=4,
                task_id=task_id,
                user_id=user_id

        )

        buddy_template = "request_session_to_speaker"
        buddy_title, buddy_message = load_push_notification_template(
                buddy_template, CUSTOMER_NAME=customer_name, SPEAKER_NAME=speaker_name
        )
        task_id=0
        if speaker_push_tokens is not None:

            
            buddy_notification_data = {
                "registration_token": speaker_push_tokens,
                "title": buddy_title,  # Title for Buddy Notification
                "body": buddy_message,
                "odid": idd,
                "type": 4
            }
            threading.Thread(target=async_push_notification_user, args=(buddy_notification_data,)).start()
            #task = push_notification_user.delay(buddy_notification_data)
            #task_id = task.id
            task_id = ''


        user.create_notification_history(
                participant_id=None,
                event_id=idd,
                push=True,
                sms=False,
                email=False,
                type=4,
                title=buddy_title,
                message=buddy_message,
                send_to=4,
                task_id=task_id,
                user_id=speaker_id
        )


    @staticmethod
    def send_push_notifications_for_event(event_obj):
        """Sends push notifications for a newly created event."""
        # push_tokens = user.get_all_push_tokens()
        # sents=[]
        # for push_token in push_tokens:
            # if push_token:
                # customer_template = "new_event_created" 
                # customer_title, customer_message = load_push_notification_template(customer_template,EVENT_NAME=event_obj.title,START_DATE=f"{event_obj.start_date.day} {event_obj.start_date.strftime('%B')}")
                # customer_notification_data = {
                    # "registration_token": push_token["push_token"],
                    # "title": customer_title,
                    # "body": customer_message,
                    # "odid": event_obj.id,
                    # "type": 2
                # }
                # task = push_notification_user.delay(customer_notification_data)
                # task_id = task.id

                # if push_token["user_id"] not in sents:
                    # sents.append(push_token["user_id"])
                    # user.create_notification_history(
                        # participant_id=None,
                        # event_id=event_obj.id,
                        # push=True,
                        # sms=False,
                        # email=False,
                        # type=2,
                        # title=customer_title,
                        # message=customer_message,
                        # send_to=2,
                        # task_id=task_id,
                        # user_id=push_token["user_id"]
                    # )
        return

    @staticmethod
    def send_push_notifications_for_event_update(event_obj):
        """Notify each active booked User once and push to registered devices."""
        booked_user_ids = user.get_event_booked_user_ids(event_obj.id) or []
        push_tokens = user.get_event_push_tokens(event_obj.id, 7) or []
        push_token_values = [row["push_token"] for row in push_tokens if row.get("push_token")]
        customer_template = "booked_event_updated"
        customer_title, customer_message = load_push_notification_template(customer_template,EVENT_NAME=event_obj.title,START_DATE=f"{event_obj.start_date.day} {event_obj.start_date.strftime('%B')}")

        for booked_user_id in booked_user_ids:
            user.create_notification_history(
                participant_id=None,
                event_id=event_obj.id,
                push=True,
                sms=False,
                email=False,
                type=7,
                title=customer_title,
                message=customer_message,
                send_to=7,
                task_id='',
                user_id=booked_user_id,
            )

        if push_token_values:
            customer_notification_data = {
                "registration_token": push_token_values,
                "title": customer_title,
                "body": customer_message,
                "odid": event_obj.id,
                "type": 7,
            }
            threading.Thread(
                target=async_push_notification_user,
                args=(customer_notification_data,),
            ).start()



    @staticmethod
    def send_push_notifications_for_material_upload(event_obj):
        """Notify every distinct active booked User about newly available material."""
        booked_user_ids = user.get_event_booked_user_ids(event_obj.id) or []
        push_tokens = user.get_event_push_tokens(event_obj.id, 7) or []
        push_token_values = [
            row["push_token"] for row in push_tokens if row.get("push_token")
        ]
        customer_template = "material_upload"
        customer_title, customer_message = load_push_notification_template(customer_template,EVENT_NAME=event_obj.title)

        for booked_user_id in booked_user_ids:
            user.create_notification_history(
                participant_id=None,
                event_id=event_obj.id,
                push=True,
                sms=False,
                email=False,
                type=7,
                title=customer_title,
                message=customer_message,
                send_to=7,
                task_id='',
                user_id=booked_user_id,
            )

        if push_token_values:
            customer_notification_data = {
                "registration_token": push_token_values,
                "title": customer_title,
                "body": customer_message,
                "odid": event_obj.id,
                "type": 7,
            }
            threading.Thread(
                target=async_push_notification_user,
                args=(customer_notification_data,),
            ).start()
        return len(booked_user_ids)
         
    @staticmethod
    def send_push_notifications_for_event_announcement(data):
        """Persist an event-linked Inbox announcement for every active booked User."""
        event_id = data["event_id"]
        announcement_id = data.get("announcement_id", 0)
        customer_title = data["title"]
        customer_message = data["message"]
        booked_user_ids = user.get_event_booked_user_ids(event_id) or []
        push_tokens = user.get_event_push_tokens(event_id, 7) or []
        push_token_values = [
            row["push_token"] for row in push_tokens if row.get("push_token")
        ]

        notifications = []
        for booked_user_id in booked_user_ids:
            task_id = (
                f"event-announcement:{announcement_id}:event:{event_id}:"
                f"user:{booked_user_id}"
            )
            if Notification_History.query.filter_by(task_id=task_id).first():
                continue
            notifications.append(Notification_History(
                participant_id=None,
                event_id=event_id,
                push=True,
                sms=False,
                email=False,
                type=7,
                title=customer_title,
                message=customer_message,
                send_to=7,
                task_id=task_id,
                user_id=booked_user_id,
            ))

        if notifications:
            db.session.add_all(notifications)
            db.session.commit()

        if push_token_values and notifications:
            customer_notification_data = {
                "registration_token": push_token_values,
                "title": customer_title,
                "body": customer_message,
                "odid": event_id,
                "type": 7,
            }
            threading.Thread(
                target=async_push_notification_user,
                args=(customer_notification_data,),
            ).start()
        return len(notifications)
          
         
    @staticmethod
    def send_push_notifications_for_all(data):
        """Sends push notifications for a newly created event."""
        push_tokens = user.get_all_push_tokens()
        sents=[]
        push_tokenss=[]
        customer_title=data["title"]
        customer_message = data["message"]
        
        for push_token in push_tokens:
            if push_token["push_token"]:
                
                push_tokenss.append(push_token["push_token"])
                task_id = ''

                if push_token["user_id"] not in sents:
                    sents.append(push_token["user_id"])          
                    user.create_notification_history(
                        participant_id=None,
                        event_id=0,
                        push=True,
                        sms=False,
                        email=False,
                        type=0,
                        title=customer_title,
                        message=customer_message,
                        send_to=0,
                        task_id=task_id,
                        user_id=push_token["user_id"]
                    )
                else:
                    user.create_notification_history(
                        participant_id=None,
                        event_id=0,
                        push=True,
                        sms=False,
                        email=False,
                        type=0,
                        title=customer_title,
                        message=customer_message,
                        send_to=0,
                        task_id=task_id,
                        user_id=0
                    )

        
        customer_notification_data = {
            "registration_token": push_tokenss,
            "title": customer_title,
            "body": customer_message,
            "odid": 0,
            "type": 0
        }
        threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
          
    @staticmethod
    def send_buddyrequest_notifications(user_id, buddy_id,event_title,type,event_id,idd):
        # Fetch push tokens for both customer and buddy
        
        user_push_tokens = user.get_push_token(user_id, 3)
        buddy_push_tokens = user.get_push_token(buddy_id, 3)

        
        if type == 1:
            send_to = 3
        else:
            send_to = 4 
        
        get_user = user.get_userby_id(user_id)
        
        
            
        if type ==2:
                get_buddy = user.get_userby_id(buddy_id)
                buddy_name = f"{get_buddy.first_name} {get_buddy.last_name}"
        else:    
                get_buddy = OrganizerRepository.get_organization_by_user_id(buddy_id)
                buddy_name = f"{get_buddy.organization_name}"
            
        if get_user:
                customer_name = f"{get_user.first_name} {get_user.last_name}"
        else:
                customer_name=""
                
                
        if event_title:
                event_title = event_title
        else:
                event_title=""    
                
        if type == 1:    
            customer_template = "sent_request_buddy"
            odid=event_id
        else:
            customer_template = "sent_request_session"
            odid=idd
                    
        customer_title, customer_message = load_push_notification_template(
                customer_template, CUSTOMER_NAME=customer_name, BUDDY_NAME=buddy_name, EVENT_NAME=event_title
        )
        task_id=0
        if user_push_tokens is not None:
            

            customer_notification_data = {
                "registration_token": user_push_tokens,
                "title": customer_title,
                "body": customer_message,
                "odid":odid,
                "type": send_to
            }
            threading.Thread(target=async_push_notification_user, args=(customer_notification_data,)).start()
            #task = push_notification_user.delay(customer_notification_data)
            #task_id = task.id
            task_id = ''

        user.create_notification_history(
                participant_id=0,
                event_id=odid,
                push=True,
                sms=False,
                email=False,
                type=send_to,
                title=customer_title,
                message=customer_message,
                send_to=send_to,
                task_id=task_id,
                user_id=user_id
        )
         
        # print(buddy_push_tokens)
        odid=idd
        if type == 1:    
                buddy_template = "received_request_buddy"
        else:
                buddy_template = "received_request_session"
                
        buddy_title, buddy_message = load_push_notification_template(
                buddy_template, CUSTOMER_NAME=customer_name, BUDDY_NAME=buddy_name, EVENT_NAME=event_title
        )
        task_id=0
            
        if buddy_push_tokens is not None:

            
            
            buddy_notification_data = {
                "registration_token": buddy_push_tokens,
                "title": buddy_title,  # Title for Buddy Notification
                "body": buddy_message,
                "odid":odid,
                "type": send_to
            }
            threading.Thread(target=async_push_notification_user, args=(buddy_notification_data,)).start()
            #task = push_notification_user.delay(buddy_notification_data)
            #task_id = task.id
            task_id = ''


        user.create_notification_history(
                participant_id=0,
                event_id=odid,
                push=True,
                sms=False,
                email=False,
                type=send_to,
                title=buddy_title,
                message=buddy_message,
                send_to=send_to,
                task_id=task_id,
                user_id=buddy_id
        )            
        
    
    @staticmethod
    @handle_repository_errors
    def update_payment_status_by_client_secret(payment_intent_id,status,webhook=0,final_response=None):
        # Find the PaymentTransaction by client_secret
        payment_transaction = PaymentTransaction.query.filter_by(payment_intent_id=payment_intent_id).first()

        if not payment_transaction:
            return None
            #raise ServiceError("PaymentTransaction not found")

        payment_transaction.status = status
        payment_transaction.final_response = str(final_response)
        # Update the status to 1 (success) 2 (failed)

        if status==1:
            participants = Participant.query.filter(
                (Participant.id == payment_transaction.participant_id) |
                (Participant.parent_id == payment_transaction.participant_id)
            ).all()
            for participant in participants:
                participant.status = 1
        db.session.commit()
        if webhook==1:
            
            if status==1:
                event = Event.query.filter_by(id=payment_transaction.event_id).first()
                participant = Participant.query.filter_by(id=payment_transaction.participant_id).first()
                EventRepo.add_participant_notification(participant, event,participant.user_id)
        
        return payment_transaction
    
        
        

        
    @staticmethod
    @handle_repository_errors
    def share(event_id,event_name):
        if not event_id:
            return jsonify({'error': 'event_id is required'}), 400

        encoded_event_id = base64.b64encode(str(event_id).encode('utf-8')).decode('utf-8')
        share_url = public_open_path_url(encoded_event_id)

        event = Event.query.get(event_id)
        if event:
            event.share_url = share_url
            db.session.commit()
            return event.share_url

        return jsonify({'error': 'Event not found'}), 404
