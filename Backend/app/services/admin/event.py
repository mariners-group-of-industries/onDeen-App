from app.repositories.event import EventRepo
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_service_errors
from datetime import datetime, timedelta,date ,time
from app.repositories.user import user
from app.repositories.organizer import OrganizerRepository
from flask import request
import os

class EventService: 

    
    @staticmethod
    @handle_service_errors
    def journey_levels(session_id):
        data= EventRepo.journey_levels(session_id,2)
        return data

    
    @staticmethod
    @handle_service_errors
    def create_or_update_event(request_data, session_id):
        # Check if the event already exists
        event_id = request_data.get('id')

        

        # Create or update the event
        
        event_data = EventService.build_event_data(request_data, session_id)

        # Attempt to add or update the event
        if event_id:
            event_obj = EventRepo.get_event_by_id(event_id)
            if not event_obj:
                raise ServiceError("Event not found")
            pcount=EventRepo.total_participants_count(event_id)
            if pcount and pcount>0:
                if event_obj.start_date.strftime('%Y-%m-%d')!=request_data['start_date'] or event_obj.end_date.strftime('%Y-%m-%d')!=request_data['end_date']:
                    raise ServiceError("Event has been booked by someone, can not update the date now")
            event_obj = EventRepo.update_event(event_id, event_data)
        else:
            event_obj = EventRepo.add_event(event_data)

        # Check if the event object was successfully created or updated
        if not event_obj:
            raise ValueError("Event creation or update failed")
        EventRepo.updateNumberofclass(event_id)
        # Process related entities (images, tags, curriculum, facilities, speakers, documents)
        EventService.process_related_entities(request_data, event_obj.id, session_id)

        if event_id:
            EventRepo.send_push_notifications_for_event_update(event_obj)
        else:
            EventRepo.send_push_notifications_for_event(event_obj)
            
        if request_data.get("material_notification") == 1:
            EventRepo.send_push_notifications_for_material_upload(event_obj)

        share_url = EventRepo.share(event_obj.id,event_obj.title)
        
        return {"message": "Event Updated Successfully" if event_id else "Event Created Successfully","id":event_obj.id,"share_url":share_url}

    @staticmethod
    def build_event_data(request_data, session_id):
        """Builds event data dictionary from request data."""
        if not request_data.get('end_date'):
            request_data['end_date']=request_data.get('start_date')
        return {
            'user_id': request_data.get('user_id',0),
            'title': request_data.get('title'),
            'ar_title': request_data.get('ar_title'),
            'category_id': request_data.get('category_id',0),
            'sub_category_id': request_data.get('sub_category_id',0),
            'description': request_data.get('description'),
            'ar_description': request_data.get('ar_description'),
            'time_zone': request_data.get('time_zone',request.headers.get('Timezone',os.getenv('d_t_z'))),
            'start_date': request_data.get('start_date'),
            'end_date': request_data.get('end_date'),
            'start_time': request_data.get('start_time'),
            'end_time': request_data.get('end_time'),
            'event_type': request_data.get('event_type',0),
            'location_type': request_data.get('location_type',0),
            'meet_link': request_data.get('meet_link'),
            'location': request_data.get('location'),
            'latitude': request_data.get('latitude',0),
            'longitude': request_data.get('longitude',0),
            'to_location': request_data.get('to_location'),
            'to_latitude': request_data.get('to_latitude',0),
            'to_longitude': request_data.get('to_longitude',0),
            'price_type': request_data.get('price_type',0),
            "city": request_data.get('city'),
            "area": request_data.get('area'),
            'price': request_data.get('price',0),
            'journey_level_id': request_data.get('journey_level_id',0),
            'total_no_class': request_data.get('total_no_class',0),
            'call_per_week': request_data.get('call_per_week',0),
            'rule': request_data.get('rule'),
            'ar_rule': request_data.get('ar_rule'),
            'eligibility': request_data.get('eligibility'),
            'ar_eligibility': request_data.get('ar_eligibility'),
            'cancellation_policy': request_data.get('cancellation_policy'),
            'ar_cancellation_policy': request_data.get('ar_cancellation_policy'),
            'terms_condition': request_data.get('terms_condition'),
            'ar_terms_condition': request_data.get('ar_terms_condition'),
            'status': request_data.get('status', 1),
            'gender': request_data.get('gender', 0),
            'duration': request_data.get('duration', 0),
            'available': request_data.get('available', 0),
            'quantity_per_user': max(1, int(request_data.get('quantity_per_user', 1))),
            'swipe_checkin': request_data.get('swipe_checkin', 0),
            'occusr_type': request_data.get('occusr_type', 0),
            'occusr_weekday': request_data.get('occusr_weekday', ''),
            'occusr_month': request_data.get('occusr_month', 0),
            'course_breakdown': request_data.get('course_breakdown', 0),
            'itinerary_breakdown': request_data.get('itinerary_breakdown', 0),
            'checkin_range': request_data.get('checkin_range', 0),
            'qrcode_type': request_data.get('qrcode_type', 0),
            'ticket_type': request_data.get('ticket_type', 0),
            'day_off': request_data.get('day_off', ''),
            'created_by': session_id,
            'updated_by': session_id
        }

    @staticmethod
    def process_related_entities(request_data, event_id, session_id):
        """Processes related entities like images, tags, curriculum, facilities, speakers, and documents."""
        related_entities = [
            ('dates', EventService.process_dates),
            ('date_time', EventService.process_datetime),
            ('tickets', EventService.process_tickets),
            ('images', EventService.process_images),
            ('tags', EventService.process_tags),
            ('curriculum', EventService.process_curriculum),  
            ('facilities', EventService.process_facilities),
            ('speakers', EventService.process_speakers),
            ('documents', EventService.process_documents),  # Added documents handler
            ('itinerary', EventService.process_itinerary)  # Added itinerary handler
        ]
        other_data = {
                "day_off": request_data.get("day_off",""),
                "available": request_data.get("available",0),
                "duration": request_data.get("duration",0),
        }
        try:
            other_data['start_date']=datetime.strptime(request_data.get("start_date"), "%Y-%m-%dT%H:%M:%S").date()
        except ValueError:
            other_data['start_date']=datetime.strptime(request_data.get("start_date"), "%Y-%m-%d").date()
        try:
            other_data['end_date']=datetime.strptime(request_data.get("end_date"), "%Y-%m-%dT%H:%M:%S").date()
        except ValueError:
            other_data['end_date']=datetime.strptime(request_data.get("end_date"), "%Y-%m-%d").date()
        
        for key, handler in related_entities:
            if key in request_data:
                handler(request_data[key], event_id, session_id,other_data)

    @staticmethod
    def process_dates(dates, event_id, session_id,other_data):
        """Adds or updates event images."""
        if dates:
            for date in dates:
                if date.get("id"):        
                    image_data_to_add = {
                        "status": date.get('status'),  
                        "updated_by": session_id,
                        "updated_on": datetime.utcnow()
                    }

                    EventService.update_or_create(date, image_data_to_add, EventRepo.update_date, None)
                    if date.get("times"):      
                        for time in date.get("times"):
                            if time.get("id"):    
                                image_data_to_add = {
                                    "available": time.get('available'),
                                    "status": time.get('status'),
                                    "updated_by": session_id,
                                    "updated_on": datetime.utcnow()
                                }
                                    
                                EventService.update_or_create(time, image_data_to_add, EventRepo.update_date_time, None)
                    
                    


    @staticmethod
    def process_datetime(date_times, event_id, session_id,other_data):
        """Adds or updates event images."""
        if date_times:
            if other_data["day_off"]:
                day_off = set(map(int, other_data["day_off"].split(',')))
            else :
                day_off=[]

            current_date = other_data.get("start_date")
            while current_date <= other_data.get("end_date"):
                if isinstance(current_date, str):
                    current_date = datetime.strptime(current_date, "%Y-%m-%d").date()
        
                if day_off and current_date.weekday() in day_off:
                    other_data["status"]=2
                else:
                    other_data["status"]=1

                image_data_to_add = {
                    "event_id": event_id,
                    "date": current_date,
                    "status": other_data["status"],  
                    "created_by": session_id,
                    "created_on": datetime.utcnow()
                }

                new_date=EventService.update_or_create(None, image_data_to_add, None, EventRepo.add_date)
                
                for date_time in date_times:
                    image_data_to_add = {
                        "event_date_id": new_date.id,
                        "start_time": date_time.get('start_time'),
                        "end_time": date_time.get('end_time'),
                        "available": other_data["available"],
                        "status": date_time.get('status'),
                        "created_by": session_id,
                        "created_on": datetime.utcnow()
                    }
                    if other_data["status"]==2:
                        image_data_to_add["status"]=2
                        
                    EventService.update_or_create(None, image_data_to_add, None, EventRepo.add_date_time)
                
                
                # Move to the next date
                current_date += timedelta(days=1)


    @staticmethod
    def process_images(images, event_id, session_id,other_data):
        """Adds or updates event images."""
        for image_data in images:
            image_data_to_add = {
                "event_id": event_id,
                "cropped_image": image_data.get('cropped_image'),
                "full_screen_image": image_data.get('full_screen_image'),
                "created_by": session_id,
                "updated_by": session_id
            }

            # Check for existing image by ID if provided
            image_id = image_data.get('id')
            if image_id:
                existing_image = EventRepo.get_image_by_id(image_id)
                if not existing_image:
                    raise ValueError(f"No image found with id: {image_id}")
            else:
                # If no ID is provided, treat it as a new record
                existing_image = None

            # Update or create the image
            EventService.update_or_create(
                existing_image, image_data_to_add, EventRepo.update_image, EventRepo.add_image
            )



    @staticmethod
    def process_tickets(tickets, event_id, session_id,other_data):
        """Adds or updates event images."""
        for ticket_data in tickets:

            # Check for existing image by ID if provided
            ticket_id = ticket_data.get('id')
            if ticket_id:
                existing_ticket = EventRepo.get_ticket_by_id(ticket_id)
                if not existing_ticket:
                    raise ValueError(f"No Ticket found with id: {ticket_id}")
                
                ticket_data_to_add = {
                    "event_id": event_id,
                    "title": ticket_data.get('title'),
                    "price": ticket_data.get('price',0),
                    "available": ticket_data.get('available',0),
                    "status": ticket_data.get('status',1),
                    "created_by": session_id,
                    "updated_by": session_id
                }
            else:
                # If no ID is provided, treat it as a new record
                existing_ticket = None
                ticket_data_to_add = {
                    "event_id": event_id,
                    "title": ticket_data.get('title'),
                    "price": ticket_data.get('price',0),
                    "available": ticket_data.get('available',0),
                    "booked": 0,
                    "status": ticket_data.get('status',1),
                    "created_by": session_id,
                    "updated_by": session_id
                }

            # Update or create the image
            EventService.update_or_create(
                existing_ticket, ticket_data_to_add, EventRepo.update_ticket, EventRepo.add_ticket
            )


    @staticmethod
    def process_tags(tags, event_id, session_id,other_data):
        """Adds or updates event tags, ensuring no duplicate tags for the same EventRepo."""
        for tag_data in tags:
            if 'tag_id' in tag_data:  # Existing tag by tag_id
                tag_id = tag_data.get('tag_id')

                # Check if the tag is already associated with this event
                existing_event_tag = EventRepo.get_tag_by_event_id_and_tag_id(event_id, tag_id)
                if existing_event_tag:
                    continue  # Skip adding if the tag is already associated with this event

                tag_data_to_add = {
                    "event_id": event_id,
                    "tag_id": tag_id,
                    "created_by": session_id,
                    "updated_by": session_id
                }
                EventRepo.add_tag(tag_data_to_add)

            elif 'tag_name' in tag_data:  # New or existing tag by tag_name
                tag_name = tag_data.get('tag_name')

                # Check if the tag already exists in the Tags table
                existing_tag = EventRepo.get_tag_by_name(tag_name)

                if existing_tag:  # If tag exists, use the existing tag id
                    tag_id = existing_tag.id
                else:  # Otherwise, add a new tag to the Tags table
                    new_tag_data = {
                        'title': tag_name,
                        'ar_title': tag_data.get('ar_tag_name', ""),  # Assuming Arabic tag name is optional
                        'created_by': session_id,
                        'updated_by': session_id
                    }
                    new_tag = EventRepo.add_new_tag(new_tag_data)
                    tag_id = new_tag.id  # The ID of the newly created tag

                # Check if the tag is already associated with this event
                existing_event_tag = EventRepo.get_tag_by_event_id_and_tag_id(event_id, tag_id)
                if existing_event_tag:
                    continue  # Skip adding if the tag is already associated with this event

                # Now associate the tag (whether new or existing) with the event
                tag_data_to_add = {
                    "event_id": event_id,
                    "tag_id": tag_id,
                    "created_by": session_id,
                    "updated_by": session_id
                }
                EventRepo.add_tag(tag_data_to_add)




    @staticmethod
    def process_curriculum(curriculums, event_id, session_id,other_data):
        """Adds or updates event curriculum."""
        for curriculum_data in curriculums:
            # Prepare the data to be added or updated
            curriculum_data_to_add = {
                "event_id": event_id,
                "description": curriculum_data.get('description'),
                "ar_description": curriculum_data.get('ar_description'),
                "no_of_days": curriculum_data.get('no_of_days'),
                "start_date": curriculum_data.get('start_date'),
                "end_date": curriculum_data.get('end_date'),
                "start_time": curriculum_data.get('start_time'),
                "end_time": curriculum_data.get('end_time'),
                "created_by": session_id,
                "updated_by": session_id
            }

            # Check for existing curriculum by ID if provided
            curriculum_id = curriculum_data.get('id')
            if curriculum_id:
                existing_curriculum = EventRepo.get_curriculum_by_id(curriculum_id)
                if not existing_curriculum:
                    raise ValueError(f"No curriculum found with id: {curriculum_id}")
            else:
                # If no ID is provided, treat it as a new record
                existing_curriculum = None

            # Update or create the curriculum
            EventService.update_or_create(existing_curriculum, curriculum_data_to_add, EventRepo.update_curriculum, EventRepo.add_curriculum)
        EventRepo.updateNumberofclass(event_id)

    @staticmethod
    def process_facilities(facilities, event_id, session_id,other_data):
        """Adds or updates event facilities, ensuring no duplicate facilities for the same EventRepo."""
        for facility_data in facilities:
            facilities_id = facility_data.get('facilities_id')

            # Check if the facility is already associated with this event
            existing_facility = EventRepo.get_facility_by_event_id_and_facilities_id(event_id, facilities_id)
            if existing_facility:
                continue  # Skip adding if the facility is already associated with this event

            # Add new facility to the EventFacilities table
            facility_data_to_add = {
                "event_id": event_id,
                "facilities_id": facilities_id,
                "created_by": session_id,
                "updated_by": session_id
            }
            EventRepo.add_facility(facility_data_to_add)

                    
    @staticmethod
    def process_speakers(speakers, event_id, session_id,other_data):
        """Adds or updates event speakers, ensuring no duplicate speakers for the same EventRepo."""
        for speaker_data in speakers:
            if 'user_id' in speaker_data:  # Existing speaker linked via user_id
                user_id = speaker_data.get('user_id')

                # Check if the speaker is already associated with this event by user_id
                existing_speaker = EventRepo.get_speaker_by_event_id_and_user_id(event_id, user_id)
                if existing_speaker:
                    continue  # Skip adding if the speaker is already associated with this event

                speaker_data_to_add = {
                    "event_id": event_id,
                    "user_id": user_id,
                    "created_by": session_id,
                    "updated_by": session_id
                }
                EventRepo.add_speaker(speaker_data_to_add)

            else:  # New speaker (no user_id, so using first_name, last_name, image)
                first_name = speaker_data.get('first_name')
                last_name = speaker_data.get('last_name')
                image = speaker_data.get('image')

                # Check if the speaker is already associated with this event by name
                existing_speaker = EventRepo.get_speaker_by_event_id_and_name(event_id, first_name, last_name)
                if existing_speaker:
                    continue  # Skip adding if the speaker is already associated with this event

                # Add new speaker to the EventSpeakers table
                speaker_data_to_add = {
                    "event_id": event_id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "image": image,
                    "created_by": session_id,
                    "updated_by": session_id
                }
                EventRepo.add_speaker(speaker_data_to_add)




    @staticmethod
    def process_documents(documents, event_id, session_id,other_data):
        """Adds or updates event documents."""
        if documents:
            for document_data in documents:
                #if document_data.get('file_path'):
                    document_data_to_add = {
                        "event_id": event_id,
                        "document_name": document_data.get('document_name'),
                        "ar_document_name": document_data.get('ar_document_name'),
                        "file_path": document_data.get('file_path'),
                        "created_by": session_id,
                        "updated_by": session_id
                    }

                    # Check for existing document by ID if provided
                    document_id = document_data.get('id')
                    if document_id:
                        existing_document = EventRepo.get_document_by_id(document_id)
                        if not existing_document:
                            raise ValueError(f"No document found with id: {document_id}")
                    else:
                        # If no ID is provided, treat it as a new record
                        existing_document = None

                    # Update or create the document
                    new_document=EventService.update_or_create(existing_document, document_data_to_add, EventRepo.update_document, EventRepo.add_document)

                    if document_data.get('files'):
                        for file in document_data.get('files'):
                                document_file_to_add = {
                                    "event_document_id": new_document.id,
                                    "file_path": file.get('file_path'),
                                    "created_by": session_id,
                                    "updated_by": session_id
                                }

                                # Check for existing document by ID if provided
                                file_id = file.get('id')
                                if file_id:
                                    existing_file = EventRepo.get_document_file_by_id(file_id)
                                    if not existing_file:
                                        raise ValueError(f"No document file found with id: {file_id}")
                                else:
                                    # If no ID is provided, treat it as a new record
                                    existing_file = None

                                # Update or create the document
                                EventService.update_or_create(existing_file, document_file_to_add, EventRepo.update_document_file, EventRepo.add_document_file)

                
    @staticmethod
    def process_itinerary(itinerary, event_id, session_id,other_data):
        """Adds or updates event itineraries."""
        for itinerary_data in itinerary:
            itinerary_data_to_add = {
                "event_id": event_id,
                "day": itinerary_data.get('day'),
                "title": itinerary_data.get('title'),
                "ar_title": itinerary_data.get('ar_title'),
                "start_time": itinerary_data.get('start_time'),
                "end_time": itinerary_data.get('end_time'),
                "start_date": itinerary_data.get('start_date'),
                "end_date": itinerary_data.get('end_date'),
                "created_by": session_id,
                "updated_by": session_id
            }
            
            # Check if an existing itinerary entry matches this event, day, and title
            existing_itinerary = EventRepo.get_itinerary_by_event_id_day_and_title(
                event_id,itinerary_data.get('id')
            )
            
            EventService.update_or_create(
                existing_itinerary, itinerary_data_to_add, EventRepo.update_itinerary, EventRepo.add_itinerary
            )


    @staticmethod
    def update_or_create(existing_entity, data, update_func, create_func):
        """Updates existing entity or creates a new one."""
        if existing_entity:
            if isinstance(existing_entity, dict):
                if "id" in existing_entity:
                    return update_func(existing_entity.get("id"), data)
            elif hasattr(existing_entity, "id"):
                return update_func(existing_entity.id, data)
        # if existing_entity:
            # if existing_entity.id:
                # return update_func(existing_entity.id, data)
            # if existing_entity.get("id"):
                # return update_func(existing_entity.get("id"), data)
        else:
            return create_func(data)




#######################################    end of creaate and event ###########################################

######################################   delete event #########################################################


  
    @staticmethod
    @handle_service_errors
    def soft_delete(request_data, session_id):
        """Soft deletes entities based on the type parameter."""
        
        entity_id = request_data.get('id')
        entity_type = request_data.get('type')
        event_id = request_data.get('event_id')

        if not entity_id or not entity_type:
            raise ServiceError("Both 'id' and 'type' are required")

        if entity_type in [2, 3, 4, 5, 6, 7, 8, 9, 10] and not event_id:
            raise ServiceError("Both 'id' and 'event_id' are required for type 2 to 10")

        # Map entity type to corresponding soft delete function
        delete_function_map = {
            1: EventService.soft_delete_event,   # type = 1 for events only
            2: EventRepo.soft_delete_image_by_id,    # type = 2 for event images by primary key
            3: EventRepo.soft_delete_tag_by_id,      # type = 3 for event tags by primary key
            4: EventRepo.soft_delete_curriculum_by_id,  # type = 4 for event curriculum by primary key
            5: EventRepo.soft_delete_facility_by_id,    # type = 5 for event facilities by primary key
            6: EventRepo.soft_delete_speaker_by_id,     # type = 6 for event speakers by primary key
            7: EventRepo.soft_delete_document_by_id,     # type = 7 for event documents by primary key
            8: EventRepo.soft_delete_document_file_by_id,     # type = 8 for event documents file by primary key
            9: EventRepo.soft_delete_ticket_by_id,     # type = 9 for event ticket by primary key
            10: EventRepo.soft_delete_itinerary_by_id,     # type = 10 for event itinerary by primary key
            11: EventService.cancle_event     # type = 11 for event cancle
        }

        # Get the appropriate delete function based on the type
        delete_function = delete_function_map.get(entity_type)

        if not delete_function:
            raise ServiceError(f"Unsupported entity type: {entity_type}")

        # Call the delete function with the entity ID and session ID
        if entity_type == 1 or entity_type == 11:
            delete_function(entity_id, session_id)
        else:
            delete_function(entity_id, event_id, session_id)

        if entity_type == 1:
            return {"message": f"Event deleted successfully"}
        elif entity_type == 11:
            return {"message": f"Event cancelled successfully"}
        else:
            return {"message": f"Entity type {entity_type} with ID {entity_id} deleted successfully"}


    @staticmethod
    def soft_delete_event(event_id, session_id):
        """Soft deletes an event only without affecting related entities."""
        event_obj = EventRepo.get_event_by_id(event_id)
        if not event_obj:
            raise ServiceError("Event not found")
            
        event_count=EventRepo.total_participants_count(event_id)
        if event_count>0:
            raise ServiceError("Event already booked by customer, please cancle event before deleting")
            
        # Change event status to 3 (soft deleted)
        event_data = {'status': 3, 'updated_by': session_id}
        EventRepo.update_event(event_id, event_data)

     
        
    @staticmethod
    def cancle_event(event_id, session_id):
        """Soft deletes an event only without affecting related entities."""
        event_obj = EventRepo.get_event_by_id(event_id)
        if not event_obj:
            raise ServiceError("Event not found")
            
        EventRepo.cancle_event_all_booking(event_id,session_id)
        
        # Change event status to 4 ( cancle)
        event_data = {'status': 4, 'updated_by': session_id}
        EventRepo.update_event(event_id, event_data)
   
        
        
#######################################   end of delete event  ###########################################


    @staticmethod
    @handle_service_errors
    def get_event_details(request_data):
        """Fetches all details of an event by its ID."""
        
        event_id = request_data.get('id')
        # Fetch the event by ID
        event_obj = EventRepo.get_event_by_id(event_id)
        if not event_obj:
            raise ValueError("Event not found")

       
        
        start_date_str = event_obj.start_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event_obj.start_date, datetime) else event_obj.start_date
        end_date_str = event_obj.end_date.strftime('%Y-%m-%dT%H:%M:%S') if isinstance(event_obj.end_date, datetime) else event_obj.end_date
        start_time_str = event_obj.start_time.strftime('%H:%M:%S') if isinstance(event_obj.start_time, time) else event_obj.start_time
        end_time_str = event_obj.end_time.strftime('%H:%M:%S') if isinstance(event_obj.end_time, time) else event_obj.end_time

        # start_time_str = event_obj.start_time.strftime('%H:%M:%S') if event_obj.start_time else None
        # end_time_str = event_obj.end_time.strftime('%H:%M:%S') if event_obj.end_time else None
        
        # Build event details response
        event_details = {
            "id": event_obj.id,
            "time_zone": event_obj.time_zone,
            "user_id": event_obj.user_id,
            "title": event_obj.title,
            "ar_title": event_obj.ar_title,
            "category_id": event_obj.category_id,
            "sub_category_id": event_obj.sub_category_id,
            "description": event_obj.description,
            "ar_description": event_obj.ar_description,
            "start_date": start_date_str,
            "end_date": end_date_str,
            "start_time": start_time_str,  # Convert time to string
            "end_time": end_time_str,      # Convert time to string
            "event_type": event_obj.event_type,
            "location_type": event_obj.location_type,
            "meet_link": event_obj.meet_link,
            "location": event_obj.location,
            "latitude": event_obj.latitude,
            "longitude": event_obj.longitude,
            "to_location": event_obj.to_location,
            "to_latitude": event_obj.to_latitude,
            "to_longitude": event_obj.to_longitude,
            "price_type": event_obj.price_type,
            "city": event_obj.city,
            "area": event_obj.area,
            "price": event_obj.price,
            "journey_level_id": event_obj.journey_level_id,
            "total_no_class": event_obj.total_no_class,
            "call_per_week": event_obj.call_per_week,
            "rule": event_obj.rule,
            "ar_rule": event_obj.ar_rule,
            "eligibility": event_obj.eligibility,
            "ar_eligibility": event_obj.ar_eligibility,
            "cancellation_policy": event_obj.cancellation_policy,
            "ar_cancellation_policy": event_obj.ar_cancellation_policy,
            "terms_condition": event_obj.terms_condition,
            "ar_terms_condition": event_obj.ar_terms_condition,
            "status": event_obj.status,
            "duration": event_obj.duration,
            "day_off": event_obj.day_off,
            "qrcode_type": event_obj.qrcode_type,
            "ticket_type": event_obj.ticket_type,
            "quantity_per_user": event_obj.quantity_per_user,
            "course_breakdown": event_obj.course_breakdown,
            "itinerary_breakdown": event_obj.itinerary_breakdown,
            "checkin_range": event_obj.checkin_range,
            "swipe_checkin": event_obj.swipe_checkin,
            "occusr_type": event_obj.occusr_type,
            "occusr_month": event_obj.occusr_month,
            "occusr_weekday": event_obj.occusr_weekday,
            "available": event_obj.available,
            "gender": event_obj.gender,
        }

        if event_obj.category_id==2:
            weekday_mapping = {
                "0": "Monday", "1": "Tuesday", "2": "Wednesday", "3": "Thursday",
                "4": "Friday", "5": "Saturday", "6": "Sunday"
            }
            
            if event_obj.occusr_type == 1:
                event_details["occusr_text"] = ""
                event_details["occusr_text_pop"] = ""
            elif event_obj.occusr_type == 3:
                weekdays=""
                if event_obj.occusr_weekday:
                    weekdays = ", ".join([weekday_mapping[day] for day in event_obj.occusr_weekday.split(",")])
                weekdayscnt=len(event_obj.occusr_weekday.split(","))
                event_details["occusr_text"] = f"Every ({weekdays})"
                event_details["occusr_text_pop"] = f"This course is scheduled to take place weekly on ({weekdays})"
            elif event_obj.occusr_type == 4:
                event_details["occusr_text"] = "Happening every month"
                event_details["occusr_text_pop"] = "This course is scheduled to take place monthly"

                if event_obj.occusr_month == 1:
                    day_of_month = event_obj.start_date.day or 0
                    event_details["occusr_text"] = f"Happening every month on {day_of_month}th"
                    event_details["occusr_text_pop"] = f"This course is scheduled to take place monthly on {day_of_month}th"
                elif event_obj.occusr_month == 2:
                    day_of_month = event_obj.start_date.day
                    weekday = event_obj.start_date.weekday()
                    weekday_name = weekday_mapping[str(weekday)] or ""
                    week_position = (day_of_month - 1) // 7 + 1
                    ordinal_map = {1: "1st", 2: "2nd", 3: "3rd"}
                    ordinal = ordinal_map.get(week_position, f"{week_position}th") or 0
                    event_details["occusr_text"] = f"Happening every month on {ordinal} {weekday_name}"
                    event_details["occusr_text_pop"] = f"This course is scheduled to take place monthly on {ordinal} {weekday_name}"
            #elif event_obj.occusr_type == 2:
            else:
                event_details["occusr_text"] = "Happening Every Day"
                event_details["occusr_text_pop"] = "This course is scheduled everyday at the same time"

        # Fetch related entities and include in the response
        event_details["dates"] = EventRepo.get_dates_by_event_id(event_id)
        event_details["images"] = EventRepo.get_images_by_event_id(event_id)
        event_details["tickets"] = EventRepo.get_tickets_by_event_id(event_id)
        event_details["tags"] = EventRepo.get_tags_by_event_id(event_id) 
        event_details["curriculum"] = EventRepo.get_curriculum_by_event_id(event_id)
        event_details["facilities"] = EventRepo.get_facilities_by_event_id(event_id)
        event_details["speakers"] = EventRepo.get_speakers_by_event_id(event_id)
        event_details["documents"] = EventRepo.get_documents_by_event_id(event_id)
        event_details["itinerary"] = EventRepo.get_itinerary_by_event_id(event_id)

        if event_obj.journey_level_id or event_obj.journey_level_id==0:
            event_details["journey_level_sub_name"] = EventRepo.get_journey_level_sub_name(event_obj.journey_level_id)
            event_details["journey_level_name"] = EventRepo.get_journey_level_name(event_obj.journey_level_id)

        return event_details
        
        
        
#########      end of event get by  id ########################



    @staticmethod
    @handle_service_errors
    def get_master_data():
        """Fetches active facilities, tags, categories with subcategories, and speakers."""

        # Get all active facilities
        active_facilities = EventRepo.get_active_master_facilities()

        # Get all active tags
        active_tags = EventRepo.get_active_master_tags()

        # Get all active categories with subcategories
        active_categories_with_subcategories = EventRepo.get_active_categories_with_subcategories()

        # Get all active speakers
        active_speakers = EventRepo.get_active_speakers()

        return {
            "facilities": active_facilities,
            "tags": active_tags,
            "categories": active_categories_with_subcategories,
            "speakers": active_speakers
        }
        
        

    @staticmethod
    @handle_service_errors
    def get_all_events(request_data):
        """Fetches active facilities, tags, categories with subcategories, and speakers."""

        # Get all active facilities
        events= EventRepo.get_admin_filtered_events(request_data)
        return events 
        
    @staticmethod
    @handle_service_errors
    def get_event_participants(request_data):
     
        events= EventRepo.get_event_participants(request_data)
        return events
        
     
     
    @staticmethod
    @handle_service_errors
    def get_participant_attendance_list(request_data):
        participant_id=request_data.get('participant_id')
        events= EventRepo.get_participant_attendance_list(participant_id)
        return events
    
    
    
    @staticmethod
    @handle_service_errors
    def get_request_buddy_count(type,session_id,id):
    
        events= EventRepo.get_request_buddy_count(type,session_id,id)
        return {'count':events}
    
    
    
    @staticmethod
    @handle_service_errors
    def update_status_request_buddy(request_data,session):    
        obj = EventRepo.update_status_request_buddy(request_data,session)
        if isinstance(obj, dict) and 'error' in obj:
            raise ServiceError("Unable to update status")

        return {"message": "Status updated successfully"}
    
    
    @staticmethod
    @handle_service_errors
    def get_request_buddy(request_data):
        
        
        request_data['session'] = None
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
                "user_id": data.user_id,
                "user_first_name": data.user_first_name,
                "user_last_name": data.user_last_name,
                "user_profile_image": data.user_profile_image,
                "user_mobile": data.user_mobile_number,
                "user_country_code": data.user_country_code,
                "buddy_first_name": data.buddy_first_name,
                "buddy_last_name": data.buddy_last_name,
                "requested_date": data.created_on,
                "date": data.date.strftime("%Y-%m-%d") if isinstance(data.date, date) else data.date,
                "time": data.time.strftime("%H:%M:%S") if isinstance(data.time, time) else data.time,
                "meet_link": data.meet_link,
                "speaker_id": data.speaker_id,
                "user_comment": data.user_comment,
                "organization_name": data.organization_name,
                "status": data.status,
                "type": data.type
            }
            results.append(data_return)
        
        return results
    
    
     
    @staticmethod
    @handle_service_errors
    def question_and_answers(session,id,type,organizer_id):
        data= EventRepo.question_and_answers(session,id,1,type,organizer_id)
        return data
    
    
    
    
    
    @staticmethod
    @handle_service_errors
    def get_rating(session_id, request_data):
 
        data = EventRepo.get_rating(request_data)
        return data
    
     
    
    
    @staticmethod
    @handle_service_errors
    def add_announcement(session_id, request_data):
    
        event_id = request_data.get('event_id')
        title = request_data.get('title')
        message = request_data.get('message')

        event = EventRepo.get_event_by_id(event_id)
        if not title:
            title=event.title

        get_organizer = OrganizerRepository.get_organization_by_user_id(event.user_id)

        combined_message = f"{title} {message}" if title else message

        rating_request_data = {
            'event_id': event_id,
            'title': get_organizer.organization_name,
            'message': combined_message,
            'created_by': session_id
        }
        
        event_information = EventRepo.add_announcement(rating_request_data)
        rating_request_data['announcement_id'] = event_information.id
        EventRepo.send_push_notifications_for_event_announcement(rating_request_data)
        return {"message": "added successfully"}
    
    
    
    
    @staticmethod
    @handle_service_errors
    def add_announcement_all(session_id, request_data):
    
        title = request_data.get('title')
        message = request_data.get('message')

        rating_request_data = {
             'event_id': 0,
            'title': title,
            'message': message,
            'created_by': session_id
        }
        
        event_information = EventRepo.add_announcement(rating_request_data)
        EventRepo.send_push_notifications_for_all(rating_request_data)
        return {"message": "added successfully"}
    
    
    
      
    
    
    @staticmethod
    @handle_service_errors
    def get_announcement(session_id, request_data):
        #request_data["user_id"]=session_id
        data = EventRepo.get_announcement(session_id,request_data)
        return data
