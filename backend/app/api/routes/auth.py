from sqlalchemy import text
"""
Authentication routes - Register and Login with new permission system
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.core.permissions import get_user_permissions
from app.models.user import User
from app.models.tenant import Tenant

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(
    email: str,
    password: str,
    full_name: str,
    user_type: str,
    company_name: str = None,
    partner_code: str = None,
    db: Session = Depends(get_system_db)
):
    """
    Registration with reseller/user logic
    """
    from app.core.partner_codes import decode_partner_code, generate_partner_code
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tenant_id = None
    role = 'USER'
    
    if user_type == 'reseller':
        if not company_name:
            raise HTTPException(status_code=400, detail="Company name required for resellers")
        
        new_tenant = Tenant(name=company_name, status='TRIAL')
        db.add(new_tenant)
        db.flush()
        tenant_id = new_tenant.id
        role = 'TENANT_ADMIN'
        
    elif user_type == 'user':
        if partner_code:
            parent_user_id = decode_partner_code(partner_code)
            if not parent_user_id:
                raise HTTPException(status_code=400, detail="Invalid partner code")
            
            parent_user = db.query(User).filter(User.id == parent_user_id).first()
            if not parent_user or not parent_user.tenant_id:
                raise HTTPException(status_code=400, detail="Invalid partner code")
            
            tenant_id = parent_user.tenant_id
            role = 'USER'
        else:
            new_tenant = Tenant(name=f"{full_name}'s Workspace", status='TRIAL')
            db.add(new_tenant)
            db.flush()
            tenant_id = new_tenant.id
            role = 'USER'
    
    hashed_password = get_password_hash(password)
    
    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        role=role,
        tenant_id=tenant_id,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"user_id": new_user.id})
    
    permissions = get_user_permissions(new_user)
    
    partner_code_generated = None
    if role == 'TENANT_ADMIN':
        partner_code_generated = generate_partner_code(new_user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role,
            "tenant_id": new_user.tenant_id,
            "permissions": permissions
        },
        "partner_code": partner_code_generated
    }

@router.post("/login")
async def login(
    email: str,
    password: str,
    db: Session = Depends(get_system_db)
):
    """
    Login endpoint - returns token and user with permissions
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    access_token = create_access_token(data={"user_id": user.id})
    
    permissions = get_user_permissions(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "tenant_id": user.tenant_id,
            "permissions": permissions
        }
    }

@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_system_db)
):
    """
    Get current user info with permissions
    """
    permissions = get_user_permissions(current_user)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "tenant_id": current_user.tenant_id,
        "is_active": current_user.is_active,
        "permissions": permissions
    }

@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: Session = Depends(get_system_db)
):
    """
    Forgot password endpoint
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return {"message": "If email exists, reset link sent"}
    
    return {"message": "If email exists, reset link sent"}
