from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    app_env: str = "development"
    port: int = 8000
    mongodb_uri: str
    jwt_secret: str
    jwt_expires_in: int = 604800
    cors_origins: str = "http://localhost:5173"
    firebase_project_id: str = "elevate-a5140"
    firebase_private_key: str = ""
    firebase_client_email: str = ""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash-exp"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = "backend/.env"
        case_sensitive = False


settings = Settings()