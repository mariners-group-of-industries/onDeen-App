from flask import request
from . import login_bp
from app.services.speaker.speaker import SpeakerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success

BUDDY_ROLE_TYPE = 5  # Buddy role type


@login_bp.route('/send_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_send_otp(session_id=None):
    request_data = request.get_json()
    response_data = SpeakerService.send_otp(request_data,role_type=BUDDY_ROLE_TYPE)
    return response_data


@login_bp.route('/verify_otp', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login_verify_otp(session_id=None):
    request_data = request.get_json()
    response_data = SpeakerService.verify_otp(request_data,role_type=BUDDY_ROLE_TYPE)
    return response_data




@login_bp.route('/insert_push_token', methods=['POST'])
@auth_login_middleware(login_required=False)
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
