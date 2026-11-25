from app.repositories.user import user
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors

class AdminService:
    role_type = 1  # Define a constant for the admin role type
    per_page = 10  # Define a constant for the default number of records per page in pagination

    @staticmethod
    @handle_service_errors
    def login(request_data):
        if 'email_id' not in request_data and 'mobile_number' not in request_data:
            raise ServiceError('Email ID or Mobile Number and password required')

        if 'password' not in request_data:
            raise ServiceError('Password required')

        email_id = request_data.get('email_id')
        password = request_data.get('password')

        if email_id:
            if not user.email_check(email_id, AdminService.role_type):
                raise ServiceError('This account is not registered with us')

            user_obj = user.check_password(email_id, password, AdminService.role_type)
            if isinstance(user_obj, dict) and 'error' in user_obj:
                raise ServiceError('Invalid email or password')

        profile = user.customer_profile(user_obj.id)
        access_token = user.generate_token(user_obj, AdminService.role_type)
        

        response_data = {
            'access_token': access_token,
            'profile': profile
        }
        return response_data
