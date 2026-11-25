from app import db
from app.models.wishlist import Wishlist
from app.utils.response_decorators import handle_repository_errors


class WishlistRepository:

    @staticmethod
    @handle_repository_errors
    def find_wishlist_item(request_data, session_id):
        
        #service  - service provider app - BusinessService
        #         -                      - BusinessService - get_business_detail
        
        #service  - customer app - WishlistService
        #         -              - WishlistService - toggle_wishlist
        
        return Wishlist.query.filter(Wishlist.event_id==request_data['event_id'], Wishlist.created_by==session_id).first()

    @staticmethod
    @handle_repository_errors
    def add_wishlist_item(request_data, session_id):
        
        #service  - customer app - WishlistService
        #         -              - WishlistService - toggle_wishlist
        
        
        new_wishlist_item = Wishlist(
            event_id=request_data['event_id'],
            created_by=session_id
        )
        db.session.add(new_wishlist_item)
        db.session.commit()

    @staticmethod
    @handle_repository_errors
    def remove_wishlist_item(wishlist_item):
        
        #service  - customer app - WishlistService
        #         -              - WishlistService - toggle_wishlist
        
        db.session.delete(wishlist_item)
        db.session.commit()
        
       
    