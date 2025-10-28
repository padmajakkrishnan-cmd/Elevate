"""
Insights generation service for analyzing user performance data.
This module provides rule-based analysis of games, training sessions, and goals
to generate actionable insights, improvements, focus areas, and motivational messages.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
from backend.models.game_stat import GameStat
from backend.models.training_session import TrainingSession
from backend.models.goal import Goal


def generate_insights(
    games: List[GameStat],
    sessions: List[TrainingSession],
    goals: List[Goal],
    period: str = "weekly"
) -> Dict[str, Any]:
    """
    Generate insights from user's performance data.
    
    Args:
        games: List of game statistics
        sessions: List of training sessions
        goals: List of user goals
        period: Time period for analysis ('weekly' or 'monthly')
    
    Returns:
        Dictionary containing:
        - insights: List of textual insights about activity
        - improvements: List of metric improvements with change percentages
        - focus_areas: List of areas needing attention
        - motivational_message: Personalized motivational message
    """
    # Filter data by period
    now = datetime.utcnow()
    if period == "weekly":
        period_start = now - timedelta(days=7)
    else:  # monthly
        period_start = now - timedelta(days=30)
    
    # Filter games and sessions within the period
    period_games = [g for g in games if datetime.combine(g.date, datetime.min.time()) >= period_start]
    period_sessions = [s for s in sessions if datetime.combine(s.date, datetime.min.time()) >= period_start]
    
    # Calculate improvements
    improvements = _calculate_improvements(period_games, period_sessions, period)
    
    # Generate textual insights
    insights = _generate_textual_insights(period_games, period_sessions, period)
    
    # Identify focus areas
    focus_areas = _identify_focus_areas(period_games, period_sessions)
    
    # Create motivational message
    motivational_message = _create_motivational_message(improvements, period_games, period_sessions)
    
    return {
        "insights": insights,
        "improvements": improvements,
        "focus_areas": focus_areas,
        "motivational_message": motivational_message
    }


def _calculate_improvements(
    period_games: List[GameStat],
    period_sessions: List[TrainingSession],
    period: str
) -> List[Dict[str, Any]]:
    """Calculate improvements in key metrics."""
    improvements = []
    
    # Points improvement
    if len(period_games) >= 2:
        split_point = len(period_games) // 2
        recent_games = period_games[:split_point] if split_point > 0 else period_games
        older_games = period_games[split_point:] if split_point > 0 else []
        
        if recent_games and older_games:
            recent_avg = sum(g.points for g in recent_games) / len(recent_games)
            older_avg = sum(g.points for g in older_games) / len(older_games)
            
            if older_avg > 0:
                change = ((recent_avg - older_avg) / older_avg) * 100
                
                if abs(change) > 5:
                    improvements.append({
                        "metric": "Points Per Game",
                        "change": round(change),
                        "description": (
                            f"Your scoring improved by {round(change)}% this {period}!"
                            if change > 0
                            else f"Your scoring decreased by {abs(round(change))}% - let's work on getting back on track."
                        )
                    })
    
    # Shooting improvement from training sessions
    shooting_sessions = [
        s for s in period_sessions
        if s.metrics.get("freeThrowPercentage") or s.metrics.get("threePointPercentage")
    ]
    
    if len(shooting_sessions) >= 2:
        split_point = len(shooting_sessions) // 2
        recent_shooting = shooting_sessions[:split_point] if split_point > 0 else shooting_sessions
        older_shooting = shooting_sessions[split_point:] if split_point > 0 else []
        
        if recent_shooting and older_shooting:
            # Free throw improvement
            recent_ft_sessions = [s for s in recent_shooting if s.metrics.get("freeThrowPercentage")]
            older_ft_sessions = [s for s in older_shooting if s.metrics.get("freeThrowPercentage")]
            
            if recent_ft_sessions and older_ft_sessions:
                recent_ft = sum(s.metrics.get("freeThrowPercentage", 0) for s in recent_ft_sessions) / len(recent_ft_sessions)
                older_ft = sum(s.metrics.get("freeThrowPercentage", 0) for s in older_ft_sessions) / len(older_ft_sessions)
                
                change = recent_ft - older_ft
                if abs(change) > 3:
                    improvements.append({
                        "metric": "Free Throw %",
                        "change": round(change),
                        "description": (
                            f"Your free throw shooting improved by {round(change)}% - great work at the line!"
                            if change > 0
                            else f"Your free throw percentage dropped {abs(round(change))}% - more practice needed."
                        )
                    })
    
    return improvements


def _generate_textual_insights(
    period_games: List[GameStat],
    period_sessions: List[TrainingSession],
    period: str
) -> List[str]:
    """Generate textual insights about user activity."""
    insights = []
    
    if period_games:
        game_count = len(period_games)
        insights.append(
            f"You played {game_count} {'game' if game_count == 1 else 'games'} this {period}."
        )
        
        avg_points = sum(g.points for g in period_games) / len(period_games)
        insights.append(f"You averaged {avg_points:.1f} points per game.")
    
    if period_sessions:
        session_count = len(period_sessions)
        insights.append(
            f"You completed {session_count} training {'session' if session_count == 1 else 'sessions'} - excellent dedication!"
        )
    
    return insights


def _identify_focus_areas(
    period_games: List[GameStat],
    period_sessions: List[TrainingSession]
) -> List[str]:
    """Identify areas that need focus based on performance."""
    focus_areas = []
    
    if period_games:
        # Check turnovers
        avg_turnovers = sum(g.turnovers for g in period_games) / len(period_games)
        if avg_turnovers > 3:
            focus_areas.append("Ball handling - work on reducing turnovers through control drills")
        
        # Check assists
        avg_assists = sum(g.assists for g in period_games) / len(period_games)
        if avg_assists < 2:
            focus_areas.append("Playmaking - focus on court vision and passing drills")
    
    # Check shooting from training sessions
    shooting_sessions = [
        s for s in period_sessions
        if s.metrics.get("threePointPercentage")
    ]
    
    if shooting_sessions:
        three_pt_sessions = [s for s in shooting_sessions if s.metrics.get("threePointPercentage")]
        if three_pt_sessions:
            avg_3pt = sum(s.metrics.get("threePointPercentage", 0) for s in three_pt_sessions) / len(three_pt_sessions)
            if avg_3pt < 35:
                focus_areas.append("Three-point shooting - increase practice volume and focus on form")
    
    return focus_areas


def _create_motivational_message(
    improvements: List[Dict[str, Any]],
    period_games: List[GameStat],
    period_sessions: List[TrainingSession]
) -> str:
    """Create a personalized motivational message."""
    if improvements and any(i["change"] > 0 for i in improvements):
        return "You're making great progress! Keep up the hard work and stay focused on your goals."
    elif period_games or period_sessions:
        return "Consistency is key! Keep showing up and putting in the work - results will follow."
    else:
        return "Ready to get started? Log your games and training to track your progress!"