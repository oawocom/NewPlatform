"""
Content schemas for CMS module
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ContentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    content_type: str = "post"
    status: str = "draft"
    excerpt: Optional[str] = None
    body: str = Field(..., min_length=1)
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    featured: bool = False

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content_type: Optional[str] = None
    status: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    featured: Optional[bool] = None

class ContentResponse(BaseModel):
    id: int
    tenant_id: int
    author_id: int
    title: str
    slug: str
    content_type: str
    status: str
    excerpt: Optional[str]
    body: str
    meta_title: Optional[str]
    meta_description: Optional[str]
    featured: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
