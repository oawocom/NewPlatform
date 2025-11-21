from sqlalchemy import text
"""
Authentication routes - Register, Login, Email Verification, Password Reset
"""
from fastapi import APIRouter, Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.core.permissions import get_user_permissions
from app.core.email import (
    send_verification_email, 
    send_password_reset_email,
    generate_otp,
    generate_reset_token
)
from app.models.user import User
from app.models.tenant import Tenant
from app.core.rate_limit import limiter, RATE_LIMITS
from app.core.validators import validate_password_strength, validate_email_format

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    user_type: str
    company_name: str = None
    partner_code: str = None

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
@limiter.limit(RATE_LIMITS["register"])
async def register(
    request: Request,
    email: str,
    password: str,
    full_name: str,
    user_type: str,
    company_name: str = None,
    partner_code: str = None,
    db: Session = Depends(get_system_db)
):
    """
    Registration - sends OTP to email for verification
    User cannot login until email is verified
    """
    from app.core.partner_codes import decode_partner_code, generate_partner_code
    
    # Validate input
    email = validate_email_format(email)
    password = validate_password_strength(password)

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
    
    # Generate OTP
    otp = generate_otp(6)
    otp_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    hashed_password = get_password_hash(password)
    
    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        role=role,
        tenant_id=tenant_id,
        is_active=True,
        email_verified=False,
        email_verification_otp=otp,
        email_verification_expires=otp_expires
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email
    email_sent = send_verification_email(email, otp, full_name)
    
    if not email_sent:
        # Log error but don't fail registration
        print(f"Failed to send verification email to {email}")
    
    partner_code_generated = None
    if role == 'TENANT_ADMIN':
        partner_code_generated = generate_partner_code(new_user.id)
    
    return {
        "message": "Registration successful. Please check your email for verification code.",
        "user_id": new_user.id,
        "email": new_user.email,
        "email_sent": email_sent,
        "partner_code": partner_code_generated
    }

@router.post("/verify-email")
async def verify_email(
    email: str,
    otp: str,
    db: Session = Depends(get_system_db)
):
    """
    Verify email with OTP
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    if not user.email_verification_otp:
        raise HTTPException(status_code=400, detail="No verification code found. Please register again.")
    
    # Check if OTP expired
    if user.email_verification_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification code expired. Please request a new one.")
    
    # Check if OTP matches
    if user.email_verification_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Mark as verified
    user.email_verified = True
    user.email_verification_otp = None
    user.email_verification_expires = None
    db.commit()
    
    # Create access token
    access_token = create_access_token(data={"user_id": user.id})
    permissions = get_user_permissions(user)
    
    return {
        "message": "Email verified successfully",
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

@router.post("/resend-otp")
async def resend_otp(
    email: str,
    db: Session = Depends(get_system_db)
):
    """
    Resend verification OTP
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Generate new OTP
    otp = generate_otp(6)
    otp_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    user.email_verification_otp = otp
    user.email_verification_expires = otp_expires
    db.commit()
    
    # Send email
    email_sent = send_verification_email(email, otp, user.full_name)
    
    return {
        "message": "Verification code resent" if email_sent else "Failed to send email",
        "email_sent": email_sent
    }

@router.post("/login")
@limiter.limit(RATE_LIMITS["login"])
async def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_system_db)
):
    """
    Login - requires verified email
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Check if email is verified
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
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

@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: Session = Depends(get_system_db)
):
    """
    Forgot password - sends reset link
    """
    user = db.query(User).filter(User.email == email).first()
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If email exists, reset link has been sent"}
    
    # Generate reset token
    reset_token = generate_reset_token()
    reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    user.password_reset_token = reset_token
    user.password_reset_expires = reset_expires
    db.commit()
    
    # Send reset email
    email_sent = send_password_reset_email(email, reset_token, user.full_name)
    
    return {"message": "If email exists, reset link has been sent"}

@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_system_db)
):
    """
    Reset password with token
    """
    user = db.query(User).filter(User.password_reset_token == token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    
    # Check if token expired
    if user.password_reset_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset link has expired")
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    db.commit()
    
    return {"message": "Password reset successfully"}

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
        "email_verified": current_user.email_verified,
        "permissions": permissions
    }

@router.get("/validate-partner-code")
async def validate_partner_code(
    code: str,
    db: Session = Depends(get_system_db)
):
    """
    Validate partner code without authentication
    """
    from app.core.partner_codes import decode_partner_code
    
    if not code.startswith('PA'):
        return {"valid": False, "message": "Invalid code format"}
    
    user_id = decode_partner_code(code)
    
    if not user_id:
        return {"valid": False, "message": "Invalid code"}
    
    # Check if user exists and is tenant admin
    user = db.query(User).filter(
        User.id == user_id,
        User.role == 'TENANT_ADMIN',
        User.is_active == True
    ).first()
    
    if not user:
        return {"valid": False, "message": "Code not found or expired"}
    
    return {
        "valid": True,
        "admin_name": user.full_name,
        "company": user.tenant.name if user.tenant else None
    }
