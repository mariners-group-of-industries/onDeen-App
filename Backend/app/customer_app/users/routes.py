from flask import request
from . import user_bp
from app.services.customer.customer import CustomerService
from app.services.customer.social import SocialService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.validators import validate_user_data,validate_login_send_otp_data,validate_login_verify_otp_data
from app.utils.response_decorators import handle_service_errors, handle_service_success
from app.utils.file_upload import upload_base64_file



@user_bp.route('/delete_account', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete_account(session_id):
    bearer_token = request.headers.get('Authorization')
    bearer_token = bearer_token[7:]
    response_data = CustomerService.delete_account(session_id,bearer_token)
    return response_data


@user_bp.route('/logout', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def logout(session_id):
    bearer_token = request.headers.get('Authorization')
    bearer_token = bearer_token[7:]
    response_data = CustomerService.logout(session_id,bearer_token)
    return response_data



@user_bp.route('/check_version', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def check_version(session_id=None):
    request_data = request.get_json()
    response_data = CustomerService.check_version(request_data)
    return response_data

@user_bp.route('/register', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def register(session_id =None):
    request_data = request.get_json()
    validate_user_data(request_data)
    response_data = CustomerService.register(request_data,session_id)
    return response_data


@user_bp.route('/get_profile', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_profile(session_id):
    response_data = CustomerService.get_profile(session_id)
    return response_data


@user_bp.route('/gamification_profile', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def gamification_profile(session_id):
    response_data = CustomerService.get_gamification_profile(session_id)
    return response_data


@user_bp.route('/gamification_summary', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def gamification_summary(session_id):
    response_data = CustomerService.get_gamification_summary(session_id)
    return response_data


@user_bp.route('/gamification_summary_seen', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def gamification_summary_seen(session_id):
    request_data = request.get_json() or {}
    response_data = CustomerService.seen_gamification_summary(request_data, session_id)
    return response_data


@user_bp.route('/session_feedback', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def session_feedback(session_id):
    request_data = request.get_json() or {}
    response_data = CustomerService.submit_session_feedback(request_data, session_id)
    return response_data


@user_bp.route('/session_feedback_skip', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def session_feedback_skip(session_id):
    request_data = request.get_json() or {}
    response_data = CustomerService.skip_session_feedback(request_data, session_id)
    return response_data


@user_bp.route('/get_notifications', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_notifications(session_id):
    request_data={}
    request_data["seen"] = request.args.get('seen')  # Get  from query parameters
    request_data["page"] = request.args.get('page')  # Get  from query parameters
    response_data = CustomerService.get_notifications(session_id,request_data)
    return response_data


@user_bp.route('/delete_notification', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete_nitification(session_id):
    request_data = request.get_json()
    response_data = CustomerService.delete_nitification(request_data,session_id)
    return response_data

@user_bp.route('/seen_notification', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def seen_notification(session_id):
    request_data = request.get_json()
    response_data = CustomerService.seen_notification(request_data,session_id)
    return response_data


@user_bp.route('/update_profile', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_profile(session_id):
    request_data = request.get_json()
    response_data = CustomerService.update_profile(request_data,session_id)
    return response_data



@user_bp.route('/update_privacy', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_privacy(session_id):
    request_data = request.get_json()
    response_data = CustomerService.update_privacy(request_data,session_id)
    return response_data



@user_bp.route('/change_password', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def change_password(session_id):
    request_data = request.get_json()
    #validate_login_send_otp_data(request_data)
    response_data = CustomerService.change_password(request_data,session_id)
    return response_data


@user_bp.route('/send_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_send_otp(session_id=None):
    request_data = request.get_json()
    validate_login_send_otp_data(request_data)
    response_data = CustomerService.send_otp(request_data)
    return response_data


@user_bp.route('/verify_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_verify_otp(session_id=None):
    request_data = request.get_json()
    validate_login_verify_otp_data(request_data)
    response_data = CustomerService.verify_otp(request_data)
    return response_data


@user_bp.route('/email_send_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def email_send_otp():
    request_data = request.get_json()
    response_data = CustomerService.email_send_otp(request_data)
    return response_data


@user_bp.route('/email_verify_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def email_verify_otp():
    request_data = request.get_json()
    response_data = CustomerService.email_verify_otp(request_data)
    return response_data
    
    
@user_bp.route('/login', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_password(session_id=None):
    request_data = request.get_json()
    #validate_login_data(request_data)
    response_data = CustomerService.login(request_data)
    return response_data
    
    
@user_bp.route('/image_upload', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def image_upload(session_id=None):
    request_data = request.get_json() 
    file=request_data.get('file')
    file_path=upload_base64_file(file)
    return file_path



@user_bp.route('/register_social', methods=['POST'])
@handle_service_errors
@handle_service_success
def register_social():
    """
    Handle registration or login via Facebook/Google/Apple
    """
    request_data = request.get_json()
    provider = request_data.get('provider')
    if provider == 'facebook':
        response_data = SocialService.facebook_user_profile(request_data['access_token'],provider)
    elif provider == 'google':
        response_data = SocialService.google_user_profile(request_data['access_token'],provider)
    elif provider == 'google2':
        response_data = SocialService.google_user_profile2(request_data,'google')
    elif provider == 'apple':
        response_data = SocialService.apple_user_profile(request_data['access_token'],provider)

    return response_data



@user_bp.route('/insert_push_token', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def insert_push_token(session_id):
    auth_header = request.headers.get("Authorization")
    request_data = request.get_json()
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    response_data = CustomerService.insert_push_token(token,request_data)
    return response_data




@user_bp.route('/upload_image', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def upload_image(session_id=None):
    request_data = request.get_json()
    response_data = CustomerService.upload_image(request_data,session_id)
    return response_data




@user_bp.route('/send_email', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def send_email(session_id):
    request_data = request.get_json()
    response_data = CustomerService.send_email(request_data, session_id)
    return response_data

 




    
    
    

    
