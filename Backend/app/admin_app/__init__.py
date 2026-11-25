from flask import Blueprint, request

admin_app = Blueprint('admin_app', __name__)

# Every /admin_app/ route except the login itself requires an active admin
# (role_type 1). Individual routes historically used login_required=False or
# accepted any role's token, so the check is enforced here for all of them.
ADMIN_PUBLIC_ENDPOINTS = {'admin_app.admin.login'}


@admin_app.before_request
def require_admin():
    if request.method == 'OPTIONS' or request.endpoint in ADMIN_PUBLIC_ENDPOINTS:
        return None
    from app.utils.auth_decorators import bearer_token_from_request, resolve_admin_session
    from app.utils.response import AuthErrorJson

    if resolve_admin_session(bearer_token_from_request()) is None:
        return AuthErrorJson('Unauthorized access')
    return None


from .admin import admin_bp as admin_blueprint
from .organizer import organizer_bp as organizer_blueprint
from .speakers import speaker_bp as speaker_blueprint
from .event import event_bp as event_blueprint
from .category import category_bp as category_blueprint
from .subcategory import subcategory_bp as subcategory_blueprint
from .customer import customer_bp as customer_blueprint
from .masters import masters_bp as masters_blueprint
from .dashboard import dashboard_bp as dashboard_blueprint
from .membership import membership_bp as membership_blueprint


admin_app.register_blueprint(admin_blueprint, url_prefix='/admin')
admin_app.register_blueprint(organizer_blueprint, url_prefix='/organizer')
admin_app.register_blueprint(speaker_blueprint, url_prefix='/speakers')
admin_app.register_blueprint(event_blueprint, url_prefix='/event')
admin_app.register_blueprint(category_blueprint, url_prefix='/category')
admin_app.register_blueprint(subcategory_blueprint, url_prefix='/subcategory')
admin_app.register_blueprint(customer_blueprint, url_prefix='/customer')
admin_app.register_blueprint(masters_blueprint, url_prefix='/masters')
admin_app.register_blueprint(dashboard_blueprint, url_prefix='/dashboard')
admin_app.register_blueprint(membership_blueprint, url_prefix='/membership')





