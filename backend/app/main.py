from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
"""
FastAPI Main Application
"""
from fastapi import FastAPI
from app.core.cors_middleware import DynamicCORSMiddleware
from app.core.rate_limit import limiter
from app.core.config import settings
from app.core.security_headers import SecurityHeadersMiddleware
import sys
sys.path.insert(0, '/app')

from app.api.routes import auth, admin
from app.api.routes import users, projects, tenants

app = FastAPI(
    docs_url="/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_ENABLED else None,
    openapi_url="/openapi.json" if settings.DOCS_ENABLED else None,
    limiter=limiter,
    title="Platform V2 API",
    description="Multi-tenant SaaS Platform",
    version="2.0.0"
)



# Dynamic CORS - validates subdomains
app.add_middleware(DynamicCORSMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(tenants.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Platform V2 API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
