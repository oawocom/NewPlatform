"""
Project Service - Extends BaseService with project-specific operations
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.project import Project
from app.services.base_service import BaseService
from app.models.user import User
from app.core.security import get_password_hash


class ProjectService(BaseService[Project]):
    """
    Project-specific service with business logic
    """
    
    def __init__(self, db: Session, current_user: User):
        super().__init__(db, Project, current_user)
    
    def _validate_subdomain(self, subdomain: str, project_id: Optional[int] = None):
        """Validate subdomain uniqueness and format"""
        if len(subdomain) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subdomain must be at least 8 characters"
            )
        
        # Check uniqueness
        query = self.db.query(Project).filter(Project.subdomain == subdomain)
        if project_id:
            query = query.filter(Project.id != project_id)
        
        if query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subdomain '{subdomain}' is already taken"
            )
    
    def create(self, data: Dict[str, Any]) -> Project:
        """Create project with password hashing"""
        # Validate subdomain
        if 'subdomain' in data:
            self._validate_subdomain(data['subdomain'])
        
        # Hash password if provided
        if data.get('password'):
            data['password'] = get_password_hash(data['password'])
        
        # Ensure modules_enabled is a list
        if 'modules_enabled' not in data:
            data['modules_enabled'] = []
        
        return super().create(data)
    
    def update(self, item_id: int, data: Dict[str, Any]) -> Project:
        """Update project with password hashing"""
        # Validate subdomain if changed
        if 'subdomain' in data:
            self._validate_subdomain(data['subdomain'], item_id)
        
        # Hash password if provided (only update if new password given)
        if data.get('password'):
            data['password'] = get_password_hash(data['password'])
        else:
            # Remove password from update if empty/None
            data.pop('password', None)
        
        return super().update(item_id, data)
    
    def get_by_subdomain(self, subdomain: str) -> Optional[Project]:
        """Get project by subdomain"""
        query = self.db.query(Project).filter(Project.subdomain == subdomain)
        query = self._apply_tenant_filter(query)
        return query.first()
    
    def publish_project(self, project_id: int) -> Project:
        """Publish a project"""
        return self.update(project_id, {
            'status': 'ACTIVE',
            'published_at': datetime.now(timezone.utc)
        })
    
    def unpublish_project(self, project_id: int) -> Project:
        """Unpublish a project"""
        return self.update(project_id, {
            'status': 'DRAFT',
            'published_at': None
        })
    
    def get_active_projects(self) -> List[Project]:
        """Get all active projects"""
        return self.get_all(filters={'status': 'ACTIVE'})
    
    def get_user_projects(self, user_id: int) -> List[Project]:
        """Get projects created by specific user"""
        return self.get_all(filters={'created_by_id': user_id})
