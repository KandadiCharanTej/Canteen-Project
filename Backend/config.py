from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Base
    PROJECT_NAME: str = "CanteenFood"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "PRODUCTION_SECRET_KEY_CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "canteen"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @property
    def database_url(self) -> str:
        if self.SQLALCHEMY_DATABASE_URI:
            return self.SQLALCHEMY_DATABASE_URI
        # Fallback to SQLite for local development
        return "sqlite:///./canteen.db"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: Optional[str] = None

    @property
    def redis_connection_url(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # Cloud Storage (Images)
    CLOUDINARY_URL: Optional[str] = None
    
    # Security
    CORS_ORIGINS: str = "*"
    
    # SMS (Fast2SMS)
    SMS_API_KEY: Optional[str] = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
