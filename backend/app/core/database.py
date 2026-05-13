from sqlalchemy import create_all, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import redis
from app.core.config import settings

# Engine setup
connect_args = {"check_same_thread": False} if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {}

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI, 
    connect_args=connect_args,
    pool_size=20,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis Client
def get_redis_client():
    if not settings.REDIS_URL:
        return None
    try:
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        client.ping()
        return client
    except Exception as e:
        print(f"Redis Connection Error: {e}")
        return None

redis_client = get_redis_client()

