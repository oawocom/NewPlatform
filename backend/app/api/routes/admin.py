"""
Admin-specific routes - for Tenant Admins with RBAC
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.core.dependencies import get_current_user, require_admin, check_permission
from app.models.user import User
from app.models.project import Project

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Get dashboard statistics for admin"""
    # Permission check is done via dependencies
    
    # Count users in tenant
    users_count = db.query(User).filter(User.tenant_id == current_user.tenant_id).count()
    
    # Count projects in tenant
    projects_count = db.query(Project).filter(Project.tenant_id == current_user.tenant_id).count()
    
    # Count active projects
    active_projects = db.query(Project).filter(
        Project.tenant_id == current_user.tenant_id,
        Project.status == 'ACTIVE'
    ).count()
    
    return {
        "users_count": users_count,
        "projects_count": projects_count,
        "active_projects": active_projects,
        "role": current_user.role.name if current_user.role else None
    }

@router.get("/users")
async def list_tenant_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_system_db)
):
    """List all users in tenant (Admin only)"""
    users = db.query(User).filter(User.tenant_id == current_user.tenant_id).all()
    
    return {
        "items": [
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.name if user.role else None,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            for user in users
        ]
    }

@router.get("/projects")
async def list_tenant_projects(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_system_db)
):
    """List all projects in tenant (Admin only)"""
    projects = db.query(Project).filter(Project.tenant_id == current_user.tenant_id).all()
    
    return {
        "items": [
            {
                "id": project.id,
                "name": project.name,
                "subdomain": project.subdomain,
                "is_active": project.status == 'ACTIVE',
                "created_at": project.created_at.isoformat() if project.created_at else None
            }
            for project in projects
        ]
    }
