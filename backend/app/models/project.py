from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Project(BaseModel):
    __tablename__ = "projects"
    
    name = Column(String(255), nullable=False)
    subdomain = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default='INACTIVE')
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    published_at = Column(DateTime, nullable=True)
    
    tenant = relationship("Tenant", back_populates="projects")
    created_by = relationship("User", foreign_keys=[created_by_id])
