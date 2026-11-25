from .. import db
from datetime import datetime
from sqlalchemy.orm import relationship


class Wishlist(db.Model):
    __tablename__ = "wishlist"
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_by =db.Column(db.Integer,nullable=False,default= 0)
