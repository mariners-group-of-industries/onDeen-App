from flask import Flask, abort, request, send_from_directory
from flask_jwt_extended import JWTManager, decode_token
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import base64
import html
import json
from .config import Config
from .utils.debug_logger import (
    exception_backend_debug_log,
    finish_backend_debug_log,
    start_backend_debug_log,
)
from .utils.logging_config import configure_logging
from .utils.scheduler import configure_scheduler

# Initialize SQLAlchemy and Migrate instances for database handling
db = SQLAlchemy()
migrate = Migrate()

# Function to create and configure the Flask application
def on_deen():
    app = Flask(__name__)  # Create a Flask application instance
    
    app.config.from_object(Config)  # Load configuration settings from the Config class
    app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024  # 10 MB
    
    db.init_app(app)  # Initialize the SQLAlchemy instance with the app
    migrate.init_app(app, db)  # Initialize the Migrate instance with the app and database
    
    jwt = JWTManager(app)  # Initialize JWT Manager for handling JWT tokens


    limiter = Limiter(
        get_remote_address,  # Use the client's IP address for rate limiting
        app=app,  # Attach to the app instance
        storage_uri=app.config['RATELIMIT_STORAGE_URI'],
        default_limits=["100 per minute"],  # Global default limit: 100 requests per minute
    )
    
    # Register the auth blueprint, which handles authentication routes
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)
    limiter.limit("50 per minute")(auth_blueprint)

    from .payment import payment as payment_blueprint
    app.register_blueprint(payment_blueprint, url_prefix='/payment')
    limiter.limit("60 per minute")(payment_blueprint)
    
    

    from .file_upload import file_upload as file_upload_blueprint
    app.register_blueprint(file_upload_blueprint)
    limiter.limit("5 per minute")(file_upload_blueprint)
    
    # Register the customer_app blueprint with a URL prefix
    from .customer_app import customer_app as customer_blueprint
    app.register_blueprint(customer_blueprint, url_prefix='/customer_app/')
    limiter.limit("50 per minute")(customer_blueprint)
    
    
    # Register the customer_app blueprint with a URL prefix
    from .organizer_app import organizer_app as organizer_blueprint
    app.register_blueprint(organizer_blueprint, url_prefix='/organizer_app/')
    limiter.limit("500 per minute")(organizer_blueprint)
    
    # Register the admin_app blueprint with a URL prefix
    from .admin_app import admin_app as admin_blueprint
    app.register_blueprint(admin_blueprint, url_prefix='/admin_app/')
    limiter.limit("50 per minute")(admin_blueprint)

    from .speaker_app import speaker_app as speaker_blueprint
    app.register_blueprint(speaker_blueprint, url_prefix='/speaker_app/')
    limiter.limit("500 per minute")(speaker_blueprint)

    from .buddy_app import buddy_app as buddy_blueprint
    app.register_blueprint(buddy_blueprint, url_prefix='/buddy_app/')
    limiter.limit("500 per minute")(buddy_blueprint)

    @app.route('/open')
    @app.route('/open/<event_code>')
    def open_event_link(event_code=None):
        event_id = request.args.get('id') or request.args.get('event_id') or event_code
        if event_code and event_id == event_code:
            try:
                event_id = base64.b64decode(event_code).decode('utf-8')
            except Exception:
                event_id = event_code

        try:
            event_id = int(event_id)
        except (TypeError, ValueError):
            abort(404)

        from .models.event import Event

        event = Event.query.filter(Event.id == event_id, Event.status != 3).first()
        if not event:
            abort(404)

        title = html.escape(event.title or 'OnDeen event')
        description = html.escape((event.description or '').replace('<p>', '').replace('</p>', '')[:180])
        app_url = f"ondeen://open?id={event.id}"
        guest_url = f"ondeen://open?id={event.id}&guest=1"
        android_app_url = f"intent://open?id={event.id}#Intent;scheme=ondeen;package=com.ondeen.user;end"
        android_guest_url = f"intent://open?id={event.id}&guest=1#Intent;scheme=ondeen;package=com.ondeen.user;end"

        return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>
    body {{ margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#fdfbff; color:#17101f; }}
    main {{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }}
    section {{ max-width:520px; background:#fff; border:1px solid #eadff4; border-radius:24px; padding:28px; box-shadow:0 12px 32px rgba(62,20,111,.12); }}
    h1 {{ margin:0 0 12px; font-size:30px; line-height:1.1; }}
    p {{ margin:0 0 24px; color:#5f5868; line-height:1.5; }}
    a {{ display:block; text-align:center; border-radius:999px; padding:15px 18px; margin-top:12px; font-weight:700; text-decoration:none; }}
    .primary {{ color:white; background:linear-gradient(90deg,#ffcc33,#db3171,#3e146f); }}
    .secondary {{ color:#3e146f; border:1px solid #3e146f; }}
    .hint {{ margin-top:16px; font-size:14px; color:#81788d; text-align:center; }}
  </style>
  <script>
    function openOnDeen(guest) {{
      var android = /Android/i.test(navigator.userAgent || '');
      var appUrl = guest ? {json.dumps(guest_url)} : {json.dumps(app_url)};
      var androidUrl = guest ? {json.dumps(android_guest_url)} : {json.dumps(android_app_url)};
      window.location.href = android ? androidUrl : appUrl;
      return false;
    }}
    window.setTimeout(function () {{
      openOnDeen(false);
    }}, 600);
  </script>
</head>
<body>
  <main>
    <section>
      <h1>{title}</h1>
      <p>{description or 'Open this event in OnDeen to view details and book your place.'}</p>
      <a class="primary" href="{html.escape(app_url, quote=True)}" onclick="return openOnDeen(false)">Open in app</a>
      <a class="secondary" href="{html.escape(guest_url, quote=True)}" onclick="return openOnDeen(true)">Book as guest</a>
      <div class="hint">If the app does not open automatically, use one of the buttons above.</div>
    </section>
  </main>
</body>
</html>"""

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        upload_root = os.getenv(
            'UPLOAD_ROOT',
            os.path.join(os.path.dirname(__file__), 'static', 'uploads'),
        )
        return send_from_directory(upload_root, filename)
   
    # Configure logging for the app using a custom logging configuration
    configure_logging(app, 'ondeen')
    
    
 
    if os.getenv('ENABLE_SCHEDULER', 'true').lower() in {'1', 'true', 'yes'}:
        with app.app_context():
            configure_scheduler(app)
    
    # Flask Middleware
    @app.before_request
    def check_auth():
        start_backend_debug_log()

        if request.method == 'OPTIONS':
            return  # Skip the authorization check for preflight requests

        ignored_blueprints = ['auth']
        if request.blueprint in ignored_blueprints:
            return # Skip the authorization check for Auth Blueprint

        # Railway keeps its schema between releases; apply additive ticket
        # capacity compatibility before any route can select EventTicket.
        from .services.event_ticket_storage import ensure_event_ticket_storage
        ensure_event_ticket_storage()
        from .services.notification_preference_storage import ensure_notification_preference_storage
        ensure_notification_preference_storage()
        from .services.organizer_application_storage import ensure_organizer_application_storage
        ensure_organizer_application_storage()
        from .services.payment import PaymentService
        PaymentService.ensure_storage()
        
        auth_token = request.headers.get('Auth-Token')
        # if auth_token is None:
            # abort(403)
        # try:
            # decoded_token = decode_token(auth_token)
            # if decoded_token.get('token_type') != 'auth':
                # abort(403)
        # except Exception as e:
            # abort(403) 

    @app.after_request
    def log_response(response):
        return finish_backend_debug_log(response)

    @app.teardown_request
    def log_exception(error=None):
        if error is not None:
            exception_backend_debug_log(error)

    return app
