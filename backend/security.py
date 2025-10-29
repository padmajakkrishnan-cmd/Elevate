import jwt
from datetime import datetime, timedelta
from config import settings


def create_access_token(firebase_uid: str, email: str) -> str:
    """
    Create a JWT access token for a user.
    
    Args:
        firebase_uid: User's Firebase UID
        email: User's email address
        
    Returns:
        JWT token string
    """
    payload = {
        "firebase_uid": firebase_uid,
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