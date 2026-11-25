
from app.models.users import Users,User_session
from app import db
from sqlalchemy import func
from sqlalchemy import or_, and_,not_
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_repository_errors
from datetime import datetime



class BuddyRepository:
    role_type=5
    

    # Add Methods
    @staticmethod
    @handle_repository_errors
    def add_user(user_data):
        user = Users(**user_data)
        db.session.add(user)
        db.session.commit()
        return user


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
    @handle_repository_errors
    def delete_user(user_id, session):
        user = Users.query.get(user_id)
        if user:
            user.status = 3
            user.updated_by = session
            db.session.commit()
        return user


    

    @staticmethod
    @handle_repository_errors
    def get_user_by_id(user_id):
        """Fetch user by ID from the database."""
        user = Users.query.filter_by(id=user_id,role_type=5).first()
        return user
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_users(session_id):
        
        query = Users.query
        query = query.filter(Users.role_type == 5,Users.status == 1,Users.parent_id == session_id)
        
        # Execute the query to get all users
        users = query.all()
        return users

  






