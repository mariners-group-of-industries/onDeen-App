from app.repositories.membership import MembershipRepository
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors

class MembershipService:
    per_page = 10  # Define a constant for the default number of records per page in pagination
    
    @staticmethod
    @handle_service_errors
    def create_membership(request_data, session_id):
        
        obj = MembershipRepository.create(request_data, session_id)
        
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError('Unable to create')
       
        return {'message': 'Created successfully'}

    @staticmethod
    @handle_service_errors
    def get_all(request_data,session_id):
        dataObj = MembershipRepository.get_membership_listt(request_data,session_id, MembershipService.per_page)
        if isinstance(dataObj, dict) and 'error' in dataObj:
            raise ServiceError('No data found')

        return dataObj

    @staticmethod
    @handle_service_errors
    def get_byid(id):
        data_obj = MembershipRepository.get_byid(id)
        if isinstance(data_obj, dict) and 'error' in data_obj:
            raise ServiceError('Category not found')

        return data_obj
    
    # update
    @staticmethod
    @handle_service_errors
    def update(request_data, session_id):
       
        data_obj = MembershipRepository.update(request_data, session_id)
        if isinstance(data_obj, dict) and 'error' in data_obj:
            raise ServiceError('Unable to update')

        return {'message': 'Updated successfully'}

    @staticmethod
    @handle_service_errors
    def delete(id,session_id):
        obj = MembershipRepository.delete(id,session_id)
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError('Unable to delete')
        return {'message': 'Deleted successfully'}
