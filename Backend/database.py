from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import redis

# SQLAlchemy PostgreSQL Engine with Connection Pooling
# pool_size: number of persistent connections
# max_overflow: max additional connections during peak load
# pool_pre_ping: test connection before using it (robustness)
engine = create_engine(
    settings.database_url,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Redis Client for Caching
redis_client = redis.from_url(settings.redis_connection_url, decode_responses=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
