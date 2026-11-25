from app.repositories.user import user
from app.repositories.event import EventRepo
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from app.repositories.speakers import SpeakerRepository
from app.repositories.buddy import BuddyRepository
from app.repositories.organizer import OrganizerRepository
from werkzeug.security import generate_password_hash
from flask import request
from app.utils.notification import send_sms,send_email
from app import db
from app.models.speakers import SpeakerAvailabilityDate
from datetime import datetime
import os
class SpeakerService:
    per_page = 10  # Define a constant for the default number of records per page in pagination

    @staticmethod
    @handle_service_errors
    def send_otp(request_data,role_type):
        if 'mobile_number' in request_data and request_data['mobile_number']:    
            users = user.mobile_check(request_data['mobile_number'], role_type,request_data['country_code'])
 
        is_register = True if users else False
        if users and users.status in [2, 3]:
            raise ServiceError('User is inactive')
    
        otp_entry = user.send_otp(request_data, role_type)

        if not otp_entry:
            raise ServiceError('Failed to generate OTP')

        if isinstance(otp_entry, str) and otp_entry == 'limit':
            raise ServiceError('OTP limit exceeded. You can request only 5 OTPs every 10 minutes')

        otp_code = otp_entry.otp
        country_code = request_data.get('country_code', '')
        mobile_number = request_data.get('mobile_number', '')

        # Send OTP via SMS
        send_sms(country_code, mobile_number, otp_code)


        return {
            'message': 'OTP sent successfully',
            'is_register': is_register
        }
       
       
    @staticmethod
    @handle_service_errors
    def verify_otp(request_data,role_type):
        if 'mobile_number' in request_data and request_data['mobile_number']:       
            otp_record = user.verify_otp(request_data['mobile_number'], request_data['otp'],role_type,request_data['country_code'])
            
            
            

            if isinstance(otp_record, dict) and 'error' in otp_record:
               raise ServiceError('Invalid OTP')
                
            register_users=user.get_user(request_data['mobile_number'],role_type,request_data['country_code'])
            if not register_users:
                return {'message': 'OTP verified successfully', 'is_register': False}
            
      
                
            if register_users.status in [2, 3]:
                raise ServiceError('User is inactive')
            
            
            speaker = SpeakerRepository.get_user_by_id(register_users.id)
            
                        
            access_token = user.generate_token(register_users,role_type)
                    
            return {'message': 'OTP verified successfully', 'access_token': access_token, 'is_register': True,'user_profile_image': register_users.profile_image,'speaker_first_name': speaker.first_name,'speaker_last_name': speaker.last_name,'user_email_id': register_users.email_id,'user_status': register_users.status}
        



    @staticmethod
    @handle_service_errors
    def email_send_otp(request_data,role_type):
        """
        Validate email, check user status, generate OTP, and send email in the background.
        """
        if 'email_id' not in request_data or not request_data['email_id']:
            raise ServiceError('invalid_email_id')

        # Check user status
        users = user.email_check(request_data['email_id'], role_type)
        is_register = True if users and users.status == 1 else False

        if users and users.status in [2, 3]:
            raise ServiceError('user is in active')

        # Generate OTP
        otp_sent = user.send_otp(request_data, role_type)
        if not otp_sent:
             raise ServiceError('Failed to generate OTP')

        if isinstance(otp_entry, str) and otp_entry == 'limit':
            raise ServiceError('OTP limit exceeded. You can request only 5 OTPs every 10 minutes')

        # email_id = otp_sent['email_id']
        # otp = otp_sent['otp']
        
        # subject, body = load_email_template("login_otp", OTP=otp)

        # notification_data = {
        #     "email_id": email_id,
        #     "subject": subject,
        #     "body": body
        # }
        # threading.Thread(target=send_async_email, args=(notification_data,)).start()   
        
        return {
            'message': 'OTP sent successfully',
            'is_register': is_register
        }
    

    @staticmethod
    @handle_service_errors
    def email_verify_otp(request_data,role_type):
        if 'email_id' in request_data and request_data['email_id']:       
            otp_record = user.email_verify_otp(request_data['email_id'], request_data['otp'],role_type)

            if isinstance(otp_record, dict) and 'error' in otp_record:
               raise ServiceError('invalid otp')
                
            register_users=user.get_user_email(request_data['email_id'],role_type)
            if not register_users:
                return {'message': 'otp verify successfully', 'is_register': False}
                
            if register_users.status in [2, 3]:
                raise ServiceError('Your account has been deactivated')

            speaker = SpeakerRepository.get_user_by_id(register_users.id)
            
                        
            access_token = user.generate_token(register_users,role_type)
                    
            return {'message': 'OTP verified successfully', 'access_token': access_token, 'is_register': True,'user_profile_image': register_users.profile_image,'speaker_first_name': speaker.first_name,'speaker_last_name': speaker.last_name,'user_email_id': register_users.email_id,'user_status': register_users.status}


    @staticmethod
    @handle_service_errors
    def register(request_data, session_id,role_type):
        user_id = request_data.get('id')
        email_id = request_data.get('email_id')
        country_code = request_data.get('country_code')
        mobile_number = request_data.get('mobile_number')

        if user_id:
            if user.email_check_update(email_id, role_type, user_id):
                raise ServiceError('Email ID already exists')
            if user.mobile_check_update(mobile_number, role_type, user_id, country_code):
                raise ServiceError('Mobile number already exists')
        else:
            SpeakerService.check_exists(email_id, user.email_check, 'Email ID already exists', role_type)
            SpeakerService.check_exists(mobile_number, user.mobile_check, 'Mobile number already exists', role_type, country_code)

        user_obj = SpeakerRepository.get_user_by_id(user_id)

        if not user_obj:
            user_data = {
                'role_type': role_type,
                'first_name': request_data.get('first_name'),
                'last_name': request_data.get('last_name'),
                'parent_id': session_id,
                'created_by': session_id,
                'email_id': email_id,
                'mobile_number': mobile_number,
                'country_code': country_code,
                'profile_image': request_data.get('profile_image'),
                'password': generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256')
            }
            user_obj = SpeakerRepository.add_user(user_data)
        else:
            user_data = {
                'first_name': request_data.get('first_name'),
                'last_name': request_data.get('last_name'),
                'email_id': email_id,
                'updated_by': session_id,
                'mobile_number': mobile_number,
                'country_code': country_code,
                'profile_image': request_data.get('profile_image')
            }
            if request_data.get('password'):
                user_data['password']=generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256')
            SpeakerRepository.update_user(user_obj.id, user_data)

        speaker_data = { 
            'user_id': user_obj.id,
            'formal_id_document': request_data.get('formal_id_document'),
            'formal_id_name': request_data.get('formal_id_name'),
            'country_of_residence': request_data.get('country_of_residence'),
            'about_us': request_data.get('about_us'),
            'qualification': request_data.get('qualification'),
            'created_by': user_obj.id,
            'updated_by': user_obj.id
        }
        existing_speaker = SpeakerRepository.get_speaker_by_user_id(user_obj.id)
        if existing_speaker:
            SpeakerRepository.update_speaker(existing_speaker.id, speaker_data)
        else:
            SpeakerRepository.add_speaker(speaker_data)

        # Social Media Links
        SpeakerRepository.delete_speaker_social_media_links(user_obj.id)
        if request_data.get('social_media_links'):
            for social_media in request_data['social_media_links']:
                platform = social_media.get('platform')
                url = social_media.get('url')                
                social_media_data = {
                    "user_id": user_obj.id,
                    "platform": platform,
                    "url": url,
                    "created_by": user_obj.id,
                    "updated_by": user_obj.id
                }
                SpeakerRepository.add_social_media_link(social_media_data)
                # existing_social_media = SpeakerRepository.get_social_media_link(user_obj.id, platform)
                # if existing_social_media:
                    # SpeakerRepository.update_social_media_link(existing_social_media.id, social_media_data)
                # else:
                    # SpeakerRepository.add_social_media_link(social_media_data)

        # Additional Information
        if request_data.get('additional_information'):
            for additional_data in request_data['additional_information']:
                additional_data_to_add = {
                    "user_id": user_obj.id,
                    "question_id": additional_data.get('question_id',0),
                    "option_value": additional_data.get('option_value',False),
                    "answer": additional_data.get('answer','')
                }
                existing_additional_info = SpeakerRepository.get_additional_info_by_user_id_and_question_id(
                    user_obj.id, additional_data.get('question_id',0))
                if existing_additional_info:
                    SpeakerRepository.update_additional_info(existing_additional_info.id, additional_data_to_add)
                else:
                    SpeakerRepository.add_additional_info(additional_data_to_add)

        # Expertise
        if request_data.get('expertise'):
            existing_expertise_ids = {
                expertise.expertise_id
                for expertise in SpeakerRepository.get_all_expertise_by_user(user_obj.id)
            }
            requested_expertise_ids = set(request_data['expertise'])
            expertise_ids_to_delete = existing_expertise_ids - requested_expertise_ids
            expertise_ids_to_add = requested_expertise_ids - existing_expertise_ids
            for expertise_id in expertise_ids_to_delete:
                SpeakerRepository.delete_speaker_expertise(user_obj.id, expertise_id)
            for expertise_id in expertise_ids_to_add:
                expertise_data = {
                    'user_id': user_obj.id,
                    'expertise_id': expertise_id,
                    'created_by': user_obj.id,
                    'updated_by': user_obj.id
                }
                SpeakerRepository.add_expertise(expertise_data)

        # Sect Types
        if request_data.get('sect_types'):
            existing_sect_type_ids = {
                sect_type.sect_type_id
                for sect_type in SpeakerRepository.get_speaker_sect_types_by_user_id(user_obj.id)
            }
            requested_sect_type_ids = set(request_data['sect_types'])
            sect_type_ids_to_delete = existing_sect_type_ids - requested_sect_type_ids
            sect_type_ids_to_add = requested_sect_type_ids - existing_sect_type_ids
            for sect_type_id in sect_type_ids_to_delete:
                SpeakerRepository.delete_speaker_sect_type(user_obj.id, sect_type_id)
            for sect_type_id in sect_type_ids_to_add:
                sect_type_data = {
                    'user_id': user_obj.id,
                    'sect_type_id': sect_type_id,
                    'created_by': user_obj.id,
                    'updated_by': user_obj.id
                }
                SpeakerRepository.add_sect_type(sect_type_data)

        # Schools of Thought
        if request_data.get('schools_of_thought'):
            existing_school_ids = {
                school.school_of_thought_id
                for school in SpeakerRepository.get_speaker_schools_of_thought_by_user_id(user_obj.id)
            }
            requested_school_ids = set(request_data['schools_of_thought'])
            school_ids_to_delete = existing_school_ids - requested_school_ids
            school_ids_to_add = requested_school_ids - existing_school_ids
            for school_id in school_ids_to_delete:
                SpeakerRepository.delete_speaker_school_of_thought(user_obj.id, school_id)
            for school_id in school_ids_to_add:
                school_data = {
                    'user_id': user_obj.id,
                    'school_of_thought_id': school_id,
                    'created_by': user_obj.id,
                    'updated_by': user_obj.id
                }
                SpeakerRepository.add_school_of_thought(school_data)

        if user_obj:
            if user_id:
                access_token = ''
            else:
                access_token = user.generate_token(user_obj, role_type)
            response_data = {'access_token': access_token,'user_status': user_obj.status,'user_profile_image': request_data.get('profile_image'),'user_email_id': request_data.get('email_id')}

        else:
            response_data = {"message": "Speaker register Successfully"}

        return response_data

        # return {"message": "Speaker Updated Successfully" if user_id else "Speaker register Successfully"}


    def check_exists(value, check_func, error_message, *args):
        if check_func(value, *args):
            raise ServiceError(error_message)
        



    @staticmethod
    @handle_service_errors
    def deleteSpeaker(request_data):
        speaker_id=request_data.get('id')
        obj = SpeakerRepository.delete_speaker(speaker_id)
        return {"message": "Speaker deleted Successfully"}

    @staticmethod
    @handle_service_errors
    def deleteSpeakerData(request_data,session_id):
        request_data['speaker_id']=session_id
        obj = SpeakerRepository.delete_speaker_data(request_data,session_id)
        return {"message": "Deleted Successfully"}




    @handle_service_errors
    def get_expertise():
        obj = SpeakerRepository.get_expertise_list()
        return obj
    


    
    @staticmethod
    @handle_service_errors
    def get_all_speakers(request_data):
        # Fetch all users with role_type=3 (speakers) with pagination, limit set to 10 per page
        speakers = SpeakerRepository.get_all_speakers(request_data, limit=1000)
        return [
            {
                "user_id": speaker.id,
                "first_name": speaker.first_name,
                "last_name": speaker.last_name,
                "email_id": speaker.email_id,
                "mobile_number": speaker.mobile_number,
                "country_code": speaker.country_code,
                "role_type": speaker.role_type,
                "profile_image": speaker.profile_image
            }
            for speaker in speakers
        ]



    @staticmethod
    @handle_service_errors
    def get_profile(session_id):
        user_id = session_id
        
        # Fetch the speaker's user details
        speaker = SpeakerRepository.get_speaker_by_user_id(user_id)
        if not speaker:
            raise ServiceError(f"Speaker with ID {user_id} not found")




        get_participants_count = OrganizerRepository.get_participants_count_all(user_id)
        event_created = OrganizerRepository.event_created(user_id)
        total_cources = OrganizerRepository.total_cources(user_id)
        
        
        
        # Prepare speaker details response
        speaker_details = {
            "ticket_solds": get_participants_count,
            "event_created": event_created,
            "total_cources": total_cources,
                
            "user_id": speaker.user.id,
            "first_name": speaker.user.first_name,
            "last_name": speaker.user.last_name,
            "email_id": speaker.user.email_id,
            "mobile_number": speaker.user.mobile_number,
            "country_code": speaker.user.country_code,
            "role_type": speaker.user.role_type,
            "profile_image": speaker.user.profile_image,
            "status":speaker.user.status,
            "formal_id_name": speaker.formal_id_name,
            "formal_id_document": speaker.formal_id_document,
            "about_us": speaker.about_us,
            "qualification": speaker.qualification,
            "country_of_residence": speaker.country_of_residence,
            
            
            # Fetch expertise, sect types, schools of thought, social media, and additional info
            "expertise": SpeakerService.get_expertise_details(user_id),
            "expertise_2": SpeakerService.get_expertise_details2(user_id),
            "sect_types": SpeakerService.get_sect_type_details(user_id),
            "sect_types_2": SpeakerService.get_sect_type_details2(user_id),
            "schools_of_thought": SpeakerService.get_school_of_thought_details(user_id),
            "schools_of_thought_2": SpeakerService.get_school_of_thought_details2(user_id),
            "social_media_links": SpeakerService.get_social_media_links(user_id),
            "additional_information": SpeakerService.get_additional_info(user_id)
        }

        return speaker_details

    @staticmethod
    def get_expertise_details(user_id):
        """Get expertise associated with the speaker."""
        expertise_list = SpeakerRepository.get_speaker_expertise_by_user_id(user_id)
        return [expertise.expertise.id for expertise in expertise_list]
        # return [
            # {
                # "expertise_id": expertise.expertise.id,
                # "expertise_title": expertise.expertise.title,
                # "expertise_ar_title": expertise.expertise.ar_title
            # }
            # for expertise in expertise_list
        # ]

    @staticmethod
    def get_expertise_details2(user_id):
        """Get expertise associated with the speaker."""
        expertise_list = SpeakerRepository.get_speaker_expertise_by_user_id(user_id)
        return [
            {
                "id": expertise.expertise.id,
                "title": expertise.expertise.title
            }
            for expertise in expertise_list
        ]

    @staticmethod
    def get_sect_type_details(user_id):
        """Get sect types associated with the speaker."""
        sect_types = SpeakerRepository.get_speaker_sect_types_by_user_id(user_id)        
        return [sect.sect_type.id for sect in sect_types]
        # return [
            # {
                # "sect_type_id": sect.sect_type.id,
                # "sect_type_title": sect.sect_type.title
            # }
            # for sect in sect_types
        # ]

    @staticmethod
    def get_sect_type_details2(user_id):
        """Get sect types associated with the speaker."""
        sect_types = SpeakerRepository.get_speaker_sect_types_by_user_id(user_id)     
        return [
            { 
                "id": sect.sect_type.id,
                "title": sect.sect_type.title
            }
            for sect in sect_types 
        ]

    @staticmethod
    def get_school_of_thought_details(user_id):
        """Get schools of thought associated with the speaker."""
        schools_of_thought = SpeakerRepository.get_speaker_schools_of_thought_by_user_id(user_id)        
        return [school.school_of_thought.id for school in schools_of_thought]
        # return [
            # {
                # "school_of_thought_id": school.school_of_thought.id,
                # "school_of_thought_title": school.school_of_thought.title
            # }
            # for school in schools_of_thought
        # ]
    @staticmethod
    def get_school_of_thought_details2(user_id):
        """Get schools of thought associated with the speaker."""
        schools_of_thought = SpeakerRepository.get_speaker_schools_of_thought_by_user_id(user_id)        
        return [
            {
                "id": school.school_of_thought.id,
                "title": school.school_of_thought.title
            }
            for school in schools_of_thought
        ]

    @staticmethod
    def get_social_media_links(user_id):
        """Get social media links associated with the speaker."""
        social_media_links = SpeakerRepository.get_social_media_links_by_user_id(user_id)
        return [
            {
                "platform": social_media.platform,
                "url": social_media.url
            }
            for social_media in social_media_links
        ]

    @staticmethod
    def get_additional_info(user_id):
        """Get additional information associated with the speaker."""
        additional_infos = SpeakerRepository.get_additional_info_by_user_id(user_id)
        return [
            {
                "question": additional_info.question.question,
                "question_id": additional_info.question_id,
                "question_type": additional_info.question.question_type,
                "option_value": additional_info.option_value,
                "answer": additional_info.answer
            }
            for additional_info in additional_infos
        ]
    
    @staticmethod
    @handle_service_errors
    def add_availability_days(request_data,session_id):
        user_id = session_id

        SpeakerRepository.update_user_timezone(user_id,request_data.get('time_zone',request.headers.get('Timezone',os.getenv('d_t_z'))))
        
        user_obj = SpeakerRepository.get_user_by_id(user_id)
        speaker = SpeakerRepository.get_speaker_by_user_id(user_id)
        if not user_obj or not speaker:
            raise ServiceError("Speaker not found")

        if 'one_to_one_enabled' in request_data:
            value = request_data.get('one_to_one_enabled')
            speaker.one_to_one_enabled = value if isinstance(value, bool) else str(value).lower() not in ('0', 'false', 'off', 'no')
        if 'location_type' in request_data:
            try:
                location_type = int(request_data.get('location_type'))
            except (TypeError, ValueError):
                raise ServiceError("Invalid one-to-one location type")
            if location_type not in (0, 1, 2):
                raise ServiceError("Invalid one-to-one location type")
            speaker.one_to_one_location_type = location_type
        if 'duration_minutes' in request_data:
            try:
                duration_minutes = int(request_data.get('duration_minutes'))
            except (TypeError, ValueError):
                raise ServiceError("Invalid one-to-one duration")
            if duration_minutes < 15 or duration_minutes > 240:
                raise ServiceError("One-to-one duration must be between 15 and 240 minutes")
            speaker.one_to_one_duration_minutes = duration_minutes
        db.session.commit()

        availability_days = request_data.get('availability_days') or []
        availability_dates = request_data.get('availability_dates') or []
        if not isinstance(availability_days, list) or not isinstance(availability_dates, list):
            raise ServiceError("Availability must be a list")

        def normalized_status(value):
            try:
                value = int(value)
            except (TypeError, ValueError):
                raise ServiceError("Invalid availability status")
            if value not in (1, 2):
                raise ServiceError("Invalid availability status")
            return value

        def normalized_time(value, field_name):
            raw = str(value or '').strip()
            for time_format in ('%H:%M:%S', '%H:%M'):
                try:
                    return datetime.strptime(raw, time_format).time()
                except ValueError:
                    continue
            raise ServiceError(f"Invalid {field_name}")

        for availability_day in availability_days:
                try:
                    weekday = int(availability_day.get('weekday'))
                except (TypeError, ValueError):
                    raise ServiceError("Invalid availability weekday")
                if weekday not in range(7):
                    raise ServiceError("Invalid availability weekday")
                additional_data_to_add = {
                    "user_id": user_obj.id,
                    "weekday": weekday,
                    "status": normalized_status(availability_day.get('status',1))
                }
                existing_date_info = SpeakerRepository.get_avaialability_by_user_id_and_dat_id(user_obj.id, availability_day.get('id'))
                if not existing_date_info:
                    existing_date_info = SpeakerAvailabilityDate.query.filter_by(user_id=user_obj.id, weekday=weekday).first()
                if existing_date_info:
                    new_data=SpeakerRepository.update_date_info(existing_date_info.id, additional_data_to_add)
                else:
                    new_data=SpeakerRepository.add_date_info(additional_data_to_add)
                    
                if availability_day.get('times'):
                    for time in availability_day.get('times'):
                        additional_time_to_add = {
                            "availability_date_id": new_data.id,
                            "start_time": normalized_time(time.get('start_time'), 'start time'),
                            "end_time": normalized_time(time.get('end_time'), 'end time'),
                            "status": normalized_status(time.get('status',1))
                        }
                        if additional_time_to_add['end_time'] <= additional_time_to_add['start_time']:
                            raise ServiceError("Availability end time must be after start time")
                        existing_time_info = SpeakerRepository.get_avaialability_by_user_id_and_time_id(new_data.id, time.get('id'))
                        if existing_time_info:
                            SpeakerRepository.update_time_info(existing_time_info.id, additional_time_to_add)
                        else:
                            SpeakerRepository.add_time_info(additional_time_to_add)

        # Specific dates can be enabled or marked unavailable independently of weekdays.
        for availability_date in availability_dates:
                    if availability_date.get('remove'):
                        existing_date_info = SpeakerRepository.get_avaialability_by_user_id_and_dat_id(
                            user_obj.id,
                            availability_date.get('id'),
                        )
                        if not existing_date_info or existing_date_info.date is None:
                            raise ServiceError("Availability date not found")
                        SpeakerAvailabilityTime.query.filter_by(
                            availability_date_id=existing_date_info.id,
                        ).delete(synchronize_session=False)
                        db.session.delete(existing_date_info)
                        db.session.commit()
                        continue
                    try:
                        date_value = datetime.strptime(str(availability_date.get('date') or ''), '%Y-%m-%d').date()
                    except (TypeError, ValueError):
                        raise ServiceError("Invalid availability date")
                    additional_data_to_add = {
                        "user_id": user_obj.id,
                        "date": date_value,
                        "status": normalized_status(availability_date.get('status',1))
                    }
                    existing_date_info = SpeakerRepository.get_avaialability_by_user_id_and_dat_id(user_obj.id, availability_date.get('id'))
                    if not existing_date_info:
                        existing_date_info = SpeakerRepository.get_avaialability_by_user_id_and_date(user_obj.id, date_value)
                    if existing_date_info:
                        new_data=SpeakerRepository.update_date_info(existing_date_info.id, additional_data_to_add)
                    else:
                        new_data=SpeakerRepository.add_date_info(additional_data_to_add)
                    
                    if availability_date.get('times'):
                        for time in availability_date.get('times'):
                            additional_time_to_add = {
                                "availability_date_id": new_data.id,
                                "start_time": normalized_time(time.get('start_time'), 'start time'),
                                "end_time": normalized_time(time.get('end_time'), 'end time'),
                                "status": normalized_status(time.get('status',1))
                            }
                            if additional_time_to_add['end_time'] <= additional_time_to_add['start_time']:
                                raise ServiceError("Availability end time must be after start time")
                            existing_time_info = SpeakerRepository.get_avaialability_by_user_id_and_time_id(new_data.id, time.get('id'))
                            if existing_time_info:
                                SpeakerRepository.update_time_info(existing_time_info.id, additional_time_to_add)
                            else:
                                SpeakerRepository.add_time_info(additional_time_to_add)


        return {
            "message": "Successful",
            "one_to_one_enabled": bool(speaker.one_to_one_enabled),
            "location_type": speaker.one_to_one_location_type,
            "duration_minutes": speaker.one_to_one_duration_minutes,
        }
    




    @staticmethod
    @handle_service_errors
    def get_availability_days(session_id):
        user_id = session_id
        
        # Fetch the speaker's user details
        speaker = SpeakerRepository.get_speaker_by_user_id(user_id)
        if not speaker:
            raise ServiceError(f"Speaker with ID {user_id} not found")

        # Prepare speaker details response
        get_available_details = {
            "one_to_one_enabled": bool(speaker.one_to_one_enabled),
            "location_type": speaker.one_to_one_location_type,
            "duration_minutes": speaker.one_to_one_duration_minutes,
            "availability_dates": SpeakerService.get_speaker_availability_date(user_id),
            "availability_days": SpeakerService.get_speaker_availability_day(user_id),
        }

        return get_available_details
    


    @staticmethod
    def get_speaker_availability_date(user_id):
        """Get sect types associated with the speaker."""
        sect_types = SpeakerRepository.get_speaker_availability_date(user_id)
        return [
            {
                "id": sect.id,
                "date": sect.date,
                "status": sect.status,
                "times": SpeakerService.get_speaker_availability_time(sect.id)
            }
            for sect in sect_types
        ]

    @staticmethod
    def get_speaker_availability_day(user_id):
        """Get sect types associated with the speaker."""
        sect_types = SpeakerRepository.get_speaker_availability_day(user_id)
        return [
            {
                "id": sect.id,
                "weekday": sect.weekday,
                "status": sect.status,
                "times": SpeakerService.get_speaker_availability_time(sect.id)
            }
            for sect in sect_types
        ]
    

    @staticmethod
    def get_speaker_availability_time(availability_date_id):
        """Get sect types associated with the speaker."""
        sect_types = SpeakerRepository.get_speaker_availability_time(availability_date_id)
        return [
            {
                "id": sect.id,
                "start_time": sect.start_time.strftime('%H:%M:%S') if sect.start_time else None,
                "end_time": sect.end_time.strftime('%H:%M:%S') if sect.end_time else None,
                "status": sect.status
            }
            for sect in sect_types
        ]





    @staticmethod
    @handle_service_errors
    def buddy_profile(session_id):
        user_id = session_id
        
        # Fetch the speaker's user details
        buddy = BuddyRepository.get_user_by_id(user_id)
        if not buddy:
            raise ServiceError(f"buddy with ID {user_id} not found")
        
        
        
        # Prepare speaker details response
        speaker_details = {
                
            "user_id": buddy.id,
            "first_name": buddy.first_name,
            "last_name": buddy.last_name,
            "email_id": buddy.email_id,
            "mobile_number": buddy.mobile_number,
            "country_code": buddy.country_code,
            "role_type": buddy.role_type,
            "profile_image": buddy.profile_image,
            "status":buddy.status,
        }

        return speaker_details
    

    @staticmethod
    @handle_service_errors
    def insert_push_token(token,request_data):
        push_token = user.insert_push_token(token,request_data)
        if isinstance(push_token, dict) and 'error' in push_token:
            raise ServiceError('unable_to_update_push_notification')
        return {'message': 'pushnotification inserted'}


        

    
    @staticmethod
    @handle_service_errors
    def get_notifications(session_id,request_data):
        user_obj = user.get_notifications(session_id,request_data)
        #user.update_seen_notifications(session_id)
        
        if isinstance(user_obj, dict) and 'error' in user_obj:
            raise ServiceError('Notifications not found')
        if user_obj:
            for noti in user_obj:
                if noti["type"]==3:
                    reqstbuddy=EventRepo.get_reqstbuddy_data(noti.get("event_id"),session_id)
                    if reqstbuddy:
                        noti["request_buddy_id"] = reqstbuddy.id
                        noti["event_id"] = reqstbuddy.event_id
                        noti["event_title"] = reqstbuddy.event_title
                        noti["user_id"] = reqstbuddy.user_id
                        noti["user_first_name"] = reqstbuddy.user_first_name
                        noti["user_last_name"] = reqstbuddy.user_last_name
                        noti["user_profile_image"] = reqstbuddy.user_profile_image
                        noti["user_mobile_number"] = reqstbuddy.user_mobile_number
                        noti["user_country_code"] = reqstbuddy.user_country_code
                    
        return user_obj
    
    
    @staticmethod
    def delete_nitification(request_data, user_id):
                
        profile_id = user.delete_nitification(request_data, user_id)
        if isinstance(profile_id, dict) and 'error' in profile_id:
            return {'message': 'Unable to delete notification'}
        return {'message': 'Notification deleted successfully', 'user_id': profile_id}
    
    @staticmethod
    def seen_notification(request_data, user_id):
                
        profile_id = user.seen_notification(request_data, user_id)
        if isinstance(profile_id, dict) and 'error' in profile_id:
            return {'message': 'Unable to update'}
        return {'message': 'Notification updated successfully', 'user_id': profile_id}
    


    @staticmethod
    @handle_service_errors
    def send_email(request_data, session_id):
        notification_type = request_data.get("type")

        type_map = {
            1: "Support email sent successfully.",
            2: "Bug report email sent successfully."
        }

        if notification_type in type_map:
            # ✅ Build email body dynamically from request_data
            details_html = ""
            for k, v in request_data.items():
                if k == "type":
                    continue
                if k == "fullname":
                    k = "full name"
                k = k.capitalize()

                # If value is an image URL, show as <img>
                if isinstance(v, str) and v.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
                    details_html += f"<p><b>{k}</b>:<br><img src='{v}' alt='{k}' style='max-width:300px;'></p>"
                else:
                    details_html += f"<p><b>{k}</b>: {v}</p>"

            send_email(
                email_body=details_html,
                subjects=request_data.get("subject", "Notification"),
                email_to=os.getenv("ADMIN_EMAIL"),
                user_name=os.getenv("USER_NAME"),
                password=os.getenv("PASSWORD")
            )

            return {"message": type_map[notification_type]}

        return {"error": "Invalid notification type"}
