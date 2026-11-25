from app import db
from app.models.users import Membership,UserMembership
from app.utils.response_decorators import handle_repository_errors
import json
from sqlalchemy import or_,func
from sqlalchemy.orm import aliased

from datetime import timedelta,datetime
from dateutil.relativedelta import relativedelta

class MembershipRepository:
    
    
    
    @staticmethod
    @handle_repository_errors
    def delete(id,session_id):
        obj = db.session.query(Membership).filter(Membership.id == id).first()
        if obj:        
            obj.status = 3  
            obj.updated_by = session_id  
            db.session.commit()
            return obj.id
            
        return {"error": "is_error"}
    
    
    @staticmethod
    @handle_repository_errors
    def update(data, session_id):
        obj = db.session.query(Membership).filter(Membership.id == data['id']).first()
        if not obj:
            return {"error": "is_error"}
        
        obj.title = data.get('title')
        obj.ar_title = data.get('ar_title')
        obj.sub_title = data.get('sub_title')
        obj.ar_sub_title = data.get('ar_sub_title')
        obj.description = data.get('description')
        obj.ar_description = data.get('ar_description')
        obj.duration_type = data.get('duration_type')
        obj.duration = data.get('duration')
        obj.price = data.get('price')
        obj.status = data.get('status')
        obj.updated_by = session_id

        db.session.commit()
        return obj.id
    
    
    
    @staticmethod
    @handle_repository_errors
    def create(data, session_id):
        create_data = Membership(
            
            title=data.get('title'),
            ar_title=data.get('ar_title'),
            sub_title=data.get('sub_title'),
            ar_sub_title=data.get('ar_sub_title'),
            description=data.get('description'),
            ar_description=data.get('ar_description'),
            duration_type=data.get('duration_type'),
            duration=data.get('duration'),
            price=data.get('price'),
            status=data.get('status',1),
            created_by=session_id
        )
        
        db.session.add(create_data)
        db.session.commit()
        if create_data.id:
            return create_data.id
        return {"error": "is_error"}
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_byid(id):
        category = db.session.query(Membership).filter(Membership.id == id).first()
        if category:
            return {
                'id': category.id,
                'title': category.title,
                'ar_title': category.ar_title,
                'sub_title': category.sub_title,
                'ar_sub_title': category.ar_sub_title,
                'description': category.description,
                'ar_description': category.ar_description,
                'duration_type': category.duration_type,
                'duration': category.duration,
                'price': category.price,
                'status': category.status
            }
        return {"error": "is_error"}
    
    
    
        
    @staticmethod
    @handle_repository_errors
    def get_membership_listt(request_data, session_id, per_page):       

        page = request_data.get('page', 1)  

        # Main query to retrieve membership
        query = db.session.query(
            Membership.id,
            Membership.title,
            Membership.sub_title,
            Membership.price,
            Membership.duration,
            Membership.duration_type,
            Membership.description
        ).filter(
            Membership.status == 1
        )

        # Paginate the query
        paginated_query = query.paginate(page=page, per_page=per_page, error_out=False)

        # Extract the paginated items
        membership_items = paginated_query.items

        # Formatting the data
        membership_data = []
        for item in membership_items:

            membership_data.append({
                'id': item.id,
                'title': item.title,
                'sub_title': item.sub_title,
                'description': item.description,
                'price': str(int(item.price)) if item.price == int(item.price) else str(float(item.price)),
                'duration_type': item.duration_type,
                'duration': item.duration
            })

        # Return paginated data with pagination meta
        return {
            'total': paginated_query.total,  # Total number of records
            'pages': paginated_query.pages,  # Total number of pages
            'current_page': paginated_query.page,  # Current page number
            'per_page': paginated_query.per_page,  # Number of items per page
            'membership': membership_data  # Actual wishlist data
        }
        
        
    

   
        
    @staticmethod
    @handle_repository_errors
    def get_my_active_membership_count(session_id):       
        current_time = datetime.utcnow()

        active_count = (
            db.session.query(func.count(UserMembership.id))
            .filter(UserMembership.status == 1, UserMembership.user_id == session_id)
            .filter(UserMembership.ends_on >= current_time)  # Check expiry
            .scalar()
        )
        
      
       
        return active_count
        
        
    
        
    @staticmethod
    @handle_repository_errors
    def get_my_membership_listt(session_id):       
        
        
        
        membership_items = db.session.query(UserMembership.id,UserMembership.purchased_on,UserMembership.ends_on,UserMembership.membership_id,Membership.title,Membership.sub_title,Membership.description).join(Membership,UserMembership.membership_id == Membership.id).filter(UserMembership.status==1,UserMembership.user_id==session_id).order_by(UserMembership.id.desc()).all() 
        
        
       

        # Formatting the data
        membership_data = []
        for item in membership_items:

            membership_data.append({
                'id': item.id,
                'membership_id': item.membership_id,
                'title': item.title,
                'sub_title': item.sub_title,
                'description': item.description,
                'purchased_on': item.purchased_on,
                'ends_on': item.ends_on
            })

        # Return paginated data with pagination meta
        return membership_data
        
        
    

   
    @staticmethod
    @handle_repository_errors
    def purchaseee(request_data, session_id):
        membership_items = db.session.query(Membership).filter(Membership.status==1,Membership.id==request_data['id']).first() 
        purchased_on = datetime.now()
        
        if membership_items.duration_type == 1:  # Days
            ends_on = purchased_on + timedelta(days=membership_items.duration)
        elif membership_items.duration_type == 2:  # Months
            ends_on = purchased_on + relativedelta(months=membership_items.duration)
        elif membership_items.duration_type == 3:  # Years
            ends_on = purchased_on + relativedelta(years=membership_items.duration)
        else:
            ends_on = purchased_on + timedelta(days=membership_items.duration)

        new_user_membership = UserMembership(
            membership_id=request_data['id'],
            user_id=session_id,
            created_by=session_id,
            purchased_on=purchased_on,
            ends_on=ends_on
        )
        db.session.add(new_user_membership)
        db.session.commit()



   
    @staticmethod
    @handle_repository_errors
    def cancle_membershippp(request_data, session_id):
        membership_items = db.session.query(UserMembership).filter(UserMembership.status==1,UserMembership.id==request_data['id'],UserMembership.user_id==session_id).first() 
        
        if membership_items :
            membership_items.status=3
            db.session.commit()



