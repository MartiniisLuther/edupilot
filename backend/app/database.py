"""
EduPilot — Database Setup

Creates the SQLAlchemy engine and session factory.
`create_tables()` is called once on server startup via main.py's lifespan.

Usage (in routers/services):
    from app.database import SessionLocal

    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


# SQLite needs check_same_thread=False for FastAPI's async context
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """All ORM models inherit from this."""
    pass


def create_tables():
    """
    Creates all tables defined in models/ that don't exist yet.
    Safe to call multiple times — won't drop existing data.
    Import all models before calling so SQLAlchemy knows about them.
    """
    # Import models here so Base knows about them before create_all()
    # Uncomment each as you create the model file:
    # from app.models import user, course, task, exam, grade, calendar
    Base.metadata.create_all(bind=engine)