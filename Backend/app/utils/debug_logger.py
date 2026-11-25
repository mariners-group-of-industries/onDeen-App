import os
import time

from flask import g, request


SENSITIVE_KEYS = {
    "access_token",
    "auth_token",
    "authorization",
    "bearer",
    "client_secret",
    "confirm_password",
    "new_password",
    "old_password",
    "otp",
    "password",
    "payment_intent_id",
    "refresh_token",
    "token",
}


def _debug_enabled():
    return os.getenv("ONDEEN_BACKEND_DEBUG_LOGS", "1").lower() not in {"0", "false", "no", "off"}


def _scope():
    parts = [part for part in request.path.strip("/").split("/") if part]
    if len(parts) >= 2 and parts[0] in {"customer_app", "organizer_app", "admin_app", "speaker_app", "buddy_app"}:
        app_name = parts[0].replace("_app", "")
        return f"{app_name}-{parts[1]}"
    if parts:
        return parts[0].replace("_", "-")
    return "backend"


def _clip(value, limit=180):
    text = str(value)
    if len(text) <= limit:
        return text
    return f"{text[:limit]}...(+{len(text) - limit})"


def _sanitize(value, depth=0):
    if depth > 2:
        return "<nested>"
    if isinstance(value, dict):
        clean = {}
        for key, item in value.items():
            key_text = str(key)
            if key_text.lower() in SENSITIVE_KEYS or any(secret in key_text.lower() for secret in ("password", "token", "secret", "otp")):
                clean[key_text] = "<redacted>"
            else:
                clean[key_text] = _sanitize(item, depth + 1)
        return clean
    if isinstance(value, list):
        if len(value) > 6:
            return [_sanitize(item, depth + 1) for item in value[:6]] + [f"...(+{len(value) - 6})"]
        return [_sanitize(item, depth + 1) for item in value]
    if isinstance(value, str):
        return _clip(value)
    return value


def _payload_summary():
    summary = {}
    if request.args:
        summary["args"] = _sanitize(request.args.to_dict(flat=False))

    json_payload = request.get_json(silent=True)
    if json_payload:
        summary["json"] = _sanitize(json_payload)

    if request.form:
        summary["form"] = _sanitize(request.form.to_dict(flat=False))

    if request.files:
        summary["files"] = sorted(request.files.keys())

    return summary


def start_backend_debug_log():
    if not _debug_enabled() or request.method == "OPTIONS" or request.path.startswith("/static/"):
        return

    g.backend_debug_started_at = time.perf_counter()
    scope = _scope()
    payload = _payload_summary()
    suffix = f" payload={payload}" if payload else ""
    print(
        f"[{scope}] start {request.method} {request.path} endpoint={request.endpoint or '-'} ip={request.remote_addr or '-'}{suffix}",
        flush=True,
    )


def finish_backend_debug_log(response):
    if not _debug_enabled() or request.method == "OPTIONS" or request.path.startswith("/static/"):
        return response

    started_at = getattr(g, "backend_debug_started_at", None)
    duration_ms = ((time.perf_counter() - started_at) * 1000) if started_at else 0
    scope = _scope()
    print(
        f"[{scope}] done {request.method} {request.path} status={response.status_code} duration_ms={duration_ms:.1f}",
        flush=True,
    )
    return response


def exception_backend_debug_log(error):
    if not _debug_enabled() or request.method == "OPTIONS" or request.path.startswith("/static/"):
        return

    scope = _scope()
    print(
        f"[{scope}] error {request.method} {request.path} type={type(error).__name__} message={_clip(error)}",
        flush=True,
    )
