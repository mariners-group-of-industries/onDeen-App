from app.repositories.subcategory import SubCategoryRepository
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors

class SubcategoryService:
    per_page = 10  # Define a constant for the default number of records per page in pagination

    @staticmethod
    @handle_service_errors
    def create_sub_category(request_data, session_id):
        if SubCategoryRepository.sub_category_exists(request_data):
            raise ServiceError('Sub-category title or ar_title already exists')

        sub_category_obj = SubCategoryRepository.create_SubCategory(request_data, session_id)
        if isinstance(sub_category_obj, dict) and 'error' in sub_category_obj:
            raise ServiceError('Unable to create sub-category')

        return {'message': 'Sub-category created successfully'}

    @staticmethod
    @handle_service_errors
    def get_by_subcategory_id(id,session_id):
        sub_category_obj = SubCategoryRepository.getby_SubCategory_id(id,session_id)
        if isinstance(sub_category_obj, dict) and 'error' in sub_category_obj:
            raise ServiceError('Sub-category not found')

        return sub_category_obj

    @staticmethod
    @handle_service_errors
    def get_all_sub_categories(request_data):
        sub_category_obj = SubCategoryRepository.getall_SubCategory(request_data, SubcategoryService.per_page)
        if isinstance(sub_category_obj, dict) and 'error' in sub_category_obj:
            raise ServiceError('No sub-categories found')

        return sub_category_obj

    @staticmethod
    @handle_service_errors
    def update_sub_category(request_data, session_id):
        if SubCategoryRepository.sub_category_exists(request_data, request_data.get('id')):
            raise ServiceError('Sub-category title or ar_title already exists')

        sub_category_obj = SubCategoryRepository.update_SubCategory(request_data, session_id)
        if isinstance(sub_category_obj, dict) and 'error' in sub_category_obj:
            raise ServiceError('Unable to update sub-category')

        return {'message': 'Sub-category updated successfully'}

    @staticmethod
    @handle_service_errors
    def delete_sub_category(sub_category_id):
        sub_category_obj = SubCategoryRepository.delete_SubCategory(sub_category_id)
        if isinstance(sub_category_obj, dict) and 'error' in sub_category_obj:
            raise ServiceError('Unable to delete sub-category')

        return {'message': 'Sub-category deleted successfully'}
