from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact = Column(String, unique=True, index=True) # Phone or email
    role = Column(String, default="student") # student, admin
    hashed_password = Column(String)

class Menu(Base):
    __tablename__ = "menu"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    price = Column(Float)
    veg_flag = Column(Boolean, default=True)
    available_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)

class TimeSlot(Base):
    __tablename__ = "time_slots"

    id = Column(Integer, primary_key=True, index=True)
    slot_time = Column(String, unique=True, index=True)
    max_orders = Column(Integer, default=25)
    current_orders = Column(Integer, default=0)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_price = Column(Float)
    status = Column(String, default="Placed") # Placed, Preparing, Ready, Collected
    time_slot = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    item_id = Column(Integer, ForeignKey("menu.id"))
    quantity = Column(Integer)
    price_at_time = Column(Float)

    order = relationship("Order", back_populates="items")
    item = relationship("Menu")
