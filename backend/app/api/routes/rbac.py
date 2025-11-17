"""
RBAC (Role-Based Access Control) routes
Manage roles, permissions, and role-permission mappings
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.core.dependencies import get_current_user, require_permission
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission

router = APIRouter(prefix="/rbac", tags=["RBAC"])

# ============================================================================
# Pydantic Schemas
# ============================================================================

class RoleCreate(BaseModel):
    name: str
    display_name: str
    description: str = None

class RoleUpdate(BaseModel):
    display_name: str = None
    description: str = None

class PermissionCreate(BaseModel):
    name: str
    display_name: str
    resource: str
    action: str
    description: str = None

class PermissionUpdate(BaseModel):
    display_name: str = None
    description: str = None

class AssignPermissions(BaseModel):
    permission_ids: List[int]

# ============================================================================
# ROLES ENDPOINTS
# ============================================================================

@router.get("/roles")
async def list_roles(
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """List all roles"""
    roles = db.query(Role).all()
    
    return {
        "items": [
            {
                "id": role.id,
                "name": role.name,
                "display_name": role.display_name,
                "description": role.description,
                "created_at": role.created_at.isoformat() if role.created_at else None,
                "permissions_count": len(role.permissions)
            }
            for role in roles
        ]
    }

@router.get("/roles/{role_id}")
async def get_role(
    role_id: int,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Get single role with permissions"""
    role = db.query(Role).filter(Role.id == role_id).first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Get permissions for this role
    permissions = db.query(Permission)\
        .join(RolePermission, Permission.id == RolePermission.permission_id)\
        .filter(RolePermission.role_id == role_id)\
        .all()
    
    return {
        "id": role.id,
        "name": role.name,
        "display_name": role.display_name,
        "description": role.description,
        "created_at": role.created_at.isoformat() if role.created_at else None,
        "permissions": [
            {
                "id": perm.id,
                "name": perm.name,
                "display_name": perm.display_name,
                "resource": perm.resource,
                "action": perm.action
            }
            for perm in permissions
        ]
    }

@router.post("/roles", status_code=status.HTTP_201_CREATED)
async def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Create new role (Admin only)"""
    # Check if role name already exists
    existing = db.query(Role).filter(Role.name == role_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
    
    # Create role
    role = Role(
        name=role_data.name,
        display_name=role_data.display_name,
        description=role_data.description
    )
    
    db.add(role)
    db.commit()
    db.refresh(role)
    
    return {
        "id": role.id,
        "name": role.name,
        "display_name": role.display_name,
        "description": role.description,
        "created_at": role.created_at.isoformat() if role.created_at else None
    }

@router.put("/roles/{role_id}")
async def update_role(
    role_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Update role (Admin only)"""
    role = db.query(Role).filter(Role.id == role_id).first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Update fields
    if role_data.display_name is not None:
        role.display_name = role_data.display_name
    if role_data.description is not None:
        role.description = role_data.description
    
    db.commit()
    db.refresh(role)
    
    return {
        "id": role.id,
        "name": role.name,
        "display_name": role.display_name,
        "description": role.description,
        "created_at": role.created_at.isoformat() if role.created_at else None
    }

@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: int,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Delete role (Admin only)"""
    role = db.query(Role).filter(Role.id == role_id).first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if any users have this role
    users_count = db.query(User).filter(User.role_id == role_id).count()
    if users_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete role. {users_count} users are assigned to this role."
        )
    
    db.delete(role)
    db.commit()
    
    return {"message": "Role deleted successfully"}

# ============================================================================
# PERMISSIONS ENDPOINTS
# ============================================================================

@router.get("/permissions")
async def list_permissions(
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """List all permissions"""
    permissions = db.query(Permission).all()
    
    return {
        "items": [
            {
                "id": perm.id,
                "name": perm.name,
                "display_name": perm.display_name,
                "resource": perm.resource,
                "action": perm.action,
                "description": perm.description,
                "created_at": perm.created_at.isoformat() if perm.created_at else None
            }
            for perm in permissions
        ]
    }

@router.get("/permissions/{permission_id}")
async def get_permission(
    permission_id: int,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Get single permission"""
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    return {
        "id": permission.id,
        "name": permission.name,
        "display_name": permission.display_name,
        "resource": permission.resource,
        "action": permission.action,
        "description": permission.description,
        "created_at": permission.created_at.isoformat() if permission.created_at else None
    }

@router.post("/permissions", status_code=status.HTTP_201_CREATED)
async def create_permission(
    perm_data: PermissionCreate,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Create new permission (Admin only)"""
    # Check if permission name already exists
    existing = db.query(Permission).filter(Permission.name == perm_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Permission name already exists")
    
    # Create permission
    permission = Permission(
        name=perm_data.name,
        display_name=perm_data.display_name,
        resource=perm_data.resource,
        action=perm_data.action,
        description=perm_data.description
    )
    
    db.add(permission)
    db.commit()
    db.refresh(permission)
    
    return {
        "id": permission.id,
        "name": permission.name,
        "display_name": permission.display_name,
        "resource": permission.resource,
        "action": permission.action,
        "description": permission.description,
        "created_at": permission.created_at.isoformat() if permission.created_at else None
    }

@router.put("/permissions/{permission_id}")
async def update_permission(
    permission_id: int,
    perm_data: PermissionUpdate,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Update permission (Admin only)"""
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Update fields
    if perm_data.display_name is not None:
        permission.display_name = perm_data.display_name
    if perm_data.description is not None:
        permission.description = perm_data.description
    
    db.commit()
    db.refresh(permission)
    
    return {
        "id": permission.id,
        "name": permission.name,
        "display_name": permission.display_name,
        "resource": permission.resource,
        "action": permission.action,
        "description": permission.description,
        "created_at": permission.created_at.isoformat() if permission.created_at else None
    }

@router.delete("/permissions/{permission_id}")
async def delete_permission(
    permission_id: int,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Delete permission (Admin only)"""
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Delete role_permission mappings first (CASCADE should handle this, but being explicit)
    db.query(RolePermission).filter(RolePermission.permission_id == permission_id).delete()
    
    db.delete(permission)
    db.commit()
    
    return {"message": "Permission deleted successfully"}

# ============================================================================
# ROLE-PERMISSION MAPPING ENDPOINTS
# ============================================================================

@router.get("/roles/{role_id}/permissions")
async def get_role_permissions(
    role_id: int,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Get all permissions for a role"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    permissions = db.query(Permission)\
        .join(RolePermission, Permission.id == RolePermission.permission_id)\
        .filter(RolePermission.role_id == role_id)\
        .all()
    
    return {
        "role_id": role_id,
        "role_name": role.name,
        "permissions": [
            {
                "id": perm.id,
                "name": perm.name,
                "display_name": perm.display_name,
                "resource": perm.resource,
                "action": perm.action
            }
            for perm in permissions
        ]
    }

@router.post("/roles/{role_id}/permissions")
async def assign_permissions_to_role(
    role_id: int,
    data: AssignPermissions,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Assign multiple permissions to a role (replaces existing)"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Verify all permission IDs exist
    permissions = db.query(Permission).filter(Permission.id.in_(data.permission_ids)).all()
    if len(permissions) != len(data.permission_ids):
        raise HTTPException(status_code=400, detail="One or more permission IDs are invalid")
    
    # Remove existing permissions
    db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
    
    # Add new permissions
    for perm_id in data.permission_ids:
        role_perm = RolePermission(role_id=role_id, permission_id=perm_id)
        db.add(role_perm)
    
    db.commit()
    
    return {
        "message": f"Successfully assigned {len(data.permission_ids)} permissions to role",
        "role_id": role_id,
        "permission_ids": data.permission_ids
    }

@router.delete("/roles/{role_id}/permissions/{permission_id}")
async def remove_permission_from_role(
    role_id: int,
    permission_id: int,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a single permission from a role"""
    role_perm = db.query(RolePermission).filter(
        RolePermission.role_id == role_id,
        RolePermission.permission_id == permission_id
    ).first()
    
    if not role_perm:
        raise HTTPException(status_code=404, detail="Permission not assigned to this role")
    
    db.delete(role_perm)
    db.commit()
    
    return {"message": "Permission removed from role successfully"}
