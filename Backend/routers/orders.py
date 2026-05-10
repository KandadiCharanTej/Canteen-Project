from typing import List
from datetime import datetime
import random
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
from deps import get_db, get_current_user, require_admin
from config import settings

router = APIRouter()

@router.post("", response_model=schemas.OrderOut)
def create_order(
    order_data: schemas.OrderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # ATOMIC TRANSACTION START
    try:
        # 1. Lock the time slot row for update to prevent race conditions on current_orders
        slot = db.query(models.TimeSlot).filter(
            models.TimeSlot.slot_time == order_data.time_slot,
            models.TimeSlot.is_active == True
        ).with_for_update().first()
        
        if not slot:
            raise HTTPException(status_code=400, detail="Invalid or inactive time slot")
        
        if slot.current_orders >= slot.max_orders:
            raise HTTPException(status_code=400, detail="Time slot is full")
        
        # 2. Calculate total price and lock menu items for update to prevent overselling
        total_price = 0
        order_items = []
        
        for item_in in order_data.items:
            # Lock the menu item row
            menu_item = db.query(models.Menu).filter(
                models.Menu.id == item_in.item_id,
                models.Menu.is_active == True
            ).with_for_update().first()
            
            if not menu_item:
                raise HTTPException(status_code=400, detail=f"Item {item_in.item_id} not found or inactive")
            
            if menu_item.available_quantity < item_in.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {menu_item.name}")
            
            # 3. Deduct inventory
            menu_item.available_quantity -= item_in.quantity
            
            item_price = menu_item.price * item_in.quantity
            total_price += item_price
            
            order_items.append(models.OrderItem(
                item_id=menu_item.id,
                quantity=item_in.quantity,
                price_at_time=menu_item.price
            ))
        
        # 4. Increment slot orders
        slot.current_orders += 1
        
        # 5. Create Order
        otp = str(random.randint(1000, 9999))
        db_order = models.Order(
            user_id=current_user.id,
            total_price=total_price,
            time_slot=order_data.time_slot,
            otp=otp,
            status="Pending Payment",
            payment_status="pending"
        )
        db.add(db_order)
        db.flush() # Get order ID
        
        for item in order_items:
            item.order_id = db_order.id
            db.add(item)
        
        db.commit()
        db.refresh(db_order)
        return db_order
        
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Order processing failed: {str(e)}")

from sqlalchemy.orm import joinedload

@router.get("", response_model=List[schemas.OrderOut])
def get_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        active_orders = db.query(models.Order).options(joinedload(models.Order.items).joinedload(models.OrderItem.item)).filter(
            models.Order.status.notin_(["Completed", "Cancelled"])
        ).order_by(models.Order.created_at.desc()).all()
        
        past_orders = db.query(models.Order).options(joinedload(models.Order.items).joinedload(models.OrderItem.item)).filter(
            models.Order.status.in_(["Completed", "Cancelled"])
        ).order_by(models.Order.created_at.desc()).limit(50).all()
        
        return active_orders + past_orders

    # For regular users
    active_orders = db.query(models.Order).options(joinedload(models.Order.items).joinedload(models.OrderItem.item)).filter(
        models.Order.user_id == current_user.id,
        models.Order.status.notin_(["Completed", "Cancelled"])
    ).order_by(models.Order.created_at.desc()).all()
    
    past_orders = db.query(models.Order).options(joinedload(models.Order.items).joinedload(models.OrderItem.item)).filter(
        models.Order.user_id == current_user.id,
        models.Order.status.in_(["Completed", "Cancelled"])
    ).order_by(models.Order.created_at.desc()).limit(20).all()
    
    return active_orders + past_orders

@router.put("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    status_data: schemas.OrderUpdateStatus,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).with_for_update().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_order.status = status_data.status
    db.commit()
    db.refresh(db_order)
    return db_order

@router.put("/{order_id}/payment", response_model=schemas.OrderOut)
def update_order_payment(
    order_id: int,
    payment_data: schemas.OrderUpdatePayment,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).with_for_update().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_order.payment_status = payment_data.payment_status
    if payment_data.upi_ref:
        db_order.upi_ref = payment_data.upi_ref
    
    # If payment approved, advance status
    if payment_data.payment_status == "paid" and db_order.status == "Payment Verification":
        db_order.status = "Preparing"
        
    db.commit()
    db.refresh(db_order)
    return db_order

@router.post("/{order_id}/mark-paid")
def mark_paid(
    order_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).with_for_update().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    
    order.payment_status = "verification_pending"
    order.status = "Payment Verification"
    db.commit()
    return {"detail": "Payment submitted for verification"}

import cloudinary
import cloudinary.uploader

@router.post("/{order_id}/screenshot")
async def upload_screenshot(
    order_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    file_bytes = await file.read()
    
    if settings.CLOUDINARY_URL:
        # Use Cloudinary for production cloud storage
        try:
            result = cloudinary.uploader.upload(file_bytes, folder="canteen_screenshots")
            order.payment_screenshot = result.get("secure_url")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cloud upload failed: {str(e)}")
    else:
        # Fallback to local storage
        upload_dir = os.path.join("static", "uploads", "screenshots")
        os.makedirs(upload_dir, exist_ok=True)
        
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"order_{order_id}_{int(datetime.utcnow().timestamp())}{file_ext}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        
        order.payment_screenshot = f"/uploads/screenshots/{filename}"
        
    db.commit()
    return {"url": order.payment_screenshot}

@router.post("/verify-otp")
def verify_otp(
    data: schemas.OTPVerify,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == data.order_id).with_for_update().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    order.status = "Completed"
    db.commit()
    return {"detail": "OTP verified. Order marked as completed."}
