from fastapi import APIRouter, HTTPException, status, Depends, Query
from schemas import OrderStatusUpdateRequest, UserResponse
from security import get_current_user, get_current_admin
from database import get_database
from models import OrderStatus, UserRole
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])


async def verify_admin(current_user=Depends(get_current_user), db=Depends(get_database)):
    """Verify user is admin"""
    users_collection = db["users"]
    user = await users_collection.find_one(
        {"_id": ObjectId(current_user.user_id)}
    )
    if not user or user.get("role") != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/stats")
async def get_admin_stats(
    admin_user=Depends(verify_admin),
    db=Depends(get_database),
):
    """Get admin dashboard statistics"""
    users_collection = db["users"]
    restaurants_collection = db["restaurants"]
    orders_collection = db["orders"]
    
    total_users = await users_collection.count_documents({})
    total_restaurants = await restaurants_collection.count_documents({})
    total_orders = await orders_collection.count_documents({})
    
    # Revenue calculation
    revenue_result = await orders_collection.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]).to_list(1)
    
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Pending orders
    pending_orders = await orders_collection.count_documents(
        {"status": OrderStatus.PENDING}
    )
    
    return {
        "total_users": total_users,
        "total_restaurants": total_restaurants,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "pending_orders": pending_orders,
    }


@router.get("/users")
async def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    admin_user=Depends(verify_admin),
    db=Depends(get_database),
):
    """List all users (admin only)"""
    users_collection = db["users"]
    
    cursor = users_collection.find().skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    return [
        UserResponse(
            id=str(u["_id"]),
            email=u["email"],
            username=u["username"],
            full_name=u["full_name"],
            phone=u.get("phone"),
            role=u["role"],
            profile_image=u.get("profile_image"),
            address=u.get("address"),
            city=u.get("city"),
            postal_code=u.get("postal_code"),
            is_active=u["is_active"],
            is_verified=u["is_verified"],
            created_at=u["created_at"],
        )
        for u in users
    ]


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdateRequest,
    admin_user=Depends(verify_admin),
    db=Depends(get_database),
):
    """Update order status (admin only)"""
    orders_collection = db["orders"]
    
    try:
        result = await orders_collection.find_one_and_update(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "status": status_update.status,
                    "estimated_delivery_time": status_update.estimated_delivery_time,
                    "updated_at": datetime.utcnow(),
                }
            },
            return_document=True
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return {
        "id": str(result["_id"]),
        "status": result["status"],
        "updated_at": result["updated_at"],
    }


@router.post("/users/{user_id}/verify")
async def verify_user(
    user_id: str,
    admin_user=Depends(verify_admin),
    db=Depends(get_database),
):
    """Verify a user email (admin only)"""
    users_collection = db["users"]
    
    try:
        result = await users_collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_verified": True, "updated_at": datetime.utcnow()}},
            return_document=True
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"success": True, "message": "User verified"}


@router.post("/restaurants/{restaurant_id}/toggle")
async def toggle_restaurant(
    restaurant_id: str,
    admin_user=Depends(verify_admin),
    db=Depends(get_database),
):
    """Toggle restaurant active status (admin only)"""
    restaurants_collection = db["restaurants"]
    
    try:
        restaurant = await restaurants_collection.find_one(
            {"_id": ObjectId(restaurant_id)}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid restaurant ID"
        )
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    new_status = not restaurant["is_active"]
    
    result = await restaurants_collection.find_one_and_update(
        {"_id": ObjectId(restaurant_id)},
        {"$set": {"is_active": new_status, "updated_at": datetime.utcnow()}},
        return_document=True
    )
    
    return {"id": restaurant_id, "is_active": new_status}
