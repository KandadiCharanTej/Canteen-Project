from typing import List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models import models
from app.schemas import schemas
from app.api.dependencies.database import get_db, get_redis, require_admin
import redis

router = APIRouter()

CACHE_EXPIRE = 3600  # 1 hour

@router.get("", response_model=List[schemas.MenuOut])
def get_menu(
    db: Session = Depends(get_db),
    cache: redis.Redis = Depends(get_redis),
    category: Optional[str] = None,
    veg_only: bool = False
):
    # Try to get from cache if no filters
    cache_key = f"menu:all:{veg_only}:{category}"
    if cache:
        cached_menu = cache.get(cache_key)
        if cached_menu:
            return json.loads(cached_menu)

    query = db.query(models.Menu).filter(models.Menu.is_active == True)
    if category:
        query = query.filter(models.Menu.category == category)
    if veg_only:
        query = query.filter(models.Menu.veg_flag == True)
    
    menu = query.all()
    
    # Store in cache
    if cache:
        cache.setex(cache_key, CACHE_EXPIRE, json.dumps([schemas.MenuOut.model_validate(m).model_dump() for m in menu], default=str))
    
    return menu

@router.get("/all", response_model=List[schemas.MenuOut])
def get_all_menu(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.Menu).all()

@router.post("", response_model=schemas.MenuOut)
def create_menu_item(
    item: schemas.MenuCreate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
    cache: redis.Redis = Depends(get_redis)
):
    db_item = models.Menu(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    # Invalidate menu cache
    if cache:
        keys = cache.keys("menu:all:*")
        if keys:
            cache.delete(*keys)
        
    return db_item

@router.put("/{item_id}", response_model=schemas.MenuOut)
def update_menu_item(
    item_id: int,
    item_data: schemas.MenuUpdate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
    cache: redis.Redis = Depends(get_redis)
):
    db_item = db.query(models.Menu).filter(models.Menu.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for key, value in item_data.model_dump(exclude_unset=True).items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    
    # Invalidate menu cache
    if cache:
        keys = cache.keys("menu:all:*")
        if keys:
            cache.delete(*keys)
        
    return db_item

@router.delete("/{item_id}")
def delete_menu_item(
    item_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
    cache: redis.Redis = Depends(get_redis)
):
    db_item = db.query(models.Menu).filter(models.Menu.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    
    # Invalidate menu cache
    if cache:
        keys = cache.keys("menu:all:*")
        if keys:
            cache.delete(*keys)
        
    return {"detail": "Item deleted"}

