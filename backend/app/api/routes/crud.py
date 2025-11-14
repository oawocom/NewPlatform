"""
Universal CRUD routes - works for ANY table
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db, system_engine
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/crud", tags=["CRUD"])

def table_exists(table_name: str) -> bool:
    """Check if table exists"""
    inspector = inspect(system_engine)
    return table_name in inspector.get_table_names()

@router.get("/{table_name}")
async def list_items(
    table_name: str,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """List all items from table"""
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        # Get tenant_id from current user
        tenant_id = current_user.tenant_id
        
        # Simple SQL query
        query = text(f"SELECT * FROM {table_name} WHERE tenant_id = :tenant_id")
        result = db.execute(query, {"tenant_id": tenant_id})
        
        # Convert to dict
        columns = result.keys()
        items = [dict(zip(columns, row)) for row in result.fetchall()]
        
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{table_name}/{item_id}")
async def get_item(
    table_name: str,
    item_id: int,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Get single item by ID"""
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        tenant_id = current_user.tenant_id
        query = text(f"SELECT * FROM {table_name} WHERE id = :id AND tenant_id = :tenant_id")
        result = db.execute(query, {"id": item_id, "tenant_id": tenant_id})
        
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Item not found")
        
        columns = result.keys()
        return dict(zip(columns, row))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{table_name}")
async def create_item(
    table_name: str,
    data: Dict[str, Any],
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Create new item"""
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        # Add tenant_id automatically
        data['tenant_id'] = current_user.tenant_id
        
        # Remove None values
        data = {k: v for k, v in data.items() if v is not None}
        
        # Build INSERT query
        columns = ', '.join(data.keys())
        placeholders = ', '.join([f':{k}' for k in data.keys()])
        query = text(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders}) RETURNING *")
        
        result = db.execute(query, data)
        db.commit()
        
        row = result.fetchone()
        columns = result.keys()
        return dict(zip(columns, row))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{table_name}/{item_id}")
async def update_item(
    table_name: str,
    item_id: int,
    data: Dict[str, Any],
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Update existing item"""
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        tenant_id = current_user.tenant_id
        
        # Remove None values and tenant_id (shouldn't be updated)
        data = {k: v for k, v in data.items() if v is not None and k not in ['id', 'tenant_id', 'created_at']}
        
        if not data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        # Build UPDATE query
        set_clause = ', '.join([f"{k} = :{k}" for k in data.keys()])
        query = text(f"UPDATE {table_name} SET {set_clause} WHERE id = :id AND tenant_id = :tenant_id RETURNING *")
        
        data['id'] = item_id
        data['tenant_id'] = tenant_id
        
        result = db.execute(query, data)
        db.commit()
        
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Item not found")
        
        columns = result.keys()
        return dict(zip(columns, row))
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{table_name}/{item_id}")
async def delete_item(
    table_name: str,
    item_id: int,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    """Delete item"""
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        tenant_id = current_user.tenant_id
        query = text(f"DELETE FROM {table_name} WHERE id = :id AND tenant_id = :tenant_id")
        result = db.execute(query, {"id": item_id, "tenant_id": tenant_id})
        db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        
        return {"message": "Item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))