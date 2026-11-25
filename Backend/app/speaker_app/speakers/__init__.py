from flask import Blueprint

speakers_bp = Blueprint('speakers', __name__)

from . import routes