from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional, Type
from fastapi import HTTPException

class DynamicCRUD:
    """Universal CRUD operations for any database table/model"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_model_by_name(self, table_name: str) -> Optional[Type]:
        """Get SQLAlchemy model class by table name"""
        from app.models.user import User
        from app.models.tenant import Tenant
        from app.models.subscription import Subscription
        from app.models.project import Project
        
        models = {
            'users': User,
            'tenants': Tenant,
            'subscriptions': Subscription,
            'projects': Project,
        }
        
        return models.get(table_name)
    
    def get_all(self, table_name: str, skip: int = 0, limit: int = 100, filters: Dict = None) -> List[Any]:
        """Get all records from a table"""
        model = self.get_model_by_name(table_name)
        if not model:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        query = self.db.query(model)
        
        if filters:
            for key, value in filters.items():
                if hasattr(model, key):
                    query = query.filter(getattr(model, key) == value)
        
        return query.offset(skip).limit(limit).all()
    
    def get_one(self, table_name: str, item_id: int) -> Any:
        """Get a single record by ID"""
        model = self.get_model_by_name(table_name)
        if not model:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        item = self.db.query(model).filter(model.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item not found")
        
        return item
    
    def create(self, table_name: str, data: Dict) -> Any:
        """Create a new record"""
        model = self.get_model_by_name(table_name)
        if not model:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        try:
            new_item = model(**data)
            self.db.add(new_item)
            self.db.commit()
            self.db.refresh(new_item)
            return new_item
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=str(e))
    
    def update(self, table_name: str, item_id: int, data: Dict) -> Any:
        """Update an existing record"""
        model = self.get_model_by_name(table_name)
        if not model:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        item = self.db.query(model).filter(model.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item not found")
        
        try:
            for key, value in data.items():
                if hasattr(item, key):
                    setattr(item, key, value)
            
            self.db.commit()
            self.db.refresh(item)
            return item
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete(self, table_name: str, item_id: int) -> bool:
        """Delete a record"""
        model = self.get_model_by_name(table_name)
        if not model:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        item = self.db.query(model).filter(model.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item not found")
        
        try:
            self.db.delete(item)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=str(e))
