from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import UserRole, OrderStatus, PaymentStatus


# ============ Auth Schemas ============
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None


# ============ User Schemas ============
class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    role: UserRole = UserRole.CUSTOMER


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    profile_image: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    profile_image: Optional[str] = None


# ============ Restaurant Schemas ============
class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    category: str
    preparation_time: int
    dietary_info: Optional[List[str]] = None


class MenuItemResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    category: str
    is_available: bool
    preparation_time: int
    dietary_info: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RestaurantCreate(BaseModel):
    name: str
    description: str
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    cuisine_types: List[str]
    address: str
    city: str
    phone: str
    email: EmailStr
    opening_hours: dict
    delivery_fee: float = 0.0
    min_order_value: float = 0.0


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    cuisine_types: Optional[List[str]] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    opening_hours: Optional[dict] = None
    delivery_fee: Optional[float] = None
    min_order_value: Optional[float] = None


class RestaurantResponse(BaseModel):
    id: str
    vendor_id: str
    name: str
    description: str
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    cuisine_types: List[str]
    rating: float
    reviews_count: int
    address: str
    city: str
    phone: str
    email: str
    delivery_fee: float
    min_order_value: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RestaurantDetailResponse(RestaurantResponse):
    menu_items: List[MenuItemResponse] = []


# ============ Order Schemas ============
class OrderItemRequest(BaseModel):
    menu_item_id: str
    quantity: int
    special_instructions: Optional[str] = None


class OrderCreateRequest(BaseModel):
    restaurant_id: str
    items: List[OrderItemRequest]
    delivery_address: str
    delivery_city: str
    delivery_postal_code: str
    special_instructions: Optional[str] = None
    payment_method: str = "card"


class OrderResponse(BaseModel):
    id: str
    user_id: str
    restaurant_id: str
    items: List[dict]
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    tax: float
    total: float
    delivery_address: str
    delivery_city: str
    delivery_postal_code: str
    special_instructions: Optional[str] = None
    estimated_delivery_time: Optional[int] = None
    payment_status: PaymentStatus
    payment_method: str
    created_at: datetime
    updated_at: datetime
    delivered_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderUpdateRequest(BaseModel):
    status: Optional[OrderStatus] = None
    special_instructions: Optional[str] = None


class OrderTrackingResponse(BaseModel):
    id: str
    status: OrderStatus
    estimated_delivery_time: Optional[int] = None
    current_location: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


# ============ Payment Schemas ============
class PaymentIntentRequest(BaseModel):
    order_id: str
    amount: float
    currency: str = "usd"


class PaymentIntentResponse(BaseModel):
    client_secret: str
    publishable_key: str


class PaymentWebhookRequest(BaseModel):
    payment_intent_id: str
    status: str
    order_id: str


# ============ Review Schemas ============
class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str


class ReviewResponse(BaseModel):
    id: str
    user_id: str
    restaurant_id: str
    rating: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Search/Filter Schemas ============
class RestaurantSearchRequest(BaseModel):
    query: Optional[str] = None
    city: Optional[str] = None
    cuisine_type: Optional[str] = None
    min_rating: Optional[float] = None
    skip: int = 0
    limit: int = 10


class OrderStatusUpdateRequest(BaseModel):
    status: OrderStatus
    estimated_delivery_time: Optional[int] = None
