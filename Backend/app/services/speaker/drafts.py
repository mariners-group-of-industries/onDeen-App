from app.repositories.drafts import DraftsRepo
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors

class DraftsService:



    @staticmethod
    @handle_service_errors
    def create_or_update_event(request_data, session_id):
        # Check if the event already exists
        event_id = request_data.get('id')      
            
        event_data = {
            'user_id': session_id,
            'json_data': request_data.get('json_data')
        }

        # Attempt to add or update the event
        if event_id:            
            event_obj = DraftsRepo.get_event_by_id_and_user_id(event_id,session_id)
            if not event_obj:
                raise ServiceError("Draft not found")
            event_obj = DraftsRepo.update_event(event_id, event_data)
        else:
            event_obj = DraftsRepo.add_event(event_data)

        # Check if the event object was successfully created or updated
        if not event_obj:
            raise ServiceError("Draft creation or update failed")
        
        if event_id:
            message = "Drafts Updated Successfully"
        else:
            message = "Drafts Created Successfully"
        return {"message": message,"id":event_obj.id}



  
    @staticmethod
    def soft_delete(request_data, session_id):
        """Soft deletes an event only without affecting related entities."""
        event_id = request_data.get('id')
        event_obj = DraftsRepo.get_event_by_id(event_id)
        if not event_obj:
            raise ServiceError("Draft not found")
        # Change event status to 3 (soft deleted)
        event_data = {'status': 3, 'updated_by': session_id}
        DraftsRepo.update_event(event_id, event_data)
        message = "Drafts Deleted Successfully"
        return {"message": message,"id":event_id}

        
        

    @staticmethod
    @handle_service_errors
    def get_event_details(request_data,session_id):
        """Fetches all details of an event by its ID."""
        
        event_id = request_data.get('id')
        # Fetch the event by ID
        event_obj = DraftsRepo.get_event_by_id_and_user_id(event_id,session_id)
        if not event_obj:
            raise ServiceError("Draft not found")

       
        

        # Build event details response
        event_details = {
            "id": event_obj.id,
            "user_id": event_obj.user_id,
            "status": event_obj.status,
            "json_data": event_obj.json_data
             
        }

        # Convert all time objects in the response to strings
        return event_details
        
         
    
    @staticmethod
    @handle_service_errors
    def get_all_drafts(request_data,session_id):
        """Fetches active facilities, tags, categories with subcategories, and speakers."""

        # Get all active facilities
        events= DraftsRepo.get_all_drafts(request_data,session_id)
        return events

