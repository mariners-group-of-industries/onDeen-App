from app import db
from app.models.category import Category,SubCategory
from sqlalchemy import or_
from app.utils.response_decorators import handle_repository_errors

class CategoryRepository:

    @staticmethod
    @handle_repository_errors
    def create_category(data, session_id):
        # new_category = Category(
            # title=data.get('title'),
            # ar_title=data.get('ar_title'),
            # image=data.get('image'),
            # position=data.get('position'),
            # is_material=data.get('is_material'),
            # is_speaker=data.get('is_speaker'),
            # is_curriculum=data.get('is_curriculum'),
            # is_itinerary=data.get('is_itinerary'),
            # is_tourslot=data.get('is_tourslot'),
            # status=data.get('status'),
            # home_view=data.get('home_view'),
            # created_by=session_id
        # )
        
        # db.session.add(new_category)
        # db.session.commit()
        # if new_category.id:
            # return new_category.id
        return {"error": "is_error"}

    @staticmethod
    @handle_repository_errors
    def get_all_categories(data, per_page):
        query = db.session.query(Category)
        
        query = query.filter(Category.status.in_([1, 2]))
        
        if 'search_key' in data and data['search_key']:
            search_key = f"%{data['search_key']}%"
            query = query.filter(or_(
                Category.title.ilike(search_key),
                Category.ar_title.ilike(search_key)
            ))
            
            
        # Filter by status if it's not None or an empty string
        if 'status' in data and data['status'] not in [None, ""]:
            query = query.filter(Category.status == data['status'])

   
        
        query = query.order_by(Category.position.asc())
        query = query.paginate(page=data.get('page',1), per_page=per_page, error_out=False)
        categories = query.items
    
        if categories:
            all_categories = []
            
            for category in categories:
                all_categories.append({
                    'id': category.id,
                    'title': category.title,
                    'ar_title': category.ar_title,       
                    'is_tourslot': category.is_tourslot,               
                    'is_itinerary': category.is_itinerary,               
                    'is_curriculum': category.is_curriculum,               
                    'is_speaker': category.is_speaker,               
                    'is_material': category.is_material,  
                    'image': category.image,
                    'position': category.position,
                    'status': category.status,
                    'home_view': category.home_view,
                })
            
            return {
                'categories': all_categories,
                'pagination_meta': {
                    'total': query.total,
                    'pages': query.pages,
                    'current_page': query.page,
                    'per_page': query.per_page
                }
            }
        return {"error": "is_error"}

    @staticmethod
    @handle_repository_errors
    def get_category_byid(category_id):
        category = db.session.query(Category).filter(Category.id == category_id).first()
        if category:
            return {
                'id': category.id,
                'title': category.title,
                'ar_title': category.ar_title,               
                'is_tourslot': category.is_tourslot,               
                'is_itinerary': category.is_itinerary,               
                'is_curriculum': category.is_curriculum,               
                'is_speaker': category.is_speaker,               
                'is_material': category.is_material,               
                'image': category.image,
                'position': category.position,
                'status': category.status,
                'home_view': category.home_view,
            }
        return {"error": "is_error"}

    @staticmethod
    @handle_repository_errors
    def update_category(data, session_id):
        category_obj = db.session.query(Category).filter(Category.id == data['id']).first()
        if not category_obj:
            return {"error": "is_error"}
        
        category_obj.title = data.get('title')
        category_obj.ar_title = data.get('ar_title')
        if data.get('image') : 
            category_obj.image = data.get('image')
        if data.get('is_material') : 
            category_obj.is_material = data.get('is_material',1)
        if data.get('is_speaker') : 
            category_obj.is_speaker = data.get('is_speaker',1)
        if data.get('is_curriculum') : 
            category_obj.is_curriculum = data.get('is_curriculum',1)
        if data.get('is_itinerary') : 
            category_obj.is_itinerary = data.get('is_itinerary',1)
        if data.get('is_tourslot') : 
            category_obj.is_tourslot = data.get('is_tourslot',1)
        category_obj.position = data.get('position')
        category_obj.status = data.get('status')
        category_obj.home_view = data.get('home_view')
        category_obj.updated_by = session_id

        db.session.commit()
        return category_obj.id

    @staticmethod
    @handle_repository_errors
    def delete_category(category_id):
        category_obj = db.session.query(Category).filter(Category.id == category_id).first()
        if not category_obj:
            return {"error": "is_error"}
        
        category_obj.status = 3  
        db.session.commit()
        return category_obj.id  

    @staticmethod
    @handle_repository_errors
    def get_category_subcategory_by_id(data):
        category = db.session.query(Category).filter(Category.id == data['id']).first()
        if category:
            sub_categories = db.session.query(SubCategory).filter(SubCategory.category_id == category.id).all()
            
            sub_category_list = []
            for sub_category in sub_categories:
                sub_category_list.append({
                    'id': sub_category.id,
                    'category_id': sub_category.category_id,
                    'title': sub_category.title,
                    'ar_title': sub_category.ar_title,
                    'image': sub_category.image,
                    'position': sub_category.position,
                    'status': sub_category.status,
                    'home_view': sub_category.home_view,
                })

            return {
                'id': category.id,
                'title': category.title,
                'ar_title': category.ar_title,
                'image': category.image,
                'position': category.position,
                'status': category.status,
                'home_view': category.home_view,
                'sub_categories': sub_category_list  
            }
        return {"error": "is_error"}



    @staticmethod
    @handle_repository_errors
    def category_exists(data, category_id=None):
        query = db.session.query(Category).filter(or_(Category.title == data.get('title'),Category.ar_title == data.get('ar_title')),Category.status == 1)
        
        if category_id:
            query = query.filter(Category.id != category_id)
        
        return query.first() is not None
    
    
    @staticmethod
    @handle_repository_errors
    def appCategories():
        query = db.session.query(Category)
        
        query = query.with_entities(Category.id,Category.title,Category.ar_title,Category.is_tourslot,Category.is_itinerary,Category.is_curriculum,Category.is_speaker,Category.is_material,Category.image)
        
        query = query.filter(Category.status==1)
        
        query = query.order_by(Category.position.asc())

   

        categories = query.all()
       
        if categories:
            all_categories = []
            for category in categories:
                all_categories.append({
                    'id': category.id,
                    'title': category.title,
                    'ar_title': category.ar_title,            
                    'is_tourslot': category.is_tourslot,               
                    'is_itinerary': category.is_itinerary,               
                    'is_curriculum': category.is_curriculum,               
                    'is_speaker': category.is_speaker,               
                    'is_material': category.is_material,           
                    'image': category.image,
                })
            return  all_categories

        return {"error": "is_error"}
