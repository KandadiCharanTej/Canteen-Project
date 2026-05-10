from datetime import datetime, timedelta
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
import security
from deps import get_db, get_redis
from config import settings

router = APIRouter()

@router.post("/send-otp")
def send_otp(data: schemas.OTPSend, db: Session = Depends(get_db)):
    # Rate Limiting: Prevent OTP abuse
    recent_otps = db.query(models.UserOTP).filter(
        models.UserOTP.contact == data.contact,
        models.UserOTP.created_at > datetime.utcnow() - timedelta(minutes=5)
    ).count()
    
    if recent_otps >= 3:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait 5 minutes.")

    # In production, integrate with SMS gateway like Twilio
    otp = str(random.randint(1000, 9999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    db_otp = models.UserOTP(
        contact=data.contact,
        otp=otp,
        expires_at=expires_at
    )
    db.add(db_otp)
    db.commit()
    
    # For demo/dev purposes, return OTP in response (REMOVE IN PRODUCTION)
    return {"message": "OTP sent successfully", "otp": otp}

@router.post("/verify-otp")
def verify_otp(data: schemas.OTPVerifyAuth, db: Session = Depends(get_db)):
    db_otp = db.query(models.UserOTP).filter(
        models.UserOTP.contact == data.contact,
        models.UserOTP.otp == data.otp,
        models.UserOTP.is_used == False,
        models.UserOTP.expires_at > datetime.utcnow()
    ).order_by(models.UserOTP.created_at.desc()).first()
    
    if not db_otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    db_otp.is_used = True
    db.commit()
    
    user = db.query(models.User).filter(models.User.contact == data.contact).first()
    
    return {
        "is_registered": user is not None,
        "access_token": security.create_access_token(user.id) if user else None,
        "user": user
    }

@router.post("/signup", response_model=schemas.AuthResponse)
def signup(data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.contact == data.contact).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Check admin whitelist
    role = "student"
    whitelist = db.query(models.AdminWhitelist).filter(models.AdminWhitelist.contact == data.contact).first()
    if whitelist:
        role = "admin"
        
    db_user = models.User(
        name=data.name,
        contact=data.contact,
        category=data.category,
        student_class=data.student_class,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    token = security.create_access_token(db_user.id)
    return {"access_token": token, "token_type": "bearer", "user": db_user}
