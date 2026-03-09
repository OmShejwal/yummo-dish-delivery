from fastapi import APIRouter, HTTPException, status, Depends, Query
from schemas import (
    RestaurantCreate,
    RestaurantUpdate,
    RestaurantResponse,
    RestaurantDetailResponse,
    MenuItemCreate,
    MenuItemResponse,
    RestaurantSearchRequest,
)
from security import get_current_user, get_current_vendor
from database import get_database
from models import Restaurant, MenuItem, PyObjectId
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.get("/", response_model=list[RestaurantResponse])
async def list_restaurants(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    city: str = None,
    cuisine_type: str = None,
    min_rating: float = Query(None, ge=0, le=5),
    db=Depends(get_database),
):
    """List all restaurants with filters"""
    restaurants_collection = db["restaurants"]
    
    # Build query
    query = {"is_active": True}
    if city:
        query["city"] = city
    if cuisine_type:
        query["cuisine_types"] = {"$in": [cuisine_type]}
    if min_rating is not None:
        query["rating"] = {"$gte": min_rating}
    
    # Get restaurants
    cursor = restaurants_collection.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(length=limit)
    
    return [
        RestaurantResponse(
            id=str(r["_id"]),
            vendor_id=str(r["vendor_id"]),
            name=r["name"],
            description=r["description"],
            logo_url=r.get("logo_url"),
            banner_url=r.get("banner_url"),
            cuisine_types=r["cuisine_types"],
            rating=r.get("rating", 0.0),
            reviews_count=r.get("reviews_count", 0),
            address=r["address"],
            city=r["city"],
            phone=r["phone"],
            email=r["email"],
            delivery_fee=r.get("delivery_fee", 0.0),
            min_order_value=r.get("min_order_value", 0.0),
            is_active=r["is_active"],
            created_at=r["created_at"],
        )
        for r in restaurants
    ]


@router.get("/{restaurant_id}", response_model=RestaurantDetailResponse)
async def get_restaurant(restaurant_id: str, db=Depends(get_database)):
    """Get restaurant details with menu items"""
    restaurants_collection = db["restaurants"]
    menu_items_collection = db["menu_items"]
    
    try:
        restaurant = await restaurants_collection.find_one(
            {"_id": ObjectId(restaurant_id), "is_active": True}
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
    
    # Get menu items
    cursor = menu_items_collection.find(
        {"restaurant_id": ObjectId(restaurant_id), "is_available": True}
    )
    menu_items = await cursor.to_list(length=500)
    
    menu_items_response = [
        MenuItemResponse(
            id=str(m["_id"]),
            name=m["name"],
            description=m["description"],
            price=m["price"],
            image_url=m.get("image_url"),
            category=m["category"],
            is_available=m["is_available"],
            preparation_time=m["preparation_time"],
            dietary_info=m.get("dietary_info"),
            created_at=m["created_at"],
        )
        for m in menu_items
    ]
    
    return RestaurantDetailResponse(
        id=str(restaurant["_id"]),
        vendor_id=str(restaurant["vendor_id"]),
        name=restaurant["name"],
        description=restaurant["description"],
        logo_url=restaurant.get("logo_url"),
        banner_url=restaurant.get("banner_url"),
        cuisine_types=restaurant["cuisine_types"],
        rating=restaurant.get("rating", 0.0),
        reviews_count=restaurant.get("reviews_count", 0),
        address=restaurant["address"],
        city=restaurant["city"],
        phone=restaurant["phone"],
        email=restaurant["email"],
        delivery_fee=restaurant.get("delivery_fee", 0.0),
        min_order_value=restaurant.get("min_order_value", 0.0),
        is_active=restaurant["is_active"],
        created_at=restaurant["created_at"],
        menu_items=menu_items_response,
    )


@router.post("/", response_model=RestaurantResponse)
async def create_restaurant(
    restaurant_data: RestaurantCreate,
    current_user=Depends(get_current_vendor),
    db=Depends(get_database),
):
    """Create a new restaurant (vendor only)"""
    restaurants_collection = db["restaurants"]
    
    # Check if vendor already has a restaurant (optional, depending on business rules)
    existing = await restaurants_collection.find_one(
        {"vendor_id": ObjectId(current_user.user_id)}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vendor already has a restaurant"
        )
    
    restaurant = Restaurant(
        vendor_id=ObjectId(current_user.user_id),
        name=restaurant_data.name,
        description=restaurant_data.description,
        logo_url=restaurant_data.logo_url,
        banner_url=restaurant_data.banner_url,
        cuisine_types=restaurant_data.cuisine_types,
        address=restaurant_data.address,
        city=restaurant_data.city,
        phone=restaurant_data.phone,
        email=restaurant_data.email,
        opening_hours=restaurant_data.opening_hours,
        delivery_fee=restaurant_data.delivery_fee,
        min_order_value=restaurant_data.min_order_value,
    )
    
    result = await restaurants_collection.insert_one(
        restaurant.dict(by_alias=True)
    )
    
    return RestaurantResponse(
        id=str(result.inserted_id),
        vendor_id=current_user.user_id,
        name=restaurant_data.name,
        description=restaurant_data.description,
        logo_url=restaurant_data.logo_url,
        banner_url=restaurant_data.banner_url,
        cuisine_types=restaurant_data.cuisine_types,
        rating=0.0,
        reviews_count=0,
        address=restaurant_data.address,
        city=restaurant_data.city,
        phone=restaurant_data.phone,
        email=restaurant_data.email,
        delivery_fee=restaurant_data.delivery_fee,
        min_order_value=restaurant_data.min_order_value,
        is_active=True,
        created_at=datetime.utcnow(),
    )


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: str,
    restaurant_data: RestaurantUpdate,
    current_user=Depends(get_current_vendor),
    db=Depends(get_database),
):
    """Update restaurant (vendor only)"""
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
    
    # Verify ownership
    if str(restaurant["vendor_id"]) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this restaurant"
        )
    
    update_data = restaurant_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    result = await restaurants_collection.find_one_and_update(
        {"_id": ObjectId(restaurant_id)},
        {"$set": update_data},
        return_document=True
    )
    
    return RestaurantResponse(
        id=str(result["_id"]),
        vendor_id=str(result["vendor_id"]),
        name=result["name"],
        description=result["description"],
        logo_url=result.get("logo_url"),
        banner_url=result.get("banner_url"),
        cuisine_types=result["cuisine_types"],
        rating=result.get("rating", 0.0),
        reviews_count=result.get("reviews_count", 0),
        address=result["address"],
        city=result["city"],
        phone=result["phone"],
        email=result["email"],
        delivery_fee=result.get("delivery_fee", 0.0),
        min_order_value=result.get("min_order_value", 0.0),
        is_active=result["is_active"],
        created_at=result["created_at"],
    )


# ============ Menu Items Routes ============

@router.post("/{restaurant_id}/menu-items", response_model=MenuItemResponse)
async def add_menu_item(
    restaurant_id: str,
    item_data: MenuItemCreate,
    current_user=Depends(get_current_vendor),
    db=Depends(get_database),
):
    """Add menu item to restaurant"""
    restaurants_collection = db["restaurants"]
    menu_items_collection = db["menu_items"]
    
    # Verify restaurant ownership
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
    
    if str(restaurant["vendor_id"]) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    menu_item = MenuItem(
        restaurant_id=ObjectId(restaurant_id),
        name=item_data.name,
        description=item_data.description,
        price=item_data.price,
        image_url=item_data.image_url,
        category=item_data.category,
        preparation_time=item_data.preparation_time,
        dietary_info=item_data.dietary_info,
    )
    
    result = await menu_items_collection.insert_one(
        menu_item.dict(by_alias=True)
    )
    
    return MenuItemResponse(
        id=str(result.inserted_id),
        name=item_data.name,
        description=item_data.description,
        price=item_data.price,
        image_url=item_data.image_url,
        category=item_data.category,
        is_available=True,
        preparation_time=item_data.preparation_time,
        dietary_info=item_data.dietary_info,
        created_at=datetime.utcnow(),
    )
