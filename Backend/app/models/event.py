from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Float, Boolean, ForeignKey, Numeric, SmallInteger, Time, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from .. import db
from datetime import datetime
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.ext.compiler import compiles


@compiles(LONGTEXT, "sqlite")
def compile_longtext_sqlite(type_, compiler, **kw):
    return "TEXT"


@compiles(LONGTEXT, "postgresql")
def compile_longtext_postgresql(type_, compiler, **kw):
    return "TEXT"

class Event(db.Model):
    __tablename__ = 'event'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    ar_title = db.Column(db.String(255), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False, index=True)
    sub_category_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'), nullable=True, index=True)
    description = db.Column(db.Text, nullable=True)
    ar_description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=False, index=True)
    end_date = db.Column(db.DateTime, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    event_type = db.Column(db.SmallInteger, nullable=False)  # 0 for single, 1 for recurring
    location = db.Column(db.String(255), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    price_type = db.Column(db.SmallInteger, nullable=False)  # 0 for free, 1 for paid
    price = db.Column(db.Numeric(10, 2), nullable=True)  # Null for free events
    journey_level_id = db.Column(db.Integer, db.ForeignKey('journey_level.id'), nullable=True) #0-suitable for all
    language_id = db.Column(db.Integer, db.ForeignKey('language.id'), nullable=True)
    gender = db.Column(db.Integer, nullable=True, default=0) #1-men-2-women-3-both
    total_no_class = db.Column(db.SmallInteger, nullable=True)
    call_per_week = db.Column(db.SmallInteger, nullable=True)
    rule = db.Column(db.Text, nullable=True)
    ar_rule = db.Column(db.Text, nullable=True)
    eligibility = db.Column(db.Text, nullable=True)
    ar_eligibility = db.Column(db.Text, nullable=True)
    cancellation_policy = db.Column(db.Text, nullable=True)
    ar_cancellation_policy = db.Column(db.Text, nullable=True)
    terms_condition = db.Column(db.Text, nullable=True)
    ar_terms_condition = db.Column(db.Text, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1) #0-pending,1-active,2-inactive,3-deleted,4-cancled
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    location_type = db.Column(db.SmallInteger, nullable=False) # 0 for online, 1 for offline
    meet_link = db.Column(db.Text, nullable=True)
    area = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(255), nullable=True)
    duration = db.Column(db.Integer, nullable=True, default=0) 
    day_off = db.Column(db.String(255), nullable=True) #0 = Monday, 6 = Sunday
    available = db.Column(db.Integer, nullable=True, default=0) 
    qrcode_type = db.Column(db.Integer, nullable=True, default=0) #1-multiple,0-single
    ticket_type = db.Column(db.Integer, nullable=True, default=0) #1-multiple,0-single
    booked = db.Column(db.Integer, nullable=True, default=0)
    quantity_per_user = db.Column(db.Integer, nullable=True, default=0)
    course_breakdown = db.Column(db.Integer, nullable=True, default=0) #1-yes,2-no
    swipe_checkin = db.Column(db.Integer, nullable=True, default=0) #1-yes,2-no
    occusr_type = db.Column(db.Integer, nullable=True,default=0) #1-once,2-daily,3-weekly,4-monthly
    occusr_weekday = db.Column(db.String(255), nullable=True) #0 = Monday, 6 = Sunday
    occusr_month = db.Column(db.Integer, nullable=True,default=0) #1-date,2-weekday
    to_location = db.Column(db.String(255), nullable=True)
    to_latitude = db.Column(db.Float, nullable=True)
    to_longitude = db.Column(db.Float, nullable=True)
    itinerary_breakdown = db.Column(db.Integer, nullable=True, default=0) #1-yes,2-no
    checkin_range = db.Column(db.Integer, nullable=True, default=0) #miles
    share_url = db.Column(db.String(255), nullable=True) 
    time_zone = db.Column(db.String(255), nullable=True) 
    meetlink_reminder_1d_sent = db.Column(db.Boolean, nullable=False, default=False)
    meetlink_reminder_30m_sent = db.Column(db.Boolean, nullable=False, default=False)
    participant_reminder_1d_sent = db.Column(db.Boolean, nullable=False, default=False)
    participant_reminder_30m_sent = db.Column(db.Boolean, nullable=False, default=False)
    participant_reminder_1d_sent_date = db.Column(db.Date, nullable=True)
    participant_reminder_30m_sent_date = db.Column(db.Date, nullable=True)
      
    
    
    # Relationships

  
    organizer = db.relationship('Users', backref='events', lazy=True)
    
    #language = db.relationship('Language', back_populates='events')
    journey_level = db.relationship('JourneyLevel', back_populates='events')
    images = db.relationship("EventImages", back_populates="event", cascade="all, delete-orphan")
    curriculums = db.relationship("EventCurriculum", back_populates="event", cascade="all, delete-orphan")
    tags = db.relationship("EventTags", back_populates="event", cascade="all, delete-orphan")
    facilities = db.relationship("EventFacilities", back_populates="event", cascade="all, delete-orphan")
    speakers = db.relationship("EventSpeakers", back_populates="event", cascade="all, delete-orphan")
    documents = db.relationship("EventDocuments", back_populates="event", cascade="all, delete-orphan")
    itineraries = db.relationship("EventItinerary", back_populates="event", cascade="all, delete-orphan")
    participants = db.relationship("Participant", back_populates="event", cascade="all, delete-orphan")
    payment_transactions = db.relationship("PaymentTransaction", back_populates="event", cascade="all, delete-orphan")
    attendances = db.relationship("ParticipantsAttendance", back_populates="event", cascade="all, delete-orphan")


    # Indexes and Constraints
    __table_args__ = (
        Index('ix_event_user_category', 'user_id', 'category_id'),
    ) 


class EventTitleAuditLog(db.Model):
    __tablename__ = 'event_title_audit_log'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    old_title = db.Column(db.String(255), nullable=True)
    new_title = db.Column(db.String(255), nullable=False)
    notification_count = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    event = db.relationship("Event", backref="title_audit_logs", lazy=True)


class EventGuestBookingSetting(db.Model):
    __tablename__ = 'event_guest_booking_setting'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, unique=True, index=True)
    enabled = db.Column(db.Boolean, nullable=False, default=True)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = db.relationship("Event", backref="guest_booking_setting", uselist=False, lazy=True)

    

class EventTicket(db.Model):
    __tablename__ = 'event_tickets'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=True,default=0)  
    available = db.Column(db.Integer, nullable=True, default=0)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    booked = db.Column(db.Integer, nullable=True, default=0)
    max_per_user = db.Column(db.Integer, nullable=False, default=1)
    
    # Relationship
    event = db.relationship("Event", backref="event_tickets", lazy=True)
    
    
  

class EventDate(db.Model):
    __tablename__ = 'event_date'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    
    # Relationship
    event = db.relationship("Event", backref="event_dates", lazy=True)
    
    

class EventDateTime(db.Model):
    __tablename__ = 'event_date_time'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_date_id = db.Column(db.Integer, db.ForeignKey('event_date.id'), nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    available = db.Column(db.Integer, nullable=True, default=0)
    booked = db.Column(db.Integer, nullable=True, default=0)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    
    # Relationship
    event_date = db.relationship("EventDate", backref="event_date_times", lazy=True)

 



class EventReminderDelivery(db.Model):
    """Atomic per-user/per-session claim for booking reminder delivery."""
    __tablename__ = 'event_reminder_delivery'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    event_date_time_id = db.Column(db.Integer, nullable=False, default=0)
    participant_id = db.Column(db.Integer, nullable=False, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    session_key = db.Column(db.String(64), nullable=False)
    reminder_kind = db.Column(db.String(8), nullable=False)
    scheduled_for_utc = db.Column(db.DateTime, nullable=False)
    notification_id = db.Column(db.Integer, nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint(
            'event_id',
            'session_key',
            'user_id',
            'reminder_kind',
            name='uq_event_reminder_delivery_session_user_kind',
        ),
    )


class Request_buddy(db.Model):
    __tablename__ = 'request_buddy'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Integer, nullable=True, default=1)#0-requested,1-requested,2-cancled
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    type = db.Column(db.Integer, nullable=True, default=1)  # 1 - buddy 2- session
    buddy_id = db.Column(db.Integer, nullable=False, default=0)
    date = db.Column(db.Date, nullable=True)
    time = db.Column(db.Time, nullable=True)
    meet_link = db.Column(db.Text, nullable=True)
    location_type = db.Column(db.SmallInteger, nullable=True)  # 0-online, 1-in person, 2-either
    location = db.Column(db.Text, nullable=True)
    duration_minutes = db.Column(db.Integer, nullable=True, default=60)
    status_reason = db.Column(db.Text, nullable=True)
    approved_on = db.Column(db.DateTime, nullable=True)
    completed_on = db.Column(db.DateTime, nullable=True)
    speaker_id = db.Column(db.Integer, nullable=True,default=0)
    user_comment = db.Column(db.Text, nullable=True)
    time_zone = db.Column(db.String(255), nullable=True)  
    meetlink_reminder_1d_sent = db.Column(db.Boolean, nullable=False, default=False)
    meetlink_reminder_30m_sent = db.Column(db.Boolean, nullable=False, default=False)
    
    event = db.relationship("Event", backref="request_buddy", lazy=True)
    user = db.relationship("Users", backref="request_buddy", lazy=True)
    
    


class Event_note(db.Model):
    __tablename__ = 'event_note'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    title = db.Column(db.String(255), nullable=True)
    
    # Relationship
    event = db.relationship("Event", backref="event_note", lazy=True)
    user = db.relationship("Users", backref="event_note", lazy=True)




class EventImages(db.Model):
    __tablename__ = 'event_images'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    cropped_image = db.Column(db.String(255), nullable=True)
    full_screen_image = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    
    # Relationship
    event = db.relationship("Event", back_populates="images")

class EventCurriculum(db.Model):
    __tablename__ = 'event_curriculum'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    ar_description = db.Column(db.Text, nullable=True)
    no_of_days = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    
    # Relationship
    event = db.relationship("Event", back_populates="curriculums")
    
    
class Answer_and_question(db.Model):
    __tablename__ = 'answer_and_question'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    organizer_id = db.Column(db.Integer, nullable=True, default=0)
    answer = db.Column(db.Text, nullable=True)
    question = db.Column(db.Text, nullable=True)
    event_id = db.Column(db.Integer, nullable=True, default=0)
    time_zone = db.Column(db.String(255), nullable=True)  
    is_anonymous = db.Column(db.Boolean, nullable=False, default=False, server_default=db.false())
    
    
    
    # Relationship
    user = db.relationship("Users", foreign_keys=[user_id])
    
    

class EventTags(db.Model):
    __tablename__ = 'event_tags'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), nullable=False, index=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    
    # Relationship
    event = db.relationship("Event", back_populates="tags")
    tag = db.relationship("Tag", back_populates="event_tags")

    # Constraints
    __table_args__ = (
        UniqueConstraint('event_id', 'tag_id', name='uq_event_tag'),
        Index('ix_event_tag', 'event_id', 'tag_id'),
    )

class EventFacilities(db.Model):
    __tablename__ = 'event_facilities'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    facilities_id = db.Column(db.Integer, db.ForeignKey('facilities.id'), nullable=False, index=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    
    # Relationship
    event = db.relationship("Event", back_populates="facilities")
    facility = db.relationship("Facilities", back_populates="event_facilities")

class EventSpeakers(db.Model):
    __tablename__ = 'event_speakers'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    first_name = db.Column(db.String(255), nullable=True)
    last_name = db.Column(db.String(255), nullable=True)
    image = db.Column(db.Text, nullable=True)
    
    # Relationship
    event = db.relationship("Event", back_populates="speakers")
    user = db.relationship("Users", backref="event_speakers", lazy=True)

class EventDocuments(db.Model):
    __tablename__ = 'event_documents'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    document_name = db.Column(db.String(255), nullable=True)
    ar_document_name = db.Column(db.String(255), nullable=True)
    file_path = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    
    # Relationship
    event = db.relationship("Event", back_populates="documents")



class EventDocumentsFiles(db.Model):
    __tablename__ = 'event_documents_files'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_document_id = db.Column(db.Integer, db.ForeignKey('event_documents.id'), nullable=False, index=True)
    file_path = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    
    # Relationship
    #event_document = db.relationship("EventDocuments", back_populates="files")



class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=True)
    ar_title = db.Column(db.String(250), nullable=True)
    status = db.Column(db.Integer, nullable=False, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)    
    position = db.Column(db.Integer, nullable=False, default=1)
    # Relationships
    event_tags = db.relationship('EventTags', back_populates='tag', lazy=True)


class Facilities(db.Model):
    __tablename__ = 'facilities'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=True)
    ar_title = db.Column(db.String(250), nullable=True)
    status = db.Column(db.Integer, nullable=False, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    position = db.Column(db.Integer, nullable=False, default=1)

    # Relationships
    event_facilities = db.relationship('EventFacilities', back_populates='facility', lazy=True)

class JourneyLevel(db.Model):
    __tablename__ = 'journey_level'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=True)
    ar_title = db.Column(db.String(250), nullable=True)
    status = db.Column(db.Integer, nullable=False, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    sub_title = db.Column(db.Text, nullable=True)
    ar_sub_title = db.Column(db.Text, nullable=True)
 
    events = db.relationship('Event', back_populates='journey_level', lazy=True)
 
class AwardLevel(db.Model):
    __tablename__ = 'award_level'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=True)
    ar_title = db.Column(db.String(250), nullable=True)
    attend_count = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.Integer, nullable=False, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    image = db.Column(db.String(255), nullable=True)
 
  
class Language(db.Model):
    __tablename__ = 'language'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=True)
    ar_title = db.Column(db.String(250), nullable=True)
    status = db.Column(db.Integer, nullable=False, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
 
 
class EventItinerary(db.Model):
    __tablename__ = 'event_itinerary'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    day = db.Column(db.Integer, nullable=False)  # Represents day 1, day 2, etc.
    title = db.Column(db.String(255), nullable=False)
    ar_title = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)

    # Relationship
    event = db.relationship("Event", back_populates="itineraries")



class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
 
 
class Participant(db.Model):
    __tablename__ = 'participant'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    paid_amount = db.Column(db.Numeric(10, 2), nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    qrcode = db.Column(LONGTEXT, nullable=True)
    qrcode_path = db.Column(LONGTEXT, nullable=True)
    ticket = db.Column(LONGTEXT, nullable=True)
    date = db.Column(Date, nullable=True)
    start_time = db.Column(Time, nullable=True)
    end_time = db.Column(Time, nullable=True)
    date_time_id = db.Column(Integer, nullable=True, default=0)
    quantity = db.Column(Integer, nullable=True, default=0)
    ticket_id = db.Column(Integer, nullable=True, default=0)
    parent_id = db.Column(Integer, nullable=True, default=0)
    scan_quantity = db.Column(Integer, nullable=True, default=0)
    status = db.Column(Integer, nullable=True, default=1)#0-notpaid,1-purchased,2-cancled,3-event deleted,4-org cancled,
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    
    # Relationships
    event = db.relationship("Event", back_populates="participants")
    user = db.relationship("Users", back_populates="participations")
    transactions = db.relationship("PaymentTransaction", back_populates="participant", cascade="all, delete-orphan")
    attendances = db.relationship("ParticipantsAttendance", back_populates="participant", cascade="all, delete-orphan")
    participantqrcodes = relationship("ParticipantQrcode", back_populates="participant")

 

class ParticipantQrcode(db.Model):
    __tablename__ = 'participant_qrcode'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('participant.id'), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    qrcode = db.Column(LONGTEXT, nullable=True)
    qrcode_path = db.Column(LONGTEXT, nullable=True)
    scan_quantity = db.Column(Integer, nullable=True, default=0)
    
    
    # Relationships
    participant = db.relationship("Participant", back_populates="participantqrcodes")
    #event = db.relationship("Event", back_populates="participantqrcodes")
    #user = db.relationship("Users", back_populates="participantqrcodes")

 
class PaymentTransaction(db.Model):
    __tablename__ = 'payment_transaction'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('participant.id'), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(10), nullable=False, default='USD')
    payment_method = db.Column(db.String(50), nullable=False)
    request_json = db.Column(db.Text, nullable=False)
    response_json = db.Column(db.Text, nullable=True)
    status = db.Column(db.SmallInteger, nullable=False, default=0)#0-pending-1-paid-2-failed-3-reverted
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    all_participant_id = db.Column(db.String(255), nullable=True)
    client_secret = db.Column(db.Text, nullable=True)
    payment_intent_id = db.Column(db.Text, nullable=True)
    response = db.Column(db.Text, nullable=True)
    payment_data = db.Column(db.Text, nullable=True)
    final_response = db.Column(db.Text, nullable=True)
    # Relationships
    participant = db.relationship("Participant", back_populates="transactions")
    event = db.relationship("Event", back_populates="payment_transactions", lazy=True)
    user = db.relationship("Users", back_populates="payment_transactions")



class Withdrawal(db.Model):
    _tablename_ = 'withdrawal'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    transaction_ids = db.Column(db.Text, nullable=False)  # Stores the IDs of the transactions
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    withdrawn_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # User who performed the withdrawal
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship("Users", foreign_keys=[user_id])
    withdrawn_by_user = db.relationship("Users", foreign_keys=[withdrawn_by])
    


class ParticipantsAttendance(db.Model):
    __tablename__ = "participants_attendance"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('participant.id'), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    attendance_date = db.Column(db.Date, nullable=False, index=True)  # Date for each attendance record
    status = db.Column(db.Integer, nullable=False, default=1)  # False indicates absence, True indicates presence
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    # Relationships
    participant = db.relationship("Participant", back_populates="attendances")
    event = db.relationship("Event", back_populates="attendances")



class ParticipantsQrcodeAttendance(db.Model):
    __tablename__ = "participants_qrcode_attendance"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    participants_qrcode_id = db.Column(db.Integer, db.ForeignKey('participant_qrcode.id'), nullable=False, index=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('participant.id'), nullable=False, index=True)
    attendance_date = db.Column(db.Date, nullable=False, index=True)  # Date for each attendance record
    status = db.Column(db.Integer, nullable=False, default=1)  # False indicates absence, True indicates presence
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    #participant = db.relationship("Participant", back_populates="attendances")





class Rating(db.Model):
    __tablename__ = 'rating'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    rating_value = db.Column(db.Float, nullable=True)
    review = db.Column(db.Text, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    to_user_id = db.Column(db.Integer, nullable=False, default=0)
    title = db.Column(db.Text, nullable=True)
    
    # Relationship
    event = db.relationship("Event", backref="rating", lazy=True)
    user = db.relationship("Users", backref="rating", lazy=True)


class Drafts(db.Model):
    __tablename__ = 'drafts'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    json_data = db.Column(db.Text, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    

class EventAnnouncements(db.Model):
    __tablename__ = 'event_announcements'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=True)
    message = db.Column(db.Text, nullable=True) 
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    
