from flask import jsonify
from flask_jwt_extended import create_access_token
from datetime import timedelta
from . import auth
from flask import request
from app.utils.notification import send_push_notification
from app.utils.file_upload import (
    EVENT_MATERIAL_MAX_FILE_SIZE,
    MAX_FILE_SIZE,
    is_valid_material_file_type,
    store_file,
)
from celery_ondeen import push_notification_user,test_task
from app.utils.redis_cache import delete_keys_by_pattern
from flask import abort
from app.utils.auth_decorators import ALLOWED_UPLOAD_MODULES, admin_required, has_upload_credentials
import logging

logging.basicConfig(
    filename='app.log',                # Log file name
    filemode='a',                      # Append mode ('w' for overwrite)
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO                 # Set the log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
)

@auth.route('/generate_token', methods=['GET'])
def generate_token():
    expires = timedelta(days=7)
    access_token = create_access_token(identity='default_user', expires_delta=expires, additional_claims={"token_type": "auth"})
    return jsonify({'access_token': access_token}), 200




@auth.route('/push_notification', methods=['POST'])
@admin_required
def push_notification():
    data = request.get_json()  

    push_token = data.get('push_token') 
    subjects = "ondeen"
    description = "ondeen"
    if  data.get('push_type')==1:
                    test_task.delay()
                    customer_notification_data = {
                            "registration_token": push_token,
                            "title": subjects,
                            "body": "celecry",
                            "odid": 0,
                            "type": 0
                    }   

                    task = push_notification_user.delay(customer_notification_data)
                    taskk = task.id
    else:
        taskk=send_push_notification(push_token,subjects,description,odid=None, type=None, badge_count=None, img=None)
    return {"message": taskk}




@auth.route('/push_notification_user', methods=['POST'])
@admin_required
def push_notification_user():
    notification_data = request.get_json()  # Get JSON data from request

    logging.info(f"push_notification_user notification_data {str(notification_data)}")
        
    registration_token = notification_data.get("registration_token")
    title = str(notification_data.get("title")) if notification_data.get("title") else None
    body = str(notification_data.get("body")) if notification_data.get("body") else None
    odid = notification_data.get("odid")  
    type = str(notification_data.get("type")) if notification_data.get("type") else None
    badge_count = int(notification_data.get("badge_count")) if notification_data.get("badge_count") else None
    img = str(notification_data.get("img")) if notification_data.get("img") else None

    # Ensure all required fields are strings
    if not isinstance(body, str):
        body = str(body)
    response = send_push_notification(registration_token=registration_token,title=title,body=body,odid=odid,type=type,badge_count=badge_count,img=img)
    return response
   




@auth.route('/push_notification_org', methods=['POST'])
@admin_required
def push_notification_org():
    notification_data = request.get_json()  # Get JSON data from request

    logging.info(f"push_notification_org notification_data {str(notification_data)}")
    
    registration_token = notification_data.get("registration_token")
    title = str(notification_data.get("title")) if notification_data.get("title") else None
    body = str(notification_data.get("body")) if notification_data.get("body") else None
    odid = notification_data.get("odid")  
    type = str(notification_data.get("type")) if notification_data.get("type") else None
    badge_count = int(notification_data.get("badge_count")) if notification_data.get("badge_count") else None
    img = str(notification_data.get("img")) if notification_data.get("img") else None

    # Ensure all required fields are strings
    if not isinstance(body, str):
        body = str(body)

    response = send_push_notification(registration_token=registration_token,title=title,body=body,odid=odid,type=type,badge_count=badge_count,img=img)
    return response
   
    


@auth.route('/delete_all_ondeen_keys', methods=['GET'])
@admin_required
def delete_all_ondeen_keys():
    # Delete all keys matching 'ondeenpage:*'
    deleted_count = delete_keys_by_pattern('ondeenpage:*')
    
    if deleted_count > 0:
        return f"Successfully deleted {deleted_count} 'ondeenpage:*' keys.", 200
    else:
        return "No keys found to delete.", 404





    
@auth.route('/upload_file', methods=['POST'])
def upload_file():
    import base64
    from werkzeug.utils import secure_filename

    if not has_upload_credentials():
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.get_json(silent=True) or {}
    folder_name = data.get('module') or 'auth'
    if folder_name not in ALLOWED_UPLOAD_MODULES:
        return jsonify({"error": "Unsupported upload module"}), 400
    base64_payload = data.get('data')
    filename = data.get('filename') or 'upload.jpeg'
    filename = secure_filename(filename)

    if not base64_payload:
        return jsonify({"error": "data is required"}), 400

    base64_data = base64_payload.split(',', 1)[1] if ',' in base64_payload else base64_payload

    try:
        file_data = base64.b64decode(base64_data, validate=True)
    except Exception as e:
        return jsonify({"error": "Invalid Base64 data"}), 400

    max_size = (
        EVENT_MATERIAL_MAX_FILE_SIZE
        if folder_name == 'event_material'
        else MAX_FILE_SIZE
    )
    if len(file_data) > max_size:
        limit_mb = max_size // (1024 * 1024)
        return jsonify({"error": f"File size must be {limit_mb} MB or smaller"}), 413

    if folder_name == 'event_material' and not is_valid_material_file_type(file_data):
        return jsonify({
            "error": (
                "Unsupported event material. Use an image, PDF, Office document, "
                "ZIP, or audio file."
            )
        }), 415

    try:
        upload = store_file(
            file_data,
            folder_name,
            filename,
            data.get("content_type", "application/octet-stream"),
        )
        return jsonify({"message": "Upload Successful!", "file_url": upload["url"]})
    except Exception as e:
        logging.exception("upload_file failed")
        return jsonify({"error": "Error uploading file"}), 500
    

@auth.route('/create_payment', methods=['POST'])
def create_payment_intent():
    return jsonify({
        "error": "This legacy endpoint is retired. Create payment orders through the booking endpoint."
    }), 410
    




@auth.route('/update_payment_status', methods=['POST'])
def update_payment_status():
    return jsonify({
        "error": "Client-authored payment status is not accepted. Query /payment/orders/<order_key>."
    }), 410




@auth.route('/webhook', methods=['POST'])
def stripe_webhook():
    from app.services.payment import PaymentService
    from app.utils.custom_exception import ServiceError

    try:
        result = PaymentService.handle_webhook(
            request.get_data(cache=False),
            request.headers.get("Stripe-Signature"),
        )
        return jsonify(result), 200
    except ServiceError as error:
        return jsonify({"error": error.message}), 400
    except Exception:
        return jsonify({"error": "Stripe webhook processing failed"}), 500
