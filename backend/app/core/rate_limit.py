"""
Rate Limiting Configuration
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

# Rate limit rules
RATE_LIMITS = {
    "login": "5/15minutes",      # 5 attempts per 15 minutes
    "register": "3/hour",         # 3 registrations per hour
    "password_reset": "3/hour",   # 3 reset requests per hour
    "api_default": "100/minute"   # General API limit
}
