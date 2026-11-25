from flask import request
from . import masters_bp
from app.services.admin.masters import MastersService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success



@masters_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def create(session_id=None):
    request_data = request.get_json() 
    response_data = MastersService.add_master_entry(request_data,session_id)
    return response_data

@masters_bp.route('/update', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update(session_id=None):
    request_data = request.get_json() 
    response_data = MastersService.update_master_entry(request_data,session_id)
    return response_data



@masters_bp.route('/get_all', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_all(session_id):
    request_data = request.get_json()
    response_data = MastersService.get_all_master_entries(request_data)
    return response_data 


@masters_bp.route('/delete', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def delete(session_id=None):
    request_data = request.get_json()
    response_data = MastersService.delete_master_entry(request_data,session_id)
    return response_data

    
    
@masters_bp.route('/get_by_id', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_by_id(session_id=None):
    request_data = request.get_json()
    response_data = MastersService.get_master_entry_by_id(request_data)
    return response_data




