from flask import Blueprint

speaker_app = Blueprint('speaker_app', __name__)

from .speakers import speakers_bp as speakers_blueprint
from .organizer import organizer_bp as organizer_blueprint
from .speaker import speaker_bp as speaker_blueprint
from .profile import profile_bp as  profile_blueprint
from .event import event_bp as  event_blueprint
from .drafts import drafts_bp as  drafts_blueprint
from .login import login_bp as login_blueprint



speaker_app.register_blueprint(speakers_blueprint, url_prefix='/speakers')
speaker_app.register_blueprint(organizer_blueprint, url_prefix='/organizer')
speaker_app.register_blueprint(profile_blueprint, url_prefix='/profile')
speaker_app.register_blueprint(event_blueprint, url_prefix='/event')
speaker_app.register_blueprint(drafts_blueprint, url_prefix='/drafts')
speaker_app.register_blueprint(login_blueprint, url_prefix='/login')
