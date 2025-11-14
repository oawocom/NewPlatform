"""
Tenant management routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.models.tenant import Tenant

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.get("/check-subdomain/{subdomain}")
async def check_subdomain(subdomain: str, db: Session = Depends(get_system_db)):
    """
    Check if subdomain is available
    """
    existing = db.query(Tenant).filter(Tenant.subdomain == subdomain).first()
    return {
        "subdomain": subdomain,
        "available": existing is None
    }
