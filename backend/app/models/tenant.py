"""
Tenant model - Company/Organization
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.models.base import Base
from app.models.project import Project

class TenantStatus(str, enum.Enum):
    TRIAL = "trial"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subdomain = Column(String, unique=True, nullable=True)
    custom_domain = Column(String, unique=True, nullable=True)
    status = Column(SQLEnum(TenantStatus), default=TenantStatus.TRIAL, nullable=False)
    database_name = Column(String, nullable=True)
    enabled_modules = Column(JSON, default=list)
    settings = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)
    
    # Relationships
    users = relationship("User", back_populates="tenant")
    subscription = relationship("Subscription", back_populates="tenant", uselist=False)
    contents = relationship("Content", back_populates="tenant")
