from app.repositories.user import user
from app.repositories.speakers import SpeakerRepository
from app.repositories.event import EventRepo
from app.services.speaker.speaker import SpeakerService as SpeakerAvailabilityService
from werkzeug.security import generate_password_hash
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors


class SpeakerService:
    role_type = 4 # Assuming speakers have role_type 4 for identification

    @staticmethod
    def _managed_speaker_id(session_id, request_data):
        try:
            speaker_id = int((request_data or {}).get('speaker_id'))
            organiser_id = int(session_id)
        except (TypeError, ValueError):
            raise ServiceError('Speaker ID is required')

        speaker_user = SpeakerRepository.get_user_by_id(speaker_id)
        speaker = SpeakerRepository.get_speaker_by_user_id(speaker_id)
        if not speaker_user or not speaker or speaker_user.role_type != SpeakerService.role_type:
            raise ServiceError('Speaker not found')

        is_child_account = str(speaker_user.parent_id or '') == str(organiser_id)
        is_assigned = EventRepo.organiser_manages_speaker(organiser_id, speaker_id)
        if not is_child_account and not is_assigned:
            raise ServiceError('Not your Speaker')
        return speaker_id

    @staticmethod
    @handle_service_errors
    def get_availability(request_data, session_id):
        speaker_id = SpeakerService._managed_speaker_id(session_id, request_data)
        return SpeakerAvailabilityService.get_availability_days.__wrapped__(speaker_id)

    @staticmethod
    @handle_service_errors
    def save_availability(request_data, session_id):
        request_data = dict(request_data or {})
        speaker_id = SpeakerService._managed_speaker_id(session_id, request_data)
        request_data.pop('speaker_id', None)
        return SpeakerAvailabilityService.add_availability_days.__wrapped__(
            request_data,
            speaker_id,
        )



    @staticmethod
    @handle_service_errors
    def register(request_data, session_id):
        user_id = request_data.get('id')
        if not user_id:
            user_id = request_data.get('user_id')
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

        requested_status = request_data.get('status')
        if requested_status is None:
            requested_status = user_obj.status if user_obj else 1
        try:
            requested_status = int(requested_status)
        except (TypeError, ValueError):
            raise ServiceError('Speaker status is invalid')
        if requested_status not in (1, 2, 3):
            raise ServiceError('Speaker status is invalid')

        if not user_obj:
            user_data = {
                'role_type': SpeakerService.role_type,
                'first_name': request_data.get('first_name'),
                'last_name': request_data.get('last_name'),
                'status': requested_status,
                'parent_id': session_id,
                'created_by': session_id,
                'email_id': email_id,
                'mobile_number': mobile_number,
                'country_code': country_code,
                'profile_image': request_data.get('profile_image'),
                # Speaker accounts do not participate in the customer's
                # learning journey, but the legacy Users column defaults to
                # 0 (not a real FK row on Railway). Keep the neutral seeded
                # level so the managed-account insert satisfies the schema.
                'journey_level_id': 1,
                'password': generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256')
            }
            user_obj = SpeakerRepository.add_user(user_data)
        else:
            if str(user_obj.parent_id) != str(session_id) and not EventRepo.organiser_manages_speaker(session_id, user_obj.id):
                raise ServiceError('Not your Speaker')
            user_data = {
                'first_name': request_data.get('first_name'),
                'last_name': request_data.get('last_name'),
                'status': requested_status,
                'email_id': email_id,
                'updated_by': session_id,
                'mobile_number': mobile_number,
                'country_code': country_code,
                'profile_image': request_data.get('profile_image'),
                'password': generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256')
            }
            SpeakerRepository.update_user(user_obj.id, user_data)
        existing_speaker = SpeakerRepository.get_speaker_by_user_id(user_obj.id)
        if existing_speaker:
            speaker_data = { 
                'user_id': user_obj.id,
                'formal_id_document': request_data.get('formal_id_document'),
                'formal_id_name': request_data.get('formal_id_name'),
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
        if 'expertise' in request_data and isinstance(request_data.get('expertise'), list):
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
        if 'sect_types' in request_data and isinstance(request_data.get('sect_types'), list):
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
        if 'schools_of_thought' in request_data and isinstance(request_data.get('schools_of_thought'), list):
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

        return {"message": "Speaker Updated Successfully" if user_id else "Speaker Created Successfully"}


    def check_exists(value, check_func, error_message, *args):
        if check_func(value, *args):
            raise ServiceError(error_message)




  
    @staticmethod
    @handle_service_errors
    def get_details_by_id(request_data, session_id=None):
        request_data = dict(request_data or {})
        if session_id is not None:
            request_data['speaker_id'] = request_data.get('speaker_id', request_data.get('id'))
            user_id = SpeakerService._managed_speaker_id(session_id, request_data)
        else:
            user_id = request_data.get('id')

        # Fetch the speaker's user details
        speaker = SpeakerRepository.get_speaker_by_user_id(user_id)
        if not speaker:
            raise ServiceError(f"Speaker with ID {user_id} not found")

        # Prepare speaker details response
        speaker_details = {
            "user_id": speaker.user.id,
            "first_name": speaker.user.first_name,
            "last_name": speaker.user.last_name,
            "status": speaker.user.status,
            "email_id": speaker.user.email_id,
            "mobile_number": speaker.user.mobile_number,
            "country_code": speaker.user.country_code,
            "role_type": speaker.user.role_type,
            "profile_image": speaker.user.profile_image,
            "formal_id_name": speaker.formal_id_name,
            "formal_id_document": speaker.formal_id_document,
            "about_us": speaker.about_us,
            "qualification": speaker.qualification,
            "country_of_residence": speaker.country_of_residence,
            
            # Fetch expertise, sect types, schools of thought, social media, and additional info
            "expertise": SpeakerService.get_expertise_details(user_id),
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
        # The organiser management surface must never enumerate another
        # organisation's speakers. Event master data uses a separate active
        # projection and is intentionally unaffected by this route.
        request_data = dict(request_data or {})
        request_data['mine'] = True
        speakers = SpeakerRepository.get_all_speakers(request_data, limit=1000)
        return [
            {
                "user_id": speaker.id,
                "id": speaker.id,
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
    def deleteSpeaker(request_data, session_id=None):
        request_data = dict(request_data or {})
        request_data['speaker_id'] = request_data.get('speaker_id', request_data.get('id'))
        speaker_id = (
            SpeakerService._managed_speaker_id(session_id, request_data)
            if session_id is not None
            else request_data.get('speaker_id')
        )
        obj = SpeakerRepository.delete_speaker(speaker_id)
        if not obj:
            raise ServiceError('Speaker not found')
        return {"message": "Speaker deleted Successfully"}



    @handle_service_errors
    def get_expertise():
        obj = SpeakerRepository.get_expertise_list()
        return obj

        
        
        
        
        
        
        
        
        
