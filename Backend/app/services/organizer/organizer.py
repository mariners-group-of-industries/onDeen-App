from app.repositories.user import user
from app.repositories.organizer import OrganizerRepository
from app.repositories.event import EventRepo
from app.repositories.buddy import BuddyRepository
from app.utils.notification import send_sms,send_email
from app.repositories.category import CategoryRepository
from app.repositories.subcategory import SubCategoryRepository
from app import db
from app.models.users import NotificationPreference, Notification_History
from app.models.event import JourneyLevel
from app.models.organizer_application import OrganizerApplication
from app.services.organizer_application_storage import ensure_organizer_application_storage
from app.services.notification_preference_storage import ensure_notification_preference_storage
from werkzeug.security import generate_password_hash
from app.utils.custom_exception import ServiceError
from app.utils.validators import password_strength_errors
from app.utils.auth_decorators import get_request_token_claims, is_recent_otp_session
from app.utils.response_decorators import handle_service_errors
from datetime import datetime
import os
  
class OrganizerService: 
    role_type =3
    APPLICATION_STATUSES = {
        "UNDER_REVIEW",
        "NEEDS_MORE_INFO",
        "APPROVED",
        "REJECTED",
    }

    # Notification_History uses these stable type values throughout the
    # backend.  Keep the labels user-facing and the values API-stable.
    NOTIFICATION_PREFERENCE_DEFINITIONS = (
        (3, "Buddy support requests", "Requests and assignments involving your Buddy support team."),
        (4, "Speaker collaboration", "One-to-one session requests and updates."),
        (5, "New bookings", "A user books one of your free listings."),
        (6, "Booking cancellations", "A booking for one of your listings is cancelled."),
        (7, "Listing updates and attendance", "Updates, materials, announcements, and attendance changes."),
        (8, "Completed bookings", "A booking reaches its completed state."),
        (9, "Questions and answers", "Questions, answers, and replies on your listings."),
    )
    NOTIFICATION_PREFERENCE_TYPES = {
        notification_type for notification_type, _label, _description
        in NOTIFICATION_PREFERENCE_DEFINITIONS
    }

    @staticmethod
    def _application_for_user(user_id):
        ensure_organizer_application_storage()
        return OrganizerApplication.query.filter_by(user_id=user_id).first()

    @staticmethod
    def _application_payload(user_id, application=None):
        application = application or OrganizerService._application_for_user(user_id)
        if application is None:
            return {
                "application_status": "APPROVED",
                "application_id": None,
                "requires_approval": False,
                "review_note": None,
            }
        return {
            "application_status": application.status,
            "application_id": application.id,
            "requires_approval": application.status != "APPROVED",
            "review_note": application.review_note,
            "submitted_on": application.submitted_on.isoformat() if application.submitted_on else None,
            "reviewed_on": application.reviewed_on.isoformat() if application.reviewed_on else None,
        }

    @staticmethod
    @handle_service_errors
    def get_application_status(session_id):
        organizer = user.get_userby_id(session_id)
        if not organizer or organizer.role_type != OrganizerService.role_type:
            raise ServiceError("Organizer access is required")
        application = OrganizerService._application_for_user(session_id)
        payload = OrganizerService._application_payload(session_id, application)
        payload["user_status"] = organizer.status
        return payload

    @staticmethod
    def _notification_preference_payload(session_id):
        ensure_notification_preference_storage()
        organizer = user.get_userby_id(session_id)
        if not organizer or organizer.role_type != OrganizerService.role_type:
            raise ServiceError("Organizer access is required")

        rows = {
            row.notification_type: bool(row.push_enabled)
            for row in NotificationPreference.query.filter_by(user_id=session_id).all()
        }
        return {
            "preferences": [
                {
                    "notification_type": notification_type,
                    "label": label,
                    "description": description,
                    # Existing accounts have no rows and therefore default to
                    # enabled, preserving their current push behaviour.
                    "push_enabled": rows.get(notification_type, True),
                }
                for notification_type, label, description
                in OrganizerService.NOTIFICATION_PREFERENCE_DEFINITIONS
            ]
        }

    @staticmethod
    @handle_service_errors
    def get_notification_preferences(session_id):
        return OrganizerService._notification_preference_payload(session_id)

    @staticmethod
    @handle_service_errors
    def update_notification_preferences(request_data, session_id):
        payload = request_data or {}
        preferences = payload.get("preferences")
        if not isinstance(preferences, list) or not preferences:
            raise ServiceError("At least one notification preference is required")

        # Validate every item before changing any row so a malformed request
        # cannot leave a partially applied settings screen.
        updates = []
        for item in preferences:
            if not isinstance(item, dict):
                raise ServiceError("Invalid notification preference")
            raw_type = item.get("notification_type", item.get("type"))
            try:
                notification_type = int(raw_type)
            except (TypeError, ValueError):
                raise ServiceError("Invalid notification type")
            if notification_type not in OrganizerService.NOTIFICATION_PREFERENCE_TYPES:
                raise ServiceError("Invalid notification type")
            enabled = item.get("push_enabled")
            if not isinstance(enabled, bool):
                raise ServiceError("push_enabled must be a boolean")
            updates.append((notification_type, enabled))

        organizer = user.get_userby_id(session_id)
        if not organizer or organizer.role_type != OrganizerService.role_type:
            raise ServiceError("Organizer access is required")

        ensure_notification_preference_storage()
        for notification_type, enabled in updates:
            row = NotificationPreference.query.filter_by(
                user_id=session_id,
                notification_type=notification_type,
            ).first()
            if row is None:
                row = NotificationPreference(
                    user_id=session_id,
                    notification_type=notification_type,
                    push_enabled=enabled,
                )
                db.session.add(row)
            else:
                row.push_enabled = enabled
        db.session.commit()
        return OrganizerService._notification_preference_payload(session_id)
    
    
    @staticmethod
    @handle_service_errors
    def delete_account(session_id,bearer_token):

        session_obj = user.logout(session_id,bearer_token)
        user_obj = user.delete_account(session_id)
        
        
        return {'message':'deleted_successfully'} 
    
    @staticmethod
    @handle_service_errors
    def logout(session_id,bearer_token):

        session_obj = OrganizerRepository.logout(session_id,bearer_token)
        if session_obj:
            return {'message':'logged_out_successfully'} 



    @staticmethod
    @handle_service_errors
    def wallet_transactions(data,session):
        data = {"user_id":session}
        obj = OrganizerRepository.wallet_transactions(data,session)
        return obj
     
    
    @staticmethod 
    @handle_service_errors
    def register(request_data, session_id):
        # Check if the email and mobile number already exist
        email_id = request_data.get('email_id')
        country_code = request_data.get('country_code')
        mobile_number = request_data.get('mobile_number')
        
        # Check if user already exists
        OrganizerService.check_exists(
            email_id, user.email_check, 'Email ID already exists', OrganizerService.role_type)
        OrganizerService.check_exists(
            mobile_number, user.mobile_check, 'Mobile number already exists', OrganizerService.role_type, country_code)
        
        default_status = '1' if os.getenv('ONDEEN_LOCAL') == '1' or os.getenv('ONDEEN_TEST_OTP_ENABLED') == 'true' else '0'
        user_status = int(os.getenv('ORGANIZER_DEFAULT_STATUS', default_status))

        # PostgreSQL enforces the journey-level FK while the legacy model
        # default of 0 only worked on databases without that reference row.
        # New organiser accounts are neutral until they choose a level, so
        # use the seeded "Suitable for all" level when available and leave it
        # NULL (rather than the invalid sentinel 0) on an unseeded database.
        default_journey_level = JourneyLevel.query.filter_by(
            title="Suitable for all", status=1
        ).first()
        if default_journey_level is None:
            default_journey_level = JourneyLevel.query.filter_by(status=1).order_by(JourneyLevel.id.asc()).first()
        journey_level_id = default_journey_level.id if default_journey_level else None
        
        
        # Create a new user
        user_data = {
            'role_type': OrganizerService.role_type,
            'email_id': request_data.get('email_id'), 
            'mobile_number': request_data.get('mobile_number'),
            'country_code': request_data.get('country_code'),
            'status': user_status,
            'journey_level_id': journey_level_id,
            'password': generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256'),
            'profile_image': request_data.get('profile_image')
        }
        user_obj = OrganizerRepository.add_user(user_data)

        # Add new Organization
        if request_data.get('organization_name'):
            organization_data = {
                'user_id': user_obj.id,
                'organization_name': request_data.get('organization_name'),
                'manager_name': request_data.get('manager_name'),
                'about_us': request_data.get('about_us'),
                'location': request_data.get('location'),
                'latitude': request_data.get('latitude'),
                'longitude': request_data.get('longitude'),
                'foundation_date': request_data.get('foundation_date'),
                'post_code': request_data.get('post_code'),
                'sect_representation': request_data.get('sect_rep'),
                'school_thought': request_data.get('school_thought'),
                'charity_registered': request_data.get('charity_registered', False),
                'charity_no': request_data.get('charity_no'),
                'created_by': user_obj.id,
                'updated_by': user_obj.id
            }
            OrganizerRepository.add_organization(organization_data)

        # Add Additional information
        if request_data.get('additional_information'):
            for additional_data in request_data['additional_information']:
                additional_data_to_add = {
                    "user_id": user_obj.id,
                    "question_id": additional_data.get('question_id',0),
                    "option_value": additional_data.get('option_value',False),
                    "answer": additional_data.get('answer','')
                }
                OrganizerRepository.add_additional_info(additional_data_to_add)


         # Add or update Categories and Subcategories
        if not request_data.get('organizer_categories'):
            request_data['organizer_categories']=request_data.get('categories')
        if request_data.get('organizer_categories'):
            for category_data in request_data['organizer_categories']:
                category_id = category_data.get('category_id')

                # Add category if not exists
                if not category_id:
                    category = OrganizerRepository.get_category_by_name(
                        category_data.get('category_name'))
                    if not category:
                        category_data_to_add = {
                            'title': category_data.get('category_name'),
                            'ar_title': category_data.get('category_name'),
                            'home_view': 1,
                            'status': 1,
                            'created_by': user_obj.id,
                            'updated_by': user_obj.id
                        }
                        category = OrganizerRepository.add_category(
                            category_data_to_add)
                    category_id = category.id

                # Add or update Organizer Category
                organizer_category = OrganizerRepository.get_organizer_category(
                    user_obj.id, category_id)
                organizer_category_data = {
                    'user_id': user_obj.id,
                    'category_id': category_id,
                    'created_by': user_obj.id,
                    'updated_by': user_obj.id
                }
                if organizer_category:
                    OrganizerRepository.update_organizer_category(
                        organizer_category.id, organizer_category_data)
                else:
                    organizer_category = OrganizerRepository.add_organizer_category(
                        organizer_category_data)  # Assign the created category to the variable

                # Add or update Subcategories
                if not category_data.get('organizer_subcategories') :
                        category_data['organizer_subcategories'] = category_data.get('subcategories')
                if category_data.get('organizer_subcategories'):
                    for subcategory_data in category_data['organizer_subcategories']:
                        subcategory_id = subcategory_data.get('subcategory_id')

                        # Add subcategory if not exists
                        if not subcategory_id:
                            subcategory = OrganizerRepository.get_subcategory_by_name(
                                subcategory_data.get('subcategory_name'), category_id)
                            if not subcategory:
                                subcategory_data_to_add = {
                                    'category_id': category_id,
                                    'title': subcategory_data.get('subcategory_name'),
                                    'ar_title': subcategory_data.get('subcategory_name'),
                                    'status': 1,
                                    'created_by': user_obj.id,
                                    'updated_by': user_obj.id
                                }
                                subcategory = OrganizerRepository.add_subcategory(
                                    subcategory_data_to_add)
                            subcategory_id = subcategory.id

                        # Add or update Organizer Subcategory
                        organizer_subcategory = OrganizerRepository.get_organizer_subcategory(
                            organizer_category.id, subcategory_id)
                        organizer_subcategory_data = {
                            'organizer_category_id': organizer_category.id,
                            'subcategory_id': subcategory_id,
                            'created_by': user_obj.id,
                            'updated_by': user_obj.id
                        }
                        if organizer_subcategory:
                            OrganizerRepository.update_organizer_subcategory(
                                organizer_subcategory.id, organizer_subcategory_data)
                        else:
                            OrganizerRepository.add_organizer_subcategory(
                                organizer_subcategory_data)

        social_id = request_data.get('social_id') or request_data.get('sub')
        if social_id:
            user.add_user_by_social_id(
                social_id,
                request_data.get('social_access_token') or request_data.get('access_token') or social_id,
                request_data.get('provider') or 'google',
                user_obj.id,
            )
        

        # Every newly submitted organisation is reviewable.  Seeded/demo
        # accounts are created separately with an active status and therefore
        # remain immediately available.
        ensure_organizer_application_storage()
        application_status = "APPROVED" if user_status == 1 else "UNDER_REVIEW"
        application = OrganizerApplication.query.filter_by(user_id=user_obj.id).first()
        if application is None:
            application = OrganizerApplication(
                user_id=user_obj.id,
                status=application_status,
            )
            db.session.add(application)
            db.session.flush()
        else:
            application.status = application_status
        db.session.commit()

        # Generate access token for the newly created user.  Pending users get
        # a restricted token used solely by the application-status screen.
        if user_obj:
            access_token = user.generate_token(user_obj, OrganizerService.role_type)
            response_data = {
                'access_token': access_token,
                'user_status': user_status,
                'user_profile_image': request_data.get('profile_image'),
                'organization_name': request_data.get('organization_name'),
                'user_email_id': request_data.get('email_id'),
                **OrganizerService._application_payload(user_obj.id, application),
                'message': 'Application submitted for review.' if user_status != 1 else 'Organizer created successfully.',
            }
        else:
            response_data = {"message": "Organizer Created Successfully"}

        return response_data

             
           

    
    def check_exists(value, check_func, error_message, *args):
        if check_func(value, *args):
            raise ServiceError(error_message)
    
    @staticmethod
    def social_response(profile):
        if profile.status in [2, 3]:
            raise ServiceError('Your account has been deactivated')

        organization = OrganizerRepository.get_organization_by_user_id(profile.id)
        access_token = user.generate_token(profile, OrganizerService.role_type, auth_method="social")
        return {
            'message': 'Google login successful',
            'access_token': access_token,
            'is_register': True,
            'user_profile_image': profile.profile_image,
            'organization_name': organization.organization_name if organization else '',
            'user_email_id': profile.email_id,
            'user_status': profile.status,
        }

    @staticmethod
    @handle_service_errors
    def register_social(request_data):
        provider = request_data.get('provider')
        if provider not in ['google', 'google2']:
            raise ServiceError('Unsupported social provider')

        social_id = request_data.get('sub') or request_data.get('social_id') or request_data.get('id')
        email_id = request_data.get('email') or request_data.get('email_id')

        if not social_id:
            raise ServiceError('Google account id is required')
        if not email_id:
            raise ServiceError('Google email is required')

        social_data = user.check_social_id(social_id, 'google', OrganizerService.role_type)
        if social_data:
            linked_profile = user.get_userby_id(social_data.user_id)
            if linked_profile and linked_profile.role_type == OrganizerService.role_type:
                return OrganizerService.social_response(linked_profile)

        organizer_user = user.email_check(email_id, OrganizerService.role_type)
        if organizer_user:
            if organizer_user.status in [2, 3]:
                raise ServiceError('Your account has been deactivated')
            if not social_data or social_data.user_id != organizer_user.id:
                user.add_user_by_social_id(
                    social_id,
                    request_data.get('social_access_token') or request_data.get('access_token') or social_id,
                    'google',
                    organizer_user.id,
                )
            return OrganizerService.social_response(organizer_user)

        name = request_data.get('name') or ''
        name_parts = name.split(' ', 1)
        return {
            'is_register': False,
            'social_id': social_id,
            'sub': social_id,
            'email_id': email_id,
            'email': email_id,
            'first_name': request_data.get('first_name') or request_data.get('given_name') or (name_parts[0] if name_parts else ''),
            'last_name': request_data.get('last_name') or request_data.get('family_name') or (name_parts[1] if len(name_parts) > 1 else ''),
            'name': name,
            'profile_image': request_data.get('profile_image') or request_data.get('picture'),
            'provider': 'google',
        }


    @staticmethod
    @handle_service_errors
    def update_profile(request_data, session_id):
        # Check if the email and mobile number already exist for updating purposes
        
        
        
        user_id =  session_id
        email_id = request_data.get('email_id')
        country_code = request_data.get('country_code')
        mobile_number = request_data.get('mobile_number')
        
        # print(request_data)
        
        if user_id:
            if user.email_check_update(email_id, OrganizerService.role_type, user_id):
                raise ServiceError('Email ID already exists')

            if user.mobile_check_update(mobile_number, OrganizerService.role_type, user_id, country_code):
                raise ServiceError('Mobile number already exists')

            # Get existing user
            user_obj = OrganizerRepository.get_user_by_id(user_id)
            
            
            # print(user_ob)
            
            if user_obj:
                # Update existing user
                user_data = {
                    'mobile_number': request_data.get('mobile_number'),
                    'country_code': request_data.get('country_code'),
                    'profile_image': request_data.get('profile_image')
                }
                OrganizerRepository.update_user(user_obj.id, user_data)
            else:
                raise ServiceError("User does not exist")
        else:
            raise ServiceError("User ID is required for update")

        # Update Organization if it exists
        if request_data.get('organization_name'):
            existing_organization = OrganizerRepository.get_organization_by_user_id(user_obj.id)
            if existing_organization:
                organization_data = {
                    'user_id': user_obj.id,
                    'organization_name': request_data.get('organization_name'),
                    'manager_name': request_data.get('manager_name'),
                    'about_us': request_data.get('about_us'),
                    'location': request_data.get('location'),
                    'latitude': request_data.get('latitude'),
                    'longitude': request_data.get('longitude'),
                    'foundation_date': request_data.get('foundation_date'),
                    'post_code': request_data.get('post_code'),
                    'school_thought': request_data.get('school_thought'),
                    'organization_type': request_data.get('organization_type'),
                    'sect_representation': request_data.get('sect_rep'),
                    'charity_registered': request_data.get('charity_registered', False),
                    'charity_no': request_data.get('charity_no'),
                    'updated_by': user_obj.id
                }
                OrganizerRepository.update_organization(existing_organization.id, organization_data)
            else:
                raise ServiceError("Organization does not exist")

        # Update Additional Information if it exists
        if request_data.get('additional_information'):
            for additional_data in request_data['additional_information']:
                existing_additional_info = OrganizerRepository.get_additional_info_by_user_id_and_question_id(
                    user_obj.id, additional_data.get('question_id',0))
                if existing_additional_info:
                    additional_data_to_update = {
                        "option_value": additional_data.get('option_value',False),
                        "answer": additional_data.get('answer',''),
                        "updated_by": user_obj.id
                    }
                    OrganizerRepository.update_additional_info(existing_additional_info.id, additional_data_to_update)
                else:
                     
                    additional_data_to_add = {
                        "user_id": user_obj.id,
                        "question_id": additional_data.get('question_id',0),
                        "option_value": additional_data.get('option_value',False),
                        "answer": additional_data.get('answer','')
                    }
                    OrganizerRepository.add_additional_info(additional_data_to_add)
                    #raise ServiceError("Additional Information does not exist")


       
        # Update Category and Subcategory Information if they exist
        OrganizerRepository.delete_organizer_category(user_obj.id)
        
        category_data_list = request_data.get('organizer_categories')
        if not category_data_list : 
            category_data_list== request_data.get('categories')

        # Check if category_data_list is a valid list
        if category_data_list and isinstance(category_data_list, list):
            for category_data in category_data_list:
                # Check if category ID is provided for update
                category_id = category_data.get('category_id')
                if category_id:
                    existing_organizer_category = OrganizerRepository.get_organizer_category(user_obj.id, category_id)
                    
                    
                    if existing_organizer_category:
                        organizer_category_data = {
                            'updated_by': user_obj.id
                        }
                        OrganizerRepository.update_organizer_category(existing_organizer_category.id, organizer_category_data)
                    else:
                        pass
                        
                        organizer_category_data = {
                            'user_id': user_obj.id,
                            'category_id': category_id,
                            'created_by': user_obj.id,
                            'updated_by': user_obj.id
                        }
                        # # raise ServiceError(f"Organizer Category with ID {category_id} does not exist")
                        existing_organizer_category = OrganizerRepository.add_organizer_category(
                        organizer_category_data)
                        
                        
                       
                    
                    
                    

                    organizer_subcategories = category_data.get('organizer_subcategories')
                    if not organizer_subcategories :
                        organizer_subcategories = category_data.get('subcategories')

                    if organizer_subcategories and isinstance(organizer_subcategories, list):
                        #raise ServiceError("Invalid format for 'organizer_subcategories'. Expected a list.")

                        for subcategory in organizer_subcategories:
                            subcategory_id = subcategory.get('subcategory_id')
                            if subcategory_id:
                                existing_organizer_subcategory = OrganizerRepository.get_organizer_subcategory(
                                    existing_organizer_category.id, subcategory_id
                                )
                                if existing_organizer_subcategory:
                                    organizer_subcategory_data = {
                                        'updated_by': user_obj.id
                                    }
                                    OrganizerRepository.update_organizer_subcategory(
                                        existing_organizer_subcategory.id, organizer_subcategory_data
                                    )
                                else:
                                    
                                    organizer_subcategory_data = {
                                        'organizer_category_id': existing_organizer_category.id,
                                        'subcategory_id': subcategory_id,
                                        'created_by': user_obj.id,
                                        'updated_by': user_obj.id
                                    }
                                
                                    OrganizerRepository.add_organizer_subcategory(
                                    organizer_subcategory_data)
                                
                                
                            else:
                                raise ServiceError("Subcategory ID is required for update")
                                            
                    
                    
                    
                    
        #else:
        #    raise ServiceError("Invalid or missing 'organizer_categories' data")
 
        
        response_data = {"message": "Updated Successfully"} 
      
        return response_data

    
    
    @staticmethod
    @handle_service_errors
    def send_otp(request_data):
        if 'mobile_number' in request_data and request_data['mobile_number']:    
            users = user.mobile_check(request_data['mobile_number'], OrganizerService.role_type,request_data['country_code'])
 
        is_register = True if users else False
        if users and users.status in [2, 3]:
            raise ServiceError('User is inactive')
    
        # if user.send_otp(request_data,OrganizerService.role_type):
        #     return {'message': 'OTP sent successfully', 'is_register': is_register}
        # else:
        #    raise ServiceError('Failed to send OTP')
        otp_entry = user.send_otp(request_data, OrganizerService.role_type)

        if not otp_entry:
            raise ServiceError('Failed to generate OTP')

        if isinstance(otp_entry, str) and otp_entry == "limit":
            raise ServiceError('OTP limit exceeded. You can request only 5 OTPs every 10 minutes')

        otp_code = otp_entry.otp
        country_code = request_data.get('country_code', '')
        mobile_number = request_data.get('mobile_number', '')

        if not send_sms(country_code, mobile_number, otp_code):
            raise ServiceError('Failed to send OTP')


        return {
            'message': 'OTP sent successfully',
            'is_register': is_register
        }
       
       
    @staticmethod
    @handle_service_errors
    def verify_otp(request_data):
        if 'mobile_number' in request_data and request_data['mobile_number']:       
            otp_record = user.verify_otp(request_data['mobile_number'], request_data['otp'],OrganizerService.role_type,request_data['country_code'])
            
            
            

            if isinstance(otp_record, dict) and 'error' in otp_record:
               raise ServiceError('Invalid OTP')
                
            register_users=user.get_user(request_data['mobile_number'],OrganizerService.role_type,request_data['country_code'])
            if not register_users:
                return {'message': 'OTP verified successfully', 'is_register': False}
            
            
            
            
      
                
            if register_users.status in [2, 3]:
                raise ServiceError('User is inactive')
            
            
            organization = OrganizerRepository.get_organization_by_user_id(register_users.id)
            
            
            
            
                        
            access_token = user.generate_token(register_users, OrganizerService.role_type, auth_method="otp")
                    
            return {'message': 'OTP verified successfully', 'access_token': access_token, 'is_register': True,'user_profile_image': register_users.profile_image,'organization_name': organization.organization_name if organization else '','user_email_id': register_users.email_id,'user_status': register_users.status, **OrganizerService._application_payload(register_users.id)}
        
        
    @staticmethod
    @handle_service_errors
    def email_send_otp(request_data):
        """
        Validate email, check user status, generate OTP, and send email in the background.
        """
        if 'email_id' not in request_data or not request_data['email_id']:
            raise ServiceError('invalid_email_id')

        # Check user status
        users = user.email_check(request_data['email_id'], OrganizerService.role_type)
        is_register = True if users and users.status == 1 else False

        if users and users.status in [2, 3]:
            raise ServiceError('user is in active')

        # Generate OTP
        otp_sent = user.send_otp(request_data, OrganizerService.role_type)
        if not otp_sent:
             raise ServiceError('Failed to generate OTP')

        if isinstance(otp_sent, str) and otp_sent == 'limit':
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
        
        return {'message': 'otp sent successfully', 'is_register': is_register}
    

    @staticmethod
    @handle_service_errors
    def email_verify_otp(request_data):
        if 'email_id' in request_data and request_data['email_id']:       
            otp_record = user.email_verify_otp(request_data['email_id'], request_data['otp'],OrganizerService.role_type)

            if isinstance(otp_record, dict) and 'error' in otp_record:
               raise ServiceError('invalid otp')
                
            register_users=user.get_user_email(request_data['email_id'],OrganizerService.role_type)
            if not register_users:
                return {'message': 'otp verify successfully', 'is_register': False}
                
            if register_users.status in [2, 3]:
                raise ServiceError('Your account has been deactivated')

            organization = OrganizerRepository.get_organization_by_user_id(register_users.id)    
            access_token = user.generate_token(register_users, OrganizerService.role_type, auth_method="otp")
                    
            return {'message': 'OTP verified successfully', 'access_token': access_token, 'is_register': True,'user_profile_image': register_users.profile_image,'organization_name': organization.organization_name if organization else '','user_email_id': register_users.email_id,'user_status': register_users.status, **OrganizerService._application_payload(register_users.id)}

   
    @staticmethod
    @handle_service_errors
    def login_password(request_data):    
        email_id = request_data.get('email_id')
        password = request_data.get('password')

        if not user.email_check(email_id,OrganizerService.role_type):
            raise ServiceError('This account with not register with us')
                
        # Pending organisers must be able to authenticate far enough to see
        # their application status. The normal password repository query only
        # returns active users, which incorrectly turned a valid pending
        # password into "Invalid password". Keep deactivated/deleted users
        # blocked while allowing the restricted status token below.
        obj = user.check_password_only(email_id, password, OrganizerService.role_type)
        if isinstance(obj, dict) and 'error' in obj:    
            raise ServiceError('Invalid password')

        if obj.status in [2, 3]:
            raise ServiceError('Your account has been deactivated')
                
        profile_user = user.get_userby_id(obj.id)
            
        access_token = user.generate_token(obj,OrganizerService.role_type)

            
        response_data = {
            'access_token': access_token,
            'user_profile_image': profile_user.profile_image if profile_user else None,
            'user_status': obj.status,
            **OrganizerService._application_payload(obj.id),
        }
        if obj.status != 1:
            response_data['message'] = 'Your organisation application is still under review.'
        return response_data
        
        
    @staticmethod
    @handle_service_errors
    def change_password(request_data, session_id):
        old_password = request_data.get('old_password')
        new_password = request_data.get('new_password')

        if not new_password:
            raise ServiceError('New password required')

        password_errors = password_strength_errors(new_password)
        if password_errors:
            raise ServiceError(password_errors[0])

        user_obj = user.get_userby_id(session_id)
        if not user_obj or user_obj.role_type != OrganizerService.role_type:
            raise ServiceError('User not found')

        # Prove the caller owns the account, not just a session token:
        #  - in-app change: the current password must be supplied and correct;
        #  - forgot-password: the token must come from an OTP verification issued
        #    in the last few minutes (see is_recent_otp_session);
        #  - an account with no password yet (social sign-up) may set its first one.
        if old_password:
            if not user.verify_current_password(user_obj, old_password):
                raise ServiceError('Current password is incorrect')
        elif user_obj.password and not is_recent_otp_session(get_request_token_claims()):
            raise ServiceError(
                'Current password is required. If you forgot it, verify your OTP again to reset it.'
            )

        update_result = user.update_user_password(user_obj, new_password)
        if not update_result:
            raise ServiceError('Failed to update password')

        return {'message': 'password updated successfully'}


        
        
    
     
    
    @staticmethod
    @handle_service_errors
    def get_profile(organizer_id):
        
        
        organization = OrganizerRepository.get_organization_by_user_id(organizer_id)
        
        
        get_participants_count = OrganizerRepository.get_participants_count_all(organizer_id)
        event_created = OrganizerRepository.event_created(organizer_id)
        total_cources = OrganizerRepository.total_cources(organizer_id)
        
        
        
        if not organization:
            raise ServiceError(f"User with ID {organizer_id} not found")
        
        # Prepare user details response
        organization_details = {
            
                "ticket_solds": get_participants_count,
                "event_created": event_created,
                "total_cources": total_cources,
                 
            
                
               
                "id": organization.user.id,
                "session_id": organizer_id,
                "email_id": organization.user.email_id,
                "mobile_number": organization.user.mobile_number,
                "country_code": organization.user.country_code,
                "profile_image":organization.user.profile_image,
                
                "organization_name": organization.organization_name,
                "manager_name": organization.manager_name,
                "location": organization.location,
                "about_us": organization.about_us,
                "status": organization.user.status,
                "latitude": organization.latitude,
                "longitude": organization.longitude,
                "foundation_date": organization.foundation_date.strftime("%Y-%m-%d"),
                "post_code": organization.post_code,
                "sect_representation": organization.sec_type.title,
                "sect_rep": organization.sect_representation,
       
                "school_thought_title": organization.school_of_thought.title,
                "school_thought": organization.school_thought,
                
                "charity_registered": organization.charity_registered,
                "charity_no": organization.charity_no,
                # Fetch categories and subcategories associated with the user
                "categories": OrganizerService.get_category_details(organization.user.id),
                # Fetch additional information associated with the user
                "additional_information": OrganizerService.get_additional_info(organization.user.id)
        }

        return organization_details

 
    @staticmethod
    def get_category_details(user_id):
        """Get categories and subcategories associated with the user."""
        categories = OrganizerRepository.get_categories_by_user_id(user_id)
        category_details = []
        for category in categories:
            subcategories = OrganizerRepository.get_subcategories_by_category_id(category.id)
            category_details.append({
                "category_id": category.category_id,
                "category_name": category.category.title,
                "subcategories": [
                    {
                        "subcategory_id": subcategory.subcategory_id,
                        "subcategory_name": subcategory.subcategory.title
                    }
                    for subcategory in subcategories
                ]
            })
        return category_details

    @staticmethod
    def get_additional_info(user_id):
        """Get additional information associated with the user."""
        additional_infos = OrganizerRepository.get_additional_info_by_user_id(user_id)
        return [
            {
                "question": additional_info.question.question, 
                "question_id": additional_info.question_id,
                "option_value": additional_info.option_value,
                "answer": additional_info.answer
            }
            for additional_info in additional_infos
        ]
    
    
     
    
  
        
    @staticmethod
    @handle_service_errors
    def getRegistrationQuestion(request_data):
        request_data = {'type': 1}
        obj = OrganizerRepository.getRegistrationQuestion(request_data)
        return obj
        
  
    @staticmethod
    @handle_service_errors
    def getRegistrationSect():
        obj = OrganizerRepository.getRegistrationSect()
        return obj


    @staticmethod
    @handle_service_errors
    def getRegistrationSchoolType():
        obj = OrganizerRepository.getRegistrationSchoolType()
        return obj
        
  
    @staticmethod
    @handle_service_errors
    def getCategoryList():
        obj = CategoryRepository.appCategories()
        return obj
        
    @staticmethod
    @handle_service_errors
    def getSubCategoryList(request_data):
        obj = SubCategoryRepository.appSubCategories(request_data)
        return obj
    
    
    
    @staticmethod
    @handle_service_errors
    def buddy_list(session_id):
        obj = BuddyRepository.get_users(session_id)
        
        return [
            {
                
                "id": data.id,
                "first_name": data.first_name, 
                "last_name": data.last_name,
                "email_id": data.email_id,
                "mobile_number": data.mobile_number,
                "country_code": data.country_code,
                "profile_image": data.profile_image
            }
            for data in obj
        ]
        
        
        
        
    @staticmethod
    @handle_service_errors
    def buddy_detail(id):
        
        
        obj = BuddyRepository.get_user_by_id(id)
        

        return {
            "id": obj.id,
            "parent_id": obj.parent_id,
            "profile_image": obj.profile_image,
            "country_code": obj.country_code,
            "mobile_number": obj.mobile_number,
            "status": obj.status,
            "first_name": obj.first_name,
            "last_name": obj.last_name,
            "email_id": obj.email_id,
        }
        
        
    @staticmethod 
    @handle_service_errors
    def buddy_add(request_data, session_id):
        # Check if the email and mobile number already exist
        email_id = request_data.get('email_id')
        country_code = request_data.get('country_code')
        mobile_number = request_data.get('mobile_number')
        
        # Check if user already exists
        OrganizerService.check_exists(
            email_id, user.email_check, 'Email ID already exists', 5)
            #email_id, user.email_check, 'Email ID already exists', 5, session_id)
        OrganizerService.check_exists(
            mobile_number, user.mobile_check, 'Mobile number already exists', 5, country_code)
            #mobile_number, user.mobile_check, 'Mobile number already exists', 5, country_code, session_id)
        
        # user_status = 1
        
        
        # Create a new user
        user_data = {
            'role_type': 5,
            'parent_id': session_id,
            'created_by': session_id,
            
            'first_name': request_data.get('first_name'),
            'last_name': request_data.get('last_name'),
              
            'email_id': request_data.get('email_id'), 
            'mobile_number': request_data.get('mobile_number'),
            'country_code': request_data.get('country_code'),
            'status': 1,
            'password': generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256'),
            'profile_image': request_data.get('profile_image')
        }
        user_obj = OrganizerRepository.add_user(user_data)
        
       

        return {"message": "Buddy User Created Successfully"}
    
    
    
    
    
    
    @staticmethod
    @handle_service_errors
    def buddy_delete(request_data, session):
        
        
        user_id = request_data.get('id')
        BuddyRepository.delete_user(user_id,session)
        
        return {"message": "Buddy User deleted Successfully"}
        
        
        
    
    
    
    @staticmethod
    @handle_service_errors
    def buddy_update(request_data, session_id):        
        
        user_id =  request_data.get('id')
        email_id = request_data.get('email_id')
        country_code = request_data.get('country_code')
        mobile_number = request_data.get('mobile_number')
        
        if user_id:
            #if user.email_check_update(email_id, 5, user_id,session_id):
            if user.email_check_update(email_id, 5, user_id):
                raise ServiceError('Email ID already exists')

            #if user.mobile_check_update(mobile_number, 5, user_id, country_code,session_id):
            if user.mobile_check_update(mobile_number, 5, user_id, country_code):
                raise ServiceError('Mobile number already exists')

            user_obj = BuddyRepository.get_user_by_id(user_id)
            
            
            if user_obj:
                user_data = {
                    'updated_by': session_id,
                    'mobile_number': request_data.get('mobile_number'),
                    'email_id': request_data.get('email_id'),
                    'country_code': request_data.get('country_code'),
                    'profile_image': request_data.get('profile_image'),
                    'first_name': request_data.get('first_name'),
                    'last_name': request_data.get('last_name')
                }
                BuddyRepository.update_user(user_obj.id, user_data)
            else:
                raise ServiceError("User does not exist")
        else:
            raise ServiceError("User ID is required for update") 
        
        return {"message": "Buddy User updated Successfully"}
    

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
    
