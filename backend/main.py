from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_to_mongo, close_mongo_connection, ping_database
from config import settings
from routers import auth, profile, game_stats, training_sessions, goals, insights, share, ai_insights


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events"""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(lifespan=lifespan)

# Configure CORS - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(game_stats.router)
app.include_router(training_sessions.router)
app.include_router(goals.router)
app.include_router(insights.router)
app.include_router(share.router)
app.include_router(ai_insights.router)


@app.get("/healthz")
async def health_check():
    """Health check endpoint that verifies database connectivity"""
    is_connected = await ping_database()
    
    if is_connected:
        return {
            "status": "ok",
            "database": "connected"
        }
    else:
        return {
            "status": "error",
            "database": "disconnected"
        }