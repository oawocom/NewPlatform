"""
User Service - Extends BaseService with user-specific operations
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.services.base_service import BaseService
from app.core.security import get_password_hash, verify_password


class UserService(BaseService[User]):
    """
    User-specific service with authentication logic
    """
    
    def __init__(self, db: Session, current_user: User):
        super().__init__(db, User, current_user)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email
        
        Args:
            email: User's email address
            
        Returns:
            User instance or None
        """
        query = self.db.query(User).filter(User.email == email)
        query = self._apply_tenant_filter(query)
        return query.first()
    
    def create_user(
        self,
        email: str,
        password: str,
        name: str,
        role: str = 'USER',
        tenant_id: Optional[int] = None
    ) -> User:
        """
        Create new user with hashed password
        
        Args:
            email: User's email
            password: Plain text password
            name: User's full name
            role: User role (default: USER)
            tenant_id: Tenant ID (optional, auto-assigned if not super admin)
            
        Returns:
            Created user instance
            
        Raises:
            HTTPException: If email already exists
        """
        # Check if email already exists
        existing_user = self.get_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Determine tenant_id
        if tenant_id is None and not self._is_super_admin():
            tenant_id = self.current_user.tenant_id
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create user
        user_data = {
            'email': email,
            'password_hash': hashed_password,
            'full_name': name,
            'role': role,
            'tenant_id': tenant_id
        }
        
        return self.create(user_data)
    
    def update_password(self, user_id: int, new_password: str) -> User:
        """
        Update user password
        
        Args:
            user_id: User ID
            new_password: New plain text password
            
        Returns:
            Updated user instance
        """
        hashed_password = get_password_hash(new_password)
        return self.update(user_id, {'password_hash': hashed_password})
    
    def verify_user_password(self, user_id: int, password: str) -> bool:
        """
        Verify user's password
        
        Args:
            user_id: User ID
            password: Plain text password to verify
            
        Returns:
            True if password is correct
        """
        user = self.get_by_id(user_id)
        return verify_password(password, user.password_hash)
    
    def get_users_by_tenant(self, tenant_id: int) -> List[User]:
        """
        Get all users in a tenant (super admin only)
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            List of users
            
        Raises:
            HTTPException: If not super admin
        """
        if not self._is_super_admin():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admins can view users across tenants"
            )
        
        return self.get_all(filters={'tenant_id': tenant_id})
    
    def activate_user(self, user_id: int) -> User:
        """Activate a user account"""
        return self.update(user_id, {'is_active': True})
    
    def deactivate_user(self, user_id: int) -> User:
        """Deactivate a user account"""
        return self.update(user_id, {'is_active': False})
    
    def change_role(self, user_id: int, new_role: str) -> User:
        """
        Change user role (super admin only)
        
        Args:
            user_id: User ID
            new_role: New role (USER, ADMIN, SUPER_ADMIN)
            
        Returns:
            Updated user
            
        Raises:
            HTTPException: If not super admin
        """
        if not self._is_super_admin():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admins can change user roles"
            )
        
        valid_roles = ['USER', 'ADMIN', 'SUPER_ADMIN']
        if new_role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
        
        return self.update(user_id, {'role': new_role})
