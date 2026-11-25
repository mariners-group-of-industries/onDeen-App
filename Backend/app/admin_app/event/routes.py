from flask import request
from . import event_bp
from app.services.admin.event import EventService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success


@event_bp.route('/journey_levels', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def journey_levels(session_id=None):
    response_data = EventService.journey_levels(session_id)
    return response_data


@event_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def create(session_id=None):
    request_data = request.get_json() 
    response_data = EventService.create_or_update_event(request_data,session_id)
    return response_data


@event_bp.route('/get_all_event', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_all_event(session_id):
    request_data = request.get_json()
    response_data = EventService.get_all_events(request_data)
    return response_data 

@event_bp.route('/delete', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def delete(session_id=None):
    request_data = request.get_json()
    response_data = EventService.soft_delete(request_data,session_id)
    return response_data
    
    
@event_bp.route('/get_by_id', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_by_id(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_event_details(request_data)
    return response_data



@event_bp.route('/get_master_data', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_master_data(session_id=None):
    response_data = EventService.get_master_data()
    return response_data
    
    
@event_bp.route('/get_event_participants', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_event_participants(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_event_participants(request_data)
    return response_data


@event_bp.route('/get_participant_attendance_list', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_participant_attendance_list(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_participant_attendance_list(request_data)
    return response_data



@event_bp.route('/get_request_buddy', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_request_buddy(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_request_buddy(request_data)
    return response_data



@event_bp.route('/get_request_buddy_count', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_request_buddy_count(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_request_buddy_count(request_data['type'],session_id,request_data['event_id'])
    return response_data


@event_bp.route('/update_status_request_buddy', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def update_status_request_buddy(session_id=None):
    request_data = request.get_json()
    response_data = EventService.update_status_request_buddy(request_data,session_id)
    return response_data




@event_bp.route('/question_and_answers/<id>/<type>/<organizer_id>', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def question_and_answers(session_id,id,type,organizer_id):    
    response_data = EventService.question_and_answers(session_id,id,type,organizer_id)
    return response_data



@event_bp.route('/get_rating', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_rating(session_id):
    request_data = request.get_json()
    response_data = EventService.get_rating(session_id, request_data)
    return response_data


@event_bp.route('/announcement', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def add_announcement(session_id):
    request_data = request.get_json()
    response_data = EventService.add_announcement(session_id, request_data)
    return response_data


@event_bp.route('/announcement_all', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def add_announcement_all(session_id):
    request_data = request.get_json()
    response_data = EventService.add_announcement_all(session_id, request_data)
    return response_data




@event_bp.route('/get_announcement', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_announcement(session_id):
    request_data = request.get_json()
    response_data = EventService.get_announcement(session_id, request_data)
    return response_data

