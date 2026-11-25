from app.repositories.user import user
from app.repositories.membership import MembershipRepository
from app.services.customer.gamification import GamificationService
from app.models.event import JourneyLevel
from app.utils.custom_exception import ServiceError
from app.utils.validators import password_strength_errors
from app.utils.auth_decorators import get_request_token_claims, is_recent_otp_session
from app.utils.response_decorators import handle_service_errors
from app.utils.notification import send_sms,send_email
import os
from app.utils.load_notification_template import load_email_template



class CustomerService:
    role_type =2
    PRIVACY_FIELDS = (
        'show_course',
        'show_events',
        'show_reviews',
        'show_journeylevel',
        'show_awards',
        'show_mobile_number',
    )

    @staticmethod
    def validate_learning_preference(journey_level_id):
        """Validate the User preference without treating it as earned rank."""
        try:
            level_id = int(journey_level_id)
        except (TypeError, ValueError):
            raise ServiceError('Learning preference is invalid')
        level = JourneyLevel.query.filter_by(id=level_id, status=1).first()
        if level is None or str(level.title or '').strip().lower() == 'suitable for all':
            raise ServiceError('Learning preference is invalid')
        return level_id

    @staticmethod
    def _validate_privacy_payload(request_data):
        if not isinstance(request_data, dict):
            raise ServiceError('Privacy settings are required')

        provided = {
            field: request_data[field]
            for field in CustomerService.PRIVACY_FIELDS
            if field in request_data
        }
        if not provided:
            raise ServiceError('Privacy settings are required')

        invalid = [field for field, value in provided.items() if value not in (0, 1)]
        if invalid:
            raise ServiceError('Privacy settings must be 0 or 1')

        return {field: int(value) for field, value in provided.items()}


    @staticmethod
    @handle_service_errors
    def delete_account(session_id,bearer_token):

        session_obj = user.logout(session_id,bearer_token)
        user_obj = user.delete_account(session_id)
        
        
        return {'message':'deleted_successfully'} 
    
    @staticmethod
    @handle_service_errors
    def logout(session_id,bearer_token):

        session_obj = user.logout(session_id,bearer_token)
        if session_obj:
            return {'message':'logged_out_successfully'} 
    
    

    @staticmethod
    @handle_service_errors
    def register(request_data, session_id):
        # Step 1: Validate email if provided
        if 'email_id' in request_data and request_data['email_id']:
            CustomerService._validate_email(request_data)

        # Step 2: Validate mobile number and OTP
        user_id = CustomerService._validate_mobile_and_otp(request_data)

        # Step 3: Handle user registration or updates
        user_obj = CustomerService._handle_user_registration_or_update(request_data)

        # Step 4: Generate UUID and prepare the response
        response = CustomerService._prepare_response(user_obj)

        
        return response
        
    
    @staticmethod
    @handle_service_errors
    def check_version(getData):
        # getData = {
            # "android_version": "1.1.3",
            # "ios_version": "1.1"
        # }
        msg = {
            "android_update": "0",
            "force_android_update": "0",
            "ios_update": "0",
            "force_ios_update": "0"
        }

        # Allowed versions
        android_update = ["1.6","1.7","1.8"]
        force_android_update = ["1.6","1.7","1.8"]

        ios_update = ["1.1","1.2"]
        force_ios_update = ["1.1","1.2"]

        # Android checks
        if getData.get("android_version") not in android_update:
            msg["android_update"] = "1"

        if getData.get("android_version") not in force_android_update:
            msg["force_android_update"] = "1"

        # iOS checks
        if getData.get("ios_version") not in ios_update:
            msg["ios_update"] = "1"

        if getData.get("ios_version") not in force_ios_update:
            msg["force_ios_update"] = "1"

        return msg
        
     
    @staticmethod
    def _validate_email(request_data):
        CustomerService.check_exists(
            request_data['email_id'],
            user.email_check,
            'Email id already exists',
            CustomerService.role_type
        )

        if 'email_otp' in request_data:
            email_otp = str(request_data['email_otp']).strip() if isinstance(request_data['email_otp'], int) else request_data['email_otp']
            if email_otp and not user.email_recheck_otp(request_data['email_id'], email_otp, CustomerService.role_type):
                raise ServiceError('invalid_otp')

    @staticmethod
    def _validate_mobile_and_otp(request_data):
        user_id = CustomerService.check_mobile_exists(
            request_data['mobile_number'],
            user.mobile_check,
            request_data.get('provider'),
            request_data.get('email_id'),
            CustomerService.role_type,
            request_data['country_code']
        )

        if 'otp' in request_data and request_data['otp']:
            if not user.recheck_otp(
                request_data['mobile_number'],
                request_data['otp'],
                CustomerService.role_type,
                request_data['country_code']
            ):
                raise ServiceError('invalid_otp')

        return user_id

    @staticmethod
    def _handle_user_registration_or_update(request_data):
        if request_data.get('journey_level_id') not in (None, ''):
            request_data['journey_level_id'] = CustomerService.validate_learning_preference(
                request_data.get('journey_level_id')
            )
        user_obj = user.register_user(request_data, CustomerService.role_type)
        if isinstance(user_obj, dict) and 'error' in user_obj:
            raise ServiceError('unable_to_register_user')

            # Link social login if provided
        CustomerService._link_social_login(request_data, user_obj.id)
        return user_obj

    @staticmethod
    def _link_social_login(request_data, user_id):
        if 'provider' in request_data and request_data['provider']:
            user.add_user_by_social_id(
                request_data['social_id'],
                request_data['access_token'],
                request_data['provider'],
                user_id
            )

    @staticmethod
    def _prepare_response(user_obj):
        token = user.generate_token(user_obj, CustomerService.role_type)
        return {
            'access_token': token,
            'first_name': user_obj.first_name,
            'last_name': user_obj.last_name,
        }
    
    @staticmethod
    def check_exists(value, check_func, error_message, *args):
        if check_func(value, *args):
            raise ServiceError(error_message)
            

   
    @staticmethod
    def check_mobile_exists(mobile_number, check_func, provider, email_id, *args):

        """
        Checks if the mobile number exists and validates conditions based on the presence of a provider.
        - If `provider` is present:
            - Check if email ID is empty for the found user. If empty, return the user ID.
            - Otherwise, raise an error that the mobile number is linked to another account.
        - If `provider` is not present:
            - If the mobile number exists, raise an error message.
        """
        user_data = check_func(mobile_number, *args)  # Example: Returns user object or None

        if user_data:
            raise ServiceError('Mobile number already exists')

        return 0  # Mobile number does not exist
    
    
    
    
    @staticmethod
    @handle_service_errors
    def get_profile(business_id):
        user_obj = user.customer_profile(business_id)

        if isinstance(user_obj, dict) and 'error' in user_obj:
            raise ServiceError('Business not found')
        
        user_obj['attended_count']=user_obj.get('event_count',0)+user_obj.get('course_count',0)        
        user_obj['award_level'] = user.get_award_level(user_obj['attended_count'])
        user_obj['gamification'] = GamificationService.profile_payload(business_id)
    
        return user_obj

    @staticmethod
    @handle_service_errors
    def get_gamification_profile(session_id):
        return GamificationService.profile_payload(session_id)

    @staticmethod
    @handle_service_errors
    def get_gamification_summary(session_id):
        return GamificationService.pending_summary(session_id)

    @staticmethod
    @handle_service_errors
    def seen_gamification_summary(request_data, session_id):
        return GamificationService.mark_summary_seen(session_id, request_data.get("summary_id"))

    @staticmethod
    @handle_service_errors
    def submit_session_feedback(request_data, session_id):
        return GamificationService.submit_feedback(session_id, request_data)

    @staticmethod
    @handle_service_errors
    def skip_session_feedback(request_data, session_id):
        return GamificationService.skip_feedback(session_id, request_data)

    @staticmethod
    @handle_service_errors
    def get_notifications(session_id,request_data):
        user_obj = user.get_notifications(session_id,request_data)
        #user.update_seen_notifications(session_id)
        
        if isinstance(user_obj, dict) and 'error' in user_obj:
            raise ServiceError('Notifications not found')
    
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
    def update_profile(request_data, user_id):
        if request_data.get('journey_level_id') not in (None, ''):
            request_data['journey_level_id'] = CustomerService.validate_learning_preference(
                request_data.get('journey_level_id')
            )
        if user.email_check_update(request_data.get('email_id'),CustomerService.role_type, user_id):
            raise ServiceError("Email ID already exists")
        request_data['country_code']=None
        request_data['mobile_number']=None
        #if user.mobile_check_update(request_data.get('mobile_number'),CustomerService.role_type, user_id, request_data.get('country_code')):
        #    raise ServiceError("Mobile number already exists")
                
                
        profile_id = user.update_profile(request_data, user_id)
        if isinstance(profile_id, dict) and 'error' in profile_id:
            return {'message': 'Unable to update profile'}
        return {'message': 'Profile updated successfully', 'user_id': profile_id}
    
    
    @staticmethod
    @handle_service_errors
    def update_privacy(request_data, user_id):
        privacy_settings = CustomerService._validate_privacy_payload(request_data)
        profile_id = user.update_privacy(privacy_settings, user_id)
        if isinstance(profile_id, dict) and 'error' in profile_id:
            return {'message': 'Unable to update privacy settings'}
        return {'message': 'Privacy settings updated successfully', 'user_id': profile_id}
    
    
    
    @staticmethod
    @handle_service_errors
    def change_password(request_data, session_id):
 
        old_password = request_data.get('old_password')
        new_password = request_data.get('new_password')
        #confirm_password = request_data.get('confirm_password')

        

        # Check if new password and confirm password match
        # if new_password != confirm_password:
            # raise ServiceError('New password and confirm password do not match')
            
        if not new_password:
            raise ServiceError('New password required')

        password_errors = password_strength_errors(new_password)
        if password_errors:
            raise ServiceError(password_errors[0])

        # Get the user based on session ID
        user_obj = user.get_userby_id(session_id) if session_id else None
        if not user_obj:
            raise ServiceError('User not found')

        # Prove the caller owns the account, not just a session token:
        #  - in-app change (Settings): the current password must be correct;
        #  - forgot-password: the token must come from an OTP verification issued
        #    in the last few minutes (see is_recent_otp_session);
        #  - an account with no password yet (social sign-up) may set its first one.
        if old_password:
            data = user.verify_current_password(user_obj, old_password)
            if not data:
                raise ServiceError('Current password is incorrect')
        elif user_obj.password and not is_recent_otp_session(get_request_token_claims()):
            raise ServiceError(
                'Current password is required. If you forgot it, verify your OTP again to reset it.'
            )

        # Update the password to the new one
        update_result = user.update_user_password(user_obj, new_password)
        if not update_result:
            raise ServiceError('Failed to update password')

        return {'message': 'password updated successfully'}
    
    
    
    
    @staticmethod
    @handle_service_errors
    def send_otp(request_data):
        if 'mobile_number' in request_data and request_data['mobile_number']:    
            users = user.mobile_check(request_data['mobile_number'], CustomerService.role_type,request_data['country_code'])
 
        is_register = True if users else False
        if users and users.status in [2]:
            raise ServiceError('Your account has been deactivated')
    
        # if user.send_otp(request_data,CustomerService.role_type):
        #     return {'message': 'OTP sent successfully', 'is_register': is_register}
        # else:
        #    raise ServiceError('Failed to send OTP')
        
        # Call repo method to generate and save OTP, returns ORM object
        otp_entry = user.send_otp(request_data, CustomerService.role_type)

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
    def email_send_otp(request_data):
        """
        Validate email, check user status, generate OTP, and send email in the background.
        """
        if 'email_id' not in request_data or not request_data['email_id']:
            raise ServiceError('invalid_email_id')

        # Check user status
        users = user.email_check(request_data['email_id'], CustomerService.role_type)
        is_register = True if users and users.status == 1 else False

        if users and users.status in [2, 3]:
            raise ServiceError('user is in active')

        # Generate OTP
        otp_entry = user.send_otp(request_data, CustomerService.role_type)
        if not otp_entry:
            raise ServiceError('failed to send OTP')

        if isinstance(otp_entry, str) and otp_entry == 'limit':
            raise ServiceError('OTP limit exceeded. You can request only 5 OTPs every 10 minutes')

        email_id = otp_entry.email_id
        otp = otp_entry.otp
        
        subject, body = load_email_template("login_otp", OTP=otp)

        if email_id:
            send_email(email_body=body,subjects=subject,email_to=email_id,user_name=os.getenv("USER_NAME"),password=os.getenv("PASSWORD"))

        return {'message': 'OTP sent successfully', 'is_register': is_register}
    

    @staticmethod
    @handle_service_errors
    def email_verify_otp(request_data):
        if 'email_id' in request_data and request_data['email_id']:       
            otp_record = user.email_verify_otp(request_data['email_id'], request_data['otp'],CustomerService.role_type)

            if isinstance(otp_record, dict) and 'error' in otp_record:
               raise ServiceError('invalid otp')
                
            register_users=user.get_user_email(request_data['email_id'],CustomerService.role_type)
            if not register_users:
                return {'message': 'otp verify successfully', 'is_register': False}
            
            if register_users.status == 3:
                return {
                    'message': 'OTP verify successfully',
                    'is_register': False
                }
                
            if register_users.status in [0, 2]:
                raise ServiceError('Your account has been deactivated')
                        
            access_token = user.generate_token(register_users, CustomerService.role_type, auth_method="otp")
            active_membership_count = MembershipRepository.get_my_active_membership_count(register_users.id)
                    
            return {'message': 'OTP verified successfully', 'active_membership_count': active_membership_count,'access_token': access_token,'first_name': register_users.first_name,'status': register_users.status,'last_name': register_users.last_name, 'is_register': True}
    
       
       
    @staticmethod
    @handle_service_errors
    def verify_otp(request_data):
        if 'mobile_number' in request_data and request_data['mobile_number']:    
               
            otp_record = user.verify_otp(request_data['mobile_number'], request_data['otp'],CustomerService.role_type,request_data['country_code'])
            

            if isinstance(otp_record, dict) and 'error' in otp_record:
               raise ServiceError('Invalid OTP')
                
            register_users=user.get_user(request_data['mobile_number'],CustomerService.role_type,request_data['country_code'])
            if not register_users:
                return {'message': 'OTP verified successfully', 'is_register': False}
            
          
             
            if register_users.status in [0, 2, 3]:
                raise ServiceError('Your account has been deactivated')
            
                        
            access_token = user.generate_token(register_users, CustomerService.role_type, auth_method="otp")
            active_membership_count = MembershipRepository.get_my_active_membership_count(register_users.id)
            

                    
            return {'message': 'OTP verified successfully', 'active_membership_count': active_membership_count,'access_token': access_token,'first_name': register_users.first_name,'status': register_users.status,'last_name': register_users.last_name, 'is_register': True}
        
        
        

    @staticmethod
    @handle_service_errors
    def login(request_data):    
        email_id = request_data.get('email_id')
        password = request_data.get('password')

        if not user.email_check(email_id,CustomerService.role_type):
            raise ServiceError('This email is not registered with us')
                
        user_obj =user.check_password_only(email_id, password,CustomerService.role_type)
        if isinstance(user_obj, dict) and 'error' in user_obj:
            raise ServiceError('Invalid Password')
        if user_obj.status!=1:     
            raise ServiceError('Your account has been deactivated')
     
        access_token = user.generate_token(user_obj,CustomerService.role_type)
        active_membership_count = MembershipRepository.get_my_active_membership_count(user_obj.id)

            
        response_data = {
            'access_token': access_token,
            'active_membership_count': active_membership_count,
            'first_name': user_obj.first_name, 
            'last_name': user_obj.last_name,
        }
        return response_data
    



    @staticmethod
    @handle_service_errors
    def insert_push_token(token,request_data):
        push_token = user.insert_push_token(token,request_data)
        if isinstance(push_token, dict) and 'error' in push_token:
            raise ServiceError('unable_to_update_push_notification')
        return {'message': 'pushnotification inserted'}
    
    
    
    @staticmethod
    @handle_service_errors
    def upload_image(request_data,session):
        upload = user.upload_image(request_data)
        
        if isinstance(upload, dict) and 'error' in upload:
            raise ServiceError('unable_to_upload_file')
        return upload
    



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
    
