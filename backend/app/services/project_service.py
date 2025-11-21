"""
Project Service - Extends BaseService with project-specific operations
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.project import Project
from app.services.base_service import BaseService
from app.models.user import User


class ProjectService(BaseService[Project]):
    """
    Project-specific service with business logic
    """
    
    def __init__(self, db: Session, current_user: User):
        super().__init__(db, Project, current_user)
    
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
