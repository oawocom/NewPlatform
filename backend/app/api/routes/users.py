"""
User Routes - Service Layer Implementation
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, EmailStr

from app.services.user_service import UserService
from app.services.dependencies import get_user_service

router = APIRouter(prefix="/users", tags=["users"])


# ============ Pydantic Schemas ============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = 'USER'


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class PasswordUpdate(BaseModel):
    new_password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    tenant_id: int
    
    class Config:
        from_attributes = True


# ============ Routes ============

@router.get("", response_model=List[UserResponse])
@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    service: UserService = Depends(get_user_service)
):
    """Get all users (tenant-isolated)"""
    return service.get_all(skip=skip, limit=limit)


@router.get("/count")
async def count_users(service: UserService = Depends(get_user_service)):
    """Get total user count"""
    return {"count": service.count()}


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """Get user by ID"""
    return service.get_by_id(user_id)


@router.post("", response_model=UserResponse, status_code=201)
@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(get_user_service)
):
    """Create new user"""
    return service.create_user(
        email=data.email,
        password=data.password,
        name=data.full_name,
        role=data.role
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    service: UserService = Depends(get_user_service)
):
    """Update user"""
    update_data = data.dict(exclude_unset=True)
    return service.update(user_id, update_data)


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """Delete user"""
    service.delete(user_id)
    return {"message": "User deleted successfully"}


@router.post("/{user_id}/password")
async def update_password(
    user_id: int,
    data: PasswordUpdate,
    service: UserService = Depends(get_user_service)
):
    """Update user password"""
    service.update_password(user_id, data.new_password)
    return {"message": "Password updated successfully"}


@router.post("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """Activate user account"""
    return service.activate_user(user_id)


@router.post("/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """Deactivate user account"""
    return service.deactivate_user(user_id)


@router.put("/{user_id}/role")
async def change_user_role(
    user_id: int,
    new_role: str,
    service: UserService = Depends(get_user_service)
):
    """Change user role (super admin only)"""
    return service.change_role(user_id, new_role)
