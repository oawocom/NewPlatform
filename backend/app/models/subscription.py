"""
Subscription model - tenant subscription plans
"""
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from .base import BaseModel

class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"
    TRIALING = "trialing"

class Subscription(BaseModel):
    __tablename__ = "subscriptions"
    
    # Tenant relationship
    tenant_id = Column(Integer, ForeignKey("tenants.id"), unique=True, nullable=False)
    tenant = relationship("Tenant", back_populates="subscription")
    
    # Plan details
    plan = Column(SQLEnum(SubscriptionPlan), default=SubscriptionPlan.FREE)
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.TRIALING)
    
    # Pricing
    price = Column(Float, default=0.00)
    currency = Column(String(3), default="USD")
    
    # Dates
    trial_end = Column(DateTime(timezone=True), nullable=True)
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Limits
    max_users = Column(Integer, default=5)
    max_storage_gb = Column(Integer, default=10)
    
    @property
    def is_trial(self):
        return self.status == SubscriptionStatus.TRIALING
    
    @property
    def days_until_trial_end(self):
        if self.trial_end:
            return (self.trial_end - datetime.now()).days
        return 0
