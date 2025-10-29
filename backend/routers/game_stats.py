from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, time
from datetime import date as date_type
from models.game_stat import GameStat
from models.user import User
from models.common import PyObjectId
from database import get_game_stats_collection
from dependencies.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/api/v1/game-stats", tags=["game-stats"])


class CreateGameStatRequest(BaseModel):
    """Request model for creating a game stat"""
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

    class Config:
        json_schema_extra = {
            "example": {
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
                }
            }
        }


class UpdateGameStatRequest(BaseModel):
    """Request model for updating a game stat (all fields optional)"""
    date: Optional[date_type] = Field(None, description="Date of the game")
    opponent: Optional[str] = Field(None, description="Opponent team name", min_length=1, max_length=100)
    points: Optional[int] = Field(None, description="Points scored", ge=0)
    assists: Optional[int] = Field(None, description="Assists made", ge=0)
    rebounds: Optional[int] = Field(None, description="Rebounds collected", ge=0)
    steals: Optional[int] = Field(None, description="Steals made", ge=0)
    blocks: Optional[int] = Field(None, description="Blocks made", ge=0)
    turnovers: Optional[int] = Field(None, description="Turnovers committed", ge=0)
    minutes: Optional[float] = Field(None, description="Minutes played", ge=0)
    custom_stats: Optional[Dict[str, Any]] = Field(None, description="Custom statistics specific to sport or user preference")

    class Config:
        json_schema_extra = {
            "example": {
                "points": 28,
                "assists": 10,
                "rebounds": 7
            }
        }


class GameStatResponse(BaseModel):
    """Response model for game stat operations"""
    id: str = Field(..., description="Game stat's unique identifier")
    user_id: str = Field(..., description="Reference to the user who owns this game stat")
    date: date_type = Field(..., description="Date of the game")
    opponent: str = Field(..., description="Opponent team name")
    points: int = Field(..., description="Points scored")
    assists: int = Field(..., description="Assists made")
    rebounds: int = Field(..., description="Rebounds collected")
    steals: int = Field(..., description="Steals made")
    blocks: int = Field(..., description="Blocks made")
    turnovers: int = Field(..., description="Turnovers committed")
    minutes: float = Field(..., description="Minutes played")
    custom_stats: Optional[Dict[str, Any]] = Field(None, description="Custom statistics")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


@router.post("", response_model=GameStatResponse, status_code=status.HTTP_201_CREATED)
async def create_game_stat(
    request: CreateGameStatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new game stat for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Creates a new game stat document in the game_stats collection
    - Links the game stat to the authenticated user's ID
    - Returns the newly created game stat
    
    Args:
        request: CreateGameStatRequest containing game stat data
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        GameStatResponse with the newly created game stat data
        
    Raises:
        HTTPException 401: If authentication fails
    """
    game_stats_collection = get_game_stats_collection()
    
    # Create new game stat document
    now = datetime.utcnow()
    game_stat_data = {
        "user_id": current_user.firebase_uid,
        "date": datetime.combine(request.date, time(12, 0)),
        "opponent": request.opponent,
        "points": request.points,
        "assists": request.assists,
        "rebounds": request.rebounds,
        "steals": request.steals,
        "blocks": request.blocks,
        "turnovers": request.turnovers,
        "minutes": request.minutes,
        "custom_stats": request.custom_stats if request.custom_stats else {},
        "created_at": now,
        "updated_at": now
    }
    
    # Insert game stat into database
    result = await game_stats_collection.insert_one(game_stat_data)
    game_stat_id = str(result.inserted_id)
    
    # Return the created game stat
    return GameStatResponse(
        id=game_stat_id,
        user_id=current_user.firebase_uid,
        date=game_stat_data["date"].date(),
        opponent=request.opponent,
        points=request.points,
        assists=request.assists,
        rebounds=request.rebounds,
        steals=request.steals,
        blocks=request.blocks,
        turnovers=request.turnovers,
        minutes=request.minutes,
        custom_stats=request.custom_stats if request.custom_stats else {},
        created_at=now,
        updated_at=now
    )


@router.get("", response_model=List[GameStatResponse], status_code=status.HTTP_200_OK)
async def get_all_games(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all game stats for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches all game stats for the authenticated user from the game_stats collection
    - Sorts games by date in descending order (most recent first)
    - Returns an array of game stat objects
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        List[GameStatResponse] containing all game stats for the user, sorted by date descending
        
    Raises:
        HTTPException 401: If authentication fails
    """
    game_stats_collection = get_game_stats_collection()
    
    # Fetch all games for the current user, sorted by date descending
    cursor = game_stats_collection.find(
        {"user_id": current_user.firebase_uid}
    ).sort("date", -1)
    
    # Convert cursor to list and transform documents to response models
    games = []
    async for game_doc in cursor:
        games.append(GameStatResponse(
            id=str(game_doc["_id"]),
            user_id=str(game_doc["user_id"]),
            date=game_doc["date"].date() if isinstance(game_doc["date"], datetime) else game_doc["date"],
            opponent=game_doc["opponent"],
            points=game_doc["points"],
            assists=game_doc["assists"],
            rebounds=game_doc["rebounds"],
            steals=game_doc["steals"],
            blocks=game_doc["blocks"],
            turnovers=game_doc["turnovers"],
            minutes=game_doc["minutes"],
            custom_stats=game_doc.get("custom_stats", {}),
            created_at=game_doc["created_at"],
            updated_at=game_doc["updated_at"]
        ))
    
    return games


@router.get("/{id}", response_model=GameStatResponse, status_code=status.HTTP_200_OK)
async def get_game_by_id(
    id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a single game stat by its ID for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches a specific game stat by ID from the game_stats collection
    - Verifies that the game belongs to the authenticated user
    - Returns the game stat object if found and owned by the user
    
    Args:
        id: The game stat's unique identifier
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        GameStatResponse with the requested game stat data
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the game exists but doesn't belong to the current user
        HTTPException 404: If the game is not found
    """
    game_stats_collection = get_game_stats_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Fetch the game stat by ID
    game_doc = await game_stats_collection.find_one({"_id": ObjectId(id)})
    
    # Check if game exists
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Verify ownership - game must belong to the current user
    if str(game_doc["user_id"]) != current_user.firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this game"
        )
    
    # Return the game stat
    return GameStatResponse(
        id=str(game_doc["_id"]),
        user_id=str(game_doc["user_id"]),
        date=game_doc["date"].date() if isinstance(game_doc["date"], datetime) else game_doc["date"],
        opponent=game_doc["opponent"],
        points=game_doc["points"],
        assists=game_doc["assists"],
        rebounds=game_doc["rebounds"],
        steals=game_doc["steals"],
        blocks=game_doc["blocks"],
        turnovers=game_doc["turnovers"],
        minutes=game_doc["minutes"],
        custom_stats=game_doc.get("custom_stats", {}),
        created_at=game_doc["created_at"],
        updated_at=game_doc["updated_at"]
    )


@router.put("/{id}", response_model=GameStatResponse, status_code=status.HTTP_200_OK)
async def update_game_stat(
    id: str,
    request: UpdateGameStatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Update a game stat by its ID for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Accepts partial updates (only provided fields will be updated)
    - Fetches the game stat by ID from the game_stats collection
    - Verifies that the game belongs to the authenticated user
    - Updates the game stat with the new data
    - Updates the updated_at timestamp
    - Returns the updated game stat object
    
    Args:
        id: The game stat's unique identifier
        request: UpdateGameStatRequest containing partial game stat data to update
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        GameStatResponse with the updated game stat data
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the game exists but doesn't belong to the current user
        HTTPException 404: If the game is not found
    """
    game_stats_collection = get_game_stats_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Fetch the game stat by ID
    game_doc = await game_stats_collection.find_one({"_id": ObjectId(id)})
    
    # Check if game exists
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Verify ownership - game must belong to the current user
    if str(game_doc["user_id"]) != current_user.firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this game"
        )
    
    # Build update data from request (only include fields that were provided)
    update_data = {}
    if request.date is not None:
        update_data["date"] = datetime.combine(request.date, time(12, 0))
    if request.opponent is not None:
        update_data["opponent"] = request.opponent
    if request.points is not None:
        update_data["points"] = request.points
    if request.assists is not None:
        update_data["assists"] = request.assists
    if request.rebounds is not None:
        update_data["rebounds"] = request.rebounds
    if request.steals is not None:
        update_data["steals"] = request.steals
    if request.blocks is not None:
        update_data["blocks"] = request.blocks
    if request.turnovers is not None:
        update_data["turnovers"] = request.turnovers
    if request.minutes is not None:
        update_data["minutes"] = request.minutes
    if request.custom_stats is not None:
        update_data["custom_stats"] = request.custom_stats
    
    # Always update the updated_at timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the game stat in the database
    await game_stats_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )
    
    # Fetch the updated game stat
    updated_game_doc = await game_stats_collection.find_one({"_id": ObjectId(id)})
    
    # Return the updated game stat
    return GameStatResponse(
        id=str(updated_game_doc["_id"]),
        user_id=str(updated_game_doc["user_id"]),
        date=updated_game_doc["date"].date() if isinstance(updated_game_doc["date"], datetime) else updated_game_doc["date"],
        opponent=updated_game_doc["opponent"],
        points=updated_game_doc["points"],
        assists=updated_game_doc["assists"],
        rebounds=updated_game_doc["rebounds"],
        steals=updated_game_doc["steals"],
        blocks=updated_game_doc["blocks"],
        turnovers=updated_game_doc["turnovers"],
        minutes=updated_game_doc["minutes"],
        custom_stats=updated_game_doc.get("custom_stats", {}),
        created_at=updated_game_doc["created_at"],
        updated_at=updated_game_doc["updated_at"]
    )


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_game_stat(
    id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a game stat by its ID for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches the game stat by ID from the game_stats collection
    - Verifies that the game belongs to the authenticated user
    - Deletes the game stat from the database
    - Returns a success message
    
    Args:
        id: The game stat's unique identifier
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        Dict with success message
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the game exists but doesn't belong to the current user
        HTTPException 404: If the game is not found
    """
    game_stats_collection = get_game_stats_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Fetch the game stat by ID
    game_doc = await game_stats_collection.find_one({"_id": ObjectId(id)})
    
    # Check if game exists
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Verify ownership - game must belong to the current user
    if str(game_doc["user_id"]) != current_user.firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this game"
        )
    
    # Delete the game stat from the database
    await game_stats_collection.delete_one({"_id": ObjectId(id)})
    
    # Return success message
    return {"message": "Game stat deleted successfully"}