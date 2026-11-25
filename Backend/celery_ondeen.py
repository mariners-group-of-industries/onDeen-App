from celery import Celery
from app.utils.notification import send_push_notification
import os
from dotenv import load_dotenv

load_dotenv()


def _celery_broker_url():
    return (
        os.getenv("CELERY_BROKER_URL")
        or os.getenv("REDIS_URL")
        or ("memory://" if os.getenv("ONDEEN_LOCAL", "1") == "1" else "memory://")
    )


def _celery_backend_url():
    return (
        os.getenv("CELERY_RESULT_BACKEND")
        or os.getenv("REDIS_URL")
        or ("cache+memory://" if os.getenv("ONDEEN_LOCAL", "1") == "1" else "cache+memory://")
    )


# Celery application instance
celery_ondeen = Celery(
    'ondeen',
    broker=_celery_broker_url(),
    backend=_celery_backend_url()
)

celery_ondeen.conf.update({
    'task_serializer': 'json',
    'result_serializer': 'json',
    'accept_content': ['json'],
    'timezone': 'UTC',
    'enable_utc': True,
    'broker_connection_retry_on_startup': True,  # Add this line
})

#celery_ondeen.autodiscover_tasks(['celery_ondeen']) 


@celery_ondeen.task(name="celery_ondeen.push_notification_user", queue="notifications")
def push_notification_user(notification_data):
    print("1234")
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


@celery_ondeen.task(name="celery_ondeen.push_notification_org", queue="notifications")
def push_notification_org(notification_data):
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

@celery_ondeen.task
def test_task():
    print("== Dummy Task Executed ==")
    return "OK"
