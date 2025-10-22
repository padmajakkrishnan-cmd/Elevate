from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    app_env: str = "development"
    port: int = 8000
    mongodb_uri: str
    jwt_secret: str
    jwt_expires_in: int = 604800
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()