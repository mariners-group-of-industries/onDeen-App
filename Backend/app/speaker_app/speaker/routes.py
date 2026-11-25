from flask import request
from . import speaker_bp
from app.services.speaker.speaker import SpeakerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success

SPEAKER_ROLE_TYPE = 4  # speaker role type



@speaker_bp.route('/get_expertise', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_expertise(session_id=None):
    response_data = SpeakerService.get_expertise()
    return response_data




@speaker_bp.route('/listing', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def listing(session_id):
    request_data = request.get_json()
    request_data['session_id'] = session_id
    response_data = SpeakerService.get_all_speakers(request_data)
    return response_data
    
    
@speaker_bp.route('/get_by_id', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_by_id(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.get_details_by_id(request_data)
    return response_data


@speaker_bp.route('/delete', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.deleteSpeaker(request_data)
    return response_data