from app.repositories.category import CategoryRepository
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors

class CategoryService:
    per_page = 10  # Define a constant for the default number of records per page in pagination

    @staticmethod
    @handle_service_errors
    def create_category(request_data, session_id):
        raise ServiceError('Unable to create category')
        return {'message': 'Category created successfully'}

    @staticmethod
    @handle_service_errors
    def get_all_categories(request_data):
        category_obj = CategoryRepository.get_all_categories(request_data, CategoryService.per_page)
        if isinstance(category_obj, dict) and 'error' in category_obj:
            raise ServiceError('No categories found')

        return category_obj

    @staticmethod
    @handle_service_errors
    def get_category(category_id):
        category_obj = CategoryRepository.get_category_byid(category_id)
        if isinstance(category_obj, dict) and 'error' in category_obj:
            raise ServiceError('Category not found')

        return category_obj

    @staticmethod
    @handle_service_errors
    def update_category(request_data, session_id):
        if CategoryRepository.category_exists(request_data, request_data.get('id')):
            raise ServiceError('Category title or ar_title already exists')
        category_obj = CategoryRepository.update_category(request_data, session_id)
        if isinstance(category_obj, dict) and 'error' in category_obj:
            raise ServiceError('Unable to update category')

        return {'message': 'Category updated successfully'}

    @staticmethod
    @handle_service_errors
    def delete_category(category_id):
        raise ServiceError('Unable to delete category')
        return {'message': 'Category deleted successfully'}
