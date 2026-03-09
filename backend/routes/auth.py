from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
)
from security import (
    JWTHandler,
    PasswordHandler,
    get_current_user,
    security,
)
from database import get_database
from models import User, UserRole, PyObjectId
from bson import ObjectId
from pydantic import EmailStr

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegisterRequest, db=Depends(get_database)):
    """Register a new user"""
    users_collection = db["users"]
    
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = PasswordHandler.hash_password(user_data.password)
    
    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=password_hash,
        full_name=user_data.full_name,
        role=user_data.role,
    )
    
    result = await users_collection.insert_one(user.dict(by_alias=True))
    user_id = str(result.inserted_id)
    
    # Create tokens
    access_token = JWTHandler.create_access_token(user_id, user_data.email)
    refresh_token = JWTHandler.create_refresh_token(user_id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLoginRequest, db=Depends(get_database)):
    """Login user"""
    users_collection = db["users"]
    
    # Find user
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not PasswordHandler.verify_password(
        credentials.password, user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user_id = str(user["_id"])
    
    # Create tokens
    access_token = JWTHandler.create_access_token(user_id, credentials.email)
    refresh_token = JWTHandler.create_refresh_token(user_id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_database)
):
    """Refresh access token using refresh token"""
    try:
        token_data = JWTHandler.verify_token(credentials.credentials)
        if not token_data.user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Get user from database
        users_collection = db["users"]
        user = await users_collection.find_one(
            {"_id": ObjectId(token_data.user_id)}
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new tokens
        access_token = JWTHandler.create_access_token(
            token_data.user_id, user["email"]
        )
        refresh_token = JWTHandler.create_refresh_token(token_data.user_id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/google/callback", response_model=TokenResponse)
async def google_callback(
    code: str,
    db=Depends(get_database)
):
    """Handle Google OAuth callback"""
    # This is a simplified version
    # In production, exchange code for tokens with Google
    # For now, return a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth callback not fully implemented yet"
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get current user"""
    users_collection = db["users"]
    user = await users_collection.find_one(
        {"_id": ObjectId(current_user.user_id)}
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
