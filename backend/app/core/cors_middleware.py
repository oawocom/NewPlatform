"""
Dynamic CORS Middleware - Validates subdomains against database
"""
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import re

class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        
        # Define allowed patterns
        allowed_patterns = [
            r"^https://account\.buildown\.design$",  # Admin panel
            r"^https://[a-z0-9\-]+\.buildown\.design$",  # Any subdomain
            r"^http://localhost:\d+$",  # Development
        ]
        
        # Check if origin matches any pattern
        is_allowed = False
        if origin:
            for pattern in allowed_patterns:
                if re.match(pattern, origin):
                    is_allowed = True
                    break
        
        # Call the endpoint
        response = await call_next(request)
        
        # Add CORS headers if allowed
        if is_allowed and origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
        
        return response
