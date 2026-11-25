from flask import request
from . import speakers_bp
from app.services.speaker.speaker import SpeakerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success

SPEAKER_ROLE_TYPE = 4  # speaker role type



@speakers_bp.route('/get_expertise', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_expertise(session_id=None):
    response_data = SpeakerService.get_expertise()
    return response_data




@speakers_bp.route('/listing', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def listing(session_id):
    request_data = request.get_json()
    request_data['session_id'] = session_id
    response_data = SpeakerService.get_all_speakers(request_data)
    return response_data
    
    
@speakers_bp.route('/get_by_id', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_by_id(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.get_details_by_id(request_data)
    return response_data


@speakers_bp.route('/delete', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.deleteSpeaker(request_data)
    return response_data

@speakers_bp.route('/delete_data', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete_data(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.deleteSpeakerData(request_data,session_id)
    return response_data


@speakers_bp.route('/add_availability_days', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def add_availability_days(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.add_availability_days(request_data,session_id)
    return response_data


@speakers_bp.route('/get_availability_days', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_availability_days(session_id):
    response_data = SpeakerService.get_availability_days(session_id)
    return response_data