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

# Direct login/signup flow (No OTP)
@router.post("/login", response_model=schemas.AuthResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.contact == data.contact).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register.")
    
    # Optional: Verify Aurora UID if user has one
    if user.aurora_uid and data.aurora_uid and user.aurora_uid != data.aurora_uid:
        raise HTTPException(status_code=400, detail="Invalid Aurora UID for this account.")
        
    token = security.create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/signup", response_model=schemas.AuthResponse)
def signup(data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.contact == data.contact).first()
    if existing_user:
        # Just log them in
        return login(schemas.LoginRequest(contact=data.contact, aurora_uid=data.aurora_uid), db)
    
    # Determine role (Admin whitelist)
    role = "student"
    whitelist = db.query(models.AdminWhitelist).filter(models.AdminWhitelist.contact == data.contact).first()
    if whitelist:
        role = "admin"
        
    db_user = models.User(
        name=data.name,
        email=data.email,
        contact=data.contact,
        category=data.category,
        student_class=data.student_class,
        aurora_uid=data.aurora_uid,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    token = security.create_access_token(db_user.id)
    return {"access_token": token, "token_type": "bearer", "user": db_user}
