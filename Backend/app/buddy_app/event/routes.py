from flask import request
from . import event_bp
from app.services.buddy.event import EventService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success


@event_bp.route('/get_request_buddy', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_request_buddy(session_id):
    request_data = request.get_json()
    response_data = EventService.get_request_buddy(request_data,session_id)
    return response_data





@event_bp.route('/update_attendance', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_attendance(session_id):
    request_data = request.get_json()
    response_data = EventService.update_attendance(request_data,session_id)
    return response_data



