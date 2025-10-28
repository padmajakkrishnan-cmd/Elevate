from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field, field_validator
from backend.models.user import User
from backend.database import get_users_collection
from backend.security import hash_password, create_access_token, verify_password
from backend.dependencies.auth import get_current_user
from backend.config import settings
from datetime import datetime
from backend.firebase_config import verify_firebase_token

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


class SignupRequest(BaseModel):
    """Request model for user signup"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password (minimum 8 characters)")
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class SignupResponse(BaseModel):
    """Response model for successful signup"""
    id: str = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    access_token: str = Field(..., description="JWT access token")


class LoginRequest(BaseModel):
    """Request model for user login"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class LoginResponse(BaseModel):
    """Response model for successful login"""
    id: str = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    access_token: str = Field(..., description="JWT access token")


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest):
    """
    Register a new user account.
    
    This endpoint:
    - Validates the email is not already in use
    - Validates the password is at least 8 characters
    - Hashes the password using Argon2
    - Creates a new user document in the database
    - Generates and returns a JWT token
    
    Args:
        request: SignupRequest containing email and password
        
    Returns:
        SignupResponse with user id, email, and JWT token
        
    Raises:
        HTTPException 400: If email is already registered
        HTTPException 422: If validation fails
    """
    users_collection = get_users_collection()
    
    # Check if email already exists
    existing_user = await users_collection.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    password_hash = hash_password(request.password)
    
    # Create new user document
    now = datetime.utcnow()
    user_data = {
        "email": request.email,
        "password_hash": password_hash,
        "created_at": now,
        "updated_at": now
    }
    
    # Insert user into database
    result = await users_collection.insert_one(user_data)
    user_id = str(result.inserted_id)
    
    # Generate JWT token
    token = create_access_token(user_id=user_id, email=request.email)
    
    # Return user info and token
    return SignupResponse(
        id=user_id,
        email=request.email,
        access_token=token
    )


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(request: LoginRequest):
    """
    Authenticate a user and return a JWT token.
    
    This endpoint:
    - Finds the user by email in the database
    - Verifies the provided password against the stored hash using Argon2
    - Generates and returns a JWT token if credentials are valid
    
    Args:
        request: LoginRequest containing email and password
        
    Returns:
        LoginResponse with user id, email, and JWT token
        
    Raises:
        HTTPException 401: If email is not found or password is incorrect
    """
    users_collection = get_users_collection()
    
    # Find user by email
    user = await users_collection.find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(user["password_hash"], request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate JWT token
    user_id = str(user["_id"])
    token = create_access_token(user_id=user_id, email=user["email"])
    
    # Return user info and token
    return LoginResponse(
        id=user_id,
        email=user["email"],
        access_token=token
    )


class LogoutResponse(BaseModel):
    """Response model for successful logout"""
    message: str = Field(..., description="Logout confirmation message")


@router.post("/logout", response_model=LogoutResponse, status_code=status.HTTP_200_OK)
async def logout():
    """
    Log out the current user.
    
    Since JWT tokens are stateless, this endpoint simply returns a success message.
    The actual token removal is handled by the frontend by clearing the stored token.
    
    This endpoint does not require authentication as the logout action is performed
    client-side by removing the token from storage.
    
    Returns:
        LogoutResponse with a success message
    """
    return LogoutResponse(message="Logged out successfully")


class MeResponse(BaseModel):
    """Response model for current user information"""
    id: str = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    created_at: datetime = Field(..., description="Account creation timestamp")


@router.get("/me", response_model=MeResponse, status_code=status.HTTP_200_OK)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's information.
    
    This endpoint is protected and requires a valid JWT token in the Authorization header.
    It returns the authenticated user's id, email, and account creation timestamp.
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        MeResponse with user's id, email, and created_at timestamp
        
    Raises:
        HTTPException 401: If token is invalid, expired, or user not found
    """
    return MeResponse(
        id=str(current_user.id),
        email=current_user.email,
        created_at=current_user.created_at
    )


class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth authentication"""
    credential: str = Field(..., description="Google ID token")


class GoogleAuthResponse(BaseModel):
    """Response model for successful Google authentication"""
    id: str = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    access_token: str = Field(..., description="JWT access token")
    is_new_user: bool = Field(..., description="Whether this is a newly created user")


@router.post("/google", response_model=GoogleAuthResponse, status_code=status.HTTP_200_OK)
async def google_auth(request: GoogleAuthRequest):
    """
    Authenticate or register a user using Google OAuth.
    
    This endpoint:
    - Verifies the Google ID token
    - Extracts user information (email, Google ID)
    - Creates a new user if they don't exist
    - Returns a JWT token for the user
    
    Args:
        request: GoogleAuthRequest containing the Google credential token
        
    Returns:
        GoogleAuthResponse with user id, email, JWT token, and new user flag
        
    Raises:
        HTTPException 401: If the Google token is invalid
        HTTPException 500: If there's an error during authentication
    """
    try:
        # Verify the Firebase ID token
        decoded_token = verify_firebase_token(request.credential)
        
        # Extract user information
        email = decoded_token.get('email')
        user_id = decoded_token.get('uid')
        
        if not email or not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token"
            )
        
        users_collection = get_users_collection()
        
        # Check if user exists
        user = await users_collection.find_one({
            "$or": [
                {"email": email},
                {"oauth_id": user_id, "oauth_provider": "google"}
            ]
        })
        
        is_new_user = False
        now = datetime.utcnow()
        
        if user:
            # Update existing user with OAuth info if needed
            if not user.get("oauth_provider"):
                await users_collection.update_one(
                    {"_id": user["_id"]},
                    {
                        "$set": {
                            "oauth_provider": "google",
                            "oauth_id": user_id,
                            "updated_at": now
                        }
                    }
                )
            user_id = str(user["_id"])
        else:
            # Create new user
            is_new_user = True
            user_data = {
                "email": email,
                "oauth_provider": "google",
                "oauth_id": user_id,
                "password_hash": None,
                "created_at": now,
                "updated_at": now
            }
            
            result = await users_collection.insert_one(user_data)
            user_id = str(result.inserted_id)
        
        # Generate JWT token
        token = create_access_token(user_id=user_id, email=email)
        
        return GoogleAuthResponse(
            id=user_id,
            email=email,
            access_token=token,
            is_new_user=is_new_user
        )
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}"
        )
    except Exception as e:
        # Other errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )