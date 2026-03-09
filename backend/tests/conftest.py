import pytest
import asyncio
from httpx import AsyncClient
from main import app
from database import Database
from config import get_settings

# Override settings for testing
def get_settings_override():
    from config import Settings
    settings = Settings()
    settings.DEBUG = True
    settings.MONGODB_URL = "mongodb://localhost:27017"
    settings.DATABASE_NAME = "yummo_delivery_test"
    return settings


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def client():
    """Create a test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def db():
    """Setup test database"""
    await Database.connect_db()
    yield Database.get_db()
    await Database.close_db()


@pytest.fixture
def test_user_data():
    """Test user data"""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "TestPassword123!",
        "full_name": "Test User",
        "role": "customer"
    }


@pytest.fixture
def test_restaurant_data():
    """Test restaurant data"""
    return {
        "name": "Test Restaurant",
        "description": "A test restaurant",
        "cuisine_types": ["Italian", "Pizza"],
        "address": "123 Test St",
        "city": "Austin",
        "phone": "+12345678901",
        "email": "restaurant@test.com",
        "opening_hours": {
            "monday": {"open": "10:00", "close": "22:00"},
            "tuesday": {"open": "10:00", "close": "22:00"},
        },
        "delivery_fee": 2.99,
        "min_order_value": 15.00
    }
