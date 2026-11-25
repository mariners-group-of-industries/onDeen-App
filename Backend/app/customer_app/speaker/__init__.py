from flask import Blueprint

speaker_bp = Blueprint('speaker', __name__)

from . import routes
