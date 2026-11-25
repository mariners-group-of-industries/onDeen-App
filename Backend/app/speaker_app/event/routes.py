from flask import request
from . import event_bp
from app.services.speaker.event import EventService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success



@event_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def create(session_id):
    request_data = request.get_json()
    # validate_event_data(request_data)
    response_data = EventService.create_or_update_event(request_data,session_id)
    return response_data



@event_bp.route('/delete', methods=['DELETE'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete(session_id):
    request_data = request.get_json()
    response_data = EventService.soft_delete(request_data,session_id)
    return response_data
    
    
@event_bp.route('/get_by_id', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_by_id(session_id):
    request_data = request.get_json()
    response_data = EventService.get_event_details(request_data,session_id)
    return response_data



@event_bp.route('/get_master_data', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_master_data(session_id):
    response_data = EventService.get_master_data()
    return response_data


@event_bp.route('/get_all_event', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_all_event(session_id):
    request_data = request.get_json()
    response_data = EventService.get_all_events_by_user_id(request_data,session_id)
    return response_data


@event_bp.route('/participant_list', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def participant_list(session_id):
    request_data = request.get_json()
    response_data = EventService.participant_list(request_data)
    return response_data
    
    



@event_bp.route('/participant_attendance', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def participant_attendance(session_id):
    request_data = request.get_json()
    response_data = EventService.participant_attendance(request_data)
    return response_data
    
    


@event_bp.route('/get_participant_attendance_list', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_participant_attendance_list(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_participant_attendance_list(request_data)
    return response_data



@event_bp.route('/update_attendance', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_attendance(session_id):
    request_data = request.get_json()
    response_data = EventService.update_attendance(request_data,session_id)
    return response_data


@event_bp.route('/question_and_answers/<id>/<type>', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def question_and_answers(session_id,id,type):
    response_data = EventService.question_and_answers(session_id,id,type)
    return response_data



@event_bp.route('/update_event_answer', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_event_answer(session_id=None):
    request_data = request.get_json()
    response_data = EventService.update_event_answer(request_data, session_id)
    return response_data




@event_bp.route('/get_notificaions', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_notificaions(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_notificaions(request_data,session_id)
    return response_data

@event_bp.route('/get_notificaion_count', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_notificaion_count(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_notificaion_count(request_data,session_id)
    return response_data



@event_bp.route('/get_request_buddy', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_request_buddy(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_request_buddy(request_data,session_id)
    return response_data


 

@event_bp.route('/get_request_buddy_count', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_request_buddy_count(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_request_buddy_count(request_data['type'],session_id)
    return response_data



@event_bp.route('/update_status_request_buddy', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_status_request_buddy(session_id=None):
    request_data = request.get_json()
    response_data = EventService.update_status_request_buddy(request_data,session_id)
    return response_data





@event_bp.route('/add_rating', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def add_rating(session_id):
    request_data = request.get_json()
    response_data = EventService.add_rating(session_id, request_data)
    return response_data




@event_bp.route('/get_rating', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_rating(session_id):
    request_data = request.get_json()
    response_data = EventService.get_rating(session_id, request_data)
    return response_data



@event_bp.route('/get_user_profile', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_user_profile(session_id):
    request_data = request.get_json()
    response_data = EventService.get_user_profile(request_data.get("user_id"))
    return response_data





@event_bp.route('/announcement', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def add_announcement(session_id):
    request_data = request.get_json()
    response_data = EventService.add_announcement(session_id, request_data)
    return response_data



@event_bp.route('/get_announcement', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_announcement(session_id):
    request_data = request.get_json()
    response_data = EventService.get_announcement(session_id, request_data)
    return response_data
