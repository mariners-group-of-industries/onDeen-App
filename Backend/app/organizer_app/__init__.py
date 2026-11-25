from flask import Blueprint

organizer_app = Blueprint('organizer', __name__)

from .login import login_bp as login_blueprint
from .profile import profile_bp as  profile_blueprint
from .event import event_bp as  event_blueprint
from .drafts import drafts_bp as  drafts_blueprint
from .speakers import speaker_bp as  speakers_blueprint



organizer_app.register_blueprint(login_blueprint, url_prefix='/login')
organizer_app.register_blueprint(profile_blueprint, url_prefix='/profile')
organizer_app.register_blueprint(drafts_blueprint, url_prefix='/drafts')
organizer_app.register_blueprint(event_blueprint, url_prefix='/event')
organizer_app.register_blueprint(speakers_blueprint, url_prefix='/speakers')