from .. import db
from datetime import datetime
from sqlalchemy import Boolean, UniqueConstraint


class Users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, nullable=True)
    role_type = db.Column(db.Integer, nullable=False) #1-admin,2-customer,3-organizer,4-speaker,5-buddy
    admin_role_type = db.Column(db.String(150), nullable=True)
    role_id = db.Column(db.Integer, nullable=True)
    first_name = db.Column(db.String(150), nullable=True)
    last_name = db.Column(db.String(150), nullable=True)
    gender = db.Column(db.Integer, nullable=True)
    profile_image = db.Column(db.Text, nullable=True)
    country_code = db.Column(db.String(20), nullable=False)
    mobile_number = db.Column(db.String(100), nullable=False)
    email_id = db.Column(db.String(200), nullable=False, unique=False)
    password = db.Column(db.String(256), nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1) #-0-notverified,1-active,2-inactive,3-deleted,4-rejected
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    dob = db.Column(db.Date, nullable=True)
    journey_level_id = db.Column(db.Integer, db.ForeignKey('journey_level.id'), nullable=True,default=0)
    age = db.Column(db.Integer, nullable=True, default=0)
    show_events = db.Column(db.Integer, nullable=True, default=0)#1-yes
    show_course = db.Column(db.Integer, nullable=True, default=0)#1-yes
    show_reviews = db.Column(db.Integer, nullable=True, default=0)#1-yes
    show_journeylevel = db.Column(db.Integer, nullable=True, default=0)#1-yes
    show_awards = db.Column(db.Integer, nullable=True, default=0)#1-yes
    show_mobile_number = db.Column(db.Integer, nullable=True, default=0)#1-yes
    time_zone = db.Column(db.String(255), nullable=True)  

    # Relationships
  
    journey_level = db.relationship('JourneyLevel', backref='users', lazy=True)
    user_session = db.relationship('User_session', backref='users', lazy=False)  # One-to-one relationship with User_session
    permission = db.relationship('AdminPermission', backref='users', lazy=True)  # One-to-many relationship with AdminPermission
    participations = db.relationship("Participant", back_populates="user", cascade="all, delete-orphan")
    payment_transactions = db.relationship("PaymentTransaction", back_populates="user", cascade="all, delete-orphan")
    organizations = db.relationship("Organization", back_populates="user", lazy=True)
  

    
    
    
    
        
class User_session(db.Model):
    __tablename__ = "user_session"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Integer, nullable=False)
    token = db.Column(db.Text, nullable=False)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    lang = db.Column(db.Integer, nullable=False,default=0)
    push_token = db.Column(db.Text, nullable=True)
    
    
    
class Users_otp(db.Model):
    __tablename__ ="users_otp"
    id = db.Column(db.Integer, primary_key=True)
    role_type = db.Column(db.Integer,nullable=False)
    email_id = db.Column(db.String(200), nullable=True)
    mobile_number = db.Column(db.String(100), nullable=True)
    country_code = db.Column(db.String(20), nullable=True)
    otp = db.Column(db.String(20), nullable=False)
    status = db.Column(db.Integer, nullable=True, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    
class SocialAccounts(db.Model):
    _tablename_ = "social_accounts"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Foreign key linking to Users
    social_id = db.Column(db.String(200), nullable=False)  # Social media or Apple ID identifier
    social_provider = db.Column(db.String(50), nullable=False)  # facebook, google, apple
    social_access_token = db.Column(db.String(300), nullable=True)  # OAuth token for future API calls
    status = db.Column(db.Integer, nullable=True, default=1)  
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by =db.Column(db.Integer,nullable=False,default= 0)
    updated_by =db.Column(db.Integer,nullable=False,default= 0)
    
    
class Users_activity(db.Model):
    
    _tablename_ = "users_activity"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date=db.Column(db.Date, nullable=False)
    
class Membership(db.Model):
    _tablename_ = "membership"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    ar_title = db.Column(db.String(255), nullable=True)
    sub_title = db.Column(db.String(255), nullable=True)
    ar_sub_title = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    ar_description = db.Column(db.Text, nullable=True)
    duration_type = db.Column(db.SmallInteger, nullable=False,default= 0)  # 1 for day, 2 for month , 3 for year
    duration = db.Column(db.SmallInteger, nullable=True,default= 0)
    price = db.Column(db.Numeric(10, 2), nullable=True)  # Null for free events
    status = db.Column(db.Integer, nullable=True, default=1)  
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by =db.Column(db.Integer,nullable=False,default= 0)
    updated_by =db.Column(db.Integer,nullable=False,default= 0)
    
class UserMembership(db.Model):
    _tablename_ = "user_membership"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Foreign key linking to Users
    membership_id = db.Column(db.Integer, db.ForeignKey('membership.id'), nullable=False)  # Foreign key linking to membership
    purchased_on = db.Column(db.DateTime, nullable=True)  
    ends_on = db.Column(db.DateTime, nullable=True)  
    status = db.Column(db.Integer, nullable=True, default=1)  
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by =db.Column(db.Integer,nullable=False,default= 0)
    updated_by =db.Column(db.Integer,nullable=False,default= 0)



class Notification_History(db.Model):
    __tablename__ = 'notification_history'
    
    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.Integer, nullable=True)
    event_id = db.Column(db.Integer, nullable=True)#session request id for type 4,event id for other type
    push = db.Column(Boolean, nullable=False,default =False)
    sms = db.Column(Boolean, nullable=False,default =False)
    email = db.Column(Boolean, nullable=False,default =False)
    type = db.Column(db.SmallInteger, nullable=False)#3-requestBuddy,4-session,2-newevent,5-eventbooked,6-canclebooiing,7-eventupdate/announement/attendance,8-completedbooking,9-q&a
    title = db.Column(db.Text, nullable=True)
    message = db.Column(db.Text, nullable=True)
    send_to = db.Column(db.SmallInteger, nullable=False)
    task_id = db.Column(db.String(250), nullable=False)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, nullable=True,default=0)
    seen = db.Column(db.Integer, nullable=True,default=0)#1-seen
    status = db.Column(db.Integer, nullable=True,default=1)#3-deleted


class NotificationPreference(db.Model):
    """Per-user push preferences for typed inbox notifications.

    Missing rows intentionally mean enabled.  This keeps the migration
    additive for existing accounts while allowing each category to be
    switched off independently from the organiser Settings screen.
    """

    __tablename__ = "notification_preferences"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    notification_type = db.Column(db.SmallInteger, nullable=False)
    push_enabled = db.Column(Boolean, nullable=False, default=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "notification_type",
            name="uq_notification_preference_user_type",
        ),
    )
    
    



    


    
    

    
    


