"""
EduPilot — App Configuration

Reads settings from environment variables or the .env file.
Import `settings` anywhere in the backend to access config values.

Usage:
    from app.core.config import settings
    print(settings.APP_NAME)
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "EduPilot"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"
    DATABASE_URL: str = "sqlite:///./edupilot.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FRONTEND_URL: str = "http://localhost:8000"

    class Config:
        # Reads from backend/.env if it exists
        env_file = ".env"


# Single shared instance — import this everywhere
settings = Settings()