from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
from bson import ObjectId
from backend.models.user import PyObjectId


class PeriodType(str, Enum):
    """Enum for summary period types"""
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class Improvement(BaseModel):
    """Model for improvement suggestions"""
    area: str = Field(..., description="Area of improvement", min_length=1, max_length=100)
    suggestion: str = Field(..., description="Specific suggestion for improvement", min_length=1, max_length=500)
    priority: Optional[str] = Field(None, description="Priority level (high, medium, low)", max_length=20)

    class Config:
        json_schema_extra = {
            "example": {
                "area": "Passing Accuracy",
                "suggestion": "Focus on short passes during training to improve accuracy",
                "priority": "high"
            }
        }


class AISummary(BaseModel):
    """AI-generated summary model for player performance analysis"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="Reference to the user who owns this summary")
    period: PeriodType = Field(..., description="Summary period type (weekly or monthly)")
    start_date: date = Field(..., description="Start date of the analysis period")
    end_date: date = Field(..., description="End date of the analysis period")
    insights: List[str] = Field(default_factory=list, description="List of key insights from the analysis")
    improvements: List[Improvement] = Field(default_factory=list, description="List of improvement suggestions")
    focus_areas: List[str] = Field(default_factory=list, description="List of recommended focus areas")
    motivational_message: str = Field(..., description="Personalized motivational message", min_length=1, max_length=1000)
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Summary creation timestamp")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, date: lambda v: v.isoformat()}
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "period": "weekly",
                "start_date": "2025-01-15",
                "end_date": "2025-01-21",
                "insights": [
                    "Your passing accuracy improved by 15% this week",
                    "You completed 3 training sessions, maintaining consistency",
                    "Goal progress: 40% towards your season target"
                ],
                "improvements": [
                    {
                        "area": "Shooting Accuracy",
                        "suggestion": "Practice shooting drills focusing on placement over power",
                        "priority": "high"
                    },
                    {
                        "area": "Stamina",
                        "suggestion": "Add 10 minutes of cardio to your training routine",
                        "priority": "medium"
                    }
                ],
                "focus_areas": [
                    "Shooting technique",
                    "Endurance training",
                    "Tactical positioning"
                ],
                "motivational_message": "Great progress this week! Your dedication to training is paying off. Keep pushing towards your goals!",
                "created_at": "2025-01-22T00:00:00"
            }
        }