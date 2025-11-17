# This is the new registration logic - add to auth.py

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(
    email: str,
    password: str,
    full_name: str,
    user_type: str,  # "reseller" or "user"
    company_name: str = None,
    partner_code: str = None,
    db: Session = Depends(get_system_db)
):
    """
    Registration with reseller/user logic:
    - Reseller: Creates company, becomes TENANT_ADMIN, gets partner code
    - User with partner_code: Joins admin's tenant as TENANT_USER
    - User without partner_code: Creates own workspace as TENANT_USER
    """
    from app.core.security import get_password_hash
    from app.core.partner_codes import decode_partner_code, generate_partner_code
    from app.models.user import User
    from app.models.tenant import Tenant
    
    # Check if email exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tenant_id = None
    role_id = None
    
    if user_type == "reseller":
        # Reseller: Create new tenant and become admin
        if not company_name or not company_name.strip():
            raise HTTPException(status_code=400, detail="Company name required for resellers")
        
        tenant = Tenant(name=company_name.strip(), status='TRIAL')
        db.add(tenant)
        db.flush()
        tenant_id = tenant.id
        role_id = 2  # TENANT_ADMIN
        
    elif user_type == "user":
        if partner_code and partner_code.strip():
            # User with partner code: Join existing admin's tenant
            admin_id = decode_partner_code(partner_code.strip())
            
            if not admin_id:
                raise HTTPException(status_code=400, detail="Invalid partner code")
            
            admin = db.query(User).filter(
                User.id == admin_id,
                User.role_id == 2
            ).first()
            
            if not admin:
                raise HTTPException(status_code=400, detail="Partner code not found")
            
            tenant_id = admin.tenant_id
            role_id = 3  # TENANT_USER
        else:
            # User without partner code: Create own workspace
            tenant = Tenant(name=f"{full_name.strip()}'s Workspace", status='TRIAL')
            db.add(tenant)
            db.flush()
            tenant_id = tenant.id
            role_id = 3  # TENANT_USER
    else:
        raise HTTPException(status_code=400, detail="Invalid user_type. Must be 'reseller' or 'user'")
    
    # Create user
    hashed_password = get_password_hash(password)
    user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name.strip(),
        role_id=role_id,
        tenant_id=tenant_id
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generate partner code for resellers
    user_partner_code = None
    if user_type == "reseller":
        user_partner_code = generate_partner_code(user.id)
    
    return {
        "message": "Registration successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role_id": user.role_id
        },
        "partner_code": user_partner_code
    }
