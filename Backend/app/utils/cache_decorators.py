import json
from functools import wraps
from flask import request
from app.utils.redis_cache import get_redis_client


def cache_response(cache_key_func, expiration=60):
    """
    Decorator to cache the response of a route in Redis.
    :param cache_key_func: Function to generate the cache key.
    :param expiration: Cache expiration time in seconds.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Initialize Redis client
            redis_client = get_redis_client()

            # Generate cache key
            cache_key = cache_key_func(*args, **kwargs)

            # Check if the response is already cached
            cached_response = redis_client.get(cache_key)
            if cached_response:
                print("Cache hit")
                # Deserialize cached data from JSON and return
                return json.loads(cached_response)

            print("Cache miss")
            # Call the original function to fetch fresh data
            response_data = func(*args, **kwargs)

            # Serialize and cache the data for future use
            redis_client.set(cache_key, json.dumps(response_data), ex=expiration)

            return response_data

        return wrapper
    return decorator
