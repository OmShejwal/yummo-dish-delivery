"""Database setup and indexing"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

settings = get_settings()


async def create_indexes():
    """Create MongoDB indexes for optimal performance"""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    try:
        # Users indexes
        await db["users"].create_index("email", unique=True)
        await db["users"].create_index("username", unique=True)
        await db["users"].create_index("google_id", sparse=True)
        print("✓ Created indexes for users collection")
        
        # Restaurants indexes
        await db["restaurants"].create_index("vendor_id")
        await db["restaurants"].create_index("city")
        await db["restaurants"].create_index("cuisine_types")
        await db["restaurants"].create_index([("location", "2dsphere")], sparse=True)
        print("✓ Created indexes for restaurants collection")
        
        # Menu items indexes
        await db["menu_items"].create_index("restaurant_id")
        await db["menu_items"].create_index("category")
        print("✓ Created indexes for menu_items collection")
        
        # Orders indexes
        await db["orders"].create_index("user_id")
        await db["orders"].create_index("restaurant_id")
        await db["orders"].create_index("status")
        await db["orders"].create_index("created_at")
        await db["orders"].create_index("stripe_payment_id", sparse=True)
        print("✓ Created indexes for orders collection")
        
        # Reviews indexes
        await db["reviews"].create_index("restaurant_id")
        await db["reviews"].create_index("user_id")
        await db["reviews"].create_index("order_id", unique=True)
        print("✓ Created indexes for reviews collection")
        
        print("\n✅ All indexes created successfully!")
        
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(create_indexes())
