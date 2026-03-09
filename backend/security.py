from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import get_settings
from schemas import TokenData

settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer for JWT
security = HTTPBearer()


class JWTHandler:
    """Handle JWT token creation and verification"""

    @staticmethod
    def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def create_access_token(user_id: str, email: str) -> str:
        """Create access token"""
        data = {"user_id": user_id, "email": email}
        return JWTHandler.create_token(data)

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create refresh token"""
        data = {"user_id": user_id}
        expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        return JWTHandler.create_token(data, expires_delta)

    @staticmethod
    def verify_token(token: str) -> TokenData:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            email: str = payload.get("email")
            user_id: str = payload.get("user_id")
            if email is None and user_id is None:
                raise JWTError("Invalid token")
            token_data = TokenData(email=email, user_id=user_id)
            return token_data
        except JWTError:
            raise JWTError("Invalid token")


class PasswordHandler:
    """Handle password hashing and verification"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenData:
    """Get current user from JWT token"""
    token = credentials.credentials
    try:
        token_data = JWTHandler.verify_token(token)
        if token_data.user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        return token_data
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


async def get_current_admin(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    """Get current admin user"""
    # This will be verified in the service layer
    return current_user


async def get_current_vendor(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    """Get current vendor user"""
    # This will be verified in the service layer
    return current_user


# Google OAuth helper (for callback handling)
class GoogleOAuthHandler:
    """Handle Google OAuth operations"""

    @staticmethod
    def get_google_oauth_url() -> str:
        """Get Google OAuth URL"""
        from google.auth.transport.requests import Request
        from google.oauth2.service_account import Credentials

        # This is a simplified version. In production, use proper OAuth flow
        scope = [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ]
        return f"""https://accounts.google.com/o/oauth2/v2/auth?
        client_id={settings.GOOGLE_CLIENT_ID}&
        redirect_uri={settings.GOOGLE_REDIRECT_URL}&
        response_type=code&
        scope={'+'.join(scope)}"""
