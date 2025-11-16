"""
FastAPI dependencies - authentication and authorization with RBAC
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, List
from .database import get_system_db
from .security import decode_access_token
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_system_db)
) -> User:
    """
    Get current authenticated user from JWT token
    """
    token = credentials.credentials
    
    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database with role
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verify user is active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user

def get_user_permissions(user: User, db: Session) -> List[str]:
    """
    Get all permission names for a user based on their role
    """
    if not user.role_id:
        return []
    
    permissions = db.query(Permission.name)\
        .join(RolePermission, Permission.id == RolePermission.permission_id)\
        .filter(RolePermission.role_id == user.role_id)\
        .all()
    
    return [p.name for p in permissions]

def check_permission(user: User, permission_name: str, db: Session) -> bool:
    """
    Check if user has a specific permission
    """
    permissions = get_user_permissions(user, db)
    return permission_name in permissions

async def require_permission(permission_name: str):
    """
    Dependency to require a specific permission
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_system_db)
    ) -> User:
        if not check_permission(current_user, permission_name, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission required: {permission_name}"
            )
        return current_user
    return permission_checker

async def require_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
) -> User:
    """
    Require user to have admin permissions (view_users or manage_tenants)
    """
    if not check_permission(current_user, 'view_users', db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

async def require_super_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
) -> User:
    """
    Require user to be super admin (can manage tenants)
    """
    if not check_permission(current_user, 'manage_tenants', db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user
