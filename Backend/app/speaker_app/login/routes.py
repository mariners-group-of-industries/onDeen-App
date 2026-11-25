from flask import request
from . import login_bp
from app.services.speaker.speaker import SpeakerService
from app.services.speaker.organizer import OrganizerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.organizer_validators import validate_login_verify_otp_data,validate_login_send_otp_data
from app.utils.response_decorators import handle_service_errors, handle_service_success


SPEAKER_ROLE_TYPE = 4 # speaker role type

@login_bp.route('/send_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_send_otp(session_id=None):
    request_data = request.get_json()
    validate_login_send_otp_data(request_data)
    response_data = SpeakerService.send_otp(request_data,role_type=SPEAKER_ROLE_TYPE)
    return response_data


@login_bp.route('/verify_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_verify_otp(session_id=None):
    request_data = request.get_json()
    validate_login_verify_otp_data(request_data)
    response_data = SpeakerService.verify_otp(request_data,role_type=SPEAKER_ROLE_TYPE)
    return response_data


@login_bp.route('/email_send_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def email_send_otp():
    request_data = request.get_json()
    response_data = SpeakerService.email_send_otp(request_data,role_type=SPEAKER_ROLE_TYPE)
    return response_data


@login_bp.route('/email_verify_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def email_verify_otp():
    request_data = request.get_json()
    response_data = SpeakerService.email_verify_otp(request_data,role_type=SPEAKER_ROLE_TYPE)
    return response_data



@login_bp.route('/register', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login(session_id=None):
    request_data = request.get_json()
    #validate_organizer_data(request_data)
    response_data = SpeakerService.register(request_data,session_id,role_type=SPEAKER_ROLE_TYPE)
    return response_data 




@login_bp.route('/get_profile', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_profile(session_id):
    response_data = SpeakerService.get_profile(session_id)
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
    response_data = SpeakerService.insert_push_token(token,request_data)
    return response_data



@login_bp.route('/send_email', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def send_email(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.send_email(request_data, session_id)
    return response_data