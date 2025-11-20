from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy import text, text
from app.core.database import get_system_db
from app.core.dependencies import get_current_user
from app.core.permissions import has_permission, Permissions
from app.models.user import User
from app.models.tenant import Tenant

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    if current_user.role == 'SUPER_ADMIN':
        users_result = db.execute(text("SELECT COUNT(*) FROM users"))
        projects_result = db.execute(text("SELECT COUNT(*) FROM projects"))
        tenants_result = db.execute(text("SELECT COUNT(*) FROM tenants"))
        active_users_result = db.execute(text("SELECT COUNT(*) FROM users WHERE is_active = true"))
    else:
        tenant_id = current_user.tenant_id
        users_result = db.execute(text("SELECT COUNT(*) FROM users WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        projects_result = db.execute(text("SELECT COUNT(*) FROM projects WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        tenants_result = db.execute(text("SELECT COUNT(*) FROM tenants WHERE id = :tenant_id"), {"tenant_id": tenant_id})
        active_users_result = db.execute(text("SELECT COUNT(*) FROM users WHERE tenant_id = :tenant_id AND is_active = true"), {"tenant_id": tenant_id})
    
    return {
        "users_count": users_result.scalar(),
        "projects_count": projects_result.scalar(),
        "tenants_count": tenants_result.scalar(),
        "active_users": active_users_result.scalar()
    }

@router.get("/users")
async def list_tenant_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    if current_user.role == 'SUPER_ADMIN':
        query = text("SELECT * FROM users ORDER BY created_at DESC")
        result = db.execute(query)
    else:
        tenant_id = current_user.tenant_id
        query = text("SELECT * FROM users WHERE tenant_id = :tenant_id ORDER BY created_at DESC")
        result = db.execute(query, {"tenant_id": tenant_id})
    
    columns = result.keys()
    users = [dict(zip(columns, row)) for row in result.fetchall()]
    
    return {
        "items": [
            {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
                "is_active": user["is_active"],
                "tenant_id": user["tenant_id"],
                "created_at": user["created_at"].isoformat() if user["created_at"] else None
            }
            for user in users
        ]
    }

@router.get("/projects")
async def list_tenant_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    if not has_permission(current_user, Permissions.VIEW_PROJECTS):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    if current_user.role == 'SUPER_ADMIN':
        query = text("""
            SELECT p.*, u.full_name as created_by_name
            FROM projects p
            LEFT JOIN users u ON p.created_by_id = u.id
            ORDER BY p.created_at DESC
        """)
        result = db.execute(query)
    else:
        query = text("""
            SELECT p.*, u.full_name as created_by_name
            FROM projects p
            LEFT JOIN users u ON p.created_by_id = u.id
            WHERE p.tenant_id = :tenant_id
            ORDER BY p.created_at DESC
        """)
        result = db.execute(query, {"tenant_id": current_user.tenant_id})
    
    columns = result.keys()
    projects = [dict(zip(columns, row)) for row in result.fetchall()]
    
    return {
        "items": [
            {
                "id": proj["id"],
                "name": proj["name"],
                "subdomain": proj["subdomain"],
                "description": proj.get("description"),
                "status": proj["status"],
                "tenant_id": proj["tenant_id"],
                "created_by_id": proj.get("created_by_id"),
                "created_by_name": proj.get("created_by_name"),
                "created_at": proj["created_at"].isoformat() if proj.get("created_at") else None,
                "published_at": proj["published_at"].isoformat() if proj.get("published_at") else None
            }
            for proj in projects
        ]
    }

@router.get("/tenant-admins")
async def list_tenant_admins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    query = text("SELECT id, full_name, email FROM users WHERE role = 'TENANT_ADMIN' ORDER BY full_name")
    result = db.execute(query)
    columns = result.keys()
    admins = [dict(zip(columns, row)) for row in result.fetchall()]
    return {"items": admins}

@router.post("/users/create")
async def create_user_admin(
    email: str,
    full_name: str,
    password: str,
    role: str,
    company_name: str = None,
    is_active: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    from app.core.security import get_password_hash
    
    if not has_permission(current_user, Permissions.CREATE_USERS):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    tenant_id = current_user.tenant_id
    
    if role in ['SUPER_ADMIN', 'TENANT_ADMIN'] and company_name:
        new_tenant = Tenant(name=company_name, status='TRIAL')
        db.add(new_tenant)
        db.flush()
        tenant_id = new_tenant.id
    
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
    
    return {"id": new_user.id, "email": new_user.email, "message": "User created"}

@router.put("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    from app.core.security import get_password_hash
    
    if not has_permission(current_user, Permissions.RESET_PASSWORDS):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}


@router.get("/has-tenant-admins")
async def has_tenant_admins(db: Session = Depends(get_system_db)):
    """Check if any tenant admins exist (public endpoint)"""
    try:
        query = text("SELECT COUNT(*) FROM users WHERE role = 'TENANT_ADMIN' AND is_active = true")
        result = db.execute(query)
        count = result.scalar()
        return {"has_admins": count > 0, "count": int(count) if count else 0}
    except Exception as e:
        print(f"Error checking tenant admins: {e}")
        return {"has_admins": False, "count": 0}
