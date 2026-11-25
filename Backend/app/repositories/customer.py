from app.models.users import Users
from app import db
from app.utils.response_decorators import handle_repository_errors
from app.utils.date_utils import normalize_date_value
from app.utils.file_upload import store_file
from sqlalchemy import func
from datetime import date, datetime

class CustomerRepo:

    @staticmethod
    @handle_repository_errors
    def add_customer(customer_data):
        """Adds a new customer to the database."""
        try:
            if 'dob' in customer_data:
                customer_data = {**customer_data, 'dob': normalize_date_value(customer_data.get('dob'))}
            new_customer = Users(**customer_data)
            db.session.add(new_customer)
            db.session.commit()
            return new_customer
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def update_customer(customer_id, customer_data):
        """Updates an existing customer in the database."""
        try:
            customer = Users.query.get(customer_id)
            if customer:
                for key, value in customer_data.items():
                    if key == 'dob':
                        value = normalize_date_value(value)
                    setattr(customer, key, value)
                db.session.commit()
            return customer
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def get_customer_by_id(customer_id):
        """Gets a customer by ID."""
        try:
            return Users.query.get(customer_id)
        except Exception as e:
            raise e

    @staticmethod
    @handle_repository_errors
    def delete_customer(customer_id):
        """Deletes a customer by setting their status to inactive."""
        try:
            customer = Users.query.get(customer_id)
            if customer:
                customer.status = 0  # Assuming '0' indicates an inactive status
                db.session.commit()
            return customer
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def get_customers_filtered(request_data):
        """Fetches customers based on optional filters provided in the request data."""
        try:
            # Extract filters from request data
            role_type = 2
            status = request_data.get('status', None)  # Default is active customers
            keyword = request_data.get('keyword')
            country_code = request_data.get('country_code')
            page = request_data.get('page', 1)
            per_page = request_data.get('per_page', 100)

            query = Users.query
            query = query.filter(Users.status!=3)

            # Apply filters
            if role_type is not None:
                query = query.filter(Users.role_type == role_type)
            if status is not None:
                query = query.filter(Users.status == status)
            if keyword:
                query = query.filter(
                    Users.first_name.ilike(f"%{keyword}%")
                    | Users.last_name.ilike(f"%{keyword}%")
                    | Users.email_id.ilike(f"%{keyword}%")
                    | Users.mobile_number.ilike(f"%{keyword}%")
                    | func.concat(Users.first_name, ' ', Users.last_name).ilike(f"%{keyword}%")
                )
            if country_code:
                query = query.filter(Users.country_code == country_code)
                
                
            query = query.order_by(Users.id.desc())

            # Pagination
            paginated_query = query.paginate(page=page, per_page=per_page, error_out=False)

            # Serialize customers
            serialized_customers = [
                CustomerRepo.serialize_customer(customer) for customer in paginated_query.items
            ]

            return {
                "customers": serialized_customers,
                "total": paginated_query.total,
                "pages": paginated_query.pages,
                "current_page": paginated_query.page,
                "per_page": paginated_query.per_page,
            }
        except Exception as e:
            raise e

    @staticmethod
    def serialize_customer(customer):
        """Serializes a customer object for response."""
        return {
            "id": customer.id,
            "parent_id": customer.parent_id,
            "role_type": customer.role_type,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "gender": customer.gender,
            "journey_level_id": customer.journey_level_id,
            "age": customer.age,
            "profile_image": customer.profile_image,
            "country_code": customer.country_code,
            "mobile_number": customer.mobile_number,
            "email_id": customer.email_id,
            "status": customer.status,
            "dob": customer.dob.isoformat() if isinstance(customer.dob, (date, datetime)) else customer.dob,
        }
        
        
    @staticmethod
    @handle_repository_errors
    def upload_image(request_data):
        import base64
        from werkzeug.utils import secure_filename

        filename = secure_filename(request_data.get('filename') or 'upload.jpeg')
        base64_data = request_data['data']

        try:
            file_data = base64.b64decode(base64_data)
        except Exception as e:
            return {"error": f"Failed to decode Base64 data: {e}"}

        try:
            upload = store_file(file_data, "customer", filename, request_data.get("content_type", "image/jpeg"))
            return {"message": "Upload successful", "file_url": upload["url"]}
        except Exception as e:
            return {"error": f"Error uploading file: {e}"}
