
from app.repositories.user import user
from app.repositories.event import EventRepo
from app.repositories.organizer import OrganizerRepository
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from datetime import datetime

class OrganizerService: 
     

    @staticmethod
    @handle_service_errors
    def organizer_id(session_id,organizer_id):

   
    
        event_obj = OrganizerRepository.get_organization_by_id(organizer_id)
        if not event_obj:
            raise ServiceError("Organizer not found")
        
        


     
        today = datetime.utcnow().date()

        request_data = {"session_id":session_id,"page":1,"per_page": 100,"organizer_id": event_obj.user_id}#,"start_date": today
        event_list = EventRepo.appEvent(request_data)
        

        for event in event_list["events"]:  # assuming event_list["events"] contains the events
            event_images = EventRepo.get_images_by_event_id(event["id"])  # Fetch images for each event
            event["images"] = event_images 

       
        # Build details response
        details = {
            "email_id": event_obj.public_email_id or event_obj.user.email_id,
            "mobile_number": event_obj.public_mobile_number or event_obj.user.mobile_number,
            "country_code": event_obj.public_country_code or event_obj.user.country_code,
            "profile_image": event_obj.user.profile_image,
       
            "organization_name": event_obj.organization_name,
            "manager_name": event_obj.manager_name,
            "location": event_obj.location,
            "about_us": event_obj.about_us,
            "latitude": event_obj.latitude,
            "longitude": event_obj.longitude,
            "foundation_date": event_obj.foundation_date,
            "rating_count": user.get_rating_count(event_obj.user_id),
            "avg_rating": user.get_avg_rating(event_obj.user_id),
        
          
            "event_list": event_list
            
            
        }

    
        return details
