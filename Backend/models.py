from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact = Column(String, unique=True, index=True)  # Phone number
    role = Column(String, default="student")  # student, lecturer, admin
    category = Column(String, default="Student")  # Student, Lecturer
    student_class = Column(String, nullable=True)  # Class/Year
    hashed_password = Column(String)
    profile_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    orders = relationship("Order", back_populates="user")


class Menu(Base):
    __tablename__ = "menu"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    price = Column(Float)
    veg_flag = Column(Boolean, default=True)
    available_quantity = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_best = Column(Boolean, default=False)  # Featured/Best food
    date = Column(DateTime, default=datetime.datetime.utcnow)


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id = Column(Integer, primary_key=True, index=True)
    slot_time = Column(String, unique=True, index=True)
    max_orders = Column(Integer, default=25)
    current_orders = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_price = Column(Float)
    status = Column(String, default="Placed", index=True)  # Placed, Preparing, Ready, Completed
    payment_status = Column(String, default="pending")  # pending, paid
    payment_method = Column(String, default="UPI")  # UPI
    upi_ref = Column(String, nullable=True)
    payment_screenshot = Column(String, nullable=True)  # URL/Path to screenshot
    time_slot = Column(String, index=True)
    otp = Column(String)  # 4-digit OTP
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="orders")
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
