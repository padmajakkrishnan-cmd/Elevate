from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from security import decode_access_token
from database import get_users_collection
from models.user import User
from firebase_config import verify_firebase_token
import jwt


# HTTP Bearer token scheme for extracting JWT from Authorization header
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    FastAPI dependency to verify JWT token and return the current authenticated user.
    
    This dependency:
    - Extracts the token from the Authorization header
    - Tries to decode as JWT first (for session tokens)
    - Falls back to Firebase token verification if JWT fails
    - Fetches the user from the database using firebase_uid
    - Returns the User object if valid
    - Raises 401 Unauthorized if token is invalid, expired, or user not found
    
    Args:
        credentials: HTTPAuthorizationCredentials from the Authorization header
        
    Returns:
        User: The authenticated user object
        
    Raises:
        HTTPException 401: If token is invalid, expired, or user not found
    """
    token = credentials.credentials
    firebase_uid = None
    
    try:
        # Try to decode as JWT token first (session token)
        payload = decode_access_token(token)
        firebase_uid = payload.get("firebase_uid")
        
        if firebase_uid is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        # If JWT decode fails, try Firebase token verification
        try:
            decoded_token = verify_firebase_token(token)
            firebase_uid = decoded_token.get('uid')
            
            if not firebase_uid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Firebase token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    # Fetch user from database using firebase_uid
    users_collection = get_users_collection()
    user_data = await users_collection.find_one({"firebase_uid": firebase_uid})
    
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convert MongoDB document to User model
    user = User(**user_data)
    return user