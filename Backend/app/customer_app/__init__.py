from flask import Blueprint

customer_app = Blueprint('customer_app', __name__)

from .users import user_bp as user_blueprint
from .home import home_bp as home_blueprint
from .event import event_bp as event_blueprint
from .organizer import organizer_bp as organizer_blueprint
from .speaker import speaker_bp as speaker_blueprint
from .wishlist import wishlist_bp as wishlist_blueprint
from .membership import membership_bp as membership_blueprint




customer_app.register_blueprint(user_blueprint, url_prefix='/users')
customer_app.register_blueprint(home_blueprint, url_prefix='/home')
customer_app.register_blueprint(event_blueprint, url_prefix='/event')
customer_app.register_blueprint(organizer_blueprint, url_prefix='/organizer')
customer_app.register_blueprint(speaker_blueprint, url_prefix='/speaker')
customer_app.register_blueprint(wishlist_blueprint, url_prefix='/wishlist')
customer_app.register_blueprint(membership_blueprint, url_prefix='/membership')


