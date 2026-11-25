
from app.repositories.event import EventRepo
from app.repositories.speakers import SpeakerRepository
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from datetime import datetime
from zoneinfo import ZoneInfo
import os
class SpeakerService: 
     

    @staticmethod
    @handle_service_errors
    def speaker_id(session_id,speaker_id):

        event_obj = SpeakerRepository.get_speaker_by_id(speaker_id)
        if not event_obj:
            raise ServiceError("Speaker not found")
        
        slot_count = SpeakerRepository.get_speaker_slot_count(speaker_id)
        next_available_date = SpeakerRepository.get_next_available_date(speaker_id,event_obj.user.time_zone)
        
        today = datetime.utcnow().date()
        request_data = {"session_id":session_id,"page":1,"per_page": 100,"speaker_id": event_obj.user_id}#,"start_date": today
        event_list = EventRepo.appEvent(request_data)
        

        for event in event_list["events"]:  # assuming event_list["events"] contains the events
            event_images = EventRepo.get_images_by_event_id(event["id"])  # Fetch images for each event
            event["images"] = event_images 

       
        # Build a public projection. Contact details and approval evidence are
        # stored for Organiser/Admin workflows and must not cross into the
        # customer-facing speaker endpoint.
        details = {
            "slot_count": slot_count,
            "next_available_date": next_available_date,
            "user_profile_image": event_obj.user.profile_image,
            "time_zone": event_obj.user.time_zone if event_obj.user.time_zone else os.getenv('d_t_z'),
            "user_first_name": event_obj.user.first_name,
            "user_last_name": event_obj.user.last_name,
            "about_us": event_obj.about_us,
            "expertise": SpeakerService.get_expertise_details(speaker_id),
            "event_list": event_list
        }


        return details
        
       
    @staticmethod
    def get_expertise_details(user_id):
        """Get expertise associated with the speaker."""
        expertise_list = SpeakerRepository.get_speaker_expertise_by_user_id(user_id)
        return [
            {
                "title": expertise.expertise.title
            }
            for expertise in expertise_list
        ]
 

        
        
   
    @staticmethod
    @handle_service_errors
    def speaker_slot(session_id,request_data):
        speaker_id = request_data.get("id")
        speaker_obj = SpeakerRepository.get_speaker_by_id(speaker_id)
        if not speaker_obj:
            raise ServiceError("Speaker not found")
        timezone_name = speaker_obj.user.time_zone or os.getenv('d_t_z') or 'UTC'
        try:
            speaker_timezone = ZoneInfo(timezone_name)
        except Exception:
            speaker_timezone = ZoneInfo('UTC')
            timezone_name = 'UTC'
        cdatetime = datetime.now(speaker_timezone)
        cdate = cdatetime.date()
        if not request_data.get("date"):
            today = cdate
        else:
            try:
                today = datetime.strptime(str(request_data.get("date")), "%Y-%m-%d").date()
            except (TypeError, ValueError):
                raise ServiceError("A valid session date is required")

        times = []
        details = {
            "date": today,
            "status": 2,
            "times": times,
            "one_to_one_enabled": bool(speaker_obj.one_to_one_enabled),
            "location_type": speaker_obj.one_to_one_location_type,
            "duration_minutes": speaker_obj.one_to_one_duration_minutes,
        }
        if speaker_obj.one_to_one_enabled is not False and today >= cdate:
            exact_date = SpeakerRepository.get_avaialability_by_user_id_and_date(speaker_id, today)
            # A date-specific unavailable record overrides a recurring weekday.
            if exact_date is not None:
                available_date = exact_date if exact_date.status == 1 else None
            else:
                weekday = SpeakerRepository.get_avaialability_by_user_id_and_weekday(speaker_id, today)
                available_date = weekday if weekday and weekday.status == 1 else None

            if available_date is not None:
                for available_time in SpeakerRepository.get_speaker_availability_time(available_date.id):
                    if not available_time.start_time or available_time.status != 1:
                        continue
                    slot_datetime = datetime.combine(
                        today,
                        available_time.start_time,
                        tzinfo=speaker_timezone,
                    )
                    if slot_datetime <= cdatetime:
                        continue
                    if EventRepo.get_active_one_to_one_for_slot(
                        speaker_id,
                        today,
                        available_time.start_time,
                    ):
                        continue
                    times.append({
                        "id": available_time.id,
                        "start_time": available_time.start_time.strftime('%H:%M:%S'),
                        "end_time": available_time.end_time.strftime('%H:%M:%S') if available_time.end_time else None,
                        "status": 1,
                    })
                details["status"] = 1

        details['next_available_date'] = (
            SpeakerRepository.get_next_available_date(speaker_id, timezone_name)
            if speaker_obj.one_to_one_enabled is not False
            else None
        )
        details['time_zone'] = timezone_name
        return details
