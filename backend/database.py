from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

# MongoDB client instance
client: AsyncIOMotorClient = None


async def connect_to_mongo():
    """Connect to MongoDB Atlas"""
    global client
    client = AsyncIOMotorClient(settings.mongodb_uri)
    print("Connected to MongoDB")


async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    """Get the database instance"""
    return client.get_default_database()


async def ping_database() -> bool:
    """Ping the database to check connectivity"""
    try:
        await client.admin.command('ping')
        return True
    except Exception as e:
        print(f"Database ping failed: {e}")
        return False