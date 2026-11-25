import re
from datetime import datetime
from app.utils.custom_exception import ValidationError



def validate_registration_data(data):
    errors = []

    # 1. Validate mobile_number - mandatory
    if 'mobile_number' not in data or not isinstance(data['mobile_number'], str) or not data['mobile_number'].isdigit() or len(data['mobile_number']) not in [9, 10]:
        errors.append("Invalid mobile_number. It should be a 9 or 10-digit number.")

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
