from .. import db
from datetime import datetime
from sqlalchemy.orm import relationship


class Organization(db.Model):
    __tablename__ = "organizations"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Reference to the user who created the organization
    organization_name = db.Column(db.String(255), nullable=False)  # Organization Name
    manager_name = db.Column(db.String(255), nullable=True)  # Manager Name
    public_email_id = db.Column(db.String(200), nullable=True)
    public_country_code = db.Column(db.String(10), nullable=True)
    public_mobile_number = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(255), nullable=True)  # Full address of the organization 
    latitude = db.Column(db.Float, nullable=True)  # Latitude of organization location
    longitude = db.Column(db.Float, nullable=True)  # Longitude of organization location
    foundation_date = db.Column(db.Date, nullable=True)  # Organization Foundation Date
    post_code = db.Column(db.String(20), nullable=True)  # Post Code
    sect_representation = db.Column(db.Integer, db.ForeignKey('sect_type.id'), nullable=False)  # Sect Representation
    charity_registered = db.Column(db.Boolean, nullable=False, default=False)  # Is Registered Charity?
    charity_no = db.Column(db.String(100), nullable=True)  # Charity Number if registered
    status = db.Column(db.Integer, nullable=True, default=1)
    verify_event = db.Column(db.Integer, nullable=True, default=1) ##1-yes,2-no
    
    # Timestamps
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    school_thought = db.Column(db.Integer, db.ForeignKey('school_of_thought.id'), nullable=False)
    about_us = db.Column(db.Text, nullable=True)  # about us of the organization 

   
    # Relationships
    user = db.relationship('Users', back_populates='organizations', lazy=True)
    sec_type = db.relationship('SectType', backref='brSectType', lazy=True)
    school_of_thought = db.relationship('SchoolOfThought', backref='brschoolofthought', lazy=True)
    


class OrganizerCategory(db.Model):
    __tablename__ = 'organizer_categories'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Reference to the organization
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)  # Reference to the main category
    status = db.Column(db.Integer, nullable=True, default=1)
    # Timestamps
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)

    # Relationships
    organizer_subcategories = db.relationship('OrganizerSubCategory', backref='organizer_categories',  cascade="all, delete",lazy=True)  # One-to-many relationship with OrganizerSubCategory
    category = db.relationship('Category', backref='organizer_categories', lazy=True)  # Reference to main Category


class OrganizerSubCategory(db.Model):
    __tablename__ = 'organizer_subcategories'
    id = db.Column(db.Integer, primary_key=True)
    organizer_category_id = db.Column(db.Integer, db.ForeignKey('organizer_categories.id',ondelete="CASCADE"), nullable=False)  # Reference to parent organizer category
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'), nullable=False)  # Reference to the main subcategory
    status = db.Column(db.Integer, nullable=True, default=1)
    # Timestamps
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)

    # Relationships
    subcategory = db.relationship('SubCategory', backref='organizer_subcategories', lazy=True)  # Reference to SubCategory
    #organizercategory = db.relationship("OrganizerCategory", back_populates="organizer_subcategories",  lazy=True)



class OrganizerAdditionalQuestion(db.Model):
    __tablename__ = 'organizer_additional_question'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  
    question_id = db.Column(db.Integer, db.ForeignKey('registration_question.id'), nullable=False)  
    option_value = db.Column(db.Boolean, nullable=False, default=False)
    answer = db.Column(db.Text, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)

    user = db.relationship("Users", backref="organizer_additional_questions")
    question = db.relationship("RegistrationQuestion", backref="organizer_additional_questions")
    
    
    

class RegistrationQuestion(db.Model):
    __tablename__ = 'registration_question'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question_for = db.Column(db.SmallInteger, nullable=False)  # Represents the target audience or entity for the question
    question_type = db.Column(db.SmallInteger, nullable=False)  # Represents the type of question (e.g., text, dropdown, etc.)
    question = db.Column(db.Text, nullable=False)  # The question text
    position = db.Column(db.Integer, nullable=True)  # Position/order of the question in the form
    status = db.Column(db.Integer, nullable=True, default=1)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)





class OrganizationType(db.Model):
    __tablename__ = 'organization_type'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    ar_title = db.Column(db.String(255), nullable=True)
    position = db.Column(db.Integer, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    # Timestamps
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)

class SectType(db.Model):
    __tablename__ = 'sect_type'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    ar_title = db.Column(db.String(255), nullable=True)
    position = db.Column(db.Integer, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    # Timestamps
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)

class SchoolOfThought(db.Model):
    __tablename__ = 'school_of_thought'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    ar_title = db.Column(db.String(255), nullable=True)
    position = db.Column(db.Integer, nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    # Timestamps
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
