from app.repositories.user import user
from app.repositories.organizer import OrganizerRepository
from app.repositories.speakers import SpeakerRepository
from werkzeug.security import generate_password_hash
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from app import db
from app.models.organizer_application import OrganizerApplication
from app.models.users import Notification_History, Users
from app.services.organizer_application_storage import ensure_organizer_application_storage
from datetime import datetime

class OrganizerService:
    role_type = 3
    APPLICATION_STATUSES = {"UNDER_REVIEW", "NEEDS_MORE_INFO", "APPROVED", "REJECTED"}
    REVIEW_STATUSES = {"APPROVED", "NEEDS_MORE_INFO", "REJECTED"}

    @staticmethod
    def _application_payload(application):
        return {
            "id": application.id,
            "user_id": application.user_id,
            "status": application.status,
            "submitted_on": application.submitted_on.isoformat() if application.submitted_on else None,
            "reviewed_on": application.reviewed_on.isoformat() if application.reviewed_on else None,
            "reviewed_by": application.reviewed_by,
            "review_note": application.review_note,
        }

    @staticmethod
    @handle_service_errors
    def list_applications(status=None, admin_id=None):
        ensure_organizer_application_storage()
        if admin_id is not None and Users.query.filter_by(id=admin_id, role_type=1, status=1).first() is None:
            raise ServiceError("Admin access is required")
        query = OrganizerApplication.query.join(Users, Users.id == OrganizerApplication.user_id)
        if status:
            normalized = str(status).strip().upper()
            if normalized not in OrganizerService.APPLICATION_STATUSES:
                raise ServiceError("Invalid application status")
            query = query.filter(OrganizerApplication.status == normalized)
        applications = query.order_by(OrganizerApplication.submitted_on.asc()).all()
        return {
            "applications": [
                {
                    **OrganizerService._application_payload(application),
                    "email_id": application.user.email_id,
                    "mobile_number": application.user.mobile_number,
                    "organization_name": (
                        application.user.organizations[0].organization_name
                        if application.user.organizations
                        else ""
                    ),
                }
                for application in applications
            ]
        }

    @staticmethod
    @handle_service_errors
    def review_application(request_data, admin_id):
        ensure_organizer_application_storage()
        admin = Users.query.filter_by(id=admin_id, role_type=1, status=1).first()
        if admin is None:
            raise ServiceError("Admin access is required")
        try:
            application_id = int(request_data.get("application_id"))
        except (TypeError, ValueError):
            raise ServiceError("Application ID is required")
        decision = str(request_data.get("status") or "").strip().upper()
        if decision not in OrganizerService.REVIEW_STATUSES:
            raise ServiceError("Review status must be APPROVED, NEEDS_MORE_INFO or REJECTED")

        application = OrganizerApplication.query.filter_by(id=application_id).first()
        if application is None:
            raise ServiceError("Organisation application not found")
        applicant = Users.query.filter_by(id=application.user_id, role_type=3).first()
        if applicant is None:
            raise ServiceError("Organisation applicant not found")

        application.status = decision
        application.reviewed_by = admin_id
        application.reviewed_on = datetime.utcnow()
        application.review_note = str(request_data.get("review_note") or "").strip() or None
        # Only approval unlocks the normal organiser surface.  A request for
        # information and rejection stay non-publishable.
        applicant.status = 1 if decision == "APPROVED" else 0

        task_id = f"organizer-application:{application.id}:{decision.lower()}"
        if Notification_History.query.filter_by(
            user_id=applicant.id,
            task_id=task_id,
        ).first() is None:
            message = {
                "APPROVED": "Your organisation application was approved. Full organiser access is now available.",
                "NEEDS_MORE_INFO": "More information is required before your organisation can be approved.",
                "REJECTED": "Your organisation application was not approved.",
            }[decision]
            db.session.add(Notification_History(
                user_id=applicant.id,
                type=7,
                send_to=3,
                task_id=task_id,
                title=f"Organisation application {decision.replace('_', ' ').title()}",
                message=message,
                push=False,
                sms=False,
                email=False,
                seen=0,
                status=1,
            ))
        db.session.commit()
        return {
            "application": OrganizerService._application_payload(application),
            "user_status": applicant.status,
            "message": "Organisation application reviewed.",
        }


    @staticmethod
    @handle_service_errors
    def wallet_transactions(data,session):
        obj = OrganizerRepository.wallet_transactions(data,session)
        return obj
    


    @staticmethod
    @handle_service_errors
    def wallet_tranfer(request_data,session):
        admin = Users.query.filter_by(id=session, role_type=1, status=1).first()
        if not admin:
            raise ServiceError("Admin access is required")
        from app.services.payment import PaymentService
        if PaymentService._enabled():
            raise ServiceError("Legacy manual withdrawal is retired; Payment P0 payouts are automatic")
        obj = OrganizerRepository.wallet_tranfer(request_data,session)
        return obj
    

    

    @staticmethod
    @handle_service_errors
    def register(request_data, session_id):
        # Check if the email and mobile number already exist
        user_id = request_data.get('id')
        email_id = request_data.get('email_id')
        country_code = request_data.get('country_code')
        mobile_number = request_data.get('mobile_number')
        if user_id:
            if user.email_check_update(email_id, OrganizerService.role_type,user_id):
                raise ServiceError('Email ID already exists')

            if user.mobile_check_update(mobile_number,OrganizerService.role_type, user_id,country_code):
                raise ServiceError('Mobile number already exists')
       
    
        else:
            OrganizerService.check_exists(
                email_id, user.email_check, 'Email ID already exists', OrganizerService.role_type)
            OrganizerService.check_exists(
                mobile_number, user.mobile_check, 'Mobile number already exists', OrganizerService.role_type,country_code)

        # Check if user exists, update if exists else create new user
        user_obj = OrganizerRepository.get_user_by_id(user_id)
        
        if not user_obj:
            user_data = {
                'role_type': OrganizerService.role_type,
                'email_id': request_data.get('email_id'),
                # 'journey_level_id': request_data.get('journey_level_id'),
                'mobile_number': request_data.get('mobile_number'),
                'country_code': request_data.get('country_code'),
                'profile_image': request_data.get('profile_image'),
                'password': generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256')
            }
            user_obj = OrganizerRepository.add_user(user_data)
        else:
            user_data = {
                'email_id': request_data.get('email_id'),
                # 'journey_level_id': request_data.get('journey_level_id'),
                'mobile_number': request_data.get('mobile_number'),
                'country_code': request_data.get('country_code'),
                'profile_image': request_data.get('profile_image'),
                'status': request_data.get('status')
            }
            if request_data.get('password'):
                user_data['password'] = generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256')
                
            OrganizerRepository.update_user(user_obj.id, user_data)

        # Add or update Organization
        if request_data.get('organization_name'):
            organization_data = {
                'user_id': user_obj.id,
                'verify_event': request_data.get('verify_event',1),
                'organization_name': request_data.get('organization_name'),
                'manager_name': request_data.get('manager_name'),
                'location': request_data.get('location'),
                'about_us': request_data.get('about_us'),
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
            existing_organization = OrganizerRepository.get_organization_by_user_id(user_obj.id)
            if existing_organization:
                OrganizerRepository.update_organization(existing_organization.id, organization_data)
            else:
                OrganizerRepository.add_organization(organization_data)

        # Add or update Additional information
        if request_data.get('additional_information'):
            for additional_data in request_data['additional_information']:
                additional_data_to_add = {
                    "user_id": user_obj.id,
                    "question_id": additional_data.get('question_id'),
                    "option_value": additional_data.get('option_value'),
                    "answer": additional_data.get('answer')
                }
                existing_additional_info = OrganizerRepository.get_additional_info_by_user_id_and_question_id(
                    user_obj.id, additional_data.get('question_id'))
                if existing_additional_info:
                    OrganizerRepository.update_additional_info(
                        existing_additional_info.id, additional_data_to_add)
                else:
                    OrganizerRepository.add_additional_info(additional_data_to_add)
        
        
    
          
        # Update Category and Subcategory Information if they exist
        OrganizerRepository.delete_organizer_category(user_obj.id)       

        # Add or update Categories and Subcategories
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
       

        return {"message": "Organizer Updated Successfully" if user_obj else "Organizer Created Successfully"}

    def check_exists(value, check_func, error_message, *args):
        if check_func(value, *args):
            raise ServiceError(error_message)
    
     
    
    @staticmethod
    @handle_service_errors
    def get_details_by_id(request_data):
        
        user_id = request_data.get('id')
      
        organization = OrganizerRepository.get_organization_by_user_id(user_id)
        if not organization:
            raise ServiceError(f"User with ID {user_id} not found")

        # Prepare user details response
        organization_details = {
                "user_id":organization.user.id,
                "email_id": organization.user.email_id,
                "mobile_number": organization.user.mobile_number,
                "country_code": organization.user.country_code,
                "role_type": organization.user.role_type,
                "profile_image":organization.user.profile_image,
                "status":organization.user.status,
                "organization_name": organization.organization_name,
                "manager_name": organization.manager_name,
                "location": organization.location,
                "about_us": organization.about_us,
                "verify_event": organization.verify_event,
                "latitude": organization.latitude,
                "longitude": organization.longitude,
                "foundation_date": organization.foundation_date,
                "post_code": organization.post_code,
                "sect_representation": organization.sec_type.title,
                "sect_representation_id": organization.sect_representation,
       
                "school_thought": organization.school_of_thought.title,
                "school_thought_id": organization.school_thought,
                
                "charity_registered": organization.charity_registered,
                "charity_no": organization.charity_no,
                # Fetch categories and subcategories associated with the user
                "organizer_categories": OrganizerService.get_category_details(user_id),
                # Fetch additional information associated with the user
                "additional_information": OrganizerService.get_additional_info(user_id)
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
                "organizer_subcategories": [
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
    def get_all_organizer(request_data):
        obj = OrganizerRepository.get_all_organizer(request_data,1000)
        return obj
    
    @staticmethod
    @handle_service_errors
    def get_all_organizer_speakers(request_data):
        obj = OrganizerRepository.get_all_organizer(request_data,1000)        
        
        
        speakers = SpeakerRepository.get_all_speakers(request_data, limit=1000)
        for speaker in speakers:
            obj['organizers'].append({
                    "user_id": speaker.id,
                    "id": speaker.id,
                    "organization_name": speaker.first_name+" "+speaker.last_name,
                    "email_id": speaker.email_id,
                    "mobile_number": speaker.mobile_number,
                    "country_code": speaker.country_code,
                    "role_type": speaker.role_type,
                    "status": speaker.status,
                    'created_on': speaker.created_on.strftime('%Y-%m-%d %H:%M:%S') if speaker.created_on else None,
                    "profile_image": speaker.profile_image
            })
        
        

        return obj
    
    
    @staticmethod
    @handle_service_errors
    def deleteOrganization(request_data):
        organiser_id=request_data.get('id')
        obj = OrganizerRepository.delete_organization(organiser_id)
        return {"message": "Organizer deleted Successfully"}
    
    @staticmethod
    @handle_service_errors
    def getRegistrationQuestion(request_data):
        obj = OrganizerRepository.getRegistrationQuestion(request_data)
        return obj
        
    @staticmethod
    @handle_service_errors
    def getRegistrationType():
        obj = OrganizerRepository.getRegistrationType()
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
        
  


