from flask import request
from . import organizer_bp
from app.services.customer.organizer import OrganizerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success




@organizer_bp.route('/organizer_id', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def organizer_id(session_id=None):
 
    organizer_id = request.args.get('id')  # Get 'id' from query parameters
    if not organizer_id:
        # Handle the case where 'id' is not provided
        return {"error": "Organizer ID is required"}, 400
    
    response_data = OrganizerService.organizer_id(session_id,organizer_id)  # Pass the ID to the service method
    return response_data
    
    
    

