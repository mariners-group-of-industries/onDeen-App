from flask import request
from . import membership_bp
from app.services.customer.membership import MembershipService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success
from flask import Flask

app = Flask(__name__)


@membership_bp.route('/cancle', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def cancle_membership(session_id):
    request_data = request.get_json()
    response_data = MembershipService.cancle_membershipp(request_data,session_id)
    return response_data



@membership_bp.route('/mine', methods=['GET'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_my_membershiplist(session_id):
    response_data = MembershipService.get_my_membership_list(session_id)
    return response_data


@membership_bp.route('/list', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_membershiplist(session_id):
    request_data = request.get_json()
    response_data = MembershipService.get_membership_list(request_data,session_id)
    return response_data



@membership_bp.route('/purchase', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def purchase(session_id):
    request_data = request.get_json()
    response_data = MembershipService.purchasee(request_data, session_id)
    return response_data






