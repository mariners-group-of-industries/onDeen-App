from app.models.event import Drafts

from app import db 
from app.utils.response_decorators import handle_repository_errors
from datetime import datetime, timedelta,time,date





class DraftsRepo:
    
    @staticmethod
    @handle_repository_errors
    def get_event_by_id_and_user_id(event_id, session_id):
        """Gets an event by ID and user ID."""
        try:
            return Drafts.query.filter_by(id=event_id, user_id=session_id).first()
        except Exception as e:
            raise e


    @staticmethod
    @handle_repository_errors
    def add_event(event_data):
        """Adds a new event to the database."""
        try:
            new_event = Drafts(**event_data)
            db.session.add(new_event)
            db.session.commit()
            return new_event
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def update_event(event_id, event_data):
        """Updates an existing event in the database."""
        try:
            event = Drafts.query.get(event_id)
            if event:
                for key, value in event_data.items():
                    setattr(event, key, value)
                db.session.commit()
            return event
        except Exception as e:
            db.session.rollback()
            raise e
            


    @staticmethod
    @handle_repository_errors
    def get_event_by_id(event_id):
        """Gets an event by ID."""
        return Drafts.query.get(event_id)
        


    @staticmethod
    @handle_repository_errors
    def get_all_drafts(request_data, session_id):
        """Fetches events based on multiple optional filters provided in the request data."""
        try:
            # Extract parameters from request data with default values
            user_id = session_id 
            
            page = request_data.get('page', 1)
            per_page = request_data.get('per_page', 10)
            status = request_data.get('status') or None
            
            # Ensure user_id is provided
            if not user_id:
                raise ValueError("User ID is required.")

            query = Drafts.query.filter(
                Drafts.user_id == user_id,
                Drafts.status != 3  # Assuming '3' indicates a deleted  status
            )

            paginated_query = query.paginate(page=page, per_page=per_page, error_out=False)

            serialized_events = []
            for event in paginated_query.items:
            

                # Serialize the event with participants info
                event_data = {
                    "id": event.id,
                    "user_id": event.user_id,
                    "json_data": event.json_data,
                    "created_on": event.created_on.strftime('%Y-%m-%dT%H:%M:%S'),
                    "updated_on": event.updated_on.strftime('%Y-%m-%dT%H:%M:%S'),

                }
                serialized_events.append(event_data)

            return {
                "drafts": serialized_events,
                "total": paginated_query.total,
                "pages": paginated_query.pages,
                "current_page": paginated_query.page,
                "per_page": paginated_query.per_page
            }
        except Exception as e:
            raise e


