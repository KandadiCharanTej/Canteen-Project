from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import redis

# Database Engine Setup
db_url = settings.database_url
is_sqlite = db_url.startswith("sqlite")

if is_sqlite:
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    # PostgreSQL with Connection Pooling
    engine = create_engine(
        db_url,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Redis Client with Fallback
try:
    redis_client = redis.from_url(settings.redis_connection_url, decode_responses=True)
    redis_client.ping() # Test connection
except Exception:
    print("WARNING: Redis not connected. Caching disabled.")
    redis_client = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
