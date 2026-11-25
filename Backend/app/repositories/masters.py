from app import db
from app.utils.response_decorators import handle_repository_errors
from sqlalchemy import func
from datetime import datetime


class MastersRepo:
    @staticmethod
    @handle_repository_errors
    def add_master_entry(model, data):
        """Adds a new master entry to the database."""
        try:
            if 'master_type' in data:
                del data['master_type']
            
            new_entry = model(**data)
            db.session.add(new_entry)
            db.session.commit()
            return new_entry
        except Exception as e:
            db.session.rollback()
            raise e


    @staticmethod
    @handle_repository_errors
    def update_master_entry(model, entry_id, data):
        """Updates an existing master entry in the database."""
        try:
            entry = model.query.get(entry_id)
            if entry:
                for key, value in data.items():
                    setattr(entry, key, value)
                db.session.commit()
            return entry
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def delete_master_entry(model, entry_id):
        """Soft deletes a master entry by setting its status to 3."""
        try:
            entry = model.query.get(entry_id)
            if entry:
                entry.status = 3  # Status 3 indicates a soft delete
                db.session.commit()
            return entry
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    @handle_repository_errors
    def get_active_master_entries(model):
        """Fetches all active entries from a master table (status=1)."""
        return model.query.filter_by(status=1).all()

    @staticmethod
    @handle_repository_errors
    def get_master_entry_by_id(model, entry_id):
        """Fetches a master entry by ID."""
        return model.query.get(entry_id)
    
    @staticmethod
    @handle_repository_errors
    def get_all_master_entries(model, search_key=None, status=None, page=1, per_page=10,master_type=None):
        """Fetches all entries from a given master model with optional search_key and pagination."""
        query = model.query
        
        
        if status is not None:
            query = query.filter(model.status == status)
        else:
            query = query.filter(model.status.in_([1, 2]))  # Only active or pending status

        # Apply search filter if search_key is provided
        if search_key:
            search_filter = model.title.ilike(f'%{search_key}%') | model.ar_title.ilike(f'%{search_key}%')
            query = query.filter(search_filter)

        # Paginate the query
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        entries = pagination.items

        return {
            "entries": entries,
            "pagination": {
                "total": pagination.total,
                "pages": pagination.pages,
                "current_page": pagination.page,
                "per_page": pagination.per_page
            }
        }