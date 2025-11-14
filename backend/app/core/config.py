from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Tenant Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_USER: str = "platform_user"
    POSTGRES_PASSWORD: str = "your_secure_password"
    POSTGRES_HOST: str = "localhost"  # Changed from "postgres"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "platform_system"
    
    # Redis
    REDIS_HOST: str = "localhost"  # Changed from "redis"
    REDIS_PORT: int = 6379
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
