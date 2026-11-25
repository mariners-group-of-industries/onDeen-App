from flask import request
from . import category_bp
from app.services.admin.category import CategoryService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.validators import validate_category_data
from app.utils.response_decorators import handle_service_errors, handle_service_success

@category_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def create_category(session_id):
    request_data = request.get_json()
    if not request_data.get('ar_title'):  # Check if 'ar_title' is None or empty
        request_data['ar_title'] = request_data.get('title')
    validate_category_data(request_data)  
    response_data = CategoryService.create_category(request_data, session_id)
    return response_data

@category_bp.route('/get_all', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_all_categories(session_id):
    request_data = request.get_json()
    response_data = CategoryService.get_all_categories(request_data)
    return response_data

@category_bp.route('/get_byid/<int:category_id>', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_category(category_id, session_id):
    response_data = CategoryService.get_category(category_id)
    return response_data

@category_bp.route('/update', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_category(session_id):
    request_data = request.get_json()
    if not request_data.get('ar_title'):  # Check if 'ar_title' is None or empty
        request_data['ar_title'] = request_data.get('title')
    validate_category_data(request_data)   
    response_data = CategoryService.update_category(request_data, session_id)
    return response_data

@category_bp.route('/delete/<int:category_id>', methods=['DELETE'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete_category(category_id, session_id):
    response_data = CategoryService.delete_category(category_id)
    return response_data
