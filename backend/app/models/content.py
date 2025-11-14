"""
Content model - CMS module
"""
from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel

class ContentType(str, enum.Enum):
    PAGE = "page"
    POST = "post"
    ARTICLE = "article"

class ContentStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class Content(BaseModel):
    __tablename__ = "contents"
    
    # Tenant relationship
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    tenant = relationship("Tenant", back_populates="contents")
    
    # Author
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author = relationship("User", back_populates="contents")
    
    # Content fields
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    content_type = Column(SQLEnum(ContentType), default=ContentType.POST)
    status = Column(SQLEnum(ContentStatus), default=ContentStatus.DRAFT)
    
    # Content body
    excerpt = Column(Text, nullable=True)
    body = Column(Text, nullable=False)
    
    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    
    # Settings
    featured = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<Content {self.title}>"

