from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
import models, schemas, database
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import random

# ─────────── Config ───────────
SECRET_KEY = "canteenfood-secret-key-change-in-production-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Setup database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CanteenFood API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login", auto_error=False)


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─────────── JWT Utilities ───────────
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user_by_contact(db: Session, contact: str):
    return db.query(models.User).filter(models.User.contact == contact).first()


def get_current_user_optional(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Returns user if token is valid, None otherwise. For public routes."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        contact: str = payload.get("sub")
        if contact is None:
            return None
        user = get_user_by_contact(db, contact=contact)
        return user
    except JWTError:
        return None


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Requires authentication. Raises 401 if not authenticated."""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        contact: str = payload.get("sub")
        if contact is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = get_user_by_contact(db, contact=contact)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(user: models.User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ─────────── Auth Endpoints ───────────
@app.post("/api/signup", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_contact(db, contact=user.contact)
    if db_user:
        raise HTTPException(status_code=400, detail="Contact already registered")
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        contact=user.contact,
        role=user.role,
        category=user.category,
        student_class=user.student_class,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    access_token = create_access_token(data={"sub": db_user.contact})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user,
    }


@app.post("/api/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_contact(db, contact=credentials.contact)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect contact or password")
    access_token = create_access_token(data={"sub": user.contact})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@app.get("/api/me", response_model=schemas.UserOut)
def get_me(user: models.User = Depends(get_current_user)):
    return user


@app.get("/api/profile", response_model=schemas.ProfileOut)
def get_profile(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.user_id == user.id).all()
    total_spent = sum(o.total_price for o in orders if o.payment_status == "paid")
    
    # Find favorite items (most ordered)
    item_counts = {}
    for o in orders:
        for oi in o.items:
            if oi.item:
                item_counts[oi.item.name] = item_counts.get(oi.item.name, 0) + oi.quantity
    favorites = sorted(item_counts.keys(), key=lambda k: item_counts[k], reverse=True)[:5]
    
    return {
        "user": user,
        "total_orders": len(orders),
        "total_spent": total_spent,
        "favorite_items": favorites,
    }


# ─────────── Menu Endpoints (Public) ───────────
@app.get("/api/menu", response_model=List[schemas.MenuItemOut])
def get_menu(db: Session = Depends(get_db)):
    """Public endpoint - no auth required"""
    return db.query(models.Menu).filter(models.Menu.is_active == True).all()


@app.get("/api/menu/all", response_model=List[schemas.MenuItemOut])
def get_all_menu(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    """Admin only - get all menu items including inactive"""
    return db.query(models.Menu).all()


@app.post("/api/menu", response_model=schemas.MenuItemOut)
def create_menu_item(
    item: schemas.MenuItemCreate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    db_item = models.Menu(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.put("/api/menu/{item_id}", response_model=schemas.MenuItemOut)
def update_menu_item(
    item_id: int,
    item_update: schemas.MenuItemUpdate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    db_item = db.query(models.Menu).filter(models.Menu.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.delete("/api/menu/{item_id}")
def delete_menu_item(
    item_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    db_item = db.query(models.Menu).filter(models.Menu.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Item deleted"}


# ─────────── Time Slots (Public) ───────────
@app.get("/api/slots", response_model=List[schemas.TimeSlotOut])
def get_slots(db: Session = Depends(get_db)):
    slots = db.query(models.TimeSlot).filter(models.TimeSlot.is_active == True).all()
    return slots


@app.post("/api/slots", response_model=schemas.TimeSlotOut)
def create_slot(
    slot: schemas.TimeSlotCreate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(models.TimeSlot).filter(models.TimeSlot.slot_time == slot.slot_time).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slot already exists")
    db_slot = models.TimeSlot(slot_time=slot.slot_time, max_orders=slot.max_orders)
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot


# ─────────── Orders ───────────
@app.post("/api/orders", response_model=schemas.OrderOut)
def create_order(
    order: schemas.OrderCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Validate slot
        slot = db.query(models.TimeSlot).filter(
            models.TimeSlot.slot_time == order.time_slot
        ).with_for_update().first()
        if not slot:
            raise HTTPException(status_code=400, detail="Invalid time slot")
        if slot.current_orders >= slot.max_orders:
            raise HTTPException(status_code=400, detail="This time slot is full")

        total_price = 0
        order_items = []

        # Pre-fetch and lock menu items
        item_ids = [item_data.item_id for item_data in order.items]
        menu_items = db.query(models.Menu).filter(models.Menu.id.in_(item_ids)).with_for_update().all()
        menu_item_dict = {item.id: item for item in menu_items}

        for item_data in order.items:
            menu_item = menu_item_dict.get(item_data.item_id)
            if not menu_item:
                raise HTTPException(status_code=400, detail=f"Item {item_data.item_id} not found")
            if not menu_item.is_active:
                raise HTTPException(status_code=400, detail=f"'{menu_item.name}' is not available")
            if menu_item.available_quantity < item_data.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"'{menu_item.name}' - only {menu_item.available_quantity} left",
                )

            menu_item.available_quantity -= item_data.quantity
            total_price += menu_item.price * item_data.quantity
            order_items.append(
                models.OrderItem(
                    item_id=menu_item.id,
                    quantity=item_data.quantity,
                    price_at_time=menu_item.price,
                )
            )

        slot.current_orders += 1

        # Generate a 4-digit OTP
        otp_code = str(random.randint(1000, 9999))

        db_order = models.Order(
            user_id=user.id,
            total_price=total_price,
            time_slot=order.time_slot,
            otp=otp_code,
            payment_status="pending",
            payment_method="UPI",
        )
        db.add(db_order)
        db.flush()

        for oi in order_items:
            oi.order_id = db_order.id
            db.add(oi)

        db.commit()
        db.refresh(db_order)
        
        # Add user info to response
        result = schemas.OrderOut.model_validate(db_order)
        result.user_name = user.name
        result.user_contact = user.contact
        return result

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while placing the order")


@app.get("/api/orders", response_model=List[schemas.OrderOut])
def get_orders(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "admin":
        orders = (
            db.query(models.Order)
            .options(joinedload(models.Order.items).joinedload(models.OrderItem.item))
            .options(joinedload(models.Order.user))
            .order_by(desc(models.Order.created_at))
            .all()
        )
    else:
        orders = (
            db.query(models.Order)
            .filter(models.Order.user_id == user.id)
            .options(joinedload(models.Order.items).joinedload(models.OrderItem.item))
            .order_by(desc(models.Order.created_at))
            .all()
        )
    
    result = []
    for o in orders:
        order_out = schemas.OrderOut.model_validate(o)
        if o.user:
            order_out.user_name = o.user.name
            order_out.user_contact = o.user.contact
        result.append(order_out)
    return result


@app.put("/api/orders/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderUpdateStatus,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    valid_statuses = ["Placed", "Preparing", "Ready", "Completed"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    result = schemas.OrderOut.model_validate(order)
    if order.user:
        result.user_name = order.user.name
        result.user_contact = order.user.contact
    return result


@app.put("/api/orders/{order_id}/payment", response_model=schemas.OrderOut)
def update_payment_status(
    order_id: int,
    payment_update: schemas.OrderUpdatePayment,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.payment_status = payment_update.payment_status
    if payment_update.upi_ref:
        order.upi_ref = payment_update.upi_ref
    db.commit()
    db.refresh(order)
    result = schemas.OrderOut.model_validate(order)
    if order.user:
        result.user_name = order.user.name
        result.user_contact = order.user.contact
    return result


@app.post("/api/orders/{order_id}/mark-paid")
def mark_self_paid(
    order_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """User marks they have paid (status stays pending until admin verifies)"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    # Just acknowledge - payment_status stays "pending" until admin verifies
    return {"detail": "Payment acknowledgment received. Admin will verify."}


@app.post("/api/orders/verify-otp")
def verify_otp(
    data: schemas.OTPVerify,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    order.status = "Completed"
    db.commit()
    return {"detail": "OTP verified. Order marked as completed."}


# ─────────── Serve Static Frontend ───────────
frontend_build_path = os.path.join(os.path.dirname(__file__), "static")

if os.path.isdir(os.path.join(frontend_build_path, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build_path, "assets")), name="assets")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    file_path = os.path.join(frontend_build_path, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = os.path.join(frontend_build_path, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {"detail": "Frontend not built yet. Run frontend build first."}
