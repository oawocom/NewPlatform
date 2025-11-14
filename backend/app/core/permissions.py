"""
Role-Based Access Control (RBAC)
"""
from enum import Enum
from fastapi import HTTPException, status

class UserRole(str, Enum):
    SYSTEM_ADMIN = "system_admin"
    TENANT_ADMIN = "tenant_admin"
    PROJECT_ADMIN = "project_admin"
    USER = "user"

class Permission(str, Enum):
    # System permissions
    MANAGE_ALL_TENANTS = "manage_all_tenants"
    MANAGE_ALL_USERS = "manage_all_users"
    
    # Tenant permissions
    MANAGE_TENANT_USERS = "manage_tenant_users"
    MANAGE_PROJECTS = "manage_projects"
    MANAGE_BILLING = "manage_billing"
    
    # Project permissions
    EDIT_PROJECT = "edit_project"
    VIEW_PROJECT = "view_project"
    MANAGE_CONTENT = "manage_content"

# Role-Permission mapping
ROLE_PERMISSIONS = {
    UserRole.SYSTEM_ADMIN: [
        Permission.MANAGE_ALL_TENANTS,
        Permission.MANAGE_ALL_USERS,
        Permission.MANAGE_TENANT_USERS,
        Permission.MANAGE_PROJECTS,
        Permission.MANAGE_BILLING,
        Permission.EDIT_PROJECT,
        Permission.VIEW_PROJECT,
        Permission.MANAGE_CONTENT,
    ],
    UserRole.TENANT_ADMIN: [
        Permission.MANAGE_TENANT_USERS,
        Permission.MANAGE_PROJECTS,
        Permission.MANAGE_BILLING,
        Permission.EDIT_PROJECT,
        Permission.VIEW_PROJECT,
        Permission.MANAGE_CONTENT,
    ],
    UserRole.PROJECT_ADMIN: [
        Permission.EDIT_PROJECT,
        Permission.VIEW_PROJECT,
        Permission.MANAGE_CONTENT,
    ],
    UserRole.USER: [
        Permission.VIEW_PROJECT,
    ],
}

def check_permission(user_role: UserRole, required_permission: Permission) -> bool:
    """Check if user role has required permission"""
    return required_permission in ROLE_PERMISSIONS.get(user_role, [])

def require_permission(required_permission: Permission):
    """Decorator to check permission"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Get current_user from kwargs
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
            
            if not check_permission(current_user.role, required_permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {required_permission}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
