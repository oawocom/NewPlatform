"""
Central Permission System - Single Source of Truth
All permissions and role mappings defined here
"""

class Permissions:
    """
    All available permissions in the system.
    Add new permissions here as features are built.
    """
    # Dashboard
    VIEW_DASHBOARD = 'view_dashboard'
    
    # User Management
    VIEW_USERS = 'view_users'
    CREATE_USERS = 'create_users'
    EDIT_USERS = 'edit_users'
    DELETE_USERS = 'delete_users'
    RESET_PASSWORDS = 'reset_passwords'
    
    # Project Management
    VIEW_PROJECTS = 'view_projects'
    CREATE_PROJECTS = 'create_projects'
    EDIT_PROJECTS = 'edit_projects'
    DELETE_PROJECTS = 'delete_projects'
    PUBLISH_PROJECTS = 'publish_projects'
    
    # Billing & Subscriptions
    VIEW_BILLING = 'view_billing'
    MANAGE_BILLING = 'manage_billing'
    VIEW_INVOICES = 'view_invoices'
    MANAGE_PAYMENT_METHODS = 'manage_payment_methods'
    
    # Settings
    VIEW_SETTINGS = 'view_settings'
    MANAGE_SETTINGS = 'manage_settings'
    MANAGE_API_KEYS = 'manage_api_keys'
    
    # System/Tenant Management
    VIEW_ALL_TENANTS = 'view_all_tenants'
    MANAGE_TENANTS = 'manage_tenants'
    VIEW_SYSTEM_LOGS = 'view_system_logs'


# Role definitions
class Roles:
    """Available roles in the system"""
    SUPER_ADMIN = 'SUPER_ADMIN'
    TENANT_ADMIN = 'TENANT_ADMIN'
    USER = 'USER'
    VIEWER = 'VIEWER'


# Role → Permissions mapping
ROLE_PERMISSIONS = {
    Roles.SUPER_ADMIN: '*',  # Special: has ALL permissions
    
    Roles.TENANT_ADMIN: [
        # Dashboard
        Permissions.VIEW_DASHBOARD,
        
        # User Management
        Permissions.VIEW_USERS,
        Permissions.CREATE_USERS,
        Permissions.EDIT_USERS,
        Permissions.DELETE_USERS,
        Permissions.RESET_PASSWORDS,
        
        # Project Management
        Permissions.VIEW_PROJECTS,
        Permissions.CREATE_PROJECTS,
        Permissions.EDIT_PROJECTS,
        Permissions.DELETE_PROJECTS,
        Permissions.PUBLISH_PROJECTS,
        
        # Billing
        Permissions.VIEW_BILLING,
        Permissions.MANAGE_BILLING,
        Permissions.VIEW_INVOICES,
        Permissions.MANAGE_PAYMENT_METHODS,
        
        # Settings
        Permissions.VIEW_SETTINGS,
        Permissions.MANAGE_SETTINGS,
    ],
    
    Roles.USER: [
        Permissions.VIEW_DASHBOARD,
        Permissions.VIEW_PROJECTS,
        Permissions.VIEW_SETTINGS,
    ],
    
    Roles.VIEWER: [
        Permissions.VIEW_DASHBOARD,
        Permissions.VIEW_PROJECTS,
    ]
}


def has_permission(user, permission: str) -> bool:
    """
    Check if user has a specific permission.
    
    Args:
        user: User object with 'role' attribute
        permission: Permission string to check
    
    Returns:
        True if user has permission, False otherwise
    
    Example:
        if has_permission(current_user, Permissions.VIEW_USERS):
            return users
    """
    if not user or not hasattr(user, 'role'):
        return False
    
    # Super admin has ALL permissions
    if user.role == Roles.SUPER_ADMIN:
        return True
    
    # Check role's permission list
    allowed_permissions = ROLE_PERMISSIONS.get(user.role, [])
    
    # If role has wildcard, allow everything
    if allowed_permissions == '*':
        return True
    
    return permission in allowed_permissions


def get_user_permissions(user) -> list:
    """
    Get all permissions for a user.
    
    Args:
        user: User object with 'role' attribute
    
    Returns:
        List of permission strings
    
    Example:
        permissions = get_user_permissions(current_user)
        # ['view_dashboard', 'view_users', 'create_users', ...]
    """
    if not user or not hasattr(user, 'role'):
        return []
    
    # Super admin gets all permissions
    if user.role == Roles.SUPER_ADMIN:
        # Return all defined permissions
        return [
            getattr(Permissions, attr) 
            for attr in dir(Permissions) 
            if not attr.startswith('_')
        ]
    
    # Get role's permissions
    permissions = ROLE_PERMISSIONS.get(user.role, [])
    
    if permissions == '*':
        # Return all permissions
        return [
            getattr(Permissions, attr) 
            for attr in dir(Permissions) 
            if not attr.startswith('_')
        ]
    
    return permissions


def is_super_admin(user) -> bool:
    """
    Quick check if user is super admin.
    
    Args:
        user: User object with 'role' attribute
    
    Returns:
        True if super admin, False otherwise
    """
    return user and hasattr(user, 'role') and user.role == Roles.SUPER_ADMIN


def is_tenant_admin(user) -> bool:
    """
    Quick check if user is tenant admin.
    
    Args:
        user: User object with 'role' attribute
    
    Returns:
        True if tenant admin, False otherwise
    """
    return user and hasattr(user, 'role') and user.role == Roles.TENANT_ADMIN


def is_any_admin(user) -> bool:
    """
    Quick check if user has any admin role.
    
    Args:
        user: User object with 'role' attribute
    
    Returns:
        True if any admin role, False otherwise
    """
    return is_super_admin(user) or is_tenant_admin(user)


def apply_tenant_filter(query, model, user):
    """
    Apply tenant-based filtering to SQLAlchemy query.
    Super admin sees all data, others see only their tenant.
    
    Args:
        query: SQLAlchemy query object
        model: Model class being queried
        user: User object with 'role' and 'tenant_id' attributes
    
    Returns:
        Filtered query
    
    Example:
        query = db.query(User)
        query = apply_tenant_filter(query, User, current_user)
        users = query.all()  # Only returns tenant's users
    """
    # Super admin sees everything
    if is_super_admin(user):
        return query
    
    # Apply tenant filter if model has tenant_id
    if hasattr(model, 'tenant_id') and hasattr(user, 'tenant_id'):
        return query.filter(model.tenant_id == user.tenant_id)
    
    return query


def require_permission(permission: str):
    """
    Decorator to require a specific permission for a route.
    Raises HTTPException if user doesn't have permission.
    
    Args:
        permission: Permission string required
    
    Example:
        @router.get("/users")
        @require_permission(Permissions.VIEW_USERS)
        async def list_users(current_user: User = Depends(get_current_user)):
            ...
    """
    from fastapi import HTTPException, status
    from functools import wraps
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current_user from kwargs
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            # Check permission
            if not has_permission(current_user, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission required: {permission}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
