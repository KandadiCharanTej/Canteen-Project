import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Base
    PROJECT_NAME: str = "QuickBite"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "PRODUCTION_SECRET_KEY_CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    # Database
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./quickbite.db"
    
    # Redis
    REDIS_URL: Optional[str] = None
    
    # Security
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

