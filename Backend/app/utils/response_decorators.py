from functools import wraps
import logging
from app.utils.response import SuccessJson, ValidationErrorJson, ErrorJson, ExceptionErrorJson
from app.utils.custom_exception import ValidationError, ServiceError
from app import db

logger = logging.getLogger(__name__)

def handle_service_errors(func):
    """Decorator for handling errors in service functions."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as ve:
            return ValidationErrorJson(ve.errors)
        except ServiceError as se:
            return ErrorJson(se.message)
        except Exception as e:
            logger.error(f"Error encountered: {str(e)}")
            return ExceptionErrorJson()
    return wrapper

def handle_service_success(func):
    """Decorator for automatically wrapping the response with SuccessJson."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        response_data = func(*args, **kwargs)
        
        # Check if the response is a tuple and if the first element is a dict containing 'status'
        if isinstance(response_data, tuple) and isinstance(response_data[0], dict) and 'status' in response_data[0]:
            return response_data  # Already wrapped, return as is
        
        return SuccessJson(response_data)
    return wrapper


def handle_repository_errors(func):
    """Decorator for handling errors in repository functions."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            # Rollback the session in case of an error
            db.session.rollback()
            logger.error(f"Repository error in {func.__name__}: {str(e)}")
            # Raise a custom exception or re-raise the original exception
            raise ServiceError(f"Repository error in {func.__name__}: {str(e)}")
    return wrapper


