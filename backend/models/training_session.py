from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from datetime import date as date_type
from bson import ObjectId
from models.common import PyObjectId


class TrainingSession(BaseModel):
    """Training session model for tracking player training activities"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(..., description="Firebase UID of the user who owns this training session")
    date: date_type = Field(..., description="Date of the training session")
    drill_type: str = Field(..., description="Type of drill performed", min_length=1, max_length=100)
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Training metrics and measurements")
    notes: Optional[str] = Field(None, description="Additional notes about the training session", max_length=1000)
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
                "drill_type": "Shooting Practice",
                "metrics": {
                    "shots_attempted": 100,
                    "shots_made": 75,
                    "accuracy": 75.0,
                    "duration_minutes": 45
                },
                "notes": "Focused on three-point shooting from the corners",
                "created_at": "2025-01-15T18:00:00",
                "updated_at": "2025-01-15T18:00:00"
            }
        }