from flask import request
from . import speaker_bp
from app.services.admin.speaker import SpeakerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success 



@speaker_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login(session_id=None):
    request_data = request.get_json()
    response_data = SpeakerService.register(request_data,session_id)
    return response_data
 


@speaker_bp.route('/get_expertise', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_expertise(session_id=None):
    response_data = SpeakerService.get_expertise()
    return response_data



# @organizer_bp.route('/get_registration_school_type', methods=['GET'])
# @auth_login_middleware(login_required=False)
# @handle_service_errors
# @handle_service_success
# def getRegistrationSchoolType(session_id=None):
    # response_data = OrganizerService.getRegistrationSchoolType()
    # return response_data
    
    
@speaker_bp.route('/listing', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def listing(session_id=None):
    request_data = request.get_json()
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

@speaker_bp.route('/delete_data', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete_data(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.deleteSpeakerData(request_data,session_id)
    return response_data
