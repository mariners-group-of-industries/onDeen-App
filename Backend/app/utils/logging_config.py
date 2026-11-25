import os
import logging
from logging.handlers import RotatingFileHandler

def configure_logging(app, project):
    # Create log directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(__file__), '..', 'logs')
    os.makedirs(log_dir, exist_ok=True)

    # Configure logging
    if project == 'ondeen':
        log_file_path = os.path.join(log_dir, 'ondeen.log')
        handler = RotatingFileHandler(log_file_path, maxBytes=10000, backupCount=1)
        handler.setLevel(logging.ERROR)  # Set the desired log level
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)

        # Remove existing handlers to prevent duplicates
        for h in app.logger.handlers:
            app.logger.removeHandler(h)

        app.logger.addHandler(handler)
        app.logger.setLevel(logging.ERROR)
