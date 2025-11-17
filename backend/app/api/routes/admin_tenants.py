"""
Admin tenants routes - filtered tenants
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/admin/tenants", tags=["Admin Tenants"])

@router.get("/with-admins")
async def get_tenants_with_admins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """Get only tenants that have TENANT_ADMIN users"""
    
    # Get tenants that have at least one TENANT_ADMIN (role_id=2) user
    query = text("""
        SELECT DISTINCT t.id, t.name, t.status, t.created_at
        FROM tenants t
        INNER JOIN users u ON u.tenant_id = t.id
        WHERE u.role_id = 2
        ORDER BY t.name
    """)
    
    result = db.execute(query)
    columns = result.keys()
    tenants = [dict(zip(columns, row)) for row in result.fetchall()]
    
    return {"items": tenants}
