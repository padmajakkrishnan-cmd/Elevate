from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from backend.models.share_link import ShareLink
from backend.models.user import User
from backend.database import (
    get_share_links_collection,
    get_profiles_collection,
    get_game_stats_collection,
    get_training_sessions_collection,
    get_goals_collection
)
from backend.dependencies.auth import get_current_user
from datetime import datetime
from datetime import date as date_type
from bson import ObjectId
import uuid


router = APIRouter(prefix="/api/v1/share", tags=["share"])


class ShareLinkResponse(BaseModel):
    """Response model for share link operations"""
    id: str = Field(..., description="Share link's unique identifier")
    user_id: str = Field(..., description="ID of the user who created the share link")
    token: str = Field(..., description="Unique token for the share link")
    player_name: str = Field(..., description="Name of the player for the shared report")
    view_count: int = Field(..., description="Number of times the link has been viewed")
    last_viewed: Optional[datetime] = Field(None, description="Timestamp of last view")
    expires_at: Optional[datetime] = Field(None, description="Expiration timestamp for the link")
    created_at: datetime = Field(..., description="Link creation timestamp")
    url: str = Field(..., description="Full shareable URL")


@router.post("", response_model=ShareLinkResponse, status_code=status.HTTP_201_CREATED)
async def create_share_link(
    current_user: User = Depends(get_current_user)
):
    """
    Create a new shareable link for the authenticated user's profile.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches the user's profile to get their name
    - Generates a unique token for the share link
    - Creates a new share link document in the share_links collection
    - Returns the newly created share link with the full URL
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        ShareLinkResponse with the newly created share link data including full URL
        
    Raises:
        HTTPException 400: If the user doesn't have a profile
        HTTPException 401: If authentication fails
    """
    profiles_collection = get_profiles_collection()
    share_links_collection = get_share_links_collection()
    
    # Fetch the user's profile to get their name
    profile = await profiles_collection.find_one({"user_id": ObjectId(current_user.id)})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile not found. Please create a profile before generating a share link."
        )
    
    # Generate a unique token using UUID
    token = str(uuid.uuid4())
    
    # Create new share link document
    now = datetime.utcnow()
    share_link_data = {
        "user_id": ObjectId(current_user.id),
        "token": token,
        "player_name": profile["name"],
        "view_count": 0,
        "last_viewed": None,
        "expires_at": None,
        "created_at": now
    }
    
    # Insert share link into database
    result = await share_links_collection.insert_one(share_link_data)
    share_link_id = str(result.inserted_id)
    
    # Construct the full shareable URL
    # Using a placeholder base URL - this should be configured based on the frontend URL
    base_url = "http://localhost:5173"  # Default Vite dev server URL
    full_url = f"{base_url}/shared/{token}"
    
    # Return the created share link
    return ShareLinkResponse(
        id=share_link_id,
        user_id=str(current_user.id),
        token=token,
        player_name=profile["name"],
        view_count=0,
        last_viewed=None,
        expires_at=None,
        created_at=now,
        url=full_url
    )


@router.get("", response_model=list[ShareLinkResponse])
async def get_all_share_links(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all share links for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches all share links created by the current user
    - Sorts links by creation date in descending order (newest first)
    - Returns an array of share link objects with full URLs
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        List of ShareLinkResponse objects containing all share links for the user
        
    Raises:
        HTTPException 401: If authentication fails
    """
    share_links_collection = get_share_links_collection()
    
    # Fetch all share links for the current user, sorted by created_at descending
    cursor = share_links_collection.find(
        {"user_id": ObjectId(current_user.id)}
    ).sort("created_at", -1)
    
    # Convert cursor to list
    share_links = await cursor.to_list(length=None)
    
    # Construct the base URL for share links
    base_url = "http://localhost:5173"  # Default Vite dev server URL
    
    # Convert to ShareLinkResponse models
    result = []
    for link in share_links:
        full_url = f"{base_url}/shared/{link['token']}"
        result.append(ShareLinkResponse(
            id=str(link["_id"]),
            user_id=str(link["user_id"]),
            token=link["token"],
            player_name=link["player_name"],
            view_count=link["view_count"],
            last_viewed=link.get("last_viewed"),
            expires_at=link.get("expires_at"),
            created_at=link["created_at"],
            url=full_url
        ))
    
    return result


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_share_link(
    id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a share link by ID.
    
    This endpoint:
    - Requires authentication via JWT token
    - Accepts a share link ID as a path parameter
    - Verifies that the share link belongs to the authenticated user
    - Deletes the share link from the database
    - Returns a success message
    
    Args:
        id: The share link ID to delete
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        Dict with success message
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the share link doesn't belong to the current user
        HTTPException 404: If the share link is not found
    """
    share_links_collection = get_share_links_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found"
        )
    
    # Fetch the share link from the database
    share_link = await share_links_collection.find_one({"_id": ObjectId(id)})
    
    # Check if share link exists
    if not share_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found"
        )
    
    # Verify that the share link belongs to the current user
    if str(share_link["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this share link"
        )
    
    # Delete the share link
    await share_links_collection.delete_one({"_id": ObjectId(id)})
    
    return {"message": "Share link deleted successfully"}


class PublicReportResponse(BaseModel):
    """Response model for public report data"""
    profile: Dict[str, Any] = Field(..., description="Player profile information")
    game_stats: List[Dict[str, Any]] = Field(..., description="All game statistics")
    training_sessions: List[Dict[str, Any]] = Field(..., description="All training sessions")
    goals: List[Dict[str, Any]] = Field(..., description="All goals")


@router.get("/report/{token}", response_model=PublicReportResponse)
async def get_public_report(token: str):
    """
    Retrieve public report data using a share link token.
    
    This endpoint:
    - Does NOT require authentication (public endpoint)
    - Accepts a share link token as a path parameter
    - Finds the corresponding share link in the database
    - Increments the view count and updates last_viewed timestamp
    - Fetches all public data for the user: profile, game stats, training sessions, and goals
    - Returns a consolidated object with all public data
    
    Args:
        token: The unique share link token
        
    Returns:
        PublicReportResponse containing all public data for the athlete
        
    Raises:
        HTTPException 404: If the share link token is not found or has expired
    """
    share_links_collection = get_share_links_collection()
    
    # Find the share link by token
    share_link = await share_links_collection.find_one({"token": token})
    
    if not share_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found or has expired"
        )
    
    # Check if the link has expired
    if share_link.get("expires_at") and share_link["expires_at"] < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link has expired"
        )
    
    # Increment view count and update last_viewed timestamp
    now = datetime.utcnow()
    await share_links_collection.update_one(
        {"_id": share_link["_id"]},
        {
            "$inc": {"view_count": 1},
            "$set": {"last_viewed": now}
        }
    )
    
    # Get the user_id from the share link
    user_id = share_link["user_id"]
    
    # Fetch all public data for the user
    profiles_collection = get_profiles_collection()
    game_stats_collection = get_game_stats_collection()
    training_sessions_collection = get_training_sessions_collection()
    goals_collection = get_goals_collection()
    
    # Fetch profile
    profile = await profiles_collection.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found for this user"
        )
    
    # Fetch all game stats
    game_stats_cursor = game_stats_collection.find({"user_id": user_id}).sort("date", -1)
    game_stats = await game_stats_cursor.to_list(length=None)
    
    # Fetch all training sessions
    training_sessions_cursor = training_sessions_collection.find({"user_id": user_id}).sort("date", -1)
    training_sessions = await training_sessions_cursor.to_list(length=None)
    
    # Fetch all goals
    goals_cursor = goals_collection.find({"user_id": user_id}).sort("created_at", -1)
    goals = await goals_cursor.to_list(length=None)
    
    # Helper function to convert MongoDB documents to JSON-serializable format
    def serialize_doc(doc):
        """Convert MongoDB document to JSON-serializable dict"""
        if doc is None:
            return None
        
        serialized = {}
        for key, value in doc.items():
            if key == "_id" or key == "user_id":
                serialized[key] = str(value)
            elif isinstance(value, ObjectId):
                serialized[key] = str(value)
            elif isinstance(value, datetime):
                serialized[key] = value.isoformat()
            elif isinstance(value, date_type):
                serialized[key] = value.isoformat()
            else:
                serialized[key] = value
        return serialized
    
    # Serialize all documents
    profile_data = serialize_doc(profile)
    game_stats_data = [serialize_doc(stat) for stat in game_stats]
    training_sessions_data = [serialize_doc(session) for session in training_sessions]
    goals_data = [serialize_doc(goal) for goal in goals]
    
    # Return consolidated public report data
    return PublicReportResponse(
        profile=profile_data,
        game_stats=game_stats_data,
        training_sessions=training_sessions_data,
        goals=goals_data
    )