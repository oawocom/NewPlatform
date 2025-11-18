from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime, timezone
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db, system_engine
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/crud", tags=["CRUD"])

def table_exists(table_name: str) -> bool:
    inspector = inspect(system_engine)
    return table_name in inspector.get_table_names()

def is_super_admin(user: User) -> bool:
    return user.role == 'SUPER_ADMIN'

@router.get("/{table_name}")
async def list_items(
    table_name: str,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        if is_super_admin(current_user):
            query = text(f"SELECT * FROM {table_name}")
            result = db.execute(query)
        else:
            tenant_id = current_user.tenant_id
            query = text(f"SELECT * FROM {table_name} WHERE tenant_id = :tenant_id")
            result = db.execute(query, {"tenant_id": tenant_id})
        
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
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        if is_super_admin(current_user):
            query = text(f"SELECT * FROM {table_name} WHERE id = :id")
            result = db.execute(query, {"id": item_id})
        else:
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
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        if not is_super_admin(current_user) and 'tenant_id' not in data:
            data['tenant_id'] = current_user.tenant_id
        
        if table_name == 'projects':
            data['created_by_id'] = current_user.id
            if 'status' not in data:
                data['status'] = 'INACTIVE'
        
        columns = ', '.join(data.keys())
        placeholders = ', '.join([f":{key}" for key in data.keys()])
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
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        if is_super_admin(current_user):
            check_query = text(f"SELECT * FROM {table_name} WHERE id = :id")
            check_result = db.execute(check_query, {"id": item_id})
        else:
            tenant_id = current_user.tenant_id
            check_query = text(f"SELECT * FROM {table_name} WHERE id = :id AND tenant_id = :tenant_id")
            check_result = db.execute(check_query, {"id": item_id, "tenant_id": tenant_id})
        
        if not check_result.fetchone():
            raise HTTPException(status_code=404, detail="Item not found")
        
        set_clause = ', '.join([f"{key} = :{key}" for key in data.keys()])
        query = text(f"UPDATE {table_name} SET {set_clause} WHERE id = :id RETURNING *")
        data['id'] = item_id
        result = db.execute(query, data)
        db.commit()
        
        row = result.fetchone()
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
    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    
    try:
        if is_super_admin(current_user):
            query = text(f"DELETE FROM {table_name} WHERE id = :id RETURNING *")
            result = db.execute(query, {"id": item_id})
        else:
            tenant_id = current_user.tenant_id
            query = text(f"DELETE FROM {table_name} WHERE id = :id AND tenant_id = :tenant_id RETURNING *")
            result = db.execute(query, {"id": item_id, "tenant_id": tenant_id})
        
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Item not found")
        
        db.commit()
        return {"message": "Item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/projects/{project_id}/publish")
async def publish_project(
    project_id: int,
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    try:
        query = text("SELECT * FROM projects WHERE id = :id AND tenant_id = :tenant_id")
        result = db.execute(query, {"id": project_id, "tenant_id": current_user.tenant_id})
        project = result.fetchone()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        now = datetime.now(timezone.utc)
        update_query = text("""
            UPDATE projects 
            SET status = 'ACTIVE', published_at = :published_at, published_by_id = :published_by_id
            WHERE id = :id
            RETURNING *
        """)
        result = db.execute(update_query, {
            "id": project_id,
            "published_at": now,
            "published_by_id": current_user.id
        })
        db.commit()
        
        row = result.fetchone()
        columns = result.keys()
        return dict(zip(columns, row))
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tenants")
async def list_tenants(
    db: Session = Depends(get_system_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if is_super_admin(current_user):
            query = text("SELECT * FROM tenants")
            result = db.execute(query)
        else:
            tenant_id = current_user.tenant_id
            query = text("SELECT * FROM tenants WHERE id = :tenant_id")
            result = db.execute(query, {"tenant_id": tenant_id})
        
        columns = result.keys()
        items = [dict(zip(columns, row)) for row in result.fetchall()]
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
