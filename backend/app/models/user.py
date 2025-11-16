"""
User model with RBAC
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    
    # RBAC - use role_id instead of role enum
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    is_active = Column(Boolean, default=True)
    settings = Column(String, default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    role = relationship("Role", back_populates="users")
    tenant = relationship("Tenant", back_populates="users")
    contents = relationship("Content", back_populates="author")
