from app.models.users import Users
from app import db
from sqlalchemy import or_
from app.utils.response_decorators import handle_repository_errors


class Adminrepository:
    @staticmethod
    @handle_repository_errors
    def manage_permissions(data, admin_id):
        created_permissions = []
        
        for permission_data in data:
            permission_levels = permission_data.get('permission_level', [])
            
            if not isinstance(permission_levels, list):
                return {"error": "is_error"}
            
            permission_levels_str = ','.join([f'"{level}"' for level in permission_levels])
            
            new_permission = AdminPermission(
                admin_id=admin_id,
                menu_id=permission_data.get('menu_id'),
                sub_menu_id=permission_data.get('sub_menu_id'),
                permission_level=permission_levels_str,
                status=1
            )
            
            db.session.add(new_permission)
            created_permissions.append(new_permission)
        
        db.session.commit()
        
        if created_permissions:
            return created_permissions
        
        return {"error": "is_error"}
    
    @staticmethod
    @handle_repository_errors
    def get_permission(admin_id):
        get_permissions = db.session.query(AdminPermission).filter(AdminPermission.admin_id == admin_id).all()
        
        if get_permissions:
            permissions_list = []
            
            for permission in get_permissions:
                permission_level = permission.permission_level.replace('"', '')
                
                permissions_list.append({
                    'menu_id': permission.menu_id,
                    'permission_level': permission_level,
                })
            
            return permissions_list
        
        return {"error": "is_error"}
    
    @staticmethod
    @handle_repository_errors
    def get_menu_submenu_list(admin_id):
        menus = db.session.query(Menu).all()
        menu_list = []

        for menu in menus:
            sub_menus = db.session.query(SubMenu).filter(SubMenu.menu_id == menu.id).all()
            submenu_list = []
            
            for submenu in sub_menus:
                submenu_list.append({
                    'id': submenu.id,
                    'title': submenu.title,
                    'description': submenu.description
                })
            
            menu_list.append({
                'id': menu.id,
                'title': menu.title,
                'description': menu.description,
                'sub_menus': submenu_list
            })

        return menu_list
    
    @staticmethod
    @handle_repository_errors
    def get_admin_by_id(admin_id, current_id):
        admin = db.session.query(Users).filter(Users.id == admin_id).first()
        
        if not admin:
            return {"error": "is_error"}
        
        admin_data = {
            'id': admin.id,
            'first_name': admin.first_name,
            'last_name': admin.last_name,
            'email_id': admin.email_id,
            'mobile_number': admin.mobile_number,
            'profile_image': admin.profile_image,
            'country_code': admin.country_code,
            'status': admin.status,
            'permissions': []
        }
        
        all_menus = db.session.query(Menu).all()
        
        for menu in all_menus:
            permission = db.session.query(AdminPermission).filter(
                AdminPermission.admin_id == admin.id,
                AdminPermission.menu_id == menu.id
            ).first()
            
            menu_data = {
                'id': menu.id,
                'title': menu.title,
                'is_active': True if permission else False,
                'permission_level': permission.permission_level if permission else None
            }
            
            admin_data['permissions'].append(menu_data)

        return admin_data
    
    @staticmethod
    @handle_repository_errors
    def update_permission(data, current_id):
        existing_permission = db.session.query(AdminPermission).filter(
            AdminPermission.admin_id == current_id,
            AdminPermission.id == data.get('id')
        ).first()

        if not existing_permission:
            return {"error": "is_error"}
        
        if 'permission_level' in data:
            permission_levels = data.get('permission_level', [])
            if isinstance(permission_levels, list):
                permission_levels_str = ','.join([f'"{level}"' for level in permission_levels])
                existing_permission.permission_level = permission_levels_str
           
        
        if 'menu_id' in data:
            existing_permission.menu_id = data.get('menu_id')
        
        if 'sub_menu_id' in data:
            existing_permission.sub_menu_id = data.get('sub_menu_id')
        
        if 'status' in data:
            existing_permission.status = data.get('status')
            
        existing_permission.updated_by = current_id
        db.session.add(existing_permission)
        db.session.commit()
        
        return existing_permission
    
    @staticmethod
    @handle_repository_errors
    def get_all_admin(data, per_page):
        query = db.session.query(Users).filter(Users.role_type == 1,Users.status==1)
        
        if 'search_key' in data and data['search_key']:
            search_key = f"%{data['search_key']}%"
            query = query.filter(or_(
                Users.first_name.ilike(search_key),
                Users.last_name.ilike(search_key),
                Users.email_id.ilike(search_key),
                Users.mobile_number.ilike(search_key)
            ))
        
        query = query.order_by(Users.created_on.desc()) 
        query = query.paginate(page=data.get('page', 1), per_page=per_page, error_out=False)
        admins = query.items
        
        if not admins:
            return {"error": "is_error"}

        result = []
        for admin in admins:
            result.append({
                'id': admin.id,
                'first_name': admin.first_name,
                'last_name': admin.last_name,
                'email_id': admin.email_id,
                'mobile_number': admin.mobile_number,
                'profile_image': admin.profile_image,
                'country_code':admin.country_code,
                'status': admin.status
            })
        
        return {
            'admins': result,
            'pagination_meta': {
                'total': query.total,
                'pages': query.pages,
                'current_page': query.page,
                'per_page': query.per_page
            }
        }

    
    @staticmethod
    @handle_repository_errors
    def delete_admin(admin_id, session_id):
        admin = db.session.query(Users).filter(Users.id == admin_id).first()
        if not admin:
            return {"error": "is_error"}

        admin.status = 2
        admin.updated_by = session_id
        db.session.commit()
        return True