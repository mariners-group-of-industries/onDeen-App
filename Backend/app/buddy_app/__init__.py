from flask import Blueprint

buddy_app = Blueprint('buddy_app', __name__)

from .login import login_bp as login_blueprint
from .event import event_bp as event_blueprint
from .profile import profile_bp as profile_blueprint



buddy_app.register_blueprint(login_blueprint, url_prefix='/login')
buddy_app.register_blueprint(event_blueprint, url_prefix='/event')
buddy_app.register_blueprint(profile_blueprint, url_prefix='/profile')