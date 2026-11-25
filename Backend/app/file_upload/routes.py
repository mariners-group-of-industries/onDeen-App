from functools import wraps

from flask import jsonify, request
from . import file_upload
from app.utils.auth_decorators import ALLOWED_UPLOAD_MODULES, auth_login_middleware, has_upload_credentials
from app.utils.response_decorators import handle_service_errors, handle_service_success
from app.utils.file_upload import upload_base64_file


def _guard_image_upload(f):
    """Reject uploads without credentials, file data or an allowed module.

    Runs outside handle_service_success, which only wraps service payloads.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if not has_upload_credentials():
            return jsonify({"status": False, "response": "Unauthorized access"}), 403
        request_data = request.get_json(silent=True) or {}
        if (request_data.get('module') or 'profile') not in ALLOWED_UPLOAD_MODULES:
            return jsonify({"status": False, "response": "Unsupported upload module"}), 400
        if not isinstance(request_data.get('file'), str) or not request_data.get('file'):
            return jsonify({"status": False, "response": "file is required"}), 400
        return f(*args, **kwargs)
    return decorated


@file_upload.route('/image_upload', methods=['POST'])
@_guard_image_upload
@auth_login_middleware(login_required=False,active_required=False,nothing_required=True)
@handle_service_errors
@handle_service_success
def image_upload():
    request_data = request.get_json(silent=True) or {}
    file = request_data.get('file')
    module = request_data.get('module') or 'profile'
    file_path = upload_base64_file(file, module)
    return file_path
