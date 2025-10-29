from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

# MongoDB client instance
client: AsyncIOMotorClient = None


async def connect_to_mongo():
    """Connect to MongoDB Atlas"""
    global client
    client = AsyncIOMotorClient(settings.mongodb_uri, tlsAllowInvalidCertificates=True)
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


def get_users_collection():
    """Get the users collection"""
    db = get_database()
    return db.users


def get_profiles_collection():
    """Get the profiles collection"""
    db = get_database()
    return db.profiles


def get_game_stats_collection():
    """Get the game_stats collection"""
    db = get_database()
    return db.game_stats


def get_training_sessions_collection():
    """Get the training_sessions collection"""
    db = get_database()
    return db.training_sessions


def get_goals_collection():
    """Get the goals collection"""
    db = get_database()
    return db.goals


def get_ai_summaries_collection():
    """Get the ai_summaries collection"""
    db = get_database()
    return db.ai_summaries


def get_share_links_collection():
    """Get the share_links collection"""
    db = get_database()
    return db.share_links


async def ping_database() -> bool:
    """Ping the database to check connectivity"""
    try:
        await client.admin.command('ping')
        return True
    except Exception as e:
        print(f"Database ping failed: {e}")
        return False