from flask import request
from . import subcategory_bp
from app.services.admin.subcategory import SubcategoryService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.validators import validate_subcategory_data
from app.utils.response_decorators import handle_service_errors, handle_service_success


@subcategory_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def create_sub_category(session_id):
    request_data = request.get_json()
    if not request_data.get('ar_title'):  # Check if 'ar_title' is None or empty
        request_data['ar_title'] = request_data.get('title')
    validate_subcategory_data(request_data)
    response_data = SubcategoryService.create_sub_category(request_data, session_id)
    return response_data


@subcategory_bp.route('/get_byid/<int:id>', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def getby_subcategory_id(id, session_id):
    response_data = SubcategoryService.get_by_subcategory_id(id, session_id)
    return response_data


@subcategory_bp.route('/update', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_sub_category(session_id):
    request_data = request.get_json()
    if not request_data.get('ar_title'):  # Check if 'ar_title' is None or empty
        request_data['ar_title'] = request_data.get('title')
    validate_subcategory_data(request_data)
    response_data = SubcategoryService.update_sub_category(request_data, session_id)
    return response_data


@subcategory_bp.route('/delete/<int:sub_category_id>', methods=['DELETE'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete_sub_category(sub_category_id, session_id):
    response_data = SubcategoryService.delete_sub_category(sub_category_id)
    return response_data


@subcategory_bp.route('/get_all', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def getall_sub_category(session_id):
    request_data = request.get_json()
    response_data = SubcategoryService.get_all_sub_categories(request_data)
    return response_data
