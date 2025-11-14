"""
Metadata routes - Get table structure dynamically
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from typing import Dict, List
import sys
sys.path.insert(0, '/app')

from app.core.database import get_system_db, system_engine
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/meta", tags=["Metadata"])

# Map SQLAlchemy types to form field types
TYPE_MAPPING = {
    'VARCHAR': 'text',
    'TEXT': 'textarea',
    'INTEGER': 'number',
    'BIGINT': 'number',
    'BOOLEAN': 'checkbox',
    'DATETIME': 'datetime',
    'DATE': 'date',
    'ENUM': 'select',
    'JSON': 'textarea',
}

@router.get("/{table_name}")
async def get_table_metadata(
    table_name: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get table structure (columns, types) dynamically from database
    """
    try:
        inspector = inspect(system_engine)
        
        # Check if table exists
        if table_name not in inspector.get_table_names():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Table '{table_name}' not found"
            )
        
        # Get columns
        columns = inspector.get_columns(table_name)
        
        # Build field definitions
        fields = []
        for col in columns:
            # Skip system fields
            if col['name'] in ['id', 'created_at', 'updated_at', 'tenant_id']:
                continue
            
            # Map SQLAlchemy type to form type
            col_type_str = str(col['type'])
            form_type = 'text'  # default
            
            for sql_type, field_type in TYPE_MAPPING.items():
                if sql_type in col_type_str.upper():
                    form_type = field_type
                    break
            
            # Build field config
            field = {
                'name': col['name'],
                'label': col['name'].replace('_', ' ').title(),
                'type': form_type,
                'required': not col['nullable'],
                'defaultValue': col['default'] if col['default'] else None,
            }
            
            # Special handling for enums (get options)
            if 'ENUM' in col_type_str.upper():
                # Extract enum values if possible
                field['options'] = []  # TODO: parse enum values
            
            # Special handling for password fields
            if 'password' in col['name'].lower():
                field['type'] = 'password'
            
            # Special handling for email fields
            if 'email' in col['name'].lower():
                field['type'] = 'email'
            
            fields.append(field)
        
        # Build response
        response = {
            'table': table_name,
            'title': table_name.capitalize(),
            'apiEndpoint': f'/api/v1/crud/{table_name}',
            'fields': fields,
            'columns': [
                {
                    'key': col['name'],
                    'label': col['name'].replace('_', ' ').title(),
                    'sortable': True,
                    'searchable': col['name'] not in ['id', 'created_at', 'updated_at'],
                    'type': 'badge' if 'status' in col['name'] or 'role' in col['name'] else 'text'
                }
                for col in columns
                if col['name'] not in ['hashed_password', 'settings']  # Hide sensitive fields
            ]
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get table metadata: {str(e)}"
        )

@router.get("/")
async def list_tables(current_user: User = Depends(get_current_user)):
    """
    List all available tables
    """
    try:
        inspector = inspect(system_engine)
        tables = inspector.get_table_names()
        
        # Filter system tables
        user_tables = [
            table for table in tables 
            if not table.startswith('pg_') and table not in ['spatial_ref_sys']
        ]
        
        return {
            'tables': user_tables
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list tables: {str(e)}"
        )