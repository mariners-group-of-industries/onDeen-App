from app.models.users import Users, User_session,Users_otp,SocialAccounts,Users_activity,Notification_History,UserMembership,NotificationPreference
from app import db
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils.crypto_utils import encrypt_value, password_fingerprint
from sqlalchemy import or_,desc,func,and_
from app.models.event import Event,Participant,ParticipantsAttendance,AwardLevel,Rating
from app.utils.response_decorators import handle_repository_errors
import random
from app.utils.load_notification_template import load_push_notification_template
from app.utils.notification import send_push_notification
from app.utils.date_utils import normalize_date_value
from app.utils.public_links import public_open_url
from datetime import datetime, timedelta, timezone
import hashlib
import os

ENV = os.getenv("ENV")


def _env_truthy(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def _configured_test_otp(contact_type, contact_info):
    fixed_numbers = {
        item.strip()
        for item in os.getenv("ONDEEN_FIXED_OTP_NUMBERS", "").split(",")
        if item.strip()
    }

    # The fixed test OTP lets anyone sign in as any contact. It is only enabled
    # for staging, an explicit ONDEEN_TEST_OTP_ENABLED, or an explicit
    # ONDEEN_LOCAL=1 — never because a variable happens to be missing.
    if ENV == "staging" or _env_truthy("ONDEEN_TEST_OTP_ENABLED", os.getenv("ONDEEN_LOCAL", "0") == "1"):
        return os.getenv("ONDEEN_TEST_OTP_CODE", "123456")

    if contact_type == "mobile_number" and str(contact_info or "") in fixed_numbers:
        return os.getenv("ONDEEN_TEST_OTP_CODE", "123456")

    return None


class user:


    @staticmethod
    @handle_repository_errors
    def logout(session_id, bearer_token):
        user_session = db.session.query(User_session).filter(
            User_session.user_id == session_id, 
            User_session.token == bearer_token
        ).first()

        if user_session:
            db.session.delete(user_session)  # Correct way to delete the session
            db.session.commit()
            return user_session.id  # Optionally return the session ID that was deleted
        else:
            return None  # Handle case where no session was found
    
    
    @staticmethod
    @handle_repository_errors
    def delete_account(session_id):
        user = db.session.query(Users).filter(
            Users.id == session_id
        ).first()

        if user:
            user.status=3
            db.session.commit()
            return user.id  
        else:
            return None  
    
    
    @staticmethod
    @handle_repository_errors
    def add_user_activity(session_id):
        
        if session_id is not None:
            current_date = datetime.utcnow().date()
            existing_entry = db.session.query(Users_activity).filter(Users_activity.user_id == session_id,Users_activity.date == current_date).first()

            if not existing_entry:
                user_activity = Users_activity(user_id=session_id, date=current_date)
                db.session.add(user_activity)
                db.session.commit()
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def check_email(email_id):
        return db.session.query(Users).filter(Users.email_id == email_id).first()
    
    
    @staticmethod
    @handle_repository_errors
    def check_social_id(id, provider=None, role_type=None):
        query = db.session.query(SocialAccounts).join(
            Users,
            Users.id == SocialAccounts.user_id,
        ).filter(
            SocialAccounts.social_id == id,
            Users.status != 3,
        )

        if provider:
            query = query.filter(SocialAccounts.social_provider == provider)
        if role_type:
            query = query.filter(Users.role_type == role_type)

        return query.first()
    
    @staticmethod
    @handle_repository_errors
    def email_check(email_id, role_type):
        return db.session.query(Users).filter(
            Users.email_id == email_id,
            Users.role_type == role_type,
            Users.status != 3
        ).first()
        
    @staticmethod
    @handle_repository_errors
    def email_check_parent(email_id, role_type, session_id):
        return db.session.query(Users).filter(
            Users.email_id == email_id,
            Users.role_type == role_type,
            Users.parent_id == session_id,
            Users.status != 3
        ).first()
        
    @staticmethod    
    @handle_repository_errors
    def email_check_update(email_id, role_type, user_id):
        return db.session.query(Users).filter(
            Users.email_id == email_id,
            Users.role_type == role_type,
            Users.status != 3,
            Users.id != user_id  # Exclude the current user by ID
        ).first()
 
    @staticmethod    
    @handle_repository_errors
    def email_check_update_parent(email_id, role_type, user_id,session_id):
        return db.session.query(Users).filter(
            Users.email_id == email_id,
            Users.role_type == role_type,
            Users.parent_id == session_id,
            Users.status != 3,
            Users.id != user_id  # Exclude the current user by ID
        ).first()

    @staticmethod
    @handle_repository_errors
    def mobile_check_update(mobile_number, role_type, user_id,country_code):
        
        return db.session.query(Users.id, Users.password, Users.status, Users.role_type).filter(
            Users.mobile_number == mobile_number,
            Users.role_type == role_type,
            Users.id != user_id, # Exclude the current user by ID
            Users.status != 3,
            Users.country_code ==country_code 
        ).first()
        
    @staticmethod
    @handle_repository_errors
    def mobile_check_update_parent(mobile_number, role_type, user_id,country_code,session_id):
        
        return db.session.query(Users.id, Users.password, Users.status, Users.role_type).filter(
            Users.mobile_number == mobile_number,
            Users.parent_id == session_id,
            Users.role_type == role_type,
            Users.id != user_id, # Exclude the current user by ID
            Users.status != 3,
            Users.country_code ==country_code 
        ).first()
        
    @staticmethod
    @handle_repository_errors
    def mobile_check(mobile_number, role_type, country_code):
        return db.session.query(Users.id, Users.password, Users.status).filter(
            Users.status != 3,  # Assuming status == 1 is a minority case, short-circuit here
            Users.mobile_number == mobile_number,
            Users.role_type == role_type,
            Users.country_code == country_code
        ).first()
         
    @staticmethod
    @handle_repository_errors
    def mobile_check_parent(mobile_number, role_type, country_code,session_id):
        return db.session.query(Users.id, Users.password, Users.status).filter(
            Users.status != 3,  # Assuming status == 1 is a minority case, short-circuit here
            Users.mobile_number == mobile_number,
            Users.parent_id == session_id,
            Users.role_type == role_type,
            Users.country_code == country_code
        ).first()
        
    @staticmethod
    @handle_repository_errors
    def check_password_only(email_id, password, role_type):
        user = db.session.query(Users.id, Users.password,Users.first_name,Users.last_name, Users.status, Users.role_type,Users.parent_id).filter(
            Users.role_type == role_type,
            Users.email_id == email_id,
            Users.status != 3
        ).first()

        if user and check_password_hash(user.password, password):
            return user
        return {"error": "is_error"}
        
    @staticmethod
    @handle_repository_errors
    def check_password(email_id, password, role_type):
        user = db.session.query(Users.id, Users.password,Users.first_name,Users.last_name, Users.status, Users.role_type,Users.parent_id).filter(
            Users.role_type == role_type,
            Users.email_id == email_id,
            Users.status == 1
        ).first()
        if user and check_password_hash(user.password, password):
            return user
        return {"error": "is_error"}
        
    @staticmethod
    @handle_repository_errors
    def check_password_with_mobile(mobile_number, password, role_type):
        user = db.session.query(Users.id, Users.password, Users.status, Users.role_type).filter(
            Users.role_type == role_type,
            Users.mobile_number == mobile_number,
            Users.status == 1
        ).first()
        if user and check_password_hash(user.password, password):
            return user
        return {"error": "is_error"}
    
    @staticmethod
    @handle_repository_errors
    def verify_current_password(user_obj, password):
        user = db.session.query(Users).filter(Users.id == user_obj.id).first()
        if user and check_password_hash(user.password, password):
            return user
        return 
    
    @staticmethod
    @handle_repository_errors
    def auth_check(user_id):    
        user = db.session.query(Users).filter(
            Users.id == user_id,
            Users.status.in_([0, 1, 4])
        ).first()
        if user:
            return {'id': user.id,'status': user.status, 'password': user.password}
        return {"error": "is_error"}
        
    @staticmethod
    @handle_repository_errors
    def token_check(token):
        token = db.session.query(User_session).filter(
            User_session.token == token
        ).first()
        if token:
            return {"user_id": token.user_id}
        return {"error": "is_error"}
        
        
    
    @staticmethod
    @handle_repository_errors
    def register_user(data, role_type):
        user = Users(
            role_type=role_type,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email_id=data.get('email_id'),
            password=generate_password_hash(data.get('password', ''), method='pbkdf2:sha256'),
            mobile_number=data.get('mobile_number'),
            country_code=data.get('country_code'),
            journey_level_id=data.get('journey_level_id','0'),
            gender=data.get('gender',0),
            age=data.get('age',0),
            status=data.get('status', 1),
            profile_image=data.get('profile_image',''),
            dob=normalize_date_value(data.get('dob'))
        )
        db.session.add(user) 
        db.session.commit() 
        return user
    
    
    
    
    @staticmethod
    @handle_repository_errors
    def user_count(role_type):
        
        
        count = db.session.query(func.count(Users.id)).filter(Users.status == 0,Users.role_type == role_type).scalar()
         
        
        
        return count
    
    
    
    
        
    @staticmethod
    @handle_repository_errors
    def customer_profile(user_id):
        current_time = datetime.utcnow()
        user = db.session.query(Users).filter(
            Users.id == user_id,
            Users.status == 1
        ).first()            
        if user:
            
            
              # Event counts by type
            event_type_1_count = (
                db.session.query(func.count(Event.id))
                .join(Participant, Participant.event_id == Event.id)  # Join Event -> Participant
                .join(ParticipantsAttendance, ParticipantsAttendance.participant_id == Participant.id)  # Join Participant -> ParticipantsAttendance
                .filter(
                    Participant.user_id == user_id,  # Filter for specific user ID
                    Event.category_id == 1,
                    ParticipantsAttendance.status == 1
                    # Filter for category ID 1
                )
                .scalar()
            )
            
            event_type_2_count = (
                db.session.query(func.count(Event.id))
                .join(Participant, Participant.event_id == Event.id)  # Join Event -> Participant
                .join(ParticipantsAttendance, ParticipantsAttendance.participant_id == Participant.id)  # Join Participant -> ParticipantsAttendance
                .filter(
                    Participant.user_id == user_id,  # Filter for specific user ID
                    Event.category_id == 2,
                    ParticipantsAttendance.status == 1
                    # Filter for category ID 1
                )
                .scalar()
            )
            
            event_type_3_count = (
                db.session.query(func.count(Event.id))
                .join(Participant, Participant.event_id == Event.id)  # Join Event -> Participant
                .join(ParticipantsAttendance, ParticipantsAttendance.participant_id == Participant.id)  # Join Participant -> ParticipantsAttendance
                .filter(
                    Participant.user_id == user_id,  # Filter for specific user ID
                    Event.category_id == 3,
                    ParticipantsAttendance.status == 1
                    # Filter for category ID 1
                )
                .scalar()
            )
            
            rating_count = (
                db.session.query(func.count(Rating.id))
                .filter(Rating.to_user_id == user_id)
                .scalar()
            )
            avg_rating = (
                db.session.query(func.avg(Rating.rating_value))
                .filter(Rating.to_user_id == user_id)
                .scalar()
            )
            membership_count = (
                db.session.query(func.count(UserMembership.id))
                .filter(UserMembership.user_id == user_id,UserMembership.status==1).filter(UserMembership.ends_on >= current_time)
                .scalar()
            )
                 
            return {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile_image": user.profile_image,
                "email_id": user.email_id,
                "gender": user.gender,
                "age": user.age,
                "dob": user.dob.isoformat() if user.dob else None,
                "journey_level_id": user.journey_level_id,
                "journey_level_title": user.journey_level.title if user.journey_level else None,
                "country_code": user.country_code,
                "mobile_number": user.mobile_number,
                "show_events": user.show_events,
                "show_course": user.show_course,
                "show_reviews": user.show_reviews,
                "show_journeylevel": user.show_journeylevel,
                "show_awards": user.show_awards,
                "show_mobile_number": user.show_mobile_number,
                "status": user.status,
                "created_on": user.created_on.strftime('%Y-%m-%d %H:%M:%S'),
                "membership_count": membership_count,
                "rating_count": rating_count,
                "avg_rating": avg_rating,
                "event_count": event_type_1_count,
                "course_count": event_type_2_count,
                "tour_count": event_type_3_count
            }
        return {"error": "is_error"}
    
    @staticmethod
    @handle_repository_errors
    def get_avg_rating(user_id):
        return db.session.query(func.avg(Rating.rating_value)).filter(Rating.to_user_id == user_id).scalar()
        
    @staticmethod
    @handle_repository_errors
    def get_rating_count(user_id):
        return db.session.query(func.count(Rating.id)).filter(Rating.to_user_id == user_id).scalar()
    
    @staticmethod
    @handle_repository_errors
    def generate_token(user, role_type, auth_method="password"):
        # auth_method records how this session was established ("password",
        # "otp", "social"). change_password uses it to allow a reset without the
        # old password only right after an OTP verification.
        
        expiration_time = timedelta(days=30)
        encrypted_user_id = encrypt_value(user.id)
        encrypted_parent_id = encrypt_value(user.parent_id) if user.parent_id else None
    

        
        access_token = create_access_token(
            identity=encrypted_user_id, 
            expires_delta=expiration_time,
            additional_claims={
                "token_type": "login",
                "auth_method": auth_method,
                "pwd_fp": password_fingerprint(user.password),
                "status": user.status,
                "role_type": role_type,
                "custom_claims": encrypted_user_id,
                "parent_id":encrypted_parent_id
            }
        )
        
        
        
        
        if access_token:
            user_session = User_session(user_id=user.id, token=access_token, type=user.role_type)
            db.session.add(user_session)
            db.session.commit()
            return access_token
        
        return {"error": "is_error"}
        
    @staticmethod
    @handle_repository_errors
    def update_profile(data, user_id):
        user = db.session.query(Users).filter(Users.id == user_id).first()
        if not user:
            return {"error": "is_error"}
        
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'profile_image' in data:
            user.profile_image = data['profile_image']
        if 'email_id' in data and data['email_id']:
            user.email_id = data['email_id']
        if 'country_code' in data and data['country_code']:
            user.country_code = data['country_code']
        if 'mobile_number' in data and data['mobile_number']:
            user.mobile_number = data['mobile_number']
        if 'journey_level_id' in data:
            user.journey_level_id = data['journey_level_id']
        if 'gender' in data:
            user.gender = data['gender']
        if 'age' in data:
            user.age = data['age']
        if 'status' in data:
            user.status = data['status']
        if 'password' in data and data['password']:
            user.password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        if 'dob' in data:
            user.dob = normalize_date_value(data['dob'])
        user.updated_by = user_id
        db.session.commit()
        return user.id
     
    @staticmethod
    @handle_repository_errors
    def seen_notification(data, user_id):
        if data.get("id",0):
            user = db.session.query(Notification_History).filter(Notification_History.user_id == user_id,Notification_History.id == data.get("id")).first()
            if not user:
                return {"error": "is_error"}
            
            user.seen = 1
            db.session.commit()
            return user.id
        else :                     
            db.session.query(Notification_History).filter(
                Notification_History.user_id == user_id,
                Notification_History.status != 3
            ).update({Notification_History.seen: 1}, synchronize_session=False)

            db.session.commit()
            return user_id
     
    @staticmethod
    @handle_repository_errors
    def delete_nitification(data, user_id):
        # if data.get("id",0):
            # user = db.session.query(Notification_History).filter(Notification_History.user_id == user_id,Notification_History.id == data.get("id")).first()
            # if not user:
                # return {"error": "is_error"}
            
            # user.seen = 3
            # db.session.commit()
            # return user.id
        # else :                     
            # db.session.query(Notification_History).filter(
                # Notification_History.user_id == user_id,
                # Notification_History.status != 3
            # ).update({Notification_History.seen: 3}, synchronize_session=False)

            # db.session.commit()
            # return user_id
            
            
        delete_all = data.get("delete_all", 0)
        id = int(data.get("id", 0))
        if delete_all or id==0:
            db.session.query(Notification_History).filter(
                Notification_History.user_id == user_id,Notification_History.status != 3
            ).update({"status": 3})
            db.session.commit()
            return {"message": "all_deleted"}

        user = db.session.query(Notification_History).filter(Notification_History.user_id == user_id,Notification_History.id == data.get("id",0)).first()
        if not user:
            return {"error": "is_error"}
        
        user.status = 3
        db.session.commit()
        return user.id
     
    @staticmethod
    @handle_repository_errors
    def get_new_notification_count(session_id):
        unseen_count = db.session.query(Notification_History).filter(
            Notification_History.user_id == session_id,
            Notification_History.status != 3,
            Notification_History.seen == 0
        ).count() or 0
        return unseen_count
     
    @staticmethod
    @handle_repository_errors
    def update_privacy(data, user_id):
        user = db.session.query(Users).filter(Users.id == user_id).first()
        if not user:
            return {"error": "is_error"}
        
        if 'show_events' in data:
            user.show_events = data['show_events']
        if 'show_course' in data:
            user.show_course = data['show_course']
        if 'show_reviews' in data:
            user.show_reviews = data['show_reviews']
        if 'show_awards' in data:
            user.show_awards = data['show_awards']
        if 'show_mobile_number' in data:
            user.show_mobile_number = data['show_mobile_number']
        if 'show_journeylevel' in data:
            user.show_journeylevel = data['show_journeylevel']
        user.updated_by = user_id
        db.session.commit()
        return user.id
     
    @staticmethod
    @handle_repository_errors
    def update_user_password(user_obj, password):
        user = db.session.query(Users).filter(Users.id == user_obj.id).first()
        if not user:
            return         
        user.password = generate_password_hash(password, method='pbkdf2:sha256')
        user.updated_by = user_obj.id
        db.session.commit()
        return user.id
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_award_level(attended_count):        
        query = db.session.query(AwardLevel).filter(
            AwardLevel.status == 1
        )
        query = query.order_by(AwardLevel.attend_count.asc())     
        awards = query.all()
        
        if not awards:
            return []

        awarddd_list = []
        set_remaining_to_zero = False
        for award in awards:
            if set_remaining_to_zero:
                attend_count_value = 0
            else:
                if attended_count >= award.attend_count:
                    attend_count_value = 100
                elif award.attend_count > 0:
                    attend_count_value = attended_count * 100 // award.attend_count
                    if 0 < attend_count_value < 100:
                        set_remaining_to_zero = True
                else:
                    attend_count_value = 0
            awarddd = {
                "id":award.id,
                "image": award.image,
                "title": award.title,
                "attend_count": attend_count_value
            }
            awarddd_list.append(awarddd)
            
        return awarddd_list
        
        
      
    @staticmethod
    @handle_repository_errors
    def get_all_users(data, per_page):
        
        last_login_subquery = db.session.query(
            Users_activity.user_id,
            db.func.max(Users_activity.date).label('last_login_date')
        ).group_by(Users_activity.user_id).subquery() 
        
        
        query = db.session.query(Users.id,Users.first_name, Users.last_name, Users.email_id, Users.country_code, Users.mobile_number, Users.status, Users.created_on,last_login_subquery.c.last_login_date).outerjoin(last_login_subquery, Users.id == last_login_subquery.c.user_id).filter(
            Users.role_type == 2
        )
        
        if 'search_key' in data and data['search_key']:
            search_key = f"%{data['search_key']}%"
            query = query.filter(or_(
                (Users.first_name + " " + Users.last_name).ilike(search_key),
                Users.email_id.ilike(search_key),
                Users.mobile_number.ilike(search_key)
            ))      
        
        query = query.order_by(Users.created_on.desc())     
        query = query.paginate(page=data.get('page', 1), per_page=per_page, error_out=False)
        users = query.items
        
        if not users:
            return {"error": "is_error"}

        users_list = []
        for user in users:
            user_details = {
                "id":user.id,
                "full_name": f"{user.first_name} {user.last_name}",
                "email_id": user.email_id,
                "country_code": user.country_code,
                "mobile_number": user.mobile_number,
                "status": user.status,
                "created_on": user.created_on.strftime('%Y-%m-%d %H:%M:%S'),
                "last_login_date": user.last_login_date.strftime('%Y-%m-%d') if user.last_login_date else None
            }
            users_list.append(user_details)
            
        return {
            'users': users_list,
            'pagination_meta': {
                'total': query.total,
                'pages': query.pages,
                'current_page': query.page,
                'per_page': query.per_page
            }
        }
        
    @staticmethod
    @handle_repository_errors
    def delete_user(user_id, session_id):
        user = db.session.query(Users).filter(Users.id == user_id).first()
        if not user:
            return {"error": "is_error"}
        
        user.status = 3
        user.updated_by = session_id
        db.session.commit()
        return True



    @staticmethod
    @handle_repository_errors
    def send_otp(request_data, role_type):
        # Secure OTP generation: Generates a 4-digit random OTP securely
        # mobile_otp = ''.join(random.SystemRandom().choice('0123456789') for _ in range(6))
        # if request_data.get('mobile_number') == '555999120':
        #     mobile_otp = 123456
        # Create the OTP entry for the user

        if 'mobile_number' in request_data:
            contact_info = request_data.get('mobile_number')
            contact_type = 'mobile_number'
        else:
            contact_info = request_data.get('email_id')
            contact_type = 'email_id'

        mobile_otp = _configured_test_otp(contact_type, contact_info)
        if not mobile_otp:
            mobile_otp = ''.join(random.SystemRandom().choice('0123456789') for _ in range(6))  # Random OTP for live

        time_limit = datetime.utcnow() - timedelta(minutes=10)
        otp_count = db.session.query(Users_otp).filter(
            and_(
                # Match mobile OR email based on usage
                Users_otp.mobile_number == (contact_info if contact_type == 'mobile_number' else None),
                Users_otp.email_id == (contact_info if contact_type == 'email_id' else None),
                Users_otp.created_on >= time_limit
            )
        ).count()

        if otp_count >= 5:
            return "limit"

        insert_otp = Users_otp(
            role_type=role_type,
            mobile_number=contact_info if contact_type == 'mobile_number' else None,
            email_id=contact_info if contact_type == 'email_id' else None,
            country_code=request_data.get('country_code') if contact_type == 'mobile_number' else None,
            otp=mobile_otp,
            status=0,   # OTP not used yet
            created_on=datetime.utcnow()  # Timestamp for creation
        )
         
        # Insert into the database
        db.session.add(insert_otp)
        db.session.commit()

        # Return the generated OTP ID or the OTP itself for further processing
        return insert_otp  # Or you could return {'otp': mobile_otp} for testing or logging purposes
          
        
        
            
    @staticmethod
    @handle_repository_errors
    def verify_otp(mobile_number, otp, role_type, country_code):
        expiry_time = datetime.utcnow() - timedelta(minutes=5)
        otp_record = (
            db.session.query(Users_otp)
            .filter(
                Users_otp.mobile_number == mobile_number,
                Users_otp.role_type == role_type,
                Users_otp.status == 0,
                Users_otp.country_code == country_code,
                Users_otp.otp == otp,
                Users_otp.created_on >= expiry_time  # Check OTP validity window
            )
            .limit(1)
            .first()
        )


        if otp_record:
                otp_record.status = 1
                db.session.commit()  # Committing OTP update
                return otp_record
           

        return {"error": "is_error"}
    



    @staticmethod
    @handle_repository_errors
    def email_verify_otp(email_id, otp, role_type):
        
        #service  - customer app - CustomerService
        #                        - CustomerService - verify_otp  
        
        expiry_time = datetime.utcnow() - timedelta(minutes=5)
        otp_record = (
            db.session.query(Users_otp)
            .filter(
                Users_otp.role_type == role_type,
                Users_otp.status == 0,
                Users_otp.otp == otp,
                Users_otp.email_id == email_id,
                Users_otp.created_on >= expiry_time  # Check OTP validity window
            )
            .limit(1)
            .first()
        )

        if otp_record:
                otp_record.status = 1
                db.session.commit()  # Committing OTP update
                return otp_record
           

        return {"error": "is_error"}
    
    
    
    @staticmethod
    @handle_repository_errors
    def recheck_otp(mobile_number, otp, role_type, country_code):
        result = (
            db.session.query(Users_otp)
            .filter_by(
                mobile_number=mobile_number,
                otp=otp,
                role_type=role_type,
                country_code=country_code,
                status=1
            )
            .order_by(Users_otp.created_on.desc())  
            .first()  # Get the first result from the ordered query
        )
        return result
    
    
    @staticmethod
    @handle_repository_errors
    def get_user(mobile_number,role_type,country_code):
        result = db.session.query(Users).filter( 
            Users.status != 3,            
            Users.country_code ==country_code,
            Users.mobile_number ==mobile_number,
            Users.role_type==role_type
        ).order_by(Users.created_on.desc()).first()
        return result
    

    @staticmethod
    @handle_repository_errors
    def get_user_email(email_id,role_type):
        result = db.session.query(Users).filter(Users.email_id ==email_id,Users.role_type==role_type,Users.status==1).first()
        return result
    
    @staticmethod
    @handle_repository_errors
    def get_userby_id(user_id):
        result = db.session.query(Users).filter(Users.id==user_id).first()
        return result
    
    
    
    @staticmethod
    @handle_repository_errors
    def add_user_by_social_id(social_id,token, provider,user_id):
        """
        Fetch a user by social ID and provider.
        :param social_id: str - The social media ID of the user
        :param provider: str - The social media provider ('facebook', 'google', 'apple')
        :return: User object or None
        """
        safe_token = None
        if token:
            token = str(token)
            safe_token = token
            if len(token) > 300:
                safe_token = f"sha256:{hashlib.sha256(token.encode('utf-8')).hexdigest()}"

        socialaccount = db.session.query(SocialAccounts).filter(
            SocialAccounts.user_id == user_id,
            SocialAccounts.social_id == str(social_id),
            SocialAccounts.social_provider == provider,
        ).first()

        if socialaccount:
            socialaccount.social_access_token = safe_token
            socialaccount.status = 1
            socialaccount.updated_on = datetime.utcnow()
            socialaccount.updated_by = user_id
        else:
            socialaccount = SocialAccounts(
                user_id=user_id,
                social_id=str(social_id),
                social_provider=provider,
                social_access_token=safe_token,
                created_by=user_id,
                updated_by=user_id,
            )
            db.session.add(socialaccount)
        db.session.commit() 
        return socialaccount
    



    @staticmethod
    @handle_repository_errors
    def insert_push_token(token,request_data):
        usersession = db.session.query(User_session).filter(User_session.token == token).first()
    
        usersession.push_token = request_data['push_token']

        if usersession:

            current_time = datetime.now(timezone.utc)  
            valid_time_range = timedelta(minutes=10)
            # Ensure session.created_on is treated as UTC (if stored as naive datetime)
            created_on_time = usersession.created_on.replace(tzinfo=timezone.utc)
            time_difference = current_time - created_on_time

            if time_difference <= valid_time_range:
                user_detail =  user.get_user_detail(usersession.user_id)
                

                if user_detail is not None:

                    full_name = f"{user_detail.first_name} {user_detail.last_name}"
                    title,message = load_push_notification_template("customer_registration",CUSTOMER_NAME=full_name)
                    customer_notification_data = {
                        "registration_token": request_data['push_token'],
                        "title": title,
                        "body": message,
                        "type": 1
                    }

                    send_push_notification(**customer_notification_data)

        db.session.commit()


    

    @staticmethod
    def get_user_detail(user_id):
        current_time = datetime.utcnow()  
        one_minute_earlier = current_time - timedelta(minutes=5)  

        user = db.session.query(Users).filter(Users.id == user_id,Users.role_type == 2,and_(Users.created_on >= one_minute_earlier,Users.created_on <= current_time)).first()

        return user





    @staticmethod
    @handle_repository_errors
    def get_notifications(session_id,request_data):
        query = db.session.query(Notification_History.id,Notification_History.event_id,Notification_History.type,Notification_History.title,Notification_History.message,Notification_History.created_on,Notification_History.seen).filter(
            Notification_History.user_id == session_id,
            Notification_History.status != 3
        )
        if request_data.get("seen"):
            query=query.filter(Notification_History.seen != 1)
        
        query=query.order_by(Notification_History.created_on.desc())

        push_tokens = [
            {
                "id": session.id,
                "event_id": session.event_id,
                "type": session.type,
                "title": session.title,
                "message": session.message,
                "created_on": session.created_on,
                "seen": session.seen,
                "link_url": user.notification_link_url(session.type, session.event_id),
            }
            for session in query.all()
        ]

        return push_tokens if push_tokens else None 

    @staticmethod
    def notification_link_url(notification_type, event_id):
        if event_id and notification_type in (2, 3, 5, 6, 7, 8, 9):
            return public_open_url(event_id)
        return None
    


    @staticmethod
    @handle_repository_errors
    def update_seen_notifications(session_id):
        db.session.query(Notification_History).filter(
            Notification_History.user_id == session_id,
            Notification_History.status != 3
        ).update({Notification_History.seen: 1}, synchronize_session=False)

        db.session.commit()


        return  None 
    


    @staticmethod
    @handle_repository_errors
    def push_notifications_enabled(session_id, notification_type=None):
        """Return whether this user accepts a typed push notification.

        A missing preference row means enabled for backwards compatibility;
        inbox history is still written by callers regardless of this result.
        """
        if notification_type is None:
            return True
        from app.services.notification_preference_storage import ensure_notification_preference_storage
        ensure_notification_preference_storage()
        preference = NotificationPreference.query.filter_by(
            user_id=session_id,
            notification_type=int(notification_type),
        ).first()
        return True if preference is None else bool(preference.push_enabled)

    @staticmethod
    @handle_repository_errors
    def get_push_token(session_id, notification_type=None):
        if not user.push_notifications_enabled(session_id, notification_type):
            return None
        query = db.session.query(User_session.push_token).filter(
            User_session.user_id == session_id,
            User_session.push_token.isnot(None),
            User_session.push_token != ""
        ).order_by(User_session.created_on.desc(), User_session.id.desc())

        seen = set()
        push_tokens = []
        for session in query.all():
            if session.push_token in seen:
                continue
            seen.add(session.push_token)
            push_tokens.append(session.push_token)

        return push_tokens if push_tokens else None 
    

    @staticmethod
    @handle_repository_errors
    def get_all_push_tokens():
        user_sessions = db.session.query(User_session.user_id, User_session.push_token).filter(User_session.type==2,User_session.push_token.isnot(None),User_session.push_token != "").order_by(User_session.created_on.desc(), User_session.id.desc()).all()
        seen = set()
        push_tokens = []
        for session in user_sessions:
            if session.push_token in seen:
                continue
            seen.add(session.push_token)
            push_tokens.append({"user_id": session.user_id, "push_token": session.push_token})
        return push_tokens 
    


    @staticmethod
    @handle_repository_errors
    def get_event_push_tokens(event_id, notification_type=None):
        user_sessions = db.session.query(User_session.user_id, User_session.push_token).join(
            Participant,
            Participant.user_id == User_session.user_id,
        ).join(
            Users,
            Users.id == User_session.user_id,
        ).filter(
            User_session.type == 2,
            User_session.push_token.isnot(None),
            User_session.push_token != "",
            Participant.id > 0,
            Participant.event_id == event_id,
            Participant.status == 1,
            Users.status == 1,
        ).order_by(User_session.created_on.desc(), User_session.id.desc()).all()
        seen = set()
        push_tokens = []
        preference_cache = {}
        for session in user_sessions:
            if notification_type is not None:
                if session.user_id not in preference_cache:
                    preference_cache[session.user_id] = user.push_notifications_enabled(
                        session.user_id,
                        notification_type,
                    )
                if not preference_cache[session.user_id]:
                    continue
            if session.push_token in seen:
                continue
            seen.add(session.push_token)
            push_tokens.append({"user_id": session.user_id, "push_token": session.push_token})
        return push_tokens 

    @staticmethod
    @handle_repository_errors
    def get_event_booked_user_ids(event_id):
        rows = db.session.query(Participant.user_id).join(
            Users,
            Users.id == Participant.user_id,
        ).filter(
            Participant.event_id == event_id,
            Participant.status == 1,
            Users.status == 1,
        ).distinct().order_by(Participant.user_id.asc()).all()
        return [row.user_id for row in rows]
    


    @staticmethod
    def create_notification_history(participant_id, event_id, push, sms, email, type, send_to, task_id,title,message,user_id=0):
        notification_history = Notification_History(
            user_id=user_id,
            participant_id=participant_id,
            event_id=event_id,
            push=push,
            sms=sms,
            email=email,
            type=type,
            send_to=send_to,
            task_id=task_id,
            title = title,
            message = message,
            created_on=datetime.utcnow()
        )
        
        db.session.add(notification_history)
        db.session.commit()
        return notification_history
