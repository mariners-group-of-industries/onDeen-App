from app.models.speakers import Speaker,SpeakerSocialMedia,SpeakerAdditionalQuestion,SpeakerExpertise,SpeakerSectType,SpeakerAvailabilityDate,SpeakerAvailabilityTime,SpeakerSchoolOfThought,Expertise 
from app.models.event import Event, EventSpeakers
from app.models.users import Users
from app import db
from sqlalchemy import or_, func,case
from datetime import datetime,timedelta
from app.utils.response_decorators import handle_repository_errors
import os
import requests
from zoneinfo import ZoneInfo
class SpeakerRepository:
    role_type = 4  # For speakers

    # Add Methods
    @staticmethod
    @handle_repository_errors
    def add_user(user_data):
        user = Users(**user_data)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    @handle_repository_errors
    def add_speaker(speaker_data):
        speaker = Speaker(**speaker_data)
        db.session.add(speaker)
        db.session.commit()
        return speaker

    @staticmethod
    @handle_repository_errors
    def add_social_media_link(social_media_data):
        social_media_link = SpeakerSocialMedia(**social_media_data)
        db.session.add(social_media_link)
        db.session.commit()
        return social_media_link

    @staticmethod
    @handle_repository_errors
    def add_additional_info(additional_data):
        additional_info = SpeakerAdditionalQuestion(**additional_data)
        db.session.add(additional_info)
        db.session.commit()
        return additional_info

    
    @staticmethod
    @handle_repository_errors
    def add_date_info(additional_data):
        additional_info = SpeakerAvailabilityDate(**additional_data)
        db.session.add(additional_info)
        db.session.commit()
        return additional_info

    
    @staticmethod
    @handle_repository_errors
    def add_time_info(additional_data):
        additional_info = SpeakerAvailabilityTime(**additional_data)
        db.session.add(additional_info)
        db.session.commit()
        return additional_info

    

    @staticmethod
    @handle_repository_errors
    def add_sect_type(sect_data):
        sect_type = SpeakerSectType(**sect_data)
        db.session.add(sect_type)
        db.session.commit()
        return sect_type


    @staticmethod
    @handle_repository_errors
    def add_school_of_thought(school_data):
        school_of_thought = SpeakerSchoolOfThought(**school_data)
        db.session.add(school_of_thought)
        db.session.commit()
        return school_of_thought

    # Update Methods
    @staticmethod
    @handle_repository_errors
    def update_user(user_id, user_data):
        user = Users.query.get(user_id) 
        if user:
            for key, value in user_data.items():
                setattr(user, key, value)
            db.session.commit()
        return user
        
    @staticmethod
    def get_all_expertise_by_user(user_id):
        return SpeakerExpertise.query.filter_by(user_id=user_id, status=1).all()

    @staticmethod
    def delete_speaker_social_media_links(user_id):
        social_medias = SpeakerSocialMedia.query.filter_by(user_id=user_id).all()
        for social_media in social_medias:
            if social_media:
                db.session.delete(social_media)
                db.session.commit()

    @staticmethod
    def delete_speaker_expertise(user_id, expertise_id):
        expertise = SpeakerExpertise.query.filter_by(user_id=user_id, expertise_id=expertise_id, status=1).first()
        if expertise:
            db.session.delete(expertise)
            db.session.commit()

    @staticmethod
    def add_expertise(expertise_data):
        new_expertise = SpeakerExpertise(**expertise_data)
        db.session.add(new_expertise)
        db.session.commit()
        return new_expertise


    @staticmethod
    @handle_repository_errors
    def update_speaker(speaker_id, speaker_data):
        speaker = Speaker.query.get(speaker_id)
        if speaker:
            for key, value in speaker_data.items():
                setattr(speaker, key, value)
            db.session.commit()
        return speaker

    @staticmethod
    @handle_repository_errors
    def update_social_media_link(social_media_id, social_media_data):
        social_media_link = SpeakerSocialMedia.query.get(social_media_id)
        if social_media_link:
            for key, value in social_media_data.items():
                setattr(social_media_link, key, value)
            db.session.commit()
        return social_media_link

    @staticmethod
    @handle_repository_errors
    def update_date_info(additional_info_id, additional_data):
        additional_info = SpeakerAvailabilityDate.query.get(additional_info_id)
        if additional_info:
            for key, value in additional_data.items():
                setattr(additional_info, key, value)
            db.session.commit()
        return additional_info

    @staticmethod
    @handle_repository_errors
    def update_time_info(additional_info_id, additional_data):
        additional_info = SpeakerAvailabilityTime.query.get(additional_info_id)
        if additional_info:
            for key, value in additional_data.items():
                setattr(additional_info, key, value)
            db.session.commit()
        return additional_info

    @staticmethod
    @handle_repository_errors
    def update_additional_info(additional_info_id, additional_data):
        additional_info = SpeakerAdditionalQuestion.query.get(additional_info_id)
        if additional_info:
            for key, value in additional_data.items():
                setattr(additional_info, key, value)
            db.session.commit()
        return additional_info

    # Get Methods
    @staticmethod
    @handle_repository_errors
    def get_user_by_id(user_id):
        return Users.query.get(user_id)

    @staticmethod
    @handle_repository_errors
    def get_speaker_by_user_id(user_id):
        return Speaker.query.filter_by(user_id=user_id).first()
    
    @staticmethod
    @handle_repository_errors
    def get_speaker_by_id(id):
        return Speaker.query.filter_by(user_id=id).first()

    @staticmethod
    @handle_repository_errors
    def get_social_media_link(user_id, platform):
        return SpeakerSocialMedia.query.filter_by(user_id=user_id, platform=platform).first()

    @staticmethod
    @handle_repository_errors
    def get_additional_info_by_user_id(user_id):
        return SpeakerAdditionalQuestion.query.filter_by(user_id=user_id).all()
    
    @staticmethod
    @handle_repository_errors
    def get_avaialability_by_user_id_and_dat_id(user_id, date_id):
        return SpeakerAvailabilityDate.query.filter_by(user_id=user_id, id=date_id).first()

    @staticmethod
    @handle_repository_errors
    def get_avaialability_by_user_id_and_date(user_id, date):
        return SpeakerAvailabilityDate.query.filter_by(user_id=user_id, date=date).first()

    @staticmethod
    @handle_repository_errors
    def get_avaialability_by_user_id_and_weekday(user_id, date):
        return SpeakerAvailabilityDate.query.filter_by(user_id=user_id, weekday=date.weekday()).first()

    @staticmethod
    @handle_repository_errors
    def get_next_available_date(user_id,time_zone=None):
        
        if not time_zone:
                time_zone = os.getenv('d_t_z')
        now = datetime.now(ZoneInfo(time_zone)).date() 
        #now = datetime.utcnow().date()  
        today_weekday = now.weekday() 
        next_available_date1=None
        next_available_date2=None

        next_available_date = (
            db.session.query(SpeakerAvailabilityDate.date)
            .join(SpeakerAvailabilityTime, SpeakerAvailabilityTime.availability_date_id == SpeakerAvailabilityDate.id)
            .filter(
                SpeakerAvailabilityDate.user_id == user_id,
                SpeakerAvailabilityDate.status == 1,  # Available dates only
                SpeakerAvailabilityTime.status == 1,  # Available times only
                SpeakerAvailabilityDate.date.isnot(None), 
                SpeakerAvailabilityDate.date >= now  
            )
            .order_by(SpeakerAvailabilityDate.date.asc())  # Get the earliest available date
            .first()  # Fetch only the first result
        )
        if next_available_date:
            next_available_date1=next_available_date.date.strftime('%Y-%m-%d')
            
            
            
        next_available_weekday = (
            db.session.query(SpeakerAvailabilityDate.weekday)
            .join(SpeakerAvailabilityTime, SpeakerAvailabilityTime.availability_date_id == SpeakerAvailabilityDate.id)
            .filter(
                SpeakerAvailabilityDate.user_id == user_id,
                SpeakerAvailabilityDate.status == 1,  # Available dates only
                SpeakerAvailabilityDate.weekday.isnot(None), 
                SpeakerAvailabilityTime.status == 1  # Available times only
            ).order_by(
                case(
                    (SpeakerAvailabilityDate.weekday >= today_weekday, 0),  
                    else_=1
                ),
                SpeakerAvailabilityDate.weekday.asc()  # Sort weekdays in ascending order
            ).first()
        )

        if next_available_weekday is not None:

            next_weekday = next_available_weekday.weekday

            # Calculate the next actual date for that weekday
            days_ahead = (next_weekday - today_weekday) % 7  # Find how many days ahead the next weekday is
            #if days_ahead == 0:  # If today is also available, use today
            #    days_ahead = 7  # Get the next week's occurrence of the same weekday

            next_available_date = now + timedelta(days=days_ahead)
            
            next_available_date2=next_available_date.strftime('%Y-%m-%d')  
        if next_available_date1 or next_available_date2:
            return min(filter(None, [next_available_date1, next_available_date2]))

    @staticmethod
    @handle_repository_errors
    def get_speaker_slot_count(user_id):
        total_count = (
            db.session.query(func.count(SpeakerAvailabilityTime.id))
            .join(SpeakerAvailabilityDate, SpeakerAvailabilityTime.availability_date_id == SpeakerAvailabilityDate.id)
            .filter(
                SpeakerAvailabilityDate.user_id == user_id,
                SpeakerAvailabilityDate.status == 1,
                SpeakerAvailabilityTime.status == 1
            )
            .scalar()  
        )
        return total_count

    @staticmethod
    @handle_repository_errors
    def get_avaialability_by_user_id_and_time_id(date_id,time_id):
        return SpeakerAvailabilityTime.query.filter_by(availability_date_id=date_id, id=time_id).first()

    @staticmethod
    @handle_repository_errors
    def get_additional_info_by_user_id_and_question_id(user_id, question_id):
        return SpeakerAdditionalQuestion.query.filter_by(user_id=user_id, question_id=question_id).first()

    @staticmethod
    @handle_repository_errors
    def get_speaker_expertise(user_id, expertise_id):
        return SpeakerExpertise.query.filter_by(user_id=user_id, expertise_id=expertise_id).first()

    @staticmethod
    @handle_repository_errors
    def get_speaker_sect_type(user_id, sect_type_id):
        return SpeakerSectType.query.filter_by(user_id=user_id, sect_type_id=sect_type_id).first()

    @staticmethod
    @handle_repository_errors
    def get_speaker_school_of_thought(user_id, school_of_thought_id):
        return SpeakerSchoolOfThought.query.filter_by(user_id=user_id, school_of_thought_id=school_of_thought_id).first()

    @staticmethod
    @handle_repository_errors
    def get_expertise_list():
        expertise_list =Expertise.query.filter_by(status=1).all()
        return [{"id": expertise.id, "title": expertise.title, "ar_title": expertise.ar_title} for expertise in expertise_list]
        
        
    

    @staticmethod
    @handle_repository_errors
    def get_speaker_expertise_by_user_id(user_id):
        return SpeakerExpertise.query.filter_by(user_id=user_id).all()

    @staticmethod
    @handle_repository_errors
    def get_speaker_availability_time(availability_date_id):
        return SpeakerAvailabilityTime.query.filter_by(availability_date_id=availability_date_id).all()

    @staticmethod
    @handle_repository_errors
    def get_speaker_sect_types_by_user_id(user_id):
        return SpeakerSectType.query.filter_by(user_id=user_id).all()

    @staticmethod
    @handle_repository_errors
    def get_speaker_availability_date(user_id):
        return SpeakerAvailabilityDate.query.filter(
            SpeakerAvailabilityDate.user_id == user_id,
            SpeakerAvailabilityDate.date.isnot(None)  
        ).all()

    @staticmethod
    @handle_repository_errors
    def get_speaker_availability_day(user_id):
        return SpeakerAvailabilityDate.query.filter(
            SpeakerAvailabilityDate.user_id == user_id,
            SpeakerAvailabilityDate.weekday.isnot(None)  
        ).all()

    @staticmethod
    @handle_repository_errors
    def get_speaker_schools_of_thought_by_user_id(user_id):
        return SpeakerSchoolOfThought.query.filter_by(user_id=user_id).all()

    @staticmethod
    @handle_repository_errors
    def get_social_media_links_by_user_id(user_id):
        return SpeakerSocialMedia.query.filter_by(user_id=user_id).all()

    @staticmethod
    @handle_repository_errors
    def get_additional_info_by_user_id(user_id):
        return SpeakerAdditionalQuestion.query.filter_by(user_id=user_id).all()
        
        
    @staticmethod
    @handle_repository_errors
    def delete_speaker_sect_type(user_id, sect_type_id):
        sect_type = SpeakerSectType.query.filter_by(user_id=user_id, sect_type_id=sect_type_id, status=1).first()
        if sect_type:
            db.session.delete(sect_type)
            db.session.commit()
         
    @staticmethod
    @handle_repository_errors
    def delete_speaker_data(request_data, session_id):
        if request_data.get('type')==1:
            adate = SpeakerAvailabilityDate.query.filter(
                SpeakerAvailabilityDate.user_id == request_data['speaker_id'],
                SpeakerAvailabilityDate.id == request_data['id'],
                SpeakerAvailabilityDate.status.in_([1, 2]) 
            ).first()
            if adate:
                db.session.delete(adate)
                db.session.commit()
        if request_data.get('type')==2:
            adate = SpeakerAvailabilityTime.query.filter(
                SpeakerAvailabilityTime.id == request_data['id'],
                SpeakerAvailabilityTime.status.in_([1, 2]) 
            ).first()
            if adate:
                db.session.delete(adate)
                db.session.commit()
                
                
    @staticmethod
    @handle_repository_errors
    def delete_speaker_school_of_thought(user_id, school_of_thought_id):
        school_of_thought = SpeakerSchoolOfThought.query.filter_by(user_id=user_id, school_of_thought_id=school_of_thought_id, status=1).first()
        if school_of_thought:
            db.session.delete(school_of_thought)
            db.session.commit()
            
    @staticmethod
    @handle_repository_errors
    def get_all_speakers(request_data, limit=1000):
        request_data = request_data or {}
        page = request_data.get("page", 1)
        page=1
        
        # Management lists include inactive children/assignments so an
        # organiser can edit or reactivate a speaker without exposing the
        # account through the public master-data endpoint.
        query = Users.query.filter(Users.role_type == 4, Users.status.in_([1, 2]))

        mine = request_data.get('mine')
        if mine:
            organiser_id = request_data.get('session_id')
            query = query.outerjoin(EventSpeakers, EventSpeakers.user_id == Users.id)
            query = query.outerjoin(Event, Event.id == EventSpeakers.event_id)
            query = query.filter(
                or_(
                    Users.parent_id == organiser_id,
                    Event.user_id == organiser_id,
                )
            ).distinct()

        search_key = request_data.get('search_key')
        if search_key:
            search_key = f"%{request_data['search_key']}%"
            query = query.filter(
                or_(
                    Users.first_name.ilike(search_key),
                    Users.last_name.ilike(search_key),
                    Users.email_id.ilike(search_key),
                    Users.mobile_number.ilike(search_key),
                    func.concat(Users.first_name, ' ', Users.last_name).ilike(search_key)
                )
            )

        # Filter by expertise if provided
        if 'expertise_ids' in request_data and isinstance(request_data['expertise_ids'], list) and request_data['expertise_ids']:
            expertise_ids = request_data['expertise_ids']
            
            query = query.join(SpeakerExpertise, Users.id == SpeakerExpertise.user_id)\
                         .filter(SpeakerExpertise.expertise_id.in_(expertise_ids))

        # Filter by sect representation if provided
        if 'sect_representation' in request_data and isinstance(request_data['sect_representation'], list) and request_data['sect_representation']:
            sect_representation_ids = request_data['sect_representation']
            
            query = query.join(SpeakerSectType, Users.id == SpeakerSectType.user_id)\
                         .filter(SpeakerSectType.sect_type_id.in_(sect_representation_ids))

        # Filter by school of thought if provided
        if 'school_of_thought' in request_data and isinstance(request_data['school_of_thought'], list) and request_data['school_of_thought']:
            school_of_thought_ids = request_data['school_of_thought']
           
            query = query.join(SpeakerSchoolOfThought, Users.id == SpeakerSchoolOfThought.user_id)\
                         .filter(SpeakerSchoolOfThought.school_of_thought_id.in_(school_of_thought_ids))

        # Remove duplicates caused by joins
        query = query.distinct()

        # Paginate the results
        paginated_speakers = query.paginate(page=page, per_page=limit)
        return paginated_speakers.items
        
        
        
    @staticmethod
    @handle_repository_errors
    def delete_speaker(id, status=3):
        speaker = Users.query.filter_by(id=id).first()
        if speaker:
            speaker.status = status
            db.session.commit()
            return speaker
        return None
        
    @staticmethod
    @handle_repository_errors
    def update_user_timezone(id,time_zone):
        speaker = Users.query.filter_by(id=id).first()
        if speaker:
            if not speaker.time_zone:
                speaker.time_zone = time_zone
                db.session.commit()
                return speaker
        return None
