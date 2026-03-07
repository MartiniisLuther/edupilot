# EduPilot — Getting Started

## How it works

FastAPI serves **everything** — the frontend HTML/CSS/JS as static files,
and the backend API under `/api/`. One server, no separate dev server needed.

```
http://localhost:8000/              → frontend/pages/index.html
http://localhost:8000/courses.html → frontend/pages/courses.html
http://localhost:8000/static/css/  → frontend/css/
http://localhost:8000/static/js/   → frontend/js/
http://localhost:8000/api/health   → FastAPI health check
http://localhost:8000/api/docs     → API docs (debug mode only)
```

## First-time setup

### 1. Create and activate a virtual environment
```bash
cd edupilot/backend
python -m venv venv

# Mac/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Edit .env if you want to change any defaults
```

### 4. Run the server
```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Open the app
```
http://localhost:8000
```

---

## PyCharm setup (recommended)

1. Open the `edupilot/` folder in PyCharm
2. Go to **Settings → Project → Python Interpreter**
3. Add the virtual environment you created above
4. Create a **Run Configuration**:
   - Type: `Uvicorn`  (or use "Shell Script")
   - Script: `uvicorn`
   - Parameters: `app.main:app --reload --port 8000`
   - Working directory: `edupilot/backend`
5. Click Run ▶

---

## File path convention

All frontend files reference assets with `/static/` prefix:

```html
<!-- CSS -->
<link rel="stylesheet" href="/static/css/variables.css">
<link rel="stylesheet" href="/static/css/main.css">
<link rel="stylesheet" href="/static/css/index.css">

<!-- JS -->
<script src="/static/js/index.js"></script>
```

FastAPI maps `/static/` → `frontend/` directory.

**Never use relative paths like `../css/` in HTML pages.**
Always use `/static/css/` so paths work from any route.

---

## CSS load order (important!)

Every page must load CSS in this order:

```html
<link rel="stylesheet" href="/static/css/variables.css">  <!-- 1st: tokens -->
<link rel="stylesheet" href="/static/css/main.css">        <!-- 2nd: base -->
<link rel="stylesheet" href="/static/css/[page].css">      <!-- 3rd: page -->
```

`variables.css` must come first because `main.css` and all page CSS files
use the `--color-*`, `--font-*` etc. variables defined there.