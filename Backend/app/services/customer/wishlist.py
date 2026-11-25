
from app.repositories.event import EventRepo
from app.repositories.wishlist import WishlistRepository
from app.utils.response_decorators import handle_service_errors

class WishlistService: 
      

    per_page = 10
    @staticmethod
    @handle_service_errors
    def toggle_wishlist(request_data, session_id):
        existing_wishlist_item = WishlistRepository.find_wishlist_item(request_data, session_id)
        
        if existing_wishlist_item:
            WishlistRepository.remove_wishlist_item(existing_wishlist_item)
            return {'message': 'Removed from wishlist'}
        
        WishlistRepository.add_wishlist_item(request_data, session_id)
        return {'message': 'Added to wishlist'}

    @staticmethod
    def get_wishlist(request_data,session_id):
        

        wishlist_items = EventRepo.get_wishlist_by_user(request_data,session_id,WishlistService.per_page)        
        if not wishlist_items :
            wishlist_items=[]
           
            
        if not wishlist_items:
             return {'message': 'no_items_in_wishlist', 'wishlist': []}        
        return {'wishlist': wishlist_items} 
            
