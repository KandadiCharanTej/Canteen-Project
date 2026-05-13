from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    contact = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="student", index=True)  # student, lecturer, admin
    category = Column(String, default="Student")
    student_class = Column(String, nullable=True)
    aurora_uid = Column(String, unique=True, index=True, nullable=True)
    profile_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    orders = relationship("Order", back_populates="user")

    # Multi-column indexes for common filters
    __table_args__ = (
        Index('ix_user_contact_role', 'contact', 'role'),
    )


class Menu(Base):
    __tablename__ = "menu"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    price = Column(Float)
    veg_flag = Column(Boolean, default=True, index=True)
    available_quantity = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    is_best = Column(Boolean, default=False)
    is_trending = Column(Boolean, default=False)
    prep_time = Column(Integer, nullable=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id = Column(Integer, primary_key=True, index=True)
    slot_time = Column(String, unique=True, index=True)
    max_orders = Column(Integer, default=25)
    current_orders = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    total_price = Column(Float)
    status = Column(String, default="Pending Payment", index=True)
    payment_status = Column(String, default="pending", index=True)
    payment_method = Column(String, default="UPI")
    upi_ref = Column(String, nullable=True, index=True)
    transaction_id = Column(String, unique=True, index=True, nullable=True) # For real payments
    payment_screenshot = Column(String, nullable=True)
    time_slot = Column(String, index=True)
    special_instructions = Column(String, nullable=True)
    otp = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_order_status_payment', 'status', 'payment_status'),
        Index('ix_order_user_created', 'user_id', 'created_at'),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True)
    item_id = Column(Integer, ForeignKey("menu.id"), index=True)
    quantity = Column(Integer)
    price_at_time = Column(Float)

    order = relationship("Order", back_populates="items")
    item = relationship("Menu")


class UserOTP(Base):
    __tablename__ = "user_otps"

    id = Column(Integer, primary_key=True, index=True)
    contact = Column(String, index=True)
    otp = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, index=True)
    is_used = Column(Boolean, default=False, index=True)


class AdminWhitelist(Base):
    __tablename__ = "admin_whitelist"
    
    id = Column(Integer, primary_key=True, index=True)
    contact = Column(String, unique=True, index=True)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

