from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import get_settings
import asyncio

settings = get_settings()

class Database:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None

    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
            # Test the connection
            await cls.client.admin.command('ping')
            cls.db = cls.client[settings.DATABASE_NAME]
            print(f"✅ Connected to MongoDB database: {settings.DATABASE_NAME}")
        except Exception as e:
            print(f"⚠️  MongoDB connection failed: {e}")
            print("🔄 Running in offline mode with mock data")
            # Create a mock database object for development
            cls.db = MockDatabase()

    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("🛑 MongoDB connection closed")

    @classmethod
    def get_db(cls) -> AsyncIOMotorDatabase:
        """Get database instance"""
        return cls.db


class MockDatabase:
    """Mock database for development when MongoDB is not available"""
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection()
        return self.collections[name]


class MockCollection:
    """Mock collection for development"""
    def __init__(self):
        self.data = []

    async def find_one(self, query):
        # Return mock restaurant data
        if "restaurants" in str(query):
            return {
                "_id": "mock_restaurant_1",
                "vendor_id": "vendor1",
                "name": "Bella Napoli",
                "description": "Authentic Italian cuisine",
                "cuisine_types": ["Italian"],
                "rating": 4.8,
                "reviews_count": 342,
                "address": "123 Main Street",
                "city": "New York",
                "phone": "+1234567890",
                "email": "info@bellanapoli.com",
                "delivery_fee": 2.99,
                "min_order_value": 15.00,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        return None

    async def find(self, query=None):
        # Return mock restaurants
        mock_restaurants = [
            {
                "_id": "r1",
                "vendor_id": "vendor1",
                "name": "Bella Napoli",
                "description": "Authentic Italian cuisine",
                "cuisine_types": ["Italian"],
                "rating": 4.8,
                "reviews_count": 342,
                "address": "123 Main Street, Downtown",
                "city": "New York",
                "phone": "+1234567890",
                "email": "info@bellanapoli.com",
                "delivery_fee": 2.99,
                "min_order_value": 15.00,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "_id": "r2",
                "vendor_id": "vendor2",
                "name": "Tokyo Garden",
                "description": "Fresh sushi and Japanese dishes",
                "cuisine_types": ["Japanese"],
                "rating": 4.7,
                "reviews_count": 218,
                "address": "456 Oak Avenue",
                "city": "New York",
                "phone": "+1234567891",
                "email": "info@tokyogarden.com",
                "delivery_fee": 3.49,
                "min_order_value": 20.00,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
        return MockCursor(mock_restaurants)

    async def insert_one(self, document):
        # Mock successful insertion
        return type('MockResult', (), {'inserted_id': 'mock_id'})()

    async def find_one_and_update(self, query, update, **kwargs):
        # Mock successful update
        return {
            "_id": "mock_id",
            "vendor_id": "vendor1",
            "name": "Updated Restaurant",
            "is_active": True,
            "created_at": "2024-01-01T00:00:00Z"
        }


class MockCursor:
    """Mock cursor for find operations"""
    def __init__(self, data):
        self.data = data

    async def to_list(self, length=None):
        return self.data[:length] if length else self.data


# Convenience function
async def get_database() -> AsyncIOMotorDatabase | MockDatabase:
    return Database.get_db()
