from flask import request
from . import speaker_bp
from app.services.customer.speaker import SpeakerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success


@speaker_bp.route('/speaker_id', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def speaker_id(session_id=None):
 
    speaker_id = request.args.get('id')  # Get 'id' from query parameters
    if not speaker_id:
        # Handle the case where 'id' is not provided
        return {"error": "Speaker ID is required"}, 400
    
    response_data = SpeakerService.speaker_id(session_id,speaker_id)  # Pass the ID to the service method
    return response_data
    
    

@speaker_bp.route('/speaker_slot', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def speaker_slot(session_id=None):
    request_data = request.get_json()
    speaker_id = request_data.get('id')  # Get 'id' from query parameters
    if not speaker_id:
        # Handle the case where 'id' is not provided
        return {"error": "Speaker ID is required"}, 400
    
    response_data = SpeakerService.speaker_slot(session_id,request_data)  # Pass the ID to the service method
    return response_data
    
    
    

