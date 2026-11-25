from .. import db
from datetime import datetime
from sqlalchemy.orm import relationship

class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=True)
    ar_title = db.Column(db.String(250), nullable=True)
    image = db.Column(db.Text, nullable=True)
    position = db.Column(db.Integer, nullable=False, default=1)
    status = db.Column(db.Integer, nullable=False, default=1)
    home_view = db.Column(db.Boolean, nullable=False)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, nullable=False, default=0)
    is_material = db.Column(db.Integer, nullable=False, default=1)#1-show,2-hide
    is_speaker = db.Column(db.Integer, nullable=False, default=1)#1-show,2-hide
    is_curriculum = db.Column(db.Integer, nullable=False, default=1)#1-show,2-hide
    is_itinerary = db.Column(db.Integer, nullable=False, default=1)#1-show,2-hide
    is_tourslot = db.Column(db.Integer, nullable=False, default=1)#1-show,2-hide

    # Relationships
    events = relationship('Event', backref='category', lazy=True)
    subcategories = relationship('SubCategory', backref='category', lazy=True)


class SubCategory(db.Model):
    __tablename__ = 'subcategory'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)  # Reference to parent category
    title = db.Column(db.String(250), nullable=True)  # Subcategory title
    ar_title = db.Column(db.String(250), nullable=True)  # Arabic title, if applicable
    image = db.Column(db.Text, nullable=True)  # URL or path to subcategory image
    topic_key = db.Column(db.String(96), nullable=True, index=True)
    radar_area = db.Column(db.String(32), nullable=True, index=True)
    classification_description = db.Column(db.Text, nullable=True)
    position = db.Column(db.Integer, nullable=False, default=1)  # Position or ordering in UI
    status = db.Column(db.Integer, nullable=False, default=1)  # Status (active, inactive, etc.)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, default=0)  # Reference to creator user
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # Creation timestamp
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)  # Update timestamp
    updated_by = db.Column(db.Integer, nullable=False, default=0)  # Reference to updater user

    # Relationship
    events = relationship('Event', backref='subcategory', lazy=True)
