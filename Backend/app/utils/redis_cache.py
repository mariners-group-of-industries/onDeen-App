from redis import Redis
from flask import current_app
import os


class NullRedis:
    def get(self, *args, **kwargs):
        return None

    def set(self, *args, **kwargs):
        return True

    def scan(self, *args, **kwargs):
        return 0, []

    def delete(self, *args, **kwargs):
        return 0

def get_redis_client():
    """Return a Redis client instance using Flask app config."""
    redis_url = current_app.config.get('REDIS_URL') or os.getenv('REDIS_URL')
    if redis_url:
        return Redis.from_url(redis_url, decode_responses=True)

    redis_host = current_app.config.get('REDIS_HOST') or os.getenv('REDIS_HOST')
    if not redis_host:
        return NullRedis()

    return Redis(
        host=redis_host,
        port=int(current_app.config.get('REDIS_PORT') or os.getenv('REDIS_PORT', 6379)),
        db=int(current_app.config.get('REDIS_DB') or os.getenv('REDIS_DB', 0)),
        decode_responses=True,
     )




def delete_keys_by_pattern(pattern):
    """Delete all keys matching the given pattern."""
    redis_client = get_redis_client()  # Get the Redis client
    
    # Use SCAN to iterate through keys and delete them
    cursor = 0
    while True:
        cursor, keys = redis_client.scan(cursor, match=pattern)
        
        # Delete all keys in the current scan batch
        if keys:
            redis_client.delete(*keys)
        
        # If the cursor is 0, we are done iterating through all keys
        if cursor == 0:
            break

    return len(keys)  # Return the number of deleted keys
