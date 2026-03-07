# EduPilot 🎓

A student academic planner — manage courses, tasks, exams, grades, and your academic calendar in one place.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Vanilla HTML, CSS, JavaScript     |
| Backend   | Python + FastAPI                  |
| Database  | SQLite (dev) → PostgreSQL (prod)  |
| Auth      | JWT (access + refresh tokens)     |

---

## Project Structure

```
edupilot/
├── frontend/
│   ├── pages/              # One HTML file per page/view
│   │   ├── index.html      # Dashboard / Homepage
│   │   ├── courses.html    # Courses + Classes + Academic Years
│   │   ├── calendar.html   # Weekly calendar view
│   │   ├── tasks.html      # Tasks manager
│   │   ├── exams.html      # Exams tracker
│   │   ├── grades.html     # Grades overview
│   │   ├── account.html    # Account settings
│   │   └── friends.html    # Social / Friend-of-Friends
│   ├── css/
│   │   ├── variables.css   # Design tokens (colors, spacing, fonts)
│   │   ├── main.css        # Global base styles
│   │   ├── components.css  # Reusable UI components
│   │   ├── animations.css  # Transitions and keyframes
│   │   └── responsive.css  # Breakpoints / mobile layout
│   ├── js/
│   │   ├── app.js          # App entry point, init logic
│   │   ├── router.js       # Client-side page routing (SPA-lite)
│   │   ├── api/            # One file per backend resource (fetch wrappers)
│   │   ├── components/     # Reusable JS UI components (navbar, modal, etc.)
│   │   └── utils/          # Date helpers, storage, notifications, etc.
│   └── assets/
│       ├── icons/
│       └── fonts/
│
└── backend/
    ├── app/
    │   ├── main.py         # FastAPI app entry, router registration, CORS
    │   ├── database.py     # SQLAlchemy engine + session
    │   ├── core/
    │   │   ├── config.py   # Settings from .env (pydantic-settings)
    │   │   ├── security.py # JWT creation/verification, password hashing
    │   │   └── dependencies.py  # get_db, get_current_user
    │   ├── models/         # SQLAlchemy ORM table definitions
    │   ├── schemas/        # Pydantic request/response schemas
    │   ├── routers/        # FastAPI route handlers (thin controllers)
    │   └── services/       # Business logic layer (called by routers)
    ├── tests/
    ├── requirements.txt
    └── .env.example
```

---

## Separation of Concerns

### Frontend
- **HTML pages** → structure only, no inline styles or logic
- **CSS files** → presentation only, driven by variables
- **JS api/** → ONLY talks to the backend (fetch calls, token handling)
- **JS components/** → reusable UI pieces (navbar renders itself, modal opens/closes)
- **JS utils/** → pure helper functions, no DOM side effects

### Backend
- **routers/** → HTTP only: parse request, call service, return response
- **services/** → all business logic lives here, no HTTP awareness
- **models/** → database schema only
- **schemas/** → validation and serialization only
- **core/** → shared infrastructure (auth, config, db session)

---

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend
```bash
# Just open in browser or use a local server:
cd frontend
python -m http.server 5500
# Visit http://localhost:5500/pages/index.html
```

---

## Pages & Features

| Page       | Key Features                                                  |
|------------|---------------------------------------------------------------|
| Dashboard  | Today's classes, tasks, exams · Overview stats · Holidays     |
| Courses    | Add/manage courses, classes, academic years                   |
| Calendar   | Weekly view with classes, tasks, exams overlaid               |
| Tasks      | Create tasks, link to courses, mark complete                  |
| Exams      | Upcoming exams, countdown, past results                       |
| Grades     | Grade tracker per course per term                             |
| Account    | Profile, school info, password, profile picture               |
| Friends    | Follow/unfollow, friend-of-friends discovery                  |