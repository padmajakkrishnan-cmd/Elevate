from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, time
from datetime import date as date_type
from backend.models.training_session import TrainingSession
from backend.models.user import User, PyObjectId
from backend.database import get_training_sessions_collection
from backend.dependencies.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/api/v1/training-sessions", tags=["training-sessions"])


class CreateTrainingSessionRequest(BaseModel):
    """Request model for creating a training session"""
    date: date_type = Field(..., description="Date of the training session")
    drill_type: str = Field(..., description="Type of drill performed", min_length=1, max_length=100)
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Training metrics and measurements")
    notes: Optional[str] = Field(None, description="Additional notes about the training session", max_length=1000)

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-01-15",
                "drill_type": "Shooting Practice",
                "metrics": {
                    "shots_attempted": 100,
                    "shots_made": 75,
                    "accuracy": 75.0,
                    "duration_minutes": 45
                },
                "notes": "Focused on three-point shooting from the corners"
            }
        }


class UpdateTrainingSessionRequest(BaseModel):
    """Request model for updating a training session (all fields optional)"""
    date: Optional[date_type] = Field(None, description="Date of the training session")
    drill_type: Optional[str] = Field(None, description="Type of drill performed", min_length=1, max_length=100)
    metrics: Optional[Dict[str, Any]] = Field(None, description="Training metrics and measurements")
    notes: Optional[str] = Field(None, description="Additional notes about the training session", max_length=1000)

    class Config:
        json_schema_extra = {
            "example": {
                "drill_type": "Shooting Practice - Updated",
                "metrics": {
                    "shots_attempted": 120,
                    "shots_made": 90,
                    "accuracy": 75.0,
                    "duration_minutes": 50
                },
                "notes": "Updated notes: Improved accuracy on corner threes"
            }
        }


class TrainingSessionResponse(BaseModel):
    """Response model for training session operations"""
    id: str = Field(..., description="Training session's unique identifier")
    user_id: str = Field(..., description="Reference to the user who owns this training session")
    date: date_type = Field(..., description="Date of the training session")
    drill_type: str = Field(..., description="Type of drill performed")
    metrics: Dict[str, Any] = Field(..., description="Training metrics and measurements")
    notes: Optional[str] = Field(None, description="Additional notes about the training session")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


@router.post("", response_model=TrainingSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_training_session(
    request: CreateTrainingSessionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new training session for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Creates a new training session document in the training_sessions collection
    - Links the training session to the authenticated user's ID
    - Returns the newly created training session
    
    Args:
        request: CreateTrainingSessionRequest containing training session data
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        TrainingSessionResponse with the newly created training session data
        
    Raises:
        HTTPException 401: If authentication fails
    """
    training_sessions_collection = get_training_sessions_collection()
    
    # Create new training session document
    now = datetime.utcnow()
    training_session_data = {
        "user_id": ObjectId(current_user.id),
        "date": datetime.combine(request.date, time(12, 0)),
        "drill_type": request.drill_type,
        "metrics": request.metrics if request.metrics else {},
        "notes": request.notes,
        "created_at": now,
        "updated_at": now
    }
    
    # Insert training session into database
    result = await training_sessions_collection.insert_one(training_session_data)
    training_session_id = str(result.inserted_id)
    
    # Return the created training session
    return TrainingSessionResponse(
        id=training_session_id,
        user_id=str(current_user.id),
        date=training_session_data["date"].date(),
        drill_type=request.drill_type,
        metrics=request.metrics if request.metrics else {},
        notes=request.notes,
        created_at=now,
        updated_at=now
    )


@router.get("", response_model=List[TrainingSessionResponse], status_code=status.HTTP_200_OK)
async def get_all_training_sessions(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all training sessions for the authenticated user.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches all training sessions belonging to the authenticated user
    - Sorts sessions by date in descending order (most recent first)
    - Returns an array of training session objects
    
    Args:
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        List[TrainingSessionResponse] with all training sessions for the user
        
    Raises:
        HTTPException 401: If authentication fails
    """
    training_sessions_collection = get_training_sessions_collection()
    
    # Query all training sessions for the current user, sorted by date descending
    cursor = training_sessions_collection.find(
        {"user_id": ObjectId(current_user.id)}
    ).sort("date", -1)
    
    # Convert cursor to list and transform documents to response models
    training_sessions = []
    async for session_doc in cursor:
        training_sessions.append(
            TrainingSessionResponse(
                id=str(session_doc["_id"]),
                user_id=str(session_doc["user_id"]),
                date=session_doc["date"].date() if isinstance(session_doc["date"], datetime) else session_doc["date"],
                drill_type=session_doc["drill_type"],
                metrics=session_doc.get("metrics", {}),
                notes=session_doc.get("notes"),
                created_at=session_doc["created_at"],
                updated_at=session_doc["updated_at"]
            )
        )
    
    return training_sessions


@router.get("/{id}", response_model=TrainingSessionResponse, status_code=status.HTTP_200_OK)
async def get_training_session(
    id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a single training session by its ID.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches a specific training session by its ID
    - Verifies that the session belongs to the authenticated user
    - Returns the training session if found and owned by the user
    
    Args:
        id: The training session ID to retrieve
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        TrainingSessionResponse with the requested training session data
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the session exists but doesn't belong to the user
        HTTPException 404: If the session is not found
    """
    training_sessions_collection = get_training_sessions_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training session not found"
        )
    
    # Fetch the training session by ID
    session_doc = await training_sessions_collection.find_one({"_id": ObjectId(id)})
    
    # Check if session exists
    if not session_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training session not found"
        )
    
    # Verify that the session belongs to the current user
    if str(session_doc["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this training session"
        )
    
    # Return the training session
    return TrainingSessionResponse(
        id=str(session_doc["_id"]),
        user_id=str(session_doc["user_id"]),
        date=session_doc["date"].date() if isinstance(session_doc["date"], datetime) else session_doc["date"],
        drill_type=session_doc["drill_type"],
        metrics=session_doc.get("metrics", {}),
        notes=session_doc.get("notes"),
        created_at=session_doc["created_at"],
        updated_at=session_doc["updated_at"]
    )


@router.put("/{id}", response_model=TrainingSessionResponse, status_code=status.HTTP_200_OK)
async def update_training_session(
    id: str,
    request: UpdateTrainingSessionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing training session by its ID.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches a specific training session by its ID
    - Verifies that the session belongs to the authenticated user
    - Updates the session with the provided data (partial updates supported)
    - Updates the updated_at timestamp
    - Returns the updated training session
    
    Args:
        id: The training session ID to update
        request: UpdateTrainingSessionRequest containing fields to update
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        TrainingSessionResponse with the updated training session data
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the session exists but doesn't belong to the user
        HTTPException 404: If the session is not found
    """
    training_sessions_collection = get_training_sessions_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training session not found"
        )
    
    # Fetch the training session by ID
    session_doc = await training_sessions_collection.find_one({"_id": ObjectId(id)})
    
    # Check if session exists
    if not session_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training session not found"
        )
    
    # Verify that the session belongs to the current user
    if str(session_doc["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this training session"
        )
    
    # Build update data from request (only include fields that were provided)
    update_data = {}
    if request.date is not None:
        update_data["date"] = datetime.combine(request.date, time(12, 0))
    if request.drill_type is not None:
        update_data["drill_type"] = request.drill_type
    if request.metrics is not None:
        update_data["metrics"] = request.metrics
    if request.notes is not None:
        update_data["notes"] = request.notes
    
    # Always update the updated_at timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the training session in the database
    await training_sessions_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )
    
    # Fetch the updated session to return
    updated_session_doc = await training_sessions_collection.find_one({"_id": ObjectId(id)})
    
    # Return the updated training session
    return TrainingSessionResponse(
        id=str(updated_session_doc["_id"]),
        user_id=str(updated_session_doc["user_id"]),
        date=updated_session_doc["date"].date() if isinstance(updated_session_doc["date"], datetime) else updated_session_doc["date"],
        drill_type=updated_session_doc["drill_type"],
        metrics=updated_session_doc.get("metrics", {}),
        notes=updated_session_doc.get("notes"),
        created_at=updated_session_doc["created_at"],
        updated_at=updated_session_doc["updated_at"]
    )


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_training_session(
    id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a training session by its ID.
    
    This endpoint:
    - Requires authentication via JWT token
    - Fetches a specific training session by its ID
    - Verifies that the session belongs to the authenticated user
    - Deletes the session from the database
    - Returns a success message
    
    Args:
        id: The training session ID to delete
        current_user: The authenticated user (injected by get_current_user dependency)
        
    Returns:
        Dict with success message
        
    Raises:
        HTTPException 401: If authentication fails
        HTTPException 403: If the session exists but doesn't belong to the user
        HTTPException 404: If the session is not found
    """
    training_sessions_collection = get_training_sessions_collection()
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training session not found"
        )
    
    # Fetch the training session by ID
    session_doc = await training_sessions_collection.find_one({"_id": ObjectId(id)})
    
    # Check if session exists
    if not session_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training session not found"
        )
    
    # Verify that the session belongs to the current user
    if str(session_doc["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this training session"
        )
    
    # Delete the training session from the database
    await training_sessions_collection.delete_one({"_id": ObjectId(id)})
    
    # Return success message
    return {"message": "Training session deleted successfully"}