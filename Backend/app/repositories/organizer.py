from app.models.organization import Organization,OrganizerCategory,OrganizerSubCategory,OrganizerAdditionalQuestion,RegistrationQuestion,OrganizationType,SectType,SchoolOfThought
from app.models.category import Category,SubCategory
from app.models.users import Users,User_session
from app.models.event import Event,Withdrawal,PaymentTransaction
from app import db
from app.models.event import Event,Participant
from sqlalchemy import func
from sqlalchemy import or_, and_,not_
from app.utils.custom_exception import ServiceError
from app.utils.response_decorators import handle_repository_errors
from datetime import datetime



class OrganizerRepository:
    role_type=3
    
    
    
    @staticmethod
    @handle_repository_errors
    def get_participants_count_all(session):
       
        
        return db.session.query(
            func.count(Participant.id)
        ).join(
            Event, Participant.event_id == Event.id  # Join condition
        ).filter(
            Event.user_id == session
        ).scalar() or 0
        
        
    
    @staticmethod
    @handle_repository_errors
    def event_created(session):
        
        
        event_count = (
            db.session.query(func.count(Event.id))
            .filter(
                Event.category_id == 1,
                Event.status == 1,
                Event.user_id == session
            )
            .scalar()
        )
        
        
        return event_count or 0
        
        
        
    @staticmethod
    @handle_repository_errors
    def total_cources(session):
        
        course_count = (
            db.session.query(func.count(Event.id))
            .filter(
                Event.category_id == 2,
                Event.status == 1,
                Event.user_id == session
            )
            .scalar()
        )
        
        return course_count or 0
    
    
    
    @staticmethod
    @handle_repository_errors
    def logout(session_id, bearer_token):
        user_session = db.session.query(User_session).filter(
            User_session.user_id == session_id, 
            User_session.token == bearer_token
        ).first()

        if user_session:
            db.session.delete(user_session)  # Correct way to delete the session
            db.session.commit()
            return user_session.id  # Optionally return the session ID that was deleted
        else:
            return None  # Handle case where no session was found


    @staticmethod
    def wallet_tranfer(request_data,session):


        from decimal import Decimal
        from datetime import datetime
        from sqlalchemy import and_, func, not_

        if request_data['transfer_type'] == 1:
            start_date = datetime.strptime(request_data['start_date'], "%Y-%m-%d")
            end_date = datetime.strptime(request_data['end_date'], "%Y-%m-%d")

            # Check if a withdrawal has already been made for the given user and date range
            existing_withdrawal = Withdrawal.query.filter(
                and_(
                    Withdrawal.user_id == request_data['user_id'],
                    Withdrawal.start_date == start_date,
                    Withdrawal.end_date == end_date
                )
            ).first()

            if existing_withdrawal:
                return {"status": "error", "message": "Withdrawal for this date range already exists."}

            # Fetch transactions within the date range and status == 1
            transactions = PaymentTransaction.query.filter(
                and_(
                    PaymentTransaction.user_id == request_data['user_id'],
                    PaymentTransaction.status == 1,  # Only include transactions with status 1
                    func.date(PaymentTransaction.created_on) >= request_data['start_date'],
                    func.date(PaymentTransaction.created_on) <= request_data['end_date']
                )
            ).all()

            if not transactions:
                return {"status": "error", "message": "No valid transactions found for the given date range."}

            # Calculate the total amount
            total_amount = sum([float(transaction.amount) for transaction in transactions])
            transaction_ids = [transaction.id for transaction in transactions]

            # Create a new withdrawal entry
            new_withdrawal = Withdrawal(
                user_id=request_data['user_id'],
                transaction_ids=",".join(map(str, transaction_ids)),  # Store IDs as comma-separated string
                total_amount=total_amount,
                withdrawn_by=session,
                start_date=request_data['start_date'],
                end_date=request_data['end_date']
            )

            # Commit to the database
            db.session.add(new_withdrawal)
            db.session.commit()

            return {"status": "success", "message": "Withdrawal processed successfully.", "total_amount": total_amount}

        if request_data['transfer_type'] == 2:
          
            # Validate the requested amount
            if request_data['amount'] <= 0:
                raise ServiceError("Invalid withdrawal amount.")

            # Step 1: Fetch all withdrawn transaction IDs for the user
            withdrawn_transaction_ids = (
                db.session.query(Withdrawal.transaction_ids)
                .filter(Withdrawal.user_id == request_data['user_id'])
                .all()
            )
          
            # Flatten and parse the transaction IDs
            excluded_ids = set()
            for entry in withdrawn_transaction_ids:
                transaction_ids = entry.transaction_ids.split(",")
                excluded_ids.update(map(int, transaction_ids))
        
          
            # Step 2: Fetch all remaining transactions for the user (not withdrawn yet, and status == 1)
            remaining_transactions = (
                PaymentTransaction.query
                .join(Event, PaymentTransaction.event_id == Event.id)
                .filter(
                    Event.user_id == request_data['user_id'],
                    PaymentTransaction.status == 1,  # Only include transactions with status 1
                    not_(PaymentTransaction.id.in_(excluded_ids))  # Exclude already used transactions
                )
                .order_by(PaymentTransaction.created_on.asc())  # Ascending order (earliest first)
                .all()
            )

          
            # Calculate the total available amount from the remaining transactions
            total_available_amount = sum(Decimal(tx.amount) for tx in remaining_transactions)

            # Check if the requested amount is greater than the total available amount
            if Decimal(request_data['amount']) > total_available_amount:                
                raise ServiceError(f"Requested amount {request_data['amount']} exceeds available balance {total_available_amount}.")

           
            # Step 3: Check if the requested amount is smaller than the smallest transaction amount
            min_transaction_amount = min(Decimal(tx.amount) for tx in remaining_transactions)
            if Decimal(request_data['amount']) < min_transaction_amount:
                raise ServiceError(f"The minimum amount you can transfer is {min_transaction_amount}.")

            
            # Step 4: Process transactions to fulfill the requested amount
            amount_to_transfer = Decimal(request_data['amount'])
            transaction_ids = []
            total_transferred = Decimal(0)

            for transaction in remaining_transactions:
                if amount_to_transfer <= 0:
                    break

                transaction_balance = Decimal(transaction.amount)
                if transaction_balance <= amount_to_transfer:
                    # Use the entire transaction amount
                    amount_to_transfer -= transaction_balance
                    total_transferred += transaction_balance
                    transaction_ids.append(transaction.id)
                else:
                    # Do not update the transaction and exit the loop if the amount doesn't match
                    pass

            # Step 5: Create a new withdrawal entry
            if total_transferred>0 :
                new_withdrawal = Withdrawal(
                    user_id=request_data['user_id'],
                    transaction_ids=",".join(map(str, transaction_ids)),  # Store IDs as comma-separated string
                    total_amount=total_transferred,  # The amount actually transferred
                    withdrawn_by=session
                )

              
                # Commit updates to the database
                db.session.add(new_withdrawal)
                db.session.commit()

            # If the total transferred amount is less than the requested amount, return a message
            if total_transferred < Decimal(request_data['amount']):
                remaining_amount = Decimal(request_data['amount']) - total_transferred
                return {
                    "status": "warning",
                    "message": f"Only {total_transferred} could be transferred. Remaining amount {remaining_amount} could not be processed.",
                }

            return {
                "status": "success",
                "message": f"Withdrawal processed successfully.",
                "withdrawn_amount": total_transferred,
            }





    @staticmethod
    @handle_repository_errors
    def wallet_transactions(data,session):
        from app.services.payment import PaymentService
        if PaymentService._enabled():
            return PaymentService.wallet(session)
        
        from decimal import Decimal
        
        user_id = data.get('user_id',None) 
        
        
        
        
        query = db.session.query(func.sum(PaymentTransaction.amount)).join(Event, PaymentTransaction.event_id == Event.id)
        query = query.filter(PaymentTransaction.status == 1)        
        if user_id:
            query = query.filter(Event.user_id == user_id)            
        total_revenue = query.scalar() or Decimal("0.00")
        
        
        

        withdraw_query = db.session.query(func.sum(Withdrawal.total_amount))
        if user_id:
            withdraw_query = withdraw_query.filter(Withdrawal.user_id == user_id)
        withdrawed_amount = withdraw_query.scalar() or Decimal("0.00")
        
        
        
        
        
        total_revenue = Decimal(total_revenue)  
        withdrawed_amount = Decimal(withdrawed_amount)  
        withdrawal_pending = total_revenue - withdrawed_amount
           





        transactions_query = db.session.query(
            PaymentTransaction.id,
            PaymentTransaction.amount,
            PaymentTransaction.currency,
            PaymentTransaction.status,
            PaymentTransaction.created_on,
            PaymentTransaction.user_id,
            Organization.organization_name,
            Event.title,
            Users.first_name,
            Users.last_name
        )
        transactions_query = transactions_query.join(Event, PaymentTransaction.event_id == Event.id)
        transactions_query = transactions_query.outerjoin(Organization, Organization.user_id == Event.user_id)
        transactions_query = transactions_query.join(Users, Users.id == PaymentTransaction.user_id)
        transactions_query = transactions_query.filter(PaymentTransaction.status.in_([1, 3]))       
     
        if user_id:
            transactions_query = transactions_query.filter(Event.user_id == user_id)      

        transactions = (
            transactions_query
            .order_by(PaymentTransaction.created_on.desc())
            # .limit(10)
            .all()
        )
        # Format Transactions
        transaction_history = [
            {
                "transaction_id": t.id,
                "amount": f"{t.amount:.2f} {t.currency}",
                "status": "Completed" if t.status == 1 else "Reverted",
                "status_id": t.status,
                "created_on": t.created_on.strftime("%Y-%m-%d"),
                "user_id": t.user_id,
                "organization_name": t.organization_name,
                "event_title": t.title,
                "user_first_name": t.first_name,
                "user_last_name": t.last_name
            }
            for t in transactions
        ]






        withdrawal_query = db.session.query(
            Withdrawal.id,
            Withdrawal.user_id,
            Withdrawal.transaction_ids,
            Withdrawal.total_amount,
            Withdrawal.withdrawn_by,
            Withdrawal.created_on,
            Withdrawal.start_date,
            Withdrawal.end_date,
            Organization.organization_name
        )
        withdrawal_query = withdrawal_query.join(Organization, Organization.user_id == Withdrawal.user_id)
        # Add filter only if `user_id` is present
        if data['user_id']:
            withdrawal_query = withdrawal_query.filter(Withdrawal.user_id == data['user_id'])

        withdrawal = (
            withdrawal_query
            .order_by(Withdrawal.created_on.desc())
            # .limit(10)
            .all()
        )
         # Format Transactions
        withdrawal_history = [
            {
                "transaction_id": t.transaction_ids,
                "total_amount": t.total_amount,
                "created_on": t.created_on.strftime("%Y-%m-%d"),
                "user_id": t.user_id,
                "withdrawn_by": t.withdrawn_by,
                "organization_name": t.organization_name
            }
            for t in withdrawal
        ]






        return {
            "total_revenue": total_revenue,
            "available_amount": withdrawal_pending,
            "pending_amount": withdrawed_amount,
            "transaction_history": transaction_history,
            "withdrawal_history": withdrawal_history
        }

    


    

        

        










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
    def add_organization(org_data):
        if isinstance(org_data.get('foundation_date'), str):
            org_data['foundation_date'] = datetime.strptime(org_data['foundation_date'], '%Y-%m-%d').date()
        organization = Organization(**org_data)
        db.session.add(organization)
        db.session.commit()
        return organization
    
    @staticmethod
    @handle_repository_errors
    def add_additional_info(additional_data):
        additional_info = OrganizerAdditionalQuestion(**additional_data)
        db.session.add(additional_info)
        db.session.commit()
        return additional_info

    @staticmethod
    @handle_repository_errors
    def add_category(category_data):
        category = Category(**category_data)
        db.session.add(category)
        db.session.commit()
        return category

    @staticmethod
    @handle_repository_errors
    def get_category_by_name(name):
        return Category.query.filter_by(title=name).first()

    @staticmethod
    @handle_repository_errors
    def add_organizer_category(organizer_category_data):
        organizer_category = OrganizerCategory(**organizer_category_data)
        db.session.add(organizer_category)
        db.session.commit()
        return organizer_category

    @staticmethod
    @handle_repository_errors
    def delete_organizer_category(user_id):        
        db.session.query(OrganizerCategory).filter(OrganizerCategory.user_id == user_id).delete() 
        db.session.commit()
        return user_id

    @staticmethod
    @handle_repository_errors
    def add_subcategory(subcategory_data):
        subcategory = SubCategory(**subcategory_data)
        db.session.add(subcategory)
        db.session.commit()
        return subcategory

    @staticmethod
    @handle_repository_errors
    def get_subcategory_by_name(name, category_id):
        return SubCategory.query.filter_by(title=name, category_id=category_id).first()

    @staticmethod
    @handle_repository_errors
    def add_organizer_subcategory(organizer_subcategory_data):
        organizer_subcategory = OrganizerSubCategory(**organizer_subcategory_data)
        db.session.add(organizer_subcategory)
        db.session.commit()
        return organizer_subcategory

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
    def update_organization(org_id, org_data):
        
        
        organization = Organization.query.get(org_id)
        if organization:
            for key, value in org_data.items():
                setattr(organization, key, value)
            db.session.commit()
        return organization

    @staticmethod
    @handle_repository_errors
    def update_additional_info(additional_info_id, additional_data):
        additional_info = OrganizerAdditionalQuestion.query.get(additional_info_id)
        if additional_info:
            for key, value in additional_data.items():
                setattr(additional_info, key, value)
            db.session.commit()
        return additional_info

    @staticmethod
    @handle_repository_errors
    def update_organizer_category(organizer_category_id, organizer_category_data):
        organizer_category = OrganizerCategory.query.get(organizer_category_id)
        if organizer_category:
            for key, value in organizer_category_data.items():
                setattr(organizer_category, key, value)
            db.session.commit()
        return organizer_category

    @staticmethod
    @handle_repository_errors
    def update_organizer_subcategory(organizer_subcategory_id, organizer_subcategory_data):
        organizer_subcategory = OrganizerSubCategory.query.get(organizer_subcategory_id)
        if organizer_subcategory:
            for key, value in organizer_subcategory_data.items():
                setattr(organizer_subcategory, key, value)
            db.session.commit()
        return organizer_subcategory

    @staticmethod
    @handle_repository_errors
    def delete_organization(id, status=3):
        organization = Users.query.filter_by(id=id).first()
        if organization:
            organization.status = status
            db.session.commit()
            return organization
        return None
    
    @staticmethod
    @handle_repository_errors
    def get_organization_by_user_id(user_id):
        return Organization.query.filter_by(user_id=user_id).first()
    
    @staticmethod
    @handle_repository_errors
    def get_organization_by_id(id):
        return Organization.query.filter_by(user_id=id).first()

    @staticmethod
    @handle_repository_errors
    def get_additional_info_by_user_id_and_question_id(user_id, question_id):
        return OrganizerAdditionalQuestion.query.filter_by(user_id=user_id, question_id=question_id).first()

    @staticmethod
    @handle_repository_errors
    def get_organizer_category(user_id, category_id):
        return OrganizerCategory.query.filter_by(user_id=user_id, category_id=category_id).first()

    @staticmethod
    @handle_repository_errors
    def get_organizer_subcategory(organizer_category_id, subcategory_id):
        return OrganizerSubCategory.query.filter_by(organizer_category_id=organizer_category_id, subcategory_id=subcategory_id).first()




    
    @staticmethod
    @handle_repository_errors
    def getRegistrationQuestion(request_data):
        questions=RegistrationQuestion.query.filter_by(status=1,question_for=request_data['type']).order_by(RegistrationQuestion.position.asc()).all()
        question_list = []
            
        for question in questions:
                question_list.append({
                    'id': question.id,
                    'question_type': question.question_type,
                    'question': question.question
                })
            

        return question_list    

    @staticmethod
    @handle_repository_errors
    def getRegistrationType():
        org_types=OrganizationType.query.filter_by(status=1).order_by(OrganizationType.position.asc()).all()
        org_type_list = []
            
        for org_type in org_types:
                org_type_list.append({
                    'id': org_type.id,
                    'title': org_type.title
                })
            

        return org_type_list    
        
        
    @staticmethod
    @handle_repository_errors
    def getRegistrationSect():
        org_secs=SectType.query.filter_by(status=1).order_by(SectType.position.asc()).all()
        org_secs_list = []
            
        for org_sec in org_secs:
                org_secs_list.append({
                    'id': org_sec.id,
                    'title': org_sec.title
                })
            

        return org_secs_list    
        
        
        
    @staticmethod
    @handle_repository_errors
    def getRegistrationSchoolType():
        org_schoolTypes=SchoolOfThought.query.filter_by(status=1).order_by(SchoolOfThought.position.asc()).all()
        org_school_list = []
            
        for org_schoolType in org_schoolTypes:
                org_school_list.append({
                    'id': org_schoolType.id,
                    'title': org_schoolType.title
                })
            

        return org_school_list    
    



    @staticmethod
    @handle_repository_errors
    def get_all_organizer(data, per_page):
        # Set up the base query with Organization as the primary table for the join
        query = db.session.query(Organization).select_from(Organization).join(Users, Organization.user)

        # Filtering by role_type and status of the Users related to the Organization
        query = query.filter(
            Organization.user.has(Users.role_type == 3),
            Organization.user.has(Users.status!=3)
        )
        search_key = data.get('search_key')
        # Adding additional filters based on the 'data' dictionary
        if search_key:
            search_key = f"%{data['search_key']}%"
            query = query.filter(
                or_(
                    Organization.organization_name.ilike(search_key),
                    Organization.user.has(Users.email_id.ilike(search_key)),
                    Organization.user.has(Users.mobile_number.ilike(search_key))
                )
            )

        # Filter by status if it's not None or an empty string
        if 'status' in data and data['status'] not in [None, ""]:
            query = query.filter(
                Organization.user.has(Users.status == data['status'])
            )
        # Filter by Sect Representation (multi-select)
        if 'sect_representation' in data and data['sect_representation']:
            if isinstance(data['sect_representation'], list) and len(data['sect_representation']) > 0:
                query = query.filter(
                    Organization.sect_representation.in_(data['sect_representation'])
                )

        # Filter by School of Thought (multi-select)
        if 'school_of_thought' in data and data['school_of_thought']:
            if isinstance(data['school_of_thought'], list) and len(data['school_of_thought']) > 0:
                query = query.filter(
                    Organization.school_thought.in_(data['school_of_thought'])
                )

        # Filter by Category (multi-select) - Using explicit join and ON clause
        if 'category_ids' in data and data['category_ids']:
            if isinstance(data['category_ids'], list) and len(data['category_ids']) > 0:
                query = query.join(OrganizerCategory, OrganizerCategory.user_id == Organization.user_id).filter(
                    OrganizerCategory.category_id.in_(data['category_ids'])
                )

        # Ordering by Organization's created_on field in descending order
        query = query.order_by(Organization.created_on.desc())

        # Paginating the query
        query = query.paginate(page=data.get('page'), per_page=per_page, error_out=False)

        # Fetching the paginated results
        organizers = query.items

        # Check if organizers exist
        if organizers:
            organizer_list = []

            # Construct the list of organizer details
            for organizer in organizers:
                organizer_detail = {
                    'id': organizer.user.id,  # Access user id through relationship
                    'organization_name': organizer.organization_name,
                    'email_id': organizer.user.email_id,  # Access email_id through relationship
                    'mobile_number': organizer.user.mobile_number,  # Access mobile_number through relationship
                    'country_code': organizer.user.country_code,  # Access country_code through relationship
                    'role_type': organizer.user.role_type,
                    'profile_image': organizer.user.profile_image,
                    'status': organizer.user.status,
                    'created_on': organizer.user.created_on.strftime('%Y-%m-%d %H:%M:%S') if organizer.user.created_on else None
                }
                organizer_list.append(organizer_detail)

            # Pagination metadata
            pagination_meta = {
                "total": query.total,
                "pages": query.pages,
                "current_page": query.page,
                "per_page": query.per_page
            }

            # Return formatted result with pagination meta
            return {"organizers": organizer_list, "pagination": pagination_meta}
        else:
            return {"organizers": [], "pagination": {"total": 0, "pages": 0, "current_page": 0, "per_page": per_page}}


    @staticmethod
    @handle_repository_errors
    def get_user_by_id(user_id):
        """Fetch user by ID from the database."""
        user = Users.query.filter_by(id=user_id,role_type=OrganizerRepository.role_type).first()
        return user

    @staticmethod
    @handle_repository_errors
    def get_organization_by_user_id(user_id):
        """Fetch organization details for a given user."""
        organization = Organization.query.filter_by(user_id=user_id).first()
        return organization

    @staticmethod
    @handle_repository_errors
    def get_categories_by_user_id(user_id):
        """Fetch categories associated with the user."""
        categories = OrganizerCategory.query.filter_by(user_id=user_id).all()
        return categories

    @staticmethod
    @handle_repository_errors
    def get_subcategories_by_category_id(organizer_category_id):
        """Fetch subcategories associated with a given organizer category."""
        subcategories = OrganizerSubCategory.query.filter_by(organizer_category_id=organizer_category_id).all()
        return subcategories

    @staticmethod
    @handle_repository_errors
    def get_additional_info_by_user_id(user_id):
        """Fetch additional information associated with the user."""
        additional_infos = (
        OrganizerAdditionalQuestion.query
        .join(RegistrationQuestion, RegistrationQuestion.id == OrganizerAdditionalQuestion.question_id)
        .filter(
            OrganizerAdditionalQuestion.user_id == user_id,
            RegistrationQuestion.status==1
        )
        .all()
)
        return additional_infos

  
  
  
  ##  retrive customer app organization  event 
    @staticmethod
    def get_organizer_info(user_id,category_id=None):
        """Fetch organizer information including name, logo, and event count."""
        now = datetime.utcnow()
        if category_id:
            organizer_info = (
                db.session.query(Organization.organization_name, Users.profile_image, func.count(Event.id).label("event_count"))
                .join(Users, Users.id == Organization.user_id)
                .outerjoin(
                    Event,
                    and_(
                        Event.user_id == Organization.user_id,
                        Event.category_id == category_id,
                        Event.status == 1,
                        func.date(Event.end_date) >= now.date(),
                    ),
                )
                .filter(Organization.user_id == user_id)
                .group_by(Organization.organization_name, Users.profile_image)
                .first()
            )
        else :
            organizer_info = (
                db.session.query(Organization.organization_name, Users.profile_image, func.count(Event.id).label("event_count"))
                .join(Users, Users.id == Organization.user_id)
                .outerjoin(
                    Event,
                    and_(
                        Event.user_id == Organization.user_id,
                        Event.status == 1,
                        func.date(Event.end_date) >= now.date(),
                    ),
                 )
                .filter(Organization.user_id == user_id)
                .group_by(Organization.organization_name, Users.profile_image)
                .first()
            )

        if organizer_info:
            return {
                "name": organizer_info.organization_name,
                "logo": organizer_info.profile_image,
                "event_count": organizer_info.event_count
            }
        return None

