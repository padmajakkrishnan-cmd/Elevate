from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from backend.models.profile import PlayerProfile
from backend.models.user import User, PyObjectId
from backend.database import get_profiles_collection, get_database
from backend.dependencies.auth import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])


class CreateProfileRequest(BaseModel):
    """Request model for creating a player profile"""
    name: str = Field(..., description="Player's full name", min_length=1, max_length=100)
    team: Optional[str] = Field(None, description="Player's team name", max_length=100)
    position: Optional[str] = Field(None, description="Player's position", max_length=50)
    age_group: Optional[str] = Field(None, description="Player's age group (e.g., U12, U15, U18)", max_length=20)
    sport: str = Field(..., description="Sport type (e.g., soccer, basketball)", max_length=50)
    height_feet: Optional[int] = Field(None, description="Player's height in feet", ge=1, le=10)
    height_inches: Optional[int] = Field(None, description="Player's height in inches", ge=0, le=11)
    weight: Optional[int] = Field(None, description="Player's weight in pounds", gt=0)
    wingspan_feet: Optional[int] = Field(None, description="Player's wingspan in feet", ge=1, le=10)
    wingspan_inches: Optional[int] = Field(None, description="Player's wingspan in inches", ge=0, le=11)
    goals: Optional[int] = Field(0, description="Total goals scored", ge=0)
    bio: Optional[str] = Field(None, description="Player's biography", max_length=500)
    photo: Optional[str] = Field(None, description="URL to player's main profile photo")
    photos: Optional[List[str]] = Field(default_factory=list, description="List of additional photo URLs")
    videos: Optional[List[str]] = Field(default_factory=list, description="List of video URLs")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "team": "FC Barcelona Youth",
                "position": "Forward",
                "age_group": "U15",
                "sport": "soccer",
                "height_feet": 5,
                "height_inches": 10,
                "weight": 150,
                "wingspan_feet": 6,
                "wingspan_inches": 2,
                "goals": 25,
                "bio": "Passionate soccer player with strong technical skills",
                "photo": "https://example.com/photos/profile.jpg",
                "photos": ["https://example.com/photos/action1.jpg", "https://example.com/photos/action2.jpg"],
                "videos": ["https://example.com/videos/highlights.mp4"]
            }
        }


class UpdateProfileRequest(BaseModel):
    """Request model for updating a player profile (all fields optional)"""
    name: Optional[str] = Field(None, description="Player's full name", min_length=1, max_length=100)
    team: Optional[str] = Field(None, description="Player's team name", max_length=100)
    position: Optional[str] = Field(None, description="Player's position", max_length=50)
    age_group: Optional[str] = Field(None, description="Player's age group (e.g., U12, U15, U18)", max_length=20)
    sport: Optional[str] = Field(None, description="Sport type (e.g., soccer, basketball)", max_length=50)
    height_feet: Optional[int] = Field(None, description="Player's height in feet", ge=1, le=10)
    height_inches: Optional[int] = Field(None, description="Player's height in inches", ge=0, le=11)
    weight: Optional[int] = Field(None, description="Player's weight in pounds", gt=0)
    wingspan_feet: Optional[int] = Field(None, description="Player's wingspan in feet", ge=1, le=10)
    wingspan_inches: Optional[int] = Field(None, description="Player's wingspan in inches", ge=0, le=11)
    goals: Optional[int] = Field(None, description="Total goals scored", ge=0)
    bio: Optional[str] = Field(None, description="Player's biography", max_length=500)
    photo: Optional[str] = Field(None, description="URL to player's main profile photo")
    photos: Optional[List[str]] = Field(None, description="List of additional photo URLs")
    videos: Optional[List[str]] = Field(None, description="List of video URLs")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "team": "FC Barcelona Youth",
                "position": "Forward",
                "bio": "Updated biography with new achievements"
            }
        }


class ProfileResponse(BaseModel):
    """Response model for profile operations"""
    id: str = Field(..., description="Profile's unique identifier")
    user_id: str = Field(..., description="Reference to the user who owns this profile")
    name: str = Field(..., description="Player's full name")
    team: Optional[str] = Field(None, description="Player's team name")
    position: Optional[str] = Field(None, description="Player's position")
    age_group: Optional[str] = Field(None, description="Player's age group")
    sport: str = Field(..., description="Sport type")
    height_feet: Optional[int] = Field(None, description="Player's height in feet")
    height_inches: Optional[int] = Field(None, description="Player's height in inches")
    weight: Optional[int] = Field(None, description="Player's weight in pounds")
    wingspan_feet: Optional[int] = Field(None, description="Player's wingspan in feet")
    wingspan_inches: Optional[int] = Field(None, description="Player's wingspan in inches")
    goals: Optional[int] = Field(None, description="Total goals scored")
    bio: Optional[str] = Field(None, description="Player's biography")
    photo: Optional[str] = Field(None, description="URL to player's main profile photo")
    photos: Optional[List[str]] = Field(None, description="List of additional photo URLs")
    videos: Optional[List[str]] = Field(None, description="List of video URLs")
    created_at: datetime = Field(..., description="Profile creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    request: CreateProfileRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new player profile for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Checks if a profile already exists for the current user
    - Creates a new profile document in the profiles collection
    - Links the profile to the authenticated user's ID
    - Returns the newly created profile
    
    Args:
        request: CreateProfileRequest containing profile data
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        ProfileResponse with the newly created profile data
        
    Raises:
        HTTPException 400: If a profile already exists for this user
        HTTPException 401: If authentication fails
    """
    profiles_collection = get_profiles_collection()
    
    # Check if profile already exists for this user
    existing_profile = await profiles_collection.find_one({"user_id": ObjectId(current_user.id)})
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists for this user"
        )
    
    # Create new profile document
    now = datetime.utcnow()
    profile_data = {
        "user_id": ObjectId(current_user.id),
        "name": request.name,
        "team": request.team,
        "position": request.position,
        "age_group": request.age_group,
        "sport": request.sport,
        "height_feet": request.height_feet,
        "height_inches": request.height_inches,
        "weight": request.weight,
        "wingspan_feet": request.wingspan_feet,
        "wingspan_inches": request.wingspan_inches,
        "goals": request.goals if request.goals is not None else 0,
        "bio": request.bio,
        "photo": request.photo,
        "photos": request.photos if request.photos else [],
        "videos": request.videos if request.videos else [],
        "created_at": now,
        "updated_at": now
    }
    
    # Insert profile into database
    result = await profiles_collection.insert_one(profile_data)
    profile_id = str(result.inserted_id)
    
    # Return the created profile
    return ProfileResponse(
        id=profile_id,
        user_id=str(current_user.id),
        name=request.name,
        team=request.team,
        position=request.position,
        age_group=request.age_group,
        sport=request.sport,
        height_feet=request.height_feet,
        height_inches=request.height_inches,
        weight=request.weight,
        wingspan_feet=request.wingspan_feet,
        wingspan_inches=request.wingspan_inches,
        goals=request.goals if request.goals is not None else 0,
        bio=request.bio,
        photo=request.photo,
        photos=request.photos if request.photos else [],
        videos=request.videos if request.videos else [],
        created_at=now,
        updated_at=now
    )


@router.get("", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the player profile for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches the profile associated with the current user's ID
    - Returns the profile data if found
    - Returns 404 if no profile exists for the user
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        ProfileResponse with the user's profile data
        
    Raises:
        HTTPException 404: If no profile exists for this user
        HTTPException 401: If authentication fails
    """
    profiles_collection = get_profiles_collection()
    
    # Fetch profile for the current user
    profile = await profiles_collection.find_one({"user_id": ObjectId(current_user.id)})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found for this user"
        )
    
    # Return the profile
    return ProfileResponse(
        id=str(profile["_id"]),
        user_id=str(profile["user_id"]),
        name=profile["name"],
        team=profile.get("team"),
        position=profile.get("position"),
        age_group=profile.get("age_group"),
        sport=profile["sport"],
        height_feet=profile.get("height_feet"),
        height_inches=profile.get("height_inches"),
        weight=profile.get("weight"),
        wingspan_feet=profile.get("wingspan_feet"),
        wingspan_inches=profile.get("wingspan_inches"),
        goals=profile.get("goals", 0),
        bio=profile.get("bio"),
        photo=profile.get("photo"),
        photos=profile.get("photos", []),
        videos=profile.get("videos", []),
        created_at=profile["created_at"],
        updated_at=profile["updated_at"]
    )


@router.put("", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Update the player profile for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Accepts partial updates (only provided fields will be updated)
    - Finds the user's existing profile
    - Updates the profile with new data
    - Updates the updated_at timestamp
    - Returns the updated profile
    
    Args:
        request: UpdateProfileRequest containing fields to update
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        ProfileResponse with the updated profile data
        
    Raises:
        HTTPException 404: If no profile exists for this user
        HTTPException 401: If authentication fails
    """
    profiles_collection = get_profiles_collection()
    
    # Find the user's existing profile
    profile = await profiles_collection.find_one({"user_id": ObjectId(current_user.id)})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found for this user"
        )
    
    # Build update dictionary - include all provided fields from request
    update_data = {}
    
    # Use dict() to get all fields that were explicitly set in the request
    request_dict = request.model_dump(exclude_unset=True)
    
    for field_name, field_value in request_dict.items():
        update_data[field_name] = field_value
    
    # Always update the updated_at timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the profile in the database
    await profiles_collection.update_one(
        {"user_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    # Fetch the updated profile
    updated_profile = await profiles_collection.find_one({"user_id": ObjectId(current_user.id)})
    
    # Return the updated profile
    return ProfileResponse(
        id=str(updated_profile["_id"]),
        user_id=str(updated_profile["user_id"]),
        name=updated_profile["name"],
        team=updated_profile.get("team"),
        position=updated_profile.get("position"),
        age_group=updated_profile.get("age_group"),
        sport=updated_profile["sport"],
        height_feet=updated_profile.get("height_feet"),
        height_inches=updated_profile.get("height_inches"),
        weight=updated_profile.get("weight"),
        wingspan_feet=updated_profile.get("wingspan_feet"),
        wingspan_inches=updated_profile.get("wingspan_inches"),
        goals=updated_profile.get("goals", 0),
        bio=updated_profile.get("bio"),
        photo=updated_profile.get("photo"),
        photos=updated_profile.get("photos", []),
        videos=updated_profile.get("videos", []),
        created_at=updated_profile["created_at"],
        updated_at=updated_profile["updated_at"]
    )


@router.delete("", status_code=status.HTTP_200_OK)
async def delete_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Delete the player profile and all associated data for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Finds and deletes the user's profile
    - Cascades deletion to all associated data:
      * User document from users collection
      * Game statistics from game_stats collection
      * Training sessions from training_sessions collection
      * Goals from goals collection
      * AI summaries from ai_summaries collection
      * Share links from share_links collection
    - Returns a success message upon completion
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        dict: Success message confirming deletion
        
    Raises:
        HTTPException 404: If no profile exists for this user
        HTTPException 401: If authentication fails
    """
    profiles_collection = get_profiles_collection()
    db = get_database()
    
    # Find the user's profile first
    profile = await profiles_collection.find_one({"user_id": ObjectId(current_user.id)})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found for this user"
        )
    
    # Delete all associated data for this user
    user_id = ObjectId(current_user.id)
    
    # Delete from all collections
    await profiles_collection.delete_one({"user_id": user_id})
    await db.users.delete_one({"_id": user_id})
    await db.game_stats.delete_many({"user_id": user_id})
    await db.training_sessions.delete_many({"user_id": user_id})
    await db.goals.delete_many({"user_id": user_id})
    await db.ai_summaries.delete_many({"user_id": user_id})
    await db.share_links.delete_many({"user_id": user_id})
    
    return {"message": "Profile and all associated data deleted successfully"}