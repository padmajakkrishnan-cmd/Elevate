from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, field=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class ShareLink(BaseModel):
    """ShareLink model for shareable public reports"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="ID of the user who created the share link")
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