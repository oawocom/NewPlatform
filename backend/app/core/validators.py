"""
Input Validators - Password strength, email, etc.
"""
import re
from fastapi import HTTPException, status

def validate_password_strength(password: str) -> str:
    """
    Enforce strong password policy:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character
    """
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number"
        )
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character (!@#$%^&*...)"
        )
    
    return password


def validate_email_format(email: str) -> str:
    """
    Basic email validation (Pydantic does most of this)
    """
    email = email.lower().strip()
    
    if len(email) > 254:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address too long"
        )
    
    return email
