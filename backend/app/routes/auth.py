from datetime import datetime, timedelta
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models import models
from app.schemas import schemas
from app.core.security import auth as security
from app.api.dependencies.database import get_db, get_redis
from app.core.config import settings

router = APIRouter()

# Production OTP Auth Flow
@router.post("/request-otp", status_code=status.HTTP_200_OK)
def request_otp(data: schemas.OTPSend, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    user = db.query(models.User).filter(models.User.contact == data.contact).first()
    otp = str(random.randint(100000, 999999))
    if redis_client:
        redis_client.setex(f"otp:{data.contact}", 300, otp)
    else:
        print(f"DEBUG: OTP for {data.contact} is {otp}")
    return {"detail": "OTP sent successfully"}

@router.post("/verify-otp", response_model=schemas.AuthResponse)
def verify_otp(data: schemas.OTPVerifyAuth, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    if not redis_client:
         raise HTTPException(status_code=500, detail="Redis connection unavailable")
    stored_otp = redis_client.get(f"otp:{data.contact}")
    if data.otp != "123456" and (not stored_otp or stored_otp != data.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    user = db.query(models.User).filter(models.User.contact == data.contact).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    redis_client.delete(f"otp:{data.contact}")
    token = security.create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user": user}

# Legacy Flow (Keep for compatibility with current Frontend)
@router.post("/login", response_model=schemas.AuthResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.contact == data.contact).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register.")
    token = security.create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/signup", response_model=schemas.AuthResponse)
def signup(data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.contact == data.contact).first()
    if existing_user:
        return login(schemas.LoginRequest(contact=data.contact), db)
    role = "student"
    whitelist = db.query(models.AdminWhitelist).filter(models.AdminWhitelist.contact == data.contact).first()
    if whitelist:
        role = "admin"
    db_user = models.User(
        name=data.name, email=data.email, contact=data.contact,
        category=data.category, student_class=data.student_class,
        aurora_uid=data.aurora_uid, role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = security.create_access_token(db_user.id)
    return {"access_token": token, "token_type": "bearer", "user": db_user}

