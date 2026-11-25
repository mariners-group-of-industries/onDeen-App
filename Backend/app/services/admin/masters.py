from app.repositories.masters import MastersRepo
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from app.models.event import Tag,Facilities
from app.models.organization import SchoolOfThought,RegistrationQuestion
from app.models.speakers import Expertise



class MastersService:
    
    
    
    @staticmethod
    @handle_service_errors
    def delete_master_entry(request_data,session_id):
        """Soft deletes an entry by setting its status to inactive."""
        entry_id = request_data.get('id')
        master_type = request_data.get('master_type')
        model = MastersService._get_model(master_type)
        
        response_data = MastersRepo.delete_master_entry(model, entry_id)
        if not response_data:
            raise ServiceError("Entry not found")
        
        return {"message": f"{master_type.capitalize()} deleted successfully"}
   
 
    @staticmethod
    @handle_service_errors
    def add_master_entry(request_data,session_id):
        """Adds a new entry to a master table."""
        master_type = request_data.get('master_type')
        
        model = MastersService._get_model(master_type)
        
        response_data = MastersRepo.add_master_entry(model, request_data)
        if not response_data:
            raise ServiceError("Master data creation failed")
        return {"message": f"{master_type.capitalize()} created successfully"}
    
    
    
    
    @staticmethod
    @handle_service_errors
    def update_master_entry(request_data,session_id):
        """Updates an existing entry in a master table."""
        entry_id = request_data.get('id')
        master_type = request_data.get('master_type')
        if(master_type != "RegistrationQuestion"):
            request_data['updated_by'] = session_id
        model = MastersService._get_model(master_type)
        
        response_data = MastersRepo.update_master_entry(model, entry_id, request_data)
        if not response_data:
            raise ServiceError("Master data update failed")
        return {"message": f"{master_type.capitalize()} updated successfully"}
    
    
    @staticmethod
    @handle_service_errors
    def get_master_entry_by_id(request_data):
        """Fetches a master entry by ID."""
        entry_id = request_data.get('id')
        master_type = request_data.get('master_type')
        model = MastersService._get_model(master_type)
        
        response_data = MastersRepo.get_master_entry_by_id(model, entry_id)
        if not response_data:
            raise ServiceError("Entry not found")
        
        response_data = MastersService._construct_response(response_data)
        return response_data
    
    
    @staticmethod
    @handle_service_errors
    def get_all_master_entries(request_data):
        """Fetches all master entries based on master_type, search_key, and pagination."""
        master_type = request_data.get('master_type')
        search_key = request_data.get('search_key')
        status = request_data.get('status')
        page = request_data.get('page', 1)
        per_page = request_data.get('per_page', 10)

        if status is not None:
            status = int(status)
     
        model = MastersService._get_model(master_type)

        if model is None:
            raise ServiceError("Invalid master type")

        # Fetch all entries from the repository with the search key and pagination
        result = MastersRepo.get_all_master_entries(model, search_key, status, page, per_page,master_type)
        entries = result.get("entries")
        pagination_meta = result.get("pagination")

        if not entries:
            return {"message": "No entries found"}

        # Construct response based on entries
        response_data = [MastersService._construct_response(entry) for entry in entries]
        return {
            "data": response_data,
            "pagination": pagination_meta
        }
        
        
        
        
        
        
    @staticmethod
    def _construct_response(entry):
        """Constructs a structured response based on the entry type."""
        if isinstance(entry, Expertise):
            return {
                "id": entry.id,
                "title": entry.title,
                "ar_title": entry.ar_title,
                "position": entry.position,
                "status": entry.status
            }
        elif isinstance(entry, Facilities):
            return {
                "id": entry.id,
                "title": entry.title,
                "ar_title": entry.ar_title,
                "position": entry.position,
                "status": entry.status
            }
        elif isinstance(entry, Tag):
            return {
                "id": entry.id,
                "title": entry.title,
                "ar_title": entry.ar_title,
                "position": entry.position,
                "status": entry.status
            }
        elif isinstance(entry, SchoolOfThought):
            return {
                "id": entry.id,
                "title": entry.title,
                "ar_title": entry.ar_title,
                "position": entry.position,
                "status": entry.status
            }
        elif isinstance(entry, RegistrationQuestion):
            return {
                "id": entry.id,
                "question_for": entry.question_for,
                "question_type": entry.question_type,
                "question": entry.question,
                "status": entry.status,
                "position": entry.position
            }
        else:
            raise ServiceError("Unsupported entry type")
        
    
    
    @staticmethod
    def _get_model(master_type):
        """Maps master_type to the corresponding model."""
        if master_type == "Expertise":
            return Expertise
        elif master_type == "Tag":
            return Tag
        elif master_type == "Facilities":
            return Facilities
        elif master_type == "SchoolOfThought":
            return SchoolOfThought
        elif master_type == "RegistrationQuestion":
            return RegistrationQuestion
        else:
            raise ServiceError("Invalid master type")
    

