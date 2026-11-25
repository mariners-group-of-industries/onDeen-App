
from app.repositories.membership import MembershipRepository
from app.utils.response_decorators import handle_service_errors
from datetime import datetime

class MembershipService: 
     

    per_page = 10
    @staticmethod
    @handle_service_errors
    def get_membership_list(request_data,session_id):
        membership_items = MembershipRepository.get_membership_listt(request_data,session_id,MembershipService.per_page)
        if not membership_items:
            return {'message': 'no_items_in_membership_list', 'membership': []}
        
        return {'membership': membership_items}
        
        

        
    @staticmethod
    @handle_service_errors
    def get_my_membership_list(session_id):
        membership_items = MembershipRepository.get_my_membership_listt(session_id)
        if not membership_items:
            return {'message': 'no_items_in_membership_list', 'membership': []}
        
        return {'membership': membership_items}
        
        

        
    @staticmethod
    @handle_service_errors
    def purchasee(request_data, session_id):
        
        MembershipRepository.purchaseee(request_data, session_id)
        return {'message': 'Membership purchased successfully'}

        
   
        
    @staticmethod
    @handle_service_errors
    def cancle_membershipp(request_data, session_id):
        
        MembershipRepository.cancle_membershippp(request_data, session_id)
        return {'message': 'membership_cancled'}

        
   
   
    