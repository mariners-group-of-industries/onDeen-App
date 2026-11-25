from flask import request
from . import admin_bp
from app.services.admin.admin import AdminService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.validators import validate_login_data
from app.utils.response_decorators import handle_service_errors, handle_service_success


@admin_bp.route('/login', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login(session_id=None):
    request_data = request.get_json()
    validate_login_data(request_data)
    response_data = AdminService.login(request_data)
    return response_data

