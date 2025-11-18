from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default='USER')
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    
    tenant = relationship("Tenant", back_populates="users")
    contents = relationship("Content", back_populates="author")
