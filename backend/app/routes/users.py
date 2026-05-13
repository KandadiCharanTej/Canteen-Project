from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import models
from app.api.dependencies.database import get_db, get_current_user

router = APIRouter()

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/profile")
def get_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).count()
    total_spent = db.query(func.sum(models.Order.total_price)).filter(
        models.Order.user_id == current_user.id,
        models.Order.payment_status == "paid"
    ).scalar() or 0
    
    # Get favorite items
    favorite_items = db.query(models.Menu.name, func.count(models.OrderItem.id).label('count'))\
        .join(models.OrderItem, models.Menu.id == models.OrderItem.item_id)\
        .join(models.Order, models.OrderItem.order_id == models.Order.id)\
        .filter(models.Order.user_id == current_user.id)\
        .group_by(models.Menu.name)\
        .order_by(func.count(models.OrderItem.id).desc())\
        .limit(5).all()
    
    return {
        "user": current_user,
        "total_orders": total_orders,
        "total_spent": total_spent,
        "favorite_items": [item[0] for item in favorite_items]
    }

