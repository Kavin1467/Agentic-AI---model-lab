from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base

# SQLAlchemy Models
class ProductDB(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    default_price = Column(Float, nullable=False, default=0.0)
    unit = Column(String, default="item") # item, kg, lb, pack, liter, etc.
    description = Column(Text, nullable=True)
    barcode = Column(String, nullable=True, index=True)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    expenses = relationship("ExpenseDB", back_populates="product", cascade="all, delete-orphan")


class ExpenseDB(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, default=0.0)
    date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    payment_method = Column(String, default="Credit Card") # Cash, Credit Card, Debit Card, UPI, PayPal
    merchant = Column(String, nullable=True, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("ProductDB", back_populates="expenses")


class ChatMessageDB(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False) # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(Text, nullable=True) # JSON string for chart data, recommendations, actions


class CategoryBudgetDB(Base):
    __tablename__ = "category_budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, unique=True, index=True, nullable=False)
    monthly_limit = Column(Float, nullable=False, default=500.0)
    color = Column(String, default="#6366f1")
    icon = Column(String, default="shopping-bag")


# Pydantic Schemas
class ProductBase(BaseModel):
    name: str
    category: str
    default_price: float
    unit: Optional[str] = "item"
    description: Optional[str] = None
    barcode: Optional[str] = None
    is_favorite: Optional[bool] = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    default_price: Optional[float] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    barcode: Optional[str] = None
    is_favorite: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExpenseBase(BaseModel):
    title: str
    category: str
    amount: float
    quantity: Optional[float] = 1.0
    unit_price: Optional[float] = None
    date: Optional[datetime] = None
    payment_method: Optional[str] = "Credit Card"
    merchant: Optional[str] = None
    notes: Optional[str] = None
    product_id: Optional[int] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    date: Optional[datetime] = None
    payment_method: Optional[str] = None
    merchant: Optional[str] = None
    notes: Optional[str] = None
    product_id: Optional[int] = None

class ExpenseOut(ExpenseBase):
    id: int
    created_at: datetime
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str
    api_key: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    data_summary: Optional[dict] = None
    chart_data: Optional[dict] = None

class SpendingHistorySummary(BaseModel):
    total_spent: float
    period: str # "daily", "weekly", "monthly", "custom"
    start_date: str
    end_date: str
    items_count: int
    breakdown: List[dict]
    top_categories: List[dict]
    top_merchants: List[dict]
