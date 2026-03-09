from fastapi import APIRouter, HTTPException, status, Depends, Query
from schemas import (
    OrderCreateRequest,
    OrderResponse,
    OrderUpdateRequest,
    OrderTrackingResponse,
    OrderStatusUpdateRequest,
)
from security import get_current_user
from database import get_database
from models import Order, OrderStatus, PaymentStatus, OrderItem
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Create a new order"""
    orders_collection = db["orders"]
    restaurants_collection = db["restaurants"]
    menu_items_collection = db["menu_items"]
    
    # Verify restaurant exists
    try:
        restaurant = await restaurants_collection.find_one(
            {"_id": ObjectId(order_data.restaurant_id), "is_active": True}
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
    
    # Calculate totals
    subtotal = 0.0
    items = []
    
    for item_request in order_data.items:
        try:
            menu_item = await menu_items_collection.find_one(
                {"_id": ObjectId(item_request.menu_item_id)}
            )
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid menu item ID: {item_request.menu_item_id}"
            )
        
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item not found: {item_request.menu_item_id}"
            )
        
        item_total = menu_item["price"] * item_request.quantity
        subtotal += item_total
        
        items.append(OrderItem(
            menu_item_id=ObjectId(item_request.menu_item_id),
            quantity=item_request.quantity,
            price=menu_item["price"],
            special_instructions=item_request.special_instructions,
        ))
    
    # Check minimum order value
    if subtotal < restaurant.get("min_order_value", 0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order must be at least ${restaurant.get('min_order_value', 0)}"
        )
    
    # Calculate totals
    delivery_fee = restaurant.get("delivery_fee", 0.0)
    tax = round(subtotal * 0.1, 2)  # 10% tax
    total = subtotal + delivery_fee + tax
    
    order = Order(
        user_id=ObjectId(current_user.user_id),
        restaurant_id=ObjectId(order_data.restaurant_id),
        items=items,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        tax=tax,
        total=total,
        delivery_address=order_data.delivery_address,
        delivery_city=order_data.delivery_city,
        delivery_postal_code=order_data.delivery_postal_code,
        special_instructions=order_data.special_instructions,
        payment_method=order_data.payment_method,
        estimated_delivery_time=30,  # Default 30 minutes
    )
    
    result = await orders_collection.insert_one(order.dict(by_alias=True))
    order_id = str(result.inserted_id)
    
    return OrderResponse(
        id=order_id,
        user_id=current_user.user_id,
        restaurant_id=order_data.restaurant_id,
        items=[item.dict() for item in items],
        status=OrderStatus.PENDING,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        tax=tax,
        total=total,
        delivery_address=order_data.delivery_address,
        delivery_city=order_data.delivery_city,
        delivery_postal_code=order_data.delivery_postal_code,
        special_instructions=order_data.special_instructions,
        estimated_delivery_time=30,
        payment_status=PaymentStatus.PENDING,
        payment_method=order_data.payment_method,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@router.get("/", response_model=list[OrderResponse])
async def get_orders(
    status: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Get user's orders"""
    orders_collection = db["orders"]
    
    query = {"user_id": ObjectId(current_user.user_id)}
    if status:
        query["status"] = status
    
    cursor = orders_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    orders = await cursor.to_list(length=limit)
    
    return [
        OrderResponse(
            id=str(o["_id"]),
            user_id=str(o["user_id"]),
            restaurant_id=str(o["restaurant_id"]),
            items=o["items"],
            status=o["status"],
            subtotal=o["subtotal"],
            delivery_fee=o["delivery_fee"],
            tax=o["tax"],
            total=o["total"],
            delivery_address=o["delivery_address"],
            delivery_city=o["delivery_city"],
            delivery_postal_code=o["delivery_postal_code"],
            special_instructions=o.get("special_instructions"),
            estimated_delivery_time=o.get("estimated_delivery_time"),
            payment_status=o["payment_status"],
            payment_method=o["payment_method"],
            created_at=o["created_at"],
            updated_at=o["updated_at"],
            delivered_at=o.get("delivered_at"),
        )
        for o in orders
    ]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Get order details"""
    orders_collection = db["orders"]
    
    try:
        order = await orders_collection.find_one(
            {"_id": ObjectId(order_id)}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Verify ownership
    if str(order["user_id"]) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return OrderResponse(
        id=str(order["_id"]),
        user_id=str(order["user_id"]),
        restaurant_id=str(order["restaurant_id"]),
        items=order["items"],
        status=order["status"],
        subtotal=order["subtotal"],
        delivery_fee=order["delivery_fee"],
        tax=order["tax"],
        total=order["total"],
        delivery_address=order["delivery_address"],
        delivery_city=order["delivery_city"],
        delivery_postal_code=order["delivery_postal_code"],
        special_instructions=order.get("special_instructions"),
        estimated_delivery_time=order.get("estimated_delivery_time"),
        payment_status=order["payment_status"],
        payment_method=order["payment_method"],
        created_at=order["created_at"],
        updated_at=order["updated_at"],
        delivered_at=order.get("delivered_at"),
    )


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    order_update: OrderUpdateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Update order (customer can update before confirmation)"""
    orders_collection = db["orders"]
    
    try:
        order = await orders_collection.find_one(
            {"_id": ObjectId(order_id)}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Verify ownership
    if str(order["user_id"]) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Can only update pending orders
    if order["status"] != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update pending orders"
        )
    
    update_data = {}
    if order_update.special_instructions:
        update_data["special_instructions"] = order_update.special_instructions
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await orders_collection.find_one_and_update(
        {"_id": ObjectId(order_id)},
        {"$set": update_data},
        return_document=True
    )
    
    return OrderResponse(
        id=str(result["_id"]),
        user_id=str(result["user_id"]),
        restaurant_id=str(result["restaurant_id"]),
        items=result["items"],
        status=result["status"],
        subtotal=result["subtotal"],
        delivery_fee=result["delivery_fee"],
        tax=result["tax"],
        total=result["total"],
        delivery_address=result["delivery_address"],
        delivery_city=result["delivery_city"],
        delivery_postal_code=result["delivery_postal_code"],
        special_instructions=result.get("special_instructions"),
        estimated_delivery_time=result.get("estimated_delivery_time"),
        payment_status=result["payment_status"],
        payment_method=result["payment_method"],
        created_at=result["created_at"],
        updated_at=result["updated_at"],
        delivered_at=result.get("delivered_at"),
    )


@router.get("/{order_id}/tracking", response_model=OrderTrackingResponse)
async def track_order(
    order_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Track order status"""
    orders_collection = db["orders"]
    
    try:
        order = await orders_collection.find_one(
            {"_id": ObjectId(order_id)}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Verify ownership
    if str(order["user_id"]) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return OrderTrackingResponse(
        id=str(order["_id"]),
        status=order["status"],
        estimated_delivery_time=order.get("estimated_delivery_time"),
        created_at=order["created_at"],
        updated_at=order["updated_at"],
    )
