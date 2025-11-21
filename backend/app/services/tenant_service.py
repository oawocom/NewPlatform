"""
Tenant Service - Extends BaseService with tenant-specific operations
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.tenant import Tenant
from app.services.base_service import BaseService
from app.models.user import User


class TenantService(BaseService[Tenant]):
    """
    Tenant-specific service with business logic
    """
    
    def __init__(self, db: Session, current_user: User):
        super().__init__(db, Tenant, current_user)
    
    def get_all(self, skip: int = 0, limit: int = 100, filters: Optional[dict] = None):
        """
        Override get_all - regular users only see their own tenant
        Super admin sees all tenants
        """
        if self._is_super_admin():
            # Super admin sees all
            return super().get_all(skip, limit, filters)
        else:
            # Regular users only see their tenant
            query = self.db.query(Tenant).filter(Tenant.id == self.current_user.tenant_id)
            return query.offset(skip).limit(limit).all()
    
    def get_by_subdomain(self, subdomain: str) -> Optional[Tenant]:
        """Get tenant by subdomain"""
        return self.db.query(Tenant).filter(Tenant.subdomain == subdomain).first()
    
    def activate_tenant(self, tenant_id: int) -> Tenant:
        """Activate a tenant"""
        if not self._is_super_admin():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admins can activate tenants"
            )
        return self.update(tenant_id, {'is_active': True})
    
    def deactivate_tenant(self, tenant_id: int) -> Tenant:
        """Deactivate a tenant"""
        if not self._is_super_admin():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admins can deactivate tenants"
            )
        return self.update(tenant_id, {'is_active': False})
