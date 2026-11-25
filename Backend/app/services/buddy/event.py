from app.repositories.event import EventRepo
from app.repositories.buddy import BuddyRepository
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
import os
import re


def _whatsapp_url(country_code, mobile_number):
    """Build a WhatsApp deep link without exposing non-phone characters."""
    country = re.sub(r"\D", "", str(country_code or ""))
    mobile = re.sub(r"\D", "", str(mobile_number or ""))
    if not country or not mobile:
        return None
    mobile = mobile.lstrip("0")
    if not mobile:
        return None
    return f"https://wa.me/{country}{mobile}"


class EventService:
    
    @staticmethod
    @handle_service_errors
    def get_request_buddy(request_data,session):
        request_data = dict(request_data or {})
        # Buddies can only read type-1 requests assigned to their own account.
        request_data['buddy_id'] = session
        request_data['type'] = 1
        events= EventRepo.get_request_buddy(request_data)
        
        
        results = []
        for data in events:
            # Assuming `data` is an object and has attributes like `id`, `event_id`, etc.
            if not data.time_zone:
                data_time_zone=os.getenv('d_t_z')
            else:
                data_time_zone=data.time_zone
            data_return = {
                "id": data.id,
                "event_id": data.event_id,
                "event_title": data.event_title,
                "time_zone": data_time_zone,
                "buddy_id": data.buddy_id,
                "user_id": data.user_id,
                "user_first_name": data.user_first_name,
                "user_last_name": data.user_last_name,
                "user_email_id": data.user_email_id,
                "journey_level_title": data.journey_level_title,
                "buddy_first_name": data.buddy_first_name,
                "buddy_last_name": data.buddy_last_name,
                "user_profile_image": data.user_profile_image,
                "user_mobile": data.user_mobile_number,
                "country_code": data.user_country_code,
                "whatsapp_url": _whatsapp_url(data.user_country_code, data.user_mobile_number),
                "requested_date": data.created_on,
                "status": data.status,
                "type": data.type
            }
            results.append(data_return)
        
        return results
    
    
    
    
    
    
    @staticmethod
    @handle_service_errors
    def update_attendance(request_data,session_id):
        request_data = request_data or {}
        qrcode = request_data.get('qrcode')
        if not qrcode:
            raise ServiceError("QR code is required")
        
        buddy_data=BuddyRepository.get_user_by_id(session_id)
        session_id2=buddy_data.parent_id
        
        attendance_response = EventRepo.update_attendance(
            qrcode,
            session_id2,
            expected_event_id=request_data.get('event_id'),
        )
        if isinstance(attendance_response, dict) and 'error3' in attendance_response:
            raise ServiceError("Participant not found for today")
        if isinstance(attendance_response, dict) and 'error' in attendance_response:
            raise ServiceError("Participant has already been marked as present for today")
        if isinstance(attendance_response, dict) and 'error2' in attendance_response:
            raise ServiceError("Participant not found")
        if isinstance(attendance_response, dict) and 'error4' in attendance_response:
            raise ServiceError("Not Your Event ")
        if isinstance(attendance_response, dict) and 'error5' in attendance_response:
            raise ServiceError("Event Not Found")
        if isinstance(attendance_response, dict) and 'error6' in attendance_response:
            raise ServiceError("User Cancelled Booking")
        if isinstance(attendance_response, dict) and 'error7' in attendance_response:
            raise ServiceError("QR code belongs to another listing")

        return {"message": "Attendance updated successfully","scan_quantity":attendance_response.scan_quantity}
