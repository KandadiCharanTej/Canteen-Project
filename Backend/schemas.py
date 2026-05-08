from pydantic import BaseModel
from typing import List, Optional
import datetime

# ──────────── Auth ────────────
class UserCreate(BaseModel):
    name: str
    contact: str
    password: str
    role: str = "student"
    category: str = "Student"
    student_class: Optional[str] = None

class UserLogin(BaseModel):
    contact: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    contact: str
    role: str
    category: str
    student_class: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    contact: Optional[str] = None

# ──────────── Profile ────────────
class ProfileOut(BaseModel):
    user: UserOut
    total_orders: int
    total_spent: float
    favorite_items: List[str]

# ──────────── Menu ────────────
class MenuItemBase(BaseModel):
    name: str
    category: str
    price: float
    veg_flag: bool = True
    available_quantity: int = 0
    image_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    is_best: bool = False

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    veg_flag: Optional[bool] = None
    available_quantity: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_best: Optional[bool] = None

class MenuItemOut(MenuItemBase):
    id: int
    date: datetime.datetime
    class Config:
        from_attributes = True

# ──────────── Time Slots ────────────
class TimeSlotBase(BaseModel):
    slot_time: str
    max_orders: int = 25
    current_orders: int = 0
    is_active: bool = True

class TimeSlotOut(TimeSlotBase):
    id: int
    class Config:
        from_attributes = True

class TimeSlotCreate(BaseModel):
    slot_time: str
    max_orders: int = 25

# ──────────── Orders ────────────
class OrderItemCreate(BaseModel):
    item_id: int
    quantity: int

class OrderItemOut(BaseModel):
    id: int
    item_id: int
    quantity: int
    price_at_time: float
    item: MenuItemOut
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    time_slot: str
    items: List[OrderItemCreate]

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    payment_status: str
    payment_method: str
    payment_screenshot: Optional[str] = None
    time_slot: str
    otp: Optional[str] = None
    created_at: datetime.datetime
    items: List[OrderItemOut]
    user_name: Optional[str] = None
    user_contact: Optional[str] = None
    class Config:
        from_attributes = True

class OrderUpdateStatus(BaseModel):
    status: str

class OrderUpdatePayment(BaseModel):
    payment_status: str
    upi_ref: Optional[str] = None

class OTPVerify(BaseModel):
    order_id: int
    otp: str
