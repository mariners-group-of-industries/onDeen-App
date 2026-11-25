from functools import wraps
from flask import request, current_app as app
from flask_jwt_extended import decode_token
from app.utils.crypto_utils import decrypt_value, password_fingerprint
from app.repositories.user import user
from app.utils.response import ErrorJson,AuthErrorJson
from flask import request, jsonify



def auth_login_middleware(login_required=True,active_required=True,nothing_required=False):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):

            login_header = request.headers.get('Authorization')
            
            login_token = None
            
            
            if login_header and login_header.startswith('Bearer '):
                login_token = login_header.split(" ")[1]
                # return {'message':login_token}
            
            if nothing_required:
                return f(*args, **kwargs) 
            if login_required or login_token is not None:
                if not validate_login_token(login_token):
                    return AuthErrorJson('Unauthorized access')
                session_id = get_user_id_from_login_token(login_token)
                session_id = decrypt_value(session_id)
                decoded_login_token  = decode_token(login_token)
                token_password = decoded_login_token.get('pwd_fp')
                token_status = decoded_login_token['status']    
                
                if not session_id:
                    return AuthErrorJson('Unauthorized access')
                user_info = user.auth_check(session_id)
                if user_info.get('error'):
                    return AuthErrorJson('Unauthorized access')
                if not user_info:
                    return AuthErrorJson('Unauthorized access')
                token_info =user.token_check(login_token)
                if not token_info:
                    return AuthErrorJson('Unauthorized access')
                if token_info.get("error"):
                    return AuthErrorJson('Unauthorized access')
                
                
                # return str(user_info)
                user_status = user_info['status']
                user_password = password_fingerprint(user_info['password'])
                
                
                # return {'message':'dk'}
                if user_status==3:
                    return AuthErrorJson('Unauthorized access')
                    
                if user_status!=1 and active_required:
                    return AuthErrorJson('Unauthorized access')
                    
                if not token_password or user_password != token_password:
                    return AuthErrorJson('Unauthorized access')
                
                
                if token_status !=user_status and user_status!=1:
                    return AuthErrorJson('Unauthorized access')   

                return f(session_id=session_id, *args, **kwargs)
            elif login_token is not None:
                valid, result = login_required_token(login_token)
                if not valid:
                    return AuthErrorJson(result)
                return f(session_id=result, *args, **kwargs)

            else:
                # Handle case when login token is not provided
                return f(*args, **kwargs)
        return decorated_function
    return decorator


def validate_login_token(token):
    try:
        decoded_token = decode_token(token)
        return decoded_token['token_type'] == 'login'
    except Exception as e:
        return False

def get_user_id_from_login_token(token):
    try:
        decoded_token = decode_token(token)
        return decoded_token['custom_claims']
    except Exception as e:
        return None
    
def  login_required_token(login_token):  
    try:
        if not validate_login_token(login_token):
            return False,('Unauthorized access')
        session_id = get_user_id_from_login_token(login_token)
        session_id = decrypt_value(session_id)
        decoded_login_token  = decode_token(login_token)
        token_password = decoded_login_token.get('pwd_fp')
        token_status = decoded_login_token['status']    
                
                
        user_info = user.auth_check(session_id)
        token_info =user.token_check(login_token)
                
        if not token_info:
            return False,('Unauthorized access')
        if not user_info or user_info.get('error'):
            return False,('Unauthorized access')
        if not user_info:
            return False,('Unauthorized access')
                
        user_status = user_info['status']
        user_password = password_fingerprint(user_info['password'])
                

        if not token_password or user_password != token_password:
            return False,('Unauthorized access')
                
                
        if token_status !=user_status:
            return False,('Unauthorized access')    

        return True, session_id
    
    except Exception as e:
        return False, ('Unauthorized access')  #str(e)
    
    
        
        







# How long an OTP-verified session may reset a password without the old one.
PASSWORD_RESET_OTP_MAX_AGE_SECONDS = 15 * 60


def get_request_token_claims():
    """Decoded claims of the request's Bearer login token, or {} if absent/invalid."""
    header = request.headers.get('Authorization') or ''
    if not header.startswith('Bearer '):
        return {}
    try:
        return decode_token(header.split(' ', 1)[1]) or {}
    except Exception:
        return {}


def is_recent_otp_session(claims, max_age_seconds=PASSWORD_RESET_OTP_MAX_AGE_SECONDS):
    """True when the token was issued by an OTP verification within max_age_seconds.

    Used for forgot-password: the user proved control of their phone/email moments
    ago, so the old password is not required. An ordinary (or old) session is not
    enough, so a stolen long-lived token cannot silently change the password.
    """
    import time

    if not claims or claims.get('auth_method') != 'otp':
        return False
    issued_at = claims.get('iat')
    if not isinstance(issued_at, (int, float)):
        return False
    age = time.time() - issued_at
    return 0 <= age <= max_age_seconds


def resolve_admin_session(login_token):
    """Return the admin user id for a valid admin login token, else None.

    Requires a live login session (same checks as login_required_token) whose
    user is an active admin (role_type 1) in the database. The role is read from
    the database, never trusted from the token claims.
    """
    if not login_token:
        return None
    valid, session_id = login_required_token(login_token)
    if not valid:
        return None
    from app.models.users import Users

    try:
        admin = Users.query.filter(Users.id == int(session_id)).first()
    except (TypeError, ValueError):
        return None
    if not admin or admin.role_type != 1 or admin.status != 1:
        return None
    return admin.id


def bearer_token_from_request():
    header = request.headers.get('Authorization') or ''
    if header.startswith('Bearer '):
        return header.split(' ', 1)[1].strip() or None
    return None


def admin_required(f):
    """Route decorator: only active admins (role_type 1) may call the route."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if resolve_admin_session(bearer_token_from_request()) is None:
            return AuthErrorJson('Unauthorized access')
        return f(*args, **kwargs)
    return decorated_function


# Folders the apps upload into. Anything else is rejected so callers cannot
# write into arbitrary directories under the upload root.
ALLOWED_UPLOAD_MODULES = {'auth', 'profile', 'organizer_profile_pic', 'event_material'}


def has_upload_credentials():
    """A live login session, or the app-level Auth-Token the apps fetch at launch.

    Registration uploads happen before login, so the app token is accepted.
    """
    login_token = bearer_token_from_request()
    if login_token:
        valid, _ = login_required_token(login_token)
        return valid
    app_token = request.headers.get('Auth-Token')
    if not app_token:
        return False
    try:
        return decode_token(app_token).get('token_type') == 'auth'
    except Exception:
        return False
