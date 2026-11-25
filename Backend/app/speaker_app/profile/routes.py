from flask import request
from . import profile_bp
from app.services.speaker.organizer import OrganizerService
from app.services.speaker.speaker import SpeakerService
from app.services.speaker.event import EventService

from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success




@profile_bp.route('/wallet_transactions', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def wallet_transactions(session_id):
    request_data = request.get_json()
    response_data = OrganizerService.wallet_transactions(request_data,session_id)
    return response_data





@profile_bp.route('/dashboard', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def dashboard(session_id):
    response_data = EventService.dashboard(session_id)
    return response_data


@profile_bp.route('/get_profile', methods=['GET'])
@auth_login_middleware(login_required=True,active_required=False)
@handle_service_errors
@handle_service_success
def get_profile(session_id):
   
    response_data = SpeakerService.get_profile(session_id)
    return response_data


@profile_bp.route('/update_profile', methods=['POST'])
@auth_login_middleware(login_required=True,active_required=False)
@handle_service_errors
@handle_service_success
def update_profile(session_id):
    request_data = request.get_json()
    if 'profile_image' not in request_data or not isinstance(request_data['profile_image'], str) or len(request_data['profile_image']) == 0:
        request_data['profile_image']='https://ondeen.app/assets/images/logo.svg'
    request_data['id']=session_id
    #response_data = OrganizerService.update_profile(request_data,session_id)    
    response_data = SpeakerService.register(request_data,session_id,4)
    return response_data
 



@profile_bp.route('/register_question', methods=['GET'])
@auth_login_middleware(login_required=False,active_required=False)
@handle_service_errors
@handle_service_success
def register_question(session_id=None):
     
    request_data = {'data': 0}
    response_data = OrganizerService.getRegistrationQuestion(request_data)
    return response_data



@profile_bp.route('/sect_list', methods=['GET'])
@auth_login_middleware(login_required=False,active_required=False)
@handle_service_errors
@handle_service_success
def registration_sect(session_id=None):
    response_data = OrganizerService.getRegistrationSect()
    return response_data
    
    
    
    
@profile_bp.route('/school_type_list', methods=['GET'])
@auth_login_middleware(login_required=False,active_required=False)
@handle_service_errors
@handle_service_success
def registration_school_type(session_id=None):
    response_data = OrganizerService.getRegistrationSchoolType()
    return response_data
    
    
@profile_bp.route('/category_list', methods=['GET'])
@auth_login_middleware(login_required=False,active_required=False)
@handle_service_errors
@handle_service_success
def category_list(session_id=None):
    response_data = OrganizerService.getCategoryList()
    return response_data
    
    
@profile_bp.route('/sub_category_list', methods=['POST'])
@auth_login_middleware(login_required=False,active_required=False)
@handle_service_errors
@handle_service_success
def sub_category_list(session_id=None):
    request_data = request.get_json()
    response_data = OrganizerService.getSubCategoryList(request_data)
    return response_data




@profile_bp.route('/buddy_list', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def buddy_list(session_id=None):
    # request_data = request.get_json()
    response_data = OrganizerService.buddy_list(session_id)
    return response_data



@profile_bp.route('/buddy_detail/<int:id>', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def buddy_detail(session_id,id=None):
    # request_data = request.get_json()
    response_data = OrganizerService.buddy_detail(id)
    return response_data


@profile_bp.route('/buddy_add', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def buddy_add(session_id):
    request_data = request.get_json()
    response_data = OrganizerService.buddy_add(request_data,session_id)
    return response_data


@profile_bp.route('/buddy_update', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def buddy_update(session_id):
    request_data = request.get_json()
    response_data = OrganizerService.buddy_update(request_data,session_id)
    return response_data

@profile_bp.route('/buddy_delete', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def buddy_delete(session_id):
    request_data = request.get_json()
    response_data = OrganizerService.buddy_delete(request_data,session_id)
    return response_data




@profile_bp.route('/get_notifications', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_notifications(session_id):
    request_data={}
    request_data["seen"] = request.args.get('seen')  # Get  from query parameters
    request_data["page"] = request.args.get('page')  # Get  from query parameters
    response_data = SpeakerService.get_notifications(session_id,request_data)
    return response_data


@profile_bp.route('/delete_notification', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def delete_nitification(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.delete_nitification(request_data,session_id)
    return response_data

@profile_bp.route('/seen_notification', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def seen_notification(session_id):
    request_data = request.get_json()
    response_data = SpeakerService.seen_notification(request_data,session_id)
    return response_data




