from flask import request
from . import customer_bp
from app.services.admin.customer import CustomerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success



@customer_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def create(session_id=None):
    request_data = request.get_json() 
    response_data = CustomerService.create_or_update_customer(request_data,session_id)
    return response_data


@customer_bp.route('/get_all', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_all(session_id):
    request_data = request.get_json()
    response_data = CustomerService.get_all_customers(request_data)
    return response_data 

@customer_bp.route('/delete', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def delete(session_id=None):
    request_data = request.get_json()
    response_data = CustomerService.soft_delete(request_data,session_id)
    return response_data
    
    
@customer_bp.route('/get_by_id', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_by_id(session_id=None):
    request_data = request.get_json()
    response_data = CustomerService.get_customer_details(request_data)
    return response_data



@customer_bp.route('/user_count', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def user_count(session_id=None):
    # request_data = request.get_json()
    response_data = CustomerService.user_count()
    return response_data




