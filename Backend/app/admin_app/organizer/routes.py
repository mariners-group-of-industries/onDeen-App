from flask import request
from . import organizer_bp
from app.services.admin.organizer import OrganizerService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.validators import validate_organizer_data
from app.utils.response_decorators import handle_service_errors, handle_service_success



@organizer_bp.route('/wallet_transactions', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def wallet_transactions(session_id):
    request_data = request.get_json()
    response_data = OrganizerService.wallet_transactions(request_data,session_id)
    return response_data



@organizer_bp.route('/wallet_tranfer', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def wallet_tranfer(session_id=None):
    request_data = request.get_json()
    response_data = OrganizerService.wallet_tranfer(request_data,session_id)
    return response_data


@organizer_bp.route('/create', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def login(session_id=None):
    request_data = request.get_json()
    request_data['mobile_number']=str(request_data['mobile_number'])
    validate_organizer_data(request_data)
    response_data = OrganizerService.register(request_data,session_id)
    return response_data
    
@organizer_bp.route('/delete', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def delete(session_id=None):
    request_data = request.get_json()
    response_data = OrganizerService.deleteOrganization(request_data)
    return response_data
 

@organizer_bp.route('/get_registration_question', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def getRegistrationQuestion(session_id=None):
    request_data = request.get_json()
    response_data = OrganizerService.getRegistrationQuestion(request_data)
    return response_data


@organizer_bp.route('/get_registration_type', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def getRegistrationType(session_id=None):
    response_data = OrganizerService.getRegistrationType()
    return response_data


@organizer_bp.route('/get_registration_sec', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def getRegistrationSect(session_id=None):
    response_data = OrganizerService.getRegistrationSect()
    return response_data



@organizer_bp.route('/get_registration_school_type', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def getRegistrationSchoolType(session_id=None):
    response_data = OrganizerService.getRegistrationSchoolType()
    return response_data
    
    
@organizer_bp.route('/listing', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def listing(session_id=None):
    request_data = request.get_json()
    response_data = OrganizerService.get_all_organizer(request_data)
    return response_data


@organizer_bp.route('/applications', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def applications(session_id):
    response_data = OrganizerService.list_applications(request.args.get('status'), session_id)
    return response_data


@organizer_bp.route('/applications/review', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def review_application(session_id):
    request_data = request.get_json() or {}
    response_data = OrganizerService.review_application(request_data, session_id)
    return response_data
    
    
@organizer_bp.route('/listing_all', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def listing_all(session_id=None):
    request_data = request.get_json()
    response_data = OrganizerService.get_all_organizer_speakers(request_data)
    return response_data
    
    
@organizer_bp.route('/get_by_id', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def get_by_id(session_id=None):
    request_data = request.get_json()
    response_data = OrganizerService.get_details_by_id(request_data)
    return response_data
