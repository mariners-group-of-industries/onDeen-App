from flask import request
from . import dashboard_bp
from app.services.admin.dashboard import DashboardService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success


@dashboard_bp.route('/get_data', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_data(session_id):
    request_data = request.get_json()
    response_data = DashboardService.get_data(request_data)
    return response_data 



