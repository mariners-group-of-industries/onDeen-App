from flask import request
from . import profile_bp
from app.services.speaker.speaker import SpeakerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success

BUDDY_ROLE_TYPE = 5  # Buddy role type


@profile_bp.route('/get_profile', methods=['GET'])
@auth_login_middleware(login_required=True,active_required=False)
@handle_service_errors
@handle_service_success
def get_profile(session_id):
    response_data = SpeakerService.buddy_profile(session_id)
    return response_data


