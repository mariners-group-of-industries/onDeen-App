from flask import request
from . import organizer_bp
from app.services.admin.organizer import OrganizerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success



    
@organizer_bp.route('/listing', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def listing(session_id=None):
    request_data = request.get_json()
    response_data = OrganizerService.get_all_organizer(request_data)
    return response_data
    
    