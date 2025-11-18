from sqlalchemy import text, func
"""
Admin routes - Using new permission system
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.core.dependencies import get_current_user
from app.core.security import get_password_hash
from app.core.permissions import (
    has_permission, 
    apply_tenant_filter, 
    is_super_admin,
    Permissions
)
from app.models.user import User
from app.models.project import Project
from app.models.tenant import Tenant

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Get dashboard statistics with tenant filtering"""
    
    if not has_permission(current_user, Permissions.VIEW_DASHBOARD):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    if is_super_admin(current_user):
        users_count = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
        active_users = db.execute(text("SELECT COUNT(*) FROM users WHERE is_active = true")).scalar()
        projects_count = db.execute(text("SELECT COUNT(*) FROM projects")).scalar()
        tenants_count = db.execute(text("SELECT COUNT(*) FROM tenants")).scalar()
    else:
        users_count = db.execute(text(f"SELECT COUNT(*) FROM users WHERE tenant_id = {current_user.tenant_id}")).scalar()
        active_users = db.execute(text(f"SELECT COUNT(*) FROM users WHERE tenant_id = {current_user.tenant_id} AND is_active = true")).scalar()
        projects_count = db.execute(text(f"SELECT COUNT(*) FROM projects WHERE tenant_id = {current_user.tenant_id}")).scalar()
        tenants_count = 1
    
    return {
        "users_count": users_count or 0,
        "projects_count": projects_count or 0,
        "tenants_count": tenants_count or 0,
        "active_users": active_users or 0
    }

@router.get("/users")
async def list_tenant_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """List users with permission and tenant filtering"""
    
    if not has_permission(current_user, Permissions.VIEW_USERS):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    query = db.query(User)
    query = apply_tenant_filter(query, User, current_user)
    users = query.all()
    
    return {
        "items": [
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_active": user.is_active,
                "tenant_id": user.tenant_id,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            for user in users
        ]
    }

@router.get("/projects")
async def list_tenant_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """List projects with permission and tenant filtering"""
    
    if not has_permission(current_user, Permissions.VIEW_PROJECTS):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    query = db.query(Project)
    query = apply_tenant_filter(query, Project, current_user)
    projects = query.all()
    
    return {
        "items": [
            {
                "id": project.id,
                "name": project.name,
                "subdomain": project.subdomain,
                "is_active": project.status == 'ACTIVE',
                "tenant_id": project.tenant_id,
                "created_at": project.created_at.isoformat() if project.created_at else None
            }
            for project in projects
        ]
    }

@router.post("/users")
async def create_user_admin(
    email: str,
    full_name: str,
    password: str,
    role: str,
    tenant_id: int = None,
    is_active: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Create user with permission check"""
    
    if not has_permission(current_user, Permissions.CREATE_USERS):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if not tenant_id:
        tenant_id = current_user.tenant_id
    
    if not is_super_admin(current_user) and tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot create users in other tenants")
    
    hashed_password = get_password_hash(password)
    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        role=role,
        tenant_id=tenant_id,
        is_active=is_active
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role,
        "tenant_id": new_user.tenant_id,
        "is_active": new_user.is_active
    }

@router.post("/users/create")
async def create_user_with_company(
    email: str,
    full_name: str,
    password: str,
    role: str,
    company_name: str = None,
    parent_admin_id: int = None,
    is_active: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Create user with company"""
    
    if not has_permission(current_user, Permissions.CREATE_USERS):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tenant_id = None
    is_admin = role in ['SUPER_ADMIN', 'TENANT_ADMIN']
    
    if is_admin and company_name:
        new_tenant = Tenant(name=company_name, status='TRIAL')
        db.add(new_tenant)
        db.flush()
        tenant_id = new_tenant.id
    elif not is_admin and parent_admin_id:
        parent = db.query(User).filter(User.id == parent_admin_id).first()
        if parent:
            tenant_id = parent.tenant_id
    
    if not tenant_id:
        tenant_id = current_user.tenant_id
    
    hashed_password = get_password_hash(password)
    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        role=role,
        tenant_id=tenant_id,
        is_active=is_active
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role,
        "tenant_id": new_user.tenant_id,
        "is_active": new_user.is_active
    }

@router.put("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Reset password"""
    
    if not has_permission(current_user, Permissions.RESET_PASSWORDS):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not is_super_admin(current_user) and user.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot reset password for users in other tenants")
    
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.get("/tenant-admins")
async def get_tenant_admins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Get tenant admins"""
    
    query = db.query(User).filter(User.role == 'TENANT_ADMIN')
    query = apply_tenant_filter(query, User, current_user)
    admins = query.all()
    
    return {
        "items": [
            {
                "id": admin.id,
                "full_name": admin.full_name,
                "email": admin.email,
                "company_name": admin.tenant.name if admin.tenant else None
            }
            for admin in admins
        ]
    }
