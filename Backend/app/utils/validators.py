import re
from datetime import datetime
from app.utils.custom_exception import ValidationError

PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128
PASSWORD_RULE_MESSAGE = (
    f"Invalid password. It must be {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters "
    "and contain at least one letter and one number."
)


def password_strength_errors(password):
    """Return a list of errors for a password being set (sign-up, create, change).

    Never use this for login: existing accounts may have older, shorter passwords.
    """
    if not isinstance(password, str):
        return ["Invalid password. It should be a string."]
    if (
        len(password) < PASSWORD_MIN_LENGTH
        or len(password) > PASSWORD_MAX_LENGTH
        or not password.strip()
        or not re.search(r"[A-Za-z]", password)
        or not re.search(r"[0-9]", password)
    ):
        return [PASSWORD_RULE_MESSAGE]
    return []


def validate_admin_data(data):
    errors = []

    # 1. Validate first_name - mandatory
    if 'first_name' not in data or not isinstance(data['first_name'], str) or len(data['first_name']) < 2:
        errors.append("Invalid first_name. It should be a non-empty string with at least 2 characters.")

    # 2. Validate last_name - mandatory
    if 'last_name' not in data or not isinstance(data['last_name'], str) or len(data['last_name']) < 1:
        errors.append("Invalid last_name. It should be a non-empty string with at least 1 character.")

    # 3. Validate email_id - mandatory
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if 'email_id' not in data or not re.match(email_regex, data['email_id']):
        errors.append("Invalid email_id. It should be a valid email address.")

    # 4. Validate password - strength rules apply whenever a password is being set.
    if 'password' in data and data['password'] != "":
        errors.extend(password_strength_errors(data['password']))

    # 5. Validate mobile_number - mandatory
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10,11]:
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 6. Validate country_code - mandatory
    if 'country_code' not in data or not isinstance(data['country_code'], str) or not re.match(r'^\+\d+$', data['country_code']):
        errors.append("Invalid country_code. It should be a string starting with '+' followed by digits.")

    # 7. Validate profile_image - optional
    if 'profile_image' in data:
        if not isinstance(data['profile_image'], str) or len(data['profile_image']) == 0:
            errors.append("Invalid profile_image. If provided, it should be a non-empty string.")

    # 8. Validate gender - optional
    if 'gender' in data:
        if not isinstance(data['gender'], int):
            errors.append("Invalid gender. If provided, it should be an integer.")

    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."


def validate_update_admin(data):
    errors = []

    # 1. Validate first_name - mandatory
    if 'first_name' not in data or not isinstance(data['first_name'], str) or len(data['first_name']) < 2:
        errors.append("Invalid first_name. It should be a non-empty string with at least 2 characters.")

    # 2. Validate last_name - mandatory
    if 'last_name' not in data or not isinstance(data['last_name'], str) or len(data['last_name']) < 1:
        errors.append("Invalid last_name. It should be a non-empty string with at least 1 character.")

    # 3. Validate email_id - mandatory
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if 'email_id' not in data or not re.match(email_regex, data['email_id']):
        errors.append("Invalid email_id. It should be a valid email address.")


    # 4. Validate mobile_number - mandatory
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10,11]:
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 5. Validate country_code - mandatory
    if 'country_code' not in data or not isinstance(data['country_code'], str) or not re.match(r'^\+\d+$', data['country_code']):
        errors.append("Invalid country_code. It should be a string starting with '+' followed by digits.")

    # 6. Validate profile_image - optional
    if 'profile_image' in data:
        if not isinstance(data['profile_image'], str) or len(data['profile_image']) == 0:
            errors.append("Invalid profile_image. If provided, it should be a non-empty string.")

    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."



def validate_registration_data(data):
    errors = []

    # 1. Validate mobile_number - mandatory
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10,11]:
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 2. Validate country_code - mandatory
    if 'country_code' not in data or not isinstance(data['country_code'], str) or not data['country_code'].lstrip('+').isdigit():
        errors.append("Invalid country_code. It should be a valid numeric string with an optional '+' prefix.")

    # 3. Validate email_id - mandatory
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if 'email_id' not in data or not isinstance(data['email_id'], str) or not re.match(email_regex, data['email_id']):
        errors.append("Invalid email_id. It should be a valid email address.")

    if errors:
        raise ValidationError(errors)

    return True, "Validation passed."


def validate_registration_verify_otp_data(data):
    errors = []

    # 1. Validate mobile_number - mandatory
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10,11]:
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 2. Validate country_code - mandatory
    if 'country_code' not in data or not isinstance(data['country_code'], str) or not data['country_code'].lstrip('+').isdigit():
        errors.append("Invalid country_code. It should be a valid numeric string with an optional '+' prefix.")

    # 3. Validate otp - mandatory
    if 'otp' not in data or not isinstance(data['otp'], int) or not data['otp']:
        errors.append("Invalid OTP. It should be a valid numeric string.")

    if errors:
        raise ValidationError(errors)

    return True, "Validation passed."




def validate_login_data(data):
    errors = []

    # 1. Validate email_id - mandatory
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if 'email_id' not in data or not isinstance(data['email_id'], str) or not re.match(email_regex, data['email_id']):
        errors.append("Invalid email_id. It should be a valid email address.")

    # 2. Validate password - mandatory. No strength rules at login: existing
    # accounts may have passwords set before the rules were restored.
    if 'password' not in data or not isinstance(data['password'], str):
        errors.append("Invalid password. It should be a string.")

    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."


def validate_login_send_otp_data(data):
    errors = []

    # 1. Validate mobile_number - mandatory
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10,11]:
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
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10,11]:
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 2. Validate country_code - mandatory
    if 'country_code' not in data or not isinstance(data['country_code'], str) or not data['country_code'].lstrip('+').isdigit():
        errors.append("Invalid country_code. It should be a valid numeric string with an optional '+' prefix.")

    # 3. Validate otp - mandatory
    otp = data.get('otp')

    if not otp or not (isinstance(otp, int) or (isinstance(otp, str) and otp.isdigit())):
        errors.append("Invalid OTP. It should be a valid numeric value.")


    if errors:
        raise ValidationError(errors)

    return True, "Validation passed."




def validate_category_data(data):
    errors = []

    # 1. Validate title - mandatory
    if 'title' not in data or not isinstance(data['title'], str) or len(data['title']) < 1:
        errors.append("Invalid title. It should be a non-empty string.")

 

    # 4. Validate image - optional
    if 'image' in data and data['image'] is not None and not isinstance(data['image'], str):
        errors.append("Invalid male_image. If provided, it should be a string.")
        
    # 5. Validate position - optional
    if 'position' in data and data['position'] is not None and not isinstance(data['position'], int):
        errors.append("Invalid position. If provided, it should be an integer.")

    # 6. Validate home_view - optional
    if 'home_view' in data and data['home_view'] is not None and not isinstance(data['home_view'], int):
        errors.append("Invalid home_view. If provided, it should be a boolean.")

    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."




def validate_subcategory_data(data):
    errors = []

    # 1. Validate category_id - mandatory
    if 'category_id' not in data or not isinstance(data['category_id'], int):
        errors.append("Invalid category_id. It should be an integer and is required.")

    # 2. Validate title - mandatory
    if 'title' not in data or not isinstance(data['title'], str) or len(data['title']) < 1:
        errors.append("Invalid title. It should be a non-empty string.")


    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."




def validate_user_data(data):
    errors = []

    # 1. Validate first_name - mandatory
    # if 'first_name' not in data or not isinstance(data['first_name'], str) or len(data['first_name']) < 2:
    #     errors.append("Invalid first_name. It should be a non-empty string with at least 2 characters.")

    # # 2. Validate last_name - mandatory
    # if 'last_name' not in data or not isinstance(data['last_name'], str) or len(data['last_name']) < 1:
    #     errors.append("Invalid last_name. It should be a non-empty string with at least 1 character.")

    # 3. Validate email_id - mandatory
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if 'email_id' not in data or not re.match(email_regex, data['email_id']):
        errors.append("Invalid email_id. It should be a valid email address.")

    # 4. Validate password - strength rules apply whenever a password is being set.
    if 'password' in data and data['password'] != "":
        errors.extend(password_strength_errors(data['password']))

    # 5. Validate mobile_number - mandatory
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10,11]:
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 6. Validate country_code - mandatory
    if 'country_code' not in data or not isinstance(data['country_code'], str) or not re.match(r'^\+\d+$', data['country_code']):
        errors.append("Invalid country_code. It should be a string starting with '+' followed by digits.")

    # 7. Validate profile_image - optional
    if 'profile_image' in data and data['profile_image']:
        if not isinstance(data['profile_image'], str) or len(data['profile_image']) == 0:
            errors.append("Invalid profile_image. If provided, it should be a non-empty string.")

    # 8. Validate gender - optional
    if 'gender' in data:
        if not isinstance(data['gender'], int):
            errors.append("Invalid gender. If provided, it should be an integer.")

    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."




def validate_update_user_data(data):
    errors = []

    # 1. Validate first_name - mandatory if provided
    if 'first_name' in data and (not isinstance(data['first_name'], str) or len(data['first_name']) < 2):
        errors.append("Invalid first_name. It should be a non-empty string with at least 2 characters.")

    # 2. Validate last_name - mandatory if provided
    if 'last_name' in data and (not isinstance(data['last_name'], str) or len(data['last_name']) < 1):
        errors.append("Invalid last_name. It should be a non-empty string with at least 1 character.")

    # 3. Validate email_id - mandatory if provided
    if 'email_id' in data and not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', data['email_id']):
        errors.append("Invalid email_id. It should be a valid email address.")

    # 4. Validate password - strength rules apply whenever a password is being set.
    if 'password' in data and data['password'] != "":
        errors.extend(password_strength_errors(data['password']))

    # 5. Validate mobile_number - mandatory if provided
    if 'mobile_number' in data and (not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10,11]):
        errors.append("Invalid mobile_number. It should be a 9 or 10 or 11-digit number.")

    # 6. Validate country_code - mandatory if provided
    if 'country_code' in data and (not isinstance(data['country_code'], str) or not re.match(r'^\+\d+$', data['country_code'])):
        errors.append("Invalid country_code. It should be a string starting with '+' followed by digits.")

    # 7. Validate profile_image - optional if provided
    if 'profile_image' in data and (not isinstance(data['profile_image'], str) or len(data['profile_image']) == 0):
        errors.append("Invalid profile_image. If provided, it should be a non-empty string.")

    # 8. Validate gender - optional if provided
    if 'gender' in data and not isinstance(data['gender'], int):
        errors.append("Invalid gender. If provided, it should be an integer.")

    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."




def validate_organizer_data(data):
    errors = []

    # 1. Validate id - optional, must be integer if provided
    if 'id' in data and not isinstance(data['id'], int):
        errors.append("Invalid id. It should be an integer if provided.")

    # 2. Validate email_id - mandatory, must follow email format
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if 'email_id' not in data or not re.match(email_regex, data['email_id']):
        errors.append("Invalid email_id. It should be a valid email address.")

    # 3. Validate profile_image - optional, must be a non-empty string if provided
    if 'profile_image' in data:
        if not isinstance(data['profile_image'], str) or len(data['profile_image']) == 0:
            errors.append("Invalid profile_image. If provided, it should be a non-empty string.")

    # 4. Validate password - optional; strength rules apply when one is provided.
    if 'password' in data and data['password'] != "":
        errors.extend(password_strength_errors(data['password']))

    # 5. Validate mobile_number - mandatory, must be digits of length 9 or 11
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




def validate_membership_data(data):
    errors = []

    # 1. Validate title - mandatory, must be a non-empty string
    if 'title' not in data or not isinstance(data['title'], str) or len(data['title']) < 1:
        errors.append("Invalid title. It should be a non-empty string.")

    # 2. Validate ar_title - mandatory, must be a non-empty string
    # if 'ar_title' not in data or not isinstance(data['ar_title'], str) or len(data['ar_title']) < 1:
        # errors.append("Invalid ar_title. It should be a non-empty string.")

    # 3. Validate sub_title - mandatory, must be a non-empty string
    # if 'sub_title' not in data or not isinstance(data['sub_title'], str) or len(data['sub_title']) < 1:
        # errors.append("Invalid sub_title. It should be a non-empty string.")

    # 4. Validate ar_sub_title - mandatory, must be a non-empty string
    # if 'ar_sub_title' not in data or not isinstance(data['ar_sub_title'], str) or len(data['ar_sub_title']) < 1:
        # errors.append("Invalid ar_sub_title. It should be a non-empty string.")

    # 5. Validate description - mandatory, must be a non-empty string
    # if 'description' not in data or not isinstance(data['description'], str) or len(data['description']) < 1:
        # errors.append("Invalid description. It should be a non-empty string.")

    # 6. Validate ar_description - mandatory, must be a non-empty string
    # if 'ar_description' not in data or not isinstance(data['ar_description'], str) or len(data['ar_description']) < 1:
        # errors.append("Invalid ar_description. It should be a non-empty string.")

    # 7. Validate duration_type - mandatory, must be a SMALLINT
    if 'duration_type' not in data or not isinstance(data['duration_type'], int) or not (0 <= data['duration_type'] <= 32767):
        errors.append("Invalid duration_type. It should be a valid SMALLINT.")

    # 8. Validate duration - mandatory, must be a SMALLINT
    if 'duration' not in data or not isinstance(data['duration'], int) or not (0 <= data['duration'] <= 32767):
        errors.append("Invalid duration. It should be a valid SMALLINT.")

    # 9. Validate price - mandatory, must be a DECIMAL(10,2)
    if 'price' not in data or not isinstance(data['price'], (float, int)) or data['price'] < 0 or data['price'] >= 10**10:
        errors.append("Invalid price. It should be a positive decimal number with up to 10 digits and 2 decimal places.")

    if errors:
        raise ValidationError(errors)
    return True, "Validation passed."
