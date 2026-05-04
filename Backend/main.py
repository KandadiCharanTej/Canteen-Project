from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, database
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Setup database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CampusEats API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth Utils
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user_by_contact(db: Session, contact: str):
    return db.query(models.User).filter(models.User.contact == contact).first()

@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_contact(db, contact=user.contact)
    if db_user:
        raise HTTPException(status_code=400, detail="Contact already registered")
    hashed_password = get_password_hash(user.password)
    db_user = models.User(name=user.name, contact=user.contact, role=user.role, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_contact(db, contact=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect contact or password")
    # For MVP, returning a simple token string instead of real JWT
    return {"access_token": user.contact, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = get_user_by_contact(db, contact=token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

# Menu
@app.get("/menu", response_model=List[schemas.MenuItemOut])
def get_menu(db: Session = Depends(get_db)):
    return db.query(models.Menu).filter(models.Menu.is_active == True).all()

@app.post("/menu", response_model=schemas.MenuItemOut)
def create_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    db_item = models.Menu(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/slots", response_model=List[schemas.TimeSlotOut])
def get_slots(db: Session = Depends(get_db)):
    slots = db.query(models.TimeSlot).all()
    if not slots:
        # Initialize some slots if empty
        times = ['10:00 AM','10:15 AM','10:30 AM','10:45 AM','11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM', '1:00 PM']
        for t in times:
            db.add(models.TimeSlot(slot_time=t, max_orders=25, current_orders=0))
        db.commit()
        slots = db.query(models.TimeSlot).all()
    return slots

@app.post("/orders", response_model=schemas.OrderOut)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    # Validate slot
    slot = db.query(models.TimeSlot).filter(models.TimeSlot.slot_time == order.time_slot).first()
    if not slot or slot.current_orders >= slot.max_orders:
        raise HTTPException(status_code=400, detail="Slot full or invalid")
    
    total_price = 0
    order_items = []
    for item_data in order.items:
        menu_item = db.query(models.Menu).filter(models.Menu.id == item_data.item_id).first()
        if not menu_item or menu_item.available_quantity < item_data.quantity:
            raise HTTPException(status_code=400, detail=f"Item {menu_item.name if menu_item else item_data.item_id} out of stock")
        menu_item.available_quantity -= item_data.quantity
        total_price += menu_item.price * item_data.quantity
        order_items.append(models.OrderItem(item_id=menu_item.id, quantity=item_data.quantity, price_at_time=menu_item.price))

    slot.current_orders += 1
    
    db_order = models.Order(user_id=user.id, total_price=total_price, time_slot=order.time_slot)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for oi in order_items:
        oi.order_id = db_order.id
        db.add(oi)
    db.commit()
    db.refresh(db_order)
    
    return db_order

@app.get("/orders", response_model=List[schemas.OrderOut])
def get_orders(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role == "admin":
        return db.query(models.Order).all()
    return db.query(models.Order).filter(models.Order.user_id == user.id).all()

@app.put("/orders/{order_id}", response_model=schemas.OrderOut)
def update_order_status(order_id: int, status_update: schemas.OrderUpdateStatus, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order

# Serve static frontend
frontend_build_path = os.path.join(os.path.dirname(__file__), "..", "Frontend", "dist")

if os.path.isdir(os.path.join(frontend_build_path, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build_path, "assets")), name="assets")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    file_path = os.path.join(frontend_build_path, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(frontend_build_path, "index.html"))
