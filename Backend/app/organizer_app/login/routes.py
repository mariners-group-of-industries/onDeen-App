from flask import request
from . import login_bp
from app.services.organizer.organizer import OrganizerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.organizer_validators import validate_organizer_data,validate_login_verify_otp_data,validate_login_send_otp_data,validate_login_data
from app.utils.response_decorators import handle_service_errors, handle_service_success

 

@login_bp.route('/register', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def register(session_id =None):
    request_data = request.get_json()
    validate_organizer_data(request_data)
    print(request_data)
    if 'profile_image' not in request_data or not isinstance(request_data['profile_image'], str) or len(request_data['profile_image']) == 0:
        request_data['profile_image']='https://ondeen.app/assets/images/logo.svg'
    response_data = OrganizerService.register(request_data,session_id)
    return response_data


@login_bp.route('/get_profile', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_profile(session_id):
    response_data = OrganizerService.get_profile(session_id)
    return response_data


@login_bp.route('/application_status', methods=['GET'])
@auth_login_middleware(login_required=True, active_required=False)
@handle_service_errors
@handle_service_success
def application_status(session_id):
    """Allow a pending organiser to check review state without full access."""
    return OrganizerService.get_application_status(session_id)


@login_bp.route('/update_profile', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_profile(session_id):
    request_data = request.get_json()
    if 'profile_image' not in request_data or not isinstance(request_data['profile_image'], str) or len(request_data['profile_image']) == 0:
        request_data['profile_image']='https://ondeen.app/assets/images/logo.svg'
    response_data = OrganizerService.update_profile(request_data,session_id)
    return response_data



@login_bp.route('/send_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_send_otp(session_id=None):
    request_data = request.get_json()
    validate_login_send_otp_data(request_data)
    response_data = OrganizerService.send_otp(request_data)
    return response_data


@login_bp.route('/verify_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_verify_otp(session_id=None):
    request_data = request.get_json()
    validate_login_verify_otp_data(request_data)
    response_data = OrganizerService.verify_otp(request_data)
    return response_data



@login_bp.route('/email_send_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def email_send_otp():
    request_data = request.get_json()
    response_data = OrganizerService.email_send_otp(request_data)
    return response_data


@login_bp.route('/email_verify_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def email_verify_otp():
    request_data = request.get_json()
    response_data = OrganizerService.email_verify_otp(request_data)
    return response_data
     
     
@login_bp.route('/register_social', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def register_social(session_id=None):
    request_data = request.get_json()
    response_data = OrganizerService.register_social(request_data)
    return response_data


@login_bp.route('/login_password', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_verify_password(session_id=None):
    request_data = request.get_json()
    validate_login_data(request_data)
    response_data = OrganizerService.login_password(request_data)
    return response_data


@login_bp.route('/change_password', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def change_password(session_id):
    request_data = request.get_json()
    response_data = OrganizerService.change_password(request_data, session_id)
    return response_data



@login_bp.route('/delete_account', methods=['GET'])
@auth_login_middleware(login_required=True,active_required=False)
@handle_service_errors
@handle_service_success 
def delete_account(session_id):
    bearer_token = request.headers.get('Authorization')
    bearer_token = bearer_token[7:]
    response_data = OrganizerService.delete_account(session_id,bearer_token)
    return response_data



@login_bp.route('/logout', methods=['GET'])
@auth_login_middleware(login_required=True,active_required=False)
@handle_service_errors
@handle_service_success
def logout(session_id):
    bearer_token = request.headers.get('Authorization')
    bearer_token = bearer_token[7:]
    response_data = OrganizerService.logout(session_id,bearer_token)
    return response_data



@login_bp.route('/insert_push_token', methods=['POST'])
@auth_login_middleware(login_required=False,active_required=False)
@handle_service_errors
@handle_service_success
def insert_push_token(session_id):
    auth_header = request.headers.get("Authorization")
    request_data = request.get_json()
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    response_data = OrganizerService.insert_push_token(token,request_data)
    return response_data



@login_bp.route('/send_email', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def send_email(session_id):
    request_data = request.get_json()
    response_data = OrganizerService.send_email(request_data, session_id)
    return response_data
