from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum
from bson import ObjectId
from backend.models.user import PyObjectId


class GoalType(str, Enum):
    """Enum for goal types"""
    PERFORMANCE = "performance"
    SKILL = "skill"
    FITNESS = "fitness"
    TEAM = "team"
    PERSONAL = "personal"


class GoalStatus(str, Enum):
    """Enum for goal status"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class Goal(BaseModel):
    """Goal model for tracking player goals and objectives"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="Reference to the user who owns this goal")
    type: GoalType = Field(..., description="Type of goal (performance, skill, fitness, team, personal)")
    category: str = Field(..., description="Specific category within the goal type", min_length=1, max_length=100)
    title: str = Field(..., description="Goal title", min_length=1, max_length=200)
    description: Optional[str] = Field(None, description="Detailed description of the goal", max_length=1000)
    target_value: float = Field(..., description="Target value to achieve", gt=0)
    current_value: float = Field(default=0.0, description="Current progress value", ge=0)
    metric: str = Field(..., description="Unit of measurement (e.g., goals, minutes, percentage)", min_length=1, max_length=50)
    start_date: date = Field(..., description="Goal start date")
    end_date: date = Field(..., description="Goal target completion date")
    status: GoalStatus = Field(default=GoalStatus.NOT_STARTED, description="Current status of the goal")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Goal creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, date: lambda v: v.isoformat()}
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "type": "performance",
                "category": "Scoring",
                "title": "Score 20 goals this season",
                "description": "Improve my scoring ability by reaching 20 goals before the season ends",
                "target_value": 20.0,
                "current_value": 8.0,
                "metric": "goals",
                "start_date": "2025-01-01",
                "end_date": "2025-06-30",
                "status": "in_progress",
                "created_at": "2025-01-01T00:00:00",
                "updated_at": "2025-01-15T00:00:00"
            }
        }