from app.repositories.user import user
from app.repositories.organizer import OrganizerRepository

from app.repositories.buddy import BuddyRepository

from app.repositories.category import CategoryRepository
from app.repositories.subcategory import SubCategoryRepository
from werkzeug.security import generate_password_hash
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from datetime import datetime
  
class OrganizerService: 
    role_type =3
    
    
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
        
        user_status = 0
        
        
        # Create a new user
        user_data = {
            'role_type': OrganizerService.role_type,
            'email_id': request_data.get('email_id'), 
            'mobile_number': request_data.get('mobile_number'),
            'country_code': request_data.get('country_code'),
            'status': user_status,
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
                    "question_id": additional_data.get('question_id'),
                    "option_value": additional_data.get('option_value'),
                    "answer": additional_data.get('answer')
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
        

        # Generate access token for the newly created user
        if user_obj:
            access_token = user.generate_token(user_obj, OrganizerService.role_type)
            response_data = {'access_token': access_token,'user_status': user_status,'user_profile_image': request_data.get('profile_image'),'organization_name': request_data.get('organization_name'),'user_email_id': request_data.get('email_id')}
        else:
            response_data = {"message": "Organizer Created Successfully"}

        return response_data

             
    
    
    @staticmethod
    @handle_service_errors
    def get_all_organizer(request_data):
        obj = OrganizerRepository.get_all_organizer(request_data,1000)
        return obj       

    
    def check_exists(value, check_func, error_message, *args):
        if check_func(value, *args):
            raise ServiceError(error_message)
    
 
    
    
    
       
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
                    user_obj.id, additional_data.get('question_id'))
                if existing_additional_info:
                    additional_data_to_update = {
                        "option_value": additional_data.get('option_value'),
                        "answer": additional_data.get('answer'),
                        "updated_by": user_obj.id
                    }
                    OrganizerRepository.update_additional_info(existing_additional_info.id, additional_data_to_update)
                else:
                     
                    additional_data_to_add = {
                        "user_id": user_obj.id,
                        "question_id": additional_data.get('question_id'),
                        "option_value": additional_data.get('option_value'),
                        "answer": additional_data.get('answer')
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
                                            
                    
                    
                    
                    
        else:
            raise ServiceError("Invalid or missing 'organizer_categories' data")
 
        
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
    
        if user.send_otp(request_data,OrganizerService.role_type):
            return {'message': 'OTP sent successfully', 'is_register': is_register}
        else:
           raise ServiceError('Failed to send OTP')
       
       
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
            
            
            
            
                        
            access_token = user.generate_token(register_users,OrganizerService.role_type)
                    
            return {'message': 'OTP verified successfully', 'access_token': access_token, 'is_register': True,'user_profile_image': register_users.profile_image,'organization_name': organization.organization_name,'user_email_id': register_users.email_id,'user_status': register_users.status}
        
        
        

   
    @staticmethod
    @handle_service_errors
    def login_password(request_data):    
        email_id = request_data.get('email_id')
        password = request_data.get('password')

        if not user.email_check(email_id,OrganizerService.role_type):
            raise ServiceError('This account with not register with us')
                
        obj =user.check_password(email_id, password,OrganizerService.role_type)
        if isinstance(obj, dict) and 'error' in obj:    
            raise ServiceError('Invalid password')
                
        profile =user.customer_profile(obj.id)
            
        access_token = user.generate_token(obj,OrganizerService.role_type)

            
        response_data = {
            'access_token': access_token,
            'user_profile_image': profile['profile_image']
        }
        return response_data
        
        
        
        
    
     
    
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
            email_id, user.email_check_parent, 'Email ID already exists', 5, session_id)
        OrganizerService.check_exists(
            mobile_number, user.mobile_check_parent, 'Mobile number already exists', 5, country_code, session_id)
        
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
            if user.email_check_update_parent(email_id, 5, user_id,session_id):
                raise ServiceError('Email ID already exists')

            if user.mobile_check_update_parent(mobile_number, 5, user_id, country_code,session_id):
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




