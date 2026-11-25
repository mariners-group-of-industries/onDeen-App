import os
from urllib.parse import urlencode

from flask import has_request_context, request


DEFAULT_PUBLIC_BASE_URL = "https://api-production-517c1.up.railway.app"


def public_base_url():
    base_url = (
        os.getenv("EVENT_WEB_URL")
        or os.getenv("ONDEEN_PUBLIC_BASE_URL")
        or os.getenv("PUBLIC_BASE_URL")
        or os.getenv("UPLOAD_PUBLIC_BASE_URL")
        or os.getenv("RAILWAY_STATIC_URL")
    )

    if not base_url and has_request_context():
        base_url = request.url_root

    base_url = (base_url or DEFAULT_PUBLIC_BASE_URL).strip().rstrip("/")
    if base_url and "://" not in base_url:
        base_url = f"https://{base_url}"
    return base_url


def public_open_url(event_id, **params):
    query = {"id": event_id}
    query.update({key: value for key, value in params.items() if value is not None})
    return f"{public_base_url()}/open?{urlencode(query)}"


def public_open_path_url(event_code):
    return f"{public_base_url()}/open/{event_code}"
