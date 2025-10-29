from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import get_current_user
from models.user import User
from services.ai_insights import generate_performance_insights
from database import get_game_stats_collection
from pydantic import BaseModel
from typing import Dict, List

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


class ProgressArea(BaseModel):
    scoring: str
    playmaking: str
    defense: str
    ball_control: str
    rebounding: str


class InsightsResponse(BaseModel):
    takeaway: str
    progress: ProgressArea
    next_steps: List[str]
    generated_at: str
    model: str


@router.post("/generate-insights", response_model=InsightsResponse)
async def generate_insights(current_user: User = Depends(get_current_user)):
    """
    Generate AI-powered performance insights using Gemini 2.5 Flash.
    
    Analyzes the last 10 games and provides:
    - A motivating takeaway summary
    - Progress analysis across 5 key areas
    - 3 actionable next steps
    """
    
    try:
        # Fetch user's last 10 games
        games_cursor = get_game_stats_collection().find(
            {"user_id": current_user.firebase_uid}
        ).sort("date", -1).limit(10)
        games = await games_cursor.to_list(length=10)
        
        # Generate insights
        insights = await generate_performance_insights(games)
        
        return insights
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate insights: {str(e)}"
        )