from app.repositories.customer import CustomerRepo
from app.repositories.user import user
from app.repositories.event import EventRepo
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from werkzeug.security import generate_password_hash

class CustomerService:
    role_type = 2
    
    
    
    
    @staticmethod
    @handle_service_errors
    def soft_delete(request_data, session_id):
        """Soft deletes a customer by updating their status."""
        
        customer_id = request_data.get('id')

        if not customer_id: 
            raise ValueError("Valid 'id' and 'type=1' are required for soft deleting a customer.")

        # Fetch the customer by ID
        customer_obj = CustomerRepo.get_customer_by_id(customer_id)
        if not customer_obj:
            raise ValueError("Customer not found.")

        # Update customer status to 3 (soft deleted)
        customer_data = {'status': 3, 'updated_by': session_id}
        CustomerRepo.update_customer(customer_id, customer_data)

        return {"message": f"Customer with ID {customer_id} soft deleted successfully."}





    @staticmethod
    @handle_service_errors
    def create_or_update_customer(request_data, session_id):
        """Creates or updates a customer record."""
        # Check if the customer already exists
        
        
        customer_id = request_data.get('id')
        
        
        
           # Check if email or mobile already exists
        if customer_id:
            if user.email_check_update(request_data.get('email_id'),CustomerService.role_type, customer_id):
                raise ServiceError("Email ID already exists")
            if user.mobile_check_update(request_data.get('mobile_number'),CustomerService.role_type, customer_id, request_data.get('country_code')):
                raise ServiceError("Mobile number already exists")
        else:
            CustomerService.check_exists(request_data.get('email_id'), user.email_check, "Email ID already exists",CustomerService.role_type)
            CustomerService.check_exists(request_data.get('mobile_number'), user.mobile_check, "Mobile number already exists",CustomerService.role_type ,request_data.get('country_code'))



        # Build customer data
        customer_data = CustomerService.build_customer_data(request_data, session_id)

        # Create or update the customer
        if customer_id:
            customer_obj = CustomerRepo.update_customer(customer_id, customer_data)
        else:
            customer_obj = CustomerRepo.add_customer(customer_data)

        # Check if the operation was successful
        if not customer_obj:
            raise ValueError("Customer creation or update failed")

        return {"message": "Customer Updated Successfully" if customer_id else "Customer Created Successfully", "id": customer_obj.id}

    @staticmethod
    def build_customer_data(request_data, session_id):
        """Builds a dictionary of customer data for creating or updating."""
        user_data = {
            "parent_id": request_data.get("parent_id"),
            "role_type": CustomerService.role_type,
            
            
            "first_name": request_data.get("first_name"),
            "last_name": request_data.get("last_name"),
            "gender": request_data.get("gender"),
            "age": request_data.get("age"),
            "profile_image": request_data.get("profile_image"),
            "country_code": request_data.get("country_code"),
            "mobile_number": request_data.get("mobile_number"),
            "email_id": request_data.get("email_id"),
            "journey_level_id": request_data.get("journey_level_id", 0),
            "status": request_data.get("status", 1),
            "dob": request_data.get("dob"),
            "updated_by": session_id, 
        }
        
        if request_data.get('password'):
            user_data['password'] = generate_password_hash(request_data.get('password', ''), method='pbkdf2:sha256')
        
        return user_data

    @staticmethod
    @handle_service_errors
    def get_customer_details(request_data):
        """Fetches details of a customer by ID."""
        customer_id = request_data.get('id')

        # Fetch the customer by ID
        customer_obj = CustomerRepo.get_customer_by_id(customer_id)
        if not customer_obj:
            raise ValueError("Customer not found")

        # Build customer details response
        customer_details = {
            "id": customer_obj.id,
            "role_type": customer_obj.role_type,
            "first_name": customer_obj.first_name,
            "last_name": customer_obj.last_name,
            "gender": customer_obj.gender,
            "age": customer_obj.age,
            "profile_image": customer_obj.profile_image,
            "country_code": customer_obj.country_code,
            "mobile_number": customer_obj.mobile_number,
            "journey_level_id": customer_obj.journey_level_id,
            "email_id": customer_obj.email_id,
            "status": customer_obj.status,
            "dob": customer_obj.dob,
            "created_on": customer_obj.created_on.strftime('%Y-%m-%d %H:%M:%S'),
            "updated_on": customer_obj.updated_on.strftime('%Y-%m-%d %H:%M:%S'),
        }

        return customer_details

    @staticmethod
    @handle_service_errors
    def get_all_customers(request_data):
        """Fetches a list of customers based on filters."""
        # Apply filters using the request data
        customers = CustomerRepo.get_customers_filtered(request_data)
        return customers
    
    
    @staticmethod
    @handle_service_errors
    def user_count():
    
        
        role_type = 3        
        user_count = user.user_count(role_type)
        
        request_buddy_count = EventRepo.get_request_buddy_count(1)
        request_session_count = EventRepo.get_request_buddy_count(2)
        
        return {'user_count': user_count,'request_buddy_count': request_buddy_count,'request_session_count': request_session_count}
    
    
    
    
    def check_exists(value, check_func, error_message, *args):
        if check_func(value, *args):
            raise ServiceError(error_message)
        
        
        
