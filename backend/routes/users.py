from fastapi import APIRouter, HTTPException, status, Depends
from schemas import UserResponse, UserUpdateRequest
from security import get_current_user
from database import get_database
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db=Depends(get_database)
):
    """Get user profile"""
    users_collection = db["users"]
    
    try:
        user = await users_collection.find_one(
            {"_id": ObjectId(user_id)}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        username=user["username"],
        full_name=user["full_name"],
        phone=user.get("phone"),
        role=user["role"],
        profile_image=user.get("profile_image"),
        address=user.get("address"),
        city=user.get("city"),
        postal_code=user.get("postal_code"),
        is_active=user["is_active"],
        is_verified=user["is_verified"],
        created_at=user["created_at"],
    )


@router.put("/profile/update", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    """Update user profile"""
    users_collection = db["users"]
    
    update_data = {}
    if user_update.full_name:
        update_data["full_name"] = user_update.full_name
    if user_update.phone:
        update_data["phone"] = user_update.phone
    if user_update.address:
        update_data["address"] = user_update.address
    if user_update.city:
        update_data["city"] = user_update.city
    if user_update.postal_code:
        update_data["postal_code"] = user_update.postal_code
    if user_update.profile_image:
        update_data["profile_image"] = user_update.profile_image
    
    update_data["updated_at"] = __import__("datetime").datetime.utcnow()
    
    result = await users_collection.find_one_and_update(
        {"_id": ObjectId(current_user.user_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(result["_id"]),
        email=result["email"],
        username=result["username"],
        full_name=result["full_name"],
        phone=result.get("phone"),
        role=result["role"],
        profile_image=result.get("profile_image"),
        address=result.get("address"),
        city=result.get("city"),
        postal_code=result.get("postal_code"),
        is_active=result["is_active"],
        is_verified=result["is_verified"],
        created_at=result["created_at"],
    )
