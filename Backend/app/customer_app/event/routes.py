from flask import request
from . import event_bp
from app.services.customer.event import EventService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success


@event_bp.route('/search_history', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def search_history(session_id=None):

    
    response_data={}
    request_data={}
    request_data['session_id'] = session_id
    response_data['history'] = EventService.search_history(request_data)
    response_data['trending'] = EventService.search_trending(request_data)
    

    return response_data



@event_bp.route('/event', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def event(session_id=None):
    request_data = request.get_json()

    #print(request_data)
    if request_data.get('filterData') : 
        request_data=request_data.get('filterData')
    request_data['session_id'] = session_id
    
    response_data = EventService.event(request_data)
    
    response_data['latitude']  = request_data.get('latitude')
    response_data['longitude']  = request_data.get('longitude')
    if response_data['latitude'] and response_data['longitude'] :
        response_data['message'] = 'latitude and longitude recieved'
    else :
        response_data['message'] = 'latitude and longitude not recieved'
    
    return response_data



@event_bp.route('/event_id', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def event_id(session_id=None):
 
    event_id = request.args.get('id')  # Get 'id' from query parameters
    search = request.args.get('search')  # Get 'id' from query parameters
    participant_id = request.args.get('participant_id',None)  # Get 'id' from query parameters
    if not event_id:
        # Handle the case where 'id' is not provided
        return {"error": "Event ID is required"}, 400
    
    response_data = EventService.event_id(session_id,event_id,participant_id,search)  # Pass the ID to the service method
    return response_data
    
    
    


@event_bp.route('/participant_list', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def participant_list(session_id):
    request_data = request.get_json()
    response_data = EventService.participant_list(session_id, request_data)
    return response_data
    
    
    

@event_bp.route('/get_user_profile', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_user_profile(session_id):
    request_data = request.get_json()
    response_data = EventService.get_user_profile(request_data.get("user_id"))
    return response_data



@event_bp.route('/booking', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def booking(session_id):
    request_data = request.get_json()
    response_data = EventService.add_participant(session_id, request_data)
    return response_data


@event_bp.route('/guest_booking', methods=['POST'])
@auth_login_middleware(login_required=False, nothing_required=True)
@handle_service_errors
@handle_service_success
def guest_booking():
    request_data = request.get_json() or {}
    response_data = EventService.add_guest_participant(request_data, request.remote_addr)
    return response_data


@event_bp.route('/guest_booking_migrate', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def guest_booking_migrate(session_id):
    request_data = request.get_json() or {}
    response_data = EventService.migrate_guest_bookings(session_id, request_data)
    return response_data
    
    
    
    
    
@event_bp.route('/cancle_booking', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def cancle_booking(session_id):
    request_data = request.get_json()
    response_data = EventService.cancle_booking(session_id, request_data)
    return response_data
    
    
@event_bp.route('/check_in', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def check_in(session_id):
    request_data = request.get_json()
    response_data = EventService.check_in(session_id, request_data)
    return response_data


@event_bp.route('/online_check_in', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def online_check_in(session_id):
    request_data = request.get_json() or {}
    response_data = EventService.online_check_in(session_id, request_data)
    return response_data


@event_bp.route('/debug_complete_booking', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def debug_complete_booking(session_id):
    request_data = request.get_json() or {}
    response_data = EventService.debug_complete_booking(session_id, request_data)
    return response_data

    
@event_bp.route('/request_buddy', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def request_buddy(session_id):
    request_data = request.get_json()
    response_data = EventService.request_buddy(session_id, request_data)
    return response_data

@event_bp.route('/get_request_buddy_list', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_request_buddy_list(session_id):
    request_data = request.get_json()
    response_data = EventService.get_request_buddy_list(session_id, request_data)
    return response_data


@event_bp.route('/update_status_request_buddy', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def update_status_request_buddy(session_id):
    request_data = request.get_json()
    response_data = EventService.update_status_request_buddy(session_id, request_data)
    return response_data



@event_bp.route('/booking_list', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def booking_list(session_id):
    request_data = request.get_json()    
    response_data = EventService.booking_list(session_id, request_data)
    return response_data

@event_bp.route('/ticket_qrcodes', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def ticket_qrcodes(session_id):
 
    request_data = request.get_json()    
    response_data = EventService.ticket_qrcodes(session_id, request_data)
    return response_data


@event_bp.route('/event_note_delete', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def event_note_delete(session_id=None):
    request_data = request.get_json()
    response_data = EventService.event_note_delete(request_data,session_id)
    return response_data


@event_bp.route('/event_note_add', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def event_note_add(session_id=None):
    request_data = request.get_json()
    response_data = EventService.event_note_add(request_data,session_id)
    return response_data
 

@event_bp.route('/get_all_event_note', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_all_event_note(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_all_event_note(request_data,session_id)
    return response_data



@event_bp.route('/get_event_note_byid', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_event_note_byid(session_id=None):
    request_data = request.get_json()
    response_data = EventService.get_event_note_byid(request_data,session_id)
    return response_data





@event_bp.route('/event_search', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def event_search(session_id=None):
    request_data = request.get_json()
    response_data = EventService.event_search(session_id,request_data)
    return response_data



@event_bp.route('/question_and_answers/<id>', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def question_and_answers(session_id,id):
    response_data = EventService.question_and_answers(session_id,id)
    return response_data



@event_bp.route('/journey_levels', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def journey_levels(session_id=None):
    response_data = EventService.journey_levels(session_id)
    return response_data


@event_bp.route('/add_event_question', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def add_event_question(session_id=None):
    request_data = request.get_json()
    response_data = EventService.add_event_question(request_data,session_id)
    return response_data



@event_bp.route('/add_rating', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def add_rating(session_id):
    request_data = request.get_json()
    response_data = EventService.add_rating(session_id, request_data)
    return response_data




@event_bp.route('/get_rating', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_rating(session_id):
    request_data = request.get_json()
    response_data = EventService.get_rating(session_id, request_data)
    return response_data



@event_bp.route('/filter', methods=['POST'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
def filter(session_id=None):
    request_data = request.get_json()
    response_data = EventService.filter(session_id, request_data)
    return response_data

