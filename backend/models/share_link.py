from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from models.common import PyObjectId


class ShareLink(BaseModel):
    """ShareLink model for shareable public reports"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(..., description="Firebase UID of the user who created the share link")
    token: str = Field(..., description="Unique token for the share link")
    player_name: str = Field(..., description="Name of the player for the shared report")
    view_count: int = Field(default=0, description="Number of times the link has been viewed")
    last_viewed: Optional[datetime] = Field(default=None, description="Timestamp of last view")
    expires_at: Optional[datetime] = Field(default=None, description="Expiration timestamp for the link")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Link creation timestamp")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "token": "abc123xyz789",
                "player_name": "John Doe",
                "view_count": 5,
                "last_viewed": "2025-01-15T10:30:00",
                "expires_at": "2025-02-01T00:00:00",
                "created_at": "2025-01-01T00:00:00"
            }
        }