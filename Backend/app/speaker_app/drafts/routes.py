from flask import request
from . import drafts_bp
from app.services.speaker.drafts import DraftsService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success



@drafts_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def create(session_id):
    request_data = request.get_json()
    response_data = DraftsService.create_or_update_event(request_data,session_id)
    return response_data



@drafts_bp.route('/delete', methods=['DELETE'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete(session_id):
    request_data = request.get_json()
    response_data = DraftsService.soft_delete(request_data,session_id)
    return response_data
    
    
@drafts_bp.route('/get_by_id', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_by_id(session_id):
    request_data = request.get_json()
    response_data = DraftsService.get_event_details(request_data,session_id)
    return response_data




@drafts_bp.route('/get_all_drafts', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_all_drafts(session_id):
    request_data = request.get_json()
    response_data = DraftsService.get_all_drafts(request_data,session_id)
    return response_data


