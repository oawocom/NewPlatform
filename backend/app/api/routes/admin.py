from sqlalchemy import text
"""
Admin-specific routes - for Tenant Admins with RBAC
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.core.dependencies import get_current_user, require_admin, check_permission
from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Get dashboard statistics"""
    
    # Count users
    users_count = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
    
    # Count projects
    projects_count = db.execute(text("SELECT COUNT(*) FROM projects")).scalar()
    
    # Count tenants
    tenants_count = db.execute(text("SELECT COUNT(*) FROM tenants")).scalar()
    
    # Count active users
    active_users = db.execute(text("SELECT COUNT(*) FROM users WHERE is_active = true")).scalar()
    
    return {
        "users_count": users_count or 0,
        "projects_count": projects_count or 0,
        "tenants_count": tenants_count or 0,
        "active_users": active_users or 0
    }

@router.get("/users")
async def list_tenant_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_system_db)
):
    """List all users - SUPER_ADMIN sees all, others see tenant users only"""
    # SUPER_ADMIN sees ALL users
    if current_user.role and current_user.role.name == 'SUPER_ADMIN':
        users = db.query(User).all()
    else:
        # Tenant admin sees only their tenant users
        users = db.query(User).filter(User.tenant_id == current_user.tenant_id).all()
    
    return {
        "items": [
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.name if user.role else None,
                "role_id": user.role_id,
                "is_active": user.is_active,
                "tenant_id": user.tenant_id,
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
    """List all projects - SUPER_ADMIN sees all, others see tenant projects only"""
    # SUPER_ADMIN sees ALL projects
    if current_user.role and current_user.role.name == 'SUPER_ADMIN':
        projects = db.query(Project).all()
    else:
        # Tenant admin sees only their tenant projects
        projects = db.query(Project).filter(Project.tenant_id == current_user.tenant_id).all()
    
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
    role_id: int,
    tenant_id: int = None,
    is_active: bool = True,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_system_db)
):
    """Create a new user (admin only)"""
    
    
    
    # Check if user exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # If no tenant_id provided, use current user's tenant
    if not tenant_id:
        tenant_id = current_user.tenant_id
    
    # Hash password
    hashed_password = get_password_hash(password)
    
    # Create user
    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        role_id=role_id,
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
        "role_id": new_user.role_id,
        "tenant_id": new_user.tenant_id,
        "is_active": new_user.is_active
    }

@router.post("/users/create")
async def create_user_with_company(
    email: str,
    full_name: str,
    password: str,
    role_id: int,
    company_name: str = None,
    parent_admin_id: int = None,
    is_active: bool = True,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_system_db)
):
    """Create user with automatic tenant handling"""
    from app.models.tenant import Tenant
    
    
    
    # Check if user exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Determine tenant_id based on role
    tenant_id = None
    
    # Check role to determine if admin or user
    role = db.execute(text(f"SELECT name FROM roles WHERE id = {role_id}")).fetchone()
    role_name = role[0] if role else None
    
    is_admin = role_name in ['SUPER_ADMIN', 'TENANT_ADMIN']
    
    if is_admin and company_name:
        # Create new tenant for admin
        new_tenant = Tenant(name=company_name, status='TRIAL')
        db.add(new_tenant)
        db.flush()
        tenant_id = new_tenant.id
    elif not is_admin and parent_admin_id:
        # Use parent admin's tenant for users
        parent = db.query(User).filter(User.id == parent_admin_id).first()
        if parent:
            tenant_id = parent.tenant_id
    
    if not tenant_id:
        tenant_id = current_user.tenant_id
    
    # Hash password
    hashed_password = get_password_hash(password)
    
    # Create user
    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        role_id=role_id,
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
        "role_id": new_user.role_id,
        "tenant_id": new_user.tenant_id,
        "is_active": new_user.is_active
    }

@router.put("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    new_password: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_system_db)
):
    """Reset user password (admin only)"""
    from app.core.security import get_password_hash
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Get dashboard statistics"""
    
    # Count users
    users_count = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
    
    # Count projects
    projects_count = db.execute(text("SELECT COUNT(*) FROM projects")).scalar()
    
    # Count tenants
    tenants_count = db.execute(text("SELECT COUNT(*) FROM tenants")).scalar()
    
    # Count active users
    active_users = db.execute(text("SELECT COUNT(*) FROM users WHERE is_active = true")).scalar()
    
    return {
        "users_count": users_count or 0,
        "projects_count": projects_count or 0,
        "tenants_count": tenants_count or 0,
        "active_users": active_users or 0
    }
