"""
Base Service Layer - DRY principle implementation
Handles common CRUD operations with tenant isolation
"""
from typing import TypeVar, Generic, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.models.user import User

T = TypeVar('T')


class BaseService(Generic[T]):
    """
    Generic base service for CRUD operations
    
    Features:
    - Automatic tenant isolation
    - Type-safe operations
    - Centralized error handling
    - Consistent logging
    """
    
    def __init__(
        self,
        db: Session,
        model: Type[T],
        current_user: User
    ):
        self.db = db
        self.model = model
        self.current_user = current_user
        self.table_name = model.__tablename__
    
    def _is_super_admin(self) -> bool:
        """Check if current user is super admin"""
        return self.current_user.role == 'SUPER_ADMIN'
    
    def _apply_tenant_filter(self, query):
        """
        Apply tenant isolation filter
        Super admins see all data, regular users only their tenant data
        """
        if not self._is_super_admin():
            # Check if model has tenant_id column
            if hasattr(self.model, 'tenant_id'):
                query = query.filter(
                    self.model.tenant_id == self.current_user.tenant_id
                )
        return query
    
    def _apply_filters(self, query, filters: Optional[Dict[str, Any]] = None):
        """Apply custom filters to query"""
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)
        return query
    
    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[T]:
        """
        Get all records with pagination and filters
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Dictionary of field:value filters
            
        Returns:
            List of model instances
        """
        try:
            query = self.db.query(self.model)
            query = self._apply_tenant_filter(query)
            query = self._apply_filters(query, filters)
            
            return query.offset(skip).limit(limit).all()
            
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
    
    def get_by_id(self, item_id: int) -> Optional[T]:
        """
        Get single record by ID with tenant isolation
        
        Args:
            item_id: ID of the record
            
        Returns:
            Model instance or None
            
        Raises:
            HTTPException: If record not found
        """
        try:
            query = self.db.query(self.model).filter(self.model.id == item_id)
            query = self._apply_tenant_filter(query)
            
            item = query.first()
            
            if not item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"{self.table_name} with id {item_id} not found"
                )
            
            return item
            
        except HTTPException:
            raise
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
    
    def create(self, data: Dict[str, Any]) -> T:
        """
        Create new record
        
        Args:
            data: Dictionary of field values
            
        Returns:
            Created model instance
            
        Raises:
            HTTPException: If creation fails
        """
        try:
            # Automatically add tenant_id for non-super-admins
            if not self._is_super_admin() and hasattr(self.model, 'tenant_id'):
                data['tenant_id'] = self.current_user.tenant_id
            
            # Add created_by if model has it
            if hasattr(self.model, 'created_by_id'):
                data['created_by_id'] = self.current_user.id
            
            new_item = self.model(**data)
            self.db.add(new_item)
            self.db.commit()
            self.db.refresh(new_item)
            
            return new_item
            
        except SQLAlchemyError as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create {self.table_name}: {str(e)}"
            )
    
    def update(self, item_id: int, data: Dict[str, Any]) -> T:
        """
        Update existing record
        
        Args:
            item_id: ID of record to update
            data: Dictionary of fields to update
            
        Returns:
            Updated model instance
            
        Raises:
            HTTPException: If update fails or record not found
        """
        try:
            # Get existing item (includes tenant check)
            item = self.get_by_id(item_id)
            
            # Add updated_by if model has it
            if hasattr(self.model, 'updated_by_id'):
                data['updated_by_id'] = self.current_user.id
            
            # Update fields
            for key, value in data.items():
                if hasattr(item, key):
                    setattr(item, key, value)
            
            self.db.commit()
            self.db.refresh(item)
            
            return item
            
        except HTTPException:
            raise
        except SQLAlchemyError as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update {self.table_name}: {str(e)}"
            )
    
    def delete(self, item_id: int) -> bool:
        """
        Delete record (soft delete if model supports it)
        
        Args:
            item_id: ID of record to delete
            
        Returns:
            True if deleted successfully
            
        Raises:
            HTTPException: If delete fails or record not found
        """
        try:
            # Get existing item (includes tenant check)
            item = self.get_by_id(item_id)
            
            # Soft delete if model has deleted_at field
            if hasattr(item, 'deleted_at'):
                from datetime import datetime, timezone
                item.deleted_at = datetime.now(timezone.utc)
                if hasattr(item, 'deleted_by_id'):
                    item.deleted_by_id = self.current_user.id
                self.db.commit()
            else:
                # Hard delete
                self.db.delete(item)
                self.db.commit()
            
            return True
            
        except HTTPException:
            raise
        except SQLAlchemyError as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to delete {self.table_name}: {str(e)}"
            )
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count records with optional filters
        
        Args:
            filters: Dictionary of field:value filters
            
        Returns:
            Total count of records
        """
        try:
            query = self.db.query(self.model)
            query = self._apply_tenant_filter(query)
            query = self._apply_filters(query, filters)
            
            return query.count()
            
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
