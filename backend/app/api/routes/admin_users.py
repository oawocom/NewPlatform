"""
Admin users routes - get tenant admins
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Tenant Admins"])

@router.get("/admin/tenant-admins")
async def get_tenant_admins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Get all TENANT_ADMIN users"""
    
    query = text("""
        SELECT u.id, u.email, u.full_name, u.tenant_id, t.name as company_name
        FROM users u
        LEFT JOIN tenants t ON t.id = u.tenant_id
        WHERE u.role_id = 2
        ORDER BY u.full_name
    """)
    
    result = db.execute(query)
    columns = result.keys()
    admins = [dict(zip(columns, row)) for row in result.fetchall()]
    
    return {"items": admins}
