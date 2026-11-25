import base64
import hashlib
import os
from functools import lru_cache

from cryptography.fernet import Fernet


@lru_cache(maxsize=None)
def _cipher(explicit_key, jwt_secret):
    """Fernet cipher used to wrap user ids inside login tokens.

    The key is never stored in source. ONDEEN_ID_ENCRYPTION_KEY (a Fernet key,
    see Fernet.generate_key()) is used when set; otherwise a key is derived from
    JWT_SECRET_KEY, which already protects the same tokens. Rotating either value
    signs every user out.
    """
    if explicit_key:
        return Fernet(explicit_key.encode())
    if jwt_secret:
        derived = hashlib.sha256(f"ondeen-id-encryption:{jwt_secret}".encode()).digest()
        return Fernet(base64.urlsafe_b64encode(derived))
    raise RuntimeError("ONDEEN_ID_ENCRYPTION_KEY or JWT_SECRET_KEY must be configured.")


def _current_cipher():
    return _cipher(
        (os.getenv("ONDEEN_ID_ENCRYPTION_KEY") or "").strip(),
        os.getenv("JWT_SECRET_KEY") or "",
    )


def decrypt_value(encrypted_value):
    return _current_cipher().decrypt(encrypted_value.encode()).decode('utf-8')


def encrypt_value(current_data):
    return _current_cipher().encrypt(str(current_data).encode()).decode('utf-8')


def password_fingerprint(password_hash):
    """Opaque value stored in login tokens instead of the password hash.

    Changing the password changes the fingerprint, so existing sessions stop
    validating, but the token no longer reveals the hash itself.
    """
    import hmac

    secret = (os.getenv("JWT_SECRET_KEY") or "").encode()
    return hmac.new(secret, str(password_hash or "").encode(), hashlib.sha256).hexdigest()[:32]
