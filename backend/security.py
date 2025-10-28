from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import jwt
from datetime import datetime, timedelta
from backend.config import settings

# Initialize Argon2 password hasher
ph = PasswordHasher()


def hash_password(password: str) -> str:
    """
    Hash a password using Argon2.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Hashed password string
    """
    return ph.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        password_hash: The hashed password
        password: Plain text password to verify
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        ph.verify(password_hash, password)
        return True
    except VerifyMismatchError:
        return False


def create_access_token(user_id: str, email: str) -> str:
    """
    Create a JWT access token for a user.
    
    Args:
        user_id: User's unique identifier
        email: User's email address
        
    Returns:
        JWT token string
    """
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(seconds=settings.jwt_expires_in),
        "iat": datetime.utcnow()
    }
    
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    return token


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT access token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        jwt.ExpiredSignatureError: If token has expired
        jwt.InvalidTokenError: If token is invalid
    """
    payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    return payload