"""
Tenant Routes - Service Layer Implementation
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.services.tenant_service import TenantService
from app.services.dependencies import get_tenant_service

router = APIRouter(prefix="/tenants", tags=["tenants"])


class TenantResponse(BaseModel):
    id: int
    name: str
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None
    status: str
    is_active: Optional[bool] = None
    
    class Config:
        from_attributes = True


@router.get("", response_model=List[TenantResponse])
@router.get("/", response_model=List[TenantResponse])
async def list_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    service: TenantService = Depends(get_tenant_service)
):
    """Get all tenants (super admin only sees all)"""
    return service.get_all(skip=skip, limit=limit)


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: int,
    service: TenantService = Depends(get_tenant_service)
):
    """Get tenant by ID"""
    return service.get_by_id(tenant_id)


@router.post("", response_model=TenantResponse, status_code=201)
@router.post("/", response_model=TenantResponse, status_code=201)
async def create_tenant(
    data: dict,
    service: TenantService = Depends(get_tenant_service)
):
    """Create new tenant"""
    return service.create(data)


@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    data: dict,
    service: TenantService = Depends(get_tenant_service)
):
    """Update tenant"""
    return service.update(tenant_id, data)


@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: int,
    service: TenantService = Depends(get_tenant_service)
):
    """Delete tenant"""
    service.delete(tenant_id)
    return {"message": "Tenant deleted successfully"}
