from flask import request
from . import membership_bp
from app.services.admin.membership import MembershipService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.validators import validate_membership_data
from app.utils.response_decorators import handle_service_errors, handle_service_success

@membership_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def create(session_id):
    request_data = request.get_json()
    
    if not request_data.get('ar_title'):  # Check if 'ar_title' is None or empty
        request_data['ar_title'] = request_data.get('title')
    validate_membership_data(request_data)  
    response_data = MembershipService.create_membership(request_data, session_id)
    return response_data

@membership_bp.route('/get_all', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_all(session_id):
    request_data = request.get_json()
    response_data = MembershipService.get_all(request_data,session_id)
    return response_data

@membership_bp.route('/get_byid/<int:id>', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_byid(id, session_id):
    response_data = MembershipService.get_byid(id)
    return response_data

@membership_bp.route('/update', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update(session_id):
    request_data = request.get_json()
    if not request_data.get('ar_title'):  # Check if 'ar_title' is None or empty
        request_data['ar_title'] = request_data.get('title')
    validate_membership_data(request_data)   
    response_data = MembershipService.update(request_data, session_id)
    return response_data

@membership_bp.route('/delete/<int:id>', methods=['DELETE'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete(id, session_id):
    response_data = MembershipService.delete(id,session_id)
    return response_data
