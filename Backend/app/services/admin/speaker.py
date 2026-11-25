from app.repositories.user import user
from app.repositories.speakers import SpeakerRepository
from werkzeug.security import generate_password_hash
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors


class SpeakerService:
    role_type = 4 # Assuming speakers have role_type 4 for identification



    @staticmethod
    @handle_service_errors
    def register(request_data, session_id):
        user_id = request_data.get('id')
        email_id = request_data.get('email_id')
        country_code = request_data.get('country_code')
        mobile_number = request_data.get('mobile_number')

        if user_id:
            if user.email_check_update(email_id, SpeakerService.role_type, user_id):
                raise ServiceError('Email ID already exists')
            if user.mobile_check_update(mobile_number, SpeakerService.role_type, user_id, country_code):
                raise ServiceError('Mobile number already exists')
        else:
            SpeakerService.check_exists(email_id, user.email_check, 'Email ID already exists', SpeakerService.role_type)
            SpeakerService.check_exists(mobile_number, user.mobile_check, 'Mobile number already exists', SpeakerService.role_type, country_code)

        user_obj = SpeakerRepository.get_user_by_id(user_id)

        if not user_obj:
            user_data = {
                'role_type': SpeakerService.role_type,
                'first_name': request_data.get('first_name'),
                'last_name': request_data.get('last_name'),
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
                'profile_image': request_data.get('profile_image'),
                'status': request_data.get('status')
            }
            if request_data.get('password'):
                user_data['password'] = generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256')
            SpeakerRepository.update_user(user_obj.id, user_data)
        existing_speaker = SpeakerRepository.get_speaker_by_user_id(user_obj.id)
        if existing_speaker:
            speaker_data = { 
                'user_id': user_obj.id,
                'formal_id_name': request_data.get('formal_id_name'),
                'formal_id_document': request_data.get('formal_id_document'),
                'country_of_residence': request_data.get('country_of_residence'),
                'about_us': request_data.get('about_us'),
                'qualification': request_data.get('qualification'),
                'updated_by': user_obj.id
            }
            SpeakerRepository.update_speaker(existing_speaker.id, speaker_data)
        else:
            speaker_data = { 
                'user_id': user_obj.id,
                'formal_id_document': request_data.get('formal_id_document'),
                'formal_id_name': request_data.get('formal_id_name'),
                'country_of_residence': request_data.get('country_of_residence'),
                'about_us': request_data.get('about_us'),
                'qualification': request_data.get('qualification'),
                'created_by': user_obj.id
            }
            SpeakerRepository.add_speaker(speaker_data)

        # Available days
        if request_data.get('availability_days'):
            for availability_day in request_data['availability_days']:
                additional_data_to_add = {
                    "user_id": user_obj.id,
                    "weekday": availability_day.get('weekday'),
                    "status": availability_day.get('status',1)
                }
                existing_date_info = SpeakerRepository.get_avaialability_by_user_id_and_dat_id(user_obj.id, availability_day.get('id'))
                if existing_date_info:
                    new_data=SpeakerRepository.update_date_info(existing_date_info.id, additional_data_to_add)
                else:
                    new_data=SpeakerRepository.add_date_info(additional_data_to_add)
                
                if availability_day.get('times'):
                    for time in availability_day.get('times'):
                        additional_time_to_add = {
                            "availability_date_id": new_data.id,
                            "start_time": time.get('start_time'),
                            "end_time": time.get('end_time'),
                            "status": time.get('status',1)
                        }
                        existing_time_info = SpeakerRepository.get_avaialability_by_user_id_and_time_id(new_data.id, time.get('id'))
                        if existing_time_info:
                            SpeakerRepository.update_time_info(existing_time_info.id, additional_time_to_add)
                        else:
                            SpeakerRepository.add_time_info(additional_time_to_add)

        # Available dates
        if request_data.get('availability_dates'):
            for availability_date in request_data['availability_dates']:
                additional_data_to_add = {
                    "user_id": user_obj.id,
                    "date": availability_date.get('date'),
                    "status": availability_date.get('status',1)
                }
                existing_date_info = SpeakerRepository.get_avaialability_by_user_id_and_dat_id(user_obj.id, availability_date.get('id'))
                if existing_date_info:
                    new_data=SpeakerRepository.update_date_info(existing_date_info.id, additional_data_to_add)
                else:
                    new_data=SpeakerRepository.add_date_info(additional_data_to_add)
                
                if availability_date.get('times'):
                    for time in availability_date.get('times'):
                        additional_time_to_add = {
                            "availability_date_id": new_data.id,
                            "start_time": time.get('start_time'),
                            "end_time": time.get('end_time'),
                            "status": time.get('status',1)
                        }
                        existing_time_info = SpeakerRepository.get_avaialability_by_user_id_and_time_id(new_data.id, time.get('id'))
                        if existing_time_info:
                            SpeakerRepository.update_time_info(existing_time_info.id, additional_time_to_add)
                        else:
                            SpeakerRepository.add_time_info(additional_time_to_add)

        # Additional Information
        if request_data.get('additional_information'):
            for additional_data in request_data['additional_information']:
                additional_data_to_add = {
                    "user_id": user_obj.id,
                    "question_id": additional_data.get('question_id'),
                    "option_value": additional_data.get('option_value'),
                    "answer": additional_data.get('answer')
                }
                existing_additional_info = SpeakerRepository.get_additional_info_by_user_id_and_question_id(
                    user_obj.id, additional_data.get('question_id'))
                if existing_additional_info:
                    SpeakerRepository.update_additional_info(existing_additional_info.id, additional_data_to_add)
                else:
                    SpeakerRepository.add_additional_info(additional_data_to_add)

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

        return {"id":user_obj.id,"message": "Speaker Updated Successfully" if user_id else "Speaker Created Successfully"}


    def check_exists(value, check_func, error_message, *args):
        if check_func(value, *args):
            raise ServiceError(error_message)




  
    @staticmethod
    @handle_service_errors
    def get_details_by_id(request_data):
        user_id = request_data.get('id')
        
        # Fetch the speaker's user details
        speaker = SpeakerRepository.get_speaker_by_user_id(user_id)
        if not speaker:
            raise ServiceError(f"Speaker with ID {user_id} not found")

        # Prepare speaker details response
        speaker_details = {
            "user_id": speaker.user.id,
            "status": speaker.user.status,
            "created_by": speaker.user.created_by,
            "first_name": speaker.user.first_name,
            "last_name": speaker.user.last_name,
            "email_id": speaker.user.email_id,
            "mobile_number": speaker.user.mobile_number,
            "country_code": speaker.user.country_code,
            "role_type": speaker.user.role_type,
            "profile_image": speaker.user.profile_image,
            "formal_id_document": speaker.formal_id_document,
            "formal_id_name": speaker.formal_id_name,
            "about_us": speaker.about_us,
            "qualification": speaker.qualification,
            "country_of_residence": speaker.country_of_residence,
            
            # Fetch expertise, sect types, schools of thought, social media, and additional info
            "expertise": SpeakerService.get_expertise_details(user_id),
            "availability_dates": SpeakerService.get_speaker_availability_date(user_id),
            "availability_days": SpeakerService.get_speaker_availability_day(user_id),
            "sect_types": SpeakerService.get_sect_type_details(user_id),
            "schools_of_thought": SpeakerService.get_school_of_thought_details(user_id),
            "social_media_links": SpeakerService.get_social_media_links(user_id),
            "additional_information": SpeakerService.get_additional_info(user_id)
        }

        return speaker_details

    @staticmethod
    def get_expertise_details(user_id):
        """Get expertise associated with the speaker."""
        expertise_list = SpeakerRepository.get_speaker_expertise_by_user_id(user_id)
        return [
            {
                "expertise_id": expertise.expertise.id,
                "expertise_title": expertise.expertise.title,
                "expertise_ar_title": expertise.expertise.ar_title
            }
            for expertise in expertise_list
        ]

    @staticmethod
    def get_sect_type_details(user_id):
        """Get sect types associated with the speaker."""
        sect_types = SpeakerRepository.get_speaker_sect_types_by_user_id(user_id)
        return [
            {
                "sect_type_id": sect.sect_type.id,
                "sect_type_title": sect.sect_type.title
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
    def get_school_of_thought_details(user_id):
        """Get schools of thought associated with the speaker."""
        schools_of_thought = SpeakerRepository.get_speaker_schools_of_thought_by_user_id(user_id)
        return [
            {
                "school_of_thought_id": school.school_of_thought.id,
                "school_of_thought_title": school.school_of_thought.title
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
                "status": speaker.status,
                "profile_image": speaker.profile_image
            }
            for speaker in speakers
        ]



    @staticmethod
    @handle_service_errors
    def deleteSpeaker(request_data):
        speaker_id=request_data.get('id')
        obj = SpeakerRepository.delete_speaker(speaker_id)
        return {"message": "Speaker deleted Successfully"}



    @staticmethod
    @handle_service_errors
    def deleteSpeakerData(request_data,session_id): 
        obj = SpeakerRepository.delete_speaker_data(request_data,session_id)
        return {"message": "Deleted Successfully"}



    @handle_service_errors
    def get_expertise():
        obj = SpeakerRepository.get_expertise_list()
        return obj
        
        
        
        
        
        
        
        
        
        