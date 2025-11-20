from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default='USER')
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    
    # Email verification
    email_verified = Column(Boolean, default=False)
    email_verification_otp = Column(String(10), nullable=True)
    email_verification_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Password reset
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime(timezone=True), nullable=True)
    
    tenant = relationship("Tenant", back_populates="users")
    contents = relationship("Content", back_populates="author")
