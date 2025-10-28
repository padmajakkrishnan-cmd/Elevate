from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from backend.models.user import PyObjectId


class PlayerProfile(BaseModel):
    """Player profile model for athlete information and statistics"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="Reference to the user who owns this profile")
    name: str = Field(..., description="Player's full name", min_length=1, max_length=100)
    team: Optional[str] = Field(None, description="Player's team name", max_length=100)
    position: Optional[str] = Field(None, description="Player's position", max_length=50)
    age_group: Optional[str] = Field(None, description="Player's age group (e.g., U12, U15, U18)", max_length=20)
    sport: str = Field(..., description="Sport type (e.g., soccer, basketball)", max_length=50)
    height_feet: Optional[int] = Field(None, description="Player's height in feet", ge=1, le=10)
    height_inches: Optional[int] = Field(None, description="Player's height in inches", ge=0, le=11)
    weight: Optional[int] = Field(None, description="Player's weight in pounds", gt=0)
    wingspan_feet: Optional[int] = Field(None, description="Player's wingspan in feet", ge=1, le=10)
    wingspan_inches: Optional[int] = Field(None, description="Player's wingspan in inches", ge=0, le=11)
    total_goals: Optional[int] = Field(0, description="Total goals scored", ge=0)
    bio: Optional[str] = Field(None, description="Player's biography", max_length=500)
    photo: Optional[str] = Field(None, description="URL to player's main profile photo")
    photos: Optional[List[str]] = Field(default_factory=list, description="List of additional photo URLs")
    videos: Optional[List[str]] = Field(default_factory=list, description="List of video URLs")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Profile creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "name": "John Doe",
                "team": "FC Barcelona Youth",
                "position": "Forward",
                "age_group": "U15",
                "sport": "soccer",
                "height_feet": 5,
                "height_inches": 10,
                "weight": 150,
                "wingspan_feet": 6,
                "wingspan_inches": 2,
                "total_goals": 25,
                "bio": "Passionate soccer player with strong technical skills",
                "photo": "https://example.com/photos/profile.jpg",
                "photos": ["https://example.com/photos/action1.jpg", "https://example.com/photos/action2.jpg"],
                "videos": ["https://example.com/videos/highlights.mp4"],
                "created_at": "2025-01-01T00:00:00",
                "updated_at": "2025-01-01T00:00:00"
            }
        }