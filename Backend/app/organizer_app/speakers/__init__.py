from flask import Blueprint

speaker_bp = Blueprint('speakers', __name__)

from . import routes
 