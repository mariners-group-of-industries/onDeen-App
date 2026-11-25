import re
from datetime import datetime
from app.utils.custom_exception import ValidationError
from app.utils.validators import password_strength_errors

def validate_organizer_data(data):
    errors = []

    # 1. Validate id - optional, must be integer if provided
    if 'id' in data and not isinstance(data['id'], int):
        errors.append("Invalid id. It should be an integer if provided.")

    # 2. Validate email_id - mandatory, must follow email format
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if 'email_id' not in data or not re.match(email_regex, data['email_id']):
        errors.append("Invalid email_id. It should be a valid email address.")
    
    # Password - mandatory for organiser sign-up, with strength rules.
    if 'password' not in data:
        errors.append("Invalid password. It is required.")
    else:
        errors.extend(password_strength_errors(data['password']))

    # 3. Validate profile_image - optional, must be a non-empty string if provided
    # if 'profile_image' in data:
        # if not isinstance(data['profile_image'], str) or len(data['profile_image']) == 0:
            # errors.append("Invalid profile_image. If provided, it should be a non-empty string.")

    # 5. Validate mobile_number - mandatory, must be digits of length 9 or 10
    if 'mobile_number' not in data or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10, 11]:
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 6. Validate country_code - mandatory, must be in format + followed by digits
    if 'country_code' not in data or not re.match(r'^\+\d+$', data['country_code']):
        errors.append("Invalid country_code. It should be a string starting with '+' followed by digits.")

    # 7. Validate organization_name - mandatory
    if 'organization_name' not in data or not isinstance(data['organization_name'], str) or len(data['organization_name']) < 1:
        errors.append("Invalid organization_name. It should be a non-empty string.")

    # 8. Validate manager_name - mandatory
    if 'manager_name' not in data or not isinstance(data['manager_name'], str) or len(data['manager_name']) < 1:
        errors.append("Invalid manager_name. It should be a non-empty string.")

    # 9. Validate location - mandatory
    if 'location' not in data or not isinstance(data['location'], str) or len(data['location']) < 1:
        errors.append("Invalid location. It should be a non-empty string.")

    # 10. Validate latitude - mandatory
    if 'latitude' not in data or not isinstance(data['latitude'], float):
        errors.append("Invalid latitude. It should be a floating-point number.")

    # 11. Validate longitude - mandatory
    if 'longitude' not in data or not isinstance(data['longitude'], float):
        errors.append("Invalid longitude. It should be a floating-point number.")

    # 12. Validate foundation_date - mandatory, should be in 'YYYY-MM-DD' format
    try:
        datetime.strptime(data['foundation_date'], '%Y-%m-%d')
    except (ValueError, KeyError):
        errors.append("Invalid foundation_date. It should be in 'YYYY-MM-DD' format.")

    # 13. Validate post_code - mandatory
    if 'post_code' not in data or not isinstance(data['post_code'], str) or len(data['post_code']) < 1:
        errors.append("Invalid post_code. It should be a non-empty string.")

    # 14. Validate sect_rep - mandatory, must be integer
    if 'sect_rep' not in data or not isinstance(data['sect_rep'], int):
        errors.append("Invalid sect_rep. It should be an integer.")

    # 15. Validate school_thought - mandatory, must be integer
    if 'school_thought' not in data or not isinstance(data['school_thought'], int):
        errors.append("Invalid school_thought. It should be an integer.")

    # 16. Validate charity_registered - mandatory, must be boolean (1 or 0)
    if 'charity_registered' not in data or data['charity_registered'] not in [0, 1]:
        errors.append("Invalid charity_registered. It should be either 0 or 1.")

    # 17. Validate charity_no - mandatory if charity_registered is 1
    if data.get('charity_registered') == 1 and ('charity_no' not in data or not isinstance(data['charity_no'], str) or len(data['charity_no']) < 1):
        errors.append("Invalid charity_no. It should be a non-empty string when charity_registered is 1.")


    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."
    
    
    
    

def validate_login_data(data):
    errors = []

    # 1. Validate email_id - mandatory
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if 'email_id' not in data or not isinstance(data['email_id'], str) or not re.match(email_regex, data['email_id']):
        errors.append("Invalid email_id. It should be a valid email address.")

    # 2. Validate password - mandatory. No strength rules at login (existing accounts).
    if 'password' not in data or not isinstance(data['password'], str):
        errors.append("Invalid password. It should be a string.")

    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."


def validate_login_send_otp_data(data):
    errors = []

    # 1. Validate mobile_number - mandatory
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10, 11]:
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 2. Validate country_code - mandatory
    if 'country_code' not in data or not isinstance(data['country_code'], str) or not data['country_code'].lstrip('+').isdigit():
        errors.append("Invalid country_code. It should be a valid numeric string with an optional '+' prefix.")

    if errors:
        raise ValidationError(errors)

    return True, "Validation passed."


def validate_login_verify_otp_data(data):
    errors = []

    # 1. Validate mobile_number - mandatory
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10, 11]:
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 2. Validate country_code - mandatory
    if 'country_code' not in data or not isinstance(data['country_code'], str) or not data['country_code'].lstrip('+').isdigit():
        errors.append("Invalid country_code. It should be a valid numeric string with an optional '+' prefix.")

    # 3. Validate otp - mandatory
    otp = data.get('otp')
    if isinstance(otp, int):
        data['otp'] = str(otp)
    elif not isinstance(otp, str) or not otp.isdigit():
        errors.append("Invalid OTP. It should be a valid numeric string.")

    if errors:
        raise ValidationError(errors)

    return True, "Validation passed."


def validate_event_data(data):
    errors = []

    # 1. Validate id - optional, positive integer (used for updates)
    if 'id' in data and (not isinstance(data['id'], int) or data['id'] <= 0):
        errors.append("Invalid id. It should be a positive integer if provided.")

    is_update = 'id' in data

    # 2. Validate title - mandatory, string
    if 'title' not in data or not isinstance(data['title'], str) or not data['title'].strip():
        errors.append("Invalid title. It should be a non-empty string.")

    # 3. Validate ar_title - mandatory, string
    if 'ar_title' not in data or not isinstance(data['ar_title'], str) or not data['ar_title'].strip():
        errors.append("Invalid ar_title. It should be a non-empty string.")

    # 4. Validate category_id - mandatory, positive integer
    if 'category_id' not in data or not isinstance(data['category_id'], int) or data['category_id'] <= 0:
        errors.append("Invalid category_id. It should be a positive integer.")

    # 5. Validate sub_category_id - mandatory, positive integer
    if 'sub_category_id' not in data or not isinstance(data['sub_category_id'], int) or data['sub_category_id'] <= 0:
        errors.append("Invalid sub_category_id. It should be a positive integer.")

    # 6. Validate description - mandatory, string for creation
    if not is_update and ('description' not in data or not isinstance(data['description'], str) or not data['description'].strip()):
        errors.append("Invalid description. It should be a non-empty string.")

    # 7. Validate ar_description - mandatory, string for creation
    if not is_update and ('ar_description' not in data or not isinstance(data['ar_description'], str) or not data['ar_description'].strip()):
        errors.append("Invalid ar_description. It should be a non-empty string.")

    # 8. Validate start_date and end_date - mandatory, date format for creation
    try:
        if not is_update and ('start_date' not in data or not isinstance(data['start_date'], str)):
            errors.append("Invalid start_date. It should be a valid ISO date-time string.")
        elif 'start_date' in data:
            datetime.fromisoformat(data['start_date'])

        if not is_update and ('end_date' not in data or not isinstance(data['end_date'], str)):
            errors.append("Invalid end_date. It should be a valid ISO date-time string.")
        elif 'end_date' in data:
            datetime.fromisoformat(data['end_date'])
    except ValueError:
        errors.append("Invalid date format for start_date or end_date. Use ISO format (YYYY-MM-DDTHH:MM:SS).")

    # 9. Validate start_time and end_time - mandatory for creation
    time_regex = r'^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$'
    if not is_update and ('start_time' not in data or not isinstance(data['start_time'], str) or not re.match(time_regex, data['start_time'])):
        errors.append("Invalid start_time. It should be in HH:MM:SS format.")

    if not is_update and ('end_time' not in data or not isinstance(data['end_time'], str) or not re.match(time_regex, data['end_time'])):
        errors.append("Invalid end_time. It should be in HH:MM:SS format.")

    # 10. Validate event_type - mandatory
    if 'event_type' not in data or data['event_type'] not in [1, 2, 3]:
        errors.append("Invalid event_type. It should be 1 (event), 2 (course), or 3 (tour).")

    # 11. Validate location - mandatory, string for creation
    if not is_update and ('location' not in data or not isinstance(data['location'], str) or not data['location'].strip()):
        errors.append("Invalid location. It should be a non-empty string.")

    # 12. Validate latitude and longitude - mandatory for creation
    if not is_update and ('latitude' not in data or not isinstance(data['latitude'], (float, int))):
        errors.append("Invalid latitude. It should be a float.")

    if not is_update and ('longitude' not in data or not isinstance(data['longitude'], (float, int))):
        errors.append("Invalid longitude. It should be a float.")

    # 13. Validate price_type - mandatory
    if 'price_type' not in data or data['price_type'] not in [0, 1]:
        errors.append("Invalid price_type. It should be 0 (free) or 1 (paid).")

    # 14. Validate price - required if price_type is 1
    if data.get('price_type') == 1 and ('price' not in data or not isinstance(data['price'], (float, int)) or data['price'] <= 0):
        errors.append("Invalid price. It should be a positive number if price_type is 1 (paid).")

    # 15. Validate status - mandatory, 0 or 1
    if 'status' not in data or data['status'] not in [0, 1]:
        errors.append("Invalid status. It should be 0 or 1.")

    # Additional optional validations can be included as needed for other fields.

    if errors:
        raise ValidationError(errors)

    return True, "Validation passed."
