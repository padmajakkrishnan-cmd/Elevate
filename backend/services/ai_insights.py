import google.generativeai as genai
from backend.config import settings
from typing import List, Dict
from datetime import datetime

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


async def generate_performance_insights(games: List[Dict]) -> Dict:
    """Generate AI-powered performance insights using Gemini 2.5 Flash"""
    
    if not games:
        return {
            "takeaway": "Start logging your games to get personalized insights and track your progress!",
            "progress": {
                "scoring": "No data yet - log your first game to see your scoring progress",
                "playmaking": "No data yet - log your first game to see your playmaking progress",
                "defense": "No data yet - log your first game to see your defensive progress",
                "ball_control": "No data yet - log your first game to see your ball control progress",
                "rebounding": "No data yet - log your first game to see your rebounding progress"
            },
            "next_steps": [
                "Log your first game to start tracking your performance",
                "Set specific goals for areas you want to improve",
                "Review your stats regularly to identify patterns"
            ],
            "generated_at": datetime.utcnow().isoformat(),
            "model": "none"
        }
    
    # Get last 10 games
    recent_games = games[-10:] if len(games) > 10 else games
    
    # Calculate statistics
    total_games = len(recent_games)
    avg_points = sum(g.get('points', 0) for g in recent_games) / total_games
    avg_assists = sum(g.get('assists', 0) for g in recent_games) / total_games
    avg_rebounds = sum(g.get('rebounds', 0) for g in recent_games) / total_games
    avg_steals = sum(g.get('steals', 0) for g in recent_games) / total_games
    avg_blocks = sum(g.get('blocks', 0) for g in recent_games) / total_games
    avg_turnovers = sum(g.get('turnovers', 0) for g in recent_games) / total_games
    
    # Format game data for context
    games_summary = []
    for i, game in enumerate(recent_games, 1):
        games_summary.append(
            f"Game {i}: {game.get('points', 0)} pts, {game.get('assists', 0)} ast, "
            f"{game.get('rebounds', 0)} reb, {game.get('steals', 0)} stl, "
            f"{game.get('blocks', 0)} blk, {game.get('turnovers', 0)} to"
        )
    
    # Prepare prompt
    prompt = f"""
Help me understand how I'm progressing, and what I should work on.

GAME DATA (Last {total_games} games):
{chr(10).join(games_summary)}

AVERAGES:
- Points: {avg_points:.1f}
- Assists: {avg_assists:.1f}
- Rebounds: {avg_rebounds:.1f}
- Steals: {avg_steals:.1f}
- Blocks: {avg_blocks:.1f}
- Turnovers: {avg_turnovers:.1f}

The output should be in the following format:

1) Takeaway summary in 1 or 2 short sentences that sounds motivating (maximum of 500 characters)

2) Summary of progress across 5 areas, highlighting improved areas and areas needing focus in text bullet points: Scoring, playmaking, defense, ball control, rebounding (maximum 100 characters per area). Keep the tone motivating while sticking to facts.

3) What to work on next with 3 most important things in 3 bullet points - should be short succinct sentences (maximum 200 characters for each bullet)

FORMAT YOUR RESPONSE EXACTLY AS JSON:
{{
  "takeaway": "your motivating summary here",
  "progress": {{
    "scoring": "brief analysis of scoring",
    "playmaking": "brief analysis of playmaking/assists",
    "defense": "brief analysis of defense (steals/blocks)",
    "ball_control": "brief analysis of ball control (turnovers)",
    "rebounding": "brief analysis of rebounding"
  }},
  "next_steps": [
    "first actionable step",
    "second actionable step",
    "third actionable step"
  ]
}}
"""
    
    try:
        # Log the prompt for debugging
        print(f"\n{'='*80}")
        print(f"GENERATING AI INSIGHTS")
        print(f"{'='*80}")
        print(f"Total games: {total_games}")
        print(f"Prompt being sent to Gemini:")
        print(prompt)
        print(f"{'='*80}\n")
        
        # Generate with Gemini 2.5 Flash
        model = genai.GenerativeModel(
            settings.gemini_model,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=1000,
                top_p=0.95,
                response_mime_type="application/json"
            )
        )
        
        response = model.generate_content(prompt)
        
        print(f"\n{'='*80}")
        print(f"GEMINI RESPONSE:")
        print(f"{'='*80}")
        print(response.text)
        print(f"{'='*80}\n")
        
        # Parse JSON response
        import json
        insights_data = json.loads(response.text)
        
        # Add metadata
        insights_data["generated_at"] = datetime.utcnow().isoformat()
        insights_data["model"] = settings.gemini_model
        
        return insights_data
        
    except Exception as e:
        print(f"\n{'='*80}")
        print(f"ERROR GENERATING INSIGHTS:")
        print(f"{'='*80}")
        print(f"Error: {str(e)}")
        print(f"{'='*80}\n")
        
        # Fallback response if AI fails
        return {
            "takeaway": f"Unable to generate insights at this time. You've played {total_games} games with an average of {avg_points:.1f} points per game. Keep up the great work!",
            "progress": {
                "scoring": f"Averaging {avg_points:.1f} points per game",
                "playmaking": f"Averaging {avg_assists:.1f} assists per game",
                "defense": f"Averaging {avg_steals:.1f} steals and {avg_blocks:.1f} blocks per game",
                "ball_control": f"Averaging {avg_turnovers:.1f} turnovers per game",
                "rebounding": f"Averaging {avg_rebounds:.1f} rebounds per game"
            },
            "next_steps": [
                "Continue tracking your games to identify trends",
                "Focus on consistency in your strongest areas",
                "Work on reducing turnovers to improve ball control"
            ],
            "generated_at": datetime.utcnow().isoformat(),
            "model": "fallback",
            "error": str(e)
        }