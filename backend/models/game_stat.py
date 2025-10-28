from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from datetime import date as date_type
from bson import ObjectId
from backend.models.user import PyObjectId


class GameStat(BaseModel):
    """Game statistics model for tracking player performance in games"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="Reference to the user who owns this game stat")
    date: date_type = Field(..., description="Date of the game")
    opponent: str = Field(..., description="Opponent team name", min_length=1, max_length=100)
    points: int = Field(0, description="Points scored", ge=0)
    assists: int = Field(0, description="Assists made", ge=0)
    rebounds: int = Field(0, description="Rebounds collected", ge=0)
    steals: int = Field(0, description="Steals made", ge=0)
    blocks: int = Field(0, description="Blocks made", ge=0)
    turnovers: int = Field(0, description="Turnovers committed", ge=0)
    minutes: float = Field(0.0, description="Minutes played", ge=0)
    custom_stats: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom statistics specific to sport or user preference")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, date_type: lambda v: v.isoformat()}
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "date": "2025-01-15",
                "opponent": "Lakers",
                "points": 24,
                "assists": 8,
                "rebounds": 6,
                "steals": 3,
                "blocks": 1,
                "turnovers": 2,
                "minutes": 32.5,
                "custom_stats": {
                    "three_pointers": 3,
                    "free_throws": 6,
                    "field_goal_percentage": 52.5
                },
                "created_at": "2025-01-15T20:00:00",
                "updated_at": "2025-01-15T20:00:00"
            }
        }