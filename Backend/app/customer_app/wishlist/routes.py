from flask import request
from . import wishlist_bp
from app.services.customer.wishlist import WishlistService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success


@wishlist_bp.route('/toggle', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def toggle_wishlist(session_id):
    request_data = request.get_json()    
    response_data = WishlistService.toggle_wishlist(request_data, session_id)
    return response_data


@wishlist_bp.route('/list', methods=['POST'])
@auth_login_middleware(login_required=True)
@handle_service_errors
@handle_service_success
def get_wishlist(session_id):
    request_data = request.get_json()
    response_data = WishlistService.get_wishlist(request_data,session_id)
    return response_data






