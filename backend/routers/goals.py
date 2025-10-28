from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from datetime import date as date_type
from backend.models.goal import Goal, GoalType, GoalStatus
from backend.models.user import User, PyObjectId
from backend.database import get_goals_collection
from backend.dependencies.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])


class CreateGoalRequest(BaseModel):
    """Request model for creating a goal"""
    type: GoalType = Field(..., description="Type of goal (performance, skill, fitness, team, personal)")
    category: str = Field(..., description="Specific category within the goal type", min_length=1, max_length=100)
    title: str = Field(..., description="Goal title", min_length=1, max_length=200)
    description: Optional[str] = Field(None, description="Detailed description of the goal", max_length=1000)
    target_value: float = Field(..., description="Target value to achieve", gt=0)
    current_value: float = Field(default=0.0, description="Current progress value", ge=0)
    metric: str = Field(..., description="Unit of measurement (e.g., goals, minutes, percentage)", min_length=1, max_length=50)
    start_date: date_type = Field(..., description="Goal start date")
    end_date: date_type = Field(..., description="Goal target completion date")
    status: GoalStatus = Field(default=GoalStatus.NOT_STARTED, description="Current status of the goal")

    class Config:
        json_schema_extra = {
            "example": {
                "type": "performance",
                "category": "Scoring",
                "title": "Score 20 goals this season",
                "description": "Improve my scoring ability by reaching 20 goals before the season ends",
                "target_value": 20.0,
                "current_value": 8.0,
                "metric": "goals",
                "start_date": "2025-01-01",
                "end_date": "2025-06-30",
                "status": "in_progress"
            }
        }


class UpdateGoalRequest(BaseModel):
    """Request model for updating a goal - all fields are optional"""
    type: Optional[GoalType] = Field(None, description="Type of goal (performance, skill, fitness, team, personal)")
    category: Optional[str] = Field(None, description="Specific category within the goal type", min_length=1, max_length=100)
    title: Optional[str] = Field(None, description="Goal title", min_length=1, max_length=200)
    description: Optional[str] = Field(None, description="Detailed description of the goal", max_length=1000)
    target_value: Optional[float] = Field(None, description="Target value to achieve", gt=0)
    current_value: Optional[float] = Field(None, description="Current progress value", ge=0)
    metric: Optional[str] = Field(None, description="Unit of measurement (e.g., goals, minutes, percentage)", min_length=1, max_length=50)
    start_date: Optional[date_type] = Field(None, description="Goal start date")
    end_date: Optional[date_type] = Field(None, description="Goal target completion date")
    status: Optional[GoalStatus] = Field(None, description="Current status of the goal")

    class Config:
        json_schema_extra = {
            "example": {
                "current_value": 12.0,
                "status": "in_progress"
            }
        }


class GoalResponse(BaseModel):
    """Response model for goal operations"""
    id: str = Field(..., description="Goal's unique identifier")
    user_id: str = Field(..., description="Reference to the user who owns this goal")
    type: GoalType = Field(..., description="Type of goal")
    category: str = Field(..., description="Specific category within the goal type")
    title: str = Field(..., description="Goal title")
    description: Optional[str] = Field(None, description="Detailed description of the goal")
    target_value: float = Field(..., description="Target value to achieve")
    current_value: float = Field(..., description="Current progress value")
    metric: str = Field(..., description="Unit of measurement")
    start_date: date_type = Field(..., description="Goal start date")
    end_date: date_type = Field(..., description="Goal target completion date")
    status: GoalStatus = Field(..., description="Current status of the goal")
    created_at: datetime = Field(..., description="Goal creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    request: CreateGoalRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new goal for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Creates a new goal document in the goals collection
    - Links the goal to the authenticated user's ID
    - Returns the newly created goal
    
    Args:
        request: CreateGoalRequest containing goal data
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        GoalResponse with the newly created goal data
        
    Raises:
        HTTPException 401: If authentication fails
    """
    goals_collection = get_goals_collection()
    
    # Create new goal document
    now = datetime.utcnow()
    goal_data = {
        "user_id": ObjectId(current_user.id),
        "type": request.type.value,
        "category": request.category,
        "title": request.title,
        "description": request.description,
        "target_value": request.target_value,
        "current_value": request.current_value,
        "metric": request.metric,
        "start_date": request.start_date,
        "end_date": request.end_date,
        "status": request.status.value,
        "created_at": now,
        "updated_at": now
    }
    
    # Insert goal into database
    result = await goals_collection.insert_one(goal_data)
    goal_id = str(result.inserted_id)
    
    # Return the created goal
    return GoalResponse(
        id=goal_id,
        user_id=str(current_user.id),
        type=request.type,
        category=request.category,
        title=request.title,
        description=request.description,
        target_value=request.target_value,
        current_value=request.current_value,
        metric=request.metric,
        start_date=request.start_date,
        end_date=request.end_date,
        status=request.status,
        created_at=now,
        updated_at=now
    )


@router.get("", response_model=List[GoalResponse], status_code=status.HTTP_200_OK)
async def get_all_goals(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all goals for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches all goals belonging to the authenticated user
    - Sorts goals by creation date (newest first)
    - Returns an array of goal objects
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        List[GoalResponse] containing all goals for the user, sorted by created_at descending
        
    Raises:
        HTTPException 401: If authentication fails
    """
    goals_collection = get_goals_collection()
    
    # Fetch all goals for the current user, sorted by created_at descending
    cursor = goals_collection.find(
        {"user_id": ObjectId(current_user.id)}
    ).sort("created_at", -1)
    
    goals = await cursor.to_list(length=None)
    
    # Convert MongoDB documents to GoalResponse objects
    goal_responses = []
    for goal in goals:
        goal_responses.append(
            GoalResponse(
                id=str(goal["_id"]),
                user_id=str(goal["user_id"]),
                type=GoalType(goal["type"]),
                category=goal["category"],
                title=goal["title"],
                description=goal.get("description"),
                target_value=goal["target_value"],
                current_value=goal["current_value"],
                metric=goal["metric"],
                start_date=goal["start_date"],
                end_date=goal["end_date"],
                status=GoalStatus(goal["status"]),
                created_at=goal["created_at"],
                updated_at=goal["updated_at"]
            )
        )
    
    return goal_responses


@router.get("/{id}", response_model=GoalResponse, status_code=status.HTTP_200_OK)
async def get_goal_by_id(
    id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a single goal by its ID for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches a specific goal by its ID
    - Verifies that the goal belongs to the authenticated user
    - Returns the goal object if found and owned by the user
    
    Args:
        id: The goal's unique identifier
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        GoalResponse with the requested goal data
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the goal exists but doesn't belong to the user
        HTTPException 404: If the goal is not found
    """
    goals_collection = get_goals_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Fetch the goal by ID
    goal = await goals_collection.find_one({"_id": ObjectId(id)})
    
    # Check if goal exists
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Verify the goal belongs to the current user
    if str(goal["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this goal"
        )
    
    # Return the goal
    return GoalResponse(
        id=str(goal["_id"]),
        user_id=str(goal["user_id"]),
        type=GoalType(goal["type"]),
        category=goal["category"],
        title=goal["title"],
        description=goal.get("description"),
        target_value=goal["target_value"],
        current_value=goal["current_value"],
        metric=goal["metric"],
        start_date=goal["start_date"],
        end_date=goal["end_date"],
        status=GoalStatus(goal["status"]),
        created_at=goal["created_at"],
        updated_at=goal["updated_at"]
    )


@router.put("/{id}", response_model=GoalResponse, status_code=status.HTTP_200_OK)
async def update_goal(
    id: str,
    request: UpdateGoalRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing goal for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Accepts partial updates (only provided fields will be updated)
    - Fetches the goal by its ID
    - Verifies that the goal belongs to the authenticated user
    - Updates the goal with the new data
    - Updates the updated_at timestamp
    - Returns the updated goal object
    
    Args:
        id: The goal's unique identifier
        request: UpdateGoalRequest containing partial goal data to update
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        GoalResponse with the updated goal data
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the goal exists but doesn't belong to the user
        HTTPException 404: If the goal is not found
    """
    goals_collection = get_goals_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Fetch the goal by ID
    goal = await goals_collection.find_one({"_id": ObjectId(id)})
    
    # Check if goal exists
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Verify the goal belongs to the current user
    if str(goal["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this goal"
        )
    
    # Build update data from request (only include fields that were provided)
    update_data = {}
    if request.type is not None:
        update_data["type"] = request.type.value
    if request.category is not None:
        update_data["category"] = request.category
    if request.title is not None:
        update_data["title"] = request.title
    if request.description is not None:
        update_data["description"] = request.description
    if request.target_value is not None:
        update_data["target_value"] = request.target_value
    if request.current_value is not None:
        update_data["current_value"] = request.current_value
    if request.metric is not None:
        update_data["metric"] = request.metric
    if request.start_date is not None:
        update_data["start_date"] = request.start_date
    if request.end_date is not None:
        update_data["end_date"] = request.end_date
    if request.status is not None:
        update_data["status"] = request.status.value
    
    # Always update the updated_at timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the goal in the database
    await goals_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )
    
    # Fetch the updated goal
    updated_goal = await goals_collection.find_one({"_id": ObjectId(id)})
    
    # Return the updated goal
    return GoalResponse(
        id=str(updated_goal["_id"]),
        user_id=str(updated_goal["user_id"]),
        type=GoalType(updated_goal["type"]),
        category=updated_goal["category"],
        title=updated_goal["title"],
        description=updated_goal.get("description"),
        target_value=updated_goal["target_value"],
        current_value=updated_goal["current_value"],
        metric=updated_goal["metric"],
        start_date=updated_goal["start_date"],
        end_date=updated_goal["end_date"],
        status=GoalStatus(updated_goal["status"]),
        created_at=updated_goal["created_at"],
        updated_at=updated_goal["updated_at"]
    )


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_goal(
    id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a goal for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches the goal by its ID
    - Verifies that the goal belongs to the authenticated user
    - Deletes the goal from the database
    - Returns a success message
    
    Args:
        id: The goal's unique identifier
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        dict with success message
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the goal exists but doesn't belong to the user
        HTTPException 404: If the goal is not found
    """
    goals_collection = get_goals_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Fetch the goal by ID
    goal = await goals_collection.find_one({"_id": ObjectId(id)})
    
    # Check if goal exists
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Verify the goal belongs to the current user
    if str(goal["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this goal"
        )
    
    # Delete the goal from the database
    await goals_collection.delete_one({"_id": ObjectId(id)})
    
    return {"message": "Goal deleted successfully"}