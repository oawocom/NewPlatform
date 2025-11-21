"""
Project Routes - Service Layer Implementation
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.services.project_service import ProjectService
from app.services.dependencies import get_project_service, get_project_service_public

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectResponse(BaseModel):
    id: int
    name: str
    subdomain: str
    status: str
    tenant_id: int
    is_active: bool
    description: Optional[str] = None
    modules_enabled: Optional[List[str]] = []
    password: Optional[str] = None
    
    class Config:
        from_attributes = True


@router.get("", response_model=List[ProjectResponse])
@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    service: ProjectService = Depends(get_project_service)
):
    """Get all projects (tenant-isolated)"""
    return service.get_all(skip=skip, limit=limit)


@router.get("/count")
async def count_projects(service: ProjectService = Depends(get_project_service)):
    """Get total project count"""
    return {"count": service.count()}


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service)
):
    """Get project by ID"""
    return service.get_by_id(project_id)


@router.post("", response_model=ProjectResponse, status_code=201)
@router.post("/", response_model=ProjectResponse, status_code=201)
async def create_project(
    data: dict,
    service: ProjectService = Depends(get_project_service)
):
    """Create new project"""
    return service.create(data)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    data: dict,
    service: ProjectService = Depends(get_project_service)
):
    """Update project"""
    return service.update(project_id, data)


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service)
):
    """Delete project"""
    service.delete(project_id)
    return {"message": "Project deleted successfully"}


@router.post("/{project_id}/publish", response_model=ProjectResponse)
async def publish_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service)
):
    """Publish project"""
    return service.publish_project(project_id)


@router.get("/by-subdomain/{subdomain}", response_model=ProjectResponse)
async def get_project_by_subdomain(
    subdomain: str,
    service: ProjectService = Depends(get_project_service_public)
):
    """Get project by subdomain (public endpoint)"""
    project = service.get_by_subdomain(subdomain)
    if not project:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with subdomain '{subdomain}' not found"
        )
    return project
