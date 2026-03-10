"""
EduPilot — FastAPI Application Entry Point

This file:
  - Creates the FastAPI app instance
  - Mounts the frontend folder as static files (so the browser can load HTML/CSS/JS)
  - Registers all API routers under /api/...
  - Configures CORS
  - Creates DB tables on startup

HOW TO RUN:
  cd backend
  uvicorn app.main:app --reload --port 8000

Then open: http://localhost:8000
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from app.core.config import settings
from app.database import create_tables


# ── Lifespan — replaces deprecated @app.on_event("startup") ──────────────────
# Runs create_tables() once when the server starts.
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()      # startup
    yield                # server runs here
                         # anything after yield runs on shutdown

# Import routers (uncomment as each is built out)
# from app.routers import user, course, task, exam, grade, calendar.css

# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="EduPilot Student Academic Planner API",
    version="1.0.0",
    lifespan=lifespan,                                    # modern startup/shutdown
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url=None,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allows the browser to call the API.
# In production, replace "*" with your actual frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else [settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files — serve the entire frontend folder ───────────────────────────
# Path: backend is at  edupilot/backend/
#       frontend is at edupilot/frontend/
# So we go one level up from backend/ to reach frontend/
FRONTEND_DIR = Path(__file__).parent.parent.parent / "frontend"

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static",
)

# ── Root route — serves the homepage ─────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def serve_homepage():
    """Redirect / to the homepage HTML file."""
    return FileResponse(FRONTEND_DIR / "pages" / "index.html")

# ── Catch-all for frontend page routes ───────────────────────────────────────
@app.get("/{page_name}.html", include_in_schema=False)
async def serve_page(page_name: str):
    """
    Serve any frontend HTML page by name.
    e.g. http://localhost:8000/courses.html
         → serves frontend/pages/courses.html
    """
    page_path = FRONTEND_DIR / "pages" / f"{page_name}.html"
    if page_path.exists():
        return FileResponse(page_path)
    # Fall back to homepage if page not found
    return FileResponse(FRONTEND_DIR / "pages" / "index.html")

# ── API Routers ───────────────────────────────────────────────────────────────
# All API endpoints live under /api/ to avoid clashing with frontend routes.
# Uncomment each router as you build it out:
# app.include_router(user.router,     prefix="/api/users",    tags=["Users"])
# app.include_router(course.router,   prefix="/api/courses",  tags=["Courses"])
# app.include_router(task.router,     prefix="/api/tasks",    tags=["Tasks"])
# app.include_router(exam.router,     prefix="/api/exams",    tags=["Exams"])
# app.include_router(grade.router,    prefix="/api/grades",   tags=["Grades"])
# app.include_router(calendar.css.router, prefix="/api/calendar.css", tags=["Calendar"])



# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}