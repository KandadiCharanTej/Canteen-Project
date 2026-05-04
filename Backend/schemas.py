from pydantic import BaseModel
from typing import List, Optional
import datetime

class UserBase(BaseModel):
    name: str
    contact: str
    role: str = "student"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    contact: str
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    contact: Optional[str] = None

class MenuItemBase(BaseModel):
    name: str
    category: str
    price: float
    veg_flag: bool = True
    available_quantity: int = 0
    is_active: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemOut(MenuItemBase):
    id: int
    date: datetime.datetime
    class Config:
        orm_mode = True

class TimeSlotBase(BaseModel):
    slot_time: str
    max_orders: int = 25
    current_orders: int = 0

class TimeSlotOut(TimeSlotBase):
    id: int
    class Config:
        orm_mode = True

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
        orm_mode = True

class OrderCreate(BaseModel):
    time_slot: str
    items: List[OrderItemCreate]

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    time_slot: str
    created_at: datetime.datetime
    items: List[OrderItemOut]
    class Config:
        orm_mode = True

class OrderUpdateStatus(BaseModel):
    status: str
