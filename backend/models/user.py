from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class User(BaseModel):
    """User model for authentication and profile management with Firebase"""
    firebase_uid: str = Field(..., description="Firebase user ID (primary identifier)")
    email: EmailStr = Field(..., description="User's email address")
    oauth_provider: Optional[str] = Field(None, description="OAuth provider (e.g., 'google', 'password')")
    oauth_id: Optional[str] = Field(None, description="OAuth provider user ID (for non-Firebase OAuth)")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Account creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "firebase_uid": "firebase_user_id_123",
                "email": "user@example.com",
                "oauth_provider": "password",
                "created_at": "2025-01-01T00:00:00",
                "updated_at": "2025-01-01T00:00:00"
            }
        }