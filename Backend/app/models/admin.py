from .. import db
from datetime import datetime


class Menu(db.Model):
    __tablename__ = "menus"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    updated_by = db.Column(db.Integer, nullable=False, default=0)

    sub_menus = db.relationship('SubMenu', backref='menu', lazy=True)
    permissions = db.relationship('AdminPermission', backref='menu', lazy=True)


class SubMenu(db.Model):
    __tablename__ = "sub_menus"
    
    id = db.Column(db.Integer, primary_key=True)
    menu_id = db.Column(db.Integer, db.ForeignKey('menus.id'), nullable=False)
    title = db.Column(db.String(150), nullable=True)
    description = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    updated_by = db.Column(db.Integer, nullable=False, default=0)

    permissions = db.relationship('AdminPermission', backref='sub_menu', lazy=True)


class AdminPermission(db.Model):
    __tablename__ = "admin_permissions"
    
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    menu_id = db.Column(db.Integer, db.ForeignKey('menus.id'), nullable=True)
    sub_menu_id = db.Column(db.Integer, db.ForeignKey('sub_menus.id'), nullable=True)
    permission_level =  db.Column(db.String(150), nullable=False)
    status = db.Column(db.Integer, nullable=True, default=1)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, nullable=False, default=0)
    updated_by = db.Column(db.Integer, nullable=False, default=0)