"""
CMS routes - Content management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_system_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.content import Content, ContentStatus
from app.schemas.content import ContentCreate, ContentUpdate, ContentResponse

router = APIRouter(prefix="/cms", tags=["CMS"])

@router.post("/content", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def create_content(
    content_data: ContentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """
    Create new content (page, post, article)
    """
    # Create content
    content = Content(
        tenant_id=current_user.tenant_id,
        author_id=current_user.id,
        **content_data.dict()
    )
    
    db.add(content)
    db.commit()
    db.refresh(content)
    
    return content

@router.get("/content", response_model=List[ContentResponse])
async def list_content(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db),
    content_type: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0
):
    """
    List all content for current tenant
    """
    query = db.query(Content).filter(Content.tenant_id == current_user.tenant_id)
    
    # Filters
    if content_type:
        query = query.filter(Content.content_type == content_type)
    if status:
        query = query.filter(Content.status == status)
    
    # Pagination
    contents = query.order_by(Content.created_at.desc()).offset(offset).limit(limit).all()
    
    return contents

@router.get("/content/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """
    Get specific content by ID
    """
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.tenant_id == current_user.tenant_id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    return content

@router.put("/content/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: int,
    content_data: ContentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """
    Update content
    """
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.tenant_id == current_user.tenant_id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Update fields
    update_data = content_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    
    return content

@router.delete("/content/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """
    Delete content
    """
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.tenant_id == current_user.tenant_id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    db.delete(content)
    db.commit()
    
    return None
