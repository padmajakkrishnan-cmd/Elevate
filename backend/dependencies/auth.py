from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.security import decode_access_token
from backend.database import get_users_collection
from backend.models.user import User
from bson import ObjectId
import jwt


# HTTP Bearer token scheme for extracting JWT from Authorization header
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    FastAPI dependency to verify JWT token and return the current authenticated user.
    
    This dependency:
    - Extracts the JWT token from the Authorization header
    - Decodes and validates the token using the secret key
    - Extracts the user ID from the token's payload
    - Fetches the user from the database
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
    
    try:
        # Decode and verify the JWT token
        payload = decode_access_token(token)
        user_id = payload.get("user_id")
        
        if user_id is None:
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    users_collection = get_users_collection()
    user_data = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convert MongoDB document to User model
    user = User(**user_data)
    return user