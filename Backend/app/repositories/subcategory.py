from app import db
from app.models.category import Category,SubCategory
from sqlalchemy import or_
from app.utils.response_decorators import handle_repository_errors

class SubCategoryRepository:

    @staticmethod
    @handle_repository_errors
    def create_SubCategory(data, session_id):
        new_SubCategory = SubCategory(
            category_id=data.get('category_id'),
            title=data.get('title'),
            ar_title=data.get('ar_title'),
            
            position=data.get('position'),
            status=data.get('status'),
           
            created_by=session_id
        )
        
        db.session.add(new_SubCategory)
        db.session.commit()
        
        if new_SubCategory.id:
            return new_SubCategory.id
        return {"error": "is_error"}

    @staticmethod
    @handle_repository_errors
    def getby_SubCategory_id(id,session_id):
        Sub_category = db.session.query(SubCategory).filter(SubCategory.id == id).first()
        if not Sub_category:
            return {"error": "is_error"}

        result = {
            'id': Sub_category.id,
            'category_id': Sub_category.category_id,
            'title': Sub_category.title,
            'ar_title': Sub_category.ar_title,            
            'position': Sub_category.position,
            'status': Sub_category.status,
            
        }
        return result

    @staticmethod
    @handle_repository_errors
    def update_SubCategory(data, session_id):
        SubCategory_obj = db.session.query(SubCategory).filter(SubCategory.id == data.get('id')).first()
        if not SubCategory_obj:
            return {"error": "is_error"}
        
        SubCategory_obj.category_id = data.get('category_id')
        SubCategory_obj.title = data.get('title')
        SubCategory_obj.ar_title = data.get('ar_title')
        
        SubCategory_obj.position = data.get('position')
        SubCategory_obj.status = data.get('status')
        
        SubCategory_obj.updated_by = session_id

        db.session.commit()
        return SubCategory_obj.id

    @staticmethod
    @handle_repository_errors
    def delete_SubCategory(SubCategory_id):
        SubCategory_obj = db.session.query(SubCategory).filter(SubCategory.id == SubCategory_id).first()
        
        if not SubCategory_obj:
            return {"error": "is_error"}
        
        SubCategory_obj.status = 3  
        db.session.commit()
        return SubCategory_obj.id  

    @staticmethod
    @handle_repository_errors
    def getall_SubCategory(data, per_page):
        # Perform the query and join with Category table
        query = db.session.query(SubCategory, Category).join(Category, SubCategory.category_id == Category.id)
        
        query = query.filter(SubCategory.status.in_([1, 2]))
        
        # Search filter
        if 'search_key' in data and data['search_key']:
            search_key = f"%{data['search_key']}%"
            query = query.filter(or_(
                SubCategory.title.ilike(search_key),
                SubCategory.ar_title.ilike(search_key)
            ))
        
        # Filter by status if it's not None or an empty string
        if 'status' in data and data['status'] not in [None, ""]:
            query = query.filter(SubCategory.status == data['status'])

        
        
        if 'category_id' in data and data['category_id'] not in [None, ""]:
            query = query.filter(SubCategory.category_id == data['category_id'])    
            
        
        
        # Order by created_on and paginate the results
        query = query.order_by(SubCategory.created_on.desc())
        query = query.paginate(page=data.get('page', 1), per_page=per_page, error_out=False)
        sub_categories = query.items

        # Return error if no sub-categories found
        if not sub_categories:
            return {"error": "is_error"}

        # Prepare result with sub-category and category details
        result = []
        for Sub_Category, category in sub_categories:  # Extract both SubCategory and category objects from the joined query
            result.append({
                'id': Sub_Category.id,
                'position': Sub_Category.position,
                'title': Sub_Category.title,
                'ar_title': Sub_Category.ar_title,
            
                'status': Sub_Category.status,
                'category': {
                    'category_id': Sub_Category.category_id,
                    'title': category.title,
                    'ar_title': category.ar_title,
                }
            })

        return {
            'sub_categories': result,
            'pagination_meta': {
                'total': query.total,
                'pages': query.pages,
                'current_page': query.page,
                'per_page': query.per_page
            }
        }


    @staticmethod
    @handle_repository_errors
    def sub_category_exists(data, SubCategory_id=None):
        query = db.session.query(SubCategory).filter(or_(SubCategory.title == data.get('title'),SubCategory.ar_title == data.get('ar_title')),SubCategory.status.in_([1, 2]))
        
        if SubCategory_id:
            query = query.filter(SubCategory.id != SubCategory_id)
        
        return query.first() is not None
    
    
    
    @staticmethod
    @handle_repository_errors
    def appSubCategories(request_data):
        query = db.session.query(SubCategory)
        
        query = query.with_entities(SubCategory.id,SubCategory.title,SubCategory.ar_title)
        
        query = query.filter(SubCategory.status==1,SubCategory.category_id==request_data.get('category_id'))
        
        query = query.order_by(SubCategory.position.asc())

   

        subcategories = query.all()

        if subcategories:
            all_subcategories = []
            for subcategory in subcategories:
                all_subcategories.append({
                    'id': subcategory.id,
                    'title': subcategory.title,
                    'ar_title': subcategory.ar_title,
        
                })
            return  all_subcategories

        return {"error": "is_error"}