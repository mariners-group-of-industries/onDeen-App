from .. import db
from datetime import datetime



class Speaker(db.Model):
    __tablename__ = "speaker"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    formal_id_document = db.Column(db.Text, nullable=True)
    country_of_residence = db.Column(db.String(100), nullable=True)
    about_us = db.Column(db.Text, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=True, default=0)
    created_on = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=True, default=0)
    updated_on = db.Column(db.DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow)
    qualification = db.Column(db.Text, nullable=True)
    formal_id_name = db.Column(db.Text, nullable=True)
    one_to_one_enabled = db.Column(db.Boolean, nullable=False, default=True)
    one_to_one_location_type = db.Column(db.SmallInteger, nullable=True, default=2)
    one_to_one_duration_minutes = db.Column(db.Integer, nullable=False, default=60)

    user = db.relationship("Users", backref="speaker_info")

class SpeakerSocialMedia(db.Model): 
    __tablename__ = 'speaker_social_media'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    platform = db.Column(db.String(50), nullable=False)  # E.g., "Twitter", "LinkedIn"
    url = db.Column(db.String(255), nullable=False)  # The URL for the social media profile
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("Users", backref="social_media_links")

class SpeakerAvailabilityDate(db.Model): 
    __tablename__ = 'speaker_availability_date'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    date = db.Column(db.Date, nullable=True)  
    weekday = db.Column(db.Integer, nullable=True)  # Monday = 0, Sunday = 6
    
    status = db.Column(db.Integer, nullable=True, default=1)#1-available,2-not available
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("Users", backref="speaker_availability_date")

class SpeakerAvailabilityTime(db.Model): 
    __tablename__ = 'speaker_availability_time'
    
    id = db.Column(db.Integer, primary_key=True)
    availability_date_id = db.Column(db.Integer, db.ForeignKey('speaker_availability_date.id'), nullable=False)
    
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    
    status = db.Column(db.Integer, nullable=True, default=1)#1-available,2-not available
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    availabilitydate = db.relationship("SpeakerAvailabilityDate", backref="speaker_availability_time")

class SpeakerAdditionalQuestion(db.Model):
    __tablename__ = 'speaker_additional_question'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('registration_question.id'), nullable=False)
    option_value = db.Column(db.Boolean, nullable=False, default=False)
    answer = db.Column(db.Text, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("Users", backref="speaker_additional_questions")
    question = db.relationship("RegistrationQuestion", backref="speaker_additional_questions")

class SpeakerExpertise(db.Model):
    __tablename__ = "speaker_expertise"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    expertise_id = db.Column(db.Integer, db.ForeignKey('expertise.id'), nullable=False)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("Users", backref="speaker_expertise")
    expertise = db.relationship("Expertise", backref="speaker_expertise")

class SpeakerSectType(db.Model):
    __tablename__ = 'speaker_sect_type'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sect_type_id = db.Column(db.Integer, db.ForeignKey('sect_type.id'), nullable=False)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("Users", backref="speaker_sect_types")
    sect_type = db.relationship("SectType", backref="speaker_sect_types")

class SpeakerSchoolOfThought(db.Model):
    __tablename__ = 'speaker_school_of_thought'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    school_of_thought_id = db.Column(db.Integer, db.ForeignKey('school_of_thought.id'), nullable=False)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("Users", backref="speaker_school_of_thoughts")
    school_of_thought = db.relationship("SchoolOfThought", backref="speaker_school_of_thoughts")


class Expertise(db.Model):
    __tablename__ = "expertise"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    ar_title = db.Column(db.String(255), nullable=True)
    position = db.Column(db.Integer, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
