import os
from urllib.parse import quote_plus


def _database_url():
    url = os.getenv('DATABASE_URL')
    if url:
        if url.startswith('postgres://'):
            return url.replace('postgres://', 'postgresql://', 1)
        return url

    password = os.getenv('DATABASE_PASSWORD')
    hostname = os.getenv('DATABASE_HOST')
    database = os.getenv('DATABASE_NAME')
    username = os.getenv('DATABASE_USER', 'admin')
    port = os.getenv('DATABASE_PORT', '3306')

    if all([password, hostname, database]):
        return f"mysql+pymysql://{quote_plus(username)}:{quote_plus(password)}@{hostname}:{port}/{database}"

    if os.getenv('ONDEEN_LOCAL', '0') == '1':
        return 'sqlite:///ondeen-local.db'

    raise RuntimeError('DATABASE_URL is required outside local development.')


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': int(os.getenv('SQLALCHEMY_POOL_RECYCLE', '280')),
    }
    REDIS_URL = os.getenv('REDIS_URL')
    RATELIMIT_STORAGE_URI = os.getenv('RATELIMIT_STORAGE_URI') or REDIS_URL or 'memory://'
