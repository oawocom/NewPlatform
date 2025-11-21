"""
Database connection manager for multi-tenant system
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# System database (main)
SYSTEM_DATABASE_URL = settings.DATABASE_URL

system_engine = create_engine(SYSTEM_DATABASE_URL)
SystemSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=system_engine)

Base = declarative_base()

def get_system_db():
    """Get system database session"""
    db = SystemSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_tenant_db(tenant_id: str):
    """Get tenant-specific database session"""
    tenant_db_name = f"tenant_{tenant_id}"
    tenant_url = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{tenant_db_name}"
    
    tenant_engine = create_engine(tenant_url)
    TenantSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=tenant_engine)
    
    db = TenantSessionLocal()
    try:
        yield db
    finally:
        db.close()
