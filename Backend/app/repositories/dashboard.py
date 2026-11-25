
from sqlalchemy import func, extract,literal
from app import db
from sqlalchemy.orm import aliased
from app.utils.response_decorators import handle_repository_errors
from app.models.event import Event,Participant,EventSpeakers,Withdrawal,PaymentTransaction
from app.models.users import Users_activity,Users
from app.models.category import Category
from app.models.organization import Organization
from datetime import datetime


class DashboardRepo:



    # organizer dashboard data
    @staticmethod
    @handle_repository_errors
    def organizer_dashboard(session):
    

        from datetime import datetime, timedelta

        # Get the current date and the start of the current week
        today = datetime.utcnow()
        # start_of_week = today - timedelta(days=today.weekday())  # Monday of the current week
        # end_of_week = start_of_week + timedelta(days=6)  # Sunday of the current week
        
        
        start_of_week = today 
        end_of_week = start_of_week + timedelta(days=6)
        
        
      
        
        
        

        # Query to count events within the current week
        event_count = (
            db.session.query(func.count(Event.id))
            .filter(
                Event.user_id == session,
                #Event.category_id == 1,
                Event.status == 1,
                func.date(Event.start_date) >= start_of_week.date(),
                func.date(Event.start_date) <= end_of_week.date()
            )
            .scalar()
        )


        query = db.session.query(func.sum(PaymentTransaction.amount)).join(Event, PaymentTransaction.event_id == Event.id)
        query = query.filter(PaymentTransaction.status == 1)        
        query = query.filter(Event.user_id == session)            
        revenue = query.scalar() or 0
        
                
        
        
  

   

        # Return all data
        return {
            
            "event_count_this_week": event_count,
            "revenue": revenue
        }
    







    # admin dashboard data
    @staticmethod
    @handle_repository_errors
    def get_data():
        """
        Fetches aggregate data for the dashboard in a consistent query format.

        :return: Dictionary with counts for participants, events, courses, tours, user activities, and top events.
        """

        # Participant count
    
        participant_count = (
            db.session.query(func.count(Users.id))
            .filter(Users.role_type == 2,Users.status == 1)
            .scalar()
        )
        
        
        
        
        organiser_count = (
            db.session.query(func.count(Users.id))
            .filter(Users.role_type == 3,Users.status == 1)
            .scalar()
        )
        
        
        speaker_count = (
            db.session.query(func.count(Users.id))
            .filter(Users.role_type == 4,Users.status == 1)
            .scalar()
        )
        

        # Event counts by type
        event_count = (
            db.session.query(func.count(Event.id))
            .filter(Event.category_id == 1,Event.status == 1)
            .scalar()
        )
        course_count = (
            db.session.query(func.count(Event.id))
            .filter(Event.category_id == 2,Event.status == 1)
            .scalar()
        )
        tour_count = (
            db.session.query(func.count(Event.id))
            .filter(Event.category_id == 3,Event.status == 1)
            .scalar()
        )
        all_event_counts = (
            db.session.query(
                Category.id,  
                Category.title,  
                func.count(Event.id).label("event_count")  
            )
            .join(Event, Event.category_id == Category.id)  
            .filter(Event.status == 1)  
            .group_by(Category.id, Category.title)  # Group by category ID & title
            .all()
        )
        all_event_count = [
            {
                "category_id": event.id,
                "category_title": event.title,
                "event_count": event.event_count
            }
            for event in all_event_counts
        ]

        # User activity data
        user_activity_query = (
            db.session.query(
                func.date(Users_activity.date).label("activity_date"),
                func.count(Users_activity.id).label("user_activity_count"),
            )
            .group_by(Users_activity.date)
            .all()
        )

        users_activity = [
            {
                "date": activity.activity_date.strftime("%Y-%m-%d"),
                "count": activity.user_activity_count,
            }
            for activity in user_activity_query
        ]

        # Top events for the current month
        current_month = datetime.now().month
        current_year = datetime.now().year

        top_events_query = (
            db.session.query(
                Event.id.label('event_id'),
                Event.title,
                func.count(Participant.id).label('total_bookings')
            )
            .join(Participant, Event.id == Participant.event_id)
            .filter(
                extract('month', Event.start_date) == current_month,
                extract('year', Event.start_date) == current_year
            )
            .group_by(Event.id, Event.title)
            .order_by(func.count(Participant.id).desc())
            .limit(5)
            .all()
        )

        top_events = [
            {
                "event_id": event.event_id,
                "title": event.title,
                "total_bookings": event.total_bookings
            }
            for event in top_events_query
        ]

        # Event counts by speaker (added query)
        speaker_alias = aliased(Users)

        event_count_by_speaker = (
            db.session.query(
                speaker_alias.first_name,
                speaker_alias.last_name,
                func.count(Event.id).label('event_count')
            )
            .join(EventSpeakers, EventSpeakers.event_id == Event.id)  # Join EventSpeakers with Event
            .join(speaker_alias, speaker_alias.id == EventSpeakers.user_id)  # Join the aliased Users table
            .filter(speaker_alias.role_type == 4, Event.status != 3)  # Filter for speakers and active events
            .group_by(speaker_alias.first_name, speaker_alias.last_name)  # Group by speaker's name
            .order_by(func.count(Event.id).desc())  # Order by event count in descending order
            .limit(5)  # Limit to top 5 speakers
            .all()
        )

        speaker_event_count = [
            {

                "speaker_name": f"{speaker.first_name} {speaker.last_name}",
                "event_count": speaker.event_count
            }
            for speaker in event_count_by_speaker
        ]
        
        
        
        
        event_count_by_user = (
            db.session.query(
                Event.user_id,
                Organization.organization_name.label("first_name"),
                literal("").label("last_name"),
                func.count(Event.id).label('event_count')
            )
            .join(Users, Users.id == Event.user_id)  # Join Users table with Event table based on user_id
            .join(Organization, Event.user_id == Organization.user_id)  # Join Users table with Event table based on user_id
            .filter(Users.role_type == 3, Event.status != 3)  # Filter for speakers and active events
            # Group the organisation field that is actually selected. The
            # previous query grouped unrelated user-name columns and failed
            # on PostgreSQL in the production Admin dashboard.
            .group_by(Event.user_id, Organization.organization_name)
            .order_by(func.count(Event.id).desc())  # Order by event count in descending order
            .all()
        )

        # Format the result
        user_event_count = [
            {
                "user_id": event.user_id,
                "user_name": f"{event.first_name} {event.last_name}",
                "event_count": event.event_count
            }
            for event in event_count_by_user
        ]

        # Return all data
        return {
            
            
            "speaker_count": speaker_count,
            "organiser_count": organiser_count,
            "participant_count": participant_count,
            "event_count": event_count,
            "all_event_count": all_event_count,
            "course_count": course_count,
            "tour_count": tour_count,
            "users_activity": users_activity,
            "top_events": top_events,
            "event_count_by_speaker": speaker_event_count,  # Added speaker event count
            "event_count_by_organizer": user_event_count
        }
