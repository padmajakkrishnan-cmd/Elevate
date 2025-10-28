from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime, timedelta
from backend.models.ai_summary import AISummary, PeriodType
from backend.models.game_stat import GameStat
from backend.models.training_session import TrainingSession
from backend.models.goal import Goal
from backend.models.user import User
from backend.database import (
    get_ai_summaries_collection,
    get_game_stats_collection,
    get_training_sessions_collection,
    get_goals_collection
)
from backend.dependencies.auth import get_current_user
from backend.services.insights import generate_insights
from bson import ObjectId

router = APIRouter(prefix="/api/v1/insights", tags=["insights"])


class GenerateInsightsRequest(BaseModel):
    """Request model for generating insights"""
    period: PeriodType = Field(..., description="Time period for analysis (weekly or monthly)")

    class Config:
        json_schema_extra = {
            "example": {
                "period": "weekly"
            }
        }


class AISummaryResponse(BaseModel):
    """Response model for AI summary"""
    id: str = Field(..., description="Summary's unique identifier")
    user_id: str = Field(..., description="Reference to the user who owns this summary")
    period: PeriodType = Field(..., description="Summary period type")
    start_date: str = Field(..., description="Start date of the analysis period")
    end_date: str = Field(..., description="End date of the analysis period")
    insights: List[str] = Field(..., description="List of key insights")
    improvements: List[dict] = Field(..., description="List of improvement suggestions")
    focus_areas: List[str] = Field(..., description="List of recommended focus areas")
    motivational_message: str = Field(..., description="Personalized motivational message")
    created_at: datetime = Field(..., description="Summary creation timestamp")


@router.post("/generate", response_model=AISummaryResponse, status_code=status.HTTP_201_CREATED)
async def generate_ai_insights(
    request: GenerateInsightsRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI insights for the authenticated user based on their performance data.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches all games, training sessions, and goals for the user
    - Filters data based on the requested period (weekly or monthly)
    - Calls the generate_insights service to analyze the data
    - Creates a new AI summary document in the database
    - Returns the newly created AI summary
    
    Args:
        request: GenerateInsightsRequest containing the period type
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        AISummaryResponse with the newly created AI summary data
        
    Raises:
        HTTPException 401: If authentication fails
    """
    # Get database collections
    game_stats_collection = get_game_stats_collection()
    training_sessions_collection = get_training_sessions_collection()
    goals_collection = get_goals_collection()
    ai_summaries_collection = get_ai_summaries_collection()
    
    # Calculate date range based on period
    now = datetime.utcnow()
    if request.period == PeriodType.WEEKLY:
        period_start = now - timedelta(days=7)
    else:  # monthly
        period_start = now - timedelta(days=30)
    
    # Fetch all user's games
    games_cursor = game_stats_collection.find(
        {"user_id": ObjectId(current_user.id)}
    ).sort("date", -1)
    games_data = await games_cursor.to_list(length=None)
    games = [GameStat(**game) for game in games_data]
    
    # Fetch all user's training sessions
    sessions_cursor = training_sessions_collection.find(
        {"user_id": ObjectId(current_user.id)}
    ).sort("date", -1)
    sessions_data = await sessions_cursor.to_list(length=None)
    sessions = [TrainingSession(**session) for session in sessions_data]
    
    # Fetch all user's goals
    goals_cursor = goals_collection.find(
        {"user_id": ObjectId(current_user.id)}
    )
    goals_data = await goals_cursor.to_list(length=None)
    goals = [Goal(**goal) for goal in goals_data]
    
    # Generate insights using the service
    insights_data = generate_insights(
        games=games,
        sessions=sessions,
        goals=goals,
        period=request.period.value
    )
    
    # Create AI summary document
    summary_doc = {
        "user_id": ObjectId(current_user.id),
        "period": request.period.value,
        "start_date": period_start.date(),
        "end_date": now.date(),
        "insights": insights_data["insights"],
        "improvements": insights_data["improvements"],
        "focus_areas": insights_data["focus_areas"],
        "motivational_message": insights_data["motivational_message"],
        "created_at": now
    }
    
    # Insert into database
    result = await ai_summaries_collection.insert_one(summary_doc)
    summary_id = str(result.inserted_id)
    
    # Return the created summary
    return AISummaryResponse(
        id=summary_id,
        user_id=str(current_user.id),
        period=request.period,
        start_date=period_start.date().isoformat(),
        end_date=now.date().isoformat(),
        insights=insights_data["insights"],
        improvements=insights_data["improvements"],
        focus_areas=insights_data["focus_areas"],
        motivational_message=insights_data["motivational_message"],
        created_at=now
    )


@router.get("", response_model=List[AISummaryResponse], status_code=status.HTTP_200_OK)
async def get_all_summaries(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all AI summaries for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches all AI summaries belonging to the current user
    - Sorts summaries by creation date in descending order (newest first)
    - Returns an array of AI summary objects
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        List[AISummaryResponse]: Array of all AI summaries for the user
        
    Raises:
        HTTPException 401: If authentication fails
    """
    # Get database collection
    ai_summaries_collection = get_ai_summaries_collection()
    
    # Fetch all summaries for the current user, sorted by created_at descending
    summaries_cursor = ai_summaries_collection.find(
        {"user_id": ObjectId(current_user.id)}
    ).sort("created_at", -1)
    
    summaries_data = await summaries_cursor.to_list(length=None)
    
    # Convert MongoDB documents to response models
    summaries = []
    for summary_doc in summaries_data:
        summaries.append(AISummaryResponse(
            id=str(summary_doc["_id"]),
            user_id=str(summary_doc["user_id"]),
            period=summary_doc["period"],
            start_date=summary_doc["start_date"].isoformat(),
            end_date=summary_doc["end_date"].isoformat(),
            insights=summary_doc["insights"],
            improvements=summary_doc["improvements"],
            focus_areas=summary_doc["focus_areas"],
            motivational_message=summary_doc["motivational_message"],
            created_at=summary_doc["created_at"]
        ))
    
    return summaries


@router.get("/{id}", response_model=AISummaryResponse, status_code=status.HTTP_200_OK)
async def get_summary_by_id(
    id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a single AI summary by its ID for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches a specific AI summary by its ID
    - Verifies that the summary belongs to the authenticated user
    - Returns 404 if the summary is not found
    - Returns 403 if the summary belongs to a different user
    
    Args:
        id: The unique identifier of the AI summary
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        AISummaryResponse: The requested AI summary
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 404: If the summary is not found
        HTTPException 403: If the summary belongs to a different user
    """
    # Get database collection
    ai_summaries_collection = get_ai_summaries_collection()
    
    # Validate ObjectId format
    try:
        summary_id = ObjectId(id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    
    # Fetch the summary by ID
    summary_doc = await ai_summaries_collection.find_one({"_id": summary_id})
    
    # Check if summary exists
    if not summary_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    
    # Verify ownership - check if the summary belongs to the current user
    if str(summary_doc["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this summary"
        )
    
    # Return the summary
    return AISummaryResponse(
        id=str(summary_doc["_id"]),
        user_id=str(summary_doc["user_id"]),
        period=summary_doc["period"],
        start_date=summary_doc["start_date"].isoformat(),
        end_date=summary_doc["end_date"].isoformat(),
        insights=summary_doc["insights"],
        improvements=summary_doc["improvements"],
        focus_areas=summary_doc["focus_areas"],
        motivational_message=summary_doc["motivational_message"],
        created_at=summary_doc["created_at"]
    )