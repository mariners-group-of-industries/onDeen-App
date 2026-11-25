import requests
import os
import logging
from logging.handlers import RotatingFileHandler


# Set callback URL from environment
callback_url = os.getenv("CALLBACK_URL") or os.getenv("callback_url") or ""

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

if not logger.handlers:
    log_file = os.getenv("ONDEEN_NOTIFICATION_LOG_FILE")
    if log_file:
        os.makedirs(os.path.dirname(os.path.abspath(log_file)), exist_ok=True)
        handler = RotatingFileHandler(log_file, maxBytes=10000, backupCount=1)
    else:
        handler = logging.StreamHandler()

    handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)

def async_push_notification_user(args):
    try:
        logger.info("push_notification_user START")
        # Fire-and-forget POST with timeout
        requests.post(f"{callback_url}push_notification_user", json=args, timeout=0.2)
        logger.info("push_notification_user TRIGGERED (fire-and-forget)")
    except requests.exceptions.ReadTimeout:
        logger.info("push_notification_user TRIGGERED (timeout ignored)")
    except Exception as e:
        logger.error(f"push_notification_user ERROR: {e}")



def async_push_notification_org(args):
    try:
        logger.info("push_notification_org START")
        # Fire-and-forget POST with timeout
        requests.post(f"{callback_url}push_notification_org", json=args, timeout=0.2)
        logger.info("push_notification_org TRIGGERED (fire-and-forget)")
    except requests.exceptions.ReadTimeout:
        logger.info("push_notification_org TRIGGERED (timeout ignored)")
    except Exception as e:
        logger.error(f"push_notification_org ERROR: {e}")
