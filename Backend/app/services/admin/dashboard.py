from app.repositories.dashboard import DashboardRepo
from app.repositories.user import user
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors



class DashboardService:
    
    @staticmethod
    @handle_service_errors
    def get_data(request_data):
        obj = DashboardRepo.get_data()
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError('Unable to get setting')

        return obj
        
