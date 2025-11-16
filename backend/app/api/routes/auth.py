"""
Authentication routes - Register and Login
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.schemas.auth import UserRegister, UserLogin
from app.models.user import User
from app.models.tenant import Tenant, TenantStatus
from app.models.subscription import Subscription, SubscriptionPlan, SubscriptionStatus

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_system_db)):
    """
    Register new user and create tenant (without subdomain - subdomain will be per project)
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create tenant (without subdomain)
        tenant = Tenant(
            name=user_data.company_name,
            subdomain=None,  # No subdomain at tenant level
            database_name=None,  # Will be per project
            status=TenantStatus.TRIAL,
            enabled_modules=[],  # Modules will be per project
            settings={
                "timezone": "UTC",
                "language": "en",
                "currency": "USD"
            }
        )
        db.add(tenant)
        db.flush()
        
        # Create subscription (14-day trial)
        now_utc = datetime.now(timezone.utc)
        trial_end = now_utc + timedelta(days=14)
        subscription = Subscription(
            tenant_id=tenant.id,
            plan=SubscriptionPlan.FREE,
            status=SubscriptionStatus.TRIALING,
            trial_end=trial_end,
            current_period_start=now_utc,
            current_period_end=trial_end,
            max_users=5,
            max_storage_gb=10
        )
        db.add(subscription)
        
        # Create admin user
        hashed_password = get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            role_id=2,  # TENANT_ADMIN
            tenant_id=tenant.id
        )
        db.add(user)
        
        db.commit()
        db.refresh(user)
        db.refresh(tenant)
        db.refresh(subscription)
        
        # Create access token
        access_token = create_access_token(
            data={
                "user_id": user.id,
                "email": user.email,
                "tenant_id": tenant.id,
                "role": user.role.name if user.role else None
            }
        )
        
        trial_days = (trial_end - now_utc).days if subscription.trial_end else 0
        
        return {
            "message": "Registration successful! Welcome to the platform.",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.name if user.role else None
            },
            "tenant": {
                "id": tenant.id,
                "name": tenant.name,
                "status": tenant.status.value,
                "trial_ends_at": subscription.trial_end.isoformat() if subscription.trial_end else None,
                "trial_days_remaining": trial_days
            },
            "subscription": {
                "plan": subscription.plan.value,
                "status": subscription.status.value,
                "max_users": subscription.max_users,
                "max_storage_gb": subscription.max_storage_gb
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=dict)
async def login(credentials: UserLogin, db: Session = Depends(get_system_db)):
    """
    Login user
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    access_token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email,
            "tenant_id": user.tenant_id,
            "role": user.role.name if user.role else None
        }
    )
    
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.name if user.role else None
        },
        "tenant": {
            "id": tenant.id if tenant else None,
            "name": tenant.name if tenant else None,
            "status": tenant.status.value if tenant else None
        }
    }

@router.get("/me", response_model=dict)
async def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_system_db)):
    """
    Get current authenticated user info
    """
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role.name if user.role else None,
            "is_active": current_user.is_active
        },
        "tenant": {
            "id": tenant.id if tenant else None,
            "name": tenant.name if tenant else None,
            "status": tenant.status.value if tenant else None
        } if tenant else None
    }
