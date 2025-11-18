from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Tenant(BaseModel):
    __tablename__ = "tenants"
    
    name = Column(String(255), nullable=False)
    status = Column(String(50), default='TRIAL')
    
    users = relationship("User", back_populates="tenant")
    projects = relationship("Project", back_populates="tenant")
    contents = relationship("Content", back_populates="tenant")
    subscription = relationship("Subscription", back_populates="tenant", uselist=False)
