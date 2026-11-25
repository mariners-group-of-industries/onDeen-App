import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import requests
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2 import service_account

load_dotenv()

FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging"


def send_sms(country_code, mobile_number, otp_code):
    normalized_country_code = str(country_code or '').lstrip('+')
    full_number = f"+{normalized_country_code}{mobile_number}"

    if os.getenv('SMS_SEND_ENABLED', 'true').lower() in {'0', 'false', 'no'}:
        print(f"Skipping SMS send to {full_number}; SMS_SEND_ENABLED is disabled")
        return True

    url = os.getenv("SMS_API_URL", "http://api.messaging-service.com/sms/1/text/single")
    sms_auth_token = os.getenv("SMS_AUTH_TOKEN")
    if not sms_auth_token:
        print("Skipping SMS send; SMS_AUTH_TOKEN is not configured")
        return False

    headers = {
        "accept": "application/json",
        "Authorization": sms_auth_token,
        "content-type": "application/json"
    }
    payload = {
        "from": "Ondeen",
        "to": [full_number],
        "text": f"Your Ondeen verification code is: {otp_code}."
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        print(f"SMS sent successfully to {full_number}")
        return response  
    except requests.exceptions.RequestException as e:
        print(f"Failed to send SMS to {full_number}: {e}")
        return False
    
#send sms 
# def send_sms(mobile_number,message):

#     sender="Taqnyat.sa"
#     conn = http.client.HTTPSConnection("api.taqnyat.sa")
#     payload = json.dumps({
#         "recipients": [mobile_number],
#         "body":  message,
#         "sender": sender
#     })
#     headers = {
#         'Content-Type': 'application/json',
#         'Authorization': 'Bearer 5bf7200b3800b48e01e41dbc4877ba7f'  # Replace with your API key
#     }
#     try:
#         conn.request("POST", "/v1/messages", payload, headers)
#         res = conn.getresponse()
#         data = res.read()
#         return json.loads(data.decode("utf-8"))
#     except Exception as e:
#         return {"status": "error", "error": str(e)}
    
    
    

def send_email(email_body,subjects, email_to, user_name, password):
    email_send_enabled = os.getenv('EMAIL_SEND_ENABLED')
    if email_send_enabled is None:
        email_send_enabled = 'false' if os.getenv('ONDEEN_TEST_OTP_ENABLED', '').lower() in {'1', 'true', 'yes'} else 'true'

    if email_send_enabled.lower() in {'0', 'false', 'no'}:
        print(f"Skipping email send to {email_to}; EMAIL_SEND_ENABLED is disabled")
        return {'message': 'Email send skipped'}
    
    subject = subjects
   
    # SMTP server configuration
    smtp_server = os.getenv('HOSTNAME')
    smtp_port = os.getenv('PORT')

    if not all([smtp_server, smtp_port, user_name, password]):
        print(f"Skipping email send to {email_to}; SMTP configuration is incomplete")
        return {'message': 'Email send skipped'}

    smtp_port = int(smtp_port)

    # Email content
    html_content = email_body

    # Create a MIME object
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = user_name
    message["To"] = email_to

    # Attach the HTML content
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)

    # Connect to the Gmail SMTP server and send the email
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()  # Upgrade the connection to secure
        server.login(user_name, password)
        server.sendmail(user_name, email_to, message.as_string())

    return { 'message': 'Email sent successfully!'}
    
    



def _decode_service_account_json(raw_json):
    try:
        return json.loads(raw_json)
    except json.JSONDecodeError:
        import base64
        return json.loads(base64.b64decode(raw_json).decode("utf-8"))


def _load_fcm_credentials():
    service_account_json = os.getenv("FCM_SERVICE_ACCOUNT_JSON")
    service_account_path = os.getenv("FCM_SERVICE_ACCOUNT_PATH")

    if service_account_json:
        info = _decode_service_account_json(service_account_json)
        credentials = service_account.Credentials.from_service_account_info(info, scopes=[FCM_SCOPE])
        return credentials, os.getenv("FCM_PROJECT_ID") or info.get("project_id")

    if service_account_path:
        credentials = service_account.Credentials.from_service_account_file(service_account_path, scopes=[FCM_SCOPE])
        return credentials, os.getenv("FCM_PROJECT_ID") or getattr(credentials, "project_id", None)

    return None, None


def _get_fcm_auth():
    credentials, project_id = _load_fcm_credentials()
    if not credentials or not project_id:
        return None, None

    credentials.refresh(GoogleAuthRequest())
    return credentials.token, project_id


def send_push_notification(registration_token, title, body, odid=None, type=None, badge_count=None, img=None):
    """
    Sends a push notification to a user.
    Args:
        registration_token: FCM registration token (string or list of strings).
        title: Notification title.
        body: Notification body.
        odid: Order ID (optional).
        type: Notification type (optional).
        badge_count: Badge count (optional).
        img: Image URL for notification (optional).
    Returns:
        Response dictionary indicating success or failure.
    """

    badge_count = str(badge_count) if badge_count is not None else '0'

    data = {
        'image': str(img) if img else '',
        'type': str(type) if type else '',
        'odid': str(odid) if odid else '',
        'badge': badge_count
    }

    # Check if the registration_token is a list or single value
    if isinstance(registration_token, list):
        responses = []
        for token in registration_token:
            response = send_single_push_notification(token, title, body, data)
            responses.append(response)
        return responses

    # Single registration_token
    return send_single_push_notification(registration_token, title, body, data)


def send_single_push_notification(registration_token, title, body, data):
    """
    Sends a single push notification using the user app.
    """
    access_token, project_id = _get_fcm_auth()
    if not access_token or not project_id:
        return {
            "status": "error",
            "body": body,
            "error": "FCM_SERVICE_ACCOUNT_JSON or FCM_SERVICE_ACCOUNT_PATH and FCM_PROJECT_ID are required",
        }

    payload = {
        "message": {
            "token": registration_token,
            "notification": {
                "title": title or "",
                "body": body or "",
            },
            "data": {key: str(value) for key, value in data.items()},
        }
    }
    url = f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        response_data = response.json()
        print(f"Successfully sent message: {response_data.get('name')}")
        return {"status": "success", "message_id": response_data.get("name"), "body": body}
    except Exception as e:
        print(f"Failed to send message: {e}")
        return {"status": "error", "body": body, "error": str(e)}
