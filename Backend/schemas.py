from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import datetime

# ──────────── Auth ────────────
class UserCreate(BaseModel):
    name: str
    contact: str
    category: str = "Student"
    student_class: Optional[str] = None

class OTPSend(BaseModel):
    contact: str

class OTPVerifyAuth(BaseModel):
    contact: str
    otp: str

class UserOut(BaseModel):
    id: int
    name: str
    contact: str
    role: str
    category: str
    student_class: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ──────────── Menu ────────────
class MenuBase(BaseModel):
    name: str
    category: str
    price: float
    veg_flag: bool = True
    available_quantity: int = 0
    image_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    is_best: bool = False
    is_trending: bool = False
    prep_time: Optional[int] = None

class MenuCreate(MenuBase):
    pass

class MenuUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    veg_flag: Optional[bool] = None
    available_quantity: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_best: Optional[bool] = None
    is_trending: Optional[bool] = None
    prep_time: Optional[int] = None

class MenuOut(MenuBase):
    id: int
    date: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# ──────────── Time Slots ────────────
class TimeSlotBase(BaseModel):
    slot_time: str
    max_orders: int = 25
    current_orders: int = 0
    is_active: bool = True

class TimeSlotOut(TimeSlotBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

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
    item: MenuOut
    model_config = ConfigDict(from_attributes=True)

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
    model_config = ConfigDict(from_attributes=True)

class OrderUpdateStatus(BaseModel):
    status: str

class OrderUpdatePayment(BaseModel):
    payment_status: str
    upi_ref: Optional[str] = None

class OTPVerify(BaseModel):
    order_id: int
    otp: str
