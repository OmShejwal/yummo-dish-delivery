from datetime import datetime
from typing import Optional, List, Any
from enum import Enum
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return str(ObjectId(v))

    @classmethod
    def __get_pydantic_json_schema__(cls, handler: GetJsonSchemaHandler, info: Any) -> JsonSchemaValue:
        json_schema = handler(str)
        json_schema = handler.resolve_ref_schema(json_schema)
        json_schema['type'] = 'string'
        json_schema['pattern'] = '^[0-9a-f]{24}$'
        return json_schema


class UserRole(str, Enum):
    CUSTOMER = "customer"
    VENDOR = "vendor"
    ADMIN = "admin"


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    username: str
    password_hash: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    profile_image: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    google_id: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class MenuItem(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    restaurant_id: PyObjectId
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    category: str
    is_available: bool = True
    preparation_time: int  # in minutes
    dietary_info: Optional[List[str]] = None  # vegan, gluten-free, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Restaurant(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    vendor_id: PyObjectId
    name: str
    description: str
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    cuisine_types: List[str]
    rating: float = 0.0
    reviews_count: int = 0
    address: str
    city: str
    phone: str
    email: str
    opening_hours: dict  # {"monday": {"open": "09:00", "close": "23:00"}}
    is_active: bool = True
    delivery_fee: float = 0.0
    min_order_value: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class OrderItem(BaseModel):
    menu_item_id: PyObjectId
    quantity: int
    price: float
    special_instructions: Optional[str] = None


class Order(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    restaurant_id: PyObjectId
    items: List[OrderItem]
    status: OrderStatus = OrderStatus.PENDING
    subtotal: float
    delivery_fee: float
    tax: float
    total: float
    delivery_address: str
    delivery_city: str
    delivery_postal_code: str
    special_instructions: Optional[str] = None
    estimated_delivery_time: Optional[int] = None  # in minutes
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: str  # "card", "cash", etc.
    stripe_payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    delivered_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Review(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    restaurant_id: PyObjectId
    order_id: PyObjectId
    rating: int  # 1-5
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
