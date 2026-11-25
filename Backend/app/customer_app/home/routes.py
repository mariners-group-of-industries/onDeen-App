from flask import request
from . import home_bp
from app.services.customer.home import HomeService
from app.utils.auth_decorators import auth_login_middleware
from app.utils.response_decorators import handle_service_errors, handle_service_success
from app.utils.cache_decorators import cache_response


@home_bp.route('/home', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
#@cache_response(lambda session_id=None: f"ondeenpage:{session_id or 'default'}:{request.accept_languages.best_match(['en', 'ar'])}", expiration=3000)
def home(session_id=None):
    response_data = HomeService.home(session_id)
    return response_data



@home_bp.route('/get_category', methods=['GET'])
@auth_login_middleware(login_required=False)
@handle_service_errors
@handle_service_success
#@cache_response(lambda session_id=None: f"ondeenpage:{session_id or 'default'}:{request.accept_languages.best_match(['en', 'ar'])}", expiration=3000)
def get_category(session_id=None):
    response_data = HomeService.get_category()
    return response_data

