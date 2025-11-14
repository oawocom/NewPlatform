from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.models.base import Base

class ProjectType(str, enum.Enum):
    ECOMMERCE = "ecommerce"
    CMS = "cms"
    PORTFOLIO = "portfolio"
    MARKETPLACE = "marketplace"
    BOOKING = "booking"
    CRM = "crm"
    HR = "hr"
    SOCIAL = "social"
    ELEARNING = "elearning"

class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(ProjectType), nullable=False)
    subdomain = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.ACTIVE)
    
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # No relationship to avoid circular dependency
