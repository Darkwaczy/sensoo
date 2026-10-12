from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
from typing import Any, Dict, Optional
import jwt


def get_password_hash(password: str) -> str:
    """Hashes password with PBKDF2-HMAC-SHA256 (standard cryptographically secure hash)."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"pbkdf2:sha256:100000${salt.hex()}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against hashed string."""
    try:
        parts = hashed_password.split("$")
        if len(parts) == 3 and parts[0] == "pbkdf2:sha256:100000":
            salt = bytes.fromhex(parts[1])
            expected_key = bytes.fromhex(parts[2])
            key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
            return hmac.compare_digest(key, expected_key)
        # Fallback to direct sha256 check
        return hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == hashed_password
    except Exception:
        return False


def create_access_token(
    subject: str,
    secret_key: str,
    expires_delta: Optional[timedelta] = None,
    claims: Optional[Dict[str, Any]] = None,
) -> str:
    """Creates HS256 JWT access token adhering to MSFLib specification."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=30)
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "iat": now,
    }
    if claims:
        to_encode.update(claims)
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm="HS256")
    return encoded_jwt


def decode_access_token(token: str, secret_key: str) -> Dict[str, Any]:
    """Decodes and validates HS256 JWT."""
    return jwt.decode(token, secret_key, algorithms=["HS256"])
