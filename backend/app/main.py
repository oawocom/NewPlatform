"""
FastAPI Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
sys.path.insert(0, '/app')

from app.api.routes import auth, crud, admin, rbac

app = FastAPI(
    title="Multi-Tenant Platform API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(crud.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(rbac.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Multi-Tenant Platform API", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Admin tenants routes
from app.api.routes import admin_tenants
app.include_router(admin_tenants.router, prefix="/api/v1")

# Admin users routes (tenant admins)
from app.api.routes import admin_users
app.include_router(admin_users.router, prefix="/api/v1")
