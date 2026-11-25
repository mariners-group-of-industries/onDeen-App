from flask import Blueprint

subcategory_bp = Blueprint('subcategory', __name__)

from . import routes