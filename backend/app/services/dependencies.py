"""
Service Dependencies - Dependency Injection for FastAPI
"""
from typing import Type
from sqlalchemy.orm import Session
from fastapi import Depends

from app.core.database import get_system_db
from app.core.dependencies import get_current_user
from app.models.user import User


def get_service(service_class: Type):
    """Factory function to create service dependency"""
    def _get_service(
        db: Session = Depends(get_system_db),
        current_user: User = Depends(get_current_user)
    ):
        return service_class(db=db, current_user=current_user)
    
    return _get_service


def get_user_service(
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Get UserService instance"""
    from app.services.user_service import UserService
    return UserService(db=db, current_user=current_user)


def get_project_service(
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Get ProjectService instance"""
    from app.services.project_service import ProjectService
    return ProjectService(db=db, current_user=current_user)


def get_tenant_service(
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Get TenantService instance"""
    from app.services.tenant_service import TenantService
    return TenantService(db=db, current_user=current_user)


def get_project_service_public(
    db: Session = Depends(get_system_db)
):
    """Get ProjectService instance (public access, no auth)"""
    from app.services.project_service import ProjectService
    return ProjectService(db=db, current_user=None)
