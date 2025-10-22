from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.database import connect_to_mongo, close_mongo_connection, ping_database
from backend.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events"""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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