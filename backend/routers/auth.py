from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field, field_validator
from models.user import User
from database import get_users_collection
from security import create_access_token
from dependencies.auth import get_current_user
from config import settings
from datetime import datetime
from firebase_config import verify_firebase_token
from firebase_admin import auth as firebase_auth

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
    id: str = Field(..., description="Firebase UID")
    email: str = Field(..., description="User's email address")
    access_token: str = Field(..., description="JWT access token")


class LoginRequest(BaseModel):
    """Request model for user login - accepts Firebase ID token"""
    id_token: str = Field(..., description="Firebase ID token from client-side authentication")


class LoginResponse(BaseModel):
    """Response model for successful login"""
    id: str = Field(..., description="Firebase UID")
    email: str = Field(..., description="User's email address")
    access_token: str = Field(..., description="JWT access token")


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest):
    """
    Register a new user account using Firebase Authentication.
    
    This endpoint:
    - Creates a user in Firebase Authentication
    - Stores user metadata in MongoDB
    - Generates and returns a JWT token
    
    Args:
        request: SignupRequest containing email and password
        
    Returns:
        SignupResponse with Firebase UID, email, and JWT token
        
    Raises:
        HTTPException 400: If email is already registered
        HTTPException 500: If Firebase user creation fails
    """
    try:
        # Create user in Firebase
        firebase_user = firebase_auth.create_user(
            email=request.email,
            password=request.password
        )
        
        firebase_uid = firebase_user.uid
        
        # Store user metadata in MongoDB
        users_collection = get_users_collection()
        now = datetime.utcnow()
        user_data = {
            "firebase_uid": firebase_uid,
            "email": request.email,
            "oauth_provider": "password",
            "created_at": now,
            "updated_at": now
        }
        
        await users_collection.insert_one(user_data)
        
        # Generate JWT token
        token = create_access_token(firebase_uid=firebase_uid, email=request.email)
        
        return SignupResponse(
            id=firebase_uid,
            email=request.email,
            access_token=token
        )
        
    except firebase_auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(request: LoginRequest):
    """
    Authenticate a user using Firebase ID token.
    
    This endpoint:
    - Verifies the Firebase ID token
    - Looks up user in MongoDB
    - Generates and returns a JWT session token
    
    Note: Password verification is handled by Firebase Client SDK on the frontend.
    This endpoint receives an already-verified Firebase ID token.
    
    Args:
        request: LoginRequest containing Firebase ID token
        
    Returns:
        LoginResponse with Firebase UID, email, and JWT token
        
    Raises:
        HTTPException 401: If token is invalid
        HTTPException 404: If user not found in database
    """
    try:
        # Verify Firebase ID token
        decoded_token = verify_firebase_token(request.id_token)
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        
        if not firebase_uid or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token"
            )
        
        # Look up user in MongoDB
        users_collection = get_users_collection()
        user = await users_collection.find_one({"firebase_uid": firebase_uid})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database"
            )
        
        # Generate JWT session token
        token = create_access_token(firebase_uid=firebase_uid, email=email)
        
        return LoginResponse(
            id=firebase_uid,
            email=email,
            access_token=token
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
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
    id: str = Field(..., description="Firebase UID")
    email: str = Field(..., description="User's email address")
    created_at: datetime = Field(..., description="Account creation timestamp")


@router.get("/me", response_model=MeResponse, status_code=status.HTTP_200_OK)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's information.
    
    This endpoint is protected and requires a valid JWT token in the Authorization header.
    It returns the authenticated user's Firebase UID, email, and account creation timestamp.
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        MeResponse with user's Firebase UID, email, and created_at timestamp
        
    Raises:
        HTTPException 401: If token is invalid, expired, or user not found
    """
    return MeResponse(
        id=current_user.firebase_uid,
        email=current_user.email,
        created_at=current_user.created_at
    )


class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth authentication"""
    credential: str = Field(..., description="Google ID token")


class GoogleAuthResponse(BaseModel):
    """Response model for successful Google authentication"""
    id: str = Field(..., description="Firebase UID")
    email: str = Field(..., description="User's email address")
    access_token: str = Field(..., description="JWT access token")
    is_new_user: bool = Field(..., description="Whether this is a newly created user")


@router.post("/google", response_model=GoogleAuthResponse, status_code=status.HTTP_200_OK)
async def google_auth(request: GoogleAuthRequest):
    """
    Authenticate or register a user using Google OAuth via Firebase.
    
    This endpoint:
    - Verifies the Firebase ID token (from Google Sign-In)
    - Extracts user information (email, Firebase UID)
    - Creates a new user in MongoDB if they don't exist
    - Returns a JWT token for the user
    
    Args:
        request: GoogleAuthRequest containing the Firebase credential token
        
    Returns:
        GoogleAuthResponse with Firebase UID, email, JWT token, and new user flag
        
    Raises:
        HTTPException 401: If the Firebase token is invalid
        HTTPException 500: If there's an error during authentication
    """
    try:
        # Verify the Firebase ID token
        decoded_token = verify_firebase_token(request.credential)
        
        # Extract user information
        email = decoded_token.get('email')
        firebase_uid = decoded_token.get('uid')
        
        if not email or not firebase_uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token"
            )
        
        users_collection = get_users_collection()
        
        # Check if user exists by firebase_uid
        user = await users_collection.find_one({"firebase_uid": firebase_uid})
        
        is_new_user = False
        now = datetime.utcnow()
        
        if user:
            # Update existing user if needed
            if not user.get("oauth_provider") or user.get("oauth_provider") != "google":
                await users_collection.update_one(
                    {"firebase_uid": firebase_uid},
                    {
                        "$set": {
                            "oauth_provider": "google",
                            "updated_at": now
                        }
                    }
                )
        else:
            # Create new user
            is_new_user = True
            user_data = {
                "firebase_uid": firebase_uid,
                "email": email,
                "oauth_provider": "google",
                "created_at": now,
                "updated_at": now
            }
            
            await users_collection.insert_one(user_data)
        
        # Generate JWT token
        token = create_access_token(firebase_uid=firebase_uid, email=email)
        
        return GoogleAuthResponse(
            id=firebase_uid,
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
    except HTTPException:
        raise
    except Exception as e:
        # Other errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )