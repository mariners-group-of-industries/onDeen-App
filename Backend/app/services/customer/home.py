from app.repositories.category import CategoryRepository
from app.repositories.event import EventRepo
from app.repositories.user import user
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors


class HomeService:
    role_type =2
     

    @staticmethod
    @handle_service_errors
    def home(session_id):
    
        
        user.add_user_activity(session_id)
        
        obj={}
        obj['organizer'] = EventRepo.get_top_organizers()
        
        request_data = {}
        request_data['recently_added_days']=7
        request_data['per_page']=5
        request_data['session_id']=session_id
        
        obj['banner'] = EventRepo.appEvent(request_data)
        
        request_data = {}
        request_data['upcoming_days']=7
        request_data['per_page']=6
        request_data['session_id']=session_id
        obj['recent'] = EventRepo.appEvent(request_data)
        
        request_data['status']=1
        category = CategoryRepository.get_all_categories(request_data,1000)
        obj['category'] = category['categories']
        
        return obj
    


    @staticmethod
    @handle_service_errors
    def get_category():
        
        obj={}
        request_data = {}
        request_data['status']=1
        category = CategoryRepository.get_all_categories(request_data,1000)
        obj = category['categories']
        
        
        return obj
    
    