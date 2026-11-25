from dotenv import load_dotenv
from flask_cors import CORS
import os

repo_dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
prod_dotenv_path = os.getenv('ONDEEN_DOTENV')

load_dotenv(repo_dotenv_path)
if prod_dotenv_path:
    load_dotenv(prod_dotenv_path)

os.environ.setdefault('d_t_z', os.getenv('TZ', 'Africa/Casablanca'))

from app import on_deen

app = on_deen()

def _cors_origins():
    """Browser origins allowed to call the API (the admin console).

    Native mobile apps are not subject to CORS. Set CORS_ALLOWED_ORIGINS to a
    comma-separated list, e.g. the deployed admin console URL. Local runs also
    allow the console on localhost.
    """
    configured = [
        origin.strip().rstrip('/')
        for origin in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
        if origin.strip()
    ]
    if os.getenv('ONDEEN_LOCAL', '0') == '1':
        configured += [
            'http://localhost:8080', 'http://127.0.0.1:8080',
            'http://localhost:3000', 'http://127.0.0.1:3000',
        ]
    return configured


# Auth uses Authorization/Auth-Token headers, not cookies, so credentials are
# not needed and wildcard origins are no longer used.
CORS(app, origins=_cors_origins(), supports_credentials=False)


if __name__ == "__main__":
    app.run(host=os.getenv('FLASK_RUN_HOST', '127.0.0.1'), port=int(os.getenv('FLASK_RUN_PORT', '8080')), debug=False)
